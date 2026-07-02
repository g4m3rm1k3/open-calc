import { useEffect, useRef } from 'react'

export default function DomainCodomainScene() {
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
      // f: {1,2,3} → {a,b,c,d}   where f(1)=a, f(2)=b, f(3)=a
      // Image = {a,b}; codomain = {a,b,c,d}

      const leftX = cx - w * 0.26, rightX = cx + w * 0.26
      const ellH = Math.min(h * 0.48, 145)
      const ellW = Math.min(w * 0.2, 68)
      const cy2 = h * 0.50

      // Domain ellipse (A)
      ctx.beginPath()
      ctx.ellipse(leftX, cy2, ellW, ellH, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#1e3a5f22' : '#dbeafe44'
      ctx.fill()
      ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.stroke()

      // Codomain ellipse (B) — larger
      ctx.beginPath()
      ctx.ellipse(rightX, cy2, ellW, ellH, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#1e2d4022' : '#f0fdf444'
      ctx.fill()
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.stroke()

      // Image region inside B (a,b only)
      const imgPulse = 0.6 + 0.4 * Math.sin(t / 600)
      ctx.beginPath()
      ctx.ellipse(rightX, cy2 - ellH * 0.15, ellW * 0.65, ellH * 0.5, 0, 0, Math.PI * 2)
      ctx.fillStyle = dark ? `rgba(251,191,36,${0.2 * imgPulse})` : `rgba(251,191,36,${0.25 * imgPulse})`
      ctx.fill()
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke()
      ctx.setLineDash([])

      // Domain elements
      const domEls = [{l:'1',y:cy2-38},{l:'2',y:cy2},{l:'3',y:cy2+38}]
      domEls.forEach(({l,y}) => {
        ctx.beginPath(); ctx.arc(leftX, y, 12, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'; ctx.fill()
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#6366f1'; ctx.fillText(l, leftX, y)
      })

      // Codomain elements
      const codEls = [{l:'a',y:cy2-55},{l:'b',y:cy2-18},{l:'c',y:cy2+25},{l:'d',y:cy2+55}]
      codEls.forEach(({l,y}) => {
        const inImage = l === 'a' || l === 'b'
        ctx.beginPath(); ctx.arc(rightX, y, 12, 0, Math.PI * 2)
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'; ctx.fill()
        ctx.strokeStyle = inImage ? '#f59e0b' : '#10b981'; ctx.lineWidth = inImage ? 2 : 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = inImage ? '#f59e0b' : '#10b981'; ctx.fillText(l, rightX, y)
      })

      // Arrows f(1)=a, f(2)=b, f(3)=a
      const mappings = [[cy2-38,cy2-55],[cy2,cy2-18],[cy2+38,cy2-55]]
      const prog = Math.min(mappings.length, Math.floor(t / 600) + 1)
      mappings.slice(0, prog).forEach(([dy, ry]) => {
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(leftX + 12, dy); ctx.lineTo(rightX - 12, ry); ctx.stroke()
      })

      // Labels
      ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('Domain', leftX, h * 0.15)
      ctx.fillStyle = '#10b981'
      ctx.fillText('Codomain', rightX, h * 0.15)
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('Image', rightX, cy2 - ellH * 0.6)

      // f arrow label
      ctx.font = `bold ${Math.round(h * 0.052)}px system-ui`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText('f', cx, cy2 - ellH * 0.7)

      // Bottom
      ctx.font = `${Math.round(h * 0.038)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText('Image ⊆ Codomain   (image may be smaller)', cx, h - 18)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Domain, Codomain, and Image', cx, 20)

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
