// Three.js · Chapter 2 · Lesson 0
// Textures & UV Mapping

const LESSON_3JS_2_0 = {
  title: 'Textures & UV Mapping',
  subtitle: 'How images are mapped to 3D surfaces — wrapping, filtering, mipmaps, and UV animation.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Prerequisites & Local Setup

**Requires:** Lessons 1-1 through 1-5 (triangle, VBO, GLSL, uniforms, MVP). You should be comfortable with attributes and the sampler2D uniform type.

**What's new:** So far your geometry is all solid colours. Textures give triangles the appearance of complex, detailed surfaces using images stored on the GPU. This lesson covers the full texture pipeline — upload, sample, filter, wrap — and the UV coordinate system that maps every point on a surface to a point in an image.

---

### What You Will Learn

- What UV coordinates are and how they map 3D surface points to 2D image pixels
- Upload an image to the GPU: \`gl.createTexture → gl.texImage2D → gl.generateMipmap\`
- Wrapping modes: REPEAT (tiles), CLAMP_TO_EDGE (stretches border), MIRRORED_REPEAT
- Filtering: NEAREST (pixel art), LINEAR (smooth magnification), MIPMAP (correct minification)
- How mipmaps prevent aliasing — the Nyquist argument for textures
- UV animation: scrolling and tiling in the fragment shader for water/fire effects
- Three.js TextureLoader, texture.repeat, texture.offset, anisotropy`,
    },

    {
      type: 'markdown',
      instruction: `## Part 1 — UV Coordinates

A **UV coordinate** is a 2D address that maps a point on a 3D surface to a location in a texture image.

- **U** = horizontal axis, 0 (left) to 1 (right)
- **V** = vertical axis, 0 (bottom in OpenGL/WebGL) to 1 (top)

Every vertex in your geometry gets a UV pair stored as a vec2 attribute:

\`\`\`
Texture image           Triangle in 3D space
┌───────────┐           UV corners pinned to image positions
│           │
│   (u,v)   │           Vertex A → UV (0.5, 1.0) → top-centre of image
│           │           Vertex B → UV (0.0, 0.0) → bottom-left of image
└───────────┘           Vertex C → UV (1.0, 0.0) → bottom-right of image
(0,0) bottom-left  (1,1) top-right
\`\`\`

The rasteriser interpolates the UV pair across every fragment inside the triangle — exactly as it interpolates varyings. The fragment shader then uses \`texture(uTexture, vUv)\` to look up the colour at that interpolated position.

**Unwrapping** is the process of flattening a 3D surface to a 2D UV layout. A cube is unwrapped into a cross; a sphere into an atlas. UV mapping works regardless of shape — it is just an attribute like position or colour.

---

### The Sampling Equation

\`\`\`glsl
// Vertex shader
in vec2 aUv;
out vec2 vUv;   // pass to fragment shader
void main() {
  vUv = aUv;    // the rasteriser will interpolate this across the triangle
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader
uniform sampler2D uTexture;
in vec2 vUv;
out vec4 fragColor;
void main() {
  fragColor = texture(uTexture, vUv);   // lookup colour at interpolated UV
}
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### UV Visualiser — Pinning Vertices to a Texture

Click any vertex of the triangle to see its UV coordinates. Drag the UV pins (right panel) and watch the texture distort on the triangle. This is exactly what UV unwrapping tools do.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <div style="display:flex;gap:12px;width:100%;justify-content:center;">
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
      <div style="color:var(--color-text-secondary, #475569);font-family:monospace;font-size:10px;">3D Surface</div>
      <canvas id="cv3d" width="300" height="280" style="border-radius:8px;display:block;"></canvas>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
      <div style="color:var(--color-text-secondary, #475569);font-family:monospace;font-size:10px;">UV Space (drag pins)</div>
      <canvas id="cvUV" width="300" height="280" style="border-radius:8px;display:block;"></canvas>
    </div>
  </div>
  <div id="info" style="color:var(--color-text-secondary, #475569);font-family:monospace;font-size:10px;text-align:center;">Click a vertex to inspect its UV</div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var c3 = document.getElementById('cv3d');
var cUV = document.getElementById('cvUV');
var ctx3 = c3.getContext('2d');
var ctxUV = cUV.getContext('2d');
var W = 300, H = 280;

// Triangle vertices in NDC space (for 3D panel)
var TRI = [
  { px: W/2,    py: 30,    ux: 0.5, uy: 0.95, color: '#f87171' },   // top
  { px: 20,     py: H-20,  ux: 0.05,uy: 0.05, color: '#4ade80' },   // bottom-left
  { px: W-20,   py: H-20,  ux: 0.95,uy: 0.05, color: '#38bdf8' },   // bottom-right
];

var selected = null;
var dragging = null;
var UV_MARGIN = 25;
var UV_SIZE = W - UV_MARGIN * 2;

// Procedural checkerboard texture (drawn on offscreen canvas)
var texCanvas = document.createElement('canvas');
texCanvas.width = 128; texCanvas.height = 128;
var texCtx = texCanvas.getContext('2d');
for (var cy = 0; cy < 8; cy++) {
  for (var cx2 = 0; cx2 < 8; cx2++) {
    texCtx.fillStyle = (cx2 + cy) % 2 === 0 ? '#1e3a5f' : '#0f1f33';
    texCtx.fillRect(cx2*16, cy*16, 16, 16);
  }
}
// Draw colour gradient on top for better UV debugging
var grd = texCtx.createLinearGradient(0, 0, 128, 0);
grd.addColorStop(0, 'rgba(248,113,113,0.3)');
grd.addColorStop(1, 'rgba(56,189,248,0.3)');
texCtx.fillStyle = grd; texCtx.fillRect(0, 0, 128, 128);
var grd2 = texCtx.createLinearGradient(0, 0, 0, 128);
grd2.addColorStop(0, 'rgba(74,222,128,0.25)');
grd2.addColorStop(1, 'rgba(0,0,0,0)');
texCtx.fillStyle = grd2; texCtx.fillRect(0, 0, 128, 128);

function uvToCanvas(ux, uy) {
  return [UV_MARGIN + ux * UV_SIZE, UV_MARGIN + (1 - uy) * UV_SIZE];
}

function barycentric(px, py) {
  var [x0,y0] = [TRI[0].px, TRI[0].py];
  var [x1,y1] = [TRI[1].px, TRI[1].py];
  var [x2,y2] = [TRI[2].px, TRI[2].py];
  var denom = (y1-y2)*(x0-x2) + (x2-x1)*(y0-y2);
  var w0 = ((y1-y2)*(px-x2) + (x2-x1)*(py-y2)) / denom;
  var w1 = ((y2-y0)*(px-x2) + (x0-x2)*(py-y2)) / denom;
  var w2 = 1 - w0 - w1;
  return [w0, w1, w2];
}

function draw() {
  // ── 3D panel ──
  ctx3.clearRect(0,0,W,H);
  ctx3.fillStyle = '#0d1117'; ctx3.fillRect(0,0,W,H);

  // Fill triangle with texture lookup using barycentric interpolation
  var minX = Math.min(...TRI.map(v=>v.px)), maxX = Math.max(...TRI.map(v=>v.px));
  var minY = Math.min(...TRI.map(v=>v.py)), maxY = Math.max(...TRI.map(v=>v.py));

  for (var py = minY|0; py <= maxY|0; py++) {
    for (var px = minX|0; px <= maxX|0; px++) {
      var [w0,w1,w2] = barycentric(px, py);
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      var u = w0*TRI[0].ux + w1*TRI[1].ux + w2*TRI[2].ux;
      var v = w0*TRI[0].uy + w1*TRI[1].uy + w2*TRI[2].uy;
      var tx = Math.round(u * 127), ty = Math.round((1-v) * 127);
      var imgData = texCtx.getImageData(tx, ty, 1, 1).data;
      ctx3.fillStyle = 'rgb('+imgData[0]+','+imgData[1]+','+imgData[2]+')';
      ctx3.fillRect(px, py, 1, 1);
    }
  }

  // Draw triangle outline
  ctx3.strokeStyle = '#ffffff22'; ctx3.lineWidth = 1;
  ctx3.beginPath();
  TRI.forEach((v,i) => i===0 ? ctx3.moveTo(v.px,v.py) : ctx3.lineTo(v.px,v.py));
  ctx3.closePath(); ctx3.stroke();

  // Draw vertices
  TRI.forEach(function(v, i) {
    ctx3.fillStyle = v.color;
    ctx3.beginPath(); ctx3.arc(v.px, v.py, selected===i ? 8 : 6, 0, Math.PI*2); ctx3.fill();
    ctx3.fillStyle = '#1a1a2e';
    ctx3.font = 'bold 9px monospace'; ctx3.textAlign = 'center';
    ctx3.fillText('V'+i, v.px, v.py+3);
  });

  // ── UV panel ──
  ctxUV.clearRect(0,0,W,H);
  ctxUV.fillStyle = '#0d1117'; ctxUV.fillRect(0,0,W,H);

  // Draw texture as background
  ctxUV.drawImage(texCanvas, UV_MARGIN, UV_MARGIN, UV_SIZE, UV_SIZE);
  ctxUV.strokeStyle = '#334155'; ctxUV.lineWidth = 1;
  ctxUV.strokeRect(UV_MARGIN, UV_MARGIN, UV_SIZE, UV_SIZE);

  // Grid
  ctxUV.strokeStyle = '#ffffff11'; ctxUV.lineWidth = 0.5; ctxUV.setLineDash([3,3]);
  for (var g = 0.25; g < 1; g += 0.25) {
    var [gx] = uvToCanvas(g, 0); ctxUV.beginPath(); ctxUV.moveTo(gx, UV_MARGIN); ctxUV.lineTo(gx, UV_MARGIN+UV_SIZE); ctxUV.stroke();
    var [,gy] = uvToCanvas(0, g); ctxUV.beginPath(); ctxUV.moveTo(UV_MARGIN, gy); ctxUV.lineTo(UV_MARGIN+UV_SIZE, gy); ctxUV.stroke();
  }
  ctxUV.setLineDash([]);

  // UV labels
  ctxUV.fillStyle = '#334155'; ctxUV.font = '9px monospace'; ctxUV.textAlign = 'center';
  ctxUV.fillText('(0,0)', UV_MARGIN, UV_MARGIN + UV_SIZE + 12);
  ctxUV.fillText('(1,1)', UV_MARGIN + UV_SIZE, UV_MARGIN - 4);
  ctxUV.fillText('U →', UV_MARGIN + UV_SIZE/2, UV_MARGIN + UV_SIZE + 12);

  // Draw UV triangle
  ctxUV.strokeStyle = '#ffffff44'; ctxUV.lineWidth = 1;
  ctxUV.beginPath();
  TRI.forEach(function(v,i) {
    var [ux, uy] = uvToCanvas(v.ux, v.uy);
    i===0 ? ctxUV.moveTo(ux,uy) : ctxUV.lineTo(ux,uy);
  });
  ctxUV.closePath(); ctxUV.stroke();

  // UV pins
  TRI.forEach(function(v, i) {
    var [ux, uy] = uvToCanvas(v.ux, v.uy);
    ctxUV.fillStyle = v.color;
    ctxUV.beginPath(); ctxUV.arc(ux, uy, selected===i?9:7, 0, Math.PI*2); ctxUV.fill();
    ctxUV.fillStyle = '#1a1a2e'; ctxUV.font = 'bold 9px monospace'; ctxUV.textAlign = 'center';
    ctxUV.fillText('V'+i, ux, uy+3);
  });

  if (selected !== null) {
    var v = TRI[selected];
    document.getElementById('info').textContent =
      'V' + selected + ': 3D pos=('+v.px.toFixed(0)+','+v.py.toFixed(0)+')  UV=('+v.ux.toFixed(2)+', '+v.uy.toFixed(2)+')';
  }
}

c3.addEventListener('click', function(e) {
  var r = c3.getBoundingClientRect();
  var mx = (e.clientX-r.left)*(W/r.width), my = (e.clientY-r.top)*(H/r.height);
  selected = null;
  TRI.forEach(function(v,i) { if (Math.hypot(mx-v.px, my-v.py) < 14) selected = i; });
  draw();
});

cUV.addEventListener('mousedown', function(e) {
  var r = cUV.getBoundingClientRect();
  var mx = (e.clientX-r.left)*(W/r.width), my = (e.clientY-r.top)*(H/r.height);
  TRI.forEach(function(v,i) {
    var [ux,uy] = uvToCanvas(v.ux,v.uy);
    if (Math.hypot(mx-ux,my-uy) < 12) { dragging = i; selected = i; }
  });
});
cUV.addEventListener('mousemove', function(e) {
  if (dragging === null) return;
  var r = cUV.getBoundingClientRect();
  var mx = (e.clientX-r.left)*(W/r.width), my = (e.clientY-r.top)*(H/r.height);
  TRI[dragging].ux = Math.max(0, Math.min(1, (mx - UV_MARGIN) / UV_SIZE));
  TRI[dragging].uy = Math.max(0, Math.min(1, 1 - (my - UV_MARGIN) / UV_SIZE));
  draw();
});
cUV.addEventListener('mouseup', function() { dragging = null; });

draw();`,
      outputHeight: 380,
    },

    {
      type: 'challenge',
      instruction: `**UV wrapping:** A vertex's UV is \`(0.5, 1.0)\`. You scale the UVs by \`2.0\` in the shader: \`vUv * 2.0\`. The new UV is \`(1.0, 2.0)\`. The texture wrapping mode is \`CLAMP_TO_EDGE\`. What colour does the fragment shader sample?`,
      options: [
        { label: 'A', text: 'The colour at UV (0.0, 0.0) — wrapped back to the origin' },
        { label: 'B', text: 'The colour at UV (1.0, 1.0) — clamped to the top-right edge pixel' },
        { label: 'C', text: 'Transparent black — the UV is outside the valid range' },
        { label: 'D', text: 'The colour at UV (1.0, 0.0) — the V wraps but U clamps' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. CLAMP_TO_EDGE clamps out-of-range UVs to [0, 1] before sampling. (1.0, 2.0) clamps to (1.0, 1.0) — the top-right corner pixel of the texture. This mode is used when you want no tiling and no artefacts at the edges — the border pixel stretches to fill the rest.',
      failMessage: 'CLAMP_TO_EDGE: any UV component outside [0,1] is clamped to the nearest boundary. U=1.0 stays 1.0 (already at edge). V=2.0 clamps to V=1.0. Result: UV (1.0, 1.0) — the top-right corner texel of the image.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Uploading Textures to the GPU

The complete WebGL texture upload sequence:

\`\`\`js
// 1. Create a texture object on the GPU
var texture = gl.createTexture();

// 2. Bind it (all subsequent texture calls target this object)
gl.bindTexture(gl.TEXTURE_2D, texture);

// 3. Upload image data (can be HTMLImageElement, canvas, ImageData, or raw typed array)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//                            ^ mip level 0 (base)  ^ internal format  ^ source format

// 4. Generate mipmap chain (required for minification filtering)
gl.generateMipmap(gl.TEXTURE_2D);

// 5. Set wrapping mode (per axis)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);   // U axis
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);   // V axis

// 6. Set filtering
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // minification
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);               // magnification

// 7. Bind to a texture unit, then tell the sampler which unit to use
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.uniform1i(gl.getUniformLocation(prog, 'uTexture'), 0);  // sampler reads unit 0
\`\`\`

**Texture units:** WebGL has 8–32 texture units (hardware limit). You can bind different textures to different units and use multiple samplers in one shader. Activate with \`gl.activeTexture(gl.TEXTURE0 + n)\` before binding.

---

### Wrapping Mode Summary

| Mode | UV = 1.3 becomes | Visual effect |
|------|-----------------|---------------|
| \`REPEAT\` | 0.3 (fractional part) | Tiles indefinitely |
| \`CLAMP_TO_EDGE\` | 1.0 (clamped) | Border pixel stretches |
| \`MIRRORED_REPEAT\` | 0.7 (1 - frac = mirror) | Alternating mirror tiles |`,
    },

    {
      type: 'js',
      instruction: `### Texture Wrapping and Scrolling Demo

A procedurally generated texture on a quad. Change the wrapping mode and animate UV offset using a \`uTime\` uniform — the classic water/lava scrolling effect.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="580" height="320" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;font-family:monospace;font-size:11px;color:var(--color-text-secondary, #475569);">
    <div style="display:flex;gap:6px;align-items:center;">
      <span>Wrap:</span>
      <button class="wrapBtn" data-mode="repeat"   style="background:#1e2a3f;border:1px solid #38bdf8;color:#38bdf8;padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">REPEAT</button>
      <button class="wrapBtn" data-mode="clamp"    style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">CLAMP</button>
      <button class="wrapBtn" data-mode="mirror"   style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">MIRROR</button>
    </div>
    <div style="display:flex;gap:6px;align-items:center;">
      <span>Tile scale:</span>
      <input id="scale" type="range" min="0.5" max="4" step="0.5" value="2" style="width:80px">
      <span id="scaleV">2.0</span>
    </div>
    <div style="display:flex;gap:6px;align-items:center;">
      <span>Scroll speed:</span>
      <input id="scrollSpeed" type="range" min="0" max="2" step="0.1" value="0.3" style="width:80px">
      <span id="scrollV">0.3</span>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);

var wrapMode = 'repeat';
var tileScale = 2.0;
var scrollSpeed = 0.3;

// GLSL shaders
var VS = \`
  attribute vec2 aPos;
  attribute vec2 aUv;
  varying vec2 vUv;
  void main() { vUv = aUv; gl_Position = vec4(aPos, 0.0, 1.0); }
\`;
var FS = \`
  precision mediump float;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uScale;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * uScale;
    uv.x += uTime;   // scroll
    gl_FragColor = texture2D(uTex, uv);
  }
\`;

function sh(type, src) {
  var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
}
var prog = gl.createProgram();
gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog);
gl.useProgram(prog);

// Full-screen quad: x,y,u,v
var data = new Float32Array([
  -0.85, -0.9,  0,0,
   0.85, -0.9,  1,0,
   0.85,  0.9,  1,1,
  -0.85,  0.9,  0,1,
]);
var indices = new Uint16Array([0,1,2, 0,2,3]);
var vbuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
var ibuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

var posLoc = gl.getAttribLocation(prog, 'aPos');
var uvLoc  = gl.getAttribLocation(prog, 'aUv');
var timeLoc  = gl.getUniformLocation(prog, 'uTime');
var scaleLoc = gl.getUniformLocation(prog, 'uScale');

gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(uvLoc,  2, gl.FLOAT, false, 16, 8);
gl.enableVertexAttribArray(uvLoc);

// Create procedural checkerboard texture
var TEX_SIZE = 64;
var texData = new Uint8Array(TEX_SIZE * TEX_SIZE * 4);
for (var ty = 0; ty < TEX_SIZE; ty++) {
  for (var tx = 0; tx < TEX_SIZE; tx++) {
    var idx = (ty * TEX_SIZE + tx) * 4;
    var checker = ((tx >> 3) + (ty >> 3)) % 2;
    var t = tx / TEX_SIZE, s = ty / TEX_SIZE;
    texData[idx]   = checker ? 20 + t*60 : 30 + s*80;
    texData[idx+1] = checker ? 60 + s*60 : 30 + t*40;
    texData[idx+2] = checker ? 100 + t*80 : 80 + s*60;
    texData[idx+3] = 255;
  }
}

var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEX_SIZE, TEX_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, texData);
gl.generateMipmap(gl.TEXTURE_2D);
gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);

function setWrap() {
  var m = wrapMode === 'repeat' ? gl.REPEAT :
          wrapMode === 'clamp'  ? gl.CLAMP_TO_EDGE : gl.MIRRORED_REPEAT;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, m);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, m);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}
setWrap();

document.querySelectorAll('.wrapBtn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.wrapBtn').forEach(b => {
      b.style.borderColor = '#334155'; b.style.color = '#64748b';
    });
    this.style.borderColor = '#38bdf8'; this.style.color = '#38bdf8';
    wrapMode = this.dataset.mode; setWrap();
  });
});

document.getElementById('scale').oninput = function() {
  tileScale = parseFloat(this.value);
  document.getElementById('scaleV').textContent = tileScale.toFixed(1);
};
document.getElementById('scrollSpeed').oninput = function() {
  scrollSpeed = parseFloat(this.value);
  document.getElementById('scrollV').textContent = scrollSpeed.toFixed(1);
};

var t = 0, last = performance.now();
function loop() {
  var now = performance.now();
  t += (now - last) / 1000 * scrollSpeed;
  last = now;
  gl.clearColor(0.04,0.07,0.12,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(prog);
  gl.uniform1f(timeLoc, t);
  gl.uniform1f(scaleLoc, tileScale);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(loop);
}
loop();
console.log('Texture wrap demo running — try REPEAT vs CLAMP vs MIRROR');`,
      outputHeight: 400,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Filtering and Mipmaps

**The aliasing problem:** When a 512×512 texture is displayed in a 32×32 screen area, you must reduce 262,144 texels to 1,024 pixels. Without guidance, the GPU picks one arbitrary texel per pixel — creating shimmer and moiré patterns.

**Mipmaps** solve this by precomputing half-resolution versions of the texture at upload time:
\`\`\`
Level 0:  512×512  (original)
Level 1:  256×256
Level 2:  128×128
...
Level 9:    1×1   (single pixel average)
\`\`\`

The GPU selects the mip level whose texel density matches the screen-space coverage, then linearly blends between adjacent levels (trilinear filtering).

**Filtering mode comparison:**

| Mode | Min filter | Mag filter | Use case |
|------|-----------|-----------|----------|
| NEAREST | Nearest texel | Nearest texel | Pixel art, voxels — intentional pixelation |
| LINEAR | Nearest texel average | Bilinear | Smooth magnification, icons |
| NEAREST_MIPMAP_LINEAR | Nearest mip, nearest texel | — | Rare — saves bandwidth |
| LINEAR_MIPMAP_LINEAR | Trilinear — best quality | Bilinear | Default for 3D surfaces |

**Anisotropic filtering** corrects the blur that occurs when a surface is viewed at an oblique angle (like a floor receding into the distance). The GPU takes more samples along the anisotropy direction:

\`\`\`js
var ext = gl.getExtension('EXT_texture_filter_anisotropic');
if (ext) {
  var maxAniso = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
  gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
}
\`\`\`

In Three.js: \`texture.anisotropy = renderer.capabilities.getMaxAnisotropy()\``,
    },

    {
      type: 'js',
      instruction: `### Filter Comparator — See the Difference

Side-by-side: NEAREST (pixelated) vs LINEAR_MIPMAP_LINEAR (trilinear). The oblique floor quad exaggerates the difference between filtering modes. Try narrowing the canvas to simulate minification.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <div style="display:flex;gap:12px;width:100%;justify-content:center;">
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
      <div style="color:#f87171;font-family:monospace;font-size:10px;">NEAREST (pixelated)</div>
      <canvas id="cv1" width="270" height="220" style="border-radius:8px;display:block;"></canvas>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
      <div style="color:#4ade80;font-family:monospace;font-size:10px;">LINEAR_MIPMAP_LINEAR (trilinear)</div>
      <canvas id="cv2" width="270" height="220" style="border-radius:8px;display:block;"></canvas>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `// Create the same scene in two WebGL contexts with different filter modes
var VS = \`
  attribute vec2 aPos; attribute vec2 aUv; varying vec2 vUv;
  void main() { vUv = aUv; gl_Position = vec4(aPos, 0.0, 1.0); }
\`;
var FS = \`
  precision mediump float; uniform sampler2D uTex; varying vec2 vUv;
  void main() { gl_FragColor = texture2D(uTex, vUv); }
\`;

// Perspective floor quad UVs — extreme tiling on far end shows filter difference
var floorData = new Float32Array([
  -0.95, -0.9,   0.0,  0.0,
   0.95, -0.9,   8.0,  0.0,
   0.3,   0.8,   4.0,  8.0,
  -0.3,   0.8,   4.0,  8.0,
]);
var floorIdx = new Uint16Array([0,1,2, 0,2,3]);

// Procedural checker texture
var SZ = 128;
var texData = new Uint8Array(SZ * SZ * 4);
for (var y = 0; y < SZ; y++) {
  for (var x = 0; x < SZ; x++) {
    var i = (y * SZ + x) * 4;
    var ch = ((x >> 4) + (y >> 4)) % 2;
    texData[i]   = ch ? 30 : 180;
    texData[i+1] = ch ? 30 : 180;
    texData[i+2] = ch ? 60 : 200;
    texData[i+3] = 255;
  }
}

function setup(canvasId, minFilter) {
  var canvas = document.getElementById(canvasId);
  var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  gl.viewport(0, 0, canvas.width, canvas.height);

  function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; }
  var prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog); gl.useProgram(prog);

  var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, floorData, gl.STATIC_DRAW);
  var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, floorIdx, gl.STATIC_DRAW);

  var pL = gl.getAttribLocation(prog,'aPos'), uL = gl.getAttribLocation(prog,'aUv');
  gl.vertexAttribPointer(pL, 2, gl.FLOAT, false, 16, 0); gl.enableVertexAttribArray(pL);
  gl.vertexAttribPointer(uL, 2, gl.FLOAT, false, 16, 8); gl.enableVertexAttribArray(uL);

  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SZ, SZ, 0, gl.RGBA, gl.UNSIGNED_BYTE, texData);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(prog,'uTex'), 0);

  gl.clearColor(0.04,0.07,0.12,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

setup('cv1', /* NEAREST */ 9728);
setup('cv2', /* LINEAR_MIPMAP_LINEAR */ 9987);

console.log('Left: NEAREST — right: LINEAR_MIPMAP_LINEAR');
console.log('Notice the shimmer/aliasing on the left vs smooth on the right');`,
      outputHeight: 320,
    },

    {
      type: 'challenge',
      instruction: `**Mipmap aliasing:** A 512×512 checkerboard texture is mapped to a surface that appears as a 16×16 pixel square on screen. Without mipmapping, what visual artefact appears and why?`,
      options: [
        { label: 'A', text: 'The texture appears blurry — too much averaging of texels' },
        { label: 'B', text: 'Shimmer and moiré — the GPU picks one of 1024 available texels per output pixel at random, sampling different texels every frame as the object moves' },
        { label: 'C', text: 'The texture disappears entirely — minification hides the texture' },
        { label: 'D', text: 'The checkerboard pattern appears correct at smaller scale' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. At 32:1 minification (512px → 16px), the GPU must pick one texel from a 32×32 block. Without mipmaps, NEAREST picks the same arbitrary point each frame — but as the surface moves by even 0.1 pixels, that sample point can jump across the entire 32×32 block, aliasing to a completely different colour. Mipmaps precompute the average, giving a stable result.',
      failMessage: 'Minification = many texels → few pixels. Without mipmaps, each output pixel samples one texel from a large neighborhood. Sub-pixel movement causes the sample to jump across the texture, aliasing into different colours each frame = shimmer. Mipmaps precompute level-appropriate averages to prevent this.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 4 — Three.js Texture API

\`\`\`js
// Load from a URL (async)
var loader = new THREE.TextureLoader();
var texture = loader.load('path/to/image.jpg', function(tex) {
  // tex is ready — trigger a render if needed
});

// Wrapping
texture.wrapS = THREE.RepeatWrapping;      // U axis — REPEAT
texture.wrapT = THREE.MirroredRepeatWrapping; // V axis — MIRROR

// Tiling and offset (in UV units)
texture.repeat.set(4, 4);     // tile 4× in each direction
texture.offset.set(0.5, 0);   // shift 0.5 in U direction

// Filtering
texture.minFilter = THREE.LinearMipMapLinearFilter;  // trilinear (default)
texture.magFilter = THREE.LinearFilter;              // bilinear

// Anisotropy
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Using in ShaderMaterial
var mat = new THREE.ShaderMaterial({
  uniforms: { uTexture: { value: texture } },
  vertexShader: \`
    varying vec2 vUv;
    void main() {
      vUv = uv;   // Three.js provides 'uv' attribute automatically
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \`,
  fragmentShader: \`
    uniform sampler2D uTexture;
    varying vec2 vUv;
    void main() {
      gl_FragColor = texture2D(uTexture, vUv);
    }
  \`,
});

// UV animation — scroll in vertex shader or multiply in fragment shader:
// vUv = uv * tileScale + vec2(uTime * scrollSpeed, 0.0);
\`\`\`

**Three.js auto-provided UV attribute:** In standard geometries (\`PlaneGeometry\`, \`BoxGeometry\`, etc.), Three.js automatically includes a \`uv\` attribute. In ShaderMaterial, you can access it as \`attribute vec2 uv\` or just \`uv\` (it is pre-declared in Three.js's common GLSL chunks).`,
    },

    {
      type: 'challenge',
      instruction: `**Three.js UV scrolling:** You want to make a water surface where the texture scrolls in the X direction over time. In Three.js ShaderMaterial, which approach is correct?`,
      options: [
        { label: 'A', text: "texture.offset.x = clock.getElapsedTime() * 0.1 — update the texture offset each frame" },
        { label: 'B', text: "In the vertex shader: vUv = uv + vec2(uTime * 0.1, 0.0); — shift UV per frame via uniform" },
        { label: 'C', text: "Both A and B produce the same scrolling effect, just different implementation layers" },
        { label: 'D', text: "texture.repeat.x = clock.getElapsedTime() — increasing tile count scrolls the texture" },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Both work — they just operate at different layers. texture.offset shifts the UV lookup on the CPU side before rendering (Three.js uploads the texture matrix). The shader approach shifts in GLSL on the GPU per-fragment. The GPU approach is more flexible (per-vertex variation, arbitrary math) but either is valid for simple uniform scrolling.',
      failMessage: 'Both texture.offset.x update and shader-based UV shift produce the same visual result — scrolling. texture.offset updates the texture\'s UV transform matrix (Three.js uploads it as a uniform). Shader approach does the same math in GLSL. The difference is where the math happens, not what it produces.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

  ],
};

export default {
  id: 'three-js-2-0-textures',
  slug: 'textures-and-uv-mapping',
  chapter: 'three-js.2',
  order: 0,
  title: 'Textures & UV Mapping',
  subtitle: 'How images are mapped to 3D surfaces — wrapping, filtering, mipmaps, and UV animation.',
  tags: ['three-js', 'webgl', 'textures', 'uv-mapping', 'mipmaps', 'filtering', 'sampler2d', 'wrapping'],
  hook: {
    question: 'A triangle has 3 vertices. A texture has 4 million pixels. How does the GPU decide which pixel colour appears at any given point inside the triangle — without reading all 4 million pixels?',
    realWorldContext: 'Ed Catmull invented UV texture mapping in his 1974 PhD thesis to give computer-generated hands realistic knuckle creases. The same algorithm now makes every photorealistic surface in games, films, and AR — unchanged after 50 years.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'UV = a 2D coordinate (u,v) ∈ [0,1] per vertex that addresses a point in the texture image.',
      'The rasteriser interpolates UV across the triangle — the fragment shader calls texture(uTex, vUv).',
      'Wrapping: REPEAT tiles, CLAMP_TO_EDGE stretches, MIRRORED_REPEAT mirrors.',
      'Filtering: NEAREST = pixelated. LINEAR = smooth. LINEAR_MIPMAP_LINEAR = correct minification.',
      'Mipmaps: precomputed half-res levels. GPU picks the right level — no shimmer, no aliasing.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Always Generate Mipmaps',
        body: 'Skipping gl.generateMipmap() with a LINEAR_MIPMAP_* filter causes the texture to appear black — a common beginner mistake. Three.js calls generateMipmaps by default. For raw WebGL, always call it after texImage2D unless you are using CLAMP_TO_EDGE with NEAREST/LINEAR filtering exclusively.',
      },
      {
        type: 'tip',
        title: 'When to Use NEAREST',
        body: 'NEAREST filtering is intentional for pixel art, voxel games (Minecraft), retro aesthetics, and data textures (lookup tables where interpolation would corrupt the data). For anything photorealistic, use LINEAR_MIPMAP_LINEAR.',
      },
    ],
    visualizations: [
      { id: 'JSNotebook', title: 'Textures & UV Mapping', props: { lesson: LESSON_3JS_2_0 } },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'UV (0,0) = bottom-left of texture in WebGL. UV (1,1) = top-right.',
    'Upload: createTexture → bindTexture → texImage2D(image) → generateMipmap',
    'Wrapping: REPEAT tiles, CLAMP_TO_EDGE stretches edge pixel, MIRRORED_REPEAT mirrors.',
    'Filtering: NEAREST = pixelated. LINEAR_MIPMAP_LINEAR = trilinear, best quality.',
    'Three.js: TextureLoader().load() → uniforms.uTex.value = tex → texture(uTex, vUv) in GLSL.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_2_0 };
