'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Store, Training } from '@/lib/supabase'
import { runDiagnosis, averageData, categories } from '@/lib/diagnosis'
import DiagnosisForm from '@/components/DiagnosisForm'
import SimpleResult from '@/components/SimpleResult'
import DetailResult from '@/components/DetailResult'

type FormData = {
  name: string
  furigana: string
  grade: string
  gender: 'male' | 'female'
  height: number
  weight: number
  gripRight: number
  gripLeft: number
  jump: number
  dash: number
  doublejump?: number
  squat?: number
  sidestep?: number
  throw?: number
  mode: 'simple' | 'detail'
}

type DiagnosisResult = ReturnType<typeof runDiagnosis> & {
  formData: FormData
  trainings: Array<{
    name: string
    description: string
    reps: string
    effect: string
    category: string
    priority: string
  }>
}

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string

  const [store, setStore] = useState<Store | null>(null)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [diagnosisLoading, setDiagnosisLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DiagnosisResult | null>(null)

  // 店舗データとトレーニングデータの取得
  useEffect(() => {
    async function fetchData() {
      try {
        // 店舗データ取得
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .single()

        if (storeError) throw new Error('店舗が見つかりません')
        setStore(storeData)

        // トレーニングデータ取得
        const { data: trainingData, error: trainingError } = await supabase
          .from('trainings')
          .select('*')
          .order('ability_key')
          .order('sort_order')

        if (trainingError) throw trainingError
        setTrainings(trainingData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // 診断実行
  const handleSubmit = async (formData: FormData) => {
    if (!store) return

    setDiagnosisLoading(true)

    try {
      const gripAvg = (formData.gripRight + formData.gripLeft) / 2

      // 診断ロジック実行
      const diagnosisResult = runDiagnosis(
        formData.grade,
        formData.gender,
        {
          gripAvg,
          jump: formData.jump,
          dash: formData.dash,
          doublejump: formData.doublejump,
          squat: formData.squat,
          sidestep: formData.sidestep,
          throw: formData.throw
        },
        formData.mode
      )

      // トレーニングメニュー選定
      const isYoung = ['k5', '1', '2'].includes(formData.grade)
      const ageGroup = isYoung ? 'young' : 'old'
      const sorted = Object.entries(diagnosisResult.scores).sort((a, b) => a[1] - b[1])
      const selectedTrainings: DiagnosisResult['trainings'] = []

      for (let i = 0; i < Math.min(2, sorted.length); i++) {
        const [key] = sorted[i]
        const matchingTrainings = trainings.filter(
          t => t.ability_key === key && t.age_group === ageGroup
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

      // データベースに保存
      // 1. 児童データ保存
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

      // 2. 測定データ保存
      const { data: measurementData, error: measurementError } = await supabase
        .from('measurements')
        .insert({
          child_id: childData.id,
          store_id: store.id,
          mode: formData.mode,
          grip_right: formData.gripRight,
          grip_left: formData.gripLeft,
          jump: formData.jump,
          dash: formData.dash,
          doublejump: formData.doublejump || null,
          squat: formData.squat || null,
          sidestep: formData.sidestep || null,
          throw: formData.throw || null
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

      // 結果をセット
      setResult({
        ...diagnosisResult,
        formData,
        trainings: selectedTrainings
      })

      // 結果表示位置までスクロール
      setTimeout(() => {
        document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error('診断エラー:', err)
      alert('診断中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setDiagnosisLoading(false)
    }
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

  const avg = result ? averageData[result.formData.grade][result.formData.gender] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {!result ? (
          <DiagnosisForm
            store={store}
            onSubmit={handleSubmit}
            isLoading={diagnosisLoading}
          />
        ) : (
          <div id="result">
            {result.formData.mode === 'simple' ? (
              <SimpleResult
                store={store}
                child={{
                  name: result.formData.name,
                  furigana: result.formData.furigana,
                  grade: result.formData.grade,
                  gender: result.formData.gender,
                  height: result.formData.height,
                  weight: result.formData.weight
                }}
                measurements={{
                  gripAvg: (result.formData.gripRight + result.formData.gripLeft) / 2,
                  jump: result.formData.jump,
                  dash: result.formData.dash
                }}
                result={{
                  scores: result.scores,
                  motorAge: result.motorAge,
                  motorAgeDiff: result.motorAgeDiff,
                  type: result.type,
                  classLevel: result.classLevel
                }}
                averageData={avg!}
              />
            ) : (
              <DetailResult
                store={store}
                child={{
                  name: result.formData.name,
                  furigana: result.formData.furigana,
                  grade: result.formData.grade,
                  gender: result.formData.gender,
                  height: result.formData.height,
                  weight: result.formData.weight
                }}
                measurements={{
                  gripAvg: (result.formData.gripRight + result.formData.gripLeft) / 2,
                  gripRight: result.formData.gripRight,
                  gripLeft: result.formData.gripLeft,
                  jump: result.formData.jump,
                  dash: result.formData.dash,
                  doublejump: result.formData.doublejump!,
                  squat: result.formData.squat!,
                  sidestep: result.formData.sidestep!,
                  throw: result.formData.throw!
                }}
                result={{
                  scores: result.scores,
                  motorAge: result.motorAge,
                  motorAgeDiff: result.motorAgeDiff,
                  type: result.type,
                  classLevel: result.classLevel,
                  weaknessClass: result.weaknessClass,
                  sportsAptitude: result.sportsAptitude,
                  goals: result.goals
                }}
                trainings={result.trainings}
                averageData={avg!}
              />
            )}

            {/* 新しい診断ボタン */}
            <div className="text-center mt-8">
              <button
                onClick={() => setResult(null)}
                className="px-8 py-4 bg-white text-blue-900 font-bold rounded-lg shadow-lg hover:transform hover:-translate-y-1 transition-all"
              >
                新しい診断を行う
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
