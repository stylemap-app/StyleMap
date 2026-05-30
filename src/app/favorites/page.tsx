import { createClient } from "@/lib/supabase/server";
import { getUserLists } from "@/lib/favorites";
import FavoritesClient from "./FavoritesClient";
import FavoritesLoginPrompt from "./FavoritesLoginPrompt";

export default async function FavoritesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <FavoritesLoginPrompt />;
  }

  const lists = await getUserLists(supabase);

  return <FavoritesClient initialLists={lists} userId={user.id} />;
}
