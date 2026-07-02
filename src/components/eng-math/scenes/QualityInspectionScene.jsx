import { useEffect, useRef } from 'react'

export default function QualityInspectionScene() {
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

    const PARTS = [
      { label: 'P1', diameter: true, weight: false },
      { label: 'P2', diameter: true, weight: true },
      { label: 'P3', diameter: false, weight: true },
      { label: 'P4', diameter: true, weight: true },
      { label: 'P5', diameter: false, weight: false },
      { label: 'P6', diameter: true, weight: true },
      { label: 'P7', diameter: true, weight: false },
    ]
    const PART_DUR = 900
    const TOTAL = PARTS.length * PART_DUR + 1000

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = (ts - start) % TOTAL
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2
      const rx = Math.min(w * 0.2, 85), ry = Math.min(h * 0.32, 85)
      const offset = rx * 0.7

      // Left circle: Diameter OK
      ctx.beginPath()
      ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#14532d' : '#dcfce7'
      ctx.fill()
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke()

      // Right circle: Weight OK
      ctx.beginPath()
      ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#1e3a5f' : '#dbeafe'
      ctx.fill()
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.stroke()

      // Intersection
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.clip()
      ctx.beginPath()
      ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? 'rgba(250,204,21,0.25)' : 'rgba(250,204,21,0.35)'
      ctx.fill()
      ctx.restore()
      ctx.beginPath(); ctx.ellipse(cx - offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke()
      ctx.beginPath(); ctx.ellipse(cx + offset, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.stroke()

      // Circle labels
      ctx.font = `bold ${Math.round(h * 0.042)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#86efac' : '#15803d'
      ctx.fillText('Diameter', cx - offset * 1.5, cy - ry * 0.5)
      ctx.fillText('OK', cx - offset * 1.5, cy - ry * 0.5 + 17)
      ctx.fillStyle = dark ? '#93c5fd' : '#1d4ed8'
      ctx.fillText('Weight', cx + offset * 1.5, cy - ry * 0.5)
      ctx.fillText('OK', cx + offset * 1.5, cy - ry * 0.5 + 17)

      ctx.fillStyle = '#ca8a04'
      ctx.fillText('BOTH', cx, cy - 10)
      ctx.fillText('✓', cx, cy + 10)

      // Animate parts arriving
      const partIdx = Math.min(Math.floor(t / PART_DUR), PARTS.length - 1)

      PARTS.slice(0, partIdx + 1).forEach((part, i) => {
        let px, py
        if (part.diameter && part.weight) {
          // intersection
          px = cx + (i % 3 - 1) * 18
          py = cy + 25 + Math.floor(i / 3) * 18
        } else if (part.diameter) {
          px = cx - offset * 1.55 + (i % 2) * 14
          py = cy + 20 + i * 6
        } else if (part.weight) {
          px = cx + offset * 1.55 + (i % 2 - 0.5) * 14
          py = cy + 20 + i * 6
        } else {
          // outside both
          px = (i % 2 === 0) ? cx - offset * 2.3 : cx + offset * 2.3
          py = cy + 20
        }
        ctx.font = `bold ${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'
        const passed = part.diameter || part.weight
        ctx.fillStyle = (part.diameter && part.weight)
          ? '#ca8a04'
          : part.diameter ? '#22c55e'
          : part.weight ? '#3b82f6'
          : (dark ? '#ef4444' : '#dc2626')
        ctx.fillText(part.label, px, py)
      })

      // Legend
      const legY = cy + ry + 24
      ctx.font = `${Math.round(h * 0.04)}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('Gold region = Parts meeting BOTH specs', cx, legY)

      // Title
      ctx.font = `bold ${Math.round(h * 0.047)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Quality Inspection: Set Operations', cx, 20)

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
