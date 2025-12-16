'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, createClientComponentClient } from '@/lib/supabase'
import { getGradeDisplay } from '@/lib/diagnosis'
import { FaSignOutAlt, FaCog, FaSearch, FaHistory, FaTimes } from 'react-icons/fa'

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
    scores?: Record<string, number>
  }[]
}

// 同じ子どもの測定をグループ化した型
type ChildMeasurementGroup = {
  childKey: string // name + furigana でグループ化
  name: string
  furigana: string | null
  gender: 'male' | 'female'
  measurements: MeasurementWithChild[]
}

export default function StorePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const supabase = useMemo(() => createClientComponentClient(), [])

  const [store, setStore] = useState<Store | null>(null)
  const [measurements, setMeasurements] = useState<MeasurementWithChild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // 店舗データと測定データの取得
  useEffect(() => {
    let isMounted = true

    // タイムアウト設定（10秒で強制終了）
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.log('[StorePage] Data fetch timeout - proceeding without data')
        setLoading(false)
        setError('データの取得がタイムアウトしました。ページを再読み込みしてください。')
      }
    }, 10000)

    async function fetchData() {
      try {
        // 店舗データ取得
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .single()

        if (!isMounted) return
        if (storeError) throw new Error('店舗が見つかりません')
        setStore(storeData)

        // この店舗の測定データを取得（最大200件）
        const { data: measurementData, error: measurementError } = await supabase
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
              class_level,
              scores
            )
          `)
          .eq('store_id', storeData.id)
          .order('measured_at', { ascending: false })
          .limit(200)

        if (!isMounted) return
        if (!measurementError && measurementData) {
          setMeasurements(measurementData as unknown as MeasurementWithChild[])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'エラーが発生しました')
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId)
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [slug, supabase])

  // 結果ページへ遷移
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
      const { data: measurement, error: fetchError } = await supabase
        .from('measurements')
        .select('child_id')
        .eq('id', deleteTarget.id)
        .single()

      if (fetchError) throw fetchError

      const childId = measurement?.child_id

      // 1. 結果を削除
      await supabase
        .from('results')
        .delete()
        .eq('measurement_id', deleteTarget.id)

      // 2. 測定データを削除
      const { error: measurementError } = await supabase
        .from('measurements')
        .delete()
        .eq('id', deleteTarget.id)

      if (measurementError) throw measurementError

      // 3. 子供データも削除
      if (childId) {
        await supabase
          .from('children')
          .delete()
          .eq('id', childId)
      }

      setMeasurements(prev => prev.filter(m => m.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
    setIsDeleting(false)
  }

  // 検索とグループ化のロジック
  const filteredAndGroupedMeasurements = useMemo(() => {
    // 検索フィルター
    const query = searchQuery.toLowerCase().trim()
    const filtered = query
      ? measurements.filter(m => {
          const child = m.children
          if (!child) return false
          return (
            child.name.toLowerCase().includes(query) ||
            (child.furigana?.toLowerCase().includes(query) ?? false)
          )
        })
      : measurements

    // 同じ子ども（名前+フリガナ）でグループ化
    const groups = new Map<string, ChildMeasurementGroup>()

    filtered.forEach(m => {
      const child = m.children
      if (!child) return

      const key = `${child.name}_${child.furigana || ''}`

      if (!groups.has(key)) {
        groups.set(key, {
          childKey: key,
          name: child.name,
          furigana: child.furigana,
          gender: child.gender,
          measurements: []
        })
      }

      const group = groups.get(key)!
      // 最大5回分まで保持
      if (group.measurements.length < 5) {
        group.measurements.push(m)
      }
    })

    // グループを最新の測定日でソート
    return Array.from(groups.values()).sort((a, b) => {
      const dateA = new Date(a.measurements[0]?.measured_at || 0)
      const dateB = new Date(b.measurements[0]?.measured_at || 0)
      return dateB.getTime() - dateA.getTime()
    })
  }, [measurements, searchQuery])

  // グループの展開/折りたたみ
  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-600">{error || '店舗が見つかりません'}</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace(`/store/${slug}/login`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 管理画面・ログアウトボタン */}
        <div className="flex justify-end gap-2 mb-4">
          <Link
            href={`/store/${slug}/admin`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
          >
            <FaCog /> 管理画面
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
          >
            <FaSignOutAlt /> ログアウト
          </button>
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-0.5 bg-white/20 text-white rounded">NOBISHIRO KIDS</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-4 tracking-wider">
            運動能力診断システム
          </h1>
          <p className="text-blue-200 text-sm xs:text-base sm:text-lg">
            {store.name}
          </p>
        </div>

        {/* 新規測定ボタン */}
        <div className="mb-8">
          <Link
            href={`/store/${slug}/new`}
            className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            + 新規測定を開始する
          </Link>
        </div>

        {/* 測定者一覧 */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-900 text-white px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-bold">測定履歴</h2>
              {/* 検索バー */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="text"
                  placeholder="名前で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 py-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm w-full sm:w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>

          {measurements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">測定データがありません</p>
              <Link
                href={`/store/${slug}/new`}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                最初の測定を開始する
              </Link>
            </div>
          ) : filteredAndGroupedMeasurements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">「{searchQuery}」に一致する結果がありません</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:underline text-sm"
              >
                検索をクリア
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndGroupedMeasurements.map(group => {
                const latestMeasurement = group.measurements[0]
                const latestChild = latestMeasurement.children
                const latestResult = latestMeasurement.results?.[0]
                const hasMultiple = group.measurements.length > 1
                const isExpanded = expandedGroups.has(group.childKey)

                return (
                  <div key={group.childKey} className="bg-white">
                    {/* メイン行（最新の測定） */}
                    <div className="p-4 hover:bg-blue-50 transition-all">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
                        <div className="flex items-center gap-3 xs:gap-4 flex-1 min-w-0">
                          {/* 履歴展開ボタン */}
                          {hasMultiple ? (
                            <button
                              onClick={() => toggleGroup(group.childKey)}
                              className={`w-10 h-10 xs:w-12 xs:h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 relative ${
                                group.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                              }`}
                            >
                              {group.name.charAt(0)}
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] border-2 border-white">
                                {group.measurements.length}
                              </span>
                            </button>
                          ) : (
                            <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                              group.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                            }`}>
                              {group.name.charAt(0)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-gray-900 truncate text-sm xs:text-base">
                                {group.name}
                              </span>
                              <span className="text-xs text-gray-500 hidden xs:inline">
                                {group.furigana}
                              </span>
                              {hasMultiple && (
                                <button
                                  onClick={() => toggleGroup(group.childKey)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded hover:bg-orange-200 transition-colors"
                                >
                                  <FaHistory className="text-[8px]" />
                                  {isExpanded ? '履歴を閉じる' : `過去${group.measurements.length - 1}回の履歴`}
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 xs:gap-3 text-xs xs:text-sm text-gray-600 flex-wrap">
                              <span>{latestChild ? getGradeDisplay(latestChild.grade) : ''}</span>
                              <span>•</span>
                              <span>{group.gender === 'male' ? '男子' : '女子'}</span>
                              <span className="hidden xs:inline">•</span>
                              <span className="hidden xs:inline">
                                {new Date(latestMeasurement.measured_at).toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                          </div>

                          {latestResult && (
                            <div className="text-right hidden sm:block flex-shrink-0">
                              <div className="text-sm font-bold text-blue-900">
                                運動器年齢: {Math.round(latestResult.motor_age)}歳
                              </div>
                              <div className="text-xs text-gray-500">
                                {latestResult.type_name}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1.5 xs:gap-2 flex-wrap justify-start xs:justify-end">
                          <button
                            onClick={() => handleViewResult(latestMeasurement.id, 'simple')}
                            className="px-2 xs:px-3 py-1.5 xs:py-2 bg-blue-600 text-white text-[10px] xs:text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
                          >
                            サマリー
                          </button>
                          <button
                            onClick={() => handleViewResult(latestMeasurement.id, 'detail')}
                            className="px-2 xs:px-3 py-1.5 xs:py-2 bg-green-600 text-white text-[10px] xs:text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                          >
                            詳細
                          </button>
                          <button
                            onClick={() => handleEdit(latestMeasurement.id)}
                            className="px-2 xs:px-3 py-1.5 xs:py-2 bg-yellow-500 text-white text-[10px] xs:text-xs font-bold rounded-lg hover:bg-yellow-600 transition-all"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: latestMeasurement.id, name: group.name })}
                            className="px-2 xs:px-3 py-1.5 xs:py-2 bg-red-500 text-white text-[10px] xs:text-xs font-bold rounded-lg hover:bg-red-600 transition-all"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 過去の測定履歴（展開時） */}
                    {isExpanded && hasMultiple && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        <div className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 flex items-center gap-2">
                          <FaHistory className="text-orange-500" />
                          過去の測定履歴（最新から最大5回分）
                        </div>
                        {group.measurements.slice(1).map((m, idx) => {
                          const child = m.children
                          const result = m.results?.[0]
                          const prevResult = group.measurements[idx]?.results?.[0]

                          // 運動器年齢の変化を計算
                          const ageDiff = result && prevResult
                            ? result.motor_age - prevResult.motor_age
                            : null

                          return (
                            <div
                              key={m.id}
                              className="p-3 pl-16 border-t border-gray-200 hover:bg-gray-100 transition-all"
                            >
                              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap text-sm">
                                    <span className="text-gray-600">
                                      {new Date(m.measured_at).toLocaleDateString('ja-JP')}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-600">
                                      {child ? getGradeDisplay(child.grade) : ''}
                                    </span>
                                    {result && (
                                      <>
                                        <span className="text-gray-400">•</span>
                                        <span className="font-bold text-blue-900">
                                          運動器年齢: {Math.round(result.motor_age)}歳
                                        </span>
                                        {ageDiff !== null && (
                                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                                            ageDiff > 0 ? 'bg-red-100 text-red-700' : ageDiff < 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                          }`}>
                                            {ageDiff > 0 ? `+${ageDiff.toFixed(1)}` : ageDiff.toFixed(1)}
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleViewResult(m.id, 'simple')}
                                    className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded hover:bg-blue-600 transition-all"
                                  >
                                    サマリー
                                  </button>
                                  <button
                                    onClick={() => handleViewResult(m.id, 'detail')}
                                    className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded hover:bg-green-600 transition-all"
                                  >
                                    詳細
                                  </button>
                                  <button
                                    onClick={() => handleEdit(m.id)}
                                    className="px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded hover:bg-yellow-600 transition-all"
                                  >
                                    編集
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget({ id: m.id, name: group.name })}
                                    className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600 transition-all"
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
                )
              })}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="text-center mt-8 text-blue-200 text-sm">
          © 2024 NOBISHIRO KIDS
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
