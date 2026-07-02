import { useEffect, useRef } from 'react'

export default function WritingMathScene() {
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

    // Side-by-side: BAD vs GOOD math writing
    const PAIRS = [
      {
        bad: '"let x=1 then x+1=2"',
        good: 'Let x = 1. Then x + 1 = 2.',
        issue: 'Sentences need punctuation',
      },
      {
        bad: '"so ∀x ∃y"  (no context)',
        good: '∀x ∈ ℝ, ∃y ∈ ℝ such that y > x.',
        issue: 'Quantifiers need domain + sentence',
      },
      {
        bad: '"therefore =  2 +  = 6"',
        good: '2 + 4 = 6, so the sum is 6.',
        issue: 'Every symbol must make sense',
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

      const cx = w / 2
      const pi = Math.floor(t / 3500) % PAIRS.length
      const { bad, good, issue } = PAIRS[pi]
      const phase = Math.floor((t % 3500) / 1600)

      ctx.font = `bold ${Math.round(h * 0.048)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText('Writing Mathematics Clearly', cx, 20)

      // BAD box (left)
      const boxW = w * 0.42, boxH = h * 0.22, gap = w * 0.04
      const leftX = w * 0.04, rightX = w * 0.54
      const boxY = h * 0.36

      ctx.beginPath(); ctx.roundRect(leftX, boxY, boxW, boxH, 10)
      ctx.fillStyle = dark ? '#ef444422' : '#ef444412'; ctx.fill()
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = `bold ${Math.round(h * 0.042)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillStyle = '#ef4444'; ctx.fillText('✗ Bad', leftX + boxW / 2, boxY + 10)
      ctx.font = `${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      const badWords = bad.split(' ')
      let line = '', lineY = boxY + 44
      badWords.forEach(w2 => {
        const test = line + w2 + ' '
        if (ctx.measureText(test).width > boxW - 16 && line) {
          ctx.fillText(line, leftX + boxW / 2, lineY); lineY += 22; line = w2 + ' '
        } else line = test
      })
      if (line) ctx.fillText(line, leftX + boxW / 2, lineY)

      // GOOD box (right)
      ctx.beginPath(); ctx.roundRect(rightX, boxY, boxW, boxH, 10)
      ctx.fillStyle = dark ? '#22c55e22' : '#22c55e12'; ctx.fill()
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = `bold ${Math.round(h * 0.042)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillStyle = '#22c55e'; ctx.fillText('✓ Good', rightX + boxW / 2, boxY + 10)
      ctx.font = `${Math.round(h * 0.038)}px "JetBrains Mono", monospace`
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      const goodWords = good.split(' ')
      line = ''; lineY = boxY + 44
      goodWords.forEach(w2 => {
        const test = line + w2 + ' '
        if (ctx.measureText(test).width > boxW - 16 && line) {
          ctx.fillText(line, rightX + boxW / 2, lineY); lineY += 22; line = w2 + ' '
        } else line = test
      })
      if (line) ctx.fillText(line, rightX + boxW / 2, lineY)

      // Issue label
      ctx.font = `bold ${Math.round(h * 0.044)}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f59e0b'
      ctx.fillText(`Issue: ${issue}`, cx, h * 0.72)

      PAIRS.forEach((_, i) => {
        ctx.beginPath(); ctx.arc(cx - (PAIRS.length - 1) * 10 + i * 20, h - 14, 4, 0, Math.PI * 2)
        ctx.fillStyle = i === pi ? '#6366f1' : (dark ? '#334155' : '#cbd5e1'); ctx.fill()
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
