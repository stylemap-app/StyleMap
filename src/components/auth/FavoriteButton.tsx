"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoginModal from "./LoginModal";
import ListSelectModal from "@/components/favorites/ListSelectModal";
import {
  getUserLists,
  getOrCreateDefaultList,
  getStoreListIds,
  addFavoriteToList,
  removeFavoriteFromList,
  removeAllFavorites,
  type FavoriteList,
} from "@/lib/favorites";

type Props = {
  storeId: string;
  initialFavorited: boolean;
  size?: "sm" | "md";
  onToggle?: (storeId: string, isFavorited: boolean) => void;
};

export default function FavoriteButton({
  storeId,
  initialFavorited,
  size = "md",
  onToggle,
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPopped, setIsPopped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState<FavoriteList[]>([]);
  const [currentListIds, setCurrentListIds] = useState<string[]>([]);

  const popHeart = () => {
    setIsPopped(true);
    setTimeout(() => setIsPopped(false), 350);
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      const userLists = await getUserLists(supabase);

      if (userLists.length === 0) {
        // 初回ログイン: デフォルトリストを作成して即追加
        const listId = await getOrCreateDefaultList(supabase, session.user.id);
        await addFavoriteToList(supabase, storeId, listId, session.user.id);
        setFavorited(true);
        popHeart();
        onToggle?.(storeId, true);
        return;
      }

      if (userLists.length === 1) {
        // リスト1つ: 即トグル
        if (favorited) {
          await removeAllFavorites(supabase, storeId);
          setFavorited(false);
          onToggle?.(storeId, false);
        } else {
          await addFavoriteToList(
            supabase,
            storeId,
            userLists[0].id,
            session.user.id
          );
          setFavorited(true);
          popHeart();
          onToggle?.(storeId, true);
        }
        return;
      }

      // リスト複数: 選択モーダルを表示
      const storeListIds = await getStoreListIds(supabase, storeId);
      setLists(userLists);
      setCurrentListIds(storeListIds);
      setShowListModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleListSave = async (selectedListIds: string[]) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const toAdd = selectedListIds.filter((id) => !currentListIds.includes(id));
    const toRemove = currentListIds.filter(
      (id) => !selectedListIds.includes(id)
    );

    await Promise.all([
      ...toAdd.map((id) =>
        addFavoriteToList(supabase, storeId, id, session.user.id)
      ),
      ...toRemove.map((id) => removeFavoriteFromList(supabase, storeId, id)),
    ]);

    const newFavorited = selectedListIds.length > 0;
    setFavorited(newFavorited);
    if (newFavorited) popHeart();
    onToggle?.(storeId, newFavorited);
  };

  const containerSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center justify-center ${containerSize} rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:opacity-70 disabled:opacity-40`}
        style={isPopped ? { animation: "heart-pop 0.35s ease-out" } : undefined}
        aria-label={favorited ? "お気に入りから削除" : "お気に入りに追加"}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 20 20"
          fill={favorited ? "#D4714A" : "none"}
        >
          <path
            d="M10 17S3 12.5 3 8a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"
            stroke={favorited ? "#D4714A" : "#1A1816"}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <ListSelectModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        lists={lists}
        currentListIds={currentListIds}
        onSave={handleListSave}
      />
    </>
  );
}
