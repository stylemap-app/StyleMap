"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MapView from "@/components/map/MapView";
import ListView from "@/components/store/ListView";
import ViewTabs from "./ViewTabs";
import type { StoreForMap } from "@/components/map/MapView";
import type { View } from "./ViewTabs";

type Props = {
  stores: StoreForMap[];
  defaultView: View;
};

export default function HomeClient({ stores, defaultView }: Props) {
  const [view, setView] = useState<View>(defaultView);
  const router = useRouter();

  const handleViewChange = (newView: View) => {
    setView(newView);
    router.push(`?view=${newView}`, { scroll: false });
  };

  return (
    <div className="flex flex-col h-[100dvh]">
      <ViewTabs currentView={view} onViewChange={handleViewChange} />
      <div className="flex-1 overflow-hidden">
        {view === "map" ? (
          <MapView stores={stores} />
        ) : (
          <ListView stores={stores} />
        )}
      </div>
    </div>
  );
}
