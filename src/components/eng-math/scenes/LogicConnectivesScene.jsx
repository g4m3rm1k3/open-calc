import { useEffect, useRef } from 'react'

const CONNECTIVES = [
  {
    name: 'NOT (¬P)',
    rows: [['T', 'F'], ['F', 'T']],
    headers: ['P', '¬P'],
    color: '#f59e0b',
    desc: 'Negation flips the truth value',
  },
  {
    name: 'AND (P ∧ Q)',
    rows: [['T','T','T'], ['T','F','F'], ['F','T','F'], ['F','F','F']],
    headers: ['P', 'Q', 'P∧Q'],
    color: '#6366f1',
    desc: 'True only when BOTH are true',
  },
  {
    name: 'OR (P ∨ Q)',
    rows: [['T','T','T'], ['T','F','T'], ['F','T','T'], ['F','F','F']],
    headers: ['P', 'Q', 'P∨Q'],
    color: '#10b981',
    desc: 'True when AT LEAST ONE is true',
  },
  {
    name: 'IF-THEN (P → Q)',
    rows: [['T','T','T'], ['T','F','F'], ['F','T','T'], ['F','F','T']],
    headers: ['P', 'Q', 'P→Q'],
    color: '#ec4899',
    desc: 'False only when P is true and Q is false',
  },
]

export default function LogicConnectivesScene() {
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

      const PERIOD = 12000
      const idx = Math.floor((t % PERIOD) / PERIOD * CONNECTIVES.length)
      const conn = CONNECTIVES[idx]
      const cols = conn.headers.length
      const colW = Math.min((w * 0.6) / cols, 72)
      const rowH = 32
      const tableW = colW * cols
      const sx = (w - tableW) / 2
      const sy = h * 0.26

      // Connective name badge
      ctx.save()
      ctx.fillStyle = conn.color + '22'
      const bw = 200, bh = 36, bx = (w - bw) / 2, by = 34
      ctx.beginPath()
      ctx.roundRect(bx, by, bw, bh, 8)
      ctx.fill()
      ctx.strokeStyle = conn.color
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()

      ctx.font = 'bold 15px system-ui'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = conn.color
      ctx.fillText(conn.name, w / 2, 34 + 18)

      // Header row
      ctx.font = 'bold 13px "JetBrains Mono", monospace'
      for (let c = 0; c < cols; c++) {
        const cx = sx + c * colW + colW / 2
        ctx.fillStyle = c === cols - 1 ? conn.color : (dark ? '#94a3b8' : '#475569')
        ctx.fillText(conn.headers[c], cx, sy + rowH / 2)
      }

      // Header underline
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(sx, sy + rowH); ctx.lineTo(sx + tableW, sy + rowH); ctx.stroke()

      // Data rows
      for (let r = 0; r < conn.rows.length; r++) {
        const row = conn.rows[r]
        const ry = sy + rowH + r * rowH
        const lastVal = row[row.length - 1]
        const isTrue = lastVal === 'T'

        // Highlight last column cell
        ctx.fillStyle = isTrue
          ? (dark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)')
          : (dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)')
        ctx.fillRect(sx + (cols - 1) * colW, ry, colW, rowH)

        for (let c = 0; c < cols; c++) {
          const cx = sx + c * colW + colW / 2
          const val = row[c]
          let color
          if (c < cols - 1) {
            color = dark ? '#cbd5e1' : '#334155'
          } else {
            color = val === 'T' ? (dark ? '#34d399' : '#059669') : (dark ? '#f87171' : '#dc2626')
          }
          ctx.font = `${c === cols - 1 ? 'bold ' : ''}13px "JetBrains Mono", monospace`
          ctx.fillStyle = color
          ctx.fillText(val, cx, ry + rowH / 2)
        }

        ctx.strokeStyle = dark ? '#1e293b' : '#f1f5f9'
        ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(sx, ry + rowH); ctx.lineTo(sx + tableW, ry + rowH); ctx.stroke()
      }

      // Border
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'
      ctx.lineWidth = 1.5
      ctx.strokeRect(sx, sy, tableW, rowH * (conn.rows.length + 1))

      // Column dividers
      ctx.strokeStyle = dark ? '#1e293b' : '#f1f5f9'
      ctx.lineWidth = 1
      for (let c = 1; c < cols; c++) {
        ctx.beginPath()
        ctx.moveTo(sx + c * colW, sy)
        ctx.lineTo(sx + c * colW, sy + rowH * (conn.rows.length + 1))
        ctx.stroke()
      }

      // Description
      ctx.font = '12px system-ui'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.textAlign = 'center'
      ctx.fillText(conn.desc, w / 2, sy + rowH * (conn.rows.length + 1) + 22)

      // Progress dots
      for (let i = 0; i < CONNECTIVES.length; i++) {
        ctx.beginPath()
        ctx.arc(w / 2 + (i - 1.5) * 14, h - 16, i === idx ? 4 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = i === idx ? conn.color : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      }

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('LOGIC CONNECTIVES', w / 2, 20)
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
