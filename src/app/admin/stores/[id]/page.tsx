import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaceWithCache } from "@/lib/places/cache";
import type { TagMaster, PriceRange } from "@/types/store";
import { saveStoreTags } from "./actions";

const PRICE_OPTIONS: { value: PriceRange; symbol: string; label: string }[] = [
  { value: 1, symbol: "¥", label: "〜¥3,000" },
  { value: 2, symbol: "¥¥", label: "¥3,000〜¥8,000" },
  { value: 3, symbol: "¥¥¥", label: "¥8,000〜¥20,000" },
  { value: 4, symbol: "¥¥¥¥", label: "¥20,000〜" },
];

export default async function AdminStoreEditPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const { data: store } = await supabase
    .from("stores")
    .select(
      "id, is_published, is_hidden, operator_review, nearest_station, price_range, google_place_id, is_real_store, store_tags(tag_id)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!store || !store.is_real_store) notFound();

  const place = store.google_place_id
    ? await getPlaceWithCache(store.google_place_id)
    : null;

  const { data: tagMasters } = await supabase
    .from("tag_masters")
    .select("id, type, slug, label_ja, sort_order")
    .in("type", ["style", "vibe", "gender", "age_group"])
    .order("type")
    .order("sort_order");

  const allTags = (tagMasters ?? []) as unknown as TagMaster[];
  const selectedTagIds = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (store.store_tags ?? []).map((t: any) => t.tag_id as number)
  );

  const byType = (type: string) => allTags.filter((t) => t.type === type);

  return (
    <div className="space-y-6 pb-10">
      <Link href="/admin" className="text-xs text-gray-500 active:opacity-70">
        ← 一覧に戻る
      </Link>

      {/* Places参考情報（保存されない） */}
      <section className="rounded-card bg-white shadow-card p-4 space-y-1">
        <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-1">
          Places情報（参考・保存されません）
        </h2>
        {place ? (
          <>
            <p className="text-sm font-semibold text-ink">{place.name}</p>
            <p className="text-xs text-gray-500">{place.formattedAddress}</p>
            {place.rating && (
              <p className="text-xs text-gray-500">
                ★{place.rating.toFixed(1)}
                {place.userRatingCount ? `（${place.userRatingCount}件）` : ""}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-400">Places情報を取得できませんでした</p>
        )}
      </section>

      <form action={saveStoreTags.bind(null, store.id)} className="space-y-6">
        <TagCheckboxGroup
          title="系統タグ"
          tags={byType("style")}
          selectedIds={selectedTagIds}
        />
        <TagCheckboxGroup
          title="雰囲気タグ"
          tags={byType("vibe")}
          selectedIds={selectedTagIds}
        />
        <TagCheckboxGroup
          title="客層タグ"
          tags={[...byType("gender"), ...byType("age_group")]}
          selectedIds={selectedTagIds}
        />

        <section>
          <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
            価格帯
          </h2>
          <div className="flex flex-wrap gap-3">
            {PRICE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1.5 text-sm text-ink">
                <input
                  type="radio"
                  name="priceRange"
                  value={opt.value}
                  defaultChecked={store.price_range === opt.value}
                />
                {opt.symbol}
              </label>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
            最寄駅
          </label>
          <input
            name="nearestStation"
            defaultValue={store.nearest_station ?? ""}
            className="w-full h-10 rounded-button border border-gray-300 px-3 text-sm"
          />
        </section>

        <section>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
            スタッフより一言
          </label>
          <textarea
            name="operatorReview"
            defaultValue={store.operator_review ?? ""}
            rows={4}
            className="w-full rounded-button border border-gray-300 p-3 text-sm"
          />
        </section>

        <section>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="isPublished"
              value="true"
              defaultChecked={store.is_published}
            />
            公開する
          </label>
        </section>

        <button
          type="submit"
          className="w-full h-12 rounded-button bg-clay text-paper text-sm font-bold active:opacity-80"
        >
          保存
        </button>
      </form>
    </div>
  );
}

function TagCheckboxGroup({
  title,
  tags,
  selectedIds,
}: {
  title: string;
  tags: TagMaster[];
  selectedIds: Set<number>;
}) {
  if (tags.length === 0) return null;
  return (
    <section>
      <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-label mb-2">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <label
            key={tag.id}
            className="flex items-center gap-1.5 text-xs bg-gray-100 px-2.5 py-1.5 rounded-full text-ink"
          >
            <input
              type="checkbox"
              name="tag"
              value={tag.id}
              defaultChecked={selectedIds.has(tag.id)}
            />
            {tag.label_ja}
          </label>
        ))}
      </div>
    </section>
  );
}
