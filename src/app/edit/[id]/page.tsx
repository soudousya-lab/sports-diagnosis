'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { runDiagnosis, categories } from '@/lib/diagnosis'

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
  doublejump: number | ''
  squat: number | ''
  sidestep: number | ''
  throw: number | ''
  ballType: '9' | '16' | '20' | '22' | '24' | ''
}

// ボール種類の定義（直径ベース、9cmソフトボールを基準に補正）
const ballTypes = {
  '9':  { label: '9cm（ソフトボール）', diameter: 9, correction: 1.0 },
  '16': { label: '16cm（ハンドボール）', diameter: 16, correction: 1.10 },
  '20': { label: '20cm（フットサルボール）', diameter: 20, correction: 1.18 },
  '22': { label: '22cm（バレーボール）', diameter: 22, correction: 1.22 },
  '24': { label: '24cm（バスケットボール）', diameter: 24, correction: 1.26 }
}

export default function EditMeasurementPage() {
  const router = useRouter()
  const params = useParams()
  const measurementId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [childId, setChildId] = useState<string>('')
  const [storeId, setStoreId] = useState<string>('')
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
    doublejump: '',
    squat: '',
    sidestep: '',
    throw: '',
    ballType: ''
  })

  // 既存データを取得
  useEffect(() => {
    async function fetchData() {
      try {
        // 測定データを取得
        const { data: measurement, error: measurementError } = await supabase
          .from('measurements')
          .select('*')
          .eq('id', measurementId)
          .single()

        if (measurementError || !measurement) {
          alert('測定データが見つかりません')
          router.push('/')
          return
        }

        setChildId(measurement.child_id)
        setStoreId(measurement.store_id)

        // 子供データを取得
        const { data: child, error: childError } = await supabase
          .from('children')
          .select('*')
          .eq('id', measurement.child_id)
          .single()

        if (childError || !child) {
          alert('子供データが見つかりません')
          router.push('/')
          return
        }

        // フォームにデータをセット
        setFormData({
          name: child.name || '',
          furigana: child.furigana || '',
          grade: child.grade || '',
          gender: child.gender || '',
          height: child.height || '',
          weight: child.weight || '',
          gripRight: measurement.grip_right || '',
          gripLeft: measurement.grip_left || '',
          jump: measurement.jump || '',
          dash: measurement.dash || '',
          doublejump: measurement.doublejump || '',
          squat: measurement.squat || '',
          sidestep: measurement.sidestep || '',
          throw: measurement.throw || '',
          ballType: measurement.ball_type || ''
        })
      } catch (error) {
        console.error('データ取得エラー:', error)
        alert('データの取得に失敗しました')
        router.push('/')
      } finally {
        setIsFetching(false)
      }
    }

    if (measurementId) {
      fetchData()
    }
  }, [measurementId, router])

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // バリデーション（7項目すべて必須 + ボール種類）
      const required = ['name', 'furigana', 'grade', 'gender', 'height', 'weight', 'gripRight', 'gripLeft', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw', 'ballType']
      for (const field of required) {
        if (!formData[field as keyof FormData]) {
          alert('基本情報と測定項目（7項目すべて）を入力してください')
          setIsLoading(false)
          return
        }
      }

      const gripAvg = ((formData.gripRight as number) + (formData.gripLeft as number)) / 2

      // 診断ロジック実行（詳細モードで計算）
      const diagnosisResult = runDiagnosis(
        formData.grade,
        formData.gender as 'male' | 'female',
        {
          gripAvg,
          jump: formData.jump as number,
          dash: formData.dash as number,
          doublejump: formData.doublejump as number,
          squat: formData.squat as number,
          sidestep: formData.sidestep as number,
          throw: formData.throw as number
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

      // 1. 児童データ更新
      const { error: childError } = await supabase
        .from('children')
        .update({
          name: formData.name,
          furigana: formData.furigana,
          gender: formData.gender,
          grade: formData.grade,
          height: formData.height,
          weight: formData.weight
        })
        .eq('id', childId)

      if (childError) throw childError

      // 2. 測定データ更新
      const { error: measurementError } = await supabase
        .from('measurements')
        .update({
          grip_right: formData.gripRight,
          grip_left: formData.gripLeft,
          jump: formData.jump,
          dash: formData.dash,
          doublejump: formData.doublejump,
          squat: formData.squat,
          sidestep: formData.sidestep,
          throw: formData.throw,
          ball_type: formData.ballType
        })
        .eq('id', measurementId)

      if (measurementError) throw measurementError

      // 3. 既存の診断結果を削除して新規作成
      await supabase.from('results').delete().eq('measurement_id', measurementId)

      const { error: resultError } = await supabase
        .from('results')
        .insert({
          measurement_id: measurementId,
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

      if (resultError) throw resultError

      // トップページへ遷移
      router.push('/?updated=true')
    } catch (err) {
      console.error('更新エラー:', err)
      alert('更新中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-6 px-3 xs:px-4">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-4 text-sm xs:text-base">
          ← トップに戻る
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="text-white p-4 xs:p-6 bg-gradient-to-r from-yellow-600 to-yellow-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg xs:text-xl font-bold tracking-wider">測定データ編集</h1>
                <p className="text-xs xs:text-sm opacity-80 mt-1">データを修正して保存してください</p>
              </div>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="p-4 xs:p-7 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-bold text-blue-900 mb-4 pl-3 border-l-4 border-blue-600">基本情報</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 xs:gap-4">
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">氏名 *</label>
                <input
                  type="text"
                  placeholder="山田 太郎"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">フリガナ *</label>
                <input
                  type="text"
                  placeholder="ヤマダ タロウ"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.furigana}
                  onChange={(e) => handleChange('furigana', e.target.value)}
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
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
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

              {/* 15mダッシュ */}
              <MeasurementCard icon="速" title="15mダッシュ" category="移動能力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="3.65"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.dash}
                    onChange={(e) => handleChange('dash', parseFloat(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">秒</span>
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
                <div className="flex gap-2 items-center mb-2">
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
                <div>
                  <label className="block mb-1 text-gray-500 text-[10px]">ボールサイズ</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={formData.ballType}
                    onChange={(e) => handleChange('ballType', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="9">{ballTypes['9'].label}</option>
                    <option value="16">{ballTypes['16'].label}</option>
                    <option value="20">{ballTypes['20'].label}</option>
                    <option value="22">{ballTypes['22'].label}</option>
                    <option value="24">{ballTypes['24'].label}</option>
                  </select>
                </div>
              </MeasurementCard>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="p-4 xs:p-7 text-center bg-gray-50 border-t border-gray-200">
            <p className="text-xs xs:text-sm text-gray-600 mb-4">
              更新後、トップページで「サマリー出力」または「詳細出力」を選択できます
            </p>
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center">
              <Link
                href="/"
                className="w-full xs:w-auto px-6 xs:px-8 py-3 xs:py-4 text-sm xs:text-base font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all text-center"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full xs:w-auto px-8 xs:px-12 py-3 xs:py-4 text-sm xs:text-base font-bold text-white rounded-lg shadow-lg hover:transform hover:-translate-y-1 transition-all disabled:opacity-50 bg-gradient-to-r from-yellow-600 to-yellow-700"
              >
                {isLoading ? '更新中...' : '変更を保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
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
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:border-yellow-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
