import { useEffect, useRef } from 'react'

export default function RelationExamplesScene() {
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

    const RELATIONS = [
      {
        name: '≤ on {1,2,3,4}',
        desc: 'a ≤ b',
        color: '#6366f1',
        elements: [1, 2, 3, 4],
        pairs: [[1,1],[1,2],[1,3],[1,4],[2,2],[2,3],[2,4],[3,3],[3,4],[4,4]],
      },
      {
        name: '| divides on {1,2,3,6}',
        desc: 'a divides b',
        color: '#10b981',
        elements: [1, 2, 3, 6],
        pairs: [[1,1],[1,2],[1,3],[1,6],[2,2],[2,6],[3,3],[3,6],[6,6]],
      },
      {
        name: 'same parity on {1,2,3,4}',
        desc: 'a ≡ b (mod 2)',
        color: '#f59e0b',
        elements: [1, 2, 3, 4],
        pairs: [[1,1],[1,3],[3,1],[3,3],[2,2],[2,4],[4,2],[4,4]],
      },
    ]

    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const relIdx = Math.floor(t / 3000) % RELATIONS.length
      const { name, desc, color, elements, pairs } = RELATIONS[relIdx]
      const animPairs = Math.min(pairs.length, Math.floor((t % 3000) / 250))

      const cx = w / 2
      const leftX = cx - w * 0.22
      const rightX = cx + w * 0.22
      const startY = h * 0.22
      const elemGap = (h * 0.58) / (elements.length - 1)
      const r = 16

      // Column labels
      ctx.font = `bold ${Math.round(h * 0.045)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = color
      ctx.fillText('A', leftX, startY - 28)
      ctx.fillText('B', rightX, startY - 28)

      // Draw element nodes
      function nodeY(i) { return startY + i * elemGap }

      elements.forEach((el, i) => {
        ;[leftX, rightX].forEach(x => {
          ctx.beginPath()
          ctx.arc(x, nodeY(i), r, 0, Math.PI * 2)
          ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'
          ctx.fill()
          ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke()
          ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
          ctx.fillStyle = color
          ctx.fillText(el, x, nodeY(i))
        })
      })

      // Draw arrows for each revealed pair
      pairs.slice(0, animPairs).forEach(([a, b]) => {
        const ai = elements.indexOf(a)
        const bi = elements.indexOf(b)
        const x1 = leftX + r, y1 = nodeY(ai)
        const x2 = rightX - r, y2 = nodeY(bi)

        const isSelf = a === b
        if (isSelf) {
          // Self-loop
          ctx.strokeStyle = color + 'aa'; ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(leftX, y1 - r, r, Math.PI * 0.2, Math.PI * 1.8)
          ctx.stroke()
        } else {
          ctx.strokeStyle = color + '99'; ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(x1, y1); ctx.lineTo(x2 - 8, y2)
          ctx.stroke()
          // Arrowhead
          const dx = x2 - x1, dy = y2 - y1
          const len = Math.sqrt(dx * dx + dy * dy)
          const ux = dx / len, uy = dy / len
          ctx.fillStyle = color + 'cc'
          ctx.beginPath()
          ctx.moveTo(x2, y2)
          ctx.lineTo(x2 - ux * 10 - uy * 5, y2 - uy * 10 + ux * 5)
          ctx.lineTo(x2 - ux * 10 + uy * 5, y2 - uy * 10 - ux * 5)
          ctx.closePath(); ctx.fill()
        }
      })

      // Name & desc
      ctx.font = `bold ${Math.round(h * 0.052)}px "JetBrains Mono", monospace`
      ctx.fillStyle = color
      ctx.fillText(name, cx, h * 0.88)
      ctx.font = `${Math.round(h * 0.04)}px system-ui`
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText(desc, cx, h * 0.93)

      // Mode dots
      RELATIONS.forEach((_, i) => {
        ctx.beginPath()
        ctx.arc(cx - (RELATIONS.length - 1) * 8 + i * 16, h - 10, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === relIdx ? color : (dark ? '#334155' : '#cbd5e1')
        ctx.fill()
      })

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Examples of Relations', cx, 20)

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
