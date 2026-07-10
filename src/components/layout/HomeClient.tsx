"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// @vis.gl/react-google-maps を遅延読み込み → 初回バンドルから除外
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-paper">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-clay rounded-full animate-spin" />
    </div>
  ),
});
import ListView from "@/components/store/ListView";
import ViewTabs from "./ViewTabs";
import FilterBar from "@/components/filter/FilterBar";
import FilterScreen from "@/components/filter/FilterScreen";
import EmptyState from "@/components/store/EmptyState";
import AuthButton from "@/components/auth/AuthButton";
import AreaSelectScreen from "./AreaSelectScreen";
import { useFilterState } from "@/hooks/useFilterState";
import {
  applyFilters,
  scoreAllStores,
  activeFilterCount,
  EMPTY_FILTER,
} from "@/lib/filter";
import { createClient } from "@/lib/supabase/client";
import { getUserFavoritedStoreIds } from "@/lib/favorites";
import type { StoreForMap } from "@/components/map/MapView";
import type { View } from "./ViewTabs";
import type { TagMaster } from "@/types/store";
import type { Area } from "@/lib/areas";

type SearchMode = "store" | "clothes";

type RatingEntry = { avg: number; count: number };

type Props = {
  stores: StoreForMap[];
  defaultView: View;
  tagMasters: TagMaster[];
  currentArea: Area;
  ratingMap: Record<string, RatingEntry>;
};

export default function HomeClient({ stores, defaultView, tagMasters, currentArea, ratingMap }: Props) {
  const [searchMode, setSearchMode] = useState<SearchMode>("store");
  const [view, setView] = useState<View>(defaultView);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAreaSelectOpen, setIsAreaSelectOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const router = useRouter();
  const [filter, setFilter] = useFilterState();

  // 認証状態に連動してお気に入り一覧を一括取得
  useEffect(() => {
    const supabase = createClient();

    const fetchFavorites = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const ids = await getUserFavoritedStoreIds(supabase);
          setFavoritedIds(ids);
        } else {
          setFavoritedIds([]);
        }
      } catch {
        setFavoritedIds([]);
      }
    };

    fetchFavorites();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchFavorites();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFavoriteToggle = useCallback(
    (storeId: string, isFavorited: boolean) => {
      setFavoritedIds((prev) =>
        isFavorited ? [...prev, storeId] : prev.filter((id) => id !== storeId)
      );
    },
    []
  );

  const handleViewChange = (newView: View) => {
    setView(newView);
    router.push(`?view=${newView}`, { scroll: false });
  };

  const handleToggleVibe = useCallback(
    (slug: string) => {
      setShowAll(false);
      setFilter({
        ...filter,
        vibes: filter.vibes.includes(slug)
          ? filter.vibes.filter((v) => v !== slug)
          : [...filter.vibes, slug],
      });
    },
    [filter, setFilter]
  );

  const handleApplyFilter = useCallback(
    (next: typeof filter) => {
      setShowAll(false);
      setFilter(next);
    },
    [setFilter]
  );

  const handleReset = useCallback(() => {
    setShowAll(false);
    setFilter(EMPTY_FILTER);
  }, [setFilter]);

  const getPreviewCount = useCallback(
    (draft: typeof filter) => applyFilters(stores, draft).stores.length,
    [stores]
  );

  const { stores: filteredStores } = applyFilters(stores, filter);
  const isEmpty = filteredStores.length === 0 && activeFilterCount(filter) > 0;

  const displayStores = (() => {
    if (isEmpty && showAll) return scoreAllStores(stores, filter);
    if (isEmpty) return [];
    return filteredStores;
  })();

  return (
    <div
      className="flex flex-col h-[100dvh]"
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {/* 店を探す | 服を探す タブ（+ AuthButton は常にこのバーに表示） */}
      <div className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-paper border-b border-gray-200">
        <div className="flex items-center gap-2 flex-1">
          {(["store", "clothes"] as SearchMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSearchMode(mode)}
              className={`h-8 px-4 rounded-full text-sm font-semibold transition-colors ${
                searchMode === mode
                  ? "bg-[#FFD700] text-ink"
                  : "text-gray-500"
              }`}
            >
              {mode === "store" ? "店を探す" : "服を探す"}
            </button>
          ))}
        </div>
        {/* AuthButton：条件分岐の外に配置して常に表示 */}
        <AuthButton />
      </div>

      {searchMode === "store" ? (
        <>
          <ViewTabs currentView={view} onViewChange={handleViewChange} />

          <FilterBar
            filter={filter}
            activeCount={activeFilterCount(filter)}
            onToggleVibe={handleToggleVibe}
            onOpenSheet={() => setIsSheetOpen(true)}
            areaName={currentArea.name}
            onOpenAreaSelect={() => setIsAreaSelectOpen(true)}
          />

          <div className="flex-1 min-h-0 overflow-hidden">
            {isEmpty && !showAll ? (
              <EmptyState
                totalCount={stores.length}
                onShowAll={() => setShowAll(true)}
                onReset={handleReset}
              />
            ) : view === "map" ? (
              <MapView
                key={currentArea.slug}
                stores={displayStores}
                activeVibeSlugs={filter.vibes}
                favoritedIds={favoritedIds}
                onFavoriteToggle={handleFavoriteToggle}
                center={{ lat: currentArea.lat, lng: currentArea.lng }}
                zoom={currentArea.zoom}
                ratingMap={ratingMap}
              />
            ) : (
              <ListView
                stores={displayStores}
                activeVibeSlugs={filter.vibes}
                favoritedIds={favoritedIds}
                onFavoriteToggle={handleFavoriteToggle}
                ratingMap={ratingMap}
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M3 8l3-4h3a3 3 0 006 0h3l3 4-3 2v10H6V10L3 8z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm">服を探す機能は準備中です</p>
        </div>
      )}

      {isAreaSelectOpen && (
        <AreaSelectScreen
          currentAreaSlug={currentArea.slug}
          onClose={() => setIsAreaSelectOpen(false)}
        />
      )}

      <FilterScreen
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onApply={handleApplyFilter}
        tagMasters={tagMasters}
        initialFilter={filter}
        getPreviewCount={getPreviewCount}
      />
    </div>
  );
}
