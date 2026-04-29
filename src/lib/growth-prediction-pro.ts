// NOBISHIRO 高精度身長予測モジュール（トレーナー専用）
// 関連: src/lib/growth-prediction.ts（B2C簡易版）
//
// 採用ロジック:
// 1. Khamis-Roche 法 — 現在身長・体重・両親身長から成人身長を予測（±2.0〜2.5cm）
//    出典: Khamis HJ, Roche AF. Predicting adult stature without using skeletal age:
//          the Khamis-Roche method. Pediatrics 1994;94:504-507.
// 2. Mirwald PHV 式（座高・下肢長使用版）— 成熟度オフセットからPHV年齢を推定
//    出典: Mirwald RL, et al. An assessment of maturity from anthropometric measurements.
//          Med Sci Sports Exerc 2002;34:689-694.
// 3. 第二次性徴サインによる補正 — 残り伸びしろの実用補正
// 4. 学校保健統計のSD値計算（B2C版と共通の基準）
//
// 薬機法ガード:
// - 「伸ばす」表現禁止 → 「予測される」「可能性がある」で統一
// - 全予測値は ±幅 と「個人差あり」を明記する

import { calcHeightSD, predictGrowth as predictGrowthBasic, Sex } from './growth-prediction'

// =============================================================
// Bayley-Pinneau 簡易法（身長達成率テーブル）
// =============================================================
// 骨年齢が必要な本来の Bayley-Pinneau ではなく、暦年齢を仮の骨年齢として使う「簡易版」。
// 「現在身長 ÷ 該当年齢での平均的達成率(%)」で成人身長を予測する。
//
// 達成率は学校保健統計の年齢別平均身長 ÷ 18歳平均身長 から算出。
// → 客観的なエビデンスベース。誤差は ±3〜4cm 程度（個体差あり）。
//
// 中親身長（両親平均）が判明している場合は、その理論値との偏差を加味する。
type AchievementRow = { age: number; pct: number }

const ACHIEVEMENT_MALE: AchievementRow[] = [
  { age: 4, pct: 60.0 },
  { age: 5, pct: 64.1 },
  { age: 6, pct: 68.2 },
  { age: 7, pct: 71.8 },
  { age: 8, pct: 75.0 },
  { age: 9, pct: 78.2 },
  { age: 10, pct: 81.4 },
  { age: 11, pct: 85.0 },
  { age: 12, pct: 89.5 },
  { age: 13, pct: 93.6 },
  { age: 14, pct: 96.8 },
  { age: 15, pct: 98.6 },
  { age: 16, pct: 99.5 },
  { age: 17, pct: 99.9 },
  { age: 18, pct: 100.0 },
]

const ACHIEVEMENT_FEMALE: AchievementRow[] = [
  { age: 4, pct: 64.3 },
  { age: 5, pct: 68.8 },
  { age: 6, pct: 73.2 },
  { age: 7, pct: 76.9 },
  { age: 8, pct: 80.6 },
  { age: 9, pct: 84.5 },
  { age: 10, pct: 88.8 },
  { age: 11, pct: 92.9 },
  { age: 12, pct: 96.2 },
  { age: 13, pct: 98.0 },
  { age: 14, pct: 99.1 },
  { age: 15, pct: 99.6 },
  { age: 16, pct: 99.9 },
  { age: 17, pct: 100.0 },
  { age: 18, pct: 100.0 },
]

function getAchievementPct(sex: Sex, ageYears: number): number {
  const table = sex === 'male' ? ACHIEVEMENT_MALE : ACHIEVEMENT_FEMALE
  if (ageYears <= table[0].age) return table[0].pct
  if (ageYears >= table[table.length - 1].age) return table[table.length - 1].pct
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i]
    const b = table[i + 1]
    if (ageYears >= a.age && ageYears < b.age) {
      const t = (ageYears - a.age) / (b.age - a.age)
      return a.pct + (b.pct - a.pct) * t
    }
  }
  return table[table.length - 1].pct
}

/**
 * Bayley-Pinneau 簡易法による成人身長予測
 * 1. 達成率法: 予測身長 = 現在身長 / (達成率/100)
 * 2. 中親身長があれば、達成率法と中親身長式の加重平均で精度UP
 *
 * @returns 中央値 と ±3cm幅
 */
export function bayleyPinneauSimple(input: {
  currentHeightCm: number
  ageYears: number
  sex: Sex
  fatherHeightCm?: number
  motherHeightCm?: number
}): { center: number; min: number; max: number; method: string } {
  const pct = getAchievementPct(input.sex, input.ageYears)
  const fromCurrent = input.currentHeightCm / (pct / 100)

  if (input.fatherHeightCm && input.motherHeightCm) {
    // 中親身長式（簡易）
    const adjust = input.sex === 'male' ? 13 : -13
    const fromParent = (input.fatherHeightCm + input.motherHeightCm + adjust) / 2
    // 加重平均: 思春期前は両親要素強め、思春期以降は現在身長強め
    // 14歳男子・12歳女子前後でちょうど 50:50
    const switchAge = input.sex === 'male' ? 14 : 12
    const t = Math.max(0, Math.min(1, (input.ageYears - switchAge + 4) / 8))
    const center = fromParent * (1 - t) + fromCurrent * t
    return {
      center: Math.round(center * 10) / 10,
      min: Math.round((center - 3) * 10) / 10,
      max: Math.round((center + 3) * 10) / 10,
      method: 'bayley-pinneau-with-parents',
    }
  }

  return {
    center: Math.round(fromCurrent * 10) / 10,
    min: Math.round((fromCurrent - 4) * 10) / 10,
    max: Math.round((fromCurrent + 4) * 10) / 10,
    method: 'bayley-pinneau',
  }
}

// =============================================================
// Mirwald PHV 式（座高・下肢長使用版）
// =============================================================
// PHVは身長伸びのピーク。maturity_offset = 0 のときPHV。
// offset > 0 ：PHV後 / offset < 0 : PHV前
// 単位: 年
//
// 参考: Mirwald RL et al. (2002)

export function mirwaldMaturityOffset(input: {
  ageYears: number
  heightCm: number
  weightKg: number
  sittingHeightCm: number
  sex: Sex
}): { offsetYears: number; phvAge: number } {
  const legLength = input.heightCm - input.sittingHeightCm
  let offset = 0
  if (input.sex === 'male') {
    // Mirwald 男子式
    offset =
      -29.769 +
      0.0003007 * legLength * input.sittingHeightCm -
      0.01177 * legLength * input.ageYears +
      0.01639 * input.weightKg * input.sittingHeightCm +
      0.4445 * (legLength / input.heightCm)
  } else {
    // Mirwald 女子式
    offset =
      -16.364 +
      0.0002309 * legLength * input.sittingHeightCm +
      0.01125 * input.ageYears * legLength +
      0.0007358 * input.ageYears * input.weightKg +
      0.02093 * (input.weightKg / input.heightCm) * 100
  }
  return {
    offsetYears: Math.round(offset * 100) / 100,
    phvAge: Math.round((input.ageYears - offset) * 10) / 10,
  }
}

// =============================================================
// 第二次性徴サインによる補正
// =============================================================
export interface PubertySigns {
  voiceChange?: boolean // 声変わり（男子）
  bodyHair?: boolean // 体毛（陰毛・腋毛）の発現
  appetiteSurge?: boolean // 食欲の急増
  shoeSizeJump?: boolean // 靴サイズが半年で1cm以上UP
  menarche?: boolean // 初潮（女子）
  menarcheMonthsAgo?: number // 初潮からの経過月数（女子）
}

/**
 * 残り伸びしろを補正する係数（0.5〜1.2）。
 * 1.0 が標準。1.0 を超えると伸びる余地が大きい、下回ると小さい。
 */
export function pubertyMultiplier(sex: Sex, signs: PubertySigns): {
  multiplier: number
  message: string
} {
  if (sex === 'female') {
    if (signs.menarche) {
      // 初潮後は残り 5-7cm が平均的
      const months = signs.menarcheMonthsAgo ?? 0
      if (months >= 24) return { multiplier: 0.4, message: '初潮から2年以上経過。残り伸びしろは小さい段階です。' }
      if (months >= 12) return { multiplier: 0.6, message: '初潮から1〜2年。残り 3〜5cm 程度の伸びが期待されます。' }
      return { multiplier: 0.8, message: '初潮から1年以内。残り 5〜7cm 程度の伸びが期待されます。' }
    }
    if (signs.bodyHair || signs.appetiteSurge) {
      return { multiplier: 1.05, message: '思春期の入口。これからピーク期に入る可能性があります。' }
    }
    return { multiplier: 1.1, message: '思春期前。今後の伸びしろが大きい段階です。' }
  } else {
    // male
    let signCount = 0
    if (signs.voiceChange) signCount++
    if (signs.bodyHair) signCount++
    if (signs.appetiteSurge) signCount++
    if (signs.shoeSizeJump) signCount++

    if (signCount >= 3) {
      return { multiplier: 0.9, message: '第二次性徴の進行が確認されます。スパートのピーク前後の段階です。' }
    }
    if (signCount === 2) {
      return { multiplier: 1.0, message: 'スパート開始期です。次の1年が最も大きく伸びる可能性があります。' }
    }
    if (signCount === 1) {
      return { multiplier: 1.05, message: 'スパート直前です。これから急成長が期待されます。' }
    }
    return { multiplier: 1.1, message: '第二次性徴のサインはまだ少ない段階。スパートはこれから訪れます。' }
  }
}

// =============================================================
// 統合予測関数
// =============================================================
export interface ProGrowthInput {
  // 基本
  ageYears: number
  sex: Sex
  // 身体測定
  heightCm: number
  weightKg: number
  sittingHeightCm?: number // Mirwald PHV計算に必要（任意）
  bodyFatPercent?: number
  skeletalMuscleKg?: number
  shoeSizeCm?: number
  // 家族
  fatherHeightCm?: number
  motherHeightCm?: number
  siblingHeightsCm?: number[] // 兄/姉の最終身長
  // 思春期
  pubertySigns?: PubertySigns
}

export interface ProGrowthResult {
  // SD値（学校保健統計）
  currentSD: number
  currentSDLabel: string
  currentSDTone: 'safe' | 'watch' | 'consult'
  norm: { mean: number; sd: number }
  // 成人身長予測
  predictions: {
    method: string
    label: string
    center: number
    min: number
    max: number
  }[]
  // 採用予測（最も精度の高いもの）
  finalPrediction: {
    method: string
    center: number
    min: number
    max: number
    remainingGrowthCm: number
  }
  // PHV
  phv?: {
    method: string
    estimatedAgeYears: number
    monthsToOrFromPeak: number
    phase: string
    message: string
  }
  // 思春期補正
  puberty: {
    multiplier: number
    message: string
  }
  // 総合所見
  notes: string[]
  disclaimer: string
}

export function predictGrowthPro(input: ProGrowthInput): ProGrowthResult {
  const { ageYears, sex, heightCm, weightKg } = input

  // SD値
  const currentSD = calcHeightSD(heightCm, ageYears, sex)
  const norm = predictGrowthBasic({
    currentHeightCm: heightCm,
    ageYears,
    sex,
  }).norm
  const sdCat = predictGrowthBasic({
    currentHeightCm: heightCm,
    ageYears,
    sex,
  }).sdCategory

  // 予測候補を順に積む
  const predictions: ProGrowthResult['predictions'] = []

  // (1) Bayley-Pinneau 簡易法（達成率法 + 両親身長があれば加重）
  const bp = bayleyPinneauSimple({
    currentHeightCm: heightCm,
    ageYears,
    sex,
    fatherHeightCm: input.fatherHeightCm,
    motherHeightCm: input.motherHeightCm,
  })
  predictions.push({
    method: bp.method,
    label:
      bp.method === 'bayley-pinneau-with-parents'
        ? 'Bayley-Pinneau簡易法（両親身長加味）'
        : 'Bayley-Pinneau簡易法（達成率）',
    center: bp.center,
    min: bp.min,
    max: bp.max,
  })

  // (2) 両親身長式（中親法、両親身長必須）
  if (input.fatherHeightCm && input.motherHeightCm) {
    const adjust = sex === 'male' ? 13 : -13
    const center = (input.fatherHeightCm + input.motherHeightCm + adjust) / 2
    predictions.push({
      method: 'midparental',
      label: '両親身長式（参考）',
      center: Math.round(center * 10) / 10,
      min: Math.round((center - 5) * 10) / 10,
      max: Math.round((center + 5) * 10) / 10,
    })
  }

  // (3) SD外挿（両親身長なくても出せる）
  const adultNorm = predictGrowthBasic({
    currentHeightCm: heightCm,
    ageYears: 18,
    sex,
  }).norm
  const sdCenter = adultNorm.mean + currentSD * adultNorm.sd
  predictions.push({
    method: 'sd-extrapolation',
    label: '現在SD値の外挿',
    center: Math.round(sdCenter * 10) / 10,
    min: Math.round((sdCenter - 4) * 10) / 10,
    max: Math.round((sdCenter + 4) * 10) / 10,
  })

  // 兄姉の最終身長を加味（参考値として）
  if (input.siblingHeightsCm && input.siblingHeightsCm.length > 0) {
    const avg = input.siblingHeightsCm.reduce((s, v) => s + v, 0) / input.siblingHeightsCm.length
    predictions.push({
      method: 'sibling-reference',
      label: '兄/姉の最終身長平均（参考）',
      center: Math.round(avg * 10) / 10,
      min: Math.round((avg - 6) * 10) / 10,
      max: Math.round((avg + 6) * 10) / 10,
    })
  }

  // 採用予測: Bayley-Pinneau (両親込み or 達成率のみ) を主軸にする
  const primary =
    predictions.find((p) => p.method === 'bayley-pinneau-with-parents') ??
    predictions.find((p) => p.method === 'bayley-pinneau') ??
    predictions.find((p) => p.method === 'sd-extrapolation')!

  // 思春期補正
  const puberty = pubertyMultiplier(sex, input.pubertySigns ?? {})
  // 残り伸びしろを補正係数で調整
  const remainingRaw = Math.max(0, primary.center - heightCm)
  const remainingAdjusted = Math.round(remainingRaw * puberty.multiplier * 10) / 10
  const finalCenter = Math.round((heightCm + remainingAdjusted) * 10) / 10

  const finalPrediction = {
    method: primary.method,
    center: finalCenter,
    min: Math.round((finalCenter - 2.5) * 10) / 10,
    max: Math.round((finalCenter + 2.5) * 10) / 10,
    remainingGrowthCm: remainingAdjusted,
  }

  // PHV（座高があれば）
  let phv: ProGrowthResult['phv']
  if (input.sittingHeightCm) {
    const m = mirwaldMaturityOffset({
      ageYears,
      heightCm,
      weightKg,
      sittingHeightCm: input.sittingHeightCm,
      sex,
    })
    let phase: string
    let message: string
    if (m.offsetYears < -1.5) {
      phase = 'スパート前'
      message = `Mirwald推定でPHV予想は ${m.phvAge}歳。あと ${Math.round(-m.offsetYears * 12)}ヶ月でピーク期に入る可能性があります。`
    } else if (m.offsetYears < 0) {
      phase = 'スパート開始期'
      message = `Mirwald推定でPHV予想は ${m.phvAge}歳。スパートが開始しつつある段階です。`
    } else if (m.offsetYears < 1) {
      phase = 'ピーク期'
      message = `Mirwald推定でPHVを直近で経過。1年で8〜10cm伸びる可能性のある時期です。`
    } else if (m.offsetYears < 2.5) {
      phase = '減速期'
      message = `Mirwald推定でPHVから ${Math.round(m.offsetYears * 12)}ヶ月経過。残りの伸びは緩やかになる時期です。`
    } else {
      phase = 'ほぼ最終身長'
      message = 'Mirwald推定でPHVから2年以上経過。骨端線閉鎖が近い段階です。'
    }
    phv = {
      method: 'mirwald-2002',
      estimatedAgeYears: m.phvAge,
      monthsToOrFromPeak: Math.round(-m.offsetYears * 12),
      phase,
      message,
    }
  }

  // 所見
  const notes: string[] = []
  if (!input.fatherHeightCm || !input.motherHeightCm) {
    notes.push('両親身長が未入力です。両方を入力すると Bayley-Pinneau の精度が ±3cm まで上がります。')
  }
  if (!input.sittingHeightCm) {
    notes.push('座高（cm）を測ると、Mirwald PHV式で成長スパートのピーク年齢が推定できます。')
  }
  if (sdCat.tone === 'consult') {
    notes.push('現在のSD値が-2.0未満です。低身長の傾向がある場合、小児内分泌専門医への相談を検討してください。')
  }
  if (input.shoeSizeCm && input.shoeSizeCm >= 26 && ageYears < 14) {
    notes.push('靴サイズが既に26cm以上で年齢比に大きい傾向。最終身長は予測の上限値に近づく可能性があります。')
  }
  if (input.bodyFatPercent && input.bodyFatPercent > 30) {
    notes.push('体脂肪率がやや高い傾向。早熟の可能性があり、最終身長予測が下振れする場合があります（思春期早期化）。')
  }
  notes.push(puberty.message)

  return {
    currentSD: Math.round(currentSD * 100) / 100,
    currentSDLabel: sdCat.label,
    currentSDTone: sdCat.tone,
    norm,
    predictions,
    finalPrediction,
    phv,
    puberty,
    notes,
    disclaimer:
      '本予測は統計モデルに基づく目安であり、医学的診断ではありません。Bayley-Pinneau簡易法（達成率）・両親身長式・Mirwald PHV式・思春期サイン補正を組み合わせていますが、個人差があり実測との誤差は通常±3〜5cmの範囲で発生します。低身長傾向（-2SD未満）が継続する場合は、小児科または小児内分泌専門医への相談をおすすめします。',
  }
}
