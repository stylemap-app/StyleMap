"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import ClothesFavoriteButton from "@/components/auth/ClothesFavoriteButton";

export type ClothForGrid = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
};

type Props = {
  clothes: ClothForGrid[];
};

export default function ClothesView({ clothes }: Props) {
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const fetchFavorites = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setFavoritedIds([]);
        setFavoritesLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("clothes_favorites")
        .select("clothes_id");
      setFavoritedIds((data ?? []).map((f) => f.clothes_id as string));
      setFavoritesLoaded(true);
    };

    fetchFavorites();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchFavorites();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (clothes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
        <p className="text-sm">服がまだ登録されていません</p>
      </div>
    );
  }

  // favoritesLoaded が true になったタイミングで key を変えて
  // ClothesFavoriteButton を再マウントし、正しい初期状態を反映する
  const favKey = favoritesLoaded ? "loaded" : "loading";

  return (
    <div className="h-full overflow-y-auto overscroll-contain bg-paper">
      <div className="grid grid-cols-3 gap-2 p-3 pb-4">
        {clothes.map((cloth) => (
          <div key={cloth.id} className="relative">
            <Link
              href={`/clothes/${cloth.id}`}
              className="block active:opacity-75"
            >
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
                key={`${cloth.id}-${favKey}`}
                clothesId={cloth.id}
                initialFavorited={favoritedIds.includes(cloth.id)}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
