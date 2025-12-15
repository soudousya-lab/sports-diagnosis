'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [currentScreen, setCurrentScreen] = useState(0)

  const testimonials = [
    {
      name: '山田様',
      role: 'スポーツ教室 代表',
      content: '保護者への説明が数値で示せるようになり、満足度が大幅にアップしました。入会率も20%向上しています。',
    },
    {
      name: '鈴木様',
      role: '体操教室 オーナー',
      content: 'イベントでの診断会が大好評。新規会員獲得の強力なツールになっています。',
    },
    {
      name: '田中様',
      role: 'キッズスクール 指導者',
      content: '子どもたちの成長を可視化できるので、モチベーション維持に役立っています。',
    },
  ]

  const screens = [
    { title: '測定入力', desc: '7項目を簡単入力' },
    { title: '診断結果', desc: 'レーダーチャートで可視化' },
    { title: 'タイプ診断', desc: '8つの運動タイプ' },
  ]

  // 自動スライド
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % screens.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [screens.length])

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            {/* ロゴ */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm md:text-base">N</span>
              </div>
              <span className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 tracking-tight">NOBISHIRO KIDS</span>
            </Link>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-10">
              <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">機能</a>
              <a href="#demo" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">デモ</a>
              <a href="#benefits" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">導入メリット</a>
              <a href="#voice" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">導入事例</a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">よくある質問</a>
              <Link href="/contact" className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors">
                お問い合わせ
              </Link>
            </nav>

            {/* モバイルメニューボタン */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-5 h-4 sm:w-6 sm:h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-gray-900 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5 sm:translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 bg-gray-900 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-gray-900 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5 sm:-translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className={`md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
          <div className="px-4 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-blue-600 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>機能</a>
            <a href="#demo" className="block text-gray-600 hover:text-blue-600 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>デモ</a>
            <a href="#benefits" className="block text-gray-600 hover:text-blue-600 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>導入メリット</a>
            <a href="#voice" className="block text-gray-600 hover:text-blue-600 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>導入事例</a>
            <a href="#faq" className="block text-gray-600 hover:text-blue-600 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>よくある質問</a>
            <Link href="/contact" className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm">
              お問い合わせ
            </Link>
          </div>
        </div>
      </header>

      {/* ファーストビュー */}
      <section className="relative min-h-screen flex items-center pt-14 sm:pt-16 md:pt-20 overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                スポーツ教室向け診断システム
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] mb-4 sm:mb-6 md:mb-8 tracking-tight">
                子どもの<br />
                <span className="text-blue-600">のびしろ</span>を<br />
                見つける
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0">
                NOBISHIRO KIDSは、子どもの運動能力を科学的に診断し、
                一人ひとりに最適なトレーニングプランを提案。
                保護者への説明や集客ツールとしても活用できます。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  無料で相談する
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 rounded-lg font-medium text-sm sm:text-base border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  管理画面ログイン
                </Link>
              </div>

              {/* 実績バッジ */}
              <div className="mt-8 sm:mt-10 md:mt-12 flex items-center gap-4 sm:gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      {['山', '鈴', '田', '佐'][i-1]}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-xs sm:text-sm text-gray-500">全国で導入中</div>
                  <div className="text-sm sm:text-base font-semibold text-gray-900">50+ 教室が活用</div>
                </div>
              </div>
            </div>

            {/* スマホモック */}
            <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative">
                {/* スマホフレーム */}
                <div className="relative w-[220px] sm:w-[260px] md:w-[280px] h-[440px] sm:h-[520px] md:h-[560px] bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] p-2 shadow-2xl">
                  {/* ノッチ */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-6 sm:h-7 bg-gray-900 rounded-b-2xl z-10" />

                  {/* 画面 */}
                  <div className="w-full h-full bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative">
                    {/* アプリヘッダー */}
                    <div className="bg-blue-600 text-white px-3 sm:px-4 py-3 sm:py-4 pt-6 sm:pt-8">
                      <div className="text-[10px] sm:text-xs opacity-80">NOBISHIRO KIDS</div>
                      <div className="text-sm sm:text-base font-bold">運動能力診断</div>
                    </div>

                    {/* 画面コンテンツ - スライド */}
                    <div className="p-3 sm:p-4 relative h-[calc(100%-60px)] sm:h-[calc(100%-70px)] overflow-hidden">
                      {screens.map((screen, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 p-3 sm:p-4 transition-all duration-500 ${
                            index === currentScreen
                              ? 'opacity-100 translate-x-0'
                              : index < currentScreen
                                ? 'opacity-0 -translate-x-full'
                                : 'opacity-0 translate-x-full'
                          }`}
                        >
                          {index === 0 && (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="text-xs sm:text-sm font-bold text-gray-900">{screen.title}</div>
                              <div className="space-y-1.5 sm:space-y-2">
                                {['握力', '立ち幅跳び', '15mダッシュ'].map((item, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 sm:p-2.5 bg-gray-50 rounded-lg">
                                    <span className="text-[10px] sm:text-xs text-gray-600">{item}</span>
                                    <span className="text-[10px] sm:text-xs font-bold text-blue-600">{[12.5, 145, 3.2][i]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {index === 1 && (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="text-xs sm:text-sm font-bold text-gray-900">{screen.title}</div>
                              {/* レーダーチャート風 */}
                              <div className="aspect-square max-w-[140px] sm:max-w-[160px] mx-auto relative">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                  <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                                  <polygon points="50,25 75,37 75,63 50,75 25,63 25,37" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                                  <polygon points="50,20 85,35 85,65 50,80 15,65 15,35" fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth="2"/>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-lg sm:text-xl font-bold text-blue-600">8.5</div>
                                    <div className="text-[8px] sm:text-[10px] text-gray-500">運動年齢</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {index === 2 && (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="text-xs sm:text-sm font-bold text-gray-900">{screen.title}</div>
                              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-lg sm:text-xl">🏃</span>
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-gray-900">スピードスター型</div>
                                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">瞬発力が優れています</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* インジケーター */}
                      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5">
                        {screens.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentScreen(index)}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                              index === currentScreen ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 装飾 */}
                <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-16 sm:w-24 h-16 sm:h-24 bg-blue-100 rounded-full -z-10" />
                <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 w-12 sm:w-16 h-12 sm:h-16 bg-blue-50 rounded-full -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 導入実績 */}
      <section className="py-12 sm:py-16 md:py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">50<span className="text-lg sm:text-xl md:text-2xl text-blue-600">+</span></div>
              <div className="text-xs sm:text-sm text-gray-500">導入教室数</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">3,000<span className="text-lg sm:text-xl md:text-2xl text-blue-600">+</span></div>
              <div className="text-xs sm:text-sm text-gray-500">累計診断数</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">98<span className="text-lg sm:text-xl md:text-2xl text-blue-600">%</span></div>
              <div className="text-xs sm:text-sm text-gray-500">継続率</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">7</div>
              <div className="text-xs sm:text-sm text-gray-500">測定項目</div>
            </div>
          </div>
        </div>
      </section>

      {/* こんなお悩みありませんか？ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <p className="text-blue-600 font-medium text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">Problem</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">こんなお悩みありませんか？</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: '😓', title: '保護者への説明が難しい', desc: '子どもの成長を客観的に伝える方法がない' },
              { icon: '📉', title: '新規入会が伸び悩む', desc: '体験会後の入会率が低い' },
              { icon: '👨‍🏫', title: '指導の質にバラつき', desc: '指導者によって教え方が異なる' },
              { icon: '🔄', title: '継続率が上がらない', desc: '成長実感がなく退会してしまう' },
              { icon: '📊', title: 'データ管理が大変', desc: '紙での記録は管理が煩雑' },
              { icon: '⏰', title: '診断に時間がかかる', desc: '一人ひとり測定するのが大変' },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-gray-100 transition-colors">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm sm:text-base">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              NOBISHIRO KIDSが解決します
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8 sm:mb-12 md:mb-16">
            <p className="text-blue-600 font-medium text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">Features</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-4">6つの主要機能</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              子どもの運動能力を多角的に分析し、成長をサポートする機能を提供します。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: '📊', title: '7項目運動能力診断', desc: '握力、立ち幅跳び、15mダッシュなど7つの測定項目から総合的に分析', color: 'blue' },
              { icon: '🎯', title: '運動タイプ診断', desc: 'お子様の運動特性を8つのタイプに分類。向いているスポーツを提案', color: 'indigo' },
              { icon: '📝', title: 'トレーニング提案', desc: '診断結果に基づき、弱点を補強するトレーニングメニューを自動提案', color: 'violet' },
              { icon: '⏱️', title: '運動年齢算出', desc: '実年齢と比較した「運動年齢」でお子様の発達状況を可視化', color: 'purple' },
              { icon: '🖨️', title: 'レポート出力', desc: '保護者向けの診断レポートをワンクリックで出力。イベントにも活用', color: 'fuchsia' },
              { icon: '🏢', title: 'マルチ店舗対応', desc: '複数店舗のデータを一元管理。スタッフ権限管理も簡単', color: 'pink' },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-blue-100 transition-colors">
                  <span className="text-xl sm:text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* デモセクション */}
      <section id="demo" className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <p className="text-blue-600 font-medium text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">Demo</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-4">診断の流れ</h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              たった3ステップで診断完了。直感的な操作で誰でも簡単に使えます。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', title: '基本情報入力', desc: '名前、学年、性別を入力', time: '30秒' },
              { step: '02', title: '7項目の測定', desc: '運動能力を7つの観点で測定', time: '5〜10分' },
              { step: '03', title: '結果表示', desc: 'レーダーチャートと詳細分析', time: '即時' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-100 mb-2 sm:mb-4">{item.step}</div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">{item.desc}</p>
                  <div className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.time}
                  </div>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 導入メリット */}
      <section id="benefits" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8 sm:mb-12 md:mb-16">
            <p className="text-blue-400 font-medium text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">Benefits</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-4">導入メリット</h2>
            <p className="text-gray-400 text-sm sm:text-base">
              NOBISHIRO KIDSの導入で、教室運営の質と効率が向上します。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {[
              { num: '01', title: '保護者満足度の向上', desc: '数値データに基づく客観的な診断結果で、お子様の成長を可視化。説得力のあるフィードバックが可能に。', stat: '+35%', statLabel: '満足度向上' },
              { num: '02', title: '新規入会率アップ', desc: '無料診断イベントを開催することで、新規顧客の獲得に。データを活用した入会促進が可能です。', stat: '+20%', statLabel: '入会率向上' },
              { num: '03', title: '指導の質の標準化', desc: '診断結果に基づくトレーニング提案で、指導者の経験に依存しない質の高い指導を実現します。', stat: '一貫した', statLabel: '指導品質' },
              { num: '04', title: '継続率の向上', desc: '定期的な診断で成長を実感。目標設定と達成感により、長期的な通学継続につながります。', stat: '+15%', statLabel: '継続率向上' },
            ].map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-sm sm:text-lg font-bold">{item.num}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3 sm:mb-4">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-blue-400">{item.stat}</span>
                      <span className="text-xs text-gray-500">{item.statLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 導入事例 */}
      <section id="voice" className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <p className="text-blue-600 font-medium text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">Voice</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-4">導入事例</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              実際にご利用いただいているお客様の声をご紹介します。
            </p>
          </div>

          {/* スワイプ可能なカルーセル */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((item, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2 sm:px-4">
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-2xl mx-auto">
                    <div className="flex items-center gap-1 mb-3 sm:mb-4">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                      「{item.content}」
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm sm:text-base font-bold text-gray-600">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{item.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* インジケーター */}
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <p className="text-blue-600 font-medium text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">FAQ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-4">よくある質問</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              { q: '導入にはどのくらいの期間がかかりますか？', a: 'お申し込みから最短1週間で導入可能です。アカウント発行後、すぐにご利用いただけます。' },
              { q: '初期費用はかかりますか？', a: '初期費用は無料です。月額利用料のみでご利用いただけます。詳細はお問い合わせください。' },
              { q: '複数店舗での利用は可能ですか？', a: 'はい、マルチ店舗対応しています。店舗ごとのデータ管理や権限設定も可能です。' },
              { q: 'スタッフへの研修は必要ですか？', a: '直感的な操作で使えるため、特別な研修は不要です。導入時のサポートも行っております。' },
              { q: 'データのバックアップはありますか？', a: 'クラウドで安全に管理しており、自動バックアップを行っています。データ消失の心配はありません。' },
            ].map((item, index) => (
              <details key={index} className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between p-4 sm:p-5 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900 text-sm sm:text-base pr-4">{item.q}</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 導入の流れ */}
      <section id="flow" className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <p className="text-blue-600 font-medium text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">Flow</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-4">導入の流れ</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              お問い合わせから最短1週間で導入可能です。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { num: '01', title: 'お問い合わせ', desc: 'フォームまたはお電話で' },
              { num: '02', title: 'ヒアリング', desc: '最適なプランをご提案' },
              { num: '03', title: 'アカウント発行', desc: '専用URLをお渡し' },
              { num: '04', title: '運用開始', desc: 'サポートも充実' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-100 mb-2 sm:mb-4">{item.num}</div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 sm:mb-6">
            まずは無料で<br className="sm:hidden" />ご相談ください
          </h2>
          <p className="text-blue-100 mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base">
            デモのご依頼や料金のご相談など、お気軽にお問い合わせください。<br className="hidden sm:block" />
            専任スタッフが丁寧にご説明いたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-100 transition-colors"
            >
              お問い合わせフォーム
            </Link>
            <a
              href="tel:000-0000-0000"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white rounded-lg font-medium text-sm sm:text-base border-2 border-white/50 hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              お電話での相談
            </a>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-100 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">N</span>
                </div>
                <span className="font-semibold text-sm sm:text-base md:text-lg text-gray-900">NOBISHIRO KIDS</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm">
                子どもの運動能力を科学的に診断し、一人ひとりの「のびしろ」を見つけるシステム。
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">サービス</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-500">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">機能紹介</a></li>
                <li><a href="#benefits" className="hover:text-blue-600 transition-colors">導入メリット</a></li>
                <li><a href="#flow" className="hover:text-blue-600 transition-colors">導入の流れ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">サポート</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-500">
                <li><Link href="/contact" className="hover:text-blue-600 transition-colors">導入のご相談</Link></li>
                <li><Link href="/admin/login" className="hover:text-blue-600 transition-colors">管理画面ログイン</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2024 NOBISHIRO KIDS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
