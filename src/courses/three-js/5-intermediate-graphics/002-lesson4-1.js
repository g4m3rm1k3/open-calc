// Three.js · Chapter 4 · Lesson 1
// Depth Testing & the Z-Buffer

const LESSON_3JS_4_1 = {
  title: 'Depth Testing & the Z-Buffer',
  subtitle: 'The 1974 algorithm that tells the GPU which surface is in front.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The problem of painter's order

Before the Z-buffer, rendering 3D scenes required **sorting every triangle** by depth before drawing — the "painter's algorithm". Complex scenes with overlapping geometry were impossible to sort correctly.

In 1974, Wolfgang Straßer proposed storing a **depth value per pixel**. When drawing a new fragment, compare its depth to the stored value. If it's closer, write the colour and update the depth. If it's further, discard.

This simple algorithm — the **Z-buffer** — solved the visibility problem for all geometry simultaneously, in hardware. It remains unchanged in every GPU today.`,
    },

    // ── 1. How the Z-buffer works ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Z-Buffer Algorithm

The depth buffer is an additional framebuffer attachment — one float per pixel, initialized to \`1.0\` (far).

For each rasterized fragment:
1. Compute \`depth\` (from clip-space z, mapped to [0, 1])
2. Read \`storedDepth\` from the depth buffer at this pixel
3. If \`depth < storedDepth\` → fragment is closer → **write colour** and update depth
4. Otherwise → fragment is behind something → **discard**

\`\`\`
gl.enable(gl.DEPTH_TEST)
gl.depthFunc(gl.LESS)          // default: closer fragment wins
gl.clear(gl.DEPTH_BUFFER_BIT)  // reset to 1.0 at start of frame
\`\`\`

**Depth test functions:**
| Function | Passes when |
|----------|------------|
| \`LESS\` | new depth < stored (default) |
| \`LEQUAL\` | new depth ≤ stored |
| \`GREATER\` | new depth > stored |
| \`ALWAYS\` | always passes (disables depth test) |
| \`NEVER\` | never passes |

\`LEQUAL\` is used when you need a second pass to write the same geometry (shadow pass, decals).`,
    },

    // ── 2. Non-linear depth ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Non-Linear Depth Distribution

The depth buffer stores **NDC z** mapped to [0, 1]. But the perspective projection makes depth **non-linear**:

\`\`\`
depth = (f / (f - n)) + (f × n) / ((f - n) × z_view)
\`\`\`

Where \`n\` = near plane, \`f\` = far plane, \`z_view\` = actual view-space depth.

**The consequence:** most depth precision is concentrated near the **near plane**.

| z_view | depth value (n=0.1, f=1000) |
|--------|---------------------------|
| 0.1 (near) | 0.000 |
| 1.0        | 0.900 |
| 10.0       | 0.990 |
| 100.0      | 0.999 |
| 1000 (far) | 1.000 |

Objects at z=10 and z=10.01 may share the same depth buffer value!

**Rule of thumb:** Keep \`far / near < 10,000\`. A ratio of 1,000,000 will cause severe Z-fighting even on objects that are clearly separated.`,
    },

    // ── 3. Non-linear depth visualizer ───────────────────────────────────
    {
      type: 'js',
      id: 'depth-vis',
      html: `<canvas id="c-depth" width="540" height="260" style="width:540px;height:260px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>Near: <input id="dnear" type="range" min="1" max="100" value="10" style="width:100px"> <span id="dnear-v">0.1</span></label>
  <label>Far: <input id="dfar" type="range" min="100" max="5000" value="1000" style="width:100px"> <span id="dfar-v">1000</span></label>
</div>`,
      startCode: `const c=document.getElementById('c-depth');
const ctx=c.getContext('2d');
const W=540,H=260;
const nearEl=document.getElementById('dnear');
const farEl=document.getElementById('dfar');
function draw(){
  const near=nearEl.value/100;
  const far=parseFloat(farEl.value);
  document.getElementById('dnear-v').textContent=near.toFixed(2);
  document.getElementById('dfar-v').textContent=far;

  ctx.fillStyle='#0d0d12';ctx.fillRect(0,0,W,H);

  // Draw depth distribution curve
  const PAD=50,GW=W-PAD*2,GH=H-80;
  ctx.strokeStyle='#223';
  ctx.lineWidth=1;
  for(let i=0;i<=10;i++){
    const x=PAD+i/10*GW;
    ctx.beginPath();ctx.moveTo(x,PAD);ctx.lineTo(x,PAD+GH);ctx.stroke();
    const y=PAD+i/10*GH;
    ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(PAD+GW,y);ctx.stroke();
  }

  // Depth curve: depth(z) = -(f+n)/(f-n) + (-2*f*n/(f-n)) / z mapped to [0,1]
  // In standard: depth = (f/(f-n)) + (f*n/((f-n)*z)) — actually:
  // clip_z/clip_w = (f+n)/(f-n) - 2fn/((f-n)*z_view)
  // mapped to [0,1]: depth = 0.5 * (clip_z/clip_w + 1)
  function bufDepth(z){
    if(z<=0) return 1;
    const A=(far+near)/(far-near);
    const B=-2*far*near/(far-near);
    return 0.5*(A+B/z+1);
  }

  ctx.beginPath();
  ctx.strokeStyle='#7bf';
  ctx.lineWidth=2;
  for(let px=0;px<GW;px++){
    const t=px/GW;
    const z=near+t*(far-near);
    const d=bufDepth(z);
    const sx=PAD+px;
    const sy=PAD+GH*(1-d);
    px===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
  }
  ctx.stroke();

  // Labels
  ctx.fillStyle='#7bf';
  ctx.font='11px monospace';
  ctx.fillText('depth buffer value (0=near, 1=far)',PAD,PAD-8);
  ctx.fillStyle='#888';
  ctx.fillText('view z →',PAD+GW/2-30,PAD+GH+20);
  ctx.fillText('near='+near,PAD-2,PAD+GH+35);
  ctx.fillText('far='+far,PAD+GW-30,PAD+GH+35);
  ctx.fillStyle='#f87';
  ctx.font='bold 11px monospace';
  const ratio=far/near;
  ctx.fillText('far/near ratio: '+ratio.toFixed(0)+
    (ratio>10000?' ⚠ Z-fighting risk':ratio>1000?' ⚠ be careful':' ✓'),PAD,H-10);
}
nearEl.addEventListener('input',draw);
farEl.addEventListener('input',draw);
draw();`,
    },

    // ── 4. Z-fighting ────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Z-Fighting

When two surfaces map to the **same depth buffer value**, the GPU alternates between them per-pixel — producing a shimmering, flickering pattern called **Z-fighting**.

### Causes
- Two coplanar surfaces (e.g., a sticker on a wall, decal on a floor)
- far/near ratio too high (depth precision exhausted at distance)
- Floating-point rounding differences in the depth calculation

### Fixes

**1. Polygon Offset** — shift a surface's depth values slightly:
\`\`\`glsl
// WebGL
gl.enable(gl.POLYGON_OFFSET_FILL)
gl.polygonOffset(1.0, 1.0)  // factor, units
\`\`\`
\`\`\`javascript
// Three.js
material.polygonOffset = true
material.polygonOffsetFactor = 1
material.polygonOffsetUnits = 1
\`\`\`

**2. Adjust near/far** — increase near or decrease far to concentrate precision where you need it.

**3. Logarithmic depth buffer** — distributes precision more evenly (useful for space scenes spanning 1cm to 1AU):
\`\`\`javascript
const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true })
\`\`\``,
    },

    // ── 5. Z-fight demo ───────────────────────────────────────────────────
    {
      type: 'js',
      id: 'zfight-demo',
      html: `<canvas id="c-zf" width="480" height="200" style="width:480px;height:200px;border-radius:8px;display:block;margin:auto;background:#111"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>Separation: <input id="sep" type="range" min="0" max="100" value="0" style="width:130px"> <span id="sep-v">0.000</span></label>
  <label style="color:#7f9">Polygon Offset: <input id="poff" type="checkbox"></label>
</div>`,
      startCode: `// Simulate Z-fighting with Canvas 2D (approximate)
const c=document.getElementById('c-zf');
const ctx=c.getContext('2d');
const W=480,H=200;
const sepEl=document.getElementById('sep');
const poffEl=document.getElementById('poff');
let t=0;
function draw(){
  t+=0.02;
  const sep=sepEl.value/10000;
  const useOffset=poffEl.checked;
  document.getElementById('sep-v').textContent=sep.toFixed(4);

  ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);

  // Two rectangles at almost the same depth
  // Simulate Z-fighting by alternating which one is on top based on a hash
  const BX=80,BY=40,BW=320,BH=120;

  // Base surface (blue)
  ctx.fillStyle='#1a3a6a';
  ctx.fillRect(BX,BY,BW,BH);

  // Second surface (red)
  // Z-fight: when sep≈0 and no offset, hash pixels to decide winner
  if(sep<0.001&&!useOffset){
    // Simulate Z-fighting: random pattern that changes over time
    const id=ctx.createImageData(BW,BH);
    const d=id.data;
    for(let py=0;py<BH;py++){
      for(let px=0;px<BW;px++){
        // pseudo-random that changes each frame
        const h=(px*7+py*13+Math.floor(t*60)*3)%100;
        const isRed=h<50;
        const i=(py*BW+px)*4;
        if(isRed){d[i]=160;d[i+1]=40;d[i+2]=40;d[i+3]=255;}
        else{d[i]=26;d[i+1]=58;d[i+2]=106;d[i+3]=255;}
      }
    }
    ctx.putImageData(id,BX,BY);
    ctx.fillStyle='#f87';
    ctx.font='bold 13px monospace';
    ctx.fillText('⚠ Z-fighting! Both surfaces share depth buffer values',BX,BY-12);
  } else {
    // Clearly separated — red surface clearly on top
    ctx.fillStyle='#8b2020bb';
    ctx.fillRect(BX+20,BY+20,BW-40,BH-40);
    ctx.fillStyle='#7f9';
    ctx.font='bold 13px monospace';
    ctx.fillText(useOffset?'✓ Polygon offset applied — no Z-fighting':'✓ Surfaces separated by '+sep.toFixed(4)+' units',BX,BY-12);
  }

  ctx.fillStyle='rgba(26,58,106,0.6)';ctx.font='11px monospace';
  ctx.fillText('Blue surface (depth=0.50000)',BX+10,BY+H-170);
  ctx.fillStyle='rgba(139,32,32,0.6)';
  ctx.fillText('Red surface (depth=0.50000 + '+sep.toFixed(5)+')',BX+10,BY+H-155);

  requestAnimationFrame(draw);
}
sepEl.addEventListener('input',draw);
poffEl.addEventListener('change',draw);
draw();`,
    },

    // ── 6. Three.js depth settings ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Three.js Depth Settings

\`\`\`javascript
// Global renderer settings
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: false,  // true for extreme depth ranges
})
renderer.setSize(width, height)

// Per-material depth control
material.depthTest = true        // enable depth testing (default)
material.depthWrite = true       // write to depth buffer (false for particles)
material.depthFunc = THREE.LessEqualDepth  // depth comparison function

// Polygon offset for decals/stickers
material.polygonOffset = true
material.polygonOffsetFactor = 1  // slope-dependent offset
material.polygonOffsetUnits = 1   // constant offset

// Camera near/far — keep ratio reasonable
camera.near = 0.1
camera.far = 1000                 // far/near = 10000 — acceptable
camera.far = 100000               // far/near = 1000000 — Z-fighting likely
\`\`\``,
    },

    // ── 7. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-zbuffer-init',
      instruction: 'At the start of each frame, what value is the depth buffer initialised to — and why?',
      options: [
        { label: 'A', text: '0.0 — the near plane, so new fragments at any depth are guaranteed to pass the LESS test' },
        { label: 'B', text: '0.5 — the midpoint of the depth range, so equal numbers of fragments pass and fail on average' },
        { label: 'C', text: '1.0 — the far plane, so any fragment closer than the far plane passes the depth test on the first write' },
        { label: 'D', text: 'NaN — uninitialised, and each fragment initialises its own pixel on first write' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-nonlinear',
      instruction: 'Your scene has near=0.01, far=100000. Two objects at z=90000 and z=90001 Z-fight. What single change fixes this most effectively?',
      options: [
        { label: 'A', text: 'Increase the far plane to 200000 — more range means more precision at z=90000' },
        { label: 'B', text: 'Increase the near plane to 1.0 — reduces the far/near ratio from 10M to 100K, concentrating precision further out' },
        { label: 'C', text: 'Enable antialiasing — it smooths out the shimmering pixels from Z-fighting' },
        { label: 'D', text: 'Use depthFunc = LEQUAL — the equal case prevents Z-fighting at identical depths' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 9. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-depthwrite',
      instruction: 'You render a particle system. Each particle is a transparent billboard. You set material.depthWrite = false. What is the effect?',
      options: [
        { label: 'A', text: 'Particles become fully opaque — disabling depth write enables the painter\'s algorithm fallback' },
        { label: 'B', text: 'Particles are invisible — depthWrite=false prevents them from writing colour values too' },
        { label: 'C', text: 'Particles are visible but do not occlude each other or later-drawn geometry — they read depth but don\'t write it' },
        { label: 'D', text: 'Particles sort themselves automatically back-to-front when depthWrite is disabled' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Enable depth testing ───────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Enable the Depth Test

Two quads overlap: green at z=0 (closer) and red at z=-0.5 (further). Without depth testing, draw order decides the winner. With it, the z-buffer does.

**Requirements:**
1. \`gl.enable(gl.DEPTH_TEST)\` before drawing
2. \`gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)\` — clear both buffers
3. Keep drawing order: green first, then red

When correct, green always appears in front regardless of draw order.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs=\\\`attribute vec3 p;uniform vec3 u;varying vec3 vc;void main(){vc=u;gl_Position=vec4(p,1.);}\\\`
const fs=\\\`precision mediump float;varying vec3 vc;void main(){gl_FragColor=vec4(vc,1.);}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const u=gl.getUniformLocation(prog,'u'),a=gl.getAttribLocation(prog,'p')
// TODO 1: gl.enable(gl.DEPTH_TEST)
gl.clearColor(.05,.05,.1,1)
// TODO 2: gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
gl.clear(gl.COLOR_BUFFER_BIT) // replace this line
const b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.8,-.5,0,.2,-.5,0,-.8,.5,0,.2,.5,0]),gl.STATIC_DRAW)
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0)
gl.uniform3f(u,.2,.9,.3);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
const b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.2,-.5,-.5,.9,-.5,-.5,-.2,.5,-.5,.9,.5,-.5]),gl.STATIC_DRAW)
gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0)
gl.uniform3f(u,.9,.2,.2);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs=\\\`attribute vec3 p;uniform vec3 u;varying vec3 vc;void main(){vc=u;gl_Position=vec4(p,1.);}\\\`
const fs=\\\`precision mediump float;varying vec3 vc;void main(){gl_FragColor=vec4(vc,1.);}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const u=gl.getUniformLocation(prog,'u'),a=gl.getAttribLocation(prog,'p')
gl.enable(gl.DEPTH_TEST)
gl.clearColor(.05,.05,.1,1)
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
const b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.8,-.5,0,.2,-.5,0,-.8,.5,0,.2,.5,0]),gl.STATIC_DRAW)
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0)
gl.uniform3f(u,.2,.9,.3);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
const b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.2,-.5,-.5,.9,-.5,-.5,-.2,.5,-.5,.9,.5,-.5]),gl.STATIC_DRAW)
gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0)
gl.uniform3f(u,.9,.2,.2);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => code.includes('gl.enable(gl.DEPTH_TEST)') && code.includes('DEPTH_BUFFER_BIT'),
    },
  ],
}

export default {
  id: 'three-js-4-1-depth-testing',
  slug: 'depth-testing-z-buffer',
  chapter: 'three-js.4',
  order: 1,
  title: 'Depth Testing & the Z-Buffer',
  subtitle: 'The 1974 algorithm that tells the GPU which surface is in front.',
  tags: ['three-js', 'depth-buffer', 'z-fighting', 'depth-precision', 'occlusion'],
  hook: {
    question: 'Two identical surfaces at z=-5.0 and z=-5.001. The depth buffer has 24-bit precision. At what point do they share the same depth buffer value — and how do you fix it?',
    realWorldContext: 'Z-fighting is so common that every 3D engine has a depth bias system. Understanding the non-linear depth distribution is the difference between a stable render and a shimmering mess.',
  },
  intuition: {
    prose: 'Z-buffer: 1 depth value per pixel, init to 1.0. Draw fragment only if depth < stored. Depth is non-linear — precision concentrated near the near plane. Z-fighting fix: increase near, reduce far, or use polygonOffset.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Depth Testing & the Z-Buffer', props: { lesson: LESSON_3JS_4_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Z-buffer per pixel, init 1.0, passes if depth<stored. Non-linear: precision at near. far/near<10000. Z-fight fix: polygonOffset or increase near.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_4_1 }
