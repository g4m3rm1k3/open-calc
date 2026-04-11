// Three.js Course — Full Chapter Registry
// seven chapters, 35 lessons total

import lesson0_0, { LESSON_3JS_0_0 } from './lesson0-0.js'
import lesson0_1, { LESSON_3JS_0_1 } from './lesson0-1.js'
import lesson0_2, { LESSON_3JS_0_2 } from './lesson0-2.js'
import lesson0_3, { LESSON_3JS_0_3 } from './lesson0-3.js'
import lesson0_4, { LESSON_3JS_0_4 } from './lesson0-4.js'

import lesson1_0, { LESSON_3JS_1_0 } from './lesson1-0.js'
import lesson1_1, { LESSON_3JS_1_1 } from './lesson1-1.js'
import lesson1_2, { LESSON_3JS_1_2 } from './lesson1-2.js'
import lesson1_3, { LESSON_3JS_1_3 } from './lesson1-3.js'
import lesson1_4, { LESSON_3JS_1_4 } from './lesson1-4.js'
import lesson1_5, { LESSON_3JS_1_5 } from './lesson1-5.js'

import lesson2_0, { LESSON_3JS_2_0 } from './lesson2-0.js'
import {
  LESSON_3JS_2_1,
  LESSON_3JS_2_2,
  LESSON_3JS_2_3,
  LESSON_3JS_2_4,
  LESSON_3JS_3_0,
  LESSON_3JS_3_1,
  LESSON_3JS_3_2,
  LESSON_3JS_3_3,
  LESSON_3JS_4_0,
  LESSON_3JS_4_1,
  LESSON_3JS_4_2,
  LESSON_3JS_4_3,
  LESSON_3JS_4_4,
  LESSON_3JS_5_0,
  LESSON_3JS_5_1,
  LESSON_3JS_5_2,
  LESSON_3JS_5_3,
  LESSON_3JS_5_4,
  LESSON_3JS_6_0,
  LESSON_3JS_6_1,
  LESSON_3JS_6_2,
  LESSON_3JS_6_3,
  LESSON_3JS_6_4,
} from './lesson-stubs.js'

// Helper: wrap a lesson constant as a navigable lesson object
const stub = (id, slug, chapter, order, title, subtitle, tags, hook, mentalModel, LESSON) => ({
  id, slug, chapter, order, title, subtitle, tags, hook,
  intuition: {
    prose: mentalModel,
    callouts: [],
    visualizations: LESSON ? [{ id: 'ScienceNotebook', title, props: { lesson: LESSON } }] : [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel,
  checkpoints: ['read-intuition'],
  quiz: [],
})

// ── Chapter stubs (2-1 through 6-4) — coming soon lessons ───────────────────

const lesson2_1 = stub('three-js-2-1-multi-textures','multiple-textures','three-js.2',1,'Multiple Textures & Blending','Combining diffuse, roughness, metalness maps and blend modes.',['three-js','textures','blending','alpha'],{ question:'How does a PBR material use 4 separate textures — and how does the GPU combine them into one colour?', realWorldContext:'Every PBR material in Unreal, Unity, or Three.js uses at least 4 texture slots. Multi-texturing is the baseline, not the exception.' },['mix(a,b,t): linear blend. AdditivBlend: a+b. MultiplyBlend: a*b','Alpha: src*src.a + dst*(1-src.a)','Transparency sorting required: back-to-front for alpha, not needed for additive','Three.js: material.map, roughnessMap, metalnessMap, aoMap, emissiveMap'],LESSON_3JS_2_1)

const lesson2_2 = stub('three-js-2-2-coord-systems','coordinate-systems-deep-dive','three-js.2',2,'Coordinate Systems Deep Dive','Which space every vector lives in — and how shader bugs trace back to getting it wrong.',['three-js','coordinate-space','normal-matrix','tangent-space'],{ question:'Your normals look wrong on a non-uniformly scaled object. The model matrix says (0,1,0) but the lit result disagrees. Why?', realWorldContext:'Coordinate space bugs — wrong normals, flipped directions — are the #1 class of subtle shader error. This lesson ends them.' },['Normal matrix = transpose(inverse(modelView 3x3)). Never use modelMatrix for normals.','Tangent space TBN: T=tangent, B=cross(N,T), N=normal. Normal maps stored in tangent space.','Three.js: normalMatrix built-in. modelMatrix, viewMatrix, projectionMatrix auto-provided.'],LESSON_3JS_2_2)

const lesson2_3 = stub('three-js-2-3-camera-system','fps-camera','three-js.2',3,'Camera System — FPS Camera','Yaw, pitch, look direction — from mouse input to a view matrix.',['three-js','camera','fps','lookat','quaternion'],{ question:'A player moves the mouse 100 pixels to the right. How does that become a rotation — and what stops the camera from flipping upside-down?', realWorldContext:'Every first-person game in existence uses this exact camera math. From Wolfenstein 3D (1992) to modern VR headsets.' },['Yaw: rotate world Y. Pitch: rotate local X. Clamp pitch ±89° to prevent flip.','Camera direction: dir = (cos(yaw)cos(pitch), sin(pitch), sin(yaw)cos(pitch))','Strafe = cross(dir, worldUp). Normalise before movement.','Three.js: PointerLockControls, OrbitControls, camera.rotation.order="YXZ"'],LESSON_3JS_2_3)

const lesson2_4 = stub('three-js-2-4-colors-materials','colors-and-materials','three-js.2',4,'Colors, Materials & Phong Preview','sRGB vs linear colour, gamma correction, and the Phong model.',['three-js','color','srgb','gamma','phong','materials'],{ question:'You mix red and white light in a shader and get a muddy brownish result instead of pink. What went wrong — and what colour space is to blame?', realWorldContext:'sRGB/linear colour confusion is the most common cause of "my lighting looks washed out" or "my colours don\'t blend right" in WebGL.' },['sRGB: perceptual encoding. Linear: physical light. Always decode sRGB textures before lighting.','Phong = ambient + Kd*(N·L) + Ks*(R·V)^shininess','renderer.outputColorSpace = SRGBColorSpace for correct gamma output.','MeshPhongMaterial: color, specular, shininess, emissive'],LESSON_3JS_2_4)

const lesson3_0 = stub('three-js-3-0-lighting-equation','the-lighting-equation','three-js.3',0,'The Lighting Equation','Build the Phong equation from nothing — ambient, then diffuse, then specular.',['three-js','phong','lighting','normals','diffuse','specular'],{ question:'A sphere sits in a scene. Without lighting, it is a flat disc. You add one line to the fragment shader. The disc suddenly has depth and volume. What is that line?', realWorldContext:'Diffuse lighting (the N·L dot product) is the single calculation that adds dimensionality to all 3D graphics. Without it, nothing has shape.' },['Phong: I = Ia*Ka + Id*Kd*max(0,N·L) + Is*Ks*pow(max(0,R·V),shininess)','Per-face normals: flat shading. Per-vertex normals: smooth (Gouraud/Phong depend on when calculated).','Normal vectors must be re-normalised in fragment shader (varyings are interpolated, length changes).'],LESSON_3JS_3_0)

const lesson3_1 = stub('three-js-3-1-phong-blinn','phong-blinn-shading','three-js.3',1,'Phong & Blinn-Phong Shading','Implementing the full lighting equation in GLSL — every line derived.',['three-js','phong','blinn-phong','glsl','half-vector'],{ question:'Phong and Blinn-Phong produce nearly identical results — except at extreme grazing angles where Phong shows a visible seam. Which uses the half-vector and why is it correct?', realWorldContext:'Blinn-Phong replaced Phong in virtually every real-time renderer by 1990. The half-vector approach is more numerically stable and more physically plausible at grazing angles.' },['H = normalize(L+V). Blinn-Phong specular uses N·H instead of R·V.','Multiple lights: sum each light\'s contribution. Cost scales linearly with light count.','gl_FragCoord: screen-space coords. varyings: interpolated between vertices.'],LESSON_3JS_3_1)

const lesson3_2 = stub('three-js-3-2-material-properties','material-surface-properties','three-js.3',2,'Materials & Surface Properties','Ka, Kd, Ks, shininess — the four numbers that define any surface.',['three-js','materials','phong','shininess','pbr-preview'],{ question:'Gold reflects yellow. Iron reflects grey. Both are metals. How do their material coefficients differ — and why does the colour of the specular highlight change for each?', realWorldContext:'Material design — choosing Ka, Kd, Ks values — is as much art as science. Understanding the physical meaning of each coefficient lets you design any surface type from first principles.' },['Ka: ambient (same from all directions). Kd: diffuse (N·L). Ks: specular (R·V)^shininess.','Physical constraint: Kd + Ks ≤ 1 (energy conservation). Phong violates this freely.','Shininess 2=rough, 128=shiny metal. Each doubling narrows specular lobe by ~half-width.'],LESSON_3JS_3_2)

const lesson3_3 = stub('three-js-3-3-light-types','directional-point-spot-lights','three-js.3',3,'Directional, Point & Spot Lights','Geometry, attenuation, and GLSL implementation of the three light archetypes.',['three-js','directional-light','point-light','spot-light','attenuation'],{ question:'A street lamp, the sun, and a stage spotlight. Three light sources. Three different geometric models. What property uniquely defines each one — and which requires the most GLSL instructions to compute?', realWorldContext:'These three light types are the vocabulary of every 3D lighting setup — from game levels to film VFX. Mastering them means mastering real-time lighting.' },['Directional: L = normalize(-lightDir). No position. No attenuation.','Point: L = normalize(lightPos - fragPos). attenuation = 1/(a+b*d+c*d²).','Spot: add theta = dot(L, -spotDir). Smooth edge: clamp((theta-outer)/(inner-outer), 0,1).'],LESSON_3JS_3_3)

const lesson4_0 = stub('three-js-4-0-model-loading','model-loading-gltf','three-js.4',0,'Model Loading — glTF & OBJ','Loading the "JPEG of 3D" and integrating external meshes into your scene.',['three-js','gltf','obj','model-loading','lod','instancing'],{ question:'A character has 50,000 triangles. You load 100 of them in a forest scene. 5 million triangles in 100 separate draw calls. What two techniques reduce this to one draw call?', realWorldContext:'glTF 2.0 is now an ISO standard (2022). Understanding its structure means you can load, parse, and modify any 3D file from Blender to Sketchfab to any online library.' },['glTF: JSON scene + .bin geometry + embedded textures (.glb = single binary bundle).','GLTFLoader: async. gltf.scene.traverse(child => if(child.isMesh) ...).','LOD: swap mesh by camera distance. InstancedMesh: N copies, 1 draw call, 1 setMatrixAt() per instance.'],LESSON_3JS_4_0)

const lesson4_1 = stub('three-js-4-1-depth-testing','depth-testing-z-buffer','three-js.4',1,'Depth Testing & the Z-Buffer','The 1974 algorithm that tells the GPU which surface is in front.',['three-js','depth-buffer','z-fighting','depth-precision','occlusion'],{ question:'Two identical surfaces at z=-5.0 and z=-5.001. The depth buffer has 24-bit precision. At what point do they share the same depth buffer value — and how do you fix it?', realWorldContext:'Z-fighting is so common that every 3D engine has a depth bias system. Understanding the non-linear depth distribution is the difference between a stable render and a shimmering mess.' },['Z-buffer: per-pixel depth in [0,1]. Depth test: LESS_EQUAL (default). Closest wins.','Non-linear depth: most precision near the near plane. near/far ratio < 10000 for safety.','Z-fighting fix: increase near, decrease far, polygon offset, or use depth bias.'],LESSON_3JS_4_1)

const lesson4_2 = stub('three-js-4-2-blending','blending-and-transparency','three-js.4',2,'Blending & Transparency','Porter-Duff alpha compositing — and why order matters for visual correctness.',['three-js','transparency','alpha','blending','porter-duff'],{ question:'Three transparent planes in the wrong draw order produce the wrong colour. In the correct order they produce the right colour. Same geometry, same alpha values. Why?', realWorldContext:'Transparency is the most complex rendering challenge in real time. OIT (Order-Independent Transparency) is still active research in 2024 — because the fundamental ordering problem has no cheap solution.' },['Alpha blend: result = src*src.a + dst*(1-src.a). Requires correct dst (written FIRST).','Additive blend: result = src + dst. Order independent — perfect for particles/fire/glow.','Transparent draw order: opaque first, then transparent back-to-front (sorted by camera distance).'],LESSON_3JS_4_2)

const lesson4_3 = stub('three-js-4-3-framebuffers','framebuffers-and-render-targets','three-js.4',3,'Framebuffers & Render Targets','Render to texture — the fundamental primitive behind every post-processing effect.',['three-js','framebuffer','render-target','post-processing','fbo'],{ question:'You render 3D scene twice: first to texture A, then full-screen quad reading A and outputting to screen. What visual transformations can you apply between the two passes that are impossible in a single pass?', realWorldContext:'Every post-process effect (bloom, motion blur, SSAO, SSGI, DoF, chromatic aberration) requires at least one render-to-texture pass. Framebuffers are the backbone of modern visual fidelity.' },['FBO: createFramebuffer → attach colour texture + depth renderbuffer → render → bind null to return to screen.','Post-process: full-screen quad + shader reading the render target texture.','Screen UV from fragCoord: vec2 uv = gl_FragCoord.xy / resolution;'],LESSON_3JS_4_3)

const lesson4_4 = stub('three-js-4-4-cubemaps','cubemaps-and-skyboxes','three-js.4',4,'Cubemaps & Skyboxes','The six-faced texture that captures the entire environment for reflections and IBL.',['three-js','cubemap','skybox','environment-map','reflections','ibl'],{ question:'A mirror ball placed in a room should reflect the entire room. Six textures capture that room from all directions. One lookup direction returns one texel. How?', realWorldContext:'Cubemap environment maps power the reflections in every photorealistic 3D renderer — from game engines to product visualisation tools. IBL (Image-Based Lighting) from HDR cubemaps is the dominant real-time lighting paradigm.' },['samplerCube: sample with a direction vec3 (not UV). textureCube(sampler, direction).','Skybox trick: set gl_Position = (P*V*pos).xyww to force depth=1 and render behind everything.','Reflection: R = reflect(I, N). Refraction: T = refract(I, N, n1/n2).'],LESSON_3JS_4_4)

const lesson5_0 = stub('three-js-5-0-shadow-mapping','shadow-mapping','three-js.5',0,'Shadow Mapping','The 1978 two-pass algorithm that still powers all real-time shadows.',['three-js','shadows','shadow-map','pcf','depth-texture'],{ question:'A light casts a shadow on a floor. The GPU renders the scene twice — once from the light, once from the camera. What does it do with the two renders to decide which parts are in shadow?', realWorldContext:'Frank Williams invented shadow mapping for Star Wars (1977). The algorithm has been the foundational real-time shadow technique for 45 years — because nothing cheaper has been found that looks as good.' },['Pass 1: render from light perspective, store depth in texture.','Pass 2: for each fragment, project position into light space, compare depth → shadow.','Bias prevents self-shadowing acne. Too much bias = peter-panning (shadow detaches from caster).'],LESSON_3JS_5_0)

const lesson5_1 = stub('three-js-5-1-normal-mapping','normal-mapping','three-js.5',1,'Normal Mapping','Per-pixel surface detail without extra geometry — the technique that changed real-time 3D.',['three-js','normal-map','tbn','tangent-space','bump-map'],{ question:'A rock mesh has 500 triangles. A normal map gives it the apparent lighting detail of 500,000 triangles. How does a 2D image tell the GPU which way is "up" at every pixel?', realWorldContext:'Normal mapping is the single highest-impact optimization in real-time game graphics. It was the primary reason game characters went from blocky polygons to believable surfaces without increasing geometry cost.' },['Normal map RGB → tangent-space direction: dir = texture.rgb * 2.0 - 1.0 (maps [0,1]→[-1,1]).','TBN matrix: built from tangent + bitangent + normal attributes. Transforms tangent→world.','Flat normal map = (0.5, 0.5, 1.0) = (0,0,1) in tangent space = no perturbation.'],LESSON_3JS_5_1)

const lesson5_2 = stub('three-js-5-2-hdr-bloom','hdr-and-bloom','three-js.5',2,'HDR & Bloom','Tone mapping the unbounded luminance of real light into the [0,1] display range.',['three-js','hdr','tone-mapping','bloom','aces','exposure'],{ question:'The sun is 10,000 times brighter than a lit room. Your display has a max value of 1.0. How do you represent "10,000 times brighter" inside a GPU buffer that stores [0,1] — and make it look right?', realWorldContext:'HDR rendering is now the default in every modern game engine and film pipeline. ACES tone mapping (adopted by the Academy of Motion Picture Arts and Sciences) maps infinite luminance to perceptually correct display output.' },['HDR buffer: colours > 1.0 stored in 16-bit float render target. No early clamping.','Reinhard: L/(1+L). ACES: (L*(2.51L+0.03))/(L*(2.43L+0.59)+0.14).','Bloom: threshold → extract bright → Gaussian blur → add back. Apply BEFORE tone mapping.'],LESSON_3JS_5_2)

const lesson5_3 = stub('three-js-5-3-deferred-rendering','deferred-rendering','three-js.5',3,'Deferred Rendering','Separate geometry from lighting — scale to 100 lights with constant per-light cost.',['three-js','deferred','g-buffer','mrt','lighting'],{ question:'Forward rendering costs O(geometry × lights) per frame. Deferred rendering costs O(geometry) + O(lights × screen-pixels). For 1 light they are equal. When does deferred significantly win?', realWorldContext:'AAA games in 2024 commonly use 50–200 dynamic lights. This is only possible because of deferred rendering. Call of Duty, The Witcher 3, Cyberpunk 2077 — all deferred.' },['G-buffer pass: write albedo/normal/position to 3 render targets simultaneously (MRT).','Lighting pass: per-light, read G-buffer, compute shading for screen pixels in light\'s volume.','Deferred cost: independent of scene polygon count. Forward cost: grows with both geometry AND lights.'],LESSON_3JS_5_3)

const lesson5_4 = stub('three-js-5-4-pbr','physically-based-rendering','three-js.5',4,'PBR — Physically Based Rendering','The Cook-Torrance BRDF and the metalness-roughness material model that unified game and film rendering.',['three-js','pbr','cook-torrance','brdf','metalness','roughness','ibl','ggx'],{ question:'Under Phong shading, a white sphere looks white in a white room. Under PBR with IBL, it looks like a mirror ball, a rough chalk ball, or anything in between — depending on two numbers. What are those numbers?', realWorldContext:'Disney\'s SIGGRAPH 2012 PBR paper changed the entire industry. Within 3 years, Unreal Engine 4 and Unity shipped PBR. By 2017 glTF 2.0 standardised the metalness-roughness workflow. Today it is the universal 3D material standard.' },['BRDF = DFG/(4(n·l)(n·v)). D=GGX distribution, F=Fresnel (Schlick), G=Smith shadowing.','F0 dielectric = 0.04. Metal F0 = albedo colour (tinted specular reflectance).','IBL: split-sum precomputes environment lighting into irradiance map + BRDF LUT.'],LESSON_3JS_5_4)

const lesson6_0 = stub('three-js-6-0-scene-graph','scene-graph','three-js.6',0,'The Scene Graph','The hierarchical transform tree — 40 years unchanged, the core of every 3D engine.',['three-js','scene-graph','object3d','hierarchy','transform'],{ question:'A robot\'s hand rotates 45°. Six child nodes (fingers) each follow automatically. How does the engine make all six move correctly from one rotation — without updating each individually?', realWorldContext:'Every 3D engine — from Three.js to Unreal, from Blender to Pixar\'s USD — uses a hierarchical scene graph. The pattern was invented in 1983 with PHIGS and has not fundamentally changed.' },['World matrix = parent.worldMatrix × child.localMatrix (recursive, depth-first).','Dirty flag: only recompute if localMatrix changed. O(changed nodes), not O(all nodes).','Object3D.traverse(fn): depth-first walk of entire subtree.'],LESSON_3JS_6_0)

const lesson6_1 = stub('three-js-6-1-ecs','ecs-vs-oop','three-js.6',1,'ECS vs OOP Architecture','Cache-friendly entity-component systems vs object-oriented inheritance — and why it matters at 10,000 objects.',['three-js','ecs','oop','architecture','performance','instancing'],{ question:'Your scene has 10,000 objects. Updating their transforms takes 4ms in OOP. Rearranging the same data into Structure of Arrays takes 0.8ms. Same logic, same result. Why is it 5× faster?', realWorldContext:'Unity\'s DOTS (2018) rewrote its engine around ECS and SoA. Overwatch, Battlefield, and Destiny all use ECS-like approaches for their simulations. The CPU cache is the bottleneck — architecture determines how much of it you waste.' },['ECS: entity=ID, component=pure data struct, system=function(entities with matching components).','SoA: [[x,x,x...],[y,y,y...],[z,z,z...]] beats AoS for single-attribute iteration (full cache lines).','Three.js OOP → InstancedMesh for ECS-style batch rendering: N objects, 1 draw call.'],LESSON_3JS_6_1)

const lesson6_2 = stub('three-js-6-2-resource-management','resource-management','three-js.6',2,'Resource Management','Allocate once, share everywhere, dispose when done — the patterns that prevent GPU memory leaks.',['three-js','memory','dispose','gpu-memory','caching','texture-compression'],{ question:'You navigate between two scenes. Scene A unloads. Its 50 textures should be freed. But your GPU memory counter keeps growing. Where did the memory go — and what three lines of code fix it?', realWorldContext:'Memory leaks in WebGL apps cause tab crashes, slow browser tabs, and GPU driver instability. The techniques in this lesson are the difference between a prototype and a production app.' },['Dispose: geometry.dispose(), material.dispose(), texture.dispose() — must be explicit.','renderer.info.memory.geometries / .textures — live GPU object counts.','Asset cache: Map<key, {asset, refCount}>. Dispose when refCount hits zero.'],LESSON_3JS_6_2)

const lesson6_3 = stub('three-js-6-3-render-pipeline','render-pipeline-abstraction','three-js.6',3,'Render Pipeline Abstraction','From 300-line render loop to composable render pass systems that scale.',['three-js','render-passes','architecture','culling','draw-order'],{ question:'You add shadow mapping to an existing scene. The render loop now has a "light camera" section, a "main camera" section, and a "post-process" section. What guarantees they execute in the correct order?', realWorldContext:'AAA engines have 15–40 explicitly ordered render passes per frame (shadow maps, depth prepass, GBuffer pass, SSAO, lighting, volumetric fog, transparency, bloom, TAA, UI). A clear pass system is what makes this manageable.' },['Render order: shadow passes → depth prepass → opaque (front-to-back) → skybox → transparent (back-to-front) → UI.','Frustum culling: test AABB against 6 frustum planes. Discard if outside — reduces draw calls to visible objects only.','Three.js: renderOrder, layers, frustumCulled, EffectComposer pass chain.'],LESSON_3JS_6_3)

const lesson6_4 = stub('three-js-6-4-debugging-performance','debugging-and-performance','three-js.6',4,'Debugging & Performance','Systematic GPU debugging methodology and performance profiling for real-time rendering.',['three-js','debugging','performance','profiling','draw-calls','overdraw'],{ question:'Your scene runs at 25fps. The fragment shader has 300 instructions. You halve them to 150 — but fps barely changes. What is the actual bottleneck, and how do you diagnose it?', realWorldContext:'GPU debugging is uniquely hard: no exceptions, no stack traces, silent wrong outputs. Every professional graphics engineer has a systematic debugging protocol. This lesson gives you one.' },['Debug technique: output normals/UVs/depth as colour to visually inspect values.','renderer.info.render.calls: draw call count. Target < 500 for smooth 60fps on mid-range hardware.','Bottlenecks: draw-call CPU overhead, vertex throughput, fragment ALU, memory bandwidth — identify which by ablation tests.'],LESSON_3JS_6_4)

// ── Chapter definitions ───────────────────────────────────────────────────────

const CH0 = {
  title: 'Foundations',
  number: 'three-js.0',
  slug: 'three-js-foundations',
  description: 'GPU architecture, the rendering pipeline, vectors, matrices, and coordinate spaces — the mental models that underlie everything.',
  course: 'three-js-1',
  lessons: [lesson0_0, lesson0_1, lesson0_2, lesson0_3, lesson0_4],
}

const CH1 = {
  title: 'WebGL Core',
  number: 'three-js.1',
  slug: 'three-js-webgl-core',
  description: 'The raw WebGL pipeline from context setup to the MVP matrix — every line of the minimum viable renderer.',
  course: 'three-js-1',
  lessons: [lesson1_0, lesson1_1, lesson1_2, lesson1_3, lesson1_4, lesson1_5],
}

const CH2 = {
  title: 'Rendering Fundamentals',
  number: 'three-js.2',
  slug: 'three-js-rendering-fundamentals',
  description: 'Textures, coordinate systems in practice, camera systems, and colour — the core of a complete 3D renderer.',
  course: 'three-js-1',
  lessons: [lesson2_0, lesson2_1, lesson2_2, lesson2_3, lesson2_4],
}

const CH3 = {
  title: 'Lighting',
  number: 'three-js.3',
  slug: 'three-js-lighting',
  description: 'The Phong lighting model built from scratch, Blinn-Phong shading, materials — implemented in GLSL.',
  course: 'three-js-1',
  lessons: [lesson3_0, lesson3_1, lesson3_2, lesson3_3],
}

const CH4 = {
  title: 'Intermediate Graphics',
  number: 'three-js.4',
  slug: 'three-js-intermediate',
  description: 'Model loading, depth testing, transparency, framebuffers, and environment maps.',
  course: 'three-js-1',
  lessons: [lesson4_0, lesson4_1, lesson4_2, lesson4_3, lesson4_4],
}

const CH5 = {
  title: 'Advanced Techniques',
  number: 'three-js.5',
  slug: 'three-js-advanced',
  description: 'Shadows, normal maps, HDR, deferred rendering, and physically-based rendering.',
  course: 'three-js-1',
  lessons: [lesson5_0, lesson5_1, lesson5_2, lesson5_3, lesson5_4],
}

const CH6 = {
  title: 'Engine & Architecture',
  number: 'three-js.6',
  slug: 'three-js-engine-architecture',
  description: 'Scene graphs, ECS, resource management, render pass abstraction, and debugging at scale.',
  course: 'three-js-1',
  lessons: [lesson6_0, lesson6_1, lesson6_2, lesson6_3, lesson6_4],
}

export default [CH0, CH1, CH2, CH3, CH4, CH5, CH6]
