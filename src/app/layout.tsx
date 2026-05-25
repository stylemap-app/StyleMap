import type { Metadata } from "next";
import { Noto_Sans_JP, DM_Mono } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StyleMap",
  description: "自分に合う服屋を見つける、ファッション特化型店舗検索マップ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${noto.variable} ${dmMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
