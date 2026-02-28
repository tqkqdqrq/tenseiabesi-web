import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Smartphone,
  Moon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '転生あべし - パチスロ台データ記録',
  description:
    'リアルタイムでチームの仲間と現在の状況を共有できるパチスロ台データ記録アプリ',
}

function PhoneFrame({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption: string
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-[280px] overflow-hidden rounded-[40px] border-[6px] border-[#1c1c1e] bg-black shadow-2xl sm:w-[320px]">
        {/* Notch/Dynamic Island simulation */}
        <div className="absolute left-1/2 top-2 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-black/90 backdrop-blur-md" />
        {/* Screen */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="block w-full"
        />
      </div>
      <p className="text-center text-[15px] font-medium text-[#86868b]">
        {caption}
      </p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] font-sans selection:bg-emerald-500/30 pb-10">
      {/* Header */}
      <header className="fixed top-0 right-0 z-50 p-4">
        <Link href="/login" className="rounded-full bg-white/10 backdrop-blur px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition">
          ログイン
        </Link>
      </header>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 py-20 text-center">
        <div className="relative z-10 flex w-full max-w-[320px] sm:max-w-md flex-col items-center gap-8">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 rounded-full bg-[#1c1c1e] px-3 py-1.5">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[13px] font-medium text-emerald-400">リアルタイム同期</span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              転生あべし
            </h1>
            <p className="text-[19px] font-semibold tracking-tight text-[#86868b]">
              パチスロ台データ記録
            </p>
          </div>

          <p className="text-[21px] font-medium leading-[1.4] tracking-tight text-[#f5f5f7]">
            仲間と<span className="text-emerald-400">リアルタイム</span>で
            <br />
            状況を共有しながら立ち回れ
          </p>

          <Link
            href="/login"
            className="mt-4 flex w-full items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-[17px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            今すぐ始める
          </Link>
        </div>

        {/* Scroll hint line */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-60">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#86868b]">Scroll</span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-[#86868b] to-transparent" />
          </div>
        </div>
      </section>

      {/* Screenshots / Features */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 flex flex-col items-center gap-3 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              アプリの特徴
            </h2>
            <p className="max-w-xs text-[19px] font-medium text-[#86868b]">
              勝率を上げるためのシンプルで強力なツール
            </p>
          </div>

          <div className="flex flex-col items-center gap-24 sm:flex-row sm:items-start sm:justify-center sm:gap-16">
            <PhoneFrame
              src="/screenshots/group-view.png"
              alt="グループ画面 - ステータスをリアルタイム共有"
              caption="ステータスをリアルタイム共有"
            />
            <PhoneFrame
              src="/screenshots/personal-view.png"
              alt="個人画面 - 個人の台データを一元管理"
              caption="個人の台データを一元管理"
            />
            <PhoneFrame
              src="/screenshots/group-list.png"
              alt="グループ一覧画面 - チームを作って仲間と共有"
              caption="チームを作って仲間と共有"
            />
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 flex flex-col items-center gap-3 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              使い方
            </h2>
            <p className="max-w-xs text-[19px] font-medium text-[#86868b]">
              5ステップですぐに始められます
            </p>
          </div>

          <div className="mx-auto flex max-w-md flex-col gap-20">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-[17px] font-bold text-white">
                  1
                </div>
                <h3 className="text-2xl font-bold tracking-tight">アカウント登録</h3>
                <p className="text-[17px] font-medium text-[#86868b]">
                  表示名とメールアドレスで30秒で登録完了
                </p>
              </div>
              <PhoneFrame
                src="/screenshots/signup.png"
                alt="サインアップ画面"
                caption=""
              />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-[17px] font-bold text-white">
                  2
                </div>
                <h3 className="text-2xl font-bold tracking-tight">チームを作る / 参加する</h3>
                <p className="text-[17px] font-medium text-[#86868b]">
                  グループを作成して招待コードを共有、または仲間のコードを入力して参加
                </p>
              </div>
              <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:gap-8">
                <PhoneFrame
                  src="/screenshots/group-list.png"
                  alt="グループ一覧画面"
                  caption=""
                />
                <PhoneFrame
                  src="/screenshots/group-join.png"
                  alt="招待コード参加ダイアログ"
                  caption=""
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-[17px] font-bold text-white">
                  3
                </div>
                <h3 className="text-2xl font-bold tracking-tight">招待コードで仲間を招く</h3>
                <p className="text-[17px] font-medium text-[#86868b]">
                  QRコードまたは8桁の招待コードをシェア。仲間がコードを入力するだけで参加できる
                </p>
              </div>
              <PhoneFrame
                src="/screenshots/group-settings.png"
                alt="グループ設定画面 - QRコード・招待コード共有"
                caption=""
              />
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-[17px] font-bold text-white">
                  4
                </div>
                <h3 className="text-2xl font-bold tracking-tight">店舗と台番号を登録</h3>
                <p className="text-[17px] font-medium text-[#86868b]">
                  店舗を追加して台番号を入力。ステータスをワンタップで記録
                </p>
              </div>
              <PhoneFrame
                src="/screenshots/group-view.png"
                alt="台データ画面"
                caption=""
              />
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-[17px] font-bold text-white">
                  5
                </div>
                <h3 className="text-2xl font-bold tracking-tight">リアルタイムで共有完了</h3>
                <p className="text-[17px] font-medium text-[#86868b]">
                  仲間の状況がリアルタイムで更新。離れていてもチームで立ち回れる
                </p>
              </div>
              <PhoneFrame
                src="/screenshots/group-view.png"
                alt="リアルタイム共有画面"
                caption=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* Extra features */}
      <section className="px-6 py-12">
        <div className="mx-auto flex max-w-[320px] sm:max-w-lg flex-col gap-4 sm:flex-row sm:justify-center">
          <div className="flex items-center gap-4 rounded-[20px] bg-[#1c1c1e] p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Smartphone className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-[17px] font-semibold text-[#f5f5f7]">モバイルファーストレイアウト</span>
          </div>
          <div className="flex items-center gap-4 rounded-[20px] bg-[#1c1c1e] p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Moon className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-[17px] font-semibold text-[#f5f5f7]">目に優しいダークモード</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-32">
        <div className="mx-auto flex max-w-[320px] sm:max-w-md flex-col items-center text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            さっそく始めよう
          </h2>
          <p className="mt-5 mb-10 text-[19px] font-medium text-[#86868b]">
            登録は無料。チームですぐに連携できます。
          </p>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-[17px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            無料で使う
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-[320px] border-t border-[#1c1c1e] px-6 pt-10 text-center sm:max-w-md">
        <p className="text-[13px] font-medium text-[#86868b]">
          &copy; 2025 転生あべし
        </p>
      </footer>
    </div>
  )
}
