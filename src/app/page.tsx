import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'NOBISHIRO KIDS — 子どもの伸びしろを、数字で見える化する',
  description:
    '子どもの身長・運動神経・姿勢の伸びしろを、無料診断と月1のカルテで可視化。保護者が「うちの子のいま」を数字で見られる、エビデンスベースの成長診断プラットフォーム。',
  alternates: { canonical: 'https://nobishiro.kids' },
  openGraph: {
    title: 'NOBISHIRO KIDS — 子どもの伸びしろを、数字で見える化する',
    description:
      '身長・運動神経・姿勢を一画面で。無料の身長伸びしろ診断はこちら。',
    type: 'website',
    url: 'https://nobishiro.kids',
  },
}

const features = [
  {
    href: '/growth',
    label: 'GROWTH',
    title: '身長の伸びしろ診断',
    body: '現在の身長・年齢・性別から、SD値・18歳予測身長・成長スパートのフェーズを算出。両親身長で精度UP。',
    cta: '無料で診断する',
    accent: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    badge: 'bg-blue-600 text-white',
  },
  {
    href: '/blog',
    label: 'BLOG',
    title: '成長と運動神経の科学',
    body: 'スパートのサイン、ゴールデンエイジ、コーディネーション7能力。エビデンスベースの解説記事を保護者の言葉で。',
    cta: '記事を読む',
    accent: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    badge: 'bg-emerald-600 text-white',
  },
  {
    href: '/new',
    label: 'ATHLETIC',
    title: '運動能力 7項目クイック診断',
    body: '握力・ジャンプ・反復横跳びなど7項目で運動能力をスコア化。同年齢平均との偏差値が見えます。',
    cta: 'クイック診断へ',
    accent: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    badge: 'bg-amber-600 text-white',
  },
]

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3)

  return (
    <main className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-30 backdrop-blur bg-white/90">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-blue-600 font-bold text-xl">
            NOBISHIRO
            <span className="text-gray-400 text-xs ml-2 font-normal">.kids</span>
          </Link>
          <nav className="flex gap-4 md:gap-6 text-sm">
            <Link href="/growth" className="text-gray-600 hover:text-blue-600">
              身長診断
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-blue-600">
              ブログ
            </Link>
            <Link href="/new" className="text-gray-600 hover:text-blue-600">
              運動診断
            </Link>
            <Link href="/business" className="text-gray-400 hover:text-blue-600">
              ジム・教室様へ
            </Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-amber-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.3em] text-blue-600 font-medium mb-6">
            NOBISHIRO KIDS
          </p>
          <h1 className="text-3xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            子どもの伸びしろを、
            <br className="hidden md:block" />
            <span className="text-blue-600">数字で見える化</span>する。
          </h1>
          <p className="text-gray-600 text-sm md:text-lg leading-loose mb-10 max-w-2xl mx-auto">
            身長・運動神経・姿勢。
            <br className="hidden md:block" />
            「うちの子のいま」を、塾の偏差値表のように毎月の数字で確認できる成長診断プラットフォーム。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/growth"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors"
            >
              身長伸びしろ診断（無料）
              <span>→</span>
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 font-bold py-4 px-8 rounded-full transition-colors"
            >
              ブログを読む
            </Link>
          </div>
        </div>
      </section>

      {/* 3つのコア機能 */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest text-gray-500 font-medium mb-3">
            WHAT YOU GET
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-snug">
            3つの軸で、子どもの伸びしろが見えます
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={`group flex flex-col bg-white border-2 rounded-2xl p-6 transition-all ${f.accent}`}
            >
              <span
                className={`inline-block self-start text-[10px] font-bold px-2 py-0.5 rounded mb-4 ${f.badge}`}
              >
                {f.label}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug mb-3">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">
                {f.body}
              </p>
              <div className="mt-4 text-sm font-bold text-gray-900 group-hover:text-blue-600 flex items-center gap-1">
                {f.cta}
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 仕組み */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest text-gray-500 font-medium mb-3">
              HOW IT WORKS
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-snug">
              月1の数字で、見逃さない
            </h2>
          </div>
          <ol className="relative border-l-2 border-blue-200 pl-6 md:pl-10 space-y-8">
            {[
              {
                n: '01',
                t: '入力（10分）',
                b: '身長・年齢・性別を入力するだけ。両親身長があれば目標身長予測の精度が上がります。',
              },
              {
                n: '02',
                t: 'スコア化（自動）',
                b: 'SD値・18歳時点の予測身長・残り伸びしろ・成長スパートのフェーズを自動計算。エビデンスは学校保健統計と日本小児内分泌学会の基準値。',
              },
              {
                n: '03',
                t: 'レポート（無料／詳細¥1,980）',
                b: '無料診断はその場で表示。詳細版は栄養・運動・睡眠・姿勢の4軸での個別改善提案PDF付き。',
              },
              {
                n: '04',
                t: '月1で再測定（任意）',
                b: '毎月の数字を記録すれば、塾の偏差値表のように成長の推移が見えます。',
              },
            ].map((s) => (
              <li key={s.n} className="relative">
                <span className="absolute -left-[34px] md:-left-[50px] top-0 w-8 h-8 md:w-10 md:h-10 bg-blue-600 text-white text-xs md:text-sm font-bold rounded-full flex items-center justify-center">
                  {s.n}
                </span>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                  {s.t}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 最新ブログ */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900">
            最新の解説記事
          </h2>
          <Link
            href="/blog"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            すべて見る →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {recentPosts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <p className="text-xs font-bold text-blue-700 mb-2">
                {p.category}
              </p>
              <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
                {p.title}
              </h3>
              <p className="text-gray-500 text-xs">
                {p.publishedAt} ・ 約{p.readingMinutes}分
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 md:py-20 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-snug">
            まず、お子様の現在地を
            <br className="hidden md:block" />
            数字で見てみませんか
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-loose mb-8">
            身長・年齢・性別の3項目だけ。所要約2分。
          </p>
          <Link
            href="/growth"
            className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors"
          >
            無料で診断を始める →
          </Link>
        </div>
      </section>

      {/* B2B 訴求バー */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-gray-400 mb-1">
              FOR PARTNERS
            </p>
            <p className="text-base md:text-lg font-bold">
              ジム・教室・クリニック様へ｜店舗導入のご案内
            </p>
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              月¥9,800〜のSaaSプランで、店舗単位での運用が可能です。
            </p>
          </div>
          <Link
            href="/business"
            className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
          >
            導入のご案内 →
          </Link>
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
