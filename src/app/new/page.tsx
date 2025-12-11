'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
}

export default function NewMeasurementPage() {
  const router = useRouter()
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [mode, setMode] = useState<'simple' | 'detail'>('simple')
  const [isLoading, setIsLoading] = useState(false)
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
    throw: ''
  })

  const handleModeSelect = (selectedMode: 'simple' | 'detail') => {
    setMode(selectedMode)
    setStep('form')
  }

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // バリデーション
      const required = ['name', 'furigana', 'grade', 'gender', 'height', 'weight', 'gripRight', 'gripLeft', 'jump', 'dash']
      for (const field of required) {
        if (!formData[field as keyof FormData]) {
          alert('基本情報と測定項目をすべて入力してください')
          setIsLoading(false)
          return
        }
      }

      if (mode === 'detail') {
        const detailRequired = ['doublejump', 'squat', 'sidestep', 'throw']
        for (const field of detailRequired) {
          if (!formData[field as keyof FormData]) {
            alert('7項目測定の項目をすべて入力してください')
            setIsLoading(false)
            return
          }
        }
      }

      const gripAvg = ((formData.gripRight as number) + (formData.gripLeft as number)) / 2

      // 診断ロジック実行
      const diagnosisResult = runDiagnosis(
        formData.grade,
        formData.gender as 'male' | 'female',
        {
          gripAvg,
          jump: formData.jump as number,
          dash: formData.dash as number,
          doublejump: formData.doublejump as number || undefined,
          squat: formData.squat as number || undefined,
          sidestep: formData.sidestep as number || undefined,
          throw: formData.throw as number || undefined
        },
        mode
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

      // デフォルト店舗IDを取得（最初の店舗を使用）
      const { data: stores } = await supabase.from('stores').select('id').limit(1)
      const storeId = stores?.[0]?.id

      if (!storeId) {
        alert('店舗が設定されていません')
        setIsLoading(false)
        return
      }

      // 1. 児童データ保存
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          store_id: storeId,
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

      // 2. 測定データ保存
      const { data: measurementData, error: measurementError } = await supabase
        .from('measurements')
        .insert({
          child_id: childData.id,
          store_id: storeId,
          mode: mode,
          grip_right: formData.gripRight,
          grip_left: formData.gripLeft,
          jump: formData.jump,
          dash: formData.dash,
          doublejump: mode === 'detail' ? formData.doublejump : null,
          squat: mode === 'detail' ? formData.squat : null,
          sidestep: mode === 'detail' ? formData.sidestep : null,
          throw: mode === 'detail' ? formData.throw : null
        })
        .select()
        .single()

      if (measurementError) throw measurementError

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

      if (resultError) throw resultError

      // 結果ページへ遷移
      router.push(`/result/${measurementData.id}`)
    } catch (err) {
      console.error('診断エラー:', err)
      alert('診断中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  // モード選択画面
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">新規測定</h1>
            <p className="text-blue-200">測定項目数を選択してください</p>
          </div>

          <div className="grid gap-6">
            {/* 3項目測定 */}
            <button
              onClick={() => handleModeSelect('simple')}
              className="bg-white rounded-2xl shadow-2xl p-8 text-left hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">3項目測定</h2>
                  <p className="text-gray-500">基本的な運動能力を診断</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">測定項目</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">握力</span>
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">立ち幅跳び</span>
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">15mダッシュ</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                運動器年齢、運動タイプ、おすすめクラスがわかります
              </p>
            </button>

            {/* 7項目測定 */}
            <button
              onClick={() => handleModeSelect('detail')}
              className="bg-white rounded-2xl shadow-2xl p-8 text-left hover:scale-[1.02] transition-transform border-4 border-green-500"
            >
              <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                おすすめ
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-600">7</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900">7項目測定</h2>
                  <p className="text-gray-500">詳細な運動能力診断</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-900 mb-2">測定項目</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">握力</span>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">立ち幅跳び</span>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">15mダッシュ</span>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">連続立ち幅跳び</span>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">30秒スクワット</span>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">反復横跳び</span>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">ボール投げ</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                適性スポーツ、トレーニング提案、1ヶ月目標まで詳しくわかります
              </p>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-200 hover:text-white transition-colors"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 入力フォーム画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className={`text-white p-6 ${mode === 'detail' ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-blue-800 to-blue-900'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold tracking-wider">
                  {mode === 'detail' ? '7項目測定' : '3項目測定'}
                </h1>
                <p className="text-sm opacity-80 mt-1">
                  {mode === 'detail' ? '詳細な運動能力診断' : '基本的な運動能力診断'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-sm opacity-80 hover:opacity-100"
              >
                測定項目を変更
              </button>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="p-7 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-bold text-blue-900 mb-4 pl-3 border-l-4 border-blue-600">基本情報</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

          {/* 測定データ */}
          <div className="p-7">
            <h2 className="text-sm font-bold text-blue-900 mb-4 pl-3 border-l-4 border-blue-600">
              測定データ（{mode === 'detail' ? '7項目' : '3項目'}）
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

              {/* 詳細版のみの項目 */}
              {mode === 'detail' && (
                <>
                  <MeasurementCard icon="連" title="連続立ち幅跳び" category="バランス">
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        step="1"
                        placeholder="280"
                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                        value={formData.doublejump}
                        onChange={(e) => handleChange('doublejump', parseInt(e.target.value) || '')}
                      />
                      <span className="text-xs text-gray-600">cm</span>
                    </div>
                  </MeasurementCard>

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

                  <MeasurementCard icon="投" title="ボール投げ" category="投力">
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
                  </MeasurementCard>
                </>
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="p-7 text-center bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-12 py-4 text-base font-bold text-white rounded-lg shadow-lg hover:transform hover:-translate-y-1 transition-all disabled:opacity-50 ${
                mode === 'detail'
                  ? 'bg-gradient-to-r from-green-600 to-green-700'
                  : 'bg-gradient-to-r from-blue-800 to-blue-900'
              }`}
            >
              {isLoading ? '診断中...' : '診断を実行'}
            </button>
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
