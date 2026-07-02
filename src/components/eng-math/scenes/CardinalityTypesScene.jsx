import { useEffect, useRef } from 'react'

export default function CardinalityTypesScene() {
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

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      // Three rows showing how |A| vs |B| constrains types
      const RULES = [
        { cond: '|A| < |B|', types: 'Can be injective, not surjective', color: '#6366f1', inj: true, sur: false },
        { cond: '|A| = |B|', types: 'Injective ↔ Surjective ↔ Bijective', color: '#f59e0b', inj: true, sur: true },
        { cond: '|A| > |B|', types: 'Can be surjective, not injective', color: '#10b981', inj: false, sur: true },
      ]

      const rowH = (h * 0.68) / 3
      const startY = h * 0.18

      RULES.forEach((rule, i) => {
        const ry = startY + i * rowH + rowH / 2
        const animOffset = (t / 800 - i * 0.4)
        const show = animOffset > 0

        // Row background
        ctx.beginPath()
        ctx.roundRect(16, ry - rowH * 0.42, w - 32, rowH * 0.84, 8)
        ctx.fillStyle = dark ? rule.color + '14' : rule.color + '0e'
        ctx.fill()
        ctx.strokeStyle = rule.color + '44'; ctx.lineWidth = 1; ctx.stroke()

        // Condition
        ctx.font = `bold ${Math.round(h * 0.054)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillStyle = rule.color
        ctx.fillText(rule.cond, 28, ry - 10)

        // Type badges
        ctx.font = `bold ${Math.round(h * 0.038)}px system-ui`
        ;[
          { label: 'INJ', val: rule.inj },
          { label: 'SUR', val: rule.sur },
          { label: 'BIJ', val: rule.inj && rule.sur },
        ].forEach((b, bi) => {
          const bx = 28 + bi * 64
          const by = ry + 12
          const col = b.val ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
          ctx.beginPath(); ctx.roundRect(bx, by - 10, 52, 20, 4)
          ctx.fillStyle = col + '28'; ctx.fill()
          ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke()
          ctx.fillStyle = col; ctx.fillText(b.val ? '✓ ' + b.label : '✗ ' + b.label, bx + 4, by)
        })

        // Description
        ctx.font = `${Math.round(h * 0.036)}px system-ui`
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText(rule.types, w - 28, ry - 10)
      })

      // Key insight
      ctx.font = `bold ${Math.round(h * 0.045)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('Bijection ⟺ |A| = |B|  (finite sets)', cx, h * 0.9)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Cardinality and Function Types', cx, 22)

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
