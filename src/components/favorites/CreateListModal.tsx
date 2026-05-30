"use client";

import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
};

export default function CreateListModal({ isOpen, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await onCreate(name.trim());
    setName("");
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-50 bg-paper rounded-card shadow-sheet overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-ink">新しいリストを作成</h2>
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
            placeholder="リスト名を入力"
            maxLength={30}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-ink bg-white focus:outline-none focus:border-clay"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="w-full h-11 rounded-button bg-ink text-paper text-sm font-medium active:opacity-80 disabled:opacity-40"
          >
            {saving ? "作成中..." : "作成"}
          </button>
        </div>
      </div>
    </>
  );
}
