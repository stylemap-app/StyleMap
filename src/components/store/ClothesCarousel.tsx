"use client";

import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import ClothesFavoriteButton from "@/components/auth/ClothesFavoriteButton";

type Cloth = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
};

type Props = {
  clothes: Cloth[];
  storeName: string;
  initialFavoritedIds?: string[];
};

export default function ClothesCarousel({
  clothes,
  storeName,
  initialFavoritedIds = [],
}: Props) {
  if (clothes.length === 0) return null;

  return (
    <div
      className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-4 -mx-4 px-4"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {clothes.map((cloth) => (
        <div key={cloth.id} className="relative flex-none snap-start w-36">
          <Link
            href={`/clothes/${cloth.id}`}
            className="relative block rounded-xl overflow-hidden bg-gray-100 active:opacity-80"
            style={{ height: "192px" }}
          >
            <ImageWithFallback
              src={cloth.image_url}
              alt={`${storeName} - ${cloth.name}`}
              sizes="144px"
            />
          </Link>
          <div className="absolute top-1 right-1 z-10">
            <ClothesFavoriteButton
              clothesId={cloth.id}
              initialFavorited={initialFavoritedIds.includes(cloth.id)}
              size="sm"
            />
          </div>
          <div className="mt-1.5 px-0.5">
            <p className="text-[11px] text-ink font-medium leading-tight line-clamp-2">
              {cloth.name}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              ¥{cloth.price.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
