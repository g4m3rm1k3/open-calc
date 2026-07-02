import { useEffect, useRef } from 'react'

export default function ReadingProofScene() {
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

    // Annotated proof reading — highlight each step with annotation
    const STEPS = [
      { text: 'Theorem: √2 is irrational.', kind: 'claim', color: '#6366f1', note: 'State what we prove' },
      { text: 'Proof: Suppose √2 = p/q (reduced).', kind: 'assume', color: '#f59e0b', note: 'Proof by contradiction: assume opposite' },
      { text: 'Then 2 = p²/q²  →  p² = 2q².', kind: 'algebra', color: '#10b981', note: 'Algebraic manipulation' },
      { text: '∴ p² is even  →  p is even.', kind: 'lemma', color: '#a855f7', note: 'Use the Even Lemma' },
      { text: 'Write p = 2k, then 4k² = 2q²  →  q² = 2k².', kind: 'algebra', color: '#10b981', note: 'Substitute back in' },
      { text: '∴ q is even  →  gcd(p,q) ≥ 2.  ⊥', kind: 'contradiction', color: '#ef4444', note: 'Contradicts "reduced"' },
      { text: '∴ √2 ∉ ℚ.  □', kind: 'conclusion', color: '#22c55e', note: 'Conclude and close' },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const activeStep = Math.floor(t / 1600) % STEPS.length

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Reading a Proof (Step by Step)', cx, 20)

      const startY = h * 0.12
      const stepH = (h * 0.72) / STEPS.length

      STEPS.forEach((s, i) => {
        const sy = startY + i * stepH + stepH / 2
        const isActive = i === activeStep
        const isPast = i < activeStep

        // Row background for active
        if (isActive) {
          ctx.beginPath(); ctx.roundRect(8, sy - stepH * 0.45, w - 16, stepH * 0.9, 6)
          ctx.fillStyle = dark ? s.color + '22' : s.color + '14'; ctx.fill()
          ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.stroke()
        }

        // Kind label
        ctx.font = `bold ${Math.round(h * 0.032)}px system-ui`
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillStyle = isActive ? s.color : (dark ? '#334155' : '#e2e8f0')
        ctx.fillText(`[${s.kind}]`, 14, sy)

        // Step text
        ctx.font = `${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'left'
        ctx.fillStyle = isActive ? s.color : (isPast ? (dark ? '#475569' : '#94a3b8') : (dark ? '#1e293b' : '#e2e8f0'))
        ctx.fillText(s.text, w * 0.16, sy)

        // Annotation (right side, only active)
        if (isActive) {
          ctx.font = `${Math.round(h * 0.034)}px system-ui`
          ctx.textAlign = 'right'
          ctx.fillStyle = s.color
          ctx.fillText(`← ${s.note}`, w - 10, sy)
        }
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
