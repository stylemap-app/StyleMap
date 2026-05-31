"use client";

import { useState, useEffect } from "react";
import type { TagMaster, PriceRange } from "@/types/store";
import { EMPTY_FILTER, type FilterState } from "@/lib/filter";

const PRICE_OPTIONS: { value: PriceRange; symbol: string; label: string }[] = [
  { value: 1, symbol: "¥", label: "〜¥3,000" },
  { value: 2, symbol: "¥¥", label: "¥3,000〜¥8,000" },
  { value: 3, symbol: "¥¥¥", label: "¥8,000〜¥20,000" },
  { value: 4, symbol: "¥¥¥¥", label: "¥20,000〜" },
];

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

export default function FilterSheet({
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
  const vibeTags = tagMasters.filter((t) => t.type === "vibe");
  const genderTags = tagMasters.filter((t) => t.type === "gender");

  const previewCount = getPreviewCount(draft);
  const isDirty =
    JSON.stringify(draft) !== JSON.stringify(initialFilter);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTER);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[85dvh] rounded-t-2xl bg-paper overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-9 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 shrink-0 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-ink">絞り込み</h2>
          <button
            onClick={handleReset}
            className="min-h-[44px] px-3 flex items-center text-xs text-gray-500 underline-offset-2 underline active:opacity-60"
          >
            リセット
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-6">

          {/* スタイル系統 */}
          <section>
            <h3 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-3">
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
                    className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
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
            <h3 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-3">
              価格帯
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PRICE_OPTIONS.map(({ value, symbol, label }) => {
                const active = draft.prices.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        prices: toggleItem(d.prices, value),
                      }))
                    }
                    className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-colors ${
                      active
                        ? "border-clay bg-clay/10"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span
                      className={`text-sm font-price font-bold ${
                        active ? "text-clay" : "text-ink"
                      }`}
                    >
                      {symbol}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 雰囲気・こだわり */}
          <section>
            <h3 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-3">
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
                    className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                      active
                        ? "bg-ink text-paper"
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
          <section className="pb-2">
            <h3 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-3">
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
                    className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                      active
                        ? "bg-ink text-paper"
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

        {/* Apply button */}
        <div className="shrink-0 px-4 py-4 border-t border-gray-100 bg-paper pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleApply}
            className="w-full h-12 rounded-button bg-ink text-paper text-sm font-medium active:opacity-80 disabled:opacity-40"
            disabled={!isDirty && previewCount === 0}
          >
            {previewCount > 0
              ? `この条件で絞り込む（${previewCount}件）`
              : isDirty
              ? "条件に合う店舗がありません"
              : `この条件で絞り込む`}
          </button>
        </div>
      </div>
    </>
  );
}
