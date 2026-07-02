import { useEffect, useRef } from 'react'

export default function TautologyScene() {
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
      // Animate rows filling in
      const activeRow = Math.floor(t / 900) % 4

      const colW = w * 0.22
      const startY = h * 0.28
      const rowH = Math.round(h * 0.13)

      // Headers
      const headers = ['P', '¬P', 'P ∨ ¬P', 'P ∧ ¬P']
      const cols = [cx - colW * 1.5, cx - colW * 0.5, cx + colW * 0.5, cx + colW * 1.5]

      ctx.font = `bold ${Math.round(h * 0.05)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      headers.forEach((h2, i) => {
        const color = i === 2 ? (dark ? '#22c55e' : '#16a34a')
          : i === 3 ? (dark ? '#ef4444' : '#dc2626')
          : (dark ? '#94a3b8' : '#64748b')
        ctx.fillStyle = color
        ctx.fillText(h2, cols[i], h * 0.17)
      })

      // Divider
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - colW * 2, h * 0.21); ctx.lineTo(cx + colW * 2, h * 0.21); ctx.stroke()

      // Rows
      const data = [
        [true, false, true, false],
        [false, true, true, false],
      ]

      data.forEach((row, i) => {
        const y = startY + i * rowH * 1.5
        const show = (t / 700) > i

        row.forEach((val, j) => {
          if (!show) return
          const isTaut = j === 2
          const isContra = j === 3
          let color
          if (isTaut) color = dark ? '#22c55e' : '#16a34a'
          else if (isContra) color = dark ? '#ef4444' : '#dc2626'
          else color = dark ? '#94a3b8' : '#64748b'

          ctx.font = `bold ${Math.round(h * 0.065)}px "JetBrains Mono", monospace`
          ctx.fillStyle = color
          ctx.fillText(val ? 'T' : 'F', cols[j], y)
        })
      })

      // Labels with glow
      const tautGlow = 0.7 + 0.3 * Math.sin(t / 500)
      const contraGlow = 0.7 + 0.3 * Math.sin(t / 500 + Math.PI)

      const labelY = startY + 2 * rowH * 1.5 + 18

      // Tautology label
      ctx.save()
      ctx.shadowColor = dark ? '#22c55e' : '#16a34a'
      ctx.shadowBlur = 12 * tautGlow
      ctx.font = `bold ${Math.round(h * 0.055)}px system-ui`
      ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
      ctx.fillText('TAUTOLOGY', cols[2], labelY)
      ctx.font = `${Math.round(h * 0.038)}px system-ui`
      ctx.fillText('Always TRUE', cols[2], labelY + 20)
      ctx.restore()

      // Contradiction label
      ctx.save()
      ctx.shadowColor = dark ? '#ef4444' : '#dc2626'
      ctx.shadowBlur = 12 * contraGlow
      ctx.font = `bold ${Math.round(h * 0.055)}px system-ui`
      ctx.fillStyle = dark ? '#ef4444' : '#dc2626'
      ctx.fillText('CONTRADICTION', cols[3], labelY)
      ctx.font = `${Math.round(h * 0.038)}px system-ui`
      ctx.fillText('Always FALSE', cols[3], labelY + 20)
      ctx.restore()

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Tautologies and Contradictions', cx, 20)

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
