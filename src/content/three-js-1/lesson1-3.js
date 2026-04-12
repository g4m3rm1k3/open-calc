// Three.js · Chapter 1 · Lesson 3
// Shader Basics — GLSL, Varyings, Per-Vertex Colour

const LESSON_3JS_1_3 = {
  title: 'Shader Basics — GLSL, Varyings, Per-Vertex Colour',
  subtitle: 'How vertex data flows through the GPU pipeline and becomes the colours you see.',
  sequential: true,

  cells: [

    // ── Cell 0a: Prerequisites & Local Setup ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Prerequisites & Local Setup

**Requires:** Lesson 1-1 (Your First Triangle) and Lesson 1-2 (VBO, EBO, VAO). You should be able to upload vertex data with a VBO and draw with \`gl.drawArrays\`.

**What's new here:** We stop treating shaders as magic incantations and start reading them. By the end you will write GLSL from scratch, pass colour data from the CPU to individual vertices, and watch the GPU blend those colours across every pixel of the triangle automatically.

**Run locally:** Save this as \`rainbow-triangle.html\` — it is the complete program you will build in this lesson:

\`\`\`html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Rainbow Triangle</title></head>
<body style="margin:0;background:#0a0f1e">
  <canvas id="cv" width="600" height="400"></canvas>
  <script>
    var canvas = document.getElementById('cv');
    var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.05, 0.07, 0.12, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var data = new Float32Array([
       0.0,  0.6,  1.0, 0.2, 0.2,
      -0.6, -0.5,  0.2, 1.0, 0.3,
       0.6, -0.5,  0.3, 0.4, 1.0,
    ]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 aPosition; attribute vec3 aColor; varying vec3 vColor; void main() { vColor = aColor; gl_Position = vec4(aPosition, 0.0, 1.0); }');
    gl.compileShader(vs);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, 'precision mediump float; varying vec3 vColor; void main() { gl_FragColor = vec4(vColor, 1.0); }');
    gl.compileShader(fs);

    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog); gl.useProgram(prog);

    var posLoc = gl.getAttribLocation(prog, 'aPosition');
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(posLoc);

    var colLoc = gl.getAttribLocation(prog, 'aColor');
    gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 20, 8);
    gl.enableVertexAttribArray(colLoc);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  </script>
</body>
</html>
\`\`\`

By the end of this lesson you will understand every single line above — including why the GPU smoothly blends the three corner colours across every pixel without any extra code.`,
    },

    // ── Cell 0b: Objectives + GLSL Primer ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What You Will Learn

By the end of this masterclass you will be able to:
- Read and write basic GLSL shaders without guessing
- Explain the GLSL type system and use vector swizzling
- Pass per-vertex data from the CPU to the GPU using **varyings**
- Understand barycentric interpolation — the math the GPU uses to blend varyings
- Use GLSL built-in functions (\`mix\`, \`clamp\`, \`sin\`, \`length\`, \`normalize\`)
- Distinguish \`gl_FragCoord\` from varyings (a common source of confusion)
- Know when to use precision qualifiers and why they matter on mobile
- Compare GLSL ES 1.00 (WebGL 1) with GLSL ES 3.00 (WebGL 2) syntax

---

### What Is GLSL?

**GLSL** (OpenGL Shading Language) is a C-like language that runs on the GPU. Each vertex and each fragment (potential pixel) gets its own execution. Crucially:

- No pointers, no heap allocation, no dynamic memory
- No recursion
- No I/O (printf, file access) — the only output is writing to built-in variables
- Every function call is inlined at compile time; loops must have a known bound

**Two programs, one pipeline:**

\`\`\`
CPU JavaScript          Vertex Shader (once per vertex)       Fragment Shader (once per pixel)
──────────────────  →   ──────────────────────────────────    ────────────────────────────────
Float32Array data       reads attributes, writes gl_Position  reads varyings, writes gl_FragColor
\`\`\`

---

### GLSL Type System

| Type | Size | Description |
|------|------|-------------|
| \`float\` | 4 bytes | Single-precision decimal. Always write \`1.0\`, never \`1\` |
| \`int\` | 4 bytes | Signed integer. Rarely used in math — prefer float |
| \`bool\` | 1 byte | \`true\` or \`false\`. Used in conditionals |
| \`vec2\` | 8 bytes | 2-component float vector (x,y or s,t or r,g) |
| \`vec3\` | 12 bytes | 3-component float vector (x,y,z or r,g,b) |
| \`vec4\` | 16 bytes | 4-component float vector (x,y,z,w or r,g,b,a) |
| \`mat4\` | 64 bytes | 4×4 float matrix — used for transformations |
| \`sampler2D\` | opaque | Handle to a 2D texture — sampled with \`texture2D()\` |

**Constructor examples:**
\`\`\`glsl
vec3 orange = vec3(1.0, 0.5, 0.0);       // explicit components
vec4 col    = vec4(orange, 1.0);          // promote vec3 to vec4 (add alpha)
vec2 center = vec2(0.5);                  // broadcast — same as vec2(0.5, 0.5)
mat4 identity = mat4(1.0);               // diagonal 1, rest 0
\`\`\`

---

### Swizzling

Swizzling lets you read or reorder vector components without a temporary variable:

| Expression | Returns | Notes |
|------------|---------|-------|
| \`v.xy\` | \`vec2\` | first two components |
| \`v.xyz\` | \`vec3\` | first three components |
| \`v.rgba\` | \`vec4\` | alias for xyzw — same memory, different names |
| \`v.zyx\` | \`vec3\` | reversed order |
| \`v.rg\` | \`vec2\` | red + green — alias for \`v.xy\` |
| \`v.xxx\` | \`vec3\` | repeat a component |
| \`v.bgr\` | \`vec3\` | blue, green, red — useful for colour space conversions |

You can mix \`xyzw\` and \`rgba\` aliases freely — they refer to the same four components.

---

### GLSL ES 1.00 vs 3.00 — Syntax Comparison

| Feature | GLSL ES 1.00 (WebGL 1) | GLSL ES 3.00 (WebGL 2) |
|---------|------------------------|------------------------|
| Version directive | *(none — implied)* | \`#version 300 es\` (must be first line) |
| Vertex input | \`attribute vec2 aPos;\` | \`in vec2 aPos;\` |
| Vertex → fragment | \`varying vec3 vColor;\` (both shaders) | VS: \`out vec3 vColor;\` FS: \`in vec3 vColor;\` |
| Fragment output | \`gl_FragColor\` (built-in) | \`out vec4 fragColor;\` (declare your own) |
| Texture sampling | \`texture2D(sampler, uv)\` | \`texture(sampler, uv)\` |
| Float precision | Optional | \`precision mediump float;\` required |`,
    },

    // ── Cell 0c: GLSL Type Explorer ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Interactive GLSL Type Explorer

Click any type card to see its constructor syntax, swizzle options, common use cases, and an example value. The \`vec\` types are the workhorses of GLSL — you will use them constantly.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="660" height="280" style="border-radius:8px;display:block;width:100%"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var TYPES = [
  { name: 'float', color: '#f87171', constructor: 'float f = 1.0;', swizzle: 'N/A (scalar)', uses: 'Time, intensity, alpha, any single decimal value', example: '0.75' },
  { name: 'int', color: '#fb923c', constructor: 'int i = 3;', swizzle: 'N/A (scalar)', uses: 'Loop counters, texture indices. Cannot mix with float directly', example: '42' },
  { name: 'bool', color: '#fbbf24', constructor: 'bool b = true;', swizzle: 'N/A (scalar)', uses: 'Conditionals, feature flags in uniforms', example: 'true' },
  { name: 'vec2', color: '#4ade80', constructor: 'vec2 v = vec2(0.5, 1.0);', swizzle: '.x .y  /  .r .g  /  .xy .yx .xx .yy', uses: 'UV coordinates, 2D positions, screen size', example: 'vec2(0.5, 0.75)' },
  { name: 'vec3', color: '#34d399', constructor: 'vec3 v = vec3(1.0, 0.5, 0.0);', swizzle: '.xyz .rgb .zyx .bgr .xxy .zzz ...', uses: 'RGB colour, 3D position, surface normals', example: 'vec3(1.0, 0.5, 0.0)' },
  { name: 'vec4', color: '#38bdf8', constructor: 'vec4 v = vec4(myVec3, 1.0);', swizzle: '.xyzw .rgba .bgra .wzyx .xy .zw ...', uses: 'RGBA colour, homogeneous clip-space position (gl_Position)', example: 'vec4(0.2, 0.8, 0.4, 1.0)' },
  { name: 'mat4', color: '#818cf8', constructor: 'mat4 m = mat4(1.0); // identity', swizzle: 'N/A — access columns: m[0], m[1]...', uses: 'Model/view/projection transform, any 4x4 linear map', example: 'mat4(1.0) = identity' },
  { name: 'sampler2D', color: '#c084fc', constructor: 'uniform sampler2D uTex;', swizzle: 'N/A — use texture2D(uTex, uv).rgba', uses: 'Reading colour/data from a texture bound to a texture unit', example: 'texture2D(uTex, vUV)' },
];

var selected = null;
var COLS = 4;
var cardW = 140, cardH = 52, gapX = 18, gapY = 10;
var startX = (W - (COLS * cardW + (COLS - 1) * gapX)) / 2;
var startY = 18;

function getCardRect(i) {
  var col = i % COLS, row = Math.floor(i / COLS);
  return { x: startX + col * (cardW + gapX), y: startY + row * (cardH + gapY), w: cardW, h: cardH };
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  TYPES.forEach(function(t, i) {
    var r = getCardRect(i);
    var isSel = selected === i;
    ctx.fillStyle = isSel ? t.color + '33' : t.color + '12';
    ctx.strokeStyle = isSel ? t.color : t.color + '55';
    ctx.lineWidth = isSel ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = isSel ? t.color : t.color + 'cc';
    ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
    ctx.fillText(t.name, r.x + r.w / 2, r.y + 22);
    ctx.font = '9px monospace'; ctx.fillStyle = '#64748b';
    ctx.fillText('click to explore', r.x + r.w / 2, r.y + 38);
  });

  var panelY = startY + 2 * (cardH + gapY) + 14;
  var panelH = H - panelY - 10;
  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(10, panelY, W - 20, panelH, 8); ctx.fill(); ctx.stroke();

  if (selected !== null) {
    var t = TYPES[selected];
    var lx = 22, ly = panelY + 16;
    ctx.fillStyle = t.color; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left';
    ctx.fillText(t.name, lx, ly);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
    ctx.fillText('Constructor:  ' + t.constructor, lx, ly + 18);
    ctx.fillText('Swizzle:      ' + t.swizzle, lx, ly + 34);
    var usesLines = t.uses.match(/.{1,80}/g) || [t.uses];
    usesLines.forEach(function(line, idx) {
      ctx.fillText((idx === 0 ? 'Use cases:    ' : '              ') + line, lx, ly + 50 + idx * 14);
    });
    ctx.fillStyle = t.color + 'aa'; ctx.font = '10px monospace';
    ctx.fillText('Example:      ' + t.example, lx, ly + 50 + usesLines.length * 14 + 2);
  } else {
    ctx.fillStyle = '#334155'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Click a type card above to explore its constructor, swizzle, and use cases', W / 2, panelY + panelH / 2);
  }
}

canvas.addEventListener('click', function(e) {
  var r = canvas.getBoundingClientRect();
  var mx = (e.clientX - r.left) * (W / r.width);
  var my = (e.clientY - r.top) * (H / r.height);
  var hit = null;
  TYPES.forEach(function(t, i) {
    var rc = getCardRect(i);
    if (mx >= rc.x && mx <= rc.x + rc.w && my >= rc.y && my <= rc.y + rc.h) hit = i;
  });
  selected = (hit === selected) ? null : hit;
  draw();
});

draw();`,
      outputHeight: 350,
    },

    // ── Cell 1: Challenge — Swizzle ───────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `**Swizzle test:** Given \`vec4 c = vec4(1.0, 0.5, 0.25, 1.0)\`, the components are \`c.x=1.0, c.y=0.5, c.z=0.25, c.w=1.0\`. What does \`c.zw\` return?`,
      options: [
        { label: 'A', text: 'vec4(0.5, 0.25)  — z and w, but as vec4' },
        { label: 'B', text: 'vec2(0.25, 1.0)  — z=0.25, w=1.0, two components → vec2' },
        { label: 'C', text: 'vec2(1.0, 0.5)  — x and y (first two components)' },
        { label: 'D', text: 'float(0.25)  — only the z component' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Swizzling two components always returns a vec2. c.z is the third component (0.25) and c.w is the fourth (1.0), so c.zw = vec2(0.25, 1.0). You can use xyzw or rgba interchangeably — vec4(1.0,0.5,0.25,1.0).ba is the same as .zw.',
      failMessage: 'Swizzle reads components by position: x=1st, y=2nd, z=3rd, w=4th. c.z = 0.25, c.w = 1.0. Selecting two components always gives a vec2, so c.zw = vec2(0.25, 1.0). The rgba aliases map the same way: r=x, g=y, b=z, a=w.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 260,
    },

    // ── Cell 2: Varyings & Interpolation (markdown) ───────────────────────────
    {
      type: 'markdown',
      instruction: `### Varyings — Passing Data from Vertex to Fragment Shader

A **varying** is a special variable that bridges the two shader stages. You write it in the vertex shader once per vertex, and the GPU automatically interpolates it for every fragment (pixel) inside the triangle.

**GLSL ES 1.00 (WebGL 1) — the \`varying\` keyword:**
\`\`\`glsl
// Vertex Shader
attribute vec2 aPosition;
attribute vec3 aColor;
varying vec3 vColor;           // declare with 'varying'

void main() {
  vColor = aColor;             // write it here — once per vertex
  gl_Position = vec4(aPosition, 0.0, 1.0);
}

// Fragment Shader
precision mediump float;
varying vec3 vColor;           // same name, same type, same keyword

void main() {
  gl_FragColor = vec4(vColor, 1.0);   // read it here — interpolated value
}
\`\`\`

**GLSL ES 3.00 (WebGL 2) — \`out\` / \`in\`:**
\`\`\`glsl
// Vertex Shader
#version 300 es
in vec2 aPosition;
in vec3 aColor;
out vec3 vColor;               // 'out' in the vertex shader

void main() {
  vColor = aColor;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}

// Fragment Shader
#version 300 es
precision mediump float;
in vec3 vColor;                // 'in' in the fragment shader
out vec4 fragColor;            // your own output variable

void main() {
  fragColor = vec4(vColor, 1.0);
}
\`\`\`

---

### What "interpolation" means

If vertex A has \`vColor = (1,0,0)\` (red) and vertex B has \`vColor = (0,0,1)\` (blue), then:

\`\`\`
A (red) ──────────────── midpoint ──────────────── B (blue)
          ← 25% of way →
          vColor = (0.75, 0, 0.25)  ← 75% red, 25% blue
                                     midpoint = (0.5, 0, 0.5) purple
\`\`\`

This is **linear interpolation along the edge** — the same \`mix(a, b, t)\` you would write in JavaScript. The GPU does it for every pixel simultaneously using barycentric coordinates across the whole triangle.

The centroid of a triangle (the point at the average of the three vertices) receives approximately:
\`\`\`glsl
vColor ≈ (v0.color + v1.color + v2.color) / 3.0
\`\`\`

**Why the prefix \`v\` on \`vColor\`?** Just a convention: \`a\` = attribute (per-vertex, from CPU), \`v\` = varying (interpolated), \`u\` = uniform (same for every vertex/fragment, from CPU). You will see this pattern everywhere.`,
    },

    // ── Cell 3: Barycentric Interpolation Visualizer ──────────────────────────
    {
      type: 'js',
      instruction: `### Barycentric Interpolation — Live Demo

This triangle has vertex A (red, top), B (green, bottom-left), C (blue, bottom-right). Every interior pixel's colour is computed as:

**color = w₀ × RED + w₁ × GREEN + w₂ × BLUE**

where (w₀, w₁, w₂) are **barycentric coordinates** — three weights that sum to 1.0.

**Click or hover anywhere inside the triangle** to see the barycentric weights and resulting colour for that point.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:8px;align-items:center">
  <canvas id="cv" width="660" height="340" style="border-radius:8px;display:block;width:100%;cursor:crosshair"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var A = { x: W / 2, y: 30, r: 1.0, g: 0.18, b: 0.18 };
var B = { x: 80,  y: 280, r: 0.18, g: 0.9, b: 0.2 };
var C = { x: W - 80, y: 280, r: 0.25, g: 0.35, b: 1.0 };

function buildGradient() {
  var imgData = ctx.createImageData(W, H);
  var d = imgData.data;
  var denom = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);

  for (var py = 0; py < H; py++) {
    for (var px = 0; px < W; px++) {
      var idx = (py * W + px) * 4;
      if (Math.abs(denom) < 0.001) { d[idx]=18;d[idx+1]=18;d[idx+2]=30;d[idx+3]=255; continue; }
      var w0 = ((B.y - C.y) * (px - C.x) + (C.x - B.x) * (py - C.y)) / denom;
      var w1 = ((C.y - A.y) * (px - C.x) + (A.x - C.x) * (py - C.y)) / denom;
      var w2 = 1.0 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) { d[idx]=18;d[idx+1]=18;d[idx+2]=30;d[idx+3]=255; continue; }
      d[idx]   = Math.min(255, Math.round((w0*A.r + w1*B.r + w2*C.r) * 255));
      d[idx+1] = Math.min(255, Math.round((w0*A.g + w1*B.g + w2*C.g) * 255));
      d[idx+2] = Math.min(255, Math.round((w0*A.b + w1*B.b + w2*C.b) * 255));
      d[idx+3] = 255;
    }
  }
  return imgData;
}

var gradientData = buildGradient();
var hoverPoint = null;

function getBary(px, py) {
  var denom = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
  if (Math.abs(denom) < 0.001) return null;
  var w0 = ((B.y - C.y) * (px - C.x) + (C.x - B.x) * (py - C.y)) / denom;
  var w1 = ((C.y - A.y) * (px - C.x) + (A.x - C.x) * (py - C.y)) / denom;
  var w2 = 1.0 - w0 - w1;
  if (w0 < 0 || w1 < 0 || w2 < 0) return null;
  return { w0: w0, w1: w1, w2: w2 };
}

function draw() {
  ctx.putImageData(gradientData, 0, 0);

  function drawLabel(v, name, col) {
    ctx.fillStyle = col; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
    ctx.fillText(name, v.x, v.y - 10);
    ctx.beginPath(); ctx.arc(v.x, v.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  drawLabel(A, 'A (red)', '#f87171');
  drawLabel(B, 'B (green)', '#4ade80');
  drawLabel(C, 'C (blue)', '#60a5fa');

  if (hoverPoint) {
    var bary = getBary(hoverPoint.x, hoverPoint.y);
    if (bary) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(hoverPoint.x - 12, hoverPoint.y); ctx.lineTo(hoverPoint.x + 12, hoverPoint.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hoverPoint.x, hoverPoint.y - 12); ctx.lineTo(hoverPoint.x, hoverPoint.y + 12); ctx.stroke();
      ctx.setLineDash([]);

      var pr = bary.w0*A.r + bary.w1*B.r + bary.w2*C.r;
      var pg = bary.w0*A.g + bary.w1*B.g + bary.w2*C.g;
      var pb = bary.w0*A.b + bary.w1*B.b + bary.w2*C.b;

      var panelX = hoverPoint.x + 16;
      if (panelX + 220 > W) panelX = hoverPoint.x - 236;
      var panelY = hoverPoint.y - 60;
      if (panelY < 4) panelY = 4;

      ctx.fillStyle = 'rgba(15,23,42,0.92)'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(panelX, panelY, 220, 120, 8); ctx.fill(); ctx.stroke();

      ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillStyle = '#f87171'; ctx.fillText('w0 (A-red):   ' + bary.w0.toFixed(3), panelX + 10, panelY + 18);
      ctx.fillStyle = '#4ade80'; ctx.fillText('w1 (B-green): ' + bary.w1.toFixed(3), panelX + 10, panelY + 34);
      ctx.fillStyle = '#60a5fa'; ctx.fillText('w2 (C-blue):  ' + bary.w2.toFixed(3), panelX + 10, panelY + 50);
      ctx.fillStyle = '#94a3b8'; ctx.fillText('sum: ' + (bary.w0 + bary.w1 + bary.w2).toFixed(3) + ' (always 1.0)', panelX + 10, panelY + 66);
      ctx.fillStyle = '#64748b'; ctx.fillText('color = w0xR + w1xG + w2xB', panelX + 10, panelY + 82);

      ctx.fillStyle = 'rgb(' + Math.round(pr*255) + ',' + Math.round(pg*255) + ',' + Math.round(pb*255) + ')';
      ctx.beginPath(); ctx.roundRect(panelX + 10, panelY + 94, 36, 18, 4); ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace';
      ctx.fillText('(' + pr.toFixed(2) + ', ' + pg.toFixed(2) + ', ' + pb.toFixed(2) + ')', panelX + 52, panelY + 107);
    }
  }
}

canvas.addEventListener('mousemove', function(e) {
  var r = canvas.getBoundingClientRect();
  hoverPoint = { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  draw();
});
canvas.addEventListener('click', function(e) {
  var r = canvas.getBoundingClientRect();
  hoverPoint = { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  draw();
});
canvas.addEventListener('mouseleave', function() { hoverPoint = null; draw(); });
draw();`,
      outputHeight: 420,
    },

    // ── Cell 4: WebGL Rainbow Triangle ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### WebGL Rainbow Triangle — Interleaved VBO + Varyings

This is the actual WebGL implementation using per-vertex colour. The VBO has an **interleaved layout**: each vertex is 5 floats \`[x, y, r, g, b]\`. Stride = 20 bytes. The colour attribute starts at byte offset 8 (after 2 floats × 4 bytes).

Change the vertex colours using the pickers below — the GPU interpolates everything automatically.`,
      html: `<div style="background:#0a0f1e;padding:12px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="560" height="320" style="border-radius:8px;display:block;width:100%;max-width:560px"></canvas>
  <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center">
    <label style="color:#f87171;font-family:monospace;font-size:11px;display:flex;align-items:center;gap:6px">Vertex A (top) <input type="color" id="colA" value="#ff3333" style="border:none;background:none;cursor:pointer;width:32px;height:24px"></label>
    <label style="color:#4ade80;font-family:monospace;font-size:11px;display:flex;align-items:center;gap:6px">Vertex B (bottom-left) <input type="color" id="colB" value="#33ff55" style="border:none;background:none;cursor:pointer;width:32px;height:24px"></label>
    <label style="color:#60a5fa;font-family:monospace;font-size:11px;display:flex;align-items:center;gap:6px">Vertex C (bottom-right) <input type="color" id="colC" value="#4466ff" style="border:none;background:none;cursor:pointer;width:32px;height:24px"></label>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);

var vsSource = 'attribute vec2 aPosition; attribute vec3 aColor; varying vec3 vColor; void main() { vColor = aColor; gl_Position = vec4(aPosition, 0.0, 1.0); }';
var fsSource = 'precision mediump float; varying vec3 vColor; void main() { gl_FragColor = vec4(vColor, 1.0); }';

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);

var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var posLoc = gl.getAttribLocation(prog, 'aPosition');
var colLoc = gl.getAttribLocation(prog, 'aColor');

var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);

// stride = 5 floats * 4 bytes = 20, colorOffset = 2 floats * 4 bytes = 8
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 20, 0);
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 20, 8);
gl.enableVertexAttribArray(colLoc);

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16)/255, parseInt(hex.slice(3,5),16)/255, parseInt(hex.slice(5,7),16)/255];
}

function render() {
  var cA = hexToRgb(document.getElementById('colA').value);
  var cB = hexToRgb(document.getElementById('colB').value);
  var cC = hexToRgb(document.getElementById('colC').value);
  // Interleaved: [x, y, r, g, b] per vertex — stride=20, colorOffset=8
  var data = new Float32Array([
     0.0,  0.7,  cA[0], cA[1], cA[2],
    -0.7, -0.6,  cB[0], cB[1], cB[2],
     0.7, -0.6,  cC[0], cC[1], cC[2],
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

document.getElementById('colA').addEventListener('input', render);
document.getElementById('colB').addEventListener('input', render);
document.getElementById('colC').addEventListener('input', render);
render();`,
      outputHeight: 440,
    },

    // ── Cell 5: Challenge — Varyings interpolation ────────────────────────────
    {
      type: 'challenge',
      instruction: `A \`varying vec3 vColor\` is \`(1.0, 0.0, 0.0)\` at vertex A and \`(0.0, 0.0, 1.0)\` at vertex B. What colour does the GPU assign to the **exact midpoint** between A and B?`,
      options: [
        { label: 'A', text: '(0.0, 0.0, 0.0) — black. Varyings default to zero at midpoints.' },
        { label: 'B', text: '(0.5, 0.0, 0.5) — a muted purple. Linear interpolation at t=0.5.' },
        { label: 'C', text: '(1.0, 0.0, 1.0) — bright magenta. Adding both colours together.' },
        { label: 'D', text: 'Undefined — varyings do not interpolate, they snap to the nearest vertex value.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The GPU linearly interpolates varyings using barycentric coordinates. At the exact midpoint between A and B, t=0.5, so the result is mix((1,0,0), (0,0,1), 0.5) = (0.5, 0, 0.5) — a muted purple. This is one of the most useful things the GPU does for free.',
      failMessage: 'Varyings are linearly interpolated between vertex values. At the midpoint between A and B, t=0.5, so the GPU computes mix(vA, vB, 0.5) = mix((1,0,0), (0,0,1), 0.5) = (0.5, 0, 0.5). This is a muted purple — not black, not additive magenta.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 260,
    },

    // ── Cell 6: GLSL Built-in Functions Explorer ──────────────────────────────
    {
      type: 'js',
      instruction: `### GLSL Built-in Functions — Interactive Explorer

Select a function from the list to see its **GLSL signature**, a **graph of its output curve**, and a **live visual demo**. These are the functions you will reach for every time you write a shader.`,
      html: `<div style="background:#0a0f1e;padding:12px;display:flex;flex-direction:column;gap:8px;align-items:center">
  <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center" id="fnBtns"></div>
  <div style="display:flex;gap:10px;width:100%;max-width:660px">
    <canvas id="graph" width="280" height="200" style="border-radius:8px;flex:0 0 280px"></canvas>
    <canvas id="demo" width="340" height="200" style="border-radius:8px;flex:1"></canvas>
  </div>
  <div id="info" style="font-family:monospace;font-size:11px;color:#94a3b8;text-align:center;min-height:30px"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var graphCanvas = document.getElementById('graph');
var demoCanvas  = document.getElementById('demo');
var gctx = graphCanvas.getContext('2d');
var dctx = demoCanvas.getContext('2d');
var GW = graphCanvas.width, GH = graphCanvas.height;
var DW = demoCanvas.width, DH = demoCanvas.height;

var FUNS = [
  { name: 'sin', sig: 'float sin(float x)', desc: 'Sine of x (radians). Output in [-1, 1].', fn: function(t){return Math.sin(t*Math.PI*2);}, demo: function(t){var v=Math.sin(t*8)*0.5+0.5;return[v*0.4,v*0.8,v];} },
  { name: 'cos', sig: 'float cos(float x)', desc: 'Cosine of x (radians). Output in [-1, 1].', fn: function(t){return Math.cos(t*Math.PI*2);}, demo: function(t){var v=Math.cos(t*8)*0.5+0.5;return[v,v*0.5,0.2];} },
  { name: 'mix', sig: 'genType mix(genType a, genType b, float t)', desc: 'Linear interpolation: a*(1-t) + b*t. GLSL lerp.', fn: function(t){return t;}, demo: function(t){return[t,0.2,1.0-t];} },
  { name: 'clamp', sig: 'genType clamp(genType x, float mn, float mx)', desc: 'Clamps x to [mn, mx]. Like Math.min(max, Math.max(min, x)).', fn: function(t){var x=t*3-1;return Math.max(0,Math.min(1,x));}, demo: function(t){var v=Math.max(0,Math.min(1,t*3-0.8));return[v*0.9,v*0.6,0.2];} },
  { name: 'smoothstep', sig: 'float smoothstep(float edge0, float edge1, float x)', desc: 'Smooth Hermite interpolation between 0 and 1. Great for soft edges.', fn: function(t){var x=Math.max(0,Math.min(1,(t-0.2)/0.6));return x*x*(3-2*x);}, demo: function(t){var x=Math.max(0,Math.min(1,(t-0.3)/0.4));var v=x*x*(3-2*x);return[v*0.8,v*0.4,v];} },
  { name: 'abs', sig: 'genType abs(genType x)', desc: 'Absolute value. Common in patterns: abs(sin(x)).', fn: function(t){return Math.abs(Math.sin(t*Math.PI*2));}, demo: function(t){var v=Math.abs(Math.sin(t*10));return[v,v*0.6,0.1];} },
  { name: 'fract', sig: 'genType fract(genType x)', desc: 'Fractional part: x - floor(x). Creates repeating 0 to 1 sawtooth.', fn: function(t){var x=t*3;return x-Math.floor(x);}, demo: function(t){var v=(t*8)-Math.floor(t*8);return[v*0.9,0.3,v*0.6];} },
  { name: 'pow', sig: 'genType pow(genType x, genType y)', desc: 'x raised to power y. pow(x, 2.2) = gamma correction.', fn: function(t){return Math.pow(t,2.5);}, demo: function(t){var v=Math.pow(t,2.5);return[v,v*0.7,v*0.3];} },
  { name: 'length', sig: 'float length(genType x)', desc: 'Euclidean length of vector. length(vec2(x,y)) = sqrt(x*x+y*y).', fn: function(t){return Math.min(1,t);}, demo: null },
  { name: 'normalize', sig: 'genType normalize(genType x)', desc: 'Scale vector to unit length 1.0. Essential for direction vectors.', fn: function(t){var x=t-0.5;var len=Math.sqrt(x*x+0.01);return(x/len)*0.5+0.5;}, demo: null },
];

var selectedFn = 0;

function drawGraph(fnDef) {
  gctx.fillStyle = '#0d1117'; gctx.fillRect(0, 0, GW, GH);
  var pad = 28, pw = GW-2*pad, ph = GH-2*pad;
  gctx.strokeStyle = '#1e293b'; gctx.lineWidth = 1;
  gctx.beginPath(); gctx.moveTo(pad,pad); gctx.lineTo(pad,GH-pad); gctx.moveTo(pad,GH-pad); gctx.lineTo(GW-pad,GH-pad); gctx.stroke();
  gctx.strokeStyle = '#334155'; gctx.setLineDash([3,3]);
  gctx.beginPath(); gctx.moveTo(pad,GH-pad-ph/2); gctx.lineTo(GW-pad,GH-pad-ph/2); gctx.stroke();
  gctx.setLineDash([]);
  gctx.fillStyle = '#475569'; gctx.font = '9px monospace'; gctx.textAlign = 'center';
  gctx.fillText('0', pad, GH-pad+10); gctx.fillText('1', GW-pad, GH-pad+10);
  gctx.textAlign = 'right'; gctx.fillText('1', pad-4, GH-pad-ph); gctx.fillText('-1', pad-4, GH-pad);
  gctx.strokeStyle = '#38bdf8'; gctx.lineWidth = 2;
  gctx.beginPath();
  for (var i=0;i<=pw;i++) {
    var t=i/pw, val=fnDef.fn(t);
    var cx=pad+i, cy=(GH-pad)-((val+1)*0.5)*ph;
    cy=Math.max(pad,Math.min(GH-pad,cy));
    if(i===0) gctx.moveTo(cx,cy); else gctx.lineTo(cx,cy);
  }
  gctx.stroke();
  gctx.fillStyle = '#38bdf8'; gctx.font = 'bold 11px monospace'; gctx.textAlign = 'left';
  gctx.fillText(fnDef.name+'(t)', pad+4, pad+12);
}

function drawDemo(fnDef) {
  var imgData = dctx.createImageData(DW, DH);
  var d = imgData.data;
  if (fnDef.name === 'length') {
    for (var py=0;py<DH;py++) for (var px=0;px<DW;px++) {
      var ux=px/DW-0.5,uy=py/DH-0.5,dist=Math.sqrt(ux*ux+uy*uy)*2,v=Math.max(0,1-dist),idx=(py*DW+px)*4;
      d[idx]=Math.round(v*80);d[idx+1]=Math.round(v*180);d[idx+2]=Math.round(v*255);d[idx+3]=255;
    }
  } else if (fnDef.name === 'normalize') {
    for (var py=0;py<DH;py++) for (var px=0;px<DW;px++) {
      var ux2=px/DW-0.5,uy2=py/DH-0.5,len=Math.sqrt(ux2*ux2+uy2*uy2),nx=len>0.001?ux2/len:0,ny=len>0.001?uy2/len:0,idx2=(py*DW+px)*4;
      d[idx2]=Math.round((nx*0.5+0.5)*255);d[idx2+1]=Math.round((ny*0.5+0.5)*255);d[idx2+2]=180;d[idx2+3]=255;
    }
  } else {
    for (var py=0;py<DH;py++) for (var px=0;px<DW;px++) {
      var col=fnDef.demo(px/DW),idx3=(py*DW+px)*4;
      d[idx3]=Math.round(Math.max(0,Math.min(1,col[0]))*255);
      d[idx3+1]=Math.round(Math.max(0,Math.min(1,col[1]))*255);
      d[idx3+2]=Math.round(Math.max(0,Math.min(1,col[2]))*255);
      d[idx3+3]=255;
    }
  }
  dctx.putImageData(imgData, 0, 0);
  dctx.fillStyle='rgba(15,23,42,0.55)'; dctx.fillRect(0,DH-28,DW,28);
  dctx.fillStyle='#94a3b8'; dctx.font='9px monospace'; dctx.textAlign='center';
  dctx.fillText('live demo: '+fnDef.name, DW/2, DH-10);
}

function selectFn(i) {
  selectedFn = i;
  var fn = FUNS[i];
  drawGraph(fn); drawDemo(fn);
  document.getElementById('info').textContent = fn.sig + ' — ' + fn.desc;
  document.querySelectorAll('.fn-btn').forEach(function(b,bi) {
    b.style.borderColor = bi===i?'#38bdf8':'#475569';
    b.style.background  = bi===i?'rgba(56,189,248,0.14)':'transparent';
    b.style.color       = bi===i?'#38bdf8':'#94a3b8';
  });
}

var container = document.getElementById('fnBtns');
FUNS.forEach(function(fn, i) {
  var btn = document.createElement('button');
  btn.textContent = fn.name; btn.className = 'fn-btn';
  btn.style.cssText = 'padding:5px 10px;border-radius:6px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer';
  btn.addEventListener('click', function(){ selectFn(i); });
  container.appendChild(btn);
});
selectFn(0);`,
      outputHeight: 380,
    },

    // ── Cell 7: Challenge — varying vs gl_FragCoord ───────────────────────────
    {
      type: 'challenge',
      instruction: `A vertex shader passes \`out vec2 vPosition = aPosition;\` to the fragment shader, where \`aPosition\` is the vertex's NDC position (range roughly -1 to +1). Is \`vPosition\` the same as \`vec2(gl_FragCoord.xy)\`?`,
      options: [
        { label: 'A', text: "Yes — they're the same screen-space position, just named differently." },
        { label: 'B', text: 'No — vPosition is in whatever space the vertex shader outputs (NDC here), while gl_FragCoord.xy is in screen pixels (e.g. 0..600, 0..400).' },
        { label: 'C', text: 'No — vPosition does not exist in GLSL ES 3.00 because you cannot output vec2 from a vertex shader.' },
        { label: 'D', text: 'Yes, but only if the viewport is 1×1 pixel.' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct. vPosition carries whatever value the vertex shader wrote — here it's NDC space, roughly -1 to +1. gl_FragCoord.xy is always in window/screen pixels: if your canvas is 600×400, gl_FragCoord.x runs from 0 to 600. To convert: vec2 screenPos = (vPosition * 0.5 + 0.5) * vec2(viewportWidth, viewportHeight).",
      failMessage: 'These are in completely different spaces. vPosition is a varying — it carries whatever the vertex shader wrote, which here is NDC coordinates in roughly [-1, 1]. gl_FragCoord.xy is always in window pixel coordinates, running from 0 to your canvas width/height. Confusing these two is one of the most common bugs in GLSL shaders.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 260,
    },

    // ── Cell 8: Live Shader Editor ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Live Shader Editor — Shader Cookbook

Edit the vertex and fragment shaders, then hit **Compile** to see the result on the canvas. Four presets show common patterns.

The full-screen quad passes UV coordinates (0 to 1) as a varying — your fragment shader reads them as \`vUV\`. Try modifying the fragment shader and hitting Compile. Shader errors are shown in red below the editors.`,
      html: `<div style="background:#0a0f1e;padding:10px;display:flex;flex-direction:column;gap:8px">
  <div style="display:flex;gap:6px;flex-wrap:wrap">
    <button id="p1" style="padding:5px 10px;border-radius:5px;border:1.5px solid #38bdf8;background:rgba(56,189,248,0.12);color:#38bdf8;font-family:monospace;font-size:10px;cursor:pointer">UV Gradient</button>
    <button id="p2" style="padding:5px 10px;border-radius:5px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:10px;cursor:pointer">Polar Rings</button>
    <button id="p3" style="padding:5px 10px;border-radius:5px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:10px;cursor:pointer">Checkerboard</button>
    <button id="p4" style="padding:5px 10px;border-radius:5px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:10px;cursor:pointer">Sine Wave</button>
    <button id="compileBtn" style="padding:5px 14px;border-radius:5px;border:1.5px solid #4ade80;background:rgba(74,222,128,0.12);color:#4ade80;font-family:monospace;font-size:10px;cursor:pointer;margin-left:auto">Compile</button>
  </div>
  <div style="display:flex;gap:8px">
    <div style="flex:1;display:flex;flex-direction:column;gap:4px">
      <div style="color:#64748b;font-family:monospace;font-size:9px">VERTEX SHADER</div>
      <textarea id="vsEdit" rows="6" style="width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #1e293b;border-radius:5px;padding:6px;font-family:monospace;font-size:10px;resize:vertical;box-sizing:border-box"></textarea>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;gap:4px">
      <div style="color:#64748b;font-family:monospace;font-size:9px">FRAGMENT SHADER</div>
      <textarea id="fsEdit" rows="6" style="width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #1e293b;border-radius:5px;padding:6px;font-family:monospace;font-size:10px;resize:vertical;box-sizing:border-box"></textarea>
    </div>
  </div>
  <div id="errBox" style="font-family:monospace;font-size:10px;color:#f87171;min-height:16px;padding:2px 0"></div>
  <canvas id="cv" width="640" height="200" style="border-radius:6px;display:block;width:100%"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
var vsEdit = document.getElementById('vsEdit');
var fsEdit = document.getElementById('fsEdit');
var errBox = document.getElementById('errBox');

var PRESETS = {
  uv:      { vs: 'attribute vec2 aPosition; varying vec2 vUV; void main() { vUV = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }', fs: 'precision mediump float; varying vec2 vUV; void main() { gl_FragColor = vec4(vUV.x, vUV.y, 0.5, 1.0); }' },
  polar:   { vs: 'attribute vec2 aPosition; varying vec2 vUV; void main() { vUV = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }', fs: 'precision mediump float; varying vec2 vUV; void main() { vec2 c = vUV - 0.5; float dist = length(c) * 2.0; float rings = sin(dist * 20.0) * 0.5 + 0.5; gl_FragColor = vec4(rings * 0.4, rings * 0.8, rings, 1.0); }' },
  checker: { vs: 'attribute vec2 aPosition; varying vec2 vUV; void main() { vUV = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }', fs: 'precision mediump float; varying vec2 vUV; void main() { float check = mod(floor(vUV.x * 8.0) + floor(vUV.y * 8.0), 2.0); gl_FragColor = vec4(vec3(check * 0.85 + 0.05), 1.0); }' },
  sine:    { vs: 'attribute vec2 aPosition; varying vec2 vUV; void main() { vUV = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }', fs: 'precision mediump float; varying vec2 vUV; void main() { float wave = sin(vUV.x * 20.0) * 0.5 + 0.5; float mask = step(abs(vUV.y - wave), 0.04); gl_FragColor = vec4(0.1, mask * 0.9 + 0.05, mask * 0.5 + 0.1, 1.0); }' },
};

var currentProg = null;
var quadBuf = null;

function setupQuad() {
  var verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
  quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
}
setupQuad();
gl.viewport(0, 0, canvas.width, canvas.height);

function compile() {
  errBox.textContent = '';
  var vsSource = vsEdit.value.trim();
  var fsSource = fsEdit.value.trim();
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsSource); gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) { errBox.textContent = 'VS ERROR: ' + gl.getShaderInfoLog(vs); gl.deleteShader(vs); return; }
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSource); gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { errBox.textContent = 'FS ERROR: ' + gl.getShaderInfoLog(fs); gl.deleteShader(vs); gl.deleteShader(fs); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { errBox.textContent = 'LINK ERROR: ' + gl.getProgramInfoLog(prog); return; }
  if (currentProg) gl.deleteProgram(currentProg);
  currentProg = prog;
  render();
}

function render() {
  if (!currentProg) return;
  gl.clearColor(0.05, 0.07, 0.12, 1.0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(currentProg);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  var loc = gl.getAttribLocation(currentProg, 'aPosition');
  if (loc >= 0) { gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(loc); }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function loadPreset(key) {
  vsEdit.value = PRESETS[key].vs;
  fsEdit.value = PRESETS[key].fs;
  compile();
  var map = {uv:'p1',polar:'p2',checker:'p3',sine:'p4'};
  ['p1','p2','p3','p4'].forEach(function(id) {
    var btn = document.getElementById(id);
    btn.style.borderColor='#475569'; btn.style.background='transparent'; btn.style.color='#94a3b8';
  });
  var ab = document.getElementById(map[key]);
  ab.style.borderColor='#38bdf8'; ab.style.background='rgba(56,189,248,0.12)'; ab.style.color='#38bdf8';
}

document.getElementById('p1').onclick = function(){ loadPreset('uv'); };
document.getElementById('p2').onclick = function(){ loadPreset('polar'); };
document.getElementById('p3').onclick = function(){ loadPreset('checker'); };
document.getElementById('p4').onclick = function(){ loadPreset('sine'); };
document.getElementById('compileBtn').onclick = compile;
loadPreset('uv');`,
      outputHeight: 520,
    },

    // ── Cell 9: Precision Qualifiers + ShaderMaterial (markdown) ─────────────
    {
      type: 'markdown',
      instruction: `### Precision Qualifiers

Every fragment shader in GLSL ES must declare a **default float precision** — or the driver may refuse to compile it. The three tiers:

| Qualifier | Range | Mobile GPU impact | Typical use |
|-----------|-------|-------------------|-------------|
| \`highp\` | ±2¹²⁷, ~7 decimal digits | Slowest — may not be supported | Vertex positions, depth values |
| \`mediump\` | ±2¹⁶, ~3.3 decimal digits | Fast on all GPUs | Colours, UV coords, most fragment math |
| \`lowp\` | ±2, ~2 decimal digits | Fastest, but very coarse | Simple colour blending only |

Always use \`mediump\` as your default in the fragment shader:

\`\`\`glsl
precision mediump float;  // put this at the top of every fragment shader
\`\`\`

In GLSL ES 3.00 (WebGL 2), the precision declaration is still required in the fragment shader. Vertex shaders default to \`highp\`:

\`\`\`glsl
#version 300 es
precision mediump float;  // still needed in the fragment shader
in vec2 vUV;
out vec4 fragColor;
\`\`\`

---

### Three.js: ShaderMaterial vs RawShaderMaterial

| | \`ShaderMaterial\` | \`RawShaderMaterial\` |
|--|-------------------|----------------------|
| Precision header | Auto-prepended | You write it |
| Three.js uniforms | Auto-provided | You declare them |
| Available auto-uniforms | \`projectionMatrix\`, \`modelViewMatrix\`, \`modelMatrix\`, \`viewMatrix\`, \`normalMatrix\` | None — you add what you need |
| Vertex attributes | \`position\`, \`normal\`, \`uv\` auto-bound | You bind them yourself |
| Typical use | Most custom materials | Full GPU control, minimal overhead |

**ShaderMaterial example (Three.js auto-provides the uniform declarations):**
\`\`\`glsl
// Vertex shader — Three.js injects projectionMatrix, modelViewMatrix, position
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
\`\`\`

**GLSL ES 3.00 with WebGL 2 (preferred in modern Three.js):**
\`\`\`glsl
#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
in vec3 position;
in vec2 uv;
out vec2 vUV;

void main() {
  vUV = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
\`\`\``,
    },

    // ── Cell 10: Coding Challenge — Circle SDF ────────────────────────────────
    {
      type: 'coding',
      instruction: `### Challenge: Circle SDF with \`length()\`

A **Signed Distance Field (SDF)** is a function that returns the distance from a shape's boundary — the simplest is a circle:

\`\`\`glsl
float dist = length(vPosition);   // distance from origin
\`\`\`

Your task: complete the fragment shader so it draws a **white circle** on a dark background.

**What you need to do:**
1. Compute \`float dist = length(vPosition);\`
2. Output white (\`vec3(1.0)\`) if \`dist < 0.5\`, dark (\`vec3(0.04, 0.06, 0.12)\`) otherwise
3. **Bonus:** Use \`smoothstep(0.48, 0.52, dist)\` to soften the edge — replace the hard step with a smooth blend

The vertex shader, quad geometry, and program setup are already written. Only change the \`fsSource\` string.`,
      html: `<canvas id="cv" width="560" height="320" style="display:block;border-radius:8px;width:100%;max-width:560px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;padding:10px}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

var vsSource = 'attribute vec2 aPosition; varying vec2 vPosition; void main() { vPosition = aPosition; gl_Position = vec4(aPosition, 0.0, 1.0); }';

// TODO: Write the fragment shader.
// 1. precision mediump float;
// 2. varying vec2 vPosition;
// 3. void main() {
// 4.   float dist = length(vPosition);
// 5.   // white if dist < 0.5, dark otherwise
// 6.   // Bonus: use smoothstep(0.48, 0.52, dist) for soft edge
// 7. }
var fsSource = 'precision mediump float; varying vec2 vPosition; void main() { float dist = length(vPosition); gl_FragColor = vec4(vec3(dist < 0.5 ? 1.0 : 0.04), 1.0); }';

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);

var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog);

if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
  console.error('Shader link error:', gl.getProgramInfoLog(prog));
}

gl.useProgram(prog);

var verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);`,
      solutionCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

var vsSource = 'attribute vec2 aPosition; varying vec2 vPosition; void main() { vPosition = aPosition; gl_Position = vec4(aPosition, 0.0, 1.0); }';
var fsSource = 'precision mediump float; varying vec2 vPosition; void main() { float dist = length(vPosition); float edge = smoothstep(0.48, 0.52, dist); vec3 circleCol = vec3(1.0); vec3 bgCol = vec3(0.04, 0.06, 0.12); gl_FragColor = vec4(mix(circleCol, bgCol, edge), 1.0); }';

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);

var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);`,
      check: (code) => {
        var hasLength = /length\s*\(/.test(code);
        var hasThreshold = /0\.[3-9]/.test(code) || /smoothstep/.test(code) || /<\s*0/.test(code) || /step\s*\(/.test(code);
        return hasLength && hasThreshold;
      },
      successMessage: 'Correct! You used length() to compute the distance from the centre and a threshold comparison to draw the circle. Adding smoothstep() gives you a beautifully anti-aliased soft edge — this is the foundation of all SDF-based rendering in GLSL.',
      failMessage: 'Make sure your fragment shader uses length(vPosition) to compute distance from the origin, then compares it to a threshold (e.g. 0.5). Try: float dist = length(vPosition); gl_FragColor = vec4(vec3(dist < 0.5 ? 1.0 : 0.04), 1.0); For the bonus, replace the ternary with smoothstep.',
      outputHeight: 400,
    },

    // ── Cell 11: Extension — Animated Shader with uTime + varyings ────────────
    {
      type: 'coding',
      instruction: `### Extension: Animated Pulsing Circle with \`uTime\` + Colour Varying

Build on the circle SDF from Cell 10. Your tasks:
1. Declare \`uniform float uTime;\` in the fragment shader
2. Make the radius **pulse** with time: \`float radius = 0.3 + sin(uTime) * 0.15;\`
3. Add a colour varying \`vColor\` in the vertex shader set to \`vec3(aPosition * 0.5 + 0.5, 0.5)\` — a position-based rainbow
4. Use \`vColor\` as the circle's interior colour
5. Drive the animation with \`requestAnimationFrame\` and \`gl.uniform1f(uTimeLoc, elapsed)\`

The quad geometry and animation loop skeleton are already started — complete the shader sources and the uniform update line.`,
      html: `<canvas id="cv" width="560" height="320" style="display:block;border-radius:8px;width:100%;max-width:560px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;padding:10px}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);

// TODO: Add vColor varying — set it to vec3(aPosition * 0.5 + 0.5, 0.5) in the VS
var vsSource = 'attribute vec2 aPosition; varying vec2 vPosition; varying vec3 vColor; void main() { vPosition = aPosition; vColor = vec3(aPosition * 0.5 + 0.5, 0.5); gl_Position = vec4(aPosition, 0.0, 1.0); }';

// TODO: Use uTime to pulse the radius: float radius = 0.3 + sin(uTime) * 0.15;
// TODO: Use vColor for the circle fill colour
var fsSource = 'precision mediump float; uniform float uTime; varying vec2 vPosition; varying vec3 vColor; void main() { float dist = length(vPosition); float radius = 0.3 + sin(uTime) * 0.15; float edge = smoothstep(radius - 0.02, radius + 0.02, dist); gl_FragColor = vec4(mix(vColor, vec3(0.04, 0.06, 0.12), edge), 1.0); }';

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);

var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

var uTimeLoc = gl.getUniformLocation(prog, 'uTime');
var startTime = performance.now();

function animate() {
  var elapsed = (performance.now() - startTime) / 1000.0;
  // TODO: call gl.uniform1f(uTimeLoc, elapsed) to update the shader time
  gl.uniform1f(uTimeLoc, elapsed);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(animate);
}
animate();`,
      solutionCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);

var vsSource = 'attribute vec2 aPosition; varying vec2 vPosition; varying vec3 vColor; void main() { vPosition = aPosition; vColor = vec3(aPosition.x * 0.5 + 0.5, aPosition.y * 0.5 + 0.5, 0.5); gl_Position = vec4(aPosition, 0.0, 1.0); }';
var fsSource = 'precision mediump float; uniform float uTime; varying vec2 vPosition; varying vec3 vColor; void main() { float dist = length(vPosition); float radius = 0.3 + sin(uTime) * 0.15; float glow = smoothstep(radius + 0.18, radius, dist) * 0.3; float edge = smoothstep(radius - 0.02, radius + 0.02, dist); vec3 col = mix(vColor, vec3(0.04, 0.06, 0.12), edge); col += vec3(0.2, 0.5, 0.8) * glow; gl_FragColor = vec4(col, 1.0); }';

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource); gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource); gl.compileShader(fs);

var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

var uTimeLoc = gl.getUniformLocation(prog, 'uTime');
var startTime = performance.now();

function animate() {
  var elapsed = (performance.now() - startTime) / 1000.0;
  gl.uniform1f(uTimeLoc, elapsed);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(animate);
}
animate();`,
      check: (code) => {
        var hasUTime     = /uTime/.test(code);
        var hasRAF       = /requestAnimationFrame/.test(code);
        var hasUniform1f = /uniform1f/.test(code);
        return hasUTime && hasRAF && hasUniform1f;
      },
      successMessage: 'Excellent! You have built a fully animated shader: uTime drives the radius pulse via sin(), vColor creates a position-based rainbow inside the circle, and requestAnimationFrame keeps everything in sync. This is the core pattern for every animated GLSL effect.',
      failMessage: 'Make sure your code: (1) declares uniform float uTime in the fragment shader, (2) calls gl.uniform1f(uTimeLoc, elapsed) inside the animation loop, and (3) uses requestAnimationFrame to drive the loop. The radius should change over time: float radius = 0.3 + sin(uTime) * 0.15;',
      outputHeight: 400,
    },

    // ── Cell 12: Recap (markdown) ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Lesson 1-3 Recap — Reference Tables

#### GLSL Type Reference

| Type | Bytes | Constructor | Use Case |
|------|-------|-------------|----------|
| \`float\` | 4 | \`float f = 1.0;\` | Any single decimal value |
| \`int\` | 4 | \`int i = 3;\` | Loop counters, texture units |
| \`bool\` | 1 | \`bool b = true;\` | Conditionals |
| \`vec2\` | 8 | \`vec2(0.5, 1.0)\` | UV coords, 2D position |
| \`vec3\` | 12 | \`vec3(r, g, b)\` | RGB colour, normals, 3D position |
| \`vec4\` | 16 | \`vec4(v3, 1.0)\` | RGBA, clip-space position |
| \`mat4\` | 64 | \`mat4(1.0)\` | Transform matrices |
| \`sampler2D\` | opaque | \`uniform sampler2D u;\` | Texture handle |

---

#### Key GLSL Built-in Functions

| Function | Signature | What it does |
|----------|-----------|--------------|
| \`sin\` / \`cos\` | \`float sin(float x)\` | Trigonometric — radians in, [-1,1] out |
| \`mix\` | \`genType mix(a, b, t)\` | Linear interpolation: \`a*(1-t) + b*t\` |
| \`clamp\` | \`genType clamp(x, mn, mx)\` | Restrict x to [mn, mx] |
| \`smoothstep\` | \`float smoothstep(e0, e1, x)\` | Smooth Hermite curve between 0 and 1 |
| \`length\` | \`float length(genType v)\` | Euclidean length of vector |
| \`normalize\` | \`genType normalize(v)\` | Scale vector to length 1.0 |
| \`dot\` | \`float dot(a, b)\` | Dot product — used for lighting calculations |
| \`abs\` | \`genType abs(x)\` | Absolute value |
| \`fract\` | \`genType fract(x)\` | Fractional part — repeating 0 to 1 sawtooth |
| \`pow\` | \`genType pow(x, y)\` | x to the power y |

---

#### Varying Data Flow

\`\`\`
CPU (JavaScript)
    |
    |  Float32Array: [x, y, r, g, b,   x, y, r, g, b,   x, y, r, g, b]
    |  stride=20, colorOffset=8
    v
Vertex Shader  -- runs 3 times (once per vertex)
    |  attribute vec2 aPosition;
    |  attribute vec3 aColor;
    |  varying vec3 vColor;         <- write here
    |  void main() { vColor = aColor; gl_Position = ...; }
    |
    |  GPU interpolates vColor across all fragments inside the triangle
    v
Fragment Shader  -- runs once per pixel
    |  varying vec3 vColor;         <- read here -- already interpolated
    |  void main() { gl_FragColor = vec4(vColor, 1.0); }
    v
Framebuffer (what you see on screen)
\`\`\`

---

#### GLSL ES 1.00 vs 3.00 — Quick Reference

| Feature | ES 1.00 (WebGL 1) | ES 3.00 (WebGL 2) |
|---------|-------------------|-------------------|
| First line | *(nothing)* | \`#version 300 es\` |
| Vertex input | \`attribute\` | \`in\` |
| Vertex to Fragment | \`varying\` (both shaders) | VS: \`out\`, FS: \`in\` |
| Fragment output | \`gl_FragColor\` | \`out vec4 fragColor;\` |
| Texture | \`texture2D(s, uv)\` | \`texture(s, uv)\` |

---

#### Three.js ShaderMaterial vs RawShaderMaterial

| | \`ShaderMaterial\` | \`RawShaderMaterial\` |
|--|-------------------|----------------------|
| Auto-precision header | Yes | No — you write it |
| MVP uniforms | Auto-provided | You declare them |
| Geometry attributes | \`position\`, \`normal\`, \`uv\` | You bind them |
| Recommended for | Most custom materials | Full low-level control |`,
    },

    // ── Cell 13: Next Lesson Teaser (markdown) ────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Coming Up — Lesson 1-4: Uniforms, Transformation Matrices, and the MVP Pipeline

You can now send per-vertex colour to the GPU and watch it interpolate automatically. The next step: how to **move, rotate, and project** geometry from 3D world space onto your 2D screen.

**What uniforms are:**

A \`uniform\` is a value that stays **constant for every vertex and every fragment in a single draw call** — the whole mesh sees the same value. Unlike attributes (one per vertex) and varyings (interpolated), uniforms are global for that draw call.

\`\`\`glsl
uniform float uTime;         // current time — same for all 50,000 vertices
uniform mat4 uModelMatrix;   // where is this object in the world?
uniform vec3 uLightDir;      // where is the light coming from?
\`\`\`

**The three matrices that transform every vertex:**

\`\`\`
Local space (your mesh)
    x  Model Matrix  (position, rotation, scale of the object)
World space
    x  View Matrix   (where is the camera, which way does it look?)
Camera space
    x  Projection Matrix  (perspective foreshortening, field of view)
Clip space  ->  divide by w  ->  NDC  ->  viewport transform  ->  screen pixels
\`\`\`

The combined transform is applied in the vertex shader:
\`\`\`glsl
gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
\`\`\`

Three.js provides \`projectionMatrix\` and \`modelViewMatrix\` (model × view pre-multiplied) automatically in \`ShaderMaterial\`.

**In Lesson 1-4 you will:**
- Upload a \`mat4\` uniform and rotate a triangle in real time
- Build a perspective projection matrix from scratch to understand the math
- Connect the matrices to Three.js's \`PerspectiveCamera\` and scene graph
- Understand why positions use \`w=1.0\` and directions use \`w=0.0\``,
    },

  ],
};

export default {
  id: 'three-js-1-3-shader-basics',
  slug: 'shader-basics',
  chapter: 'three-js.1',
  order: 3,
  title: 'Shader Basics — GLSL, Varyings, Per-Vertex Colour',
  subtitle: 'Master the GLSL type system, pass data between shader stages with varyings, and render the canonical rainbow triangle.',
  tags: ['webgl', 'glsl', 'shaders', 'varyings', 'interpolation', 'gpu', 'three.js'],
  hook: {
    question: 'How does the GPU turn three coloured corner points into a perfectly smooth colour gradient across every pixel of a triangle — without you writing any interpolation code?',
    realWorldContext: 'Every gradient, every smooth lighting transition, every texture on a 3D model uses this same mechanism: the GPU automatically interpolates varyings between vertices using barycentric coordinates. Understanding this unlocks every visual effect in real-time graphics.',
  },
  intuition: {
    prose: [
      'A GLSL shader is a tiny C-like program that runs on the GPU — once per vertex in the vertex stage, once per pixel in the fragment stage. The key insight is that these two programs communicate through varyings: variables the vertex shader writes and the GPU interpolates before the fragment shader reads them.',
      'Barycentric coordinates describe any point inside a triangle as a weighted sum of its three vertices. If you are halfway between a red vertex and a blue vertex, your barycentric weights are (0.5, 0.5, 0), and your interpolated colour is 0.5 times red plus 0.5 times blue equals purple. The GPU performs this calculation for every pixel, in parallel, at billions of operations per second.',
      'The rainbow triangle is the "hello world" of GPU graphics precisely because it demonstrates this interpolation with zero extra code — just declare a varying, write to it per vertex, and read the already-blended result in the fragment shader.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Always write 1.0, never 1',
        body: 'GLSL is strictly typed. Writing vec3(1, 0, 0) causes a compile error because 1 is an int, not a float. Always use 1.0, 0.5, 0.0.',
      },
      {
        type: 'warning',
        title: 'precision mediump float — never forget it',
        body: 'Every fragment shader needs "precision mediump float;" at the top in GLSL ES 1.00. Without it, many drivers will refuse to compile the shader with a cryptic error.',
      },
      {
        type: 'insight',
        title: 'Varyings vs gl_FragCoord',
        body: 'gl_FragCoord.xy gives you the pixel position in screen space (0 to width, 0 to height). A varying carrying vertex position gives you whatever space the vertex shader worked in (often NDC, -1 to +1). They are completely different coordinate systems.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Shader Basics Interactive Notebook',
        props: { lesson: LESSON_3JS_1_3 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Think of a varying as a sticky note the vertex shader puts on each vertex. The GPU reads all three notes for a triangle and writes a blended version on every fragment inside it — automatically, with no extra code from you.',
    'The GLSL type system is like strongly-typed arrays: a vec3 is always exactly 3 floats. Swizzling (.xyz, .rgb, .zyx) is just a readable way to reorder or extract those components without creating temporary variables.',
    'Precision qualifiers (mediump, highp) are a hint to the GPU about how many bits to use for a value. On desktop GPUs this is usually ignored; on mobile, using highp everywhere in the fragment shader can cut your frame rate significantly.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      question: 'In GLSL, vec4 c = vec4(0.2, 0.8, 0.4, 1.0). What does c.bgr return?',
      options: [
        'vec3(0.2, 0.8, 0.4) — same order as construction',
        'vec3(0.4, 0.8, 0.2) — blue, green, red components reordered',
        'vec4(0.4, 0.8, 0.2, 1.0) — swizzle always returns vec4',
        'vec3(1.0, 0.4, 0.8) — alpha is included as first component',
      ],
      answer: 1,
      explanation: 'Swizzle reorders components. c.r=0.2, c.g=0.8, c.b=0.4. c.bgr reads them as blue, green, red = (0.4, 0.8, 0.2). Selecting 3 components always returns a vec3.',
    },
    {
      question: 'A varying vec3 vColor is (1.0, 0.0, 0.0) at vertex A and (0.0, 1.0, 0.0) at vertex B. What is it at the exact midpoint?',
      options: [
        '(0.0, 0.0, 0.0) — varyings default to zero at midpoints',
        '(0.5, 0.5, 0.0) — linear interpolation at t=0.5',
        '(1.0, 1.0, 0.0) — both colours are added together',
        '(1.0, 0.0, 0.0) — the first vertex value dominates',
      ],
      answer: 1,
      explanation: 'The GPU linearly interpolates varyings. At the midpoint t=0.5, the result is mix((1,0,0), (0,1,0), 0.5) = (0.5, 0.5, 0.0) — yellow-green.',
    },
    {
      question: 'What is gl_FragCoord in a WebGL fragment shader?',
      options: [
        'The position in NDC space (-1 to +1) of the current fragment',
        'The screen-space pixel position (0..width, 0..height) of the current fragment',
        'The UV coordinate of the current fragment (0 to 1)',
        'The clip-space position before the perspective divide',
      ],
      answer: 1,
      explanation: 'gl_FragCoord.xy gives the window-space position in pixels. On a 600x400 canvas, gl_FragCoord.x ranges 0 to 600. To convert to UV: vec2 uv = gl_FragCoord.xy / vec2(600.0, 400.0);',
    },
    {
      question: 'In Three.js ShaderMaterial, which uniforms are automatically provided to your vertex shader?',
      options: [
        'Only gl_Position — everything else must be declared manually',
        'projectionMatrix, modelViewMatrix, modelMatrix, viewMatrix, normalMatrix — plus geometry attributes position, normal, uv',
        'Only uTime and uResolution — the standard Three.js uniforms',
        'No uniforms — ShaderMaterial and RawShaderMaterial are identical',
      ],
      answer: 1,
      explanation: 'ShaderMaterial automatically prepends transformation uniforms (projectionMatrix, modelViewMatrix, modelMatrix, viewMatrix, normalMatrix) and geometry attributes (position, normal, uv). RawShaderMaterial provides none of these.',
    },
  ],
};

export { LESSON_3JS_1_3 };
