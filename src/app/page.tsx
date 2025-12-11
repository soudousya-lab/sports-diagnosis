'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getGradeDisplay } from '@/lib/diagnosis'

type MeasurementWithChild = {
  id: string
  measured_at: string
  mode: 'simple' | 'detail'
  children: {
    id: string
    name: string
    furigana: string | null
    grade: string
    gender: 'male' | 'female'
  }
  results: {
    motor_age: number
    type_name: string
    class_level: string
  }[]
}

export default function Home() {
  const [measurements, setMeasurements] = useState<MeasurementWithChild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMeasurements() {
      const { data, error } = await supabase
        .from('measurements')
        .select(`
          id,
          measured_at,
          mode,
          children (
            id,
            name,
            furigana,
            grade,
            gender
          ),
          results (
            motor_age,
            type_name,
            class_level
          )
        `)
        .order('measured_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setMeasurements(data as unknown as MeasurementWithChild[])
      }
      setLoading(false)
    }

    fetchMeasurements()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-wider">
            運動能力診断システム
          </h1>
          <p className="text-blue-200 text-lg">
            Athletic Performance Assessment System
          </p>
        </div>

        {/* 新規測定ボタン */}
        <div className="mb-8">
          <Link
            href="/new"
            className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            + 新規測定を開始する
          </Link>
        </div>

        {/* 測定者一覧 */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-900 text-white px-6 py-4">
            <h2 className="text-xl font-bold">測定履歴</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">測定データがありません</p>
              <Link
                href="/new"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                最初の測定を開始する
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {measurements.map(measurement => {
                const child = measurement.children
                const result = measurement.results?.[0]
                const measuredDate = new Date(measurement.measured_at).toLocaleDateString('ja-JP')

                return (
                  <Link
                    key={measurement.id}
                    href={`/result/${measurement.id}`}
                    className="block p-4 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* アイコン */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        child?.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {child?.name?.charAt(0) || '?'}
                      </div>

                      {/* 情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 truncate">
                            {child?.name || '不明'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {child?.furigana}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{child ? getGradeDisplay(child.grade) : ''}</span>
                          <span>•</span>
                          <span>{child?.gender === 'male' ? '男子' : '女子'}</span>
                          <span>•</span>
                          <span>{measuredDate}</span>
                        </div>
                      </div>

                      {/* 測定タイプ */}
                      <div className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          measurement.mode === 'detail'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {measurement.mode === 'detail' ? '7項目' : '3項目'}
                        </span>
                      </div>

                      {/* 結果サマリー */}
                      {result && (
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold text-blue-900">
                            運動器年齢: {Math.round(result.motor_age)}歳
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.type_name}
                          </div>
                        </div>
                      )}

                      {/* 矢印 */}
                      <div className="text-gray-400">
                        →
                      </div>
                    </div>
                  </Link>
                )
              })}
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
