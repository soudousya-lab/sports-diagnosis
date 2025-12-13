'use client'

import { useEffect, useRef } from 'react'

type Props = {
  scores: Record<string, number>
  keys: string[]
  labels: string[]
  size?: number
}

export default function RadarChart({ scores, keys, labels, size = 220 }: Props) {
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
    const maxRadius = size / 2 - 30
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

    // Draw data polygon
    ctx.fillStyle = 'rgba(0, 51, 102, 0.25)'
    ctx.strokeStyle = '#003366'
    ctx.lineWidth = 2.5
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
  }, [scores, keys, labels, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="mx-auto"
    />
  )
}
