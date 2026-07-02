import { useEffect, useRef } from 'react'

export default function FunctionProblemScene() {
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

    function drawArrow(x1, y1, x2, y2, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy)
      const ux = dx / len, uy = dy / len
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - ux * 10 - uy * 4, y2 - uy * 10 + ux * 4)
      ctx.lineTo(x2 - ux * 10 + uy * 4, y2 - uy * 10 - ux * 4)
      ctx.closePath(); ctx.fill()
    }

    // Phase: 0 = broken relation, 1 = valid function
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const phase = Math.floor(t / 3200) % 2
      const cx = w / 2
      const halfW = w * 0.42
      const leftX = cx - halfW / 2 - 8
      const rightX = cx + halfW / 2 + 8
      const topY = h * 0.22
      const r = Math.min(13, h * 0.042)
      const nodeGap = Math.min(h * 0.17, 56)

      // Left column (domain)
      const domainEls = ['a', 'b', 'c']
      // Right column (codomain)
      const codomainEls = ['1', '2', '3', '4']

      // Draw nodes
      function drawNode(x, y, label, color) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'; ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color; ctx.fillText(label, x, y)
      }

      domainEls.forEach((el, i) => drawNode(leftX, topY + i * nodeGap, el, dark ? '#93c5fd' : '#2563eb'))
      codomainEls.forEach((el, i) => drawNode(rightX, topY + i * nodeGap * 0.75, el, dark ? '#86efac' : '#16a34a'))

      // Column labels
      ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#93c5fd' : '#2563eb'
      ctx.fillText('Domain', leftX, topY - 28)
      ctx.fillStyle = dark ? '#86efac' : '#16a34a'
      ctx.fillText('Codomain', rightX, topY - 28)

      if (phase === 0) {
        // BROKEN: a → {1,2} (multiple outputs) — BAD
        const aY = topY, bY = topY + nodeGap, cY = topY + 2 * nodeGap
        const prog = Math.min(1, (t % 3200) / 1200)

        if (prog > 0) drawArrow(leftX + r, aY, rightX - r, topY, '#ef4444')
        if (prog > 0.2) drawArrow(leftX + r, aY, rightX - r, topY + nodeGap * 0.75, '#ef4444')
        if (prog > 0.4) drawArrow(leftX + r, bY, rightX - r, topY + nodeGap * 1.5, '#10b981')
        if (prog > 0.6) drawArrow(leftX + r, cY, rightX - r, topY + nodeGap * 0.75, '#10b981')

        // ✗ symbol
        if (prog > 0.3) {
          ctx.font = `bold ${Math.round(h * 0.09)}px system-ui`
          ctx.fillStyle = '#ef4444'
          ctx.textAlign = 'center'
          ctx.fillText('✗', cx, topY + nodeGap)
        }

        ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
        ctx.fillStyle = dark ? '#ef4444' : '#dc2626'
        ctx.fillText('NOT a function — a maps to two outputs', cx, h * 0.85)
      } else {
        // VALID function: each input → exactly one output
        const prog = Math.min(1, (t % 3200) / 1200)
        if (prog > 0) drawArrow(leftX + r, topY, rightX - r, topY + nodeGap * 0.75, '#22c55e')
        if (prog > 0.3) drawArrow(leftX + r, topY + nodeGap, rightX - r, topY + nodeGap * 1.5, '#22c55e')
        if (prog > 0.6) drawArrow(leftX + r, topY + 2 * nodeGap, rightX - r, topY + nodeGap * 2.25, '#22c55e')

        if (prog > 0.8) {
          ctx.font = `bold ${Math.round(h * 0.09)}px system-ui`
          ctx.fillStyle = '#22c55e'
          ctx.textAlign = 'center'
          ctx.fillText('✓', cx, topY + nodeGap)
        }

        ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText('Valid function — each input has one output', cx, h * 0.85)
      }

      // Phase dots
      ;[0, 1].forEach(i => {
        ctx.beginPath()
        ctx.arc(cx - 8 + i * 16, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === phase ? (phase === 0 ? '#ef4444' : '#22c55e') : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('The Problem a Function Solves', cx, 20)

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
