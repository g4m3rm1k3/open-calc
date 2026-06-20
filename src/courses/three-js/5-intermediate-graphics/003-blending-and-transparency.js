// Three.js · Chapter 4 · Lesson 2
// Blending & Transparency

const LESSON_3JS_4_2 = {
  title: 'Blending & Transparency',
  subtitle: 'Porter-Duff alpha compositing — and why order matters for visual correctness.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The unsolved problem of transparency

Transparency sounds simple. It isn't. The fundamental issue: **alpha blending is not commutative**. Drawing a red glass in front of a blue glass produces a different result than drawing the blue glass in front of the red glass — even if both are at the same position.

This means transparent objects must be **sorted back-to-front** before drawing. In a complex scene with thousands of transparent objects, this sort happens every frame. For overlapping transparent meshes, there's no sort that's always correct.

Order-Independent Transparency (OIT) is still active research in 2024. In this lesson we master the tools available now.`,
    },

    // ── 1. Alpha blending equation ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Alpha Blend Equation

Alpha blending follows the **Porter-Duff "over" operator** (1984):

\`\`\`
result = src × src.alpha + dst × (1 - src.alpha)
\`\`\`

- **src** — the incoming fragment (the transparent object being drawn)
- **dst** — what's already in the framebuffer (background)
- **src.alpha** — 0 = fully transparent, 1 = fully opaque

\`\`\`javascript
// WebGL setup
gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)  // Porter-Duff over

// Equivalent separate terms:
// colour result = src.rgb × src.alpha + dst.rgb × (1 - src.alpha)
// alpha result  = src.a  × src.alpha + dst.a  × (1 - src.alpha)
\`\`\`

**Why order matters:**
- Draw **red (alpha=0.5)** over **blue**: result = red×0.5 + blue×0.5 = purple-ish
- Draw **blue (alpha=0.5)** over **red**: result = blue×0.5 + red×0.5 = same purple-ish
- These are equal only when both have the same alpha!

With different alphas, **the order changes the result**. The destination (\`dst\`) must already be in the framebuffer when the source is drawn — so opaque objects draw first.`,
    },

    // ── 2. Order-dependence demo ──────────────────────────────────────────
    {
      type: 'js',
      id: 'order-demo',
      html: `<div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap">
  <div>
    <canvas id="c-correct" width="200" height="200" style="border-radius:8px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:12px;color:#7f9;margin:4px 0">✓ Correct: back → front</p>
  </div>
  <div>
    <canvas id="c-wrong" width="200" height="200" style="border-radius:8px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:12px;color:#f87;margin:4px 0">✗ Wrong: front → back</p>
  </div>
</div>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>Red alpha: <input id="ra" type="range" min="10" max="90" value="60" style="width:100px"> <span id="ra-v">0.60</span></label>
  <label>Blue alpha: <input id="ba" type="range" min="10" max="90" value="80" style="width:100px"> <span id="ba-v">0.80</span></label>
</div>`,
      startCode: `function blendOver(src, dst, a){
  return [
    src[0]*a + dst[0]*(1-a),
    src[1]*a + dst[1]*(1-a),
    src[2]*a + dst[2]*(1-a),
  ];
}
function toCSS(c){ return \`rgb(\${Math.round(c[0]*255)},\${Math.round(c[1]*255)},\${Math.round(c[2]*255)})\`; }

const raEl=document.getElementById('ra');
const baEl=document.getElementById('ba');

function draw(){
  const ra=raEl.value/100, ba=baEl.value/100;
  document.getElementById('ra-v').textContent=ra.toFixed(2);
  document.getElementById('ba-v').textContent=ba.toFixed(2);

  const bg=[0.05,0.05,0.07]; // dark background
  const red=[0.9,0.15,0.1];
  const blue=[0.1,0.3,0.9];

  ['correct','wrong'].forEach(id=>{
    const c=document.getElementById('c-'+id);
    const ctx=c.getContext('2d');
    ctx.fillStyle='#0d0d10';ctx.fillRect(0,0,200,200);

    if(id==='correct'){
      // Back-to-front: draw blue (far) first, then red (near)
      // Start: background
      const afterBlue=blendOver(blue,bg,ba);
      const afterRed=blendOver(red,afterBlue,ra);
      const overlapCol=afterRed;

      // Draw blue rect
      ctx.fillStyle=toCSS(blendOver(blue,bg,ba));
      ctx.fillRect(30,50,120,100);
      // Draw red rect (overlapping)
      ctx.fillStyle=toCSS(blendOver(red,bg,ra));
      ctx.fillRect(60,50,120,100);
      // Overlap area
      ctx.fillStyle=toCSS(overlapCol);
      ctx.fillRect(60,50,90,100);
      ctx.fillStyle='#7f9';ctx.font='11px monospace';
      ctx.fillText('Blue drawn first (far)',20,40);
      ctx.fillText('Red drawn second (near)',20,180);
    } else {
      // Front-to-back: draw red first, then blue — wrong!
      const afterRed=blendOver(red,bg,ra);
      const afterBlue=blendOver(blue,afterRed,ba);
      const overlapCol=afterBlue;

      ctx.fillStyle=toCSS(blendOver(red,bg,ra));
      ctx.fillRect(60,50,120,100);
      ctx.fillStyle=toCSS(blendOver(blue,bg,ba));
      ctx.fillRect(30,50,120,100);
      ctx.fillStyle=toCSS(overlapCol);
      ctx.fillRect(60,50,90,100);
      ctx.fillStyle='#f87';ctx.font='11px monospace';
      ctx.fillText('Red drawn first (near)',20,40);
      ctx.fillText('Blue drawn second (far)',20,180);
    }
  });
}
raEl.addEventListener('input',draw);
baEl.addEventListener('input',draw);
draw();`,
    },

    // ── 3. Blend modes ────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Blend Modes

Different blend functions produce different visual effects:

### Alpha (Porter-Duff Over) — for glass, smoke, UI
\`\`\`javascript
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
\`\`\`
Result = \`src × alpha + dst × (1 - alpha)\`

### Additive — for fire, glow, particles, lasers
\`\`\`javascript
gl.blendFunc(gl.SRC_ALPHA, gl.ONE)   // or gl.ONE, gl.ONE
\`\`\`
Result = \`src × alpha + dst\`
**Order-independent!** Can draw in any order. Saturates to white on overlap.

### Multiply — for shadows, darkening
\`\`\`javascript
gl.blendFunc(gl.DST_COLOR, gl.ZERO)
\`\`\`
Result = \`src × dst\`

### Screen — for soft light (opposite of multiply)
\`\`\`javascript
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR)
\`\`\`
Result = \`1 - (1-src)(1-dst)\`

**Three.js blend modes:**
\`\`\`javascript
material.blending = THREE.NormalBlending     // alpha over
material.blending = THREE.AdditiveBlending   // additive
material.blending = THREE.MultiplyBlending   // multiply
material.blending = THREE.SubtractiveBlending
material.transparent = true
material.opacity = 0.7
\`\`\``,
    },

    // ── 4. Blend mode explorer ────────────────────────────────────────────
    {
      type: 'js',
      id: 'blend-explorer',
      html: `<canvas id="c-blend" width="480" height="240" style="width:480px;height:240px;border-radius:8px;display:block;margin:auto;background:#111"></canvas>
<div style="display:flex;gap:12px;justify-content:center;margin-top:8px;flex-wrap:wrap">
  <button id="b-alpha" style="background:#7bf3;color:#fff;border:1px solid #7bf;padding:4px 10px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:12px">Alpha</button>
  <button id="b-add" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:12px">Additive</button>
  <button id="b-mul" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:12px">Multiply</button>
  <button id="b-scr" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:12px">Screen</button>
</div>`,
      startCode: `const c=document.getElementById('c-blend');
const ctx=c.getContext('2d');
const W=480,H=240;
let mode='alpha';
const btns=['alpha','add','mul','scr'];
btns.forEach(b=>{
  document.getElementById('b-'+b).onclick=()=>{mode=b;btns.forEach(x=>{
    document.getElementById('b-'+x).style.background=x===b?'#7bf3':'#222';
    document.getElementById('b-'+x).style.borderColor=x===b?'#7bf':'#444';
  });draw();};
});
let t=0;
function draw(){
  t+=0.02;
  ctx.fillStyle='#0d0d12';ctx.fillRect(0,0,W,H);

  // Background gradient
  const bgGrd=ctx.createLinearGradient(0,0,W,0);
  bgGrd.addColorStop(0,'#1a1a2e');
  bgGrd.addColorStop(1,'#16213e');
  ctx.fillStyle=bgGrd;
  ctx.fillRect(0,0,W,H);

  // Draw some background circles
  for(let i=0;i<5;i++){
    const x=50+i*90,y=H/2;
    ctx.beginPath();ctx.arc(x,y,35,0,Math.PI*2);
    ctx.fillStyle=\`hsl(\${i*70},60%,30%)\`;
    ctx.fill();
  }

  // Two animated overlay circles
  const cx1=W/2-60+Math.sin(t)*30;
  const cx2=W/2+60-Math.sin(t)*30;
  const cy=H/2;
  const r=55;

  function circle(cx,cy,r,col,a){
    ctx.save();
    ctx.globalCompositeOperation={
      alpha:'source-over',
      add:'lighter',
      mul:'multiply',
      scr:'screen'
    }[mode]||'source-over';
    ctx.globalAlpha=a;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle=col;ctx.fill();
    ctx.restore();
  }

  circle(cx1,cy,r,'#ff4444',0.65);
  circle(cx2,cy,r,'#4444ff',0.65);

  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.font='bold 12px monospace';
  ctx.fillText({alpha:'Normal (Alpha Blending)',add:'Additive',mul:'Multiply',scr:'Screen'}[mode],12,22);
  ctx.fillStyle='rgba(180,180,180,0.6)';
  ctx.font='11px monospace';
  ctx.fillText({
    alpha:'src×α + dst×(1-α) — order dependent',
    add:'src×α + dst — order independent, saturates white',
    mul:'src × dst — darkens, good for shadows',
    scr:'1-(1-src)(1-dst) — brightens, soft light'
  }[mode],12,H-12);

  requestAnimationFrame(draw);
}
draw();`,
    },

    // ── 5. Correct rendering order ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Correct Render Order

The standard transparent draw order:

\`\`\`
1. Enable depth test, enable depth write
2. Draw all OPAQUE objects (any order — let depth test sort)

3. Enable depth test, DISABLE depth write
4. Sort transparent objects back-to-front by distance from camera
5. Draw transparent objects in sorted order

6. (Particles: use additive blending — no sorting needed)
\`\`\`

**Why disable depth write for transparent objects?**
If a transparent object writes to the depth buffer, it can occlude *other transparent objects* behind it — even though it should let them show through.

\`\`\`javascript
// Three.js automatically handles this when transparent=true
material.transparent = true
material.opacity = 0.5
// Three.js sorts transparent objects by camera distance automatically
// (but not for large/complex meshes — may still need manual renderOrder)

// Manual render order override
mesh.renderOrder = 1  // drawn after renderOrder=0 objects
\`\`\``,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-order',
      instruction: 'Three transparent planes: green (alpha=0.5) at z=-5, red (alpha=0.7) at z=-3, blue (alpha=0.6) at z=-1. What draw order gives correct alpha compositing?',
      options: [
        { label: 'A', text: 'Red, green, blue — sorted by alpha value (highest to lowest)' },
        { label: 'B', text: 'Green, red, blue — drawn back-to-front (furthest first)' },
        { label: 'C', text: 'Blue, red, green — drawn front-to-back for efficiency' },
        { label: 'D', text: 'Any order — alpha blending is commutative so order doesn\'t matter' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-additive',
      instruction: 'You\'re rendering a particle fire effect with 10,000 particles. Why is additive blending preferred over alpha blending for this use case?',
      options: [
        { label: 'A', text: 'Additive blending is 10× faster on the GPU than alpha blending' },
        { label: 'B', text: 'Additive blending is order-independent — particles can draw in any order without visual artifacts' },
        { label: 'C', text: 'Additive blending automatically prevents particles from overdrawing each other' },
        { label: 'D', text: 'Alpha blending doesn\'t work with particles because they use billboards' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-depthwrite',
      instruction: 'A transparent glass sphere has depthWrite=true. A solid rock is placed behind it. What visual bug occurs?',
      options: [
        { label: 'A', text: 'No bug — depth write ensures correct occlusion' },
        { label: 'B', text: 'The rock disappears — the glass sphere writes to the depth buffer, blocking the rock even though it should show through the glass' },
        { label: 'C', text: 'The glass sphere disappears — depth write causes self-occlusion' },
        { label: 'D', text: 'Both objects become fully opaque — depth write disables alpha blending' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Alpha blending ─────────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Set Up Alpha Blending

Draw a solid blue quad, then a semi-transparent orange quad over it using Porter-Duff **over** compositing.

**Requirements:**
1. \`gl.enable(gl.BLEND)\`
2. \`gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)\`
3. Draw blue (opaque) first, then orange with alpha=0.6

You should see blue through the orange in the overlap region.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs=\\\`attribute vec2 p;uniform vec4 u;varying vec4 vc;void main(){vc=u;gl_Position=vec4(p,0,1.);}\\\`
const fs=\\\`precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const u=gl.getUniformLocation(prog,'u'),a=gl.getAttribLocation(prog,'p')
gl.clearColor(.05,.05,.1,1);gl.clear(gl.COLOR_BUFFER_BIT)
// TODO 1: gl.enable(gl.BLEND)
// TODO 2: gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
const b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.9,-.6,.1,-.6,-.9,.6,.1,.6]),gl.STATIC_DRAW)
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform4f(u,.1,.3,.9,1.);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
const b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.2,-.7,.9,-.7,-.2,.7,.9,.7]),gl.STATIC_DRAW)
gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform4f(u,.9,.5,.1,.6);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs=\\\`attribute vec2 p;uniform vec4 u;varying vec4 vc;void main(){vc=u;gl_Position=vec4(p,0,1.);}\\\`
const fs=\\\`precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const u=gl.getUniformLocation(prog,'u'),a=gl.getAttribLocation(prog,'p')
gl.clearColor(.05,.05,.1,1);gl.clear(gl.COLOR_BUFFER_BIT)
gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
const b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.9,-.6,.1,-.6,-.9,.6,.1,.6]),gl.STATIC_DRAW)
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform4f(u,.1,.3,.9,1.);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
const b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.2,-.7,.9,-.7,-.2,.7,.9,.7]),gl.STATIC_DRAW)
gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform4f(u,.9,.5,.1,.6);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => code.includes('gl.enable(gl.BLEND)') && code.includes('ONE_MINUS_SRC_ALPHA'),
    },
  ],
}

export default {
  id: 'three-js-4-2-blending',
  slug: 'blending-and-transparency',
  chapter: 'three-js.4',
  order: 2,
  title: 'Blending & Transparency',
  subtitle: 'Porter-Duff alpha compositing — and why order matters for visual correctness.',
  tags: ['three-js', 'transparency', 'alpha', 'blending', 'porter-duff'],
  hook: {
    question: 'Three transparent planes in the wrong draw order produce the wrong colour. In the correct order they produce the right colour. Same geometry, same alpha values. Why?',
    realWorldContext: 'Transparency is the most complex rendering challenge in real time. OIT (Order-Independent Transparency) is still active research in 2024 — because the fundamental ordering problem has no cheap solution.',
  },
  intuition: {
    prose: 'Alpha blend: src×α + dst×(1-α). Order-dependent: draw back-to-front. Disable depthWrite for transparent objects. Additive blend: order-independent, saturates white — use for particles/fire.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Blending & Transparency', props: { lesson: LESSON_3JS_4_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Alpha over: src×a + dst×(1-a), order-dependent, back-to-front. Additive: src+dst, order-independent. transparent=true disables depthWrite in Three.js.'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Alpha over: src×a + dst×(1-a), order-dependent, back-to-front." Two transparent objects overlap. A is behind B. In which order must they be drawn?',
      options: [
        'Front-to-back (B first, then A) to save GPU work',
        'Back-to-front (A first, then B) — so the background is in the buffer when foreground transparency blends with it. Front-to-back would blend B against nothing, then A against B incorrectly',
        'Any order — alpha blending is commutative',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"transparent=true disables depthWrite in Three.js." Why is depthWrite disabled for transparent objects?',
      options: [
        'Transparent objects should not write to the depth buffer — doing so would block opaque geometry behind them from being correctly composited with other transparent layers',
        'Depth testing is completely disabled for transparent objects',
        'Writing depth values would cause z-fighting with the transparent surface itself',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Additive: src+dst, order-independent." A fire particle system uses additive blending. What visual property makes additive blending ideal for fire and glow effects?',
      options: [
        'It makes each particle fully opaque, creating solid-looking flames',
        'Overlapping particles accumulate brightness — areas with many particles glow brighter, naturally simulating emissive light accumulation',
        'Additive blending avoids the need to sort particles',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You render a scene with opaque geometry and transparent water surfaces. What is the correct render order?',
      options: [
        'All transparent objects first, then opaque objects',
        'Opaque geometry first (with depthWrite on), then transparent surfaces back-to-front (depthRead on, depthWrite off)',
        'Both can be rendered in any order if depthTest is disabled',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_3JS_4_2 }
