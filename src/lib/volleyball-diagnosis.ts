// バレーボール診断ロジック

// 測定項目のカテゴリ名
export const volleyballCategories: Record<string, string> = {
  vertical_jump: '垂直跳び',
  standing_jump: '立ち幅跳び',
  reach_height: '指高リーチ',
  spike_reach: '最高到達点',
  approach_jump: '助走ジャンプ',
  continuous_jump: '連続立ち幅跳び',
  ball_throw: 'ボール投げ(3kg)',
  side_step: '反復横跳び',
  single_leg_balance: '片足立ちバランス'
}

// 能力カテゴリ名
export const abilityCategories: Record<string, string> = {
  jump_power: '跳躍力',
  reach: '到達点',
  agility: '敏捷性',
  throw_power: '投力',
  continuous_power: '連続跳躍力',
  balance: 'バランス'
}

// 学年から実年齢を取得
export function getActualAge(schoolYear: string): number {
  const ages: Record<string, number> = {
    '1': 13, // 中1
    '2': 14, // 中2
    '3': 15, // 中3
    'h1': 16, // 高1
    'h2': 17, // 高2
    'h3': 18  // 高3
  }
  return ages[schoolYear] || 13
}

// 学年表示
export function getSchoolYearDisplay(schoolYear: string): string {
  const displays: Record<string, string> = {
    '1': '中学1年',
    '2': '中学2年',
    '3': '中学3年',
    'h1': '高校1年',
    'h2': '高校2年',
    'h3': '高校3年'
  }
  return displays[schoolYear] || schoolYear
}

// 平均データ（学年・性別別）- 中学生女子バレーボール選手向け
// 実測データに基づいて調整
// ball_throw: 3kgボール投げの距離（メートル）
// standing_jump: 立ち幅跳び（cm）
// single_leg_balance: 片足立ちバランス（秒）- 目を閉じて片足立ち
export const volleyballAverageData: Record<string, Record<string, Record<string, number>>> = {
  '1': {
    male: {
      vertical_jump: 45,
      standing_jump: 180,  // 立ち幅跳び(cm)
      reach_height: 220,
      spike_reach: 270,
      approach_jump: 50,
      continuous_jump: 600,
      ball_throw: 7.0,  // 3kgボール投げ(m)
      side_step: 50,
      single_leg_balance: 30  // 片足立ちバランス(秒)
    },
    female: {
      vertical_jump: 35,
      standing_jump: 160,  // 立ち幅跳び(cm)
      reach_height: 200,
      spike_reach: 245,
      approach_jump: 40,
      continuous_jump: 580,
      ball_throw: 5.0,  // 3kgボール投げ(m)
      side_step: 48,
      single_leg_balance: 35  // 片足立ちバランス(秒)
    }
  },
  '2': {
    male: {
      vertical_jump: 50,
      standing_jump: 195,  // 立ち幅跳び(cm)
      reach_height: 230,
      spike_reach: 285,
      approach_jump: 55,
      continuous_jump: 650,
      ball_throw: 8.0,  // 3kgボール投げ(m)
      side_step: 53,
      single_leg_balance: 35  // 片足立ちバランス(秒)
    },
    female: {
      vertical_jump: 40,
      standing_jump: 170,  // 立ち幅跳び(cm)
      reach_height: 205,
      spike_reach: 255,
      approach_jump: 45,
      continuous_jump: 610,
      ball_throw: 5.5,  // 3kgボール投げ(m)
      side_step: 52,
      single_leg_balance: 40  // 片足立ちバランス(秒)
    }
  },
  '3': {
    male: {
      vertical_jump: 55,
      standing_jump: 210,  // 立ち幅跳び(cm)
      reach_height: 240,
      spike_reach: 300,
      approach_jump: 60,
      continuous_jump: 700,
      ball_throw: 9.0,  // 3kgボール投げ(m)
      side_step: 55,
      single_leg_balance: 40  // 片足立ちバランス(秒)
    },
    female: {
      vertical_jump: 45,
      standing_jump: 180,  // 立ち幅跳び(cm)
      reach_height: 210,
      spike_reach: 265,
      approach_jump: 50,
      continuous_jump: 640,
      ball_throw: 6.0,  // 3kgボール投げ(m)
      side_step: 55,
      single_leg_balance: 45  // 片足立ちバランス(秒)
    }
  },
  'h1': {
    male: {
      vertical_jump: 58,
      standing_jump: 220,  // 立ち幅跳び(cm)
      reach_height: 250,
      spike_reach: 315,
      approach_jump: 65,
      continuous_jump: 750,
      ball_throw: 9.5,  // 3kgボール投げ(m)
      side_step: 58,
      single_leg_balance: 45  // 片足立ちバランス(秒)
    },
    female: {
      vertical_jump: 48,
      standing_jump: 185,  // 立ち幅跳び(cm)
      reach_height: 215,
      spike_reach: 275,
      approach_jump: 55,
      continuous_jump: 670,
      ball_throw: 6.5,  // 3kgボール投げ(m)
      side_step: 57,
      single_leg_balance: 50  // 片足立ちバランス(秒)
    }
  },
  'h2': {
    male: {
      vertical_jump: 62,
      standing_jump: 230,  // 立ち幅跳び(cm)
      reach_height: 255,
      spike_reach: 325,
      approach_jump: 70,
      continuous_jump: 780,
      ball_throw: 10.0,  // 3kgボール投げ(m)
      side_step: 60,
      single_leg_balance: 50  // 片足立ちバランス(秒)
    },
    female: {
      vertical_jump: 50,
      standing_jump: 190,  // 立ち幅跳び(cm)
      reach_height: 218,
      spike_reach: 280,
      approach_jump: 58,
      continuous_jump: 690,
      ball_throw: 7.0,  // 3kgボール投げ(m)
      side_step: 58,
      single_leg_balance: 55  // 片足立ちバランス(秒)
    }
  },
  'h3': {
    male: {
      vertical_jump: 65,
      standing_jump: 240,  // 立ち幅跳び(cm)
      reach_height: 260,
      spike_reach: 335,
      approach_jump: 75,
      continuous_jump: 800,
      ball_throw: 10.5,  // 3kgボール投げ(m)
      side_step: 62,
      single_leg_balance: 55  // 片足立ちバランス(秒)
    },
    female: {
      vertical_jump: 52,
      standing_jump: 195,  // 立ち幅跳び(cm)
      reach_height: 220,
      spike_reach: 285,
      approach_jump: 60,
      continuous_jump: 710,
      ball_throw: 7.5,  // 3kgボール投げ(m)
      side_step: 60,
      single_leg_balance: 60  // 片足立ちバランス(秒)
    }
  }
}

// 標準偏差
export const volleyballSD: Record<string, number> = {
  vertical_jump: 10,
  standing_jump: 20,  // 立ち幅跳び(cm)
  reach_height: 15,
  spike_reach: 18,
  approach_jump: 15,
  continuous_jump: 50,
  ball_throw: 1.5,  // 3kgボール投げ(m)
  side_step: 8,
  single_leg_balance: 15  // 片足立ちバランス(秒)
}

// ポジション情報
export const volleyballPositions = [
  { key: 'S', name: 'セッター', description: 'チームの司令塔。トス回しでゲームをコントロール' },
  { key: 'OH', name: 'アウトサイドヒッター', description: 'エース。攻撃の中心でレシーブもこなす万能選手' },
  { key: 'MB', name: 'ミドルブロッカー', description: 'ブロックの要。速攻やクイックで攻撃にも貢献' },
  { key: 'OP', name: 'オポジット', description: 'スーパーエース。攻撃特化で得点力が求められる' },
  { key: 'L', name: 'リベロ', description: 'レシーブ専門。守備の要として安定したレシーブが必要' }
]

// ポジション別の必要能力ウェイト
export const positionRequirements: Record<string, Record<string, number>> = {
  S: { // セッター
    agility: 0.30,
    balance: 0.20,
    reach: 0.20,
    jump_power: 0.15,
    continuous_power: 0.10,
    throw_power: 0.05
  },
  OH: { // アウトサイドヒッター
    jump_power: 0.25,
    reach: 0.20,
    throw_power: 0.20,
    agility: 0.15,
    continuous_power: 0.10,
    balance: 0.10
  },
  MB: { // ミドルブロッカー
    reach: 0.30,
    jump_power: 0.25,
    agility: 0.15,
    balance: 0.15,
    continuous_power: 0.10,
    throw_power: 0.05
  },
  OP: { // オポジット
    jump_power: 0.30,
    reach: 0.25,
    throw_power: 0.25,
    continuous_power: 0.10,
    balance: 0.05,
    agility: 0.05
  },
  L: { // リベロ
    agility: 0.35,
    balance: 0.25,
    continuous_power: 0.25,
    jump_power: 0.10,
    reach: 0.05,
    throw_power: 0.00
  }
}

// 偏差値計算
export function calcDeviation(value: number, average: number, stdDev: number): number {
  return 50 + 10 * (value - average) / stdDev
}

// 偏差値から10段階評価
export function deviationTo10Scale(deviation: number): number {
  if (deviation >= 70) return 10
  if (deviation >= 65) return 9
  if (deviation >= 60) return 8
  if (deviation >= 55) return 7
  if (deviation >= 50) return 6
  if (deviation >= 45) return 5
  if (deviation >= 40) return 4
  if (deviation >= 35) return 3
  if (deviation >= 30) return 2
  return 1
}

// グレード判定
export function getGrade(score: number): { grade: string; colorClass: string } {
  if (score >= 8) return { grade: 'A', colorClass: 'text-blue-600' }
  if (score >= 6) return { grade: 'B', colorClass: 'text-green-600' }
  if (score >= 5) return { grade: 'C', colorClass: 'text-yellow-600' }
  if (score >= 3) return { grade: 'D', colorClass: 'text-orange-600' }
  return { grade: 'E', colorClass: 'text-red-600' }
}

// 能力カテゴリごとのスコア計算
export function calcAbilityScores(itemScores: Record<string, number>): Record<string, number> {
  // 跳躍力: 垂直跳びと立ち幅跳びの平均
  const jumpScores = [itemScores.vertical_jump, itemScores.standing_jump].filter(s => s !== undefined)
  const jumpPower = jumpScores.length > 0
    ? Math.round(jumpScores.reduce((a, b) => a + b, 0) / jumpScores.length)
    : 5

  return {
    jump_power: jumpPower,
    reach: Math.round(((itemScores.reach_height || 5) + (itemScores.spike_reach || 5) + (itemScores.approach_jump || 5)) / 3),
    agility: itemScores.side_step || 5,
    throw_power: itemScores.ball_throw || 5,
    continuous_power: itemScores.continuous_jump || 5,
    balance: itemScores.single_leg_balance || 5
  }
}

// ポジション適性計算
export function calcPositionAptitudes(abilityScores: Record<string, number>): Array<{
  position: string
  name: string
  aptitude: number
  description: string
}> {
  const results: Array<{
    position: string
    name: string
    aptitude: number
    description: string
  }> = []

  for (const pos of volleyballPositions) {
    const requirements = positionRequirements[pos.key]
    let weightedSum = 0
    let totalWeight = 0

    for (const [ability, weight] of Object.entries(requirements)) {
      if (abilityScores[ability] !== undefined) {
        weightedSum += abilityScores[ability] * weight * 10 // 10点を100点に換算
        totalWeight += weight
      }
    }

    const aptitude = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50

    results.push({
      position: pos.key,
      name: pos.name,
      aptitude,
      description: pos.description
    })
  }

  return results.sort((a, b) => b.aptitude - a.aptitude)
}

// フィジカル年齢計算
export function calcPhysicalAge(scores: Record<string, number>, actualAge: number): number {
  const values = Object.values(scores)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.round((actualAge + (avg - 5) * 0.8) * 10) / 10
}

// 強み・弱み分析
export function analyzeStrengthsWeaknesses(itemScores: Record<string, number>): {
  strengths: Array<{ item: string; score: number; label: string }>
  weaknesses: Array<{ item: string; score: number; label: string }>
} {
  const sorted = Object.entries(itemScores)
    .filter(([_, score]) => score !== undefined)
    .sort((a, b) => b[1] - a[1])

  const strengths = sorted.slice(0, 3).map(([item, score]) => ({
    item,
    score,
    label: volleyballCategories[item] || item
  }))

  const weaknesses = sorted.slice(-2).reverse().map(([item, score]) => ({
    item,
    score,
    label: volleyballCategories[item] || item
  }))

  return { strengths, weaknesses }
}

// 診断タイプ判定
export function determineAthleteType(abilityScores: Record<string, number>): { name: string; description: string } {
  const sorted = Object.entries(abilityScores).sort((a, b) => b[1] - a[1])
  const topAbility = sorted[0][0]
  const avg = Object.values(abilityScores).reduce((a, b) => a + b, 0) / Object.values(abilityScores).length

  if (avg >= 8) {
    return {
      name: 'オールラウンドエリート',
      description: '全ての能力が高水準。どのポジションでも活躍できる素質を持っています。'
    }
  }

  const typeMap: Record<string, { name: string; description: string }> = {
    jump_power: {
      name: 'ジャンプエリート',
      description: '跳躍力に優れ、スパイクやブロックで高さを活かしたプレーが得意。'
    },
    reach: {
      name: 'リーチマスター',
      description: '最高到達点が高く、ネット上での攻防で有利なポジションを取れます。'
    },
    agility: {
      name: 'アジリティスター',
      description: '俊敏性に優れ、レシーブやフェイントへの対応が素早い。'
    },
    throw_power: {
      name: 'パワーエース',
      description: '投力に優れ、力強いサーブやスパイクで得点を量産できる可能性。'
    },
    continuous_power: {
      name: 'スタミナエリート',
      description: '持久力・連続跳躍力に優れ、試合終盤でも安定したパフォーマンスを発揮。'
    },
    balance: {
      name: 'バランスマスター',
      description: 'バランス能力に優れ、不安定な体勢でも安定したプレーができる。'
    }
  }

  return typeMap[topAbility] || {
    name: 'バランスアスリート',
    description: 'バランスよく発達しており、様々な役割に対応できる選手です。'
  }
}

// 目標設定
export function setGoals(measurements: Record<string, number>): Record<string, number> {
  const goals: Record<string, number> = {}

  if (measurements.vertical_jump) {
    goals.vertical_jump = Math.round(measurements.vertical_jump * 1.05)
  }
  if (measurements.standing_jump) {
    goals.standing_jump = Math.round(measurements.standing_jump * 1.03)
  }
  if (measurements.spike_reach) {
    goals.spike_reach = Math.round(measurements.spike_reach * 1.02)
  }
  if (measurements.continuous_jump) {
    goals.continuous_jump = Math.round(measurements.continuous_jump * 1.03)
  }
  if (measurements.ball_throw) {
    goals.ball_throw = Math.round(measurements.ball_throw * 1.10 * 10) / 10
  }
  if (measurements.side_step) {
    goals.side_step = Math.round(measurements.side_step * 1.05)
  }
  if (measurements.single_leg_balance) {
    goals.single_leg_balance = Math.round(measurements.single_leg_balance * 1.10)
  }

  return goals
}

// タンパク質摂取量計算（体重kg × 係数）
export function calcProteinIntake(weight: number, trainingIntensity: 'light' | 'moderate' | 'hard' = 'moderate'): {
  daily: number
  perMeal: number
  timing: string[]
  tips: string[]
} {
  // アスリート向けのタンパク質摂取量（g/kg体重）
  const proteinFactors: Record<string, number> = {
    light: 1.2,    // 軽い運動
    moderate: 1.6, // 中程度の運動（一般的なバレー部員）
    hard: 2.0      // 激しいトレーニング
  }

  const factor = proteinFactors[trainingIntensity]
  const dailyProtein = Math.round(weight * factor)
  const perMealProtein = Math.round(dailyProtein / 4) // 4回に分けて摂取

  const timing = [
    '朝食時（起床後30分以内）',
    '練習前（1〜2時間前）',
    '練習後（30分以内が最適）',
    '就寝前（1時間前）'
  ]

  const tips = [
    `1日の目標摂取量: ${dailyProtein}g`,
    '練習後30分以内の摂取がゴールデンタイム',
    '固形物よりプロテインドリンクが吸収が早い',
    '寝る前のカゼインプロテインは筋肉回復に効果的'
  ]

  return { daily: dailyProtein, perMeal: perMealProtein, timing, tips }
}

// 週間トレーニングスケジュール生成
export function generateWeeklySchedule(
  weaknesses: Array<{ item: string; score: number; label: string }>,
  strengths: Array<{ item: string; score: number; label: string }>
): WeeklySchedule {
  // 弱点に基づいて優先トレーニングを決定
  const priorityAbilities = weaknesses.map(w => getAbilityKeyFromItem(w.item))
  const secondaryAbilities = strengths.slice(0, 2).map(s => getAbilityKeyFromItem(s.item))

  const schedule: WeeklySchedule = {
    monday: {
      day: '月曜日',
      focus: '跳躍力・パワー',
      sessions: [
        { time: '放課後', duration: '30分', menu: 'スクワットジャンプ、ボックスジャンプ', intensity: 'high' }
      ],
      rest: '十分な睡眠を取る'
    },
    tuesday: {
      day: '火曜日',
      focus: '敏捷性・レシーブ',
      sessions: [
        { time: '放課後', duration: '30分', menu: 'サイドシャッフル、反復横跳び、ラダー', intensity: 'moderate' }
      ],
      rest: 'ストレッチを入念に'
    },
    wednesday: {
      day: '水曜日',
      focus: 'アクティブレスト',
      sessions: [
        { time: '放課後', duration: '20分', menu: '軽いジョギング、ストレッチ', intensity: 'low' }
      ],
      rest: '回復日として体を休める'
    },
    thursday: {
      day: '木曜日',
      focus: 'サーブ・上半身',
      sessions: [
        { time: '放課後', duration: '30分', menu: 'サーブ練習、メディシンボール投げ', intensity: 'moderate' }
      ],
      rest: '肩周りのケアを忘れずに'
    },
    friday: {
      day: '金曜日',
      focus: '連続跳躍力・持久力',
      sessions: [
        { time: '放課後', duration: '30分', menu: '連続立ち幅跳び、バウンディング', intensity: 'high' }
      ],
      rest: '週末に向けて回復'
    },
    saturday: {
      day: '土曜日',
      focus: '総合練習',
      sessions: [
        { time: '午前', duration: '60分', menu: '実践形式の練習、ゲーム', intensity: 'high' },
        { time: '午後', duration: '30分', menu: '弱点強化（個人練習）', intensity: 'moderate' }
      ],
      rest: 'しっかり栄養補給'
    },
    sunday: {
      day: '日曜日',
      focus: '完全休養',
      sessions: [],
      rest: '完全休養日。体と心をリフレッシュ'
    }
  }

  return schedule
}

// 測定項目から能力キーへの変換（ヘルパー関数）
function getAbilityKeyFromItem(item: string): string {
  const mapping: Record<string, string> = {
    vertical_jump: 'jump_power',
    reach_height: 'reach',
    spike_reach: 'reach',
    approach_jump: 'reach',
    continuous_jump: 'continuous_power',
    ball_throw: 'throw_power',
    side_step: 'agility'
  }
  return mapping[item] || 'jump_power'
}

// 週間スケジュールの型定義
export type DaySchedule = {
  day: string
  focus: string
  sessions: Array<{
    time: string
    duration: string
    menu: string
    intensity: 'low' | 'moderate' | 'high'
  }>
  rest: string
}

export type WeeklySchedule = {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

// 診断実行（メイン関数）
export function runVolleyballDiagnosis(
  schoolYear: string,
  gender: 'male' | 'female',
  measurements: {
    vertical_jump?: number
    standing_jump?: number
    reach_height?: number
    spike_reach?: number
    approach_jump?: number
    continuous_jump?: number
    ball_throw?: number
    side_step?: number
    single_leg_balance?: number
  }
) {
  const avg = volleyballAverageData[schoolYear]?.[gender] || volleyballAverageData['1'][gender]
  const actualAge = getActualAge(schoolYear)

  // 偏差値計算
  const deviations: Record<string, number> = {}
  const itemScores: Record<string, number> = {}

  const measurementKeys = Object.keys(measurements) as Array<keyof typeof measurements>

  for (const key of measurementKeys) {
    const value = measurements[key]
    if (value !== undefined && value !== null) {
      const avgValue = avg[key] || 0
      const sdValue = volleyballSD[key] || 10
      deviations[key] = calcDeviation(value, avgValue, sdValue)
      itemScores[key] = deviationTo10Scale(deviations[key])
    }
  }

  // 能力カテゴリスコア
  const abilityScores = calcAbilityScores(itemScores)

  // 総合スコア（100点満点）
  const overallScore = Math.round(
    Object.values(abilityScores).reduce((a, b) => a + b, 0) / Object.values(abilityScores).length * 10
  )

  // フィジカル年齢
  const physicalAge = calcPhysicalAge(itemScores, actualAge)
  const physicalAgeDiff = Math.round((physicalAge - actualAge) * 10) / 10

  // ポジション適性
  const positionAptitudes = calcPositionAptitudes(abilityScores)

  // 強み・弱み
  const { strengths, weaknesses } = analyzeStrengthsWeaknesses(itemScores)

  // 選手タイプ
  const athleteType = determineAthleteType(abilityScores)

  // 目標
  const goals = setGoals(measurements as Record<string, number>)

  return {
    itemScores,
    abilityScores,
    deviations,
    overallScore,
    physicalAge,
    physicalAgeDiff,
    positionAptitudes,
    strengths,
    weaknesses,
    athleteType,
    goals
  }
}
