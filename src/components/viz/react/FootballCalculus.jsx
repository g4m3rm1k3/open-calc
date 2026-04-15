// FootballCalculus.jsx
// A multi-level football simulation that teaches core Calc 1 concepts.
//
// Level 1 — Lead Pass        → Integration (position = ∫ velocity dt)
// Level 2 — Best Angle       → Optimization (maximize range via dR/dθ = 0)
// Level 3 — Defender Chase   → Related Rates (multiple changing quantities linked through time)
//
// Register in VizFrame.jsx as: FootballCalculus

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Field geometry (SVG pixel space) ────────────────────────────────────────
const W = 700, H = 320
const EZ = 50          // endzone width in px
const FW = W - 2 * EZ  // playing field width = 600px
const PY = FW / 100    // 6 px per yard
const CY = H / 2       // vertical center = 160

const yd = y => EZ + y * PY            // yards → pixel x
const px2yd = x => (x - EZ) / PY      // pixel x → yards (for display)

// ─── Safe velocity formula evaluator (supports t, math ops) ──────────────────
function makeVFunc(expr) {
  const clean = expr.trim()
  if (!clean) return null
  // Sanitise: only allow digits, operators, t, math functions
  const safe = clean
    .replace(/\bMath\./g, '')
    .replace(/[^0-9t+\-*/^(). ]/g, c => ['s','i','n','c','o','q','r','t','a','b','e','p'].includes(c) ? c : '?')
  if (safe.includes('?')) return null
  try {
    // Rewrite to JS: ^ → **, trig / sqrt
    const js = clean
      .replace(/\^/g, '**')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bpi\b/g, 'Math.PI')
    // eslint-disable-next-line no-new-func
    const fn = new Function('t', `"use strict"; return (${js});`)
    const test = fn(0)
    if (typeof test !== 'number') return null
    return fn
  } catch { return null }
}

// ─── SVG Football Field (shared across all levels) ───────────────────────────
function FieldSVG({ children, height = H }) {
  const YDLINES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const HASHES  = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]
  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      style={{ width: '100%', display: 'block', borderRadius: 8,
        border: '2px solid #14532d', background: '#15803d' }}
    >
      {/* Alternating green stripes */}
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <rect key={i} x={yd(i * 10)} y={0}
          width={FW / 10} height={height}
          fill={i % 2 === 0 ? '#16a34a' : '#15803d'} />
      ))}
      {/* Endzones */}
      <rect x={0} y={0} width={EZ} height={height} fill="#991b1b" opacity={0.85} />
      <rect x={W - EZ} y={0} width={EZ} height={height} fill="#1d4ed8" opacity={0.75} />
      <text x={EZ / 2} y={height / 2} fill="white" fontSize={10} fontWeight="bold"
        textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(-90,${EZ / 2},${height / 2})`}>ENDZONE</text>
      <text x={W - EZ / 2} y={height / 2} fill="white" fontSize={10} fontWeight="bold"
        textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(90,${W - EZ / 2},${height / 2})`}>ENDZONE</text>
      {/* Yard lines */}
      {YDLINES.map(y => (
        <g key={y}>
          <line x1={yd(y)} y1={22} x2={yd(y)} y2={height - 22}
            stroke="white" strokeWidth={y === 50 ? 2.5 : 1} strokeOpacity={0.45} />
          {y > 0 && y < 100 && (
            <text x={yd(y)} y={14} fill="white" fontSize={8} fontWeight="bold"
              textAnchor="middle" opacity={0.8}>{y}</text>
          )}
        </g>
      ))}
      {/* Hash marks */}
      {HASHES.map(y => (
        <line key={y} x1={yd(y)} y1={height / 2 - 10} x2={yd(y)} y2={height / 2 + 10}
          stroke="white" strokeWidth={1} strokeOpacity={0.35} />
      ))}
      {children}
    </svg>
  )
}

// ─── Player circle sprite ─────────────────────────────────────────────────────
function Player({ x, y, color, label, sub, r = 14 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} stroke="white" strokeWidth={2} />
      <text x={x} y={y} fill="white" fontSize={9} textAnchor="middle"
        dominantBaseline="middle" fontWeight="bold">{label}</text>
      {sub && (
        <text x={x} y={y - r - 5} fill="white" fontSize={7.5}
          textAnchor="middle" opacity={0.85}>{sub}</text>
      )}
    </g>
  )
}

// ─── Math panel wrapper ───────────────────────────────────────────────────────
function MathPanel({ title, color = '#60a5fa', children }) {
  return (
    <div style={{ width: 210, flexShrink: 0, background: '#0f172a', borderRadius: 8,
      padding: 14, border: `1px solid ${color}33`, fontSize: 11,
      color: '#94a3b8', fontFamily: 'monospace', lineHeight: 1.55 }}>
      <div style={{ color, fontWeight: 'bold', marginBottom: 10, fontSize: 12 }}>{title}</div>
      {children}
    </div>
  )
}

function MathSection({ label, color = '#fbbf24', children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color, marginBottom: 3, fontSize: 10 }}>{label}</div>
      <div style={{ paddingLeft: 6, borderLeft: `2px solid ${color}44` }}>{children}</div>
    </div>
  )
}

function MathRow({ label, val, color = '#e2e8f0' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color }}>{val}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: LEAD PASS — Integration
//
// Concept: x_b(t) = x₀ + ∫₀ᵗ v_ball(τ)dτ  (Euler-integrated each frame)
//          x_r(t) = x₀ + v₀t + ½at²        (kinematic equation)
// Player enters v_ball(t). Ball position is numerically integrated.
// Win: |x_ball(t) − x_receiver(t)| < tolerance at some t.
// ─────────────────────────────────────────────────────────────────────────────
const L1 = {
  QB_YD: 12,   // quarterback yard line
  REC_YD0: 35, // receiver starting yard line
  REC_V0: 48,  // receiver initial velocity (px/s)
  REC_A: 16,   // receiver acceleration (px/s²)
  GRAVITY: 320, // vertical gravity px/s² (cosmetic arc)
  CATCH_R: 28, // catch tolerance radius (px)
  MAX_T: 5.5,  // max simulation time (s)
}

function LeadPassLevel() {
  const rafRef = useRef(null)
  const physRef = useRef(null)
  const [expr, setExpr] = useState('55')
  const [exprErr, setExprErr] = useState('')
  const [disp, setDisp] = useState({
    t: 0, status: 'idle', message: '',
    ballX: yd(L1.QB_YD), ballY: CY,
    recX: yd(L1.REC_YD0), trail: [],
    vball: 0, dist: null,
  })

  function initPhys(vFunc) {
    physRef.current = {
      t: 0, vFunc,
      ballX: yd(L1.QB_YD), ballY: CY,
      ballVy: -L1.GRAVITY * 0.35, // upward launch
      recX: yd(L1.REC_YD0),
      trail: [], frameCount: 0,
    }
  }

  const stop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  function throwBall() {
    const fn = makeVFunc(expr)
    if (!fn) { setExprErr('Cannot parse. Try: 55  or  45 + 4*t'); return }
    setExprErr('')
    stop()
    initPhys(fn)

    const DT = 1 / 60
    function step() {
      const p = physRef.current
      if (!p) return
      p.t += DT
      const t = p.t

      // Receiver: kinematic position
      p.recX = yd(L1.REC_YD0) + L1.REC_V0 * t + 0.5 * L1.REC_A * t * t

      // Ball horizontal: Euler integration of user's v(t)
      let vb = 0
      try { vb = Number(p.vFunc(t)); if (!isFinite(vb)) vb = 0 } catch {}
      p.ballX += vb * DT

      // Ball vertical: realistic arc (goes up then falls)
      p.ballVy += L1.GRAVITY * DT
      p.ballY += p.ballVy * DT
      // Bounce on ground (cosmetic — shouldn't reach ground normally)
      if (p.ballY > CY + 10) { p.ballY = CY + 10; p.ballVy *= -0.4 }

      // Trail
      p.frameCount++
      if (p.frameCount % 2 === 0) {
        p.trail.push({ x: p.ballX, y: p.ballY })
        if (p.trail.length > 30) p.trail.shift()
      }

      const dist = Math.abs(p.ballX - p.recX)
      const inField = p.ballX > EZ && p.ballX < W - EZ
      const recInField = p.recX < W - EZ

      // Win
      if (dist < L1.CATCH_R && inField && recInField && t > 0.5) {
        stop()
        setDisp({ t, status: 'win', ballX: p.ballX, ballY: p.ballY,
          recX: p.recX, trail: [...p.trail], vball: vb, dist,
          message: `🏈 CATCH! At t=${t.toFixed(2)}s — ${px2yd(p.recX).toFixed(0)}-yard line. Perfect lead!` })
        return
      }

      // Loss
      if (!inField || !recInField || t > L1.MAX_T) {
        stop()
        const hint = dist < 80
          ? `Close! Off by ${dist.toFixed(0)}px at t=${t.toFixed(1)}s. Adjust slightly.`
          : vb < 40
            ? `Ball too slow — try a larger value for v_ball(t).`
            : `Ball overshot — try a smaller value or add a negative slope term like 70 - 4*t.`
        setDisp({ t, status: 'loss', ballX: p.ballX, ballY: p.ballY,
          recX: p.recX, trail: [...p.trail], vball: vb, dist, message: hint })
        return
      }

      setDisp({ t, status: 'running', ballX: p.ballX, ballY: p.ballY,
        recX: p.recX, trail: [...p.trail], vball: vb, dist })
      rafRef.current = requestAnimationFrame(step)
    }
    setDisp(d => ({ ...d, status: 'running', message: '' }))
    rafRef.current = requestAnimationFrame(step)
  }

  function reset() {
    stop()
    setExprErr('')
    setDisp({ t: 0, status: 'idle', message: '',
      ballX: yd(L1.QB_YD), ballY: CY, recX: yd(L1.REC_YD0),
      trail: [], vball: 0, dist: null })
  }

  useEffect(() => () => stop(), [stop])

  const { t, status, message, ballX, ballY, recX, trail, vball, dist } = disp
  const running = status === 'running'

  // Analytical: if v_ball is constant c, solve 0.5*A*t² + (V0-c)*t + (X0-QB) = 0
  const V0px = L1.REC_V0, Apx = L1.REC_A
  const X0px = yd(L1.REC_YD0), QBpx = yd(L1.QB_YD)
  function hintVelocity() {
    // At some time t, c*t = X0 + V0*t + 0.5*A*t² - QB
    // Guess t=1.5s as typical flight time → c ≈ (X0 - QB + V0*1.5 + 0.5*A*1.5²) / 1.5
    const tg = 1.5
    const c = (X0px - QBpx + V0px * tg + 0.5 * Apx * tg * tg) / tg
    return c.toFixed(0)
  }

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ flex: 1 }}>
        <FieldSVG>
          {/* Ball trail */}
          {trail.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={2.5 + (i / trail.length) * 3}
              fill="#fbbf24"
              opacity={0.15 + (i / trail.length) * 0.65} />
          ))}
          {/* Gap indicator while running */}
          {running && dist !== null && (
            <>
              <line x1={ballX} y1={CY + 25} x2={recX} y2={CY + 25}
                stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4,3" />
              <text x={(ballX + recX) / 2} y={CY + 38}
                fill="#fda4af" fontSize={9} textAnchor="middle">
                {dist.toFixed(0)}px gap
              </text>
            </>
          )}
          {/* Receiver */}
          <Player x={recX} y={CY} color="#f97316" label="WR"
            sub={running ? `→ ${px2yd(recX).toFixed(0)} yd` : 'accelerating →'} />
          {/* QB */}
          <Player x={yd(L1.QB_YD)} y={CY} color="#0ea5e9" label="QB" sub="YOU" />
          {/* Ball */}
          <circle cx={ballX} cy={ballY} r={9}
            fill="#fbbf24" stroke="#92400e" strokeWidth={2} />
          {/* Win burst */}
          {status === 'win' && (
            <g>
              {[...Array(8)].map((_, i) => {
                const ang = (i / 8) * Math.PI * 2
                return <line key={i}
                  x1={ballX} y1={ballY}
                  x2={ballX + Math.cos(ang) * 30} y2={ballY + Math.sin(ang) * 30}
                  stroke="#fbbf24" strokeWidth={2} opacity={0.8} />
              })}
            </g>
          )}
        </FieldSVG>

        {/* Controls */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
              v_ball(t) — horizontal ball speed in px/s (try a constant, or a function of t):
            </label>
            <input
              value={expr}
              onChange={e => setExpr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !running && throwBall()}
              disabled={running}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6,
                border: `1px solid ${exprErr ? '#ef4444' : '#374151'}`,
                background: '#1f2937', color: '#f9fafb',
                fontFamily: 'monospace', fontSize: 14, boxSizing: 'border-box' }}
              placeholder="e.g.  55   or   40 + 5*t   or   70 - 3*t"
            />
            {exprErr && <div style={{ color: '#f87171', fontSize: 11, marginTop: 3 }}>{exprErr}</div>}
          </div>
          <button
            onClick={running ? reset : throwBall}
            style={{ marginTop: 19, padding: '8px 20px', borderRadius: 6, border: 'none',
              cursor: 'pointer', fontWeight: 'bold', fontSize: 14, color: 'white',
              background: running ? '#6b7280' : '#22c55e' }}>
            {running ? '⏹ Stop' : '🏈 Throw'}
          </button>
          {!running && status !== 'idle' && (
            <button onClick={reset}
              style={{ marginTop: 19, padding: '8px 16px', borderRadius: 6,
                border: 'none', cursor: 'pointer', fontSize: 14, color: 'white',
                background: '#374151' }}>
              Reset
            </button>
          )}
        </div>

        {/* Feedback */}
        {message && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: 13,
            fontWeight: 'bold', background: status === 'win' ? '#14532d' : '#7f1d1d',
            color: status === 'win' ? '#4ade80' : '#fca5a5' }}>
            {message}
          </div>
        )}
      </div>

      {/* Math Panel */}
      <MathPanel title="∫ Integration in Action" color="#22c55e">
        <MathSection label="Receiver position (kinematic eq.):" color="#f97316">
          <div style={{ color: '#fed7aa', fontSize: 10 }}>x_r(t) = x₀ + v₀·t + ½a·t²</div>
          <div style={{ color: '#fb923c', marginTop: 3 }}>
            x₀ ≈ {px2yd(X0px).toFixed(0)} yd, v₀={V0px}px/s, a={Apx}px/s²
          </div>
        </MathSection>

        <MathSection label="Ball position (your integral):" color="#fbbf24">
          <div style={{ fontSize: 10 }}>x_b(t) = x_QB + ∫₀ᵗ v_ball(τ)dτ</div>
          <div style={{ fontSize: 10, color: '#a3e635', marginTop: 3 }}>
            Each frame: Δx = v(t)·Δt, Δt = 1/60s
          </div>
        </MathSection>

        {(running || status !== 'idle') && (
          <MathSection label={`Live at t = ${t.toFixed(2)}s:`} color="#a78bfa">
            <MathRow label="x_receiver" val={`${px2yd(recX).toFixed(1)} yd`} color="#fb923c" />
            <MathRow label="x_ball" val={`${px2yd(ballX).toFixed(1)} yd`} color="#fbbf24" />
            <MathRow label="v_ball(t)" val={`${vball?.toFixed(1)} px/s`} color="#a3e635" />
            {dist !== null && (
              <MathRow label="gap |x_b − x_r|"
                val={`${dist.toFixed(1)}px`}
                color={dist < L1.CATCH_R ? '#4ade80' : '#f87171'} />
            )}
          </MathSection>
        )}

        {status === 'idle' && (
          <div style={{ color: '#475569', fontSize: 10, marginTop: 6 }}>
            <div style={{ color: '#64748b', marginBottom: 4 }}>Win condition:</div>
            |x_ball(t) − x_r(t)| {'<'} {L1.CATCH_R}px<br /><br />
            <div style={{ color: '#60a5fa' }}>Hint: start with</div>
            v_ball ≈ {hintVelocity()} px/s<br />
            then tune it.
          </div>
        )}

        <div style={{ marginTop: 10, padding: 8, background: '#1e293b',
          borderRadius: 6, fontSize: 10, color: '#64748b' }}>
          <div style={{ color: '#22c55e', marginBottom: 3 }}>Why this is integration:</div>
          Euler step: x += v(t)·dt<br />
          Sum of all steps:<br />
          x(T) = x₀ + Σ v(tᵢ)·Δt<br />
          → x₀ + ∫₀ᵀ v(τ)dτ as dt→0<br />
          <br />
          This is the Fundamental Theorem connecting v(t) and x(t).
        </div>
      </MathPanel>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: BEST ANGLE — Optimization
//
// Concept: Range R(θ) = v₀²sin(2θ)/g (projectile on flat ground)
//          dR/dθ = 2v₀²cos(2θ)/g = 0  →  θ = 45° maximises range
// Player adjusts angle with a slider. Ball follows parabolic arc.
// Visual shows R(θ) curve and the current operating point.
// ─────────────────────────────────────────────────────────────────────────────
const L2 = {
  QB_YD: 8,      // quarterback position
  V0: 280,       // ball speed magnitude (px/s)
  G: 420,        // gravity (px/s²) — tuned so 45° flies across field nicely
  GOAL_YD: 62,   // target yard line
  GOAL_TOL: 18,  // hit tolerance (px)
}

function bestAngleLevel() {
  const rafRef = useRef(null)
  const physRef = useRef(null)
  const [angle, setAngle] = useState(30)
  const [disp, setDisp] = useState({
    ballX: yd(L2.QB_YD), ballY: CY,
    trail: [], status: 'idle', message: '', t: 0,
  })

  const stop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  // Analytical range in pixels for given angle
  function rangeAt(deg) {
    const th = deg * Math.PI / 180
    return (L2.V0 * L2.V0 * Math.sin(2 * th)) / L2.G
  }

  // dR/dθ (analytical) — for display
  function dRdTheta(deg) {
    const th = deg * Math.PI / 180
    return (2 * L2.V0 * L2.V0 * Math.cos(2 * th)) / L2.G * (Math.PI / 180)
  }

  function throwBall() {
    stop()
    const th = angle * Math.PI / 180
    const vx = L2.V0 * Math.cos(th)
    const vy = -L2.V0 * Math.sin(th) // upward = negative y in SVG

    physRef.current = {
      t: 0, ballX: yd(L2.QB_YD), ballY: CY,
      vx, vy, trail: [], frameCount: 0,
    }

    const DT = 1 / 60
    function step() {
      const p = physRef.current
      if (!p) return
      p.t += DT
      p.vx += 0  // no horizontal drag
      p.vy += L2.G * DT  // gravity pulls down (positive y = down in SVG)
      p.ballX += p.vx * DT
      p.ballY += p.vy * DT

      p.frameCount++
      if (p.frameCount % 2 === 0) {
        p.trail.push({ x: p.ballX, y: p.ballY })
        if (p.trail.length > 35) p.trail.shift()
      }

      const goalX = yd(L2.GOAL_YD)
      const hitGround = p.ballY >= CY

      if (hitGround) {
        const dx = Math.abs(p.ballX - goalX)
        stop()
        if (dx < L2.GOAL_TOL) {
          setDisp({ ballX: p.ballX, ballY: CY, trail: [...p.trail],
            status: 'win', t: p.t,
            message: `🎯 Perfect! ${angle}° → landed at ${px2yd(p.ballX).toFixed(1)}-yd line. Range = ${(px2yd(rangeAt(angle))).toFixed(1)} yds.` })
        } else {
          const R = rangeAt(angle)
          const Rpx = yd(L2.QB_YD) + R
          setDisp({ ballX: p.ballX, ballY: CY, trail: [...p.trail],
            status: 'loss', t: p.t,
            message: `Landed at ${px2yd(p.ballX).toFixed(1)} yds, need ${L2.GOAL_YD} yds. ${angle < 45 ? 'Increase' : 'Decrease'} the angle.` })
        }
        return
      }

      if (p.ballX > W + 20) { stop(); return }

      setDisp({ ballX: p.ballX, ballY: p.ballY, trail: [...p.trail],
        status: 'running', t: p.t, message: '' })
      rafRef.current = requestAnimationFrame(step)
    }
    setDisp(d => ({ ...d, status: 'running', message: '' }))
    rafRef.current = requestAnimationFrame(step)
  }

  function reset() {
    stop()
    setDisp({ ballX: yd(L2.QB_YD), ballY: CY, trail: [], status: 'idle', message: '', t: 0 })
  }

  useEffect(() => () => stop(), [stop])

  const { ballX, ballY, trail, status, message } = disp
  const running = status === 'running'
  const R = rangeAt(angle)
  const dR = dRdTheta(angle)
  const R_yds = (R / PY).toFixed(1)
  const landX = yd(L2.QB_YD) + R

  // Build R(θ) mini-graph points (0..80°)
  const GRAPH_W = 180, GRAPH_H = 55
  const maxR = rangeAt(45)
  const graphPts = Array.from({ length: 81 }, (_, i) => {
    const r = rangeAt(i)
    return {
      x: (i / 80) * GRAPH_W,
      y: GRAPH_H - (r / maxR) * (GRAPH_H - 6),
    }
  })
  const pathD = graphPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const curX = (angle / 80) * GRAPH_W
  const curY = GRAPH_H - (R / maxR) * (GRAPH_H - 6)

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ flex: 1 }}>
        <FieldSVG>
          {/* Trail */}
          {trail.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={2 + (i / trail.length) * 4}
              fill="#a78bfa"
              opacity={0.15 + (i / trail.length) * 0.7} />
          ))}
          {/* Landing zone target */}
          <rect x={yd(L2.GOAL_YD) - L2.GOAL_TOL} y={CY - 6}
            width={L2.GOAL_TOL * 2} height={12} rx={4}
            fill="#facc15" opacity={0.3} stroke="#facc15" strokeWidth={1} />
          <text x={yd(L2.GOAL_YD)} y={CY + 24} fill="#facc15" fontSize={9}
            textAnchor="middle">TARGET ({L2.GOAL_YD} yd)</text>

          {/* Predicted landing indicator (thin dashed line) when idle */}
          {status === 'idle' && landX > EZ && landX < W - EZ && (
            <>
              <line x1={landX} y1={CY - 20} x2={landX} y2={CY + 20}
                stroke="#c084fc" strokeWidth={1.5} strokeDasharray="3,3" />
              <text x={landX} y={CY - 26} fill="#c084fc" fontSize={8}
                textAnchor="middle">predicted</text>
            </>
          )}

          {/* Angle arc indicator */}
          {status === 'idle' && (() => {
            const qbX = yd(L2.QB_YD), arcR = 35
            const th = angle * Math.PI / 180
            const ax = qbX + arcR * Math.cos(-th)
            const ay = CY + arcR * Math.sin(-th)
            return (
              <g>
                <line x1={qbX} y1={CY} x2={ax} y2={ay}
                  stroke="#a78bfa" strokeWidth={2} />
                <path d={`M ${qbX + arcR} ${CY} A ${arcR} ${arcR} 0 0 0 ${ax} ${ay}`}
                  fill="none" stroke="#a78bfa" strokeWidth={1} strokeDasharray="3,2" />
                <text x={qbX + arcR + 5} y={CY - 4} fill="#a78bfa" fontSize={9}>{angle}°</text>
              </g>
            )
          })()}

          {/* QB */}
          <Player x={yd(L2.QB_YD)} y={CY} color="#0ea5e9" label="QB" sub="YOU" />
          {/* Ball */}
          <circle cx={ballX} cy={ballY} r={9} fill="#a78bfa" stroke="#6d28d9" strokeWidth={2} />
        </FieldSVG>

        {/* Angle slider */}
        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
            Launch angle θ:
          </label>
          <input type="range" min={5} max={80} value={angle}
            onChange={e => { setAngle(+e.target.value); if (status !== 'idle') reset() }}
            disabled={running}
            style={{ flex: 1, accentColor: '#a78bfa' }} />
          <span style={{ color: '#c084fc', fontWeight: 'bold', minWidth: 32 }}>{angle}°</span>
          <button onClick={running ? reset : throwBall}
            style={{ padding: '7px 18px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontWeight: 'bold', fontSize: 13, color: 'white',
              background: running ? '#6b7280' : '#7c3aed' }}>
            {running ? '⏹' : '🏈 Throw'}
          </button>
          {!running && status !== 'idle' && (
            <button onClick={reset}
              style={{ padding: '7px 14px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontSize: 13, color: 'white', background: '#374151' }}>
              Reset
            </button>
          )}
        </div>

        {message && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6,
            fontWeight: 'bold', fontSize: 13, background: status === 'win' ? '#14532d' : '#7f1d1d',
            color: status === 'win' ? '#4ade80' : '#fca5a5' }}>
            {message}
          </div>
        )}
      </div>

      {/* Math Panel */}
      <MathPanel title="⬆ Optimization" color="#a78bfa">
        <MathSection label="Range formula:" color="#c084fc">
          <div style={{ fontSize: 10 }}>R(θ) = v₀²sin(2θ) / g</div>
          <div style={{ fontSize: 10, marginTop: 2, color: '#94a3b8' }}>
            v₀={L2.V0}px/s, g={L2.G}px/s²
          </div>
        </MathSection>

        <MathSection label={`At θ = ${angle}°:`} color="#fbbf24">
          <MathRow label="R(θ)" val={`${R.toFixed(0)}px ≈ ${R_yds} yd`} color="#fbbf24" />
          <MathRow label="sin(2θ)" val={Math.sin(2 * angle * Math.PI / 180).toFixed(3)} />
          <MathRow label="dR/dθ" val={dR.toFixed(2)}
            color={Math.abs(dR) < 0.1 ? '#4ade80' : dR > 0 ? '#60a5fa' : '#f87171'} />
          <div style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>
            {Math.abs(dR) < 0.1
              ? '✓ dR/dθ ≈ 0 — at maximum!'
              : dR > 0
                ? '↑ Range still increasing — try larger θ'
                : '↓ Range decreasing — try smaller θ'}
          </div>
        </MathSection>

        {/* Mini R(θ) graph */}
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
            R(θ) curve (θ = 0° to 80°):
          </div>
          <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H + 12}`}
            style={{ width: '100%', background: '#1e293b', borderRadius: 4 }}>
            <path d={pathD} fill="none" stroke="#a78bfa" strokeWidth={1.5} />
            {/* 45° marker */}
            <line x1={(45 / 80) * GRAPH_W} y1={0}
              x2={(45 / 80) * GRAPH_W} y2={GRAPH_H}
              stroke="#22c55e" strokeWidth={1} strokeDasharray="3,2" />
            <text x={(45 / 80) * GRAPH_W + 2} y={10} fill="#22c55e" fontSize={7}>45°=max</text>
            {/* Current point */}
            <circle cx={curX} cy={curY} r={4} fill="#fbbf24" />
            {/* Axes labels */}
            <text x={0} y={GRAPH_H + 11} fill="#64748b" fontSize={7}>0°</text>
            <text x={GRAPH_W - 12} y={GRAPH_H + 11} fill="#64748b" fontSize={7}>80°</text>
          </svg>
        </div>

        <div style={{ marginTop: 8, padding: 8, background: '#1e293b',
          borderRadius: 6, fontSize: 10, color: '#64748b' }}>
          <div style={{ color: '#a78bfa', marginBottom: 3 }}>The calculus:</div>
          dR/dθ = 0 at θ=45°<br />
          ⟹ maximum range.<br />
          d²R/dθ² {'<'} 0 confirms max.<br />
          This is optimization: critical points of R(θ).
        </div>
      </MathPanel>
    </div>
  )
}

// Because it's defined as an arrow-style const above to keep JSX consistent,
// rename to a proper function component for React:
const OptimalAngleLevel = bestAngleLevel

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 3: DEFENDER CHASE — Related Rates
//
// Concept: multiple quantities changing simultaneously and linked.
// Receiver runs a route. Defender closes in. Distance D(t) between
// defender and catch point changes at rate dD/dt. Player must throw while
// the window is open (D > threshold).
//
// The math: if defender at (xd, yd) moves toward catch point (xc, yc) at speed s,
//   D(t) = √((xc−xd)² + (yc−yd)²)
//   dD/dt = −s (constant closing rate for simplicity, or full formula)
// ─────────────────────────────────────────────────────────────────────────────
const L3 = {
  QB_YD: 10,
  REC_YD0: 30,
  REC_SPEED: 55,      // receiver horizontal speed px/s
  CATCH_YD: 60,       // expected catch point yard line
  DEF_START_YD: 65,   // defender starting yard line
  DEF_START_Y: CY - 85, // defender starts high (approaching from corner)
  DEF_SPEED: 62,      // defender speed px/s
  BALL_SPEED: 250,    // ball speed when thrown
  THROW_OPEN: 50,     // must throw while defender dist > this (px)
  CATCH_TRIG: 30,     // catch trigger radius
}

function DefenderPursuitLevel() {
  const rafRef = useRef(null)
  const physRef = useRef(null)
  const [disp, setDisp] = useState({
    recX: yd(L3.REC_YD0), recY: CY,
    defX: yd(L3.DEF_START_YD), defY: L3.DEF_START_Y,
    ballX: yd(L3.QB_YD), ballY: CY,
    catchX: yd(L3.CATCH_YD),
    defDist: null, trail: [],
    status: 'idle', message: '', t: 0, thrown: false,
  })

  const stop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  function startPlay() {
    stop()
    const catchX = yd(L3.CATCH_YD)
    physRef.current = {
      t: 0,
      recX: yd(L3.REC_YD0), recY: CY,
      defX: yd(L3.DEF_START_YD), defY: L3.DEF_START_Y,
      ballX: yd(L3.QB_YD), ballY: CY,
      ballVx: 0, ballVy: 0,
      catchX, thrown: false,
      trail: [], frameCount: 0,
    }
    setDisp(d => ({ ...d, status: 'running', message: '', thrown: false,
      ballX: yd(L3.QB_YD), ballY: CY, defX: yd(L3.DEF_START_YD), defY: L3.DEF_START_Y }))

    const DT = 1 / 60
    function step() {
      const p = physRef.current
      if (!p) return
      p.t += DT

      // Receiver moves horizontally toward catch point
      if (p.recX < p.catchX) p.recX += L3.REC_SPEED * DT
      if (p.recX > p.catchX) p.recX = p.catchX

      // Defender moves toward catch point
      const ddx = p.catchX - p.defX, ddy = CY - p.defY
      const ddist = Math.sqrt(ddx * ddx + ddy * ddy)
      if (ddist > 3) {
        p.defX += (ddx / ddist) * L3.DEF_SPEED * DT
        p.defY += (ddy / ddist) * L3.DEF_SPEED * DT
      }
      const defDist = Math.sqrt((p.catchX - p.defX) ** 2 + (CY - p.defY) ** 2)

      // Ball movement (after throw)
      if (p.thrown) {
        p.ballX += p.ballVx * DT
        p.ballY += p.ballVy * DT
        // Simple arc — gravity
        p.ballVy += 280 * DT
        p.frameCount++
        if (p.frameCount % 2 === 0) {
          p.trail.push({ x: p.ballX, y: p.ballY })
          if (p.trail.length > 25) p.trail.shift()
        }

        // Ball reached catch zone (x within tolerance, near center y)
        const nearRec = Math.abs(p.ballX - p.recX) < L3.CATCH_TRIG &&
                        Math.abs(p.ballY - CY) < 30

        if (nearRec) {
          // Was window open?
          const windowWasOpen = defDist > L3.THROW_OPEN
          stop()
          if (windowWasOpen) {
            setDisp({ recX: p.recX, recY: CY, defX: p.defX, defY: p.defY,
              ballX: p.ballX, ballY: CY, catchX: p.catchX,
              defDist, trail: [...p.trail], t: p.t, thrown: true,
              status: 'win', message: `🏈 Touchdown! Threw with D=${defDist.toFixed(0)}px clearance — window was open!` })
          } else {
            setDisp({ recX: p.recX, recY: CY, defX: p.defX, defY: p.defY,
              ballX: p.ballX, ballY: CY, catchX: p.catchX,
              defDist, trail: [...p.trail], t: p.t, thrown: true,
              status: 'loss', message: `Ball caught but defender was too close (D=${defDist.toFixed(0)}px). Throw earlier!` })
          }
          return
        }

        if (p.ballX > W + 20 || p.ballY > H + 20) {
          stop()
          setDisp(d => ({ ...d, defX: p.defX, defY: p.defY,
            ballX: p.ballX, ballY: p.ballY, defDist, t: p.t, thrown: true,
            status: 'loss', message: 'Ball missed receiver.' }))
          return
        }
      }

      // Defender closed window
      if (defDist < 15 && !p.thrown) {
        stop()
        setDisp(d => ({ ...d, recX: p.recX, defX: p.defX, defY: p.defY,
          defDist, t: p.t, status: 'loss', message: `Too late! Defender covered the catch point (D=${defDist.toFixed(0)}px). Throw earlier!` }))
        return
      }

      setDisp({ recX: p.recX, recY: CY, defX: p.defX, defY: p.defY,
        ballX: p.ballX, ballY: p.ballY, catchX: p.catchX,
        defDist, trail: [...p.trail], t: p.t, thrown: p.thrown,
        status: 'running', message: '' })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function throwNow() {
    const p = physRef.current
    if (!p || p.thrown) return
    // Compute ball velocity toward receiver current position
    const dx = p.recX - yd(L3.QB_YD)
    const dy = CY - yd(L3.QB_YD) // horizontal throw, dy ≈ 0
    const dist = Math.sqrt(dx * dx + 0.01)
    p.ballVx = (dx / dist) * L3.BALL_SPEED
    p.ballVy = -80 // slight upward
    p.thrown = true
  }

  function reset() {
    stop()
    setDisp({ recX: yd(L3.REC_YD0), recY: CY,
      defX: yd(L3.DEF_START_YD), defY: L3.DEF_START_Y,
      ballX: yd(L3.QB_YD), ballY: CY,
      catchX: yd(L3.CATCH_YD), defDist: null, trail: [],
      status: 'idle', message: '', t: 0, thrown: false })
  }

  useEffect(() => () => stop(), [stop])

  const { recX, recY, defX, defY, ballX, ballY, catchX, defDist,
    trail, status, message, t, thrown } = disp
  const running = status === 'running'

  // dD/dt estimate (closing rate)
  const closingRate = defDist !== null ? -L3.DEF_SPEED : null  // simplified constant closing

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ flex: 1 }}>
        <FieldSVG>
          {/* Trail */}
          {trail.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={2 + (i / trail.length) * 4}
              fill="#fbbf24"
              opacity={0.1 + (i / trail.length) * 0.7} />
          ))}

          {/* Catch point zone */}
          <circle cx={catchX} cy={CY} r={L3.THROW_OPEN}
            fill="none" stroke="#22c55e" strokeWidth={1}
            strokeDasharray="4,3" opacity={0.5} />
          <text x={catchX} y={CY + L3.THROW_OPEN + 14} fill="#4ade80" fontSize={8}
            textAnchor="middle">catch zone</text>

          {/* Defender threat radius */}
          {defDist !== null && defDist < L3.THROW_OPEN + 30 && (
            <circle cx={defX} cy={defY} r={15}
              fill="#ef4444" opacity={0.15} />
          )}

          {/* Closing distance line */}
          {running && (
            <>
              <line x1={defX} y1={defY} x2={catchX} y2={CY}
                stroke="#ef4444" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
              {defDist !== null && (
                <text x={(defX + catchX) / 2 + 8} y={(defY + CY) / 2 - 6}
                  fill="#fca5a5" fontSize={8}>D={defDist.toFixed(0)}</text>
              )}
            </>
          )}

          {/* Receiver */}
          <Player x={recX} y={CY} color="#f97316" label="WR" sub="→ route" />
          {/* Defender */}
          <Player x={defX} y={defY} color="#ef4444" label="CB" sub="closing!" r={13} />
          {/* QB */}
          <Player x={yd(L3.QB_YD)} y={CY} color="#0ea5e9" label="QB" sub="YOU" />
          {/* Ball */}
          <circle cx={ballX} cy={ballY} r={9}
            fill="#fbbf24" stroke="#92400e" strokeWidth={2} />
        </FieldSVG>

        <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          {status === 'idle' && (
            <button onClick={startPlay}
              style={{ padding: '8px 22px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontWeight: 'bold', fontSize: 14, color: 'white',
                background: '#0ea5e9' }}>
              ▶ Snap Ball
            </button>
          )}
          {running && !thrown && (
            <button onClick={throwNow}
              style={{ padding: '8px 22px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontWeight: 'bold', fontSize: 14, color: 'white',
                background: defDist > L3.THROW_OPEN ? '#22c55e' : '#ef4444',
                animation: defDist > L3.THROW_OPEN ? 'none' : 'none' }}>
              🏈 THROW NOW!
              {defDist !== null && ` (D=${defDist.toFixed(0)})`}
            </button>
          )}
          {running && thrown && (
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Ball in the air…</span>
          )}
          {!running && status !== 'idle' && (
            <button onClick={reset}
              style={{ padding: '8px 18px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontSize: 14, color: 'white', background: '#374151' }}>
              Reset
            </button>
          )}
          {defDist !== null && running && (
            <div style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 12,
              background: defDist > L3.THROW_OPEN ? '#14532d' : '#7f1d1d',
              color: defDist > L3.THROW_OPEN ? '#4ade80' : '#fca5a5',
            }}>
              {defDist > L3.THROW_OPEN ? '✓ Window OPEN' : '✗ Window CLOSING'}
              {' — '}D = {defDist.toFixed(0)}px
            </div>
          )}
        </div>

        {message && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6,
            fontWeight: 'bold', fontSize: 13, background: status === 'win' ? '#14532d' : '#7f1d1d',
            color: status === 'win' ? '#4ade80' : '#fca5a5' }}>
            {message}
          </div>
        )}
      </div>

      {/* Math Panel */}
      <MathPanel title="⇄ Related Rates" color="#f43f5e">
        <MathSection label="Defender–catchpoint distance:" color="#f87171">
          <div style={{ fontSize: 10 }}>
            D(t) = √((x_c−x_d)² + (y_c−y_d)²)
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
            All three variables change with t simultaneously
          </div>
        </MathSection>

        <MathSection label="Closing rate (dD/dt):" color="#fbbf24">
          <div style={{ fontSize: 10 }}>dD/dt = −s_def = −{L3.DEF_SPEED}px/s</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
            Defender closes at constant speed → dD/dt is constant
          </div>
        </MathSection>

        {defDist !== null && (
          <MathSection label={`Live at t = ${t.toFixed(2)}s:`} color="#a78bfa">
            <MathRow label="D(t)" val={`${defDist.toFixed(1)}px`}
              color={defDist > L3.THROW_OPEN ? '#4ade80' : '#f87171'} />
            <MathRow label="dD/dt" val={`−${L3.DEF_SPEED}px/s`} color="#fbbf24" />
            <MathRow label="Time to close" val={`${(defDist / L3.DEF_SPEED).toFixed(2)}s`} />
            <MathRow label="Window open?" val={defDist > L3.THROW_OPEN ? 'YES' : 'NO'}
              color={defDist > L3.THROW_OPEN ? '#4ade80' : '#f87171'} />
          </MathSection>
        )}

        <div style={{ marginTop: 8, padding: 8, background: '#1e293b',
          borderRadius: 6, fontSize: 10, color: '#64748b' }}>
          <div style={{ color: '#f43f5e', marginBottom: 3 }}>Related rates principle:</div>
          D, x_c, x_d, y_d all depend on t.<br />
          dD/dt relates their rates:<br />
          dD/dt = −(x_c−x_d)vx + (y_c−y_d)vy / D<br />
          <br />
          <div style={{ color: '#94a3b8' }}>Multiple moving quantities, one time parameter — that's related rates.</div>
        </div>
      </MathPanel>
    </div>
  )
}

// ─── Level tab config ─────────────────────────────────────────────────────────
const LEVELS = [
  {
    id: 0, name: 'Lead Pass', concept: 'Integration',
    color: '#22c55e', emoji: '🏈',
    desc: 'x(t) = x₀ + ∫₀ᵗ v(τ)dτ — throw where the receiver will be',
  },
  {
    id: 1, name: 'Best Angle', concept: 'Optimization',
    color: '#a78bfa', emoji: '🎯',
    desc: 'R(θ) = v₀²sin(2θ)/g — maximize range, dR/dθ = 0 at θ = 45°',
  },
  {
    id: 2, name: 'Defender Chase', concept: 'Related Rates',
    color: '#f43f5e', emoji: '🏃',
    desc: 'dD/dt links defender, receiver, and catch point — throw in the window',
  },
]

// ─── Main exported component ──────────────────────────────────────────────────
export default function FootballCalculus() {
  const [level, setLevel] = useState(0)

  return (
    <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 22 }}>🏈</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>Football Calculus</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Three plays. Three Calc 1 concepts. Real physics — you control the math.
          </div>
        </div>
      </div>

      {/* Level tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {LEVELS.map(lv => (
          <button
            key={lv.id}
            onClick={() => setLevel(lv.id)}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: level === lv.id ? lv.color + '22' : '#1e293b',
              color: level === lv.id ? lv.color : '#94a3b8',
              borderLeft: `3px solid ${level === lv.id ? lv.color : 'transparent'}`,
              fontWeight: level === lv.id ? 'bold' : 'normal',
              fontSize: 12, textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div>{lv.emoji} {lv.name}</div>
            <div style={{ fontSize: 10, opacity: 0.75 }}>{lv.concept}</div>
          </button>
        ))}
      </div>

      {/* Active level description strip */}
      <div style={{ padding: '7px 12px', borderRadius: 6, marginBottom: 14,
        background: LEVELS[level].color + '15',
        borderLeft: `3px solid ${LEVELS[level].color}`,
        fontSize: 11, color: LEVELS[level].color }}>
        <strong>{LEVELS[level].concept}:</strong> {LEVELS[level].desc}
      </div>

      {/* Level content */}
      {level === 0 && <LeadPassLevel key="l1" />}
      {level === 1 && <OptimalAngleLevel key="l2" />}
      {level === 2 && <DefenderPursuitLevel key="l3" />}

      {/* Footer */}
      <div style={{ marginTop: 16, fontSize: 10, color: '#334155', textAlign: 'center' }}>
        Each play is calculus made executable: define motion via derivatives → integrate forward → validate against constraints
      </div>
    </div>
  )
}
