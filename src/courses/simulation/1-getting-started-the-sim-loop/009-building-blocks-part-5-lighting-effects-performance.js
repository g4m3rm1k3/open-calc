export default {
  id: 'sim1-009',
  slug: 'building-blocks-part-5-lighting-effects-performance',
  chapter: 'sim1',
  order: 9,
  title: 'Building Blocks Part 5 — Lighting, Effects & Performance',
  subtitle: 'Five self-contained recipes: three-point lighting, burst explosions, quaternion slerp, object pooling, and frustum/LOD culling.',
  tags: ['three.js', 'three-point-lighting', 'explosion', 'vertex-colors', 'quaternion', 'slerp', 'gimbal-lock', 'object-pooling', 'frustum-culling', 'LOD', 'performance'],
  aliases: 'three point lighting key fill rim burst explosion particle vertex color quaternion euler gimbal slerp object pool reuse frustum cull LOD level of detail performance',
  timeToComplete: 35,
  coreConcept: 'Polish and scale: three-point lighting makes scenes look professional, vertex-color particles produce dramatic effects, quaternions eliminate rotation artifacts, object pooling kills GC stutters, and frustum/LOD culling keeps frame rate stable at hundreds of objects.',
  prerequisites: ['building-blocks-part-4-physics-geometry-interaction'],
  nextLesson: null,

  hook: {
    question: 'Why does every film set use exactly three lights? Why does every game engine use quaternions instead of Euler angles? Why does GC pausing ruin your framerate even on a powerful machine?',
    realWorldContext: "Three-point lighting is a 100-year-old cinematography technique that maps directly to Three.js DirectionalLights. Quaternion slerp was invented specifically to fix the gimbal lock problem that crashed Apollo spacecraft simulation software. Object pooling was pioneered in game engines in the 1990s and is still the standard pattern for anything that spawns and despawns rapidly — bullets, explosions, enemies.",
  },

  intuition: {
    prose: [
      "**Three-point lighting** is the foundational setup for any lit 3D subject. The **key light** is the primary source — strong, usually warm, positioned 45° above and to one side. The **fill light** is softer and from the opposite side — it prevents the unlit half from going completely black. The **rim light** (or back light) comes from behind, creating a bright edge that separates the subject from the background. One DirectionalLight alone looks flat; all three together give depth and dimensionality.",

      "**Burst particles with vertex colors**: add a `color` `BufferAttribute` alongside the `position` attribute. Set `PointsMaterial.vertexColors = true` and Three.js reads per-particle RGB from the color buffer. To fade by age, write `color[i] = baseColor × (1 − age/lifetime)` each frame. This is how sparks, fire, and explosion effects work — no texture needed, just a Float32Array of RGB values.",

      "**Euler angles have a fatal flaw: gimbal lock.** When one rotation axis aligns with another, you lose a degree of freedom and the object snaps or jitters. **Quaternions** represent orientations as a point on a 4D unit sphere — they have no gimbal lock and interpolate smoothly. `Quaternion.slerpQuaternions(from, to, t)` traces the shortest arc on that sphere, producing perfectly smooth rotation between any two orientations.",

      "**Object pooling eliminates GC pauses.** `new SomeObject()` allocates heap memory. When the object goes out of scope, the garbage collector eventually reclaims it — but GC runs at unpredictable times and can pause the render loop for milliseconds. A pool pre-allocates a fixed array of objects and hands out references (`acquire()`) instead of allocating. When done, `release()` returns the object to the pool. No allocation, no GC, no stutter.",

      "**Frustum culling and LOD** keep frame rate stable as scene complexity grows. The camera frustum is the pyramid of visible space. Objects outside it can skip `update()` entirely — why simulate things you can't see? LOD (Level of Detail) reduces complexity for distant objects: a particle system at 50 units away only needs 10% of its particles; at 200 units, skip it entirely.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Three-point lighting setup',
        body: '```js\n// Key: main light, warm, from above-left\nconst key = new THREE.DirectionalLight(0xfff0dd, 1.4)\nkey.position.set(-5, 8, 4)\n// Fill: softer, cool, from right\nconst fill = new THREE.DirectionalLight(0xddeeff, 0.45)\nfill.position.set(5, 3, 4)\n// Rim: bright, from behind, separates subject from bg\nconst rim = new THREE.DirectionalLight(0xffffff, 0.80)\nrim.position.set(0, 4, -8)\n// Ambient: minimum floor level, dim\nscene.add(new THREE.AmbientLight(0x334455, 0.25))\n```',
      },
      {
        type: 'insight',
        title: 'Quaternion geometry',
        body: 'A quaternion `q = (w, x, y, z)` represents a rotation of angle `θ` around axis `(x,y,z)` as `(cos θ/2, sin(θ/2)·axis)`. It lives on the unit sphere in 4D space `w²+x²+y²+z²=1`. Slerp traces the great circle arc between two quaternions — it\'s the 4D equivalent of lerp on a circle. This guarantees constant angular speed and no gimbal lock.',
      },
      {
        type: 'procedure',
        title: 'Minimal object pool',
        body: '```js\nclass Pool {\n  constructor(factory, size) {\n    this._free = Array.from({ length: size }, factory)\n  }\n  acquire() { return this._free.pop() ?? null }  // null = pool exhausted\n  release(obj) { this._free.push(obj) }\n}\n// Usage:\nconst bulletPool = new Pool(() => new Bullet(), 64)\nconst b = bulletPool.acquire()\nif (b) { b.reset(pos, vel); active.push(b) }\n// When expired: bulletPool.release(b)\n```',
      },
      {
        type: 'definition',
        title: 'View frustum',
        body: 'The view frustum is the pyramid-shaped volume visible to the camera: near plane, far plane, and four side planes. `THREE.Frustum.containsPoint(point)` returns false for points outside. `camera.updateMatrixWorld()` + `frustum.setFromProjectionMatrix(...)` keeps the frustum current. Skipping `update()` for off-frustum objects is the single cheapest performance win in any sim.',
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

            // ── Cell 21: Three-point lighting ──────────────────────────────────
            {
              id: 21,
              cellTitle: 'Three-point lighting — key, fill, and rim lights',
              mode: '3d',
              prose: [
                'The **key light** is the dominant source — it defines shadows and sets the mood. Position it 30–45° above and to one side. Warm color (0xfff0cc) feels natural; cool (0xccddff) feels clinical. Intensity 1.2–1.8.',
                'The **fill light** comes from the opposite side at lower intensity (30–40% of key). Its purpose is to reveal detail in the shadow side without eliminating the shadow — preserve the 3D impression while preventing harsh black areas. Often slightly cooler than the key.',
                'The **rim light** (hair light / back light) is positioned behind the subject. It creates a bright halo around the silhouette, separating the subject from the background. Without it, dark subjects blend into dark backgrounds. Use a narrow angle and high intensity (0.6–1.0).',
              ],
              code: `// ── Three-point lighting — key, fill, rim ────────────────────
// Toggle each light by changing its intensity to 0 and pressing Run.
// Notice how removing any one light degrades the 3D illusion.

const KEY_COLOR      = 0xfff0cc   // warm sunlight
const KEY_INTENSITY  = 1.50
const KEY_POS        = new THREE.Vector3(-5, 8, 4)

const FILL_COLOR     = 0xccddff   // cool sky bounce
const FILL_INTENSITY = 0.42
const FILL_POS       = new THREE.Vector3(5, 3, 4)

const RIM_COLOR      = 0xffffff
const RIM_INTENSITY  = 0.80
const RIM_POS        = new THREE.Vector3(1, 5, -9)

const AMBIENT_COLOR  = 0x334455   // dark cool ambient — floor level
const AMBIENT_INTENS = 0.22

function init() {
  // ── Three-point rig ──────────────────────────────────────
  const keyLight = new THREE.DirectionalLight(KEY_COLOR, KEY_INTENSITY)
  keyLight.position.copy(KEY_POS)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(FILL_COLOR, FILL_INTENSITY)
  fillLight.position.copy(FILL_POS)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(RIM_COLOR, RIM_INTENSITY)
  rimLight.position.copy(RIM_POS)
  scene.add(rimLight)

  scene.add(new THREE.AmbientLight(AMBIENT_COLOR, AMBIENT_INTENS))

  // ── Subject: a head-like shape (sphere + features) ───────
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xddaa88, roughness: 0.75, metalness: 0.02 })
  )
  head.castShadow = true
  scene.add(head)

  // Simple "nose" bump for asymmetry — makes the lighting direction obvious
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xddaa88, roughness: 0.75 })
  )
  nose.position.set(0, -0.05, 0.92)
  nose.castShadow = true
  scene.add(nose)

  // Ground plane to show shadow
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.85 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.4
  ground.receiveShadow = true
  scene.add(ground)
  renderer.shadowMap.enabled = true

  // Small helper: show light positions as colored dots
  ;[
    { pos: KEY_POS,  color: KEY_COLOR  },
    { pos: FILL_POS, color: FILL_COLOR },
    { pos: RIM_POS,  color: RIM_COLOR  },
  ].forEach(({ pos, color }) => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color })
    )
    dot.position.copy(pos).multiplyScalar(0.4)   // scale down so dots stay in view
    scene.add(dot)
  })

  camera.position.set(0, 0.5, 5.5)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 22: Burst/explosion ───────────────────────────────────────
            {
              id: 22,
              cellTitle: 'Burst / explosion — vertex colors with per-particle fade',
              mode: '3d',
              prose: [
                'A burst spawns many particles in all directions simultaneously with a random hue. Unlike the continuous emitter (Part 2 Cell 9), a burst fires all particles at once and lets them die. The demo auto-fires a new burst every `BURST_INTERVAL` seconds.',
                'Per-particle color: add a `color` `BufferAttribute` alongside `position`. Set `PointsMaterial.vertexColors = true`. Each frame, multiply the particle\'s base color by `(1 − age/lifetime)` and write to the color buffer — this fades each particle from its launch color to black as it ages.',
                'Gravity and a floor bounce are optional — remove them to get a spherical explosion in space. The `acos(2·rand − 1)` sphere-sampling formula from Part 2 ensures particles spread uniformly in all directions.',
              ],
              code: `// ── Burst / Explosion — vertex colors + per-particle fade ────

const BURST_COUNT    = 180     // particles per burst
const SPEED_MIN      = 3.0     // min outward speed (units/s)
const SPEED_MAX      = 12.0    // max outward speed
const GRAVITY        = 5.0
const FLOOR_Y        = -2.5
const RESTITUTION    = 0.30    // low restitution — sparks barely bounce
const BURST_INTERVAL = 2.2     // seconds between auto-bursts
const BURST_POINT_SZ = 0.18

// ── Particle state ─────────────────────────────────────────
const lifetimes = new Float32Array(BURST_COUNT)
const ages      = new Float32Array(BURST_COUNT)
const posArr    = new Float32Array(BURST_COUNT * 3)
const velArr    = new Float32Array(BURST_COUNT * 3)
const colArr    = new Float32Array(BURST_COUNT * 3)  // RGB 0-1
const baseColor = new THREE.Color()                  // hue for this burst

let posAttr, colAttr
let timeSinceBurst = BURST_INTERVAL  // trigger immediately on start

function spawnBurst() {
  timeSinceBurst = 0

  // Random hue for this burst (keeps all particles the same color family)
  baseColor.setHSL(Math.random(), 0.95, 0.65)

  for (let i = 0; i < BURST_COUNT; i++) {
    // Start at origin
    posArr[i*3] = 0; posArr[i*3+1] = 0; posArr[i*3+2] = 0
    ages[i] = 0
    // Stagger lifetimes slightly so they don't all die at once
    lifetimes[i] = 1.4 + Math.random() * 1.0

    // Uniform direction on sphere
    const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    velArr[i*3]   = Math.sin(phi) * Math.cos(theta) * speed
    velArr[i*3+1] = Math.abs(Math.sin(phi) * Math.sin(theta)) * speed  // bias upward
    velArr[i*3+2] = Math.cos(phi) * speed

    // Start at full brightness
    colArr[i*3]   = baseColor.r
    colArr[i*3+1] = baseColor.g
    colArr[i*3+2] = baseColor.b
  }
}

function init() {
  scene.add(new THREE.GridHelper(14, 14, 0x222233, 0x222233))
  scene.add(new THREE.AmbientLight(0xffffff, 0.15))

  const geo = new THREE.BufferGeometry()
  posAttr = new THREE.BufferAttribute(posArr, 3)
  colAttr = new THREE.BufferAttribute(colArr, 3)
  posAttr.setUsage(THREE.DynamicDrawUsage)
  colAttr.setUsage(THREE.DynamicDrawUsage)
  geo.setAttribute('position', posAttr)
  geo.setAttribute('color',    colAttr)

  const mat = new THREE.PointsMaterial({
    size:         BURST_POINT_SZ,
    vertexColors: true,           // read RGB from the 'color' attribute
    transparent:  true,
    sizeAttenuation: true,
  })
  scene.add(new THREE.Points(geo, mat))

  camera.position.set(0, 4, 16)
  camera.lookAt(0, 1, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  timeSinceBurst += dt
  if (timeSinceBurst >= BURST_INTERVAL) spawnBurst()

  for (let i = 0; i < BURST_COUNT; i++) {
    ages[i] += dt

    // Physics
    velArr[i*3+1] -= GRAVITY * dt
    posArr[i*3]   += velArr[i*3]   * dt
    posArr[i*3+1] += velArr[i*3+1] * dt
    posArr[i*3+2] += velArr[i*3+2] * dt

    // Floor bounce
    if (posArr[i*3+1] < FLOOR_Y) {
      posArr[i*3+1] = FLOOR_Y
      velArr[i*3+1] = Math.abs(velArr[i*3+1]) * RESTITUTION
    }

    // Fade color by remaining lifetime fraction
    const fade = Math.max(0, 1 - ages[i] / lifetimes[i])
    colArr[i*3]   = baseColor.r * fade
    colArr[i*3+1] = baseColor.g * fade
    colArr[i*3+2] = baseColor.b * fade
  }

  posAttr.needsUpdate = true
  colAttr.needsUpdate = true
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 23: Quaternions vs Euler ──────────────────────────────────
            {
              id: 23,
              cellTitle: 'Quaternions vs Euler — gimbal lock and slerp',
              mode: '3d',
              prose: [
                'Euler angles store rotation as three independent angle values (X, Y, Z). The problem: they\'re applied in a fixed order, and when one rotation aligns two axes, you lose a degree of freedom — this is **gimbal lock**. The left cube in this demo uses incremental Euler rotation; watch it snap and lose smoothness when pitch crosses ±90°.',
                '**Quaternions** represent orientation as a point on the 4D unit sphere. No fixed application order, no axis alignment, no gimbal lock. `Quaternion.slerpQuaternions(from, to, t)` interpolates along the shortest arc of that sphere — constant angular speed, perfectly smooth.',
                '`mesh.quaternion.copy(q)` sets the mesh orientation from a quaternion directly. `q.setFromAxisAngle(axis, angle)` creates a quaternion for a rotation around any axis. Compose rotations by multiplying quaternions: `q_total = q1 × q2` (right-to-left, like matrix multiplication).',
              ],
              code: `// ── Quaternions vs Euler — slerp and gimbal lock demo ────────

// Two objects rotate between the same start and end orientations.
// Left: component-wise Euler lerp (shows artifacts near ±90°).
// Right: quaternion slerp (smooth, constant angular speed).

const ROTATE_SPEED   = 0.25    // complete rotations per second
const CUBE_SPACING   = 4.0

// Start and end orientations — same for both objects
const startEuler = new THREE.Euler(0, 0, 0)
const endEuler   = new THREE.Euler(Math.PI * 0.85, Math.PI * 0.60, Math.PI * 0.40)

const startQuat  = new THREE.Quaternion().setFromEuler(startEuler)
const endQuat    = new THREE.Quaternion().setFromEuler(endEuler)

let eulerCube, slerpCube
let time = 0

// Reusable quaternion for slerp — never allocate in update()
const _q = new THREE.Quaternion()

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const sun = new THREE.DirectionalLight(0xffffff, 1.1)
  sun.position.set(4, 8, 5)
  scene.add(sun)

  const geo = new THREE.BoxGeometry(1.4, 1.4, 1.4)

  // Left cube: Euler lerp (naïve component-wise angle blend)
  eulerCube = new THREE.Mesh(geo,
    new THREE.MeshStandardMaterial({ color: 0xff5533, roughness: 0.4 })
  )
  eulerCube.position.x = -CUBE_SPACING / 2
  scene.add(eulerCube)

  // Right cube: quaternion slerp
  slerpCube = new THREE.Mesh(geo,
    new THREE.MeshStandardMaterial({ color: 0x44aaff, roughness: 0.4 })
  )
  slerpCube.position.x = CUBE_SPACING / 2
  scene.add(slerpCube)

  // Axis markers — small coloured arrows to show XYZ orientation
  const addAxis = (mesh, dir, color) => {
    const arrow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
      new THREE.MeshBasicMaterial({ color })
    )
    arrow.position.copy(dir).multiplyScalar(0.9)
    if (dir.x !== 0) arrow.rotation.z = -Math.PI / 2
    if (dir.z !== 0) arrow.rotation.x =  Math.PI / 2
    mesh.add(arrow)
  }
  addAxis(eulerCube, new THREE.Vector3(1,0,0), 0xff4444)  // X red
  addAxis(eulerCube, new THREE.Vector3(0,1,0), 0x44ff44)  // Y green
  addAxis(eulerCube, new THREE.Vector3(0,0,1), 0x4444ff)  // Z blue
  addAxis(slerpCube, new THREE.Vector3(1,0,0), 0xff4444)
  addAxis(slerpCube, new THREE.Vector3(0,1,0), 0x44ff44)
  addAxis(slerpCube, new THREE.Vector3(0,0,1), 0x4444ff)

  // Labels
  scene.add(new THREE.GridHelper(12, 12, 0x222233, 0x222233))

  camera.position.set(0, 3, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  // Oscillate t between 0 and 1 (ping-pong)
  const raw = (time * ROTATE_SPEED) % 2
  const t   = raw < 1 ? raw : 2 - raw   // 0→1→0→1...

  // ── Left: naive Euler lerp — blends angle components directly ──
  // This does NOT produce constant angular speed and can snap at ±π
  eulerCube.rotation.x = startEuler.x + (endEuler.x - startEuler.x) * t
  eulerCube.rotation.y = startEuler.y + (endEuler.y - startEuler.y) * t
  eulerCube.rotation.z = startEuler.z + (endEuler.z - startEuler.z) * t

  // ── Right: quaternion slerp — shortest arc, constant angular speed ──
  _q.slerpQuaternions(startQuat, endQuat, t)
  slerpCube.quaternion.copy(_q)

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 24: Object Pooling ────────────────────────────────────────
            {
              id: 24,
              cellTitle: 'Object pooling — reuse instead of allocate',
              mode: '3d',
              prose: [
                'Every `new Object()` allocates heap memory. When the object is no longer referenced, the garbage collector reclaims it — but GC runs at unpredictable times and can pause the render loop for 5–20ms, causing visible stutter. A **pool** pre-allocates a fixed array of objects and recycles them: `acquire()` returns a dormant object; `release()` returns it to the pool. Zero allocation, zero GC.',
                'The pool pattern works for anything with a clear lifetime: bullets, sparks, debris, enemies, sounds, network packets. The key insight: you don\'t destroy the object when it expires — you *hide* it and put it back in the free list.',
                'The demo fires "bullets" continuously from the center. Each bullet is acquired from a pool, placed at the origin with a random velocity, and returned to the pool when it exits the boundary or exceeds its lifetime. Watch the console — no allocations during steady-state firing.',
              ],
              code: `// ── Object Pooling — acquire / release, zero GC ──────────────

const POOL_SIZE      = 64     // total bullets ever in existence
const FIRE_RATE      = 0.06   // seconds between bullets
const BULLET_SPEED   = 8.0    // units/s
const BULLET_LIFETIME = 2.5   // seconds before auto-release
const BULLET_RADIUS   = 0.14
const BOUNDS_RADIUS   = 9.0   // release when outside this sphere

// ── Pool implementation ────────────────────────────────────────
class BulletPool {
  constructor(size) {
    this._free   = []
    this._active = []

    const geo = new THREE.SphereGeometry(BULLET_RADIUS, 8, 8)
    const mat = new THREE.MeshStandardMaterial({ color: 0xffcc33, emissive: 0x442200 })

    for (let i = 0; i < size; i++) {
      const mesh = new THREE.Mesh(geo, mat)
      mesh.visible = false          // dormant — hidden until acquired
      scene.add(mesh)
      this._free.push({
        mesh,
        vel: new THREE.Vector3(),
        age: 0,
        active: false,
      })
    }
  }

  // Acquire a dormant bullet, reset it to pos/vel, mark active
  fire(pos, vel) {
    const b = this._free.pop()
    if (!b) return    // pool exhausted — drop the bullet silently

    b.mesh.position.copy(pos)
    b.vel.copy(vel)
    b.age = 0
    b.active = true
    b.mesh.visible = true
    this._active.push(b)
  }

  // Return a bullet to the pool
  _release(b) {
    b.active = false
    b.mesh.visible = false
    this._active.splice(this._active.indexOf(b), 1)
    this._free.push(b)
  }

  update(dt) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      const b = this._active[i]
      b.age += dt
      b.mesh.position.addScaledVector(b.vel, dt)

      if (b.age > BULLET_LIFETIME || b.mesh.position.length() > BOUNDS_RADIUS) {
        this._release(b)
      }
    }
  }

  get activeCount() { return this._active.length }
}

let pool
let timeSinceFire = 0

const _fireDir = new THREE.Vector3()

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const sun = new THREE.DirectionalLight(0xffffff, 0.9)
  sun.position.set(4, 8, 4)
  scene.add(sun)

  pool = new BulletPool(POOL_SIZE)

  // Soft bounding sphere reference
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(BOUNDS_RADIUS, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0x112233, transparent: true, opacity: 0.15, side: THREE.BackSide
    })
  ))

  camera.position.set(0, 5, 18)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  timeSinceFire += dt

  // Fire a new bullet from origin in a random direction
  if (timeSinceFire >= FIRE_RATE) {
    timeSinceFire = 0
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    _fireDir.set(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    ).multiplyScalar(BULLET_SPEED)
    pool.fire(new THREE.Vector3(0, 0, 0), _fireDir)
  }

  pool.update(dt)
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 25: Frustum Culling + LOD ─────────────────────────────────
            {
              id: 25,
              cellTitle: 'Frustum culling and LOD — skip what you can\'t see',
              mode: '3d',
              prose: [
                'The **view frustum** is the pyramid-shaped volume visible to the camera. Objects outside it are invisible — if you\'re still calling `update()` on them, you\'re wasting CPU. `frustum.containsPoint(mesh.position)` returns false for objects outside. Before any heavy per-object update, check visibility first.',
                '**Level of Detail (LOD)**: distant objects don\'t need full simulation fidelity. A particle system at 50 units away can run at 10% particle count; at 100 units, skip it entirely. Compute `distSq = camera.position.distanceToSquared(object.position)` (cheaper than `distanceTo` — avoids a sqrt) and threshold against `LOD_SKIP_DIST²`.',
                'The demo spawns 200 objects spread across a large area. The camera slowly rotates — watch how many objects are in-frustum vs. total. Objects outside the frustum skip `update()` (their animation pauses). Objects beyond `LOD_SKIP_DIST` use a simplified update (just position, no rotation).',
              ],
              code: `// ── Frustum Culling + LOD — skip what the camera can't see ──

const OBJECT_COUNT   = 200
const SPREAD         = 28     // objects scattered across this radius
const CAM_ORBIT_R    = 16     // camera orbit radius
const CAM_ORBIT_SPEED = 0.22  // rad/s

// Distance thresholds (use distanceToSquared — avoids sqrt)
const LOD_FULL_DIST   = 14    // full update within this distance
const LOD_LOW_DIST    = 25    // low-detail update within this distance
// Beyond LOD_LOW_DIST: skip update entirely

const LOD_FULL_SQ  = LOD_FULL_DIST  * LOD_FULL_DIST
const LOD_LOW_SQ   = LOD_LOW_DIST   * LOD_LOW_DIST

// Camera frustum — reused every frame (no allocation)
const frustum    = new THREE.Frustum()
const projMatrix = new THREE.Matrix4()

// Object state
const objects = []
let spinAngles    // Float32Array — per-object spin angle
let time = 0

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const sun = new THREE.DirectionalLight(0xffffff, 1.0)
  sun.position.set(5, 8, 4)
  scene.add(sun)

  const geoFull = new THREE.BoxGeometry(0.55, 0.55, 0.55)  // full detail
  const geoLow  = new THREE.BoxGeometry(0.55, 0.55, 0.55)  // same geo for simplicity
  const matFull = new THREE.MeshStandardMaterial({ color: 0x44aaff, roughness: 0.5 })
  const matLow  = new THREE.MeshStandardMaterial({ color: 0xaa5522, roughness: 0.8 })
  const matCull = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 1.0 })

  spinAngles = new Float32Array(OBJECT_COUNT)

  for (let i = 0; i < OBJECT_COUNT; i++) {
    const r     = SPREAD * Math.sqrt(Math.random())   // uniform disc sampling
    const theta = Math.random() * Math.PI * 2
    const mesh  = new THREE.Mesh(geoFull, matFull)
    mesh.position.set(
      r * Math.cos(theta),
      (Math.random() - 0.5) * 6,
      r * Math.sin(theta)
    )
    scene.add(mesh)
    objects.push(mesh)
    spinAngles[i] = Math.random() * Math.PI * 2
  }

  camera.position.set(CAM_ORBIT_R, 4, 0)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  // Orbit camera
  camera.position.set(
    Math.cos(time * CAM_ORBIT_SPEED) * CAM_ORBIT_R,
    4,
    Math.sin(time * CAM_ORBIT_SPEED) * CAM_ORBIT_R
  )
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()

  // Rebuild frustum from current camera matrices
  projMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(projMatrix)

  let fullCount = 0, lowCount = 0, culledCount = 0

  for (let i = 0; i < OBJECT_COUNT; i++) {
    const obj = objects[i]

    // ── Frustum cull: skip entirely if outside view ─────────
    if (!frustum.containsPoint(obj.position)) {
      culledCount++
      continue   // no update, no render cost (Three.js also skips it)
    }

    // ── LOD: decide update complexity by distance ────────────
    const distSq = camera.position.distanceToSquared(obj.position)

    if (distSq < LOD_FULL_SQ) {
      // Full update: spin on all axes
      spinAngles[i] += dt * 1.2
      obj.rotation.set(spinAngles[i] * 0.7, spinAngles[i], spinAngles[i] * 0.4)
      fullCount++
    } else if (distSq < LOD_LOW_SQ) {
      // Low detail: spin on Y only
      spinAngles[i] += dt * 0.5
      obj.rotation.y = spinAngles[i]
      lowCount++
    } else {
      culledCount++   // too far — treat as culled for stats
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
      'Quaternion slerp traces the great-circle arc on the unit 4-sphere: `slerp(q₁, q₂, t) = q₁ × (q₁⁻¹q₂)^t`. This guarantees **constant angular velocity** — the object rotates at the same rate throughout the interpolation. Component-wise Euler lerp does not — it blends angles independently, so the effective angular speed varies and can reverse near singularities.',

      'Frustum culling is O(N) in the number of objects, and the inner check is a few dot products against six planes — extremely cheap. The GC elimination from pooling is harder to quantify but profoundly impactful: a GC "minor collection" in V8 takes 1–5ms; a "major collection" can take 20–100ms. At 60fps your entire frame budget is 16ms — a single major GC eats the whole frame.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Quaternion slerp',
        body: '$$\\text{slerp}(q_1, q_2, t) = q_1 \\frac{\\sin((1-t)\\Omega)}{\\sin \\Omega} + q_2 \\frac{\\sin(t\\Omega)}{\\sin\\Omega}$$\n\nwhere $\\Omega = \\cos^{-1}(q_1 \\cdot q_2)$ is the angle between the two quaternions on the unit 4-sphere. Degenerates to lerp when $\\Omega \\to 0$.',
      },
      {
        type: 'insight',
        title: 'distanceToSquared vs distanceTo',
        body: '`distanceToSquared(p)` computes `(dx²+dy²+dz²)` — no square root. `distanceTo(p)` takes the sqrt, which is 4–10× slower on modern CPUs (sqrt is not a single-cycle instruction). For LOD and any "is this closer than X?" check, compare against `X²` instead of `X`. This is the single most common micro-optimisation in 3D code.',
      },
      {
        type: 'procedure',
        title: 'Per-frame frustum update',
        body: '```js\ncamera.updateMatrixWorld()  // ensure camera transforms are current\nprojMatrix.multiplyMatrices(\n  camera.projectionMatrix,\n  camera.matrixWorldInverse\n)\nfrustum.setFromProjectionMatrix(projMatrix)\n// Now: frustum.containsPoint(pos) → bool\n// Or:  frustum.intersectsBox(box)  → bool (for large objects)\n```',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenge — Combine the Recipes',
        mathBridge: 'This challenge combines object pooling, burst particles with vertex colors, and three-point lighting to build a polished explosion effect.',
        caption: 'Open-ended build. Break things freely — the error console at the bottom of the preview is your friend.',
        initialProps: {
          initialCells: [

            {
              id: 'c5',
              challengeType: 'build',
              challengeNumber: 5,
              challengeTitle: 'Particle cannon — pooled shells, vertex-color bursts',
              difficulty: 'hard',
              mode: '3d',
              prose: [
                'Build an artillery cannon: click anywhere on the floor (raycasting) to fire a pooled shell toward that point. When the shell lands, trigger a vertex-color burst from Cell 22. The shell itself comes from a small object pool (max 8 shells in flight). Each burst should have a random hue and fade to black over its lifetime. Use three-point lighting to make the explosion look dramatic.',
              ],
              prompt: 'Combine: (1) Raycasting to get the target point on the floor. (2) A BulletPool (max 8 shells) — each shell is a small sphere that flies toward the target with an arcing trajectory (add upward velocity so it arcs). (3) When a shell hits the floor (y < 0), release it back to the pool and trigger a burst of 120 vertex-colored particles at that position. (4) Three-point lighting on the scene.',
              hint: 'For the arc: give the shell an initial velocity of `(target - origin) * speed + UP * arcHeight`. The arc emerges from gravity. Detect landing when `shell.position.y < 0`. For pooling: store active shells in an array, check each frame if landed.',
              code: `// Starter: particle cannon
// Click floor to fire a shell; burst on impact

const MAX_SHELLS      = 8
const SHELL_SPEED     = 6.0    // horizontal approach speed
const SHELL_ARC       = 8.0    // initial upward boost
const GRAVITY         = 14.0
const BURST_COUNT     = 120
const BURST_SPEED_MAX = 9.0

const raycaster = new THREE.Raycaster()
const _mouse    = new THREE.Vector2()

// Shell pool (pre-allocated sphere meshes)
const shellFree   = []
const shellActive = []  // { mesh, vel, burst at y < 0 }

// Burst particles (single shared Points object, recycled per burst)
let burstPosArr, burstColArr, burstPosAttr, burstColAttr
const burstVel = []  // THREE.Vector3 per particle
const burstAge = new Float32Array(BURST_COUNT)
const burstLife = new Float32Array(BURST_COUNT).fill(99)  // inactive = huge lifetime

let clickHandler = null
let floor

function init() {
  // Three-point lighting
  const key = new THREE.DirectionalLight(0xfff0cc, 1.4)
  key.position.set(-5, 8, 4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xccddff, 0.40)
  fill.position.set(5, 3, 3)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0xffffff, 0.75)
  rim.position.set(1, 4, -8)
  scene.add(rim)
  scene.add(new THREE.AmbientLight(0x334455, 0.20))

  // Floor
  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  // Shell pool
  const shellGeo = new THREE.SphereGeometry(0.18, 10, 10)
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 })
  for (let i = 0; i < MAX_SHELLS; i++) {
    const mesh = new THREE.Mesh(shellGeo, shellMat)
    mesh.visible = false
    scene.add(mesh)
    shellFree.push({ mesh, vel: new THREE.Vector3() })
  }

  // Burst particle system
  burstPosArr = new Float32Array(BURST_COUNT * 3)
  burstColArr = new Float32Array(BURST_COUNT * 3)
  burstPosAttr = new THREE.BufferAttribute(burstPosArr, 3)
  burstColAttr = new THREE.BufferAttribute(burstColArr, 3)
  burstPosAttr.setUsage(THREE.DynamicDrawUsage)
  burstColAttr.setUsage(THREE.DynamicDrawUsage)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', burstPosArr ? burstPosAttr : null)
  geo.setAttribute('position', burstPosAttr)
  geo.setAttribute('color',    burstColAttr)
  for (let i = 0; i < BURST_COUNT; i++) burstVel.push(new THREE.Vector3())
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.18, vertexColors: true, transparent: true, sizeAttenuation: true
  })))

  // Click handler
  if (clickHandler) renderer.domElement.removeEventListener('click', clickHandler)
  clickHandler = (e) => {
    const rect = renderer.domElement.getBoundingClientRect()
    _mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
    _mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
    raycaster.setFromCamera(_mouse, camera)
    const hits = raycaster.intersectObject(floor)
    if (hits.length === 0 || shellFree.length === 0) return
    // TODO: acquire a shell, set position to (0,1,0), compute velocity toward hit.point
    // TODO: push to shellActive
  }
  renderer.domElement.addEventListener('click', clickHandler)

  camera.position.set(0, 10, 16)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function triggerBurst(origin) {
  const hue = Math.random()
  const col = new THREE.Color().setHSL(hue, 0.95, 0.65)
  for (let i = 0; i < BURST_COUNT; i++) {
    burstPosArr[i*3] = origin.x; burstPosArr[i*3+1] = origin.y; burstPosArr[i*3+2] = origin.z
    burstAge[i]  = 0
    burstLife[i] = 1.2 + Math.random() * 0.8
    const speed = 3.0 + Math.random() * BURST_SPEED_MAX
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    burstVel[i].set(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.abs(Math.sin(phi) * Math.sin(theta)) * speed,
      Math.cos(phi) * speed
    )
    burstColArr[i*3] = col.r; burstColArr[i*3+1] = col.g; burstColArr[i*3+2] = col.b
  }
}

function update(dt) {
  // TODO: update shell positions; when y < 0 call triggerBurst and release shell

  // Update burst particles
  for (let i = 0; i < BURST_COUNT; i++) {
    if (burstAge[i] >= burstLife[i]) continue
    burstAge[i] += dt
    burstVel[i].y -= GRAVITY * dt
    burstPosArr[i*3]   += burstVel[i].x * dt
    burstPosArr[i*3+1] += burstVel[i].y * dt
    burstPosArr[i*3+2] += burstVel[i].z * dt
    const fade = Math.max(0, 1 - burstAge[i] / burstLife[i])
    burstColArr[i*3]   *= fade; burstColArr[i*3+1] *= fade; burstColArr[i*3+2] *= fade
  }
  burstPosAttr.needsUpdate = true
  burstColAttr.needsUpdate = true

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
      text: 'After modifying a Float32Array backing a BufferAttribute, you must set `burstPosAttr.needsUpdate = true`. Why does Three.js require this flag?',
      options: [
        'Setting the flag allocates new GPU memory for the updated array',
        'Three.js caches buffer data on the GPU. Without the flag, Three.js skips the upload assuming nothing changed — the GPU keeps stale positions. needsUpdate = true tells the renderer to re-upload the typed array to GPU memory on the next render call',
        'The flag triggers garbage collection of the old array before uploading the new one',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Burst particle color fades with: `burstColArr[i*3] *= fade` where `fade = Math.max(0, 1 - age/lifetime)`. What does multiplying by fade do to the color channel?',
      options: [
        'It converts the color from RGB to HSL format',
        'It scales the color toward zero (black). At age=0, fade=1 and the color is unchanged. At age=lifetime, fade=0 and the channel is zeroed — the particle has faded to black. Applying this each frame causes exponential darkening, not linear, because each frame multiplies the already-dimmed value',
        'It clamps the color to [0, 1] to prevent overflow',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Ambient light illuminates all surfaces equally. Directional light creates shadows and highlights. For a fireworks simulation, which type of lighting matters most?',
      options: [
        'Directional light — firework particles need shadows to look three-dimensional',
        'Ambient light (or none) — firework particles use MeshBasicMaterial which ignores lighting entirely. The particles are self-emissive colored dots. Adding directional lights would only affect scene geometry like the ground; particle colors come from the BufferAttribute color array, not reflectance',
        'Point lights placed at each burst center — they illuminate the smoke cloud',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'One BufferGeometry holding 1000 particle positions costs one GPU draw call. Using 1000 Mesh objects costs 1000 draw calls. At 60fps on a typical GPU, how many draw calls per frame is considered a practical limit before performance degrades?',
      options: [
        'About 1,000–10,000 draw calls — beyond this, draw-call overhead rather than actual geometry complexity becomes the bottleneck. Batching particles into a single geometry lets you simulate hundreds of thousands of particles within that budget',
        'Exactly 60 draw calls — one per frame',
        'There is no limit — modern GPUs handle unlimited draw calls in hardware',
      ],
      correct: 0,
    },
  ],
}
