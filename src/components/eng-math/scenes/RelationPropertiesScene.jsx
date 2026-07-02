import { useEffect, useRef } from 'react'

export default function RelationPropertiesScene() {
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

    function drawArrow(ctx2, x1, y1, x2, y2, color) {
      ctx2.strokeStyle = color; ctx2.lineWidth = 2
      ctx2.beginPath(); ctx2.moveTo(x1, y1); ctx2.lineTo(x2, y2); ctx2.stroke()
      const dx = x2 - x1, dy = y2 - y1
      const len = Math.sqrt(dx * dx + dy * dy)
      const ux = dx / len, uy = dy / len
      ctx2.fillStyle = color
      ctx2.beginPath()
      ctx2.moveTo(x2, y2)
      ctx2.lineTo(x2 - ux * 9 - uy * 4, y2 - uy * 9 + ux * 4)
      ctx2.lineTo(x2 - ux * 9 + uy * 4, y2 - uy * 9 - ux * 4)
      ctx2.closePath(); ctx2.fill()
    }

    function drawSelfLoop(ctx2, x, y, r, color) {
      ctx2.strokeStyle = color; ctx2.lineWidth = 2
      ctx2.beginPath()
      ctx2.arc(x + r * 0.6, y - r * 0.6, r * 0.55, 0, Math.PI * 2)
      ctx2.stroke()
    }

    function drawNode(ctx2, x, y, label, r, color) {
      ctx2.beginPath(); ctx2.arc(x, y, r, 0, Math.PI * 2)
      ctx2.fillStyle = dark2 ? '#1e293b' : '#f1f5f9'; ctx2.fill()
      ctx2.strokeStyle = color; ctx2.lineWidth = 1.5; ctx2.stroke()
      ctx2.font = `bold ${Math.round(h * 0.042)}px system-ui`
      ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle'
      ctx2.fillStyle = color; ctx2.fillText(label, x, y)
    }

    let dark2 = false

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')
      dark2 = dark

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // 3 mini diagrams side by side
      const panelW = (w - 24) / 3
      const panels = [
        { x: 12, label: 'Reflexive', color: '#6366f1', desc: '(a,a) ∈ R for all a' },
        { x: 12 + panelW + 6, label: 'Symmetric', color: '#10b981', desc: 'aRb ⟹ bRa' },
        { x: 12 + 2 * (panelW + 6), label: 'Transitive', color: '#f59e0b', desc: 'aRb ∧ bRc ⟹ aRc' },
      ]

      const nodeR = Math.min(14, panelW * 0.1)
      const cy2 = h * 0.52

      panels.forEach((panel, pi) => {
        const pcx = panel.x + panelW / 2

        // Panel background
        ctx.beginPath()
        ctx.roundRect(panel.x, h * 0.14, panelW, h * 0.72, 8)
        ctx.fillStyle = dark ? '#0f1a2e' : '#f8fafc'
        ctx.fill()
        ctx.strokeStyle = panel.color + '44'; ctx.lineWidth = 1.5; ctx.stroke()

        // Title
        ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = panel.color
        ctx.fillText(panel.label, pcx, h * 0.19)

        ctx.font = `${Math.round(h * 0.035)}px system-ui`
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.fillText(panel.desc, pcx, h * 0.84)

        if (pi === 0) {
          // Reflexive: nodes a,b,c all with self-loops
          const nodes = [{l:'a',x:pcx,y:cy2-30},{l:'b',x:pcx-28,y:cy2+25},{l:'c',x:pcx+28,y:cy2+25}]
          nodes.forEach(n => {
            drawSelfLoop(ctx, n.x, n.y, nodeR, panel.color)
            drawNode(ctx, n.x, n.y, n.l, nodeR, panel.color)
          })
        } else if (pi === 1) {
          // Symmetric: a↔b
          const ax = pcx - 30, bx = pcx + 30
          const nodeY = cy2
          // Forward arrow
          drawArrow(ctx, ax + nodeR, nodeY - 5, bx - nodeR, nodeY - 5, panel.color)
          // Backward arrow
          drawArrow(ctx, bx - nodeR, nodeY + 5, ax + nodeR, nodeY + 5, panel.color)
          drawNode(ctx, ax, nodeY, 'a', nodeR, panel.color)
          drawNode(ctx, bx, nodeY, 'b', nodeR, panel.color)
        } else {
          // Transitive: a→b→c, therefore a→c
          const ax = pcx - 34, bx = pcx, cx3 = pcx + 34
          const ty1 = cy2 - 20, ty2 = cy2 + 24, ty3 = cy2 - 20
          drawNode(ctx, ax, ty1, 'a', nodeR, panel.color)
          drawNode(ctx, bx, ty2, 'b', nodeR, panel.color)
          drawNode(ctx, cx3, ty3, 'c', nodeR, panel.color)
          drawArrow(ctx, ax + nodeR * 0.7, ty1 + nodeR * 0.7, bx - nodeR * 0.7, ty2 - nodeR * 0.7, panel.color)
          drawArrow(ctx, bx + nodeR * 0.7, ty2 - nodeR * 0.7, cx3 - nodeR * 0.7, ty3 + nodeR * 0.7, panel.color)
          // Transitive arrow (dashed, gold)
          const pulse = 0.5 + 0.5 * Math.sin(t / 400)
          ctx.setLineDash([5, 4])
          ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.globalAlpha = 0.5 + 0.5 * pulse
          ctx.beginPath()
          ctx.moveTo(ax + nodeR, ty1); ctx.lineTo(cx3 - nodeR, ty3)
          ctx.stroke()
          ctx.setLineDash([]); ctx.globalAlpha = 1
          ctx.fillStyle = '#f59e0b'
          ctx.font = `${Math.round(h * 0.034)}px system-ui`
          ctx.fillText('∴', pcx, cy2 - 32)
        }
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Three Key Properties of Relations', w / 2, 20)

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
