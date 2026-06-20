// Three.js 2 · Chapter 3 · Lesson 1
// The Animation Loop — Delta Time & Frame-Rate Independence

const LESSON_3JS2_3_1 = {
  title: 'The Animation Loop',
  subtitle: 'requestAnimationFrame, delta time, the Clock, and why frame-rate-independent animation is non-negotiable.',
  sequential: true,

  cells: [

    // ── Cell 1: The Problem ───────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Problem With Frame-Dependent Animation

In earlier lessons we used this pattern:
\`\`\`js
cube.rotation.y += 0.01;   // 0.01 radians per frame
\`\`\`

This has a critical bug: it ties animation speed to frame rate. On a 60 Hz monitor, this runs at 0.6 rad/sec. On a 144 Hz monitor, it runs at 1.44 rad/sec — 2.4× faster. On a slow machine running at 20 FPS, it runs at only 0.2 rad/sec.

The game looks completely different depending on hardware. This is unacceptable.

The fix: express speed in **units per second**, not units per frame.

---

### Delta Time

**Delta time** (\`dt\`) is the duration of the previous frame in seconds.

| Frame rate | dt |
|------------|-----|
| 60 FPS | ≈ 0.0167 s |
| 30 FPS | ≈ 0.0333 s |
| 144 FPS | ≈ 0.0069 s |

Multiplying animation rates by \`dt\` makes them frame-rate independent:

\`\`\`js
// Frame-rate DEPENDENT (wrong):
cube.rotation.y += 0.01;        // 0.01 rad/frame × 60 FPS = 0.6 rad/sec

// Frame-rate INDEPENDENT (right):
cube.rotation.y += 1.0 * dt;   // 1.0 rad/sec always, regardless of FPS
\`\`\`

---

### THREE.Clock

Three.js provides \`THREE.Clock\` for precision timing:

\`\`\`js
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();        // seconds since last call to getDelta()
  const t  = clock.getElapsedTime(); // total seconds since clock started

  mesh.rotation.y += ROTATION_SPEED * dt;
  renderer.render(scene, camera);
}
\`\`\`

\`getDelta()\` returns the time between calls — it resets its internal timer on each call. \`getElapsedTime()\` gives total wall-clock time since the clock was created (or last stopped). Always use the Clock — \`Date.now()\` loses precision and does not integrate with the Clock's start/stop/pause API.`,
    },

    // ── Cell 2: RAF Deep Dive ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### requestAnimationFrame — How the Loop Actually Works

\`\`\`js
function animate(timestamp) {
  requestAnimationFrame(animate);  // 1. Schedule next call before next repaint
  const dt = clock.getDelta();     // 2. Measure frame duration
  const t  = clock.getElapsedTime();
  update(dt, t);                   // 3. All state changes
  renderer.render(scene, camera);  // 4. Draw — READ-ONLY, no state changes
}
requestAnimationFrame(animate);    // Kick off the loop
\`\`\`

**Why RAF instead of \`setInterval\`?**
- RAF fires *before* each screen repaint — you draw exactly when the display is ready
- RAF pauses automatically when the tab is hidden — saves battery and CPU
- RAF gives you a high-precision timestamp (\`performance.now()\` quality)
- \`setInterval\` fires on a timer regardless of screen state, causing wasted renders

**The Update/Render Separation Principle:**
\`update(dt, t)\` contains ALL state mutations (position, rotation, physics). \`renderer.render()\` is a pure read — it reads state but never changes it. This separation enables:
- Fixed-timestep physics (update at fixed intervals, render whenever)
- Recording/replaying simulations
- Testing update logic without rendering

---

### Fixed Timestep for Physics

Variable delta time causes physics instability. A 200ms hitch (GC pause, tab switch) creates a huge physics step — objects tunnel through walls.

The solution: a **fixed-timestep accumulator**:
\`\`\`js
const FIXED_DT = 1 / 60;  // physics always steps at 60Hz regardless of render
let accumulator = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);  // cap at 100ms — prevents spiral of death
  accumulator += dt;

  while (accumulator >= FIXED_DT) {
    physicsUpdate(FIXED_DT);     // fixed physics step
    accumulator -= FIXED_DT;
  }

  const alpha = accumulator / FIXED_DT;  // 0–1 interpolation factor
  renderInterpolated(alpha);             // blend between physics frames
}
\`\`\`

This pattern is used in every physics engine (Bullet, PhysX, Box2D) and is the standard for CAD simulation.`,
    },

    // ── Cell 3: FPS Demo ──────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Animation Loop Inspector

Two cubes run side by side. The LEFT cube uses frame-dependent rotation (\`+= 0.02 per frame\`). The RIGHT cube uses delta-time rotation (\`+= 1.0 * dt\`). They START at the same speed.

Press **Simulate Lag** to introduce artificial hitches. Notice: the frame-dependent cube stutters and the rotation speed changes. The delta-time cube recovers to the correct speed immediately.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
  <button id="btn-lag" style="padding:5px 14px;border-radius:6px;border:none;background:#7c3aed;color:#fff;font-family:monospace;font-size:11px;cursor:pointer">Simulate Lag Spike</button>
  <span id="fps-el" style="font-family:monospace;font-size:11px;color:var(--color-text-secondary, #475569)">-- FPS</span>
</div>
<canvas id="cv" style="display:block;border-radius:0 0 6px 6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 300);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/300, 0.1, 100);
camera.position.set(0, 2, 6);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,8,5)}));

// Frame-dependent cube (WRONG)
var cubeFrameDep = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xe06c75, roughness: 0.4 })
);
cubeFrameDep.position.x = -2;
scene.add(cubeFrameDep);

// Delta-time cube (RIGHT)
var cubeDT = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness: 0.4 })
);
cubeDT.position.x = 2;
scene.add(cubeDT);

// Labels
scene.add(Object.assign(new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 0.3),
  new THREE.MeshBasicMaterial({ color: 0xe06c75, transparent:true, opacity:0.6 })
), {position: new THREE.Vector3(-2, -1, 0)}));
scene.add(Object.assign(new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 0.3),
  new THREE.MeshBasicMaterial({ color: 0x64d8cb, transparent:true, opacity:0.6 })
), {position: new THREE.Vector3(2, -1, 0)}));

var clock      = new THREE.Clock();
var fpsCount   = 0;
var fpsTime    = 0;
var fpsDisplay = 0;
var lagPending = false;

document.getElementById('btn-lag').onclick = function() {
  lagPending = true;
};

function animate() {
  requestAnimationFrame(animate);

  if (lagPending) {
    // Busy-wait 150ms to simulate a GC/computation hitch
    var start = performance.now();
    while (performance.now() - start < 150) {}
    lagPending = false;
  }

  var dt = Math.min(clock.getDelta(), 0.2);
  var t  = clock.getElapsedTime();

  // Frame-dependent (wrong): fixed delta per frame regardless of time
  cubeFrameDep.rotation.y += 0.02;    // same amount every call — speed tied to FPS

  // Delta-time (right): 1 radian per second always
  cubeDT.rotation.y += 1.0 * dt;

  // FPS counter
  fpsCount++;
  fpsTime += dt;
  if (fpsTime >= 0.5) {
    fpsDisplay = Math.round(fpsCount / fpsTime);
    fpsCount = 0; fpsTime = 0;
    document.getElementById('fps-el').textContent = fpsDisplay + ' FPS';
  }

  renderer.render(scene, camera);
  info.textContent =
    'Left (frame-dep): rotation.y = ' + (cubeFrameDep.rotation.y % (Math.PI*2)).toFixed(3) + ' rad\n' +
    'Right (delta-time):rotation.y = ' + (cubeDT.rotation.y % (Math.PI*2)).toFixed(3) + ' rad\n' +
    'dt this frame = ' + (dt * 1000).toFixed(1) + ' ms';
}
animate();`,
      outputHeight: 450,
    },

    // ── Cell 4: Spring Physics Demo ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Spring Physics — Delta Time in Practice

A damped spring is a simple physics simulation that clearly shows why delta time matters.

The spring equation (Hooke's Law + damping):
\`\`\`
force = -k × displacement − damping × velocity × √k
acceleration = force / mass
velocity += acceleration × dt
position += velocity × dt
\`\`\`

This is **semi-implicit Euler integration** — the simplest physics integrator used in games for spring-follow cameras, UI bounce effects, and simple rigidbody motion.

\`\`\`js
class Spring {
  constructor(stiffness = 8, damping = 0.7) {
    this.position = 0;
    this.velocity = 0;
    this.target   = 0;
    this.k = stiffness;    // higher = snappier
    this.d = damping;      // 1.0 = critically damped (no oscillation)
  }

  step(dt) {
    const displacement = this.target - this.position;
    const force  = this.k * displacement - this.d * this.velocity * Math.sqrt(this.k);
    this.velocity += force * dt;
    this.position += this.velocity * dt;
  }
}
\`\`\`

Damping values:
- \`d < 1\`: **underdamped** — oscillates around the target
- \`d = 1\`: **critically damped** — fastest approach without oscillation
- \`d > 1\`: **overdamped** — slow, creeping approach`,
    },

    // ── Cell 5: Coding Challenge 1 — Spring Follow ───────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Spring-Follows-Target

Implement a spring that makes the cyan sphere follow the orange target sphere. The target moves in a figure-8 pattern; the follower should lag behind and oscillate.

Use the Spring class below. Your job:
1. Create a Spring instance with stiffness=6, damping=0.5 (underdamped — will oscillate)
2. Each frame, set \`spring.target\` to the target sphere's X position
3. Call \`spring.step(dt)\`
4. Set the follower sphere's X position to \`spring.position\`

Also display the spring's position and velocity in the info panel.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 260);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/260, 0.1, 100);
camera.position.set(0, 3, 8);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(10,10,0x1a1a2e,0x1a1a2e));

// Spring class (given)
function Spring(stiffness, damping) {
  this.position = 0;
  this.velocity = 0;
  this.target   = 0;
  this.k = stiffness || 6;
  this.d = damping   || 0.5;
}
Spring.prototype.step = function(dt) {
  var displacement = this.target - this.position;
  var force = this.k * displacement - this.d * this.velocity * Math.sqrt(this.k);
  this.velocity += force * dt;
  this.position += this.velocity * dt;
};

// Target (orange) — moves in a figure-8
var target = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xf5a623, roughness:0.4 })
);
scene.add(target);

// Follower (cyan) — should spring-follow the target
var follower = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness:0.4 })
);
follower.position.y = 0.8;
scene.add(follower);

// ── YOUR CODE: create the spring ──────────────────────────────────────────────
// var spring = new Spring(6, 0.5);

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);
  var t  = clock.getElapsedTime();

  // Target moves in a figure-8 (Lissajous)
  target.position.x = 3.0 * Math.sin(t * 0.8);
  target.position.y = 0.5 + 0.5 * Math.sin(t * 1.6);

  // ── YOUR CODE: spring follows target ──────────────────────────────────────
  // spring.target = target.position.x;
  // spring.step(dt);
  // follower.position.x = spring.position;

  renderer.render(scene, camera);
  info.textContent =
    'target.x   = ' + target.position.x.toFixed(3) + '\n' +
    // 'spring.pos = ' + (typeof spring !== 'undefined' ? spring.position.toFixed(3) : '—') + '\n' +
    // 'spring.vel = ' + (typeof spring !== 'undefined' ? spring.velocity.toFixed(3) : '—') +
    '';
}
animate();`,
      outputHeight: 380,
    },

    // ── Cell 6: Coding Challenge 2 — Easing ──────────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Lerp & Easing Functions

Implement a cube that moves between two positions using **lerp** (linear interpolation) and an **easing function**. Press the button to trigger the transition.

**Lerp formula:** \`lerp(a, b, t) = a + (b - a) × t\` where t goes from 0 to 1.

**Smoothstep easing:** \`t_ease = t * t * (3 - 2 * t)\` — starts slow, accelerates, ends slow.

Requirements:
1. The cube starts at \`x = -3\`
2. On button press, transition to \`x = 3\` over 1 second using smoothstep
3. Press again to transition back
4. Display the raw \`t\` and eased \`t_ease\` values to see the difference`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px">
  <button id="btn-go" style="padding:5px 16px;border-radius:6px;border:none;background:#1d4ed8;color:#fff;font-family:monospace;font-size:11px;cursor:pointer">▶ Go</button>
</div>
<canvas id="cv" style="display:block;border-radius:0 0 6px 6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 280);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/280, 0.1, 100);
camera.position.set(0, 2, 8);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(10,10,0x1a1a2e,0x1a1a2e));

var cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness: 0.4 })
);
cube.position.x = -3;
scene.add(cube);

var START = -3, END = 3;
var progress = 0;       // 0 = at START, 1 = at END
var direction = 1;      // +1 going right, -1 going left
var animating = false;
var rawT = 0;

document.getElementById('btn-go').onclick = function() {
  animating = true;
  if (progress >= 1) { rawT = 0; direction = -1; }
  if (progress <= 0) { rawT = 0; direction = 1;  }
};

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);

  if (animating) {
    rawT = Math.min(rawT + dt, 1.0);
    progress = direction > 0 ? rawT : 1 - rawT;
    if (rawT >= 1.0) animating = false;
  }

  // ── YOUR CODE: compute eased t and lerp position ──────────────────────────
  // var tEased = rawT * rawT * (3 - 2 * rawT);  // smoothstep
  // var currentX = START + (END - START) * (direction > 0 ? tEased : 1 - tEased);
  // cube.position.x = currentX;
  var tEased = rawT * rawT * (3 - 2 * rawT);

  renderer.render(scene, camera);
  info.textContent =
    'raw t:   ' + rawT.toFixed(3) + '\n' +
    'eased t: ' + tEased.toFixed(3) + '\n' +
    'cube.x:  ' + cube.position.x.toFixed(3);
}
animate();`,
      outputHeight: 400,
    },

    // ── Cell 7: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You are implementing a physics simulation (a bouncing ball). The render loop is called at variable frame rates (30–144 Hz). Using variable dt directly causes the simulation to behave differently at different frame rates. What is the correct solution?`,
      options: [
        { label: 'A', text: 'Call renderer.setAnimationLoop() with a fixed interval to force 60 FPS rendering.' },
        { label: 'B', text: 'Use a fixed-timestep accumulator: accumulate variable dt, then run physics in fixed steps until the accumulated time is consumed.' },
        { label: 'C', text: 'Multiply all physics forces by the frame rate to compensate for variable dt.' },
        { label: 'D', text: 'Use requestAnimationFrame with a target timestamp — the browser guarantees equal intervals.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The fixed-timestep accumulator pattern: accumulate the variable render dt, then consume it in fixed physics steps (e.g., FIXED_DT = 1/60). This guarantees physics runs at a constant rate regardless of render frame rate. Always cap the accumulated dt (Math.min(dt, 0.1)) to prevent the "spiral of death" where long hitches cause many physics steps which take longer than a frame, compounding the delay.',
      failMessage: 'The answer is B. The browser cannot guarantee equal intervals with requestAnimationFrame (D), and forcing 60 FPS is impossible on all hardware (A). Multiplying forces by frame rate (C) is incorrect and breaks physical units. The correct solution is the fixed-timestep accumulator: store leftover time, consume it in fixed-size physics steps, and render whenever. This decouples render rate from simulation rate.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_3_1 }

export default {
  id: 'three-js-2-3-1-animation-loop',
  slug: 'animation-loop-delta-time',
  chapter: 'three-js-2.3',
  order: 1,
  title: LESSON_3JS2_3_1.title,
  subtitle: LESSON_3JS2_3_1.subtitle,
  tags: ['three-js', 'animation', 'requestAnimationFrame', 'delta-time', 'clock', 'physics', 'spring', 'fixed-timestep'],
  hook: {
    question: 'object.rotation.y += 0.01 runs at 0.6 rad/sec on a 60Hz monitor and 1.44 rad/sec on 144Hz. Same code, different hardware, completely different result. What is the one-line fix — and why does it matter for physics simulations?',
    realWorldContext: 'Frame-rate independence is not a nice-to-have — it is a requirement. Games, physics engines, and CAD simulations must behave identically at 30 FPS, 60 FPS, and 144 FPS. Delta time is the universal solution, and the fixed-timestep accumulator is how physics engines keep simulations stable.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Frame-dependent: rotation += 0.01/frame. At 144Hz = 2.4× faster than at 60Hz.',
      'Frame-independent: rotation += SPEED * dt. dt = seconds since last frame. Speed is rad/sec always.',
      'THREE.Clock.getDelta() returns seconds since last call — the standard delta time source.',
      'requestAnimationFrame: fires before screen repaint, pauses when tab hidden, gives high-precision timestamp.',
      'Separate update(dt, t) from renderer.render() — state changes vs pure read.',
      'Fixed-timestep accumulator: accumulate variable dt, consume in fixed physics steps. Prevents spiral of death.',
    ],
    callouts: [
      { type: 'insight', title: 'The update/render separation', body: 'update(dt, t) contains ALL state mutations. renderer.render() is a pure read. This enables fixed-timestep physics, recording/replay, and testing update logic independently.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_3_1.title, props: { lesson: LESSON_3JS2_3_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'dt = clock.getDelta() = seconds elapsed since last frame. Multiply speeds by dt for frame-independence.',
    'Constant speed: position += velocity * dt. velocity in units/second, not units/frame.',
    'Fixed timestep: accumulate dt, while(acc >= FIXED_DT) { physicsStep(FIXED_DT); acc -= FIXED_DT; }',
    'Cap dt: Math.min(clock.getDelta(), 0.1) prevents spiral of death after hitches.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"position += velocity * dt. velocity in units/second, not units/frame." You set velocity = 5 (units/frame) and run on a 120fps monitor. What happens versus a 60fps monitor?',
      options: [
        'The animation runs at the same speed — velocity is frame-independent',
        'The object moves twice as fast on 120fps — 5 units per frame means 600 units/second at 120fps vs 300 at 60fps. Multiply by dt to fix this',
        'The object moves twice as slow on 120fps',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"dt = clock.getDelta() = seconds since last frame." On a 60fps display, what is the approximate dt value per frame?',
      options: [
        '60 — the frame rate in fps',
        '0.0167 — one sixtieth of a second (1/60 ≈ 0.0167 seconds)',
        '16.7 — milliseconds per frame',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Cap dt: Math.min(dt, 0.1) prevents spiral of death." What is the spiral of death?',
      options: [
        'A memory leak caused by uncapped animation loops',
        'When a frame takes too long, dt is large → physics updates take longer → next frame also takes too long → dt grows further. The simulation falls further behind indefinitely. Capping dt breaks the cycle',
        'An infinite loop caused by recursive animation callbacks',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Fixed timestep: while(acc >= FIXED_DT) { physicsStep(FIXED_DT); acc -= FIXED_DT; }" Why would physics use a fixed step while rendering uses a variable dt?',
      options: [
        'Fixed steps are faster to compute',
        'Physics simulations (spring forces, collision detection) are numerically unstable with large variable steps — a fixed step ensures deterministic, stable results regardless of frame rate variation',
        'Variable dt causes the physics engine to run at double speed',
      ],
      correct: 1,
    },
  ],
}
