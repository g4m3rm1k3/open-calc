// Three.js · Chapter 0 · Lesson 3
// Matrices & Transformations

const LESSON_3JS_0_3 = {
  title: 'Matrices & Transformations',
  subtitle: 'How translation, rotation, and scale unify into a single multiplication.',
  sequential: true,

  cells: [

    // ── Cell 1: Why matrices? ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Matrices — The Universal Transformation Object

Every transformation in 3D graphics — moving, rotating, scaling, projecting — is encoded as a **4×4 matrix**. Applying the transformation to a vertex means one matrix × vector multiplication. Combining two transformations means one matrix × matrix multiplication.

**Why 4×4, not 3×3?**

A 3×3 matrix can encode rotation and scale but **cannot encode translation** — moving an object. To add translation, we use homogeneous coordinates (the W component from the previous lesson) and extend everything to 4D:

\`\`\`
Translation matrix (moves point by tx, ty, tz):
┌ 1  0  0  tx ┐   ┌ x ┐   ┌ x + tx ┐
│ 0  1  0  ty │ × │ y │ = │ y + ty │
│ 0  0  1  tz │   │ z │   │ z + tz │
└ 0  0  0   1 ┘   └ 1 ┘   └   1   ┘
\`\`\`

The W=1 on the point "activates" the translation column. A direction vector has W=0 — it correctly inherits no translation (directions don't have positions).

**The three fundamental transforms:**

| Name | What it does | Key values |
|---|---|---|
| **Scale S** | Stretches/shrinks along each axis | sx, sy, sz on diagonal |
| **Rotation Ry(θ)** | Rotates around Y axis | cos/sin of θ in corners |
| **Translation T** | Moves the origin | tx, ty, tz in rightmost column |

**The TRS convention — order always matters:**

\`ModelMatrix = T × R × S\`

Applied to a vertex, this means: **Scale first** (Sv), **then Rotate** (R·Sv), **then Translate** (T·R·Sv). This is the correct order. Swapping it produces shear, skew, or unexpected scaling. We will see this visually in Cell 5.

**Three.js builds this for you automatically:**
\`\`\`js
mesh.position.set(3, 1, -5)   // → Translation matrix T
mesh.rotation.y = Math.PI / 4  // → Rotation matrix Ry
mesh.scale.set(2, 2, 2)        // → Scale matrix S
// Three.js computes  mesh.matrix = T × R × S  every frame
\`\`\``,
    },

    // ── Cell 2: Matrix Sculptor ───────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Matrix Sculptor — Live 2D Transform\n\nEdit any cell of the **3×3 matrix** (drag left/right on a number to scrub it). The house shape on the right transforms in real time. Try: set the diagonal to scale, add a non-zero off-diagonal to introduce **shear**, set sin/cos values to **rotate**. Watch the identity matrix (1s on diagonal, 0s elsewhere) leave the shape unchanged.`,
      html: `<div style="display:flex;gap:0;align-items:stretch;background:#0a0f1e;padding:10px 16px;border-radius:12px;gap:16px">
  <div style="display:flex;flex-direction:column;gap:8px;min-width:220px">
    <div style="color:rgba(255,255,255,0.5);font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">3×3 Transform Matrix</div>
    <div id="mat-grid" style="display:grid;grid-template-columns:repeat(3,64px);gap:4px"></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
      <button id="pr-id"   style="padding:4px 10px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.6);font-family:monospace;font-size:10px;cursor:pointer">Identity</button>
      <button id="pr-rot"  style="padding:4px 10px;border-radius:6px;border:1.5px solid #38bdf8;background:transparent;color:#38bdf8;font-family:monospace;font-size:10px;cursor:pointer">Rotate 45°</button>
      <button id="pr-sca"  style="padding:4px 10px;border-radius:6px;border:1.5px solid #4ade80;background:transparent;color:#4ade80;font-family:monospace;font-size:10px;cursor:pointer">Scale 2×</button>
      <button id="pr-she"  style="padding:4px 10px;border-radius:6px;border:1.5px solid #f472b6;background:transparent;color:#f472b6;font-family:monospace;font-size:10px;cursor:pointer">Shear</button>
      <button id="pr-ref"  style="padding:4px 10px;border-radius:6px;border:1.5px solid #fb923c;background:transparent;color:#fb923c;font-family:monospace;font-size:10px;cursor:pointer">Reflect X</button>
    </div>
    <div id="det-label" style="font-family:monospace;font-size:11px;color:rgba(255,255,255,0.4);margin-top:6px"></div>
  </div>
  <canvas id="cv" width="420" height="280" style="border-radius:8px;flex:1"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:sans-serif}
input[type=number]{width:60px;padding:5px 6px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.07);color:#e2e8f0;font-family:monospace;font-size:13px;text-align:center;-moz-appearance:textfield;outline:none}
input[type=number]:focus{border-color:#38bdf8}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var CW=canvas.width,CH=canvas.height;
var OX=CW/2,OY=CH/2,SCALE=60;

// 3×3 matrix stored row-major [row][col]
var M=[[1,0,0],[0,1,0],[0,0,1]];

// Base house shape in 2D (x,y pairs), W=1 implied
var house=[
  [0,0],[1,0],[1,0.8],[0.5,1.3],[-0.5,1.1],[-0.5,0],[0,0], // outline
];
// Separate window
var win=[[0.1,0.1],[0.7,0.1],[0.7,0.55],[0.1,0.55],[0.1,0.1]];
// Door
var door=[[0.3,0],[0.7,0],[0.7,0.5],[0.3,0.5],[0.3,0]];
// Center the house
var hcx=0.25,hcy=0.4;
function center(pts){return pts.map(function(p){return [p[0]-hcx, p[1]-hcy];});}
var houseC=center(house),winC=center(win),doorC=center(door);

function applyM(pts){
  return pts.map(function(p){
    return [
      M[0][0]*p[0]+M[0][1]*p[1]+M[0][2],
      M[1][0]*p[0]+M[1][1]*p[1]+M[1][2],
    ];
  });
}

function toCanvas(pts){
  return pts.map(function(p){return [OX+p[0]*SCALE, OY-p[1]*SCALE];});
}

function drawPoly(pts,stroke,fill,lw){
  if(pts.length<2)return;
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(var i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  ctx.strokeStyle=stroke;ctx.lineWidth=lw||1.5;ctx.stroke();
}

function draw(){
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,CW,CH);

  // Grid
  ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;
  for(var gx=-3;gx<=3;gx++){var px=OX+gx*SCALE;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,CH);ctx.stroke();}
  for(var gy=-2;gy<=2;gy++){var py=OY-gy*SCALE;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(CW,py);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(CW,OY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,CH);ctx.stroke();

  // Original shape (faint ghost)
  var og=toCanvas(houseC);
  drawPoly(og,'rgba(255,255,255,0.12)','rgba(255,255,255,0.04)');

  // Transformed shape
  var th=toCanvas(applyM(houseC));
  var tw=toCanvas(applyM(winC));
  var td=toCanvas(applyM(doorC));
  drawPoly(th,'#38bdf8','rgba(56,189,248,0.15)',2);
  drawPoly(tw,'#38bdf8aa',null,1);
  drawPoly(td,'#38bdf8aa','rgba(56,189,248,0.1)',1);

  // Origin dot
  ctx.beginPath();ctx.arc(OX,OY,3,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fill();

  // Determinant
  var det=M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])
         -M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])
         +M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
  document.getElementById('det-label').textContent='det(M) = '+det.toFixed(3)+(Math.abs(det)<0.001?' — singular (no inverse)!':det<0?' — flipped (negative det)':'');
  document.getElementById('det-label').style.color=Math.abs(det)<0.001?'#f87171':det<0?'#fb923c':'rgba(255,255,255,0.4)';
}

function buildInputs(){
  var grid=document.getElementById('mat-grid');grid.innerHTML='';
  for(var r=0;r<3;r++){
    for(var c=0;c<3;c++){
      (function(row,col){
        var inp=document.createElement('input');
        inp.type='number';inp.step='0.01';inp.value=M[row][col].toFixed(2);
        inp.oninput=function(){M[row][col]=parseFloat(this.value)||0;draw();};
        // Scrub on drag
        var startX,startV;
        inp.onmousedown=function(e){startX=e.clientX;startV=M[row][col];};
        document.addEventListener('mousemove',function(e){
          if(startX===undefined)return;
          var dx=(e.clientX-startX)*0.02;
          M[row][col]=Math.round((startV+dx)*100)/100;
          inp.value=M[row][col].toFixed(2);draw();
        });
        document.addEventListener('mouseup',function(){startX=undefined;});
        grid.appendChild(inp);
      })(r,c);
    }
  }
}

function setM(m){M=m;buildInputs();draw();}

document.getElementById('pr-id').onclick=function(){setM([[1,0,0],[0,1,0],[0,0,1]]);};
document.getElementById('pr-rot').onclick=function(){
  var t=Math.PI/4,c=Math.cos(t),s=Math.sin(t);
  setM([[c,-s,0],[s,c,0],[0,0,1]]);
};
document.getElementById('pr-sca').onclick=function(){setM([[2,0,0],[0,2,0],[0,0,1]]);};
document.getElementById('pr-she').onclick=function(){setM([[1,0.6,0],[0,1,0],[0,0,1]]);};
document.getElementById('pr-ref').onclick=function(){setM([[-1,0,0],[0,1,0],[0,0,1]]);};

buildInputs();draw();`,
      outputHeight: 380,
    },

    // ── Cell 3: Challenge — non-commutativity ─────────────────────────────────
    {
      type: 'challenge',
      instruction: `You want to **scale a house by 2×** and **rotate it 45°**. You apply them in two different orders. Which statement is correct?`,
      options: [
        { label: 'A', text: 'Scale then Rotate = Rotate then Scale — matrix multiplication is commutative for these two operations.' },
        { label: 'B', text: 'Scale then Rotate ≠ Rotate then Scale — if the scale is non-uniform (e.g. 2× on X, 1× on Y), the shape will shear under the rotation.' },
        { label: 'C', text: 'The order only matters if the object has children in a scene graph.' },
        { label: 'D', text: 'The order only matters for translation, not for scale and rotation.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! Matrix multiplication is NOT commutative in general: S×R ≠ R×S. For uniform scaling (sx=sy=sz) S and R happen to commute, but as soon as scaling is non-uniform (different values per axis), rotating after scaling shears the axes. The visual demo shows this: try Scale 2×0.5 then rotate vs rotate then scale — you get completely different results. This is why the TRS convention (scale first, rotate second, translate last) exists.',
      failMessage: 'Matrix multiplication is NOT commutative: AB ≠ BA in general. For uniform scaling it happens to commute, but for non-uniform scaling (e.g. 2× on X, 0.5× on Y), applying the scale before or after a rotation produces completely different shapes. The non-commutativity of matrix multiplication is one of the most important things to internalise about 3D transforms.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 4: Homogeneous & 4×4, TRS math ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Translation Needs 4×4 — and Why Order Is Everything

**A 3×3 matrix cannot translate.** Consider trying to encode "move 3 units right" as a 3×3 operation:

\`\`\`
[1 0 tx]   [x]   [x + tx·?]
[0 1 ty] × [y] = [y + ty·?]
[0 0  1]   [?]   [     ?  ]
\`\`\`

There is no third component to multiply. With 4D homogeneous coordinates, the W=1 on every point activates the fourth column, and translation becomes just another linear operation — no special cases, no branches.

**The three fundamental 4×4 matrices:**

\`\`\`
Scale:             Rotation Ry(θ):        Translation:
[sx 0  0  0]      [cosθ  0  sinθ  0]     [1  0  0  tx]
[0  sy 0  0]      [0     1  0     0]     [0  1  0  ty]
[0  0  sz 0]      [-sinθ 0  cosθ  0]     [0  0  1  tz]
[0  0  0  1]      [0     0  0     1]     [0  0  0   1]
\`\`\`

**TRS order proof — why Scale → Rotate → Translate:**

Suppose we have an object at origin, and we want it 3 units right, rotated 45°, and scaled 2×.

\`TRS = T × R × S\`

When applied to vertex v: \`TRS × v = T × (R × (S × v))\`

S hits the vertex first (scale it), then R (rotate the scaled shape), then T (move to final position). If we did T first, the translation would be rotated and scaled by subsequent operations — the object ends up somewhere unexpected.

**Reading MVP right to left:**

\`gl_Position = P × V × M × vertex\`

- **M** (Model) transforms vertex from object space to world space — applied first
- **V** (View) transforms from world to camera-relative — applied second  
- **P** (Projection) transforms to clip space — applied last

In GLSL column-major notation, the rightmost matrix always applies first. This trips up almost every beginner.`,
    },

    // ── Cell 5: TRS Order Comparator ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### TRS Order — Side by Side\n\nAdjust the **Translation**, **Rotation**, and **Scale** sliders. The **left canvas** applies them in correct TRS order (Scale → Rotate → Translate). The **right canvas** applies them in TSR order (Translate → Scale → Rotate). Same three values, completely different results when scale is non-uniform. This is exactly the bug you get when object hierarchy order is wrong.`,
      html: `<div style="background:#0a0f1e;padding:10px;border-radius:12px">
  <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:8px">
    <label style="color:#4ade80;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:2px">
      Translate X<input id="sl-tx" type="range" min="-2" max="2" step="0.1" value="1.2" style="width:110px;accent-color:#4ade80">
      <span id="lbl-tx" style="font-size:10px">1.2</span>
    </label>
    <label style="color:#38bdf8;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:2px">
      Rotate (deg)<input id="sl-rot" type="range" min="-180" max="180" step="1" value="45" style="width:110px;accent-color:#38bdf8">
      <span id="lbl-rot" style="font-size:10px">45°</span>
    </label>
    <label style="color:#fb923c;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:2px">
      Scale X (non-uniform)<input id="sl-sx" type="range" min="0.5" max="3" step="0.1" value="2" style="width:110px;accent-color:#fb923c">
      <span id="lbl-sx" style="font-size:10px">2.0×</span>
    </label>
  </div>
  <div style="display:flex;gap:8px">
    <div style="flex:1;text-align:center">
      <div style="color:#4ade80;font-family:monospace;font-size:11px;font-weight:700;margin-bottom:4px">✓ Correct: S → R → T</div>
      <canvas id="cv1" width="330" height="240" style="border-radius:8px;width:100%"></canvas>
    </div>
    <div style="flex:1;text-align:center">
      <div style="color:#f87171;font-family:monospace;font-size:11px;font-weight:700;margin-bottom:4px">✗ Wrong: T → S → R</div>
      <canvas id="cv2" width="330" height="240" style="border-radius:8px;width:100%"></canvas>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var c1=document.getElementById('cv1'),c2=document.getElementById('cv2');
var ctx1=c1.getContext('2d'),ctx2=c2.getContext('2d');
var CW=c1.width,CH=c1.height,OX=CW/2,OY=CH/2,SC=55;

// Arrow shape (points up)
var shape=[[-0.4,0],[0.4,0],[0.4,0.6],[0.7,0.6],[0,1.3],[-0.7,0.6],[-0.4,0.6],[-0.4,0]];

// 2D matrix multiply (3×3, row-major, homogeneous)
function mmul(A,B){
  var C=[[0,0,0],[0,0,0],[0,0,0]];
  for(var r=0;r<3;r++)for(var c=0;c<3;c++)for(var k=0;k<3;k++)C[r][c]+=A[r][k]*B[k][c];
  return C;
}
function mvmul(M,v){
  return [M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],
          M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],
          M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]];
}
function mT(tx,ty){return [[1,0,tx],[0,1,ty],[0,0,1]];}
function mS(sx,sy){return [[sx,0,0],[0,sy,0],[0,0,1]];}
function mR(deg){var a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [[c,-s,0],[s,c,0],[0,0,1]];}

function applyAndDraw(ctx,M,accentColor,label){
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,CW,CH);

  // Grid
  ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;
  for(var gx=-3;gx<=3;gx++){var px=OX+gx*SC;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,CH);ctx.stroke();}
  for(var gy=-2;gy<=2;gy++){var py=OY-gy*SC;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(CW,py);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(CW,OY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,CH);ctx.stroke();

  // Original faint
  ctx.beginPath();
  shape.forEach(function(p,i){
    var px=OX+p[0]*SC,py=OY-p[1]*SC;
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
  });
  ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;ctx.stroke();

  // Transformed
  ctx.beginPath();
  shape.forEach(function(p,i){
    var r=mvmul(M,[p[0],p[1],1]);
    var px=OX+r[0]*SC,py=OY-r[1]*SC;
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
  });
  ctx.fillStyle=accentColor+'22';ctx.fill();
  ctx.strokeStyle=accentColor;ctx.lineWidth=2.5;ctx.stroke();
}

function getVals(){
  var tx=+document.getElementById('sl-tx').value;
  var rot=+document.getElementById('sl-rot').value;
  var sx=+document.getElementById('sl-sx').value;
  document.getElementById('lbl-tx').textContent=tx.toFixed(1);
  document.getElementById('lbl-rot').textContent=rot+'°';
  document.getElementById('lbl-sx').textContent=sx.toFixed(1)+'×';
  return {tx:tx,rot:rot,sx:sx};
}

function draw(){
  var v=getVals();
  var T=mT(v.tx,0),R=mR(v.rot),S=mS(v.sx,1); // non-uniform: X only
  var trs=mmul(T,mmul(R,S));   // T × R × S  (applied S first)
  var tsr=mmul(R,mmul(S,T));   // R × S × T  (applied T first) — wrong
  applyAndDraw(ctx1,trs,'#4ade80','TRS');
  applyAndDraw(ctx2,tsr,'#f87171','TSR (wrong)');
}

['sl-tx','sl-rot','sl-sx'].forEach(function(id){document.getElementById(id).oninput=draw;});
draw();`,
      outputHeight: 400,
    },

    // ── Cell 6: Challenge — MVP order ─────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In a GLSL vertex shader: \`gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);\`\n\nWhich matrix is **applied to the vertex first**, and what does that transform accomplish?`,
      options: [
        { label: 'A', text: 'projectionMatrix — it is written first in the expression, so it executes first.' },
        { label: 'B', text: 'viewMatrix — it is in the middle, so it applies before projection but after model.' },
        { label: 'C', text: 'modelMatrix — it is written rightmost, so it is applied first. It transforms the vertex from object space to world space.' },
        { label: 'D', text: 'All three apply simultaneously — GLSL optimises matrix chains into a single pass.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct! In column-vector convention (which OpenGL/GLSL uses), the rightmost matrix in the product is applied first. Reading left to right, the multiplication unfolds as: first modelMatrix transforms the vertex into world space, then viewMatrix brings it into camera space, then projectionMatrix converts it to clip space. The expression is evaluated right to left even though it is written left to right.',
      failMessage: 'In GLSL column-vector convention, matrix multiplication applies right to left. The expression P×V×M×v means: first compute M×v (object to world), then V×(M×v) (world to camera), then P×(V×M×v) (camera to clip). The rightmost matrix always hits the input vector first. This is one of the most frequently confused concepts in GLSL.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 7: Euler angles & quaternions ───────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Euler Angles, Gimbal Lock, and Quaternions

**Euler angles** represent rotation as three separate sequential rotations around the X, Y, and Z axes. They are intuitive — "rotate 30° around X, then 45° around Y, then 10° around Z" — and Three.js lets you set them directly via \`object.rotation.x/y/z\`.

**The hidden problem: rotation order matters.** If you rotate around Y first, the Z axis has already moved — so rotating around Z rotates around the new Z, not the original one. The order XYZ, YXZ, ZXY all produce different results for the same three angle values.

**Gimbal lock** occurs when two rotation axes become aligned — typically when the Y rotation is ±90°. At this point, rotating around X and rotating around Z both produce the same physical rotation. One degree of freedom is permanently lost. The object can no longer be rotated in certain directions using the remaining two axes.

\`\`\`
// This is the gimbal lock configuration in Three.js:
object.rotation.order = 'XYZ'
object.rotation.y = Math.PI / 2  // 90°
// Now X and Z rotations both spin around the same axis — one is redundant
\`\`\`

**Quaternions are the solution.** A quaternion is a 4D unit vector \`(x, y, z, w)\` that encodes any rotation as a single axis + angle:

\`q = (sin(θ/2)·axis.x, sin(θ/2)·axis.y, sin(θ/2)·axis.z, cos(θ/2))\`

Quaternion multiplication composes two rotations without ever losing a degree of freedom, without gimbal lock, and with smooth interpolation (\`slerp\` — spherical linear interpolation) between orientations.

**Three.js uses quaternions internally for all rotations.** When you set \`object.rotation.y\`, Three.js converts it to a quaternion immediately. The Euler representation is just a convenient interface. Direct quaternion control:
\`\`\`js
object.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4)
object.quaternion.slerp(targetQuaternion, 0.1) // smooth interpolation
\`\`\``,
    },

    // ── Cell 8: Gimbal Lock Demo ──────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Gimbal Lock Simulator\n\nRotate the object using the **XYZ Euler sliders**. When Y approaches **±90°**, try rotating X and Z — watch them produce the same spinning motion. One axis is "eaten" by the other. The **Quaternion slerp** button smoothly rotates to a target orientation without ever getting stuck.`,
      html: `<div style="background:#0a0f1e;padding:10px 14px;border-radius:12px">
  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:8px">
    <label style="color:#f87171;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:2px">
      Rot X (deg)<input id="rx" type="range" min="-180" max="180" value="20" style="width:110px;accent-color:#f87171">
      <span id="lrx" style="font-size:10px">20°</span>
    </label>
    <label style="color:#4ade80;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:2px">
      Rot Y (deg) — try ±90!<input id="ry" type="range" min="-90" max="90" value="0" style="width:130px;accent-color:#4ade80">
      <span id="lry" style="font-size:10px">0°</span>
    </label>
    <label style="color:#38bdf8;font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:2px">
      Rot Z (deg)<input id="rz" type="range" min="-180" max="180" value="0" style="width:110px;accent-color:#38bdf8">
      <span id="lrz" style="font-size:10px">0°</span>
    </label>
  </div>
  <canvas id="cv" width="700" height="300"></canvas>
  <div id="lock-warn" style="text-align:center;font-family:monospace;font-size:12px;margin-top:6px;height:20px"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var CW=canvas.width,CH=canvas.height;
var OX=CW/2,OY=CH/2;

// 3D cube vertices
var verts=[
  [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
  [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1]
];
var edges=[
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7]
];
// Axes arrows (unit length + a bit)
var axes=[[1.6,0,0],[0,1.6,0],[0,0,1.6]];
var axColors=['#f87171','#4ade80','#38bdf8'];
var axLabels=['X','Y','Z'];

function toRad(d){return d*Math.PI/180;}

// Rotation matrices (row-major applied as column-major mul below)
function rotX(a){var c=Math.cos(a),s=Math.sin(a);return [[1,0,0],[0,c,-s],[0,s,c]];}
function rotY(a){var c=Math.cos(a),s=Math.sin(a);return [[c,0,s],[0,1,0],[-s,0,c]];}
function rotZ(a){var c=Math.cos(a),s=Math.sin(a);return [[c,-s,0],[s,c,0],[0,0,1]];}

function mmul3(A,B){
  var C=[[0,0,0],[0,0,0],[0,0,0]];
  for(var r=0;r<3;r++)for(var c=0;c<3;c++)for(var k=0;k<3;k++)C[r][c]+=A[r][k]*B[k][c];
  return C;
}
function mvmul3(M,v){
  return [M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],
          M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],
          M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]];
}

// Perspective project 3D->2D
function proj(v){
  var fov=3.5,d=fov/(fov+v[2]);
  return [OX+v[0]*d*90, OY-v[1]*d*90];
}

function draw(){
  var rx=toRad(+document.getElementById('rx').value);
  var ry=toRad(+document.getElementById('ry').value);
  var rz=toRad(+document.getElementById('rz').value);
  document.getElementById('lrx').textContent=(rx*180/Math.PI).toFixed(0)+'°';
  document.getElementById('lry').textContent=(ry*180/Math.PI).toFixed(0)+'°';
  document.getElementById('lrz').textContent=(rz*180/Math.PI).toFixed(0)+'°';

  // XYZ order: apply X first, then Y, then Z
  var R=mmul3(rotZ(rz),mmul3(rotY(ry),rotX(rx)));

  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,CW,CH);

  // Draw cube edges
  ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1.5;
  edges.forEach(function(e){
    var v0=mvmul3(R,verts[e[0]]),v1=mvmul3(R,verts[e[1]]);
    var p0=proj(v0),p1=proj(v1);
    ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke();
  });

  // Draw the THREE local axes (X, Y, Z after rotation)
  var O=[0,0,0];
  var oProj=proj(mvmul3(R,O));
  axes.forEach(function(ax,i){
    var rotAx=mvmul3(R,ax);
    var p=proj(rotAx);
    ctx.strokeStyle=axColors[i];ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(oProj[0],oProj[1]);ctx.lineTo(p[0],p[1]);ctx.stroke();
    // Arrowhead
    var dx=p[0]-oProj[0],dy=p[1]-oProj[1],l=Math.sqrt(dx*dx+dy*dy);
    if(l>4){
      var ang=Math.atan2(dy,dx),h=10,a=0.4;
      ctx.fillStyle=axColors[i];ctx.beginPath();
      ctx.moveTo(p[0],p[1]);
      ctx.lineTo(p[0]-h*Math.cos(ang-a),p[1]-h*Math.sin(ang-a));
      ctx.lineTo(p[0]-h*Math.cos(ang+a),p[1]-h*Math.sin(ang+a));
      ctx.closePath();ctx.fill();
    }
    ctx.fillStyle=axColors[i];ctx.font='bold 12px monospace';ctx.textAlign='center';
    ctx.fillText(axLabels[i],p[0]+(p[0]-oProj[0])*0.15,p[1]+(p[1]-oProj[1])*0.15);
  });

  // Gimbal lock detection: Y near ±90
  var yDeg=Math.abs(+document.getElementById('ry').value);
  var warn=document.getElementById('lock-warn');
  if(yDeg>=85){
    warn.textContent='⚠  GIMBAL LOCK — X and Z now spin the same axis. One DOF is lost!';
    warn.style.color='#f87171';
  } else if(yDeg>=60){
    warn.textContent='⚡ Approaching gimbal lock — try sliding X and Z simultaneously';
    warn.style.color='#fb923c';
  } else {
    warn.textContent='✓ No gimbal lock — all three axes independent';
    warn.style.color='#4ade80';
  }

  // Euler angles panel
  ctx.fillStyle='rgba(10,15,30,0.85)';ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(CW-200,20,185,100,8);ctx.fill();ctx.stroke();
  ctx.font='9px monospace';ctx.textAlign='left';
  var ryDeg=(+document.getElementById('ry').value);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillText('Euler (XYZ order):',CW-190,42);
  ctx.fillStyle='#f87171';ctx.fillText('  X = '+(+document.getElementById('rx').value)+'°',CW-190,60);
  ctx.fillStyle='#4ade80';ctx.fillText('  Y = '+ryDeg+'°'+(Math.abs(ryDeg)>=85?' ← LOCK!':''),CW-190,78);
  ctx.fillStyle='#38bdf8';ctx.fillText('  Z = '+(+document.getElementById('rz').value)+'°',CW-190,96);
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillText('Order: Z(Y(X(v)))',CW-190,114);

  // Title
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('Gimbal Lock Demo — drag Y to ±90° then try moving X',CW/2,CH-10);
}

['rx','ry','rz'].forEach(function(id){document.getElementById(id).oninput=draw;});
draw();`,
      outputHeight: 440,
    },

    // ── Cell 9: Challenge — quaternions ──────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Three.js uses quaternions internally for all object rotations, even though you set \`object.rotation.x\` as a plain Euler angle. Why does Three.js make this conversion automatically — and what problem does it solve?`,
      options: [
        { label: 'A', text: 'Quaternions are faster to compute than Euler angles, so Three.js uses them for performance.' },
        { label: 'B', text: 'Quaternions avoid gimbal lock and enable smooth slerp interpolation between any two orientations. Three.js converts your Euler angles to a quaternion so animation and physics stay stable regardless of orientation.' },
        { label: 'C', text: 'GLSL shaders require quaternion input — Euler angles are not a valid GLSL type.' },
        { label: 'D', text: 'Quaternions use less GPU memory than 3×3 rotation matrices, reducing VRAM usage.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! Quaternions solve two problems that Euler angles cannot: (1) Gimbal lock — at ±90° in one axis, two other axes become parallel and you lose a degree of freedom. A quaternion never suffers this because it encodes rotation as a single axis + angle, not as three sequential rotations. (2) Smooth interpolation — slerp(q1, q2, t) gives the shortest-path rotation between any two orientations. Euler angle interpolation can spin the wrong way or take the long route. Three.js accepts .rotation Euler for convenience but stores .quaternion as truth.',
      failMessage: 'The key reason is gimbal lock avoidance and slerp interpolation. Euler angles fail at ±90° (gimbal lock loses a rotation axis) and interpolate poorly between orientations (can spin the long way around). Quaternions represent any rotation as a 4D unit vector encoding an axis and angle — no sequential dependencies, no lock, and perfectly smooth shortest-path interpolation via slerp.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

  ],
};

export default {
  id: 'three-js-0-3-matrices',
  slug: 'matrices-and-transformations',
  chapter: 'three-js.0',
  order: 3,
  title: 'Matrices & Transformations',
  subtitle: 'How translation, rotation, and scale unify into a single multiplication.',
  tags: ['three-js', 'matrices', 'transformations', 'trs', 'mvp', 'quaternions', 'euler', 'gimbal-lock', 'foundations'],
  hook: {
    question: 'Why does rotating an object in the wrong order produce a completely different result — and why does Three.js use an invisible fourth number (W) to do translations that 3×3 matrices cannot?',
    realWorldContext: 'The 4×4 homogeneous matrix was introduced in computer graphics in 1965 and has not changed since. Every GPU on the planet processes geometry by multiplying 4×4 matrices together.',
  },
  intuition: {
    prose: [
      'A 4×4 matrix encodes any combination of translation, rotation, and scale in a single object.',
      'TRS order: Scale first, Rotate second, Translate last. Breaking this causes shear/skew artefacts.',
      'MVP = P×V×M. Applied right to left: Model first, Projection last.',
      'Euler angles cause gimbal lock at ±90°. Three.js uses quaternions internally to avoid this.',
    ],
    callouts: [
      { type: 'warning', title: 'Order matters — always', body: 'In GLSL column-major notation, the rightmost matrix applies first. P×V×M×v means M hits the vertex first. Getting this backwards is the most common matrix bug in graphics programming.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Matrices & Transformations', props: { lesson: LESSON_3JS_0_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    '4×4 needed for translation: 3×3 can\'t encode translation without the W row.',
    'TRS order: Scale → Rotate → Translate. M = T × R × S. Applied S first, T last.',
    'MVP chain in GLSL reads right to left: M applied to vertex first, P last.',
    'det(M) < 0 → reflection (winding flips). det = 0 → singular (no inverse, object collapses).',
    'Quaternion: 4D unit vector (x,y,z,w) = (sin(θ/2)·axis, cos(θ/2)). Immune to gimbal lock.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_3 };
