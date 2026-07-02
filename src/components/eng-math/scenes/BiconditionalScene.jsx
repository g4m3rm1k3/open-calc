import { useEffect, useRef } from 'react'

export default function BiconditionalScene() {
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
      { p: false, q: false, result: true },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const row = Math.floor(t / 1800) % 4
      const { p, q, result } = ROWS[row]
      const cx = w / 2, cy = h * 0.38

      const boxW = Math.min(w * 0.22, 85), boxH = Math.min(h * 0.2, 62)
      const pX = cx - boxW - 50, qX = cx + 50

      function drawBox(x, y, label, val) {
        const color = val ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
        const bg = val ? (dark ? '#14532d' : '#dcfce7') : (dark ? '#450a0a' : '#fee2e2')
        ctx.beginPath()
        ctx.roundRect(x, y - boxH / 2, boxW, boxH, 8)
        ctx.fillStyle = bg; ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.056)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        ctx.fillText(label, x + boxW / 2, y - 8)
        ctx.font = `${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
        ctx.fillText(val ? 'T' : 'F', x + boxW / 2, y + 11)
      }

      drawBox(pX, cy, 'P', p)
      drawBox(qX, cy, 'Q', q)

      // Double arrow ⟺
      const arrowColor = result ? (dark ? '#f59e0b' : '#d97706') : (dark ? '#ef4444' : '#dc2626')
      const ax1 = pX + boxW + 6, ax2 = qX - 6

      ctx.strokeStyle = arrowColor; ctx.lineWidth = 2.5
      ctx.setLineDash(result ? [] : [6, 5])

      // Forward arrow
      ctx.beginPath()
      ctx.moveTo(ax1, cy - 6); ctx.lineTo(ax2 - 10, cy - 6); ctx.stroke()
      ctx.fillStyle = arrowColor
      ctx.beginPath(); ctx.moveTo(ax2, cy - 6)
      ctx.lineTo(ax2 - 12, cy - 12); ctx.lineTo(ax2 - 12, cy); ctx.closePath(); ctx.fill()

      // Backward arrow
      ctx.beginPath()
      ctx.moveTo(ax2, cy + 6); ctx.lineTo(ax1 + 10, cy + 6); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ax1, cy + 6)
      ctx.lineTo(ax1 + 12, cy); ctx.lineTo(ax1 + 12, cy + 12); ctx.closePath(); ctx.fill()

      ctx.setLineDash([])

      // Symbol
      ctx.font = `bold ${Math.round(h * 0.065)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = arrowColor
      ctx.fillText(result ? '⟺' : '✗', cx, cy)

      // Result label
      ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
      ctx.fillStyle = arrowColor
      ctx.fillText(
        result ? 'Same truth value — TRUE' : 'Different truth values — FALSE',
        cx, cy + boxH / 2 + 24
      )

      // Truth table
      const tableY = h * 0.66
      const colW = w / 4
      ctx.font = `bold ${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ;['P', 'Q', 'P ⟺ Q'].forEach((c, i) => {
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
        ctx.fillText(c, (i + 1) * colW, tableY)
      })
      ROWS.forEach((r, i) => {
        const y = tableY + (i + 1) * Math.round(h * 0.062)
        const isActive = i === row
        ctx.font = isActive
          ? `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
          : `${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
        ;[r.p, r.q, r.result].forEach((val, j) => {
          const baseColor = val ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
          ctx.fillStyle = isActive ? baseColor : (dark ? '#334155' : '#cbd5e1')
          ctx.fillText(val ? 'T' : 'F', (j + 1) * colW, y)
        })
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Biconditional  P ⟺ Q', cx, 20)

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
