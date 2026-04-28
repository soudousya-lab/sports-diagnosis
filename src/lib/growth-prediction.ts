// NOBISHIRO 身長予測モジュール
// 関連戦略: firefitness-lp/docs/strategy/nobishiro-monetization.md
//
// 表現の薬機法ガード:
// - 「伸ばす」ではなく「伸びる可能性」「成長を見逃さない」で表現する
// - すべての予測値は ±幅と「個人差あり」を明記する
//
// データソース:
// - 学校保健統計調査（文部科学省）の年齢別平均身長・SD
// - 日本小児内分泌学会 成長評価チャート
// - Tanner-Whitehouse 法（PHVの近似）

export type Sex = 'male' | 'female'

/**
 * 文部科学省 学校保健統計調査の年齢別平均身長(cm)とSD(cm)
 * 0〜17歳の代表値（年度ごとの揺れがあるため概算）
 */
const HEIGHT_NORMS: Record<Sex, { age: number; mean: number; sd: number }[]> = {
  male: [
    { age: 0, mean: 50.0, sd: 2.0 },
    { age: 1, mean: 75.0, sd: 2.5 },
    { age: 2, mean: 86.7, sd: 3.0 },
    { age: 3, mean: 95.0, sd: 3.5 },
    { age: 4, mean: 102.5, sd: 4.0 },
    { age: 5, mean: 109.4, sd: 4.5 },
    { age: 6, mean: 116.5, sd: 4.8 },
    { age: 7, mean: 122.5, sd: 5.0 },
    { age: 8, mean: 128.1, sd: 5.3 },
    { age: 9, mean: 133.5, sd: 5.6 },
    { age: 10, mean: 138.9, sd: 6.0 },
    { age: 11, mean: 145.2, sd: 6.5 },
    { age: 12, mean: 152.7, sd: 7.5 },
    { age: 13, mean: 159.8, sd: 7.8 },
    { age: 14, mean: 165.3, sd: 7.0 },
    { age: 15, mean: 168.3, sd: 6.4 },
    { age: 16, mean: 169.9, sd: 6.0 },
    { age: 17, mean: 170.7, sd: 5.8 },
  ],
  female: [
    { age: 0, mean: 49.5, sd: 1.9 },
    { age: 1, mean: 74.0, sd: 2.4 },
    { age: 2, mean: 85.4, sd: 3.0 },
    { age: 3, mean: 94.1, sd: 3.5 },
    { age: 4, mean: 101.6, sd: 4.0 },
    { age: 5, mean: 108.7, sd: 4.5 },
    { age: 6, mean: 115.6, sd: 4.7 },
    { age: 7, mean: 121.5, sd: 5.0 },
    { age: 8, mean: 127.3, sd: 5.4 },
    { age: 9, mean: 133.4, sd: 5.8 },
    { age: 10, mean: 140.2, sd: 6.4 },
    { age: 11, mean: 146.8, sd: 6.5 },
    { age: 12, mean: 151.9, sd: 6.0 },
    { age: 13, mean: 154.8, sd: 5.5 },
    { age: 14, mean: 156.5, sd: 5.3 },
    { age: 15, mean: 157.3, sd: 5.2 },
    { age: 16, mean: 157.7, sd: 5.2 },
    { age: 17, mean: 157.9, sd: 5.2 },
  ],
}

/**
 * 年齢の前後2点で線形補間して、その年齢の平均とSDを取得
 */
function interpolateNorm(sex: Sex, ageYears: number): { mean: number; sd: number } {
  const table = HEIGHT_NORMS[sex]
  const minAge = table[0].age
  const maxAge = table[table.length - 1].age
  if (ageYears <= minAge) return { mean: table[0].mean, sd: table[0].sd }
  if (ageYears >= maxAge) return { mean: table[table.length - 1].mean, sd: table[table.length - 1].sd }

  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i]
    const b = table[i + 1]
    if (ageYears >= a.age && ageYears < b.age) {
      const t = (ageYears - a.age) / (b.age - a.age)
      return {
        mean: a.mean + (b.mean - a.mean) * t,
        sd: a.sd + (b.sd - a.sd) * t,
      }
    }
  }
  // fallback
  return { mean: table[table.length - 1].mean, sd: table[table.length - 1].sd }
}

/**
 * SD値（Z-score）を算出
 * SD = (現在身長 - 平均身長) / 標準偏差
 */
export function calcHeightSD(
  currentHeightCm: number,
  ageYears: number,
  sex: Sex
): number {
  const { mean, sd } = interpolateNorm(sex, ageYears)
  return (currentHeightCm - mean) / sd
}

/**
 * 目標身長（Target Height）算出
 * 男子: (父 + 母 + 13) / 2
 * 女子: (父 + 母 - 13) / 2
 * 予測幅は ±5cm（個人差を反映）
 */
export function calcTargetHeight(
  fatherHeightCm: number,
  motherHeightCm: number,
  sex: Sex
): { center: number; min: number; max: number } {
  const adjust = sex === 'male' ? 13 : -13
  const center = (fatherHeightCm + motherHeightCm + adjust) / 2
  return {
    center: Math.round(center * 10) / 10,
    min: Math.round((center - 5) * 10) / 10,
    max: Math.round((center + 5) * 10) / 10,
  }
}

/**
 * PHV (Peak Height Velocity) ピーク年齢の典型値
 * 男子: 13.5歳, 女子: 11.5歳（個人差 ±1.5年）
 */
const PHV_PEAK_AGE: Record<Sex, number> = {
  male: 13.5,
  female: 11.5,
}

/**
 * 成長スパートのフェーズ判定
 * - "pre" : スパート前
 * - "starting" : 開始直前〜開始（PHV-2 〜 PHV-0.5）
 * - "peak" : ピーク前後 1年以内
 * - "decelerating" : ピーク後だが伸びは継続
 * - "near-final" : ほぼ最終身長
 */
export type PhvPhase = 'pre' | 'starting' | 'peak' | 'decelerating' | 'near-final'

export function estimatePhvPhase(ageYears: number, sex: Sex): {
  phase: PhvPhase
  monthsToPeak: number // 負の値ならピーク後
  peakAge: number
} {
  const peak = PHV_PEAK_AGE[sex]
  const diff = ageYears - peak
  const monthsToPeak = Math.round(-diff * 12)

  let phase: PhvPhase
  if (diff < -2) phase = 'pre'
  else if (diff >= -2 && diff < -0.5) phase = 'starting'
  else if (diff >= -0.5 && diff <= 1) phase = 'peak'
  else if (diff > 1 && diff <= 3) phase = 'decelerating'
  else phase = 'near-final'

  return { phase, monthsToPeak, peakAge: peak }
}

/**
 * 18歳時点の予測身長
 * - 両親身長から目標身長を出している場合は、それを採用
 * - 出していない場合は、現在のSD値が18歳まで保たれるという前提で予測
 */
export function predictAdultHeight(opts: {
  currentHeightCm: number
  ageYears: number
  sex: Sex
  fatherHeightCm?: number
  motherHeightCm?: number
}): { center: number; min: number; max: number; method: 'parental' | 'sd-extrapolation' } {
  if (opts.fatherHeightCm && opts.motherHeightCm) {
    return {
      ...calcTargetHeight(opts.fatherHeightCm, opts.motherHeightCm, opts.sex),
      method: 'parental',
    }
  }
  // SD値外挿: 現在のSDが18歳時点の平均±SDで保たれると仮定
  const sd = calcHeightSD(opts.currentHeightCm, opts.ageYears, opts.sex)
  const adultNorm = interpolateNorm(opts.sex, 18)
  const center = adultNorm.mean + sd * adultNorm.sd
  return {
    center: Math.round(center * 10) / 10,
    min: Math.round((center - 4) * 10) / 10,
    max: Math.round((center + 4) * 10) / 10,
    method: 'sd-extrapolation',
  }
}

/**
 * 残り伸びしろ（cm）— 18歳予測 - 現在身長
 */
export function calcRemainingGrowthCm(
  currentHeightCm: number,
  predictedAdultCenter: number
): number {
  return Math.max(0, Math.round((predictedAdultCenter - currentHeightCm) * 10) / 10)
}

/**
 * SD値を「カテゴリ」に変換（保護者向けの言葉）
 */
export function sdToCategory(sd: number): { label: string; tone: 'safe' | 'watch' | 'consult' } {
  if (sd > 2.0) return { label: '平均より高め（+2SD超）', tone: 'safe' }
  if (sd > 1.0) return { label: '平均より高い（+1SD〜+2SD）', tone: 'safe' }
  if (sd >= -1.0) return { label: '平均的な範囲（±1SD）', tone: 'safe' }
  if (sd >= -2.0) return { label: '平均より低め（-1SD〜-2SD）', tone: 'watch' }
  return { label: '低身長の傾向あり（-2SD未満）', tone: 'consult' }
}

/**
 * PHVフェーズに対する保護者向け説明文
 */
export function phvPhaseToMessage(phase: PhvPhase, sex: Sex): string {
  const sexLabel = sex === 'male' ? '男子' : '女子'
  switch (phase) {
    case 'pre':
      return `成長スパートの前段階です。${sexLabel}は平均約${
        sex === 'male' ? '13.5' : '11.5'
      }歳がピークの目安。ここまでに「動きの引き出し」を増やしておくことが、後の運動能力に直結します。`
    case 'starting':
      return 'スパートが始まろうとしている時期です。靴のサイズ・体重の急増・食欲の変化など、サインに注意してください。'
    case 'peak':
      return '成長スパートのピーク期。1年で8〜10cm伸びる可能性があります。栄養と睡眠の確保が最重要です。'
    case 'decelerating':
      return 'ピークを過ぎ、伸びは緩やかになりつつあります。残り2〜3年が最終身長の鍵を握る時期です。'
    case 'near-final':
      return 'ほぼ最終身長に近い段階です。骨端線の閉鎖が近く、新たな大きな伸びは期待しにくい時期です。'
  }
}

/**
 * 統合関数：すべての結果を一括で返す
 */
export interface GrowthPredictionInput {
  currentHeightCm: number
  ageYears: number
  sex: Sex
  fatherHeightCm?: number
  motherHeightCm?: number
}

export interface GrowthPredictionResult {
  sd: number
  sdCategory: { label: string; tone: 'safe' | 'watch' | 'consult' }
  norm: { mean: number; sd: number }
  targetHeight: { center: number; min: number; max: number } | null
  predictedAdult: { center: number; min: number; max: number; method: 'parental' | 'sd-extrapolation' }
  remainingGrowthCm: number
  phv: { phase: PhvPhase; monthsToPeak: number; peakAge: number; message: string }
  disclaimer: string
}

export function predictGrowth(input: GrowthPredictionInput): GrowthPredictionResult {
  const sd = calcHeightSD(input.currentHeightCm, input.ageYears, input.sex)
  const norm = interpolateNorm(input.sex, input.ageYears)
  const targetHeight =
    input.fatherHeightCm && input.motherHeightCm
      ? calcTargetHeight(input.fatherHeightCm, input.motherHeightCm, input.sex)
      : null
  const predictedAdult = predictAdultHeight(input)
  const remainingGrowthCm = calcRemainingGrowthCm(input.currentHeightCm, predictedAdult.center)
  const phvBase = estimatePhvPhase(input.ageYears, input.sex)

  return {
    sd: Math.round(sd * 100) / 100,
    sdCategory: sdToCategory(sd),
    norm,
    targetHeight,
    predictedAdult,
    remainingGrowthCm,
    phv: {
      ...phvBase,
      message: phvPhaseToMessage(phvBase.phase, input.sex),
    },
    disclaimer:
      '本予測は統計的な目安であり、医学的診断ではありません。個人差があります。低身長の傾向（-2SD未満）が続く場合は、小児科または小児内分泌専門医への相談をおすすめします。',
  }
}
