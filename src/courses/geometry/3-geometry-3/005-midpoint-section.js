import geoMidpointUrl from '../diagrams/geo-midpoint-section.svg?url'
import quizMidpointUrl from '../diagrams/quiz-geo-midpoint-section.svg?url'

const LESSON_GEO_3_5 = {
  title: 'Midpoint, Section & Centroid',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Splitting Segments with Coordinates

**Midpoint formula** — the average of endpoints:

$$M = \\left(\\frac{x_1+x_2}{2},\\; \\frac{y_1+y_2}{2}\\right)$$

**Section formula** — P divides AB internally in ratio $m:n$ from A:

$$P = \\left(\\frac{mx_2+nx_1}{m+n},\\; \\frac{my_2+ny_1}{m+n}\\right)$$

When $m=n=1$ this recovers the midpoint formula.

**Centroid** of $\\triangle ABC$ — where the three medians meet, divides each median 2:1 from vertex:

$$G = \\left(\\frac{x_1+x_2+x_3}{3},\\; \\frac{y_1+y_2+y_3}{3}\\right)$$

![Midpoint and section formula diagram](${geoMidpointUrl})`,
    },

    {
      type: 'js',
      instruction: 'Drag the two endpoints. The midpoint is computed live and animated to the exact position.',
      html: `<canvas id="mc" width="560" height="340" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="minfo" style="text-align:center;font-family:monospace;font-size:13px;margin-top:6px"></div>`,
      css: `#mc { cursor: crosshair; background:#f8fafc; }`,
      startCode: `const cv = document.getElementById('mc');
const ctx = cv.getContext('2d');

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

const info = document.getElementById('minfo');
const W = cv.width, H = cv.height;
const OX = 80, OY = 260, U = 40;  // origin pixel, unit size

let pts = [{x:2,y:4,label:'A',col:'#dc2626'},{x:8,y:2,label:'B',col:'#166534'}];
let drag = null;

function toP(cx,cy){ return {x:(cx-OX)/U, y:(OY-cy)/U}; }
function toCv(x,y){ return {cx:OX+x*U, cy:OY-y*U}; }

function drawGrid(){
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle=GRID; ctx.lineWidth=1;
  for(let g=-2;g<=12;g++){
    ctx.beginPath();
    ctx.moveTo(OX+g*U,20); ctx.lineTo(OX+g*U,H-20); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20,OY-g*U); ctx.lineTo(W-20,OY-g*U); ctx.stroke();
  }
  ctx.strokeStyle=TEXT; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(20,OY); ctx.lineTo(W-20,OY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(OX,H-20); ctx.lineTo(OX,20); ctx.stroke();
  ctx.fillStyle=TEXT; ctx.font='12px monospace';
  for(let g=1;g<=11;g++){ ctx.fillText(g, OX+g*U-3, OY+14); }
  for(let g=1;g<=6;g++){ ctx.fillText(g, OX-20, OY-g*U+4); }
}

function draw(){
  drawGrid();
  const A = pts[0], B = pts[1];
  const M = {x:(A.x+B.x)/2, y:(A.y+B.y)/2};
  const ca = toCv(A.x,A.y), cb = toCv(B.x,B.y), cm = toCv(M.x,M.y);
  // segment
  ctx.strokeStyle=NAVY; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(ca.cx,ca.cy); ctx.lineTo(cb.cx,cb.cy); ctx.stroke();
  // midpoint dashed grid
  ctx.strokeStyle=PURPLE; ctx.lineWidth=1; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(cm.cx,cm.cy); ctx.lineTo(cm.cx,OY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(OX,cm.cy); ctx.lineTo(cm.cx,cm.cy); ctx.stroke();
  ctx.setLineDash([]);
  // endpoints
  pts.forEach(p=>{
    const c=toCv(p.x,p.y);
    ctx.beginPath(); ctx.arc(c.cx,c.cy,8,0,2*Math.PI); ctx.fillStyle=p.col; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 12px Georgia';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(p.label, c.cx, c.cy);
    ctx.fillStyle=TEXT; ctx.font='12px monospace'; ctx.textBaseline='alphabetic';
    ctx.fillText('('+p.x.toFixed(1)+','+p.y.toFixed(1)+')', c.cx+14, c.cy-10);
  });
  // midpoint
  ctx.beginPath(); ctx.arc(cm.cx,cm.cy,8,0,2*Math.PI);
  ctx.fillStyle=PURPLE; ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold 11px Georgia';
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('M', cm.cx, cm.cy);
  info.textContent = 'A=(' + A.x.toFixed(1) + ',' + A.y.toFixed(1) +
    ')  B=(' + B.x.toFixed(1) + ',' + B.y.toFixed(1) +
    ')  →  M=(' + M.x.toFixed(2) + ',' + M.y.toFixed(2) + ')';
}

cv.addEventListener('mousedown', e=>{
  const r=cv.getBoundingClientRect();
  const mx=e.clientX-r.left, my=e.clientY-r.top;
  pts.forEach((p,i)=>{
    const c=toCv(p.x,p.y);
    if(Math.hypot(mx-c.cx,my-c.cy)<14) drag=i;
  });
});
cv.addEventListener('mousemove', e=>{
  if(drag===null) return;
  const r=cv.getBoundingClientRect();
  const mp=toP(e.clientX-r.left, e.clientY-r.top);
  pts[drag].x=Math.max(-1,Math.min(11,Math.round(mp.x*2)/2));
  pts[drag].y=Math.max(-1,Math.min(7,Math.round(mp.y*2)/2));
  draw();
});
cv.addEventListener('mouseup', ()=>{ drag=null; });
draw();`,
      outputHeight: 380,
    },

    {
      type: 'js',
      instruction: 'Set the ratio m:n and drag A and B. The section point P is computed with the formula and shown on the segment.',
      html: `<div style="text-align:center;margin-bottom:6px">
  <label style="font-size:13px;font-family:monospace">m: <input id="sm" type="range" min="1" max="5" value="1" style="width:90px"> <span id="sv">1</span></label>
  &nbsp;&nbsp;
  <label style="font-size:13px;font-family:monospace">n: <input id="sn" type="range" min="1" max="5" value="2" style="width:90px"> <span id="nv">2</span></label>
</div>
<canvas id="sc" width="560" height="300" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="sinfo" style="text-align:center;font-family:monospace;font-size:13px;margin-top:6px"></div>`,
      css: `#sc{background:#f8fafc;cursor:crosshair}`,
      startCode: `const cv=document.getElementById('sc');
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

const info=document.getElementById('sinfo');
const W=cv.width,H=cv.height;
const OX=70,OY=240,U=38;
let pts=[{x:1,y:5,label:'A',col:'#dc2626'},{x:9,y:1,label:'B',col:'#166534'}];
let drag=null;
let m=1,n=2;

document.getElementById('sm').oninput=e=>{m=+e.target.value;document.getElementById('sv').textContent=m;draw();};
document.getElementById('sn').oninput=e=>{n=+e.target.value;document.getElementById('nv').textContent=n;draw();};

function toCv(x,y){return{cx:OX+x*U,cy:OY-y*U};}
function toP(cx,cy){return{x:(cx-OX)/U,y:(OY-cy)/U};}

function drawGrid(){
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(let g=-1;g<=12;g++){
    ctx.beginPath();ctx.moveTo(OX+g*U,10);ctx.lineTo(OX+g*U,H-10);ctx.stroke();
    ctx.beginPath();ctx.moveTo(10,OY-g*U);ctx.lineTo(W-10,OY-g*U);ctx.stroke();
  }
  ctx.strokeStyle=TEXT;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(10,OY);ctx.lineTo(W-10,OY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(OX,H-10);ctx.lineTo(OX,10);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='10px monospace';ctx.textAlign='center';
  for(let g=1;g<=12;g++) ctx.fillText(g,OX+g*U,OY+14);
  ctx.textAlign='right';
  for(let g=1;g<=6;g++) ctx.fillText(g,OX-4,OY-g*U+4);
}

function draw(){
  drawGrid();
  const A=pts[0],B=pts[1];
  const Px=(m*B.x+n*A.x)/(m+n), Py=(m*B.y+n*A.y)/(m+n);
  const ca=toCv(A.x,A.y),cb=toCv(B.x,B.y),cp=toCv(Px,Py);
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(ca.cx,ca.cy);ctx.lineTo(cb.cx,cb.cy);ctx.stroke();
  // m segment
  ctx.strokeStyle='#b45309';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(ca.cx,ca.cy);ctx.lineTo(cp.cx,cp.cy);ctx.stroke();
  // n segment
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(cp.cx,cp.cy);ctx.lineTo(cb.cx,cb.cy);ctx.stroke();
  // labels m/n
  const mx2=(ca.cx+cp.cx)/2, my2=(ca.cy+cp.cy)/2;
  const nx2=(cp.cx+cb.cx)/2, ny2=(cp.cy+cb.cy)/2;
  ctx.fillStyle='#b45309';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('m='+m, mx2, my2-8);
  ctx.fillStyle='#94a3b8';
  ctx.fillText('n='+n, nx2, ny2-8);
  // endpoints
  pts.forEach(p=>{
    const c=toCv(p.x,p.y);
    ctx.beginPath();ctx.arc(c.cx,c.cy,8,0,2*Math.PI);ctx.fillStyle=p.col;ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.label,c.cx,c.cy);
    ctx.fillStyle=TEXT;ctx.font='12px monospace';ctx.textBaseline='alphabetic';
    ctx.fillText('('+p.x.toFixed(1)+','+p.y.toFixed(1)+')',c.cx+14,c.cy-10);
  });
  // P
  ctx.beginPath();ctx.arc(cp.cx,cp.cy,8,0,2*Math.PI);ctx.fillStyle='#b45309';ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('P',cp.cx,cp.cy);
  ctx.fillStyle='#b45309';ctx.font='12px monospace';ctx.textBaseline='alphabetic';
  ctx.textAlign='left';ctx.fillText('('+Px.toFixed(2)+','+Py.toFixed(2)+')',cp.cx+10,cp.cy-10);
  info.textContent='Section '+m+':'+n+' from A → P=('+Px.toFixed(3)+', '+Py.toFixed(3)+')';
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
  pts[drag].x=Math.max(0,Math.min(12,Math.round(mp.x)));
  pts[drag].y=Math.max(0,Math.min(7,Math.round(mp.y)));
  draw();
});
cv.addEventListener('mouseup',()=>{drag=null;});
draw();`,
      outputHeight: 360,
    },

    {
      type: 'js',
      instruction: 'Place the three vertices of a triangle by dragging. Watch the centroid G update live — always at the intersection of the medians.',
      html: `<canvas id="gc" width="560" height="340" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="ginfo" style="text-align:center;font-family:monospace;font-size:13px;margin-top:6px"></div>`,
      css: `#gc{background:#f8fafc;cursor:crosshair}`,
      startCode: `const cv=document.getElementById('gc');
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

const info=document.getElementById('ginfo');
const W=cv.width,H=cv.height;
const OX=60,OY=290,U=36;
const cols=['#dc2626','#166534','#7c3aed'];
let pts=[{x:2,y:6,label:'A'},{x:8,y:1,label:'B'},{x:10,y:7,label:'C'}];
let drag=null;

function toCv(x,y){return{cx:OX+x*U,cy:OY-y*U};}
function toP(cx,cy){return{x:(cx-OX)/U,y:(OY-cy)/U};}

function mid(p,q){return{x:(p.x+q.x)/2,y:(p.y+q.y)/2};}

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
  for(let g=1;g<=12;g++) ctx.fillText(g,OX+g*U,OY+14);
  ctx.textAlign='right';
  for(let g=1;g<=8;g++) ctx.fillText(g,OX-4,OY-g*U+4);
}

function draw(){
  drawGrid();
  const [A,B,C]=pts;
  const G={x:(A.x+B.x+C.x)/3,y:(A.y+B.y+C.y)/3};
  const mBC=mid(B,C),mAC=mid(A,C),mAB=mid(A,B);
  // triangle
  const ca=toCv(A.x,A.y),cb=toCv(B.x,B.y),cc=toCv(C.x,C.y);
  ctx.beginPath();ctx.moveTo(ca.cx,ca.cy);ctx.lineTo(cb.cx,cb.cy);ctx.lineTo(cc.cx,cc.cy);ctx.closePath();
  ctx.fillStyle='#1e3a5f11';ctx.fill();ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.stroke();
  // medians
  [
    [A,mBC],[B,mAC],[C,mAB]
  ].forEach(([v,m],i)=>{
    const cv1=toCv(v.x,v.y),cm=toCv(m.x,m.y);
    ctx.strokeStyle=cols[i];ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(cv1.cx,cv1.cy);ctx.lineTo(cm.cx,cm.cy);ctx.stroke();
    ctx.setLineDash([]);
  });
  // vertices
  pts.forEach((p,i)=>{
    const c=toCv(p.x,p.y);
    ctx.beginPath();ctx.arc(c.cx,c.cy,9,0,2*Math.PI);ctx.fillStyle=cols[i];ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.label,c.cx,c.cy);
    ctx.fillStyle=cols[i];ctx.font='12px monospace';ctx.textBaseline='alphabetic';
    ctx.textAlign='left';ctx.fillText('('+p.x+','+p.y+')',c.cx+12,c.cy-8);
  });
  // centroid
  const cg=toCv(G.x,G.y);
  ctx.beginPath();ctx.arc(cg.cx,cg.cy,10,0,2*Math.PI);ctx.fillStyle='#b45309';ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('G',cg.cx,cg.cy);
  info.textContent='A('+A.x+','+A.y+') B('+B.x+','+B.y+') C('+C.x+','+C.y+
    ')  →  G=('+G.x.toFixed(2)+', '+G.y.toFixed(2)+')';
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
  pts[drag].x=Math.max(0,Math.min(13,Math.round(mp.x)));
  pts[drag].y=Math.max(0,Math.min(9,Math.round(mp.y)));
  draw();
});
cv.addEventListener('mouseup',()=>{drag=null;});
draw();`,
      outputHeight: 380,
    },

    {
      type: 'challenge',
      instruction: 'A(−3, 4) and B(9, −2). Find the midpoint M, then find the point P that divides AB in the ratio 1:2 from A.',
      hint: 'Midpoint: average the coordinates. Section formula with m=1, n=2: P = ((1·9 + 2·(−3))/3, (1·(−2)+2·4)/3).',
      solution: `M = ((-3+9)/2, (4-2)/2) = (3, 1)

Section 1:2 from A:
P = ((1×9 + 2×(−3))/(1+2), (1×(−2) + 2×4)/(1+2))
  = ((9 − 6)/3, (−2 + 8)/3)
  = (1, 2)`,
    },

    {
      type: 'challenge',
      instruction: 'Triangle vertices are A(0, 0), B(6, 0), C(3, 9). Find the centroid G, and verify it lies on the median from A to the midpoint of BC.',
      hint: 'G = average of all three coordinates. Midpoint of BC = ((6+3)/2, (0+9)/2) = (4.5, 4.5). Show G lies on segment from A(0,0) to M(4.5,4.5).',
      solution: `G = ((0+6+3)/3, (0+0+9)/3) = (3, 3)

Midpoint of BC: M = ((6+3)/2, (0+9)/2) = (4.5, 4.5)

Median from A(0,0) to M(4.5,4.5): parametric = (4.5t, 4.5t).
At t = 2/3: (3, 3) = G ✓ — centroid is 2/3 of the way from vertex to opposite midpoint.`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'The midpoint is simply the average of coordinates in each direction — it sits exactly halfway along the number line between each pair of coordinates independently.',
      },
      {
        type: 'image',
        src: geoMidpointUrl,
        alt: 'Midpoint and section formula diagram',
        caption: 'M averages the x- and y-coordinates; P divides AB in ratio m:n from A.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'The section formula reduces to the midpoint formula when m = n = 1: both are about weighted averaging. The centroid is just three-point averaging — no weighting needed for a triangle.',
      },
    ],
  },

  quiz: [
    {
      q: 'What is the midpoint of A(2, 5) and B(8, 1)?',
      img: quizMidpointUrl,
      choices: ['(5, 3)', '(4, 3)', '(6, 6)', '(10, 6)'],
      answer: 0,
      explanation: 'M = ((2+8)/2, (5+1)/2) = (5, 3).',
    },
    {
      q: 'M(4, 6) is the midpoint of A(2, 4) and B. Find B.',
      img: quizMidpointUrl,
      choices: ['(6, 8)', '(3, 5)', '(8, 10)', '(2, 2)'],
      answer: 0,
      explanation: 'If M=((2+Bx)/2, (4+By)/2) = (4,6) then Bx=6, By=8.',
    },
    {
      q: 'P divides A(1, 5) to B(7, 2) in ratio 2:1 from A. What is P?',
      img: quizMidpointUrl,
      choices: ['(5, 3)', '(3, 4)', '(4, 3.5)', '(6, 2.5)'],
      answer: 0,
      explanation: 'P = ((2·7+1·1)/3, (2·2+1·5)/3) = (15/3, 9/3) = (5, 3).',
    },
    {
      q: 'Which formula gives the centroid G of a triangle with vertices (x₁,y₁), (x₂,y₂), (x₃,y₃)?',
      choices: [
        'G = ((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3)',
        'G = ((x₁+x₂)/2, (y₁+y₂)/2)',
        'G = (x₁+x₂+x₃, y₁+y₂+y₃)',
        'G = ((mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n))',
      ],
      answer: 0,
      explanation: 'The centroid is the arithmetic mean of all three vertex coordinates.',
    },
    {
      q: 'P divides AB in ratio 1:3 from A. If A=(0,0) and B=(8,4), find P.',
      choices: ['(2, 1)', '(4, 2)', '(6, 3)', '(3, 1.5)'],
      answer: 0,
      explanation: 'P = ((1·8+3·0)/4, (1·4+3·0)/4) = (2, 1).',
    },
    {
      q: 'A(0,0), B(9,0), C(0,6). What is the centroid?',
      choices: ['(3, 2)', '(4.5, 3)', '(3, 3)', '(0, 0)'],
      answer: 0,
      explanation: 'G = ((0+9+0)/3, (0+0+6)/3) = (3, 2).',
    },
    {
      q: 'The centroid divides each median in the ratio _____ from the vertex.',
      choices: ['2:1', '1:2', '1:1', '3:1'],
      answer: 0,
      explanation: 'The centroid lies 2/3 of the way from each vertex to the opposite midpoint, giving a 2:1 ratio.',
    },
    {
      q: 'A segment has midpoint (5, 3) and one endpoint (2, 7). Find the other endpoint.',
      choices: ['(8, −1)', '(6, 4)', '(3, 5)', '(7, 1)'],
      answer: 0,
      explanation: 'If (2+Bx)/2=5 then Bx=8; (7+By)/2=3 then By=−1.',
    },
    {
      q: 'Which transformation does NOT preserve distance?',
      choices: ['Dilation', 'Translation', 'Rotation', 'Reflection'],
      answer: 0,
      explanation: 'Dilation scales distances by factor k. The other three are rigid motions (isometries) that preserve distance.',
    },
    {
      q: 'P divides A(−2, 6) to B(10, 0) in ratio 1:2. Find P.',
      choices: ['(2, 4)', '(4, 3)', '(0, 5)', '(6, 2)'],
      answer: 0,
      explanation: 'P = ((1·10+2·(−2))/3, (1·0+2·6)/3) = (6/3, 12/3) = (2, 4).',
    },
  ],
};

LESSON_GEO_3_5.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_3_5.cells, title: LESSON_GEO_3_5.title, subject: LESSON_GEO_3_5.subject, sequential: LESSON_GEO_3_5.sequential } } });

const GEO_3_5_DEFAULT = {
  cells: LESSON_GEO_3_5.cells,
  id: 'geo-3-5',
  title: 'Midpoint, Section & Centroid',
  slug: 'midpoint-section',
  subject: 'Geometry',
  chapter: 3,
  order: 5,
  tags: ['coordinates', 'midpoint', 'section formula', 'centroid'],
  intuition: LESSON_GEO_3_5.intuition,
  quiz: LESSON_GEO_3_5.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_3_5_DEFAULT;
export { LESSON_GEO_3_5 };
