import { createAdminClient } from "@/lib/supabase/admin";
import { AREAS, AREA_ID_MAP } from "@/lib/areas";
import DummyStoresClient, { type AreaGroup } from "./DummyStoresClient";

type DummyStoreRow = {
  id: string;
  name: string;
  area_id: string | null;
  is_published: boolean;
  is_hidden: boolean;
  store_tags?: { tag_id: number }[];
};

export default async function AdminDummyStoresPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("stores")
    .select("id, name, area_id, is_published, is_hidden, store_tags(tag_id)")
    .eq("is_real_store", false)
    .order("name");

  const rows = (data ?? []) as unknown as DummyStoreRow[];

  const byAreaId = new Map<string, DummyStoreRow[]>();
  const unassigned: DummyStoreRow[] = [];
  for (const row of rows) {
    if (!row.area_id) {
      unassigned.push(row);
      continue;
    }
    if (!byAreaId.has(row.area_id)) byAreaId.set(row.area_id, []);
    byAreaId.get(row.area_id)!.push(row);
  }

  const toGroupStores = (list: DummyStoreRow[]) =>
    list.map((r) => ({
      id: r.id,
      name: r.name,
      is_published: r.is_published,
      is_hidden: r.is_hidden,
      tagCount: r.store_tags?.length ?? 0,
    }));

  const groups: AreaGroup[] = AREAS.map((area) => {
    const areaId = AREA_ID_MAP[area.slug];
    return {
      areaId,
      areaName: area.name,
      stores: toGroupStores(byAreaId.get(areaId) ?? []),
    };
  });

  if (unassigned.length > 0) {
    groups.push({
      areaId: null,
      areaName: "エリア不明",
      stores: toGroupStores(unassigned),
    });
  }

  return <DummyStoresClient groups={groups} totalCount={rows.length} />;
}
