export default {
  id: 'sim1-003',
  slug: 'functions-and-math',
  chapter: 'sim1',
  order: 3,
  title: 'Functions & Math',
  subtitle: 'Almost every visual movement in a simulation — orbits, waves, bounces, spirals — is built from a handful of Math methods. Writing your own helper functions keeps code readable and prevents copy-paste errors.',
  tags: ['functions', 'math', 'Math.sin', 'Math.cos', 'Math.random', 'circular motion', 'javascript', 'beginners'],
  aliases: 'functions helpers math sin cos random lerp clamp circular motion radians',
  timeToComplete: 22,
  coreConcept: 'Math.cos and Math.sin convert a time value t into smooth oscillating motion. Combine them to get circular paths, waves, and pulsing effects. Extract repeated formulas into named helper functions so each calculation has one authoritative place in your code.',
  prerequisites: ['sim1-002'],
  nextLesson: 'loops-and-arrays',

  hook: {
    question: "How does a game engine move a spaceship in a smooth circle, make a flag ripple in the wind, and place 50 stars at random positions — all with the same three Math methods?",
    realWorldContext: "Trigonometry was invented to measure triangles. But in simulation code it has a second life: it is the engine of smooth, periodic motion. Every orbit, every oscillating spring, every rippling sine wave is ultimately a call to Math.sin or Math.cos.\n\nMath.random() is equally universal — procedural generation, particle systems, noise textures, and randomised AI all rely on it. Together, these methods handle the vast majority of positional and visual calculations in simulations. This lesson shows you how to use them and how to package repeated formulas into helper functions that make your code read like prose.",
  },

  intuition: {
    prose: [
      "**The unit circle and `Math.cos` / `Math.sin`.** Give both functions the same angle `t` (in radians) and they return the x and y coordinates of a point moving around a circle of radius 1. As `t` increases from 0 to 2π, `Math.cos(t)` goes from 1 → 0 → −1 → 0 → 1 (the horizontal component) and `Math.sin(t)` goes from 0 → 1 → 0 → −1 → 0 (the vertical). Multiply by a radius and you have circular motion: `x = r * Math.cos(t)`, `z = r * Math.sin(t)`.",

      "**Radians, not degrees.** Three.js and all JavaScript math functions use **radians**. One full circle is **2π ≈ 6.28** radians. Half a circle is π ≈ 3.14. To convert degrees to radians: `deg * Math.PI / 180`. You will mostly work in radians directly — `Math.PI / 2` is a right angle, `Math.PI` is a half turn. The constant `Math.PI` (≈ 3.14159…) is built in — no need to declare it.",

      "**Helper functions keep code honest.** If you write `W / 2 + (Math.random() * 200 - 100)` in three different places and need to change the range, you change it in three places — and probably miss one. Extract it: `function randRange(min, max) { return min + Math.random() * (max - min) }`. Now there is one authoritative definition. The same applies to any formula you use more than once.",

      "**Pure functions vs side-effect functions.** A **pure function** takes inputs and returns a value without changing anything outside itself. `lerp(a, b, t)` is pure — same inputs always give the same output. A **side-effect function** modifies state — `update(dt)` is a side effect function (it moves objects). For math helpers, always write pure functions. They are easy to test, easy to read, and impossible to have subtle bugs from.",

      "**`Math.random()` returns a number between 0 (inclusive) and 1 (exclusive).** Scale it to any range with `min + Math.random() * (max - min)`. Use `Math.floor(Math.random() * N)` to get a random integer from 0 to N−1. Random values in `init()` are fixed for the session — each time you press **Run** you get a new roll. Random values in `update()` change every frame (useful for noise, distracting for position).",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Circular Motion Recipe',
        body: '```js\nlet t = 0\n\nfunction update(dt) {\n  t += angularSpeed * dt   // angular speed in rad/s\n\n  object.position.x = radius * Math.cos(t)\n  object.position.z = radius * Math.sin(t)\n  // Y stays fixed — this is a horizontal orbit\n}\n```\n\nAngular speed = 2π / period. A 3-second orbit: `angularSpeed = 2 * Math.PI / 3 ≈ 2.09 rad/s`.',
      },
      {
        type: 'definition',
        title: 'Radian',
        body: 'A **radian** is the angle subtended by an arc equal in length to the radius. One full circle = **2π ≈ 6.28** radians. Key values:\n\n| Degrees | Radians |\n|---|---|\n| 90° | π/2 ≈ 1.57 |\n| 180° | π ≈ 3.14 |\n| 270° | 3π/2 ≈ 4.71 |\n| 360° | 2π ≈ 6.28 |',
      },
      {
        type: 'insight',
        title: 'Essential Math Methods',
        body: '| Method | What it does |\n|---|---|\n| `Math.sin(t)` | −1 to 1, starts at 0 |\n| `Math.cos(t)` | −1 to 1, starts at 1 |\n| `Math.PI` | π ≈ 3.14159 |\n| `Math.abs(x)` | removes negative sign |\n| `Math.min(a, b)` | smaller of two values |\n| `Math.max(a, b)` | larger of two values |\n| `Math.sqrt(x)` | square root |\n| `Math.floor(x)` | round down |\n| `Math.random()` | 0 to 1 |',
      },
      {
        type: 'definition',
        title: 'lerp — Linear Interpolation',
        body: '`lerp(a, b, t)` returns the value that is fraction `t` of the way from `a` to `b`:\n\n```js\nfunction lerp(a, b, t) {\n  return a + (b - a) * t\n}\n\nlerp(0, 100, 0)    // 0\nlerp(0, 100, 0.5)  // 50\nlerp(0, 100, 1)    // 100\n```\n\nUse it to smoothly animate values over time: `value = lerp(value, target, 0.1 * dt * 60)` moves `value` 10% closer to `target` each frame.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Functions & Math in Action',
        mathBridge: 'Cell 1 visualises cos and sin on the unit circle. Cells 2–4 use math functions in 3D simulations.',
        caption: 'Cell 1 uses Canvas 2D. Cells 2–4 use Three.js (3D).',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '2D: cos and sin on the unit circle',
              mode: '2d',
              prose: [
                'A dot traces the unit circle as `t` increases. The blue dashed line is the horizontal projection — `cos(t)`. The green dashed line is the vertical projection — `sin(t)`. Watch how cos is maximum (1) when the dot is at the rightmost point, and sin is maximum at the top.',
                'The canvas coordinate system has Y pointing **down**, so we negate sin to make the circle go counter-clockwise visually: `y = CY - R * Math.sin(t)`. In Three.js this flip is not needed.',
              ],
              code: `let t = 0
const CX = 150, CY = 160, R = 110  // circle centre and radius

function init() {}

function update(dt) {
  t += dt * 0.7
  const dotX = CX + R * Math.cos(t)
  const dotY = CY - R * Math.sin(t)  // Y-flipped for canvas

  ctx.fillStyle = '#02060f'
  ctx.fillRect(0, 0, W, H)

  // Unit circle outline
  ctx.beginPath()
  ctx.arc(CX, CY, R, 0, Math.PI * 2)
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.stroke()

  // Axes
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(CX - R - 20, CY); ctx.lineTo(CX + R + 20, CY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(CX, CY - R - 20); ctx.lineTo(CX, CY + R + 20); ctx.stroke()

  // cos projection (horizontal, blue)
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(dotX, dotY); ctx.lineTo(dotX, CY); ctx.stroke()

  // sin projection (vertical, green)
  ctx.strokeStyle = '#4ade80'
  ctx.beginPath(); ctx.moveTo(dotX, dotY); ctx.lineTo(CX, dotY); ctx.stroke()
  ctx.setLineDash([])

  // Radius line
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(dotX, dotY); ctx.stroke()

  // Moving dot
  ctx.beginPath(); ctx.arc(dotX, dotY, 7, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'; ctx.fill()

  // Labels
  ctx.font = '12px monospace'
  ctx.fillStyle = '#38bdf8'
  ctx.fillText('cos = ' + Math.cos(t).toFixed(2), CX + R + 14, CY + 4)
  ctx.fillStyle = '#4ade80'
  ctx.fillText('sin = ' + Math.sin(t).toFixed(2), 10, CY - R - 8)
  ctx.fillStyle = '#64748b'
  ctx.fillText('t = ' + t.toFixed(2) + ' rad', 10, H - 10)
}`,
            },
            {
              id: 2,
              cellTitle: '3D: circular orbit with cos and sin',
              mode: '3d',
              prose: [
                '`sphere.position.x = RADIUS * Math.cos(t)` and `sphere.position.z = RADIUS * Math.sin(t)` move the sphere around a circle of `RADIUS` units. The Y position stays fixed — this is a horizontal orbit.',
                'The angular speed `2 * Math.PI / PERIOD` converts a period in seconds into radians per second. Change `PERIOD` from 3 to 1 and the sphere orbits three times faster. Change the radius and the orbit expands.',
              ],
              code: `let sphere
let t = 0

const RADIUS = 5
const PERIOD = 3   // seconds per full orbit

function init() {
  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 20, 20),
    new THREE.MeshPhongMaterial({ color: 0x44aaff, emissive: 0x081830 })
  )
  scene.add(sphere)
  scene.add(new THREE.GridHelper(14, 14))
  // marker at origin
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  ))
  camera.position.set(0, 10, 16)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += (2 * Math.PI / PERIOD) * dt  // advance angle

  sphere.position.x = RADIUS * Math.cos(t)
  sphere.position.z = RADIUS * Math.sin(t)

  renderer.render(scene, camera)
}`,
            },
            {
              id: 3,
              cellTitle: '3D: helper functions — lerp, clamp, randRange',
              mode: '3d',
              prose: [
                '`randRange`, `lerp`, and `clamp` are three helpers you will use in almost every simulation. Defining them once at the top means you never copy-paste the same formula twice.',
                '`lerp(a, b, 0.05 * dt * 60)` smoothly chases a target value — the sphere drifts toward its `targetY` at about 5% per frame. Try changing 0.05 to 0.5 to see a snappier response.',
              ],
              code: `// Helper functions — pure, reusable, easy to read
function randRange(min, max) { return min + Math.random() * (max - min) }
function lerp(a, b, t)       { return a + (b - a) * t }
function clamp(v, lo, hi)    { return Math.max(lo, Math.min(hi, v)) }

let sphere
let currentY = 0
let targetY  = 0
let timer    = 0

function init() {
  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 24),
    new THREE.MeshPhongMaterial({ color: 0xff6644, emissive: 0x220800 })
  )
  scene.add(sphere)
  scene.add(new THREE.GridHelper(10, 10))
  camera.position.set(0, 5, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  timer += dt
  if (timer > 2) {                        // every 2 seconds
    targetY = randRange(-3, 3)            // new random target height
    timer = 0
  }

  currentY = lerp(currentY, targetY, 0.05 * dt * 60)  // smoothly chase target
  sphere.position.y = clamp(currentY, -3, 3)           // never leave bounds

  renderer.render(scene, camera)
}`,
            },
            {
              id: 4,
              cellTitle: '3D: random placement and color',
              mode: '3d',
              prose: [
                'Three.js colors can be set with hex numbers (`0xff4400`) or with `new THREE.Color().setHSL(h, s, l)`. HSL is often easier: `h` (0–1) cycles through the full rainbow, `s = 1` is fully saturated, `l = 0.5` is mid brightness.',
                'The three spheres are placed at random X positions in `init()`. Each time you press **Run**, a new set of random positions is rolled. Random values in `init()` are fixed for that run — they do not change every frame.',
              ],
              code: `function randRange(min, max) { return min + Math.random() * (max - min) }

const spheres = []
let t = 0

function init() {
  for (var i = 0; i < 5; i++) {
    var hue = i / 5                           // evenly spaced hues
    var color = new THREE.Color().setHSL(hue, 1, 0.5)
    var mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 20, 20),
      new THREE.MeshPhongMaterial({ color: color })
    )
    mesh.position.set(randRange(-6, 6), 0, randRange(-3, 3))
    scene.add(mesh)
    spheres.push(mesh)
  }
  scene.add(new THREE.GridHelper(16, 16))
  camera.position.set(0, 8, 14)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt
  // Each sphere bobs at a slightly different phase
  for (var i = 0; i < spheres.length; i++) {
    spheres[i].position.y = Math.sin(t * 1.5 + i * 1.2) * 1.5
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
      'The functions `sin` and `cos` are periodic with period $2\\pi$: $\\sin(t + 2\\pi) = \\sin(t)$ for all $t$. Their range is $[-1, 1]$. Together they parameterise the unit circle: the point $(\\cos t,\\, \\sin t)$ travels the unit circle at unit angular speed. To produce an orbit of radius $r$ with angular speed $\\omega$ (radians/second): $x(t) = r\\cos(\\omega t)$, $z(t) = r\\sin(\\omega t)$. Period $T = 2\\pi / \\omega$ seconds.',

      'Linear interpolation, `lerp(a, b, t) = a + (b − a)t`, is the weighted average of `a` and `b` with weight `t ∈ [0, 1]`. When applied each frame with a small weight — `value = lerp(value, target, α)` — it produces **exponential smoothing**: the remaining gap $\\delta_n = (1 - \\alpha)^n \\delta_0$ decays geometrically. This is why lerp-chasing looks smooth rather than linear.',

      '`Math.random()` uses a **pseudo-random number generator (PRNG)** — a deterministic algorithm that produces sequences statistically indistinguishable from true randomness. It is seeded by the browser environment at startup. Two runs of the same code produce different sequences. For repeatable randomness (useful for procedural levels and reproducible simulations), use a **seeded PRNG** library that accepts an explicit seed value.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Circular Motion Equations',
        body: 'Given radius $r$ and angular speed $\\omega$ (rad/s):\n$$x(t) = r\\cos(\\omega t) \\qquad z(t) = r\\sin(\\omega t)$$\n$$\\omega = \\frac{2\\pi}{T} \\quad \\text{where } T \\text{ is period in seconds}$$\n\nVelocity components: $\\dot{x} = -r\\omega\\sin(\\omega t)$, $\\dot{z} = r\\omega\\cos(\\omega t)$.',
      },
      {
        type: 'insight',
        title: 'sin vs cos — Phase Offset',
        body: '$\\cos(t) = \\sin(t + \\pi/2)$. They are the same wave, $90°$ apart. This means you can control where on the circle an orbit *starts* by adding a phase offset:\n\n```js\nposition.x = r * Math.cos(t + offset)\nposition.z = r * Math.sin(t + offset)\n```\n\nSet `offset = i * 2 * Math.PI / N` to evenly space N objects around a circle.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenges: Math in Motion',
        mathBridge: 'Each challenge uses Math.sin, Math.cos, or Math.random to produce a new visual effect. Write your own helper function in at least one challenge.',
        caption: 'Challenges 1–2 use Three.js. Challenge 3 uses Canvas 2D.',
        initialProps: {
          initialCells: [
            {
              id: 'c1',
              challengeType: 'modify',
              challengeNumber: 1,
              challengeTitle: '3D: Pulsing sphere using Math.sin',
              difficulty: 'easy',
              mode: '3d',
              prompt: 'Make a sphere that pulses in size. In update(), set the sphere\'s scale to a value that oscillates between 0.5 and 1.5. Use Math.sin to compute the oscillation — the scale should never go below 0.5 or above 1.5. Write a helper function `pulse(t, speed)` that returns the scale value.',
              hint: 'Math.sin(t) returns −1 to 1. To shift it to 0.5–1.5: `1 + 0.5 * Math.sin(t * speed)`. Set all three scale axes: `sphere.scale.set(s, s, s)` where s is your computed scale value.',
              code: `// Write a pulse helper function and apply it to a sphere
function pulse(t, speed) {
  // TODO: return a value between 0.5 and 1.5 using Math.sin
  return 1
}

let sphere, t = 0

function init() {
  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 24, 24),
    new THREE.MeshPhongMaterial({ color: 0x44aaff, emissive: 0x081830 })
  )
  scene.add(sphere)
  camera.position.set(0, 4, 8)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt
  const s = pulse(t, 2)         // TODO: use your pulse function
  sphere.scale.set(s, s, s)     // apply the scale
  renderer.render(scene, camera)
}`,
            },
            {
              id: 'c2',
              challengeType: 'modify',
              challengeNumber: 2,
              challengeTitle: '3D: Five spheres at evenly spaced angles',
              difficulty: 'medium',
              mode: '3d',
              prompt: 'Place 5 spheres evenly around a circle of radius 4. Each sphere should have a unique color using setHSL. You need one loop and the phase offset formula: `angle = i * 2 * Math.PI / 5`. Each sphere should also bob up and down at its own phase so they create a wave effect.',
              hint: 'For position: `x = 4 * Math.cos(angle)`, `z = 4 * Math.sin(angle)`. For bobbing in update: `sphere.position.y = Math.sin(t * 2 + angle) * 1.5`. Store the meshes in an array and store each sphere\'s angle so update() can use it.',
              code: `const meshes  = []
const angles  = []
let t = 0

function init() {
  const N = 5
  for (var i = 0; i < N; i++) {
    var angle = i * 2 * Math.PI / N
    angles.push(angle)

    var color = new THREE.Color().setHSL(i / N, 1, 0.5)
    var mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 20, 20),
      new THREE.MeshPhongMaterial({ color: color })
    )
    // TODO: set mesh.position.x and mesh.position.z using angle and radius 4
    scene.add(mesh)
    meshes.push(mesh)
  }
  scene.add(new THREE.GridHelper(12, 12))
  camera.position.set(0, 8, 12)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt
  for (var i = 0; i < meshes.length; i++) {
    // TODO: set meshes[i].position.y = Math.sin(t * 2 + angles[i]) * 1.5
  }
  renderer.render(scene, camera)
}`,
            },
            {
              id: 'c3',
              challengeType: 'build',
              challengeNumber: 3,
              challengeTitle: '2D: Lissajous figure tracer',
              difficulty: 'hard',
              mode: '2d',
              prompt: 'A Lissajous figure is the path traced by `x = A * Math.cos(a * t)` and `y = B * Math.sin(b * t)`. Different ratios of a:b create different shapes. Build a tracer that draws the path over time using a semi-transparent clear so old positions fade out. Try a:b = 1:2, then 2:3, then 3:4.',
              hint: 'Use `ctx.fillStyle = "rgba(2,6,15,0.04)"` instead of a solid fill to create the fading trail. Center the figure at (W/2, H/2). Scale A and B to be about W/2.5 and H/2.5. The figure traces more slowly with t += 0.4 * dt.',
              code: `let t = 0

// Lissajous parameters — change these to see different shapes
const A = 130, B = 120  // amplitudes
const a = 2, b = 3      // frequency ratio — try 1:2, 3:4, 5:6

function init() {}

function update(dt) {
  t += 0.5 * dt

  // Fading trail — low alpha clear keeps old positions visible
  ctx.fillStyle = 'rgba(2,6,15,0.04)'
  ctx.fillRect(0, 0, W, H)

  // TODO: compute x = W/2 + A * Math.cos(a * t)
  // TODO: compute y = H/2 + B * Math.sin(b * t)

  // Draw the current point
  // ctx.beginPath()
  // ctx.arc(x, y, 3, 0, Math.PI * 2)
  // ctx.fillStyle = '#44aaff'
  // ctx.fill()
}`,
            },
          ],
        },
      },
    ],
  },
}
