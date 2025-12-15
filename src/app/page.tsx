'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* ロゴ */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">N</span>
              </div>
              <span className="font-semibold text-base sm:text-lg text-gray-900 tracking-tight">NOBISHIRO KIDS</span>
            </Link>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">機能</a>
              <a href="#benefits" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">導入メリット</a>
              <a href="#flow" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">導入の流れ</a>
              <Link href="/contact" className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors">
                お問い合わせ
              </Link>
            </nav>

            {/* モバイルメニューボタン */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            <div className="px-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>機能</a>
              <a href="#benefits" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>導入メリット</a>
              <a href="#flow" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>導入の流れ</a>
              <Link href="/contact" className="block w-full text-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium">
                お問い合わせ
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ファーストビュー */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm text-gray-500 tracking-widest uppercase mb-6">Sports Ability Diagnosis System</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-8 tracking-tight">
                子どもの<br />
                <span className="text-gray-400">のびしろ</span>を<br />
                見つける
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10 max-w-lg">
                NOBISHIRO KIDSは、子どもの運動能力を科学的に診断し、
                一人ひとりに最適なトレーニングプランを提案する
                スポーツ教室向け診断システムです。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-lg font-medium text-base hover:bg-gray-800 transition-colors"
                >
                  導入のご相談
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-lg font-medium text-base border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  管理画面ログイン
                </Link>
              </div>
            </div>

            {/* ヒーローイメージ */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-[4/3] max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gray-100 rounded-2xl" />
                <div className="absolute inset-4 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Motor Age</p>
                        <p className="text-2xl font-bold text-gray-900">8.5歳</p>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">筋力</p>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-4/5 bg-gray-900 rounded-full" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">瞬発力</p>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-3/5 bg-gray-900 rounded-full" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">敏捷性</p>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gray-900 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 導入実績 */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">50<span className="text-2xl text-gray-400">+</span></div>
              <div className="text-sm text-gray-500">導入教室数</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">3,000<span className="text-2xl text-gray-400">+</span></div>
              <div className="text-sm text-gray-500">診断実績</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">98<span className="text-2xl text-gray-400">%</span></div>
              <div className="text-sm text-gray-500">満足度</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">7</div>
              <div className="text-sm text-gray-500">測定項目</div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section id="features" className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-gray-400 tracking-widest uppercase mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">主な機能</h2>
            <p className="text-gray-600">
              子どもの運動能力を多角的に分析し、成長をサポートする機能を提供します。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 機能1 */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7項目運動能力診断</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                握力、立ち幅跳び、15mダッシュなど7つの測定項目から、筋力・瞬発力・敏捷性などを総合的に分析します。
              </p>
            </div>

            {/* 機能2 */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">運動タイプ診断</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                お子様の運動特性を8つのタイプに分類。向いているスポーツや伸ばすべき能力を明確にします。
              </p>
            </div>

            {/* 機能3 */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">トレーニング提案</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                診断結果に基づき、弱点を補強するためのオリジナルトレーニングメニューを自動で提案します。
              </p>
            </div>

            {/* 機能4 */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">運動年齢算出</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                実年齢と比較した「運動年齢」を算出。お子様の運動発達状況を分かりやすく可視化します。
              </p>
            </div>

            {/* 機能5 */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">レポート出力</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                保護者向けの診断レポートをワンクリックで出力。説明会やイベントでも活用できます。
              </p>
            </div>

            {/* 機能6 */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">マルチ店舗対応</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                複数店舗のデータを一元管理。店舗ごとの実績把握やスタッフ権限管理も簡単に行えます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 導入メリット */}
      <section id="benefits" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-gray-400 tracking-widest uppercase mb-4">Benefits</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">導入メリット</h2>
            <p className="text-gray-600">
              NOBISHIRO KIDSの導入で、教室運営の質と効率が向上します。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-900">01</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">保護者への説得力あるフィードバック</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  数値データに基づく客観的な診断結果で、お子様の成長を可視化。保護者の満足度と信頼度が向上します。
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-900">02</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">イベント・体験会の集客ツール</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  無料診断イベントを開催することで、新規顧客の獲得に。データを活用した入会促進が可能です。
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-900">03</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">指導の質の標準化</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  診断結果に基づくトレーニング提案で、指導者の経験に依存しない質の高い指導を実現します。
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-900">04</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">継続率の向上</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  定期的な診断で成長を実感。目標設定と達成感により、長期的な通学継続につながります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 導入の流れ */}
      <section id="flow" className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-gray-400 tracking-widest uppercase mb-4">Flow</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">導入の流れ</h2>
            <p className="text-gray-600">
              お問い合わせから最短1週間で導入可能です。
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="text-6xl font-bold text-gray-100 mb-4">01</div>
              <h3 className="font-semibold text-gray-900 mb-2">お問い合わせ</h3>
              <p className="text-sm text-gray-600">フォームまたはお電話でお気軽にご連絡ください</p>
            </div>

            <div className="relative">
              <div className="text-6xl font-bold text-gray-100 mb-4">02</div>
              <h3 className="font-semibold text-gray-900 mb-2">ヒアリング</h3>
              <p className="text-sm text-gray-600">教室の規模や目的に合わせたプランをご提案</p>
            </div>

            <div className="relative">
              <div className="text-6xl font-bold text-gray-100 mb-4">03</div>
              <h3 className="font-semibold text-gray-900 mb-2">アカウント発行</h3>
              <p className="text-sm text-gray-600">専用URLとログイン情報をお渡しします</p>
            </div>

            <div className="relative">
              <div className="text-6xl font-bold text-gray-100 mb-4">04</div>
              <h3 className="font-semibold text-gray-900 mb-2">運用開始</h3>
              <p className="text-sm text-gray-600">導入後もサポートチームが継続的にフォロー</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-6">
            まずはお気軽に<br className="sm:hidden" />ご相談ください
          </h2>
          <p className="text-gray-600 mb-10">
            デモのご依頼や料金のご相談など、お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              お問い合わせフォーム
            </Link>
            <a
              href="tel:000-0000-0000"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-lg font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              お電話でのお問い合わせ
            </a>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="font-semibold text-lg text-gray-900">NOBISHIRO KIDS</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                子どもの運動能力を科学的に診断し、一人ひとりの「のびしろ」を見つけるシステム。
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">サービス</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-gray-900 transition-colors">機能紹介</a></li>
                <li><a href="#benefits" className="hover:text-gray-900 transition-colors">導入メリット</a></li>
                <li><a href="#flow" className="hover:text-gray-900 transition-colors">導入の流れ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">サポート</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/contact" className="hover:text-gray-900 transition-colors">導入のご相談</Link></li>
                <li><Link href="/admin/login" className="hover:text-gray-900 transition-colors">管理画面ログイン</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 NOBISHIRO KIDS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
