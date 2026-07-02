import { useEffect, useRef } from 'react'

export default function MidpointScene() {
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

    const EXAMPLES = [
      { p: [1, 2], q: [5, 6] },
      { p: [-3, 1], q: [3, 5] },
      { p: [0, -2], q: [4, 4] },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const exIdx = Math.floor(t / 3000) % EXAMPLES.length
      const { p, q } = EXAMPLES[exIdx]
      const animProg = Math.min(1, (t % 3000) / 1200)

      const margin = 28
      const gridSz = Math.min(w - margin * 2, h * 0.58)
      const ox = margin + gridSz / 2
      const oy = margin + gridSz / 2 + 14
      const scale = gridSz / 10

      // Grid
      ctx.strokeStyle = dark ? '#1e293b' : '#e2e8f0'; ctx.lineWidth = 1
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo(ox + i * scale, oy - gridSz / 2); ctx.lineTo(ox + i * scale, oy + gridSz / 2); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(ox - gridSz / 2, oy + i * scale); ctx.lineTo(ox + gridSz / 2, oy + i * scale); ctx.stroke()
      }
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(ox - gridSz / 2, oy); ctx.lineTo(ox + gridSz / 2, oy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ox, oy - gridSz / 2); ctx.lineTo(ox, oy + gridSz / 2); ctx.stroke()

      const toC = ([x, y]) => [ox + x * scale, oy - y * scale]
      const [px, py2] = toC(p), [qx, qy2] = toC(q)
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2
      const [mcx, mcy] = toC([mx, my])

      // PQ line
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(px, py2); ctx.lineTo(qx, qy2); ctx.stroke()

      // P and Q dots
      ctx.beginPath(); ctx.arc(px, py2, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#6366f1'; ctx.fill()
      ctx.beginPath(); ctx.arc(qx, qy2, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#ec4899'; ctx.fill()

      // Labels
      ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillStyle = '#6366f1'
      ctx.fillText(`P(${p[0]},${p[1]})`, px, py2 - 7)
      ctx.fillStyle = '#ec4899'
      ctx.fillText(`Q(${q[0]},${q[1]})`, qx, qy2 - 7)

      // Midpoint animates to center
      if (animProg > 0.3) {
        const progress = Math.min(1, (animProg - 0.3) / 0.5)
        // Animate M moving along segment from P to its final position
        const startX = px, startY = py2
        const mAnimX = startX + (mcx - startX) * progress
        const mAnimY = startY + (mcy - startY) * progress

        ctx.beginPath()
        ctx.arc(mAnimX, mAnimY, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#f59e0b'
        ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#f59e0b'
        ctx.fillText(`M(${mx},${my})`, mAnimX, mAnimY + 8)
      }

      // Formula panel
      const fx = margin + gridSz + 12
      ctx.font = `${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'

      const lines2 = [
        { t: 'M = midpoint', c: dark ? '#94a3b8' : '#64748b' },
        { t: '  of P and Q', c: dark ? '#94a3b8' : '#64748b' },
        { t: '', c: '' },
        { t: 'x₁+x₂  y₁+y₂', c: '#6366f1' },
        { t: '─────, ─────', c: '#6366f1' },
        { t: '  2       2', c: '#6366f1' },
        { t: '', c: '' },
        { t: `${p[0]}+${q[0]}  ${p[1]}+${q[1]}`, c: '#f59e0b', show: animProg > 0.2 },
        { t: '───, ───', c: '#f59e0b', show: animProg > 0.2 },
        { t: ' 2    2', c: '#f59e0b', show: animProg > 0.2 },
        { t: '', c: '' },
        { t: `= (${mx}, ${my})`, c: '#22c55e', show: animProg > 0.5 },
      ]

      lines2.forEach((line, i) => {
        if (line.show === false || !line.c) return
        ctx.fillStyle = line.c
        ctx.fillText(line.t, fx, margin + 14 + i * Math.round(h * 0.063))
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('The Midpoint Formula', w / 2, 20)

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
