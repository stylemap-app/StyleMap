"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleDummyStoreHidden,
  deleteDummyStore,
  hideAreaDummyStores,
  deleteAreaDummyStores,
  hideAllDummyStores,
  deleteAllDummyStores,
} from "./actions";

const DELETE_CONFIRM_WORD = "削除";

type DummyStoreRow = {
  id: string;
  name: string;
  is_published: boolean;
  is_hidden: boolean;
  tagCount: number;
};

export type AreaGroup = {
  areaId: string | null;
  areaName: string;
  stores: DummyStoreRow[];
};

type Props = {
  groups: AreaGroup[];
  totalCount: number;
};

export default function DummyStoresClient({ groups, totalCount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const runAction = (fn: () => Promise<unknown>) => {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "操作に失敗しました");
      }
    });
  };

  // 削除系操作の二段階確認：確認ダイアログ→「削除」という文字列の入力を要求。
  // 一致しなければ何もせず中止する
  const confirmDeleteWord = (message: string): boolean => {
    if (!window.confirm(message)) return false;
    const input = window.prompt('取り消せません。続行するには「削除」と入力してください');
    if (input !== DELETE_CONFIRM_WORD) {
      if (input !== null) window.alert("入力が一致しなかったため、削除を中止しました");
      return false;
    }
    return true;
  };

  const handleDeleteOne = (store: DummyStoreRow) => {
    if (!window.confirm(`「${store.name}」を削除しますか？付与したタグも一緒に削除されます`)) {
      return;
    }
    runAction(() => deleteDummyStore(store.id));
  };

  const handleHideArea = (group: AreaGroup) => {
    if (!group.areaId) return;
    if (!window.confirm(`${group.areaName}のダミー店舗${group.stores.length}件を非表示にします`)) {
      return;
    }
    runAction(() => hideAreaDummyStores(group.areaId!));
  };

  const handleDeleteArea = (group: AreaGroup) => {
    if (!group.areaId) return;
    const ok = confirmDeleteWord(
      `${group.areaName}のダミー店舗${group.stores.length}件を削除します。この操作は取り消せません`
    );
    if (!ok) return;
    runAction(() => deleteAreaDummyStores(group.areaId!));
  };

  const handleHideAll = () => {
    if (!window.confirm(`ダミー店舗 全${totalCount}件を非表示にします`)) return;
    runAction(() => hideAllDummyStores());
  };

  const handleDeleteAll = () => {
    const ok = confirmDeleteWord(
      `ダミー店舗 全${totalCount}件を削除します。この操作は取り消せません`
    );
    if (!ok) return;
    runAction(() => deleteAllDummyStores());
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">ダミー店舗管理</h1>
        <span className="text-xs text-gray-500">合計 {totalCount}件</span>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <section className="rounded-card bg-white shadow-card p-3 space-y-2">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-label">全体操作</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleHideAll}
            disabled={isPending || totalCount === 0}
            className="flex-1 h-10 rounded-button border border-gray-300 text-xs text-ink disabled:opacity-40 active:opacity-70"
          >
            全ダミー店舗を非表示にする
          </button>
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={isPending || totalCount === 0}
            className="flex-1 h-10 rounded-button border border-red-300 text-xs text-red-600 disabled:opacity-40 active:opacity-70"
          >
            全ダミー店舗を削除する
          </button>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.areaId ?? "unassigned"} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">
              {group.areaName}
              <span className="ml-1.5 text-xs text-gray-500 font-normal">
                {group.stores.length}件
              </span>
            </h2>
            {group.areaId && group.stores.length > 0 && (
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleHideArea(group)}
                  disabled={isPending}
                  className="text-[11px] px-2 py-1 rounded-button border border-gray-300 text-ink disabled:opacity-40 active:opacity-70"
                >
                  このエリアを全て非表示
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteArea(group)}
                  disabled={isPending}
                  className="text-[11px] px-2 py-1 rounded-button border border-red-300 text-red-600 disabled:opacity-40 active:opacity-70"
                >
                  このエリアを全て削除
                </button>
              </div>
            )}
          </div>

          {group.stores.length === 0 ? (
            <p className="text-xs text-gray-400">ダミー店舗はありません</p>
          ) : (
            <div className="space-y-2">
              {group.stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between gap-3 rounded-card bg-white shadow-card p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {store.name}
                      <span className="inline-block ml-1.5 align-middle text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                        ダミー
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      タグ{store.tagCount}件
                      &ensp;・&ensp;{store.is_published ? "公開中" : "非公開"}
                      {store.is_hidden && <>&ensp;・&ensp;（掲載停止中）</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        runAction(() => toggleDummyStoreHidden(store.id, !store.is_hidden))
                      }
                      disabled={isPending}
                      className="text-xs px-2.5 py-1.5 rounded-button border border-gray-300 text-ink disabled:opacity-40 active:opacity-70"
                    >
                      {store.is_hidden ? "掲載再開" : "掲載停止"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOne(store)}
                      disabled={isPending}
                      className="text-xs px-2.5 py-1.5 rounded-button border border-red-300 text-red-600 disabled:opacity-40 active:opacity-70"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
