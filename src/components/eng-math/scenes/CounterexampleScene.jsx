import { useEffect, useRef } from 'react'

export default function CounterexampleScene() {
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

    // Cycling through 3 "wrong" claims, each killed by one counterexample
    const CLAIMS = [
      {
        claim: 'All squares are positive',
        counter: 'n = 0: 0² = 0 (not positive)',
        color: '#6366f1',
      },
      {
        claim: 'n² > n for all n ∈ ℝ',
        counter: 'n = 0.5: 0.25 < 0.5 ✗',
        color: '#f59e0b',
      },
      {
        claim: 'Every prime is odd',
        counter: 'p = 2: even prime ✗',
        color: '#10b981',
      },
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
      const ci = Math.floor(t / 3200) % CLAIMS.length
      const phase = Math.floor((t % 3200) / 1500)  // 0=claim, 1=counterexample
      const { claim, counter, color } = CLAIMS[ci]

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('One Counterexample Kills a Claim', cx, 20)

      // Claim box
      const claimY = h * 0.36
      ctx.beginPath(); ctx.roundRect(w * 0.1, claimY - h * 0.08, w * 0.8, h * 0.16, 10)
      ctx.fillStyle = dark ? color + '22' : color + '18'; ctx.fill()
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText('Claim:', cx, claimY - h * 0.028)
      ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
      ctx.fillStyle = color
      ctx.fillText(claim, cx, claimY + h * 0.028)

      if (phase >= 1) {
        // Red X stamp
        ctx.font = `bold ${Math.round(h * 0.1)}px system-ui`
        ctx.fillStyle = '#ef4444'
        ctx.globalAlpha = 0.3; ctx.fillText('✗', cx, claimY); ctx.globalAlpha = 1

        // Counterexample
        const ceY = h * 0.64
        ctx.beginPath(); ctx.roundRect(w * 0.1, ceY - h * 0.07, w * 0.8, h * 0.14, 10)
        ctx.fillStyle = dark ? '#ef444422' : '#ef444414'; ctx.fill()
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.fillStyle = '#ef4444'
        ctx.fillText('Counterexample:', cx, ceY - h * 0.024)
        ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
        ctx.fillText(counter, cx, ceY + h * 0.024)

        ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText('Claim disproved! □', cx, h * 0.84)
      }

      // Dots for which claim
      CLAIMS.forEach((_, i) => {
        ctx.beginPath(); ctx.arc(cx - (CLAIMS.length - 1) * 10 + i * 20, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === ci ? CLAIMS[i].color : (dark ? '#334155' : '#cbd5e1'); ctx.fill()
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
