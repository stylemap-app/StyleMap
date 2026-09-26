"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PriceRange } from "@/types/store";

export type SaveSurveyResultInput = {
  storeId: string;
  // 系統・雰囲気・客層タグに加え、このUIでは編集しない商品カテゴリタグ等の
  // 既存IDが含まれていても構わない（サーバー側でこのUIの管轄タグ種別だけに
  // 絞り込むため、それ以外のIDは無視される。商品カテゴリ等は一切削除しない）
  tagIds: number[];
  priceRange: PriceRange | null;
  operatorReview: string;
  surveyStatus: "visited" | "excluded";
};

export type SaveSurveyResultResult = { ok: true } | { ok: false; message: string };

// このUIが編集を担当するタグ種別。削除・挿入の範囲は常にこれに揃える。
// 商品カテゴリ等、他画面（/admin/stores/[id]）で付けたタグには一切触れない
const MANAGED_TAG_TYPES = ["style", "vibe", "gender", "age_group"];

// 現地調査画面（/admin/survey）の「保存して次へ」「対象外にする」から呼ばれる。
// タグは現地訪問した人間が独自に判断して付けたものであり、
// Google Maps Contentから派生した情報ではない
export async function saveSurveyResult(
  input: SaveSurveyResultInput
): Promise<SaveSurveyResultResult> {
  try {
    const user = await getAdminUser();
    if (!user) return { ok: false, message: "Forbidden" };

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
    if (updateError) return { ok: false, message: updateError.message };

    // 削除・挿入とも「このUIが管轄するタグ種別のtag_id」に範囲を揃える。
    // is_active=falseで非表示化したタグが既に付いている店舗など、クライアントの
    // allTags（is_active=trueのみ）と実際の管轄範囲がズレるケースがあるため、
    // 対象tag_idは毎回サーバー側で取得して確定させる
    const { data: managedTagRows, error: tagFetchError } = await supabase
      .from("tag_masters")
      .select("id")
      .in("type", MANAGED_TAG_TYPES);
    if (tagFetchError) return { ok: false, message: tagFetchError.message };
    const managedTagIds = (managedTagRows ?? []).map((t) => t.id);

    const { error: deleteError } = await supabase
      .from("store_tags")
      .delete()
      .eq("store_id", input.storeId)
      .in("tag_id", managedTagIds);
    if (deleteError) return { ok: false, message: deleteError.message };

    // クライアントから重複や管轄外のtag_idが紛れ込んでいても落ちないよう、
    // ここで重複除去＋管轄範囲への絞り込みを行ってからinsertする
    const managedTagIdSet = new Set(managedTagIds);
    const tagIdsToInsert = Array.from(new Set(input.tagIds)).filter((id) =>
      managedTagIdSet.has(id)
    );

    if (tagIdsToInsert.length > 0) {
      // 万一の二重送信（連続タップ等）でも一意制約違反にならないよう upsert にする
      const { error: insertError } = await supabase.from("store_tags").upsert(
        tagIdsToInsert.map((tagId) => ({ store_id: input.storeId, tag_id: tagId })),
        { onConflict: "store_id,tag_id", ignoreDuplicates: true }
      );
      if (insertError) return { ok: false, message: insertError.message };
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/stores/${input.storeId}`);
    return { ok: true };
  } catch (err) {
    // 本番でも画面にエラー内容が出るよう、投げずに結果として返す
    return { ok: false, message: err instanceof Error ? err.message : "保存に失敗しました" };
  }
}
