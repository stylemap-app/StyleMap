import type { PriceRange } from "@/types/store";

// 価格帯の定義を一元管理する。
// 「1アイテムあたりの中心価格帯」を基準にしており、アイテム種別
// （アパレル/靴/アクセサリー等）に依存しない。将来の「アイテムを探す」
// 機能（服・靴・アクセサリーを横断）でも同じ定義をそのまま使える想定
export type PriceRangeOption = {
  value: PriceRange;
  symbol: string; // 記号（店舗カードなど省スペースな場所で使用）
  amountLabel: string; // 金額ラベル（店舗詳細・管理画面・現地調査など判定重視の場面で使用）
  description: string; // 体験的な補足説明（フィルター画面など選ぶ場面で使用）
};

export const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { value: 1, symbol: "¥", amountLabel: "〜5,000円", description: "学生の普段使い" },
  { value: 2, symbol: "¥¥", amountLabel: "5,000〜10,000円", description: "ちょっといいもの" },
  { value: 3, symbol: "¥¥¥", amountLabel: "10,000円〜", description: "こだわりの一点" },
  { value: 4, symbol: "¥¥¥¥", amountLabel: "幅広い", description: "安いものから高いものまで" },
];

function buildLookup(pick: (o: PriceRangeOption) => string): Record<PriceRange, string> {
  return Object.fromEntries(PRICE_RANGE_OPTIONS.map((o) => [o.value, pick(o)])) as Record<
    PriceRange,
    string
  >;
}

// valueから直接引くための参照テーブル（PRICE_RANGE_OPTIONSから自動生成、二重管理を避ける）
export const PRICE_SYMBOL = buildLookup((o) => o.symbol);
export const PRICE_AMOUNT_LABEL = buildLookup((o) => o.amountLabel);
export const PRICE_DESCRIPTION = buildLookup((o) => o.description);

// 現地調査画面（/admin/survey）の「基準を見る」で表示する判定基準
export const PRICE_JUDGING_CRITERIA = [
  "1アイテムあたりの中心価格で判定",
  "アパレル：Tシャツ1枚",
  "靴：スニーカー1足",
  "アクセサリー：リング1点",
  "※最安と最高が5倍以上開くなら『幅広い』",
];
