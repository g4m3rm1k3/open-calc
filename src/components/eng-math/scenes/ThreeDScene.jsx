import { useEffect, useRef } from 'react'

export default function ThreeDScene() {
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

    const POINTS3D = [
      { x: 2, y: 3, z: 1, color: '#6366f1' },
      { x: -1, y: 2, z: 3, color: '#10b981' },
      { x: 3, y: -1, z: 2, color: '#ec4899' },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w * 0.45, cy = h * 0.52
      const angle = t / 4000  // slow rotation
      const cos = Math.cos(angle), sin = Math.sin(angle)
      const scale = Math.min(w, h) * 0.09
      const axisLen = 4

      // Project 3D → 2D (isometric-ish with slight rotation)
      function project([x, y, z]) {
        // Rotate around Y axis
        const rx = x * cos - z * sin
        const rz = x * sin + z * cos
        // Isometric projection
        const sx = (rx - rz) * 0.7 * scale
        const sy = (-y + (rx + rz) * 0.4) * scale
        return [cx + sx, cy + sy]
      }

      const origin = [0, 0, 0]
      const xEnd = [axisLen, 0, 0]
      const yEnd = [0, axisLen, 0]
      const zEnd = [0, 0, axisLen]

      // Draw axes
      ;[[xEnd, '#ef4444', 'x'], [yEnd, '#22c55e', 'y'], [zEnd, '#3b82f6', 'z']].forEach(([end, color, label]) => {
        const [ox, oy] = project(origin)
        const [ex, ey] = project(end)
        ctx.strokeStyle = color; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke()
        // Arrow
        const dx = ex - ox, dy = ey - oy
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len, uy = dy / len
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(ex - ux * 10 - uy * 5, ey - uy * 10 + ux * 5)
        ctx.lineTo(ex - ux * 10 + uy * 5, ey - uy * 10 - ux * 5)
        ctx.closePath(); ctx.fill()
        // Label
        ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        ctx.fillText(label, ex + ux * 14, ey + uy * 14)
      })

      // Grid ticks
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue
        ctx.font = `${Math.round(h * 0.028)}px system-ui`
        ctx.fillStyle = dark ? '#334155' : '#cbd5e1'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        const [tx, ty] = project([i, 0, 0])
        ctx.fillText(i, tx, ty + 10)
      }

      // Cycle through points
      const ptIdx = Math.floor(t / 2500) % POINTS3D.length
      const { x, y, z, color } = POINTS3D[ptIdx]
      const [px, py2] = project([x, y, z])

      // Dashed projection lines
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'; ctx.lineWidth = 1

      // To xy-plane
      const [fx, fy] = project([x, y, 0])
      ctx.beginPath(); ctx.moveTo(px, py2); ctx.lineTo(fx, fy); ctx.stroke()
      // To x-axis
      const [ax, ay] = project([x, 0, 0])
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(ax, ay); ctx.stroke()
      // To y-axis
      const [bx, by] = project([0, y, 0])
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(bx, by); ctx.stroke()

      ctx.setLineDash([])

      // Point
      ctx.beginPath()
      ctx.arc(px, py2, 7, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.shadowColor = color; ctx.shadowBlur = 16
      ctx.fill(); ctx.shadowBlur = 0

      // Label
      ctx.font = `bold ${Math.round(h * 0.048)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillStyle = color
      ctx.fillText(`(${x}, ${y}, ${z})`, px + 10, py2)

      // Formula
      ctx.font = `bold ${Math.round(h * 0.044)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText('ℝ³ = ℝ × ℝ × ℝ', cx, h - 20)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Three Dimensions: ℝ³', w / 2, 20)

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
