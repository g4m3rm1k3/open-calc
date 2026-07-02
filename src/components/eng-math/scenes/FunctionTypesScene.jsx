import { useEffect, useRef } from 'react'

// Three modes cycling: injective, surjective, bijective
// A = {1, 2, 3}, B = {a, b, c, d}  for injective/surjective
// A = {1,2,3} B = {a,b,c} for bijective
const TYPES = [
  {
    name: 'Injective (one-to-one)',
    label: 'f: A → B, different inputs → different outputs',
    note: 'Each output hit at most once. b is not hit.',
    color: '#6366f1',
    A: ['1','2','3'], B: ['a','b','c','d'],
    arrows: [[0,0],[1,2],[2,3]],
  },
  {
    name: 'Surjective (onto)',
    label: 'f: A → B, every output is hit',
    note: 'a is hit twice (by 1 and 2). All of B is covered.',
    color: '#10b981',
    A: ['1','2','3'], B: ['a','b','c'],
    arrows: [[0,0],[1,0],[2,2]],
  },
  {
    name: 'Bijective (one-to-one and onto)',
    label: 'f: A → B, perfect pairing',
    note: 'Every element of A maps to a unique element of B.',
    color: '#f59e0b',
    A: ['1','2','3'], B: ['a','b','c'],
    arrows: [[0,0],[1,1],[2,2]],
  },
]

export default function FunctionTypesScene() {
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

    function drawArrow(x1, y1, x2, y2, color, dark) {
      const dx = x2 - x1, dy = y2 - y1
      const len = Math.sqrt(dx * dx + dy * dy)
      const ux = dx / len, uy = dy / len
      const r = 14
      const sx = x1 + ux * r, sy = y1 + uy * r
      const ex = x2 - ux * r, ey = y2 - uy * r
      ctx.strokeStyle = color; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
      const aw = 7
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(ex, ey)
      ctx.lineTo(ex - ux * aw - uy * aw * 0.5, ey - uy * aw + ux * aw * 0.5)
      ctx.lineTo(ex - ux * aw + uy * aw * 0.5, ey - uy * aw - ux * aw * 0.5)
      ctx.fill()
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const PERIOD = 12000
      const typeIdx = Math.floor((t % PERIOD) / PERIOD * TYPES.length)
      const tp = TYPES[typeIdx]
      const transition = Math.min(1, (((t % PERIOD) / PERIOD * TYPES.length) % 1) * 5)

      ctx.globalAlpha = easeOut(transition)

      const lx = w * 0.24, rx = w * 0.76
      const ovalH = Math.min(h * 0.4, 120)
      const ovalW = 38
      const cy = h * 0.50

      // Ovals
      ctx.strokeStyle = dark ? '#818cf8' : '#4338ca'
      ctx.lineWidth = 2
      ctx.fillStyle = dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)'
      ctx.beginPath(); ctx.ellipse(lx, cy, ovalW, ovalH, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()

      ctx.strokeStyle = tp.color
      ctx.fillStyle = tp.color + (dark ? '14' : '0d')
      ctx.beginPath(); ctx.ellipse(rx, cy, ovalW, ovalH, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()

      // Set labels
      ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      ctx.fillText('A', lx, cy - ovalH - 14)
      ctx.fillStyle = tp.color
      ctx.fillText('B', rx, cy - ovalH - 14)

      // Element positions
      const aPos = tp.A.map((_, i) => ({
        x: lx, y: cy - ovalH * 0.65 + i * (ovalH * 1.3 / Math.max(tp.A.length - 1, 1))
      }))
      const bPos = tp.B.map((_, i) => ({
        x: rx, y: cy - ovalH * 0.65 + i * (ovalH * 1.3 / Math.max(tp.B.length - 1, 1))
      }))

      // Elements
      ctx.font = 'bold 13px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      tp.A.forEach((el, i) => { ctx.textAlign = 'center'; ctx.fillText(el, aPos[i].x, aPos[i].y) })
      ctx.fillStyle = tp.color
      tp.B.forEach((el, i) => { ctx.textAlign = 'center'; ctx.fillText(el, bPos[i].x, bPos[i].y) })

      // Highlight unmapped elements in surjective (b is not hit in injective)
      if (typeIdx === 0) {
        const hitTargets = new Set(tp.arrows.map(a => a[1]))
        tp.B.forEach((_, i) => {
          if (!hitTargets.has(i)) {
            ctx.beginPath(); ctx.arc(bPos[i].x, bPos[i].y, 12, 0, Math.PI * 2)
            ctx.strokeStyle = dark ? '#475569' : '#cbd5e1'
            ctx.lineWidth = 1; ctx.setLineDash([3,2]); ctx.stroke(); ctx.setLineDash([])
          }
        })
      }

      // Arrows
      tp.arrows.forEach((arr, i) => {
        drawArrow(aPos[arr[0]].x, aPos[arr[0]].y, bPos[arr[1]].x, bPos[arr[1]].y, tp.color, dark)
      })

      ctx.globalAlpha = 1

      // Type badge
      ctx.save()
      ctx.fillStyle = tp.color + '22'
      ctx.beginPath(); ctx.roundRect(w / 2 - 130, h - 72, 260, 30, 6); ctx.fill()
      ctx.strokeStyle = tp.color; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.restore()

      ctx.font = 'bold 13px system-ui'; ctx.fillStyle = tp.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(tp.name, w / 2, h - 57)
      ctx.font = '10px system-ui'; ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText(tp.note, w / 2, h - 32)
      ctx.fillText(tp.label, w / 2, h - 18)

      // Dots
      for (let i = 0; i < TYPES.length; i++) {
        ctx.beginPath()
        ctx.arc(w / 2 + (i - 1) * 14, 32, i === typeIdx ? 4 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = i === typeIdx ? TYPES[i].color : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      }

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('FUNCTION TYPES', w / 2, 16)
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
