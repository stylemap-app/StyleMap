"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import type { TryonCloth } from "@/app/tryon/page";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cloth: TryonCloth) => void;
};

export default function ClothesSelectModal({ isOpen, onClose, onSelect }: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clothes, setClothes] = useState<TryonCloth[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("clothes_favorites")
        .select("clothes_id, created_at, clothes(id, name, price, image_url)")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      const items = (data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((f: any) => f.clothes)
        .filter(Boolean) as TryonCloth[];
      setClothes(items);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

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
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-h-[70vh] flex flex-col bg-paper rounded-card shadow-sheet overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-[15px] font-bold text-ink">服を選ぶ</h2>
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

        <div className="overflow-y-auto p-3">
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : clothes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <p className="text-sm text-gray-400 text-center leading-relaxed">
                まずは服をお気に入り登録してください
              </p>
              <Link
                href="/?tab=clothes"
                onClick={onClose}
                className="h-10 px-4 rounded-button bg-ink text-paper text-sm font-medium flex items-center active:opacity-80"
              >
                服を探す
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {clothes.map((cloth) => (
                <button
                  key={cloth.id}
                  onClick={() => onSelect(cloth)}
                  className="text-left active:opacity-75"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={cloth.image_url}
                      alt={cloth.name}
                      sizes="30vw"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-ink leading-tight line-clamp-2">
                    {cloth.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    ¥{cloth.price.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
