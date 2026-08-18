-- ============================================================
-- 007_admin_nullable_store_fields.sql: 実店舗登録に向けた制約緩和
--
-- Phase D（管理画面）で実店舗を登録する際、Google利用規約により
-- 店名・住所・座標・価格帯はDBに保存しない（google_place_idのみ保存し、
-- 表示時にPlaces APIから都度取得する）。
-- しかし既存スキーマはこれらをすべてNOT NULLとしていたため、
-- 実店舗のINSERT時に制約違反になる。ダミー店舗（is_real_store=false）は
-- 引き続きすべての列を埋めて運用するため、既存60件のデータ・挙動には影響しない。
-- Supabase SQL Editor で一度だけ実行してください
-- ============================================================

ALTER TABLE stores
  ALTER COLUMN name             DROP NOT NULL,
  ALTER COLUMN address          DROP NOT NULL,
  ALTER COLUMN nearest_station  DROP NOT NULL,
  ALTER COLUMN lat              DROP NOT NULL,
  ALTER COLUMN lng              DROP NOT NULL,
  ALTER COLUMN price_range      DROP NOT NULL;
