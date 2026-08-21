"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaceWithCache } from "@/lib/places/cache";
import { inferStoreTags } from "@/lib/claude/inferTags";

export type BatchAiResult = {
  success: boolean;
  error?: string;
  appliedStyleTags?: string[]; // label_ja（表示用）
  appliedCategoryTags?: string[];
};

// 一覧画面（/admin/batch-ai）から1件ずつ順次呼ばれる。
// 個別編集画面のAI推定（inferStoreTagsAction）と違い、ここでは結果を
// そのままDBへ保存してよい設計だが、対象は「系統タグが未設定の実店舗」に
// 限定されているため、人間が既に付けた系統・商品カテゴリタグを
// 誤って上書きする心配はない。雰囲気タグ・客層タグ・公開状態には一切触れない
export async function runBatchAiForStore(storeId: string): Promise<BatchAiResult> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();

  const { data: store } = await supabase
    .from("stores")
    .select("google_place_id, is_real_store")
    .eq("id", storeId)
    .eq("is_real_store", true) // 実店舗のみ対象という安全ガード
    .maybeSingle();

  if (!store || !store.google_place_id) {
    return { success: false, error: "店舗が見つからないか実店舗ではありません" };
  }

  const place = await getPlaceWithCache(store.google_place_id);
  if (!place) {
    return { success: false, error: "Places情報が取得できませんでした" };
  }

  const result = await inferStoreTags({
    name: place.name,
    address: place.formattedAddress,
    placeTypes: place.types ?? [],
    priceLevel: place.priceLevel,
  });

  if (!result) {
    return { success: false, error: "AI推定に失敗しました" };
  }

  // 系統・商品カテゴリのslugをtag_idに変換（存在確認込み。inferStoreTags側でも
  // 実在slugへのフィルタは済んでいるが、tag_idを引く都合でここでも突き合わせる）
  const wantedSlugs = [...result.style_tags, ...result.category_tags];
  const { data: tagRows } = wantedSlugs.length
    ? await supabase.from("tag_masters").select("id, slug, label_ja").in("slug", wantedSlugs)
    : { data: [] as { id: number; slug: string; label_ja: string }[] };
  const slugToTag = new Map((tagRows ?? []).map((t) => [t.slug, t]));

  const newStyleTagIds = result.style_tags
    .map((slug) => slugToTag.get(slug)?.id)
    .filter((id): id is number => id !== undefined);
  const newCategoryTagIds = result.category_tags
    .map((slug) => slugToTag.get(slug)?.id)
    .filter((id): id is number => id !== undefined);

  // 既存タグのうち「系統・商品カテゴリ」種別のIDだけを置き換え対象にする。
  // 雰囲気タグ・客層タグなど他種別のタグは一切削除・変更しない
  const { data: styleAndCategoryTagMasters } = await supabase
    .from("tag_masters")
    .select("id")
    .in("type", ["style", "category"]);
  const styleCategoryIds = new Set((styleAndCategoryTagMasters ?? []).map((t) => t.id));

  const { data: existingTags } = await supabase
    .from("store_tags")
    .select("tag_id")
    .eq("store_id", storeId);
  const idsToRemove = (existingTags ?? [])
    .map((t) => t.tag_id)
    .filter((id) => styleCategoryIds.has(id));

  if (idsToRemove.length > 0) {
    await supabase.from("store_tags").delete().eq("store_id", storeId).in("tag_id", idsToRemove);
  }

  const idsToInsert = [...newStyleTagIds, ...newCategoryTagIds];
  if (idsToInsert.length > 0) {
    await supabase
      .from("store_tags")
      .insert(idsToInsert.map((tagId) => ({ store_id: storeId, tag_id: tagId })));
  }

  // 価格帯はPlaces実データ（priceLevel）から決まった場合のみ更新する
  if (result.price_range !== null) {
    await supabase
      .from("stores")
      .update({ price_range: result.price_range })
      .eq("id", storeId)
      .eq("is_real_store", true);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/batch-ai");
  revalidatePath(`/admin/stores/${storeId}`);

  return {
    success: true,
    appliedStyleTags: result.style_tags.map((s) => slugToTag.get(s)?.label_ja ?? s),
    appliedCategoryTags: result.category_tags.map((s) => slugToTag.get(s)?.label_ja ?? s),
  };
}
