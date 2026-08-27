"use client";

import {
  SURVEY_STATUS_LABEL,
  SURVEY_STATUS_BADGE_CLASS,
  type SurveyStatus,
} from "@/lib/surveyStatus";
import { formatDistance, haversineMeters, type LatLng } from "./distance";
import type { SurveyStore } from "./SurveyClient";

export type StatusFilter = "all" | "planned" | "not_started";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "not_started", label: "未着手のみ" },
  { value: "planned", label: "訪問予定のみ" },
];

type Props = {
  filteredStores: SurveyStore[]; // 既にフィルター・ソート済み
  currentStoreId: string | null;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  sortMode: "distance" | "name";
  userLocation: LatLng | null;
  onRequestLocation: () => void;
  geoError: string | null;
  onSelect: (storeId: string) => void;
  onClose: () => void;
};

export default function StoreListModal({
  filteredStores,
  currentStoreId,
  statusFilter,
  onStatusFilterChange,
  sortMode,
  userLocation,
  onRequestLocation,
  geoError,
  onSelect,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40" onClick={onClose}>
      <div
        className="mt-auto max-h-[85vh] flex flex-col bg-paper rounded-t-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-bold text-ink">店舗一覧（{filteredStores.length}件）</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center text-gray-500 active:opacity-60"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-2.5 space-y-2 shrink-0 border-b border-gray-200">
          <div className="flex gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusFilterChange(opt.value)}
                className={`h-9 px-3 rounded-button text-xs font-medium ${
                  statusFilter === opt.value
                    ? "bg-clay text-paper"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onRequestLocation}
            className="h-9 px-3 rounded-button border border-gray-300 text-xs text-ink active:opacity-70"
          >
            {sortMode === "distance" ? "📍 現在地から近い順（表示中）" : "📍 現在地から近い順に並べる"}
          </button>
          {geoError && <p className="text-[11px] text-red-600">{geoError}</p>}
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredStores.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">該当する店舗はありません</p>
          ) : (
            filteredStores.map((store) => {
              const distance =
                sortMode === "distance" && userLocation
                  ? formatDistance(haversineMeters(userLocation, { lat: store.lat, lng: store.lng }))
                  : null;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => onSelect(store.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 border-b border-gray-100 text-left active:bg-gray-50 ${
                    store.id === currentStoreId ? "bg-clay/5" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{store.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {store.areaName}
                      {distance && <>&ensp;・&ensp;{distance}</>}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-medium ${
                      SURVEY_STATUS_BADGE_CLASS[store.surveyStatus as SurveyStatus]
                    }`}
                  >
                    {SURVEY_STATUS_LABEL[store.surveyStatus as SurveyStatus]}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
