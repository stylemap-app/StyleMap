import { createAdminClient } from "@/lib/supabase/admin";
import { mergeStoresWithPlaces } from "@/lib/places/merge";
import type { Store } from "@/types/store";
import { AREAS, AREA_ID_MAP } from "@/lib/areas";
import BatchAiClient, { type BatchAiTargetStore } from "./BatchAiClient";

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

export default async function BatchAiPage() {
  const supabase = createAdminClient();

  const { data: styleTagRows } = await supabase
    .from("tag_masters")
    .select("id")
    .eq("type", "style");
  const styleTagIds = new Set((styleTagRows ?? []).map((t) => t.id));

  const { data } = await supabase
    .from("stores")
    .select(
      "id, name, address, lat, lng, nearest_station, price_range, hours, links, operator_review, is_published, is_hidden, is_real_store, google_place_id, area_id, created_at, store_tags(tag_id)"
    )
    .eq("is_real_store", true)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as AdminStoreRow[];
  // 「系統タグが未設定」= 系統タグが1つも付いていない店舗のみを対象にする
  const withoutStyleTag = rows.filter(
    (r) => !(r.store_tags ?? []).some((t) => styleTagIds.has(t.tag_id))
  );

  const storesWithPlace = await mergeStoresWithPlaces(withoutStyleTag);

  const targets: BatchAiTargetStore[] = storesWithPlace
    // Places情報が取れない店舗はAI推定の入力（店名・住所・カテゴリ）が
    // 得られないため対象から外す
    .filter((s) => s.place)
    .map((s) => ({
      id: s.id,
      name: s.place!.name,
      areaName: s.area_id ? AREA_ID_TO_NAME.get(s.area_id) ?? "-" : "-",
    }));

  return <BatchAiClient targets={targets} />;
}
