import { useEffect, useRef } from 'react'

// Domino metaphor: P(1) falls, knocks over P(2), P(3), ...
const N_DOMINOS = 7

export default function InductionScene() {
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

      const CYCLE = 8000
      const progress = (t % CYCLE) / CYCLE

      // Domino dimensions
      const dW = Math.min(w / (N_DOMINOS * 1.8), 28)
      const dH = dW * 2.4
      const gap = dW * 1.2
      const totalW = (N_DOMINOS - 1) * (dW + gap) + dW
      const startX = (w - totalW) / 2
      const groundY = h * 0.72

      // When does domino i fall? With a delay per domino
      // Base case (i=0) falls early; each subsequent one falls when the previous has mostly fallen
      function dominoAngle(i) {
        const delay = i * 0.11
        const fall = Math.max(0, progress - delay) / (1 - delay + 0.001)
        return -Math.PI / 2 * easeOut(Math.min(1, fall * 2))
      }

      // Draw each domino
      for (let i = 0; i < N_DOMINOS; i++) {
        const bx = startX + i * (dW + gap) + dW / 2
        const angle = dominoAngle(i)
        const fallen = angle < -Math.PI / 2 * 0.85

        ctx.save()
        ctx.translate(bx, groundY)
        ctx.rotate(angle)

        // Shadow
        ctx.globalAlpha = 0.15
        ctx.fillStyle = '#000'
        ctx.fillRect(-dW / 2 + 2, -dH + 2, dW, dH)

        // Domino body
        ctx.globalAlpha = 1
        const isBase = i === 0
        ctx.fillStyle = fallen
          ? (dark ? '#34d399' : '#059669')
          : (isBase ? (dark ? '#818cf8' : '#4f46e5') : (dark ? '#e2e8f0' : '#1e293b'))
        ctx.strokeStyle = fallen
          ? (dark ? '#6ee7b7' : '#047857')
          : (isBase ? (dark ? '#c4b5fd' : '#7c3aed') : (dark ? '#94a3b8' : '#475569'))
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.roundRect(-dW / 2, -dH, dW, dH, 2); ctx.fill(); ctx.stroke()

        // Label P(i+1)
        ctx.save()
        ctx.rotate(Math.PI / 2 - angle)  // keep text upright-ish
        ctx.rotate(-Math.PI / 2)
        ctx.font = `bold ${Math.round(dW * 0.4)}px system-ui`
        ctx.fillStyle = fallen ? '#0f172a' : (dark ? '#0f172a' : '#f8fafc')
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        // Just show number
        ctx.font = `bold ${Math.round(dW * 0.48)}px system-ui`
        ctx.restore()

        // Number outside domino
        ctx.save()
        ctx.rotate(-angle)  // counter-rotate to stay upright
        ctx.font = `bold ${Math.round(dW * 0.52)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        ctx.fillStyle = fallen
          ? (dark ? '#34d399' : '#047857')
          : (dark ? '#64748b' : '#94a3b8')
        ctx.fillText(String(i + 1), 0, 6)
        ctx.restore()

        ctx.restore()
      }

      // "..." at end
      ctx.font = 'bold 18px system-ui'
      ctx.fillStyle = dark ? '#34d399' : '#047857'
      ctx.textAlign = 'left'
      ctx.fillText('…', startX + totalW + 8, groundY - dH / 2)

      // Ground line
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(startX - 16, groundY); ctx.lineTo(startX + totalW + 40, groundY); ctx.stroke()

      // Labels below
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'center'

      // Base case label under first domino
      const bx0 = startX + dW / 2
      ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'
      ctx.fillText('Base case', bx0, groundY + 14)
      ctx.font = '10px system-ui'; ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.fillText('P(1) is true', bx0, groundY + 27)

      // Inductive step arrow
      const midX = startX + totalW / 2
      ctx.font = 'bold 11px system-ui'; ctx.fillStyle = dark ? '#34d399' : '#047857'
      ctx.fillText('Inductive step: P(k) true → P(k+1) true', midX, groundY + 44)

      // Instruction
      ctx.font = '11px system-ui'; ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      const fallCount = STEPS_FALLEN(progress)
      if (fallCount > 0) {
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText(`${fallCount} domino${fallCount > 1 ? 's' : ''} fallen — P(${fallCount}) proved`, midX, groundY + 60)
      }

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#6366f1'; ctx.textAlign = 'center'
      ctx.fillText('MATHEMATICAL INDUCTION', w / 2, 20)
      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(loop)
    }

    function STEPS_FALLEN(p) {
      let count = 0
      for (let i = 0; i < N_DOMINOS; i++) {
        const delay = i * 0.11
        const fall = Math.max(0, p - delay) / (1 - delay + 0.001)
        if (easeOut(Math.min(1, fall * 2)) > 0.85) count++
      }
      return count
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
