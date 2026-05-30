"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { FavoriteList, FavoriteStore } from "@/lib/favorites";
import {
  createList,
  renameList,
  deleteList,
  getStoresInList,
} from "@/lib/favorites";
import CreateListModal from "@/components/favorites/CreateListModal";
import EditListModal from "@/components/favorites/EditListModal";
import FavoriteStoreCard from "@/components/favorites/FavoriteStoreCard";

type Props = {
  initialLists: FavoriteList[];
  userId: string;
};

export default function FavoritesClient({ initialLists, userId }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [lists, setLists] = useState<FavoriteList[]>(initialLists);
  const [selectedListId, setSelectedListId] = useState<string | null>(
    initialLists[0]?.id ?? null
  );
  const [stores, setStores] = useState<FavoriteStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<FavoriteList | null>(null);

  const fetchStores = useCallback(
    async (listId: string) => {
      setLoading(true);
      try {
        const result = await getStoresInList(supabase, listId);
        setStores(result);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

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
          マイリスト
        </h1>
      </div>

      {/* リストタブ（block コンテナで overflow を封じ、内側を flex に） */}
      <div className="overflow-x-auto border-b border-gray-100">
        <div className="flex items-center gap-2 px-4 py-3 w-max min-w-full">
        {lists.map((list) => {
          const isActive = selectedListId === list.id;
          return (
            <div key={list.id} className="flex items-center shrink-0 gap-0.5">
              <button
                onClick={() => setSelectedListId(list.id)}
                className={`h-8 px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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
                  className="w-7 h-7 flex items-center justify-center text-gray-400 active:opacity-60 shrink-0"
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
          className="shrink-0 h-8 px-3 rounded-full text-sm font-medium text-clay border border-clay/50 whitespace-nowrap active:bg-clay/10"
        >
          + 新しいリスト
        </button>
        </div>
      </div>

      {/* 店舗グリッド */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-clay rounded-full animate-spin" />
          </div>
        ) : stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-sm text-gray-400">まだお気に入りがありません</p>
            <Link
              href="/"
              className="h-10 px-5 rounded-button bg-ink text-paper text-sm font-medium flex items-center active:opacity-80"
            >
              マップに戻る
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-8">
            {stores.map((store) => (
              <FavoriteStoreCard
                key={store.id}
                store={store}
                onActionComplete={handleActionComplete}
              />
            ))}
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
    </div>
  );
}
