import { useEffect, useRef } from 'react'

export default function FourCombScene() {
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

    const QUADS = [
      {
        label: 'Injective only',
        inj: true, sur: false,
        color: '#6366f1',
        arrows: [[0,0],[1,2],[2,3]],  // 3 dom, 4 codom — some codom uncovered
        aSize: 3, bSize: 4,
      },
      {
        label: 'Surjective only',
        inj: false, sur: true,
        color: '#10b981',
        arrows: [[0,0],[1,0],[2,1],[3,2]],  // 4 dom → 3 codom (some share)
        aSize: 4, bSize: 3,
      },
      {
        label: 'Bijective',
        inj: true, sur: true,
        color: '#f59e0b',
        arrows: [[0,0],[1,1],[2,2]],
        aSize: 3, bSize: 3,
      },
      {
        label: 'Neither',
        inj: false, sur: false,
        color: '#94a3b8',
        arrows: [[0,0],[1,0],[2,1]],  // share + miss
        aSize: 3, bSize: 4,
      },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const active = Math.floor(t / 2400) % QUADS.length
      const { label, inj, sur, color, arrows, aSize, bSize } = QUADS[active]

      // 2×2 grid display
      const cellW = (w - 20) / 2, cellH = (h - 50) / 2

      QUADS.forEach((q, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        const cx2 = 10 + col * cellW + cellW / 2
        const cy2 = 38 + row * cellH + cellH / 2
        const isActive = i === active

        // Cell bg
        ctx.beginPath()
        ctx.roundRect(10 + col * cellW, 38 + row * cellH, cellW - 4, cellH - 4, 6)
        ctx.fillStyle = isActive ? (dark ? q.color + '22' : q.color + '15') : (dark ? '#0f1628' : '#f8fafc')
        ctx.fill()
        ctx.strokeStyle = isActive ? q.color : (dark ? '#1e293b' : '#e2e8f0')
        ctx.lineWidth = isActive ? 2 : 1; ctx.stroke()

        // Mini arrow diagram
        const lx = cx2 - cellW * 0.28, rx = cx2 + cellW * 0.28
        const r2 = 7, domGap = (cellH * 0.55) / (q.aSize - 1)
        const codGap = (cellH * 0.55) / Math.max(q.bSize - 1, 1)
        const domStartY = cy2 - cellH * 0.27

        q.arrows.forEach(([ai, bi]) => {
          const ay = domStartY + ai * domGap
          const by = domStartY + bi * codGap
          ctx.strokeStyle = q.color + (isActive ? 'dd' : '66'); ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.moveTo(lx + r2, ay); ctx.lineTo(rx - r2, by); ctx.stroke()
        })

        for (let j = 0; j < q.aSize; j++) {
          ctx.beginPath(); ctx.arc(lx, domStartY + j * domGap, r2, 0, Math.PI * 2)
          ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'; ctx.fill()
          ctx.strokeStyle = q.color + (isActive ? '' : '66'); ctx.lineWidth = 1.2; ctx.stroke()
        }
        for (let j = 0; j < q.bSize; j++) {
          ctx.beginPath(); ctx.arc(rx, domStartY + j * codGap, r2, 0, Math.PI * 2)
          ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'; ctx.fill()
          ctx.strokeStyle = q.color + (isActive ? '' : '66'); ctx.lineWidth = 1.2; ctx.stroke()
        }

        // Label
        ctx.font = `${isActive ? 'bold ' : ''}${Math.round(cellH * 0.14)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = isActive ? q.color : (dark ? '#475569' : '#94a3b8')
        ctx.fillText(q.label, cx2, cy2 + cellH * 0.35)

        // Inj/Sur badges
        const badgeY = cy2 + cellH * 0.45
        ctx.font = `${Math.round(cellH * 0.11)}px "JetBrains Mono", monospace`
        ctx.fillStyle = q.inj ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
        ctx.fillText(q.inj ? 'inj✓' : 'inj✗', cx2 - 22, badgeY)
        ctx.fillStyle = q.sur ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
        ctx.fillText(q.sur ? 'sur✓' : 'sur✗', cx2 + 22, badgeY)
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('The Four Combinations', w / 2, 22)

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
