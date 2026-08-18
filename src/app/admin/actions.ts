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
