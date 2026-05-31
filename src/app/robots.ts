import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stylemap.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 認証コールバックと API ルートはクロール対象外
      disallow: ["/auth/", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
