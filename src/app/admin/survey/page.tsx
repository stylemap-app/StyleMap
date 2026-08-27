import { createAdminClient } from "@/lib/supabase/admin";
import { mergeStoresWithPlaces } from "@/lib/places/merge";
import type { Store, TagMaster } from "@/types/store";
import type { SurveyStatus } from "@/lib/surveyStatus";
import { AREAS, AREA_ID_MAP } from "@/lib/areas";
import SurveyClient, { type SurveyStore } from "./SurveyClient";

type AdminStoreRow = Store & {
  area_id: string | null;
  survey_status: SurveyStatus;
  store_tags?: { tag_id: number }[];
};

const AREA_ID_TO_NAME = new Map(
  Object.entries(AREA_ID_MAP).map(([slug, id]) => [
    id,
    AREAS.find((a) => a.slug === slug)?.name ?? slug,
  ])
);

export default async function AdminSurveyPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("stores")
    .select(
      "id, name, address, lat, lng, nearest_station, price_range, hours, links, operator_review, is_published, is_hidden, is_real_store, google_place_id, area_id, created_at, survey_status, store_tags(tag_id)"
    )
    .eq("is_real_store", true)
    .order("name");

  const { data: tagMasterRows } = await supabase
    .from("tag_masters")
    .select("id, type, slug, label_ja, sort_order")
    .in("type", ["style", "vibe", "gender", "age_group"])
    .order("type")
    .order("sort_order");

  const rows = (data ?? []) as unknown as AdminStoreRow[];
  const storesWithPlace = await mergeStoresWithPlaces(rows);

  const surveyStores: SurveyStore[] = storesWithPlace
    // Places情報が取れない店舗は店名・座標を表示できないため対象外
    .filter((s) => s.place)
    .map((s) => ({
      id: s.id,
      name: s.place!.name,
      areaName: s.area_id ? AREA_ID_TO_NAME.get(s.area_id) ?? "-" : "-",
      // 表示（現在地からの距離計算）のみに使用し、DBには保存しない
      lat: s.place!.location.lat,
      lng: s.place!.location.lng,
      surveyStatus: s.survey_status,
      selectedTagIds: (s.store_tags ?? []).map((t) => t.tag_id),
      priceRange: s.price_range,
      operatorReview: s.operator_review ?? "",
    }));

  return (
    <SurveyClient stores={surveyStores} allTags={(tagMasterRows ?? []) as TagMaster[]} />
  );
}
