"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { FavoriteList } from "@/lib/favorites";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  lists: FavoriteList[];
  currentListIds: string[];
  onSave: (selectedListIds: string[]) => Promise<void>;
};

export default function ListSelectModal({
  isOpen,
  onClose,
  lists,
  currentListIds,
  onSave,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(currentListIds)
  );
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // モーダルが開くたびに選択状態をリセット
  useEffect(() => {
    if (isOpen) {
      setSelected(new Set(currentListIds));
    }
  }, [isOpen, currentListIds]);

  if (!isOpen || !mounted) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(Array.from(selected));
    setSaving(false);
    onClose();
  };

  return createPortal(
    <>
      {/* backdrop: stopPropagation で Link への伝播を防ぐ */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      {/* モーダル本体: stopPropagation でモーダル内クリックを封じ込める */}
      <div
        className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-50 bg-paper rounded-card shadow-sheet overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-ink">リストに追加</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-400 active:opacity-60"
            aria-label="閉じる"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => toggle(list.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected.has(list.id)
                    ? "bg-clay border-clay"
                    : "border-gray-300"
                }`}
              >
                {selected.has(list.id) && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-ink text-left">{list.name}</span>
            </button>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 rounded-button bg-ink text-paper text-sm font-medium active:opacity-80 disabled:opacity-40"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
