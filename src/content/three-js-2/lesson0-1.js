// Three.js 2 · Chapter 0 · Lesson 1
// Your First Scene: Renderer, Scene, Camera

const LESSON_3JS2_0_1 = {
  title: 'Your First Scene',
  subtitle: 'The three objects every Three.js program needs — Renderer, Scene, Camera — and what each one actually does.',
  sequential: true,

  cells: [

    // ── Cell 1: The Holy Trinity ──────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Holy Trinity: Renderer, Scene, Camera

Every Three.js program needs exactly three things before anything appears:

| Object | What it is | Real-world analogy |
|--------|-----------|-------------------|
| \`WebGLRenderer\` | Talks to the GPU. Manages the \`<canvas>\`. | The camera body + film projector |
| \`Scene\` | A tree of objects, lights, and fog | The film set / stage |
| \`PerspectiveCamera\` | Defines viewpoint — where we look from, what we see | The camera lens + focal length |

None of them knows about the others until you connect them. The renderer takes a scene and a camera and produces one frame:

\`\`\`js
renderer.render(scene, camera);
\`\`\`

---

### What is WebGL?

**WebGL** gives the browser direct access to the GPU. It is based on OpenGL ES — the same foundation as mobile game engines. Vulkan is the modern successor (more explicit, lower overhead), but the core concepts are identical: vertex buffers, shader programs, draw calls, transform pipeline.

Three.js wraps the verbose WebGL API so you express intent in JavaScript. When you call \`new THREE.WebGLRenderer()\`, Three.js compiles shader programs, allocates GPU memory, and manages rendering state — all hidden from you.

---

### The Right-Handed Coordinate System

\`\`\`
         +Y (up)
          |
          |
          |______ +X (right)
         /
        /
       +Z  (toward you, out of the screen)
\`\`\`

When you set \`object.position.z = 5\`, the object moves **toward you**. A camera at \`z = 5\` looking at the origin is looking in the **−Z direction**.

**Right-hand rule:** Point your right hand's fingers toward +X, curl toward +Y. Your thumb points in +Z.

---

### The Viewing Frustum

A \`PerspectiveCamera\` sees only the volume inside its **frustum** — a truncated pyramid:

| Parameter | Controls | Tip |
|-----------|---------|-----|
| \`fov\` | Vertical field of view in degrees | 60° is natural; 90° = wide angle |
| \`aspect\` | Width ÷ height | Must match the canvas or scene looks squashed |
| \`near\` | Minimum distance | Keep large — tiny near causes **z-fighting** |
| \`far\` | Maximum distance | Keep as small as your scene allows |

**Z-fighting:** When \`near\` is extremely small (e.g. 0.00001) and \`far\` is huge, the GPU's depth buffer precision is spread so thin that nearby surfaces appear to flicker through each other. Always set \`near\` as large as your closest object allows.`,
    },

    // ── Cell 2: Complete Annotated Demo ──────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Complete First Scene — Fully Annotated

Read every comment. Each section teaches one concept. After the scene is running, try modifying the values marked with ← to see immediate feedback.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:#475569;padding:6px;background:#0a0a0f;border-bottom-left-radius:6px;border-bottom-right-radius:6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `// ── RENDERER ────────────────────────────────────────────────────────────────
// WebGLRenderer creates a WebGL context on the provided canvas.
// antialias: true → MSAA smooths jagged edges at mild performance cost.
var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));  // cap DPR at 2
renderer.setSize(640, 340);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ── SCENE ────────────────────────────────────────────────────────────────────
// Scene is a container — an Object3D tree. Starts empty.
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);  // ← try 0x1a0a2e (deep purple)

// ── CAMERA ───────────────────────────────────────────────────────────────────
// PerspectiveCamera(fov, aspect, near, far)
var camera = new THREE.PerspectiveCamera(
  60,         // ← try 30 (telephoto) or 90 (wide angle)
  640 / 340,  // aspect — matches the renderer size
  0.1,        // near — smallest distance rendered
  1000        // far  — furthest distance rendered
);
camera.position.set(0, 2, 5);  // ← try (3, 3, 3) or (0, 8, 0)
camera.lookAt(0, 0, 0);

// ── MESH ─────────────────────────────────────────────────────────────────────
// Mesh = Geometry (shape) + Material (appearance).
// BoxGeometry(w, h, d, wSeg, hSeg, dSeg) — default 1 segment per face.
// MeshBasicMaterial ignores lighting — flat constant colour.
var cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x64d8cb })  // ← try 0xff6600 (orange)
);
scene.add(cube);  // nothing renders until it's in the scene graph

// ── HELPERS ──────────────────────────────────────────────────────────────────
scene.add(new THREE.GridHelper(6, 6, 0x1a1a2e, 0x1a1a2e));
scene.add(new THREE.AxesHelper(2));  // X=red, Y=green, Z=blue

// ── RENDER LOOP ──────────────────────────────────────────────────────────────
// requestAnimationFrame fires before each screen repaint (~60/sec).
// Calling it inside animate() creates the loop.
var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;  // seconds elapsed
  cube.rotation.y = t * 0.8;  // ← try 2.0 for fast spin
  cube.rotation.x = t * 0.3;
  renderer.render(scene, camera);
  document.getElementById('info').textContent =
    'elapsed: ' + t.toFixed(1) + 's  |  cube.rotation.y: ' +
    (cube.rotation.y * 180 / Math.PI % 360).toFixed(0) + '°';
}
animate();`,
      outputHeight: 420,
    },

    // ── Cell 3: Step-by-step walkthrough ─────────────────────────────────────
    {
      type: 'walkthrough',
      instruction: `### Build the Scene — One Object at a Time\n\nWatch the scene grow. Each step adds exactly one thing and explains why it matters.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script><canvas id="cv" style="display:block;border-radius:6px"></canvas>`,
      css: `body{margin:0;background:#060610;overflow:hidden}`,
      outputHeight: 300,
      steps: [
        {
          title: 'Step 1 — Renderer only',
          explanation: `Create the renderer. \`setSize(640, 300)\` sets the drawing-surface pixels. \`setClearColor\` sets the background. \`clear()\` paints it.\n\nResult: a dark rectangle. No camera or scene yet — the renderer just cleared the canvas.`,
          code: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 300);
renderer.setClearColor(0x0a0a0f);
renderer.clear();`,
        },
        {
          title: 'Step 2 — Scene + Camera',
          explanation: `Scene is an empty tree. Camera is a viewpoint — placed 5 units back, aimed at the origin. \`renderer.render\` draws the scene as seen from the camera.\n\nResult: still a dark rectangle — the scene is empty — but now we have all three pieces of the trinity.`,
          code: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setSize(640, 300);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/300, 0.1, 1000);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);
renderer.render(scene, camera);`,
        },
        {
          title: 'Step 3 — Mesh & Helpers',
          explanation: `A Mesh = Geometry + Material. \`scene.add(cube)\` puts it in the tree — without this line the cube is invisible. AxesHelper and GridHelper are debugging tools: X=red, Y=green, Z=blue.`,
          code: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setSize(640, 300);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/300, 0.1, 1000);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);
var cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x64d8cb })
);
scene.add(cube);
scene.add(new THREE.AxesHelper(2));
scene.add(new THREE.GridHelper(6, 6, 0x1a1a2e, 0x1a1a2e));
renderer.render(scene, camera);`,
        },
        {
          title: 'Step 4 — Animation Loop',
          explanation: `\`requestAnimationFrame(animate)\` schedules the next call before the next screen repaint. Calling it inside \`animate\` loops forever at the screen's native refresh rate. \`(performance.now() - t0) / 1000\` gives elapsed time in seconds — independent of frame rate.`,
          code: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setSize(640, 300);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/300, 0.1, 1000);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);
scene.add(new THREE.GridHelper(6,6,0x1a1a2e,0x1a1a2e));
scene.add(new THREE.AxesHelper(2));
var cube = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1),
  new THREE.MeshBasicMaterial({ color: 0x64d8cb })
);
scene.add(cube);
var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;
  cube.rotation.y = t * 0.8;
  cube.rotation.x = t * 0.3;
  renderer.render(scene, camera);
}
animate();`,
        },
      ],
    },

    // ── Cell 4: Coding Challenge 1 ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Two Shapes, Two Colors

Extend the scene below. The starter code gives you a spinning cube. Add:

1. A **sphere** — use \`THREE.SphereGeometry(0.5, 32, 32)\` — place it 2 units to the **right** of the cube (\`position.x = 2\`)
2. A **GridHelper(10, 10)\** to the scene for a reference floor
3. Set the sphere color to \`0xe06c75\` (coral)

When you're done, both shapes should appear side by side, spinning.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 1000);
camera.position.set(0, 2, 7);
camera.lookAt(0, 0, 0);

// ── EXISTING CUBE ─────────────────────────────────────────────────────────────
var cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x64d8cb })
);
cube.position.x = -1;   // shift cube left to make room
scene.add(cube);

// ── YOUR CODE: add a sphere ───────────────────────────────────────────────────
// var sphere = new THREE.Mesh( ... );
// sphere.position.x = 2;
// scene.add(sphere);

// ── YOUR CODE: add a GridHelper ───────────────────────────────────────────────
// scene.add( ... );

// ── RENDER LOOP (given) ───────────────────────────────────────────────────────
var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;
  cube.rotation.y = t;
  // if (sphere) sphere.rotation.y = t;  // uncomment after adding sphere
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 380,
    },

    // ── Cell 5: Coding Challenge 2 ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Oscillating Y Position

Make the cube's Y position oscillate using a sine wave. This requires adding code **inside the animate loop**.

**Requirements:**
- Use \`Math.sin(t)\` where \`t\` is elapsed time in seconds
- Amplitude should be 1.5 units (cube bounces between y = -1.5 and y = +1.5)
- Keep the cube rotating on Y as well

**Hint:** \`object.position.y = amplitude * Math.sin(t * frequency)\`

This is the foundation of animation without delta time — we'll improve it in the Animation Loop lesson.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:#475569;padding:5px;background:#0a0a0f;border-bottom-left-radius:6px;border-bottom-right-radius:6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 1000);
camera.position.set(0, 2, 7);
camera.lookAt(0, 0, 0);

scene.add(new THREE.GridHelper(8, 8, 0x1a1a2e, 0x1a1a2e));
scene.add(new THREE.AxesHelper(2));

var cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x64d8cb })
);
scene.add(cube);

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;

  // Spin the cube
  cube.rotation.y = t * 0.8;

  // ── YOUR CODE: Make cube.position.y oscillate ─────────────────────────────
  // cube.position.y = ???

  renderer.render(scene, camera);
  info.textContent = 'cube.position.y = ' + cube.position.y.toFixed(3);
}
animate();`,
      outputHeight: 390,
    },

    // ── Cell 6: Quiz ─────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You call \`renderer.render(scene, camera)\` but nothing appears. You added a mesh with \`const cube = new THREE.Mesh(geo, mat)\`. What single line is missing?`,
      options: [
        { label: 'A', text: 'cube.visible = true — meshes are invisible by default.' },
        { label: 'B', text: 'scene.add(cube) — objects must be attached to the scene graph before the renderer sees them.' },
        { label: 'C', text: 'renderer.compile(scene, camera) — this must be called once before the first render.' },
        { label: 'D', text: 'cube.geometry.computeVertexNormals() — without this, no faces are rendered.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! scene.add(cube) attaches the cube to the scene tree. The renderer traverses that tree to find renderable objects — if an object is not in the tree, it is completely invisible. meshes default to visible=true. renderer.compile() exists but is only for pre-warming shaders before the first frame — not required.',
      failMessage: 'The answer is B — scene.add(cube). Three.js renders by traversing the scene graph. An object that is not in the graph does not exist as far as the renderer is concerned. There is no invisible-by-default flag, and renderer.compile() is an optional performance tool, not a rendering requirement.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `A camera is created with \`new THREE.PerspectiveCamera(60, 1.78, 0.1, 1000)\`. The window is then resized to a different aspect ratio, but \`camera.aspect\` is never updated. What visual artifact results?`,
      options: [
        { label: 'A', text: 'The scene renders completely black — a wrong aspect ratio crashes the renderer.' },
        { label: 'B', text: 'The scene appears stretched or squashed horizontally — objects that should be round look oval.' },
        { label: 'C', text: 'The far clipping plane moves closer, cutting off distant objects.' },
        { label: 'D', text: 'The field of view doubles, making the scene look zoomed out.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The aspect ratio defines how wide vs tall the frustum is. If the canvas changes shape but camera.aspect stays at 1.78, the projection matrix is wrong and everything appears stretched (or squashed). Fix: in the resize handler, update camera.aspect = newWidth/newHeight, then call camera.updateProjectionMatrix() to recompute the frustum.',
      failMessage: 'The answer is B — the scene appears distorted. The aspect ratio determines the horizontal stretch of the projection frustum. If the window resizes but camera.aspect does not update, the scene will be stretched or squashed. Always update camera.aspect and call camera.updateProjectionMatrix() in your resize handler.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_0_1 }

export default {
  id: 'three-js-2-0-1-first-scene',
  slug: 'your-first-scene',
  chapter: 'three-js-2.0',
  order: 1,
  title: LESSON_3JS2_0_1.title,
  subtitle: LESSON_3JS2_0_1.subtitle,
  tags: ['three-js', 'renderer', 'scene', 'camera', 'perspectivecamera', 'webgl', 'requestAnimationFrame'],
  hook: {
    question: 'Three objects. Zero of them know about the others. Yet together they produce a rendered 3D scene. Which three objects are they — and what exactly does each one do?',
    realWorldContext: 'Every 3D engine from Unreal to Unity to Godot has the same conceptual trinity: a rendering system, a scene container, and a camera. Three.js makes this explicit. Understand these three objects once and you understand the architecture of every real-time renderer.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'WebGLRenderer: talks to the GPU via WebGL, manages the <canvas>, issues draw calls.',
      'Scene: a tree of Object3D nodes — meshes, lights, groups. The renderer traverses it.',
      'PerspectiveCamera: a frustum in 3D space. Defines what is visible and how perspective works.',
      'scene.add(object) is mandatory — objects not in the tree are never rendered.',
      'requestAnimationFrame fires before each screen repaint (~60/sec) — the render loop.',
      'Right-handed coordinates: +X right, +Y up, +Z toward you. Camera looks toward −Z.',
    ],
    callouts: [
      { type: 'important', title: 'scene.add() is not optional', body: 'Creating a Mesh without calling scene.add() means the renderer never sees it. The scene graph IS the render list.' },
      { type: 'warning', title: 'Z-fighting', body: 'Setting camera.near too small (e.g. 0.00001) spreads depth precision so thin that nearby surfaces flicker through each other. Keep near as large as your scene allows.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_0_1.title, props: { lesson: LESSON_3JS2_0_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Holy trinity: WebGLRenderer (GPU bridge) + Scene (object tree) + PerspectiveCamera (viewpoint).',
    'renderer.render(scene, camera) → one frame. In a loop → animation.',
    'PerspectiveCamera(fov, aspect, near, far) — aspect must match canvas size or scene is squashed.',
    'requestAnimationFrame: fires before repaint, pauses when tab hidden, gives high-res timestamp.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
