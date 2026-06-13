// ═══════════════════════════════════════════════════════════════════════════
// SIMULATION LESSON TEMPLATE
// Use for: Sim-1/2/3 — Three.js 3D or Canvas 2D animation lessons where
//          the student writes init() and update(dt) that run at 60 fps.
//
// HOW THE SANDBOX WORKS:
//   init()       — called once when student clicks Run
//   update(dt)   — called ~60× per second. dt = seconds since last frame.
//
//   3D globals:  scene, camera, renderer, controls, THREE
//                MUST call renderer.render(scene, camera) in every update()
//   2D globals:  canvas, ctx, W, H
//                Clear and redraw everything every frame
//
//   Every cell must end with:  return { init, update };
//
// SUBMIT: email your completed file to m1k3ymcl34n@gmail.com
//         subject: [Lesson Submission] YOUR TITLE
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // ── Identity ──────────────────────────────────────────────────────────────
  // id format: sim1-CHAPTER-ORDER-SLUG
  // Examples: 'sim1-010-collision-detection'  |  'sim2-003-fluid-particles'
  id: 'sim1-CHAPTER-ORDER-SLUG',
  slug: 'url-friendly-slug',
  chapter: 'sim1',
  order: 10,
  title: 'YOUR LESSON TITLE',
  subtitle: 'What the student will build in this lesson.',
  tags: ['three.js', 'simulation', 'KEYWORD'],  // or 'canvas2d'
  coreConcept: `THE KEY IDEA in one sentence — what the student takes away.`,

  hook: {
    question: `WHAT PHENOMENON DOES THIS SIMULATION DEMONSTRATE?`,
    realWorldContext: `WHERE THIS SIMULATION MODEL APPEARS IN REAL ENGINEERING OR SCIENCE.`,
  },

  intuition: {
    prose: [
      `**The simulation pattern.** Every sim has two functions: \`init()\` sets up the world once, \`update(dt)\` advances time. Always multiply velocities by \`dt\` to stay frame-rate independent.`,
      `**What this models.** EXPLAIN THE PHYSICAL OR MATHEMATICAL PHENOMENON. What are the state variables? What equations govern them?`,
      `**Before building:** predict what QUANTITY will do as PARAMETER changes.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson X of the Sim Series',
        body: `**Previous:** PREVIOUS SIM LESSON\n**This:** WHAT YOU BUILD HERE\n**Next:** NEXT SIM LESSON`,
      },
      {
        type: 'procedure',
        title: 'Building this simulation',
        body: `1. In \`init()\`: create geometry, set starting positions and velocities\n2. In \`update(dt)\`: apply forces, update velocities (v += a*dt), update positions (x += v*dt)\n3. In \`update(dt)\` (3D only): call \`renderer.render(scene, camera)\`\n4. End every cell with \`return { init, update };\``,
      },
    ],
  },

  visualizations: [
    {
      id: 'SimNotebook',
      title: 'Simulation Lab',
      props: {
        lesson: {
          title: 'LAB TITLE',
          subtitle: 'WHAT THE STUDENT BUILDS',
          sequential: true,
          cells: [

            // ── Cell 1 — Basic setup (3D) ─────────────────────────────────
            {
              type: '3d',    // use '2d' for Canvas 2D
              instruction: `**Step 1: YOUR FIRST TASK.** EXPLAIN WHAT THIS CELL DOES AND WHAT TO OBSERVE. Try changing the color or SIZE after running it.`,
              startCode: `function init() {
  // Create a mesh: geometry + material = mesh
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: 0x44aaff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x303030));

  // Camera position
  camera.position.set(3, 3, 5);
  camera.lookAt(0, 0, 0);

  // Store objects for use in update()
  scene.userData.cube = cube;

  renderer.render(scene, camera);
}

function update(dt) {
  const cube = scene.userData.cube;

  // Rotate the cube — dt keeps this frame-rate independent
  cube.rotation.y += 0.8 * dt;

  renderer.render(scene, camera);
}

return { init, update };`,
            },

            // ── Cell 2 — Add YOUR PHYSICS ────────────────────────────────
            {
              type: '3d',
              instruction: `**Step 2: Add PHYSICAL BEHAVIOR.** The equation governing this is: $EQUATION$.\n\nFill in the \`...\` to implement SPECIFIC BEHAVIOR.`,
              startCode: `let pos, vel;
const GRAVITY = -9.8;   // m/s²

function init() {
  const geo = new THREE.SphereGeometry(0.3, 16, 16);
  const mat = new THREE.MeshPhongMaterial({ color: 0xff6644 });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x303030));

  camera.position.set(0, 3, 8);
  camera.lookAt(0, 0, 0);

  // Initial state
  pos = new THREE.Vector3(0, 4, 0);
  vel = new THREE.Vector3(2, 0, 0);

  scene.userData.sphere = sphere;
  renderer.render(scene, camera);
}

function update(dt) {
  const sphere = scene.userData.sphere;

  // Apply YOUR FORCE here
  // acceleration = new THREE.Vector3(0, ..., 0);  // fill in the y component
  const acceleration = new THREE.Vector3(0, GRAVITY, 0);

  // Euler integration: v += a*dt,  x += v*dt
  vel.addScaledVector(acceleration, dt);
  pos.addScaledVector(vel, dt);

  // Bounce off floor
  if (pos.y < 0.3) {
    pos.y = 0.3;
    vel.y *= -0.8;
  }

  sphere.position.copy(pos);
  renderer.render(scene, camera);
}

return { init, update };`,
            },

            // ── Cell 3 — 2D version (optional, swap type to '2d') ─────────
            {
              type: '2d',
              instruction: `**Step 3: Canvas 2D version.** Same physics but drawn in 2D. Note: in Canvas 2D, Y increases downward — so \`vy += gravity * dt\` moves the object down the screen.\n\nModify the bounce coefficient or gravity to see how the simulation changes.`,
              startCode: `let px, py, vx, vy;
const GRAVITY = 500;   // pixels per second²

function init() {
  px = W / 2;
  py = 50;
  vx = 150;
  vy = 0;
}

function update(dt) {
  // Physics
  vy += GRAVITY * dt;
  px += vx * dt;
  py += vy * dt;

  // Bounce off bottom edge
  if (py > H - 20) {
    py = H - 20;
    vy *= -0.75;
  }

  // Wrap horizontally
  if (px > W + 20) px = -20;

  // Draw — clear first, then redraw everything
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // Draw ball
  ctx.beginPath();
  ctx.arc(px, py, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa';
  ctx.fill();

  // Draw floor
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, H - 4, W, 4);
}

return { init, update };`,
            },

            // ── Cell 4 — Challenge ────────────────────────────────────────
            {
              type: '3d',   // or '2d'
              instruction: `**Challenge: BUILD YOUR OWN SIMULATION.** DESCRIBE REQUIREMENTS.\n\n**Requirements:**\n- REQUIREMENT 1\n- REQUIREMENT 2\n- REQUIREMENT 3\n\n**Hint:** ONE SMALL HINT`,
              startCode: `function init() {
  // Your setup here
  camera.position.set(0, 3, 8);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

function update(dt) {
  // Your animation here
  renderer.render(scene, camera);
}

return { init, update };`,
            },

          ],
        },
      },
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `What does \`dt\` represent in \`update(dt)\`?`,
      options: [
        'Total elapsed time since the simulation started',
        'Seconds elapsed since the last frame',
        'The target frame rate in frames per second',
        'The distance moved this frame',
      ],
      answer: 'Seconds elapsed since the last frame',
      hints: [`Think about what makes a simulation run at the same speed on fast and slow machines.`],
      reviewSection: 'intuition',
    },
    {
      id: 'q2',
      type: 'choice',
      question: `QUESTION ABOUT YOUR SPECIFIC SIMULATION CONCEPT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option A text',
      hints: [`HINT`],
      reviewSection: 'intuition',
    },
    {
      id: 'q3',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option B text',
      hints: [`HINT`],
      reviewSection: 'intuition',
    },
  ],
}
