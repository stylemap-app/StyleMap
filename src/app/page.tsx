import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import HomeClient from "@/components/layout/HomeClient";
import type { StoreForMap } from "@/components/map/MapView";
import type { View } from "@/components/layout/ViewTabs";
import type { TagMaster } from "@/types/store";
import type { ClothForGrid } from "@/components/layout/ClothesView";
import { AREA_ID_MAP, DEFAULT_AREA_SLUG, getArea } from "@/lib/areas";

export default async function Home({
  searchParams,
}: {
  searchParams: { view?: string; area?: string; tab?: string };
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
    .eq("is_hidden", false)
    .order("name");

  const [{ data: storeData, error }, { data: tagData }, { data: reviewRows }, { data: clothesData }] =
    await Promise.all([
      areaId ? storeQueryBase.eq("area_id", areaId) : storeQueryBase,
      supabase
        .from("tag_masters")
        .select("id, type, slug, label_ja, sort_order")
        .in("type", ["style", "vibe", "gender"])
        .order("type")
        .order("sort_order"),
      supabase.from("reviews").select("store_id, rating"),
      supabase
        .from("clothes")
        .select("id, name, price, image_url, category")
        .eq("is_published", true)
        .order("created_at"),
    ]);

  if (error) console.error("Supabase fetch error:", error.message);

  type RatingEntry = { avg: number; count: number };
  const ratingMap: Record<string, RatingEntry> = {};
  for (const row of reviewRows ?? []) {
    if (!ratingMap[row.store_id]) ratingMap[row.store_id] = { avg: 0, count: 0 };
    ratingMap[row.store_id].count += 1;
    ratingMap[row.store_id].avg += row.rating;
  }
  for (const storeId in ratingMap) {
    ratingMap[storeId].avg = ratingMap[storeId].avg / ratingMap[storeId].count;
  }

  const defaultView: View = searchParams.view === "list" ? "list" : "map";
  const defaultSearchMode = searchParams.tab === "clothes" ? "clothes" : "store";

  return (
    <Suspense>
      <HomeClient
        stores={(storeData ?? []) as unknown as StoreForMap[]}
        defaultView={defaultView}
        defaultSearchMode={defaultSearchMode}
        tagMasters={(tagData ?? []) as unknown as TagMaster[]}
        currentArea={currentArea}
        ratingMap={ratingMap}
        clothes={(clothesData ?? []) as ClothForGrid[]}
      />
    </Suspense>
  );
}
