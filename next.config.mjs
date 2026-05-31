/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
