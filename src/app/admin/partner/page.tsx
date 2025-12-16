'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient, StoreStatistics, GradeGenderDistribution, MonthlyMeasurement } from '@/lib/supabase'
import {
  FaUsers, FaClipboardList, FaStore,
  FaSignOutAlt, FaSpinner, FaChartLine, FaChild,
  FaHandshake, FaCalendarAlt, FaDownload
} from 'react-icons/fa'

type DashboardStats = {
  stores: StoreStatistics[]
  gradeDistribution: GradeGenderDistribution[]
  monthlyData: MonthlyMeasurement[]
  totalChildren: number
  totalMeasurements: number
}

export default function PartnerDashboard() {
  const { profile, signOut } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (profile?.partner_id) {
      fetchDashboardData()
    }
  }, [profile])

  const fetchDashboardData = async () => {
    if (!profile?.partner_id) return

    setLoading(true)

    // パートナーに紐づく店舗のみ取得
    const { data: stores } = await supabase
      .from('store_statistics')
      .select('*')
      .eq('partner_id', profile.partner_id)

    const storeIds = stores?.map(s => s.store_id) || []

    // 担当店舗の統計情報を取得
    const [gradeDistRes, monthlyRes] = await Promise.all([
      supabase.from('grade_gender_distribution').select('*').in('store_id', storeIds),
      supabase.from('monthly_measurements').select('*').in('store_id', storeIds)
    ])

    const totalChildren = stores?.reduce((sum, s) => sum + s.children_count, 0) || 0
    const totalMeasurements = stores?.reduce((sum, s) => sum + s.measurements_count, 0) || 0

    setStats({
      stores: stores || [],
      gradeDistribution: gradeDistRes.data || [],
      monthlyData: monthlyRes.data || [],
      totalChildren,
      totalMeasurements
    })

    setLoading(false)
  }

  // 店舗ごとの学年分布を取得
  const getGradeStatsForStore = (storeId: string | null) => {
    if (!stats?.gradeDistribution) return []
    const filtered = storeId
      ? stats.gradeDistribution.filter(g => g.store_id === storeId)
      : stats.gradeDistribution

    const grades: Record<string, { male: number; female: number }> = {}
    filtered.forEach(g => {
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

  // 月別推移データ
  const getMonthlyStats = (storeId: string | null) => {
    if (!stats?.monthlyData) return []
    const filtered = storeId
      ? stats.monthlyData.filter(m => m.store_id === storeId)
      : stats.monthlyData

    // 月ごとに集計
    const monthly: Record<string, number> = {}
    filtered.forEach(m => {
      const month = m.month.substring(0, 7) // YYYY-MM形式
      monthly[month] = (monthly[month] || 0) + m.measurement_count
    })

    return Object.entries(monthly)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6) // 直近6ヶ月
      .map(([month, count]) => ({ month, count }))
  }

  // CSVエクスポート（パートナー担当店舗のデータのみ）
  const handleExportCSV = async () => {
    if (!profile?.partner_id) return

    try {
      // パートナーに紐づく店舗IDを取得
      const { data: stores } = await supabase
        .from('stores')
        .select('id, name')
        .eq('partner_id', profile.partner_id)

      if (!stores || stores.length === 0) {
        alert('担当店舗がありません')
        return
      }

      const storeIds = stores.map(s => s.id)
      const storeMap = Object.fromEntries(stores.map(s => [s.id, s.name]))

      // 担当店舗のデータを取得
      const { data: children, error } = await supabase
        .from('children')
        .select(`
          *,
          measurements (
            *,
            results (*)
          )
        `)
        .in('store_id', storeIds)

      if (error) {
        console.error('CSVエクスポートエラー:', error)
        alert('データの取得に失敗しました: ' + error.message)
        return
      }

      if (!children || children.length === 0) {
        alert('エクスポートするデータがありません')
        return
      }

      // CSV生成
      const headers = [
        '店舗名', '児童名', 'ふりがな', '学年', '性別', '身長', '体重',
        '測定日', '運動年齢', '年齢差', '運動タイプ', '弱点分野',
        '握力右', '握力左', '立ち幅跳び', '15mダッシュ',
        '連続立ち幅跳び', '30秒スクワット', '反復横跳び', 'ボール投げ'
      ]

      const gradeLabels: Record<string, string> = {
        'k5': '年長', '1': '小1', '2': '小2', '3': '小3', '4': '小4', '5': '小5', '6': '小6'
      }

      const rows = children.flatMap(child => {
        const measurements = child.measurements || []
        if (measurements.length === 0) {
          return [[
            storeMap[child.store_id] || '',
            child.name,
            child.furigana || '',
            gradeLabels[child.grade] || child.grade,
            child.gender === 'male' ? '男' : '女',
            child.height || '',
            child.weight || '',
            '', '', '', '', '', '', '', '', '', '', '', '', ''
          ]]
        }

        return measurements.map((m: Record<string, unknown>) => {
          const result = (m.results as Record<string, unknown>[] | null)?.[0] || {}
          return [
            storeMap[child.store_id] || '',
            child.name,
            child.furigana || '',
            gradeLabels[child.grade] || child.grade,
            child.gender === 'male' ? '男' : '女',
            child.height || '',
            child.weight || '',
            m.measured_at || '',
            result.motor_age || '',
            result.motor_age_diff || '',
            result.type_name || '',
            result.weakness_class || '',
            m.grip_right || '',
            m.grip_left || '',
            m.jump || '',
            m.dash || '',
            m.doublejump || '',
            m.squat || '',
            m.sidestep || '',
            m.throw || ''
          ]
        })
      })

      const escapeCSV = (val: unknown) => {
        const str = String(val ?? '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const csv = [headers, ...rows].map(row =>
        (row as unknown[]).map(escapeCSV).join(',')
      ).join('\n')

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `診断データ_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSVエクスポート例外:', err)
      alert('CSVエクスポート中にエラーが発生しました')
    }
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
      <header className="bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaHandshake className="text-blue-200 text-2xl" />
            <div>
              <h1 className="text-xl font-bold">Partner管理画面</h1>
              <p className="text-blue-200 text-xs">{profile?.email}</p>
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

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* KPIカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <FaStore className="text-blue-500 text-xl" />
              <span className="text-xs text-gray-500">担当店舗</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.stores.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <FaChild className="text-green-500 text-xl" />
              <span className="text-xs text-gray-500">総児童数</span>
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
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <FaCalendarAlt className="text-purple-500 text-xl" />
              <span className="text-xs text-gray-500">今月の測定</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">
              {getMonthlyStats(null).slice(-1)[0]?.count || 0}
            </div>
          </div>
        </div>

        {/* 店舗選択 & CSVダウンロード */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <label className="font-medium text-gray-700">店舗を選択:</label>
              <select
                value={selectedStore || ''}
                onChange={(e) => setSelectedStore(e.target.value || null)}
                className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全店舗</option>
                {stats?.stores.map(store => (
                  <option key={store.store_id} value={store.store_id}>
                    {store.store_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
            >
              <FaDownload />
              CSVダウンロード
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 担当店舗一覧 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FaStore className="text-blue-500" />
                担当店舗一覧
              </h3>
            </div>
            <div className="divide-y">
              {stats?.stores.map(store => (
                <div
                  key={store.store_id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedStore === store.store_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedStore(store.store_id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{store.store_name}</h4>
                      <p className="text-sm text-gray-500">{store.slug}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-gray-500">児童:</span>
                        <span className="font-bold ml-1">{store.children_count}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">測定:</span>
                        <span className="font-bold ml-1 text-blue-600">{store.measurements_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.stores || stats.stores.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  担当店舗がありません
                </div>
              )}
            </div>
          </div>

          {/* 月別推移 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FaChartLine className="text-green-500" />
                月別測定数推移
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {getMonthlyStats(selectedStore).map(({ month, count }) => {
                  const maxCount = Math.max(...getMonthlyStats(selectedStore).map(m => m.count))
                  return (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20">{month}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${(count / (maxCount || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-800 w-8 text-right">{count}</span>
                    </div>
                  )
                })}
                {getMonthlyStats(selectedStore).length === 0 && (
                  <p className="text-center text-gray-500 py-4">データがありません</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 学年・性別分布 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FaUsers className="text-purple-500" />
              学年・性別分布
              {selectedStore && (
                <span className="text-sm font-normal text-gray-500">
                  （{stats?.stores.find(s => s.store_id === selectedStore)?.store_name}）
                </span>
              )}
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
                {getGradeStatsForStore(selectedStore).map(g => (
                  <tr key={g.grade} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{g.grade}</td>
                    <td className="px-4 py-3 text-right text-blue-600">{g.male}</td>
                    <td className="px-4 py-3 text-right text-pink-600">{g.female}</td>
                    <td className="px-4 py-3 text-right font-bold">{g.total}</td>
                  </tr>
                ))}
                {getGradeStatsForStore(selectedStore).length === 0 && (
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
      </main>
    </div>
  )
}
