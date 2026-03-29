// ForceBlockSim.jsx — Newton's Second Law: F = ma
// Canvas-based simulation: push a block, watch it accelerate.
// Sliders: mass, applied force, friction coefficient.
import { useEffect, useRef, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 560, H = 220
const SCALE = 40        // px per meter
const GROUND_Y = H - 52
const MARGIN_L = 24
const WALL_R_X = W - 30

// Arrow helper — draws a line + arrowhead + optional label
function arrow(ctx, x1, y1, x2, y2, color, label, above = true) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 4) return
  const ux = dx / len, uy = dy / len
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  const h = 10
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - h * ux + h * 0.38 * uy, y2 - h * uy - h * 0.38 * ux)
  ctx.lineTo(x2 - h * ux - h * 0.38 * uy, y2 - h * uy + h * 0.38 * ux)
  ctx.closePath()
  ctx.fill()
  if (label) {
    ctx.font = '11px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 + (above ? -7 : 14))
  }
  ctx.restore()
}

export default function ForceBlockSim() {
  const canvasRef = useRef(null)
  const [mass, setMass] = useState(2)
  const [force, setForce] = useState(10)
  const [mu, setMu] = useState(0.2)
  const [paused, setPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  // Refs let the draw loop read latest values without restarting
  const mRef = useRef(mass)
  const fRef = useRef(force)
  const μRef = useRef(mu)
  const pausedRef = useRef(false)
  const darkRef = useRef(document.documentElement.classList.contains('dark'))

  useEffect(() => { mRef.current = mass }, [mass])
  useEffect(() => { fRef.current = force }, [force])
  useEffect(() => { μRef.current = mu }, [mu])
  useEffect(() => { pausedRef.current = paused }, [paused])

  useEffect(() => {
    const obs = new MutationObserver(() => {
      darkRef.current = document.documentElement.classList.contains('dark')
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const g = 9.8
    let x = 2.0   // meters from left margin
    let v = 0.0
    let lastT = null
    let rafId

    const maxX = (WALL_R_X - MARGIN_L - 10) / SCALE

    const tick = (ts) => {
      if (lastT === null) lastT = ts
      const dt = Math.min((ts - lastT) / 1000, 0.033)
      lastT = ts

      const m = mRef.current
      const F = fRef.current
      const μ = μRef.current
      const N = m * g
      const bw_m = 0.36 + m * 0.08   // block width in meters

      if (!pausedRef.current) {
        // Friction: static cancels force up to limit, kinetic opposes motion
        let F_fric
        if (Math.abs(v) < 0.02) {
          const maxStatic = μ * N
          F_fric = Math.abs(F) <= maxStatic ? F : Math.sign(F) * μ * N
        } else {
          F_fric = Math.sign(v) * μ * N
        }
        const a = (F - F_fric) / m
        v += a * dt
        x += v * dt

        // Wall bounce
        if (x - bw_m / 2 < 0.12) { x = 0.12 + bw_m / 2; v = Math.abs(v) * 0.15 }
        if (x + bw_m / 2 > maxX)  { x = maxX - bw_m / 2; v = -Math.abs(v) * 0.15 }
      }

      // ── Render ──────────────────────────────────────────────────
      const dark = darkRef.current
      const m_d = mRef.current
      const F_d = fRef.current
      const μ_d = μRef.current
      const N_d = m_d * g
      const bw_px = (0.36 + m_d * 0.08) * SCALE
      const bh_px = (0.32 + m_d * 0.05) * SCALE
      const bx = x * SCALE + MARGIN_L - bw_px / 2
      const by = GROUND_Y - bh_px
      const cx = x * SCALE + MARGIN_L
      const cy = by + bh_px / 2

      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      // Ground
      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.fillRect(MARGIN_L, GROUND_Y, WALL_R_X - MARGIN_L, 6)
      ctx.strokeStyle = dark ? '#334155' : '#94a3b8'
      ctx.lineWidth = 1
      for (let hx = MARGIN_L + 4; hx < WALL_R_X; hx += 14) {
        ctx.beginPath(); ctx.moveTo(hx, GROUND_Y + 6); ctx.lineTo(hx - 9, GROUND_Y + 14); ctx.stroke()
      }

      // Right wall
      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.fillRect(WALL_R_X, GROUND_Y - 90, 8, 96)
      for (let hy = GROUND_Y - 85; hy < GROUND_Y + 6; hy += 14) {
        ctx.beginPath(); ctx.moveTo(WALL_R_X, hy); ctx.lineTo(WALL_R_X + 8, hy - 9); ctx.stroke()
      }

      // Block
      ctx.fillStyle = '#6366f1'
      ctx.beginPath(); ctx.roundRect(bx, by, bw_px, bh_px, 5); ctx.fill()
      ctx.fillStyle = '#c7d2fe'
      ctx.font = `bold ${Math.max(10, 10 + m_d * 0.6)}px monospace`
      ctx.textAlign = 'center'
      ctx.fillText(`${m_d} kg`, cx, cy + 4)

      // Force vectors
      const fScale = 1.8
      const vScale = 0.32
      // Applied force (rightward, green)
      if (F_d > 0) arrow(ctx, cx + bw_px / 2, cy, cx + bw_px / 2 + F_d * fScale, cy, '#22c55e', `F = ${F_d} N`)
      // Kinetic friction (leftward, orange) — always shown
      const f_vis = μ_d * N_d
      if (f_vis > 0.1) arrow(ctx, cx - bw_px / 2, cy, cx - bw_px / 2 - f_vis * fScale, cy, '#f97316', `f = ${f_vis.toFixed(1)} N`)
      // Normal force (up, cyan)
      arrow(ctx, cx, by, cx, by - N_d * vScale, '#06b6d4', `N`, true)
      // Weight (down, red) — drawn below ground line for clarity
      arrow(ctx, cx, GROUND_Y, cx, GROUND_Y + N_d * vScale, '#ef4444', `W = ${N_d.toFixed(0)} N`, false)

      // Info panel
      const F_fric_d = μ_d * N_d
      const F_net_d = F_d - F_fric_d
      const a_d = F_net_d / m_d
      const px = W - 148, py = 10, pw = 136, ph = 82
      ctx.fillStyle = dark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.94)'
      ctx.strokeStyle = dark ? '#334155' : '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 8); ctx.fill(); ctx.stroke()

      ctx.textAlign = 'left'
      ctx.font = '12px monospace'
      ctx.fillStyle = '#818cf8'
      ctx.fillText(`F_net = ${F_net_d.toFixed(1)} N`, px + 10, py + 22)
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.fillText(`a = ${a_d.toFixed(2)} m/s²`, px + 10, py + 42)
      ctx.fillStyle = '#64748b'
      ctx.fillText(`v = ${v.toFixed(2)} m/s`, px + 10, py + 62)

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [resetKey])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Newton's 2nd Law — F = ma
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPaused(p => !p)}
            className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {paused ? '▶ Play' : '⏸ Pause'}
          </button>
          <button
            onClick={() => { setPaused(false); setResetKey(k => k + 1) }}
            className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ↺ Reset
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="w-full block" />
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <SliderControl label="Mass (m)" min={0.5} max={5} step={0.5} value={mass} onChange={m => { setMass(m); mRef.current = m }} format={v => `${v} kg`} />
        <SliderControl label="Applied Force (F)" min={0} max={30} step={1} value={force} onChange={f => { setForce(f); fRef.current = f }} format={v => `${v} N`} />
        <SliderControl label="Friction μ" min={0} max={0.8} step={0.05} value={mu} onChange={μ => { setMu(μ); μRef.current = μ }} format={v => v.toFixed(2)} />
      </div>
    </div>
  )
}
