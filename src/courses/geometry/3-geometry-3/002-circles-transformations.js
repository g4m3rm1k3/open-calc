import geoCircleEquationUrl from '../diagrams/geo-circle-equation.svg?url'
import geoFourTransformationsUrl from '../diagrams/geo-four-transformations.svg?url'
import quizCircleEqUrl from '../diagrams/quiz-circle-equation-find.svg?url'

const LESSON_GEO_3_2 = {
  title: 'Circles and Transformations',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### A Circle Is a Distance Condition

Every point on a circle is exactly $r$ units from the center. That is the complete definition. The equation of a circle is just the distance formula turned into a condition:

Distance from $(x,y)$ to center $(h,k)$ equals $r$:
$$\\sqrt{(x-h)^2+(y-k)^2} = r$$

Square both sides:
$$(x-h)^2 + (y-k)^2 = r^2$$

This is the standard form. There is nothing new to memorize — it is Pythagoras applied to coordinates.`,
    },

    {
      type: 'js',
      instruction: `### Circle Equation Explorer

Drag the center point or pull the radius handle. Watch the equation update in real time. Notice how the center coordinates appear inside the parentheses (subtracted), and r² appears on the right.`,
      html: `<canvas id="cv" width="700" height="360"></canvas>
<div id="eq" style="padding:10px 16px;font-family:Georgia,serif;font-size:15px;text-align:center;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0)"></div>`,
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

var GRID=40,OX=W/2,OY=H/2;
var center={gx:2,gy:-1},radius=3;
var drag=null;

function toPx(gx,gy){return{x:OX+gx*GRID,y:OY-gy*GRID};}
function toGr(px,py){return{x:(px-OX)/GRID,y:(OY-py)/GRID};}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(var x=OX%GRID;x<W;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(var y=OY%GRID;y<H;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();
  // Axis numbers
  ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='center';
  for(var i=-8;i<=8;i++){if(!i)continue;ctx.fillText(i,OX+i*GRID,OY+14);}
  for(var j=-4;j<=4;j++){if(!j)continue;ctx.fillText(j,OX-16,OY-j*GRID+4);}

  var cp=toPx(center.gx,center.gy);
  var rPx=radius*GRID;

  // Circle fill
  ctx.beginPath();ctx.arc(cp.x,cp.y,rPx,0,Math.PI*2);
  ctx.fillStyle='#1e3a5f18';ctx.fill();
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;ctx.stroke();

  // Radius line
  var rHandle={x:cp.x+rPx,y:cp.y};
  ctx.setLineDash([5,4]);
  ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(cp.x,cp.y);ctx.lineTo(rHandle.x,rHandle.y);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=RED;ctx.font='11px Georgia';ctx.textAlign='left';
  ctx.fillText('r = '+radius,cp.x+rPx/2-8,cp.y-8);

  // Radius handle
  ctx.beginPath();ctx.arc(rHandle.x,rHandle.y,7,0,Math.PI*2);
  ctx.fillStyle=RED;ctx.fill();

  // Center dot
  ctx.beginPath();ctx.arc(cp.x,cp.y,7,0,Math.PI*2);
  ctx.fillStyle=NAVY;ctx.fill();
  ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='left';
  ctx.fillText('('+center.gx+', '+center.gy+')',cp.x+10,cp.y-10);

  // Equation
  var h=center.gx,k=center.gy,r2=radius*radius;
  var hStr=h>=0?'x − '+h:'x + '+Math.abs(h);
  var kStr=k>=0?'y − '+k:'y + '+Math.abs(k);
  document.getElementById('eq').innerHTML=
    '<b style="color:#1e3a5f;font-size:17px">('+hStr+')² + ('+kStr+')² = '+r2+'</b>'
    +'&emsp;<span style="color:#64748b;font-size:13px">center ('+h+', '+k+')  radius '+radius+'</span>';
}

var draggingCenter=false,draggingRadius=false;
cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*(W/r.width),py=(e.clientY-r.top)*(H/r.height);
  var cp=toPx(center.gx,center.gy);
  if(Math.hypot(px-cp.x-radius*GRID,py-cp.y)<14){draggingRadius=true;return;}
  if(Math.hypot(px-cp.x,py-cp.y)<14){draggingCenter=true;return;}
});
cv.addEventListener('mousemove',function(e){
  var r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*(W/r.width),py=(e.clientY-r.top)*(H/r.height);
  var cp=toPx(center.gx,center.gy);
  if(draggingCenter){
    var g=toGr(px,py);
    center.gx=Math.round(g.x);center.gy=Math.round(g.y);
  } else if(draggingRadius){
    radius=Math.max(1,Math.min(6,Math.round((px-cp.x)/GRID)));
  }
  if(draggingCenter||draggingRadius)draw();
});
cv.addEventListener('mouseup',function(){draggingCenter=false;draggingRadius=false;});
draw();`,
      outputHeight: 440,
    },

    {
      type: 'markdown',
      instruction: `### Transformations: Moving Shapes by Formula

A **geometric transformation** is a function that maps every point $(x, y)$ to a new point $(x', y')$. The four key transformations:

| Transformation | Rule | Preserves size? |
|---|---|---|
| Translation by $(a, b)$ | $(x,y) \\to (x+a, y+b)$ | ✓ Yes |
| Reflection over $x$-axis | $(x,y) \\to (x, -y)$ | ✓ Yes |
| Reflection over $y=x$ | $(x,y) \\to (y, x)$ | ✓ Yes |
| Rotation by $\\theta$ | $(x,y) \\to (x\\cos\\theta - y\\sin\\theta,\\ x\\sin\\theta + y\\cos\\theta)$ | ✓ Yes |
| Dilation by $k$ | $(x,y) \\to (kx, ky)$ | ✗ No (scales) |

Translation, reflection, and rotation are **rigid motions** — they preserve every distance and angle. Dilation preserves angles but changes distances.`,
    },

    {
      type: 'js',
      instruction: `### Transformations on a Triangle

Select a transformation and adjust its value. The blue triangle is the original; the red is the transformed image. Every vertex follows the formula — drag the angle slider for rotation to see the sine/cosine matrix in action.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:14px;flex-wrap:wrap;align-items:center">
  <select id="mode" style="padding:5px 10px;border-radius:6px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
    <option value="translate">Translation</option>
    <option value="reflect-x">Reflect over x-axis</option>
    <option value="reflect-y">Reflect over y-axis</option>
    <option value="reflect-yx">Reflect over y=x</option>
    <option value="rotate">Rotation</option>
    <option value="dilate">Dilation</option>
  </select>
  <span id="paramLabel" style="font-family:Georgia,serif;font-size:13px">tx:</span>
  <input type="range" id="param1" min="-5" max="5" value="3" style="width:120px">
  <span id="p1val" style="font-family:Georgia,serif;font-size:13px;min-width:30px">3</span>
  <span id="paramLabel2" style="font-family:Georgia,serif;font-size:13px">ty:</span>
  <input type="range" id="param2" min="-5" max="5" value="2" style="width:120px">
  <span id="p2val" style="font-family:Georgia,serif;font-size:13px;min-width:30px">2</span>
</div>
<canvas id="cv" width="700" height="300"></canvas>
<div id="rule" style="padding:8px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);text-align:center"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block}`,
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

var GRID=40,OX=W/2,OY=H/2;
var mode=document.getElementById('mode');
var p1=document.getElementById('param1'),p2=document.getElementById('param2');
var p1v=document.getElementById('p1val'),p2v=document.getElementById('p2val');

// Original triangle
var tri=[{x:-3,y:-1},{x:0,y:3},{x:2,y:-2}];

function toPx(gx,gy){return{x:OX+gx*GRID,y:OY-gy*GRID};}

function transform(v){
  var m=mode.value,a=parseFloat(p1.value),b=parseFloat(p2.value);
  if(m==='translate')return{x:v.x+a,y:v.y+b};
  if(m==='reflect-x')return{x:v.x,y:-v.y};
  if(m==='reflect-y')return{x:-v.x,y:v.y};
  if(m==='reflect-yx')return{x:v.y,y:v.x};
  if(m==='rotate'){var t=a*Math.PI/180;return{x:v.x*Math.cos(t)-v.y*Math.sin(t),y:v.x*Math.sin(t)+v.y*Math.cos(t)};}
  if(m==='dilate')return{x:v.x*a,y:v.y*a};
  return v;
}

function drawPoly(verts,col,alpha){
  var px=verts.map(function(v){return toPx(v.x,v.y);});
  ctx.beginPath();ctx.moveTo(px[0].x,px[0].y);
  px.forEach(function(p){ctx.lineTo(p.x,p.y);});
  ctx.closePath();
  ctx.fillStyle=col.replace(')',','+alpha+')').replace('rgb','rgba');
  ctx.fillStyle=col+'22';ctx.fill();
  ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
  px.forEach(function(p,i){
    ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();
  });
}

function updateControls(){
  var m=mode.value;
  document.getElementById('paramLabel').style.display=(m==='translate'||m==='rotate'||m==='dilate')?'':'none';
  p1.style.display=(m==='translate'||m==='rotate'||m==='dilate')?'':'none';
  p1v.style.display=(m==='translate'||m==='rotate'||m==='dilate')?'':'none';
  document.getElementById('paramLabel2').style.display=(m==='translate')?'':'none';
  p2.style.display=(m==='translate')?'':'none';
  p2v.style.display=(m==='translate')?'':'none';
  if(m==='translate'){document.getElementById('paramLabel').textContent='tx: ';document.getElementById('paramLabel2').textContent='ty: ';}
  if(m==='rotate'){document.getElementById('paramLabel').textContent='angle: ';p1.min=-180;p1.max=180;}
  if(m==='dilate'){document.getElementById('paramLabel').textContent='k: ';p1.min='-3';p1.max='3';p1.step='0.1';}
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(var x=OX%GRID;x<W;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(var y=OY%GRID;y<H;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();

  var m=mode.value,a=parseFloat(p1.value),b=parseFloat(p2.value);
  p1v.textContent=a;p2v.textContent=b;

  drawPoly(tri,'#1e3a5f',0.15);
  drawPoly(tri.map(transform),'#dc2626',0.15);

  var rule='';
  if(m==='translate')rule='Rule: (x, y) → (x + '+a+', y + '+b+')';
  if(m==='reflect-x')rule='Rule: (x, y) → (x, −y)';
  if(m==='reflect-y')rule='Rule: (x, y) → (−x, y)';
  if(m==='reflect-yx')rule='Rule: (x, y) → (y, x)';
  if(m==='rotate')rule='Rule: (x, y) → (x·cos'+a+'° − y·sin'+a+'°, x·sin'+a+'° + y·cos'+a+'°)';
  if(m==='dilate')rule='Rule: (x, y) → ('+a+'x, '+a+'y)   [scale factor k = '+a+']';
  document.getElementById('rule').innerHTML='<b>Blue = original &nbsp;|&nbsp; Red = image</b>&emsp;'+rule;
}

mode.addEventListener('change',function(){updateControls();draw();});
p1.addEventListener('input',draw);p2.addEventListener('input',draw);
updateControls();draw();`,
      outputHeight: 430,
    },

    {
      type: 'challenge',
      instruction: `A circle has equation $x^2 + y^2 - 4x + 6y - 3 = 0$. What are its center and radius?`,
      options: [
        { label: 'A', text: 'Center (2, -3), radius 4' },
        { label: 'B', text: 'Center (-2, 3), radius 4' },
        { label: 'C', text: 'Center (2, -3), radius 3' },
        { label: 'D', text: 'Center (4, -6), radius 3' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Complete the square: (x²−4x+4)+(y²+6y+9) = 3+4+9 = 16 → (x−2)²+(y+3)² = 16. Center (2,−3), radius √16 = 4.',
      failMessage: 'Complete the square on x: x²−4x → (x−2)²−4. On y: y²+6y → (y+3)²−9. So: (x−2)²−4+(y+3)²−9 = 3 → (x−2)²+(y+3)² = 16. Center (2,−3), radius 4.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `Point A(1, 2) is rotated 90° counterclockwise about the origin. What are the new coordinates?`,
      options: [
        { label: 'A', text: '(2, 1)' },
        { label: 'B', text: '(-2, 1)' },
        { label: 'C', text: '(-1, -2)' },
        { label: 'D', text: '(1, -2)' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Rotation by 90° CCW: (x,y) → (−y, x). So (1,2) → (−2, 1). The rotation matrix with θ=90°: cos90°=0, sin90°=1, so x\'=0·1−1·2=−2, y\'=1·1+0·2=1.',
      failMessage: 'Apply the rotation matrix with θ=90°: x\'=x·cos90°−y·sin90°=1·0−2·1=−2; y\'=x·sin90°+y·cos90°=1·1+2·0=1. Result: (−2, 1).',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-3-2',
  slug: 'circles-transformations',
  chapter: 'geometry-3',
  subject: 'Geometry',
  title: 'Circles and Transformations',
  subtitle: 'How the distance formula becomes a circle, and how shapes move without changing',
  tags: ['geometry', 'circles', 'transformations'],
  hook: {
    question: 'How do you describe a circle using only an equation?',
    realWorldContext: 'Every radar sweep, every ripple in water, every roundabout on a map is a circle. Engineers describe them not with a compass but with an equation derived directly from the distance formula — the same formula you already know.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**A circle is a distance condition.** A circle with center $(h, k)$ and radius $r$ is precisely the set of all points $(x, y)$ that are exactly $r$ units from the center. That is the whole definition. Apply the distance formula to "distance from $(x,y)$ to $(h,k)$ equals $r$" and square both sides:',
        ],
      },
      {
        type: 'math',
        tex: '(x - h)^2 + (y - k)^2 = r^2',
        caption: 'Standard form of a circle — center (h, k), radius r',
      },
      {
        type: 'image',
        src: geoCircleEquationUrl,
        alt: 'Circle with center (3, −2) and radius 5 plotted on coordinate axes. Equation box shows (x−3)²+(y+2)²=25 with center and radius identified.',
        caption: 'Standard form at a glance: center coordinates appear as (h, k), and r² on the right gives the radius by square root.',
      },
      {
        type: 'prose',
        paragraphs: [
          'This is not a new formula — it is the Pythagorean theorem applied to the horizontal and vertical distances from any point on the circle to its center. The center $(h,k)$ shifts the circle off the origin; the radius $r$ controls its size.',
          '**Reading the equation.** In standard form, the center and radius jump out immediately: the circle $(x-3)^2 + (y+2)^2 = 25$ has center $(3, -2)$ and radius $5$ (because $\\sqrt{25} = 5$). When you see $+2$ inside the parenthesis, the center is at $y = -2$ — the subtracted constant is the coordinate.',
          '**Expanded form.** Distributing gives $x^2 + y^2 - 6x + 4y - 12 = 0$. To reverse this, complete the square on the $x$-terms and $y$-terms separately, adding the same amounts to both sides to balance the equation. This converts expanded form back to standard form, revealing the center and radius.',
        ],
      },
      {
        type: 'viz',
        id: 'G3_3_CircleEquation',
        title: 'Circle Equation Explorer',
        mathBridge: 'Drag the center $(h, k)$ and adjust the radius $r$. Notice how the equation updates instantly — the numbers inside the parentheses track the center, and $r^2$ on the right tracks the radius squared. Try setting $h = 0$ and $k = 0$ to see why the origin-centered circle simplifies to $x^2 + y^2 = r^2$.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Transformations move and mirror shapes without changing them.** A geometric transformation is a function that maps every point of the plane to a new point. Four transformations preserve shape and size (the "rigid" transformations) and one scales without distorting (dilation).',
          'A **translation** slides every point by the same vector $(a, b)$: the new point is $(x + a,\\ y + b)$. Lines stay parallel, distances stay equal, the shape is merely relocated.',
          'A **reflection** flips every point over a line of symmetry (the mirror). Reflecting over the $x$-axis maps $(x, y) \\to (x, -y)$. Over the $y$-axis: $(x, y) \\to (-x, y)$. Over the line $y = x$: $(x, y) \\to (y, x)$.',
          'A **rotation** by angle $\\theta$ about the origin maps every point to a new location around the center:',
        ],
      },
      {
        type: 'math',
        tex: "\\begin{pmatrix} x' \\\\ y' \\end{pmatrix} = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix}",
        caption: 'Rotation matrix — this is why sine and cosine were first defined',
      },
      {
        type: 'prose',
        paragraphs: [
          'A **dilation** by scale factor $k$ about the origin maps $(x, y) \\to (kx, ky)$. When $k > 1$ the shape grows; when $0 < k < 1$ it shrinks; when $k < 0$ it also flips.',
          'The key insight: **every transformation can be described as a function on coordinates**. This is why transformations appear in both geometry and linear algebra — at advanced levels they are the same subject.',
        ],
      },
      {
        type: 'image',
        src: geoFourTransformationsUrl,
        alt: 'Four transformation panels: Translation (slide by vector), Reflection (flip over mirror line), Rotation (turn by angle θ), Dilation (scale by factor k). Each shows original shape dashed and transformed shape solid.',
        caption: 'Four transformations: translation, reflection, and rotation are rigid (preserve size); dilation scales. Each is a coordinate function.',
      },
      {
        type: 'viz',
        id: 'G3_4_Transformations',
        title: 'Geometric Transformations',
        mathBridge: 'Select a transformation type and adjust its parameters. Watch how each point of the shape follows the coordinate rule: translation adds a constant, reflection negates a coordinate, rotation applies the sine/cosine matrix. Notice that reflections and rotations preserve area and distance; dilation does not.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_3_2 },
        mathBridge: 'Drag the center point and radius handle in the circle explorer — the equation updates instantly. Then try the transformation tool: select Rotation, drag the angle slider, and watch the sine/cosine matrix acting on the triangle\'s coordinates. Try to complete the square manually on a circle in expanded form: $x^2+y^2-4x+6y-3=0$ — then verify with the circle explorer.',
      },
    ],
  },
  mentalModel: [
    'Circle = distance formula squared: every point (x,y) exactly r from center (h,k) gives (x−h)²+(y−k)²=r²',
    'Standard form reveals center and radius at a glance — completed square is the key to converting from expanded form',
    'Rigid transformations (translation, reflection, rotation) preserve shape and size — only position changes',
    'Rotation is why sine and cosine exist: the rotation matrix maps every point around the origin by angle θ',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizCircleEqUrl,
      diagramAlt: 'Circle centered at (−2, 2) with radius 3 plotted on coordinate axes.',
      text: 'Looking at the diagram — a circle with center (−2, 2) and radius 3. Which equation describes it?',
      options: [
        '$(x + 2)^2 + (y - 2)^2 = 9$',
        '$(x - 2)^2 + (y + 2)^2 = 9$',
        '$(x + 2)^2 + (y - 2)^2 = 3$',
      ],
      correct: 0,
    },
    {
      id: 'q1b',
      type: 'choice',
      text: 'The circle $(x - 2)^2 + (y + 5)^2 = 49$ has center and radius…',
      options: [
        'Center $(2, -5)$, radius $7$',
        'Center $(-2, 5)$, radius $49$',
        'Center $(2, 5)$, radius $7$',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The circle equation is derived from which foundational theorem?',
      options: [
        'The slope formula',
        'The Pythagorean theorem (via the distance formula)',
        'The quadratic formula',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A circle centered at the origin with radius $r$ has equation…',
      options: ['$x + y = r$', '$x^2 + y^2 = r^2$', '$x^2 + y^2 = r$'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Reflecting the point $(3, -4)$ over the $x$-axis gives…',
      options: ['$(-3, -4)$', '$(3, 4)$', '$(-3, 4)$'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Which transformation does NOT preserve the size of a shape?',
      options: ['Translation', 'Rotation', 'Dilation'],
      correct: 2,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The rotation matrix is built from sine and cosine because…',
      options: [
        'Sine and cosine were defined to describe rotation — that is their geometric origin',
        'Rotation requires multiplication, which sine and cosine speed up',
        'Sine and cosine only appear in trigonometry, not geometry',
      ],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Reflecting a point over the line $y = x$ maps $(a, b)$ to…',
      options: ['$(-a, -b)$', '$(b, a)$', '$(a, -b)$'],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A dilation by scale factor $\\frac{1}{2}$ about the origin maps $(6, 10)$ to…',
      options: ['$(3, 5)$', '$(12, 20)$', '$(-6, -10)$'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'To convert $x^2 + y^2 - 6x + 2y = 15$ to standard circle form, you should…',
      options: [
        'Factor out 2 from both sides',
        'Complete the square separately for $x$ and $y$, balancing each addition on both sides',
        'Divide every term by the leading coefficient',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A translation maps $(x, y) \\to (x + 4,\\ y - 3)$. Which statement is true?',
      options: [
        'The shape is reflected across a vertical line',
        'Every point shifts right 4 and down 3 — distances and angles are preserved',
        'The shape is scaled by a factor of 4 horizontally',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_3_2 };
