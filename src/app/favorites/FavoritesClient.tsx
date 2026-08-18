"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { FavoriteList, FavoriteStore } from "@/lib/favorites";
import { createList, renameList, deleteList } from "@/lib/favorites";
import CreateListModal from "@/components/favorites/CreateListModal";
import EditListModal from "@/components/favorites/EditListModal";
import FavoriteStoreCard from "@/components/favorites/FavoriteStoreCard";
import PoweredByGoogle from "@/components/store/PoweredByGoogle";
import PolicyLink from "@/components/store/PolicyLink";
import FavoriteClothesTab from "./FavoriteClothesTab";

type FavTab = "store" | "clothes";

type Props = {
  initialLists: FavoriteList[];
  userId: string;
};

export default function FavoritesClient({ initialLists, userId }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [favTab, setFavTab] = useState<FavTab>("store");
  const [lists, setLists] = useState<FavoriteList[]>(initialLists);
  const [selectedListId, setSelectedListId] = useState<string | null>(
    initialLists[0]?.id ?? null
  );
  const [stores, setStores] = useState<FavoriteStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<FavoriteList | null>(null);

  // Places APIキーを扱うマージ処理はサーバー専用のため、
  // ここでは直接Supabaseを叩かず /api/favorites/stores 経由で取得する
  const fetchStores = useCallback(async (listId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites/stores?listId=${listId}`);
      const { stores: result } = (await res.json()) as { stores: FavoriteStore[] };
      setStores(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedListId) {
      fetchStores(selectedListId);
    } else {
      setStores([]);
    }
  }, [selectedListId, fetchStores]);

  const handleCreateList = async (name: string) => {
    const maxPosition =
      lists.length > 0 ? Math.max(...lists.map((l) => l.position)) : -1;
    const newList = await createList(supabase, userId, name, maxPosition + 1);
    setLists((prev) => [...prev, newList]);
    setSelectedListId(newList.id);
  };

  const handleRenameList = async (name: string) => {
    if (!editingList) return;
    await renameList(supabase, editingList.id, name);
    setLists((prev) =>
      prev.map((l) => (l.id === editingList.id ? { ...l, name } : l))
    );
  };

  const handleDeleteList = async () => {
    if (!editingList) return;
    await deleteList(supabase, editingList.id);
    const newLists = lists.filter((l) => l.id !== editingList.id);
    setLists(newLists);
    if (selectedListId === editingList.id) {
      setSelectedListId(newLists[0]?.id ?? null);
    }
  };

  const handleActionComplete = useCallback(() => {
    if (selectedListId) fetchStores(selectedListId);
  }, [selectedListId, fetchStores]);

  return (
    <div className="min-h-[100dvh] bg-paper">
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
          お気に入り
        </h1>
      </div>

      {/* 店/服 タブ切り替え */}
      <div className="sticky top-12 z-10 flex items-center gap-2 px-4 py-2.5 bg-paper border-b border-gray-200">
        {(["store", "clothes"] as FavTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFavTab(tab)}
            className={`h-8 px-4 rounded-full text-sm font-semibold transition-colors ${
              favTab === tab ? "bg-[#FFD700] text-ink" : "text-gray-500"
            }`}
          >
            {tab === "store" ? "店のお気に入り" : "服のお気に入り"}
          </button>
        ))}
      </div>

      {favTab === "clothes" ? (
        <FavoriteClothesTab />
      ) : (
      <>
      {/* リストタブ（block コンテナで overflow を封じ、内側を flex に） */}
      <div className="overflow-x-auto border-b border-gray-100">
        <div className="flex items-center gap-2 px-4 py-3 w-max min-w-full">
        {lists.map((list) => {
          const isActive = selectedListId === list.id;
          return (
            <div key={list.id} className="flex items-center shrink-0 gap-0.5">
              <button
                onClick={() => setSelectedListId(list.id)}
                className={`h-10 px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-ink text-paper"
                    : "bg-gray-100 text-gray-500 active:bg-gray-200"
                }`}
              >
                {list.name}
              </button>
              {isActive && (
                <button
                  onClick={() => setEditingList(list)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 active:opacity-60 shrink-0"
                  aria-label="リストを編集"
                >
                  <svg
                    width="16"
                    height="4"
                    viewBox="0 0 16 4"
                    fill="currentColor"
                  >
                    <circle cx="2" cy="2" r="1.5" />
                    <circle cx="8" cy="2" r="1.5" />
                    <circle cx="14" cy="2" r="1.5" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={() => setShowCreateModal(true)}
          className="shrink-0 h-10 px-3 rounded-full text-sm font-medium text-clay border border-clay/50 whitespace-nowrap active:bg-clay/10"
        >
          + 新しいリスト
        </button>
        </div>
      </div>

      {/* 店舗グリッド */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 pb-[calc(56px+2rem+env(safe-area-inset-bottom))]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-card overflow-hidden bg-white shadow-card animate-pulse">
                <div className="w-full aspect-[4/3] bg-gray-200" />
                <div className="px-2.5 py-2 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-sm text-gray-400">まだお気に入りがありません</p>
            <Link
              href="/"
              className="h-11 px-5 rounded-button bg-ink text-paper text-sm font-medium flex items-center active:opacity-80"
            >
              マップに戻る
            </Link>
          </div>
        ) : (
          <div className="pb-[calc(56px+2rem+env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-2 gap-3">
              {stores.map((store) => (
                <FavoriteStoreCard
                  key={store.id}
                  store={store}
                  onActionComplete={handleActionComplete}
                />
              ))}
            </div>
            {stores.some((s) => s.is_real_store) && <PoweredByGoogle />}
            <PolicyLink />
          </div>
        )}
      </div>

      {/* モーダル */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
      />
      {editingList && (
        <EditListModal
          isOpen={true}
          onClose={() => setEditingList(null)}
          list={editingList}
          onRename={handleRenameList}
          onDelete={handleDeleteList}
        />
      )}
      </>
      )}
    </div>
  );
}
