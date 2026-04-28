import type { Metadata } from 'next'
import Link from 'next/link'
import GrowthPredictionCard from '@/components/GrowthPredictionCard'

export const metadata: Metadata = {
  title: '身長の伸びしろ診断 | NOBISHIRO KIDS',
  description:
    'お子様の現在の身長・年齢・性別から、18歳時点の予測身長と成長スパートのフェーズを算出します。両親身長を入力すれば目標身長予測の精度が上がります。無料で試せます。',
  keywords: [
    '身長 予測 子ども',
    '目標身長 計算',
    '成長スパート いつ',
    'PHV 予測',
    '伸びしろ 診断',
  ],
  alternates: { canonical: 'https://nobishiro.kids/growth' },
  openGraph: {
    title: '身長の伸びしろ診断 | NOBISHIRO KIDS',
    description:
      '無料で身長予測。SD値・目標身長・PHV（成長スパート）が一画面でわかります。',
    type: 'website',
  },
}

export default function GrowthPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-blue-600 font-bold text-xl">
            NOBISHIRO
            <span className="text-gray-400 text-xs ml-2 font-normal">.kids</span>
          </Link>
          <nav className="flex gap-4 md:gap-6 text-sm">
            <Link href="/growth" className="text-blue-600 font-medium">
              身長診断
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-blue-600">
              ブログ
            </Link>
            <Link href="/quick" className="text-gray-600 hover:text-blue-600">
              運動診断
            </Link>
            <Link href="/business" className="text-gray-400 hover:text-blue-600">
              ジム・教室様へ
            </Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs tracking-widest text-blue-600 font-medium mb-4">
            FREE GROWTH CHECK
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-snug">
            お子様の伸びしろを、
            <br className="hidden md:block" />
            数字で見える化。
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-loose">
            身長・年齢・性別だけで、SD値・18歳時点の予測身長・成長スパートのフェーズが見えます。
            <br className="hidden md:block" />
            両親身長を入力すると、遺伝要因からの目標身長も計算します。
          </p>
        </div>
      </section>

      {/* 診断カード */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <GrowthPredictionCard
          initialHeightCm={130}
          initialAgeYears={9}
          initialSex="male"
        />
      </section>

      {/* 詳細レポート CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-10 text-white">
          <p className="text-xs tracking-widest text-blue-100 font-bold mb-3">
            DETAILED REPORT
          </p>
          <h2 className="text-xl md:text-3xl font-bold mb-4 leading-snug">
            さらに詳しいレポートをPDFで受け取る
          </h2>
          <ul className="text-blue-50 text-sm md:text-base leading-loose mb-6 space-y-2">
            <li>✓ 個別カスタムの成長曲線グラフ（PDF・A4・印刷可）</li>
            <li>✓ 栄養・運動・睡眠・姿勢の4軸での改善提案</li>
            <li>✓ 3ヶ月後の再診断リマインド</li>
            <li>✓ 全国の提携パーソナルジム・スポーツクラブの紹介</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <a
              href="https://buy.stripe.com/28E28t74qcPpcamdKn2VG01"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors"
            >
              ¥1,980 で詳細レポートを購入
              <span>→</span>
            </a>
            <p className="text-xs text-blue-100">
              Stripe決済 / クレジットカード対応 / 受信確認後24時間以内発行
            </p>
          </div>
        </div>
      </section>

      {/* 関連ブログ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            関連する解説記事
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/blog/kids-growth-by-age"
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <p className="text-xs font-bold text-blue-700 mb-2">身長・成長</p>
              <p className="font-bold text-gray-900 leading-snug">
                子どもの身長は何歳までに何センチ伸びる？
              </p>
            </Link>
            <Link
              href="/blog/growth-spurt-signs"
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <p className="text-xs font-bold text-blue-700 mb-2">身長・成長</p>
              <p className="font-bold text-gray-900 leading-snug">
                成長スパートのサイン7つ
              </p>
            </Link>
            <Link
              href="/blog/golden-age-window"
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <p className="text-xs font-bold text-emerald-700 mb-2">運動能力</p>
              <p className="font-bold text-gray-900 leading-snug">
                運動神経はゴールデンエイジで決まる
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 免責 */}
      <section className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-xs text-gray-500 leading-relaxed">
          ※ 本診断は統計的な目安を示すもので、医学的診断ではありません。個人差があります。
          <br />
          低身長の傾向（-2SD未満）が継続する場合は、小児科または小児内分泌専門医への相談をおすすめします。
        </p>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-xs">
        © 2026 NOBISHIRO KIDS
      </footer>
    </main>
  )
}
