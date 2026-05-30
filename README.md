This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## データベースセットアップ

### 1. スキーマの作成（初回のみ）

[Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor → New query を開き、
`supabase/migrations/001_initial.sql` の内容を貼り付けて実行してください。

テーブル・インデックス・RLSポリシー・タグマスタ（48件）が作成されます。

### 2. サンプルデータの投入（任意）

下北沢エリアの架空店舗データ20件を投入する場合は、
`supabase/seeds/seed.sql` の内容を SQL Editor に貼り付けて実行してください。

| ファイル | 内容 |
|---------|------|
| `supabase/migrations/001_initial.sql` | テーブル定義・RLS・タグマスタ |
| `supabase/seeds/seed.sql` | 架空店舗20件・写真40件・タグ紐付け |

> **注意:** 各ファイルは一度だけ実行してください。再実行するとエラーになります。
