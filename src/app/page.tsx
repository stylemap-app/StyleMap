import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import HomeClient from "@/components/layout/HomeClient";
import type { StoreForMap } from "@/components/map/MapView";
import type { View } from "@/components/layout/ViewTabs";
import type { TagMaster } from "@/types/store";
import { AREA_ID_MAP, DEFAULT_AREA_SLUG, getArea } from "@/lib/areas";

export default async function Home({
  searchParams,
}: {
  searchParams: { view?: string; area?: string };
}) {
  const supabase = createClient();

  const areaSlug = searchParams.area ?? DEFAULT_AREA_SLUG;
  const areaId = AREA_ID_MAP[areaSlug];
  const currentArea = getArea(areaSlug) ?? getArea(DEFAULT_AREA_SLUG)!;

  const storeQueryBase = supabase
    .from("stores")
    .select(
      "id, name, nearest_station, price_range, lat, lng, store_photos(url, is_main, sort_order), store_tags(tag_masters(type, slug, label_ja))"
    )
    .eq("is_published", true)
    .order("name");

  const [{ data: storeData, error }, { data: tagData }] = await Promise.all([
    areaId ? storeQueryBase.eq("area_id", areaId) : storeQueryBase,
    supabase
      .from("tag_masters")
      .select("id, type, slug, label_ja, sort_order")
      .in("type", ["style", "vibe", "gender"])
      .order("type")
      .order("sort_order"),
  ]);

  if (error) console.error("Supabase fetch error:", error.message);

  const defaultView: View = searchParams.view === "list" ? "list" : "map";

  return (
    <Suspense>
      <HomeClient
        stores={(storeData ?? []) as unknown as StoreForMap[]}
        defaultView={defaultView}
        tagMasters={(tagData ?? []) as unknown as TagMaster[]}
        currentArea={currentArea}
      />
    </Suspense>
  );
}
