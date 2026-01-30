'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { runVolleyballDiagnosis, volleyballCategories, volleyballPositions } from '@/lib/volleyball-diagnosis'

type FormData = {
  // 選手情報
  name: string
  school_year: string
  gender: 'male' | 'female' | ''
  position: string
  team_name: string
  // 測定データ
  vertical_jump: number | ''
  standing_jump: number | ''
  reach_height: number | ''
  spike_reach: number | ''
  approach_jump: number | ''
  continuous_jump: number | ''
  ball_throw: number | ''
  side_step: number | ''
  single_leg_balance: number | ''
}

export default function NewMeasurementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700 flex items-center justify-center text-white">読み込み中...</div>}>
      <NewMeasurementContent />
    </Suspense>
  )
}

function NewMeasurementContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const athleteIdParam = searchParams.get('athlete_id')

  const [isLoading, setIsLoading] = useState(false)
  const [existingAthleteId, setExistingAthleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    school_year: '',
    gender: '',
    position: '',
    team_name: '',
    vertical_jump: '',
    standing_jump: '',
    reach_height: '',
    spike_reach: '',
    approach_jump: '',
    continuous_jump: '',
    ball_throw: '',
    side_step: '',
    single_leg_balance: ''
  })

  // 既存選手のデータを取得
  useEffect(() => {
    async function fetchAthlete() {
      if (!athleteIdParam) return

      const { data, error } = await supabase
        .from('volleyball_athletes')
        .select('*')
        .eq('id', athleteIdParam)
        .single()

      if (!error && data) {
        setExistingAthleteId(data.id)
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          school_year: data.school_year || '',
          gender: data.gender || '',
          position: data.position || '',
          team_name: data.team_name || ''
        }))
      }
    }

    fetchAthlete()
  }, [athleteIdParam])

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // バリデーション
      if (!formData.name || !formData.school_year || !formData.gender) {
        alert('氏名、学年、性別は必須です')
        setIsLoading(false)
        return
      }

      // 測定項目の少なくとも1つは入力必須
      const hasAnyMeasurement = [
        formData.vertical_jump,
        formData.standing_jump,
        formData.reach_height,
        formData.spike_reach,
        formData.approach_jump,
        formData.continuous_jump,
        formData.ball_throw,
        formData.side_step,
        formData.single_leg_balance
      ].some(v => v !== '' && v !== null && v !== undefined)

      if (!hasAnyMeasurement) {
        alert('測定項目を少なくとも1つ入力してください')
        setIsLoading(false)
        return
      }

      let athleteId = existingAthleteId

      // 選手データの保存（新規の場合）
      if (!athleteId) {
        const { data: athleteData, error: athleteError } = await supabase
          .from('volleyball_athletes')
          .insert({
            name: formData.name,
            school_year: formData.school_year,
            gender: formData.gender,
            position: formData.position || null,
            team_name: formData.team_name || 'チームA'
          })
          .select()
          .single()

        if (athleteError) throw athleteError
        athleteId = athleteData.id
      }

      // 測定データの保存
      const { data: measurementData, error: measurementError } = await supabase
        .from('volleyball_measurements')
        .insert({
          athlete_id: athleteId,
          vertical_jump: formData.vertical_jump || null,
          standing_jump: formData.standing_jump || null,
          reach_height: formData.reach_height || null,
          spike_reach: formData.spike_reach || null,
          approach_jump: formData.approach_jump || null,
          continuous_jump: formData.continuous_jump || null,
          ball_throw: formData.ball_throw || null,
          side_step: formData.side_step || null,
          single_leg_balance: formData.single_leg_balance || null
        })
        .select()
        .single()

      if (measurementError) throw measurementError

      // 診断実行
      const diagnosisResult = runVolleyballDiagnosis(
        formData.school_year,
        formData.gender as 'male' | 'female',
        {
          vertical_jump: formData.vertical_jump as number || undefined,
          standing_jump: formData.standing_jump as number || undefined,
          reach_height: formData.reach_height as number || undefined,
          spike_reach: formData.spike_reach as number || undefined,
          approach_jump: formData.approach_jump as number || undefined,
          continuous_jump: formData.continuous_jump as number || undefined,
          ball_throw: formData.ball_throw as number || undefined,
          side_step: formData.side_step as number || undefined,
          single_leg_balance: formData.single_leg_balance as number || undefined
        }
      )

      // トレーニング取得
      const schoolLevel = ['1', '2', '3'].includes(formData.school_year) ? 'junior_high' : 'high_school'
      const { data: trainings } = await supabase
        .from('volleyball_trainings')
        .select('*')
        .eq('school_level', schoolLevel)
        .order('sort_order')

      // 弱点に基づいてトレーニング選択
      const selectedTrainings = []
      if (diagnosisResult.weaknesses && trainings) {
        for (const weakness of diagnosisResult.weaknesses) {
          const abilityKey = getAbilityKeyFromItem(weakness.item)
          const matchingTrainings = trainings.filter(t => t.ability_key === abilityKey)
          if (matchingTrainings.length > 0) {
            selectedTrainings.push({
              ...matchingTrainings[0],
              priority: selectedTrainings.length === 0 ? 'high' : 'medium'
            })
          }
        }
      }

      // 診断結果の保存
      const { error: resultError } = await supabase
        .from('volleyball_results')
        .insert({
          measurement_id: measurementData.id,
          overall_score: diagnosisResult.overallScore,
          physical_age: diagnosisResult.physicalAge,
          physical_age_diff: diagnosisResult.physicalAgeDiff,
          scores: diagnosisResult.abilityScores,
          item_scores: diagnosisResult.itemScores,
          position_aptitudes: diagnosisResult.positionAptitudes,
          strengths: diagnosisResult.strengths,
          weaknesses: diagnosisResult.weaknesses,
          recommended_trainings: selectedTrainings.slice(0, 4),
          goals: diagnosisResult.goals
        })

      if (resultError) throw resultError

      // 結果ページへ遷移
      router.push(`/athlete-volley/result/${measurementData.id}`)
    } catch (err) {
      console.error('保存エラー:', err)
      alert('保存中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  // 測定項目から能力キーへの変換
  const getAbilityKeyFromItem = (item: string): string => {
    const mapping: Record<string, string> = {
      vertical_jump: 'jump_power',
      standing_jump: 'jump_power',
      reach_height: 'reach',
      spike_reach: 'reach',
      approach_jump: 'reach',
      continuous_jump: 'continuous_power',
      ball_throw: 'throw_power',
      side_step: 'agility',
      single_leg_balance: 'balance'
    }
    return mapping[item] || 'jump_power'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700 py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <Link href="/athlete-volley" className="inline-flex items-center text-orange-200 hover:text-white transition-colors mb-4 text-sm">
          ← トップに戻る
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="text-white p-4 sm:p-6 bg-gradient-to-r from-orange-600 to-orange-800">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 bg-white/20 rounded">NOBISHIRO ATHLETE</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-wider">バレーボール測定入力</h1>
                <p className="text-xs sm:text-sm opacity-80 mt-1">
                  {existingAthleteId ? '追加測定' : '新規選手登録 & 測定'}
                </p>
              </div>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="p-4 sm:p-7 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-bold text-orange-900 mb-4 pl-3 border-l-4 border-orange-600">選手情報</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">氏名 *</label>
                <input
                  type="text"
                  placeholder="山田 花子"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!!existingAthleteId}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">学年 *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.school_year}
                  onChange={(e) => handleChange('school_year', e.target.value)}
                  disabled={!!existingAthleteId}
                >
                  <option value="">選択</option>
                  <option value="1">中学1年</option>
                  <option value="2">中学2年</option>
                  <option value="3">中学3年</option>
                  <option value="h1">高校1年</option>
                  <option value="h2">高校2年</option>
                  <option value="h3">高校3年</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">性別 *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  disabled={!!existingAthleteId}
                >
                  <option value="">選択</option>
                  <option value="male">男子</option>
                  <option value="female">女子</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">ポジション</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                >
                  <option value="">未設定</option>
                  {volleyballPositions.map(pos => (
                    <option key={pos.key} value={pos.key}>{pos.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">チーム名</label>
                <input
                  type="text"
                  placeholder="〇〇中学校"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.team_name}
                  onChange={(e) => handleChange('team_name', e.target.value)}
                  disabled={!!existingAthleteId}
                />
              </div>
            </div>
          </div>

          {/* 測定データ */}
          <div className="p-4 sm:p-7">
            <h2 className="text-sm font-bold text-orange-900 mb-4 pl-3 border-l-4 border-orange-600">
              測定データ（9項目）
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* 垂直跳び */}
              <MeasurementCard icon="跳" title="垂直跳び" category="跳躍力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="45"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.vertical_jump}
                    onChange={(e) => handleChange('vertical_jump', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </MeasurementCard>

              {/* 立ち幅跳び */}
              <MeasurementCard icon="幅" title="立ち幅跳び" category="跳躍力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="180"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.standing_jump}
                    onChange={(e) => handleChange('standing_jump', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </MeasurementCard>

              {/* 指高リーチ */}
              <MeasurementCard icon="指" title="指高リーチ" category="リーチ">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="205"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.reach_height}
                    onChange={(e) => handleChange('reach_height', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </MeasurementCard>

              {/* 最高到達点 */}
              <MeasurementCard icon="到" title="最高到達点" category="スパイク力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="260"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.spike_reach}
                    onChange={(e) => handleChange('spike_reach', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </MeasurementCard>

              {/* 助走ジャンプ */}
              <MeasurementCard icon="助" title="助走ジャンプ" category="助走力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="50"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.approach_jump}
                    onChange={(e) => handleChange('approach_jump', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </MeasurementCard>

              {/* 連続立ち幅跳び */}
              <MeasurementCard icon="連" title="連続立ち幅跳び" category="連続跳躍力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="600"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.continuous_jump}
                    onChange={(e) => handleChange('continuous_jump', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </MeasurementCard>

              {/* ボール投げ(3kg) */}
              <MeasurementCard icon="投" title="ボール投げ(3kg)" category="投力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="6.5"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.ball_throw}
                    onChange={(e) => handleChange('ball_throw', parseFloat(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">m</span>
                </div>
              </MeasurementCard>

              {/* 反復横跳び */}
              <MeasurementCard icon="敏" title="反復横跳び" category="敏捷性">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="50"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.side_step}
                    onChange={(e) => handleChange('side_step', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">回/20秒</span>
                </div>
              </MeasurementCard>

              {/* 片足立ちバランス */}
              <MeasurementCard icon="バ" title="片足立ちバランス" category="バランス">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="1"
                    placeholder="45"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.single_leg_balance}
                    onChange={(e) => handleChange('single_leg_balance', parseInt(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">秒</span>
                </div>
              </MeasurementCard>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="p-4 sm:p-7 text-center bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base font-bold text-white rounded-lg shadow-lg hover:transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-600 to-orange-800"
            >
              {isLoading ? '保存中...' : '診断を実行'}
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
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:border-orange-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
