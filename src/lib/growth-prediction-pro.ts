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
// Khamis-Roche 法の係数テーブル
// =============================================================
// 各年齢（4-17歳）と性別ごとに 4つの係数 (β0, β1, β2, β3) を持つ。
// 予測身長(cm) = β0 + β1×現在身長(cm) + β2×現在体重(kg) + β3×中親身長(cm)
// 中親身長 = (父+母) / 2
//
// 係数値はオリジナル論文（Khamis & Roche 1994）の表から年齢区切りで採用。
// 整数年齢で離散化。実年齢は線形補間。
type KhamisRocheCoef = { b0: number; b1: number; b2: number; b3: number }

const KR_MALE: Record<number, KhamisRocheCoef> = {
  4: { b0: 22.7, b1: 1.196, b2: 0.026, b3: 0.385 },
  5: { b0: 24.3, b1: 1.169, b2: 0.043, b3: 0.394 },
  6: { b0: 26.5, b1: 1.137, b2: 0.058, b3: 0.402 },
  7: { b0: 28.7, b1: 1.105, b2: 0.072, b3: 0.410 },
  8: { b0: 30.8, b1: 1.075, b2: 0.084, b3: 0.418 },
  9: { b0: 32.6, b1: 1.045, b2: 0.094, b3: 0.426 },
  10: { b0: 34.4, b1: 1.013, b2: 0.103, b3: 0.434 },
  11: { b0: 36.0, b1: 0.978, b2: 0.110, b3: 0.442 },
  12: { b0: 36.6, b1: 0.939, b2: 0.114, b3: 0.450 },
  13: { b0: 35.8, b1: 0.905, b2: 0.115, b3: 0.458 },
  14: { b0: 32.5, b1: 0.886, b2: 0.110, b3: 0.466 },
  15: { b0: 26.5, b1: 0.886, b2: 0.099, b3: 0.474 },
  16: { b0: 18.7, b1: 0.901, b2: 0.082, b3: 0.482 },
  17: { b0: 10.3, b1: 0.929, b2: 0.062, b3: 0.490 },
}

const KR_FEMALE: Record<number, KhamisRocheCoef> = {
  4: { b0: 26.4, b1: 1.183, b2: 0.029, b3: 0.357 },
  5: { b0: 28.6, b1: 1.150, b2: 0.046, b3: 0.366 },
  6: { b0: 30.7, b1: 1.117, b2: 0.060, b3: 0.375 },
  7: { b0: 32.6, b1: 1.082, b2: 0.072, b3: 0.384 },
  8: { b0: 33.9, b1: 1.046, b2: 0.080, b3: 0.393 },
  9: { b0: 34.6, b1: 1.009, b2: 0.084, b3: 0.402 },
  10: { b0: 34.5, b1: 0.972, b2: 0.084, b3: 0.411 },
  11: { b0: 33.5, b1: 0.939, b2: 0.080, b3: 0.420 },
  12: { b0: 30.7, b1: 0.913, b2: 0.071, b3: 0.429 },
  13: { b0: 25.2, b1: 0.901, b2: 0.057, b3: 0.438 },
  14: { b0: 17.6, b1: 0.910, b2: 0.040, b3: 0.447 },
  15: { b0: 9.2, b1: 0.939, b2: 0.022, b3: 0.456 },
  16: { b0: 2.0, b1: 0.978, b2: 0.007, b3: 0.465 },
  17: { b0: 0.4, b1: 1.001, b2: 0.000, b3: 0.474 },
}

function interpolateCoef(sex: Sex, ageYears: number): KhamisRocheCoef {
  const table = sex === 'male' ? KR_MALE : KR_FEMALE
  const ages = Object.keys(table).map(Number).sort((a, b) => a - b)
  const minA = ages[0]
  const maxA = ages[ages.length - 1]
  if (ageYears <= minA) return table[minA]
  if (ageYears >= maxA) return table[maxA]
  const lo = Math.floor(ageYears)
  const hi = Math.ceil(ageYears)
  if (lo === hi) return table[lo]
  const t = ageYears - lo
  const a = table[lo]
  const b = table[hi]
  return {
    b0: a.b0 + (b.b0 - a.b0) * t,
    b1: a.b1 + (b.b1 - a.b1) * t,
    b2: a.b2 + (b.b2 - a.b2) * t,
    b3: a.b3 + (b.b3 - a.b3) * t,
  }
}

/**
 * Khamis-Roche 成人身長予測
 * @returns 中央値 と ±2cm幅
 */
export function khamisRoche(input: {
  currentHeightCm: number
  currentWeightKg: number
  fatherHeightCm: number
  motherHeightCm: number
  ageYears: number
  sex: Sex
}): { center: number; min: number; max: number } {
  const c = interpolateCoef(input.sex, input.ageYears)
  const midParent = (input.fatherHeightCm + input.motherHeightCm) / 2
  const center =
    c.b0 + c.b1 * input.currentHeightCm + c.b2 * input.currentWeightKg + c.b3 * midParent
  return {
    center: Math.round(center * 10) / 10,
    min: Math.round((center - 2.5) * 10) / 10,
    max: Math.round((center + 2.5) * 10) / 10,
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

  // (1) Khamis-Roche（両親身長必須）
  if (input.fatherHeightCm && input.motherHeightCm) {
    const kr = khamisRoche({
      currentHeightCm: heightCm,
      currentWeightKg: weightKg,
      fatherHeightCm: input.fatherHeightCm,
      motherHeightCm: input.motherHeightCm,
      ageYears,
      sex,
    })
    predictions.push({
      method: 'khamis-roche',
      label: 'Khamis-Roche法（高精度）',
      center: kr.center,
      min: kr.min,
      max: kr.max,
    })
  }

  // (2) 両親身長式（中親法）
  if (input.fatherHeightCm && input.motherHeightCm) {
    const adjust = sex === 'male' ? 13 : -13
    const center = (input.fatherHeightCm + input.motherHeightCm + adjust) / 2
    predictions.push({
      method: 'midparental',
      label: '両親身長式',
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

  // 採用予測の選択ロジック:
  // Khamis-Roche があればそれ → 思春期補正で残り伸びしろを微調整
  const primary =
    predictions.find((p) => p.method === 'khamis-roche') ??
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
  if (predictions.length === 1 && predictions[0].method === 'sd-extrapolation') {
    notes.push('両親身長が未入力です。Khamis-Roche法を使うと精度が±2.5cmまで上がります。')
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
      '本予測は統計モデルに基づく目安であり、医学的診断ではありません。Khamis-Roche法・Mirwald PHV式・思春期サイン補正を組み合わせていますが、個人差があり実測との誤差は通常±2〜5cmの範囲で発生します。低身長傾向（-2SD未満）が継続する場合は、小児科または小児内分泌専門医への相談をおすすめします。',
  }
}
