import geo3DUrl from '../diagrams/geo-3d-coordinates.svg?url'
import quiz3DUrl from '../diagrams/quiz-geo-3d-coords.svg?url'

const LESSON_GEO_4_7 = {
  title: '3D Coordinates and Distance',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Extending to Three Dimensions

Every point in 3D space is described by an ordered triple $(x, y, z)$.

**Distance formula in 3D** — direct extension of Pythagoras:

$$|PQ| = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$

**Midpoint in 3D** — average each coordinate:

$$M = \\left(\\frac{x_1+x_2}{2},\\; \\frac{y_1+y_2}{2},\\; \\frac{z_1+z_2}{2}\\right)$$

**Section formula in 3D** — exactly as in 2D, applied to each of the three coordinates.

**Centroid of a tetrahedron** (4 vertices):

$$G = \\left(\\frac{x_1+x_2+x_3+x_4}{4},\\; \\frac{y_1+y_2+y_3+y_4}{4},\\; \\frac{z_1+z_2+z_3+z_4}{4}\\right)$$

**Direction cosines:** For a segment from origin to $P(x,y,z)$ of length $r = |OP|$:
$$\\cos\\alpha = x/r,\\quad \\cos\\beta = y/r,\\quad \\cos\\gamma = z/r$$
$$\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$$

![3D coordinate system and distance formula](${geo3DUrl})`,
    },

    {
      type: 'js',
      instruction: 'Drag two points in 3D (controlled by sliders for x, y, z). Distance and midpoint update live.',
      html: `<div style="font-family:monospace;font-size:12px;padding:8px">
<b>Point P:</b>
<label>x: <input id="px" type="range" min="-5" max="8" value="1" style="width:70px"> <span id="pxv">1</span></label>
<label>y: <input id="py" type="range" min="-5" max="8" value="2" style="width:70px"> <span id="pyv">2</span></label>
<label>z: <input id="pz" type="range" min="-5" max="8" value="3" style="width:70px"> <span id="pzv">3</span></label>
<br><b>Point Q:</b>
<label>x: <input id="qx" type="range" min="-5" max="8" value="5" style="width:70px"> <span id="qxv">5</span></label>
<label>y: <input id="qy" type="range" min="-5" max="8" value="6" style="width:70px"> <span id="qyv">6</span></label>
<label>z: <input id="qz" type="range" min="-5" max="8" value="7" style="width:70px"> <span id="qzv">7</span></label>
</div>
<canvas id="d3c" width="580" height="260" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="d3info" style="font-family:monospace;font-size:13px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:6px"></div>`,
      css: `#d3c{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('d3c');
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

const d3info=document.getElementById('d3info');
const W=cv.width,H=cv.height;
const OX=260,OY=160;
// isometric projection
function iso(x,y,z){return{cx:OX+x*30-z*15,cy:OY-y*28+z*12};}

function getVals(){
  return {
    P:{x:+document.getElementById('px').value,y:+document.getElementById('py').value,z:+document.getElementById('pz').value},
    Q:{x:+document.getElementById('qx').value,y:+document.getElementById('qy').value,z:+document.getElementById('qz').value},
  };
}
['px','py','pz','qx','qy','qz'].forEach(id=>{
  document.getElementById(id).oninput=e=>{
    document.getElementById(id+'v').textContent=e.target.value;draw();
  };
});

function drawAxes(){
  ctx.clearRect(0,0,W,H);
  // Draw grid planes lightly
  for(let i=-2;i<=8;i++){
    // xz-plane at y=0
    const a=iso(i,0,-2),b=iso(i,0,8);
    ctx.strokeStyle=GRID;ctx.lineWidth=0.8;
    ctx.beginPath();ctx.moveTo(a.cx,a.cy);ctx.lineTo(b.cx,b.cy);ctx.stroke();
    const c=iso(-2,0,i),d=iso(8,0,i);
    ctx.beginPath();ctx.moveTo(c.cx,c.cy);ctx.lineTo(d.cx,d.cy);ctx.stroke();
  }
  // Axes
  const o=iso(0,0,0),xA=iso(8,0,0),yA=iso(0,8,0),zA=iso(0,0,8);
  ctx.lineWidth=2;
  ctx.strokeStyle=GREEN;ctx.beginPath();ctx.moveTo(o.cx,o.cy);ctx.lineTo(xA.cx,xA.cy);ctx.stroke();
  ctx.fillStyle=GREEN;ctx.font='13px Georgia';ctx.fillText('x',xA.cx+4,xA.cy+4);
  ctx.strokeStyle=NAVY;ctx.beginPath();ctx.moveTo(o.cx,o.cy);ctx.lineTo(yA.cx,yA.cy);ctx.stroke();
  ctx.fillStyle=NAVY;ctx.fillText('y',yA.cx-4,yA.cy-6);
  ctx.strokeStyle='#dc2626';ctx.beginPath();ctx.moveTo(o.cx,o.cy);ctx.lineTo(zA.cx,zA.cy);ctx.stroke();
  ctx.fillStyle=RED;ctx.fillText('z',zA.cx-14,zA.cy+4);
  // Tick marks on axes
  ctx.fillStyle='#94a3b8';ctx.font='9px monospace';ctx.textAlign='center';
  for(let i=1;i<=7;i++){
    const px=iso(i,0,0); ctx.fillText(i,px.cx,px.cy+12);
    const py=iso(0,i,0); ctx.fillText(i,py.cx-10,py.cy+4);
    const pz=iso(0,0,i); ctx.fillText(i,pz.cx+6,pz.cy+4);
  }
  ctx.fillStyle=TEXT;ctx.font='11px monospace';
  ctx.fillText('O(0,0,0)',o.cx+8,o.cy+14);
}

function draw(){
  drawAxes();
  const {P,Q}=getVals();
  const pp=iso(P.x,P.y,P.z),pq=iso(Q.x,Q.y,Q.z);
  const dx=Q.x-P.x,dy=Q.y-P.y,dz=Q.z-P.z;
  const dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
  const Mx=(P.x+Q.x)/2,My=(P.y+Q.y)/2,Mz=(P.z+Q.z)/2;
  const pm=iso(Mx,My,Mz);
  // projection dashes P
  const pxyz_base=iso(P.x,0,P.z),pxyz_x=iso(P.x,0,0),pxyz_z=iso(0,0,P.z);
  ctx.strokeStyle='#dc262688';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(pxyz_base.cx,pxyz_base.cy);ctx.lineTo(pp.cx,pp.cy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(pxyz_x.cx,pxyz_x.cy);ctx.lineTo(pxyz_base.cx,pxyz_base.cy);ctx.stroke();
  ctx.setLineDash([]);
  // Segment PQ
  ctx.strokeStyle='#b45309';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(pp.cx,pp.cy);ctx.lineTo(pq.cx,pq.cy);ctx.stroke();
  // P, Q, M dots
  ctx.beginPath();ctx.arc(pp.cx,pp.cy,7,0,2*Math.PI);ctx.fillStyle=RED;ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 10px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('P',pp.cx,pp.cy);
  ctx.beginPath();ctx.arc(pq.cx,pq.cy,7,0,2*Math.PI);ctx.fillStyle=GREEN;ctx.fill();
  ctx.fillStyle='#fff';ctx.fillText('Q',pq.cx,pq.cy);
  ctx.beginPath();ctx.arc(pm.cx,pm.cy,5,0,2*Math.PI);ctx.fillStyle=PURPLE;ctx.fill();
  ctx.textBaseline='alphabetic';ctx.fillStyle=PURPLE;ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('M',pm.cx+6,pm.cy-4);
  ctx.fillStyle=RED;ctx.font='11px monospace';
  ctx.textAlign='left';ctx.fillText('P('+P.x+','+P.y+','+P.z+')',pp.cx+9,pp.cy-6);
  ctx.fillStyle=GREEN;ctx.fillText('Q('+Q.x+','+Q.y+','+Q.z+')',pq.cx+9,pq.cy-6);

  d3info.textContent=[
    'P=('+P.x+','+P.y+','+P.z+')  Q=('+Q.x+','+Q.y+','+Q.z+')',
    '|PQ| = √('+dx+'²+'+dy+'²+'+dz+'²) = √'+( dx*dx+dy*dy+dz*dz)+' = '+dist.toFixed(4),
    'Midpoint M = (('+P.x+'+'+Q.x+')/2,('+P.y+'+'+Q.y+')/2,('+P.z+'+'+Q.z+')/2) = ('+Mx+','+My+','+Mz+')',
  ].join('\\n');
}
draw();`,
      outputHeight: 430,
    },

    {
      type: 'js',
      instruction: 'Enter four vertices of a tetrahedron. The centroid is computed and the distance from each vertex to the centroid is checked (should be equal for a regular tetrahedron).',
      html: `<div style="font-family:monospace;font-size:12px;padding:8px">
<b>Tetrahedron vertices:</b><br>
A: x<input id="ax" type="number" value="0" style="width:40px"> y<input id="ay" type="number" value="0" style="width:40px"> z<input id="az" type="number" value="0" style="width:40px">
B: x<input id="bx" type="number" value="6" style="width:40px"> y<input id="by" type="number" value="0" style="width:40px"> z<input id="bz" type="number" value="0" style="width:40px"><br>
C: x<input id="cx2" type="number" value="3" style="width:40px"> y<input id="cy2" type="number" value="0" style="width:40px"> z<input id="cz2" type="number" value="6" style="width:40px">
D: x<input id="dx" type="number" value="3" style="width:40px"> y<input id="dy" type="number" value="4" style="width:40px"> z<input id="dz" type="number" value="2" style="width:40px">
<button id="calcG" style="margin-left:10px;padding:4px 10px;cursor:pointer">Compute Centroid</button>
<pre id="gout" style="background:#1e293b;color:#93c5fd;border-radius:8px;padding:10px;margin-top:8px;font-size:12px;min-height:100px"></pre>
</div>`,
      css: ``,
      startCode: `function computeG(){
  const ids=['a','b','c2','d'];
  const pts=ids.map(id=>({
    x:+document.getElementById(id+'x').value,
    y:+document.getElementById(id+'y').value,
    z:+document.getElementById(id+'z').value,
  }));
  const [A,B,C,D]=pts;
  const Gx=(A.x+B.x+C.x+D.x)/4;
  const Gy=(A.y+B.y+C.y+D.y)/4;
  const Gz=(A.z+B.z+C.z+D.z)/4;
  function dist(p){return Math.sqrt((p.x-Gx)**2+(p.y-Gy)**2+(p.z-Gz)**2);}
  const lines=[
    'Centroid G = (('+A.x+'+'+B.x+'+'+C.x+'+'+D.x+')/4, ...)',
    '           = ('+Gx.toFixed(4)+', '+Gy.toFixed(4)+', '+Gz.toFixed(4)+')',
    '',
    'Distances from G to each vertex:',
    '  |AG| = '+dist(A).toFixed(4),
    '  |BG| = '+dist(B).toFixed(4),
    '  |CG| = '+dist(C).toFixed(4),
    '  |DG| = '+dist(D).toFixed(4),
    '',
    'Edge lengths:',
    '  |AB| = '+Math.sqrt((B.x-A.x)**2+(B.y-A.y)**2+(B.z-A.z)**2).toFixed(4),
    '  |AC| = '+Math.sqrt((C.x-A.x)**2+(C.y-A.y)**2+(C.z-A.z)**2).toFixed(4),
    '  |AD| = '+Math.sqrt((D.x-A.x)**2+(D.y-A.y)**2+(D.z-A.z)**2).toFixed(4),
    '  |BC| = '+Math.sqrt((C.x-B.x)**2+(C.y-B.y)**2+(C.z-B.z)**2).toFixed(4),
    '  |BD| = '+Math.sqrt((D.x-B.x)**2+(D.y-B.y)**2+(D.z-B.z)**2).toFixed(4),
    '  |CD| = '+Math.sqrt((D.x-C.x)**2+(D.y-C.y)**2+(D.z-C.z)**2).toFixed(4),
  ];
  document.getElementById('gout').textContent=lines.join('\\n');
}
document.getElementById('calcG').onclick=computeG;
computeG();`,
      outputHeight: 400,
    },

    {
      type: 'challenge',
      instruction: 'Find the distance between P(1, −2, 3) and Q(4, 2, −1). Then find the point R that divides PQ in the ratio 2:1 from P.',
      hint: 'Distance: √((4−1)²+(2−(−2))²+(−1−3)²). Section formula with m=2, n=1: R=((2×Q+1×P)/3 for each coordinate).',
      solution: `|PQ| = √((4−1)² + (2−(−2))² + (−1−3)²)
     = √(9 + 16 + 16)
     = √41 ≈ 6.403

Section formula (2:1 from P):
  R = ((2×4+1×1)/3, (2×2+1×(−2))/3, (2×(−1)+1×3)/3)
    = ((8+1)/3, (4−2)/3, (−2+3)/3)
    = (3, 2/3, 1/3)`,
    },

    {
      type: 'challenge',
      instruction: 'A tetrahedron has vertices A(0,0,0), B(6,0,0), C(3,0,6), D(3,4,2). Find the centroid G and the length |AG|.',
      hint: 'G = average of all four vertices coordinate-by-coordinate. |AG| = distance formula from A to G.',
      solution: `G = ((0+6+3+3)/4, (0+0+0+4)/4, (0+0+6+2)/4)
  = (12/4, 4/4, 8/4)
  = (3, 1, 2)

|AG| = √((3−0)² + (1−0)² + (2−0)²)
     = √(9 + 1 + 4)
     = √14 ≈ 3.742`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'The 3D distance formula is Pythagoras applied twice: first find the diagonal of the base rectangle, then apply Pythagoras again with that diagonal and the vertical height. The result √(Δx²+Δy²+Δz²) is the 3D hypotenuse.',
      },
      {
        type: 'image',
        src: geo3DUrl,
        alt: '3D coordinate system and distance formula derivation',
        caption: 'Left: plotting P(4,3,2) using the three axes. Right: two-step Pythagoras gives the 3D distance formula.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Every 2D formula has an exact 3D analogue — just add the z-term. Midpoint average, section formula, centroid: all extend mechanically. Distance: add (Δz)² under the root.',
      },
    ],
  },

  quiz: [
    {
      q: 'Distance between P(1,2,3) and Q(5,6,7)?',
      img: quiz3DUrl,
      choices: ['√(16+16+16)=4√3≈6.928', '√(4+4+4)', '12', '8'],
      answer: 0,
      explanation: '|PQ|=√((5−1)²+(6−2)²+(7−3)²)=√(16+16+16)=√48=4√3≈6.928.',
    },
    {
      q: 'Midpoint of P(2,4,6) and Q(8,0,2)?',
      img: quiz3DUrl,
      choices: ['(5, 2, 4)', '(6, 4, 8)', '(3, 2, 4)', '(5, 4, 8)'],
      answer: 0,
      explanation: 'M=((2+8)/2,(4+0)/2,(6+2)/2)=(5,2,4).',
    },
    {
      q: 'Distance from origin to P(3,4,0)?',
      choices: ['5', '7', '√7', '25'],
      answer: 0,
      explanation: '√(9+16+0)=√25=5.',
    },
    {
      q: 'Centroid of tetrahedron with vertices (0,0,0),(6,0,0),(3,0,6),(3,4,2)?',
      img: quiz3DUrl,
      choices: ['(3,1,2)', '(3,4,8)', '(4,1,2)', '(2,1,2)'],
      answer: 0,
      explanation: 'G=((0+6+3+3)/4,(0+0+0+4)/4,(0+0+6+2)/4)=(12/4,4/4,8/4)=(3,1,2).',
    },
    {
      q: 'P divides A(0,0,0) to B(9,6,3) in ratio 1:2 from A. Find P.',
      choices: ['(3,2,1)', '(6,4,2)', '(4.5,3,1.5)', '(3,3,3)'],
      answer: 0,
      explanation: 'P=(1×9+2×0)/3,(1×6+2×0)/3,(1×3+2×0)/3)=(3,2,1).',
    },
    {
      q: 'Which formula gives the 3D distance from P(x₁,y₁,z₁) to Q(x₂,y₂,z₂)?',
      choices: ['√((x₂-x₁)²+(y₂-y₁)²+(z₂-z₁)²)', '|x₂-x₁|+|y₂-y₁|+|z₂-z₁|', '(x₂-x₁)+(y₂-y₁)+(z₂-z₁)', '√((x₁-x₂)+(y₁-y₂))'],
      answer: 0,
      explanation: 'The 3D distance formula is the Euclidean distance: sum the squares of all three differences, then take the square root.',
    },
    {
      q: 'M(4,3,5) is the midpoint of A(2,1,3) and B. Find B.',
      choices: ['(6,5,7)', '(3,2,4)', '(2,2,2)', '(8,6,10)'],
      answer: 0,
      explanation: 'B=(2×4-2,2×3-1,2×5-3)=(6,5,7).',
    },
    {
      q: 'Direction cosine formula: if α is the angle with x-axis and |OP|=r, then cos α =',
      choices: ['x/r', 'r/x', 'x+y+z', 'x/r²'],
      answer: 0,
      explanation: 'cos α = x/r where r = |OP| = √(x²+y²+z²).',
    },
    {
      q: 'Which relationship do direction cosines satisfy?',
      choices: ['cos²α+cos²β+cos²γ=1', 'cosα+cosβ+cosγ=1', 'cos(α+β+γ)=1', 'cosα·cosβ·cosγ=1'],
      answer: 0,
      explanation: 'cos²α+cos²β+cos²γ = x²/r² + y²/r² + z²/r² = (x²+y²+z²)/r² = r²/r² = 1.',
    },
    {
      q: 'P(3,4,0) and Q(0,0,0). What is |PQ|?',
      choices: ['5', '7', '12', '√5'],
      answer: 0,
      explanation: '|PQ|=√(9+16+0)=√25=5.',
    },
  ],
};

LESSON_GEO_4_7.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_4_7.cells, title: LESSON_GEO_4_7.title, subject: LESSON_GEO_4_7.subject, sequential: LESSON_GEO_4_7.sequential } } });

const GEO_4_7_DEFAULT = {
  cells: LESSON_GEO_4_7.cells,
  id: 'geo-4-7',
  title: '3D Coordinates and Distance',
  slug: '3d-coordinates',
  subject: 'Geometry',
  chapter: 4,
  order: 7,
  tags: ['3D coordinates', 'distance formula', 'midpoint 3D', 'centroid', 'direction cosines'],
  intuition: LESSON_GEO_4_7.intuition,
  quiz: LESSON_GEO_4_7.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_4_7_DEFAULT;
export { LESSON_GEO_4_7 };
