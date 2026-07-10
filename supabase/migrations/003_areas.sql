-- ============================================================
-- 003_areas.sql: エリア対応
-- ============================================================

-- 1. areas テーブル作成
CREATE TABLE areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  prefecture text NOT NULL DEFAULT '東京都',
  lat decimal(9,6) NOT NULL,
  lng decimal(9,6) NOT NULL,
  zoom_level int NOT NULL DEFAULT 16,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "areas_select_all" ON areas FOR SELECT USING (true);

-- 2. stores に area_id 列を追加
ALTER TABLE stores ADD COLUMN area_id uuid REFERENCES areas(id) ON DELETE SET NULL;

-- 3. エリアデータ挿入
INSERT INTO areas (id, slug, name, prefecture, lat, lng, zoom_level, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'shimokitazawa', '下北沢', '東京都', 35.6613, 139.6680, 16, 1),
  ('a0000000-0000-0000-0000-000000000002', 'harajuku',      '原宿',   '東京都', 35.6702, 139.7027, 16, 2),
  ('a0000000-0000-0000-0000-000000000003', 'shibuya',       '渋谷',   '東京都', 35.6580, 139.7016, 15, 3),
  ('a0000000-0000-0000-0000-000000000004', 'shinjuku',      '新宿',   '東京都', 35.6896, 139.6917, 15, 4);

-- 4. 既存20店舗を下北沢エリアに紐付け
UPDATE stores SET area_id = 'a0000000-0000-0000-0000-000000000001' WHERE nearest_station = '下北沢';

-- ============================================================
-- 5. 原宿エリア 15店舗
-- ============================================================

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000001','WARP HARAJUKU','ワープハラジュク','東京都渋谷区神宮前1-8-5 1F','原宿',35.6712,139.7020,2,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/warp_harajuku/"}','ストリートとヴィンテージが交差する路面店。週替わりで入荷するアメリカ古着と国内セレクトのバランスが絶妙。平日昼はゆっくり掘れます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000002','KAWAII DEPOT','カワイイデポ','東京都渋谷区神宮前1-15-3 1F','原宿',35.6698,139.7035,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/kawaii_depot_harajuku/"}','竹下通り近くのカラフルな路面店。韓国系とガーリーを中心に週2回入荷。コーデ提案ディスプレイが充実していて全身まとめやすい雰囲気です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000003','NEON VINTAGE','ネオンヴィンテージ','東京都渋谷区神宮前6-25-8 B1F','原宿',35.6720,139.7030,1,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"火曜定休"}','{"instagram":"https://www.instagram.com/neon_vintage_harajuku/"}','地下に広がるネオン照明の古着空間。サブカルとストリートが融合した雰囲気で、DJプレイが流れる週末は特に盛り上がります。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000004','GRIT SUPPLY','グリットサプライ','東京都渋谷区神宮前4-32-12 2F','原宿',35.6705,139.7015,2,'{"regular":[{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"13:00","close":"21:00"},{"open":"12:00","close":"21:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/grit_supply_tokyo/"}','ミリタリーとワークを軸にしたセレクトショップ。2Fのため静かな環境でじっくり試着できます。スタッフは声をかけてこないスタイル。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000005','SEOUL WAVE','ソウルウェーブ','東京都渋谷区神宮前3-18-6 1F','原宿',35.6695,139.7040,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/seoul_wave_harajuku/"}','原宿の韓国系の中でも入荷が早く、SNSで話題になる前のアイテムが揃います。コーデ提案が多く初めての韓国系にも入りやすい雰囲気です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000006','FLUX TOKYO','フラックストウキョウ','東京都渋谷区神宮前5-14-9 2F','原宿',35.6715,139.7038,3,'{"regular":[{"open":"13:00","close":"21:00"},{"open":"13:00","close":"21:00"},{"open":"13:00","close":"21:00"},{"open":"13:00","close":"21:00"},{"open":null,"close":null},{"open":"13:00","close":"21:00"},{"open":"12:00","close":"21:00"}],"note":"木曜定休"}','{"instagram":"https://www.instagram.com/flux_tokyo/","official_site":"https://flux-tokyo.example.com"}','ストリートとモードの境界を攻めるセレクト。2Fで落ち着いた雰囲気の中、他では見かけない独自の目線でセレクトされたアイテムが並ぶ。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000007','PASTEL YARD','パステルヤード','東京都渋谷区神宮前1-22-7 1F','原宿',35.6690,139.7025,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/pastel_yard_harajuku/"}','パステルカラーと可愛さを追求したガーリーセレクト。SNS映えを意識したコーデ提案が豊富で、写真を撮りながら買い物する人が多い路面店です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000008','TRAIL CO','トレイルコー','東京都渋谷区神宮前6-12-3 1F','原宿',35.6708,139.7045,2,'{"regular":[{"open":"11:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"11:00","close":"20:00"}],"note":"火曜定休"}','{"instagram":"https://www.instagram.com/trail_co_tokyo/"}','アウトドアとタウンユースを行き来するスタイルに特化。機能的なアイテムを普段着に落とし込むコーデ提案が参考になります。スタッフも気さくです。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000009','LAYER THEORY','レイヤーセオリー','東京都渋谷区神宮前5-28-4 3F','原宿',35.6725,139.7020,3,'{"regular":[{"open":"13:00","close":"20:00"},{"open":null,"close":null},{"open":null,"close":null},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"}],"note":"月・火曜定休"}','{"instagram":"https://www.instagram.com/layer_theory_harajuku/","official_site":"https://layer-theory.example.com"}','ナチュラルとモードを重ね着で表現するコンセプトショップ。3Fのゆったりした空間でスタッフの提案を聞きながら試着できます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000010','BRAVE STREET','ブレイブストリート','東京都渋谷区神宮前4-16-11 1F','原宿',35.6700,139.7010,2,'{"regular":[{"open":"11:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/brave_street_harajuku/"}','アメカジとストリートをつなぐ路面店。スケーターも原宿系も足を運ぶ裾野の広いセレクトが魅力。音楽のセンスも抜群で長居したくなる空間です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000011','ECHO HARAJUKU','エコーハラジュク','東京都渋谷区神宮前6-8-15 B1F','原宿',35.6718,139.7042,2,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"}],"note":"火曜定休"}','{"instagram":"https://www.instagram.com/echo_harajuku/"}','サブカルとストリートが好きな人のための地下セレクト。ネオンサインと壁アートが映える空間でグラフィック系のアイテムが充実しています。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000012','LACE HARAJUKU','レースハラジュク','東京都渋谷区神宮前3-7-2 2F','原宿',35.6693,139.7018,3,'{"regular":[{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":null,"close":null},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/lace_harajuku/","official_site":"https://lace-harajuku.example.com"}','フェミニン×ナチュラルを軸にした2Fの隠れ家的ショップ。試着室が広く、スタッフに相談しながらゆったり選べる落ち着いた雰囲気です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000013','YURERU SELECT','ユレルセレクト','東京都渋谷区神宮前2-11-8 1F','原宿',35.6722,139.7028,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/yureru_select/"}','韓国の最新トレンドをキャッチアップした路面店。毎週末に新入荷があり来るたびに顔ぶれが変わります。スタッフも気さくで話しかけやすい雰囲気。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000014','DRIFT HARAJUKU','ドリフトハラジュク','東京都渋谷区神宮前6-31-5 1F','原宿',35.6685,139.7033,1,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"11:00","close":"20:00"}],"note":"火曜定休"}','{"instagram":"https://www.instagram.com/drift_harajuku/"}','ヴィンテージの掘り出し物を求める人向けの路面店。1,000円台から揃うプチプラとスタッフが声をかけてこない自由な空気感が人気です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('20000000-0000-0000-0000-000000000015','MIRROR OMOTESANDO','ミラーオモテサンドウ','東京都渋谷区神宮前5-45-12 2F','原宿',35.6702,139.7050,4,'{"regular":[{"open":"13:00","close":"20:00"},{"open":null,"close":null},{"open":null,"close":null},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"}],"note":"月・火曜定休"}','{"instagram":"https://www.instagram.com/mirror_omotesando/","official_site":"https://mirror-omotesando.example.com"}','表参道エリアに構えるモード×ラグジュアリーの集大成。2Fのプライベート空間でクオリティにこだわった一点物を時間をかけて選べます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000002');

-- ============================================================
-- 6. 渋谷エリア 15店舗
-- ============================================================

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000001','GROUND SHIBUYA','グラウンドシブヤ','東京都渋谷区渋谷2-5-12 1F','渋谷',35.6590,139.7010,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/ground_shibuya/"}','渋谷のど真ん中に構えるカジュアルストリートの入門店。単品で使いやすいアイテムが揃い、初めてのセレクトショップにも最適な雰囲気です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000002','PULSE TOKYO','パルストウキョウ','東京都渋谷区宇田川町18-6 1F','渋谷',35.6575,139.7025,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/pulse_tokyo_shibuya/"}','スポーツとストリートを融合させたコレクションが週替わりで入荷。DJブース常設でBGMが良く、試着しながら気分が上がる空間です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000003','SEOULED SHIBUYA','ソウルドシブヤ','東京都渋谷区道玄坂2-22-7 1F','渋谷',35.6585,139.7030,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/seouled_shibuya/"}','渋谷の韓国系セレクトの中でもコーデ提案が際立つ一店。毎週木曜新入荷で、来るたびに新しいスタイリングのヒントが得られます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000004','FADE MARKET','フェードマーケット','東京都渋谷区宇田川町15-1 2F','渋谷',35.6570,139.7018,1,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"}],"note":"火曜定休"}','{"instagram":"https://www.instagram.com/fade_market_shibuya/"}','宇田川町エリアの2Fにある隠れ家的古着店。声をかけてこないスタッフと手頃な値段で、ゆっくりと掘り出し物探しを楽しめます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000005','URBAN THREAD','アーバンスレッド','東京都渋谷区渋谷1-14-8 1F','渋谷',35.6592,139.7022,2,'{"regular":[{"open":"11:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"11:00","close":"20:00"}],"note":"木曜定休"}','{"instagram":"https://www.instagram.com/urban_thread_shibuya/"}','渋谷らしいアーバンカジュアルを手ごろな価格で揃えた路面店。初めてセレクトショップに行く人にも入りやすいコーデ提案型のレイアウト。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000006','CHROME SELECT','クロームセレクト','東京都渋谷区桜丘町16-3 2F','渋谷',35.6578,139.7035,3,'{"regular":[{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"13:00","close":"21:00"},{"open":"12:00","close":"21:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/chrome_select_tokyo/","official_site":"https://chrome-select.example.com"}','桜丘の静かな2Fに位置するモードストリートの聖地。限定感のあるアイテムが多く、感度の高い渋谷ファッショニスタが集まります。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000007','FLARE STUDIO','フレアスタジオ','東京都渋谷区道玄坂1-8-5 1F','渋谷',35.6565,139.7012,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/flare_studio_shibuya/"}','渋谷でいち早く韓国トレンドを取り入れる路面店。ガーリーとフェミニンのMIXが得意で、10代から20代前半に幅広く支持されています。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000008','BARE CO','ベアコー','東京都渋谷区円山町5-9 1F','渋谷',35.6588,139.7008,2,'{"regular":[{"open":"11:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"11:00","close":"20:00"}],"note":"火曜定休"}','{"instagram":"https://www.instagram.com/bare_co_shibuya/"}','円山町のナチュラルセレクトの隠れ家。素材にこだわった落ち着いた雰囲気の中、スタッフに気軽に相談しながらじっくり選べます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000009','STITCH VINTAGE','スティッチヴィンテージ','東京都渋谷区宇田川町22-4 B1F','渋谷',35.6572,139.7040,2,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/stitch_vintage_shibuya/"}','アメカジ古着の目利き仕入れが際立つ宇田川エリアの地下店。声かけなしのスタイルでゆっくり掘れて、状態の良いアイテムが揃っています。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000010','CROWD SUPPLY','クラウドサプライ','東京都渋谷区渋谷3-8-3 1F','渋谷',35.6595,139.7028,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/crowd_supply_shibuya/"}','渋谷で全身コーデをまとめたいときに頼れる路面店。ストリート×カジュアルの単品が揃い、シーズンごとのコーデ提案も充実しています。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000011','HAZE STUDIO','ヘイズスタジオ','東京都渋谷区渋谷1-5-14 3F','渋谷',35.6562,139.7020,4,'{"regular":[{"open":"13:00","close":"20:00"},{"open":null,"close":null},{"open":null,"close":null},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"}],"note":"月・火曜定休"}','{"instagram":"https://www.instagram.com/haze_studio_shibuya/","official_site":"https://haze-studio.example.com"}','渋谷に密かに存在するモード×ラグジュアリーのセレクト。3Fのプライベートな空間で、スタッフと一対一でスタイリングを楽しめます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000012','RUSH MARKET','ラッシュマーケット','東京都渋谷区宇田川町25-8 1F','渋谷',35.6580,139.7042,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"木曜定休"}','{"instagram":"https://www.instagram.com/rush_market_shibuya/"}','スポーツMIXの限定アイテムを狙うなら外せない宇田川店。発売前日には行列ができることもある人気スポット。インスタ映えも抜群の空間です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000013','SOUL SELECT','ソウルセレクト','東京都渋谷区桜丘町20-11 2F','渋谷',35.6598,139.7015,2,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/soul_select_shibuya/"}','桜丘の静かな2Fに構えるヴィンテージ×ナチュラルの融合店。古着の中から素材感の良いアイテムを丁寧にセレクトしたこだわりの空間です。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000014','BOLD TOKYO','ボールドトウキョウ','東京都渋谷区渋谷2-19-6 2F','渋谷',35.6568,139.7030,3,'{"regular":[{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":null,"close":null},{"open":"13:00","close":"21:00"},{"open":"12:00","close":"21:00"}],"note":"木曜定休"}','{"instagram":"https://www.instagram.com/bold_tokyo_shibuya/","official_site":"https://bold-tokyo.example.com"}','モードとストリートが正面衝突するセレクト。インスタで話題になる前のアイテムをいち早く取り扱い、感度の高い客層が集まる2Fの空間。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('30000000-0000-0000-0000-000000000015','PRIM SELECT','プリムセレクト','東京都渋谷区猿楽町12-5 1F','渋谷',35.6583,139.7002,3,'{"regular":[{"open":"11:00","close":"19:00"},{"open":null,"close":null},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/prim_select_shibuya/","official_site":"https://prim-select.example.com"}','猿楽町の上品なフェミニン×プレッピーセレクト。試着室が広くスタッフが相談に乗ってくれるため、普段とは違うスタイルに挑戦しやすい。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000003');

-- ============================================================
-- 7. 新宿エリア 10店舗
-- ============================================================

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000001','EDGE SHINJUKU','エッジシンジュク','東京都新宿区新宿3-12-8 2F','新宿',35.6905,139.6910,3,'{"regular":[{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"13:00","close":"21:00"},{"open":"12:00","close":"21:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/edge_shinjuku/"}','新宿3丁目に潜むモード×ストリートのセレクト。他では見かけないブランドを独自ルートで仕入れ、インスタよりも実物に価値のある一点物が揃います。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000002','NOBLE THREAD','ノーブルスレッド','東京都新宿区新宿4-3-15 2F','新宿',35.6890,139.6925,4,'{"regular":[{"open":"13:00","close":"20:00"},{"open":null,"close":null},{"open":null,"close":null},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"}],"note":"月・火曜定休"}','{"instagram":"https://www.instagram.com/noble_thread_tokyo/","official_site":"https://noble-thread.example.com"}','新宿エリアのラグジュアリーセレクトの頂点。2Fの静かな空間で試着室も広く、スタッフが生地から縫製まで丁寧に説明してくれます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000003','CROSS VINTAGE','クロスヴィンテージ','東京都新宿区歌舞伎町2-5-11 1F','新宿',35.6910,139.6920,2,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"}],"note":"火曜定休"}','{"instagram":"https://www.instagram.com/cross_vintage_shinjuku/"}','歌舞伎町エリアで発見できる古着の良店。スタッフは静かで自分のペースでゆっくり選べる雰囲気。希少なヴィンテージが定期的に入荷します。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000004','GATE SEOUL','ゲートソウル','東京都新宿区新宿3-8-7 1F','新宿',35.6898,139.6905,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/gate_seoul_shinjuku/"}','新宿3丁目の韓国系セレクトの新顔。毎週末に新入荷があり、コーデ提案型のディスプレイで初めての韓国系にも取り入れやすい構成。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000005','NOIR STUDIO','ノワールスタジオ','東京都新宿区四谷1-6-4 3F','新宿',35.6885,139.6915,4,'{"regular":[{"open":"13:00","close":"20:00"},{"open":null,"close":null},{"open":"13:00","close":"20:00"},{"open":null,"close":null},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"},{"open":"13:00","close":"20:00"}],"note":"月・水曜定休"}','{"instagram":"https://www.instagram.com/noir_studio_shinjuku/","official_site":"https://noir-studio.example.com"}','四谷エリアの知る人ぞ知るモード×ラグジュアリー。3Fの完全プライベート空間で、スタッフとのマンツーマン接客を楽しめる大人のショップ。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000006','CAMP SHINJUKU','キャンプシンジュク','東京都新宿区新宿2-18-3 1F','新宿',35.6908,139.6935,2,'{"regular":[{"open":"11:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"11:00","close":"20:00"}],"note":"木曜定休"}','{"instagram":"https://www.instagram.com/camp_shinjuku/"}','機能性とタウンユースを両立したアウトドアカジュアルのセレクト。単品ごとの使い勝手を丁寧に説明してくれるスタッフが揃い、初心者でも安心。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000007','BLOOM SHINJUKU','ブルームシンジュク','東京都新宿区高田馬場1-8-12 1F','新宿',35.6892,139.6940,2,'{"regular":[{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":null,"close":null},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"},{"open":"11:00","close":"19:00"}],"note":"水曜定休"}','{"instagram":"https://www.instagram.com/bloom_shinjuku/"}','高田馬場エリアのナチュラル×フェミニンの優しい空間。落ち着いた雰囲気の中でスタッフに相談しながら、毎日着られる服をゆっくり選べます。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000008','RUSH SHINJUKU','ラッシュシンジュク','東京都新宿区新宿3-28-5 1F','新宿',35.6915,139.6912,2,'{"regular":[{"open":"11:00","close":"21:00"},{"open":null,"close":null},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"12:00","close":"21:00"},{"open":"11:00","close":"21:00"}],"note":"月曜定休"}','{"instagram":"https://www.instagram.com/rush_shinjuku/"}','新宿3丁目のスポーツMIXセレクトの新定番。DJミックスが流れる店内でテンションが上がる空間。限定コラボアイテムも定期的に取り扱っています。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000009','TRACE SUPPLY','トレーススプライ','東京都新宿区百人町1-12-6 1F','新宿',35.6878,139.6920,2,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"}],"note":"火曜定休"}','{"instagram":"https://www.instagram.com/trace_supply_shinjuku/"}','百人町エリアのアメカジ×ミリタリー古着店。スタッフは静かで価格も手頃。セールが多く、良品を安く手に入れたい人に絶大な支持を得ています。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

INSERT INTO stores (id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, operator_review_updated_at, is_published, area_id) VALUES
('40000000-0000-0000-0000-000000000010','PRIME SELECT','プライムセレクト','東京都新宿区新宿3-5-9 2F','新宿',35.6900,139.6930,3,'{"regular":[{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"},{"open":null,"close":null},{"open":"12:00","close":"20:00"},{"open":"12:00","close":"20:00"}],"note":"木曜定休"}','{"instagram":"https://www.instagram.com/prime_select_shinjuku/","official_site":"https://prime-select.example.com"}','新宿3丁目の2Fに静かに佇むモード×ナチュラルのセレクト。試着室が広くスタッフが丁寧に提案してくれるため、普段とは違うスタイルに挑戦しやすい。','2026-06-01T00:00:00Z',true,'a0000000-0000-0000-0000-000000000004');

-- ============================================================
-- 8. 店舗写真（原宿15店 + 渋谷15店 + 新宿10店）
-- ============================================================

INSERT INTO store_photos (store_id, url, caption, is_main, sort_order) VALUES
('20000000-0000-0000-0000-000000000001','https://placehold.co/800x600/D4714A/F7F5F0?text=WARP+HARAJUKU','店内',true,0),
('20000000-0000-0000-0000-000000000001','https://placehold.co/800x600/2C2A27/F7F5F0?text=WARP+HARAJUKU+2','ラック',false,1),
('20000000-0000-0000-0000-000000000002','https://placehold.co/800x600/D4714A/F7F5F0?text=KAWAII+DEPOT','外観',true,0),
('20000000-0000-0000-0000-000000000002','https://placehold.co/800x600/2C2A27/F7F5F0?text=KAWAII+DEPOT+2','コーデ提案',false,1),
('20000000-0000-0000-0000-000000000003','https://placehold.co/800x600/D4714A/F7F5F0?text=NEON+VINTAGE','店内',true,0),
('20000000-0000-0000-0000-000000000003','https://placehold.co/800x600/2C2A27/F7F5F0?text=NEON+VINTAGE+2','ヴィンテージラック',false,1),
('20000000-0000-0000-0000-000000000004','https://placehold.co/800x600/D4714A/F7F5F0?text=GRIT+SUPPLY','店内',true,0),
('20000000-0000-0000-0000-000000000004','https://placehold.co/800x600/2C2A27/F7F5F0?text=GRIT+SUPPLY+2','ミリタリーコーナー',false,1),
('20000000-0000-0000-0000-000000000005','https://placehold.co/800x600/D4714A/F7F5F0?text=SEOUL+WAVE','外観',true,0),
('20000000-0000-0000-0000-000000000005','https://placehold.co/800x600/2C2A27/F7F5F0?text=SEOUL+WAVE+2','コーデ提案',false,1),
('20000000-0000-0000-0000-000000000006','https://placehold.co/800x600/D4714A/F7F5F0?text=FLUX+TOKYO','店内',true,0),
('20000000-0000-0000-0000-000000000006','https://placehold.co/800x600/2C2A27/F7F5F0?text=FLUX+TOKYO+2','セレクト棚',false,1),
('20000000-0000-0000-0000-000000000007','https://placehold.co/800x600/D4714A/F7F5F0?text=PASTEL+YARD','外観',true,0),
('20000000-0000-0000-0000-000000000007','https://placehold.co/800x600/2C2A27/F7F5F0?text=PASTEL+YARD+2','ディスプレイ',false,1),
('20000000-0000-0000-0000-000000000008','https://placehold.co/800x600/D4714A/F7F5F0?text=TRAIL+CO','店内',true,0),
('20000000-0000-0000-0000-000000000008','https://placehold.co/800x600/2C2A27/F7F5F0?text=TRAIL+CO+2','アウトドアコーナー',false,1),
('20000000-0000-0000-0000-000000000009','https://placehold.co/800x600/D4714A/F7F5F0?text=LAYER+THEORY','店内',true,0),
('20000000-0000-0000-0000-000000000009','https://placehold.co/800x600/2C2A27/F7F5F0?text=LAYER+THEORY+2','試着室',false,1),
('20000000-0000-0000-0000-000000000010','https://placehold.co/800x600/D4714A/F7F5F0?text=BRAVE+STREET','外観',true,0),
('20000000-0000-0000-0000-000000000010','https://placehold.co/800x600/2C2A27/F7F5F0?text=BRAVE+STREET+2','ラック',false,1),
('20000000-0000-0000-0000-000000000011','https://placehold.co/800x600/D4714A/F7F5F0?text=ECHO+HARAJUKU','店内',true,0),
('20000000-0000-0000-0000-000000000011','https://placehold.co/800x600/2C2A27/F7F5F0?text=ECHO+HARAJUKU+2','壁アート',false,1),
('20000000-0000-0000-0000-000000000012','https://placehold.co/800x600/D4714A/F7F5F0?text=LACE+HARAJUKU','外観',true,0),
('20000000-0000-0000-0000-000000000012','https://placehold.co/800x600/2C2A27/F7F5F0?text=LACE+HARAJUKU+2','試着室',false,1),
('20000000-0000-0000-0000-000000000013','https://placehold.co/800x600/D4714A/F7F5F0?text=YURERU+SELECT','外観',true,0),
('20000000-0000-0000-0000-000000000013','https://placehold.co/800x600/2C2A27/F7F5F0?text=YURERU+SELECT+2','コーデ提案',false,1),
('20000000-0000-0000-0000-000000000014','https://placehold.co/800x600/D4714A/F7F5F0?text=DRIFT+HARAJUKU','店内',true,0),
('20000000-0000-0000-0000-000000000014','https://placehold.co/800x600/2C2A27/F7F5F0?text=DRIFT+HARAJUKU+2','ヴィンテージラック',false,1),
('20000000-0000-0000-0000-000000000015','https://placehold.co/800x600/D4714A/F7F5F0?text=MIRROR+OMOTESANDO','店内',true,0),
('20000000-0000-0000-0000-000000000015','https://placehold.co/800x600/2C2A27/F7F5F0?text=MIRROR+OMOTESANDO+2','試着室',false,1);

INSERT INTO store_photos (store_id, url, caption, is_main, sort_order) VALUES
('30000000-0000-0000-0000-000000000001','https://placehold.co/800x600/D4714A/F7F5F0?text=GROUND+SHIBUYA','店内',true,0),
('30000000-0000-0000-0000-000000000001','https://placehold.co/800x600/2C2A27/F7F5F0?text=GROUND+SHIBUYA+2','ラック',false,1),
('30000000-0000-0000-0000-000000000002','https://placehold.co/800x600/D4714A/F7F5F0?text=PULSE+TOKYO','店内',true,0),
('30000000-0000-0000-0000-000000000002','https://placehold.co/800x600/2C2A27/F7F5F0?text=PULSE+TOKYO+2','DJブース',false,1),
('30000000-0000-0000-0000-000000000003','https://placehold.co/800x600/D4714A/F7F5F0?text=SEOULED+SHIBUYA','外観',true,0),
('30000000-0000-0000-0000-000000000003','https://placehold.co/800x600/2C2A27/F7F5F0?text=SEOULED+SHIBUYA+2','コーデ提案',false,1),
('30000000-0000-0000-0000-000000000004','https://placehold.co/800x600/D4714A/F7F5F0?text=FADE+MARKET','店内',true,0),
('30000000-0000-0000-0000-000000000004','https://placehold.co/800x600/2C2A27/F7F5F0?text=FADE+MARKET+2','ヴィンテージラック',false,1),
('30000000-0000-0000-0000-000000000005','https://placehold.co/800x600/D4714A/F7F5F0?text=URBAN+THREAD','外観',true,0),
('30000000-0000-0000-0000-000000000005','https://placehold.co/800x600/2C2A27/F7F5F0?text=URBAN+THREAD+2','コーデ提案',false,1),
('30000000-0000-0000-0000-000000000006','https://placehold.co/800x600/D4714A/F7F5F0?text=CHROME+SELECT','店内',true,0),
('30000000-0000-0000-0000-000000000006','https://placehold.co/800x600/2C2A27/F7F5F0?text=CHROME+SELECT+2','セレクト棚',false,1),
('30000000-0000-0000-0000-000000000007','https://placehold.co/800x600/D4714A/F7F5F0?text=FLARE+STUDIO','外観',true,0),
('30000000-0000-0000-0000-000000000007','https://placehold.co/800x600/2C2A27/F7F5F0?text=FLARE+STUDIO+2','コーデ提案',false,1),
('30000000-0000-0000-0000-000000000008','https://placehold.co/800x600/D4714A/F7F5F0?text=BARE+CO','店内',true,0),
('30000000-0000-0000-0000-000000000008','https://placehold.co/800x600/2C2A27/F7F5F0?text=BARE+CO+2','素材コーナー',false,1),
('30000000-0000-0000-0000-000000000009','https://placehold.co/800x600/D4714A/F7F5F0?text=STITCH+VINTAGE','店内',true,0),
('30000000-0000-0000-0000-000000000009','https://placehold.co/800x600/2C2A27/F7F5F0?text=STITCH+VINTAGE+2','アメカジラック',false,1),
('30000000-0000-0000-0000-000000000010','https://placehold.co/800x600/D4714A/F7F5F0?text=CROWD+SUPPLY','外観',true,0),
('30000000-0000-0000-0000-000000000010','https://placehold.co/800x600/2C2A27/F7F5F0?text=CROWD+SUPPLY+2','コーデ提案',false,1),
('30000000-0000-0000-0000-000000000011','https://placehold.co/800x600/D4714A/F7F5F0?text=HAZE+STUDIO','店内',true,0),
('30000000-0000-0000-0000-000000000011','https://placehold.co/800x600/2C2A27/F7F5F0?text=HAZE+STUDIO+2','試着室',false,1),
('30000000-0000-0000-0000-000000000012','https://placehold.co/800x600/D4714A/F7F5F0?text=RUSH+MARKET','外観',true,0),
('30000000-0000-0000-0000-000000000012','https://placehold.co/800x600/2C2A27/F7F5F0?text=RUSH+MARKET+2','限定コーナー',false,1),
('30000000-0000-0000-0000-000000000013','https://placehold.co/800x600/D4714A/F7F5F0?text=SOUL+SELECT','店内',true,0),
('30000000-0000-0000-0000-000000000013','https://placehold.co/800x600/2C2A27/F7F5F0?text=SOUL+SELECT+2','セレクト棚',false,1),
('30000000-0000-0000-0000-000000000014','https://placehold.co/800x600/D4714A/F7F5F0?text=BOLD+TOKYO','店内',true,0),
('30000000-0000-0000-0000-000000000014','https://placehold.co/800x600/2C2A27/F7F5F0?text=BOLD+TOKYO+2','ディスプレイ',false,1),
('30000000-0000-0000-0000-000000000015','https://placehold.co/800x600/D4714A/F7F5F0?text=PRIM+SELECT','外観',true,0),
('30000000-0000-0000-0000-000000000015','https://placehold.co/800x600/2C2A27/F7F5F0?text=PRIM+SELECT+2','試着室',false,1);

INSERT INTO store_photos (store_id, url, caption, is_main, sort_order) VALUES
('40000000-0000-0000-0000-000000000001','https://placehold.co/800x600/D4714A/F7F5F0?text=EDGE+SHINJUKU','店内',true,0),
('40000000-0000-0000-0000-000000000001','https://placehold.co/800x600/2C2A27/F7F5F0?text=EDGE+SHINJUKU+2','セレクト棚',false,1),
('40000000-0000-0000-0000-000000000002','https://placehold.co/800x600/D4714A/F7F5F0?text=NOBLE+THREAD','店内',true,0),
('40000000-0000-0000-0000-000000000002','https://placehold.co/800x600/2C2A27/F7F5F0?text=NOBLE+THREAD+2','試着室',false,1),
('40000000-0000-0000-0000-000000000003','https://placehold.co/800x600/D4714A/F7F5F0?text=CROSS+VINTAGE','店内',true,0),
('40000000-0000-0000-0000-000000000003','https://placehold.co/800x600/2C2A27/F7F5F0?text=CROSS+VINTAGE+2','ヴィンテージラック',false,1),
('40000000-0000-0000-0000-000000000004','https://placehold.co/800x600/D4714A/F7F5F0?text=GATE+SEOUL','外観',true,0),
('40000000-0000-0000-0000-000000000004','https://placehold.co/800x600/2C2A27/F7F5F0?text=GATE+SEOUL+2','コーデ提案',false,1),
('40000000-0000-0000-0000-000000000005','https://placehold.co/800x600/D4714A/F7F5F0?text=NOIR+STUDIO','店内',true,0),
('40000000-0000-0000-0000-000000000005','https://placehold.co/800x600/2C2A27/F7F5F0?text=NOIR+STUDIO+2','試着室',false,1),
('40000000-0000-0000-0000-000000000006','https://placehold.co/800x600/D4714A/F7F5F0?text=CAMP+SHINJUKU','店内',true,0),
('40000000-0000-0000-0000-000000000006','https://placehold.co/800x600/2C2A27/F7F5F0?text=CAMP+SHINJUKU+2','アウトドアコーナー',false,1),
('40000000-0000-0000-0000-000000000007','https://placehold.co/800x600/D4714A/F7F5F0?text=BLOOM+SHINJUKU','外観',true,0),
('40000000-0000-0000-0000-000000000007','https://placehold.co/800x600/2C2A27/F7F5F0?text=BLOOM+SHINJUKU+2','素材コーナー',false,1),
('40000000-0000-0000-0000-000000000008','https://placehold.co/800x600/D4714A/F7F5F0?text=RUSH+SHINJUKU','店内',true,0),
('40000000-0000-0000-0000-000000000008','https://placehold.co/800x600/2C2A27/F7F5F0?text=RUSH+SHINJUKU+2','限定コーナー',false,1),
('40000000-0000-0000-0000-000000000009','https://placehold.co/800x600/D4714A/F7F5F0?text=TRACE+SUPPLY','店内',true,0),
('40000000-0000-0000-0000-000000000009','https://placehold.co/800x600/2C2A27/F7F5F0?text=TRACE+SUPPLY+2','ミリタリーラック',false,1),
('40000000-0000-0000-0000-000000000010','https://placehold.co/800x600/D4714A/F7F5F0?text=PRIME+SELECT','店内',true,0),
('40000000-0000-0000-0000-000000000010','https://placehold.co/800x600/2C2A27/F7F5F0?text=PRIME+SELECT+2','試着室',false,1);

-- ============================================================
-- 9. タグ紐付け（原宿15店）
-- ============================================================

INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000001', id FROM tag_masters WHERE slug IN ('vintage','street','easy-solo','staff-quiet','unique-items','unisex','early-twenties','late-twenties','tops','outerwear','used');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000002', id FROM tag_masters WHERE slug IN ('girly','korean','feminine','instagram-worthy','coordinate-display','beginner-friendly','womens','teens','early-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000003', id FROM tag_masters WHERE slug IN ('vintage','street','subculture','easy-solo','good-music','staff-quiet','unisex','teens','early-twenties','tops','outerwear','used');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000004', id FROM tag_masters WHERE slug IN ('street','military','american-casual','staff-quiet','unique-items','quiet-atmosphere','mens','unisex','early-twenties','late-twenties','tops','outerwear','bags');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000005', id FROM tag_masters WHERE slug IN ('korean','feminine','casual','instagram-worthy','coordinate-display','beginner-friendly','womens','teens','early-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000006', id FROM tag_masters WHERE slug IN ('mode','street','quiet-atmosphere','unique-items','instagram-worthy','unisex','early-twenties','late-twenties','tops','outerwear','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000007', id FROM tag_masters WHERE slug IN ('girly','feminine','casual','instagram-worthy','coordinate-display','beginner-friendly','womens','teens','early-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000008', id FROM tag_masters WHERE slug IN ('outdoor','casual','american-casual','easy-solo','single-item','staff-helpful','mens','unisex','early-twenties','late-twenties','tops','outerwear','bags');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000009', id FROM tag_masters WHERE slug IN ('mode','natural','feminine','quiet-atmosphere','large-fitting-room','staff-helpful','womens','unisex','early-twenties','late-twenties','tops','bottoms','outerwear');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000010', id FROM tag_masters WHERE slug IN ('street','american-casual','casual','easy-solo','good-music','single-item','mens','unisex','teens','early-twenties','tops','outerwear');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000011', id FROM tag_masters WHERE slug IN ('street','subculture','vintage','easy-solo','good-music','staff-quiet','instagram-worthy','unisex','teens','early-twenties','tops','bottoms','hats');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000012', id FROM tag_masters WHERE slug IN ('feminine','natural','casual','quiet-atmosphere','large-fitting-room','staff-helpful','womens','early-twenties','late-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000013', id FROM tag_masters WHERE slug IN ('korean','casual','feminine','instagram-worthy','coordinate-display','beginner-friendly','womens','teens','early-twenties','tops','bottoms');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000014', id FROM tag_masters WHERE slug IN ('vintage','casual','easy-solo','staff-quiet','frequent-sale','unisex','teens','early-twenties','tops','bottoms','used');
INSERT INTO store_tags (store_id, tag_id) SELECT '20000000-0000-0000-0000-000000000015', id FROM tag_masters WHERE slug IN ('mode','luxury','quiet-atmosphere','unique-items','large-fitting-room','staff-helpful','unisex','late-twenties','tops','outerwear','accessories');

-- ============================================================
-- 10. タグ紐付け（渋谷15店）
-- ============================================================

INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000001', id FROM tag_masters WHERE slug IN ('street','casual','easy-solo','single-item','beginner-friendly','coordinate-display','unisex','teens','early-twenties','tops','bottoms','hats');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000002', id FROM tag_masters WHERE slug IN ('street','sport-mix','instagram-worthy','good-music','single-item','limited','unisex','teens','early-twenties','tops','bottoms','shoes');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000003', id FROM tag_masters WHERE slug IN ('korean','feminine','casual','instagram-worthy','coordinate-display','beginner-friendly','womens','teens','early-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000004', id FROM tag_masters WHERE slug IN ('vintage','casual','easy-solo','staff-quiet','frequent-sale','unisex','teens','early-twenties','tops','outerwear','used');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000005', id FROM tag_masters WHERE slug IN ('casual','street','easy-solo','beginner-friendly','coordinate-display','mens','unisex','teens','early-twenties','tops','bottoms');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000006', id FROM tag_masters WHERE slug IN ('mode','street','quiet-atmosphere','unique-items','instagram-worthy','limited','unisex','early-twenties','late-twenties','tops','outerwear','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000007', id FROM tag_masters WHERE slug IN ('korean','girly','feminine','instagram-worthy','coordinate-display','beginner-friendly','womens','teens','early-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000008', id FROM tag_masters WHERE slug IN ('natural','casual','feminine','easy-solo','quiet-atmosphere','staff-helpful','womens','unisex','early-twenties','late-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000009', id FROM tag_masters WHERE slug IN ('vintage','american-casual','casual','easy-solo','staff-quiet','unique-items','mens','unisex','early-twenties','late-twenties','tops','outerwear','used');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000010', id FROM tag_masters WHERE slug IN ('street','casual','easy-solo','coordinate-display','single-item','unisex','teens','early-twenties','tops','bottoms','hats');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000011', id FROM tag_masters WHERE slug IN ('mode','luxury','quiet-atmosphere','unique-items','large-fitting-room','staff-helpful','unisex','late-twenties','tops','outerwear','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000012', id FROM tag_masters WHERE slug IN ('street','sport-mix','instagram-worthy','good-music','limited','mens','unisex','teens','early-twenties','tops','shoes','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000013', id FROM tag_masters WHERE slug IN ('vintage','natural','casual','feminine','quiet-atmosphere','staff-helpful','womens','unisex','early-twenties','late-twenties','tops','bottoms','accessories','used');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000014', id FROM tag_masters WHERE slug IN ('mode','street','instagram-worthy','unique-items','good-music','unisex','early-twenties','late-twenties','tops','outerwear','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '30000000-0000-0000-0000-000000000015', id FROM tag_masters WHERE slug IN ('feminine','preppy','natural','quiet-atmosphere','large-fitting-room','staff-helpful','womens','early-twenties','late-twenties','tops','bottoms','accessories');

-- ============================================================
-- 11. タグ紐付け（新宿10店）
-- ============================================================

INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000001', id FROM tag_masters WHERE slug IN ('street','mode','quiet-atmosphere','unique-items','instagram-worthy','unisex','early-twenties','late-twenties','tops','outerwear','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000002', id FROM tag_masters WHERE slug IN ('mode','luxury','quiet-atmosphere','large-fitting-room','staff-helpful','unique-items','unisex','late-twenties','tops','outerwear','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000003', id FROM tag_masters WHERE slug IN ('vintage','casual','easy-solo','staff-quiet','unique-items','unisex','early-twenties','late-twenties','tops','outerwear','used');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000004', id FROM tag_masters WHERE slug IN ('korean','feminine','casual','instagram-worthy','coordinate-display','beginner-friendly','womens','teens','early-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000005', id FROM tag_masters WHERE slug IN ('mode','luxury','quiet-atmosphere','unique-items','large-fitting-room','staff-helpful','unisex','late-twenties','tops','outerwear','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000006', id FROM tag_masters WHERE slug IN ('outdoor','casual','american-casual','easy-solo','single-item','staff-helpful','mens','unisex','early-twenties','late-twenties','tops','outerwear','bags');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000007', id FROM tag_masters WHERE slug IN ('natural','feminine','casual','quiet-atmosphere','staff-helpful','coordinate-display','womens','early-twenties','late-twenties','tops','bottoms','accessories');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000008', id FROM tag_masters WHERE slug IN ('street','sport-mix','instagram-worthy','good-music','single-item','limited','unisex','teens','early-twenties','tops','bottoms','shoes');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000009', id FROM tag_masters WHERE slug IN ('vintage','american-casual','military','easy-solo','staff-quiet','frequent-sale','mens','unisex','early-twenties','late-twenties','tops','outerwear','used');
INSERT INTO store_tags (store_id, tag_id) SELECT '40000000-0000-0000-0000-000000000010', id FROM tag_masters WHERE slug IN ('mode','natural','casual','quiet-atmosphere','large-fitting-room','staff-helpful','unisex','early-twenties','late-twenties','tops','bottoms','outerwear');
