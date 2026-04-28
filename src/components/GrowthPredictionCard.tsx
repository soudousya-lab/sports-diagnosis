'use client'

import { useMemo, useState } from 'react'
import {
  GrowthPredictionInput,
  predictGrowth,
  Sex,
} from '@/lib/growth-prediction'

interface Props {
  initialHeightCm?: number
  initialAgeYears?: number
  initialSex?: Sex
  onResult?: (result: ReturnType<typeof predictGrowth>) => void
}

export default function GrowthPredictionCard({
  initialHeightCm,
  initialAgeYears,
  initialSex,
  onResult,
}: Props) {
  const [heightCm, setHeightCm] = useState<number>(initialHeightCm ?? 130)
  const [ageYears, setAgeYears] = useState<number>(initialAgeYears ?? 9)
  const [sex, setSex] = useState<Sex>(initialSex ?? 'male')
  const [fatherHeight, setFatherHeight] = useState<number | ''>('')
  const [motherHeight, setMotherHeight] = useState<number | ''>('')

  const result = useMemo(() => {
    const input: GrowthPredictionInput = {
      currentHeightCm: heightCm,
      ageYears,
      sex,
      fatherHeightCm: typeof fatherHeight === 'number' ? fatherHeight : undefined,
      motherHeightCm: typeof motherHeight === 'number' ? motherHeight : undefined,
    }
    const r = predictGrowth(input)
    onResult?.(r)
    return r
  }, [heightCm, ageYears, sex, fatherHeight, motherHeight, onResult])

  const toneColor: Record<'safe' | 'watch' | 'consult', string> = {
    safe: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    watch: 'bg-amber-50 border-amber-200 text-amber-800',
    consult: 'bg-red-50 border-red-200 text-red-800',
  }

  const phvLabel: Record<string, string> = {
    pre: 'スパート前',
    starting: 'スパート開始期',
    peak: 'ピーク期',
    decelerating: '減速期',
    'near-final': 'ほぼ最終身長',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs tracking-widest text-blue-600 font-bold">
          GROWTH PREDICTION
        </span>
        <div className="h-px flex-1 bg-blue-100" />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        身長の伸びしろ診断
      </h2>
      <p className="text-gray-600 text-sm leading-relaxed mb-6">
        現在の身長・年齢・性別から、成長曲線上の位置と18歳時点の予測身長を算出します。
        両親の身長を入力すると、目標身長予測の精度が上がります。
      </p>

      {/* 入力フォーム */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-700 font-medium">性別</span>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="male">男子</option>
            <option value="female">女子</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-700 font-medium">年齢（歳）</span>
          <input
            type="number"
            min={3}
            max={18}
            step={0.1}
            value={ageYears}
            onChange={(e) => setAgeYears(parseFloat(e.target.value) || 0)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-700 font-medium">現在の身長（cm）</span>
          <input
            type="number"
            min={50}
            max={200}
            step={0.1}
            value={heightCm}
            onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <div />
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">
            父の身長（cm）<span className="text-gray-400">任意</span>
          </span>
          <input
            type="number"
            min={140}
            max={210}
            step={0.1}
            value={fatherHeight}
            onChange={(e) => {
              const v = e.target.value
              setFatherHeight(v === '' ? '' : parseFloat(v) || 0)
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="入力で予測精度UP"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">
            母の身長（cm）<span className="text-gray-400">任意</span>
          </span>
          <input
            type="number"
            min={130}
            max={200}
            step={0.1}
            value={motherHeight}
            onChange={(e) => {
              const v = e.target.value
              setMotherHeight(v === '' ? '' : parseFloat(v) || 0)
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="入力で予測精度UP"
          />
        </label>
      </div>

      {/* 結果サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className={`rounded-xl border p-4 ${toneColor[result.sdCategory.tone]}`}>
          <p className="text-xs font-bold mb-1">現在のSD値</p>
          <p className="text-2xl font-bold">
            {result.sd >= 0 ? '+' : ''}
            {result.sd.toFixed(2)}
          </p>
          <p className="text-xs mt-1">{result.sdCategory.label}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-bold text-blue-700 mb-1">18歳時点の予測身長</p>
          <p className="text-2xl font-bold text-blue-700">
            約 {result.predictedAdult.center} cm
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {result.predictedAdult.min} 〜 {result.predictedAdult.max} cm の幅
          </p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs font-bold text-orange-700 mb-1">残りの伸びしろ</p>
          <p className="text-2xl font-bold text-orange-700">
            約 {result.remainingGrowthCm} cm
          </p>
          <p className="text-xs text-orange-700 mt-1">18歳まで</p>
        </div>
      </div>

      {/* 平均との比較 */}
      <div className="bg-gray-50 rounded-xl p-4 md:p-5 mb-6">
        <p className="text-xs font-bold text-gray-700 mb-2">同年齢の平均との比較</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {ageYears}歳{sex === 'male' ? '男子' : '女子'}の平均身長は約{' '}
          <strong>{result.norm.mean.toFixed(1)}cm</strong>（標準偏差 ±{result.norm.sd.toFixed(1)}cm）。
          現在の{heightCm}cmは平均より{' '}
          <strong>
            {(heightCm - result.norm.mean >= 0 ? '+' : '') + (heightCm - result.norm.mean).toFixed(1)}cm
          </strong>
          {' '}の位置にいます。
        </p>
      </div>

      {/* 目標身長 */}
      {result.targetHeight && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-5 mb-6">
          <p className="text-xs font-bold text-blue-700 mb-2">
            両親身長から計算した目標身長（Target Height）
          </p>
          <p className="text-sm text-blue-800 leading-relaxed">
            約 <strong>{result.targetHeight.center}cm</strong>（{result.targetHeight.min}〜
            {result.targetHeight.max}cm の幅）。
            これは遺伝要因のみから推定した値で、栄養・運動・睡眠・姿勢などの環境要因によって変動します。
          </p>
        </div>
      )}

      {/* PHVフェーズ */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-5 mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-xs font-bold text-emerald-700">
            成長スパートの位置（PHV推定）
          </p>
          <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
            {phvLabel[result.phv.phase]}
          </span>
        </div>
        <p className="text-sm text-emerald-800 leading-relaxed mb-2">
          {result.phv.message}
        </p>
        <p className="text-xs text-emerald-700">
          ピーク年齢の目安：約 {result.phv.peakAge}歳
          {result.phv.monthsToPeak > 0
            ? `（あと約${result.phv.monthsToPeak}ヶ月）`
            : `（${Math.abs(result.phv.monthsToPeak)}ヶ月前にピーク）`}
        </p>
      </div>

      {/* 免責事項 */}
      <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-4">
        ※ {result.disclaimer}
      </div>
    </div>
  )
}
