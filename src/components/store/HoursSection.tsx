"use client";

import { useState } from "react";
import type { PlaceOpeningHours } from "@/types/store";

export default function HoursSection({
  openingHours,
}: {
  openingHours: PlaceOpeningHours | null | undefined;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!openingHours || openingHours.weekdayDescriptions.length !== 7) return null;

  // weekdayDescriptions は月曜始まり。JSのDate.getDay()は日曜=0なので変換する
  const todayIndex = (new Date().getDay() + 6) % 7;
  const todayLine = openingHours.weekdayDescriptions[todayIndex];

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
          {todayLine}
          <span
            className={`ml-2 text-[11px] font-medium ${
              openingHours.openNow ? "text-clay" : "text-gray-400"
            }`}
          >
            {openingHours.openNow ? "営業中" : "営業時間外"}
          </span>
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
          {openingHours.weekdayDescriptions.map((line, i) => (
            <p
              key={i}
              className={`text-sm ${
                i === todayIndex ? "font-semibold text-ink" : "text-gray-600"
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
