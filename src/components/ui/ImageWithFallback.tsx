"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

// fill モード専用 next/image ラッパー。
// 親要素は position:relative + 明示的な height が必要。
// 読み込みエラー時（400/404 含む）にグレー背景 + 店名フォールバックを表示。
export default function ImageWithFallback({
  src,
  alt,
  sizes,
  priority,
  className = "object-cover",
}: Props) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <span className="text-[10px] text-gray-400 text-center px-2 leading-tight line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
