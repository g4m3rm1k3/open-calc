import { useEffect, useRef } from 'react'

export default function RegionTruthScene() {
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

    const MODES = [
      { label: 'P ∧ Q', desc: 'intersection only', highlight: 'both' },
      { label: 'P ∨ Q', desc: 'union (A or B)', highlight: 'union' },
      { label: 'P only', desc: 'A \\ B', highlight: 'leftOnly' },
      { label: '¬P', desc: 'outside A', highlight: 'notLeft' },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const mode = Math.floor(t / 2200) % MODES.length
      const { label, desc, highlight } = MODES[mode]

      const cx = w / 2, cy = h * 0.46
      const rx = Math.min(w * 0.2, 85), ry = Math.min(h * 0.32, 85)
      const offset = rx * 0.68

      // Universe
      const pad = 16
      ctx.beginPath()
      ctx.roundRect(pad, h * 0.14, w - pad * 2, h * 0.72, 8)
      if (highlight === 'notLeft') {
        ctx.fillStyle = dark ? 'rgba(243,156,18,0.18)' : 'rgba(243,156,18,0.22)'
      } else {
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'
      }
      ctx.fill()
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke()

      // Left circle (P)
      ctx.beginPath()
      ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
      const fillLeft = (highlight === 'union' || highlight === 'leftOnly' || highlight === 'both')
        ? (dark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)')
        : (dark ? '#1e2d40' : '#e8edf5')
      ctx.fillStyle = fillLeft
      ctx.fill()
      ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.stroke()

      // Right circle (Q)
      ctx.beginPath()
      ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
      const fillRight = (highlight === 'union' || highlight === 'both')
        ? (dark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)')
        : (dark ? '#1e2d40' : '#e8edf5')
      ctx.fillStyle = fillRight
      ctx.fill()
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.stroke()

      // Intersection (highlight if both/union)
      if (highlight === 'both' || highlight === 'union') {
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.clip()
        ctx.beginPath()
        ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = highlight === 'both'
          ? 'rgba(243,156,18,0.55)'
          : (dark ? 'rgba(99,102,241,0.45)' : 'rgba(99,102,241,0.35)')
        ctx.fill()
        ctx.restore()
        // Re-stroke
        ctx.beginPath(); ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.stroke()
        ctx.beginPath(); ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.stroke()
      }

      // For leftOnly: erase intersection from left highlight
      if (highlight === 'leftOnly') {
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.clip()
        ctx.beginPath()
        ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#1e2d40' : '#e8edf5'
        ctx.fill()
        ctx.restore()
        ctx.beginPath(); ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.stroke()
        ctx.beginPath(); ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.stroke()
      }

      // Labels
      ctx.font = `bold ${Math.round(h * 0.065)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#a5b4fc' : '#4338ca'
      ctx.fillText('P', cx - offset * 1.55, cy)
      ctx.fillStyle = dark ? '#6ee7b7' : '#059669'
      ctx.fillText('Q', cx + offset * 1.55, cy)

      // Mode label
      ctx.font = `bold ${Math.round(h * 0.065)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#f39c12'
      ctx.fillText(label, cx, h * 0.16)
      ctx.font = `${Math.round(h * 0.042)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText(desc, cx, h * 0.84)

      // Mode dots
      MODES.forEach((_, i) => {
        ctx.beginPath()
        ctx.arc(cx - (MODES.length - 1) * 8 + i * 16, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === mode ? '#f39c12' : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Truth Tables as Venn Regions', cx, 20)

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
