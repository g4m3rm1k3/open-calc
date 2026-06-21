import geoTransformUrl from '../diagrams/geo-transformations.svg?url'
import quizTransformUrl from '../diagrams/quiz-geo-transformations.svg?url'

const LESSON_GEO_3_4 = {
  title: 'Geometric Transformations',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Four Transformations, Two Families

**Rigid motions (isometries)** — preserve distance and angle:

| Transformation | Rule (about origin) | Changes |
|---|---|---|
| Translation by $(h,k)$ | $(x,y)\\to(x+h,y+k)$ | Position only |
| Reflection over $x$-axis | $(x,y)\\to(x,-y)$ | Orientation flips |
| Reflection over $y$-axis | $(x,y)\\to(-x,y)$ | Orientation flips |
| Rotation 90° CCW | $(x,y)\\to(-y,x)$ | Orientation, position |
| Rotation 180° | $(x,y)\\to(-x,-y)$ | Position |

**Dilation** — preserves shape, changes size:
$(x,y)\\to(kx,ky)$ from origin. Scale factor $k$: distances scale by $k$, area by $k^2$.

**Key fact**: any rigid motion = a composition of at most 3 reflections.`,
    },

    {
      type: 'js',
      instruction: `### Transformation Playground

Select a transformation. Drag the original triangle's vertices. The image updates live with the exact coordinate rule applied. Toggle **Composition** to chain two transformations and see the combined effect.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:10px;flex-wrap:wrap;align-items:center">
  <select id="t1" style="padding:5px 10px;border-radius:6px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
    <option value="tx">Translate (h,k)</option>
    <option value="rx">Reflect over x-axis</option>
    <option value="ry">Reflect over y-axis</option>
    <option value="rxy">Reflect over y=x</option>
    <option value="r90">Rotate 90° CCW</option>
    <option value="r180">Rotate 180°</option>
    <option value="r270">Rotate 270° CCW</option>
    <option value="dil">Dilation (scale k)</option>
  </select>
  <label id="hvbox" style="font-family:Georgia,serif;font-size:12px">h: <input type="range" id="hv" min="-6" max="6" value="3" style="width:80px"> <span id="hvV">3</span></label>
  <label id="kvbox" style="font-family:Georgia,serif;font-size:12px">k: <input type="range" id="kv" min="-6" max="6" value="2" style="width:80px"> <span id="kvV">2</span></label>
  <label id="kbox" style="font-family:Georgia,serif;font-size:12px" style="display:none">scale k: <input type="range" id="ks" min="0.25" max="4" step="0.25" value="2" style="width:80px"> <span id="ksV">2</span></label>
  <label style="font-family:Georgia,serif;font-size:12px"><input type="checkbox" id="showComp"> + second transformation: <select id="t2" style="padding:4px;border-radius:4px;border:1px solid #94a3b8;font-family:Georgia,serif;font-size:12px"><option value="r90">Rotate 90° CCW</option><option value="rx">Reflect x-axis</option><option value="ry">Reflect y-axis</option><option value="r180">Rotate 180°</option></select></label>
</div>
<canvas id="cv" width="700" height="340"></canvas>
<div id="info" style="padding:8px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:1.8"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block;cursor:crosshair}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

// dark-mode palette
var isDark=document.documentElement.classList.contains('dark');
var BG=isDark?'#1e293b':'#fafaf8';
var TEXT=isDark?'#e2e8f0':'#1e293b';
var MUTED=isDark?'#94a3b8':'#64748b';
var GRID=isDark?'#334155':'#e2e8f0';
var NAVY=isDark?'#93c5fd':'#1e3a5f';
var GREEN=isDark?'#4ade80':'#1a3a2a';
var AMBER=isDark?'#fb923c':'#92400e';
var PURPLE=isDark?'#a78bfa':'#7c3aed';
var RED=isDark?'#f87171':'#dc2626';
var BORDER=isDark?'#475569':'#d1d5db';

var OX=W/2,OY=H/2,UNIT=40;
var pts=[{x:2,y:1},{x:5,y:1},{x:3,y:5}];
var drag=-1;

function toScreen(p){return{x:OX+p.x*UNIT,y:OY-p.y*UNIT};}
function toGrid(sx,sy){return{x:(sx-OX)/UNIT,y:-(sy-OY)/UNIT};}

function applyT(p,t,h,k,ks){
  if(t==='tx')return{x:p.x+h,y:p.y+k};
  if(t==='rx')return{x:p.x,y:-p.y};
  if(t==='ry')return{x:-p.x,y:p.y};
  if(t==='rxy')return{x:p.y,y:p.x};
  if(t==='r90')return{x:-p.y,y:p.x};
  if(t==='r180')return{x:-p.x,y:-p.y};
  if(t==='r270')return{x:p.y,y:-p.x};
  if(t==='dil')return{x:p.x*ks,y:p.y*ks};
  return p;
}
function ruleStr(t,h,k,ks){
  if(t==='tx')return'(x,y)→(x+'+h+',y+'+k+')';
  if(t==='rx')return'(x,y)→(x,−y)';
  if(t==='ry')return'(x,y)→(−x,y)';
  if(t==='rxy')return'(x,y)→(y,x)';
  if(t==='r90')return'(x,y)→(−y,x)';
  if(t==='r180')return'(x,y)→(−x,−y)';
  if(t==='r270')return'(x,y)→(y,−x)';
  if(t==='dil')return'(x,y)→('+ks+'x,'+ks+'y)';
  return'';
}

function drawPoly(gpts,fill,stroke,dash){
  var spts=gpts.map(toScreen);
  ctx.beginPath();ctx.moveTo(spts[0].x,spts[0].y);
  spts.forEach(function(p){ctx.lineTo(p.x,p.y);});ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();
  ctx.strokeStyle=stroke;ctx.lineWidth=2.5;
  if(dash)ctx.setLineDash([6,4]);else ctx.setLineDash([]);
  ctx.stroke();ctx.setLineDash([]);
}
function labelPoly(gpts,names,color){
  gpts.forEach(function(p,i){
    var s=toScreen(p);
    ctx.beginPath();ctx.arc(s.x,s.y,5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
    ctx.fillStyle=color;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText(names[i]+'('+p.x.toFixed(1)+','+p.y.toFixed(1)+')',s.x,s.y-10);
  });
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  // Grid
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(var gx=-10;gx<=10;gx++){var sx=OX+gx*UNIT;ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke();}
  for(var gy=-8;gy<=8;gy++){var sy=OY-gy*UNIT;ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke();}
  // Axes
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
  // Grid numbers
  ctx.fillStyle='#94a3b8';ctx.font='10px Georgia';ctx.textAlign='center';
  for(var n=-8;n<=8;n++){if(n!==0){ctx.fillText(n,OX+n*UNIT,OY+14);ctx.fillText(n,OX-14,OY-n*UNIT+4);}}

  var t1v=document.getElementById('t1').value;
  var h=parseInt(document.getElementById('hv').value);
  var k=parseInt(document.getElementById('kv').value);
  var ks=parseFloat(document.getElementById('ks').value);
  var showComp=document.getElementById('showComp').checked;
  var t2v=document.getElementById('t2').value;
  document.getElementById('hvV').textContent=h;
  document.getElementById('kvV').textContent=k;
  document.getElementById('ksV').textContent=ks;

  // Show/hide controls
  document.getElementById('hvbox').style.display=(t1v==='tx')?'':'none';
  document.getElementById('kvbox').style.display=(t1v==='tx')?'':'none';
  document.getElementById('kbox').style.display=(t1v==='dil')?'':'none';

  // Mirror line
  if(t1v==='rx'){ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.strokeStyle=GREEN;ctx.lineWidth=2;ctx.setLineDash([8,4]);ctx.stroke();ctx.setLineDash([]);}
  if(t1v==='ry'){ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.strokeStyle=GREEN;ctx.lineWidth=2;ctx.setLineDash([8,4]);ctx.stroke();ctx.setLineDash([]);}
  if(t1v==='rxy'){ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W,0);ctx.strokeStyle=GREEN;ctx.lineWidth=2;ctx.setLineDash([8,4]);ctx.stroke();ctx.setLineDash([]);}

  // Original
  drawPoly(pts,'#1e3a5f22','#1e3a5f',false);
  labelPoly(pts,['A','B','C'],'#1e3a5f');

  // Image
  var img=pts.map(function(p){return applyT(p,t1v,h,k,ks);});
  drawPoly(img,'#dc262622','#dc2626',true);
  labelPoly(img,["A'","B'","C'"],'#dc2626');

  // Composition
  if(showComp){
    var img2=img.map(function(p){return applyT(p,t2v,h,k,ks);});
    drawPoly(img2,'#b4530922','#b45309',true);
    labelPoly(img2,["A''","B''","C''"],'#b45309');
  }

  document.getElementById('info').innerHTML=
    '<b>T1:</b> '+ruleStr(t1v,h,k,ks)
    +(showComp?'&emsp;<b>T2:</b> '+ruleStr(t2v,h,k,ks)+'&emsp;→ Composition applies T1 first, then T2':'')
    +'<br>Original area = '+Math.abs((pts[1].x-pts[0].x)*(pts[2].y-pts[0].y)-(pts[2].x-pts[0].x)*(pts[1].y-pts[0].y))/2+' sq units'
    +(t1v==='dil'?' → Image area = '+(Math.abs((pts[1].x-pts[0].x)*(pts[2].y-pts[0].y)-(pts[2].x-pts[0].x)*(pts[1].y-pts[0].y))/2*ks*ks).toFixed(2)+' sq units (×k²='+ks+'²='+(ks*ks)+')'
    :' → Image area = same (rigid motion)');
}

cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  drag=pts.findIndex(function(p){var s=toScreen(p);return Math.hypot(mx-s.x,my-s.y)<14;});
});
cv.addEventListener('mousemove',function(e){
  if(drag<0)return;
  var r=cv.getBoundingClientRect();
  var g=toGrid(e.clientX-r.left,e.clientY-r.top);
  pts[drag]={x:Math.round(g.x*2)/2,y:Math.round(g.y*2)/2};
  draw();
});
cv.addEventListener('mouseup',function(){drag=-1;});
['t1','hv','kv','ks','showComp','t2'].forEach(function(id){
  var el=document.getElementById(id);
  el.addEventListener('change',draw);el.addEventListener('input',draw);
});
draw();`,
      outputHeight: 480,
    },

    {
      type: 'js',
      instruction: `### Coordinate Rules for Every Transformation

All transformation rules are just formulas. This cell lets you type in any point and apply any combination of transformations step by step — perfect for checking homework or building intuition for composition order.`,
      html: `<div style="padding:10px 16px;background:var(--color-background-secondary,#f8fafc);display:grid;grid-template-columns:1fr 1fr;gap:10px;font-family:Georgia,serif;font-size:13px">
  <div>
    <div style="font-weight:700;color:#1e3a5f;margin-bottom:6px">Input point</div>
    <label>x: <input type="number" id="px" value="3" style="width:60px;padding:4px;border-radius:4px;border:1px solid #94a3b8"></label>
    <label style="margin-left:12px">y: <input type="number" id="py" value="4" style="width:60px;padding:4px;border-radius:4px;border:1px solid #94a3b8"></label>
  </div>
  <div>
    <div style="font-weight:700;color:#1e3a5f;margin-bottom:6px">Transformations to apply (in order)</div>
    <div id="tList" style="display:flex;flex-wrap:wrap;gap:6px">
      <button class="tBtn" data-t="r90" style="padding:4px 10px;border-radius:5px;border:1.5px solid #1e3a5f;background:#eff6ff;font-family:Georgia,serif;cursor:pointer">↺ 90° CCW</button>
      <button class="tBtn" data-t="r180" style="padding:4px 10px;border-radius:5px;border:1.5px solid #1e3a5f;background:#eff6ff;font-family:Georgia,serif;cursor:pointer">↺ 180°</button>
      <button class="tBtn" data-t="rx" style="padding:4px 10px;border-radius:5px;border:1.5px solid #dc2626;background:#fef2f2;font-family:Georgia,serif;cursor:pointer">Refl. x-axis</button>
      <button class="tBtn" data-t="ry" style="padding:4px 10px;border-radius:5px;border:1.5px solid #dc2626;background:#fef2f2;font-family:Georgia,serif;cursor:pointer">Refl. y-axis</button>
      <button class="tBtn" data-t="rxy" style="padding:4px 10px;border-radius:5px;border:1.5px solid #166534;background:#f0fdf4;font-family:Georgia,serif;cursor:pointer">Refl. y=x</button>
      <button id="resetBtn" style="padding:4px 10px;border-radius:5px;border:1px solid #94a3b8;background:#f1f5f9;font-family:Georgia,serif;cursor:pointer">Reset</button>
    </div>
  </div>
</div>
<div id="steps" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);min-height:80px;line-height:2"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}`,
      startCode: `var history=[];
function fmt(p){return'('+p.x+', '+p.y+')';}
function applyStep(p,t){
  if(t==='r90')return{x:-p.y,y:p.x,rule:'(x,y)→(−y,x)'};
  if(t==='r180')return{x:-p.x,y:-p.y,rule:'(x,y)→(−x,−y)'};
  if(t==='rx')return{x:p.x,y:-p.y,rule:'(x,y)→(x,−y)'};
  if(t==='ry')return{x:-p.x,y:p.y,rule:'(x,y)→(−x,y)'};
  if(t==='rxy')return{x:p.y,y:p.x,rule:'(x,y)→(y,x)'};
  return{x:p.x,y:p.y,rule:'identity'};
}
function render(){
  var px=parseFloat(document.getElementById('px').value)||0;
  var py=parseFloat(document.getElementById('py').value)||0;
  var cur={x:px,y:py};
  var html='<b>Start:</b> '+fmt(cur)+'<br>';
  history.forEach(function(t,i){
    var res=applyStep(cur,t);
    html+='Step '+(i+1)+': '+res.rule+' → <b>'+fmt(res)+'</b><br>';
    cur=res;
  });
  if(history.length===0)html+='<span style="color:#94a3b8">Click transformation buttons above to apply them in sequence.</span>';
  document.getElementById('steps').innerHTML=html;
}
document.querySelectorAll('.tBtn').forEach(function(btn){
  btn.addEventListener('click',function(){history.push(btn.dataset.t);render();});
});
document.getElementById('resetBtn').addEventListener('click',function(){history=[];render();});
['px','py'].forEach(function(id){document.getElementById(id).addEventListener('input',function(){history=[];render();});});
render();`,
      outputHeight: 240,
    },

    {
      type: 'challenge',
      instruction: `Triangle $PQR$ has vertices $P(1,1)$, $Q(3,1)$, $R(2,3)$. What are the coordinates after reflection over the $y$-axis followed by a 90° CCW rotation?`,
      options: [
        { label: 'A', text: "$P''(-1,-1)$, $Q''(-1,-3)$, $R''(-3,-2)$" },
        { label: 'B', text: "$P''(-1,1)$, $Q''(-1,3)$, $R''(-3,2)$" },
        { label: 'C', text: "$P''(1,-1)$, $Q''(1,-3)$, $R''(3,-2)$" },
        { label: 'D', text: "$P''(1,1)$, $Q''(1,3)$, $R''(3,2)$" },
      ],
      check: (label) => label === 'A',
      successMessage: "Correct. Step 1 — Reflect over y-axis: P→(-1,1), Q→(-3,1), R→(-2,3). Step 2 — Rotate 90° CCW using (x,y)→(-y,x): (-1,1)→(-1,-1), (-3,1)→(-1,-3), (-2,3)→(-3,-2). Order matters: T2∘T1 ≠ T1∘T2 in general.",
      failMessage: "Step 1: reflect over y-axis → (x,y)→(-x,y): P→(-1,1), Q→(-3,1), R→(-2,3). Step 2: rotate 90° CCW → (x,y)→(-y,x): (-1,1)→(-1,-1), (-3,1)→(-1,-3), (-2,3)→(-3,-2).",
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `A triangle with area $6$ sq units is dilated by scale factor $k = 3$. What is the area of the image?`,
      options: [
        { label: 'A', text: '$18$ sq units (area scales by $k$)' },
        { label: 'B', text: '$54$ sq units (area scales by $k^2 = 9$)' },
        { label: 'C', text: '$9$ sq units' },
        { label: 'D', text: '$6$ sq units (dilation preserves area)' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Dilation by k scales all lengths by k and all areas by k². Area → 6 × 3² = 6 × 9 = 54 sq units. This is why k=2 makes a shape 4× the area, not 2× — it\'s squared because area is two-dimensional.',
      failMessage: 'Dilation by k scales distances by k but area by k². Area = 6 × k² = 6 × 9 = 54. Think of it this way: a unit square becomes a k×k square with area k². Every region scales by the same factor k².',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-3-4',
  slug: 'transformations',
  chapter: 'geometry-3',
  subject: 'Geometry',
  title: 'Geometric Transformations',
  subtitle: 'Translation, reflection, rotation, and dilation — the four ways to move and resize a shape',
  tags: ['geometry', 'transformations', 'translation', 'reflection', 'rotation', 'dilation', 'isometry', 'composition'],
  hook: {
    question: 'How does a graphic designer move, flip, and resize a logo without distorting it — and what mathematics governs each operation?',
    realWorldContext: 'Computer graphics, animation, and robotics are built entirely on transformations. Every "move," "rotate," and "scale" command in Photoshop, Blender, or a game engine is a transformation formula applied to coordinate points. Architects use transformations to design symmetric buildings. Crystallography classifies crystals by their transformation symmetries.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Rigid motions (isometries)** preserve all distances and angles — the shape is congruent to its image. There are exactly three types: translations (slide), reflections (flip), and rotations (turn). Any composition of rigid motions is itself a rigid motion, and any rigid motion can be decomposed into at most three reflections.',
          '**Dilations** preserve angles and shape (the image is similar to the original) but scale all distances by $k$. Areas scale by $k^2$. A dilation with $k=1$ is the identity; with $0 < k < 1$, the image is smaller; with $k > 1$, larger.',
        ],
      },
      {
        type: 'image',
        src: geoTransformUrl,
        alt: 'Four panels on a grid background. Translation: triangle slid right by (+60,0), dashed image. Reflection over x=330: original and mirror-image triangle, orientation flipped. Rotation 90° CCW about origin: triangle and rotated image with 90° arc. Dilation scale k=2 from origin: original small triangle and doubled image with ray lines from O.',
        caption: 'All four transformations on a coordinate grid. Rigid motions preserve size; dilation scales it. The coordinate rules are formulas you can apply to every vertex.',
      },
      {
        type: 'math',
        tex: `\\text{Translate: }(x,y)\\to(x+h,y+k)\\quad\\text{Reflect }x\\text{-axis: }(x,y)\\to(x,-y)\\quad\\text{Rotate 90° CCW: }(x,y)\\to(-y,x)`,
        caption: 'Memorize these four rules. Rotation 180°: (x,y)→(-x,-y). Rotation 270° CCW (=90° CW): (x,y)→(y,-x). Reflect over y=x: (x,y)→(y,x).',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Composition**: when two transformations are applied in sequence, order matters. "Reflect over the $y$-axis, then rotate 90° CCW" gives a different result from "rotate first, then reflect." Always apply the first transformation to get the intermediate image, then apply the second transformation to that image.',
          '**Identifying transformations**: if orientation is preserved → translation or rotation. If orientation is reversed → reflection (or a composition with an odd number of reflections). If size changes → dilation is involved.',
        ],
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_3_4 },
        mathBridge: 'In the playground, drag the triangle and select Rotation 90° CCW to see (x,y)→(-y,x) applied live. Then tick the composition checkbox and select a second transformation — notice the result changes when you swap the order. In the step calculator, apply "Reflect y-axis" then "Rotate 90° CCW" to the point (3,4) and verify you get (-1,-3)... wait, check it yourself!',
      },
    ],
  },
  mentalModel: [
    'Rigid motions: Translate (x+h,y+k), Reflect x-axis (x,-y), Reflect y-axis (-x,y), Rotate 90°CCW (-y,x), Rotate 180° (-x,-y)',
    'Orientation preserved → translation or rotation. Orientation flipped → reflection involved',
    'Dilation by k: lengths ×k, area ×k². Shape unchanged (similar), size changes',
    'Composition order matters: T2∘T1 means apply T1 first, then T2. (T2∘T1)(P) = T2(T1(P))',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizTransformUrl,
      diagramAlt: 'Coordinate grid with original triangle PQR at (1,1)(3,1)(2,3) and three image triangles: A (reflected over y-axis), B (translated down), C (rotated 90° CW)',
      text: 'Which transformation maps triangle $PQR$ to Image A (the red dashed triangle at $(-1,1)(-3,1)(-2,3)$)?',
      options: [
        'Translation by $(-4,0)$',
        'Reflection over the $y$-axis: $(x,y)\\to(-x,y)$',
        'Rotation 180° about origin',
        'Reflection over the $x$-axis',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      diagram: quizTransformUrl,
      diagramAlt: 'Coordinate grid with original triangle PQR and three image triangles',
      text: 'Image B (green dashed) has vertices $(1,-2)(3,-2)(2,0)$. What transformation maps $PQR$ to Image B?',
      options: [
        'Reflection over the $x$-axis',
        'Translation by $(0,-3)$: $(x,y)\\to(x,y-3)$',
        'Rotation 90° CCW',
        'Dilation by $k=2$',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      diagram: quizTransformUrl,
      diagramAlt: 'Coordinate grid with original triangle PQR and three image triangles',
      text: 'Image C (orange dashed) maps $P(1,1)\\to(1,-1)$, $Q(3,1)\\to(1,-3)$, $R(2,3)\\to(3,-2)$. What transformation is this?',
      options: [
        'Rotation 90° CCW: $(x,y)\\to(-y,x)$',
        'Rotation 90° CW: $(x,y)\\to(y,-x)$',
        'Reflection over $y=x$',
        'Rotation 180°: $(x,y)\\to(-x,-y)$',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A point $(5,-3)$ is rotated $90°$ CCW about the origin. What are its new coordinates?',
      options: ['$(-5,3)$', '$(3,5)$', '$(-3,-5)$', '$(5,3)$'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Which transformation reverses orientation (turns a clockwise-labelled triangle into a counter-clockwise one)?',
      options: ['Translation', 'Rotation', 'Reflection', 'Dilation with positive $k$'],
      correct: 2,
    },
    {
      id: 'q6',
      type: 'choice',
      diagram: quizTransformUrl,
      diagramAlt: 'Right panel: original triangle (1,1)(2,1)(2,3) and dilated image (2,2)(4,2)(4,6) from origin O',
      text: 'In the dilation diagram, the original has vertices $(1,1)$, $(2,1)$, $(2,3)$. The image has $(2,2)$, $(4,2)$, $(4,6)$. What is the scale factor?',
      options: ['$k = 1$', '$k = 2$', '$k = 3$', '$k = 0.5$'],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'If a square of area $16$ is dilated by $k = 1.5$, what is the area of the image?',
      options: ['$24$', '$36$', '$48$', '$32$'],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Point $A(-2,3)$ is reflected over the line $y = x$. What is its image?',
      options: ['$(2,-3)$', '$(3,-2)$', '$(-3,2)$', '$(-2,-3)$'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'A shape is translated by $(3,-2)$ and then rotated $180°$. What single transformation is equivalent?',
      options: [
        'Translation by $(-3,2)$',
        'Rotation of $180°$ followed by translation $(-3,2)$',
        'Translation by $(3,-2)$ only',
        'There is no single equivalent transformation',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Which statement about rigid motions is FALSE?',
      options: [
        'They preserve all distances',
        'They preserve all angles',
        'A composition of two reflections is always a reflection',
        'Any rigid motion can be expressed as a composition of reflections',
      ],
      correct: 2,
    },
  ],
};

export { LESSON_GEO_3_4 };
