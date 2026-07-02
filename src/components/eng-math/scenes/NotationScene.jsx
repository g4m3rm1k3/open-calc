import { useEffect, useRef } from 'react'

const SYMBOLS = [
  { sym: '∀', name: 'For all (universal)', ex: '∀x ∈ ℝ, x² ≥ 0', color: '#6366f1' },
  { sym: '∃', name: 'There exists (existential)', ex: '∃x ∈ ℝ : x² = 2', color: '#10b981' },
  { sym: '∈', name: 'Element of', ex: '3 ∈ {1, 2, 3, 4}', color: '#f59e0b' },
  { sym: '∉', name: 'Not an element of', ex: '5 ∉ {1, 2, 3, 4}', color: '#ec4899' },
  { sym: '⊆', name: 'Subset or equal', ex: '{1,2} ⊆ {1,2,3}', color: '#a78bfa' },
  { sym: '⊂', name: 'Proper subset', ex: '{1,2} ⊂ {1,2,3}', color: '#60a5fa' },
  { sym: '∪', name: 'Union', ex: '{1,2} ∪ {2,3} = {1,2,3}', color: '#34d399' },
  { sym: '∩', name: 'Intersection', ex: '{1,2} ∩ {2,3} = {2}', color: '#f87171' },
  { sym: '∅', name: 'Empty set', ex: '{x : x ≠ x} = ∅', color: '#94a3b8' },
  { sym: 'ℕ', name: 'Natural numbers', ex: 'ℕ = {1, 2, 3, …}', color: '#fbbf24' },
  { sym: 'ℤ', name: 'Integers', ex: 'ℤ = {…, -1, 0, 1, …}', color: '#818cf8' },
  { sym: 'ℝ', name: 'Real numbers', ex: 'π, √2, -3/4 ∈ ℝ', color: '#67e8f9' },
  { sym: '⇒', name: 'Implies', ex: 'P ⇒ Q  (if P then Q)', color: '#f97316' },
  { sym: '⟺', name: 'If and only if', ex: 'P ⟺ Q  (P iff Q)', color: '#c084fc' },
  { sym: '∑', name: 'Summation', ex: '∑(i=1 to n) i = n(n+1)/2', color: '#22d3ee' },
  { sym: '∏', name: 'Product', ex: '∏(i=1 to n) i = n!', color: '#86efac' },
  { sym: '¬', name: 'Logical NOT', ex: '¬P  (not P)', color: '#fda4af' },
  { sym: '∧', name: 'Logical AND', ex: 'P ∧ Q  (P and Q)', color: '#93c5fd' },
]

const VISIBLE = 4  // symbols visible at once

export default function NotationScene() {
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

      const ITEM_PERIOD = 2200
      const globalOffset = (t / ITEM_PERIOD) % SYMBOLS.length
      const startIdx = Math.floor(globalOffset)
      const scroll = globalOffset - startIdx  // 0..1 scroll progress

      const cardH = Math.min((h - 64) / VISIBLE - 4, 80)
      const cardW = w - 32
      const cardX = 16
      const startY = 36

      for (let slot = -1; slot <= VISIBLE; slot++) {
        const symIdx = (startIdx + slot) % SYMBOLS.length
        const sym = SYMBOLS[(symIdx + SYMBOLS.length) % SYMBOLS.length]
        const baseY = startY + (slot - scroll) * (cardH + 4)

        if (baseY < -cardH || baseY > h) continue

        const progress = Math.max(0, Math.min(1, (baseY + cardH) / (cardH * 0.6)))
        const alpha = easeOut(Math.min(1, progress)) * Math.min(1, (h - baseY) / (cardH * 0.5))

        ctx.save()
        ctx.globalAlpha = alpha

        // Card
        ctx.fillStyle = dark ? sym.color + '16' : sym.color + '10'
        ctx.strokeStyle = sym.color + (alpha > 0.8 ? 'cc' : '44')
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(cardX, baseY, cardW, cardH, 8); ctx.fill(); ctx.stroke()

        // Symbol
        ctx.font = `bold ${Math.round(cardH * 0.50)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillStyle = dark ? sym.color : sym.color
        ctx.fillText(sym.sym, cardX + 14, baseY + cardH * 0.38)

        // Name
        const symWidth = ctx.measureText(sym.sym).width
        ctx.font = `bold ${Math.round(cardH * 0.17)}px system-ui`
        ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
        ctx.fillText(sym.name, cardX + 14 + symWidth + 12, baseY + cardH * 0.28)

        // Example
        ctx.font = `${Math.round(cardH * 0.15)}px "JetBrains Mono", monospace`
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText(sym.ex, cardX + 14 + symWidth + 12, baseY + cardH * 0.55)

        ctx.restore()
      }

      // Progress indicator
      const total = SYMBOLS.length
      const barW = w - 40
      ctx.strokeStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(20, h - 14); ctx.lineTo(20 + barW, h - 14); ctx.stroke()
      ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(20, h - 14); ctx.lineTo(20 + barW * (globalOffset / total), h - 14); ctx.stroke()

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#6366f1'; ctx.textAlign = 'center'
      ctx.fillText('MATHEMATICAL NOTATION REFERENCE', w / 2, 20)
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
