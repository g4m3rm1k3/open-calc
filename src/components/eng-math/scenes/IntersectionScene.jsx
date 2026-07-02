import { useEffect, useRef } from 'react'

export default function IntersectionScene() {
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

    const A = [1, 2, 3, 4, 5]
    const B = [3, 4, 5, 6, 7]
    const intersection = [3, 4, 5]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2 - 10
      const rx = Math.min(w * 0.22, 100), ry = Math.min(h * 0.36, 100)
      const offset = rx * 0.7

      // Pulse for intersection region
      const pulse = 0.85 + 0.15 * Math.sin(t / 400)

      // Draw A circle (left)
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#1e3a5f' : '#dce8f5'
      ctx.fill()
      ctx.strokeStyle = '#2980b9'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      // Draw B circle (right)
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#1a3d2e' : '#d5f0e2'
      ctx.fill()
      ctx.strokeStyle = '#27ae60'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      // Highlight intersection region by clipping
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.clip()
      ctx.beginPath()
      ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(243,156,18,${0.55 * pulse})`
      ctx.fill()
      ctx.restore()

      // Labels A, B
      const labelStyle = dark ? '#93c5fd' : '#2980b9'
      ctx.font = `bold ${Math.round(h * 0.07)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = labelStyle
      ctx.fillText('A', cx - offset * 1.5, cy)
      ctx.fillStyle = dark ? '#86efac' : '#27ae60'
      ctx.fillText('B', cx + offset * 1.5, cy)

      // Elements in A only (left)
      const aOnly = A.filter(x => !B.includes(x))
      ctx.font = `bold ${Math.round(h * 0.055)}px system-ui`
      ctx.fillStyle = dark ? '#94a3b8' : '#475569'
      aOnly.forEach((el, i) => {
        const angle = -0.5 + i * 0.5
        ctx.fillText(el, cx - offset * 1.6 + Math.cos(angle) * 20, cy + (i - 1) * 22)
      })

      // Elements in B only (right)
      const bOnly = B.filter(x => !A.includes(x))
      bOnly.forEach((el, i) => {
        ctx.fillText(el, cx + offset * 1.6 + Math.cos(i) * 10, cy + (i - 0.5) * 22)
      })

      // Elements in intersection (center) — animated appearance
      ctx.fillStyle = '#f39c12'
      ctx.font = `bold ${Math.round(h * 0.06)}px system-ui`
      intersection.forEach((el, i) => {
        const py = cy + (i - 1) * 24
        ctx.fillText(el, cx, py)
      })

      // Formula at bottom
      const formulaY = cy + ry + 28
      ctx.font = `bold ${Math.round(h * 0.052)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = '#f39c12'
      ctx.fillText('A ∩ B = {3, 4, 5}', cx, formulaY)

      ctx.font = `${Math.round(h * 0.042)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('elements in BOTH A and B', cx, formulaY + 20)

      // Title
      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Intersection  A ∩ B', cx, 22)

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
