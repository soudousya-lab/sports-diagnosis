'use client'

import RadarChart from './RadarChart'
import { Store } from '@/lib/supabase'
import { getGrade, getGradeDisplay, categories, developmentAdvice } from '@/lib/diagnosis'

type Props = {
  store: Store
  child: {
    name: string
    furigana: string
    grade: string
    gender: 'male' | 'female'
    height: number
    weight: number
  }
  measurements: {
    gripAvg: number
    gripRight: number
    gripLeft: number
    jump: number
    dash: number
    doublejump: number
    squat: number
    sidestep: number
    throw: number
  }
  result: {
    scores: Record<string, number>
    motorAge: number
    motorAgeDiff: number
    type: { name: string; desc: string }
    classLevel: 'beginner' | 'standard' | 'expert'
    weaknessClass: { key: string; name: string; score: number }
    sportsAptitude: Array<{ name: string; icon: string; aptitude: number }>
    goals: Record<string, number>
  }
  trainings: Array<{
    name: string
    description: string
    reps: string
    effect: string
    category: string
    priority: string
  }>
  averageData: Record<string, number>
}

export default function DetailResult({ store, child, measurements, result, trainings, averageData }: Props) {
  const actualAge = child.grade === 'k5' ? 6 : parseInt(child.grade) + 6
  const today = new Date().toLocaleDateString('ja-JP')
  const devAdv = developmentAdvice[child.grade]

  const measurementItems = [
    { key: 'grip', name: '握力', cat: '筋力', val: `${measurements.gripAvg.toFixed(1)}kg`, avg: `${averageData.grip}kg` },
    { key: 'jump', name: '立ち幅跳び', cat: '瞬発力', val: `${measurements.jump}cm`, avg: `${averageData.jump}cm` },
    { key: 'dash', name: '15mダッシュ', cat: '移動能力', val: `${measurements.dash}秒`, avg: `${averageData.dash}秒` },
    { key: 'doublejump', name: '連続立ち幅跳び', cat: 'バランス', val: `${measurements.doublejump}cm`, avg: `${averageData.doublejump}cm` },
    { key: 'squat', name: '30秒スクワット', cat: '筋持久力', val: `${measurements.squat}回`, avg: `${averageData.squat}回` },
    { key: 'sidestep', name: '反復横跳び', cat: '敏捷性', val: `${measurements.sidestep}回`, avg: `${averageData.sidestep}回` },
    { key: 'throw', name: 'ボール投げ', cat: '投力', val: `${measurements.throw}m`, avg: `${averageData.throw}m` }
  ]

  const allKeys = ['grip', 'jump', 'dash', 'doublejump', 'squat', 'sidestep', 'throw']
  const allLabels = ['筋力', '瞬発力', '移動能力', 'バランス', '筋持久力', '敏捷性', '投力']

  // 強み・弱み分析
  const sorted = Object.entries(result.scores).sort((a, b) => a[1] - b[1])
  const weakestKey = sorted[0][0]
  const strongestKey = sorted[sorted.length - 1][0]

  // 50m走予測
  const est50m = (measurements.dash * 3 + 1.2).toFixed(1)

  return (
    <div className="space-y-4 xs:space-y-6 max-w-4xl mx-auto">
      {/* ページ1 */}
      <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="flex flex-col xs:flex-row justify-between items-start p-4 xs:p-6 border-b-4 border-blue-900 gap-2 xs:gap-0">
          <div>
            <h1 className="text-lg xs:text-xl text-blue-900 font-bold tracking-wider mb-1">運動能力診断レポート</h1>
            <div className="text-[10px] xs:text-xs text-gray-600">Athletic Performance Assessment Report</div>
          </div>
          <div className="text-left xs:text-right text-[10px] xs:text-xs text-gray-600">
            <div className="inline-block px-2 xs:px-3 py-1 bg-blue-900 text-white font-bold rounded mb-1">DETAIL</div>
            <div>測定日: {today}</div>
          </div>
        </div>

        {/* 被験者情報 */}
        <div className="bg-blue-50 border border-blue-200 p-3 xs:p-4 m-4 xs:m-6 rounded-lg flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
          <div className="text-lg xs:text-xl font-bold text-blue-900">
            <span className="text-[10px] xs:text-xs font-normal text-gray-600 block mb-1">{child.furigana}</span>
            {child.name} 様
          </div>
          <div className="text-[10px] xs:text-xs text-gray-600 text-left xs:text-right leading-relaxed">
            {getGradeDisplay(child.grade)}（{actualAge}歳）・{child.gender === 'male' ? '男子' : '女子'}<br />
            身長 {child.height}cm ／ 体重 {child.weight}kg
          </div>
        </div>

        {/* 運動器年齢 */}
        <div className="flex flex-col xs:flex-row gap-4 xs:gap-6 items-center p-4 xs:p-5 bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-500 rounded-lg mx-4 xs:mx-6 mb-4 xs:mb-6">
          <div className="w-24 h-24 xs:w-28 xs:h-28 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0">
            <span className="text-[8px] xs:text-[9px] opacity-90">運動器年齢</span>
            <span className="text-3xl xs:text-4xl font-extrabold">{Math.round(result.motorAge)}</span>
            <span className="text-xs xs:text-sm">歳</span>
          </div>
          <div className="text-xs xs:text-sm leading-relaxed text-center xs:text-left">
            実年齢 <span className="text-base xs:text-lg font-extrabold text-blue-900">{actualAge}歳</span> に対して、運動器年齢は
            <span className={`text-base xs:text-lg font-extrabold ${result.motorAgeDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {result.motorAgeDiff >= 0 ? '+' : ''}{result.motorAgeDiff.toFixed(1)}歳
            </span> です。<br /><br />
            {result.motorAgeDiff >= 1
              ? '運動能力が同年代より優れています。この調子で様々な運動にチャレンジしましょう。'
              : result.motorAgeDiff >= -1
                ? '年齢相応の運動能力です。継続的な運動で更に伸ばせます。'
                : '運動能力向上の余地があります。下記のトレーニングを参考にしてください。'
            }
          </div>
        </div>

        {/* 測定結果（7項目） */}
        <div className="mx-4 xs:mx-6 mb-4 xs:mb-6">
          <div className="text-xs xs:text-sm font-bold text-white bg-blue-900 px-3 xs:px-4 py-2 rounded mb-3">
            測定結果と10段階評価（7項目）
          </div>
          <div className="flex flex-col xs:flex-row gap-4 xs:gap-5">
            <div className="w-full xs:w-56 flex-shrink-0 flex justify-center">
              <RadarChart
                scores={result.scores}
                keys={allKeys}
                labels={allLabels}
              />
            </div>
            <table className="flex-1 border-collapse text-[10px] xs:text-xs">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-blue-900 text-white p-2">測定項目</th>
                  <th className="border border-gray-200 bg-blue-900 text-white p-2">カテゴリ</th>
                  <th className="border border-gray-200 bg-blue-900 text-white p-2">測定値</th>
                  <th className="border border-gray-200 bg-blue-900 text-white p-2">平均</th>
                  <th className="border border-gray-200 bg-blue-900 text-white p-2">評点</th>
                  <th className="border border-gray-200 bg-blue-900 text-white p-2">判定</th>
                </tr>
              </thead>
              <tbody>
                {measurementItems.map(item => {
                  const grade = getGrade(result.scores[item.key])
                  return (
                    <tr key={item.key}>
                      <td className="border border-gray-200 p-2 font-semibold bg-gray-50">{item.name}</td>
                      <td className="border border-gray-200 p-2 text-center">{item.cat}</td>
                      <td className="border border-gray-200 p-2 text-center font-bold">{item.val}</td>
                      <td className="border border-gray-200 p-2 text-center">{item.avg}</td>
                      <td className="border border-gray-200 p-2 text-center text-base font-extrabold">{result.scores[item.key]}</td>
                      <td className={`border border-gray-200 p-2 text-center font-extrabold ${grade.colorClass}`}>{grade.grade}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="text-[9px] text-gray-600 mt-2">
            ※評点は10段階評価（10が最高）、判定 A:非常に優秀 B:良好 C:標準 D:要改善 E:要注意
          </div>
        </div>

        {/* 運動タイプ */}
        <div className="mx-4 xs:mx-6 mb-4 xs:mb-6 border-4 border-blue-900 p-4 xs:p-5 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
          <div className="text-[10px] xs:text-xs text-gray-600 mb-2">運動タイプ診断結果</div>
          <div className="text-xl xs:text-2xl font-extrabold text-blue-900 mb-3 tracking-wider">{result.type.name}</div>
          <div className="text-xs xs:text-sm leading-relaxed">{result.type.desc}</div>
        </div>

        {/* クラス判定 */}
        <div className="mx-4 xs:mx-6 mb-4 xs:mb-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-600 rounded-lg p-4 xs:p-5">
          <h3 className="text-sm xs:text-base font-bold text-green-600 mb-4 text-center">📋 クラス判定結果</h3>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 xs:gap-3">
            {(['beginner', 'standard', 'expert'] as const).map(level => (
              <div
                key={level}
                className={`bg-white rounded-lg p-3 xs:p-4 text-center border-2 ${
                  result.classLevel === level
                    ? 'border-green-600 shadow-lg'
                    : 'border-transparent'
                }`}
              >
                <div className="text-xs xs:text-sm font-bold text-blue-900 mb-2">
                  {level === 'beginner' ? 'ビギナー' : level === 'standard' ? 'スタンダード' : 'エキスパート'}
                </div>
                <div className="text-[9px] xs:text-[10px] text-gray-600 leading-relaxed">
                  {level === 'beginner' && '動物マネっこ体操など\n楽しく体を動かす'}
                  {level === 'standard' && '正しい走り方+\n各種目の基礎練習'}
                  {level === 'expert' && '長所伸展 or 弱点克服\n専門的トレーニング'}
                </div>
                {result.classLevel === level && (
                  <span className="inline-block mt-2 px-2 xs:px-3 py-1 bg-green-600 text-white text-[8px] xs:text-[9px] font-semibold rounded-full">
                    現在のレベル
                  </span>
                )}
              </div>
            ))}
          </div>
          {result.classLevel !== 'expert' && (
            <p className="text-center mt-3 text-[10px] xs:text-xs text-gray-600">
              弱点克服のため <strong className="text-red-600">{result.weaknessClass.name}</strong> への参加もおすすめです
            </p>
          )}
        </div>

        {/* フッター */}
        <div className="px-4 xs:px-6 py-3 xs:py-4 border-t-2 border-blue-900 flex justify-between text-[8px] xs:text-[9px] text-gray-600">
          <div className="font-bold text-blue-900">{store.name}</div>
          <div>1/2</div>
        </div>
      </div>

      {/* ページ2 */}
      <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="flex flex-col xs:flex-row justify-between items-start p-4 xs:p-6 border-b-4 border-blue-900 gap-2 xs:gap-0">
          <div>
            <h1 className="text-lg xs:text-xl text-blue-900 font-bold tracking-wider mb-1">トレーニング＆適性スポーツ</h1>
            <div className="text-[10px] xs:text-xs text-gray-600">Training & Sports Aptitude</div>
          </div>
          <div className="text-left xs:text-right text-[10px] xs:text-xs text-gray-600">
            <div className="inline-block px-2 xs:px-3 py-1 bg-blue-900 text-white font-bold rounded mb-1">DETAIL</div>
            <div>{child.name} 様</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 xs:gap-5 p-4 xs:p-6">
          {/* 左列 */}
          <div>
            {/* 強み・弱み分析 */}
            <div className="text-xs xs:text-sm font-bold text-white bg-blue-900 px-3 xs:px-4 py-2 rounded mb-3">
              強み・弱み分析
            </div>
            <div className="border border-gray-200 p-3 xs:p-4 rounded-lg text-xs xs:text-sm leading-relaxed mb-4">
              <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-[8px] xs:text-[9px] font-bold rounded mb-2">課題項目</span>
              <h4 className="text-blue-900 font-bold mb-2 pb-2 border-b-2 border-blue-900 text-xs xs:text-sm">
                {categories[weakestKey]}（評点：{result.scores[weakestKey]}）
              </h4>
              <p className="text-[10px] xs:text-xs mb-4">この項目を重点的に強化することで、総合的な運動能力の向上が期待できます。</p>

              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-[8px] xs:text-[9px] font-bold rounded mb-2">優位項目</span>
              <h4 className="text-blue-900 font-bold mb-2 pb-2 border-b-2 border-blue-900 text-xs xs:text-sm">
                {categories[strongestKey]}（評点：{result.scores[strongestKey]}）
              </h4>
              <p className="text-[10px] xs:text-xs">この強みを活かせるスポーツで、更なる成長と自信につながります。</p>
            </div>

            {/* スポーツテスト予測 */}
            <div className="text-xs xs:text-sm font-bold text-white bg-blue-900 px-3 xs:px-4 py-2 rounded mb-3">
              スポーツテスト予測
            </div>
            <div className="border border-gray-200 p-3 xs:p-4 rounded-lg mb-4">
              <p className="text-xs xs:text-sm mb-3">50m走予測タイム: <strong className="text-base xs:text-lg">{est50m}秒</strong></p>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                {[
                  { key: 'throw', name: 'ボール投げ' },
                  { key: 'sidestep', name: '反復横跳び' },
                  { key: 'squat', name: 'シャトルラン' },
                  { key: 'jump', name: '立ち幅跳び' }
                ].map(item => (
                  <div
                    key={item.key}
                    className={`text-center p-2 border rounded text-[9px] ${
                      result.scores[item.key] >= 6
                        ? 'bg-green-50 border-green-600'
                        : 'bg-orange-50 border-orange-400'
                    }`}
                  >
                    <div className="font-bold mb-1">{item.name}</div>
                    <div className="text-base font-extrabold">
                      {result.scores[item.key] >= 6 ? 'A' : result.scores[item.key] >= 4 ? 'B' : 'C'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 適性スポーツTOP6 */}
            <div className="text-xs xs:text-sm font-bold text-white bg-blue-900 px-3 xs:px-4 py-2 rounded mb-3">
              適性スポーツ TOP6
            </div>
            <div className="border border-gray-200 p-3 xs:p-4 rounded-lg">
              <div className="text-[9px] xs:text-[10px] font-semibold text-gray-600 mb-1">◎ 特に適性が高い</div>
              <div className="flex flex-wrap gap-1.5 xs:gap-2 mb-3">
                {result.sportsAptitude.slice(0, 3).map(sport => (
                  <span
                    key={sport.name}
                    className="inline-block px-2 xs:px-3 py-1 bg-yellow-500 text-gray-800 rounded-full text-[10px] xs:text-xs font-medium"
                  >
                    {sport.icon} {sport.name}
                  </span>
                ))}
              </div>
              <div className="text-[9px] xs:text-[10px] font-semibold text-gray-600 mb-1">○ 適性あり</div>
              <div className="flex flex-wrap gap-1.5 xs:gap-2">
                {result.sportsAptitude.slice(3, 6).map(sport => (
                  <span
                    key={sport.name}
                    className="inline-block px-2 xs:px-3 py-1 bg-blue-900 text-white rounded-full text-[10px] xs:text-xs font-medium"
                  >
                    {sport.icon} {sport.name}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[8px] xs:text-[9px] text-gray-600">※興味・関心も重要です。本人の意志を尊重してください。</p>
            </div>
          </div>

          {/* 右列 */}
          <div>
            {/* 重点トレーニング */}
            <div className="text-xs xs:text-sm font-bold text-white bg-blue-900 px-3 xs:px-4 py-2 rounded mb-3">
              重点トレーニング
            </div>
            <div className="bg-yellow-50 border border-yellow-500 px-2 xs:px-3 py-2 mb-3 rounded text-[10px] xs:text-xs text-orange-700 font-bold text-center">
              ※お子さんと一緒にやってあげてください
            </div>
            <div className="border border-gray-200 p-3 xs:p-4 rounded-lg mb-4">
              <ul className="space-y-2 xs:space-y-3">
                {trainings.map((t, i) => (
                  <li key={i} className="flex gap-2 xs:gap-3 pb-2 xs:pb-3 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <span className="w-5 h-5 xs:w-6 xs:h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-[10px] xs:text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 text-[9px] xs:text-[10px]">
                      <strong className="text-xs xs:text-sm block mb-1">{t.name}</strong>
                      <span className={`inline-block px-1.5 xs:px-2 py-0.5 rounded text-[8px] xs:text-[9px] font-bold ${
                        t.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.category}
                      </span>
                      <div className="mt-1">{t.description}</div>
                      <div className="text-blue-900 font-bold">{t.reps}</div>
                      <div className="text-gray-600">効果：{t.effect}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 保護者の方へ */}
            <div className="text-xs xs:text-sm font-bold text-white bg-blue-900 px-3 xs:px-4 py-2 rounded mb-3">
              保護者の方へ
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 xs:p-4 rounded-lg text-[9px] xs:text-[10px] leading-relaxed">
              <h4 className="text-[10px] xs:text-xs font-bold text-gray-800 mb-2">【発達段階】{devAdv.golden}</h4>
              <p className="mb-2 xs:mb-3">{devAdv.focus}</p>
              <h4 className="text-[10px] xs:text-xs font-bold text-gray-800 mb-2">【この時期のポイント】</h4>
              <p className="mb-2 xs:mb-3">{devAdv.key}</p>
              <h4 className="text-[10px] xs:text-xs font-bold text-red-600 mb-2">【注意点】</h4>
              <p className="text-red-600">{devAdv.avoid}</p>
            </div>
          </div>
        </div>

        {/* 1ヶ月目標 */}
        <div className="mx-4 xs:mx-6 mb-4 xs:mb-6 bg-blue-900 text-white p-3 xs:p-4 rounded-lg">
          <h4 className="text-xs xs:text-sm font-bold text-center mb-3 xs:mb-4">1ヶ月後の目標（毎日10分のトレーニングで達成可能）</h4>
          <div className="grid grid-cols-3 gap-2 xs:gap-3">
            <div className="bg-white/10 p-2 xs:p-3 rounded text-center">
              <div className="text-[8px] xs:text-[9px] opacity-90">握力</div>
              <div className="text-[9px] xs:text-[10px] opacity-70">現在 {measurements.gripAvg.toFixed(1)}kg</div>
              <div className="text-lg xs:text-xl font-extrabold">{result.goals.grip}kg</div>
            </div>
            <div className="bg-white/10 p-2 xs:p-3 rounded text-center">
              <div className="text-[8px] xs:text-[9px] opacity-90">立ち幅跳び</div>
              <div className="text-[9px] xs:text-[10px] opacity-70">現在 {measurements.jump}cm</div>
              <div className="text-lg xs:text-xl font-extrabold">{result.goals.jump}cm</div>
            </div>
            <div className="bg-white/10 p-2 xs:p-3 rounded text-center">
              <div className="text-[8px] xs:text-[9px] opacity-90">15mダッシュ</div>
              <div className="text-[9px] xs:text-[10px] opacity-70">現在 {measurements.dash}秒</div>
              <div className="text-lg xs:text-xl font-extrabold">{result.goals.dash}秒</div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-4 xs:px-6 py-3 xs:py-4 border-t-2 border-blue-900 flex justify-between text-[8px] xs:text-[9px] text-gray-600">
          <div className="font-bold text-blue-900">{store.name}</div>
          <div>2/2</div>
        </div>
      </div>
    </div>
  )
}
