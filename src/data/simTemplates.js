// ─── Template groups ─────────────────────────────────────────────────────────
// mode: '3d' → Three.js globals: scene, camera, renderer, controls, THREE
// mode: '2d' → Canvas2D globals: canvas, ctx, W, H

export const SIM_TEMPLATES = [
  // ── Applied ───────────────────────────────────────────────────────────────

  {
    key: 'atom',
    label: 'Bohr Atom',
    icon: '⚛️',
    group: 'Applied',
    mode: '3d',
    desc: 'Electron shells, orbital planes, nucleus rotation',
    code: `// ─── Bohr Atom Model ─────────────────────────────────────────
// Sodium (Na) has electron configuration 2-8-1
// Change SHELLS to model other elements: He=[2], C=[2,4], O=[2,6]

let nucleus, electronMeshes, angles

const SHELLS = [2, 8, 1]        // electrons per shell
const RADII  = [3.0, 5.5, 8.0]  // orbit radius (units)
const SPEEDS = [2.0, 1.2, 0.7]  // angular speed (rad/s)

// Orbital plane: two orthogonal basis vectors per shell
const ORBITS = [
  { u: [1,0,0], v: [0,0,1] },            // XZ plane (equatorial)
  { u: [1,0,0], v: [0,1,0] },            // XY plane (meridional)
  { u: [0.707,0,0.707], v: [0,1,0] },    // diagonal plane
]

function shellPos(si, angle) {
  const r = RADII[si]
  const { u, v } = ORBITS[si]
  return [
    r * (Math.cos(angle)*u[0] + Math.sin(angle)*v[0]),
    r * (Math.cos(angle)*u[1] + Math.sin(angle)*v[1]),
    r * (Math.cos(angle)*u[2] + Math.sin(angle)*v[2]),
  ]
}

function init() {
  scene.background = new THREE.Color(0x02060f)
  electronMeshes = []
  angles = []

  // Nucleus — red protons + blue neutrons
  nucleus = new THREE.Group()
  const pMat = new THREE.MeshPhongMaterial({ color: 0xff3355, emissive: 0x550011 })
  const nMat = new THREE.MeshPhongMaterial({ color: 0x3399ff, emissive: 0x001144 })
  for (let i = 0; i < 11; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), i < 6 ? pMat : nMat)
    m.position.set((Math.random()-0.5)*1.4, (Math.random()-0.5)*1.4, (Math.random()-0.5)*1.4)
    nucleus.add(m)
  }
  scene.add(nucleus)
  scene.add(new THREE.PointLight(0x8899ff, 5, 30))

  // Orbit rings
  SHELLS.forEach((count, si) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(RADII[si], 0.05, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x1a3055, transparent: true, opacity: 0.5 })
    )
    // Align ring to orbit plane: torus default is XY (Z normal); rotate to plane normal
    const { u, v } = ORBITS[si]
    const nx = u[1]*v[2] - u[2]*v[1]
    const ny = u[2]*v[0] - u[0]*v[2]
    const nz = u[0]*v[1] - u[1]*v[0]
    ring.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(nx, ny, nz).normalize()
    )
    scene.add(ring)

    for (let i = 0; i < count; i++) {
      const e = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 10, 10),
        new THREE.MeshPhongMaterial({ color: 0x00ddff, emissive: 0x003344 })
      )
      scene.add(e)
      electronMeshes.push({ mesh: e, shell: si })
      angles.push((2 * Math.PI * i) / count)
    }
  })

  camera.position.set(0, 5, 14)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  nucleus.rotation.y += dt * 0.4

  electronMeshes.forEach((e, i) => {
    angles[i] += dt * SPEEDS[e.shell]
    const [x, y, z] = shellPos(e.shell, angles[i])
    e.mesh.position.set(x, y, z)
  })

  renderer.render(scene, camera)
}`,
  },

  {
    key: 'graphing',
    label: 'Graphing Utility',
    icon: '📈',
    group: 'Applied',
    mode: '2d',
    desc: 'Plot math functions on a 2D canvas with axes and grid',
    code: `// ─── 2D Graphing Utility ─────────────────────────────────────
// Add functions to FUNCTIONS to plot them.
// fn: receives x (in math units), returns y.

const FUNCTIONS = [
  { fn: function(x) { return Math.sin(x) },          color: '#00eeff', label: 'sin(x)'     },
  { fn: function(x) { return Math.cos(x) },          color: '#ff4488', label: 'cos(x)'     },
  { fn: function(x) { return x*x / 8 },              color: '#aaff44', label: 'x\xB2 / 8'  },
  { fn: function(x) { return Math.sin(2*x) * 0.5 },  color: '#ff8800', label: 'sin(2x)/2'  },
]

let scale = 48    // pixels per unit
let ox, oy        // origin pixel position

function init() {
  ox = W / 2
  oy = H / 2
}

function update(dt) {
  ctx.fillStyle = '#02060f'
  ctx.fillRect(0, 0, W, H)

  // Minor grid
  ctx.lineWidth = 1
  ctx.strokeStyle = '#0a1825'
  for (let x = ox % scale; x < W; x += scale) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = oy % scale; y < H; y += scale) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Axes
  ctx.lineWidth = 2; ctx.strokeStyle = '#1e3a50'
  ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke()

  // Axis arrow tips
  ctx.fillStyle = '#1e3a50'
  ctx.beginPath(); ctx.moveTo(W-2, oy); ctx.lineTo(W-10, oy-5); ctx.lineTo(W-10, oy+5); ctx.fill()
  ctx.beginPath(); ctx.moveTo(ox, 2); ctx.lineTo(ox-5, 10); ctx.lineTo(ox+5, 10); ctx.fill()

  // Unit tick labels
  ctx.fillStyle = '#2a4a5a'; ctx.font = '10px monospace'
  for (let u = -20; u <= 20; u++) {
    if (u === 0) continue
    const px = ox + u * scale
    if (px < 6 || px > W - 6) continue
    ctx.beginPath(); ctx.moveTo(px, oy-3); ctx.lineTo(px, oy+3)
    ctx.strokeStyle = '#1e3a50'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillText(u, px - (u < 0 ? 8 : 4), oy + 14)
  }

  // Plot each function
  FUNCTIONS.forEach(function(f) {
    ctx.strokeStyle = f.color
    ctx.lineWidth = 2
    ctx.beginPath()
    let started = false
    for (let px = 0; px <= W; px++) {
      const x = (px - ox) / scale
      const y = f.fn(x)
      if (!isFinite(y) || Math.abs(y) > H) { started = false; continue }
      const py = oy - y * scale
      if (!started) { ctx.moveTo(px, py); started = true }
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  })

  // Legend
  FUNCTIONS.forEach(function(f, i) {
    ctx.fillStyle = f.color; ctx.fillRect(14, 14 + i*22, 20, 3)
    ctx.fillStyle = '#889aaa'; ctx.font = '11px monospace'
    ctx.fillText(f.label, 40, 20 + i*22)
  })
}`,
  },

  {
    key: 'gcode',
    label: 'GCode Backplotter',
    icon: '🔩',
    group: 'Applied',
    mode: '2d',
    desc: 'Animate a CNC toolpath — G0 rapid moves and G1 cuts',
    code: `// ─── GCode Backplotter ───────────────────────────────────────
// Edit segs to define your toolpath.
// type 'rapid' = G0 (fast positioning, cyan dashed)
// type 'cut'   = G1 (machining feed, white solid)
// Coordinates are in mm — any scale, auto-fits to canvas.

const segs = [
  // Outer square profile
  {type:'rapid', x1:0,  y1:0,  x2:0,  y2:0},
  {type:'rapid', x1:0,  y1:0,  x2:50, y2:0},
  {type:'cut',   x1:50, y1:0,  x2:50, y2:50},
  {type:'cut',   x1:50, y1:50, x2:0,  y2:50},
  {type:'cut',   x1:0,  y1:50, x2:0,  y2:0},

  // Inner pocket
  {type:'rapid', x1:0,  y1:0,  x2:10, y2:10},
  {type:'cut',   x1:10, y1:10, x2:40, y2:10},
  {type:'cut',   x1:40, y1:10, x2:40, y2:40},
  {type:'cut',   x1:40, y1:40, x2:10, y2:40},
  {type:'cut',   x1:10, y1:40, x2:10, y2:10},

  // Cross-hatch
  {type:'rapid', x1:10, y1:10, x2:10, y2:25},
  {type:'cut',   x1:10, y1:25, x2:40, y2:25},
  {type:'rapid', x1:10, y1:25, x2:25, y2:10},
  {type:'cut',   x1:25, y1:10, x2:25, y2:40},
]

// Auto-scale bounding box to canvas
let minX=1e9, minY=1e9, maxX=-1e9, maxY=-1e9
segs.forEach(function(s) {
  minX=Math.min(minX,s.x1,s.x2); minY=Math.min(minY,s.y1,s.y2)
  maxX=Math.max(maxX,s.x1,s.x2); maxY=Math.max(maxY,s.y1,s.y2)
})
const pad = 60
const sc  = Math.min((W-pad*2)/(maxX-minX||1), (H-pad*2)/(maxY-minY||1)) * 0.85
const offX = (W - (maxX-minX)*sc) / 2 - minX*sc
const offY = H - ((H - (maxY-minY)*sc) / 2 - minY*sc)

function toScreen(x, y) { return [x*sc+offX, -y*sc+offY] }

let progress = 0

function init() { progress = 0 }

function update(dt) {
  ctx.fillStyle = '#02060f'
  ctx.fillRect(0, 0, W, H)

  // Grid (in part units)
  const gs = sc * 10
  ctx.strokeStyle = '#0a1822'; ctx.lineWidth = 1
  for (let gx = offX%gs; gx < W; gx += gs) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke() }
  for (let gy = offY%gs; gy > 0; gy -= gs) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke() }

  // Animate toolpath
  if (progress < segs.length) progress += dt * 3.5

  segs.forEach(function(s, i) {
    if (i >= progress) return
    const p1 = toScreen(s.x1, s.y1), p2 = toScreen(s.x2, s.y2)
    ctx.strokeStyle = s.type === 'rapid' ? '#00aacc' : '#ddeeff'
    ctx.setLineDash(s.type === 'rapid' ? [6,4] : [])
    ctx.lineWidth = s.type === 'cut' ? 2 : 1
    ctx.beginPath()
    if (i < Math.floor(progress)) {
      ctx.moveTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1])
    } else {
      const t = progress - i
      ctx.moveTo(p1[0],p1[1])
      ctx.lineTo(p1[0]+(p2[0]-p1[0])*t, p1[1]+(p2[1]-p1[1])*t)
    }
    ctx.stroke(); ctx.setLineDash([])
  })

  // Animated tool head
  if (progress < segs.length) {
    const si = Math.floor(progress), frac = progress - si
    const s = segs[si]
    const p1 = toScreen(s.x1,s.y1), p2 = toScreen(s.x2,s.y2)
    const tx = p1[0]+(p2[0]-p1[0])*frac, ty = p1[1]+(p2[1]-p1[1])*frac
    ctx.beginPath(); ctx.arc(tx,ty,5,0,Math.PI*2); ctx.fillStyle='#ffcc00'; ctx.fill()
    ctx.beginPath(); ctx.arc(tx,ty,10,0,Math.PI*2)
    ctx.strokeStyle='rgba(255,200,0,0.3)'; ctx.lineWidth=2; ctx.stroke()
  }

  // Legend
  ctx.font = '11px monospace'
  ctx.fillStyle='#00aacc'; ctx.fillRect(14,14,20,2); ctx.fillStyle='#5588aa'; ctx.fillText('G0  Rapid',40,19)
  ctx.fillStyle='#ddeeff'; ctx.fillRect(14,28,20,2); ctx.fillStyle='#5588aa'; ctx.fillText('G1  Cut',  40,33)
}`,
  },

  {
    key: 'pendulum2d',
    label: 'Double Pendulum',
    icon: '🌀',
    group: 'Applied',
    mode: '2d',
    desc: 'Chaotic motion on a 2D canvas — RK4 with coloured trail',
    code: `// ─── 2D Double Pendulum ──────────────────────────────────────
// A classic chaotic system: tiny changes in initial angles
// produce wildly different trajectories over time.
// Edit A1_0 and A2_0 to see the sensitivity.

const G  = 980    // pixels/s² (scaled for canvas coords)
const L1 = 150, L2 = 110    // arm lengths (px)
const M1 = 3,   M2 = 2      // masses

// Initial angles (radians from vertical)
const A1_0 = Math.PI * 0.55
const A2_0 = Math.PI * 0.85

let a1, a2, v1, v2
let trail = []

function derivs(a1, a2, v1, v2) {
  const d  = 2*M1 + M2 - M2*Math.cos(2*a1-2*a2)
  const da1 = (-G*(2*M1+M2)*Math.sin(a1)
    - M2*G*Math.sin(a1-2*a2)
    - 2*Math.sin(a1-a2)*M2*(v2*v2*L2 + v1*v1*L1*Math.cos(a1-a2))) / (L1*d)
  const da2 = (2*Math.sin(a1-a2)*(
    v1*v1*L1*(M1+M2) + G*(M1+M2)*Math.cos(a1) + v2*v2*L2*M2*Math.cos(a1-a2)
  )) / (L2*d)
  return [v1, v2, da1, da2]
}

function rk4(dt) {
  const [k1a, k1b, k1c, k1d] = derivs(a1, a2, v1, v2)
  const [k2a, k2b, k2c, k2d] = derivs(a1+k1a*dt/2, a2+k1b*dt/2, v1+k1c*dt/2, v2+k1d*dt/2)
  const [k3a, k3b, k3c, k3d] = derivs(a1+k2a*dt/2, a2+k2b*dt/2, v1+k2c*dt/2, v2+k2d*dt/2)
  const [k4a, k4b, k4c, k4d] = derivs(a1+k3a*dt,   a2+k3b*dt,   v1+k3c*dt,   v2+k3d*dt)
  a1 += (dt/6)*(k1a+2*k2a+2*k3a+k4a)
  a2 += (dt/6)*(k1b+2*k2b+2*k3b+k4b)
  v1 += (dt/6)*(k1c+2*k2c+2*k3c+k4c)
  v2 += (dt/6)*(k1d+2*k2d+2*k3d+k4d)
}

function init() {
  a1 = A1_0; a2 = A2_0; v1 = 0; v2 = 0
  trail = []
}

function update(dt) {
  const steps = 8
  for (let i = 0; i < steps; i++) rk4(dt/steps)

  const ox = W/2, oy = H * 0.28
  const x1 = ox + L1*Math.sin(a1),  y1 = oy + L1*Math.cos(a1)
  const x2 = x1 + L2*Math.sin(a2),  y2 = y1 + L2*Math.cos(a2)

  trail.push({ x: x2, y: y2 })
  if (trail.length > 600) trail.shift()

  // Fade trail into background
  ctx.fillStyle = 'rgba(2,6,15,0.22)'
  ctx.fillRect(0, 0, W, H)

  // Gradient trail
  for (let i = 1; i < trail.length; i++) {
    const frac = i / trail.length
    const hue  = Math.round(200 + frac * 140)
    const lum  = Math.round(35  + frac * 55)
    ctx.strokeStyle = 'hsl(' + hue + ',100%,' + lum + '%)'
    ctx.lineWidth   = 1 + frac * 2.5
    ctx.beginPath()
    ctx.moveTo(trail[i-1].x, trail[i-1].y)
    ctx.lineTo(trail[i].x,   trail[i].y)
    ctx.stroke()
  }

  // Arms
  ctx.strokeStyle = '#446680'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x1, y1); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()

  // Pivot + bobs
  ctx.fillStyle = '#778899'
  ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#22ccff'
  ctx.beginPath(); ctx.arc(x1, y1, 8*Math.sqrt(M1/M2), 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#ff44aa'
  ctx.beginPath(); ctx.arc(x2, y2, 8, 0, Math.PI*2); ctx.fill()
}`,
  },

  {
    key: 'matrix3d',
    label: 'Matrix Transform',
    icon: '🔢',
    group: 'Applied',
    mode: '3d',
    desc: 'Visualize a 4×4 matrix deforming a 3D point cloud',
    code: `// ─── Linear Transformation Visualizer ────────────────────────
// The columns of a matrix show where the basis vectors land.
// Watch the unit-grid deform as it animates from I → M.
// Edit M (3×3 values, column-major) to try different transforms.

// M stored column-major: [col0row0, col0row1, col0row2,  col1…  col2…]
const M = [
  1.5,  0.3,  0,    // column 0 — where x-axis goes
  0.2,  1.0,  0,    // column 1 — where y-axis goes
  0,    0,    0.7,  // column 2 — where z-axis goes
]

function buildM4(s) {
  // Interpolate from identity matrix to M by factor s (0→1)
  return new THREE.Matrix4().set(
    1+(M[0]-1)*s, M[3]*s,       M[6]*s,       0,
    M[1]*s,       1+(M[4]-1)*s, M[7]*s,       0,
    M[2]*s,       M[5]*s,       1+(M[8]-1)*s, 0,
    0,            0,            0,            1
  )
}

let gridMeshes, origPos, t

function init() {
  scene.add(new THREE.GridHelper(16, 16, 0x1a2a44, 0x0d1122))
  t = 0; gridMeshes = []; origPos = []

  // Axis arrows showing identity basis
  const axes = [
    { d: [4,0,0], c: 0xff2244 },
    { d: [0,4,0], c: 0x22ff44 },
    { d: [0,0,4], c: 0x2244ff },
  ]
  axes.forEach(ax => {
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(...ax.d)]),
      new THREE.LineBasicMaterial({ color: ax.c })
    ))
  })

  // 5×5×5 grid of spheres (125 pts)
  const geo = new THREE.SphereGeometry(0.14, 7, 7)
  const mat = new THREE.MeshPhongMaterial({ color: 0x44aaff, emissive: 0x112233 })

  for (let xi = -2; xi <= 2; xi++) {
    for (let yi = -2; yi <= 2; yi++) {
      for (let zi = -2; zi <= 2; zi++) {
        const m = new THREE.Mesh(geo, mat)
        m.position.set(xi, yi, zi)
        scene.add(m)
        gridMeshes.push(m)
        origPos.push(new THREE.Vector3(xi, yi, zi))
      }
    }
  }

  camera.position.set(7, 6, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt * 0.7
  const s = Math.sin(t) * 0.5 + 0.5   // oscillates 0 → 1 → 0
  const m4 = buildM4(s)

  // Apply transform to each point's original position
  gridMeshes.forEach((m, i) => {
    m.position.copy(origPos[i]).applyMatrix4(m4)
  })

  renderer.render(scene, camera)
}`,
  },

  // ── Physics ───────────────────────────────────────────────────────────────

  {
    key: 'projectile',
    label: 'Projectile Motion',
    icon: '🎯',
    group: 'Physics',
    mode: '3d',
    desc: 'Launch angle, drag, Euler integration',
    code: `// ─── Projectile Motion ──────────────────────────────────────
// STATE — what describes our system?
let ball, trailLine
let trail = []
let vx, vy, t

// PARAMETERS — try changing these!
const SPEED = 15     // m/s  — initial launch speed
const ANGLE = 45     // deg  — launch angle above horizontal
const DRAG  = 0.015  // air resistance (0 = vacuum)
const G     = 9.8    // m/s²

const rad = ANGLE * Math.PI / 180

function init() {
  scene.add(new THREE.GridHelper(40, 20, 0x1a2a44, 0x0d1122))

  // Ground plane
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 40),
    new THREE.MeshLambertMaterial({ color: 0x0e1a2e })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // Ball
  ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x551111 })
  )
  ball.position.set(-12, 0.3, 0)
  scene.add(ball)

  // Reset state
  t = 0
  trail.length = 0
  vx = SPEED * Math.cos(rad)
  vy = SPEED * Math.sin(rad)
  if (trailLine) scene.remove(trailLine)
  trailLine = null

  camera.position.set(2, 5, 22)
  camera.lookAt(2, 3, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // Landed — hold the last frame
  if (ball.position.y < 0.3 && t > 0.1) {
    renderer.render(scene, camera)
    return
  }

  // ── FORCE ACCUMULATION ────────────────────────────────────
  const speed = Math.sqrt(vx * vx + vy * vy)
  const fx = -DRAG * speed * vx       // drag opposes velocity
  const fy = -G - DRAG * speed * vy   // gravity + drag

  // ── EULER STEP ────────────────────────────────────────────
  vx += fx * dt
  vy += fy * dt
  ball.position.x += vx * dt
  ball.position.y = Math.max(0.3, ball.position.y + vy * dt)
  t += dt

  // ── TRAIL ─────────────────────────────────────────────────
  trail.push(ball.position.clone())
  if (trail.length > 400) trail.shift()
  if (trailLine) scene.remove(trailLine)
  if (trail.length > 1) {
    trailLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(trail),
      new THREE.LineBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0.7 })
    )
    scene.add(trailLine)
  }

  // Log peak height once
  if (vy < 0 && vy > -0.1) console.log('Peak height: ' + ball.position.y.toFixed(2) + ' m')

  renderer.render(scene, camera)
}`,
  },
  {
    key: 'orbital',
    label: 'Orbital Mechanics',
    icon: '🌍',
    group: 'Physics',
    mode: '3d',
    desc: 'Gravity law, 2-body orbits, substep integration',
    code: `// ─── 2-Body Orbital Mechanics ───────────────────────────────
// STATE
let meshA, meshB
let pA = new THREE.Vector3(5, 0, 0),   pB = new THREE.Vector3(-5, 0, 0)
let vA = new THREE.Vector3(0, 0, 1.5), vB = new THREE.Vector3(0, 0, -1.5)
const trailA = [], trailB = []
let lineA, lineB

// PARAMETERS
const G  = 20    // scaled gravitational constant
const mA = 3     // mass of body A
const mB = 3     // mass of body B

function init() {
  scene.add(new THREE.GridHelper(30, 30, 0x111a33, 0x0a0f1e))
  camera.position.set(0, 18, 0)
  camera.lookAt(0, 0, 0)

  meshA = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0x4488ff, emissive: 0x112244 })
  )
  meshB = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0xff8844, emissive: 0x442211 })
  )
  scene.add(meshA, meshB)

  // Reset
  pA.set(5,0,0); pB.set(-5,0,0)
  vA.set(0,0,1.5); vB.set(0,0,-1.5)
  trailA.length = 0; trailB.length = 0
  if (lineA) scene.remove(lineA)
  if (lineB) scene.remove(lineB)

  renderer.render(scene, camera)
}

function update(dt) {
  // ── SUBSTEPS — smaller steps = more accurate orbit ────────
  const STEPS = 10
  const sub = dt / STEPS

  for (let s = 0; s < STEPS; s++) {
    const d = new THREE.Vector3().subVectors(pB, pA)
    const r2 = d.lengthSq() + 0.01   // softening to avoid singularity
    const r  = Math.sqrt(r2)
    const F  = G * mA * mB / r2

    const f = d.clone().normalize().multiplyScalar(F)
    vA.addScaledVector(f,  sub / mA)
    vB.addScaledVector(f, -sub / mB)
    pA.addScaledVector(vA, sub)
    pB.addScaledVector(vB, sub)
  }

  meshA.position.copy(pA)
  meshB.position.copy(pB)

  // ── TRAILS ────────────────────────────────────────────────
  trailA.push(pA.clone()); trailB.push(pB.clone())
  if (trailA.length > 500) { trailA.shift(); trailB.shift() }

  if (lineA) scene.remove(lineA)
  if (lineB) scene.remove(lineB)
  if (trailA.length > 1) {
    lineA = new THREE.Line(new THREE.BufferGeometry().setFromPoints(trailA),
      new THREE.LineBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.5 }))
    lineB = new THREE.Line(new THREE.BufferGeometry().setFromPoints(trailB),
      new THREE.LineBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0.5 }))
    scene.add(lineA, lineB)
  }

  renderer.render(scene, camera)
}`,
  },
  {
    key: 'spring',
    label: 'Spring-Mass System',
    icon: '⚡',
    group: 'Physics',
    mode: '3d',
    desc: "Hooke's law, damping, simple harmonic motion",
    code: `// ─── Spring-Mass System ─────────────────────────────────────
// STATE
let mass, anchor, springLine
let py = 0   // mass y-position (world units)
let vy = 0   // mass y-velocity

// PARAMETERS — try changing these!
const K    = 25    // spring constant N/m  (stiffer = faster oscillation)
const B    = 0.5   // damping coefficient  (0 = no energy loss)
const M    = 1.0   // mass kg
const REST = 3.0   // natural length of spring (m)

function init() {
  scene.add(new THREE.GridHelper(20, 20, 0x1a2a44, 0x111a33))
  camera.position.set(0, 0, 14)
  camera.lookAt(0, 0, 0)

  // Ceiling anchor
  anchor = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.3, 0.3),
    new THREE.MeshPhongMaterial({ color: 0x888888 })
  )
  anchor.position.set(0, 5, 0)
  scene.add(anchor)

  // Mass
  mass = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0x44aaff, emissive: 0x112233 })
  )
  scene.add(mass)

  // Spring line
  springLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(0, 5 - REST, 0)
    ]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
  )
  scene.add(springLine)

  // Initial condition: pull down 2m from rest
  py = anchor.position.y - REST - 2
  vy = 0

  renderer.render(scene, camera)
}

function update(dt) {
  const anchorY = anchor.position.y

  // ── HOOKE'S LAW: F = -k * (extension) ────────────────────
  const extension = (anchorY - py) - REST   // positive = stretched
  const Fspring   = K * extension
  const Fdamp     = -B * vy                  // damping opposes velocity
  const Fgrav     = -M * 9.8

  // ── EULER STEP ────────────────────────────────────────────
  const a = (Fspring + Fdamp + Fgrav) / M
  vy += a * dt
  py += vy * dt

  // ── UPDATE VISUALS ─────────────────────────────────────────
  mass.position.set(0, py, 0)

  const pts = [new THREE.Vector3(0, anchorY, 0), new THREE.Vector3(0, py, 0)]
  springLine.geometry.setFromPoints(pts)
  springLine.geometry.attributes.position.needsUpdate = true

  renderer.render(scene, camera)
}`,
  },
  {
    key: 'particles',
    label: 'Particle System',
    icon: '✨',
    group: 'Physics',
    mode: '3d',
    desc: 'Emergent behavior, forces, velocity fields',
    code: `// ─── Particle System ────────────────────────────────────────
// STATE
const N = 200     // number of particles
const pos = []    // THREE.Vector3 positions
const vel = []    // THREE.Vector3 velocities
let points        // THREE.Points mesh

// PARAMETERS
const GRAVITY  = -2
const DAMPING  = 0.98
const ATTRACT  = 5     // strength of center attraction
const SPAWN_Y  = 8

function init() {
  camera.position.set(0, 0, 22)
  camera.lookAt(0, 0, 0)

  // Create particle geometry
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(N * 3)
  const colors    = new Float32Array(N * 3)
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

  const mat = new THREE.PointsMaterial({
    size: 0.18, vertexColors: true,
    transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  points = new THREE.Points(geo, mat)
  scene.add(points)

  // Init particles
  for (let i = 0; i < N; i++) {
    pos[i] = new THREE.Vector3(
      (Math.random() - 0.5) * 12,
      SPAWN_Y + Math.random() * 4,
      (Math.random() - 0.5) * 4
    )
    vel[i] = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      -Math.random() * 2,
      0
    )
    // Color: blue → cyan based on index
    colors[i * 3]     = 0.1 + 0.4 * (i / N)  // R
    colors[i * 3 + 1] = 0.4 + 0.5 * (i / N)  // G
    colors[i * 3 + 2] = 1.0                   // B
  }
  geo.attributes.color.needsUpdate = true

  renderer.render(scene, camera)
}

function update(dt) {
  const posArr = points.geometry.attributes.position.array

  for (let i = 0; i < N; i++) {
    // ── FORCES ──────────────────────────────────────────────
    // Gravity
    vel[i].y += GRAVITY * dt
    // Weak center attraction
    vel[i].x -= pos[i].x * ATTRACT * dt * 0.01
    vel[i].z -= pos[i].z * ATTRACT * dt * 0.01
    // Damping
    vel[i].multiplyScalar(DAMPING)

    // ── EULER STEP ──────────────────────────────────────────
    pos[i].addScaledVector(vel[i], dt)

    // Reset particles that fall below ground
    if (pos[i].y < -8) {
      pos[i].set(
        (Math.random() - 0.5) * 12,
        SPAWN_Y,
        (Math.random() - 0.5) * 4
      )
      vel[i].set((Math.random()-0.5)*2, -Math.random(), 0)
    }

    posArr[i * 3]     = pos[i].x
    posArr[i * 3 + 1] = pos[i].y
    posArr[i * 3 + 2] = pos[i].z
  }

  points.geometry.attributes.position.needsUpdate = true
  renderer.render(scene, camera)
}`,
  },
  {
    key: 'pendulum',
    label: 'Double Pendulum 3D',
    icon: '⚖️',
    group: 'Physics',
    mode: '3d',
    desc: 'Chaotic motion, Lagrangian mechanics, Three.js',
    code: `// ─── Double Pendulum ────────────────────────────────────────
// Classic chaotic system — tiny differences in initial conditions
// lead to wildly different trajectories.

const G  = 9.8
const L1 = 3, L2 = 2.5   // pendulum lengths (m)
const M1 = 1, M2 = 1     // masses (kg)

// STATE — angles and angular velocities
let θ1 = Math.PI * 0.6   // angle of arm 1 from vertical
let θ2 = Math.PI * 0.9   // angle of arm 2 from arm 1
let ω1 = 0, ω2 = 0       // angular velocities

let pivot, bob1, bob2, arm1, arm2
const trail2 = [], trailLine2 = { ref: null }

function init() {
  camera.position.set(0, 0, 16)
  camera.lookAt(0, 0, 0)

  // Pivot
  pivot = new THREE.Mesh(
    new THREE.SphereGeometry(0.2), new THREE.MeshPhongMaterial({ color: 0x888888 })
  )
  pivot.position.set(0, 4, 0)
  scene.add(pivot)

  // Arms (lines)
  const lineMat = new THREE.LineBasicMaterial({ color: 0x666688 })
  arm1 = new THREE.Line(new THREE.BufferGeometry(), lineMat.clone())
  arm2 = new THREE.Line(new THREE.BufferGeometry(), lineMat.clone())
  scene.add(arm1, arm2)

  // Bobs
  bob1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0x44aaff })
  )
  bob2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0xff4488 })
  )
  scene.add(bob1, bob2)

  trail2.length = 0
  if (trailLine2.ref) scene.remove(trailLine2.ref)
  θ1 = Math.PI * 0.6; θ2 = Math.PI * 0.9; ω1 = 0; ω2 = 0

  renderer.render(scene, camera)
}

// Lagrangian equations of motion for double pendulum
function derivatives(t1, t2, w1, w2) {
  const μ = 1 + M1 / M2
  const dθ = t1 - t2
  const den1 = μ * L1 - L1 * Math.cos(dθ) ** 2
  const den2 = (L2 / L1) * den1

  const dw1 = (L2 * w2*w2 * Math.sin(dθ) - G*(μ*Math.sin(t1) - Math.cos(dθ)*Math.sin(t2))) /
              (den1 / M2)  // simplified
  const dw2 = (-L1 * w1*w1 * Math.sin(dθ) - G*(Math.sin(t2) - Math.cos(dθ)*Math.sin(t1))) /
              (den2 / M2)

  return [w1, w2, dw1 * (L1/L2), dw2]  // approximate for clarity
}

function update(dt) {
  // RK4 integration (4th order Runge-Kutta — much more accurate than Euler!)
  const h = Math.min(dt, 0.016)
  const [k1a, k1b, k1c, k1d] = derivatives(θ1, θ2, ω1, ω2)
  const [k2a, k2b, k2c, k2d] = derivatives(θ1 + h/2*k1a, θ2 + h/2*k1b, ω1 + h/2*k1c, ω2 + h/2*k1d)
  const [k3a, k3b, k3c, k3d] = derivatives(θ1 + h/2*k2a, θ2 + h/2*k2b, ω1 + h/2*k2c, ω2 + h/2*k2d)
  const [k4a, k4b, k4c, k4d] = derivatives(θ1 + h*k3a, θ2 + h*k3b, ω1 + h*k3c, ω2 + h*k3d)

  θ1 += h/6 * (k1a + 2*k2a + 2*k3a + k4a)
  θ2 += h/6 * (k1b + 2*k2b + 2*k3b + k4b)
  ω1 += h/6 * (k1c + 2*k2c + 2*k3c + k4c)
  ω2 += h/6 * (k1d + 2*k2d + 2*k3d + k4d)

  const px = pivot.position.x, py = pivot.position.y
  const x1 = px + L1 * Math.sin(θ1)
  const y1 = py - L1 * Math.cos(θ1)
  const x2 = x1 + L2 * Math.sin(θ2)
  const y2 = y1 - L2 * Math.cos(θ2)

  bob1.position.set(x1, y1, 0)
  bob2.position.set(x2, y2, 0)
  arm1.geometry.setFromPoints([pivot.position, bob1.position])
  arm2.geometry.setFromPoints([bob1.position, bob2.position])

  trail2.push(new THREE.Vector3(x2, y2, 0))
  if (trail2.length > 600) trail2.shift()
  if (trailLine2.ref) scene.remove(trailLine2.ref)
  if (trail2.length > 1) {
    trailLine2.ref = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(trail2),
      new THREE.LineBasicMaterial({ color: 0xff4488, transparent: true, opacity: 0.5 })
    )
    scene.add(trailLine2.ref)
  }

  renderer.render(scene, camera)
}`,
  },
]
