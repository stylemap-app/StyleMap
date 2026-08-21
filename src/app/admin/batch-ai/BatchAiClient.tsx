"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { runBatchAiForStore } from "./actions";

const COST_PER_STORE_JPY = 0.5;

export type BatchAiTargetStore = {
  id: string;
  name: string;
  areaName: string;
  // AIを一度実行済みだが系統・商品カテゴリとも0件だった（手動タグ付けが必要）
  aiInferenceFailed: boolean;
};

type ResultItem = {
  storeId: string;
  success: boolean;
  error?: string;
  appliedTags?: string[];
};

export default function BatchAiClient({ targets }: { targets: BatchAiTargetStore[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(targets.map((t) => t.id))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === targets.length ? new Set() : new Set(targets.map((t) => t.id))
    );
  };

  const estimatedCost = (selectedIds.size * COST_PER_STORE_JPY).toFixed(1);

  const handleRun = async () => {
    const targetList = targets.filter((t) => selectedIds.has(t.id));
    if (targetList.length === 0) return;
    if (
      !window.confirm(
        `選択した${targetList.length}件にAIタグ推定を実行します（推定コスト: 約${(
          targetList.length * COST_PER_STORE_JPY
        ).toFixed(1)}円）`
      )
    ) {
      return;
    }

    setIsRunning(true);
    setDone(false);
    setResults([]);
    const collected: ResultItem[] = [];

    // Claude APIのレート制限を避けるため、並列実行せず1件ずつ順番に実行する
    for (let i = 0; i < targetList.length; i++) {
      const target = targetList[i];
      setProgress({ current: i + 1, total: targetList.length });
      try {
        const result = await runBatchAiForStore(target.id);
        collected.push({
          storeId: target.id,
          success: result.success,
          error: result.error,
          appliedTags: [...(result.appliedStyleTags ?? []), ...(result.appliedCategoryTags ?? [])],
        });
      } catch (err) {
        // 1件失敗しても他の店舗の処理は継続する
        collected.push({
          storeId: target.id,
          success: false,
          error: err instanceof Error ? err.message : "不明なエラー",
        });
      }
      setResults([...collected]);
    }

    setIsRunning(false);
    setDone(true);
    setProgress(null);
    router.refresh();
  };

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const aiFailedTargets = targets.filter((t) => t.aiInferenceFailed);

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">AIタグ推定 一括実行</h1>
        <span className="text-xs text-gray-500">対象 {targets.length}件</span>
      </div>

      <p className="text-xs text-gray-500">
        系統タグが未設定の実店舗が対象です。系統・商品カテゴリ・価格帯のみを推定してDBへ保存します（雰囲気タグ・客層タグ・公開状態は変更しません）。
      </p>

      {aiFailedTargets.length > 0 && (
        <div className="rounded-card bg-gray-100 border border-gray-300 p-3 space-y-2">
          <p className="text-xs text-ink font-medium">
            AI判定不能: {aiFailedTargets.length}件（手動でタグ付けが必要）
          </p>
          <div className="flex flex-wrap gap-2">
            {aiFailedTargets.map((t) => (
              <Link
                key={t.id}
                href={`/admin/stores/${t.id}`}
                className="text-[11px] px-2 py-1 rounded-button bg-white border border-gray-300 text-ink active:opacity-70"
              >
                {t.name} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {targets.length === 0 ? (
        <p className="text-sm text-gray-400">対象の店舗はありません</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleAll}
              disabled={isRunning}
              className="text-xs text-gray-500 underline active:opacity-70 disabled:opacity-40"
            >
              {selectedIds.size === targets.length ? "すべて解除" : "すべて選択"}
            </button>
            <span className="text-xs text-gray-500">
              {selectedIds.size}/{targets.length}件選択中
            </span>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {targets.map((t) => {
              const result = results.find((r) => r.storeId === t.id);
              return (
                <label
                  key={t.id}
                  className="flex items-center gap-3 rounded-card bg-white shadow-card p-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(t.id)}
                    onChange={() => toggle(t.id)}
                    disabled={isRunning}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">
                      {t.name}
                      {t.aiInferenceFailed && (
                        <span className="inline-block ml-1.5 align-middle text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                          AI判定不能
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{t.areaName}</p>
                    {result && (
                      <p
                        className={`text-[11px] mt-0.5 ${
                          result.success ? "text-clay" : "text-red-600"
                        }`}
                      >
                        {result.success
                          ? `✓ ${result.appliedTags?.join("、") || "該当タグなし"}`
                          : `✗ ${result.error}`}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <div className="rounded-card bg-clay/5 border border-clay/20 p-3 space-y-2">
            <p className="text-xs text-gray-600">
              推定コスト: 約{estimatedCost}円（{selectedIds.size}件 × {COST_PER_STORE_JPY}円）
            </p>
            {progress && (
              <p className="text-xs text-ink font-medium">
                実行中... {progress.current}件目 / {progress.total}件
              </p>
            )}
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning || selectedIds.size === 0}
              className="w-full h-11 rounded-button bg-clay text-paper text-sm font-bold disabled:opacity-40 active:opacity-80"
            >
              {isRunning ? "実行中..." : `選択した${selectedIds.size}件にAIタグ推定を実行`}
            </button>
          </div>

          {done && (
            <div className="rounded-card bg-white shadow-card p-3 text-sm">
              <p className="font-semibold text-ink">
                完了: 成功{successCount}件 / 失敗{failureCount}件
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
