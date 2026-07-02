import { useEffect, useRef } from 'react'

export default function BijectiveScene() {
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

      const cx = w / 2
      const leftX = cx - w * 0.22, rightX = cx + w * 0.22
      const els = ['1','2','3','4']
      const topY = h * 0.22, r = 14, nodeGap = Math.min(h * 0.155, 50)
      const color = '#f59e0b'
      const prog = Math.min(els.length, Math.floor(t / 600) % (els.length + 2) + 1)
      const fwdProg = Math.min(els.length, prog)
      const showReverse = prog > els.length

      function drawNode(x, y, label) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'; ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color; ctx.fillText(label, x, y)
      }

      function arrowBetween(x1, y1, x2, y2, col, dash) {
        if (dash) ctx.setLineDash([5, 4])
        ctx.strokeStyle = col; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
        ctx.setLineDash([])
        const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy)
        const ux = dx/len, uy = dy/len
        ctx.fillStyle = col
        ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-ux*9-uy*4,y2-uy*9+ux*4); ctx.lineTo(x2-ux*9+uy*4,y2-uy*9-ux*4); ctx.closePath(); ctx.fill()
      }

      els.forEach((el, i) => {
        drawNode(leftX, topY + i * nodeGap, el)
        drawNode(rightX, topY + i * nodeGap, ['a','b','c','d'][i])
      })

      // Forward arrows f
      els.slice(0, fwdProg).forEach((_, i) => {
        arrowBetween(leftX+r, topY+i*nodeGap, rightX-r, topY+i*nodeGap, color, false)
      })

      // Reverse arrows f⁻¹ (dashed, purple)
      if (showReverse) {
        els.forEach((_, i) => {
          arrowBetween(rightX-r-5, topY+i*nodeGap+5, leftX+r+5, topY+i*nodeGap+5, '#a855f7', true)
        })
      }

      ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = color; ctx.fillText('A', leftX, topY - 28)
      ctx.fillStyle = color; ctx.fillText('B', rightX, topY - 28)

      // Labels for arrows
      ctx.font = `${Math.round(h * 0.042)}px system-ui`
      ctx.fillStyle = color
      ctx.fillText('f →', cx, topY + els.length * nodeGap * 0.3)
      if (showReverse) {
        ctx.fillStyle = '#a855f7'
        ctx.fillText('← f⁻¹', cx, topY + els.length * nodeGap * 0.55)
      }

      // Bottom labels
      const botY = topY + (els.length - 1) * nodeGap + r + 22
      ctx.font = `bold ${Math.round(h * 0.052)}px system-ui`
      ctx.fillStyle = color
      ctx.fillText('BIJECTIVE ✓', cx, botY)
      ctx.font = `${Math.round(h * 0.038)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('Injective ∧ Surjective  →  Inverse exists', cx, botY + 20)
      ctx.fillText(`|A| = |B| = ${els.length}  (equal cardinality)`, cx, botY + 38)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Bijective Functions', cx, 20)

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
