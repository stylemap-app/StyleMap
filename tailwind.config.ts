import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── カラーパレット ──────────────────────────────────────────────
      colors: {
        ink:   "#1A1816",
        paper: "#F7F5F0",
        clay:  "#D4714A",
        // Tailwind デフォルトの gray を StyleMap 用の値で上書き
        gray: {
          900: "#2C2A27",
          600: "#78746E",
          300: "#C5C0B8",
          100: "#ECEAE5",
        },
      },

      // ── フォント ────────────────────────────────────────────────────
      // Next.js の next/font/google が layout.tsx で CSS 変数を注入する
      fontFamily: {
        sans: ["var(--font-noto)", "Noto Sans JP", "sans-serif"],
        mono: ["var(--font-dm-mono)", "DM Mono", "monospace"],
      },

      // ── 文字間隔（タイプスケールに合わせた 3 値）──────────────────
      letterSpacing: {
        heading:    "-0.02em",
        subheading: "-0.01em",
        label:      "0.02em",
      },

      // ── 角丸（意味のある名前で管理）────────────────────────────────
      borderRadius: {
        card:   "12px",
        sheet:  "16px",
        button: "8px",
        photo:  "8px",
      },

      // ── 影（Ink の RGB 値ベースで色の浮きを防ぐ）────────────────────
      boxShadow: {
        card:  "0 1px 4px rgba(26,24,22,0.05), 0 4px 16px rgba(26,24,22,0.06)",
        pin:   "0 2px 8px rgba(26,24,22,0.22)",
        sheet: "0 -4px 24px rgba(26,24,22,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
