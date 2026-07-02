import { useEffect, useRef } from 'react'

// g(x) = x + 1,  f(x) = 2x
// (f ∘ g)(x) = 2(x+1)
const EXAMPLES = [
  { x: 0, gx: 1, fgx: 2 },
  { x: 1, gx: 2, fgx: 4 },
  { x: 2, gx: 3, fgx: 6 },
  { x: -1, gx: 0, fgx: 0 },
  { x: 3, gx: 4, fgx: 8 },
]

export default function CompositionScene() {
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

    function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - 2*(1-t)*(1-t) }
    function easeOut(t) { return 1 - Math.pow(1 - Math.min(t, 1), 3) }

    function drawBox(bx, by, bw, bh, label, sublabel, color, dark) {
      ctx.save()
      ctx.shadowColor = color
      ctx.shadowBlur = 8
      ctx.fillStyle = dark ? color + '18' : color + '12'
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill(); ctx.stroke()
      ctx.restore()
      ctx.font = 'bold 18px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? color : color
      ctx.fillText(label, bx + bw / 2, by + bh / 2 - 6)
      ctx.font = '11px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText(sublabel, bx + bw / 2, by + bh / 2 + 12)
    }

    function drawBubble(bx, by, value, color, alpha, dark) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2)
      ctx.fillStyle = dark ? color + '30' : color + '22'
      ctx.fill()
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = 'bold 14px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? color : color
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(String(value), bx, by)
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

      const cy = h * 0.47
      const boxW = Math.min(w * 0.22, 96), boxH = Math.min(h * 0.24, 70)
      const gBoxX = w * 0.22 - boxW / 2
      const fBoxX = w * 0.68 - boxW / 2
      const boxY = cy - boxH / 2

      // Pipes between boxes
      const pipeY = cy
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      // Left pipe (input to g)
      ctx.beginPath(); ctx.moveTo(w * 0.05, pipeY); ctx.lineTo(gBoxX, pipeY); ctx.stroke()
      // Middle pipe (g to f)
      ctx.beginPath(); ctx.moveTo(gBoxX + boxW, pipeY); ctx.lineTo(fBoxX, pipeY); ctx.stroke()
      // Right pipe (f to output)
      ctx.beginPath(); ctx.moveTo(fBoxX + boxW, pipeY); ctx.lineTo(w * 0.95, pipeY); ctx.stroke()
      ctx.setLineDash([])

      // Arrowheads
      const aw = 6
      ctx.fillStyle = dark ? '#334155' : '#e2e8f0'
      ;[[gBoxX, pipeY], [fBoxX, pipeY], [w * 0.95, pipeY]].forEach(([ax, ay]) => {
        ctx.beginPath()
        ctx.moveTo(ax, ay); ctx.lineTo(ax - aw, ay - aw/2); ctx.lineTo(ax - aw, ay + aw/2); ctx.fill()
      })

      // Machine boxes
      drawBox(gBoxX, boxY, boxW, boxH, 'g', 'x+1', '#6366f1', dark)
      drawBox(fBoxX, boxY, boxW, boxH, 'f', '2x', '#10b981', dark)

      // Pipe labels
      ctx.font = '11px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'; ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.fillText('x', w * 0.05, pipeY - 16)
      ctx.fillText('g(x)', (gBoxX + boxW + fBoxX) / 2, pipeY - 16)
      ctx.fillText('f(g(x))', w * 0.95, pipeY - 16)

      // Current example animation
      const ITEM_PERIOD = 2800
      const exIdx = Math.floor((t % (ITEM_PERIOD * EXAMPLES.length)) / ITEM_PERIOD)
      const phase = (t % ITEM_PERIOD) / ITEM_PERIOD
      const ex = EXAMPLES[exIdx]

      // Phase 0-0.3: bubble travels to g
      const toG = Math.min(1, phase / 0.28)
      const inputX = w * 0.05 + (gBoxX - w * 0.05) * easeInOut(toG)
      if (phase < 0.35) {
        drawBubble(inputX, pipeY, ex.x, '#818cf8', 1, dark)
      }

      // Phase 0.35-0.65: bubble exits g (shows g(x))
      if (phase >= 0.35 && phase < 0.68) {
        const midProgress = easeInOut(Math.min(1, (phase - 0.35) / 0.28))
        const midX = gBoxX + boxW + (fBoxX - gBoxX - boxW) * midProgress
        drawBubble(midX, pipeY, ex.gx, '#818cf8', 1, dark)
      }

      // Phase 0.65-0.95: bubble exits f (shows f(g(x)))
      if (phase >= 0.65) {
        const outProgress = easeInOut(Math.min(1, (phase - 0.65) / 0.28))
        const outX = fBoxX + boxW + (w * 0.95 - fBoxX - boxW) * outProgress
        drawBubble(outX, pipeY, ex.fgx, '#34d399', easeOut((phase - 0.65) * 5), dark)
      }

      // Computation display
      ctx.font = 'bold 13px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#94a3b8' : '#475569'
      ctx.fillText(`(f ∘ g)(${ex.x}) = f(g(${ex.x})) = f(${ex.gx}) = ${ex.fgx}`, w / 2, boxY + boxH + 36)

      // Composition label
      ctx.font = 'bold 11px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('f ∘ g = apply g first, then f', w / 2, h - 18)

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('FUNCTION COMPOSITION', w / 2, 20)
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
