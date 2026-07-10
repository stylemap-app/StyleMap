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
  areaName: string;
  onOpenAreaSelect: () => void;
};

export default function FilterBar({
  filter,
  activeCount,
  onToggleVibe,
  onOpenSheet,
  areaName,
  onOpenAreaSelect,
}: Props) {
  return (
    <div className="overflow-x-auto bg-paper border-b border-gray-100">
      <div className="flex items-center gap-2 px-3 py-2 w-max min-w-full">

        {/* エリアチップ */}
        <button
          onClick={onOpenAreaSelect}
          className="flex-none flex items-center gap-1 h-10 px-3 rounded-full bg-ink text-paper text-xs font-semibold whitespace-nowrap"
        >
          <svg width="11" height="13" viewBox="0 0 11 14" fill="none" aria-hidden>
            <path
              d="M5.5 1C3.015 1 1 3.015 1 5.5c0 3.375 4.5 7.5 4.5 7.5S10 8.875 10 5.5C10 3.015 7.985 1 5.5 1zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
              fill="currentColor"
            />
          </svg>
          {areaName}
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* クイックフィルター */}
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

        {/* 絞り込みボタン */}
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
