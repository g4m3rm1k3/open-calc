// AtwoodMachineSim.jsx — Atwood Machine (pulley with two masses)
// a = (m1 − m2)g / (m1 + m2)     T = 2m1m2g / (m1 + m2)
// The heavier mass descends, lighter ascends.
import { useEffect, useRef, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 440, H = 320
const g = 9.8
const PULLEY_X = W / 2
const PULLEY_Y = 50
const PULLEY_R = 22
const ROPE_LEN_PX = 200   // total rope each side can travel
const BLOCK_W = 48, BLOCK_H = 36

function arrow(ctx, x1, y1, x2, y2, color, label, above = true) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 4) return
  const ux = dx / len, uy = dy / len
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color
  ctx.lineWidth = 2.5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  const h = 10
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - h * ux + h * 0.38 * uy, y2 - h * uy - h * 0.38 * ux)
  ctx.lineTo(x2 - h * ux - h * 0.38 * uy, y2 - h * uy + h * 0.38 * ux)
  ctx.closePath(); ctx.fill()
  if (label) {
    ctx.font = '11px system-ui, sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 + (above ? -7 : 13))
  }
  ctx.restore()
}

export default function AtwoodMachineSim() {
  const canvasRef = useRef(null)
  const [m1, setM1] = useState(3)
  const [m2, setM2] = useState(1.5)
  const [paused, setPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const m1Ref = useRef(m1)
  const m2Ref = useRef(m2)
  const pausedRef = useRef(false)
  const darkRef = useRef(document.documentElement.classList.contains('dark'))

  useEffect(() => { m1Ref.current = m1 }, [m1])
  useEffect(() => { m2Ref.current = m2 }, [m2])
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => {
    const obs = new MutationObserver(() => { darkRef.current = document.documentElement.classList.contains('dark') })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // y1: how far m1 has descended from start (px), starts at 0
    // positive = m1 descending
    let disp = 0   // displacement of m1 (px), positive = m1 down
    let vel = 0    // px/s
    let lastT = null
    let rafId

    const maxDisp = ROPE_LEN_PX - BLOCK_H - 10

    const PIXELS_PER_M = 60   // for converting physics units to px speed

    const tick = (ts) => {
      if (lastT === null) lastT = ts
      const dt = Math.min((ts - lastT) / 1000, 0.033)
      lastT = ts

      const M1 = m1Ref.current, M2 = m2Ref.current

      if (!pausedRef.current) {
        const a_ms2 = ((M1 - M2) * g) / (M1 + M2)   // m/s²
        const a_px = a_ms2 * PIXELS_PER_M              // px/s²
        vel += a_px * dt
        disp += vel * dt

        // Stop at limits (blocks hit ceiling or floor)
        if (disp > maxDisp) { disp = maxDisp; vel = 0 }
        if (disp < -maxDisp) { disp = -maxDisp; vel = 0 }
      }

      // ── Render ──────────────────────────────────────────────────
      const dark = darkRef.current
      const M1_d = m1Ref.current, M2_d = m2Ref.current
      const a_d = ((M1_d - M2_d) * g) / (M1_d + M2_d)
      const T_d = (2 * M1_d * M2_d * g) / (M1_d + M2_d)

      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      // Ceiling
      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.fillRect(0, 0, W, 18)
      ctx.strokeStyle = dark ? '#334155' : '#94a3b8'; ctx.lineWidth = 1
      for (let hx = 4; hx < W; hx += 14) {
        ctx.beginPath(); ctx.moveTo(hx, 18); ctx.lineTo(hx - 9, 26); ctx.stroke()
      }

      // Pulley axle
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(PULLEY_X, 18); ctx.lineTo(PULLEY_X, PULLEY_Y); ctx.stroke()

      // Pulley wheel
      ctx.strokeStyle = dark ? '#64748b' : '#94a3b8'; ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9'
      ctx.lineWidth = 4
      ctx.beginPath(); ctx.arc(PULLEY_X, PULLEY_Y, PULLEY_R, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
      ctx.fillStyle = dark ? '#475569' : '#cbd5e1'
      ctx.beginPath(); ctx.arc(PULLEY_X, PULLEY_Y, 6, 0, Math.PI * 2); ctx.fill()

      // Block positions
      const ropeStartY = PULLEY_Y + PULLEY_R
      const m1_y = ropeStartY + ROPE_LEN_PX * 0.35 + disp   // m1 center Y
      const m2_y = ropeStartY + ROPE_LEN_PX * 0.35 - disp   // m2 center Y

      const LX = PULLEY_X - 40   // left rope x
      const RX = PULLEY_X + 40   // right rope x

      // Ropes
      ctx.strokeStyle = dark ? '#64748b' : '#94a3b8'; ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(LX, ropeStartY)
      ctx.lineTo(LX, m1_y - BLOCK_H / 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(RX, ropeStartY)
      ctx.lineTo(RX, m2_y - BLOCK_H / 2)
      ctx.stroke()

      // m1 block (heavier, indigo)
      ctx.fillStyle = '#6366f1'
      ctx.beginPath(); ctx.roundRect(LX - BLOCK_W / 2, m1_y - BLOCK_H / 2, BLOCK_W, BLOCK_H, 4); ctx.fill()
      ctx.fillStyle = '#c7d2fe'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`m₁=${M1_d}`, LX, m1_y + 4)

      // m2 block (lighter, emerald)
      ctx.fillStyle = '#10b981'
      ctx.beginPath(); ctx.roundRect(RX - BLOCK_W / 2, m2_y - BLOCK_H / 2, BLOCK_W, BLOCK_H, 4); ctx.fill()
      ctx.fillStyle = '#d1fae5'; ctx.font = 'bold 11px monospace'
      ctx.fillText(`m₂=${M2_d}`, RX, m2_y + 4)

      // Force arrows
      const aScale = 2.8
      // m1: Tension (up, cyan) + Weight (down, red)
      arrow(ctx, LX, m1_y - BLOCK_H / 2, LX, m1_y - BLOCK_H / 2 - T_d * aScale * 0.2, '#06b6d4', `T`, true)
      arrow(ctx, LX, m1_y + BLOCK_H / 2, LX, m1_y + BLOCK_H / 2 + M1_d * g * aScale * 0.2, '#ef4444', `W₁`, false)
      // m2: Tension (up, cyan) + Weight (down, red)
      arrow(ctx, RX, m2_y - BLOCK_H / 2, RX, m2_y - BLOCK_H / 2 - T_d * aScale * 0.2, '#06b6d4', null, true)
      arrow(ctx, RX, m2_y + BLOCK_H / 2, RX, m2_y + BLOCK_H / 2 + M2_d * g * aScale * 0.2, '#ef4444', `W₂`, false)

      // Info panel
      const px = W - 155, py = 28, pw = 142, ph = 100
      ctx.fillStyle = dark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.94)'
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 8); ctx.fill(); ctx.stroke()
      ctx.textAlign = 'left'; ctx.font = '12px monospace'
      ctx.fillStyle = '#818cf8'
      ctx.fillText(`a = ${a_d.toFixed(3)} m/s²`, px + 10, py + 22)
      ctx.fillStyle = '#06b6d4'
      ctx.fillText(`T = ${T_d.toFixed(2)} N`, px + 10, py + 42)
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.fillText(`v = ${(vel / 60).toFixed(2)} m/s`, px + 10, py + 62)
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8'
      ctx.font = '10px monospace'
      ctx.fillText(`(m₁ ${a_d >= 0 ? '↓' : '↑'} faster)`, px + 10, py + 82)

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [resetKey])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Atwood Machine — a = (m₁−m₂)g/(m₁+m₂)
        </span>
        <div className="flex gap-1">
          <button onClick={() => setPaused(p => !p)} className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            {paused ? '▶ Play' : '⏸ Pause'}
          </button>
          <button onClick={() => { setPaused(false); setResetKey(k => k + 1) }} className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            ↺ Reset
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="w-full block" />
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <SliderControl label="Mass m₁ (left)" min={0.5} max={5} step={0.5} value={m1} onChange={v => { setM1(v); m1Ref.current = v }} format={v => `${v} kg`} />
        <SliderControl label="Mass m₂ (right)" min={0.5} max={5} step={0.5} value={m2} onChange={v => { setM2(v); m2Ref.current = v }} format={v => `${v} kg`} />
      </div>
    </div>
  )
}
