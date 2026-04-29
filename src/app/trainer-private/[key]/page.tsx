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
  // 環境変数を優先、未設定時は暫定キーへフォールバック
  // ※ 暫定キーは Vercel に TRAINER_PRIVATE_KEY を登録したら自動的に切り替わる
  const expected = process.env.TRAINER_PRIVATE_KEY ?? 'okada-firefitness-quick-2026-jx9m'

  if (key !== expected) {
    notFound()
  }

  return <TrainerGrowthForm />
}

// ロボット制御: noindex（検索結果に絶対出さない）
export const metadata = {
  title: 'トレーナー専用 / 身長伸びしろ診断（高精度版）',
  robots: { index: false, follow: false },
}
