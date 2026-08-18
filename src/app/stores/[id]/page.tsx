import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import HeroCarousel from "@/components/store/HeroCarousel";
import ClothesCarousel from "@/components/store/ClothesCarousel";
import HoursSection from "@/components/store/HoursSection";
import ReviewSection from "@/components/store/ReviewSection";
import PoweredByGoogle from "@/components/store/PoweredByGoogle";
import PolicyLink from "@/components/store/PolicyLink";
import FavoriteButton from "@/components/auth/FavoriteButton";
import BackButton from "@/components/layout/BackButton";
import type { PriceRange, Store, StoreLinks, TagType } from "@/types/store";
import { mergeStoreWithPlace } from "@/lib/places/merge";
import { getPlacePhotoUrl } from "@/lib/places/photo";

const PRICE_SYMBOLS: Record<PriceRange, string> = {
  1: "¥",
  2: "¥¥",
  3: "¥¥¥",
  4: "¥¥¥¥",
};

const PRICE_LABELS: Record<PriceRange, string> = {
  1: "〜¥3,000",
  2: "¥3,000〜¥8,000",
  3: "¥8,000〜¥20,000",
  4: "¥20,000〜",
};

const VIBE_CHECKLIST: Record<string, string> = {
  "easy-solo":          "一人でふらっと入れる",
  "beginner-friendly":  "ファッション初心者でも安心",
  "staff-quiet":        "自分のペースでゆっくり見られる",
  "staff-helpful":      "スタッフに気軽に相談できる",
  "instagram-worthy":   "写真映えする空間づくり",
  "quiet-atmosphere":   "落ち着いてじっくり選べる",
  "good-music":         "流れる音楽が心地よい",
  "large-fitting-room": "試着室が広くて使いやすい",
  "frequent-sale":      "セールやお得な企画が多い",
  "single-item":        "1点から気軽に買いやすい",
  "coordinate-display": "コーデのヒントになる展示が多い",
  "unique-items":       "ここでしか出会えないアイテムがある",
  "pet-friendly":       "ペットと一緒に来られる",
};

const ENTRY_SCORE_SLUGS = [
  "easy-solo",
  "beginner-friendly",
  "staff-quiet",
  "staff-helpful",
  "quiet-atmosphere",
];

type Tag = { type: string; slug: string; label_ja: string };

type StoreDetailRow = Store & {
  name_kana?: string | null;
  operator_review?: string | null;
  store_photos: { id: string; url: string; caption: string | null; is_main: boolean; sort_order: number }[];
  store_tags?: { tag_masters: Tag | null }[];
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stylemap.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: store } = await supabase
    .from("stores")
    .select(
      "name, address, nearest_station, lat, lng, hours, links, is_real_store, google_place_id, store_photos(url, is_main, sort_order), store_tags(tag_masters(type, label_ja))"
    )
    .eq("id", params.id)
    .eq("is_hidden", false)
    .maybeSingle();

  if (!store) return { title: "店舗が見つかりません" };

  const storeWithPlace = await mergeStoreWithPlace(store as unknown as Store);
  const place = storeWithPlace.place;
  if (!place) return { title: "店舗が見つかりません" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styleTags = (store.store_tags ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((st: any) => st.tag_masters)
    .filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => t.type === "style")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => t.label_ja) as string[];

  const descParts = [
    styleTags.length > 0 ? styleTags.join("・") + "系" : null,
    store.nearest_station ? `${store.nearest_station}エリア` : null,
    place.formattedAddress,
  ].filter(Boolean);
  const description =
    descParts.join(" / ") ||
    "StyleMap - 自分に合う服屋を見つける、ファッション特化型店舗検索マップ";

  const mainPhotoUrl = store.is_real_store
    ? place.photos[0]
      // OGP画像は絶対URLが必要なため、プロキシルートに SITE_URL を付与する
      ? `${SITE_URL}${getPlacePhotoUrl(place.photos[0].name)}`
      : undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : [...(store.store_photos ?? [])].sort((a: any, b: any) => {
        if (a.is_main && !b.is_main) return -1;
        if (!a.is_main && b.is_main) return 1;
        return a.sort_order - b.sort_order;
      })[0]?.url;

  const storeUrl = `${SITE_URL}/stores/${params.id}`;

  return {
    title: place.name,
    description,
    alternates: { canonical: storeUrl },
    openGraph: {
      title: `${place.name} | StyleMap`,
      description,
      url: storeUrl,
      type: "website",
      images: mainPhotoUrl ? [{ url: mainPhotoUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${place.name} | StyleMap`,
      description,
      images: mainPhotoUrl ? [mainPhotoUrl] : [],
    },
  };
}

export default async function StorePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: store }, { data: clothesRaw }, authResult] = await Promise.all([
    supabase
      .from("stores")
      .select(
        "id, name, name_kana, address, nearest_station, lat, lng, price_range, hours, links, operator_review, is_real_store, google_place_id, store_photos(id, url, caption, is_main, sort_order), store_tags(tag_masters(type, slug, label_ja))"
      )
      .eq("id", params.id)
      .eq("is_hidden", false)
      .maybeSingle(),
    supabase
      .from("clothes")
      .select("id, name, price, image_url, category")
      .eq("store_id", params.id)
      .eq("is_published", true)
      .order("created_at"),
    supabase.auth.getUser(),
  ]);

  if (!store) notFound();

  const storeWithPlace = await mergeStoreWithPlace(store as unknown as StoreDetailRow);
  const place = storeWithPlace.place;
  if (!place) notFound();

  const user = authResult.data.user;
  const clothes = clothesRaw ?? [];

  let initialFavorited = false;
  let favoritedClothesIds: string[] = [];

  if (user) {
    const [{ count }, { data: favs }] = await Promise.all([
      supabase
        .from("favorites")
        .select("store_id", { count: "exact", head: true })
        .eq("store_id", store.id),
      clothes.length > 0
        ? supabase
            .from("clothes_favorites")
            .select("clothes_id")
            .in("clothes_id", clothes.map((c) => c.id))
        : Promise.resolve({ data: [] }),
    ]);
    initialFavorited = (count ?? 0) > 0;
    favoritedClothesIds = (favs ?? []).map((f) => f.clothes_id as string);
  }

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, user_id")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  const allReviews = reviewsData ?? [];
  const reviewCount = allReviews.length;
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const displayReviews = allReviews.slice(0, 5);
  const currentUserReview = user
    ? (allReviews.find((r) => r.user_id === user.id) ?? null)
    : null;

  const photos = store.is_real_store
    ? place.photos.map((p, i) => ({
        id: p.name,
        url: getPlacePhotoUrl(p.name),
        caption: null,
        is_main: i === 0,
        sort_order: i,
      }))
    : [...(store.store_photos ?? [])].sort((a, b) => {
        if (a.is_main && !b.is_main) return -1;
        if (!a.is_main && b.is_main) return 1;
        return a.sort_order - b.sort_order;
      });

  const allTags: Tag[] = (store.store_tags ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((st: any) => st.tag_masters)
    .filter(Boolean);

  const byType = (type: TagType) => allTags.filter((t) => t.type === type);
  const styleTags  = byType("style");
  const vibeTags   = byType("vibe");
  const genderTags = byType("gender");
  const ageGroupTags = byType("age_group");

  const entryScore = vibeTags.filter((t) =>
    ENTRY_SCORE_SLUGS.includes(t.slug)
  ).length;

  // Instagramはstyle独自のリンクなのでPlacesとは無関係にDBの値をそのまま使う
  const links = store.links as unknown as StoreLinks;
  const priceRange = store.price_range as PriceRange;

  const directionsUrl =
    place.googleMapsUri ||
    `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: place.name,
    address: place.formattedAddress,
    url: `${SITE_URL}/stores/${store.id}`,
    ...(photos[0] && {
      image: photos
        .slice(0, 3)
        .map((p) => (p.url.startsWith("/") ? `${SITE_URL}${p.url}` : p.url)),
    }),
    ...(store.nearest_station && {
      description: `${store.nearest_station}エリアの服屋`,
    }),
  };

  return (
    <div className="min-h-[100dvh] bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* スティッキーヘッダー（戻るボタンのみ） */}
      <div className="sticky top-0 z-10 flex items-center px-4 h-12 bg-paper/90 backdrop-blur-sm border-b border-gray-100">
        <BackButton />
      </div>

      {/* ① ヒーロー写真カルーセル */}
      <HeroCarousel photos={photos} storeName={place.name} />

      <div className="px-4 py-5 space-y-6">

        {/* ② 店名 ＋ ハートボタン */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold text-ink leading-tight">
              {place.name}
            </h1>
            {store.name_kana && (
              <p className="text-xs text-gray-500 mt-0.5">{store.name_kana}</p>
            )}
          </div>
          <FavoriteButton storeId={store.id} initialFavorited={initialFavorited} />
        </div>

        {/* ③ 特徴タグ ＋ 価格帯バッジ */}
        <div className="flex flex-wrap gap-1.5 -mt-2">
          {styleTags.map((tag) => (
            <span
              key={tag.slug}
              className="text-xs bg-clay/15 text-clay px-2.5 py-1 rounded-full font-medium"
            >
              {tag.label_ja}
            </span>
          ))}
          <span className="text-xs bg-ink text-paper px-2.5 py-1 rounded-full font-price">
            {PRICE_SYMBOLS[priceRange]}&ensp;{PRICE_LABELS[priceRange]}
          </span>
          {place.rating && (
            <span className="text-xs bg-gray-100 text-ink px-2.5 py-1 rounded-full">
              Google評価&ensp;★{place.rating.toFixed(1)}
              {place.userRatingCount ? `（${place.userRatingCount}件）` : ""}
            </span>
          )}
        </div>

        {/* ④ 服一覧カルーセル */}
        {clothes.length > 0 && (
          <section>
            <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-3">
              服一覧
            </h2>
            <ClothesCarousel
              clothes={clothes}
              storeName={place.name}
              initialFavoritedIds={favoritedClothesIds}
            />
          </section>
        )}

        {/* ⑤ 住所 */}
        <section>
          <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-1.5">
            住所
          </h2>
          <p className="text-sm text-ink">{place.formattedAddress}</p>
          <p className="text-xs text-gray-500 mt-1">
            最寄駅：{store.nearest_station}
          </p>
          {place.nationalPhoneNumber && (
            <a
              href={`tel:${place.nationalPhoneNumber}`}
              className="text-xs text-clay mt-1 inline-block active:opacity-70"
            >
              {place.nationalPhoneNumber}
            </a>
          )}
        </section>

        {/* ⑥ 営業時間（今日 → タップで全曜日展開） */}
        <section className="rounded-card bg-white shadow-card p-4">
          <HoursSection openingHours={place.openingHours} />
        </section>

        {/* ⑦ 入店前チェック */}
        {vibeTags.length > 0 && (
          <section>
            <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-2">
              入店前チェック
            </h2>
            <div className="rounded-card bg-white shadow-card p-4">
              <ul className="space-y-3">
                {vibeTags.map((tag) => (
                  <li key={tag.slug} className="flex items-start gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full bg-clay shrink-0 mt-1.5"
                      aria-hidden
                    />
                    <span className="text-sm text-ink leading-snug">
                      {VIBE_CHECKLIST[tag.slug] ?? tag.label_ja}
                    </span>
                  </li>
                ))}
              </ul>
              {entryScore > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500 tracking-label uppercase">
                    入りやすさ
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i <= entryScore ? "bg-clay" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ⑧ スタッフより一言 */}
        {store.operator_review && (
          <section>
            <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-2">
              スタッフより
            </h2>
            <blockquote className="border-l-4 border-clay pl-4">
              <p className="text-sm text-ink leading-relaxed">
                {store.operator_review}
              </p>
            </blockquote>
          </section>
        )}

        {/* ⑨ 主な客層 */}
        {(genderTags.length > 0 || ageGroupTags.length > 0) && (
          <section>
            <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-2">
              主な客層
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {[...genderTags, ...ageGroupTags].map((tag) => (
                <span
                  key={tag.slug}
                  className="text-xs bg-gray-100 text-ink px-2.5 py-1 rounded-full"
                >
                  {tag.label_ja}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ⑩ レビュー */}
        <ReviewSection
          storeId={store.id}
          initialReviews={displayReviews}
          initialTotalRating={totalRating}
          initialReviewCount={reviewCount}
          currentUserId={user?.id ?? null}
          currentUserReview={currentUserReview}
        />

        {/* ⑪ 外部リンク（Instagram・公式サイト） */}
        {(links?.instagram || place.websiteUri) && (
          <section className="space-y-2.5">
            {links.instagram && (
              <a
                href={links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-button border border-gray-300 text-ink text-sm font-medium active:opacity-80"
              >
                <InstagramIcon />
                Instagramを見る
              </a>
            )}
            {place.websiteUri && (
              <a
                href={place.websiteUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-button border border-gray-300 text-ink text-sm font-medium active:opacity-80"
              >
                <GlobeIcon />
                公式サイトを見る
              </a>
            )}
          </section>
        )}

        {/* ⑫ 経路ボタン */}
        <section className="pb-[calc(56px+2rem+env(safe-area-inset-bottom))]">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-button bg-clay text-paper text-sm font-medium active:opacity-80"
          >
            <NavigationIcon />
            経路を調べる
          </a>
          {/* Powered by Google（実店舗のみ） */}
          {store.is_real_store && <PoweredByGoogle />}
          <PolicyLink />
        </section>

      </div>
    </div>
  );
}

function NavigationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5l5.5 13L8 11 2.5 14.5 8 1.5z"
        fill="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="3"
        stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.5" cy="4.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="8" cy="8" rx="2.5" ry="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 8h12" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
