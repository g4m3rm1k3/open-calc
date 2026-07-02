import { useEffect, useRef } from 'react'

// Relation R: 1→a, 2→a, 3→c, 4→d (not a function — 2 inputs map to same output)
const SET_A = ['1', '2', '3', '4']
const SET_B = ['a', 'b', 'c', 'd']
const ARROWS = [
  { from: 0, to: 0 }, // 1 → a
  { from: 1, to: 0 }, // 2 → a  (same target as 1 — valid for relation, not function)
  { from: 2, to: 2 }, // 3 → c
  { from: 3, to: 3 }, // 4 → d
]

export default function RelationDiagramScene() {
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

    function drawArrow(x1, y1, x2, y2, color, alpha) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.setLineDash([])

      const dx = x2 - x1, dy = y2 - y1
      const len = Math.sqrt(dx * dx + dy * dy)
      const ux = dx / len, uy = dy / len
      const sx = x1 + ux * 18, ex = x2 - ux * 18, sy = y1 + uy * 18, ey = y2 - uy * 18

      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()

      // Arrowhead
      const aw = 8
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(ex, ey)
      ctx.lineTo(ex - ux * aw - uy * aw * 0.5, ey - uy * aw + ux * aw * 0.5)
      ctx.lineTo(ex - ux * aw + uy * aw * 0.5, ey - uy * aw - ux * aw * 0.5)
      ctx.fill()
      ctx.restore()
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const ovalW = 44, ovalH = 140
      const lx = w * 0.24, rx = w * 0.76
      const cy = h * 0.50

      // Ovals
      ctx.strokeStyle = dark ? '#6366f1' : '#4338ca'
      ctx.lineWidth = 2
      ctx.fillStyle = dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)'
      ctx.beginPath(); ctx.ellipse(lx, cy, ovalW, ovalH, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()

      ctx.strokeStyle = dark ? '#10b981' : '#047857'
      ctx.fillStyle = dark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)'
      ctx.beginPath(); ctx.ellipse(rx, cy, ovalW, ovalH, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()

      // Set labels
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      ctx.fillText('A', lx, cy - ovalH - 14)
      ctx.fillStyle = dark ? '#34d399' : '#047857'
      ctx.fillText('B', rx, cy - ovalH - 14)

      // Element positions
      const aPositions = SET_A.map((_, i) =>
        ({ x: lx, y: cy - ovalH * 0.6 + i * (ovalH * 1.2 / (SET_A.length - 1)) }))
      const bPositions = SET_B.map((_, i) =>
        ({ x: rx, y: cy - ovalH * 0.6 + i * (ovalH * 1.2 / (SET_B.length - 1)) }))

      // Element labels
      ctx.font = 'bold 14px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      SET_A.forEach((el, i) => {
        ctx.textAlign = 'center'
        ctx.fillText(el, aPositions[i].x, aPositions[i].y)
      })
      ctx.fillStyle = dark ? '#34d399' : '#047857'
      SET_B.forEach((el, i) => {
        ctx.textAlign = 'center'
        ctx.fillText(el, bPositions[i].x, bPositions[i].y)
      })

      // Arrows appearing over time
      const CYCLE = 8000
      const progress = (t % CYCLE) / CYCLE
      const visibleArrows = Math.min(ARROWS.length, Math.ceil(progress * (ARROWS.length + 0.4)))
      const arrowColors = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24']

      for (let i = 0; i < visibleArrows; i++) {
        const arr = ARROWS[i]
        const alpha = easeOut(Math.min(1, (progress * (ARROWS.length + 0.4) - i) * 3))
        drawArrow(
          aPositions[arr.from].x, aPositions[arr.from].y,
          bPositions[arr.to].x, bPositions[arr.to].y,
          arrowColors[i % arrowColors.length], alpha
        )
      }

      // Relation label
      const PAIRS = ARROWS.slice(0, visibleArrows).map(a => `(${SET_A[a.from]},${SET_B[a.to]})`)
      ctx.font = '11px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.textAlign = 'center'
      ctx.fillText(`R = {${PAIRS.join(', ')}${visibleArrows < ARROWS.length ? ' ...' : ''}}`, w / 2, h - 18)

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('RELATION DIAGRAM', w / 2, 20)
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
