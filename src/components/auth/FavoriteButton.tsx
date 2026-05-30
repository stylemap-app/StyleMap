"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoginModal from "./LoginModal";

export default function FavoriteButton() {
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setShowModal(true);
      return;
    }

    // フェーズ6-2で実際のお気に入りトグルを実装
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 active:bg-gray-200"
        aria-label="お気に入りに追加"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 17S3 12.5 3 8a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"
            stroke="#1A1816"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
