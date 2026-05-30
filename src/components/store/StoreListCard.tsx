// BEFORE: name / styleTags / price + walkingMinutes
// AFTER:  name / styleTags / entryDots + vibeBadges / price + walkingMinutes

import Link from "next/link";
import type { PriceRange } from "@/types/store";
import { VIBE_BADGE_LABEL } from "@/lib/vibes";

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
  entryScore: number;
  vibeBadges: string[];
  activeVibeSlugs: string[];
};

export default function StoreListCard({
  id,
  name,
  priceRange,
  styleTags,
  walkingMinutes,
  mainPhotoUrl,
  entryScore,
  vibeBadges,
  activeVibeSlugs,
}: Props) {
  const showVibeRow = entryScore > 0 || vibeBadges.length > 0;

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

        {/* NEW: entry score dots + vibe badge chips */}
        {showVibeRow && (
          <div className="flex items-center justify-between mt-2">
            {entryScore > 0 ? (
              <div className="flex items-center gap-0.5" aria-label={`入りやすさ ${entryScore}/5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= entryScore ? "bg-clay" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <span />
            )}

            {vibeBadges.length > 0 && (
              <div className="flex gap-1">
                {vibeBadges.map((slug) => {
                  const isActive = activeVibeSlugs.includes(slug);
                  return (
                    <span
                      key={slug}
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isActive
                          ? "bg-clay text-paper"
                          : "bg-clay/15 text-clay"
                      }`}
                    >
                      {VIBE_BADGE_LABEL[slug]}
                    </span>
                  );
                })}
              </div>
            )}
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
