import { useEffect, useRef } from 'react'

export default function ComplementScene() {
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

    const elementsA = [1, 2, 3, 4, 5]
    const complement = [6, 7, 8, 9, 10]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2 - 5
      const rx = Math.min(w * 0.2, 80), ry = Math.min(h * 0.3, 80)
      const pad = 18

      // Universe background (gold)
      const pulse = 0.7 + 0.3 * Math.sin(t / 600)
      ctx.fillStyle = dark
        ? `rgba(120,60,0,${0.35 * pulse})`
        : `rgba(253,230,138,${0.55 * pulse})`
      ctx.beginPath()
      ctx.roundRect(pad, pad + 20, w - pad * 2, h - pad * 2 - 20, 8)
      ctx.fill()
      ctx.strokeStyle = dark ? '#92400e' : '#d97706'
      ctx.lineWidth = 2
      ctx.stroke()

      // A circle (neutral)
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#1e3a5f' : '#dbeafe'
      ctx.fill()
      ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2; ctx.stroke()

      // Label A
      ctx.font = `bold ${Math.round(h * 0.065)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#93c5fd' : '#2980b9'
      ctx.fillText('A', cx, cy)

      // Elements inside A (small)
      ctx.font = `${Math.round(h * 0.042)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      elementsA.forEach((el, i) => {
        const angle = (i / elementsA.length) * Math.PI * 2 - Math.PI / 2
        ctx.fillText(el, cx + Math.cos(angle) * rx * 0.55, cy + Math.sin(angle) * ry * 0.55)
      })

      // Elements in complement (outside A, animated appearance)
      const compPositions = [
        [pad + 30, cy - ry * 0.6],
        [w - pad - 30, cy - ry * 0.5],
        [pad + 40, cy + ry * 0.5],
        [w - pad - 35, cy + ry * 0.6],
        [cx + rx * 1.5, cy - 5],
      ]
      ctx.font = `bold ${Math.round(h * 0.055)}px system-ui`
      complement.forEach((el, i) => {
        const delay = i * 400
        const progress = Math.max(0, Math.min(1, (t - delay) / 400))
        const alpha = progress
        if (alpha <= 0) return
        const [px, py] = compPositions[i] || [pad + 20 + i * 30, pad + 35]
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#f39c12'
        ctx.fillText(el, px, py)
      })
      ctx.globalAlpha = 1

      // Label U
      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#92400e' : '#92400e'
      ctx.textAlign = 'left'
      ctx.fillText('U', pad + 6, pad + 38)

      // Formula
      ctx.textAlign = 'center'
      ctx.font = `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#f39c12'
      ctx.fillText('Aᶜ = {6, 7, 8, 9, 10}', cx, h - 22)

      // Title
      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Complement  Aᶜ = U \\ A', cx, 18)

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
