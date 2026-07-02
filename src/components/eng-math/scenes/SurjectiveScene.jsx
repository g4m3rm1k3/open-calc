import { useEffect, useRef } from 'react'

export default function SurjectiveScene() {
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
      const topY = h * 0.22, r = 14, nodeGap = Math.min(h * 0.155, 48)
      const aEls = ['1','2','3','4'], bEls = ['a','b','c']
      const aColor = dark ? '#93c5fd' : '#2563eb'
      const bColor = dark ? '#86efac' : '#16a34a'

      function drawNode(x, y, label, color, highlight) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = highlight ? (dark ? color + '44' : color + '33') : (dark ? '#1e293b' : '#f1f5f9')
        ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = highlight ? 2.5 : 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color; ctx.fillText(label, x, y)
      }

      function arrow(x1, y1, x2, y2, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
        const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)
        const ux = dx/len, uy = dy/len
        ctx.fillStyle = color
        ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-ux*9-uy*4,y2-uy*9+ux*4); ctx.lineTo(x2-ux*9+uy*4,y2-uy*9-ux*4); ctx.closePath(); ctx.fill()
      }

      const bGap = nodeGap * 1.15
      const prog = Math.min(aEls.length, Math.floor((t % 3000) / 500) + 1)

      if (phase === 0) {
        // Surjective: every b hit — 1→a, 2→a, 3→b, 4→c
        const maps = [[0,0,'#22c55e'],[1,0,'#22c55e'],[2,1,'#22c55e'],[3,2,'#22c55e']]
        const hitB = new Set(maps.slice(0,prog).map(([,bi])=>bi))
        aEls.forEach((el,i) => drawNode(leftX, topY+i*nodeGap, el, aColor, false))
        bEls.forEach((el,i) => drawNode(rightX, topY+i*bGap, el, hitB.has(i) ? '#22c55e' : bColor, hitB.has(i)))
        maps.slice(0,prog).forEach(([ai,bi,col]) => arrow(leftX+r, topY+ai*nodeGap, rightX-r, topY+bi*bGap, col))
        ctx.font = `bold ${Math.round(h*0.05)}px system-ui`; ctx.textAlign = 'center'
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText('SURJECTIVE (onto) ✓', cx, h*0.84)
        ctx.font = `${Math.round(h*0.038)}px system-ui`; ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText('Every element of B is hit', cx, h*0.90)
      } else {
        // NOT surjective: c never hit — 1→a, 2→a, 3→b, 4→b
        const maps = [[0,0,'#ef4444'],[1,0,'#ef4444'],[2,1,'#6366f1'],[3,1,'#6366f1']]
        const hitB = new Set(maps.slice(0,prog).map(([,bi])=>bi))
        aEls.forEach((el,i) => drawNode(leftX, topY+i*nodeGap, el, aColor, false))
        bEls.forEach((el,i) => {
          const hit = hitB.has(i)
          const missed = !hit && prog >= aEls.length
          drawNode(rightX, topY+i*bGap, el, missed ? '#ef4444' : (hit ? bColor : bColor), false)
          if (missed) {
            ctx.font = `${Math.round(h*0.055)}px system-ui`; ctx.fillStyle = '#ef4444'
            ctx.fillText('✗', rightX + r + 8, topY + i * bGap)
          }
        })
        maps.slice(0,prog).forEach(([ai,bi,col]) => arrow(leftX+r, topY+ai*nodeGap, rightX-r, topY+bi*bGap, col))
        ctx.font = `bold ${Math.round(h*0.05)}px system-ui`; ctx.textAlign = 'center'
        ctx.fillStyle = dark ? '#ef4444' : '#dc2626'
        ctx.fillText('NOT surjective ✗', cx, h*0.84)
        ctx.font = `${Math.round(h*0.038)}px system-ui`; ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText('c has no preimage in A', cx, h*0.90)
      }

      ctx.font = `bold ${Math.round(h*0.044)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = aColor; ctx.fillText('A', leftX, topY - 26)
      ctx.fillStyle = bColor; ctx.fillText('B', rightX, topY - 26)

      ;[0,1].forEach(i => {
        ctx.beginPath(); ctx.arc(cx-8+i*16, h-14, 4, 0, Math.PI*2)
        ctx.fillStyle = i === phase ? '#10b981' : (dark ? '#334155' : '#cbd5e1'); ctx.fill()
      })

      ctx.font = `bold ${Math.round(h*0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Surjective Functions', cx, 20)

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
