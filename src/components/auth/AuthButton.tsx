"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch(() => {
        // Supabase 到達不能時はログアウト状態として表示
        setUser(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    });
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  // 初期ロード中はプレースホルダーを表示してレイアウトシフトを防ぐ
  if (user === undefined) {
    return <div className="w-16 h-7" />;
  }

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="text-xs font-medium text-ink h-7 px-3 rounded-full bg-gray-100 active:bg-gray-200 whitespace-nowrap"
      >
        ログイン
      </button>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const name = user.user_metadata?.full_name as string | undefined;
  const initial = (name ?? user.email ?? "U").slice(0, 1).toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      {/* アバターボタン */}
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full overflow-hidden bg-clay/20 flex items-center justify-center shrink-0 active:opacity-70"
        aria-label={`${name ?? "ユーザー"}のメニューを開く`}
        aria-expanded={menuOpen}
      >
        {avatarUrl && !avatarError ? (
          <Image
            src={avatarUrl}
            alt={name ?? "ユーザー"}
            width={36}
            height={36}
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span className="text-xs font-bold text-clay">{initial}</span>
        )}
      </button>

      {/* ドロップダウンメニュー */}
      {menuOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[140px] bg-paper rounded-card shadow-card border border-gray-100 overflow-hidden">
          {name && (
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[11px] text-gray-500 truncate">{name}</p>
            </div>
          )}
          <Link
            href="/favorites"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M10 17S3 12.5 3 8a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            お気に入り
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 text-sm text-ink hover:bg-gray-50 active:bg-gray-100 transition-colors border-t border-gray-100"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
