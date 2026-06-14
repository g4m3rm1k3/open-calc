export default {
  id: 'sim1-006',
  slug: 'building-blocks-part-2-motion-physics',
  chapter: 'sim1',
  order: 6,
  title: 'Building Blocks Part 2 — Motion & Physics',
  subtitle: 'Five self-contained recipes: axis-aligned bounce, curved-surface reflection, spring tracking, particle systems, and InstancedMesh.',
  tags: ['three.js', 'physics', 'reflection', 'spring', 'particles', 'instancing', 'BufferGeometry', 'InstancedMesh', 'velocity'],
  aliases: 'bounce reflection spring follow particle instanced mesh velocity physics motion building blocks',
  timeToComplete: 30,
  coreConcept: 'Motion in simulations comes down to a handful of vector operations — velocity reflection for bouncing, exponential decay for smooth following, and buffer tricks for thousands of moving objects. These five patterns cover 90% of what you need for physics-based scenes.',
  prerequisites: ['building-blocks-objects-and-techniques'],
  nextLesson: 'building-blocks-part-3-advanced-techniques',

  hook: {
    question: 'A bouncing ball, a follow camera, a particle explosion, a crowd of NPCs — they all look different, but they share the same three vector formulas. Can you spot them?',
    realWorldContext: "The reflection formula `v' = v − 2(v·n)n` is used in ray tracers, game physics engines, and acoustics simulators. The exponential decay spring is in every third-person camera in every AAA game. Particle BufferAttributes are how Fortnite's explosion effects render 10,000 sparks without stalling the GPU.",
  },

  intuition: {
    prose: [
      "**Velocity reflection off a surface uses one formula regardless of shape.** Given incoming velocity **v** and surface unit normal **n** at the contact point: `v' = v − 2(v·n)n`. For axis-aligned walls this simplifies to flipping one component. For a sphere it's identical — just compute `n = normalize(contactPoint − center)` first. The same formula works for any convex surface.",

      "**Spring-follow (exponential decay) is the smoothest way to track a moving target.** Each frame: `position += (target − position) × k × dt`. The gap closes by fraction `k·dt` per frame, so the follower accelerates when far and decelerates when close — exactly like a critically damped spring. This produces the 'camera follow' feel used in every third-person game.",

      "**Never allocate inside `update()`.** Creating `new THREE.Vector3()`, `new THREE.Matrix4()`, or `new Float32Array()` inside `update()` allocates heap memory every frame. At 60 fps this triggers the garbage collector thousands of times per minute, causing stutters. Declare these objects once in `init()` (or at module level) and reuse them — prefix scratch variables with `_` as a convention.",

      "**`THREE.InstancedMesh` renders N copies in one draw call.** Each `THREE.Mesh` object costs one GPU draw call. 500 separate meshes = 500 draw calls. `THREE.InstancedMesh(geometry, material, count)` renders all copies in one draw call — each instance has its own `Matrix4` transform set via `setMatrixAt(i, matrix)`. Critical for particles, forests, crowds, any system with many identical objects.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why Math.abs before flipping?',
        body: 'When a fast ball tunnels slightly past a wall, its center is already beyond the limit. If you just flip the sign of velocity without clamping, the ball stays outside and bounces inward — then outward — forever. Using `Math.abs(vx)` before negating guarantees the sign is always correct regardless of how deep the penetration is.',
      },
      {
        type: 'warning',
        title: 'Never allocate inside update()',
        body: 'Creating `new THREE.Vector3()`, `new THREE.Matrix4()`, or `new Float32Array()` inside `update()` allocates heap memory every frame. At 60 fps this triggers the garbage collector thousands of times per minute, causing stutters. Declare these objects once in `init()` (or at module level) and reuse them.',
      },
      {
        type: 'definition',
        title: 'InstancedMesh — one draw call for N copies',
        body: 'Each `THREE.Mesh` object costs one GPU draw call. 500 separate meshes = 500 draw calls. `THREE.InstancedMesh(geometry, material, count)` renders all copies in one draw call — each instance has its own `Matrix4` transform set via `setMatrixAt(i, matrix)`. Critical for particles, forests, crowds, any system with many identical objects.',
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

            // ── Cell 6: Bounce off flat walls ──────────────────────────────────
            {
              id: 6,
              cellTitle: 'Bounce off flat walls — axis-aligned reflection',
              mode: '3d',
              prose: [
                'When a ball hits an axis-aligned wall, the velocity component *perpendicular to the wall* reverses. For a wall with normal [1,0,0] (the +X face), only the X component flips: `vx = -vx`. The Y and Z components are unaffected — they are *tangential* to the surface and experience no normal force.',
                'Multiply the reflected component by `RESTITUTION` (0–1) to model energy loss. `1.0` = perfectly elastic (no energy loss). `0.85` = a good rubber ball. `0.4` = clay or sand. Setting the absolute value before flipping (`-Math.abs(vx)`) prevents the ball from tunnelling through a wall it\'s already partially inside.',
                'This is actually the same formula as the general reflection `v\' = v − 2(v·n)n` — for an axis-aligned wall it just simplifies to one sign flip. The next cell uses the full vector formula for curved surfaces.',
              ],
              code: `// ── Bounce off flat walls — axis-aligned reflection ──────────

const BALL_RADIUS = 0.35
const ROOM_HALF   = 4.0     // half-size of the cubic room
const GRAVITY     = 9.0     // acceleration downward (units/s²)
const RESTITUTION = 0.82    // fraction of speed retained per bounce (0–1)

// Wall limit: ball center must stay this far inside the room
const WALL_LIMIT = ROOM_HALF - BALL_RADIUS

let ball, velocity

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const light = new THREE.DirectionalLight(0xffffff, 0.8)
  light.position.set(3, 6, 3)
  scene.add(light)

  ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xff5533, roughness: 0.3 })
  )
  ball.position.set(0, 2, 0)
  scene.add(ball)

  // Initial diagonal throw
  velocity = new THREE.Vector3(3.5, 4.5, 2.8)   // units/s

  // Room — BackSide renders only the inside faces so the camera inside can see the walls
  scene.add(new THREE.Mesh(
    new THREE.BoxGeometry(ROOM_HALF * 2, ROOM_HALF * 2, ROOM_HALF * 2),
    new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 1, side: THREE.BackSide })
  ))

  camera.position.set(7, 5, 9)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // Apply gravity (−Y direction)
  velocity.y -= GRAVITY * dt

  // Integrate position (Euler step)
  ball.position.addScaledVector(velocity, dt)

  // ── Bounce off each wall pair ──────────────────────────────
  // Using Math.abs before flipping ensures a consistent sign even if the ball
  // has tunnelled slightly past the wall in a previous frame.
  if (ball.position.x >  WALL_LIMIT) { ball.position.x =  WALL_LIMIT; velocity.x = -Math.abs(velocity.x) * RESTITUTION }
  if (ball.position.x < -WALL_LIMIT) { ball.position.x = -WALL_LIMIT; velocity.x =  Math.abs(velocity.x) * RESTITUTION }
  if (ball.position.y >  WALL_LIMIT) { ball.position.y =  WALL_LIMIT; velocity.y = -Math.abs(velocity.y) * RESTITUTION }
  if (ball.position.y < -WALL_LIMIT) { ball.position.y = -WALL_LIMIT; velocity.y =  Math.abs(velocity.y) * RESTITUTION }
  if (ball.position.z >  WALL_LIMIT) { ball.position.z =  WALL_LIMIT; velocity.z = -Math.abs(velocity.z) * RESTITUTION }
  if (ball.position.z < -WALL_LIMIT) { ball.position.z = -WALL_LIMIT; velocity.z =  Math.abs(velocity.z) * RESTITUTION }

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 7: Bounce off a sphere ────────────────────────────────────
            {
              id: 7,
              cellTitle: 'Bounce off a curved surface — vector reflection v′ = v − 2(v·n)n',
              mode: '3d',
              prose: [
                'The general reflection formula works for *any* surface: `v\' = v − 2(v·n)n` where **n** is the outward unit normal at the contact point. For a sphere centered at the origin, the outward normal at a surface point **p** is simply `normalize(p)` — it points radially outward.',
                '`velocity.dot(normal)` computes how much velocity is pointing *into* the sphere (a negative value). We only reflect when `vDotN < 0` — if the ball is already moving away, applying the formula would trap it instead of freeing it.',
                'Multiply the result by `RESTITUTION` to lose energy on contact. The formula is identical for a box, a cylinder, or a terrain heightmap — you just need to compute the surface normal at the hit point differently.',
              ],
              code: `// ── Bounce off a curved surface — vector reflection ──────────
// v' = v - 2 * (v · n) * n
// n  = outward unit normal at the contact point
// For a sphere at origin: n = normalize(ballPosition)

const OBSTACLE_RADIUS = 2.50   // the sphere we bounce off
const BALL_RADIUS     = 0.28
const GRAVITY         = 6.0
const RESTITUTION     = 0.80
const ROOM_HALF       = 5.0
const ROOM_LIMIT      = ROOM_HALF - BALL_RADIUS

// Contact distance: ball surface touches sphere surface when centers
// are exactly this far apart
const CONTACT_DIST = OBSTACLE_RADIUS + BALL_RADIUS

let ball, velocity

// Reusable vector objects — allocated once to avoid per-frame GC
const _normal = new THREE.Vector3()

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
  sunLight.position.set(4, 8, 4)
  scene.add(sunLight)

  // The obstacle sphere — semi-transparent so we can see inside
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(OBSTACLE_RADIUS, 36, 36),
    new THREE.MeshStandardMaterial({
      color:       0x2255aa,
      roughness:   0.4,
      metalness:   0.2,
      transparent: true,
      opacity:     0.55,
      side:        THREE.DoubleSide,
    })
  ))

  ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xff6633, emissive: 0x221100 })
  )
  ball.position.set(0, OBSTACLE_RADIUS + 2.5, 0)
  scene.add(ball)

  velocity = new THREE.Vector3(1.8, -1.5, 1.0)   // initial diagonal throw

  // Outer box room (BackSide = see inside)
  scene.add(new THREE.Mesh(
    new THREE.BoxGeometry(ROOM_HALF * 2, ROOM_HALF * 2, ROOM_HALF * 2),
    new THREE.MeshStandardMaterial({ color: 0x111122, side: THREE.BackSide })
  ))

  camera.position.set(0, 6, 12)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  velocity.y -= GRAVITY * dt
  ball.position.addScaledVector(velocity, dt)

  // ── Sphere collision: check distance from origin ─────────────
  const dist = ball.position.length()   // obstacle is at origin

  if (dist < CONTACT_DIST) {
    // Push ball to surface so it's not embedded
    _normal.copy(ball.position).normalize()   // outward radial normal
    ball.position.copy(_normal).multiplyScalar(CONTACT_DIST)

    // Reflect: v' = v - 2*(v·n)*n
    const vDotN = velocity.dot(_normal)
    if (vDotN < 0) {   // only reflect if moving toward the sphere
      velocity.addScaledVector(_normal, -2 * vDotN)
      velocity.multiplyScalar(RESTITUTION)
    }
  }

  // Outer room walls (axis-aligned, same as previous cell)
  if (ball.position.x >  ROOM_LIMIT) { ball.position.x =  ROOM_LIMIT; velocity.x = -Math.abs(velocity.x) * RESTITUTION }
  if (ball.position.x < -ROOM_LIMIT) { ball.position.x = -ROOM_LIMIT; velocity.x =  Math.abs(velocity.x) * RESTITUTION }
  if (ball.position.y >  ROOM_LIMIT) { ball.position.y =  ROOM_LIMIT; velocity.y = -Math.abs(velocity.y) * RESTITUTION }
  if (ball.position.y < -ROOM_LIMIT) { ball.position.y = -ROOM_LIMIT; velocity.y =  Math.abs(velocity.y) * RESTITUTION }
  if (ball.position.z >  ROOM_LIMIT) { ball.position.z =  ROOM_LIMIT; velocity.z = -Math.abs(velocity.z) * RESTITUTION }
  if (ball.position.z < -ROOM_LIMIT) { ball.position.z = -ROOM_LIMIT; velocity.z =  Math.abs(velocity.z) * RESTITUTION }

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 8: Spring follow ──────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Spring follow / smooth tracking — exponential decay',
              mode: '3d',
              prose: [
                'The simplest smooth follower: each frame, move the follower a fixed *fraction* of the remaining gap toward the target: `pos += (target − pos) × k × dt`. When far away, the step is large. When close, the step is tiny. The gap shrinks exponentially — this is why it\'s called exponential decay.',
                '`k` is the stiffness constant. After time `T`, the remaining distance is `e^(-kT)` of the original. At `k = 4`, after 0.5 seconds the follower is within `e^(-2) ≈ 13%` of the starting gap. Higher `k` = snappier response.',
                'This is equivalent to a critically-damped spring with no overshoot. Game engines use it everywhere: follow cameras, UI animations, inventory item magnetism, enemy lock-on, aim assist. It\'s more stable than a full spring (which can overshoot and oscillate) and smoother than lerp with a fixed step.',
              ],
              code: `// ── Spring follow — exponential decay tracking ───────────────

const STIFFNESS       = 4.0    // spring constant k — higher = snappier
const TARGET_SPEED    = 1.0    // rad/s — how fast the target orbits
const TARGET_RADIUS   = 3.8    // orbit radius of the target
const BOB_AMPLITUDE   = 1.8    // vertical bob height
const BOB_FREQ_HZ     = 0.60   // bobs per second

let ghost, follower, time = 0

// Reusable vector to avoid allocation in update()
const _gap = new THREE.Vector3()

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
  sunLight.position.set(3, 8, 4)
  scene.add(sunLight)

  // Ghost: the moving target — shown semi-transparent
  ghost = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 16, 16),
    new THREE.MeshStandardMaterial({
      color:       0xffffff,
      transparent: true,
      opacity:     0.25,
      emissive:    0x888888,
    })
  )
  scene.add(ghost)

  // Follower: lags behind the ghost with spring dynamics
  follower = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xff4488, roughness: 0.3, emissive: 0x220011 })
  )
  follower.position.set(TARGET_RADIUS, 0, 0)   // start at an offset so we see the lag
  scene.add(follower)

  scene.add(new THREE.GridHelper(14, 14, 0x222233, 0x222233))

  camera.position.set(0, 9, 14)
  camera.lookAt(0, 1, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  // Ghost target: circular orbit with sinusoidal vertical bob
  const bobOmega = BOB_FREQ_HZ * 2 * Math.PI   // convert Hz to rad/s
  ghost.position.set(
    Math.cos(time * TARGET_SPEED) * TARGET_RADIUS,
    Math.sin(time * bobOmega) * BOB_AMPLITUDE + 1.5,
    Math.sin(time * TARGET_SPEED) * TARGET_RADIUS
  )

  // Spring follow: each frame, close k*dt fraction of the remaining gap
  // After time T, remaining distance = original * e^(-k*T)
  _gap.subVectors(ghost.position, follower.position)
  follower.position.addScaledVector(_gap, STIFFNESS * dt)

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 9: Particle system ────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Particle system — Points geometry with BufferAttribute',
              mode: '3d',
              prose: [
                '`THREE.Points` renders one visible point per vertex in a `BufferGeometry`. The key to performance: **never create new geometry each frame**. Instead, write directly into the `Float32Array` backing the `position` attribute and set `positionAttribute.needsUpdate = true`. This tells Three.js to re-upload just that buffer to the GPU — it\'s much faster than rebuilding geometry.',
                'Each particle stores its own position, velocity, and age in plain arrays. When a particle\'s age exceeds its lifetime, `spawnParticle(i)` resets it to the origin with a new random velocity — this is **object pooling**: reuse the slot instead of creating and destroying objects.',
                'The burst uses **uniform sphere sampling**: `phi = acos(2*random − 1)` ensures particles spread evenly over the sphere surface (not just near the poles). Biasing `vy` upward gives the "explosion" shape rather than a perfect sphere.',
              ],
              code: `// ── Particle System — Points with BufferAttribute ────────────

const PARTICLE_COUNT    = 800
const SPEED_MIN         = 2.0    // slowest particle (units/s)
const SPEED_MAX         = 9.0    // fastest particle  (units/s)
const PARTICLE_RADIUS   = 0.12   // visual size of each dot
const GRAVITY           = 4.5    // downward acceleration
const PARTICLE_LIFETIME = 3.2    // seconds before particle resets
const FLOOR_Y           = -2.0   // bounce height
const FLOOR_RESTITUTION = 0.45   // energy kept when bouncing off floor

let posAttr                              // BufferAttribute reference
const positions  = []                    // THREE.Vector3 per particle
const velocities = []                    // THREE.Vector3 per particle
const ages       = new Float32Array(PARTICLE_COUNT)

function spawnParticle(i) {
  positions[i].set(0, 0, 0)
  ages[i] = 0

  // Uniform direction on unit sphere using spherical coordinates
  const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)
  const theta = Math.random() * Math.PI * 2
  const phi   = Math.acos(2 * Math.random() - 1)   // uniform on sphere surface

  velocities[i].set(
    Math.sin(phi) * Math.cos(theta) * speed,
    Math.sin(phi) * Math.sin(theta) * speed,
    Math.cos(phi) * speed
  )
  // Bias upward so it looks like an upward burst, not a full sphere
  velocities[i].y = Math.abs(velocities[i].y) + SPEED_MIN
}

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.3))
  scene.add(new THREE.GridHelper(18, 18, 0x222233, 0x222233))

  // Pre-allocate all simulation arrays — never allocate inside update()
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions.push(new THREE.Vector3())
    velocities.push(new THREE.Vector3())
  }

  // Flat Float32Array: [x0,y0,z0, x1,y1,z1, ...]
  const posArray = new Float32Array(PARTICLE_COUNT * 3)
  posAttr = new THREE.BufferAttribute(posArray, 3)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', posAttr)

  const mat = new THREE.PointsMaterial({
    color:           0xff8844,
    size:            PARTICLE_RADIUS,
    sizeAttenuation: true,     // size scales with depth (perspective-correct)
    transparent:     true,
    opacity:         0.92,
  })

  scene.add(new THREE.Points(geo, mat))

  // Stagger starting ages so they don't all reset simultaneously
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    spawnParticle(i)
    ages[i] = Math.random() * PARTICLE_LIFETIME   // random phase offset
  }

  camera.position.set(0, 5, 14)
  camera.lookAt(0, 2, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    ages[i] += dt
    if (ages[i] > PARTICLE_LIFETIME) { spawnParticle(i); continue }

    // Gravity
    velocities[i].y -= GRAVITY * dt

    // Integrate position
    positions[i].addScaledVector(velocities[i], dt)

    // Bounce off floor
    if (positions[i].y < FLOOR_Y) {
      positions[i].y = FLOOR_Y
      velocities[i].y = Math.abs(velocities[i].y) * FLOOR_RESTITUTION
    }

    // Write into the flat Float32Array — index = i * 3 because 3 floats per particle
    posAttr.array[i * 3]     = positions[i].x
    posAttr.array[i * 3 + 1] = positions[i].y
    posAttr.array[i * 3 + 2] = positions[i].z
  }

  // Signal Three.js that the position buffer was modified
  posAttr.needsUpdate = true

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 10: Instanced Mesh ────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'InstancedMesh — 500 objects in one draw call',
              mode: '3d',
              prose: [
                '`THREE.InstancedMesh(geometry, material, count)` renders `count` copies of the same geometry/material in a single GPU draw call. Each copy has its own `Matrix4` transform set via `mesh.setMatrixAt(i, matrix)`. Compare this to 500 separate `Mesh` objects which would require 500 draw calls — the difference in performance becomes visible around 50+ objects.',
                'The `_matrix.compose(position, quaternion, scale)` call builds the 4×4 transform from its components. The underscore prefix on `_matrix`, `_quat`, etc. is a convention signalling "reuse this — don\'t create a new one." All helper objects are declared at module level, not inside `update()`.',
                'After updating all instance matrices, `mesh.instanceMatrix.needsUpdate = true` tells Three.js to re-upload the matrix array to the GPU. Without this line, the objects appear frozen even though the matrices were changed.',
              ],
              code: `// ── InstancedMesh — 500 spinning cubes, 1 draw call ─────────

const INSTANCE_COUNT  = 500
const GRID_SPREAD_XZ  = 22     // XZ spread of the cloud
const GRID_SPREAD_Y   = 7      // vertical spread
const BOX_SIZE        = 0.28   // each cube's side length
const SPIN_SPEED_MAX  = 2.8    // max angular speed (rad/s) per instance

// Per-instance simulation state
const spinRates     = new Float32Array(INSTANCE_COUNT)  // rad/s each
const yRotations    = new Float32Array(INSTANCE_COUNT)  // current Y angle
const basePositions = []                                 // THREE.Vector3 per instance

// Reusable transform objects — declared once, mutated every frame
const _position = new THREE.Vector3()
const _scale    = new THREE.Vector3(1, 1, 1)    // all instances same scale
const _euler    = new THREE.Euler()
const _quat     = new THREE.Quaternion()
const _matrix   = new THREE.Matrix4()

let instMesh

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.1)
  sunLight.position.set(5, 10, 5)
  scene.add(sunLight)

  const geo = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE)
  const mat = new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.5, metalness: 0.2 })

  instMesh = new THREE.InstancedMesh(geo, mat, INSTANCE_COUNT)
  scene.add(instMesh)

  // Randomise starting positions and spin rates
  for (let i = 0; i < INSTANCE_COUNT; i++) {
    basePositions.push(new THREE.Vector3(
      (Math.random() - 0.5) * GRID_SPREAD_XZ,
      (Math.random() - 0.5) * GRID_SPREAD_Y,
      (Math.random() - 0.5) * GRID_SPREAD_XZ
    ))
    yRotations[i] = Math.random() * Math.PI * 2
    spinRates[i]  = (Math.random() - 0.5) * 2 * SPIN_SPEED_MAX
  }

  camera.position.set(0, 8, 22)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  for (let i = 0; i < INSTANCE_COUNT; i++) {
    yRotations[i] += spinRates[i] * dt

    // Build the 4×4 matrix from position + rotation + scale
    _position.copy(basePositions[i])
    _euler.set(
      yRotations[i] * 0.3,   // slight X tilt so all three axes spin
      yRotations[i],
      yRotations[i] * 0.6
    )
    _quat.setFromEuler(_euler)
    _matrix.compose(_position, _quat, _scale)

    instMesh.setMatrixAt(i, _matrix)
  }

  // Required: tells Three.js the matrix buffer changed
  instMesh.instanceMatrix.needsUpdate = true

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
      'The velocity reflection formula `v\' = v − 2(v·n)n` is a direct application of vector projection. The term `(v·n)n` projects **v** onto the normal direction — it is the component of velocity perpendicular to the surface. Subtracting it twice removes the inward component and replaces it with the outward component. The result is a vector with identical tangential speed but reversed normal speed.',

      'Exponential decay `x(t) = x₀ e^{-kt}` describes any process where the rate of change is proportional to the current value. In discrete time: `x_{n+1} = x_n × (1 − k·Δt)`. The spring-follow implementation `pos += (target − pos) × k × dt` is this exact formula applied to the gap. Setting `k = ln(2) / T_{half}` gives you precise control over the half-life.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Velocity Reflection',
        body: '$$\\mathbf{v}^\\prime = \\mathbf{v} - 2(\\mathbf{v} \\cdot \\hat{n})\\hat{n}$$\n\n$\\hat{n}$ is the outward unit normal at the contact point. $(\\mathbf{v} \\cdot \\hat{n})$ is negative when moving into the surface, so the formula adds a positive outward component.',
      },
      {
        type: 'theorem',
        title: 'Exponential Decay / Spring Follow',
        body: '$$x(t) = x_0\\,e^{-kt}$$\n\nDiscrete form (used in code): `gap *= (1 − k·dt)` each frame. Half-life: $T_{½} = \\ln(2)/k \\approx 0.693/k$ seconds. At $k=4$: half-life ≈ 0.17 s.',
      },
      {
        type: 'insight',
        title: 'Uniform Point on a Sphere — Why acos(2u−1)?',
        body: 'Picking `phi = random() * PI` gives more samples near the poles (where sphere surface area is small). The correct formula is `phi = acos(2*random() - 1)`, which accounts for the varying surface element `dA = sin(phi) dφ dθ`. This is inverse CDF sampling of the uniform sphere distribution.',
      },
      {
        type: 'procedure',
        title: 'InstancedMesh Update Pattern',
        body: '```js\n// Once per frame, for each instance:\ninstMesh.setMatrixAt(i, matrix)\n// After the loop:\ninstMesh.instanceMatrix.needsUpdate = true\n```\nNever forget the `needsUpdate = true` line — without it Three.js does not re-upload the matrix buffer to the GPU and the instances appear frozen.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenge — Combine the Recipes',
        mathBridge: 'This challenge builds directly on path-following from Part 1 and the motion patterns from this lesson.',
        caption: 'Open-ended build. Break things freely — the error console at the bottom of the preview is your friend.',
        initialProps: {
          initialCells: [

            // ── Challenge 2: Train on tracks ───────────────────────────────────
            {
              id: 'c2',
              challengeType: 'modify',
              challengeNumber: 2,
              challengeTitle: 'Train on tracks — multiple cars following a path',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'A train is multiple objects following the same path at different `t` offsets. If the lead car is at `t`, the second car is at `t − CAR_SPACING`, the third at `t − 2 * CAR_SPACING`, and so on. Each car uses `getPointAt` and `lookAt` independently. Use `TubeGeometry` to show the rails.',
              ],
              prompt: 'Start from the path-following cell. Add four more cars behind the lead car, each offset by CAR_SPACING along the curve. Use BoxGeometry for each car (a rectangular box looks more train-like than a sphere). Add the TubeGeometry rails. Make the train speed controllable with TRAIN_SPEED.',
              hint: 'Store the cars in an array: `cars = []`. In update(), loop over cars and set each one to `getPointAt((t - i * CAR_SPACING + 1) % 1)`. The `+ 1) % 1` keeps the value in [0,1] when spacing makes it negative.',
              code: `// Starter: train on a curved path
// Extend this to have multiple cars

const TRAIN_SPEED  = 0.08    // fraction of path per second
const CAR_SPACING  = 0.06    // t-spacing between consecutive cars
const CAR_COUNT    = 5
const CAR_W        = 0.70
const CAR_H        = 0.55
const CAR_D        = 1.20

let curve, cars = [], t = 0

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const light = new THREE.DirectionalLight(0xffffff, 1.0)
  light.position.set(4, 8, 4)
  scene.add(light)

  const controlPoints = [
    new THREE.Vector3(-5, 0.3, 0), new THREE.Vector3(-2, 0.3, 4),
    new THREE.Vector3(0,  0.3, 5), new THREE.Vector3( 3, 1.2, 2),
    new THREE.Vector3(5,  0.3,-1), new THREE.Vector3( 2, 0.3,-4),
    new THREE.Vector3(-3, 0.3,-3), new THREE.Vector3(-5, 0.3, 0),
  ]
  curve = new THREE.CatmullRomCurve3(controlPoints, true)

  // Rails
  scene.add(new THREE.Mesh(
    new THREE.TubeGeometry(curve, 120, 0.04, 6, true),
    new THREE.MeshStandardMaterial({ color: 0x555566 })
  ))

  // Lead car — TODO: add CAR_COUNT cars to the cars array
  const carGeo = new THREE.BoxGeometry(CAR_W, CAR_H, CAR_D)
  const carMat = new THREE.MeshStandardMaterial({ color: 0xcc3322 })
  const leadCar = new THREE.Mesh(carGeo, carMat)
  cars.push(leadCar)
  scene.add(leadCar)

  // TODO: create additional cars with different colors and add to scene

  scene.add(new THREE.GridHelper(14, 14, 0x222233, 0x222233))
  camera.position.set(0, 9, 14)
  camera.lookAt(0, 1, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t = (t + TRAIN_SPEED * dt) % 1

  cars.forEach((car, i) => {
    const carT      = (t - i * CAR_SPACING + 1) % 1
    const pos       = curve.getPointAt(carT)
    const lookAhead = curve.getPointAt((carT + 0.01) % 1)
    car.position.copy(pos)
    car.lookAt(lookAhead)
  })

  renderer.render(scene, camera)
}`,
            },

          ],
        },
      },
    ],
  },
}
