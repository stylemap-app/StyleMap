"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { saveStoreProgress, type SaveStoreProgressResult } from "@/lib/admin/saveStoreProgress";
import type { PriceRange } from "@/types/store";

export type SaveStoreTagsInput = {
  tagIds: number[];
  priceRange: PriceRange | null;
  nearestStation: string;
  operatorReview: string;
};

export type SaveStoreTagsResult = SaveStoreProgressResult;

// このUIが編集を担当するタグ種別（現地調査画面の管轄+商品カテゴリ）
const MANAGED_TAG_TYPES = ["style", "category", "vibe", "gender", "age_group"];

// タグ編集画面（/admin/stores/[id]）の「保存」から呼ばれる。
// 保存すると survey_status は「対象外」以外なら「訪問済み」になる
// （このUIでタグを付けた＝実質的に調査が完了したとみなすため）
export async function saveStoreTags(
  storeId: string,
  input: SaveStoreTagsInput
): Promise<SaveStoreTagsResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, message: "Forbidden" };

  const result = await saveStoreProgress({
    storeId,
    managedTagTypes: MANAGED_TAG_TYPES,
    tagIds: input.tagIds,
    priceRange: input.priceRange,
    operatorReview: input.operatorReview,
    nearestStation: input.nearestStation.trim() || null,
    action: "edit",
  });

  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath(`/admin/stores/${storeId}`);
    revalidatePath("/admin/survey");
  }
  return result;
}
