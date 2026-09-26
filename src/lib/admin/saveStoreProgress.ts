import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PriceRange } from "@/types/store";
import type { SurveyStatus } from "@/lib/surveyStatus";

// タグ編集画面（/admin/stores/[id]）と現地調査画面（/admin/survey）の
// 保存処理を一本化した共通関数。両画面の「delete→insertで全タグ入れ替え」
// 「survey_statusの更新」「公開可否の判定」をここに集約し、二重実装と
// それぞれが個別に同じ不具合を抱えるのを防ぐ

export type SaveStoreProgressAction =
  | "visited" // 現地調査「保存して次へ／保存して移動」
  | "excluded" // 現地調査「対象外にする」
  | "edit"; // タグ編集画面での保存（not_started/planned→visited、excluded/visitedは維持）

export type SaveStoreProgressInput = {
  storeId: string;
  // この呼び出し元が編集を担当するタグ種別。delete/insertの範囲になる。
  // 例: 現地調査画面は ["style","vibe","gender","age_group"]（商品カテゴリには触れない）、
  //     タグ編集画面は上記+["category"]
  managedTagTypes: string[];
  // 上記種別に属する、保存後に持たせたいtag_idの集合。
  // 他種別のIDや重複が混ざっていてもここで除去・絞り込みする
  tagIds: number[];
  priceRange: PriceRange | null;
  operatorReview: string;
  // 未指定（undefined）なら nearest_station は更新しない
  nearestStation?: string | null;
  action: SaveStoreProgressAction;
};

export type SaveStoreProgressResult =
  | { ok: true; surveyStatus: SurveyStatus; published: boolean }
  | { ok: false; message: string };

export async function saveStoreProgress(
  input: SaveStoreProgressInput
): Promise<SaveStoreProgressResult> {
  try {
    const supabase = createAdminClient();

    const { data: currentRow, error: currentError } = await supabase
      .from("stores")
      .select("survey_status")
      .eq("id", input.storeId)
      .eq("is_real_store", true)
      .maybeSingle();
    if (currentError) return { ok: false, message: currentError.message };
    if (!currentRow) return { ok: false, message: "店舗が見つかりません" };

    let nextSurveyStatus: SurveyStatus;
    if (input.action === "visited") {
      nextSurveyStatus = "visited";
    } else if (input.action === "excluded") {
      nextSurveyStatus = "excluded";
    } else {
      // "edit": 対象外は維持、それ以外（未着手／訪問予定／訪問済み）はvisitedにする
      nextSurveyStatus =
        (currentRow.survey_status as SurveyStatus) === "excluded" ? "excluded" : "visited";
    }

    // 公開条件: 系統タグが1つ以上・価格帯が設定済み・対象外ではない
    const { data: styleTagRows, error: styleFetchError } = await supabase
      .from("tag_masters")
      .select("id")
      .eq("type", "style");
    if (styleFetchError) return { ok: false, message: styleFetchError.message };
    const styleTagIdSet = new Set((styleTagRows ?? []).map((t) => t.id));
    const hasStyleTag = input.tagIds.some((id) => styleTagIdSet.has(id));
    const eligibleToPublish =
      nextSurveyStatus !== "excluded" && hasStyleTag && input.priceRange !== null;

    const updatePayload: Record<string, unknown> = {
      price_range: input.priceRange,
      operator_review: input.operatorReview.trim() || null,
      operator_review_updated_at: input.operatorReview.trim() ? new Date().toISOString() : null,
      survey_status: nextSurveyStatus,
    };
    if (input.nearestStation !== undefined) {
      updatePayload.nearest_station = input.nearestStation;
    }
    // 条件を満たさない場合は is_published を変更しない（手動公開・非公開の状態を尊重する）
    if (nextSurveyStatus === "excluded") {
      updatePayload.is_published = false;
    } else if (eligibleToPublish) {
      updatePayload.is_published = true;
    }

    const { error: updateError } = await supabase
      .from("stores")
      .update(updatePayload)
      .eq("id", input.storeId)
      .eq("is_real_store", true);
    if (updateError) return { ok: false, message: updateError.message };

    // 削除・挿入とも「この呼び出し元が管轄するタグ種別」のtag_idに範囲を揃える。
    // 例えば現地調査画面から保存した際に商品カテゴリタグ等、管轄外のタグには
    // 一切触れない（is_active=falseの非表示化タグが既に付いている場合の
    // ズレによる重複挿入も、ここで管轄範囲に絞り込むことで吸収する）
    const { data: managedTagRows, error: tagFetchError } = await supabase
      .from("tag_masters")
      .select("id")
      .in("type", input.managedTagTypes);
    if (tagFetchError) return { ok: false, message: tagFetchError.message };
    const managedTagIds = (managedTagRows ?? []).map((t) => t.id);

    const { error: deleteError } = await supabase
      .from("store_tags")
      .delete()
      .eq("store_id", input.storeId)
      .in("tag_id", managedTagIds);
    if (deleteError) return { ok: false, message: deleteError.message };

    const managedTagIdSet = new Set(managedTagIds);
    const tagIdsToInsert = Array.from(new Set(input.tagIds)).filter((id) =>
      managedTagIdSet.has(id)
    );

    if (tagIdsToInsert.length > 0) {
      // 万一の二重送信（連続タップ等）でも一意制約違反で落ちないよう upsert にする
      const { error: insertError } = await supabase.from("store_tags").upsert(
        tagIdsToInsert.map((tagId) => ({ store_id: input.storeId, tag_id: tagId })),
        { onConflict: "store_id,tag_id", ignoreDuplicates: true }
      );
      if (insertError) return { ok: false, message: insertError.message };
    }

    return {
      ok: true,
      surveyStatus: nextSurveyStatus,
      published: nextSurveyStatus !== "excluded" && eligibleToPublish,
    };
  } catch (err) {
    // 本番でも画面にエラー内容が出るよう、投げずに結果として返す
    return { ok: false, message: err instanceof Error ? err.message : "保存に失敗しました" };
  }
}

export type SetSurveyStatusResult =
  | { ok: true; surveyStatus: SurveyStatus; published: boolean }
  | { ok: false; message: string };

// タグ・価格帯には触れず、survey_statusだけを手動で切り替える
// （管理画面の店舗一覧・現地調査画面のステータス選択セレクトから呼ぶ）。
// 「訪問済み」以外に変更する時は、未確認の店を地図に出さないため常に非公開にする。
// 「訪問済み」に変更する時は、既存のタグ・価格帯が公開条件（系統タグ1件以上・
// 価格帯設定済み）を満たしていれば公開する。満たさなければ変更しない
export async function setSurveyStatus(
  storeId: string,
  status: SurveyStatus
): Promise<SetSurveyStatusResult> {
  try {
    const supabase = createAdminClient();

    const updatePayload: Record<string, unknown> = { survey_status: status };

    if (status !== "visited") {
      updatePayload.is_published = false;
    } else {
      const { data: storeRow, error: storeError } = await supabase
        .from("stores")
        .select("price_range")
        .eq("id", storeId)
        .eq("is_real_store", true)
        .maybeSingle();
      if (storeError) return { ok: false, message: storeError.message };
      if (!storeRow) return { ok: false, message: "店舗が見つかりません" };

      const { data: styleTagRows, error: styleFetchError } = await supabase
        .from("tag_masters")
        .select("id")
        .eq("type", "style");
      if (styleFetchError) return { ok: false, message: styleFetchError.message };
      const styleTagIdSet = new Set((styleTagRows ?? []).map((t) => t.id));

      const { data: storeTagRows, error: storeTagsError } = await supabase
        .from("store_tags")
        .select("tag_id")
        .eq("store_id", storeId);
      if (storeTagsError) return { ok: false, message: storeTagsError.message };
      const hasStyleTag = (storeTagRows ?? []).some((t) => styleTagIdSet.has(t.tag_id));

      if (hasStyleTag && storeRow.price_range !== null) {
        updatePayload.is_published = true;
      }
      // 条件を満たさない場合は is_published を変更しない（非公開のまま）
    }

    const { error: updateError } = await supabase
      .from("stores")
      .update(updatePayload)
      .eq("id", storeId)
      .eq("is_real_store", true);
    if (updateError) return { ok: false, message: updateError.message };

    return {
      ok: true,
      surveyStatus: status,
      published: updatePayload.is_published === true,
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "保存に失敗しました" };
  }
}
