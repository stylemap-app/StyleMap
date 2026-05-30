-- ============================================================
-- 002_favorites_lists.sql
-- Supabase SQL Editor で一度だけ実行してください
-- ============================================================

-- 1. favorite_lists テーブル（マイリスト管理）
CREATE TABLE favorite_lists (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  position   smallint    NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX favorite_lists_user_id_idx ON favorite_lists(user_id);

-- 2. favorites テーブルに list_id を追加（nullable: 既存行との後方互換）
ALTER TABLE favorites
  ADD COLUMN list_id uuid REFERENCES favorite_lists(id) ON DELETE SET NULL;

CREATE INDEX favorites_list_id_idx ON favorites(list_id);

-- 3. 旧 UNIQUE(user_id, store_id) を削除（複数リストへの同時保存を許可するため）
ALTER TABLE favorites
  DROP CONSTRAINT IF EXISTS favorites_user_id_store_id_key;

-- 4. (user_id, store_id, list_id) の重複防止（list_id が NULL の行は対象外）
CREATE UNIQUE INDEX favorites_user_store_list_idx
  ON favorites(user_id, store_id, list_id)
  WHERE list_id IS NOT NULL;

-- 5. favorites に update ポリシー追加（list_id の付け替えに必要）
CREATE POLICY "favorites_update_own"
  ON favorites FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. favorite_lists の RLS
ALTER TABLE favorite_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorite_lists_select_own"
  ON favorite_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorite_lists_insert_own"
  ON favorite_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorite_lists_update_own"
  ON favorite_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "favorite_lists_delete_own"
  ON favorite_lists FOR DELETE
  USING (auth.uid() = user_id);
