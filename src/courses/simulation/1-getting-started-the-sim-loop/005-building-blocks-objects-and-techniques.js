export default {
  id: 'sim1-005',
  slug: 'building-blocks-objects-and-techniques',
  chapter: 'sim1',
  order: 5,
  title: 'Building Blocks Part 1 — Shapes, Materials & Scene',
  subtitle: 'Five self-contained recipes: geometric shapes, PBR materials, lights and shadows, and path-following.',
  tags: ['three.js', 'geometry', 'materials', 'lights', 'shadows', 'path-following', 'CatmullRomCurve3', 'TubeGeometry'],
  aliases: 'sphere egg cylinder torus brick wall material roughness metalness light shadow path geometry building blocks scene',
  timeToComplete: 30,
  coreConcept: 'Every 3D simulation is assembled from the same three building blocks: geometric shapes, physically-based materials, and lights. Master these five patterns and you can construct almost any static or animated scene.',
  prerequisites: ['how-the-sim-lab-works'],
  nextLesson: 'building-blocks-part-2-motion-physics',

  hook: {
    question: 'A game engine, a physics visualiser, a CNC simulator — why does every experienced Three.js developer reach for the same code patterns?',
    realWorldContext: "Professional 3D tools — Unity, Unreal, Blender's render engine — are built on the same geometry/material/light model you're about to use. This lesson is a toolkit, not a story. Each cell is a focused, runnable recipe. Read the prose, study the code once, press Run, then break something and see what happens.",
  },

  intuition: {
    prose: [
      "**Every visible object is a Mesh = Geometry + Material.** The geometry defines the 3D shape (a list of vertices and triangular faces). The material defines how light interacts with the surface. You combine them with `new THREE.Mesh(geometry, material)` and add to the scene.\n\nAll geometries share the same interface: `new THREE.SphereGeometry(radius, widthSegments, heightSegments)`. More segments = smoother silhouette, higher vertex count. For real-time sims, 16–32 segments is usually plenty.",

      "**PBR materials (MeshStandardMaterial) use two numbers to describe every surface.** `roughness` controls the spread of reflections: 0 = mirror, 1 = chalk. `metalness` controls whether the material conducts electricity: 0 = plastic/paint, 1 = metal. Every physical surface in the universe sits somewhere on this 2D grid. These aren't arbitrary knobs — they're parameterisations of the Cook-Torrance reflectance model.",

      "**Lights make geometry visible and three-dimensional.** Without lights, `MeshStandardMaterial` renders solid black. The three most useful lights are: `DirectionalLight` (parallel rays — the sun), `PointLight` (omnidirectional from a point — a light bulb), and `AmbientLight` (uniform fill — skylight). Shadows require both `light.castShadow = true` and `mesh.receiveShadow = true`, plus `renderer.shadowMap.enabled = true`.",

      "**`CatmullRomCurve3` produces a smooth spline through any set of control points.** `curve.getPointAt(t)` returns the 3D position at fraction `t ∈ [0,1]` along the arc length. Orient a traveller using `lookAt(curve.getPointAt(t + ε))` — looking slightly ahead aligns the object with its direction of travel. This is the standard technique for trains, roller coasters, and any object following a route.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'The Three.js Object Recipe',
        body: '```js\nconst geometry = new THREE.SphereGeometry(1, 32, 32)  // shape\nconst material = new THREE.MeshStandardMaterial({    // surface\n  color: 0x44aaff, roughness: 0.4, metalness: 0.1\n})\nconst mesh = new THREE.Mesh(geometry, material)       // combine\nmesh.position.set(0, 1, 0)                           // place\nscene.add(mesh)                                       // show\n```',
      },
      {
        type: 'insight',
        title: 'Ellipsoid = Sphere + Non-Uniform Scale',
        body: 'Three.js has no built-in ellipsoid geometry. Make one by scaling a unit sphere: `mesh.scale.set(rx, ry, rz)`. An egg shape uses `ry > rx = rz`. A disc uses `ry < rx = rz`. This is faster than custom geometry and re-uses the same vertex data.',
      },
      {
        type: 'warning',
        title: 'position is not replaceable — only settable',
        body: '`mesh.position` is a read-only getter on `Object3D`. You cannot do `Object.assign(mesh, { position: new THREE.Vector3() })` or `mesh.position = new THREE.Vector3()`. You must call `.set(x, y, z)` on the existing Vector3: `mesh.position.set(x, y, z)`.',
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

            // ── Cell 1: Shapes ─────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Shapes — Sphere, Egg, Cylinder, Torus',
              mode: '3d',
              prose: [
                '`SphereGeometry(radius, widthSegments, heightSegments)` creates a UV-sphere. `widthSegments` controls horizontal resolution (longitude lines), `heightSegments` controls vertical (latitude lines). 32×32 is smooth enough for most cases; 8×8 looks faceted (useful for a gem or asteroid).',
                'An egg (ellipsoid) has no dedicated geometry class. The trick: create a **unit sphere** (`radius = 1`) and apply a non-uniform scale with `mesh.scale.set(rx, ry, rz)`. Three.js handles the normal recalculation automatically.',
                '`TorusGeometry(radius, tube, radialSegments, tubularSegments)` — `radius` is the ring radius, `tube` is the thickness of the pipe. Tilting it with `rotation.x = Math.PI / 4` shows the hole.',
              ],
              code: `// ── Shapes: Sphere · Egg (Ellipsoid) · Cylinder · Torus ─────
// Run this cell, then try changing SPHERE_SEGMENTS to 6 to
// see the low-poly "gem" look.

const SPHERE_RADIUS   = 0.85
const SPHERE_SEGMENTS = 32     // widthSegments = heightSegments

const EGG_RADIUS_XZ  = 0.70   // horizontal radius of the ellipsoid
const EGG_RADIUS_Y   = 1.15   // vertical radius  — taller than wide

const CYL_RADIUS     = 0.55
const CYL_HEIGHT     = 1.60
const CYL_SEGMENTS   = 24

const TORUS_RADIUS   = 0.80   // center of ring to center of tube
const TORUS_TUBE     = 0.28   // tube cross-section radius
const TORUS_TILT_DEG = 45     // degrees to tilt so hole is visible

function init() {
  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.35))
  const sunLight = new THREE.DirectionalLight(0xfff8f0, 1.4)
  sunLight.position.set(5, 8, 5)
  scene.add(sunLight)

  // 1. Sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
    new THREE.MeshStandardMaterial({ color: 0x44aaff, roughness: 0.4, metalness: 0.15 })
  )
  sphere.position.set(-4, SPHERE_RADIUS, 0)
  scene.add(sphere)

  // 2. Egg — unit sphere scaled non-uniformly
  const egg = new THREE.Mesh(
    new THREE.SphereGeometry(1, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
    new THREE.MeshStandardMaterial({ color: 0xffe0a0, roughness: 0.55 })
  )
  egg.scale.set(EGG_RADIUS_XZ, EGG_RADIUS_Y, EGG_RADIUS_XZ)
  egg.position.set(-1.4, EGG_RADIUS_Y, 0)
  scene.add(egg)

  // 3. Cylinder  (radiusTop, radiusBottom, height, radialSegments)
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(CYL_RADIUS, CYL_RADIUS, CYL_HEIGHT, CYL_SEGMENTS),
    new THREE.MeshStandardMaterial({ color: 0x88dd88, roughness: 0.5 })
  )
  cylinder.position.set(1.2, CYL_HEIGHT / 2, 0)
  scene.add(cylinder)

  // 4. Torus  (ring-radius, tube-radius, radialSegs, tubularSegs)
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(TORUS_RADIUS, TORUS_TUBE, 18, 52),
    new THREE.MeshStandardMaterial({ color: 0xff6688, roughness: 0.25, metalness: 0.55 })
  )
  torus.position.set(3.9, TORUS_RADIUS + TORUS_TUBE, 0)
  torus.rotation.x = (TORUS_TILT_DEG * Math.PI) / 180
  scene.add(torus)

  // Floor plane — PlaneGeometry lies flat in XZ by default
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 10),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  camera.position.set(0, 3.5, 9)
  camera.lookAt(0, 1, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 2: Brick Wall ─────────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Brick Wall — nested loop grid with running bond',
              mode: '3d',
              prose: [
                'A brick wall is a 2D grid of boxes. The only non-obvious part is the **running bond offset**: every odd row shifts by half a brick width, so the vertical joints never line up between rows. This is why real walls don\'t crack easily — no continuous vertical joint.',
                'The `mortar gap` is the empty space between bricks. `stepX = BRICK_W + MORTAR_GAP` is the distance from the left edge of one brick to the left edge of the next. Without the gap, bricks would be flush against each other.',
                'All bricks share the same geometry and material objects — creating them once and reusing them is more efficient than creating a new `BoxGeometry` per brick.',
              ],
              code: `// ── Brick Wall — nested loop with running bond offset ────────

const BRICK_W    = 1.00   // width  of one brick (units)
const BRICK_H    = 0.44   // height of one brick
const BRICK_D    = 0.44   // depth  of one brick
const MORTAR_GAP = 0.06   // gap between bricks
const WALL_COLS  = 8      // number of bricks per row
const WALL_ROWS  = 6      // number of rows

// Derived spacing — distance from one brick's left edge to the next's
const STEP_X = BRICK_W + MORTAR_GAP
const STEP_Y = BRICK_H + MORTAR_GAP

// Total wall width, used to center it at x=0
const WALL_TOTAL_W = WALL_COLS * STEP_X

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const sunLight = new THREE.DirectionalLight(0xfff0e0, 1.1)
  sunLight.position.set(4, 8, 6)
  scene.add(sunLight)

  // One geometry + one material, reused for every brick
  const brickGeo = new THREE.BoxGeometry(BRICK_W, BRICK_H, BRICK_D)
  const brickMat = new THREE.MeshStandardMaterial({ color: 0xbb5533, roughness: 0.88 })

  for (let row = 0; row < WALL_ROWS; row++) {
    // Running bond: odd rows shift half a brick to the right
    const xShift = (row % 2 === 0) ? 0 : STEP_X / 2

    for (let col = 0; col < WALL_COLS; col++) {
      const brick = new THREE.Mesh(brickGeo, brickMat)
      brick.position.set(
        col * STEP_X + xShift - WALL_TOTAL_W / 2,  // center the wall horizontally
        row * STEP_Y + BRICK_H / 2,                  // stack bricks upward from y=0
        0
      )
      scene.add(brick)
    }
  }

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 14),
    new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 1.0 })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  camera.position.set(0, 2.5, 8)
  camera.lookAt(0, WALL_ROWS * STEP_Y / 2, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 3: Materials ──────────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Materials — metalness, roughness, emissive, wireframe',
              mode: '3d',
              prose: [
                '`MeshStandardMaterial` is a physically-based (PBR) material. Two numbers describe every real-world surface: **roughness** (0 = mirror, 1 = chalk) controls how focused the reflections are, and **metalness** (0 = plastic, 1 = copper) controls whether the surface conducts electricity. Every real material sits somewhere in this 0–1 × 0–1 space.',
                '`emissive` is an additive color that the material emits regardless of lighting. At `emissiveIntensity: 1.0`, the emissive color is added at full brightness on top of the lit color. Use it for glowing objects, screens, lava, or LEDs — not for general brightness. Unlike a light source, emissive objects don\'t illuminate other objects.',
                '`wireframe: true` skips triangle fill and draws only the edges. Useful for debugging geometry or as an artistic style. Note: wireframe reveals how many triangles your geometry uses — a SphereGeometry(1, 32, 32) has 2048 triangles.',
              ],
              code: `// ── Materials: PBR roughness·metalness, emissive, wireframe ──

// All five spheres share the same geometry — only the material changes.
// Try tweaking these constants and pressing Run.

const ROUGHNESS_MATTE   = 0.92   // chalk / rough plastic
const ROUGHNESS_PAINTED = 0.08   // polished paint (sharp reflections)
const ROUGHNESS_BRUSHED = 0.42   // brushed steel

const METALNESS_PLASTIC = 0.00
const METALNESS_METAL   = 1.00

const EMISSIVE_COLOR     = 0x00ff88
const EMISSIVE_INTENSITY = 0.85   // 0 = no glow, 1 = full glow, >1 = bloom

const SPHERE_RADIUS   = 0.90
const SPHERE_SEGMENTS = 32
const SPACING         = 2.60     // horizontal distance between sphere centers

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.30))
  const sunLight = new THREE.DirectionalLight(0xfff8f0, 1.6)
  sunLight.position.set(4, 7, 5)
  scene.add(sunLight)
  // Rim light from behind to show material edges
  const rimLight = new THREE.DirectionalLight(0x8888ff, 0.4)
  rimLight.position.set(-3, 2, -5)
  scene.add(rimLight)

  const geo = new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS)

  // 1. Matte plastic — rough, non-metallic
  const matte = new THREE.Mesh(geo,
    new THREE.MeshStandardMaterial({ color: 0x44aaff, roughness: ROUGHNESS_MATTE, metalness: METALNESS_PLASTIC }))
  matte.position.set(-SPACING * 2, SPHERE_RADIUS, 0)
  scene.add(matte)

  // 2. Polished paint — smooth, non-metallic
  const polished = new THREE.Mesh(geo,
    new THREE.MeshStandardMaterial({ color: 0xff4466, roughness: ROUGHNESS_PAINTED, metalness: METALNESS_PLASTIC }))
  polished.position.set(-SPACING, SPHERE_RADIUS, 0)
  scene.add(polished)

  // 3. Brushed metal — smooth-ish, fully metallic
  const brushed = new THREE.Mesh(geo,
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: ROUGHNESS_BRUSHED, metalness: METALNESS_METAL }))
  brushed.position.set(0, SPHERE_RADIUS, 0)
  scene.add(brushed)

  // 4. Emissive glow — self-illuminated regardless of scene lights
  const glowing = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: EMISSIVE_COLOR, emissive: EMISSIVE_COLOR, emissiveIntensity: EMISSIVE_INTENSITY,
    roughness: 0.50, metalness: METALNESS_PLASTIC,
  }))
  glowing.position.set(SPACING, SPHERE_RADIUS, 0)
  scene.add(glowing)

  // 5. Wireframe — edges only, shows underlying triangle mesh
  const wired = new THREE.Mesh(geo,
    new THREE.MeshStandardMaterial({ color: 0xffcc44, wireframe: true }))
  wired.position.set(SPACING * 2, SPHERE_RADIUS, 0)
  scene.add(wired)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 10),
    new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 1.0 })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  camera.position.set(0, 3.5, 9)
  camera.lookAt(0, 1, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 4: Lights and Shadows ─────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Lights and Shadows — Ambient, Directional, PointLight',
              mode: '3d',
              prose: [
                '`AmbientLight` adds a constant brightness to every surface in the scene — it has no direction, so it casts no shadows. Use it as a "fill" to prevent dark sides from going completely black. Too high an ambient intensity flattens the scene.',
                '`DirectionalLight` sends parallel rays from an infinite distance (like the sun). All shadows are parallel. It\'s the most efficient light for outdoor scenes. `light.castShadow = true` enables shadow maps — the renderer draws the scene from the light\'s point of view to build a depth texture.',
                'Shadow quality is controlled by `shadow.mapSize` — larger = sharper but slower. `shadow.camera.near/far/left/right` defines the frustum that captures shadow-casting geometry. If you see shadows cut off at the edges, widen that frustum.',
              ],
              code: `// ── Lights and Shadows ───────────────────────────────────────

const AMBIENT_INTENSITY  = 0.25   // 0 = pitch dark sides, 1 = no shading
const SUN_INTENSITY      = 1.10
const POINT_INTENSITY    = 55     // brightness of the orbiting bulb
const POINT_DECAY        = 2      // physically-based falloff (distance²)
const POINT_ORBIT_RADIUS = 4.5
const POINT_ORBIT_SPEED  = 0.70   // rad/s
const SHADOW_MAP_SIZE    = 1024   // px — try 512 for blurry, 2048 for crisp

const BOX_SIZE = 1.1

let orbitLight, lightMarker, time = 0

function init() {
  renderer.shadowMap.enabled = true   // must be enabled for ANY shadows

  // 1. Ambient — fills shadows so dark sides aren't pure black
  scene.add(new THREE.AmbientLight(0x7788aa, AMBIENT_INTENSITY))

  // 2. Directional sun — parallel rays, constant shadow direction
  const sunLight = new THREE.DirectionalLight(0xffeedd, SUN_INTENSITY)
  sunLight.position.set(6, 10, 6)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width  = SHADOW_MAP_SIZE
  sunLight.shadow.mapSize.height = SHADOW_MAP_SIZE
  // The shadow camera frustum must enclose all shadow-casting geometry
  sunLight.shadow.camera.left   = -10
  sunLight.shadow.camera.right  =  10
  sunLight.shadow.camera.top    =  10
  sunLight.shadow.camera.bottom = -10
  scene.add(sunLight)

  // 3. Orbiting PointLight — omnidirectional, warm color
  orbitLight = new THREE.PointLight(0xff9933, POINT_INTENSITY, 0, POINT_DECAY)
  orbitLight.castShadow = true
  orbitLight.shadow.mapSize.width  = SHADOW_MAP_SIZE / 2
  orbitLight.shadow.mapSize.height = SHADOW_MAP_SIZE / 2
  scene.add(orbitLight)

  // Small sphere to visualise the point light position
  lightMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xff9933 })  // BasicMaterial ignores lights
  )
  scene.add(lightMarker)

  // Boxes — each casts and receives shadows
  const boxGeo = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE)
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.6 })
  const positions = [[-2.5, 0, -1], [0, 0, 0.5], [2.5, 0, -1], [-1, 0, 2.5], [1.5, 0, 2.5]]
  positions.forEach(([x, _, z]) => {
    const box = new THREE.Mesh(boxGeo, boxMat)
    box.position.set(x, BOX_SIZE / 2, z)
    box.castShadow    = true
    box.receiveShadow = true
    scene.add(box)
  })

  // Floor — must receiveShadow to show the cast shadow on it
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 22),
    new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.9 })
  )
  floor.rotation.x  = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  camera.position.set(0, 7, 12)
  camera.lookAt(0, 0.5, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt
  const angle = time * POINT_ORBIT_SPEED
  orbitLight.position.set(
    Math.cos(angle) * POINT_ORBIT_RADIUS,
    2.8,
    Math.sin(angle) * POINT_ORBIT_RADIUS
  )
  lightMarker.position.copy(orbitLight.position)
  renderer.render(scene, camera)
}`,
            },

            // ── Cell 5: Path Following ─────────────────────────────────────────
            {
              id: 5,
              cellTitle: 'Moving along a path — CatmullRomCurve3',
              mode: '3d',
              prose: [
                '`CatmullRomCurve3` takes an array of `Vector3` control points and produces a smooth spline that passes exactly through each one. `curve.getPointAt(t)` returns the 3D position at fraction `t ∈ [0, 1]` along the total arc length. `curve.getTangentAt(t)` returns the unit direction vector at that point.',
                '`traveller.lookAt(lookTarget)` rotates an object to face a point. By looking at a point *slightly ahead* on the curve (at `t + LOOKAHEAD`), the traveller orients along its direction of travel. This is the standard technique for trains, roller coasters, and aircraft following routes.',
                '`TubeGeometry(curve, segments, tubeRadius, sides, closed)` wraps a tube mesh around any curve — a quick way to visualise a path. The same curve object is reused for both the tube geometry and the `getPointAt` queries.',
              ],
              code: `// ── Moving along a path — CatmullRomCurve3 ──────────────────

const TRAVEL_SPEED      = 0.10    // fraction of curve length per second
const LOOKAHEAD_FRAC    = 0.008   // how far ahead to look (for orientation)
const PATH_TUBE_RADIUS  = 0.045
const PATH_TUBE_SEGS    = 120

let curve, traveller, t = 0

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
  sunLight.position.set(4, 8, 4)
  scene.add(sunLight)

  // Control points — the curve passes smoothly through each one
  // Closing the loop: last point = first point
  const controlPoints = [
    new THREE.Vector3(-5,  0.2,  0),
    new THREE.Vector3(-2,  2.5,  4),
    new THREE.Vector3( 0,  0.2,  5),
    new THREE.Vector3( 3,  3.0,  2),
    new THREE.Vector3( 5,  0.2, -1),
    new THREE.Vector3( 2, -0.5, -4),
    new THREE.Vector3(-3,  1.0, -3),
    new THREE.Vector3(-5,  0.2,  0),   // same as first → closed loop
  ]
  curve = new THREE.CatmullRomCurve3(controlPoints, /* closed= */ true)

  // Visualise the path as a thin tube
  const tubeGeo = new THREE.TubeGeometry(
    curve, PATH_TUBE_SEGS, PATH_TUBE_RADIUS, 8, /* closed= */ true
  )
  scene.add(new THREE.Mesh(tubeGeo,
    new THREE.MeshStandardMaterial({ color: 0x3366ff, roughness: 0.3 })
  ))

  // Mark each control point with a yellow sphere
  controlPoints.slice(0, -1).forEach(pt => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffdd44 })
    )
    marker.position.copy(pt)
    scene.add(marker)
  })

  // The travelling object — a small arrow-shaped group
  traveller = new THREE.Group()

  // Body sphere
  traveller.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xff4466, emissive: 0x220011 })
  ))

  // Nose cone — points in +Z so lookAt() aims it forward
  const noseCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.55, 12),
    new THREE.MeshStandardMaterial({ color: 0xff8844 })
  )
  noseCone.position.z = -0.42
  noseCone.rotation.x =  Math.PI / 2   // rotate cone to point along -Z (lookAt direction)
  traveller.add(noseCone)

  scene.add(traveller)

  // Floor grid
  scene.add(new THREE.GridHelper(14, 14, 0x222233, 0x222233))

  camera.position.set(0, 9, 14)
  camera.lookAt(0, 1, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // Advance position along the curve, wrap at 1 to loop forever
  t = (t + TRAVEL_SPEED * dt) % 1

  const currentPos = curve.getPointAt(t)
  traveller.position.copy(currentPos)

  // Orient the traveller to face slightly ahead on the curve
  const lookAheadT   = (t + LOOKAHEAD_FRAC) % 1
  const lookAheadPos = curve.getPointAt(lookAheadT)
  traveller.lookAt(lookAheadPos)

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
      'PBR (Physically Based Rendering) materials use the **Cook-Torrance microfacet BRDF**: `f_r(ω_i, ω_o) = D(h)G(ω_i,ω_o)F(ω_i,h) / (4(n·ω_i)(n·ω_o))`. The three terms are: D (distribution of microfacet normals — controlled by roughness), G (geometric self-shadowing — also roughness-dependent), and F (Fresnel reflectance at the surface boundary — controlled by metalness and base color). `MeshStandardMaterial` implements this exactly.',

      '`CatmullRomCurve3` uses a centripetal parameterisation by default: each control point is assigned a parameter value proportional to the square root of the arc length between it and the previous point. `getPointAt(t)` re-parameterises by *total arc length*, so `t = 0.5` always means halfway along the path regardless of how the control points are spaced — this is why the traveller moves at constant speed without any special velocity correction.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'PBR roughness↔metalness space',
        body: 'Every physical surface maps to a (roughness, metalness) pair. Examples: chalk = (1.0, 0.0), mirror = (0.0, 0.0), brushed steel = (0.4, 1.0), polished gold = (0.05, 1.0), wet asphalt = (0.8, 0.0). The two parameters are orthogonal: roughness controls highlight sharpness, metalness controls whether the base color tints the reflection.',
      },
      {
        type: 'definition',
        title: 'Arc-length parameterisation',
        body: '`curve.getPointAt(t)` uses arc-length parameterisation: equal steps in `t` give equal distances along the curve. `curve.getPoint(t)` does NOT — it uses the raw parameter which varies with control point spacing. Always use `getPointAt` for animation so speed is uniform.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenge — Combine the Recipes',
        mathBridge: 'This challenge combines path-following, geometry, and collision concepts. There is no single right answer — focus on which recipe each part of the solution comes from.',
        caption: 'Open-ended build. Break things freely — the error console at the bottom of the preview is your friend.',
        initialProps: {
          initialCells: [

            // ── Challenge 1: Pinball table ─────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'build',
              challengeNumber: 1,
              challengeTitle: '3D Pinball — ball bouncing off a bumper cluster',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'A pinball bumper is just a cylinder that the ball can bounce off. When the ball hits a bumper, compute the outward normal from the bumper\'s center to the ball\'s XZ position (ignore Y — the bumpers are tall) and apply the reflection formula. Give the reflected velocity a boost to make the ball spring away with more energy than it arrived with (`BUMPER_BOOST > 1`).',
              ],
              prompt: 'Build a top-down pinball table: a flat floor, four cylindrical bumpers arranged in a diamond, and a ball that launches with an upward velocity and bounces off the bumpers and the outer walls. Add BUMPER_BOOST so hitting a bumper adds 20% extra speed. Use gravity pulling toward −Z (the "table direction") instead of −Y.',
              hint: 'For a bumper at position (bx, 0, bz) and ball at (px, py, pz): compute normal = normalize(px−bx, 0, pz−bz). Contact when sqrt((px−bx)²+(pz−bz)²) < bumperRadius + ballRadius. Apply v′ = v − 2(v·n)n then multiply by BUMPER_BOOST.',
              code: `// Starter: Pinball table
// Gravity pulls in −Z direction (the table is tilted toward you)

const BALL_RADIUS   = 0.25
const BUMPER_RADIUS = 0.60
const TABLE_W       = 6.0    // half-width of the table
const TABLE_H       = 9.0    // half-height (Z extent)
const GRAVITY_Z     = 8.0    // acceleration toward −Z (downhill)
const BUMPER_BOOST  = 1.20   // speed multiplier on bumper hit

// Bumper positions (XZ — the table plane is XZ)
const BUMPER_POSITIONS = [
  new THREE.Vector3( 0,   0.5,  2),
  new THREE.Vector3(-2,   0.5,  0),
  new THREE.Vector3( 2,   0.5,  0),
  new THREE.Vector3( 0,   0.5, -2),
]

let ball, velocity
const _normal = new THREE.Vector3()

function init() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const light = new THREE.DirectionalLight(0xffffff, 1.0)
  light.position.set(2, 8, 4)
  scene.add(light)

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(TABLE_W * 2, TABLE_H * 2),
    new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  // Bumpers
  BUMPER_POSITIONS.forEach(pos => {
    const bumper = new THREE.Mesh(
      new THREE.CylinderGeometry(BUMPER_RADIUS, BUMPER_RADIUS, 1.0, 20),
      new THREE.MeshStandardMaterial({ color: 0xff4422, emissive: 0x220800 })
    )
    bumper.position.copy(pos)
    scene.add(bumper)
  })

  // Ball
  ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 })
  )
  ball.position.set(0, BALL_RADIUS, TABLE_H - 1)
  scene.add(ball)

  velocity = new THREE.Vector3(1.0, 0, -12.0)   // initial launch

  camera.position.set(0, 18, 8)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // Gravity along −Z (table tilt)
  velocity.z += GRAVITY_Z * dt
  ball.position.addScaledVector(velocity, dt)

  // TODO: collide with each bumper
  // BUMPER_POSITIONS.forEach(bPos => { ... })

  // Table walls (X and Z bounds)
  const XL = TABLE_W - BALL_RADIUS
  const ZL = TABLE_H - BALL_RADIUS
  if (ball.position.x >  XL) { ball.position.x =  XL; velocity.x = -Math.abs(velocity.x) }
  if (ball.position.x < -XL) { ball.position.x = -XL; velocity.x =  Math.abs(velocity.x) }
  if (ball.position.z >  ZL) { ball.position.z =  ZL; velocity.z = -Math.abs(velocity.z) }
  if (ball.position.z < -ZL) { ball.position.z = -ZL; velocity.z =  Math.abs(velocity.z) }

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
      text: 'Wall collision response: `if (ball.position.x > XL) { velocity.x = -Math.abs(velocity.x) }`. Why use `-Math.abs(velocity.x)` instead of just `velocity.x *= -1`?',
      options: [
        'Math.abs is faster than negation',
        'If the ball somehow tunnels past the wall (e.g., at high speed it skips over in one frame), its velocity might already be negative. `*= -1` would flip it positive, pushing it further into the wall. `-Math.abs` always ensures the velocity points away from the wall, regardless of the current sign',
        'velocity.x *= -1 does not work for Three.js Vector3 objects',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '`ball.position.addScaledVector(velocity, dt)` advances the ball position. What is the equivalent arithmetic?',
      options: [
        'ball.position = velocity * dt',
        'ball.position.x += velocity.x * dt; ball.position.y += velocity.y * dt; ball.position.z += velocity.z * dt — addScaledVector is a convenience method that does the same component-wise addition in one call',
        'ball.position.set(velocity.x * dt, velocity.y * dt, velocity.z * dt)',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'The pinball table applies gravity along the −Z axis: `velocity.z += GRAVITY_Z * dt`. Why Z instead of −Y (which is how real gravity works)?',
      options: [
        'Three.js does not support Y-axis gravity',
        'The table is modeled as lying flat (the XZ plane), so "down the table" is in the −Z direction within the 3D scene. Gravity in the real room acts downward (−Y in Three.js Y-up coordinates) but on the table surface it appears as a force along −Z. The physics is simplified to 2D on the XZ plane',
        'GRAVITY_Z is a constant that automatically sets the correct axis',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The wall bound is `XL = TABLE_W - BALL_RADIUS`. Why subtract the ball radius rather than just checking against TABLE_W?',
      options: [
        'TABLE_W is measured in pixels and BALL_RADIUS in world units so a correction is needed',
        'The ball\'s position is its center. If the center reaches TABLE_W, half the ball has already passed through the wall. Subtracting BALL_RADIUS means the center stops when the ball\'s edge — not its center — touches the wall, giving physically correct bouncing',
        'Subtracting prevents floating-point errors at exact boundary values',
      ],
      correct: 1,
    },
  ],
}
