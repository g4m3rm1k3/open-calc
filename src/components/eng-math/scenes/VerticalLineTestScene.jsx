import { useEffect, useRef } from 'react'

export default function VerticalLineTestScene() {
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

    const EXAMPLES = [
      {
        name: 'f(x) = x²  (function)',
        valid: true,
        curve: (x) => x * x,
        xRange: [-2.5, 2.5],
        yRange: [-0.5, 6],
      },
      {
        name: 'x² + y² = 4  (circle, not a function)',
        valid: false,
        circle: true,
        radius: 2,
      },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const exIdx = Math.floor(t / 4000) % EXAMPLES.length
      const ex = EXAMPLES[exIdx]
      const sweepX = ((t % 4000) / 4000) * w

      // Grid
      const margin = 26
      const gridSz = Math.min(w - margin * 2, h * 0.62)
      const ox = margin + gridSz / 2, oy = margin + gridSz / 2 + 18
      const scale = gridSz / (ex.circle ? 5 : 6)

      ctx.strokeStyle = dark ? '#1e293b' : '#e2e8f0'; ctx.lineWidth = 1
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo(ox + i * scale, oy - gridSz / 2); ctx.lineTo(ox + i * scale, oy + gridSz / 2); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(ox - gridSz / 2, oy + i * scale); ctx.lineTo(ox + gridSz / 2, oy + i * scale); ctx.stroke()
      }
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(ox - gridSz / 2, oy); ctx.lineTo(ox + gridSz / 2, oy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ox, oy - gridSz / 2); ctx.lineTo(ox, oy + gridSz / 2); ctx.stroke()

      if (ex.circle) {
        ctx.beginPath()
        ctx.arc(ox, oy, ex.radius * scale, 0, Math.PI * 2)
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2.5; ctx.stroke()
      } else {
        // Draw parabola
        ctx.beginPath()
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2.5
        for (let px = ox - gridSz / 2; px <= ox + gridSz / 2; px++) {
          const xVal = (px - ox) / scale
          const yVal = ex.curve(xVal)
          const py = oy - yVal * scale
          if (px === ox - gridSz / 2) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }

      // Sweep vertical line
      const lineX = ox - gridSz / 2 + (sweepX / w) * gridSz
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4])
      ctx.beginPath(); ctx.moveTo(lineX, oy - gridSz / 2); ctx.lineTo(lineX, oy + gridSz / 2); ctx.stroke()
      ctx.setLineDash([])

      // Find intersections at sweepX
      const xVal = (lineX - ox) / scale
      let intersections = []
      if (ex.circle) {
        const rSq = ex.radius * ex.radius
        const disc = rSq - xVal * xVal
        if (disc > 0) {
          intersections = [Math.sqrt(disc), -Math.sqrt(disc)]
        }
      } else {
        const inRange = xVal >= ex.xRange[0] && xVal <= ex.xRange[1]
        if (inRange) intersections = [ex.curve(xVal)]
      }

      const twoHits = intersections.length >= 2
      const hitColor = twoHits ? '#ef4444' : '#22c55e'
      intersections.forEach(yV => {
        const iy = oy - yV * scale
        ctx.beginPath(); ctx.arc(lineX, iy, 6, 0, Math.PI * 2)
        ctx.fillStyle = hitColor
        ctx.shadowColor = hitColor; ctx.shadowBlur = 12
        ctx.fill(); ctx.shadowBlur = 0
      })

      // Result
      const cx = w / 2
      const resultY = margin + gridSz + 30
      ctx.font = `bold ${Math.round(h * 0.055)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      if (twoHits) {
        ctx.fillStyle = dark ? '#ef4444' : '#dc2626'
        ctx.fillText('Two intersections → NOT a function', cx, resultY)
      } else {
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText(ex.valid ? 'At most one → IS a function ✓' : 'Test in progress...', cx, resultY)
      }

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = ex.valid ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      ctx.fillText(ex.name, cx, resultY + Math.round(h * 0.065))

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('The Vertical Line Test', cx, 20)

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
