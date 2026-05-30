import Link from "next/link";
import type { PriceRange } from "@/types/store";
import FavoriteButton from "@/components/auth/FavoriteButton";

const PRICE_SYMBOLS: Record<PriceRange, string> = {
  1: "¥",
  2: "¥¥",
  3: "¥¥¥",
  4: "¥¥¥¥",
};

type Props = {
  id: string;
  name: string;
  priceRange: PriceRange;
  mainPhotoUrl?: string;
  isSelected?: boolean;
  entryScore: number;
  isFavorited?: boolean;
  onFavoriteToggle?: (storeId: string, isFavorited: boolean) => void;
};

export default function StoreCard({
  id,
  name,
  priceRange,
  mainPhotoUrl,
  isSelected,
  entryScore,
  isFavorited = false,
  onFavoriteToggle,
}: Props) {
  return (
    <Link
      href={`/stores/${id}`}
      className={`flex flex-col w-36 h-full rounded-card overflow-hidden bg-white shadow-card border-2 transition-colors ${
        isSelected ? "border-clay" : "border-transparent"
      }`}
    >
      {/* 写真エリア（ハートをオーバーレイ） */}
      <div className="relative">
        {mainPhotoUrl ? (
          <img
            src={mainPhotoUrl}
            alt={name}
            className="w-full h-[72px] object-cover"
            style={{ height: "72px" }}
          />
        ) : (
          <div className="w-full h-[72px] bg-gray-100" />
        )}
        <div className="absolute top-1 right-1">
          <FavoriteButton
            storeId={id}
            initialFavorited={isFavorited}
            size="sm"
            onToggle={onFavoriteToggle}
          />
        </div>
      </div>

      <div className="px-2 py-1.5 flex-1 flex flex-col justify-center">
        <p className="text-[11px] font-medium text-ink leading-tight line-clamp-2">
          {name}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="font-price text-[10px] text-gray-500">
            {PRICE_SYMBOLS[priceRange]}
          </p>
          {entryScore > 0 && (
            <div
              className="flex items-center gap-[2px]"
              aria-label={`入りやすさ ${entryScore}/5`}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-[5px] h-[5px] rounded-full ${
                    i <= entryScore ? "bg-clay" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
