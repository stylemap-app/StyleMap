import "server-only";
import type { Store, PlaceData, PlaceOpeningHours, OpeningPeriod } from "@/types/store";
import { getPlaceWithCache, getPlacesWithCache } from "./cache";

// 月曜始まり。Places API (New) の regularOpeningHours.weekdayDescriptions と
// 曜日の並びを一致させるため（Googleは月曜始まり、StoreHours.regularは日曜始まり）
const WEEKDAY_JA_MON_FIRST = ["月", "火", "水", "木", "金", "土", "日"] as const;

// StyleMap独自の StoreHours（日曜始まり）を PlaceOpeningHours 形式
// （Google風のテキスト表現・月曜始まり）に変換する
function storeHoursToPlaceOpeningHours(store: Store): PlaceOpeningHours {
  const regular = store.hours?.regular;
  if (!regular || regular.length !== 7) {
    return { weekdayDescriptions: [], periods: [] };
  }

  // regular[0]=日曜 なので、月曜始まりの並びに入れ替える
  const weekdayDescriptions = WEEKDAY_JA_MON_FIRST.map((label, monIndex) => {
    const sundayFirstIndex = (monIndex + 1) % 7;
    const day = regular[sundayFirstIndex];
    if (!day.open || !day.close) return `${label}曜日: 定休日`;
    return `${label}曜日: ${day.open}〜${day.close}`;
  });

  return { weekdayDescriptions, periods: storeHoursToPeriods(regular) };
}

// StyleMap独自の StoreHours（日曜始まり、index 0=日曜）を、
// 営業中判定用の OpeningPeriod[]（day: 0=日曜〜6=土曜、Google Places準拠）に変換する。
// indexがそのまま 0=日曜〜6=土曜 に対応するため、曜日の入れ替えは不要
function storeHoursToPeriods(regular: NonNullable<Store["hours"]>["regular"]): OpeningPeriod[] {
  const periods: OpeningPeriod[] = [];
  regular.forEach((day, index) => {
    if (!day.open || !day.close) return; // 定休日
    const [openHour, openMinute] = day.open.split(":").map(Number);
    const [closeHour, closeMinute] = day.close.split(":").map(Number);
    // 閉店時刻が開店時刻以前なら、日をまたぐ営業（例: 20:00〜翌2:00）とみなす
    const closesNextDay =
      closeHour < openHour || (closeHour === openHour && closeMinute <= openMinute);
    periods.push({
      open: { day: index, hour: openHour, minute: openMinute },
      close: {
        day: closesNextDay ? (index + 1) % 7 : index,
        hour: closeHour,
        minute: closeMinute,
      },
    });
  });
  return periods;
}

// ダミー店舗のDB値をPlaceData形式に変換する。
// photosは意図的に空配列にする: PlaceData.photos[].name はGoogle Places写真
// リソースのIDで、store.photosの直URLとは形式が別物のため混同できない
function dummyStoreToPlaceData(store: Store): PlaceData {
  return {
    placeId: "",
    name: store.name,
    formattedAddress: store.address,
    location: { lat: store.lat, lng: store.lng },
    openingHours: storeHoursToPlaceOpeningHours(store),
    photos: [],
    websiteUri: store.links?.official_site,
    googleMapsUri: store.links?.google_maps,
  };
}

export async function mergeStoreWithPlace<T extends Store>(
  store: T
): Promise<T & { place: PlaceData | null }> {
  if (store.is_real_store && store.google_place_id) {
    const place = await getPlaceWithCache(store.google_place_id);
    return { ...store, place };
  }
  return { ...store, place: dummyStoreToPlaceData(store) };
}

export async function mergeStoresWithPlaces<T extends Store>(
  stores: T[]
): Promise<(T & { place: PlaceData | null })[]> {
  const realPlaceIds = stores
    .filter((s): s is T & { google_place_id: string } =>
      Boolean(s.is_real_store && s.google_place_id)
    )
    .map((s) => s.google_place_id);

  const placesById = await getPlacesWithCache(realPlaceIds);

  return stores.map((store) => {
    if (store.is_real_store && store.google_place_id) {
      return { ...store, place: placesById.get(store.google_place_id) ?? null };
    }
    return { ...store, place: dummyStoreToPlaceData(store) };
  });
}
