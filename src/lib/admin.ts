import "server-only";
import { createClient } from "@/lib/supabase/server";

function getAdminIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ログイン中のユーザーがADMIN_USER_IDSに含まれていればそのユーザーを、
// そうでなければ null を返す。
// layout.tsx（ページ全体のnotFound判定）とServer Action（個別の認可）の
// 両方から呼ばれる。Server Actionはlayoutのガードを経由せず直接呼び出せる
// エンドポイントのため、必ずここで再検証すること。
export async function getAdminUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return getAdminIds().includes(user.id) ? user : null;
}
