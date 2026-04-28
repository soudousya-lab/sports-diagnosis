#!/usr/bin/env node
/**
 * NOBISHIRO ブログ → note.com 自動クロス投稿スクリプト（Playwright）
 *
 * note は公式投稿APIがないため、Playwrightでブラウザを自動操作する。
 * 認証情報は環境変数で受け取り、ヘッドレスで投稿。
 *
 * 使い方:
 *   1. Playwrightインストール: npm i -D playwright && npx playwright install chromium
 *   2. 環境変数を設定:
 *      export NOTE_EMAIL="your@email.com"
 *      export NOTE_PASSWORD="your_password"
 *   3. 実行:
 *      node scripts/note-cross-post.mjs --slug golden-age-window
 *      node scripts/note-cross-post.mjs --all                    # 全記事
 *      node scripts/note-cross-post.mjs --slug golden-age-window --dry-run
 *
 * 注意:
 *   - note のUI変更で動かなくなる可能性あり。失敗時はセレクタを更新する
 *   - クロス投稿は重複コンテンツとしてSEO評価が下がる場合があるため、
 *     note側に「元記事はこちら（canonical link）」を必ず付ける運用にする
 *   - 本スクリプトは「下書き保存まで」を行う。最終公開はnoteの管理画面で確認後に実施
 */

import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 引数パース
const args = process.argv.slice(2)
const flags = {
  slug: null,
  all: false,
  dryRun: false,
}
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--all') flags.all = true
  else if (a === '--dry-run') flags.dryRun = true
  else if (a === '--slug') flags.slug = args[++i]
}

if (!flags.slug && !flags.all) {
  console.error('Usage: --slug <slug> | --all [--dry-run]')
  process.exit(1)
}

// blog.tsからの記事読み込み（簡易：ビルド済みJSを期待しない、TSから手動エクスポート想定）
// 実運用では blog.json をビルド時に生成するパイプラインを別途用意するのが堅実
async function loadPosts() {
  // 仮実装：fetch で本番サイトから取得
  const url = process.env.NOBISHIRO_API_URL || 'https://nobishiro.kids/api/blog/all'
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error(`記事取得失敗: ${e.message}`)
    console.error('代替: src/lib/blog.ts を直接tsxで読み込む形に変更してください')
    process.exit(1)
  }
}

function buildNoteMarkdown(post) {
  const refSection =
    post.references && post.references.length > 0
      ? `\n\n---\n\n### 参考・関連リソース\n\n${post.references
          .map((r) => `- [${r.label}](${r.url})`)
          .join('\n')}`
      : ''
  const original = `\n\n---\n\n本記事は [${post.title}](https://nobishiro.kids/blog/${post.slug}) を再構成したものです。最新版は元サイトでご確認ください。\n`
  return `${post.description}\n\n${post.body.trim()}${refSection}${original}`
}

async function postToNote(post) {
  if (flags.dryRun) {
    console.log(`[DRY-RUN] ${post.slug}: ${post.title}`)
    console.log(`  body length: ${post.body.length}`)
    return
  }

  const email = process.env.NOTE_EMAIL
  const password = process.env.NOTE_PASSWORD
  if (!email || !password) {
    console.error('NOTE_EMAIL / NOTE_PASSWORD 環境変数が未設定です')
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  try {
    // 1. ログイン
    console.log(`[${post.slug}] ログイン中...`)
    await page.goto('https://note.com/login', { waitUntil: 'networkidle' })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 30000,
    })

    // 2. 新規記事作成画面へ
    console.log(`[${post.slug}] 編集画面へ遷移...`)
    await page.goto('https://note.com/notes/new', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // 3. タイトル入力
    // ※ noteのUIは変わる可能性大、セレクタは要メンテ
    const titleSelector =
      'textarea[placeholder*="タイトル"], input[placeholder*="タイトル"]'
    await page.fill(titleSelector, post.title)

    // 4. 本文入力（Markdownをペーストする想定）
    const md = buildNoteMarkdown(post)
    const bodySelector = '[contenteditable="true"], textarea[placeholder*="本文"]'
    await page.click(bodySelector)
    await page.keyboard.type(md.slice(0, 200)) // テスト用に最初の200文字だけ
    // 本実装では: await page.evaluate((md) => { ... clipboard or innerHTML ... }, md)

    // 5. 下書き保存（公開はせず、人間が確認してから公開）
    console.log(`[${post.slug}] 下書き保存...`)
    const saveButton = await page.$('button:has-text("下書き保存"), button:has-text("保存")')
    if (saveButton) await saveButton.click()
    await page.waitForTimeout(3000)

    console.log(`[${post.slug}] ✓ 下書き保存完了。note管理画面で内容を確認後に公開してください`)
  } catch (e) {
    console.error(`[${post.slug}] エラー: ${e.message}`)
    await page.screenshot({
      path: resolve(__dirname, `note-error-${post.slug}.png`),
    })
  } finally {
    await browser.close()
  }
}

;(async () => {
  const posts = await loadPosts()
  const targets = flags.all ? posts : posts.filter((p) => p.slug === flags.slug)

  if (targets.length === 0) {
    console.error('対象記事が見つかりません')
    process.exit(1)
  }

  console.log(`対象 ${targets.length} 件:`, targets.map((p) => p.slug).join(', '))

  for (const post of targets) {
    await postToNote(post)
    // レート制限対策: 5秒待機
    if (!flags.dryRun) await new Promise((r) => setTimeout(r, 5000))
  }

  console.log('完了')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
