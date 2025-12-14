'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient, StoreStatistics, GradeGenderDistribution, WeaknessStatistic, Partner } from '@/lib/supabase'
import {
  FaUsers, FaClipboardList, FaStore, FaHandshake, FaChartBar,
  FaSignOutAlt, FaSpinner, FaDownload, FaChartLine, FaChild,
  FaExclamationTriangle, FaCrown, FaTrophy, FaArrowUp, FaArrowDown
} from 'react-icons/fa'

type DashboardStats = {
  totalStores: number
  totalPartners: number
  totalChildren: number
  totalMeasurements: number
  recentMeasurements: number
  storeStats: StoreStatistics[]
  gradeDistribution: GradeGenderDistribution[]
  weaknessStats: WeaknessStatistic[]
  partners: Partner[]
}

export default function MasterDashboard() {
  const { profile, signOut } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'partners' | 'analysis'>('overview')

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)

    // 並列でデータ取得
    const [
      storesRes,
      partnersRes,
      childrenRes,
      measurementsRes,
      recentRes,
      storeStatsRes,
      gradeDistRes,
      weaknessRes
    ] = await Promise.all([
      supabase.from('stores').select('id', { count: 'exact', head: true }),
      supabase.from('partners').select('*'),
      supabase.from('children').select('id', { count: 'exact', head: true }),
      supabase.from('measurements').select('id', { count: 'exact', head: true }),
      supabase.from('measurements').select('id', { count: 'exact', head: true })
        .gte('measured_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      supabase.from('store_statistics').select('*'),
      supabase.from('grade_gender_distribution').select('*'),
      supabase.from('weakness_statistics').select('*')
    ])

    setStats({
      totalStores: storesRes.count || 0,
      totalPartners: partnersRes.data?.length || 0,
      totalChildren: childrenRes.count || 0,
      totalMeasurements: measurementsRes.count || 0,
      recentMeasurements: recentRes.count || 0,
      storeStats: storeStatsRes.data || [],
      gradeDistribution: gradeDistRes.data || [],
      weaknessStats: weaknessRes.data || [],
      partners: partnersRes.data || []
    })

    setLoading(false)
  }

  const handleExportCSV = async () => {
    // 全データをCSVエクスポート
    const { data: children } = await supabase
      .from('children')
      .select(`
        *,
        stores(name),
        measurements(
          *,
          results(*)
        )
      `)

    if (!children) return

    // CSV生成
    const headers = [
      '店舗名', '児童名', 'ふりがな', '学年', '性別', '身長', '体重',
      '測定日', '運動年齢', '年齢差', '運動タイプ', '弱点分野',
      '握力右', '握力左', '立ち幅跳び', '15mダッシュ'
    ]

    const rows = children.flatMap((child: Record<string, unknown>) => {
      const measurements = child.measurements as Record<string, unknown>[]
      if (!measurements || measurements.length === 0) {
        return [[
          (child.stores as { name: string })?.name || '',
          child.name,
          child.furigana || '',
          child.grade,
          child.gender === 'male' ? '男' : '女',
          child.height || '',
          child.weight || '',
          '', '', '', '', '', '', '', '', ''
        ]]
      }
      return measurements.map((m: Record<string, unknown>) => {
        const results = m.results as Record<string, unknown>[] | null
        const r = results?.[0]
        return [
          (child.stores as { name: string })?.name || '',
          child.name,
          child.furigana || '',
          child.grade,
          child.gender === 'male' ? '男' : '女',
          child.height || '',
          child.weight || '',
          m.measured_at,
          r?.motor_age || '',
          r?.motor_age_diff || '',
          r?.type_name || '',
          r?.weakness_class || '',
          m.grip_right || '',
          m.grip_left || '',
          m.jump || '',
          m.dash || ''
        ]
      })
    })

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `診断データ_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 弱点分野の集計
  const getWeaknessRanking = () => {
    if (!stats?.weaknessStats) return []
    const totals: Record<string, number> = {}
    stats.weaknessStats.forEach(w => {
      totals[w.weakness_class] = (totals[w.weakness_class] || 0) + w.count
    })
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }

  // 学年分布の集計
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
      <header className="bg-gradient-to-r from-purple-800 to-purple-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <div>
              <h1 className="text-xl font-bold">Master管理画面</h1>
              <p className="text-purple-200 text-xs">{profile?.email}</p>
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
              { id: 'stores', label: '店舗管理', icon: FaStore },
              { id: 'partners', label: 'パートナー', icon: FaHandshake },
              { id: 'analysis', label: '分析・インサイト', icon: FaChartLine },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 font-bold'
                    : 'border-transparent text-gray-600 hover:text-purple-600'
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <FaStore className="text-purple-500 text-xl" />
                  <span className="text-xs text-gray-500">店舗数</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalStores}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <FaHandshake className="text-blue-500 text-xl" />
                  <span className="text-xs text-gray-500">パートナー</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalPartners}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <FaChild className="text-green-500 text-xl" />
                  <span className="text-xs text-gray-500">登録児童</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalChildren}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <FaClipboardList className="text-orange-500 text-xl" />
                  <span className="text-xs text-gray-500">総測定数</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalMeasurements}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <FaArrowUp className="text-red-500 text-xl" />
                  <span className="text-xs text-gray-500">直近30日</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.recentMeasurements}</div>
              </div>
            </div>

            {/* CSVエクスポート */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">データエクスポート</h3>
                  <p className="text-sm text-gray-500">全店舗の診断データをCSV形式でダウンロード</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FaDownload />
                  CSVダウンロード
                </button>
              </div>
            </div>

            {/* 店舗別実績 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  店舗別実績ランキング
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">順位</th>
                      <th className="text-left px-4 py-3">店舗名</th>
                      <th className="text-left px-4 py-3">パートナー</th>
                      <th className="text-right px-4 py-3">登録児童</th>
                      <th className="text-right px-4 py-3">測定数</th>
                      <th className="text-left px-4 py-3">最終測定日</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats?.storeStats
                      .sort((a, b) => b.measurements_count - a.measurements_count)
                      .map((store, i) => (
                        <tr key={store.store_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {i < 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                                i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
                              }`}>
                                {i + 1}
                              </span>
                            ) : (
                              <span className="text-gray-500">{i + 1}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">{store.store_name}</td>
                          <td className="px-4 py-3 text-gray-500">{store.partner_name || '-'}</td>
                          <td className="px-4 py-3 text-right">{store.children_count}</td>
                          <td className="px-4 py-3 text-right font-bold text-purple-600">{store.measurements_count}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {store.last_measurement_date || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FaStore />
                店舗一覧
              </h3>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                + 新規店舗追加
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">店舗名</th>
                    <th className="text-left px-4 py-3">スラッグ</th>
                    <th className="text-left px-4 py-3">担当パートナー</th>
                    <th className="text-right px-4 py-3">児童数</th>
                    <th className="text-right px-4 py-3">測定数</th>
                    <th className="text-center px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats?.storeStats.map(store => (
                    <tr key={store.store_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{store.store_name}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm font-mono">{store.slug}</td>
                      <td className="px-4 py-3">{store.partner_name || '-'}</td>
                      <td className="px-4 py-3 text-right">{store.children_count}</td>
                      <td className="px-4 py-3 text-right">{store.measurements_count}</td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">編集</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FaHandshake />
                パートナー一覧
              </h3>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                + 新規パートナー追加
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">パートナー名</th>
                    <th className="text-left px-4 py-3">メール</th>
                    <th className="text-left px-4 py-3">電話</th>
                    <th className="text-right px-4 py-3">担当店舗数</th>
                    <th className="text-center px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats?.partners.map(partner => {
                    const storeCount = stats.storeStats.filter(s => s.partner_id === partner.id).length
                    return (
                      <tr key={partner.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{partner.name}</td>
                        <td className="px-4 py-3 text-gray-500">{partner.email || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{partner.phone || '-'}</td>
                        <td className="px-4 py-3 text-right">{storeCount}</td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">編集</button>
                        </td>
                      </tr>
                    )
                  })}
                  {(!stats?.partners || stats.partners.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        パートナーが登録されていません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* 弱点分野ランキング */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaExclamationTriangle className="text-orange-500" />
                  弱点分野ランキング（全体）
                </h3>
                <p className="text-sm text-gray-500 mt-1">多くの児童が苦手としている分野</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {getWeaknessRanking().map(([weakness, count], i) => (
                    <div key={weakness} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 font-medium">{weakness}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                          style={{ width: `${(count / (getWeaknessRanking()[0]?.[1] || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}人</span>
                    </div>
                  ))}
                  {getWeaknessRanking().length === 0 && (
                    <p className="text-center text-gray-500 py-4">データがありません</p>
                  )}
                </div>
              </div>
            </div>

            {/* 学年分布 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaUsers className="text-blue-500" />
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
                        <td className="px-4 py-3 font-medium">{g.grade}</td>
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
      </main>
    </div>
  )
}
