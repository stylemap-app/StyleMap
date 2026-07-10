"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AREAS, type Area } from "@/lib/areas";

const HISTORY_KEY = "stylemap_area_history";
const HISTORY_MAX = 3;

type Props = {
  currentAreaSlug: string;
  onClose: () => void;
};

export default function AreaSelectScreen({ currentAreaSlug, onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const handleSelect = (slug: string) => {
    const newHistory = [slug, ...history.filter((s) => s !== slug)].slice(0, HISTORY_MAX);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch {}

    const params = new URLSearchParams(searchParams.toString());
    params.set("area", slug);
    // エリア変更時はフィルターをリセット
    params.delete("style");
    params.delete("vibe");
    params.delete("price");
    params.delete("gender");

    router.push(`?${params.toString()}`, { scroll: false });
    onClose();
  };

  const historyAreas = history
    .map((slug) => AREAS.find((a) => a.slug === slug))
    .filter((a): a is Area => !!a);

  return (
    <div
      className="fixed inset-0 z-50 bg-paper flex flex-col"
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 border-b border-gray-200 shrink-0 h-12">
        <button
          onClick={onClose}
          className="p-1 -ml-1 text-ink"
          aria-label="閉じる"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-ink">エリアを選ぶ</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 最近見たエリア */}
        {historyAreas.length > 0 && (
          <section className="px-4 pt-5 pb-2">
            <p className="text-xs font-medium text-gray-400 mb-2.5">最近選んだエリア</p>
            <div className="flex flex-wrap gap-2">
              {historyAreas.map((area) => (
                <button
                  key={area.slug}
                  onClick={() => handleSelect(area.slug)}
                  className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
                    area.slug === currentAreaSlug
                      ? "bg-ink text-paper border-ink"
                      : "border-gray-300 text-ink bg-white"
                  }`}
                >
                  {area.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* エリア一覧 */}
        <section className="px-4 pt-5 pb-4">
          <p className="text-xs font-medium text-gray-400 mb-3">エリア一覧</p>
          <div className="flex flex-col gap-2">
            {AREAS.map((area) => {
              const isActive = area.slug === currentAreaSlug;
              return (
                <button
                  key={area.slug}
                  onClick={() => handleSelect(area.slug)}
                  className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl border transition-colors ${
                    isActive
                      ? "bg-ink text-paper border-ink"
                      : "bg-white border-gray-200 text-ink active:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-medium">{area.name}</span>
                  {isActive && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
