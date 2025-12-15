import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// サブドメインからスラッグを抽出する関数
function extractSubdomain(host: string): string | null {
  // ローカル開発環境の場合（localhost:3000 など）
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return null
  }

  // ポート番号を除去
  const hostWithoutPort = host.split(':')[0]
  const parts = hostWithoutPort.split('.')

  // nobishiro.kids の場合（例: store-a.nobishiro.kids → ["store-a", "nobishiro", "kids"]）
  // vercel.app の場合（例: store-a.sports-diagnosis.vercel.app → ["store-a", "sports-diagnosis", "vercel", "app"]）

  // メインドメインのみの場合はサブドメインなし
  // nobishiro.kids (2パーツ) → サブドメインなし
  // xxx.nobishiro.kids (3パーツ) → xxx がサブドメイン
  // sports-diagnosis.vercel.app (3パーツ) → サブドメインなし（これがメインドメイン）
  // xxx.sports-diagnosis.vercel.app (4パーツ) → xxx がサブドメイン

  // Vercel のサブドメイン
  if (host.includes('vercel.app')) {
    // sports-diagnosis.vercel.app の場合は3パーツでサブドメインなし
    // xxx.sports-diagnosis.vercel.app の場合は4パーツ以上でサブドメインあり
    if (parts.length >= 4) {
      const subdomain = parts[0]
      if (!['admin', 'www', 'app', 'api'].includes(subdomain)) {
        return subdomain
      }
    }
    return null
  }

  // 独自ドメインの場合（nobishiro.kids など）
  // xxx.nobishiro.kids → 3パーツ → xxx がサブドメイン
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
