'use client'

import Link from 'next/link'
import { useState } from 'react'

type FormData = {
  companyName: string
  name: string
  email: string
  phone: string
  inquiryType: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // バリデーション
    if (!formData.name || !formData.email || !formData.inquiryType || !formData.message) {
      setError('必須項目を入力してください')
      setIsSubmitting(false)
      return
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('正しいメールアドレスを入力してください')
      setIsSubmitting(false)
      return
    }

    try {
      // お問い合わせ送信API（後で実装）
      // 現在はダミーで成功とする
      await new Promise(resolve => setTimeout(resolve, 1000))

      setIsSubmitted(true)
    } catch {
      setError('送信に失敗しました。しばらく経ってから再度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">お問い合わせを受け付けました</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            お問い合わせいただきありがとうございます。<br />
            内容を確認の上、担当者より2営業日以内にご連絡いたします。
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">N</span>
              </div>
              <span className="font-semibold text-base sm:text-lg text-gray-900 tracking-tight">NOBISHIRO KIDS</span>
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← トップに戻る
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* タイトル */}
        <div className="mb-12">
          <p className="text-sm text-gray-400 tracking-widest uppercase mb-4">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">お問い合わせ</h1>
          <p className="text-gray-600">
            導入のご相談、デモのご依頼、その他ご質問など<br className="sm:hidden" />
            お気軽にお問い合わせください。
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 会社名・教室名 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              会社名・教室名
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="例）〇〇スポーツクラブ"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* お名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="例）山田 太郎"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="例）info@example.com"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* 電話番号 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              電話番号
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="例）090-1234-5678"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* お問い合わせ種別 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              お問い合わせ種別 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.inquiryType}
              onChange={(e) => handleChange('inquiryType', e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900"
            >
              <option value="">選択してください</option>
              <option value="導入相談">導入のご相談</option>
              <option value="デモ依頼">デモのご依頼</option>
              <option value="料金確認">料金について</option>
              <option value="機能質問">機能についてのご質問</option>
              <option value="その他">その他</option>
            </select>
          </div>

          {/* お問い合わせ内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              お問い合わせ内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="お問い合わせ内容をご記入ください"
              rows={6}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder-gray-400 resize-none"
            />
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </button>
        </form>

        {/* 補足情報 */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-4 text-center">
            お急ぎの場合はお電話でもお問い合わせいただけます
          </p>
          <a
            href="tel:000-0000-0000"
            className="flex items-center justify-center gap-2 text-gray-900 font-medium hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            000-0000-0000（平日 10:00〜18:00）
          </a>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 NOBISHIRO KIDS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
