import { useEffect, useRef } from 'react'

export default function ImplicationScene() {
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
      { p: true,  q: true,  result: true,  note: 'Promise kept' },
      { p: true,  q: false, result: false, note: 'Promise BROKEN' },
      { p: false, q: true,  result: true,  note: 'No promise made' },
      { p: false, q: false, result: true,  note: 'No promise made' },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const row = Math.floor(t / 2200) % 4
      const { p, q, result, note } = ROWS[row]
      const cx = w / 2
      const cy = h * 0.38

      // Box sizing — proportional so nothing overlaps
      const boxW = Math.min(w * 0.26, 110)
      const boxH = Math.min(h * 0.26, 100)
      const arrowGap = Math.min(w * 0.08, 40)
      const pX = cx - arrowGap / 2 - boxW
      const qX = cx + arrowGap / 2

      function drawBox(x, y, label, val) {
        const color = val ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
        const bg = val ? (dark ? '#14532d88' : '#dcfce7') : (dark ? '#450a0a88' : '#fee2e2')
        ctx.beginPath()
        ctx.roundRect(x, y - boxH / 2, boxW, boxH, 10)
        ctx.fillStyle = bg; ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke()

        // Label letter — top third of box
        ctx.font = `bold ${Math.round(boxH * 0.32)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        ctx.fillText(label, x + boxW / 2, y - boxH * 0.18)

        // Divider line
        ctx.strokeStyle = color + '44'; ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x + 10, y + boxH * 0.05)
        ctx.lineTo(x + boxW - 10, y + boxH * 0.05)
        ctx.stroke()

        // Value — bottom third of box
        ctx.font = `bold ${Math.round(boxH * 0.22)}px "JetBrains Mono", monospace`
        ctx.fillStyle = color
        ctx.fillText(val ? 'TRUE' : 'FALSE', x + boxW / 2, y + boxH * 0.3)
      }

      drawBox(pX, cy, 'P', p)
      drawBox(qX, cy, 'Q', q)

      // Arrow between boxes
      const arrowX1 = pX + boxW + 4
      const arrowX2 = qX - 4
      const arrowColor = result ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      ctx.strokeStyle = arrowColor
      ctx.lineWidth = 3
      ctx.setLineDash(result ? [] : [8, 5])
      ctx.beginPath()
      ctx.moveTo(arrowX1, cy)
      ctx.lineTo(arrowX2 - 12, cy)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = arrowColor
      ctx.beginPath()
      ctx.moveTo(arrowX2, cy)
      ctx.lineTo(arrowX2 - 14, cy - 7)
      ctx.lineTo(arrowX2 - 14, cy + 7)
      ctx.closePath(); ctx.fill()

      // Note below
      ctx.font = `bold ${Math.round(h * 0.052)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = result ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      ctx.fillText(note, cx, cy + boxH / 2 + h * 0.07)

      // Truth table
      const tableY = h * 0.7
      const colW = w / 4
      ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ;['P', 'Q', 'P → Q'].forEach((c, i) => {
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
        ctx.fillText(c, (i + 1) * colW, tableY)
      })
      ROWS.forEach((r, i) => {
        const y = tableY + (i + 1) * Math.round(h * 0.062)
        const isActive = i === row
        ctx.font = isActive
          ? `bold ${Math.round(h * 0.046)}px "JetBrains Mono", monospace`
          : `${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
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
      ctx.fillText('Implication  P → Q', cx, 20)

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
