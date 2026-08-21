import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeStoresWithPlaces } from "@/lib/places/merge";
import type { Store } from "@/types/store";
import { AREAS, AREA_ID_MAP } from "@/lib/areas";
import AdminStoreListClient, { type AdminStoreListItem } from "./AdminStoreListClient";

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

  const { data: tagMasterRows } = await supabase
    .from("tag_masters")
    .select("id")
    .in("type", ["style", "category"]);
  const styleOrCategoryTagIds = new Set((tagMasterRows ?? []).map((t) => t.id));

  const { data } = await supabase
    .from("stores")
    .select(
      "id, name, address, lat, lng, nearest_station, price_range, hours, links, operator_review, is_published, is_hidden, is_real_store, google_place_id, area_id, created_at, ai_last_inferred_at, store_tags(tag_id)"
    )
    .eq("is_real_store", true)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as (AdminStoreRow & {
    ai_last_inferred_at: string | null;
  })[];
  const storesWithPlace = await mergeStoresWithPlaces(rows);
  const unpublishedCount = storesWithPlace.filter((s) => !s.is_published).length;

  const listItems: AdminStoreListItem[] = storesWithPlace.map((store) => {
    const hasStyleOrCategoryTag = (store.store_tags ?? []).some((t) =>
      styleOrCategoryTagIds.has(t.tag_id)
    );
    return {
      id: store.id,
      name: store.place?.name ?? "（Places情報取得失敗）",
      areaName: store.area_id ? AREA_ID_TO_NAME.get(store.area_id) ?? "-" : "-",
      tagCount: store.store_tags?.length ?? 0,
      is_published: store.is_published,
      is_hidden: store.is_hidden,
      is_real_store: store.is_real_store,
      aiInferenceFailed: store.ai_last_inferred_at !== null && !hasStyleOrCategoryTag,
    };
  });

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

      {unpublishedCount > 0 && (
        <div className="rounded-card bg-clay/10 border border-clay/30 px-3 py-2 text-xs text-clay font-medium">
          未公開の店舗が{unpublishedCount}件あります
        </div>
      )}

      {listItems.length === 0 ? (
        <p className="text-sm text-gray-400">登録済みの実店舗はまだありません</p>
      ) : (
        <AdminStoreListClient stores={listItems} />
      )}
    </div>
  );
}
