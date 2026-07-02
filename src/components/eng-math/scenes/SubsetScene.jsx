import { useEffect, useRef } from 'react'

// Two examples cycle: B ⊆ A (pass), then C ⊄ A (fail)
const EXAMPLES = [
  {
    A: [1, 2, 3, 4, 5],
    B: [2, 4],
    label: 'B ⊆ A',
    result: true,
    resultText: 'Every element of B is in A',
  },
  {
    A: [1, 2, 3, 4, 5],
    B: [2, 4, 7],
    label: 'C ⊄ A',
    result: false,
    resultText: '7 ∈ C but 7 ∉ A — not a subset',
  },
]

export default function SubsetScene() {
  const canvasRef = useRef(null)
  const tickRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      canvas.style.width = r.width + 'px'
      canvas.style.height = r.height + 'px'
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement)

    const isDark = () => document.documentElement.classList.contains('dark')

    function drawOval(ctx, x, y, rx, ry, fillColor, strokeColor, lineWidth) {
      ctx.beginPath()
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }

    function draw() {
      const ctx = canvas.getContext('2d')
      const W = canvas.width
      const H = canvas.height
      const dpr = window.devicePixelRatio || 1
      const dark = isDark()
      const t = tickRef.current++

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      const cycleTicks = 240
      const exIdx = Math.floor(t / cycleTicks) % EXAMPLES.length
      const elapsed = t % cycleTicks
      const ex = EXAMPLES[exIdx]

      const cx = W / 2
      const cy = H * 0.5

      // Title
      ctx.font = `bold ${13 * dpr}px Inter, system-ui, sans-serif`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.textAlign = 'center'
      ctx.fillText('SUBSET RELATION', cx, cy - 115 * dpr)

      // Outer oval (A)
      const aRx = 115 * dpr
      const aRy = 88 * dpr
      drawOval(
        ctx, cx, cy, aRx, aRy,
        dark ? 'rgba(99,102,241,0.08)' : 'rgba(79,70,229,0.06)',
        dark ? '#6366f1' : '#4f46e5',
        2.5 * dpr
      )

      // Inner oval (B or C) — drawn after elements appear
      const bRx = 56 * dpr
      const bRy = 40 * dpr
      const bCx = cx - 22 * dpr
      const bCy = cy + 5 * dpr
      const innerAlpha = Math.min(1, elapsed / 60)

      // Determine inner oval color based on result
      const innerStroke = ex.result
        ? (dark ? '#34d399' : '#10b981')
        : (dark ? '#f87171' : '#ef4444')
      const innerFill = ex.result
        ? (dark ? 'rgba(52,211,153,0.1)' : 'rgba(16,185,129,0.08)')
        : (dark ? 'rgba(248,113,113,0.1)' : 'rgba(239,68,68,0.08)')

      ctx.globalAlpha = innerAlpha
      drawOval(ctx, bCx, bCy, bRx, bRy, innerFill, innerStroke, 2 * dpr)
      ctx.globalAlpha = 1

      // A elements (not in B)
      const aOnly = ex.A.filter((n) => !ex.B.includes(n))
      const aOnlyPositions = [
        { x: cx + 60 * dpr, y: cy - 30 * dpr },
        { x: cx + 72 * dpr, y: cy + 25 * dpr },
        { x: cx - 10 * dpr, y: cy - 62 * dpr },
      ]
      aOnly.forEach((n, i) => {
        const pos = aOnlyPositions[i] || { x: cx + 60 * dpr, y: cy }
        ctx.font = `bold ${15 * dpr}px Inter, system-ui, sans-serif`
        ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(n), pos.x, pos.y)
      })

      // B/C elements
      const bPositions = [
        { x: bCx - 22 * dpr, y: bCy - 10 * dpr },
        { x: bCx + 18 * dpr, y: bCy + 8 * dpr },
        { x: bCx, y: bCy - 22 * dpr },
      ]
      ex.B.forEach((n, i) => {
        const pos = bPositions[i] || { x: bCx, y: bCy }
        const inA = ex.A.includes(n)

        // Elements outside A drift to the right
        const drawX = inA ? pos.x : cx + 125 * dpr
        const drawY = inA ? pos.y : cy

        ctx.font = `bold ${15 * dpr}px Inter, system-ui, sans-serif`
        ctx.fillStyle = inA
          ? (dark ? '#34d399' : '#059669')
          : (dark ? '#f87171' : '#dc2626')
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(n), drawX, drawY)

        // ✗ badge for elements outside A
        if (!inA && elapsed > 80) {
          ctx.font = `${12 * dpr}px Inter, system-ui, sans-serif`
          ctx.fillStyle = dark ? '#f87171' : '#dc2626'
          ctx.fillText('✗', drawX + 14 * dpr, drawY - 10 * dpr)
        }
      })
      ctx.textBaseline = 'alphabetic'

      // Labels
      ctx.font = `bold ${14 * dpr}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillStyle = dark ? '#818cf8' : '#4f46e5'
      ctx.fillText('A', cx + aRx - 16 * dpr, cy - aRy + 14 * dpr)
      ctx.fillStyle = innerStroke
      ctx.globalAlpha = innerAlpha
      ctx.fillText(ex.label.includes('C') ? 'C' : 'B', bCx - bRx + 6 * dpr, bCy - bRy)
      ctx.globalAlpha = 1

      // Result banner
      if (elapsed > 120) {
        const bannerAlpha = Math.min(1, (elapsed - 120) / 40)
        const bannerColor = ex.result
          ? (dark ? '#34d399' : '#059669')
          : (dark ? '#f87171' : '#dc2626')
        ctx.globalAlpha = bannerAlpha
        ctx.font = `bold ${13 * dpr}px Inter, system-ui, sans-serif`
        ctx.fillStyle = bannerColor
        ctx.textAlign = 'center'
        ctx.fillText(ex.label + ' — ' + (ex.result ? 'TRUE ✓' : 'FALSE ✗'), cx, cy + aRy + 26 * dpr)
        ctx.font = `${11 * dpr}px Inter, system-ui, sans-serif`
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
        ctx.fillText(ex.resultText, cx, cy + aRy + 44 * dpr)
        ctx.globalAlpha = 1
      }

      // Cycle dots
      const dotY = H - 20 * dpr
      for (let i = 0; i < EXAMPLES.length; i++) {
        ctx.beginPath()
        ctx.arc(cx + (i - 0.5) * 20 * dpr, dotY, 4 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = i === exIdx
          ? (dark ? '#818cf8' : '#4f46e5')
          : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
