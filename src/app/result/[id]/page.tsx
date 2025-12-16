'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { averageData, getGradeDisplay, categories, developmentAdvice, getGrade, sd, calcDeviation, deviationTo10Scale, determineType, getWeaknessClass, calcSportsAptitude } from '@/lib/diagnosis'
import RadarChart from '@/components/RadarChart'
import {
  FaTrophy, FaChartBar, FaBullseye, FaSearch, FaMedal, FaRunning,
  FaDumbbell, FaClipboardList, FaFileAlt, FaBook, FaLightbulb,
  FaExclamationTriangle, FaHandshake, FaCalendarAlt, FaComments,
  FaChartLine, FaSchool, FaPrint, FaUser, FaChild
} from 'react-icons/fa'

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

  // スコアを測定データから再計算（最新の平均値・標準偏差を使用）
  const recalculatedScores: Record<string, number> = {
    grip: deviationTo10Scale(calcDeviation(gripAvg, avg.grip, sd.grip)),
    jump: deviationTo10Scale(calcDeviation(data.jump, avg.jump, sd.jump)),
    dash: deviationTo10Scale(calcDeviation(data.dash, avg.dash, sd.dash, true)), // タイムは逆転
    doublejump: data.doublejump ? deviationTo10Scale(calcDeviation(data.doublejump, avg.doublejump, sd.doublejump)) : 5,
    squat: data.squat ? deviationTo10Scale(calcDeviation(data.squat, avg.squat, sd.squat)) : 5,
    sidestep: data.sidestep ? deviationTo10Scale(calcDeviation(data.sidestep, avg.sidestep, sd.sidestep)) : 5,
    throw: data.throw ? deviationTo10Scale(calcDeviation(data.throw, avg.throw, sd.throw)) : 5
  }

  // 再計算したスコアから運動タイプ・弱点・適性スポーツを再計算
  const recalculatedType = determineType(recalculatedScores)
  const recalculatedWeakness = getWeaknessClass(recalculatedScores)
  const recalculatedSportsAptitude = calcSportsAptitude(recalculatedScores)

  // 強調表示用のヘルパー関数
  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights || highlights.length === 0) return text
    let result = text
    highlights.forEach(h => {
      result = result.replace(h, `<strong class="text-blue-700 font-bold">${h}</strong>`)
    })
    return result
  }
  const today = new Date(data.measured_at).toLocaleDateString('ja-JP')

  // 簡易版（サマリー表示）の場合 - URLパラメータのmodeで判定
  // サマリー版用の変数を先に定義
  const simpleAllKeys = ['grip', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw']
  const simpleAllLabels = ['筋力', '瞬発力', '移動能力', 'バランス', '筋持久力', '敏捷性', '投力']
  const simpleMeasurementItems = [
    { key: 'grip', name: '握力', cat: '筋力', val: `${gripAvg.toFixed(1)}kg`, avg: `${avg.grip}kg` },
    { key: 'jump', name: '立ち幅跳び', cat: '瞬発力', val: `${data.jump}cm`, avg: `${avg.jump}cm` },
    { key: 'dash', name: '15mダッシュ', cat: '移動能力', val: `${data.dash}秒`, avg: `${avg.dash}秒` },
    { key: 'doublejump', name: '連続立ち幅跳び', cat: 'バランス', val: `${data.doublejump}cm`, avg: `${avg.doublejump}cm` },
    { key: 'squat', name: '30秒スクワット', cat: '筋持久力', val: `${data.squat}回`, avg: `${avg.squat}回` },
    { key: 'sidestep', name: '反復横跳び', cat: '敏捷性', val: `${data.sidestep}回`, avg: `${avg.sidestep}回` },
    { key: 'throw', name: 'ボール投げ', cat: '投力', val: `${data.throw}m`, avg: `${avg.throw}m` }
  ]
  const simpleDevAdv = developmentAdvice[child.grade]

  if (viewMode === 'simple') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-6 px-3 xs:px-4 print:bg-white print:py-0 print:px-0 print:min-h-0">
        <div className="max-w-4xl mx-auto space-y-6 print:space-y-0 print:max-w-none print:m-0">
          {/* 戻るボタン・PDF出力ボタン */}
          <div className="flex justify-between items-center print:hidden">
            <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white transition-colors text-sm xs:text-base">
              ← トップに戻る
            </Link>
            <button
              onClick={handlePrint}
              className="px-4 xs:px-5 py-2.5 xs:py-2 bg-white text-blue-900 font-bold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2 text-sm xs:text-base min-h-[44px] min-w-[100px] justify-center"
            >
              <FaPrint /> PDF出力
            </button>
          </div>

          {/* ページ1: サマリー結果 + 保護者の方へ（合体版） */}
          <div ref={printRef} className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:h-[297mm] print:w-[210mm] print:overflow-hidden print:box-border">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 xs:p-5 print:p-3">
              <div className="flex flex-col xs:flex-row justify-between items-start gap-2 xs:gap-0">
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] xs:text-xs font-medium px-2 py-0.5 bg-white/20 rounded">NOBISHIRO KIDS</span>
                  </div>
                  <h1 className="text-lg xs:text-2xl font-extrabold tracking-wider mb-1 flex items-center gap-2">
                    <FaTrophy /> 運動能力診断レポート
                  </h1>
                  <div className="text-xs xs:text-sm opacity-90">Athletic Performance Assessment Report</div>
                </div>
                <div className="text-left xs:text-right">
                  <div className="inline-block px-3 xs:px-4 py-1 bg-white/20 backdrop-blur text-white font-bold rounded-full mb-1 text-xs xs:text-sm">
                    サマリー
                  </div>
                  <div className="text-white/80 text-[10px] xs:text-xs">測定日: {today}</div>
                </div>
              </div>
            </div>

            {/* 被験者情報 */}
            <div className="bg-blue-50 border-2 border-blue-200 p-3 xs:p-4 mx-3 xs:mx-5 mt-3 xs:mt-4 rounded-xl flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0 print:mx-3 print:mt-3 print:p-2">
              <div className="flex items-center gap-3 xs:gap-4">
                <div className="w-10 h-10 xs:w-14 xs:h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-lg xs:text-2xl text-white shadow-lg print:w-10 print:h-10">
                  <FaChild />
                </div>
                <div>
                  <span className="text-[10px] xs:text-xs text-gray-600 block">{child.furigana}</span>
                  <span className="text-base xs:text-xl font-extrabold text-gray-800">{child.name}</span>
                  <span className="text-sm xs:text-lg font-bold text-blue-600 ml-1">さん</span>
                </div>
              </div>
              <div className="text-left xs:text-right w-full xs:w-auto">
                <div className="inline-block px-2 xs:px-3 py-1 bg-blue-600 text-white text-[10px] xs:text-xs font-bold rounded-full mb-1">
                  {getGradeDisplay(child.grade)}
                </div>
                <div className="text-[10px] xs:text-xs text-gray-600">
                  {actualAge}歳・{child.gender === 'male' ? '男子' : '女子'}<br />
                  身長 {child.height}cm ／ 体重 {child.weight}kg
                </div>
              </div>
            </div>

            {/* 運動器年齢 + 運動タイプ 横並び */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 mx-3 xs:mx-5 mt-3 xs:mt-4 print:mx-3 print:mt-3 print:gap-3 print:grid-cols-2">
              {/* 運動器年齢 */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-3 xs:p-4 text-white shadow-xl print:p-3">
                <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4">
                  <div className="w-18 h-18 xs:w-20 xs:h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-blue-300 shadow-lg flex-shrink-0 print:w-16 print:h-16">
                    <div className="text-center">
                      <div className="text-[8px] xs:text-[9px] opacity-80">運動器年齢</div>
                      <div className="text-2xl xs:text-3xl font-black text-white print:text-2xl">{Math.round(result.motor_age)}</div>
                      <div className="text-[10px] xs:text-xs font-bold">歳</div>
                    </div>
                  </div>
                  <div className="flex-1 text-center xs:text-left">
                    <div className="flex flex-wrap items-center justify-center xs:justify-start gap-1 xs:gap-2 mb-1">
                      <span className="text-xs xs:text-sm">実年齢</span>
                      <span className="text-lg xs:text-xl font-black text-blue-200">{actualAge}</span>
                      <span className="text-xs xs:text-sm">歳 →</span>
                      <span className={`text-base xs:text-xl font-black px-2 xs:px-3 py-0.5 rounded-full ${
                        result.motor_age_diff >= 0 ? 'bg-blue-500' : 'bg-blue-400'
                      }`}>
                        {result.motor_age_diff >= 0 ? '+' : ''}{result.motor_age_diff.toFixed(1)}歳
                      </span>
                    </div>
                    <div className="text-[9px] xs:text-[10px] opacity-90 bg-white/10 rounded-lg p-1.5 print:p-1">
                      {result.motor_age_diff >= 1
                        ? 'すごい！運動能力が同年代より優れています！'
                        : result.motor_age_diff >= -1
                          ? 'いい感じ！年齢相応の運動能力です！'
                          : 'がんばろう！トレーニングで伸ばせます！'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* 運動タイプ */}
              <div className="border-4 border-blue-800 rounded-xl">
                <div className="bg-blue-50 rounded-lg p-3 xs:p-4 text-center h-full flex flex-col justify-center print:p-3">
                  <div className="text-xs xs:text-sm text-gray-600 mb-1">あなたの運動タイプ</div>
                  <div className="text-lg xs:text-xl font-black text-blue-800 mb-2 print:text-lg">
                    {recalculatedType.name}
                  </div>
                  <div className="bg-white border-2 border-blue-200 rounded-lg px-2 xs:px-3 py-1.5 text-xs xs:text-sm text-gray-700 print:text-[10px] print:py-1">
                    {recalculatedType.desc}
                  </div>
                </div>
              </div>
            </div>

            {/* 保護者の方へ */}
            <div className="mx-3 xs:mx-5 mt-3 xs:mt-4 print:mx-3 print:mt-3">
              {/* 初来店促進メッセージ */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 xs:p-4 rounded-xl mb-3 xs:mb-4 shadow-xl print:p-3 print:mb-3">
                <h4 className="text-base xs:text-lg font-extrabold text-center mb-2">
                  当院のサポートで
                </h4>
                <div className="flex flex-wrap justify-center gap-2 xs:gap-3 text-center">
                  <div className="bg-white/25 backdrop-blur px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border-2 border-white/30">
                    <div className="text-xs xs:text-sm font-extrabold">&quot;正しい骨格&quot;</div>
                  </div>
                  <div className="bg-white/25 backdrop-blur px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border-2 border-white/30">
                    <div className="text-xs xs:text-sm font-extrabold">&quot;正しい関節&quot;</div>
                  </div>
                  <div className="bg-white/25 backdrop-blur px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border-2 border-white/30">
                    <div className="text-xs xs:text-sm font-extrabold">&quot;正しい筋肉の使い方&quot;</div>
                  </div>
                </div>
                <p className="text-center mt-2 text-xs xs:text-sm font-bold">を身につけよう！</p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 print:gap-3 print:grid-cols-2">
                {/* 発達段階の情報 */}
                <div className="bg-blue-50 border-2 border-blue-200 p-3 xs:p-4 rounded-xl print:p-3">
                  <h4 className="text-sm xs:text-base font-bold text-blue-900 border-b-2 border-blue-900 pb-1 mb-2 flex items-center gap-2"><FaBook /> 発達段階について</h4>
                  <p className="text-[10px] xs:text-xs text-gray-700 mb-3 leading-relaxed bg-white/50 p-2 rounded-lg print:mb-2 print:p-1.5">
                    お子様は今、運動神経が大きく発達する<strong className="text-blue-700">ゴールデンエイジ</strong>の時期にあります。この時期に習得した動きは一生忘れません。
                  </p>

                  <h4 className="text-[10px] xs:text-xs font-bold text-blue-900 mb-1 flex items-center gap-1"><FaLightbulb /> この時期のポイント</h4>
                  <p className="text-[10px] xs:text-xs text-gray-700 mb-3 leading-relaxed bg-white/50 p-2 rounded-lg print:mb-2 print:p-1.5">
                    <strong className="text-blue-700">多様な動き</strong>を経験することで、運動神経の土台が形成されます。楽しみながら様々なスポーツに挑戦しましょう。
                  </p>

                  <h4 className="text-[10px] xs:text-xs font-bold text-blue-800 mb-1 flex items-center gap-1"><FaExclamationTriangle /> 注意点</h4>
                  <p className="text-[10px] xs:text-xs text-blue-800 leading-relaxed bg-blue-100 p-2 rounded-lg border border-blue-300 print:p-1.5">
                    <strong>「できた！」という成功体験</strong>を積み重ねることが大切です。
                  </p>
                </div>

                {/* 初来店のご案内 */}
                <div className="bg-blue-50 p-3 xs:p-4 rounded-xl border-2 border-blue-200 print:p-3">
                  <h4 className="text-sm xs:text-base font-bold text-blue-900 border-b-2 border-blue-600 pb-1 mb-2 text-center flex items-center justify-center gap-2"><FaHandshake /> ぜひ教室にお越しください</h4>
                  <p className="text-[10px] xs:text-xs text-gray-600 mb-3 text-center leading-relaxed bg-white/50 p-2 rounded-lg print:mb-2 print:p-1.5">
                    詳細な診断結果と、お子様に合った<br />
                    専門的なトレーニング指導を受けられます！
                  </p>
                  <div className="grid grid-cols-2 gap-2 xs:gap-3 print:gap-2">
                    <div className="text-center bg-white p-2 xs:p-3 rounded-lg shadow-md border-2 border-blue-200 print:p-2">
                      <div className="w-12 h-12 xs:w-16 xs:h-16 mx-auto mb-1.5 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 print:w-12 print:h-12">
                        <img
                          src="/qr/reservation.png"
                          alt="予約QRコード"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = '<span class="text-[10px] text-gray-400">QR準備中</span>'
                          }}
                        />
                      </div>
                      <p className="text-[10px] xs:text-xs font-bold text-blue-700 flex items-center justify-center gap-1"><FaCalendarAlt /> 体験予約</p>
                    </div>
                    <div className="text-center bg-white p-2 xs:p-3 rounded-lg shadow-md border-2 border-blue-200 print:p-2">
                      <div className="w-12 h-12 xs:w-16 xs:h-16 mx-auto mb-1.5 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 print:w-12 print:h-12">
                        <img
                          src="/qr/line.png"
                          alt="LINE QRコード"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = '<span class="text-[10px] text-gray-400">QR準備中</span>'
                          }}
                        />
                      </div>
                      <p className="text-[10px] xs:text-xs font-bold text-blue-700 flex items-center justify-center gap-1"><FaComments /> LINE相談</p>
                    </div>
                  </div>
                  <p className="text-[10px] xs:text-xs text-blue-700 mt-2 text-center font-medium bg-blue-100 p-1.5 rounded-lg flex items-center justify-center gap-1 print:mt-1.5 print:p-1">
                    <FaChartLine /> 専門的に丁寧に指導します！
                  </p>
                </div>
              </div>

              {/* フッター：店舗情報 */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 xs:p-4 rounded-xl text-center shadow-lg mt-3 xs:mt-4 print:mt-3 print:p-3">
                <p className="text-base xs:text-lg font-bold mb-1 flex items-center justify-center gap-2"><FaSchool /> かけっこ体幹教室</p>
                <p className="text-xs xs:text-sm opacity-90">お子様の運動能力向上を全力でサポートします</p>
              </div>
            </div>
          </div>

          {/* ページ2: 詳細版プレビュー（SAMPLEオーバーレイ付き）- 2列レイアウト */}
          <div className="relative overflow-hidden rounded-xl xs:rounded-2xl print:rounded-none print:break-before-page print:h-[297mm] print:w-[210mm] print:overflow-hidden print:box-border">
            {/* SAMPLEウォーターマーク */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
              <div
                className="text-[60px] xs:text-[120px] font-extrabold text-gray-400/30 whitespace-nowrap select-none print:text-gray-300/40"
                style={{ transform: 'rotate(-30deg)' }}
              >
                SAMPLE
              </div>
            </div>
            {/* 半透明オーバーレイ */}
            <div className="absolute inset-0 bg-white/60 z-10 pointer-events-none print:bg-white/40" />

            {/* 2列レイアウト: 左=チャート・インジケータ、右=トレーニング＆適性スポーツ */}
            <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none h-full">
              {/* ヘッダー */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 xs:p-5 print:p-4">
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
                  <div>
                    <h1 className="text-lg xs:text-2xl text-white font-extrabold tracking-wider flex items-center gap-2">
                      <FaChartBar /> 能力分析＆トレーニング
                    </h1>
                    <p className="text-white text-xs xs:text-base mt-1 font-bold">ご来院いただくとこちらの測定結果をお渡しします</p>
                  </div>
                  <div className="text-white/80 text-xs xs:text-sm">Analysis & Training</div>
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 xs:gap-0 p-4 xs:p-5 print:p-4 print:grid-cols-2">
                {/* 左列: 7つの能力チェック（チャート・インジケータ） */}
                <div className="xs:border-r border-gray-200 xs:pr-5 print:pr-4 flex flex-col">
                  <div className="text-sm xs:text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <FaChartBar /> 7つの能力チェック
                  </div>

                  {/* チャート */}
                  <div className="flex justify-center mb-3">
                    <RadarChart scores={recalculatedScores} keys={simpleAllKeys} labels={simpleAllLabels} size={200} averageScores={{ grip: 5, jump: 5, dash: 5, doublejump: 5, squat: 5, sidestep: 5, throw: 5 }} />
                  </div>

                  {/* 凡例 */}
                  <div className="flex justify-center gap-4 mb-4 text-[10px]">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-0.5 bg-[#003366]"></div>
                      <span className="text-gray-700">あなたの結果</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-0.5 bg-[#FF8C00]" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: '#FF8C00', backgroundColor: 'transparent' }}></div>
                      <span className="text-gray-700">全国平均</span>
                    </div>
                  </div>

                  {/* インジケータ */}
                  <div className="space-y-1.5 flex-1">
                    {simpleMeasurementItems.map(item => {
                      const score = recalculatedScores[item.key]
                      const grade = getGrade(score)
                      return (
                        <div key={item.key} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-gray-800 text-[11px]">{item.name}</span>
                              <span className="text-[9px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">{item.cat}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-600">{item.val}</span>
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-[11px] shadow-md bg-gradient-to-br from-blue-500 to-blue-700">
                                {score}
                              </div>
                              <span className={`font-black text-[11px] ${grade.colorClass}`}>{grade.grade}</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                              style={{ width: `${score * 10}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 右列: トレーニング＆適性スポーツ */}
                <div className="xs:pl-5 print:pl-4">
                  <DetailDemoSectionCompact />
                </div>
              </div>
            </div>
          </div>

          {/* 戻るボタン */}
          <div className="text-center pt-4 print:hidden">
            <Link href="/" className="inline-block px-5 xs:px-6 py-2 xs:py-3 bg-white text-blue-900 font-bold rounded-lg shadow hover:shadow-lg transition-all text-sm xs:text-base">
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

  const sorted = Object.entries(recalculatedScores).sort((a, b) => a[1] - b[1])
  const weakestKey = sorted[0][0]
  const strongestKey = sorted[sorted.length - 1][0]
  // 15m走から50m走への変換（中間〜後半でスピードに乗ることを考慮）
  const est50m = (data.dash * 2.7 + 0.5).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-6 px-3 xs:px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 戻るボタン・PDF出力ボタン */}
        <div className="flex justify-between items-center print:hidden">
          <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white transition-colors text-sm xs:text-base">
            ← トップに戻る
          </Link>
          <button
            onClick={handlePrint}
            className="px-4 xs:px-5 py-2.5 xs:py-2 bg-white text-blue-900 font-bold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2 text-sm xs:text-base min-h-[44px] min-w-[100px] justify-center"
          >
            <FaPrint /> PDF出力
          </button>
        </div>

        {/* ページ1: 基本結果（〜運動タイプまで） - A4サイズ最適化 */}
        <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:h-[297mm] print:w-[210mm]">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 xs:p-4 print:p-3">
            <div className="flex flex-col xs:flex-row justify-between items-start gap-2 xs:gap-0">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] xs:text-[10px] font-medium px-2 py-0.5 bg-white/20 rounded">NOBISHIRO KIDS</span>
                </div>
                <h1 className="text-lg xs:text-xl font-extrabold tracking-wider mb-1 flex items-center gap-2">
                  <FaTrophy /> 運動能力診断レポート
                </h1>
                <div className="text-[10px] xs:text-xs opacity-90">Athletic Performance Assessment Report</div>
              </div>
              <div className="text-left xs:text-right">
                <div className="inline-block px-2 xs:px-3 py-1 bg-white/20 backdrop-blur text-white font-bold rounded-full mb-1 text-[10px] xs:text-xs">
                  詳細診断
                </div>
                <div className="text-white/80 text-[9px] xs:text-[10px]">測定日: {today}</div>
              </div>
            </div>
          </div>

          {/* 被験者情報 */}
          <div className="bg-blue-50 border-2 border-blue-200 p-2 xs:p-3 mx-3 xs:mx-4 mt-3 xs:mt-4 rounded-xl flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 print:mx-3 print:mt-3 print:p-2">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-lg xs:text-xl text-white shadow-lg print:w-10 print:h-10">
                <FaChild />
              </div>
              <div>
                <span className="text-[9px] xs:text-[10px] text-gray-600 block">{child.furigana}</span>
                <span className="text-base xs:text-lg font-extrabold text-gray-800">{child.name}</span>
                <span className="text-sm xs:text-base font-bold text-blue-600 ml-1">さん</span>
              </div>
            </div>
            <div className="text-left xs:text-right w-full xs:w-auto">
              <div className="inline-block px-2 py-0.5 bg-blue-600 text-white text-[9px] xs:text-[10px] font-bold rounded-full mb-1">
                {getGradeDisplay(child.grade)}
              </div>
              <div className="text-[9px] xs:text-[10px] text-gray-600">
                {actualAge}歳・{child.gender === 'male' ? '男子' : '女子'}<br />
                身長 {child.height}cm ／ 体重 {child.weight}kg
              </div>
            </div>
          </div>

          {/* 運動器年齢 */}
          <div className="mx-3 xs:mx-4 mt-3 xs:mt-4 print:mx-3 print:mt-3">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-3 xs:p-4 text-white shadow-xl print:p-3">
              <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4">
                <div className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-blue-300 shadow-lg flex-shrink-0 print:w-20 print:h-20">
                  <div className="text-center">
                    <div className="text-[8px] xs:text-[9px] opacity-80">運動器年齢</div>
                    <div className="text-3xl xs:text-4xl font-black text-white print:text-3xl">{Math.round(result.motor_age)}</div>
                    <div className="text-[10px] xs:text-xs font-bold">歳</div>
                  </div>
                </div>
                <div className="flex-1 text-center xs:text-left">
                  <div className="flex flex-wrap items-center justify-center xs:justify-start gap-1 xs:gap-2 mb-2">
                    <span className="text-xs xs:text-sm">実年齢</span>
                    <span className="text-xl xs:text-2xl font-black text-blue-200">{actualAge}</span>
                    <span className="text-xs xs:text-sm">歳</span>
                    <span className="text-base xs:text-xl mx-1">→</span>
                    <span className={`text-lg xs:text-2xl font-black px-2 xs:px-3 py-0.5 rounded-full ${
                      result.motor_age_diff >= 0 ? 'bg-blue-500' : 'bg-blue-400'
                    }`}>
                      {result.motor_age_diff >= 0 ? '+' : ''}{result.motor_age_diff.toFixed(1)}歳
                    </span>
                  </div>
                  <div className="text-[10px] xs:text-xs opacity-90 bg-white/10 rounded-lg p-2">
                    {result.motor_age_diff >= 1
                      ? 'すごい！運動能力が同年代より優れています。この調子で様々な運動にチャレンジしましょう！'
                      : result.motor_age_diff >= -1
                        ? 'いい感じ！年齢相応の運動能力です。継続的な運動で更に伸ばせます！'
                        : 'がんばろう！トレーニングで運動能力をアップできます！'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 測定結果（7項目） */}
          <div className="mx-3 xs:mx-4 mt-2 xs:mt-3 print:mx-3 print:mt-1">
            <div className="text-sm xs:text-base font-bold text-blue-900 mb-1 flex items-center gap-2">
              <FaChartBar /> 7つの能力チェック
            </div>
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 items-center xs:items-start print:flex-row print:gap-3">
              <div className="w-full xs:w-1/2 flex flex-col items-center print:w-1/2 -mt-2">
                <RadarChart scores={recalculatedScores} keys={allKeys} labels={allLabels} size={320} averageScores={{ grip: 5, jump: 5, dash: 5, doublejump: 5, squat: 5, sidestep: 5, throw: 5 }} />
                {/* チャート凡例 */}
                <div className="flex gap-3 xs:gap-4 -mt-1 text-[9px] xs:text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 xs:w-6 h-0.5 bg-[#003366]"></div>
                    <span className="text-gray-700">あなたの結果</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 xs:w-6 h-0.5 bg-[#FF8C00]" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: '#FF8C00', backgroundColor: 'transparent' }}></div>
                    <span className="text-gray-700">全国平均</span>
                  </div>
                </div>
              </div>
              <div className="w-full xs:w-1/2 space-y-1 print:w-1/2 print:space-y-0.5 mt-2 xs:mt-0">
                {measurementItems.map(item => {
                  const score = recalculatedScores[item.key]
                  const grade = getGrade(score)
                  return (
                    <div key={item.key} className="bg-gray-50 rounded-lg p-2 border border-gray-200 print:p-1">
                      <div className="flex items-center justify-between mb-1 print:mb-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-800 text-sm print:text-[10px]">{item.name}</span>
                          <span className="text-[8px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded print:text-[7px] print:px-1">{item.cat}</span>
                        </div>
                        <div className="flex items-center gap-2 print:gap-1">
                          <span className="text-xs text-gray-600 print:text-[9px]">{item.val}</span>
                          <span className="text-[9px] text-gray-400 print:text-[8px]">平均{item.avg}</span>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md bg-gradient-to-br from-blue-500 to-blue-700 print:w-5 print:h-5 print:text-[10px]">
                            {score}
                          </div>
                          <span className={`font-black text-sm print:text-[10px] ${grade.colorClass}`}>{grade.grade}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden print:h-1">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ width: `${score * 10}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 運動タイプ */}
          <div className="mx-3 xs:mx-4 mt-3 xs:mt-4 mb-3 xs:mb-4 print:mx-3 print:mt-2 print:mb-2">
            <div className="border-4 border-blue-800 rounded-xl">
              <div className="bg-blue-50 rounded-lg p-3 xs:p-4 text-center print:p-2">
                <div className="text-xs text-gray-600 mb-1">あなたの運動タイプ</div>
                <div className="text-xl xs:text-2xl font-black text-blue-800 mb-2 print:text-lg print:mb-1">
                  {recalculatedType.name}
                </div>
                <div className="inline-block bg-white border-2 border-blue-200 rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm text-gray-700 print:text-[10px] print:px-2 print:py-1">
                  {recalculatedType.desc}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ページ2: トレーニング＆適性スポーツ（〜1ヶ月目標まで） - A4サイズ最適化 */}
        <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:break-before-page print:h-[297mm] print:w-[210mm]">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 xs:p-4 print:p-3">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-1 xs:gap-0">
              <h1 className="text-lg xs:text-xl text-white font-extrabold tracking-wider flex items-center gap-2">
                <FaBullseye /> トレーニング＆適性スポーツ
              </h1>
              <div className="text-white/80 text-[10px] xs:text-xs">Training & Sports Aptitude</div>
            </div>
          </div>

          <div className="p-3 xs:p-4 print:p-3">
            {/* 上段: 強み・弱み + 50m予測 + 適性スポーツ */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 mb-3 xs:mb-4 print:gap-2 print:mb-2 print:grid-cols-3">
              {/* 強み・弱み */}
              <div>
                <div className="text-xs xs:text-sm font-bold text-blue-900 mb-2 flex items-center gap-1"><FaSearch className="text-xs" /> 強み・弱み分析</div>
                <div className="space-y-2 print:space-y-1">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2 print:p-1.5">
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-200 px-1.5 py-0.5 rounded-full">レベルアップ項目</span>
                    <div className="font-bold text-gray-800 text-xs xs:text-sm mt-1 print:text-[10px]">{categories[weakestKey]}（{recalculatedScores[weakestKey]}点）</div>
                    <p className="text-[8px] xs:text-[9px] text-gray-600">ここを強化すると全体がグンと伸びる！</p>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-2 print:p-1.5">
                    <span className="text-[9px] font-bold text-blue-800 bg-blue-300 px-1.5 py-0.5 rounded-full">得意項目</span>
                    <div className="font-bold text-gray-800 text-xs xs:text-sm mt-1 print:text-[10px]">{categories[strongestKey]}（{recalculatedScores[strongestKey]}点）</div>
                    <p className="text-[8px] xs:text-[9px] text-gray-600">この強みを活かしたスポーツで活躍しよう！</p>
                  </div>
                </div>
              </div>

              {/* 適性スポーツ */}
              <div className="xs:col-span-2 print:col-span-2">
                <div className="text-xs xs:text-sm font-bold text-blue-900 mb-2 flex items-center gap-1"><FaMedal className="text-xs" /> キミに向いているスポーツ TOP6</div>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2 xs:p-3 print:p-2">
                  <div className="text-[9px] font-bold text-blue-800 mb-1">特に適性が高い</div>
                  <div className="flex flex-wrap gap-1 xs:gap-1.5 mb-2 print:mb-1">
                    {recalculatedSportsAptitude?.slice(0, 3).map((sport) => (
                      <span key={sport.name} className="inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-blue-600 text-white rounded-full text-[9px] xs:text-[10px] font-bold">
                        <span className="text-xs xs:text-sm">{sport.icon}</span> {sport.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-[9px] font-bold text-blue-700 mb-1">適性あり</div>
                  <div className="flex flex-wrap gap-1 xs:gap-1.5">
                    {recalculatedSportsAptitude?.slice(3, 6).map(sport => (
                      <span key={sport.name} className="inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-blue-400 text-white rounded-full text-[9px] xs:text-[10px] font-bold">
                        <span className="text-xs xs:text-sm">{sport.icon}</span> {sport.name}
                      </span>
                    ))}
                  </div>
                </div>
                {/* 50m予測 */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-2 text-white mt-2 print:mt-1.5 print:p-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs xs:text-sm flex items-center gap-1"><FaRunning /> 50m走予測タイム</span>
                    <span className="text-xl xs:text-2xl font-black text-blue-200 print:text-lg">{est50m}秒</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 重点トレーニング 8種目 */}
            <div className="mb-4 print:mb-3">
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-2 gap-1 xs:gap-0">
                <div className="text-sm font-bold text-blue-900 flex items-center gap-1"><FaDumbbell /> キミの重点トレーニング</div>
                <div className="bg-blue-100 border border-blue-300 px-2 py-1 rounded-lg text-[10px] text-blue-800 font-bold">
                  お父さん・お母さんと一緒にやろう！
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 print:gap-1.5 print:grid-cols-2">
                {result.recommended_trainings?.slice(0, 8).map((t, i) => (
                  <div key={i} className="rounded-lg p-2 border-2 bg-blue-50 border-blue-200 print:p-1.5">
                    <div className="flex gap-2">
                      {/* 画像: 3:2比率（幅90px x 高さ60px → xs以上） */}
                      <div className="w-[72px] xs:w-[90px] h-12 xs:h-[60px] flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-white shadow print:w-[72px] print:h-12">
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
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-0.5">
                          <div className="w-4 h-4 xs:w-5 xs:h-5 rounded-full flex items-center justify-center text-white font-black text-[10px] xs:text-xs shadow-md flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700">
                            {i + 1}
                          </div>
                          <strong className="text-[11px] xs:text-xs text-gray-800 leading-tight">{t.name}</strong>
                          <span className="text-[7px] xs:text-[8px] font-bold px-1 xs:px-1.5 py-0.5 rounded-full bg-blue-600 text-white flex-shrink-0">
                            {t.category}
                          </span>
                        </div>
                        <div className="text-[8px] xs:text-[9px] text-gray-600 line-clamp-2 leading-relaxed">{t.description}</div>
                        <div className="text-[9px] xs:text-[10px] font-bold text-blue-700 flex items-center gap-0.5 mt-0.5"><FaClipboardList className="text-[7px] xs:text-[8px]" /> {t.reps}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1ヶ月目標 */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 xs:p-4 rounded-xl shadow-lg print:p-2">
              <div className="text-center mb-2 xs:mb-3">
                <h4 className="text-sm xs:text-base font-bold flex items-center justify-center gap-2"><FaBullseye /> 1ヶ月後のキミの目標！</h4>
                <p className="text-[9px] xs:text-[10px] opacity-80">毎日10分のトレーニングで達成できる！</p>
              </div>
              <div className="grid grid-cols-3 gap-2 xs:gap-3 print:gap-2">
                <div className="bg-white/20 backdrop-blur p-2 xs:p-3 rounded-lg text-center print:p-2">
                  <div className="text-[10px] xs:text-xs opacity-90">握力</div>
                  <div className="text-[9px] xs:text-[10px] opacity-70">今 {gripAvg.toFixed(1)}kg</div>
                  <div className="text-lg xs:text-2xl font-black text-blue-200 print:text-lg">{result.goals?.grip}kg</div>
                </div>
                <div className="bg-white/20 backdrop-blur p-2 xs:p-3 rounded-lg text-center print:p-2">
                  <div className="text-[10px] xs:text-xs opacity-90">立ち幅跳び</div>
                  <div className="text-[9px] xs:text-[10px] opacity-70">今 {data.jump}cm</div>
                  <div className="text-lg xs:text-2xl font-black text-blue-200 print:text-lg">{result.goals?.jump}cm</div>
                </div>
                <div className="bg-white/20 backdrop-blur p-2 xs:p-3 rounded-lg text-center print:p-2">
                  <div className="text-[10px] xs:text-xs opacity-90">15mダッシュ</div>
                  <div className="text-[9px] xs:text-[10px] opacity-70">今 {data.dash}秒</div>
                  <div className="text-lg xs:text-2xl font-black text-blue-200 print:text-lg">{result.goals?.dash}秒</div>
                </div>
              </div>
              <p className="text-[8px] xs:text-[9px] text-center mt-2 opacity-60">※測定結果による評価・予測は統計データに基づく推定値です</p>
            </div>
          </div>
        </div>

        {/* ページ3: 保護者の方へ - A4サイズ最適化 */}
        <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:break-before-page print:h-[297mm] print:w-[210mm]">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 xs:p-4 print:p-3">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-1 xs:gap-0">
              <h1 className="text-lg xs:text-xl text-white font-extrabold tracking-wider flex items-center gap-2">
                <FaFileAlt /> 保護者の方へ
              </h1>
              <div className="text-white/80 text-[10px] xs:text-xs">Information for Parents</div>
            </div>
          </div>

          <div className="p-3 xs:p-4 print:p-3">
            {/* 当店ご来店のメリット */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 xs:p-5 rounded-xl mb-3 xs:mb-4 shadow-xl print:p-3 print:mb-3">
              <h4 className="text-base xs:text-xl font-extrabold text-center mb-2 xs:mb-3">
                当院の継続サポートにより
              </h4>
              <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 text-center">
                <div className="bg-white/25 backdrop-blur px-2 xs:px-4 py-1.5 xs:py-3 rounded-lg border-2 border-white/30">
                  <div className="text-sm xs:text-lg font-extrabold">&quot;正しい骨格&quot;</div>
                </div>
                <div className="bg-white/25 backdrop-blur px-2 xs:px-4 py-1.5 xs:py-3 rounded-lg border-2 border-white/30">
                  <div className="text-sm xs:text-lg font-extrabold">&quot;正しい関節&quot;</div>
                </div>
                <div className="bg-white/25 backdrop-blur px-2 xs:px-4 py-1.5 xs:py-3 rounded-lg border-2 border-white/30">
                  <div className="text-sm xs:text-lg font-extrabold">&quot;正しい筋肉の使い方&quot;</div>
                </div>
              </div>
              <p className="text-center mt-2 xs:mt-3 text-sm xs:text-lg font-bold">を学べます！</p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 mb-3 xs:mb-4 print:gap-3 print:mb-3 print:grid-cols-2">
              {/* 発達段階の情報 */}
              <div className="bg-blue-50 border-2 border-blue-200 p-3 xs:p-4 rounded-xl print:p-3">
                <h4 className="text-sm xs:text-base font-bold text-blue-900 border-b-2 border-blue-900 pb-1 mb-2 xs:mb-3 flex items-center gap-2"><FaBook /> 発達段階: {devAdv?.golden}</h4>
                <p
                  className="text-[10px] xs:text-xs text-gray-700 mb-2 xs:mb-3 leading-relaxed bg-white/50 p-2 rounded-lg print:mb-2"
                  dangerouslySetInnerHTML={{ __html: highlightText(devAdv?.focus || '', devAdv?.focusHighlights || []) }}
                />

                <h4 className="text-xs xs:text-sm font-bold text-blue-900 mb-1 xs:mb-2 flex items-center gap-1"><FaLightbulb /> この時期のポイント</h4>
                <p
                  className="text-[10px] xs:text-xs text-gray-700 mb-2 xs:mb-3 leading-relaxed bg-white/50 p-2 rounded-lg print:mb-2"
                  dangerouslySetInnerHTML={{ __html: highlightText(devAdv?.key || '', devAdv?.keyHighlights || []) }}
                />

                <h4 className="text-xs xs:text-sm font-bold text-blue-800 mb-1 xs:mb-2 flex items-center gap-1"><FaExclamationTriangle /> 注意点</h4>
                <p
                  className="text-[10px] xs:text-xs text-blue-800 leading-relaxed bg-blue-100 p-2 rounded-lg border border-blue-300"
                  dangerouslySetInnerHTML={{ __html: highlightText(devAdv?.avoid || '', devAdv?.avoidHighlights || []) }}
                />
              </div>

              {/* 継続的なサポートのご案内 */}
              <div className="bg-blue-50 p-3 xs:p-4 rounded-xl border-2 border-blue-200 print:p-3">
                <h4 className="text-sm xs:text-lg font-bold text-blue-900 border-b-2 border-blue-600 pb-1 mb-2 xs:mb-3 text-center flex items-center justify-center gap-2"><FaHandshake /> 継続的なサポートのご案内</h4>
                <p className="text-[10px] xs:text-xs text-gray-600 mb-2 xs:mb-3 text-center leading-relaxed bg-white/50 p-2 rounded-lg print:mb-2">
                  お子様の運動能力をさらに伸ばすために、<br />
                  定期的な測定と専門的なトレーニング指導をおすすめします。
                </p>
                <div className="grid grid-cols-2 gap-2 xs:gap-3 print:gap-2">
                  <div className="text-center bg-white p-2 xs:p-3 rounded-lg shadow-md border-2 border-blue-200 print:p-2">
                    <div className="w-14 h-14 xs:w-20 xs:h-20 mx-auto mb-1.5 xs:mb-2 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 print:w-14 print:h-14">
                      <img
                        src="/qr/reservation.png"
                        alt="予約QRコード"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML = '<span class="text-[10px] text-gray-400">QR準備中</span>'
                        }}
                      />
                    </div>
                    <p className="text-[10px] xs:text-xs font-bold text-blue-700 flex items-center justify-center gap-1"><FaCalendarAlt /> 次回の測定を予約</p>
                  </div>
                  <div className="text-center bg-white p-2 xs:p-3 rounded-lg shadow-md border-2 border-blue-200 print:p-2">
                    <div className="w-14 h-14 xs:w-20 xs:h-20 mx-auto mb-1.5 xs:mb-2 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 print:w-14 print:h-14">
                      <img
                        src="/qr/line.png"
                        alt="LINE QRコード"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML = '<span class="text-[10px] text-gray-400">QR準備中</span>'
                        }}
                      />
                    </div>
                    <p className="text-[10px] xs:text-xs font-bold text-blue-700 flex items-center justify-center gap-1"><FaComments /> LINEで相談・質問</p>
                  </div>
                </div>
                <p className="text-[10px] xs:text-xs text-blue-700 mt-2 xs:mt-3 text-center font-medium bg-blue-100 p-1.5 xs:p-2 rounded-lg flex items-center justify-center gap-1 print:mt-2 print:p-1.5">
                  <FaChartLine /> 1ヶ月ごとの測定で成長を実感できます！
                </p>
                {/* 16:9 横長画像エリア */}
                <div className="mt-2 xs:mt-3 aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 print:mt-2">
                  <img
                    src="/images/support-banner.jpg"
                    alt="サポートバナー"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">画像準備中</div>'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* フッター：店舗情報 */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 xs:p-5 rounded-xl text-center shadow-lg print:p-3">
              <p className="text-base xs:text-xl font-bold mb-1 flex items-center justify-center gap-2"><FaSchool /> かけっこ体幹教室</p>
              <p className="text-xs xs:text-sm opacity-90">お子様の運動能力向上を全力でサポートします</p>
            </div>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="text-center pt-4 print:hidden">
          <Link href="/" className="inline-block px-5 xs:px-6 py-2 xs:py-3 bg-white text-blue-900 font-bold rounded-lg shadow hover:shadow-lg transition-all text-sm xs:text-base">
            トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

// 詳細版デモセクション（サマリーページで使用）- 詳細版と同じデザイン
function DetailDemoSection({ result }: { result: MeasurementData['results'][0] }) {
  // サンプル用の架空データ
  const sampleSports = [
    { name: 'バスケットボール', icon: '🏀', aptitude: 7.8 },
    { name: 'サッカー', icon: '⚽', aptitude: 7.5 },
    { name: 'テニス', icon: '🎾', aptitude: 7.2 },
    { name: 'バドミントン', icon: '🏸', aptitude: 6.9 },
    { name: '陸上短距離', icon: '🏃', aptitude: 6.7 },
    { name: 'ダンス', icon: '💃', aptitude: 6.5 }
  ]
  const sampleTrainings = [
    { name: 'スクワットジャンプ', description: 'しゃがんでから勢いよくジャンプ', reps: '10回×3セット', category: '瞬発力' },
    { name: 'バランスボード', description: '片足でバランスをとる練習', reps: '30秒×左右3回', category: 'バランス' },
    { name: 'ラダートレーニング', description: '素早く足を動かす練習', reps: '5往復×3セット', category: '敏捷性' },
    { name: 'ボール投げ練習', description: '正しいフォームでの投球', reps: '20回×2セット', category: '投力' },
    { name: 'もも上げダッシュ', description: 'その場でもも上げ走り', reps: '20秒×3セット', category: '移動能力' },
    { name: '握力トレーニング', description: 'テニスボールを握る', reps: '20回×左右3回', category: '筋力' },
    { name: 'プランク', description: '体幹を鍛える姿勢保持', reps: '30秒×3セット', category: '筋持久力' },
    { name: 'サイドステップ', description: '横方向への素早い移動', reps: '10往復×3セット', category: '敏捷性' }
  ]
  const sampleGoals = { grip: 15.5, jump: 148, dash: 3.42 }

  return (
    <div className="space-y-0">
      {/* 詳細版ページ1＋ページ2を縦に並べて1ページ表示 */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg text-white font-extrabold tracking-wider flex items-center gap-2">
              <FaBullseye /> トレーニング＆適性スポーツ
            </h1>
            <div className="text-white/80 text-xs">Training & Sports Aptitude</div>
          </div>
        </div>

        <div className="p-3">
          {/* 上段: 強み・弱み + 50m予測 + 適性スポーツ */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* 強み・弱み */}
            <div>
              <div className="text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1"><FaSearch className="text-[10px]" /> 強み・弱み分析</div>
              <div className="space-y-1.5">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-1.5">
                  <span className="text-[8px] font-bold text-blue-700 bg-blue-200 px-1 py-0.5 rounded-full">レベルアップ項目</span>
                  <div className="font-bold text-gray-800 text-xs mt-0.5">投力（6点）</div>
                  <p className="text-[8px] text-gray-600">ここを強化すると全体がグンと伸びる！</p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-1.5">
                  <span className="text-[8px] font-bold text-blue-800 bg-blue-300 px-1 py-0.5 rounded-full">得意項目</span>
                  <div className="font-bold text-gray-800 text-xs mt-0.5">瞬発力（9点）</div>
                  <p className="text-[8px] text-gray-600">この強みを活かしたスポーツで活躍しよう！</p>
                </div>
              </div>
            </div>

            {/* 適性スポーツ */}
            <div className="col-span-2">
              <div className="text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1"><FaMedal className="text-[10px]" /> キミに向いているスポーツ TOP6</div>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2">
                <div className="text-[8px] font-bold text-blue-800 mb-0.5">特に適性が高い</div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {sampleSports.slice(0, 3).map((sport) => (
                    <span key={sport.name} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-bold">
                      <span className="text-xs">{sport.icon}</span> {sport.name}
                    </span>
                  ))}
                </div>
                <div className="text-[8px] font-bold text-blue-700 mb-0.5">適性あり</div>
                <div className="flex flex-wrap gap-1">
                  {sampleSports.slice(3, 6).map(sport => (
                    <span key={sport.name} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-400 text-white rounded-full text-[9px] font-bold">
                      <span className="text-xs">{sport.icon}</span> {sport.name}
                    </span>
                  ))}
                </div>
              </div>
              {/* 50m予測 */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-1.5 text-white mt-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1"><FaRunning /> 50m走予測タイム</span>
                  <span className="text-xl font-black text-blue-200">11.5秒</span>
                </div>
              </div>
            </div>
          </div>

          {/* 重点トレーニング 8種目 */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1"><FaDumbbell /> キミの重点トレーニング</div>
              <div className="bg-blue-100 border border-blue-300 px-1.5 py-0.5 rounded-lg text-[9px] text-blue-800 font-bold">
                お父さん・お母さんと一緒にやろう！
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {sampleTrainings.map((t, i) => (
                <div key={i} className="rounded-lg p-1.5 border-2 bg-blue-50 border-blue-200">
                  <div className="flex gap-1.5">
                    <div className="w-16 h-12 flex-shrink-0 bg-gray-200 rounded overflow-hidden border border-white shadow flex items-center justify-center">
                      <span className="text-[8px] text-gray-400">画像</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white font-black text-[8px] shadow-md flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700">
                          {i + 1}
                        </div>
                        <strong className="text-[9px] text-gray-800 truncate">{t.name}</strong>
                        <span className="text-[7px] font-bold px-1 py-0.5 rounded-full bg-blue-600 text-white flex-shrink-0">
                          {t.category}
                        </span>
                      </div>
                      <div className="text-[8px] text-gray-600 line-clamp-2 leading-relaxed">{t.description}</div>
                      <div className="text-[8px] font-bold text-blue-700 flex items-center gap-0.5"><FaClipboardList className="text-[7px]" /> {t.reps}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1ヶ月目標 */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 rounded-xl shadow-lg">
            <div className="text-center mb-2">
              <h4 className="text-sm font-bold flex items-center justify-center gap-2"><FaBullseye /> 1ヶ月後のキミの目標！</h4>
              <p className="text-[9px] opacity-80">毎日10分のトレーニングで達成できる！</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/20 backdrop-blur p-2 rounded-lg text-center">
                <div className="text-[10px] opacity-90">握力</div>
                <div className="text-[8px] opacity-70">今 14.2kg</div>
                <div className="text-lg font-black text-blue-200">{sampleGoals.grip}kg</div>
              </div>
              <div className="bg-white/20 backdrop-blur p-2 rounded-lg text-center">
                <div className="text-[10px] opacity-90">立ち幅跳び</div>
                <div className="text-[8px] opacity-70">今 140cm</div>
                <div className="text-lg font-black text-blue-200">{sampleGoals.jump}cm</div>
              </div>
              <div className="bg-white/20 backdrop-blur p-2 rounded-lg text-center">
                <div className="text-[10px] opacity-90">15mダッシュ</div>
                <div className="text-[8px] opacity-70">今 3.55秒</div>
                <div className="text-lg font-black text-blue-200">{sampleGoals.dash}秒</div>
              </div>
            </div>
            <p className="text-[8px] text-center mt-2 opacity-60">※測定結果による評価・予測は統計データに基づく推定値です</p>
          </div>
        </div>
      </div>

      {/* 保護者の方へ */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mt-4">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg text-white font-extrabold tracking-wider flex items-center gap-2">
              <FaFileAlt /> 保護者の方へ
            </h1>
            <div className="text-white/80 text-xs">Information for Parents</div>
          </div>
        </div>

        <div className="p-3">
          {/* 初来店促進メッセージ */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 rounded-xl mb-3 shadow-xl">
            <h4 className="text-lg font-extrabold text-center mb-2">
              かけっこ体幹教室で
            </h4>
            <div className="flex flex-wrap justify-center gap-1.5 text-center">
              <div className="bg-white/25 backdrop-blur px-3 py-2 rounded-lg border-2 border-white/30">
                <div className="text-sm font-extrabold">&quot;正しい骨格&quot;</div>
              </div>
              <div className="bg-white/25 backdrop-blur px-3 py-2 rounded-lg border-2 border-white/30">
                <div className="text-sm font-extrabold">&quot;正しい関節&quot;</div>
              </div>
              <div className="bg-white/25 backdrop-blur px-3 py-2 rounded-lg border-2 border-white/30">
                <div className="text-sm font-extrabold">&quot;正しい筋肉の使い方&quot;</div>
              </div>
            </div>
            <p className="text-center mt-2 text-sm font-bold">を身につけよう！</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* 発達段階の情報 */}
            <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-xl">
              <h4 className="text-sm font-bold text-blue-900 border-b-2 border-blue-900 pb-1 mb-2 flex items-center gap-1"><FaBook /> 発達段階について</h4>
              <p className="text-[9px] text-gray-700 mb-2 leading-relaxed bg-white/50 p-1.5 rounded-lg">
                お子様は今、運動神経が大きく発達する<strong className="text-blue-700">ゴールデンエイジ</strong>の時期にあります。この時期に習得した動きは一生忘れません。
              </p>

              <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1"><FaLightbulb /> この時期のポイント</h4>
              <p className="text-[9px] text-gray-700 mb-2 leading-relaxed bg-white/50 p-1.5 rounded-lg">
                <strong className="text-blue-700">多様な動き</strong>を経験することで、運動神経の土台が形成されます。楽しみながら様々なスポーツに挑戦しましょう。
              </p>

              <h4 className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1"><FaExclamationTriangle /> 注意点</h4>
              <p className="text-[9px] text-blue-800 leading-relaxed bg-blue-100 p-1.5 rounded-lg border border-blue-300">
                同じ動作の反復や勝ち負けへの過度なこだわりは避け、<strong>「できた！」という成功体験</strong>を積み重ねることが大切です。
              </p>
            </div>

            {/* 初来店のご案内 */}
            <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200">
              <h4 className="text-sm font-bold text-blue-900 border-b-2 border-blue-600 pb-1 mb-2 text-center flex items-center justify-center gap-1"><FaHandshake /> ぜひ教室にお越しください</h4>
              <p className="text-[9px] text-gray-600 mb-2 text-center leading-relaxed bg-white/50 p-1.5 rounded-lg">
                詳細な診断結果と、お子様に合った<br />
                専門的なトレーニング指導を受けられます！
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center bg-white p-2 rounded-lg shadow-md border-2 border-blue-200">
                  <div className="w-14 h-14 mx-auto mb-1 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    <span className="text-[9px] text-gray-400">QR</span>
                  </div>
                  <p className="text-[9px] font-bold text-blue-700 flex items-center justify-center gap-0.5"><FaCalendarAlt /> 体験予約</p>
                </div>
                <div className="text-center bg-white p-2 rounded-lg shadow-md border-2 border-blue-200">
                  <div className="w-14 h-14 mx-auto mb-1 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    <span className="text-[9px] text-gray-400">QR</span>
                  </div>
                  <p className="text-[9px] font-bold text-blue-700 flex items-center justify-center gap-0.5"><FaComments /> LINE相談</p>
                </div>
              </div>
              <p className="text-[9px] text-blue-700 mt-2 text-center font-medium bg-blue-100 p-1.5 rounded-lg flex items-center justify-center gap-1">
                <FaChartLine /> 専門的に丁寧に指導します！
              </p>
            </div>
          </div>

          {/* フッター：店舗情報 */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 rounded-xl text-center shadow-lg">
            <p className="text-base font-bold mb-0.5 flex items-center justify-center gap-2"><FaSchool /> かけっこ体幹教室</p>
            <p className="text-xs opacity-90">お子様の運動能力向上を全力でサポートします</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// サマリー版用コンパクトなトレーニング＆適性スポーツセクション
function DetailDemoSectionCompact() {
  const sampleSports = [
    { name: 'バスケ', icon: '🏀' },
    { name: 'サッカー', icon: '⚽' },
    { name: 'テニス', icon: '🎾' },
    { name: 'バドミントン', icon: '🏸' },
    { name: '陸上', icon: '🏃' },
    { name: 'ダンス', icon: '💃' }
  ]
  const sampleTrainings = [
    { name: 'カエルジャンプ', description: 'しゃがんでから勢いよくジャンプ', reps: '10回×3セット', category: '瞬発力' },
    { name: 'T字バランス', description: '片足でバランスをとる練習', reps: '30秒×左右3回', category: 'バランス' },
    { name: 'サイドステップ', description: '素早く足を動かす練習', reps: '5往復×3セット', category: '敏捷性' },
    { name: 'ボール投げ遊び', description: '正しいフォームでの投球', reps: '20回×2セット', category: '投力' }
  ]
  const sampleGoals = { grip: 15.5, jump: 148, dash: 3.42 }

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-lg mb-3">
        <h2 className="text-base text-white font-extrabold flex items-center gap-2">
          <FaBullseye /> トレーニング＆適性スポーツ
        </h2>
      </div>

      {/* 強み・弱み + 適性スポーツ */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* 強み・弱み */}
        <div className="space-y-2">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2">
            <span className="text-[9px] font-bold text-blue-700 bg-blue-200 px-1.5 py-0.5 rounded-full">レベルアップ</span>
            <div className="font-bold text-gray-800 text-sm mt-1">投力（6点）</div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-2">
            <span className="text-[9px] font-bold text-blue-800 bg-blue-300 px-1.5 py-0.5 rounded-full">得意項目</span>
            <div className="font-bold text-gray-800 text-sm mt-1">瞬発力（9点）</div>
          </div>
        </div>

        {/* 適性スポーツ */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2">
          <div className="text-[9px] font-bold text-blue-800 mb-1">適性スポーツ TOP6</div>
          <div className="flex flex-wrap gap-1">
            {sampleSports.map((sport) => (
              <span key={sport.name} className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-blue-600 text-white rounded text-[9px] font-bold">
                {sport.icon} {sport.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 50m予測 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-2 text-white mb-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm flex items-center gap-1"><FaRunning /> 50m走予測</span>
          <span className="text-xl font-black text-blue-200">11.5秒</span>
        </div>
      </div>

      {/* 重点トレーニング - 写真付き4つ */}
      <div className="mb-3 flex-1">
        <div className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-1">
          <FaDumbbell /> 重点トレーニング
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sampleTrainings.map((t, i) => (
            <div key={i} className="rounded-lg p-2 border-2 bg-blue-50 border-blue-200">
              <div className="flex gap-2">
                <div className="w-20 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-white shadow">
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-black text-[9px] shadow-sm flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700">
                      {i + 1}
                    </div>
                    <strong className="text-[10px] text-gray-800 truncate">{t.name}</strong>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                    {t.category}
                  </span>
                  <div className="text-[9px] text-gray-600 line-clamp-2 mt-1">{t.description}</div>
                  <div className="text-[9px] font-bold text-blue-700 flex items-center gap-0.5 mt-1"><FaClipboardList className="text-[8px]" /> {t.reps}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1ヶ月目標 */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 rounded-lg">
        <div className="text-center mb-2">
          <h4 className="text-sm font-bold flex items-center justify-center gap-1"><FaBullseye /> 1ヶ月後の目標</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/20 p-2 rounded text-center">
            <div className="text-[9px] opacity-90">握力</div>
            <div className="text-lg font-black text-blue-200">{sampleGoals.grip}kg</div>
          </div>
          <div className="bg-white/20 p-2 rounded text-center">
            <div className="text-[9px] opacity-90">立ち幅跳び</div>
            <div className="text-lg font-black text-blue-200">{sampleGoals.jump}cm</div>
          </div>
          <div className="bg-white/20 p-2 rounded text-center">
            <div className="text-[9px] opacity-90">15mダッシュ</div>
            <div className="text-lg font-black text-blue-200">{sampleGoals.dash}秒</div>
          </div>
        </div>
        <p className="text-[8px] text-center mt-2 opacity-60">※測定結果による評価・予測は統計データに基づく推定値です</p>
      </div>
    </div>
  )
}
