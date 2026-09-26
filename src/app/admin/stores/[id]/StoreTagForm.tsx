"use client";

import { useRef, useState } from "react";
import type { PriceRange, TagMaster } from "@/types/store";
import { PRICE_RANGE_OPTIONS } from "@/lib/priceRange";
import { saveStoreTags } from "./actions";

type Props = {
  storeId: string;
  allTags: TagMaster[];
  initialSelectedTagIds: number[];
  initialPriceRange: PriceRange | null;
  initialNearestStation: string;
  initialOperatorReview: string;
};

type Banner = { type: "success" | "error"; message: string; note?: string };

export default function StoreTagForm({
  storeId,
  allTags,
  initialSelectedTagIds,
  initialPriceRange,
  initialNearestStation,
  initialOperatorReview,
}: Props) {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(
    new Set(initialSelectedTagIds)
  );
  const [priceRange, setPriceRange] = useState<PriceRange | null>(initialPriceRange);
  const [nearestStation, setNearestStation] = useState(initialNearestStation);
  const [operatorReview, setOperatorReview] = useState(initialOperatorReview);
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const byType = (type: string) => allTags.filter((t) => t.type === type);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    setIsSaving(true);
    setBanner(null);
    try {
      const result = await saveStoreTags(storeId, {
        tagIds: Array.from(selectedTagIds),
        priceRange,
        nearestStation,
        operatorReview,
      });
      if (!result.ok) {
        setBanner({ type: "error", message: result.message });
        return;
      }
      const next: Banner = result.published
        ? { type: "success", message: "保存しました ✓ 調査済み・公開しました" }
        : {
            type: "success",
            message: "保存しました ✓（調査済みにしました）",
            note: "公開には系統タグと価格帯が必要です",
          };
      setBanner(next);
      bannerTimer.current = setTimeout(() => setBanner(null), 2500);
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "保存に失敗しました",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {banner && banner.type === "success" && (
        <div className="rounded-button bg-green-600 text-white text-sm font-medium px-4 py-2.5 text-center">
          {banner.message}
          {banner.note && (
            <div className="text-[11px] font-normal text-green-50 mt-0.5">{banner.note}</div>
          )}
        </div>
      )}
      {banner && banner.type === "error" && (
        <div className="rounded-button bg-red-600 text-white text-sm px-4 py-2.5 flex items-start justify-between gap-3">
          <p className="flex-1">{banner.message}</p>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="shrink-0 font-bold active:opacity-70"
            aria-label="エラーを閉じる"
          >
            ✕
          </button>
        </div>
      )}

      <TagCheckboxGroup
        title="系統タグ"
        tags={byType("style")}
        selectedIds={selectedTagIds}
        onToggle={toggleTag}
      />
      <TagCheckboxGroup
        title="商品カテゴリタグ"
        tags={byType("category")}
        selectedIds={selectedTagIds}
        onToggle={toggleTag}
      />
      <TagCheckboxGroup
        title="雰囲気タグ"
        badge="現地確認が必要"
        tags={byType("vibe")}
        selectedIds={selectedTagIds}
        onToggle={toggleTag}
      />
      <TagCheckboxGroup
        title="客層タグ"
        badge="現地確認が必要"
        tags={[...byType("gender"), ...byType("age_group")]}
        selectedIds={selectedTagIds}
        onToggle={toggleTag}
      />

      <section>
        <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
          価格帯
        </h2>
        <div className="flex flex-wrap gap-3">
          {PRICE_RANGE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="radio"
                name="priceRange"
                value={opt.value}
                checked={priceRange === opt.value}
                onChange={() => setPriceRange(opt.value)}
              />
              {opt.symbol}&ensp;{opt.amountLabel}
            </label>
          ))}
        </div>
      </section>

      <section>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
          最寄駅
        </label>
        <input
          value={nearestStation}
          onChange={(e) => setNearestStation(e.target.value)}
          className="w-full h-10 rounded-button border border-gray-300 px-3 text-sm"
        />
      </section>

      <section>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
          スタッフより一言
        </label>
        <textarea
          value={operatorReview}
          onChange={(e) => setOperatorReview(e.target.value)}
          rows={4}
          className="w-full rounded-button border border-gray-300 p-3 text-sm"
        />
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full h-12 rounded-button bg-clay text-paper text-sm font-bold disabled:opacity-40 active:opacity-80"
      >
        {isSaving ? "保存中..." : "保存"}
      </button>
    </div>
  );
}

function TagCheckboxGroup({
  title,
  badge,
  tags,
  selectedIds,
  onToggle,
}: {
  title: string;
  badge?: string;
  tags: TagMaster[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <section>
      <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2 flex items-center gap-1.5">
        {title}
        {badge && (
          <span className="normal-case text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium tracking-normal">
            {badge}
          </span>
        )}
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <label
            key={tag.id}
            className="flex items-center gap-1.5 text-xs bg-gray-100 px-2.5 py-1.5 rounded-full text-ink"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(tag.id)}
              onChange={() => onToggle(tag.id)}
            />
            {tag.label_ja}
          </label>
        ))}
      </div>
    </section>
  );
}
