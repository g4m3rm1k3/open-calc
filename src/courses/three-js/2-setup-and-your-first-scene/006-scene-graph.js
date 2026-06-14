// Three.js 2 · Chapter 2 · Lesson 1
// The Scene Graph — Parent-Child Hierarchy

const LESSON_3JS2_2_1 = {
  title: 'The Scene Graph',
  subtitle: 'How parent-child relationships turn complex motion into simple relative positioning — and why this is the backbone of all 3D software.',
  sequential: true,

  cells: [

    // ── Cell 1: What Is a Scene Graph? ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What Is a Scene Graph?

A **scene graph** is a tree of \`Object3D\` nodes. Every node has a **local transform** (position, rotation, scale). The **world transform** of a node is the product of its own local transform and every ancestor's transform in the chain.

\`\`\`
scene (world root)
├── sun           position: (0,0,0)    rotation.y += 0.01/frame
│   └── earth     position: (10,0,0)   rotation.y += 0.03/frame
│       └── moon  position: (2.5,0,0)  rotation.y += 0.1/frame
└── starfield     position: (0,0,0)
\`\`\`

The Moon's world position is **not** \`(2.5, 0, 0)\`. It is:
\`\`\`
moonWorldPos = sunWorldMatrix × earthLocalMatrix × moonLocalMatrix × (0, 0, 0, 1)
\`\`\`

The Moon automatically orbits the Earth as the Earth orbits the Sun — you never compute absolute world positions manually. The scene graph handles the chain multiplication every frame.

**This pattern appears everywhere in 3D software:**
- **Games:** A sword attached to a character's hand socket
- **CAD/CAM:** A drill bit on a spindle on an XYZ gantry
- **Robotics:** Each joint in an arm is a child of the previous joint
- **Animation:** Bones in a skeleton drive the mesh skin

---

### Object3D — The Base Class

\`Object3D\` is the base class for everything in Three.js that exists in 3D space. \`Mesh\`, \`Light\`, \`Camera\`, \`Group\` — all inherit from it.

Key methods:

\`\`\`js
parent.add(child)               // Attach child; child.parent = parent
parent.remove(child)            // Detach child
object.traverse(fn)             // Depth-first traversal of subtree
object.getWorldPosition(vec)    // Fill vec with world-space position
object.getWorldQuaternion(quat) // Fill quat with world-space rotation
object.localToWorld(vec)        // Convert local point → world space
object.worldToLocal(vec)        // Convert world point → local space
\`\`\`

**\`Group\`** is a special \`Object3D\` with no geometry or lights — it is a pure transform container. Use it to group objects and apply transforms to the group collectively, or as a pivot point for rotation.`,
    },

    // ── Cell 2: The Pivot Pattern ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Pivot Pattern

The most important scene graph technique: **using a Group as a pivot point**.

Consider making a planet orbit the sun. The wrong way:
\`\`\`js
// Wrong: moving by absolute math every frame
earth.position.x = 10 * Math.cos(t);
earth.position.z = 10 * Math.sin(t);
\`\`\`

This works for one planet. But now add a moon that orbits the earth. The moon's position must be computed relative to the earth's constantly-changing world position — the math becomes messy fast.

The right way — the **orbit group pattern**:
\`\`\`js
const earthOrbit = new THREE.Group();
scene.add(earthOrbit);          // Group lives at the origin

const earth = new THREE.Mesh(...);
earth.position.x = 10;          // 10 units from the group centre
earthOrbit.add(earth);          // Earth is a child of the orbit group

// To orbit: just rotate the group
earthOrbit.rotation.y += 0.01;  // Earth traces a circle automatically!
\`\`\`

The Group sits at the orbital centre (the Sun). Rotating the Group sweeps the Earth around it. No trig, no absolute position tracking.

Now add the Moon:
\`\`\`js
const moonOrbit = new THREE.Group();
earth.add(moonOrbit);           // Moon's orbit is centred on Earth

const moon = new THREE.Mesh(...);
moon.position.x = 2.5;          // 2.5 units from Earth
moonOrbit.add(moon);

// Moon orbits earth: rotate moonOrbit
moonOrbit.rotation.y += 0.05;
// Earth orbits sun: rotate earthOrbit
earthOrbit.rotation.y += 0.01;
// Moon automatically follows Earth, which follows the Sun
\`\`\`

The scene graph does all the matrix multiplication. Your animation code is simple rotations.`,
    },

    // ── Cell 3: Solar System Demo ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Solar System — Scene Graph in Action

A complete solar system built with the orbit group pattern. The Moon orbits the Earth which orbits the Sun — all through scene graph parenting, zero manual position math.

Observe in the console: \`scene.traverse\` is used to count every mesh in the hierarchy automatically.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 340);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x04040a);
var camera = new THREE.PerspectiveCamera(60, 640/340, 0.1, 2000);
camera.position.set(0, 18, 40);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// Helper: make a sphere mesh
function makeSphere(radius, color, segments) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments||32, segments||32),
    new THREE.MeshStandardMaterial({ color: color })
  );
}

// ── SUN ──────────────────────────────────────────────────────────────────────
var sunGroup = new THREE.Group();
scene.add(sunGroup);
var sun = makeSphere(2, 0xffcc44);
sun.material.emissive.set(0xff9900);
sun.material.emissiveIntensity = 0.6;
sunGroup.add(sun);
// Sun provides light for the system
var sunLight = new THREE.PointLight(0xfff5cc, 200, 200);
sunGroup.add(sunLight);

// ── EARTH ORBIT ───────────────────────────────────────────────────────────────
// earthOrbit is a Group at the sun's centre.
// Rotating it sweeps Earth in a circle.
var earthOrbit = new THREE.Group();
sunGroup.add(earthOrbit);               // child of the sun group

var earth = makeSphere(0.8, 0x2266cc);
earth.position.x = 10;                 // 10 units from the sun
earthOrbit.add(earth);

// ── MOON ORBIT ────────────────────────────────────────────────────────────────
// moonOrbit is centred on Earth.
var moonOrbit = new THREE.Group();
earth.add(moonOrbit);                   // child of Earth!

var moon = makeSphere(0.25, 0xaaaaaa, 16);
moon.position.x = 2.5;
moonOrbit.add(moon);

// ── MARS ─────────────────────────────────────────────────────────────────────
var marsOrbit = new THREE.Group();
sunGroup.add(marsOrbit);
var mars = makeSphere(0.55, 0xcc4422);
mars.position.x = 16;
marsOrbit.add(mars);

// ── ORBIT RINGS (decorative) ──────────────────────────────────────────────────
function makeRing(r) {
  var g = new THREE.TorusGeometry(r, 0.02, 4, 128);
  var m = new THREE.MeshBasicMaterial({ color: 0x333344 });
  var ring = new THREE.Mesh(g, m);
  ring.rotation.x = Math.PI / 2;
  return ring;
}
sunGroup.add(makeRing(10), makeRing(16));

// ── STARFIELD ─────────────────────────────────────────────────────────────────
var starPositions = new Float32Array(2000 * 3);
for (var i = 0; i < 2000; i++) {
  var r     = 60 + Math.random() * 400;
  var theta = Math.random() * Math.PI * 2;
  var phi   = Math.acos(2 * Math.random() - 1);
  starPositions[i*3+0] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
  starPositions[i*3+2] = r * Math.cos(phi);
}
var starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.4 })));

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;
  sunGroup.rotation.y   = t * 0.05;
  earthOrbit.rotation.y = t * 1.0;
  earth.rotation.y      = t * 3.0;
  moonOrbit.rotation.y  = t * 6.0;
  marsOrbit.rotation.y  = t * 0.53;

  // Read world position of moon (despite being deeply nested)
  var moonWorldPos = new THREE.Vector3();
  moon.getWorldPosition(moonWorldPos);

  info.textContent =
    'earth world pos: (' + earthOrbit.rotation.y.toFixed(2) + ' rad)\n' +
    'moon world pos:  (' + moonWorldPos.x.toFixed(1) + ', ' +
    moonWorldPos.y.toFixed(1) + ', ' + moonWorldPos.z.toFixed(1) + ')';

  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 430,
    },

    // ── Cell 4: Coding Challenge 1 — Robot Arm ───────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Build a 3-Joint Robot Arm

Build a 3-joint robot arm using the scene graph:

1. **Base** (Group at origin) — rotates around Y (waist rotation)
2. **Upper arm** (Box, 0.3 × 1.5 × 0.3) — child of base, positioned at the top of the base, rotates around Z (shoulder)
3. **Forearm** (Box, 0.25 × 1.2 × 0.25) — child of upper arm, positioned at the top of the upper arm, rotates around Z (elbow)
4. **End effector** (small sphere, radius 0.15) — child of forearm, at its tip

Animate each joint with a different sine wave:
\`\`\`js
base.rotation.y = Math.sin(t * 0.5) * Math.PI;          // waist
upperArm.rotation.z = Math.sin(t * 0.8) * 0.8;          // shoulder
forearm.rotation.z  = Math.sin(t * 1.2 + 1) * 1.0;     // elbow
\`\`\`

The end effector traces a complex path through the room even though each joint has simple motion.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 360);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/360, 0.1, 100);
camera.position.set(3, 4, 6);
camera.lookAt(0, 1.5, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position: new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(8, 8, 0x1a1a2e, 0x1a1a2e));
scene.add(new THREE.AxesHelper(2));

var mat = new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness: 0.4 });

// ── YOUR CODE: Build the robot arm ────────────────────────────────────────────
// Step 1: Base group (pivot at origin)
// var base = new THREE.Group();
// scene.add(base);

// Step 2: Upper arm mesh — Box(0.3, 1.5, 0.3)
// var upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.5, 0.3), mat);
// upperArm.position.y = 0.75;   // centre the box (it extends from 0 to 1.5)
// base.add(upperArm);

// Step 3: Forearm — child of upper arm
// (Create a pivot Group at the top of upper arm, then add the forearm mesh to it)
// var elbowPivot = new THREE.Group();
// elbowPivot.position.y = 1.5;   // top of upper arm
// upperArm.add(elbowPivot);
// var forearm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.25), mat.clone());
// forearm.material.color.set(0xf5a623);
// forearm.position.y = 0.6;
// elbowPivot.add(forearm);

// Step 4: End effector sphere
// var effector = new THREE.Mesh(
//   new THREE.SphereGeometry(0.15, 12, 12),
//   new THREE.MeshBasicMaterial({ color: 0xe06c75 })
// );
// effector.position.y = 1.2;
// forearm.add(effector);

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;

  // ── YOUR CODE: Animate the joints ──────────────────────────────────────────
  // if (base)      base.rotation.y      = Math.sin(t * 0.5) * Math.PI;
  // if (upperArm)  upperArm.rotation.z  = Math.sin(t * 0.8) * 0.8;
  // if (elbowPivot)elbowPivot.rotation.z = Math.sin(t * 1.2 + 1) * 1.0;

  renderer.render(scene, camera);

  // Log end effector world position
  var tip = typeof effector !== 'undefined' ? effector : { getWorldPosition: function(v) { v.set(0,0,0); return v; } };
  var wp  = new THREE.Vector3();
  tip.getWorldPosition(wp);
  info.textContent = 'end effector world pos: (' + wp.x.toFixed(2) + ', ' + wp.y.toFixed(2) + ', ' + wp.z.toFixed(2) + ')';
}
animate();`,
      outputHeight: 430,
    },

    // ── Cell 5: Coding Challenge 2 — Traverse ────────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — scene.traverse() & Batch Operations

\`scene.traverse(callback)\` visits every node in the scene tree depth-first. This is the standard way to:
- Collect all meshes in a scene
- Enable/disable shadows on every object
- Apply a material swap to a group

Using the starter code (which has a small hierarchy of objects), write a \`traverse\` call that:
1. Counts all \`Mesh\` objects (use \`obj.isMesh\`)
2. Sets \`castShadow = true\` and \`receiveShadow = true\` on each one
3. Logs the mesh count in the info panel

Then enable shadow mapping on the renderer and add a \`DirectionalLight\` with \`castShadow = true\` to see the shadows appear.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);

// ── YOUR CODE: enable shadow maps ─────────────────────────────────────────────
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 100);
camera.position.set(4, 6, 8);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// ── YOUR CODE: add a shadow-casting DirectionalLight ─────────────────────────
// var dirLight = new THREE.DirectionalLight(0xffffff, 2);
// dirLight.position.set(6, 10, 4);
// dirLight.castShadow = true;
// scene.add(dirLight);

// Build a small hierarchy of objects
var mat  = new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness: 0.5 });
var geo  = new THREE.BoxGeometry(0.8, 0.8, 0.8);

var group1 = new THREE.Group();
scene.add(group1);
for (var i = 0; i < 3; i++) {
  var m = new THREE.Mesh(geo, mat.clone());
  m.position.set(i * 1.5 - 1.5, 0.4, 0);
  group1.add(m);
}

var group2 = new THREE.Group();
scene.add(group2);
for (var j = 0; j < 2; j++) {
  var m2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), mat.clone());
  m2.position.set(j * 2.5 - 1.25, 0.4, -2);
  group2.add(m2);
}

// Ground plane
var ground = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ── YOUR CODE: traverse the scene and batch-enable shadows ────────────────────
var meshCount = 0;
// scene.traverse(function(obj) {
//   if (obj.isMesh) {
//     meshCount++;
//     obj.castShadow    = true;
//     obj.receiveShadow = true;
//   }
// });
info.textContent = 'meshes found: ' + meshCount;

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;
  group1.rotation.y = t * 0.4;
  group2.rotation.y = t * 0.6;
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 400,
    },

    // ── Cell 6: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A Moon is parented to an Earth, which is parented to a Sun Group at the origin. The Moon's \`position.x = 2\`. The Earth's \`position.x = 10\`. The Sun Group has \`rotation.y = Math.PI / 2\`. Approximately where is the Moon in world space?`,
      options: [
        { label: 'A', text: 'At world (12, 0, 0) — positions simply add.' },
        { label: 'B', text: 'At approximately world (0, 0, 12) — the Sun Group rotation sweeps the entire Earth+Moon system 90° around Y.' },
        { label: 'C', text: 'At world (2, 0, 0) — child positions are always relative to world origin.' },
        { label: 'D', text: 'At world (10, 0, 2) — only the Earth position is transformed by rotation, not the Moon.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! The Sun Group rotation rotates the entire subtree. Earth at (10,0,0) after 90° Y rotation maps to approximately (0, 0, -10) in world space (right-hand rule: +X rotates toward -Z). The Moon at (2,0,0) local to Earth maps to approximately (0, 0, -2) in Earth-local → then into world space relative to the Earth\'s world position. The combined result is approximately (0, 0, -12). The key insight: parent transforms affect ALL descendants.',
      failMessage: 'The answer is B. The scene graph multiplies matrices through the chain. The Sun Group rotation of 90° around Y transforms the entire subtree. Earth\'s local (10,0,0) becomes approximately world (0,0,-10). The Moon is then at (2,0,0) relative to Earth — which in world space is approximately (0,0,-12). Parent rotation sweeps all children.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `What is the difference between \`parent.add(child)\` and \`parent.attach(child)\` in Three.js?`,
      options: [
        { label: 'A', text: 'There is no difference — attach() is just an alias for add().' },
        { label: 'B', text: 'attach() preserves the child\'s world position when re-parenting by adjusting its local transform. add() does not — the child jumps in world space.' },
        { label: 'C', text: 'attach() only works for lights and cameras. add() works for all Object3D types.' },
        { label: 'D', text: 'attach() creates a two-way binding — the child can also modify the parent\'s transform.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. add(child) re-parents the child and sets its local transform relative to the new parent — the child\'s world position changes. attach(child) re-parents the child but recalculates its local transform so the world position stays the same. Use attach() when you want to "snap" an object to a new parent without moving it visually — for example, picking up an item in a game (item should stay at its world position when it becomes a child of the player\'s hand).',
      failMessage: 'The answer is B. add(child) simply sets the parent-child relationship — the child\'s local position is interpreted relative to the new parent, so the child appears to jump in world space. attach(child) computes the correct local transform to maintain the child\'s current world position when the parent changes. The typical use case: picking up an object in a game, or transferring a part from one assembly to another in CAD.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_2_1 }

export default {
  id: 'three-js-2-2-1-scene-graph',
  slug: 'scene-graph',
  chapter: 'three-js-2.2',
  order: 1,
  title: LESSON_3JS2_2_1.title,
  subtitle: LESSON_3JS2_2_1.subtitle,
  tags: ['three-js', 'scene-graph', 'object3d', 'group', 'parent-child', 'hierarchy', 'world-matrix', 'traverse'],
  hook: {
    question: 'A moon orbits the Earth which orbits the Sun. The Moon\'s position changes every frame as two bodies move. How do you code this without computing absolute positions manually — and why does a game engine or CAD tool use the same pattern?',
    realWorldContext: 'Scene graphs appear in every 3D engine (Unreal, Unity, Godot), every CAD system (SolidWorks assemblies, Fusion 360), and every robotics stack. The pattern is universal: local transforms chain through a tree, and the engine multiplies matrices automatically.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'A scene graph is a tree of Object3D nodes. Each node has a LOCAL transform.',
      'World transform = product of all ancestor local transforms up to the root.',
      'The GPU uses world transforms — Three.js multiplies the chain automatically.',
      'The orbit group pattern: Group at orbital centre, mesh offset from centre, rotate the Group.',
      'scene.traverse(fn) visits every node depth-first — batch-set castShadow, find meshes, etc.',
      'attach() re-parents while preserving world position. add() does not preserve world position.',
    ],
    callouts: [
      { type: 'insight', title: 'The orbit group pattern', body: 'Place a Group at the orbit centre. Put the planet as a child at the orbital radius. Rotate the Group → the planet orbits automatically. No sin/cos needed for the child. Nesting gives you nested orbits for free.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_2_1.title, props: { lesson: LESSON_3JS2_2_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'worldMatrix = parentWorld × grandparentWorld × ... × localMatrix.',
    'Group = transform-only Object3D. Use it as a pivot or orbit centre.',
    'parent.add(child): child\'s local transform is relative to parent. World position may jump.',
    'object.getWorldPosition(vec) always gives correct world position, even in deep hierarchies.',
    'traverse(fn): depth-first walk — use it to batch-enable shadows, collect meshes, etc.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
