// InclinedPlaneSim.jsx — Block on an inclined plane
// Shows: W (down), W∥ (down slope), W⊥ (into slope), N (perpendicular out), friction (up slope)
// a = g(sin θ − μ cos θ)
import { useEffect, useRef, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 560, H = 280
const g = 9.8

function arrow(ctx, x1, y1, x2, y2, color, label, labelOffset = { x: 0, y: -10 }) {
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
    ctx.fillText(label, (x1 + x2) / 2 + labelOffset.x, (y1 + y2) / 2 + labelOffset.y)
  }
  ctx.restore()
}

function dashedLine(ctx, x1, y1, x2, y2, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5
  ctx.setLineDash([5, 4]); ctx.beginPath()
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.setLineDash([]); ctx.restore()
}

export default function InclinedPlaneSim() {
  const canvasRef = useRef(null)
  const [angleDeg, setAngleDeg] = useState(30)
  const [mass, setMass] = useState(2)
  const [mu, setMu] = useState(0.15)
  const [paused, setPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const aRef = useRef(angleDeg)
  const mRef = useRef(mass)
  const μRef = useRef(mu)
  const pausedRef = useRef(false)
  const darkRef = useRef(document.documentElement.classList.contains('dark'))

  useEffect(() => { aRef.current = angleDeg }, [angleDeg])
  useEffect(() => { mRef.current = mass }, [mass])
  useEffect(() => { μRef.current = mu }, [mu])
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

    // Position along slope in meters (0 = top, increases down)
    let s = 0.3
    let v = 0
    let lastT = null
    let rafId

    const SLOPE_LEN_M = 6    // meters
    const SLOPE_LEN_PX = 380 // pixels
    const scale = SLOPE_LEN_PX / SLOPE_LEN_M  // px/m

    // Slope origin (bottom-left of slope)
    const ox = 60, oy = H - 45

    const tick = (ts) => {
      if (lastT === null) lastT = ts
      const dt = Math.min((ts - lastT) / 1000, 0.033)
      lastT = ts

      const θ = aRef.current * Math.PI / 180
      const m = mRef.current
      const μ = μRef.current
      const sinθ = Math.sin(θ), cosθ = Math.cos(θ)
      const N = m * g * cosθ
      const slopeLenM = SLOPE_LEN_M

      if (!pausedRef.current) {
        const F_gravity_par = m * g * sinθ   // down slope
        const F_fric = μ * N                  // up slope (opposing downward motion)
        const F_net = F_gravity_par - F_fric
        const a_along = F_net / m             // positive = down slope

        v += a_along * dt
        s += v * dt

        // Block bounces at top/bottom of slope
        const bLen = 0.25
        if (s < bLen / 2) { s = bLen / 2; v = Math.abs(v) * 0.2 }
        if (s > slopeLenM - bLen / 2) { s = slopeLenM - bLen / 2; v = -Math.abs(v) * 0.2 }
      }

      // ── Render ──────────────────────────────────────────────────
      const dark = darkRef.current
      const θ_d = aRef.current * Math.PI / 180
      const sinθ_d = Math.sin(θ_d), cosθ_d = Math.cos(θ_d)
      const m_d = mRef.current
      const μ_d = μRef.current
      const N_d = m_d * g * cosθ_d
      const W_d = m_d * g
      const W_par = W_d * sinθ_d
      const W_perp = W_d * cosθ_d
      const f_d = μ_d * N_d
      const a_d = (W_par - f_d) / m_d

      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      // Slope triangle
      const tx = ox + SLOPE_LEN_PX * cosθ_d, ty = oy - SLOPE_LEN_PX * sinθ_d
      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tx, ty); ctx.lineTo(tx, oy); ctx.closePath(); ctx.fill()
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'; ctx.lineWidth = 1.5
      ctx.stroke()

      // Angle arc
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(tx, oy, 30, Math.PI, Math.PI + θ_d, false); ctx.stroke()
      ctx.fillStyle = '#94a3b8'; ctx.font = '12px system-ui'; ctx.textAlign = 'left'
      ctx.fillText(`θ = ${aRef.current}°`, tx - 62, oy - 12)

      // Ground
      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.fillRect(20, oy, W - 40, 6)
      ctx.strokeStyle = dark ? '#334155' : '#94a3b8'; ctx.lineWidth = 1
      for (let hx = 24; hx < W - 40; hx += 14) {
        ctx.beginPath(); ctx.moveTo(hx, oy + 6); ctx.lineTo(hx - 9, oy + 14); ctx.stroke()
      }

      // Block on slope
      // Block center along slope
      const bSize = 26
      const bcx = ox + s * scale * cosθ_d + bSize * 0.5 * (-sinθ_d)
      const bcy = oy - s * scale * sinθ_d + bSize * 0.5 * (-cosθ_d) - bSize * 0.5

      ctx.save()
      ctx.translate(ox + s * scale * cosθ_d, oy - s * scale * sinθ_d)
      ctx.rotate(-θ_d)
      ctx.fillStyle = '#6366f1'
      ctx.beginPath(); ctx.roundRect(-bSize / 2 - 2, -bSize - 2, bSize + 4, bSize + 4, 3); ctx.fill()
      ctx.fillStyle = '#c7d2fe'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`${m_d}kg`, 0, -bSize / 2 + 4)
      ctx.restore()

      // Block center in world coords (for force arrows)
      const blk_x = ox + s * scale * cosθ_d - bSize / 2 * sinθ_d
      const blk_y = oy - s * scale * sinθ_d - bSize / 2 * cosθ_d - bSize / 2

      const arrowScale = 3.2
      // Weight arrow (straight down, red)
      arrow(ctx, blk_x, blk_y, blk_x, blk_y + W_d * arrowScale, '#ef4444', `W=${W_d.toFixed(0)}N`, { x: 14, y: 0 })
      // Normal force (perpendicular to slope, cyan)
      arrow(ctx, blk_x, blk_y, blk_x - N_d * arrowScale * sinθ_d, blk_y - N_d * arrowScale * cosθ_d, '#06b6d4', `N=${N_d.toFixed(1)}N`, { x: -16, y: -6 })
      // W_parallel (down slope, dashed, rose)
      const wpar_ex = blk_x + W_par * arrowScale * cosθ_d
      const wpar_ey = blk_y + W_par * arrowScale * sinθ_d
      dashedLine(ctx, blk_x, blk_y, wpar_ex, wpar_ey, '#fb7185')
      ctx.fillStyle = '#fb7185'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'
      ctx.fillText(`W∥=${W_par.toFixed(1)}N`, (blk_x + wpar_ex) / 2 + 10, (blk_y + wpar_ey) / 2 + 12)
      // Friction (up slope, orange) — only if moving or would slide
      if (f_d > 0.1) {
        arrow(ctx, blk_x, blk_y, blk_x - f_d * arrowScale * cosθ_d, blk_y - f_d * arrowScale * sinθ_d, '#f97316', `f=${f_d.toFixed(1)}N`, { x: -12, y: -6 })
      }

      // Info panel
      const px = W - 148, py = 10, pw = 136, ph = 96
      ctx.fillStyle = dark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.94)'
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 8); ctx.fill(); ctx.stroke()
      ctx.textAlign = 'left'; ctx.font = '12px monospace'
      ctx.fillStyle = '#06b6d4'; ctx.fillText(`N = ${N_d.toFixed(2)} N`, px + 10, py + 22)
      ctx.fillStyle = '#f97316'; ctx.fillText(`f = ${f_d.toFixed(2)} N`, px + 10, py + 42)
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText(`a = ${a_d.toFixed(2)} m/s²`, px + 10, py + 62)
      ctx.fillStyle = '#64748b'; ctx.fillText(`v = ${v.toFixed(2)} m/s`, px + 10, py + 82)

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [resetKey])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Inclined Plane — Forces Decomposed
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
        <SliderControl label="Angle θ" min={5} max={65} step={1} value={angleDeg} onChange={a => { setAngleDeg(a); aRef.current = a }} format={v => `${v}°`} />
        <SliderControl label="Mass (m)" min={0.5} max={5} step={0.5} value={mass} onChange={m => { setMass(m); mRef.current = m }} format={v => `${v} kg`} />
        <SliderControl label="Friction μ" min={0} max={0.8} step={0.05} value={mu} onChange={μ => { setMu(μ); μRef.current = μ }} format={v => v.toFixed(2)} />
      </div>
    </div>
  )
}
