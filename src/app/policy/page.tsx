import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "掲載ポリシー",
};

// TODO: 実際の問い合わせ先アドレスに差し替える
const CONTACT_EMAIL = "contact@stylemap.example";

export default function PolicyPage() {
  return (
    <div
      className="min-h-[100dvh] bg-paper"
      style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 grid grid-cols-3 items-center px-4 h-12 bg-paper/90 backdrop-blur-sm border-b border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-ink active:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm">戻る</span>
        </Link>
        <h1 className="text-[15px] font-bold text-ink text-center">
          掲載ポリシー
        </h1>
      </div>

      <div className="px-4 py-6 space-y-7">
        <h2 className="text-xl font-bold text-ink leading-tight">
          StyleMap 掲載ポリシー
        </h2>

        <PolicySection title="掲載情報について">
          <p>
            StyleMapに掲載されている店舗の基本情報（店名・住所・営業時間等）は、
            Google Maps Platform から取得した公開情報です。
          </p>
          <p>
            系統タグ・雰囲気タグ・入店前チェック等の評価は、
            StyleMap運営による独自の主観的評価であり、
            店舗様の公式見解ではありません。
          </p>
        </PolicySection>

        <PolicySection title="掲載費用について">
          <p>
            掲載は完全無料です。
            店舗様への費用請求や、掲載を条件とした営業活動は一切行いません。
          </p>
        </PolicySection>

        <PolicySection title="情報の正確性について">
          <p>
            営業時間等の情報は変更される場合があります。
            ご来店前に店舗様へ直接ご確認いただくことをおすすめします。
          </p>
        </PolicySection>

        <PolicySection title="掲載停止のご依頼">
          <p>
            掲載を希望されない店舗様は、下記までご連絡ください。
            3営業日以内に掲載を停止いたします。
          </p>
          <p>
            お問い合わせ先：
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-clay underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>ご連絡の際は、店舗名と所在地をお知らせください。</p>
        </PolicySection>

        <PolicySection title="情報の訂正について">
          <p>掲載情報に誤りがある場合も、上記連絡先までご指摘ください。</p>
        </PolicySection>

        <PolicySection title="評価・タグについて">
          <p>
            「一人で入りやすい」等のタグは、StyleMap運営が
            ファッション初心者の来店ハードルを下げる目的で
            付与している主観的な評価です。
            店舗様の品質やサービスを否定する意図は一切ありません。
          </p>
        </PolicySection>

        <p className="text-xs text-gray-400 pt-2">最終更新日：2026年8月18日</p>
      </div>
    </div>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium text-gray-500 tracking-label uppercase">
        {title}
      </h3>
      <div className="text-sm text-ink leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
