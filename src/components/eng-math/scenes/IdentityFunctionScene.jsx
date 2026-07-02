import { useEffect, useRef } from 'react'

export default function IdentityFunctionScene() {
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

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const vals = [2, -1, 5, 0, 3]
      const valIdx = Math.floor(t / 1400) % vals.length
      const x = vals[valIdx]
      const boxW = Math.min(w * 0.18, 70), boxH = Math.min(h * 0.14, 50)
      const gap = Math.min(w * 0.08, 30)

      function drawBox(bx, y, label, val, color) {
        ctx.beginPath()
        ctx.roundRect(bx - boxW / 2, y - boxH / 2, boxW, boxH, 8)
        ctx.fillStyle = dark ? color + '33' : color + '22'
        ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color; ctx.fillText(label, bx, y - 7)
        ctx.font = `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
        ctx.fillText(val, bx, y + 9)
      }

      function arrowH(x1, y, col) {
        ctx.strokeStyle = col; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + gap, y); ctx.stroke()
        ctx.fillStyle = col
        ctx.beginPath(); ctx.moveTo(x1+gap,y); ctx.lineTo(x1+gap-8,y-4); ctx.lineTo(x1+gap-8,y+4); ctx.closePath(); ctx.fill()
      }

      // Row 1: x → f → f(x) → id → f(x)   (f∘id = f)
      const r1 = h * 0.3
      const r1start = cx - boxW - gap * 2 - boxW / 2

      ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText(x, r1start - gap * 0.6, r1)
      arrowH(r1start - gap * 0.2, r1, '#6366f1')
      drawBox(r1start + gap + boxW / 2, r1, 'f(x)=2x', x * 2, '#6366f1')
      arrowH(r1start + gap + boxW, r1, '#f59e0b')
      drawBox(r1start + gap * 2 + boxW * 1.5, r1, 'id(x)=x', x * 2, '#f59e0b')

      ctx.font = `bold ${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#22c55e'
      ctx.fillText(`f ∘ id = f  →  ${x} → ${x * 2} → ${x * 2} ✓`, cx, r1 + boxH / 2 + 22)

      // Row 2: x → id → x → f → f(x)   (f∘id = f but in other order)
      const r2 = h * 0.6
      const r2start = r1start

      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
      ctx.fillText(x, r2start - gap * 0.6, r2)
      arrowH(r2start - gap * 0.2, r2, '#f59e0b')
      drawBox(r2start + gap + boxW / 2, r2, 'id(x)=x', x, '#f59e0b')
      arrowH(r2start + gap + boxW, r2, '#6366f1')
      drawBox(r2start + gap * 2 + boxW * 1.5, r2, 'f(x)=2x', x * 2, '#6366f1')

      ctx.font = `bold ${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#22c55e'
      ctx.fillText(`id ∘ f = f  →  ${x} → ${x} → ${x * 2} ✓`, cx, r2 + boxH / 2 + 22)

      // Identity line on mini graph
      const gSize = Math.min(h * 0.28, 90), gx = cx + w * 0.28, gy = h * 0.45
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(gx - gSize / 2, gy); ctx.lineTo(gx + gSize / 2, gy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(gx, gy - gSize / 2); ctx.lineTo(gx, gy + gSize / 2); ctx.stroke()
      // y=x line
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(gx - gSize / 2, gy + gSize / 2); ctx.lineTo(gx + gSize / 2, gy - gSize / 2); ctx.stroke()
      ctx.font = `bold ${Math.round(h * 0.042)}px system-ui`; ctx.textAlign = 'center'
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('id(x)=x', gx, gy - gSize / 2 - 12)
      ctx.font = `${Math.round(h * 0.034)}px system-ui`; ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.fillText('(y = x)', gx, gy + gSize / 2 + 10)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('The Identity Function', cx, 20)

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
