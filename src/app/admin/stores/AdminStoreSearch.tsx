"use client";

import { useState, useTransition } from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { AREAS } from "@/lib/areas";
import { searchStores, registerStore, type AdminSearchResult } from "./actions";

export default function AdminStoreSearch() {
  const [areaSlug, setAreaSlug] = useState(AREAS[0].slug);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const r = await searchStores(query, areaSlug);
        setResults(r);
      } catch (err) {
        setError(err instanceof Error ? err.message : "検索に失敗しました");
      }
    });
  };

  const handleRegister = async (placeId: string) => {
    setRegisteringId(placeId);
    setError(null);
    try {
      await registerStore(placeId, areaSlug);
      setResults((prev) =>
        prev.map((r) =>
          r.placeId === placeId ? { ...r, alreadyRegistered: true } : r
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink">新規店舗登録</h1>

      <form onSubmit={handleSearch} className="space-y-2">
        <select
          value={areaSlug}
          onChange={(e) => setAreaSlug(e.target.value)}
          className="w-full h-10 rounded-button border border-gray-300 px-2 text-sm bg-white"
        >
          {AREAS.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例: 古着屋、セレクトショップ"
            className="flex-1 h-10 rounded-button border border-gray-300 px-3 text-sm"
          />
          <button
            type="submit"
            disabled={isPending || !query.trim()}
            className="h-10 px-4 rounded-button bg-ink text-paper text-sm font-medium disabled:opacity-40 active:opacity-80"
          >
            {isPending ? "検索中..." : "検索"}
          </button>
        </div>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="space-y-2">
        {results.map((r) => (
          <div
            key={r.placeId}
            className="flex items-center gap-3 rounded-card bg-white shadow-card p-3"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {r.photoUrl && (
                <ImageWithFallback src={r.photoUrl} alt={r.name} sizes="56px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">{r.name}</p>
              <p className="text-xs text-gray-500 truncate">{r.formattedAddress}</p>
              {r.rating && (
                <p className="text-xs text-gray-500">
                  ★{r.rating.toFixed(1)}
                  {r.userRatingCount ? `（${r.userRatingCount}件）` : ""}
                </p>
              )}
            </div>
            {r.alreadyRegistered ? (
              <span className="text-xs text-gray-400 shrink-0">登録済み</span>
            ) : (
              <button
                onClick={() => handleRegister(r.placeId)}
                disabled={registeringId === r.placeId}
                className="text-xs px-3 py-1.5 rounded-button bg-clay text-paper shrink-0 disabled:opacity-40 active:opacity-80"
              >
                {registeringId === r.placeId ? "登録中..." : "StyleMapに追加"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
