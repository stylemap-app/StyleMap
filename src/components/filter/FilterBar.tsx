"use client";

import type { FilterState } from "@/lib/filter";

const QUICK_VIBES = [
  { slug: "easy-solo", label: "一人でOK" },
  { slug: "beginner-friendly", label: "初心者向け" },
];

type Props = {
  filter: FilterState;
  activeCount: number;
  onToggleVibe: (slug: string) => void;
  onOpenSheet: () => void;
};

export default function FilterBar({
  filter,
  activeCount,
  onToggleVibe,
  onOpenSheet,
}: Props) {
  return (
    <div className="overflow-x-auto bg-paper border-b border-gray-100">
      <div className="flex items-center gap-2 px-3 py-2 w-max min-w-full">
      <div className="flex items-center gap-2 flex-none">
        {QUICK_VIBES.map(({ slug, label }) => {
          const active = filter.vibes.includes(slug);
          return (
            <button
              key={slug}
              onClick={() => onToggleVibe(slug)}
              className={`h-10 px-3.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-clay text-paper"
                  : "bg-white border border-gray-300 text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <button
        onClick={onOpenSheet}
        className="flex-none flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-white border border-gray-300 text-ink text-xs font-medium whitespace-nowrap relative"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2 4h12M4 8h8M6 12h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        絞り込み
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-clay text-paper text-[9px] font-bold">
            {activeCount}
          </span>
        )}
      </button>
      </div>
    </div>
  );
}
