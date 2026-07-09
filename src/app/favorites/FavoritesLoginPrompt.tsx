"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function FavoritesLoginPrompt() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/favorites`,
      },
    });
  };

  return (
    <div
      className="min-h-[100dvh] bg-paper flex flex-col"
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      <div className="sticky top-0 z-10 flex items-center px-4 h-12 bg-paper/90 backdrop-blur-sm border-b border-gray-100">
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
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <svg
          width="40"
          height="40"
          viewBox="0 0 20 20"
          fill="none"
          className="text-gray-300"
        >
          <path
            d="M10 17S3 12.5 3 8a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          お気に入り機能を使うには
          <br />
          ログインが必要です
        </p>
        <button
          onClick={handleLogin}
          className="h-11 px-6 rounded-button bg-ink text-paper text-sm font-medium active:opacity-80"
        >
          Googleでログイン
        </button>
        <Link href="/" className="text-xs text-gray-400 active:opacity-60">
          マップに戻る
        </Link>
      </div>
    </div>
  );
}
