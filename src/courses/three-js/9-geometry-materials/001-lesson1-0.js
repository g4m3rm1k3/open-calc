// Three.js 2 · Chapter 1 · Lesson 0
// BufferGeometry — How the GPU Gets Your Shapes

const LESSON_3JS2_1_0 = {
  title: 'BufferGeometry — Talking to the GPU',
  subtitle: 'Triangles, flat arrays, vertex attributes, and why the GPU wants data laid out the way it does.',
  sequential: true,

  cells: [

    // ── Cell 1: Why Flat Arrays? ──────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Only Primitive: The Triangle

GPUs only know how to draw **triangles**. Every shape — cube, sphere, complex mesh — is an approximation made of triangles. A cube has 6 faces × 2 triangles = 12 triangles. A smooth sphere with 64 segments has thousands.

This is why polygonal 3D graphics always involves "how many triangles is good enough?" More triangles = smoother curves + more GPU work.

---

### BufferGeometry — What Is a Buffer?

When Three.js sends geometry to the GPU, it sends **buffers** — flat arrays of numbers packed tightly in contiguous memory. The GPU processes these in parallel across thousands of cores.

\`BufferGeometry\` is Three.js's representation of this data before it is uploaded to the GPU.

Every geometry has **attributes** — named arrays describing each vertex:

| Attribute | What it stores | Type |
|-----------|---------------|------|
| \`position\` | XYZ coordinates of each vertex | \`Float32Array\`, 3 floats per vertex |
| \`normal\` | Surface normal at each vertex (for lighting) | \`Float32Array\`, 3 floats per vertex |
| \`uv\` | Texture coordinates (U, V) | \`Float32Array\`, 2 floats per vertex |
| \`color\` | Per-vertex color (optional) | \`Float32Array\`, 3 floats per vertex |

**Why flat arrays?** Because the GPU wants contiguous memory it can stream. An array of \`{x, y, z}\` JavaScript objects would require the GPU to chase pointers through the JS heap. A \`Float32Array\` is laid out as \`[x0, y0, z0, x1, y1, z1, ...]\` in a single contiguous block — exactly what a **vertex buffer object (VBO)** expects. This is the same layout in WebGL, OpenGL, and Vulkan.

---

### The Index Buffer

Without indexing, a cube (8 vertices, 12 triangles) requires 36 vertex records (3 per triangle × 12). With an **index buffer** — an array of integers saying which vertices form each triangle — you store 24 vertices and 36 indices, and vertices are reused.

\`\`\`
Non-indexed: [v0, v1, v2,  v3, v4, v5,  ...]  ← 36 vertices for 12 triangles
Indexed:     [v0, v1, v2, v3, ...]  indices: [0,1,2,  0,2,3,  ...]  ← 8 vertices, 36 indices
\`\`\`

For complex meshes this is a massive memory saving. Every built-in geometry in Three.js uses indexed buffers internally.`,
    },

    // ── Cell 2: Built-in Geometries ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Built-in Geometry Classes

Three.js provides many pre-built geometries. All produce \`BufferGeometry\` internally — they are convenience factories, not a different system.

| Class | Description | Key Parameters |
|-------|-------------|----------------|
| \`BoxGeometry\` | Rectangular box | \`w, h, d, wSeg, hSeg, dSeg\` |
| \`SphereGeometry\` | UV sphere | \`radius, widthSeg, heightSeg\` |
| \`CylinderGeometry\` | Cylinder or cone | \`rTop, rBottom, height, radialSeg\` |
| \`PlaneGeometry\` | Flat rectangle | \`w, h, wSeg, hSeg\` |
| \`TorusGeometry\` | Donut | \`radius, tube, radialSeg, tubularSeg\` |
| \`TorusKnotGeometry\` | Knotted torus | \`radius, tube, tubularSeg, radialSeg, p, q\` |
| \`IcosahedronGeometry\` | 20-face icosahedron | \`radius, detail\` |
| \`BufferGeometry\` | Custom — you fill the buffers | — |

**Segment parameters** subdivide faces. A \`SphereGeometry(1, 4, 4)\` is a blocky octahedron-like shape. A \`SphereGeometry(1, 64, 64)\` looks like a smooth sphere. More segments = smoother approximation + more triangles.

---

### Winding Order & Back-Face Culling

When the GPU renders a triangle, it checks whether the vertices are listed **counter-clockwise (CCW)** or **clockwise (CW)** from the camera's perspective:

- **CCW = front face** — rendered by default
- **CW = back face** — culled (discarded) by default

This **back-face culling** halves the work for closed objects like a cube, where you never see inside. It is a core GPU optimisation and a source of bugs: if you accidentally flip a triangle's winding, it appears invisible from the front.

\`\`\`
Counter-clockwise (front):    Clockwise (back — culled):
       v1                            v1
      /  \\                          /  \\
     /    \\                        /    \\
   v0──────v2                    v2──────v0
\`\`\`

Disable culling with \`side: THREE.DoubleSide\` on the material — useful for open surfaces like planes, cloth, or sheets.`,
    },

    // ── Cell 3: Geometry Explorer Demo ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Geometry Explorer

Select a geometry from the buttons. Toggle wireframe mode to see the underlying triangles. Watch how segment count changes the triangle density — high-segment sphere vs low-segment sphere are the same math, but very different approximations.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:flex;gap:6px;flex-wrap:wrap">
  <button id="btn-box"   style="padding:5px 12px;border-radius:6px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:11px;cursor:pointer">Box</button>
  <button id="btn-sph"   style="padding:5px 12px;border-radius:6px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:11px;cursor:pointer">Sphere</button>
  <button id="btn-cyl"   style="padding:5px 12px;border-radius:6px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:11px;cursor:pointer">Cylinder</button>
  <button id="btn-tor"   style="padding:5px 12px;border-radius:6px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:11px;cursor:pointer">Torus</button>
  <button id="btn-icos"  style="padding:5px 12px;border-radius:6px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:11px;cursor:pointer">Icosahedron</button>
  <button id="btn-wire"  style="padding:5px 12px;border-radius:6px;border:1px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Toggle Wireframe</button>
</div>
<canvas id="cv" style="display:block;border-radius:0 0 6px 6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 1000);
camera.position.set(0, 1.5, 4);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
var dLight = new THREE.DirectionalLight(0xffffff, 2);
dLight.position.set(5, 8, 5);
scene.add(dLight);

var GEOMETRIES = {
  box:  new THREE.BoxGeometry(1.5, 1.5, 1.5, 3, 3, 3),
  sph:  new THREE.SphereGeometry(1, 32, 32),
  cyl:  new THREE.CylinderGeometry(0.6, 0.9, 2, 24),
  tor:  new THREE.TorusGeometry(0.8, 0.35, 16, 48),
  icos: new THREE.IcosahedronGeometry(1, 2),
};

var solidMat = new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness: 0.4, metalness: 0.1 });
var wireMat  = new THREE.MeshBasicMaterial({ color: 0x64d8cb, wireframe: true });
var mesh = new THREE.Mesh(GEOMETRIES.box, solidMat);
scene.add(mesh);

var isWire = false;
document.getElementById('btn-wire').onclick = function() {
  isWire = !isWire;
  mesh.material = isWire ? wireMat : solidMat;
};

function setGeo(name) {
  mesh.geometry = GEOMETRIES[name];
  var g = mesh.geometry;
  var verts = g.attributes.position.count;
  var tris  = g.index ? g.index.count / 3 : verts / 3;
  info.textContent = name + ' — vertices: ' + verts + '  triangles: ' + Math.round(tris);
}

document.getElementById('btn-box').onclick  = function() { setGeo('box');  };
document.getElementById('btn-sph').onclick  = function() { setGeo('sph');  };
document.getElementById('btn-cyl').onclick  = function() { setGeo('cyl');  };
document.getElementById('btn-tor').onclick  = function() { setGeo('tor');  };
document.getElementById('btn-icos').onclick = function() { setGeo('icos'); };
setGeo('box');

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;
  mesh.rotation.y = t * 0.5;
  mesh.rotation.x = t * 0.2;
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 420,
    },

    // ── Cell 4: Custom Triangle (concept) ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Building Custom BufferGeometry

Three.js lets you build geometry from scratch by directly filling the attribute buffers. This is what every built-in geometry does under the hood:

\`\`\`js
const geometry = new THREE.BufferGeometry();

// Three vertices: [x0,y0,z0,  x1,y1,z1,  x2,y2,z2]
const positions = new Float32Array([
  -1, -1, 0,   // vertex 0 — bottom left
   0,  1, 0,   // vertex 1 — top
   1, -1, 0,   // vertex 2 — bottom right
]);

// BufferAttribute wraps a TypedArray. 3 = itemSize (x,y,z per vertex)
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Per-vertex colours: RGB, each component 0–1
const colors = new Float32Array([
  1, 0, 0,   // vertex 0 — red
  0, 1, 0,   // vertex 1 — green
  0, 0, 1,   // vertex 2 — blue
]);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// material.vertexColors = true tells the GPU to interpolate per-vertex colours
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});

const triangle = new THREE.Mesh(geometry, material);
scene.add(triangle);
\`\`\`

**Vertex colour interpolation** (called Gouraud shading) is handled automatically by the GPU: each pixel inside the triangle gets a blend of the three vertex colours based on its barycentric coordinates.

After building custom geometry, you almost always want to call:
\`\`\`js
geometry.computeVertexNormals(); // estimate normals from face geometry
geometry.computeBoundingBox();   // compute AABB for collision/culling
\`\`\``,
    },

    // ── Cell 5: Coding Challenge 1 ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Build a Triangle from Scratch

Using \`THREE.BufferGeometry\`, create a triangle with these three vertices:
- Vertex 0: (-1.5, -1, 0) — color red
- Vertex 1: (0, 1.5, 0) — color green
- Vertex 2: (1.5, -1, 0) — color blue

The starter code has the geometry and material set up — you just need to fill in the \`positions\` and \`colors\` arrays and attach them with \`setAttribute\`.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 360);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/360, 0.1, 100);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

var geometry = new THREE.BufferGeometry();

// ── YOUR CODE ─────────────────────────────────────────────────────────────────
// 1. Create a Float32Array 'positions' with 3 vertices (9 values total)
//    Vertex 0: (-1.5, -1, 0)   Vertex 1: (0, 1.5, 0)   Vertex 2: (1.5, -1, 0)
var positions = new Float32Array([
  /* fill in: x0, y0, z0,  x1, y1, z1,  x2, y2, z2 */
]);

// 2. Create a Float32Array 'colors' with RGB per vertex (9 values total)
//    Vertex 0: red (1,0,0)   Vertex 1: green (0,1,0)   Vertex 2: blue (0,0,1)
var colors = new Float32Array([
  /* fill in: r0,g0,b0,  r1,g1,b1,  r2,g2,b2 */
]);

// 3. Attach the attributes
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

var material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
var triangle = new THREE.Mesh(geometry, material);
scene.add(triangle);

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  triangle.rotation.z = (performance.now() - t0) / 3000;
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 420,
    },

    // ── Cell 6: Coding Challenge 2 ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Wireframe Sphere & Triangle Count

The starter code creates two spheres: one with 4 segments and one with 32 segments. Your task:

1. Add wireframe rendering to **both** by creating a second \`MeshBasicMaterial({ wireframe: true })\` and using it with \`THREE.LineSegments\` wrapping each geometry (or by setting wireframe on the material directly)
2. Log (using the on-screen display) the **vertex count** and **triangle count** for each sphere
3. Observe how 4-segment vs 32-segment spheres look completely different despite having the same radius

**Hint:** \`geometry.attributes.position.count\` gives vertex count. For an indexed geometry, \`geometry.index.count / 3\` gives triangle count.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 300);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/300, 0.1, 100);
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);

// Low-detail sphere (4 segments = looks like a blocky diamond)
var geoLow  = new THREE.SphereGeometry(1, 4, 4);
// High-detail sphere (32 segments = smooth)
var geoHigh = new THREE.SphereGeometry(1, 32, 32);

var matBlue = new THREE.MeshBasicMaterial({ color: 0x4488cc, wireframe: true });
var matCyan = new THREE.MeshBasicMaterial({ color: 0x64d8cb, wireframe: true });

var meshLow  = new THREE.Mesh(geoLow,  matBlue);
var meshHigh = new THREE.Mesh(geoHigh, matCyan);
meshLow.position.x  = -1.8;
meshHigh.position.x =  1.8;
scene.add(meshLow, meshHigh);

// ── YOUR CODE: compute and display stats ──────────────────────────────────────
var vertsLow  = /* geoLow.attributes.position.count  */ '?';
var trisLow   = /* geoLow.index.count / 3            */ '?';
var vertsHigh = /* geoHigh.attributes.position.count */ '?';
var trisHigh  = /* geoHigh.index.count / 3           */ '?';

info.textContent =
  'Low  (4 seg):  vertices=' + vertsLow  + '  triangles=' + trisLow  + '\\n' +
  'High (32 seg): vertices=' + vertsHigh + '  triangles=' + trisHigh;

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;
  meshLow.rotation.y  = t * 0.6;
  meshHigh.rotation.y = t * 0.6;
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 380,
    },

    // ── Cell 7: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You have a triangle (3 vertices). You want to add per-vertex colors so each vertex is a different color. You call \`geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))\`. What else must you do for the colors to appear?`,
      options: [
        { label: 'A', text: 'Call geometry.computeVertexNormals() to generate color data from the normals.' },
        { label: 'B', text: 'Set vertexColors: true on the material — otherwise the material ignores the color attribute and uses its own flat color.' },
        { label: 'C', text: 'Nothing — Three.js automatically detects the color attribute and enables vertex colors.' },
        { label: 'D', text: 'Call geometry.setAttribute("vertexColors", ...) with the same data under a different name.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The material must opt in to vertex colors with vertexColors: true (or THREE.VertexColors in older API versions). Without this, the material ignores the color attribute entirely and renders using its own flat color property. The GPU interpolates vertex colors across the triangle face using barycentric coordinates.',
      failMessage: 'The answer is B. Setting the color attribute on the geometry is not enough — the material also needs vertexColors: true to tell the renderer to use per-vertex color data instead of the material\'s own flat color. This opt-in exists because materials can have their own color independently of vertex data.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `Why does Three.js store vertex positions as a flat \`Float32Array\` ([x0,y0,z0, x1,y1,z1, ...]) instead of an array of JavaScript objects ([{x:0,y:0,z:0}, {x:1,y:0,z:0}, ...])?`,
      options: [
        { label: 'A', text: 'Because Float32Array supports fewer JavaScript operations, which prevents accidentally modifying geometry.' },
        { label: 'B', text: 'Because a flat TypedArray occupies contiguous memory that can be uploaded directly to the GPU as a VBO, avoiding pointer chasing through the JavaScript heap.' },
        { label: 'C', text: 'Because JavaScript objects cannot store floating-point numbers with sufficient precision for 3D graphics.' },
        { label: 'D', text: 'Because Three.js was written before JavaScript objects were available in browsers.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The GPU processes vertices on thousands of cores simultaneously and expects data in a contiguous block of memory — a Vertex Buffer Object (VBO). A Float32Array is a TypedArray: it stores raw bytes at a fixed memory address. An array of JS objects is scattered across the heap with pointers, which cannot be uploaded to the GPU efficiently. This same constraint exists in WebGL, OpenGL, and Vulkan.',
      failMessage: 'The answer is B. The GPU expects data in contiguous memory (a VBO). Float32Array is a TypedArray — it stores bytes in a single contiguous block and can be transferred directly to the GPU. An array of JS objects is scattered through the heap with pointer indirection that the GPU cannot follow. This is why all graphics APIs (WebGL, OpenGL, Vulkan, DirectX) require TypedArrays or C-style arrays.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_1_0 }

export default {
  id: 'three-js-2-1-0-buffer-geometry',
  slug: 'buffer-geometry',
  chapter: 'three-js-2.1',
  order: 0,
  title: LESSON_3JS2_1_0.title,
  subtitle: LESSON_3JS2_1_0.subtitle,
  tags: ['three-js', 'buffergeometry', 'vertices', 'triangles', 'float32array', 'vbo', 'winding-order', 'normals'],
  hook: {
    question: 'The GPU draws triangles. A sphere is not a triangle. So how does a sphere reach the GPU — and why does Three.js store its vertex data in a flat array of raw floats instead of an array of {x,y,z} objects?',
    realWorldContext: 'Every 3D API — WebGL, OpenGL, Vulkan, DirectX, Metal — feeds the GPU via the same mechanism: contiguous TypedArrays uploaded to the GPU as Vertex Buffer Objects. Understanding BufferGeometry means understanding the universal language of the GPU.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'GPUs only draw triangles — every shape is an approximation made of triangles.',
      'BufferGeometry stores vertex data in flat Float32Arrays: [x0,y0,z0, x1,y1,z1, ...].',
      'Flat TypedArrays map directly to GPU VBOs — no pointer chasing through JS heap objects.',
      'Attributes: position (3 floats/vertex), normal (3), uv (2), color (3).',
      'Index buffer: integers pointing to vertices — allows reuse, halves memory for closed meshes.',
      'Winding order: CCW = front face, CW = back face (culled). Use DoubleSide to disable culling.',
    ],
    callouts: [
      { type: 'important', title: 'Why Float32Array?', body: 'The GPU expects contiguous memory (a VBO). Float32Array is a TypedArray — raw bytes at a fixed address, directly uploadable. JS {x,y,z} objects are scattered across the heap and cannot be sent to the GPU directly.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_1_0.title, props: { lesson: LESSON_3JS2_1_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'BufferGeometry = named Float32Arrays (attributes) + an index array, uploaded to GPU as VBOs.',
    'position attribute: itemSize=3 means 3 floats per vertex (x,y,z).',
    'geometry.setAttribute("position", new BufferAttribute(arr, 3)) binds the array.',
    'CCW winding = front face. Swap two vertices to flip normal direction.',
    'computeVertexNormals() estimates normals from face geometry — required for lit materials.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
