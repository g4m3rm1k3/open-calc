import geoOptUrl from '../diagrams/geo-optimization.svg?url'
import quizOptUrl from '../diagrams/quiz-geo-optimization.svg?url'

const LESSON_GEO_6_7 = {
  title: 'Optimization with Geometry',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Optimization with Geometry

Optimization means finding the **maximum** or **minimum** value of a quantity subject to a constraint.

**The strategy (no calculus required):**
1. Identify the **objective** (what to maximize or minimize)
2. Identify the **constraint** (what is fixed)
3. Express the objective in **one variable** using the constraint
4. For a quadratic $f(x) = ax^2+bx+c$: vertex at $x = -b/(2a)$ gives the extremum

**Classic problems:**

| Problem | Constraint | Objective | Optimal shape |
|---|---|---|---|
| Max area, fixed perimeter | P fixed | Area → max | Circle (isoperimetric) or square (rectangles) |
| Min perimeter, fixed area | A fixed | Perimeter → min | Circle or square |
| Fence along river | L fence, 1 free side | A = w(L-2w) | w = L/4, l = L/2 |
| Open box from sheet | Sheet a×b, cut x | V = x(a-2x)(b-2x) | Solve cubic or graph |
| Minimum can SA | Volume V fixed | SA = 2πr²+2πrh | h = 2r (cube-like) |

**Isoperimetric inequality:** For a fixed perimeter P, the maximum enclosed area is $A_{\\max} = P^2/(4\\pi)$, achieved only by a circle.

**Vertex formula:** If $A = -2w^2 + Lw$, max is at $w = L/4$.

![Optimization examples: fence, area maximization, open box](${geoOptUrl})`,
    },

    {
      type: 'js',
      instruction: 'Drag the slider to change the width w of a rectangular pen against a river wall (fixed 200m of fence). Watch area update live and the parabola trace the objective function.',
      html: `<div style="font-family:monospace;font-size:12px;padding:6px">
<label>Width w: <input id="wSlider" type="range" min="1" max="99" value="50" style="width:200px"> <span id="wVal">50</span> m</label>
<span id="optLabel" style="margin-left:12px;font-weight:bold;color:#166534"></span>
</div>
<canvas id="optCV" width="580" height="280" style="border-radius:8px;display:block;margin:4px auto"></canvas>
<div id="optInfo" style="font-family:monospace;font-size:12px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:4px"></div>`,
      css: `#optCV{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('optCV');
const ctx=cv.getContext('2d');
const W=cv.width,H=cv.height;

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

const info=document.getElementById('optInfo');
const wSlider=document.getElementById('wSlider');
const wVal=document.getElementById('wVal');
const optLabel=document.getElementById('optLabel');
const L=200; // total fence

// Left panel: physical pen. Right panel: parabola A(w)
const PX=20,PY=60,PW=220,PH=140; // pen canvas region
const GX=300,GY=20,GW=260,GH=240; // graph region

function A(w){return w*(L-2*w);}
const wOpt=L/4; // = 50

function draw(){
  const w=+wSlider.value;
  const l=L-2*w;
  const area=A(w);
  ctx.clearRect(0,0,W,H);

  // === River ===
  ctx.fillStyle='#bfdbfe55';ctx.fillRect(PX,PY+PH,PW,20);
  ctx.fillStyle=NAVY;ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('RIVER',PX+PW/2,PY+PH+14);
  ctx.strokeStyle=NAVY;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(PX,PY+PH);ctx.lineTo(PX+PW,PY+PH);ctx.stroke();

  // === Pen ===
  const scale=Math.min((PW-20)/(l||1),(PH-10)/(w||1));
  const pw=Math.min(l*scale,PW-20),ph=Math.min(w*scale,PH-10);
  const rx=PX+(PW-pw)/2,ry=PY+(PH-ph);
  ctx.fillStyle='#bbf7d066';
  ctx.fillRect(rx,ry,pw,ph);
  ctx.strokeStyle=GREEN;ctx.lineWidth=2;
  ctx.strokeRect(rx,ry,pw,ph);
  // Bottom (river) not counted
  ctx.fillStyle='#fafaf8';ctx.fillRect(rx,ry+ph-3,pw,6);

  ctx.fillStyle=GREEN;ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText('l = '+l.toFixed(0)+'m',rx+pw/2,ry+ph/2);
  ctx.save();ctx.translate(rx-14,ry+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText('w='+w,0,0);ctx.restore();
  ctx.fillStyle=RED;ctx.font='13px monospace';
  ctx.fillText('A = '+area.toFixed(0)+' m²',rx+pw/2,ry-6);

  // === Parabola ===
  const gx=w=>GX+(w/100)*GW;
  const gy=a=>GY+GH-(a/5000)*GH;
  // Axes
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(GX,GY);ctx.lineTo(GX,GY+GH);ctx.lineTo(GX+GW,GY+GH);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='10px monospace';
  ctx.textAlign='center';
  for(let w2=0;w2<=100;w2+=25){
    ctx.fillText(w2,gx(w2),GY+GH+12);
  }
  ctx.save();ctx.translate(GX-18,GY+GH/2);ctx.rotate(-Math.PI/2);ctx.fillText('Area (m²)',0,0);ctx.restore();
  ctx.textAlign='left';ctx.fillText('w →',GX+GW+4,GY+GH+4);
  // Parabola curve
  ctx.beginPath();
  for(let w2=1;w2<100;w2++){
    const a=A(w2);
    w2===1?ctx.moveTo(gx(w2),gy(a)):ctx.lineTo(gx(w2),gy(a));
  }
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.setLineDash([]);ctx.stroke();
  // Optimum marker
  ctx.beginPath();ctx.arc(gx(wOpt),gy(A(wOpt)),5,0,2*Math.PI);ctx.fillStyle=RED;ctx.fill();
  ctx.fillStyle=RED;ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('max (w=50, A=5000)',gx(wOpt)+8,gy(A(wOpt))-4);
  // Current position
  ctx.beginPath();ctx.arc(gx(w),gy(area),5,0,2*Math.PI);ctx.fillStyle='#b45309';ctx.fill();

  const isOpt=Math.abs(w-wOpt)<1;
  optLabel.textContent=isOpt?'✓ OPTIMAL!':'';
  info.textContent=[
    'w = '+w+' m    l = 200-2×'+w+' = '+l+' m',
    'Area A = w × l = '+w+' × '+l+' = '+area.toFixed(0)+' m²',
    'Optimal w = L/4 = 200/4 = 50 m → l = 100 m → A_max = 5000 m²',
    'Vertex of A(w) = w(200-2w) = -2w² + 200w at w = -200/(2×-2) = 50',
  ].join('\\n');
}

wSlider.oninput=e=>{wVal.textContent=e.target.value;draw();};
draw();`,
      outputHeight: 440,
    },

    {
      type: 'js',
      instruction: 'Optimize the open box problem. Cut corners of size x from a rectangular sheet. Graph V(x) and find the maximum.',
      html: `<div style="font-family:monospace;font-size:12px;padding:6px;display:flex;gap:8px;flex-wrap:wrap">
Sheet: a=<input id="sheetA" type="number" value="20" style="width:44px"> × b=<input id="sheetB" type="number" value="16" style="width:44px">
Cut x: <input id="cutX" type="range" min="0.1" max="7.9" step="0.1" value="3" style="width:120px"> <span id="xVal">3</span>
<button id="findMax" style="padding:3px 8px;cursor:pointer">Find max V</button>
</div>
<canvas id="boxCV" width="580" height="280" style="border-radius:8px;display:block;margin:4px auto"></canvas>
<div id="boxInfo" style="font-family:monospace;font-size:12px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:4px"></div>`,
      css: `#boxCV{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('boxCV');
const ctx=cv.getContext('2d');
const W=cv.width,H=cv.height;

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

const info=document.getElementById('boxInfo');
const xSlider=document.getElementById('cutX');
const xVal=document.getElementById('xVal');

function getAB(){return{a:+document.getElementById('sheetA').value||20,b:+document.getElementById('sheetB').value||16};}

function V(x,a,b){return x*(a-2*x)*(b-2*x);}

function findMaxX(a,b){
  let bestX=0.01,bestV=0;
  const lim=Math.min(a,b)/2-0.01;
  for(let x=0.01;x<lim;x+=0.01){const v=V(x,a,b);if(v>bestV){bestV=v;bestX=x;}}
  return{x:bestX,v:bestV};
}

function draw(){
  const {a,b}=getAB();
  const x=+xSlider.value;
  const lim=Math.min(a,b)/2;
  xSlider.max=(lim-0.1).toFixed(1);
  const vol=V(x,a,b);
  const {x:mx,v:mv}=findMaxX(a,b);
  ctx.clearRect(0,0,W,H);

  // Left: sheet diagram
  const sc=Math.min(160/a,160/b);
  const ox=30,oy=40,sw=a*sc,sh=b*sc,xs=x*sc;
  ctx.fillStyle='#fff7ed';ctx.fillRect(ox,oy,sw,sh);
  ctx.strokeStyle='#b45309';ctx.lineWidth=2;ctx.strokeRect(ox,oy,sw,sh);
  // Corner cuts
  [[ox,oy],[ox+sw-xs,oy],[ox,oy+sh-xs],[ox+sw-xs,oy+sh-xs]].forEach(([cx,cy])=>{
    ctx.fillStyle='#f8fafc';ctx.fillRect(cx,cy,xs,xs);
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1;ctx.strokeRect(cx,cy,xs,xs);
  });
  ctx.fillStyle='#b45309';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Sheet '+a+'×'+b,ox+sw/2,oy-6);
  ctx.fillText('x='+x.toFixed(1),ox+xs/2,oy+xs/2+4);
  ctx.fillText('box: '+(a-2*x).toFixed(1)+'×'+(b-2*x).toFixed(1)+'×'+x.toFixed(1),ox+sw/2,oy+sh+16);
  ctx.fillStyle=RED;ctx.font='13px monospace';
  ctx.fillText('V = '+vol.toFixed(2)+' units³',ox+sw/2,oy+sh+30);

  // Right: V(x) curve
  const GX=240,GY=20,GW=320,GH=230;
  const maxV=mv*1.1||1;
  const gx=x=>GX+(x/lim)*GW;
  const gy=v=>GY+GH-(v/maxV)*GH;
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(GX,GY);ctx.lineTo(GX,GY+GH);ctx.lineTo(GX+GW,GY+GH);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='10px monospace';ctx.textAlign='center';
  for(let t=0;t<=lim;t+=lim/4){ctx.fillText(t.toFixed(1),gx(t),GY+GH+12);}
  ctx.fillText('x →',GX+GW+14,GY+GH+4);
  ctx.save();ctx.translate(GX-16,GY+GH/2);ctx.rotate(-Math.PI/2);ctx.fillText('V(x)',0,0);ctx.restore();
  // Curve
  ctx.beginPath();
  for(let t=0.05;t<lim;t+=0.05){
    const v=V(t,a,b);
    t<0.1?ctx.moveTo(gx(t),gy(v)):ctx.lineTo(gx(t),gy(v));
  }
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.stroke();
  // Max point
  ctx.beginPath();ctx.arc(gx(mx),gy(mv),5,0,2*Math.PI);ctx.fillStyle=RED;ctx.fill();
  ctx.fillStyle=RED;ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('max x='+mx.toFixed(2)+', V='+mv.toFixed(2),gx(mx)+6,gy(mv)-4);
  // Current
  if(x>0&&x<lim){
    ctx.beginPath();ctx.arc(gx(x),gy(vol),5,0,2*Math.PI);ctx.fillStyle='#b45309';ctx.fill();
  }

  info.textContent=[
    'V(x) = x('+a+'-2x)('+b+'-2x) = '+vol.toFixed(3)+' at x='+x.toFixed(2),
    'Maximum volume: V_max ≈ '+mv.toFixed(3)+' at x ≈ '+mx.toFixed(3),
    'Box dimensions at max: '+(a-2*mx).toFixed(3)+' × '+(b-2*mx).toFixed(3)+' × '+mx.toFixed(3),
  ].join('\\n');
}

xSlider.oninput=e=>{xVal.textContent=(+e.target.value).toFixed(1);draw();};
['sheetA','sheetB'].forEach(id=>document.getElementById(id).oninput=draw);
document.getElementById('findMax').onclick=()=>{
  const {a,b}=getAB();
  const {x:mx}=findMaxX(a,b);
  xSlider.value=mx.toFixed(2);
  xVal.textContent=mx.toFixed(2);
  draw();
};
draw();`,
      outputHeight: 440,
    },

    {
      type: 'challenge',
      instruction: 'A farmer has 120 metres of fence and wants to build a rectangular pen against a long barn wall (the barn provides one side for free). Find the dimensions that maximize the area of the pen.',
      hint: 'Let w = width (perpendicular to wall). Then l = 120 - 2w. Area A = w(120-2w). This is a quadratic in w; vertex at w = -b/(2a).',
      solution: `A(w) = w(120-2w) = -2w² + 120w

Vertex: w = -120 / (2 × -2) = -120 / (-4) = 30 m

Length l = 120 - 2(30) = 60 m

Maximum area = 30 × 60 = 1800 m²

The optimal pen is 30 m × 60 m (width × length along wall).`,
    },

    {
      type: 'challenge',
      instruction: 'A rectangular piece of cardboard measuring 20 cm × 12 cm has equal squares of side x cut from each corner. The sides are then folded up to form an open box. (a) Write a formula for the volume V(x). (b) Show that the valid domain is 0 < x < 6. (c) Find the value of x that gives a volume of 192 cm³.',
      hint: 'Box dimensions: length = (20-2x), width = (12-2x), height = x. V = x(20-2x)(12-2x). For V = 192, expand and solve the cubic — try integer values first.',
      solution: `(a) V(x) = x(20-2x)(12-2x)
         = x(240 - 40x - 24x + 4x²)
         = x(240 - 64x + 4x²)
         = 4x³ - 64x² + 240x

(b) We need each dimension positive:
   20-2x > 0 → x < 10
   12-2x > 0 → x < 6
   x > 0
   So domain is 0 < x < 6.

(c) Set 4x³ - 64x² + 240x = 192
   4x³ - 64x² + 240x - 192 = 0
   x³ - 16x² + 60x - 48 = 0

   Try x=1: 1 - 16 + 60 - 48 = -3 (no)
   Try x=4: 64 - 256 + 240 - 48 = 0 ✓

   So x = 4 cm gives V = 192 cm³.
   Box: 12 cm × 4 cm × 4 cm.`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'Optimization problems all follow the same arc: fix one quantity (perimeter, area, material) and maximize or minimize another. The key move is always to write the objective in one variable using the constraint — then it becomes a standard problem you can solve with the vertex formula or by graphing.',
      },
      {
        type: 'image',
        src: geoOptUrl,
        alt: 'Optimization examples: maximum area with fixed perimeter, farmer fence, open box',
        caption: 'Left: circle wins the isoperimetric inequality. Center: fence along river — area is a parabola, vertex at w=L/4. Right: open box volume is a cubic — find max by graphing.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'The isoperimetric result: among all shapes with a fixed perimeter, the circle encloses the most area. Among rectangles with fixed perimeter, the square wins. Shape symmetry = geometric efficiency.',
      },
    ],
  },

  quiz: [
    {
      q: 'A fence of length 120m encloses a rectangle with one free river side. What width w maximizes area?',
      img: quizOptUrl,
      choices: ['w = 30 m', 'w = 60 m', 'w = 40 m', 'w = 20 m'],
      answer: 0,
      explanation: 'A = w(120-2w) = -2w²+120w. Vertex at w = 120/(2×2) = 30. Max area = 30×60 = 1800 m².',
    },
    {
      q: 'Rectangle with fixed perimeter P=48. Which has maximum area?',
      img: quizOptUrl,
      choices: ['12×12 (square)', '16×8', '20×4', '24×0'],
      answer: 0,
      explanation: 'For a fixed perimeter, the square maximizes area. A = 12×12 = 144 vs 16×8=128 vs 20×4=80.',
    },
    {
      q: 'A 20×16 sheet has x cut from corners. V(x) = x(20-2x)(16-2x). What is the valid domain?',
      img: quizOptUrl,
      choices: ['0 < x < 8', '0 < x < 10', '0 < x < 16', '0 < x < 20'],
      answer: 0,
      explanation: 'Both 20-2x>0 and 16-2x>0 must hold; the binding constraint is 16-2x>0 → x<8.',
    },
    {
      q: 'For A(w) = w(L-2w), the maximum occurs at w = ?',
      choices: ['L/4', 'L/2', 'L/3', '2L/3'],
      answer: 0,
      explanation: 'A = -2w²+Lw. Vertex at w = -L/(2·-2) = L/4.',
    },
    {
      q: 'Which shape maximizes area for a fixed perimeter?',
      choices: ['Circle', 'Square', 'Equilateral triangle', 'Regular hexagon'],
      answer: 0,
      explanation: 'The isoperimetric inequality states: the circle has the maximum area for any given perimeter.',
    },
    {
      q: 'Open box from 20×12 sheet with x=2 corners cut. What is V(2)?',
      img: quizOptUrl,
      choices: ['2 × 16 × 8 = 256', '2 × 18 × 10 = 360', '4 × 16 × 8 = 512', '2 × 20 × 12 = 480'],
      answer: 0,
      explanation: 'V(2) = 2(20-4)(12-4) = 2(16)(8) = 256 cm³.',
    },
    {
      q: 'A cylinder has fixed volume 250π cm³. The minimum surface area occurs when h =',
      choices: ['2r (height equals diameter)', 'r', '4r', 'h = V/πr²'],
      answer: 0,
      explanation: 'For minimum SA with fixed volume, differentiate SA = 2πr²+2πrh with h = V/(πr²) substituted. The result is h = 2r.',
    },
    {
      q: 'For A(w) = -2w² + 120w, what is the maximum area?',
      choices: ['1800', '3600', '900', '2400'],
      answer: 0,
      explanation: 'Vertex at w=30: A(30) = -2(900)+120(30) = -1800+3600 = 1800.',
    },
    {
      q: 'A wire 60 cm long is bent into a rectangle. What dimensions maximize the area?',
      choices: ['15×15 cm (square)', '20×10 cm', '25×5 cm', '30×0 cm'],
      answer: 0,
      explanation: 'Perimeter = 60 → 2(l+w)=60 → l+w=30. Area = lw = w(30-w), max at w=15. Square 15×15.',
    },
    {
      q: 'A box with no lid is made from a sheet, with x=3 cm cut from corners of a 30×20 sheet. What is V(3)?',
      choices: ['3 × 24 × 14 = 1008', '3 × 27 × 17 = 1377', '3 × 30 × 20 = 1800', '3 × 12 × 7 = 252'],
      answer: 0,
      explanation: 'V(3) = 3(30-6)(20-6) = 3(24)(14) = 1008 cm³.',
    },
  ],
};

LESSON_GEO_6_7.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_6_7.cells, title: LESSON_GEO_6_7.title, subject: LESSON_GEO_6_7.subject, sequential: LESSON_GEO_6_7.sequential } } });

const GEO_6_7_DEFAULT = {
  cells: LESSON_GEO_6_7.cells,
  id: 'geo-6-7',
  title: 'Optimization with Geometry',
  slug: 'optimization',
  subject: 'Geometry',
  chapter: 6,
  order: 7,
  tags: ['optimization', 'maximize area', 'minimize perimeter', 'open box', 'isoperimetric', 'vertex formula'],
  intuition: LESSON_GEO_6_7.intuition,
  quiz: LESSON_GEO_6_7.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_6_7_DEFAULT;
export { LESSON_GEO_6_7 };
