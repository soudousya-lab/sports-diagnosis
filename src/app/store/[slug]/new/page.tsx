'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Store, Child } from '@/lib/supabase'
import { runDiagnosis, categories, getGradeDisplay, estimate15mTime, ballWeightCorrections } from '@/lib/diagnosis'
import { FaSearch, FaTimes, FaUserPlus, FaHistory } from 'react-icons/fa'

// 既存の子どもデータ型
type ExistingChild = {
  id: string
  name: string
  furigana: string | null
  grade: string
  gender: 'male' | 'female'
  height: number | null
  weight: number | null
  measurementCount: number
  lastMeasuredAt: string | null
}

type FormData = {
  name: string
  furigana: string
  grade: string
  gender: 'male' | 'female' | ''
  height: number | ''
  weight: number | ''
  gripRight: number | ''
  gripLeft: number | ''
  jump: number | ''
  dash: number | ''
  dashInputType: '15m' | '50m'  // 入力タイプ（15m走 or 50m走）
  doublejump: number | ''
  squat: number | ''
  sidestep: number | ''
  throw: number | ''
  ballType: '9' | '16' | '20' | '22' | '24' | ''  // ボール直径(cm)
  ballWeight: '500g' | '1kg' | '2kg' | '3kg' | ''  // ボール重量
}

// ボール種類の定義（直径ベース、9cmソフトボールを基準に補正）
// 補正ロジック: 大きいボールほど握りにくく飛距離が出にくいため、
// 基準(9cm)との比率で補正し、同じ投力なら同じ評価になるよう換算
const ballTypes = {
  '9':  { label: '9cm（ソフトボール）', diameter: 9, correction: 1.0 },
  '16': { label: '16cm（ハンドボール）', diameter: 16, correction: 1.10 },
  '20': { label: '20cm（フットサルボール）', diameter: 20, correction: 1.18 },
  '22': { label: '22cm（バレーボール）', diameter: 22, correction: 1.22 },
  '24': { label: '24cm（バスケットボール）', diameter: 24, correction: 1.26 }
}

export default function StoreNewMeasurementPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)

  // 既存の子ども選択関連
  const [existingChildren, setExistingChildren] = useState<ExistingChild[]>([])
  const [selectedChild, setSelectedChild] = useState<ExistingChild | null>(null)
  const [childSearchQuery, setChildSearchQuery] = useState('')
  const [showChildSelector, setShowChildSelector] = useState(false)
  const [isNewChild, setIsNewChild] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    furigana: '',
    grade: '',
    gender: '',
    height: '',
    weight: '',
    gripRight: '',
    gripLeft: '',
    jump: '',
    dash: '',
    dashInputType: '15m',
    doublejump: '',
    squat: '',
    sidestep: '',
    throw: '',
    ballType: '',
    ballWeight: ''
  })

  // 店舗データと既存の子どもデータを取得
  useEffect(() => {
    async function fetchData() {
      const { data: storeData, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!error && storeData) {
        setStore(storeData)

        // 既存の子どもデータを取得（測定回数と最終測定日付き）
        const { data: childrenData } = await supabase
          .from('children')
          .select(`
            id, name, furigana, grade, gender, height, weight,
            measurements (
              id, measured_at
            )
          `)
          .eq('store_id', storeData.id)
          .order('name')

        if (childrenData) {
          // 子どもごとにグループ化（名前+フリガナが同じものをまとめる）
          const childMap = new Map<string, ExistingChild>()

          childrenData.forEach((child: {
            id: string
            name: string
            furigana: string | null
            grade: string
            gender: 'male' | 'female'
            height: number | null
            weight: number | null
            measurements: { id: string; measured_at: string }[]
          }) => {
            const key = `${child.name}_${child.furigana || ''}`
            const measurementCount = child.measurements?.length || 0
            const lastMeasuredAt = child.measurements?.length > 0
              ? child.measurements.sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())[0].measured_at
              : null

            const existing = childMap.get(key)
            if (!existing || (lastMeasuredAt && (!existing.lastMeasuredAt || new Date(lastMeasuredAt) > new Date(existing.lastMeasuredAt)))) {
              childMap.set(key, {
                id: child.id,
                name: child.name,
                furigana: child.furigana,
                grade: child.grade,
                gender: child.gender,
                height: child.height,
                weight: child.weight,
                measurementCount: existing ? existing.measurementCount + measurementCount : measurementCount,
                lastMeasuredAt
              })
            } else if (existing) {
              existing.measurementCount += measurementCount
            }
          })

          setExistingChildren(Array.from(childMap.values()))
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [slug])

  // 検索フィルター済みの子どもリスト
  const filteredChildren = useMemo(() => {
    const query = childSearchQuery.toLowerCase().trim()
    if (!query) return existingChildren
    return existingChildren.filter(child =>
      child.name.toLowerCase().includes(query) ||
      (child.furigana?.toLowerCase().includes(query) ?? false)
    )
  }, [existingChildren, childSearchQuery])

  // 既存の子どもを選択
  const handleSelectChild = (child: ExistingChild) => {
    setSelectedChild(child)
    setIsNewChild(false)
    setShowChildSelector(false)
    setFormData(prev => ({
      ...prev,
      name: child.name,
      furigana: child.furigana || '',
      grade: child.grade,
      gender: child.gender,
      height: child.height || '',
      weight: child.weight || ''
    }))
  }

  // 新規の子どもとして入力
  const handleNewChild = () => {
    setSelectedChild(null)
    setIsNewChild(true)
    setShowChildSelector(false)
    setFormData({
      name: '',
      furigana: '',
      grade: '',
      gender: '',
      height: '',
      weight: '',
      gripRight: '',
      gripLeft: '',
      jump: '',
      dash: '',
      dashInputType: '15m',
      doublejump: '',
      squat: '',
      sidestep: '',
      throw: '',
      ballType: '',
      ballWeight: ''
    })
  }

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    setIsLoading(true)

    try {
      // 保護者同意チェック
      if (!consentChecked) {
        alert('個人情報の取り扱いに同意してください')
        setIsLoading(false)
        return
      }

      // バリデーション（7項目すべて必須 + ボール種類と重量）
      const required = ['name', 'furigana', 'grade', 'gender', 'height', 'weight', 'gripRight', 'gripLeft', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw', 'ballType', 'ballWeight']
      for (const field of required) {
        if (!formData[field as keyof FormData]) {
          alert('基本情報と測定項目（7項目すべて）を入力してください')
          setIsLoading(false)
          return
        }
      }

      const gripAvg = ((formData.gripRight as number) + (formData.gripLeft as number)) / 2

      // ダッシュタイムの処理：50m入力の場合は15mに変換
      let dash15m = formData.dash as number
      if (formData.dashInputType === '50m') {
        dash15m = estimate15mTime(formData.dash as number, formData.grade)
      }

      // ボール投げの補正（9cmソフトボール基準に換算）
      // 大きいボールで投げた距離に補正係数を掛けて、ソフトボール換算の飛距離に変換
      const ballSizeCorrection = ballTypes[formData.ballType as '9' | '16' | '20' | '22' | '24'].correction
      // ボール重量の補正も適用
      const ballWeightCorrection = ballWeightCorrections[formData.ballWeight as '500g' | '1kg' | '2kg' | '3kg'].correction
      // 両方の補正を掛け合わせる
      const correctedThrow = Math.round((formData.throw as number) * ballSizeCorrection * ballWeightCorrection * 10) / 10

      // 診断ロジック実行（詳細モードで計算）
      const diagnosisResult = runDiagnosis(
        formData.grade,
        formData.gender as 'male' | 'female',
        {
          gripAvg,
          jump: formData.jump as number,
          dash: dash15m,  // 15m換算値を使用
          doublejump: formData.doublejump as number,
          squat: formData.squat as number,
          sidestep: formData.sidestep as number,
          throw: correctedThrow  // 補正後の値を使用
        },
        'detail'
      )

      // トレーニングデータ取得
      const isYoung = ['k5', '1', '2'].includes(formData.grade)
      const ageGroup = isYoung ? 'young' : 'old'

      const { data: trainings } = await supabase
        .from('trainings')
        .select('*')
        .eq('age_group', ageGroup)
        .order('ability_key')
        .order('sort_order')

      // トレーニングメニュー選定
      const sorted = Object.entries(diagnosisResult.scores).sort((a, b) => a[1] - b[1])
      const selectedTrainings: Array<{
        name: string
        description: string
        reps: string
        effect: string
        category: string
        priority: string
      }> = []

      for (let i = 0; i < Math.min(2, sorted.length); i++) {
        const [key] = sorted[i]
        const matchingTrainings = (trainings || []).filter(
          t => t.ability_key === key
        )
        matchingTrainings.slice(0, 2).forEach((t, idx) => {
          selectedTrainings.push({
            name: t.name,
            description: t.description || '',
            reps: t.reps || '',
            effect: t.effect || '',
            category: categories[t.ability_key],
            priority: i === 0 && idx === 0 ? 'high' : 'medium'
          })
        })
      }

      // 1. 児童データ保存（既存の子どもを選択した場合は新規作成しない）
      let childId: string

      if (selectedChild && !isNewChild) {
        // 既存の子どもの場合、新しい測定用に新規childrenレコードを作成
        // （同じ子でも測定ごとに学年・身長・体重が変わるため）
        console.log('既存の子どもで新規測定:', selectedChild.name, selectedChild.id)

        const { data: childData, error: childError } = await supabase
          .from('children')
          .insert({
            store_id: store.id,
            name: selectedChild.name,
            furigana: selectedChild.furigana,
            gender: selectedChild.gender,
            grade: formData.grade,
            height: formData.height,
            weight: formData.weight
          })
          .select()
          .single()

        if (childError) {
          console.error('児童データ作成エラー:', childError)
          throw childError
        }
        childId = childData.id
        console.log('新規児童ID:', childId)
      } else {
        // 新規の子どもの場合
        const { data: childData, error: childError } = await supabase
          .from('children')
          .insert({
            store_id: store.id,
            name: formData.name,
            furigana: formData.furigana,
            gender: formData.gender,
            grade: formData.grade,
            height: formData.height,
            weight: formData.weight
          })
          .select()
          .single()

        if (childError) throw childError
        childId = childData.id
      }

      // 2. 測定データ保存（modeは'detail'で保存、出力時に選択可能）
      const { data: measurementData, error: measurementError } = await supabase
        .from('measurements')
        .insert({
          child_id: childId,
          store_id: store.id,
          mode: 'detail',
          grip_right: formData.gripRight,
          grip_left: formData.gripLeft,
          jump: formData.jump,
          dash: dash15m,  // 15m換算値を保存
          doublejump: formData.doublejump,
          squat: formData.squat,
          sidestep: formData.sidestep,
          throw: correctedThrow,  // 補正後の値を保存
          ball_type: formData.ballType,
          ball_weight: formData.ballWeight
        })
        .select()
        .single()

      if (measurementError) {
        console.error('測定データ保存エラー:', measurementError)
        throw measurementError
      }
      console.log('測定データ保存成功:', measurementData.id)

      // 3. 診断結果保存
      const { error: resultError } = await supabase
        .from('results')
        .insert({
          measurement_id: measurementData.id,
          motor_age: diagnosisResult.motorAge,
          motor_age_diff: diagnosisResult.motorAgeDiff,
          type_name: diagnosisResult.type.name,
          type_description: diagnosisResult.type.desc,
          class_level: diagnosisResult.classLevel,
          weakness_class: diagnosisResult.weaknessClass.name,
          scores: diagnosisResult.scores,
          recommended_sports: diagnosisResult.sportsAptitude.slice(0, 6),
          recommended_trainings: selectedTrainings,
          goals: diagnosisResult.goals
        })

      if (resultError) {
        console.error('診断結果保存エラー:', resultError)
        throw resultError
      }
      console.log('診断結果保存成功')

      // 店舗トップページへ遷移
      router.push(`/store/${slug}`)
    } catch (err) {
      console.error('保存エラー:', err)
      alert('保存中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-600">店舗が見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-6 px-3 xs:px-4">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <Link href={`/store/${slug}`} className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-4 text-sm xs:text-base">
          ← トップに戻る
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="text-white p-4 xs:p-6 bg-gradient-to-r from-blue-800 to-blue-900">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 bg-white/20 rounded">NOBISHIRO KIDS</span>
                </div>
                <h1 className="text-lg xs:text-xl font-bold tracking-wider">新規測定入力</h1>
                <p className="text-xs xs:text-sm opacity-80 mt-1">{store.name} - 7項目すべて入力してください</p>
              </div>
            </div>
          </div>

          {/* 対象者選択セクション */}
          {existingChildren.length > 0 && (
            <div className="p-4 xs:p-7 bg-blue-50 border-b border-blue-200">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 mb-4">
                <h2 className="text-sm font-bold text-blue-900 pl-3 border-l-4 border-blue-600">対象者選択</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChildSelector(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                      !isNewChild
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <FaHistory /> 既存の子どもから選択
                  </button>
                  <button
                    type="button"
                    onClick={handleNewChild}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                      isNewChild
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
                    }`}
                  >
                    <FaUserPlus /> 新規入力
                  </button>
                </div>
              </div>

              {/* 選択された子どもの表示 */}
              {selectedChild && !isNewChild && (
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      selectedChild.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                    }`}>
                      {selectedChild.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{selectedChild.name}</div>
                      <div className="text-sm text-gray-500">{selectedChild.furigana}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        過去{selectedChild.measurementCount}回測定
                        {selectedChild.lastMeasuredAt && (
                          <> • 最終: {new Date(selectedChild.lastMeasuredAt).toLocaleDateString('ja-JP')}</>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowChildSelector(true)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-all"
                    >
                      変更
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 基本情報 */}
          <div className="p-4 xs:p-7 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-bold text-blue-900 mb-4 pl-3 border-l-4 border-blue-600">基本情報</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 xs:gap-4">
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">氏名 *</label>
                <input
                  type="text"
                  placeholder="山田 太郎"
                  className={`w-full p-3 border border-gray-300 rounded-lg text-sm ${!isNewChild ? 'bg-gray-100' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isNewChild}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">フリガナ *</label>
                <input
                  type="text"
                  placeholder="ヤマダ タロウ"
                  className={`w-full p-3 border border-gray-300 rounded-lg text-sm ${!isNewChild ? 'bg-gray-100' : ''}`}
                  value={formData.furigana}
                  onChange={(e) => handleChange('furigana', e.target.value)}
                  disabled={!isNewChild}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">学年 *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                >
                  <option value="">選択</option>
                  <option value="k5">年長</option>
                  <option value="1">小学1年生</option>
                  <option value="2">小学2年生</option>
                  <option value="3">小学3年生</option>
                  <option value="4">小学4年生</option>
                  <option value="5">小学5年生</option>
                  <option value="6">小学6年生</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">性別 *</label>
                <select
                  className={`w-full p-3 border border-gray-300 rounded-lg text-sm ${!isNewChild ? 'bg-gray-100' : ''}`}
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  disabled={!isNewChild}
                >
                  <option value="">選択</option>
                  <option value="male">男子</option>
                  <option value="female">女子</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">身長 (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="135.5"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.height}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value) || '')}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">体重 (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="32.5"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')}
                />
              </div>
            </div>
          </div>

          {/* 測定データ（7項目すべて） */}
          <div className="p-4 xs:p-7">
            <h2 className="text-sm font-bold text-blue-900 mb-4 pl-3 border-l-4 border-blue-600">
              測定データ（7項目）
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4">
              {/* 握力 */}
              <MeasurementCard icon="筋" title="握力" category="筋力">
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-xs min-w-[18px]">右</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="18.5"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.gripRight}
                    onChange={(e) => handleChange('gripRight', parseFloat(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">kg</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs min-w-[18px]">左</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="17.0"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.gripLeft}
                    onChange={(e) => handleChange('gripLeft', parseFloat(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">kg</span>
                </div>
              </MeasurementCard>

              {/* 立ち幅跳び */}
              <MeasurementCard icon="瞬" title="立ち幅跳び" category="瞬発力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="145"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.jump}
                    onChange={(e) => handleChange('jump', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </MeasurementCard>

              {/* ダッシュ（15m/50m切り替え） */}
              <MeasurementCard icon="速" title={formData.dashInputType === '15m' ? '15mダッシュ' : '50m走'} category="移動能力">
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleChange('dashInputType', '15m')}
                      className={`flex-1 py-1 px-2 text-xs font-bold rounded transition-all ${
                        formData.dashInputType === '15m'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      15m走
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('dashInputType', '50m')}
                      className={`flex-1 py-1 px-2 text-xs font-bold rounded transition-all ${
                        formData.dashInputType === '50m'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      50m走
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={formData.dashInputType === '15m' ? '3.65' : '9.50'}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      value={formData.dash}
                      onChange={(e) => handleChange('dash', parseFloat(e.target.value) || '')}
                    />
                    <span className="text-xs text-gray-600">秒</span>
                  </div>
                  {formData.dashInputType === '50m' && (
                    <p className="text-[10px] text-gray-500">※ 50m走タイムは15m走に換算されます</p>
                  )}
                </div>
              </MeasurementCard>

              {/* 連続立ち幅跳び */}
              <MeasurementCard icon="連" title="連続立ち幅跳び（3回）" category="バランス">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="420"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.doublejump}
                    onChange={(e) => handleChange('doublejump', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </MeasurementCard>

              {/* 30秒スクワット */}
              <MeasurementCard icon="持" title="30秒スクワット" category="筋持久力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="25"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.squat}
                    onChange={(e) => handleChange('squat', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">回</span>
                </div>
              </MeasurementCard>

              {/* 反復横跳び */}
              <MeasurementCard icon="敏" title="反復横跳び" category="敏捷性">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="35"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.sidestep}
                    onChange={(e) => handleChange('sidestep', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">回</span>
                </div>
              </MeasurementCard>

              {/* ボール投げ */}
              <MeasurementCard icon="投" title="ボール投げ" category="投力">
                <div className="space-y-2">
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                    value={formData.ballType}
                    onChange={(e) => handleChange('ballType', e.target.value)}
                  >
                    <option value="">ボールの直径を選択</option>
                    <option value="9">{ballTypes['9'].label}</option>
                    <option value="16">{ballTypes['16'].label}</option>
                    <option value="20">{ballTypes['20'].label}</option>
                    <option value="22">{ballTypes['22'].label}</option>
                    <option value="24">{ballTypes['24'].label}</option>
                  </select>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                    value={formData.ballWeight}
                    onChange={(e) => handleChange('ballWeight', e.target.value)}
                  >
                    <option value="">ボールの重さを選択</option>
                    <option value="500g">{ballWeightCorrections['500g'].label}</option>
                    <option value="1kg">{ballWeightCorrections['1kg'].label}</option>
                    <option value="2kg">{ballWeightCorrections['2kg'].label}</option>
                    <option value="3kg">{ballWeightCorrections['3kg'].label}</option>
                  </select>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="18.5"
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      value={formData.throw}
                      onChange={(e) => handleChange('throw', parseFloat(e.target.value) || '')}
                    />
                    <span className="text-xs text-gray-600">m</span>
                  </div>
                </div>
              </MeasurementCard>
            </div>
          </div>

          {/* 保護者同意チェック */}
          <div className="p-4 xs:p-7 bg-blue-50 border-t border-blue-100">
            <h2 className="text-sm font-bold text-blue-900 mb-3 pl-3 border-l-4 border-blue-600">個人情報の取り扱いについて</h2>
            <div className="bg-white rounded-lg p-4 mb-4 text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto border border-gray-200">
              <p className="mb-2">
                当サービスでは、お子様の運動能力診断を行うため、以下の個人情報を収集・利用いたします。
              </p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>お子様の氏名、学年、性別</li>
                <li>身体測定データ（身長、体重）</li>
                <li>運動能力測定データ</li>
              </ul>
              <p className="mb-2">
                収集した個人情報は、運動能力診断サービスの提供、診断結果レポートの作成、
                お子様の成長記録の管理のみに使用し、第三者への提供は行いません。
              </p>
              <p>
                詳細は<a href="/privacy" target="_blank" className="text-blue-600 underline">プライバシーポリシー</a>をご確認ください。
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <span className="font-semibold text-blue-900">保護者として</span>、上記の個人情報の取り扱いに同意し、
                お子様の測定データを登録することに同意します。
              </span>
            </label>
          </div>

          {/* 送信ボタン */}
          <div className="p-4 xs:p-7 text-center bg-gray-50 border-t border-gray-200">
            <p className="text-xs xs:text-sm text-gray-600 mb-4">
              保存後、トップページで「サマリー出力」または「詳細出力」を選択できます
            </p>
            <button
              type="submit"
              disabled={isLoading || !consentChecked}
              className="w-full xs:w-auto px-8 xs:px-12 py-3 xs:py-4 text-sm xs:text-base font-bold text-white rounded-lg shadow-lg hover:transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-800 to-blue-900"
            >
              {isLoading ? '保存中...' : '測定データを保存'}
            </button>
            {!consentChecked && (
              <p className="text-xs text-red-500 mt-2">※ 個人情報の取り扱いに同意してください</p>
            )}
          </div>
        </form>
      </div>

      {/* 子ども選択モーダル */}
      {showChildSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b bg-blue-900 text-white rounded-t-xl flex items-center justify-between">
              <h3 className="text-lg font-bold">既存の子どもを選択</h3>
              <button
                onClick={() => setShowChildSelector(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* 検索バー */}
            <div className="p-4 border-b">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="名前で検索..."
                  value={childSearchQuery}
                  onChange={(e) => setChildSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {childSearchQuery && (
                  <button
                    onClick={() => setChildSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* 子どもリスト */}
            <div className="flex-1 overflow-y-auto">
              {filteredChildren.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {childSearchQuery ? (
                    <>
                      <p>「{childSearchQuery}」に一致する結果がありません</p>
                      <button
                        onClick={() => setChildSearchQuery('')}
                        className="text-blue-600 hover:underline text-sm mt-2"
                      >
                        検索をクリア
                      </button>
                    </>
                  ) : (
                    <p>既存の子どもデータがありません</p>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredChildren.map(child => (
                    <button
                      key={`${child.name}_${child.furigana}`}
                      onClick={() => handleSelectChild(child)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                        child.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {child.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900">{child.name}</div>
                        <div className="text-xs text-gray-500">{child.furigana}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{getGradeDisplay(child.grade)}</span>
                          <span>•</span>
                          <span>{child.gender === 'male' ? '男子' : '女子'}</span>
                          {child.measurementCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600">{child.measurementCount}回測定</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-blue-600 text-sm font-bold">選択</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={handleNewChild}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaUserPlus /> 新しい子どもとして入力
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 測定カードコンポーネント
function MeasurementCard({
  icon,
  title,
  category,
  children
}: {
  icon: string
  title: string
  category: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:border-blue-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[10px] text-gray-600">{category}</div>
        </div>
      </div>
      {children}
    </div>
  )
}
