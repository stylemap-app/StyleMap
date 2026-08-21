-- ============================================================
-- 009_remove_ai_inferred_tags.sql
--   Google Maps Platform サポートの公式回答により、Places APIから
--   取得したデータ（店名・住所・place types等）をLLMに送信すること
--   （Section 3.2.3(a)違反）、それを元に生成したタグを保存すること
--   （Section 3.2.3(c)違反）がいずれも規約違反と確定したため、
--   AIタグ推定機能を削除する（アプリ側の対応は別途実施）。
--   このマイグレーションは、AI推定によって付与された系統・商品カテゴリ
--   タグをDBから削除する。雰囲気タグ・客層タグは人間が付けたものなので
--   対象外（削除しない）。
--
-- 【重要：当初案からの修正】
--   当初は「ai_last_inferred_at IS NOT NULL」を条件に削除する予定
--   だったが、実際にはこの条件に一致する行は0件だった。
--   理由：38件の一括AI推定を実行した時点では ai_last_inferred_at
--   カラム自体がまだ存在せず（マイグレーション008で後から追加）、
--   AI推定によるタグ付与は全て「記録なし」の状態で行われていたため。
--
--   そのため実際には、実店舗（is_real_store=true）の系統(style)・
--   商品カテゴリ(category)タグを無条件に削除する方法で対応した
--   （この時点で実店舗に系統・商品カテゴリタグを付けていた経路は
--   AI推定のみだったため、is_real_store=true が実質的にAI由来タグの
--   識別条件として機能した）。ダミー店舗（is_real_store=false）の
--   タグは元々人間が設計時に付与したものであり対象外。
--
--   実行結果（2026年8月）：
--     実店舗の系統・商品カテゴリタグ 136件を削除
--     削除後の確認：0件
--     ダミー店舗のタグ 716件は影響なし
--
-- このファイルは「将来の参照用」に、実際に実行したSQLを記録する
-- ============================================================

-- ============================================================
-- 確認用SELECT: 実店舗の系統・商品カテゴリタグの件数
-- （削除実行前にこちらで対象件数を確認する）
-- ============================================================
SELECT
  s.id,
  s.name,
  s.is_real_store,
  COUNT(st.tag_id) FILTER (WHERE tm.type IN ('style', 'category')) AS ai_tag_count,
  COUNT(st.tag_id) FILTER (WHERE tm.type NOT IN ('style', 'category')) AS other_tag_count
FROM stores s
LEFT JOIN store_tags st ON st.store_id = s.id
LEFT JOIN tag_masters tm ON tm.id = st.tag_id
WHERE s.is_real_store = true
GROUP BY s.id, s.name, s.is_real_store
ORDER BY s.name;

-- 削除対象タグの総数（上のSELECTの ai_tag_count 合計と一致するはず）
SELECT COUNT(*) AS total_ai_tags_to_delete
FROM store_tags st
JOIN tag_masters tm ON tm.id = st.tag_id
WHERE st.store_id IN (SELECT id FROM stores WHERE is_real_store = true)
  AND tm.type IN ('style', 'category');

-- ============================================================
-- 削除実行: 実店舗（is_real_store=true）の
-- 系統(style)・商品カテゴリ(category)タグのみ削除する。
-- 雰囲気(vibe)・客層(gender/age_group)タグは対象外（type条件で保護）。
-- ダミー店舗（is_real_store=false）は is_real_store 条件により
-- 一切対象にならない。
-- store_tags は (store_id, tag_id) の複合主キーで単独のidカラムが
-- ないため、複合キーでの絞り込みで削除する
-- ============================================================
DELETE FROM store_tags
WHERE (store_id, tag_id) IN (
  SELECT st.store_id, st.tag_id
  FROM store_tags st
  JOIN tag_masters tm ON tm.id = st.tag_id
  WHERE st.store_id IN (SELECT id FROM stores WHERE is_real_store = true)
    AND tm.type IN ('style', 'category')
);
