-- ============================================================
-- StyleMap 001_initial.sql
-- 実行環境: Supabase SQL Editor（一度だけ実行してください）
-- ============================================================


-- ============================================================
-- 1. テーブル定義
-- ============================================================

-- 店舗マスタ
CREATE TABLE stores (
  id                           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                         text        NOT NULL,
  name_kana                    text,
  address                      text        NOT NULL,
  nearest_station              text        NOT NULL,
  lat                          numeric(10,7) NOT NULL,
  lng                          numeric(10,7) NOT NULL,
  price_range                  smallint    NOT NULL CHECK (price_range BETWEEN 1 AND 4),
  hours                        jsonb       NOT NULL DEFAULT '{}',
  links                        jsonb       NOT NULL DEFAULT '{}',
  operator_review              text,
  operator_review_updated_at   timestamptz,
  is_published                 boolean     NOT NULL DEFAULT false,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN stores.price_range IS '1=〜¥3k / 2=¥3k〜8k / 3=¥8k〜20k / 4=¥20k〜';
COMMENT ON COLUMN stores.hours       IS '{"regular":[{open,close},×7], "note":"..."}';
COMMENT ON COLUMN stores.links       IS '{"instagram":"...","google_maps":"...","official_site":"..."}';

-- タグマスタ（系統・雰囲気・カテゴリーなど全種類を1テーブルで管理）
CREATE TABLE tag_masters (
  id         serial  PRIMARY KEY,
  type       text    NOT NULL CHECK (type IN ('style','vibe','category','gender','age_group','price_tag')),
  slug       text    NOT NULL UNIQUE,
  label_ja   text    NOT NULL,
  sort_order smallint NOT NULL DEFAULT 0
);

-- 店舗↔タグ 中間テーブル
CREATE TABLE store_tags (
  store_id  uuid    NOT NULL REFERENCES stores(id)      ON DELETE CASCADE,
  tag_id    integer NOT NULL REFERENCES tag_masters(id) ON DELETE RESTRICT,
  PRIMARY KEY (store_id, tag_id)
);

-- 店舗写真
CREATE TABLE store_photos (
  id         uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   uuid     NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  url        text     NOT NULL,
  caption    text,
  is_main    boolean  NOT NULL DEFAULT false,
  sort_order smallint NOT NULL DEFAULT 0
);

-- ユーザープロフィール（auth.users を拡張）
CREATE TABLE users (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- お気に入り
CREATE TABLE favorites (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  store_id   uuid        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, store_id)
);


-- ============================================================
-- 2. インデックス
-- ============================================================

CREATE INDEX stores_nearest_station_idx  ON stores(nearest_station);
CREATE INDEX stores_price_range_idx      ON stores(price_range);
CREATE INDEX stores_is_published_idx     ON stores(is_published);
CREATE INDEX stores_location_idx         ON stores(lat, lng);
CREATE INDEX store_tags_tag_id_idx       ON store_tags(tag_id);
CREATE INDEX store_photos_store_id_idx   ON store_photos(store_id);
CREATE INDEX store_photos_sort_order_idx ON store_photos(store_id, sort_order);
CREATE INDEX favorites_user_id_idx       ON favorites(user_id);
CREATE INDEX favorites_store_id_idx      ON favorites(store_id);


-- ============================================================
-- 3. 関数・トリガー
-- ============================================================

-- updated_at を自動更新する汎用関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Supabase に新規ユーザーが登録されたら public.users を自動作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 4. Row Level Security（RLS）
-- ============================================================

ALTER TABLE stores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_masters  ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_tags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites    ENABLE ROW LEVEL SECURITY;

-- stores: 公開済み店舗は誰でも閲覧可
CREATE POLICY "stores_select_published"
  ON stores FOR SELECT
  USING (is_published = true);

-- tag_masters: 誰でも閲覧可（フィルターに必要）
CREATE POLICY "tag_masters_select_all"
  ON tag_masters FOR SELECT
  USING (true);

-- store_tags: 誰でも閲覧可
CREATE POLICY "store_tags_select_all"
  ON store_tags FOR SELECT
  USING (true);

-- store_photos: 誰でも閲覧可
CREATE POLICY "store_photos_select_all"
  ON store_photos FOR SELECT
  USING (true);

-- users: 自分のプロフィールのみ操作可
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- favorites: 自分のお気に入りのみ操作可
CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 5. シードデータ：タグマスタ
-- ============================================================

INSERT INTO tag_masters (type, slug, label_ja, sort_order) VALUES
  -- style（系統）16種
  ('style', 'street',          'ストリート',     1),
  ('style', 'vintage',         '古着',           2),
  ('style', 'korean',          '韓国系',         3),
  ('style', 'mode',            'モード',         4),
  ('style', 'casual',          'カジュアル',     5),
  ('style', 'american-casual', 'アメカジ',       6),
  ('style', 'work',            'ワーク',         7),
  ('style', 'military',        'ミリタリー',     8),
  ('style', 'outdoor',         'アウトドア',     9),
  ('style', 'natural',         'ナチュラル',     10),
  ('style', 'feminine',        'フェミニン',     11),
  ('style', 'girly',           'ガーリー',       12),
  ('style', 'preppy',          'プレッピー',     13),
  ('style', 'luxury',          'ラグジュアリー', 14),
  ('style', 'sport-mix',       'スポーツMIX',    15),
  ('style', 'subculture',      'サブカル',       16),

  -- vibe（雰囲気）13種
  ('vibe', 'easy-solo',           '一人で入りやすい',   1),
  ('vibe', 'beginner-friendly',   '初心者向け',         2),
  ('vibe', 'staff-quiet',         '声かけされない',     3),
  ('vibe', 'staff-helpful',       'スタッフに相談しやすい', 4),
  ('vibe', 'instagram-worthy',    '写真映えする',       5),
  ('vibe', 'quiet-atmosphere',    '落ち着いた雰囲気',   6),
  ('vibe', 'good-music',          '音楽が良い',         7),
  ('vibe', 'large-fitting-room',  '試着室が広い',       8),
  ('vibe', 'frequent-sale',       'セールが多い',       9),
  ('vibe', 'single-item',         '単品で買いやすい',   10),
  ('vibe', 'coordinate-display',  'コーデ提案が多い',   11),
  ('vibe', 'unique-items',        '他では買えない',     12),
  ('vibe', 'pet-friendly',        'ペット同伴OK',       13),

  -- category（商品カテゴリー）9種
  ('category', 'tops',        'トップス',     1),
  ('category', 'bottoms',     'ボトムス',     2),
  ('category', 'outerwear',   'アウター',     3),
  ('category', 'shoes',       'シューズ',     4),
  ('category', 'bags',        'バッグ',       5),
  ('category', 'accessories', 'アクセサリー', 6),
  ('category', 'hats',        '帽子',         7),
  ('category', 'used',        '古着',         8),
  ('category', 'new-items',   '新品',         9),

  -- gender（性別対象）3種
  ('gender', 'mens',    'メンズ',       1),
  ('gender', 'womens',  'レディース',   2),
  ('gender', 'unisex',  'ユニセックス', 3),

  -- age_group（年齢層）3種
  ('age_group', 'teens',          '10代後半', 1),
  ('age_group', 'early-twenties', '20代前半', 2),
  ('age_group', 'late-twenties',  '20代後半', 3),

  -- price_tag（価格補足）4種
  ('price_tag', 'high-value',  '高見え',     1),
  ('price_tag', 'sale-rich',   'セール豊富', 2),
  ('price_tag', 'rare-items',  'レア品多め', 3),
  ('price_tag', 'limited',     '限定品あり', 4);
