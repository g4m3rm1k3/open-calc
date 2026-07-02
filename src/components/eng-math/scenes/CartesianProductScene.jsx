import { useEffect, useRef } from 'react'

const A = ['1', '2', '3']
const B = ['a', 'b', 'c']

// All pairs in A×B
const PAIRS = A.flatMap(a => B.map(b => ({ a, b, label: `(${a},${b})` })))

export default function CartesianProductScene() {
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

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const CYCLE = 9000
      const progress = (t % CYCLE) / CYCLE

      // How many pairs to highlight (cycle through one at a time)
      const highlightIdx = Math.floor(progress * PAIRS.length) % PAIRS.length

      const cellSize = Math.min((w - 80) / (B.length + 1), (h - 120) / (A.length + 1), 58)
      const gridX = (w - cellSize * (B.length + 1)) / 2
      const gridY = 52

      // Column headers (B elements)
      ctx.font = 'bold 14px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#34d399' : '#047857'
      for (let c = 0; c < B.length; c++) {
        ctx.fillText(B[c], gridX + (c + 1) * cellSize + cellSize / 2, gridY + cellSize / 2)
      }

      // Row headers (A elements)
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      for (let r = 0; r < A.length; r++) {
        ctx.fillText(A[r], gridX + cellSize / 2, gridY + (r + 1) * cellSize + cellSize / 2)
      }

      // "B →" and "A ↓" axis labels
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = dark ? '#34d399' : '#047857'
      ctx.fillText('B →', gridX + cellSize + cellSize * B.length / 2 + cellSize / 2, gridY + 12)
      ctx.save()
      ctx.translate(gridX + 14, gridY + cellSize + cellSize * A.length / 2 + cellSize / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      ctx.fillText('A ↓', 0, 0)
      ctx.restore()

      // Grid cells
      for (let r = 0; r < A.length; r++) {
        for (let c = 0; c < B.length; c++) {
          const pairIdx = r * B.length + c
          const pair = PAIRS[pairIdx]
          const cx = gridX + (c + 1) * cellSize + cellSize / 2
          const cy = gridY + (r + 1) * cellSize + cellSize / 2
          const isHighlighted = pairIdx === highlightIdx

          // Cell background
          ctx.fillStyle = isHighlighted
            ? (dark ? 'rgba(167,139,250,0.25)' : 'rgba(124,58,237,0.15)')
            : (dark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)')
          ctx.fillRect(
            gridX + (c + 1) * cellSize, gridY + (r + 1) * cellSize,
            cellSize, cellSize
          )

          // Cell border
          ctx.strokeStyle = isHighlighted
            ? (dark ? '#a78bfa' : '#7c3aed')
            : (dark ? '#1e293b' : '#e2e8f0')
          ctx.lineWidth = isHighlighted ? 2 : 0.5
          ctx.strokeRect(
            gridX + (c + 1) * cellSize, gridY + (r + 1) * cellSize,
            cellSize, cellSize
          )

          // Pair text
          ctx.font = `${isHighlighted ? 'bold ' : ''}11px "JetBrains Mono", monospace`
          ctx.fillStyle = isHighlighted
            ? (dark ? '#c4b5fd' : '#5b21b6')
            : (dark ? '#64748b' : '#94a3b8')
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(pair.label, cx, cy)
        }
      }

      // Header borders
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'
      ctx.lineWidth = 1
      ctx.strokeRect(gridX, gridY, cellSize * (B.length + 1), cellSize * (A.length + 1))

      // Highlighted pair callout
      const hPair = PAIRS[highlightIdx]
      ctx.font = 'bold 18px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = dark ? '#c4b5fd' : '#7c3aed'
      ctx.fillText(hPair.label, w / 2, gridY + (A.length + 1) * cellSize + 30)
      ctx.font = '12px system-ui'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText(`from A=${hPair.a}, from B=${hPair.b}`, w / 2, gridY + (A.length + 1) * cellSize + 52)

      // Set labels
      ctx.font = '12px "JetBrains Mono", monospace'
      ctx.fillStyle = dark ? '#818cf8' : '#4338ca'
      ctx.fillText('A = {1, 2, 3}', w * 0.25, h - 18)
      ctx.fillStyle = dark ? '#34d399' : '#047857'
      ctx.fillText('B = {a, b, c}', w * 0.68, h - 18)

      ctx.globalAlpha = 0.8
      ctx.font = 'bold 11px system-ui'
      ctx.fillStyle = '#6366f1'
      ctx.fillText('CARTESIAN PRODUCT  A × B', w / 2, 20)
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
