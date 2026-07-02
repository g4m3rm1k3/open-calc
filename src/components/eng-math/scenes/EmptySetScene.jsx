import { useEffect, useRef } from 'react'

export default function EmptySetScene() {
  const canvasRef = useRef(null)
  const tickRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      canvas.style.width = r.width + 'px'
      canvas.style.height = r.height + 'px'
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement)

    const isDark = () => document.documentElement.classList.contains('dark')

    // Animated elements that try to enter the set but bounce off
    const candidates = [
      { symbol: '1', angle: 0, dist: 0 },
      { symbol: '∞', angle: Math.PI * 0.6, dist: 0 },
      { symbol: 'x', angle: Math.PI * 1.1, dist: 0 },
      { symbol: '★', angle: Math.PI * 1.7, dist: 0 },
    ]

    function draw() {
      const ctx = canvas.getContext('2d')
      const W = canvas.width
      const H = canvas.height
      const dpr = window.devicePixelRatio || 1
      const dark = isDark()
      const t = tickRef.current++

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      const cx = W / 2
      const cy = H * 0.48
      const ovalW = 110 * dpr
      const ovalH = 80 * dpr

      // Title
      ctx.font = `bold ${13 * dpr}px Inter, system-ui, sans-serif`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.textAlign = 'center'
      ctx.fillText('THE EMPTY SET', cx, cy - 110 * dpr)

      // Oval (the empty set)
      ctx.beginPath()
      ctx.ellipse(cx, cy, ovalW, ovalH, 0, 0, Math.PI * 2)
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.lineWidth = 2.5 * dpr
      ctx.stroke()
      ctx.fillStyle = dark ? 'rgba(99,102,241,0.06)' : 'rgba(79,70,229,0.05)'
      ctx.fill()

      // Empty set symbol inside
      ctx.font = `${36 * dpr}px serif`
      ctx.fillStyle = dark ? '#4338ca' : '#6366f1'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('∅', cx, cy)
      ctx.textBaseline = 'alphabetic'

      // |∅| = 0
      ctx.font = `bold ${14 * dpr}px Inter, system-ui, sans-serif`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.textAlign = 'center'
      ctx.fillText('|∅| = 0', cx, cy + 100 * dpr)

      ctx.font = `${11 * dpr}px Inter, system-ui, sans-serif`
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.fillText('No elements. Nothing can belong here.', cx, cy + 120 * dpr)

      // Animate candidates approaching and bouncing off
      const period = 180
      candidates.forEach((c, i) => {
        const offset = i * (period / candidates.length)
        const elapsed = (t + offset) % period
        const approach = elapsed / period

        // Travel inward, then bounce back
        let progress
        if (approach < 0.5) {
          progress = approach * 2 // 0→1: approaching
        } else {
          progress = 2 - approach * 2 // 1→0: bouncing away
        }

        const maxDist = 160 * dpr
        const dist = maxDist * (1 - progress * 0.7)
        const ex = cx + Math.cos(c.angle) * dist
        const ey = cy + Math.sin(c.angle) * dist

        // Color fades from dim to bright as it approaches
        const alpha = 0.3 + progress * 0.7
        ctx.font = `bold ${15 * dpr}px Inter, system-ui, sans-serif`
        ctx.fillStyle = dark
          ? `rgba(148,163,184,${alpha})`
          : `rgba(51,65,85,${alpha})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(c.symbol, ex, ey)

        // "✗" appears near the oval edge when close
        if (progress > 0.7) {
          const edgeX = cx + Math.cos(c.angle) * (ovalW + 16 * dpr)
          const edgeY = cy + Math.sin(c.angle) * (ovalH + 16 * dpr)
          const xAlpha = (progress - 0.7) / 0.3
          ctx.font = `${12 * dpr}px Inter, system-ui, sans-serif`
          ctx.fillStyle = `rgba(239,68,68,${xAlpha})`
          ctx.fillText('✗', edgeX, edgeY)
        }
      })

      ctx.textBaseline = 'alphabetic'

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
