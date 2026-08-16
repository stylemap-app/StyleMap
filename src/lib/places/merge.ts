import "server-only";
import type { Store, PlaceData, PlaceOpeningHours } from "@/types/store";
import { getPlaceWithCache, getPlacesWithCache } from "./cache";

// 月曜始まり。Places API (New) の regularOpeningHours.weekdayDescriptions と
// 曜日の並びを一致させるため（Googleは月曜始まり、StoreHours.regularは日曜始まり）
const WEEKDAY_JA_MON_FIRST = ["月", "火", "水", "木", "金", "土", "日"] as const;

// StyleMap独自の StoreHours（日曜始まり）を PlaceOpeningHours 形式
// （Google風のテキスト表現・月曜始まり）に変換する
function storeHoursToPlaceOpeningHours(store: Store): PlaceOpeningHours {
  const regular = store.hours?.regular;
  if (!regular || regular.length !== 7) {
    return { weekdayDescriptions: [], openNow: false };
  }

  // regular[0]=日曜 なので、月曜始まりの並びに入れ替える
  const weekdayDescriptions = WEEKDAY_JA_MON_FIRST.map((label, monIndex) => {
    const sundayFirstIndex = (monIndex + 1) % 7;
    const day = regular[sundayFirstIndex];
    if (!day.open || !day.close) return `${label}曜日: 定休日`;
    return `${label}曜日: ${day.open}〜${day.close}`;
  });

  // JST基準で「現在営業中か」を判定
  const jstNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  const today = regular[jstNow.getDay()];
  let openNow = false;
  if (today.open && today.close) {
    const [openH, openM] = today.open.split(":").map(Number);
    const [closeH, closeM] = today.close.split(":").map(Number);
    const nowMinutes = jstNow.getHours() * 60 + jstNow.getMinutes();
    openNow =
      nowMinutes >= openH * 60 + openM && nowMinutes < closeH * 60 + closeM;
  }

  return { weekdayDescriptions, openNow };
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
