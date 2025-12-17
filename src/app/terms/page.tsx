import Link from 'next/link'

export const metadata = {
  title: '利用規約 | NOBISHIRO KIDS',
  description: 'NOBISHIRO KIDSのサービス利用規約について'
}

export default function TermsPage() {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
          <p className="text-gray-600 text-sm">最終更新日: 2025年1月1日</p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第1条（適用）</h2>
            <p className="text-gray-700 leading-relaxed">
              本利用規約（以下「本規約」）は、NOBISHIRO KIDS（以下「当サービス」）が提供する
              運動能力診断サービスの利用に関する条件を定めるものです。
              ご利用者様（以下「ユーザー」）は、本規約に同意の上、当サービスをご利用ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第2条（定義）</h2>
            <p className="text-gray-700 leading-relaxed mb-3">本規約において、以下の用語は以下の意味で使用します。</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>「導入店舗」：当サービスを導入したスポーツ教室、体操教室等の事業者</li>
              <li>「管理者」：導入店舗において当サービスを管理・運用する担当者</li>
              <li>「被測定者」：運動能力診断を受けるお子様</li>
              <li>「保護者」：被測定者の親権者または法定代理人</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第3条（サービス内容）</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              当サービスは、以下の機能を提供します。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>運動能力測定データの入力・管理</li>
              <li>運動能力の診断・分析</li>
              <li>運動タイプの判定</li>
              <li>診断結果レポートの出力</li>
              <li>その他付随するサービス</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第4条（利用登録）</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>当サービスの利用を希望する導入店舗は、当社所定の方法により利用登録を行うものとします。</li>
              <li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>虚偽の事項を届け出た場合</li>
                  <li>本規約に違反したことがある者からの申請である場合</li>
                  <li>その他、当社が利用登録を相当でないと判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第5条（アカウント管理）</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>ユーザーは、自己の責任においてアカウント情報（メールアドレス、パスワード）を適切に管理するものとします。</li>
              <li>ユーザーは、いかなる場合にもアカウント情報を第三者に譲渡または貸与することはできません。</li>
              <li>アカウント情報の管理不十分、第三者の不正使用等によって生じた損害に関する責任は、ユーザーが負うものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第6条（被測定者の情報登録）</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>導入店舗は、被測定者の個人情報を登録する前に、保護者から適切な同意を得るものとします。</li>
              <li>登録された被測定者の情報は、運動能力診断の目的にのみ使用されます。</li>
              <li>保護者は、いつでも被測定者の情報の開示・訂正・削除を請求することができます。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第7条（禁止事項）</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当サービスのサーバーまたはネットワークに過度な負荷をかける行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>他のユーザーに関する個人情報を収集または蓄積する行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>当サービスを不正に利用する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第8条（診断結果の利用）</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>当サービスが提供する診断結果は、参考情報として提供されるものであり、医学的・専門的な判断を代替するものではありません。</li>
              <li>診断結果に基づく指導・トレーニングの実施は、導入店舗の責任において行うものとします。</li>
              <li>診断結果の解釈や活用方法について不明点がある場合は、専門家にご相談ください。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第9条（サービスの変更・中断・終了）</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>当社は、ユーザーへの事前通知なく、当サービスの内容を変更することができます。</li>
              <li>当社は、以下の場合には、ユーザーへの事前通知なく、当サービスの提供を一時中断することができます。
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>システムのメンテナンスを行う場合</li>
                  <li>地震、落雷、火災等の不可抗力により提供が困難となった場合</li>
                  <li>その他、当社が中断を必要と判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第10条（免責事項）</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>当社は、当サービスに起因してユーザーに生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。</li>
              <li>当社は、当サービスの正確性、完全性、有用性等について、いかなる保証も行いません。</li>
              <li>当サービスの利用により、ユーザー間または第三者との間で紛争が生じた場合、ユーザーは自己の責任と費用で解決するものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第11条（利用料金）</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスの利用料金は、別途定める料金表に従います。
              料金の変更がある場合は、事前にユーザーに通知いたします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第12条（知的財産権）</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスに関する著作権、商標権その他の知的財産権は、すべて当社または正当な権利者に帰属します。
              ユーザーは、当サービスを通じて提供されるコンテンツを、当社の事前の承諾なく複製、転載、改変、販売等することはできません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第13条（規約の変更）</h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができます。
              変更後の規約は、当サービス上に掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第14条（準拠法・管轄裁判所）</h2>
            <p className="text-gray-700 leading-relaxed">
              本規約の解釈にあたっては、日本法を準拠法とします。
              当サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第15条（お問い合わせ）</h2>
            <p className="text-gray-700 leading-relaxed">
              本規約に関するお問い合わせは、以下の窓口までご連絡ください。
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
          <p>&copy; 2025 NOBISHIRO KIDS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
