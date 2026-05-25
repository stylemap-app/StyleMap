// 価格帯（1=〜¥3,000 / 2=¥3,000〜8,000 / 3=¥8,000〜20,000 / 4=¥20,000〜）
export type PriceRange = 1 | 2 | 3 | 4;

export const PRICE_RANGE_LABEL: Record<PriceRange, string> = {
  1: "〜¥3,000",
  2: "¥3,000〜¥8,000",
  3: "¥8,000〜¥20,000",
  4: "¥20,000〜",
};

// タグの種別
// 将来の追加はこの Union に値を足すだけでよい
export type TagType =
  | "style"      // 系統（ストリート・古着・韓国系など）
  | "vibe"       // 雰囲気（一人で入りやすい・初心者向けなど）
  | "category"   // 商品カテゴリー（トップス・ボトムスなど）
  | "gender"     // 性別対象（メンズ・レディース・ユニセックス）
  | "age_group"  // 年齢層（10代後半・20代前半・後半）
  | "price_tag"; // 価格補足タグ（高見え・セール多めなど）

export interface TagMaster {
  id: number;
  type: TagType;
  slug: string;     // URLやフィルターキーに使う英数字識別子
  label_ja: string; // 画面表示用の日本語ラベル
  sort_order: number;
}

// 1日分の営業時間（open/close が null = 定休日）
export interface DayHours {
  open: string | null;  // "11:00"
  close: string | null; // "20:00"
}

// 曜日順: [日, 月, 火, 水, 木, 金, 土]
export interface StoreHours {
  regular: [
    DayHours, // 日
    DayHours, // 月
    DayHours, // 火
    DayHours, // 水
    DayHours, // 木
    DayHours, // 金
    DayHours, // 土
  ];
  note?: string; // "年末年始を除く" など例外事項
}

export interface StoreLinks {
  instagram?: string;
  google_maps?: string;
  official_site?: string;
}

export interface StorePhoto {
  id: string;
  url: string;
  caption?: string;
  is_main: boolean;
  sort_order: number;
}

export interface Store {
  id: string;
  name: string;
  name_kana?: string;
  address: string;
  nearest_station: string;
  lat: number;
  lng: number;
  price_range: PriceRange;
  hours: StoreHours;
  links: StoreLinks;
  operator_review?: string;
  operator_review_updated_at?: string; // ISO 8601
  is_published: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601

  // リレーション（DB JOIN または静的データで付与）
  photos: StorePhoto[];
  tags: TagMaster[]; // 全タグをまとめて保持し、type で絞って使う
}

// フィルターパネルの状態型
export interface StoreFilter {
  style_slugs?: string[];
  vibe_slugs?: string[];
  category_slugs?: string[];
  gender_slugs?: string[];
  age_group_slugs?: string[];
  price_range?: PriceRange[];
  station?: string;
}
