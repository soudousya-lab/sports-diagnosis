import { notFound } from 'next/navigation'
import TrainerGrowthForm from '@/components/TrainerGrowthForm'

// トレーナー専用の身長伸びしろ詳細診断ページ
// 環境変数 TRAINER_PRIVATE_KEY と URL の [key] が一致した場合のみ表示
// それ以外はすべて404
//
// 使い方:
// - Vercel: Settings → Environment Variables で TRAINER_PRIVATE_KEY を設定
// - ローカル: .env.local に TRAINER_PRIVATE_KEY=... を記載
// - URL例: https://nobishiro.kids/trainer-private/your-secret-key

export const dynamic = 'force-dynamic'

type RouteParams = { key: string }

export default async function TrainerPrivatePage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { key } = await params
  const expected = process.env.TRAINER_PRIVATE_KEY

  // 環境変数未設定 or キー不一致は 404 で偽装
  if (!expected || key !== expected) {
    notFound()
  }

  return <TrainerGrowthForm />
}

// ロボット制御: noindex（検索結果に絶対出さない）
export const metadata = {
  title: 'トレーナー専用 / 身長伸びしろ診断（高精度版）',
  robots: { index: false, follow: false },
}
