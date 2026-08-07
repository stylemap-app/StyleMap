"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import ClothesFavoriteButton from "@/components/auth/ClothesFavoriteButton";

type ClothFav = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
};

export default function FavoriteClothesTab() {
  const supabase = useMemo(() => createClient(), []);
  const [clothes, setClothes] = useState<ClothFav[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("clothes_favorites")
        .select(
          "clothes_id, created_at, clothes(id, name, price, image_url, category)"
        )
        .order("created_at", { ascending: false });

      const items = (data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((f: any) => f.clothes)
        .filter(Boolean) as ClothFav[];

      setClothes(items);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 p-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (clothes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-300"
          aria-hidden
        >
          <path
            d="M3 8l3-4h3a3 3 0 006 0h3l3 4-3 2v10H6V10L3 8z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm text-gray-400">まだお気に入りの服がありません</p>
        <Link
          href="/?tab=clothes"
          className="h-11 px-5 rounded-button bg-ink text-paper text-sm font-medium flex items-center active:opacity-80"
        >
          服を探す
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 p-3 pb-[calc(56px+2rem+env(safe-area-inset-bottom))]">
      {clothes.map((cloth) => (
        <div key={cloth.id} className="relative">
          <Link href={`/clothes/${cloth.id}`} className="block active:opacity-75">
            <div
              className="relative rounded-lg overflow-hidden bg-gray-100"
              style={{ aspectRatio: "1 / 1" }}
            >
              <ImageWithFallback
                src={cloth.image_url}
                alt={cloth.name}
                sizes="(max-width: 640px) 33vw, 200px"
              />
            </div>
            <div className="mt-1 px-0.5">
              <p className="text-[11px] text-ink font-medium leading-tight line-clamp-2">
                {cloth.name}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                ¥{cloth.price.toLocaleString()}
              </p>
            </div>
          </Link>
          <div className="absolute top-0.5 right-0.5 z-10">
            <ClothesFavoriteButton
              clothesId={cloth.id}
              initialFavorited={true}
              size="sm"
              onActionComplete={fetchFavorites}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
