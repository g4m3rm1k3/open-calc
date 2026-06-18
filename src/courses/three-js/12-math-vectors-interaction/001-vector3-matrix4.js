// Three.js 2 · Chapter 4 · Lesson 0
// Vector3 & Matrix4 — The Math Layer

const LESSON_3JS2_4_0 = {
  title: 'Vector3 & Matrix4',
  subtitle: 'The full 3D math API — dot products, cross products, projections, matrix transforms, and why they matter for CAD.',
  sequential: true,

  cells: [

    // ── Cell 1: Vector3 — The Fundamental Type ────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Vector3 — The Workhorse of 3D Math

A \`Vector3\` is three floats \`(x, y, z)\`. It represents either a **point in space** or a **direction** — the same data type, different conceptual meaning.

\`\`\`js
const v = new THREE.Vector3(1, 2, 3);

// ── ARITHMETIC ────────────────────────────────────────────────────────────────
v.add(new THREE.Vector3(1, 0, 0));   // v = (2, 2, 3) — in-place
v.addScalar(1);                       // v = (3, 3, 4) — add to all components
v.multiplyScalar(2);                  // v = (6, 6, 8) — scale
v.negate();                           // v = (-6, -6, -8) — flip direction
v.clamp(minVec, maxVec);             // clamp each component

// Non-destructive — returns NEW vector, doesn't modify v:
const sum = v.clone().add(other);

// ── LENGTH & NORMALIZATION ────────────────────────────────────────────────────
const len   = v.length();        // Euclidean length: √(x²+y²+z²)
const lenSq = v.lengthSq();     // squared length — faster, no sqrt
v.normalize();                   // make length = 1 (unit vector), in-place

// ── DOT PRODUCT ───────────────────────────────────────────────────────────────
// a · b = |a||b|cos(θ)  where θ is the angle between them.
// For normalised vectors: a · b = cos(θ) directly.
// > 0: same side    = 0: perpendicular    < 0: opposite sides
const a = new THREE.Vector3(1, 0, 0);  // pointing right
const b = new THREE.Vector3(0, 1, 0);  // pointing up
a.dot(b);    // → 0 (perpendicular)
a.dot(a);    // → 1 (same direction, both normalised)

// ── CROSS PRODUCT ─────────────────────────────────────────────────────────────
// a × b = vector perpendicular to both, length |a||b|sin(θ)
// In right-handed coords: X × Y = Z
const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0);
const zAxis = xAxis.clone().cross(yAxis);  // → Vector3(0, 0, 1)
// Uses: compute triangle normals from two edge vectors
//       determine "up" direction for a camera
//       check left/right of a line

// ── LERP ──────────────────────────────────────────────────────────────────────
const start = new THREE.Vector3(0, 0, 0);
const end   = new THREE.Vector3(10, 5, 0);
const mid   = start.clone().lerp(end, 0.5);  // → Vector3(5, 2.5, 0)

// ── REFLECT ───────────────────────────────────────────────────────────────────
// Reflect incident vector around a normal — angle of incidence = angle of reflection
const incident  = new THREE.Vector3(1, -1, 0).normalize();
const normal    = new THREE.Vector3(0,  1, 0);
const reflected = incident.clone().reflect(normal);  // → Vector3(1, 1, 0)
\`\`\`

**Performance note:** Three.js Vector3 methods modify the vector **in-place** by default. Always use \`.clone()\` first if you want a non-destructive operation. Forgetting this is a very common bug.`,
    },

    // ── Cell 2: Matrix4 ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Matrix4 — The Transform Engine

A \`Matrix4\` is a 4×4 matrix stored as 16 floats in **column-major order** (matching OpenGL/WebGL). It represents any affine transform: translation, rotation, scale, or a combination.

\`\`\`js
const m = new THREE.Matrix4();  // identity matrix (no transform)

// ── BUILD SPECIFIC TRANSFORMS ─────────────────────────────────────────────────
m.makeTranslation(3, 1, 0);
m.makeRotationY(Math.PI / 2);
m.makeScale(2, 1, 1);

// ── COMPOSE FROM TRS ──────────────────────────────────────────────────────────
// This is what Three.js does internally every frame for each Object3D:
const pos  = new THREE.Vector3(3, 1, 0);
const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI/4, 0));
const scl  = new THREE.Vector3(1, 1, 1);
m.compose(pos, quat, scl);   // position + rotation + scale → one matrix

// ── MULTIPLY MATRICES ─────────────────────────────────────────────────────────
// Combining transforms = multiplying matrices.
// IMPORTANT: matrix multiplication is NOT commutative. A×B ≠ B×A.
// Convention: to apply A THEN B, compute B.multiply(A) (right-to-left)
const rotY  = new THREE.Matrix4().makeRotationY(Math.PI / 4);
const trans = new THREE.Matrix4().makeTranslation(3, 0, 0);

const translateThenRotate = rotY.clone().multiply(trans);
// Object moves 3 units along world X, THEN rotates around origin
// → traces an arc around the origin

const rotateThenTranslate = trans.clone().multiply(rotY);
// Object rotates in place (local), THEN moves 3 units along (now rotated) local X
// → moves diagonally in world space

// m1 ≠ m2!  Order matters enormously.

// ── TRANSFORM A POINT ─────────────────────────────────────────────────────────
const point = new THREE.Vector3(1, 0, 0);
point.applyMatrix4(m);  // transforms point by m in-place

// ── INVERSE ───────────────────────────────────────────────────────────────────
const inv = m.clone().invert();
// worldToLocal = inverse(localToWorld)
// The inverse "undoes" the transform.
// Cache inverses — computing them every frame is expensive.
\`\`\`

**Normal matrix:** When a mesh has non-uniform scale, transforming normals by the model matrix shears them (they no longer point perpendicular to the surface). The correct transform for normals is the **transpose of the inverse** of the 3×3 part of the model matrix. Three.js handles this automatically for built-in materials. In a custom ShaderMaterial, compute it yourself: \`normalMatrix = mat3(transpose(inverse(modelMatrix)))\`.`,
    },

    // ── Cell 3: Interactive Vector Visualiser ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Vector3 Visualiser

Two vectors A and B are shown as coloured arrows. Drag the sliders to change their directions. The scene shows the cross product (perpendicular to both) and displays the dot product and angle in real time.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">
  <label style="font-family:monospace;font-size:10px;color:#64d8cb">A.y: <span id="ayv">1</span>
    <input id="ay" type="range" min="-2" max="2" step="0.1" value="1" style="width:100%;accent-color:#64d8cb"></label>
  <label style="font-family:monospace;font-size:10px;color:#64d8cb">A.z: <span id="azv">0</span>
    <input id="az" type="range" min="-2" max="2" step="0.1" value="0" style="width:100%;accent-color:#64d8cb"></label>
  <label style="font-family:monospace;font-size:10px;color:#f5a623">B.x: <span id="bxv">0</span>
    <input id="bx" type="range" min="-2" max="2" step="0.1" value="0" style="width:100%;accent-color:#f5a623"></label>
  <label style="font-family:monospace;font-size:10px;color:#f5a623">B.z: <span id="bzv">1</span>
    <input id="bz" type="range" min="-2" max="2" step="0.1" value="1" style="width:100%;accent-color:#f5a623"></label>
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
camera.position.set(4, 4, 6);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.GridHelper(6,6,0x1a1a2e,0x1a1a2e));
scene.add(new THREE.AxesHelper(3));

var origin = new THREE.Vector3(0, 0, 0);

// Arrow helpers
function makeArrow(dir, col) {
  var n = dir.clone().normalize();
  return new THREE.ArrowHelper(n, origin, dir.length(), col, dir.length()*0.15, dir.length()*0.08);
}

var vA = new THREE.Vector3(2, 1, 0);
var vB = new THREE.Vector3(0, 1, 1);

var arrowA     = makeArrow(vA, 0x64d8cb);
var arrowB     = makeArrow(vB, 0xf5a623);
var crossVec   = vA.clone().cross(vB);
var arrowCross = makeArrow(crossVec.clone().normalize().multiplyScalar(1.5), 0xe06c75);

scene.add(arrowA, arrowB, arrowCross);

function update() {
  vA.set(2, parseFloat(document.getElementById('ay').value),
             parseFloat(document.getElementById('az').value));
  vB.set(parseFloat(document.getElementById('bx').value), 1,
             parseFloat(document.getElementById('bz').value));

  document.getElementById('ayv').textContent = vA.y.toFixed(1);
  document.getElementById('azv').textContent = vA.z.toFixed(1);
  document.getElementById('bxv').textContent = vB.x.toFixed(1);
  document.getElementById('bzv').textContent = vB.z.toFixed(1);

  // Recompute cross
  var cross = vA.clone().cross(vB);
  var dot   = vA.dot(vB);
  var cos   = dot / (vA.length() * vB.length());
  var angle = Math.acos(Math.max(-1, Math.min(1, cos)));

  // Update arrows
  scene.remove(arrowA, arrowB, arrowCross);
  arrowA     = makeArrow(vA, 0x64d8cb);
  arrowB     = makeArrow(vB, 0xf5a623);
  arrowCross = makeArrow(cross.clone().normalize().multiplyScalar(2), 0xe06c75);
  scene.add(arrowA, arrowB, arrowCross);

  info.textContent =
    'A = (' + vA.x.toFixed(1)+', '+vA.y.toFixed(1)+', '+vA.z.toFixed(1) + ')  |A| = ' + vA.length().toFixed(2) + '\n' +
    'B = (' + vB.x.toFixed(1)+', '+vB.y.toFixed(1)+', '+vB.z.toFixed(1) + ')  |B| = ' + vB.length().toFixed(2) + '\n' +
    'A·B = ' + dot.toFixed(3) + '   angle = ' + (angle * 180 / Math.PI).toFixed(1) + '°\n' +
    'A×B = (' + cross.x.toFixed(2)+', '+cross.y.toFixed(2)+', '+cross.z.toFixed(2) + ')  |A×B| = ' + cross.length().toFixed(2);
}
['ay','az','bx','bz'].forEach(function(id) {
  document.getElementById(id).oninput = update;
});
update();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 470,
    },

    // ── Cell 4: Coding Challenge 1 — Normal from Triangle ────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Compute a Triangle Normal with the Cross Product

Given a triangle with vertices p0, p1, p2, compute its **surface normal** using the cross product of two edge vectors:

\`\`\`
edge1 = p1 - p0
edge2 = p2 - p0
normal = normalize(edge1 × edge2)
\`\`\`

The winding order (CCW vs CW) determines which direction the normal points.

In the starter code:
1. Compute \`edge1\` and \`edge2\` from the given vertices
2. Compute the cross product to get the normal
3. Normalize it
4. Visualise it as an ArrowHelper starting from the triangle's centroid
5. Also display the normal's xyz in the info panel

Try flipping the winding order (swap p1 and p2) and observe the normal flip.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 340);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/340, 0.1, 100);
camera.position.set(3, 3, 5);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.AxesHelper(3));

// Triangle vertices
var p0 = new THREE.Vector3(-1.5, -1,  0);
var p1 = new THREE.Vector3( 0,    1,  0.5);  // swap p1 and p2 to flip normal!
var p2 = new THREE.Vector3( 1.5, -1, -0.5);

// Draw the triangle as a mesh
var geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
  p0.x, p0.y, p0.z,
  p1.x, p1.y, p1.z,
  p2.x, p2.y, p2.z,
]), 3));
var triMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x334466, side: THREE.DoubleSide }));
scene.add(triMesh);

// Mark vertices
[p0, p1, p2].forEach(function(p, i) {
  var s = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: [0xff4444, 0x44ff44, 0x4444ff][i] })
  );
  s.position.copy(p);
  scene.add(s);
});

// ── YOUR CODE: compute triangle normal ────────────────────────────────────────
// Step 1: edge vectors
// var edge1 = p1.clone().sub(p0);
// var edge2 = p2.clone().sub(p0);

// Step 2: cross product
// var normal = edge1.clone().cross(edge2).normalize();

// Step 3: visualize from centroid
// var centroid = new THREE.Vector3()
//   .add(p0).add(p1).add(p2).divideScalar(3);
// var arrow = new THREE.ArrowHelper(normal, centroid, 2, 0xf5a623, 0.3, 0.15);
// scene.add(arrow);

// Step 4: display
// info.textContent =
//   'normal = (' + normal.x.toFixed(3)+', '+normal.y.toFixed(3)+', '+normal.z.toFixed(3) + ')';

renderer.render(scene, camera);`,
      outputHeight: 420,
    },

    // ── Cell 5: Coding Challenge 2 — Distance and Closest Point ─────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Closest Point on a Line

Implement the **closest point on a line** algorithm using Vector3 math. Given a line defined by a point A and a unit direction d, and a query point P, the closest point on the line is:

\`\`\`
t = (P - A) · d        // signed distance along the line
closest = A + t × d   // the point on the line
\`\`\`

In the starter:
1. Animate a query point P in a circle
2. Compute the closest point on the static line each frame
3. Show a sphere at the closest point
4. Draw a thin red line from P to the closest point to visualize the distance

This algorithm is fundamental to CAD constraint solving, collision detection, and snap-to-grid tools.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 300);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/300, 0.1, 100);
camera.position.set(0, 4, 8);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.GridHelper(10,10,0x1a1a2e,0x1a1a2e));

// The static line (from -3 to 3 along a diagonal direction)
var lineA = new THREE.Vector3(-3, 0, -1);
var lineDir = new THREE.Vector3(1, 0.3, 0.5).normalize(); // unit direction

// Draw the static line
var lineGeo = new THREE.BufferGeometry().setFromPoints([
  lineA.clone().addScaledVector(lineDir, -4),
  lineA.clone().addScaledVector(lineDir,  4),
]);
scene.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x4488cc })));

// Query point P (will be animated)
var P = new THREE.Vector3();
var pSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.15, 12, 12),
  new THREE.MeshBasicMaterial({ color: 0xf5a623 })
);
scene.add(pSphere);

// Closest point indicator
var cSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 12, 12),
  new THREE.MeshBasicMaterial({ color: 0xe06c75 })
);
scene.add(cSphere);

// Line from P to closest (will be updated each frame)
var connGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
var connLine = new THREE.Line(connGeo, new THREE.LineBasicMaterial({ color: 0xff2222 }));
scene.add(connLine);

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();

  // Animate P in a circle
  P.set(Math.cos(t * 0.8) * 3, Math.sin(t * 0.6) * 1.5, Math.sin(t * 1.1) * 2);
  pSphere.position.copy(P);

  // ── YOUR CODE: closest point on line ─────────────────────────────────────
  // var tParam = P.clone().sub(lineA).dot(lineDir);
  // var closest = lineA.clone().addScaledVector(lineDir, tParam);
  // cSphere.position.copy(closest);

  // Update connection line
  // var pts = connGeo.attributes.position.array;
  // pts[0]=P.x;       pts[1]=P.y;       pts[2]=P.z;
  // pts[3]=closest.x; pts[4]=closest.y; pts[5]=closest.z;
  // connGeo.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
  info.textContent = 'P: (' + P.x.toFixed(2)+', '+P.y.toFixed(2)+', '+P.z.toFixed(2) + ')' +
    // '   closest: (' + closest.x.toFixed(2)+', '+closest.y.toFixed(2)+', '+closest.z.toFixed(2) + ')' +
    // '   dist: ' + P.distanceTo(closest).toFixed(3)
    '';
}
animate();`,
      outputHeight: 390,
    },

    // ── Cell 6: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Vectors A = (1, 0, 0) and B are normalised. \`A.dot(B)\` returns -0.5. What is the angle between A and B?`,
      options: [
        { label: 'A', text: '30° (π/6) — because cos(30°) ≈ 0.866' },
        { label: 'B', text: '60° (π/3) — because cos(60°) = 0.5' },
        { label: 'C', text: '120° (2π/3) — because cos(120°) = -0.5' },
        { label: 'D', text: '150° (5π/6) — because cos(150°) ≈ -0.866' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. For normalised vectors, A·B = cos(θ). cos⁻¹(-0.5) = 120° (2π/3 radians). Negative dot products indicate vectors pointing more away from each other than toward each other — they form an obtuse angle. This is used in lighting (dot < 0 means the surface faces away from the light) and backface culling (dot < 0 means facing away from camera).',
      failMessage: 'The answer is C — 120°. For unit vectors, A·B = cos(θ), so θ = arccos(A·B) = arccos(-0.5) = 120°. A dot product of -0.5 means the vectors form an obtuse angle — they point somewhat away from each other. cos(60°) = +0.5, cos(120°) = -0.5, cos(180°) = -1.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `You want to rotate a matrix M1 by R (a rotation matrix) and then translate by T. The correct combined matrix is?`,
      options: [
        { label: 'A', text: 'M_combined = M1.multiply(R).multiply(T) — apply in left-to-right order.' },
        { label: 'B', text: 'M_combined = T.clone().multiply(R.clone().multiply(M1)) — translate first, then rotate, then apply M1.' },
        { label: 'C', text: 'M_combined = T.clone().multiply(R).multiply(M1) — matrices are applied right-to-left, so M1 is transformed first, then R, then T.' },
        { label: 'D', text: 'Matrix multiplication order does not matter since transforms are commutative.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Matrix multiplication applies transforms right-to-left: in M = T × R × M1, the point is first transformed by M1, then R, then T. This is the standard convention in OpenGL and Three.js. "Left-to-right = order of application" is WRONG — the rightmost matrix in the product is applied first. This is why rotate-then-translate and translate-then-rotate give different results.',
      failMessage: 'The answer is C. Matrix multiplication is right-to-left: T × R × M1 applies M1 first, then R, then T. Matrix multiplication is NOT commutative (D is wrong) — A×B produces different results than B×A. This is fundamental: three.js.matrix.multiply(other) computes this = this × other. Always think about what transform you want applied last and put it leftmost.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_4_0 }

export default {
  id: 'three-js-2-4-0-vector3-matrix4',
  slug: 'vector3-matrix4',
  chapter: 'three-js-2.4',
  order: 0,
  title: LESSON_3JS2_4_0.title,
  subtitle: LESSON_3JS2_4_0.subtitle,
  tags: ['three-js', 'vector3', 'matrix4', 'dot-product', 'cross-product', 'lerp', 'normals', 'linear-algebra', 'cad'],
  hook: {
    question: 'Two vectors. One dot product. What does the sign of that dot product tell you — and how does the same formula power Lambert shading, backface culling, collision detection, and the shadow map in the lighting lesson?',
    realWorldContext: 'You cannot write CAD/CAM software without linear algebra. Every operation — extrusion, rotation, surface normal, closest-point query, plane intersection — is a Vector3 or Matrix4 operation. Three.js exposes the full math layer. This lesson covers the whole API.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Vector3 represents either a point in space or a direction — same type, different interpretation.',
      'dot(b): |a||b|cos(θ). For normalised vectors: cos(θ). Positive=same side, zero=perpendicular, negative=opposite.',
      'cross(b): vector perpendicular to both a and b. Length = |a||b|sin(θ). X×Y=Z (right-handed).',
      'Normal from triangle edges: edge1 = p1-p0, edge2 = p2-p0, normal = normalize(edge1 × edge2).',
      'lerp(v, t): linear interpolation. t=0→this, t=1→v. For positions. slerp for rotations (quaternion).',
      'Matrix4: 16 floats, column-major. multiply() composes transforms. applyMatrix4() transforms a point.',
    ],
    callouts: [
      { type: 'warning', title: 'In-place by default', body: 'v.add(other), v.normalize(), v.cross(other) all modify v IN PLACE. Use v.clone().add(other) to get a new vector without modifying the original.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_4_0.title, props: { lesson: LESSON_3JS2_4_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'dot(a,b) = |a||b|cos(θ). Sign tells you angle relationship. For unit vectors = cos(θ) directly.',
    'cross(a,b) = vector ⊥ to both. Use for normals: edge1.cross(edge2).normalize().',
    'Matrix multiply is NOT commutative: A×B ≠ B×A. Rightmost matrix applies first.',
    'clone() before any in-place operation if you need the original unchanged.',
    'closest point on line: t = (P-A)·d, closest = A + t*d. Core of CAD constraint solving.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
