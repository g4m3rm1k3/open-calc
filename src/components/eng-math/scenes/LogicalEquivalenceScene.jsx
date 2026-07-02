import { useEffect, useRef } from 'react'

export default function LogicalEquivalenceScene() {
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

    // De Morgan: ¬(P∧Q) ≡ (¬P∨¬Q)
    const ROWS = [
      { p: true,  q: true,  nand: false, np_or_nq: false },
      { p: true,  q: false, nand: true,  np_or_nq: true },
      { p: false, q: true,  nand: true,  np_or_nq: true },
      { p: false, q: false, nand: true,  np_or_nq: true },
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
      const activeRow = Math.floor(t / 1400) % 4

      // Two column layout
      const colW = w * 0.38
      const col1X = cx - colW - 8
      const col2X = cx + 8
      const startY = h * 0.22

      // Headers
      ctx.font = `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#f59e0b' : '#d97706'
      ctx.fillText('¬(P ∧ Q)', col1X + colW / 2, h * 0.13)
      ctx.fillStyle = dark ? '#a78bfa' : '#7c3aed'
      ctx.fillText('¬P ∨ ¬Q', col2X + colW / 2, h * 0.13)

      // Equivalence symbol
      ctx.font = `bold ${Math.round(h * 0.07)}px system-ui`
      ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
      ctx.fillText('≡', cx, h * 0.13)

      // Table rows
      ROWS.forEach((r, i) => {
        const y = startY + i * Math.round(h * 0.14)
        const isActive = i === activeRow

        // Highlight active row background
        if (isActive) {
          ctx.beginPath()
          ctx.roundRect(col1X - 4, y - 18, colW * 2 + 24, 36, 6)
          ctx.fillStyle = dark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.1)'
          ctx.fill()
        }

        // P Q values
        ctx.font = `${isActive ? 'bold ' : ''}${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
        const dimColor = dark ? '#334155' : '#cbd5e1'
        ctx.textAlign = 'left'
        ctx.fillStyle = isActive ? (dark ? '#94a3b8' : '#64748b') : dimColor
        ctx.fillText(`P=${r.p ? 'T' : 'F'} Q=${r.q ? 'T' : 'F'}`, col1X, y)

        // Left result
        ctx.textAlign = 'center'
        const lColor = isActive
          ? (r.nand ? (dark ? '#f59e0b' : '#d97706') : (dark ? '#ef4444' : '#dc2626'))
          : dimColor
        ctx.fillStyle = lColor
        ctx.font = `bold ${Math.round(h * 0.06)}px "JetBrains Mono", monospace`
        ctx.fillText(r.nand ? 'T' : 'F', col1X + colW * 0.85, y)

        // Right result
        const rColor = isActive
          ? (r.np_or_nq ? (dark ? '#a78bfa' : '#7c3aed') : (dark ? '#ef4444' : '#dc2626'))
          : dimColor
        ctx.fillStyle = rColor
        ctx.fillText(r.np_or_nq ? 'T' : 'F', col2X + colW * 0.85, y)

        // Match indicator
        if (isActive) {
          ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
          ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
          ctx.fillText('✓', cx, y)
        }
      })

      // Bottom note
      ctx.font = `${Math.round(h * 0.042)}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText("De Morgan's Law: columns always match", cx, h - 20)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Logical Equivalence', cx, 20)

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
