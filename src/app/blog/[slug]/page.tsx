import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts, getAllPosts, getPostBySlug } from '@/lib/blog'
import NoteExportButton from '@/components/NoteExportButton'

type RouteParams = { slug: string }

export async function generateStaticParams(): Promise<RouteParams[]> {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: '記事が見つかりません | NOBISHIRO' }

  return {
    title: `${post.title} | NOBISHIRO ブログ`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://nobishiro.kids/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  }
}

const categoryColors: Record<string, string> = {
  '身長・成長': 'bg-blue-100 text-blue-700',
  運動能力: 'bg-emerald-100 text-emerald-700',
  栄養: 'bg-amber-100 text-amber-700',
  姿勢: 'bg-purple-100 text-purple-700',
  '研究・論文': 'bg-gray-100 text-gray-700',
}

// シンプルなマークダウン風レンダラ（依存追加なし）
function renderBody(body: string): React.ReactNode {
  const blocks = body.trim().split(/\n\n+/)
  return blocks.map((block, i) => {
    if (block.startsWith('## ')) {
      return (
        <h2
          key={i}
          className="text-xl md:text-2xl font-bold text-gray-900 mt-12 mb-4 leading-snug"
        >
          {block.replace(/^## /, '')}
        </h2>
      )
    }
    if (block.startsWith('### ')) {
      return (
        <h3
          key={i}
          className="text-lg md:text-xl font-bold text-gray-900 mt-8 mb-3 leading-snug"
        >
          {block.replace(/^### /, '')}
        </h3>
      )
    }
    if (block.startsWith('- ') || block.startsWith('* ')) {
      const items = block.split('\n').map((l) => l.replace(/^[-*] /, ''))
      return (
        <ul
          key={i}
          className="my-4 space-y-2 text-gray-700 list-disc pl-6 leading-loose"
        >
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      )
    }
    if (block.startsWith('|')) {
      const lines = block.split('\n').filter((l) => l.startsWith('|'))
      const headers = lines[0]
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
      const rows = lines.slice(2).map((row) =>
        row
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim())
      )
      return (
        <div key={i} className="my-6 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-blue-50 text-gray-900">
              <tr>
                {headers.map((h, k) => (
                  <th key={k} className="px-4 py-2 text-left font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, k) => (
                <tr key={k} className="border-t border-gray-100">
                  {row.map((c, l) => (
                    <td key={l} className="px-4 py-2 text-gray-700">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    return (
      <p key={i} className="text-gray-700 leading-loose my-4">
        {renderInline(block)}
      </p>
    )
  })
}

function renderInline(text: string): React.ReactNode {
  // **bold** のみ簡易対応
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const others = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)

  // JSON-LD（Article）
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    keywords: post.keywords.join(', '),
    publisher: {
      '@type': 'Organization',
      name: 'NOBISHIRO KIDS',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nobishiro.kids/blog/${post.slug}`,
    },
  }

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

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

      {/* パンくず */}
      <nav className="max-w-3xl mx-auto px-4 pt-6 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">
          ホーム
        </Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">
          ブログ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 line-clamp-1 inline-block max-w-xs align-middle">
          {post.title}
        </span>
      </nav>

      {/* 記事ヘッダー */}
      <article className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
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

        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-snug mb-6">
          {post.title}
        </h1>

        <p className="text-gray-600 text-sm md:text-base leading-loose border-l-4 border-blue-300 pl-4 mb-8">
          {post.description}
        </p>

        {/* TL;DR */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 md:p-6 mb-10">
          <p className="text-blue-700 font-bold text-sm mb-3">この記事の要点</p>
          <ul className="space-y-2">
            {post.tldr.map((t, i) => (
              <li
                key={i}
                className="text-gray-700 text-sm leading-relaxed flex gap-2"
              >
                <span className="text-blue-600 font-bold flex-shrink-0">
                  {i + 1}.
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 本文 */}
        <div className="prose-custom">{renderBody(post.body)}</div>

        {/* note 投稿支援 */}
        <NoteExportButton
          title={post.title}
          body={post.body}
          description={post.description}
          references={post.references}
          canonicalUrl={`https://nobishiro.kids/blog/${post.slug}`}
        />

        {/* 参考文献 */}
        {post.references && post.references.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-3">
              参考・関連リソース
            </p>
            <ul className="space-y-2 text-sm">
              {post.references.map((ref, i) => (
                <li key={i}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white text-center">
          <h2 className="text-lg md:text-xl font-bold mb-2">
            お子様の現在地、数字で見てみませんか
          </h2>
          <p className="text-blue-100 text-sm leading-loose mb-6">
            NOBISHIRO の診断は、運動能力 7 項目と成長予測を 10 分で数値化します。
          </p>
          <Link
            href="/new"
            className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors"
          >
            無料で診断を試す →
          </Link>
        </div>
      </article>

      {/* 他の記事 */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          他の記事を読む
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {others.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 ${
                  categoryColors[p.category] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {p.category}
              </span>
              <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                {p.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-xs">
        © 2026 NOBISHIRO KIDS
      </footer>
    </main>
  )
}
