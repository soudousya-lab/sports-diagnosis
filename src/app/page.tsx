'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Store } from '@/lib/supabase'

export default function Home() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStores() {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name')

      if (!error && data) {
        setStores(data)
      }
      setLoading(false)
    }

    fetchStores()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-wider">
            運動能力診断システム
          </h1>
          <p className="text-blue-200 text-lg">
            Athletic Performance Assessment System
          </p>
        </div>

        {/* 説明 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            子どもの運動能力を科学的に診断
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            本システムは、年中〜小学6年生を対象とした運動能力診断システムです。
            7項目の測定を通じて、お子様の運動器年齢、運動タイプ、適性スポーツなどを
            科学的なデータに基づいて診断します。
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">📊 簡易版（イベント用）</h3>
              <p className="text-sm text-gray-600">
                3項目測定で運動器年齢と運動タイプを診断。
                測定会やイベントでの活用に最適です。
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-900 mb-2">📋 詳細版（店舗用）</h3>
              <p className="text-sm text-gray-600">
                7項目のフル測定で詳細なレポートを生成。
                適性スポーツ、トレーニング提案まで診断。
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>監修:</strong> 保健体育科教員免許保持者<br />
              <strong>対象年齢:</strong> 年中〜小学6年生
            </p>
          </div>
        </div>

        {/* 店舗一覧 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-blue-900 mb-6">
            🏢 診断可能な店舗
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              店舗が登録されていません
            </div>
          ) : (
            <div className="grid gap-4">
              {stores.map(store => (
                <Link
                  key={store.id}
                  href={`/store/${store.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: store.theme_color }}
                    >
                      {store.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900">{store.name}</h3>
                      {store.address && (
                        <p className="text-sm text-gray-500">{store.address}</p>
                      )}
                    </div>
                    <div className="text-blue-600 text-sm font-medium">
                      診断を開始 →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="text-center mt-8 text-blue-200 text-sm">
          © 2024 運動能力診断システム
        </div>
      </div>
    </div>
  )
}
