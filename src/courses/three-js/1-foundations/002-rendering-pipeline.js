// Three.js · Chapter 0 · Lesson 1
// What Is a Rendering Pipeline?

const LESSON_3JS_0_1 = {
  title: 'What Is a Rendering Pipeline?',
  subtitle: 'The journey of a vertex from 3D space to a pixel on your screen.',
  sequential: true,

  cells: [

    // ── Cell 1: Why a pipeline? ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Journey of a Vertex

You have a 3D point: \`(1.0, 0.5, 0.0)\`. Somewhere on your screen, at pixel \`(812, 394)\`, a specific colour appears. Between those two facts, your GPU executes five distinct transformations — each expressed as a matrix multiplication — that move the data from one coordinate system to the next.

This sequence is the **rendering pipeline**. Every GPU in every device follows it. Every 3D engine — Unreal, Unity, Godot, Three.js — builds on top of it. Understand it once and you understand all of them.

**The six coordinate spaces a vertex travels through:**

| Space | What happens here | The transform |
|---|---|---|
| **Object Space** | Vertex positions stored in the mesh file | — |
| **World Space** | Object placed in the shared scene | × Model matrix |
| **View (Eye) Space** | Scene shifted so camera is at origin, looking down −Z | × View matrix |
| **Clip Space** | Perspective frustum squashed into a cube. W ≠ 1 here | × Projection matrix |
| **NDC** | Divide all components by W. Result fits in [−1, 1]³ | ÷ W |
| **Screen Space** | Map NDC to pixel coordinates | × Viewport transform |

**Why do we need this many spaces?** Each transform solves a separate concern. The Model matrix knows where the object is. The View matrix knows where the camera is. The Projection matrix knows the field of view. Keeping them separate means each can change independently — move the camera without touching any object data, change the FOV without affecting the scene layout.

**The line in your vertex shader that does all of this:**
\`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\`

You will write that line in Lesson 1-5. This lesson makes sure you know exactly what it means.`,
    },

    // ── Cell 2: Pipeline Space Traveller ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Step Through the Pipeline\n\nA single vertex travels from Object Space to NDC. Press **Next Stage** to advance through each transform. Watch the coordinates change at every step — and notice which matrix is responsible.`,
      html: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 0 0;background:#0a0f1e">
  <div style="display:flex;gap:8px;align-items:center">
    <button id="btn-back" style="padding:7px 18px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-weight:700;font-size:12px;cursor:pointer">◀ Back</button>
    <span id="stage-label" style="color:#38bdf8;font-family:monospace;font-size:13px;font-weight:700;min-width:180px;text-align:center">Object Space (0/5)</span>
    <button id="btn-next" style="padding:7px 18px;border-radius:8px;border:none;background:#38bdf8;color:#0a0f1e;font-family:monospace;font-weight:700;font-size:12px;cursor:pointer">Next Stage ▶</button>
  </div>
  <canvas id="cv" width="700" height="340"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;border-radius:10px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var step=0;

var spaces=[
  {name:'Object Space',color:'#38bdf8',
   coords:'(1.00, 0.50, 0.00, 1.00)',
   desc:'Vertex position as stored in the mesh file. Origin = object pivot.',
   transform:'→  ×  Model Matrix  →',
   px:0.5,py:0.5},
  {name:'World Space',color:'#a78bfa',
   coords:'(3.00, 0.50, -5.00, 1.00)',
   desc:'After Model matrix: object placed in shared scene. W still = 1.',
   transform:'→  ×  View Matrix  →',
   px:0.5,py:0.5},
  {name:'View (Eye) Space',color:'#fb923c',
   coords:'(0.82, -1.15, -4.20, 1.00)',
   desc:'Camera at origin, looking down -Z. All scene data rotated around camera.',
   transform:'→  ×  Projection Matrix  →',
   px:0.5,py:0.5},
  {name:'Clip Space',color:'#f87171',
   coords:'(0.65, -0.91, 0.98, 4.20)',
   desc:'After Projection: frustum mapped to cube. W is NO LONGER 1!',
   transform:'→  ÷ W  →',
   px:0.15,py:0.22},
  {name:'NDC',color:'#4ade80',
   coords:'(0.15, -0.22, 0.23, 1.00)',
   desc:'After dividing by W=4.20. Result fits in [-1, 1]³. GPU clips here.',
   transform:'→  ×  Viewport Matrix  →  Pixel',
   px:0.15,py:0.22},
];

function updateLabel(){
  var s=spaces[step];
  document.getElementById('stage-label').textContent=s.name+' ('+step+'/'+( spaces.length-1)+')';
  document.getElementById('stage-label').style.color=s.color;
  document.getElementById('btn-back').style.opacity=step===0?'0.3':'1';
  document.getElementById('btn-next').style.opacity=step===spaces.length-1?'0.3':'1';
}

document.getElementById('btn-next').onclick=function(){if(step<spaces.length-1){step++;updateLabel();draw();}};
document.getElementById('btn-back').onclick=function(){if(step>0){step--;updateLabel();draw();}};

function drawAxes(cx,cy,sz,color){
  ctx.strokeStyle=color+'aa';ctx.lineWidth=1.5;
  // X axis
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+sz,cy);ctx.stroke();
  ctx.fillStyle=color+'aa';ctx.font='bold 9px monospace';ctx.textAlign='left';
  ctx.fillText('+X',cx+sz+2,cy+4);
  // Y axis
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,cy-sz);ctx.stroke();
  ctx.fillText('+Y',cx+2,cy-sz-4);
  // Z axis (isometric impression)
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx-sz*0.5,cy+sz*0.4);ctx.stroke();
  ctx.fillStyle=color+'66';ctx.fillText('-Z',cx-sz*0.5-14,cy+sz*0.4+10);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var PW=120,PH=160,PAD=10;
  var total=spaces.length;
  var startX=(W-total*PW-(total-1)*PAD)/2;
  var panelY=30;

  // Draw all panels
  for(var i=0;i<total;i++){
    var s=spaces[i];
    var px=startX+i*(PW+PAD);
    var isActive=i===step;

    // Panel background
    if(isActive){ctx.shadowColor=s.color;ctx.shadowBlur=18;}
    ctx.fillStyle=isActive?s.color+'22':'rgba(255,255,255,0.04)';
    ctx.strokeStyle=isActive?s.color:'rgba(255,255,255,0.12)';
    ctx.lineWidth=isActive?2:1;
    ctx.beginPath();ctx.roundRect(px,panelY,PW,PH,8);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;

    // Panel label
    ctx.fillStyle=isActive?s.color:'rgba(255,255,255,0.5)';
    ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText(s.name,px+PW/2,panelY+14);

    // Axes
    var axCx=px+PW/2,axCy=panelY+75;
    drawAxes(axCx,axCy,32,isActive?s.color:'rgba(255,255,255,0.25)');

    // Point dot
    var dotX=axCx+s.px*26;
    var dotY=axCy-s.py*26;
    if(isActive){ctx.shadowColor=s.color;ctx.shadowBlur=12;}
    ctx.beginPath();ctx.arc(dotX,dotY,isActive?6:4,0,Math.PI*2);
    ctx.fillStyle=isActive?s.color:'rgba(255,255,255,0.3)';
    ctx.fill();ctx.shadowBlur=0;

    // Space number tag
    ctx.fillStyle=isActive?s.color+'cc':'rgba(255,255,255,0.2)';
    ctx.font='bold 18px monospace';ctx.textAlign='center';
    ctx.fillText(i,px+PW/2,panelY+152);

    // Arrow between panels
    if(i<total-1){
      ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='8px monospace';ctx.textAlign='center';
      ctx.fillText('→',px+PW+PAD/2,panelY+80);
    }
  }

  // Active panel detail box
  var sel=spaces[step];
  var bx=20,by=panelY+PH+20,bw=W-40,bh=84;
  ctx.fillStyle=sel.color+'18';ctx.strokeStyle=sel.color+'44';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();ctx.stroke();

  // Coordinates
  ctx.fillStyle=sel.color;ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText('Position: '+sel.coords,bx+14,by+24);

  // Description
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='11px monospace';
  ctx.fillText(sel.desc,bx+14,by+44);

  // Next transform hint
  if(step<spaces.length-1){
    ctx.fillStyle='rgba(255,255,255,0.38)';ctx.font='10px monospace';
    ctx.fillText('Next: '+sel.transform,bx+14,by+64);
  }else{
    ctx.fillStyle='#4ade80aa';ctx.font='bold 10px monospace';
    ctx.fillText('Pipeline complete — GPU rasterises and fragments from here.',bx+14,by+64);
  }

  updateLabel();
}
draw();`,
      outputHeight: 430,
    },

    // ── Cell 3: Challenge — View matrix ──────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You want to move the camera 5 units to the right in your scene. Which of these correctly describes what the View matrix does to achieve this?`,
      options: [
        { label: 'A', text: 'It moves the camera 5 units right by changing the camera object\'s position attribute.' },
        { label: 'B', text: 'It moves the entire world 5 units LEFT. The camera is always mathematically fixed at the origin in View Space — the world moves around it.' },
        { label: 'C', text: 'It changes the Projection matrix\'s field of view to simulate the camera offset.' },
        { label: 'D', text: 'It saves the camera\'s previous position and restores it after the draw call.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! The View matrix is the inverse of the camera\'s world transform. Moving the camera right by 5 is mathematically identical to moving the entire world left by 5 — and the GPU does the latter. In View Space, the camera always sits at the origin looking down the −Z axis. This is why it is called "Eye Space": your eye is always at (0,0,0).',
      failMessage: 'The View matrix does not move a camera object — there is no camera in the GPU pipeline, only data. Instead, it transforms the entire scene into a coordinate frame where the camera is at the origin looking down −Z. Moving a camera right is achieved by moving the world left by the same amount. The mathematical operation is: ViewMatrix = inverse(cameraWorldMatrix).',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 4: Homogeneous coords & perspective divide ───────────────────────
    {
      type: 'markdown',
      instruction: `### Homogeneous Coordinates and the Perspective Divide

You may have noticed that every position in the pipeline table carries **four** components: (x, y, z, **w**). This is not padding. The W component carries perspective information — and the **perspective divide** (dividing all components by W) is the single operation that makes objects appear smaller as they move further away.

**Why four components?** A 4×4 matrix can represent translation in a 3×3 space only if we extend 3D vectors to 4D using homogeneous coordinates. A point at (x, y, z) in 3D space becomes (x, y, z, 1) in homogeneous space. When W = 1, everything behaves normally: the point is exactly where its coordinates say.

**What happens to W?** The projection matrix is specifically designed to write depth information into the W component. After multiplying by the projection matrix, a point at depth −5 in view space might become clip-space coordinates with W = 5.0. The actual x, y, z values are *not* yet in normalised form — they retain the scale factor.

**The perspective divide** converts clip space to NDC by dividing x, y, z all by W:

\`NDC = (x/W, y/W, z/W)\`

This single division is what creates perspective foreshortening. A point far away gets a large W, so dividing by W produces a smaller NDC value — the point appears closer to the display centre. A point nearby has a small W, so its NDC coordinates remain large — it appears further from centre.

**The GPU does this automatically** between the vertex stage and the fragment stage. You never call ÷W explicitly — you just write clip-space position to gl_Position and the hardware performs the divide before rasterisation.

**In NDC space:**
- x ∈ [−1, 1] where −1 = left edge, +1 = right edge
- y ∈ [−1, 1] where −1 = bottom, +1 = top *(note: OpenGL/WebGL, +Y is up)*
- z ∈ [−1, 1] where −1 = near plane, +1 = far plane
- w = 1 after the divide (always)`,
    },

    // ── Cell 5: Perspective Divide Explorer ──────────────────────────────────
    {
      type: 'js',
      instruction: `### The Perspective Divide — Interactive\n\nHere a clip-space point has fixed X = 3.0 and Y = 2.0, but you control **W**. Drag the W slider and watch the NDC coordinates change. At W = 1, clip space equals NDC. As W grows, the point moves toward the screen centre — exactly what perspective foreshortening does to distant objects.`,
      html: `<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;cursor:col-resize;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var w=1.0,dragging=false;
var SLIDER_X=140,SLIDER_W=420,SLIDER_Y=220;

// Fixed clip coords
var cx=3.0,cy=2.0,cz=1.5;

function toSlider(val){return SLIDER_X+(val-0.5)/4.5*SLIDER_W;}
function fromSlider(px){return 0.5+(px-SLIDER_X)/SLIDER_W*4.5;}

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

canvas.onmousedown=function(e){
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(W/r.width);
  var my=(e.clientY-r.top)*(H/r.height);
  if(Math.abs(my-SLIDER_Y)<20&&mx>=SLIDER_X-10&&mx<=SLIDER_X+SLIDER_W+10){
    dragging=true;w=clamp(fromSlider(mx),0.5,5.0);draw();
  }
};
canvas.onmousemove=function(e){
  if(!dragging)return;
  var r=canvas.getBoundingClientRect();
  var mx=(e.clientX-r.left)*(W/r.width);
  w=clamp(fromSlider(mx),0.5,5.0);draw();
};
canvas.onmouseup=function(){dragging=false;};
canvas.onmouseleave=function(){dragging=false;};

function drawPoint(px,py,label,val,color,sz){
  ctx.beginPath();ctx.arc(px,py,sz,0,Math.PI*2);
  ctx.fillStyle=color;
  if(sz>8){ctx.shadowColor=color;ctx.shadowBlur=14;}
  ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle=color;ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText(label,px,py-sz-6);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='9px monospace';
  ctx.fillText(val,px,py+sz+14);
}

function drawSpace(ox,oy,sz,title,color){
  // Axes
  ctx.strokeStyle=color+'55';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ox-sz,oy);ctx.lineTo(ox+sz,oy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ox,oy-sz);ctx.lineTo(ox,oy+sz);ctx.stroke();
  // Border
  ctx.strokeStyle=color+'33';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.rect(ox-sz,oy-sz,sz*2,sz*2);ctx.stroke();
  // Labels
  ctx.fillStyle=color+'aa';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText(title,ox,oy-sz-10);
  ctx.font='8px monospace';
  ctx.fillStyle='rgba(255,255,255,0.25)';
  ctx.fillText('-1',ox-sz+8,oy+sz-4);
  ctx.fillText('+1',ox+sz-8,oy+sz-4);
  ctx.fillText('+1',ox+14,oy-sz+10);
  ctx.fillText('-1',ox+14,oy+sz-4);
  // Clip boundary indicator (outside = clipped)
  ctx.strokeStyle=color+'22';ctx.lineWidth=0.5;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.rect(ox-sz*2,oy-sz*2,sz*4,sz*4);ctx.stroke();ctx.setLineDash([]);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var SZ=90;
  var lx=180,ly=130;  // Clip space panel centre
  var rx=520,ry=130;  // NDC space panel centre

  // Clip space panel
  drawSpace(lx,ly,SZ,'Clip Space','#f87171');

  // NDC space panel
  drawSpace(rx,ry,SZ,'NDC Space','#4ade80');

  // Clip point (no divide yet — might be outside the box for large W)
  var cpx=lx+(cx/5)*SZ;
  var cpy=ly-(cy/5)*SZ;
  var inClip=(Math.abs(cx*1)<=5&&Math.abs(cy*1)<=5);
  drawPoint(cpx,cpy,'Clip','('+cx.toFixed(1)+', '+cy.toFixed(1)+', w='+w.toFixed(2),'#f87171',inClip?8:5);


  // NDC point (after divide)
  var ndx=cx/w,ndy=cy/w;
  var npx=rx+clamp(ndx,-1,1)*SZ;
  var npy=ry-clamp(ndy,-1,1)*SZ;
  var col=Math.abs(ndx)<=1&&Math.abs(ndy)<=1?'#4ade80':'#f87171';
  drawPoint(npx,npy,'NDC','('+ndx.toFixed(2)+', '+ndy.toFixed(2)+')',col,10);

  // Arrow
  ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(lx+SZ+8,ly);ctx.lineTo(rx-SZ-8,ry);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('÷ W',W/2,ly-10);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='9px monospace';
  ctx.fillText('(divide x, y, z each by W)',W/2,ly+6);

  // W Slider
  ctx.fillStyle='rgba(255,255,255,0.1)';
  ctx.beginPath();ctx.roundRect(SLIDER_X,SLIDER_Y-6,SLIDER_W,12,6);ctx.fill();

  var filled=toSlider(w)-SLIDER_X;
  ctx.fillStyle='#38bdf8';
  ctx.beginPath();ctx.roundRect(SLIDER_X,SLIDER_Y-6,filled,12,6);ctx.fill();

  var sx=toSlider(w);
  ctx.beginPath();ctx.arc(sx,SLIDER_Y,12,0,Math.PI*2);
  ctx.fillStyle='#38bdf8';ctx.shadowColor='#38bdf8';ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;

  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('W  =  '+w.toFixed(2)+'  (drag to change)',W/2,SLIDER_Y+30);
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px monospace';
  ctx.fillText('0.5',SLIDER_X,SLIDER_Y+30);
  ctx.fillText('5.0',SLIDER_X+SLIDER_W,SLIDER_Y+30);

  // Header
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('Perspective Divide: Clip Space  ÷  W  =  NDC',W/2,18);
}
draw();`,
      outputHeight: 340,
    },

    // ── Cell 6: Challenge — NDC calculation ──────────────────────────────────
    {
      type: 'challenge',
      instruction: `A vertex exits the vertex shader with clip-space coordinates **(4.0, 2.0, 1.0, 2.0)** — that is, x=4, y=2, z=1, w=2. The GPU performs the perspective divide automatically. What are the resulting **NDC coordinates**?`,
      options: [
        { label: 'A', text: 'NDC = (4.0, 2.0, 1.0) — the GPU keeps the original values intact until rasterisation' },
        { label: 'B', text: 'NDC = (2.0, 1.0, 0.5) — divide x, y, z each by W=2.0, giving (4/2, 2/2, 1/2)' },
        { label: 'C', text: 'NDC = (0.5, 0.25, 0.125) — divide by W then divide again by the far plane distance' },
        { label: 'D', text: 'NDC = (4.0, 2.0, 0.5) — only the Z component is divided by W for depth' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! The perspective divide applies to ALL three of x, y, and z. NDC = (x/w, y/w, z/w) = (4/2, 2/2, 1/2) = (2.0, 1.0, 0.5). Notice that x=2.0 is outside the NDC cube (which requires x ∈ [−1, 1]) — this vertex would be clipped by the GPU before reaching the fragment shader. Clipping happens in clip space just before the divide.',
      failMessage: 'The perspective divide divides ALL of x, y, z by W — not just z. The formula is NDC = (x/w, y/w, z/w) = (4/2, 2/2, 1/2) = (2.0, 1.0, 0.5). The result lands outside [−1,1] in x and y, so this vertex would actually be clipped by the GPU before it ever reaches the fragment shader.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

    // ── Cell 7: Barycentric coordinates ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Barycentric Coordinates and Rasterisation

The rasteriser knows which pixels fall inside each triangle. But how does it compute the colour, UV coordinate, or normal at an interior pixel — given only values at the three vertices?

The answer is **barycentric coordinates**: a system that expresses any point P inside a triangle as a weighted combination of the three vertices A, B, C:

\`P = α·A + β·B + γ·C\`

Where α, β, γ are the barycentric weights, and they always satisfy:

\`α + β + γ = 1  (the weights always sum to one)\`

Geometrically, each weight is the fraction of the total triangle area on the opposite side of P. When P is exactly at vertex A, the weight α = 1 and β = γ = 0. When P is at the midpoint of edge BC, α = 0 and β = γ = 0.5.

**Why does this matter so much?** Because the rasteriser uses barycentric coordinates to interpolate **every** per-vertex attribute across the triangle surface:

- Vertex colours → smooth gradient across the triangle
- Texture coordinates (UVs) → correct texture stretching over the surface
- Normals → smooth shading surface even from a coarse mesh
- Any other \`out\` variable from the vertex shader → interpolated automatically

**What does a negative weight mean?** If P is outside the triangle, at least one weight becomes negative. The GPU tests all three weights: if any is negative, the fragment is discarded — it is outside the triangle. This is the fundamental clipping test at the fragment level.

**Perspective-correct interpolation:** Naively, interpolating UV coordinates in screen space produces the "swimming" texture bug on perspective-viewed quads. The correct fix (done automatically by the GPU) is to divide by W during interpolation, then multiply back. You never do this manually — it is handled by the hardware.`,
    },

    // ── Cell 8: Barycentric Explorer ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Barycentric Coordinate Explorer\n\nHover anywhere inside or outside the triangle. The three barycentric weights (α, β, γ) update live. The interior colour is the weighted mix of the three vertex colours. Move outside the triangle and watch a weight go **negative** — that fragment is discarded by the GPU.`,
      html: `<canvas id="cv" width="700" height="340" style="cursor:crosshair"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var mx=W/2,my=H/2;

// Triangle vertices + colours
var A={x:200,y:280,r:1,g:0,b:0};   // Red vertex
var B={x:500,y:280,r:0,g:0.85,b:0.4}; // Green vertex
var C={x:350,y:80, r:0.22,g:0.55,b:1}; // Blue vertex

canvas.onmousemove=function(e){
  var rect=canvas.getBoundingClientRect();
  mx=(e.clientX-rect.left)*(W/rect.width);
  my=(e.clientY-rect.top)*(H/rect.height);
  draw();
};

function bary(px,py){
  var denom=(B.y-C.y)*(A.x-C.x)+(C.x-B.x)*(A.y-C.y);
  var al=((B.y-C.y)*(px-C.x)+(C.x-B.x)*(py-C.y))/denom;
  var be=((C.y-A.y)*(px-C.x)+(A.x-C.x)*(py-C.y))/denom;
  var ga=1-al-be;
  return {al:al,be:be,ga:ga};
}

function inside(b){return b.al>=0&&b.be>=0&&b.ga>=0;}

function lerpCol(b){
  var r=b.al*A.r+b.be*B.r+b.ga*C.r;
  var g=b.al*A.g+b.be*B.g+b.ga*C.g;
  var bl=b.al*A.b+b.be*B.b+b.ga*C.b;
  r=Math.max(0,Math.min(1,r));
  g=Math.max(0,Math.min(1,g));
  bl=Math.max(0,Math.min(1,bl));
  return 'rgb('+Math.round(r*255)+','+Math.round(g*255)+','+Math.round(bl*255)+')';
}

function toHex(b){
  var r=Math.round(Math.max(0,Math.min(1,b.al*A.r+b.be*B.r+b.ga*C.r))*255);
  var g=Math.round(Math.max(0,Math.min(1,b.al*A.g+b.be*B.g+b.ga*C.g))*255);
  var bl=Math.round(Math.max(0,Math.min(1,b.al*A.b+b.be*B.b+b.ga*C.b))*255);
  return 'rgb('+r+','+g+','+bl+')';
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Fill triangle with gradient (sample-based)
  var steps=2;
  var minX=Math.min(A.x,B.x,C.x),maxX=Math.max(A.x,B.x,C.x);
  var minY=Math.min(A.y,B.y,C.y),maxY=Math.max(A.y,B.y,C.y);
  for(var iy=minY;iy<=maxY;iy+=steps){
    for(var ix=minX;ix<=maxX;ix+=steps){
      var b=bary(ix,iy);
      if(inside(b)){
        ctx.fillStyle=toHex(b);
        ctx.fillRect(ix,iy,steps,steps);
      }
    }
  }

  // Triangle outline
  ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.stroke();

  // Vertex dots + labels
  var verts=[
    {v:A,label:'A (α=1)',sub:'Red vertex'},
    {v:B,label:'B (β=1)',sub:'Green vertex'},
    {v:C,label:'C (γ=1)',sub:'Blue vertex'},
  ];
  verts.forEach(function(item){
    var col='rgb('+Math.round(item.v.r*255)+','+Math.round(item.v.g*255)+','+Math.round(item.v.b*255)+')';
    ctx.beginPath();ctx.arc(item.v.x,item.v.y,10,0,Math.PI*2);
    ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='bold 10px monospace';ctx.textAlign='center';
    var ly=item.v.y===280?item.v.y+22:item.v.y-16;
    ctx.fillText(item.label,item.v.x,ly);
  });

  // Current bary coords
  var b=bary(mx,my);
  var isIn=inside(b);

  // Lines from vertices to mouse
  if(isIn){
    [A,B,C].forEach(function(v){
      ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.lineTo(mx,my);ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  // Cursor dot
  var pointCol=isIn?toHex(b):'#f87171';
  ctx.beginPath();ctx.arc(mx,my,isIn?8:6,0,Math.PI*2);
  ctx.fillStyle=pointCol;ctx.shadowColor=pointCol;ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;

  // Info panel
  var px2=W-240,ipY=14,ipW=224,ipH=isIn?150:130;
  ctx.fillStyle='rgba(10,15,30,0.92)';ctx.strokeStyle=isIn?'rgba(255,255,255,0.2)':'#f87171aa';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(px2,ipY,ipW,ipH,10);ctx.fill();ctx.stroke();

  ctx.font='bold 11px monospace';ctx.textAlign='left';

  var alCol=b.al<0?'#f87171':'rgba(255,255,255,0.85)';
  var beCol=b.be<0?'#f87171':'rgba(255,255,255,0.85)';
  var gaCol=b.ga<0?'#f87171':'rgba(255,255,255,0.85)';

  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';
  ctx.fillText('Barycentric weights:',px2+12,ipY+20);

  ctx.fillStyle=alCol;ctx.font='bold 12px monospace';
  ctx.fillText('  \u03B1  =  '+(b.al<0?'':'')+b.al.toFixed(3)+(b.al<0?' \u2190 NEGATIVE':' (A weight)'),px2+12,ipY+40);
  ctx.fillStyle=beCol;
  ctx.fillText('  \u03B2  =  '+b.be.toFixed(3)+(b.be<0?' \u2190 NEGATIVE':' (B weight)'),px2+12,ipY+58);
  ctx.fillStyle=gaCol;
  ctx.fillText('  \u03B3  =  '+b.ga.toFixed(3)+(b.ga<0?' \u2190 NEGATIVE':' (C weight)'),px2+12,ipY+76);

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';
  ctx.fillText('  sum = '+(b.al+b.be+b.ga).toFixed(3),px2+12,ipY+92);

  if(isIn){
    ctx.fillStyle=toHex(b);ctx.font='bold 11px monospace';
    ctx.fillText('  colour = '+toHex(b),px2+12,ipY+112);
    ctx.fillStyle='#4ade80';ctx.font='bold 10px monospace';
    ctx.fillText('  \u2713 Inside triangle',px2+12,ipY+132);
  }else{
    ctx.fillStyle='#f87171';ctx.font='bold 10px monospace';
    ctx.fillText('  \u2717 Outside \u2014 fragment discarded',px2+12,ipY+110);
  }

  // Title
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('Barycentric Explorer \u2014 hover to explore',W/2,H-10);
}
draw();`,
      outputHeight: 400,
    },

    // ── Cell 9: Challenge — negative barycentric weight ───────────────────────
    {
      type: 'challenge',
      instruction: `A fragment shader is about to execute for a pixel. The GPU computes its barycentric weights as: α = 0.7, β = 0.5, γ = −0.2. What does the GPU do — and why?`,
      options: [
        { label: 'A', text: 'The GPU executes the fragment shader and clamps the negative weight to 0 before interpolating attributes.' },
        { label: 'B', text: 'The GPU discards this fragment entirely — it is outside the triangle. Any negative barycentric weight means the point does not lie within the triangle bounds.' },
        { label: 'C', text: 'The GPU sets all three weights to 1/3 since the sum (0.7+0.5−0.2 = 1.0) is correct.' },
        { label: 'D', text: 'The GPU flags a divide-by-zero error and outputs a solid pink debug colour.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! A negative barycentric weight means the point lies outside the triangle on the opposite side of the corresponding edge. Note that the weights still sum to 1 (0.7 + 0.5 − 0.2 = 1.0) — that is always true regardless of whether the point is inside or outside. The GPU\'s rasteriser discards any fragment where any weight is negative. This is the fundamental mechanism of "not drawing what isn\'t part of this triangle."',
      failMessage: 'A negative barycentric weight definitively means the point is outside the triangle. The GPU discards it — no fragment shader runs. Notice the weights still sum to 1.0 (0.7 + 0.5 − 0.2 = 1.0), which is always true. The sign of each weight determines inside/outside, not the sum. Clamping a negative weight would produce incorrect attribute interpolation and is never done.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 280,
    },

  ],
};

export default {
  id: 'three-js-0-1-rendering-pipeline',
  slug: 'rendering-pipeline',
  chapter: 'three-js.0',
  order: 1,
  title: 'What Is a Rendering Pipeline?',
  subtitle: 'The journey of a vertex from 3D space to a pixel on your screen.',
  tags: ['three-js', 'pipeline', 'homogeneous-coordinates', 'ndc', 'clip-space', 'barycentric', 'foundations'],
  hook: {
    question: 'A 3D point at (1.0, 0.5, 0.0) ends up as a pixel at (812, 394) on your 1080p screen. Between those two numbers, five matrix multiplications happen. What are they — and which two can you write code for?',
    realWorldContext: 'Every GPU in every device — from a $20 microcontroller to a $2000 workstation card — executes this exact sequence of transforms for every vertex, every frame, every draw call. Understanding it once means understanding all of them.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Six spaces: Object → World (×M) → View (×V) → Clip (×P) → NDC (÷W) → Screen (×Viewport)',
      'W component: carries perspective depth. Dividing by W is what makes distant things appear smaller.',
      'Barycentric coordinates: α+β+γ=1. Negative weight = point outside triangle = fragment discarded.',
      'The GPU automatically performs the perspective divide and barycentric interpolation — you never call them explicitly.',
    ],
    callouts: [
      { type: 'important', title: 'The camera never moves', body: 'The View matrix transforms the entire world to be relative to the camera. In View Space, the camera is always at (0,0,0) looking down −Z. Moving the camera right = moving the world left.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'What Is a Rendering Pipeline?', props: { lesson: LESSON_3JS_0_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Pipeline: Object →(M)→ World →(V)→ View →(P)→ Clip →(÷W)→ NDC →(Viewport)→ Screen',
    'Homogeneous coords: (x,y,z,w). When w=1: point behaves normally. Projection matrix gives w≠1.',
    'NDC = (x/w, y/w, z/w). Done automatically by GPU between vertex shader and rasterisation.',
    'Barycentric: P = αA + βB + γC, α+β+γ=1. Negative weight → outside triangle → discard.',
    'In shaders: gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_1 };
