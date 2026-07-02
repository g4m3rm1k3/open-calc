import { useEffect, useRef } from 'react'

const ROWS = [
  { P: 'T', Q: 'T', notP: 'F', PandQ: 'T', PorQ: 'T', PimplQ: 'T' },
  { P: 'T', Q: 'F', notP: 'F', PandQ: 'F', PorQ: 'T', PimplQ: 'F' },
  { P: 'F', Q: 'T', notP: 'T', PandQ: 'F', PorQ: 'T', PimplQ: 'T' },
  { P: 'F', Q: 'F', notP: 'T', PandQ: 'F', PorQ: 'F', PimplQ: 'T' },
]
const COLS = ['P', 'Q', '¬P', 'P∧Q', 'P∨Q', 'P→Q']
const KEYS = ['P', 'Q', 'notP', 'PandQ', 'PorQ', 'PimplQ']

export default function TruthTableScene() {
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

      const colW = Math.min((w - 40) / COLS.length, 66)
      const rowH = Math.min((h - 100) / (ROWS.length + 1), 38)
      const tableW = colW * COLS.length
      const startX = (w - tableW) / 2
      const startY = 44

      // How many rows to show (grows over time, cycles)
      const CYCLE = 8000
      const progress = (t % CYCLE) / CYCLE
      const visibleRows = Math.min(ROWS.length, Math.ceil(progress * (ROWS.length + 0.5)))
      const highlightRow = visibleRows - 1

      // Header
      ctx.font = 'bold 13px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      for (let c = 0; c < COLS.length; c++) {
        const cx = startX + c * colW + colW / 2
        const cy = startY + rowH / 2
        const isLogic = c >= 2
        ctx.fillStyle = isLogic
          ? (dark ? '#a78bfa' : '#7c3aed')
          : (dark ? '#94a3b8' : '#475569')
        ctx.fillText(COLS[c], cx, cy)
      }

      // Header underline
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(startX, startY + rowH)
      ctx.lineTo(startX + tableW, startY + rowH)
      ctx.stroke()

      // Column dividers
      ctx.strokeStyle = dark ? '#1e293b' : '#f1f5f9'
      for (let c = 1; c < COLS.length; c++) {
        ctx.beginPath()
        ctx.moveTo(startX + c * colW, startY)
        ctx.lineTo(startX + c * colW, startY + rowH * (visibleRows + 1))
        ctx.stroke()
      }

      // Rows
      for (let r = 0; r < visibleRows; r++) {
        const ry = startY + rowH + r * rowH
        const row = ROWS[r]
        const isHighlighted = r === highlightRow

        if (isHighlighted) {
          ctx.fillStyle = dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'
          ctx.fillRect(startX, ry, tableW, rowH)
        }

        for (let c = 0; c < COLS.length; c++) {
          const cx = startX + c * colW + colW / 2
          const val = row[KEYS[c]]
          const isTrue = val === 'T'
          let color
          if (c < 2) {
            color = dark ? '#cbd5e1' : '#334155'
          } else {
            color = isTrue ? (dark ? '#34d399' : '#059669') : (dark ? '#f87171' : '#dc2626')
          }
          ctx.font = `${isHighlighted ? 'bold ' : ''}13px "JetBrains Mono", monospace`
          ctx.fillStyle = color
          ctx.fillText(val, cx, ry + rowH / 2)
        }

        // Row separator
        ctx.strokeStyle = dark ? '#1e293b' : '#f1f5f9'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(startX, ry + rowH)
        ctx.lineTo(startX + tableW, ry + rowH)
        ctx.stroke()
      }

      // Border
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'
      ctx.lineWidth = 1.5
      ctx.strokeRect(startX, startY, tableW, rowH * (visibleRows + 1))

      // Title
      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('TRUTH TABLE', w / 2, 20)
      ctx.globalAlpha = 1

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
