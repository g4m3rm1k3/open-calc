import { useEffect, useRef, useState } from 'react'

// S = {2, 4, 6, 8, 10}
// Demonstrates x ∈ S (true) and x ∉ S (false)

const SET_ELEMENTS = [2, 4, 6, 8, 10]
const TESTS = [
  { val: 4,  inSet: true,  label: '4 ∈ S' },
  { val: 7,  inSet: false, label: '7 ∉ S' },
  { val: 10, inSet: true,  label: '10 ∈ S' },
  { val: 3,  inSet: false, label: '3 ∉ S' },
]

export default function SetMembership() {
  const canvasRef = useRef(null)
  const [testIdx, setTestIdx] = useState(0)
  const testIdxRef = useRef(0)

  useEffect(() => {
    testIdxRef.current = testIdx
  }, [testIdx])

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

      const cx = w / 2
      const cy = h * 0.46
      const rx = Math.min(w * 0.34, 160)
      const ry = rx * 0.58

      // Draw the set oval
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(99,102,241,0.1)'
      ctx.fill()
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label S
      ctx.font = 'bold 16px system-ui'
      ctx.fillStyle = '#818cf8'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('S', cx - rx - 18, cy - ry + 12)

      // Elements inside the set
      const spacing = (rx * 1.6) / (SET_ELEMENTS.length + 1)
      const startX = cx - rx + spacing
      ctx.textAlign = 'center'
      ctx.font = 'bold 15px system-ui'

      const test = TESTS[testIdxRef.current]
      for (let i = 0; i < SET_ELEMENTS.length; i++) {
        const ex = startX + i * spacing
        const ey = cy + (i % 2 === 0 ? -12 : 12)
        const isHighlighted = SET_ELEMENTS[i] === test.val

        if (isHighlighted && test.inSet) {
          // Glow on target element
          const glow = 0.5 + 0.5 * Math.sin(t * 0.005)
          ctx.save()
          ctx.shadowColor = '#a78bfa'
          ctx.shadowBlur = 15 * glow
          ctx.fillStyle = '#c4b5fd'
          ctx.fillText(String(SET_ELEMENTS[i]), ex, ey)
          ctx.restore()
        } else {
          ctx.fillStyle = '#64748b'
          ctx.fillText(String(SET_ELEMENTS[i]), ex, ey)
        }
      }

      // Test element (outside if not in set)
      const progress = easeOut(Math.min(1, (t % 3000) / 1200))

      if (!test.inSet) {
        // Animate element approaching from outside, stopping outside the boundary
        const targetX = cx + rx + 50
        const startPos = cx + rx + 120
        const ex = startPos - (startPos - targetX) * progress
        const ey = cy

        ctx.font = 'bold 18px system-ui'
        ctx.fillStyle = '#f87171'
        ctx.textAlign = 'center'
        ctx.fillText(String(test.val), ex, ey)

        // ∉ symbol
        if (progress > 0.7) {
          const symAlpha = easeOut((progress - 0.7) / 0.3)
          ctx.save()
          ctx.globalAlpha = symAlpha
          ctx.font = 'bold 22px system-ui'
          ctx.fillStyle = '#f87171'
          ctx.fillText('∉ S', ex + 30, ey - 28)
          ctx.restore()
        }

        // Barrier at set boundary
        if (progress > 0.6) {
          const barrierAlpha = easeOut((progress - 0.6) / 0.4)
          ctx.save()
          ctx.globalAlpha = barrierAlpha * 0.6
          ctx.strokeStyle = '#f87171'
          ctx.lineWidth = 2
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(cx + rx + 15, cy - 30)
          ctx.lineTo(cx + rx + 15, cy + 30)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.restore()
        }
      }

      // Bottom label
      if (progress > 0.6) {
        const labelAlpha = easeOut((progress - 0.6) / 0.4)
        ctx.save()
        ctx.globalAlpha = labelAlpha
        ctx.textAlign = 'center'
        ctx.font = 'bold 16px "JetBrains Mono", monospace'
        ctx.fillStyle = test.inSet ? '#a78bfa' : '#f87171'
        ctx.fillText(test.label, cx, cy + ry + 34)
        ctx.restore()
      }

      // Set definition
      ctx.textAlign = 'center'
      ctx.font = '13px "JetBrains Mono", monospace'
      ctx.fillStyle = '#475569'
      ctx.fillText('S = {2, 4, 6, 8, 10}', cx, h - 30)

      // Title
      ctx.font = 'bold 12px system-ui'
      ctx.fillStyle = '#4f46e5'
      ctx.globalAlpha = 0.8
      ctx.fillText('SET MEMBERSHIP', w / 2, 22)
      ctx.globalAlpha = 1
    }

    let start
    function loop(ts) {
      if (!start) start = ts
      draw(ts - start)
      rafId = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [testIdx])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Test selector buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {TESTS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTestIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
              testIdx === i
                ? t.inSet
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-red-600 border-red-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
