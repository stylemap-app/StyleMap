"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import ClothesSelectModal from "@/components/tryon/ClothesSelectModal";
import DevModal from "@/components/tryon/DevModal";
import type { TryonCloth } from "./page";

type Props = {
  initialCloth: TryonCloth | null;
};

export default function TryonClient({ initialCloth }: Props) {
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [selectedCloth, setSelectedCloth] = useState<TryonCloth | null>(
    initialCloth
  );
  const [isClothesModalOpen, setIsClothesModalOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isTryingOn, setIsTryingOn] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPhotoPreviewUrl(url);
  };

  const canTryOn = !!photoPreviewUrl && !!selectedCloth;

  const handleTryOn = () => {
    if (!canTryOn || isTryingOn) return;
    setIsTryingOn(true);
    setTimeout(() => {
      setIsTryingOn(false);
      setIsDevModalOpen(true);
    }, 2000);
  };

  return (
    <div
      className="min-h-[100dvh] bg-paper"
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 grid grid-cols-3 items-center px-4 h-12 bg-paper/90 backdrop-blur-sm border-b border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-ink active:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm">戻る</span>
        </Link>
        <h1 className="text-[15px] font-bold text-ink text-center">
          試着してみる
        </h1>
      </div>

      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {/* 写真エリア */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">あなたの写真</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full aspect-square rounded-card border-2 border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center gap-2 bg-white/40 active:opacity-70"
            >
              {photoPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreviewUrl}
                  alt="選択した写真"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <PhotoIcon />
                  <span className="text-sm font-medium text-gray-500">
                    写真を選ぶ
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* 服エリア */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">選んだ服</p>
            <button
              onClick={() => setIsClothesModalOpen(true)}
              className="relative w-full aspect-square rounded-card border-2 border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center gap-2 bg-white/40 active:opacity-70"
            >
              {selectedCloth ? (
                <ImageWithFallback
                  src={selectedCloth.image_url}
                  alt={selectedCloth.name}
                  sizes="45vw"
                />
              ) : (
                <>
                  <ShirtIcon />
                  <span className="text-sm font-medium text-gray-500">
                    服を選ぶ
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {selectedCloth && (
          <p className="mt-2 text-xs text-ink text-center truncate">
            {selectedCloth.name} ・ ¥{selectedCloth.price.toLocaleString()}
          </p>
        )}

        {/* 試着するボタン */}
        <button
          onClick={handleTryOn}
          disabled={!canTryOn || isTryingOn}
          className="mt-8 w-full h-14 rounded-button bg-clay text-paper text-base font-bold flex items-center justify-center gap-2 active:opacity-80 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
        >
          {isTryingOn ? (
            <>
              <SpinnerIcon />
              試着中...
            </>
          ) : (
            "試着する"
          )}
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
          AIがあなたの写真に服を試着させます
          <br />
          （近日公開）
        </p>
      </div>

      <ClothesSelectModal
        isOpen={isClothesModalOpen}
        onClose={() => setIsClothesModalOpen(false)}
        onSelect={(cloth) => {
          setSelectedCloth(cloth);
          setIsClothesModalOpen(false);
        }}
      />

      <DevModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        clothesId={selectedCloth?.id ?? null}
      />
    </div>
  );
}

function PhotoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      className="text-gray-300"
      aria-hidden
    >
      <rect
        x="3"
        y="6"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 6l1.2-2h5.6L16 6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShirtIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      className="text-gray-300"
      aria-hidden
    >
      <path
        d="M3 8l3-4h3a3 3 0 006 0h3l3 4-3 2v10H6V10L3 8z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
