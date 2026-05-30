import StoreListCard from "./StoreListCard";
import type { StoreForMap } from "@/components/map/MapView";
import type { PriceRange } from "@/types/store";
import { calcEntryScore, getVibeBadges } from "@/lib/vibes";

const STATION_LAT = 35.6613;
const STATION_LNG = 139.668;

function calcWalkingMinutes(lat: number, lng: number): number {
  const dLat = (lat - STATION_LAT) * 111000;
  const dLng = (lng - STATION_LNG) * 91000;
  const distance = Math.sqrt(dLat ** 2 + dLng ** 2);
  return Math.max(1, Math.ceil(distance / 80));
}

type Props = {
  stores: StoreForMap[];
  activeVibeSlugs: string[];
};

export default function ListView({ stores, activeVibeSlugs }: Props) {
  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {stores.map((store) => {
          const mainPhoto =
            store.store_photos.find((p) => p.is_main) ??
            store.store_photos[0];
          const storeTags = store.store_tags ?? [];
          const styleTags = storeTags
            .filter((st) => st.tag_masters?.type === "style")
            .map((st) => st.tag_masters!.label_ja);
          const minutes = calcWalkingMinutes(
            Number(store.lat),
            Number(store.lng)
          );

          return (
            <StoreListCard
              key={store.id}
              id={store.id}
              name={store.name}
              priceRange={store.price_range as PriceRange}
              styleTags={styleTags}
              walkingMinutes={minutes}
              mainPhotoUrl={mainPhoto?.url}
              entryScore={calcEntryScore(storeTags)}
              vibeBadges={getVibeBadges(storeTags)}
              activeVibeSlugs={activeVibeSlugs}
            />
          );
        })}
      </div>
    </div>
  );
}
