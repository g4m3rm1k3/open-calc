import geoCoordProofUrl from '../diagrams/geo-coordinate-proofs.svg?url'
import quizCoordProofUrl from '../diagrams/quiz-geo-coordinate-proofs.svg?url'

const LESSON_GEO_3_7 = {
  title: 'Coordinate Geometry Proofs',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Proving Quadrilateral Properties with Coordinates

Place the figure on a coordinate system, then apply algebraic tools:

| Tool | Tests for |
|---|---|
| **Distance formula** $\\sqrt{(\\Delta x)^2+(\\Delta y)^2}$ | Equal lengths |
| **Slope** $m = \\Delta y/\\Delta x$ | Parallel ($m_1=m_2$) or perpendicular ($m_1 m_2=-1$) |
| **Midpoint formula** | Diagonals bisect each other |

**Classification hierarchy:**
- **Parallelogram**: opposite sides parallel and equal
- **Rectangle**: parallelogram + all angles 90° (adjacent sides ⊥)
- **Rhombus**: parallelogram + all sides equal
- **Square**: rectangle AND rhombus

**Strategy tip:** Place one vertex at the origin and one side along the $x$-axis to simplify arithmetic.

![Coordinate proof diagram](${geoCoordProofUrl})`,
    },

    {
      type: 'js',
      instruction: 'Drag the four vertices. The tool computes slopes, side lengths, and diagonal midpoints — and announces what type of quadrilateral you have.',
      html: `<canvas id="qpc" width="580" height="360" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="qpinfo" style="font-family:monospace;font-size:12px;padding:8px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:6px;min-height:80px"></div>`,
      css: `#qpc{background:#f8fafc;cursor:crosshair}`,
      startCode: `const cv=document.getElementById('qpc');
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

const info=document.getElementById('qpinfo');
const W=cv.width,H=cv.height;
const OX=60,OY=300,U=36;

let pts=[
  {x:0,y:0,label:'A',col:'#dc2626'},
  {x:6,y:0,label:'B',col:'#166534'},
  {x:8,y:4,label:'C',col:'#b45309'},
  {x:2,y:4,label:'D',col:'#7c3aed'},
];
let drag=null;

function toCv(x,y){return{cx:OX+x*U,cy:OY-y*U};}
function toP(cx,cy){return{x:(cx-OX)/U,y:(OY-cy)/U};}
function dist(a,b){return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);}
function slope(a,b){
  if(Math.abs(b.x-a.x)<0.001) return Infinity;
  return (b.y-a.y)/(b.x-a.x);
}
function midpt(a,b){return{x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
function parallel(m1,m2){
  if(!isFinite(m1)&&!isFinite(m2)) return true;
  return Math.abs(m1-m2)<0.001;
}
function perp(m1,m2){
  if(!isFinite(m1)&&Math.abs(m2)<0.001) return true;
  if(!isFinite(m2)&&Math.abs(m1)<0.001) return true;
  return Math.abs(m1*m2+1)<0.01;
}
function fmt(n){return isFinite(n)?n.toFixed(3):'∞';}

function drawGrid(){
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(let g=-1;g<=14;g++){
    ctx.beginPath();ctx.moveTo(OX+g*U,10);ctx.lineTo(OX+g*U,H-10);ctx.stroke();
    ctx.beginPath();ctx.moveTo(10,OY-g*U);ctx.lineTo(W-10,OY-g*U);ctx.stroke();
  }
  ctx.strokeStyle=TEXT;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(10,OY);ctx.lineTo(W-10,OY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX,H-10);ctx.lineTo(OX,10);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='10px monospace';ctx.textAlign='center';
  for(let g=1;g<=14;g++) ctx.fillText(g,OX+g*U,OY+13);
  ctx.textAlign='right';
  for(let g=1;g<=8;g++) ctx.fillText(g,OX-4,OY-g*U+4);
}

function classify(){
  const [A,B,C,D]=pts;
  const sAB=slope(A,B),sBC=slope(B,C),sCD=slope(C,D),sDA=slope(D,A);
  const lAB=dist(A,B),lBC=dist(B,C),lCD=dist(C,D),lDA=dist(D,A);
  const mAC=midpt(A,C),mBD=midpt(B,D);
  const diagonalsBisect=Math.hypot(mAC.x-mBD.x,mAC.y-mBD.y)<0.05;
  const oppPar=parallel(sAB,sCD)&&parallel(sBC,sDA);
  const oppEq=Math.abs(lAB-lCD)<0.05&&Math.abs(lBC-lDA)<0.05;
  const isPara=oppPar&&oppEq||diagonalsBisect;
  const isRect=isPara&&perp(sAB,sBC);
  const isRhom=isPara&&Math.abs(lAB-lBC)<0.05;
  const isSq=isRect&&isRhom;
  let type='General quadrilateral';
  if(isSq) type='SQUARE';
  else if(isRect) type='RECTANGLE';
  else if(isRhom) type='RHOMBUS';
  else if(isPara) type='PARALLELOGRAM';
  return {type,sAB,sBC,sCD,sDA,lAB,lBC,lCD,lDA,mAC,mBD,diagonalsBisect,oppPar,isRect,isRhom};
}

function draw(){
  drawGrid();
  const r=classify();
  const [A,B,C,D]=pts;
  // diagonals
  const ca=toCv(A.x,A.y),cb=toCv(B.x,B.y),cc=toCv(C.x,C.y),cd=toCv(D.x,D.y);
  ctx.strokeStyle='#dc2626';ctx.lineWidth=1.2;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(ca.cx,ca.cy);ctx.lineTo(cc.cx,cc.cy);ctx.stroke();
  ctx.strokeStyle=PURPLE;
  ctx.beginPath();ctx.moveTo(cb.cx,cb.cy);ctx.lineTo(cd.cx,cd.cy);ctx.stroke();
  ctx.setLineDash([]);
  // sides
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(ca.cx,ca.cy);ctx.lineTo(cb.cx,cb.cy);ctx.lineTo(cc.cx,cc.cy);ctx.lineTo(cd.cx,cd.cy);ctx.closePath();
  ctx.fillStyle='#1e3a5f09';ctx.fill();ctx.stroke();
  // diagonal midpoints
  const cm1=toCv(r.mAC.x,r.mAC.y),cm2=toCv(r.mBD.x,r.mBD.y);
  ctx.fillStyle=RED;ctx.beginPath();ctx.arc(cm1.cx,cm1.cy,5,0,2*Math.PI);ctx.fill();
  ctx.fillStyle=PURPLE;ctx.beginPath();ctx.arc(cm2.cx,cm2.cy,5,0,2*Math.PI);ctx.fill();
  // vertices
  pts.forEach(p=>{
    const c=toCv(p.x,p.y);
    ctx.beginPath();ctx.arc(c.cx,c.cy,9,0,2*Math.PI);ctx.fillStyle=p.col;ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.label,c.cx,c.cy);
    ctx.fillStyle=p.col;ctx.font='11px monospace';ctx.textBaseline='alphabetic';ctx.textAlign='left';
    ctx.fillText('('+p.x+','+p.y+')',c.cx+12,c.cy-8);
  });
  info.textContent=[
    'Type: '+r.type,
    'Slopes: AB='+fmt(r.sAB)+'  BC='+fmt(r.sBC)+'  CD='+fmt(r.sCD)+'  DA='+fmt(r.sDA),
    'Lengths: AB='+r.lAB.toFixed(3)+' BC='+r.lBC.toFixed(3)+' CD='+r.lCD.toFixed(3)+' DA='+r.lDA.toFixed(3),
    'Diagonal midpoints: AC=('+r.mAC.x.toFixed(2)+','+r.mAC.y.toFixed(2)+') BD=('+r.mBD.x.toFixed(2)+','+r.mBD.y.toFixed(2)+')',
    'Diagonals bisect each other: '+r.diagonalsBisect+' | Opp sides parallel: '+r.oppPar,
  ].join('\\n');
}

cv.addEventListener('mousedown',e=>{
  const r=cv.getBoundingClientRect();
  const mx=e.clientX-r.left,my=e.clientY-r.top;
  pts.forEach((p,i)=>{const c=toCv(p.x,p.y);if(Math.hypot(mx-c.cx,my-c.cy)<14)drag=i;});
});
cv.addEventListener('mousemove',e=>{
  if(drag===null)return;
  const r=cv.getBoundingClientRect();
  const mp=toP(e.clientX-r.left,e.clientY-r.top);
  pts[drag].x=Math.max(-1,Math.min(14,Math.round(mp.x)));
  pts[drag].y=Math.max(-1,Math.min(9,Math.round(mp.y)));
  draw();
});
cv.addEventListener('mouseup',()=>{drag=null;});
draw();`,
      outputHeight: 480,
    },

    {
      type: 'js',
      instruction: 'Enter the four vertices of a quadrilateral. The proof is written out step by step — slopes, distances, midpoints — and the shape is classified.',
      html: `<div style="font-family:monospace;font-size:13px;padding:8px">
<b>Enter vertices (integers):</b><br><br>
<label>A(x,y): <input id="ax" type="number" value="0" style="width:45px">, <input id="ay" type="number" value="0" style="width:45px"> </label>
<label>B(x,y): <input id="bx" type="number" value="4" style="width:45px">, <input id="by" type="number" value="0" style="width:45px"> </label>
<label>C(x,y): <input id="cx2" type="number" value="6" style="width:45px">, <input id="cy2" type="number" value="3" style="width:45px"> </label>
<label>D(x,y): <input id="dx" type="number" value="2" style="width:45px">, <input id="dy" type="number" value="3" style="width:45px"> </label>
<button id="prv" style="margin-left:12px;padding:4px 12px;cursor:pointer">Prove</button>
<pre id="proof" style="background:#1e293b;color:#93c5fd;border-radius:8px;padding:12px;margin-top:10px;font-size:12px;white-space:pre-wrap;min-height:200px"></pre>
</div>`,
      css: ``,
      startCode: `function fmt(n,d){return isFinite(n)?n.toFixed(d||3):'undefined (vertical)';}
function prove(){
  const A={x:+document.getElementById('ax').value,y:+document.getElementById('ay').value};
  const B={x:+document.getElementById('bx').value,y:+document.getElementById('by').value};
  const C={x:+document.getElementById('cx2').value,y:+document.getElementById('cy2').value};
  const D={x:+document.getElementById('dx').value,y:+document.getElementById('dy').value};
  function dist(p,q){return Math.sqrt((p.x-q.x)**2+(p.y-q.y)**2);}
  function sl(p,q){if(Math.abs(q.x-p.x)<0.001)return Infinity;return (q.y-p.y)/(q.x-p.x);}
  function mp(p,q){return{x:(p.x+q.x)/2,y:(p.y+q.y)/2};}
  function par(m1,m2){if(!isFinite(m1)&&!isFinite(m2))return true;return Math.abs(m1-m2)<0.001;}
  function perp(m1,m2){
    if(!isFinite(m1)&&Math.abs(m2)<0.001)return true;
    if(!isFinite(m2)&&Math.abs(m1)<0.001)return true;
    return Math.abs(m1*m2+1)<0.01;
  }
  const sAB=sl(A,B),sBC=sl(B,C),sCD=sl(C,D),sDA=sl(D,A);
  const lAB=dist(A,B),lBC=dist(B,C),lCD=dist(C,D),lDA=dist(D,A);
  const mAC=mp(A,C),mBD=mp(B,D);
  const isPara=par(sAB,sCD)&&par(sBC,sDA);
  const isRect=isPara&&perp(sAB,sBC);
  const isRhom=isPara&&Math.abs(lAB-lBC)<0.05;
  const isSq=isRect&&isRhom;
  let type='General quadrilateral';
  if(isSq)type='SQUARE';else if(isRect)type='RECTANGLE';else if(isRhom)type='RHOMBUS';else if(isPara)type='PARALLELOGRAM';
  const lines=[
    '=== Coordinate Proof for ABCD ===',
    'A('+A.x+','+A.y+')  B('+B.x+','+B.y+')  C('+C.x+','+C.y+')  D('+D.x+','+D.y+')',
    '',
    '--- Slopes ---',
    'slope AB = ('+B.y+'-'+A.y+')/('+B.x+'-'+A.x+') = '+fmt(sAB),
    'slope BC = '+fmt(sBC),
    'slope CD = '+fmt(sCD),
    'slope DA = '+fmt(sDA),
    '',
    'AB || CD? '+par(sAB,sCD)+'  (slopes equal)',
    'BC || DA? '+par(sBC,sDA),
    '',
    '--- Side Lengths ---',
    '|AB| = sqrt('+(B.x-A.x)**2+'+'+(B.y-A.y)**2+') = '+fmt(lAB),
    '|BC| = '+fmt(lBC),
    '|CD| = '+fmt(lCD),
    '|DA| = '+fmt(lDA),
    '',
    '--- Diagonal Midpoints ---',
    'midpoint AC = (('+A.x+'+'+C.x+')/2,('+A.y+'+'+C.y+')/2) = ('+fmt(mAC.x)+','+fmt(mAC.y)+')',
    'midpoint BD = ('+fmt(mBD.x)+','+fmt(mBD.y)+')',
    'Diagonals bisect each other? '+(Math.hypot(mAC.x-mBD.x,mAC.y-mBD.y)<0.05),
    '',
    '--- Right Angles? ---',
    'AB ⊥ BC? '+perp(sAB,sBC)+' (m₁×m₂='+fmt(sAB*sBC)+')',
    '',
    '=== Classification: '+type+' ===',
  ];
  document.getElementById('proof').textContent=lines.join('\\n');
}
document.getElementById('prv').onclick=prove;
prove();`,
      outputHeight: 440,
    },

    {
      type: 'challenge',
      instruction: 'Vertices: A(0,0), B(4,0), C(4,3), D(0,3). Prove this is a rectangle using coordinate methods (slopes AND distances).',
      hint: 'Show: (1) opposite sides parallel, (2) adjacent sides perpendicular (slope product = −1), (3) equal opposite side lengths. Diagonal lengths should also be equal.',
      solution: `Slopes:
  AB: (0-0)/(4-0) = 0   BC: (3-0)/(4-4) = ∞ (vertical)
  CD: (3-3)/(0-4) = 0   DA: (0-3)/(0-0) = ∞ (vertical)

Parallel sides: AB || CD (both slope 0), BC || DA (both vertical) ✓

Perpendicular: slope AB × slope BC = 0 × ∞ → undefined, but AB is horizontal,
BC is vertical → they are perpendicular ✓

Side lengths:
  |AB| = 4,  |BC| = 3,  |CD| = 4,  |DA| = 3
  Opposite sides equal ✓

Diagonals: |AC| = √(16+9) = 5,  |BD| = √(16+9) = 5  (equal ✓)

Conclusion: ABCD is a rectangle.`,
    },

    {
      type: 'challenge',
      instruction: 'A(0,1), B(2,0), C(4,1), D(2,2). Prove ABCD is a rhombus but not a rectangle.',
      hint: 'Show all four sides equal. Then check if any adjacent slopes multiply to −1 (they should not for a non-rectangle rhombus).',
      solution: `Side lengths:
  |AB| = √((2-0)²+(0-1)²) = √(4+1) = √5
  |BC| = √((4-2)²+(1-0)²) = √(4+1) = √5
  |CD| = √((2-4)²+(2-1)²) = √(4+1) = √5
  |DA| = √((0-2)²+(1-2)²) = √(4+1) = √5

All four sides = √5 → RHOMBUS ✓

Slopes:
  slope AB = (0-1)/(2-0) = -1/2
  slope BC = (1-0)/(4-2) = 1/2
  Product = -1/2 × 1/2 = -1/4 ≠ -1 → NOT perpendicular

So ABCD is a rhombus but NOT a rectangle (not a square either).`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'Coordinate proofs replace synthetic reasoning (congruence postulates, auxiliary lines) with algebra: place the figure, compute slopes and distances, compare numbers. They are mechanical but reliable.',
      },
      {
        type: 'image',
        src: geoCoordProofUrl,
        alt: 'Coordinate proof diagram — parallelogram, rectangle, rhombus',
        caption: 'Left: parallelogram proved by equal midpoints of diagonals. Right: rectangle (right-angle marks) vs rhombus (equal side lengths).',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Place one vertex at the origin and one side along the x-axis whenever possible. This sets multiple coordinates to 0, cutting the algebra in half.',
      },
    ],
  },

  quiz: [
    {
      q: 'A(0,0), B(5,0), C(6,3), D(1,3). Which best describes ABCD?',
      img: quizCoordProofUrl,
      choices: ['Parallelogram', 'Rectangle', 'Rhombus', 'Trapezoid'],
      answer: 0,
      explanation: 'slope AB=0=slope DC, slope BC=3=slope AD. Parallel sides, but not right angles → parallelogram.',
    },
    {
      q: 'To prove two lines are perpendicular using coordinates, you check:',
      img: quizCoordProofUrl,
      choices: ['Their slopes multiply to −1', 'Their slopes are equal', 'Their y-intercepts are equal', 'Their lengths are equal'],
      answer: 0,
      explanation: 'Perpendicular lines have slopes satisfying m₁ × m₂ = −1.',
    },
    {
      q: 'A(0,0), B(4,0), C(4,4), D(0,4). What shape is ABCD?',
      img: quizCoordProofUrl,
      choices: ['Square', 'Rectangle (not square)', 'Rhombus', 'Parallelogram'],
      answer: 0,
      explanation: 'All sides = 4, all angles 90° → square.',
    },
    {
      q: 'The diagonals of a parallelogram always:',
      img: quizCoordProofUrl,
      choices: ['Bisect each other', 'Are equal in length', 'Are perpendicular', 'Bisect the angles'],
      answer: 0,
      explanation: 'Diagonals bisect each other is the defining property of parallelograms. Equal diagonals → rectangle; perpendicular diagonals → rhombus.',
    },
    {
      q: 'Midpoints of diagonals: AC has midpoint (4,3) and BD has midpoint (4,3). What can you conclude?',
      choices: ['ABCD is a parallelogram', 'ABCD is a rectangle', 'ABCD is a square', 'Nothing'],
      answer: 0,
      explanation: 'Equal midpoints of diagonals means diagonals bisect each other → ABCD is a parallelogram.',
    },
    {
      q: 'A(0,0), B(3,4), C(0,8), D(−3,4). Classify ABCD (all sides = 5, slopes of adjacent sides: −4/3 and 4/3).',
      choices: ['Rhombus', 'Rectangle', 'Square', 'Parallelogram only'],
      answer: 0,
      explanation: 'All four sides equal (rhombus condition). Adjacent slope product = (−4/3)(4/3) = −16/9 ≠ −1, so not a rectangle.',
    },
    {
      q: 'To prove a quadrilateral is a rectangle (not just a parallelogram), what extra condition do you need?',
      choices: ['Adjacent sides are perpendicular', 'All sides are equal', 'Diagonals are equal length only', 'Opposite angles are equal'],
      answer: 0,
      explanation: 'Perpendicular adjacent sides (slope product −1) proves the angles are 90°.',
    },
    {
      q: 'The slope of AB is 3. What slope must BC have for AB ⊥ BC?',
      choices: ['−1/3', '3', '1/3', '−3'],
      answer: 0,
      explanation: 'm₁ × m₂ = −1 → 3 × m₂ = −1 → m₂ = −1/3.',
    },
    {
      q: 'A(1,2), B(4,2), C(5,5), D(2,5). Prove it is a parallelogram using midpoints of diagonals.',
      choices: ['Both midpoints are (3, 3.5)', 'Both midpoints are (2, 4)', 'Diagonals are equal length', 'Slopes of AB and CD are equal'],
      answer: 0,
      explanation: 'Midpoint AC = ((1+5)/2,(2+5)/2)=(3,3.5). Midpoint BD=((4+2)/2,(2+5)/2)=(3,3.5). Equal → parallelogram.',
    },
    {
      q: 'Which of these proves ABCD is a SQUARE (not just rectangle or rhombus)?',
      choices: [
        'All sides equal AND adjacent sides perpendicular',
        'Diagonals bisect each other AND are equal',
        'Opposite sides equal AND parallel',
        'All angles equal',
      ],
      answer: 0,
      explanation: 'A square is both a rhombus (all sides equal) and a rectangle (adjacent sides perpendicular). Both conditions together prove it.',
    },
  ],
};

LESSON_GEO_3_7.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_3_7.cells, title: LESSON_GEO_3_7.title, subject: LESSON_GEO_3_7.subject, sequential: LESSON_GEO_3_7.sequential } } });

const GEO_3_7_DEFAULT = {
  cells: LESSON_GEO_3_7.cells,
  id: 'geo-3-7',
  title: 'Coordinate Geometry Proofs',
  slug: 'coordinate-proofs',
  subject: 'Geometry',
  chapter: 3,
  order: 7,
  tags: ['coordinate geometry', 'proof', 'parallelogram', 'rectangle', 'rhombus', 'slope', 'distance'],
  intuition: LESSON_GEO_3_7.intuition,
  quiz: LESSON_GEO_3_7.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_3_7_DEFAULT;
export { LESSON_GEO_3_7 };
