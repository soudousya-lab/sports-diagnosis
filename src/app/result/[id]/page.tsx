'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { averageData, getGradeDisplay, categories, developmentAdvice, getGrade } from '@/lib/diagnosis'
import RadarChart from '@/components/RadarChart'

type MeasurementData = {
  id: string
  measured_at: string
  mode: 'simple' | 'detail'
  grip_right: number
  grip_left: number
  jump: number
  dash: number
  doublejump: number | null
  squat: number | null
  sidestep: number | null
  throw: number | null
  children: {
    id: string
    name: string
    furigana: string
    grade: string
    gender: 'male' | 'female'
    height: number
    weight: number
  }
  results: {
    motor_age: number
    motor_age_diff: number
    type_name: string
    type_description: string
    class_level: string
    weakness_class: string
    scores: Record<string, number>
    recommended_sports: Array<{ name: string; icon: string; aptitude: number }>
    recommended_trainings: Array<{
      name: string
      description: string
      reps: string
      effect: string
      category: string
      priority: string
    }>
    goals: Record<string, number>
  }[]
  stores: {
    name: string
    theme_color: string
  }
}

// 詳細版デモ用のダミーデータ
const demoDetailData = {
  sportsAptitude: [
    { name: 'バスケットボール', icon: '🏀', aptitude: 7.3 },
    { name: 'バドミントン', icon: '🏸', aptitude: 7.3 },
    { name: 'サッカー', icon: '⚽', aptitude: 6.3 },
    { name: 'テニス', icon: '🎾', aptitude: 7.3 },
    { name: '陸上短距離', icon: '🏃', aptitude: 7.0 },
    { name: 'ダンス', icon: '💃', aptitude: 7.7 }
  ],
  goals: { grip: 15.8, jump: 154, dash: 3.54 },
  trainings: [
    { name: 'スクワット', description: '正しいフォームで', reps: '20回×3', effect: '筋持久力', category: '筋持久力', priority: 'high' },
    { name: 'ウォールシット', description: '壁で空気椅子', reps: '30秒×3', effect: '脚持久力', category: '筋持久力', priority: 'medium' }
  ]
}

export default function ResultPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const measurementId = params.id as string
  // URLパラメータからモードを取得（デフォルトはdetail）
  const viewMode = (searchParams.get('mode') as 'simple' | 'detail') || 'detail'

  const [data, setData] = useState<MeasurementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  // PDF出力（印刷機能）
  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // 測定データを取得
        const { data: measurementData, error: measurementError } = await supabase
          .from('measurements')
          .select('*')
          .eq('id', measurementId)
          .single()

        if (measurementError || !measurementData) {
          console.error('Measurement error:', measurementError)
          setError('測定データが見つかりません')
          setLoading(false)
          return
        }

        // 子供データを取得
        const { data: childData, error: childError } = await supabase
          .from('children')
          .select('*')
          .eq('id', measurementData.child_id)
          .single()

        if (childError) {
          console.error('Child error:', childError)
        }

        // 結果データを取得
        const { data: resultData, error: resultError } = await supabase
          .from('results')
          .select('*')
          .eq('measurement_id', measurementId)

        if (resultError) {
          console.error('Result error:', resultError)
        }

        // 店舗データを取得
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('name, theme_color')
          .eq('id', measurementData.store_id)
          .single()

        if (storeError) {
          console.error('Store error:', storeError)
        }

        // データを組み立てる
        const combinedData = {
          ...measurementData,
          children: childData,
          results: resultData || [],
          stores: storeData
        }

        console.log('Combined data:', combinedData)
        setData(combinedData as unknown as MeasurementData)
      } catch (err) {
        console.error('Fetch error:', err)
        setError('データの取得に失敗しました')
      }
      setLoading(false)
    }

    if (measurementId) {
      fetchData()
    }
  }, [measurementId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-600 mb-4">{error || 'データが見つかりません'}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  const child = data.children
  const result = data.results?.[0]
  const store = data.stores

  // データが不完全な場合のエラーハンドリング
  if (!child || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">データエラー</h1>
          <p className="text-gray-600 mb-4">診断結果のデータが不完全です</p>
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  const avg = averageData[child.grade]?.[child.gender]
  if (!avg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">データエラー</h1>
          <p className="text-gray-600 mb-4">学年・性別のデータが見つかりません</p>
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  const gripAvg = (data.grip_right + data.grip_left) / 2
  const actualAge = child.grade === 'k5' ? 6 : parseInt(child.grade) + 6
  const today = new Date(data.measured_at).toLocaleDateString('ja-JP')

  // 簡易版（サマリー表示）の場合 - URLパラメータのmodeで判定
  if (viewMode === 'simple') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-6 px-4 print:bg-white print:py-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 戻るボタン・PDF出力ボタン */}
          <div className="flex justify-between items-center print:hidden">
            <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white transition-colors">
              ← トップに戻る
            </Link>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white text-blue-900 font-bold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>🖨️</span> PDF出力
            </button>
          </div>

          {/* サマリー結果表示 */}
          <div ref={printRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
            {/* ヘッダー */}
            <div className="flex justify-between items-start p-6 border-b-4 border-blue-900">
              <div>
                <h1 className="text-xl text-blue-900 font-bold tracking-wider mb-1">運動能力診断レポート</h1>
                <div className="text-xs text-gray-600">Athletic Performance Assessment Report</div>
              </div>
              <div className="text-right text-xs text-gray-600">
                <div className="inline-block px-3 py-1 bg-blue-600 text-white font-bold rounded mb-1">サマリー</div>
                <div>測定日: {today}</div>
              </div>
            </div>

            {/* 被験者情報 */}
            <div className="bg-blue-50 border border-blue-200 p-4 m-6 rounded-lg flex justify-between items-center">
              <div className="text-xl font-bold text-blue-900">
                <span className="text-xs font-normal text-gray-600 block mb-1">{child.furigana}</span>
                {child.name} 様
              </div>
              <div className="text-xs text-gray-600 text-right leading-relaxed">
                {getGradeDisplay(child.grade)}（{actualAge}歳）・{child.gender === 'male' ? '男子' : '女子'}<br />
                身長 {child.height}cm ／ 体重 {child.weight}kg
              </div>
            </div>

            {/* 運動器年齢 */}
            <div className="flex gap-6 items-center p-5 bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-500 rounded-lg mx-6 mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0">
                <span className="text-[9px] opacity-90">運動器年齢</span>
                <span className="text-4xl font-extrabold">{Math.round(result.motor_age)}</span>
                <span className="text-sm">歳</span>
              </div>
              <div className="text-sm leading-relaxed">
                実年齢 <span className="text-lg font-extrabold text-blue-900">{actualAge}歳</span> に対して、運動器年齢は
                <span className={`text-lg font-extrabold ${result.motor_age_diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.motor_age_diff >= 0 ? '+' : ''}{result.motor_age_diff.toFixed(1)}歳
                </span> です。
              </div>
            </div>

            {/* 運動タイプ */}
            <div className="mx-6 mb-6 border-4 border-blue-900 p-5 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="text-xs text-gray-600 mb-2">運動タイプ診断結果</div>
              <div className="text-2xl font-extrabold text-blue-900 mb-3 tracking-wider">{result.type_name}</div>
              <div className="text-sm leading-relaxed">{result.type_description}</div>
            </div>

            {/* クラス判定 */}
            <div className="mx-6 mb-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-600 rounded-lg p-5">
              <h3 className="text-base font-bold text-green-600 mb-4 text-center">おすすめクラス</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['beginner', 'standard', 'expert'] as const).map(level => (
                  <div
                    key={level}
                    className={`bg-white rounded-lg p-4 text-center border-2 ${
                      result.class_level === level ? 'border-green-600 shadow-lg' : 'border-transparent'
                    }`}
                  >
                    <div className="text-sm font-bold text-blue-900 mb-2">
                      {level === 'beginner' ? 'ビギナー' : level === 'standard' ? 'スタンダード' : 'エキスパート'}
                    </div>
                    {result.class_level === level && (
                      <span className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-[9px] font-semibold rounded-full">
                        おすすめ
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 詳細版への誘導 */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center print:hidden">
            <h2 className="text-2xl font-bold mb-3">詳細診断をすると、もっと詳しくわかります！</h2>
            <p className="opacity-90 mb-2 text-lg">適性スポーツ、トレーニング提案、1ヶ月目標など</p>
          </div>

          {/* デモの詳細結果（大きく表示） */}
          <div className="relative print:hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/95 z-10 pointer-events-none" />
            <DetailDemoSection result={result} />
            <div className="absolute bottom-12 left-0 right-0 z-20 text-center">
              <p className="text-gray-700 font-bold mb-4 text-lg">↓ 詳細診断で全ての結果が見られます ↓</p>
              <Link
                href="/"
                className="inline-block px-10 py-5 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-700 transition-all"
              >
                トップページで「詳細出力」を選択
              </Link>
            </div>
          </div>

          {/* 戻るボタン */}
          <div className="text-center pt-4 print:hidden">
            <Link href="/" className="inline-block px-6 py-3 bg-white text-blue-900 font-bold rounded-lg shadow hover:shadow-lg transition-all">
              トップに戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 詳細版（フル結果表示）の場合
  const devAdv = developmentAdvice[child.grade]
  const allKeys = ['grip', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw']
  const allLabels = ['筋力', '瞬発力', '移動能力', 'バランス', '筋持久力', '敏捷性', '投力']

  const measurementItems = [
    { key: 'grip', name: '握力', cat: '筋力', val: `${gripAvg.toFixed(1)}kg`, avg: `${avg.grip}kg` },
    { key: 'jump', name: '立ち幅跳び', cat: '瞬発力', val: `${data.jump}cm`, avg: `${avg.jump}cm` },
    { key: 'dash', name: '15mダッシュ', cat: '移動能力', val: `${data.dash}秒`, avg: `${avg.dash}秒` },
    { key: 'doublejump', name: '連続立ち幅跳び', cat: 'バランス', val: `${data.doublejump}cm`, avg: `${avg.doublejump}cm` },
    { key: 'squat', name: '30秒スクワット', cat: '筋持久力', val: `${data.squat}回`, avg: `${avg.squat}回` },
    { key: 'sidestep', name: '反復横跳び', cat: '敏捷性', val: `${data.sidestep}回`, avg: `${avg.sidestep}回` },
    { key: 'throw', name: 'ボール投げ', cat: '投力', val: `${data.throw}m`, avg: `${avg.throw}m` }
  ]

  const sorted = Object.entries(result.scores).sort((a, b) => a[1] - b[1])
  const weakestKey = sorted[0][0]
  const strongestKey = sorted[sorted.length - 1][0]
  const est50m = (data.dash * 3 + 1.2).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-6 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 戻るボタン・PDF出力ボタン */}
        <div className="flex justify-between items-center print:hidden">
          <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white transition-colors">
            ← トップに戻る
          </Link>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white text-blue-900 font-bold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>🖨️</span> PDF出力
          </button>
        </div>

        {/* ページ1: 基本結果 */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
          {/* ヘッダー */}
          <div className="flex justify-between items-start p-6 border-b-4 border-blue-900">
            <div>
              <h1 className="text-xl text-blue-900 font-bold tracking-wider mb-1">運動能力診断レポート</h1>
              <div className="text-xs text-gray-600">Athletic Performance Assessment Report</div>
            </div>
            <div className="text-right text-xs text-gray-600">
              <div className="inline-block px-3 py-1 bg-green-600 text-white font-bold rounded mb-1">詳細診断</div>
              <div>測定日: {today}</div>
            </div>
          </div>

          {/* 被験者情報 */}
          <div className="bg-blue-50 border border-blue-200 p-4 m-6 rounded-lg flex justify-between items-center">
            <div className="text-xl font-bold text-blue-900">
              <span className="text-xs font-normal text-gray-600 block mb-1">{child.furigana}</span>
              {child.name} 様
            </div>
            <div className="text-xs text-gray-600 text-right leading-relaxed">
              {getGradeDisplay(child.grade)}（{actualAge}歳）・{child.gender === 'male' ? '男子' : '女子'}<br />
              身長 {child.height}cm ／ 体重 {child.weight}kg
            </div>
          </div>

          {/* 運動器年齢 */}
          <div className="flex gap-6 items-center p-5 bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-500 rounded-lg mx-6 mb-6">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0">
              <span className="text-[9px] opacity-90">運動器年齢</span>
              <span className="text-4xl font-extrabold">{Math.round(result.motor_age)}</span>
              <span className="text-sm">歳</span>
            </div>
            <div className="text-sm leading-relaxed">
              実年齢 <span className="text-lg font-extrabold text-blue-900">{actualAge}歳</span> に対して、運動器年齢は
              <span className={`text-lg font-extrabold ${result.motor_age_diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.motor_age_diff >= 0 ? '+' : ''}{result.motor_age_diff.toFixed(1)}歳
              </span> です。<br /><br />
              {result.motor_age_diff >= 1
                ? '運動能力が同年代より優れています。この調子で様々な運動にチャレンジしましょう。'
                : result.motor_age_diff >= -1
                  ? '年齢相応の運動能力です。継続的な運動で更に伸ばせます。'
                  : '運動能力向上の余地があります。下記のトレーニングを参考にしてください。'
              }
            </div>
          </div>

          {/* 測定結果（7項目） */}
          <div className="mx-6 mb-6">
            <div className="text-sm font-bold text-white bg-blue-900 px-4 py-2 rounded mb-3">
              測定結果と10段階評価（7項目）
            </div>
            <div className="flex gap-5 flex-col md:flex-row">
              <div className="w-full md:w-56 flex-shrink-0">
                <RadarChart scores={result.scores} keys={allKeys} labels={allLabels} />
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="border border-gray-200 bg-blue-900 text-white p-2">測定項目</th>
                      <th className="border border-gray-200 bg-blue-900 text-white p-2">カテゴリ</th>
                      <th className="border border-gray-200 bg-blue-900 text-white p-2">測定値</th>
                      <th className="border border-gray-200 bg-blue-900 text-white p-2">平均</th>
                      <th className="border border-gray-200 bg-blue-900 text-white p-2">評点</th>
                      <th className="border border-gray-200 bg-blue-900 text-white p-2">判定</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurementItems.map(item => {
                      const grade = getGrade(result.scores[item.key])
                      return (
                        <tr key={item.key}>
                          <td className="border border-gray-200 p-2 font-semibold bg-gray-50">{item.name}</td>
                          <td className="border border-gray-200 p-2 text-center">{item.cat}</td>
                          <td className="border border-gray-200 p-2 text-center font-bold">{item.val}</td>
                          <td className="border border-gray-200 p-2 text-center">{item.avg}</td>
                          <td className="border border-gray-200 p-2 text-center text-base font-extrabold">{result.scores[item.key]}</td>
                          <td className={`border border-gray-200 p-2 text-center font-extrabold ${grade.colorClass}`}>{grade.grade}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 運動タイプ */}
          <div className="mx-6 mb-6 border-4 border-blue-900 p-5 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="text-xs text-gray-600 mb-2">運動タイプ診断結果</div>
            <div className="text-2xl font-extrabold text-blue-900 mb-3 tracking-wider">{result.type_name}</div>
            <div className="text-sm leading-relaxed">{result.type_description}</div>
          </div>

          {/* クラス判定 */}
          <div className="mx-6 mb-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-600 rounded-lg p-5">
            <h3 className="text-base font-bold text-green-600 mb-4 text-center">クラス判定結果</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['beginner', 'standard', 'expert'] as const).map(level => (
                <div
                  key={level}
                  className={`bg-white rounded-lg p-4 text-center border-2 ${
                    result.class_level === level ? 'border-green-600 shadow-lg' : 'border-transparent'
                  }`}
                >
                  <div className="text-sm font-bold text-blue-900 mb-2">
                    {level === 'beginner' ? 'ビギナー' : level === 'standard' ? 'スタンダード' : 'エキスパート'}
                  </div>
                  {result.class_level === level && (
                    <span className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-[9px] font-semibold rounded-full">
                      現在のレベル
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ページ2: トレーニング＆適性スポーツ */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex justify-between items-start p-6 border-b-4 border-blue-900">
            <div>
              <h1 className="text-xl text-blue-900 font-bold tracking-wider mb-1">トレーニング＆適性スポーツ</h1>
              <div className="text-xs text-gray-600">Training & Sports Aptitude</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">
            {/* 左列 */}
            <div>
              {/* 強み・弱み分析 */}
              <div className="text-sm font-bold text-white bg-blue-900 px-4 py-2 rounded mb-3">
                強み・弱み分析
              </div>
              <div className="border border-gray-200 p-4 rounded-lg text-sm leading-relaxed mb-4">
                <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-[9px] font-bold rounded mb-2">課題項目</span>
                <h4 className="text-blue-900 font-bold mb-2">{categories[weakestKey]}（評点：{result.scores[weakestKey]}）</h4>
                <p className="text-xs mb-4">この項目を重点的に強化することで、総合的な運動能力の向上が期待できます。</p>

                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-[9px] font-bold rounded mb-2">優位項目</span>
                <h4 className="text-blue-900 font-bold mb-2">{categories[strongestKey]}（評点：{result.scores[strongestKey]}）</h4>
                <p className="text-xs">この強みを活かせるスポーツで、更なる成長と自信につながります。</p>
              </div>

              {/* スポーツテスト予測 */}
              <div className="text-sm font-bold text-white bg-blue-900 px-4 py-2 rounded mb-3">
                スポーツテスト予測
              </div>
              <div className="border border-gray-200 p-4 rounded-lg mb-4">
                <p className="text-sm mb-3">50m走予測タイム: <strong className="text-lg">{est50m}秒</strong></p>
              </div>

              {/* 適性スポーツTOP6 */}
              <div className="text-sm font-bold text-white bg-blue-900 px-4 py-2 rounded mb-3">
                適性スポーツ TOP6
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <div className="text-[10px] font-semibold text-gray-600 mb-1">◎ 特に適性が高い</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.recommended_sports?.slice(0, 3).map(sport => (
                    <span key={sport.name} className="inline-block px-3 py-1 bg-yellow-500 text-gray-800 rounded-full text-xs font-medium">
                      {sport.icon} {sport.name}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] font-semibold text-gray-600 mb-1">○ 適性あり</div>
                <div className="flex flex-wrap gap-2">
                  {result.recommended_sports?.slice(3, 6).map(sport => (
                    <span key={sport.name} className="inline-block px-3 py-1 bg-blue-900 text-white rounded-full text-xs font-medium">
                      {sport.icon} {sport.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 右列 */}
            <div>
              {/* 重点トレーニング */}
              <div className="text-sm font-bold text-white bg-blue-900 px-4 py-2 rounded mb-3">
                重点トレーニング
              </div>
              <div className="bg-yellow-50 border border-yellow-500 px-3 py-2 mb-3 rounded text-xs text-orange-700 font-bold text-center">
                ※お子さんと一緒にやってあげてください
              </div>
              <div className="border border-gray-200 p-4 rounded-lg mb-4">
                <ul className="space-y-4">
                  {result.recommended_trainings?.map((t, i) => (
                    <li key={i} className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                      <span className="w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                        {i + 1}
                      </span>
                      <div className="flex-1 text-[10px]">
                        <strong className="text-sm block mb-1">{t.name}</strong>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          t.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.category}
                        </span>
                        <div className="mt-1">{t.description}</div>
                        <div className="text-blue-900 font-bold">{t.reps}</div>
                        <div className="text-gray-600">効果：{t.effect}</div>
                      </div>
                      {/* トレーニング画像 */}
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={`/trainings/${t.name.replace(/\s/g, '_')}.jpg`}
                          alt={t.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/trainings/placeholder.svg'
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 保護者の方へ（フル幅） */}
          <div className="mx-6 mb-6">
            <div className="text-sm font-bold text-white bg-blue-900 px-4 py-2 rounded mb-3">
              保護者の方へ
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-base font-bold text-blue-900 mb-3">【発達段階】{devAdv?.golden}</h4>
                  <p className="text-sm text-gray-700 mb-4">{devAdv?.focus}</p>
                  <h4 className="text-base font-bold text-blue-900 mb-3">【この時期のポイント】</h4>
                  <p className="text-sm text-gray-700 mb-4">{devAdv?.key}</p>
                  <h4 className="text-base font-bold text-red-600 mb-3">【注意点】</h4>
                  <p className="text-sm text-red-600">{devAdv?.avoid}</p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-900 mb-4 text-center">継続的なサポートのご案内</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    お子様の運動能力をさらに伸ばすために、定期的な測定と専門的なトレーニング指導をおすすめします。
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src="/qr/reservation.png"
                          alt="予約QRコード"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = '<span class="text-xs text-gray-400">QR準備中</span>'
                          }}
                        />
                      </div>
                      <p className="text-xs font-bold text-green-600">次回の測定を予約</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src="/qr/line.png"
                          alt="LINE QRコード"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = '<span class="text-xs text-gray-400">QR準備中</span>'
                          }}
                        />
                      </div>
                      <p className="text-xs font-bold text-[#06C755]">LINEで相談・質問</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    ※1ヶ月ごとの測定で成長を実感できます
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 1ヶ月目標 */}
          <div className="mx-6 mb-6 bg-blue-900 text-white p-4 rounded-lg">
            <h4 className="text-sm font-bold text-center mb-4">1ヶ月後の目標（毎日10分のトレーニングで達成可能）</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 p-3 rounded text-center">
                <div className="text-[9px] opacity-90">握力</div>
                <div className="text-[10px] opacity-70">現在 {gripAvg.toFixed(1)}kg</div>
                <div className="text-xl font-extrabold">{result.goals?.grip}kg</div>
              </div>
              <div className="bg-white/10 p-3 rounded text-center">
                <div className="text-[9px] opacity-90">立ち幅跳び</div>
                <div className="text-[10px] opacity-70">現在 {data.jump}cm</div>
                <div className="text-xl font-extrabold">{result.goals?.jump}cm</div>
              </div>
              <div className="bg-white/10 p-3 rounded text-center">
                <div className="text-[9px] opacity-90">15mダッシュ</div>
                <div className="text-[10px] opacity-70">現在 {data.dash}秒</div>
                <div className="text-xl font-extrabold">{result.goals?.dash}秒</div>
              </div>
            </div>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="text-center pt-4 print:hidden">
          <Link href="/" className="inline-block px-6 py-3 bg-white text-blue-900 font-bold rounded-lg shadow hover:shadow-lg transition-all">
            トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

// 詳細版デモセクション（サマリーページで使用）
function DetailDemoSection({ result }: { result: MeasurementData['results'][0] }) {
  // 実際の結果データがあれば使用、なければデモデータ
  const sportsData = result?.recommended_sports?.slice(0, 6) || demoDetailData.sportsAptitude
  const trainingsData = result?.recommended_trainings?.slice(0, 4) || demoDetailData.trainings
  const goalsData = result?.goals || demoDetailData.goals

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-8 border-b-4 border-green-600">
        <h2 className="text-2xl text-green-700 font-bold text-center">詳細診断で見られる内容</h2>
        <p className="text-gray-500 text-center mt-2">以下は実際の診断結果のプレビューです</p>
      </div>

      <div className="p-8">
        {/* 適性スポーツ */}
        <div className="mb-8">
          <div className="text-lg font-bold text-white bg-green-600 px-6 py-3 rounded-lg mb-4">
            適性スポーツ TOP6
          </div>
          <div className="border-2 border-gray-200 p-6 rounded-xl bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sportsData.map((sport, i) => (
                <div key={sport.name} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-3xl">{sport.icon}</span>
                  <div>
                    <div className="font-bold text-gray-800">{sport.name}</div>
                    <div className="text-sm text-green-600">適性度: {sport.aptitude?.toFixed(1) || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 重点トレーニング */}
        <div className="mb-8">
          <div className="text-lg font-bold text-white bg-green-600 px-6 py-3 rounded-lg mb-4">
            重点トレーニング提案
          </div>
          <div className="border-2 border-gray-200 p-6 rounded-xl bg-gray-50">
            <div className="grid md:grid-cols-2 gap-4">
              {trainingsData.map((t, i) => (
                <div key={i} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{t.name}</div>
                    <div className="text-sm text-gray-600">{t.description}</div>
                    <div className="text-sm text-green-600 font-semibold mt-1">{t.reps}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1ヶ月目標 */}
        <div>
          <div className="text-lg font-bold text-white bg-green-600 px-6 py-3 rounded-lg mb-4">
            1ヶ月後の目標
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-sm opacity-90 mb-1">握力</div>
                <div className="text-3xl font-extrabold">{goalsData.grip}kg</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-sm opacity-90 mb-1">立ち幅跳び</div>
                <div className="text-3xl font-extrabold">{goalsData.jump}cm</div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="text-sm opacity-90 mb-1">15mダッシュ</div>
                <div className="text-3xl font-extrabold">{goalsData.dash}秒</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
