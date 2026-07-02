import { useEffect, useRef } from 'react'

// Nested number sets: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ
// Displayed as concentric ovals with example elements in each annular region

const LAYERS = [
  { sym: 'ℂ', name: 'Complex', color: '#94a3b8', examples: ['2+3i', 'i'] },
  { sym: 'ℝ', name: 'Real',    color: '#a78bfa', examples: ['π', '√2', 'e'] },
  { sym: 'ℚ', name: 'Rational',color: '#60a5fa', examples: ['½', '¾', '−⅓'] },
  { sym: 'ℤ', name: 'Integer', color: '#34d399', examples: ['−2', '−1'] },
  { sym: 'ℕ', name: 'Natural', color: '#fbbf24', examples: ['1', '2', '3'] },
]

export default function NumberSets() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let rafId
    let w, h

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function easeOut(t) { return 1 - Math.pow(1 - Math.min(t, 1), 3) }

    function draw(t) {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h * 0.48
      const maxRx = Math.min(w * 0.42, 195)
      const maxRy = maxRx * 0.52

      // Cycle: highlight one layer every 2s
      const cycleT = 10000 // full cycle time
      const phase = (t % cycleT) / cycleT
      const highlightIdx = Math.floor(phase * LAYERS.length)

      // Draw layers outside-in (so inner ovals cover outer fill)
      for (let i = 0; i < LAYERS.length; i++) {
        const frac = (i + 1) / LAYERS.length
        const rx = maxRx * frac
        const ry = maxRy * frac
        const layer = LAYERS[i]
        const appear = easeOut(Math.min(1, (t - i * 250) / 500))

        if (appear <= 0) continue

        ctx.save()
        ctx.globalAlpha = appear

        // Fill
        const isHighlighted = i === highlightIdx
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = isHighlighted ? `${layer.color}22` : `${layer.color}0a`
        ctx.fill()
        ctx.strokeStyle = layer.color
        ctx.lineWidth = isHighlighted ? 2.5 : 1.5
        ctx.globalAlpha = appear * (isHighlighted ? 1 : 0.55)
        ctx.stroke()
        ctx.restore()

        // Symbol label at top-right of oval
        ctx.save()
        ctx.globalAlpha = appear * (isHighlighted ? 1 : 0.6)
        ctx.font = `bold ${isHighlighted ? 16 : 13}px system-ui`
        ctx.fillStyle = layer.color
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(layer.sym, cx + rx - 6, cy - ry + 14)
        ctx.restore()
      }

      // Example elements in each annular region
      for (let i = 0; i < LAYERS.length; i++) {
        const layer = LAYERS[i]
        const appear = easeOut(Math.min(1, (t - i * 250 - 300) / 500))
        if (appear <= 0) continue

        const frac = (i + 1) / LAYERS.length
        const innerFrac = i / LAYERS.length

        // Place examples in the annular region between this oval and the next inner oval
        const midFrac = (frac + innerFrac) / 2
        const rx = maxRx * midFrac
        const ry = maxRy * midFrac

        const isHighlighted = i === highlightIdx

        ctx.save()
        ctx.globalAlpha = appear * (isHighlighted ? 1 : 0.45)
        ctx.font = `${isHighlighted ? 'bold ' : ''}12px "JetBrains Mono", monospace`
        ctx.fillStyle = layer.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const exs = layer.examples
        for (let j = 0; j < exs.length; j++) {
          const angle = (Math.PI * 0.4) + (j / (exs.length - 1 || 1)) * Math.PI * 1.2
          const ex = cx + rx * Math.cos(angle) * 0.72
          const ey = cy + ry * Math.sin(angle) * 0.72
          ctx.fillText(exs[j], ex, ey)
        }
        ctx.restore()
      }

      // Highlighted layer callout
      const hl = LAYERS[highlightIdx]
      if (hl) {
        const callAlpha = easeOut(Math.min(1, ((t % (cycleT / LAYERS.length)) / 200)))
        ctx.save()
        ctx.globalAlpha = callAlpha
        ctx.textAlign = 'center'
        ctx.font = 'bold 14px system-ui'
        ctx.fillStyle = hl.color
        ctx.fillText(`${hl.sym} — ${hl.name} Numbers`, cx, h - 44)
        ctx.font = '11px "JetBrains Mono", monospace'
        ctx.fillStyle = '#64748b'
        ctx.fillText(`Examples: ${hl.examples.join(', ')}`, cx, h - 24)
        ctx.restore()
      }

      // Chain: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ at bottom
      ctx.textAlign = 'center'
      ctx.font = '12px "JetBrains Mono", monospace'
      ctx.fillStyle = '#334155'
      ctx.fillText('ℕ  ⊊  ℤ  ⊊  ℚ  ⊊  ℝ  ⊊  ℂ', cx, h - 10)

      // Title
      ctx.globalAlpha = 0.8
      ctx.font = 'bold 12px system-ui'
      ctx.fillStyle = '#4f46e5'
      ctx.fillText('NUMBER SETS', w / 2, 22)
      ctx.globalAlpha = 1
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      draw(ts - start)
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
