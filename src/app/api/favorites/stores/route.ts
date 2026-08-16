import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoresInList, toFavoriteStore } from "@/lib/favorites";
import { mergeStoresWithPlaces } from "@/lib/places/merge";

// FavoritesClient.tsx（クライアントコンポーネント）から呼ばれる。
// Places APIキーを扱うマージ処理はここでのみ実行する（詳しくは favorites.ts のコメント参照）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get("listId");
  if (!listId) {
    return NextResponse.json({ error: "listId is required" }, { status: 400 });
  }

  const supabase = createClient();
  const rows = await getStoresInList(supabase, listId);
  const rowsWithPlace = await mergeStoresWithPlaces(rows);
  const stores = rowsWithPlace.map(toFavoriteStore);

  return NextResponse.json({ stores });
}
