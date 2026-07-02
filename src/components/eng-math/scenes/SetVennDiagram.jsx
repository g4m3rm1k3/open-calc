import { useEffect, useRef } from 'react'

// A = {1,2,3,4}  B = {3,4,5,6}  A∩B = {3,4}  A∪B = {1,2,3,4,5,6}

export default function SetVennDiagram() {
  const canvasRef = useRef(null)

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

    // Easing
    function easeOut(t) { return 1 - Math.pow(1 - Math.min(t, 1), 3) }
    function clamp01(v) { return Math.max(0, Math.min(1, v)) }

    function draw(t) {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h * 0.48
      const r = Math.min(w * 0.28, h * 0.30)
      const offset = r * 0.55

      const ax = cx - offset
      const bx = cx + offset

      // Phase timing (seconds)
      const p1 = easeOut(clamp01((t - 0) / 600))    // circle A appears
      const p2 = easeOut(clamp01((t - 400) / 700))   // elements in A
      const p3 = easeOut(clamp01((t - 900) / 600))   // circle B appears
      const p4 = easeOut(clamp01((t - 1300) / 700))  // elements in B
      const p5 = easeOut(clamp01((t - 2000) / 500))  // intersection glow
      const p6 = easeOut(clamp01((t - 2400) / 500))  // labels appear

      // Circle A
      if (p1 > 0) {
        ctx.save()
        ctx.globalAlpha = p1
        ctx.beginPath()
        ctx.arc(ax, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(99,102,241,0.12)'
        ctx.fill()
        ctx.strokeStyle = '#6366f1'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()
      }

      // Circle B
      if (p3 > 0) {
        ctx.save()
        ctx.globalAlpha = p3
        ctx.beginPath()
        ctx.arc(bx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(16,185,129,0.10)'
        ctx.fill()
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()
      }

      // Intersection glow
      if (p5 > 0) {
        ctx.save()
        ctx.globalAlpha = p5 * 0.25
        ctx.beginPath()
        // Clip to both circles to fill intersection
        ctx.arc(ax, cy, r, 0, Math.PI * 2)
        ctx.arc(bx, cy, r, 0, Math.PI * 2)
        // Use intersection approximation via clipping
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.5)
        grad.addColorStop(0, '#a78bfa')
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Elements in A only: 1, 2  (positions)
      const elemA = [
        { val: '1', x: ax - r * 0.42, y: cy - r * 0.18 },
        { val: '2', x: ax - r * 0.42, y: cy + r * 0.22 },
      ]
      // Elements in B only: 5, 6
      const elemB = [
        { val: '5', x: bx + r * 0.38, y: cy - r * 0.18 },
        { val: '6', x: bx + r * 0.38, y: cy + r * 0.22 },
      ]
      // Elements in A∩B: 3, 4
      const elemAB = [
        { val: '3', x: cx, y: cy - r * 0.16 },
        { val: '4', x: cx, y: cy + r * 0.20 },
      ]

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (const [arr, alpha, color] of [
        [elemA, p2, '#a5b4fc'],
        [elemB, p4, '#6ee7b7'],
        [elemAB, p4 * 0.5 + p5 * 0.5, '#c4b5fd'],
      ]) {
        for (const el of arr) {
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.font = 'bold 18px system-ui, sans-serif'
          ctx.fillStyle = color
          ctx.fillText(el.val, el.x, el.y)
          ctx.restore()
        }
      }

      // Set labels
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (p1 > 0) {
        ctx.save()
        ctx.globalAlpha = p1
        ctx.font = 'bold 15px system-ui, sans-serif'
        ctx.fillStyle = '#818cf8'
        ctx.fillText('A', ax - r + 6, cy - r - 14)
        ctx.restore()
      }
      if (p3 > 0) {
        ctx.save()
        ctx.globalAlpha = p3
        ctx.font = 'bold 15px system-ui, sans-serif'
        ctx.fillStyle = '#34d399'
        ctx.fillText('B', bx + r - 6, cy - r - 14)
        ctx.restore()
      }

      // Bottom labels
      if (p6 > 0) {
        const ly = cy + r + 32
        const labelColor = dark ? '#94a3b8' : '#64748b'
        const intersectColor = dark ? '#c4b5fd' : '#7c3aed'
        ctx.save()
        ctx.globalAlpha = p6
        ctx.textAlign = 'center'
        ctx.font = '13px "JetBrains Mono", monospace'
        ctx.fillStyle = labelColor
        ctx.fillText('A = {1, 2, 3, 4}', ax, ly)
        ctx.fillText('B = {3, 4, 5, 6}', bx, ly)
        ctx.font = 'bold 13px "JetBrains Mono", monospace'
        ctx.fillStyle = intersectColor
        ctx.fillText('A ∩ B = {3, 4}', cx, ly + 26)
        ctx.fillText('A ∪ B = {1, 2, 3, 4, 5, 6}', cx, ly + 48)
        ctx.restore()
      }

      // Title
      ctx.textAlign = 'center'
      ctx.font = 'bold 12px system-ui, sans-serif'
      ctx.fillStyle = '#4f46e5'
      ctx.globalAlpha = 0.8
      ctx.fillText('VENN DIAGRAM', w / 2, 22)
      ctx.globalAlpha = 1
    }

    const CYCLE = 5000
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = (ts - start) % (CYCLE * 1.4)
      draw(t)
      rafId = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
