"use server";

import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveStoreTags(storeId: string, formData: FormData) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const tagIds = formData
    .getAll("tag")
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  const priceRangeRaw = formData.get("priceRange");
  const priceRange = priceRangeRaw ? Number(priceRangeRaw) : null;
  const nearestStation =
    (formData.get("nearestStation") as string | null)?.trim() || null;
  const operatorReview =
    (formData.get("operatorReview") as string | null)?.trim() || null;
  const isPublished = formData.get("isPublished") === "true";

  const supabase = createAdminClient();

  await supabase
    .from("stores")
    .update({
      price_range: priceRange,
      nearest_station: nearestStation,
      operator_review: operatorReview,
      operator_review_updated_at: operatorReview ? new Date().toISOString() : null,
      is_published: isPublished,
    })
    .eq("id", storeId);

  await supabase.from("store_tags").delete().eq("store_id", storeId);
  if (tagIds.length > 0) {
    await supabase
      .from("store_tags")
      .insert(tagIds.map((tagId) => ({ store_id: storeId, tag_id: tagId })));
  }

  redirect("/admin");
}
