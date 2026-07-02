import { useEffect, useRef } from 'react'

export default function QuotientSetScene() {
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

    // A = {0,1,2,3,4,5} mod 3: classes [0],[1],[2]
    const CLASSES = [
      { elements: [0, 3], color: '#6366f1', label: '[0]' },
      { elements: [1, 4], color: '#10b981', label: '[1]' },
      { elements: [2, 5], color: '#ec4899', label: '[2]' },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      // Left side: A with elements colored by class
      const leftX = w * 0.2
      const rightX = w * 0.72
      const setRadius = Math.min(h * 0.35, 110)
      const setTopY = h * 0.5

      // Left ellipse (A)
      ctx.beginPath()
      ctx.ellipse(leftX, setTopY, setRadius * 0.55, setRadius, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'
      ctx.fill()
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'; ctx.lineWidth = 2; ctx.stroke()

      ctx.font = `bold ${Math.round(h * 0.052)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText('A', leftX, setTopY - setRadius - 18)

      // Elements arranged in left ellipse
      const allEls = [0, 1, 2, 3, 4, 5]
      const elemsY = allEls.map((_, i) => setTopY - setRadius * 0.75 + i * (setRadius * 1.5 / 5))
      allEls.forEach((el, i) => {
        const cls = CLASSES.find(c => c.elements.includes(el))
        ctx.beginPath()
        ctx.arc(leftX, elemsY[i], 14, 0, Math.PI * 2)
        ctx.fillStyle = dark ? cls.color + '44' : cls.color + '33'
        ctx.fill()
        ctx.strokeStyle = cls.color; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.045)}px system-ui`
        ctx.fillStyle = cls.color
        ctx.fillText(el, leftX, elemsY[i])
      })

      // Right side: quotient set A/~ with 3 blocks
      const blockH = Math.min(h * 0.15, 52)
      const blockW = Math.min(w * 0.2, 80)
      const blockGap = Math.min(h * 0.06, 20)
      const blockStartY = setTopY - blockH * 1.5 - blockGap

      CLASSES.forEach((cls, i) => {
        const by = blockStartY + i * (blockH + blockGap)

        ctx.beginPath()
        ctx.roundRect(rightX - blockW / 2, by, blockW, blockH, 8)
        ctx.fillStyle = dark ? cls.color + '33' : cls.color + '22'
        ctx.fill()
        ctx.strokeStyle = cls.color; ctx.lineWidth = 2.5; ctx.stroke()

        ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
        ctx.fillStyle = cls.color
        ctx.fillText(cls.label, rightX, by + blockH * 0.35)
        ctx.font = `${Math.round(h * 0.036)}px "JetBrains Mono", monospace`
        ctx.fillText(`{${cls.elements.join(',')}}`, rightX, by + blockH * 0.72)

        // Arrow from matching elements to block
        cls.elements.forEach(el => {
          const elIdx = allEls.indexOf(el)
          const ey = elemsY[elIdx]
          const arrowProg = Math.min(1, ((t % 4000) - i * 400) / 500)
          if (arrowProg <= 0) return
          const ex = leftX + 14
          const tx = rightX - blockW / 2
          const ty = by + blockH / 2
          ctx.strokeStyle = cls.color + '88'; ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(ex, ey)
          ctx.lineTo(ex + (tx - ex) * arrowProg, ey + (ty - ey) * arrowProg)
          ctx.stroke()
          ctx.setLineDash([])
        })
      })

      // Quotient label
      ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText('A / ~', rightX, setTopY - setRadius - 18)

      // Bottom formula
      ctx.font = `bold ${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('A/~ = { [0], [1], [2] }', cx, h - 18)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Quotient Set  A / ~', cx, 20)

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
