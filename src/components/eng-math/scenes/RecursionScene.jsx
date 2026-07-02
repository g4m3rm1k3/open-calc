import { useEffect, useRef } from 'react'

export default function RecursionScene() {
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

    // Recursive definition visual: T(n) = T(n-1) + n, T(1)=1
    // Unroll to show T(5) = 5 + 4 + 3 + 2 + 1 = 15 = 5·6/2
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const maxK = Math.min(5, 1 + Math.floor(t / 900))  // reveal one level each 900ms then loop
      const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#ef4444']

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Recursive Definition Unrolled', cx, 20)

      // Definition box
      ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#6366f1'
      ctx.fillText('T(1) = 1', cx, h * 0.16)
      ctx.fillText('T(n) = T(n−1) + n', cx, h * 0.23)

      // Unrolling steps
      const startY = h * 0.36
      const stepH = h * 0.1
      let sum = 0
      for (let k = maxK; k >= 1; k--) {
        const i = maxK - k
        const y = startY + i * stepH
        const indent = i * 18
        sum += k
        const col = COLORS[(k - 1) % COLORS.length]

        // Indent line
        if (i > 0) {
          ctx.strokeStyle = col + '55'; ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(cx - w * 0.4 + indent - 8, y - stepH / 2); ctx.lineTo(cx - w * 0.4 + indent - 8, y); ctx.stroke()
        }

        ctx.font = `${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillStyle = col
        const txt = k > 1
          ? `T(${k}) = T(${k - 1}) + ${k}`
          : `T(1) = 1`
        ctx.fillText(txt, cx - w * 0.4 + indent, y)
      }

      // Result line
      if (maxK >= 5) {
        ctx.font = `bold ${Math.round(h * 0.046)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#22c55e'
        ctx.fillText(`T(5) = 5+4+3+2+1 = ${sum}`, cx, startY + 5 * stepH + h * 0.04)
        ctx.fillStyle = '#f59e0b'
        ctx.fillText(`= 5×6/2 = n(n+1)/2`, cx, startY + 6 * stepH + h * 0.04)
      }

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
