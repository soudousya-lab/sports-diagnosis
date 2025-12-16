'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { FaSpinner, FaLock, FaEnvelope } from 'react-icons/fa'

export default function StoreLoginPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>('')
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // 店舗情報取得
  useEffect(() => {
    async function fetchStoreName() {
      const { data: storeData } = await supabase
        .from('stores')
        .select('id, name')
        .eq('slug', slug)
        .single()

      if (storeData) {
        setStoreName(storeData.name)
      }
    }
    fetchStoreName()
  }, [slug, supabase])

  // 認証チェック
  useEffect(() => {
    let isMounted = true
    let authHandled = false

    // タイムアウト（8秒でローディング解除）
    const timeoutId = setTimeout(() => {
      if (isMounted && !authHandled) {
        console.log('[StoreLogin] Auth check timeout')
        setCheckingAuth(false)
        authHandled = true
      }
    }, 8000)

    // onAuthStateChangeを先にセットアップ
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[StoreLogin] onAuthStateChange:', event)

        if (!isMounted) return

        // 既に処理済みの場合はスキップ（ただしSIGNED_INは常に処理）
        if (authHandled && event !== 'SIGNED_IN') {
          return
        }

        if (session) {
          // 店舗情報取得
          const { data: storeData } = await supabase
            .from('stores')
            .select('id')
            .eq('slug', slug)
            .single()

          // プロファイル確認
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, store_id')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            // masterは全店舗アクセス可能
            if (profile.role === 'master') {
              router.replace(`/store/${slug}`)
              return
            }
            // 店舗ユーザーは自分の店舗のみアクセス可能
            if (profile.role === 'store' && storeData && profile.store_id === storeData.id) {
              router.replace(`/store/${slug}`)
              return
            }
          }
        }

        // セッションがない、またはアクセス権がない場合はログインフォームを表示
        authHandled = true
        setCheckingAuth(false)
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [slug, supabase, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        // プロファイル確認
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, store_id')
          .eq('id', data.user.id)
          .single()

        if (!profile) {
          throw new Error('ユーザープロファイルが見つかりません')
        }

        // 店舗情報取得
        const { data: storeData } = await supabase
          .from('stores')
          .select('id')
          .eq('slug', slug)
          .single()

        // アクセス権限チェック
        if (profile.role === 'master') {
          // masterは全店舗アクセス可能
          router.replace(`/store/${slug}`)
        } else if (profile.role === 'store') {
          if (storeData && profile.store_id === storeData.id) {
            router.replace(`/store/${slug}`)
          } else {
            await supabase.auth.signOut()
            throw new Error('この店舗へのアクセス権限がありません')
          }
        } else {
          await supabase.auth.signOut()
          throw new Error('店舗へのアクセス権限がありません')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
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
          © 2024 NOBISHIRO KIDS
        </div>
      </div>
    </div>
  )
}
