import { useEffect, useRef } from 'react'

const SYMBOLS = ['∈', '⊂', '⊆', '{}', '∅', '∩', '∪', '∀', '∃', '|A|', '⇒', '↔']

export default function WelcomeScene() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let rafId
    let w, h

    const particles = SYMBOLS.map((sym, i) => ({
      sym,
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      alpha: 0.08 + Math.random() * 0.12,
      size: 14 + Math.random() * 12,
      phase: (i / SYMBOLS.length) * Math.PI * 2,
    }))

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(t) {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // Floating symbols
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = 1
        if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1
        if (p.y > 1) p.y = 0

        const pulse = 0.5 + 0.5 * Math.sin(t * 0.001 + p.phase)
        ctx.globalAlpha = p.alpha * (0.5 + 0.5 * pulse)
        ctx.font = `${p.size}px 'JetBrains Mono', monospace`
        ctx.fillStyle = dark ? '#818cf8' : '#6366f1'
        ctx.fillText(p.sym, p.x * w, p.y * h)
      }

      ctx.globalAlpha = 1

      // Center text
      const cx = w / 2
      const cy = h / 2

      ctx.font = 'bold 13px system-ui, sans-serif'
      ctx.fillStyle = '#6366f1'
      ctx.letterSpacing = '0.15em'
      ctx.textAlign = 'center'
      ctx.fillText('ENGINEERING MATHEMATICS', cx, cy - 42)

      ctx.font = 'bold 22px system-ui, sans-serif'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.letterSpacing = '0'
      ctx.fillText('Interactive Reader', cx, cy - 12)

      ctx.font = '13px system-ui, sans-serif'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText('Scroll through the lesson on the left', cx, cy + 22)
      ctx.fillText('to explore concepts here', cx, cy + 42)

      // Animated arrow
      const arrowY = cy + 78 + Math.sin(t * 0.003) * 4
      ctx.fillStyle = '#6366f1'
      ctx.font = '20px system-ui'
      ctx.fillText('↓', cx, arrowY)
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      draw(ts - start)
      rafId = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(() => { resize(); draw(0) })
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
