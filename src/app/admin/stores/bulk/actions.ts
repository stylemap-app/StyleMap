"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchPlacesByText } from "@/lib/places/client";
import { getPlacePhotoUrl } from "@/lib/places/photo";
import { AREA_ID_MAP, getArea } from "@/lib/areas";

export type BulkSearchResult = {
  placeId: string;
  name: string;
  formattedAddress: string;
  photoUrl?: string;
  rating?: number;
  userRatingCount?: number;
  // ヒットした検索キーワード（複数ヒット時は複数件）。
  // 登録時に stores.search_keyword としてカンマ区切りで保存する
  matchedKeywords: string[];
};

export type BulkSearchResponse = {
  results: BulkSearchResult[];
  apiCallCount: number; // 実行した Text Search リクエスト数（= キーワード数）
  skippedAlreadyRegistered: number;
};

// 改行区切りのキーワードをそれぞれ Text Search（最大20件/リクエスト）にかけ、
// 結果を place_id で統合・重複除去し、既に stores に登録済みのものを除外して返す
export async function bulkSearchStores(
  keywordsRaw: string,
  areaSlug: string
): Promise<BulkSearchResponse> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const keywords = Array.from(
    new Set(
      keywordsRaw
        .split("\n")
        .map((k) => k.trim())
        .filter(Boolean)
    )
  );
  if (keywords.length === 0) {
    return { results: [], apiCallCount: 0, skippedAlreadyRegistered: 0 };
  }

  const area = getArea(areaSlug);
  const locationBias = area
    ? { lat: area.lat, lng: area.lng, radiusMeters: 1500 }
    : undefined;

  const resultsByKeyword = await Promise.all(
    keywords.map((keyword) =>
      searchPlacesByText(keyword, { locationBias }).then((places) => ({ keyword, places }))
    )
  );

  // 同じ店舗が複数キーワードでヒットする場合があるため place_id で統合。
  // どのキーワードでヒットしたかも記録し、登録時にAI推定の補助情報として保存する
  const merged = new Map<string, BulkSearchResult>();
  for (const { keyword, places } of resultsByKeyword) {
    for (const p of places) {
      const existing = merged.get(p.placeId);
      if (existing) {
        if (!existing.matchedKeywords.includes(keyword)) {
          existing.matchedKeywords.push(keyword);
        }
        continue;
      }
      merged.set(p.placeId, {
        placeId: p.placeId,
        name: p.name,
        formattedAddress: p.formattedAddress,
        photoUrl: p.photos[0] ? getPlacePhotoUrl(p.photos[0].name, 200) : undefined,
        rating: p.rating,
        userRatingCount: p.userRatingCount,
        matchedKeywords: [keyword],
      });
    }
  }

  // 既に登録済み（google_place_id が stores に存在）のものは除外
  const supabase = createAdminClient();
  const placeIds = Array.from(merged.keys());
  const { data: existing } =
    placeIds.length > 0
      ? await supabase.from("stores").select("google_place_id").in("google_place_id", placeIds)
      : { data: [] as { google_place_id: string | null }[] };
  const registeredIds = new Set((existing ?? []).map((r) => r.google_place_id));

  const results = Array.from(merged.values()).filter((r) => !registeredIds.has(r.placeId));

  return {
    results,
    apiCallCount: keywords.length,
    skippedAlreadyRegistered: merged.size - results.length,
  };
}

export type BulkRegisterItem = {
  placeId: string;
  // 検索キーワード（複数ヒット時はカンマ区切りにして渡す）
  searchKeyword: string | null;
};

// 選択された店舗をまとめて登録する。1件登録（registerStore）と同じく
// google_place_id / is_real_store / is_published=false / area_id / search_keyword
// のみを保存する（店名・住所等はGoogle利用規約により保存しない）
export async function bulkRegisterStores(
  items: BulkRegisterItem[],
  areaSlug: string
): Promise<{ insertedCount: number }> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");
  if (items.length === 0) return { insertedCount: 0 };

  const areaId = AREA_ID_MAP[areaSlug] ?? null;
  const supabase = createAdminClient();

  const rows = items.map(({ placeId, searchKeyword }) => ({
    google_place_id: placeId,
    is_real_store: true,
    is_published: false,
    area_id: areaId,
    search_keyword: searchKeyword,
  }));

  // 検索〜登録の間に別操作で先に登録された分と衝突しても落ちないよう、
  // google_place_id のUNIQUE制約に対して ignoreDuplicates で安全にスキップする
  const { data, error } = await supabase
    .from("stores")
    .upsert(rows, { onConflict: "google_place_id", ignoreDuplicates: true })
    .select("id");

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { insertedCount: data?.length ?? 0 };
}
