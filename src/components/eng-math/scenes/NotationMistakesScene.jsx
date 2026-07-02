import { useEffect, useRef } from 'react'

export default function NotationMistakesScene() {
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

    const MISTAKES = [
      { wrong: 'x ∈ {1,2,3} ∈ A', fix: 'x ∈ {1,2,3} ⊆ A', note: '∈ is element-of, not subset' },
      { wrong: 'f(x) = y ⇒ f⁻¹(y) always', fix: 'f⁻¹ exists only if f is bijective', note: 'Inverse needs bijection' },
      { wrong: '∀x P(x) ∧ Q(x) → y', fix: '(∀x P(x)) ∧ (∀x Q(x)) → y', note: 'Quantifier scope matters' },
      { wrong: 'n = n + 1 (assume n=∞)', fix: 'ℕ has no element ∞; avoid informal ∞', note: '∞ is not a real number' },
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
      const mi = Math.floor(t / 3200) % MISTAKES.length
      const { wrong, fix, note } = MISTAKES[mi]
      const phase = Math.floor((t % 3200) / 1400)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Common Notation Mistakes', cx, 20)

      // Wrong card
      const cW = w * 0.78, cH = h * 0.18
      const cX = cx - cW / 2
      const wrongY = h * 0.3

      ctx.beginPath(); ctx.roundRect(cX, wrongY, cW, cH, 10)
      ctx.fillStyle = dark ? '#ef444422' : '#ef444410'; ctx.fill()
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = `bold ${Math.round(h * 0.04)}px system-ui`
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillStyle = '#ef4444'; ctx.fillText('✗ Wrong:', cX + 12, wrongY + 10)
      ctx.font = `bold ${Math.round(h * 0.046)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#fca5a5' : '#b91c1c'
      ctx.fillText(wrong, cx, wrongY + cH * 0.65)

      // Strikethrough
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5
      const tw = ctx.measureText(wrong).width
      ctx.beginPath(); ctx.moveTo(cx - tw / 2, wrongY + cH * 0.65); ctx.lineTo(cx + tw / 2, wrongY + cH * 0.65 + 2); ctx.stroke()

      if (phase >= 1) {
        // Fix card
        const fixY = h * 0.56
        ctx.beginPath(); ctx.roundRect(cX, fixY, cW, cH, 10)
        ctx.fillStyle = dark ? '#22c55e22' : '#22c55e10'; ctx.fill()
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.04)}px system-ui`
        ctx.textAlign = 'left'; ctx.textBaseline = 'top'
        ctx.fillStyle = '#22c55e'; ctx.fillText('✓ Correct:', cX + 12, fixY + 10)
        ctx.font = `bold ${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = dark ? '#86efac' : '#15803d'
        ctx.fillText(fix, cx, fixY + cH * 0.65)
      }

      ctx.font = `${Math.round(h * 0.038)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f59e0b'
      ctx.fillText(`Note: ${note}`, cx, h * 0.82)

      MISTAKES.forEach((_, i) => {
        ctx.beginPath(); ctx.arc(cx - (MISTAKES.length - 1) * 10 + i * 20, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === mi ? '#6366f1' : (dark ? '#334155' : '#cbd5e1'); ctx.fill()
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
