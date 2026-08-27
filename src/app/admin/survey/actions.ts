"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PriceRange } from "@/types/store";

export type SaveSurveyResultInput = {
  storeId: string;
  // 系統・雰囲気・客層タグに加え、このUIでは編集しない商品カテゴリタグ等の
  // 既存IDもそのまま含んだ「保存後に残すタグIDの完全な集合」。
  // store_tags は毎回delete→insertで全置き換えするため、ここで含めない
  // タグは削除されてしまう（商品カテゴリを誤って消さないための設計）
  tagIds: number[];
  priceRange: PriceRange | null;
  operatorReview: string;
  surveyStatus: "visited" | "excluded";
};

// 現地調査画面（/admin/survey）の「保存して次へ」「対象外にする」から呼ばれる。
// タグは現地訪問した人間が独自に判断して付けたものであり、
// Google Maps Contentから派生した情報ではない
export async function saveSurveyResult(input: SaveSurveyResultInput): Promise<void> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();

  const updatePayload: Record<string, unknown> = {
    price_range: input.priceRange,
    operator_review: input.operatorReview.trim() || null,
    operator_review_updated_at: input.operatorReview.trim() ? new Date().toISOString() : null,
    survey_status: input.surveyStatus,
  };
  // 対象外にする場合は掲載されない状態を保証する
  if (input.surveyStatus === "excluded") {
    updatePayload.is_published = false;
  }

  const { error: updateError } = await supabase
    .from("stores")
    .update(updatePayload)
    .eq("id", input.storeId)
    .eq("is_real_store", true);
  if (updateError) throw new Error(updateError.message);

  const { error: deleteError } = await supabase
    .from("store_tags")
    .delete()
    .eq("store_id", input.storeId);
  if (deleteError) throw new Error(deleteError.message);

  if (input.tagIds.length > 0) {
    const { error: insertError } = await supabase
      .from("store_tags")
      .insert(input.tagIds.map((tagId) => ({ store_id: input.storeId, tag_id: tagId })));
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/stores/${input.storeId}`);
}
