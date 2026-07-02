import { useEffect, useRef } from 'react'

// f(x) = 2x + 1
const EXAMPLES = [
  { x: 0, fx: 1 },
  { x: 1, fx: 3 },
  { x: 2, fx: 5 },
  { x: -1, fx: -1 },
  { x: 3, fx: 7 },
]

export default function FunctionMachineScene() {
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
    function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - 2*(1-t)*(1-t) }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cy = h * 0.48
      const machineW = Math.min(w * 0.28, 120)
      const machineH = Math.min(h * 0.30, 90)
      const machineX = w / 2 - machineW / 2
      const machineY = cy - machineH / 2

      // Current example (cycles every 2.5s)
      const ITEM_PERIOD = 2500
      const exIdx = Math.floor((t % (ITEM_PERIOD * EXAMPLES.length)) / ITEM_PERIOD)
      const itemT = (t % ITEM_PERIOD) / ITEM_PERIOD
      const ex = EXAMPLES[exIdx]

      // Animation phases: 0-0.3 input travels in, 0.3-0.6 inside machine, 0.6-1.0 output exits
      const phase = itemT
      const inputX = w * 0.1 + (machineX - w * 0.1) * easeInOut(Math.min(1, phase / 0.28))
      const outputAlpha = phase > 0.6 ? easeOut((phase - 0.6) / 0.35) : 0
      const outputX = (w - machineX - machineW) + (machineX + machineW) * (1 - easeInOut(Math.min(1, (phase - 0.6) / 0.35)))

      // Machine box
      ctx.save()
      ctx.shadowColor = dark ? '#6366f1' : '#818cf8'
      ctx.shadowBlur = 10
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.lineWidth = 2
      ctx.fillStyle = dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'
      ctx.beginPath(); ctx.roundRect(machineX, machineY, machineW, machineH, 8); ctx.fill()
      ctx.stroke()
      ctx.restore()

      // Machine label
      ctx.font = 'bold 18px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'
      ctx.fillText('f', w / 2, cy - 10)

      ctx.font = '12px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#6366f1' : '#4338ca'
      ctx.fillText('f(x) = 2x + 1', w / 2, cy + 14)

      // Input pipe arrow
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(w * 0.08, cy)
      ctx.lineTo(machineX, cy)
      ctx.stroke()
      ctx.setLineDash([])

      // Output pipe arrow
      ctx.beginPath()
      ctx.moveTo(machineX + machineW, cy)
      ctx.lineTo(w * 0.92, cy)
      ctx.stroke()

      // Arrowheads on pipes
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      const aw = 7
      ctx.beginPath()
      ctx.moveTo(machineX, cy); ctx.lineTo(machineX - aw, cy - aw/2); ctx.lineTo(machineX - aw, cy + aw/2); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(w * 0.92, cy); ctx.lineTo(w * 0.92 - aw, cy - aw/2); ctx.lineTo(w * 0.92 - aw, cy + aw/2); ctx.fill()

      // "x =" label on left
      ctx.font = '12px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.textAlign = 'center'
      ctx.fillText('x', w * 0.08, cy - 18)

      // "f(x) =" label on right
      ctx.fillText('f(x)', w * 0.92, cy - 18)

      // Traveling input value bubble
      if (phase < 0.6) {
        const bx = inputX
        const bubbleAlpha = phase < 0.28 ? 1 : easeOut(1 - (phase - 0.28) / 0.32)
        ctx.save()
        ctx.globalAlpha = bubbleAlpha
        ctx.beginPath(); ctx.arc(bx, cy, 20, 0, Math.PI * 2)
        ctx.fillStyle = dark ? 'rgba(99,102,241,0.30)' : 'rgba(99,102,241,0.20)'
        ctx.fill()
        ctx.strokeStyle = dark ? '#818cf8' : '#4f46e5'
        ctx.lineWidth = 2; ctx.stroke()
        ctx.font = 'bold 15px "JetBrains Mono", monospace'
        ctx.fillStyle = dark ? '#c4b5fd' : '#5b21b6'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(String(ex.x), bx, cy)
        ctx.restore()
      }

      // Output value bubble
      if (outputAlpha > 0) {
        const bx = outputX < machineX + machineW ? machineX + machineW + 30 : outputX
        ctx.save()
        ctx.globalAlpha = outputAlpha
        ctx.beginPath(); ctx.arc(bx, cy, 20, 0, Math.PI * 2)
        ctx.fillStyle = dark ? 'rgba(16,185,129,0.30)' : 'rgba(16,185,129,0.20)'
        ctx.fill()
        ctx.strokeStyle = dark ? '#34d399' : '#059669'
        ctx.lineWidth = 2; ctx.stroke()
        ctx.font = 'bold 15px "JetBrains Mono", monospace'
        ctx.fillStyle = dark ? '#6ee7b7' : '#047857'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(String(ex.fx), bx, cy)
        ctx.restore()
      }

      // Current example label
      ctx.font = 'bold 14px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#94a3b8' : '#475569'
      ctx.fillText(`f(${ex.x}) = 2(${ex.x}) + 1 = ${ex.fx}`, w / 2, cy + machineH / 2 + 34)

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('FUNCTION MACHINE', w / 2, 20)
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
