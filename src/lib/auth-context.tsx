'use client'

import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, Session } from '@supabase/supabase-js'
import { createClientComponentClient, UserProfile, UserRole } from './supabase'

// セッションタイムアウト（ミリ秒）- 認証チェックが完了しない場合のフォールバック
const AUTH_TIMEOUT_MS = 10000 // 10秒

// セッション有効期限（秒）- Supabaseのセッションリフレッシュ間隔
const SESSION_EXPIRY_SECONDS = 60 * 60 * 6 // 6時間

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isRole: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 初期化完了フラグ（重複実行防止）
  const initializedRef = useRef(false)
  const fetchingProfileRef = useRef(false)

  // supabaseクライアントをメモ化
  const supabase = useMemo(() => createClientComponentClient(), [])

  // fetchProfileをuseCallbackでメモ化
  const fetchProfile = useCallback(async (userId: string) => {
    // 既に取得中の場合はスキップ
    if (fetchingProfileRef.current) {
      console.log('[AuthContext] fetchProfile already in progress, skipping')
      return
    }

    fetchingProfileRef.current = true
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        setProfile(data as UserProfile)
      }
    } finally {
      fetchingProfileRef.current = false
    }
  }, [supabase])

  useEffect(() => {
    // 既に初期化済みの場合はスキップ
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true

    let isMounted = true
    let sessionHandled = false // セッションが既に処理されたかどうか

    // セッション変更を監視（onAuthStateChangeを先にセットアップ）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[AuthContext] onAuthStateChange:', event)

        if (!isMounted) return

        // セッションが既に処理された場合はログイン/ログアウトイベントのみ反応
        if (sessionHandled && event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'TOKEN_REFRESHED') {
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          // セッションの有効期限をチェック
          const expiresAt = currentSession.expires_at
          if (expiresAt && expiresAt * 1000 < Date.now()) {
            console.log('[AuthContext] Session expired, signing out')
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
            setProfile(null)
            sessionHandled = true
            setLoading(false)
            return
          }

          // プロファイル取得
          try {
            await fetchProfile(currentSession.user.id)
          } catch (err) {
            console.error('[AuthContext] fetchProfile error:', err)
          }
        } else {
          setProfile(null)
        }

        sessionHandled = true
        setLoading(false)
      }
    )

    // フォールバックとしてタイムアウト後にローディングを解除
    const timeoutId = setTimeout(() => {
      if (isMounted && !sessionHandled) {
        console.log('[AuthContext] Auth timeout, setting loading to false')
        setLoading(false)
        sessionHandled = true
      }
    }, AUTH_TIMEOUT_MS)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const currentRole = profile?.role
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)

    // ロールに応じてログインページにリダイレクト
    if (currentRole === 'master') {
      router.push('/nbs-ctrl-8x7k2m/login')
    } else if (currentRole === 'partner') {
      router.push('/master/partner/login')
    } else {
      router.push('/')
    }
  }

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!profile) return false
    if (Array.isArray(role)) {
      return role.includes(profile.role)
    }
    return profile.role === role
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signOut, isRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
