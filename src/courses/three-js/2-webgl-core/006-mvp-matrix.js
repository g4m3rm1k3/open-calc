// Three.js · Chapter 1 · Lesson 5
// Transformations & the MVP Matrix

const LESSON_3JS_1_5 = {
  title: 'Transformations & the MVP Matrix',
  subtitle: 'The mathematical pipeline that places objects in the world and projects them onto screen.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Prerequisites & Local Setup

**Requires:** Lessons 1-1 through 1-4 (triangle, VBO, GLSL, attributes & uniforms). You should be comfortable setting mat4 uniforms.

**What's new:** Your triangle so far lives in NDC — a fixed clip-space box. This lesson introduces the three matrices that transform object coordinates all the way to screen pixels: **Model**, **View**, and **Projection**. After this lesson you will understand \`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)\` — the single most important line in all of 3D graphics.

---

### What You Will Learn

- Why one matrix is never enough — the three separate concerns of 3D rendering
- Construct a **Model matrix** (TRS — translation × rotation × scale)
- Derive the **View matrix** from a camera position and look-target (the lookAt formula)
- Build a **Perspective Projection matrix** from FOV, aspect, near, and far
- Chain them: \`MVP = Projection × View × Model\`
- Understand what visually breaks when each matrix is absent
- Read Three.js camera properties and connect them to the raw math`,
    },

    {
      type: 'markdown',
      instruction: `## Part 1 — The Three Concerns

Imagine placing a chair photograph in a room, then photographing the room with a camera:

1. **Model matrix (M)** — "where is the chair, how is it rotated, how big is it?" — transforms the chair from its own local coordinate system (origin at its base) into the world.
2. **View matrix (V)** — "where is the camera and what is it looking at?" — transforms the entire world so the camera is at the origin looking down −Z. A camera move is a whole-world counter-move.
3. **Projection matrix (P)** — "what focal length? wide angle or telephoto?" — compresses the 3D frustum into the unit cube. This is where perspective (distant things appear smaller) comes from.

**The vertex shader equation:**
\`\`\`glsl
gl_Position = P × V × M × vec4(localPosition, 1.0);
\`\`\`

Three.js writes it as:
\`\`\`glsl
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// where modelViewMatrix = viewMatrix × modelMatrix (pre-multiplied by Three.js)
\`\`\`

**Column-major convention:** WebGL (following OpenGL) stores matrices in column-major order. Multiplication applies right-to-left: M transforms first, then V, then P. This is mathematically identical to the more natural left-to-right reading if you write the matrices in the opposite order.

---

### The Model Matrix — TRS

Three transforms compose into a single 4×4 matrix:

\`\`\`
M = Translation × Rotation × Scale
\`\`\`

Apply in this order (right-to-left): scale the object first, rotate it, then translate it. Scaling after rotating shears the object; rotating after translating orbits it rather than spinning in place.

\`\`\`
Scale(sx,sy,sz):        Rotate-Y(θ):              Translate(tx,ty,tz):
┌ sx  0  0  0 ┐        ┌ cos θ  0  sin θ  0 ┐    ┌ 1  0  0  tx ┐
│  0 sy  0  0 │        │  0     1   0     0 │    │ 0  1  0  ty │
│  0  0 sz  0 │        │-sin θ  0  cos θ  0 │    │ 0  0  1  tz │
└  0  0  0  1 ┘        └  0     0   0     1 ┘    └ 0  0  0   1 ┘
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Transform Visualiser — Build the Model Matrix

Drag the sliders to translate, rotate, and scale a rectangle. The 4×4 Model matrix updates live. Watch how the composition order (S→R→T) affects the result.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="680" height="380" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;width:100%;max-width:640px;font-family:monospace;font-size:11px;color:var(--color-text-secondary, #475569);">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <label>Translate X: <span id="txV">0.0</span></label>
      <input id="tx" type="range" min="-1.5" max="1.5" step="0.05" value="0">
      <label>Translate Y: <span id="tyV">0.0</span></label>
      <input id="ty" type="range" min="-1.5" max="1.5" step="0.05" value="0">
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;">
      <label>Rotate Z (°): <span id="rzV">0</span></label>
      <input id="rz" type="range" min="-180" max="180" step="1" value="0">
      <label style="margin-top:8px;">Scale: <span id="scV">1.0</span></label>
      <input id="sc" type="range" min="0.1" max="2.5" step="0.05" value="1">
    </div>
    <div id="matrix" style="background:#0f172a;border-radius:6px;padding:8px;font-size:10px;color:#38bdf8;white-space:pre;line-height:1.6;"></div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

function getVal(id) { return parseFloat(document.getElementById(id).value); }

function updateMatrix() {
  var tx = getVal('tx'), ty = getVal('ty');
  var rz = getVal('rz') * Math.PI / 180;
  var sc = getVal('sc');
  var c = Math.cos(rz), s = Math.sin(rz);

  // Model matrix = T × R × S (column-major, but displayed row-major for readability)
  var m = [
    sc*c,  sc*s, 0, 0,   // column 0
    -sc*s, sc*c, 0, 0,   // column 1
    0,     0,    1, 0,   // column 2
    tx,    ty,   0, 1,   // column 3 (translation)
  ];

  document.getElementById('txV').textContent = tx.toFixed(2);
  document.getElementById('tyV').textContent = ty.toFixed(2);
  document.getElementById('rzV').textContent = getVal('rz');
  document.getElementById('scV').textContent = sc.toFixed(2);

  // Display as 4×4 (row-major for human readability)
  var matEl = document.getElementById('matrix');
  matEl.textContent = 'Model Matrix (M):\n' + [
    [sc*c, -sc*s, 0, tx],
    [sc*s,  sc*c, 0, ty],
    [0,     0,    1, 0 ],
    [0,     0,    0, 1 ],
  ].map(row => row.map(v => v.toFixed(2).padStart(6)).join(' ')).join('\n');

  return { tx, ty, rz, sc, c, s };
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  var { tx, ty, rz, sc, c, s } = updateMatrix();

  // NDC to canvas coordinates
  var cx = W * 0.42, cy = H * 0.52, scale = 110;
  function ndcToCanvas(x, y) { return [cx + x * scale, cy - y * scale]; }

  // Draw axes
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(cx - 200, cy); ctx.lineTo(cx + 200, cy);
  ctx.moveTo(cx, cy - 180); ctx.lineTo(cx, cy + 180); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#1e293b'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('NDC space', cx, cy - 155);

  // Draw original (grey) rectangle
  var origVerts = [[-0.2, -0.15], [0.2, -0.15], [0.2, 0.15], [-0.2, 0.15]];
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  ctx.beginPath();
  origVerts.forEach(function([x, y], i) {
    var [px, py] = ndcToCanvas(x, y);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);

  // Apply model matrix to vertices and draw
  function transform(x, y) {
    return [c * x * sc - s * y * sc + tx, s * x * sc + c * y * sc + ty];
  }
  var transformed = origVerts.map(([x, y]) => transform(x, y));

  ctx.fillStyle = '#38bdf822';
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.setLineDash([]);
  ctx.beginPath();
  transformed.forEach(function([x, y], i) {
    var [px, py] = ndcToCanvas(x, y);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Draw local axes of the transformed object
  var [ox, oy] = ndcToCanvas(...transform(0, 0));
  var [xx, xy] = ndcToCanvas(...transform(0.25 * sc, 0));
  var [yx, yy] = ndcToCanvas(...transform(0, 0.25 * sc));
  ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(xx, xy); ctx.stroke();
  ctx.strokeStyle = '#4ade80';
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(yx, yy); ctx.stroke();

  // Legend
  ctx.font = '10px monospace'; ctx.textAlign = 'left';
  ctx.fillStyle = '#38bdf8'; ctx.fillText('Transformed', W * 0.67, 30);
  ctx.fillStyle = '#1e293b'; ctx.fillStyle = '#475569'; ctx.fillText('Original', W * 0.67, 44);
  ctx.fillStyle = '#f87171'; ctx.fillText('Local +X axis', W * 0.67, 58);
  ctx.fillStyle = '#4ade80'; ctx.fillText('Local +Y axis', W * 0.67, 72);

  requestAnimationFrame(draw);
}
draw();

['tx','ty','rz','sc'].forEach(function(id) {
  document.getElementById(id).addEventListener('input', function() {});
});`,
      outputHeight: 460,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — The View Matrix: The Camera Inverse

The GPU has no concept of a "camera". It only knows how to transform vertices. The trick: instead of moving the camera toward an object, we move the entire world away from the camera.

**The View matrix is the inverse of the camera's world matrix.**

If the camera is at position \`(0, 2, 5)\` looking at the origin, the View matrix translates the world by \`(0, -2, -5)\` so the camera ends up at the origin. All geometry follows.

**The lookAt formula** — given \`eye\` (camera position), \`target\` (where to look), and \`worldUp\` (usually \`(0,1,0)\`):

\`\`\`
forward = normalize(eye - target)           // camera looks down -forward
right   = normalize(cross(worldUp, forward)) // camera's right direction
up      = cross(forward, right)              // camera's true up

         ┌ right.x    right.y    right.z    -dot(right, eye)  ┐
V =      │ up.x       up.y       up.z       -dot(up, eye)     │
         │ forward.x  forward.y  forward.z  -dot(forward,eye) │
         └ 0          0          0           1                 ┘
\`\`\`

The dot products at the right encode the translation: "how far along this axis is the camera from the origin?"

**In Three.js:** \`camera.lookAt(target)\` builds exactly this matrix internally. \`camera.matrixWorldInverse\` is the View matrix V.`,
    },

    {
      type: 'js',
      instruction: `### Camera Laboratory — Build the View Matrix Live

Drag the camera and target positions. The lookAt View matrix updates in real time. The right panel shows the resulting scene perspective.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="680" height="400" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="color:var(--color-text-secondary, #475569);font-family:monospace;font-size:10px;">Drag the blue dot (camera) or green dot (target) in the top-down view</div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var cam = { x: 2.0, y: 3.0 };  // top-down (X,Z) world position
var tgt = { x: 0.0, y: 0.0 };  // target point
var dragging = null;

// Normalize a 2D vector
function norm2(v) {
  var len = Math.sqrt(v.x*v.x + v.y*v.y) || 0.0001;
  return { x: v.x/len, y: v.y/len };
}
function dot2(a, b) { return a.x*b.x + a.y*b.y; }

function computeViewMatrix(camX, camZ, tgtX, tgtZ) {
  // Simplified 2D lookAt (Y is fixed up; this gives us X and Z view axes)
  var fx = tgtX - camX, fz = tgtZ - camZ;
  var fl = Math.sqrt(fx*fx + fz*fz) || 0.001;
  fx /= fl; fz /= fl;
  // right = cross(up, forward) where up=(0,1,0) → right.x = fz, right.z = -fx
  var rx = fz, rz = -fx;
  var tx = -(rx*camX + rz*camZ);
  var tz = -(fx*camX + fz*camZ);
  return { rx, rz, fx, fz, tx, tz };
}

var TOP_CX = 200, TOP_CY = 200, TOP_SCALE = 55;
var SCN_X = 380, SCN_W = 280, SCN_H = 360;

function worldToTop(wx, wz) {
  return [TOP_CX + wx * TOP_SCALE, TOP_CY + wz * TOP_SCALE];
}

// 3 cubes at world positions
var OBJECTS = [
  { x:  0,  z: -1, color: '#f87171' },
  { x: -1.5, z: 0.5, color: '#4ade80' },
  { x:  1.5, z: 0.5, color: '#38bdf8' },
];

function projectToView(wx, wz, V) {
  // Transform world to view space (ignore Y for this 2D demo)
  var vx = V.rx * wx + V.rz * wz + V.tx;
  var vz = V.fx * wx + V.fz * wz + V.tz;
  return { vx, vz };
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  var V = computeViewMatrix(cam.x, cam.y, tgt.x, tgt.y);

  // ── Top-down view ──
  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(10, 10, TOP_CX*2 - 20, H-20, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('Top-Down (World XZ)', TOP_CX, 26);

  // Grid
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5; ctx.setLineDash([2,2]);
  for (var g = -3; g <= 3; g++) {
    var [x1, y1] = worldToTop(g, -3), [x2, y2] = worldToTop(g, 3);
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    [x1, y1] = worldToTop(-3, g); [x2, y2] = worldToTop(3, g);
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Objects
  OBJECTS.forEach(function(o) {
    var [px, py] = worldToTop(o.x, o.z);
    ctx.fillStyle = o.color + '55'; ctx.strokeStyle = o.color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(px-12, py-12, 24, 24); ctx.fill(); ctx.stroke();
  });

  // Camera look direction
  var cx2 = worldToTop(cam.x, cam.y);
  var tx2 = worldToTop(tgt.x, tgt.y);
  ctx.strokeStyle = '#c084fc55'; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(cx2[0], cx2[1]); ctx.lineTo(tx2[0], tx2[1]); ctx.stroke();
  ctx.setLineDash([]);

  // FOV cone
  var fwd = norm2({ x: tgt.x - cam.x, y: tgt.y - cam.y });
  var halfFov = 35 * Math.PI / 180;
  var coneLen = 120;
  function rotated(dx, dy, angle) { return [dx*Math.cos(angle)-dy*Math.sin(angle), dx*Math.sin(angle)+dy*Math.cos(angle)]; }
  var [lx, ly] = rotated(fwd.x, fwd.y, -halfFov);
  var [rx, ry] = rotated(fwd.x, fwd.y,  halfFov);
  ctx.fillStyle = '#c084fc11';
  ctx.beginPath();
  ctx.moveTo(cx2[0], cx2[1]);
  ctx.lineTo(cx2[0] + lx*coneLen, cx2[1] + ly*coneLen);
  ctx.lineTo(cx2[0] + rx*coneLen, cx2[1] + ry*coneLen);
  ctx.closePath(); ctx.fill();

  // Camera dot
  ctx.fillStyle = '#818cf8'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx2[0], cx2[1], 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
  ctx.fillText('CAM', cx2[0], cx2[1]+13);

  // Target dot
  ctx.fillStyle = '#4ade80'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(tx2[0], tx2[1], 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillText('TGT', tx2[0], tx2[1]+13);

  // ── Right: Scene from camera ──
  ctx.fillStyle = '#070d18'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(SCN_X, 10, SCN_W, H-20, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('Scene from Camera', SCN_X + SCN_W/2, 26);

  // Project objects
  var SX = SCN_X + SCN_W/2, SY = 10 + (H-20)/2 + 20;
  OBJECTS.forEach(function(o) {
    var vp = projectToView(o.x, o.z, V);
    if (vp.vz > -0.5) return; // behind camera
    var projX = vp.vx / (-vp.vz) * 120;
    var projY = 0;
    var size = 30 / (-vp.vz);
    var px = SX + projX, py = SY + projY;
    ctx.fillStyle = o.color + '88'; ctx.strokeStyle = o.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.rect(px - size/2, py - size*0.8, size, size*1.2);
    ctx.fill(); ctx.stroke();
  });

  // View matrix display
  ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(SCN_X + 10, H-110, SCN_W-20, 95, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#38bdf8'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
  ctx.fillText('View Matrix (lookAt):', SCN_X+18, H-94);
  var rows = [
    [V.rx.toFixed(2), V.rz.toFixed(2), '0.00', V.tx.toFixed(2)],
    ['0.00', '1.00', '0.00', '0.00'],
    [V.fx.toFixed(2), V.fz.toFixed(2), '0.00', V.tz.toFixed(2)],
    ['0.00', '0.00', '0.00', '1.00'],
  ];
  ctx.fillStyle = '#94a3b8';
  rows.forEach(function(row, i) {
    ctx.fillText(row.map(v => v.padStart(6)).join(' '), SCN_X+18, H-78 + i*14);
  });
}

function getMousePos(e) {
  var r = canvas.getBoundingClientRect();
  return {
    mx: (e.clientX - r.left) * (W / r.width),
    my: (e.clientY - r.top) * (H / r.height),
  };
}

function worldPosFromMouse(mx, my) {
  return { x: (mx - TOP_CX) / TOP_SCALE, y: (my - TOP_CY) / TOP_SCALE };
}

canvas.addEventListener('mousedown', function(e) {
  var { mx, my } = getMousePos(e);
  var [cx, cy] = worldToTop(cam.x, cam.y);
  var [tx, ty] = worldToTop(tgt.x, tgt.y);
  if (Math.hypot(mx-cx, my-cy) < 12) dragging = 'cam';
  else if (Math.hypot(mx-tx, my-ty) < 10) dragging = 'tgt';
});
canvas.addEventListener('mousemove', function(e) {
  if (!dragging) return;
  var { mx, my } = getMousePos(e);
  var pos = worldPosFromMouse(mx, my);
  if (dragging === 'cam') { cam.x = pos.x; cam.y = pos.y; }
  else { tgt.x = pos.x; tgt.y = pos.y; }
});
canvas.addEventListener('mouseup', function() { dragging = null; });

(function loop() { draw(); requestAnimationFrame(loop); })();`,
      outputHeight: 450,
    },

    {
      type: 'challenge',
      instruction: `**View matrix translation:** The camera is at world position \`(0, 0, 5)\` looking at the origin. The View matrix must transform this camera position to the origin. What is the translation component of the View matrix (the rightmost column)?`,
      options: [
        { label: 'A', text: '(0, 0, 5) — same as the camera position' },
        { label: 'B', text: '(0, 0, -5) — the negated camera position' },
        { label: 'C', text: '(0, 0, 0) — the origin, because the camera is the origin' },
        { label: 'D', text: '(0, 5, 0) — the camera height' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The View matrix moves the entire world in the opposite direction of the camera. A camera at (0,0,5) requires translating the world by (0,0,-5) so everything "slides" toward the camera. This is why the View matrix is the inverse of the camera\'s world transform — inverting a translation negates it.',
      failMessage: 'The View matrix = inverse of camera world matrix. Inverting a pure translation matrix negates the translation vector. Camera at (0,0,5) → View translation is (0,0,-5). The effect: all world geometry moves -5 units in Z, placing the camera at the origin looking down -Z.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — The Projection Matrix

The Projection matrix transforms from camera space to **clip space** — a unit cube where everything outside gets clipped. The GPU then divides by W (perspective divide) and applies the viewport transform to get screen pixels.

**Perspective projection** encodes four parameters:
- \`fovy\` — vertical field of view in radians
- \`aspect\` — width/height ratio
- \`near\` — nearest visible distance (must be > 0)
- \`far\` — farthest visible distance

\`\`\`
f = 1 / tan(fovy / 2)

┌ f/aspect    0         0                          0 ┐
│    0        f         0                          0 │
│    0        0   -(far+near)/(far-near)    -2·far·near/(far-near) │
└    0        0        -1                          0 ┘
\`\`\`

The \`−1\` in position \`[3][2]\` is what produces perspective. After matrix multiply, vertex W = −z_camera. The perspective divide (\`x/w, y/w\`) makes things at greater depth appear smaller.

**FOV intuition:** \`f = 1/tan(fov/2)\`. At 45° fov: \`f ≈ 2.41\`. At 90°: \`f = 1.0\`. Larger f = more zoom = narrower view. Smaller f = wider angle = more distortion at edges.

**Depth precision warning:** The depth buffer gets \`(near/far)²\` of its precision allocated to the near half of the frustum. Setting \`near = 0.001\` with \`far = 10000\` gives a ratio of \`10^{-7}\` — depth fighting is guaranteed on overlapping geometry. Rule: keep \`near/far < 10,000\`.`,
    },

    {
      type: 'js',
      instruction: `### Projection Explorer — FOV, Near, Far, and the Frustum

Adjust the sliders and watch the projection matrix values change. Toggle perspective vs orthographic to see the difference.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="680" height="380" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;width:100%;max-width:640px;font-family:monospace;font-size:11px;color:var(--color-text-secondary, #475569);">
    <div style="display:flex;flex-direction:column;gap:3px;">
      <label>FOV: <span id="fovV">75</span>°</label>
      <input id="fov" type="range" min="10" max="150" step="1" value="75">
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;">
      <label>Near: <span id="nearV">0.1</span></label>
      <input id="near" type="range" min="0.01" max="5" step="0.01" value="0.1">
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;">
      <label>Far: <span id="farV">100</span></label>
      <input id="far" type="range" min="10" max="500" step="5" value="100">
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start;">
      <label style="color:#94a3b8;">Mode:</label>
      <button id="toggle" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">Perspective</button>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var ortho = false;

document.getElementById('toggle').onclick = function() {
  ortho = !ortho;
  this.textContent = ortho ? 'Orthographic' : 'Perspective';
  this.style.color = ortho ? '#38bdf8' : '#94a3b8';
};

function getParams() {
  var fovDeg = parseFloat(document.getElementById('fov').value);
  var near = parseFloat(document.getElementById('near').value);
  var far  = parseFloat(document.getElementById('far').value);
  document.getElementById('fovV').textContent = fovDeg;
  document.getElementById('nearV').textContent = near.toFixed(2);
  document.getElementById('farV').textContent = far;
  return { fovDeg, near, far };
}

function drawFrustum(params, ortho) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);

  var { fovDeg, near, far } = params;
  var fovRad = fovDeg * Math.PI / 180;
  var aspect = 16/9;

  // ── Left: Frustum side view ──
  var OX = 55, OY = H/2, scale = 1.2;
  var maxFar = Math.min(far, 250) * scale;
  var nearH = near * Math.tan(fovRad/2) * 50;
  var farH  = ortho ? nearH : far * Math.tan(fovRad/2) * scale;

  // Camera eye
  ctx.fillStyle = '#818cf8';
  ctx.beginPath(); ctx.arc(OX, OY, 6, 0, Math.PI*2); ctx.fill();

  // Frustum shape
  ctx.fillStyle = '#818cf811'; ctx.strokeStyle = '#818cf855'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(OX, OY);
  ctx.lineTo(OX + maxFar, OY - farH);
  ctx.lineTo(OX + maxFar, OY + farH);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Near plane
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
  var nearX = OX + near * scale * 15;
  ctx.beginPath(); ctx.moveTo(nearX, OY - nearH); ctx.lineTo(nearX, OY + nearH); ctx.stroke();
  ctx.fillStyle = '#38bdf8'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
  ctx.fillText('near', nearX, OY - nearH - 4);

  // Far plane
  ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1;
  var farX = OX + maxFar;
  ctx.beginPath(); ctx.moveTo(farX, OY - farH); ctx.lineTo(farX, OY + farH); ctx.stroke();
  ctx.fillStyle = '#f87171'; ctx.fillText('far', farX, OY - farH - 4);

  // Objects at different depths
  var objs = [0.2, 0.4, 0.7, 1.0];
  objs.forEach(function(t) {
    var d = near + (far - near) * t;
    if (d > 250) return;
    var h = ortho ? nearH * 0.4 : d * Math.tan(fovRad/2) * scale * 0.3;
    var ox = OX + d * scale;
    if (ox > OX + maxFar) return;
    ctx.fillStyle = 'hsl(' + (t*240) + ',70%,60%)';
    ctx.beginPath(); ctx.rect(ox - 4, OY - h, 8, h*2); ctx.fill();
  });

  ctx.fillStyle = '#475569'; ctx.font = '9px monospace';
  ctx.fillText(ortho ? 'ORTHOGRAPHIC' : 'PERSPECTIVE', OX + maxFar/2, 22);

  // ── Right: Projection matrix ──
  var PX = W * 0.55;
  var f  = 1 / Math.tan(fovRad / 2);
  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(PX, 20, W - PX - 10, H - 30, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('Projection Matrix P', PX + (W-PX-10)/2, 36);

  var m00 = ortho ? 1/nearH : f / aspect;
  var m11 = ortho ? 1/nearH : f;
  var m22 = -(far + near) / (far - near);
  var m23 = ortho ? -(far + near) / (far - near) : -2 * far * near / (far - near);
  var m32 = ortho ? 0 : -1;

  var rows = [
    [m00.toFixed(3), '0', '0', '0'],
    ['0', m11.toFixed(3), '0', '0'],
    ['0', '0', m22.toFixed(3), m23.toFixed(3)],
    ['0', '0', m32.toFixed(0), '0'],
  ];

  ctx.fillStyle = '#38bdf8'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
  rows.forEach(function(row, i) {
    var rowStr = '[ ' + row.map(v => v.padStart(7)).join('  ') + ' ]';
    ctx.fillText(rowStr, PX + 14, 58 + i * 17);
  });

  ctx.fillStyle = '#475569'; ctx.font = '9px monospace';
  ctx.fillText('f = 1/tan(fov/2) = ' + f.toFixed(3), PX + 14, 130);
  ctx.fillText('aspect = ' + aspect.toFixed(2), PX + 14, 144);

  // Depth precision warning
  var ratio = near / far;
  ctx.fillStyle = ratio < 0.0001 ? '#f87171' : '#94a3b8';
  ctx.fillText('near/far = ' + ratio.toExponential(1), PX + 14, 162);
  if (ratio < 0.0001) ctx.fillText('⚠ depth fighting risk!', PX + 14, 176);
}

function loop() {
  drawFrustum(getParams(), ortho);
  requestAnimationFrame(loop);
}
loop();`,
      outputHeight: 460,
    },

    {
      type: 'challenge',
      instruction: `**FOV and zoom:** You change the field of view from 45° to 90°. What happens to the projection matrix value \`f = 1/tan(fov/2)\` and how does the scene visually appear?`,
      options: [
        { label: 'A', text: 'f increases from ~2.4 to higher — scene zooms in, objects look larger' },
        { label: 'B', text: 'f decreases from ~2.4 to 1.0 — scene zooms out, each object takes up less screen space' },
        { label: 'C', text: 'f does not change — FOV only affects the near/far clipping' },
        { label: 'D', text: 'f increases — scene zooms out because wider angle shows more' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. At 45°: f = 1/tan(22.5°) ≈ 2.41. At 90°: f = 1/tan(45°) = 1.0. A smaller f value in P[0][0] and P[1][1] means X and Y coordinates are divided by a smaller number — each object appears at a smaller fraction of the screen. That is zoom-out / wide-angle. A large telephoto f zooms in.',
      failMessage: 'f = 1/tan(fov/2). tan(22.5°) ≈ 0.41 → f ≈ 2.41. tan(45°) = 1.0 → f = 1.0. A larger fov → smaller f → less magnification → objects appear smaller → zoom out. The matrix term P[0][0] = f/aspect: halving f halves the horizontal scale of everything on screen.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 4 — MVP Disabled: What Breaks?

The fastest way to cement understanding is to remove each matrix and observe the result:

| Matrix removed | Visual result | Why |
|----------------|---------------|-----|
| Remove **M** | Object stuck at local origin, no rotation, scale = 1 | No world transform — local space IS clip space |
| Remove **V** | Camera effectively at origin looking down -Z, no orbit | No camera transform — world IS camera space |
| Remove **P** | No perspective depth (orthographic) — things don't get smaller with distance. FoV = 90° (NDC is a unit cube). Geometry is heavily distorted | No frustum-to-cube mapping |

## Three.js Equivalents

\`\`\`js
// Creating the camera (builds P):
var camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
// camera.projectionMatrix = the P matrix above

// Positioning/orienting the camera (builds V):
camera.position.set(2, 3, 5);
camera.lookAt(0, 0, 0);
// camera.matrixWorldInverse = the V matrix

// Positioning objects (builds M):
mesh.position.set(1, 0, -3);
mesh.rotation.y = Math.PI / 4;
mesh.scale.set(2, 2, 2);
// mesh.matrixWorld = the M matrix

// In ShaderMaterial — Three.js provides these automatically:
// uniform mat4 projectionMatrix;   // P
// uniform mat4 modelViewMatrix;    // V × M pre-multiplied
// gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
\`\`\``,
    },

    {
      type: 'challenge',
      instruction: `**MVP chain:** You have a mesh at world position \`(3, 0, 0)\`. The camera is at \`(0, 0, 5)\` looking at the origin. Without a Projection matrix (using identity instead), what happens to the rendered result compared to using a proper perspective matrix?`,
      options: [
        { label: 'A', text: 'The mesh disappears entirely because identity P clips everything' },
        { label: 'B', text: 'The mesh renders but with no perspective — it appears the same size regardless of distance, and the visible area is a unit NDC cube (-1 to 1 on each axis)' },
        { label: 'C', text: 'The mesh renders identically — P only affects the near/far clip planes, not size' },
        { label: 'D', text: 'The mesh renders larger because P normally shrinks geometry' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. An identity Projection matrix is an orthographic projection with a view volume of exactly NDC [-1,1]. Geometry at any depth appears the same size (no perspective divide effect). The FOV effectively becomes 90° with a 1:1 mapping between camera-space units and clip space. This is why removing P gives you a recognisable but distorted orthographic view.',
      failMessage: 'Identity P = no perspective divide (W stays 1.0 after multiply). Result: everything maps linearly from camera space to NDC — no depth-based shrinking, no FOV. Objects at distance 0.5 and distance 10 appear identical in size. The view volume is the unit cube in camera space.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

  ],
};

export default {
  id: 'three-js-1-5-mvp-matrix',
  slug: 'mvp-matrix',
  chapter: 'three-js.1',
  order: 5,
  title: 'Transformations & the MVP Matrix',
  subtitle: 'The mathematical pipeline that places objects in the world and projects them onto screen.',
  tags: ['three-js', 'webgl', 'mvp', 'model-matrix', 'view-matrix', 'projection-matrix', 'lookat', 'perspective', 'fov'],
  hook: {
    question: 'Your vertex shader outputs one thing: gl_Position. The correct output is produced by multiplying three 4×4 matrices together. What are those three matrices, what does each do — and what breaks visually when you remove any one of them?',
    realWorldContext: 'The MVP chain was formalised at Xerox PARC in the 1970s and has been the core of every 3D renderer since. OpenGL 3.2 in 2008 removed the built-in matrix stacks — forcing developers to manage MVP themselves. Three.js does this management. This lesson shows you what is inside.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'M (Model): TRS transform. Places object in world space. mesh.matrixWorld in Three.js.',
      'V (View): inverse of camera world matrix. lookAt(eye, target, up) constructs it.',
      'P (Projection): encodes FOV, aspect, near, far. Produces perspective depth.',
      'Order: P × V × M. Right-to-left: M applied first, then V, then P.',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Near Plane and Depth Fighting',
        body: 'The depth buffer distributes precision logarithmically. Setting near too small (like 0.001) wastes virtually all precision near the far plane. Rule: near/far ratio should be < 10,000. For outdoor scenes: near=0.5, far=5000. Never set near=0.',
      },
    ],
    visualizations: [
      { id: 'JSNotebook', title: 'Transformations & the MVP Matrix', props: { lesson: LESSON_3JS_1_5 } },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(localPosition, 1.0)',
    'Model: translation × rotation × scale. Built from mesh.position/rotation/scale.',
    'View = inverse(camera world matrix). Camera is always at origin in view space.',
    'Projection: encodes FOV, aspect, near, far. f = 1/tan(fov/2) — larger = more zoom.',
    'Three.js: PerspectiveCamera(fov, aspect, near, far) + camera.lookAt() = P and V. mesh.matrix = M.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(localPosition, 1.0)." Which matrix is applied to a vertex first?',
      options: [
        'The projection matrix — it runs first because it is leftmost',
        'The model matrix — matrices apply right-to-left, so the rightmost (model) transforms the local vertex into world space first',
        'The view matrix — cameras always process geometry before positioning it',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"View = inverse(camera world matrix)." A camera at position (0, 5, 10) looking at the origin. What does the view matrix do to the scene?',
      options: [
        'It moves the camera to (0, 5, 10)',
        'It translates the entire scene by (-0, -5, -10) and rotates it so the camera direction aligns with the -Z axis — placing the viewer at the origin',
        'It scales the scene to match the camera\'s field of view',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Projection: f = 1/tan(fov/2) — larger = more zoom." You increase the field of view from 45° to 90°. What happens visually?',
      options: [
        'The scene zooms in — more detail is visible',
        'The scene zooms out — more of the scene fits on screen, making objects appear smaller (wider angle)',
        'The near/far clipping planes change',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Three.js: PerspectiveCamera(fov, aspect, near, far) + camera.lookAt() = P and V." What happens if you set near = 0?',
      options: [
        'Everything becomes visible regardless of distance',
        'Depth precision collapses — the GPU maps all depths in 0..far into a fixed-precision buffer, so near=0 makes the near range infinitely compressed, causing z-fighting everywhere',
        'No change — near=0 is equivalent to near=0.001',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_3JS_1_5 };
