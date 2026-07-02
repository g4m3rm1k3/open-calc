import { useEffect, useRef } from 'react'

export default function NegationScene() {
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

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // Flip every 1.8s
      const phase = Math.floor(t / 1800) % 2
      const flipProgress = ((t % 1800) / 200) // 0..9 (clamp to 0..1 for flip anim)
      const flip = Math.min(1, flipProgress)
      const scaleX = Math.abs(Math.cos(flip * Math.PI))

      const cx = w / 2, cy = h / 2

      // Two examples side by side
      const examples = [
        { p: true, label: 'P = TRUE' },
        { p: false, label: 'P = FALSE' },
      ]

      const cardW = Math.min(w * 0.32, 110)
      const cardH = Math.min(h * 0.38, 120)
      const gap = Math.min(w * 0.08, 30)

      examples.forEach((ex, col) => {
        const cardX = cx - gap / 2 - cardW + col * (cardW + gap)
        const cardCX = cardX + cardW / 2
        const cardCY = cy - 15

        // Apply flip transform centered on card
        const localPhase = phase
        const pVal = ex.p
        const negVal = !ex.p

        // Show P card or ¬P card based on phase
        const showingP = localPhase === 0
        const val = showingP ? pVal : negVal
        const label = showingP ? (pVal ? 'TRUE' : 'FALSE') : (negVal ? 'TRUE' : 'FALSE')
        const symbol = showingP ? 'P' : '¬P'
        const color = val
          ? (dark ? '#22c55e' : '#16a34a')
          : (dark ? '#ef4444' : '#dc2626')
        const bg = val
          ? (dark ? '#14532d' : '#dcfce7')
          : (dark ? '#450a0a' : '#fee2e2')

        // Card
        ctx.save()
        ctx.translate(cardCX, cardCY)
        ctx.scale(scaleX < 0.1 ? 0.1 : scaleX, 1)
        ctx.translate(-cardCX, -cardCY)
        ctx.beginPath()
        ctx.roundRect(cardX, cardCY - cardH / 2, cardW, cardH, 10)
        ctx.fillStyle = bg
        ctx.fill()
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Symbol
        ctx.font = `bold ${Math.round(cardH * 0.3)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        ctx.fillText(symbol, cardCX, cardCY - 14)

        // Value
        ctx.font = `bold ${Math.round(cardH * 0.22)}px system-ui`
        ctx.fillStyle = color
        ctx.fillText(label, cardCX, cardCY + cardH * 0.22)
        ctx.restore()

        // Arrow label below
        ctx.font = `${Math.round(h * 0.038)}px system-ui`
        ctx.textAlign = 'center'
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText(ex.label, cardCX, cardCY + cardH / 2 + 16)
      })

      // NOT symbol between cards
      ctx.font = `bold ${Math.round(h * 0.1)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#f59e0b' : '#d97706'
      ctx.fillText('¬', cx, cy - 15)

      // Rule at bottom
      ctx.font = `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText('¬(TRUE) = FALSE    ¬(FALSE) = TRUE', cx, cy + cardH / 2 + 34)

      // Title
      ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Negation  ¬P', cx, 20)

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
