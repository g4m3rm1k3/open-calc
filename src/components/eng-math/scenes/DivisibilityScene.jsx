import { useEffect, useRef } from 'react'

export default function DivisibilityScene() {
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

    // Direct proof: n(n+1) always divisible by 2 — one of two consecutive ints is even
    // Show visual grid and cycling examples
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const n = 1 + (Math.floor(t / 1800) % 7)  // cycles 1..7
      const product = n * (n + 1)
      const half = product / 2

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('2 | n(n+1) for all integers n', cx, 20)

      // Highlight which of n, n+1 is even
      const nEven = n % 2 === 0
      const evenNum = nEven ? n : n + 1
      const oddNum = nEven ? n + 1 : n

      // Two columns showing n and n+1
      const colW = Math.min(w * 0.22, 100), colH = Math.min(h * 0.28, 100)
      const leftX = cx - colW * 1.1, rightX = cx + colW * 0.1
      const rowY = h * 0.42

      function numBox(bx, y, val, isEven) {
        ctx.beginPath(); ctx.roundRect(bx, y - colH / 2, colW, colH, 10)
        ctx.fillStyle = isEven ? (dark ? '#6366f133' : '#6366f118') : (dark ? '#1e293b' : '#f1f5f9')
        ctx.fill()
        ctx.strokeStyle = isEven ? '#6366f1' : (dark ? '#334155' : '#cbd5e1')
        ctx.lineWidth = isEven ? 2.5 : 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(colH * 0.35)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = isEven ? '#6366f1' : (dark ? '#94a3b8' : '#64748b')
        ctx.fillText(val, bx + colW / 2, y - 8)
        ctx.font = `${Math.round(h * 0.036)}px system-ui`
        ctx.fillStyle = isEven ? '#6366f1' : (dark ? '#475569' : '#94a3b8')
        ctx.fillText(isEven ? '(even)' : '(odd)', bx + colW / 2, y + 18)
      }

      numBox(leftX, rowY, n, nEven)
      numBox(rightX, rowY, n + 1, !nEven)

      // × symbol between
      ctx.font = `bold ${Math.round(h * 0.06)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.fillText('×', cx, rowY)

      // = product / 2 arrows below
      ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#10b981'
      ctx.fillText(`${n} × ${n + 1} = ${product} = 2 × ${half}  ✓`, cx, h * 0.66)

      // Explanation
      ctx.font = `${Math.round(h * 0.04)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText(`${evenNum} is even → ${evenNum} = 2k → n(n+1) = 2k·${oddNum}`, cx, h * 0.78)

      // Rule at bottom
      ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('One of n, n+1 is always even  □', cx, h * 0.9)

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
