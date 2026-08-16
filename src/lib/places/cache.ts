import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPlaceDetails } from "./client";
import type { PlaceData } from "@/types/store";

const CACHE_DAYS = 30;

// 期限内ならキャッシュを返す。なければ null（API取得はしない）
export async function getCachedPlace(placeId: string): Promise<PlaceData | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("place_cache")
    .select("data, expires_at")
    .eq("place_id", placeId)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at) <= new Date()) return null;

  return data.data as PlaceData;
}

// 30日期限でキャッシュに保存（upsert）
export async function setCachedPlace(placeId: string, data: PlaceData): Promise<void> {
  const supabase = createAdminClient();
  const expiresAt = new Date(
    Date.now() + CACHE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  await supabase.from("place_cache").upsert(
    {
      place_id: placeId,
      data,
      fetched_at: new Date().toISOString(),
      expires_at: expiresAt,
    },
    { onConflict: "place_id" }
  );
}

// キャッシュ優先。なければPlaces APIから取得してキャッシュに保存
export async function getPlaceWithCache(placeId: string): Promise<PlaceData | null> {
  const cached = await getCachedPlace(placeId);
  if (cached) return cached;

  const fresh = await fetchPlaceDetails(placeId);
  if (fresh) await setCachedPlace(placeId, fresh);
  return fresh;
}

// 複数件を効率的に取得。キャッシュ済み分は1クエリで一括取得し、
// キャッシュにないIDだけPlaces APIを呼ぶ
export async function getPlacesWithCache(
  placeIds: string[]
): Promise<Map<string, PlaceData | null>> {
  const result = new Map<string, PlaceData | null>();
  if (placeIds.length === 0) return result;

  const uniqueIds = Array.from(new Set(placeIds));
  const supabase = createAdminClient();
  const { data: cachedRows } = await supabase
    .from("place_cache")
    .select("place_id, data")
    .in("place_id", uniqueIds)
    .gte("expires_at", new Date().toISOString());

  const cachedIds = new Set<string>();
  for (const row of cachedRows ?? []) {
    result.set(row.place_id, row.data as PlaceData);
    cachedIds.add(row.place_id);
  }

  const missingIds = uniqueIds.filter((id) => !cachedIds.has(id));

  await Promise.all(
    missingIds.map(async (id) => {
      const fresh = await fetchPlaceDetails(id);
      result.set(id, fresh);
      if (fresh) await setCachedPlace(id, fresh);
    })
  );

  return result;
}
