'use client'

import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, Session } from '@supabase/supabase-js'
import { createClientComponentClient, UserProfile, UserRole } from './supabase'

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

    // 初期セッション取得
    const getInitialSession = async () => {
      console.log('[AuthContext] getInitialSession started')

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()

        if (!isMounted) return

        console.log('[AuthContext] getSession result:', { session: !!initialSession, error })

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          console.log('[AuthContext] fetching profile for user:', initialSession.user.id)
          await fetchProfile(initialSession.user.id)
          console.log('[AuthContext] profile fetched')
        }
      } catch (err) {
        console.error('[AuthContext] getInitialSession error:', err)
      } finally {
        if (isMounted) {
          console.log('[AuthContext] setting loading to false')
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // セッション変更を監視（ログイン/ログアウト時のみ反応）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[AuthContext] onAuthStateChange:', event)

        // INITIAL_SESSIONイベントは getInitialSession で処理済みなのでスキップ
        if (event === 'INITIAL_SESSION') {
          return
        }

        if (!isMounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
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
