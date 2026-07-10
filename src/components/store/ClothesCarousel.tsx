"use client";

import ImageWithFallback from "@/components/ui/ImageWithFallback";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

export default function ClothesCarousel({
  photos,
  storeName,
}: {
  photos: Photo[];
  storeName: string;
}) {
  if (photos.length === 0) return null;

  return (
    <div
      className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-4 -mx-4 px-4"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {photos.map((photo) => (
        /* 将来フェーズ11で服詳細ページへ遷移するボタン（現時点は非活性） */
        <button
          key={photo.id}
          className="relative flex-none snap-start w-36 rounded-xl overflow-hidden bg-gray-100 focus:outline-none"
          style={{ height: "192px" }}
          tabIndex={-1}
          aria-hidden
        >
          <ImageWithFallback
            src={photo.url}
            alt={`${storeName} - ${photo.caption ?? "服"}`}
            sizes="144px"
          />
          {/* ハートアイコン（将来実装、見た目のみ） */}
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
            >
              <path
                d="M10 17S3 12.5 3 8a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"
                stroke="#D4714A"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}
