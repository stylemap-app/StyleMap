"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// 全ての操作で is_real_store=false をクエリ条件に必ず含める。
// 呼び出し元（クライアント）から不正な storeId/areaId が渡されても、
// このフィルタがある限り実店舗の行には一切当たらないため、
// 「実店舗を誤って操作できない」ことをDBクエリレベルで保証する。

export async function toggleDummyStoreHidden(storeId: string, nextHidden: boolean) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  await supabase
    .from("stores")
    .update({ is_hidden: nextHidden })
    .eq("id", storeId)
    .eq("is_real_store", false);

  revalidatePath("/admin/dummy");
}

// store_tags/store_photos/favorites/reviews/clothes は stores(id) に
// ON DELETE CASCADE を張っているため、stores の行を消すだけで
// DBが原子的に関連レコードもまとめて削除する（Phase Dの単体削除と同じ方針）
export async function deleteDummyStore(storeId: string) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("stores")
    .delete()
    .eq("id", storeId)
    .eq("is_real_store", false);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dummy");
}

export async function hideAreaDummyStores(areaId: string) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  await supabase
    .from("stores")
    .update({ is_hidden: true })
    .eq("area_id", areaId)
    .eq("is_real_store", false);

  revalidatePath("/admin/dummy");
}

export async function deleteAreaDummyStores(
  areaId: string
): Promise<{ deletedCount: number }> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .delete()
    .eq("area_id", areaId)
    .eq("is_real_store", false)
    .select("id");

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dummy");
  return { deletedCount: data?.length ?? 0 };
}

export async function hideAllDummyStores() {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  await supabase.from("stores").update({ is_hidden: true }).eq("is_real_store", false);

  revalidatePath("/admin/dummy");
}

export async function deleteAllDummyStores(): Promise<{ deletedCount: number }> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .delete()
    .eq("is_real_store", false)
    .select("id");

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dummy");
  return { deletedCount: data?.length ?? 0 };
}
