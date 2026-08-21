"use client";

import { useState } from "react";
import type { PriceRange, TagMaster } from "@/types/store";
import { saveStoreTags } from "./actions";

const PRICE_OPTIONS: { value: PriceRange; symbol: string; label: string }[] = [
  { value: 1, symbol: "¥", label: "〜¥3,000" },
  { value: 2, symbol: "¥¥", label: "¥3,000〜¥8,000" },
  { value: 3, symbol: "¥¥¥", label: "¥8,000〜¥20,000" },
  { value: 4, symbol: "¥¥¥¥", label: "¥20,000〜" },
];

type Props = {
  storeId: string;
  allTags: TagMaster[];
  initialSelectedTagIds: number[];
  initialPriceRange: PriceRange | null;
  initialNearestStation: string;
  initialOperatorReview: string;
  initialIsPublished: boolean;
};

export default function StoreTagForm({
  storeId,
  allTags,
  initialSelectedTagIds,
  initialPriceRange,
  initialNearestStation,
  initialOperatorReview,
  initialIsPublished,
}: Props) {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(
    new Set(initialSelectedTagIds)
  );
  const [priceRange, setPriceRange] = useState<PriceRange | null>(initialPriceRange);
  const [nearestStation, setNearestStation] = useState(initialNearestStation);
  const [operatorReview, setOperatorReview] = useState(initialOperatorReview);
  const [isPublished, setIsPublished] = useState(initialIsPublished);

  const byType = (type: string) => allTags.filter((t) => t.type === type);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <form action={saveStoreTags.bind(null, storeId)} className="space-y-6">
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

      {/* AI推定でタグ選択がSet状態で一元管理されるため、実際の送信はhidden inputで行う */}
      {Array.from(selectedTagIds).map((id) => (
        <input key={id} type="hidden" name="tag" value={id} />
      ))}

      <section>
        <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
          価格帯
        </h2>
        <div className="flex flex-wrap gap-3">
          {PRICE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="radio"
                name="priceRange"
                value={opt.value}
                checked={priceRange === opt.value}
                onChange={() => setPriceRange(opt.value)}
              />
              {opt.symbol}
            </label>
          ))}
        </div>
      </section>

      <section>
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
          最寄駅
        </label>
        <input
          name="nearestStation"
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
          name="operatorReview"
          value={operatorReview}
          onChange={(e) => setOperatorReview(e.target.value)}
          rows={4}
          className="w-full rounded-button border border-gray-300 p-3 text-sm"
        />
      </section>

      <section>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="isPublished"
            value="true"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          公開する
        </label>
      </section>

      <button
        type="submit"
        className="w-full h-12 rounded-button bg-clay text-paper text-sm font-bold active:opacity-80"
      >
        保存
      </button>
    </form>
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
