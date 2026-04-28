// 記事ごとにnote用Markdownをサーバーから取得するAPI
// クライアントの NoteExportButton はクライアント生成で動作するが、
// 自動化スクリプト・Webhook用にサーバーAPIも用意

import { NextResponse } from 'next/server'
import { getPostBySlug } from '@/lib/blog'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const refSection =
    post.references && post.references.length > 0
      ? `\n\n---\n\n### 参考・関連リソース\n\n${post.references
          .map((r) => `- [${r.label}](${r.url})`)
          .join('\n')}`
      : ''
  const canonicalUrl = `https://nobishiro.kids/blog/${post.slug}`
  const original = `\n\n---\n\n本記事は [${post.title}](${canonicalUrl}) を再構成したものです。最新版は元サイトでご確認ください。\n`
  const md = `# ${post.title}\n\n${post.description}\n\n${post.body.trim()}${refSection}${original}`

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.md"`,
    },
  })
}
