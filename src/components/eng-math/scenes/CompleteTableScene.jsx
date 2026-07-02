import { useEffect, useRef } from 'react'

export default function CompleteTableScene() {
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
      { p: true,  q: true,  np: false, and: true,  or: true,  imp: true,  iff: true  },
      { p: true,  q: false, np: false, and: false, or: true,  imp: false, iff: false },
      { p: false, q: true,  np: true,  and: false, or: true,  imp: true,  iff: false },
      { p: false, q: false, np: true,  and: false, or: false, imp: true,  iff: true  },
    ]

    const HEADERS = ['P', 'Q', '¬P', 'P∧Q', 'P∨Q', 'P→Q', 'P⟺Q']
    const COLORS  = ['#6366f1','#10b981','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899']

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cols = HEADERS.length
      const colW = (w - 20) / cols
      const headerY = h * 0.17
      const rowH = (h * 0.62) / 4

      // Reveal row by row
      const visibleRows = Math.min(4, Math.floor(t / 800))

      // Headers
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      HEADERS.forEach((hdr, i) => {
        ctx.font = `bold ${Math.round(h * 0.046)}px "JetBrains Mono", monospace`
        ctx.fillStyle = COLORS[i]
        ctx.fillText(hdr, 10 + (i + 0.5) * colW, headerY)
      })

      // Divider
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'; ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(10, headerY + rowH * 0.38)
      ctx.lineTo(w - 10, headerY + rowH * 0.38)
      ctx.stroke()

      // Rows
      ROWS.slice(0, visibleRows).forEach((row, ri) => {
        const y = headerY + rowH * 0.55 + ri * rowH
        const vals = [row.p, row.q, row.np, row.and, row.or, row.imp, row.iff]

        // Row highlight
        const isLast = ri === visibleRows - 1
        if (isLast) {
          ctx.beginPath()
          ctx.roundRect(10, y - rowH * 0.42, w - 20, rowH * 0.85, 6)
          ctx.fillStyle = dark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)'
          ctx.fill()
        }

        vals.forEach((val, ci) => {
          ctx.font = `${isLast ? 'bold ' : ''}${Math.round(h * 0.052)}px "JetBrains Mono", monospace`
          const trueColor = COLORS[ci]
          const falseColor = dark ? '#ef4444' : '#dc2626'
          ctx.fillStyle = isLast
            ? (val ? trueColor : falseColor)
            : (dark ? '#334155' : '#cbd5e1')
          ctx.fillText(val ? 'T' : 'F', 10 + (ci + 0.5) * colW, y)
        })
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Complete Truth Table', cx, 20)

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
