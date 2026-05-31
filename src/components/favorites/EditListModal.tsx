"use client";

import { useState } from "react";
import type { FavoriteList } from "@/lib/favorites";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  list: FavoriteList;
  onRename: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

export default function EditListModal({
  isOpen,
  onClose,
  list,
  onRename,
  onDelete,
}: Props) {
  const [name, setName] = useState(list.name);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isDeletable = list.position !== 0;

  if (!isOpen) return null;

  const handleRename = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await onRename(name.trim());
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    setSaving(true);
    await onDelete();
    setSaving(false);
    onClose();
  };

  if (showConfirm) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
        <div className="fixed inset-x-6 top-1/3 -translate-y-1/2 z-50 bg-paper rounded-card shadow-sheet overflow-hidden">
          <div className="px-4 pt-5 pb-3">
            <h2 className="text-[15px] font-bold text-ink mb-2">
              リストを削除しますか？
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              「{list.name}」を削除します。
              <br />
              リスト内のお気に入りもすべて削除されます。
            </p>
          </div>
          <div className="px-4 pb-4 flex flex-col gap-2">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="w-full h-11 rounded-button bg-red-500 text-white text-sm font-medium active:opacity-80 disabled:opacity-40"
            >
              {saving ? "削除中..." : "削除する"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full h-11 rounded-button border border-gray-200 text-ink text-sm font-medium active:opacity-80"
            >
              キャンセル
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-x-6 top-1/3 -translate-y-1/2 z-50 bg-paper rounded-card shadow-sheet overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-ink">リストを編集</h2>
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

        <div className="px-4 pt-4 pb-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-ink bg-white focus:outline-none focus:border-clay"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
          />
        </div>

        <div className="px-4 pb-4 flex flex-col gap-2">
          <button
            onClick={handleRename}
            disabled={!name.trim() || saving}
            className="w-full h-11 rounded-button bg-ink text-paper text-sm font-medium active:opacity-80 disabled:opacity-40"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          {isDeletable && (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full h-11 rounded-button border border-red-200 text-red-500 text-sm font-medium active:opacity-80"
            >
              このリストを削除
            </button>
          )}
        </div>
      </div>
    </>
  );
}
