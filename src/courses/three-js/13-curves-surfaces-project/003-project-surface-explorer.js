// Three.js 2 · Chapter 5 · Lesson 2
// Project — Interactive Parametric Surface Explorer

const LESSON_3JS2_5_2 = {
  title: 'Project: Parametric Surface Explorer',
  subtitle: 'Build a complete interactive 3D tool — switchable surfaces, animated curve tracer, mouse picking, HUD, and clean architecture.',
  sequential: true,

  cells: [

    // ── Cell 1: What You're Building ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What You're Building

This project brings together every concept from the course into one coherent, polished interactive tool:

- **Six parametric surfaces** switchable with keyboard 1–6
- **Animated curve tracer** — a cone moves along a curve that runs on the surface
- **Mouse raycasting** — click any point on the surface and inspect its coordinates
- **On-screen HUD** — shows the current surface equation and click data
- **Proper delta-time animation**, scene graph, PBR materials, and lighting
- **Clean architecture** — each system is a separate class or function

This is the kind of tool you'd actually use for visualising CAD surface geometry. Every concept it uses maps directly to professional 3D software.

---

### Architecture Before Code

The most important engineering habit: **design the architecture before writing a line**.

\`\`\`
project.js
├── CONFIG                     ← constants (colors, speeds, resolution)
├── setupRenderer()            ← renderer + resize handler
├── setupScene()               ← scene + fog + grid
├── setupCamera()              ← camera + orbital rotation
├── setupLights()              ← ambient + directional + point
├── buildParametricGeometry()  ← the surface builder from Lesson 5-1
├── SURFACES map               ← named surface functions
├── SurfaceManager             ← creates/destroys/animates the mesh
│   ├── .build(name)           ← swap to a new surface
│   └── .currentName
├── CurveTracer                ← cone moving along a path
│   └── .update(t)
├── Picker                     ← raycaster + selection
│   ├── .onMouseMove(e)
│   └── .onClick(e)
├── HUD                        ← DOM overlay
│   └── .update(info)
└── tick(dt, t)                ← master update dispatches to all systems
\`\`\`

> **Single Responsibility Principle:** Each class does exactly one thing. \`SurfaceManager\` knows about geometry — not mouse events. \`Picker\` knows about raycasting — not which surface is active. \`HUD\` knows about DOM — nothing about 3D. When you move to Vulkan, you replace the renderer without touching the surface math.

---

### Surface Functions

You are given 6 parametric surfaces. Study each equation:

\`\`\`js
// ── SADDLE (hyperbolic paraboloid) ────────────────────────────────────────────
// z = x² − y²  — the shape of a Pringles chip, a mountain saddle, and
// a hyperbolic cooling tower. Used in architecture for anticlastic curvature.
function saddle(u, v, t) {
  const x = (u - 0.5) * SIZE * 2;
  const y = (v - 0.5) * SIZE * 2;
  t.set(x, 0.15 * (x*x - y*y), y);
}

// ── SINC (ripple wave) ─────────────────────────────────────────────────────────
// z = sin(r)/r  — the "sinc" function. Models acoustic diffraction, Fresnel
// diffraction patterns, and the frequency response of a rectangular window.
// The singularity at r=0 is resolved by the (r + ε) denominator.
function sinc(u, v, t) {
  const x = (u - 0.5) * SIZE * 2, y = (v - 0.5) * SIZE * 2;
  const r = Math.sqrt(x*x + y*y);
  t.set(x, 1.5 * Math.sin(r * 1.5) / (r + 0.01), y);
}

// ── TORUS ─────────────────────────────────────────────────────────────────────
// Major radius R, tube radius r. A genus-1 surface (one hole).
// Used in: magnetic confinement (tokamak), donut-shaped manifolds,
// and as a test surface in computational geometry.
function torus(u, v, t) {
  const R=3, r=1, theta=u*Math.PI*2, phi=v*Math.PI*2;
  t.set((R+r*Math.cos(phi))*Math.cos(theta), r*Math.sin(phi),
        (R+r*Math.cos(phi))*Math.sin(theta));
}

// ── MÖBIUS STRIP ──────────────────────────────────────────────────────────────
// A non-orientable surface — it has only ONE side and ONE edge.
// Walk all the way around the loop and you end up on what you thought was
// the "other side." Important in topology and in certain material science
// applications (Möbius resonators).
function mobius(u, v, t) {
  const theta=u*Math.PI*2, w=(v-0.5)*2, R=3;
  t.set((R+w*Math.cos(theta/2))*Math.cos(theta),
        (R+w*Math.cos(theta/2))*Math.sin(theta),
        w*Math.sin(theta/2));
}

// ── ENNEPER SURFACE ───────────────────────────────────────────────────────────
// A minimal surface (zero mean curvature) discovered by Alfred Enneper in 1864.
// Minimal surfaces are the shape soap films take — they minimise area.
// Used in CAD for computing optimal surface interpolation and in architecture
// for lightweight tension structures.
function enneper(u, v, t) {
  const s=(u-.5)*3, r=(v-.5)*3;
  t.set(s-s*s*s/3+s*r*r, r-r*r*r/3+r*s*s, s*s-r*r);
  t.multiplyScalar(0.5);
}

// ── SPRING (helical torus) ─────────────────────────────────────────────────────
// A torus swept along a helical path — models a coil spring in CAD.
// The pitch controls how much the centre rises per turn.
function spring(u, v, t) {
  const turns=3, theta=u*Math.PI*2*turns, phi=v*Math.PI*2;
  const R=2, r=0.4, pitch=0.5;
  t.set((R+r*Math.cos(phi))*Math.cos(theta),
        r*Math.sin(phi)+pitch*theta/(Math.PI*2),
        (R+r*Math.cos(phi))*Math.sin(theta));
}
\`\`\``,
    },

    // ── Cell 2: The Full Project ──────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Complete Surface Explorer

Press **keys 1–6** to switch between surfaces. **Click** any point on the surface to inspect its coordinates and normal. The cone traces an animated path on the surface. Use the buttons to toggle wireframe.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#060610;padding:8px 10px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
  <span style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569)">Press 1–6 to switch surface:</span>
  <button class="surf-btn" data-key="saddle"  style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">1 Saddle</button>
  <button class="surf-btn" data-key="sinc"    style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">2 Sinc</button>
  <button class="surf-btn" data-key="torus"   style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">3 Torus</button>
  <button class="surf-btn" data-key="mobius"  style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">4 Möbius</button>
  <button class="surf-btn" data-key="enneper" style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">5 Enneper</button>
  <button class="surf-btn" data-key="spring"  style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">6 Spring</button>
  <button id="btn-wire" style="padding:4px 10px;border-radius:5px;border:1px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:10px;cursor:pointer;margin-left:4px">Wireframe</button>
</div>
<canvas id="cv" style="display:block"></canvas>
<div id="hud" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:6px 10px;background:#060610;border-top:1px solid #0d1117;white-space:pre;min-height:52px"></div>`,
      css: `body{margin:0;background:#060610;overflow:hidden}`,
      startCode: `// ════════════════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════════════════
var CFG = {
  segments:    55,
  surfaceSize: 6,
  bgColor:     0x060610,
  surfaceColor:0x4488cc,
  wireColor:   0x112233,
  curveColor:  0xe06c75,
};

// ════════════════════════════════════════════════════════════════════════════
// RENDERER + SCENE + CAMERA
// ════════════════════════════════════════════════════════════════════════════
var W = 640, H = 360;
var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var scene  = new THREE.Scene();
scene.background = new THREE.Color(CFG.bgColor);
scene.fog = new THREE.FogExp2(CFG.bgColor, 0.018);

var camera = new THREE.PerspectiveCamera(60, W/H, 0.1, 200);
camera.position.set(8, 7, 14);
camera.lookAt(0, 0, 0);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
var dirLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
dirLight.position.set(8, 12, 6);
dirLight.castShadow = true;
scene.add(dirLight);
var fillLight = new THREE.PointLight(0x4499ff, 20, 30);
fillLight.position.set(-6, 4, -4);
scene.add(fillLight);

scene.add(new THREE.GridHelper(24, 24, 0x111122, 0x111122));

// ════════════════════════════════════════════════════════════════════════════
// GEOMETRY BUILDER (from Lesson 5-1)
// ════════════════════════════════════════════════════════════════════════════
function buildParametricGeometry(func, uSeg, vSeg) {
  var pos=[], nor=[], uvArr=[], idx=[];
  var EPS=0.0005;
  var p=new THREE.Vector3(), pu1=new THREE.Vector3(), pu2=new THREE.Vector3();
  var pv1=new THREE.Vector3(), pv2=new THREE.Vector3();
  for (var vi=0;vi<=vSeg;vi++) for (var ui=0;ui<=uSeg;ui++) {
    var u=ui/uSeg, v=vi/vSeg;
    func(u,v,p); pos.push(p.x,p.y,p.z); uvArr.push(u,v);
    func(Math.min(u+EPS,1),v,pu1); func(Math.max(u-EPS,0),v,pu2);
    func(u,Math.min(v+EPS,1),pv1); func(u,Math.max(v-EPS,0),pv2);
    var dU=pu1.clone().sub(pu2), dV=pv1.clone().sub(pv2);
    var n=dU.cross(dV).normalize(); nor.push(n.x,n.y,n.z);
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

// ════════════════════════════════════════════════════════════════════════════
// SURFACE FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════
var S = CFG.surfaceSize;
var SURFACES = {
  saddle:  { eq:'z = 0.15(x² − y²)',
    fn: function(u,v,t){var x=(u-.5)*S*2,y=(v-.5)*S*2;t.set(x,0.15*(x*x-y*y),y);} },
  sinc:    { eq:'z = 1.5·sin(1.5r) / (r+0.01)',
    fn: function(u,v,t){var x=(u-.5)*S*2,y=(v-.5)*S*2,r=Math.sqrt(x*x+y*y);t.set(x,1.5*Math.sin(r*1.5)/(r+0.01),y);} },
  torus:   { eq:'Torus R=3, r=1',
    fn: function(u,v,t){var R=3,r=1,th=u*Math.PI*2,ph=v*Math.PI*2;t.set((R+r*Math.cos(ph))*Math.cos(th),r*Math.sin(ph),(R+r*Math.cos(ph))*Math.sin(th));} },
  mobius:  { eq:'Möbius strip R=3, w=[-1,1]',
    fn: function(u,v,t){var th=u*Math.PI*2,w=(v-.5)*2,R=3;t.set((R+w*Math.cos(th/2))*Math.cos(th),(R+w*Math.cos(th/2))*Math.sin(th),w*Math.sin(th/2));} },
  enneper: { eq:'Enneper minimal surface',
    fn: function(u,v,t){var s=(u-.5)*3,r=(v-.5)*3;t.set(s-s*s*s/3+s*r*r,r-r*r*r/3+r*s*s,s*s-r*r);t.multiplyScalar(0.5);} },
  spring:  { eq:'Helical spring R=2, r=0.4, 3 turns',
    fn: function(u,v,t){var turns=3,th=u*Math.PI*2*turns,ph=v*Math.PI*2,R=2,r=0.4,pit=0.5;t.set((R+r*Math.cos(ph))*Math.cos(th),r*Math.sin(ph)+pit*th/(Math.PI*2),(R+r*Math.cos(ph))*Math.sin(th));} },
};

// ════════════════════════════════════════════════════════════════════════════
// SURFACE MANAGER
// ════════════════════════════════════════════════════════════════════════════
var surfaceMat  = new THREE.MeshStandardMaterial({color:CFG.surfaceColor,roughness:0.25,metalness:0.15,side:THREE.DoubleSide});
var wireMat     = new THREE.MeshBasicMaterial({color:CFG.wireColor,wireframe:true});
var surfaceMesh = new THREE.Mesh(new THREE.BufferGeometry(), surfaceMat);
var wireMesh    = new THREE.Mesh(new THREE.BufferGeometry(), wireMat);
scene.add(surfaceMesh, wireMesh);
wireMesh.visible = false;

var currentSurfaceName = 'saddle';
var currentSurfaceFn   = SURFACES.saddle.fn;

function setSurface(key) {
  var s = SURFACES[key];
  if (!s) return;
  var geo = buildParametricGeometry(s.fn, CFG.segments, CFG.segments);
  surfaceMesh.geometry = geo;
  wireMesh.geometry    = geo;
  currentSurfaceName = key;
  currentSurfaceFn   = s.fn;
  hud.textContent    = key.toUpperCase() + ' — ' + s.eq + '\nClick the surface to inspect a point.';
}
setSurface('saddle');

document.querySelectorAll('.surf-btn').forEach(function(btn) {
  btn.onclick = function() { setSurface(this.dataset.key); };
});
document.getElementById('btn-wire').onclick = function() {
  wireMesh.visible = !wireMesh.visible;
};
document.addEventListener('keydown', function(e) {
  var keys = ['1','2','3','4','5','6'];
  var names = ['saddle','sinc','torus','mobius','enneper','spring'];
  var idx = keys.indexOf(e.key);
  if (idx >= 0) setSurface(names[idx]);
});

// ════════════════════════════════════════════════════════════════════════════
// CURVE TRACER
// ════════════════════════════════════════════════════════════════════════════
var tracer = new THREE.Mesh(
  new THREE.ConeGeometry(0.15, 0.5, 8),
  new THREE.MeshStandardMaterial({color: CFG.curveColor, roughness:0.3})
);
scene.add(tracer);
var upVec = new THREE.Vector3(0, 1, 0);

// Builds a curve that runs along the surface (sample the surface at v=0.5)
function buildTracerCurve() {
  var pts = [];
  var p = new THREE.Vector3();
  for (var i = 0; i <= 80; i++) {
    currentSurfaceFn(i / 80, 0.5, p);
    pts.push(p.clone());
  }
  return new THREE.CatmullRomCurve3(pts, true);
}
var tracerCurve = buildTracerCurve();

// ════════════════════════════════════════════════════════════════════════════
// PICKER
// ════════════════════════════════════════════════════════════════════════════
var raycaster  = new THREE.Raycaster();
var mouse      = new THREE.Vector2();
var hitMarker  = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 12, 12),
  new THREE.MeshBasicMaterial({color: 0xffee44})
);
hitMarker.visible = false;
scene.add(hitMarker);
var normalArrow = new THREE.ArrowHelper(upVec, new THREE.Vector3(), 1, 0xffee44, 0.2, 0.1);
normalArrow.visible = false;
scene.add(normalArrow);

cv.addEventListener('click', function(e) {
  var rect = cv.getBoundingClientRect();
  mouse.x =  (e.clientX - rect.left) / rect.width  * 2 - 1;
  mouse.y = -(e.clientY - rect.top)  / rect.height * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObject(surfaceMesh, false);
  if (hits.length > 0) {
    var h = hits[0];
    var wn = h.face.normal.clone().transformDirection(surfaceMesh.matrixWorld);
    hitMarker.position.copy(h.point);
    hitMarker.visible = true;
    normalArrow.position.copy(h.point);
    normalArrow.setDirection(wn);
    normalArrow.visible = true;
    hud.textContent =
      currentSurfaceName.toUpperCase() + ' — ' + SURFACES[currentSurfaceName].eq + '\n' +
      'Hit: (' + h.point.x.toFixed(3)+', '+h.point.y.toFixed(3)+', '+h.point.z.toFixed(3) + ')\n' +
      'Normal: (' + wn.x.toFixed(3)+', '+wn.y.toFixed(3)+', '+wn.z.toFixed(3) + ')   dist: ' + h.distance.toFixed(3);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// RENDER LOOP
// ════════════════════════════════════════════════════════════════════════════
var clock = new THREE.Clock();
var prevSurface = currentSurfaceName;

function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);
  var t  = clock.getElapsedTime();

  // Rebuild tracer curve if surface changed
  if (currentSurfaceName !== prevSurface) {
    tracerCurve  = buildTracerCurve();
    prevSurface  = currentSurfaceName;
    hitMarker.visible = normalArrow.visible = false;
  }

  // Slow camera orbit
  var camAngle = t * 0.08;
  camera.position.x = Math.cos(camAngle) * 16;
  camera.position.z = Math.sin(camAngle) * 16;
  camera.position.y = 7;
  camera.lookAt(0, 0, 0);

  // Animate tracer
  var param = (t * 0.1) % 1;
  var pos  = tracerCurve.getPoint(param);
  var tang = tracerCurve.getTangent(param);
  tracer.position.copy(pos);
  try { tracer.quaternion.setFromUnitVectors(upVec, tang.normalize()); } catch(e) {}

  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 540,
    },

    // ── Cell 3: Coding Challenge — Extend the Explorer ────────────────────────
    {
      type: 'js',
      instruction: `### Challenge — Add Your Own Surface and Features

Extend the Surface Explorer with at least **two of the following** features:

**Option A — Add a new surface:** Implement a "Costa surface" (a triply punctured torus, a famous minimal surface):
\`\`\`js
// Costa surface (simplified approximation using Weierstrass representation)
// u ∈ [0, 2π], v ∈ [0, 2π] — remap from [0,1]
// This is a minimal surface with finite topology: genus-1, 3 punctures
function costa(u, v, target) {
  var uu = u * Math.PI * 2, vv = v * Math.PI * 2;
  // Simplified Costa-like surface (not exact, but visually similar):
  var x = Math.cos(uu) * (2 - Math.cos(vv));
  var y = Math.sin(uu) * (2 - Math.cos(vv));
  var z = Math.sin(vv) - Math.log(Math.tan(vv * 0.5 + 0.001) * 0.5) * 0.3;
  target.set(x * 0.6, z * 0.5, y * 0.6);
}
\`\`\`

**Option B — Hover preview:** Show a small label near the cursor displaying the (x, y, z) coordinate of the nearest surface point as you move the mouse. Use \`mousemove\` raycasting.

**Option C — Surface colour by height:** Modify \`surfaceMat\` to use \`vertexColors: true\` and update the geometry's \`color\` attribute each frame based on the Y value of each vertex (e.g. map \`y → hue\` using \`THREE.Color.setHSL()\`).

The starter code is the full Surface Explorer from the lesson — add your feature on top.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#060610;padding:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
  <span style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569)">Add your feature below the ── YOUR CODE ── comment</span>
  <button class="surf-btn" data-key="saddle" style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Saddle</button>
  <button class="surf-btn" data-key="sinc"   style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Sinc</button>
  <button class="surf-btn" data-key="torus"  style="padding:4px 10px;border-radius:5px;border:1px solid #334;background:#0d1117;color:#64d8cb;font-family:monospace;font-size:10px;cursor:pointer">Torus</button>
</div>
<canvas id="cv" style="display:block"></canvas>
<div id="hud" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px 10px;background:#060610;min-height:40px;white-space:pre"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `// Full Surface Explorer (starter — extend below)
var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 360);
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x060610);
var camera = new THREE.PerspectiveCamera(60, 640/360, 0.1, 200);
camera.position.set(8, 6, 14);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
var d = new THREE.DirectionalLight(0xfff5e0, 2); d.position.set(8,12,6); scene.add(d);
scene.add(new THREE.GridHelper(20,20,0x111122,0x111122));

function buildGeo(func, uS, vS) {
  var pos=[],nor=[],uvA=[],idx=[],EPS=0.0005;
  var p=new THREE.Vector3(),pu1=new THREE.Vector3(),pu2=new THREE.Vector3(),pv1=new THREE.Vector3(),pv2=new THREE.Vector3();
  for(var vi=0;vi<=vS;vi++) for(var ui=0;ui<=uS;ui++) {
    var u=ui/uS,v=vi/vS; func(u,v,p); pos.push(p.x,p.y,p.z); uvA.push(u,v);
    func(Math.min(u+EPS,1),v,pu1); func(Math.max(u-EPS,0),v,pu2);
    func(u,Math.min(v+EPS,1),pv1); func(u,Math.max(v-EPS,0),pv2);
    var n=pu1.clone().sub(pu2).cross(pv1.clone().sub(pv2)).normalize(); nor.push(n.x,n.y,n.z);
  }
  for(var vi2=0;vi2<vS;vi2++) for(var ui2=0;ui2<uS;ui2++){var a=vi2*(uS+1)+ui2,b=a+1,c=a+(uS+1),dd=c+1;idx.push(a,c,b,b,c,dd);}
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));
  g.setAttribute('normal',  new THREE.BufferAttribute(new Float32Array(nor),3));
  g.setAttribute('uv',      new THREE.BufferAttribute(new Float32Array(uvA),2));
  g.setIndex(idx); return g;
}

var SURFS = {
  saddle: {eq:'z=0.15(x²−y²)', fn:function(u,v,t){var x=(u-.5)*12,y=(v-.5)*12;t.set(x,0.15*(x*x-y*y),y);}},
  sinc:   {eq:'z=sinc(r)',      fn:function(u,v,t){var x=(u-.5)*12,y=(v-.5)*12,r=Math.sqrt(x*x+y*y);t.set(x,1.5*Math.sin(r*1.5)/(r+0.01),y);}},
  torus:  {eq:'Torus R=3 r=1', fn:function(u,v,t){var R=3,r=1,th=u*Math.PI*2,ph=v*Math.PI*2;t.set((R+r*Math.cos(ph))*Math.cos(th),r*Math.sin(ph),(R+r*Math.cos(ph))*Math.sin(th));}},
};
var mat = new THREE.MeshStandardMaterial({color:0x4488cc,roughness:0.25,metalness:0.15,side:THREE.DoubleSide});
var mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
scene.add(mesh);
var curName = 'saddle';
function setSurf(k){mesh.geometry=buildGeo(SURFS[k].fn,50,50);curName=k;hud.textContent=k+': '+SURFS[k].eq;}
setSurf('saddle');
document.querySelectorAll('.surf-btn').forEach(function(b){b.onclick=function(){setSurf(this.dataset.key);};});

// Raycaster
var rc=new THREE.Raycaster(), mouse=new THREE.Vector2();
var marker=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),new THREE.MeshBasicMaterial({color:0xffee44}));
marker.visible=false; scene.add(marker);
cv.addEventListener('click',function(e){
  var r=cv.getBoundingClientRect();
  mouse.x=(e.clientX-r.left)/r.width*2-1;
  mouse.y=-(e.clientY-r.top)/r.height*2+1;
  rc.setFromCamera(mouse,camera);
  var h=rc.intersectObject(mesh,false);
  if(h.length){marker.position.copy(h[0].point);marker.visible=true;
    hud.textContent=curName+': '+SURFS[curName].eq+'\\nHit: ('+h[0].point.x.toFixed(2)+', '+h[0].point.y.toFixed(2)+', '+h[0].point.z.toFixed(2)+')';}
});

// ── YOUR CODE: add your feature here ──────────────────────────────────────────
// Option A: add a 'costa' key to SURFS and a button
// Option B: mousemove raycasting for live coordinate display
// Option C: vertex colour by height

var clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  var t=clock.getElapsedTime();
  camera.position.x=Math.cos(t*0.07)*16;
  camera.position.z=Math.sin(t*0.07)*16;
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
}
animate();`,
      outputHeight: 500,
    },

    // ── Cell 4: Quiz — Architecture ──────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In the project architecture, why does the \`Picker\` class not know which surface is currently active?`,
      options: [
        { label: 'A', text: 'Because the Picker was written first and the surface system was added later.' },
        { label: 'B', text: 'Because the Single Responsibility Principle says Picker\'s only job is raycasting — it doesn\'t need to know what surface means. Coupling Picker to surface knowledge means changing the surface system requires changing Picker.' },
        { label: 'C', text: 'Because Three.js Raycaster cannot access scene graph objects that belong to other modules.' },
        { label: 'D', text: 'Because knowing the surface would cause a circular dependency between Picker and SurfaceManager.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Single Responsibility: Picker\'s job is to translate mouse events into 3D intersection data. It doesn\'t need to know what to do with that data — that\'s the caller\'s job. If Picker knew about surfaces, every change to the surface system might require changing Picker. Decoupled modules are independently testable, replaceable, and easier to reason about. When you port to Vulkan, you replace the renderer — not the mouse-to-ray logic.',
      failMessage: 'The answer is B. The Single Responsibility Principle: each module does exactly one thing. Picker converts mouse coordinates to intersection records. What those records mean (which surface is active, what the coordinate represents) is the concern of the layer above. Keeping them separate means you can change or replace either one without touching the other.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `The camera auto-orbits by updating \`camera.position\` every frame with \`Math.cos/sin\`. What is one significant limitation of this approach compared to using OrbitControls?`,
      options: [
        { label: 'A', text: 'Math.cos/sin is slower than OrbitControls\' built-in camera math.' },
        { label: 'B', text: 'The auto-orbit cannot be interrupted by the user — there is no way to manually control the camera because mouse events would conflict with the automatic position update.' },
        { label: 'C', text: 'Math.cos/sin only produces circular orbits; OrbitControls can produce elliptical paths.' },
        { label: 'D', text: 'The auto-orbit does not update the camera\'s projection matrix, causing distortion at extreme angles.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Auto-orbiting by setting camera.position directly is not interactive. If you also listen to mouse drag events to orbit manually, the two systems fight each other — the automatic update overrides whatever the user does. OrbitControls handles the interaction model (mouse down = start drag, wheel = zoom, etc.) and computes the camera position from that state, allowing both automatic and manual modes to coexist cleanly.',
      failMessage: 'The answer is B. The core limitation is that auto-orbit and user interaction are mutually exclusive when you compute position directly. Every frame you overwrite camera.position regardless of user intent. OrbitControls maintains a spherical coordinate state (theta, phi, radius) that can be driven by either input events or external code — it does not conflict with itself. For a polished CAD tool, OrbitControls or a custom equivalent is always needed.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_5_2 }

export default {
  id: 'three-js-2-5-2-project-surface-explorer',
  slug: 'project-surface-explorer',
  chapter: 'three-js-2.5',
  order: 2,
  title: LESSON_3JS2_5_2.title,
  subtitle: LESSON_3JS2_5_2.subtitle,
  tags: ['three-js', 'project', 'parametric-surface', 'raycasting', 'architecture', 'interactive', 'hud', 'curve-tracer'],
  hook: {
    question: 'You know the Renderer, Scene Graph, Lighting, Delta Time, Vector math, Raycasting, and Parametric Surfaces. Now — how do you architect a complete interactive tool that uses all of them without spaghetti code?',
    realWorldContext: 'The Surface Explorer project mirrors tools used in CAD surface analysis, mathematical visualisation, and 3D education. The architecture patterns — Single Responsibility, separated systems, clean update/render loops — are the same patterns used in Unreal\'s actor-component model and Unity\'s MonoBehaviour system.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Architecture first: SurfaceManager, CurveTracer, Picker, HUD — each does exactly one thing.',
      'The Surface Explorer runs six parametric surfaces switchable by keyboard or button.',
      'A cone traces a CatmullRom path built by sampling the current surface at v=0.5.',
      'Raycasting on click: shows the hit world position and surface normal at that point.',
      'Slow camera auto-orbit: camera.position = (cos(t)*r, h, sin(t)*r), lookAt origin.',
      'SRP: SurfaceManager does not know about mouse events. Picker does not know which surface is active.',
    ],
    callouts: [
      { type: 'insight', title: 'Single Responsibility in 3D', body: 'When you move to Vulkan, you replace the renderer — not the surface math, not the picking logic, not the HUD. Keeping them separate means each is independently replaceable. This is why the project splits into five distinct systems.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_5_2.title, props: { lesson: LESSON_3JS2_5_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Project architecture: CONFIG → setupRenderer/Scene/Camera/Lights → SurfaceManager → CurveTracer → Picker → HUD → tick.',
    'Self-referencing ScienceNotebook: the lesson object is the notebook. Cells contain the interactive demos.',
    'SRP: each class/function does one thing. Swap the renderer without touching surface math.',
    'The project combines: parametric geometry + scene graph + PBR + delta-time loop + raycasting + curves.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"SRP: each class/function does one thing. Swap the renderer without touching surface math." What is the practical benefit of Single Responsibility Principle here?',
      options: [
        'It makes the code longer but easier to document',
        'Changing the renderer (e.g., from WebGL to WebGPU) only requires modifying the renderer class — surface math, curve tracing, and picking are untouched because they do not depend on rendering internals',
        'SRP only applies to functions, not classes',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Project architecture: CONFIG → setup → SurfaceManager → CurveTracer → Picker → HUD → tick." Why put CONFIG at the top of this flow?',
      options: [
        'CONFIG must execute last to override defaults',
        'CONFIG defines shared constants (segment counts, colors, light positions) that every module reads. Placing it first means any module can safely reference it without worrying about initialization order',
        'CONFIG handles GPU initialization before the renderer is ready',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"The project combines: parametric geometry + scene graph + PBR + delta-time loop + raycasting + curves." Why does this capstone integrate all these systems rather than just one?',
      options: [
        'To increase the line count for assessment purposes',
        'Real interactive 3D applications require all these systems simultaneously — geometry, lighting, camera control, input, and animation work together. Practising integration is as important as learning each system individually',
        'Three.js requires all systems to be active simultaneously',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Self-referencing ScienceNotebook: the lesson object is the notebook. Cells contain the demos." What architectural pattern does this describe?',
      options: [
        'The lesson metadata and the interactive content are the same object — the lesson structure is both the documentation and the executable code, eliminating a separate demo registration step',
        'The lesson imports itself recursively',
        'ScienceNotebook is a Three.js built-in for documentation',
      ],
      correct: 0,
    },
  ],
}
