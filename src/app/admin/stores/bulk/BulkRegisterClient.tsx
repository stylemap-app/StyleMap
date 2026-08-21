"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { AREAS } from "@/lib/areas";
import {
  bulkSearchStores,
  bulkRegisterStores,
  type BulkSearchResult,
} from "./actions";

export default function BulkRegisterClient() {
  const [areaSlug, setAreaSlug] = useState(AREAS[0].slug); // 下北沢が初期値
  const [keywordsText, setKeywordsText] = useState("");
  const [results, setResults] = useState<BulkSearchResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchMeta, setSearchMeta] = useState<{
    apiCallCount: number;
    skipped: number;
  } | null>(null);
  const [registeredMessage, setRegisteredMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isRegistering, startRegisterTransition] = useTransition();

  const keywordCount = useMemo(
    () =>
      new Set(
        keywordsText
          .split("\n")
          .map((k) => k.trim())
          .filter(Boolean)
      ).size,
    [keywordsText]
  );

  const handleSearch = () => {
    setError(null);
    setRegisteredMessage(null);
    startSearchTransition(async () => {
      try {
        const res = await bulkSearchStores(keywordsText, areaSlug);
        setResults(res.results);
        setSelected(new Set(res.results.map((r) => r.placeId))); // デフォルト全選択
        setSearchMeta({ apiCallCount: res.apiCallCount, skipped: res.skippedAlreadyRegistered });
      } catch (err) {
        setError(err instanceof Error ? err.message : "検索に失敗しました");
      }
    });
  };

  const toggleSelected = (placeId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === results.length ? new Set() : new Set(results.map((r) => r.placeId))
    );
  };

  const handleRegister = () => {
    setError(null);
    const targetIds = Array.from(selected);
    startRegisterTransition(async () => {
      try {
        const { insertedCount } = await bulkRegisterStores(targetIds, areaSlug);
        setRegisteredMessage(`${insertedCount}件登録しました（非公開状態。/admin から公開してください）`);
        setResults((prev) => prev.filter((r) => !selected.has(r.placeId)));
        setSelected(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : "登録に失敗しました");
      }
    });
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">一括登録</h1>
        <Link href="/admin/stores" className="text-xs text-gray-500 active:opacity-70">
          1件ずつ登録 →
        </Link>
      </div>

      <section className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label">
          エリア
        </label>
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
      </section>

      <section className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label">
          検索キーワード（1行に1つ）
        </label>
        <textarea
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          placeholder={"例:\n古着屋\nセレクトショップ\nアパレル"}
          rows={5}
          className="w-full rounded-button border border-gray-300 p-3 text-sm"
        />
        {keywordCount > 0 && (
          <p className="text-xs text-gray-500">
            今回 {keywordCount} 件のAPI呼び出しが発生します（キーワード1つ = Text Search
            1リクエスト、最大20件/リクエスト）
          </p>
        )}
      </section>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSearch}
        disabled={isSearching || keywordCount === 0}
        className="w-full h-11 rounded-button bg-ink text-paper text-sm font-medium disabled:opacity-40 active:opacity-80"
      >
        {isSearching ? "検索中..." : "検索"}
      </button>

      {searchMeta && (
        <p className="text-xs text-gray-500">
          {results.length}件ヒット
          {searchMeta.skipped > 0 && `（登録済み${searchMeta.skipped}件を除外）`}
        </p>
      )}

      {registeredMessage && <p className="text-xs text-clay font-medium">{registeredMessage}</p>}

      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-gray-500 underline active:opacity-70"
            >
              {selected.size === results.length ? "すべて解除" : "すべて選択"}
            </button>
            <span className="text-xs text-gray-500">
              {selected.size}/{results.length}件選択中
            </span>
          </div>

          <div className="space-y-2">
            {results.map((r) => (
              <label
                key={r.placeId}
                className="flex items-center gap-3 rounded-card bg-white shadow-card p-3"
              >
                <input
                  type="checkbox"
                  checked={selected.has(r.placeId)}
                  onChange={() => toggleSelected(r.placeId)}
                  className="shrink-0"
                />
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {r.photoUrl && <ImageWithFallback src={r.photoUrl} alt={r.name} sizes="56px" />}
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
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRegister}
            disabled={isRegistering || selected.size === 0}
            className="w-full h-12 rounded-button bg-clay text-paper text-sm font-bold disabled:opacity-40 active:opacity-80"
          >
            {isRegistering ? "登録中..." : `選択した${selected.size}件を一括登録`}
          </button>
        </>
      )}
    </div>
  );
}
