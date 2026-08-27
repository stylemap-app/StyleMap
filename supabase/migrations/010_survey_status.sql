-- ============================================================
-- 010_survey_status.sql: 現地調査ステータスの追加
--   /admin/survey（現地調査用UI）でスマホから更新する想定。
--   タグは必ず現地訪問した人間が独自に判断して付与するため、
--   Google Maps Platform規約上も問題ない運用
--   （自社スタッフが独自に評価した情報をplace_idに紐付けて
--    保存するケース。CLAUDE.md「Google Maps Platform規約に
--    関する重要事項」参照）
-- Supabase SQL Editor で一度だけ実行してください
-- ============================================================

ALTER TABLE stores
  ADD COLUMN survey_status text NOT NULL DEFAULT 'not_started'
    CHECK (survey_status IN ('not_started', 'planned', 'visited', 'excluded'));

COMMENT ON COLUMN stores.survey_status IS
  '現地調査の進捗。not_started=未着手 / planned=訪問予定 / visited=訪問済み / excluded=対象外（見たが載せない判断）';
