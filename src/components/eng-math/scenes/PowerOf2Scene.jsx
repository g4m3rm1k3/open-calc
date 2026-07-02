import { useEffect, useRef } from 'react'

export default function PowerOf2Scene() {
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

    // Induction: 2^n > n for all n ≥ 1
    // Base: 2^1=2>1 ✓; Inductive step: assume 2^k>k → 2^(k+1)=2·2^k>2k≥k+1
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

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Proof by Induction: 2ⁿ > n', cx, 20)

      // Graph: 2^n vs n
      const gMargin = 24
      const gW = w * 0.52, gH = h * 0.55
      const gx = w * 0.06, gy = h * 0.16
      const maxN = 7

      // Axes
      ctx.strokeStyle = dark ? '#334155' : '#cbd5e1'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gH); ctx.lineTo(gx + gW, gy + gH); ctx.stroke()

      const xStep = gW / (maxN + 0.5)
      const maxY = 130
      const yScale = gH / maxY

      for (let n = 1; n <= maxN; n++) {
        const px = gx + n * xStep
        const pow2 = Math.pow(2, n)
        const bH2 = Math.min(pow2, maxY) * yScale
        const bHn = Math.min(n, maxY) * yScale
        const ni = n - 1
        const visible = phase > 1 || (phase === 1 && ni / maxN < prog) || (phase === 0 && ni === 0)

        if (!visible) continue

        // 2^n bar
        const highlighted = n <= 3
        ctx.fillStyle = highlighted ? (dark ? '#6366f144' : '#6366f122') : (dark ? '#1e293b' : '#f1f5f9')
        ctx.fillRect(px - xStep * 0.35, gy + gH - bH2, xStep * 0.35, bH2)
        ctx.strokeStyle = highlighted ? '#6366f1' : (dark ? '#334155' : '#cbd5e1')
        ctx.lineWidth = highlighted ? 2 : 1
        ctx.strokeRect(px - xStep * 0.35, gy + gH - bH2, xStep * 0.35, bH2)

        // n bar (thinner, gold)
        ctx.fillStyle = dark ? '#f59e0b33' : '#f59e0b22'
        ctx.fillRect(px, gy + gH - bHn, xStep * 0.25, bHn)
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1
        ctx.strokeRect(px, gy + gH - bHn, xStep * 0.25, bHn)

        ctx.font = `${Math.round(h * 0.032)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        ctx.fillStyle = dark ? '#475569' : '#94a3b8'
        ctx.fillText(n, px - xStep * 0.07, gy + gH + 4)
      }

      // Legend
      ctx.font = `${Math.round(h * 0.034)}px system-ui`
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#6366f1'; ctx.fillText('2ⁿ', gx + 8, gy - 12)
      ctx.fillStyle = '#f59e0b'; ctx.fillText('n', gx + 40, gy - 12)

      // Right panel — proof steps
      const px0 = gx + gW + 24
      const STEPS = [
        { text: 'Base case: n=1', detail: '2¹=2 > 1 ✓', c: '#10b981', show: phase >= 0 },
        { text: 'Induct. step:', detail: 'assume 2ᵏ > k', c: '#6366f1', show: phase >= 1 },
        { text: 'Then 2ᵏ⁺¹ = 2·2ᵏ', detail: '> 2k ≥ k+1  ✓', c: '#a855f7', show: phase >= 2 },
        { text: '∴ 2ⁿ > n  ∀n≥1', detail: '□', c: '#22c55e', show: phase >= 3 },
      ]
      STEPS.forEach((s, i) => {
        if (!s.show) return
        const sy = gy + i * h * 0.135
        ctx.font = `bold ${Math.round(h * 0.042)}px system-ui`
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillStyle = s.c; ctx.fillText(s.text, px0, sy)
        ctx.font = `${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'; ctx.fillText(s.detail, px0, sy + h * 0.055)
      })

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
