"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleStoreHidden(storeId: string, nextHidden: boolean) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  await supabase.from("stores").update({ is_hidden: nextHidden }).eq("id", storeId);

  revalidatePath("/admin");
}

// 一覧からその場で公開/非公開を切り替える。タグ編集画面（/admin/stores/[id]）の
// 「公開する」チェックボックスと同じ is_published を更新するだけの軽量版。
export async function toggleStorePublished(storeId: string, nextPublished: boolean) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();
  await supabase.from("stores").update({ is_published: nextPublished }).eq("id", storeId);

  revalidatePath("/admin");
}

// 一覧のチェックボックス選択から複数店舗をまとめて公開/非公開にする。
// is_real_store=true をクエリ条件に含め、ダミー店舗には影響しないことを
// DBクエリレベルで保証する
export async function bulkSetPublished(
  storeIds: string[],
  nextPublished: boolean
): Promise<{ updatedCount: number }> {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");
  if (storeIds.length === 0) return { updatedCount: 0 };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .update({ is_published: nextPublished })
    .in("id", storeIds)
    .eq("is_real_store", true)
    .select("id");

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { updatedCount: data?.length ?? 0 };
}

// is_hidden（一時的な非表示。データは残る）とは別の完全削除。
// store_tags / store_photos / favorites / reviews / clothes は
// すべて stores(id) に ON DELETE CASCADE を張っているため、
// stores の行を消すだけでDBが原子的に関連レコードもまとめて削除する
// （アプリ側で4テーブルを順番にDELETEするより、途中失敗による孤児レコードの
//  リスクがなく安全）。
export async function deleteStore(storeId: string) {
  const user = await getAdminUser();
  if (!user) throw new Error("Forbidden");

  const supabase = createAdminClient();

  const { data: store, error: fetchError } = await supabase
    .from("stores")
    .select("id, is_real_store")
    .eq("id", storeId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!store) throw new Error("店舗が見つかりません");
  // ダミー店舗の誤削除防止。UI側でもボタンを出さないが、Server Actionは
  // 直接呼び出せるエンドポイントのためここでも再検証する。
  if (!store.is_real_store) throw new Error("ダミー店舗は削除できません");

  const { error } = await supabase.from("stores").delete().eq("id", storeId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}
