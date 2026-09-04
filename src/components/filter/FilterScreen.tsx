"use client";

import { useState, useEffect } from "react";
import type { TagMaster } from "@/types/store";
import { EMPTY_FILTER, type FilterState } from "@/lib/filter";
import { PRICE_RANGE_OPTIONS } from "@/lib/priceRange";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filter: FilterState) => void;
  tagMasters: TagMaster[];
  initialFilter: FilterState;
  getPreviewCount: (draft: FilterState) => number;
};

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function FilterScreen({
  isOpen,
  onClose,
  onApply,
  tagMasters,
  initialFilter,
  getPreviewCount,
}: Props) {
  const [draft, setDraft] = useState<FilterState>(initialFilter);

  useEffect(() => {
    if (isOpen) setDraft(initialFilter);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const styleTags = tagMasters.filter((t) => t.type === "style");
  const vibeTags  = tagMasters.filter((t) => t.type === "vibe");
  const genderTags = tagMasters.filter((t) => t.type === "gender");

  const previewCount = getPreviewCount(draft);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-paper flex flex-col"
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 border-b border-gray-200 shrink-0 h-12">
        <button
          onClick={onClose}
          className="p-1 -ml-1 text-ink"
          aria-label="閉じる"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-ink">ジャンルを選ぶ</h2>
        <button
          onClick={() => setDraft(EMPTY_FILTER)}
          className="text-xs text-gray-500 underline underline-offset-2 py-2 px-1"
        >
          リセット
        </button>
      </div>

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-7">

        {/* スタイル系統 */}
        <section>
          <h3 className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-3">
            スタイル系統
          </h3>
          <div className="flex flex-wrap gap-2">
            {styleTags.map((tag) => {
              const active = draft.styles.includes(tag.slug);
              return (
                <button
                  key={tag.slug}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      styles: toggleItem(d.styles, tag.slug),
                    }))
                  }
                  className={`h-9 px-3.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? "bg-clay text-paper"
                      : "bg-white border border-gray-300 text-ink"
                  }`}
                >
                  {tag.label_ja}
                </button>
              );
            })}
          </div>
        </section>

        {/* 価格帯 */}
        <section>
          <h3 className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-4">
            価格帯
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {PRICE_RANGE_OPTIONS.map(({ value, symbol, description }) => {
              const active = draft.prices.includes(value);
              return (
                <div key={value} className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        prices: toggleItem(d.prices, value),
                      }))
                    }
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-colors ${
                      active
                        ? "bg-clay text-paper border-clay"
                        : "bg-white text-ink border-gray-300"
                    }`}
                  >
                    {symbol}
                  </button>
                  <span className="text-[9px] text-gray-500 text-center leading-tight">
                    {description}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 雰囲気・こだわり */}
        <section>
          <h3 className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-3">
            雰囲気・こだわり
          </h3>
          <div className="flex flex-wrap gap-2">
            {vibeTags.map((tag) => {
              const active = draft.vibes.includes(tag.slug);
              return (
                <button
                  key={tag.slug}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      vibes: toggleItem(d.vibes, tag.slug),
                    }))
                  }
                  className={`h-9 px-3.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? "bg-clay text-paper"
                      : "bg-white border border-gray-300 text-ink"
                  }`}
                >
                  {tag.label_ja}
                </button>
              );
            })}
          </div>
        </section>

        {/* 客層 */}
        <section>
          <h3 className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-3">
            客層
          </h3>
          <div className="flex gap-2">
            {genderTags.map((tag) => {
              const active = draft.gender === tag.slug;
              return (
                <button
                  key={tag.slug}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      gender: d.gender === tag.slug ? null : tag.slug,
                    }))
                  }
                  className={`h-9 px-4 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? "bg-clay text-paper"
                      : "bg-white border border-gray-300 text-ink"
                  }`}
                >
                  {tag.label_ja}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* 絞り込みボタン（BottomNavの上に固定） */}
      <div className="shrink-0 px-4 py-3 bg-paper border-t border-gray-100">
        <button
          onClick={handleApply}
          className={`w-full h-12 rounded-button text-sm font-semibold transition-colors ${
            previewCount > 0
              ? "bg-clay text-paper active:opacity-80"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {previewCount > 0
            ? `この条件で絞り込む（${previewCount}件）`
            : "条件に合う店舗がありません"}
        </button>
      </div>
    </div>
  );
}
