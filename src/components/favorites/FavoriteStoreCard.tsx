import Link from "next/link";
import type { PriceRange } from "@/types/store";
import type { FavoriteStore } from "@/lib/favorites";
import FavoriteButton from "@/components/auth/FavoriteButton";

const PRICE_SYMBOLS: Record<PriceRange, string> = {
  1: "¥",
  2: "¥¥",
  3: "¥¥¥",
  4: "¥¥¥¥",
};

type Props = {
  store: FavoriteStore;
  onActionComplete?: () => void;
};

export default function FavoriteStoreCard({ store, onActionComplete }: Props) {
  return (
    <div className="relative rounded-card overflow-hidden bg-white shadow-card">
      <Link href={`/stores/${store.id}`} className="flex flex-col">
        {store.mainPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.mainPhotoUrl}
            alt={store.name}
            className="w-full aspect-[4/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[4/3] bg-gray-100" />
        )}
        <div className="px-2.5 py-2">
          <p className="text-[12px] font-medium text-ink leading-tight line-clamp-2">
            {store.name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="font-price text-[11px] text-gray-500">
              {PRICE_SYMBOLS[store.priceRange]}
            </span>
            {store.entryScore > 0 && (
              <div
                className="flex items-center gap-[2px]"
                aria-label={`入りやすさ ${store.entryScore}/5`}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-[5px] h-[5px] rounded-full ${
                      i <= store.entryScore ? "bg-clay" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute top-1.5 right-1.5">
        <FavoriteButton
          storeId={store.id}
          initialFavorited={true}
          size="sm"
          onActionComplete={onActionComplete}
        />
      </div>
    </div>
  );
}
