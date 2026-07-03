import { useEffect, useRef } from 'react'

export default function YScene() {
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
    function draw(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // ── your drawing code here ─────────────────────────────
      const cx = w / 2, cy = h / 2

      ctx.font = `bold ${Math.round(h * 0.06)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('YScene', cx, cy)
      // ──────────────────────────────────────────────────────

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
