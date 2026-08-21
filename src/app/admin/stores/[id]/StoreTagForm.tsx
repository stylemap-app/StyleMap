"use client";

import { useState, useTransition } from "react";
import type { PriceRange, TagMaster } from "@/types/store";
import type { TagInferenceResult } from "@/lib/claude/inferTags";
import { saveStoreTags, inferStoreTagsAction } from "./actions";

const PRICE_OPTIONS: { value: PriceRange; symbol: string; label: string }[] = [
  { value: 1, symbol: "¥", label: "〜¥3,000" },
  { value: 2, symbol: "¥¥", label: "¥3,000〜¥8,000" },
  { value: 3, symbol: "¥¥¥", label: "¥8,000〜¥20,000" },
  { value: 4, symbol: "¥¥¥¥", label: "¥20,000〜" },
];

const CONFIDENCE_LABEL: Record<TagInferenceResult["confidence"], string> = {
  high: "高",
  medium: "中",
  low: "低",
};

// AIが客観的に分類してよいタグ種別（系統・商品カテゴリ）。
// 雰囲気・客層は実際に来店しないと判断できない主観的評価のため対象外
const AI_MANAGED_TAG_TYPES = ["style", "category"];

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

  const [isInferring, startInferTransition] = useTransition();
  const [inferError, setInferError] = useState<string | null>(null);
  const [inferResult, setInferResult] = useState<TagInferenceResult | null>(null);

  const byType = (type: string) => allTags.filter((t) => t.type === type);
  const slugToId = new Map(allTags.map((t) => [t.slug, t.id]));
  // AI管轄（系統・商品カテゴリ）のタグID集合。反映時にこの範囲だけを
  // 上書きし、雰囲気タグ・客層タグなど人間が付けた選択は保持する
  const aiManagedTagIds = new Set(
    allTags.filter((t) => AI_MANAGED_TAG_TYPES.includes(t.type)).map((t) => t.id)
  );

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInfer = () => {
    setInferError(null);
    startInferTransition(async () => {
      try {
        const result = await inferStoreTagsAction(storeId);
        if (!result) {
          setInferError(
            "AI推定に失敗しました（Places情報が取得できないか、APIエラーです）"
          );
          return;
        }
        setInferResult(result);

        // あくまで初期値の提案としてフォームへ反映する。DBへは書き込まない。
        // 保存するかどうか・修正するかどうかは人間が判断して「保存」を押す。
        // AIが管轄しない雰囲気タグ・客層タグの選択は変更しない
        setSelectedTagIds((prev) => {
          const next = new Set(prev);
          aiManagedTagIds.forEach((id) => next.delete(id));
          for (const slug of [...result.style_tags, ...result.category_tags]) {
            const id = slugToId.get(slug);
            if (id !== undefined) next.add(id);
          }
          return next;
        });

        // 価格帯はPlaces APIの実データ（priceLevel）がある場合のみ反映する。
        // データがない場合（null）は既存の入力値を変更せず残す
        if (result.price_range !== null) {
          setPriceRange(result.price_range);
        }
      } catch (err) {
        setInferError(err instanceof Error ? err.message : "AI推定に失敗しました");
      }
    });
  };

  return (
    <form action={saveStoreTags.bind(null, storeId)} className="space-y-6">
      <section className="rounded-card bg-clay/5 border border-clay/20 p-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink">AIでタグを推定</p>
            <p className="text-[10px] text-gray-500 mt-0.5">推定コスト: 約0.5円</p>
          </div>
          <button
            type="button"
            onClick={handleInfer}
            disabled={isInferring}
            className="text-xs px-3 py-1.5 rounded-button bg-clay text-paper shrink-0 disabled:opacity-40 active:opacity-80"
          >
            {isInferring ? "推定中..." : "AIでタグを推定"}
          </button>
        </div>

        <p className="text-[10px] text-gray-500">
          系統・商品カテゴリ・価格帯のみ推定します。雰囲気タグは実際に確認して付けてください。
        </p>

        {inferError && <p className="text-[11px] text-red-600">{inferError}</p>}

        {inferResult && (
          <div className="text-[11px] text-gray-600 bg-white rounded-button p-2 space-y-0.5">
            <p>
              確信度:{" "}
              <span className="font-medium text-ink">
                {CONFIDENCE_LABEL[inferResult.confidence]}
              </span>
            </p>
            <p>理由: {inferResult.reason}</p>
            {inferResult.price_range === null && (
              <p className="text-gray-400">
                価格帯: Googleの価格帯データが見つからなかったため変更していません
              </p>
            )}
            <p className="text-gray-400">
              系統タグ・商品カテゴリタグ
              {inferResult.price_range !== null && "・価格帯"}
              を下のフォームに反映しました（雰囲気タグ・客層タグは変更していません）。保存前に内容を確認・修正してください。
            </p>
          </div>
        )}
      </section>

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
