import { useEffect, useRef } from 'react'

export default function EvenLemmaScene() {
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

    // Lemma: n² even ⟹ n even. Proof by contrapositive: n odd ⟹ n² odd
    // n=2k+1 ⟹ n²=4k²+4k+1=2(2k²+2k)+1 odd
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const phase = Math.floor(t / 2600) % 4
      const prog = Math.min(1, (t % 2600) / 1800)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('The Even Lemma', cx, 20)

      // Claim
      ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
      ctx.fillStyle = '#6366f1'
      ctx.fillText('Claim: n² even  ⟹  n even', cx, h * 0.16)

      // Strategy
      if (prog > 0.15) {
        ctx.font = `${Math.round(h * 0.04)}px system-ui`
        ctx.fillStyle = '#f59e0b'
        ctx.fillText('Strategy: prove contrapositive  n odd ⟹ n² odd', cx, h * 0.25)
      }

      // Algebra steps
      const steps = [
        { text: 'Let n be odd:  n = 2k + 1', color: '#10b981', thresh: 0 },
        { text: 'n² = (2k+1)² = 4k²+4k+1', color: '#6366f1', thresh: 0.25 },
        { text: 'n² = 2(2k²+2k) + 1', color: '#a855f7', thresh: 0.5 },
        { text: '∴ n² is odd  ✓', color: '#22c55e', thresh: 0.75 },
      ]

      const stepsShown = phase < 1 ? 0 : phase === 1 ? 1 : phase === 2 ? 2 : phase === 3 ? 4 : 0

      steps.slice(0, stepsShown).forEach((s, i) => {
        ctx.font = `bold ${Math.round(h * 0.046)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = s.color
        ctx.fillText(s.text, cx, h * 0.38 + i * h * 0.11)
      })
      // Animate current step
      if (stepsShown < steps.length && phase >= 1) {
        const s = steps[stepsShown]
        ctx.globalAlpha = prog
        ctx.font = `bold ${Math.round(h * 0.046)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = s.color
        ctx.fillText(s.text, cx, h * 0.38 + stepsShown * h * 0.11)
        ctx.globalAlpha = 1
      }

      // Number examples on the right
      const exW = w * 0.18, exX = w * 0.82
      const ODD = [1, 3, 5, 7]
      ODD.forEach((n, i) => {
        const ey = h * 0.35 + i * h * 0.13
        ctx.font = `${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#f59e0b'
        ctx.fillText(`${n}² = ${n * n} (odd)`, exX, ey)
      })

      // Conclusion
      if (phase >= 3 && prog > 0.6) {
        ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
        ctx.textAlign = 'center'
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText('Contrapositive proved ⟹ original holds  □', cx, h * 0.86)
      }

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
