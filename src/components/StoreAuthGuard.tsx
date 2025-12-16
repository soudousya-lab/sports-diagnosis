'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { FaSpinner } from 'react-icons/fa'

// 認証タイムアウト（ミリ秒）
const AUTH_TIMEOUT_MS = 10000 // 10秒

type Props = {
  slug: string
  children: React.ReactNode
}

export default function StoreAuthGuard({ slug, children }: Props) {
  const router = useRouter()
  // supabaseクライアントをメモ化
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const checkedRef = useRef(false)

  useEffect(() => {
    // 既にチェック済みの場合はスキップ
    if (checkedRef.current) {
      return
    }
    checkedRef.current = true

    let isMounted = true

    // タイムアウト付きPromise
    const withTimeout = <T,>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> => {
      return Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('認証タイムアウト')), timeoutMs)
        )
      ])
    }

    async function checkAuth() {
      try {
        // セッションチェック（タイムアウト付き）
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS
        )

        if (!isMounted) return

        if (!session) {
          router.replace(`/store/${slug}/login`)
          return
        }

        // セッションの有効期限をチェック
        if (session.expires_at && session.expires_at * 1000 < Date.now()) {
          console.log('[StoreAuthGuard] Session expired, signing out')
          await supabase.auth.signOut()
          router.replace(`/store/${slug}/login`)
          return
        }

        // 店舗情報取得（タイムアウト付き）
        const storeResult = await withTimeout(
          supabase
            .from('stores')
            .select('id')
            .eq('slug', slug)
            .single(),
          AUTH_TIMEOUT_MS
        )
        const storeData = storeResult?.data

        if (!isMounted) return

        if (!storeData) {
          router.replace(`/store/${slug}/login`)
          return
        }

        // プロファイル確認（タイムアウト付き）
        const profileResult = await withTimeout(
          supabase
            .from('user_profiles')
            .select('role, store_id')
            .eq('id', session.user.id)
            .single(),
          AUTH_TIMEOUT_MS
        )
        const profile = profileResult?.data

        if (!isMounted) return

        if (!profile) {
          await supabase.auth.signOut()
          router.replace(`/store/${slug}/login`)
          return
        }

        // アクセス権限チェック
        if (profile.role === 'master') {
          // masterは全店舗アクセス可能
          setIsAuthorized(true)
        } else if (profile.role === 'store' && profile.store_id === storeData.id) {
          // 店舗ユーザーは自分の店舗のみアクセス可能
          setIsAuthorized(true)
        } else {
          // アクセス権限がない場合
          await supabase.auth.signOut()
          router.replace(`/store/${slug}/login`)
          return
        }
      } catch (err) {
        console.error('Auth check error:', err)
        if (isMounted) {
          // タイムアウトの場合もログインページへ
          router.replace(`/store/${slug}/login`)
        }
      } finally {
        if (isMounted) {
          setChecking(false)
        }
      }
    }

    checkAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_OUT') {
          router.replace(`/store/${slug}/login`)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [slug, supabase, router])

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
