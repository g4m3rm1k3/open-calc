import { useEffect, useRef } from 'react'

// f(x) = 2x + 1,  f⁻¹(x) = (x - 1) / 2
// Both drawn on [-3, 5] range, reflected across y = x

export default function InverseFunctionScene() {
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

    const XMIN = -2.5, XMAX = 2.5
    function f(x) { return 2 * x + 1 }
    function finv(x) { return (x - 1) / 2 }

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
      const RANGE = 2.5

      function toScreen(x, y) {
        return { sx: cx + x * scale, sy: cy - y * scale }
      }

      // Grid
      ctx.lineWidth = 0.5; ctx.strokeStyle = dark ? '#1e293b' : '#e2e8f0'
      for (let i = -Math.ceil(RANGE); i <= Math.ceil(RANGE); i++) {
        const { sx } = toScreen(i, 0)
        ctx.beginPath(); ctx.moveTo(sx, cy - RANGE * scale); ctx.lineTo(sx, cy + RANGE * scale); ctx.stroke()
        const { sy } = toScreen(0, i)
        ctx.beginPath(); ctx.moveTo(cx - RANGE * scale, sy); ctx.lineTo(cx + RANGE * scale, sy); ctx.stroke()
      }

      // y = x dashed line
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1; ctx.setLineDash([5, 4])
      const { sx: dsx, sy: dsy } = toScreen(-RANGE, -RANGE)
      const { sx: dex, sy: dey } = toScreen(RANGE, RANGE)
      ctx.beginPath(); ctx.moveTo(dsx, dsy); ctx.lineTo(dex, dey); ctx.stroke()
      ctx.setLineDash([])

      // y = x label
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.textAlign = 'left'
      ctx.fillText('y = x', dex + 4, dey - 4)

      // Axes
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx - RANGE * scale - 8, cy); ctx.lineTo(cx + RANGE * scale + 8, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - RANGE * scale - 8); ctx.lineTo(cx, cy + RANGE * scale + 8); ctx.stroke()

      // Tick labels
      ctx.font = '9px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue
        const { sx } = toScreen(i, 0); ctx.fillText(String(i), sx, cy + 11)
        const { sy } = toScreen(0, i); ctx.fillText(String(i), cx - 12, sy)
      }

      // Animation progress
      const CYCLE = 7000
      const p = (t % CYCLE) / CYCLE
      const fProgress = Math.min(1, p * 3)
      const fInvProgress = Math.min(1, Math.max(0, p * 3 - 0.8))
      const mirrorAlpha = Math.min(1, Math.max(0, p * 3 - 1.6))

      // f(x) = 2x + 1 (purple)
      if (fProgress > 0) {
        const xEnd = XMIN + (XMAX - XMIN) * fProgress
        ctx.strokeStyle = dark ? '#818cf8' : '#4f46e5'; ctx.lineWidth = 2.5
        ctx.beginPath()
        for (let i = 0; i <= 100; i++) {
          const x = XMIN + (i / 100) * (xEnd - XMIN)
          const { sx, sy } = toScreen(x, f(x))
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
        }
        ctx.stroke()
        // Label
        const { sx: lsx, sy: lsy } = toScreen(XMAX * fProgress, f(XMAX * fProgress))
        ctx.font = 'bold 11px "JetBrains Mono", monospace'
        ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'
        ctx.textAlign = 'left'
        ctx.fillText('f(x)=2x+1', lsx + 4, lsy - 6)
      }

      // f⁻¹(x) = (x-1)/2 (green)
      if (fInvProgress > 0) {
        const xEnd = XMIN + (XMAX - XMIN) * fInvProgress
        ctx.strokeStyle = dark ? '#34d399' : '#059669'; ctx.lineWidth = 2.5
        ctx.beginPath()
        for (let i = 0; i <= 100; i++) {
          const x = XMIN + (i / 100) * (xEnd - XMIN)
          const { sx, sy } = toScreen(x, finv(x))
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
        }
        ctx.stroke()
        const { sx: lsx, sy: lsy } = toScreen(XMAX * fInvProgress, finv(XMAX * fInvProgress))
        ctx.font = 'bold 11px "JetBrains Mono", monospace'
        ctx.fillStyle = dark ? '#34d399' : '#047857'
        ctx.textAlign = 'right'
        ctx.fillText('f⁻¹(x)=(x−1)/2', lsx - 4, lsy + 12)
      }

      // Reflection arrows (symmetric points)
      if (mirrorAlpha > 0) {
        const exPoint = { x: 1, y: f(1) }   // (1, 3) on f
        const invPoint = { x: 3, y: finv(3) } // (3, 1) on f⁻¹ — reflection of (1,3)
        const { sx: px1, sy: py1 } = toScreen(exPoint.x, exPoint.y)
        const { sx: px2, sy: py2 } = toScreen(invPoint.x, invPoint.y)

        ctx.save(); ctx.globalAlpha = mirrorAlpha
        ctx.beginPath(); ctx.arc(px1, py1, 5, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'; ctx.fill()
        ctx.beginPath(); ctx.arc(px2, py2, 5, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#34d399' : '#047857'; ctx.fill()

        ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
        ctx.lineWidth = 1; ctx.setLineDash([3,2])
        ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke()
        ctx.setLineDash([])

        ctx.font = '10px "JetBrains Mono", monospace'; ctx.textAlign = 'left'
        ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'
        ctx.fillText('(1,3)', px1 + 6, py1 - 4)
        ctx.fillStyle = dark ? '#34d399' : '#047857'
        ctx.fillText('(3,1)', px2 + 6, py2 + 12)
        ctx.restore()
      }

      // Legend
      ctx.font = '11px system-ui'; ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText('Graphs are reflections of each other across y = x', w / 2, h - 18)

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('INVERSE FUNCTIONS', w / 2, 20)
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
