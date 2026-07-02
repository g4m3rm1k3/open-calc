import { useEffect, useRef } from 'react'

export default function DistanceFormulaScene() {
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

    const POINTS = [
      { p: [1, 1], q: [4, 5] },
      { p: [0, 3], q: [3, -1] },
      { p: [-2, 2], q: [2, -1] },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const pairIdx = Math.floor(t / 3500) % POINTS.length
      const { p, q } = POINTS[pairIdx]
      const animProg = Math.min(1, (t % 3500) / 1500)

      // Grid setup
      const margin = 32
      const gridW = Math.min(w - margin * 2, h * 0.55)
      const gridH = gridW
      const originX = margin + gridW / 2
      const originY = margin + gridH / 2 + 10
      const scale = gridW / 10

      // Grid lines
      ctx.strokeStyle = dark ? '#1e293b' : '#e2e8f0'; ctx.lineWidth = 1
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath()
        ctx.moveTo(originX + i * scale, originY - gridH / 2)
        ctx.lineTo(originX + i * scale, originY + gridH / 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(originX - gridW / 2, originY + i * scale)
        ctx.lineTo(originX + gridW / 2, originY + i * scale)
        ctx.stroke()
      }

      // Axes
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(originX - gridW / 2, originY); ctx.lineTo(originX + gridW / 2, originY); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(originX, originY - gridH / 2); ctx.lineTo(originX, originY + gridH / 2); ctx.stroke()

      // Convert to canvas coords
      const toC = ([x, y]) => [originX + x * scale, originY - y * scale]
      const [px, py] = toC(p)
      const [qx, qy] = toC(q)

      // Right-angle triangle legs (appear with animation)
      if (animProg > 0.2) {
        const leg = Math.min(1, (animProg - 0.2) / 0.3)
        ctx.strokeStyle = dark ? '#f59e0b' : '#d97706'
        ctx.setLineDash([5, 4])
        ctx.lineWidth = 1.5
        // Horizontal leg
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px + (qx - px) * leg, py)
        ctx.stroke()
        // Vertical leg
        if (animProg > 0.45) {
          const vleg = Math.min(1, (animProg - 0.45) / 0.3)
          ctx.beginPath()
          ctx.moveTo(qx, py)
          ctx.lineTo(qx, py + (qy - py) * vleg)
          ctx.stroke()
        }
        ctx.setLineDash([])

        // Δx, Δy labels
        ctx.font = `${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#f59e0b'
        ctx.fillText(`Δx=${q[0]-p[0]}`, (px + qx) / 2, py + 14)
        if (animProg > 0.6) {
          ctx.fillText(`Δy=${q[1]-p[1]}`, qx + 22, (py + qy) / 2)
        }
      }

      // Hypotenuse (distance line)
      if (animProg > 0.65) {
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2.5
        const prog = Math.min(1, (animProg - 0.65) / 0.25)
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px + (qx - px) * prog, py + (qy - py) * prog)
        ctx.stroke()
      }

      // Points
      ;[[px, py, p, '#6366f1', 'P'], [qx, qy, q, '#ec4899', 'Q']].forEach(([x, y, coords, color, name]) => {
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = color; ctx.fill()
        ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
        ctx.fillStyle = color
        ctx.fillText(`${name}(${coords[0]},${coords[1]})`, x, y - 6)
      })

      // Formula panel
      const dx = q[0] - p[0], dy = q[1] - p[1]
      const dist = Math.sqrt(dx * dx + dy * dy).toFixed(2)

      const panelX = margin + gridW + 14
      const panelY = margin + 10
      const panelW = w - panelX - 10

      ctx.font = `${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      const lines = [
        { text: 'd(P,Q) =', color: dark ? '#94a3b8' : '#64748b' },
        { text: '√(Δx² + Δy²)', color: '#6366f1' },
        { text: `= √(${dx}² + ${dy}²)`, color: '#f59e0b', show: animProg > 0.5 },
        { text: `= √${dx * dx + dy * dy}`, color: '#f59e0b', show: animProg > 0.7 },
        { text: `≈ ${dist}`, color: '#22c55e', show: animProg > 0.85 },
      ]

      lines.forEach((line, i) => {
        if (line.show === false) return
        ctx.fillStyle = line.color
        ctx.fillText(line.text, panelX, panelY + i * Math.round(h * 0.07))
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('The Distance Formula', w / 2, 20)

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
