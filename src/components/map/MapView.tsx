"use client";

import { useRef, useState, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import StoreCard from "@/components/store/StoreCard";
import type { PriceRange } from "@/types/store";
import { calcEntryScore } from "@/lib/vibes";

export type StoreForMap = {
  id: string;
  name: string;
  nearest_station: string;
  price_range: PriceRange;
  lat: number | string;
  lng: number | string;
  store_photos: { url: string; is_main: boolean; sort_order: number }[];
  store_tags?: {
    tag_masters: { type: string; slug: string; label_ja: string } | null;
  }[];
};

const DEFAULT_CENTER = { lat: 35.6613, lng: 139.668 };
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

type Props = {
  stores: StoreForMap[];
  activeVibeSlugs?: string[];
  favoritedIds?: string[];
  onFavoriteToggle?: (storeId: string, isFavorited: boolean) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
};

export default function MapView({
  stores,
  favoritedIds = [],
  onFavoriteToggle,
  center = DEFAULT_CENTER,
  zoom = 16,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handlePinClick = useCallback((storeId: string) => {
    setSelectedId(storeId);
    const el = cardRefs.current[storeId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  return (
    // relative コンテナがマップの全高を占め、カルーセルは絶対配置でオーバーレイ
    <div className="relative h-full overflow-hidden">
      {/* 地図：コンテナ全体を埋める */}
      <div className="absolute inset-0">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={center}
            defaultZoom={zoom}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI
            style={{ width: "100%", height: "100%" }}
          >
            {stores.map((store) => (
              <AdvancedMarker
                key={store.id}
                position={{ lat: Number(store.lat), lng: Number(store.lng) }}
                onClick={() => handlePinClick(store.id)}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-pin transition-all duration-150 ${
                    selectedId === store.id
                      ? "bg-clay scale-125"
                      : "bg-ink"
                  }`}
                >
                  <span className="block w-2 h-2 rounded-full bg-paper" />
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      </div>

      {/* カルーセル：マップ下部にオーバーレイ（店舗あり時のみ表示） */}
      {stores.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-sm">
          <div
            className="flex items-center gap-3 px-4 overflow-x-auto snap-x snap-mandatory scroll-pl-4"
            style={{ height: "128px" }}
          >
            {stores.map((store) => {
              const mainPhoto =
                store.store_photos.find((p) => p.is_main) ??
                store.store_photos[0];
              return (
                <div
                  key={store.id}
                  ref={(el) => {
                    cardRefs.current[store.id] = el;
                  }}
                  className="snap-start shrink-0 h-[calc(100%-16px)]"
                >
                  <StoreCard
                    id={store.id}
                    name={store.name}
                    priceRange={store.price_range}
                    mainPhotoUrl={mainPhoto?.url}
                    isSelected={selectedId === store.id}
                    entryScore={calcEntryScore(store.store_tags ?? [])}
                    isFavorited={favoritedIds.includes(store.id)}
                    onFavoriteToggle={onFavoriteToggle}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
