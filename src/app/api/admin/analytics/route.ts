import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

// 型定義
type MeasurementWithChild = {
  id?: string
  store_id?: string
  measured_at?: string
  grip_right: number | null
  grip_left: number | null
  jump: number | null
  dash: number | null
  doublejump: number | null
  squat: number | null
  sidestep: number | null
  throw: number | null
  children: {
    grade: string
    gender: string
    height: number | null
    weight: number | null
  }
}

type ResultWithMeasurement = {
  weakness_class: string | null
  scores: Record<string, number> | null
  type_name: string | null
  motor_age?: number | null
  measurements: {
    store_id: string
    measured_at: string
    children: {
      grade: string
      gender: string
    }
  }
}

type ChildWithMeasurements = {
  id: string
  name: string
  grade: string
  gender: string
  measurements: Array<{
    id: string
    measured_at: string
    grip_right: number | null
    grip_left: number | null
    jump: number | null
    dash: number | null
    doublejump: number | null
    squat: number | null
    sidestep: number | null
    throw: number | null
    results: Array<{
      motor_age: number | null
      scores: Record<string, number> | null
    }>
  }>
}

// 統計計算用ヘルパー関数
function calcMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function calcMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function calcStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
}

function calcCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0
  const meanX = calcMean(x)
  const meanY = calcMean(y)
  let numerator = 0
  let denomX = 0
  let denomY = 0
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }
  const denom = Math.sqrt(denomX * denomY)
  return denom === 0 ? 0 : numerator / denom
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const grade = searchParams.get('grade')
  const gender = searchParams.get('gender')
  const storeId = searchParams.get('store_id')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  const cookieStore = await cookies()
  const supabase = createServerComponentClient(cookieStore)

  try {
    switch (type) {
      case 'benchmark': {
        // 学年×性別の統計値算出
        let query = supabase
          .from('measurements')
          .select(`
            *,
            children!inner(grade, gender, height, weight),
            results(motor_age, type_name, weakness_class, scores)
          `)

        if (grade && grade !== 'all') {
          query = query.eq('children.grade', grade)
        }
        if (gender && gender !== 'all') {
          query = query.eq('children.gender', gender)
        }
        if (storeId && storeId !== 'all') {
          query = query.eq('store_id', storeId)
        }
        if (startDate) {
          query = query.gte('measured_at', startDate)
        }
        if (endDate) {
          query = query.lte('measured_at', endDate)
        }

        const { data: rawMeasurements, error } = await query

        if (error) throw error

        const measurements = (rawMeasurements || []) as unknown as MeasurementWithChild[]

        // 学年×性別ごとにグループ化して統計を計算
        const groupedStats: Record<string, {
          grade: string
          gender: string
          count: number
          stats: Record<string, {
            mean: number
            median: number
            stdDev: number
            min: number
            max: number
          }>
        }> = {}

        const grades = ['k5', '1', '2', '3', '4', '5', '6']
        const genders = ['male', 'female']
        const metrics = ['grip_right', 'grip_left', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw'] as const

        for (const g of grades) {
          for (const s of genders) {
            const key = `${g}_${s}`
            const filtered = measurements.filter(m =>
              m.children?.grade === g && m.children?.gender === s
            )

            if (filtered.length === 0) continue

            const stats: Record<string, { mean: number; median: number; stdDev: number; min: number; max: number }> = {}

            for (const metric of metrics) {
              const values = filtered
                .map(m => m[metric])
                .filter((v): v is number => v !== null && v !== undefined)

              if (values.length === 0) continue

              const mean = calcMean(values)
              stats[metric] = {
                mean: Math.round(mean * 100) / 100,
                median: Math.round(calcMedian(values) * 100) / 100,
                stdDev: Math.round(calcStdDev(values, mean) * 100) / 100,
                min: Math.min(...values),
                max: Math.max(...values)
              }
            }

            groupedStats[key] = {
              grade: g,
              gender: s,
              count: filtered.length,
              stats
            }
          }
        }

        return NextResponse.json({
          success: true,
          data: groupedStats,
          totalMeasurements: measurements.length
        })
      }

      case 'correlation': {
        // 測定項目間の相関マトリクス
        let query = supabase
          .from('measurements')
          .select(`
            grip_right, grip_left, jump, dash, doublejump, squat, sidestep, throw,
            children!inner(grade, gender, height, weight)
          `)
          .not('doublejump', 'is', null)

        if (grade && grade !== 'all') {
          query = query.eq('children.grade', grade)
        }
        if (gender && gender !== 'all') {
          query = query.eq('children.gender', gender)
        }
        if (storeId && storeId !== 'all') {
          query = query.eq('store_id', storeId)
        }

        const { data: rawMeasurements, error } = await query

        if (error) throw error

        const measurements = (rawMeasurements || []) as unknown as MeasurementWithChild[]

        const metrics = ['grip_right', 'grip_left', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw'] as const
        const metricLabels: Record<string, string> = {
          grip_right: '握力(右)',
          grip_left: '握力(左)',
          jump: '立ち幅跳び',
          dash: '15mダッシュ',
          doublejump: '連続立ち幅跳び',
          squat: 'スクワット',
          sidestep: '反復横跳び',
          throw: 'ボール投げ'
        }

        // 相関マトリクスを計算
        const matrix: { x: string; y: string; correlation: number }[] = []

        for (const m1 of metrics) {
          for (const m2 of metrics) {
            const values1 = measurements.map(m => m[m1]).filter((v): v is number => v !== null)
            const values2 = measurements.map(m => m[m2]).filter((v): v is number => v !== null)

            let corr = calcCorrelation(values1, values2)
            if (m1 === 'dash' || m2 === 'dash') {
              if (m1 !== m2) {
                corr = -corr
              }
            }

            matrix.push({
              x: metricLabels[m1],
              y: metricLabels[m2],
              correlation: Math.round(corr * 100) / 100
            })
          }
        }

        // 身体データとの相関
        const bodyCorrelations: { metric: string; height: number; weight: number; bmi: number }[] = []

        for (const metric of metrics) {
          const validData = measurements.filter(m =>
            m[metric] !== null &&
            m.children?.height !== null && m.children?.height !== undefined &&
            m.children?.weight !== null && m.children?.weight !== undefined
          )

          const metricValues = validData.map(m => m[metric] as number)
          const heights = validData.map(m => m.children.height as number)
          const weights = validData.map(m => m.children.weight as number)
          const bmis = validData.map(m => (m.children.weight as number) / Math.pow((m.children.height as number) / 100, 2))

          let heightCorr = calcCorrelation(metricValues, heights)
          let weightCorr = calcCorrelation(metricValues, weights)
          let bmiCorr = calcCorrelation(metricValues, bmis)

          if (metric === 'dash') {
            heightCorr = -heightCorr
            weightCorr = -weightCorr
            bmiCorr = -bmiCorr
          }

          bodyCorrelations.push({
            metric: metricLabels[metric],
            height: Math.round(heightCorr * 100) / 100,
            weight: Math.round(weightCorr * 100) / 100,
            bmi: Math.round(bmiCorr * 100) / 100
          })
        }

        // 強い相関のインサイトを自動抽出
        const insights: string[] = []
        const strongPositive = matrix.filter(m => m.x !== m.y && m.correlation >= 0.6)
        const strongNegative = matrix.filter(m => m.x !== m.y && m.correlation <= -0.4)

        const seenPairs = new Set<string>()
        for (const item of strongPositive) {
          const pairKey = [item.x, item.y].sort().join('_')
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey)
            insights.push(`${item.x}が高い子は${item.y}も高い傾向があります（相関係数: ${item.correlation}）`)
          }
        }
        for (const item of strongNegative) {
          const pairKey = [item.x, item.y].sort().join('_')
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey)
            insights.push(`${item.x}と${item.y}には負の相関があります（相関係数: ${item.correlation}）`)
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            matrix,
            bodyCorrelations,
            insights,
            sampleSize: measurements.length
          }
        })
      }

      case 'store-comparison': {
        const { data: stores, error: storesError } = await supabase
          .from('stores')
          .select('id, name, slug')

        if (storesError) throw storesError

        let measurementsQuery = supabase
          .from('measurements')
          .select(`
            store_id, grip_right, grip_left, jump, dash, doublejump, squat, sidestep, throw,
            children!inner(grade, gender)
          `)

        if (grade && grade !== 'all') {
          measurementsQuery = measurementsQuery.eq('children.grade', grade)
        }
        if (gender && gender !== 'all') {
          measurementsQuery = measurementsQuery.eq('children.gender', gender)
        }
        if (startDate) {
          measurementsQuery = measurementsQuery.gte('measured_at', startDate)
        }
        if (endDate) {
          measurementsQuery = measurementsQuery.lte('measured_at', endDate)
        }

        const { data: rawMeasurements, error } = await measurementsQuery

        if (error) throw error

        const measurements = (rawMeasurements || []) as unknown as (MeasurementWithChild & { store_id: string })[]

        const metrics = ['grip_right', 'grip_left', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw'] as const
        const metricLabels: Record<string, string> = {
          grip_right: '握力(右)',
          grip_left: '握力(左)',
          jump: '立ち幅跳び',
          dash: '15mダッシュ',
          doublejump: '連続立ち幅跳び',
          squat: 'スクワット',
          sidestep: '反復横跳び',
          throw: 'ボール投げ'
        }

        // 全体平均を計算
        const overallMeans: Record<string, number> = {}
        for (const metric of metrics) {
          const values = measurements.map(m => m[metric]).filter((v): v is number => v !== null)
          overallMeans[metric] = values.length > 0 ? calcMean(values) : 0
        }

        // 店舗ごとの統計
        const storeStats = stores?.map(store => {
          const storeMeasurements = measurements.filter(m => m.store_id === store.id)
          const stats: Record<string, { mean: number; diffFromOverall: number }> = {}

          for (const metric of metrics) {
            const values = storeMeasurements.map(m => m[metric]).filter((v): v is number => v !== null)
            const mean = values.length > 0 ? calcMean(values) : 0
            stats[metric] = {
              mean: Math.round(mean * 100) / 100,
              diffFromOverall: Math.round((mean - overallMeans[metric]) * 100) / 100
            }
          }

          return {
            storeId: store.id,
            storeName: store.name,
            measurementCount: storeMeasurements.length,
            stats
          }
        }) || []

        return NextResponse.json({
          success: true,
          data: {
            overallMeans: Object.fromEntries(
              Object.entries(overallMeans).map(([k, v]) => [metricLabels[k], Math.round(v * 100) / 100])
            ),
            storeStats,
            metrics: metrics.map(m => metricLabels[m])
          }
        })
      }

      case 'trend': {
        const period = searchParams.get('period') || 'month'

        let query = supabase
          .from('measurements')
          .select(`
            measured_at, grip_right, grip_left, jump, dash, doublejump, squat, sidestep, throw,
            children!inner(grade, gender)
          `)
          .order('measured_at', { ascending: true })

        if (grade && grade !== 'all') {
          query = query.eq('children.grade', grade)
        }
        if (gender && gender !== 'all') {
          query = query.eq('children.gender', gender)
        }
        if (storeId && storeId !== 'all') {
          query = query.eq('store_id', storeId)
        }

        const { data: rawMeasurements, error } = await query

        if (error) throw error

        const measurements = (rawMeasurements || []) as unknown as (MeasurementWithChild & { measured_at: string })[]

        const metricLabels: Record<string, string> = {
          grip_right: '握力(右)',
          grip_left: '握力(左)',
          jump: '立ち幅跳び',
          dash: '15mダッシュ',
          doublejump: '連続立ち幅跳び',
          squat: 'スクワット',
          sidestep: '反復横跳び',
          throw: 'ボール投げ'
        }
        const metrics = ['grip_right', 'grip_left', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw'] as const

        // 期間ごとにグループ化
        const grouped: Record<string, typeof measurements> = {}

        measurements.forEach(m => {
          const date = new Date(m.measured_at)
          let key: string

          switch (period) {
            case 'year':
              key = `${date.getFullYear()}`
              break
            case 'quarter':
              const quarter = Math.ceil((date.getMonth() + 1) / 3)
              key = `${date.getFullYear()}-Q${quarter}`
              break
            case 'month':
            default:
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          }

          if (!grouped[key]) grouped[key] = []
          grouped[key].push(m)
        })

        // 各期間の平均を計算
        const trendData = Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([periodKey, data]) => {
            const result: Record<string, number | string> = { period: periodKey, count: data.length }

            for (const metric of metrics) {
              const values = data.map(m => m[metric]).filter((v): v is number => v !== null)
              result[metricLabels[metric]] = values.length > 0 ? Math.round(calcMean(values) * 100) / 100 : 0
            }

            return result
          })

        // 前年同期比を計算
        const yoyComparison: Record<string, Record<string, number>> = {}

        for (let i = 1; i < trendData.length; i++) {
          const current = trendData[i]
          const periodStr = current.period as string

          let prevPeriod: string | null = null
          if (period === 'year') {
            prevPeriod = `${parseInt(periodStr) - 1}`
          } else if (period === 'quarter') {
            const [year, q] = periodStr.split('-Q')
            prevPeriod = `${parseInt(year) - 1}-Q${q}`
          } else {
            const [year, month] = periodStr.split('-')
            prevPeriod = `${parseInt(year) - 1}-${month}`
          }

          const prevData = trendData.find(t => t.period === prevPeriod)
          if (prevData) {
            yoyComparison[periodStr] = {}
            for (const metricLabel of Object.values(metricLabels)) {
              const currentVal = current[metricLabel] as number
              const prevVal = prevData[metricLabel] as number
              if (prevVal !== 0) {
                yoyComparison[periodStr][metricLabel] = Math.round(((currentVal - prevVal) / prevVal) * 10000) / 100
              }
            }
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            trendData,
            yoyComparison,
            metrics: Object.values(metricLabels)
          }
        })
      }

      case 'weakness': {
        const { data: rawResults, error } = await supabase
          .from('results')
          .select(`
            weakness_class, scores, type_name,
            measurements!inner(
              store_id, measured_at,
              children!inner(grade, gender)
            )
          `)

        if (error) throw error

        const results = (rawResults || []) as unknown as ResultWithMeasurement[]

        // フィルタリング
        let filteredResults = results
        if (grade && grade !== 'all') {
          filteredResults = filteredResults.filter(r => r.measurements?.children?.grade === grade)
        }
        if (gender && gender !== 'all') {
          filteredResults = filteredResults.filter(r => r.measurements?.children?.gender === gender)
        }
        if (storeId && storeId !== 'all') {
          filteredResults = filteredResults.filter(r => r.measurements?.store_id === storeId)
        }

        // 弱点分野ランキング
        const weaknessCount: Record<string, number> = {}
        filteredResults.forEach(r => {
          if (r.weakness_class) {
            weaknessCount[r.weakness_class] = (weaknessCount[r.weakness_class] || 0) + 1
          }
        })

        const weaknessRanking = Object.entries(weaknessCount)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / filteredResults.length) * 10000) / 100
          }))

        // 運動タイプ別の分布
        const typeCount: Record<string, number> = {}
        filteredResults.forEach(r => {
          if (r.type_name) {
            typeCount[r.type_name] = (typeCount[r.type_name] || 0) + 1
          }
        })

        const typeDistribution = Object.entries(typeCount)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / filteredResults.length) * 10000) / 100
          }))

        return NextResponse.json({
          success: true,
          data: {
            weaknessRanking,
            typeDistribution,
            totalSamples: filteredResults.length
          }
        })
      }

      case 'scatter': {
        const metric = searchParams.get('metric') || 'jump'
        const bodyMetric = searchParams.get('body_metric') || 'height'

        let query = supabase
          .from('measurements')
          .select(`
            grip_right, grip_left, jump, dash, doublejump, squat, sidestep, throw,
            children!inner(grade, gender, height, weight)
          `)

        if (grade && grade !== 'all') {
          query = query.eq('children.grade', grade)
        }
        if (gender && gender !== 'all') {
          query = query.eq('children.gender', gender)
        }

        const { data: rawMeasurements, error } = await query

        if (error) throw error

        const measurements = (rawMeasurements || []) as unknown as MeasurementWithChild[]

        // 身体データに基づいてフィルタリング
        const validData = measurements.filter(m => {
          const metricValue = m[metric as keyof MeasurementWithChild]
          if (metricValue === null || metricValue === undefined) return false

          if (bodyMetric === 'bmi') {
            return m.children?.height && m.children?.weight
          }
          return m.children?.[bodyMetric as 'height' | 'weight']
        })

        const scatterData = validData.map(m => {
          let bodyValue: number
          if (bodyMetric === 'bmi') {
            bodyValue = (m.children.weight as number) / Math.pow((m.children.height as number) / 100, 2)
          } else {
            bodyValue = m.children[bodyMetric as 'height' | 'weight'] as number
          }

          return {
            x: Math.round(bodyValue * 10) / 10,
            y: m[metric as keyof MeasurementWithChild] as number,
            grade: m.children.grade,
            gender: m.children.gender
          }
        })

        // 回帰直線の計算
        const xValues = scatterData.map(d => d.x)
        const yValues = scatterData.map(d => d.y)
        const meanX = calcMean(xValues)
        const meanY = calcMean(yValues)

        let numerator = 0
        let denominator = 0
        for (let i = 0; i < xValues.length; i++) {
          numerator += (xValues[i] - meanX) * (yValues[i] - meanY)
          denominator += Math.pow(xValues[i] - meanX, 2)
        }

        const slope = denominator !== 0 ? numerator / denominator : 0
        const intercept = meanY - slope * meanX
        const correlation = calcCorrelation(xValues, yValues)

        const adjustedCorrelation = metric === 'dash' ? -correlation : correlation

        return NextResponse.json({
          success: true,
          data: {
            points: scatterData,
            regression: {
              slope: Math.round(slope * 1000) / 1000,
              intercept: Math.round(intercept * 100) / 100,
              correlation: Math.round(adjustedCorrelation * 100) / 100
            },
            sampleSize: scatterData.length
          }
        })
      }

      case 'type-validation': {
        const { data: rawResults, error } = await supabase
          .from('results')
          .select(`
            type_name, scores,
            measurements!inner(
              doublejump,
              children!inner(grade, gender)
            )
          `)
          .not('measurements.doublejump', 'is', null)

        if (error) throw error

        type TypeValidationResult = {
          type_name: string | null
          scores: Record<string, number> | null
          measurements: {
            doublejump: number | null
            children: {
              grade: string
              gender: string
            }
          }
        }

        const results = (rawResults || []) as unknown as TypeValidationResult[]

        let filteredResults = results
        if (grade && grade !== 'all') {
          filteredResults = filteredResults.filter(r => r.measurements?.children?.grade === grade)
        }
        if (gender && gender !== 'all') {
          filteredResults = filteredResults.filter(r => r.measurements?.children?.gender === gender)
        }

        // 運動タイプごとの各測定項目の平均値を計算
        const typeStats: Record<string, {
          type: string
          count: number
          avgScores: Record<string, number>
        }> = {}

        const scoreMetrics = ['grip', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw']

        filteredResults.forEach(r => {
          if (!r.type_name || !r.scores) return

          if (!typeStats[r.type_name]) {
            typeStats[r.type_name] = {
              type: r.type_name,
              count: 0,
              avgScores: {}
            }
            for (const m of scoreMetrics) {
              typeStats[r.type_name].avgScores[m] = 0
            }
          }

          typeStats[r.type_name].count++
          const scores = r.scores
          for (const m of scoreMetrics) {
            if (scores[m]) {
              typeStats[r.type_name].avgScores[m] += scores[m]
            }
          }
        })

        // 平均を計算
        for (const type of Object.values(typeStats)) {
          for (const m of scoreMetrics) {
            type.avgScores[m] = type.count > 0
              ? Math.round((type.avgScores[m] / type.count) * 10) / 10
              : 0
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            typeStats: Object.values(typeStats),
            metrics: scoreMetrics.map(m => {
              const labels: Record<string, string> = {
                grip: '筋力',
                jump: '瞬発力',
                dash: '移動能力',
                doublejump: 'バランス',
                squat: '筋持久力',
                sidestep: '敏捷性',
                throw: '投力'
              }
              return labels[m]
            }),
            totalSamples: filteredResults.length
          }
        })
      }

      case 'cohort': {
        const { data: rawChildren, error } = await supabase
          .from('children')
          .select(`
            id, name, grade, gender,
            measurements(
              id, measured_at, grip_right, grip_left, jump, dash, doublejump, squat, sidestep, throw,
              results(motor_age, scores)
            )
          `)

        if (error) throw error

        const children = (rawChildren || []) as unknown as ChildWithMeasurements[]

        // 複数回測定がある児童のみをフィルタ
        const multiMeasurementChildren = children.filter(c =>
          c.measurements && c.measurements.length >= 2
        )

        // フィルタリング
        let filteredChildren = multiMeasurementChildren
        if (grade && grade !== 'all') {
          filteredChildren = filteredChildren.filter(c => c.grade === grade)
        }
        if (gender && gender !== 'all') {
          filteredChildren = filteredChildren.filter(c => c.gender === gender)
        }

        // 各児童の成長推移を計算
        const cohortData = filteredChildren.map(child => {
          const sortedMeasurements = [...(child.measurements || [])]
            .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())

          const growthData = sortedMeasurements.map((m, i) => {
            const gripAvg = ((m.grip_right || 0) + (m.grip_left || 0)) / 2
            return {
              measurementNumber: i + 1,
              date: m.measured_at,
              gripAvg: Math.round(gripAvg * 10) / 10,
              jump: m.jump,
              dash: m.dash,
              doublejump: m.doublejump,
              squat: m.squat,
              sidestep: m.sidestep,
              throw: m.throw,
              motorAge: m.results?.[0]?.motor_age
            }
          })

          // 初回から最新までの伸び率を計算
          const first = growthData[0]
          const last = growthData[growthData.length - 1]
          const improvement: Record<string, number> = {}

          if (first && last) {
            if (first.gripAvg > 0) improvement.grip = Math.round(((last.gripAvg - first.gripAvg) / first.gripAvg) * 10000) / 100
            if (first.jump && first.jump > 0 && last.jump) improvement.jump = Math.round(((last.jump - first.jump) / first.jump) * 10000) / 100
            if (first.dash && first.dash > 0 && last.dash) improvement.dash = Math.round(((first.dash - last.dash) / first.dash) * 10000) / 100
            if (first.doublejump && first.doublejump > 0 && last.doublejump) improvement.doublejump = Math.round(((last.doublejump - first.doublejump) / first.doublejump) * 10000) / 100
            if (first.squat && first.squat > 0 && last.squat) improvement.squat = Math.round(((last.squat - first.squat) / first.squat) * 10000) / 100
            if (first.sidestep && first.sidestep > 0 && last.sidestep) improvement.sidestep = Math.round(((last.sidestep - first.sidestep) / first.sidestep) * 10000) / 100
            if (first.throw && first.throw > 0 && last.throw) improvement.throw = Math.round(((last.throw - first.throw) / first.throw) * 10000) / 100
          }

          return {
            childId: child.id,
            childName: child.name,
            grade: child.grade,
            gender: child.gender,
            measurementCount: sortedMeasurements.length,
            growthData,
            improvement
          }
        })

        // 全体の平均伸び率を計算
        const avgImprovement: Record<string, number> = {
          grip: 0, jump: 0, dash: 0, doublejump: 0, squat: 0, sidestep: 0, throw: 0
        }
        const improvementCounts: Record<string, number> = {
          grip: 0, jump: 0, dash: 0, doublejump: 0, squat: 0, sidestep: 0, throw: 0
        }

        cohortData.forEach(c => {
          for (const [key, value] of Object.entries(c.improvement)) {
            if (value !== undefined && !isNaN(value)) {
              avgImprovement[key] += value
              improvementCounts[key]++
            }
          }
        })

        for (const key of Object.keys(avgImprovement)) {
          avgImprovement[key] = improvementCounts[key] > 0
            ? Math.round((avgImprovement[key] / improvementCounts[key]) * 100) / 100
            : 0
        }

        return NextResponse.json({
          success: true,
          data: {
            cohortData: cohortData.slice(0, 50),
            avgImprovement,
            totalChildren: cohortData.length
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
