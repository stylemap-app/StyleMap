import type { Metadata } from "next";
import { Noto_Sans_JP, DM_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const noto = Noto_Sans_JP({
  // Noto_Sans_JP は next/font で "japanese" subset を持たないため latin のみ。
  // CJK グリフは font ファイル自体に含まれており自己ホストで正しく配信される。
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
  // 相対 URL（OGP 画像など）の解決ベース。本番は NEXT_PUBLIC_SITE_URL で上書き
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://stylemap.vercel.app"
  ),
  title: {
    default: "StyleMap",
    template: "%s | StyleMap",
  },
  description: "自分に合う服屋を見つける、ファッション特化型店舗検索マップ",
  openGraph: {
    siteName: "StyleMap",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${noto.variable} ${dmMono.variable}`}>
      <body className="font-sans">
        {children}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
