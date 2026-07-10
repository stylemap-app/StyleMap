-- ============================================================
-- 004_reviews.sql: レビュー機能
-- ============================================================

CREATE TABLE reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    uuid        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     text,
  trust_score float       NOT NULL DEFAULT 1.0,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- 1ユーザー1店舗につきレビューは1件まで
  UNIQUE (store_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 誰でも読める
CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (true);

-- 認証済みユーザーが自分のレビューを作成
CREATE POLICY "reviews_insert_own"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のレビューのみ更新
CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- 自分のレビューのみ削除
CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);
