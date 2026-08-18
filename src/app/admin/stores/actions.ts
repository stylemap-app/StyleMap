"use server";

import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchPlacesByText } from "@/lib/places/client";
import { getPlacePhotoUrl } from "@/lib/places/photo";
import { AREA_ID_MAP, getArea } from "@/lib/areas";

export type AdminSearchResult = {
  placeId: string;
  name: string;
  formattedAddress: string;
  photoUrl?: string;
  rating?: number;
  userRatingCount?: number;
  alreadyRegistered: boolean;
};

export async function searchStores(
  query: string,
  areaSlug: string
): Promise<AdminSearchResult[]> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");
  if (!query.trim()) return [];

  const area = getArea(areaSlug);
  const results = await searchPlacesByText(query, {
    locationBias: area
      ? { lat: area.lat, lng: area.lng, radiusMeters: 1500 }
      : undefined,
  });

  if (results.length === 0) return [];

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("stores")
    .select("google_place_id")
    .in(
      "google_place_id",
      results.map((r) => r.placeId)
    );
  const registeredIds = new Set(
    (existing ?? []).map((r) => r.google_place_id as string)
  );

  return results.map((r) => ({
    placeId: r.placeId,
    name: r.name,
    formattedAddress: r.formattedAddress,
    photoUrl: r.photos[0] ? getPlacePhotoUrl(r.photos[0].name, 200) : undefined,
    rating: r.rating,
    userRatingCount: r.userRatingCount,
    alreadyRegistered: registeredIds.has(r.placeId),
  }));
}

// google_place_id と StyleMap独自データ（area_id等）のみを保存する。
// 店名・住所・座標はGoogle利用規約により保存しない（表示時にPlaces APIから都度取得）
export async function registerStore(placeId: string, areaSlug: string) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const areaId = AREA_ID_MAP[areaSlug] ?? null;
  const supabase = createAdminClient();

  const { error } = await supabase.from("stores").insert({
    google_place_id: placeId,
    is_real_store: true,
    is_published: false,
    area_id: areaId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
