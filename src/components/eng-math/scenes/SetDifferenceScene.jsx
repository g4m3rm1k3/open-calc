import { useEffect, useRef } from 'react'

export default function SetDifferenceScene() {
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

    // Cycle between A\B and B\A
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const phase = Math.floor(t / 3000) % 2 // 0 = A\B, 1 = B\A
      const cx = w / 2, cy = h / 2 - 5
      const rx = Math.min(w * 0.22, 95), ry = Math.min(h * 0.35, 95)
      const offset = rx * 0.7

      // Left circle (A)
      ctx.beginPath()
      ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
      const fillA = phase === 0 ? (dark ? '#3b2400' : '#fde8c0') : (dark ? '#1e2d3d' : '#e8f0f8')
      ctx.fillStyle = fillA
      ctx.fill()
      ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2; ctx.stroke()

      // Right circle (B)
      ctx.beginPath()
      ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
      const fillB = phase === 1 ? (dark ? '#3b2400' : '#fde8c0') : (dark ? '#1e2d3d' : '#e8f0f8')
      ctx.fillStyle = fillB
      ctx.fill()
      ctx.strokeStyle = '#27ae60'; ctx.lineWidth = 2; ctx.stroke()

      // Highlight the active "only" region
      if (phase === 0) {
        // Highlight A\B: A minus B
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.clip()
        // Fill whole A first
        ctx.fillStyle = 'rgba(243,156,18,0.55)'
        ctx.fill()
        // Cut out intersection by overdrawing with B's neutral color
        ctx.beginPath()
        ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#1e2d3d' : '#e8f0f8'
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fill()
        ctx.restore()
      } else {
        // Highlight B\A
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = 'rgba(243,156,18,0.55)'
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fill()
        ctx.restore()
      }

      // Re-stroke circles (clipping eats stroke)
      ctx.beginPath()
      ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2; ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.strokeStyle = '#27ae60'; ctx.lineWidth = 2; ctx.stroke()

      // Labels
      ctx.font = `bold ${Math.round(h * 0.07)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#93c5fd' : '#2980b9'
      ctx.fillText('A', cx - offset * 1.55, cy)
      ctx.fillStyle = dark ? '#86efac' : '#27ae60'
      ctx.fillText('B', cx + offset * 1.55, cy)

      // Element labels
      ctx.font = `bold ${Math.round(h * 0.052)}px system-ui`
      // A only: {1,2}
      [[1, -1], [2, 1]].forEach(([el, dy]) => {
        ctx.fillStyle = phase === 0 ? '#f39c12' : (dark ? '#64748b' : '#94a3b8')
        ctx.fillText(el, cx - offset * 1.55, cy + dy * 20)
      })
      // Intersection: {3,4,5}
      ;[[3, -1], [4, 0], [5, 1]].forEach(([el, dy]) => {
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText(el, cx, cy + dy * 20)
      })
      // B only: {6,7}
      ;[[6, -1], [7, 1]].forEach(([el, dy]) => {
        ctx.fillStyle = phase === 1 ? '#f39c12' : (dark ? '#64748b' : '#94a3b8')
        ctx.fillText(el, cx + offset * 1.55, cy + dy * 20)
      })

      // Formula
      const formulaY = cy + ry + 26
      ctx.font = `bold ${Math.round(h * 0.052)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#f39c12'
      ctx.textAlign = 'center'
      if (phase === 0) {
        ctx.fillText('A \\ B = {1, 2}', cx, formulaY)
      } else {
        ctx.fillText('B \\ A = {6, 7}', cx, formulaY)
      }
      ctx.font = `${Math.round(h * 0.038)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('in A but not in B', cx, formulaY + 18)

      // Title
      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Set Difference  A \\ B', cx, 22)

      // Phase dots
      ;[0, 1].forEach(i => {
        ctx.beginPath()
        ctx.arc(cx - 6 + i * 14, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === phase ? '#f39c12' : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      })

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
