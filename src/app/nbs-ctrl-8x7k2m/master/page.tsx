'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient, StoreStatistics, GradeGenderDistribution, WeaknessStatistic, Partner, Store } from '@/lib/supabase'
import {
  FaUsers, FaClipboardList, FaStore, FaHandshake, FaChartBar,
  FaSignOutAlt, FaSpinner, FaDownload, FaChartLine, FaChild,
  FaExclamationTriangle, FaCrown, FaTrophy, FaArrowUp, FaTimes, FaSave, FaEdit,
  FaUserPlus, FaUserCog, FaTrash, FaPlus
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
  stores: Store[]
}

type UserProfile = {
  id: string
  email: string
  name: string | null
  role: 'master' | 'partner' | 'store'
  partner_id: string | null
  store_id: string | null
  created_at: string
  partners?: { name: string } | null
  stores?: { name: string } | null
}

export default function MasterDashboard() {
  const { profile, signOut, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'partners' | 'users' | 'analysis'>('overview')
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', address: '', phone: '', hours: '' })
  const [saving, setSaving] = useState(false)

  // ユーザー管理用state
  const [users, setUsers] = useState<UserProfile[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'store' as 'master' | 'partner' | 'store',
    partner_id: '',
    store_id: ''
  })
  const [editUserForm, setEditUserForm] = useState({
    id: '',
    name: '',
    role: 'store' as 'master' | 'partner' | 'store',
    partner_id: '',
    store_id: ''
  })
  const [partnerForm, setPartnerForm] = useState({ name: '', email: '', phone: '' })
  const [showStoreModal, setShowStoreModal] = useState(false)
  const [storeForm, setStoreForm] = useState({ name: '', slug: '', partner_id: '', address: '', phone: '', hours: '' })

  const supabase = createClientComponentClient()

  // 認証完了後にデータ取得
  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData()
    }
  }, [authLoading])

  const fetchDashboardData = async () => {
    setDataLoading(true)

    try {
      // 基本データを並列で取得
      const [
        storesRes,
        storesDataRes,
        partnersRes,
        childrenRes,
        measurementsRes,
        recentRes
      ] = await Promise.all([
        supabase.from('stores').select('id', { count: 'exact', head: true }),
        supabase.from('stores').select('*'),
        supabase.from('partners').select('*'),
        supabase.from('children').select('id', { count: 'exact', head: true }),
        supabase.from('measurements').select('id', { count: 'exact', head: true }),
        supabase.from('measurements').select('id', { count: 'exact', head: true })
          .gte('measured_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      ])

      // エラーチェック
      if (storesRes.error) console.error('stores error:', storesRes.error)
      if (storesDataRes.error) console.error('storesData error:', storesDataRes.error)
      if (partnersRes.error) console.error('partners error:', partnersRes.error)
      if (childrenRes.error) console.error('children error:', childrenRes.error)
      if (measurementsRes.error) console.error('measurements error:', measurementsRes.error)

      // ビューからのデータ取得（存在しない場合はエラーを無視）
      const storeStatsRes = await supabase.from('store_statistics').select('*')
      const gradeDistRes = await supabase.from('grade_gender_distribution').select('*')
      const weaknessRes = await supabase.from('weakness_statistics').select('*')

      // ビューのエラーは無視（存在しない可能性があるため）
      if (storeStatsRes.error) console.log('store_statistics not available:', storeStatsRes.error.message)
      if (gradeDistRes.error) console.log('grade_gender_distribution not available:', gradeDistRes.error.message)
      if (weaknessRes.error) console.log('weakness_statistics not available:', weaknessRes.error.message)

      setStats({
        totalStores: storesRes.count || 0,
        totalPartners: partnersRes.data?.length || 0,
        totalChildren: childrenRes.count || 0,
        totalMeasurements: measurementsRes.count || 0,
        recentMeasurements: recentRes.count || 0,
        storeStats: storeStatsRes.data || [],
        gradeDistribution: gradeDistRes.data || [],
        weaknessStats: weaknessRes.data || [],
        partners: partnersRes.data || [],
        stores: storesDataRes.data || []
      })
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
    } finally {
      setDataLoading(false)
    }
  }

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    if (data.users) {
      setUsers(data.users)
    }
  }

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  const handleCreateUser = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })
      const data = await res.json()
      if (data.error) {
        alert('ユーザー作成に失敗しました: ' + data.error)
      } else {
        setShowUserModal(false)
        setUserForm({ email: '', password: '', name: '', role: 'store', partner_id: '', store_id: '' })
        fetchUsers()
        fetchDashboardData()
      }
    } catch {
      alert('エラーが発生しました')
    }
    setSaving(false)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('このユーザーを削除しますか？')) return
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) {
        alert('削除に失敗しました: ' + data.error)
      } else {
        fetchUsers()
      }
    } catch {
      alert('エラーが発生しました')
    }
  }

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user)
    setEditUserForm({
      id: user.id,
      name: user.name || '',
      role: user.role,
      partner_id: user.partner_id || '',
      store_id: user.store_id || ''
    })
  }

  const handleUpdateUser = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserForm)
      })
      const data = await res.json()
      if (data.error) {
        alert('更新に失敗しました: ' + data.error)
      } else {
        setEditingUser(null)
        fetchUsers()
      }
    } catch {
      alert('エラーが発生しました')
    }
    setSaving(false)
  }

  const handleCreatePartner = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerForm)
      })
      const data = await res.json()
      if (data.error) {
        alert('パートナー作成に失敗しました: ' + data.error)
      } else {
        setShowPartnerModal(false)
        setPartnerForm({ name: '', email: '', phone: '' })
        fetchDashboardData()
      }
    } catch {
      alert('エラーが発生しました')
    }
    setSaving(false)
  }

  const handleCreateStore = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({
          name: storeForm.name,
          slug: storeForm.slug,
          partner_id: storeForm.partner_id || null,
          address: storeForm.address || null,
          phone: storeForm.phone || null,
          hours: storeForm.hours || null
        })
        .select()
        .single()

      if (error) {
        alert('店舗作成に失敗しました: ' + error.message)
      } else {
        setShowStoreModal(false)
        setStoreForm({ name: '', slug: '', partner_id: '', address: '', phone: '', hours: '' })
        fetchDashboardData()
      }
    } catch {
      alert('エラーが発生しました')
    }
    setSaving(false)
  }

  const handleEditStore = (store: Store) => {
    setEditingStore(store)
    setEditForm({
      name: store.name,
      slug: store.slug,
      address: store.address || '',
      phone: store.phone || '',
      hours: store.hours || ''
    })
  }

  const handleSaveStore = async () => {
    if (!editingStore) return
    setSaving(true)

    const { error } = await supabase
      .from('stores')
      .update({
        name: editForm.name,
        slug: editForm.slug,
        address: editForm.address || null,
        phone: editForm.phone || null,
        hours: editForm.hours || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingStore.id)

    if (error) {
      alert('保存に失敗しました: ' + error.message)
    } else {
      setEditingStore(null)
      fetchDashboardData() // データ再取得
    }
    setSaving(false)
  }

  const handleExportCSV = async () => {
    try {
      // 全データをCSVエクスポート
      const { data: children, error } = await supabase
        .from('children')
        .select(`
          *,
          stores(name),
          measurements(
            *,
            results(*)
          )
        `)

      if (error) {
        console.error('CSVエクスポートエラー:', error)
        alert('データの取得に失敗しました: ' + error.message)
        return
      }

      if (!children || children.length === 0) {
        alert('エクスポートするデータがありません')
        return
      }

      // CSV生成（全7項目対応）
      const headers = [
        '店舗名', '児童名', 'ふりがな', '学年', '性別', '身長', '体重',
        '測定日', '運動年齢', '年齢差', '運動タイプ', '弱点分野',
        '握力右', '握力左', '立ち幅跳び', '15mダッシュ',
        '連続立ち幅跳び', '30秒スクワット', '反復横跳び', 'ボール投げ'
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
            '', '', '', '', '', '', '', '', '', '', '', '', ''
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
            m.measured_at || '',
            r?.motor_age || '',
            r?.motor_age_diff || '',
            r?.type_name || '',
            r?.weakness_class || '',
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

      // カンマを含む値をエスケープ
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

  if (authLoading || dataLoading) {
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
              { id: 'users', label: 'ユーザー管理', icon: FaUserCog },
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
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaStore />
                  店舗一覧
                </h3>
                <button
                  onClick={() => setShowStoreModal(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  <FaPlus />
                  新規店舗追加
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">店舗名</th>
                      <th className="text-left px-4 py-3">スラッグ</th>
                      <th className="text-left px-4 py-3">住所</th>
                      <th className="text-left px-4 py-3">電話番号</th>
                      <th className="text-right px-4 py-3">児童数</th>
                      <th className="text-right px-4 py-3">測定数</th>
                      <th className="text-center px-4 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats?.stores.map(store => {
                      const storeStat = stats.storeStats.find(s => s.store_id === store.id)
                      return (
                        <tr key={store.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{store.name}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm font-mono">{store.slug}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">{store.address || '-'}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">{store.phone || '-'}</td>
                          <td className="px-4 py-3 text-right">{storeStat?.children_count || 0}</td>
                          <td className="px-4 py-3 text-right">{storeStat?.measurements_count || 0}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleEditStore(store)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <FaEdit />
                              編集
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 編集モーダル */}
            {editingStore && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">店舗情報を編集</h3>
                    <button
                      onClick={() => setEditingStore(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">店舗名</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">スラッグ（URL用）</label>
                      <input
                        type="text"
                        value={editForm.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">例: example.com/{editForm.slug}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">営業時間</label>
                      <input
                        type="text"
                        value={editForm.hours}
                        onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="例: 10:00〜18:00"
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingStore(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSaveStore}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      保存
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 店舗追加モーダル */}
            {showStoreModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">新規店舗追加</h3>
                    <button
                      onClick={() => setShowStoreModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">店舗名 *</label>
                      <input
                        type="text"
                        value={storeForm.name}
                        onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="例: 渋谷店"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">スラッグ（URL用）*</label>
                      <input
                        type="text"
                        value={storeForm.slug}
                        onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                        placeholder="例: shibuya"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        店舗ページURL: {storeForm.slug || 'xxx'}.nobishiro.kids
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">担当パートナー</label>
                      <select
                        value={storeForm.partner_id}
                        onChange={(e) => setStoreForm({ ...storeForm, partner_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">なし</option>
                        {stats?.partners.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                      <input
                        type="text"
                        value={storeForm.address}
                        onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                      <input
                        type="text"
                        value={storeForm.phone}
                        onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">営業時間</label>
                      <input
                        type="text"
                        value={storeForm.hours}
                        onChange={(e) => setStoreForm({ ...storeForm, hours: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="例: 10:00〜18:00"
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button
                      onClick={() => setShowStoreModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleCreateStore}
                      disabled={saving || !storeForm.name || !storeForm.slug}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                      追加
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'partners' && (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaHandshake />
                  パートナー一覧
                </h3>
                <button
                  onClick={() => setShowPartnerModal(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  <FaPlus />
                  新規パートナー追加
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
                        </tr>
                      )
                    })}
                    {(!stats?.partners || stats.partners.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          パートナーが登録されていません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* パートナー追加モーダル */}
            {showPartnerModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">新規パートナー追加</h3>
                    <button onClick={() => setShowPartnerModal(false)} className="text-gray-500 hover:text-gray-700">
                      <FaTimes />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">パートナー名 *</label>
                      <input
                        type="text"
                        value={partnerForm.name}
                        onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                      <input
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                      <input
                        type="text"
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button onClick={() => setShowPartnerModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                      キャンセル
                    </button>
                    <button
                      onClick={handleCreatePartner}
                      disabled={saving || !partnerForm.name}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                      追加
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaUserCog />
                  ユーザー一覧
                </h3>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  <FaUserPlus />
                  新規ユーザー追加
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">名前</th>
                      <th className="text-left px-4 py-3">メール</th>
                      <th className="text-center px-4 py-3">ロール</th>
                      <th className="text-left px-4 py-3">パートナー/店舗</th>
                      <th className="text-left px-4 py-3">作成日</th>
                      <th className="text-center px-4 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{user.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{user.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'master' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'partner' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {user.role === 'store' ? (
                            <div>
                              <div>{user.stores?.name || '-'}</div>
                              {user.partners?.name && (
                                <div className="text-xs text-gray-400">({user.partners.name})</div>
                              )}
                            </div>
                          ) : user.role === 'partner' ? (
                            user.partners?.name || '-'
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-sm">
                          {new Date(user.created_at).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {user.role !== 'master' && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                title="編集"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                                title="削除"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          ユーザーが登録されていません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ユーザー編集モーダル */}
            {editingUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">ユーザー編集</h3>
                    <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700">
                      <FaTimes />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                      <input
                        type="email"
                        value={editingUser.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                      <input
                        type="text"
                        value={editUserForm.name}
                        onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ロール</label>
                      <select
                        value={editUserForm.role}
                        onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as 'partner' | 'store', partner_id: '', store_id: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="store">店舗スタッフ</option>
                        <option value="partner">パートナー</option>
                      </select>
                    </div>
                    {editUserForm.role === 'partner' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">パートナー</label>
                        <select
                          value={editUserForm.partner_id}
                          onChange={(e) => setEditUserForm({ ...editUserForm, partner_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">選択してください</option>
                          {stats?.partners.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {editUserForm.role === 'store' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">パートナー（任意）</label>
                          <select
                            value={editUserForm.partner_id}
                            onChange={(e) => setEditUserForm({ ...editUserForm, partner_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">なし</option>
                            {stats?.partners.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">店舗</label>
                          <select
                            value={editUserForm.store_id}
                            onChange={(e) => setEditUserForm({ ...editUserForm, store_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">選択してください</option>
                            {stats?.stores.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                      キャンセル
                    </button>
                    <button
                      onClick={handleUpdateUser}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      保存
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ユーザー追加モーダル */}
            {showUserModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">新規ユーザー追加</h3>
                    <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700">
                      <FaTimes />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">パスワード *</label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ロール *</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'partner' | 'store', partner_id: '', store_id: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="store">店舗スタッフ</option>
                        <option value="partner">パートナー</option>
                      </select>
                    </div>
                    {userForm.role === 'partner' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">パートナー *</label>
                        <select
                          value={userForm.partner_id}
                          onChange={(e) => setUserForm({ ...userForm, partner_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">選択してください</option>
                          {stats?.partners.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {userForm.role === 'store' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">パートナー（任意）</label>
                          <select
                            value={userForm.partner_id}
                            onChange={(e) => setUserForm({ ...userForm, partner_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">なし</option>
                            {stats?.partners.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">店舗 *</label>
                          <select
                            value={userForm.store_id}
                            onChange={(e) => setUserForm({ ...userForm, store_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">選択してください</option>
                            {stats?.stores.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                      キャンセル
                    </button>
                    <button
                      onClick={handleCreateUser}
                      disabled={saving || !userForm.email || !userForm.password}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
                      追加
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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
