// Three.js · Chapter 1 · Lesson 1
// Your First Triangle — Masterclass

const LESSON_3JS_1_1 = {
  title: 'Your First Triangle',
  subtitle: 'The "Hello, World" of GPU programming — 7 steps from Float32Array to a lit pixel.',
  sequential: true,

  cells: [

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

1. Create a \`Float32Array\` of 9 values (3 vertices × XYZ)
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
  quiz: [],
};

export { LESSON_3JS_1_1 };
