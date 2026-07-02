import { useEffect, useRef } from 'react'

export default function AssociativeScene() {
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

    // h∘g∘f — group (h∘g)∘f or h∘(g∘f), same result
    // f(x)=x+1, g(x)=2x, h(x)=x²
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const phase = Math.floor(t / 2800) % 2  // 0=(h∘g)∘f, 1=h∘(g∘f)
      const prog = Math.min(1, (t % 2800) / 1800)
      const xVal = 3

      const boxW = Math.min(w * 0.14, 54), boxH = Math.min(h * 0.12, 42)
      const gap = Math.min(w * 0.06, 24)
      const totalW = boxW * 3 + gap * 2
      const startX = cx - totalW / 2
      const rowY = h * 0.38

      function drawBox(x, y, label, sub, color, highlighted) {
        ctx.beginPath()
        ctx.roundRect(x, y - boxH / 2, boxW, boxH, 7)
        ctx.fillStyle = highlighted ? (dark ? color + '55' : color + '44') : (dark ? '#1e293b' : '#f1f5f9')
        ctx.fill()
        ctx.strokeStyle = highlighted ? color : (dark ? '#334155' : '#cbd5e1')
        ctx.lineWidth = highlighted ? 2.5 : 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.042)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = highlighted ? color : (dark ? '#64748b' : '#94a3b8')
        ctx.fillText(label, x + boxW / 2, y - 5)
        ctx.font = `${Math.round(h * 0.032)}px "JetBrains Mono", monospace`
        ctx.fillText(sub, x + boxW / 2, y + 10)
      }

      function arrow(x1, y, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + gap, y); ctx.stroke()
        ctx.fillStyle = color
        ctx.beginPath(); ctx.moveTo(x1 + gap, y)
        ctx.lineTo(x1 + gap - 7, y - 3.5)
        ctx.lineTo(x1 + gap - 7, y + 3.5)
        ctx.closePath(); ctx.fill()
      }

      // f=+1, g=×2, h=²
      const fOut = xVal + 1   // 4
      const gOut = fOut * 2   // 8
      const hOut = gOut * gOut // 64

      const hi1 = phase === 0 // (h∘g)∘f: group right two first
      const hi2 = phase === 1 // h∘(g∘f): group left two first

      // Boxes
      drawBox(startX, rowY, 'f', 'x+1', '#6366f1', true)
      arrow(startX + boxW, rowY, hi1 ? '#94a3b8' : '#10b981')
      drawBox(startX + boxW + gap, rowY, 'g', '2x', '#10b981', true)
      arrow(startX + 2 * (boxW + gap), rowY, hi1 ? '#f59e0b' : '#94a3b8')
      drawBox(startX + 2 * (boxW + gap), rowY, 'h', 'x²', '#f59e0b', true)

      // Bracket grouping
      const bracketY = rowY + boxH / 2 + 8
      if (phase === 0) {
        // (h∘g)∘f — bracket right two
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([3,3])
        ctx.beginPath()
        ctx.rect(startX + boxW + gap - 4, rowY - boxH / 2 - 4, boxW * 2 + gap + 8, boxH + 8)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.font = `${Math.round(h * 0.036)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        ctx.fillStyle = '#f59e0b'; ctx.fillText('(h∘g)', startX + 2 * (boxW + gap) - boxW / 2, bracketY + 4)
      } else {
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.setLineDash([3,3])
        ctx.beginPath()
        ctx.rect(startX - 4, rowY - boxH / 2 - 4, boxW * 2 + gap + 8, boxH + 8)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.font = `${Math.round(h * 0.036)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        ctx.fillStyle = '#6366f1'; ctx.fillText('(g∘f)', startX + boxW / 2 + gap / 2, bracketY + 4)
      }

      // Step-by-step computation
      const stepY = h * 0.62
      ctx.font = `${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      if (prog > 0.2) {
        ctx.fillStyle = '#6366f1'; ctx.fillText(`f(${xVal}) = ${fOut}`, cx, stepY)
      }
      if (prog > 0.5) {
        ctx.fillStyle = '#10b981'; ctx.fillText(`g(${fOut}) = ${gOut}`, cx, stepY + Math.round(h * 0.065))
      }
      if (prog > 0.8) {
        ctx.fillStyle = '#f59e0b'; ctx.fillText(`h(${gOut}) = ${hOut}`, cx, stepY + Math.round(h * 0.13))
      }

      ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
      ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
      ctx.fillText('(h∘g)∘f = h∘(g∘f)  always!', cx, h - 20)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Composition Is Associative', cx, 20)

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
