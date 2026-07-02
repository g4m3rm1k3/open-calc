import { useEffect, useRef } from 'react'

// Two laws cycling:
// Law 1: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ
// Law 2: (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ

const LAWS = [
  { left: '(A ∪ B)ᶜ', right: 'Aᶜ ∩ Bᶜ', law: 'Law 1' },
  { left: '(A ∩ B)ᶜ', right: 'Aᶜ ∪ Bᶜ', law: 'Law 2' },
]

export default function DeMorganScene() {
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

    function drawMiniVenn(cx, cy, r, highlightMode, dark) {
      // highlightMode: 'complement-union' | 'complement-intersection' | 'Ac-inter-Bc' | 'Ac-union-Bc'
      const off = r * 0.55
      const ax = cx - off, bx = cx + off
      const uw = r * 3, uh = r * 2.1

      // Universe rect
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1
      ctx.strokeRect(cx - uw / 2, cy - uh / 2, uw, uh)

      // Shade based on mode
      if (highlightMode === 'complement-union') {
        // Shade everything OUTSIDE A∪B (inside universe rect, outside both circles)
        ctx.save()
        ctx.fillStyle = dark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.25)'
        ctx.fillRect(cx - uw / 2, cy - uh / 2, uw, uh)
        // Cut out A
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      } else if (highlightMode === 'Ac-inter-Bc') {
        // Shade Aᶜ (everything except A) then ∩ Bᶜ (everything except B)
        // = shade rectangle, unshade both circles
        ctx.save()
        ctx.fillStyle = dark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.25)'
        ctx.fillRect(cx - uw / 2, cy - uh / 2, uw, uh)
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      } else if (highlightMode === 'complement-intersection') {
        // Shade everything outside A∩B (inside rect, not in intersection)
        ctx.save()
        ctx.fillStyle = dark ? 'rgba(52,211,153,0.30)' : 'rgba(5,150,105,0.20)'
        ctx.fillRect(cx - uw / 2, cy - uh / 2, uw, uh)
        ctx.globalCompositeOperation = 'destination-out'
        // Cut out intersection (approximate with clipping)
        ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2); ctx.clip()
        ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      } else if (highlightMode === 'Ac-union-Bc') {
        // Shade Aᶜ ∪ Bᶜ = everything except the intersection
        ctx.save()
        ctx.fillStyle = dark ? 'rgba(52,211,153,0.30)' : 'rgba(5,150,105,0.20)'
        ctx.fillRect(cx - uw / 2, cy - uh / 2, uw, uh)
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2); ctx.clip()
        ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }

      // Circles
      ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = dark ? '#10b981' : '#059669'; ctx.stroke()

      // Labels
      ctx.font = `bold ${Math.round(r * 0.28)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      ctx.fillText('A', ax - r + 3, cy - r - 6)
      ctx.fillStyle = dark ? '#34d399' : '#047857'
      ctx.fillText('B', bx + r - 3, cy - r - 6)
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const PERIOD = 10000
      const lawIdx = Math.floor((t % PERIOD) / PERIOD * LAWS.length)
      const law = LAWS[lawIdx]
      const textColor = dark ? '#e2e8f0' : '#1e293b'
      const dimColor = dark ? '#94a3b8' : '#64748b'
      const accentColor = law.law === 'Law 1'
        ? (dark ? '#a78bfa' : '#7c3aed')
        : (dark ? '#34d399' : '#047857')

      const r = Math.min(w * 0.14, 55)
      const panelW = w * 0.42
      const lx = w * 0.25, rx = w * 0.75
      const cy = h * 0.46

      // Left panel (LHS)
      const lhsMode = lawIdx === 0 ? 'complement-union' : 'complement-intersection'
      drawMiniVenn(lx, cy, r, lhsMode, dark)

      // Right panel (RHS)
      const rhsMode = lawIdx === 0 ? 'Ac-inter-Bc' : 'Ac-union-Bc'
      drawMiniVenn(rx, cy, r, rhsMode, dark)

      // "=" sign
      ctx.font = 'bold 24px system-ui'
      ctx.fillStyle = accentColor
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('=', w / 2, cy)

      // Labels below each panel
      ctx.font = 'bold 13px "JetBrains Mono", monospace'
      ctx.fillStyle = accentColor
      ctx.fillText(law.left, lx, cy + r + 26)
      ctx.fillText(law.right, rx, cy + r + 26)

      // Law label at top
      ctx.font = `bold 14px system-ui`
      ctx.fillStyle = accentColor
      ctx.fillText(`De Morgan's ${law.law}`, w / 2, h - 36)

      // Explanation
      ctx.font = '11px system-ui'
      ctx.fillStyle = dimColor
      const desc = lawIdx === 0
        ? 'Shaded regions are identical: NOT (A or B) ≡ (NOT A) AND (NOT B)'
        : 'Shaded regions are identical: NOT (A and B) ≡ (NOT A) OR (NOT B)'
      ctx.fillText(desc, w / 2, h - 18)

      // Title
      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('DE MORGAN\'S LAWS', w / 2, 20)
      ctx.globalAlpha = 1

      // Dots
      for (let i = 0; i < 2; i++) {
        ctx.beginPath()
        ctx.arc(w / 2 + (i - 0.5) * 16, h - 8, i === lawIdx ? 4 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = i === lawIdx ? accentColor : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
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
