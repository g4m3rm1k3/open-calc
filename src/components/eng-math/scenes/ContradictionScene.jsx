import { useEffect, useRef } from 'react'

// Flow: Assume ¬P → Logic chain → Derive P → CONTRADICTION → Therefore P

const STEPS = [
  { text: 'Assume ¬P', sub: '(assume the opposite)', color: '#f87171', x: 0.50, y: 0.20 },
  { text: 'Apply logic…', sub: 'valid deductions', color: '#94a3b8', x: 0.50, y: 0.38 },
  { text: 'We derive P', sub: 'from our assumption', color: '#f87171', x: 0.50, y: 0.56 },
  { text: '⚡ CONTRADICTION', sub: '¬P and P cannot both be true', color: '#fbbf24', x: 0.50, y: 0.74 },
  { text: '∴  P is true', sub: 'assumption ¬P must be false', color: '#34d399', x: 0.50, y: 0.90 },
]

export default function ContradictionScene() {
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

    function drawBox(bx, by, bw, bh, text, sub, color, alpha, dark, flash) {
      ctx.save()
      ctx.globalAlpha = alpha
      // Box
      if (flash > 0) {
        ctx.shadowColor = color; ctx.shadowBlur = 20 * flash
      }
      ctx.fillStyle = dark ? color + '22' : color + '18'
      ctx.strokeStyle = color; ctx.lineWidth = 2
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill(); ctx.stroke()
      // Text
      ctx.font = `bold 13px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? color : color; ctx.shadowBlur = 0
      ctx.fillText(text, bx + bw / 2, by + bh / 2 - 5)
      ctx.font = '10px system-ui'; ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText(sub, bx + bw / 2, by + bh / 2 + 9)
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

      const CYCLE = 10000
      const progress = (t % CYCLE) / CYCLE
      const visibleSteps = Math.min(STEPS.length, Math.ceil(progress * (STEPS.length + 0.4)))
      const activeStep = visibleSteps - 1

      const boxW = Math.min(w * 0.72, 280), boxH = 40
      const boxX = (w - boxW) / 2

      for (let i = 0; i < visibleSteps; i++) {
        const step = STEPS[i]
        const by = step.y * h - boxH / 2
        const stepProgress = Math.min(1, (progress * (STEPS.length + 0.4) - i) * 4)
        const isActive = i === activeStep
        const flash = i === 3 ? (0.5 + 0.5 * Math.sin(t * 0.008)) * (isActive ? 1 : 0.3) : 0

        drawBox(boxX, by, boxW, boxH, step.text, step.sub, step.color, easeOut(stepProgress), dark, flash)

        // Arrow down to next box
        if (i < visibleSteps - 1) {
          const nextStep = STEPS[i + 1]
          const ay1 = step.y * h + boxH / 2
          const ay2 = nextStep.y * h - boxH / 2 - 4
          const midX = w / 2
          ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'
          ctx.lineWidth = 1.5
          ctx.setLineDash([3, 2])
          ctx.beginPath(); ctx.moveTo(midX, ay1); ctx.lineTo(midX, ay2); ctx.stroke()
          ctx.setLineDash([])
          // Arrowhead
          ctx.fillStyle = dark ? '#334155' : '#e2e8f0'
          ctx.beginPath()
          ctx.moveTo(midX, ay2 + 6)
          ctx.lineTo(midX - 4, ay2); ctx.lineTo(midX + 4, ay2); ctx.fill()
        }
      }

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'; ctx.textAlign = 'center'
      ctx.fillText('PROOF BY CONTRADICTION', w / 2, 18)
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
