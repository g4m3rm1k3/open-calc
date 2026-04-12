// Three.js · Chapter 1 · Lesson 2
// Vertex Buffers — VBO, EBO, VAO

const LESSON_3JS_1_2 = {
  title: 'Vertex Buffers — VBO, EBO, VAO',
  subtitle: 'How geometry lives on the GPU: upload data once, reuse it every frame.',
  sequential: true,

  cells: [

    // ── Cell 0a: Prerequisites & Local Setup ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Prerequisites & Local Setup

**Requires:** Lesson 1-1 (Your First Triangle). You should be able to draw a triangle from a Float32Array using the 7-step WebGL program.

**What's new here:** We are going to stop copying vertices and start managing GPU memory properly. By the end you will draw the same quad with 4 vertices instead of 6 — and understand why that matters at mesh scales of 50,000 triangles.

**Run locally:** This file is the starting point for all code in this lesson:

\`\`\`html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>VBO + EBO + VAO</title></head>
<body style="margin:0;background:#0a0f1e">
  <canvas id="cv" width="600" height="400"></canvas>
  <script>
    var canvas = document.getElementById('cv');
    var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    // From lesson 1-1: 6 vertices, 2 triangles, no index buffer
    var positions = new Float32Array([
      -0.5,  0.5,   // TL  ← duplicated in triangle 2
       0.5,  0.5,   // TR  ← duplicated in triangle 2
      -0.5, -0.5,   // BL
       0.5,  0.5,   // TR  ← duplicate of vertex 2
       0.5, -0.5,   // BR
      -0.5, -0.5,   // BL  ← duplicate of vertex 3
    ]);
    // After this lesson: 4 vertices + 6 indices. Same result. Less data.
  </script>
</body>
</html>
\`\`\``,
    },

    // ── Cell 0b: Learning Objectives + VBO/EBO/VAO Primer ────────────────────
    {
      type: 'markdown',
      instruction: `### What You Will Learn

By the end of this lesson you will be able to:
- Explain why the GPU cannot read JavaScript arrays directly
- Upload vertex data to the GPU using a **VBO** (Vertex Buffer Object)
- Eliminate duplicated vertices using an **EBO** (Element Buffer / Index Buffer)
- Store an entire buffer setup in a **VAO** (Vertex Array Object) and restore it with one bind call
- Calculate stride and byte offset for interleaved vertex data (position + UV + normal)

---

### The GPU Memory Problem

Your JavaScript lives in **CPU RAM**. Your GPU has its own separate memory — **VRAM**. The two cannot see each other directly.

Every time you call \`gl.bufferData()\`, you are copying data across the **PCIe bus** from CPU RAM to GPU VRAM. Once it is there, the GPU can read it millions of times per frame without touching the CPU again.

Three buffer types manage this:

| Name | Full Name | What it stores | WebGL call |
|------|-----------|---------------|------------|
| **VBO** | Vertex Buffer Object | Vertex attributes (position, colour, UV, normal) | \`gl.ARRAY_BUFFER\` |
| **EBO** | Element Buffer Object | Vertex indices (which vertices form each triangle) | \`gl.ELEMENT_ARRAY_BUFFER\` |
| **VAO** | Vertex Array Object | The *recipe* — which VBO maps to which attribute, with what stride/offset | \`gl.createVertexArray()\` |

**Three.js parallel:**
- \`new THREE.BufferGeometry()\` → creates and manages the VAO
- \`geo.setAttribute('position', attr)\` → creates a VBO and calls \`vertexAttribPointer\`
- \`geo.setIndex([0,1,2,...])\` → creates the EBO`,
    },

    // ── Cell 1: Memory Layout Visualizer ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Memory Layout — Bytes on the GPU

A vertex is just a block of floats in memory. Each float is **4 bytes**. The total size of one vertex is called the **stride**.

Click each coloured field to see the \`gl.vertexAttribPointer()\` call it maps to. Drag the **layout selector** to switch between position-only, position+UV, and interleaved position+UV+normal.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
    <button class="layout-btn active" data-layout="0" style="padding:6px 12px;border-radius:6px;border:1.5px solid #38bdf8;background:rgba(56,189,248,0.12);color:#38bdf8;font-family:monospace;font-size:11px;cursor:pointer">Position only (2 floats)</button>
    <button class="layout-btn" data-layout="1" style="padding:6px 12px;border-radius:6px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Position + UV (4 floats)</button>
    <button class="layout-btn" data-layout="2" style="padding:6px 12px;border-radius:6px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Position + Normal + UV (8 floats)</button>
  </div>
  <canvas id="cv" width="640" height="280" style="border-radius:8px;display:block;width:100%"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var LAYOUTS = [
  {
    name: 'Position only',
    stride: 2,
    fields: [
      { name: 'X', floats: 1, col: '#f87171', attr: 'aPosition' },
      { name: 'Y', floats: 1, col: '#fb923c', attr: 'aPosition' },
    ]
  },
  {
    name: 'Position + UV',
    stride: 4,
    fields: [
      { name: 'X', floats: 1, col: '#f87171', attr: 'aPosition' },
      { name: 'Y', floats: 1, col: '#fb923c', attr: 'aPosition' },
      { name: 'U', floats: 1, col: '#34d399', attr: 'aTexCoord' },
      { name: 'V', floats: 1, col: '#059669', attr: 'aTexCoord' },
    ]
  },
  {
    name: 'Position + Normal + UV',
    stride: 8,
    fields: [
      { name: 'X', floats: 1, col: '#f87171', attr: 'aPosition' },
      { name: 'Y', floats: 1, col: '#fb923c', attr: 'aPosition' },
      { name: 'Z', floats: 1, col: '#fbbf24', attr: 'aPosition' },
      { name: 'NX', floats: 1, col: '#60a5fa', attr: 'aNormal' },
      { name: 'NY', floats: 1, col: '#818cf8', attr: 'aNormal' },
      { name: 'NZ', floats: 1, col: '#a78bfa', attr: 'aNormal' },
      { name: 'U', floats: 1, col: '#34d399', attr: 'aTexCoord' },
      { name: 'V', floats: 1, col: '#059669', attr: 'aTexCoord' },
    ]
  },
];

var currentLayout = 0;
var selectedAttr = null;

function getAttribGroups(layout) {
  var groups = {};
  var offset = 0;
  layout.fields.forEach(function(f) {
    if (!groups[f.attr]) groups[f.attr] = { attr: f.attr, offset: offset, count: 0, col: f.col };
    groups[f.attr].count += f.floats;
    offset += f.floats;
  });
  return groups;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  var L = LAYOUTS[currentLayout];
  var FW = 56, FH = 52, startX = (W - L.fields.length * (FW + 4)) / 2, y = 40;

  // Header
  ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('ONE VERTEX — ' + L.stride + ' floats = ' + (L.stride * 4) + ' bytes   (stride = ' + (L.stride * 4) + ')', W / 2, 24);

  // Float boxes
  var offset = 0;
  L.fields.forEach(function(f, i) {
    var x = startX + i * (FW + 4);
    var isSelected = selectedAttr === f.attr;

    ctx.fillStyle = isSelected ? f.col + '44' : f.col + '18';
    ctx.strokeStyle = isSelected ? f.col : f.col + '88';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(x, y, FW, FH, 6); ctx.fill(); ctx.stroke();

    ctx.fillStyle = isSelected ? f.col : f.col + 'cc';
    ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    ctx.fillText(f.name, x + FW / 2, y + 22);
    ctx.font = '9px monospace';
    ctx.fillText('4 bytes', x + FW / 2, y + 36);
    ctx.fillStyle = '#475569'; ctx.font = '8px monospace';
    ctx.fillText('offset ' + (offset * 4), x + FW / 2, y + 48);

    offset += f.floats;
  });

  // Byte ruler
  var rulerY = y + FH + 12;
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, rulerY);
  ctx.lineTo(startX + L.fields.length * (FW + 4) - 4, rulerY);
  ctx.stroke();
  for (var i = 0; i <= L.stride; i++) {
    var rx = startX + i * (FW + 4) - (i > 0 ? 4 : 0);
    if (i < L.stride) rx = startX + i * (FW + 4);
    ctx.beginPath();
    ctx.moveTo(startX + i * (FW + 4) - (i === L.stride ? 4 : 0), rulerY - 3);
    ctx.lineTo(startX + i * (FW + 4) - (i === L.stride ? 4 : 0), rulerY + 3);
    ctx.stroke();
    ctx.fillStyle = '#475569'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
    var bx = startX + i * (FW + 4) - (i === L.stride ? 4 : 0);
    ctx.fillText(i * 4, bx, rulerY + 12);
  }

  // Code panel
  var panelY = rulerY + 24;
  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(10, panelY, W - 20, H - panelY - 10, 8); ctx.fill(); ctx.stroke();

  if (selectedAttr) {
    var groups = getAttribGroups(L);
    var g = groups[selectedAttr];
    var stride = L.stride * 4;
    var offset_bytes = g.offset * 4;
    var size = g.count;

    ctx.fillStyle = g.col; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
    ctx.fillText(selectedAttr, 22, panelY + 18);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
    ctx.fillText('var loc = gl.getAttribLocation(prog, \'' + selectedAttr + '\');', 22, panelY + 34);
    ctx.fillText('gl.vertexAttribPointer(loc, ' + size + ', gl.FLOAT, false, ' + stride + ', ' + offset_bytes + ');', 22, panelY + 48);
    ctx.fillText('//                           ^size    ^type        ^stride  ^byteOffset', 22, panelY + 62);
    ctx.fillStyle = '#475569'; ctx.font = '9px monospace';
    ctx.fillText('size=' + size + ' means ' + size + ' float(s) per vertex for this attribute. stride=' + stride + ' = total vertex size in bytes. byteOffset=' + offset_bytes + ' = where this attribute starts.', 22, panelY + 80);
  } else {
    ctx.fillStyle = '#334155'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Click a field above to see its vertexAttribPointer() call', W / 2, panelY + 30);
  }
}

canvas.addEventListener('click', function(e) {
  var r = canvas.getBoundingClientRect();
  var mx = (e.clientX - r.left) * (W / r.width);
  var my = (e.clientY - r.top) * (H / r.height);
  var L = LAYOUTS[currentLayout];
  var FW = 56, FH = 52, startX = (W - L.fields.length * (FW + 4)) / 2, y = 40;

  var hit = null;
  L.fields.forEach(function(f, i) {
    var x = startX + i * (FW + 4);
    if (mx >= x && mx <= x + FW && my >= y && my <= y + FH) hit = f.attr;
  });
  selectedAttr = (hit === selectedAttr) ? null : hit;
  draw();
});

document.querySelectorAll('.layout-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.layout-btn').forEach(function(b) {
      b.style.borderColor = '#475569'; b.style.background = 'transparent'; b.style.color = '#94a3b8';
      b.classList.remove('active');
    });
    this.style.borderColor = '#38bdf8'; this.style.background = 'rgba(56,189,248,0.12)'; this.style.color = '#38bdf8';
    currentLayout = parseInt(this.dataset.layout);
    selectedAttr = null;
    draw();
  });
});
draw();`,
      outputHeight: 350,
    },

    // ── Cell 2: Challenge — stride and offset ─────────────────────────────────
    {
      type: 'challenge',
      instruction: `A vertex holds **position (XYZ)** and **UV coordinates (ST)** — 5 floats total, packed in that order. What are the **stride** and the **byte offset for the UV attribute**?`,
      options: [
        { label: 'A', text: 'stride = 5, byteOffset = 3  (floats, not bytes)' },
        { label: 'B', text: 'stride = 20 bytes, byteOffset = 12 bytes  (3 floats × 4 bytes = 12)' },
        { label: 'C', text: 'stride = 20 bytes, byteOffset = 5 bytes  (5th float = byte 5)' },
        { label: 'D', text: 'stride = 5 bytes, byteOffset = 3 bytes' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Everything in vertexAttribPointer is in bytes. Stride = floats-per-vertex × 4 = 5 × 4 = 20 bytes. UV starts after 3 position floats: byteOffset = 3 × 4 = 12. The full call: gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 20, 12).',
      failMessage: 'vertexAttribPointer works in bytes, not floats. Stride = total floats × 4 bytes = 5 × 4 = 20. UV offset = position floats × 4 = 3 × 4 = 12. A common mistake is passing float counts (5, 3) instead of byte counts (20, 12).',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 260,
    },

    // ── Cell 3: EBO Markdown ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Index Buffer — Stop Duplicating Vertices

Drawing a quad with \`gl.drawArrays\` requires **6 vertices** (2 triangles × 3):

\`\`\`
Triangle 1: TL, TR, BL
Triangle 2: TR, BR, BL   ← TR and BL are duplicated
\`\`\`

A position-only vertex is 8 bytes (XY × 4). Six vertices = **48 bytes**. But the quad only has 4 unique corners.

With an **EBO (Element Buffer Object)** you upload 4 unique vertices and a separate list of indices:

\`\`\`js
var positions = new Float32Array([
  -0.5,  0.5,  // 0: TL
   0.5,  0.5,  // 1: TR
  -0.5, -0.5,  // 2: BL
   0.5, -0.5,  // 3: BR
]);
var indices = new Uint16Array([0, 1, 2,  1, 3, 2]);  // two triangles

var ebo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Draw with indices instead of drawArrays:
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
\`\`\`

**Memory comparison for this quad:**

| Approach | Vertex data | Index data | Total |
|----------|-------------|------------|-------|
| drawArrays | 6 × 8 = 48 bytes | none | 48 bytes |
| drawElements | 4 × 8 = 32 bytes | 6 × 2 = 12 bytes | **44 bytes** |

Tiny saving for a quad — but for a character mesh with 50,000 triangles and an average vertex shared by 6 triangles, indexing saves **~70% of vertex data**.

**Three.js:** \`geometry.setIndex([0, 1, 2, 1, 3, 2])\` creates the EBO automatically.`,
    },

    // ── Cell 4: Quad Builder ──────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Quad Builder — drawArrays vs drawElements

Use the slider to increase **mesh complexity** (subdivisions). Watch the vertex count and memory usage update in real time. The same visual result, with the EBO always using fewer vertices.`,
      html: `<div style="background:#0a0f1e;padding:12px;display:flex;flex-direction:column;gap:8px;align-items:center">
  <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center">
    <label style="font-family:monospace;font-size:11px;color:#94a3b8">Subdivisions: <span id="subdiv-lbl">1</span></label>
    <input id="subdiv" type="range" min="1" max="20" value="1" style="width:160px">
    <button id="toggle-mode" style="padding:6px 14px;border-radius:6px;border:1.5px solid #a78bfa;background:rgba(167,139,250,0.12);color:#a78bfa;font-family:monospace;font-size:11px;cursor:pointer">Show: EBO</button>
  </div>
  <div style="display:flex;gap:12px;width:100%;max-width:640px">
    <div style="flex:1;background:#0f172a;border-radius:8px;padding:10px">
      <div style="font-family:monospace;font-size:10px;color:#f87171;font-weight:700;margin-bottom:6px">drawArrays (no EBO)</div>
      <div id="stat-arrays" style="font-family:monospace;font-size:10px;color:#64748b;line-height:1.7"></div>
    </div>
    <div style="flex:1;background:#0f172a;border-radius:8px;padding:10px">
      <div style="font-family:monospace;font-size:10px;color:#4ade80;font-weight:700;margin-bottom:6px">drawElements (EBO)</div>
      <div id="stat-ebo" style="font-family:monospace;font-size:10px;color:#64748b;line-height:1.7"></div>
    </div>
  </div>
  <canvas id="cv" width="640" height="220" style="border-radius:8px;display:block;width:100%"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var subdivs = 1;
var showEBO = true;

function updateStats() {
  var N = subdivs;
  var quads = N * N;
  var tris = quads * 2;
  var vArrays = tris * 3;
  var vEBO = (N + 1) * (N + 1);
  var idxEBO = tris * 3;
  var bytesPerVert = 8;
  var bytesArrays = vArrays * bytesPerVert;
  var bytesEBO = vEBO * bytesPerVert + idxEBO * 2;
  var saving = Math.round((1 - bytesEBO / bytesArrays) * 100);

  document.getElementById('stat-arrays').innerHTML =
    'Vertices: ' + vArrays + '<br>' +
    'Triangles: ' + tris + '<br>' +
    'Memory: ' + bytesArrays + ' bytes<br>' +
    'Index buffer: none';
  document.getElementById('stat-ebo').innerHTML =
    'Unique vertices: ' + vEBO + '<br>' +
    'Triangles: ' + tris + '<br>' +
    'Vertex data: ' + (vEBO * bytesPerVert) + ' bytes<br>' +
    'Index data: ' + (idxEBO * 2) + ' bytes<br>' +
    '<span style="color:#4ade80">Total: ' + bytesEBO + ' bytes (' + saving + '% less)</span>';
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  var N = subdivs;
  var size = Math.min((W - 40) / 2, H - 40);
  var cellW = size / N;
  var mode = showEBO;

  function drawGrid(ox, oy, label, col) {
    ctx.strokeStyle = col + '55'; ctx.lineWidth = 0.5;
    for (var r = 0; r <= N; r++) {
      ctx.beginPath(); ctx.moveTo(ox, oy + r * cellW); ctx.lineTo(ox + N * cellW, oy + r * cellW); ctx.stroke();
    }
    for (var c = 0; c <= N; c++) {
      ctx.beginPath(); ctx.moveTo(ox + c * cellW, oy); ctx.lineTo(ox + c * cellW, oy + N * cellW); ctx.stroke();
    }

    if (!showEBO) {
      // drawArrays: show 6 dots per quad with overlap indicators
      for (var r = 0; r < N; r++) {
        for (var c = 0; c < N; c++) {
          var pts = [
            [ox + c * cellW, oy + r * cellW],
            [ox + (c+1) * cellW, oy + r * cellW],
            [ox + c * cellW, oy + (r+1) * cellW],
            [ox + (c+1) * cellW, oy + r * cellW],
            [ox + (c+1) * cellW, oy + (r+1) * cellW],
            [ox + c * cellW, oy + (r+1) * cellW],
          ];
          pts.forEach(function(p) {
            ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(1.5, 4 - N * 0.15), 0, Math.PI * 2);
            ctx.fillStyle = '#f87171'; ctx.fill();
          });
        }
      }
    } else {
      // EBO: show unique vertices
      for (var r = 0; r <= N; r++) {
        for (var c = 0; c <= N; c++) {
          ctx.beginPath(); ctx.arc(ox + c * cellW, oy + r * cellW, Math.max(1.5, 4 - N * 0.15), 0, Math.PI * 2);
          ctx.fillStyle = '#4ade80'; ctx.fill();
        }
      }
    }

    ctx.fillStyle = col; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(label, ox + N * cellW / 2, oy + N * cellW + 16);
  }

  var pad = (W - size * 2 - 20) / 2;
  drawGrid(pad, (H - size) / 2, showEBO ? 'EBO: unique vertices only' : 'drawArrays: all 6 per quad', showEBO ? '#4ade80' : '#f87171');
}

document.getElementById('subdiv').addEventListener('input', function() {
  subdivs = parseInt(this.value);
  document.getElementById('subdiv-lbl').textContent = subdivs;
  updateStats(); draw();
});

document.getElementById('toggle-mode').addEventListener('click', function() {
  showEBO = !showEBO;
  this.textContent = showEBO ? 'Show: EBO' : 'Show: drawArrays';
  this.style.borderColor = showEBO ? '#4ade80' : '#f87171';
  this.style.background = showEBO ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)';
  this.style.color = showEBO ? '#4ade80' : '#f87171';
  draw();
});

updateStats(); draw();`,
      outputHeight: 420,
    },

    // ── Cell 5: Challenge — memory savings ────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A sphere mesh has **1,000 triangles**. Each vertex holds **position + normal + UV** (8 floats = 32 bytes). On average, each vertex is **shared by 6 triangles**. Roughly how much GPU memory does an EBO save compared to \`drawArrays\`?`,
      options: [
        { label: 'A', text: 'About 5% — index buffers add overhead that mostly cancels the saving.' },
        { label: 'B', text: 'About 50% — half the vertices are duplicated.' },
        { label: 'C', text: 'About 67% — drawArrays needs 3,000 vertices; EBO needs ~500 unique + 6,000 bytes of indices.' },
        { label: 'D', text: 'About 90% — nearly all vertices are shared.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. drawArrays: 1,000 triangles × 3 vertices = 3,000 vertices × 32 bytes = 96,000 bytes. EBO: 3,000 / 6 = ~500 unique vertices × 32 bytes = 16,000 bytes + 3,000 indices × 2 bytes = 6,000 bytes. Total = 22,000 bytes — about 77% less. At C gives the closest reasoning.',
      failMessage: 'With each vertex shared by 6 triangles, drawArrays stores each vertex 6 times. 1,000 triangles = 3,000 vertex positions stored. Unique vertices = 3,000/6 = 500. EBO stores 500 × 32 = 16,000 bytes of vertex data + 3,000 indices × 2 bytes = 6,000 bytes. Total 22KB vs 96KB.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 260,
    },

    // ── Cell 6: VAO Markdown ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### VAO — Never Re-Specify Attributes Again

Every time you draw, WebGL needs to know: *which buffer holds the data for each attribute, and how is it laid out?* Without a VAO, you re-specify all of this before every draw call:

\`\`\`js
// WITHOUT VAO — repeated before every draw call:
gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, uvVBO);
gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(uvLoc);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
// ... 15 lines per object × 100 objects = 1,500 lines of state setup
\`\`\`

A **VAO** records this setup once at initialisation. At draw time, one bind call restores the entire state:

\`\`\`js
// AT STARTUP — create and configure once:
var vao = gl.createVertexArray();
gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);  // ← EBO binding is remembered too!
gl.bindVertexArray(null);  // unbind when done setting up

// PER FRAME — just bind and draw:
gl.bindVertexArray(vao);
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
\`\`\`

**Key rule:** Create VAOs **once at startup**. Bind each frame (cheap — one pointer lookup). Never recreate per frame.

**Three.js:** \`new THREE.BufferGeometry()\` creates and owns a VAO via \`WebGLBindingStates\`. Every \`geometry.setAttribute()\` call configures the VAO's attribute state.`,
    },

    // ── Cell 7: VAO State Visualizer ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### VAO State — Bind Once, Remember Everything

Click **"Manual (no VAO)"** to see what WebGL must re-specify before every draw. Click **"Bind VAO"** to see the single call that restores it all.`,
      html: `<div style="background:#0a0f1e;padding:12px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <div style="display:flex;gap:10px">
    <button id="btn-manual" style="padding:7px 16px;border-radius:7px;border:1.5px solid #f87171;background:rgba(248,113,113,0.12);color:#f87171;font-family:monospace;font-size:11px;cursor:pointer">Manual (no VAO)</button>
    <button id="btn-vao" style="padding:7px 16px;border-radius:7px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Bind VAO</button>
  </div>
  <canvas id="cv" width="640" height="300" style="border-radius:8px;display:block;width:100%"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var mode = 'manual';
var frame = 0;
var animating = false;
var animFrame = -1;

var MANUAL_CALLS = [
  { text: 'gl.bindBuffer(ARRAY_BUFFER, posVBO)', col: '#f87171' },
  { text: 'gl.vertexAttribPointer(posLoc, 3, FLOAT, false, 32, 0)', col: '#fb923c' },
  { text: 'gl.enableVertexAttribArray(posLoc)', col: '#fb923c' },
  { text: 'gl.bindBuffer(ARRAY_BUFFER, normVBO)', col: '#60a5fa' },
  { text: 'gl.vertexAttribPointer(normLoc, 3, FLOAT, false, 32, 12)', col: '#818cf8' },
  { text: 'gl.enableVertexAttribArray(normLoc)', col: '#818cf8' },
  { text: 'gl.bindBuffer(ARRAY_BUFFER, uvVBO)', col: '#34d399' },
  { text: 'gl.vertexAttribPointer(uvLoc, 2, FLOAT, false, 32, 24)', col: '#059669' },
  { text: 'gl.enableVertexAttribArray(uvLoc)', col: '#059669' },
  { text: 'gl.bindBuffer(ELEMENT_ARRAY_BUFFER, ebo)', col: '#fbbf24' },
  { text: 'gl.drawElements(TRIANGLES, count, UNSIGNED_SHORT, 0)', col: '#94a3b8' },
];

var VAO_CALLS = [
  { text: 'gl.bindVertexArray(vao)   // ← ONE CALL', col: '#4ade80' },
  { text: 'gl.drawElements(TRIANGLES, count, UNSIGNED_SHORT, 0)', col: '#94a3b8' },
];

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  var calls = mode === 'manual' ? MANUAL_CALLS : VAO_CALLS;
  var visible = animating ? Math.min(frame + 1, calls.length) : calls.length;
  var lineH = 24, startY = 28;

  ctx.fillStyle = mode === 'manual' ? '#f87171' : '#4ade80';
  ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
  ctx.fillText(mode === 'manual' ? 'Per-frame state setup — ' + MANUAL_CALLS.length + ' calls required:' : 'Per-frame state setup — ' + VAO_CALLS.length + ' call required:', 12, 16);

  for (var i = 0; i < visible; i++) {
    var c = calls[i];
    var y = startY + i * lineH;
    var isLast = i === calls.length - 1;
    var alpha = (i === visible - 1 && animating) ? '99' : 'ff';

    ctx.fillStyle = (isLast ? '#94a3b8' : c.col) + alpha;
    ctx.font = (isLast ? 'normal' : 'bold') + ' 10px monospace';
    ctx.fillText((i + 1) + '.  ' + c.text, 12, y + 16);

    if (i < visible - 1 || !animating) {
      ctx.fillStyle = '#1e3a2f';
      ctx.fillRect(W - 100, y + 4, 90, 16);
      ctx.fillStyle = '#4ade80'; ctx.font = '8px monospace'; ctx.textAlign = 'right';
      ctx.fillText('executed', W - 12, y + 14);
      ctx.textAlign = 'left';
    }
  }

  if (!animating || frame >= calls.length - 1) {
    var summaryY = startY + calls.length * lineH + 12;
    ctx.fillStyle = '#0f172a'; ctx.strokeStyle = mode === 'manual' ? '#f87171' : '#4ade80'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(10, summaryY, W - 20, 38, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = mode === 'manual' ? '#f87171' : '#4ade80'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(mode === 'manual'
      ? MANUAL_CALLS.length + ' GPU state calls per draw call — for each of your 100 objects = ' + (MANUAL_CALLS.length * 100) + ' calls/frame'
      : '2 calls per draw call — 198 fewer than manual. Same result.',
      W / 2, summaryY + 24);
  }
}

function animate() {
  if (frame < (mode === 'manual' ? MANUAL_CALLS : VAO_CALLS).length - 1) {
    frame++;
    draw();
    setTimeout(function() { if (animating) requestAnimationFrame(animate); }, 120);
  } else {
    animating = false;
    draw();
  }
}

function startMode(m) {
  mode = m;
  frame = -1;
  animating = true;
  var active = m === 'manual' ? '#f87171' : '#4ade80';
  var inactive = '#475569';
  document.getElementById('btn-manual').style.borderColor = m === 'manual' ? '#f87171' : inactive;
  document.getElementById('btn-manual').style.color = m === 'manual' ? '#f87171' : '#94a3b8';
  document.getElementById('btn-manual').style.background = m === 'manual' ? 'rgba(248,113,113,0.12)' : 'transparent';
  document.getElementById('btn-vao').style.borderColor = m === 'vao' ? '#4ade80' : inactive;
  document.getElementById('btn-vao').style.color = m === 'vao' ? '#4ade80' : '#94a3b8';
  document.getElementById('btn-vao').style.background = m === 'vao' ? 'rgba(74,222,128,0.12)' : 'transparent';
  animate();
}

document.getElementById('btn-manual').onclick = function() { startMode('manual'); };
document.getElementById('btn-vao').onclick = function() { startMode('vao'); };
startMode('manual');`,
      outputHeight: 380,
    },

    // ── Cell 8: Challenge — VAO creation timing ───────────────────────────────
    {
      type: 'challenge',
      instruction: `You are building a 3D scene with 50 unique mesh types, each drawn many times per frame. When should you create each VAO?`,
      options: [
        { label: 'A', text: 'Once per frame, at the start of the render loop — to ensure the state is always fresh.' },
        { label: 'B', text: 'Once at startup (or when first needed), then bind each frame — creation is expensive, binding is cheap.' },
        { label: 'C', text: 'Once per draw call — each gl.drawElements should be preceded by gl.createVertexArray.' },
        { label: 'D', text: 'Never — VAOs are only needed when using WebGL 2. In WebGL 1 you must always re-specify attrib state.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. gl.createVertexArray() allocates GPU resources — do it once. gl.bindVertexArray() is a single pointer swap in the driver — essentially free. Creating a VAO per frame forces the GPU driver to allocate and garbage-collect GPU objects every frame, causing hitches and memory churn. (D is partially true: WebGL 1 has no VAOs — but gl.OES_vertex_array_object extends it, and the lesson works in WebGL 2.)',
      failMessage: 'VAO creation (gl.createVertexArray) allocates GPU resources — it should happen once at startup. Binding (gl.bindVertexArray) is a cheap state switch — that is the per-frame operation. Never create GPU objects inside a render loop.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 260,
    },

    // ── Cell 9: Coding Challenge — Convert to drawElements ────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Convert a Quad from drawArrays to drawElements

The code below draws a purple quad using **6 vertices and drawArrays** (Triangle 1: TL, TR, BL — Triangle 2: TR, BR, BL — note TR and BL are duplicated).

Your task:
1. Reduce the \`positions\` array to **4 unique vertices** (TL, TR, BL, BR)
2. Create a \`Uint16Array\` of 6 indices: \`[0, 1, 2,  1, 3, 2]\`
3. Upload it with \`gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo)\` + \`gl.bufferData\`
4. Replace \`gl.drawArrays(gl.TRIANGLES, 0, 6)\` with \`gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)\`

The visual output should be identical — a full-canvas purple quad.`,
      html: `<canvas id="cv" width="560" height="320" style="display:block;border-radius:8px;width:100%;max-width:560px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;padding:10px}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// TODO: Reduce to 4 unique vertices
var positions = new Float32Array([
  -0.8,  0.8,   // 0: TL
   0.8,  0.8,   // 1: TR
  -0.8, -0.8,   // 2: BL  (duplicate below)
   0.8,  0.8,   // TR again ← remove this
   0.8, -0.8,   // 3: BR
  -0.8, -0.8,   // BL again ← remove this
]);

var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

// TODO: Create index buffer
// var indices = new Uint16Array([0, 1, 2,  1, 3, 2]);
// var ebo = gl.createBuffer();
// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, 'attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }');
gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, 'precision mediump float; void main() { gl_FragColor = vec4(0.5, 0.2, 0.9, 1.0); }');
gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

// TODO: replace with gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
gl.drawArrays(gl.TRIANGLES, 0, 6);`,
      solutionCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

var positions = new Float32Array([
  -0.8,  0.8,   // 0: TL
   0.8,  0.8,   // 1: TR
  -0.8, -0.8,   // 2: BL
   0.8, -0.8,   // 3: BR
]);

var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

var indices = new Uint16Array([0, 1, 2,  1, 3, 2]);
var ebo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, 'attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }');
gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, 'precision mediump float; void main() { gl_FragColor = vec4(0.5, 0.2, 0.9, 1.0); }');
gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);`,
      check: (code) => {
        const hasEBO = /ELEMENT_ARRAY_BUFFER/.test(code);
        const hasDrawElements = /drawElements/.test(code);
        const hasUint16 = /Uint16Array/.test(code);
        return hasEBO && hasDrawElements && hasUint16;
      },
      successMessage: '✓ drawElements working! You just used a Uint16Array index buffer — the same pattern Three.js uses internally for every BufferGeometry with setIndex(). The GPU now stores 4 vertices instead of 6, and the 6 indices (2 bytes each) cost only 12 extra bytes.',
      failMessage: 'Three things needed: 1) A Uint16Array of 6 indices [0,1,2, 1,3,2]. 2) A buffer bound to gl.ELEMENT_ARRAY_BUFFER with gl.bufferData. 3) gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0) instead of drawArrays.',
      outputHeight: 340,
    },

    // ── Cell 10: Extension — VAO + EBO together ───────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Extension: Wrap Everything in a VAO

The quad below works, but the attribute setup runs outside any VAO — meaning it would need to be repeated before every draw call in a multi-object scene.

Your task: wrap the buffer creation and attribute specification inside a VAO:
1. \`var vao = gl.createVertexArray()\`
2. \`gl.bindVertexArray(vao)\` — start recording
3. *(the existing buffer bind + vertexAttribPointer + enableVertexAttribArray stays here)*
4. \`gl.bindVertexArray(null)\` — stop recording
5. At draw time: \`gl.bindVertexArray(vao)\` before the draw call`,
      html: `<canvas id="cv" width="560" height="320" style="display:block;border-radius:8px;width:100%;max-width:560px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;padding:10px}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
if (!gl.createVertexArray) { document.body.innerHTML = '<p style="color:#f87171;font-family:monospace;padding:20px">WebGL 2 required for VAOs. Try Chrome or Firefox.</p>'; }
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, 'attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }');
gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, 'precision mediump float; void main() { gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0); }');
gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

// TODO 1: create a VAO
// var vao = gl.createVertexArray();
// TODO 2: gl.bindVertexArray(vao);  ← start recording

var positions = new Float32Array([-0.8, 0.8,  0.8, 0.8,  -0.8, -0.8,  0.8, -0.8]);
var indices = new Uint16Array([0, 1, 2,  1, 3, 2]);

var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

var ebo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// TODO 3: gl.bindVertexArray(null);  ← stop recording

// TODO 4: gl.bindVertexArray(vao);   ← restore state at draw time
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);`,
      solutionCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.07, 0.12, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, 'attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }');
gl.compileShader(vs);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, 'precision mediump float; void main() { gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0); }');
gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs);
gl.linkProgram(prog); gl.useProgram(prog);

var vao = gl.createVertexArray();
gl.bindVertexArray(vao);

var positions = new Float32Array([-0.8, 0.8,  0.8, 0.8,  -0.8, -0.8,  0.8, -0.8]);
var indices = new Uint16Array([0, 1, 2,  1, 3, 2]);

var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
var loc = gl.getAttribLocation(prog, 'aPosition');
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(loc);

var ebo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

gl.bindVertexArray(null);

gl.bindVertexArray(vao);
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);`,
      check: (code) => {
        const hasCreate = /createVertexArray/.test(code);
        const hasBind = /bindVertexArray\s*\(\s*vao/.test(code);
        const hasNull = /bindVertexArray\s*\(\s*null/.test(code);
        return hasCreate && hasBind && hasNull;
      },
      successMessage: '✓ VAO complete. You now have the full setup: VBO + EBO + VAO. This is exactly what Three.js does internally — BufferGeometry creates a VAO, setAttribute creates VBOs, setIndex creates the EBO. You are no longer guessing what Three.js is doing under the hood.',
      failMessage: 'Four steps: 1) gl.createVertexArray(). 2) gl.bindVertexArray(vao) before any buffer/attrib setup. 3) gl.bindVertexArray(null) after setup to stop recording. 4) gl.bindVertexArray(vao) again before the draw call to restore the state.',
      outputHeight: 340,
    },

    // ── Cell 11: Recap ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Recap — GPU Memory in Three Lines

**VBO** — Upload vertex data once. The GPU reads it every frame for free.
\`\`\`js
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...]), gl.STATIC_DRAW);
\`\`\`

**EBO** — Reuse shared vertices. Quads go from 6 vertices to 4. Meshes save 40–70%.
\`\`\`js
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 1,3,2]), gl.STATIC_DRAW);
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
\`\`\`

**VAO** — Record the attribute setup once. One bind call restores everything.
\`\`\`js
// Setup (once):  gl.bindVertexArray(vao); ... configure ... gl.bindVertexArray(null);
// Draw (every frame): gl.bindVertexArray(vao); gl.drawElements(...);
\`\`\`

#### Interleaved Layout Reference

| Floats per vertex | Stride (bytes) | Attribute | Size | Byte offset |
|:-----------------:|:--------------:|-----------|:----:|:-----------:|
| 2 | 8 | position XY | 2 | 0 |
| 5 | 20 | position XY | 2 | 0 |
| 5 | 20 | texcoord UV | 2 | 8 |
| 8 | 32 | position XYZ | 3 | 0 |
| 8 | 32 | normal XYZ | 3 | 12 |
| 8 | 32 | texcoord UV | 2 | 24 |

**Rule:** stride = total floats × 4. offset = preceding floats × 4.

#### Three.js Equivalence

| Raw WebGL | Three.js |
|-----------|----------|
| \`gl.createVertexArray()\` | \`new THREE.BufferGeometry()\` |
| \`gl.createBuffer() + bufferData\` | \`new THREE.BufferAttribute(arr, size)\` |
| \`gl.vertexAttribPointer()\` | Handled inside \`geo.setAttribute('position', attr)\` |
| \`gl.bindBuffer(ELEMENT_ARRAY_BUFFER)\` | \`geo.setIndex([...])\` |
| \`gl.drawElements()\` | \`renderer.render(scene, camera)\` |`,
    },

    // ── Cell 12: Next Lesson Teaser ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What's Next — Lesson 1-3: Per-Vertex Colour & Varyings

You can now put geometry on the GPU efficiently. The next step: give each vertex its own colour, and watch the GPU **interpolate** between them automatically across the triangle surface.

| Concept | What you will learn |
|---------|---------------------|
| **Varyings** | Pass data from the vertex shader to the fragment shader — each vertex sends a colour, the GPU blends between them per-pixel |
| **Multiple attributes** | A VBO with interleaved position + colour data — putting the stride/offset knowledge from this lesson to immediate use |
| **Colour interpolation** | Why barycentric interpolation is what gives the rainbow triangle its gradient — and why that is the same math used for UV texture coordinates |

*Up next: the rainbow triangle — and the mechanism behind every gradient, texture sample, and normal interpolation in 3D graphics.*`,
    },

  ],
};

export default {
  id: 'three-js-1-2-vertex-buffers',
  slug: 'vertex-buffers',
  chapter: 'three-js.1',
  order: 2,
  title: 'Vertex Buffers — VBO, EBO, VAO',
  subtitle: 'How geometry lives on the GPU: upload once, draw every frame, index to save memory.',
  tags: ['three-js', 'webgl', 'vbo', 'vao', 'ebo', 'buffer-geometry', 'vertex-data', 'gpu-memory', 'drawElements'],
  hook: {
    question: 'A character mesh has 50,000 triangles. Without index buffers, the GPU stores 150,000 vertex positions. With index buffers: ~25,000 unique positions + 150,000 two-byte indices. How much memory was saved — and how does WebGL remember which buffer goes with which attribute across 100 draw calls?',
    realWorldContext: 'VBO + EBO + VAO is the foundational GPU memory pattern. Unchanged since OpenGL 1.5 (2003) and OpenGL 3.0 (2008). Every 3D application — from game engines to CAD software to Three.js — uses this exact setup.',
  },
  intuition: {
    prose: [
      'GPU and CPU have separate memory. Data must be explicitly uploaded across the PCIe bus with gl.bufferData().',
      'VBO: a named block of GPU memory holding vertex attributes. Created once, read every frame.',
      'EBO: an index buffer. Stores small integers (Uint16) that reference vertices by position. drawElements uses it.',
      'VAO: records which VBOs map to which attributes with what stride/offset. One bind = full state restore.',
      'Interleaved layout: [x,y,u,v, x,y,u,v, ...]. stride = total bytes. offset = bytes before this attribute.',
    ],
    callouts: [
      { type: 'tip', title: 'STATIC_DRAW vs DYNAMIC_DRAW', body: 'gl.STATIC_DRAW hints to the driver that you will upload once and draw many times — it places the buffer in fast GPU memory. gl.DYNAMIC_DRAW hints at frequent updates — the driver may keep it in CPU-accessible memory for faster writes.' },
      { type: 'caution', title: 'VAO creation timing', body: 'Create VAOs once at startup. Bind each frame. Creating a VAO per frame forces the GPU driver to allocate and deallocate GPU objects inside the render loop — causing frame time spikes and GPU memory churn.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Vertex Buffers — VBO, EBO, VAO', props: { lesson: LESSON_3JS_1_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'VBO = GPU memory block. createBuffer → bindBuffer(ARRAY_BUFFER) → bufferData → vertexAttribPointer.',
    'EBO = index buffer. Uint16Array of indices. bindBuffer(ELEMENT_ARRAY_BUFFER) → bufferData. drawElements to use.',
    'VAO = remembered attrib state. createVertexArray → bindVertexArray → setup → bindVertexArray(null). Bind at draw time.',
    'Stride = floats-per-vertex × 4 bytes. Byte offset = preceding floats × 4. Always bytes, never floats.',
    'Three.js: BufferGeometry = VAO + VBOs. BufferAttribute = VBO + attrib spec. setIndex = EBO.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      question: 'A vertex has position XYZ (3 floats) and UV (2 floats). What is the stride and the byte offset for the UV attribute?',
      options: [
        'stride = 5, byteOffset = 3  (in floats)',
        'stride = 20 bytes, byteOffset = 12 bytes',
        'stride = 20 bytes, byteOffset = 3 bytes',
        'stride = 5 bytes, byteOffset = 12 bytes',
      ],
      answer: 1,
      explanation: 'vertexAttribPointer works in bytes. stride = 5 floats × 4 = 20. UV starts after 3 position floats: byteOffset = 3 × 4 = 12. The call: gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 20, 12).',
    },
    {
      question: 'What does gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0) read — and from where?',
      options: [
        'It reads 6 vertices directly from the ARRAY_BUFFER.',
        'It reads 6 indices from the ELEMENT_ARRAY_BUFFER, uses them to look up vertices from the ARRAY_BUFFER, and draws 2 triangles.',
        'It draws 6 triangles using the first vertex of each.',
        'It reads 6 floats from the ARRAY_BUFFER starting at byte offset 0.',
      ],
      answer: 1,
      explanation: 'drawElements reads count indices (here 6 Uint16 values) from the ELEMENT_ARRAY_BUFFER. Each index is a vertex number. The GPU fetches those vertices from the ARRAY_BUFFER using the attrib pointers. 6 indices in TRIANGLES mode = 2 triangles.',
    },
    {
      question: 'What is stored inside a VAO (Vertex Array Object)?',
      options: [
        'The actual vertex data bytes (the Float32Array).',
        'The shader program and uniform values.',
        'The attribute configuration: which VBOs are bound to which attribute locations, with what size/stride/offset.',
        'A list of draw calls to execute.',
      ],
      answer: 2,
      explanation: 'A VAO stores the attribute state: for each attribute location, which VBO is bound, how many components, what type, stride, and offset. It also remembers the ELEMENT_ARRAY_BUFFER binding. It does NOT store the vertex data itself — that lives in the VBO.',
    },
    {
      question: 'Three.js geometry.setIndex([0,1,2, 2,3,0]) is equivalent to which raw WebGL operations?',
      options: [
        'gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)',
        'gl.createBuffer() + gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf) + gl.bufferData(buf, new Uint16Array([0,1,2,2,3,0]))',
        'gl.vertexAttribPointer with size=6',
        'gl.drawArrays(gl.TRIANGLES, 0, 6)',
      ],
      answer: 1,
      explanation: 'geometry.setIndex() stores the indices in a BufferAttribute and when the geometry is first rendered, Three.js creates an ELEMENT_ARRAY_BUFFER, binds it, and uploads the data with bufferData. The drawElements call happens inside renderer.render().',
    },
  ],
};

export { LESSON_3JS_1_2 };
