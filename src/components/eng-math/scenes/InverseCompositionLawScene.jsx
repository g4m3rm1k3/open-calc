import { useEffect, useRef } from 'react'

export default function InverseCompositionLawScene() {
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

    // (f∘g)⁻¹ = g⁻¹∘f⁻¹
    // f(x)=2x → f⁻¹(x)=x/2;  g(x)=x+3 → g⁻¹(x)=x-3
    // So (f∘g)(x) = 2(x+3) → (f∘g)⁻¹(x) = x/2 - 3
    // g⁻¹∘f⁻¹(x) = (x/2) - 3 ✓
    let start
    function loop(ts) {
      if (!start) start = ts
      const t = ts - start
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const phase = Math.floor(t / 3000) % 2
      const vals = [4, 10, -2, 0, 6]
      const vi = Math.floor(t / 6000) % vals.length
      const x = vals[vi]

      const boxW = Math.min(w * 0.14, 55), boxH = Math.min(h * 0.12, 42)
      const arrowLen = Math.min(w * 0.07, 28)

      function box(bx, y, label, val, color) {
        ctx.beginPath(); ctx.roundRect(bx - boxW / 2, y - boxH / 2, boxW, boxH, 7)
        ctx.fillStyle = dark ? color + '33' : color + '22'; ctx.fill()
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = `bold ${Math.round(h * 0.038)}px system-ui`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color; ctx.fillText(label, bx, y - 6)
        ctx.font = `bold ${Math.round(h * 0.036)}px "JetBrains Mono", monospace`
        ctx.fillText(val, bx, y + 10)
      }

      function arrow(x1, y, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + arrowLen, y); ctx.stroke()
        ctx.fillStyle = color
        ctx.beginPath(); ctx.moveTo(x1 + arrowLen, y)
        ctx.lineTo(x1 + arrowLen - 7, y - 3.5)
        ctx.lineTo(x1 + arrowLen - 7, y + 3.5)
        ctx.closePath(); ctx.fill()
      }

      // Forward: x → g → g(x) → f → f(g(x))
      const fwdY = h * 0.26
      const startX = cx - boxW * 1.5 - arrowLen * 1.5

      const gOfX = x + 3
      const fgX = 2 * gOfX
      ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.fillText(x, startX - arrowLen * 0.5, fwdY)
      arrow(startX, fwdY, '#10b981')
      box(startX + arrowLen + boxW / 2, fwdY, 'g(x)=x+3', gOfX, '#10b981')
      arrow(startX + arrowLen + boxW, fwdY, '#6366f1')
      box(startX + 2 * arrowLen + boxW * 1.5, fwdY, 'f(x)=2x', fgX, '#6366f1')

      ctx.font = `bold ${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#f59e0b'
      ctx.fillText(`f∘g(${x}) = 2(${x}+3) = ${fgX}`, cx, fwdY + boxH / 2 + 16)

      // Divider
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'; ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(16, h * 0.44); ctx.lineTo(w - 16, h * 0.44); ctx.stroke()
      ctx.setLineDash([])

      // Inverse: start from fgX, go backward
      const invY = h * 0.63
      if (phase === 0) {
        // (f∘g)⁻¹ directly
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
        ctx.fillText(fgX, startX - arrowLen * 0.5, invY)
        const directBox = cx + boxW / 2 + arrowLen / 2
        arrow(startX, invY, '#a855f7')
        box(directBox, invY, '(f∘g)⁻¹', `${x}`, '#a855f7')
        ctx.font = `bold ${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
        ctx.fillStyle = '#a855f7'
        ctx.fillText(`(f∘g)⁻¹(${fgX}) = x/2 - 3 = ${x}`, cx, invY + boxH / 2 + 16)
      } else {
        // g⁻¹∘f⁻¹ — apply f⁻¹ first, then g⁻¹
        const finvOut = fgX / 2
        const ginvOut = finvOut - 3
        ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
        ctx.font = `bold ${Math.round(h * 0.042)}px "JetBrains Mono", monospace`
        ctx.fillText(fgX, startX - arrowLen * 0.5, invY)
        arrow(startX, invY, '#6366f1')
        box(startX + arrowLen + boxW / 2, invY, 'f⁻¹(x)=x/2', finvOut, '#6366f1')
        arrow(startX + arrowLen + boxW, invY, '#10b981')
        box(startX + 2 * arrowLen + boxW * 1.5, invY, 'g⁻¹(x)=x-3', ginvOut, '#10b981')
        ctx.font = `bold ${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
        ctx.fillStyle = '#10b981'
        ctx.fillText(`g⁻¹∘f⁻¹(${fgX}) = ${fgX}/2 - 3 = ${x}`, cx, invY + boxH / 2 + 16)
      }

      // Phase label
      ctx.font = `bold ${Math.round(h * 0.046)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = phase === 0 ? '#a855f7' : '#10b981'
      ctx.fillText(phase === 0 ? 'Direct inverse' : 'Apply g⁻¹∘f⁻¹ instead', cx, h * 0.48)

      // Law label at bottom
      ctx.font = `bold ${Math.round(h * 0.046)}px "JetBrains Mono", monospace`
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('(f∘g)⁻¹ = g⁻¹∘f⁻¹', cx, h - 22)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Inverse Composition Law', cx, 20)

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
