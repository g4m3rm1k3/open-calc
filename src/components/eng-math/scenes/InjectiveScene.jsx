import { useEffect, useRef } from 'react'

export default function InjectiveScene() {
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

    // Phase 0: injective, phase 1: NOT injective
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const phase = Math.floor(t / 3000) % 2
      const cx = w / 2
      const leftX = cx - w * 0.24, rightX = cx + w * 0.24
      const topY = h * 0.22, r = 14, nodeGap = Math.min(h * 0.17, 52)
      const aEls = ['1','2','3'], bEls = ['a','b','c','d']

      const aColor = dark ? '#93c5fd' : '#2563eb'
      const bColor = dark ? '#86efac' : '#16a34a'

      function nodeY(i, gap) { return topY + i * gap }
      const bGap = nodeGap * 0.75

      function drawNode(x, y, label, color) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'; ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color; ctx.fillText(label, x, y)
      }

      aEls.forEach((el, i) => drawNode(leftX, nodeY(i, nodeGap), el, aColor))
      bEls.forEach((el, i) => drawNode(rightX, nodeY(i, bGap), el, bColor))

      ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = aColor; ctx.fillText('A', leftX, topY - 28)
      ctx.fillStyle = bColor; ctx.fillText('B', rightX, topY - 28)

      const prog = Math.min(aEls.length, Math.floor((t % 3000) / 600) + 1)

      if (phase === 0) {
        // Injective: 1→a, 2→b, 3→c  (different outputs)
        const maps = [[0,0],[1,1],[2,2]]
        maps.slice(0, prog).forEach(([ai, bi]) => {
          const x1 = leftX + r, y1 = nodeY(ai, nodeGap)
          const x2 = rightX - r, y2 = nodeY(bi, bGap)
          ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
          const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)
          const ux = dx/len, uy = dy/len
          ctx.fillStyle = '#22c55e'
          ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-ux*9-uy*4,y2-uy*9+ux*4); ctx.lineTo(x2-ux*9+uy*4,y2-uy*9-ux*4); ctx.closePath(); ctx.fill()
        })
        ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText('INJECTIVE (one-to-one) ✓', cx, h * 0.82)
        ctx.font = `${Math.round(h * 0.038)}px system-ui`
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText('Different inputs → different outputs', cx, h * 0.88)
      } else {
        // NOT injective: 1→a, 2→a, 3→c  (1 and 2 share output)
        const maps = [[0,0,'#ef4444'],[1,0,'#ef4444'],[2,2,'#6366f1']]
        maps.slice(0, prog).forEach(([ai, bi, col]) => {
          const x1 = leftX + r, y1 = nodeY(ai, nodeGap)
          const x2 = rightX - r, y2 = nodeY(bi, bGap)
          ctx.strokeStyle = col; ctx.lineWidth = 2
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
          const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)
          const ux = dx/len, uy = dy/len
          ctx.fillStyle = col
          ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-ux*9-uy*4,y2-uy*9+ux*4); ctx.lineTo(x2-ux*9+uy*4,y2-uy*9-ux*4); ctx.closePath(); ctx.fill()
        })
        ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
        ctx.fillStyle = dark ? '#ef4444' : '#dc2626'
        ctx.fillText('NOT injective ✗', cx, h * 0.82)
        ctx.font = `${Math.round(h * 0.038)}px system-ui`
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText('f(1) = f(2) = a  but  1 ≠ 2', cx, h * 0.88)
      }

      ;[0,1].forEach(i => {
        ctx.beginPath(); ctx.arc(cx - 8 + i*16, h-14, 4, 0, Math.PI*2)
        ctx.fillStyle = i === phase ? '#6366f1' : (dark ? '#334155' : '#cbd5e1'); ctx.fill()
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Injective Functions', cx, 20)

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
