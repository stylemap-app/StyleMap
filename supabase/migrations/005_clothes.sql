-- ============================================================
-- 005_clothes.sql: 服データ（clothes + clothes_favorites）
-- Supabase SQL Editor で一度だけ実行してください
-- ============================================================

-- ============================================================
-- 1. clothes テーブル作成
-- ============================================================
CREATE TABLE clothes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     uuid        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name         text        NOT NULL,
  price        integer     NOT NULL CHECK (price > 0),
  image_url    text        NOT NULL,
  category     text        NOT NULL CHECK (category IN ('トップス','パンツ','アウター','靴','アクセサリー')),
  brand        text,
  description  text,
  is_published boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clothes_store_id_idx     ON clothes(store_id);
CREATE INDEX clothes_category_idx     ON clothes(category);
CREATE INDEX clothes_is_published_idx ON clothes(is_published);

-- ============================================================
-- 2. clothes_favorites テーブル作成
-- ============================================================
CREATE TABLE clothes_favorites (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clothes_id  uuid        NOT NULL REFERENCES clothes(id)  ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, clothes_id)
);

CREATE INDEX clothes_favorites_user_id_idx    ON clothes_favorites(user_id);
CREATE INDEX clothes_favorites_clothes_id_idx ON clothes_favorites(clothes_id);

-- ============================================================
-- 3. RLS
-- ============================================================
ALTER TABLE clothes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes_favorites ENABLE ROW LEVEL SECURITY;

-- clothes: 公開済みは誰でも読める
CREATE POLICY "clothes_select_published"
  ON clothes FOR SELECT
  USING (is_published = true);

-- clothes_favorites: 本人のみ読み書き
CREATE POLICY "clothes_favorites_select_own"
  ON clothes_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "clothes_favorites_insert_own"
  ON clothes_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clothes_favorites_delete_own"
  ON clothes_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. ダミーデータ 30件
--    下北沢 7件 / 原宿 8件 / 渋谷 8件 / 新宿 7件
--    トップス10 / パンツ8 / アウター5 / 靴4 / アクセサリー3
--
--    下北沢店舗IDは nearest_station='下北沢' でサブクエリ取得
--    原宿 20000000-... / 渋谷 30000000-... / 新宿 40000000-...
-- ============================================================

INSERT INTO clothes
  (id, store_id, name, price, image_url, category, brand, description)
VALUES

-- ============================================================
-- 下北沢 7件（store_id はサブクエリで取得）
-- ============================================================

-- トップス 3件
(
  'c0000000-0000-0000-0000-000000000001',
  (SELECT id FROM stores WHERE nearest_station = '下北沢' ORDER BY id LIMIT 1 OFFSET 0),
  'ヴィンテージフランネルシャツ', 4800,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Flannel+Shirt',
  'トップス', NULL,
  '80年代アメリカ製のヴィンテージフランネル。チェック柄のゆったりシルエットで古着らしい雰囲気。'
),
(
  'c0000000-0000-0000-0000-000000000002',
  (SELECT id FROM stores WHERE nearest_station = '下北沢' ORDER BY id LIMIT 1 OFFSET 0),
  'バンドTシャツ', 2800,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Band+Tee',
  'トップス', NULL,
  '90年代のロックバンドTシャツ。色落ちしたボディに旬のプリントが映えるオリジナル。'
),
(
  'c0000000-0000-0000-0000-000000000003',
  (SELECT id FROM stores WHERE nearest_station = '下北沢' ORDER BY id LIMIT 1 OFFSET 1),
  'オーバーサイズスウェット', 6500,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Oversized+Sweat',
  'トップス', NULL,
  '裏毛素材のオーバーサイズスウェット。袖のリブをロールアップして着こなすのがおすすめ。'
),

-- パンツ 2件
(
  'c0000000-0000-0000-0000-000000000004',
  (SELECT id FROM stores WHERE nearest_station = '下北沢' ORDER BY id LIMIT 1 OFFSET 1),
  'デニムワイドパンツ', 8900,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Wide+Denim',
  'パンツ', NULL,
  'ユーズド加工のワイドデニム。センタープレスが入っており、きれいめにもカジュアルにも着回せる。'
),
(
  'c0000000-0000-0000-0000-000000000005',
  (SELECT id FROM stores WHERE nearest_station = '下北沢' ORDER BY id LIMIT 1 OFFSET 2),
  'コーデュロイスラックス', 7200,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Corduroy+Slacks',
  'パンツ', NULL,
  '細コーデュロイのテーパードスラックス。ヴィンテージライクなテクスチャーがポイント。'
),

-- アウター 1件
(
  'c0000000-0000-0000-0000-000000000006',
  (SELECT id FROM stores WHERE nearest_station = '下北沢' ORDER BY id LIMIT 1 OFFSET 2),
  'ミリタリーM-65ジャケット', 14800,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=M65+Jacket',
  'アウター', NULL,
  '本物の米軍放出品M-65フィールドジャケット。ライナー付きで春秋どちらも活躍する定番。'
),

-- アクセサリー 1件
(
  'c0000000-0000-0000-0000-000000000007',
  (SELECT id FROM stores WHERE nearest_station = '下北沢' ORDER BY id LIMIT 1 OFFSET 3),
  'ヴィンテージキャップ', 3200,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Vintage+Cap',
  'アクセサリー', NULL,
  '80年代チームロゴ入りのヴィンテージキャップ。どんなコーデにもさらっと合わせられる一点物。'
),

-- ============================================================
-- 原宿 8件（20000000-...）
-- ============================================================

-- トップス 3件
(
  'c0000000-0000-0000-0000-000000000008',
  '20000000-0000-0000-0000-000000000001',
  'ストリートグラフィックTシャツ', 5500,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Graphic+Tee',
  'トップス', NULL,
  'ローカルアーティストとのコラボグラフィックT。バックプリントが目を引くWARP限定カラー。'
),
(
  'c0000000-0000-0000-0000-000000000009',
  '20000000-0000-0000-0000-000000000002',
  'フリルスリーブブラウス', 6800,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Frill+Blouse',
  'トップス', NULL,
  '袖フリルがポイントの韓国系ブラウス。シフォン素材でふんわりとした上品な印象に。'
),
(
  'c0000000-0000-0000-0000-000000000010',
  '20000000-0000-0000-0000-000000000005',
  'オーバーサイズニットカーディガン', 8900,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Knit+Cardigan',
  'トップス', NULL,
  'ゆるっとしたシルエットのニットカーディガン。インナーを選ばずコーデのまとめ役に。'
),

-- パンツ 2件
(
  'c0000000-0000-0000-0000-000000000011',
  '20000000-0000-0000-0000-000000000002',
  'チェック柄ミニスカート', 4500,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Mini+Skirt',
  'パンツ', NULL,
  'ポップなチェック柄のミニスカート。韓国系キャンパスコーデに欠かせないボトムス。'
),
(
  'c0000000-0000-0000-0000-000000000012',
  '20000000-0000-0000-0000-000000000006',
  'モードブラックスラックス', 18000,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Black+Slacks',
  'パンツ', NULL,
  'テーラードラインのブラックスラックス。ストリートにもモードにも合わせられる汎用性が高い一本。'
),

-- アウター 1件
(
  'c0000000-0000-0000-0000-000000000013',
  '20000000-0000-0000-0000-000000000008',
  'マウンテンパーカー', 16500,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Mountain+Parka',
  'アウター', NULL,
  '防水・防風機能を備えたマウンテンパーカー。タウンユース向けに設計された洗練カラー展開。'
),

-- 靴 1件
(
  'c0000000-0000-0000-0000-000000000014',
  '20000000-0000-0000-0000-000000000010',
  'スケートスニーカー', 9800,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Skate+Sneakers',
  '靴', NULL,
  'スケーターに長年支持されてきたクラシックスニーカー。タフな作りで普段使いにも最適。'
),

-- アクセサリー 1件
(
  'c0000000-0000-0000-0000-000000000015',
  '20000000-0000-0000-0000-000000000011',
  'グラフィックポーチ', 2800,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Graphic+Pouch',
  'アクセサリー', NULL,
  'エコーハラジュク別注のキャンバスポーチ。ワッペンとプリントが独特でコーデのアクセントに。'
),

-- ============================================================
-- 渋谷 8件（30000000-...）
-- ============================================================

-- トップス 2件
(
  'c0000000-0000-0000-0000-000000000016',
  '30000000-0000-0000-0000-000000000001',
  'ポケット付きロングTシャツ', 4200,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Pocket+LongT',
  'トップス', NULL,
  'シンプルなポケット付きロングTシャツ。シーズンを問わず着回せるベーシックな一枚。'
),
(
  'c0000000-0000-0000-0000-000000000017',
  '30000000-0000-0000-0000-000000000008',
  'リネンオープンカラーシャツ', 9800,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Linen+Shirt',
  'トップス', NULL,
  'ナチュラルカラーのオープンカラーリネンシャツ。素材感のよさが際立つ夏の主役アイテム。'
),

-- パンツ 2件
(
  'c0000000-0000-0000-0000-000000000018',
  '30000000-0000-0000-0000-000000000003',
  'プリーツミニスカート', 5800,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Pleats+Skirt',
  'パンツ', NULL,
  '韓国スタイルのプリーツミニスカート。膝丈でカジュアルにもきれいめにも着回せるボトムス。'
),
(
  'c0000000-0000-0000-0000-000000000019',
  '30000000-0000-0000-0000-000000000006',
  'ドレープワイドパンツ', 21000,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Drape+Wide+Pants',
  'パンツ', NULL,
  '上品なドレープが美しいワイドパンツ。素材感で差をつける大人のストリートスタイルに。'
),

-- アウター 2件
(
  'c0000000-0000-0000-0000-000000000020',
  '30000000-0000-0000-0000-000000000002',
  'トラックジャケット', 11000,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Track+Jacket',
  'アウター', NULL,
  'スポーツMIXスタイルの定番トラックジャケット。サイドラインが映えるクリーンなシルエット。'
),
(
  'c0000000-0000-0000-0000-000000000021',
  '30000000-0000-0000-0000-000000000009',
  'アメリカ古着デニムジャケット', 11500,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Denim+Jacket',
  'アウター', NULL,
  '90年代アメリカ製ヴィンテージデニムジャケット。程よいユーズド感がアメカジコーデを完成させる。'
),

-- 靴 1件
(
  'c0000000-0000-0000-0000-000000000022',
  '30000000-0000-0000-0000-000000000002',
  'ハイカットバスケットシューズ', 13500,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Basketball+Shoes',
  '靴', NULL,
  'ハイカットのバスケットボールシューズ。ストリートコーデとの相性が抜群のクラシックデザイン。'
),

-- アクセサリー 1件
(
  'c0000000-0000-0000-0000-000000000023',
  '30000000-0000-0000-0000-000000000012',
  'スポーツキャップ', 4500,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Sports+Cap',
  'アクセサリー', NULL,
  '限定コラボのスポーツキャップ。刺繍ロゴが存在感抜群でコーデのポイントに。'
),

-- ============================================================
-- 新宿 7件（40000000-...）
-- ============================================================

-- トップス 2件
(
  'c0000000-0000-0000-0000-000000000024',
  '40000000-0000-0000-0000-000000000004',
  'スラッシュネックトップス', 4800,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Slash+Neck+Top',
  'トップス', NULL,
  'スラッシュネックデザインのトップス。韓国系コーデに映えるシンプルなシルエット。'
),
(
  'c0000000-0000-0000-0000-000000000025',
  '40000000-0000-0000-0000-000000000007',
  'フラワープリントキャミソール', 3800,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Flower+Cami',
  'トップス', NULL,
  '小花柄のキャミソール。ナチュラルテイストのコーデのベースになる柔らかな一枚。'
),

-- パンツ 2件
(
  'c0000000-0000-0000-0000-000000000026',
  '40000000-0000-0000-0000-000000000003',
  'ヴィンテージカーゴパンツ', 8200,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Cargo+Pants',
  'パンツ', NULL,
  '90年代のヴィンテージカーゴパンツ。多ポケットと独特のシルエットがストリートの味になる。'
),
(
  'c0000000-0000-0000-0000-000000000027',
  '40000000-0000-0000-0000-000000000010',
  'テーパードスラックス', 12000,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Tapered+Slacks',
  'パンツ', NULL,
  'モード×ナチュラルな雰囲気のテーパードスラックス。試着室でスタッフに相談したいアイテム。'
),

-- アウター 1件
(
  'c0000000-0000-0000-0000-000000000028',
  '40000000-0000-0000-0000-000000000002',
  'テーラードジャケット', 28000,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Tailored+Jacket',
  'アウター', NULL,
  'イタリア生地を使用したリラックスシルエットのテーラードジャケット。一生物の品質感。'
),

-- 靴 2件
(
  'c0000000-0000-0000-0000-000000000029',
  '40000000-0000-0000-0000-000000000006',
  'トレッキングブーツ', 19800,
  'https://placehold.co/600x800/D4714A/F7F5F0?text=Trekking+Boots',
  '靴', NULL,
  '防水設計のトレッキングブーツ。アウトドアからタウンユースまで幅広く活躍する実力派。'
),
(
  'c0000000-0000-0000-0000-000000000030',
  '40000000-0000-0000-0000-000000000001',
  'レザーチェルシーブーツ', 24000,
  'https://placehold.co/600x800/2C2A27/F7F5F0?text=Chelsea+Boots',
  '靴', NULL,
  'モードストリートに合わせたいレザーチェルシーブーツ。シンプルな中に存在感があるデザイン。'
);
