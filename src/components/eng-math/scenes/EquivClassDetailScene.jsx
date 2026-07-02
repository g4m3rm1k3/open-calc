import { useEffect, useRef } from 'react'

export default function EquivClassDetailScene() {
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

    const CLASSES = [
      { elements: [0, 3, 6], color: '#6366f1', representative: 0 },
      { elements: [1, 4, 7], color: '#10b981', representative: 1 },
      { elements: [2, 5, 8], color: '#ec4899', representative: 2 },
    ]
    const ALL = [0,1,2,3,4,5,6,7,8]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h * 0.47
      // Arrange classes in a row
      const classW = (w - 40) / 3
      const elemR = Math.min(13, classW * 0.12)
      const classH = Math.min(h * 0.52, 170)

      CLASSES.forEach((cls, ci) => {
        const clsX = 20 + ci * classW + classW / 2
        const clsTopY = cy - classH / 2

        // Class container
        ctx.beginPath()
        ctx.roundRect(clsX - classW * 0.42, clsTopY, classW * 0.84, classH, 10)
        ctx.fillStyle = dark ? cls.color + '1a' : cls.color + '12'
        ctx.fill()
        ctx.strokeStyle = cls.color; ctx.lineWidth = 2; ctx.stroke()

        // Representative label
        ctx.font = `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = cls.color
        ctx.fillText(`[${cls.representative}]`, clsX, clsTopY - 14)

        // Elements
        const elemSpacing = classH / (cls.elements.length + 1)
        cls.elements.forEach((el, ei) => {
          const ey = clsTopY + (ei + 1) * elemSpacing

          // Pulse highlight
          const pulse = 0.8 + 0.2 * Math.sin(t / 500 + ci * 2.1 + ei * 1.3)
          ctx.beginPath()
          ctx.arc(clsX, ey, elemR * pulse, 0, Math.PI * 2)
          ctx.fillStyle = dark ? cls.color + '44' : cls.color + '33'
          ctx.fill()
          ctx.strokeStyle = cls.color; ctx.lineWidth = 1.5; ctx.stroke()

          ctx.font = `bold ${Math.round(h * 0.045)}px system-ui`
          ctx.fillStyle = cls.color
          ctx.fillText(el, clsX, ey)
        })
      })

      // Properties labels
      const propY = cy + classH / 2 + 22
      const props = [
        { text: '• Classes cover all of A', color: dark ? '#22c55e' : '#16a34a' },
        { text: '• No element in two classes', color: dark ? '#f59e0b' : '#d97706' },
        { text: '• Classes form a PARTITION', color: dark ? '#a78bfa' : '#7c3aed' },
      ]
      props.forEach((p, i) => {
        ctx.font = `${Math.round(h * 0.042)}px system-ui`
        ctx.textAlign = 'center'
        ctx.fillStyle = p.color
        ctx.fillText(p.text, cx, propY + i * Math.round(h * 0.06))
      })

      ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Equivalence Classes on ℤ₉ (mod 3)', cx, 20)

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
