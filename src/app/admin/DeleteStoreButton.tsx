"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStore } from "./actions";

export default function DeleteStoreButton({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (
      !window.confirm(
        "この店舗を削除しますか？付与したタグも一緒に削除されます"
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deleteStore(storeId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "削除に失敗しました");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs px-2.5 py-1.5 rounded-button border border-red-300 text-red-600 active:opacity-70 disabled:opacity-40"
      >
        {isPending ? "削除中..." : "削除"}
      </button>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
