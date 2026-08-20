import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlaceData, PriceRange, Store } from "@/types/store";
import { ENTRY_SCORE_SLUGS } from "@/lib/vibes";
import { getPlacePhotoUrl } from "@/lib/places/photo";

export const DEFAULT_LIST_NAME = "行きたい店";

export type FavoriteList = {
  id: string;
  name: string;
  position: number;
};

export type FavoriteStore = {
  id: string;
  name: string;
  priceRange: PriceRange;
  mainPhotoUrl?: string;
  entryScore: number;
  is_real_store: boolean;
};

// getStoresInList() が返す生の店舗行（Placesマージ前）
export type FavoriteStoreRow = Store & {
  store_photos: { url: string; is_main: boolean; sort_order: number }[];
  store_tags?: { tag_masters: { type: string; slug: string } | null }[];
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

// 新しいリストを作成
export async function createList(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  position: number
): Promise<FavoriteList> {
  const { data } = await supabase
    .from("favorite_lists")
    .insert({ user_id: userId, name, position })
    .select("id, name, position")
    .single();
  return data!;
}

// リスト名を変更
export async function renameList(
  supabase: SupabaseClient,
  listId: string,
  name: string
): Promise<void> {
  await supabase.from("favorite_lists").update({ name }).eq("id", listId);
}

// リストを削除（リスト内のお気に入りも削除）
export async function deleteList(
  supabase: SupabaseClient,
  listId: string
): Promise<void> {
  await supabase.from("favorites").delete().eq("list_id", listId);
  await supabase.from("favorite_lists").delete().eq("id", listId);
}

// 特定リストに含まれる店舗一覧を取得（生データのみ。Placesマージはしない）
//
// このファイルは FavoritesClient.tsx（クライアントコンポーネント）から
// createList/renameList/deleteList と一緒に直接importされるため、
// server-only な src/lib/places/merge.ts を持ち込むとクライアントビルドが
// 壊れる。そのため実際のPlacesマージ＋フラット化は
// src/app/api/favorites/stores/route.ts（サーバー専用）側で行い、
// ここでは素のDB行を返すだけにとどめる。
export async function getStoresInList(
  supabase: SupabaseClient,
  listId: string
): Promise<FavoriteStoreRow[]> {
  const { data } = await supabase
    .from("favorites")
    .select(
      "stores (id, name, address, lat, lng, price_range, hours, links, is_real_store, google_place_id, store_photos (url, is_main, sort_order), store_tags (tag_masters (type, slug)))"
    )
    .eq("list_id", listId);

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((f: any) => f.stores)
    .filter(Boolean) as FavoriteStoreRow[];
}

// getStoresInList() の結果にPlacesマージ後の place を合成した行を、
// 表示用のフラットな FavoriteStore に変換する（Places呼び出しは行わない純関数）
export function toFavoriteStore(
  store: FavoriteStoreRow & { place: PlaceData | null }
): FavoriteStore {
  const photos = [...(store.store_photos ?? [])].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return a.sort_order - b.sort_order;
  });
  const tags = (store.store_tags ?? [])
    .map((st) => st.tag_masters)
    .filter((t): t is { type: string; slug: string } => Boolean(t));
  const entryScore = (ENTRY_SCORE_SLUGS as readonly string[]).filter((s) =>
    tags.some((t) => t.slug === s)
  ).length;

  const mainPhotoUrl = store.is_real_store
    ? store.place?.photos[0]
      // FavoriteStoreCard は一覧カード相当のサムネイル表示のため同じサイズを使う
      ? getPlacePhotoUrl(store.place.photos[0].name, 400)
      : undefined
    : photos[0]?.url;

  return {
    id: store.id,
    name: store.place?.name || store.name,
    priceRange: store.price_range as PriceRange,
    mainPhotoUrl,
    entryScore,
    is_real_store: store.is_real_store,
  };
}
