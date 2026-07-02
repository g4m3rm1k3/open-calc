import { useEffect, useRef } from 'react'

export default function InfinitePrimesScene() {
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

    // Euclid's proof: assume finite list p1…pN, form N=p1*p2*…*pN+1
    // N is either prime (contradiction) or has a prime factor not in list (contradiction)
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const phase = Math.floor(t / 2800) % 5
      const prog = Math.min(1, (t % 2800) / 2000)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Infinitely Many Primes (Euclid)', cx, 20)

      const PRIMES = [2, 3, 5, 7, 11, 13]

      // Phase 0: show primes
      ctx.font = `bold ${Math.round(h * 0.042)}px system-ui`
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('Assume only finitely many primes: {p₁,…,pₙ}', cx, h * 0.17)

      // Show prime bubbles
      const bubbleY = h * 0.3
      const totalBW = PRIMES.length * 50 + (PRIMES.length - 1) * 10
      PRIMES.forEach((p, i) => {
        const bx = cx - totalBW / 2 + i * 60 + 20
        const revealed = phase > 0 || (phase === 0 && prog > i / PRIMES.length)
        if (!revealed) return
        const glowA = 0.4 + 0.3 * Math.sin(t / 600 + i * 1.2)
        ctx.beginPath(); ctx.arc(bx, bubbleY, 22, 0, Math.PI * 2)
        ctx.fillStyle = dark ? `rgba(99,102,241,${glowA * 0.4})` : `rgba(99,102,241,${glowA * 0.25})`
        ctx.fill()
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#6366f1'; ctx.fillText(p, bx, bubbleY)
      })

      // Phase 1+: form N = product + 1
      if (phase >= 1) {
        const prod = PRIMES.reduce((a, b) => a * b, 1)
        const N = prod + 1  // 30031 — not prime (= 59×509) but illustrates principle
        ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#10b981'
        ctx.fillText(`Form  N = (2×3×5×7×11×13) + 1 = ${prod}+1`, cx, h * 0.44)
        ctx.fillText(`N = ${N}`, cx, h * 0.52)
      }

      // Phase 2: N % each prime = 1 (not divisible)
      if (phase >= 2) {
        ctx.font = `${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
        ctx.fillStyle = '#ef4444'
        ctx.fillText('N ÷ 2 rem 1,  N ÷ 3 rem 1,  …  N ÷ 13 rem 1', cx, h * 0.62)
        ctx.fillText('None of p₁…p₆ divides N !', cx, h * 0.69)
      }

      // Phase 3: contradiction — new prime factor
      if (phase >= 3) {
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.fillStyle = '#f59e0b'
        ctx.fillText('⟹ N has a prime factor NOT in our list', cx, h * 0.77)
      }

      if (phase >= 4) {
        ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText('⊥ Contradiction  ∴ primes are infinite  □', cx, h * 0.87)
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
