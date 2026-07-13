import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import BackButton from "@/components/layout/BackButton";
import ClothesFavoriteButton from "@/components/auth/ClothesFavoriteButton";

const CATEGORY_ICON: Record<string, string> = {
  トップス: "👕",
  パンツ: "👖",
  アウター: "🧥",
  靴: "👟",
  アクセサリー: "💍",
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stylemap.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: cloth } = await supabase
    .from("clothes")
    .select("name, price, category, image_url")
    .eq("id", params.id)
    .eq("is_published", true)
    .maybeSingle();

  if (!cloth) return { title: "服が見つかりません" };

  const description = `${cloth.category} / ¥${cloth.price.toLocaleString()} | StyleMap`;

  return {
    title: cloth.name,
    description,
    openGraph: {
      title: `${cloth.name} | StyleMap`,
      description,
      url: `${SITE_URL}/clothes/${params.id}`,
      images: [{ url: cloth.image_url }],
    },
  };
}

export default async function ClothesDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: cloth }, authResult] = await Promise.all([
    supabase
      .from("clothes")
      .select(
        "id, name, price, image_url, category, brand, description, store_id, stores(id, name, nearest_station)"
      )
      .eq("id", params.id)
      .eq("is_published", true)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!cloth) notFound();

  const user = authResult.data.user;
  let initialFavorited = false;
  if (user) {
    const { count } = await supabase
      .from("clothes_favorites")
      .select("clothes_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("clothes_id", cloth.id);
    initialFavorited = (count ?? 0) > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = cloth.stores as any;

  return (
    <div className="min-h-[100dvh] bg-paper">
      {/* スティッキーヘッダー */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-2 h-12 bg-paper/90 backdrop-blur-sm border-b border-gray-100">
        <BackButton />
        <ClothesFavoriteButton
          clothesId={cloth.id}
          initialFavorited={initialFavorited}
        />
      </div>

      {/* 服の画像（3:4 アスペクト比） */}
      <div
        className="relative w-full bg-gray-100"
        style={{ aspectRatio: "3 / 4" }}
      >
        <ImageWithFallback
          src={cloth.image_url}
          alt={cloth.name}
          sizes="100vw"
          priority
        />
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* カテゴリ＋ブランド */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-gray-100 text-ink px-2.5 py-1 rounded-full">
            {CATEGORY_ICON[cloth.category] ?? ""} {cloth.category}
          </span>
          {cloth.brand && (
            <span className="text-xs text-gray-500">{cloth.brand}</span>
          )}
        </div>

        {/* 商品名＋価格 */}
        <div>
          <h1 className="text-xl font-bold text-ink leading-tight">
            {cloth.name}
          </h1>
          <p className="text-2xl font-bold text-clay mt-2">
            ¥{cloth.price.toLocaleString()}
          </p>
        </div>

        {/* 説明文 */}
        {cloth.description && (
          <p className="text-sm text-ink leading-relaxed">{cloth.description}</p>
        )}

        {/* この服を販売している店 */}
        {store && (
          <section>
            <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-2">
              この服を販売している店
            </h2>
            <Link
              href={`/stores/${store.id}`}
              className="flex items-center justify-between rounded-card bg-white shadow-card p-4 active:opacity-80"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{store.name}</p>
                {store.nearest_station && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {store.nearest_station}
                  </p>
                )}
              </div>
              <ChevronRightIcon />
            </Link>
          </section>
        )}

        {/* ボトムナビ分の余白 */}
        <div style={{ height: "calc(56px + env(safe-area-inset-bottom) + 1rem)" }} />
      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="text-gray-400 shrink-0"
    >
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
