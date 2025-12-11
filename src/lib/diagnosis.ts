// 診断ロジック

// 平均データ（学年・性別別）
export const averageData: Record<string, Record<string, Record<string, number>>> = {
  'k5': {
    male: { grip: 9.5, jump: 108, dash: 4.35, doublejump: 200, squat: 18, sidestep: 26, throw: 8 },
    female: { grip: 8.5, jump: 100, dash: 4.5, doublejump: 185, squat: 16, sidestep: 24, throw: 5.5 }
  },
  '1': {
    male: { grip: 11, jump: 118, dash: 4.05, doublejump: 220, squat: 20, sidestep: 30, throw: 11 },
    female: { grip: 10.5, jump: 110, dash: 4.2, doublejump: 205, squat: 18, sidestep: 28, throw: 7.5 }
  },
  '2': {
    male: { grip: 13, jump: 128, dash: 3.75, doublejump: 240, squat: 22, sidestep: 34, throw: 14 },
    female: { grip: 12.5, jump: 120, dash: 3.9, doublejump: 225, squat: 20, sidestep: 32, throw: 9 }
  },
  '3': {
    male: { grip: 15, jump: 138, dash: 3.53, doublejump: 260, squat: 24, sidestep: 38, throw: 18 },
    female: { grip: 14.5, jump: 130, dash: 3.68, doublejump: 245, squat: 22, sidestep: 35, throw: 11 }
  },
  '4': {
    male: { grip: 17.5, jump: 148, dash: 3.3, doublejump: 280, squat: 26, sidestep: 42, throw: 22 },
    female: { grip: 17, jump: 140, dash: 3.45, doublejump: 265, squat: 24, sidestep: 39, throw: 14 }
  },
  '5': {
    male: { grip: 20.5, jump: 158, dash: 3.08, doublejump: 300, squat: 28, sidestep: 46, throw: 27 },
    female: { grip: 19.5, jump: 148, dash: 3.23, doublejump: 280, squat: 26, sidestep: 42, throw: 16 }
  },
  '6': {
    male: { grip: 24, jump: 168, dash: 2.93, doublejump: 320, squat: 30, sidestep: 50, throw: 32 },
    female: { grip: 22, jump: 155, dash: 3.08, doublejump: 295, squat: 28, sidestep: 45, throw: 19 }
  }
}

// 標準偏差
export const sd: Record<string, number> = {
  grip: 3.5,
  jump: 12,
  dash: 0.26,
  doublejump: 25,
  squat: 5,
  sidestep: 6,
  throw: 5
}

// カテゴリ名
export const categories: Record<string, string> = {
  grip: '筋力',
  jump: '瞬発力',
  dash: '移動能力',
  doublejump: 'バランス',
  squat: '筋持久力',
  sidestep: '敏捷性',
  throw: '投力'
}

// スポーツデータ
export const allSports = [
  { name: 'サッカー', required: ['dash', 'squat', 'sidestep'], icon: '⚽' },
  { name: '野球', required: ['throw', 'grip', 'sidestep'], icon: '⚾' },
  { name: 'バスケットボール', required: ['jump', 'dash', 'sidestep'], icon: '🏀' },
  { name: 'バレーボール', required: ['jump', 'sidestep', 'throw'], icon: '🏐' },
  { name: 'テニス', required: ['sidestep', 'dash', 'grip'], icon: '🎾' },
  { name: '卓球', required: ['sidestep', 'dash'], icon: '🏓' },
  { name: '水泳', required: ['squat', 'doublejump', 'grip'], icon: '🏊' },
  { name: '陸上短距離', required: ['dash', 'jump'], icon: '🏃' },
  { name: '陸上長距離', required: ['squat', 'dash'], icon: '🏃‍♂️' },
  { name: '体操競技', required: ['doublejump', 'jump', 'grip'], icon: '🤸' },
  { name: 'ダンス', required: ['doublejump', 'sidestep', 'jump'], icon: '💃' },
  { name: '柔道', required: ['grip', 'squat', 'doublejump'], icon: '🥋' },
  { name: '剣道', required: ['sidestep', 'grip', 'squat'], icon: '⚔️' },
  { name: 'バドミントン', required: ['sidestep', 'jump', 'dash'], icon: '🏸' },
  { name: 'ラグビー', required: ['grip', 'dash', 'squat'], icon: '🏉' },
  { name: 'ハンドボール', required: ['throw', 'jump', 'dash'], icon: '🤾' }
]

// 発達段階アドバイス
export const developmentAdvice: Record<string, {
  golden: string
  focus: string
  key: string
  avoid: string
}> = {
  'k5': {
    golden: 'プレゴールデンエイジ（5-8歳）',
    focus: '神経系発達のピーク。多様な動きの経験が最重要。',
    key: '「楽しい」を最優先に、遊びの中で体を動かす。',
    avoid: '特定動作の反復や勝ち負けへのこだわりは逆効果。'
  },
  '1': {
    golden: 'プレゴールデンエイジ（5-8歳）',
    focus: '神経系発達のピーク。多様な動きの経験が最重要。',
    key: '「楽しい」を最優先に、遊びの中で体を動かす。',
    avoid: '特定動作の反復や勝ち負けへのこだわりは逆効果。'
  },
  '2': {
    golden: 'プレゴールデンエイジ（5-8歳）',
    focus: '神経系発達のピーク。多様な動きの経験が最重要。',
    key: '「楽しい」を最優先に、遊びの中で体を動かす。',
    avoid: '特定動作の反復や勝ち負けへのこだわりは逆効果。'
  },
  '3': {
    golden: 'ゴールデンエイジ（9-12歳）',
    focus: '運動神経が最も発達。技術習得の最適期。',
    key: '正しいフォームを「見せて」覚えさせる。',
    avoid: '筋トレはまだ早い。技術とコーディネーション優先。'
  },
  '4': {
    golden: 'ゴールデンエイジ（9-12歳）',
    focus: '運動神経が最も発達。技術習得の最適期。',
    key: '「即座の習得」が可能。様々な基本技術を経験。',
    avoid: '過度な筋トレは成長を妨げる。技術練習重視。'
  },
  '5': {
    golden: 'ゴールデンエイジ（9-12歳）',
    focus: '運動神経が最も発達。この経験が生涯の財産に。',
    key: '複雑な動きも習得可能。専門技術練習OK。',
    avoid: '勝利至上主義に注意。楽しさとのバランスが大切。'
  },
  '6': {
    golden: 'ゴールデンエイジ終盤',
    focus: '体格差が出始め、心肺機能も発達する時期。',
    key: '持久力トレーニングを少しずつ導入可能。',
    avoid: '急激な筋トレは避け、徐々に負荷を上げる。'
  }
}

// 偏差値計算
export function calcDeviation(value: number, average: number, stdDev: number, reverse = false): number {
  return reverse
    ? 50 + 10 * (average - value) / stdDev
    : 50 + 10 * (value - average) / stdDev
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

// 学年から実年齢を取得
export function getActualAge(grade: string): number {
  const ages: Record<string, number> = {
    'k5': 6, '1': 7, '2': 8, '3': 9, '4': 10, '5': 11, '6': 12
  }
  return ages[grade] || 10
}

// 運動器年齢計算
export function calcMotorAge(scores: Record<string, number>, actualAge: number): number {
  const values = Object.values(scores)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.round((actualAge + (avg - 5) * 0.8) * 10) / 10
}

// 運動タイプ判定
export function determineType(scores: Record<string, number>): { name: string; desc: string } {
  const values = Object.values(scores)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const maxKey = sorted[0][0]
  const range = sorted[0][1] - sorted[sorted.length - 1][1]

  if (avg >= 8) {
    return {
      name: 'オールラウンドエリート型',
      desc: '全ての運動能力が高水準でバランスよく発達。どのスポーツでも活躍できる素質。'
    }
  }

  if (range >= 3) {
    const typeMap: Record<string, { name: string; desc: string }> = {
      grip: { name: 'パワーファイター型', desc: '筋力に優れ、投げる・押す・引くなどのパワー系動作で力を発揮。' },
      squat: { name: 'スタミナエリート型', desc: '筋持久力に優れ、長時間の運動でも安定したパフォーマンスを発揮。' },
      sidestep: { name: 'リアクションスター型', desc: '反応速度と敏捷性に優れ、素早い判断と動作が得意。' },
      doublejump: { name: 'バランスマスター型', desc: 'バランス能力に優れ、不安定な状況でも体をコントロール可能。' },
      jump: { name: 'ジャンプエリート型', desc: '下半身の瞬発力が優れ、跳躍力を活かしたスポーツにアドバンテージ。' },
      dash: { name: 'スピードスター型', desc: '俊敏性とスピードに優れ、短距離走や素早い動きが得意。' },
      throw: { name: 'スローイングエース型', desc: '投力に優れ、投げる動作を伴うスポーツで力を発揮。' }
    }
    return typeMap[maxKey] || { name: 'バランスアスリート型', desc: '全体的にバランスよく発達。様々なスポーツにチャレンジできる土台。' }
  }

  if (avg >= 6) {
    return { name: 'バランスアスリート型', desc: '全体的にバランスよく発達。様々なスポーツにチャレンジできる土台。' }
  }

  if (avg >= 4) {
    return { name: '成長アスリート型', desc: '現在成長段階。継続的な運動習慣により大きく能力が伸びる可能性。' }
  }

  return { name: 'ポテンシャル型', desc: '大きな伸びしろを秘めている。多様な運動経験で能力が開花。' }
}

// クラス判定
export function determineClass(scores: Record<string, number>): 'beginner' | 'standard' | 'expert' {
  const values = Object.values(scores)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const min = Math.min(...values)

  if (avg >= 7 && min >= 5) return 'expert'
  if (avg >= 5) return 'standard'
  return 'beginner'
}

// 弱点クラス判定
export function getWeaknessClass(scores: Record<string, number>): { key: string; name: string; score: number } {
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1])
  const weakest = sorted[0]
  const classMap: Record<string, string> = {
    grip: '筋力強化クラス',
    jump: '瞬発力クラス',
    dash: 'スピードクラス',
    doublejump: 'バランスクラス',
    squat: '持久力クラス',
    sidestep: '敏捷性クラス',
    throw: '投力クラス'
  }
  return { key: weakest[0], name: classMap[weakest[0]], score: weakest[1] }
}

// 適性スポーツ計算
export function calcSportsAptitude(scores: Record<string, number>) {
  return allSports.map(sport => {
    let total = 0
    sport.required.forEach(key => {
      if (scores[key]) total += scores[key]
    })
    return { ...sport, aptitude: total / sport.required.length }
  }).sort((a, b) => b.aptitude - a.aptitude)
}

// 診断実行（フル）
export function runDiagnosis(
  grade: string,
  gender: 'male' | 'female',
  measurements: {
    gripAvg: number
    jump: number
    dash: number
    doublejump?: number
    squat?: number
    sidestep?: number
    throw?: number
  },
  mode: 'simple' | 'detail'
) {
  const avg = averageData[grade][gender]
  const actualAge = getActualAge(grade)

  // 偏差値計算
  const deviations: Record<string, number> = {
    grip: calcDeviation(measurements.gripAvg, avg.grip, sd.grip),
    jump: calcDeviation(measurements.jump, avg.jump, sd.jump),
    dash: calcDeviation(measurements.dash, avg.dash, sd.dash, true) // タイムは逆転
  }

  if (mode === 'detail' && measurements.doublejump !== undefined) {
    deviations.doublejump = calcDeviation(measurements.doublejump, avg.doublejump, sd.doublejump)
    deviations.squat = calcDeviation(measurements.squat!, avg.squat, sd.squat)
    deviations.sidestep = calcDeviation(measurements.sidestep!, avg.sidestep, sd.sidestep)
    deviations.throw = calcDeviation(measurements.throw!, avg.throw, sd.throw)
  }

  // 10段階評価
  const scores: Record<string, number> = {}
  for (const key in deviations) {
    scores[key] = deviationTo10Scale(deviations[key])
  }

  // 運動器年齢
  const motorAge = calcMotorAge(scores, actualAge)
  const motorAgeDiff = motorAge - actualAge

  // 運動タイプ
  const type = determineType(scores)

  // クラス判定
  const classLevel = determineClass(scores)

  // 弱点クラス
  const weaknessClass = getWeaknessClass(scores)

  // 適性スポーツ
  const sportsAptitude = calcSportsAptitude(scores)

  // 1ヶ月目標
  const goals: Record<string, number> = {
    grip: Math.round(measurements.gripAvg * 1.05 * 10) / 10,
    jump: Math.round(measurements.jump * 1.03),
    dash: Math.round(measurements.dash * 0.97 * 100) / 100
  }

  return {
    scores,
    deviations,
    motorAge,
    motorAgeDiff,
    type,
    classLevel,
    weaknessClass,
    sportsAptitude,
    goals,
    developmentAdvice: developmentAdvice[grade]
  }
}

// 学年表示用
export function getGradeDisplay(grade: string): string {
  return grade === 'k5' ? '年長' : `小学${grade}年生`
}
