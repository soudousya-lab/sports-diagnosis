'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  volleyballCategories,
  abilityCategories,
  getSchoolYearDisplay,
  getGrade,
  volleyballPositions,
  calcProteinIntake,
  generateWeeklySchedule,
  type WeeklySchedule
} from '@/lib/volleyball-diagnosis'
import {
  FaTrophy, FaChartBar, FaBullseye, FaMedal, FaRunning,
  FaDumbbell, FaLightbulb, FaPrint, FaUser, FaCalendarAlt, FaDrumstickBite
} from 'react-icons/fa'
import { HiOutlinePencil, HiOutlineClock } from 'react-icons/hi'

type MeasurementData = {
  id: string
  measured_at: string
  vertical_jump: number | null
  reach_height: number | null
  spike_reach: number | null
  approach_jump: number | null
  continuous_jump: number | null
  serve_speed: number | null
  side_step: number | null
  volleyball_athletes: {
    id: string
    name: string
    school_year: string
    gender: 'male' | 'female'
    position: string | null
    team_name: string
    height: number | null
    weight: number | null
  }
  volleyball_results: {
    overall_score: number
    physical_age: number
    physical_age_diff: number
    scores: Record<string, number>
    item_scores: Record<string, number>
    position_aptitudes: Array<{ position: string; name: string; aptitude: number; description: string }>
    strengths: Array<{ item: string; score: number; label: string }>
    weaknesses: Array<{ item: string; score: number; label: string }>
    recommended_trainings: Array<{
      name: string
      description: string
      reps: string
      effect: string
      priority: string
    }>
    goals: Record<string, number>
  }[]
}

export default function ResultPage() {
  const params = useParams()
  const measurementId = params.id as string

  const [data, setData] = useState<MeasurementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inputWeight, setInputWeight] = useState<number>(50) // デフォルト体重
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // 測定データと選手データを取得
        const { data: measurementData, error: fetchError } = await supabase
          .from('volleyball_measurements')
          .select(`
            *,
            volleyball_athletes (*)
          `)
          .eq('id', measurementId)
          .single()

        if (fetchError || !measurementData) {
          setError('測定データが見つかりません')
          setLoading(false)
          return
        }

        // 診断結果を別途取得（measurement_idで検索）
        const { data: resultData } = await supabase
          .from('volleyball_results')
          .select('*')
          .eq('measurement_id', measurementId)

        // データを結合してセット
        const combinedData = {
          ...measurementData,
          volleyball_results: resultData || []
        }

        setData(combinedData as MeasurementData)
        // 体重が登録されている場合は設定
        if (measurementData.volleyball_athletes?.weight) {
          setInputWeight(measurementData.volleyball_athletes.weight)
        }
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
      <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-600 mb-4">{error || 'データが見つかりません'}</p>
          <Link href="/athlete-volley" className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  const athlete = data.volleyball_athletes
  const result = data.volleyball_results?.[0]

  if (!athlete || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">データエラー</h1>
          <p className="text-gray-600 mb-4">診断結果のデータが不完全です</p>
          <Link href="/athlete-volley" className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  const getPositionName = (key: string | null) => {
    const pos = volleyballPositions.find(p => p.key === key)
    return pos?.name || '未設定'
  }

  // プロテイン摂取量計算
  const proteinInfo = calcProteinIntake(inputWeight, 'moderate')

  // 週間スケジュール生成
  const weeklySchedule = generateWeeklySchedule(
    result.weaknesses || [],
    result.strengths || []
  )

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'high': return '高強度'
      case 'moderate': return '中強度'
      case 'low': return '低強度'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700 py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン & アクション */}
        <div className="flex justify-between items-center mb-4">
          <Link href="/athlete-volley" className="inline-flex items-center text-orange-200 hover:text-white transition-colors text-sm">
            ← トップに戻る
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/athlete-volley/edit/${measurementId}`}
              className="inline-flex items-center gap-1 px-3 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              <HiOutlinePencil className="w-4 h-4" />
              編集
            </Link>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-2 bg-white text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors print:hidden"
            >
              <FaPrint className="w-4 h-4" />
              印刷
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div ref={printRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium px-2 py-0.5 bg-white/20 rounded inline-block mb-2">
                  NOBISHIRO ATHLETE VOLLEYBALL
                </div>
                <h1 className="text-2xl font-bold">{athlete.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                  <span className="px-2 py-0.5 bg-white/20 rounded">{getSchoolYearDisplay(athlete.school_year)}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded">{athlete.gender === 'male' ? '男子' : '女子'}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded">{getPositionName(athlete.position)}</span>
                </div>
                {athlete.team_name && (
                  <div className="text-xs mt-2 text-orange-200">{athlete.team_name}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-orange-200">測定日</div>
                <div className="text-lg font-bold">
                  {new Date(data.measured_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          </div>

          {/* 総合スコア */}
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-4 text-white text-center">
                <FaTrophy className="w-8 h-8 mx-auto mb-2 text-orange-200" />
                <div className="text-3xl font-bold">{result.overall_score}</div>
                <div className="text-xs text-orange-200">総合スコア / 100</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white text-center">
                <FaUser className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                <div className="text-3xl font-bold">{result.physical_age}</div>
                <div className="text-xs text-blue-200">フィジカル年齢</div>
                <div className="text-xs mt-1">
                  (実年齢 {result.physical_age_diff >= 0 ? '+' : ''}{result.physical_age_diff}歳)
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-4 text-white text-center">
                <FaMedal className="w-8 h-8 mx-auto mb-2 text-green-200" />
                <div className="text-lg font-bold">
                  {result.position_aptitudes?.[0]?.name || 'N/A'}
                </div>
                <div className="text-xs text-green-200">最適性ポジション</div>
                <div className="text-xs mt-1">
                  適性: {result.position_aptitudes?.[0]?.aptitude || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* 能力カテゴリスコア */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaChartBar className="text-orange-600" />
              能力カテゴリ分析
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(result.scores || {}).map(([key, score]) => {
                const { grade, colorClass } = getGrade(score)
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">{abilityCategories[key] || key}</div>
                    <div className={`text-2xl font-bold ${colorClass}`}>{score}</div>
                    <div className={`text-xs font-medium ${colorClass}`}>Grade {grade}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 測定項目詳細 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaRunning className="text-orange-600" />
              測定項目スコア
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { key: 'vertical_jump', value: data.vertical_jump, unit: 'cm' },
                { key: 'reach_height', value: data.reach_height, unit: 'cm' },
                { key: 'spike_reach', value: data.spike_reach, unit: 'cm' },
                { key: 'approach_jump', value: data.approach_jump, unit: 'cm' },
                { key: 'continuous_jump', value: data.continuous_jump, unit: 'cm' },
                { key: 'serve_speed', value: data.serve_speed, unit: 'km/h' },
                { key: 'side_step', value: data.side_step, unit: '回' }
              ].map(item => {
                if (item.value === null || item.value === undefined) return null
                const score = result.item_scores?.[item.key] || 5
                const { grade, colorClass } = getGrade(score)
                return (
                  <div key={item.key} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">{volleyballCategories[item.key]}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-900">{item.value}</span>
                      <span className="text-xs text-gray-500">{item.unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-medium ${colorClass}`}>Score: {score}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${colorClass} bg-gray-100`}>{grade}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ポジション適性 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaBullseye className="text-orange-600" />
              ポジション適性
            </h2>
            <div className="space-y-3">
              {result.position_aptitudes?.slice(0, 5).map((pos, index) => (
                <div key={pos.position} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{pos.name}</span>
                      <span className={`text-sm font-bold ${index === 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {pos.aptitude}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${index === 0 ? 'bg-orange-600' : 'bg-gray-400'}`}
                        style={{ width: `${pos.aptitude}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{pos.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 強み・弱み */}
          <div className="p-6 border-b border-gray-100">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 強み */}
              <div>
                <h3 className="text-md font-bold text-green-700 mb-3 flex items-center gap-2">
                  <FaTrophy className="text-green-600" />
                  強み TOP3
                </h3>
                <div className="space-y-2">
                  {result.strengths?.slice(0, 3).map((s, i) => (
                    <div key={s.item} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{s.label}</span>
                      <span className="text-lg font-bold text-green-600">{s.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 弱み */}
              <div>
                <h3 className="text-md font-bold text-orange-700 mb-3 flex items-center gap-2">
                  <FaLightbulb className="text-orange-600" />
                  強化ポイント
                </h3>
                <div className="space-y-2">
                  {result.weaknesses?.slice(0, 2).map((w, i) => (
                    <div key={w.item} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{w.label}</span>
                      <span className="text-lg font-bold text-orange-600">{w.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 週間トレーニングスケジュール */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-orange-600" />
              週間トレーニングスケジュール
            </h2>
            <div className="space-y-3">
              {Object.entries(weeklySchedule).map(([dayKey, dayData]) => (
                <div key={dayKey} className={`rounded-lg border-2 overflow-hidden ${
                  dayData.sessions.length === 0 ? 'border-gray-200 bg-gray-50' : 'border-orange-200'
                }`}>
                  <div className={`px-4 py-2 flex items-center justify-between ${
                    dayData.sessions.length === 0 ? 'bg-gray-100' : 'bg-orange-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{dayData.day}</span>
                      <span className={`text-sm px-2 py-0.5 rounded ${
                        dayData.sessions.length === 0 ? 'bg-gray-200 text-gray-600' : 'bg-orange-600 text-white'
                      }`}>
                        {dayData.focus}
                      </span>
                    </div>
                  </div>
                  {dayData.sessions.length > 0 ? (
                    <div className="p-4 space-y-2">
                      {dayData.sessions.map((session, idx) => (
                        <div key={idx} className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500 min-w-[70px]">
                            <HiOutlineClock className="w-4 h-4" />
                            {session.time}
                          </div>
                          <span className={`px-2 py-0.5 rounded border text-xs ${getIntensityColor(session.intensity)}`}>
                            {getIntensityLabel(session.intensity)}
                          </span>
                          <span className="text-gray-700 flex-1">{session.menu}</span>
                          <span className="text-gray-400 text-xs">{session.duration}</span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        {dayData.rest}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-gray-500">
                      {dayData.rest}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* プロテイン摂取量ガイド */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaDrumstickBite className="text-orange-600" />
              タンパク質摂取ガイド
            </h2>

            {/* 体重入力 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-medium text-gray-700">体重を入力:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(parseFloat(e.target.value) || 50)}
                    className="w-24 p-2 border border-gray-300 rounded text-sm"
                    min="30"
                    max="120"
                    step="0.5"
                  />
                  <span className="text-sm text-gray-600">kg</span>
                </div>
                <span className="text-xs text-gray-500">
                  ※体重に応じて推奨摂取量が計算されます
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* 摂取量 */}
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-5 text-white">
                <h3 className="text-sm font-medium text-green-100 mb-2">1日の推奨タンパク質摂取量</h3>
                <div className="text-4xl font-bold mb-1">{proteinInfo.daily}g</div>
                <div className="text-sm text-green-200">
                  1回あたり約 {proteinInfo.perMeal}g を目安に
                </div>
                <div className="mt-3 pt-3 border-t border-green-400/30 text-xs text-green-100">
                  <p>計算式: 体重 {inputWeight}kg × 1.6g = {proteinInfo.daily}g</p>
                  <p className="mt-1">（中程度の運動量として計算）</p>
                </div>
              </div>

              {/* 摂取タイミング */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">摂取タイミング</h3>
                <div className="space-y-2">
                  {proteinInfo.timing.map((timing, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-sm ${idx === 2 ? 'font-bold text-orange-600' : 'text-gray-700'}`}>
                        {timing}
                        {idx === 2 && <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">ゴールデンタイム</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* アドバイス */}
            <div className="mt-4 bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-yellow-800 mb-2">プロテイン摂取のコツ</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {proteinInfo.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* 食品例 */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: '鶏むね肉100g', protein: '23g', icon: '🍗' },
                { name: 'ゆで卵1個', protein: '6g', icon: '🥚' },
                { name: '納豆1パック', protein: '8g', icon: '🫘' },
                { name: 'プロテイン1杯', protein: '20g', icon: '🥛' }
              ].map((food, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">{food.icon}</div>
                  <div className="text-xs text-gray-600">{food.name}</div>
                  <div className="text-sm font-bold text-gray-900">{food.protein}</div>
                </div>
              ))}
            </div>
          </div>

          {/* トレーニング推奨 */}
          {result.recommended_trainings && result.recommended_trainings.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaDumbbell className="text-orange-600" />
                おすすめトレーニング
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.recommended_trainings.map((training, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    training.priority === 'high' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    {training.priority === 'high' && (
                      <span className="text-xs px-2 py-0.5 bg-orange-600 text-white rounded mb-2 inline-block">最優先</span>
                    )}
                    <h4 className="font-bold text-gray-900">{training.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{training.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{training.reps}</span>
                      <span>{training.effect}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 目標設定 */}
          {result.goals && Object.keys(result.goals).length > 0 && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaBullseye className="text-orange-600" />
                1ヶ月後の目標
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(result.goals).map(([key, value]) => {
                  const measurementData = data as unknown as Record<string, number | null>
                  const currentValue = measurementData[key]
                  return (
                    <div key={key} className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">{volleyballCategories[key] || key}</div>
                      <div className="text-lg font-bold text-blue-600">{value}</div>
                      {currentValue && (
                        <div className="text-xs text-gray-400">現在: {currentValue}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* フッター */}
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
            <p>&copy; 2025 NOBISHIRO ATHLETE VOLLEYBALL</p>
          </div>
        </div>
      </div>
    </div>
  )
}
