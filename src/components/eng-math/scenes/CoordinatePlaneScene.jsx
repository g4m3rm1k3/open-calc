import { useEffect, useRef } from 'react'

const POINTS = [
  { x: 1, y: 2, label: '(1, 2)', color: '#6366f1' },
  { x: -2, y: 1, label: '(-2, 1)', color: '#10b981' },
  { x: 3, y: -1, label: '(3, -1)', color: '#f59e0b' },
  { x: -1, y: -3, label: '(-1, -3)', color: '#ec4899' },
]

export default function CoordinatePlaneScene() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let rafId, w, h

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function easeOut(t) { return 1 - Math.pow(1 - Math.min(t, 1), 3) }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h * 0.50
      const scale = Math.min(w, h) * 0.09
      const RANGE = 4

      // Grid lines
      ctx.lineWidth = 0.5
      ctx.strokeStyle = dark ? '#1e293b' : '#e2e8f0'
      for (let i = -RANGE; i <= RANGE; i++) {
        ctx.beginPath()
        ctx.moveTo(cx + i * scale, cy - RANGE * scale)
        ctx.lineTo(cx + i * scale, cy + RANGE * scale)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cx - RANGE * scale, cy + i * scale)
        ctx.lineTo(cx + RANGE * scale, cy + i * scale)
        ctx.stroke()
      }

      // Axes
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx - RANGE * scale - 12, cy)
      ctx.lineTo(cx + RANGE * scale + 12, cy)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cy - RANGE * scale - 12)
      ctx.lineTo(cx, cy + RANGE * scale + 12)
      ctx.stroke()

      // Arrowheads
      const aw = 6
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.beginPath()
      ctx.moveTo(cx + RANGE * scale + 12, cy)
      ctx.lineTo(cx + RANGE * scale + 4, cy - aw / 2)
      ctx.lineTo(cx + RANGE * scale + 4, cy + aw / 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx, cy - RANGE * scale - 12)
      ctx.lineTo(cx - aw / 2, cy - RANGE * scale - 4)
      ctx.lineTo(cx + aw / 2, cy - RANGE * scale - 4)
      ctx.fill()

      // Axis labels
      ctx.font = 'bold 12px system-ui'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('x', cx + RANGE * scale + 18, cy + 1)
      ctx.fillText('y', cx + 1, cy - RANGE * scale - 18)

      // Tick marks & numbers
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 0.5
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      for (let i = -RANGE; i <= RANGE; i++) {
        if (i === 0) continue
        ctx.beginPath()
        ctx.moveTo(cx + i * scale, cy - 3); ctx.lineTo(cx + i * scale, cy + 3); ctx.stroke()
        ctx.fillText(String(i), cx + i * scale, cy + 12)
        ctx.beginPath()
        ctx.moveTo(cx - 3, cy - i * scale); ctx.lineTo(cx + 3, cy - i * scale); ctx.stroke()
        ctx.fillText(String(i), cx - 14, cy - i * scale)
      }

      // Origin
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.fillText('O', cx - 12, cy + 12)

      // Points (appear one by one)
      const CYCLE = 10000
      const progress = (t % CYCLE) / CYCLE
      const visibleCount = Math.min(POINTS.length, Math.ceil(progress * (POINTS.length + 0.3)))

      for (let i = 0; i < visibleCount; i++) {
        const pt = POINTS[i]
        const px = cx + pt.x * scale
        const py = cy - pt.y * scale
        const isNewest = i === visibleCount - 1
        const appear = Math.min(1, (progress * (POINTS.length + 0.3) - i) * 3)

        ctx.save()
        ctx.globalAlpha = appear

        // Dashed crosshairs for newest point
        if (isNewest) {
          ctx.strokeStyle = pt.color + '44'
          ctx.lineWidth = 0.8
          ctx.setLineDash([3, 3])
          ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke()
          ctx.setLineDash([])
        }

        // Point dot
        ctx.beginPath()
        ctx.arc(px, py, isNewest ? 6 : 5, 0, Math.PI * 2)
        ctx.fillStyle = pt.color
        ctx.fill()
        ctx.strokeStyle = dark ? '#0f172a' : '#f8fafc'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Label
        ctx.font = `${isNewest ? 'bold ' : ''}12px "JetBrains Mono", monospace`
        ctx.fillStyle = pt.color
        ctx.textAlign = 'left'
        ctx.fillText(pt.label, px + 8, py - 8)

        ctx.restore()
      }

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.textAlign = 'center'
      ctx.fillText('THE CARTESIAN PLANE  ℝ²', w / 2, 20)
      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
