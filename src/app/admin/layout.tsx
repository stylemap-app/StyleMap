import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) notFound();

  return (
    <div className="min-h-[100dvh] bg-paper">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-12 bg-ink text-paper">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-bold">
            StyleMap Admin
          </Link>
          <Link href="/admin" className="text-xs text-paper/70 active:opacity-70">
            登録済み店舗
          </Link>
          <Link href="/admin/stores" className="text-xs text-paper/70 active:opacity-70">
            新規登録
          </Link>
          <Link href="/admin/stores/bulk" className="text-xs text-paper/70 active:opacity-70">
            一括登録
          </Link>
        </div>
        <Link href="/" className="text-xs text-paper/70 active:opacity-70">
          サイトに戻る
        </Link>
      </div>
      <div className="px-4 py-5">{children}</div>
    </div>
  );
}
