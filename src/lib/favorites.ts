import type { SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_LIST_NAME = "行きたい店";

export type FavoriteList = {
  id: string;
  name: string;
  position: number;
};

// ユーザーの最初のリストを返す。なければ「行きたい店」を作成して返す
export async function getOrCreateDefaultList(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("favorite_lists")
    .select("id")
    .eq("user_id", userId)
    .order("position")
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("favorite_lists")
    .insert({ user_id: userId, name: DEFAULT_LIST_NAME, position: 0 })
    .select("id")
    .single();

  return created!.id;
}

// ユーザーのリスト一覧を取得
export async function getUserLists(
  supabase: SupabaseClient
): Promise<FavoriteList[]> {
  const { data } = await supabase
    .from("favorite_lists")
    .select("id, name, position")
    .order("position");
  return data ?? [];
}

// この店舗が含まれているリストの ID 一覧
export async function getStoreListIds(
  supabase: SupabaseClient,
  storeId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("favorites")
    .select("list_id")
    .eq("store_id", storeId)
    .not("list_id", "is", null);
  return (data ?? []).map((f) => f.list_id as string);
}

// お気に入り店舗 ID 一覧を一括取得（HomeClient のバッチ用）
export async function getUserFavoritedStoreIds(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data } = await supabase.from("favorites").select("store_id");
  return Array.from(new Set((data ?? []).map((f) => f.store_id as string)));
}

// 特定リストに店舗を追加
export async function addFavoriteToList(
  supabase: SupabaseClient,
  storeId: string,
  listId: string,
  userId: string
): Promise<void> {
  await supabase
    .from("favorites")
    .insert({ user_id: userId, store_id: storeId, list_id: listId });
}

// 特定リストから店舗を削除
export async function removeFavoriteFromList(
  supabase: SupabaseClient,
  storeId: string,
  listId: string
): Promise<void> {
  await supabase
    .from("favorites")
    .delete()
    .eq("store_id", storeId)
    .eq("list_id", listId);
}

// すべてのリストからこの店舗を削除（完全なお気に入り解除）
export async function removeAllFavorites(
  supabase: SupabaseClient,
  storeId: string
): Promise<void> {
  await supabase.from("favorites").delete().eq("store_id", storeId);
}
