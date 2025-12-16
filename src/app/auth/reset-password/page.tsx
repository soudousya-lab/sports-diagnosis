'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { FaSpinner, FaLock, FaCheckCircle } from 'react-icons/fa'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // URLからハッシュを確認（Supabaseがリダイレクト時にセッションを設定）
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // セッションがない場合はエラー表示
        setError('パスワードリセットリンクが無効または期限切れです')
      }
      setChecking(false)
    }

    checkSession()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setSuccess(true)

      // 3秒後にログアウトしてログインページへ
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.replace('/nbs-ctrl-8x7k2m/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
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
            パスワード再設定
          </h1>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-900 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaLock /> 新しいパスワード
            </h2>
          </div>

          <div className="p-6">
            {success ? (
              <div className="text-center py-4">
                <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                <div className="text-green-600 font-bold mb-2">パスワードを変更しました</div>
                <p className="text-gray-600 text-sm">
                  ログイン画面に移動します...
                </p>
              </div>
            ) : error && !password ? (
              <div className="text-center py-4">
                <div className="text-red-600 font-bold mb-4">{error}</div>
                <p className="text-gray-600 text-sm mb-4">
                  パスワードリセットをやり直してください。
                </p>
                <button
                  onClick={() => router.push('/nbs-ctrl-8x7k2m/login')}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                >
                  ログイン画面へ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    新しいパスワード
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="6文字以上"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード確認
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="もう一度入力"
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
                      <FaSpinner className="animate-spin" /> 更新中...
                    </span>
                  ) : (
                    'パスワードを変更'
                  )}
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
