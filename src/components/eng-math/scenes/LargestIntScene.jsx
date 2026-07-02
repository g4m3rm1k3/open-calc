import { useEffect, useRef } from 'react'

export default function LargestIntScene() {
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

    // Contradicting assumption: suppose there IS a largest integer N
    // Then N+1 > N — contradiction. Proof by contradiction visual.
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const phase = Math.floor(t / 2400) % 4
      const prog = Math.min(1, (t % 2400) / 1600)

      // Number line
      const lineY = h * 0.44
      const lineX1 = w * 0.08, lineX2 = w * 0.92
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(lineX1, lineY); ctx.lineTo(lineX2, lineY); ctx.stroke()
      // Arrow
      ctx.fillStyle = dark ? '#334155' : '#cbd5e1'
      ctx.beginPath(); ctx.moveTo(lineX2, lineY)
      ctx.lineTo(lineX2 - 8, lineY - 4); ctx.lineTo(lineX2 - 8, lineY + 4); ctx.closePath(); ctx.fill()

      // Ticks
      const NUMS = [-2, -1, 0, 1, 2, 3, 'N', 'N+1']
      const totalSpan = lineX2 - lineX1 - 40
      const spacing = totalSpan / (NUMS.length - 1)
      NUMS.forEach((n, i) => {
        const tx = lineX1 + i * spacing
        ctx.strokeStyle = dark ? '#475569' : '#94a3b8'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(tx, lineY - 6); ctx.lineTo(tx, lineY + 6); ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        const isN = n === 'N', isNp1 = n === 'N+1'
        ctx.fillStyle = isN ? '#f59e0b' : isNp1 ? '#ef4444' : (dark ? '#475569' : '#94a3b8')
        if ((isN && prog > 0.3) || (isNp1 && prog > 0.6 && phase >= 1) || (!isN && !isNp1)) {
          ctx.fillText(n, tx, lineY + 10)
        }
      })

      // Phase 0: Assumption
      ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('Assume ∃ a largest integer N', cx, h * 0.16)

      if (phase >= 0 && prog > 0.3) {
        // Show N marker
        const nx = lineX1 + 6 * spacing
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
        ctx.beginPath(); ctx.moveTo(nx, lineY - 20); ctx.lineTo(nx, h * 0.24); ctx.stroke()
        ctx.setLineDash([])
        ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
        ctx.fillStyle = '#f59e0b'; ctx.fillText('N is largest', nx, h * 0.22)
      }

      if (phase >= 1 && prog > 0.3) {
        // Show N+1
        const np1x = lineX1 + 7 * spacing
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(np1x, lineY - 20); ctx.lineTo(np1x, h * 0.27); ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
        ctx.fillStyle = '#ef4444'; ctx.fillText('But N+1 exists...', np1x, h * 0.25)
      }

      if (phase >= 2) {
        // Contradiction arrow N+1 > N
        const nx = lineX1 + 6 * spacing, np1x = lineX1 + 7 * spacing
        const arcY = lineY - 38
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc((nx + np1x) / 2, arcY, (np1x - nx) / 2, Math.PI, 0)
        ctx.stroke()
        ctx.fillStyle = '#ef4444'
        ctx.beginPath(); ctx.moveTo(np1x, arcY)
        ctx.lineTo(np1x - 6, arcY + 8); ctx.lineTo(np1x + 6, arcY + 8); ctx.closePath(); ctx.fill()
        ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
        ctx.textAlign = 'center'
        ctx.fillText('N+1 > N  ⟹  N not largest!', cx, lineY - 64)
      }

      if (phase >= 3) {
        ctx.font = `bold ${Math.round(h * 0.05)}px system-ui`
        ctx.fillStyle = dark ? '#22c55e' : '#16a34a'
        ctx.fillText('⊥ Contradiction — no largest integer exists', cx, h * 0.78)
      }

      // QED marker
      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('No Largest Integer', cx, 20)

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
