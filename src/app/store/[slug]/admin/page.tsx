'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, createClientComponentClient } from '@/lib/supabase'
import {
  FaUsers, FaClipboardList, FaArrowLeft,
  FaSpinner, FaChartLine, FaChild,
  FaCalendarAlt, FaDownload, FaQrcode, FaUpload, FaTrash
} from 'react-icons/fa'

type GradeDistribution = {
  grade: string
  gender: 'male' | 'female'
  count: number
}

type MonthlyData = {
  month: string
  count: number
}

type StoreStats = {
  totalChildren: number
  totalMeasurements: number
  gradeDistribution: GradeDistribution[]
  monthlyData: MonthlyData[]
}

export default function StoreAdminPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const supabase = useMemo(() => createClientComponentClient(), [])

  const [store, setStore] = useState<Store | null>(null)
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingQr, setUploadingQr] = useState<'line' | 'reservation' | null>(null)
  const lineQrInputRef = useRef<HTMLInputElement>(null)
  const reservationQrInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true

    // タイムアウト設定（10秒で強制終了）
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.log('[StoreAdminPage] Data fetch timeout')
        setLoading(false)
        setError('データの取得がタイムアウトしました。ページを再読み込みしてください。')
      }
    }, 10000)

    const fetchStoreData = async () => {
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

        // 統計データを取得
        const [childrenRes, measurementsRes] = await Promise.all([
          supabase.from('children').select('id, grade, gender', { count: 'exact' }).eq('store_id', storeData.id),
          supabase.from('measurements').select('id, measured_at', { count: 'exact' }).eq('store_id', storeData.id)
        ])

        if (!isMounted) return

        // 学年・性別分布を計算
        const gradeDistribution: GradeDistribution[] = []
        const gradeCounts: Record<string, Record<string, number>> = {}

        if (childrenRes.data) {
          childrenRes.data.forEach((child: { grade: string; gender: string }) => {
            if (!gradeCounts[child.grade]) {
              gradeCounts[child.grade] = { male: 0, female: 0 }
            }
            gradeCounts[child.grade][child.gender] = (gradeCounts[child.grade][child.gender] || 0) + 1
          })

          Object.entries(gradeCounts).forEach(([grade, genders]) => {
            gradeDistribution.push({ grade, gender: 'male', count: genders.male || 0 })
            gradeDistribution.push({ grade, gender: 'female', count: genders.female || 0 })
          })
        }

        // 月別データを計算
        const monthlyData: MonthlyData[] = []
        const monthlyCounts: Record<string, number> = {}

        if (measurementsRes.data) {
          measurementsRes.data.forEach((m: { measured_at: string }) => {
            const month = m.measured_at.substring(0, 7)
            monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
          })

          Object.entries(monthlyCounts)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6)
            .forEach(([month, count]) => {
              monthlyData.push({ month, count })
            })
        }

        if (!isMounted) return
        setStats({
          totalChildren: childrenRes.count || 0,
          totalMeasurements: measurementsRes.count || 0,
          gradeDistribution,
          monthlyData
        })
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

    fetchStoreData()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [slug, supabase])

  // 学年表示用
  const getGradeLabel = (grade: string) => {
    const labels: Record<string, string> = {
      'k5': '年長', '1': '小1', '2': '小2', '3': '小3', '4': '小4', '5': '小5', '6': '小6'
    }
    return labels[grade] || grade
  }

  // 学年ごとの集計
  const getGradeStats = () => {
    if (!stats?.gradeDistribution) return []
    const grades: Record<string, { male: number; female: number }> = {}

    stats.gradeDistribution.forEach(g => {
      if (!grades[g.grade]) grades[g.grade] = { male: 0, female: 0 }
      grades[g.grade][g.gender] += g.count
    })

    const gradeOrder = ['k5', '1', '2', '3', '4', '5', '6']
    return Object.entries(grades)
      .sort((a, b) => gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]))
      .map(([grade, counts]) => ({
        grade: getGradeLabel(grade),
        male: counts.male,
        female: counts.female,
        total: counts.male + counts.female
      }))
  }

  // CSVエクスポート
  const handleExportCSV = async () => {
    if (!store) return

    try {
      const { data: children, error } = await supabase
        .from('children')
        .select(`
          *,
          measurements (
            *,
            results (*)
          )
        `)
        .eq('store_id', store.id)

      if (error) {
        console.error('CSVエクスポートエラー:', error)
        alert('データの取得に失敗しました')
        return
      }

      if (!children || children.length === 0) {
        alert('エクスポートするデータがありません')
        return
      }

      // CSV生成
      const headers = [
        '児童名', 'ふりがな', '学年', '性別', '身長', '体重',
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
      link.download = `${store.name}_診断データ_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSVエクスポート例外:', err)
      alert('CSVエクスポート中にエラーが発生しました')
    }
  }

  // QRコードアップロード処理
  const handleQrUpload = async (file: File, qrType: 'line' | 'reservation') => {
    if (!store) return

    setUploadingQr(qrType)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('storeId', store.id)
      formData.append('qrType', qrType)

      const response = await fetch('/api/store/qr-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'アップロードに失敗しました')
      }

      // ローカル状態を更新
      setStore(prev => prev ? {
        ...prev,
        [qrType === 'line' ? 'line_qr_url' : 'reservation_qr_url']: result.url
      } : null)

      alert(`${qrType === 'line' ? 'LINE' : '予約'}QRコードをアップロードしました`)
    } catch (err) {
      console.error('QRアップロードエラー:', err)
      alert(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setUploadingQr(null)
    }
  }

  // QRコード削除処理
  const handleQrDelete = async (qrType: 'line' | 'reservation') => {
    if (!store) return
    if (!confirm(`${qrType === 'line' ? 'LINE' : '予約'}QRコードを削除しますか？`)) return

    try {
      const updateField = qrType === 'line' ? 'line_qr_url' : 'reservation_qr_url'
      const { error: updateError } = await supabase
        .from('stores')
        .update({ [updateField]: null })
        .eq('id', store.id)

      if (updateError) throw updateError

      setStore(prev => prev ? {
        ...prev,
        [updateField]: null
      } : null)

      alert(`${qrType === 'line' ? 'LINE' : '予約'}QRコードを削除しました`)
    } catch (err) {
      console.error('QR削除エラー:', err)
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href={`/store/${slug}`}
              className="flex items-center gap-2 text-green-100 hover:text-white transition-colors"
            >
              <FaArrowLeft />
              <span className="text-sm">トップへ戻る</span>
            </Link>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold">{store.name}</h1>
            <p className="text-green-200 text-xs">管理画面</p>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* KPIカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <FaChild className="text-green-500 text-xl" />
              <span className="text-xs text-gray-500">総児童数</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalChildren}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <FaClipboardList className="text-blue-500 text-xl" />
              <span className="text-xs text-gray-500">総測定数</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalMeasurements}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <FaCalendarAlt className="text-orange-500 text-xl" />
              <span className="text-xs text-gray-500">今月の測定</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">
              {stats?.monthlyData.slice(-1)[0]?.count || 0}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <button
              onClick={handleExportCSV}
              className="w-full h-full flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity"
            >
              <FaDownload className="text-purple-500 text-xl" />
              <span className="text-xs text-gray-600 font-medium">CSVダウンロード</span>
            </button>
          </div>
        </div>

        {/* QRコード設定セクション */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FaQrcode className="text-blue-500" />
              QRコード設定
            </h3>
            <p className="text-xs text-gray-500 mt-1">診断結果シートに表示されるQRコードを設定します</p>
          </div>
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 予約QRコード */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FaCalendarAlt className="text-orange-500" />
                  予約QRコード
                </h4>
                <div className="flex flex-col items-center gap-3">
                  {store.reservation_qr_url ? (
                    <>
                      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={store.reservation_qr_url}
                          alt="予約QRコード"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => reservationQrInputRef.current?.click()}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                          disabled={uploadingQr !== null}
                        >
                          <FaUpload /> 変更
                        </button>
                        <button
                          onClick={() => handleQrDelete('reservation')}
                          className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                          disabled={uploadingQr !== null}
                        >
                          <FaTrash /> 削除
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => reservationQrInputRef.current?.click()}
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      disabled={uploadingQr !== null}
                    >
                      {uploadingQr === 'reservation' ? (
                        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                      ) : (
                        <>
                          <FaUpload className="text-gray-400 text-2xl" />
                          <span className="text-xs text-gray-500">アップロード</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={reservationQrInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleQrUpload(file, 'reservation')
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>

              {/* LINE QRコード */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FaQrcode className="text-green-500" />
                  LINE QRコード
                </h4>
                <div className="flex flex-col items-center gap-3">
                  {store.line_qr_url ? (
                    <>
                      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={store.line_qr_url}
                          alt="LINE QRコード"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => lineQrInputRef.current?.click()}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                          disabled={uploadingQr !== null}
                        >
                          <FaUpload /> 変更
                        </button>
                        <button
                          onClick={() => handleQrDelete('line')}
                          className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                          disabled={uploadingQr !== null}
                        >
                          <FaTrash /> 削除
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => lineQrInputRef.current?.click()}
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-50 transition-colors"
                      disabled={uploadingQr !== null}
                    >
                      {uploadingQr === 'line' ? (
                        <FaSpinner className="animate-spin text-green-500 text-2xl" />
                      ) : (
                        <>
                          <FaUpload className="text-gray-400 text-2xl" />
                          <span className="text-xs text-gray-500">アップロード</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={lineQrInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleQrUpload(file, 'line')
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
                {stats?.monthlyData.map(({ month, count }) => {
                  const maxCount = Math.max(...(stats?.monthlyData.map(m => m.count) || [1]))
                  return (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20">{month}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${(count / (maxCount || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-800 w-8 text-right">{count}</span>
                    </div>
                  )
                })}
                {(!stats?.monthlyData || stats.monthlyData.length === 0) && (
                  <p className="text-center text-gray-500 py-4">データがありません</p>
                )}
              </div>
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
      </main>
    </div>
  )
}
