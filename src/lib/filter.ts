import type { PriceRange } from "@/types/store";
import type { StoreForMap } from "@/components/map/MapView";

export type FilterState = {
  styles: string[];
  vibes: string[];
  prices: PriceRange[];
  gender: string | null;
};

export const EMPTY_FILTER: FilterState = {
  styles: [],
  vibes: [],
  prices: [],
  gender: null,
};

export function activeFilterCount(f: FilterState): number {
  return (
    (f.styles.length > 0 ? 1 : 0) +
    (f.vibes.length > 0 ? 1 : 0) +
    (f.prices.length > 0 ? 1 : 0) +
    (f.gender ? 1 : 0)
  );
}

export type ApplyResult = {
  stores: StoreForMap[];
  hasTagFilter: boolean;
};

export function applyFilters(
  stores: StoreForMap[],
  filter: FilterState
): ApplyResult {
  const hasTagFilter = filter.styles.length > 0 || filter.vibes.length > 0;
  const hasAnyFilter =
    hasTagFilter || filter.prices.length > 0 || !!filter.gender;

  if (!hasAnyFilter) return { stores, hasTagFilter: false };

  // Hard filters: price and gender (AND logic)
  let result = stores;
  if (filter.prices.length > 0) {
    result = result.filter((s) =>
      filter.prices.includes(Number(s.price_range) as PriceRange)
    );
  }
  if (filter.gender) {
    result = result.filter((s) =>
      (s.store_tags ?? []).some((st) => st.tag_masters?.slug === filter.gender)
    );
  }

  if (!hasTagFilter) return { stores: result, hasTagFilter: false };

  // Scoring: count matched style + vibe tag slugs, hide score=0
  const selectedSlugs = [...filter.styles, ...filter.vibes];
  const scored = result
    .map((s) => {
      const storeSlugs = (s.store_tags ?? [])
        .map((st) => st.tag_masters?.slug)
        .filter((slug): slug is string => !!slug);
      const score = selectedSlugs.filter((slug) =>
        storeSlugs.includes(slug)
      ).length;
      return { store: s, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return { stores: scored.map((s) => s.store), hasTagFilter: true };
}

// Fallback for 0-result state: ignore hard filters, score all stores
export function scoreAllStores(
  stores: StoreForMap[],
  filter: FilterState
): StoreForMap[] {
  const selectedSlugs = [...filter.styles, ...filter.vibes];
  if (selectedSlugs.length === 0) return stores;
  return [...stores]
    .map((s) => {
      const storeSlugs = (s.store_tags ?? [])
        .map((st) => st.tag_masters?.slug)
        .filter((slug): slug is string => !!slug);
      const score = selectedSlugs.filter((slug) =>
        storeSlugs.includes(slug)
      ).length;
      return { store: s, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((s) => s.store);
}
