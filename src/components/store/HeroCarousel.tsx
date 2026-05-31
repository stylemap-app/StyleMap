"use client";

import { useState, useRef } from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  is_main: boolean;
  sort_order: number;
};

export default function HeroCarousel({
  photos,
  storeName,
}: {
  photos: Photo[];
  storeName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (photos.length === 0) {
    return <div className="w-full bg-gray-100" style={{ height: "280px" }} />;
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {photos.map((photo, i) => (
          // relative + 固定高で fill モードの Image を受け取る
          <div key={photo.id} className="relative flex-none w-full snap-start" style={{ height: "280px" }}>
            <ImageWithFallback
              src={photo.url}
              alt={`${storeName}${photo.caption ? ` - ${photo.caption}` : ""}`}
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
