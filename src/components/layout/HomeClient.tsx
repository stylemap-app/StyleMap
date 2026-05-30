"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MapView from "@/components/map/MapView";
import ListView from "@/components/store/ListView";
import ViewTabs from "./ViewTabs";
import FilterBar from "@/components/filter/FilterBar";
import FilterSheet from "@/components/filter/FilterSheet";
import EmptyState from "@/components/store/EmptyState";
import { useFilterState } from "@/hooks/useFilterState";
import {
  applyFilters,
  scoreAllStores,
  activeFilterCount,
  EMPTY_FILTER,
} from "@/lib/filter";
import type { StoreForMap } from "@/components/map/MapView";
import type { View } from "./ViewTabs";
import type { TagMaster } from "@/types/store";

type Props = {
  stores: StoreForMap[];
  defaultView: View;
  tagMasters: TagMaster[];
};

export default function HomeClient({ stores, defaultView, tagMasters }: Props) {
  const [view, setView] = useState<View>(defaultView);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const [filter, setFilter] = useFilterState();

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
    <div className="flex flex-col h-[100dvh]">
      <ViewTabs currentView={view} onViewChange={handleViewChange} />

      <FilterBar
        filter={filter}
        activeCount={activeFilterCount(filter)}
        onToggleVibe={handleToggleVibe}
        onOpenSheet={() => setIsSheetOpen(true)}
      />

      <div className="flex-1 overflow-hidden">
        {isEmpty && !showAll ? (
          <EmptyState
            totalCount={stores.length}
            onShowAll={() => setShowAll(true)}
            onReset={handleReset}
          />
        ) : view === "map" ? (
          <MapView stores={displayStores} />
        ) : (
          <ListView stores={displayStores} />
        )}
      </div>

      <FilterSheet
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
