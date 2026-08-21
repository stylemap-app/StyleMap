/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel Image Optimizationが生成した変換画像を30日間キャッシュする。
    // /api/place-photo 側のCache-Controlと期間を揃え、Places写真の
    // 実体（photo name）は基本的に不変という前提に合わせる
    minimumCacheTTL: 2592000,
    // モバイルファースト（CLAUDE.md）のため、実際に使っていない大きな
    // ビューポート幅（1920/2048/3840）は生成しない。
    // 375〜1200はスマホ〜小型デスクトップ幅をカバー
    deviceSizes: [375, 640, 750, 828, 1080, 1200],
    // 固定px指定のsizesは実際には 56px(管理画面サムネ) / 144px(カード) /
    // 200px(服グリッド) のみ（grep調査済み）。デフォルトの[16,32,48,64,
    // 96,128,256,384]は使わないサイズが多く無駄な変換を生むため、
    // 実サイズ＋DPR(2x/3x)分の余白に絞る
    imageSizes: [56, 96, 144, 200, 256, 384],
    remotePatterns: [
      {
        // seed.sql のプレースホルダー画像（本番写真に差し替えるまで使用）
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        // Supabase Storage（本番店舗写真）
        protocol: "https",
        hostname: "drihaetuspdvdjbfuffx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Google ユーザーアバター（OAuth ログイン後）
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
