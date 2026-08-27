"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleStoreHidden, bulkSetPublished, bulkSetSurveyStatus } from "./actions";
import DeleteStoreButton from "./DeleteStoreButton";
import PublishToggle from "./PublishToggle";
import {
  SURVEY_STATUSES,
  SURVEY_STATUS_LABEL,
  SURVEY_STATUS_BADGE_CLASS,
  type SurveyStatus,
} from "@/lib/surveyStatus";

export type AdminStoreListItem = {
  id: string;
  name: string;
  areaName: string;
  tagCount: number;
  is_published: boolean;
  is_hidden: boolean;
  is_real_store: boolean;
  // 一括AIタグ推定を実行済みだが系統・商品カテゴリとも0件だった
  aiInferenceFailed: boolean;
  surveyStatus: SurveyStatus;
};

type StatusFilterValue = "all" | SurveyStatus;

export default function AdminStoreListClient({ stores }: { stores: AdminStoreListItem[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");

  const visibleStores = useMemo(
    () =>
      statusFilter === "all"
        ? stores
        : stores.filter((s) => s.surveyStatus === statusFilter),
    [stores, statusFilter]
  );

  const changeFilter = (value: StatusFilterValue) => {
    setStatusFilter(value);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === visibleStores.length ? new Set() : new Set(visibleStores.map((s) => s.id))
    );
  };

  const runBulk = async (nextPublished: boolean) => {
    const targetIds = Array.from(selectedIds);
    if (targetIds.length === 0) return;

    if (nextPublished) {
      // タグが1つも付いていない店舗を公開しようとしたら警告する
      const untaggedCount = stores.filter(
        (s) => selectedIds.has(s.id) && s.tagCount === 0
      ).length;
      const message =
        untaggedCount > 0
          ? `${untaggedCount}件はタグが未設定です。このまま公開しますか？`
          : `選択した${targetIds.length}件を公開しますか？`;
      if (!window.confirm(message)) return;
    } else {
      if (!window.confirm(`選択した${targetIds.length}件を非公開にしますか？`)) return;
    }

    setError(null);
    setIsBulkRunning(true);
    try {
      await bulkSetPublished(targetIds, nextPublished);
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作に失敗しました");
    } finally {
      setIsBulkRunning(false);
    }
  };

  const runBulkSurvey = async () => {
    const targetIds = Array.from(selectedIds);
    if (targetIds.length === 0) return;
    if (!window.confirm(`選択した${targetIds.length}件を訪問予定にしますか？`)) return;

    setError(null);
    setIsBulkRunning(true);
    try {
      await bulkSetSurveyStatus(targetIds, "planned");
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作に失敗しました");
    } finally {
      setIsBulkRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <FilterButton
          label="すべて"
          active={statusFilter === "all"}
          onClick={() => changeFilter("all")}
        />
        {SURVEY_STATUSES.map((status) => (
          <FilterButton
            key={status}
            label={SURVEY_STATUS_LABEL[status]}
            active={statusFilter === status}
            onClick={() => changeFilter(status)}
          />
        ))}
      </div>

      {visibleStores.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-card bg-white shadow-card p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-gray-500 underline active:opacity-70"
            >
              {selectedIds.size === visibleStores.length ? "すべて解除" : "すべて選択"}
            </button>
            <span className="text-xs text-gray-500">{selectedIds.size}件選択中</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={runBulkSurvey}
              disabled={isBulkRunning || selectedIds.size === 0}
              className="text-xs px-3 py-1.5 rounded-button border border-gray-300 text-ink disabled:opacity-40 active:opacity-70"
            >
              選択した{selectedIds.size}件を訪問予定にする
            </button>
            <button
              type="button"
              onClick={() => runBulk(true)}
              disabled={isBulkRunning || selectedIds.size === 0}
              className="text-xs px-3 py-1.5 rounded-button bg-clay text-paper disabled:opacity-40 active:opacity-80"
            >
              選択した{selectedIds.size}件を公開
            </button>
            <button
              type="button"
              onClick={() => runBulk(false)}
              disabled={isBulkRunning || selectedIds.size === 0}
              className="text-xs px-3 py-1.5 rounded-button border border-gray-300 text-ink disabled:opacity-40 active:opacity-70"
            >
              選択した{selectedIds.size}件を非公開
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="space-y-2">
        {visibleStores.length === 0 ? (
          <p className="text-sm text-gray-400">該当する店舗はありません</p>
        ) : (
          visibleStores.map((store) => (
            <div
              key={store.id}
              className="flex items-center justify-between gap-3 rounded-card bg-white shadow-card p-3"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(store.id)}
                onChange={() => toggleSelected(store.id)}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">
                  {store.name}
                  {!store.is_published && (
                    <span className="inline-block ml-1.5 align-middle text-[10px] px-1.5 py-0.5 rounded-full bg-clay text-paper font-medium">
                      未公開
                    </span>
                  )}
                  {store.aiInferenceFailed && (
                    <span className="inline-block ml-1.5 align-middle text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                      未タグ付け
                    </span>
                  )}
                  <span
                    className={`inline-block ml-1.5 align-middle text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SURVEY_STATUS_BADGE_CLASS[store.surveyStatus]}`}
                  >
                    {SURVEY_STATUS_LABEL[store.surveyStatus]}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {store.areaName}
                  &ensp;・&ensp;タグ{store.tagCount}件
                  {store.is_hidden && <>&ensp;・&ensp;（掲載停止中）</>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PublishToggle storeId={store.id} isPublished={store.is_published} />
                <Link
                  href={`/admin/stores/${store.id}`}
                  className="text-xs px-2.5 py-1.5 rounded-button border border-gray-300 text-ink active:opacity-70"
                >
                  タグ編集
                </Link>
                <form action={toggleStoreHidden.bind(null, store.id, !store.is_hidden)}>
                  <button
                    type="submit"
                    className="text-xs px-2.5 py-1.5 rounded-button border border-gray-300 text-ink active:opacity-70"
                  >
                    {store.is_hidden ? "掲載再開" : "掲載停止"}
                  </button>
                </form>
                {/* ダミー店舗（is_real_store=false）は誤削除防止のため削除ボタンを出さない。
                    このページのクエリは is_real_store=true のみを取得しているため常にtrueだが、
                    将来ダミー店舗も一覧に含める変更が入った際の保険として明示的にガードする */}
                {store.is_real_store && <DeleteStoreButton storeId={store.id} />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-3 rounded-button text-xs font-medium ${
        active ? "bg-clay text-paper" : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}
