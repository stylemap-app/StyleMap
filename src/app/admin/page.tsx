import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeStoresWithPlaces } from "@/lib/places/merge";
import type { Store } from "@/types/store";
import { AREAS, AREA_ID_MAP } from "@/lib/areas";
import { toggleStoreHidden } from "./actions";

type AdminStoreRow = Store & {
  area_id: string | null;
  store_tags?: { tag_id: number }[];
};

const AREA_ID_TO_NAME = new Map(
  Object.entries(AREA_ID_MAP).map(([slug, id]) => [
    id,
    AREAS.find((a) => a.slug === slug)?.name ?? slug,
  ])
);

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("stores")
    .select(
      "id, name, address, lat, lng, nearest_station, price_range, hours, links, operator_review, is_published, is_hidden, is_real_store, google_place_id, area_id, created_at, store_tags(tag_id)"
    )
    .eq("is_real_store", true)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as AdminStoreRow[];
  const storesWithPlace = await mergeStoresWithPlaces(rows);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">登録済み店舗（実店舗）</h1>
        <Link
          href="/admin/stores"
          className="h-9 px-3 rounded-button bg-clay text-paper text-xs font-medium flex items-center active:opacity-80"
        >
          + 新規登録
        </Link>
      </div>

      {storesWithPlace.length === 0 ? (
        <p className="text-sm text-gray-400">登録済みの実店舗はまだありません</p>
      ) : (
        <div className="space-y-2">
          {storesWithPlace.map((store) => (
            <div
              key={store.id}
              className="flex items-center justify-between gap-3 rounded-card bg-white shadow-card p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {store.place?.name ?? "（Places情報取得失敗）"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {store.area_id ? AREA_ID_TO_NAME.get(store.area_id) ?? "-" : "-"}
                  &ensp;・&ensp;タグ{store.store_tags?.length ?? 0}件
                  &ensp;・&ensp;{store.is_published ? "公開中" : "非公開"}
                  {store.is_hidden && "（掲載停止中）"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/stores/${store.id}`}
                  className="text-xs px-2.5 py-1.5 rounded-button border border-gray-300 text-ink active:opacity-70"
                >
                  タグ編集
                </Link>
                <form action={toggleStoreHidden.bind(null, store.id, !store.is_hidden)}>
                  <button
                    type="submit"
                    className="text-xs px-2.5 py-1.5 rounded-button border border-gray-300 text-ink active:opacity-70"
                  >
                    {store.is_hidden ? "掲載再開" : "掲載停止"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
