// FootballCalculus.jsx — Football Calculus game, 6 levels, formula input required
// Converted from user's HTML starter. Canvas-based, top-down for L1-L5, side-view for L6.

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Field geometry ───────────────────────────────────────────────────────────
const W = 700, H = 240, EZ = 40, FW = W - 2 * EZ, PY = FW / 100, CY = H / 2
const yd = y => EZ + y * PY
const px2yd = x => ((x - EZ) / PY).toFixed(1)

// ─── Safe formula evaluator ───────────────────────────────────────────────────
function parseExpr(expr, vars = {}) {
  if (!expr || !expr.trim()) return null
  try {
    const js = expr.trim()
      .replace(/\^/g, '**')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\batan\b/g, 'Math.atan')
      .replace(/\batan2\b/g, 'Math.atan2')
    const args = Object.keys(vars)
    // eslint-disable-next-line no-new-func
    const fn = new Function(...args, `"use strict"; return (${js});`)
    return (...vals) => {
      const r = fn(...vals)
      return (typeof r === 'number' && isFinite(r)) ? r : null
    }
  } catch { return null }
}

// ─── Level definitions ────────────────────────────────────────────────────────
const LEVELS = [
  {
    id: 'L1', name: 'Lead Pass', concept: 'Integration / Position from velocity',
    color: '#22c55e',
    description: 'A receiver runs downfield at constant speed. Write the equation for where the receiver will be at time t, then find the right throw time T so the ball meets the receiver in stride.',
    theory: [
      'If a player has constant velocity v, their position is:',
      'x(t) = x₀ + v·t',
      'This is the integral of velocity over time.',
      'You need to find T such that x_ball(t*) = x_receiver(t*)',
      'where t* is when the ball arrives.',
    ],
    inputs: [
      { id: 'rec_eq', label: 'Receiver position equation x_r(t) — in yards:', placeholder: 'e.g.  20 + 5*t', hint: 'WR starts at yard 20, runs at 5 yd/s' },
      { id: 'throw_t', label: 'Throw at time T (seconds after snap):', placeholder: 'e.g.  1.4', hint: 'Ball speed is 25 yd/s from yard 5' },
    ],
    params: { QB_YD: 5, REC_YD0: 20, V_REC_YDS: 5, V_BALL_YDS: 25, CATCH_R_YD: 1.5 },
    run(inputs) {
      const rec_fn = parseExpr(inputs.rec_eq, { t: 0 })
      const T = parseFloat(inputs.throw_t)
      if (!rec_fn) return { error: 'rec_eq', msg: 'Invalid receiver equation' }
      if (isNaN(T) || T < 0 || T > 8) return { error: 'throw_t', msg: 'T must be 0–8 seconds' }
      const p = this.params
      const recVal0 = rec_fn(0)
      if (Math.abs(recVal0 - p.REC_YD0) > 2) return { warning: `Your equation gives x_r(0) = ${recVal0.toFixed(1)}, but WR starts at yard ${p.REC_YD0}. Check your x₀.` }
      const frames = []
      const DT = 1 / 60
      let bx = yd(p.QB_YD), by = CY, thrown = false, t = 0
      const trail = []
      for (let i = 0; i < 600; i++) {
        t += DT
        const recYd = rec_fn(t)
        const rx = yd(Math.min(recYd !== null ? recYd : p.REC_YD0 + p.V_REC_YDS * t, 100))
        if (!thrown && t >= T) thrown = true
        if (thrown) { bx += p.V_BALL_YDS * PY * DT; trail.push({ x: bx, y: by }) }
        const dist = Math.abs(bx - rx) / PY
        const prog = thrown ? Math.min((bx - yd(p.QB_YD)) / (rx - yd(p.QB_YD) + 0.01), 1) : 0
        const alt = thrown ? Math.max(0, Math.sin(Math.max(0, prog) * Math.PI)) : 0
        frames.push({ t, bx, by, rx, ry: CY, alt, thrown, trail: [...trail], dist })
        if (thrown && dist < p.CATCH_R_YD) {
          return { frames, result: 'win', catchTime: t, analytical: `x_r(${t.toFixed(2)}) = ${recYd ? recYd.toFixed(1) : '?'} yd, ball at ${px2yd(bx)} yd — caught!` }
        }
        if (bx > W + 30 || t > 9) break
      }
      const last = frames[frames.length - 1] || {}
      const over = last.bx > last.rx
      return { frames, result: 'loss', analytical: `Ball and receiver were ${(last.dist || 99).toFixed(1)} yd apart — ${over ? 'ball overshot (increase T)' : 'ball undershot (decrease T)'}` }
    },
  },
  {
    id: 'L2', name: 'Accelerating Route', concept: 'Kinematics / x(t) with acceleration',
    color: '#f59e0b',
    description: "The receiver accelerates off the line. Write the kinematic equation for the receiver's position — including acceleration — then solve for the optimal throw time.",
    theory: [
      'With initial velocity v₀ and constant acceleration a:',
      'x(t) = x₀ + v₀·t + ½·a·t²',
      'The velocity at time t is: v(t) = v₀ + a·t',
      'Ball travel time = (x_r(T) - x_QB) / v_ball',
      'Catch: x_r(T + flight) = x_ball(T + flight)',
    ],
    inputs: [
      { id: 'rec_eq', label: 'Receiver position x_r(t) in yards — include acceleration:', placeholder: 'e.g.  15 + 2*t + 0.5*3*t^2', hint: 'WR starts at 15 yd, v₀=2 yd/s, a=3 yd/s²' },
      { id: 'throw_t', label: 'Throw at time T (seconds):', placeholder: 'e.g.  1.0', hint: 'Ball speed 30 yd/s from yard 8' },
    ],
    params: { QB_YD: 8, REC_YD0: 15, V0_REC: 2, A_REC: 3, V_BALL_YDS: 30, CATCH_R_YD: 1.5 },
    run(inputs) {
      const rec_fn = parseExpr(inputs.rec_eq, { t: 0 })
      const T = parseFloat(inputs.throw_t)
      if (!rec_fn) return { error: 'rec_eq', msg: 'Invalid equation — try: 15 + 2*t + 0.5*3*t^2' }
      if (isNaN(T) || T < 0 || T > 8) return { error: 'throw_t', msg: 'T must be 0–8 s' }
      const p = this.params
      if (Math.abs(rec_fn(0) - p.REC_YD0) > 2) return { warning: `x_r(0) = ${rec_fn(0).toFixed(1)}, but WR starts at ${p.REC_YD0} yd. Fix x₀.` }
      const frames = []
      const DT = 1 / 60
      let bx = yd(p.QB_YD), by = CY, thrown = false, t = 0
      const trail = []
      for (let i = 0; i < 600; i++) {
        t += DT
        const recYd = rec_fn(t)
        const rx = yd(Math.min(recYd !== null ? Math.max(recYd, p.REC_YD0) : p.REC_YD0 + p.V0_REC * t + 0.5 * p.A_REC * t * t, 100))
        if (!thrown && t >= T) thrown = true
        if (thrown) { bx += p.V_BALL_YDS * PY * DT; trail.push({ x: bx, y: by }) }
        const dist = Math.abs(bx - rx) / PY
        const prog = thrown ? Math.min((bx - yd(p.QB_YD)) / Math.max(rx - yd(p.QB_YD), 1), 1) : 0
        const alt = thrown ? Math.max(0, Math.sin(Math.max(0, prog) * Math.PI)) : 0
        frames.push({ t, bx, by, rx, ry: CY, alt, thrown, trail: [...trail], dist })
        if (thrown && dist < p.CATCH_R_YD) return { frames, result: 'win', catchTime: t, analytical: `Caught! Receiver at ${recYd ? recYd.toFixed(1) : '?'} yd at t=${t.toFixed(2)}s` }
        if (bx > W + 30 || t > 9) break
      }
      const last = frames[frames.length - 1] || {}
      return { frames, result: 'loss', analytical: `Gap was ${(last.dist || 99).toFixed(1)} yd — your equation gave x_r(T)=${rec_fn(T) ? rec_fn(T).toFixed(1) : '?'} yd at throw time T=${T}` }
    },
  },
  {
    id: 'L3', name: 'Interception Angle', concept: 'Optimization / dR/dθ = 0',
    color: '#a78bfa',
    description: 'A pass is in the air. You are the defender. Find the angle θ that lets you reach the interception point. Calculate it from the geometry — use atan(Δy/Δx).',
    theory: [
      'A body launched at angle θ with speed v₀:',
      'x(θ) = v₀·cos(θ)·t_flight',
      'y(θ) = v₀·sin(θ)·t_flight - ½g·t_flight²',
      'For horizontal range: R(θ) = v₀²·sin(2θ)/g',
      'dR/dθ = 2v₀²·cos(2θ)/g = 0  →  θ* = 45°',
      'But here you want the angle that intercepts a MOVING target.',
      'Set your x(θ,t) = target_x(t) and solve for θ.',
    ],
    inputs: [
      { id: 'angle_eq', label: 'Your intercept angle θ in degrees — as a function or constant:', placeholder: 'e.g.  35   or   atan(40/60)*180/pi', hint: 'Target is at (60 yd downfield, 8 yd off-center). Your speed: 22 yd/s.' },
    ],
    params: { DEF_YD: 45, DEF_Y_OFFSET: 50, TARGET_YD: 60, TARGET_Y_OFFSET: -8, V_DEF_YDS: 22, CATCH_R_YD: 2 },
    run(inputs) {
      const angle_fn = parseExpr(inputs.angle_eq, { t: 0 })
      if (!angle_fn) return { error: 'angle_eq', msg: 'Invalid — try: 35  or  atan(8/15)*180/pi' }
      const theta_deg = angle_fn(0)
      if (theta_deg === null || theta_deg < -90 || theta_deg > 90) return { error: 'angle_eq', msg: 'Angle must be between -90 and 90 degrees' }
      const p = this.params
      const defX = yd(p.DEF_YD), defY = CY + p.DEF_Y_OFFSET
      const tgtX = yd(p.TARGET_YD), tgtY = CY + p.TARGET_Y_OFFSET
      const theta_rad = theta_deg * Math.PI / 180
      const vx = p.V_DEF_YDS * PY * Math.cos(theta_rad)
      const vy = -p.V_DEF_YDS * PY * Math.sin(theta_rad)
      const frames = []
      const DT = 1 / 60
      let dx = defX, dy = defY, t = 0
      const trail = []
      for (let i = 0; i < 480; i++) {
        t += DT
        dx += vx * DT; dy += vy * DT
        trail.push({ x: dx, y: dy })
        const dist = Math.sqrt((dx - tgtX) ** 2 + (dy - tgtY) ** 2) / PY
        frames.push({ t, dx, dy, tgtX, tgtY, dist, trail: [...trail] })
        if (dist < p.CATCH_R_YD) {
          const optTheta = Math.atan2(defY - tgtY, tgtX - defX) * 180 / Math.PI
          return { frames, result: 'win', analytical: `θ=${theta_deg.toFixed(1)}° worked! Optimal was ≈${optTheta.toFixed(1)}°. Reached in ${t.toFixed(2)}s.` }
        }
        if (t > 8) break
      }
      const optTheta = Math.atan2(defY - tgtY, tgtX - defX) * 180 / Math.PI
      const last = frames[frames.length - 1] || {}
      return { frames, result: 'loss', analytical: `At θ=${theta_deg.toFixed(1)}° you missed by ${(last.dist || 99).toFixed(1)} yd. Optimal angle ≈ ${optTheta.toFixed(1)}°. Hint: atan(Δy/Δx)*180/pi` }
    },
  },
  {
    id: 'L4', name: 'Closing Window', concept: 'Related rates / dD/dt',
    color: '#ef4444',
    description: 'A defender is closing on your receiver. Write the equation for how fast the window is closing (dD/dt), then find the latest time you can throw and still complete the pass.',
    theory: [
      'Defender position: x_d(t), y_d(t)',
      'Distance to catch point: D(t) = √(Δx²+Δy²)',
      'By the chain rule (related rates):',
      'dD/dt = (Δx·(dx_d/dt) + Δy·(dy_d/dt)) / D',
      'Window "closes" when D(t) < coverage_radius.',
      'Find the latest T where D(T + flight_time) > R_coverage.',
      'The throw must arrive BEFORE the window closes!',
    ],
    inputs: [
      { id: 'dDdt_eq', label: 'Rate of window closure dD/dt (yd/s) — write as function of D:', placeholder: 'e.g.  -6   or   -4.5   or   -3*D/10', hint: 'Defender moves at 6 yd/s toward catch point. Coverage radius = 3 yd.' },
      { id: 'throw_t', label: 'Throw at time T (seconds) — before window closes:', placeholder: 'e.g.  1.8', hint: 'Ball travels at 28 yd/s. Window closes when D < 3 yd.' },
    ],
    params: { QB_YD: 10, REC_YD0: 25, CATCH_YD: 55, CATCH_Y_OFFSET: -35, DEF_YD: 65, DEF_Y_OFFSET: -75, V_DEF_YDS: 6, V_BALL_YDS: 28, COV_RADIUS_YD: 3 },
    run(inputs) {
      const dDdt_fn = parseExpr(inputs.dDdt_eq, { D: 0, t: 0 })
      const T = parseFloat(inputs.throw_t)
      if (!dDdt_fn) return { error: 'dDdt_eq', msg: 'Invalid — try: -6  or  -4.5*D/10' }
      if (isNaN(T) || T < 0 || T > 8) return { error: 'throw_t', msg: 'T must be 0–8 s' }
      const p = this.params
      const catchX = yd(p.CATCH_YD), catchY = CY + p.CATCH_Y_OFFSET
      let defX = yd(p.DEF_YD), defY = CY + p.DEF_Y_OFFSET
      let D = Math.sqrt((defX - catchX) ** 2 + (defY - catchY) ** 2) / PY
      const dDdt_actual = -p.V_DEF_YDS
      const frames = []
      const DT = 1 / 60
      let t = 0, bx = yd(p.QB_YD), by = CY, thrown = false
      const trail = []
      for (let i = 0; i < 600; i++) {
        t += DT
        const ddx = catchX - defX, ddy = catchY - defY, dd = Math.sqrt(ddx ** 2 + ddy ** 2)
        if (dd > 1) { defX += (ddx / dd) * p.V_DEF_YDS * PY * DT; defY += (ddy / dd) * p.V_DEF_YDS * PY * DT }
        D = Math.sqrt((defX - catchX) ** 2 + (defY - catchY) ** 2) / PY
        const userRate = dDdt_fn(D, t)
        if (!thrown && t >= T) thrown = true
        if (thrown) {
          const bvx = catchX - yd(p.QB_YD), bvy = catchY - by
          const bd = Math.sqrt(bvx ** 2 + bvy ** 2)
          bx += (bvx / bd) * p.V_BALL_YDS * PY * DT
          by += (bvy / bd) * p.V_BALL_YDS * PY * DT
          trail.push({ x: bx, y: by })
        }
        const prog = thrown ? Math.min(Math.sqrt((bx - yd(p.QB_YD)) ** 2 + (by - CY) ** 2) / Math.sqrt((catchX - yd(p.QB_YD)) ** 2 + (catchY - CY) ** 2), 1) : 0
        const alt = thrown ? Math.max(0, Math.sin(Math.max(0, prog) * Math.PI)) : 0
        frames.push({ t, bx, by, defX, defY, catchX, catchY, D, userRate: userRate || 0, actualRate: dDdt_actual, thrown, trail: [...trail], alt })
        const ballNearCatch = Math.sqrt((bx - catchX) ** 2 + (by - catchY) ** 2) / PY
        if (thrown && ballNearCatch < 2) {
          if (D > p.COV_RADIUS_YD) return { frames, result: 'win', analytical: `Complete! D=${D.toFixed(1)} yd at arrival — window was open. Your dD/dt model: ${userRate ? userRate.toFixed(2) : '?'} yd/s (actual: ${dDdt_actual} yd/s)` }
          else return { frames, result: 'loss', analytical: `Defended! D=${D.toFixed(1)} yd at arrival — window closed. Actual dD/dt was ${dDdt_actual} yd/s. Throw earlier.` }
        }
        if (t > 9) break
      }
      return { frames, result: 'loss', analytical: `Ball didn't reach target in time. Check T and dD/dt model.` }
    },
  },
  {
    id: 'L5', name: 'Pursuit Curve', concept: 'Derivatives / tangent direction',
    color: '#06b6d4',
    description: "You are the defender. The ball carrier's position is given by parametric equations. Write the derivative dx/dt and dy/dt to find the tangent direction, then write your pursuit velocity.",
    theory: [
      'Ball carrier runs a curved route:',
      'x_b(t) = 20 + 8t  (downfield)',
      'y_b(t) = CY + 7·sin(t)  (lateral, in yards)',
      'The tangent (direction of motion) at time t:',
      'dx_b/dt = 8  (constant)',
      'dy_b/dt = 7·cos(t)',
      'Your velocity components must intercept x_b, y_b.',
      'Enter v_x(t) and v_y(t) to chase the ball carrier.',
    ],
    inputs: [
      { id: 'vx_eq', label: 'Your horizontal speed v_x(t) in yd/s:', placeholder: 'e.g.  8   or   6 + 2*t', hint: 'Ball carrier: x_b(t)=20+8t, y_b=CY_yd+7·sin(t), dx/dt=8, dy/dt=7·cos(t)' },
      { id: 'vy_eq', label: 'Your lateral speed v_y(t) in yd/s:', placeholder: 'e.g.  7*cos(t)', hint: "Match or exceed the ball carrier's rate of change in each direction" },
    ],
    params: { DEF_YD: 30, DEF_Y_OFFSET: 55, V_CARRIER_X: 8, A_CARRIER_Y: 7, CATCH_R_YD: 2 },
    run(inputs) {
      const vx_fn = parseExpr(inputs.vx_eq, { t: 0 })
      const vy_fn = parseExpr(inputs.vy_eq, { t: 0 })
      if (!vx_fn) return { error: 'vx_eq', msg: 'Invalid v_x — try: 8  or  6+2*t' }
      if (!vy_fn) return { error: 'vy_eq', msg: 'Invalid v_y — try: 7*cos(t)' }
      const p = this.params
      const frames = []
      const DT = 1 / 60
      let t = 0
      let dx = yd(p.DEF_YD), dy = CY + p.DEF_Y_OFFSET
      const trail_d = [], trail_b = []
      for (let i = 0; i < 600; i++) {
        t += DT
        const cbx = yd(Math.min(20 + p.V_CARRIER_X * t, 95))
        const cby = CY + p.A_CARRIER_Y * Math.sin(t) * PY
        const vx = vx_fn(t) || 0, vy = vy_fn(t) || 0
        dx += vx * PY * DT; dy -= vy * PY * DT
        trail_d.push({ x: dx, y: dy }); trail_b.push({ x: cbx, y: cby })
        const dist = Math.sqrt((dx - cbx) ** 2 + (dy - cby) ** 2) / PY
        frames.push({ t, dx, dy, cbx, cby, dist, trail_d: [...trail_d], trail_b: [...trail_b], vx, vy })
        if (dist < p.CATCH_R_YD) return { frames, result: 'win', analytical: `Tackle at t=${t.toFixed(2)}s! v_x(${t.toFixed(1)})=${vx.toFixed(1)}, v_y(${t.toFixed(1)})=${vy.toFixed(1)} yd/s matched the carrier's tangent direction.` }
        if (cbx > W - EZ - 10 || t > 10) break
      }
      const last = frames[frames.length - 1] || {}
      return { frames, result: 'loss', analytical: `Missed by ${(last.dist || 99).toFixed(1)} yd. Carrier dx/dt=8, dy/dt=7·cos(t). Match those components.` }
    },
  },
  {
    id: 'L6', name: 'Fourth-Down Kick', concept: 'Calculus of variations / trajectory optimization',
    color: '#ec4899',
    description: "You need a field goal. Find the angle that clears the crossbar at the right distance. This is a SIDE VIEW — y axis is height.",
    theory: [
      'Projectile trajectory (ignoring air resistance):',
      'x(t) = v₀·cos(θ)·t',
      'y(t) = v₀·sin(θ)·t - ½·g·t²',
      'Crossbar height h at distance d:',
      'At t* where x(t*) = d:  t* = d/(v₀·cos(θ))',
      'y(t*) = d·tan(θ) - g·d²/(2·v₀²·cos²(θ))',
      'Set y(t*) ≥ crossbar height (10 yd)',
      'Maximize clearance by solving dy(t*)/dθ = 0',
    ],
    inputs: [
      { id: 'theta_eq', label: 'Launch angle θ in degrees:', placeholder: 'e.g.  45   or   atan(10/35)*180/pi + 5', hint: 'Target: 35 yd away, crossbar at 10 yd height. v₀ = 28 yd/s, g = 10 yd/s².' },
      { id: 'v0_eq', label: 'Initial speed v₀ in yd/s:', placeholder: 'e.g.  28', hint: 'Must clear crossbar AND land beyond uprights (within ±5.6 yd of center)' },
    ],
    params: { GOAL_YD: 35, BAR_HEIGHT_YD: 10, G_YDS: 10, UPRIGHT_HALF: 5.6 },
    run(inputs) {
      const th_fn = parseExpr(inputs.theta_eq, { t: 0 })
      const v0_fn = parseExpr(inputs.v0_eq, { t: 0 })
      if (!th_fn) return { error: 'theta_eq', msg: 'Invalid angle' }
      if (!v0_fn) return { error: 'v0_eq', msg: 'Invalid speed' }
      const theta_deg = th_fn(0), v0 = v0_fn(0)
      if (!theta_deg || theta_deg < 5 || theta_deg > 85) return { error: 'theta_eq', msg: 'Angle must be 5–85°' }
      if (!v0 || v0 < 5 || v0 > 60) return { error: 'v0_eq', msg: 'Speed must be 5–60 yd/s' }
      const p = this.params
      const theta = theta_deg * Math.PI / 180
      const vx = v0 * Math.cos(theta), vy = v0 * Math.sin(theta)
      const t_goal = p.GOAL_YD / vx
      const y_at_goal = vy * t_goal - 0.5 * p.G_YDS * t_goal * t_goal
      const frames = []
      const DT = 1 / 60
      let t = 0
      const trail = []
      for (let i = 0; i < 480; i++) {
        t += DT
        const bx = vx * t
        const by_yd = vy * t - 0.5 * p.G_YDS * t * t
        trail.push({ x: yd(bx), y: CY - by_yd * PY })
        frames.push({ t, bx, by_yd, trail: [...trail] })
        if (by_yd < -2 || t > 10) break
      }
      const clearance = y_at_goal - p.BAR_HEIGHT_YD
      if (clearance >= 0) return { frames, result: 'win', analytical: `GOOD! Cleared by ${clearance.toFixed(2)} yd. At d=${p.GOAL_YD} yd: y(t*)=${y_at_goal.toFixed(2)} yd ≥ ${p.BAR_HEIGHT_YD} yd crossbar. θ=${theta_deg.toFixed(1)}°, v₀=${v0.toFixed(1)} yd/s.` }
      return { frames, result: 'loss', analytical: `No good — ${Math.abs(clearance).toFixed(2)} yd short of crossbar. y(t*) = ${y_at_goal.toFixed(2)} yd, needed ${p.BAR_HEIGHT_YD} yd. Adjust θ or v₀.` }
    },
  },
]

// ─── Canvas drawing functions (module-level, pure) ────────────────────────────
function drawField(ctx) {
  ctx.clearRect(0, 0, W, H)
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#166534' : '#15803d'
    ctx.fillRect(EZ + i * (FW / 10), 0, FW / 10, H)
  }
  ctx.fillStyle = '#991b1b'; ctx.fillRect(0, 0, EZ, H)
  ctx.fillStyle = '#1d4ed8'; ctx.fillRect(W - EZ, 0, EZ, H)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center'
  ;[10, 20, 30, 40, 50, 60, 70, 80, 90].forEach(y => {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.moveTo(yd(y), 8); ctx.lineTo(yd(y), H - 8); ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(y, yd(y), 9)
  })
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.5
  ;[0, 100].forEach(y => { ctx.beginPath(); ctx.moveTo(yd(y), 8); ctx.lineTo(yd(y), H - 8); ctx.stroke() })
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 8px sans-serif'
  ctx.save(); ctx.translate(EZ / 2, H / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('END ZONE', 0, 0); ctx.restore()
  ctx.save(); ctx.translate(W - EZ / 2, H / 2); ctx.rotate(Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('END ZONE', 0, 0); ctx.restore()
}

function drawBall(ctx, x, y, alt, inAir) {
  const r = 5 + alt * 6
  if (inAir && alt > 0.05) {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 2])
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - alt * 18); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(x, y - alt * 18, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  } else {
    ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  }
}

function drawPlayer(ctx, x, y, color, label, r = 11) {
  ctx.fillStyle = color; ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = 'white'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'; ctx.fillText(label, x, y); ctx.textBaseline = 'alphabetic'
}

function drawTrail(ctx, trail, color) {
  trail.forEach((pt, i) => {
    ctx.fillStyle = color; ctx.globalAlpha = 0.08 + (i / trail.length) * 0.35
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2); ctx.fill()
  })
  ctx.globalAlpha = 1
}

function drawFrame(ctx, frame, lvlIdx) {
  drawField(ctx)
  const level = LEVELS[lvlIdx]
  if (!frame) return
  if (lvlIdx === 0 || lvlIdx === 1) {
    const p = level.params
    if (frame.trail) drawTrail(ctx, frame.trail, '#fbbf24')
    drawBall(ctx, frame.bx, frame.by, frame.alt, frame.thrown && frame.alt > 0.05)
    drawPlayer(ctx, frame.rx, frame.ry, '#ea580c', 'WR')
    drawPlayer(ctx, yd(p.QB_YD), CY, '#0284c7', 'QB')
    if (frame.dist !== null && frame.thrown) {
      ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(frame.bx, CY + 28); ctx.lineTo(frame.rx, CY + 28); ctx.stroke()
      ctx.setLineDash([]); ctx.fillStyle = '#fda4af'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(`${frame.dist.toFixed(1)} yd`, (frame.bx + frame.rx) / 2, CY + 40)
    }
  } else if (lvlIdx === 2) {
    const p = level.params
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.arc(frame.tgtX, frame.tgtY, p.CATCH_R_YD * PY, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    if (frame.trail) drawTrail(ctx, frame.trail, '#818cf8')
    drawPlayer(ctx, frame.dx, frame.dy, '#7c3aed', 'CB')
    ctx.fillStyle = '#fbbf24'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('target', frame.tgtX, frame.tgtY - p.CATCH_R_YD * PY - 5)
    ctx.fillStyle = 'rgba(251,191,36,0.15)'; ctx.beginPath()
    ctx.arc(frame.tgtX, frame.tgtY, p.CATCH_R_YD * PY * 3, 0, Math.PI * 2); ctx.fill()
  } else if (lvlIdx === 3) {
    const p = level.params
    const catchX = frame.catchX, catchY = frame.catchY
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.arc(catchX, catchY, p.COV_RADIUS_YD * PY, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    const wOpen = frame.D > p.COV_RADIUS_YD
    ctx.fillStyle = wOpen ? '#4ade80' : '#f87171'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(wOpen ? 'OPEN' : 'CLOSED', catchX, catchY + p.COV_RADIUS_YD * PY + 12)
    if (frame.trail) drawTrail(ctx, frame.trail, '#fbbf24')
    drawBall(ctx, frame.bx, frame.by, frame.alt, frame.thrown && frame.alt > 0.05)
    drawPlayer(ctx, frame.defX, frame.defY, '#dc2626', 'CB')
    drawPlayer(ctx, catchX, catchY, '#ea580c', 'WR')
    drawPlayer(ctx, yd(p.QB_YD), CY, '#0284c7', 'QB')
    ctx.strokeStyle = 'rgba(239,68,68,0.4)'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 3])
    ctx.beginPath(); ctx.moveTo(frame.defX, frame.defY); ctx.lineTo(catchX, catchY); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = '#fca5a5'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`D=${frame.D.toFixed(1)}yd`, (frame.defX + catchX) / 2 + 10, (frame.defY + catchY) / 2 - 5)
  } else if (lvlIdx === 4) {
    if (frame.trail_b) drawTrail(ctx, frame.trail_b, '#ea580c')
    if (frame.trail_d) drawTrail(ctx, frame.trail_d, '#818cf8')
    drawPlayer(ctx, frame.cbx, frame.cby, '#ea580c', 'BC')
    drawPlayer(ctx, frame.dx, frame.dy, '#7c3aed', 'CB')
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`dist=${frame.dist.toFixed(1)}yd`, frame.dx, frame.dy - 15)
  } else if (lvlIdx === 5) {
    const p = level.params
    // Crossbar
    ctx.strokeStyle = 'rgba(251,191,36,0.3)'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 2])
    ctx.beginPath(); ctx.moveTo(yd(0), CY - p.BAR_HEIGHT_YD * PY); ctx.lineTo(yd(p.GOAL_YD + 5), CY - p.BAR_HEIGHT_YD * PY); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = '#fbbf24'; ctx.font = '8px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`crossbar (${p.BAR_HEIGHT_YD} yd)`, yd(p.GOAL_YD + 1), CY - p.BAR_HEIGHT_YD * PY - 4)
    // Goal post
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(yd(p.GOAL_YD), CY); ctx.lineTo(yd(p.GOAL_YD), CY - (p.BAR_HEIGHT_YD + 5) * PY); ctx.stroke()
    const uw = p.UPRIGHT_HALF * PY
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(yd(p.GOAL_YD) - uw, CY - p.BAR_HEIGHT_YD * PY); ctx.lineTo(yd(p.GOAL_YD) + uw, CY - p.BAR_HEIGHT_YD * PY); ctx.stroke()
    // Ground line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(yd(0), CY); ctx.lineTo(yd(p.GOAL_YD + 10), CY); ctx.stroke()
    // Ball trail and ball
    if (frame.trail && frame.trail.length > 1) {
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(frame.trail[0].x, frame.trail[0].y)
      frame.trail.forEach(pt => ctx.lineTo(pt.x, pt.y)); ctx.stroke()
    }
    const bx = yd(frame.bx), by_screen = CY - frame.by_yd * PY
    drawBall(ctx, bx, by_screen, Math.max(0, frame.by_yd / 20), frame.by_yd > 0.5)
  }
}

function drawStaticSetup(ctx, lvlIdx) {
  const level = LEVELS[lvlIdx]
  const p = level.params
  if (lvlIdx === 0) {
    drawPlayer(ctx, yd(p.QB_YD), CY, '#0284c7', 'QB')
    drawPlayer(ctx, yd(p.REC_YD0), CY, '#ea580c', 'WR')
    drawBall(ctx, yd(p.QB_YD), CY, 0, false)
  } else if (lvlIdx === 1) {
    drawPlayer(ctx, yd(p.QB_YD), CY, '#0284c7', 'QB')
    drawPlayer(ctx, yd(p.REC_YD0), CY, '#ea580c', 'WR')
    drawBall(ctx, yd(p.QB_YD), CY, 0, false)
  } else if (lvlIdx === 2) {
    drawPlayer(ctx, yd(p.DEF_YD), CY + p.DEF_Y_OFFSET, '#7c3aed', 'CB')
    ctx.strokeStyle = 'rgba(251,191,36,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.arc(yd(p.TARGET_YD), CY + p.TARGET_Y_OFFSET, p.CATCH_R_YD * PY, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = '#fbbf24'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('intercept zone', yd(p.TARGET_YD), CY + p.TARGET_Y_OFFSET - p.CATCH_R_YD * PY - 5)
  } else if (lvlIdx === 3) {
    const catchX = yd(p.CATCH_YD), catchY = CY + p.CATCH_Y_OFFSET
    drawPlayer(ctx, yd(p.QB_YD), CY, '#0284c7', 'QB')
    drawPlayer(ctx, catchX, catchY, '#ea580c', 'WR')
    drawPlayer(ctx, yd(p.DEF_YD), CY + p.DEF_Y_OFFSET, '#dc2626', 'CB')
    ctx.strokeStyle = 'rgba(239,68,68,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.arc(catchX, catchY, p.COV_RADIUS_YD * PY, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    ctx.strokeStyle = 'rgba(234,88,12,0.3)'; ctx.lineWidth = 0.8; ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.moveTo(yd(p.QB_YD), CY); ctx.lineTo(catchX, catchY); ctx.stroke(); ctx.setLineDash([])
  } else if (lvlIdx === 4) {
    drawPlayer(ctx, yd(p.DEF_YD), CY + p.DEF_Y_OFFSET, '#7c3aed', 'CB')
    drawPlayer(ctx, yd(20), CY, '#ea580c', 'BC')
    ctx.strokeStyle = 'rgba(234,88,12,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(yd(20), CY)
    for (let t2 = 0; t2 <= 3; t2 += 0.1) {
      ctx.lineTo(yd(Math.min(20 + p.V_CARRIER_X * t2, 95)), CY + p.A_CARRIER_Y * Math.sin(t2) * PY)
    }
    ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = 'rgba(234,88,12,0.4)'; ctx.font = '8px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText('carrier route (known)', yd(22), CY - 10)
  } else if (lvlIdx === 5) {
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(yd(p.GOAL_YD), CY); ctx.lineTo(yd(p.GOAL_YD), CY - (p.BAR_HEIGHT_YD + 5) * PY); ctx.stroke()
    const uw = p.UPRIGHT_HALF * PY
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(yd(p.GOAL_YD) - uw, CY - p.BAR_HEIGHT_YD * PY); ctx.lineTo(yd(p.GOAL_YD) + uw, CY - p.BAR_HEIGHT_YD * PY); ctx.stroke()
    ctx.strokeStyle = 'rgba(251,191,36,0.4)'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 2])
    ctx.beginPath(); ctx.moveTo(yd(0), CY - p.BAR_HEIGHT_YD * PY); ctx.lineTo(yd(p.GOAL_YD), CY - p.BAR_HEIGHT_YD * PY); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = '#fbbf24'; ctx.font = '8px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`crossbar: ${p.BAR_HEIGHT_YD} yd high`, yd(1), CY - p.BAR_HEIGHT_YD * PY - 4)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(yd(0), CY); ctx.lineTo(yd(p.GOAL_YD + 10), CY); ctx.stroke()
    drawBall(ctx, yd(0) + 5, CY - 2, 0, false)
  }
}

// ─── Live values for current frame ───────────────────────────────────────────
function LiveValues({ frame, lvlIdx }) {
  if (!frame) return null
  const rows = []
  rows.push({ label: 't', value: `${frame.t.toFixed(2)}s`, color: '#e2e8f0' })
  if (lvlIdx === 0 || lvlIdx === 1) {
    if (frame.rx !== undefined) rows.push({ label: 'x_r(t)', value: `${px2yd(frame.rx)} yd`, color: '#ea580c' })
    if (frame.bx !== undefined) rows.push({ label: 'x_b(t)', value: `${px2yd(frame.bx)} yd`, color: '#fbbf24' })
    if (frame.dist != null) rows.push({ label: 'gap', value: `${frame.dist.toFixed(2)} yd`, color: frame.dist < 2 ? '#4ade80' : '#f87171' })
  } else if (lvlIdx === 3) {
    rows.push({ label: 'D(t)', value: `${frame.D.toFixed(2)} yd`, color: frame.D > 3 ? '#4ade80' : '#f87171' })
    rows.push({ label: 'actual dD/dt', value: `${frame.actualRate != null ? frame.actualRate.toFixed(2) : '?'} yd/s`, color: '#e2e8f0' })
    rows.push({ label: 'your model', value: `${frame.userRate != null ? frame.userRate.toFixed(2) : '?'} yd/s`, color: '#e2e8f0' })
  } else if (lvlIdx === 4) {
    rows.push({ label: 'v_x(t)', value: frame.vx != null ? frame.vx.toFixed(2) : '?', color: '#e2e8f0' })
    rows.push({ label: 'v_y(t)', value: frame.vy != null ? frame.vy.toFixed(2) : '?', color: '#e2e8f0' })
    rows.push({ label: 'dist', value: `${frame.dist.toFixed(2)} yd`, color: frame.dist < 3 ? '#4ade80' : '#f87171' })
  } else if (lvlIdx === 5) {
    rows.push({ label: 'x(t)', value: `${frame.bx.toFixed(2)} yd`, color: '#e2e8f0' })
    rows.push({ label: 'y(t)', value: `${frame.by_yd.toFixed(2)} yd`, color: '#e2e8f0' })
  }
  return (
    <div className="rounded-lg p-3 border mt-2" style={{ background: '#161628', borderColor: '#333' }}>
      <div className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>live values</div>
      {rows.map(r => (
        <div key={r.label} className="flex justify-between mb-1">
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#7dd3fc' }}>{r.label}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: r.color }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FootballCalculus() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const simRef = useRef(null) // { frames, frameIdx, levelIdx }

  const [levelIdx, setLevelIdx] = useState(0)
  const [inputs, setInputs] = useState({})
  const [inputErrors, setInputErrors] = useState({})
  const [warning, setWarning] = useState('')
  const [result, setResult] = useState(null)
  const [analytical, setAnalytical] = useState('')
  const [playing, setPlaying] = useState(false)
  const [hasFrames, setHasFrames] = useState(false)
  const [liveFrame, setLiveFrame] = useState(null)

  const level = LEVELS[levelIdx]

  // Draw static setup whenever not playing and no frames
  useEffect(() => {
    if (hasFrames) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    drawField(ctx)
    drawStaticSetup(ctx, levelIdx)
  }, [levelIdx, hasFrames])

  // Cleanup animation on unmount
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])

  const stopAnim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    setPlaying(false)
    if (simRef.current) {
      const { frames } = simRef.current
      if (frames && frames.length > 0) setLiveFrame(frames[frames.length - 1])
    }
  }, [])

  const tick = useCallback(() => {
    if (!simRef.current) return
    const { frames, levelIdx: lvl } = simRef.current
    const fi = simRef.current.frameIdx
    if (fi >= frames.length) {
      setPlaying(false)
      setLiveFrame(frames[frames.length - 1])
      simRef.current.frameIdx = frames.length
      return
    }
    const canvas = canvasRef.current
    if (canvas) drawFrame(canvas.getContext('2d'), frames[fi], lvl)
    simRef.current.frameIdx = fi + 1
    if (fi % 6 === 0) setLiveFrame(frames[fi])
    animRef.current = requestAnimationFrame(tick)
  }, [])

  const runSimulation = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    const res = LEVELS[levelIdx].run(inputs)
    if (res.error) {
      setInputErrors({ [res.error]: res.msg })
      setWarning('')
      setHasFrames(false)
      setResult(null)
      return
    }
    if (res.warning) {
      setWarning(res.warning)
      setInputErrors({})
      setHasFrames(false)
      setResult(null)
      return
    }
    setInputErrors({})
    setWarning('')
    setResult(res.result)
    setAnalytical(res.analytical || '')
    setHasFrames(true)
    setLiveFrame(null)
    setPlaying(true)
    simRef.current = { frames: res.frames, frameIdx: 0, levelIdx }
    animRef.current = requestAnimationFrame(tick)
  }, [levelIdx, inputs, tick])

  const resetSim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    simRef.current = null
    setHasFrames(false)
    setResult(null)
    setAnalytical('')
    setWarning('')
    setLiveFrame(null)
    setPlaying(false)
  }, [])

  const selectLevel = useCallback((idx) => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    simRef.current = null
    setLevelIdx(idx)
    setInputs({})
    setInputErrors({})
    setWarning('')
    setResult(null)
    setAnalytical('')
    setHasFrames(false)
    setLiveFrame(null)
    setPlaying(false)
  }, [])

  const setInput = useCallback((id, val) => {
    setInputs(prev => ({ ...prev, [id]: val }))
    setInputErrors({})
    setWarning('')
  }, [])

  return (
    <div style={{ color: '#f0f0f0', maxWidth: 900, margin: '0 auto', padding: 12, fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 10, color: '#f0f0f0' }}>Football Calculus</div>

      {/* Level tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {LEVELS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => selectLevel(i)}
            style={{
              padding: '7px 13px', border: `1px solid ${i === levelIdx ? l.color + '55' : '#333'}`,
              borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: i === levelIdx ? 500 : 400,
              background: i === levelIdx ? l.color + '22' : 'transparent',
              color: i === levelIdx ? l.color : '#94a3b8', transition: 'all .15s',
            }}
          >
            <div>{l.name}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{l.concept.split('/')[0].trim()}</div>
          </button>
        ))}
      </div>

      {/* Concept bar */}
      <div style={{
        borderLeft: `3px solid ${level.color}`, borderRadius: '0 6px 6px 0',
        padding: '8px 12px', marginBottom: 12, fontSize: 12,
        background: level.color + '11', color: level.color,
      }}>
        <strong>{level.concept}</strong> — {level.description}
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {/* Left: canvas + inputs */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{ width: '100%', borderRadius: 8, border: '2px solid #14532d', display: 'block' }}
          />

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {level.inputs.map(inp => (
              <div key={inp.id}>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>{inp.label}</label>
                <input
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 6,
                    border: `1.5px solid ${inputErrors[inp.id] ? '#e05555' : '#555'}`,
                    background: '#1a1a2e', color: '#f0f0f0',
                    fontFamily: 'monospace', fontSize: 15, boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  value={inputs[inp.id] || ''}
                  placeholder={inp.placeholder}
                  onChange={e => setInput(inp.id, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runSimulation() }}
                />
                {inputErrors[inp.id] && (
                  <div style={{ fontSize: 11, color: '#f87171', marginTop: 3 }}>{inputErrors[inp.id]}</div>
                )}
                <div style={{ fontSize: 11, color: '#60a5fa', fontFamily: 'monospace', marginTop: 3 }}>{inp.hint}</div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {!playing ? (
                <button
                  onClick={runSimulation}
                  style={{ padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, color: 'white', background: '#3b82f6' }}
                >
                  Run Simulation
                </button>
              ) : (
                <button
                  onClick={stopAnim}
                  style={{ padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, color: 'white', background: '#6b7280' }}
                >
                  Stop
                </button>
              )}
              {hasFrames && (
                <button
                  onClick={resetSim}
                  style={{ padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, color: 'white', background: '#555' }}
                >
                  Reset
                </button>
              )}
            </div>

            {warning && (
              <div style={{ padding: '10px 14px', borderRadius: 7, fontWeight: 500, fontSize: 13, background: '#1e3a5f', color: '#93c5fd' }}>
                {warning}
              </div>
            )}
            {result && !playing && (
              <div style={{
                padding: '10px 14px', borderRadius: 7, fontWeight: 500, fontSize: 13,
                background: result === 'win' ? '#14532d' : '#450a0a',
                color: result === 'win' ? '#4ade80' : '#fca5a5',
              }}>
                {analytical}
              </div>
            )}
          </div>
        </div>

        {/* Right: theory + live values */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <div style={{ background: '#161628', borderRadius: 10, padding: 14, border: '1px solid #333', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: level.color, marginBottom: 8 }}>{level.concept}</div>
            {level.theory.map((line, i) => {
              const isMath = line.includes('=') || line.includes('→') || line.startsWith('x(') || line.startsWith('y(') || line.startsWith('v(') || line.startsWith('R(') || line.startsWith('D(') || line.startsWith('d')
              return isMath ? (
                <div key={i} style={{ margin: '3px 0', padding: '4px 7px', background: '#0f172a', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, color: '#a5f3fc' }}>
                  {line}
                </div>
              ) : (
                <div key={i} style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0' }}>{line}</div>
              )
            })}
          </div>

          {(hasFrames || liveFrame) && (
            <LiveValues frame={liveFrame} lvlIdx={levelIdx} />
          )}
        </div>
      </div>
    </div>
  )
}
