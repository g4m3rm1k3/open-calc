// Three.js 2 · Chapter 5 · Lesson 1
// Parametric Surfaces — Building Custom Geometry from Functions

const LESSON_3JS2_5_1 = {
  title: 'Parametric Surfaces',
  subtitle: 'Building custom BufferGeometry from (u, v) functions — the mathematical foundation of CAD surface modelling.',
  sequential: true,

  cells: [

    // ── Cell 1: What Is a Parametric Surface? ─────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Parametric Surfaces — Two-Parameter Geometry

A **parametric surface** extends the curve concept to two dimensions. Instead of one parameter \`t\`, you have two: \`u\` and \`v\`, both ranging from 0 to 1. The surface function maps each (u, v) pair to a 3D point:

\`\`\`
P(u, v) → (x, y, z)

Saddle surface (hyperbolic paraboloid):
  x(u, v) = u
  y(u, v) = u² - v²
  z(u, v) = v

Torus:
  x(u, v) = (R + r·cos(v)) · cos(u)    where u, v ∈ [0, 2π]
  y(u, v) = (R + r·cos(v)) · sin(u)
  z(u, v) = r · sin(v)

Möbius Strip:
  x(u, v) = (R + v·cos(u/2)) · cos(u)
  y(u, v) = (R + v·cos(u/2)) · sin(u)
  z(u, v) = v · sin(u/2)
\`\`\`

The saddle surface is the shape of a Pringles chip, a saddle seat, and a hyperbolic cooling tower. CAD tools use much more sophisticated parameterisations (NURBS), but the principle is identical.

---

### Building the Mesh from a Surface Function

To turn a parametric function into a \`BufferGeometry\`:

1. **Sample** the function at a grid of (u, v) points — the "resolution" of your mesh
2. **Compute normals** at each point via numerical differentiation of the partial derivatives
3. **Build the index buffer** by connecting neighbouring grid points into triangles

\`\`\`js
function buildParametricGeometry(func, uSegments, vSegments) {
  // func(u, v, targetVector3) fills the target with the surface point
  // u, v ∈ [0, 1]

  const positions = [];
  const normals   = [];
  const uvs       = [];
  const indices   = [];
  const EPS = 0.001;  // small step for numerical differentiation

  for (let vi = 0; vi <= vSegments; vi++) {
    for (let ui = 0; ui <= uSegments; ui++) {
      const u = ui / uSegments;
      const v = vi / vSegments;

      // Surface point
      const p = new THREE.Vector3();
      func(u, v, p);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, v);

      // Normal via numerical differentiation (central differences):
      // dP/du ≈ (P(u+ε,v) - P(u-ε,v)) / (2ε)
      // dP/dv ≈ (P(u,v+ε) - P(u,v-ε)) / (2ε)
      // normal = normalize(dP/du × dP/dv)
      const pu1 = new THREE.Vector3(); func(Math.min(u+EPS,1), v, pu1);
      const pu2 = new THREE.Vector3(); func(Math.max(u-EPS,0), v, pu2);
      const pv1 = new THREE.Vector3(); func(u, Math.min(v+EPS,1), pv1);
      const pv2 = new THREE.Vector3(); func(u, Math.max(v-EPS,0), pv2);

      const dU = pu1.sub(pu2);
      const dV = pv1.sub(pv2);
      const n  = dU.cross(dV).normalize();
      normals.push(n.x, n.y, n.z);
    }
  }

  // Index buffer: each (ui, vi) quad → 2 triangles
  for (let vi = 0; vi < vSegments; vi++) {
    for (let ui = 0; ui < uSegments; ui++) {
      const a = vi * (uSegments + 1) + ui;
      const b = a + 1;
      const c = a + (uSegments + 1);
      const d = c + 1;
      indices.push(a, c, b,   b, c, d);  // CCW winding
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('normal',   new THREE.BufferAttribute(new Float32Array(normals),   3));
  geo.setAttribute('uv',       new THREE.BufferAttribute(new Float32Array(uvs),       2));
  geo.setIndex(indices);
  return geo;
}
\`\`\`

**Partial derivatives and the normal:** At each point on the surface, the two partial derivative vectors \`dP/du\` and \`dP/dv\` are tangent to the surface. Their cross product is perpendicular — the surface normal. Numerical differentiation approximates this via finite differences.`,
    },

    // ── Cell 2: Surface Gallery Demo ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Parametric Surface Gallery

Six classic mathematical surfaces, all built from the same \`buildParametricGeometry\` function. Switch between them and toggle wireframe to see the underlying mesh grid.

Each surface comes with its mathematical definition in the info panel.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:flex;gap:5px;flex-wrap:wrap">
  <button class="sbtn" data-key="saddle"  style="padding:4px 10px;border-radius:5px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Saddle</button>
  <button class="sbtn" data-key="sinc"    style="padding:4px 10px;border-radius:5px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Sinc Wave</button>
  <button class="sbtn" data-key="torus"   style="padding:4px 10px;border-radius:5px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Torus</button>
  <button class="sbtn" data-key="mobius"  style="padding:4px 10px;border-radius:5px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Möbius</button>
  <button class="sbtn" data-key="enneper" style="padding:4px 10px;border-radius:5px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Enneper</button>
  <button class="sbtn" data-key="spring"  style="padding:4px 10px;border-radius:5px;border:none;background:#1e3a5f;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Spring</button>
  <button id="btn-wire" style="padding:4px 10px;border-radius:5px;border:1px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:10px;cursor:pointer;margin-left:6px">Wireframe</button>
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
camera.position.set(0, 4, 10);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
var d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(5,8,5); scene.add(d);

// ── GEOMETRY BUILDER ──────────────────────────────────────────────────────────
function buildGeo(func, uSeg, vSeg) {
  var pos=[], nor=[], uvArr=[], idx=[];
  var EPS=0.001;
  var p=new THREE.Vector3(), pu1=new THREE.Vector3(), pu2=new THREE.Vector3();
  var pv1=new THREE.Vector3(), pv2=new THREE.Vector3();
  for (var vi=0;vi<=vSeg;vi++) {
    for (var ui=0;ui<=uSeg;ui++) {
      var u=ui/uSeg, v=vi/vSeg;
      func(u,v,p); pos.push(p.x,p.y,p.z); uvArr.push(u,v);
      func(Math.min(u+EPS,1),v,pu1); func(Math.max(u-EPS,0),v,pu2);
      func(u,Math.min(v+EPS,1),pv1); func(u,Math.max(v-EPS,0),pv2);
      var dU=pu1.clone().sub(pu2), dV=pv1.clone().sub(pv2);
      var n=dU.cross(dV).normalize(); nor.push(n.x,n.y,n.z);
    }
  }
  for (var vi2=0;vi2<vSeg;vi2++) for (var ui2=0;ui2<uSeg;ui2++) {
    var a=vi2*(uSeg+1)+ui2, b=a+1, c=a+(uSeg+1), dd=c+1;
    idx.push(a,c,b, b,c,dd);
  }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));
  g.setAttribute('normal',  new THREE.BufferAttribute(new Float32Array(nor),3));
  g.setAttribute('uv',      new THREE.BufferAttribute(new Float32Array(uvArr),2));
  g.setIndex(idx); return g;
}

// ── SURFACE FUNCTIONS ──────────────────────────────────────────────────────────
var SURFACES = {
  saddle:  { desc:'z = x² - y²  (hyperbolic paraboloid)', fn: function(u,v,t){var x=(u-.5)*6,y=(v-.5)*6;t.set(x,0.15*(x*x-y*y),y);} },
  sinc:    { desc:'z = sin(r)/r  (sinc function)', fn: function(u,v,t){var x=(u-.5)*10,y=(v-.5)*10,r=Math.sqrt(x*x+y*y);t.set(x,r<0.01?1.5:1.5*Math.sin(r*1.5)/(r),y);} },
  torus:   { desc:'Torus: R=3, r=1', fn: function(u,v,t){var R=3,r=1,th=u*Math.PI*2,ph=v*Math.PI*2;t.set((R+r*Math.cos(ph))*Math.cos(th),r*Math.sin(ph),(R+r*Math.cos(ph))*Math.sin(th));} },
  mobius:  { desc:'Möbius strip (one-sided surface)', fn: function(u,v,t){var th=u*Math.PI*2,w=(v-.5)*2,R=3;t.set((R+w*Math.cos(th/2))*Math.cos(th),(R+w*Math.cos(th/2))*Math.sin(th),w*Math.sin(th/2));} },
  enneper: { desc:'Enneper minimal surface (zero mean curvature)', fn: function(u,v,t){var s=(u-.5)*3,r=(v-.5)*3;t.set(s-s*s*s/3+s*r*r, r-r*r*r/3+r*s*s, s*s-r*r);t.multiplyScalar(0.5);} },
  spring:  { desc:'Helical spring: 3 turns', fn: function(u,v,t){var turns=3,th=u*Math.PI*2*turns,ph=v*Math.PI*2,R=2,r=0.4,pitch=0.5;t.set((R+r*Math.cos(ph))*Math.cos(th),r*Math.sin(ph)+pitch*th/(Math.PI*2),(R+r*Math.cos(ph))*Math.sin(th));} },
};

var mat = new THREE.MeshStandardMaterial({ color:0x64d8cb, roughness:0.3, metalness:0.1, side:THREE.DoubleSide });
var mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
scene.add(mesh);

function setSurface(key) {
  var s = SURFACES[key];
  mesh.geometry = buildGeo(s.fn, 50, 50);
  info.textContent = key + ': ' + s.desc;
}
setSurface('saddle');

document.querySelectorAll('.sbtn').forEach(function(btn) {
  btn.onclick = function() { setSurface(this.dataset.key); };
});
document.getElementById('btn-wire').onclick = function() {
  mat.wireframe = !mat.wireframe;
};

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();
  mesh.rotation.y = t * 0.3;
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 470,
    },

    // ── Cell 3: Coding Challenge 1 — Your Own Surface ────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Build Your Own Parametric Surface

Using the \`buildParametricGeometry\` function (provided in starter code), define and render your own surface. Choose one or create your own:

**Option A — Ripple surface:**
\`\`\`js
function ripple(u, v, target) {
  var x = (u - 0.5) * 8;
  var z = (v - 0.5) * 8;
  var r = Math.sqrt(x*x + z*z);
  target.set(x, Math.sin(r * 2) * 0.5, z);
}
\`\`\`

**Option B — Cylinder-wrapped sine wave:**
\`\`\`js
function waveCylinder(u, v, target) {
  var theta  = u * Math.PI * 2;
  var height = (v - 0.5) * 4;
  var radius = 2 + 0.5 * Math.sin(v * Math.PI * 4);  // radius varies with height
  target.set(radius * Math.cos(theta), height, radius * Math.sin(theta));
}
\`\`\`

**Option C — Your own!** Combine any trig functions. The only rule: map (u,v) ∈ [0,1]² → (x,y,z).`,
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
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
var d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(5,8,5); scene.add(d);

// Geometry builder (same as lesson — given to you)
function buildParametricGeometry(func, uSeg, vSeg) {
  var pos=[], nor=[], uvArr=[], idx=[];
  var EPS=0.001;
  var p=new THREE.Vector3(), pu1=new THREE.Vector3(), pu2=new THREE.Vector3();
  var pv1=new THREE.Vector3(), pv2=new THREE.Vector3();
  for (var vi=0;vi<=vSeg;vi++) {
    for (var ui=0;ui<=uSeg;ui++) {
      var u=ui/uSeg, v=vi/vSeg;
      func(u,v,p); pos.push(p.x,p.y,p.z); uvArr.push(u,v);
      func(Math.min(u+EPS,1),v,pu1); func(Math.max(u-EPS,0),v,pu2);
      func(u,Math.min(v+EPS,1),pv1); func(u,Math.max(v-EPS,0),pv2);
      var dU=pu1.clone().sub(pu2), dV=pv1.clone().sub(pv2);
      var n=dU.cross(dV).normalize(); nor.push(n.x,n.y,n.z);
    }
  }
  for (var vi2=0;vi2<vSeg;vi2++) for (var ui2=0;ui2<uSeg;ui2++) {
    var a=vi2*(uSeg+1)+ui2, b=a+1, c=a+(uSeg+1), dd=c+1;
    idx.push(a,c,b, b,c,dd);
  }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));
  g.setAttribute('normal',  new THREE.BufferAttribute(new Float32Array(nor),3));
  g.setAttribute('uv',      new THREE.BufferAttribute(new Float32Array(uvArr),2));
  g.setIndex(idx); return g;
}

// ── YOUR CODE: define your surface function ────────────────────────────────────
function mySurface(u, v, target) {
  // Option A — ripple:
  var x = (u - 0.5) * 8;
  var z = (v - 0.5) * 8;
  var r = Math.sqrt(x*x + z*z);
  target.set(x, Math.sin(r * 2) * 0.5, z);

  // Option B — wave cylinder (uncomment to try):
  // var theta  = u * Math.PI * 2;
  // var height = (v - 0.5) * 4;
  // var radius = 2 + 0.5 * Math.sin(v * Math.PI * 4);
  // target.set(radius * Math.cos(theta), height, radius * Math.sin(theta));
}

// ── YOUR CODE: build geometry and create mesh ──────────────────────────────────
// var geo = buildParametricGeometry(mySurface, 50, 50);
// var mat = new THREE.MeshStandardMaterial({
//   color: 0x64d8cb, roughness: 0.3, side: THREE.DoubleSide
// });
// var surface = new THREE.Mesh(geo, mat);
// scene.add(surface);

// Also add wireframe overlay
// var wireMat = new THREE.MeshBasicMaterial({ color: 0x224444, wireframe: true });
// scene.add(new THREE.Mesh(geo, wireMat));

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();
  // if (surface) surface.rotation.y = t * 0.25;
  renderer.render(scene, camera);
  info.textContent = 'Build your surface! Uncomment the code and try Option A or B.';
}
animate();`,
      outputHeight: 440,
    },

    // ── Cell 4: Coding Challenge 2 — Animated Surface ────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Animate a Parametric Surface in Real Time

Update the vertex positions of a surface each frame by **modifying the position buffer** directly. This is much cheaper than rebuilding the geometry every frame.

**Technique:**
\`\`\`js
var geo = buildParametricGeometry(myFunc, 40, 40);
var posAttr = geo.attributes.position;

function tick(t) {
  for (var i = 0; i < posAttr.count; i++) {
    // Move each vertex's Y slightly using the frame time
    var x = posAttr.getX(i);
    var z = posAttr.getZ(i);
    var r = Math.sqrt(x*x + z*z);
    posAttr.setY(i, Math.sin(r - t * 2) * 0.5);  // animated ripple
  }
  posAttr.needsUpdate = true;    // REQUIRED — tells GPU to re-upload
  geo.computeVertexNormals();    // recompute normals for correct lighting
}
\`\`\`

Requirements:
1. Create a saddle or ripple surface (or your own) at 40×40 segments
2. Each frame, displace the Y value based on \`Math.sin(r - t * 2) * amplitude\`
3. Set \`posAttr.needsUpdate = true\`
4. Call \`geo.computeVertexNormals()\` to update shading`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 340);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/340, 0.1, 100);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
var d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(5,8,5); scene.add(d);

// Flat grid (base geometry — will be deformed in the animate loop)
var geo = new THREE.PlaneGeometry(8, 8, 40, 40);
geo.rotateX(-Math.PI / 2);  // lay flat on XZ plane
var posAttr = geo.attributes.position;

var mat  = new THREE.MeshStandardMaterial({ color: 0x64d8cb, roughness:0.4, side:THREE.DoubleSide });
var mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
// Wireframe overlay
scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color:0x1a3a3a, wireframe:true })));

var clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();

  // ── YOUR CODE: deform the plane vertices ─────────────────────────────────
  // for (var i = 0; i < posAttr.count; i++) {
  //   var x = posAttr.getX(i);
  //   var z = posAttr.getZ(i);
  //   var r = Math.sqrt(x*x + z*z);
  //   posAttr.setY(i, Math.sin(r * 1.5 - t * 2) * 0.5);
  // }
  // posAttr.needsUpdate = true;
  // geo.computeVertexNormals();

  renderer.render(scene, camera);
  info.textContent = 'Vertex count: ' + posAttr.count + '   t=' + t.toFixed(2);
}
animate();`,
      outputHeight: 420,
    },

    // ── Cell 5: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You modify a geometry's position buffer directly in the animate loop. The visual result looks correct, but after a few seconds the shading looks flat and wrong. What did you forget?`,
      options: [
        { label: 'A', text: 'You forgot to call geometry.dispose() and rebuild the geometry each frame.' },
        { label: 'B', text: 'You forgot to call geo.computeVertexNormals() after modifying positions. Normals are stored in a separate buffer and do not update automatically when positions change.' },
        { label: 'C', text: 'You forgot to call renderer.setRenderTarget(null) after rendering.' },
        { label: 'D', text: 'You forgot to set posAttr.needsUpdate = true on the normals attribute.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Normals are stored in a separate BufferAttribute (geometry.attributes.normal). When you change vertex positions, the normals do not update automatically — the surface shape changed but the lighting vectors still point in the old directions, causing wrong shading. Fix: after modifying positions, call geo.computeVertexNormals() to recompute the normals from the new triangle geometry, then set normals.needsUpdate = true (which computeVertexNormals does internally in Three.js r160+).',
      failMessage: 'The answer is B. Normals live in their own buffer (geometry.attributes.normal) separate from positions. Changing positions does not automatically update normals — you must call geo.computeVertexNormals() explicitly after modifying positions. This method recalculates normals from the new triangle geometry. Without this, the lighting computes as if the mesh still has its original flat shape.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `A parametric surface function is \`f(u, v) → (x, y, z)\` with u, v ∈ [0, 1]. The surface is sampled at 50×50 segments. How many vertices and triangles does the resulting geometry have?`,
      options: [
        { label: 'A', text: '2500 vertices and 2500 triangles.' },
        { label: 'B', text: '2601 vertices (51×51 grid) and 5000 triangles (2 per quad, 50×50 quads).' },
        { label: 'C', text: '2500 vertices and 5000 triangles.' },
        { label: 'D', text: '51 vertices and 100 triangles.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A 50-segment grid has 51 points per side (0, 1, 2, ..., 50), giving 51×51 = 2601 vertices. The grid has 50×50 = 2500 quads, each split into 2 triangles = 5000 triangles. This is the standard analysis for any uniform-grid geometry: (segments+1)² vertices, 2×segments² triangles.',
      failMessage: 'The answer is B. A grid of uSegments=50 and vSegments=50 has (50+1)×(50+1) = 2601 vertices — each row and column need one more point than the number of segments. The grid contains 50×50 = 2500 quads, each divided into 2 triangles = 5000 triangles. Rule: (N+1)² vertices and 2×N² triangles for any N×N uniform grid.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_5_1 }

export default {
  id: 'three-js-2-5-1-parametric-surfaces',
  slug: 'parametric-surfaces',
  chapter: 'three-js-2.5',
  order: 1,
  title: LESSON_3JS2_5_1.title,
  subtitle: LESSON_3JS2_5_1.subtitle,
  tags: ['three-js', 'parametric-surface', 'buffergeometry', 'normals', 'numerical-differentiation', 'saddle', 'mobius', 'enneper', 'cad'],
  hook: {
    question: 'A Möbius strip has only one side and one edge. You can build it with 20 lines of JavaScript by giving Three.js a single parametric function f(u,v). How does that function become a triangle mesh — and what computes the normals?',
    realWorldContext: 'CAD tools represent surfaces as parametric functions (NURBS are a generalisation). Building a custom BufferGeometry from scratch — with positions, normals, UVs, and an index buffer — is the foundation of procedural mesh generation used in CAD tools, game terrain, and scientific visualisation.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Parametric surface: P(u,v) → (x,y,z) with u,v ∈ [0,1]. Two parameters sweep a surface.',
      'Build a (uSeg+1)×(vSeg+1) grid of vertices by evaluating f at each (u,v) sample.',
      'Normals by numerical differentiation: dP/du ≈ (P(u+ε,v)-P(u-ε,v))/(2ε). Normal = dP/du × dP/dv.',
      'Index buffer: each quad (ui,vi) → 2 triangles. CCW winding for correct normals.',
      'Animate vertices: modify posAttr.array values each frame, set posAttr.needsUpdate = true, call computeVertexNormals().',
      'Segment count determines quality: (N+1)² vertices, 2×N² triangles for an N×N grid.',
    ],
    callouts: [
      { type: 'important', title: 'posAttr.needsUpdate = true', body: 'After modifying a BufferAttribute array, you MUST set needsUpdate = true. This flags the GPU buffer for re-upload. Without it, the GPU sees the old data. Also call computeVertexNormals() after moving vertices or shading will be wrong.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_5_1.title, props: { lesson: LESSON_3JS2_5_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Surface = sampled (u,v) grid → positions + normals + UVs + index buffer.',
    'Normal = normalize(∂P/∂u × ∂P/∂v). Use finite differences with ε=0.001.',
    'Index: (vi*(uSeg+1)+ui) = vertex index at grid point (ui,vi). Each quad = 2 triangles.',
    'N×N grid: (N+1)² vertices, 2N² triangles.',
    'Dynamic mesh: posAttr.needsUpdate=true + computeVertexNormals() each frame.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
