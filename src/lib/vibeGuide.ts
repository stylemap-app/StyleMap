// 雰囲気タグ（vibe）の判定ガイド。
// 現地調査（/admin/survey）で複数人が分担してもタグ付けの基準が
// ブレないようにするための一元定義。slugをキーにする
export type VibeGuideEntry = {
  core: string; // 核心の問い（1行）
  points: string[]; // 判断に使う観点
};

export const VIBE_GUIDE: Record<string, VibeGuideEntry> = {
  "easy-solo": {
    core: "自分が一人で入るとして、抵抗を感じないか",
    points: ["入口の開放感", "中が見えるか", "一人客の有無", "店員が入口にいないか", "店の規模"],
  },
  "beginner-friendly": {
    core: "古着を知らない人が来ても困らないか",
    points: ["価格・サイズの表示", "陳列の整理度", "専門用語の少なさ", "店員に聞きやすい雰囲気"],
  },
  "staff-quiet": {
    core: "ゆっくり自分のペースで見られそうか",
    points: ["店員の立ち位置", "入店時の対応", "後をついてくるか", "レジで作業しているか"],
  },
  "staff-helpful": {
    core: "相談したいときに頼れそうか",
    points: ["声をかけてくれるか", "商品説明の丁寧さ", "接客の様子", "店員との距離感"],
  },
  "quiet-atmosphere": {
    core: "ゆったりした気持ちで見られるか",
    points: ["混雑度", "BGMの音量", "照明の明るさ", "客層の落ち着き"],
  },
  "instagram-worthy": {
    core: "店内や外観を撮りたくなるか",
    points: ["内装のデザイン性", "外観の個性", "商品の陳列の美しさ", "SNSで見たことがあるか"],
  },
  "good-music": {
    core: "BGMが店の雰囲気を作っているか",
    points: ["選曲のこだわり", "音量の適切さ", "無音でないか"],
  },
  "unique-items": {
    core: "ここにしかない商品があるか",
    points: ["一点物の古着", "オリジナルブランド", "海外からの直輸入", "品揃えの独自性"],
  },
};

// 判断に迷ったときの共通ルール（/admin/survey の判定ガイドで表示）
export const VIBE_GUIDE_RULES = [
  "迷ったら付けない",
  "タグがない＝情報がないだけ",
  "誤ったタグ＝ユーザーを裏切る",
  "後から追加はできる",
];
