import { useEffect, useRef } from 'react'

export default function OrderedPairScene() {
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

    const PAIRS = [
      { first: 3, second: 7, color1: '#6366f1', color2: '#10b981' },
      { first: 7, second: 3, color1: '#10b981', color2: '#6366f1' },
      { first: 0, second: 0, color1: '#f59e0b', color2: '#f59e0b' },
      { first: -2, second: 5, color1: '#ec4899', color2: '#a855f7' },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2 - 10
      const pairIdx = Math.floor(t / 2000) % PAIRS.length
      const { first, second, color1, color2 } = PAIRS[pairIdx]

      // Main pair display
      const slotW = Math.min(w * 0.2, 80), slotH = Math.min(h * 0.22, 72)
      const slot1X = cx - slotW - 18
      const slot2X = cx + 18

      // Slot 1 (first component)
      ctx.beginPath()
      ctx.roundRect(slot1X, cy - slotH / 2, slotW, slotH, 10)
      ctx.fillStyle = dark ? color1 + '33' : color1 + '22'
      ctx.fill()
      ctx.strokeStyle = color1; ctx.lineWidth = 2.5; ctx.stroke()

      ctx.font = `bold ${Math.round(h * 0.08)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = color1
      ctx.fillText(first, slot1X + slotW / 2, cy - 8)

      ctx.font = `${Math.round(h * 0.036)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('1st', slot1X + slotW / 2, cy + slotH / 2 - 10)

      // Slot 2 (second component)
      ctx.beginPath()
      ctx.roundRect(slot2X, cy - slotH / 2, slotW, slotH, 10)
      ctx.fillStyle = dark ? color2 + '33' : color2 + '22'
      ctx.fill()
      ctx.strokeStyle = color2; ctx.lineWidth = 2.5; ctx.stroke()

      ctx.font = `bold ${Math.round(h * 0.08)}px system-ui`
      ctx.fillStyle = color2
      ctx.fillText(second, slot2X + slotW / 2, cy - 8)

      ctx.font = `${Math.round(h * 0.036)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('2nd', slot2X + slotW / 2, cy + slotH / 2 - 10)

      // Brackets
      ctx.font = `bold ${Math.round(h * 0.16)}px system-ui`
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.textAlign = 'center'
      ctx.fillText('(', slot1X - 14, cy + 5)
      ctx.fillText(')', slot2X + slotW + 14, cy + 5)
      ctx.font = `bold ${Math.round(h * 0.07)}px system-ui`
      ctx.fillText(',', cx, cy + 5)

      // Label
      ctx.font = `bold ${Math.round(h * 0.058)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#f59e0b'
      ctx.fillText(`(${first}, ${second})`, cx, cy + slotH / 2 + 26)

      // Note for (3,7) vs (7,3) pair
      if (pairIdx === 0 || pairIdx === 1) {
        ctx.font = `${Math.round(h * 0.04)}px system-ui`
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        const note = pairIdx === 0
          ? '(3, 7) ≠ (7, 3) — different ordered pairs'
          : 'Same numbers, different ORDER → different pair'
        ctx.fillText(note, cx, cy + slotH / 2 + 46)
      }

      // Mini examples
      const exY = h * 0.82
      ctx.font = `${Math.round(h * 0.04)}px "JetBrains Mono", monospace`
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.fillText('(0, 0)  (−2, 5)  (3, 7)  (7, 3)', cx, exY)

      // Phase dots
      PAIRS.forEach((_, i) => {
        ctx.beginPath()
        ctx.arc(cx - (PAIRS.length - 1) * 8 + i * 16, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === pairIdx ? '#6366f1' : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Ordered Pairs  (a, b)', cx, 20)

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
