'use client'

import RadarChart from './RadarChart'
import { Store } from '@/lib/supabase'
import { getGrade, getGradeDisplay, categories } from '@/lib/diagnosis'

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
    jump: number
    dash: number
  }
  result: {
    scores: Record<string, number>
    motorAge: number
    motorAgeDiff: number
    type: { name: string; desc: string }
    classLevel: 'beginner' | 'standard' | 'expert'
  }
  averageData: Record<string, number>
}

export default function SimpleResult({ store, child, measurements, result, averageData }: Props) {
  const actualAge = child.grade === 'k5' ? 6 : parseInt(child.grade) + 6
  const today = new Date().toLocaleDateString('ja-JP')

  const measurementItems = [
    { key: 'grip', name: '握力', cat: '筋力', val: `${measurements.gripAvg.toFixed(1)}kg`, avg: `${averageData.grip}kg` },
    { key: 'jump', name: '立ち幅跳び', cat: '瞬発力', val: `${measurements.jump}cm`, avg: `${averageData.jump}cm` },
    { key: 'dash', name: '15mダッシュ', cat: '移動能力', val: `${measurements.dash}秒`, avg: `${averageData.dash}秒` }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex justify-between items-start p-6 border-b-4 border-blue-900">
        <div>
          <h1 className="text-xl text-blue-900 font-bold tracking-wider mb-1">運動能力診断レポート</h1>
          <div className="text-xs text-gray-600">Athletic Performance Assessment Report</div>
        </div>
        <div className="text-right text-xs text-gray-600">
          <div className="inline-block px-3 py-1 bg-blue-600 text-white font-bold rounded mb-1">SIMPLE</div>
          <div>測定日: {today}</div>
        </div>
      </div>

      {/* 被験者情報 */}
      <div className="bg-blue-50 border border-blue-200 p-4 m-6 rounded-lg flex justify-between items-center">
        <div className="text-xl font-bold text-blue-900">
          <span className="text-xs font-normal text-gray-600 block mb-1">{child.furigana}</span>
          {child.name} 様
        </div>
        <div className="text-xs text-gray-600 text-right leading-relaxed">
          {getGradeDisplay(child.grade)}（{actualAge}歳）・{child.gender === 'male' ? '男子' : '女子'}<br />
          身長 {child.height}cm ／ 体重 {child.weight}kg
        </div>
      </div>

      {/* 運動器年齢 */}
      <div className="flex gap-6 items-center p-5 bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-500 rounded-lg mx-6 mb-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0">
          <span className="text-[9px] opacity-90">運動器年齢</span>
          <span className="text-4xl font-extrabold">{Math.round(result.motorAge)}</span>
          <span className="text-sm">歳</span>
        </div>
        <div className="text-sm leading-relaxed">
          実年齢 <span className="text-lg font-extrabold text-blue-900">{actualAge}歳</span> に対して、運動器年齢は
          <span className={`text-lg font-extrabold ${result.motorAgeDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {result.motorAgeDiff >= 0 ? '+' : ''}{result.motorAgeDiff.toFixed(1)}歳
          </span> です。<br /><br />
          {result.motorAgeDiff >= 1
            ? '運動能力が同年代より発達しています。'
            : result.motorAgeDiff >= -1
              ? '年齢相応の運動能力です。'
              : '運動能力向上の余地があります。'
          }<br /><br />
          <strong>※本診断は簡易版（3項目）です。詳細診断は店舗にて実施可能です。</strong>
        </div>
      </div>

      {/* 測定結果 */}
      <div className="mx-6 mb-6">
        <div className="text-sm font-bold text-white bg-blue-900 px-4 py-2 rounded mb-3">
          測定結果（3項目）
        </div>
        <div className="flex gap-5">
          <div className="w-56 flex-shrink-0">
            <RadarChart
              scores={result.scores}
              keys={['grip', 'jump', 'dash']}
              labels={['筋力', '瞬発力', '移動能力']}
            />
          </div>
          <table className="flex-1 border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-blue-900 text-white p-2">測定項目</th>
                <th className="border border-gray-200 bg-blue-900 text-white p-2">カテゴリ</th>
                <th className="border border-gray-200 bg-blue-900 text-white p-2">測定値</th>
                <th className="border border-gray-200 bg-blue-900 text-white p-2">同年代平均</th>
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
      <div className="mx-6 mb-6 border-4 border-blue-900 p-5 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
        <div className="text-xs text-gray-600 mb-2">運動タイプ診断結果</div>
        <div className="text-2xl font-extrabold text-blue-900 mb-3 tracking-wider">{result.type.name}</div>
        <div className="text-sm leading-relaxed">{result.type.desc}</div>
      </div>

      {/* クラス推薦 */}
      <div className="mx-6 mb-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-600 rounded-lg p-5">
        <h3 className="text-base font-bold text-green-600 mb-4 text-center">📋 おすすめクラス</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['beginner', 'standard', 'expert'] as const).map(level => (
            <div
              key={level}
              className={`bg-white rounded-lg p-4 text-center border-2 ${
                result.classLevel === level
                  ? 'border-green-600 shadow-lg'
                  : 'border-transparent'
              }`}
            >
              <div className="text-sm font-bold text-blue-900 mb-2">
                {level === 'beginner' ? 'ビギナー' : level === 'standard' ? 'スタンダード' : 'エキスパート'}
              </div>
              <div className="text-[10px] text-gray-600 leading-relaxed">
                {level === 'beginner' && '動物マネっこ体操など\n楽しく体を動かす'}
                {level === 'standard' && '正しい走り方+\n各種目の基礎練習'}
                {level === 'expert' && '長所伸展 or 弱点克服\n専門的トレーニング'}
              </div>
              {result.classLevel === level && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-[9px] font-semibold rounded-full">
                  おすすめ
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 詳細診断CTA */}
      <div className="mx-6 mb-6 bg-gradient-to-r from-yellow-50 to-amber-100 border-4 border-yellow-500 p-6 text-center rounded-lg">
        <h3 className="text-xl font-bold text-blue-900 mb-3">🏃 詳細診断を受けてみませんか？</h3>
        <p className="text-sm leading-relaxed mb-5">
          本レポートは<strong>簡易版（3項目測定）</strong>です。<br />
          店舗では<strong>7項目のフル測定</strong>による詳細診断が可能です。
        </p>

        <div className="flex justify-center gap-6 mb-5">
          {[
            { icon: '連', text: '連続立ち幅跳び\n（バランス）' },
            { icon: '持', text: '30秒スクワット\n（筋持久力）' },
            { icon: '敏', text: '反復横跳び\n（敏捷性）' },
            { icon: '投', text: 'ボール投げ\n（投力）' }
          ].map(item => (
            <div key={item.icon} className="text-center">
              <div className="w-14 h-14 bg-blue-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-2 mx-auto">
                {item.icon}
              </div>
              <div className="text-xs font-semibold whitespace-pre-line">{item.text}</div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg text-sm">
          <strong>詳細診断のご予約</strong><br />
          {store.name}<br />
          {store.address && <span>{store.address}<br /></span>}
          {store.phone && <span>TEL: {store.phone}<br /></span>}
          {store.hours && <span>営業時間: {store.hours}</span>}
        </div>
      </div>

      {/* フッター */}
      <div className="px-6 py-4 border-t-2 border-blue-900 flex justify-between text-[9px] text-gray-600">
        <div className="font-bold text-blue-900">{store.name}</div>
        <div>本診断は統計データに基づく参考値です</div>
      </div>
    </div>
  )
}
