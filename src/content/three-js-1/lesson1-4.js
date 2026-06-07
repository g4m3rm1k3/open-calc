// Three.js · Chapter 1 · Lesson 4
// Attributes & Uniforms — CPU to GPU Data Flow

const LESSON_3JS_1_4 = {
  title: 'Attributes & Uniforms — CPU to GPU Data Flow',
  subtitle: 'The two mechanisms for sending data to shaders, and when to use each.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Prerequisites & Local Setup

**Requires:** Lessons 1-1 through 1-3 (triangle, VBO/VAO, GLSL varyings). You should be comfortable with the WebGL setup loop.

**What's new:** Right now your shaders use hardcoded values. This lesson connects your JavaScript data to every shader invocation — per-vertex data via **attributes** and per-draw-call constants via **uniforms**. After this lesson, animated, data-driven shaders are straightforward.

---

### What You Will Learn

By the end of this lesson you will be able to:
- Explain the difference between an attribute and a uniform with a hardware analogy
- Set up interleaved vertex attributes using \`gl.vertexAttribPointer\`
- Get uniform locations and set them with \`gl.uniform1f\`, \`gl.uniform3fv\`, \`gl.uniformMatrix4fv\`
- Animate a shader using a \`uTime\` uniform updated each frame with \`requestAnimationFrame\`
- Avoid the most common uniform bug: setting uniforms before \`gl.useProgram\`
- Translate raw WebGL uniform calls to Three.js ShaderMaterial syntax`,
    },

    {
      type: 'markdown',
      instruction: `## Part 1 — Attributes vs Uniforms

There are exactly **two ways** to send data from JavaScript (CPU) to your shaders (GPU):

| | Attribute | Uniform |
|---|-----------|---------|
| **Rate** | Once per vertex | Once per draw call |
| **Who reads it** | Only the vertex shader | Both vertex AND fragment shaders |
| **Size** | Up to one vec4 per vertex | Up to ~1 KB (varies by GPU) |
| **Source** | A VBO (buffer object) | A direct \`gl.uniform*()\` call |
| **Use for** | Position, normal, UV, vertex colour | Time, matrices, light position, colour |

**The team analogy:**
Imagine a sports team being coached:
- An **attribute** is each player's personal stats sheet — different for everyone. The coach reads 50 different sheets for 50 players.
- A **uniform** is the game clock on the scoreboard — everyone sees the same value simultaneously. The clock broadcasts to all players at once.

Sending a rotation matrix as an attribute on a 100,000-vertex mesh would require copying 64 bytes × 100,000 vertices = **6.4 MB per draw call**. As a uniform: **64 bytes total**, broadcast to all invocations. This is why the rule exists.

---

### The Interleaved Buffer Layout

You can pack multiple attributes into a single VBO using stride and offset:

\`\`\`
Vertex 0                     Vertex 1                     Vertex 2
┌─────────┬─────────────┐   ┌─────────┬─────────────┐   ┌─────────┬─────────────┐
│ pos xy  │  colour rgb │   │ pos xy  │  colour rgb │   │ pos xy  │  colour rgb │
│ 8 bytes │   12 bytes  │   │ 8 bytes │   12 bytes  │   │ 8 bytes │   12 bytes  │
└─────────┴─────────────┘   └─────────┴─────────────┘   └─────────┴─────────────┘
byte 0    8              20  byte 20   28             40  byte 40  48             60

Stride = 20 bytes (distance from one vertex to the next)
aPosition offset = 0  (starts at beginning of each vertex)
aColor    offset = 8  (starts after the 2 position floats)
\`\`\`

\`\`\`js
// stride = 20 bytes, position offset = 0
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 20, 0);
// stride = 20 bytes, colour offset = 8 (skip 2 floats × 4 bytes)
gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 20, 8);
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Data Flow Diagram — Attribute vs Uniform

Click a vertex slot to see how its attribute data flows to that specific shader invocation. Click "Uniform" to see the broadcast model — one value hits all invocations simultaneously.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="700" height="360" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="display:flex;gap:8px;">
    <button id="btnV0" style="background:#1e2a3f;border:1px solid #334155;color:#f87171;padding:6px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Vertex 0</button>
    <button id="btnV1" style="background:#1e2a3f;border:1px solid #334155;color:#4ade80;padding:6px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Vertex 1</button>
    <button id="btnV2" style="background:#1e2a3f;border:1px solid #334155;color:#38bdf8;padding:6px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Vertex 2</button>
    <button id="btnU" style="background:#1e2a3f;border:1px solid #334155;color:#c084fc;padding:6px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Uniform (uTime)</button>
    <button id="btnReset" style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:6px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Reset</button>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var VERTEX_COLORS = ['#f87171', '#4ade80', '#38bdf8'];
var VERTICES = [
  { pos: '(0.0, 0.6)', col: '(1.0, 0.2, 0.2)', label: 'V0' },
  { pos: '(-0.6,-0.5)', col: '(0.2, 1.0, 0.3)', label: 'V1' },
  { pos: '(0.6, -0.5)', col: '(0.3, 0.4, 1.0)', label: 'V2' },
];

var selected = null; // 0,1,2 = vertex, 'u' = uniform

function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

function drawArrow(x1, y1, x2, y2, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  var angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4));
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  // ── Left panel: VBO ──
  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  roundRect(12, 20, 190, H - 30, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#475569'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('CPU — VBO', 107, 38);

  VERTICES.forEach(function(v, i) {
    var vy = 55 + i * 90;
    var active = selected === i;
    ctx.fillStyle = active ? VERTEX_COLORS[i] + '22' : '#1e2a3f';
    ctx.strokeStyle = active ? VERTEX_COLORS[i] : '#334155';
    ctx.lineWidth = active ? 2 : 1;
    roundRect(22, vy, 170, 78, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = VERTEX_COLORS[i]; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
    ctx.fillText(v.label, 32, vy + 16);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
    ctx.fillText('aPosition: ' + v.pos, 32, vy + 32);
    ctx.fillText('aColor:    ' + v.col, 32, vy + 48);
  });

  // Uniform row at bottom of VBO panel
  var uy = 55 + 3 * 90;
  var uActive = selected === 'u';
  ctx.fillStyle = uActive ? '#c084fc22' : '#1e2a3f';
  ctx.strokeStyle = uActive ? '#c084fc' : '#334155'; ctx.lineWidth = uActive ? 2 : 1;
  roundRect(22, uy, 170, 50, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c084fc'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
  ctx.fillText('uniform', 32, uy + 16);
  ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
  ctx.fillText('uTime: 3.142', 32, uy + 32);

  // ── Right panel: Shader invocations ──
  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  roundRect(W - 202, 20, 190, H - 30, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#475569'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('GPU — Vertex Shaders', W - 107, 38);

  VERTICES.forEach(function(v, i) {
    var sy = 55 + i * 90;
    var active = selected === i || selected === 'u';
    ctx.fillStyle = active ? (selected === i ? VERTEX_COLORS[i] + '22' : '#c084fc22') : '#1e2a3f';
    ctx.strokeStyle = active ? (selected === i ? VERTEX_COLORS[i] : '#c084fc') : '#334155';
    ctx.lineWidth = active ? 2 : 1;
    roundRect(W - 192, sy, 170, 78, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = selected === i ? VERTEX_COLORS[i] : (selected === 'u' ? '#c084fc' : '#64748b');
    ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
    ctx.fillText('invocation ' + i, W - 182, sy + 16);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
    ctx.fillText('reads: ' + v.pos, W - 182, sy + 32);
    if (selected === 'u') ctx.fillText('uTime: 3.142 (same!)', W - 182, sy + 48);
    else ctx.fillText('col: ' + v.col, W - 182, sy + 48);
  });

  // ── Arrows ──
  if (selected !== null && selected !== 'u') {
    var i = selected;
    var srcY = 55 + i * 90 + 39;
    var dstY = 55 + i * 90 + 39;
    drawArrow(192, srcY, W - 202, dstY, VERTEX_COLORS[i], 0.9);
    // fade other arrows
    VERTICES.forEach(function(_, j) {
      if (j !== i) {
        drawArrow(192, 55 + j * 90 + 39, W - 202, 55 + j * 90 + 39, VERTEX_COLORS[j], 0.15);
      }
    });
  } else if (selected === 'u') {
    var uy2 = 55 + 3 * 90 + 25;
    VERTICES.forEach(function(_, i) {
      drawArrow(192, uy2, W - 202, 55 + i * 90 + 39, '#c084fc', 0.85);
    });
  } else {
    VERTICES.forEach(function(_, i) {
      drawArrow(192, 55 + i * 90 + 39, W - 202, 55 + i * 90 + 39, VERTEX_COLORS[i], 0.3);
    });
  }

  // ── Legend ──
  ctx.fillStyle = '#334155'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  if (selected === null) ctx.fillText('← select a vertex or uniform to see the data flow →', W / 2, H / 2);
  else if (selected === 'u') ctx.fillText('Uniform broadcasts one value to ALL shader invocations', W / 2, H / 2 + 10);
  else ctx.fillText('Attribute: each invocation reads its own slice of the VBO', W / 2, H / 2 + 10);
}

document.getElementById('btnV0').onclick = function() { selected = 0; draw(); };
document.getElementById('btnV1').onclick = function() { selected = 1; draw(); };
document.getElementById('btnV2').onclick = function() { selected = 2; draw(); };
document.getElementById('btnU').onclick  = function() { selected = 'u'; draw(); };
document.getElementById('btnReset').onclick = function() { selected = null; draw(); };

draw();`,
      outputHeight: 460,
    },

    {
      type: 'challenge',
      instruction: `**Attribute or uniform?** You're rendering 50,000 particles. Each particle has its own colour that never changes after creation. A global brightness multiplier changes every frame. Which variable should be an attribute and which a uniform?`,
      options: [
        { label: 'A', text: 'Colour = uniform, brightness = attribute' },
        { label: 'B', text: 'Colour = attribute, brightness = uniform' },
        { label: 'C', text: 'Both should be attributes' },
        { label: 'D', text: 'Both should be uniforms' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Colour is per-particle (different for each) and lives in the VBO as an attribute. Brightness is the same for every particle every frame — one value shared by all 50,000 invocations — so it is a uniform. Uploading it 50,000 times as an attribute would waste 200 KB per frame for no reason.',
      failMessage: 'Think about the rate of change. Per-vertex data (different value per vertex) → attribute. Per-draw-call constant (same for all) → uniform. Particle colour is different per particle = attribute. Brightness is the same for all particles = uniform.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Setting Uniforms: The API

\`\`\`js
// 1. Compile and link your shader program (same as before)
var prog = gl.createProgram();
// ...link, attach, etc...

// 2. Activate the program FIRST — this is the critical order requirement
gl.useProgram(prog);

// 3. Get the uniform location (returns an opaque object — cache this, it's expensive)
var timeLoc   = gl.getUniformLocation(prog, 'uTime');
var colourLoc = gl.getUniformLocation(prog, 'uColour');
var matLoc    = gl.getUniformLocation(prog, 'uMatrix');

// 4. Set values — MUST be after useProgram
gl.uniform1f(timeLoc, 3.14);                    // float
gl.uniform3fv(colourLoc, [1.0, 0.5, 0.0]);     // vec3 (f=float, v=array)
gl.uniformMatrix4fv(matLoc, false, matArray);   // mat4 (false = don't transpose)
\`\`\`

**The full uniform type table:**

| GLSL type | JS call |
|-----------|---------|
| \`float\` | \`gl.uniform1f(loc, val)\` |
| \`int / bool\` | \`gl.uniform1i(loc, val)\` |
| \`vec2\` | \`gl.uniform2f(loc, x, y)\` or \`gl.uniform2fv(loc, [x,y])\` |
| \`vec3\` | \`gl.uniform3fv(loc, [r,g,b])\` |
| \`vec4\` | \`gl.uniform4fv(loc, [r,g,b,a])\` |
| \`mat4\` | \`gl.uniformMatrix4fv(loc, false, float32Array)\` |
| \`sampler2D\` | \`gl.uniform1i(loc, textureUnit)\` |

**The golden rule:** \`gl.useProgram\` → \`gl.uniform*\` → \`gl.drawArrays\`. Uniforms set before \`useProgram\` are silently discarded.

---

### Animating with uTime

The pattern every animated WebGL effect uses:

\`\`\`js
var startTime = performance.now();

function render() {
  var t = (performance.now() - startTime) / 1000; // seconds

  gl.useProgram(prog);
  gl.uniform1f(timeLoc, t);   // upload time each frame
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(render);
}
render();
\`\`\`

In GLSL: \`sin(uTime)\` oscillates −1→1 at 1 Hz. \`sin(uTime * 2.0)\` at 2 Hz. \`sin(uTime) * 0.5 + 0.5\` remaps to 0→1 — perfect for colours and opacity.`,
    },

    {
      type: 'js',
      instruction: `### Live Demo — uTime Uniform Animation

A triangle whose vertex colours oscillate over time using \`sin(uTime + offset)\`. The entire animation is driven by a single float uniform updated 60 times per second.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="560" height="320" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="display:flex;gap:10px;align-items:center;font-family:monospace;font-size:11px;color:var(--color-text-secondary, #475569);">
    <span>Speed:</span>
    <input id="speed" type="range" min="0.1" max="5" step="0.1" value="1.0" style="width:120px">
    <span id="speedVal" style="color:#94a3b8;width:30px">1.0</span>
    <button id="pause" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:11px;">Pause</button>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);

var VS = \`
  attribute vec2 aPosition;
  uniform float uTime;
  varying vec3 vColor;
  void main() {
    // Each vertex gets a different phase offset — creates the colour wave
    float phase = aPosition.x * 2.0 + aPosition.y;
    vColor = vec3(
      sin(uTime + phase + 0.0) * 0.5 + 0.5,
      sin(uTime + phase + 2.094) * 0.5 + 0.5,
      sin(uTime + phase + 4.189) * 0.5 + 0.5
    );
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
\`;

var FS = \`
  precision mediump float;
  varying vec3 vColor;
  void main() { gl_FragColor = vec4(vColor, 1.0); }
\`;

function makeShader(type, src) {
  var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
}
var prog = gl.createProgram();
gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog);

var verts = new Float32Array([0.0, 0.65, -0.7, -0.55, 0.7, -0.55]);
var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

gl.useProgram(prog);
var posLoc  = gl.getAttribLocation(prog, 'aPosition');
var timeLoc = gl.getUniformLocation(prog, 'uTime');
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posLoc);

var paused = false; var t = 0; var speed = 1.0;
var last = performance.now();

document.getElementById('speed').oninput = function() {
  speed = parseFloat(this.value);
  document.getElementById('speedVal').textContent = speed.toFixed(1);
};
document.getElementById('pause').onclick = function() {
  paused = !paused;
  this.textContent = paused ? 'Resume' : 'Pause';
  if (!paused) { last = performance.now(); loop(); }
};

function loop() {
  if (paused) return;
  var now = performance.now();
  t += (now - last) / 1000 * speed;
  last = now;

  gl.clearColor(0.04, 0.07, 0.12, 1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(prog);
  gl.uniform1f(timeLoc, t);    // ← the only thing that changes each frame
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(loop);
}
loop();
console.log('Animation running — uTime increments each frame');`,
      outputHeight: 400,
    },

    {
      type: 'js',
      instruction: `### Attribute vs Uniform Colour — Side by Side

Left: each vertex has its own colour **attribute** (different per vertex). Right: a single **uniform** colour shared by all vertices. Use the controls to see both and measure what happens to the data upload cost.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <div style="display:flex;gap:12px;width:100%;justify-content:center;">
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
      <div style="color:var(--color-text-secondary, #475569);font-family:monospace;font-size:11px;">Attribute colours</div>
      <canvas id="cv1" width="270" height="220" style="border-radius:8px;display:block;"></canvas>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
      <div style="color:var(--color-text-secondary, #475569);font-family:monospace;font-size:11px;">Uniform colour</div>
      <canvas id="cv2" width="270" height="220" style="border-radius:8px;display:block;"></canvas>
    </div>
  </div>
  <div style="display:flex;gap:10px;align-items:center;font-family:monospace;font-size:11px;color:var(--color-text-secondary, #475569);">
    <span>Uniform colour:</span>
    <input id="colPick" type="color" value="#38bdf8">
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `function setupGL(canvas) {
  var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  gl.viewport(0, 0, canvas.width, canvas.height);
  return gl;
}

var ATTR_VS = \`
  attribute vec2 aPos; attribute vec3 aCol; varying vec3 vCol;
  void main() { vCol = aCol; gl_Position = vec4(aPos, 0.0, 1.0); }
\`;
var ATTR_FS = \`precision mediump float; varying vec3 vCol;
  void main() { gl_FragColor = vec4(vCol, 1.0); }\`;

var UNI_VS = \`
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
\`;
var UNI_FS = \`precision mediump float; uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }\`;

function makeProgram(gl, vsrc, fsrc) {
  function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; }
  var p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vsrc));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsrc));
  gl.linkProgram(p);
  return p;
}

// Canvas 1 — attribute colours (interleaved: x y r g b per vertex)
var gl1 = setupGL(document.getElementById('cv1'));
var prog1 = makeProgram(gl1, ATTR_VS, ATTR_FS);
var data1 = new Float32Array([
   0.0,  0.7,   1.0, 0.2, 0.2,   // top — red
  -0.7, -0.6,   0.2, 1.0, 0.3,   // bottom-left — green
   0.7, -0.6,   0.3, 0.4, 1.0,   // bottom-right — blue
]);
var buf1 = gl1.createBuffer(); gl1.bindBuffer(gl1.ARRAY_BUFFER, buf1);
gl1.bufferData(gl1.ARRAY_BUFFER, data1, gl1.STATIC_DRAW);
gl1.useProgram(prog1);
var p1 = gl1.getAttribLocation(prog1, 'aPos');
var c1 = gl1.getAttribLocation(prog1, 'aCol');
gl1.vertexAttribPointer(p1, 2, gl1.FLOAT, false, 20, 0);
gl1.enableVertexAttribArray(p1);
gl1.vertexAttribPointer(c1, 3, gl1.FLOAT, false, 20, 8);
gl1.enableVertexAttribArray(c1);
gl1.clearColor(0.04,0.07,0.12,1); gl1.clear(gl1.COLOR_BUFFER_BIT);
gl1.drawArrays(gl1.TRIANGLES, 0, 3);

// Canvas 2 — uniform colour
var gl2 = setupGL(document.getElementById('cv2'));
var prog2 = makeProgram(gl2, UNI_VS, UNI_FS);
var data2 = new Float32Array([0.0, 0.7, -0.7, -0.6, 0.7, -0.6]);
var buf2 = gl2.createBuffer(); gl2.bindBuffer(gl2.ARRAY_BUFFER, buf2);
gl2.bufferData(gl2.ARRAY_BUFFER, data2, gl2.STATIC_DRAW);
gl2.useProgram(prog2);
var p2 = gl2.getAttribLocation(prog2, 'aPos');
var colLoc = gl2.getUniformLocation(prog2, 'uColor');
gl2.vertexAttribPointer(p2, 2, gl2.FLOAT, false, 0, 0);
gl2.enableVertexAttribArray(p2);

function setUniformColor(hex) {
  var r = parseInt(hex.slice(1,3),16)/255;
  var g = parseInt(hex.slice(3,5),16)/255;
  var b = parseInt(hex.slice(5,7),16)/255;
  gl2.clearColor(0.04,0.07,0.12,1); gl2.clear(gl2.COLOR_BUFFER_BIT);
  gl2.useProgram(prog2);
  gl2.uniform3fv(colLoc, [r, g, b]);   // set the uniform colour
  gl2.drawArrays(gl2.TRIANGLES, 0, 3);
}

document.getElementById('colPick').oninput = function() { setUniformColor(this.value); };
setUniformColor('#38bdf8');
console.log('Attribute colours: 3 different vertex colours interpolated across the triangle');
console.log('Uniform colour: one colour, set via gl.uniform3fv, solid fill');`,
      outputHeight: 340,
    },

    {
      type: 'challenge',
      instruction: `**Common bug:** A developer writes this code to animate a uniform:

\`\`\`js
var timeLoc = gl.getUniformLocation(prog, 'uTime');
gl.uniform1f(timeLoc, elapsed);   // set uniform
gl.useProgram(prog);              // activate program AFTER
gl.drawArrays(gl.TRIANGLES, 0, 3);
\`\`\`

The triangle renders but never animates. What is wrong?`,
      options: [
        { label: 'A', text: 'getUniformLocation should be called every frame' },
        { label: 'B', text: 'uniform1f must come after useProgram — uniforms set before useProgram are silently ignored' },
        { label: 'C', text: 'The uniform type is wrong — elapsed should use uniform1i' },
        { label: 'D', text: 'drawArrays must come before uniform1f' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. gl.uniform* calls only apply to the currently-active program (set by useProgram). Setting a uniform before useProgram writes to no program at all — the call silently has no effect. Cache the location (getUniformLocation is expensive) but set the value only after useProgram.',
      failMessage: 'The order matters: useProgram activates a shader program. gl.uniform* sets a value in the CURRENTLY ACTIVE program. If you call uniform* before useProgram, there is no active program yet — the call is silently discarded.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Three.js Equivalents

Everything above maps directly to Three.js \`ShaderMaterial\`:

\`\`\`js
// Raw WebGL                              // Three.js equivalent
// ──────────────────────────────────    // ──────────────────────────────────
gl.uniform1f(timeLoc, t);               material.uniforms.uTime.value = t;
gl.uniform3fv(colLoc, [1,0.5,0]);      material.uniforms.uColor.value.set(1, 0.5, 0);
gl.uniformMatrix4fv(mLoc, false, m);   // Three.js handles automatically!

// Declaring uniforms in ShaderMaterial:
var material = new THREE.ShaderMaterial({
  uniforms: {
    uTime:  { value: 0.0 },
    uColor: { value: new THREE.Color(1, 0.5, 0) },
    uTex:   { value: myTexture },
  },
  vertexShader: \`
    uniform float uTime;
    void main() {
      vec3 pos = position + normal * sin(uTime) * 0.1;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  \`,
  fragmentShader: \`
    uniform vec3 uColor;
    void main() { gl_FragColor = vec4(uColor, 1.0); }
  \`,
});

// Update in animation loop:
function animate() {
  material.uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
\`\`\`

**Three.js auto-provided uniforms** (available in ShaderMaterial without declaring):
- \`modelMatrix\`, \`viewMatrix\`, \`projectionMatrix\` — the MVP matrices
- \`modelViewMatrix\` — \`viewMatrix × modelMatrix\` pre-multiplied (use this, it's faster)
- \`normalMatrix\` — for lighting calculations (inverse transpose of modelViewMatrix)
- \`cameraPosition\` — camera's world position

**Attributes in Three.js:**
\`\`\`js
geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speedArray, 1));
// In vertex shader: attribute float aSpeed;   (or: in float aSpeed; for GLSL 300)
\`\`\``,
    },

    {
      type: 'challenge',
      instruction: `**Three.js translation:** In raw WebGL you write \`gl.uniform1f(gl.getUniformLocation(prog, 'uTime'), t)\`. In Three.js ShaderMaterial, how do you declare and update this uniform?`,
      options: [
        { label: 'A', text: "uniforms: { uTime: t } and material.uniforms.uTime = clock.getElapsedTime()" },
        { label: 'B', text: "uniforms: { uTime: { value: 0 } } and material.uniforms.uTime.value = clock.getElapsedTime()" },
        { label: 'C', text: "gl.uniform1f inside a Three.js onBeforeRender callback" },
        { label: 'D', text: "uniforms.set('uTime', clock.getElapsedTime())" },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Every Three.js uniform is an object with a .value property. This extra layer lets Three.js detect changes and decide when to upload. Update .value each frame in your animate loop — Three.js uploads it to the GPU during renderer.render().',
      failMessage: 'In Three.js, uniforms are declared as { name: { value: initialValue } } objects. You update via material.uniforms.name.value = newValue — never by reassigning the entire object.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

  ],
};

export default {
  id: 'three-js-1-4-attributes-uniforms',
  slug: 'attributes-and-uniforms',
  chapter: 'three-js.1',
  order: 4,
  title: 'Attributes & Uniforms — CPU to GPU Data Flow',
  subtitle: 'The two mechanisms for sending data to shaders, and when to use each.',
  tags: ['three-js', 'webgl', 'uniforms', 'attributes', 'glsl', 'data-flow', 'animation'],
  hook: {
    question: 'You want a mesh with 100,000 vertices to rotate slowly over time. Should the rotation angle live in the VBO once per vertex, or in a single global slot? What are the two words graphics programmers use for these two choices?',
    realWorldContext: 'Every animated shader — colour cycles, wobbling geometry, time-based procedural patterns — is driven by a uniform variable updated each frame. Attributes are your per-vertex data streams. Together they are the entire vocabulary of CPU-to-GPU communication.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Attribute: per-vertex, fed from the VBO. Each shader invocation reads a different value.',
      'Uniform: per-draw-call constant. Every shader invocation reads the same value.',
      'Rule: changes per vertex → attribute. Same for all vertices in a draw call → uniform.',
      'Order: useProgram() → uniform*() → draw*(). Uniforms set before useProgram are ignored.',
      'Three.js: uniforms: { uTime: { value: 0 } } → material.uniforms.uTime.value = t each frame.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Most Common Uniform Bug',
        body: 'gl.uniform* calls only apply to the currently-bound program (set via useProgram). Call useProgram FIRST, then set your uniforms. Calling uniform* before useProgram silently discards the call — no error, no warning.',
      },
    ],
    visualizations: [
      { id: 'JSNotebook', title: 'Attributes & Uniforms — CPU to GPU Data Flow', props: { lesson: LESSON_3JS_1_4 } },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Attribute: one value per vertex, read from VBO. Example: position, normal, UV, vertexColour.',
    'Uniform: one value for the whole draw call. Example: time, camera matrix, light position.',
    'Set order: gl.useProgram(prog) → gl.uniform1f(loc, val) → gl.drawArrays()',
    'Varying: vertex shader writes → rasteriser interpolates → fragment shader reads.',
    'Three.js: uniforms: { uTime: { value: 0 } } → material.uniforms.uTime.value = t each frame.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_1_4 };
