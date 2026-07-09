import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "試着",
};

export default function TryonPage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[100dvh] bg-paper gap-4"
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        className="text-clay"
        aria-hidden
      >
        <path
          d="M3 8l3-4h3a3 3 0 006 0h3l3 4-3 2v10H6V10L3 8z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-center space-y-1.5">
        <p className="text-[15px] font-semibold text-ink">試着機能は準備中です</p>
        <p className="text-sm text-gray-400">もうしばらくお待ちください</p>
      </div>
    </div>
  );
}
