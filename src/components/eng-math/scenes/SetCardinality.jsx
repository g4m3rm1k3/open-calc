import { useEffect, useRef, useState } from 'react'

// Demonstrates |A| = n by counting elements one by one, then shows |∅| = 0

const SETS = [
  { label: 'A', elements: ['a', 'b', 'c', 'd', 'e'], color: '#818cf8' },
  { label: 'B', elements: ['1', '2', '3'], color: '#34d399' },
  { label: '∅', elements: [], color: '#94a3b8' },
]

export default function SetCardinality() {
  const canvasRef = useRef(null)
  const [setIdx, setSetIdx] = useState(0)
  const setIdxRef = useRef(0)

  useEffect(() => { setIdxRef.current = setIdx }, [setIdx])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let rafId
    let w, h

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function easeOut(t) { return 1 - Math.pow(1 - Math.min(t, 1), 3) }

    function draw(t) {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const set = SETS[setIdxRef.current]
      const n = set.elements.length
      const cx = w / 2
      const cy = h * 0.44

      // How many elements to show (count up over 2 seconds)
      const countProgress = Math.min(1, t / 2000)
      const visibleCount = n === 0 ? 0 : Math.ceil(countProgress * n)

      // Draw oval
      const rx = Math.min(w * 0.36, 170)
      const ry = rx * 0.52

      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = `${set.color}18`
      ctx.fill()
      ctx.strokeStyle = set.color
      ctx.lineWidth = 2
      ctx.setLineDash(n === 0 ? [6, 4] : [])
      ctx.stroke()
      ctx.setLineDash([])

      // Elements
      if (n > 0) {
        const cols = Math.min(n, 3)
        const rows = Math.ceil(n / cols)
        const sx = rx * 1.2 / cols
        const sy = ry * 1.1 / rows

        for (let i = 0; i < visibleCount; i++) {
          const col = i % cols
          const row = Math.floor(i / cols)
          const ex = cx - (cols - 1) * sx / 2 + col * sx
          const ey = cy - (rows - 1) * sy / 2 + row * sy

          const appear = easeOut(Math.min(1, (countProgress * n - i) * 2))

          ctx.save()
          ctx.globalAlpha = appear

          // Circle behind element
          ctx.beginPath()
          ctx.arc(ex, ey, 17, 0, Math.PI * 2)
          ctx.fillStyle = `${set.color}22`
          ctx.fill()
          ctx.strokeStyle = set.color
          ctx.lineWidth = 1.5
          ctx.stroke()

          ctx.font = 'bold 14px system-ui'
          ctx.fillStyle = set.color
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(set.elements[i], ex, ey)
          ctx.restore()
        }
      } else {
        // Empty set: show ∅ inside
        ctx.font = '28px system-ui'
        ctx.fillStyle = '#334155'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('(empty)', cx, cy)
      }

      // Cardinality display
      const countAlpha = n === 0 ? easeOut(Math.min(1, t / 800)) : easeOut(countProgress)
      ctx.save()
      ctx.globalAlpha = countAlpha

      const countStr = `|${set.label}| = ${visibleCount}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = 'bold 26px "JetBrains Mono", monospace'
      ctx.fillStyle = set.color
      ctx.fillText(countStr, cx, cy + ry + 44)

      if (visibleCount === n && countProgress > 0.95) {
        ctx.font = '12px system-ui'
        ctx.fillStyle = '#64748b'
        ctx.fillText(
          n === 0 ? 'The empty set has no elements.' : `${set.label} has exactly ${n} element${n !== 1 ? 's' : ''}.`,
          cx, cy + ry + 70
        )
      }
      ctx.restore()

      // Title
      ctx.globalAlpha = 0.8
      ctx.font = 'bold 12px system-ui'
      ctx.fillStyle = '#4f46e5'
      ctx.textAlign = 'center'
      ctx.fillText('CARDINALITY  |A|', w / 2, 22)
      ctx.globalAlpha = 1
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = (ts - start) % 4000
      draw(t < 200 ? 0 : t - 200)
      rafId = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [setIdx])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SETS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSetIdx(i)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
              setIdx === i
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {s.label === '∅' ? '∅ (empty)' : `Set ${s.label}`}
          </button>
        ))}
      </div>
    </div>
  )
}
