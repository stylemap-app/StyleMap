"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleStorePublished } from "./actions";

export default function PublishToggle({
  storeId,
  isPublished,
}: {
  storeId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      try {
        await toggleStorePublished(storeId, !isPublished);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "更新に失敗しました");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-500">
          {isPublished ? "公開中" : "非公開"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          aria-label="公開状態を切り替え"
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-40 ${
            isPublished ? "bg-clay" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isPublished ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </label>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
