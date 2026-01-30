'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { runVolleyballDiagnosis, volleyballCategories, volleyballPositions } from '@/lib/volleyball-diagnosis'
import { HiOutlineTrash, HiOutlineSave, HiOutlineArrowLeft } from 'react-icons/hi'

type FormData = {
  // 選手情報
  name: string
  school_year: string
  gender: 'male' | 'female' | ''
  position: string
  team_name: string
  height: number | ''
  weight: number | ''
  // 測定データ
  vertical_jump: number | ''
  reach_height: number | ''
  spike_reach: number | ''
  approach_jump: number | ''
  continuous_jump: number | ''
  serve_speed: number | ''
  side_step: number | ''
  // 測定日
  measured_at: string
}

export default function EditMeasurementPage() {
  const router = useRouter()
  const params = useParams()
  const measurementId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [athleteId, setAthleteId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    school_year: '',
    gender: '',
    position: '',
    team_name: '',
    height: '',
    weight: '',
    vertical_jump: '',
    reach_height: '',
    spike_reach: '',
    approach_jump: '',
    continuous_jump: '',
    serve_speed: '',
    side_step: '',
    measured_at: ''
  })

  // 既存データの取得
  useEffect(() => {
    async function fetchData() {
      if (!measurementId) return

      try {
        const { data, error } = await supabase
          .from('volleyball_measurements')
          .select(`
            *,
            volleyball_athletes (*)
          `)
          .eq('id', measurementId)
          .single()

        if (error || !data) {
          console.error('Fetch error:', error)
          alert('データが見つかりません')
          router.push('/athlete-volley')
          return
        }

        const athlete = data.volleyball_athletes
        setAthleteId(athlete.id)
        setFormData({
          name: athlete.name || '',
          school_year: athlete.school_year || '',
          gender: athlete.gender || '',
          position: athlete.position || '',
          team_name: athlete.team_name || '',
          height: athlete.height || '',
          weight: athlete.weight || '',
          vertical_jump: data.vertical_jump ?? '',
          reach_height: data.reach_height ?? '',
          spike_reach: data.spike_reach ?? '',
          approach_jump: data.approach_jump ?? '',
          continuous_jump: data.continuous_jump ?? '',
          serve_speed: data.serve_speed ?? '',
          side_step: data.side_step ?? '',
          measured_at: data.measured_at ? data.measured_at.split('T')[0] : ''
        })
      } catch (err) {
        console.error('Error:', err)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [measurementId, router])

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // バリデーション
      if (!formData.name || !formData.school_year || !formData.gender) {
        alert('氏名、学年、性別は必須です')
        setIsSaving(false)
        return
      }

      // 選手情報の更新
      const { error: athleteError } = await supabase
        .from('volleyball_athletes')
        .update({
          name: formData.name,
          school_year: formData.school_year,
          gender: formData.gender,
          position: formData.position || null,
          team_name: formData.team_name || 'チームA',
          height: formData.height || null,
          weight: formData.weight || null
        })
        .eq('id', athleteId)

      if (athleteError) throw athleteError

      // 測定データの更新
      const { error: measurementError } = await supabase
        .from('volleyball_measurements')
        .update({
          vertical_jump: formData.vertical_jump || null,
          reach_height: formData.reach_height || null,
          spike_reach: formData.spike_reach || null,
          approach_jump: formData.approach_jump || null,
          continuous_jump: formData.continuous_jump || null,
          serve_speed: formData.serve_speed || null,
          side_step: formData.side_step || null,
          measured_at: formData.measured_at || new Date().toISOString()
        })
        .eq('id', measurementId)

      if (measurementError) throw measurementError

      // 診断結果を再計算
      const diagnosisResult = runVolleyballDiagnosis(
        formData.school_year,
        formData.gender as 'male' | 'female',
        {
          vertical_jump: formData.vertical_jump as number || undefined,
          reach_height: formData.reach_height as number || undefined,
          spike_reach: formData.spike_reach as number || undefined,
          approach_jump: formData.approach_jump as number || undefined,
          continuous_jump: formData.continuous_jump as number || undefined,
          serve_speed: formData.serve_speed as number || undefined,
          side_step: formData.side_step as number || undefined
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

      // 既存の診断結果を削除して新規作成
      await supabase
        .from('volleyball_results')
        .delete()
        .eq('measurement_id', measurementId)

      const { error: resultError } = await supabase
        .from('volleyball_results')
        .insert({
          measurement_id: measurementId,
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
      router.push(`/athlete-volley/result/${measurementId}`)
    } catch (err) {
      console.error('保存エラー:', err)
      alert('保存中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSaving(false)
    }
  }

  // 削除処理
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // 診断結果を削除
      await supabase
        .from('volleyball_results')
        .delete()
        .eq('measurement_id', measurementId)

      // 測定データを削除
      const { error } = await supabase
        .from('volleyball_measurements')
        .delete()
        .eq('id', measurementId)

      if (error) throw error

      // トップページへ遷移
      router.push('/athlete-volley')
    } catch (err) {
      console.error('削除エラー:', err)
      alert('削除中にエラーが発生しました')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // 測定項目から能力キーへの変換
  const getAbilityKeyFromItem = (item: string): string => {
    const mapping: Record<string, string> = {
      vertical_jump: 'jump_power',
      reach_height: 'reach',
      spike_reach: 'reach',
      approach_jump: 'reach',
      continuous_jump: 'continuous_power',
      serve_speed: 'serve_power',
      side_step: 'agility'
    }
    return mapping[item] || 'jump_power'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-700 py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <div className="flex justify-between items-center mb-4">
          <Link href={`/athlete-volley/result/${measurementId}`} className="inline-flex items-center text-orange-200 hover:text-white transition-colors text-sm">
            <HiOutlineArrowLeft className="w-4 h-4 mr-1" />
            結果ページに戻る
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="text-white p-4 sm:p-6 bg-gradient-to-r from-orange-600 to-orange-800">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 bg-white/20 rounded">NOBISHIRO ATHLETE</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-wider">測定データ編集</h1>
                <p className="text-xs sm:text-sm opacity-80 mt-1">
                  {formData.name} の測定データを編集
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <HiOutlineTrash className="w-4 h-4" />
                削除
              </button>
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
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">学年 *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.school_year}
                  onChange={(e) => handleChange('school_year', e.target.value)}
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
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 text-xs font-semibold">測定日</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  value={formData.measured_at}
                  onChange={(e) => handleChange('measured_at', e.target.value)}
                />
              </div>
            </div>

            {/* 身長・体重（プロテイン計算用） */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">体格情報（任意・プロテイン計算用）</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-600 text-xs font-semibold">身長</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="165.0"
                      className="flex-1 p-3 border border-gray-300 rounded-lg text-sm"
                      value={formData.height}
                      onChange={(e) => handleChange('height', parseFloat(e.target.value) || '')}
                    />
                    <span className="text-sm text-gray-600">cm</span>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-gray-600 text-xs font-semibold">体重</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="55.0"
                      className="flex-1 p-3 border border-gray-300 rounded-lg text-sm"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')}
                    />
                    <span className="text-sm text-gray-600">kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 測定データ */}
          <div className="p-4 sm:p-7">
            <h2 className="text-sm font-bold text-orange-900 mb-4 pl-3 border-l-4 border-orange-600">
              測定データ（7項目）
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

              {/* サーブスピード */}
              <MeasurementCard icon="S" title="サーブスピード" category="サーブ力">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="55.5"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    value={formData.serve_speed}
                    onChange={(e) => handleChange('serve_speed', parseFloat(e.target.value) || '')}
                  />
                  <span className="text-xs text-gray-600">km/h</span>
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
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="p-4 sm:p-7 text-center bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/athlete-volley/result/${measurementId}`}
                className="px-8 py-3 text-sm font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base font-bold text-white rounded-lg shadow-lg hover:transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-600 to-orange-800 flex items-center justify-center gap-2"
              >
                <HiOutlineSave className="w-5 h-5" />
                {isSaving ? '保存中...' : '変更を保存'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">測定データを削除しますか？</h3>
            <p className="text-sm text-gray-600 mb-6">
              この操作は取り消せません。測定データと診断結果が完全に削除されます。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除する'}
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
