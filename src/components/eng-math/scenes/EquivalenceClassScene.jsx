import { useEffect, useRef } from 'react'

// A = {0,1,2,3,4,5}  Relation: n ~ m iff n ≡ m (mod 3)
// Classes: [0]={0,3}  [1]={1,4}  [2]={2,5}
const CLASSES = [
  { rep: '[0]', elements: ['0', '3'], color: '#6366f1', light: '#818cf8' },
  { rep: '[1]', elements: ['1', '4'], color: '#10b981', light: '#34d399' },
  { rep: '[2]', elements: ['2', '5'], color: '#f59e0b', light: '#fbbf24' },
]

export default function EquivalenceClassScene() {
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

      const CYCLE = 9000
      const progress = (t % CYCLE) / CYCLE
      // Which class is currently highlighted
      const highlightIdx = Math.floor(progress * CLASSES.length)

      const classW = Math.min((w - 60) / CLASSES.length, 120)
      const classH = Math.min(h * 0.45, 140)
      const totalW = classW * CLASSES.length
      const sx = (w - totalW) / 2
      const sy = h * 0.26

      // Universal set label
      ctx.font = '11px system-ui'
      ctx.fillStyle = dark ? '#475569' : '#94a3b8'
      ctx.textAlign = 'center'
      ctx.fillText('A = {0, 1, 2, 3, 4, 5}', w / 2, sy - 28)
      ctx.fillText('n ~ m  iff  n ≡ m (mod 3)', w / 2, sy - 12)

      // Draw each equivalence class as a colored region
      for (let i = 0; i < CLASSES.length; i++) {
        const cls = CLASSES[i]
        const appear = easeOut(Math.min(1, (progress * CLASSES.length - i + 0.5) * 2))
        const isHighlighted = i === highlightIdx
        const bx = sx + i * classW

        ctx.save()
        ctx.globalAlpha = appear

        // Box fill
        ctx.fillStyle = dark
          ? cls.color + (isHighlighted ? '30' : '18')
          : cls.color + (isHighlighted ? '28' : '12')
        ctx.beginPath()
        ctx.roundRect(bx + 6, sy, classW - 12, classH, 10)
        ctx.fill()

        // Box stroke
        ctx.strokeStyle = isHighlighted ? cls.color : cls.color + '88'
        ctx.lineWidth = isHighlighted ? 2.5 : 1.5
        ctx.stroke()

        // Class representative label
        ctx.font = `bold ${isHighlighted ? 15 : 13}px "JetBrains Mono", monospace`
        ctx.fillStyle = dark ? cls.light : cls.color
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(cls.rep, bx + classW / 2, sy + 22)

        // Elements
        cls.elements.forEach((el, j) => {
          const ey = sy + 55 + j * 34
          // Element circle
          ctx.beginPath()
          ctx.arc(bx + classW / 2, ey, 16, 0, Math.PI * 2)
          ctx.fillStyle = dark ? cls.color + '28' : cls.color + '20'
          ctx.fill()
          ctx.strokeStyle = dark ? cls.light : cls.color
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.font = 'bold 14px system-ui'
          ctx.fillStyle = dark ? cls.light : cls.color
          ctx.fillText(el, bx + classW / 2, ey)
        })

        // Show n mod 3 under each element
        ctx.font = '10px "JetBrains Mono", monospace'
        ctx.fillStyle = dark ? '#475569' : '#94a3b8'
        cls.elements.forEach((el, j) => {
          const ey = sy + 55 + j * 34 + 22
          ctx.fillText(`${el} mod 3 = ${i}`, bx + classW / 2, ey)
        })

        ctx.restore()
      }

      // Partition reminder
      const highlighted = CLASSES[highlightIdx]
      ctx.font = 'bold 13px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? highlighted.light : highlighted.color
      ctx.textAlign = 'center'
      ctx.fillText(
        `${highlighted.rep} = {${highlighted.elements.join(', ')}}`,
        w / 2, sy + classH + 24
      )
      ctx.font = '11px system-ui'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('Classes are disjoint and together cover all of A', w / 2, sy + classH + 44)

      // Quotient set
      ctx.font = '11px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('A/~ = { [0], [1], [2] }', w / 2, h - 18)

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('EQUIVALENCE CLASSES', w / 2, 20)
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
