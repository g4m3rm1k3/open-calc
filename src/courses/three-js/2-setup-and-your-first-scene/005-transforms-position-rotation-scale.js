// Three.js 2 · Chapter 2 · Lesson 0
// Transforms — Position, Rotation, Scale & the 4×4 Matrix

const LESSON_3JS2_2_0 = {
  title: 'Transforms — Position, Rotation & Scale',
  subtitle: 'How objects move in 3D space — and the 4×4 matrix that encodes all three transforms simultaneously.',
  sequential: true,

  cells: [

    // ── Cell 1: The Three Transform Properties ────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Every Object3D Has Three Transform Properties

Every object in Three.js (Mesh, Light, Camera, Group…) inherits from \`Object3D\` and has three transform properties:

| Property | Type | Controls |
|----------|------|---------|
| \`position\` | \`Vector3\` | Where the object is in space (translation) |
| \`rotation\` | \`Euler\` | Which way it faces (orientation) |
| \`scale\` | \`Vector3\` | How large it is |

These three properties are combined every frame into a single **4×4 matrix** called the model matrix (also called the local matrix or world matrix). The GPU uses this matrix to transform every vertex from object space into world space.

\`\`\`js
// All three are equivalent:
object.position.x = 3;
object.position.set(3, 0, 0);
object.translateX(3);       // moves along local X axis (respects rotation)

object.rotation.y = Math.PI / 4;   // 45° around Y axis — RADIANS, not degrees
object.rotation.y = THREE.MathUtils.degToRad(45);  // same, via helper

object.scale.set(2, 1, 1);         // twice as wide, same height and depth
object.scale.setScalar(2);         // uniform scale — same in all three axes
\`\`\`

---

### Why Radians?

Three.js uses **radians** everywhere for rotation. Radians are the natural unit of angle: one radian is the angle subtended by an arc equal to the radius. There are 2π ≈ 6.28 radians in a full circle.

| Degrees | Radians | Expression |
|---------|---------|-----------|
| 90° | π/2 ≈ 1.571 | \`Math.PI / 2\` |
| 180° | π ≈ 3.14 | \`Math.PI\` |
| 270° | 3π/2 ≈ 4.71 | \`Math.PI * 1.5\` |
| 360° | 2π ≈ 6.28 | \`Math.PI * 2\` |

Radians simplify the math: arc length = radius × angle in radians. Angular velocity in rad/s integrates cleanly to position. Always store angles in radians internally and convert to degrees only for display.`,
    },

    // ── Cell 2: The 4×4 Matrix ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Transform Matrix — Why 4×4?

You might expect 3D transforms to need a 3×3 matrix. But **translation cannot be expressed as a 3×3 matrix multiplication** — you'd need addition, which breaks the composable pipeline.

The solution: **homogeneous coordinates**. Add a 4th component \`w\` to every position: \`(x, y, z, w)\` where \`w = 1\` for points and \`w = 0\` for direction vectors. A 4×4 matrix can then encode all three transform types as pure multiplication:

\`\`\`
Translation by (tx, ty, tz):     Rotation around Y by θ:
┌ 1  0  0  tx ┐               ┌  cos θ  0  sin θ  0 ┐
│ 0  1  0  ty │               │  0      1  0      0 │
│ 0  0  1  tz │               │ -sin θ  0  cos θ  0 │
└ 0  0  0  1  ┘               └  0      0  0      1 ┘

Scale by (sx, sy, sz):
┌ sx  0   0   0 ┐
│  0  sy  0   0 │
│  0   0  sz  0 │
└  0   0   0  1 ┘
\`\`\`

Three.js computes \`object.matrix\` from position/rotation/scale automatically before each render. You rarely touch the matrix directly — but you should know it is always there.

\`\`\`js
// Force matrix recompute and read it:
object.updateMatrix();
console.log(object.matrix.elements);  // Float32Array, 16 values, column-major

// Decompose a matrix back to position/quat/scale:
const pos  = new THREE.Vector3();
const quat = new THREE.Quaternion();
const scl  = new THREE.Vector3();
object.matrixWorld.decompose(pos, quat, scl);
\`\`\`

**Column-major order:** Three.js (following OpenGL convention) stores matrices with columns first. If you write a 4×4 matrix on paper in row-major order, the \`.elements\` array reads down each column. This matters when you pass matrix data to custom shaders.

---

### Euler Angles & Gimbal Lock

\`object.rotation\` is an \`Euler\` object — three angles applied in a specific order (default: 'XYZ'). Euler angles are intuitive but have a critical flaw: **gimbal lock** — when two rotation axes align, you lose a degree of freedom. This happened to Apollo 13's navigation system.

The fix: **quaternions** (covered in §8). For most visual scenes, Euler is fine. For cameras that orbit freely or robot arms that rotate through large angles, use quaternions.`,
    },

    // ── Cell 3: Interactive Transform Demo ───────────────────────────────────
    {
      type: 'js',
      instruction: `### Interactive Transform Playground

Three cubes demonstrate position, rotation, and scale transforms. Use the sliders to modify transforms in real-time and see the matrix update live.

- **Cyan** — position changes (translating along X)
- **Orange** — rotation changes (rotating around Y)
- **Red** — scale changes (non-uniform scaling)`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
  <label style="font-family:monospace;font-size:10px;color:#64d8cb">Position X: <span id="pxv">0</span>
    <input id="px" type="range" min="-3" max="3" step="0.1" value="0" style="width:100%;accent-color:#64d8cb"></label>
  <label style="font-family:monospace;font-size:10px;color:#f5a623">Rotation Y: <span id="ryv">0°</span>
    <input id="ry" type="range" min="0" max="360" step="1" value="0" style="width:100%;accent-color:#f5a623"></label>
  <label style="font-family:monospace;font-size:10px;color:#e06c75">Scale X: <span id="sxv">1</span>
    <input id="sx" type="range" min="0.2" max="3" step="0.1" value="1" style="width:100%;accent-color:#e06c75"></label>
</div>
<canvas id="cv" style="display:block;border-radius:0 0 6px 6px"></canvas>
<div id="info" style="font-family:monospace;font-size:9px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 300);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/300, 0.1, 100);
camera.position.set(0, 3, 9);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
var dLight = new THREE.DirectionalLight(0xffffff, 2);
dLight.position.set(5, 8, 5);
scene.add(dLight);
scene.add(new THREE.GridHelper(10, 10, 0x1a1a2e, 0x1a1a2e));
scene.add(new THREE.AxesHelper(3));

var geo = new THREE.BoxGeometry(1, 1, 1);

// Three cubes, each demonstrating one transform type
var cubePos = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness:0.4 }));
var cubeRot = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xf5a623, roughness:0.4 }));
var cubeScl = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xe06c75, roughness:0.4 }));

cubePos.position.set(-3, 0.5, 0);
cubeRot.position.set( 0, 0.5, 0);
cubeScl.position.set( 3, 0.5, 0);

scene.add(cubePos, cubeRot, cubeScl);

document.getElementById('px').oninput = function() {
  var v = parseFloat(this.value);
  document.getElementById('pxv').textContent = v.toFixed(1);
  cubePos.position.x = -3 + v;
};
document.getElementById('ry').oninput = function() {
  var deg = parseFloat(this.value);
  document.getElementById('ryv').textContent = deg + '°';
  cubeRot.rotation.y = THREE.MathUtils.degToRad(deg);
};
document.getElementById('sx').oninput = function() {
  var v = parseFloat(this.value);
  document.getElementById('sxv').textContent = v.toFixed(1);
  cubeScl.scale.x = v;
};

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  // Show the model matrix of the rotation cube
  cubeRot.updateMatrix();
  var m = cubeRot.matrix.elements;
  info.textContent = 'cubeRot.matrix (col-major):\n' +
    '[' + m[0].toFixed(2) + ' ' + m[4].toFixed(2) + ' ' + m[8].toFixed(2)  + ' ' + m[12].toFixed(2) + ']\n' +
    '[' + m[1].toFixed(2) + ' ' + m[5].toFixed(2) + ' ' + m[9].toFixed(2)  + ' ' + m[13].toFixed(2) + ']\n' +
    '[' + m[2].toFixed(2) + ' ' + m[6].toFixed(2) + ' ' + m[10].toFixed(2) + ' ' + m[14].toFixed(2) + ']\n' +
    '[' + m[3].toFixed(2) + ' ' + m[7].toFixed(2) + ' ' + m[11].toFixed(2) + ' ' + m[15].toFixed(2) + ']';
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 460,
    },

    // ── Cell 4: Local vs World Space ──────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Local Space vs World Space

Every object has two coordinate spaces:

**Local space** (object space): The coordinate system centred on the object itself. The object's own origin, orientation, and scale define this space. A cube at the origin, axis-aligned — its local +X points right, local +Y points up.

**World space**: The global coordinate system shared by all objects.

When you set \`object.position.x = 3\`, you are moving the object's local origin to \`x = 3\` in world space. When you set \`object.rotation.y = Math.PI / 4\`, you are rotating the object's local axes 45° around world Y.

The **model matrix** transforms from local space to world space:
\`\`\`
worldPosition = modelMatrix × localPosition
\`\`\`

For nested objects (parented to another object), the world matrix is the full chain:
\`\`\`
worldMatrix = grandparentMatrix × parentMatrix × localMatrix
\`\`\`

Three.js computes this chain automatically — this is the scene graph (next lesson).

**Useful utilities:**
\`\`\`js
// Get world position (even for nested objects):
const worldPos = new THREE.Vector3();
object.getWorldPosition(worldPos);

// Convert from local to world coords:
const worldPt = object.localToWorld(new THREE.Vector3(1, 0, 0));

// Convert from world to local coords:
const localPt = object.worldToLocal(someWorldPoint.clone());
\`\`\`

> **CAD/CAM Note:** This distinction is critical in CAD. A bolt on a machine part lives in the bolt's local space. The part lives in assembly space. The assembly lives in world space. The bolt's world position = assemblyMatrix × partMatrix × boltMatrix × localOrigin. This is the scene graph — next lesson.`,
    },

    // ── Cell 5: Coding Challenge 1 — Orbital Motion ──────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Circular Orbit Using Parametric Position

Make the orange cube orbit the origin in a circle on the XZ plane using parametric equations. The circular orbit formula is:

\`\`\`
x(t) = radius * Math.cos(t * speed)
z(t) = radius * Math.sin(t * speed)
\`\`\`

Requirements:
- Orbital radius: 3 units
- Orbital speed: 0.8 radians/second
- The cube should also spin on its own Y axis (rotation.y += 1.0 * dt — use a proper dt approximation)
- Add a small "sun" sphere at the origin for visual reference

The starter code has the scene set up. Add the orbital logic inside the animate loop.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 100);
camera.position.set(0, 6, 10);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position: new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(12, 12, 0x1a1a2e, 0x1a1a2e));

// Sun at origin
var sun = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffcc44 })
);
scene.add(sun);

// Orbiting cube
var orbiter = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xf5a623, roughness: 0.4 })
);
scene.add(orbiter);

var RADIUS = 3;
var SPEED  = 0.8;  // radians per second

var t0   = performance.now();
var prev = t0;
function animate() {
  requestAnimationFrame(animate);
  var now = performance.now();
  var t   = (now - t0) / 1000;
  var dt  = Math.min((now - prev) / 1000, 0.05);
  prev    = now;

  // ── YOUR CODE: set orbiter.position.x and orbiter.position.z ──────────────
  // orbiter.position.x = RADIUS * Math.cos(t * SPEED);
  // orbiter.position.z = RADIUS * Math.sin(t * SPEED);

  // ── YOUR CODE: spin orbiter on its own Y axis ─────────────────────────────
  // orbiter.rotation.y += 1.0 * dt;

  renderer.render(scene, camera);
  info.textContent = 'orbiter pos: (' + orbiter.position.x.toFixed(2) + ', ' +
    orbiter.position.y.toFixed(2) + ', ' + orbiter.position.z.toFixed(2) + ')';
}
animate();`,
      outputHeight: 390,
    },

    // ── Cell 6: Coding Challenge 2 — Lissajous Figure ────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Lissajous Motion

A **Lissajous figure** is traced by combining sine waves with different frequencies on different axes. It's used in oscilloscope patterns and mechanical linkage design.

Make the red cube trace a Lissajous curve in 3D:
\`\`\`
x(t) = 3 * Math.sin(3 * t)
y(t) = 1.5 * Math.sin(t)
z(t) = 3 * Math.sin(2 * t)
\`\`\`

Also make it "breathe" — scale uniformly between 0.5 and 1.5 using another sine wave with a different frequency:
\`\`\`
scale(t) = 1.0 + 0.5 * Math.sin(t * 2.5)
object.scale.setScalar(scale)
\`\`\``,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(55, 640/320, 0.1, 100);
camera.position.set(5, 5, 10);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position: new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(10, 10, 0x1a1a2e, 0x1a1a2e));
scene.add(new THREE.AxesHelper(4));

var lissajous = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.6, 0.6),
  new THREE.MeshStandardMaterial({ color: 0xe06c75, roughness: 0.3 })
);
scene.add(lissajous);

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;

  // ── YOUR CODE: Lissajous position ──────────────────────────────────────────
  // lissajous.position.x = 3 * Math.sin(3 * t);
  // lissajous.position.y = 1.5 * Math.sin(t);
  // lissajous.position.z = 3 * Math.sin(2 * t);

  // ── YOUR CODE: Breathing scale ─────────────────────────────────────────────
  // lissajous.scale.setScalar(1.0 + 0.5 * Math.sin(t * 2.5));

  renderer.render(scene, camera);
  info.textContent =
    'pos: (' + lissajous.position.x.toFixed(2) + ', ' +
    lissajous.position.y.toFixed(2) + ', ' +
    lissajous.position.z.toFixed(2) + ')  ' +
    'scale: ' + lissajous.scale.x.toFixed(2);
}
animate();`,
      outputHeight: 390,
    },

    // ── Cell 7: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You apply \`object.rotation.y = Math.PI / 2\` (90°) to a mesh, then call \`object.translateX(3)\`. Where does the object end up relative to its original position?`,
      options: [
        { label: 'A', text: 'At (3, 0, 0) — translateX always moves along world X regardless of rotation.' },
        { label: 'B', text: 'At (0, 0, -3) — translateX moves along the object\'s LOCAL X axis, which (after 90° Y rotation) now points toward world -Z.' },
        { label: 'C', text: 'At (3, 0, 3) — rotation and translation combine additively.' },
        { label: 'D', text: 'At (0, 0, 3) — translateX moves along the object\'s local X, which (after 90° Y rotation) points toward world +Z.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! translateX moves along the object\'s LOCAL X axis. After rotating 90° around Y, the local +X axis points in the direction of world -Z. So the object moves to (0, 0, -3) in world space. This is different from object.position.x += 3, which always moves in world X. Understanding local vs world space is critical for building robot arms, cameras that strafe, and scene graph hierarchies.',
      failMessage: 'The answer is B. translateX(n) moves n units along the object\'s LOCAL X axis — not world X. After rotating 90° around Y, the local +X axis (which originally pointed right = world +X) now points toward world -Z. So translateX(3) moves the object to world (0,0,-3). If you want world-axis movement, use object.position.x += 3 directly.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `What causes gimbal lock in Euler angle rotation, and when does it actually occur?`,
      options: [
        { label: 'A', text: 'Gimbal lock occurs when an object rotates faster than 60 fps — the browser cannot compute the interpolation correctly.' },
        { label: 'B', text: 'Gimbal lock occurs when using radians instead of degrees — switching to degrees prevents it.' },
        { label: 'C', text: 'Gimbal lock occurs in XYZ Euler order when the Y rotation reaches ±90° — the X and Z axes align, causing a loss of one degree of freedom and making rotation in one direction impossible.' },
        { label: 'D', text: 'Gimbal lock occurs when two meshes have the same position — they interfere with each other\'s rotation.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. In Euler XYZ order, rotating 90° around Y causes the X and Z rotation axes to become parallel (aligned). You now have only 2 independent axes instead of 3 — you\'ve lost the ability to rotate in one direction. The solution is quaternions, which represent rotations without this degeneracy. quaternion.setFromEuler() converts Euler angles to quaternion before the problem occurs.',
      failMessage: 'The answer is C. Gimbal lock is a structural problem with Euler angles: rotating 90° around the middle axis (Y in XYZ order) causes the first and third axes to align, losing a degree of freedom. This is not a speed or precision problem — it is an inherent limitation of representing 3D rotation as three sequential angles. The solution is quaternions, which represent rotations as a 4-component number without this degeneracy.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_2_0 }

export default {
  id: 'three-js-2-2-0-transforms',
  slug: 'transforms-position-rotation-scale',
  chapter: 'three-js-2.2',
  order: 0,
  title: LESSON_3JS2_2_0.title,
  subtitle: LESSON_3JS2_2_0.subtitle,
  tags: ['three-js', 'transforms', 'position', 'rotation', 'scale', 'matrix4', 'euler', 'gimbal-lock', 'radians'],
  hook: {
    question: 'position, rotation, and scale are three separate properties. But the GPU only knows one thing: a 4×4 matrix. How do three properties become one matrix — and why does the matrix have to be 4×4 and not 3×3?',
    realWorldContext: 'Every 3D object in every engine is ultimately described by a 4×4 transform matrix. Understanding this matrix — and why translation requires homogeneous coordinates — is the foundation of the entire rendering pipeline.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Three.js Object3D has: position (Vector3), rotation (Euler), scale (Vector3).',
      'These three combine into one 4×4 modelMatrix — the GPU uses this, not the separate properties.',
      'Why 4×4? Translation cannot be a 3×3 matrix multiplication. Homogeneous coordinates (w=1 for points) solve this.',
      'Euler angles are intuitive but have gimbal lock: rotating 90° around Y aligns X and Z axes, losing a DOF.',
      'Quaternions avoid gimbal lock — covered in the Math lesson.',
      'translateX(n) moves along LOCAL axis. position.x += n moves along WORLD axis.',
    ],
    callouts: [
      { type: 'warning', title: 'Radians, not degrees', body: 'rotation.y = Math.PI / 2 means 90°. There is no degToRad needed if you write rotations as multiples of Math.PI. Use THREE.MathUtils.degToRad() only for display-input conversion.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_2_0.title, props: { lesson: LESSON_3JS2_2_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'modelMatrix = T × R × S — translation × rotation × scale, computed from the three properties.',
    '4×4 because homogeneous coords allow translation as matrix multiplication: (x,y,z,1) × M.',
    'Euler.XYZ: X applied first, then Y around new axes, then Z. Gimbal lock at Y=±90°.',
    'Local vs world: position.x = world translation. translateX() = local-axis movement.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
