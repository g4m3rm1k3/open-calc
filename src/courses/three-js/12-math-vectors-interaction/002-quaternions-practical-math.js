// Three.js 2 · Chapter 4 · Lesson 1
// Quaternions & Practical 3D Math

const LESSON_3JS2_4_1 = {
  title: 'Quaternions & Practical 3D Math',
  subtitle: 'Quaternion rotation without gimbal lock, slerp, planes, AABBs, and spherical coordinates — the toolkit for CAD geometry.',
  sequential: true,

  cells: [

    // ── Cell 1: Quaternions ───────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Quaternions — Rotation Without Gimbal Lock

A quaternion \`(x, y, z, w)\` represents a 3D rotation. It encodes "rotate by angle θ around axis (ax, ay, az)" as:
\`\`\`
q = (ax·sin(θ/2),  ay·sin(θ/2),  az·sin(θ/2),  cos(θ/2))
\`\`\`

You almost never need to construct quaternions this way. Use the API instead:

\`\`\`js
// ── CREATE ────────────────────────────────────────────────────────────────────
const q1 = new THREE.Quaternion();               // identity (no rotation)

// From axis + angle:
const q2 = new THREE.Quaternion()
  .setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);  // 45° around Y

// From Euler angles (converts internally, avoids gimbal lock storage):
const q3 = new THREE.Quaternion()
  .setFromEuler(new THREE.Euler(0, Math.PI / 3, 0));

// ── APPLY TO OBJECT ───────────────────────────────────────────────────────────
mesh.quaternion.copy(q2);        // set object's rotation to q2
mesh.quaternion.multiply(q2);    // compose: apply q2 ON TOP of current rotation

// ── SLERP — SPHERICAL LINEAR INTERPOLATION ────────────────────────────────────
// Interpolate smoothly between two rotations.
// Slerp travels along the shortest arc on the unit quaternion "sphere."
// The rotation equivalent of lerp for positions.
const qStart = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
const qEnd   = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));

// At t=0.5, the object is halfway through a 180° rotation around Y:
const qMid = qStart.clone().slerp(qEnd, 0.5);
mesh.quaternion.copy(qMid);

// ── USEFUL FACTS ──────────────────────────────────────────────────────────────
// - Quaternions have no gimbal lock (4 components span the full rotation space)
// - They're compact (4 floats) and numerically stable
// - Convert to/from Euler:  quaternion.setFromEuler() / euler.setFromQuaternion()
// - Convert to/from Matrix: quaternion.setFromRotationMatrix() / matrix.makeRotationFromQuaternion()
// - Object3D.quaternion is the canonical rotation store — Object3D.rotation (Euler)
//   is derived from it, not the other way around
\`\`\`

**Why quaternions avoid gimbal lock:**
Euler angles represent rotation as three sequential turns. When one turn aligns two axes, you lose a degree of freedom. Quaternions represent the full rotation as a single 4D unit vector — there is no sequential ordering and no alignment problem.

**When to use quaternions directly:**
- Camera that orbits freely through any angle
- Robot arms with continuous rotation
- Blending between animation keyframes
- Any time an object rotates through large angles without a preferred "up"`,
    },

    // ── Cell 2: Practical CAD Math ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Practical 3D Math — CAD Toolkit

**Planes** (\`THREE.Plane\`):

A plane is defined by a normal and a constant: \`ax + by + cz + d = 0\`. Three.js stores it as \`(normal, constant)\`.

\`\`\`js
const plane = new THREE.Plane();
plane.setFromNormalAndCoplanarPoint(
  new THREE.Vector3(0, 1, 0),   // normal pointing up
  new THREE.Vector3(0, 0, 0)    // origin is on the plane
);

// Signed distance from a point:
const dist = plane.distanceToPoint(new THREE.Vector3(3, 5, 1));  // → 5

// Project a point onto the plane:
const projected = plane.projectPoint(new THREE.Vector3(3, 5, 1), new THREE.Vector3());
// → Vector3(3, 0, 1)  — drops it to y=0

// Ray-plane intersection:
const ray = new THREE.Ray(new THREE.Vector3(0, 10, 0), new THREE.Vector3(0, -1, 0));
const hit = new THREE.Vector3();
ray.intersectPlane(plane, hit);  // → Vector3(0, 0, 0)
\`\`\`

**AABBs — Axis-Aligned Bounding Boxes** (\`THREE.Box3\`):

\`\`\`js
// AABB from a mesh:
const bbox = new THREE.Box3().setFromObject(mesh);
bbox.getCenter(centreVec);
bbox.getSize(sizeVec);
bbox.containsPoint(queryPoint);
bbox.intersectsBox(otherBox);     // broad-phase collision check
bbox.intersectsSphere(sphere);
\`\`\`

**Spherical Coordinates** (\`THREE.Spherical\`):

\`\`\`js
// Useful for: placing objects on sphere surfaces, geographic coordinates
const sph = new THREE.Spherical(
  5,              // radius
  Math.PI / 4,    // phi (polar angle from Y axis: 0 = north pole, PI = south)
  Math.PI / 3     // theta (azimuthal angle around Y)
);
const cartesian = new THREE.Vector3().setFromSpherical(sph);
// → approximately (3.06, 3.54, 1.77)
\`\`\`

**setFromUnitVectors** — "point this object toward a target":
\`\`\`js
// The most useful quaternion factory for 3D animation:
// Compute rotation that takes vector 'from' to vector 'to'
const from   = new THREE.Vector3(0, 1, 0);   // object's default "up" direction
const to     = targetPos.clone().sub(objectPos).normalize();
const quat   = new THREE.Quaternion().setFromUnitVectors(from, to);
object.quaternion.copy(quat);   // now 'object' points toward the target
\`\`\``,
    },

    // ── Cell 3: Quaternion Slerp Demo ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Slerp Rotation Demo

The cube sliders between two orientations (Pose A ↔ Pose B) using quaternion slerp. Toggle Euler lerp vs Slerp to see the difference — Euler lerp on large rotations takes the "wrong" path and can produce flips.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
  <button id="btn-go" style="padding:5px 16px;border-radius:6px;border:none;background:#1d4ed8;color:#fff;font-family:monospace;font-size:11px;cursor:pointer">▶ Slerp to B</button>
  <label style="font-family:monospace;font-size:10px;color:#94a3b8">t: <span id="tv">0.00</span>
    <input id="sl" type="range" min="0" max="1" step="0.01" value="0" style="width:140px;accent-color:#64d8cb">
  </label>
</div>
<canvas id="cv" style="display:block;border-radius:0 0 6px 6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 100);
camera.position.set(0, 2, 6);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,8,5)}));
scene.add(new THREE.AxesHelper(2));

var cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness: 0.3 })
);
scene.add(cube);

// Ghost cubes showing the two pose targets
function makeGhost(color) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(1.2,1.2,1.2),
    new THREE.MeshBasicMaterial({ color: color, wireframe: true, opacity:0.4, transparent:true })
  );
}
var ghostA = makeGhost(0x4488cc);
var ghostB = makeGhost(0xcc4488);
scene.add(ghostA, ghostB);
ghostA.position.x = -2;
ghostB.position.x =  2;

// Pose A and Pose B as quaternions
var qA = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
var qB = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/3, Math.PI*0.8, Math.PI/4));

ghostA.quaternion.copy(qA);
ghostB.quaternion.copy(qB);

var sliderT = 0;
document.getElementById('sl').oninput = function() {
  sliderT = parseFloat(this.value);
};

var animTarget = 0;
var animT = 0;
var animating = false;
document.getElementById('btn-go').onclick = function() {
  animTarget = animTarget < 0.5 ? 1 : 0;
  animating = true;
};

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);

  if (animating) {
    animT = animT + (animTarget - animT) * Math.min(1, dt * 3);
    if (Math.abs(animT - animTarget) < 0.001) { animT = animTarget; animating = false; }
    document.getElementById('sl').value = animT;
    sliderT = animT;
  }

  // Slerp between pose A and pose B
  var q = qA.clone().slerp(qB, sliderT);
  cube.quaternion.copy(q);

  document.getElementById('tv').textContent = sliderT.toFixed(2);

  var e = new THREE.Euler().setFromQuaternion(q);
  info.textContent =
    't = ' + sliderT.toFixed(3) + '\n' +
    'q = (' + q.x.toFixed(3)+', '+q.y.toFixed(3)+', '+q.z.toFixed(3)+', '+q.w.toFixed(3) + ')\n' +
    'euler = (' + (e.x*180/Math.PI).toFixed(1)+'°, '+(e.y*180/Math.PI).toFixed(1)+'°, '+(e.z*180/Math.PI).toFixed(1)+'°)';

  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 450,
    },

    // ── Cell 4: Coding Challenge 1 — lookAt Quaternion ───────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Point a Cone at a Moving Target

Use \`quaternion.setFromUnitVectors(from, to)\` to make a cone always point toward an animated sphere.

Setup:
- A cone with the tip pointing up (+Y) — this is its default "forward" direction
- A target sphere moving in a circle
- Each frame: compute the direction from cone to target, normalise it, use \`setFromUnitVectors\` to compute the rotation

\`\`\`js
// Each frame:
var direction = target.position.clone().sub(cone.position).normalize();
cone.quaternion.setFromUnitVectors(
  new THREE.Vector3(0, 1, 0),  // cone's default "up" (tip direction)
  direction                     // direction toward target
);
\`\`\`

The cone should continuously track the orbiting target sphere.`,
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
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(10,10,0x1a1a2e,0x1a1a2e));

// Cone — tip points up by default (ConeGeometry opens downward, tip at +Y)
var cone = new THREE.Mesh(
  new THREE.ConeGeometry(0.3, 1.2, 16),
  new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness: 0.4 })
);
cone.position.set(0, 0.6, 0);
scene.add(cone);

// Target sphere (orbits)
var targetSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.25, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xf5a623 })
);
scene.add(targetSphere);

var coneDefault = new THREE.Vector3(0, 1, 0);  // cone's natural "tip" direction

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();

  // Animate target
  targetSphere.position.set(
    Math.cos(t) * 3.5,
    1.5 + Math.sin(t * 1.3) * 1.5,
    Math.sin(t) * 3.5
  );

  // ── YOUR CODE: point cone toward target ───────────────────────────────────
  // var dir = targetSphere.position.clone().sub(cone.position).normalize();
  // cone.quaternion.setFromUnitVectors(coneDefault, dir);

  renderer.render(scene, camera);
  info.textContent = 'target: (' + targetSphere.position.x.toFixed(2)+', '+
    targetSphere.position.y.toFixed(2)+', '+targetSphere.position.z.toFixed(2)+')';
}
animate();`,
      outputHeight: 400,
    },

    // ── Cell 5: Coding Challenge 2 — AABB Collision ──────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — AABB Broad-Phase Collision Detection

Create 8 spheres flying in random orbits. Each frame, perform **broad-phase collision detection**: check every pair of spheres using \`Box3.intersectsBox()\`. When two bounding boxes overlap, colour both spheres red.

This is the first stage of all physics engines — a fast, cheap test to eliminate pairs that cannot possibly be colliding before doing expensive exact tests.

Steps:
1. Each sphere has a \`Box3\` bounding box updated via \`box.setFromObject(mesh)\`
2. For each pair (i, j where j > i): check \`boxes[i].intersectsBox(boxes[j])\`
3. If overlapping: set both materials' colour to \`0xe06c75\` (red)
4. If not: set to original colour

Display the collision pair count in the info panel.`,
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
camera.position.set(0, 5, 12);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(12,12,0x1a1a2e,0x1a1a2e));

var BASE_COLOR = 0x64d8cb;
var HIT_COLOR  = 0xe06c75;

// Create 8 spheres with random orbits
var spheres = [];
var boxes   = [];
for (var i = 0; i < 8; i++) {
  var mat = new THREE.MeshStandardMaterial({ color: BASE_COLOR, roughness: 0.4 });
  var mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), mat);
  mesh.userData.baseAngle = Math.random() * Math.PI * 2;
  mesh.userData.radius    = 2.5 + Math.random() * 2;
  mesh.userData.speed     = 0.3 + Math.random() * 0.5;
  mesh.userData.yPhase    = Math.random() * Math.PI * 2;
  scene.add(mesh);
  spheres.push(mesh);
  boxes.push(new THREE.Box3());
}

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();

  // Update sphere positions
  spheres.forEach(function(s) {
    var angle = s.userData.baseAngle + t * s.userData.speed;
    s.position.set(
      Math.cos(angle) * s.userData.radius,
      Math.sin(t * 0.7 + s.userData.yPhase) * 1.2,
      Math.sin(angle) * s.userData.radius
    );
    // Reset colour
    s.material.color.setHex(BASE_COLOR);
  });

  // ── YOUR CODE: update AABBs ────────────────────────────────────────────────
  // spheres.forEach(function(s, i) {
  //   boxes[i].setFromObject(s);
  // });

  // ── YOUR CODE: check all pairs for collision ───────────────────────────────
  var collisions = 0;
  // for (var i = 0; i < spheres.length; i++) {
  //   for (var j = i + 1; j < spheres.length; j++) {
  //     if (boxes[i].intersectsBox(boxes[j])) {
  //       collisions++;
  //       spheres[i].material.color.setHex(HIT_COLOR);
  //       spheres[j].material.color.setHex(HIT_COLOR);
  //     }
  //   }
  // }

  renderer.render(scene, camera);
  info.textContent = 'Collision pairs: ' + collisions + ' / ' + (spheres.length * (spheres.length-1) / 2) + ' checks';
}
animate();`,
      outputHeight: 400,
    },

    // ── Cell 6: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Why is \`quaternion.slerp()\` preferred over \`euler.lerp()\` when interpolating between two large rotations?`,
      options: [
        { label: 'A', text: 'Slerp is faster to compute than Euler lerp because it uses fewer floating-point operations.' },
        { label: 'B', text: 'Slerp interpolates along the shortest arc on the unit quaternion sphere, producing smooth constant-speed rotation. Euler lerp interpolates each angle independently, which can cause the object to take a longer path, change speed mid-transition, or flip unexpectedly.' },
        { label: 'C', text: 'Euler lerp fails entirely for angles greater than 180° — the animation stops at 180° and reverses.' },
        { label: 'D', text: 'Slerp works in all browsers, while Euler lerp requires WebGL 2.0 support.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Slerp (Spherical Linear Interpolation) moves along the shortest arc between two unit quaternions at constant angular speed. Euler lerp independently interpolates x, y, z angles — this does not correspond to the shortest rotation path in 3D, can change speed through the transition, and can produce gimbal-lock artifacts or unexpected flips near ±90° values. For smooth rotation animation, always slerp quaternions.',
      failMessage: 'The answer is B. Slerp computes the shortest arc between two orientations at constant angular velocity. Euler lerp interpolates three angles independently — the resulting path is not the shortest rotation, the angular speed is not constant, and near gimbal-lock angles you can get unexpected flips. Euler lerp is fine for tiny rotations; for large rotations (90°+), always use quaternion slerp.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_4_1 }

export default {
  id: 'three-js-2-4-1-quaternions-math',
  slug: 'quaternions-practical-math',
  chapter: 'three-js-2.4',
  order: 1,
  title: LESSON_3JS2_4_1.title,
  subtitle: LESSON_3JS2_4_1.subtitle,
  tags: ['three-js', 'quaternion', 'slerp', 'gimbal-lock', 'planes', 'box3', 'aabb', 'spherical', 'cad-math'],
  hook: {
    question: 'Apollo 13\'s navigation system locked up at 90° of rotation. Quaternions were invented precisely to prevent this. What is gimbal lock physically — and why do quaternions avoid it where Euler angles cannot?',
    realWorldContext: 'Quaternion slerp is how every game engine and animation system blends between rotations. AABB broad-phase collision detection (Box3.intersectsBox) is the first stage of every physics engine. These are not advanced topics — they are fundamental tools.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Quaternion (x,y,z,w): 4D unit vector encoding axis-angle rotation without gimbal lock.',
      'slerp(qEnd, t): shortest-arc interpolation at constant angular speed. Always use this, not Euler lerp.',
      'setFromUnitVectors(from, to): compute rotation that aligns vector "from" to vector "to". Powers lookAt.',
      'THREE.Plane: (normal, constant). distanceToPoint(), projectPoint(), intersectPlane() — core CAD tools.',
      'Box3: AABB from Object3D. intersectsBox() = broad-phase collision check. setFromObject() auto-computes.',
      'Spherical coords: (r, phi, theta) → Cartesian via setFromSpherical(). For orbit cameras and globes.',
    ],
    callouts: [
      { type: 'insight', title: 'Why slerp not lerp?', body: 'Lerp on Euler angles takes a non-shortest path and changes speed mid-rotation. Slerp on quaternions always takes the shortest arc at constant speed. For any rotation > a few degrees, use slerp.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_4_1.title, props: { lesson: LESSON_3JS2_4_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Quaternion = axis-angle without sequential ordering = no gimbal lock.',
    'slerp: constant-speed shortest-arc rotation interpolation. Never use Euler lerp for large rotations.',
    'setFromUnitVectors(from, to): the most useful quaternion factory — makes objects track targets.',
    'Box3.setFromObject(mesh) + intersectsBox(other) = fast broad-phase collision.',
    'Plane.distanceToPoint() = signed distance. Positive = same side as normal.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Quaternion = axis-angle without sequential ordering = no gimbal lock." Why does sequential Euler ordering cause gimbal lock but quaternions do not?',
      options: [
        'Quaternions use more bits, making precision errors impossible',
        'Euler angles apply rotations in sequence — the second rotation operates on the already-rotated axes, which can align two axes. Quaternions represent a single rotation in 4D space with no intermediate axis dependencies',
        'Quaternions always clamp to ±90° on each axis',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"slerp: constant-speed shortest-arc rotation interpolation." You animate a camera from facing North to facing South using Euler lerp at t=0.5. What may look wrong?',
      options: [
        'The camera snaps instead of smoothly rotating',
        'Euler lerp interpolates each angle independently — it can take a longer path or flip unexpectedly. Slerp follows the true shortest arc through 3D orientation space',
        'Lerp is too fast compared to slerp',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"setFromUnitVectors(from, to): the most useful quaternion factory." An arrow mesh points along +Y by default. You want it to point at a target. What are the arguments?',
      options: [
        'setFromUnitVectors(target.normalize(), new Vector3(0,1,0))',
        'setFromUnitVectors(new Vector3(0,1,0), direction.normalize()) — from = current direction (+Y), to = desired direction toward target',
        'setFromUnitVectors(new Vector3(0,0,1), target)',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Box3.setFromObject(mesh) + intersectsBox(other) = fast broad-phase collision." Why is this called "broad-phase"?',
      options: [
        'It only works on large objects',
        'Axis-aligned bounding box checks are cheap but imprecise — they quickly eliminate pairs of objects that cannot possibly intersect, so expensive narrow-phase (mesh-level) checks only run on candidates',
        'It tests all 6 faces of the box simultaneously',
      ],
      correct: 1,
    },
  ],
}
