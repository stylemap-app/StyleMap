import "server-only";
import { getClaudeClient, TAG_INFERENCE_MODEL } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PriceRange } from "@/types/store";

// ─────────────────────────────────────────────────────────────
// 設計方針（掲載ポリシー「StyleMap運営による主観的評価」との整合性）:
// AIには「客観的事実の分類」のみを担当させる。
//   - 系統タグ（style）: 店名・Googleカテゴリから判断できる客観的分類
//   - 商品カテゴリタグ（category）: Googleのplace typesから判断できる客観的分類
//   - 価格帯: AIには推定させない。Places APIのpriceLevel（実データ）が
//     あればそれを機械的に変換するだけで、なければ未設定のままにする
// 雰囲気タグ・客層タグ（実際に来店しないと判断できない主観的評価）は
// AIに一切推定させない。これらは人間が現地確認・調査して付与する
// ─────────────────────────────────────────────────────────────

export type TagInferenceResult = {
  style_tags: string[];
  category_tags: string[];
  price_range: PriceRange | null;
  confidence: "high" | "medium" | "low";
  reason: string;
};

export type TagInferenceInput = {
  name: string;
  address: string;
  placeTypes: string[];
  priceLevel?: string; // Places API (New) のenum文字列
  // 店舗登録時にヒットしたPlaces Text Searchのキーワード（stores.search_keyword）。
  // 補助情報として使うのみで、決定的な根拠にはしない（プロンプト側で明示）
  searchKeyword?: string;
};

type TagRow = { slug: string; label_ja: string };

async function loadTagCandidates(): Promise<{ style: TagRow[]; category: TagRow[] }> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("tag_masters")
    .select("type, slug, label_ja")
    .in("type", ["style", "category"]);

  const rows = (data ?? []) as (TagRow & { type: string })[];

  return {
    style: rows.filter((r) => r.type === "style"),
    category: rows.filter((r) => r.type === "category"),
  };
}

function formatTagList(rows: TagRow[]): string {
  return rows.map((r) => `${r.slug}(${r.label_ja})`).join(", ");
}

function buildSystemPrompt(tags: { style: TagRow[]; category: TagRow[] }): string {
  return `あなたは日本のファッション店舗の情報を客観的に分類するアシスタントです。
店名・住所・Googleカテゴリ情報のみから、下記の候補タグの中から当てはまるものを分類してください。

重要な制約:
- あなたが行うのは「系統タグ」と「商品カテゴリタグ」の客観的な分類のみです。
- 「入りやすさ」「初心者向けか」「客層」など、実際に来店しないと判断できない
  主観的な評価は一切行わないでください（そもそも候補にも含まれていません）。
- 候補一覧に存在しないslugは絶対に返さないでください。
- 情報が少なく判断に迷う場合は無理に埋めず、空配列を返してください。

検索キーワードについて:
- 入力に「検索キーワード」が含まれる場合、それは店舗を見つけた際に
  使った補助情報であり、決定的な根拠ではありません。
- 「古着屋」のようにジャンルを直接示すキーワードは、他の情報と
  矛盾しなければ系統タグの手がかりとして使ってよいです。
- 「アパレル」「セレクトショップ」のような一般的すぎるキーワードからは、
  特定の系統を断定しないでください（アパレル店・セレクトショップは
  ストリートにも古着にもモードにもなり得るため）。
- 確証が持てない場合は、検索キーワードがあっても空配列を返してください。

【系統タグ候補（style_tags）】
${formatTagList(tags.style)}

【商品カテゴリタグ候補（category_tags）】
${formatTagList(tags.category)}

出力は以下のJSON形式のみを返してください。前置きや説明文、コードブロック（\`\`\`）は一切付けないでください。
{
  "style_tags": string[],
  "category_tags": string[],
  "confidence": "high" | "medium" | "low",
  "reason": string
}

confidence: 与えられた情報量から見た分類の確からしさ
reason: 判定理由を50文字程度の日本語で簡潔に`;
}

function buildUserPrompt(input: TagInferenceInput): string {
  const lines = [
    `店名: ${input.name}`,
    `住所: ${input.address}`,
    `Googleカテゴリ: ${input.placeTypes.length > 0 ? input.placeTypes.join(", ") : "(不明)"}`,
  ];
  if (input.searchKeyword) lines.push(`検索キーワード: ${input.searchKeyword}`);
  lines.push("", "この店舗の系統タグ・商品カテゴリタグをJSON形式で分類してください。");
  return lines.join("\n");
}

// テキスト中に ```json ... ``` のようなコードフェンスが混ざっても中身だけ取り出す
function extractJson(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fenceMatch ? fenceMatch[1] : text;
  return JSON.parse(jsonText.trim());
}

function toValidSlugs(value: unknown, allowed: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && allowed.has(v));
}

// Places API (New) の priceLevel を StyleMap の price_range (1〜4) に変換する。
// PRICE_LEVEL_FREE / PRICE_LEVEL_UNSPECIFIED や未取得の場合は、
// 無理に推定せず null（未設定のまま）を返す
const GOOGLE_PRICE_LEVEL_MAP: Partial<Record<string, PriceRange>> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

function mapGooglePriceLevel(priceLevel?: string): PriceRange | null {
  if (!priceLevel) return null;
  return GOOGLE_PRICE_LEVEL_MAP[priceLevel] ?? null;
}

// Googleレビュー本文は規約リスク回避のため絶対に使わない。
// 入力は店名・住所・Googleカテゴリ（place types）・検索キーワードのみ。
// 失敗時（APIエラー・キー未設定・パース失敗・応答が信頼できない形）は
// 例外を投げず null を返す（呼び出し元はUIでエラー表示に変換するだけでよい）
export async function inferStoreTags(
  input: TagInferenceInput
): Promise<TagInferenceResult | null> {
  try {
    const client = getClaudeClient();
    if (!client) return null;

    const tags = await loadTagCandidates();

    const response = await client.messages.create({
      model: TAG_INFERENCE_MODEL,
      max_tokens: 500,
      // タグ定義部分（system）はリクエストをまたいで共通のため、
      // Prompt Cachingでキャッシュしてトークンコストを抑える
      system: [
        {
          type: "text",
          text: buildSystemPrompt(tags),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildUserPrompt(input) }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = extractJson(textBlock.text) as Record<string, unknown>;

    const styleSlugs = new Set(tags.style.map((t) => t.slug));
    const categorySlugs = new Set(tags.category.map((t) => t.slug));

    // confidence は表示用の補助情報にすぎないため、想定外の値でも
    // 安全側（low）に丸めるだけで結果全体は破棄しない
    const confidenceRaw = parsed.confidence;
    const confidence: TagInferenceResult["confidence"] =
      confidenceRaw === "high" || confidenceRaw === "medium" || confidenceRaw === "low"
        ? confidenceRaw
        : "low";

    const reason =
      typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim().slice(0, 200)
        : "(理由なし)";

    return {
      style_tags: toValidSlugs(parsed.style_tags, styleSlugs),
      category_tags: toValidSlugs(parsed.category_tags, categorySlugs),
      // 価格帯はAIの出力を使わず、Places APIのpriceLevel（実データ）のみから決める
      price_range: mapGooglePriceLevel(input.priceLevel),
      confidence,
      reason,
    };
  } catch (err) {
    console.error("inferStoreTags failed:", err);
    return null;
  }
}
