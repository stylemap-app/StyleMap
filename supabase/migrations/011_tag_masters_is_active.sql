-- ============================================================
-- 011_tag_masters_is_active.sql: 雰囲気タグの選択肢を8種に整理
--   現地調査（/admin/survey）を複数人で分担する際に判定基準が
--   バラつきやすいタグを整理する。is_active=false のタグは
--   新規の選択肢としては出さないが、既存店舗（ダミー店舗含む）に
--   既に付いているタグは削除せずそのまま残す。
-- Supabase SQL Editor で一度だけ実行してください
-- ============================================================

ALTER TABLE tag_masters
  ADD COLUMN is_active boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN tag_masters.is_active IS
  '選択肢として表示するか。falseでも既存店舗への紐付け（store_tags）はそのまま残る';

-- 現地の1回の訪問では判断しづらい、またはStyleMapのターゲットに対して
-- 優先度が低いvibeタグを非表示化（削除はしない）
UPDATE tag_masters
SET is_active = false
WHERE slug IN (
  'large-fitting-room',
  'frequent-sale',
  'single-item',
  'coordinate-display',
  'pet-friendly'
);
