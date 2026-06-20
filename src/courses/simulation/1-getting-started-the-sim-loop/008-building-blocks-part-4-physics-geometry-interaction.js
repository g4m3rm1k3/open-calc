export default {
  id: 'sim1-008',
  slug: 'building-blocks-part-4-physics-geometry-interaction',
  chapter: 'sim1',
  order: 8,
  title: 'Building Blocks Part 4 — Physics, Geometry & Interaction',
  subtitle: 'Five self-contained recipes: Euler integration, spring networks, orbital paths, procedural geometry, and mouse raycasting.',
  tags: ['three.js', 'euler', 'forces', 'drag', 'spring', 'hookes-law', 'orbital', 'polar-coordinates', 'BufferGeometry', 'raycasting', 'mouse-picking'],
  aliases: 'euler integration gravity drag spring hooke cloth orbit spiral helix procedural geometry raycasting mouse picking normal',
  timeToComplete: 35,
  coreConcept: 'Physics simulations are built from three operations: accumulate forces, integrate velocity, integrate position. These five patterns show that pipeline in action — from a single falling ball to an interactive 3D scene you can click on.',
  prerequisites: ['building-blocks-part-3-advanced-techniques'],
  nextLesson: 'building-blocks-part-5-lighting-effects-performance',

  hook: {
    question: 'A physics engine, a cloth simulator, a solar system model, and an interactive scene picker — what single loop structure do they all share?',
    realWorldContext: "Every game engine and physics simulator runs the same pipeline every frame: sum up all the forces on a body, divide by mass to get acceleration, integrate to get velocity, integrate again to get position. This lesson builds that pipeline from scratch — you'll see why cloth sags, why planets orbit, and how your mouse click turns into a 3D ray.",
  },

  intuition: {
    prose: [
      "**Euler integration: the fundamental physics loop.** Each frame: `velocity += acceleration * dt`, then `position += velocity * dt`. Acceleration is just the sum of all forces divided by mass. Gravity is a constant downward force. Air drag is a force opposing velocity: `F_drag = −drag × velocity`. The trick to stability is *semi-implicit* Euler: update velocity first (using new acceleration), then update position (using new velocity) — this conserves energy better than the explicit form.",

      "**Spring networks use Hooke's law: F = −k × stretch × direction.** `stretch = |AB| − restLength`. If positive, the spring is stretched and pulls A toward B. If negative, it's compressed and pushes. Add a damping term proportional to the relative velocity along the spring to prevent infinite oscillation. A 2D grid of masses connected by structural springs is a cloth simulation.",

      "**Polar coordinates drive natural circular and spiral motion without solving differential equations.** A planet at orbital radius `r` with angular speed `ω`: `x = r·cos(ω·t)`, `z = r·sin(ω·t)`. A helix adds a vertical component: `y = ascent·t`. A spiral grows `r` with time. These parametric equations produce perfect orbits with zero physics — no integration needed.",

      "**Procedural geometry: `BufferGeometry` lets you build any shape from a position array.** Create a `Float32Array` of `[x0,y0,z0, x1,y1,z1, ...]`, set it as the `position` attribute, define triangle indices, and call `computeVertexNormals()` so lighting works. To animate, mutate the array each frame and set `posAttr.needsUpdate = true` — the GPU re-uploads only the changed data.",

      "**Raycasting maps a 2D mouse position to a 3D ray in world space.** `Raycaster.setFromCamera(normalizedMousePos, camera)` computes a ray from the camera through the pixel. `raycaster.intersectObjects(objects)` returns an array of hits sorted by distance, each with a `point` (3D world position) and `face.normal` (surface normal at the hit). This is the foundation of all mouse picking, placement, and interaction in Three.js.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Semi-implicit vs explicit Euler',
        body: '**Explicit:** `v_new = v + a*dt`, `p_new = p + v*dt` (uses OLD velocity for position — unstable for oscillators). **Semi-implicit:** `v_new = v + a*dt`, `p_new = p + v_new*dt` (uses NEW velocity for position — stable for springs and gravity). For springs with explicit Euler, energy grows without bound. Semi-implicit keeps it bounded.',
      },
      {
        type: 'definition',
        title: 'Hooke\'s Law spring force',
        body: '`F = −k × (|AB| − L₀) × normalize(AB)` where k is stiffness, L₀ is rest length. Add damping: `F_damp = −c × dot(v_rel, normalize(AB)) × normalize(AB)` where `v_rel = v_B − v_A`. Apply equal and opposite: push on A, pull on B (Newton\'s third law).',
      },
      {
        type: 'procedure',
        title: 'Mouse-to-ray mapping',
        body: '```js\n// Normalize mouse to [-1,+1] range\nconst rect = renderer.domElement.getBoundingClientRect()\nconst mouse = new THREE.Vector2(\n  (event.clientX - rect.left) / rect.width * 2 - 1,\n -(event.clientY - rect.top) / rect.height * 2 + 1\n)\nraycaster.setFromCamera(mouse, camera)\nconst hits = raycaster.intersectObjects(pickable)\nif (hits.length > 0) { const { point, face } = hits[0] }\n```',
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

            // ── Cell 16: Euler Integration ─────────────────────────────────────
            {
              id: 16,
              cellTitle: 'Euler integration — gravity, forces, and air drag',
              mode: '3d',
              prose: [
                'Every physics simulation runs the same loop: **accumulate forces → compute acceleration → update velocity → update position**. `acceleration = F_net / mass`. For gravity: `F_gravity = mass × g` downward, so `accel.y -= g` (mass cancels). For linear drag: `F_drag = −drag × velocity`, so `velocity *= (1 − drag/mass × dt)`.',
                'Semi-implicit Euler updates velocity first (with new acceleration), then position (with new velocity). This is more stable than fully explicit Euler and is what most game engines use.',
                'The three balls have identical starting conditions — only their drag coefficients differ. Watch how the high-drag ball (green) loses energy fastest and bounces less with each impact.',
              ],
              code: `// ── Euler Integration — gravity and air drag ─────────────────
// Loop each frame:
//   1. Compute acceleration from all forces (F/m)
//   2. velocity += acceleration * dt
//   3. position += velocity * dt

const MASS        = 1.0     // kg
const GRAVITY     = 9.8     // m/s²
const BALL_RADIUS = 0.32
const FLOOR_Y     = -3.8
const RESTITUTION = 0.80    // fraction of speed kept after bounce

// Linear air drag coefficient (N·s/m = kg/s)
// F_drag = -DRAG * velocity  →  accel_drag = -(DRAG/MASS) * velocity
const DRAG_NONE    = 0.00   // vacuum
const DRAG_LIGHT   = 0.40   // ping-pong ball in air
const DRAG_HEAVY   = 2.20   // badminton birdie

const BALL_SPACING = 3.6

// Ball state — allocated once, reused every frame
const balls = [
  { drag: DRAG_NONE,  color: 0xff4422 },
  { drag: DRAG_LIGHT, color: 0x44aaff },
  { drag: DRAG_HEAVY, color: 0x44ee88 },
].map((cfg, i) => ({
  ...cfg,
  vel: new THREE.Vector3(0, 0, 0),
  mesh: null,    // filled in init()
}))

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.40))
  const sun = new THREE.DirectionalLight(0xffffff, 1.1)
  sun.position.set(5, 8, 4)
  scene.add(sun)

  const geo = new THREE.SphereGeometry(BALL_RADIUS, 22, 22)
  balls.forEach((ball, i) => {
    ball.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: ball.color, roughness: 0.4 }))
    ball.mesh.position.set((i - 1) * BALL_SPACING, 4.5, 0)
    ball.vel.set(0, 1.0, 0)  // small upward nudge so first bounce happens visibly
    scene.add(ball.mesh)
  })

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 8),
    new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = FLOOR_Y
  scene.add(floor)

  camera.position.set(0, 2.0, 13)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  for (const ball of balls) {
    // ── Step 1: gravity acceleration (same for all masses) ────
    ball.vel.y -= GRAVITY * dt

    // ── Step 2: air drag (linear model: F = -drag * v) ───────
    // Equivalent to multiplying by the decay factor each frame
    const dragFactor = 1 - (ball.drag / MASS) * dt
    ball.vel.multiplyScalar(Math.max(0, dragFactor))   // clamp at 0 to prevent flip

    // ── Step 3: Euler position integration ───────────────────
    ball.mesh.position.addScaledVector(ball.vel, dt)

    // ── Floor collision ───────────────────────────────────────
    const floorLimit = FLOOR_Y + BALL_RADIUS
    if (ball.mesh.position.y < floorLimit) {
      ball.mesh.position.y = floorLimit
      ball.vel.y = Math.abs(ball.vel.y) * RESTITUTION
    }
  }
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 17: Spring Network ────────────────────────────────────────
            {
              id: 17,
              cellTitle: 'Spring network — Hooke\'s law and cloth simulation',
              mode: '3d',
              prose: [
                'A spring exerts a force proportional to how far it\'s stretched from its rest length: `F = −k × (|AB| − L₀) × normalize(B − A)`. Positive stretch pulls the endpoints together; compression pushes them apart. This is Newton\'s third law in disguise — the force on A equals and opposite the force on B.',
                'A damping term prevents infinite oscillation: subtract a fraction of the relative velocity along the spring axis each frame. Without damping, a spring network oscillates forever; with too much damping it becomes sluggish. The sweet spot mimics real cloth.',
                'The demo is a 5×6 grid of mass nodes with structural springs (horizontal + vertical). The top row is pinned (fixed in space). Gravity pulls the cloth down; the springs resist deformation.',
              ],
              code: `// ── Spring Network — Hooke's law cloth simulation ────────────
// F_spring = k * (dist - restLen) * direction
// F_damp   = c * dot(v_rel, direction) * direction
// Apply equal + opposite force to both endpoints.

const GRID_COLS    = 5
const GRID_ROWS    = 6
const SPRING_K     = 55      // stiffness (N/m)
const SPRING_DAMP  = 7       // damping coefficient
const NODE_MASS    = 0.12    // kg per node
const GRAVITY      = 9.5     // m/s²
const AIR_DAMP     = 0.015   // global velocity damping per frame
const REST_LEN     = 0.55    // spacing between adjacent nodes

const NODE_COUNT   = GRID_COLS * GRID_ROWS

// Node state: position, velocity, force accumulator, pinned flag
const nodePos  = []   // THREE.Vector3
const nodeVel  = []   // THREE.Vector3
const nodeForce = []  // THREE.Vector3 — reset each frame
const nodePinned = []

// Springs: each entry {a, b, restLen}
const springs = []

// Rendering
let springLineAttr
const springLinePositions = new Float32Array(0)  // allocated after spring count is known
let nodeMeshes = []
let springLinePositionsArr  // will be assigned in init

// Scratch vectors — never allocate in update()
const _dir = new THREE.Vector3()
const _relVel = new THREE.Vector3()

function nodeIdx(col, row) { return row * GRID_COLS + col }

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.50))
  const light = new THREE.DirectionalLight(0xffffff, 1.0)
  light.position.set(3, 6, 4)
  scene.add(light)

  // Create nodes
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const x = (col - (GRID_COLS - 1) / 2) * REST_LEN
      const y = 2.5 - row * REST_LEN
      nodePos.push(new THREE.Vector3(x, y, 0))
      nodeVel.push(new THREE.Vector3())
      nodeForce.push(new THREE.Vector3())
      nodePinned.push(row === 0)
    }
  }

  // Create structural springs (horizontal + vertical)
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (col + 1 < GRID_COLS) {
        springs.push({ a: nodeIdx(col, row), b: nodeIdx(col + 1, row), restLen: REST_LEN })
      }
      if (row + 1 < GRID_ROWS) {
        springs.push({ a: nodeIdx(col, row), b: nodeIdx(col, row + 1), restLen: REST_LEN })
      }
    }
  }

  // Render: LineSegments for springs
  springLinePositionsArr = new Float32Array(springs.length * 6)  // 2 pts × xyz per spring
  springLineAttr = new THREE.BufferAttribute(springLinePositionsArr, 3)
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', springLineAttr)
  scene.add(new THREE.LineSegments(lineGeo,
    new THREE.LineBasicMaterial({ color: 0x4488cc })))

  // Render: sphere per node
  const nodeGeo  = new THREE.SphereGeometry(0.09, 8, 8)
  const freeMat  = new THREE.MeshStandardMaterial({ color: 0xaaddff })
  const pinnedMat = new THREE.MeshStandardMaterial({ color: 0xff5533, emissive: 0x220800 })
  for (let i = 0; i < NODE_COUNT; i++) {
    const mesh = new THREE.Mesh(nodeGeo, nodePinned[i] ? pinnedMat : freeMat)
    mesh.position.copy(nodePos[i])
    scene.add(mesh)
    nodeMeshes.push(mesh)
  }

  // Perturb the last node so the cloth starts swinging
  nodeVel[NODE_COUNT - 1].set(2.5, 0, 1.0)

  camera.position.set(0, 1, 8)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // ── Reset force accumulators ────────────────────────────────
  for (let i = 0; i < NODE_COUNT; i++) nodeForce[i].set(0, 0, 0)

  // ── Accumulate spring forces ────────────────────────────────
  for (const sp of springs) {
    const a = nodePos[sp.a],  b = nodePos[sp.b]
    const va = nodeVel[sp.a], vb = nodeVel[sp.b]

    _dir.subVectors(b, a)
    const dist = _dir.length() || 1e-6
    _dir.divideScalar(dist)   // normalize in place

    // Hooke's law: pull/push toward rest length
    const springForceMag = SPRING_K * (dist - sp.restLen)

    // Damping: damp relative velocity projected onto spring axis
    const relVelDot = _relVel.subVectors(vb, va).dot(_dir)
    const totalMag = springForceMag + SPRING_DAMP * relVelDot

    if (!nodePinned[sp.a]) nodeForce[sp.a].addScaledVector(_dir,  totalMag)
    if (!nodePinned[sp.b]) nodeForce[sp.b].addScaledVector(_dir, -totalMag)
  }

  // ── Integrate free nodes ────────────────────────────────────
  for (let i = 0; i < NODE_COUNT; i++) {
    if (nodePinned[i]) continue
    nodeVel[i].addScaledVector(nodeForce[i], dt / NODE_MASS)  // spring forces
    nodeVel[i].y -= GRAVITY * dt                               // gravity
    nodeVel[i].multiplyScalar(1 - AIR_DAMP)                   // air resistance
    nodePos[i].addScaledVector(nodeVel[i], dt)
    nodeMeshes[i].position.copy(nodePos[i])
  }

  // ── Update spring line positions ────────────────────────────
  springs.forEach((sp, i) => {
    const a = nodePos[sp.a], b = nodePos[sp.b]
    springLinePositionsArr[i*6]   = a.x; springLinePositionsArr[i*6+1] = a.y; springLinePositionsArr[i*6+2] = a.z
    springLinePositionsArr[i*6+3] = b.x; springLinePositionsArr[i*6+4] = b.y; springLinePositionsArr[i*6+5] = b.z
  })
  springLineAttr.needsUpdate = true

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 18: Orbital paths ─────────────────────────────────────────
            {
              id: 18,
              cellTitle: 'Orbital paths — polar coordinates, spirals, and helices',
              mode: '3d',
              prose: [
                '**Polar coordinates** map angle and radius to Cartesian: `x = r·cos(θ)`, `z = r·sin(θ)`. A circular orbit at constant `r` is just `θ = ω·t`. No physics needed — these are purely parametric equations. Multiple planets at different `r` and `ω` automatically produce a solar system layout.',
                'Kepler\'s third law emerges naturally if you set `ω = sqrt(GM / r³)` — planets farther from the star orbit slower. The constant `GM` is the standard gravitational parameter. Tune it once and all orbital periods are physically consistent.',
                'A helix adds a vertical component to the orbit: `y = ascent·t`. A spiral increases `r` with time: `r = r₀ + growth·t`. These parametric curves appear in antenna design, DNA modeling, springs, and roller coaster layouts.',
              ],
              code: `// ── Orbital Paths — polar coordinates, Kepler, helix ─────────

// Standard gravitational parameter: determines how fast planets orbit
// for a given radius. ω = sqrt(GM / r³) → Kepler's third law.
const GM = 28.0     // higher = faster orbits

// Planet definitions: name, orbital radius, size, color
const PLANET_DEFS = [
  { r: 2.2, radius: 0.22, color: 0xaa6644 },   // inner rocky
  { r: 3.5, radius: 0.35, color: 0x44aacc },   // ocean world
  { r: 5.0, radius: 0.50, color: 0xddaa44 },   // gas giant
  { r: 6.8, radius: 0.28, color: 0x88aadd },   // ice giant
]

// Moon orbiting the gas giant (index 2)
const MOON_PARENT_IDX = 2
const MOON_R      = 0.9    // relative to parent
const MOON_OMEGA  = 3.5    // moon's own angular speed
const MOON_SIZE   = 0.12

// Comet: a spiral inward (r decreases over time)
const COMET_R_START = 8.0
const COMET_INFALL  = 0.5    // units per revolution lost per orbit
const COMET_OMEGA   = 0.4

// Vertical helix (a slower-moving reference object)
const HELIX_RADIUS  = 1.4
const HELIX_OMEGA   = 2.0
const HELIX_ASCENT  = 0.5    // y per second

let planets = []
let moon, comet, helixObj
let time = 0

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.25))
  const starLight = new THREE.PointLight(0xffeecc, 80, 0, 1.5)
  scene.add(starLight)   // light from the star at origin

  // Star at origin
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.70, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xffcc44 })
  )
  scene.add(star)

  // Planet meshes
  PLANET_DEFS.forEach(def => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(def.radius, 18, 18),
      new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.7 })
    )
    scene.add(mesh)
    planets.push({ mesh, r: def.r, omega: Math.sqrt(GM / (def.r ** 3)) })

    // Faint orbit ring for reference
    scene.add(new THREE.Mesh(
      new THREE.TorusGeometry(def.r, 0.012, 4, 80),
      new THREE.MeshBasicMaterial({ color: 0x222233 })
    ))
  })

  // Moon
  moon = new THREE.Mesh(
    new THREE.SphereGeometry(MOON_SIZE, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 })
  )
  scene.add(moon)

  // Comet (tiny, bright)
  comet = new THREE.Mesh(
    new THREE.SphereGeometry(0.10, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x88eeff })
  )
  scene.add(comet)

  // Helix object
  helixObj = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff88aa })
  )
  scene.add(helixObj)

  camera.position.set(0, 14, 14)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  // Planets: circular orbits at Keplerian speeds
  planets.forEach(p => {
    const theta = p.omega * time
    p.mesh.position.set(p.r * Math.cos(theta), 0, p.r * Math.sin(theta))
  })

  // Moon: orbits the gas giant in its own local frame
  const parent = planets[MOON_PARENT_IDX].mesh.position
  const moonTheta = MOON_OMEGA * time
  moon.position.set(
    parent.x + MOON_R * Math.cos(moonTheta),
    0,
    parent.z + MOON_R * Math.sin(moonTheta)
  )

  // Comet: inward spiral — r decreases as it completes revolutions
  const cometTheta = COMET_OMEGA * time
  const cometR = Math.max(0.5, COMET_R_START - COMET_INFALL * (cometTheta / (Math.PI * 2)))
  comet.position.set(cometR * Math.cos(cometTheta), 0, cometR * Math.sin(cometTheta))

  // Helix: circular orbit with rising y component
  helixObj.position.set(
    HELIX_RADIUS * Math.cos(HELIX_OMEGA * time),
    ((HELIX_ASCENT * time) % 4) - 2,    // wrap y in [-2, 2]
    HELIX_RADIUS * Math.sin(HELIX_OMEGA * time)
  )

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 19: Procedural Geometry ───────────────────────────────────
            {
              id: 19,
              cellTitle: 'Procedural geometry — BufferGeometry from scratch',
              mode: '3d',
              prose: [
                '`BufferGeometry` lets you build any shape by writing vertex positions directly into a `Float32Array`. A terrain is a grid of `COLS × ROWS` vertices, with height `y = f(x, z)`. Neighboring vertices are connected into triangles via an **index buffer** — two triangles per quad, six indices per quad.',
                '`geometry.computeVertexNormals()` calculates the per-vertex normals automatically from the triangle geometry. Without normals, `MeshStandardMaterial` renders black. Call it once after setting positions (or whenever you change the vertex layout). For animation, update positions and call it again each frame.',
                'The wave terrain updates `y` each frame using a sine function that advances with time. Only the position attribute changes — geometry, material, and index buffer stay the same. This is the pattern for deforming meshes: allocate once, mutate per frame.',
              ],
              code: `// ── Procedural Geometry — animated wave terrain ──────────────

const GRID_W     = 28     // vertices wide
const GRID_D     = 28     // vertices deep
const TILE_SIZE  = 0.38   // distance between vertices (units)

// Wave parameters
const WAVE_AMP   = 0.65   // wave height (units)
const WAVE_FREQ  = 1.20   // spatial frequency (higher = tighter waves)
const WAVE_SPEED = 1.40   // animation speed (rad/s)

// Grid spans: GRID_W × GRID_D vertices → (GRID_W-1)×(GRID_D-1) quads → ×2 triangles
const VERTEX_COUNT   = GRID_W * GRID_D
const TRIANGLE_COUNT = (GRID_W - 1) * (GRID_D - 1) * 2

let posAttr    // BufferAttribute — position data
let geo        // the reused geometry
let time = 0

function vertexIdx(col, row) { return row * GRID_W + col }

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.35))
  const sun = new THREE.DirectionalLight(0xffeedd, 1.2)
  sun.position.set(8, 10, 6)
  scene.add(sun)
  const back = new THREE.DirectionalLight(0x4466ff, 0.35)
  back.position.set(-4, 2, -6)
  scene.add(back)

  // ── Allocate position array: [x0,y0,z0, x1,y1,z1, ...] ───
  const posArray = new Float32Array(VERTEX_COUNT * 3)
  posAttr = new THREE.BufferAttribute(posArray, 3)
  posAttr.setUsage(THREE.DynamicDrawUsage)  // hint: updated frequently

  // Set initial XZ positions — these never change
  for (let row = 0; row < GRID_D; row++) {
    for (let col = 0; col < GRID_W; col++) {
      const i = vertexIdx(col, row)
      posArray[i * 3]     = (col - GRID_W / 2) * TILE_SIZE   // x
      posArray[i * 3 + 2] = (row - GRID_D / 2) * TILE_SIZE   // z
      // y (height) is set each frame in update()
    }
  }

  // ── Build index buffer: 2 triangles per quad ─────────────
  const indices = new Uint32Array(TRIANGLE_COUNT * 3)
  let idx = 0
  for (let row = 0; row < GRID_D - 1; row++) {
    for (let col = 0; col < GRID_W - 1; col++) {
      const tl = vertexIdx(col,     row)
      const tr = vertexIdx(col + 1, row)
      const bl = vertexIdx(col,     row + 1)
      const br = vertexIdx(col + 1, row + 1)
      // Triangle 1: tl → bl → br
      indices[idx++] = tl; indices[idx++] = bl; indices[idx++] = br
      // Triangle 2: tl → br → tr
      indices[idx++] = tl; indices[idx++] = br; indices[idx++] = tr
    }
  }

  geo = new THREE.BufferGeometry()
  geo.setAttribute('position', posAttr)
  geo.setIndex(new THREE.BufferAttribute(indices, 1))

  scene.add(new THREE.Mesh(geo,
    new THREE.MeshStandardMaterial({ color: 0x2255aa, roughness: 0.55, side: THREE.DoubleSide })
  ))

  // Wireframe overlay to show the triangle grid
  scene.add(new THREE.Mesh(geo,
    new THREE.MeshBasicMaterial({ color: 0x4477cc, wireframe: true, opacity: 0.2, transparent: true })
  ))

  camera.position.set(0, 7, 12)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt
  const posArray = posAttr.array

  // Update Y (height) for every vertex based on the wave function
  for (let row = 0; row < GRID_D; row++) {
    for (let col = 0; col < GRID_W; col++) {
      const i = vertexIdx(col, row)
      const x = posArray[i * 3]
      const z = posArray[i * 3 + 2]
      // Diagonal wave: sin(x + z + phase)
      posArray[i * 3 + 1] = WAVE_AMP * Math.sin(WAVE_FREQ * (x + z) - WAVE_SPEED * time)
    }
  }

  posAttr.needsUpdate = true
  geo.computeVertexNormals()   // recompute normals after deforming vertices

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 20: Raycasting ────────────────────────────────────────────
            {
              id: 20,
              cellTitle: 'Raycasting — mouse picking, hit normals, and object placement',
              mode: '3d',
              prose: [
                '`THREE.Raycaster` converts a 2D mouse position to a 3D ray from the camera through that screen pixel. `setFromCamera(normalizedMouse, camera)` sets up the ray; `intersectObjects(array)` returns all hits sorted by distance. Each hit has `point` (world position), `face.normal` (surface normal at the hit), and `object` (the mesh that was hit).',
                'Mouse position must be **normalized** to the range [−1, +1] in both X and Y, relative to the canvas element. Use `getBoundingClientRect()` to convert from browser coordinates to canvas-local, then rescale.',
                '`hit.face.normal` is in **object local space**. To get the world-space normal, transform it with `normal.transformDirection(mesh.matrixWorld)`. This is needed to place stickers, place decals, or orient objects flush on any surface.',
              ],
              code: `// ── Raycasting — mouse picking and surface placement ─────────

const FLOOR_SIZE    = 16
const SPHERE_COUNT  = 8
const MARKER_SIZE   = 0.08

// Pickable meshes and marker spheres (placed on click)
const pickable = []
let markers = []

const raycaster = new THREE.Raycaster()
const _mouse    = new THREE.Vector2()

// Normal arrow scratch
const _worldNormal = new THREE.Vector3()

// Event handlers — stored so we can remove them if the cell is re-run
let onMoveHandler = null
let onClickHandler = null

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.40))
  const sun = new THREE.DirectionalLight(0xffffff, 1.0)
  sun.position.set(5, 8, 3)
  scene.add(sun)

  // Floor — included in pickable so we can place markers on it
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  pickable.push(floor)
  scene.add(floor)

  // Coloured spheres to pick
  for (let i = 0; i < SPHERE_COUNT; i++) {
    const hue = i / SPHERE_COUNT
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.55 + Math.random() * 0.3, 22, 22),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.5),
        roughness: 0.3 + Math.random() * 0.5,
        emissive: new THREE.Color(0x000000),  // filled on hover
      })
    )
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      0.55 + Math.random() * 0.5,
      (Math.random() - 0.5) * 10
    )
    scene.add(mesh)
    pickable.push(mesh)
  }

  // Remove old listeners before re-registering (handles cell re-run)
  if (onMoveHandler)  renderer.domElement.removeEventListener('mousemove', onMoveHandler)
  if (onClickHandler) renderer.domElement.removeEventListener('click',     onClickHandler)

  // ── Hover: glow the hovered object ───────────────────────
  onMoveHandler = (e) => {
    const rect = renderer.domElement.getBoundingClientRect()
    _mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1
    _mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
    raycaster.setFromCamera(_mouse, camera)

    // Reset all emissives, then set the hovered one
    pickable.forEach(m => { if (m.material.emissive) m.material.emissive.set(0x000000) })
    const hits = raycaster.intersectObjects(pickable)
    if (hits.length > 0 && hits[0].object !== pickable[0]) {
      hits[0].object.material.emissive.set(0x224422)   // subtle green glow
    }
  }

  // ── Click: place a small marker at the hit point ─────────
  onClickHandler = (e) => {
    const rect = renderer.domElement.getBoundingClientRect()
    _mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1
    _mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
    raycaster.setFromCamera(_mouse, camera)

    const hits = raycaster.intersectObjects(pickable)
    if (hits.length === 0) return

    const hit = hits[0]

    // Convert face normal from object space to world space
    _worldNormal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld)

    // Place a tiny marker sphere at the hit point, slightly above the surface
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(MARKER_SIZE, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    )
    marker.position.copy(hit.point).addScaledVector(_worldNormal, MARKER_SIZE)
    scene.add(marker)
    markers.push(marker)
  }

  renderer.domElement.addEventListener('mousemove', onMoveHandler)
  renderer.domElement.addEventListener('click',     onClickHandler)

  camera.position.set(0, 8, 12)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
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
      'Semi-implicit Euler for a spring-mass system: `v_{n+1} = v_n + a_n·Δt`, `x_{n+1} = x_n + v_{n+1}·Δt`. The position step uses the *updated* velocity — this is what makes it semi-implicit. For a simple spring `a = −ω²·x`, semi-implicit Euler conserves energy exactly (the trajectory is a slightly squashed ellipse rather than spiralling inward or outward). Explicit Euler spirals outward (energy gain); fully implicit Euler spirals inward (energy loss).',

      'Polar coordinates `(r, θ)` relate to Cartesian by `x = r·cos θ`, `z = r·sin θ`. Kepler\'s third law: `T² ∝ r³`, equivalent to `ω = √(GM/r³)`. For circular Newtonian orbits this emerges from setting centripetal force equal to gravity: `mv²/r = GMm/r²` → `v = √(GM/r)` → `ω = v/r = √(GM/r³)`. The solar system demo uses exactly this relation to set each planet\'s orbital speed.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Hooke\'s Law (spring force)',
        body: '$$F_{spring} = -k(|\\mathbf{AB}| - L_0)\\,\\hat{\\mathbf{AB}}$$\n\n$k$ = stiffness (N/m), $L_0$ = rest length. Positive when stretched (pulls toward rest), negative when compressed (pushes toward rest). Damping adds: $F_{damp} = -c\\,(\\mathbf{v}_{rel}\\cdot\\hat{\\mathbf{AB}})\\,\\hat{\\mathbf{AB}}$.',
      },
      {
        type: 'theorem',
        title: 'Kepler\'s Third Law',
        body: '$$\\omega = \\sqrt{\\frac{GM}{r^3}}$$\n\nAngular speed of a circular orbit at radius $r$. Period $T = 2\\pi/\\omega \\propto r^{3/2}$. Double the orbital radius → the period increases by $2^{3/2} \\approx 2.83\\times$.',
      },
      {
        type: 'insight',
        title: 'Index buffers and triangle winding',
        body: 'A quad (2×2 vertices: tl, tr, bl, br) needs 2 triangles: `[tl, bl, br]` and `[tl, br, tr]`. The counter-clockwise winding order (when viewed from the front) is what tells Three.js which side of the triangle is the front face. Reversing the order flips the normal, which flips lighting and back-face culling.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenge — Combine the Recipes',
        mathBridge: 'This challenge combines orbital paths, procedural geometry, and raycasting to build an interactive planetary system.',
        caption: 'Open-ended build. Break things freely — the error console at the bottom of the preview is your friend.',
        initialProps: {
          initialCells: [

            {
              id: 'c4',
              challengeType: 'build',
              challengeNumber: 4,
              challengeTitle: 'Gravity sandbox — click to place orbiting bodies',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'Combine raycasting and orbital paths: when the user clicks on the floor, spawn a new planet at that position. Each new planet should orbit the central star using Keplerian speed based on its distance from the origin. Use a small sphere for each planet and give each a random color and size. The starter code handles the ray-to-floor intersection; you need to spawn the planet and add it to the orbit update loop.',
              ],
              prompt: 'Click anywhere on the floor to place a new planet that immediately starts orbiting the central star. Use polar coordinates for the orbit — no physics integration needed. Each planet\'s orbital speed should follow Kepler\'s third law: ω = sqrt(GM / r³) where r is the distance from the origin. Show at least 5 planets at once. Add a trail for each planet using the circular buffer technique from Part 3.',
              hint: 'Store planets in an array: `{ r, omega, theta0, mesh }`. On click, get the hit point from the raycaster, compute `r = sqrt(x²+z²)`, compute `omega = sqrt(GM / r**3)`, then store `theta0 = atan2(hit.z, hit.x)`. In update(), `theta = theta0 + omega * time`.',
              code: `// Starter: gravity sandbox
// Click the floor to place a new orbiting planet

const GM         = 28.0    // standard gravitational parameter
const STAR_SIZE  = 0.65
const MAX_RADIUS = 9.0     // don't place planets too far out

const raycaster = new THREE.Raycaster()
const _mouse    = new THREE.Vector2()

const planets   = []   // { r, omega, theta0, mesh }
let floor, time = 0
let clickHandler = null

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.3))
  scene.add(new THREE.PointLight(0xffeecc, 60, 0, 1.5))

  // Central star
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(STAR_SIZE, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffcc33 })
  ))

  // Clickable floor
  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(MAX_RADIUS * 2.2, MAX_RADIUS * 2.2),
    new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: 1.0 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.05
  scene.add(floor)

  // Remove previous listener if cell was re-run
  if (clickHandler) renderer.domElement.removeEventListener('click', clickHandler)

  clickHandler = (e) => {
    const rect = renderer.domElement.getBoundingClientRect()
    _mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
    _mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
    raycaster.setFromCamera(_mouse, camera)
    const hits = raycaster.intersectObject(floor)
    if (hits.length === 0) return

    const p = hits[0].point
    const r = Math.sqrt(p.x * p.x + p.z * p.z)
    if (r < STAR_SIZE + 0.5 || r > MAX_RADIUS) return

    // TODO: compute omega from Kepler's third law
    // TODO: create a Mesh and add to planets array
    // TODO: add to scene
  }
  renderer.domElement.addEventListener('click', clickHandler)

  camera.position.set(0, 16, 0.1)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  // TODO: update each planet's position using polar coordinates
  // theta = theta0 + omega * time
  // planet.mesh.position.set(r * cos(theta), 0, r * sin(theta))

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
      text: 'Planets orbit in the XZ plane: `position.set(r*cos(theta), 0, r*sin(theta))`. Why XZ rather than XY?',
      options: [
        'Three.js does not support Y-axis orbits',
        'Three.js uses Y-up. The XZ plane is the "ground" plane — horizontal in the 3D scene. Orbiting in XZ makes planets circle around the Y axis, which looks horizontal when viewed from above. XY orbits would make planets appear to rotate in a vertical circle like a Ferris wheel',
        'cos and sin are only valid for X and Z coordinates',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'theta = theta0 + omega * time for each planet. What is omega and why is it different for each planet?',
      options: [
        'omega is the orbital radius; larger orbits have larger omega',
        'omega is angular velocity in radians per second (omega = 2π / period). Inner planets have shorter periods so higher omega — they complete orbits faster. This mirrors Kepler\'s third law: period² ∝ radius³, so inner planets orbit faster than outer ones',
        'omega is a random seed so planets do not all start at the same angle',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'theta0 gives each planet a different starting angle. What would happen if all planets started with theta0 = 0?',
      options: [
        'The simulation would crash because all positions would be identical',
        'All planets would start at (r, 0, 0) along the +X axis and orbit in phase — they\'d always be in a line. theta0 staggers them so the solar system looks natural at t=0 rather than unrealistically lined up',
        'Only one planet would be visible because they overlap perfectly',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Procedural geometry (creating a sphere programmatically) vs importing a .glb model — when would you choose procedural?',
      options: [
        'Always — procedural geometry is always faster to render',
        'Procedural is ideal when the shape is mathematically simple (sphere, torus, box) and you need to control parameters like radius or resolution at runtime. Imported .glb models are better for complex organic shapes (characters, buildings) that are impractical to describe mathematically',
        'Procedural geometry only works for planets; .glb is required for everything else',
      ],
      correct: 1,
    },
  ],
}
