import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Fixed logical world — physics always in these units
const LW = 1000, LH = 660
const THRUST_MAG = 0.18
const DRAG        = 0.989
const ROT_SPEED   = 0.057
const MAX_SPEED   = 7
const BULLET_SPD  = 10
const BULLET_LIFE = 72
const VEC         = 26   // velocity → screen-px scale

const WAVES = [
  { concept:'VECTORS',      hex:'#f0d44a', n:3, tip:'Orange (vₓ) + pink (vᵧ) = yellow velocity vector v. Thrust adds a tiny vector every frame.' },
  { concept:'VECTORS',      hex:'#f0d44a', n:4, tip:'|v| = √(vₓ²+vᵧ²). Watch the magnitude in the readout as you accelerate and coast.' },
  { concept:'VECTORS',      hex:'#f0d44a', n:5, tip:'Vector addition is head-to-tail. Orange thrust tip → new velocity tip (dashed line).' },
  { concept:'DOT PRODUCT',  hex:'#ff8c4a', n:4, tip:'The dashed perpendicular drops from v onto heading ĥ. That foot is the projection v·ĥ.' },
  { concept:'DOT PRODUCT',  hex:'#ff8c4a', n:5, tip:'v·ĥ = |v|cosθ. When you fly exactly along heading: projection = full speed.' },
  { concept:'DOT PRODUCT',  hex:'#ff8c4a', n:6, tip:'Alignment 100% means v and ĥ are parallel. Zero means perpendicular — no projection.' },
  { concept:'ROTATION',     hex:'#4af08a', n:4, tip:'R(θ)·î and R(θ)·ĵ drawn at world center. Turn to see the basis vectors rotate live.' },
  { concept:'ROTATION',     hex:'#4af08a', n:5, tip:'Every turn applies [[cos,−sin],[sin,cos]] to your heading. Matrix values update live.' },
  { concept:'ROTATION',     hex:'#4af08a', n:6, tip:'det(R) = cos²+sin² = 1 always: pure rotation preserves length and area.' },
  { concept:'EIGENVECTORS', hex:'#f0a44a', n:6, tip:'Thrust along heading = v stays on that line. That line is an eigenvector of your motion.' },
]

function wrap(v, max) { return ((v % max) + max) % max }
function mag(x, y)    { return Math.sqrt(x * x + y * y) }
function fmt(n)       { return (Math.round(n * 100) / 100).toFixed(2) }
function fmtDeg(r)    { return (((r * 180 / Math.PI) + 360) % 360).toFixed(0) }

function makeAsteroid(x, y, size, waveNum) {
  const r = size === 2 ? 40 : 21
  const spd = 0.65 + waveNum * 0.15 + Math.random() * 0.85
  const a = Math.random() * Math.PI * 2
  return {
    x, y,
    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.04,
    size, r,
    verts: Array.from({ length: 9 }, (_, i) => {
      const ang = (i / 9) * Math.PI * 2
      return [Math.cos(ang) * (0.70 + Math.random() * 0.52), Math.sin(ang) * (0.70 + Math.random() * 0.52)]
    }),
  }
}

function spawnWave(waveNum) {
  const n = WAVES[Math.min(waveNum - 1, WAVES.length - 1)].n
  return Array.from({ length: n }, () => {
    let x, y
    do { x = Math.random() * LW; y = Math.random() * LH }
    while (mag(x - LW / 2, y - LH / 2) < 140)
    return makeAsteroid(x, y, 2, waveNum)
  })
}

// ── Drawing helpers ───────────────────────────────────────────────────────────
function arrow(ctx, x1, y1, x2, y2, color, w = 2, hs = 9) {
  const dx = x2 - x1, dy = y2 - y1, d = mag(dx, dy)
  if (d < 2) return
  const ux = dx / d, uy = dy / d
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * hs * 0.8, y2 - uy * hs * 0.8); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - ux * hs - uy * hs * 0.5, y2 - uy * hs + ux * hs * 0.5)
  ctx.lineTo(x2 - ux * hs + uy * hs * 0.5, y2 - uy * hs - ux * hs * 0.5)
  ctx.closePath(); ctx.fill()
  ctx.restore()
}

function dashed(ctx, x1, y1, x2, y2, color, w = 1) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash([4, 5]); ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

function label(ctx, text, x, y, color = '#fff', bg = 'rgba(0,0,0,0.72)', size = 10) {
  ctx.save()
  ctx.font = `${size}px monospace`
  const tw = ctx.measureText(text).width
  ctx.fillStyle = bg
  ctx.beginPath(); ctx.roundRect(x - 4, y - size, tw + 8, size + 6, 3); ctx.fill()
  ctx.fillStyle = color; ctx.fillText(text, x, y)
  ctx.restore()
}

function matrixBox(ctx, x, y, angle, alpha) {
  const c = Math.cos(angle), s = Math.sin(angle)
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = '9px monospace'
  ctx.strokeStyle = 'rgba(74,240,138,0.55)'; ctx.lineWidth = 0.5
  const lines = [`⎡ ${fmt(c)}  ${fmt(-s)} ⎤`, `⎣ ${fmt(s)}   ${fmt(c)} ⎦`]
  const bw = 108, bh = 40
  ctx.fillStyle = 'rgba(4,12,24,0.90)'; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 4); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#4af08a'
  lines.forEach((l, i) => ctx.fillText(l, x + 6, y + 14 + i * 14))
  ctx.restore()
}

function angleArc(ctx, x, y, angle, color, r = 30) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.72
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, angle, angle < -Math.PI / 2); ctx.stroke()
  ctx.restore()
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AsteroidsLA() {
  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const animRef   = useRef(null)
  const keyRef    = useRef({})
  const dimRef    = useRef({ W: window.innerWidth, H: window.innerHeight })

  const [phase,    setPhase]    = useState('intro')
  const [score,    setScore]    = useState(0)
  const [lives,    setLives]    = useState(3)
  const [wave,     setWave]     = useState(1)
  const [mathMode, setMathMode] = useState('all')
  const [flash,    setFlash]    = useState(null)

  const showFlash = useCallback((msg, color) => {
    setFlash({ msg, color: color || '#f0d44a' })
    setTimeout(() => setFlash(null), 1700)
  }, [])

  const initState = useCallback((w = 1) => ({
    ship: { x: LW/2, y: LH/2, vx: 0, vy: 0, angle: -Math.PI/2, cd: 0, invincible: 180 },
    bullets: [], asteroids: spawnWave(w), particles: [],
    wave: w, score: 0, lives: 3,
    matrixFlash: 0, eigenFlash: 0, addAnim: 0, prevVx: 0, prevVy: 0,
    shipTrail: [], velTrail: [], frame: 0,
  }), [])

  const startGame = useCallback(() => {
    stateRef.current = initState(1)
    setScore(0); setLives(3); setWave(1); setPhase('playing')
  }, [initState])

  useEffect(() => {
    const onKey = e => {
      keyRef.current[e.code] = e.type === 'keydown'
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault()
    }
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey) }
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const W = window.innerWidth, H = window.innerHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
      dimRef.current = { W, H }
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      const gs = stateRef.current
      if (!gs) return
      const K = keyRef.current
      const { W, H } = dimRef.current
      const dpr = window.devicePixelRatio || 1
      const { ship } = gs

      // ── Physics ──────────────────────────────────────────────
      if (K['ArrowLeft'] || K['KeyA'])  { ship.angle -= ROT_SPEED; gs.matrixFlash = 44 }
      if (K['ArrowRight'] || K['KeyD']) { ship.angle += ROT_SPEED; gs.matrixFlash = 44 }

      gs.prevVx = ship.vx; gs.prevVy = ship.vy
      const thrusting = K['ArrowUp'] || K['KeyW'] || K['ShiftLeft']
      if (thrusting) {
        ship.vx += Math.cos(ship.angle) * THRUST_MAG
        ship.vy += Math.sin(ship.angle) * THRUST_MAG
        gs.addAnim = 38
      }
      const sp = mag(ship.vx, ship.vy)
      if (sp > MAX_SPEED) { ship.vx *= MAX_SPEED / sp; ship.vy *= MAX_SPEED / sp }
      ship.vx *= DRAG; ship.vy *= DRAG
      ship.x = wrap(ship.x + ship.vx, LW)
      ship.y = wrap(ship.y + ship.vy, LH)

      if (ship.cd > 0) ship.cd--
      if ((K['Space'] || K[' ']) && ship.cd === 0) {
        gs.bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.angle) * BULLET_SPD, vy: Math.sin(ship.angle) * BULLET_SPD, life: BULLET_LIFE })
        ship.cd = 13
      }

      gs.bullets = gs.bullets.filter(b => { b.x = wrap(b.x + b.vx, LW); b.y = wrap(b.y + b.vy, LH); b.life--; return b.life > 0 })
      for (const a of gs.asteroids) { a.x = wrap(a.x + a.vx, LW); a.y = wrap(a.y + a.vy, LH); a.angle += a.spin }
      gs.particles = gs.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.vx *= 0.93; p.vy *= 0.93; p.life--; return p.life > 0 })

      // ── Collisions ───────────────────────────────────────────
      for (let bi = gs.bullets.length - 1; bi >= 0; bi--) {
        const b = gs.bullets[bi]
        for (let ai = gs.asteroids.length - 1; ai >= 0; ai--) {
          const a = gs.asteroids[ai]
          if (mag(b.x - a.x, b.y - a.y) < a.r) {
            gs.score += a.size === 2 ? 20 : 50; setScore(gs.score)
            for (let i = 0; i < 12; i++)
              gs.particles.push({ x: a.x, y: a.y, vx: (Math.random()-0.5)*5+a.vx, vy: (Math.random()-0.5)*5+a.vy, life: 60+Math.random()*20, max: 80, col: Math.random()<0.5?'#4a7ab0':'#f0d44a' })
            if (a.size > 1)
              for (let i = 0; i < 2; i++)
                gs.asteroids.push(makeAsteroid(a.x+(Math.random()-0.5)*22, a.y+(Math.random()-0.5)*22, 1, gs.wave))
            gs.asteroids.splice(ai, 1); gs.bullets.splice(bi, 1); break
          }
        }
      }
      if (ship.invincible > 0) { ship.invincible-- }
      else {
        for (let ai = gs.asteroids.length - 1; ai >= 0; ai--) {
          const a = gs.asteroids[ai]
          if (mag(ship.x - a.x, ship.y - a.y) < a.r * 0.82) {
            gs.lives--; setLives(gs.lives)
            for (let i = 0; i < 14; i++)
              gs.particles.push({ x: ship.x, y: ship.y, vx: (Math.random()-0.5)*7, vy: (Math.random()-0.5)*7, life: 60, max: 60, col: '#4a9af0' })
            gs.asteroids.splice(ai, 1)
            if (gs.lives <= 0) { setPhase('dead'); return }
            ship.x = LW/2; ship.y = LH/2; ship.vx = 0; ship.vy = 0; ship.invincible = 210; break
          }
        }
      }
      if (gs.asteroids.length === 0) {
        gs.wave++; setWave(gs.wave)
        const cfg = WAVES[Math.min(gs.wave-1, WAVES.length-1)]
        showFlash(`WAVE ${gs.wave}  ·  ${cfg.concept}`, cfg.hex)
        gs.asteroids = spawnWave(gs.wave); ship.invincible = 130
      }

      // ── Timers & trails ──────────────────────────────────────
      const vm = mag(ship.vx, ship.vy)
      if (vm > 1) {
        const dotAlign = (ship.vx/vm)*Math.cos(ship.angle) + (ship.vy/vm)*Math.sin(ship.angle)
        if (dotAlign > 0.97) gs.eigenFlash = Math.max(gs.eigenFlash, 30)
      }
      if (gs.eigenFlash > 0) gs.eigenFlash--
      if (gs.matrixFlash > 0) gs.matrixFlash--
      if (gs.addAnim > 0) gs.addAnim--

      gs.shipTrail.push({ x: ship.x, y: ship.y })
      if (gs.shipTrail.length > 24) gs.shipTrail.shift()
      gs.frame++
      if (gs.frame % 3 === 0 && vm > 0.3) {
        gs.velTrail.push({ x: ship.x, y: ship.y, vx: ship.vx, vy: ship.vy })
        if (gs.velTrail.length > 9) gs.velTrail.shift()
      }

      // ── Render ───────────────────────────────────────────────
      const scale = Math.min(W / LW, H / LH)
      const ox = (W - LW * scale) / 2
      const oy = (H - LH * scale) / 2

      // Full canvas clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#000913'; ctx.fillRect(0, 0, W, H)

      // World transform
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy)

      // Background
      ctx.fillStyle = '#000913'; ctx.fillRect(0, 0, LW, LH)

      // Grid — visible!
      const G = 55
      for (let x = 0; x <= LW; x += G) {
        const major = Math.round(x / G) % 5 === 0
        ctx.strokeStyle = major ? 'rgba(55,110,230,0.55)' : 'rgba(30,65,145,0.32)'
        ctx.lineWidth   = major ? 0.9 : 0.5
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, LH); ctx.stroke()
      }
      for (let y = 0; y <= LH; y += G) {
        const major = Math.round(y / G) % 5 === 0
        ctx.strokeStyle = major ? 'rgba(55,110,230,0.55)' : 'rgba(30,65,145,0.32)'
        ctx.lineWidth   = major ? 0.9 : 0.5
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LW, y); ctx.stroke()
      }
      // Origin dot
      ctx.fillStyle = 'rgba(100,160,255,0.38)'; ctx.beginPath(); ctx.arc(LW/2, LH/2, 4, 0, Math.PI*2); ctx.fill()

      const showVec = mathMode === 'all' || mathMode === 'vectors'
      const showMat = mathMode === 'all' || mathMode === 'matrix'
      const wv = gs.wave

      // ── Ship position trail ───────────────────────────────────
      gs.shipTrail.forEach((t, i) => {
        const a = (i / gs.shipTrail.length) * 0.38
        ctx.fillStyle = `rgba(74,154,240,${a})`
        ctx.beginPath(); ctx.arc(t.x, t.y, 1.6 * (i / gs.shipTrail.length) + 0.4, 0, Math.PI*2); ctx.fill()
      })

      // ── Past velocity vectors (trail) ─────────────────────────
      if (showVec) {
        gs.velTrail.forEach((t, i) => {
          const a = (i / gs.velTrail.length) * 0.30
          const vm2 = mag(t.vx, t.vy)
          if (vm2 < 0.3) return
          ctx.save(); ctx.globalAlpha = a
          arrow(ctx, t.x, t.y, t.x + t.vx * VEC * 0.9, t.y + t.vy * VEC * 0.9, '#f0d44a', 1.5, 6)
          ctx.restore()
        })
      }

      // ── Math overlays — wave-specific ─────────────────────────
      const vm3 = mag(ship.vx, ship.vy)

      // Heading arrow (always when showVec)
      if (showVec) {
        const hx = ship.x + Math.cos(ship.angle) * 56, hy = ship.y + Math.sin(ship.angle) * 56
        arrow(ctx, ship.x, ship.y, hx, hy, 'rgba(74,200,255,0.82)', 2, 8)
        label(ctx, `θ=${fmtDeg(ship.angle)}°`, Math.min(LW-88, hx+6), Math.max(12, hy), '#4ac8ff', 'rgba(0,0,0,0.72)', 9)
      }

      // Velocity arrow (always when showVec)
      if (showVec && vm3 > 0.3) {
        const vex = ship.x + ship.vx * VEC, vey = ship.y + ship.vy * VEC
        arrow(ctx, ship.x, ship.y, vex, vey, 'rgba(240,212,74,0.92)', 2.6, 10)
        const lx = Math.max(4, Math.min(LW-120, vex + (ship.vx > 0 ? 8 : -118)))
        const ly = Math.max(14, Math.min(LH-52, vey + (ship.vy > 0 ? 15 : -6)))
        label(ctx, `v=[${fmt(ship.vx)},${fmt(ship.vy)}]`, lx, ly, '#f0d44a', 'rgba(0,0,0,0.75)', 10)
      }

      // WAVES 1-3: component decomposition
      if (wv <= 3 && showVec && vm3 > 0.25) {
        const vtx = ship.x + ship.vx * VEC
        // vx component
        arrow(ctx, ship.x, ship.y, vtx, ship.y, 'rgba(255,140,60,0.80)', 1.8, 7)
        label(ctx, `vₓ=${fmt(ship.vx)}`, Math.max(4, Math.min(LW-78, vtx+(ship.vx>0?5:-80))), ship.y-10, '#ff8c4a', 'rgba(0,0,0,0.72)', 9)
        // vy component
        const vey2 = ship.y + ship.vy * VEC
        arrow(ctx, vtx, ship.y, vtx, vey2, 'rgba(200,100,255,0.80)', 1.8, 7)
        label(ctx, `vᵧ=${fmt(ship.vy)}`, Math.min(LW-78, vtx+6), Math.max(12, vey2+(ship.vy>0?14:-4)), '#c864ff', 'rgba(0,0,0,0.72)', 9)
        // Right-angle marker
        const rs = 7, rx = ship.vx >= 0 ? -rs : rs, ry = ship.vy >= 0 ? rs : -rs
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.moveTo(vtx+rx, ship.y); ctx.lineTo(vtx+rx, ship.y+ry); ctx.lineTo(vtx, ship.y+ry); ctx.stroke()
        ctx.restore()
      }

      // WAVES 4-6: dot product projection
      if (wv >= 4 && wv <= 6 && showVec && vm3 > 0.3) {
        const hcx = Math.cos(ship.angle), hcy = Math.sin(ship.angle)
        const dotVal = ship.vx * hcx + ship.vy * hcy
        const projX = ship.x + dotVal * VEC * hcx
        const projY = ship.y + dotVal * VEC * hcy
        const vtipX = ship.x + ship.vx * VEC, vtipY = ship.y + ship.vy * VEC
        dashed(ctx, vtipX, vtipY, projX, projY, 'rgba(255,160,60,0.70)', 1.4)
        ctx.save(); ctx.shadowColor = '#ff8c4a'; ctx.shadowBlur = 9
        ctx.fillStyle = '#ff8c4a'; ctx.beginPath(); ctx.arc(projX, projY, 4.5, 0, Math.PI*2); ctx.fill()
        ctx.restore()
        const alignPct = (Math.max(-1, Math.min(1, dotVal / Math.max(0.01, vm3))) * 100).toFixed(0)
        label(ctx, `v·ĥ=${fmt(dotVal)}  (${alignPct}%)`, Math.min(LW-160, projX+9), Math.max(12, projY-9), '#ff8c4a', 'rgba(0,0,0,0.80)', 10)
        // Extend heading line past arrow tip
        ctx.save(); ctx.strokeStyle = 'rgba(74,200,255,0.20)'; ctx.lineWidth = 0.8; ctx.setLineDash([3,7])
        ctx.beginPath(); ctx.moveTo(ship.x+hcx*56, ship.y+hcy*56); ctx.lineTo(ship.x+hcx*90, ship.y+hcy*90); ctx.stroke(); ctx.setLineDash([]); ctx.restore()
      }

      // WAVES 7-9: rotation matrix + transformed basis at world center
      if (wv >= 7 && wv <= 9 && showMat) {
        matrixBox(ctx, 12, 12, ship.angle, 0.92)
        const cx = LW/2, cy = LH/2, bl = 60
        const ic = Math.cos(ship.angle), is = Math.sin(ship.angle)
        ctx.save(); ctx.shadowColor = '#ff4466'; ctx.shadowBlur = 12
        arrow(ctx, cx, cy, cx + ic*bl, cy + is*bl, '#ff4466', 2.2, 9)
        label(ctx, 'R·î', cx+ic*bl+5, cy+is*bl+5, '#ff6688', 'rgba(0,0,0,0.72)', 9)
        ctx.restore()
        ctx.save(); ctx.shadowColor = '#44ff88'; ctx.shadowBlur = 12
        arrow(ctx, cx, cy, cx - is*bl, cy + ic*bl, '#44ff88', 2.2, 9)
        label(ctx, 'R·ĵ', cx-is*bl+5, cy+ic*bl+5, '#66ffaa', 'rgba(0,0,0,0.72)', 9)
        ctx.restore()
        angleArc(ctx, cx, cy, ship.angle, '#4af08a', 36)
        if (gs.matrixFlash > 0) {
          ctx.save(); ctx.globalAlpha = Math.min(1, gs.matrixFlash/16)
          angleArc(ctx, ship.x, ship.y, ship.angle, '#4af08a', 30)
          label(ctx, `θ=${fmtDeg(ship.angle)}°`, ship.x+34, ship.y+28, '#4af08a', 'rgba(0,0,0,0.65)', 9)
          ctx.restore()
        }
      } else if (gs.matrixFlash > 0 && showMat) {
        const alpha = Math.min(1, gs.matrixFlash / 16)
        matrixBox(ctx, Math.min(LW-120, ship.x+44), Math.max(4, ship.y-62), ship.angle, alpha)
        ctx.save(); ctx.globalAlpha = alpha
        angleArc(ctx, ship.x, ship.y, ship.angle, '#4af08a', 30)
        label(ctx, `θ=${fmtDeg(ship.angle)}°`, ship.x+34, ship.y+28, '#4af08a', 'rgba(0,0,0,0.65)', 9)
        ctx.restore()
      }

      // WAVE 10+: eigenvector line through world
      if (wv >= 10 && showVec) {
        const ec = Math.cos(ship.angle), es = Math.sin(ship.angle)
        ctx.save(); ctx.strokeStyle = `rgba(255,160,60,${0.28+(gs.eigenFlash/30)*0.38})`; ctx.lineWidth = 1; ctx.setLineDash([5,8])
        ctx.beginPath(); ctx.moveTo(ship.x-ec*800, ship.y-es*800); ctx.lineTo(ship.x+ec*800, ship.y+es*800); ctx.stroke(); ctx.setLineDash([]); ctx.restore()
      }

      // Eigenvector flash (all waves)
      if (gs.eigenFlash > 0) {
        const a = gs.eigenFlash / 30
        ctx.save(); ctx.globalAlpha = a * 0.10; ctx.fillStyle = '#f0a44a'; ctx.fillRect(0, 0, LW, LH); ctx.restore()
        if (vm3 > 0.5) {
          ctx.save(); ctx.globalAlpha = a
          const ec = Math.cos(ship.angle), es = Math.sin(ship.angle)
          ctx.strokeStyle = 'rgba(255,160,60,0.76)'; ctx.lineWidth = 1.4; ctx.setLineDash([5,5])
          ctx.beginPath(); ctx.moveTo(ship.x-ec*155, ship.y-es*155); ctx.lineTo(ship.x+ec*155, ship.y+es*155); ctx.stroke(); ctx.setLineDash([])
          label(ctx, 'EIGENVECTOR: v ∥ heading', ship.x-88, ship.y-38, '#f0a44a', 'rgba(0,0,0,0.85)', 10)
          ctx.restore()
        }
      }

      // Vector addition animation (when thrusting)
      if (gs.addAnim > 0 && thrusting) {
        const a = gs.addAnim / 38
        const tx = Math.cos(ship.angle) * THRUST_MAG * VEC, ty = Math.sin(ship.angle) * THRUST_MAG * VEC
        if (mag(gs.prevVx, gs.prevVy) > 0.3) {
          ctx.save(); ctx.globalAlpha = a * 0.38
          arrow(ctx, ship.x, ship.y, ship.x+gs.prevVx*VEC, ship.y+gs.prevVy*VEC, '#f0d44a', 1.5, 7)
          ctx.restore()
        }
        const otx = ship.x + gs.prevVx * VEC, oty = ship.y + gs.prevVy * VEC
        ctx.save(); ctx.globalAlpha = a
        arrow(ctx, otx, oty, otx+tx*12, oty+ty*12, '#ff8c4a', 2.5, 9)
        label(ctx, '+ thrust', otx+tx*8, oty+ty*8-9, '#ff8c4a', 'rgba(0,0,0,0.78)', 10)
        dashed(ctx, ship.x, ship.y, ship.x+ship.vx*VEC, ship.y+ship.vy*VEC, 'rgba(255,255,255,0.28)', 1)
        ctx.restore()
      }

      // Speed ring
      if (showVec) {
        const sr = Math.max(0, Math.min(vm3/MAX_SPEED, 1)) * 22
        ctx.save(); ctx.strokeStyle = 'rgba(240,212,74,0.18)'; ctx.lineWidth = 0.8; ctx.setLineDash([2,4])
        ctx.beginPath(); ctx.arc(ship.x, ship.y, sr+22, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]); ctx.restore()
      }

      // Asteroid velocity arrows
      if (showVec) {
        for (const a of gs.asteroids) {
          ctx.save(); ctx.translate(a.x, a.y)
          ctx.strokeStyle = 'rgba(74,120,180,0.5)'; ctx.lineWidth = 0.9
          ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(a.vx*10, a.vy*10); ctx.stroke()
          ctx.fillStyle = 'rgba(74,120,180,0.5)'; ctx.beginPath(); ctx.arc(a.vx*10, a.vy*10, 2.5, 0, Math.PI*2); ctx.fill()
          ctx.restore()
        }
      }

      // ── Particles ─────────────────────────────────────────────
      for (const p of gs.particles) {
        ctx.save(); ctx.globalAlpha = p.life / p.max
        ctx.shadowColor = p.col; ctx.shadowBlur = 5
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, 3*(p.life/p.max)+0.5, 0, Math.PI*2); ctx.fill()
        ctx.restore()
      }

      // ── Bullets ───────────────────────────────────────────────
      for (const b of gs.bullets) {
        ctx.save(); ctx.shadowColor = '#f0d44a'; ctx.shadowBlur = 7
        ctx.fillStyle = '#ffe87a'; ctx.beginPath(); ctx.arc(b.x, b.y, 2.5, 0, Math.PI*2); ctx.fill(); ctx.restore()
        if (showVec) arrow(ctx, b.x, b.y, b.x+b.vx*1.8, b.y+b.vy*1.8, 'rgba(240,220,100,0.28)', 0.8, 4)
      }

      // ── Asteroids ─────────────────────────────────────────────
      for (const a of gs.asteroids) {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.angle)
        ctx.strokeStyle = '#2a6aaa'; ctx.lineWidth = 1.8; ctx.fillStyle = 'rgba(8,18,42,0.74)'
        ctx.beginPath(); ctx.moveTo(a.verts[0][0]*a.r, a.verts[0][1]*a.r)
        for (let i = 1; i < a.verts.length; i++) ctx.lineTo(a.verts[i][0]*a.r, a.verts[i][1]*a.r)
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore()
      }

      // ── Ship ──────────────────────────────────────────────────
      ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.angle)
      if (!(ship.invincible > 0 && Math.floor(ship.invincible/7) % 2 === 0)) {
        if (thrusting) {
          ctx.fillStyle = `rgba(255,140,60,${0.8+Math.random()*0.2})`
          ctx.beginPath(); ctx.moveTo(-14,-5); ctx.lineTo(-26-Math.random()*8, 0); ctx.lineTo(-14, 5); ctx.closePath(); ctx.fill()
          ctx.fillStyle = 'rgba(255,220,100,0.5)'
          ctx.beginPath(); ctx.moveTo(-14,-3); ctx.lineTo(-20-Math.random()*6, 0); ctx.lineTo(-14, 3); ctx.closePath(); ctx.fill()
        }
        ctx.shadowColor = '#4a9af0'; ctx.shadowBlur = 10
        ctx.fillStyle = 'rgba(8,22,58,0.88)'; ctx.strokeStyle = '#4a9af0'; ctx.lineWidth = 1.9
        ctx.beginPath(); ctx.moveTo(17,0); ctx.lineTo(-11,-10); ctx.lineTo(-7,0); ctx.lineTo(-11,10); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.fillStyle = 'rgba(74,200,255,0.62)'; ctx.beginPath(); ctx.arc(6, 0, 3, 0, Math.PI*2); ctx.fill()
      }
      ctx.restore()

      // World border
      ctx.strokeStyle = 'rgba(40,80,180,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(0, 0, LW, LH)

      // ── Digital readout (screen space) ───────────────────────
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const RH = 38, RP = 10
      ctx.fillStyle = 'rgba(0,8,20,0.88)'
      ctx.beginPath(); ctx.roundRect(RP, H-RH-RP, W-RP*2, RH, 4); ctx.fill()
      ctx.strokeStyle = 'rgba(30,70,140,0.5)'; ctx.lineWidth = 0.6; ctx.stroke()
      ctx.font = '10px monospace'
      ctx.fillStyle = '#3a6aaa'; ctx.fillText(`p = [${Math.round(ship.x)}, ${Math.round(ship.y)}]`, RP+10, H-RH+10)
      ctx.fillStyle = '#f0d44a'; ctx.fillText(`v = [${fmt(ship.vx)}, ${fmt(ship.vy)}]`,            RP+10, H-RH+24)
      ctx.fillStyle = '#88aacc'; ctx.fillText(`|v| = ${fmt(mag(ship.vx,ship.vy))}`,                RP+192, H-RH+10)
      ctx.fillStyle = '#4af08a'; ctx.fillText(`θ = ${fmtDeg(ship.angle)}°`,                        RP+192, H-RH+24)
      ctx.fillStyle = '#4af08a'
      ctx.fillText(`R(θ) = ⎡${fmt(Math.cos(ship.angle))}  ${fmt(-Math.sin(ship.angle))}⎤`, RP+316, H-RH+10)
      ctx.fillText(`       ⎣${fmt(Math.sin(ship.angle))}   ${fmt(Math.cos(ship.angle))}⎦`,  RP+316, H-RH+24)
      const wCfgR = WAVES[Math.min(gs.wave-1, WAVES.length-1)]
      ctx.fillStyle = wCfgR.hex; ctx.font = 'bold 10px monospace'
      const wl = `W${gs.wave} · ${wCfgR.concept}`
      ctx.fillText(wl, W-RP-ctx.measureText(wl).width-14, H-RH+17)

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [phase, mathMode, showFlash])

  const cycleMode = () => setMathMode(m => ({ all:'vectors', vectors:'matrix', matrix:'none', none:'all' }[m]))
  const modeLabel = { all:'ALL MATH', vectors:'VECTORS', matrix:'MATRIX', none:'NONE' }[mathMode]
  const modeColor = { all:'#4af08a', vectors:'#f0d44a', matrix:'#4ac8ff', none:'#3a5a6a' }[mathMode]
  const wCfgUi = WAVES[Math.min(wave-1, WAVES.length-1)]

  return (
    <div style={{ position:'fixed', inset:0, background:'#000913', overflow:'hidden' }}>
      <canvas ref={canvasRef} style={{ display:'block' }} />

      <Link to="/games" style={{ position:'absolute', top:14, left:14, display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:6, background:'rgba(0,8,22,0.82)', border:'1px solid rgba(60,120,200,0.28)', color:'#4a7ab0', fontSize:11, fontWeight:700, letterSpacing:'0.05em', textDecoration:'none', fontFamily:'monospace' }}>
        <ArrowLeft size={12} /> GAMES
      </Link>

      <div style={{ position:'absolute', top:14, right:14, display:'flex', alignItems:'center', gap:10, background:'rgba(0,8,22,0.82)', border:'1px solid rgba(30,70,140,0.4)', borderRadius:6, padding:'6px 14px', fontFamily:'monospace' }}>
        <span style={{ color:'#4a9af0', fontSize:11 }}>SCORE <span style={{ color:'#fff', fontWeight:700 }}>{score}</span></span>
        <span style={{ color:'#2a4060' }}>|</span>
        {Array.from({ length: Math.max(0,lives) }, (_,i) => (
          <div key={i} style={{ width:10, height:10, clipPath:'polygon(50% 0%,85% 90%,15% 90%)', background:'#4a9af0', flexShrink:0 }} />
        ))}
        <span style={{ color:'#4af08a', fontSize:10, fontWeight:700 }}>W{wave}</span>
        <span style={{ color:wCfgUi.hex, fontSize:9, letterSpacing:'0.08em' }}>{wCfgUi.concept}</span>
      </div>

      <button onClick={cycleMode} style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', padding:'6px 16px', background:'rgba(0,8,22,0.82)', border:`1px solid ${modeColor}44`, borderRadius:6, color:modeColor, fontSize:10, fontWeight:700, cursor:'pointer', letterSpacing:'0.12em', fontFamily:'monospace' }}>
        MATH: {modeLabel}
      </button>

      {flash && (
        <>
          <div style={{ position:'absolute', top:'36%', left:'50%', transform:'translate(-50%,-50%)', color:flash.color, fontSize:28, letterSpacing:5, fontWeight:'bold', textShadow:`0 0 30px ${flash.color}`, pointerEvents:'none', fontFamily:'monospace', whiteSpace:'nowrap' }}>
            {flash.msg}
          </div>
          <div style={{ position:'absolute', top:'calc(36% + 22px)', left:'50%', transform:'translateX(-50%)', color:'rgba(200,220,255,0.55)', fontSize:10, fontFamily:'monospace', pointerEvents:'none', textAlign:'center', maxWidth:'80vw' }}>
            {wCfgUi.tip}
          </div>
        </>
      )}

      {phase === 'intro' && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,5,15,0.93)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, fontFamily:'monospace' }}>
          <div style={{ fontSize:28, color:'#7ab8f0', letterSpacing:6 }}>VECTOR ASTEROIDS</div>
          <div style={{ fontSize:10, color:'#3a6a9a', letterSpacing:3 }}>LINEAR ALGEBRA THROUGH PLAY</div>
          <div style={{ fontSize:9, color:'#2a4a6a', marginTop:4, textAlign:'center', lineHeight:1.9 }}>
            <span style={{color:'#f0d44a'}}>yellow = v</span>&nbsp;·&nbsp;<span style={{color:'#ff8c4a'}}>orange = vₓ</span>&nbsp;·&nbsp;<span style={{color:'#c864ff'}}>pink = vᵧ</span>&nbsp;·&nbsp;<span style={{color:'#4ac8ff'}}>cyan = heading ĥ</span>&nbsp;·&nbsp;<span style={{color:'#4af08a'}}>green = R(θ)</span><br/>
            every arrow is the actual math running under the game
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:6, maxWidth:460 }}>
            {[
              { icon:'v', color:'#f0d44a', t:'VELOCITY VECTOR', b:'v=[vₓ,vᵧ] — orange+pink components form the yellow vector' },
              { icon:'R', color:'#4af08a', t:'ROTATION MATRIX', b:'[[cos,−sin],[sin,cos]] — turning rotates your heading' },
              { icon:'·', color:'#ff8c4a', t:'DOT PRODUCT',     b:'v·ĥ = projection of v onto heading, shown as a dashed drop' },
              { icon:'λ', color:'#f0a44a', t:'EIGENVECTOR',     b:'thrust along heading → v stays on that line indefinitely' },
            ].map(({ icon, color, t, b }) => (
              <div key={t} style={{ background:'rgba(4,10,24,0.82)', border:'0.5px solid rgba(30,70,140,0.4)', borderRadius:5, padding:'8px 10px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                  <span style={{ color, fontSize:13, fontWeight:'bold' }}>{icon}</span>
                  <span style={{ color:'#4a7ab0', fontSize:8, letterSpacing:1 }}>{t}</span>
                </div>
                <div style={{ color:'#2a4a6a', fontSize:9, lineHeight:1.5 }}>{b}</div>
              </div>
            ))}
          </div>
          <button onClick={startGame} style={{ marginTop:10, padding:'10px 32px', background:'transparent', border:'1px solid #3a6aaa', color:'#7ab8f0', fontSize:13, borderRadius:5, cursor:'pointer', letterSpacing:3 }}>
            LAUNCH
          </button>
          <div style={{ fontSize:9, color:'#2a4060', letterSpacing:1 }}>← → ROTATE &nbsp;·&nbsp; ↑ THRUST &nbsp;·&nbsp; SPACE FIRE</div>
        </div>
      )}

      {phase === 'dead' && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,5,15,0.93)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, fontFamily:'monospace' }}>
          <div style={{ fontSize:26, color:'#f07a4a', letterSpacing:5 }}>GAME OVER</div>
          <div style={{ fontSize:14, color:'#4a7ab0' }}>SCORE: {score}</div>
          <div style={{ fontSize:9, color:'#2a4a6a', textAlign:'center', lineHeight:1.9 }}>
            you navigated ℝ² with rotation matrices and vector addition<br/>every frame: R(θ)·ĥ → thrust → v += thrust → p += v
          </div>
          <button onClick={startGame} style={{ marginTop:8, padding:'10px 28px', background:'transparent', border:'1px solid #3a6aaa', color:'#7ab8f0', fontSize:13, borderRadius:5, cursor:'pointer', letterSpacing:3 }}>
            RETRY
          </button>
        </div>
      )}
    </div>
  )
}
