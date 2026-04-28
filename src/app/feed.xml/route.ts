// NOBISHIRO ブログ RSS feed
// note・IFTTT・Zapier・Hootsuite・Buffer 等の自動連携入口
// 関連: scripts/note-cross-post.mjs（Playwright自動投稿）

import { getAllPosts } from '@/lib/blog'

const SITE_URL = 'https://nobishiro.kids'
const SITE_TITLE = 'NOBISHIRO ブログ'
const SITE_DESCRIPTION =
  '子どもの身長・運動神経・姿勢の科学を、保護者の言葉で。エビデンスベースの解説記事。'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function bodyToHtml(body: string): string {
  // RSSのcontent:encoded用に、ブログ本文MDを最低限のHTMLへ変換
  const lines = body.trim().split(/\n\n+/)
  return lines
    .map((block) => {
      if (block.startsWith('## ')) return `<h2>${escapeXml(block.slice(3))}</h2>`
      if (block.startsWith('### ')) return `<h3>${escapeXml(block.slice(4))}</h3>`
      if (block.startsWith('- ') || block.startsWith('* ')) {
        const items = block
          .split('\n')
          .map((l) => `<li>${escapeXml(l.replace(/^[-*] /, ''))}</li>`)
          .join('')
        return `<ul>${items}</ul>`
      }
      if (block.startsWith('|')) {
        // テーブルはRSSではプレーン化
        return `<p>${escapeXml(block.replace(/\|/g, ' '))}</p>`
      }
      return `<p>${escapeXml(block)}</p>`
    })
    .join('\n')
}

export async function GET() {
  const posts = getAllPosts()

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      const pubDate = new Date(post.publishedAt + 'T09:00:00+09:00').toUTCString()
      const html = bodyToHtml(post.body)

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.description)}</description>
      <content:encoded><![CDATA[${html}]]></content:encoded>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
    },
  })
}
