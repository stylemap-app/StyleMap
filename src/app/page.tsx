import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import HomeClient from "@/components/layout/HomeClient";
import type { StoreForMap } from "@/components/map/MapView";
import type { View } from "@/components/layout/ViewTabs";
import type { TagMaster } from "@/types/store";

export default async function Home({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const supabase = createClient();
  const [{ data: storeData, error }, { data: tagData }] = await Promise.all([
    supabase
      .from("stores")
      .select(
        "id, name, nearest_station, price_range, lat, lng, store_photos(url, is_main, sort_order), store_tags(tag_masters(type, slug, label_ja))"
      )
      .eq("is_published", true)
      .order("name"),
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
      />
    </Suspense>
  );
}
