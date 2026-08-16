import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// service_role キーを使う管理者クライアント。RLSを常にバイパスするため、
// place_cache への書き込みなどサーバー専用の処理でのみ使用すること。
// クライアントバンドルに紛れ込むと "server-only" によりビルドエラーになる。
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "createAdminClient: NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です"
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
