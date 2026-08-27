"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PriceRange, TagMaster } from "@/types/store";
import {
  SURVEY_STATUS_LABEL,
  SURVEY_STATUS_BADGE_CLASS,
  type SurveyStatus,
} from "@/lib/surveyStatus";
import { haversineMeters, formatDistance, type LatLng } from "./distance";
import StoreListModal, { type StatusFilter } from "./StoreListModal";
import { saveSurveyResult } from "./actions";

export type SurveyStore = {
  id: string;
  name: string;
  areaName: string;
  lat: number;
  lng: number;
  surveyStatus: SurveyStatus;
  selectedTagIds: number[];
  priceRange: PriceRange | null;
  operatorReview: string;
};

const PRICE_OPTIONS: { value: PriceRange; symbol: string }[] = [
  { value: 1, symbol: "¥" },
  { value: 2, symbol: "¥¥" },
  { value: 3, symbol: "¥¥¥" },
  { value: 4, symbol: "¥¥¥¥" },
];

type SortMode = "distance" | "name";

export default function SurveyClient({
  stores: initialStores,
  allTags,
}: {
  stores: SurveyStore[];
  allTags: TagMaster[];
}) {
  // 保存のたびにサーバーへ再取得しに行かず、ローカル状態を直接更新する
  // （現地での連続入力を優先し、通信は保存の書き込みだけに絞るため）
  const [stores, setStores] = useState(initialStores);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(
    initialStores[0]?.id ?? null
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const filteredStores = useMemo(() => {
    let list = stores.filter((s) => {
      if (statusFilter === "all") return true;
      return s.surveyStatus === statusFilter;
    });
    if (sortMode === "distance" && userLocation) {
      list = [...list].sort(
        (a, b) =>
          haversineMeters(userLocation, { lat: a.lat, lng: a.lng }) -
          haversineMeters(userLocation, { lat: b.lat, lng: b.lng })
      );
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
    }
    return list;
  }, [stores, statusFilter, sortMode, userLocation]);

  const currentIndex = filteredStores.findIndex((s) => s.id === currentStoreId);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentStore = filteredStores[effectiveIndex] ?? null;

  // 店舗を切り替えるたびに、その店舗自身の現在値でフォームを初期化する
  useEffect(() => {
    if (!currentStore) return;
    setSelectedTagIds(new Set(currentStore.selectedTagIds));
    setPriceRange(currentStore.priceRange);
    setMemo(currentStore.operatorReview);
    setSaveError(null);
  }, [currentStore?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const byType = (type: string) => allTags.filter((t) => t.type === type);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const requestLocation = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("この端末では位置情報が使えません（名前順で表示します）");
      setSortMode("name");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortMode("distance");
      },
      () => {
        setGeoError("位置情報を取得できませんでした（名前順で表示します）");
        setSortMode("name");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const goTo = (index: number) => {
    if (filteredStores.length === 0) return;
    const clamped = Math.max(0, Math.min(filteredStores.length - 1, index));
    setCurrentStoreId(filteredStores[clamped].id);
    setFinished(false);
  };

  const handleSelectFromModal = (storeId: string) => {
    setCurrentStoreId(storeId);
    setFinished(false);
    setIsModalOpen(false);
  };

  const runSave = async (status: "visited" | "excluded") => {
    if (!currentStore) return;
    if (status === "excluded") {
      if (!window.confirm("この店舗を対象外にしますか？（掲載はされません）")) return;
    }

    // 保存によってこの店舗がフィルター対象から外れる可能性があるため、
    // 「保存前の並び順で1つ先にいた店舗」を先に確定してから保存する
    const nextId = filteredStores[effectiveIndex + 1]?.id ?? null;

    setIsSaving(true);
    setSaveError(null);
    try {
      await saveSurveyResult({
        storeId: currentStore.id,
        tagIds: mergeTagIdsForSave(currentStore, selectedTagIds, allTags),
        priceRange,
        operatorReview: memo,
        surveyStatus: status,
      });
      setStores((prev) =>
        prev.map((s) =>
          s.id === currentStore.id
            ? {
                ...s,
                selectedTagIds: mergeTagIdsForSave(currentStore, selectedTagIds, allTags),
                priceRange,
                operatorReview: memo,
                surveyStatus: status,
              }
            : s
        )
      );
      if (nextId) {
        setCurrentStoreId(nextId);
      } else {
        setFinished(true);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (stores.length === 0) {
    return <p className="text-sm text-gray-400 p-4">対象の実店舗がありません</p>;
  }

  if (finished || !currentStore) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 px-4 text-center">
        <p className="text-lg font-bold text-ink">対象の店舗をすべて処理しました</p>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setFinished(false);
            setCurrentStoreId(stores[0]?.id ?? null);
          }}
          className="h-11 px-5 rounded-button bg-clay text-paper text-sm font-bold active:opacity-80"
        >
          最初の店舗に戻る
        </button>
        <Link href="/admin" className="text-xs text-gray-500 underline">
          管理画面トップへ
        </Link>
      </div>
    );
  }

  const distanceText =
    sortMode === "distance" && userLocation
      ? formatDistance(haversineMeters(userLocation, { lat: currentStore.lat, lng: currentStore.lng }))
      : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-48px)] -mx-4 -mt-5 -mb-5">
      {/* 店舗切り替えエリア */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 pt-3 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-xs text-gray-500 active:opacity-70">
            ← 管理画面
          </Link>
          <span className="text-xs text-gray-500 font-medium">
            {effectiveIndex + 1} / {filteredStores.length}件
          </span>
        </div>

        <div>
          <p className="text-xl font-bold text-ink leading-tight">{currentStore.name}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
            {currentStore.areaName}
            {distanceText && <>・{distanceText}</>}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SURVEY_STATUS_BADGE_CLASS[currentStore.surveyStatus]}`}
            >
              {SURVEY_STATUS_LABEL[currentStore.surveyStatus]}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(effectiveIndex - 1)}
            disabled={effectiveIndex === 0}
            className="h-11 flex-1 rounded-button border border-gray-300 text-sm text-ink disabled:opacity-30 active:opacity-70"
          >
            ← 前へ
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-3 rounded-button border border-gray-300 text-sm text-ink active:opacity-70 shrink-0"
          >
            店舗一覧
          </button>
          <button
            type="button"
            onClick={() => goTo(effectiveIndex + 1)}
            disabled={effectiveIndex >= filteredStores.length - 1}
            className="h-11 flex-1 rounded-button border border-gray-300 text-sm text-ink disabled:opacity-30 active:opacity-70"
          >
            次へ →
          </button>
        </div>
      </div>

      {/* タグ入力エリア（スクロール） */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <TagSection
          title="系統タグ"
          tags={byType("style")}
          selectedIds={selectedTagIds}
          onToggle={toggleTag}
        />

        <section>
          <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
            価格帯
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRICE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriceRange(opt.value)}
                className={`min-h-[44px] min-w-[44px] px-4 rounded-button text-sm font-medium border ${
                  priceRange === opt.value
                    ? "bg-clay text-paper border-clay"
                    : "bg-white text-ink border-gray-300"
                }`}
              >
                {opt.symbol}
              </button>
            ))}
          </div>
        </section>

        <TagSection
          title="雰囲気タグ"
          tags={byType("vibe")}
          selectedIds={selectedTagIds}
          onToggle={toggleTag}
        />
        <TagSection
          title="客層タグ"
          tags={[...byType("gender"), ...byType("age_group")]}
          selectedIds={selectedTagIds}
          onToggle={toggleTag}
        />

        <section>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
            スタッフより一言
          </label>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="店内の雰囲気、おすすめポイントなど"
            className="w-full h-11 rounded-button border border-gray-300 px-3 text-sm"
          />
        </section>
      </div>

      {/* 固定アクションバー */}
      <div className="shrink-0 bg-white border-t border-gray-200">
        {saveError && (
          <p className="text-xs text-red-600 px-4 pt-2">
            {saveError}（もう一度お試しください）
          </p>
        )}
        <div
          className="px-4 pt-3 flex gap-2"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={() => runSave("excluded")}
            disabled={isSaving}
            className="h-12 px-4 rounded-button bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-40 active:opacity-70 shrink-0"
          >
            対象外にする
          </button>
          <button
            type="button"
            onClick={() => runSave("visited")}
            disabled={isSaving}
            className="h-12 flex-1 rounded-button bg-clay text-paper text-base font-bold disabled:opacity-40 active:opacity-80"
          >
            {isSaving ? "保存中..." : "保存して次へ"}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <StoreListModal
          filteredStores={filteredStores}
          currentStoreId={currentStore.id}
          statusFilter={statusFilter}
          onStatusFilterChange={(f) => {
            setStatusFilter(f);
          }}
          sortMode={sortMode}
          userLocation={userLocation}
          onRequestLocation={requestLocation}
          geoError={geoError}
          onSelect={handleSelectFromModal}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// このUIが編集しない商品カテゴリタグ等の既存IDを維持したまま、
// 系統・雰囲気・客層タグの選択結果を反映した「保存すべきタグID全体」を作る。
// store.selectedTagIds（DBの現在値）のうち、このUIが管轄するタグ種別
// （style/vibe/gender/age_group）のIDだけを selectedTagIds（UI状態）で
// 置き換え、それ以外（商品カテゴリ等）はそのまま保持する
function mergeTagIdsForSave(
  store: SurveyStore,
  editedIds: Set<number>,
  allTags: TagMaster[]
): number[] {
  const managedTypes = new Set(["style", "vibe", "gender", "age_group"]);
  const managedTagIds = new Set(
    allTags.filter((t) => managedTypes.has(t.type)).map((t) => t.id)
  );
  const untouched = store.selectedTagIds.filter((id) => !managedTagIds.has(id));
  return [...untouched, ...Array.from(editedIds)];
}

function TagSection({
  title,
  tags,
  selectedIds,
  onToggle,
}: {
  title: string;
  tags: TagMaster[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <section>
      <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={`min-h-[44px] px-4 rounded-button text-sm font-medium border ${
              selectedIds.has(tag.id)
                ? "bg-clay text-paper border-clay"
                : "bg-white text-ink border-gray-300"
            }`}
          >
            {tag.label_ja}
          </button>
        ))}
      </div>
    </section>
  );
}
