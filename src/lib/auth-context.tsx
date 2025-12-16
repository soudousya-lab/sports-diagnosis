'use client'

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react'
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

  // supabaseクライアントをメモ化
  const supabase = useMemo(() => createClientComponentClient(), [])

  useEffect(() => {
    // 初期セッション取得
    const getInitialSession = async () => {
      console.log('[AuthContext] getInitialSession started')

      // タイムアウト設定（5秒で強制終了）
      const timeoutId = setTimeout(() => {
        console.log('[AuthContext] Session check timeout - proceeding without session')
        setLoading(false)
      }, 5000)

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        clearTimeout(timeoutId)
        console.log('[AuthContext] getSession result:', { session: !!initialSession, error })

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          console.log('[AuthContext] fetching profile for user:', initialSession.user.id)
          await fetchProfile(initialSession.user.id)
          console.log('[AuthContext] profile fetched')
        }
      } catch (err) {
        clearTimeout(timeoutId)
        console.error('[AuthContext] getInitialSession error:', err)
      } finally {
        console.log('[AuthContext] setting loading to false')
        setLoading(false)
      }
    }

    getInitialSession()

    // セッション変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
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

    return () => subscription.unsubscribe()
  }, [supabase])

  const fetchProfile = async (userId: string) => {
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
  }

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
