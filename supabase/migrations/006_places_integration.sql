-- ============================================================
-- 006_places_integration.sql: Google Places API連携 Phase A
--   「二層データモデル」の土台となるDBスキーマのみを追加する。
--   Places APIの呼び出し自体はこの段階では実装しない。
--   既存のダミー店舗60件は一切変更しない（is_real_store等はDEFAULTで自動付与）。
-- Supabase SQL Editor で一度だけ実行してください
-- ============================================================

-- ============================================================
-- 1. stores テーブルへのカラム追加
-- ============================================================
ALTER TABLE stores
  ADD COLUMN google_place_id text UNIQUE,
  ADD COLUMN is_real_store   boolean NOT NULL DEFAULT false,
  ADD COLUMN is_hidden       boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN stores.google_place_id IS 'Google Places APIのplace_id。Google利用規約によりこのIDのみ永続保存可（店名・住所等はplace_cache経由で都度取得し保存しない）';
COMMENT ON COLUMN stores.is_real_store   IS 'true=Google Places API連携の実店舗 / false=StyleMap独自のダミー店舗';
COMMENT ON COLUMN stores.is_hidden       IS '掲載停止依頼などで非表示にする場合true。is_publishedとは独立した理由でのブロック用';

CREATE INDEX stores_google_place_id_idx ON stores(google_place_id);

-- ============================================================
-- 2. is_hidden をRLSポリシー本体に組み込む
--    個別クエリでの絞り込み漏れ（joinを経由した間接アクセス等）を防ぐため、
--    アプリ側の実装に依存せずDBレベルで一律ブロックする。
-- ============================================================
DROP POLICY IF EXISTS "stores_select_published" ON stores;

CREATE POLICY "stores_select_published"
  ON stores FOR SELECT
  USING (is_published = true AND is_hidden = false);

-- ============================================================
-- 3. place_cache テーブル新設
--    Places APIレスポンスの一時キャッシュ。DBへの恒久保存ではなく、
--    expires_at経過後は再取得する前提のキャッシュ層として扱う。
-- ============================================================
CREATE TABLE place_cache (
  place_id   text        PRIMARY KEY,
  data       jsonb       NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

COMMENT ON TABLE place_cache IS 'Places API (New) レスポンスの一時キャッシュ。Google利用規約上、恒久保存ではなくキャッシュとして扱うこと';
COMMENT ON COLUMN place_cache.data IS 'Places API (New) のレスポンスJSONそのもの';

CREATE INDEX place_cache_expires_at_idx ON place_cache(expires_at);

ALTER TABLE place_cache ENABLE ROW LEVEL SECURITY;

-- 誰でも読める（キャッシュ済みPlacesデータの閲覧は全員に許可）
CREATE POLICY "place_cache_select_all"
  ON place_cache FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE用のポリシーは意図的に作成しない。
-- service_role キーはRLSを常にバイパスするため、
-- anon/authenticatedロールへの書き込みポリシーを作らないことで
-- 「書き込みはservice_roleのみ」を実現する。
