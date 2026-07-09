"use client";

export type View = "map" | "list";

type Props = {
  currentView: View;
  onViewChange: (view: View) => void;
};

export default function ViewTabs({ currentView, onViewChange }: Props) {
  return (
    <div className="flex shrink-0 border-b border-gray-200 bg-paper">
      {(["map", "list"] as View[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onViewChange(tab)}
          className={`flex-1 h-11 text-sm font-medium transition-colors ${
            currentView === tab
              ? "text-ink border-b-2 border-ink"
              : "text-gray-500"
          }`}
        >
          {tab === "map" ? "マップ" : "一覧"}
        </button>
      ))}
    </div>
  );
}
