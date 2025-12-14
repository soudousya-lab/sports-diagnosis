import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component では set は無視される
          }
        },
      },
    }
  )
}

// ミドルウェア用のクライアント作成
export function createMiddlewareClient(
  request: Request,
  response: Response
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie') || ''
          return cookieHeader.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=')
            return { name, value: rest.join('=') }
          }).filter(c => c.name)
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.headers.append('Set-Cookie', serializeCookie(name, value, options))
          })
        },
      },
    }
  )
}

function serializeCookie(name: string, value: string, options?: CookieOptions): string {
  let cookie = `${name}=${value}`
  if (options?.path) cookie += `; Path=${options.path}`
  if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`
  if (options?.domain) cookie += `; Domain=${options.domain}`
  if (options?.secure) cookie += `; Secure`
  if (options?.httpOnly) cookie += `; HttpOnly`
  if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`
  return cookie
}
