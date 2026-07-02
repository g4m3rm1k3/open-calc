import { useEffect, useRef } from 'react'

const MODES = [
  { label: 'A ∪ B', name: 'Union',        desc: 'everything in A or B' },
  { label: 'A ∩ B', name: 'Intersection', desc: 'only what is in both' },
  { label: 'A \\ B', name: 'Difference',  desc: 'in A but not in B' },
  { label: 'Aᶜ',   name: 'Complement',   desc: 'everything outside A' },
]

export default function SetOperationsScene() {
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

    function drawVenn(cx, cy, r, mode, alpha) {
      const dark = document.documentElement.classList.contains('dark')
      const off = r * 0.55
      const ax = cx - off, bx = cx + off

      ctx.save()
      ctx.globalAlpha = alpha

      // Universal set rectangle (for complement)
      const uw = r * 3.2, uh = r * 2.2
      if (mode === 3) {
        ctx.fillStyle = dark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.12)'
        ctx.fillRect(cx - uw / 2, cy - uh / 2, uw, uh)
      }

      // Circle A fill
      const fillA = mode === 0 || mode === 2 ? (dark ? 'rgba(99,102,241,0.30)' : 'rgba(99,102,241,0.22)') : 'rgba(99,102,241,0.06)'
      ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = fillA; ctx.fill()

      // Circle B fill
      const fillB = mode === 0 ? (dark ? 'rgba(16,185,129,0.30)' : 'rgba(16,185,129,0.22)') : 'rgba(16,185,129,0.06)'
      ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = fillB; ctx.fill()

      // Intersection highlight
      if (mode === 1) {
        ctx.save()
        ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2); ctx.clip()
        ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = dark ? 'rgba(167,139,250,0.50)' : 'rgba(124,58,237,0.30)'
        ctx.fill(); ctx.restore()
      }

      // Remove intersection for difference (A\B keeps A only, remove overlap)
      if (mode === 2) {
        ctx.save()
        ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2); ctx.clip()
        ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
        ctx.fill(); ctx.restore()
      }

      // Circle strokes
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(ax, cy, r, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = dark ? '#10b981' : '#059669'
      ctx.beginPath(); ctx.arc(bx, cy, r, 0, Math.PI * 2); ctx.stroke()

      // Labels
      ctx.font = 'bold 15px system-ui'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      ctx.fillText('A', ax - r + 4, cy - r - 12)
      ctx.fillStyle = dark ? '#34d399' : '#047857'
      ctx.fillText('B', bx + r - 4, cy - r - 12)

      ctx.restore()
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const PERIOD = 14000
      const phase = (t % PERIOD) / PERIOD
      const modeIdx = Math.floor(phase * MODES.length)
      const modeT = (phase * MODES.length) % 1

      const r = Math.min(w * 0.22, 90)
      const cx = w / 2, cy = h * 0.46

      drawVenn(cx, cy, r, modeIdx, easeOut(modeT * 6))

      // Mode label
      const mode = MODES[modeIdx]
      ctx.textAlign = 'center'
      ctx.font = 'bold 28px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#c4b5fd' : '#7c3aed'
      ctx.fillText(mode.label, cx, cy + r + 44)
      ctx.font = '13px system-ui'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText(mode.desc, cx, cy + r + 68)

      // Progress dots
      const dotY = h - 22
      for (let i = 0; i < MODES.length; i++) {
        ctx.beginPath()
        ctx.arc(cx + (i - 1.5) * 18, dotY, i === modeIdx ? 5 : 3, 0, Math.PI * 2)
        ctx.fillStyle = i === modeIdx ? (dark ? '#a78bfa' : '#7c3aed') : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      }

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.textAlign = 'center'
      ctx.fillText('SET OPERATIONS', w / 2, 20)
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
