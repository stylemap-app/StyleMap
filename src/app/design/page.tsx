import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="border-b border-gray-300 pb-2 text-lg font-bold tracking-subheading text-ink">
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium tracking-label text-gray-600">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-xl space-y-12">

        {/* ヘッダー */}
        <header className="space-y-1">
          <h1 className="text-[22px] font-bold tracking-heading text-ink">
            StyleMap Design System
          </h1>
          <p className="text-sm text-gray-600">コンポーネントカタログ</p>
        </header>

        {/* ── Button ───────────────────────────────────── */}
        <Section title="Button">
          <Row label="variant=primary">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </Row>
          <Row label="variant=secondary">
            <Button variant="secondary" size="sm">Small</Button>
            <Button variant="secondary" size="md">Medium</Button>
            <Button variant="secondary" size="lg">Large</Button>
          </Row>
          <Row label="variant=ghost">
            <Button variant="ghost" size="sm">Small</Button>
            <Button variant="ghost" size="md">Medium</Button>
            <Button variant="ghost" size="lg">Large</Button>
          </Row>
          <Row label="disabled">
            <Button variant="primary"   disabled>Primary</Button>
            <Button variant="secondary" disabled>Secondary</Button>
            <Button variant="ghost"     disabled>Ghost</Button>
          </Row>
        </Section>

        {/* ── Card ─────────────────────────────────────── */}
        <Section title="Card">
          <Row label="variant=default（shadow あり）">
            <Card variant="default" size="sm" className="w-36">
              <p className="text-xs text-gray-600">default / sm</p>
            </Card>
            <Card variant="default" size="md" className="w-36">
              <p className="text-xs text-gray-600">default / md</p>
            </Card>
            <Card variant="default" size="lg" className="w-36">
              <p className="text-xs text-gray-600">default / lg</p>
            </Card>
          </Row>
          <Row label="variant=flat（背景のみ）">
            <Card variant="flat" size="sm" className="w-36">
              <p className="text-xs text-gray-600">flat / sm</p>
            </Card>
            <Card variant="flat" size="md" className="w-36">
              <p className="text-xs text-gray-600">flat / md</p>
            </Card>
            <Card variant="flat" size="lg" className="w-36">
              <p className="text-xs text-gray-600">flat / lg</p>
            </Card>
          </Row>
          <Row label="variant=outlined（ボーダー）">
            <Card variant="outlined" size="sm" className="w-36">
              <p className="text-xs text-gray-600">outlined / sm</p>
            </Card>
            <Card variant="outlined" size="md" className="w-36">
              <p className="text-xs text-gray-600">outlined / md</p>
            </Card>
            <Card variant="outlined" size="lg" className="w-36">
              <p className="text-xs text-gray-600">outlined / lg</p>
            </Card>
          </Row>
        </Section>

        {/* ── Badge ────────────────────────────────────── */}
        <Section title="Badge">
          <Row label="size=md（通常タグ）">
            <Badge variant="style">ストリート</Badge>
            <Badge variant="style">古着</Badge>
            <Badge variant="vibe">一人で入りやすい</Badge>
            <Badge variant="vibe">初心者向け</Badge>
            <Badge variant="category">トップス</Badge>
            <Badge variant="neutral">ユニセックス</Badge>
          </Row>
          <Row label="size=sm（コンパクト）">
            <Badge variant="style"    size="sm">ストリート</Badge>
            <Badge variant="vibe"     size="sm">一人で入りやすい</Badge>
            <Badge variant="category" size="sm">トップス</Badge>
            <Badge variant="neutral"  size="sm">ユニセックス</Badge>
          </Row>
        </Section>

        {/* ── Input ────────────────────────────────────── */}
        <Section title="Input">
          <Row label="variant=default">
            <div className="w-full space-y-3">
              <Input variant="default" size="sm" label="Small"  placeholder="テキストを入力" />
              <Input variant="default" size="md" label="Medium" placeholder="テキストを入力" />
              <Input variant="default" size="lg" label="Large"  placeholder="テキストを入力" />
            </div>
          </Row>
          <Row label="variant=search">
            <div className="w-full space-y-3">
              <Input variant="search" size="sm" placeholder="エリアや店名で検索" />
              <Input variant="search" size="md" placeholder="エリアや店名で検索" />
              <Input variant="search" size="lg" placeholder="エリアや店名で検索" />
            </div>
          </Row>
          <Row label="disabled">
            <div className="w-full">
              <Input variant="default" size="md" placeholder="無効状態" disabled />
            </div>
          </Row>
        </Section>

      </div>
    </main>
  );
}
