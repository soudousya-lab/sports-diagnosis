import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'ブログ | NOBISHIRO KIDS — 子どもの成長と運動神経の科学',
  description:
    '子どもの身長・運動神経・姿勢にまつわる、エビデンスベースの解説記事。成長スパート、ゴールデンエイジ、コーディネーション7能力など、保護者が知っておきたい知識をまとめています。',
  alternates: { canonical: 'https://nobishiro.kids/blog' },
  openGraph: {
    title: 'ブログ | NOBISHIRO KIDS',
    description: '子どもの身長・運動神経・姿勢の科学を、保護者の言葉で。',
    type: 'website',
  },
}

const categoryColors: Record<string, string> = {
  '身長・成長': 'bg-blue-100 text-blue-700',
  運動能力: 'bg-emerald-100 text-emerald-700',
  栄養: 'bg-amber-100 text-amber-700',
  姿勢: 'bg-purple-100 text-purple-700',
  '研究・論文': 'bg-gray-100 text-gray-700',
}

export default function BlogIndex() {
  const posts = getAllPosts()

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
            <Link href="/growth" className="text-gray-600 hover:text-blue-600">
              身長診断
            </Link>
            <Link href="/blog" className="text-blue-600 font-medium">
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
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs tracking-widest text-blue-600 font-medium mb-4">
            BLOG
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-snug">
            子どもの成長と運動神経の科学を、
            <br className="hidden md:block" />
            保護者の言葉で。
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-loose">
            NOBISHIRO のブログでは、身長・運動神経・姿勢にまつわるエビデンスを、
            一次資料を引きながらわかりやすく解説します。
          </p>
        </div>
      </section>

      {/* 記事一覧 */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    categoryColors[post.category] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-gray-400 text-xs">
                  {post.publishedAt} ・ 約{post.readingMinutes}分
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {post.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium">
                続きを読む
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            お子様の運動能力と成長、数字で見てみませんか
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-loose mb-8">
            NOBISHIRO の診断は、運動能力 7 項目と成長予測を
            10 分の計測で数値化します。
          </p>
          <Link
            href="/new"
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors"
          >
            無料で診断を試す
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-xs">
        © 2026 NOBISHIRO KIDS
      </footer>
    </main>
  )
}
