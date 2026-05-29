import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Physics (frame-based, ~60 fps)
const THRUST_MAG = 0.18
const DRAG       = 0.989
const ROT_SPEED  = 0.057
const MAX_SPEED  = 7
const BULLET_SPD = 10
const BULLET_LIFE = 72

const WAVES = [
  { concept: 'VECTORS',      hex: '#f0d44a', n: 3, tip: 'Thrust adds a vector to your velocity every frame. Watch the yellow arrow grow.' },
  { concept: 'VECTORS',      hex: '#f0d44a', n: 4, tip: 'Speed = |v|. The magnitude of the velocity vector. See it pulse in the readout.' },
  { concept: 'VECTORS',      hex: '#f0d44a', n: 5, tip: 'Vectors add head-to-tail. Orange thrust + yellow velocity = new trajectory.' },
  { concept: 'DOT PRODUCT',  hex: '#ff8c4a', n: 4, tip: 'v · heading = |v| cos θ. High alignment = v nearly parallel to heading.' },
  { concept: 'DOT PRODUCT',  hex: '#ff8c4a', n: 5, tip: 'Dot product measures how much one vector projects onto another.' },
  { concept: 'DOT PRODUCT',  hex: '#ff8c4a', n: 6, tip: 'When dot product → 1, your velocity locks to heading. Feel the pull.' },
  { concept: 'ROTATION',     hex: '#4af08a', n: 4, tip: 'Turning = applying R(θ) = [[cos,-sin],[sin,cos]] to your heading vector.' },
  { concept: 'ROTATION',     hex: '#4af08a', n: 5, tip: 'The green matrix updates live. Every rotation IS a matrix multiply.' },
  { concept: 'ROTATION',     hex: '#4af08a', n: 6, tip: 'R(θ) preserves length. det = cos²+sin² = 1. No stretching, only turning.' },
  { concept: 'EIGENVECTORS', hex: '#f0a44a', n: 6, tip: 'Eigenvector: thrust along heading, v stays on that line forever.' },
]

function wrap(v, max) { return ((v % max) + max) % max }
function mag(x, y) { return Math.sqrt(x * x + y * y) }
function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2) }
function fmtDeg(r) { return (((r * 180 / Math.PI) + 360) % 360).toFixed(0) }

function makeAsteroid(x, y, size, wave) {
  const r = size === 2 ? 40 : 21
  const speed = 0.65 + wave * 0.15 + Math.random() * 0.85
  const angle = Math.random() * Math.PI * 2
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.04,
    size, r,
    verts: Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2
      return [Math.cos(a) * (0.70 + Math.random() * 0.52), Math.sin(a) * (0.70 + Math.random() * 0.52)]
    }),
  }
}

function spawnWave(waveNum, W, H, sx, sy) {
  const n = WAVES[Math.min(waveNum - 1, WAVES.length - 1)].n
  return Array.from({ length: n }, () => {
    let x, y
    do { x = Math.random() * W; y = Math.random() * H }
    while (mag(x - sx, y - sy) < 140)
    return makeAsteroid(x, y, 2, waveNum)
  })
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function drawArrow(ctx, x1, y1, x2, y2, color, width = 2, hs = 9) {
  const dx = x2 - x1, dy = y2 - y1
  const d = mag(dx, dy)
  if (d < 2) return
  const ux = dx / d, uy = dy / d
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * hs * 0.8, y2 - uy * hs * 0.8); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - ux * hs - uy * hs * 0.5, y2 - uy * hs + ux * hs * 0.5)
  ctx.lineTo(x2 - ux * hs + uy * hs * 0.5, y2 - uy * hs - ux * hs * 0.5)
  ctx.closePath(); ctx.fill()
  ctx.restore()
}

function drawDashed(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash([4, 5]); ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

function drawLabel(ctx, text, x, y, color = '#fff', bg = 'rgba(0,0,0,0.65)', size = 10) {
  ctx.save()
  ctx.font = `${size}px monospace`
  const tw = ctx.measureText(text).width
  ctx.fillStyle = bg
  ctx.beginPath(); ctx.roundRect(x - 4, y - size, tw + 8, size + 6, 3); ctx.fill()
  ctx.fillStyle = color; ctx.fillText(text, x, y)
  ctx.restore()
}

function drawAngleArc(ctx, x, y, angle, color) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7
  ctx.beginPath(); ctx.arc(x, y, 30, -Math.PI / 2, angle, angle < -Math.PI / 2); ctx.stroke()
  ctx.globalAlpha = 1
  ctx.restore()
}

function drawMatrixBox(ctx, x, y, angle, alpha) {
  const c = Math.cos(angle), s = Math.sin(angle)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = '9px monospace'
  ctx.strokeStyle = 'rgba(74,240,138,0.5)'; ctx.lineWidth = 0.5
  const lines = [`⎡ ${fmt(c)}  ${fmt(-s)} ⎤`, `⎣ ${fmt(s)}   ${fmt(c)} ⎦`]
  const lh = 13, pad = 6, bw = 108, bh = lh * 2 + pad * 2
  ctx.fillStyle = 'rgba(4,12,24,0.86)'
  ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 4); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#4af08a'
  lines.forEach((l, i) => ctx.fillText(l, x + pad, y + pad + 10 + i * lh))
  ctx.restore()
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AsteroidsLA() {
  const canvasRef  = useRef(null)
  const stateRef   = useRef(null)
  const animRef    = useRef(null)
  const keyRef     = useRef({})
  const dimRef     = useRef({ W: window.innerWidth, H: window.innerHeight })

  const [phase, setPhase]       = useState('intro') // intro | playing | dead
  const [score, setScore]       = useState(0)
  const [lives, setLives]       = useState(3)
  const [wave, setWave]         = useState(1)
  const [mathMode, setMathMode] = useState('all')  // all | vectors | matrix | none
  const [flash, setFlash]       = useState(null)

  const showFlash = useCallback((msg, color = '#f0d44a') => {
    setFlash({ msg, color })
    setTimeout(() => setFlash(null), 1700)
  }, [])

  const initState = useCallback((w = 1) => {
    const { W, H } = dimRef.current
    return {
      ship: { x: W / 2, y: H / 2, vx: 0, vy: 0, angle: -Math.PI / 2, cd: 0, invincible: 180 },
      bullets: [], asteroids: spawnWave(w, W, H, W / 2, H / 2), particles: [],
      wave: w, score: 0, lives: 3,
      matrixFlash: 0, eigenFlash: 0, addAnim: 0, prevVx: 0, prevVy: 0,
    }
  }, [])

  const startGame = useCallback(() => {
    stateRef.current = initState(1)
    setScore(0); setLives(3); setWave(1); setPhase('playing')
  }, [initState])

  // Key events
  useEffect(() => {
    const onKey = e => {
      keyRef.current[e.code] = e.type === 'keydown'
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey) }
  }, [])

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
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
      const { ship } = gs

      // ── Physics ──────────────────────────────────────────
      const rotating = K['ArrowLeft'] || K['KeyA'] || K['ArrowRight'] || K['KeyD']
      if (K['ArrowLeft']  || K['KeyA']) ship.angle -= ROT_SPEED
      if (K['ArrowRight'] || K['KeyD']) ship.angle += ROT_SPEED
      if (rotating) gs.matrixFlash = 44

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
      ship.x = wrap(ship.x + ship.vx, W)
      ship.y = wrap(ship.y + ship.vy, H)

      if (ship.cd > 0) ship.cd--
      if ((K['Space'] || K[' ']) && ship.cd === 0) {
        gs.bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.angle) * BULLET_SPD, vy: Math.sin(ship.angle) * BULLET_SPD, life: BULLET_LIFE })
        ship.cd = 13
      }

      gs.bullets = gs.bullets.filter(b => {
        b.x = wrap(b.x + b.vx, W); b.y = wrap(b.y + b.vy, H); b.life--
        return b.life > 0
      })

      for (const a of gs.asteroids) {
        a.x = wrap(a.x + a.vx, W); a.y = wrap(a.y + a.vy, H); a.angle += a.spin
      }

      gs.particles = gs.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vx *= 0.94; p.vy *= 0.94; p.life--
        return p.life > 0
      })

      // ── Collisions ───────────────────────────────────────
      for (let bi = gs.bullets.length - 1; bi >= 0; bi--) {
        const b = gs.bullets[bi]
        for (let ai = gs.asteroids.length - 1; ai >= 0; ai--) {
          const a = gs.asteroids[ai]
          if (mag(b.x - a.x, b.y - a.y) < a.r) {
            gs.score += a.size === 2 ? 20 : 50; setScore(gs.score)
            for (let i = 0; i < 8; i++)
              gs.particles.push({ x: a.x, y: a.y, vx: (Math.random()-0.5)*5+a.vx, vy: (Math.random()-0.5)*5+a.vy, life: 40+Math.random()*18, max: 58, col: Math.random()<0.5?'#4a7ab0':'#f0d44a' })
            if (a.size > 1) {
              for (let i = 0; i < 2; i++)
                gs.asteroids.push(makeAsteroid(a.x+(Math.random()-0.5)*22, a.y+(Math.random()-0.5)*22, 1, gs.wave))
            }
            gs.asteroids.splice(ai, 1); gs.bullets.splice(bi, 1)
            break
          }
        }
      }

      if (ship.invincible > 0) ship.invincible--
      else {
        for (let ai = gs.asteroids.length - 1; ai >= 0; ai--) {
          const a = gs.asteroids[ai]
          if (mag(ship.x - a.x, ship.y - a.y) < a.r * 0.82) {
            gs.lives--; setLives(gs.lives)
            for (let i = 0; i < 12; i++)
              gs.particles.push({ x: ship.x, y: ship.y, vx: (Math.random()-0.5)*7, vy: (Math.random()-0.5)*7, life: 55, max: 55, col: '#4a9af0' })
            gs.asteroids.splice(ai, 1)
            if (gs.lives <= 0) { setPhase('dead'); return }
            ship.x = W/2; ship.y = H/2; ship.vx = 0; ship.vy = 0; ship.invincible = 210
            break
          }
        }
      }

      if (gs.asteroids.length === 0) {
        gs.wave++; setWave(gs.wave)
        const cfg = WAVES[Math.min(gs.wave - 1, WAVES.length - 1)]
        showFlash(`WAVE ${gs.wave}  ·  ${cfg.concept}`, cfg.hex)
        gs.asteroids = spawnWave(gs.wave, W, H, ship.x, ship.y)
        ship.invincible = 130
      }

      // Eigenvector detection: v ∥ heading
      const vm = mag(ship.vx, ship.vy)
      if (vm > 1) {
        const dot = (ship.vx/vm)*Math.cos(ship.angle) + (ship.vy/vm)*Math.sin(ship.angle)
        if (dot > 0.97) gs.eigenFlash = Math.max(gs.eigenFlash, 30)
      }
      if (gs.eigenFlash > 0) gs.eigenFlash--
      if (gs.matrixFlash > 0) gs.matrixFlash--
      if (gs.addAnim > 0) gs.addAnim--

      // ── Render ───────────────────────────────────────────
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#000913'; ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(20,50,100,0.2)'; ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 55) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
      for (let y = 0; y < H; y += 55) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

      const showVec = mathMode === 'all' || mathMode === 'vectors'
      const showMat = mathMode === 'all' || mathMode === 'matrix'
      const VEC = 22

      // ── Math overlays ─────────────────────────────────────
      if (showVec) {
        const vm2 = mag(ship.vx, ship.vy)

        // Velocity vector (yellow)
        if (vm2 > 0.3) {
          const vex = ship.x + ship.vx * VEC, vey = ship.y + ship.vy * VEC
          drawArrow(ctx, ship.x, ship.y, vex, vey, 'rgba(240,212,74,0.92)', 2.6, 10)
          const lx = Math.max(4, Math.min(W-116, vex + (ship.vx > 0 ? 7 : -112)))
          const ly = Math.max(14, Math.min(H-50, vey + (ship.vy > 0 ? 14 : -6)))
          drawLabel(ctx, `v=[${fmt(ship.vx)},${fmt(ship.vy)}]`, lx, ly, '#f0d44a', 'rgba(0,0,0,0.72)', 10)
        }

        // Heading vector (cyan)
        const hx = ship.x + Math.cos(ship.angle) * 56, hy = ship.y + Math.sin(ship.angle) * 56
        drawArrow(ctx, ship.x, ship.y, hx, hy, 'rgba(74,200,255,0.78)', 2, 8)
        drawLabel(ctx, `θ=${fmtDeg(ship.angle)}°`, hx+6, hy, '#4ac8ff', 'rgba(0,0,0,0.65)', 9)

        // Vector addition animation
        if (gs.addAnim > 0 && thrusting) {
          const alpha = gs.addAnim / 38
          const tx = Math.cos(ship.angle) * THRUST_MAG * VEC
          const ty = Math.sin(ship.angle) * THRUST_MAG * VEC
          // Faded old velocity
          if (mag(gs.prevVx, gs.prevVy) > 0.3) {
            ctx.save(); ctx.globalAlpha = alpha * 0.38
            drawArrow(ctx, ship.x, ship.y, ship.x + gs.prevVx * VEC, ship.y + gs.prevVy * VEC, '#f0d44a', 1.5, 7)
            ctx.restore()
          }
          // Thrust arrow from tip of old velocity
          const otx = ship.x + gs.prevVx * VEC, oty = ship.y + gs.prevVy * VEC
          ctx.save(); ctx.globalAlpha = alpha
          drawArrow(ctx, otx, oty, otx + tx * 12, oty + ty * 12, '#ff8c4a', 2.5, 9)
          drawLabel(ctx, '+ thrust', otx + tx * 8, oty + ty * 8 - 8, '#ff8c4a', 'rgba(0,0,0,0.75)', 10)
          // Dashed resultant
          drawDashed(ctx, ship.x, ship.y, ship.x + ship.vx * VEC, ship.y + ship.vy * VEC, 'rgba(255,255,255,0.32)', 1)
          ctx.restore()
        }

        // Eigenvector flash
        if (gs.eigenFlash > 0) {
          const alpha = gs.eigenFlash / 30
          ctx.save(); ctx.globalAlpha = alpha * 0.11
          ctx.fillStyle = '#f0a44a'; ctx.fillRect(0, 0, W, H)
          ctx.restore()
          const vm3 = mag(ship.vx, ship.vy)
          if (vm3 > 0.5) {
            ctx.save(); ctx.globalAlpha = alpha
            const ex = Math.cos(ship.angle), ey = Math.sin(ship.angle)
            ctx.strokeStyle = 'rgba(255,160,60,0.72)'; ctx.lineWidth = 1.2; ctx.setLineDash([5,5])
            ctx.beginPath(); ctx.moveTo(ship.x - ex*150, ship.y - ey*150); ctx.lineTo(ship.x + ex*150, ship.y + ey*150); ctx.stroke()
            ctx.setLineDash([])
            drawLabel(ctx, 'EIGENVECTOR: v ∥ heading', ship.x - 90, ship.y - 36, '#f0a44a', 'rgba(0,0,0,0.82)', 10)
            ctx.restore()
          }
        }

        // Asteroid velocity arrows
        for (const a of gs.asteroids) {
          ctx.save(); ctx.translate(a.x, a.y)
          ctx.strokeStyle = 'rgba(74,120,180,0.45)'; ctx.lineWidth = 0.9
          ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(a.vx*10, a.vy*10); ctx.stroke()
          if (mag(a.vx, a.vy) > 0.1) {
            ctx.fillStyle = 'rgba(74,120,180,0.45)'
            ctx.beginPath(); ctx.arc(a.vx*10, a.vy*10, 2.5, 0, Math.PI*2); ctx.fill()
          }
          ctx.restore()
        }

        // Speed ring
        const sr = Math.max(0, Math.min(vm2 / MAX_SPEED, 1)) * 22
        ctx.save()
        ctx.strokeStyle = 'rgba(240,212,74,0.2)'; ctx.lineWidth = 0.8; ctx.setLineDash([2,4])
        ctx.beginPath(); ctx.arc(ship.x, ship.y, sr + 22, 0, Math.PI*2); ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }

      // Rotation matrix box
      if (showMat && gs.matrixFlash > 0) {
        const alpha = Math.min(1, gs.matrixFlash / 16)
        const mx = Math.min(W - 120, ship.x + 44), my = Math.max(4, ship.y - 60)
        drawMatrixBox(ctx, mx, my, ship.angle, alpha)
        ctx.save(); ctx.globalAlpha = alpha
        drawAngleArc(ctx, ship.x, ship.y, ship.angle, '#4af08a')
        drawLabel(ctx, `θ=${fmtDeg(ship.angle)}°`, ship.x + 34, ship.y + 28, '#4af08a', 'rgba(0,0,0,0.65)', 9)
        ctx.restore()
      }

      // ── Particles ────────────────────────────────────────
      for (const p of gs.particles) {
        ctx.save(); ctx.globalAlpha = p.life / p.max
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill()
        ctx.restore()
      }

      // ── Bullets ──────────────────────────────────────────
      for (const b of gs.bullets) {
        ctx.save()
        ctx.shadowColor = '#f0d44a'; ctx.shadowBlur = 6
        ctx.fillStyle = '#ffe87a'; ctx.beginPath(); ctx.arc(b.x, b.y, 2.5, 0, Math.PI*2); ctx.fill()
        ctx.restore()
        if (showVec) drawArrow(ctx, b.x, b.y, b.x + b.vx*1.8, b.y + b.vy*1.8, 'rgba(240,220,100,0.28)', 0.8, 4)
      }

      // ── Asteroids ─────────────────────────────────────────
      for (const a of gs.asteroids) {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.angle)
        ctx.strokeStyle = '#2a6aaa'; ctx.lineWidth = 1.8; ctx.fillStyle = 'rgba(8,18,42,0.72)'
        ctx.beginPath()
        ctx.moveTo(a.verts[0][0]*a.r, a.verts[0][1]*a.r)
        for (let i = 1; i < a.verts.length; i++) ctx.lineTo(a.verts[i][0]*a.r, a.verts[i][1]*a.r)
        ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.restore()
      }

      // ── Ship ─────────────────────────────────────────────
      ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.angle)
      if (!(ship.invincible > 0 && Math.floor(ship.invincible / 7) % 2 === 0)) {
        if (thrusting) {
          ctx.fillStyle = `rgba(255,140,60,${0.8 + Math.random()*0.2})`
          ctx.beginPath(); ctx.moveTo(-14,-5); ctx.lineTo(-26-Math.random()*8, 0); ctx.lineTo(-14, 5); ctx.closePath(); ctx.fill()
          ctx.fillStyle = 'rgba(255,220,100,0.5)'
          ctx.beginPath(); ctx.moveTo(-14,-3); ctx.lineTo(-20-Math.random()*6, 0); ctx.lineTo(-14, 3); ctx.closePath(); ctx.fill()
        }
        ctx.shadowColor = '#4a9af0'; ctx.shadowBlur = 10
        ctx.fillStyle = 'rgba(8,22,58,0.88)'; ctx.strokeStyle = '#4a9af0'; ctx.lineWidth = 1.9
        ctx.beginPath(); ctx.moveTo(17,0); ctx.lineTo(-11,-10); ctx.lineTo(-7,0); ctx.lineTo(-11,10); ctx.closePath()
        ctx.fill(); ctx.stroke()
        ctx.fillStyle = 'rgba(74,200,255,0.62)'; ctx.beginPath(); ctx.arc(6, 0, 3, 0, Math.PI*2); ctx.fill()
      }
      ctx.restore()

      // ── Digital readout bar ───────────────────────────────
      const vm5 = mag(ship.vx, ship.vy)
      const RH = 38, RP = 10
      ctx.fillStyle = 'rgba(0,8,20,0.82)'
      ctx.beginPath(); ctx.roundRect(RP, H - RH - RP, W - RP*2, RH, 4); ctx.fill()
      ctx.strokeStyle = 'rgba(30,70,140,0.45)'; ctx.lineWidth = 0.6; ctx.stroke()

      ctx.font = '10px monospace'
      ctx.fillStyle = '#3a6aaa';  ctx.fillText(`p = [${Math.round(ship.x)}, ${Math.round(ship.y)}]`, RP+10, H - RH + 10)
      ctx.fillStyle = '#f0d44a';  ctx.fillText(`v = [${fmt(ship.vx)}, ${fmt(ship.vy)}]`, RP+10, H - RH + 24)
      ctx.fillStyle = '#88aacc';  ctx.fillText(`|v| = ${fmt(vm5)}`, RP+185, H - RH + 10)
      ctx.fillStyle = '#4af08a';  ctx.fillText(`θ = ${fmtDeg(ship.angle)}°`, RP+185, H - RH + 24)

      const C = fmt(Math.cos(ship.angle)), S = fmt(Math.sin(ship.angle))
      ctx.fillStyle = '#4af08a'
      ctx.fillText(`R(θ)  ⎡ ${C}  ${fmt(-Math.sin(ship.angle))} ⎤`, RP+308, H - RH + 10)
      ctx.fillText(`      ⎣ ${S}    ${C} ⎦`, RP+308, H - RH + 24)

      const wCfgR = WAVES[Math.min(gs.wave - 1, WAVES.length - 1)]
      ctx.fillStyle = wCfgR.hex; ctx.font = 'bold 10px monospace'
      const wLabel = `W${gs.wave} · ${wCfgR.concept}`
      ctx.fillText(wLabel, W - RP - ctx.measureText(wLabel).width - 12, H - RH + 17)

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [phase, mathMode, showFlash])

  const cycleMode = () => setMathMode(m => ({ all:'vectors', vectors:'matrix', matrix:'none', none:'all' }[m]))
  const modeLabel = { all:'ALL MATH', vectors:'VECTORS', matrix:'MATRIX', none:'NONE' }[mathMode]
  const modeColor = { all:'#4af08a', vectors:'#f0d44a', matrix:'#4ac8ff', none:'#3a5a6a' }[mathMode]
  const wCfgUi = WAVES[Math.min(wave - 1, WAVES.length - 1)]

  return (
    <div style={{ position:'fixed', inset:0, background:'#000913', overflow:'hidden' }}>
      <canvas ref={canvasRef} style={{ display:'block' }} />

      {/* ── Back ── */}
      <Link to="/games" style={{ position:'absolute', top:14, left:14, display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:6, background:'rgba(0,8,22,0.80)', border:'1px solid rgba(60,120,200,0.28)', color:'#4a7ab0', fontSize:11, fontWeight:700, letterSpacing:'0.05em', textDecoration:'none', fontFamily:'monospace' }}>
        <ArrowLeft size={12} /> GAMES
      </Link>

      {/* ── HUD top-right ── */}
      <div style={{ position:'absolute', top:14, right:14, display:'flex', alignItems:'center', gap:10, background:'rgba(0,8,22,0.80)', border:'1px solid rgba(30,70,140,0.38)', borderRadius:6, padding:'6px 14px', fontFamily:'monospace' }}>
        <span style={{ color:'#4a9af0', fontSize:11 }}>SCORE <span style={{ color:'#fff', fontWeight:700 }}>{score}</span></span>
        <span style={{ color:'#2a4060' }}>|</span>
        {Array.from({ length: Math.max(0, lives) }, (_, i) => (
          <div key={i} style={{ width:10, height:10, clipPath:'polygon(50% 0%,85% 90%,15% 90%)', background:'#4a9af0', flexShrink:0 }} />
        ))}
        <span style={{ color:'#4af08a', fontSize:10, fontWeight:700, letterSpacing:'0.1em' }}>W{wave}</span>
        <span style={{ color: wCfgUi.hex, fontSize:9, letterSpacing:'0.08em' }}>{wCfgUi.concept}</span>
      </div>

      {/* ── Math mode toggle (top center) ── */}
      <button onClick={cycleMode} style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', padding:'6px 16px', background:'rgba(0,8,22,0.80)', border:`1px solid ${modeColor}44`, borderRadius:6, color:modeColor, fontSize:10, fontWeight:700, cursor:'pointer', letterSpacing:'0.12em', fontFamily:'monospace' }}>
        MATH: {modeLabel}
      </button>

      {/* ── Flash message ── */}
      {flash && (
        <>
          <div style={{ position:'absolute', top:'38%', left:'50%', transform:'translate(-50%,-50%)', color:flash.color, fontSize:28, letterSpacing:5, fontWeight:'bold', textShadow:`0 0 30px ${flash.color}`, pointerEvents:'none', fontFamily:'monospace', whiteSpace:'nowrap' }}>
            {flash.msg}
          </div>
          <div style={{ position:'absolute', top:'calc(38% + 28px)', left:'50%', transform:'translateX(-50%)', color:'rgba(200,220,255,0.5)', fontSize:10, fontFamily:'monospace', pointerEvents:'none', whiteSpace:'nowrap' }}>
            {wCfgUi.tip}
          </div>
        </>
      )}

      {/* ── Intro ── */}
      {phase === 'intro' && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,5,15,0.93)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, fontFamily:'monospace' }}>
          <div style={{ fontSize:28, color:'#7ab8f0', letterSpacing:6 }}>VECTOR ASTEROIDS</div>
          <div style={{ fontSize:10, color:'#3a6a9a', letterSpacing:3 }}>LINEAR ALGEBRA THROUGH PLAY</div>
          <div style={{ fontSize:9, color:'#2a4a6a', marginTop:4, textAlign:'center', lineHeight:1.9 }}>
            <span style={{color:'#f0d44a'}}>yellow = velocity vector</span>&nbsp;·&nbsp;
            <span style={{color:'#4ac8ff'}}>cyan = heading</span>&nbsp;·&nbsp;
            <span style={{color:'#ff8c4a'}}>orange = thrust addition</span>&nbsp;·&nbsp;
            <span style={{color:'#4af08a'}}>green = rotation matrix</span><br/>
            the arrows drawn on screen are the actual math running underneath
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:6, maxWidth:460 }}>
            {[
              { icon:'v', color:'#f0d44a', t:'VELOCITY VECTOR',  b:'thrust adds a small vector to v each frame' },
              { icon:'R', color:'#4af08a', t:'ROTATION MATRIX',  b:'2×2 matrix — every rotation is [[cos,-sin],[sin,cos]]' },
              { icon:'+', color:'#ff8c4a', t:'VECTOR ADDITION',  b:'new velocity = old v + thrust — shown head-to-tail' },
              { icon:'λ', color:'#f0a44a', t:'EIGENVECTOR',      b:'v ∥ heading: velocity stays on that line indefinitely' },
            ].map(({ icon, color, t, b }) => (
              <div key={t} style={{ background:'rgba(4,10,24,0.8)', border:'0.5px solid rgba(30,70,140,0.4)', borderRadius:5, padding:'8px 10px' }}>
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

      {/* ── Game over ── */}
      {phase === 'dead' && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,5,15,0.93)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, fontFamily:'monospace' }}>
          <div style={{ fontSize:26, color:'#f07a4a', letterSpacing:5 }}>GAME OVER</div>
          <div style={{ fontSize:14, color:'#4a7ab0' }}>SCORE: {score}</div>
          <div style={{ fontSize:9, color:'#2a4a6a', textAlign:'center', lineHeight:1.9, letterSpacing:1 }}>
            you navigated ℝ² with rotation matrices and vector addition<br/>
            every frame was a matrix multiply and a vector sum
          </div>
          <button onClick={startGame} style={{ marginTop:8, padding:'10px 28px', background:'transparent', border:'1px solid #3a6aaa', color:'#7ab8f0', fontSize:13, borderRadius:5, cursor:'pointer', letterSpacing:3 }}>
            RETRY
          </button>
        </div>
      )}
    </div>
  )
}
