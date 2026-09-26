"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { saveStoreProgress, type SaveStoreProgressResult } from "@/lib/admin/saveStoreProgress";
import type { PriceRange } from "@/types/store";

export type SaveSurveyResultInput = {
  storeId: string;
  // 系統・雰囲気・客層タグに加え、このUIでは編集しない商品カテゴリタグ等の
  // 既存IDが含まれていても構わない（共通関数側でこのUIの管轄タグ種別だけに
  // 絞り込むため、それ以外のIDは無視される。商品カテゴリ等は一切削除しない）
  tagIds: number[];
  priceRange: PriceRange | null;
  operatorReview: string;
  surveyStatus: "visited" | "excluded";
};

export type SaveSurveyResultResult = SaveStoreProgressResult;

// このUIが編集を担当するタグ種別。商品カテゴリ等、他画面（/admin/stores/[id]）で
// 付けたタグには一切触れない
const MANAGED_TAG_TYPES = ["style", "vibe", "gender", "age_group"];

// 現地調査画面（/admin/survey）の「保存して次へ」「対象外にする」から呼ばれる。
// タグは現地訪問した人間が独自に判断して付けたものであり、
// Google Maps Contentから派生した情報ではない
export async function saveSurveyResult(
  input: SaveSurveyResultInput
): Promise<SaveSurveyResultResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, message: "Forbidden" };

  const result = await saveStoreProgress({
    storeId: input.storeId,
    managedTagTypes: MANAGED_TAG_TYPES,
    tagIds: input.tagIds,
    priceRange: input.priceRange,
    operatorReview: input.operatorReview,
    action: input.surveyStatus,
  });

  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath(`/admin/stores/${input.storeId}`);
    revalidatePath("/admin/survey");
  }
  return result;
}
