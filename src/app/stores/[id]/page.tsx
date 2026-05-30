import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroCarousel from "@/components/store/HeroCarousel";
import FavoriteButton from "@/components/auth/FavoriteButton";
import type { PriceRange, StoreHours, StoreLinks, TagType } from "@/types/store";

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

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

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

export default async function StorePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: store } = await supabase
    .from("stores")
    .select(
      "id, name, name_kana, address, nearest_station, price_range, hours, links, operator_review, store_photos(id, url, caption, is_main, sort_order), store_tags(tag_masters(type, slug, label_ja))"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!store) notFound();

  const photos = [...(store.store_photos ?? [])].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return a.sort_order - b.sort_order;
  });

  const allTags: Tag[] = (store.store_tags ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((st: any) => st.tag_masters)
    .filter(Boolean);

  const byType = (type: TagType) => allTags.filter((t) => t.type === type);
  const styleTags = byType("style");
  const vibeTags = byType("vibe");
  const genderTags = byType("gender");
  const ageGroupTags = byType("age_group");

  const entryScore = vibeTags.filter((t) =>
    ENTRY_SCORE_SLUGS.includes(t.slug)
  ).length;

  const hours = store.hours as unknown as StoreHours;
  const links = store.links as unknown as StoreLinks;
  const priceRange = store.price_range as PriceRange;

  return (
    <div className="min-h-[100dvh] bg-paper">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-12 bg-paper/90 backdrop-blur-sm border-b border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-ink active:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm">戻る</span>
        </Link>
        <FavoriteButton />
      </div>

      {/* ヒーロー画像 */}
      <HeroCarousel photos={photos} storeName={store.name} />

      {/* メインコンテンツ */}
      <div className="px-4 py-5 space-y-6">

        {/* 1. 店名・系統タグ・価格帯 */}
        <section>
          <h1 className="text-[22px] font-bold text-ink leading-tight">
            {store.name}
          </h1>
          {store.name_kana && (
            <p className="text-xs text-gray-500 mt-0.5">{store.name_kana}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-3">
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
          </div>
        </section>

        {/* 2. 入店前チェック */}
        {vibeTags.length > 0 && (
          <section>
            <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-2">
              入店前チェック
            </h2>
            <div className="rounded-card bg-white shadow-card p-4">
              <ul className="space-y-3">
                {vibeTags.map((tag) => (
                  <li key={tag.slug} className="flex items-start gap-2.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 mt-0.5 text-clay"
                      aria-hidden
                    >
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                      <path
                        d="M5 8l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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

        {/* 3. 営業時間・住所 */}
        <section className="rounded-card bg-white shadow-card p-4 space-y-5">
          <div>
            <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-2.5">
              営業時間
            </h2>
            <div className="space-y-1.5">
              {hours?.regular?.map((day, i) => (
                <div key={i} className="flex text-sm">
                  <span className="w-5 shrink-0 text-gray-500">
                    {DAY_NAMES[i]}
                  </span>
                  <span className="ml-4 text-ink">
                    {day.open && day.close
                      ? `${day.open} – ${day.close}`
                      : "定休日"}
                  </span>
                </div>
              ))}
            </div>
            {hours?.note && (
              <p className="text-xs text-gray-500 mt-2">{hours.note}</p>
            )}
          </div>

          <div>
            <h2 className="text-[11px] font-medium text-gray-500 tracking-label uppercase mb-1.5">
              住所
            </h2>
            <p className="text-sm text-ink">{store.address}</p>
            <p className="text-xs text-gray-500 mt-1">
              最寄駅：{store.nearest_station}
            </p>
          </div>
        </section>

        {/* 4. 運営からの一言 */}
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

        {/* 5. 主な客層 */}
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

        {/* 6. アクションボタン */}
        <section className="space-y-2.5 pb-8">
          {links?.google_maps && (
            <a
              href={links.google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-button bg-ink text-paper text-sm font-medium active:opacity-80"
            >
              <MapIcon />
              Googleマップで見る
            </a>
          )}
          {links?.instagram && (
            <a
              href={links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-button border border-ink text-ink text-sm font-medium active:opacity-80"
            >
              <InstagramIcon />
              Instagramを見る
            </a>
          )}
          {links?.official_site && (
            <a
              href={links.official_site}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-button border border-gray-300 text-ink text-sm font-medium active:opacity-80"
            >
              <GlobeIcon />
              公式サイトを見る
            </a>
          )}
        </section>

      </div>
    </div>
  );
}

function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.25 4.5 8.5 4.5 8.5S12.5 9.25 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.5" cy="4.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <ellipse
        cx="8"
        cy="8"
        rx="2.5"
        ry="6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M2 8h12" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
