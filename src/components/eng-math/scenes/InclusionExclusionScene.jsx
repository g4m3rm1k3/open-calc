import { useEffect, useRef } from 'react'

export default function InclusionExclusionScene() {
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

    // Phases (each 1.8s): 0=show A, 1=show B, 2=minus overlap, 3=result
    const PHASE_DUR = 1800
    const TOTAL = PHASE_DUR * 5

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = (ts - start) % TOTAL
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const phase = Math.floor(t / PHASE_DUR)

      const cx = w / 2, cy = h * 0.38
      const rx = Math.min(w * 0.18, 75), ry = Math.min(h * 0.28, 75)
      const offset = rx * 0.7

      // Draw circles
      function drawCircle(x, y, color, fill) {
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = fill
        ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
      }

      const aFill = (phase >= 0) ? (dark ? '#1e3a5f' : '#dbeafe') : (dark ? '#1e293b' : '#f1f5f9')
      const bFill = (phase >= 1) ? (dark ? '#1a3d2e' : '#dcfce7') : (dark ? '#1e293b' : '#f1f5f9')
      drawCircle(cx - offset, cy, '#2980b9', aFill)
      drawCircle(cx + offset, cy, '#27ae60', bFill)

      // Intersection highlight for phase 2+
      if (phase >= 2) {
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.clip()
        ctx.beginPath()
        ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = phase === 2 ? 'rgba(239,68,68,0.45)' : 'rgba(243,156,18,0.5)'
        ctx.fill()
        ctx.restore()
        // Re-stroke
        ctx.beginPath(); ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2; ctx.stroke()
        ctx.beginPath(); ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.strokeStyle = '#27ae60'; ctx.lineWidth = 2; ctx.stroke()
      }

      // Labels
      ctx.font = `bold ${Math.round(h * 0.065)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#93c5fd' : '#2980b9'
      ctx.fillText('A', cx - offset * 1.55, cy)
      ctx.fillStyle = dark ? '#86efac' : '#27ae60'
      ctx.fillText('B', cx + offset * 1.55, cy)

      // Counting display
      const countY = cy + ry + 32
      ctx.font = `bold ${Math.round(h * 0.062)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'

      const lines = [
        { text: '|A| = 5', color: dark ? '#93c5fd' : '#2980b9', show: phase >= 0 },
        { text: '+ |B| = 5', color: dark ? '#86efac' : '#27ae60', show: phase >= 1 },
        { text: '− |A∩B| = 3', color: '#ef4444', show: phase >= 2 },
        { text: '─────────', color: dark ? '#475569' : '#94a3b8', show: phase >= 3 },
        { text: '= |A∪B| = 7', color: '#f39c12', show: phase >= 3 },
      ]

      lines.forEach((line, i) => {
        if (!line.show) return
        ctx.fillStyle = line.color
        ctx.fillText(line.text, cx, countY + i * (Math.round(h * 0.07)))
      })

      // Title
      ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Inclusion-Exclusion Principle', cx, 20)

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
