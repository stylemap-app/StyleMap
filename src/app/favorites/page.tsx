import { createClient } from "@/lib/supabase/server";
import { getUserLists } from "@/lib/favorites";
import FavoritesClient from "./FavoritesClient";
import FavoritesLoginPrompt from "./FavoritesLoginPrompt";

export default async function FavoritesPage() {
  const supabase = createClient();

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase 到達不能時は未ログインとして扱う
  }

  if (!user) {
    return <FavoritesLoginPrompt />;
  }

  const lists = await getUserLists(supabase);

  return <FavoritesClient initialLists={lists} userId={user.id} />;
}
