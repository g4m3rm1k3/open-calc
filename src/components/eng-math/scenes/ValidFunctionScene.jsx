import { useEffect, useRef } from 'react'

export default function ValidFunctionScene() {
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

    const CASES = [
      {
        valid: true,
        desc: 'Each input → exactly one output',
        arrows: [[0,0],[1,2],[2,1]],
        domain: ['a','b','c'], codomain: ['1','2','3'],
      },
      {
        valid: false,
        desc: 'Input b → two outputs (NOT a function)',
        arrows: [[0,0],[1,1],[1,2],[2,2]],
        domain: ['a','b','c'], codomain: ['1','2','3'],
      },
      {
        valid: true,
        desc: 'Two inputs can share one output (ok!)',
        arrows: [[0,1],[1,1],[2,0]],
        domain: ['a','b','c'], codomain: ['1','2','3'],
      },
      {
        valid: false,
        desc: 'Input c has no output (NOT a function)',
        arrows: [[0,0],[1,2]],
        domain: ['a','b','c'], codomain: ['1','2','3'],
      },
    ]

    function drawArrow(x1, y1, x2, y2, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy)
      if (len < 1) return
      const ux = dx / len, uy = dy / len
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - ux * 9 - uy * 4, y2 - uy * 9 + ux * 4)
      ctx.lineTo(x2 - ux * 9 + uy * 4, y2 - uy * 9 - ux * 4)
      ctx.closePath(); ctx.fill()
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const caseIdx = Math.floor(t / 2800) % CASES.length
      const { valid, desc, arrows, domain, codomain } = CASES[caseIdx]

      const cx = w / 2
      const leftX = cx - w * 0.22
      const rightX = cx + w * 0.22
      const topY = h * 0.25
      const nodeGap = Math.min(h * 0.16, 52)
      const r = 14
      const color = valid ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')

      function nodeY(i) { return topY + i * nodeGap }

      function drawNode(x, y, label, c) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'; ctx.fill()
        ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = c; ctx.fillText(label, x, y)
      }

      domain.forEach((el, i) => drawNode(leftX, nodeY(i), el, dark ? '#93c5fd' : '#2563eb'))
      codomain.forEach((el, i) => drawNode(rightX, nodeY(i), el, dark ? '#86efac' : '#16a34a'))

      // Arrows
      const revealCount = Math.min(arrows.length, Math.floor((t % 2800) / 400) + 1)
      arrows.slice(0, revealCount).forEach(([di, ci]) => {
        const ay = nodeY(di)
        const by = nodeY(ci)
        drawArrow(leftX + r, ay, rightX - r, by, color)
      })

      // Valid/invalid badge
      ctx.font = `bold ${Math.round(h * 0.065)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = color
      ctx.fillText(valid ? '✓ VALID' : '✗ INVALID', cx, h * 0.78)

      ctx.font = `${Math.round(h * 0.042)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText(desc, cx, h * 0.85)

      // Case dots
      CASES.forEach((c2, i) => {
        ctx.beginPath()
        ctx.arc(cx - (CASES.length - 1) * 8 + i * 16, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === caseIdx ? (c2.valid ? '#22c55e' : '#ef4444') : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Valid and Invalid Functions', cx, 20)

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
