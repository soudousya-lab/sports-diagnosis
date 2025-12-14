import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// サブドメインからスラッグを抽出する関数
function extractSubdomain(host: string): string | null {
  // ローカル開発環境の場合（localhost:3000 など）
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return null
  }

  // 本番環境のドメイン（例: store-a.sports-diagnosis.com）
  const parts = host.split('.')

  // サブドメインがある場合（例: store-a.sports-diagnosis.com → ["store-a", "sports-diagnosis", "com"]）
  // admin, www, app は除外
  if (parts.length >= 3) {
    const subdomain = parts[0]
    if (!['admin', 'www', 'app', 'api'].includes(subdomain)) {
      return subdomain
    }
  }

  return null
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // サブドメインチェック
  const host = request.headers.get('host') || ''
  const subdomain = extractSubdomain(host)

  // サブドメインがある場合、店舗ページにリダイレクト
  if (subdomain && !request.nextUrl.pathname.startsWith('/store/')) {
    // /store/[slug] へリライト（URLは変更せず内部でルーティング）
    const url = request.nextUrl.clone()
    url.pathname = `/store/${subdomain}${request.nextUrl.pathname}`
    return NextResponse.rewrite(url)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // 管理画面へのアクセスをチェック
  if (pathname.startsWith('/admin')) {
    // ログインページは除外
    if (pathname === '/admin/login') {
      // 既にログイン済みならダッシュボードへリダイレクト
      if (session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          const redirectUrl = getRoleBasedRedirect(profile.role)
          return NextResponse.redirect(new URL(redirectUrl, request.url))
        }
      }
      return response
    }

    // 未ログインの場合はログインページへリダイレクト
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // ユーザープロファイルを取得
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, partner_id, store_id')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      // プロファイルがない場合はログアウトしてログインページへ
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // ロールベースのアクセス制御
    const role = profile.role

    // Master管理画面
    if (pathname.startsWith('/admin/master')) {
      if (role !== 'master') {
        return NextResponse.redirect(new URL(getRoleBasedRedirect(role), request.url))
      }
    }

    // Partner管理画面
    if (pathname.startsWith('/admin/partner')) {
      if (role !== 'master' && role !== 'partner') {
        return NextResponse.redirect(new URL(getRoleBasedRedirect(role), request.url))
      }
    }

    // Store管理画面
    if (pathname.startsWith('/admin/store')) {
      if (role !== 'master' && role !== 'partner' && role !== 'store') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }

  return response
}

function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'master':
      return '/admin/master'
    case 'partner':
      return '/admin/partner'
    case 'store':
      return '/admin/store'
    default:
      return '/admin/login'
  }
}

export const config = {
  matcher: [
    // 管理画面
    '/admin/:path*',
    // サブドメイン用（全てのパスをチェック、静的ファイルは除外）
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
