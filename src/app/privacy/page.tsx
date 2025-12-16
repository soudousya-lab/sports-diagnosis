import Link from 'next/link'

export const metadata = {
  title: 'プライバシーポリシー | NOBISHIRO KIDS',
  description: 'NOBISHIRO KIDSのプライバシーポリシー（個人情報保護方針）について'
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-semibold text-gray-900">NOBISHIRO KIDS</span>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
          <p className="text-gray-600 text-sm">最終更新日: 2024年12月16日</p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. はじめに</h2>
            <p className="text-gray-700 leading-relaxed">
              NOBISHIRO KIDS（以下「当サービス」）は、お客様の個人情報の保護を重要な責務と考え、
              個人情報の保護に関する法律（個人情報保護法）およびその他の関連法令を遵守し、
              以下のプライバシーポリシーに基づき個人情報を適切に取り扱います。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. 収集する個人情報</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              当サービスでは、以下の個人情報を収集することがあります。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>お子様の氏名、フリガナ</li>
              <li>お子様の生年月日、年齢、性別、学年</li>
              <li>お子様の身体測定データ（身長、体重）</li>
              <li>運動能力測定データ（握力、立ち幅跳び、ダッシュタイム等）</li>
              <li>保護者様のメールアドレス（お問い合わせ時）</li>
              <li>導入店舗・教室の担当者情報（氏名、メールアドレス、電話番号）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. 個人情報の利用目的</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              収集した個人情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>運動能力診断サービスの提供</li>
              <li>診断結果レポートの作成・出力</li>
              <li>お子様の成長記録の管理</li>
              <li>サービス品質向上のための統計分析（匿名化処理を行います）</li>
              <li>お問い合わせへの対応</li>
              <li>サービスに関するご案内</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. お子様の個人情報について</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスは、お子様の個人情報の取り扱いについて特に慎重を期しています。
              お子様の個人情報は、保護者様または導入店舗・教室の管理のもとでのみ登録され、
              診断サービスの提供以外の目的では使用いたしません。
              保護者様は、いつでもお子様の個人情報の開示・訂正・削除を請求することができます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. 個人情報の第三者提供</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスは、以下の場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. 個人情報の管理</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスは、個人情報の漏洩、滅失、毀損を防止するため、適切なセキュリティ対策を講じています。
              データはSSL/TLS暗号化通信により保護され、アクセス権限を適切に管理しています。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. 個人情報の保存期間</h2>
            <p className="text-gray-700 leading-relaxed">
              個人情報は、利用目的の達成に必要な期間保存します。
              サービスの解約後は、法令で定められた保存期間を経過した後、適切な方法で削除いたします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. 開示・訂正・削除の請求</h2>
            <p className="text-gray-700 leading-relaxed">
              お客様は、当サービスが保有する個人情報について、開示・訂正・利用停止・削除を請求することができます。
              請求される場合は、下記のお問い合わせ窓口までご連絡ください。
              本人確認の上、合理的な期間内に対応いたします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Cookieの使用</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスでは、ユーザー認証およびセッション管理のためにCookieを使用しています。
              Cookieを無効にした場合、サービスの一部機能がご利用いただけない場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. プライバシーポリシーの変更</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスは、法令の変更やサービス内容の変更に伴い、本プライバシーポリシーを変更することがあります。
              重要な変更がある場合は、サービス内でお知らせいたします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. お問い合わせ窓口</h2>
            <p className="text-gray-700 leading-relaxed">
              個人情報の取り扱いに関するお問い合わせは、以下の窓口までご連絡ください。
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                NOBISHIRO KIDS 運営事務局<br />
                メール: <Link href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</Link>
              </p>
            </div>
          </section>
        </div>

        {/* 戻るリンク */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-200 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; 2024 NOBISHIRO KIDS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
