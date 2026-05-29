import { supabase } from "@/lib/supabase";
import MapView from "@/components/map/MapView";
import type { StoreForMap } from "@/components/map/MapView";

export default async function Home() {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, name, nearest_station, price_range, lat, lng, store_photos(url, is_main, sort_order)"
    )
    .eq("is_published", true)
    .order("name");

  if (error) {
    console.error("Supabase fetch error:", error.message);
  }

  return <MapView stores={(data ?? []) as unknown as StoreForMap[]} />;
}
