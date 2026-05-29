"use client";

import { useRef, useState, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import StoreCard from "@/components/store/StoreCard";
import type { PriceRange } from "@/types/store";

export type StoreForMap = {
  id: string;
  name: string;
  nearest_station: string;
  price_range: PriceRange;
  lat: number | string;
  lng: number | string;
  store_photos: { url: string; is_main: boolean; sort_order: number }[];
};

const SHIMOKITAZAWA = { lat: 35.6613, lng: 139.668 };
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function MapView({ stores }: { stores: StoreForMap[] }) {
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
    <div className="flex flex-col overflow-hidden h-[100dvh]">
      {/* 地図エリア：80% */}
      <div className="h-[80dvh]">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={SHIMOKITAZAWA}
            defaultZoom={16}
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

      {/* カルーセルエリア：20% */}
      <div className="h-[20dvh] min-h-[120px] bg-paper flex items-center gap-3 px-4 overflow-x-auto snap-x snap-mandatory">
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
