import { useEffect, useRef } from 'react'

export default function OrderLostScene() {
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
      // Phase: 0=set swap (equal), 1=pair swap (NOT equal)
      const phase = Math.floor(t / 3000) % 2
      const swapProgress = Math.min(1, ((t % 3000) - 600) / 600)

      const boxW = Math.min(w * 0.18, 70), boxH = Math.min(h * 0.15, 52)
      const row1Y = h * 0.32, row2Y = h * 0.62

      function drawBox(x, y, text, color) {
        ctx.beginPath()
        ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 8)
        ctx.fillStyle = dark ? color + '33' : color + '22'
        ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.065)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        ctx.fillText(text, x, y)
      }

      function lerp(a, b, t2) { return a + (b - a) * Math.min(1, Math.max(0, t2)) }

      const sp = Math.max(0, swapProgress)
      const arcY = phase === 0 ? -30 : -20

      if (phase === 0) {
        // SET: {a, b} = {b, a} — elements swap but set is equal
        const ax = lerp(cx - 60, cx + 60, sp)
        const bx = lerp(cx + 60, cx - 60, sp)
        const ay = sp > 0 && sp < 1 ? row1Y + Math.sin(sp * Math.PI) * arcY : row1Y
        const by = sp > 0 && sp < 1 ? row1Y + Math.sin(sp * Math.PI) * arcY * 0.8 : row1Y

        drawBox(ax, ay, 'a', '#6366f1')
        drawBox(bx, by, 'b', '#10b981')

        ctx.font = `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText('{a, b} = {b, a}', cx, row1Y + boxH / 2 + 22)
        ctx.font = `${Math.round(h * 0.042)}px system-ui`
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText('Sets: order does not matter', cx, row1Y + boxH / 2 + 42)

        // Equal sign with glow
        if (sp >= 1) {
          ctx.save()
          ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 14
          ctx.font = `bold ${Math.round(h * 0.09)}px system-ui`
          ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
          ctx.fillText('=', cx, row1Y)
          ctx.restore()
        }
      } else {
        // ORDERED PAIR: (a,b) ≠ (b,a)
        // Left pair
        const gap = w * 0.28
        drawBox(cx - gap / 2 - 35, row2Y, 'a', '#6366f1')
        ctx.font = `bold ${Math.round(h * 0.04)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = dark ? '#475569' : '#94a3b8'
        ctx.fillText(',', cx - gap / 2, row2Y)
        drawBox(cx - gap / 2 + 35, row2Y, 'b', '#10b981')

        // Right pair (b,a)
        drawBox(cx + gap / 2 - 35, row2Y, 'b', '#10b981')
        ctx.fillStyle = dark ? '#475569' : '#94a3b8'
        ctx.fillText(',', cx + gap / 2, row2Y)
        drawBox(cx + gap / 2 + 35, row2Y, 'a', '#6366f1')

        // Brackets
        ctx.font = `bold ${Math.round(h * 0.12)}px system-ui`
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
        ctx.fillText('(', cx - gap / 2 - 72, row2Y + 2)
        ctx.fillText(')', cx - gap / 2 + 72, row2Y + 2)
        ctx.fillText('(', cx + gap / 2 - 72, row2Y + 2)
        ctx.fillText(')', cx + gap / 2 + 72, row2Y + 2)

        // ≠
        ctx.save()
        ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 12
        ctx.font = `bold ${Math.round(h * 0.09)}px system-ui`
        ctx.fillStyle = dark ? '#ef4444' : '#dc2626'
        ctx.fillText('≠', cx, row2Y)
        ctx.restore()

        ctx.font = `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
        ctx.fillStyle = dark ? '#ef4444' : '#dc2626'
        ctx.fillText('(a, b) ≠ (b, a)', cx, row2Y + boxH / 2 + 22)
        ctx.font = `${Math.round(h * 0.042)}px system-ui`
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText('Ordered pairs: first ≠ second', cx, row2Y + boxH / 2 + 42)
      }

      // Phase dots
      ;[0, 1].forEach(i => {
        ctx.beginPath()
        ctx.arc(cx - 8 + i * 16, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === phase ? '#6366f1' : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.textAlign = 'center'
      ctx.fillText('The Problem With Sets: Order Is Lost', cx, 20)

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
