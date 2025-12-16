'use client'

import { useEffect, useRef } from 'react'

type HistoryData = {
  scores: Record<string, number>
  date: string
  label?: string
}

type Props = {
  scores: Record<string, number>
  keys: string[]
  labels: string[]
  size?: number
  averageScores?: Record<string, number>
  historyData?: HistoryData[]  // 過去の測定データ（最大4件）
}

// 前回データの色定義（1回前のみ強調、それ以外は薄く）
const historyColors = [
  { fill: 'rgba(34, 197, 94, 0.20)', stroke: '#16a34a', lineWidth: 2.5 },   // 1回前: 緑（強調）
  { fill: 'rgba(156, 163, 175, 0.08)', stroke: '#9ca3af', lineWidth: 1 },   // 2回前: グレー（薄い）
  { fill: 'rgba(156, 163, 175, 0.05)', stroke: '#d1d5db', lineWidth: 1 },   // 3回前: グレー（より薄い）
  { fill: 'rgba(156, 163, 175, 0.03)', stroke: '#e5e7eb', lineWidth: 1 },   // 4回前: グレー（最も薄い）
]

export default function RadarChart({ scores, keys, labels, size = 220, averageScores, historyData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 高DPIディスプレイ対応
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2 + 5
    const maxRadius = size / 2 - 45
    const n = keys.length

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw grid
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    for (let r = 2; r <= 10; r += 2) {
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2
        const x = cx + Math.cos(angle) * (maxRadius * r / 10)
        const y = cy + Math.sin(angle) * (maxRadius * r / 10)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.stroke()
    }

    // Draw axes
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius)
      ctx.stroke()
    }

    // Draw history polygons (from oldest to newest, so newest is on top)
    // 1回前のデータは最後に描画（今回のデータの直前）して重なりを見やすく
    if (historyData && historyData.length > 0) {
      // 2回前以降を先に描画（薄いグレー）
      if (historyData.length > 1) {
        const olderHistory = historyData.slice(1).reverse()
        olderHistory.forEach((history, idx) => {
          const colorIdx = Math.min(idx + 1, historyColors.length - 1)
          const color = historyColors[colorIdx]

          ctx.fillStyle = color.fill
          ctx.strokeStyle = color.stroke
          ctx.lineWidth = color.lineWidth
          ctx.setLineDash([3, 3])
          ctx.beginPath()

          for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2
            const value = history.scores[keys[i]] || 5
            const r = maxRadius * value / 10
            const x = cx + Math.cos(angle) * r
            const y = cy + Math.sin(angle) * r
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }

          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.setLineDash([])
        })
      }

      // 1回前（前回）のデータを描画（緑で強調）
      const prevHistory = historyData[0]
      const prevColor = historyColors[0]

      ctx.fillStyle = prevColor.fill
      ctx.strokeStyle = prevColor.stroke
      ctx.lineWidth = prevColor.lineWidth
      ctx.setLineDash([])  // 実線で描画
      ctx.beginPath()

      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2
        const value = prevHistory.scores[keys[i]] || 5
        const r = maxRadius * value / 10
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    // Draw average polygon (if provided)
    if (averageScores) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.15)'
      ctx.strokeStyle = '#FF8C00'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.beginPath()

      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2
        const value = averageScores[keys[i]] || 5
        const r = maxRadius * value / 10
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw data polygon (今回のデータ - 青で強調)
    ctx.fillStyle = 'rgba(37, 99, 235, 0.25)'
    ctx.strokeStyle = '#1d4ed8'
    ctx.lineWidth = 3
    ctx.beginPath()

    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2
      const value = scores[keys[i]] || 5
      const r = maxRadius * value / 10
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw labels
    ctx.fillStyle = '#333'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'

    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2
      const x = cx + Math.cos(angle) * (maxRadius + 20)
      const y = cy + Math.sin(angle) * (maxRadius + 20)
      ctx.fillText(labels[i], x, y + 4)
    }
  }, [scores, keys, labels, size, averageScores, historyData])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="mx-auto"
    />
  )
}
