"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PriceRange } from "@/types/store";
import { EMPTY_FILTER, type FilterState } from "@/lib/filter";

export function useFilterState(): [FilterState, (next: FilterState) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter: FilterState = {
    styles: searchParams.get("style")?.split(",").filter(Boolean) ?? [],
    vibes: searchParams.get("vibe")?.split(",").filter(Boolean) ?? [],
    prices: (searchParams.get("price")?.split(",").filter(Boolean) ?? []).map(
      Number
    ) as PriceRange[],
    gender: searchParams.get("gender") ?? null,
  };

  const setFilter = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.styles.length > 0) params.set("style", next.styles.join(","));
      else params.delete("style");

      if (next.vibes.length > 0) params.set("vibe", next.vibes.join(","));
      else params.delete("vibe");

      if (next.prices.length > 0)
        params.set("price", next.prices.join(","));
      else params.delete("price");

      if (next.gender) params.set("gender", next.gender);
      else params.delete("gender");

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  return [filter, setFilter];
}

export function parseFilterFromParams(searchParams: {
  get(key: string): string | null;
}): FilterState {
  return {
    styles: searchParams.get("style")?.split(",").filter(Boolean) ?? [],
    vibes: searchParams.get("vibe")?.split(",").filter(Boolean) ?? [],
    prices: (
      searchParams.get("price")?.split(",").filter(Boolean) ?? []
    ).map(Number) as PriceRange[],
    gender: searchParams.get("gender") ?? null,
  };
}

export { EMPTY_FILTER };
