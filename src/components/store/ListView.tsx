import StoreListCard from "./StoreListCard";
import PoweredByGoogle from "./PoweredByGoogle";
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

type RatingEntry = { avg: number; count: number };

type Props = {
  stores: StoreForMap[];
  activeVibeSlugs: string[];
  favoritedIds: string[];
  onFavoriteToggle: (storeId: string, isFavorited: boolean) => void;
  ratingMap?: Record<string, RatingEntry>;
};

export default function ListView({
  stores,
  activeVibeSlugs,
  favoritedIds,
  onFavoriteToggle,
  ratingMap = {},
}: Props) {
  return (
    <div className="h-full overflow-y-auto overscroll-contain bg-paper">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
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
              avgRating={ratingMap[store.id]?.avg}
              isFavorited={favoritedIds.includes(store.id)}
              onFavoriteToggle={onFavoriteToggle}
            />
          );
        })}
      </div>
      {stores.some((s) => s.is_real_store) && <PoweredByGoogle />}
    </div>
  );
}
