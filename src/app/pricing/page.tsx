'use client'

import Link from 'next/link'
import {
  HiOutlineCheck,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlinePrinter,
  HiOutlineSupport,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi'

export default function PricingPage() {
  const features = [
    { icon: HiOutlineChartBar, text: '7項目運動能力診断' },
    { icon: HiOutlineUserGroup, text: '運動タイプ診断（8タイプ）' },
    { icon: HiOutlineClipboardList, text: 'トレーニング提案' },
    { icon: HiOutlinePrinter, text: 'レポート出力（PDF）' },
    { icon: HiOutlineOfficeBuilding, text: 'マルチ店舗対応' },
    { icon: HiOutlineSupport, text: '導入サポート' },
  ]

  const faqs = [
    { q: '最低契約期間はありますか？', a: '最低契約期間は6ヶ月となります。7ヶ月目以降は1ヶ月単位でのご契約が可能です。' },
    { q: '支払い方法は何がありますか？', a: 'クレジットカード払い、銀行振込に対応しております。月払いまたは年払いをお選びいただけます。' },
    { q: '途中で解約できますか？', a: '最低契約期間終了後は、いつでも解約可能です。解約の1ヶ月前までにご連絡ください。' },
    { q: '複数店舗の場合、追加料金はかかりますか？', a: '基本プランで最大3店舗までご利用いただけます。4店舗以上は別途ご相談ください。' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm md:text-base">N</span>
              </div>
              <span className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 tracking-tight">NOBISHIRO KIDS</span>
            </Link>
            <Link href="/" className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← トップに戻る
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ヒーローセクション */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-blue-600 font-medium text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">Pricing</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6">
              シンプルな料金体系
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              初期費用と月額費用のみ。隠れた追加費用はありません。<br className="hidden sm:block" />
              すべての機能をご利用いただけます。
            </p>
          </div>
        </section>

        {/* 料金カード */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-blue-600 shadow-xl shadow-blue-600/10 overflow-hidden">
              {/* カードヘッダー */}
              <div className="bg-blue-600 px-6 sm:px-8 py-4 sm:py-6 text-center">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs sm:text-sm font-medium rounded-full mb-2">
                  スタンダードプラン
                </span>
                <h2 className="text-white text-lg sm:text-xl font-semibold">すべての機能が使い放題</h2>
              </div>

              <div className="p-6 sm:p-8 md:p-12">
                {/* 料金表示 */}
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
                  {/* 初期費用 */}
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center">
                    <p className="text-gray-500 text-xs sm:text-sm mb-2">初期導入費用</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">5</span>
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">万</span>
                      <span className="text-lg sm:text-xl text-gray-600">円</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">税別</p>
                  </div>

                  {/* 月額費用 */}
                  <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center border-2 border-blue-200">
                    <p className="text-blue-600 text-xs sm:text-sm font-medium mb-2">月額費用</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600">5,000</span>
                      <span className="text-lg sm:text-xl text-blue-600">円</span>
                    </div>
                    <p className="text-xs text-blue-400 mt-2">税別 / 月</p>
                  </div>
                </div>

                {/* 含まれる機能 */}
                <div className="mb-8 sm:mb-12">
                  <h3 className="text-center text-gray-900 font-semibold mb-6 text-sm sm:text-base">含まれる機能</h3>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 追加サービス */}
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                    <HiOutlineCheck className="w-5 h-5 text-green-500" />
                    追加費用なしで含まれるサービス
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <HiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      導入時のオンラインサポート
                    </li>
                    <li className="flex items-center gap-2">
                      <HiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      操作マニュアル提供
                    </li>
                    <li className="flex items-center gap-2">
                      <HiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      メールサポート（平日対応）
                    </li>
                    <li className="flex items-center gap-2">
                      <HiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      システムアップデート
                    </li>
                    <li className="flex items-center gap-2">
                      <HiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      データバックアップ
                    </li>
                    <li className="flex items-center gap-2">
                      <HiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      セキュリティ対策
                    </li>
                  </ul>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-8 sm:px-12 py-4 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    お問い合わせ・お申し込み
                  </Link>
                  <p className="text-xs text-gray-500 mt-4">
                    まずはお気軽にご相談ください
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <HiOutlineQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <span className="text-blue-600 font-medium text-xs sm:text-sm tracking-widest uppercase">FAQ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">料金に関するよくある質問</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {faqs.map((item, index) => (
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

        {/* CTA */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4 sm:mb-6">
              導入をご検討ですか？
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
              料金やご利用方法など、お気軽にお問い合わせください。<br className="hidden sm:block" />
              専任スタッフが丁寧にご説明いたします。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-blue-700 transition-colors"
              >
                お問い合わせフォーム
              </Link>
              <a
                href="tel:000-0000-0000"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white rounded-lg font-medium text-sm sm:text-base border border-gray-700 hover:bg-white/5 transition-colors"
              >
                <HiOutlinePhone className="w-4 h-4 mr-2" />
                お電話での相談
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-100 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; 2025 NOBISHIRO KIDS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
