// 価格帯（1アイテムあたりの中心価格帯。アイテム種別に依存しない）。
// 記号・金額ラベル・補足説明などの表示定義は src/lib/priceRange.ts に一元管理
export type PriceRange = 1 | 2 | 3 | 4;

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

  // Google Places API連携（Phase A で追加。他フィールドと同じくDBの列名に合わせたsnake_case）
  google_place_id?: string | null; // Places APIのplace_id（実店舗のみ。ダミー店舗はnull）
  is_real_store: boolean;          // true=Places API連携の実店舗 / false=StyleMap独自のダミー店舗
  is_hidden: boolean;              // 掲載停止依頼などで非表示にする場合true

  // リレーション（DB JOIN または静的データで付与）
  photos: StorePhoto[];
  tags: TagMaster[]; // 全タグをまとめて保持し、type で絞って使う
}

// ── Google Places API連携（二層データモデルの Layer 1） ──────────────
// Places APIから都度取得する情報。Google利用規約によりDBには永続保存しない。
// フィールド名はPlaces API (New) のレスポンス（camelCase）にそのまま合わせる。

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface PlaceOpeningHours {
  weekdayDescriptions: string[];
  openNow: boolean;
}

export interface PlacePhoto {
  name: string; // Places API (New) のphotoリソース名。画像URL化には別途Photo APIの呼び出しが必要
  widthPx?: number;
  heightPx?: number;
}

export interface PlaceData {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: PlaceLocation;
  openingHours?: PlaceOpeningHours;
  nationalPhoneNumber?: string;
  photos: PlacePhoto[];
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
}

// Layer 2（保存するStore行）と Layer 1（都度取得するPlaceData）を合成した型
export type StoreWithPlace = Store & { place: PlaceData | null };

// searchText の検索結果1件分。FieldMaskを絞っているためPlaceDataのサブセット
export interface PlaceSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: PlaceLocation;
  photos: PlacePhoto[];
  rating?: number;
  userRatingCount?: number;
}

export type ClothCategory = 'トップス' | 'パンツ' | 'アウター' | '靴' | 'アクセサリー';

export interface Cloth {
  id: string;
  store_id: string;
  name: string;
  price: number;
  image_url: string;
  category: ClothCategory;
  brand?: string | null;
  description?: string | null;
  is_published: boolean;
  created_at: string;
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
