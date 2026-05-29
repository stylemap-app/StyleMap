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
  mainPhotoUrl?: string;
  isSelected?: boolean;
};

export default function StoreCard({
  id,
  name,
  priceRange,
  mainPhotoUrl,
  isSelected,
}: Props) {
  return (
    <Link
      href={`/stores/${id}`}
      className={`flex flex-col w-36 h-full rounded-card overflow-hidden bg-white shadow-card border-2 transition-colors ${
        isSelected ? "border-clay" : "border-transparent"
      }`}
    >
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
      <div className="px-2 py-1.5 flex-1 flex flex-col justify-center">
        <p className="text-[11px] font-medium text-ink leading-tight line-clamp-2">
          {name}
        </p>
        <p className="font-price text-[10px] text-gray-500 mt-0.5">
          {PRICE_SYMBOLS[priceRange]}
        </p>
      </div>
    </Link>
  );
}
