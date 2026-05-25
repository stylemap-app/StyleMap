# StyleMap プロジェクト概要

## サービス概要
大学生・20代向けのファッション特化型店舗検索マップアプリ。
「近くの服屋」ではなく「自分に合う服屋」を探せることがコンセプト。
MVPエリアは下北沢または原宿。

## ターゲット
大学生・20代男女

## 技術スタック
- フロント：Next.js 14（App Router）+ TypeScript + Tailwind CSS
- DB/認証：Supabase
- 地図：Google Maps API
- デプロイ：Vercel

## 開発ルール
- モバイルファースト
- TypeScript strict mode
- コンポーネントは src/components/ に配置
- 型定義は src/types/ に配置

## やらないこと（MVP）
- メール認証（Googleログインのみ）
- ネイティブアプリ化
- ユーザーレビュー機能

## 現在のフェーズ
フェーズ0-2：データスキーマ設計中
