"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function BottomNav() {
  const pathname = usePathname();

  const isSearch = pathname === "/";
  const isFavorites = pathname.startsWith("/favorites");
  const isTryon = pathname.startsWith("/tryon");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-paper border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center h-14">
        {/* 探す */}
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isSearch ? "text-ink" : "text-gray-400"
          }`}
        >
          <SearchIcon />
          <span className="text-[10px] font-medium">探す</span>
        </Link>

        {/* お気に入り */}
        <Link
          href="/favorites"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isFavorites ? "text-ink" : "text-gray-400"
          }`}
        >
          <HeartIcon filled={isFavorites} />
          <span className="text-[10px] font-medium">お気に入り</span>
        </Link>

        {/* 試着 */}
        <Link
          href="/tryon"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isTryon ? "text-clay" : "text-gray-400"
          }`}
        >
          <TshirtIcon />
          <span className="text-[10px] font-medium">試着</span>
        </Link>
      </div>
    </nav>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M20 20l-3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function TshirtIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 8l3-4h3a3 3 0 006 0h3l3 4-3 2v10H6V10L3 8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
