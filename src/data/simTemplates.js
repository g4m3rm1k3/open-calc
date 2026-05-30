export const SIM_TEMPLATES = [
  {
    key: 'projectile',
    label: 'Projectile Motion',
    icon: '🎯',
    desc: 'Launch angle, drag, Euler integration',
    code: `// ─── Projectile Motion ──────────────────────────────────
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
    icon: '🌀',
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
    label: 'Double Pendulum',
    icon: '⚖️',
    desc: 'Chaotic motion, Lagrangian mechanics',
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
