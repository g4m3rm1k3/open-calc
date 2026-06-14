// Three.js 2 · Chapter 5 · Lesson 0
// Curves & Parametric Paths

const LESSON_3JS2_5_0 = {
  title: 'Curves & Parametric Paths',
  subtitle: 'CatmullRom, Bézier, and Three.js curve classes — how curves are sampled, arc-length parameterised, and rendered.',
  sequential: true,

  cells: [

    // ── Cell 1: What Is a Parametric Curve? ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Parametric Equations — Geometry as Functions

A **parametric equation** describes geometry using parameters rather than explicit equations like \`y = f(x)\`. For a curve in 3D, the single parameter is usually \`t\` ∈ [0, 1]:

\`\`\`
Helix:
  x(t) = r · cos(2π · n · t)
  y(t) = height · t
  z(t) = r · sin(2π · n · t)
  where r = radius, n = number of turns

Circle in XZ plane:
  x(t) = r · cos(2π · t)
  y(t) = 0
  z(t) = r · sin(2π · t)
\`\`\`

Evaluating the parametric function at many values of \`t\` gives you a sequence of points that approximate the curve. The quality of the approximation depends on how many samples you take.

**Why parametric?** Because \`y = f(x)\` cannot represent vertical lines, closed curves (circles), or curves that fold back on themselves. Parametric equations handle all of these naturally.

CAD tools represent curves and surfaces parametrically using NURBS (Non-Uniform Rational B-Splines). Bézier curves are a simpler special case. All of these live in the same framework: functions of parameters.

---

### Three.js Curve Classes

All curve classes inherit from \`THREE.Curve\` and implement the same interface:

| Class | Description |
|-------|-------------|
| \`CatmullRomCurve3\` | Smooth curve passing through all given control points |
| \`CubicBezierCurve3\` | Cubic Bézier — starts at p0, ends at p3, pulled by p1 and p2 |
| \`QuadraticBezierCurve3\` | One control point — simpler, less flexible |
| \`LineCurve3\` | Straight line between two points |
| \`EllipseCurve\` | Ellipse arc on XY plane |

**Common API** (all curve classes):
\`\`\`js
curve.getPoint(t)         // Vector3 at parameter t ∈ [0, 1]
curve.getPoints(N)        // Array of N+1 Vector3s sampled at equal t intervals
curve.getTangent(t)       // Unit tangent direction at t
curve.getLengths()        // Arc-length lookup table
curve.getSpacedPoints(N)  // N points spaced by arc length — NOT by t interval
\`\`\`

**Important: \`getPoints\` vs \`getSpacedPoints\`**

\`getPoints\` samples at equal \`t\` intervals. Near tight bends, \`t\` changes slowly in space — points bunch up. \`getSpacedPoints\` uses the arc-length table to sample at equal distance intervals along the curve. For animation (moving an object at constant speed), always use \`getSpacedPoints\`.`,
    },

    // ── Cell 2: Bézier Curves ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Bézier Curves — The CAD Standard

A **cubic Bézier curve** is defined by four points: start (p0), two control points (p1, p2), and end (p3). The curve starts at p0, ends at p3, and is pulled toward (but doesn't touch) p1 and p2.

The parametric formula using **Bernstein polynomials**:
\`\`\`
B(t) = (1-t)³·p0 + 3(1-t)²t·p1 + 3(1-t)t²·p2 + t³·p3
\`\`\`

Properties that make Bézier curves useful for CAD:
- **Convex hull property:** the curve always lies within the convex hull of its control points — easy to bound
- **End-point interpolation:** the curve always passes through p0 and p3 exactly
- **Tangent direction:** the curve's tangent at p0 is parallel to (p1 - p0), and at p3 is parallel to (p3 - p2)
- **Affine invariance:** transform the control points → the curve transforms the same way

**CatmullRom curves** automatically compute internal control points to pass through all given points smoothly. They're excellent for paths, splines, and animation trajectories.

---

### TubeGeometry — Wrapping a Tube Around a Curve

\`THREE.TubeGeometry\` turns any \`Curve3\` into a mesh by sweeping a circle cross-section along the path:

\`\`\`js
const tube = new THREE.TubeGeometry(
  curve,    // the path (any Curve3)
  64,       // tubularSegments — resolution along the length
  0.05,     // radius
  8,        // radialSegments — cross-section polygon count
  false     // closed
);
const tubeMesh = new THREE.Mesh(tube, material);
\`\`\`

The Frenet frame (Tangent, Normal, Binormal at each point) determines the tube's orientation along the path. Three.js computes this automatically. For helical paths, the Frenet frame rotates — you may want \`CatmullRomCurve3.computeFrenetFrames()\` for stable orientation.`,
    },

    // ── Cell 3: Curve Explorer Demo ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Curve Explorer — Three Curve Types Side by Side

A CatmullRom, a Cubic Bézier, and a helix rendered as tubes. A small cone animates along the CatmullRom path, tracking its tangent. Toggle wireframe on the tube mesh to see the mesh structure.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:flex;gap:6px">
  <button id="btn-wire" style="padding:5px 12px;border-radius:6px;border:1px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Toggle Wireframe</button>
</div>
<canvas id="cv" style="display:block;border-radius:0 0 6px 6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 340);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/340, 0.1, 100);
camera.position.set(0, 4, 14);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(16,16,0x1a1a2e,0x1a1a2e));

// ── 1. CatmullRom Curve ────────────────────────────────────────────────────────
var catmullPts = [
  new THREE.Vector3(-5, 0, 0),
  new THREE.Vector3(-3, 2, 1),
  new THREE.Vector3(-1, 0, 3),
  new THREE.Vector3( 1,-2, 1),
  new THREE.Vector3( 3, 1, 0),
  new THREE.Vector3( 5, 0,-1),
];
var catmull = new THREE.CatmullRomCurve3(catmullPts);

var catmullTube = new THREE.Mesh(
  new THREE.TubeGeometry(catmull, 64, 0.06, 8, false),
  new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness: 0.4 })
);
scene.add(catmullTube);

// Control point spheres
catmullPts.forEach(function(p) {
  var s = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  s.position.copy(p);
  scene.add(s);
});

// ── 2. Cubic Bezier ────────────────────────────────────────────────────────────
var bezier = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-5,  0, -3),
  new THREE.Vector3(-2,  3, -3),
  new THREE.Vector3( 2,  3, -3),
  new THREE.Vector3( 5,  0, -3)
);
var bezPts  = bezier.getPoints(50);
var bezLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(bezPts),
  new THREE.LineBasicMaterial({ color: 0xf5a623 })
);
scene.add(bezLine);
// Control lines (tangent handles)
var cpLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    bezier.v0, bezier.v1, bezier.v2, bezier.v3
  ]),
  new THREE.LineBasicMaterial({ color: 0x664422, opacity: 0.5, transparent: true })
);
scene.add(cpLine);

// ── 3. Helix ──────────────────────────────────────────────────────────────────
var helixPts = [];
for (var i = 0; i <= 64; i++) {
  var t = i / 64;
  var theta = t * Math.PI * 2 * 3; // 3 turns
  helixPts.push(new THREE.Vector3(
    Math.cos(theta) * 2 - 5,  // offset to the left
    (t - 0.5) * 4,
    Math.sin(theta) * 2 - 4
  ));
}
var helix = new THREE.CatmullRomCurve3(helixPts);
var helixTube = new THREE.Mesh(
  new THREE.TubeGeometry(helix, 128, 0.06, 8, false),
  new THREE.MeshStandardMaterial({ color: 0xe06c75, roughness: 0.4 })
);
scene.add(helixTube);

// ── Moving object on CatmullRom ────────────────────────────────────────────────
var mover = new THREE.Mesh(
  new THREE.ConeGeometry(0.18, 0.5, 8),
  new THREE.MeshStandardMaterial({ color: 0x7c6cfc, roughness: 0.3 })
);
scene.add(mover);
var upVec = new THREE.Vector3(0, 1, 0);

var wireframeMode = false;
document.getElementById('btn-wire').onclick = function() {
  wireframeMode = !wireframeMode;
  catmullTube.material.wireframe = wireframeMode;
  helixTube.material.wireframe   = wireframeMode;
};

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();

  var param = (t * 0.12) % 1;
  var pos  = catmull.getPoint(param);
  var tang = catmull.getTangent(param);

  mover.position.copy(pos);
  mover.quaternion.setFromUnitVectors(upVec, tang);

  renderer.render(scene, camera);
  info.textContent = 'curve param t=' + param.toFixed(3) +
    '   pos: (' + pos.x.toFixed(2)+', '+pos.y.toFixed(2)+', '+pos.z.toFixed(2) + ')';
}
animate();`,
      outputHeight: 470,
    },

    // ── Cell 4: Coding Challenge 1 — Draw a Bezier ───────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Build an Interactive Bézier Curve

Create a cubic Bézier curve with 4 control points visible as spheres. Animate the two middle control points (p1 and p2) using sine waves so the curve morphs continuously.

Requirements:
- 4 control point spheres: p0 at (-4,0,0), p3 at (4,0,0), p1 and p2 animated
- p1: \`y = 2 * Math.sin(t * 1.2)\`, \`x = -1.5\`
- p2: \`y = -2 * Math.sin(t * 0.8)\`, \`x = 1.5\`
- After moving p1/p2 each frame, rebuild the Line geometry from \`bezier.getPoints(80)\`
- Also show the "control handle lines" from p0→p1 and p2→p3 as thin lines`,
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
camera.position.set(0, 2, 9);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.GridHelper(12,12,0x1a1a2e,0x1a1a2e));

// Fixed endpoints
var p0 = new THREE.Vector3(-4, 0, 0);
var p3 = new THREE.Vector3( 4, 0, 0);
// Animated control points
var p1 = new THREE.Vector3(-1.5, 0, 0);
var p2 = new THREE.Vector3( 1.5, 0, 0);

// ── YOUR CODE: create a CubicBezierCurve3 ─────────────────────────────────────
// var bezier = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

// ── YOUR CODE: create a Line from the curve points ────────────────────────────
// var bezGeo  = new THREE.BufferGeometry().setFromPoints(bezier.getPoints(80));
// var bezLine = new THREE.Line(bezGeo, new THREE.LineBasicMaterial({ color: 0x64d8cb }));
// scene.add(bezLine);

// Control point spheres
function makeCPSphere(pos, color) {
  var s = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 12, 12),
    new THREE.MeshBasicMaterial({ color: color })
  );
  s.position.copy(pos);
  scene.add(s);
  return s;
}
var sp0 = makeCPSphere(p0, 0x4488cc);
var sp1 = makeCPSphere(p1, 0xf5a623);
var sp2 = makeCPSphere(p2, 0xf5a623);
var sp3 = makeCPSphere(p3, 0x4488cc);

// ── YOUR CODE: handle lines (p0→p1 and p2→p3) ────────────────────────────────
// (rebuild similarly to the curve line in the animate loop)

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();

  // ── YOUR CODE: animate p1 and p2 ─────────────────────────────────────────
  p1.y = 2 * Math.sin(t * 1.2);
  p2.y = -2 * Math.sin(t * 0.8);
  sp1.position.copy(p1);
  sp2.position.copy(p2);

  // ── YOUR CODE: update the bezier's control points and rebuild the line ────
  // bezier.v1.copy(p1);
  // bezier.v2.copy(p2);
  // bezGeo.setFromPoints(bezier.getPoints(80));
  // bezGeo.computeBoundingBox();

  renderer.render(scene, camera);
  info.textContent = 'p1.y=' + p1.y.toFixed(2) + '   p2.y=' + p2.y.toFixed(2);
}
animate();`,
      outputHeight: 400,
    },

    // ── Cell 5: Coding Challenge 2 — Path Animation ──────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Arc-Length Parameterised Path Animation

Move an object along a CatmullRom path at **constant speed** by using \`getSpacedPoints\` instead of \`getPoint\`.

The problem with \`getPoint(t)\`: near tight bends, the curve moves slowly in space (t changes but position doesn't change much). The object appears to slow down at bends.

\`getSpacedPoints(N)\` uses the arc-length table to give N equally-spaced world positions. Map time → index linearly.

Requirements:
1. Create a CatmullRom path with 6+ waypoints
2. Sample 200 equally-spaced points using \`getSpacedPoints\`
3. Each frame, compute \`index = Math.floor(t * SPEED * numPoints) % numPoints\`
4. Set the object's position to \`spacedPoints[index]\`
5. Compute forward direction from consecutive points: \`dir = spacedPoints[(index+1) % N].clone().sub(spacedPoints[index]).normalize()\`
6. Orient the object with \`setFromUnitVectors(upVec, dir)\``,
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
camera.position.set(0, 8, 14);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,8,5)}));
scene.add(new THREE.GridHelper(14,14,0x1a1a2e,0x1a1a2e));

// Path control points (race track shape)
var trackPts = [
  new THREE.Vector3( 5, 0,  0),
  new THREE.Vector3( 5, 0, -4),
  new THREE.Vector3( 0, 0, -6),
  new THREE.Vector3(-5, 0, -4),
  new THREE.Vector3(-5, 0,  0),
  new THREE.Vector3(-5, 0,  4),
  new THREE.Vector3( 0, 0,  6),
  new THREE.Vector3( 5, 0,  4),
];

// ── YOUR CODE: create a CatmullRomCurve3 with closed=true ─────────────────────
// var track = new THREE.CatmullRomCurve3(trackPts, true);

// ── YOUR CODE: draw the track as a TubeGeometry ───────────────────────────────
// var trackMesh = new THREE.Mesh(
//   new THREE.TubeGeometry(track, 128, 0.1, 8, true),
//   new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.5 })
// );
// scene.add(trackMesh);

// ── YOUR CODE: sample equally-spaced points ───────────────────────────────────
// var NUM_PTS = 200;
// var spacedPts = track.getSpacedPoints(NUM_PTS);

// Mover
var mover = new THREE.Mesh(
  new THREE.ConeGeometry(0.25, 0.7, 8),
  new THREE.MeshStandardMaterial({ color: 0xf5a623, roughness: 0.3 })
);
scene.add(mover);
var upVec = new THREE.Vector3(0, 1, 0);

var SPEED = 0.15; // loops per second

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();

  // ── YOUR CODE: move along arc-length spaced points ────────────────────────
  // var N    = spacedPts.length;
  // var idx  = Math.floor(t * SPEED * N) % N;
  // var next = (idx + 1) % N;
  // mover.position.copy(spacedPts[idx]);
  // mover.position.y = 0.5; // ride above the ground
  // var dir = spacedPts[next].clone().sub(spacedPts[idx]).normalize();
  // mover.quaternion.setFromUnitVectors(upVec, dir);

  renderer.render(scene, camera);
  info.textContent = 'mover: (' + mover.position.x.toFixed(1)+', '+mover.position.z.toFixed(1) + ')';
}
animate();`,
      outputHeight: 400,
    },

    // ── Cell 6: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `What is the key difference between \`curve.getPoints(50)\` and \`curve.getSpacedPoints(50)\`?`,
      options: [
        { label: 'A', text: 'getPoints returns 50 points; getSpacedPoints returns 51 points including the endpoint.' },
        { label: 'B', text: 'getPoints samples at equal t-parameter intervals — points bunch up near tight bends. getSpacedPoints samples at equal arc-length intervals — constant world-space spacing along the curve.' },
        { label: 'C', text: 'getSpacedPoints is faster to compute than getPoints because it uses less trigonometry.' },
        { label: 'D', text: 'getPoints works on closed curves; getSpacedPoints only works on open curves.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Parametric curves are not arc-length parameterised by default — equal t steps do not correspond to equal distances along the curve. Near tight bends, the curve changes quickly in parameter space but slowly in world space, causing point bunching. getSpacedPoints uses an internal arc-length table (built by sampling the curve many times) to find t values that correspond to equal world-space intervals. Always use getSpacedPoints when you need constant-speed path animation.',
      failMessage: 'The answer is B. getPoints(N) samples at t = 0, 1/N, 2/N, ... — equal parameter steps. Because the curve\'s speed (dx/dt) varies, these are NOT equal distances in world space. Points bunch near tight bends and spread near gentle bends. getSpacedPoints uses an arc-length lookup table to find t values that produce equal world-space distances. Use getSpacedPoints for camera paths, racing games, or any constant-speed path animation.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_5_0 }

export default {
  id: 'three-js-2-5-0-curves',
  slug: 'curves-parametric-paths',
  chapter: 'three-js-2.5',
  order: 0,
  title: LESSON_3JS2_5_0.title,
  subtitle: LESSON_3JS2_5_0.subtitle,
  tags: ['three-js', 'curves', 'catmullrom', 'bezier', 'spline', 'tubegeometry', 'frenet-frame', 'arc-length', 'cad'],
  hook: {
    question: 'getPoints(50) bunches points at tight bends and spreads them on gentle ones. getSpacedPoints(50) gives equal distance everywhere. Which one should you use for a car racing along a track — and why does it matter?',
    realWorldContext: 'Bézier curves are the standard in CAD (NURBS are a generalisation). CatmullRom curves appear in animation timelines, camera paths, and robot trajectories. Arc-length parameterisation is the difference between constant-speed and stuttering motion.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Parametric curve: P(t) → (x,y,z) with t ∈ [0,1]. One parameter traces the whole curve.',
      'CatmullRomCurve3: smooth through all given control points. Closed option available.',
      'CubicBezierCurve3: starts at p0, ends at p3, pulled toward p1 and p2 (not interpolated).',
      'getPoints(N): equal t-parameter steps — points bunch at tight bends.',
      'getSpacedPoints(N): equal arc-length steps — constant world-space spacing. Use for animation.',
      'getTangent(t): unit direction vector at t. Use with setFromUnitVectors to orient a moving object.',
      'TubeGeometry(curve, segs, radius): sweeps a circle cross-section along any Curve3.',
    ],
    callouts: [
      { type: 'important', title: 'getPoints vs getSpacedPoints', body: 'getPoints samples at equal t intervals — not equal distances. Near tight bends, points cluster. getSpacedPoints uses an arc-length table to give equal world-space spacing. Always use getSpacedPoints for path animation.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_5_0.title, props: { lesson: LESSON_3JS2_5_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Parametric curve: t ∈ [0,1] → (x,y,z). Equal t ≠ equal distance along curve.',
    'CatmullRom: smooth through all points. Bezier: pulled toward control points, not through them.',
    'getSpacedPoints: uses arc-length LUT for equal world-space intervals. Essential for constant-speed motion.',
    'mover.quaternion.setFromUnitVectors(up, curve.getTangent(t)): orient object along path.',
    'TubeGeometry: wrap any Curve3 in a mesh tube.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
