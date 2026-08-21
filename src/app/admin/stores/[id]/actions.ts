"use server";

import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaceWithCache } from "@/lib/places/cache";
import { inferStoreTags, type TagInferenceResult } from "@/lib/claude/inferTags";

export async function saveStoreTags(storeId: string, formData: FormData) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const tagIds = formData
    .getAll("tag")
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  const priceRangeRaw = formData.get("priceRange");
  const priceRange = priceRangeRaw ? Number(priceRangeRaw) : null;
  const nearestStation =
    (formData.get("nearestStation") as string | null)?.trim() || null;
  const operatorReview =
    (formData.get("operatorReview") as string | null)?.trim() || null;
  const isPublished = formData.get("isPublished") === "true";

  const supabase = createAdminClient();

  await supabase
    .from("stores")
    .update({
      price_range: priceRange,
      nearest_station: nearestStation,
      operator_review: operatorReview,
      operator_review_updated_at: operatorReview ? new Date().toISOString() : null,
      is_published: isPublished,
    })
    .eq("id", storeId);

  await supabase.from("store_tags").delete().eq("store_id", storeId);
  if (tagIds.length > 0) {
    await supabase
      .from("store_tags")
      .insert(tagIds.map((tagId) => ({ store_id: storeId, tag_id: tagId })));
  }

  redirect("/admin");
}

// 「AIでタグを推定」ボタンから呼ばれる。Places情報（店名・住所・カテゴリ）のみを
// Claudeに渡し、Googleレビュー本文は使わない。結果はフォームへの初期値提案であり、
// ここでは何もDBに書き込まない（保存は必ず人間が確認して saveStoreTags を呼ぶ）。
// 失敗時は例外を投げず null を返す
export async function inferStoreTagsAction(
  storeId: string
): Promise<TagInferenceResult | null> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  const { data: store } = await supabase
    .from("stores")
    .select("google_place_id, is_real_store")
    .eq("id", storeId)
    .maybeSingle();

  if (!store || !store.is_real_store || !store.google_place_id) return null;

  const place = await getPlaceWithCache(store.google_place_id);
  if (!place) return null;

  return inferStoreTags({
    name: place.name,
    address: place.formattedAddress,
    placeTypes: place.types ?? [],
    priceLevel: place.priceLevel,
  });
}
