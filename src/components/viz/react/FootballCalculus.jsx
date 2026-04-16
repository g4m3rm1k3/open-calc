// FootballCalculus.jsx — Top-down, multi-player, formula-driven football calculus
import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Field geometry ───────────────────────────────────────────────────────────
const W = 780, H = 380
const EZ = 48              // endzone px
const FW = W - 2 * EZ     // 684px = 100 yards
const PY = FW / 100        // 6.84 px/yard (both axes, square grid)
const CY = H / 2           // 190px = lateral center of field

const fx = x => EZ + x * PY          // downfield yards → pixel x
const fy = y => CY - y * PY          // lateral yards from center → pixel y (+ = top)

// ─── Formula parser ───────────────────────────────────────────────────────────
function parseExpr(expr, vars = {}) {
  if (!expr || !expr.trim()) return null
  try {
    const js = expr.trim()
      .replace(/\^/g, '**')
      .replace(/\bsqrt\b/g, 'Math.sqrt').replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos').replace(/\btan\b/g, 'Math.tan')
      .replace(/\batan\b/g, 'Math.atan').replace(/\batan2\b/g, 'Math.atan2')
      .replace(/\babs\b/g, 'Math.abs').replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E').replace(/\bln\b/g, 'Math.log')
      .replace(/\bexp\b/g, 'Math.exp')
    const args = Object.keys(vars)
    // eslint-disable-next-line no-new-func
    const fn = new Function(...args, `"use strict"; return (${js});`)
    return (...vals) => {
      try { const r = fn(...vals); return (typeof r === 'number' && isFinite(r)) ? r : null }
      catch { return null }
    }
  } catch { return null }
}

// ─── Player route engine ──────────────────────────────────────────────────────
// segs: [{dur (s, omit = forever), vx (yd/s), vy (yd/s)}]
function posAt(player, t) {
  let x = player.x0, y = player.y0, rem = t
  for (const s of player.segs) {
    const dur = s.dur ?? Infinity
    const dt = isFinite(dur) ? Math.min(rem, dur) : rem
    x += (s.vx ?? 0) * dt
    y += (s.vy ?? 0) * dt
    rem -= dt
    if (rem <= 0) break
  }
  return { x, y }
}
function velAt(player, t) {
  let rem = t
  for (const s of player.segs) {
    rem -= (s.dur ?? Infinity)
    if (rem <= 0) return { vx: s.vx ?? 0, vy: s.vy ?? 0 }
  }
  const last = player.segs[player.segs.length - 1]
  return { vx: last?.vx ?? 0, vy: last?.vy ?? 0 }
}

// ─── Plays ────────────────────────────────────────────────────────────────────
const PLAYS = [
  // ── P1: Slant Route — WALKTHROUGH ─────────────────────────────────────────
  {
    id: 'P1', name: 'Slant Route', down: '2nd & 8',
    concept: 'Integration · x(t) = x₀ + v·t',
    color: '#22c55e',
    description: 'WALKTHROUGH — WR1 runs a slant at constant velocity. Write both position equations, then find throw time T so the ball meets WR1 where he WILL BE, not where he is now.',
    theory: [
      'Step 1 — WR1 starts at (30 yd, 10 yd lateral) running:',
      'vx = 5 yd/s downfield,  vy = −3 yd/s (cutting inside)',
      'x_r(t) = 30 + 5·t        y_r(t) = 10 − 3·t',
      'Step 2 — QB at (28, 0), ball speed v_b = 28 yd/s.',
      'At throw time T ball flies straight to WR1\'s spot at T.',
      'Step 3 — While ball travels (t_f sec) WR1 keeps moving.',
      'A catch needs ball to arrive at WR1\'s actual position.',
      'Too early: WR1 runs past the ball. Too late: CB recovers.',
      'Find T where ball meets WR1 before CB closes the gap.',
    ],
    inputs: [
      { id: 'rx', label: 'WR1 downfield position x_r(t) — yards:', placeholder: '30 + 5*t', hint: 'WR1 starts at 30 yd downfield, runs at 5 yd/s' },
      { id: 'ry', label: 'WR1 lateral position y_r(t) — yards from center:', placeholder: '10 - 3*t', hint: 'Starts 10 yd from center, cuts inside at 3 yd/s (negative = toward center)' },
      { id: 'T',  label: 'Throw at time T (seconds after snap):', placeholder: 'e.g.  1.2', hint: 'Hint: compute dist from QB to WR1 at T, then t_flight = dist / 28' },
    ],
    players: [
      { id: 'QB',  x0: 28, y0:  0, color: '#38bdf8', label: 'QB',  segs: [{ vx: 0,   vy: 0   }], offense: true  },
      { id: 'WR1', x0: 30, y0: 10, color: '#f97316', label: 'WR1', segs: [{ vx: 5,   vy: -3  }], offense: true  },
      { id: 'WR2', x0: 30, y0: 22, color: '#fb923c', label: 'WR2', segs: [{ vx: 5,   vy: 0   }], offense: true  },
      { id: 'CB1', x0: 33, y0: 11, color: '#f87171', label: 'CB',  segs: [{ vx: 4.5, vy: -2.5}], offense: false },
      { id: 'CB2', x0: 33, y0: 23, color: '#fca5a5', label: 'CB2', segs: [{ vx: 5,   vy: 0   }], offense: false },
      { id: 'LB',  x0: 38, y0:  2, color: '#c084fc', label: 'LB',  segs: [{ dur: 0.8, vx: -1, vy: 3 }, { vx: -0.5, vy: 0 }], offense: false },
      { id: 'S',   x0: 48, y0:  8, color: '#a855f7', label: 'S',   segs: [{ vx: -2,  vy: -3  }], offense: false },
    ],
    qbId: 'QB', targetId: 'WR1', coverId: 'CB1', vBall: 28, catchR: 2,
    run(inputs) {
      const rx_fn = parseExpr(inputs.rx, { t: 0 })
      const ry_fn = parseExpr(inputs.ry, { t: 0 })
      const T = parseFloat(inputs.T)
      if (!rx_fn) return { error: 'rx', msg: 'Invalid — try: 30 + 5*t' }
      if (!ry_fn) return { error: 'ry', msg: 'Invalid — try: 10 - 3*t' }
      if (isNaN(T) || T < 0 || T > 6) return { error: 'T', msg: 'T must be 0–6 s' }
      const wr1 = this.players.find(p => p.id === 'WR1')
      for (const ta of [0, 0.5, 1, 2]) {
        const act = posAt(wr1, ta)
        const gx = rx_fn(ta), gy = ry_fn(ta)
        if (gx === null || Math.abs(gx - act.x) > 1.5)
          return { warning: `x_r(${ta}s) = ${gx?.toFixed(1) ?? '?'} yd, but WR1 is at x = ${act.x.toFixed(1)} yd. Check x₀ or vx.` }
        if (gy === null || Math.abs(gy - act.y) > 1.5)
          return { warning: `y_r(${ta}s) = ${gy?.toFixed(1) ?? '?'} yd, but WR1 is at y = ${act.y.toFixed(1)} yd. Check y₀ or vy.` }
      }
      const DT = 1 / 60
      const qb  = this.players.find(p => p.id === this.qbId)
      const tgt = this.players.find(p => p.id === this.targetId)
      const cb  = this.players.find(p => p.id === this.coverId)
      let thrown = false, bx = qb.x0, by = qb.y0, bvx = 0, bvy = 0
      let throwDist = 0
      const trail = []
      const frames = []
      for (let i = 0; i < 600; i++) {
        const t = i * DT
        const players = this.players.map(p => {
          const pos = posAt(p, t), vel = velAt(p, t)
          return { ...p, ...pos, ...vel }
        })
        if (!thrown && t >= T) {
          thrown = true
          const tgtPos = posAt(tgt, T), qbPos = posAt(qb, T)
          const dx = tgtPos.x - qbPos.x, dy = tgtPos.y - qbPos.y
          throwDist = Math.sqrt(dx * dx + dy * dy)
          bvx = (dx / throwDist) * this.vBall
          bvy = (dy / throwDist) * this.vBall
        }
        let alt = 0
        if (thrown) {
          bx += bvx * DT; by += bvy * DT
          const traveled = Math.sqrt((bx - posAt(qb, T).x) ** 2 + (by - posAt(qb, T).y) ** 2)
          alt = Math.max(0, Math.sin(Math.min(traveled / throwDist, 1) * Math.PI))
          trail.push({ x: bx, y: by })
        }
        const tgtNow = posAt(tgt, t), cbNow = posAt(cb, t)
        const catchDist = Math.sqrt((bx - tgtNow.x) ** 2 + (by - tgtNow.y) ** 2)
        const cbBallDist = Math.sqrt((bx - cbNow.x) ** 2 + (by - cbNow.y) ** 2)
        frames.push({ t, players, bx, by, alt, thrown, trail: [...trail], catchDist, cbBallDist })
        if (thrown && catchDist < this.catchR) {
          return { frames, result: 'win', analytical: `Caught at t=${t.toFixed(2)}s! WR1 at (${tgtNow.x.toFixed(1)}, ${tgtNow.y.toFixed(1)}) yd. Ball on target.` }
        }
        if (thrown && cbBallDist < 1.5 && alt < 0.25) {
          return { frames, result: 'loss', analytical: `Tipped by CB! Throw a bit earlier — CB recovered in the window. Try T ≈ ${(T - 0.2).toFixed(1)}–${(T + 0.15).toFixed(1)} s.` }
        }
        if (t > 6 || bx > 75) break
      }
      const last = frames[frames.length - 1]
      const tgtLast = last?.players?.find(p => p.id === this.targetId)
      const over = tgtLast && last.bx > tgtLast.x
      return { frames, result: 'loss', analytical: `Incomplete — ball ${(last?.catchDist || 99).toFixed(1)} yd from WR1. ${over ? 'Overthrown — decrease T.' : 'Underthrown — increase T.'}` }
    },
  },

  // ── P2: Seam Route — Related Rates ────────────────────────────────────────
  {
    id: 'P2', name: 'Seam Route', down: '3rd & 5',
    concept: 'Related Rates · dD/dt',
    color: '#f59e0b',
    description: 'Two receivers, two defenders closing. Write dD/dt (closure rate) for each option. Calculate which window stays open longer — then throw before it closes.',
    theory: [
      'For each receiver, track D(t) = defender distance to catch point.',
      'dD/dt = rate window closes (negative = closing fast)',
      'Time window closes: t_close = (D₀ − 2) / |dD/dt|',
      'Ball flight time: t_f = dist(QB, catch_point) / 28',
      'Throw at time T if: T + t_f < t_close',
      'WR1 catch at (50, 12). CB1 starts 14 yd from that point.',
      'WR2 catch at (46, −10). Safety starts 19 yd from that point.',
      'Use geometry: D₀ = √(Δx²+Δy²). Estimate dD/dt from speed.',
    ],
    inputs: [
      { id: 'dD1', label: 'Closure rate on WR1 (dD₁/dt in yd/s, must be negative):', placeholder: 'e.g.  -5', hint: 'CB1 moves ~5 yd/s toward WR1\'s catch point (50, 12). D₀ ≈ 14 yd.' },
      { id: 'dD2', label: 'Closure rate on WR2 (dD₂/dt in yd/s, must be negative):', placeholder: 'e.g.  -3.5', hint: 'Safety moves ~3.5 yd/s toward WR2\'s catch point (46, −10). D₀ ≈ 19 yd.' },
      { id: 'choice', label: 'Which receiver? (1 or 2):', placeholder: '1  or  2', hint: 'Calculate t_close for each. Pick the one with more time.' },
      { id: 'T', label: 'Throw at time T (seconds):', placeholder: 'e.g.  1.5', hint: 'Ball speed 28 yd/s from QB at (28, 0). Must arrive before window closes.' },
    ],
    players: [
      { id: 'QB',  x0: 28, y0:   0, color: '#38bdf8', label: 'QB',  segs: [{ vx: 0, vy: 0  }], offense: true  },
      { id: 'WR1', x0: 30, y0:  12, color: '#f97316', label: 'WR1', segs: [{ vx: 6, vy:  0  }], offense: true  },
      { id: 'WR2', x0: 30, y0: -10, color: '#fb923c', label: 'WR2', segs: [{ vx: 5, vy: -1  }], offense: true  },
      { id: 'CB1', x0: 38, y0:  17, color: '#f87171', label: 'CB1', segs: [{ vx: 5, vy: -3  }], offense: false },
      { id: 'S',   x0: 44, y0:   3, color: '#a855f7', label: 'S',   segs: [{ vx: 3, vy: -5  }], offense: false },
      { id: 'LB',  x0: 36, y0:  -3, color: '#c084fc', label: 'LB',  segs: [{ vx: 2, vy: -2  }], offense: false },
    ],
    catchPts: { WR1: { x: 50, y: 12 }, WR2: { x: 46, y: -10 } },
    coverIds: { WR1: 'CB1', WR2: 'S' },
    qbId: 'QB', vBall: 28, catchR: 2,
    run(inputs) {
      const dD1 = parseFloat(inputs.dD1), dD2 = parseFloat(inputs.dD2)
      const choice = parseInt(inputs.choice), T = parseFloat(inputs.T)
      if (isNaN(dD1) || dD1 >= 0) return { error: 'dD1', msg: 'Must be a negative number (window closing toward WR1)' }
      if (isNaN(dD2) || dD2 >= 0) return { error: 'dD2', msg: 'Must be a negative number (window closing toward WR2)' }
      if (choice !== 1 && choice !== 2) return { error: 'choice', msg: 'Enter 1 or 2' }
      if (isNaN(T) || T < 0 || T > 6) return { error: 'T', msg: 'T must be 0–6 s' }
      const cb1 = this.players.find(p => p.id === 'CB1')
      const s   = this.players.find(p => p.id === 'S')
      const cp1 = this.catchPts.WR1, cp2 = this.catchPts.WR2
      const qb  = this.players.find(p => p.id === this.qbId)
      const trueD1_0 = Math.sqrt((posAt(cb1, 0).x - cp1.x) ** 2 + (posAt(cb1, 0).y - cp1.y) ** 2)
      const trueD1_1 = Math.sqrt((posAt(cb1, 1).x - cp1.x) ** 2 + (posAt(cb1, 1).y - cp1.y) ** 2)
      const trueRate1 = trueD1_1 - trueD1_0
      if (Math.abs(dD1 - trueRate1) > 2)
        return { warning: `dD₁/dt ≈ ${trueRate1.toFixed(1)} yd/s (CB1 goes from ${trueD1_0.toFixed(1)} to ${trueD1_1.toFixed(1)} yd from catch point in 1s). You entered ${dD1.toFixed(1)}.` }
      const trueD2_0 = Math.sqrt((posAt(s, 0).x - cp2.x) ** 2 + (posAt(s, 0).y - cp2.y) ** 2)
      const trueD2_1 = Math.sqrt((posAt(s, 1).x - cp2.x) ** 2 + (posAt(s, 1).y - cp2.y) ** 2)
      const trueRate2 = trueD2_1 - trueD2_0
      if (Math.abs(dD2 - trueRate2) > 2)
        return { warning: `dD₂/dt ≈ ${trueRate2.toFixed(1)} yd/s (Safety goes from ${trueD2_0.toFixed(1)} to ${trueD2_1.toFixed(1)} yd in 1s). You entered ${dD2.toFixed(1)}.` }
      const tClose1 = (trueD1_0 - this.catchR) / Math.abs(trueRate1)
      const tClose2 = (trueD2_0 - this.catchR) / Math.abs(trueRate2)
      const cp = choice === 1 ? cp1 : cp2
      const defId = this.coverIds[choice === 1 ? 'WR1' : 'WR2']
      const defPlayer = this.players.find(p => p.id === defId)
      const dx = cp.x - qb.x0, dy = cp.y - qb.y0
      const throwDist = Math.sqrt(dx * dx + dy * dy)
      const bvx = (dx / throwDist) * this.vBall, bvy = (dy / throwDist) * this.vBall
      let thrown = false, bx = qb.x0, by = qb.y0
      const trail = [], frames = []
      const DT = 1 / 60
      for (let i = 0; i < 600; i++) {
        const t = i * DT
        const players = this.players.map(p => {
          const pos = posAt(p, t), vel = velAt(p, t)
          return { ...p, ...pos, ...vel }
        })
        if (!thrown && t >= T) thrown = true
        let alt = 0
        if (thrown) {
          bx += bvx * DT; by += bvy * DT
          const traveled = Math.sqrt((bx - qb.x0) ** 2 + (by - qb.y0) ** 2)
          alt = Math.max(0, Math.sin(Math.min(traveled / throwDist, 1) * Math.PI))
          trail.push({ x: bx, y: by })
        }
        const defNow = posAt(defPlayer, t)
        const defDist = Math.sqrt((defNow.x - cp.x) ** 2 + (defNow.y - cp.y) ** 2)
        const ballNear = Math.sqrt((bx - cp.x) ** 2 + (by - cp.y) ** 2)
        frames.push({ t, players, bx, by, alt, thrown, trail: [...trail], defDist, ballNear, catchPts: this.catchPts, tClose1, tClose2 })
        if (thrown && ballNear < this.catchR) {
          if (defDist > this.catchR) return { frames, result: 'win', analytical: `Complete! WR${choice} open — window ${defDist.toFixed(1)} yd. t_close1=${tClose1.toFixed(1)}s, t_close2=${tClose2.toFixed(1)}s.` }
          return { frames, result: 'loss', analytical: `Defended! Window had closed (D=${defDist.toFixed(1)} yd < 2 yd). Throw before t=${(choice===1?tClose1:tClose2).toFixed(1)}s.` }
        }
        if (t > 6 || bx > 80) break
      }
      return { frames, result: 'loss', analytical: 'Ball went out of bounds. Adjust T.' }
    },
  },

  // ── P3: Pick Six — Parametric Intersection ────────────────────────────────
  {
    id: 'P3', name: 'Pick Six', down: 'Defense',
    concept: 'Parametric Paths · find t* where paths intersect',
    color: '#a78bfa',
    description: 'The offense threw a pass. You control the CB★. Write velocity components vx(t) and vy(t) to intercept the ball — reach it before the receiver does.',
    theory: [
      'Ball thrown at t=1.2s from QB (28, 0) toward (55, 16):',
      'x_ball(t) = 28 + vbx·(t − 1.2)   for t ≥ 1.2',
      'y_ball(t) = 0  + vby·(t − 1.2)',
      'Your CB★ starts at (55, −14):',
      'x_cb(t) = 55 + ∫vx dt,   y_cb(t) = −14 + ∫vy dt',
      'Intercept: |CB(t*) − ball(t*)| < 2 yd',
      'Hint: find where ball will be at t*, then aim there.',
      't* ≈ dist(CB, intercept_pt) / |v_cb|',
      'Speed cap: √(vx²+vy²) ≤ 12 yd/s.',
    ],
    inputs: [
      { id: 'vx', label: 'CB horizontal velocity vx(t) — yd/s (+ = downfield):', placeholder: 'e.g.  -3', hint: 'CB starts at (55, −14). Ball heading to ≈(55, 16) at 28 yd/s.' },
      { id: 'vy', label: 'CB lateral velocity vy(t) — yd/s (+ = toward top of screen):', placeholder: 'e.g.  11', hint: 'Compute: intercept_y − (−14) = how far to travel laterally. Speed ≤ 12 yd/s.' },
    ],
    players: [
      { id: 'QB',  x0: 28, y0:   0, color: '#38bdf8', label: 'QB', segs: [{ vx: 0, vy: 0 }], offense: true  },
      { id: 'WR',  x0: 30, y0:  12, color: '#f97316', label: 'WR', segs: [{ vx: 6, vy: 1 }], offense: true  },
      { id: 'CB',  x0: 55, y0: -14, color: '#818cf8', label: 'CB★',segs: [], offense: false, controlled: true },
      { id: 'S',   x0: 48, y0:   5, color: '#a855f7', label: 'S',  segs: [{ vx: -2, vy: 4 }], offense: false },
    ],
    throwT: 1.2, throwFrom: { x: 28, y: 0 }, throwTo: { x: 55, y: 16 }, vBall: 28, catchR: 2.5,
    run(inputs) {
      const vx_fn = parseExpr(inputs.vx, { t: 0 })
      const vy_fn = parseExpr(inputs.vy, { t: 0 })
      if (!vx_fn) return { error: 'vx', msg: 'Invalid vx — try: -3' }
      if (!vy_fn) return { error: 'vy', msg: 'Invalid vy — try: 11' }
      const DT = 1 / 60
      const { throwT, throwFrom, throwTo, vBall } = this
      const dx = throwTo.x - throwFrom.x, dy = throwTo.y - throwFrom.y
      const throwDist = Math.sqrt(dx * dx + dy * dy)
      const bvx = (dx / throwDist) * vBall, bvy = (dy / throwDist) * vBall
      let cbX = 55, cbY = -14
      const trail_cb = [], trail_ball = [], frames = []
      const wr = this.players.find(p => p.id === 'WR')
      const s  = this.players.find(p => p.id === 'S')
      for (let i = 0; i < 540; i++) {
        const t = i * DT
        const thrown = t >= throwT
        const bx = thrown ? throwFrom.x + bvx * (t - throwT) : throwFrom.x
        const by = thrown ? throwFrom.y + bvy * (t - throwT) : throwFrom.y
        const prog = thrown ? Math.min(Math.sqrt((bx - throwFrom.x) ** 2 + (by - throwFrom.y) ** 2) / throwDist, 1) : 0
        const alt = thrown ? Math.max(0, Math.sin(prog * Math.PI)) : 0
        const rawVx = vx_fn(t) ?? 0, rawVy = vy_fn(t) ?? 0
        const speed = Math.sqrt(rawVx * rawVx + rawVy * rawVy)
        const scale = speed > 12 ? 12 / speed : 1
        cbX += rawVx * scale * DT; cbY += rawVy * scale * DT
        if (thrown) { trail_ball.push({ x: bx, y: by }); trail_cb.push({ x: cbX, y: cbY }) }
        const wrNow = posAt(wr, t), sNow = posAt(s, t)
        const players = [
          { ...this.players.find(p => p.id === 'QB'), ...posAt(this.players.find(p => p.id === 'QB'), t), ...velAt(this.players.find(p => p.id === 'QB'), t) },
          { ...wr, ...wrNow, ...velAt(wr, t) },
          { id: 'CB', x: cbX, y: cbY, vx: rawVx * scale, vy: rawVy * scale, color: '#818cf8', label: 'CB★', offense: false, controlled: true },
          { ...s, ...sNow, ...velAt(s, t) },
        ]
        const cbBall = Math.sqrt((cbX - bx) ** 2 + (cbY - by) ** 2)
        const wrBall = Math.sqrt((wrNow.x - bx) ** 2 + (wrNow.y - by) ** 2)
        frames.push({ t, players, bx, by, alt, thrown, trail_cb: [...trail_cb], trail_ball: [...trail_ball], cbBall, wrBall })
        if (thrown && cbBall < this.catchR && cbBall < wrBall) {
          return { frames, result: 'win', analytical: `INTERCEPTION at t=${t.toFixed(2)}s! CB beat WR by ${(wrBall - cbBall).toFixed(1)} yd. At (${bx.toFixed(1)}, ${by.toFixed(1)}).` }
        }
        if (thrown && wrBall < this.catchR) {
          return { frames, result: 'loss', analytical: `WR caught it — CB was ${cbBall.toFixed(1)} yd away. Adjust vx/vy to reach the ball's path earlier.` }
        }
        if (bx > 90 || t > 8) break
      }
      return { frames, result: 'loss', analytical: 'Ball went incomplete. Adjust velocity direction.' }
    },
  },

  // ── P4: Power Run — Impulse ───────────────────────────────────────────────
  {
    id: 'P4', name: 'Power Run', down: '4th & 1',
    concept: 'Impulse · J = ∫F(t) dt = Δp',
    color: '#ef4444',
    description: 'RB charges at 6 yd/s (momentum = 1200 lb·yd/s). Your blocker applies force F(t). The system integrates it — does your impulse stop the LB before the RB is tackled?',
    theory: [
      'RB: mass 200 lb, speed 6 yd/s → p_RB = 1200 lb·yd/s',
      'LB: mass 230 lb, speed 5 yd/s toward RB → p_LB = 1150',
      'Your blocker applies force F(t) to the LB (in lb):',
      'Impulse: J(t) = ∫₀ᵗ F(τ) dτ',
      'LB speed: v_LB(t) = (p_LB − J(t)) / m_LB',
      'LB stops when J(t) ≥ p_LB = 1150 lb·yd/s',
      'Constant force F: J = F·t, so F × T = 1150 → F = 1150/T',
      'RB reaches LB in ≈ 1.3 s — stop LB before then!',
    ],
    inputs: [
      { id: 'F', label: 'Blocker force function F(t) in lb:', placeholder: 'e.g.  900   or   500 + 400*t', hint: 'Need ∫F dt ≥ 1150 within ~1.3 s. Constant 900 lb → J = 900×1.3 = 1170. Try it.' },
    ],
    players: [
      { id: 'RB',  x0: 24, y0:   2, color: '#f97316', label: 'RB',  segs: [{ vx: 6, vy: 0  }], offense: true,  hasBall: true },
      { id: 'OL',  x0: 26, y0:  -2, color: '#38bdf8', label: 'OL',  segs: [{ vx: 4, vy: 1  }], offense: true  },
      { id: 'WR1', x0: 24, y0:  18, color: '#fb923c', label: 'WR1', segs: [{ vx: 5, vy: 0  }], offense: true  },
      { id: 'LB',  x0: 32, y0:   0, color: '#f87171', label: 'LB',  segs: [], offense: false, dynamic: true },
      { id: 'DE',  x0: 33, y0:  -8, color: '#fca5a5', label: 'DE',  segs: [{ vx: -3, vy: 3 }], offense: false },
      { id: 'S',   x0: 44, y0:  -5, color: '#a855f7', label: 'S',   segs: [{ vx: -3, vy: 2 }], offense: false },
    ],
    LB_MASS: 230, LB_P: 1150, RB_P: 1200,
    run(inputs) {
      const F_fn = parseExpr(inputs.F, { t: 0 })
      if (!F_fn) return { error: 'F', msg: 'Invalid — try: 900  or  500 + 400*t' }
      const DT = 1 / 60
      let lbX = 32, impulse = 0
      const frames = []
      const rb  = this.players.find(p => p.id === 'RB')
      const lb  = this.players.find(p => p.id === 'LB')
      for (let i = 0; i < 480; i++) {
        const t = i * DT
        const F = Math.max(0, F_fn(t) ?? 0)
        impulse += F * DT
        const lbMomRemaining = Math.max(0, this.LB_P - impulse)
        const lbSpeed = lbMomRemaining / this.LB_MASS
        lbX -= lbSpeed * DT
        const rbNow = posAt(rb, t)
        const players = this.players.filter(p => !p.dynamic).map(p => {
          const pos = posAt(p, t), vel = velAt(p, t)
          return { ...p, ...pos, ...vel }
        })
        players.push({ ...lb, x: lbX, y: 0, vx: -lbSpeed, vy: 0 })
        frames.push({ t, players, bx: null, by: null, alt: 0, thrown: false, trail: [], impulse, lbSpeed, lbX, rbX: rbNow.x, F })
        if (rbNow.x >= lbX) {
          if (lbSpeed < 1.5) return { frames, result: 'win', analytical: `TD! RB broke through at t=${t.toFixed(2)}s. J=${impulse.toFixed(0)} lb·yd/s (needed 1150). LB stopped cold.` }
          return { frames, result: 'loss', analytical: `Stuffed! LB still had speed ${lbSpeed.toFixed(1)} yd/s at contact. J=${impulse.toFixed(0)} lb·yd/s — need 1150. Increase F.` }
        }
        if (t > 8) break
      }
      return { frames, result: 'loss', analytical: `Time expired. Accumulated J = ${impulse.toFixed(0)} lb·yd/s (need 1150).` }
    },
  },
]

// ─── Canvas drawing ───────────────────────────────────────────────────────────
function drawField(ctx) {
  ctx.clearRect(0, 0, W, H)
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#166534' : '#15803d'
    ctx.fillRect(EZ + i * (FW / 10), 0, FW / 10, H)
  }
  ctx.fillStyle = '#7f1d1d'; ctx.fillRect(0, 0, EZ, H)
  ctx.fillStyle = '#1e3a5f'; ctx.fillRect(W - EZ, 0, EZ, H)
  // Hash marks
  const hash1 = fy(18.5), hash2 = fy(-18.5)
  ;[10, 20, 30, 40, 50, 60, 70, 80, 90].forEach(yd => {
    const x = fx(yd)
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(x, 4); ctx.lineTo(x, H - 4); ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(yd, x, 10)
    // Hash marks at NFL hash positions
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x - 4, hash1); ctx.lineTo(x + 4, hash1); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x - 4, hash2); ctx.lineTo(x + 4, hash2); ctx.stroke()
  })
  // Sidelines
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(EZ, 2); ctx.lineTo(W - EZ, 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(EZ, H - 2); ctx.lineTo(W - EZ, H - 2); ctx.stroke()
  // LOS hint at 30
  ctx.strokeStyle = 'rgba(251,191,36,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
  ctx.beginPath(); ctx.moveTo(fx(30), 2); ctx.lineTo(fx(30), H - 2); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(251,191,36,0.5)'; ctx.font = '7px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText('LOS', fx(30) + 2, 10)
}

function drawArrow(ctx, x1, y1, x2, y2, color, width = 1.5) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 3) return
  ctx.strokeStyle = color; ctx.lineWidth = width
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  const angle = Math.atan2(dy, dx)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - 9 * Math.cos(angle - 0.4), y2 - 9 * Math.sin(angle - 0.4))
  ctx.lineTo(x2 - 9 * Math.cos(angle + 0.4), y2 - 9 * Math.sin(angle + 0.4))
  ctx.closePath(); ctx.fill()
}

function drawPlayer(ctx, px, py, color, label, r = 11) {
  ctx.fillStyle = color; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = 'white'; ctx.font = `bold ${label.length > 2 ? 6 : 7}px sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(label, px, py); ctx.textBaseline = 'alphabetic'
}

function drawBall(ctx, px, py, alt) {
  const r = 4 + alt * 7
  if (alt > 0.05) {
    // Shadow at ground
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath(); ctx.ellipse(px, py, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill()
    // Shadow line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.7; ctx.setLineDash([2, 2])
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - alt * 20); ctx.stroke(); ctx.setLineDash([])
    // Ball floating up
    ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(px, py - alt * 20, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  } else {
    ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  }
}

function drawRoutePreview(ctx, player, color) {
  if (!player.segs || player.segs.length === 0) return
  ctx.strokeStyle = color + '55'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(fx(player.x0), fy(player.y0))
  let t = 0
  for (let i = 0; i < 60; i++) {
    t += 0.1
    const pos = posAt(player, t)
    const px = fx(pos.x), py = fy(pos.y)
    if (px < 0 || px > W || py < 0 || py > H) break
    ctx.lineTo(px, py)
  }
  ctx.stroke(); ctx.setLineDash([])
}

const V_SCALE = 7 // pixels per yd/s for vectors

function drawVelocityVector(ctx, px, py, vx, vy, color) {
  if (Math.sqrt(vx * vx + vy * vy) < 0.3) return
  drawArrow(ctx, px, py, px + vx * V_SCALE, py - vy * V_SCALE, color, 1.2)
}

function drawImpulseBar(ctx, impulse, needed) {
  const bx = 10, by = H - 26, bw = 140, bh = 14
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(bx, by, bw, bh)
  const pct = Math.min(impulse / needed, 1)
  ctx.fillStyle = pct >= 1 ? '#4ade80' : pct > 0.6 ? '#fbbf24' : '#f87171'
  ctx.fillRect(bx, by, bw * pct, bh)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1
  ctx.strokeRect(bx, by, bw, bh)
  ctx.fillStyle = 'white'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`J = ${impulse.toFixed(0)} / ${needed} lb·yd/s`, bx + bw / 2, by + bh / 2)
  ctx.textBaseline = 'alphabetic'
}

function drawFrame(ctx, frame, play, showVectors) {
  drawField(ctx)
  if (!frame) return
  const { players, bx, by, alt, thrown, trail, trail_cb, trail_ball, impulse } = frame
  // Trails
  const allTrail = trail || trail_ball || []
  allTrail.forEach((pt, i) => {
    ctx.fillStyle = '#fbbf24'; ctx.globalAlpha = 0.06 + (i / allTrail.length) * 0.3
    ctx.beginPath(); ctx.arc(fx(pt.x), fy(pt.y), 2, 0, Math.PI * 2); ctx.fill()
  })
  if (trail_cb) {
    trail_cb.forEach((pt, i) => {
      ctx.fillStyle = '#818cf8'; ctx.globalAlpha = 0.06 + (i / trail_cb.length) * 0.25
      ctx.beginPath(); ctx.arc(fx(pt.x), fy(pt.y), 2, 0, Math.PI * 2); ctx.fill()
    })
  }
  ctx.globalAlpha = 1
  // Players
  players.forEach(p => {
    drawPlayer(ctx, fx(p.x), fy(p.y), p.color, p.label)
    if (showVectors && (p.vx || p.vy)) {
      const arrowColor = p.offense ? '#86efac' : '#fca5a5'
      drawVelocityVector(ctx, fx(p.x), fy(p.y), p.vx || 0, p.vy || 0, arrowColor)
    }
  })
  // Ball
  if (thrown && bx !== null) {
    drawBall(ctx, fx(bx), fy(by), alt)
  }
  // Impulse meter for P4
  if (impulse !== undefined) {
    drawImpulseBar(ctx, impulse, play.LB_P)
  }
  // Catch point circles for P2
  if (frame.catchPts) {
    Object.entries(frame.catchPts).forEach(([, cp]) => {
      ctx.strokeStyle = 'rgba(251,191,36,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2])
      ctx.beginPath(); ctx.arc(fx(cp.x), fy(cp.y), 2 * PY, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
    })
  }
}

function drawSetup(ctx, play) {
  drawField(ctx)
  play.players.forEach(p => {
    if (!p.controlled && !p.dynamic) drawRoutePreview(ctx, p, p.color)
  })
  play.players.forEach(p => {
    drawPlayer(ctx, fx(p.x0), fy(p.y0), p.color, p.label)
    const vel = velAt(p, 0)
    if (vel.vx || vel.vy) {
      const arrowColor = p.offense ? '#86efac' : '#fca5a5'
      drawVelocityVector(ctx, fx(p.x0), fy(p.y0), vel.vx, vel.vy, arrowColor)
    }
  })
  if (play.catchPts) {
    Object.entries(play.catchPts).forEach(([key, cp]) => {
      ctx.strokeStyle = 'rgba(251,191,36,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2])
      ctx.beginPath(); ctx.arc(fx(cp.x), fy(cp.y), 2 * PY, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#fbbf24'; ctx.font = '7px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(key, fx(cp.x), fy(cp.y) - 2 * PY - 3)
    })
  }
}

// ─── Live values ──────────────────────────────────────────────────────────────
function LiveValues({ frame, playIdx }) {
  if (!frame) return null
  const rows = [{ label: 't', value: `${frame.t.toFixed(2)} s`, color: '#e2e8f0' }]
  if (playIdx === 0) {
    if (frame.catchDist != null) rows.push({ label: 'gap to WR1', value: `${frame.catchDist.toFixed(1)} yd`, color: frame.catchDist < 3 ? '#4ade80' : '#f87171' })
    if (frame.cbBallDist != null) rows.push({ label: 'CB dist', value: `${frame.cbBallDist.toFixed(1)} yd`, color: '#e2e8f0' })
  } else if (playIdx === 1) {
    if (frame.defDist != null) rows.push({ label: 'window', value: `${frame.defDist.toFixed(1)} yd`, color: frame.defDist > 2 ? '#4ade80' : '#f87171' })
    if (frame.tClose1 != null) rows.push({ label: 't_close1', value: `${frame.tClose1.toFixed(1)} s`, color: '#7dd3fc' })
    if (frame.tClose2 != null) rows.push({ label: 't_close2', value: `${frame.tClose2.toFixed(1)} s`, color: '#7dd3fc' })
  } else if (playIdx === 2) {
    if (frame.cbBall != null) rows.push({ label: 'CB→ball', value: `${frame.cbBall.toFixed(1)} yd`, color: frame.cbBall < 4 ? '#4ade80' : '#f87171' })
    if (frame.wrBall != null) rows.push({ label: 'WR→ball', value: `${frame.wrBall.toFixed(1)} yd`, color: '#e2e8f0' })
  } else if (playIdx === 3) {
    if (frame.impulse != null) rows.push({ label: 'J (impulse)', value: `${frame.impulse.toFixed(0)} lb·yd/s`, color: frame.impulse > 1150 ? '#4ade80' : '#f87171' })
    if (frame.lbSpeed != null) rows.push({ label: 'LB speed', value: `${frame.lbSpeed.toFixed(1)} yd/s`, color: '#e2e8f0' })
    if (frame.F != null) rows.push({ label: 'F(t)', value: `${frame.F.toFixed(0)} lb`, color: '#fbbf24' })
  }
  return (
    <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', border: '1px solid #334155', marginTop: 8 }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>live values</div>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#7dd3fc' }}>{r.label}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: r.color }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FootballCalculus() {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const simRef    = useRef(null)

  const [playIdx, setPlayIdx]       = useState(0)
  const [inputs, setInputs]         = useState({})
  const [inputErrors, setInputErrors] = useState({})
  const [warning, setWarning]       = useState('')
  const [result, setResult]         = useState(null)
  const [analytical, setAnalytical] = useState('')
  const [playing, setPlaying]       = useState(false)
  const [hasFrames, setHasFrames]   = useState(false)
  const [liveFrame, setLiveFrame]   = useState(null)
  const [showVectors, setShowVectors] = useState(true)

  const play = PLAYS[playIdx]

  useEffect(() => {
    if (hasFrames) return
    const canvas = canvasRef.current
    if (!canvas) return
    drawSetup(canvas.getContext('2d'), PLAYS[playIdx])
  }, [playIdx, hasFrames])

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])

  const stopAnim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    setPlaying(false)
    if (simRef.current?.frames?.length) setLiveFrame(simRef.current.frames[simRef.current.frames.length - 1])
  }, [])

  const tick = useCallback(() => {
    if (!simRef.current) return
    const { frames, playIdx: pIdx } = simRef.current
    const fi = simRef.current.frameIdx
    if (fi >= frames.length) { setPlaying(false); setLiveFrame(frames[frames.length - 1]); return }
    const canvas = canvasRef.current
    if (canvas) drawFrame(canvas.getContext('2d'), frames[fi], PLAYS[pIdx], simRef.current.showVectors)
    simRef.current.frameIdx = fi + 1
    if (fi % 6 === 0) setLiveFrame(frames[fi])
    animRef.current = requestAnimationFrame(tick)
  }, [])

  const runSim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    const res = PLAYS[playIdx].run(inputs)
    if (res.error) { setInputErrors({ [res.error]: res.msg }); setWarning(''); setHasFrames(false); setResult(null); return }
    if (res.warning) { setWarning(res.warning); setInputErrors({}); setHasFrames(false); setResult(null); return }
    setInputErrors({}); setWarning('')
    setResult(res.result); setAnalytical(res.analytical || '')
    setHasFrames(true); setLiveFrame(null); setPlaying(true)
    simRef.current = { frames: res.frames, frameIdx: 0, playIdx, showVectors }
    animRef.current = requestAnimationFrame(tick)
  }, [playIdx, inputs, showVectors, tick])

  const resetSim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    simRef.current = null
    setHasFrames(false); setResult(null); setAnalytical(''); setWarning('')
    setLiveFrame(null); setPlaying(false)
  }, [])

  const selectPlay = useCallback(idx => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    simRef.current = null
    setPlayIdx(idx); setInputs({}); setInputErrors({}); setWarning('')
    setResult(null); setAnalytical(''); setHasFrames(false); setLiveFrame(null); setPlaying(false)
  }, [])

  const setInput = useCallback((id, val) => {
    setInputs(prev => ({ ...prev, [id]: val }))
    setInputErrors({}); setWarning('')
  }, [])

  return (
    <div style={{ color: '#f1f5f9', maxWidth: 960, margin: '0 auto', padding: 12, fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Football Calculus</div>

      {/* Play tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {PLAYS.map((p, i) => (
          <button key={p.id} onClick={() => selectPlay(i)} style={{
            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
            border: `1px solid ${i === playIdx ? p.color + '66' : '#334155'}`,
            background: i === playIdx ? p.color + '22' : 'transparent',
            color: i === playIdx ? p.color : '#94a3b8', fontWeight: i === playIdx ? 600 : 400,
          }}>
            <div>{p.name}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{p.down} · {p.concept.split('·')[0].trim()}</div>
          </button>
        ))}
        <button onClick={() => setShowVectors(v => !v)} style={{
          padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
          border: '1px solid #334155', background: showVectors ? '#1e293b' : 'transparent',
          color: showVectors ? '#7dd3fc' : '#64748b', marginLeft: 'auto',
        }}>
          {showVectors ? '▶ vectors on' : '▶ vectors off'}
        </button>
      </div>

      {/* Concept bar */}
      <div style={{ borderLeft: `3px solid ${play.color}`, borderRadius: '0 6px 6px 0', padding: '7px 12px', marginBottom: 10, background: play.color + '11', color: play.color, fontSize: 12 }}>
        <strong>{play.concept}</strong> — {play.description}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Left: canvas + inputs */}
        <div style={{ flex: 1, minWidth: 340 }}>
          <canvas ref={canvasRef} width={W} height={H}
            style={{ width: '100%', borderRadius: 8, border: '2px solid #1e3a2e', display: 'block' }} />

          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {play.inputs.map(inp => (
              <div key={inp.id}>
                <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 3 }}>{inp.label}</label>
                <input
                  style={{
                    width: '100%', padding: '9px 11px', borderRadius: 6, boxSizing: 'border-box',
                    border: `1.5px solid ${inputErrors[inp.id] ? '#ef4444' : '#334155'}`,
                    background: '#0f172a', color: '#f1f5f9', fontFamily: 'monospace', fontSize: 14, outline: 'none',
                  }}
                  value={inputs[inp.id] || ''}
                  placeholder={inp.placeholder}
                  onChange={e => setInput(inp.id, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runSim() }}
                />
                {inputErrors[inp.id] && <div style={{ fontSize: 11, color: '#f87171', marginTop: 2 }}>{inputErrors[inp.id]}</div>}
                <div style={{ fontSize: 10, color: '#60a5fa', fontFamily: 'monospace', marginTop: 2 }}>{inp.hint}</div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              {!playing
                ? <button onClick={runSim} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, color: 'white', background: '#3b82f6' }}>Run Play</button>
                : <button onClick={stopAnim} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, color: 'white', background: '#6b7280' }}>Stop</button>
              }
              {hasFrames && <button onClick={resetSim} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, color: 'white', background: '#374151' }}>Reset</button>}
            </div>

            {warning && <div style={{ padding: '9px 13px', borderRadius: 7, fontSize: 12, fontWeight: 500, background: '#1e3a5f', color: '#93c5fd' }}>{warning}</div>}
            {result && !playing && (
              <div style={{ padding: '9px 13px', borderRadius: 7, fontSize: 13, fontWeight: 500, background: result === 'win' ? '#14532d' : '#450a0a', color: result === 'win' ? '#4ade80' : '#fca5a5' }}>
                {analytical}
              </div>
            )}
          </div>
        </div>

        {/* Right: theory + live values */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: '#0f172a', borderRadius: 10, padding: 12, border: '1px solid #1e293b' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: play.color, marginBottom: 8 }}>{play.concept}</div>
            {play.theory.map((line, i) => {
              const isMath = /[=·∫√]/.test(line) || line.startsWith('x') || line.startsWith('y') || line.startsWith('v') || line.startsWith('D') || line.startsWith('J') || line.startsWith('p')
              return isMath
                ? <div key={i} style={{ margin: '3px 0', padding: '3px 7px', background: '#1e293b', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, color: '#a5f3fc' }}>{line}</div>
                : <div key={i} style={{ fontSize: 11, color: '#64748b', margin: '4px 0' }}>{line}</div>
            })}
          </div>
          {(hasFrames || liveFrame) && <LiveValues frame={liveFrame} playIdx={playIdx} />}
        </div>
      </div>
    </div>
  )
}
