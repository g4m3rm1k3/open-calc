export default {
  id: 'sim1-002',
  slug: 'variables-and-scope',
  chapter: 'sim1',
  order: 2,
  title: 'Variables & Scope',
  subtitle: 'Every simulation is a set of state variables that init() creates and update() reads sixty times per second. Getting their placement wrong is the most common beginner bug — and it is easy to fix once you see why it happens.',
  tags: ['variables', 'scope', 'let', 'const', 'state', 'javascript', 'beginners'],
  aliases: 'variables scope let const state javascript module scope closure',
  timeToComplete: 20,
  coreConcept: 'Variables declared outside all functions (module scope) are visible to both init() and update(). Variables declared inside a function vanish when that function returns. Your simulation\'s memory — positions, velocities, timers — must live in module scope.',
  prerequisites: ['sim1-001'],
  nextLesson: 'functions-and-math',

  hook: {
    question: "Why does a variable you create inside one function sometimes disappear before another function can use it — and why does this silently break almost every first simulation?",
    realWorldContext: "Every program that runs over time — a game, a physics engine, an animation tool — has the same fundamental challenge: it needs to remember things. Where is the ball? How fast is it moving? How many seconds have passed? These values must persist between function calls, persisting frame after frame for as long as the simulation runs.\n\nJavaScript has a precise set of rules for where values live and how long they survive. Understanding those rules is not optional — it is the foundation of every simulation you will ever write. This lesson covers the one concept that, once understood, eliminates the most common beginner crash.",
  },

  intuition: {
    prose: [
      "**Scope is visibility.** A variable can only be seen inside the curly braces `{}` where it was created. Declare a variable inside `init()` and it vanishes the moment `init()` returns — `update()` has no way to reach it. Declare it at the top of your code, outside all functions, and both functions can see it. That outer region is called **module scope**.",

      "**The three-zone pattern.** Every simulation has the same structure:\n\n```\n// Zone 1 — MODULE SCOPE: persists for the lifetime of the simulation\nlet mesh\nlet t = 0\n\nfunction init() {\n  // Zone 2 — runs once: create and assign\n  mesh = new THREE.Mesh(...)\n  scene.add(mesh)\n}\n\nfunction update(dt) {\n  // Zone 3 — runs 60×/sec: read and modify\n  t += dt\n  mesh.rotation.y = t\n}\n```\n\n`mesh` is declared in Zone 1 so both `init()` (which creates it) and `update()` (which rotates it) can see it. `t` starts at 0 and accumulates across every frame — it must be in module scope or it would reset to 0 on every call to `update()`.",

      "**`let` vs `const`.** Use `const` for things that will never be *reassigned* — geometries, materials, configuration numbers. Use `let` for things that change — positions, velocities, angles, timers. An important subtlety: `const` does not mean the value is frozen. `const mesh = new THREE.Mesh(...)` only prevents you from writing `mesh = somethingElse`. You can still do `mesh.position.x = 5` — you are modifying the object, not reassigning the variable.",

      "**State variables are your simulation's memory.** Everything the simulation needs to remember between frames lives as module-scope variables. A bouncing ball needs `px, py, vx, vy`. An orbiting sphere needs `t`. A particle system needs an array. Think of the variables at the top of your code as a snapshot of the simulation world at the current moment — `update()` reads that snapshot, advances it by `dt`, and writes it back.",

      "**Name variables after what they represent.** `ballX` is clearer than `x`. `orbitRadius` is clearer than `r`. `timeElapsed` is clearer than `t`. Variable names are free — use that freedom to make your code readable. You will be debugging these names at midnight when a physics calculation produces the wrong result; make them self-explanatory.",
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Most Common Beginner Bug',
        body: 'Writing `const box = new THREE.Mesh(...)` inside `init()` — then having `update()` crash with **ReferenceError: box is not defined**.\n\n**Fix:** pull the declaration to module scope:\n```js\nlet box             // ← module scope\n\nfunction init() {\n  box = new THREE.Mesh(...)  // assign (no const/let here)\n}\nfunction update(dt) {\n  box.rotation.y += dt  // ✓ works\n}\n```',
      },
      {
        type: 'definition',
        title: 'Scope',
        body: 'The **scope** of a variable is the region of code where that name is visible. JavaScript uses **lexical scope**: scope is determined by where code is written, not when it runs. `let` and `const` variables have **block scope** — they live in the nearest enclosing `{}` block and disappear when that block exits.',
      },
      {
        type: 'insight',
        title: '`const` with Objects — Not What You Might Expect',
        body: '```js\nconst mesh = new THREE.Mesh(geo, mat)\nmesh.position.x = 5   // ✓ modifying the object — allowed\nmesh.rotation.y = 1   // ✓ still allowed\nmesh = new THREE.Mesh(...) // ✗ TypeError: reassignment blocked\n```\n\n`const` prevents the *variable* from pointing at a different object. It does not freeze the object itself. For meshes, materials, and geometries that you create once — `const` communicates intent clearly.',
      },
      {
        type: 'procedure',
        title: 'What Belongs in Module Scope',
        body: 'Before writing `init()`, list everything `update()` will need:\n\n- **Meshes** created in `init()` but moved/rotated in `update()` → module scope\n- **Time accumulators** (`t`, `elapsed`) → module scope, initialise to `0`\n- **Physics state** (position, velocity) → module scope\n- **Temporary values** used only within one function → local scope is fine\n- **Geometry/material** objects → can be local to `init()` if never used in `update()`',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Variables & Scope in Action',
        mathBridge: 'Study where each variable is declared in each cell. Before running, predict whether the code will work.',
        caption: 'Cells 1–2 use Three.js (3D). Cells 3–4 use Canvas 2D.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The three-zone pattern',
              mode: '3d',
              prose: [
                '`let box` and `let t = 0` are declared in module scope — outside both functions. `init()` assigns `box`. `update()` uses both. This works because they are in Zone 1.',
                'Notice `t` accumulates over time. If `t` were declared inside `update()`, it would reset to `0` every frame and the box would never rotate. Module scope is what makes memory possible.',
              ],
              code: `// Zone 1 — MODULE SCOPE
let box
let t = 0

function init() {
  // Zone 2 — runs once
  box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color: 0x44aaff, emissive: 0x112233 })
  )
  scene.add(box)
  scene.add(new THREE.GridHelper(10, 10))
  camera.position.set(0, 4, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // Zone 3 — runs 60×/sec
  t += dt              // accumulates — only works in module scope
  box.rotation.y = t   // visible here because declared in Zone 1
  renderer.render(scene, camera)
}`,
            },
            {
              id: 2,
              cellTitle: '`let` vs `const` with objects',
              mode: '3d',
              prose: [
                '`const geometry` and `const material` are created once in init() and never reassigned — `const` is correct. `let mesh` could be `const` too, but `let` signals it might change. `let t = 0` must be `let` because it is reassigned every frame.',
                'Try changing `let t` to `const t` and running again — JavaScript will throw a TypeError when `update()` tries `t += dt`. That error is `const` doing its job.',
              ],
              code: `// const for things that never change identity
const geometry = new THREE.SphereGeometry(1.5, 24, 24)
const material = new THREE.MeshPhongMaterial({
  color: 0xff6644,
  emissive: 0x220a00,
})

// let for things that get reassigned
let mesh
let t = 0

function init() {
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  scene.add(new THREE.GridHelper(10, 10))
  camera.position.set(0, 5, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  t += dt
  mesh.position.y = Math.sin(t) * 2   // float up and down
  renderer.render(scene, camera)
}`,
            },
            {
              id: 3,
              cellTitle: '2D: four state variables — bouncing ball',
              mode: '2d',
              prose: [
                'This ball needs exactly four state variables: `px` and `py` for position, `vx` and `vy` for velocity. All four are declared in module scope. `init()` sets starting values. `update()` advances them every frame.',
                'Each state variable represents one piece of memory. Remove any one, or move it inside `init()`, and the simulation breaks. The set of module-scope variables IS the simulation state.',
              ],
              code: `// All state in module scope
let px, py    // position
let vx, vy    // velocity

const GRAVITY = 600
const DAMPING = 0.82
const R = 22

function init() {
  px = W / 2;  py = 70
  vx = 200;    vy = 0
}

function update(dt) {
  vy += GRAVITY * dt
  px += vx * dt
  py += vy * dt

  if (px - R < 0)  { px = R;     vx =  Math.abs(vx) * DAMPING }
  if (px + R > W)  { px = W - R; vx = -Math.abs(vx) * DAMPING }
  if (py + R > H)  { py = H - R; vy = -Math.abs(vy) * DAMPING }

  ctx.fillStyle = 'rgba(2,6,15,0.22)'
  ctx.fillRect(0, 0, W, H)
  ctx.beginPath()
  ctx.arc(px, py, R, 0, Math.PI * 2)
  ctx.fillStyle = '#44aaff'
  ctx.fill()
}`,
            },
            {
              id: 4,
              cellTitle: '2D: descriptive naming — same ball, readable code',
              mode: '2d',
              prose: [
                'Identical physics to Cell 3, but every name describes what it represents. `ballX` instead of `px`, `ENERGY_LOSS` instead of `DAMPING`, `BALL_RADIUS` instead of `R`.',
                'Neither version is wrong. But the second can be read aloud as a sentence: "advance ball speed Y by gravity times delta time." When you are debugging a physics bug six months from now, readable names save hours.',
              ],
              code: `let ballX, ballY
let ballSpeedX, ballSpeedY

const GRAVITY     = 600
const ENERGY_LOSS = 0.82
const BALL_RADIUS = 22

function init() {
  ballX = W / 2;      ballY = 70
  ballSpeedX = 200;   ballSpeedY = 0
}

function update(dt) {
  ballSpeedY += GRAVITY * dt
  ballX += ballSpeedX * dt
  ballY += ballSpeedY * dt

  if (ballX - BALL_RADIUS < 0)  { ballX = BALL_RADIUS;     ballSpeedX =  Math.abs(ballSpeedX) * ENERGY_LOSS }
  if (ballX + BALL_RADIUS > W)  { ballX = W - BALL_RADIUS; ballSpeedX = -Math.abs(ballSpeedX) * ENERGY_LOSS }
  if (ballY + BALL_RADIUS > H)  { ballY = H - BALL_RADIUS; ballSpeedY = -Math.abs(ballSpeedY) * ENERGY_LOSS }

  ctx.fillStyle = 'rgba(2,6,15,0.22)'
  ctx.fillRect(0, 0, W, H)
  ctx.beginPath()
  ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = '#ff6644'
  ctx.fill()
}`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'JavaScript uses **lexical (static) scoping**: the scope of a name is determined by its position in the source text, not by the order of function calls at runtime. Both `init()` and `update()` are functions defined inside the same outer scope (the sandbox wrapper). They are **closures** — they close over the module-scope variables, keeping those variables alive as long as any function that references them exists.',

      'A variable\'s **lifetime** and its **scope** are distinct. A module-scope variable lives for the entire program duration. A locally-declared variable lives only while its enclosing function is executing. When `init()` returns, any `const box` declared inside it is freed. When `update()` runs sixty milliseconds later, that memory is gone — which is why the engine throws `ReferenceError: box is not defined` rather than finding a stale value.',

      'The `let` keyword introduced in ES6 (2015) gives variables **block scope**: they live in the nearest enclosing `{}` and are not accessible outside it. The older `var` keyword has *function scope* and is *hoisted* to the top of its enclosing function — behavior that caused many subtle bugs. Always use `let` and `const`. Never use `var` in new code.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Closure',
        body: 'A **closure** is a function that captures variables from its enclosing lexical scope. In the sim pattern, both `init()` and `update()` are closures over the module-scope variables. They share the same binding — when `update()` writes `t += dt`, it modifies the single `t` that `init()` also had access to.',
      },
      {
        type: 'insight',
        title: 'Why `t` Must Be in Module Scope',
        body: 'If `t` were declared inside `update()`:\n```js\nfunction update(dt) {\n  let t = 0   // ← reset to 0 every frame\n  t += dt     // always 0.0167 — never accumulates\n}\n```\nEach call to `update()` creates a brand-new `t`, adds `dt` to it, then throws it away. The next call starts again at 0. No accumulation — no animation. Module scope is what gives `t` memory across frames.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenges: Scope in Practice',
        mathBridge: 'Each challenge tests whether you can identify and work with module scope. Read all the starter code before pressing Run.',
        caption: 'Challenge 1 is a bug-fix. Challenges 2–3 extend existing simulations.',
        initialProps: {
          initialCells: [
            {
              id: 'c1',
              challengeType: 'fix',
              challengeNumber: 1,
              challengeTitle: 'Fix the scope bug',
              difficulty: 'easy',
              mode: '3d',
              prose: [
                'A variable only exists inside the `{ }` block where it was declared. Writing `const box = ...` inside `init()` creates a variable that disappears the moment `init()` finishes — `update()` has no idea it exists. The fix: declare it at module scope (outside both functions) so both share the same reference. This is the most common mistake in sim code.',
              ],
              prompt: 'This code crashes with "ReferenceError: box is not defined". The bug is a scope error — `box` is declared in the wrong place. Find it and fix it so the box spins.',
              hint: 'Look for `const box` inside `init()`. Move the declaration to module scope as `let box`, and inside `init()` just write `box = new THREE.Mesh(...)` without any `const` or `let`.',
              code: `// BROKEN — find and fix the scope bug
function init() {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color: 0x44aaff })
  )
  scene.add(box)
  scene.add(new THREE.GridHelper(10, 10))
  camera.position.set(0, 4, 10)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  box.rotation.y += dt   // ReferenceError: box is not defined
  renderer.render(scene, camera)
}`,
            },
            {
              id: 'c2',
              challengeType: 'modify',
              challengeNumber: 2,
              challengeTitle: '2D: Add a second bouncing ball',
              difficulty: 'medium',
              mode: '2d',
              prose: [
                'The existing ball uses four state variables: `ball1X`, `ball1Y`, `ball1SpeedX`, `ball1SpeedY`. Adding a second ball means adding four *parallel* variables — the same four names but numbered 2. The `init()` function sets them to different starting values; `update()` runs the same physics on each set independently. This is the most direct way to add a second object before you learn arrays.',
              ],
              prompt: 'The starter code has one ball. Add a second by declaring four more state variables (ball2X, ball2Y, ball2SpeedX, ball2SpeedY), initialising them in init() with different starting values, updating them with the same physics in update(), and drawing them in a different color.',
              hint: 'Copy the four variable declarations and rename each one (ball2X etc.). In init(), give the second ball a starting X of W * 0.7 and a negative speedX so it goes left. Add the same physics block for ball2 in update(). Draw it with fillStyle = "#ff6644".',
              code: `let ball1X, ball1Y, ball1SpeedX, ball1SpeedY
// TODO: declare ball2X, ball2Y, ball2SpeedX, ball2SpeedY

const G = 600, D = 0.82, R = 20

function init() {
  ball1X = W * 0.3;  ball1Y = 80
  ball1SpeedX = 220; ball1SpeedY = 0
  // TODO: init ball2 at a different starting position
}

function update(dt) {
  ball1SpeedY += G * dt
  ball1X += ball1SpeedX * dt
  ball1Y += ball1SpeedY * dt
  if (ball1X - R < 0)  { ball1X = R;     ball1SpeedX =  Math.abs(ball1SpeedX) * D }
  if (ball1X + R > W)  { ball1X = W - R; ball1SpeedX = -Math.abs(ball1SpeedX) * D }
  if (ball1Y + R > H)  { ball1Y = H - R; ball1SpeedY = -Math.abs(ball1SpeedY) * D }
  // TODO: same physics for ball2

  ctx.fillStyle = 'rgba(2,6,15,0.2)'
  ctx.fillRect(0, 0, W, H)
  ctx.beginPath(); ctx.arc(ball1X, ball1Y, R, 0, Math.PI * 2)
  ctx.fillStyle = '#44aaff'; ctx.fill()
  // TODO: draw ball2 in a different color
}`,
            },
            {
              id: 'c3',
              challengeType: 'build',
              challengeNumber: 3,
              challengeTitle: '3D: Orbiting sphere using a time accumulator',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'A **time accumulator** is a module-scope variable that grows by `dt` every frame — it is the total elapsed seconds since the sim started. Feeding it into `Math.cos` and `Math.sin` produces smooth circular motion: `x = r * Math.cos(t * speed)`, `z = r * Math.sin(t * speed)`. One full orbit = 2π radians, so a sphere that completes one orbit per 4 seconds needs `speed = (2 * Math.PI) / 4`.',
              ],
              prompt: 'Create a sphere that completes one full orbit every 4 seconds. You need two module-scope variables: `sphere` and `t`. In update(), advance `t` at the right angular speed, then set sphere.position.x and sphere.position.z using Math.cos and Math.sin.',
              hint: 'One full orbit = 2π radians in 4 seconds, so angular speed = 2π / 4 = π/2 rad/s. Each frame: `t += (Math.PI / 2) * dt`. Then `sphere.position.x = RADIUS * Math.cos(t)` and `sphere.position.z = RADIUS * Math.sin(t)`.',
              code: `let sphere
let t = 0

const ORBIT_RADIUS = 5

function init() {
  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 20, 20),
    new THREE.MeshPhongMaterial({ color: 0xff6644, emissive: 0x220800 })
  )
  scene.add(sphere)
  scene.add(new THREE.GridHelper(14, 14))
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  ))
  camera.position.set(0, 10, 16)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  // TODO: advance t at angular speed = 2π / 4 rad/s
  // TODO: set sphere.position.x = ORBIT_RADIUS * Math.cos(t)
  // TODO: set sphere.position.z = ORBIT_RADIUS * Math.sin(t)
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
      text: 'A student puts `let t = 0` inside update(dt). The orbit does not animate. Why?',
      options: [
        'let is not allowed inside functions in JavaScript',
        'Every time update(dt) is called, t is reset to 0. The variable is created fresh each frame and discarded when the function returns. Placing it in module scope means it persists between calls and accumulates the elapsed time',
        'update(dt) is only called once so t only advances one frame',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '`const mesh = new THREE.Mesh(...)` — can you later do `mesh.position.x = 5`?',
      options: [
        'No — const makes the entire object immutable',
        'Yes — const prevents reassigning the variable (mesh = somethingElse would error), but the object the variable points to can still be mutated. Setting mesh.position.x modifies a property, not the binding itself',
        'Only if you declared position as let inside the Mesh class',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'For one full orbit per 4 seconds, the angular speed is 2π/4 = π/2 rad/s. Why 2π rather than 360?',
      options: [
        '2π is used because the period formula only works in radians',
        'Math.cos and Math.sin take radians as input. One full revolution = 2π radians. Dividing 2π by the period in seconds gives radians per second. Passing degrees would make the orbit 57× slower and never reach a full circle',
        '360 degrees is less precise than 2π',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A closure captures variables from its surrounding scope. In a particle system, each particle\'s update function captures its own `vy` variable. What makes this useful?',
      options: [
        'It avoids declaring vy in module scope, keeping global state clean',
        'Each closure independently holds its own vy, so 500 particles each track their own velocity without an array. However, for large particle counts, storing state in arrays and indexing by particle ID is more memory-efficient than 500 separate closures',
        'Closures make functions faster because the variable lookup is local',
      ],
      correct: 1,
    },
  ],
}
