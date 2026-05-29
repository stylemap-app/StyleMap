import { supabase } from "@/lib/supabase";
import HomeClient from "@/components/layout/HomeClient";
import type { StoreForMap } from "@/components/map/MapView";
import type { View } from "@/components/layout/ViewTabs";

export default async function Home({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, name, nearest_station, price_range, lat, lng, store_photos(url, is_main, sort_order), store_tags(tag_masters(type, slug, label_ja))"
    )
    .eq("is_published", true)
    .order("name");

  if (error) console.error("Supabase fetch error:", error.message);

  const defaultView: View = searchParams.view === "list" ? "list" : "map";

  return (
    <HomeClient
      stores={(data ?? []) as unknown as StoreForMap[]}
      defaultView={defaultView}
    />
  );
}
