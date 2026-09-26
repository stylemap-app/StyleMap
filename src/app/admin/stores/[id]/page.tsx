import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaceWithCache } from "@/lib/places/cache";
import type { TagMaster } from "@/types/store";
import {
  SURVEY_STATUS_LABEL,
  SURVEY_STATUS_BADGE_CLASS,
  type SurveyStatus,
} from "@/lib/surveyStatus";
import StoreTagForm from "./StoreTagForm";

export default async function AdminStoreEditPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const { data: store } = await supabase
    .from("stores")
    .select(
      "id, is_published, is_hidden, operator_review, nearest_station, price_range, google_place_id, is_real_store, survey_status, store_tags(tag_id)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!store || !store.is_real_store) notFound();

  const place = store.google_place_id
    ? await getPlaceWithCache(store.google_place_id)
    : null;

  const { data: tagMasters } = await supabase
    .from("tag_masters")
    .select("id, type, slug, label_ja, sort_order, is_active")
    .in("type", ["style", "category", "vibe", "gender", "age_group"])
    .eq("is_active", true)
    .order("type")
    .order("sort_order");

  const allTags = (tagMasters ?? []) as unknown as TagMaster[];
  const selectedTagIds = (store.store_tags ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (t: any) => t.tag_id as number
  );

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

      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        現在の状態：
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SURVEY_STATUS_BADGE_CLASS[store.survey_status as SurveyStatus]}`}
        >
          {SURVEY_STATUS_LABEL[store.survey_status as SurveyStatus]}
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${store.is_published ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
        >
          {store.is_published ? "公開中" : "未公開"}
        </span>
      </p>

      <StoreTagForm
        storeId={store.id}
        allTags={allTags}
        initialSelectedTagIds={selectedTagIds}
        initialPriceRange={store.price_range}
        initialNearestStation={store.nearest_station ?? ""}
        initialOperatorReview={store.operator_review ?? ""}
      />
    </div>
  );
}
