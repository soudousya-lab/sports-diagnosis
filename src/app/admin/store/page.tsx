'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient, Child, GradeGenderDistribution } from '@/lib/supabase'
import {
  FaUsers, FaClipboardList, FaStore, FaChartBar,
  FaSignOutAlt, FaSpinner, FaChild, FaSearch,
  FaEye, FaCalendarAlt, FaPlus
} from 'react-icons/fa'

type ChildWithMeasurements = Child & {
  measurements: Array<{
    id: string
    measured_at: string
    mode: 'simple' | 'detail'
  }>
}

type StoreStats = {
  storeName: string
  childrenCount: number
  measurementsCount: number
  recentMeasurements: number
  gradeDistribution: GradeGenderDistribution[]
  children: ChildWithMeasurements[]
}

export default function StoreDashboard() {
  const { profile, signOut } = useAuth()
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'children'>('overview')

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (profile?.store_id) {
      fetchStoreData()
    }
  }, [profile])

  const fetchStoreData = async () => {
    if (!profile?.store_id) return

    setLoading(true)

    // 店舗情報と児童データを取得
    const [storeRes, childrenRes, measurementsRes, recentRes, gradeDistRes] = await Promise.all([
      supabase.from('stores').select('name').eq('id', profile.store_id).single(),
      supabase
        .from('children')
        .select(`
          *,
          measurements(id, measured_at, mode)
        `)
        .eq('store_id', profile.store_id)
        .order('created_at', { ascending: false }),
      supabase.from('measurements').select('id', { count: 'exact', head: true })
        .eq('store_id', profile.store_id),
      supabase.from('measurements').select('id', { count: 'exact', head: true })
        .eq('store_id', profile.store_id)
        .gte('measured_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      supabase.from('grade_gender_distribution').select('*')
        .eq('store_id', profile.store_id)
    ])

    setStats({
      storeName: storeRes.data?.name || '',
      childrenCount: childrenRes.data?.length || 0,
      measurementsCount: measurementsRes.count || 0,
      recentMeasurements: recentRes.count || 0,
      gradeDistribution: gradeDistRes.data || [],
      children: (childrenRes.data as ChildWithMeasurements[]) || []
    })

    setLoading(false)
  }

  // 検索フィルター
  const filteredChildren = stats?.children.filter(child => {
    const query = searchQuery.toLowerCase()
    return (
      child.name.toLowerCase().includes(query) ||
      (child.furigana?.toLowerCase() || '').includes(query) ||
      child.grade.includes(query)
    )
  }) || []

  // 学年分布集計
  const getGradeStats = () => {
    if (!stats?.gradeDistribution) return []
    const grades: Record<string, { male: number; female: number }> = {}
    stats.gradeDistribution.forEach(g => {
      if (!grades[g.grade]) grades[g.grade] = { male: 0, female: 0 }
      grades[g.grade][g.gender] += g.count
    })
    return Object.entries(grades).map(([grade, counts]) => ({
      grade,
      male: counts.male,
      female: counts.female,
      total: counts.male + counts.female
    }))
  }

  // 学年表示
  const getGradeDisplay = (grade: string) => {
    const gradeMap: Record<string, string> = {
      'k5': '年中',
      'k6': '年長',
      '1': '小1',
      '2': '小2',
      '3': '小3',
      '4': '小4',
      '5': '小5',
      '6': '小6'
    }
    return gradeMap[grade] || grade
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaStore className="text-green-200 text-2xl" />
            <div>
              <h1 className="text-xl font-bold">{stats?.storeName}</h1>
              <p className="text-green-200 text-xs">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            ログアウト
          </button>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'overview', label: '概要', icon: FaChartBar },
              { id: 'children', label: '児童一覧', icon: FaUsers },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600 font-bold'
                    : 'border-transparent text-gray-600 hover:text-green-600'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPIカード */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <FaChild className="text-green-500 text-xl" />
                  <span className="text-xs text-gray-500">登録児童数</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.childrenCount}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <FaClipboardList className="text-blue-500 text-xl" />
                  <span className="text-xs text-gray-500">総測定数</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.measurementsCount}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <FaCalendarAlt className="text-orange-500 text-xl" />
                  <span className="text-xs text-gray-500">直近30日</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.recentMeasurements}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <FaChartBar className="text-purple-500 text-xl" />
                  <span className="text-xs text-gray-500">測定率</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">
                  {stats?.childrenCount ? Math.round((stats.measurementsCount / stats.childrenCount) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* 新規診断ボタン */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">新規診断を開始</h3>
                  <p className="text-green-100 text-sm">新しい児童を登録して診断を実施します</p>
                </div>
                <Link
                  href="/new"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 font-bold rounded-lg hover:bg-green-50 transition-colors"
                >
                  <FaPlus />
                  新規診断
                </Link>
              </div>
            </div>

            {/* 学年・性別分布 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaUsers className="text-purple-500" />
                  学年・性別分布
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">学年</th>
                      <th className="text-right px-4 py-3">男子</th>
                      <th className="text-right px-4 py-3">女子</th>
                      <th className="text-right px-4 py-3">合計</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {getGradeStats().map(g => (
                      <tr key={g.grade} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{getGradeDisplay(g.grade)}</td>
                        <td className="px-4 py-3 text-right text-blue-600">{g.male}</td>
                        <td className="px-4 py-3 text-right text-pink-600">{g.female}</td>
                        <td className="px-4 py-3 text-right font-bold">{g.total}</td>
                      </tr>
                    ))}
                    {getGradeStats().length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'children' && (
          <div className="space-y-4">
            {/* 検索バー */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="名前・ふりがな・学年で検索..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* 児童一覧 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaChild className="text-green-500" />
                  登録児童一覧
                  <span className="text-sm font-normal text-gray-500">
                    （{filteredChildren.length}名）
                  </span>
                </h3>
                <Link
                  href="/new"
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaPlus />
                  新規登録
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">名前</th>
                      <th className="text-left px-4 py-3">ふりがな</th>
                      <th className="text-center px-4 py-3">学年</th>
                      <th className="text-center px-4 py-3">性別</th>
                      <th className="text-right px-4 py-3">測定回数</th>
                      <th className="text-left px-4 py-3">最終測定日</th>
                      <th className="text-center px-4 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredChildren.map(child => {
                      const latestMeasurement = child.measurements?.[0]
                      return (
                        <tr key={child.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{child.name}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">{child.furigana || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {getGradeDisplay(child.grade)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              child.gender === 'male'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-pink-100 text-pink-700'
                            }`}>
                              {child.gender === 'male' ? '男' : '女'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{child.measurements?.length || 0}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {latestMeasurement?.measured_at || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {latestMeasurement && (
                              <Link
                                href={`/result/${latestMeasurement.id}?mode=${latestMeasurement.mode}`}
                                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm"
                              >
                                <FaEye />
                                結果を見る
                              </Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {filteredChildren.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          {searchQuery ? '検索結果がありません' : '登録児童がいません'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
