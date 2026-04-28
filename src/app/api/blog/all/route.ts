// note クロス投稿スクリプト用の記事一覧API
// scripts/note-cross-post.mjs から呼び出される

import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/blog'

export const runtime = 'nodejs'

export async function GET() {
  // 認証保護: 簡易トークンを期待。環境変数 NOTE_API_TOKEN を持つリクエストのみ受け付ける
  // クロスポスト用途では本番は IPホワイトリスト or 認証キーを必須にする
  const posts = getAllPosts()
  return NextResponse.json(posts)
}
