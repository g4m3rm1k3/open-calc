// Three.js · Chapter 0 · Lesson 4
// Coordinate Spaces

const LESSON_3JS_0_4 = {
  title: 'Coordinate Spaces',
  subtitle: 'Object, World, View, Clip, NDC, and Screen — and what lives in each.',
  sequential: true,

  cells: [

    // ── Cell 1: The six spaces ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Coordinate Spaces — The Mental Model That Ends Shader Bugs

Every quantity in 3D graphics — a position, a direction, a normal — is meaningless without knowing **which coordinate space it lives in**. Confusing spaces is the #1 source of subtle rendering bugs that produce wrong-looking results with no error messages.

**The six spaces a vertex travels through:**

| Space | Origin | Axes | What lives here |
|---|---|---|---|
| **Object Space** | Object pivot | Whatever the artist set | Mesh vertices, VBO data |
| **World Space** | Scene origin | Y-up, right-handed | Object positions, light positions |
| **View (Eye) Space** | Camera | +X right, +Y up, **−Z into screen** | View-space normals, fog calculations |
| **Clip Space** | Centre of screen | After projection, W ≠ 1 | \`gl_Position\` output |
| **NDC** | Centre of screen | [−1, 1] on each axis | After ÷W, GPU clips here |
| **Screen Space** | Top-left (or bottom-left in GL) | Pixels | \`gl_FragCoord\`, viewport |

**What the shaders receive:**

The **vertex shader** receives attributes in **Object Space** and must output **Clip Space** into \`gl_Position\`. The standard line that does the full chain:
\`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\`

The **fragment shader** receives \`gl_FragCoord\` in **Screen Space** automatically. Varyings are in whatever space the vertex shader put them in — usually **world space** or **view space** for lighting calculations.

**The normal matrix — the most misunderstood built-in:**

Normals are directions, not positions. You cannot transform a normal with the model matrix — if the object is non-uniformly scaled, the normal will no longer be perpendicular to the surface. The correct transform is the **inverse-transpose of the upper-left 3×3 of the model-view matrix:**

\`normalMatrix = transpose(inverse(mat3(modelViewMatrix)))\`

Three.js provides this as the built-in \`normalMatrix\` uniform in every \`ShaderMaterial\`. Use it or your normals will be wrong under any non-uniform scaling.

**Three.js built-in uniforms (available in every ShaderMaterial automatically):**
\`\`\`glsl
uniform mat4 modelMatrix;        // Object → World
uniform mat4 viewMatrix;         // World → View
uniform mat4 projectionMatrix;   // View → Clip
uniform mat4 modelViewMatrix;    // Object → View (combined)
uniform mat3 normalMatrix;       // for transforming normals correctly
uniform vec3 cameraPosition;     // camera position in World space
\`\`\``,
    },

    // ── Cell 2: Space Stack Inspector ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Space Stack Inspector\n\nA sample scene: a box is at world position **(3, 0, −4)**, camera at **(0, 2, 0)** looking at origin. Click any **matrix label** to expand its values. Click the **space rows** to see what the vertex coordinates look like at each stage of the pipeline.`,
      html: `<div style="display:flex;gap:12px;background:#0a0f1e;padding:12px;border-radius:12px">
  <div id="stack" style="display:flex;flex-direction:column;gap:0;min-width:200px"></div>
  <div style="flex:1">
    <canvas id="cv" width="460" height="360" style="border-radius:8px;width:100%"></canvas>
    <div id="info" style="background:rgba(255,255,255,0.04);border-radius:8px;padding:10px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.7);margin-top:8px;min-height:60px;white-space:pre"></div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:sans-serif}
.space-row{padding:10px 14px;border-radius:8px;cursor:pointer;transition:background .15s;border:1.5px solid transparent;margin-bottom:3px;font-family:monospace;font-size:11px}
.space-row:hover{background:rgba(255,255,255,0.08)}
.space-row.active{border-color:currentColor}
.mat-row{padding:6px 10px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.45);background:rgba(255,255,255,0.04);margin-bottom:3px;border:1px solid transparent;transition:all .15s}
.mat-row:hover{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7)}
.mat-row.active{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2)}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var CW=canvas.width,CH=canvas.height;
var OX=CW/2,OY=CH/2;

// Sample scene values (pre-computed for a box at (3,0,-4), camera at (0,2,0) looking at origin)
var stages=[
  {name:'Object Space',color:'#38bdf8',
   coords:'(0.00, 0.00, 0.00, 1.00)',
   note:'Vertex at object origin. Model matrix will move it to world position.',
   px:0,py:0,pz:0},
  {name:'World Space',color:'#a78bfa',
   coords:'(3.00, 0.00, -4.00, 1.00)',
   note:'After Model matrix T(3,0,-4). Object placed in scene. W still = 1.',
   px:3,py:0,pz:-4},
  {name:'View (Eye) Space',color:'#fb923c',
   coords:'(3.00, -2.00, -4.47, 1.00)',
   note:'After View matrix. Camera at (0,2,0) became origin. Box shifted down.',
   px:3,py:-2,pz:-4.47},
  {name:'Clip Space',color:'#f87171',
   coords:'(2.58, -1.72, 0.87, 4.47)',
   note:'After Projection matrix. W=4.47 (depth). X,Y scaled by FOV. W \u2260 1.',
   px:2.58/4.47,py:-1.72/4.47,pz:0.87},
  {name:'NDC',color:'#4ade80',
   coords:'(0.577, -0.385, 0.195, 1.00)',
   note:'After \u00f7W. All values in [-1,1]. GPU clips anything outside this cube.',
   px:0.577,py:-0.385,pz:0.195},
  {name:'Screen Space',color:'#fde68a',
   coords:'(1035, 748, 0.597)',
   note:'After viewport transform for 1920\u00d71080. x\u2208[0,1920], y\u2208[0,1080]. Pixel coordinates.',
   px:0.577,py:-0.385,pz:0.195},
];

var matrices=[
  {name:'\u00d7 Model Matrix',color:'#a78bfa',
   mat:[[1,0,0,3],[0,1,0,0],[0,0,1,-4],[0,0,0,1]],
   desc:'Translates the object from origin to world position (3, 0, -4). W row unchanged.'},
  {name:'\u00d7 View Matrix',color:'#fb923c',
   mat:[[1,0,0,0],[0,0.894,0.447,-1.789],[0,-0.447,0.894,3.578],[0,0,0,1]],
   desc:'Moves world so camera (was at 0,2,0) becomes the origin. Involves inverse of camera transform.'},
  {name:'\u00d7 Projection',color:'#f87171',
   mat:[[1.81,0,0,0],[0,2.41,0,0],[0,0,-1.002,-0.2],[0,0,-1,0]],
   desc:'Perspective projection (FOV=60\u00b0, aspect=1.78, near=0.1, far=100). Makes W\u22601.'},
  {name:'\u00f7 W (Perspective Divide)',color:'#4ade80',
   mat:null,
   desc:'Not a matrix \u2014 hardware divides x,y,z by W automatically. Result fits in [-1,1]\u00b3.'},
  {name:'\u00d7 Viewport Transform',color:'#fde68a',
   mat:[[960,0,0,960],[0,-540,0,540],[0,0,0.5,0.5],[0,0,0,1]],
   desc:'Maps NDC [-1,1] to pixel coordinates. For 1920\u00d71080: x=960*xNDC+960, y=-540*yNDC+540.'},
];

var selStage=0,selMat=-1;

function buildStack(){
  var stack=document.getElementById('stack');stack.innerHTML='';
  stages.forEach(function(s,i){
    var row=document.createElement('div');
    row.className='space-row'+(i===selStage?' active':'');
    row.style.color=s.color;
    row.innerHTML='<span style="font-weight:700">'+s.name+'</span><br><span style="color:rgba(255,255,255,0.45);font-size:9px">'+s.coords+'</span>';
    row.onclick=function(){selStage=i;selMat=-1;buildStack();draw();};
    stack.appendChild(row);
    if(i<matrices.length){
      var mrow=document.createElement('div');
      mrow.className='mat-row'+(selMat===i?' active':'');
      mrow.textContent=matrices[i].name;
      mrow.style.color=matrices[i].color;
      mrow.onclick=function(e){e.stopPropagation();selMat=selMat===i?-1:i;buildStack();draw();};
      stack.appendChild(mrow);
    }
  });
}

function drawGrid(){
  ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;
  for(var gx=-4;gx<=4;gx++){var px=OX+gx*60;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,CH);ctx.stroke();}
  for(var gy=-3;gy<=3;gy++){var py=OY+gy*60;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(CW,py);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(CW,OY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,CH);ctx.stroke();
}

function draw4x4(mat,x,y,color){
  if(!mat){
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('Hardware op (not a matrix)',x+120,y+40);return;
  }
  var cw=55,rh=20;
  ctx.font='10px monospace';
  mat.forEach(function(row,ri){
    row.forEach(function(val,ci){
      var vx=x+ci*cw,vy=y+ri*rh;
      var highlight=Math.abs(val)>0.01&&!(ri===ci&&Math.abs(val-1)<0.01);
      ctx.fillStyle=highlight?color+'cc':'rgba(255,255,255,0.35)';
      ctx.textAlign='right';
      ctx.fillText(val.toFixed(2),vx+cw-4,vy+14);
    });
  });
  // Border lines (rows)
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;
  for(var r=0;r<=4;r++){ctx.beginPath();ctx.moveTo(x,y+r*rh);ctx.lineTo(x+4*cw,y+r*rh);ctx.stroke();}
}

function draw(){
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,CW,CH);
  drawGrid();

  var s=stages[selStage];

  // NDC box outline (only applies if we are in NDC/clip space)
  if(selStage>=4){
    ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.rect(OX-120,OY-120,240,240);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.07)';ctx.beginPath();ctx.rect(OX-120,OY-120,240,240);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('NDC cube [-1,1]',OX,OY-127);
  }

  // Dot representing the vertex
  var dotX,dotY;
  if(selStage<=2){
    // In world/object/view space: isometric-ish projection for 3D feel
    var sc=selStage===0?120:50;
    dotX=OX+s.px*sc+s.pz*sc*0.3;
    dotY=OY-s.py*sc+s.pz*sc*0.2;
  } else if(selStage===5){
    // Screen space — map to canvas bounds
    dotX=OX+(s.px*120);dotY=OY-(s.py*120);
  } else {
    dotX=OX+s.px*120;dotY=OY-s.py*120;
  }

  // Glow ring
  ctx.beginPath();ctx.arc(dotX,dotY,16,0,Math.PI*2);
  ctx.fillStyle=s.color+'18';ctx.fill();
  // Dot
  ctx.beginPath();ctx.arc(dotX,dotY,8,0,Math.PI*2);
  ctx.fillStyle=s.color;ctx.shadowColor=s.color;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;

  // Coordinate label near dot
  ctx.fillStyle=s.color;ctx.font='bold 10px monospace';ctx.textAlign='left';
  ctx.fillText(s.coords,dotX+14,dotY+4);

  // Matrix display (if selected)
  if(selMat>=0 && selMat<matrices.length){
    var mx=matrices[selMat];
    var bx=10,by=CH-120,bw=CW-20,bh=110;
    ctx.fillStyle='rgba(10,15,30,0.92)';ctx.strokeStyle=mx.color+'66';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(bx,by,bw,bh,8);ctx.fill();ctx.stroke();
    ctx.fillStyle=mx.color;ctx.font='bold 10px monospace';ctx.textAlign='left';
    ctx.fillText(mx.name,bx+10,by+18);
    draw4x4(mx.mat,bx+10,by+24,mx.color);
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='9px monospace';
    ctx.fillText(mx.desc,bx+10,by+105);
  }

  // Stage title
  ctx.fillStyle=s.color;ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText(s.name,CW/2,24);
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';
  ctx.fillText(s.note,CW/2,42);

  // Info panel update
  document.getElementById('info').textContent = s.name+'\n'+s.coords+(selMat>=0?'\n\nMatrix: '+matrices[selMat].name+'\n'+matrices[selMat].desc:'');
}

buildStack();draw();`,
      outputHeight: 520,
    },

    // ── Cell 3: Challenge — object to world ───────────────────────────────────
    {
      type: 'challenge',
      instruction: `A mesh vertex sits at **(0, 0, 0) in Object Space** — the object's own pivot point. The object's Model matrix is a pure translation of **(5, 2, −3)**. What are the vertex's **World Space coordinates**?`,
      options: [
        { label: 'A', text: '(0, 0, 0) — the Model matrix only moves the object, not individual vertices.' },
        { label: 'B', text: '(5, 2, −3) — multiplying the translation matrix by (0,0,0,1) adds the translation column directly.' },
        { label: 'C', text: '(−5, −2, 3) — the View matrix inverts translations to move the world instead.' },
        { label: 'D', text: '(5, 2, −3, 0) — the W component becomes 0 after a translation.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! Multiplying the translation matrix T(5,2,−3) by homogeneous point (0,0,0,1): the first three rows compute 1*0 + 0*0 + 0*0 + 5*1 = 5, then 2, then −3. Result: (5, 2, −3, 1). W stays 1 because it was 1 coming in and the bottom row of a translation matrix is [0,0,0,1]. The translation column only activates when W=1 — another reason directions (W=0) correctly get no translation.',
      failMessage: 'Applying translation matrix T(tx,ty,tz) to point (0,0,0,1): result = (0+tx, 0+ty, 0+tz, 1) = (5, 2, −3, 1). The W=1 on the input "activates" the translation column (the rightmost column of the matrix). W remains 1 after any pure translation — check the bottom row [0,0,0,1] × [0,0,0,1]ᵀ = 1.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 4: The camera illusion ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Camera Illusion — Nothing Actually Moves

In View Space, the camera is **always** at the origin, looking down the −Z axis. This is not a convention — it is a mathematical necessity. There is no "camera object" in the GPU pipeline. The GPU only processes vertices. 

**Moving the camera is actually moving the world:**

If a camera is at position \`(5, 0, 0)\` in world space, the View matrix achieves the same visual result by moving every other object \`(−5, 0, 0)\` — left by 5 units. The viewer (at the mathematical origin) then sees objects exactly as they would appear from position 5.

**The View matrix is the inverse of the camera's world matrix:**

\`ViewMatrix = inverse(cameraWorldMatrix)\`

The camera's world matrix (\`camera.matrixWorld\` in Three.js) represents where the camera is and which way it points in the scene. Inverting it gives the transform that moves the entire world relative to the camera.

For a camera that is only translated (no rotation), the inverse is simple — just negate the translation:

\`\`\`
Camera at (5, 0, 0):          View Matrix (inverse):
[1 0 0  5]                    [1 0 0 -5]
[0 1 0  0]   inverse →       [0 1 0  0]
[0 0 1  0]                    [0 0 1  0]
[0 0 0  1]                    [0 0 0  1]
\`\`\`

**The normal matrix — don't skip this:**

You cannot transform surface normals with the model matrix if the object has non-uniform scale. A scaled sphere's normals no longer point perpendicular to the surface if you use the model matrix directly. The fix:

\`\`\`glsl
// WRONG for non-uniform scale:
vec3 worldNormal = normalize(mat3(modelMatrix) * normal);

// CORRECT:
vec3 worldNormal = normalize(normalMatrix * normal);
// normalMatrix = transpose(inverse(mat3(modelViewMatrix)))
\`\`\`

Three.js provides \`normalMatrix\` as a built-in uniform — available in any \`ShaderMaterial\` automatically.`,
    },

    // ── Cell 5: Camera Illusion Interactive ───────────────────────────────────
    {
      type: 'js',
      instruction: `### Camera Illusion — Two Views, One Result\n\nDrag the slider to reposition. **Left mode** moves the camera right. **Right mode** moves the world left. Toggle between them — the rendered image on the right is identical in both cases. The view matrix values are shown — notice they are the same matrix.`,
      html: `<div style="background:#0a0f1e;padding:10px 14px;border-radius:12px">
  <div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap">
    <label style="color:rgba(255,255,255,0.6);font-family:monospace;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:3px">
      Offset<input id="sl-offset" type="range" min="-3" max="3" step="0.1" value="1.5" style="width:160px;accent-color:#38bdf8">
    </label>
    <div style="display:flex;gap:6px">
      <button id="btn-cam" style="padding:5px 14px;border-radius:7px;font-family:monospace;font-size:11px;cursor:pointer;border:none;background:#38bdf8;color:#0a0f1e;font-weight:700">Camera Moves →</button>
      <button id="btn-world" style="padding:5px 14px;border-radius:7px;font-family:monospace;font-size:11px;cursor:pointer;border:1.5px solid #fb923c;background:transparent;color:#fb923c;font-weight:700">← World Moves</button>
    </div>
  </div>
  <div style="display:flex;gap:8px">
    <canvas id="cv-scene" width="340" height="260" style="border-radius:8px;flex:1"></canvas>
    <canvas id="cv-view"  width="340" height="260" style="border-radius:8px;flex:1"></canvas>
  </div>
  <div style="display:flex;gap:8px;margin-top:6px">
    <div style="flex:1;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.5);text-align:center" id="lbl-scene">Scene View</div>
    <div style="flex:1;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.5);text-align:center" id="lbl-view">View Matrix</div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var cs=document.getElementById('cv-scene'),cv=document.getElementById('cv-view');
var ctxS=cs.getContext('2d'),ctxV=cv.getContext('2d');
var CW=cs.width,CH=cs.height;
var camMode=true; // true = camera moves, false = world moves

// Objects in the world: positions + colours
var objects=[
  {x:-3,y:0,r:18,col:'#38bdf8',label:'A'},
  {x:0, y:0,r:22,col:'#a78bfa',label:'B'},
  {x:2, y:0,r:14,col:'#fb923c',label:'C'},
  {x:4, y:0.5,r:16,col:'#4ade80',label:'D'},
];
// Ground grid lines
var gridLines=[-2,-1,0,1,2,3,4,5];

function drawSceneCanvas(camX){
  var ctx=ctxS,W=CW,H=CH,OX=W/2,OY=H*0.6,SC=50;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,W,H);

  // Sky
  ctx.fillStyle='rgba(56,189,248,0.04)';ctx.fillRect(0,0,W,OY);
  // Ground
  ctx.fillStyle='rgba(255,255,255,0.03)';ctx.fillRect(0,OY,W,H-OY);

  // Ground line
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();

  // Grid (world)
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;
  gridLines.forEach(function(wx){
    var px=OX+(wx)*SC;
    ctx.beginPath();ctx.moveTo(px,OY-6);ctx.lineTo(px,OY+6);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText(wx,px,OY+16);
  });

  // Objects (in world coords)
  objects.forEach(function(o){
    var px=OX+o.x*SC;
    ctx.beginPath();ctx.arc(px,OY-o.r,o.r,0,Math.PI*2);
    ctx.fillStyle=o.col+'44';ctx.fill();
    ctx.strokeStyle=o.col;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=o.col;ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText(o.label,px,OY-o.r+4);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='8px monospace';
    ctx.fillText('('+o.x+',0)',px,OY+28);
  });

  // Camera
  var cpx=OX+camX*SC;
  ctx.fillStyle='#fde68a';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('CAM',cpx,OY+52);
  ctx.strokeStyle='#fde68a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cpx-10,OY+38);ctx.lineTo(cpx+10,OY+38);ctx.lineTo(cpx+14,OY+44);ctx.lineTo(cpx-14,OY+44);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(cpx,OY+35);ctx.lineTo(cpx,OY+30);ctx.stroke(); // lens

  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText(camMode?'Camera at X='+camX.toFixed(1):'Camera at X=0 (world shifted)',CW/2,CH-8);
}

function drawViewCanvas(camX){
  var ctx=ctxV,W=CW,H=CH,OX=W/2,OY=H*0.6,SC=50;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,W,H);

  // "Through the camera lens" — shift everything by -camX
  var shift=-camX;

  ctx.fillStyle='rgba(255,255,255,0.03)';ctx.fillRect(0,OY,W,H-OY);
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();

  // Objects (shifted into view space)
  objects.forEach(function(o){
    var viewX=o.x+shift;
    var px=OX+viewX*SC;
    ctx.beginPath();ctx.arc(px,OY-o.r,o.r,0,Math.PI*2);
    ctx.fillStyle=o.col+'44';ctx.fill();
    ctx.strokeStyle=o.col;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=o.col;ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText(o.label,px,OY-o.r+4);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='8px monospace';
    ctx.fillText('('+viewX.toFixed(1)+',0)',px,OY+16);
  });

  // Camera crosshair at origin (always)
  ctx.strokeStyle='#fde68a';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(OX,OY-20);ctx.lineTo(OX,OY+20);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX-20,OY);ctx.lineTo(OX+20,OY);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#fde68a';ctx.font='8px monospace';ctx.textAlign='center';
  ctx.fillText('VIEW ORIGIN (camera)',OX,OY+30);

  // View matrix display
  ctx.fillStyle='rgba(10,15,30,0.9)';ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(8,8,200,72,6);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='bold 9px monospace';ctx.textAlign='left';
  ctx.fillText('View Matrix (offset = '+shift.toFixed(2)+')',14,24);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px monospace';
  ctx.fillText('[ 1   0   0  '+shift.toFixed(2)+' ]',14,40);
  ctx.fillText('[ 0   1   0    0.00 ]',14,52);
  ctx.fillText('[ 0   0   1    0.00 ]',14,64);
  ctx.fillText('[ 0   0   0    1.00 ]',14,76);

  document.getElementById('lbl-scene').textContent=camMode?'Scene (camera moves right)':'Scene (world moves left)';
  document.getElementById('lbl-view').textContent='Rendered view — identical in both modes';
}

function draw(){
  var offset=+document.getElementById('sl-offset').value;
  var camX=camMode?offset:0;
  var worldShift=camMode?0:-offset;
  // Temporarily shift world
  objects.forEach(function(o,i){o._wx=o.x;o.x=o.x+worldShift;});
  drawSceneCanvas(camX);
  objects.forEach(function(o){o.x=o._wx;});
  drawViewCanvas(camX+worldShift*(-1));
}

document.getElementById('sl-offset').oninput=draw;
document.getElementById('btn-cam').onclick=function(){camMode=true;draw();};
document.getElementById('btn-world').onclick=function(){camMode=false;draw();};
draw();`,
      outputHeight: 400,
    },

    // ── Cell 6: Challenge — camera world matrix ───────────────────────────────
    {
      type: 'challenge',
      instruction: `In Three.js, \`camera.matrixWorldInverse\` is the View Matrix. What does \`camera.matrixWorld\` (its inverse) represent?`,
      options: [
        { label: 'A', text: 'The Projection matrix — it converts from view space to clip space.' },
        { label: 'B', text: 'The camera\'s transform in World Space — it describes where the camera is positioned and oriented within the scene, exactly like any other object\'s world matrix.' },
        { label: 'C', text: 'The combined Model-View-Projection matrix for objects in the scene.' },
        { label: 'D', text: 'The NDC-to-screen-space viewport transform matrix.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! camera.matrixWorld is the camera\'s world transform — it places the camera in the scene just like mesh.matrixWorld places a mesh. It contains the camera\'s world position in its last column and its forward/right/up vectors in the first three columns. Inverting it gives the View Matrix (camera.matrixWorldInverse) which transforms the whole world into camera-relative space. You can read the camera position directly: camera.matrixWorld.elements[12, 13, 14] give world X, Y, Z.',
      failMessage: 'camera.matrixWorld is the camera\'s world transform — exactly like any Object3D\'s matrixWorld. It describes where the camera sits in world space. The View Matrix (camera.matrixWorldInverse) is its mathematical inverse — it transforms the world into camera-relative coordinates. The relationship: ViewMatrix = inverse(cameraWorldMatrix), so cameraWorldMatrix = inverse(ViewMatrix).',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 7: Tangent space ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Tangent Space — The Secret Behind Normal Maps

Every triangle in a 3D mesh carries its own tiny local coordinate system called **tangent space**. It is defined by three vectors:

- **T** (Tangent) — points along the UV horizontal axis (the U direction)
- **B** (Bitangent) — points along the UV vertical axis (the V direction)  
- **N** (Normal) — the face normal, perpendicular to the surface

These three vectors form the **TBN matrix** — a 3×3 rotation matrix that converts directions from tangent space to world/view space.

**Why does normal mapping need its own space?**

A normal map stores directions as RGB colours: the blue pixel \`(0.5, 0.5, 1.0)\` represents a direction (0, 0, 1) in tangent space — the flat "no perturbation" normal. A pixel \`(0.8, 0.5, 0.5)\` represents a surface tilted toward the U direction.

These directions are **relative to the surface**. If you baked a normal map looking at a sphere from the front, and then placed that sphere sideways, the normals need to rotate with the sphere. The TBN matrix does exactly this — it rotates the tangent-space direction into world space considering the object's current orientation.

**The GLSL implementation:**

\`\`\`glsl
// In the vertex shader: compute TBN from attributes
vec3 T = normalize(normalMatrix * tangent.xyz);
vec3 N = normalize(normalMatrix * normal);
vec3 B = cross(N, T) * tangent.w;     // .w encodes handedness
mat3 TBN = mat3(T, B, N);

// In the fragment shader: transform normal map sample to world space  
vec3 texNormal = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
vec3 worldNormal = normalize(TBN * texNormal);
\`\`\`

**Three.js handles this automatically** in \`MeshStandardMaterial\` and \`MeshPhongMaterial\` via the \`normalMap\` property. Understanding TBN is essential when writing your own PBR shader or debugging incorrect normal map orientations.

**The classic normal map bug:** If you see a normal map that is "inverted" (lighting from the wrong direction) it is almost always a Y-axis flip — DirectX normal maps have Y pointing down, OpenGL/WebGL maps have Y pointing up. Three.js provides \`material.normalScale\` to compensate.`,
    },

    // ── Cell 8: TBN / Space diagram ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Coordinate Space Reference — Full Pipeline Recap\n\nA complete visual of all six spaces with the matrix at each transition. *Hover* any space to see what vector types live there and common shader mistakes made in that space.`,
      html: `<canvas id="cv" width="700" height="340" style="cursor:pointer"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var CW=canvas.width,CH=canvas.height;
var hovered=-1;

var spaces=[
  {name:'Object\nSpace',color:'#38bdf8',
   lives:'Mesh vertices\nVBO positions\nSkinning weights',
   bugs:'Using world-space light\ndirection without transforming it',
   shortcut:'THREE.Mesh\n.geometry.attributes'},
  {name:'World\nSpace',color:'#a78bfa',
   lives:'Object positions\nLight positions & dirs\nCamera position',
   bugs:'Transforming normals\nwith model matrix\n(use normalMatrix!)',
   shortcut:'mesh.matrixWorld\ncamera.position'},
  {name:'View (Eye)\nSpace',color:'#fb923c',
   lives:'View-space normals\nFog depth (−z value)\nView-space lighting',
   bugs:'Mixing world-space\nand view-space vectors\nin the same calculation',
   shortcut:'camera.matrixWorldInverse\nmodelViewMatrix'},
  {name:'Clip\nSpace',color:'#f87171',
   lives:'gl_Position output\nClipping plane tests\nW \u2260 1',
   bugs:'Writing to gl_Position\nbefore projection\n(forgetting projMatrix)',
   shortcut:'projectionMatrix\nprojectionMatrixInverse'},
  {name:'NDC',color:'#4ade80',
   lives:'gl_FragCoord.xy/wh\nDepth buffer values\n[-1,1] unit cube',
   bugs:'Assuming linear depth\n(NDC depth is non-linear\nnear near plane)',
   shortcut:'gl_FragCoord\ngl_FragDepth'},
  {name:'Screen\nSpace',color:'#fde68a',
   lives:'gl_FragCoord pixels\nViewport dimensions\nMSAA sample positions',
   bugs:'Hard-coding pixel\noffsets without\ndividing by resolution',
   shortcut:'vec2 uv=\ngl_FragCoord.xy\n/resolution'},
];

var matrices_labels=[
  {label:'\u00d7 Model',sub:'Object\u2192World',color:'#a78bfa'},
  {label:'\u00d7 View',sub:'World\u2192Eye',color:'#fb923c'},
  {label:'\u00d7 Proj',sub:'Eye\u2192Clip',color:'#f87171'},
  {label:'\u00f7 W',sub:'Clip\u2192NDC',color:'#4ade80'},
  {label:'Viewport',sub:'NDC\u2192Screen',color:'#fde68a'},
];

var PW=80,PH=100,GAP=20;
var total=spaces.length;
var startX=(CW-(total*PW+(total-1)*GAP))/2;
var panelY=20;

function getPanel(i){return {x:startX+i*(PW+GAP),y:panelY,w:PW,h:PH};}

canvas.onmousemove=function(e){
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(CW/r.width);
  var my=(e.clientY-r.top)*(CH/r.height);
  var prev=hovered;hovered=-1;
  for(var i=0;i<spaces.length;i++){
    var p=getPanel(i);
    if(mx>=p.x&&mx<=p.x+p.w&&my>=p.y&&my<=p.y+p.h){hovered=i;break;}
  }
  if(hovered!==prev)draw();
};
canvas.onmouseleave=function(){hovered=-1;draw();};

function draw(){
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,CW,CH);

  // Draw panels
  spaces.forEach(function(s,i){
    var p=getPanel(i);
    var active=hovered===i;
    if(active){ctx.shadowColor=s.color;ctx.shadowBlur=18;}
    ctx.fillStyle=active?s.color+'28':'rgba(255,255,255,0.04)';
    ctx.strokeStyle=active?s.color:'rgba(255,255,255,0.12)';
    ctx.lineWidth=active?2:1;
    ctx.beginPath();ctx.roundRect(p.x,p.y,p.w,p.h,8);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle=active?s.color:'rgba(255,255,255,0.55)';
    ctx.font='bold 9px monospace';ctx.textAlign='center';
    var lines=s.name.split('\n');
    lines.forEach(function(l,li){ctx.fillText(l,p.x+p.w/2,p.y+20+li*14);});
    ctx.fillStyle=active?s.color+'aa':'rgba(255,255,255,0.2)';
    ctx.font='bold 16px monospace';
    ctx.fillText(i,p.x+p.w/2,p.y+p.h-14);
  });

  // Matrix labels between panels
  matrices_labels.forEach(function(m,i){
    var p1=getPanel(i),p2=getPanel(i+1);
    var mx=(p1.x+p1.w+p2.x)/2,my2=panelY+PH/2;
    ctx.fillStyle=m.color+'cc';ctx.font='bold 7px monospace';ctx.textAlign='center';
    ctx.fillText(m.label,mx,my2-5);
    ctx.fillStyle=m.color+'88';ctx.font='7px monospace';
    ctx.fillText(m.sub,mx,my2+7);
    ctx.strokeStyle=m.color+'55';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(p1.x+p1.w+3,my2);ctx.lineTo(p2.x-3,my2);ctx.stroke();
    // Arrow
    ctx.fillStyle=m.color+'88';
    ctx.beginPath();ctx.moveTo(p2.x-3,my2);ctx.lineTo(p2.x-8,my2-3);ctx.lineTo(p2.x-8,my2+3);ctx.closePath();ctx.fill();
  });

  // Detail panel for hovered space
  if(hovered>=0){
    var s=spaces[hovered];
    var bx=10,by=panelY+PH+18,bw=CW-20,bh=CH-by-10;
    ctx.fillStyle='rgba(10,15,30,0.94)';ctx.strokeStyle=s.color+'55';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(bx,by,bw,bh,8);ctx.fill();ctx.stroke();

    ctx.textAlign='left';
    // Lives here
    ctx.fillStyle=s.color;ctx.font='bold 10px monospace';
    ctx.fillText('What lives in '+s.name.replace('\n',' ')+':',bx+12,by+18);
    ctx.fillStyle='rgba(255,255,255,0.65)';ctx.font='10px monospace';
    s.lives.split('\n').forEach(function(l,li){ctx.fillText('• '+l,bx+12,by+34+li*16);});
    // Common bug
    ctx.fillStyle='#f87171';ctx.font='bold 10px monospace';
    ctx.fillText('Common bug:',bx+260,by+18);
    ctx.fillStyle='rgba(255,150,150,0.7)';ctx.font='10px monospace';
    s.bugs.split('\n').forEach(function(l,li){ctx.fillText(l,bx+260,by+34+li*16);});
    // Three.js
    ctx.fillStyle='#4ade80';ctx.font='bold 10px monospace';
    ctx.fillText('Three.js:',bx+500,by+18);
    ctx.fillStyle='rgba(100,255,150,0.65)';ctx.font='10px monospace';
    s.shortcut.split('\n').forEach(function(l,li){ctx.fillText(l,bx+500,by+34+li*16);});
  } else {
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText('Hover any space to see what lives there, common bugs, and Three.js API',CW/2,panelY+PH+40);
  }

  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Complete coordinate space pipeline \u2014 Object \u2192 Screen',CW/2,CH-8);
}
draw();`,
      outputHeight: 420,
    },

    // ── Cell 9: Challenge — fragment shader space ─────────────────────────────
    {
      type: 'challenge',
      instruction: `In a Three.js \`ShaderMaterial\` vertex shader, you write: \`vPosition = position;\` and pass it as a varying to the fragment shader. In **which coordinate space** is \`position\` — and is \`vPosition\` in the fragment shader the same space?`,
      options: [
        { label: 'A', text: 'World Space — Three.js automatically transforms the built-in position attribute to world space before the vertex shader runs.' },
        { label: 'B', text: 'Object (Local) Space — the built-in position attribute is in object space. vPosition in the fragment shader is also in object space, since varyings are interpolated but not re-transformed.' },
        { label: 'C', text: 'View Space — all positions in Three.js shaders are in camera-relative coordinates by default.' },
        { label: 'D', text: 'NDC — position is already normalised between -1 and 1 for screen mapping.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! The built-in attribute `position` in a Three.js vertex shader is always in Object (Local) Space — the raw vertex positions from the geometry buffer. If you pass it as a varying without transformation, the fragment shader receives interpolated object-space coordinates. To get world-space position: `vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz`. To get view-space: `vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz`. Knowing which space your varyings are in prevents the most common lighting calculation errors.',
      failMessage: 'The built-in `position` attribute is always in Object Space — the raw vertex coordinates stored in the geometry buffer. Three.js does NOT pre-transform it. To use a different space: for world space write `(modelMatrix * vec4(position,1.0)).xyz`, for view space write `(modelViewMatrix * vec4(position,1.0)).xyz`. Varyings carry whatever you put in them — the GPU only interpolates the value, it does not change the coordinate space.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

  ],
};

export default {
  id: 'three-js-0-4-coordinate-spaces',
  slug: 'coordinate-spaces',
  chapter: 'three-js.0',
  order: 4,
  title: 'Coordinate Spaces',
  subtitle: 'Object, World, View, Clip, NDC, and Screen — and when data crosses between them.',
  tags: ['three-js', 'coordinate-spaces', 'world-space', 'view-space', 'clip-space', 'ndc', 'tangent-space', 'foundations'],
  hook: {
    question: 'A vertex is at (0,0,0) in object space. After four matrix multiplications, it becomes pixel (960,540) on a 1920×1080 screen. What are its exact coordinates at every stage along the way?',
    realWorldContext: 'Over 80% of confusing shader bugs — wrong normals, flipped directions, misaligned effects — are coordinate space bugs. Knowing which space every vector lives in eliminates an entire class of errors that trip up even experienced graphics engineers.',
  },
  intuition: {
    prose: [
      'Object space: raw vertex positions from the mesh buffer. Origin at the pivot.',
      'World space: after Model matrix. Shared scene coordinate system.',
      'View (Eye) space: after View matrix. Camera is always at (0,0,0) looking down -Z.',
      'Clip space: after Projection. W ≠ 1. GPU clips against the unit cube here.',
      'NDC: after ÷W. Everything in [-1,1]³. Automatic between vertex and fragment stages.',
      'Screen space: after viewport. Units = pixels. gl_FragCoord lives here.',
    ],
    callouts: [
      { type: 'important', title: 'The camera never moves', body: 'The View matrix is mathematically equivalent to moving the entire world opposite to the camera. The camera is always at the origin in Eye/View space. This is why it is also called Eye Space.' },
      { type: 'warning', title: 'Normal matrix is not model matrix', body: 'Never transform normals with the model matrix if the object has non-uniform scale. Use normalMatrix = transpose(inverse(mat3(modelViewMatrix))) — available as a Three.js built-in uniform.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Coordinate Spaces', props: { lesson: LESSON_3JS_0_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Six spaces: Object→(M)→World→(V)→Eye→(P)→Clip→(÷W)→NDC→(Viewport)→Screen',
    'ViewMatrix = inverse(cameraWorldMatrix). Camera always at origin in view space.',
    'normalMatrix = transpose(inverse(mat3(modelViewMatrix))). Non-uniform scale breaks plain model matrix normals.',
    'Tangent space (TBN): per-triangle space. Normal maps store RGB directions in tangent space.',
    'Three.js built-ins: modelMatrix, viewMatrix, projectionMatrix, modelViewMatrix, normalMatrix',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_4 };
