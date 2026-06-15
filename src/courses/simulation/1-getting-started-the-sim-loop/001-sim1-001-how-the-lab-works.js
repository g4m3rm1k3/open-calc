export default {
  id: 'sim1-001',
  slug: 'how-the-sim-lab-works',
  chapter: 'sim1',
  order: 1,
  title: 'How the Sim Lab Works',
  subtitle: 'Every simulation — from Pong to climate models — is the same two-function loop. Master init and update and you can build anything.',
  tags: ['three.js', 'canvas2d', 'simulation', 'animation-loop', 'requestAnimationFrame', 'delta-time', 'coordinate-systems'],
  aliases: 'simulation loop init update delta time three.js canvas 2d setup getting started',
  timeToComplete: 25,
  coreConcept: 'A simulation is a loop: call init() once to set up the world, then call update(dt) 60 times per second to advance it. dt is the elapsed time in seconds since the last frame. Multiply every velocity and force by dt to make simulations frame-rate independent.',
  prerequisites: [],
  nextLesson: 'geometry-and-materials',

  // ── Hook ──────────────────────────────────────────────────────────────────
  hook: {
    question: "What's inside a game engine that makes it possible to write `ball.x += speed * dt` and have the ball move smoothly across the screen at 60 frames per second?",
    realWorldContext: "Flight simulators that train pilots cost millions of dollars — but they run the same loop as a $5 mobile game. Climate models that predict sea-level rise in 2100, molecular dynamics engines that discover new drugs, finite-element solvers that stress-test bridges before they're built — every single one of them is the same program. Set up the initial state. Advance time by one tiny step. Draw what you see. Repeat.\n\nThe Sim Lab is your own version of this engine. It runs in your browser with no install, no setup, and no permission slip. This lesson teaches you the loop. Every simulation you build from here will be a variation on one theme: **state → update → render → repeat**.",
  },

  // ── Intuition ─────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      "**The universal simulation pattern.** Strip any simulation down to its skeleton and you find the same four steps:\n\n1. **init()** — create your world: spawn objects, set starting positions, load data.\n2. **update(dt)** — advance time: move objects, apply forces, resolve collisions.\n3. **render** — draw the current state to the screen.\n4. Go back to step 2 — forever, 60 times per second.\n\nYou write `init()` and `update(dt)`. The Sim Lab handles steps 3 and 4 automatically via `requestAnimationFrame`.",

      "**What is dt?** `dt` stands for *delta time* — the number of seconds that elapsed since the last frame. At a steady 60 fps, dt is approximately 0.0167 seconds (one sixtieth of a second). At 30 fps it is 0.033. The exact value fluctuates.\n\nThis is why you always multiply by dt:\n\n```\nposition += velocity * dt   ✓ frame-rate independent\nposition += velocity        ✗ faster on fast machines\n```\n\nA ball travelling 5 units per second advances `5 × 0.0167 ≈ 0.083` units per frame at 60 fps. At 30 fps it advances `5 × 0.033 ≈ 0.167` — twice as far per frame, but the same distance per second. The simulation runs identically on any device.",

      "**Two environments, same pattern.** The Sim Lab supports two rendering environments:\n\n**3D mode (Three.js):** Your code receives `scene`, `camera`, `renderer`, `controls`, and `THREE` as globals. Three.js is a JavaScript library that wraps WebGL — the GPU API. You work with friendly abstractions (meshes, lights, materials) and never touch shader code directly.\n\n**2D mode (Canvas):** Your code receives `canvas`, `ctx`, `W`, and `H`. `ctx` is the Canvas 2D rendering context — a \"pen\" with methods like `fillRect`, `arc`, and `lineTo`. Drawing is *immediate-mode*: you clear the entire canvas and redraw everything from scratch on every frame.",

      "**Three.js: Geometry + Material = Mesh.** In 3D mode, every visible object you create follows this recipe:\n\n```js\nconst geometry = new THREE.BoxGeometry(2, 2, 2)      // the shape\nconst material = new THREE.MeshPhongMaterial({        // the surface\n  color: 0x44aaff\n})\nconst mesh = new THREE.Mesh(geometry, material)       // combine them\nscene.add(mesh)                                       // add to world\n```\n\nGeometry defines the 3D shape (vertices and faces). Material defines how light interacts with the surface. A Mesh combines both. `scene.add()` makes it visible.",

      "**Before reading on, predict:** if you called `mesh.rotation.y += 1.5 * dt` inside `update(dt)`, how many full rotations would the mesh complete per second? One full rotation is 2π ≈ 6.28 radians. At 1.5 radians per second, that is `1.5 / (2π) ≈ 0.24` rotations per second — roughly one rotation every 4 seconds. Try it and see if your prediction is right.",
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1 of the Simulation Series',
        body: '**Previous:** (start)\n**This lesson:** The init/update pattern, coordinate systems, Three.js basics, Canvas 2D basics.\n**Next:** Geometry and Materials — BoxGeometry, SphereGeometry, MeshStandardMaterial, lighting models, transparency.',
      },
      {
        type: 'procedure',
        title: 'The init/update Contract',
        body: 'Your code MUST define exactly two functions and return them:\n\n```js\nfunction init()        { /* called once */ }\nfunction update(dt)    { /* called ~60×/sec */ }\n```\n\nThe sandbox calls `init()` when you press **Run**. It then calls `update(dt)` on every animation frame. If your code throws inside `update()`, the loop stops and the error appears at the bottom of the preview. In 3D mode: you must call `renderer.render(scene, camera)` at the end of every `update()` or nothing moves.',
      },
      {
        type: 'insight',
        title: '3D Coordinate System — Right-Handed, Y-Up',
        body: 'Three.js uses a **right-handed, Y-up** coordinate system:\n\n• **+X** → right\n• **+Y** → up\n• **+Z** → toward you (out of the screen)\n\nThe scene origin is `(0, 0, 0)`. Positive Y is up — so to place an object on the "floor," set `position.y = 0`. OrbitControls lets you drag the camera around the scene with the mouse. Inside `init()`, use `camera.position.set(x, y, z)` and `camera.lookAt(0, 0, 0)` to choose your viewpoint.',
      },
      {
        type: 'insight',
        title: '2D Coordinate System — Y Increases Downward',
        body: 'Canvas 2D has a **Y-down** coordinate system:\n\n• **(0, 0)** → top-left corner\n• **X** increases right\n• **Y** increases **downward**\n\n`W` and `H` are the pixel dimensions of the canvas (full window size). To draw at the visual center, use `(W/2, H/2)`. To simulate physics with Y-up, store your own internal coordinates and flip: `screenY = H - physicsY`.',
      },
      {
        type: 'warning',
        title: 'Always call renderer.render(scene, camera) in update()',
        body: 'In 3D mode, Three.js does **not** automatically redraw each frame. You must call `renderer.render(scene, camera)` at the end of every `update()` call. If you forget, the scene will display correctly after `init()` (which calls render once) but will appear frozen as soon as `update()` starts running — because update() never draws anything. This is the most common mistake in Three.js animation loops.',
      },
      {
        type: 'definition',
        title: 'requestAnimationFrame — The Browser\'s Animation Scheduler',
        body: 'The browser calls your `update(dt)` function using `requestAnimationFrame` (rAF). rAF:\n\n1. **Syncs to the display refresh rate** — typically 60 Hz, but 120 Hz on newer displays.\n2. **Pauses when the tab is hidden** — saving CPU and battery.\n3. **Passes a timestamp** — the sandbox computes `dt = (timestamp − prevTimestamp) / 1000` to give you seconds.\n\nYou never call rAF yourself. The sandbox handles it. Your only job is to write `update(dt)` correctly.',
      },
      {
        type: 'insight',
        title: 'Why dt is Clamped to 50ms',
        body: 'If you switch browser tabs and come back, the tab may have been paused for several seconds. Without clamping, dt could be 5 seconds — which would make physics objects teleport or explode.\n\nThe sandbox clamps dt to a maximum of 0.05 seconds (50ms). This means: after a long pause, the simulation jumps forward by at most one large step, not an arbitrary amount. Your physics stays stable.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Build: Your First Simulations',
        mathBridge: 'Each cell below is an independent simulation. Read the prose, study the code, then press Run. Modify the parameters — change colors, speeds, sizes — and re-run. The most important skill is building a mental model of what each line does before you run it.',
        caption: 'Cells 1–2 use Three.js (3D). Cells 3–4 use Canvas 2D. Challenges are open-ended — no single correct answer.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: A static scene — geometry, material, mesh',
              mode: '3d',
              prose: [
                '`new THREE.BoxGeometry(2, 2, 2)` creates a cube 2 units wide, tall, and deep. `new THREE.MeshPhongMaterial({ color: 0x44aaff })` creates a shiny blue material — Phong shading computes highlights using the scene lights. Together they form a `Mesh`, which is added to the `scene`.',
                '`camera.position.set(5, 4, 8)` positions the camera 5 right, 4 up, and 8 toward us. `camera.lookAt(0, 0, 0)` aims it at the origin. Try changing these numbers and re-running.',
                '`renderer.render(scene, camera)` in `update()` redraws the scene each frame. Even though nothing moves yet, you must call this — otherwise after `init()` runs once, the screen would never refresh.',
              ],
              code: `// ── 3D Scene: Geometry + Material + Mesh ────────────────
// scene, camera, renderer, controls, THREE are globals

let box  // we declare it here so update() can access it

function init() {
  // Floor grid (optional but helps orient the scene)
  scene.add(new THREE.GridHelper(10, 10))

  // 1. Shape (the wireframe / surface geometry)
  const geometry = new THREE.BoxGeometry(2, 2, 2)

  // 2. Material (how the surface looks under light)
  const material = new THREE.MeshPhongMaterial({
    color:    0x44aaff,   // hex color — try 0xff4444 for red
    emissive: 0x112233,   // color emitted even without light
  })

  // 3. Mesh = geometry + material
  box = new THREE.Mesh(geometry, material)
  box.position.set(0, 1, 0)   // lift it 1 unit above the grid
  scene.add(box)

  // 4. Camera position and target
  camera.position.set(5, 4, 8)
  camera.lookAt(0, 0, 0)

  renderer.render(scene, camera)
}

function update(dt) {
  // Nothing moves yet — but we must render each frame
  renderer.render(scene, camera)
}`,
            },

            {
              id: 2,
              cellTitle: '3D: The animation loop — rotation with dt',
              mode: '3d',
              prose: [
                '`box.rotation.y += 1.0 * dt` rotates the box around its Y-axis (vertical). At 1.0 radian per second, one full turn (2π ≈ 6.28 rad) takes about 6.3 seconds. Multiply by dt to keep the speed constant regardless of frame rate.',
                '`box.rotation.x += 0.4 * dt` adds a tilt around the horizontal axis simultaneously. Two independent rotation rates produce the tumbling effect.',
                'Try changing the multipliers. `2.0` spins twice as fast. `0.5` half as fast. Negative values reverse the direction.',
              ],
              code: `// ── 3D Animation: rotating box with delta-time ──────────
let box

function init() {
  scene.add(new THREE.GridHelper(10, 10))

  box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color: 0x44aaff, emissive: 0x112233 })
  )
  box.position.set(0, 1, 0)
  scene.add(box)

  camera.position.set(5, 4, 8)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // dt = seconds since last frame (≈ 0.0167 at 60 fps)
  // Multiplying by dt makes rotation frame-rate independent
  box.rotation.y += 1.0 * dt   // 1 rad/s around vertical axis
  box.rotation.x += 0.4 * dt   // 0.4 rad/s around horizontal axis

  renderer.render(scene, camera)
}`,
            },

            {
              id: 3,
              cellTitle: '2D: Hello Canvas — immediate-mode drawing',
              mode: '2d',
              prose: [
                'Canvas 2D is immediate-mode: every frame you erase everything and redraw from scratch. `ctx.fillRect(0, 0, W, H)` fills the entire canvas with the current `fillStyle` — this is your "clear screen."',
                '`ctx.arc(cx, cy, radius, 0, Math.PI * 2)` traces a full circle (0 to 2π radians). The path is invisible until you call `ctx.fill()` or `ctx.stroke()`. `ctx.beginPath()` resets the path buffer before drawing each new shape.',
                '`ctx.font` sets the text font string (same as CSS). `ctx.fillText(str, x, y)` draws text at pixel position (x, y). The (x, y) is the **baseline-left** of the text.',
              ],
              code: `// ── 2D Canvas: immediate-mode drawing ───────────────────
// canvas, ctx, W, H are globals
// W and H are the canvas pixel dimensions

function init() {
  // Nothing to set up — 2D drawing happens in update()
}

function update(dt) {
  // 1. Clear the entire canvas each frame
  ctx.fillStyle = '#02060f'
  ctx.fillRect(0, 0, W, H)

  // 2. Draw a filled circle
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 60, 0, Math.PI * 2)  // center, radius, start, end
  ctx.fillStyle = '#44aaff'
  ctx.fill()

  // 3. Draw the outline separately
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 60, 0, Math.PI * 2)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3
  ctx.stroke()

  // 4. Draw text
  ctx.fillStyle  = '#ccddee'
  ctx.font       = 'bold 18px monospace'
  ctx.textAlign  = 'center'
  ctx.fillText('Hello Canvas', W / 2, H / 2 + 100)
}`,
            },

            {
              id: 4,
              cellTitle: '2D: Physics — a bouncing ball',
              mode: '2d',
              prose: [
                '`px += vx * dt` and `py += vy * dt` are Euler integration: advance position by velocity × time. This is the same formula used in every physics engine.',
                '`vy += 980 * dt` applies gravity — 980 pixels/s² (scaled to screen units). Without `* dt`, gravity would be frame-rate dependent. With it, the ball falls at the same rate on any device.',
                'The wall checks flip the velocity component when the ball hits an edge: `vx *= -0.85` means the ball bounces back with 85% of its speed (15% energy lost). Try changing 0.85 to 1.0 for perfectly elastic bounces or 0.5 for heavy damping.',
              ],
              code: `// ── 2D Physics: bouncing ball with Euler integration ────
// px, py = position   vx, vy = velocity   r = radius

let px, py, vx, vy
const r       = 25      // ball radius (pixels)
const GRAVITY = 980     // pixels / s²
const DAMPING = 0.85    // energy retained on each bounce (0-1)

function init() {
  // Start at top-centre with a diagonal velocity
  px = W / 2
  py = 60
  vx = 280    // pixels/s rightward
  vy = 0      // starts with no vertical speed
}

function update(dt) {
  // ── Physics step ──────────────────────────────────────
  vy += GRAVITY * dt   // gravity accelerates downward
  px += vx * dt
  py += vy * dt

  // ── Wall collisions ────────────────────────────────────
  if (px - r < 0)  { px = r;     vx = Math.abs(vx)  * DAMPING }
  if (px + r > W)  { px = W - r; vx = -Math.abs(vx) * DAMPING }
  if (py - r < 0)  { py = r;     vy = Math.abs(vy)  * DAMPING }
  if (py + r > H)  { py = H - r; vy = -Math.abs(vy) * DAMPING }

  // ── Draw ───────────────────────────────────────────────
  ctx.fillStyle = '#02060f'
  ctx.fillRect(0, 0, W, H)

  // Shadow (offset circle for depth illusion)
  ctx.beginPath()
  ctx.ellipse(px, H - 10, 18, 6, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fill()

  // Ball
  ctx.beginPath()
  ctx.arc(px, py, r, 0, Math.PI * 2)
  ctx.fillStyle = '#44aaff'
  ctx.fill()
  ctx.strokeStyle = '#88ccff'
  ctx.lineWidth = 2
  ctx.stroke()
}`,
            },
          ],
        },
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────────────────
  math: {
    prose: [
      'At 60 fps, the browser calls `requestAnimationFrame` every $\\frac{1}{60} \\approx 16.67$ ms. Your `update(dt)` has that entire 16.67 ms budget to complete physics, game logic, and drawing. If `update()` takes longer than 16.67 ms, the browser drops to 30 fps (doubling dt to ≈ 33 ms). This is why simulation code must be efficient — especially inside tight loops.',

      'The sandbox clamps dt: $\\text{dt} = \\min\\left(\\frac{t_n - t_{n-1}}{1000},\\; 0.05\\right)$. The 50 ms cap prevents *simulation explosions* — a common bug where a paused tab resumes and the physics integrator receives dt = 30 s, causing positions to jump by thousands of units in a single step.',

      'Three.js uses a **right-handed coordinate system** with **column vectors**. A position in world space is a column vector $\\mathbf{p} = [x, y, z, 1]^\\top$ (homogeneous coordinates). Transformations — translation, rotation, scale — are applied by multiplying by a $4 \\times 4$ matrix $\\mathbf{M}$:\n$$\\mathbf{p}^\\prime = \\mathbf{M}\\,\\mathbf{p}$$\nThe `mesh.position`, `mesh.rotation`, and `mesh.scale` properties are Three.js\'s interface for building $\\mathbf{M}$ without writing matrix multiplication by hand. When you call `renderer.render()`, Three.js computes the full matrix stack and sends it to the GPU.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Frame Budget at 60 fps',
        body: '$t_{\\text{frame}} = \\dfrac{1}{60} \\approx 16.67\\text{ ms}$\n\nYour entire `update(dt)` — physics, AI, drawing — must complete within this window or the frame rate drops.',
      },
      {
        type: 'theorem',
        title: 'Euler Integration',
        body: '$\\mathbf{v}(t + \\Delta t) = \\mathbf{v}(t) + \\mathbf{a}(t)\\,\\Delta t$\n$\\mathbf{p}(t + \\Delta t) = \\mathbf{p}(t) + \\mathbf{v}(t)\\,\\Delta t$\n\nEuler is first-order — it accumulates error over time. For stiff systems (springs, orbits) use RK4. For real-time simulations with small dt, Euler is usually accurate enough.',
      },
      {
        type: 'insight',
        title: 'Mesh.matrix — the 4×4 Transform Under the Hood',
        body: 'Every `THREE.Mesh` has a `.matrix` property — a $4 \\times 4$ homogeneous transformation matrix combining translation, rotation, and scale. You rarely touch it directly. Instead, Three.js computes it from `mesh.position`, `mesh.rotation`, and `mesh.scale` when you call `renderer.render()`. The Linear Algebra chapter on matrix transforms will make this exact machinery precise.',
      },
      {
        type: 'insight',
        title: 'Why Two Rendering APIs?',
        body: '**Three.js / WebGL** uses the GPU\'s shader pipeline — suited for 3D, lighting, shadows, particle systems, and thousands of polygons at 60 fps.\n\n**Canvas 2D** uses the CPU\'s 2D drawing API — simpler, immediate-mode, good for 2D physics, function plots, GCode backplots, and data visualisation.\n\nChoose 2D when your problem is genuinely two-dimensional. Choose 3D when you need perspective, lighting, or 3D geometry.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenges: Apply What You\'ve Learned',
        mathBridge: 'These challenges have no single right answer. Experiment freely — break things, observe the error, fix it. Debugging a simulation teaches you more than reading about one.',
        caption: 'Each challenge builds directly on the cells above. Start from the provided starter code and modify it.',
        initialProps: {
          initialCells: [
            {
              id: 'c1',
              challengeType: 'modify',
              challengeNumber: 1,
              challengeTitle: 'Sphere with orbit — combine rotation and position',
              difficulty: 'easy',
              mode: '3d',
              prose: [
                'Orbiting is different from rotating: rotation spins an object around its own center, while orbiting moves an object\'s *position* in a circle around another point. The trick is `Math.cos` and `Math.sin` — a pair of functions that trace a unit circle as their input angle increases. If you set `mesh.position.x = r * Math.cos(t)` and `mesh.position.z = r * Math.sin(t)` and increase `t` over time, the mesh travels in a perfect circle of radius `r`.',
              ],
              prompt: 'Replace the box with a sphere (THREE.SphereGeometry). Then make it orbit the origin in a circle: use Math.cos and Math.sin with a time variable to move its position instead of rotating it. The sphere should complete one full circle every 3 seconds.',
              hint: 'Accumulate a variable `t` in update(dt). Set mesh.position.x = r * Math.cos(t) and mesh.position.z = r * Math.sin(t) where r is the orbit radius. One full orbit = 2π radians — at angular speed ω = 2π/3 rad/s, t += ω * dt.',
              code: `// Starter: orbiting sphere
let sphere
let t = 0                // time accumulator (seconds)
const ORBIT_R  = 4       // orbit radius
const ORBIT_T  = 3       // seconds per full orbit

function init() {
  scene.add(new THREE.GridHelper(12, 12))

  sphere = new THREE.Mesh(
    // TODO: replace BoxGeometry with SphereGeometry
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0xff4488, emissive: 0x330011 })
  )
  scene.add(sphere)

  camera.position.set(8, 6, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt

  // TODO: move sphere in a circle using t
  // sphere.position.x = ...
  // sphere.position.z = ...

  renderer.render(scene, camera)
}`,
            },

            {
              id: 'c2',
              challengeType: 'modify',
              challengeNumber: 2,
              challengeTitle: '2D: Two balls with trail',
              difficulty: 'medium',
              prose: [
                'A **motion trail** works by not fully erasing the previous frame. Instead of `ctx.clearRect(...)`, fill the canvas with a semi-transparent rectangle — `ctx.fillStyle = "rgba(2,6,15,0.15)"`. Each frame, old paint fades by 15% while new paint is drawn at full opacity. After a few dozen frames the old positions are invisible, leaving a soft glowing tail behind the moving object.',
              ],
              mode: '2d',
              prompt: 'Start from the bouncing ball example. Add a second ball with different initial position, velocity, and color. Then add a simple trail: instead of clearing the canvas completely each frame, use `ctx.fillStyle = "rgba(2,6,15,0.15)"` — a semi-transparent fill — so old positions fade out slowly.',
              hint: 'Declare two sets of (px, py, vx, vy) variables. Update and draw both in update(). For the trail effect, replace `ctx.fillRect(...)` with `ctx.fillStyle = "rgba(2,6,15,0.15)"; ctx.fillRect(0,0,W,H)` — lower opacity = longer trail. Try values between 0.05 and 0.3.',
              code: `// Starter: two bouncing balls with trail
let p1x, p1y, v1x, v1y
// TODO: add p2x, p2y, v2x, v2y

const r = 20
const G = 980
const D = 0.85

function init() {
  p1x = W * 0.3; p1y = 80; v1x = 240; v1y = 100
  // TODO: initialise second ball at a different start
}

function update(dt) {
  // Trail: semi-transparent fill instead of opaque clear
  ctx.fillStyle = 'rgba(2,6,15,0.18)'
  ctx.fillRect(0, 0, W, H)

  // Ball 1 physics
  v1y += G * dt
  p1x += v1x * dt; p1y += v1y * dt
  if (p1x-r<0) { p1x=r; v1x=Math.abs(v1x)*D }
  if (p1x+r>W) { p1x=W-r; v1x=-Math.abs(v1x)*D }
  if (p1y-r<0) { p1y=r; v1y=Math.abs(v1y)*D }
  if (p1y+r>H) { p1y=H-r; v1y=-Math.abs(v1y)*D }

  // TODO: ball 2 physics (same pattern)

  // Draw ball 1
  ctx.beginPath(); ctx.arc(p1x,p1y,r,0,Math.PI*2)
  ctx.fillStyle='#44aaff'; ctx.fill()

  // TODO: draw ball 2 with a different color
}`,
            },

            {
              id: 'c3',
              challengeType: 'build',
              challengeNumber: 3,
              challengeTitle: '3D: Build a solar system — sun, planets, moons',
              difficulty: 'hard',
              prose: [
                '`THREE.Group` is an invisible container object. Adding a mesh to a group means the mesh\'s position is *relative to the group*. If you place a group at a planet\'s position and put a moon inside it at `(2, 0, 0)`, the moon orbits the group\'s center — which is the planet. Rotate the group over time and the moon orbits the planet automatically, even while the planet orbits the sun. This is how nested orbital motion works.',
              ],
              mode: '3d',
              prompt: 'Build a miniature solar system: a large glowing sun at the origin, two planets orbiting at different radii and speeds, and one moon orbiting a planet. Use THREE.Group to make the moon orbit relative to its planet. Add a PointLight at the origin to make the sun glow.',
              hint: 'THREE.Group is like an empty object you can add children to. Add a planet mesh to a group, add a moon mesh at an offset inside the group. Then rotate the group in update() — the moon orbits with the planet automatically. sun = PointLight + SphereGeometry with emissive color.',
              code: `// Starter: solar system skeleton
let sunLight, planet1Group, planet2Group
let t = 0

function init() {
  // Sun
  const sunGeo = new THREE.SphereGeometry(1.5, 20, 20)
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 })
  scene.add(new THREE.Mesh(sunGeo, sunMat))

  // TODO: add a PointLight at the origin

  // TODO: create planet1Group, add a sphere at orbit radius
  //       add a moon sphere INSIDE planet1Group at a closer offset

  // TODO: create planet2Group with different radius and color

  camera.position.set(0, 14, 20)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt

  // TODO: rotate each planet group around Y axis at its own speed
  // planetGroup.rotation.y = angularSpeed * t

  renderer.render(scene, camera)
}`,
            },
          ],
        },
      },
    ],
  },
}
