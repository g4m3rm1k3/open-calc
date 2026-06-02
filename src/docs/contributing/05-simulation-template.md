# Simulation Lesson Template

Use this for Three.js 3D simulations or Canvas 2D animations. The student writes `init()` and `update(dt)` functions that run at 60 fps in a sandboxed environment.

> **Download the template:** Go to the **Templates** tab and click Download next to **Simulation**.

---

## How the sim sandbox works

The sandbox calls your code like this:

```js
init()                // called once when the student clicks Run
update(dt)            // called ~60 times per second
```

**3D mode** — globals available: `scene`, `camera`, `renderer`, `controls`, `THREE`  
Must call `renderer.render(scene, camera)` at the end of every `update()`.

**2D mode** — globals available: `canvas`, `ctx`, `W`, `H`  
`ctx` is the Canvas 2D rendering context. Clear and redraw every frame.

The coordinate systems differ:
- **3D:** Y-up, right-handed. `+X` right, `+Y` up, `+Z` toward camera.
- **2D:** Y-down. `(0,0)` is top-left. `W` and `H` are canvas width/height.

---

## Template

```js
export default {
  id: 'sim1-chapter-order-slug',   // e.g. 'sim1-010-collision'
  slug: 'descriptive-slug',
  chapter: 'sim1',
  order: 10,
  title: 'Lesson Title',
  subtitle: 'What the student will build',
  tags: ['three.js', 'simulation', 'keyword'],  // or 'canvas2d'
  coreConcept: `[One sentence: the key idea the student takes away from this simulation.]`,

  hook: {
    question: `[What phenomenon does this simulation demonstrate?]`,
    realWorldContext: `[Where this simulation model appears in real engineering or science.]`,
  },

  intuition: {
    prose: [
      `**The simulation pattern.** Every sim has two functions: \`init()\` sets up the world, \`update(dt)\` advances time. \`dt\` is seconds since the last frame — always multiply velocities by \`dt\` to stay frame-rate independent.`,
      `**What this simulation models.** [Explain the physical or mathematical phenomenon. What are the state variables? What equations govern their change?]`,
      `**Before building:** predict what [quantity] will do as [parameter] changes.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson X of the Sim Series',
        body: `**Previous:** [previous sim lesson]\n**This lesson:** [what you build here]\n**Next:** [next sim lesson]`,
      },
      {
        type: 'procedure',
        title: 'Building a [type] simulation',
        body: `1. In \`init()\`: create geometry/objects, set starting positions and velocities\n2. In \`update(dt)\`: apply forces, update velocities, update positions\n3. In \`update(dt)\`: call \`renderer.render(scene, camera)\` (3D only)\n4. Test with edge cases: what happens at t=0? At extreme parameter values?`,
      },
    ],
  },

  visualizations: [
    {
      id: 'SimNotebook',
      title: 'Simulation Lab',
      props: {
        lesson: {
          title: '[Lab title]',
          subtitle: '[What the student builds]',
          sequential: true,
          cells: [

            // ── Cell 1 — Introduction (3D example) ────────────────────────
            {
              type: '3d',
              instruction: `**Step 1: A basic [object] in 3D.** This cell creates a [shape] and adds it to the scene. Click ▶ Run to see it appear, then try changing the color or size.`,
              startCode: `function init() {
  // Create a box geometry and mesh
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: 0x44aaff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Add lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  // Position camera
  camera.position.set(3, 3, 5);
  camera.lookAt(0, 0, 0);

  // Store reference on scene for update()
  scene.userData.cube = cube;

  renderer.render(scene, camera);
}

function update(dt) {
  const cube = scene.userData.cube;

  // Rotate slowly
  cube.rotation.y += 0.5 * dt;
  cube.rotation.x += 0.2 * dt;

  renderer.render(scene, camera);
}

return { init, update };`,
            },

            // ── Cell 2 — Add physics ───────────────────────────────────────
            {
              type: '3d',
              instruction: `**Step 2: Apply [force/physics].** Now add [physical behavior] to the simulation. The key equation is: $[equation]$.\n\nFill in the \`...\` to implement [specific behavior].`,
              startCode: `let position, velocity;

function init() {
  const geometry = new THREE.SphereGeometry(0.3, 16, 16);
  const material = new THREE.MeshPhongMaterial({ color: 0xff6644 });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  scene.add(new THREE.DirectionalLight(0xffffff, 1).position.set(5, 10, 5) && new THREE.DirectionalLight(0xffffff, 1));
  scene.add(new THREE.AmbientLight(0x404040));
  camera.position.set(0, 2, 8);
  camera.lookAt(0, 0, 0);

  // Initial conditions
  position = new THREE.Vector3(0, 3, 0);
  velocity = new THREE.Vector3(2, 0, 0);  // initial velocity

  scene.userData.sphere = sphere;
  renderer.render(scene, camera);
}

function update(dt) {
  const sphere = scene.userData.sphere;

  // Apply [force] — fill in the acceleration
  const acceleration = new THREE.Vector3(0, ..., 0);  // [hint: gravity is -9.8]

  // Euler integration: v += a * dt, x += v * dt
  velocity.addScaledVector(acceleration, dt);
  position.addScaledVector(velocity, dt);

  // Bounce off floor at y = 0
  if (position.y < 0.3) {
    position.y = 0.3;
    velocity.y *= -0.8;  // energy loss
  }

  sphere.position.copy(position);
  renderer.render(scene, camera);
}

return { init, update };`,
            },

            // ── Cell 3 — Canvas 2D example ─────────────────────────────────
            {
              type: '2d',
              instruction: `**Step 3: The same physics in 2D.** Canvas 2D mode is simpler for some simulations. Y increases downward, so we flip the physics Y axis.\n\nThis cell shows a [phenomenon] using Canvas 2D.`,
              startCode: `let px, py, vx, vy;

function init() {
  px = W / 2;
  py = 50;
  vx = 120;  // pixels per second
  vy = 0;
}

function update(dt) {
  const gravity = 400;  // pixels per second²

  vy += gravity * dt;
  px += vx * dt;
  py += vy * dt;

  // Bounce off bottom
  if (py > H - 15) {
    py = H - 15;
    vy *= -0.75;
  }

  // Wrap horizontally
  if (px > W + 15) px = -15;

  // Draw
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.arc(px, py, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa';
  ctx.fill();
}

return { init, update };`,
            },

            // ── Cell 4 — Challenge ──────────────────────────────────────────
            {
              type: '3d',
              instruction: `**Challenge: Build [something harder].** [Describe what to build. Reference the concepts from earlier cells.]\n\n**Requirements:**\n- [ ] [Requirement 1]\n- [ ] [Requirement 2]\n- [ ] [Requirement 3]`,
              startCode: `// Your simulation here
// Start from scratch or copy/modify an earlier cell

function init() {
  // Setup

  renderer.render(scene, camera);
}

function update(dt) {
  // Animate

  renderer.render(scene, camera);
}

return { init, update };`,
            },

          ],
        },
      },
    },
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `What does \`dt\` represent in an \`update(dt)\` function?`,
      options: [
        'The total elapsed time since the simulation started',
        'The number of seconds since the last frame',
        'The target frame rate in frames per second',
        'The distance the object moved this frame',
      ],
      answer: 'The number of seconds since the last frame',
      hints: [`Think about what makes simulations frame-rate independent.`],
      reviewSection: 'intuition',
    },
    // Add more questions about your specific simulation concept
  ],
}
```

---

## Tips

**3D:**
- Always call `renderer.render(scene, camera)` at the end of `update()`
- Store objects in `scene.userData` to share between `init()` and `update()`
- Use `MeshPhongMaterial` for shiny objects, `MeshStandardMaterial` for realistic PBR
- Add `OrbitControls` — they come free from the sandbox (the `controls` global)

**2D:**
- `ctx.clearRect(0, 0, W, H)` then redraw everything every frame
- Physics Y is inverted: positive velocity moves the object down the screen
- Use CSS variables like `var(--color-background-primary)` for theme-aware colors

**Both:**
- Return `{ init, update }` at the end of every cell — the sandbox needs this
- Use `dt` for every velocity update — never assume 60 fps
