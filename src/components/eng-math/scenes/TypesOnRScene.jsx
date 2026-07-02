import { useEffect, useRef } from 'react'

export default function TypesOnRScene() {
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

    const FUNS = [
      {
        name: 'f(x) = 2x',
        fn: x => 2 * x,
        type: 'Bijective',
        color: '#f59e0b',
        note: 'Injective (strict) ∧ Surjective (onto ℝ)',
        xRange: [-2.5, 2.5], yRange: [-5, 5],
      },
      {
        name: 'f(x) = x²',
        fn: x => x * x,
        type: 'Neither (ℝ→ℝ)',
        color: '#ef4444',
        note: 'Not injective (f(-1)=f(1)) ∧ not surjective (-1 not hit)',
        xRange: [-2.5, 2.5], yRange: [-1, 6],
      },
      {
        name: 'f(x) = eˣ',
        fn: x => Math.exp(x),
        type: 'Injective only',
        color: '#6366f1',
        note: 'Injective ∧ Not surjective (range > 0 only)',
        xRange: [-2.5, 2.5], yRange: [-0.5, 8],
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

      const fi = Math.floor(t / 3500) % FUNS.length
      const { name, fn, type, color, note, xRange, yRange } = FUNS[fi]

      const margin = 28
      const gridSz = Math.min(w - margin * 2, h * 0.6)
      const ox = margin + gridSz / 2, oy = margin + gridSz / 2 + 16
      const scaleX = gridSz / (xRange[1] - xRange[0])
      const scaleY = gridSz / (yRange[1] - yRange[0])

      // Grid
      ctx.strokeStyle = dark ? '#1e293b' : '#e2e8f0'; ctx.lineWidth = 1
      for (let i = Math.ceil(xRange[0]); i <= Math.floor(xRange[1]); i++) {
        const sx = ox + (i - (xRange[0] + xRange[1]) / 2) * scaleX
        ctx.beginPath(); ctx.moveTo(sx, oy - gridSz / 2); ctx.lineTo(sx, oy + gridSz / 2); ctx.stroke()
      }
      for (let i = Math.ceil(yRange[0]); i <= Math.floor(yRange[1]); i++) {
        const sy = oy - (i - (yRange[0] + yRange[1]) / 2) * scaleY
        ctx.beginPath(); ctx.moveTo(ox - gridSz / 2, sy); ctx.lineTo(ox + gridSz / 2, sy); ctx.stroke()
      }
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'; ctx.lineWidth = 1.5
      const axY = oy - (0 - (yRange[0] + yRange[1]) / 2) * scaleY
      const axX = ox + (0 - (xRange[0] + xRange[1]) / 2) * scaleX
      ctx.beginPath(); ctx.moveTo(ox - gridSz / 2, axY); ctx.lineTo(ox + gridSz / 2, axY); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(axX, oy - gridSz / 2); ctx.lineTo(axX, oy + gridSz / 2); ctx.stroke()

      // Draw curve
      const midX = (xRange[0] + xRange[1]) / 2
      const midY = (yRange[0] + yRange[1]) / 2
      ctx.strokeStyle = color; ctx.lineWidth = 2.5
      ctx.beginPath()
      let first = true
      for (let px = ox - gridSz / 2; px <= ox + gridSz / 2; px++) {
        const xV = midX + (px - ox) / scaleX
        const yV = fn(xV)
        const pyCanvas = oy - (yV - midY) * scaleY
        if (pyCanvas < oy - gridSz / 2 - 10 || pyCanvas > oy + gridSz / 2 + 10) { first = true; continue }
        if (first) { ctx.moveTo(px, pyCanvas); first = false } else ctx.lineTo(px, pyCanvas)
      }
      ctx.stroke()

      // For x², highlight the symmetric x → -x pair
      if (fi === 1) {
        const xV = 1.5 * Math.sin(t / 800)
        const px1 = ox + (xV - midX) * scaleX
        const px2 = ox + (-xV - midX) * scaleX
        const yV = xV * xV
        const pyC = oy - (yV - midY) * scaleY
        if (Math.abs(xV) > 0.1) {
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4])
          ctx.beginPath(); ctx.moveTo(px1, pyC); ctx.lineTo(px2, pyC); ctx.stroke()
          ctx.setLineDash([])
          ;[px1, px2].forEach(px => {
            ctx.beginPath(); ctx.arc(px, pyC, 5, 0, Math.PI * 2)
            ctx.fillStyle = '#ef4444'; ctx.fill()
          })
        }
      }

      // Type badge
      const panelX = margin + gridSz + 14
      ctx.font = `bold ${Math.round(h * 0.052)}px system-ui`
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillStyle = color
      ctx.fillText(name, panelX, margin + 14)
      ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
      ctx.fillText(type, panelX, margin + 14 + Math.round(h * 0.07))
      ctx.font = `${Math.round(h * 0.036)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      const noteWords = note.split(' ')
      let line = '', lineY = margin + 14 + Math.round(h * 0.14)
      noteWords.forEach(word => {
        const test = line + word + ' '
        if (ctx.measureText(test).width > (w - panelX - margin) && line) {
          ctx.fillText(line, panelX, lineY); lineY += Math.round(h * 0.05); line = word + ' '
        } else line = test
      })
      if (line) ctx.fillText(line, panelX, lineY)

      FUNS.forEach((_, i) => {
        ctx.beginPath(); ctx.arc(margin + gridSz / 2 - (FUNS.length - 1) * 8 + i * 16, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === fi ? FUNS[i].color : (dark ? '#334155' : '#cbd5e1'); ctx.fill()
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Function Types on ℝ', w / 2, 20)

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
