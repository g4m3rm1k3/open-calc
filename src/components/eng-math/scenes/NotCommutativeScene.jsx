import { useEffect, useRef } from 'react'

export default function NotCommutativeScene() {
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

    // f(x)=x², g(x)=x+1
    // f∘g(x) = (x+1)² ≠ g∘f(x) = x²+1
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const boxW = Math.min(w * 0.18, 68), boxH = Math.min(h * 0.14, 48)
      const arrowLen = Math.min(w * 0.1, 36)

      // Input value (cycles 2 → 3 → 4)
      const xVal = 2 + (Math.floor(t / 2200) % 3)
      const gOfX = xVal + 1
      const fogX = gOfX * gOfX  // (x+1)²
      const fOfX = xVal * xVal
      const gofX = fOfX + 1    // x²+1

      function drawBox(x, y, label, val, color) {
        ctx.beginPath()
        ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 8)
        ctx.fillStyle = dark ? color + '33' : color + '22'
        ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        ctx.fillText(label, x, y - 6)
        ctx.font = `${Math.round(h * 0.036)}px "JetBrains Mono", monospace`
        ctx.fillText(val !== null ? `→ ${val}` : '', x, y + 10)
      }

      function drawArrow(x1, y, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + arrowLen, y); ctx.stroke()
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(x1 + arrowLen, y)
        ctx.lineTo(x1 + arrowLen - 8, y - 4)
        ctx.lineTo(x1 + arrowLen - 8, y + 4)
        ctx.closePath(); ctx.fill()
      }

      const rowOffset = h * 0.14

      // ROW 1: f∘g — first g, then f
      const r1y = h * 0.32
      const startX1 = cx - boxW - arrowLen * 1.5
      // Input
      ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText(`x=${xVal}`, startX1 - arrowLen / 2, r1y)
      drawArrow(startX1, r1y, '#10b981')
      drawBox(startX1 + arrowLen + boxW / 2, r1y, 'g(x)=x+1', gOfX, '#10b981')
      drawArrow(startX1 + arrowLen + boxW, r1y, '#6366f1')
      drawBox(startX1 + arrowLen * 2 + boxW * 1.5, r1y, 'f(x)=x²', fogX, '#6366f1')

      ctx.font = `bold ${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#f59e0b'
      ctx.fillText(`f∘g(${xVal}) = (${xVal}+1)² = ${fogX}`, cx, r1y + boxH / 2 + 20)

      // ROW 2: g∘f — first f, then g
      const r2y = h * 0.62
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
      ctx.fillText(`x=${xVal}`, startX1 - arrowLen / 2, r2y)
      drawArrow(startX1, r2y, '#6366f1')
      drawBox(startX1 + arrowLen + boxW / 2, r2y, 'f(x)=x²', fOfX, '#6366f1')
      drawArrow(startX1 + arrowLen + boxW, r2y, '#10b981')
      drawBox(startX1 + arrowLen * 2 + boxW * 1.5, r2y, 'g(x)=x+1', gofX, '#10b981')

      ctx.font = `bold ${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#a855f7'
      ctx.fillText(`g∘f(${xVal}) = ${xVal}²+1 = ${gofX}`, cx, r2y + boxH / 2 + 20)

      // ≠ symbol
      ctx.font = `bold ${Math.round(h * 0.08)}px system-ui`
      ctx.fillStyle = dark ? '#ef4444' : '#dc2626'
      ctx.fillText(fogX !== gofX ? `${fogX} ≠ ${gofX}` : `${fogX} = ${gofX}  (coincidence)`, cx, h * 0.48)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Composition Is Not Commutative', cx, 20)

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
