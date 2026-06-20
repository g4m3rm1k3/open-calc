// Three.js 2 · Chapter 4 · Lesson 2
// Raycasting & Mouse Interaction

const LESSON_3JS2_4_2 = {
  title: 'Raycasting & Mouse Interaction',
  subtitle: 'How a 2D mouse click becomes a 3D ray, what intersection data the Raycaster returns, and how to build hover/selection UIs.',
  sequential: true,

  cells: [

    // ── Cell 1: What Is Raycasting? ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What Is Raycasting?

**Raycasting** is the process of shooting a ray (a point + direction = half-line) into a 3D scene and finding all objects it intersects. It answers: "what is under the mouse cursor?"

Uses in 3D software:
- **Mouse picking:** click on a 3D object → what did the user click?
- **Proximity detection:** is this point within range of any object?
- **Terrain following:** where is the ground below this character?
- **CAD selection:** click to select a face, edge, or vertex
- **Bullet travel:** where does this projectile hit?

---

### Unprojection: 2D Mouse → 3D Ray

The screen is 2D. When the user clicks pixel \`(mouseX, mouseY)\`, we must turn that into a 3D ray. This is called **unprojection** — the reverse of the camera's projection.

**Step 1 — Convert pixel coordinates to NDC (Normalized Device Coordinates):**

NDC space goes from -1 to +1 on both X and Y, with (0, 0) at the screen centre. Note that Y is **flipped** — screen Y=0 is the top, NDC Y=+1 is the top.

\`\`\`js
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x =  (event.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;  // Y is flipped!
});
\`\`\`

**Step 2 — Set the ray from NDC + camera:**

\`Raycaster.setFromCamera(ndcPoint, camera)\` computes the ray's origin and direction by running the full inverse projection transform internally.

\`\`\`js
const raycaster = new THREE.Raycaster();

raycaster.setFromCamera(mouse, camera);
\`\`\`

**Step 3 — Intersect objects:**

\`\`\`js
const intersects = raycaster.intersectObjects(objectArray, recursive);
// recursive: true — also test children of passed objects
// Returns array sorted by distance (closest first)
\`\`\`

---

### Intersection Records

Each element in the returned array contains:
\`\`\`js
{
  distance:  4.2,                  // from ray origin to hit point
  point:     Vector3(1.3, 0, 2),  // world-space intersection point
  face:      { a:12, b:13, c:14, normal: Vector3(...) },  // which triangle
  faceIndex: 6,                    // triangle index in the geometry
  object:    Mesh,                 // which object was hit
  uv:        Vector2(0.3, 0.7),   // texture coords at hit point
}
\`\`\`

Always use \`intersects[0]\` — the closest hit — unless you specifically need all hits (e.g., for transparency).`,
    },

    // ── Cell 2: Performance Notes ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Performance Considerations

The \`intersectObjects\` method performs a **triangle-ray test** on every triangle of every object in the array. This is O(triangles × objects) per call.

Optimisation strategies:

**1. Maintain a specific pickable array:**
\`\`\`js
const pickableObjects = [];
// Only add objects the user can actually click
pickableObjects.push(mesh);
raycaster.intersectObjects(pickableObjects);  // not the entire scene!
\`\`\`

**2. Don't raycast in mousemove unless needed:**
\`\`\`js
// mousemove fires 60+ times per second while moving.
// Debounce if doing expensive tests.
\`\`\`

**3. Avoid creating new Vector2 in mousemove:**
\`\`\`js
// Good: reuse a persistent mouse object
const mouse = new THREE.Vector2();  // created once
addEventListener('mousemove', e => {
  mouse.x = (e.clientX / width) * 2 - 1;   // updates in-place — no allocation
});
\`\`\`

**4. Don't raycast during orbit drag:**
\`\`\`js
let isOrbiting = false;
canvas.addEventListener('mousedown', () => isOrbiting = true);
canvas.addEventListener('mouseup',   () => isOrbiting = false);
// In click handler:
if (isOrbiting) return;
\`\`\`

**5. Use \`layers\`** to completely exclude objects from raycasting:
\`\`\`js
raycaster.layers.set(1);   // only test layer 1
mesh.layers.set(1);        // this mesh is on layer 1
helperMesh.layers.set(2);  // this helper is never picked
\`\`\``,
    },

    // ── Cell 3: Full Picking Demo ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Mouse Picking — Hover & Click Selection

Move your mouse over the objects to see hover highlighting. Click to select (turn wireframe on). Click again in empty space to deselect. The intersection data (world position, face normal, distance) is shown below.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre;min-height:60px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a14);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 100);
camera.position.set(0, 3, 8);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,10,5)}));

// Pickable objects
var pickable = [];
var DEFS = [
  { geo: new THREE.BoxGeometry(1.5,1.5,1.5), pos:[-3,0,0], color:0x64d8cb },
  { geo: new THREE.SphereGeometry(0.8,32,32), pos:[0,0,0],  color:0xf5a623 },
  { geo: new THREE.TorusGeometry(0.8,0.25,16,64), pos:[3,0,0], color:0xe06c75 },
];
DEFS.forEach(function(d) {
  var m = new THREE.Mesh(d.geo, new THREE.MeshStandardMaterial({ color:d.color, roughness:0.4 }));
  m.position.set.apply(m.position, d.pos);
  m.userData.originalColor = d.color;
  scene.add(m);
  pickable.push(m);
});

// Intersection marker
var marker = new THREE.Mesh(
  new THREE.SphereGeometry(0.06,8,8),
  new THREE.MeshBasicMaterial({ color:0xff0000 })
);
marker.visible = false;
scene.add(marker);

var raycaster = new THREE.Raycaster();
var mouse     = new THREE.Vector2();
var hovered   = null;
var selected  = null;
var isOrbiting = false;

cv.addEventListener('mousedown', function() { isOrbiting = true; });
cv.addEventListener('mouseup',   function() { isOrbiting = false; });

cv.addEventListener('mousemove', function(e) {
  var rect = cv.getBoundingClientRect();
  mouse.x =  (e.clientX - rect.left) / rect.width  * 2 - 1;
  mouse.y = -(e.clientY - rect.top)  / rect.height * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(pickable, false);

  // Reset previous hover
  if (hovered && hovered !== selected) {
    hovered.material.color.setHex(hovered.userData.originalColor);
    hovered.material.emissive.set(0x000000);
    hovered = null;
  }

  if (hits.length > 0) {
    var h = hits[0].object;
    if (h !== selected) {
      h.material.color.setHex(0xffffff);
      h.material.emissive.set(0x333333);
      hovered = h;
    }
    marker.position.copy(hits[0].point);
    marker.visible = true;
    cv.style.cursor = 'pointer';
  } else {
    marker.visible = false;
    cv.style.cursor = 'default';
  }
});

cv.addEventListener('click', function() {
  if (isOrbiting) return;
  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(pickable, false);

  // Deselect previous
  if (selected) {
    selected.material.color.setHex(selected.userData.originalColor);
    selected.material.wireframe = false;
    selected = null;
  }

  if (hits.length > 0) {
    var h = hits[0];
    selected = h.object;
    selected.material.color.setHex(0x7c6cfc);
    selected.material.wireframe = true;
    hovered = null;

    var localPt = selected.worldToLocal(h.point.clone());
    info.textContent =
      'Selected: ' + selected.geometry.type + '\n' +
      'Hit world: (' + h.point.x.toFixed(2)+', '+h.point.y.toFixed(2)+', '+h.point.z.toFixed(2) + ')\n' +
      'Hit local: (' + localPt.x.toFixed(2)+', '+localPt.y.toFixed(2)+', '+localPt.z.toFixed(2) + ')\n' +
      'Face normal: (' + h.face.normal.x.toFixed(2)+', '+h.face.normal.y.toFixed(2)+', '+h.face.normal.z.toFixed(2) + ')\n' +
      'Distance: ' + h.distance.toFixed(3);
  } else {
    info.textContent = 'Click an object to select it';
  }
});

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();
  pickable.forEach(function(obj) {
    if (obj !== selected) obj.rotation.y = t * 0.3;
  });
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 460,
    },

    // ── Cell 4: Coding Challenge 1 — Drag to Move ────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Click-Drag to Move Objects

Implement drag-to-move: click and drag a sphere to reposition it along the XZ plane.

The technique:
1. On **mousedown**: raycast against the sphere to detect the pick
2. Create an invisible **drag plane** at the sphere's Y position (\`new THREE.Plane(new THREE.Vector3(0,1,0), -sphere.position.y)\`)
3. On **mousemove** while dragging: raycast against the plane and set \`sphere.position.x/z\` to the hit point
4. On **mouseup**: end the drag

Key: raycast against a plane (not the sphere) during drag — the sphere can't "escape" from under the cursor this way.

\`\`\`js
// Raycast against a plane:
var planeHit = new THREE.Vector3();
raycaster.ray.intersectPlane(dragPlane, planeHit);
sphere.position.x = planeHit.x;
sphere.position.z = planeHit.z;
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
camera.position.set(0, 7, 9);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,10,5)}));
scene.add(new THREE.GridHelper(12,12,0x1a1a2e,0x1a1a2e));

// Three draggable spheres
var spheres = [];
[[0, 0.7, 0, 0x64d8cb], [-3, 0.7, -2, 0xf5a623], [3, 0.7, 2, 0xe06c75]].forEach(function(d) {
  var s = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 20, 20),
    new THREE.MeshStandardMaterial({ color: d[3], roughness: 0.4 })
  );
  s.position.set(d[0], d[1], d[2]);
  s.userData.originalColor = d[3];
  scene.add(s);
  spheres.push(s);
});

var raycaster  = new THREE.Raycaster();
var mouse      = new THREE.Vector2();
var dragging   = null;    // which sphere is being dragged
var dragPlane  = null;    // the invisible XZ plane at sphere's height
var planeHit   = new THREE.Vector3();

function getMouse(e) {
  var rect = cv.getBoundingClientRect();
  mouse.x =  (e.clientX - rect.left) / rect.width  * 2 - 1;
  mouse.y = -(e.clientY - rect.top)  / rect.height * 2 + 1;
}

cv.addEventListener('mousedown', function(e) {
  getMouse(e);
  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(spheres, false);
  if (hits.length > 0) {
    dragging  = hits[0].object;
    dragging.material.emissive.set(0x333333);
    // ── YOUR CODE: create a horizontal drag plane at sphere's Y ─────────────
    // dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -dragging.position.y);
    cv.style.cursor = 'grabbing';
  }
});

cv.addEventListener('mousemove', function(e) {
  getMouse(e);
  if (!dragging) return;
  raycaster.setFromCamera(mouse, camera);

  // ── YOUR CODE: intersect drag plane and update sphere position ────────────
  // if (raycaster.ray.intersectPlane(dragPlane, planeHit)) {
  //   dragging.position.x = planeHit.x;
  //   dragging.position.z = planeHit.z;
  // }
});

cv.addEventListener('mouseup', function() {
  if (dragging) {
    dragging.material.emissive.set(0x000000);
    dragging = null;
    cv.style.cursor = 'default';
  }
});

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  info.textContent = spheres.map(function(s, i) {
    return 'sphere' + i + ': (' + s.position.x.toFixed(1)+', '+s.position.z.toFixed(1) + ')';
  }).join('   ');
}
animate();`,
      outputHeight: 400,
    },

    // ── Cell 5: Coding Challenge 2 — Hover Face Highlight ────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Highlight the Hovered Triangle Face

When hovering over an object, highlight only the specific triangle face under the cursor by displaying a small bright "face indicator" mesh positioned at the hit point and oriented along the face normal.

\`\`\`js
// From the hit data:
var pt  = hits[0].point;           // world position on face
var n   = hits[0].face.normal;     // face normal (object space!)
// Transform normal to world space:
var worldNormal = n.clone().transformDirection(hits[0].object.matrixWorld);
// Create a small indicator disc:
faceIndicator.position.copy(pt);
faceIndicator.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), worldNormal);
\`\`\`

The starter code has the indicator mesh set up — your job is to update it each frame from the raycast hit data.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 100);
camera.position.set(0, 2, 7);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 2), {position:new THREE.Vector3(5,10,5)}));

// Pickable objects
var pickable = [];
var box  = new THREE.Mesh(new THREE.BoxGeometry(2,2,2),
  new THREE.MeshStandardMaterial({ color:0x4466aa, roughness:0.5 }));
box.position.x = -2;
var torus = new THREE.Mesh(new THREE.TorusGeometry(0.9,0.3,16,64),
  new THREE.MeshStandardMaterial({ color:0x664488, roughness:0.5 }));
torus.position.x = 2;
scene.add(box, torus);
pickable.push(box, torus);

// Face indicator disc (small flat cylinder, placed at hit point)
var faceIndicator = new THREE.Mesh(
  new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16),
  new THREE.MeshBasicMaterial({ color: 0xf5a623, transparent: true, opacity: 0.8 })
);
faceIndicator.visible = false;
scene.add(faceIndicator);

// Normal arrow
var normalArrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 0),
  0.6, 0xf5a623, 0.12, 0.06
);
normalArrow.visible = false;
scene.add(normalArrow);

var raycaster = new THREE.Raycaster();
var mouse     = new THREE.Vector2();
var upVec     = new THREE.Vector3(0, 1, 0);

cv.addEventListener('mousemove', function(e) {
  var rect = cv.getBoundingClientRect();
  mouse.x =  (e.clientX - rect.left) / rect.width  * 2 - 1;
  mouse.y = -(e.clientY - rect.top)  / rect.height * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(pickable, false);

  if (hits.length > 0) {
    var h = hits[0];

    // ── YOUR CODE: position and orient the face indicator ─────────────────────
    // Offset slightly along the world normal so it doesn't z-fight with the surface
    // var worldNormal = h.face.normal.clone().transformDirection(h.object.matrixWorld);
    // var offset = worldNormal.clone().multiplyScalar(0.02);
    // faceIndicator.position.copy(h.point).add(offset);
    // faceIndicator.quaternion.setFromUnitVectors(upVec, worldNormal);
    // faceIndicator.visible = true;
    // normalArrow.position.copy(h.point).add(offset);
    // normalArrow.setDirection(worldNormal);
    // normalArrow.visible = true;

    info.textContent =
      'hit: ' + h.object.geometry.type + '\n' +
      'point: (' + h.point.x.toFixed(3)+', '+h.point.y.toFixed(3)+', '+h.point.z.toFixed(3) + ')\n' +
      'faceIndex: ' + h.faceIndex;
      // + '\nworld normal: (' + worldNormal.x.toFixed(2)+', '+worldNormal.y.toFixed(2)+', '+worldNormal.z.toFixed(2) + ')';
  } else {
    faceIndicator.visible = false;
    normalArrow.visible   = false;
    info.textContent = 'Hover over an object';
  }
});

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();
  torus.rotation.y = t * 0.4;
  torus.rotation.x = t * 0.2;
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 400,
    },

    // ── Cell 6: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `The user clicks the canvas. You raycast and the \`intersects\` array has 3 elements. Which one is the correct "clicked object"?`,
      options: [
        { label: 'A', text: 'intersects[2] — the last element is closest to the camera.' },
        { label: 'B', text: 'intersects[0] — the array is sorted by distance, closest first.' },
        { label: 'C', text: 'You must sort the array yourself by distance before using it.' },
        { label: 'D', text: 'All 3 are equally valid — pick the one whose geometry.type matches what you want.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The Raycaster always returns intersections sorted by distance from the ray origin, closest first. intersects[0] is the frontmost hit — the one the user intends to click. You only need to look at all elements if you specifically want all hits (e.g., for transparency where you want to show colour mixing through layers).',
      failMessage: 'The answer is B. Three.js\'s raycaster returns results in order of distance from the ray origin — closest first. intersects[0] is the frontmost object and almost always the intended click target. No sorting is needed. The only time you iterate the full array is when you want all intersections (e.g., colour mixing for transparent overlapping objects).',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `You have a scene with 5000 trees. The user clicks to select a tree. \`raycaster.intersectObjects(scene.children, true)\` is extremely slow. What is the best performance fix?`,
      options: [
        { label: 'A', text: 'Set raycaster.near = 0 and raycaster.far = 1 to limit the test distance.' },
        { label: 'B', text: 'Maintain a dedicated pickable array containing only the 5000 tree trunks, not the entire scene hierarchy. Also consider using instanced mesh with manual AABB pre-test.' },
        { label: 'C', text: 'Use a Web Worker to run raycasting in parallel on a separate thread.' },
        { label: 'D', text: 'Reduce the tree polygon count so each intersection test is cheaper.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Testing 5000 trees with full geometry recursion is O(triangles × 5000) per click. Solutions: (1) pass only the specific pickable objects, (2) use raycaster.layers to mark non-clickable objects and exclude them, (3) use instanced mesh (InstancedMesh) where raycasting tests instances not individual meshes, (4) implement spatial acceleration (octree/BVH) using a library like three-mesh-bvh. Reducing polygon count (D) helps but doesn\'t scale for thousands of objects.',
      failMessage: 'The answer is B. Passing scene.children with recursive=true tests every triangle in every object in the scene. The fix: maintain a focused pickable list. Further optimisations: raycaster.layers to exclude non-clickable objects, InstancedMesh for many identical objects, or a BVH (bounding volume hierarchy) acceleration structure via three-mesh-bvh — this takes raycasting from O(n·triangles) to O(log n) per object.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_4_2 }

export default {
  id: 'three-js-2-4-2-raycasting',
  slug: 'raycasting-mouse-interaction',
  chapter: 'three-js-2.4',
  order: 2,
  title: LESSON_3JS2_4_2.title,
  subtitle: LESSON_3JS2_4_2.subtitle,
  tags: ['three-js', 'raycasting', 'mouse-picking', 'interaction', 'ndccoords', 'unprojection', 'selection', 'cad'],
  hook: {
    question: 'The user clicks at screen pixel (640, 360). Your 3D scene has 500 objects. Which one did they click — and what is the actual 3D point on its surface at the exact hit location?',
    realWorldContext: 'Mouse picking is the foundation of every interactive 3D tool: CAD face selection, game object clicking, map hotspots, 3D UI buttons. Understanding the full unprojection pipeline — from screen pixel to world-space ray to triangle intersection — demystifies how all these systems work.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Raycasting = shoot a ray (point + direction) into the scene, find what it hits.',
      'Screen → NDC: x = (clientX/width)*2-1, y = -(clientY/height)*2+1. Y flipped in WebGL.',
      'raycaster.setFromCamera(ndcVec2, camera): internally runs full inverse projection transform.',
      'intersectObjects(array) returns hits sorted by distance — intersects[0] is the closest.',
      'Hit record: distance, point (world), face (triangle indices + normal), faceIndex, object, uv.',
      'Performance: pass only pickable objects, not the full scene. Reuse the mouse Vector2.',
    ],
    callouts: [
      { type: 'important', title: 'Y axis is flipped', body: 'Screen Y=0 is the top. NDC Y=+1 is the top. The conversion: ndcY = -(clientY / height) * 2 + 1. Forgetting the negation causes picks to be mirrored vertically.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_4_2.title, props: { lesson: LESSON_3JS2_4_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Pipeline: pixel → NDC → setFromCamera → ray in world space → intersectObjects → hit records.',
    'intersects[0] = closest hit. Always use this unless testing transparency stacking.',
    'hit.point = world position. hit.object.worldToLocal(hit.point) = local position.',
    'Drag along plane: raycast against a THREE.Plane on mousedown, slide on mousemove. Avoids picking issues.',
    'raycaster.layers: exclude helpers/grid from picking without a separate pickable array.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Pipeline: pixel → NDC → setFromCamera → ray in world space → intersectObjects → hit records." Why must mouse pixel coordinates be converted to NDC before raycasting?',
      options: [
        'NDC is the coordinate space the GPU uses for all calculations',
        'setFromCamera expects coordinates in NDC (−1 to +1 range) to correctly unproject through the camera\'s view and projection matrices into world space',
        'Pixel coordinates cannot be used in JavaScript',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"intersects[0] = closest hit." You call raycaster.intersectObjects(meshes) and get 3 results. Which result should you use for picking?',
      options: [
        'The last result — it is the most recently processed',
        'The first result (intersects[0]) — results are sorted by distance, closest first. This is the visible object the user clicked',
        'All results — combine them for accurate picking',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Drag along plane: raycast against a THREE.Plane on mousemove." Why use a Plane instead of re-raycasting against the mesh during drag?',
      options: [
        'Plane raycasting is more accurate than mesh raycasting',
        'During drag, the cursor may move off the mesh — raycasting against a Plane gives stable, continuous hit points even when the cursor is not directly over the object',
        'Mesh raycasting is not supported during mouse move events',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"raycaster.layers: exclude helpers/grid from picking without a separate pickable array." How do layers work for this exclusion?',
      options: [
        'Layers filter by Z depth — objects on a higher layer are picked first',
        'You assign helper objects to a layer not included in raycaster.layers.mask. The raycaster skips any object whose layer bits do not intersect the mask, so helpers are never returned as hits',
        'Layers can only be used for visibility, not raycasting',
      ],
      correct: 1,
    },
  ],
}
