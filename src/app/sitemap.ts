import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// 本番ドメインは NEXT_PUBLIC_SITE_URL 環境変数で上書き可能
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stylemap.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("id")
    .eq("is_published", true);

  const storeUrls: MetadataRoute.Sitemap = (stores ?? []).map((store) => ({
    url: `${BASE_URL}/stores/${store.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...storeUrls,
  ];
}
