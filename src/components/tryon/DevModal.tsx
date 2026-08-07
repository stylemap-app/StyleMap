"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  clothesId: string | null;
};

export default function DevModal({ isOpen, onClose, clothesId }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div
        className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-50 bg-paper rounded-card p-6 shadow-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-clay/15 flex items-center justify-center mb-1">
            <SparkleIcon />
          </div>
          <h2 className="text-[15px] font-bold text-ink">
            この機能は現在開発中です
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">近日公開予定！</p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {clothesId && (
            <Link
              href={`/clothes/${clothesId}`}
              onClick={onClose}
              className="w-full h-11 rounded-button bg-ink text-paper text-sm font-medium flex items-center justify-center active:opacity-80"
            >
              服の詳細に戻る
            </Link>
          )}
          <Link
            href="/favorites"
            onClick={onClose}
            className="w-full h-10 text-sm text-gray-500 flex items-center justify-center active:opacity-60"
          >
            お気に入りを見る
          </Link>
        </div>
      </div>
    </>,
    document.body
  );
}

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        fill="#D4714A"
        fillOpacity="0.6"
      />
      <path
        d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"
        fill="#D4714A"
        fillOpacity="0.6"
      />
    </svg>
  );
}
