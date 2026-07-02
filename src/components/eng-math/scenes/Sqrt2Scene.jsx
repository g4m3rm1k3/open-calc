import { useEffect, useRef } from 'react'

const STEPS = [
  { text: 'Assume √2 = p/q', sub: 'in lowest terms (gcd(p,q) = 1)', color: '#f87171' },
  { text: 'Then 2 = p²/q²', sub: 'squaring both sides', color: '#94a3b8' },
  { text: 'So p² = 2q²', sub: 'p² is even', color: '#94a3b8' },
  { text: 'p is even  →  p = 2k', sub: 'if p² is even, p is even', color: '#f87171' },
  { text: '4k² = 2q²  →  q² = 2k²', sub: 'substituting p = 2k', color: '#94a3b8' },
  { text: 'q is also even', sub: 'if q² is even, q is even', color: '#f87171' },
  { text: '⚡ gcd(p,q) ≥ 2', sub: 'but we assumed gcd = 1 !', color: '#fbbf24' },
  { text: '∴  √2 is irrational', sub: 'no rational representation exists', color: '#34d399' },
]

export default function Sqrt2Scene() {
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

    function easeOut(t) { return 1 - Math.pow(1 - Math.min(t, 1), 3) }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const CYCLE = 14000
      const progress = (t % CYCLE) / CYCLE
      const visibleSteps = Math.min(STEPS.length, Math.ceil(progress * (STEPS.length + 0.4)))

      const cols = 2
      const rows = Math.ceil(STEPS.length / cols)
      const margin = 24
      const cellW = (w - margin * (cols + 1)) / cols
      const cellH = Math.min((h - 56) / rows - 6, 52)
      const startY = 44

      for (let i = 0; i < visibleSteps; i++) {
        const step = STEPS[i]
        const col = i % cols
        const row = Math.floor(i / cols)
        const bx = margin + col * (cellW + margin)
        const by = startY + row * (cellH + 8)

        const appear = easeOut(Math.min(1, (progress * (STEPS.length + 0.4) - i) * 4))
        const isNewest = i === visibleSteps - 1
        const flash = (i === 6 && isNewest) ? (0.4 + 0.6 * Math.sin(t * 0.01)) : 0

        ctx.save()
        ctx.globalAlpha = appear
        if (flash > 0) { ctx.shadowColor = step.color; ctx.shadowBlur = 12 * flash }
        ctx.fillStyle = dark ? step.color + '20' : step.color + '14'
        ctx.strokeStyle = step.color
        ctx.lineWidth = isNewest ? 2 : 1.5
        ctx.beginPath(); ctx.roundRect(bx, by, cellW, cellH, 6); ctx.fill(); ctx.stroke()
        ctx.shadowBlur = 0

        // Step number
        ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
        ctx.fillStyle = step.color + '88'
        ctx.fillText(String(i + 1), bx + 6, by + 5)

        // Text
        ctx.font = `bold 11px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = dark ? step.color : step.color
        ctx.fillText(step.text, bx + cellW / 2, by + cellH / 2 - 5)
        ctx.font = '9px system-ui'; ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText(step.sub, bx + cellW / 2, by + cellH / 2 + 9)
        ctx.restore()

        // Arrow to next step (only within same column flow, simplified)
        if (i < visibleSteps - 1 && col === 0 && (i + 1) % cols === 1) {
          // Arrow across columns handled by layout; skip explicit arrows for clarity
        }
      }

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#6366f1'; ctx.textAlign = 'center'
      ctx.fillText('√2 IS IRRATIONAL — Proof by Contradiction', w / 2, 20)
      ctx.globalAlpha = 1

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
