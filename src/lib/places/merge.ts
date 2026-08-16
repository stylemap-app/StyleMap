import "server-only";
import type { Store, StoreWithPlace, PlaceData, PlaceOpeningHours } from "@/types/store";
import { getPlaceWithCache, getPlacesWithCache } from "./cache";

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

// StyleMap独自の StoreHours を PlaceOpeningHours 形式（Google風のテキスト表現）に変換する
function storeHoursToPlaceOpeningHours(store: Store): PlaceOpeningHours {
  const weekdayDescriptions = store.hours.regular.map((day, i) => {
    const label = `${WEEKDAY_JA[i]}曜日`;
    if (!day.open || !day.close) return `${label}: 定休日`;
    return `${label}: ${day.open}〜${day.close}`;
  });

  // JST基準で「現在営業中か」を判定
  const jstNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  const today = store.hours.regular[jstNow.getDay()];
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
// （実際の画像表示をどう統合するかはUIに触るPhase Cで判断する）
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

export async function mergeStoreWithPlace(store: Store): Promise<StoreWithPlace> {
  if (store.is_real_store && store.google_place_id) {
    const place = await getPlaceWithCache(store.google_place_id);
    return { ...store, place };
  }
  return { ...store, place: dummyStoreToPlaceData(store) };
}

export async function mergeStoresWithPlaces(
  stores: Store[]
): Promise<StoreWithPlace[]> {
  const realPlaceIds = stores
    .filter((s): s is Store & { google_place_id: string } =>
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
