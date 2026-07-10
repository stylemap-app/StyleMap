"use client";

import { useState } from "react";
import type { StoreHours } from "@/types/store";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

export default function HoursSection({ hours }: { hours: StoreHours | null }) {
  const [expanded, setExpanded] = useState(false);

  if (!hours?.regular) return null;

  const todayIndex = new Date().getDay();
  const todayHours = hours.regular[todayIndex];
  const todayStr =
    todayHours?.open && todayHours?.close
      ? `${todayHours.open} – ${todayHours.close}`
      : "定休日";

  return (
    <div>
      <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-2.5">
        営業時間
      </h2>

      {/* 今日の営業時間（タップで展開） */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full py-0.5"
      >
        <span className="text-sm text-ink">
          <span className="text-gray-500">{DAY_NAMES[todayIndex]}（今日）</span>
          &ensp;{todayStr}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 全曜日一覧（展開時） */}
      {expanded && (
        <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
          {hours.regular.map((day, i) => (
            <div
              key={i}
              className={`flex text-sm ${
                i === todayIndex ? "font-semibold text-ink" : "text-gray-600"
              }`}
            >
              <span className="w-5 shrink-0">{DAY_NAMES[i]}</span>
              <span className="ml-4">
                {day.open && day.close
                  ? `${day.open} – ${day.close}`
                  : "定休日"}
              </span>
            </div>
          ))}
          {hours.note && (
            <p className="text-xs text-gray-500 mt-2">{hours.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
