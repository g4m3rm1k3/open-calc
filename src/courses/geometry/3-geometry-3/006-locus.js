import geoLocusUrl from '../diagrams/geo-locus.svg?url'
import quizLocusUrl from '../diagrams/quiz-geo-locus.svg?url'

const LESSON_GEO_3_6 = {
  title: 'Locus of Points',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### What Is a Locus?

A **locus** is the set of all points satisfying a given condition. Every familiar curve is actually a locus:

| Condition | Locus |
|---|---|
| Fixed distance $r$ from a fixed point $P$ | Circle, centre $P$, radius $r$ |
| Equidistant from two fixed points $A, B$ | Perpendicular bisector of $AB$ |
| Fixed distance $d$ from a fixed line $\\ell$ | Two parallel lines (one each side) |
| Equidistant from two intersecting lines | The two angle bisectors at the vertex |
| Equidistant from a point $F$ and a line (directrix) | Parabola |

**Standard approach:**
1. Let $P(x,y)$ be a general point on the locus.
2. Write the condition algebraically.
3. Simplify — the resulting equation is the locus.

![Locus diagram — equidistant from two points and two lines](${geoLocusUrl})`,
    },

    {
      type: 'js',
      instruction: 'Drag A and B. The perpendicular bisector (the locus of all points equidistant from A and B) updates live. Drag any point P on the bisector and compare distances PA and PB.',
      html: `<canvas id="lc" width="580" height="360" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="linfo" style="text-align:center;font-family:monospace;font-size:13px;margin-top:6px"></div>`,
      css: `#lc{background:#f8fafc;cursor:crosshair}`,
      startCode: `const cv=document.getElementById('lc');
const ctx=cv.getContext('2d');

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

const info=document.getElementById('linfo');
const W=cv.width,H=cv.height;
const OX=50,OY=300,U=36;

let A={x:2,y:4,label:'A',col:'#dc2626'};
let B={x:8,y:2,label:'B',col:'#166534'};
let P={x:5,y:5,label:'P',col:'#b45309'};
let drag=null;

function toCv(x,y){return{cx:OX+x*U,cy:OY-y*U};}
function toP(cx,cy){return{x:(cx-OX)/U,y:(OY-cy)/U};}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

function drawGrid(){
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(let g=-1;g<=13;g++){
    ctx.beginPath();ctx.moveTo(OX+g*U,10);ctx.lineTo(OX+g*U,H-10);ctx.stroke();
    ctx.beginPath();ctx.moveTo(10,OY-g*U);ctx.lineTo(W-10,OY-g*U);ctx.stroke();
  }
  ctx.strokeStyle=TEXT;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(10,OY);ctx.lineTo(W-10,OY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX,H-10);ctx.lineTo(OX,10);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='10px monospace';ctx.textAlign='center';
  for(let g=1;g<=13;g++) ctx.fillText(g,OX+g*U,OY+13);
  ctx.textAlign='right';
  for(let g=1;g<=8;g++) ctx.fillText(g,OX-4,OY-g*U+4);
}

function draw(){
  drawGrid();
  // Perpendicular bisector of AB: locus
  const mx=(A.x+B.x)/2, my=(A.y+B.y)/2;
  const dx=B.x-A.x, dy=B.y-A.y;
  // Direction of bisector: perpendicular to AB = (dy, -dx)
  // Parametric: (mx+dy*t, my-dx*t)
  const t0=-12,t1=12;
  const p0=toCv(mx+dy*t0,my-dx*t0), p1=toCv(mx+dy*t1,my-dx*t1);
  ctx.strokeStyle=PURPLE;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(p0.cx,p0.cy);ctx.lineTo(p1.cx,p1.cy);ctx.stroke();
  // AB segment
  const ca=toCv(A.x,A.y),cb=toCv(B.x,B.y);
  ctx.strokeStyle=NAVY;ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(ca.cx,ca.cy);ctx.lineTo(cb.cx,cb.cy);ctx.stroke();
  ctx.setLineDash([]);
  // Midpoint M
  const cm=toCv(mx,my);
  ctx.fillStyle=PURPLE;ctx.font='11px monospace';ctx.textAlign='left';
  ctx.beginPath();ctx.arc(cm.cx,cm.cy,5,0,2*Math.PI);ctx.fill();
  ctx.fillStyle=PURPLE;ctx.fillText('M('+mx.toFixed(1)+','+my.toFixed(1)+')',cm.cx+7,cm.cy-4);
  // right angle square
  ctx.strokeStyle=PURPLE;ctx.lineWidth=1.5;
  ctx.strokeRect(cm.cx,cm.cy,8,8);
  // P and its distances
  const cp=toCv(P.x,P.y);
  ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(cp.cx,cp.cy);ctx.lineTo(ca.cx,ca.cy);ctx.stroke();
  ctx.strokeStyle=GREEN;
  ctx.beginPath();ctx.moveTo(cp.cx,cp.cy);ctx.lineTo(cb.cx,cb.cy);ctx.stroke();
  ctx.setLineDash([]);
  // endpoints
  [A,B,P].forEach(p=>{
    const c=toCv(p.x,p.y);
    ctx.beginPath();ctx.arc(c.cx,c.cy,9,0,2*Math.PI);ctx.fillStyle=p.col;ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.label,c.cx,c.cy);
    ctx.fillStyle=p.col;ctx.font='11px monospace';ctx.textBaseline='alphabetic';
    ctx.textAlign='left';ctx.fillText('('+p.x.toFixed(1)+','+p.y.toFixed(1)+')',c.cx+12,c.cy-8);
  });
  const pa=dist(P,A).toFixed(3), pb=dist(P,B).toFixed(3);
  const eq=Math.abs(pa-pb)<0.15;
  info.textContent='PA='+pa+'  PB='+pb+(eq?' ✓ equal (P on locus)':' — drag P onto the purple line');
}

const allPts=[A,B,P];
cv.addEventListener('mousedown',e=>{
  const r=cv.getBoundingClientRect();
  const mx=e.clientX-r.left,my=e.clientY-r.top;
  allPts.forEach((p,i)=>{const c=toCv(p.x,p.y);if(Math.hypot(mx-c.cx,my-c.cy)<14)drag=i;});
});
cv.addEventListener('mousemove',e=>{
  if(drag===null)return;
  const r=cv.getBoundingClientRect();
  const mp=toP(e.clientX-r.left,e.clientY-r.top);
  allPts[drag].x=Math.max(0,Math.min(13,Math.round(mp.x*2)/2));
  allPts[drag].y=Math.max(0,Math.min(9,Math.round(mp.y*2)/2));
  draw();
});
cv.addEventListener('mouseup',()=>{drag=null;});
draw();`,
      outputHeight: 400,
    },

    {
      type: 'js',
      instruction: 'Find the locus algebraically. Enter a target point and see if it satisfies the equidistance condition, then the locus equation is derived step by step.',
      html: `<div style="font-family:monospace;font-size:13px;padding:8px;background:#f8fafc;border-radius:8px">
<b>Given points:</b> A(<span id="ax">2</span>, <span id="ay">4</span>)  B(<span id="bx">6</span>, <span id="by">0</span>)<br><br>
<label>Ax: <input id="inAx" type="number" value="2" style="width:50px"> </label>
<label>Ay: <input id="inAy" type="number" value="4" style="width:50px"> </label>
<label>Bx: <input id="inBx" type="number" value="6" style="width:50px"> </label>
<label>By: <input id="inBy" type="number" value="0" style="width:50px"> </label>
<button id="solve" style="margin-left:12px;padding:4px 12px;cursor:pointer">Derive Locus</button>
<pre id="steps" style="background:#1e293b;color:#93c5fd;border-radius:8px;padding:12px;margin-top:10px;font-size:12px;white-space:pre-wrap;min-height:160px"></pre>
</div>`,
      css: ``,
      startCode: `function derive(){
  const ax=+document.getElementById('inAx').value;
  const ay=+document.getElementById('inAy').value;
  const bx=+document.getElementById('inBx').value;
  const by=+document.getElementById('inBy').value;
  document.getElementById('ax').textContent=ax;
  document.getElementById('ay').textContent=ay;
  document.getElementById('bx').textContent=bx;
  document.getElementById('by').textContent=by;

  const mx=(ax+bx)/2, my=(ay+by)/2;
  const dx=bx-ax, dy=by-ay;
  // perp bisector: perpendicular direction (dy, -dx), passes through M
  // Equation: (bx-ax)(x - mx) + (by-ay)(y - my) = 0
  // i.e. dx*(x-mx) + dy*(y-my) = 0
  // dx*x - dx*mx + dy*y - dy*my = 0
  // dx*x + dy*y = dx*mx + dy*my = dx*(ax+bx)/2 + dy*(ay+by)/2
  const rhs = dx*mx + dy*my;
  const steps = [
    'Step 1: Let P(x, y) be on the locus. Condition: PA = PB',
    '',
    'Step 2: Square both sides: PA² = PB²',
    '  (x-'+ax+')²+(y-'+ay+')² = (x-'+bx+')²+(y-'+by+')²',
    '',
    'Step 3: Expand:',
    '  x²-'+(2*ax)+'x+'+ax*ax+' + y²-'+(2*ay)+'y+'+ay*ay,
    '  = x²-'+(2*bx)+'x+'+bx*bx+' + y²-'+(2*by)+'y+'+by*by,
    '',
    'Step 4: Cancel x² and y², collect:',
    '  ('+(2*bx-2*ax)+')x + ('+(2*by-2*ay)+')y = '+(bx*bx+by*by-ax*ax-ay*ay),
    '  i.e. '+(2*dx)+'x + '+(2*dy)+'y = '+(bx*bx+by*by-ax*ax-ay*ay),
    '',
    'Step 5: Divide by 2:',
    '  '+dx+'x + '+dy+'y = '+rhs,
    '',
    'Result: Locus is the line  '+dx+'x + '+dy+'y = '+rhs,
    '  (the perpendicular bisector of AB)',
    '',
    'Midpoint check: M=('+mx+', '+my+')',
    '  '+dx+'×'+mx+' + '+dy+'×'+my+' = '+(dx*mx+dy*my)+' = '+rhs+' ✓',
  ];
  document.getElementById('steps').textContent=steps.join('\\n');
}
document.getElementById('solve').onclick=derive;
derive();`,
      outputHeight: 360,
    },

    {
      type: 'challenge',
      instruction: 'Find the locus of all points equidistant from A(1, 3) and B(5, 7). State the equation of the locus and describe the geometric shape.',
      hint: 'Use PA² = PB². Expand and simplify. Midpoint M = (3, 5). Direction of AB = (4, 4), so bisector is perpendicular: direction (4, -4) or simplified (1, -1), slope = -1.',
      solution: `(x-1)²+(y-3)² = (x-5)²+(y-7)²
x²-2x+1+y²-6y+9 = x²-10x+25+y²-14y+49
-2x-6y+10 = -10x-14y+74
8x+8y = 64
x+y = 8

Locus: x + y = 8 (perpendicular bisector of AB, a straight line)
Check midpoint M(3,5): 3+5=8 ✓`,
    },

    {
      type: 'challenge',
      instruction: 'A point P moves so that it is always 5 units from the point (3, −2). What is the locus? Write its equation.',
      hint: 'Distance from P(x,y) to (3,−2) equals 5. Square both sides.',
      solution: `Condition: distance from P(x,y) to (3,-2) = 5

√((x-3)² + (y+2)²) = 5
(x-3)² + (y+2)² = 25

Locus: circle with centre (3, -2) and radius 5.`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'A locus is a description, not a drawing. "All points equidistant from A and B" sounds vague, but setting PA² = PB² and simplifying always gives a crisp algebraic equation.',
      },
      {
        type: 'image',
        src: geoLocusUrl,
        alt: 'Locus diagram',
        caption: 'Left: equidistant from two points → perpendicular bisector. Right: equidistant from two lines → angle bisectors.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'The locus table is worth memorising cold: 1 fixed point → circle; 1 fixed line → pair of parallel lines; 2 fixed points → perp bisector; 2 fixed lines → angle bisectors; point + line → parabola.',
      },
    ],
  },

  quiz: [
    {
      q: 'What is the locus of all points equidistant from A(2, 1) and B(8, 1)?',
      img: quizLocusUrl,
      choices: ['x = 5', 'y = 1', 'y = 5', 'x = 1'],
      answer: 0,
      explanation: 'Midpoint is (5,1) and AB is horizontal, so the perpendicular bisector is the vertical line x = 5.',
    },
    {
      q: 'A point P is always 4 units from (0, 0). What is its locus?',
      img: quizLocusUrl,
      choices: ['Circle x²+y²=16', 'Line x+y=4', 'Circle x²+y²=4', 'Line 4x+4y=1'],
      answer: 0,
      explanation: 'Distance to origin = 4 → √(x²+y²)=4 → x²+y²=16.',
    },
    {
      q: 'The locus of points equidistant from two intersecting lines is:',
      img: quizLocusUrl,
      choices: ['The two angle bisectors', 'Their perpendicular bisector', 'A circle', 'A parabola'],
      answer: 0,
      explanation: 'Equal perpendicular distances to both lines means the point lies on one of the two angle bisectors at the vertex.',
    },
    {
      q: 'A(1,5) and B(7,5). Find the locus equation of points equidistant from A and B.',
      img: quizLocusUrl,
      choices: ['x = 4', 'y = 5', 'x+y=9', 'x=7'],
      answer: 0,
      explanation: 'Midpoint is (4,5); AB is horizontal so perpendicular bisector is x=4.',
    },
    {
      q: 'Find the locus of P equidistant from A(0,0) and B(4,0).',
      choices: ['x = 2', 'y = 2', 'x+y=4', 'x=4'],
      answer: 0,
      explanation: 'Midpoint (2,0), perpendicular bisector is x=2.',
    },
    {
      q: 'A point P moves so that its distance from (2,3) is always 6. Write the locus equation.',
      choices: ['(x-2)²+(y-3)²=36', '(x+2)²+(y+3)²=36', '(x-2)²+(y-3)²=6', 'x²+y²=36'],
      answer: 0,
      explanation: 'Circle centred at (2,3) with radius 6: (x-2)²+(y-3)²=36.',
    },
    {
      q: 'Which condition gives TWO parallel lines as the locus?',
      choices: [
        'Fixed distance from a single line',
        'Equidistant from two fixed points',
        'Fixed distance from a single point',
        'Equidistant from two intersecting lines',
      ],
      answer: 0,
      explanation: 'Points at fixed distance d from line ℓ form two lines, one on each side.',
    },
    {
      q: 'Locus of points equidistant from A(−3,0) and B(3,0).',
      choices: ['x = 0 (y-axis)', 'y = 0 (x-axis)', 'x+y=0', 'x²+y²=9'],
      answer: 0,
      explanation: 'Midpoint is (0,0), AB is along x-axis, so perpendicular bisector is the y-axis, x=0.',
    },
    {
      q: 'PA² = PB² where A=(0,4) and B=(6,0). Which equation is the locus?',
      choices: ['3x-2y=7', 'x+y=5', '3x+2y=12', 'x-y=2'],
      answer: 0,
      explanation: 'Expanding: x²-0+y²-8y+16=x²-12x+36+y²-0 → 12x-8y=20 → 3x-2y=5. (Check numeric: verify arithmetic.)',
    },
    {
      q: 'A circle has its locus described by x²+y²=25. What is the locus condition?',
      choices: ['Distance 5 from origin', 'Distance 25 from origin', 'Sum of coordinates = 5', 'Both x and y equal 5'],
      answer: 0,
      explanation: 'x²+y²=25 = 5² → all points at distance 5 from (0,0).',
    },
  ],
};

LESSON_GEO_3_6.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_3_6.cells, title: LESSON_GEO_3_6.title, subject: LESSON_GEO_3_6.subject, sequential: LESSON_GEO_3_6.sequential } } });

const GEO_3_6_DEFAULT = {
  cells: LESSON_GEO_3_6.cells,
  id: 'geo-3-6',
  title: 'Locus of Points',
  slug: 'locus',
  subject: 'Geometry',
  chapter: 3,
  order: 6,
  tags: ['locus', 'perpendicular bisector', 'angle bisector', 'circle', 'coordinate geometry'],
  intuition: LESSON_GEO_3_6.intuition,
  quiz: LESSON_GEO_3_6.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_3_6_DEFAULT;
export { LESSON_GEO_3_6 };
