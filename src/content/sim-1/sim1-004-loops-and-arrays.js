export default {
  id: 'sim1-004',
  slug: 'loops-and-arrays',
  chapter: 'sim1',
  order: 4,
  title: 'Loops & Arrays',
  subtitle: 'A particle system with 500 objects and a particle system with 5 objects are the same five lines of code — just a different number. Loops and arrays are what separate a simulation from a copy-paste project.',
  tags: ['loops', 'arrays', 'for', 'forEach', 'particles', 'javascript', 'beginners'],
  aliases: 'loops arrays for forEach particles objects beginners javascript',
  timeToComplete: 25,
  coreConcept: 'A for loop repeats a block of code N times. An array stores N values in one variable. Together they let you create, store, and update any number of objects with the same few lines of code. The core pattern: create N objects in init(), store them in an array, loop over the array in update().',
  prerequisites: ['sim1-003'],
  nextLesson: 'geometry-materials-lighting',

  hook: {
    question: "If you needed 200 falling snowflakes, would you write 200 variables — `snowX1, snowY1, snowX2, snowY2...` — or is there a better way?",
    realWorldContext: "The original Pong had two paddles and one ball — three objects. Modern games have thousands of particles, bullets, enemies, and environmental details all updating simultaneously. The code for 3 objects and 3000 objects is structurally identical: create all of them in one loop, update all of them in another. The number is just a constant.\n\nThis pattern — create a collection in `init()`, iterate it in `update()` — is the backbone of every particle system, crowd simulation, gravitational N-body problem, and procedurally generated world. This lesson teaches you the tools.",
  },

  intuition: {
    prose: [
      "**A `for` loop repeats a block of code.** `for (let i = 0; i < N; i++)` has three parts: *initialise* (`let i = 0`), *condition* (`i < N`), *increment* (`i++`). The block inside `{}` runs while the condition is true. When the condition becomes false, the loop stops. `i` counts 0, 1, 2, … N−1. A 10-iteration loop runs with i values 0 through 9 — **not 1 through 10**.",

      "**An array is a numbered list.** `const items = []` creates an empty array. `items.push(x)` adds `x` to the end. `items[0]` reads the first element, `items[1]` the second — arrays are **zero-indexed**. `items.length` gives the count. You will almost always create an empty array before a loop, push objects inside the loop, and then iterate the array in `update()`.",

      "**`forEach` — a cleaner way to loop an array.** `particles.forEach(p => ...)` runs the arrow function once for each element, passing the element as `p`. It reads like a sentence: *for each particle, do this*. Use `forEach` in `update()` when you want to apply the same operation to every element. Use a traditional `for` loop when you need the index `i` for math (like spacing objects evenly around a circle).",

      "**The particle pattern — array of state objects.** For anything with per-object physics, store an object (not just a mesh) in the array: `{ mesh, vx, vy, color }`. The mesh is the visual. `vx`/`vy` are velocity. Each particle is self-contained — `update()` just iterates the array and applies physics to each one independently.",

      "**When you find yourself writing `obj1`, `obj2`, `obj3` — you need an array.** Named numeric variables are a sign that a loop exists but hasn't been written yet. Any time you are about to copy-paste a block and change a number, stop and write a loop instead. The loop version has one place to change when requirements evolve.",
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Don\'t Create Objects in update()',
        body: 'Creating a new `THREE.Mesh` (or any object with `new`) is expensive — it allocates memory, uploads data to the GPU, and may trigger garbage collection. Do all creation in `init()`. In `update()`, only read and modify existing objects.\n\nException: true particle systems that spawn new particles over time use an **object pool** — a pre-created reservoir of deactivated objects that get reactivated rather than re-created.',
      },
      {
        type: 'procedure',
        title: 'The Particle Loop Pattern',
        body: '```js\n// Module scope\nconst particles = []\n\n// init(): create N particles\nfor (let i = 0; i < N; i++) {\n  const mesh = new THREE.Mesh(geo, mat.clone())\n  scene.add(mesh)\n  particles.push({ mesh, vx: 0, vy: 0 })\n}\n\n// update(): advance all particles\nparticles.forEach(p => {\n  p.vy += GRAVITY * dt\n  p.mesh.position.y += p.vy * dt\n})\n```',
      },
      {
        type: 'insight',
        title: 'Arrays Are Zero-Indexed',
        body: 'The first element is `arr[0]`, not `arr[1]`. A 5-element array has indices 0, 1, 2, 3, 4 — the last valid index is `arr.length - 1`.\n\nCommon mistake: `for (let i = 1; i <= arr.length; i++)` — this starts at index 1 (skipping element 0) and ends at `arr.length` (which is out of bounds). Correct: `for (let i = 0; i < arr.length; i++)`.',
      },
      {
        type: 'insight',
        title: 'Spacing Objects with Index Math',
        body: 'To place N objects evenly around a circle, use `i / N` as the fraction of a full turn:\n\n```js\nfor (let i = 0; i < N; i++) {\n  const angle = (i / N) * 2 * Math.PI\n  mesh.position.x = radius * Math.cos(angle)\n  mesh.position.z = radius * Math.sin(angle)\n}\n```\n\nTo space them along a line: `position.x = i * spacing - (N-1) * spacing / 2` (centres the group at the origin).',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Loops & Arrays in Action',
        mathBridge: 'Focus on where the array is declared (module scope), where objects are pushed (init), and where they are updated (forEach in update).',
        caption: 'All four cells use Three.js (3D). The pattern is identical in each — only the physics and geometry differ.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: For loop — 8 spheres in a circle',
              mode: '3d',
              prose: [
                '`for (let i = 0; i < 8; i++)` runs 8 times with i = 0, 1, 2 … 7. Each iteration places one sphere at the angle that is `i/8` of a full circle. No copy-paste — just the loop counter and a formula.',
                'The index `i` does double duty: it controls position *and* hue. `i / 8` gives evenly spaced fractions 0, 0.125, 0.25 … 0.875 — perfect for distributing around a circle or spreading across a color spectrum.',
              ],
              code: `const spheres = []

function init() {
  const N = 8
  const RADIUS = 5

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * 2 * Math.PI
    const color = new THREE.Color().setHSL(i / N, 1, 0.5)

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshPhongMaterial({ color: color })
    )
    mesh.position.x = RADIUS * Math.cos(angle)
    mesh.position.z = RADIUS * Math.sin(angle)
    scene.add(mesh)
    spheres.push(mesh)
  }

  scene.add(new THREE.GridHelper(14, 14))
  camera.position.set(0, 10, 14)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  renderer.render(scene, camera)
}`,
            },
            {
              id: 2,
              cellTitle: '3D: Array + forEach — rotate all objects',
              mode: '3d',
              prose: [
                '`spheres.forEach(s => s.rotation.y += dt)` reads: "for each sphere s, rotate it by dt." The arrow function `s => ...` is shorthand for `function(s) { ... }`. `s` is the current element — a different sphere on each iteration.',
                'Try changing `rotation.y` to `rotation.x` or adding a bobbing motion: `s.position.y = Math.sin(t + i * 0.7)`. To use the index inside forEach, add a second parameter: `spheres.forEach((s, i) => ...)`.',
              ],
              code: `const spheres = []
let t = 0

function init() {
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 2 * Math.PI
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.7, 0.7),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / 12, 0.9, 0.55)
      })
    )
    mesh.position.x = 5 * Math.cos(angle)
    mesh.position.z = 5 * Math.sin(angle)
    scene.add(mesh)
    spheres.push(mesh)
  }
  scene.add(new THREE.GridHelper(14, 14))
  camera.position.set(0, 10, 14)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt
  // forEach applies the same operation to every element
  spheres.forEach((s, i) => {
    s.rotation.y += dt * 1.5
    s.position.y = Math.sin(t * 1.5 + i * 0.52) * 1.5
  })
  renderer.render(scene, camera)
}`,
            },
            {
              id: 3,
              cellTitle: '3D: Array of state objects — particles with gravity',
              mode: '3d',
              prose: [
                'Each particle is stored as an object `{ mesh, vy }`. The mesh is visual; `vy` is physics state. `init()` creates both together and stores them as a unit. `update()` reads and writes `vy` without needing to look anything up.',
                'This is the core pattern for any simulation with per-object state. Add more properties as needed: `{ mesh, vx, vy, vz, age, color }`. Each particle carries its own complete state.',
              ],
              code: `const particles = []

function init() {
  const mat = new THREE.MeshPhongMaterial({ color: 0x44aaff })

  for (let i = 0; i < 10; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 12),
      mat
    )
    // Spread along X, start at different heights
    mesh.position.set(i * 1.4 - 6.3, i * 0.5 + 1, 0)
    scene.add(mesh)

    particles.push({
      mesh: mesh,
      vy: 0   // vertical velocity — starts at rest
    })
  }

  scene.add(new THREE.GridHelper(16, 16))
  camera.position.set(0, 4, 16)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  particles.forEach(p => {
    p.vy -= 9.8 * dt                  // gravity
    p.mesh.position.y += p.vy * dt

    if (p.mesh.position.y < 0.3) {    // floor bounce
      p.mesh.position.y = 0.3
      p.vy = Math.abs(p.vy) * 0.6
    }
  })
  renderer.render(scene, camera)
}`,
            },
            {
              id: 4,
              cellTitle: '3D: Nested loops — 4×4 grid of cubes',
              mode: '3d',
              prose: [
                'Two nested loops give you every combination of `row` and `col`: 4 rows × 4 cols = 16 objects from 6 lines of code. Change 4 to 8 and you get 64 — the loop does all the work.',
                '`col * spacing - (COLS-1) * spacing / 2` centres each row at the origin. Without the centering term, the grid would start at the origin and extend in one direction only.',
              ],
              code: `const cubes = []

function init() {
  const ROWS = 4, COLS = 4
  const SPACING = 2.2

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.4, 1.4),
        new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL((row * COLS + col) / (ROWS * COLS), 0.8, 0.5)
        })
      )
      // Centre the grid at the origin
      mesh.position.set(
        col * SPACING - (COLS - 1) * SPACING / 2,
        0,
        row * SPACING - (ROWS - 1) * SPACING / 2
      )
      scene.add(mesh)
      cubes.push({ mesh, row, col })
    }
  }

  scene.add(new THREE.GridHelper(14, 14))
  camera.position.set(0, 10, 14)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

let t = 0
function update(dt) {
  t += dt
  cubes.forEach(c => {
    // Wave: height based on row + col index + time
    c.mesh.position.y = Math.sin(t * 2 + (c.row + c.col) * 0.8) * 1.2
    c.mesh.rotation.y += dt * 0.8
  })
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
      'An array of $N$ elements occupies $N$ contiguous memory slots, indexed $0$ through $N-1$. Accessing element $i$ is $O(1)$ — the CPU computes the address as `base + i * elementSize` directly. Appending with `push` is amortised $O(1)$: the array doubles its internal capacity when full. For real-time simulations, avoid `push` and `pop` inside `update()` — preallocate a fixed-size array in `init()` and use an active-count variable to logically resize it without allocating.',

      'The for-loop pattern `for (let i = 0; i < N; i++)` iterates exactly $N$ times, so the total work of creating $N$ objects is $O(N)$. Updating $N$ objects in `update()` is also $O(N)$ per frame. At 60 fps, updating 1000 objects means $60{,}000$ updates per second. JavaScript is fast enough for this at small $N$, but for $N > 10{,}000$ the frame budget (16.67 ms) becomes a constraint — the reason particle systems cap at a fixed maximum.',

      'The **object pool pattern** avoids per-frame allocation by pre-creating the maximum number of particles in `init()` and tracking an `active` count. "Spawning" a particle means incrementing `active` and resetting a slot\'s state. "Killing" a particle means swapping it with the last active slot and decrementing `active`. This gives $O(1)$ spawn and kill with zero garbage collection pauses.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'forEach vs for — When to Use Which',
        body: '**Use `forEach`** when you want the same operation on every element and don\'t need the index for math:\n```js\nparticles.forEach(p => { p.vy += G * dt })\n```\n\n**Use `for`** when index math drives position/phase:\n```js\nfor (let i = 0; i < N; i++) {\n  mesh.position.x = i * spacing\n  mesh.position.y = Math.sin(t + i * phase)\n}\n```\n\nForEach with the index: `arr.forEach((item, i) => ...)` — available but slightly less clear than a plain for loop.',
      },
      {
        type: 'strategy',
        title: 'When to Stop Using Individual Variables',
        body: 'The moment you write `x1, x2, x3` you are manually implementing an array. Stop and refactor:\n\n```js\n// Before — brittle, hard to change N\nlet x1 = 0, x2 = 0, x3 = 0\n\n// After — works for any N\nconst xs = Array.from({ length: N }, () => 0)\n```\n\nThe refactored version handles 3 or 300 with the same code.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenges: Loops in Real Simulations',
        mathBridge: 'Each challenge asks you to extend or build a loop-based system. Focus on getting the array pattern right first, then add physics.',
        caption: 'All challenges use Three.js (3D). Challenge 3 is the most demanding — break it into steps.',
        initialProps: {
          initialCells: [
            {
              id: 'c1',
              challengeType: 'modify',
              challengeNumber: 1,
              challengeTitle: 'Circle of spheres → helix spiral',
              difficulty: 'easy',
              mode: '3d',
              prompt: 'The starter code places 16 spheres in a flat circle. Change it to a helix: keep the circular X and Z positions, but set each sphere\'s Y position to `i * 0.4 - (N-1) * 0.2` so they stack upward. The camera will need adjusting.',
              hint: 'In init(), after setting position.x and position.z, set `mesh.position.y = i * 0.4 - (N-1) * 0.2`. The subtraction centres the helix vertically. Move the camera up: `camera.position.set(8, 6, 12)`.',
              code: `const spheres = []

function init() {
  const N = 16
  const RADIUS = 4

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * 2 * Math.PI
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 14, 14),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / N, 1, 0.5)
      })
    )
    mesh.position.x = RADIUS * Math.cos(angle)
    mesh.position.z = RADIUS * Math.sin(angle)
    // TODO: set mesh.position.y to create a helix

    scene.add(mesh)
    spheres.push(mesh)
  }

  scene.add(new THREE.GridHelper(12, 12))
  camera.position.set(0, 8, 12)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

let t = 0
function update(dt) {
  t += dt
  spheres.forEach((s, i) => {
    s.rotation.y += dt
  })
  renderer.render(scene, camera)
}`,
            },
            {
              id: 'c2',
              challengeType: 'modify',
              challengeNumber: 2,
              challengeTitle: '3D: Animated wave across a grid',
              difficulty: 'medium',
              mode: '3d',
              prompt: 'Build a 6×6 grid of boxes. In update(), animate each box\'s Y height with `Math.sin(t * 2 + (row + col) * 0.6) * 2` — a wave that sweeps diagonally across the grid. Store `{ mesh, row, col }` objects so update() has access to row and col.',
              hint: 'Use nested loops: `for (let row = 0; row < 6; row++) { for (let col = 0; col < 6; col++) {...} }`. Push `{ mesh, row, col }` to the array. In update(), `cubes.forEach(c => { c.mesh.position.y = Math.sin(t * 2 + (c.row + c.col) * 0.6) * 2 })`.',
              code: `const cubes = []
let t = 0

function init() {
  const ROWS = 6, COLS = 6, SP = 2

  // TODO: nested loops to create a 6×6 grid
  // Push { mesh, row, col } objects to cubes array
  // Centre the grid: x = col * SP - (COLS-1)*SP/2, z = row * SP - (ROWS-1)*SP/2

  scene.add(new THREE.GridHelper(16, 16))
  camera.position.set(0, 12, 16)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt
  cubes.forEach(c => {
    // TODO: c.mesh.position.y = Math.sin(t * 2 + (c.row + c.col) * 0.6) * 2
    c.mesh.rotation.y += dt * 0.5
  })
  renderer.render(scene, camera)
}`,
            },
            {
              id: 'c3',
              challengeType: 'build',
              challengeNumber: 3,
              challengeTitle: '3D: Falling rain — particles that reset',
              difficulty: 'hard',
              mode: '3d',
              prompt: 'Create 40 thin capsules (use CylinderGeometry with small radius) falling downward. Each should start at a random X, Z position and a random Y height. When a particle falls below Y = −5, reset it to a random position above Y = 8. Use an array of state objects with `{ mesh, vy }`. Gravity pulls everything down.',
              hint: 'In init(), give each particle a random starting Y between 0 and 8. In update(), apply `p.vy -= 12 * dt` (fast gravity for rain). When `p.mesh.position.y < -5`, reset: `p.mesh.position.y = 8 + Math.random() * 4`, `p.vy = 0`. For random X/Z: `randRange(-8, 8)`.',
              code: `function randRange(min, max) { return min + Math.random() * (max - min) }

const drops = []

function init() {
  const mat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7 })
  const geo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6)

  for (let i = 0; i < 40; i++) {
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(
      randRange(-8, 8),
      randRange(0, 8),  // stagger start heights
      randRange(-8, 8)
    )
    scene.add(mesh)
    drops.push({ mesh, vy: 0 })
  }

  scene.add(new THREE.GridHelper(18, 18))
  camera.position.set(0, 6, 16)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  drops.forEach(p => {
    // TODO: apply gravity to p.vy
    // TODO: advance p.mesh.position.y by p.vy * dt
    // TODO: if p.mesh.position.y < -5, reset position and vy
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
