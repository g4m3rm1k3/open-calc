import { useEffect, useRef } from 'react'

export default function FunctionPlotScene() {
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

    // f(x) = x^2 − 2
    const XMIN = -3, XMAX = 3
    function f(x) { return x * x - 2 }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h * 0.55
      const scale = Math.min(w, h) * 0.1
      const YMIN = -2.5, YMAX = 8

      function toScreen(x, y) {
        return {
          sx: cx + x * scale,
          sy: cy - y * scale,
        }
      }

      // Grid
      ctx.lineWidth = 0.5
      ctx.strokeStyle = dark ? '#1e293b' : '#e2e8f0'
      for (let gx = Math.ceil(XMIN); gx <= Math.floor(XMAX); gx++) {
        const { sx } = toScreen(gx, 0)
        ctx.beginPath(); ctx.moveTo(sx, cy - YMAX * scale); ctx.lineTo(sx, cy - YMIN * scale); ctx.stroke()
      }
      for (let gy = Math.floor(YMIN); gy <= Math.ceil(YMAX); gy++) {
        const { sy } = toScreen(0, gy)
        ctx.beginPath(); ctx.moveTo(cx + XMIN * scale, sy); ctx.lineTo(cx + XMAX * scale, sy); ctx.stroke()
      }

      // Axes
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx + XMIN * scale - 8, cy); ctx.lineTo(cx + XMAX * scale + 8, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - YMAX * scale - 8); ctx.lineTo(cx, cy - YMIN * scale + 8); ctx.stroke()

      // Tick labels
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      for (let gx = Math.ceil(XMIN); gx <= Math.floor(XMAX); gx++) {
        if (gx === 0) continue
        const { sx } = toScreen(gx, 0)
        ctx.fillText(String(gx), sx, cy + 12)
      }
      ctx.textAlign = 'right'
      for (let gy = Math.floor(YMIN); gy <= Math.ceil(YMAX); gy++) {
        if (gy === 0) continue
        const { sy } = toScreen(0, gy)
        ctx.fillText(String(gy), cx - 6, sy)
      }

      // Axis labels
      ctx.font = 'bold 12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('x', cx + XMAX * scale + 16, cy)
      ctx.fillText('y', cx, cy - YMAX * scale - 16)

      // Draw curve (progressive)
      const CYCLE = 6000
      const drawProgress = Math.min(1, ((t % CYCLE) / CYCLE) * 1.6)

      const steps = 200
      const xDraw = XMIN + (XMAX - XMIN) * drawProgress
      ctx.beginPath()
      ctx.strokeStyle = dark ? '#818cf8' : '#4f46e5'
      ctx.lineWidth = 2.5
      let first = true
      for (let i = 0; i <= steps; i++) {
        const x = XMIN + (i / steps) * (xDraw - XMIN)
        if (x > xDraw) break
        const y = f(x)
        const { sx, sy } = toScreen(x, y)
        if (first) { ctx.moveTo(sx, sy); first = false } else { ctx.lineTo(sx, sy) }
      }
      ctx.stroke()

      // Traveling point on curve
      const ptX = XMIN + (XMAX - XMIN) * (drawProgress > 1 ? 1 : drawProgress)
      const ptY = f(ptX)
      const { sx: psx, sy: psy } = toScreen(ptX, ptY)

      if (drawProgress < 1.05) {
        ctx.beginPath()
        ctx.arc(psx, psy, 5, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#c4b5fd' : '#7c3aed'
        ctx.fill()
        ctx.strokeStyle = dark ? '#0f172a' : '#f8fafc'
        ctx.lineWidth = 1.5; ctx.stroke()

        // Coordinate label
        ctx.font = 'bold 11px "JetBrains Mono", monospace'
        ctx.textAlign = 'left'
        ctx.fillStyle = dark ? '#c4b5fd' : '#7c3aed'
        const lx = psx + 8, ly = psy - 12
        ctx.fillText(`(${ptX.toFixed(1)}, ${ptY.toFixed(1)})`, lx, ly)
      }

      // Function label
      ctx.font = 'bold 13px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'
      ctx.textAlign = 'center'
      ctx.fillText('f(x) = x² − 2', w / 2, h - 20)

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('FUNCTION GRAPH', w / 2, 20)
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
