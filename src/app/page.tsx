'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [measurements, setMeasurements] = useState<MeasurementWithChild[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // 結果ページへ遷移（URLパラメータでモードを指定）
  const handleViewResult = (measurementId: string, viewMode: 'simple' | 'detail') => {
    router.push(`/result/${measurementId}?mode=${viewMode}`)
  }

  // 編集ページへ遷移
  const handleEdit = (measurementId: string) => {
    router.push(`/edit/${measurementId}`)
  }

  // 削除処理
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      // 結果を削除
      await supabase.from('results').delete().eq('measurement_id', deleteTarget.id)
      // 測定データを削除
      const { data: measurement } = await supabase
        .from('measurements')
        .select('child_id')
        .eq('id', deleteTarget.id)
        .single()

      await supabase.from('measurements').delete().eq('id', deleteTarget.id)

      // 子供データも削除（この測定に紐づく子供のみ）
      if (measurement?.child_id) {
        await supabase.from('children').delete().eq('id', measurement.child_id)
      }

      // リストから削除
      setMeasurements(prev => prev.filter(m => m.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
    setIsDeleting(false)
  }

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
                const hasResult = !!result

                return (
                  <div
                    key={measurement.id}
                    className="p-4 hover:bg-blue-50 transition-all"
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
                          {/* 入力済みバッジ */}
                          <span className="inline-block px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                            入力済み
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

                      {/* 結果サマリー */}
                      {hasResult && (
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold text-blue-900">
                            運動器年齢: {Math.round(result.motor_age)}歳
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.type_name}
                          </div>
                        </div>
                      )}

                      {/* ボタン群 */}
                      <div className="flex gap-2 flex-wrap justify-end">
                        <button
                          onClick={() => handleViewResult(measurement.id, 'simple')}
                          className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
                        >
                          サマリー出力
                        </button>
                        <button
                          onClick={() => handleViewResult(measurement.id, 'detail')}
                          className="px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                        >
                          詳細出力
                        </button>
                        <button
                          onClick={() => handleEdit(measurement.id)}
                          className="px-3 py-2 bg-yellow-500 text-white text-xs font-bold rounded-lg hover:bg-yellow-600 transition-all"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: measurement.id, name: child?.name || '不明' })}
                          className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
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

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">削除の確認</h3>
            <p className="text-gray-600 mb-6">
              <span className="font-bold text-red-600">{deleteTarget.name}</span> さんの測定データを削除しますか？<br />
              <span className="text-sm text-red-500">※この操作は取り消せません</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
