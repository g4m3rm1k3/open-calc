// Three.js · Chapter 6 · Lesson 3
// Render Pipeline Abstraction

const LESSON_3JS_6_3 = {
  title: 'Render Pipeline Abstraction',
  subtitle: 'From 300-line render loop to composable render pass systems that scale.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The render loop that ate itself

You add shadow mapping. The loop grows. You add bloom. The loop grows. You add SSAO. The loop is 500 lines. Everything is tangled: shadow pass reads variables set by the geometry pass, bloom depends on the HDR output, UI requires depth disabled. Change one thing and something else breaks.

AAA game engines have 15–40 explicitly ordered render passes per frame. The key insight that makes this manageable: **render passes are composable units**. Each pass has a clear contract — inputs (render targets, uniforms) and outputs (render targets). The ordering is explicit and documented.

This lesson extracts that pattern into a minimal, practical render pass system.`,
    },

    // ── 1. Render order ───────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Correct Render Order

The canonical forward-rendering pass order:

\`\`\`
1. Shadow Map Passes (one per shadow-casting light)
   → Output: depth textures (shadow maps)

2. Depth Pre-pass (optional, reduces overdraw)
   → Output: depth buffer filled

3. Opaque Objects (front-to-back order, max depth rejection)
   → Output: colour + depth buffer

4. Skybox (at depth 1.0, rendered last to avoid fragment work)
   → Output: background colour

5. Transparent Objects (back-to-front, depth write off)
   → Output: blended over opaque

6. Post-Processing Passes (bloom, SSAO, TAA, DoF, tonemapping)
   → Output: screen-ready image

7. UI / HUD (orthographic, no depth test)
   → Output: final frame
\`\`\`

Each step depends on the previous. Misordering causes visual artifacts.`,
    },

    // ── 2. Frustum culling ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Frustum Culling — Don't Draw What Can't Be Seen

Objects outside the camera frustum contribute 0 pixels to the frame but cost CPU time for draw call setup and fragment shader time if submitted. Frustum culling eliminates them before they reach the GPU.

**Three.js:** Automatic for Mesh objects with \`frustumCulled = true\` (default).

\`\`\`javascript
// Culling is automatic — but you can control it
mesh.frustumCulled = true   // default: enabled
mesh.frustumCulled = false  // disable for objects that should always draw (e.g., skybox)

// Manual frustum check
const frustum = new THREE.Frustum()
const projScreenMatrix = new THREE.Matrix4()
projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
frustum.setFromProjectionMatrix(projScreenMatrix)

if (frustum.intersectsObject(mesh)) {
  // visible — draw
}
if (frustum.intersectsSphere(sphere)) { ... }
if (frustum.intersectsBox(box)) { ... }
\`\`\`

**Bounding volumes:**
- \`geometry.computeBoundingBox()\` → AABB for box tests
- \`geometry.computeBoundingSphere()\` → sphere for sphere tests
Three.js uses sphere tests for frustum culling by default (cheaper than AABB).`,
    },

    // ── 3. Pass system design ──────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Minimal Render Pass System

\`\`\`javascript
class RenderPass {
  constructor(name, execute) {
    this.name = name
    this.execute = execute
    this.enabled = true
  }
}

class RenderPipeline {
  #passes = []

  add(pass) {
    this.#passes.push(pass)
    return this
  }

  render(renderer, scene, camera, state) {
    for (const pass of this.#passes) {
      if (!pass.enabled) continue
      pass.execute(renderer, scene, camera, state)
    }
  }
}

// Build the pipeline
const pipeline = new RenderPipeline()

pipeline
  .add(new RenderPass('shadows', (renderer, scene, camera, state) => {
    renderer.setRenderTarget(state.shadowTarget)
    renderer.render(scene, state.shadowCamera)
  }))
  .add(new RenderPass('main', (renderer, scene, camera, state) => {
    renderer.setRenderTarget(state.hdrTarget)
    renderer.render(scene, camera)
  }))
  .add(new RenderPass('bloom', (renderer, scene, camera, state) => {
    state.bloomPass.render(renderer, state.hdrTarget)
  }))
  .add(new RenderPass('tonemap', (renderer, scene, camera, state) => {
    renderer.setRenderTarget(null)
    state.tonemapPass.render(renderer, state.hdrTarget)
  }))

// Animation loop
function animate() {
  pipeline.render(renderer, scene, camera, state)
  requestAnimationFrame(animate)
}
\`\`\``,
    },

    // ── 4. Three.js EffectComposer ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Three.js EffectComposer — Built-in Pass System

Three.js provides \`EffectComposer\` as the canonical render pass system:

\`\`\`javascript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js'

const composer = new EffectComposer(renderer)

// Pass 1: render scene
composer.addPass(new RenderPass(scene, camera))

// Pass 2: bloom
const bloom = new UnrealBloomPass(
  new THREE.Vector2(width, height), 1.5, 0.4, 0.85)
composer.addPass(bloom)

// Pass 3: FXAA anti-aliasing
const fxaa = new ShaderPass(FXAAShader)
fxaa.material.uniforms['resolution'].value.set(1/width, 1/height)
composer.addPass(fxaa)

// Toggle a pass
bloom.enabled = false  // skip bloom this frame

// Render loop: use composer.render() instead of renderer.render()
function animate() {
  composer.render()  // executes all passes in order
  requestAnimationFrame(animate)
}
\`\`\``,
    },

    // ── 5. Pipeline diagram ───────────────────────────────────────────────
    {
      type: 'js',
      id: 'pipeline-diagram',
      html: `<canvas id="c-pipe" width="560" height="300" style="width:560px;height:300px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>`,
      startCode: `const c=document.getElementById('c-pipe');
const ctx=c.getContext('2d');
ctx.fillStyle='#0d0d12';ctx.fillRect(0,0,560,300);

const passes=[
  {name:'Shadow\nPass',col:'#7af',desc:'depth tex'},
  {name:'Main\nRender',col:'#7f9',desc:'HDR FBO'},
  {name:'Bloom',col:'#fa7',desc:'blur+add'},
  {name:'Tone\nMap',col:'#f87',desc:'[0,1]'},
  {name:'UI\nPass',col:'#af7',desc:'overlay'},
  {name:'Screen',col:'#fff',desc:'display'},
];
const BW=72,BH=70,GAP=12;
const startX=12,startY=80;

passes.forEach((p,i)=>{
  const x=startX+i*(BW+GAP);
  const y=startY;
  // Box
  ctx.fillStyle=p.col+'22';
  ctx.strokeStyle=p.col;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(x,y,BW,BH,6);ctx.fill();ctx.stroke();
  // Name
  ctx.fillStyle=p.col;ctx.font='bold 11px monospace';ctx.textAlign='center';
  const lines=p.name.split('\n');
  lines.forEach((l,li)=>ctx.fillText(l,x+BW/2,y+22+li*15));
  // Desc
  ctx.fillStyle='#666';ctx.font='10px monospace';
  ctx.fillText(p.desc,x+BW/2,y+BH-8);
  // Arrow
  if(i<passes.length-1){
    const ax=x+BW+2,ay=y+BH/2;
    ctx.strokeStyle='#446';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax+GAP-4,ay);
    ctx.lineTo(ax+GAP-8,ay-4);ctx.moveTo(ax+GAP-4,ay);
    ctx.lineTo(ax+GAP-8,ay+4);ctx.stroke();
  }
});
ctx.textAlign='left';

// Enable/disable labels
ctx.fillStyle='#7af';ctx.font='bold 11px monospace';
ctx.fillText('pass.enabled = false → skip this pass',12,190);
ctx.fillStyle='#555';ctx.font='11px monospace';
ctx.fillText('Each pass: inputs (render targets, uniforms) → outputs (render targets)',12,210);
ctx.fillText('Order is explicit and cannot be changed at runtime without refactoring',12,228);

// EffectComposer note
ctx.fillStyle='#7f9';ctx.font='bold 12px monospace';
ctx.fillText('Three.js: composer.addPass(new RenderPass(scene, camera))',12,260);
ctx.fillStyle='#555';ctx.font='11px monospace';
ctx.fillText('composer.render() executes all enabled passes in order every frame',12,278);`,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-order',
      instruction: 'You accidentally render the skybox BEFORE the opaque objects. What visual artifact results?',
      options: [
        { label: 'A', text: 'No artifact — the depth test ensures the skybox is always behind opaque objects' },
        { label: 'B', text: 'The skybox overwrites opaque objects — the depth buffer is empty when skybox renders, so it writes depth=1.0 everywhere, then opaque objects fail the LESS depth test' },
        { label: 'C', text: 'The skybox disappears — opaque objects are drawn at depth=0 which always fails behind the skybox' },
        { label: 'D', text: 'The skybox is rendered but with wrong colour — the depth pre-pass changes its shading' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-culling',
      instruction: 'Frustum culling is enabled by default. After culling, renderer.info.render.calls shows 50. Without culling, what would calls be for a scene with 500 objects in view and 300 outside the frustum?',
      options: [
        { label: 'A', text: '50 — culling only eliminates invisible objects, and those are already not drawn' },
        { label: 'B', text: '350 — 500 visible + overhead' },
        { label: 'C', text: '800 — all 800 objects are submitted to the GPU regardless of culling' },
        { label: 'D', text: '500 + 300 = 800 calls without culling, but the 300 outside the frustum produce no pixels' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-effectcomposer',
      instruction: 'You replace renderer.render(scene, camera) with composer.render() but forget to add a RenderPass. What do the post-processing effects process?',
      options: [
        { label: 'A', text: 'They process the previous frame — the composer reads the last rendered framebuffer' },
        { label: 'B', text: 'An empty (black) framebuffer — without a RenderPass, the scene is never rendered into the composer\'s internal target' },
        { label: 'C', text: 'The same scene as renderer.render() — the composer bypasses its pass list for the first frame' },
        { label: 'D', text: 'A white framebuffer — the default clear colour is white in EffectComposer' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Build a render pipeline ─────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Assemble a Render Pipeline

Complete the \`RenderPipeline\` class and chain three passes in the correct order: shadows → main → tonemap.

**Requirements:**
1. \`add(pass)\` — push to \`this.passes\`, return \`this\` for chaining
2. \`render(state)\` — loop, skip disabled passes, call \`pass.execute(state)\`
3. Add passes: shadows, main, tonemap (in that order)

Console should print the three passes in sequence.`,
      html: ``,
      css: `body{margin:0;padding:12px;font-family:monospace;font-size:13px;background:#0d0d18;color:#e2e8f0}`,
      startCode: `class RenderPass{
  constructor(name,execute){this.name=name;this.execute=execute;this.enabled=true}
}
class RenderPipeline{
  constructor(){this.passes=[]}
  // TODO 1: add(pass){ this.passes.push(pass); return this }
  // TODO 2: render(state){ for(const pass of this.passes){ if(!pass.enabled)continue; pass.execute(state) } }
}
const pipeline=new RenderPipeline()
// TODO 3: pipeline
//   .add(new RenderPass('shadows', s=>console.log('1. Shadow pass')))
//   .add(new RenderPass('main',    s=>console.log('2. Main pass')))
//   .add(new RenderPass('tonemap', s=>console.log('3. Tonemap')))
pipeline.render({})`,
      solutionCode: `class RenderPass{
  constructor(name,execute){this.name=name;this.execute=execute;this.enabled=true}
}
class RenderPipeline{
  constructor(){this.passes=[]}
  add(pass){this.passes.push(pass);return this}
  render(state){for(const pass of this.passes){if(!pass.enabled)continue;pass.execute(state)}}
}
const pipeline=new RenderPipeline()
pipeline
  .add(new RenderPass('shadows',s=>console.log('1. Shadow pass')))
  .add(new RenderPass('main',   s=>console.log('2. Main pass')))
  .add(new RenderPass('tonemap',s=>console.log('3. Tonemap')))
pipeline.render({})`,
      check: (code) => /this\.passes\.push/.test(code) && /return this/.test(code) && /pass\.execute/.test(code) && code.includes("'shadows'") && code.includes("'main'") && code.includes("'tonemap'"),
    },
  ],
}

export default {
  id: 'three-js-6-3-render-pipeline',
  slug: 'render-pipeline-abstraction',
  chapter: 'three-js.6',
  order: 3,
  title: 'Render Pipeline Abstraction',
  subtitle: 'From 300-line render loop to composable render pass systems that scale.',
  tags: ['three-js', 'render-passes', 'architecture', 'culling', 'draw-order'],
  hook: {
    question: 'You add shadow mapping to an existing scene. The render loop now has a "light camera" section, a "main camera" section, and a "post-process" section. What guarantees they execute in the correct order?',
    realWorldContext: 'AAA engines have 15–40 explicitly ordered render passes per frame. A clear pass system is what makes this manageable.',
  },
  intuition: {
    prose: 'Render order: shadows→opaque(front-to-back)→skybox→transparent(back-to-front)→post→UI. Each pass: clear contract of inputs/outputs. Three.js: EffectComposer+RenderPass. Frustum culling: auto for meshes.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Render Pipeline Abstraction', props: { lesson: LESSON_3JS_6_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Pass order: shadows→opaque(F2B)→skybox→transparent(B2F)→post→UI. EffectComposer: addPass(RenderPass,BloomPass,etc), composer.render(). mesh.frustumCulled=true (default).'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Pass order: shadows → opaque (F2B) → skybox → transparent (B2F) → post → UI." Why must the skybox render after opaque geometry?',
      options: [
        'The skybox shader requires completed depth buffer data to work',
        'With skybox depth set to 1.0, opaque geometry always passes the depth test against it. Rendering skybox first would write depth=1.0 everywhere, but rendering opaque first lets the depth buffer cull the skybox behind it — saving fill rate',
        'The skybox cannot be rendered while there are active shadow maps',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"mesh.frustumCulled=true (default)." What does frustum culling do and why does the default matter?',
      options: [
        'It removes meshes from the scene permanently when they move off-screen',
        'It skips submitting meshes whose bounding sphere does not intersect the view frustum — the default means every mesh is automatically skipped when out of view, saving vertex shader work',
        'It improves texture filtering for off-screen objects',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"EffectComposer: addPass(RenderPass, BloomPass, etc)." You add passes in order: RenderPass → BloomPass → GammaCorrectionPass. Which pass writes to the screen?',
      options: [
        'RenderPass — it is always the output',
        'The last pass in the chain (GammaCorrectionPass) — EffectComposer chains passes sequentially, with each pass reading the previous pass\'s output. The final pass outputs to the screen',
        'All passes write to the screen simultaneously',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Opaque front-to-back (F2B)." Why render opaque objects front-to-back?',
      options: [
        'To ensure correct alpha blending results',
        'Fragments that fail the depth test are discarded early (early-Z). Front-to-back means closer objects are drawn first — their depth values reject further fragment shader invocations for covered pixels behind them, reducing wasted GPU work',
        'It is required for shadow maps to work correctly',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_3JS_6_3 }
