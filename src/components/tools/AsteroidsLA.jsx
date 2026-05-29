import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const TAU = Math.PI * 2
const SHIP_R = 13
const BULLET_SPEED = 500
const BULLET_LIFE = 1.5
const FRICTION = 0.9885
const THRUST = 280
const ROT_SPEED = 2.9
const MAX_SPEED = 420
const SHOOT_CD = 0.22
const SIZES = [52, 30, 16]

const WAVES = [
  { n: 3,  concept: 'VECTORS',       hex: '#22ddff', tip: 'Thrust adds to your velocity vector. The cyan arrow shows where you\'re headed.' },
  { n: 4,  concept: 'VECTORS',       hex: '#22ddff', tip: 'Speed = |v| = √(vₓ² + vᵧ²). See it pulse in the bottom-left.' },
  { n: 5,  concept: 'VECTORS',       hex: '#22ddff', tip: 'Vectors add. Fire thrust in any direction and feel it accumulate.' },
  { n: 4,  concept: 'DOT PRODUCT',   hex: '#ffaa22', tip: 'Watch the asteroid glow when your nose points toward it — that\'s a dot product.' },
  { n: 5,  concept: 'DOT PRODUCT',   hex: '#ffaa22', tip: 'v·w = |v||w|cos θ. Alignment = 1 when aimed, 0 when perpendicular.' },
  { n: 6,  concept: 'DOT PRODUCT',   hex: '#ffaa22', tip: 'Aligned shots score 2×. Pure projection onto the aim axis.' },
  { n: 4,  concept: 'TRANSFORMS',    hex: '#aa55ff', tip: 'The warp zone bends the grid. Your thrust bends with it — trust the math.' },
  { n: 5,  concept: 'TRANSFORMS',    hex: '#aa55ff', tip: 'Every vector in the zone is multiplied by a 2×2 matrix. Navigate through.' },
  { n: 6,  concept: 'TRANSFORMS',    hex: '#aa55ff', tip: 'det < 1 squishes space. det > 1 expands it. Watch the grid breathe.' },
  { n: 6,  concept: 'EIGENVECTORS',  hex: '#ff44aa', tip: 'Shoot along the glowing pink axis — that\'s the eigenvector. It never bends.' },
]

// Warp zone transform matrices (wave 7–9)
const ZONE_MATS = [
  [[1.5, 0.55], [0.0, 0.75]],
  [[0.85, 0.0], [0.5, 1.25]],
  [[Math.cos(0.45), -Math.sin(0.45)], [Math.sin(0.45), Math.cos(0.45)]],
  [[1.9, 0.0], [0.0, 0.52]],
]
const ZONE_COLORS = ['#aa44ff', '#ff4499', '#44aaff', '#44ffcc']

// ─── Math helpers ─────────────────────────────────────────────────────────────
const v2 = (x, y) => ({ x, y })
const vmag = v => Math.hypot(v.x, v.y)
const vnorm = v => { const m = vmag(v); return m > 0 ? v2(v.x / m, v.y / m) : v2(0, 0) }
const vdot = (a, b) => a.x * b.x + a.y * b.y
const wrapVal = (val, max) => ((val % max) + max) % max
const mat2v = (M, v) => v2(M[0][0] * v.x + M[0][1] * v.y, M[1][0] * v.x + M[1][1] * v.y)
const hexToRgba = (hex, a) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

// ─── Entity factories ─────────────────────────────────────────────────────────
let _nid = 1
function mkId() { return _nid++ }

function mkAsteroid(x, y, tier, vx, vy) {
  const a = Math.random() * TAU
  const spd = (Math.random() * 28 + 18) * (3.4 - tier) * 0.6
  const nv = 9 + Math.floor(Math.random() * 5)
  return {
    id: mkId(), x, y,
    vx: vx ?? Math.cos(a) * spd,
    vy: vy ?? Math.sin(a) * spd,
    tier, r: SIZES[tier - 1],
    rot: Math.random() * TAU,
    spin: (Math.random() - 0.5) * 1.3,
    eigAngle: Math.random() * Math.PI,
    verts: Array.from({ length: nv }, (_, i) => ({
      a: (i / nv) * TAU, r: 0.70 + Math.random() * 0.50,
    })),
    dotGlow: 0,
  }
}

function mkBullet(x, y, angle) {
  return { id: mkId(), x, y, vx: Math.cos(angle) * BULLET_SPEED, vy: Math.sin(angle) * BULLET_SPEED, life: BULLET_LIFE }
}

function mkParticle(x, y, angle, speed, life, color) {
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, max: life, color }
}

function burst(x, y, count, eigAngle, color) {
  const out = []
  for (let i = 0; i < count; i++) {
    let a
    if (eigAngle != null && i < count * 0.35) {
      a = eigAngle + (i % 2 === 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.45
    } else {
      a = Math.random() * TAU
    }
    out.push(mkParticle(x, y, a, 50 + Math.random() * 150, 0.45 + Math.random() * 0.65, color || '#8866ff'))
  }
  return out
}

function spawnWaveRocks(wave, W, H, sx, sy) {
  const n = WAVES[Math.min(wave - 1, WAVES.length - 1)].n
  return Array.from({ length: n }, () => {
    let x, y
    do { x = Math.random() * W; y = Math.random() * H }
    while (Math.hypot(x - sx, y - sy) < 160)
    return mkAsteroid(x, y, 1)
  })
}

function mkStars(W, H) {
  return Array.from({ length: 210 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.4 + 0.2, a: Math.random() * 0.5 + 0.1,
  }))
}

function mkZone(wave, W, H) {
  const idx = (wave - 7) % ZONE_MATS.length
  const c = ZONE_COLORS[idx]
  return {
    x: W * 0.12 + Math.random() * W * 0.25,
    y: H * 0.12 + Math.random() * H * 0.25,
    w: 190 + Math.random() * 130,
    h: 160 + Math.random() * 110,
    matrix: ZONE_MATS[idx], color: c, alpha: 0,
  }
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function arrow(ctx, x1, y1, x2, y2, hs = 9) {
  const dx = x2 - x1, dy = y2 - y1
  const a = Math.atan2(dy, dx)
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - hs * Math.cos(a - 0.38), y2 - hs * Math.sin(a - 0.38))
  ctx.lineTo(x2 - hs * Math.cos(a + 0.38), y2 - hs * Math.sin(a + 0.38))
  ctx.closePath(); ctx.fill()
}

function drawGrid(ctx, W, H) {
  const G = 70
  ctx.save(); ctx.lineWidth = 0.5
  for (let x = G / 2; x < W; x += G) {
    const major = Math.round(x / G) % 5 === 0
    ctx.strokeStyle = major ? 'rgba(40,85,170,0.65)' : 'rgba(22,42,100,0.42)'
    if (major) { ctx.shadowColor = 'rgba(60,120,255,0.22)'; ctx.shadowBlur = 4 } else { ctx.shadowBlur = 0 }
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = G / 2; y < H; y += G) {
    const major = Math.round(y / G) % 5 === 0
    ctx.strokeStyle = major ? 'rgba(40,85,170,0.65)' : 'rgba(22,42,100,0.42)'
    if (major) { ctx.shadowColor = 'rgba(60,120,255,0.22)'; ctx.shadowBlur = 4 } else { ctx.shadowBlur = 0 }
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  ctx.restore()
}

function drawZone(ctx, zone, wave) {
  if (zone.alpha < 0.02) return
  const { x, y, w, h, color, matrix, alpha } = zone
  ctx.save(); ctx.globalAlpha = alpha

  // Zone fill
  ctx.fillStyle = hexToRgba(color, 0.07)
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill()

  // Warped grid inside
  ctx.save()
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
  const cx = x + w / 2, cy = y + h / 2
  const G = 55; const steps = 7
  ctx.strokeStyle = hexToRgba(color, 0.55); ctx.lineWidth = 0.7
  ctx.shadowColor = color; ctx.shadowBlur = 5
  for (let i = -steps; i <= steps; i++) {
    const p0 = mat2v(matrix, v2(-steps * G, i * G))
    const p1 = mat2v(matrix, v2(steps * G, i * G))
    ctx.beginPath(); ctx.moveTo(cx + p0.x, cy + p0.y); ctx.lineTo(cx + p1.x, cy + p1.y); ctx.stroke()
    const q0 = mat2v(matrix, v2(i * G, -steps * G))
    const q1 = mat2v(matrix, v2(i * G, steps * G))
    ctx.beginPath(); ctx.moveTo(cx + q0.x, cy + q0.y); ctx.lineTo(cx + q1.x, cy + q1.y); ctx.stroke()
  }
  // Transformed basis vectors
  ctx.lineWidth = 2.5
  const iT = mat2v(matrix, v2(G * 1.2, 0))
  const jT = mat2v(matrix, v2(0, -G * 1.2))
  ctx.shadowColor = '#ff4466'; ctx.shadowBlur = 14
  ctx.strokeStyle = '#ff4466'; ctx.fillStyle = '#ff4466'
  arrow(ctx, cx, cy, cx + iT.x, cy + iT.y, 8)
  ctx.shadowColor = '#44ff88'; ctx.shadowBlur = 14
  ctx.strokeStyle = '#44ff88'; ctx.fillStyle = '#44ff88'
  arrow(ctx, cx, cy, cx + jT.x, cy + jT.y, 8)
  ctx.restore()

  // Border
  ctx.shadowColor = color; ctx.shadowBlur = 14
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  ctx.setLineDash([6, 5])
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

function drawBasisVectors(ctx, W, H) {
  const ox = W * 0.5, oy = H * 0.5, L = 65
  ctx.save()
  ctx.shadowColor = '#ff4466'; ctx.shadowBlur = 16
  ctx.strokeStyle = '#ff4466'; ctx.fillStyle = '#ff4466'; ctx.lineWidth = 2.2
  arrow(ctx, ox, oy, ox + L, oy)
  ctx.font = 'bold 11px monospace'; ctx.fillStyle = '#ff6688'
  ctx.fillText('î', ox + L + 5, oy + 4)
  ctx.shadowColor = '#44ff88'; ctx.shadowBlur = 16
  ctx.strokeStyle = '#44ff88'; ctx.fillStyle = '#44ff88'
  arrow(ctx, ox, oy, ox, oy - L)
  ctx.fillStyle = '#66ffaa'; ctx.fillText('ĵ', ox + 4, oy - L - 4)
  // Origin dot
  ctx.shadowColor = '#aaddff'; ctx.shadowBlur = 10
  ctx.fillStyle = '#aaddff'
  ctx.beginPath(); ctx.arc(ox, oy, 3, 0, TAU); ctx.fill()
  ctx.restore()
}

function drawAsteroid(ctx, ast, wave) {
  const { x, y, r, rot, verts, dotGlow, eigAngle } = ast
  ctx.save(); ctx.translate(x, y)

  // Dot product halo (wave 4+)
  if (wave >= 4 && dotGlow > 0.05) {
    const g = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.8)
    g.addColorStop(0, `rgba(255,150,0,${dotGlow * 0.45})`)
    g.addColorStop(1, 'rgba(255,100,0,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.8, 0, TAU); ctx.fill()
  }

  // Body
  ctx.rotate(rot)
  ctx.shadowColor = `rgba(130,90,255,${0.45 + dotGlow * 0.35})`; ctx.shadowBlur = 7 + dotGlow * 14
  ctx.strokeStyle = `rgba(185,145,255,${0.72 + dotGlow * 0.28})`
  ctx.fillStyle = `rgba(38,18,82,${0.88 + dotGlow * 0.1})`
  ctx.lineWidth = 1.6
  ctx.beginPath()
  verts.forEach((v, i) => {
    const px = Math.cos(v.a) * r * v.r, py = Math.sin(v.a) * r * v.r
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  })
  ctx.closePath(); ctx.fill(); ctx.stroke()

  // Eigenvector axis (wave 10+)
  if (wave >= 10) {
    ctx.rotate(-rot)
    ctx.save(); ctx.rotate(eigAngle)
    ctx.shadowColor = '#ff44cc'; ctx.shadowBlur = 12
    ctx.strokeStyle = 'rgba(255,68,204,0.88)'; ctx.lineWidth = 1.6
    ctx.setLineDash([5, 4])
    ctx.beginPath(); ctx.moveTo(-r * 1.25, 0); ctx.lineTo(r * 1.25, 0); ctx.stroke()
    ctx.setLineDash([])
    // Arrow tips
    ctx.fillStyle = '#ff44cc'
    ctx.beginPath(); ctx.arc(-r * 1.25, 0, 3, 0, TAU); ctx.fill()
    ctx.beginPath(); ctx.arc(r * 1.25, 0, 3, 0, TAU); ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

function drawShip(ctx, ship) {
  if (ship.dead) return
  if (ship.invincible > 0 && Math.floor(ship.invincible * 9) % 2 === 0) return
  const { x, y, angle, thrusting } = ship
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2)

  if (thrusting) {
    const fl = 10 + Math.random() * 12
    ctx.save()
    ctx.shadowColor = '#ff7700'; ctx.shadowBlur = 20
    const g = ctx.createLinearGradient(0, 8, 0, 8 + fl)
    g.addColorStop(0, 'rgba(255,160,40,0.85)')
    g.addColorStop(1, 'rgba(255,80,0,0)')
    ctx.fillStyle = g; ctx.strokeStyle = 'rgba(255,140,60,0.6)'; ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-5, 8); ctx.lineTo(0, 8 + fl); ctx.lineTo(5, 8)
    ctx.fill(); ctx.stroke()
    ctx.restore()
  }

  ctx.shadowColor = '#99ddff'; ctx.shadowBlur = 18
  ctx.strokeStyle = '#cceeFF'; ctx.fillStyle = 'rgba(14,45,110,0.85)'; ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(0, -SHIP_R)
  ctx.lineTo(SHIP_R * 0.72, SHIP_R * 0.82)
  ctx.lineTo(0, SHIP_R * 0.38)
  ctx.lineTo(-SHIP_R * 0.72, SHIP_R * 0.82)
  ctx.closePath()
  ctx.fill(); ctx.stroke()

  // Center dot
  ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 6; ctx.fillStyle = '#88ccff'
  ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, TAU); ctx.fill()
  ctx.restore()
}

function drawVelocityArrow(ctx, ship) {
  if (ship.dead) return
  const { x, y, vx, vy } = ship
  const spd = Math.hypot(vx, vy)
  if (spd < 8) return
  const scale = Math.min(spd * 0.21, 85)
  const nx = vx / spd, ny = vy / spd
  ctx.save()
  ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 16
  ctx.strokeStyle = '#00ffff'; ctx.fillStyle = '#00ffff'; ctx.lineWidth = 2.2
  arrow(ctx, x, y, x + nx * scale, y + ny * scale, 9)
  // Velocity label near tip
  ctx.font = 'bold 9px monospace'
  ctx.shadowBlur = 6; ctx.fillStyle = 'rgba(0,255,255,0.8)'
  ctx.fillText(`v`, x + nx * (scale + 14) - 4, y + ny * (scale + 14) + 3)
  ctx.restore()
}

function drawBullets(ctx, bullets) {
  bullets.forEach(b => {
    const a = Math.min(1, b.life / BULLET_LIFE)
    ctx.save()
    ctx.shadowColor = '#ffffaa'; ctx.shadowBlur = 14
    ctx.fillStyle = `rgba(255,255,160,${a})`
    ctx.beginPath(); ctx.arc(b.x, b.y, 2.8, 0, TAU); ctx.fill()
    ctx.restore()
  })
}

function drawParticles(ctx, particles) {
  particles.forEach(p => {
    const a = p.life / p.max
    ctx.save(); ctx.globalAlpha = a
    ctx.shadowColor = p.color; ctx.shadowBlur = 7
    ctx.fillStyle = p.color
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * a + 0.5, 0, TAU); ctx.fill()
    ctx.restore()
  })
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AsteroidsLA() {
  const canvasRef = useRef(null)
  const gs = useRef(null)
  const rafId = useRef(null)
  const keys = useRef({})
  const lastT = useRef(null)
  const uiTick = useRef(0)

  const [ui, setUi] = useState({
    wave: 1, score: 0, lives: 3, paused: false, gameOver: false,
    waveIntro: true, concept: WAVES[0].concept, hex: WAVES[0].hex, tip: WAVES[0].tip,
    alignment: 0, speed: 0, inZone: false,
  })

  // ── Init ──────────────────────────────────────────────────────────────────
  const newGame = useCallback(() => {
    const W = window.innerWidth, H = window.innerHeight
    const sx = W / 2, sy = H / 2
    gs.current = {
      W, H,
      ship: { x: sx, y: sy, vx: 0, vy: 0, angle: -Math.PI / 2, thrusting: false, invincible: 2, dead: false, respawn: 0 },
      bullets: [], asteroids: spawnWaveRocks(1, W, H, sx, sy), particles: [],
      zones: [], stars: mkStars(W, H),
      wave: 1, score: 0, lives: 3, shootCd: 0,
      waveIntro: true, introTimer: 2.2, gameOver: false, paused: false,
    }
    setUi(u => ({ ...u, wave: 1, score: 0, lives: 3, paused: false, gameOver: false, waveIntro: true, concept: WAVES[0].concept, hex: WAVES[0].hex, tip: WAVES[0].tip, alignment: 0, speed: 0 }))
  }, [])

  // ── Game loop ─────────────────────────────────────────────────────────────
  const tick = useCallback((ts) => {
    if (!gs.current) return
    const g = gs.current
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const now = ts / 1000
    const raw = lastT.current ? now - lastT.current : 0.016
    lastT.current = now
    const dt = Math.min(raw, 0.05)

    if (!g.paused && !g.gameOver) update(g, dt, keys.current)

    draw(ctx, g, dpr)

    // Throttle React state update to ~10fps
    uiTick.current++
    if (uiTick.current % 6 === 0) {
      const { ship, wave, score, lives, paused, gameOver, waveIntro } = g
      const cfg = WAVES[Math.min(wave - 1, WAVES.length - 1)]
      const spd = Math.hypot(ship.vx, ship.vy)
      let alignment = 0
      if (wave >= 4) {
        const aim = v2(Math.cos(ship.angle), Math.sin(ship.angle))
        g.asteroids.forEach(a => {
          const d = v2(a.x - ship.x, a.y - ship.y)
          const dn = vnorm(d)
          const al = Math.max(0, vdot(aim, dn))
          if (al > alignment) alignment = al
        })
      }
      const inZone = wave >= 7 && g.zones.some(z =>
        ship.x >= z.x && ship.x <= z.x + z.w && ship.y >= z.y && ship.y <= z.y + z.h
      )
      setUi({ wave, score, lives, paused, gameOver, waveIntro, concept: cfg.concept, hex: cfg.hex, tip: cfg.tip, alignment: Math.round(alignment * 100), speed: Math.round(spd), inZone })
    }

    rafId.current = requestAnimationFrame(tick)
  }, [])

  // ── Update ────────────────────────────────────────────────────────────────
  function update(g, dt, k) {
    const { W, H } = g
    let { ship, bullets, asteroids, particles, zones } = g

    // Wave intro countdown
    if (g.waveIntro) {
      g.introTimer -= dt
      if (g.introTimer <= 0) g.waveIntro = false
    }

    // Invincibility & respawn
    if (ship.invincible > 0) ship.invincible -= dt
    if (ship.dead) {
      ship.respawn -= dt
      if (ship.respawn <= 0) {
        ship.dead = false; ship.invincible = 2
        ship.x = W / 2; ship.y = H / 2; ship.vx = 0; ship.vy = 0
      }
    }

    if (!ship.dead) {
      // Rotation
      if (k['ArrowLeft'] || k['KeyA']) ship.angle -= ROT_SPEED * dt
      if (k['ArrowRight'] || k['KeyD']) ship.angle += ROT_SPEED * dt

      // Thrust — apply matrix transform inside zone
      const thrusting = k['ArrowUp'] || k['KeyW'] || k['ShiftLeft']
      ship.thrusting = thrusting
      if (thrusting) {
        let td = v2(Math.cos(ship.angle), Math.sin(ship.angle))
        const zone = zones.find(z => ship.x >= z.x && ship.x <= z.x + z.w && ship.y >= z.y && ship.y <= z.y + z.h)
        if (zone) td = mat2v(zone.matrix, td)
        ship.vx += td.x * THRUST * dt
        ship.vy += td.y * THRUST * dt
      }

      // Friction & speed cap
      ship.vx *= FRICTION; ship.vy *= FRICTION
      const spd = Math.hypot(ship.vx, ship.vy)
      if (spd > MAX_SPEED) { ship.vx = (ship.vx / spd) * MAX_SPEED; ship.vy = (ship.vy / spd) * MAX_SPEED }

      ship.x = wrapVal(ship.x + ship.vx * dt, W)
      ship.y = wrapVal(ship.y + ship.vy * dt, H)

      // Shoot
      g.shootCd -= dt
      if ((k['Space'] || k[' ']) && g.shootCd <= 0) {
        g.shootCd = SHOOT_CD
        bullets.push(mkBullet(ship.x, ship.y, ship.angle))
      }
    }

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i]
      b.x = wrapVal(b.x + b.vx * dt, W)
      b.y = wrapVal(b.y + b.vy * dt, H)
      b.life -= dt
      if (b.life <= 0) { bullets.splice(i, 1) }
    }

    // Asteroids
    const wave = g.wave
    const aim = v2(Math.cos(ship.angle), Math.sin(ship.angle))
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i]
      a.x = wrapVal(a.x + a.vx * dt, W)
      a.y = wrapVal(a.y + a.vy * dt, H)
      a.rot += a.spin * dt

      // Dot product glow
      if (wave >= 4) {
        const d = vnorm(v2(a.x - ship.x, a.y - ship.y))
        const al = Math.max(0, vdot(aim, d))
        a.dotGlow += (al - a.dotGlow) * dt * 5
      } else {
        a.dotGlow = 0
      }

      // Bullet collision
      let hit = false
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j]
        if (Math.hypot(b.x - a.x, b.y - a.y) < a.r) {
          bullets.splice(j, 1)
          hit = true
          // Eigenvector crack bonus
          const bdir = vnorm(v2(b.vx, b.vy))
          const eig = v2(Math.cos(a.eigAngle), Math.sin(a.eigAngle))
          const eigAlign = Math.abs(vdot(bdir, eig))
          const eigenCrack = wave >= 10 && eigAlign > 0.82

          // Score
          const baseScore = (4 - a.tier) * 50
          const dotBonus = wave >= 4 && a.dotGlow > 0.75 ? 2 : 1
          const eigBonus = eigenCrack ? 3 : 1
          g.score += baseScore * dotBonus * eigBonus

          // Particle burst
          const pColor = eigenCrack ? '#ff44cc' : (a.dotGlow > 0.75 ? '#ffaa22' : '#8866ff')
          const pCount = eigenCrack ? 28 : 14
          particles.push(...burst(a.x, a.y, pCount, eigenCrack ? a.eigAngle : null, pColor))

          // Split
          if (a.tier < 3) {
            const sp = a.tier + 1
            for (let k2 = 0; k2 < 2; k2++) {
              const sAngle = Math.random() * TAU
              const sspd = Math.random() * 40 + 25
              asteroids.push(mkAsteroid(a.x, a.y, sp, Math.cos(sAngle) * sspd, Math.sin(sAngle) * sspd))
            }
          }
          asteroids.splice(i, 1)
          break
        }
      }
      if (hit) continue

      // Ship collision
      if (!ship.dead && ship.invincible <= 0 && Math.hypot(a.x - ship.x, a.y - ship.y) < a.r + SHIP_R - 4) {
        g.lives--
        particles.push(...burst(ship.x, ship.y, 18, null, '#88aaff'))
        if (g.lives <= 0) {
          g.gameOver = true
        } else {
          ship.dead = true; ship.respawn = 2.2
        }
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx * dt; p.y += p.vy * dt
      p.vx *= 0.97; p.vy *= 0.97
      p.life -= dt
      if (p.life <= 0) particles.splice(i, 1)
    }

    // Zone fade-in
    zones.forEach(z => { if (z.alpha < 1) z.alpha = Math.min(1, z.alpha + dt * 0.9) })

    // Wave complete check
    if (!g.waveIntro && asteroids.length === 0) {
      g.wave++
      const nextWave = g.wave
      const cfg = WAVES[Math.min(nextWave - 1, WAVES.length - 1)]
      const sx = ship.x, sy = ship.y
      g.asteroids = spawnWaveRocks(nextWave, W, H, sx, sy)
      g.zones = nextWave >= 7 ? [mkZone(nextWave, W, H)] : []
      g.waveIntro = true
      g.introTimer = 2.5
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function draw(ctx, g, dpr) {
    const { W, H, ship, bullets, asteroids, particles, zones, wave } = g
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Background
    ctx.fillStyle = '#040812'
    ctx.fillRect(0, 0, W, H)

    // Stars
    g.stars.forEach(s => {
      ctx.fillStyle = `rgba(255,255,255,${s.a})`
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill()
    })

    // Grid
    drawGrid(ctx, W, H)

    // Basis vectors at canvas center
    drawBasisVectors(ctx, W, H)

    // Transform zones
    if (wave >= 7) zones.forEach(z => drawZone(ctx, z, wave))

    // Asteroids
    asteroids.forEach(a => drawAsteroid(ctx, a, wave))

    // Ship + velocity arrow
    drawShip(ctx, ship)
    if (wave >= 1) drawVelocityArrow(ctx, ship)

    // Bullets
    drawBullets(ctx, bullets)

    // Particles
    drawParticles(ctx, particles)
  }

  // ── Setup / teardown ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const W = window.innerWidth, H = window.innerHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
      if (gs.current) { gs.current.W = W; gs.current.H = H }
    }
    resize()
    window.addEventListener('resize', resize)

    const kd = e => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault()
      keys.current[e.code] = true
      keys.current[e.key] = true
      if (e.code === 'KeyP') { if (gs.current) gs.current.paused = !gs.current.paused }
    }
    const ku = e => { keys.current[e.code] = false; keys.current[e.key] = false }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)

    newGame()
    rafId.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
    }
  }, [newGame, tick])

  const waveCfg = WAVES[Math.min(ui.wave - 1, WAVES.length - 1)]

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#040812', overflow: 'hidden', userSelect: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* ── Back button ── */}
      <Link
        to="/games"
        style={{
          position: 'absolute', top: 14, left: 14,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8,
          background: 'rgba(10,20,50,0.72)', border: '1px solid rgba(100,160,255,0.2)',
          color: '#88bbff', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
          textDecoration: 'none', backdropFilter: 'blur(10px)',
          transition: 'border-color 0.2s',
        }}
      >
        <ArrowLeft size={13} /> GAMES
      </Link>

      {/* ── Score / lives ── */}
      <div style={{ position: 'absolute', top: 14, right: 14, textAlign: 'right' }}>
        <div style={{ color: '#aaccff', fontSize: 11, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>SCORE</div>
        <div style={{ color: '#ffffff', fontSize: 22, fontFamily: 'monospace', fontWeight: 900, textShadow: '0 0 12px rgba(100,180,255,0.6)' }}>{ui.score.toLocaleString()}</div>
        <div style={{ marginTop: 4, display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
          {Array.from({ length: Math.max(0, ui.lives) }, (_, i) => (
            <div key={i} style={{ width: 12, height: 12, clipPath: 'polygon(50% 0%, 85% 90%, 15% 90%)', background: '#88ddff', boxShadow: '0 0 6px #44aaff', flexShrink: 0 }} />
          ))}
        </div>
      </div>

      {/* ── Wave badge ── */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(10,20,50,0.72)', border: `1px solid ${hexToRgba(waveCfg.hex, 0.35)}`, borderRadius: 8, padding: '5px 14px', backdropFilter: 'blur(10px)' }}>
          <span style={{ color: waveCfg.hex, fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', fontFamily: 'monospace', textShadow: `0 0 8px ${waveCfg.hex}` }}>WAVE {ui.wave} · {waveCfg.concept}</span>
        </div>
        {ui.inZone && (
          <div style={{ background: 'rgba(170,68,255,0.15)', border: '1px solid rgba(170,68,255,0.5)', borderRadius: 6, padding: '3px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#cc88ff', fontFamily: 'monospace' }}>
            ⚡ WARP ZONE ACTIVE
          </div>
        )}
      </div>

      {/* ── Math HUD (bottom-left) ── */}
      <div style={{
        position: 'absolute', bottom: 20, left: 16,
        background: 'rgba(6,14,40,0.8)', border: '1px solid rgba(40,80,160,0.4)',
        borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(12px)',
        fontFamily: 'monospace', minWidth: 160,
      }}>
        <div style={{ fontSize: 9, color: '#4477aa', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 6 }}>VECTOR HUD</div>
        <div style={{ color: '#22ddff', fontSize: 12, fontWeight: 700, textShadow: '0 0 8px #00ffff' }}>
          v = [{Math.round(gs.current?.ship?.vx ?? 0)}, {Math.round(gs.current?.ship?.vy ?? 0)}]
        </div>
        <div style={{ color: '#88bbcc', fontSize: 11, marginTop: 2 }}>|v| = <span style={{ color: '#22ddff' }}>{ui.speed}</span> px/s</div>
        {ui.wave >= 4 && (
          <div style={{ marginTop: 6, borderTop: '1px solid rgba(40,80,160,0.3)', paddingTop: 6 }}>
            <div style={{ fontSize: 9, color: '#664400', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>DOT PRODUCT</div>
            <div style={{ fontSize: 11, color: '#ffaa22' }}>
              alignment: <span style={{ color: ui.alignment > 80 ? '#ffdd44' : '#ffaa22', fontWeight: 700 }}>{ui.alignment}%</span>
            </div>
            {ui.alignment > 80 && (
              <div style={{ fontSize: 9, color: '#ffdd44', marginTop: 2, letterSpacing: '0.08em' }}>✦ 2× SCORE BONUS</div>
            )}
          </div>
        )}
        {ui.wave >= 10 && (
          <div style={{ marginTop: 6, borderTop: '1px solid rgba(40,80,160,0.3)', paddingTop: 6 }}>
            <div style={{ fontSize: 9, color: '#660044', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>EIGENVECTORS</div>
            <div style={{ fontSize: 10, color: '#ff88cc', lineHeight: 1.4 }}>Shoot along the pink axis for 3× score</div>
          </div>
        )}
      </div>

      {/* ── Controls hint (bottom-right) ── */}
      <div style={{
        position: 'absolute', bottom: 20, right: 16,
        background: 'rgba(6,14,40,0.7)', border: '1px solid rgba(40,80,160,0.3)',
        borderRadius: 10, padding: '8px 12px', backdropFilter: 'blur(12px)',
        fontFamily: 'monospace', fontSize: 10, color: '#445577', lineHeight: 1.8,
      }}>
        <div><span style={{ color: '#6688aa' }}>W/↑</span> Thrust &nbsp; <span style={{ color: '#6688aa' }}>A/D</span> Rotate</div>
        <div><span style={{ color: '#6688aa' }}>SPACE</span> Fire &nbsp; <span style={{ color: '#6688aa' }}>P</span> Pause</div>
      </div>

      {/* ── Wave intro overlay ── */}
      {ui.waveIntro && !ui.gameOver && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(4,8,18,0.6)', backdropFilter: 'blur(2px)', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.22em', color: waveCfg.hex, fontFamily: 'monospace', marginBottom: 10, textShadow: `0 0 20px ${waveCfg.hex}` }}>
            WAVE {ui.wave} — {waveCfg.concept}
          </div>
          <div style={{ fontSize: 15, color: '#cce4ff', fontFamily: 'monospace', maxWidth: 440, textAlign: 'center', lineHeight: 1.6, padding: '0 24px' }}>
            {waveCfg.tip}
          </div>
        </div>
      )}

      {/* ── Pause overlay ── */}
      {ui.paused && !ui.gameOver && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,8,18,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#aaccff', fontFamily: 'monospace', letterSpacing: '0.15em', textShadow: '0 0 30px rgba(100,180,255,0.5)' }}>PAUSED</div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#445577', fontFamily: 'monospace' }}>Press P to resume</div>
        </div>
      )}

      {/* ── Game over ── */}
      {ui.gameOver && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,8,18,0.85)', backdropFilter: 'blur(6px)' }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: '#ff4444', fontFamily: 'monospace', marginBottom: 10 }}>GAME OVER</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#ffffff', fontFamily: 'monospace', textShadow: '0 0 40px rgba(100,180,255,0.5)', marginBottom: 6 }}>{ui.score.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#445577', fontFamily: 'monospace', marginBottom: 28, letterSpacing: '0.1em' }}>WAVE {ui.wave} · {waveCfg.concept}</div>
          <button
            onClick={newGame}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 10,
              background: 'rgba(20,60,140,0.8)', border: '1px solid rgba(100,160,255,0.4)',
              color: '#aaccff', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  )
}
