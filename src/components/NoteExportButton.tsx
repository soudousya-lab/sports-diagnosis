'use client'

import { useState } from 'react'

interface Props {
  title: string
  body: string
  description: string
  references?: { label: string; url: string }[]
  canonicalUrl: string
}

/**
 * note向けMarkdownを生成してクリップボードにコピーするボタン
 * note は公式投稿APIがないため、整形済みMDを手動ペースト前提で出力する
 */
export default function NoteExportButton({
  title,
  body,
  description,
  references,
  canonicalUrl,
}: Props) {
  const [copied, setCopied] = useState(false)

  const buildMarkdown = (): string => {
    const refSection =
      references && references.length > 0
        ? `\n\n---\n\n### 参考・関連リソース\n\n${references
            .map((r) => `- [${r.label}](${r.url})`)
            .join('\n')}`
        : ''
    const original = `\n\n---\n\n本記事は [${title}](${canonicalUrl}) を再構成したものです。最新版は元サイトでご確認ください。\n`
    return `# ${title}\n\n${description}\n\n${body.trim()}${refSection}${original}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdown())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e) {
      // フォールバック: テキストエリアで選択コピー
      const ta = document.createElement('textarea')
      ta.value = buildMarkdown()
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } finally {
        document.body.removeChild(ta)
      }
    }
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 md:p-5 my-8">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
        <div className="flex-1">
          <p className="text-xs font-bold text-emerald-700 mb-1">
            CROSS-POST ／ note への投稿支援
          </p>
          <p className="text-emerald-800 text-sm leading-relaxed">
            この記事を note にも投稿する用に、整形済みMarkdownをコピーできます。
            ペースト先：note 編集画面の本文。
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {copied ? '✓ コピー済み' : 'note用にコピー'}
          </button>
          <a
            href="https://note.com/notes/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            note を開く →
          </a>
        </div>
      </div>
    </div>
  )
}
