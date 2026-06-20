// Three.js 2 · Chapter 1 · Lesson 1
// Materials & Physically-Based Rendering

const LESSON_3JS2_1_1 = {
  title: 'Materials & Physically-Based Rendering',
  subtitle: 'What a material actually is — a BRDF — and how Three.js\'s shading models approximate real-world light interaction.',
  sequential: true,

  cells: [

    // ── Cell 1: What Is a Material? ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What a Material Actually Is

A material is an implementation of a **shading model** — a mathematical function that takes incoming light direction, surface normal, and viewer direction, and returns outgoing light colour. The full physics is described by the rendering equation (Kajiya, 1986):

\`\`\`
L_out(x, ω_out) = L_emit(x, ω_out) + ∫ f_r(x, ω_in, ω_out) · L_in(x, ω_in) · cos(θ) dω_in
\`\`\`

In words: *the light leaving a surface point equals its own emission plus the integral over all incoming directions of the BRDF times incoming light times the angle factor.*

The **BRDF** (Bidirectional Reflectance Distribution Function) is the core of what a material *is*. It describes what fraction of incoming light reflects in each outgoing direction.

Real-time rendering cannot compute this integral exactly — it's an infinite sum over all directions. Instead, Three.js approximates it with a small number of analytical light contributions using one of several shading models.

---

### The Material Zoo

| Material | Shading Model | Needs Lights? | Cost | Use Case |
|----------|--------------|---------------|------|----------|
| \`MeshBasicMaterial\` | None — flat colour | No | Cheapest | Debug, UI elements, emissive objects |
| \`MeshLambertMaterial\` | Lambertian diffuse | Yes | Low | Matte surfaces, large counts |
| \`MeshPhongMaterial\` | Phong: diffuse + specular | Yes | Medium | Glossy plastic-like surfaces |
| \`MeshStandardMaterial\` | PBR (metalness/roughness) | Yes | High | Realistic surfaces — the standard |
| \`MeshPhysicalMaterial\` | Extended PBR + clearcoat | Yes | Highest | Car paint, glass, skin |
| \`MeshNormalMaterial\` | Encodes normal → RGB | No | Low | Debug normals |
| \`ShaderMaterial\` | Custom GLSL shader | Your choice | Varies | Full control — the Vulkan path |`,
    },

    // ── Cell 2: PBR Explained ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### PBR — Physically Based Rendering

\`MeshStandardMaterial\` uses the **Cook-Torrance** BRDF — the industry-standard PBR model. Instead of the old "ambient + diffuse + specular" triplet (an ad-hoc hack), PBR defines surfaces by physically meaningful parameters:

**\`metalness\`** (0–1):
- **0 = dielectric** (plastic, wood, concrete). Light diffuses beneath the surface and re-emits uniformly.
- **1 = metallic** (gold, steel, aluminium). No subsurface scattering — surface reflects directly, tinted by the material's colour.

**\`roughness\`** (0–1):
- **0 = perfectly smooth mirror**. One very sharp specular highlight.
- **1 = completely rough**. Light scatters equally in all directions — a matte finish.

These parameters are **physically meaningful**, which means PBR materials look consistent under any lighting. Old Phong materials look correct under one specific light setup and wrong under others because \`shininess\` has no physical basis.

> **CAD/CAM Note:** Every professional CAD rendering tool (KeyShot, SolidWorks Visualize, Fusion 360 Render) uses PBR materials. When you implement a Vulkan CAD renderer, you'll implement the Cook-Torrance BRDF directly. Learning to tune \`metalness\` and \`roughness\` here is directly applicable.

---

### MeshNormalMaterial — The Best Debugging Tool

\`MeshNormalMaterial\` encodes the surface normal direction as an RGB color:
- Normal pointing right (+X) → red
- Normal pointing up (+Y) → green
- Normal pointing toward you (+Z) → cyan/blue

This does not require any lights. It immediately reveals:
- Whether normals are correct (sphere looks smooth rainbow)
- Seams or discontinuities (visible as sharp colour boundaries)
- Flipped normals (wrong colour relative to expected)

Always keep \`MeshNormalMaterial\` in your debugging toolkit.`,
    },

    // ── Cell 3: Live Material Showcase ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Material Showcase — Eight Shading Models

Eight spheres, each a different material. The point light orbits to show how each material responds to changing light direction. Notice: Basic and Normal don't change with lighting — they are unlit. Lambert has no specular. Phong has a specular highlight. PBR variants respond correctly to energy conservation.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 280);
renderer.shadowMap.enabled = true;
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/280, 0.1, 200);
camera.position.set(0, 2, 14);
camera.lookAt(0, 0, 0);

// Lighting
var ambient = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambient);
var pointLight = new THREE.PointLight(0xffffff, 150, 50);
pointLight.position.set(0, 5, 5);
scene.add(pointLight);
// Light sphere (shows where the light is)
var lightSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
pointLight.add(lightSphere);

// Shared geometry
var geo = new THREE.SphereGeometry(0.75, 48, 48);

// Eight materials representing the spectrum
var materials = [
  { mat: new THREE.MeshBasicMaterial({ color: 0x64d8cb }),                              label: 'Basic' },
  { mat: new THREE.MeshNormalMaterial(),                                                  label: 'Normal' },
  { mat: new THREE.MeshLambertMaterial({ color: 0xf5a623 }),                             label: 'Lambert' },
  { mat: new THREE.MeshPhongMaterial({ color: 0xe06c75, shininess: 120 }),               label: 'Phong' },
  { mat: new THREE.MeshStandardMaterial({ color: 0x98c379, metalness: 0.0, roughness: 0.8 }), label: 'PBR Matte' },
  { mat: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0, roughness: 0.3 }), label: 'PBR Metal' },
  { mat: new THREE.MeshStandardMaterial({ color: 0xaaaacc, metalness: 1.0, roughness: 0.02 }), label: 'PBR Mirror' },
  { mat: new THREE.MeshStandardMaterial({ color: 0x7c6cfc, wireframe: true }),           label: 'Wireframe' },
];

var SPACING = 2.0;
var startX  = -((materials.length - 1) * SPACING) / 2;
materials.forEach(function(item, i) {
  var mesh = new THREE.Mesh(geo, item.mat);
  mesh.position.x = startX + i * SPACING;
  scene.add(mesh);
});

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;
  pointLight.position.x = Math.sin(t) * 8;
  pointLight.position.z = Math.cos(t) * 6;
  renderer.render(scene, camera);
  info.textContent = materials.map(function(m) { return m.label; }).join('  ·  ');
}
animate();`,
      outputHeight: 360,
    },

    // ── Cell 4: PBR Grid Concept ──────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The PBR Grid — Roughness × Metalness

The clearest way to understand PBR parameters is to build a grid of spheres that varies one parameter per axis. Game engines and CAD tools show exactly this grid in their material editors:

\`\`\`
              roughness →  0.0    0.25   0.5    0.75   1.0
                        ┌──────┬──────┬──────┬──────┬──────┐
metalness 0.0 (plastic) │mirror│ semi │ matte│ matte│ matte│
          0.5 (partial) │      │      │      │      │      │
          1.0 (metal)   │shiny │ ruff │ rough│ chalk│rough │
                        └──────┴──────┴──────┴──────┴──────┘
\`\`\`

Key observations:
- **Low metalness + low roughness** = glossy plastic (one tight specular highlight)
- **Low metalness + high roughness** = chalk or unglazed ceramic (diffuse, no specular)
- **High metalness + low roughness** = polished metal / chrome
- **High metalness + high roughness** = brushed metal or cast iron
- **Metalness 0.5** is rarely physically correct — most real materials are either entirely metallic or entirely dielectric. Values between 0 and 1 are used for layered or blended effects.

---

### The \`emissive\` Property

Standard and Phong materials have an \`emissive\` colour that is **added to the final pixel colour regardless of lighting**. The surface appears to glow.

\`\`\`js
const material = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: 0x64d8cb,
  emissiveIntensity: 2.0,
});
\`\`\`

**Important:** emissive does not illuminate neighbouring objects. It is a per-pixel addition, not a light source. For actual glowing that illuminates the scene, you need a \`PointLight\` + post-processing bloom.`,
    },

    // ── Cell 5: Coding Challenge 1 — PBR Grid ────────────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 1 — Build the PBR Grid

Create a 5×5 grid of spheres with \`MeshStandardMaterial\`:
- **X axis** (columns): roughness from 0.0 to 1.0 in 5 steps
- **Y axis** (rows): metalness from 0.0 to 1.0 in 5 steps

This is the standard PBR preview used in every game engine and CAD material editor. Use nested loops: outer loop for metalness rows, inner loop for roughness columns.

The starter code sets up the renderer, scene, camera, and lighting. Fill in the double loop.`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 360);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
var camera = new THREE.PerspectiveCamera(60, 640/360, 0.1, 100);
camera.position.set(0, 0, 7);
camera.lookAt(0, 0, 0);

// Lighting (required for MeshStandardMaterial)
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
var dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

var geo = new THREE.SphereGeometry(0.4, 32, 32);
var STEPS = 5;
var SPACING = 1.0;

// ── YOUR CODE: nested loop creating the 5×5 grid ──────────────────────────────
// for (var row = 0; row < STEPS; row++) {
//   var metalness  = row / (STEPS - 1);        // 0.0 to 1.0
//   for (var col = 0; col < STEPS; col++) {
//     var roughness = col / (STEPS - 1);       // 0.0 to 1.0
//     var mat = new THREE.MeshStandardMaterial({
//       color: 0xaaaaaa,
//       metalness: metalness,
//       roughness: roughness,
//     });
//     var mesh = new THREE.Mesh(geo, mat);
//     mesh.position.x = (col - (STEPS-1)/2) * SPACING;
//     mesh.position.y = (row - (STEPS-1)/2) * SPACING;
//     scene.add(mesh);
//   }
// }

renderer.render(scene, camera);`,
      outputHeight: 420,
    },

    // ── Cell 6: Coding Challenge 2 — Emissive Glow ───────────────────────────
    {
      type: 'js',
      instruction: `### Challenge 2 — Animated Emissive Pulsing

Create a sphere with \`MeshStandardMaterial\` and animate its \`emissiveIntensity\` using a sine wave so it appears to pulse between dim and bright.

Requirements:
- Base color: \`0x000000\` (pure black)
- Emissive color: \`0x64d8cb\` (cyan)
- \`emissiveIntensity\` should oscillate between 0.2 and 3.0 using \`Math.sin\`
- Formula: \`emissiveIntensity = 1.6 + 1.4 * Math.sin(t * 2)\`
- Add a dark grey sphere next to it (\`MeshStandardMaterial({ color: 0x333333 })\`) to contrast the emissive effect`,
      html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.js"></script>
<canvas id="cv" style="display:block;border-radius:6px"></canvas>
<div id="info" style="font-family:monospace;font-size:10px;color:var(--color-text-secondary, #475569);padding:5px;background:#0a0a0f;border-radius:0 0 6px 6px"></div>`,
      css: `body{margin:0;background:#060610}`,
      startCode: `var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(640, 320);
var scene  = new THREE.Scene();
scene.background = new THREE.Color(0x020208);
var camera = new THREE.PerspectiveCamera(60, 640/320, 0.1, 100);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));

var geo = new THREE.SphereGeometry(0.8, 32, 32);

// ── YOUR CODE: emissive sphere (pulses) ───────────────────────────────────────
// var emissiveMat = new THREE.MeshStandardMaterial({
//   color: 0x000000,
//   emissive: 0x64d8cb,
//   emissiveIntensity: 1.6,
//   roughness: 1.0,
//   metalness: 0.0,
// });
// var glowSphere = new THREE.Mesh(geo, emissiveMat);
// glowSphere.position.x = -1.2;
// scene.add(glowSphere);

// ── YOUR CODE: comparison sphere (non-emissive dark grey) ─────────────────────
// var plainSphere = ...
// plainSphere.position.x = 1.2;
// scene.add(plainSphere);

var t0 = performance.now();
function animate() {
  requestAnimationFrame(animate);
  var t = (performance.now() - t0) / 1000;

  // ── YOUR CODE: animate emissiveIntensity ──────────────────────────────────
  // emissiveMat.emissiveIntensity = 1.6 + 1.4 * Math.sin(t * 2);

  renderer.render(scene, camera);
  info.textContent = 'emissiveIntensity: ' +
    (typeof emissiveMat !== 'undefined' ? emissiveMat.emissiveIntensity.toFixed(2) : '—');
}
animate();`,
      outputHeight: 390,
    },

    // ── Cell 7: Quiz ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You have a \`MeshStandardMaterial\` with \`metalness: 1.0\` and \`roughness: 0.0\`. In the render, the sphere looks almost pure black. Nothing seems wrong with the lights. What is the most likely cause?`,
      options: [
        { label: 'A', text: 'The color property defaults to black — change it to white.' },
        { label: 'B', text: 'A perfectly smooth metal sphere (roughness=0) acts as a mirror — it reflects the environment. Without an environment map (envMap), there is nothing to reflect, so it appears dark.' },
        { label: 'C', text: 'MeshStandardMaterial only works with DirectionalLight, not PointLight.' },
        { label: 'D', text: 'metalness: 1.0 disables the color property — you need to use emissive instead.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A metallic mirror surface reflects the environment — if there is no environment map (envMap), it reflects nothing, appearing nearly black. The fix: add a scene.environment map (an HDR equirectangular image loaded with RGBELoader), or reduce roughness above 0 to see some ambient contribution. This is a very common surprise when building PBR scenes.',
      failMessage: 'The answer is B. A metal surface with roughness=0 is a perfect mirror — it reflects the environment map. Without one, it reflects black. The color property does affect metals (it tints the reflection), and point lights work fine with MeshStandardMaterial. The solution is to load an HDR environment map using RGBELoader or set a lower roughness value.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `What is the difference between \`emissive\` in MeshStandardMaterial and an actual light source like \`PointLight\`?`,
      options: [
        { label: 'A', text: 'There is no practical difference — emissive and PointLight both illuminate neighbouring objects.' },
        { label: 'B', text: 'emissive is only visible when the camera is within 5 units of the mesh.' },
        { label: 'C', text: 'emissive adds colour to the surface pixel independently of lighting — the surface "glows" — but it does NOT cast light onto other objects. A PointLight actually illuminates the scene.' },
        { label: 'D', text: 'emissive replaces the base colour entirely, while PointLight adds to it.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. emissive is a per-pixel colour addition that makes a surface look self-lit, but it has no effect on other objects in the scene. A PointLight emits light that illuminates surrounding geometry and casts shadows. To create a glowing object that actually lights the scene, you need both emissive (for visual appearance) and a co-located PointLight (for actual illumination) — plus bloom post-processing for the halo effect.',
      failMessage: 'The answer is C. emissive is a shading hack — it makes the surface pixel brighter without emitting actual light. No shadow is cast, no neighbouring object gets illuminated. A PointLight physically illuminates the scene. To combine both effects: place an emissive mesh AND a PointLight at the same position, then add bloom via a post-processing pass.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_1_1 }

export default {
  id: 'three-js-2-1-1-materials-pbr',
  slug: 'materials-pbr',
  chapter: 'three-js-2.1',
  order: 1,
  title: LESSON_3JS2_1_1.title,
  subtitle: LESSON_3JS2_1_1.subtitle,
  tags: ['three-js', 'materials', 'pbr', 'brdf', 'meshstandardmaterial', 'metalness', 'roughness', 'emissive', 'shading'],
  hook: {
    question: 'What is a material, mathematically? And why do physically-based materials look correct under any lighting while Phong materials look "off" whenever you change the scene?',
    realWorldContext: 'PBR (Physically Based Rendering) is the standard in every game engine, CAD renderer, and film VFX pipeline. MeshStandardMaterial uses the same Cook-Torrance BRDF as KeyShot and Fusion 360. Understanding metalness and roughness here maps directly to professional material authoring.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'A material implements a BRDF — a function that maps incoming light direction to outgoing reflected light.',
      'MeshBasicMaterial: no lighting computation, flat constant colour. Cheapest, no lights needed.',
      'MeshStandardMaterial: Cook-Torrance PBR. metalness (0=plastic, 1=metal) × roughness (0=mirror, 1=matte).',
      'PBR looks correct under any lighting because it is energy-conserving and physically grounded.',
      'emissive: adds colour to pixel independently of lights — surface appears self-lit but does NOT illuminate neighbours.',
      'MeshNormalMaterial: encodes surface normals as RGB — the best debug tool for geometry inspection.',
    ],
    callouts: [
      { type: 'insight', title: 'Mirror metal looks black?', body: 'metalness=1 + roughness=0 = perfect mirror. Without an environment map (envMap), it reflects nothing and appears dark. Add a scene.environment HDR map to fix this.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_1_1.title, props: { lesson: LESSON_3JS2_1_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'BRDF = what fraction of incoming light reflects in each direction — that IS what a material is.',
    'metalness=0: dielectric (plastic/wood). metalness=1: conductor (gold/steel).',
    'roughness=0: mirror (tight highlight). roughness=1: matte (diffuse scatter).',
    'emissive ≠ light source. Emissive adds to the pixel; it does not illuminate the scene.',
    'MeshNormalMaterial → immediate normal direction feedback, no lights needed.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"BRDF = what fraction of incoming light reflects in each direction — that IS what a material is." Why is the BRDF a better definition of material than "colour and shininess"?',
      options: [
        'BRDFs use more parameters, giving higher accuracy',
        'BRDF captures how reflectance varies with both light direction and view direction — a single colour cannot express why a surface looks different at different viewing angles or under different lighting',
        'BRDF is required by WebGL but colour is not',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"metalness=0: dielectric. metalness=1: conductor." A chrome sphere (metalness=1) and a white plastic sphere (metalness=0) are in the same scene with a red light. How do their specular highlights differ?',
      options: [
        'Both have white specular highlights',
        'The chrome sphere\'s specular is tinted by its own colour (metal F0 = albedo); the plastic\'s specular is white (dielectric F0 ≈ 0.04)',
        'The plastic sphere has brighter specular because it has more diffuse light available',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"emissive ≠ light source. Emissive adds to the pixel; it does not illuminate the scene." A neon sign uses MeshStandardMaterial with emissive colour set. What must you also add to light surrounding walls?',
      options: [
        'Nothing — emissive materials automatically light nearby surfaces',
        'A PointLight at the sign\'s position to cast light onto the surrounding geometry',
        'An AmbientLight to simulate the glow',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"MeshNormalMaterial → immediate normal direction feedback, no lights needed." When is this material useful?',
      options: [
        'For final production rendering where accurate normals matter most',
        'For debugging — it colours surfaces by normal direction, making it easy to spot incorrect normals, flipped faces, or missing computeVertexNormals() calls without setting up any lights',
        'For transparent surfaces that cannot receive shadows',
      ],
      correct: 1,
    },
  ],
}
