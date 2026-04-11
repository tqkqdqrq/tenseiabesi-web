# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「転生あべし」- パチスロ台データ記録ウェブアプリ。個人モードとグループモードがあり、グループモードではメンバー間でリアルタイムに台情報を共有できる。

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # プロダクションビルド
npm run lint     # ESLint実行
```

## スタック

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Supabase** (認証・DB・Realtime) — `@supabase/ssr` でSSR対応
- **Tailwind CSS v4** + shadcn/ui (Radix UI) + Sonner (トースト)
- **dnd-kit** (ドラッグ&ドロップ並び替え)
- **Vercel** デプロイ (main push で自動デプロイ)

## アーキテクチャ

### ルーティング (App Router)

- `(app)/` — 認証済みユーザー用レイアウト（BottomNav + Sidebar）
  - `personal/` — 個人モード
  - `groups/` — グループ一覧・`[groupId]` で個別グループ・`settings/` でグループ設定
  - `settings/` — ユーザー設定（モード切替・LINE連携・アカウント削除）
- `(auth)/` — ログイン・サインアップ
- `landing/` — 未認証ユーザー向けランディング
- `api/account/delete/` — アカウント削除API

### 認証フロー

`AuthProvider` (Context) が全体の認証状態を管理。Supabase `onAuthStateChange` を唯一のソースとし、`fetchProfile` は `useEffect` で別途実行（デッドロック回避）。`(app)/layout.tsx` で未認証時に `/login` リダイレクト。`middleware.ts` で Supabase セッション更新。

### データモデル (Supabase)

- `profiles` — ユーザー情報（mode: personal/group）
- `stores` / `machines` — 個人モードの店舗・台データ
- `groups` / `group_members` / `group_stores` / `group_machines` — グループモードのデータ
- `group_tags` — グループごとのカスタムステータスタグ
- 型定義: `lib/database.types.ts` (Supabase生成), `lib/types.ts` (アプリ用エイリアス・拡張型)

### リアルタイム同期

グループモードでは Supabase Realtime を2チャンネルで使用:
1. **Postgres Changes** (`pg-group_machines-{groupId}`) — INSERT/DELETE検知で自動リフェッチ
2. **Broadcast** (`group-{groupId}`) — ステータス変更・カウント変更などの軽量通知、プレゼンス管理

対応フック: `use-realtime-machines.ts`, `use-presence.ts`, `use-global-presence.ts`

### コンポーネント構成

- `components/ui/` — shadcn/ui ベースのプリミティブ
- `components/group/` — グループ機能（台一覧・台行・招待・メンバー・通知）
- `components/personal/` — 個人モード機能
- `components/shared/` — モード共通（ステータスピッカー・店舗追加・確認ダイアログ）
- `components/layout/` — BottomNav（モバイル）+ AppSidebar（デスクトップ）
- `components/providers/` — AuthProvider, ThemeProvider, GlobalPresenceProvider

### Supabase クライアント

- `lib/supabase/client.ts` — ブラウザ用シングルトン
- `lib/supabase/server.ts` — Server Component用
- `lib/supabase/middleware.ts` — セッション更新ミドルウェア
- `lib/supabase/admin.ts` — サービスロールキー使用（API Route用）

## 環境変数

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` が必要。admin用に `SUPABASE_SERVICE_ROLE_KEY` も使用。

## 言語

日本語でコミュニケーション。コード中のコメント・UI文言も日本語。
