import { useEffect, useRef } from 'react'

// Visualise 1 + 2 + 3 + 4 + 5 + 6 = 21 = 6×7/2
// Show stacks of blocks, then flip and pair to form a rectangle

const N = 6

export default function GaussSumScene() {
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

    function easeOut(t) { return 1 - Math.pow(1 - Math.min(t, 1), 3) }
    function easeInOut(t) { return t < 0.5 ? 2*t*t : 1-2*(1-t)*(1-t) }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const CYCLE = 8000
      const phase = (t % CYCLE) / CYCLE

      // Phase 0-0.35: staircase appears
      // Phase 0.35-0.65: flip/pair animation
      // Phase 0.65-1.0: rectangle with formula

      const cellSize = Math.min((w - 40) / (N * 2 + 1), (h - 80) / (N + 1), 32)
      const totalW = N * cellSize
      const totalH = N * cellSize
      const startX = (w - totalW * 2 - cellSize * 0.5) / 2
      const groundY = h * 0.72

      const buildProgress = Math.min(1, phase / 0.35)
      const flipProgress = phase > 0.35 ? Math.min(1, (phase - 0.35) / 0.30) : 0
      const showRect = phase > 0.65

      // Draw original staircase (left side)
      for (let col = 0; col < N; col++) {
        const height = col + 1
        const bx = startX + col * cellSize
        for (let row = 0; row < height; row++) {
          const by = groundY - (row + 1) * cellSize
          const appear = easeOut(Math.min(1, buildProgress * N - col + 0.5))
          if (appear <= 0) continue
          ctx.save()
          ctx.globalAlpha = appear * (flipProgress > 0 ? (1 - flipProgress * 0.6) : 1)
          const hue = `hsl(${230 + col * 12}, 70%, ${dark ? 55 : 45}%)`
          ctx.fillStyle = hue + '44'
          ctx.strokeStyle = hue
          ctx.lineWidth = 1
          ctx.fillRect(bx + 1, by + 1, cellSize - 2, cellSize - 2)
          ctx.strokeRect(bx + 1, by + 1, cellSize - 2, cellSize - 2)
          if (row === 0) {
            ctx.font = `bold ${Math.round(cellSize * 0.35)}px "JetBrains Mono", monospace`
            ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillText(String(col + 1), bx + cellSize / 2, groundY - cellSize / 2)
          }
          ctx.restore()
        }
      }

      // Flip staircase (mirror image appears to the right)
      if (flipProgress > 0) {
        for (let col = 0; col < N; col++) {
          const mirrorHeight = N - col  // N, N-1, ..., 1
          const bx = startX + totalW + cellSize * 0.5 + col * cellSize
          for (let row = 0; row < mirrorHeight; row++) {
            const by = groundY - (row + 1) * cellSize
            const appear = easeOut(Math.min(1, flipProgress * N - col + 0.5))
            if (appear <= 0) continue
            ctx.save()
            ctx.globalAlpha = appear
            const hue = `hsl(${156 + col * 10}, 70%, ${dark ? 55 : 45}%)`
            ctx.fillStyle = hue + '44'
            ctx.strokeStyle = hue
            ctx.lineWidth = 1
            ctx.fillRect(bx + 1, by + 1, cellSize - 2, cellSize - 2)
            ctx.strokeRect(bx + 1, by + 1, cellSize - 2, cellSize - 2)
            ctx.restore()
          }
        }
      }

      // Ground line
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(startX - 8, groundY)
      ctx.lineTo(startX + totalW * 2 + cellSize * 0.5 + 8, groundY)
      ctx.stroke()

      // "+" symbol
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      if (flipProgress > 0) {
        ctx.fillText('+', startX + totalW + cellSize / 4, groundY - totalH / 2)
      }

      // Rectangle overlay
      if (showRect) {
        const rectAlpha = easeOut((phase - 0.65) / 0.2)
        ctx.save()
        ctx.globalAlpha = rectAlpha * 0.15
        ctx.fillStyle = '#6366f1'
        ctx.fillRect(startX, groundY - totalH, totalW * 2 + cellSize * 0.5, totalH)
        ctx.restore()
        ctx.save()
        ctx.globalAlpha = rectAlpha
        ctx.strokeStyle = dark ? '#818cf8' : '#4f46e5'
        ctx.lineWidth = 2.5
        ctx.strokeRect(startX, groundY - totalH, totalW * 2 + cellSize * 0.5, totalH)
        ctx.restore()
        // Dimensions
        ctx.font = 'bold 11px "JetBrains Mono", monospace'
        ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'
        ctx.textAlign = 'center'
        ctx.save(); ctx.globalAlpha = rectAlpha
        ctx.fillText(`n = ${N}`, startX + totalW + cellSize * 0.25, groundY + 14)
        ctx.fillText(`n+1 = ${N+1}`, startX + totalW + cellSize * 0.25, groundY - totalH - 10)
        ctx.restore()
      }

      // Formula at bottom
      ctx.font = 'bold 14px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      const formulaY = groundY + (showRect ? 32 : 18)
      const sum = N * (N + 1) / 2

      if (buildProgress > 0.7) {
        ctx.fillStyle = dark ? '#94a3b8' : '#475569'
        ctx.font = '12px "JetBrains Mono", monospace'
        ctx.fillText(`1 + 2 + 3 + 4 + 5 + 6 = ${sum}`, w / 2, formulaY)
      }
      if (showRect) {
        ctx.font = 'bold 14px "JetBrains Mono", monospace'
        ctx.fillStyle = dark ? '#c4b5fd' : '#7c3aed'
        ctx.fillText(`n(n+1)/2 = ${N}×${N+1}/2 = ${sum}`, w / 2, formulaY + 20)
      }

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#6366f1'; ctx.textAlign = 'center'
      ctx.fillText('THE GAUSS SUM', w / 2, 20)
      ctx.globalAlpha = 1

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
