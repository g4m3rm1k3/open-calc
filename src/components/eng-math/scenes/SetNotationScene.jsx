import { useEffect, useRef } from 'react'

const ELEMENTS = [2, 4, 6, 8, 10]

export default function SetNotationScene() {
  const canvasRef = useRef(null)
  const stateRef = useRef({ phase: 0, tick: 0, elementPhase: 0 })
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

    function draw() {
      const ctx = canvas.getContext('2d')
      const W = canvas.width
      const H = canvas.height
      const dpr = window.devicePixelRatio || 1
      const dark = isDark()

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      const s = stateRef.current
      s.tick++

      // Phase 0→1: roster notation; Phase 2→3: set-builder
      const cycleTicks = 200
      const phase = Math.floor(s.tick / cycleTicks) % 2

      const cx = W / 2
      const cy = H / 2

      // Title
      ctx.font = `bold ${13 * dpr}px Inter, system-ui, sans-serif`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.textAlign = 'center'
      ctx.fillText(phase === 0 ? 'ROSTER NOTATION' : 'SET-BUILDER NOTATION', cx, cy - 90 * dpr)

      if (phase === 0) {
        // Roster: {2, 4, 6, 8, 10}
        const elapsed = s.tick % cycleTicks
        const visibleCount = Math.min(ELEMENTS.length, Math.floor((elapsed / cycleTicks) * (ELEMENTS.length + 1)))

        const bracketColor = dark ? '#818cf8' : '#4f46e5'
        const numColor = dark ? '#e2e8f0' : '#1e293b'
        const commaColor = dark ? '#64748b' : '#94a3b8'

        ctx.font = `bold ${22 * dpr}px 'JetBrains Mono', monospace`
        ctx.textAlign = 'center'

        // Build the string up to visibleCount
        let parts = ['{']
        for (let i = 0; i < ELEMENTS.length; i++) {
          if (i < visibleCount) {
            parts.push(String(ELEMENTS[i]))
            if (i < ELEMENTS.length - 1 && i < visibleCount - 1) parts.push(', ')
          }
        }
        if (visibleCount >= ELEMENTS.length) parts.push('}')

        // Draw each part with color
        ctx.textAlign = 'left'
        let x = cx - 110 * dpr

        for (const p of parts) {
          if (p === '{' || p === '}') {
            ctx.fillStyle = bracketColor
          } else if (p === ', ') {
            ctx.fillStyle = commaColor
          } else {
            ctx.fillStyle = numColor
          }
          ctx.fillText(p, x, cy - 10 * dpr)
          x += ctx.measureText(p).width
        }

        // Label below
        ctx.font = `${11 * dpr}px Inter, system-ui, sans-serif`
        ctx.fillStyle = dark ? '#475569' : '#94a3b8'
        ctx.textAlign = 'center'
        ctx.fillText('List each element explicitly', cx, cy + 30 * dpr)
        ctx.fillText('Unordered · Each element once', cx, cy + 48 * dpr)
      } else {
        // Set-builder: {x : x ∈ ℕ, x is even, x ≤ 10}
        const lineColor = dark ? '#818cf8' : '#4f46e5'
        const textColor = dark ? '#e2e8f0' : '#1e293b'
        const dimColor = dark ? '#475569' : '#94a3b8'

        ctx.textAlign = 'center'
        ctx.font = `${16 * dpr}px 'JetBrains Mono', monospace`
        ctx.fillStyle = lineColor
        ctx.fillText('{  x  :  property of x  }', cx, cy - 20 * dpr)

        // Annotation arrows
        ctx.font = `${11 * dpr}px Inter, system-ui, sans-serif`
        ctx.fillStyle = dimColor

        // x arrow
        const elapsed2 = s.tick % cycleTicks
        if (elapsed2 > 30) {
          ctx.fillText('← the variable', cx - 60 * dpr, cy + 20 * dpr)
        }
        if (elapsed2 > 70) {
          ctx.fillText('"such that" →', cx + 20 * dpr, cy + 20 * dpr)
        }
        if (elapsed2 > 110) {
          ctx.fillStyle = textColor
          ctx.font = `${13 * dpr}px Inter, system-ui, sans-serif`
          ctx.fillText('{ x  :  x ∈ ℕ,  x is even,  x ≤ 10 }', cx, cy + 55 * dpr)
          ctx.font = `${11 * dpr}px Inter, system-ui, sans-serif`
          ctx.fillStyle = dimColor
          ctx.fillText('= { 2, 4, 6, 8, 10 }', cx, cy + 78 * dpr)
        }
      }

      // Mode indicator dots
      const dotY = cy + 110 * dpr
      for (let i = 0; i < 2; i++) {
        ctx.beginPath()
        ctx.arc(cx + (i - 0.5) * 20 * dpr, dotY, 4 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = i === phase
          ? (dark ? '#818cf8' : '#4f46e5')
          : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      }

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
