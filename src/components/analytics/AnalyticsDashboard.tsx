'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FaChartBar, FaChartLine, FaFilter, FaDownload, FaSync, FaSpinner,
  FaTable, FaChartPie, FaExclamationTriangle, FaLightbulb, FaUsers,
  FaStore, FaCalendarAlt
} from 'react-icons/fa'

// Recharts imports
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

type Store = {
  id: string
  name: string
  slug: string
}

type AnalyticsProps = {
  stores: Store[]
}

type FilterState = {
  grade: string
  gender: string
  storeId: string
  startDate: string
  endDate: string
  period: 'month' | 'quarter' | 'year'
}

// 相関係数の色を返す
const getCorrelationColor = (value: number): string => {
  if (value >= 0.7) return '#22c55e'
  if (value >= 0.4) return '#84cc16'
  if (value >= 0.1) return '#eab308'
  if (value >= -0.1) return '#f5f5f5'
  if (value >= -0.4) return '#f97316'
  return '#ef4444'
}

// グレードラベル
const gradeLabels: Record<string, string> = {
  k5: '年長',
  '1': '小1',
  '2': '小2',
  '3': '小3',
  '4': '小4',
  '5': '小5',
  '6': '小6'
}

export default function AnalyticsDashboard({ stores }: AnalyticsProps) {
  const [activeSection, setActiveSection] = useState<'benchmark' | 'correlation' | 'store' | 'trend' | 'weakness' | 'cohort'>('benchmark')
  const [filters, setFilters] = useState<FilterState>({
    grade: 'all',
    gender: 'all',
    storeId: 'all',
    startDate: '',
    endDate: '',
    period: 'month'
  })
  const [loading, setLoading] = useState(false)
  const [benchmarkData, setBenchmarkData] = useState<Record<string, unknown> | null>(null)
  const [correlationData, setCorrelationData] = useState<Record<string, unknown> | null>(null)
  const [storeComparisonData, setStoreComparisonData] = useState<Record<string, unknown> | null>(null)
  const [trendData, setTrendData] = useState<Record<string, unknown> | null>(null)
  const [weaknessData, setWeaknessData] = useState<Record<string, unknown> | null>(null)
  const [cohortData, setCohortData] = useState<Record<string, unknown> | null>(null)
  const [scatterMetric, setScatterMetric] = useState('jump')
  const [bodyMetric, setBodyMetric] = useState('height')
  const [scatterData, setScatterData] = useState<Record<string, unknown> | null>(null)
  const [typeValidationData, setTypeValidationData] = useState<Record<string, unknown> | null>(null)

  const chartRef = useRef<HTMLDivElement>(null)

  // データ取得
  const fetchData = async (type: string, extraParams: Record<string, string> = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type,
        grade: filters.grade,
        gender: filters.gender,
        store_id: filters.storeId,
        start_date: filters.startDate,
        end_date: filters.endDate,
        period: filters.period,
        ...extraParams
      })

      const res = await fetch(`/api/admin/analytics?${params}`)
      const data = await res.json()

      if (data.success) {
        return data.data
      } else {
        console.error('API Error:', data.error)
        return null
      }
    } catch (error) {
      console.error('Fetch error:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  // セクション切り替え時のデータ取得
  useEffect(() => {
    const loadSectionData = async () => {
      switch (activeSection) {
        case 'benchmark':
          const benchmark = await fetchData('benchmark')
          setBenchmarkData(benchmark)
          break
        case 'correlation':
          const [correlation, typeValidation] = await Promise.all([
            fetchData('correlation'),
            fetchData('type-validation')
          ])
          setCorrelationData(correlation)
          setTypeValidationData(typeValidation)
          break
        case 'store':
          const storeComparison = await fetchData('store-comparison')
          setStoreComparisonData(storeComparison)
          break
        case 'trend':
          const trend = await fetchData('trend')
          setTrendData(trend)
          break
        case 'weakness':
          const weakness = await fetchData('weakness')
          setWeaknessData(weakness)
          break
        case 'cohort':
          const cohort = await fetchData('cohort')
          setCohortData(cohort)
          break
      }
    }
    loadSectionData()
  }, [activeSection, filters])

  // 散布図データ取得
  useEffect(() => {
    if (activeSection === 'correlation') {
      const loadScatterData = async () => {
        const scatter = await fetchData('scatter', { metric: scatterMetric, body_metric: bodyMetric })
        setScatterData(scatter)
      }
      loadScatterData()
    }
  }, [scatterMetric, bodyMetric, activeSection, filters])

  // CSVエクスポート
  const exportToCSV = (data: unknown[], filename: string) => {
    if (!data || data.length === 0) return

    const headers = Object.keys(data[0] as Record<string, unknown>)
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = (row as Record<string, unknown>)[h]
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 画像エクスポート
  const exportChartImage = async () => {
    if (!chartRef.current) return

    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      })
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = `chart_${activeSection}_${new Date().toISOString().split('T')[0]}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  // ベンチマークデータをテーブル形式に変換
  const getBenchmarkTableData = () => {
    if (!benchmarkData) return []
    const data = benchmarkData as Record<string, { grade: string; gender: string; count: number; stats: Record<string, { mean: number; median: number; stdDev: number; min: number; max: number }> }>

    return Object.values(data).map(item => ({
      セグメント: `${gradeLabels[item.grade] || item.grade}・${item.gender === 'male' ? '男子' : '女子'}`,
      サンプル数: item.count,
      ...Object.fromEntries(
        Object.entries(item.stats || {}).map(([key, val]) => [
          key,
          `${val.mean} (σ=${val.stdDev})`
        ])
      )
    }))
  }

  // 相関マトリクスをヒートマップ形式に変換
  const getHeatmapData = () => {
    if (!correlationData) return []
    const matrix = (correlationData as { matrix: { x: string; y: string; correlation: number }[] }).matrix
    if (!matrix) return []

    const labels = [...new Set(matrix.map(m => m.x))]
    return labels.map(y => {
      const row: Record<string, string | number> = { name: y }
      labels.forEach(x => {
        const item = matrix.find(m => m.x === x && m.y === y)
        row[x] = item ? item.correlation : 0
      })
      return row
    })
  }

  return (
    <div className="space-y-6">
      {/* フィルターバー */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-purple-600">
            <FaFilter />
            <span className="font-medium">フィルタ</span>
          </div>

          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">全学年</option>
            <option value="k5">年長</option>
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={String(g)}>小学{g}年</option>
            ))}
          </select>

          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">全性別</option>
            <option value="male">男子</option>
            <option value="female">女子</option>
          </select>

          <select
            value={filters.storeId}
            onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">全店舗</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-gray-400">〜</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={() => setFilters({
              grade: 'all',
              gender: 'all',
              storeId: 'all',
              startDate: '',
              endDate: '',
              period: 'month'
            })}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            <FaSync className="text-xs" />
            リセット
          </button>
        </div>
      </div>

      {/* セクションタブ */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {[
            { id: 'benchmark', label: 'ベンチマーク分析', icon: FaChartBar, priority: '高' },
            { id: 'correlation', label: '相関分析', icon: FaChartPie, priority: '高' },
            { id: 'store', label: '店舗間比較', icon: FaStore, priority: '中' },
            { id: 'trend', label: '経年トレンド', icon: FaChartLine, priority: '中' },
            { id: 'weakness', label: '強み・弱み分析', icon: FaExclamationTriangle, priority: '中' },
            { id: 'cohort', label: 'コホート分析', icon: FaUsers, priority: '低' },
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600 font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <section.icon />
              {section.label}
              {section.priority === '高' && (
                <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">優先</span>
              )}
            </button>
          ))}
        </div>

        {/* コンテンツエリア */}
        <div className="p-6" ref={chartRef}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-purple-600 text-3xl" />
            </div>
          ) : (
            <>
              {/* ベンチマーク分析 */}
              {activeSection === 'benchmark' && benchmarkData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">学年×性別 ベンチマーク統計</h3>
                      <p className="text-sm text-gray-500">各セグメントの平均値・標準偏差・サンプル数</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportToCSV(getBenchmarkTableData(), 'benchmark')}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        <FaDownload />
                        CSV
                      </button>
                      <button
                        onClick={exportChartImage}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        <FaDownload />
                        画像
                      </button>
                    </div>
                  </div>

                  {/* 統計テーブル */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">セグメント</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">n</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">握力(右)</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">握力(左)</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">立ち幅跳び</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">15mダッシュ</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">連続跳び</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">スクワット</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">反復横跳び</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">ボール投げ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.values(benchmarkData as Record<string, { grade: string; gender: string; count: number; stats: Record<string, { mean: number; stdDev: number }> }>).map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">
                              {gradeLabels[item.grade] || item.grade}・{item.gender === 'male' ? '男子' : '女子'}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600">{item.count}</td>
                            {['grip_right', 'grip_left', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw'].map(metric => (
                              <td key={metric} className="px-4 py-3 text-right">
                                {item.stats?.[metric] ? (
                                  <div>
                                    <span className="font-medium">{item.stats[metric].mean}</span>
                                    <span className="text-gray-400 text-xs ml-1">(σ={item.stats[metric].stdDev})</span>
                                  </div>
                                ) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 棒グラフ：学年別平均値比較 */}
                  <div className="mt-8">
                    <h4 className="font-bold text-gray-700 mb-4">学年別平均値比較（握力）</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.values(benchmarkData as Record<string, { grade: string; gender: string; stats: Record<string, { mean: number }> }>)
                          .filter(item => item.stats?.grip_right)
                          .map(item => ({
                            name: `${gradeLabels[item.grade]}${item.gender === 'male' ? '男' : '女'}`,
                            握力右: item.stats?.grip_right?.mean || 0,
                            握力左: item.stats?.grip_left?.mean || 0
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="握力右" fill="#8b5cf6" />
                        <Bar dataKey="握力左" fill="#a78bfa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* 相関分析 */}
              {activeSection === 'correlation' && correlationData && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">測定項目間の相関分析</h3>
                      <p className="text-sm text-gray-500">
                        サンプル数: {(correlationData as { sampleSize: number }).sampleSize}件
                      </p>
                    </div>
                    <button
                      onClick={exportChartImage}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      <FaDownload />
                      画像
                    </button>
                  </div>

                  {/* 相関マトリクス（ヒートマップ風テーブル） */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">相関マトリクス</h4>
                    <div className="overflow-x-auto">
                      <table className="text-sm">
                        <thead>
                          <tr>
                            <th className="px-3 py-2"></th>
                            {['握力(右)', '握力(左)', '立ち幅跳び', '15mダッシュ', '連続立ち幅跳び', 'スクワット', '反復横跳び', 'ボール投げ'].map(h => (
                              <th key={h} className="px-3 py-2 text-xs font-medium text-gray-600 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getHeatmapData().map((row, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-xs font-medium text-gray-600 whitespace-nowrap">{row.name}</td>
                              {['握力(右)', '握力(左)', '立ち幅跳び', '15mダッシュ', '連続立ち幅跳び', 'スクワット', '反復横跳び', 'ボール投げ'].map(col => (
                                <td
                                  key={col}
                                  className="px-3 py-2 text-center text-xs font-medium"
                                  style={{
                                    backgroundColor: getCorrelationColor(row[col] as number),
                                    color: Math.abs(row[col] as number) > 0.4 ? 'white' : 'inherit'
                                  }}
                                >
                                  {typeof row[col] === 'number' ? row[col].toFixed(2) : '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                      <span>相関係数:</span>
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></span>
                        強い正 (0.7+)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }}></span>
                        中程度 (0.4+)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></span>
                        負 (-0.4-)
                      </span>
                    </div>
                  </div>

                  {/* インサイト */}
                  {(correlationData as { insights: string[] }).insights?.length > 0 && (
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                        <FaLightbulb />
                        自動抽出インサイト
                      </h4>
                      <ul className="space-y-2">
                        {(correlationData as { insights: string[] }).insights.map((insight, i) => (
                          <li key={i} className="text-sm text-yellow-700">・{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 身体データとの相関 */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">身体データとの相関</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={(correlationData as { bodyCorrelations: { metric: string; height: number; weight: number; bmi: number }[] }).bodyCorrelations}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 12 }} />
                        <YAxis dataKey="metric" type="category" tick={{ fontSize: 11 }} width={100} />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine x={0} stroke="#666" />
                        <Bar dataKey="height" name="身長" fill="#3b82f6" />
                        <Bar dataKey="weight" name="体重" fill="#22c55e" />
                        <Bar dataKey="bmi" name="BMI" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 散布図 */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">散布図（回帰直線付き）</h4>
                    <div className="flex gap-4 mb-4">
                      <select
                        value={bodyMetric}
                        onChange={(e) => setBodyMetric(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="height">身長</option>
                        <option value="weight">体重</option>
                        <option value="bmi">BMI</option>
                      </select>
                      <span className="self-center text-gray-400">×</span>
                      <select
                        value={scatterMetric}
                        onChange={(e) => setScatterMetric(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="jump">立ち幅跳び</option>
                        <option value="dash">15mダッシュ</option>
                        <option value="grip_right">握力(右)</option>
                        <option value="throw">ボール投げ</option>
                      </select>
                    </div>
                    {scatterData && (
                      <>
                        <ResponsiveContainer width="100%" height={400}>
                          <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="x"
                              type="number"
                              name={bodyMetric === 'height' ? '身長(cm)' : bodyMetric === 'weight' ? '体重(kg)' : 'BMI'}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              dataKey="y"
                              type="number"
                              name={scatterMetric}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Scatter
                              name="測定データ"
                              data={(scatterData as { points: { x: number; y: number; gender: string }[] }).points}
                              fill="#8b5cf6"
                            >
                              {(scatterData as { points: { gender: string }[] }).points.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.gender === 'male' ? '#3b82f6' : '#ec4899'}
                                />
                              ))}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                        <div className="text-sm text-gray-600 mt-2">
                          相関係数: <span className="font-bold">{(scatterData as { regression: { correlation: number } }).regression?.correlation}</span>
                          {' | '}
                          サンプル数: {(scatterData as { sampleSize: number }).sampleSize}件
                        </div>
                      </>
                    )}
                  </div>

                  {/* 運動タイプ検証 */}
                  {typeValidationData && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-4">運動タイプ分類の検証</h4>
                      <p className="text-sm text-gray-500 mb-4">各運動タイプごとの能力値平均（レーダーチャート）</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(typeValidationData as { typeStats: { type: string; count: number; avgScores: Record<string, number> }[] }).typeStats
                          .filter(t => t.count >= 3)
                          .slice(0, 6)
                          .map((typeData, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-800 mb-2">{typeData.type}</h5>
                              <p className="text-xs text-gray-500 mb-3">n={typeData.count}</p>
                              <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={Object.entries(typeData.avgScores).map(([key, value]) => ({
                                  subject: {
                                    grip: '筋力', jump: '瞬発力', dash: '移動', doublejump: 'バランス',
                                    squat: '持久力', sidestep: '敏捷性', throw: '投力'
                                  }[key] || key,
                                  value: value,
                                  fullMark: 10
                                }))}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
                                  <Radar
                                    name={typeData.type}
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.5}
                                  />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 店舗間比較 */}
              {activeSection === 'store' && storeComparisonData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">店舗間比較分析</h3>
                      <p className="text-sm text-gray-500">各店舗の測定項目平均値と全体平均との差分</p>
                    </div>
                    <button
                      onClick={exportChartImage}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      <FaDownload />
                      画像
                    </button>
                  </div>

                  {/* 店舗別棒グラフ */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">店舗別平均値（立ち幅跳び）</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={(storeComparisonData as { storeStats: { storeName: string; measurementCount: number; stats: Record<string, { mean: number }> }[] }).storeStats
                          .filter(s => s.measurementCount > 0)
                          .map(s => ({
                            name: s.storeName,
                            平均値: s.stats?.jump?.mean || 0,
                            測定数: s.measurementCount
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="平均値" fill="#8b5cf6">
                          {(storeComparisonData as { storeStats: { stats: Record<string, { diffFromOverall: number }> }[] }).storeStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={(entry.stats?.jump?.diffFromOverall || 0) >= 0 ? '#22c55e' : '#ef4444'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 全体平均との差分テーブル */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">全体平均との差分</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">店舗名</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">測定数</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">握力(右)</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">立ち幅跳び</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">15mダッシュ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(storeComparisonData as { storeStats: { storeName: string; measurementCount: number; stats: Record<string, { mean: number; diffFromOverall: number }> }[] }).storeStats
                            .filter(s => s.measurementCount > 0)
                            .map((store, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{store.storeName}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{store.measurementCount}</td>
                                {['grip_right', 'jump', 'dash'].map(metric => {
                                  const diff = store.stats?.[metric]?.diffFromOverall || 0
                                  return (
                                    <td key={metric} className="px-4 py-3 text-right">
                                      <span className={`font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                                      </span>
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 経年トレンド */}
              {activeSection === 'trend' && trendData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">経年トレンド分析</h3>
                      <p className="text-sm text-gray-500">測定項目の時系列推移</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={filters.period}
                        onChange={(e) => setFilters({ ...filters, period: e.target.value as 'month' | 'quarter' | 'year' })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="month">月別</option>
                        <option value="quarter">四半期別</option>
                        <option value="year">年別</option>
                      </select>
                      <button
                        onClick={exportChartImage}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        <FaDownload />
                        画像
                      </button>
                    </div>
                  </div>

                  {/* トレンド折れ線グラフ */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">測定項目の推移</h4>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={(trendData as { trendData: Record<string, unknown>[] }).trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="立ち幅跳び" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="握力(右)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="15mダッシュ" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 測定数推移 */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">測定数の推移</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={(trendData as { trendData: { period: string; count: number }[] }).trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="測定数" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* 強み・弱み分析 */}
              {activeSection === 'weakness' && weaknessData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">強み・弱み分析</h3>
                      <p className="text-sm text-gray-500">
                        サンプル数: {(weaknessData as { totalSamples: number }).totalSamples}件
                      </p>
                    </div>
                    <button
                      onClick={exportChartImage}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      <FaDownload />
                      画像
                    </button>
                  </div>

                  {/* 弱点分野ランキング */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">弱点分野ランキング</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={(weaknessData as { weaknessRanking: { name: string; count: number; percentage: number }[] }).weaknessRanking}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value}人 (${props.payload.percentage}%)`,
                            '人数'
                          ]}
                        />
                        <Bar dataKey="count" name="人数" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 運動タイプ分布 */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">運動タイプ分布</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(weaknessData as { typeDistribution: { name: string; count: number; percentage: number }[] }).typeDistribution.map((type, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{type.percentage}%</div>
                          <div className="text-sm text-gray-600 mt-1">{type.name}</div>
                          <div className="text-xs text-gray-400">{type.count}人</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* コホート分析 */}
              {activeSection === 'cohort' && cohortData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">コホート分析（成長追跡）</h3>
                      <p className="text-sm text-gray-500">
                        複数回測定児童数: {(cohortData as { totalChildren: number }).totalChildren}人
                      </p>
                    </div>
                    <button
                      onClick={exportChartImage}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      <FaDownload />
                      画像
                    </button>
                  </div>

                  {/* 平均伸び率 */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">平均伸び率（初回→最新）</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries((cohortData as { avgImprovement: Record<string, number> }).avgImprovement).map(([key, value]) => ({
                          name: {
                            grip: '握力', jump: '立ち幅跳び', dash: '15mダッシュ',
                            doublejump: '連続跳び', squat: 'スクワット', sidestep: '反復横跳び', throw: 'ボール投げ'
                          }[key] || key,
                          伸び率: value
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, '伸び率']} />
                        <ReferenceLine y={0} stroke="#666" />
                        <Bar dataKey="伸び率" fill="#8b5cf6">
                          {Object.values((cohortData as { avgImprovement: Record<string, number> }).avgImprovement).map((value, index) => (
                            <Cell key={`cell-${index}`} fill={value >= 0 ? '#22c55e' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 個別児童の成長データ */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">個別成長データ（上位10件）</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">児童名</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-600">学年</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-600">測定回数</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">握力伸び率</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">跳躍伸び率</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">ダッシュ改善</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(cohortData as { cohortData: { childName: string; grade: string; gender: string; measurementCount: number; improvement: Record<string, number> }[] }).cohortData
                            .slice(0, 10)
                            .map((child, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{child.childName}</td>
                                <td className="px-4 py-3 text-center">
                                  {gradeLabels[child.grade] || child.grade}・{child.gender === 'male' ? '男' : '女'}
                                </td>
                                <td className="px-4 py-3 text-center">{child.measurementCount}回</td>
                                {['grip', 'jump', 'dash'].map(metric => {
                                  const value = child.improvement?.[metric]
                                  return (
                                    <td key={metric} className="px-4 py-3 text-right">
                                      {value !== undefined ? (
                                        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
                                          {value >= 0 ? '+' : ''}{value}%
                                        </span>
                                      ) : '-'}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* データなしの場合 */}
              {!loading && !benchmarkData && !correlationData && !storeComparisonData && !trendData && !weaknessData && !cohortData && (
                <div className="text-center py-20 text-gray-500">
                  <FaTable className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>データがありません</p>
                  <p className="text-sm mt-2">フィルタ条件を変更してお試しください</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
