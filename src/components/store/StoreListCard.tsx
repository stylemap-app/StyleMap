import Link from "next/link";
import type { PriceRange } from "@/types/store";

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
  styleTags: string[];
  walkingMinutes: number;
  mainPhotoUrl?: string;
};

export default function StoreListCard({
  id,
  name,
  priceRange,
  styleTags,
  walkingMinutes,
  mainPhotoUrl,
}: Props) {
  return (
    <Link
      href={`/stores/${id}`}
      className="flex flex-col rounded-card overflow-hidden bg-white shadow-card active:opacity-75 transition-opacity"
    >
      {mainPhotoUrl ? (
        <img
          src={mainPhotoUrl}
          alt={name}
          className="w-full object-cover"
          style={{ height: "160px" }}
        />
      ) : (
        <div className="w-full bg-gray-100" style={{ height: "160px" }} />
      )}
      <div className="p-3">
        <p className="text-sm font-medium text-ink leading-snug">{name}</p>
        {styleTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {styleTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-clay/15 text-clay px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-price text-xs text-gray-500">
            {PRICE_SYMBOLS[priceRange]}
          </span>
          <span className="text-xs text-gray-500">
            徒歩約{walkingMinutes}分
          </span>
        </div>
      </div>
    </Link>
  );
}
