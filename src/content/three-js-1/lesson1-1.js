// Three.js · Chapter 1 · Lesson 1
// Your First Triangle — Masterclass

const LESSON_3JS_1_1 = {
  title: 'Your First Triangle',
  subtitle: 'The "Hello, World" of GPU programming — 7 steps from Float32Array to a lit pixel.',
  sequential: true,

  cells: [

    // ── Cell 0a: Prerequisites & Local Setup ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Prerequisites & Local Setup

**All you need:** Basic JavaScript — variables, arrays, functions. No graphics knowledge required.

Every code cell in this lesson runs live in your browser. No installations needed.

**Run locally:** Save this as \`triangle.html\` and open it in Chrome or Firefox — it is the complete program you will build, all in one file:

\`\`\`html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>First Triangle</title></head>
<body style="margin:0;background:#0a0f1e">
  <canvas id="cv" width="600" height="400"></canvas>
  <script>
    var canvas = document.getElementById('cv');
    var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.05, 0.07, 0.12, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var positions = new Float32Array([0.0, 0.6,  -0.5, -0.5,  0.5, -0.5]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }');
    gl.compileShader(vs);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, 'precision mediump float; void main() { gl_FragColor = vec4(1.0, 0.4, 0.1, 1.0); }');
    gl.compileShader(fs);

    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog); gl.useProgram(prog);

    var loc = gl.getAttribLocation(prog, 'aPosition');
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  </script>
</body>
</html>
\`\`\`

By the end of this lesson you will understand every single line above.`,
    },

    // ── Cell 0b: Learning Objectives + WebGL/GLSL Primer ─────────────────────
    {
      type: 'markdown',
      instruction: `### What You Will Learn

By the end of this masterclass you will be able to:
- Write a complete WebGL program from scratch — 7 steps, nothing missing
- Explain what a vertex shader and a fragment shader do in plain English
- Read and fix the 4 most common "blank canvas" bugs
- Map every raw WebGL call to its Three.js equivalent

---

### What Is WebGL?

WebGL is a JavaScript API that gives you **direct access to the GPU** from the browser. It is not a 3D engine — there are no scenes, cameras, or lights built in. You describe triangles, and the GPU draws them.

When you call \`gl.drawArrays(gl.TRIANGLES, 0, 3)\`, your GPU executes your code on dedicated graphics silicon — thousands of calculations running in parallel in under a millisecond.

**Three.js is a wrapper around WebGL.** Every \`THREE.Mesh\` you add to a scene eventually results in exactly the raw calls you write today. Three.js generates them automatically — understanding the raw API lets you *debug, optimise, and extend* Three.js, not just use it.

---

### What Is GLSL?

GLSL (OpenGL Shading Language) is the language that **runs on the GPU**. It looks like C. You write two small GLSL programs called *shaders*:

| Shader | Runs once per... | Your job | Output |
|--------|-----------------|----------|--------|
| **Vertex shader** | Vertex (corner of a triangle) | Where does this corner land on screen? | \`gl_Position\` — a vec4 |
| **Fragment shader** | Pixel covered by the triangle | What colour is this pixel? | \`gl_FragColor\` — a vec4 |

A **vec4** is four floats packed together: \`vec4(x, y, z, w)\`. For colours the four values are Red, Green, Blue, Alpha — each 0.0 to 1.0.

---

### The Coordinate System — NDC

WebGL does not think in pixels. It uses **Normalised Device Coordinates (NDC)**:

\`\`\`
(-1, +1) ─────────── (+1, +1)   ← top edge
    │         (0,0)         │   ← centre
(-1, -1) ─────────── (+1, -1)   ← bottom edge
\`\`\`

Anything outside ±1 on either axis is **clipped** — invisible. A common first bug: passing pixel coordinates like \`(300, 200)\` instead of NDC \`(0.0, 0.0)\` — the triangle vanishes with no error. Chapter 2 introduces the matrices that convert from world space to NDC automatically.`,
    },

    // ── Cell 0c: Graphics Pipeline Visual ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Graphics Pipeline

Before writing a single line of WebGL, understand the pipeline your code drives. Each stage has a distinct job — **click a stage** to see what happens there.`,
      html: `<canvas id="cv" width="660" height="220" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var STAGES = [
  { names: ['CPU'], subs: ['Float32Array', 'JS Memory'], col: '#60a5fa',
    detail: 'Your JavaScript builds a Float32Array of vertex positions and calls gl.bufferData() to copy it over the PCIe bus onto GPU memory. After this the CPU is done — the GPU takes over.' },
  { names: ['Vertex', 'Shader'], subs: ['Runs x3', 'per vertex'], col: '#a78bfa',
    detail: 'GLSL code YOU write. The GPU runs it once per vertex — 3 times for our triangle, all in parallel. It reads each vertex position from the buffer and outputs gl_Position in clip space.' },
  { names: ['Primitive', 'Assembly'], subs: ['Winding', 'Cull check'], col: '#34d399',
    detail: 'Groups every 3 vertices into a triangle. Checks winding order: CCW = front face. With gl.enable(gl.CULL_FACE), back-facing triangles are discarded here — before any pixels are touched.' },
  { names: ['Rasterizer'], subs: ['Fill pixels', 'Interpolate'], col: '#fbbf24',
    detail: 'Pure GPU hardware — no code you write. Determines which screen pixels fall inside the triangle and generates a fragment (a candidate pixel) for each one. A 200x200 triangle produces ~40,000 fragments.' },
  { names: ['Fragment', 'Shader'], subs: ['Runs xN', 'per pixel'], col: '#f87171',
    detail: 'GLSL code YOU write. Runs once per fragment — potentially thousands of times in parallel. Outputs gl_FragColor: the final RGBA colour of that pixel. This is where colour, lighting, and texture effects happen.' },
  { names: ['Canvas'], subs: ['Framebuffer', 'Screen pixels'], col: '#94a3b8',
    detail: 'Fragment colours are written to the framebuffer, which maps directly to the pixels on your canvas element. gl.clear() resets it each frame. gl.drawArrays() fills it.' },
];

var sel = -1;
var BW = 88, BH = 56, GAP = 12;
var totalW = STAGES.length * BW + (STAGES.length - 1) * (GAP + 16);
var ox = (W - totalW) / 2;
var oy = 16;

function bx(i) { return ox + i * (BW + GAP + 16); }

canvas.addEventListener('click', function(e) {
  var r = canvas.getBoundingClientRect();
  var mx = (e.clientX - r.left) * (W / r.width);
  var my = (e.clientY - r.top) * (H / r.height);
  var hit = -1;
  STAGES.forEach(function(_, i) {
    var x = bx(i);
    if (mx >= x && mx <= x + BW && my >= oy && my <= oy + BH) hit = i;
  });
  sel = (hit === sel) ? -1 : hit;
  draw();
});

function wrap(text, x, y, maxW, lh) {
  var words = text.split(' '), line = '';
  words.forEach(function(w) {
    var t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; }
    else { line = t; }
  });
  if (line) ctx.fillText(line, x, y);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  STAGES.forEach(function(s, i) {
    var x = bx(i), active = i === sel;

    if (i > 0) {
      var ax = x - GAP - 16, mid = oy + BH / 2;
      ctx.beginPath(); ctx.moveTo(ax, mid); ctx.lineTo(ax + GAP + 10, mid);
      ctx.strokeStyle = active ? s.col : '#334155'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax + GAP + 4, mid - 4); ctx.lineTo(ax + GAP + 10, mid); ctx.lineTo(ax + GAP + 4, mid + 4);
      ctx.strokeStyle = active ? s.col : '#334155'; ctx.stroke();
    }

    ctx.fillStyle = active ? s.col + '22' : '#0f172a';
    ctx.strokeStyle = active ? s.col : (sel >= 0 ? '#1e293b' : '#334155');
    ctx.lineWidth = active ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(x, oy, BW, BH, 6); ctx.fill(); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = active ? s.col : '#94a3b8';
    ctx.font = 'bold 10px monospace';
    s.names.forEach(function(l, li) { ctx.fillText(l, x + BW / 2, oy + 16 + li * 12); });

    ctx.fillStyle = active ? s.col + 'bb' : '#475569';
    ctx.font = '8px monospace';
    s.subs.forEach(function(l, li) { ctx.fillText(l, x + BW / 2, oy + BH - 14 + li * 10); });
  });

  var py = oy + BH + 14;
  if (sel >= 0) {
    var s = STAGES[sel];
    ctx.fillStyle = '#0f172a'; ctx.strokeStyle = s.col; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(10, py, W - 20, H - py - 10, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = s.col; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
    ctx.fillText(s.names.join(' '), 22, py + 18);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
    wrap(s.detail, 22, py + 34, W - 44, 14);
  } else {
    ctx.fillStyle = '#334155'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Click any stage to see what happens there', W / 2, py + 22);
  }
}
draw();`,
      outputHeight: 240,
    },

    // ── Cell 1: Why triangles + winding order ─────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Triangle — GPU\'s Only Primitive

Everything you see in real-time 3D — a sphere, a mountain, a character — is a mesh of **triangles**. GPUs are optimised for one thing: rasterising triangles. Quads, polygons, curves are all split into triangles before the GPU touches them.

**Why triangles and not something simpler?**

| Shape | Always planar? | Always convex? | Fixed vertex count? |
|---|---|---|---|
| Triangle | ✅ Yes | ✅ Yes | ✅ 3 |
| Quad | ❌ Can warp | ❌ Can be concave | 4 |
| N-gon | ❌ | ❌ | Variable |

A triangle is guaranteed to be a flat, convex polygon — which means the rasteriser can be implemented in hardware with zero edge cases.

**Winding order — which face is front?**

The GPU needs to know which side of the triangle is front (facing the camera) and which is back (hidden). It determines this from the order you list the vertices:

- **Counter-clockwise (CCW)** = front face ← WebGL default
- **Clockwise (CW)** = back face

When back-face culling is enabled (\`gl.enable(gl.CULL_FACE)\`), back-facing triangles are discarded before the fragment shader even runs — free performance. This is why swapping two vertices in your array can make a visible triangle invisible.

**The 7 steps to your first triangle:**

1. Create a \`Float32Array\` of 6 values (3 vertices × XY) — we work in 2D in this lesson; the vertex shader pads Z=0.0 automatically
2. Create a GPU buffer with \`gl.createBuffer()\`, bind, upload with \`gl.bufferData()\`
3. Write a **vertex shader** (GLSL source string) that passes positions through
4. Write a **fragment shader** (GLSL source string) that outputs a colour
5. Compile both, link into a **program**, then \`gl.useProgram()\`
6. Describe the buffer layout with \`gl.vertexAttribPointer()\` + \`gl.enableVertexAttribArray()\`
7. \`gl.drawArrays(gl.TRIANGLES, 0, 3)\` — GPU rasterises 3 vertices as 1 triangle

**Three.js does all 7 steps when you write:**
\`\`\`js
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...]), 3));
const mat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
scene.add(new THREE.Mesh(geo, mat));
\`\`\``,
    },

    // ── Cell 2: Winding Order Explorer ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### Winding Order Explorer

Drag the **numbered vertices** to reposition them. The blue arc shows the winding direction.

- **CCW** (counter-clockwise) = front face = rendered ✅
- **CW** (clockwise) = back face = culled when \`CULL_FACE\` is on ❌

Toggle **Cull Back Faces** to see the triangle vanish when winding flips to CW.`,
      html: `<div style="background:#0a0f1e;padding:12px;display:flex;flex-direction:column;align-items:center;gap:8px">
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center">
    <button id="btn-cull" style="padding:6px 14px;border-radius:7px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Cull Back Faces: OFF</button>
    <button id="btn-reset" style="padding:6px 14px;border-radius:7px;border:none;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Reset</button>
    <div id="winding-lbl" style="font-family:monospace;font-size:13px;font-weight:700;padding:4px 12px;border-radius:6px;background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid #4ade80">CCW — Front Face ✅</div>
  </div>
  <canvas id="cv" width="600" height="340" style="border-radius:8px;display:block;cursor:default"></canvas>
  <div style="font-family:monospace;font-size:10px;color:#475569;text-align:center">
    gl.drawArrays position array: [<span id="arr-lbl" style="color:#94a3b8">...</span>]
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var cullBack = false;

var verts = [
  {x:W/2, y:80,  label:'A', col:'#f87171'},
  {x:W/2+150, y:H-60, label:'B', col:'#4ade80'},
  {x:W/2-150, y:H-60, label:'C', col:'#38bdf8'},
];
var RADIUS = 16;
var drag = -1, offX = 0, offY = 0;

function cross2d(ax,ay,bx,by,cx,cy){
  return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,W,H);
  var A=verts[0],B=verts[1],C=verts[2];
  var z=cross2d(A.x,A.y,B.x,B.y,C.x,C.y);
  var ccw = z < 0;
  var visible = ccw || !cullBack;

  // Grid
  ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;
  for(var gx=0;gx<W;gx+=40){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
  for(var gy=0;gy<H;gy+=40){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}

  // Triangle fill
  if(visible){
    var grad=ctx.createLinearGradient(A.x,A.y,B.x,B.y);
    grad.addColorStop(0,'rgba(248,113,113,0.25)');
    grad.addColorStop(1,'rgba(56,189,248,0.25)');
    ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();
    ctx.fillStyle=grad;ctx.fill();
  }

  // Triangle outline
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();
  ctx.strokeStyle=visible?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.1)';ctx.lineWidth=1.5;ctx.stroke();

  // Winding arc — small arc from A->B->C showing direction
  var cx2=(A.x+B.x+C.x)/3, cy2=(A.y+B.y+C.y)/3;
  var ar=30;
  ctx.beginPath();
  var sa=Math.atan2(A.y-cy2,A.x-cx2);
  var ea=Math.atan2(B.y-cy2,B.x-cx2);
  ctx.arc(cx2,cy2,ar,sa,ea,!ccw);
  ctx.strokeStyle=ccw?'#4ade80':'#f87171';ctx.lineWidth=2;ctx.stroke();
  // Arrow tip
  var tipA=Math.atan2(B.y-cy2,B.x-cx2);
  var aDir=ccw?-1:1;
  ctx.beginPath();
  ctx.moveTo(cx2+ar*Math.cos(tipA),cy2+ar*Math.sin(tipA));
  ctx.lineTo(cx2+(ar-7)*Math.cos(tipA+aDir*0.35),cy2+(ar-7)*Math.sin(tipA+aDir*0.35));
  ctx.lineTo(cx2+(ar+7)*Math.cos(tipA+aDir*0.35),cy2+(ar+7)*Math.sin(tipA+aDir*0.35));
  ctx.closePath();ctx.fillStyle=ccw?'#4ade80':'#f87171';ctx.fill();

  // Culled marker
  if(!visible){
    ctx.fillStyle='rgba(248,113,113,0.06)';
    ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.fill();
    ctx.fillStyle='#f87171';ctx.font='bold 14px monospace';ctx.textAlign='center';
    ctx.fillText('BACK FACE — CULLED',cx2,cy2);
  }

  // Vertex dots
  verts.forEach(function(v,i){
    ctx.beginPath();ctx.arc(v.x,v.y,RADIUS,0,Math.PI*2);
    ctx.fillStyle=v.col+'33';ctx.fill();
    ctx.strokeStyle=v.col;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=v.col;ctx.font='bold 12px monospace';ctx.textAlign='center';
    ctx.fillText(v.label,v.x,v.y+4.5);
  });

  // NDC coords label
  function toNDC(vx,vy){
    return [(vx/W*2-1).toFixed(2),(-(vy/H*2-1)).toFixed(2)];
  }
  var lbl = document.getElementById('winding-lbl');
  lbl.textContent = ccw ? 'CCW — Front Face \u2705' : 'CW — Back Face \u274c';
  lbl.style.color = ccw ? '#4ade80' : '#f87171';
  lbl.style.borderColor = ccw ? '#4ade80' : '#f87171';
  lbl.style.background = ccw ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)';

  var ndcParts = verts.map(function(v){ var n=toNDC(v.x,v.y); return n[0]+','+n[1]+',0'; });
  document.getElementById('arr-lbl').textContent = ndcParts.join(', ');

  // Axes labels
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('(0,1,0)',W/2,14);
  ctx.fillText('(0,-1,0)',W/2,H-4);
  ctx.textAlign='left';ctx.fillText('(-1,0,0)',4,H/2);
  ctx.textAlign='right';ctx.fillText('(1,0,0)',W-4,H/2);
}

// Drag logic
canvas.addEventListener('mousedown',function(e){
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(W/r.width);
  var my=(e.clientY-r.top)*(H/r.height);
  verts.forEach(function(v,i){
    if(Math.hypot(v.x-mx,v.y-my)<RADIUS+4){drag=i;offX=v.x-mx;offY=v.y-my;}
  });
  canvas.style.cursor='grabbing';
});
canvas.addEventListener('mousemove',function(e){
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(W/r.width);
  var my=(e.clientY-r.top)*(H/r.height);
  if(drag>=0){verts[drag].x=mx+offX;verts[drag].y=my+offY;draw();}
  else{
    var hit=verts.some(function(v){return Math.hypot(v.x-mx,v.y-my)<RADIUS+4;});
    canvas.style.cursor=hit?'grab':'default';
  }
});
canvas.addEventListener('mouseup',function(){drag=-1;canvas.style.cursor='default';});
canvas.addEventListener('mouseleave',function(){drag=-1;});

document.getElementById('btn-cull').onclick=function(){
  cullBack=!cullBack;
  this.textContent='Cull Back Faces: '+(cullBack?'ON':'OFF');
  this.style.borderColor=cullBack?'#f87171':'#475569';
  this.style.color=cullBack?'#f87171':'#94a3b8';
  draw();
};
document.getElementById('btn-reset').onclick=function(){
  verts[0].x=W/2;verts[0].y=80;
  verts[1].x=W/2+150;verts[1].y=H-60;
  verts[2].x=W/2-150;verts[2].y=H-60;
  draw();
};
draw();`,
      outputHeight: 430,
    },

    // ── Cell 3: Challenge — winding order ─────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You define a triangle with vertices in this order: **A (bottom-left) → B (bottom-right) → C (top-centre)**. Back-face culling is enabled. The triangle renders correctly. You then swap A and B in the array, so the order becomes **B → A → C**. What happens?`,
      options: [
        { label: 'A', text: 'The triangle stays visible but moves to a mirrored position.' },
        { label: 'B', text: 'The triangle disappears — swapping two adjacent vertices reverses the winding order from CCW to CW, making it a back face, which the GPU discards.' },
        { label: 'C', text: 'The triangle stays but flickers — GPUs re-determine winding order each frame.' },
        { label: 'D', text: 'A WebGL error is thrown: "Invalid winding order in vertex buffer".' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! Swapping any two vertices in a triangle reverses its winding order. CCW → CW = front → back. With gl.enable(gl.CULL_FACE), back faces are discarded by the hardware before the fragment shader runs — no error, no warning, just an invisible triangle. This is one of the most common "why is my geometry missing?" bugs in WebGL. To diagnose: temporarily disable culling with gl.disable(gl.CULL_FACE) — if the triangle reappears, it\'s a winding order issue.',
      failMessage: 'WebGL never throws errors for winding order (D wrong). GPUs do not re-compute winding each frame (C wrong). The triangle does not mirror (A wrong). Swapping two vertices reverses the winding from CCW (front) to CW (back). With CULL_FACE enabled, back faces are silently discarded — the triangle disappears with no error message. The diagnostic: disable culling, see if geometry reappears.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 300,
    },

    // ── Cell 4: 7-step Walkthrough ────────────────────────────────────────────
    {
      type: 'walkthrough',
      instruction: `### Building the First Triangle — Step by Step

Work through all 7 steps. Each step shows **only the new code added**, and the **live result** on the right updates to show the cumulative program as you progress. By step 7 you have a complete, working WebGL triangle.`,
      html: `<canvas id="cv" width="600" height="340" style="display:block;width:100%"></canvas>`,
      css: `body{margin:0;background:#0a0f1e}`,
      outputHeight: 360,
      steps: [
        {
          title: 'Step 1 — Get the WebGL context',
          explanation: `The WebGL context is the bridge between JavaScript and your GPU.\n\n\`canvas.getContext('webgl2')\` opens that bridge. If the browser doesn\'t support WebGL2, fall back to \`'webgl'\`. Without a context, nothing renders — this is always step 1.\n\nAfter this step: plain dark canvas (clear colour is transparent black by default).`,
          code: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);`,
        },
        {
          title: 'Step 2 — Upload vertex positions to the GPU',
          explanation: `The GPU cannot read JavaScript arrays — it lives in its own memory. You must upload the vertex positions into a **GPU buffer**:\n\n1. \`gl.createBuffer()\` allocates GPU memory\n2. \`gl.bindBuffer(ARRAY_BUFFER, buf)\` makes it the active buffer for the next operations\n3. \`gl.bufferData()\` copies the Float32Array over the PCIe bus onto the GPU\n\nAfter this step: data is on the GPU but nothing is drawn yet (no shaders).`,
          code: `var positions = new Float32Array([
   0.0,  0.6,   // A — top centre (NDC)
  -0.5, -0.5,   // B — bottom left
   0.5, -0.5,   // C — bottom right
]);
var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);`,
        },
        {
          title: 'Step 3 — Write & compile the vertex shader',
          explanation: `The **vertex shader** runs once per vertex on the GPU. Its job: output \`gl_Position\` in clip space.\n\nFor our first triangle the vertices are already in NDC, so we just pass them through. \`vec4(..., 0.0, 1.0)\` adds Z=0 (on the near plane) and W=1.0 (no perspective divide needed).\n\n\`gl.getShaderInfoLog()\` — always check this! It returns the GLSL compiler error if the shader fails. WebGL never throws a JavaScript exception for shader errors.`,
          code: `var vsSource = \`
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
\`;
var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);
if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
  console.error('VS error:', gl.getShaderInfoLog(vs));`,
        },
        {
          title: 'Step 4 — Write & compile the fragment shader',
          explanation: `The **fragment shader** runs once per *pixel* that the triangle covers. Its responsibility: output the final colour as \`gl_FragColor\` (WebGL 1) or via \`out vec4\` (WebGL 2).\n\nFor now we hardcode a vivid orange-red. The four components are **RGBA** — each 0.0 to 1.0. This is the simplest possible fragment shader: one colour for every pixel everywhere.`,
          code: `var fsSource = \`
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1.0, 0.4, 0.1, 1.0);
  }
\`;
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource);
gl.compileShader(fs);
if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
  console.error('FS error:', gl.getShaderInfoLog(fs));`,
        },
        {
          title: 'Step 5 — Link shaders into a program',
          explanation: `A **program** is the GPU-side pipeline: vertex shader feeds into fragment shader. You attach both compiled shaders, link, then call \`gl.useProgram()\`.\n\nLinking can also fail (if outputs of VS don't match inputs of FS, for example). Always check \`gl.getProgramInfoLog()\`.\n\nAfter linking, the program lives on the GPU and is ready to receive draw calls.`,
          code: `var prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
  console.error('Link error:', gl.getProgramInfoLog(prog));
gl.useProgram(prog);`,
        },
        {
          title: 'Step 6 — Connect the buffer to the shader attribute',
          explanation: `The shader has attribute \`aPosition\` but doesn\'t know where to find it. You must tell WebGL:\n\n- Look up the attribute location: \`gl.getAttribLocation(prog, 'aPosition')\`\n- Describe the buffer layout: \`gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)\`\n  - \`2\` = 2 floats per vertex (X, Y)\n  - \`gl.FLOAT\` = 32-bit floats\n  - \`0\` stride = floats are tightly packed\n  - \`0\` offset = start from the beginning\n- Enable the attribute: \`gl.enableVertexAttribArray(loc)\`\n\nThink of this as: "for each vertex, read 2 floats starting at byte offset 0 and pass them as \`aPosition\`".`,
          code: `var loc = gl.getAttribLocation(prog, 'aPosition');
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);`,
        },
        {
          title: 'Step 7 — Draw!',
          explanation: `\`gl.drawArrays(mode, first, count)\` triggers the GPU to process vertices:\n\n- \`gl.TRIANGLES\`: every 3 consecutive vertices form one triangle\n- \`0\`: start at vertex index 0\n- \`3\`: process 3 vertices = 1 triangle\n\nThe GPU runs the vertex shader 3 times (once per vertex), then rasterises the triangle, then runs the fragment shader once per covered pixel.\n\n**You should now see a solid orange triangle. You\'ve written your first GPU program.**`,
          code: `gl.drawArrays(gl.TRIANGLES, 0, 3);`,
        },
      ],
    },

    // ── Cell 5: Coding Challenge — write the draw call ────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Change the Triangle Colour and Position

The triangle below is hardcoded to red. Your task: **modify both shaders and vertex positions** to make an **upside-down cyan triangle** in the top-right quadrant.

**Requirements:**
1. Fragment shader outputs cyan: \`vec4(0.0, 0.8, 1.0, 1.0)\`
2. All 3 vertices have **positive X** (right of centre) and **positive Y** (top half)
3. The triangle should be upside-down (widest at top, point at bottom)

The check passes when \`gl_FragColor\` contains \`0.0, 0.8\` (cyan test) and at least one vertex has negative Y (tip pointing down).`,
      html: `<canvas id="cv" width="560" height="320" style="display:block;border-radius:8px;width:100%;max-width:560px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;padding:10px}`,
      startCode: `// Modify this complete WebGL program to draw an upside-down CYAN triangle
// in the top-right quadrant of the canvas.

var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// TODO: Change these positions to put the triangle top-right, upside-down
var positions = new Float32Array([
   0.0,  0.6,
  -0.5, -0.5,
   0.5, -0.5,
]);

var vsSource = \`
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
\`;

// TODO: Change the colour to cyan (0.0, 0.8, 1.0, 1.0)
var fsSource = \`
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
  }
\`;

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);

var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);

var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var loc = gl.getAttribLocation(prog, 'aPosition');
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

gl.drawArrays(gl.TRIANGLES, 0, 3);`,
      solutionCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Top-right quadrant, upside-down: top-left & top-right have +X, +Y; bottom tip has +X, -Y
var positions = new Float32Array([
   0.1,  0.8,   // top-left of triangle (right quadrant)
   0.9,  0.8,   // top-right
   0.5, -0.1,   // tip pointing down
]);

var vsSource = \`
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
\`;

var fsSource = \`
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.0, 0.8, 1.0, 1.0);
  }
\`;

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);

var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);

var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var loc = gl.getAttribLocation(prog, 'aPosition');
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

gl.drawArrays(gl.TRIANGLES, 0, 3);`,
      check: (code) => {
        const hasCyan = /0\.\s*[,\s]+0\.8/.test(code) || /vec4\s*\(\s*0\.0\s*,\s*0\.8/.test(code);
        const hasNegY = /-0\.[1-9]/.test(code);
        return hasCyan && hasNegY;
      },
      successMessage: '✓ Cyan upside-down triangle in the top-right quadrant! You\'ve mastered the 7-step WebGL program. Next step: make both shaders react to time with a uniform.',
      failMessage: 'Check: 1) Fragment shader needs 0.0, 0.8, 1.0, 1.0 (cyan). 2) At least one vertex Y should be negative (the downward tip). Hint: upside-down means the two top vertices have high positive Y, the bottom tip has negative Y.',
      outputHeight: 340,
    },

    // ── Cell 6: Common Errors — Debug Clinic ──────────────────────────────────
    {
      type: 'js',
      instruction: `### Debug Clinic — 4 Silent Failures

WebGL never throws JavaScript exceptions for rendering bugs. These are the 4 most common first-triangle failures. Select each bug to see the broken output and the fix.`,
      html: `<div style="background:#0a0f1e;padding:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;justify-content:center">
  <div style="display:flex;flex-direction:column;gap:6px;min-width:190px">
    <div style="font-family:monospace;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:.06em;margin-bottom:4px">SELECT BUG:</div>
    <button data-bug="0" class="bug-btn active" style="padding:8px 12px;border-radius:7px;border:1.5px solid #38bdf8;background:rgba(56,189,248,0.12);color:#38bdf8;font-family:monospace;font-size:11px;cursor:pointer;text-align:left">✅ Working triangle</button>
    <button data-bug="1" class="bug-btn" style="padding:8px 12px;border-radius:7px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer;text-align:left">🐛 Bug 1: Missing enableVertexAttribArray</button>
    <button data-bug="2" class="bug-btn" style="padding:8px 12px;border-radius:7px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer;text-align:left">🐛 Bug 2: Wrong vertex count in drawArrays</button>
    <button data-bug="3" class="bug-btn" style="padding:8px 12px;border-radius:7px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer;text-align:left">🐛 Bug 3: Positions outside NDC range</button>
    <button data-bug="4" class="bug-btn" style="padding:8px 12px;border-radius:7px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer;text-align:left">🐛 Bug 4: Fragment shader compile error</button>
    <div id="fix-panel" style="margin-top:8px;background:#0f172a;border-radius:8px;padding:10px;font-family:monospace;font-size:10px;line-height:1.8;color:#64748b;min-height:80px"></div>
  </div>
  <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:6px">
    <div style="font-family:monospace;font-size:10px;color:#475569">WebGL output:</div>
    <canvas id="cv" width="380" height="280" style="border-radius:8px;border:1px solid rgba(255,255,255,0.08);width:100%;max-width:380px;display:block"></canvas>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

var BUGS = [
  {
    label:'Working triangle',
    positions:[0.0,0.6,-0.5,-0.5,0.5,-0.5],
    count:3,
    vsOk:true,fsOk:true,
    enableAttrib:true,
    fix:'This is the correct version. All 7 steps in the right order.',
    color:[1.0,0.4,0.1,1.0],
  },
  {
    label:'Missing enableVertexAttribArray',
    positions:[0.0,0.6,-0.5,-0.5,0.5,-0.5],
    count:3,
    vsOk:true,fsOk:true,
    enableAttrib:false,
    fix:'Fix: call gl.enableVertexAttribArray(loc) after vertexAttribPointer. Without it the GPU reads zeroes instead of your buffer — all vertices land at (0,0,0,0) which is clipped.',
    color:[1.0,0.4,0.1,1.0],
  },
  {
    label:'Wrong vertex count in drawArrays',
    positions:[0.0,0.6,-0.5,-0.5,0.5,-0.5],
    count:2,
    vsOk:true,fsOk:true,
    enableAttrib:true,
    fix:'Fix: gl.drawArrays(gl.TRIANGLES, 0, 3) — not 2.With count=2 and mode TRIANGLES, the GPU has 2 vertices but needs 3 to form a triangle. It silently skips the incomplete group — rendering nothing.',
    color:[1.0,0.4,0.1,1.0],
  },
  {
    label:'Positions outside NDC range',
    positions:[0.0,6.0,-5.0,-5.0,5.0,-5.0],
    count:3,
    vsOk:true,fsOk:true,
    enableAttrib:true,
    fix:'Fix: NDC ranges from -1.0 to +1.0 on each axis.Values like 6.0, -5.0 are outside the clip volume — the GPU clips the triangle against the NDC cube. A triangle 10x too big shows only a sliver or nothing.',
    color:[1.0,0.4,0.1,1.0],
  },
  {
    label:'Fragment shader compile error',
    positions:[0.0,0.6,-0.5,-0.5,0.5,-0.5],
    count:3,
    vsOk:true,fsOk:false,
    enableAttrib:true,
    fix:'Fix: check gl.getShaderInfoLog(fs) for the GLSL error.If the fragment shader fails to compile, the program link fails silently. gl.useProgram() uses the null program. The canvas stays black.\\nAlways add: if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(fs));',
    color:[1.0,0.4,0.1,1.0],
  },
];

function render(bug){
  var B = BUGS[bug];
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.05, 0.07, 0.12, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var vsrc = 'attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.0,1.0);}';
  var fsrc = B.fsOk
    ? 'precision mediump float;void main(){gl_FragColor=vec4('+B.color.join(',')+');}'
    : 'precision mediump float;void main(){gl_FragColor=vec4(1.0,0.0.0.0,1.0);}'; // syntax error

  var vs=gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs,vsrc);gl.compileShader(vs);

  var fs=gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs,fsrc);gl.compileShader(fs);

  var prog=gl.createProgram();
  gl.attachShader(prog,vs);gl.attachShader(prog,fs);
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){return;}
  gl.useProgram(prog);

  var buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(B.positions),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(prog,'aPosition');
  gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  if(B.enableAttrib) gl.enableVertexAttribArray(loc);

  gl.drawArrays(gl.TRIANGLES,0,B.count);

  // Overlay label
  var ctx2 = document.createElement('canvas').getContext('2d');
}

var currentBug = 0;
function select(idx){
  currentBug = idx;
  document.querySelectorAll('.bug-btn').forEach(function(b,i){
    var active = i===idx;
    b.style.borderColor = active?'#38bdf8':'#475569';
    b.style.background  = active?'rgba(56,189,248,0.12)':'transparent';
    b.style.color       = active?'#38bdf8':'#94a3b8';
    b.classList.toggle('active',active);
  });
  render(idx);
  document.getElementById('fix-panel').innerHTML =
    '<span style="color:#38bdf8">Diagnosis:</span><br>' +
    BUGS[idx].fix.replace(/\\n/g,'<br>');
}

document.querySelectorAll('.bug-btn').forEach(function(btn,i){
  btn.addEventListener('click',function(){select(i);});
});
select(0);`,
      outputHeight: 380,
    },

    // ── Cell 7: Challenge — diagnosing a blank canvas ─────────────────────────
    {
      type: 'challenge',
      instruction: `Your WebGL triangle code runs without any JavaScript exceptions, but the canvas is completely black. Which of the following would **not** help you diagnose the problem?`,
      options: [
        { label: 'A', text: 'Call gl.getShaderInfoLog(vs) and gl.getShaderInfoLog(fs) — to check for GLSL compile errors.' },
        { label: 'B', text: 'Call gl.getProgramInfoLog(prog) — to check for shader link errors.' },
        { label: 'C', text: 'Temporarily call gl.disable(gl.CULL_FACE) — to rule out winding-order / culling issues.' },
        { label: 'D', text: 'Restart the browser — WebGL context errors are cleared when the tab is reloaded fresh.' },
      ],
      check: (label) => label === 'D',
      successMessage: 'Correct! Restarting the browser (D) would not help diagnose a code bug — the same broken code will produce the same blank canvas. All of A, B, and C are real diagnostic steps: shader info logs reveal GLSL errors, program info log reveals linking errors, and disabling culling reveals winding mistakes. A blank canvas in WebGL always has a code cause — it never fixes itself on reload.',
      failMessage: 'All of A, B, and C are valid diagnostic steps for a blank WebGL canvas. D (restarting the browser) is the only one that would NOT help — a code bug is deterministic, it will produce the same blank result on every run. The blank canvas is caused by something in the code (shader error, link error, culling, or bad draw call) — and those are diagnosed with gl.getShaderInfoLog(), gl.getProgramInfoLog(), and temporarily disabling culling.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 8: Coding Challenge — add a second triangle (quad) ───────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Draw a Quad from Two Triangles

A quad (rectangle) is made of **two triangles**. Using \`gl.TRIANGLES\`, every 3 vertices form 1 triangle, so you need **6 vertex positions** (2 triangles × 3 vertices).

**Your task:** Complete the positions array to draw a filled rectangle centred on the canvas.

The vertices for a centred quad in NDC:
- Top-left: (-0.5, 0.5)
- Top-right: (0.5, 0.5)
- Bottom-right: (0.5, -0.5)
- Bottom-left: (-0.5, -0.5)

Triangle 1: top-left, top-right, bottom-left  
Triangle 2: top-right, bottom-right, bottom-left

Replace the \`// TODO\` comment with the correct 12 values (6 XY pairs).`,
      html: `<canvas id="cv" width="560" height="320" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;padding:10px}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// TODO: Complete the 12 values for a centred quad (2 triangles)
// Hint: list 3 vertex XY pairs for triangle 1, then 3 pairs for triangle 2
var positions = new Float32Array([
  // Triangle 1: top-left, top-right, bottom-left
  // Triangle 2: top-right, bottom-right, bottom-left
]);

var vsSource = \`
  attribute vec2 aPosition;
  void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
\`;
var fsSource = \`
  precision mediump float;
  void main() { gl_FragColor = vec4(0.5, 0.2, 0.9, 1.0); }
\`;
var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

// TODO: Update this to draw 6 vertices (2 triangles)
gl.drawArrays(gl.TRIANGLES, 0, 3);`,
      solutionCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

var positions = new Float32Array([
  // Triangle 1
  -0.5,  0.5,   // top-left
   0.5,  0.5,   // top-right
  -0.5, -0.5,   // bottom-left
  // Triangle 2
   0.5,  0.5,   // top-right
   0.5, -0.5,   // bottom-right
  -0.5, -0.5,   // bottom-left
]);

var vsSource = \`
  attribute vec2 aPosition;
  void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
\`;
var fsSource = \`
  precision mediump float;
  void main() { gl_FragColor = vec4(0.5, 0.2, 0.9, 1.0); }
\`;
var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

gl.drawArrays(gl.TRIANGLES, 0, 6);`,
      check: (code) => {
        const hasSix = /drawArrays\s*\([^,]+,\s*0\s*,\s*6\s*\)/.test(code);
        const hasFloat = /Float32Array\s*\(\s*\[/.test(code);
        return hasSix && hasFloat;
      },
      successMessage: '✓ Two-triangle quad complete! You now understand that all 3D quads, cuads, and n-gons are just triangle lists — and gl.TRIANGLES reads them in groups of 3. Production code uses gl.ELEMENT_ARRAY_BUFFER (index buffers) so vertices aren\'t duplicated — that\'s the next lesson.',
      failMessage: 'Make sure to: 1) Fill in 12 values in the Float32Array (6 vertices × 2 floats XY). 2) Change the draw call to gl.drawArrays(gl.TRIANGLES, 0, 6) — count must be 6 for 2 triangles.',
      outputHeight: 340,
    },

    // ── Cell 9: Final challenge — Three.js mapping ────────────────────────────
    {
      type: 'challenge',
      instruction: `In the 7-step WebGL triangle program, \`gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)\` uploads your vertex positions to the GPU. What is the **Three.js equivalent** of this entire operation (create buffer + upload data)?`,
      options: [
        { label: 'A', text: '`scene.add(mesh)` — adding the mesh to the scene triggers all buffer uploads.' },
        { label: 'B', text: '`geometry.setAttribute(\'position\', new THREE.BufferAttribute(positions, 3))` — this stores the Float32Array in the geometry for Three.js to upload to the GPU when rendering.' },
        { label: 'C', text: '`renderer.render(scene, camera)` — rendering triggers the buffer upload as a side effect.' },
        { label: 'D', text: '`new THREE.Mesh(geometry, material)` — the Mesh constructor uploads all geometry buffers immediately.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! geometry.setAttribute(\'position\', new THREE.BufferAttribute(positions, 3)) is the Three.js API that maps directly to createBuffer + bindBuffer + bufferData + vertexAttribPointer. The Float32Array you pass is exactly what you\'d put in new Float32Array([...]) in raw WebGL. The \'3\' is the itemSize (X, Y, Z per vertex) — equivalent to the \'2\' in vertexAttribPointer when using 2D. The actual GPU upload happens lazily at render time (C is partially true but not the "equivalent" of the setAttribute call).',
      failMessage: 'The direct equivalent of gl.bufferData + the surrounding buffer setup is geometry.setAttribute(\'position\', new THREE.BufferAttribute(positions, 3)). This stores the Float32Array and describes how to interpret it (3 floats per vertex). Three.js handles the actual GPU upload lazily — but the setAttribute call is where you provide the data, just like passing the Float32Array to gl.bufferData().',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 10: Extension Challenge — Uniform Animation ──────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Extension: Animate the Triangle with a Uniform

A **uniform** is a value you pass from JavaScript into a shader — it stays the same for every vertex/pixel in one draw call (unlike an attribute, which differs per vertex).

The shaders below already declare \`uniform float uTime\`. Your task:

1. After \`gl.useProgram(prog)\`, get the uniform location: \`gl.getUniformLocation(prog, 'uTime')\`
2. Inside \`render(t)\`, set it before drawing: \`gl.uniform1f(uTimeLoc, t * 0.001)\`
3. Replace the final \`render(0)\` call with \`requestAnimationFrame(render)\`, and add \`requestAnimationFrame(render)\` at the end of \`render()\` to loop

The triangle should pulse in size and shift colour when working.`,
      html: `<canvas id="cv" width="560" height="320" style="display:block;border-radius:8px;width:100%;max-width:560px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;padding:10px}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);

var vsSource = 'attribute vec2 aPosition; uniform float uTime; void main() { float s = 0.5 + 0.5 * sin(uTime); gl_Position = vec4(aPosition * s, 0.0, 1.0); }';
var fsSource = 'precision mediump float; uniform float uTime; void main() { float r = 0.5 + 0.5 * sin(uTime); gl_FragColor = vec4(r, 0.4, 1.0 - r, 1.0); }';

var vs = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fs, fsSource); gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

// TODO 1: var uTimeLoc = gl.getUniformLocation(prog, 'uTime');

var positions = new Float32Array([0.0, 0.6, -0.5, -0.5, 0.5, -0.5]);
var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

function render(t) {
  gl.clearColor(0.05, 0.07, 0.12, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // TODO 2: gl.uniform1f(uTimeLoc, t * 0.001);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  // TODO 3: requestAnimationFrame(render);
}

render(0); // TODO 3: replace with requestAnimationFrame(render)`,
      solutionCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);

var vsSource = 'attribute vec2 aPosition; uniform float uTime; void main() { float s = 0.5 + 0.5 * sin(uTime); gl_Position = vec4(aPosition * s, 0.0, 1.0); }';
var fsSource = 'precision mediump float; uniform float uTime; void main() { float r = 0.5 + 0.5 * sin(uTime); gl_FragColor = vec4(r, 0.4, 1.0 - r, 1.0); }';

var vs = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fs, fsSource); gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var uTimeLoc = gl.getUniformLocation(prog, 'uTime');

var positions = new Float32Array([0.0, 0.6, -0.5, -0.5, 0.5, -0.5]);
var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

function render(t) {
  gl.clearColor(0.05, 0.07, 0.12, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(uTimeLoc, t * 0.001);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);`,
      check: (code) => {
        const hasLoc = /getUniformLocation/.test(code);
        const hasUniform = /uniform1f/.test(code);
        const hasRAF = /requestAnimationFrame/.test(code);
        return hasLoc && hasUniform && hasRAF;
      },
      successMessage: 'Your triangle is alive! You just used a uniform — the most important bridge between JavaScript and GLSL. Uniforms are how you pass time, camera position, and transformation matrices into shaders. Every Three.js material property (color, opacity, map) eventually becomes a uniform.',
      failMessage: 'Three things needed: 1) gl.getUniformLocation(prog, "uTime") to get a handle on the uniform. 2) gl.uniform1f(uTimeLoc, t * 0.001) inside render() before the draw call. 3) requestAnimationFrame(render) both inside render() to continue the loop and outside to start it.',
      outputHeight: 340,
    },

    // ── Cell 11: Recap & Mental Model ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Recap — The Complete Picture

#### The 7 Steps

| Step | Call | What it does |
|------|------|-------------|
| 1 | \`new Float32Array([...])\` | Vertex XY positions in NDC, ready on the CPU |
| 2 | \`createBuffer / bindBuffer / bufferData\` | Upload vertex data to GPU memory |
| 3 | \`createShader(VERTEX_SHADER) + shaderSource + compileShader\` | Compile vertex shader on the GPU |
| 4 | \`createShader(FRAGMENT_SHADER) + shaderSource + compileShader\` | Compile fragment shader on the GPU |
| 5 | \`createProgram + attachShader×2 + linkProgram + useProgram\` | Link shaders into an executable GPU pipeline |
| 6 | \`getAttribLocation + vertexAttribPointer + enableVertexAttribArray\` | Tell the vertex shader where to find vertex data |
| 7 | \`drawArrays(TRIANGLES, 0, 3)\` | Fire the GPU — rasterise 3 vertices into pixels |

#### Raw WebGL vs Three.js

| Raw WebGL (~60 lines) | Three.js equivalent |
|-----------------------|--------------------|
| \`new Float32Array([...])\` + buffer upload | \`geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))\` |
| Vertex + fragment shader GLSL strings | \`new THREE.MeshBasicMaterial({ color: 0xff4400 })\` |
| \`createProgram + linkProgram + useProgram\` | Handled internally by Three.js renderer |
| \`vertexAttribPointer + enableVertexAttribArray\` | Handled internally by Three.js renderer |
| \`drawArrays(TRIANGLES, 0, 3)\` | \`renderer.render(scene, camera)\` |

Three.js does not skip any of these steps — it executes every one, every frame. Now you know what is happening underneath every \`renderer.render()\` call.

#### Four Core Mental Models

1. **Triangle = 3 CCW vertices.** The GPU knows only triangles. All 3D geometry is triangles. Winding order determines which side is front.
2. **Vertex shader = position calculator.** Runs on the GPU once per vertex. Input: your buffer. Output: \`gl_Position\` in clip space.
3. **Fragment shader = pixel painter.** Runs once per covered pixel, potentially millions of times per frame, all in parallel.
4. **WebGL never throws for rendering bugs.** Always check \`gl.getShaderInfoLog()\` and \`gl.getProgramInfoLog()\` — a blank canvas is always a code problem, never a mystery.`,
    },

    // ── Cell 12: Next Lesson Teaser ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why This Matters — and What's Next

Every 3D model in every game you have played, every Blender render you have seen, every AR filter on your phone — they all begin exactly here: a triangle with two shaders.

The only difference between this triangle and a character in a AAA game is:
- More vertices (millions instead of 3)
- More complex shaders (lighting models, textures, normal maps)
- More draw calls per frame (hundreds instead of one)
- Transformation matrices that convert from world space to NDC (so geometry can live anywhere, not just in -1 to +1 space)

The 7-step pipeline you learned today handles all of it the same way.

---

### Lesson 1-2 — Per-Vertex Colour, Varyings & Index Buffers

In the next lesson you will extend this program:

| Concept | What you will learn |
|---------|---------------------|
| **Varyings** | Pass data from the vertex shader to the fragment shader — interpolated across the triangle surface. Each corner gets its own colour; the GPU blends between them automatically. |
| **Index buffer** | Draw a quad with 4 vertices instead of 6 — stop duplicating shared corners using \`gl.ELEMENT_ARRAY_BUFFER\` and \`gl.drawElements\`. |
| **Colour attribute** | A second attribute alongside position — teaching \`vertexAttribPointer\` with stride and offset for interleaved vertex data. |

*Up next: per-vertex colour gradients, and why your quad only needs 4 vertices even though a triangle has 3.*`,
    },

  ],
};

export default {
  id: 'three-js-1-1-first-triangle',
  slug: 'first-triangle',
  chapter: 'three-js.1',
  order: 1,
  title: 'Your First Triangle',
  subtitle: 'The "Hello, World" of GPU programming — from a Float32Array to a lit pixel.',
  tags: ['three-js', 'webgl', 'triangle', 'vertex-shader', 'fragment-shader', 'winding-order', 'glsl'],
  hook: {
    question: 'A triangle has 3 vertices. Each vertex is 3 floats. That is 9 numbers. So why does drawing one triangle on screen in raw WebGL take 60+ lines of code — and what does every single line actually do?',
    realWorldContext: 'The first OpenGL triangle tutorial has been the rite of passage for graphics programmers since the 1990s. Every game graphics engineer, every shader artist, and every VFX programmer has built this exact thing. Now it is your turn.',
  },
  intuition: {
    prose: [
      'All 3D geometry — spheres, characters, terrain — is triangles. The GPU knows only triangles.',
      'Winding order defines which face is front: counter-clockwise = front (in WebGL default).',
      'The 7 steps: array → buffer → vertex shader → fragment shader → program → attrib → draw.',
      'gl.getShaderInfoLog() is your only debugger. Always check it. Always.',
    ],
    callouts: [
      { type: 'caution', title: 'Silent failures are everywhere', body: 'WebGL does not throw exceptions. A broken shader produces a blank canvas with no error. You must call gl.getShaderInfoLog() and gl.getProgramInfoLog() explicitly to see what went wrong.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Your First Triangle', props: { lesson: LESSON_3JS_1_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Triangle = 3 vertices in CCW order. CPU sends as Float32Array → GPU buffer → draw.',
    'Vertex shader: runs once per vertex. gl_Position = vec4(x,y,z,1.0) in clip space.',
    'Fragment shader: runs once per pixel. Output: a vec4 colour (RGBA, each 0.0–1.0).',
    '7 steps: Float32Array → createBuffer → bufferData → shaders → program → attribPtr → drawArrays',
    'Three.js: geometry.setAttribute("position", attr) + MeshBasicMaterial = this entire lesson',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      question: 'You call gl.drawArrays(gl.TRIANGLES, 0, 3). How many times does the vertex shader execute?',
      options: [
        'Once — it processes all 3 vertices in a single batched call.',
        'Three times — once per vertex, potentially in parallel on the GPU.',
        'Nine times — once per float in the Float32Array.',
        'Zero times if no pixels are covered by the triangle.',
      ],
      answer: 1,
      explanation: 'The vertex shader runs once per vertex. With 3 vertices and mode TRIANGLES it runs 3 times, all in parallel on dedicated GPU cores. Nine would be wrong — the GPU sees whole vertices as described by vertexAttribPointer, not individual floats.',
    },
    {
      question: 'What coordinate system does WebGL use for vertex positions, and what is at the canvas centre?',
      options: [
        'Pixel coordinates. Centre = (width/2, height/2).',
        'UV coordinates (0 to 1). Centre = (0.5, 0.5).',
        'NDC (Normalised Device Coordinates). Centre = (0.0, 0.0), edges = ±1.',
        'World space. Centre depends on the camera position.',
      ],
      answer: 2,
      explanation: 'WebGL vertex shaders output NDC. The canvas centre is always (0, 0); edges are ±1 on both axes. Anything outside ±1 is clipped. Pixel coordinates, UV, and world space all exist in 3D pipelines but are not what gl_Position expects directly.',
    },
    {
      question: 'A triangle renders with no JavaScript exceptions but the canvas is completely black. What is your first diagnostic step?',
      options: [
        'Restart the browser — WebGL context errors reset on a fresh tab.',
        'Call gl.getShaderInfoLog(vs) and gl.getShaderInfoLog(fs) to check for GLSL compile errors.',
        'Add console.log(gl) — the context object exposes all rendering errors.',
        'Increase the canvas CSS size — small canvases clip triangles.',
      ],
      answer: 1,
      explanation: 'WebGL never throws exceptions for rendering bugs. The first tool is gl.getShaderInfoLog() for both shaders, then gl.getProgramInfoLog(). A failed shader compile or link silently produces a null program, leaving the canvas black. Restarting (A) fixes nothing — the code is the same. console.log(gl) (C) shows no rendering errors.',
    },
    {
      question: 'Which Three.js call is the direct equivalent of gl.createBuffer() + gl.bindBuffer() + gl.bufferData()?',
      options: [
        'new THREE.Mesh(geometry, material)',
        'renderer.render(scene, camera)',
        'geometry.setAttribute(\'position\', new THREE.BufferAttribute(positions, 3))',
        'scene.add(mesh)',
      ],
      answer: 2,
      explanation: 'geometry.setAttribute(\'position\', new THREE.BufferAttribute(positions, 3)) stores the Float32Array and declares the item size (3 floats = XYZ per vertex). Three.js uploads it to the GPU lazily on the first render call — executing exactly what createBuffer + bindBuffer + bufferData does. The \'3\' maps to the \'size\' argument in vertexAttribPointer.',
    },
  ],
};

export { LESSON_3JS_1_1 };
