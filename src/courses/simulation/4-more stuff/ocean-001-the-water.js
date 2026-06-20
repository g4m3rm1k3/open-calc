export default {
  id: 'ocean-001',
  slug: 'ocean-building-the-water',
  chapter: 'ocean1',
  order: 1,
  title: 'The Water — Building an Ocean Surface',
  subtitle: 'Five cells from flat grid to living sea: BufferGeometry internals, the wave equation, superposition, floating buoys, and sea-state transitions.',
  tags: ['three.js', 'waves', 'BufferGeometry', 'superposition', 'ocean', 'animation', 'buoyancy', 'sine'],
  aliases: 'ocean water waves geometry animation buoy superposition sea state sinusoidal waveHeight',
  timeToComplete: 38,
  coreConcept: 'Real-looking ocean water is the sum of a handful of sine waves traveling in different directions. Animate a mesh by mutating its vertex Y-positions each frame with that formula, then use the exact same formula to float any object on the surface.',
  prerequisites: ['building-blocks-objects-and-techniques'],
  nextLesson: 'ocean-the-boat',

  hook: {
    question: 'The ocean in every game — Sea of Thieves, Assassin\'s Creed IV, Zelda: Wind Waker — is not a fluid simulation. It\'s arithmetic. Can a few trig functions really fool your eye into seeing an ocean?',
    realWorldContext: "The technique here (sum-of-sines / Gerstner waves) is exactly what AAA games use in real-time. Film VFX (Pirates of the Caribbean, Aquaman) applies a more elaborate version: fast Fourier transforms over a statistical wave spectrum called a JONSWAP model. The math starts with the same `A·sin(kx − ωt)` you're about to write. Once you have three waves running in different directions you'll see why it works.",
  },

  intuition: {
    prose: [
      "**The coordinate system.** In Three.js: X points right, Y points up, Z points toward you. An ocean surface lives in the XZ plane — a flat horizontal sheet at Y = 0. To add waves, you push each vertex up or down by a Y offset that depends on its X, Z, and the current time `t`.",

      "**A single wave is a traveling sinusoid.** `y = A · sin(k·x − ω·t)` encodes four numbers: amplitude A (crest height above flat water), wavenumber k = 2π/λ (how tightly the wave ripples; higher k = shorter wavelength), angular frequency ω = 2π/T (how fast it oscillates; higher ω = faster), and time t. At t=0 it's a frozen sine curve across X. As t grows the pattern slides in the +X direction at phase speed `v = ω/k`.",

      "**Superposition: the real ocean is a sum.** Ocean swells come from every direction at every scale. The mathematical miracle of linearity is that you can add them independently: `y = Σ Aᵢ · sin(kᵢ · (x·dxᵢ + z·dzᵢ) − ωᵢ · t + φᵢ)`. Each wave has its own direction vector (dx, dz), its own frequency and amplitude, and an arbitrary phase offset φ so they don't all peak at the same x and z. Three waves is enough to look convincingly real.",

      "**Animate by mutating, never by rebuilding.** Loop over every vertex in your `Float32Array`, recompute its Y, and set `posAttr.needsUpdate = true`. This re-uploads just the changed buffer to the GPU — roughly the same as a texture update. Rebuilding the geometry object from scratch each frame is 50–100× slower and would stall the pipeline. Call `geometry.computeVertexNormals()` afterwards so lighting is computed against the deformed surface, not the original flat one.",

      "**Float objects by evaluating the wave function.** For buoys, boats, or anything resting on the water: compute `waveHeight(object.x, object.z, t)` and set `object.position.y` to that value. Because it's the exact same formula driving the mesh vertices, the object always sits on the surface with zero error — no collision detection needed.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Wavenumber k',
        body: '`k = 2π / λ` where λ is the wavelength (crest-to-crest distance). A wave with λ = 14 m has k ≈ 0.45 rad/m. Higher k = shorter, choppier waves. Phase speed is `v = ω / k`. For physically accurate deep-water waves the dispersion relation gives `ω = √(g·k)` (g ≈ 9.81). Our constants are tuned for visual appeal rather than strict physics.',
      },
      {
        type: 'insight',
        title: 'Why call computeVertexNormals() every frame?',
        body: 'Normals are per-vertex directions perpendicular to the surface. The lighting equation uses them to decide how bright each patch is. When you deform the mesh the normals from the flat original are wrong — they still point straight up. Wrong normals make the mesh look flat even when it\'s clearly rippling. `computeVertexNormals()` recomputes them from the actual deformed triangles. Cost is ~5% of frame time but required for shading.',
      },
      {
        type: 'warning',
        title: 'PlaneGeometry vs manual BufferGeometry',
        body: '`new THREE.PlaneGeometry(width, depth, segsW, segsD)` builds the same indexed grid we build below; rotate it with `geometry.rotateX(-Math.PI/2)` to lie flat. Using PlaneGeometry is fine in practice. Building it manually once teaches you exactly what a mesh IS: a flat array of 3D positions, an index array pairing those positions into triangles, and derived attributes like normals and UVs. After this cell, PlaneGeometry will never be a black box.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'From Flat Grid to Living Ocean — Five Steps',
        mathBridge: 'Each cell builds on the last. Cell 1 teaches mesh structure. Cell 2 adds one-wave motion. Cell 3 superimposes three waves with a water material. Cell 4 adds buoys that float. Cell 5 interpolates between calm and stormy sea states.',
        caption: 'All cells use 3D mode (Three.js). Named constants sit at the top — tweak them and re-run to build intuition.',
        initialProps: {
          initialCells: [

            // ── Cell 1: The ocean grid ─────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'The ocean grid — building a mesh from scratch',
              mode: '3d',
              prose: [
                'A mesh is three things: (1) a **position array** — a flat `Float32Array` of `[x0,y0,z0, x1,y1,z1, …]` values, (2) an **index array** — a `Uint32Array` that groups those positions into triangles by listing which three vertices form each face, and (3) **attributes** derived from those (normals, UVs). Building it manually once removes all mystery.',
                'For a grid of `(COLS+1)×(ROWS+1)` vertices laid out in the XZ plane, vertex `(c, r)` has position `x = c × TILE_SIZE − halfW, y = 0, z = r × TILE_SIZE − halfD`. Each quad (a 2×2 block of four adjacent vertices) splits into two triangles via a pair of index triples.',
                'After running this cell, try changing `TILE_SIZE` to `1.5` — fewer vertices, chunkier grid. Then try `0.25` — more vertices, smoother. Grid resolution is a trade-off between visual quality and vertex count (= animation cost per frame).',
              ],
              code: `// ── Ocean grid — BufferGeometry from scratch ─────────────────

const COLS      = 60       // grid columns (vertices = COLS+1)
const ROWS      = 60       // grid rows
const TILE_SIZE = 0.55     // world units per tile edge

const halfW = COLS * TILE_SIZE / 2
const halfD = ROWS * TILE_SIZE / 2

function buildGrid() {
  const vCount = (COLS + 1) * (ROWS + 1)
  const positions = new Float32Array(vCount * 3)

  let vi = 0
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      positions[vi++] = c * TILE_SIZE - halfW  // X
      positions[vi++] = 0                       // Y (flat for now)
      positions[vi++] = r * TILE_SIZE - halfD   // Z
    }
  }

  // Each quad → 2 triangles → 6 indices
  const indices = new Uint32Array(COLS * ROWS * 6)
  let ii = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const a = r * (COLS + 1) + c
      const b = a + 1
      const c2 = a + (COLS + 1)
      const d = c2 + 1
      // Triangle 1: a, c2, b  (counter-clockwise = front face)
      indices[ii++] = a;  indices[ii++] = c2; indices[ii++] = b
      // Triangle 2: b, c2, d
      indices[ii++] = b;  indices[ii++] = c2; indices[ii++] = d
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(new THREE.BufferAttribute(indices, 1))
  geo.computeVertexNormals()   // normals required for lit material
  return geo
}

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(8, 12, 8)
  scene.add(sun)

  const geo = buildGrid()
  const mat = new THREE.MeshStandardMaterial({
    color:     0x1a6fa8,
    roughness: 0.3,
    metalness: 0.1,
    wireframe: false,
    side:      THREE.DoubleSide,
  })
  scene.add(new THREE.Mesh(geo, mat))

  // Wireframe overlay shows the triangle structure
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x44aaff, wireframe: true, opacity: 0.15, transparent: true })
  scene.add(new THREE.Mesh(geo, wireMat))

  camera.position.set(0, 18, 28)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 2: Single wave ────────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'One wave — the traveling sinusoid',
              mode: '3d',
              prose: [
                'Apply `y = A · sin(k·x − ω·t)` to every vertex each frame. The formula has three controls: **A** (amplitude — how tall is the crest?), **k** (wavenumber — how many radians per world unit; `k = 2π/λ` where λ is wavelength), and **ω** (angular frequency — how many radians per second; `ω = 2π/T` where T is period in seconds). Phase speed is `v = ω/k`.',
                'The key line is `posArray[i*3 + 1] = A * Math.sin(k * x - omega * time)`. We read the stored X position from the flat array, compute the new Y from the wave formula, and leave Z unchanged. Setting `posAttr.needsUpdate = true` tells Three.js to re-upload that buffer to the GPU.',
                'Try: set `WAVE_AMP` to `2.0` (dramatic). Set `WAVELENGTH` to `2.0` (very choppy). Set `PERIOD` to `0.5` (very fast). Notice that doubling the wavelength while halving the period keeps the phase speed constant — feel the relationship between those three parameters.',
              ],
              code: `// ── One wave — traveling sinusoid ────────────────────────────

const COLS       = 60
const ROWS       = 60
const TILE_SIZE  = 0.55
const WAVE_AMP   = 0.6       // crest height (world units)
const WAVELENGTH = 14.0      // crest-to-crest distance
const PERIOD     = 4.0       // seconds per full oscillation

// Derived wave parameters
const k     = (2 * Math.PI) / WAVELENGTH   // wavenumber (rad/unit)
const omega = (2 * Math.PI) / PERIOD        // angular frequency (rad/s)

const halfW = COLS * TILE_SIZE / 2
const halfD = ROWS * TILE_SIZE / 2

let posAttr, posArray, geo
let time = 0

function buildGrid() {
  const vCount = (COLS + 1) * (ROWS + 1)
  posArray = new Float32Array(vCount * 3)
  let vi = 0
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      posArray[vi++] = c * TILE_SIZE - halfW
      posArray[vi++] = 0
      posArray[vi++] = r * TILE_SIZE - halfD
    }
  }

  const indices = new Uint32Array(COLS * ROWS * 6)
  let ii = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const a = r*(COLS+1)+c, b=a+1, c2=a+(COLS+1), d=c2+1
      indices[ii++]=a; indices[ii++]=c2; indices[ii++]=b
      indices[ii++]=b; indices[ii++]=c2; indices[ii++]=d
    }
  }

  geo = new THREE.BufferGeometry()
  posAttr = new THREE.BufferAttribute(posArray, 3)
  geo.setAttribute('position', posAttr)
  geo.setIndex(new THREE.BufferAttribute(indices, 1))
  geo.computeVertexNormals()
  return geo
}

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(10, 15, 8)
  scene.add(sun)

  const geo = buildGrid()
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a6fa8, roughness: 0.25, metalness: 0.15, side: THREE.DoubleSide,
  })
  scene.add(new THREE.Mesh(geo, mat))

  camera.position.set(0, 14, 24)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt
  const vCount = (COLS + 1) * (ROWS + 1)

  for (let i = 0; i < vCount; i++) {
    const x = posArray[i * 3]          // read stored X
    // Wave travels in +X direction
    posArray[i * 3 + 1] = WAVE_AMP * Math.sin(k * x - omega * time)
  }

  posAttr.needsUpdate = true           // re-upload position buffer
  geo.computeVertexNormals()           // recompute normals for correct lighting

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 3: Three-wave superposition + water material ──────────────
            {
              id: 3,
              cellTitle: 'Wave superposition — three swells, one ocean',
              mode: '3d',
              prose: [
                'Three waves traveling in different directions add up to something that reads as ocean. Each wave is parameterized by its amplitude, frequency, speed, travel direction (a unit vector `[dx, dz]`), and a phase offset so they don\'t all peak at the same spot. The X-only `k·x` term in cell 2 becomes `k · (x·dx + z·dz)` — the dot product of position with the travel direction.',
                'This pattern of combining waves is called **superposition**. It works because the wave equation is linear: if `y₁` and `y₂` are valid wave solutions, so is `y₁ + y₂`. Real ocean models (JONSWAP spectrum) use hundreds of waves; three is enough for real-time convincing water.',
                'The water material uses `MeshStandardMaterial` with a deep blue color, low roughness (smooth surface → sharp highlights), and a hint of metalness (makes the specular highlight more intense). Try setting `roughness` to `0.9` to see how much the material matters.',
              ],
              code: `// ── Wave superposition — three traveling sinusoids ───────────

const COLS      = 72
const ROWS      = 72
const TILE_SIZE = 0.55

// Wave 1: main swell, travels in +X direction
const W1_AMP   = 0.28,  W1_FREQ  = 0.45,  W1_SPEED = 0.80
// Wave 2: cross-swell at 45°, slightly shorter
const W2_AMP   = 0.16,  W2_FREQ  = 0.72,  W2_SPEED = 1.10
const W2_DX    = 0.707, W2_DZ    = 0.707  // direction: NE diagonal
// Wave 3: short chop at -26° (wind ripples from a different quadrant)
const W3_AMP   = 0.09,  W3_FREQ  = 1.50,  W3_SPEED = 1.60
const W3_DX    = -0.447, W3_DZ   = 0.894

function waveHeight(x, z, t) {
  return (
    W1_AMP * Math.sin(W1_FREQ * x                      - W1_SPEED * t) +
    W2_AMP * Math.sin(W2_FREQ * (x*W2_DX + z*W2_DZ)   - W2_SPEED * t + 1.5) +
    W3_AMP * Math.sin(W3_FREQ * (x*W3_DX + z*W3_DZ)   - W3_SPEED * t + 2.8)
  )
}

const halfW = COLS * TILE_SIZE / 2
const halfD = ROWS * TILE_SIZE / 2
let posAttr, posArray, geo, time = 0

function buildGrid() {
  const vCount = (COLS+1)*(ROWS+1)
  posArray = new Float32Array(vCount * 3)
  let vi = 0
  for (let r = 0; r <= ROWS; r++)
    for (let c = 0; c <= COLS; c++) {
      posArray[vi++] = c*TILE_SIZE - halfW
      posArray[vi++] = 0
      posArray[vi++] = r*TILE_SIZE - halfD
    }
  const indices = new Uint32Array(COLS*ROWS*6)
  let ii = 0
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const a=r*(COLS+1)+c, b=a+1, c2=a+(COLS+1), d=c2+1
      indices[ii++]=a; indices[ii++]=c2; indices[ii++]=b
      indices[ii++]=b; indices[ii++]=c2; indices[ii++]=d
    }
  geo = new THREE.BufferGeometry()
  posAttr = new THREE.BufferAttribute(posArray, 3)
  geo.setAttribute('position', posAttr)
  geo.setIndex(new THREE.BufferAttribute(indices, 1))
  geo.computeVertexNormals()
  return geo
}

function init() {
  scene.background = new THREE.Color(0x87ceeb)   // sky blue
  scene.fog = new THREE.Fog(0x87ceeb, 18, 42)

  scene.add(new THREE.AmbientLight(0xfff4e0, 0.5))
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.4)
  sun.position.set(12, 20, 10)
  scene.add(sun)

  const mat = new THREE.MeshStandardMaterial({
    color:     0x006994,
    roughness: 0.15,
    metalness: 0.25,
    side:      THREE.DoubleSide,
  })
  scene.add(new THREE.Mesh(buildGrid(), mat))

  camera.position.set(0, 10, 20)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt
  const vCount = (COLS+1)*(ROWS+1)
  for (let i = 0; i < vCount; i++) {
    const x = posArray[i*3], z = posArray[i*3+2]
    posArray[i*3+1] = waveHeight(x, z, time)
  }
  posAttr.needsUpdate = true
  geo.computeVertexNormals()
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 4: Floating buoys ─────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Floating buoys — sampling the wave surface',
              mode: '3d',
              prose: [
                'To float an object on the water, evaluate `waveHeight(object.x, object.z, t)` and set `object.position.y` to that value. That\'s it. Because it\'s the same formula driving the mesh vertices, the object sits perfectly on the surface with zero drift.',
                'For realism, add gentle pitch and roll. The wave\'s slope at any point is the partial derivative `∂h/∂x` (pitch: nose-up/down) and `∂h/∂z` (roll: lean left/right). Compute them numerically with finite differences: `slope_x ≈ (h(x+ε, z) − h(x−ε, z)) / (2ε)`. Apply a fraction of these slopes as `rotation.z` (pitch) and `rotation.x` (roll) to the buoy mesh.',
                'The buoys here are instanced (one draw call for all of them) using `THREE.InstancedMesh`. Each instance has its own matrix updated via `setMatrixAt(i, matrix)`. Setting `instanceMatrix.needsUpdate = true` after the loop re-uploads all instance transforms at once.',
              ],
              code: `// ── Floating buoys — sampling waveHeight ─────────────────────

const COLS = 72, ROWS = 72, TILE_SIZE = 0.55
const W1_AMP=0.28, W1_FREQ=0.45, W1_SPEED=0.80
const W2_AMP=0.16, W2_FREQ=0.72, W2_SPEED=1.10, W2_DX=0.707, W2_DZ=0.707
const W3_AMP=0.09, W3_FREQ=1.50, W3_SPEED=1.60, W3_DX=-0.447, W3_DZ=0.894

function waveHeight(x, z, t) {
  return (
    W1_AMP * Math.sin(W1_FREQ * x                    - W1_SPEED * t) +
    W2_AMP * Math.sin(W2_FREQ*(x*W2_DX + z*W2_DZ)   - W2_SPEED * t + 1.5) +
    W3_AMP * Math.sin(W3_FREQ*(x*W3_DX + z*W3_DZ)   - W3_SPEED * t + 2.8)
  )
}

const BUOY_COUNT = 16       // number of buoys to scatter
const BUOY_RADIUS = 0.22
const PITCH_SCALE = 0.55    // how strongly the buoy tilts with the wave slope
const SLOPE_EPS   = 0.4     // finite-difference step for slope estimation

const halfW = COLS*TILE_SIZE/2, halfD = ROWS*TILE_SIZE/2
let posAttr, posArray, oceanGeo, time = 0
let buoyMesh
const buoyXZ = []   // [x, z] for each buoy

// Scratch objects — allocated once, reused every frame
const _pos = new THREE.Vector3()
const _euler = new THREE.Euler()
const _quat = new THREE.Quaternion()
const _scale = new THREE.Vector3(1, 1, 1)
const _matrix = new THREE.Matrix4()

function buildGrid() {
  const vCount = (COLS+1)*(ROWS+1)
  posArray = new Float32Array(vCount*3)
  let vi=0
  for (let r=0;r<=ROWS;r++) for (let c=0;c<=COLS;c++) {
    posArray[vi++]=c*TILE_SIZE-halfW; posArray[vi++]=0; posArray[vi++]=r*TILE_SIZE-halfD
  }
  const idx=new Uint32Array(COLS*ROWS*6); let ii=0
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const a=r*(COLS+1)+c,b=a+1,c2=a+(COLS+1),d=c2+1
    idx[ii++]=a;idx[ii++]=c2;idx[ii++]=b;idx[ii++]=b;idx[ii++]=c2;idx[ii++]=d
  }
  oceanGeo=new THREE.BufferGeometry()
  posAttr=new THREE.BufferAttribute(posArray,3)
  oceanGeo.setAttribute('position',posAttr)
  oceanGeo.setIndex(new THREE.BufferAttribute(idx,1))
  oceanGeo.computeVertexNormals()
  return oceanGeo
}

function init() {
  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 18, 42)
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.5))
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.4)
  sun.position.set(12, 20, 10); scene.add(sun)

  scene.add(new THREE.Mesh(buildGrid(),
    new THREE.MeshStandardMaterial({ color:0x006994, roughness:0.15, metalness:0.25, side:THREE.DoubleSide })))

  // Scatter buoys at random XZ positions within the grid
  for (let i = 0; i < BUOY_COUNT; i++) {
    buoyXZ.push([
      (Math.random()-0.5) * (COLS*TILE_SIZE - 4),
      (Math.random()-0.5) * (ROWS*TILE_SIZE - 4),
    ])
  }

  // Orange buoy = sphere body + ring
  const bodyGeo  = new THREE.SphereGeometry(BUOY_RADIUS, 10, 8)
  const ringGeo  = new THREE.TorusGeometry(BUOY_RADIUS * 1.3, BUOY_RADIUS * 0.22, 6, 16)
  ringGeo.rotateX(Math.PI / 2)   // orient ring horizontally
  bodyGeo.merge ? null : null     // merge not needed — use Group instead

  // InstancedMesh for efficient rendering of many buoys
  buoyMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(BUOY_RADIUS, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.5, metalness: 0.1 }),
    BUOY_COUNT
  )
  scene.add(buoyMesh)

  camera.position.set(0, 9, 18)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  // Update ocean mesh
  const vCount = (COLS+1)*(ROWS+1)
  for (let i=0; i<vCount; i++) {
    posArray[i*3+1] = waveHeight(posArray[i*3], posArray[i*3+2], time)
  }
  posAttr.needsUpdate = true
  oceanGeo.computeVertexNormals()

  // Update each buoy instance
  for (let i = 0; i < BUOY_COUNT; i++) {
    const [bx, bz] = buoyXZ[i]
    const by = waveHeight(bx, bz, time)

    // Finite-difference slope → tilt angles
    const sx = (waveHeight(bx+SLOPE_EPS, bz, time) - waveHeight(bx-SLOPE_EPS, bz, time)) / (2*SLOPE_EPS)
    const sz = (waveHeight(bx, bz+SLOPE_EPS, time) - waveHeight(bx, bz-SLOPE_EPS, time)) / (2*SLOPE_EPS)

    _pos.set(bx, by + BUOY_RADIUS * 0.8, bz)
    _euler.set(-sz * PITCH_SCALE, 0, sx * PITCH_SCALE)
    _quat.setFromEuler(_euler)
    _matrix.compose(_pos, _quat, _scale)
    buoyMesh.setMatrixAt(i, _matrix)
  }
  buoyMesh.instanceMatrix.needsUpdate = true

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 5: Sea state transition ──────────────────────────────────
            {
              id: 5,
              cellTitle: 'Sea state — calm to stormy and back',
              mode: '3d',
              prose: [
                'Sea state describes overall wave energy: a glassy harbour is state 0; a Force-12 hurricane is state 9. Between them, waves get taller, shorter, and more chaotic. Simulating this is surprisingly simple: multiply every wave amplitude by a global `seaState` scalar (0 = flat, 1 = base, 2 = rough). Interpolate `seaState` smoothly with `THREE.MathUtils.lerp(current, target, TRANSITION_SPEED * dt)`.',
                'The transition uses a simple state machine: `calm → rising → stormy → falling → calm`. Each state runs for a set duration (controlled by `STATE_DURATION_S`). When the timer expires, the state advances and the `targetSeaState` is updated. The `lerp` call does the smooth blending automatically.',
                'Notice that the water color and fog also change with sea state — deeper blue and denser fog in a storm. Environment changes sell the mood as much as the waves.',
              ],
              code: `// ── Sea state — calm to stormy and back ──────────────────────

const COLS=72, ROWS=72, TILE_SIZE=0.55
const W1_AMP=0.28, W1_FREQ=0.45, W1_SPEED=0.80
const W2_AMP=0.16, W2_FREQ=0.72, W2_SPEED=1.10, W2_DX=0.707, W2_DZ=0.707
const W3_AMP=0.09, W3_FREQ=1.50, W3_SPEED=1.60, W3_DX=-0.447, W3_DZ=0.894

function waveHeight(x, z, t, scale) {
  return scale * (
    W1_AMP * Math.sin(W1_FREQ * x                  - W1_SPEED * t) +
    W2_AMP * Math.sin(W2_FREQ*(x*W2_DX+z*W2_DZ)   - W2_SPEED * t + 1.5) +
    W3_AMP * Math.sin(W3_FREQ*(x*W3_DX+z*W3_DZ)   - W3_SPEED * t + 2.8)
  )
}

const TRANSITION_SPEED  = 0.8   // lerp speed (fraction per second)
const STATE_DURATION_S  = 5     // seconds in each state before transitioning
const SEA_STATES        = [0.2, 1.0, 2.6, 1.0]  // calm, normal, stormy, normal
const WATER_COLORS = [0x7ab8d4, 0x006994, 0x004466, 0x006994]
const FOG_NEAR     = [35, 18, 10, 18]
const FOG_FAR      = [60, 42, 24, 42]

const halfW=COLS*TILE_SIZE/2, halfD=ROWS*TILE_SIZE/2
let posAttr, posArray, oceanGeo, oceanMat, time=0
let seaState=0.2, targetSeaState=SEA_STATES[0]
let stateIndex=0, stateTimer=0

function buildGrid() {
  const vCount=(COLS+1)*(ROWS+1)
  posArray=new Float32Array(vCount*3)
  let vi=0
  for (let r=0;r<=ROWS;r++) for (let c=0;c<=COLS;c++) {
    posArray[vi++]=c*TILE_SIZE-halfW; posArray[vi++]=0; posArray[vi++]=r*TILE_SIZE-halfD
  }
  const idx=new Uint32Array(COLS*ROWS*6); let ii=0
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const a=r*(COLS+1)+c,b=a+1,c2=a+(COLS+1),d=c2+1
    idx[ii++]=a;idx[ii++]=c2;idx[ii++]=b;idx[ii++]=b;idx[ii++]=c2;idx[ii++]=d
  }
  oceanGeo=new THREE.BufferGeometry()
  posAttr=new THREE.BufferAttribute(posArray,3)
  oceanGeo.setAttribute('position',posAttr)
  oceanGeo.setIndex(new THREE.BufferAttribute(idx,1))
  oceanGeo.computeVertexNormals()
  return oceanGeo
}

function init() {
  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.FogExp2(0x87ceeb, 0.03)
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.5))
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.4)
  sun.position.set(12, 20, 10); scene.add(sun)

  oceanMat = new THREE.MeshStandardMaterial({
    color: 0x006994, roughness: 0.15, metalness: 0.25, side: THREE.DoubleSide,
  })
  scene.add(new THREE.Mesh(buildGrid(), oceanMat))

  camera.position.set(0, 8, 18)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

const _colorA = new THREE.Color(), _colorB = new THREE.Color()

function update(dt) {
  time += dt

  // State machine: advance after STATE_DURATION_S seconds
  stateTimer += dt
  if (stateTimer >= STATE_DURATION_S) {
    stateTimer = 0
    stateIndex = (stateIndex + 1) % SEA_STATES.length
    targetSeaState = SEA_STATES[stateIndex]
  }

  // Smooth transition toward target sea state
  seaState = THREE.MathUtils.lerp(seaState, targetSeaState, TRANSITION_SPEED * dt)

  // Update water color and fog to match sea state
  const si = stateIndex, t_lerp = Math.min(1, stateTimer / STATE_DURATION_S)
  _colorA.setHex(WATER_COLORS[si])
  _colorB.setHex(WATER_COLORS[(si+1) % WATER_COLORS.length])
  oceanMat.color.lerpColors(_colorA, _colorB, THREE.MathUtils.smoothstep(t_lerp, 0, 1))

  // Deform ocean mesh
  const vCount=(COLS+1)*(ROWS+1)
  for (let i=0;i<vCount;i++) {
    posArray[i*3+1] = waveHeight(posArray[i*3], posArray[i*3+2], time, seaState)
  }
  posAttr.needsUpdate = true
  oceanGeo.computeVertexNormals()

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
      'The **traveling wave equation** `y(x,t) = A·sin(kx − ωt)` is a solution to the wave PDE `∂²y/∂t² = v²·∂²y/∂x²`. Every term has physical meaning: A is energy (proportional to A²), k is spatial frequency (radians per unit length), ω is temporal frequency (radians per second), and their ratio is phase speed `v = ω/k`. Changing wavelength while keeping wave speed constant requires changing period proportionally.',

      'For a wave traveling in direction `(dx, dz)` (a unit vector), the spatial argument becomes the dot product `k · (x·dx + z·dz)`. This is just the projection of position onto the travel direction, so the phase advances along that direction and is constant perpendicular to it — exactly what a directional wave should do.',

      'The wave slope (gradient) used for buoy pitch/roll is computed via finite differences: `∂h/∂x ≈ (h(x+ε, z, t) − h(x−ε, z, t)) / (2ε)`. This is the standard centered-difference approximation with error O(ε²) — far more accurate than the one-sided forward difference with error O(ε). Analytically, `∂h/∂x = Σ Aᵢ·kᵢ·dxᵢ·cos(kᵢ·(x·dxᵢ + z·dzᵢ) − ωᵢ·t + φᵢ)` — the numerical version is simpler to code and accurate enough for visible pitch/roll.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Traveling Wave',
        body: '$$y(x,t) = A \\sin(kx - \\omega t)$$\n\n- $A$ = amplitude (m), $k = 2\\pi/\\lambda$ = wavenumber (rad/m)\n- $\\omega = 2\\pi/T$ = angular frequency (rad/s)\n- Phase speed: $v = \\omega / k = \\lambda / T$\n- Deep-water dispersion: $\\omega = \\sqrt{gk}$',
      },
      {
        type: 'theorem',
        title: 'Directional Wave',
        body: '$$y = A \\sin\\!\\left(k(x\\,d_x + z\\,d_z) - \\omega t + \\phi\\right)$$\n\n$(d_x, d_z)$ is the unit direction vector. The argument $x\\,d_x + z\\,d_z$ is the dot product of position with travel direction — the phase advances along that direction and is constant perpendicular to it.',
      },
      {
        type: 'theorem',
        title: 'Wave Slope (finite difference)',
        body: '$$\\frac{\\partial h}{\\partial x} \\approx \\frac{h(x+\\varepsilon,\\,z,\\,t) - h(x-\\varepsilon,\\,z,\\,t)}{2\\varepsilon}$$\n\nCentered difference: $O(\\varepsilon^2)$ error. Use $\\varepsilon \\approx 0.3$–$0.5$ world units for stable buoy pitch.',
      },
    ],
    visualizations: [],
  },

  practice: {
    prose: [
      'The challenge adds a fourth wave at a perpendicular direction to the three existing swells. This is the single most important technique for making water look non-periodic — two waves at right angles break up the repeating diagonal pattern.',
    ],
    callouts: [],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenge: Cross-swell',
        mathBridge: 'Add W4 traveling at a perpendicular angle to W1. Introduce it into waveHeight(). Reduce W1_AMP slightly to keep total energy similar. Notice how the interference pattern changes.',
        caption: 'Challenge difficulty: medium. Expected additions: 4 constants + one extra term in waveHeight.',
        initialProps: {
          initialCells: [
            {
              id: 'c1',
              challengeType: 'extend',
              challengeNumber: 1,
              challengeTitle: 'Cross-swell — break the repeating pattern',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'The three-wave ocean still has a faint diagonal stripe pattern because the waves share related directions. Add a fourth wave `W4` traveling at 90° to `W1` (i.e., in the pure +Z direction: `dx=0, dz=1`) with `W4_AMP=0.12`, `W4_FREQ=0.55`, `W4_SPEED=0.95`. This perpendicular swell breaks up the pattern and makes the water look far more open-ocean.',
              ],
              prompt: 'Add W4 constants. Add the W4 term to waveHeight(). Lower W1_AMP to 0.22 so the total amplitude stays similar. Observe how the crossing interference pattern changes the wave texture.',
              hint: 'A wave traveling in pure +Z has `k · (x·0 + z·1) = k·z`. The W4 term is: `W4_AMP * Math.sin(W4_FREQ * z - W4_SPEED * t + 0.8)`.',
              code: `// ── Starter: three-wave ocean ────────────────────────────────
// Add W4 to waveHeight() for a perpendicular cross-swell

const COLS=72, ROWS=72, TILE_SIZE=0.55
const W1_AMP=0.28, W1_FREQ=0.45, W1_SPEED=0.80
const W2_AMP=0.16, W2_FREQ=0.72, W2_SPEED=1.10, W2_DX=0.707, W2_DZ=0.707
const W3_AMP=0.09, W3_FREQ=1.50, W3_SPEED=1.60, W3_DX=-0.447, W3_DZ=0.894
// TODO: add W4 constants here

function waveHeight(x, z, t) {
  return (
    W1_AMP * Math.sin(W1_FREQ * x                  - W1_SPEED * t) +
    W2_AMP * Math.sin(W2_FREQ*(x*W2_DX+z*W2_DZ)   - W2_SPEED * t + 1.5) +
    W3_AMP * Math.sin(W3_FREQ*(x*W3_DX+z*W3_DZ)   - W3_SPEED * t + 2.8)
    // TODO: add W4 term here
  )
}

const halfW=COLS*TILE_SIZE/2, halfD=ROWS*TILE_SIZE/2
let posAttr, posArray, geo, time=0

function buildGrid() {
  const vCount=(COLS+1)*(ROWS+1)
  posArray=new Float32Array(vCount*3); let vi=0
  for (let r=0;r<=ROWS;r++) for (let c=0;c<=COLS;c++) {
    posArray[vi++]=c*TILE_SIZE-halfW; posArray[vi++]=0; posArray[vi++]=r*TILE_SIZE-halfD
  }
  const idx=new Uint32Array(COLS*ROWS*6); let ii=0
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const a=r*(COLS+1)+c,b=a+1,c2=a+(COLS+1),d=c2+1
    idx[ii++]=a;idx[ii++]=c2;idx[ii++]=b;idx[ii++]=b;idx[ii++]=c2;idx[ii++]=d
  }
  geo=new THREE.BufferGeometry()
  posAttr=new THREE.BufferAttribute(posArray,3)
  geo.setAttribute('position',posAttr)
  geo.setIndex(new THREE.BufferAttribute(idx,1))
  geo.computeVertexNormals()
  return geo
}

function init() {
  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 18, 42)
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.5))
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.4)
  sun.position.set(12, 20, 10); scene.add(sun)
  scene.add(new THREE.Mesh(buildGrid(),
    new THREE.MeshStandardMaterial({color:0x006994,roughness:0.15,metalness:0.25,side:THREE.DoubleSide})))
  camera.position.set(0, 10, 20)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt
  const vCount=(COLS+1)*(ROWS+1)
  for (let i=0;i<vCount;i++) posArray[i*3+1]=waveHeight(posArray[i*3], posArray[i*3+2], time)
  posAttr.needsUpdate=true
  geo.computeVertexNormals()
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
      text: 'Ocean water is modeled as a sum of sine waves traveling in different directions: waveHeight = Σ Aᵢ·sin(kᵢ·x·cos(dᵢ) + kᵢ·z·sin(dᵢ) + ωᵢ·t). Why sum multiple waves instead of using one?',
      options: [
        'A single sine wave exceeds canvas memory limits',
        'A single sine wave produces perfectly regular, artificial-looking ripples. Summing waves with different amplitudes, frequencies, and directions creates interference patterns that mimic real water\'s irregular, chaotic surface. Each extra wave adds complexity at the cost of just a few arithmetic operations per vertex',
        'Multiple waves are required so posAttr.needsUpdate works correctly',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'After updating vertex Y-positions in the Float32Array, the code calls `geo.computeVertexNormals()`. Why recompute normals every frame?',
      options: [
        'Three.js clears normals automatically each frame to prevent memory leaks',
        'Normals determine how the material reflects light. As wave vertices move up and down, the surface orientation (normal direction) changes. Stale normals from the previous frame would make the lighting appear frozen while the geometry moves — shading would not match the current wave shape',
        'computeVertexNormals is required by MeshStandardMaterial before render',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'To float a boat on the water, you sample the same waveHeight(x, z, time) function at the boat\'s position. Why use the same formula rather than raycasting down from the boat?',
      options: [
        'Three.js raycasting does not work against PlaneGeometry',
        'The wave formula is analytic — it gives the exact height at any (x, z, t) in O(N_waves) time. Raycasting would traverse the scene graph, check triangle intersections across the whole mesh, and return a result that is only as accurate as the mesh resolution. The formula is faster, more accurate, and works at any point, not just mesh vertices',
        'Raycasting requires a physics engine like Cannon.js',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The vertex positions are stored in a flat Float32Array with layout [x0, y0, z0, x1, y1, z1, ...]. To access the Y-value of vertex i, you use `posArray[i*3+1]`. Why is this flat layout used rather than an array of {x, y, z} objects?',
      options: [
        'JavaScript cannot store objects in typed arrays',
        'Typed arrays (Float32Array) store raw numbers contiguously in memory — the GPU can upload them directly. An array of objects would require unpacking each object to extract the numbers, adding overhead. Contiguous floats also maximise CPU cache efficiency when iterating through all vertices every frame',
        'Float32Array is 3× larger than needed to store extra metadata per vertex',
      ],
      correct: 1,
    },
  ],
}
