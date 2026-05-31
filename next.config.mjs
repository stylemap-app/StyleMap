/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage（店舗写真）
        // ワイルドカードは環境によって不安定なためプロジェクト固有のホスト名を直指定
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
