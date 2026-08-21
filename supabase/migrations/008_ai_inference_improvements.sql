-- ============================================================
-- 008_ai_inference_improvements.sql
--   AIタグ推定（Phase F-2）で発生した「systemタグが空になる」問題の
--   調査結果を受けた3つの改善：
--   1. place_cache のスキーマバージョン管理
--      （FieldMask変更時に古いキャッシュが返り続ける問題を防ぐ）
--   2. AI判定不能な店舗の可視化（最終推定日時を記録）
--   3. 検索キーワードをAI推定の補助入力にする
-- Supabase SQL Editor で一度だけ実行してください
-- ============================================================

-- ============================================================
-- 1. place_cache にスキーマバージョンを追加
--    既存行はDEFAULTにより schema_version=1 として扱われ、
--    現在のPLACE_SCHEMA_VERSION（2）とは不一致になるため、
--    次回アクセス時に自動的に再取得される
-- ============================================================
ALTER TABLE place_cache
  ADD COLUMN schema_version integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN place_cache.schema_version IS
  'src/lib/places/client.ts の PLACE_SCHEMA_VERSION と比較し、不一致なら期限切れ扱いにする。FieldMaskを変更したらPLACE_SCHEMA_VERSIONをインクリメントするだけで全キャッシュが自動無効化される';

-- ============================================================
-- 2. stores に「AI推定を最後に実行した日時」を追加
--    (ai_last_inferred_at が入っていて、かつ現在も系統/商品カテゴリ
--     タグが0件 = AI判定不能。boolean flagではなくタイムスタンプに
--     することで、人間が後から手動タグ付けした場合に自動的に
--     「判定不能」表示が消える。フラグの消し忘れバグを避けるため)
-- ============================================================
ALTER TABLE stores
  ADD COLUMN ai_last_inferred_at timestamptz;

COMMENT ON COLUMN stores.ai_last_inferred_at IS
  '一括AIタグ推定（/admin/batch-ai）を最後に実行した日時。個別編集画面の「AIでタグを推定」は結果をDBに保存しない設計のため対象外。この日時が入っていて系統/商品カテゴリタグが0件の場合「AI判定不能」として表示する';

-- ============================================================
-- 3. stores に検索キーワードを追加
--    /admin/stores（個別登録）・/admin/stores/bulk（一括登録）で
--    ヒットした検索キーワードを保存し、AI推定の補助入力にする
--    （複数キーワードでヒットした場合はカンマ区切り）
-- ============================================================
ALTER TABLE stores
  ADD COLUMN search_keyword text;

COMMENT ON COLUMN stores.search_keyword IS
  '店舗登録時にヒットしたPlaces Text Searchの検索キーワード（複数ヒット時はカンマ区切り）。AIタグ推定の補助情報として使うのみで、決定的な根拠にはしない';
