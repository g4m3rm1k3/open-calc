import { useEffect, useRef } from 'react'

export default function ConjunctionScene() {
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

    const ROWS = [
      { p: true, q: true, result: true },
      { p: true, q: false, result: false },
      { p: false, q: true, result: false },
      { p: false, q: false, result: false },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const row = Math.floor(t / 1600) % 4
      const { p, q, result } = ROWS[row]

      // AND gate visual (trapezoid shape)
      const gateX = cx - 45, gateY = h * 0.38
      const gateW = 90, gateH = 56

      // Input wires
      const inputY1 = gateY + gateH * 0.25
      const inputY2 = gateY + gateH * 0.75
      const inputX = gateX - 50

      function wireColor(val) {
        return val ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      }

      // P input
      ctx.strokeStyle = wireColor(p); ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(inputX, inputY1); ctx.lineTo(gateX, inputY1); ctx.stroke()
      // Q input
      ctx.strokeStyle = wireColor(q); ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(inputX, inputY2); ctx.lineTo(gateX, inputY2); ctx.stroke()
      // Output wire
      ctx.strokeStyle = wireColor(result); ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(gateX + gateW, gateY + gateH / 2); ctx.lineTo(gateX + gateW + 50, gateY + gateH / 2); ctx.stroke()

      // Gate body
      ctx.beginPath()
      ctx.moveTo(gateX, gateY)
      ctx.lineTo(gateX + gateW * 0.55, gateY)
      ctx.arc(gateX + gateW * 0.55, gateY + gateH / 2, gateH / 2, -Math.PI / 2, Math.PI / 2)
      ctx.lineTo(gateX, gateY + gateH)
      ctx.closePath()
      ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'
      ctx.fill()
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'; ctx.lineWidth = 2; ctx.stroke()

      // AND label
      ctx.font = `bold ${Math.round(h * 0.06)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('∧', gateX + gateW * 0.42, gateY + gateH / 2)

      // Input labels
      ctx.font = `bold ${Math.round(h * 0.055)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'right'
      ctx.fillStyle = wireColor(p)
      ctx.fillText(`P=${p ? 'T' : 'F'}`, inputX - 4, inputY1)
      ctx.fillStyle = wireColor(q)
      ctx.fillText(`Q=${q ? 'T' : 'F'}`, inputX - 4, inputY2)

      // Output label
      ctx.textAlign = 'left'
      ctx.fillStyle = wireColor(result)
      ctx.fillText(`P∧Q=${result ? 'T' : 'F'}`, gateX + gateW + 55, gateY + gateH / 2)

      // Output light
      const lightX = cx + 80, lightY = gateY + gateH / 2
      ctx.beginPath()
      ctx.arc(lightX + 60, lightY, 16, 0, Math.PI * 2)
      if (result) {
        ctx.fillStyle = dark ? '#fde047' : '#facc15'
        ctx.shadowColor = '#fde047'; ctx.shadowBlur = 18
      } else {
        ctx.fillStyle = dark ? '#374151' : '#d1d5db'
        ctx.shadowBlur = 0
      }
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'; ctx.lineWidth = 1.5; ctx.stroke()

      // Truth table at bottom
      const tableY = h * 0.68
      const cols = ['P', 'Q', 'P ∧ Q']
      const colW = w / 4
      ctx.font = `bold ${Math.round(h * 0.046)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      cols.forEach((c, i) => {
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
        ctx.fillText(c, (i + 1) * colW, tableY)
      })

      ROWS.forEach((r, i) => {
        const y = tableY + (i + 1) * Math.round(h * 0.065)
        const isActive = i === row
        ctx.font = isActive
          ? `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
          : `${Math.round(h * 0.045)}px "JetBrains Mono", monospace`
        ;[r.p, r.q, r.result].forEach((val, j) => {
          ctx.fillStyle = isActive
            ? (val ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626'))
            : (dark ? '#334155' : '#cbd5e1')
          ctx.fillText(val ? 'T' : 'F', (j + 1) * colW, y)
        })
      })

      // Title
      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('AND Connective  P ∧ Q', cx, 20)

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
