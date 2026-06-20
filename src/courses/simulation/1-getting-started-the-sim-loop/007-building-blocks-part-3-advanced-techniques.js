export default {
  id: 'sim1-007',
  slug: 'building-blocks-part-3-advanced-techniques',
  chapter: 'sim1',
  order: 7,
  title: 'Building Blocks Part 3 — Advanced Techniques',
  subtitle: 'Five self-contained recipes: Verlet integration, pivot hierarchies, motion trails, value noise, and boid flocking.',
  tags: ['three.js', 'verlet', 'constraints', 'pivot', 'hierarchy', 'trails', 'noise', 'fbm', 'boids', 'flocking', 'emergent'],
  aliases: 'verlet integration spring chain cloth pivot group trail circular buffer noise fBm turbulence boids flocking separation alignment cohesion advanced',
  timeToComplete: 30,
  coreConcept: 'Advanced simulations combine stable integration (Verlet), scene hierarchies (pivot Groups), memory-efficient history (circular buffers), coherent randomness (noise), and emergent behavior (boids). Each technique is a standalone pattern you can drop into any project.',
  prerequisites: ['building-blocks-part-2-motion-physics'],
  nextLesson: 'building-blocks-part-4-physics-geometry-interaction',

  hook: {
    question: 'Why does Euler integration explode for stiff springs while Verlet stays stable? Why do boids flock without any central controller?',
    realWorldContext: "Verlet integration is the backbone of every cloth sim and ragdoll in AAA games. Circular buffers for trails are in every particle VFX tool. Value noise powers procedural terrain in Minecraft, No Man's Sky, and every city builder. Boids model fish schools, bird murmurations, and autonomous vehicle platoons. These patterns aren't academic — they're production-grade.",
  },

  intuition: {
    prose: [
      "**Euler integration drifts under stiff forces; Verlet stays stable.** Euler: `pos += vel * dt; vel += accel * dt`. For a stiff spring, `vel` overshoots and then overshoots back, growing without bound. **Verlet** stores previous position instead of velocity: `newPos = pos + (pos − prevPos)*damping + accel*dt²`. The implicit velocity automatically contains the damping that Euler misses at large `dt`.",

      "**Three.js rotates every mesh around its local origin — pivot Groups let you rotate around any point.** Create an `Object3D` (the pivot) at the rotation point, add the mesh as a child offset from the pivot, then rotate the Group. This is how robotic arms, character skeletons, doors, and planets are all rigged — each joint is a Group and bones are offset child meshes.",

      "**A motion trail is a circular buffer of past positions drawn as a Line.** Instead of shifting the whole array every frame (O(N) cost), keep a `head` index and overwrite the oldest slot. When drawing, start from `head` and walk forward, wrapping at the end. Write new values into the existing `Float32Array` and set `needsUpdate = true` — never rebuild the geometry.",

      "**Value noise gives coherent randomness: nearby values are similar and the change is smooth.** `Math.random()` changes completely each frame — that's jitter. Value noise interpolates between random values on a grid using `smoothstep(t) = 3t² − 2t³`. Stacking octaves (each half the amplitude, double the frequency) produces **fBm** — the pattern behind mountains, clouds, fire, and wind.",

      "**Boids flock from three local rules with no central controller.** Each agent looks at neighbors within `PERCEPTION_RADIUS` and applies: **Separation** — steer away from neighbors that are too close; **Alignment** — match the average heading of neighbors; **Cohesion** — move toward the average position of neighbors. The V-formation and schooling behavior are emergent — they fall out of the math, not from explicit programming.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why Verlet is stable',
        body: 'Euler keeps explicit velocity: `v += a*dt`. For a stiff spring, `a` is large so `v` overshoots the equilibrium, then the restoring force accelerates it further — the system diverges. Verlet\'s implicit velocity `v ≈ (pos − prevPos)/dt` automatically shrinks near equilibrium because the displacement shrinks, giving it the damping that Euler lacks.',
      },
      {
        type: 'procedure',
        title: 'Constraint solver pattern',
        body: '```js\n// Run ITERATIONS times per frame — more iterations = stiffer\nfor (let iter = 0; iter < ITERATIONS; iter++) {\n  for each constraint (a, b, restLength) {\n    const dir = b.pos - a.pos\n    const dist = dir.length() || 1e-6\n    const correction = (dist - restLength) / dist * 0.5\n    if (!a.pinned) a.pos += dir * correction\n    if (!b.pinned) b.pos -= dir * correction\n  }\n}\n```',
      },
      {
        type: 'definition',
        title: 'Circular buffer',
        body: 'A fixed-size array treated as a ring: a `head` index marks the next write slot. After writing, `head = (head + 1) % SIZE`. The oldest entry is always at position `head` (about to be overwritten). Cost: O(1) write regardless of buffer length. Used for trails, ring buffers in audio DSP, network packet queues, and frame history.',
      },
      {
        type: 'insight',
        title: 'fBm amplitude sum',
        body: 'When stacking N octaves with amplitudes 1, ½, ¼, …, the total amplitude sums to `2 − 2^(1−N)` (geometric series). Dividing by this sum normalises the output to [-1, 1]. Without normalisation, adding octaves makes the signal louder — it looks like the noise has "more energy" but the range is unpredictable.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Five Recipes: Run Each, Then Modify',
        mathBridge: 'Each cell is a complete, working simulation. Read the prose first, predict what it does, then press Run. The most important learning happens when you change a constant and ask yourself why the result changed.',
        caption: 'All cells use 3D mode (Three.js). Named constants are at the top — change them freely.',
        initialProps: {
          initialCells: [

            // ── Cell 11: Verlet Integration ────────────────────────────────────
            {
              id: 11,
              cellTitle: 'Verlet integration — stable springs and cloth',
              mode: '3d',
              prose: [
                'Euler integration (`pos += vel * dt`) drifts under stiff forces: a spring with a high constant will overshoot, then overshoot again in the other direction, growing without bound. **Verlet** integration sidesteps this by deriving velocity implicitly from position history: `newPos = pos + (pos − prevPos) + accel * dt²`. The velocity is never stored explicitly.',
                'Why is Verlet more stable? Because the implicit velocity automatically contains the damping that Euler misses at large `dt`. For cloth simulations, spring networks, and any system with many connected constraints, Verlet (or its cousin Position-Based Dynamics) is the industry standard.',
                'The demo: a chain of nodes connected by distance constraints. Each node remembers its previous position. The floor is a hard constraint applied after each Verlet step.',
              ],
              code: `// ── Verlet Integration — spring chain ────────────────────────
// Each node remembers its previous position.
// Velocity is derived implicitly: v ≈ (pos − prevPos) / dt
// This makes stiff distance constraints stable at large dt.

const NODE_COUNT    = 12      // number of chain links
const REST_LENGTH   = 0.55    // natural length between nodes (units)
const NODE_RADIUS   = 0.18
const GRAVITY       = 12.0    // units/s²
const DAMPING       = 0.995   // multiply velocity (pos - prevPos) by this each step
const FLOOR_Y       = -4.0    // hard floor

// Verlet state per node: current position + previous position
const positions = []
const prevPos   = []
let nodeMeshes  = []

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const light = new THREE.DirectionalLight(0xffffff, 1.0)
  light.position.set(4, 8, 2)
  scene.add(light)

  const nodeGeo = new THREE.SphereGeometry(NODE_RADIUS, 10, 10)
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0x44aaff })
  const anchorMat = new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0x220000 })

  for (let i = 0; i < NODE_COUNT; i++) {
    // Start in a straight vertical chain
    const startY = 2.5 - i * REST_LENGTH
    positions.push(new THREE.Vector3(0, startY, 0))
    // Slightly offset previous position to seed a small swing
    prevPos.push(new THREE.Vector3(0.04 * (i > 0 ? 1 : 0), startY, 0))

    const mesh = new THREE.Mesh(nodeGeo, i === 0 ? anchorMat : nodeMat)
    mesh.position.copy(positions[i])
    scene.add(mesh)
    nodeMeshes.push(mesh)
  }

  scene.add(new THREE.GridHelper(12, 12, 0x222233, 0x222233))
  camera.position.set(0, 1, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // ── Verlet step ────────────────────────────────────────────
  for (let i = 1; i < NODE_COUNT; i++) {   // node 0 is the fixed anchor
    const curr = positions[i]
    const prev = prevPos[i]

    // Implicit velocity = displacement since last frame
    const vx = (curr.x - prev.x) * DAMPING
    const vy = (curr.y - prev.y) * DAMPING
    const vz = (curr.z - prev.z) * DAMPING

    // Save current as previous
    prev.copy(curr)

    // Advance: new = current + velocity + acceleration * dt²
    curr.x += vx - 0 * dt * dt          // no X force
    curr.y += vy - GRAVITY * dt * dt    // gravity downward
    curr.z += vz

    // Hard floor constraint
    if (curr.y < FLOOR_Y) curr.y = FLOOR_Y
  }

  // ── Distance constraint (run multiple times = more stiff) ──
  const ITERATIONS = 6
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 1; i < NODE_COUNT; i++) {
      const a = positions[i - 1]
      const b = positions[i]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
      const correction = (dist - REST_LENGTH) / dist * 0.5

      if (i > 1) {         // only push free nodes (node 0 is anchored)
        a.x += dx * correction
        a.y += dy * correction
        a.z += dz * correction
      }
      b.x -= dx * correction
      b.y -= dy * correction
      b.z -= dz * correction
    }
  }

  // Update mesh positions to match simulation
  positions.forEach((p, i) => nodeMeshes[i].position.copy(p))

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 12: Pivot points ──────────────────────────────────────────
            {
              id: 12,
              cellTitle: 'Pivot points — rotating around a non-center point',
              mode: '3d',
              prose: [
                'Three.js rotates every mesh around its **local origin**. If you want a door to swing around its hinge, or a planet to orbit the sun, you can\'t just set `door.rotation.y` — that would spin the door around its own center.',
                'The fix is a **pivot Group**: an invisible parent `Object3D` placed at the rotation point. Add the mesh as a child, offset from the pivot. Rotating the group rotates the child around the pivot, not around the mesh\'s center.',
                'This is also how hierarchical rigs work (robotic arms, character skeletons): each joint is a Group, and the bone is a child mesh offset along the limb axis. Rotating a parent joint automatically moves all children downstream.',
              ],
              code: `// ── Pivot Points — rotation around non-center using Group ───

const DOOR_W       = 2.0    // door width
const DOOR_H       = 3.5    // door height
const DOOR_D       = 0.12   // door thickness
const HINGE_OFFSET = DOOR_W / 2   // hinge is at the left edge of the door

const SWEEP_SPEED  = 0.6    // rad/s
const SWEEP_RANGE  = Math.PI * 0.75   // max open angle (135°)

// Three-part robotic arm for comparison
const ARM_SEG_LEN  = 1.8
const JOINT1_SPEED = 0.5
const JOINT2_SPEED = 0.9

let doorPivot
let joint1, joint2, joint3   // nested pivot groups
let time = 0

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const light = new THREE.DirectionalLight(0xffffff, 1.1)
  light.position.set(4, 8, 5)
  scene.add(light)

  // ── Door with hinge pivot ──────────────────────────────────

  // Door frame (static, shows context)
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_W + 0.4, DOOR_H + 0.3, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x553322, roughness: 0.8 })
  )
  frame.position.set(-4, DOOR_H / 2, 0)
  scene.add(frame)

  // doorPivot sits at the hinge (left edge of the door opening)
  doorPivot = new THREE.Object3D()
  doorPivot.position.set(-4 - HINGE_OFFSET, 0, 0)
  scene.add(doorPivot)

  // Door mesh: offset +X so its left edge sits at the pivot
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_W, DOOR_H, DOOR_D),
    new THREE.MeshStandardMaterial({ color: 0x886644, roughness: 0.6 })
  )
  door.position.set(HINGE_OFFSET, DOOR_H / 2, 0)  // offset from pivot = hinge
  doorPivot.add(door)

  // ── 3-joint robotic arm (nested pivots) ───────────────────

  // Base pivot at origin-right side of scene
  joint1 = new THREE.Object3D()
  joint1.position.set(3, 0, 0)
  scene.add(joint1)

  const seg1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, ARM_SEG_LEN, 12),
    new THREE.MeshStandardMaterial({ color: 0x4488cc })
  )
  seg1.position.y = ARM_SEG_LEN / 2
  joint1.add(seg1)

  // Joint 2 lives at the top of segment 1
  joint2 = new THREE.Object3D()
  joint2.position.y = ARM_SEG_LEN
  joint1.add(joint2)

  const seg2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10, 0.12, ARM_SEG_LEN * 0.85, 12),
    new THREE.MeshStandardMaterial({ color: 0x44aacc })
  )
  seg2.position.y = ARM_SEG_LEN * 0.85 / 2
  joint2.add(seg2)

  // Joint 3 (wrist) at top of segment 2
  joint3 = new THREE.Object3D()
  joint3.position.y = ARM_SEG_LEN * 0.85
  joint2.add(joint3)

  const hand = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.22, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x66ccdd })
  )
  hand.position.y = 0.15
  joint3.add(hand)

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 14),
    new THREE.MeshStandardMaterial({ color: 0x151520, roughness: 1 })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  camera.position.set(0, 5, 11)
  camera.lookAt(0, 2, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  // Door swings between closed (0) and open (SWEEP_RANGE)
  doorPivot.rotation.y = SWEEP_RANGE * (0.5 - 0.5 * Math.cos(time * SWEEP_SPEED))

  // Each arm joint oscillates at its own rate
  joint1.rotation.y  =  Math.sin(time * JOINT1_SPEED) * 0.8
  joint2.rotation.z  =  Math.sin(time * JOINT2_SPEED) * 0.7 - 0.3
  joint3.rotation.z  =  Math.sin(time * JOINT2_SPEED * 1.5) * 0.5

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 13: Trail effects ─────────────────────────────────────────
            {
              id: 13,
              cellTitle: 'Trail effects — rolling position history with Line geometry',
              mode: '3d',
              prose: [
                'A motion trail records the last N positions and draws a line through them. The trick is to treat the history array as a **circular buffer**: instead of shifting the whole array every frame (O(N) cost), keep a `head` index and overwrite the oldest entry. When drawing, start from `head` and walk forward, wrapping around at the end.',
                '`THREE.Line` uses a `BufferGeometry` with a `position` attribute. To update the line each frame, write new values into the `Float32Array` and set `line.geometry.attributes.position.needsUpdate = true`. Do NOT create a new geometry — mutating the existing buffer is the key to smooth 60fps trails.',
                'The ball traces a Lissajous figure (two sinusoids with different frequencies). Lissajous curves appear everywhere in electronics (oscilloscope X/Y mode), optics, and physics — they\'re the shape traced when two independent oscillations combine.',
              ],
              code: `// ── Trail Effects — circular position buffer + Line geometry ─

const TRAIL_LENGTH  = 200      // number of past positions to remember
const TRAIL_WIDTH   = 2.0      // line width (may be limited to 1 by GPU driver)
const BALL_RADIUS   = 0.28

// Lissajous figure parameters
const ORBIT_RADIUS  = 3.5
const FREQ_X        = 2.0      // X oscillation frequency (rad/s)
const FREQ_Y        = 3.0      // Y oscillation frequency
const FREQ_Z        = 1.5      // Z oscillation frequency

let ball, line, posAttr
let trailBuffer   // Float32Array [x0,y0,z0, x1,y1,z1, ...]
let trailHead = 0  // index of the next slot to write
let time = 0

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const light = new THREE.DirectionalLight(0xffffff, 0.9)
  light.position.set(4, 6, 4)
  scene.add(light)

  // Ball
  ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xff4466, emissive: 0x220011 })
  )
  scene.add(ball)

  // Trail — pre-allocate the buffer filled with the starting position (0,0,0)
  trailBuffer = new Float32Array(TRAIL_LENGTH * 3)   // xyz per point
  posAttr = new THREE.BufferAttribute(trailBuffer, 3)
  posAttr.setUsage(THREE.DynamicDrawUsage)  // hint: updated frequently

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', posAttr)

  line = new THREE.Line(geo,
    new THREE.LineBasicMaterial({ color: 0x44aaff, linewidth: TRAIL_WIDTH })
  )
  scene.add(line)

  scene.add(new THREE.GridHelper(10, 10, 0x222233, 0x222233))

  camera.position.set(0, 6, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  // Lissajous position — two independent sinusoids per axis
  const bx = Math.cos(FREQ_X * time) * ORBIT_RADIUS
  const by = Math.sin(FREQ_Y * time) * ORBIT_RADIUS * 0.6
  const bz = Math.sin(FREQ_Z * time) * ORBIT_RADIUS * 0.75

  ball.position.set(bx, by, bz)

  // ── Write new position into circular buffer ───────────────
  trailBuffer[trailHead * 3]     = bx
  trailBuffer[trailHead * 3 + 1] = by
  trailBuffer[trailHead * 3 + 2] = bz
  trailHead = (trailHead + 1) % TRAIL_LENGTH  // advance head, wrap around

  // Re-order the buffer so the line draws oldest → newest
  // (Three.js draws points in array order, so we must arrange them correctly)
  const ordered = new Float32Array(TRAIL_LENGTH * 3)
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const srcIdx = (trailHead + i) % TRAIL_LENGTH
    ordered[i * 3]     = trailBuffer[srcIdx * 3]
    ordered[i * 3 + 1] = trailBuffer[srcIdx * 3 + 1]
    ordered[i * 3 + 2] = trailBuffer[srcIdx * 3 + 2]
  }
  posAttr.array.set(ordered)
  posAttr.needsUpdate = true

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 14: Noise / turbulence ────────────────────────────────────
            {
              id: 14,
              cellTitle: 'Noise and turbulence — smooth randomness without jitter',
              mode: '3d',
              prose: [
                '`Math.random()` changes completely each frame — objects that jitter randomly look wrong. Real wind and turbulence have **coherence**: nearby values in space and time are similar, and the change is smooth. **Value noise** achieves this by interpolating between random values on a grid, using a smooth interpolant like `smoothstep(t) = 3t² − 2t³` that eases in and out.',
                'The noise function below is a simple 1D→1D value noise. Calling it with `(x, 1.0)` gives a slowly-varying smooth signal. Calling it with `(x * 4, 1.0) * 0.25 + noise(x * 8, 1.0) * 0.125` stacks octaves — each octave adds finer detail at lower amplitude. This is **fBm (fractional Brownian motion)**, the pattern behind mountains, clouds, and fire.',
                'Each sphere in the demo moves on a unique noise path. The key: each sphere samples the noise at a *different offset* so they don\'t all move in sync. This is the standard technique for flocking wind, particle turbulence, and procedural terrain.',
              ],
              code: `// ── Value Noise — smooth coherent randomness ─────────────────

const SPHERE_COUNT    = 14
const SPHERE_RADIUS   = 0.30
const NOISE_SPEED     = 0.55    // how fast each sphere moves through noise space
const NOISE_AMPLITUDE = 2.8     // max displacement from rest position
const OCTAVE_COUNT    = 3       // stacking octaves adds fine detail

// ── Noise implementation ──────────────────────────────────────
// Returns a smooth value in [-1, 1] for any real input x.
// Deterministic: same x always returns same value.
function hash(n) {
  // Integer hash — produces pseudo-random floats from integers
  n = (n << 13) ^ n
  return 1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)   // eases in and out: 0→0, 0.5→0.5, 1→1
}

function valueNoise1D(x) {
  const i  = Math.floor(x)
  const f  = x - i            // fractional part [0, 1)
  const a  = hash(i)          // random value at left grid point
  const b  = hash(i + 1)      // random value at right grid point
  return a + (b - a) * smoothstep(f)  // smoothly interpolate
}

function fbm(x, octaves) {
  // Fractal Brownian Motion: sum octaves, each half the amplitude and double the frequency
  let value = 0
  let amplitude = 1.0
  let frequency = 1.0
  let totalAmplitude = 0
  for (let o = 0; o < octaves; o++) {
    value          += valueNoise1D(x * frequency) * amplitude
    totalAmplitude += amplitude
    amplitude      *= 0.5
    frequency      *= 2.0
  }
  return value / totalAmplitude   // normalise to [-1, 1]
}

let spheres = []
let restPositions = []   // each sphere's home position
let noiseOffsets  = []   // unique time offset per sphere so they don't sync
let time = 0

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const light = new THREE.DirectionalLight(0xffffff, 1.0)
  light.position.set(4, 8, 3)
  scene.add(light)

  const geo = new THREE.SphereGeometry(SPHERE_RADIUS, 14, 14)
  const mat = new THREE.MeshStandardMaterial({ color: 0x55ccff, roughness: 0.4 })

  // Arrange spheres in a grid
  const cols = Math.ceil(Math.sqrt(SPHERE_COUNT))
  for (let i = 0; i < SPHERE_COUNT; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const restX = (col - cols / 2 + 0.5) * 1.8
    const restZ = (row - cols / 2 + 0.5) * 1.8

    const sphere = new THREE.Mesh(geo, mat)
    sphere.position.set(restX, 1, restZ)
    scene.add(sphere)

    spheres.push(sphere)
    restPositions.push(new THREE.Vector3(restX, 1, restZ))
    // Each sphere gets a unique offset so it samples a different part of noise space
    noiseOffsets.push(Math.random() * 100)
  }

  scene.add(new THREE.GridHelper(12, 12, 0x222233, 0x222233))
  camera.position.set(0, 8, 10)
  camera.lookAt(0, 1, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  spheres.forEach((sphere, i) => {
    const t = time * NOISE_SPEED + noiseOffsets[i]
    // Sample noise on different frequencies per axis for varied motion
    const dx = fbm(t,             OCTAVE_COUNT) * NOISE_AMPLITUDE
    const dy = fbm(t + 31.7,      OCTAVE_COUNT) * NOISE_AMPLITUDE * 0.5
    const dz = fbm(t + 57.3,      OCTAVE_COUNT) * NOISE_AMPLITUDE
    sphere.position.set(
      restPositions[i].x + dx,
      restPositions[i].y + dy,
      restPositions[i].z + dz
    )
  })

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 15: Boids / Flocking ──────────────────────────────────────
            {
              id: 15,
              cellTitle: 'Boids — flocking from three simple rules',
              mode: '3d',
              prose: [
                'Craig Reynolds\' 1986 Boids model produces realistic flocking, schooling, and swarming from three local rules — no central controller, no global coordination. Each agent only knows about its immediate neighbors (within `PERCEPTION_RADIUS`): **Separation** — steer away from neighbors that are too close. **Alignment** — steer toward the average heading of neighbors. **Cohesion** — steer toward the average position of neighbors.',
                'The emergent V-formation and schooling behavior isn\'t programmed — it falls out of the math. This is why boids are a classic complexity-science example: simple rules + local interaction = complex global pattern.',
                'For performance, boids checks every other boid for proximity (O(N²)). Above ~300 boids this needs a spatial hash or grid for O(N) performance. At 60 boids the naive loop is fine.',
              ],
              code: `// ── Boids — flocking from separation, alignment, cohesion ───

const BOID_COUNT         = 60
const PERCEPTION_RADIUS  = 2.5    // how far a boid can "see"
const SEPARATION_RADIUS  = 0.9    // personal space — push away if closer
const MAX_SPEED          = 4.5    // units/s
const MAX_FORCE          = 6.0    // how fast the boid can turn (units/s²)
const BOUNDS_RADIUS      = 7.0    // soft sphere boundary — steer back if outside

// Weights for the three steering rules
const WEIGHT_SEPARATION = 1.8
const WEIGHT_ALIGNMENT  = 1.0
const WEIGHT_COHESION   = 0.9
const WEIGHT_BOUNDS     = 3.0

// Boid state
const pos = []    // THREE.Vector3 positions
const vel = []    // THREE.Vector3 velocities
let meshes = []

// Reusable scratch vectors — declared once to avoid GC
const _steer    = new THREE.Vector3()
const _diff     = new THREE.Vector3()
const _sep      = new THREE.Vector3()
const _ali      = new THREE.Vector3()
const _coh      = new THREE.Vector3()
const _bounds   = new THREE.Vector3()

function limit(vec, maxLen) {
  if (vec.length() > maxLen) vec.setLength(maxLen)
}

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const light = new THREE.DirectionalLight(0xffffff, 1.0)
  light.position.set(4, 8, 4)
  scene.add(light)

  const geo = new THREE.ConeGeometry(0.12, 0.45, 6)
  geo.rotateX(Math.PI / 2)   // cone tip points along +Z (local forward)
  const mat = new THREE.MeshStandardMaterial({ color: 0x44ccff, roughness: 0.4 })

  for (let i = 0; i < BOID_COUNT; i++) {
    // Random start inside the bounds sphere
    const r = BOUNDS_RADIUS * 0.6
    pos.push(new THREE.Vector3(
      (Math.random() - 0.5) * 2 * r,
      (Math.random() - 0.5) * 2 * r,
      (Math.random() - 0.5) * 2 * r
    ))
    // Random initial velocity
    vel.push(new THREE.Vector3(
      (Math.random() - 0.5) * MAX_SPEED,
      (Math.random() - 0.5) * MAX_SPEED,
      (Math.random() - 0.5) * MAX_SPEED
    ))
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)
    meshes.push(mesh)
  }

  camera.position.set(0, 6, 18)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  for (let i = 0; i < BOID_COUNT; i++) {
    _sep.set(0, 0, 0)
    _ali.set(0, 0, 0)
    _coh.set(0, 0, 0)
    let sepCount = 0, nearCount = 0

    for (let j = 0; j < BOID_COUNT; j++) {
      if (i === j) continue
      const dist = _diff.subVectors(pos[j], pos[i]).length()

      if (dist < SEPARATION_RADIUS && dist > 0) {
        // Separation: push away, weighted by inverse distance
        _sep.addScaledVector(_diff.clone().normalize(), -1 / dist)
        sepCount++
      }

      if (dist < PERCEPTION_RADIUS) {
        _ali.add(vel[j])           // accumulate neighbor velocities (alignment)
        _coh.add(pos[j])           // accumulate neighbor positions  (cohesion)
        nearCount++
      }
    }

    // Average and convert to steering force
    if (sepCount > 0) { _sep.divideScalar(sepCount); limit(_sep, MAX_FORCE) }
    if (nearCount > 0) {
      _ali.divideScalar(nearCount).sub(vel[i]); limit(_ali, MAX_FORCE)
      _coh.divideScalar(nearCount).sub(pos[i]); limit(_coh, MAX_FORCE)
    }

    // Soft boundary: steer back toward origin when outside BOUNDS_RADIUS
    _bounds.copy(pos[i]).negate()
    if (pos[i].length() > BOUNDS_RADIUS) { limit(_bounds, MAX_FORCE) }
    else _bounds.set(0, 0, 0)

    // Apply weighted steering forces to velocity
    vel[i].addScaledVector(_sep,    WEIGHT_SEPARATION * dt)
    vel[i].addScaledVector(_ali,    WEIGHT_ALIGNMENT  * dt)
    vel[i].addScaledVector(_coh,    WEIGHT_COHESION   * dt)
    vel[i].addScaledVector(_bounds, WEIGHT_BOUNDS     * dt)
    limit(vel[i], MAX_SPEED)

    // Integrate position
    pos[i].addScaledVector(vel[i], dt)

    // Orient mesh along velocity
    meshes[i].position.copy(pos[i])
    if (vel[i].length() > 0.1) {
      _steer.addVectors(pos[i], vel[i])
      meshes[i].lookAt(_steer)
    }
  }

  renderer.render(scene, camera)
}`,
            },

          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'Verlet integration is second-order accurate (error ∝ dt²) while Euler is first-order (error ∝ dt). This means halving `dt` reduces Verlet error by 4× but only reduces Euler error by 2×. More importantly, Verlet conserves energy much better for conservative forces like springs — the trajectory stays bounded instead of spiralling outward.',

      'The three boid rules correspond directly to social behavior: **separation** prevents collision (personal space), **alignment** synchronises direction (peer pressure), **cohesion** keeps the group together (attraction). The ratio of their weights determines the emergent character: high separation → loose cloud; high cohesion + high alignment → tight arrow formation; high alignment only → parallel lanes.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Verlet Integration',
        body: '$$\\mathbf{x}_{n+1} = 2\\mathbf{x}_n - \\mathbf{x}_{n-1} + \\mathbf{a}_n\\,\\Delta t^2$$\n\nImplicit velocity: $\\mathbf{v}_n \\approx (\\mathbf{x}_n - \\mathbf{x}_{n-1})/\\Delta t$. Never stored explicitly — derived from position history. Multiply the implicit velocity by DAMPING (< 1) each step to add energy dissipation.',
      },
      {
        type: 'insight',
        title: 'Distance constraint correction',
        body: 'For two nodes A, B with rest length L: `correction = (|AB| - L) / |AB| * 0.5`. Add `correction * AB` to A and subtract from B. Running this 6+ times per frame converges toward the rest length — more iterations = stiffer constraint. This is Position-Based Dynamics (PBD), used in Nvidia PhysX cloth.',
      },
      {
        type: 'insight',
        title: 'fBm in one line',
        body: '`fbm(x) = noise(x) + 0.5*noise(2x) + 0.25*noise(4x) + ...` Each octave doubles the frequency and halves the amplitude. The result looks like a fractal because self-similar structure appears at every scale — zoom into any section and it looks like the whole.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenge — Combine the Recipes',
        mathBridge: 'This challenge combines particles (Part 2) with per-particle color attributes for a timed burst effect.',
        caption: 'Open-ended build. Break things freely — the error console at the bottom of the preview is your friend.',
        initialProps: {
          initialCells: [

            // ── Challenge 3: Fireworks ─────────────────────────────────────────
            {
              id: 'c3',
              challengeType: 'build',
              challengeNumber: 3,
              challengeTitle: 'Fireworks — timed bursts with color fade',
              difficulty: 'hard',
              mode: '3d',
              prose: [
                'A fireworks display is a particle system with two phases: a projectile that launches upward, then a burst at its peak that spawns many fast particles in all directions. Use `PointsMaterial` with `vertexColors: true` so each particle can fade from its launch color to black as it ages. Write the per-particle color into a second `BufferAttribute` named `color`.',
              ],
              prompt: 'Build fireworks: every LAUNCH_INTERVAL seconds, spawn a new "shell" — a single point that arcs upward with a random horizontal velocity. When it reaches its peak (vy < 0), trigger a burst of BURST_COUNT fast particles in random directions with a random hue. Fade each burst particle\'s opacity from 1 to 0 over its lifetime by writing to the `color` attribute each frame.',
              hint: 'For vertex colors: `geo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3))` and `mat.vertexColors = true`. Write rgb values (0–1) into the color array each frame, same index pattern as position. Fade by multiplying the color by `(1 - age/lifetime)` each frame.',
              code: `// Starter: fireworks skeleton
// Add burst logic and vertex color fade

const LAUNCH_INTERVAL = 2.0    // seconds between shell launches
const BURST_COUNT     = 120    // particles per burst
const SHELL_SPEED_Y   = 12.0   // initial upward speed of the shell
const BURST_SPEED     = 7.0    // outward speed of burst particles
const GRAVITY         = 9.0
const BURST_LIFETIME  = 2.0

// Simple particle pool: one launch shell, one burst
// TODO: extend to multiple simultaneous bursts

let posAttr, colorAttr
const MAX_PARTICLES = BURST_COUNT + 1   // +1 for the shell itself
const positions  = []
const velocities = []
const ages       = new Float32Array(MAX_PARTICLES)
const lifetimes  = new Float32Array(MAX_PARTICLES)
const colors     = []   // THREE.Color per particle

let timeSinceLaunch = 0
let burstTriggered  = false

function init() {
  // TODO: set up Points geometry with position AND color attributes
  // TODO: initialise positions/velocities/ages/colors arrays
  // TODO: set lifetimes[0] = Infinity for the shell (it lives until burst)

  camera.position.set(0, 8, 22)
  camera.lookAt(0, 8, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  timeSinceLaunch += dt

  // TODO: launch a new shell when timeSinceLaunch > LAUNCH_INTERVAL
  // TODO: update shell physics; when vy < 0 trigger burst
  // TODO: update burst particle physics and fade colors by age/lifetime
  // TODO: write positions and colors into BufferAttributes
  // TODO: set needsUpdate = true on both attributes

  renderer.render(scene, camera)
}`,
            },

          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Verlet integration stores previous position instead of velocity: `newPos = 2*pos - prevPos + accel*dt²`. What advantage does this have over Euler integration for constrained systems like cloth?',
      options: [
        'Verlet is more accurate for constant velocity but equally accurate with forces',
        'Verlet encodes velocity implicitly as (pos - prevPos) and is naturally energy-conserving. Constraints (like keeping two cloth nodes a fixed distance apart) can be applied directly to positions without accumulating velocity errors — Euler accumulates drift that causes cloth to slowly stretch or explode',
        'Verlet avoids all numerical error because it uses two data points',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A fireworks burst uses one BufferGeometry with 200 positions rather than 200 individual Mesh objects. What is the main performance advantage?',
      options: [
        'BufferGeometry supports colors while Mesh does not',
        'One BufferGeometry = one GPU draw call. 200 Mesh objects = 200 draw calls. GPU draw-call overhead dominates at high particle counts. Updating positions and colors directly in typed Float32Arrays and setting needsUpdate=true lets the GPU re-upload only the changed data, not re-process the full scene graph',
        'BufferGeometry particles can be larger than standard Mesh spheres',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '`timeSinceLaunch > LAUNCH_INTERVAL` triggers launching a new firework shell. This is an example of which simulation pattern?',
      options: [
        'Event-driven architecture — the browser fires an event when the interval expires',
        'Accumulated-time timer: a running float increments each frame by dt and fires when it crosses a threshold, then resets. This is frame-rate independent (works at 30fps or 144fps) unlike checking frame count, which would fire at different real-world rates on different machines',
        'A setInterval callback synchronized with requestAnimationFrame',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Boid flocking uses three rules: separation (avoid crowding), alignment (steer toward average heading), and cohesion (steer toward average position). Which rule prevents boids from passing through each other?',
      options: [
        'Alignment — matching heading keeps boids moving in the same direction and avoids head-on collisions',
        'Separation — it pushes each boid away from nearby neighbors when the distance drops below a threshold. Without separation, alignment and cohesion alone would compress all boids into a single point',
        'Cohesion — pulling toward the group center keeps the flock together',
      ],
      correct: 1,
    },
  ],
}
