import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Colour system (matches useColors() in viz components) ─────────────────
const C = {
  felt:      '#0d3d29',
  feltLight: '#115c3d',
  rail:      '#5c3d1a',
  railEdge:  '#8B5E2A',
  pocket:    '#060d0a',
  bg:        '#0a0f0d',
  surface:   '#111a14',
  border:    '#1e3328',
  text:      '#e2e8f0',
  muted:     '#94a3b8',
  hint:      '#64748b',
  blue:      '#38bdf8',
  amber:     '#fbbf24',
  green:     '#4ade80',
  red:       '#f87171',
  purple:    '#a78bfa',
  teal:      '#2dd4bf',
}

// ─── Physics constants ───────────────────────────────────────────────────────
const BALL_R       = 16
const FRICTION     = 0.982
const WALL_RESTITUTION = 0.88
const SPIN_DECAY   = 0.97
const SLEEP_THRESH = 0.04

// ─── Pool table geometry ─────────────────────────────────────────────────────
// These are in "world units", canvas is scaled to fit
const TW = 900  // table world width
const TH = 500  // table world height
const RAIL = 48 // rail width on each side

// Pockets (6) in world coords
const POCKETS = [
  { x: RAIL,      y: RAIL      },  // TL
  { x: TW/2,      y: RAIL - 6  },  // TC
  { x: TW - RAIL, y: RAIL      },  // TR
  { x: RAIL,      y: TH - RAIL },  // BL
  { x: TW/2,      y: TH - RAIL + 6}, // BC
  { x: TW - RAIL, y: TH - RAIL },  // BR
]
const POCKET_R = 22

// ─── Ball colours in numbered pool order ─────────────────────────────────────
const BALL_COLORS = [
  '#f5f5f5',  // 0 cue
  '#f5d000',  // 1 yellow
  '#1a47b8',  // 2 blue
  '#cc2020',  // 3 red
  '#8832b8',  // 4 purple
  '#cc5500',  // 5 orange
  '#1a9e2e',  // 6 green
  '#9e1a2e',  // 7 maroon
  '#1a1a1a',  // 8 black
]

// ─── Levels ──────────────────────────────────────────────────────────────────
const LEVELS = [
  {
    name: 'Straight Shot',
    description: 'Aim the cue ball directly at ball 1. Watch momentum transfer perfectly.',
    balls: [
      { x:200, y:250, mass:1, colorIdx:0, isCue:true },
      { x:560, y:250, mass:1, colorIdx:1 },
    ],
    pocketTarget: null,
    goal: 'Pocket the yellow ball in any pocket.',
  },
  {
    name: 'Mass Difference',
    description: 'Ball 2 (blue) is 3× heavier. Hit with the right force.',
    balls: [
      { x:200, y:250, mass:1,   colorIdx:0, isCue:true },
      { x:500, y:200, mass:1,   colorIdx:1 },
      { x:580, y:310, mass:3,   colorIdx:2 },
    ],
    goal: 'Pocket both colored balls.',
  },
  {
    name: 'English Required',
    description: 'Use off-center spin (English) to curve the cue ball after contact.',
    balls: [
      { x:200, y:250, mass:1, colorIdx:0, isCue:true },
      { x:490, y:250, mass:1, colorIdx:7  },
      { x:490, y:160, mass:1, colorIdx:1  },
    ],
    goal: 'Pocket all colored balls.',
  },
  {
    name: 'Chain Reaction',
    description: 'One perfect shot triggers a cascade. Use spin to set angles.',
    balls: [
      { x:200, y:250, mass:1, colorIdx:0, isCue:true },
      { x:430, y:250, mass:1, colorIdx:1 },
      { x:475, y:232, mass:1, colorIdx:3 },
      { x:475, y:268, mass:1, colorIdx:2 },
      { x:520, y:215, mass:1, colorIdx:4 },
      { x:520, y:250, mass:1, colorIdx:8 },
      { x:520, y:285, mass:1, colorIdx:5 },
    ],
    goal: 'Pocket all balls from a single break shot.',
  },
]

// ─── Utility ─────────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function hypot(dx, dy) { return Math.sqrt(dx * dx + dy * dy) }

function makeBall(def) {
  return {
    x: def.x, y: def.y,
    vx: 0, vy: 0,
    spin: 0,
    mass: def.mass,
    r: BALL_R,
    color: BALL_COLORS[def.colorIdx],
    colorIdx: def.colorIdx,
    isCue: !!def.isCue,
    pocketed: false,
    id: Math.random(),
    trail: [],
  }
}

// ─── Collision (elastic, mass-aware, with spin transfer) ─────────────────────
function resolveBallCollision(a, b, events) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = hypot(dx, dy)
  if (dist === 0 || dist > a.r + b.r) return

  const nx = dx / dist
  const ny = dy / dist

  const rvx = b.vx - a.vx
  const rvy = b.vy - a.vy
  const velN = rvx * nx + rvy * ny
  if (velN > 0) return   // already separating

  const impulse = (2 * velN) / (1 / a.mass + 1 / b.mass)

  a.vx += (impulse * nx) / a.mass
  a.vy += (impulse * ny) / a.mass
  b.vx -= (impulse * nx) / b.mass
  b.vy -= (impulse * ny) / b.mass

  // Spin transfer (English influence on collision)
  const tx = -ny, ty = nx  // tangent
  const relTan = (b.vx - a.vx) * tx + (b.vy - a.vy) * ty
  const spinEffect = (a.spin - b.spin) * 0.3
  a.vx += spinEffect * tx * 0.25 / a.mass
  a.vy += spinEffect * ty * 0.25 / a.mass
  b.vx -= spinEffect * tx * 0.25 / b.mass
  b.vy -= spinEffect * ty * 0.25 / b.mass

  // Separate
  const overlap = a.r + b.r - dist + 0.5
  a.x -= overlap * nx * 0.5
  a.y -= overlap * ny * 0.5
  b.x += overlap * nx * 0.5
  b.y += overlap * ny * 0.5

  // Record event
  const impulseMag = Math.abs(impulse)
  if (impulseMag > 0.1) {
    const p1Before = { vx: a.vx - impulse/a.mass*nx, vy: a.vy - impulse/a.mass*ny }
    const p2Before = { vx: b.vx + impulse/b.mass*nx, vy: b.vy + impulse/b.mass*ny }
    events.push({
      type: 'collision',
      time: Date.now(),
      ax: (a.x + b.x) / 2,
      ay: (a.y + b.y) / 2,
      a: { mass: a.mass, vBefore: hypot(p1Before.vx, p1Before.vy).toFixed(2), vAfter: hypot(a.vx, a.vy).toFixed(2), pBefore: (a.mass * hypot(p1Before.vx, p1Before.vy)).toFixed(2), pAfter: (a.mass * hypot(a.vx, a.vy)).toFixed(2) },
      b: { mass: b.mass, vBefore: hypot(p2Before.vx, p2Before.vy).toFixed(2), vAfter: hypot(b.vx, b.vy).toFixed(2), pBefore: (b.mass * hypot(p2Before.vx, p2Before.vy)).toFixed(2), pAfter: (b.mass * hypot(b.vx, b.vy)).toFixed(2) },
      angle: (Math.atan2(ny, nx) * 180 / Math.PI).toFixed(1),
    })
  }
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────
function drawArrow(ctx, x, y, dx, dy, color, lw = 2) {
  const len = hypot(dx, dy)
  if (len < 1) return
  const ex = x + dx, ey = y + dy
  const angle = Math.atan2(dy, dx)
  const hs = 9
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(ex, ey)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(ex, ey)
  ctx.lineTo(ex - hs * Math.cos(angle - 0.45), ey - hs * Math.sin(angle - 0.45))
  ctx.lineTo(ex - hs * Math.cos(angle + 0.45), ey - hs * Math.sin(angle + 0.45))
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PhysicsPoolLab({ onClose }) {
  const canvasRef  = useRef(null)
  const animRef    = useRef(null)
  const stateRef   = useRef(null)  // mutable game state (avoids stale closures)

  // ── Reactive UI state ──────────────────────────────────────────────────────
  const [mode,      setMode]      = useState('freeplay')   // 'freeplay' | 'challenge'
  const [levelIdx,  setLevelIdx]  = useState(0)
  const [shots,     setShots]     = useState(0)
  const [overlays,  setOverlays]  = useState({
    vectors: true,
    momentum: true,
    spin: true,
    trail: false,
    forces: false,
  })
  const [panel,     setPanel]     = useState('data')       // 'data' | 'hit' | 'help'
  const [events,    setEvents]    = useState([])
  const [hitOffset, setHitOffset] = useState({ dx: 0, dy: 0 })
  const [phase,     setPhase]     = useState('aim')        // 'aim'|'rolling'|'levelDone'
  const [followed,  setFollowed]  = useState(null)         // null | ball index to follow
  const [tableData, setTableData] = useState([])           // per-ball live data

  // ── Hit position picker ref (avoids closure stale) ────────────────────────
  const hitOffsetRef = useRef({ dx: 0, dy: 0 })

  // ── Initialise game state in a ref so RAF loop has stable access ──────────
  const initState = useCallback((lvlIdx, m) => {
    const level = LEVELS[lvlIdx % LEVELS.length]
    let ballDefs

    if (m === 'freeplay') {
      // Full rack — triangle of 15 balls + cue
      const rack = []
      let row = 0, col = 0, num = 1
      const startX = 580, startY = 250
      const spacing = BALL_R * 2 + 1
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c <= r; c++) {
          rack.push({ x: startX + r * spacing, y: startY - r * BALL_R + c * (BALL_R * 2 + 1), mass: 1, colorIdx: num % 9, isCue: false })
          num++
        }
      }
      ballDefs = [
        { x: 220, y: 250, mass: 1, colorIdx: 0, isCue: true },
        ...rack,
      ]
    } else {
      ballDefs = level.balls
    }

    const balls = ballDefs.map(makeBall)
    stateRef.current = {
      balls,
      events: [],
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      mouse: { x: 0, y: 0 },
      shots: 0,
      phase: 'aim',
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      pocketed: [],
    }
    setShots(0)
    setPhase('aim')
    setEvents([])
  }, [])

  // ── Scale canvas to container ─────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const pw = parent.clientWidth
    const ph = parent.clientHeight
    const scaleX = pw / TW
    const scaleY = ph / TH
    const scale = Math.min(scaleX, scaleY)
    const dw = Math.round(TW * scale)
    const dh = Math.round(TH * scale)
    canvas.style.width  = dw + 'px'
    canvas.style.height = dh + 'px'
    canvas.width  = dw
    canvas.height = dh
    if (stateRef.current) {
      stateRef.current.scale = scale
    }
  }, [])

  // ── Canvas world ↔ screen conversion ─────────────────────────────────────
  function toWorld(sx, sy) {
    const s = stateRef.current?.scale ?? 1
    return { x: sx / s, y: sy / s }
  }

  // ── Pointer events ────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (!stateRef.current) return
    const st = stateRef.current
    if (st.phase !== 'aim') return
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const sy = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    const { x, y } = toWorld(sx, sy)
    const cue = st.balls.find(b => b.isCue && !b.pocketed)
    if (!cue) return
    const d = hypot(x - cue.x, y - cue.y)
    if (d > cue.r + 20) return
    st.isDragging = true
    st.dragStart = { x, y }
    st.mouse = { x, y }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!stateRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const sy = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    stateRef.current.mouse = toWorld(sx, sy)
  }, [])

  const handleMouseUp = useCallback((e) => {
    if (!stateRef.current) return
    const st = stateRef.current
    if (!st.isDragging) return
    st.isDragging = false
    const cue = st.balls.find(b => b.isCue && !b.pocketed)
    if (!cue) return
    const dx = st.dragStart.x - st.mouse.x
    const dy = st.dragStart.y - st.mouse.y
    const rawMag = hypot(dx, dy)
    if (rawMag < 4) return   // too small a drag
    const power = clamp(rawMag / 3.2, 0, 22)
    const nx = dx / rawMag, ny = dy / rawMag
    cue.vx = nx * power
    cue.vy = ny * power
    // Spin from hit offset
    const ho = hitOffsetRef.current
    const spinX = ho.dx, spinY = ho.dy
    cue.spin = (spinX * cue.vy - spinY * cue.vx) * 1.6
    st.shots++
    st.phase = 'rolling'
    setShots(st.shots)
    setPhase('rolling')
    // Record shot event
    st.events.push({
      type: 'shot',
      time: Date.now(),
      power: power.toFixed(1),
      angle: (Math.atan2(-ny, nx) * 180 / Math.PI).toFixed(1),
      spin: cue.spin.toFixed(2),
      hitOffset: { ...ho },
    })
    setEvents([...st.events])
  }, [])

  // ── Main physics + render loop ────────────────────────────────────────────
  const loop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !stateRef.current) { animRef.current = requestAnimationFrame(loop); return }
    const st = stateRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const scale = st.scale ?? 1

    // Transform: world → canvas
    ctx.setTransform(scale, 0, 0, scale, 0, 0)

    // ── Physics update ────────────────────────────────────────────────────
    const eventsThisFrame = []
    for (const b of st.balls) {
      if (b.pocketed) continue
      b.x += b.vx
      b.y += b.vy
      b.vx *= FRICTION
      b.vy *= FRICTION
      b.spin *= SPIN_DECAY

      // Spin applies lateral drift (English effect)
      b.vx += b.spin * (-b.vy) * 0.0012
      b.vy += b.spin * (b.vx) * 0.0012

      // Wall bounce
      const left = RAIL + b.r, right = TW - RAIL - b.r
      const top  = RAIL + b.r, bot   = TH  - RAIL - b.r
      if (b.x < left)  { b.x = left;  b.vx = Math.abs(b.vx) * WALL_RESTITUTION; b.spin *= -0.5 }
      if (b.x > right) { b.x = right; b.vx = -Math.abs(b.vx) * WALL_RESTITUTION; b.spin *= -0.5 }
      if (b.y < top)   { b.y = top;   b.vy = Math.abs(b.vy) * WALL_RESTITUTION; b.spin *= -0.5 }
      if (b.y > bot)   { b.y = bot;   b.vy = -Math.abs(b.vy) * WALL_RESTITUTION; b.spin *= -0.5 }

      // Trail
      if (overlays.trail) {
        b.trail.push({ x: b.x, y: b.y })
        if (b.trail.length > 40) b.trail.shift()
      } else {
        b.trail = []
      }

      // Pocket check
      for (const p of POCKETS) {
        if (hypot(b.x - p.x, b.y - p.y) < POCKET_R + 2) {
          b.pocketed = true
          b.vx = b.vy = 0
          st.pocketed.push(b)
          break
        }
      }
    }

    // Ball–ball collisions
    const active = st.balls.filter(b => !b.pocketed)
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        resolveBallCollision(active[i], active[j], eventsThisFrame)
      }
    }

    if (eventsThisFrame.length > 0) {
      st.events = [...st.events, ...eventsThisFrame].slice(-20)
      setEvents([...st.events])
    }

    // Sleep detection → back to aim phase
    if (st.phase === 'rolling') {
      const maxV = Math.max(...active.map(b => hypot(b.vx, b.vy)))
      if (maxV < SLEEP_THRESH) {
        st.balls.forEach(b => { b.vx = 0; b.vy = 0; b.spin = 0 })
        st.phase = 'aim'
        setPhase('aim')
      }
    }

    // ── Live table data for UI ──────────────────────────────────────────────
    const td = st.balls.filter(b => !b.pocketed).map((b, i) => ({
      id: i,
      color: b.color,
      isCue: b.isCue,
      x: b.x.toFixed(0),
      y: b.y.toFixed(0),
      vx: b.vx.toFixed(2),
      vy: b.vy.toFixed(2),
      speed: hypot(b.vx, b.vy).toFixed(2),
      momentum: (b.mass * hypot(b.vx, b.vy)).toFixed(2),
      spin: b.spin.toFixed(2),
      mass: b.mass,
      KE: (0.5 * b.mass * (b.vx**2 + b.vy**2)).toFixed(3),
    }))
    setTableData(td)

    // ── Render ──────────────────────────────────────────────────────────────

    // Felt
    ctx.fillStyle = C.felt
    ctx.fillRect(0, 0, TW, TH)

    // Rail
    ctx.fillStyle = C.rail
    ctx.beginPath()
    ctx.rect(0, 0, TW, TH)
    ctx.rect(RAIL, RAIL, TW - RAIL*2, TH - RAIL*2)
    ctx.fill('evenodd')

    // Rail edge highlight
    ctx.fillStyle = C.railEdge
    ctx.fillRect(RAIL - 4, RAIL - 4, TW - (RAIL-4)*2, 4)
    ctx.fillRect(RAIL - 4, TH - RAIL, TW - (RAIL-4)*2, 4)
    ctx.fillRect(RAIL - 4, RAIL, 4, TH - RAIL*2)
    ctx.fillRect(TW - RAIL, RAIL, 4, TH - RAIL*2)

    // Felt lines (centre spot + baulk line)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 8])
    ctx.beginPath(); ctx.moveTo(TW/2, RAIL); ctx.lineTo(TW/2, TH-RAIL); ctx.stroke()
    ctx.setLineDash([])

    // Centre spot
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.beginPath(); ctx.arc(TW/2, TH/2, 4, 0, Math.PI*2); ctx.fill()

    // Pockets
    for (const p of POCKETS) {
      // Shadow glow
      ctx.shadowBlur = 12
      ctx.shadowColor = '#000'
      ctx.fillStyle = C.pocket
      ctx.beginPath(); ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI*2); ctx.fill()
      ctx.shadowBlur = 0
      // Pocket rim
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI*2); ctx.stroke()
    }

    // Trails
    if (overlays.trail) {
      for (const b of st.balls) {
        if (b.trail.length < 2 || b.pocketed) continue
        ctx.beginPath()
        ctx.moveTo(b.trail[0].x, b.trail[0].y)
        for (let i = 1; i < b.trail.length; i++) {
          const alpha = i / b.trail.length
          ctx.strokeStyle = `${b.color}${Math.round(alpha * 120).toString(16).padStart(2,'0')}`
          ctx.lineWidth = 1.5
          ctx.lineTo(b.trail[i].x, b.trail[i].y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(b.trail[i].x, b.trail[i].y)
        }
      }
    }

    // Aiming line while dragging
    if (st.isDragging) {
      const cue = st.balls.find(b => b.isCue && !b.pocketed)
      if (cue) {
        const dx = st.dragStart.x - st.mouse.x
        const dy = st.dragStart.y - st.mouse.y
        const rawMag = hypot(dx, dy)
        const power = clamp(rawMag / 3.2, 0, 22)
        const pct = power / 22

        // Direction line
        ctx.strokeStyle = `rgba(255,255,255,${0.5 + pct * 0.4})`
        ctx.lineWidth = 1.5
        ctx.setLineDash([8, 6])
        ctx.beginPath()
        ctx.moveTo(cue.x, cue.y)
        // Project aim line forward (opposite of pull direction)
        const nx = rawMag > 0 ? -dx / rawMag : 0
        const ny = rawMag > 0 ? -dy / rawMag : 0
        ctx.lineTo(cue.x + nx * 160, cue.y + ny * 160)
        ctx.stroke()
        ctx.setLineDash([])

        // Pull-back line (dotted, to mouse)
        ctx.strokeStyle = 'rgba(255,200,50,0.4)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 6])
        ctx.beginPath()
        ctx.moveTo(cue.x, cue.y)
        ctx.lineTo(st.mouse.x, st.mouse.y)
        ctx.stroke()
        ctx.setLineDash([])

        // Power bar
        const barW = 60, barH = 7
        const bx = cue.x - barW/2, by = cue.y - cue.r - 18
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(bx, by, barW, barH)
        const grad = ctx.createLinearGradient(bx, by, bx + barW, by)
        grad.addColorStop(0, '#4ade80')
        grad.addColorStop(0.5, '#fbbf24')
        grad.addColorStop(1, '#f87171')
        ctx.fillStyle = grad
        ctx.fillRect(bx, by, barW * pct, barH)
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(bx, by, barW, barH)
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${8}px monospace`
        ctx.textAlign = 'center'
        ctx.fillText(`${(pct * 100).toFixed(0)}%`, cue.x, by - 3)
      }
    }

    // Balls
    for (const b of st.balls) {
      if (b.pocketed) continue
      const isFollowed = followed !== null && st.balls[followed] === b

      // Shadow
      ctx.shadowBlur = isFollowed ? 20 : 10
      ctx.shadowColor = b.isCue ? 'rgba(255,255,255,0.5)' : b.color
      ctx.fillStyle = b.color
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Shine
      const shine = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.35, 0, b.x, b.y, b.r)
      shine.addColorStop(0, 'rgba(255,255,255,0.35)')
      shine.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = shine
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()

      // Outline
      ctx.strokeStyle = isFollowed ? C.amber : 'rgba(0,0,0,0.4)'
      ctx.lineWidth = isFollowed ? 2.5 : 1.5
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.stroke()

      // Mass label inside ball
      ctx.fillStyle = b.isCue ? '#333' : '#fff'
      ctx.font = `bold ${9}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      if (!b.isCue) ctx.fillText(b.mass.toFixed(1), b.x, b.y + 1)

      // Hit contact dot on cue ball (when at rest)
      if (b.isCue && st.phase === 'aim') {
        const ho = hitOffsetRef.current
        if (Math.abs(ho.dx) > 0.02 || Math.abs(ho.dy) > 0.02) {
          ctx.fillStyle = '#ef4444'
          ctx.beginPath()
          ctx.arc(b.x + ho.dx * b.r * 0.7, b.y + ho.dy * b.r * 0.7, 3.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const speed = hypot(b.vx, b.vy)

      // Velocity vector
      if (overlays.vectors && speed > SLEEP_THRESH * 2) {
        const scale = 4.5
        drawArrow(ctx, b.x, b.y, b.vx * scale, b.vy * scale, C.blue, 2)
      }

      // Momentum vector (thicker, different colour)
      if (overlays.momentum && speed > SLEEP_THRESH * 2) {
        const scale = 3
        const px = b.vx * b.mass * scale
        const py = b.vy * b.mass * scale
        drawArrow(ctx, b.x, b.y, px, py, C.purple, 1.5)
      }

      // Spin indicator arc
      if (overlays.spin && Math.abs(b.spin) > 0.05) {
        const spinAmt = clamp(b.spin * 0.8, -b.r, b.r)
        ctx.strokeStyle = spinAmt > 0 ? C.teal : C.amber
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r + 4, -Math.PI/2, -Math.PI/2 + spinAmt)
        ctx.stroke()
      }

      // Force (friction) vector
      if (overlays.forces && speed > SLEEP_THRESH * 2) {
        const frix = -b.vx * (1 - FRICTION) * 25
        const friy = -b.vy * (1 - FRICTION) * 25
        drawArrow(ctx, b.x, b.y, frix, friy, '#f87171', 1.5)
      }
    }

    // "Following" label
    if (followed !== null && st.balls[followed] && !st.balls[followed].pocketed) {
      const b = st.balls[followed]
      ctx.fillStyle = C.amber
      ctx.font = 'bold 9px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('TRACKING', b.x, b.y + b.r + 3)
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    animRef.current = requestAnimationFrame(loop)
  }, [overlays, followed])

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    resizeCanvas()
    const obs = new ResizeObserver(resizeCanvas)
    if (canvasRef.current?.parentElement) obs.observe(canvasRef.current.parentElement)
    return () => obs.disconnect()
  }, [resizeCanvas])

  useEffect(() => {
    initState(levelIdx, mode)
  }, [levelIdx, mode])

  useEffect(() => {
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [loop])

  // ── Hit position picker ───────────────────────────────────────────────────
  const hitPickerRef = useRef(null)
  const handleHitPick = useCallback((e) => {
    const el = hitPickerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.width / 2, cy = rect.height / 2
    let dx = (e.clientX - rect.left - cx) / (cx * 0.85)
    let dy = (e.clientY - rect.top - cy) / (cy * 0.85)
    const mag = hypot(dx, dy)
    if (mag > 1) { dx /= mag; dy /= mag }
    const v = { dx, dy }
    hitOffsetRef.current = v
    setHitOffset(v)
  }, [])

  const resetHit = useCallback(() => {
    const v = { dx: 0, dy: 0 }
    hitOffsetRef.current = v
    setHitOffset(v)
  }, [])

  // ── Spin label ────────────────────────────────────────────────────────────
  function spinLabel(dx, dy) {
    if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) return 'Center · No spin'
    if (dy < -0.45) return 'Top spin ↑'
    if (dy >  0.45) return 'Back spin ↓'
    if (dx < -0.35) return 'Left English ←'
    if (dx >  0.35) return 'Right English →'
    return 'Off-center'
  }

  // ── Overlay toggle ────────────────────────────────────────────────────────
  const toggleOverlay = useCallback((key) => {
    setOverlays(o => ({ ...o, [key]: !o[key] }))
  }, [])

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════
  const currentLevel = LEVELS[levelIdx % LEVELS.length]

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: C.bg, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 shrink-0" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        {/* Title */}
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-xl">🎱</span>
          <span className="font-bold text-sm" style={{ color: C.text }}>Physics Pool Lab</span>
          {phase === 'rolling' && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(74,222,128,0.15)', color: C.green, border: `1px solid ${C.green}` }}>
              ROLLING
            </span>
          )}
          {phase === 'aim' && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(56,189,248,0.15)', color: C.blue, border: `1px solid ${C.blue}` }}>
              AIM · Shots: {shots}
            </span>
          )}
        </div>

        {/* Mode selector */}
        <div className="flex gap-1">
          {['freeplay', 'challenge'].map(m => (
            <button key={m} onClick={() => { setMode(m); setLevelIdx(0) }}
              className="px-3 py-1 text-xs font-medium rounded transition-all"
              style={{
                background: mode === m ? C.amber : 'transparent',
                color: mode === m ? '#000' : C.muted,
                border: `1px solid ${mode === m ? C.amber : C.border}`,
              }}>
              {m === 'freeplay' ? '🎮 Free Play' : '🧩 Challenges'}
            </button>
          ))}
        </div>

        {/* Challenge level nav */}
        {mode === 'challenge' && (
          <div className="flex items-center gap-1">
            <button onClick={() => setLevelIdx(i => Math.max(0, i - 1))}
              className="px-2 py-1 text-xs rounded" style={{ background: C.border, color: C.text }}>‹</button>
            <span className="text-xs px-2" style={{ color: C.muted }}>Level {levelIdx + 1}/{LEVELS.length}</span>
            <button onClick={() => setLevelIdx(i => Math.min(LEVELS.length - 1, i + 1))}
              className="px-2 py-1 text-xs rounded" style={{ background: C.border, color: C.text }}>›</button>
          </div>
        )}

        {/* Reset */}
        <button onClick={() => initState(levelIdx, mode)}
          className="px-3 py-1 text-xs font-medium rounded"
          style={{ background: 'rgba(248,113,113,0.15)', color: C.red, border: `1px solid ${C.red}` }}>
          ↺ Reset
        </button>

        {/* Close */}
        <button onClick={onClose}
          className="px-3 py-1 text-xs font-medium rounded"
          style={{ background: 'rgba(148,163,184,0.15)', color: C.muted, border: `1px solid ${C.border}` }}>
          ✕ Close
        </button>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Canvas area ───────────────────────────────────────────────────── */}
        <div className="flex-1 relative flex items-center justify-center min-w-0" style={{ background: C.bg }}>

          {/* Challenge goal banner */}
          {mode === 'challenge' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-medium text-center pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.6)', color: C.amber, border: `1px solid rgba(251,191,36,0.3)`, backdropFilter: 'blur(4px)' }}>
              {currentLevel.name} · {currentLevel.goal}
            </div>
          )}

          {/* Vector legend */}
          <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
            {overlays.vectors   && <div className="flex items-center gap-1.5 text-xs" style={{ color: C.blue }}>   <span style={{ display:'inline-block',width:24,height:2,background:C.blue   }} /> velocity</div>}
            {overlays.momentum  && <div className="flex items-center gap-1.5 text-xs" style={{ color: C.purple }}> <span style={{ display:'inline-block',width:24,height:2,background:C.purple }} /> momentum (p=mv)</div>}
            {overlays.forces    && <div className="flex items-center gap-1.5 text-xs" style={{ color: C.red }}>    <span style={{ display:'inline-block',width:24,height:2,background:C.red    }} /> friction force</div>}
            {overlays.spin      && <div className="flex items-center gap-1.5 text-xs" style={{ color: C.teal }}>   <span style={{ display:'inline-block',width:24,height:2,background:C.teal   }} /> spin/English</div>}
          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={e => handleMouseDown(e.touches[0])}
            onTouchMove={e => { e.preventDefault(); handleMouseMove(e.touches[0]) }}
            onTouchEnd={handleMouseUp}
            className="cursor-crosshair rounded-lg shadow-2xl"
            style={{ display: 'block', userSelect: 'none', touchAction: 'none' }}
          />
        </div>

        {/* ── Right Panel ───────────────────────────────────────────────────── */}
        <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: 280, borderLeft: `1px solid ${C.border}`, background: C.surface }}>

          {/* Panel tabs */}
          <div className="flex shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
            {[
              { key: 'hit',  label: '🎯 Hit Pos' },
              { key: 'data', label: '📊 Physics' },
              { key: 'log',  label: '📋 Events' },
            ].map(t => (
              <button key={t.key} onClick={() => setPanel(t.key)}
                className="flex-1 py-2 text-xs font-medium transition-colors"
                style={{
                  background: panel === t.key ? 'rgba(56,189,248,0.1)' : 'transparent',
                  color: panel === t.key ? C.blue : C.hint,
                  borderBottom: panel === t.key ? `2px solid ${C.blue}` : '2px solid transparent',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Hit Position Panel ──────────────────────────────────── */}
          {panel === 'hit' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <div className="text-xs font-medium" style={{ color: C.text }}>Cue Ball Contact Point</div>
              <div className="text-xs" style={{ color: C.muted }}>
                Click or drag inside the circle to set where the cue tip strikes. Off-center creates English (spin).
              </div>

              {/* Hit picker circle */}
              <div className="mx-auto relative select-none"
                style={{ width: 160, height: 160 }}
                ref={hitPickerRef}
                onMouseDown={handleHitPick}
                onMouseMove={e => { if (e.buttons === 1) handleHitPick(e) }}
                onClick={handleHitPick}>
                {/* Circle outline */}
                <svg width="160" height="160" viewBox="0 0 160 160" className="absolute inset-0">
                  {/* Outer ring */}
                  <circle cx="80" cy="80" r="75" fill={C.bg} stroke={C.border} strokeWidth="2" />
                  {/* Grid lines */}
                  <line x1="80" y1="5" x2="80" y2="155" stroke={C.border} strokeWidth="0.5" strokeDasharray="3 4" />
                  <line x1="5" y1="80" x2="155" y2="80" stroke={C.border} strokeWidth="0.5" strokeDasharray="3 4" />
                  {/* Zone rings */}
                  <circle cx="80" cy="80" r="35" fill="none" stroke={C.border} strokeWidth="0.5" />
                  <circle cx="80" cy="80" r="65" fill="none" stroke={C.border} strokeWidth="0.5" />
                  {/* Labels */}
                  <text x="80" y="14" textAnchor="middle" fill={C.hint} fontSize="8">TOP</text>
                  <text x="80" y="153" textAnchor="middle" fill={C.hint} fontSize="8">BOTTOM</text>
                  <text x="8" y="83" textAnchor="start" fill={C.hint} fontSize="8">L</text>
                  <text x="148" y="83" textAnchor="end" fill={C.hint} fontSize="8">R</text>
                </svg>
                {/* Hit dot */}
                <div className="absolute pointer-events-none rounded-full transition-all"
                  style={{
                    width: 14, height: 14,
                    background: C.red,
                    border: '2px solid #fff',
                    boxShadow: `0 0 10px ${C.red}`,
                    left: 80 + hitOffset.dx * 63 - 7,
                    top:  80 + hitOffset.dy * 63 - 7,
                  }} />
              </div>

              {/* Spin label */}
              <div className="text-center text-xs font-medium rounded py-1.5"
                style={{ background: 'rgba(45,212,191,0.1)', color: C.teal, border: `1px solid rgba(45,212,191,0.2)` }}>
                {spinLabel(hitOffset.dx, hitOffset.dy)}
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'X offset', value: hitOffset.dx.toFixed(2) },
                  { label: 'Y offset', value: hitOffset.dy.toFixed(2) },
                  { label: 'Spin mag', value: hypot(hitOffset.dx, hitOffset.dy).toFixed(2) },
                ].map(r => (
                  <div key={r.label} className="rounded p-2" style={{ background: C.bg }}>
                    <div style={{ color: C.hint, fontSize: 9, marginBottom: 2 }}>{r.label}</div>
                    <div style={{ color: C.text, fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{r.value}</div>
                  </div>
                ))}
              </div>

              <button onClick={resetHit} className="w-full py-1.5 text-xs font-medium rounded mt-1 transition-opacity hover:opacity-80"
                style={{ background: C.border, color: C.muted }}>
                Reset to Center
              </button>
            </div>
          )}

          {/* ── Physics Data Panel ──────────────────────────────────── */}
          {panel === 'data' && (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">

              {/* Overlays */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: C.text }}>Visible Overlays</div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { key: 'vectors',  label: '⟶ Velocity Vectors',   color: C.blue   },
                    { key: 'momentum', label: '⟹ Momentum (p=mv)',    color: C.purple  },
                    { key: 'forces',   label: '⬅ Friction Force',     color: C.red    },
                    { key: 'spin',     label: '↺ Spin / English',      color: C.teal   },
                    { key: 'trail',    label: '· Trail',               color: C.amber  },
                  ].map(o => (
                    <button key={o.key} onClick={() => toggleOverlay(o.key)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left"
                      style={{
                        background: overlays[o.key] ? `${o.color}18` : 'transparent',
                        border: `1px solid ${overlays[o.key] ? o.color : C.border}`,
                        color: overlays[o.key] ? o.color : C.hint,
                      }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: overlays[o.key] ? o.color : C.border, display: 'inline-block', flexShrink: 0 }} />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ball tracker */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: C.text }}>Ball Physics</div>
                <div className="flex flex-col gap-1.5">
                  {tableData.map((b, i) => (
                    <button key={i} onClick={() => setFollowed(f => f === i ? null : i)}
                      className="w-full rounded p-2 text-left"
                      style={{ background: followed === i ? 'rgba(251,191,36,0.08)' : C.bg, border: `1px solid ${followed === i ? C.amber : C.border}` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: b.color, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
                        <span className="text-xs font-medium" style={{ color: C.text }}>{b.isCue ? 'Cue Ball' : `Ball m=${b.mass}`}</span>
                        {followed === i && <span className="ml-auto text-xs" style={{ color: C.amber }}>TRACKING</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          ['v', b.speed],
                          ['p', b.momentum],
                          ['KE', b.KE],
                          ['spin', b.spin],
                          ['vx', b.vx],
                          ['vy', b.vy],
                        ].map(([k, v]) => (
                          <div key={k} className="rounded px-1 py-0.5" style={{ background: C.surface }}>
                            <div style={{ color: C.hint, fontSize: 8 }}>{k}</div>
                            <div style={{ color: C.text, fontFamily: 'monospace', fontSize: 10, fontWeight: 600 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── Events / Log Panel ──────────────────────────────────── */}
          {panel === 'log' && (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium" style={{ color: C.text }}>Physics Events</div>
                <button onClick={() => setEvents([])} className="text-xs" style={{ color: C.hint }}>Clear</button>
              </div>
              {events.length === 0 && (
                <div className="text-xs text-center mt-8" style={{ color: C.hint }}>
                  Take a shot to see collision physics logged here.
                </div>
              )}
              {[...events].reverse().map((ev, i) => (
                <div key={i} className="rounded p-2 text-xs" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                  {ev.type === 'shot' && (
                    <>
                      <div className="font-medium mb-1" style={{ color: C.blue }}>🎯 Shot #{events.filter(e=>e.type==='shot').length - i}</div>
                      <div style={{ color: C.muted }}>Power: <span style={{ color: C.text }}>{ev.power}</span></div>
                      <div style={{ color: C.muted }}>Angle: <span style={{ color: C.text }}>{ev.angle}°</span></div>
                      <div style={{ color: C.muted }}>Spin: <span style={{ color: C.teal }}>{ev.spin}</span></div>
                      <div style={{ color: C.muted }}>Hit: <span style={{ color: C.amber }}>({ev.hitOffset.dx.toFixed(2)}, {ev.hitOffset.dy.toFixed(2)})</span></div>
                    </>
                  )}
                  {ev.type === 'collision' && (
                    <>
                      <div className="font-medium mb-1" style={{ color: C.purple }}>💥 Collision</div>
                      <div style={{ color: C.muted }}>Angle: <span style={{ color: C.text }}>{ev.angle}°</span></div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {[ev.a, ev.b].map((ball, j) => (
                          <div key={j} className="rounded p-1" style={{ background: C.surface }}>
                            <div style={{ color: C.hint, fontSize: 9 }}>Ball {j+1} m={ball.mass}</div>
                            <div style={{ color: C.muted, fontSize: 9 }}>v: {ball.vBefore}→<span style={{color:C.green}}>{ball.vAfter}</span></div>
                            <div style={{ color: C.muted, fontSize: 9 }}>p: {ball.pBefore}→<span style={{color:C.purple}}>{ball.pAfter}</span></div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
