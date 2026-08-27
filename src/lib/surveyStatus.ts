// 現地調査ステータス（stores.survey_status）の表示定義。
// /admin（一覧のバッジ・フィルター）と /admin/survey（現地調査UI）の両方で使う

export type SurveyStatus = "not_started" | "planned" | "visited" | "excluded";

export const SURVEY_STATUSES: SurveyStatus[] = [
  "not_started",
  "planned",
  "visited",
  "excluded",
];

export const SURVEY_STATUS_LABEL: Record<SurveyStatus, string> = {
  not_started: "未着手",
  planned: "訪問予定",
  visited: "訪問済み",
  excluded: "対象外",
};

export const SURVEY_STATUS_BADGE_CLASS: Record<SurveyStatus, string> = {
  not_started: "bg-gray-100 text-gray-500",
  planned: "bg-amber-100 text-amber-700",
  visited: "bg-green-100 text-green-700",
  excluded: "bg-gray-300 text-gray-600",
};
