"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoginModal from "./LoginModal";

type Props = {
  clothesId: string;
  initialFavorited: boolean;
  size?: "sm" | "md";
  onActionComplete?: () => void;
};

export default function ClothesFavoriteButton({
  clothesId,
  initialFavorited,
  size = "md",
  onActionComplete,
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPopped, setIsPopped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      if (favorited) {
        await supabase
          .from("clothes_favorites")
          .delete()
          .eq("user_id", session.user.id)
          .eq("clothes_id", clothesId);
        setFavorited(false);
        onActionComplete?.();
      } else {
        await supabase
          .from("clothes_favorites")
          .insert({ user_id: session.user.id, clothes_id: clothesId });
        setFavorited(true);
        setIsPopped(true);
        setTimeout(() => setIsPopped(false), 350);
        onActionComplete?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const visualSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center w-11 h-11 active:opacity-70 disabled:opacity-40"
        aria-label={favorited ? "お気に入りから削除" : "お気に入りに追加"}
      >
        <div
          className={`flex items-center justify-center ${visualSize} rounded-full bg-white/80 backdrop-blur-sm shadow-sm`}
          style={isPopped ? { animation: "heart-pop 0.35s ease-out" } : undefined}
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
        </div>
      </button>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
