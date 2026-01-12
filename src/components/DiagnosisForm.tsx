'use client'

import { useState } from 'react'
import { Store } from '@/lib/supabase'

type Props = {
  store: Store
  onSubmit: (data: FormData) => void
  isLoading: boolean
}

type FormData = {
  name: string
  furigana: string
  grade: string
  gender: 'male' | 'female'
  height: number
  weight: number
  gripRight: number
  gripLeft: number
  jump: number
  dash: number
  dashInputType: '15m' | '50m'
  doublejump?: number
  squat?: number
  sidestep?: number
  throw?: number
  mode: 'simple' | 'detail'
}

export default function DiagnosisForm({ store, onSubmit, isLoading }: Props) {
  const [mode, setMode] = useState<'simple' | 'detail'>('simple')
  const [dashInputType, setDashInputType] = useState<'15m' | '50m'>('15m')
  const [formData, setFormData] = useState<Partial<FormData>>({
    mode: 'simple',
    dashInputType: '15m'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    const required = ['name', 'furigana', 'grade', 'gender', 'height', 'weight', 'gripRight', 'gripLeft', 'jump', 'dash']
    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        alert('基本情報と簡易版の測定項目をすべて入力してください')
        return
      }
    }

    if (mode === 'detail') {
      const detailRequired = ['doublejump', 'squat', 'sidestep', 'throw']
      for (const field of detailRequired) {
        if (!formData[field as keyof FormData]) {
          alert('詳細版の測定項目をすべて入力してください')
          return
        }
      }
    }

    onSubmit({ ...formData, mode } as FormData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleModeChange = (newMode: 'simple' | 'detail') => {
    setMode(newMode)
    setFormData(prev => ({ ...prev, mode: newMode }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden">
      {/* ヘッダー */}
      <div
        className="text-white p-4 xs:p-6"
        style={{ background: `linear-gradient(135deg, ${store.theme_color} 0%, ${store.theme_color}dd 100%)` }}
      >
        <div className="flex justify-between items-center mb-4 xs:mb-5">
          <h1 className="text-lg xs:text-xl font-bold tracking-wider">運動能力診断システム</h1>
          <div className="text-[10px] xs:text-xs opacity-85">{store.name}</div>
        </div>

        {/* モード選択 */}
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
          <button
            type="button"
            onClick={() => handleModeChange('simple')}
            className={`flex-1 p-3 xs:p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
              mode === 'simple'
                ? 'bg-white text-gray-800 border-white'
                : 'bg-white/10 border-white/30 hover:bg-white/20'
            }`}
          >
            <div className="font-bold mb-1 text-sm xs:text-base">簡易版（イベント用）</div>
            <div className={`text-[10px] xs:text-xs ${mode === 'simple' ? 'text-gray-600' : 'opacity-80'}`}>
              かけっこ教室・測定会向け<br />3項目測定 → 来店誘導
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('detail')}
            className={`flex-1 p-3 xs:p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
              mode === 'detail'
                ? 'bg-white text-gray-800 border-white'
                : 'bg-white/10 border-white/30 hover:bg-white/20'
            }`}
          >
            <div className="font-bold mb-1 text-sm xs:text-base">詳細版（店舗用）</div>
            <div className={`text-[10px] xs:text-xs ${mode === 'detail' ? 'text-gray-600' : 'opacity-80'}`}>
              店舗来店・完全診断<br />7項目測定 → フルレポート
            </div>
          </button>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="p-4 xs:p-7 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-bold text-blue-900 mb-4 pl-3 border-l-4 border-blue-600">基本情報</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 xs:gap-4">
          <div>
            <label className="block mb-1 text-gray-600 text-xs font-semibold">氏名</label>
            <input
              type="text"
              placeholder="山田 太郎"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600 text-xs font-semibold">フリガナ</label>
            <input
              type="text"
              placeholder="ヤマダ タロウ"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleChange('furigana', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600 text-xs font-semibold">学年</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleChange('grade', e.target.value)}
            >
              <option value="">選択</option>
              <option value="k5">年長</option>
              <option value="1">小学1年生</option>
              <option value="2">小学2年生</option>
              <option value="3">小学3年生</option>
              <option value="4">小学4年生</option>
              <option value="5">小学5年生</option>
              <option value="6">小学6年生</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-gray-600 text-xs font-semibold">性別</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female')}
            >
              <option value="">選択</option>
              <option value="male">男子</option>
              <option value="female">女子</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-gray-600 text-xs font-semibold">身長 (cm)</label>
            <input
              type="number"
              step="0.1"
              placeholder="135.5"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleChange('height', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600 text-xs font-semibold">体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="32.5"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 測定データ */}
      <div className="p-4 xs:p-7">
        <h2 className="text-sm font-bold text-blue-900 mb-4 pl-3 border-l-4 border-blue-600">測定データ（7項目）</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4">
          {/* 握力 */}
          <MeasurementCard
            icon="筋"
            title="握力"
            category="筋力"
          >
            <div className="flex gap-2 items-center mb-2">
              <span className="text-xs min-w-[18px]">右</span>
              <input
                type="number"
                step="0.1"
                placeholder="18.5"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                onChange={(e) => handleChange('gripRight', parseFloat(e.target.value))}
              />
              <span className="text-xs text-gray-600">kg</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs min-w-[18px]">左</span>
              <input
                type="number"
                step="0.1"
                placeholder="17.0"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                onChange={(e) => handleChange('gripLeft', parseFloat(e.target.value))}
              />
              <span className="text-xs text-gray-600">kg</span>
            </div>
          </MeasurementCard>

          {/* 立ち幅跳び */}
          <MeasurementCard icon="瞬" title="立ち幅跳び" category="瞬発力">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="1"
                placeholder="145"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                onChange={(e) => handleChange('jump', parseInt(e.target.value))}
              />
              <span className="text-xs text-gray-600">cm</span>
            </div>
          </MeasurementCard>

          {/* ダッシュ（15m/50m切り替え） */}
          <MeasurementCard icon="速" title={dashInputType === '15m' ? '15mダッシュ' : '50m走'} category="移動能力">
            <div className="space-y-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setDashInputType('15m')
                    handleChange('dashInputType', '15m')
                  }}
                  className={`flex-1 py-1 px-2 text-xs font-bold rounded transition-all ${
                    dashInputType === '15m'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  15m走
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDashInputType('50m')
                    handleChange('dashInputType', '50m')
                  }}
                  className={`flex-1 py-1 px-2 text-xs font-bold rounded transition-all ${
                    dashInputType === '50m'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  50m走
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  step="0.01"
                  placeholder={dashInputType === '15m' ? '3.65' : '9.50'}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  onChange={(e) => handleChange('dash', parseFloat(e.target.value))}
                />
                <span className="text-xs text-gray-600">秒</span>
              </div>
              {dashInputType === '50m' && (
                <p className="text-[10px] text-gray-500">※ 50m走タイムは15m走に換算されます</p>
              )}
            </div>
          </MeasurementCard>

          {/* 詳細版のみの項目 */}
          <MeasurementCard
            icon="連"
            title="連続立ち幅跳び（3回）"
            category="バランス"
            detailOnly
            disabled={mode === 'simple'}
          >
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="1"
                placeholder="420"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                disabled={mode === 'simple'}
                onChange={(e) => handleChange('doublejump', parseInt(e.target.value))}
              />
              <span className="text-xs text-gray-600">cm</span>
            </div>
          </MeasurementCard>

          <MeasurementCard
            icon="持"
            title="30秒スクワット"
            category="筋持久力"
            detailOnly
            disabled={mode === 'simple'}
          >
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="1"
                placeholder="25"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                disabled={mode === 'simple'}
                onChange={(e) => handleChange('squat', parseInt(e.target.value))}
              />
              <span className="text-xs text-gray-600">回</span>
            </div>
          </MeasurementCard>

          <MeasurementCard
            icon="敏"
            title="反復横跳び"
            category="敏捷性"
            detailOnly
            disabled={mode === 'simple'}
          >
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="1"
                placeholder="35"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                disabled={mode === 'simple'}
                onChange={(e) => handleChange('sidestep', parseInt(e.target.value))}
              />
              <span className="text-xs text-gray-600">回</span>
            </div>
          </MeasurementCard>

          <MeasurementCard
            icon="投"
            title="ボール投げ"
            category="投力"
            detailOnly
            disabled={mode === 'simple'}
          >
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="0.1"
                placeholder="18.5"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                disabled={mode === 'simple'}
                onChange={(e) => handleChange('throw', parseFloat(e.target.value))}
              />
              <span className="text-xs text-gray-600">m</span>
            </div>
          </MeasurementCard>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="p-4 xs:p-7 text-center bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full xs:w-auto px-8 xs:px-12 py-3 xs:py-4 text-sm xs:text-base font-bold bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg shadow-lg hover:transform hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {isLoading ? '診断中...' : '診断を実行'}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full xs:w-auto px-8 xs:px-12 py-3 xs:py-4 text-sm xs:text-base font-bold bg-white text-blue-900 border-2 border-blue-900 rounded-lg"
          >
            クリア
          </button>
        </div>
      </div>
    </form>
  )
}

// 測定カードコンポーネント
function MeasurementCard({
  icon,
  title,
  category,
  children,
  detailOnly = false,
  disabled = false
}: {
  icon: string
  title: string
  category: string
  children: React.ReactNode
  detailOnly?: boolean
  disabled?: boolean
}) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all relative ${
      disabled ? 'opacity-35 pointer-events-none' : 'hover:border-blue-500'
    }`}>
      {detailOnly && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-semibold rounded">
          詳細版
        </span>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
