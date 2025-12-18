'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { FaSpinner, FaLock, FaEnvelope } from 'react-icons/fa'

export default function StoreLoginPage() {
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>('')
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // 重複チェック防止
  const authCheckStarted = useRef(false)

  // 初期認証チェック（1回のみ実行、onAuthStateChangeを使わない）
  useEffect(() => {
    if (authCheckStarted.current) return
    authCheckStarted.current = true

    const checkExistingSession = async () => {
      console.log('[StoreLogin] Checking existing session...')

      // タイムアウト用のAbortController的な処理
      const timeoutId = setTimeout(() => {
        console.log('[StoreLogin] Session check timeout, showing login form')
        setCheckingAuth(false)
      }, 8000)

      try {
        // 現在のセッションを取得
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          console.log('[StoreLogin] No existing session')
          clearTimeout(timeoutId)
          setCheckingAuth(false)
          return
        }

        console.log('[StoreLogin] Found existing session, checking access...')

        // 店舗情報とプロファイルを並行取得（個別タイムアウト付き）
        const fetchWithTimeout = async <T,>(
          queryFn: () => PromiseLike<T>,
          ms: number
        ): Promise<T | null> => {
          const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
          return Promise.race([Promise.resolve(queryFn()), timeout])
        }

        const [storeResult, profileResult] = await Promise.all([
          fetchWithTimeout(
            () => supabase.from('stores').select('id, name').eq('slug', slug).single(),
            5000
          ),
          fetchWithTimeout(
            () => supabase.from('user_profiles').select('role, store_id').eq('id', session.user.id).single(),
            5000
          )
        ])

        clearTimeout(timeoutId)

        const storeData = storeResult?.data
        const profile = profileResult?.data

        if (storeData) {
          setStoreName(storeData.name)
        }

        console.log('[StoreLogin] Profile:', profile, 'Store:', storeData)

        if (profile) {
          // masterは全店舗アクセス可能
          if (profile.role === 'master') {
            console.log('[StoreLogin] Master - redirecting')
            window.location.href = `/store/${slug}`
            return
          }
          // 店舗ユーザーは自分の店舗のみアクセス可能
          if (profile.role === 'store' && storeData && profile.store_id === storeData.id) {
            console.log('[StoreLogin] Store user - redirecting')
            window.location.href = `/store/${slug}`
            return
          }
        }

        // アクセス権がない場合はログインフォームを表示
        console.log('[StoreLogin] No access, showing login form')
        setCheckingAuth(false)
      } catch (err) {
        console.error('[StoreLogin] Error checking session:', err)
        clearTimeout(timeoutId)
        setCheckingAuth(false)
      }
    }

    checkExistingSession()
  }, [slug, supabase])

  // 店舗名取得（セッションがない場合用）
  useEffect(() => {
    if (storeName) return // 既に取得済み

    async function fetchStoreName() {
      const { data: storeData } = await supabase
        .from('stores')
        .select('name')
        .eq('slug', slug)
        .single()

      if (storeData) {
        setStoreName(storeData.name)
      }
    }
    fetchStoreName()
  }, [slug, supabase, storeName])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    console.log('[StoreLogin] handleLogin started')

    try {
      // ログイン実行
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (!data.user) {
        throw new Error('ログインに失敗しました')
      }

      console.log('[StoreLogin] User authenticated:', data.user.id)

      // プロファイルと店舗情報を並行取得
      const [profileResult, storeResult] = await Promise.all([
        supabase.from('user_profiles').select('role, store_id').eq('id', data.user.id).single(),
        supabase.from('stores').select('id').eq('slug', slug).single()
      ])

      const profile = profileResult.data
      const storeData = storeResult.data

      console.log('[StoreLogin] Profile:', profile, 'Store:', storeData)

      if (!profile) {
        await supabase.auth.signOut()
        throw new Error('ユーザープロファイルが見つかりません')
      }

      // アクセス権限チェック
      if (profile.role === 'master') {
        console.log('[StoreLogin] Master access granted')
        setRedirecting(true)
        setLoading(false)
        window.location.href = `/store/${slug}`
        return
      }

      if (profile.role === 'store') {
        if (storeData && profile.store_id === storeData.id) {
          console.log('[StoreLogin] Store access granted')
          setRedirecting(true)
          setLoading(false)
          window.location.href = `/store/${slug}`
          return
        } else {
          console.log('[StoreLogin] Store access denied - ID mismatch:', profile.store_id, 'vs', storeData?.id)
          await supabase.auth.signOut()
          throw new Error('この店舗へのアクセス権限がありません')
        }
      }

      // その他のロール
      await supabase.auth.signOut()
      throw new Error('店舗へのアクセス権限がありません')

    } catch (err) {
      console.error('[StoreLogin] Login error:', err)
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) throw resetError

      setResetSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードリセットメールの送信に失敗しました')
    } finally {
      setResetLoading(false)
    }
  }

  if (checkingAuth || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-white text-4xl mx-auto mb-4" />
          {redirecting && <p className="text-white text-lg">リダイレクト中...</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-0.5 bg-white/20 text-white rounded">NOBISHIRO KIDS</span>
          </div>
          <h1 className="text-2xl xs:text-3xl font-bold text-white mb-2 tracking-wider">
            運動能力診断システム
          </h1>
          {storeName && (
            <p className="text-blue-200 text-sm xs:text-base">
              {storeName}
            </p>
          )}
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-900 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaLock /> {showResetForm ? 'パスワードリセット' : 'ログイン'}
            </h2>
          </div>

          <div className="p-6">
            {showResetForm ? (
              // パスワードリセットフォーム
              resetSent ? (
                <div className="text-center py-4">
                  <div className="text-green-600 font-bold mb-2">メールを送信しました</div>
                  <p className="text-gray-600 text-sm mb-4">
                    {resetEmail} にパスワードリセット用のリンクを送信しました。<br />
                    メールをご確認ください。
                  </p>
                  <button
                    onClick={() => {
                      setShowResetForm(false)
                      setResetSent(false)
                      setResetEmail('')
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    ログイン画面に戻る
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <p className="text-gray-600 text-sm mb-4">
                    登録されているメールアドレスを入力してください。<br />
                    パスワードリセット用のリンクを送信します。
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" /> 送信中...
                      </span>
                    ) : (
                      'リセットメールを送信'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false)
                      setError(null)
                    }}
                    className="w-full text-gray-600 hover:text-gray-800 text-sm"
                  >
                    ログイン画面に戻る
                  </button>
                </form>
              )
            ) : (
              // ログインフォーム
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" /> ログイン中...
                    </span>
                  ) : (
                    'ログイン'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(true)
                    setError(null)
                  }}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm"
                >
                  パスワードを忘れた方はこちら
                </button>
              </form>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8 text-blue-200 text-sm">
          © 2025 NOBISHIRO KIDS
        </div>
      </div>
    </div>
  )
}
