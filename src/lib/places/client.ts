import "server-only";
import type { PlaceData, PlaceSearchResult } from "@/types/store";

const PLACES_API_BASE = "https://places.googleapis.com/v1";

// place_cache に保存するPlaceDataの「形」が変わるたび（=DETAILS_FIELD_MASKに
// フィールドを追加/削除するたび）にインクリメントする。cache.ts側でこの値と
// 保存済みキャッシュの schema_version を比較し、不一致なら期限切れ扱いにする。
// これにより、FieldMaskを変更しても古いキャッシュが最大30日間そのまま
// 返り続ける問題を防げる（typesフィールド追加時に実際に発生した不具合の対策）
export const PLACE_SCHEMA_VERSION = 2;

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "regularOpeningHours",
  "nationalPhoneNumber",
  "photos",
  "rating",
  "userRatingCount",
  "websiteUri",
  "googleMapsUri",
  "types",      // AIタグ推定の入力に使うGoogleカテゴリ情報
  "priceLevel", // AIタグ推定の価格帯はこの実データを優先し、AIには推定させない
].join(",");

const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.photos",
  "places.rating",
  "places.userRatingCount",
].join(",");

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return key;
}

// Places API (New) レスポンスのうち、FieldMaskで絞って使う分だけの型
type RawPlace = {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  nationalPhoneNumber?: string;
  photos?: { name: string; widthPx?: number; heightPx?: number }[];
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  types?: string[];
  priceLevel?: string; // Places API (New) のenum文字列（例: "PRICE_LEVEL_MODERATE"）
};

function toPlacePhotos(photos: RawPlace["photos"]) {
  return (photos ?? []).map((p) => ({
    name: p.name,
    widthPx: p.widthPx,
    heightPx: p.heightPx,
  }));
}

function toPlaceData(raw: RawPlace): PlaceData {
  return {
    placeId: raw.id,
    name: raw.displayName?.text ?? "",
    formattedAddress: raw.formattedAddress ?? "",
    location: {
      lat: raw.location?.latitude ?? 0,
      lng: raw.location?.longitude ?? 0,
    },
    openingHours: raw.regularOpeningHours
      ? {
          weekdayDescriptions: raw.regularOpeningHours.weekdayDescriptions ?? [],
          openNow: raw.regularOpeningHours.openNow ?? false,
        }
      : undefined,
    nationalPhoneNumber: raw.nationalPhoneNumber,
    photos: toPlacePhotos(raw.photos),
    rating: raw.rating,
    userRatingCount: raw.userRatingCount,
    websiteUri: raw.websiteUri,
    googleMapsUri: raw.googleMapsUri,
    types: raw.types,
    priceLevel: raw.priceLevel,
  };
}

// GET /places/{placeId}。失敗時は例外を投げず null を返す
export async function fetchPlaceDetails(placeId: string): Promise<PlaceData | null> {
  try {
    const url = `${PLACES_API_BASE}/places/${encodeURIComponent(placeId)}?languageCode=ja&regionCode=JP`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": getApiKey(),
        "X-Goog-FieldMask": DETAILS_FIELD_MASK,
      },
    });

    if (!res.ok) {
      console.error(`Places API details error: ${res.status} ${await res.text()}`);
      return null;
    }

    const raw = (await res.json()) as RawPlace;
    return toPlaceData(raw);
  } catch (err) {
    console.error("Places API details fetch failed:", err);
    return null;
  }
}

export type PlaceSearchOptions = {
  // 検索結果を特定エリア周辺に寄せるための円形バイアス
  locationBias?: { lat: number; lng: number; radiusMeters: number };
  maxResultCount?: number;
};

// POST /places:searchText。Phase Dの管理画面で使用。失敗時は空配列を返す
export async function searchPlacesByText(
  query: string,
  options: PlaceSearchOptions = {}
): Promise<PlaceSearchResult[]> {
  try {
    const body: Record<string, unknown> = {
      textQuery: query,
      languageCode: "ja",
      regionCode: "JP",
      maxResultCount: options.maxResultCount ?? 20,
    };

    if (options.locationBias) {
      body.locationBias = {
        circle: {
          center: {
            latitude: options.locationBias.lat,
            longitude: options.locationBias.lng,
          },
          radius: options.locationBias.radiusMeters,
        },
      };
    }

    const res = await fetch(`${PLACES_API_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": getApiKey(),
        "X-Goog-FieldMask": SEARCH_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`Places API searchText error: ${res.status} ${await res.text()}`);
      return [];
    }

    const data = (await res.json()) as { places?: RawPlace[] };
    return (data.places ?? []).map((raw) => ({
      placeId: raw.id,
      name: raw.displayName?.text ?? "",
      formattedAddress: raw.formattedAddress ?? "",
      location: {
        lat: raw.location?.latitude ?? 0,
        lng: raw.location?.longitude ?? 0,
      },
      photos: toPlacePhotos(raw.photos),
      rating: raw.rating,
      userRatingCount: raw.userRatingCount,
    }));
  } catch (err) {
    console.error("Places API searchText fetch failed:", err);
    return [];
  }
}
