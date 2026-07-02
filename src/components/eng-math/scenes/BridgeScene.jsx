import { useEffect, useRef } from 'react'

export default function BridgeScene() {
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

    // Topics from Stage 0 on the left, Stage 1 topics on right, arrows flowing through bridge
    const STAGE0 = ['Sets', 'Logic', 'Functions', 'Relations', 'Proofs']
    const STAGE1 = ['Linear Algebra', 'Calculus', 'Probability', 'Discrete Math', 'Analysis']

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Bridge to Stage 1', cx, 20)

      // Column widths
      const colW = w * 0.22, bridgeW = w * 0.28
      const leftX = w * 0.04, rightX = w - colW - w * 0.04
      const bridgeX1 = leftX + colW, bridgeX2 = rightX

      // Bridge visual (central arch)
      const bY1 = h * 0.28, bY2 = h * 0.82
      const midBY = (bY1 + bY2) / 2
      const archH = h * 0.08
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(bridgeX1, bY1); ctx.lineTo(bridgeX1, bY2)
      ctx.moveTo(bridgeX2, bY1); ctx.lineTo(bridgeX2, bY2)
      // Top arch
      ctx.moveTo(bridgeX1, bY1)
      ctx.bezierCurveTo(bridgeX1, bY1 - archH, bridgeX2, bY1 - archH, bridgeX2, bY1)
      // Bottom arch
      ctx.moveTo(bridgeX1, bY2)
      ctx.bezierCurveTo(bridgeX1, bY2 + archH, bridgeX2, bY2 + archH, bridgeX2, bY2)
      ctx.stroke()

      // Bridge label
      ctx.font = `bold ${Math.round(h * 0.042)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('Foundation', cx, midBY - h * 0.06)
      ctx.fillText('Bridge', cx, midBY)

      // Flowing particle through bridge
      const particleT = (t % 2400) / 2400
      const particleX = bridgeX1 + (bridgeX2 - bridgeX1) * particleT
      const particleY = bY1 + (bY2 - bY1) * 0.5
      const glow = 0.5 + 0.5 * Math.sin(t / 300)
      ctx.beginPath(); ctx.arc(particleX, particleY, 6, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(245,158,11,${0.6 + 0.4 * glow})`; ctx.fill()
      // Trail
      for (let i = 1; i <= 4; i++) {
        const trail = particleT - i * 0.04
        if (trail < 0) continue
        const tx = bridgeX1 + (bridgeX2 - bridgeX1) * trail
        ctx.beginPath(); ctx.arc(tx, particleY, 3 - i * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,158,11,${0.3 / i})`; ctx.fill()
      }

      // Stage 0 items
      const itemH = (bY2 - bY1) / (STAGE0.length + 1)
      STAGE0.forEach((item, i) => {
        const iy = bY1 + (i + 1) * itemH
        const prog = Math.max(0, Math.min(1, t / 400 - i * 0.2))
        ctx.globalAlpha = prog
        ctx.beginPath(); ctx.roundRect(leftX, iy - 14, colW, 28, 6)
        ctx.fillStyle = dark ? '#6366f133' : '#6366f118'; ctx.fill()
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.036)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#6366f1'; ctx.fillText(item, leftX + colW / 2, iy)
        ctx.globalAlpha = 1

        // Arrow into bridge
        ctx.strokeStyle = '#6366f155'; ctx.lineWidth = 1; ctx.setLineDash([3, 4])
        ctx.beginPath(); ctx.moveTo(leftX + colW, iy); ctx.lineTo(bridgeX1, iy); ctx.stroke()
        ctx.setLineDash([])
      })

      // Stage 1 items
      STAGE1.forEach((item, i) => {
        const iy = bY1 + (i + 1) * itemH
        const prog = Math.max(0, Math.min(1, t / 400 - i * 0.2))
        ctx.globalAlpha = prog
        ctx.beginPath(); ctx.roundRect(rightX, iy - 14, colW, 28, 6)
        ctx.fillStyle = dark ? '#10b98133' : '#10b98118'; ctx.fill()
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.036)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#10b981'; ctx.fillText(item, rightX + colW / 2, iy)
        ctx.globalAlpha = 1

        // Arrow out of bridge
        ctx.strokeStyle = '#10b98155'; ctx.lineWidth = 1; ctx.setLineDash([3, 4])
        ctx.beginPath(); ctx.moveTo(bridgeX2, iy); ctx.lineTo(rightX, iy); ctx.stroke()
        ctx.setLineDash([])
      })

      // Column headers
      ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('Stage 0', leftX + colW / 2, bY1 - 18)
      ctx.fillStyle = '#10b981'
      ctx.fillText('Stage 1', rightX + colW / 2, bY1 - 18)

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
