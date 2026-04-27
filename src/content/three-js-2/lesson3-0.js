// Three.js 2 · Chapter 3 · Lesson 0
// Lighting — Light Types, Normals & Shadow Maps

const LESSON_3JS2_3_0 = {
  title: 'Lighting — Light Types & Shadow Maps',
  subtitle: 'How real-time lighting works, why shadow maps are textures, and how to tune each light type for your scene.',
  sequential: true,

  cells: [

    // ── Cell 1: What Lights Actually Do ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What Lights Actually Do

A light in Three.js is not a visible object — it is a set of parameters that GPU shaders read when computing each pixel's colour. The shader implements the BRDF (from the Materials lesson): for each lit pixel, it evaluates the surface's material properties against every light in the scene.

Real path tracers (Blender Cycles, CAD rendering engines) send thousands of rays per pixel to compute global illumination — the correct physical result. Real-time rendering can only afford a handful of direct lights evaluated analytically at each fragment.

**Surface normals are how lights know which way a surface faces.** The dot product between the surface normal and the light direction determines how bright the surface is:
\`\`\`
brightness = max(0, normal · lightDir)
\`\`\`
When the normal points directly at the light (dot product = 1), the surface is fully bright. When it points perpendicular (dot product = 0), it is at grazing angle — zero contribution. This is **Lambert's cosine law**.

---

### The Light Zoo

| Light | Description | Shadows | Performance |
|-------|-------------|---------|-------------|
| \`AmbientLight\` | Uniform brightness, all directions — no directionality | No | Trivial |
| \`DirectionalLight\` | Parallel rays from a direction at infinity (like the Sun) | Yes | Medium |
| \`PointLight\` | Radiates in all directions from a point (light bulb) | Yes (6 shadow maps!) | High |
| \`SpotLight\` | Cone of light from a point — has angle, penumbra, distance | Yes | High |
| \`HemisphereLight\` | Sky + ground two-tone ambient — outdoor bounce approximation | No | Trivial |
| \`RectAreaLight\` | Emits from a rectangle (window, softbox) | No | Very High |

**\`AmbientLight\`** is physically inaccurate — there is no directionality. It prevents pure-black shadows but flattens the scene if used at high intensity. Keep it at 0.2–0.4 intensity. \`HemisphereLight\` is a much better ambient for outdoor scenes.`,
    },

    // ── Cell 2: Shadow Maps Explained ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### How Shadow Maps Work

Real-time shadows use **shadow maps** — a two-pass technique used in virtually every game engine and CAD renderer:

**Pass 1 — Shadow Map Generation:**
Render the scene from the light's point of view. Record only depth values into a texture (the shadow map). This texture stores "how far is the nearest surface from this light in each direction?"

**Pass 2 — Main Render:**
For each fragment during the normal render, transform its world position into the light's clip space. Compare the fragment's depth to the stored shadow map depth at that position. If the fragment is farther from the light than what the shadow map recorded, something is blocking the light — the fragment is in shadow.

\`\`\`js
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.castShadow = true;

// Shadow map resolution — power of 2, larger = sharper shadows
dirLight.shadow.mapSize.width  = 2048;
dirLight.shadow.mapSize.height = 2048;

// Shadow camera defines the volume covered by the shadow map.
// For DirectionalLight it's orthographic — make it just large enough.
dirLight.shadow.camera.near   = 0.1;
dirLight.shadow.camera.far    = 50;
dirLight.shadow.camera.left   = -15;
dirLight.shadow.camera.right  =  15;
dirLight.shadow.camera.top    =  15;
dirLight.shadow.camera.bottom = -15;

// bias: tiny offset to prevent shadow acne.
// Too small → acne (surface shadows itself). Too large → peter-panning.
dirLight.shadow.bias = -0.0005;

scene.add(dirLight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // softer edges
\`\`\`

**On every mesh that should cast or receive shadows:**
\`\`\`js
mesh.castShadow    = true;  // this mesh blocks light
mesh.receiveShadow = true;  // this mesh shows shadows from others
\`\`\`

> **Vulkan note:** In Vulkan you implement shadow maps yourself — render pass, depth attachment, sample in the fragment shader. The concept is identical. Learning it via Three.js first means you understand what you're building before wrestling with the API.`,
    },

    // ── Cell 3: Light Showcase Demo ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Live Light Showcase

Toggle each light on/off with the buttons. Observe how each type contributes to the scene. The point light animates in a circle to show how moving lights affect shadows and shading.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:flex;gap:6px;flex-wrap:wrap">
  <button id="btn-amb"  style="padding:5px 12px;border-radius:6px;border:none;background:#2a3f5f;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Ambient ON</button>
  <button id="btn-dir"  style="padding:5px 12px;border-radius:6px;border:none;background:#2a3f5f;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Directional ON</button>
  <button id="btn-pt"   style="padding:5px 12px;border-radius:6px;border:none;background:#2a3f5f;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Point ON</button>
  <button id="btn-spot" style="padding:5px 12px;border-radius:6px;border:none;background:#2a3f5f;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Spot ON</button>
</div>
<canvas id="cv" style="display:block;border-radius:0 0 6px 6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:#475569;padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a12);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 200);
camera.position.set(0, 8, 16);
camera.lookAt(0, 0, 0);

// Ground
var ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Objects
function makeShadowObj(geo, color, x) {
  var m = new THREE.Mesh(geo,
    new THREE.MeshStandardMaterial({ color: color, roughness:0.5 }));
  m.position.set(x, 1, 0);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
  return m;
}
makeShadowObj(new THREE.BoxGeometry(1.5,2,1.5),    0x64d8cb, -3);
makeShadowObj(new THREE.SphereGeometry(1,32,32),    0xf5a623,  0);
makeShadowObj(new THREE.TorusGeometry(0.8,0.3,16,64),0xe06c75, 3);

// Lights
var ambient = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambient);

var dirLight = new THREE.DirectionalLight(0xfff0cc, 1.5);
dirLight.position.set(8, 12, 6);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -15;
dirLight.shadow.camera.right = dirLight.shadow.camera.top  =  15;
dirLight.shadow.camera.far = 50;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

var pointLight = new THREE.PointLight(0xff4444, 30, 20, 2);
pointLight.position.set(0, 5, 0);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = pointLight.shadow.mapSize.height = 512;
var ptSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xff4444 })
);
pointLight.add(ptSphere);
scene.add(pointLight);

var spotLight = new THREE.SpotLight(0x4499ff, 80, 30, Math.PI/8, 0.3, 2);
spotLight.position.set(-6, 8, -4);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = spotLight.shadow.mapSize.height = 512;
scene.add(spotLight);
scene.add(spotLight.target);

// Toggle buttons
function makeToggle(btn, light) {
  document.getElementById(btn).onclick = function() {
    light.visible = !light.visible;
    this.textContent = this.textContent.replace(/ON|OFF/, light.visible ? 'ON' : 'OFF');
    this.style.background = light.visible ? '#1e4d3f' : '#2a3f5f';
  };
}
makeToggle('btn-amb',  ambient);
makeToggle('btn-dir',  dirLight);
makeToggle('btn-pt',   pointLight);
makeToggle('btn-spot', spotLight);

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;
  pointLight.position.x = Math.sin(t * 0.8) * 5;
  pointLight.position.z = Math.cos(t * 0.8) * 5;
  renderer.render(scene, camera);
  info.textContent = 'point light pos: (' + pointLight.position.x.toFixed(1) + ', 5, ' + pointLight.position.z.toFixed(1) + ')';
}
animate();`,
      outputHeight: 430,
    },

    // ── Cell 4: Coding Challenge 1 — Shadow Tuning ───────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Shadow Quality Tuning

Set up a scene with a DirectionalLight casting shadows. Then experiment with the quality parameters.

Required setup:
1. A \`DirectionalLight\` with \`castShadow = true\`
2. Shadow map size: start at 256×256 (pixelated), then increase to 2048×2048 (sharp)
3. Set the shadow camera frustum to be just large enough to cover your 3 objects (±5 units)
4. Tune \`shadow.bias\` to eliminate shadow acne without peter-panning

The starter has the scene and objects — you wire up the light and shadows.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<div style="background:#0a0a0f;padding:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
  <label style="font-family:monospace;font-size:10px;color:#94a3b8">Shadow Map Size:
    <select id="mapsize" style="background:#1e293b;color:#94a3b8;border:none;padding:4px;font-family:monospace;font-size:10px">
      <option value="256">256 (pixelated)</option>
      <option value="512">512</option>
      <option value="1024" selected>1024</option>
      <option value="2048">2048 (sharp)</option>
    </select>
  </label>
  <label style="font-family:monospace;font-size:10px;color:#94a3b8">Bias: <span id="bv">-0.0005</span>
    <input id="bias" type="range" min="-0.005" max="0.005" step="0.0001" value="-0.0005" style="width:100px;accent-color:#64d8cb">
  </label>
</div>
<canvas id="cv" style="display:block;border-radius:0 0 6px 6px"></canvas>`,
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
camera.position.set(0, 6, 12);
camera.lookAt(0, 0, 0);

// Ground
var ground = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 14),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Objects
scene.add(new THREE.AmbientLight(0x404060, 0.3));
[[-3,0xf5a623], [0,0x64d8cb], [3,0xe06c75]].forEach(function(p) {
  var m = new THREE.Mesh(
    new THREE.BoxGeometry(1.2,2,1.2),
    new THREE.MeshStandardMaterial({ color: p[1], roughness:0.5 })
  );
  m.position.set(p[0], 1, 0);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
});

// ── YOUR CODE: create and configure DirectionalLight with shadows ─────────────
// var dirLight = new THREE.DirectionalLight(0xffffff, 2);
// dirLight.position.set(6, 10, 4);
// dirLight.castShadow = true;
// dirLight.shadow.mapSize.width  = 1024;
// dirLight.shadow.mapSize.height = 1024;
// dirLight.shadow.camera.left   = -7;
// dirLight.shadow.camera.right  =  7;
// dirLight.shadow.camera.top    =  7;
// dirLight.shadow.camera.bottom = -7;
// dirLight.shadow.camera.far    =  30;
// dirLight.shadow.bias = -0.0005;
// scene.add(dirLight);

// ── YOUR CODE: shadow map size control ───────────────────────────────────────
document.getElementById('mapsize').onchange = function() {
  var s = parseInt(this.value);
  // if (dirLight) {
  //   dirLight.shadow.mapSize.width  = s;
  //   dirLight.shadow.mapSize.height = s;
  //   dirLight.shadow.map = null;  // force recompute
  //   dirLight.shadow.needsUpdate = true;
  // }
};

document.getElementById('bias').oninput = function() {
  var b = parseFloat(this.value);
  document.getElementById('bv').textContent = b.toFixed(4);
  // if (dirLight) dirLight.shadow.bias = b;
};

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 420,
    },

    // ── Cell 5: Coding Challenge 2 — Concert Lighting ────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Animated Coloured Point Lights

Create four coloured point lights arranged in a square pattern, each a different saturated colour. Animate them orbiting at different speeds and radii. Observe additive colour mixing where the light cones overlap.

Required:
- 4 point lights: red \`0xff2222\`, green \`0x22ff22\`, blue \`0x2244ff\`, yellow \`0xffee22\`
- Each orbits at radius 4, speed offset by π/2 between each
- Low intensity (10–20) per light so they don't wash each other out
- Add a floor plane (\`receiveShadow = true\`) to catch the coloured light
- Add a small "indicator sphere" child of each point light so you can see where it is`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 340);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x020205);
var camera = new THREE.PerspectiveCamera(60, 640/340, 0.1, 100);
camera.position.set(0, 8, 14);
camera.lookAt(0, 0, 0);

// Floor
var floor = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 16),
  new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Central object
var centre = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.25, 128, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness:0.2, metalness:0.1 })
);
centre.position.y = 1.5;
scene.add(centre);

// ── YOUR CODE: four coloured point lights ─────────────────────────────────────
var lightColors = [0xff2222, 0x22ff22, 0x2244ff, 0xffee22];
var lights = [];
lightColors.forEach(function(color, i) {
  // var light = new THREE.PointLight(color, 15, 18, 2);
  // light.position.set(4, 3, 0);  // we'll animate position each frame
  // scene.add(light);
  // var indicator = new THREE.Mesh(
  //   new THREE.SphereGeometry(0.1, 8, 8),
  //   new THREE.MeshBasicMaterial({ color: color })
  // );
  // light.add(indicator);
  // lights.push({ light: light, phaseOffset: i * (Math.PI / 2) });
});

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;

  centre.rotation.y = t * 0.5;
  centre.rotation.z = t * 0.2;

  // ── YOUR CODE: animate each light position ────────────────────────────────
  // lights.forEach(function(item) {
  //   var angle = t * 0.7 + item.phaseOffset;
  //   item.light.position.x = 4 * Math.cos(angle);
  //   item.light.position.z = 4 * Math.sin(angle);
  //   item.light.position.y = 3 + Math.sin(t + item.phaseOffset) * 1;
  // });

  renderer.render(scene, camera);
}
animate();`,
      outputHeight: 420,
    },

    // ── Cell 6: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Shadow acne (surfaces shadowing themselves with flickering noise) appears on your scene. What is the correct way to fix it?`,
      options: [
        { label: 'A', text: 'Increase the shadow map resolution (mapSize) — low resolution causes acne.' },
        { label: 'B', text: 'Apply a small negative shadow.bias to offset the shadow map depth slightly toward the light, preventing the surface from matching its own shadow.' },
        { label: 'C', text: 'Set mesh.castShadow = false on the affected mesh — it is self-shadowing itself.' },
        { label: 'D', text: 'Switch from PCFSoftShadowMap to BasicShadowMap — PCF causes acne on curved surfaces.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Shadow acne occurs because the shadow map stores depth with finite precision, causing surfaces to partially match their own shadow map depth. A small negative bias pushes the shadow depth slightly toward the light, so the surface is never accidentally in its own shadow. Too much negative bias causes peter-panning (shadows appear to float above the surface). Tuning bias is a required step for every shadow-casting light.',
      failMessage: 'The answer is B — shadow.bias. Acne is a depth precision problem, not a resolution problem. Increasing resolution (A) reduces pixelation of shadow edges but does not fix acne. BasicShadowMap (D) is actually less accurate. Setting castShadow=false (C) removes the shadow entirely. The bias is a small depth offset (typically -0.0001 to -0.001) that prevents the surface\'s own depth from accidentally matching its shadow.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `A PointLight casts shadows in Three.js. How many shadow maps does it actually need internally, and why?`,
      options: [
        { label: 'A', text: 'One shadow map — the light casts shadows in all directions simultaneously using a single spherical projection.' },
        { label: 'B', text: 'Two shadow maps — one for the left hemisphere and one for the right hemisphere.' },
        { label: 'C', text: 'Six shadow maps — one for each face of a cube (the light renders the scene in all six axis directions to form a cube map).' },
        { label: 'D', text: 'Zero shadow maps — PointLight shadows are computed analytically, not via shadow mapping.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. PointLight shadows require a cube map — 6 texture faces, one per axis direction (±X, ±Y, ±Z). The renderer must perform 6 shadow-map passes per frame for each shadow-casting point light. This is why point light shadows are expensive — and why you should prefer DirectionalLight or SpotLight for shadow-casting lights when possible.',
      failMessage: 'The answer is C. A PointLight emits in all directions, so its shadow map must cover the full sphere. Three.js (and WebGL/Vulkan) handles this with a cube shadow map: 6 faces, one per axis direction (±X, ±Y, ±Z), requiring 6 render passes. This is why PointLight shadows are significantly more expensive than DirectionalLight (1 pass) or SpotLight (1 pass) shadows.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_3_0 }

export default {
  id: 'three-js-2-3-0-lighting',
  slug: 'lighting-shadow-maps',
  chapter: 'three-js-2.3',
  order: 0,
  title: LESSON_3JS2_3_0.title,
  subtitle: LESSON_3JS2_3_0.subtitle,
  tags: ['three-js', 'lighting', 'shadows', 'shadow-map', 'directionallight', 'pointlight', 'spotlight', 'ambient', 'pbr'],
  hook: {
    question: 'A shadow is computed by rendering the scene twice — once from the light\'s point of view. Why does a PointLight need 6 shadow renders per frame while a DirectionalLight only needs 1?',
    realWorldContext: 'Shadow maps are used in every real-time renderer from Fortnite to CAD presentation tools. Understanding the two-pass technique, shadow map resolution, bias, and acne means you can tune shadows correctly instead of randomly adjusting numbers until it looks right.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Lights are parameters — the GPU shader reads them when computing pixel colour via the BRDF.',
      'AmbientLight: uniform brightness, no direction — a hack for indirect light. Keep intensity low.',
      'DirectionalLight: parallel rays from a direction (like the Sun). One shadow map (orthographic frustum).',
      'PointLight: all-directions from a point. Six shadow maps (cube map faces). Expensive.',
      'SpotLight: cone of light. One shadow map. angle and penumbra control the cone edge.',
      'Shadow map: render scene from light\'s view → store depth texture → compare on main render.',
      'shadow.bias: tiny negative offset prevents shadow acne. Too large causes peter-panning.',
    ],
    callouts: [
      { type: 'important', title: 'castShadow AND receiveShadow', body: 'Both properties must be set. castShadow: the object blocks light. receiveShadow: the object shows shadows cast by others. Also set renderer.shadowMap.enabled = true.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_3_0.title, props: { lesson: LESSON_3JS2_3_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Shadow map = depth texture rendered from light\'s view. Compare each fragment\'s depth to stored depth.',
    'PointLight shadow = 6 renders (cube map). DirectionalLight = 1 render (orthographic). Cost differs hugely.',
    'shadow.mapSize = texture resolution. Higher = sharper shadows, more VRAM.',
    'shadow.bias = -0.0005 typical: prevents surface self-shadowing (acne) without floating shadows (peter-pan).',
    'shadow.camera defines the shadow volume — make it just large enough to cover your scene.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
