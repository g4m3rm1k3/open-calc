import geoQuadUrl from '../diagrams/geo-quadrilaterals.svg?url'
import quizQuadUrl from '../diagrams/quiz-geo-quadrilaterals.svg?url'

const LESSON_GEO_6_4 = {
  title: 'Quadrilaterals: Properties and Classification',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Quadrilateral Family

A **quadrilateral** is any polygon with 4 sides. The interior angles always sum to **360°**.

| Shape | Defining property | Area formula |
|---|---|---|
| Trapezoid | Exactly one pair of parallel sides | ½(a+b)h |
| Kite | Two pairs of consecutive equal sides | ½d₁d₂ |
| Parallelogram | Two pairs of parallel sides | base × height |
| Rectangle | Parallelogram + all angles 90° | length × width |
| Rhombus | Parallelogram + all sides equal | ½d₁d₂ |
| Square | Rectangle + Rhombus | side² |

**Key diagonal properties:**
- **Rectangle** — diagonals are equal in length
- **Rhombus** — diagonals are perpendicular bisectors of each other
- **Square** — both: equal length AND perpendicular
- **Kite** — one diagonal is the perpendicular bisector of the other
- **Parallelogram** — diagonals bisect each other (but not necessarily equal or perpendicular)

![Quadrilateral family tree and shape properties](${geoQuadUrl})`,
    },

    {
      type: 'js',
      instruction: 'Click any quadrilateral family member to see its full set of properties highlighted. Drag the vertices of the selected shape to explore.',
      html: `<div style="font-family:monospace;font-size:12px;padding:6px;display:flex;gap:6px;flex-wrap:wrap" id="qbtnbar">
<button data-shape="parallelogram" style="padding:4px 8px;cursor:pointer;border:2px solid #166534;background:#f0fdf4;border-radius:4px">Parallelogram</button>
<button data-shape="rectangle" style="padding:4px 8px;cursor:pointer;border:2px solid #1e3a5f;background:#eff6ff;border-radius:4px">Rectangle</button>
<button data-shape="rhombus" style="padding:4px 8px;cursor:pointer;border:2px solid #7c3aed;background:#fdf4ff;border-radius:4px">Rhombus</button>
<button data-shape="square" style="padding:4px 8px;cursor:pointer;border:2px solid #b45309;background:#fef9c3;border-radius:4px">Square</button>
<button data-shape="trapezoid" style="padding:4px 8px;cursor:pointer;border:2px solid #b45309;background:#fff7ed;border-radius:4px">Trapezoid</button>
<button data-shape="kite" style="padding:4px 8px;cursor:pointer;border:2px solid #7c3aed;background:#fdf4ff;border-radius:4px">Kite</button>
</div>
<canvas id="qcv" width="580" height="260" style="border-radius:8px;display:block;margin:4px auto"></canvas>
<div id="qinfo" style="font-family:monospace;font-size:12px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:4px;min-height:60px"></div>`,
      css: `#qcv{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('qcv');
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

const info=document.getElementById('qinfo');

const SHAPES={
  parallelogram:{
    pts:[[80,200],[280,200],[310,80],[110,80]],
    color:'#166534',bg:'#f0fdf4',
    props:'• 2 pairs of parallel sides\\n• Opposite sides equal\\n• Opposite angles equal\\n• Diagonals bisect each other\\n• Area = base × height',
  },
  rectangle:{
    pts:[[80,200],[320,200],[320,80],[80,80]],
    color:'#1e3a5f',bg:'#eff6ff',
    props:'• All angles = 90°\\n• Opposite sides equal and parallel\\n• Diagonals equal in length\\n• Diagonals bisect each other\\n• Area = length × width',
  },
  rhombus:{
    pts:[[80,140],[180,200],[280,140],[180,80]],
    color:'#7c3aed',bg:'#fdf4ff',
    props:'• All 4 sides equal\\n• Opposite angles equal\\n• Diagonals perpendicular to each other\\n• Diagonals bisect each other\\n• Area = ½ d₁ × d₂',
  },
  square:{
    pts:[[100,200],[300,200],[300,60],[100,60]],
    color:'#b45309',bg:'#fef9c3',
    props:'• All 4 sides equal AND all angles 90°\\n• Diagonals equal, perpendicular, and bisect each other\\n• Most symmetric quadrilateral\\n• Area = side²',
  },
  trapezoid:{
    pts:[[60,200],[340,200],[300,80],[100,80]],
    color:'#b45309',bg:'#fff7ed',
    props:'• Exactly one pair of parallel sides (bases)\\n• Isosceles trapezoid: non-parallel sides equal\\n• Area = ½(a+b) × height\\n• Median = ½(a+b) (connects midpoints of non-parallel sides)',
  },
  kite:{
    pts:[[180,200],[290,130],[180,60],[70,130]],
    color:'#166534',bg:'#f0fdf4',
    props:'• Two pairs of consecutive equal sides\\n• One diagonal is the axis of symmetry\\n• Diagonals are perpendicular\\n• One diagonal bisects the other\\n• Area = ½ d₁ × d₂',
  },
};

let active='parallelogram';
let drag=-1;

function getVerts(name){return SHAPES[name].pts.map(p=>[...p]);}
const verts={};
Object.keys(SHAPES).forEach(n=>{verts[n]=getVerts(n);});

function draw(){
  ctx.clearRect(0,0,W,H);
  const sh=SHAPES[active];
  const pts=verts[active];
  // fill
  ctx.beginPath();
  pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
  ctx.closePath();
  ctx.fillStyle=sh.bg;ctx.fill();
  ctx.strokeStyle=sh.color;ctx.lineWidth=2.5;ctx.stroke();
  // diagonals dashed
  ctx.setLineDash([5,4]);ctx.strokeStyle=sh.color+'88';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[2][0],pts[2][1]);ctx.stroke();
  ctx.beginPath();ctx.moveTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[3][0],pts[3][1]);ctx.stroke();
  ctx.setLineDash([]);
  // vertices
  pts.forEach((p,i)=>{
    ctx.beginPath();ctx.arc(p[0],p[1],7,0,2*Math.PI);
    ctx.fillStyle=sh.color;ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('ABCD'[i],p[0],p[1]);
  });
  // measurements
  const d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const sides=[d(pts[0],pts[1]),d(pts[1],pts[2]),d(pts[2],pts[3]),d(pts[3],pts[0])];
  const diag1=d(pts[0],pts[2]),diag2=d(pts[1],pts[3]);
  // centroid
  const cx=(pts[0][0]+pts[1][0]+pts[2][0]+pts[3][0])/4;
  const cy=(pts[0][1]+pts[1][1]+pts[2][1]+pts[3][1])/4;
  ctx.fillStyle=sh.color;ctx.font='10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('sides: '+sides.map(s=>s.toFixed(1)).join(', '),cx,cy+20);
  ctx.fillText('d₁='+diag1.toFixed(1)+'  d₂='+diag2.toFixed(1),cx,cy+34);
  info.textContent=sh.props;
}

cv.onmousedown=e=>{
  const r=cv.getBoundingClientRect();
  const mx=e.clientX-r.left,my=e.clientY-r.top;
  verts[active].forEach((p,i)=>{
    if(Math.hypot(p[0]-mx,p[1]-my)<12)drag=i;
  });
};
cv.onmousemove=e=>{
  if(drag<0)return;
  const r=cv.getBoundingClientRect();
  verts[active][drag]=[e.clientX-r.left,e.clientY-r.top];
  draw();
};
cv.onmouseup=()=>{drag=-1;};

document.getElementById('qbtnbar').querySelectorAll('button').forEach(btn=>{
  btn.onclick=()=>{active=btn.dataset.shape;draw();};
});
draw();`,
      outputHeight: 430,
    },

    {
      type: 'js',
      instruction: 'Enter the parameters of any quadrilateral below to compute its area, perimeter, and diagonal lengths.',
      html: `<div style="font-family:monospace;font-size:12px;padding:8px">
<select id="shapeSel" style="font-size:13px;padding:4px;margin-bottom:8px">
  <option value="parallelogram">Parallelogram</option>
  <option value="rectangle">Rectangle</option>
  <option value="rhombus">Rhombus</option>
  <option value="square">Square</option>
  <option value="trapezoid">Trapezoid</option>
  <option value="kite">Kite</option>
</select>
<div id="inputArea" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px"></div>
<pre id="calcOut" style="background:#1e293b;color:#93c5fd;border-radius:8px;padding:10px;font-size:13px;min-height:80px"></pre>
</div>`,
      css: ``,
      startCode: `const sel=document.getElementById('shapeSel');
const inp=document.getElementById('inputArea');
const out=document.getElementById('calcOut');

const configs={
  parallelogram:{fields:['base b','height h','side a','angle A (deg)'],
    compute(v){
      const A=v[0]*v[1];
      const P=2*(v[0]+v[2]);
      const ar=(v[3]*Math.PI/180);
      const d1=Math.sqrt(v[0]**2+v[2]**2-2*v[0]*v[2]*Math.cos(ar)).toFixed(3);
      const d2=Math.sqrt(v[0]**2+v[2]**2-2*v[0]*v[2]*Math.cos(Math.PI-ar)).toFixed(3);
      return'Area = b×h = '+v[0]+'×'+v[1]+' = '+A+'\\nPerimeter = 2(b+a) = '+P+'\\nDiagonals: d₁='+d1+'  d₂='+d2;
    }},
  rectangle:{fields:['length l','width w'],
    compute(v){
      const A=v[0]*v[1];
      const P=2*(v[0]+v[1]);
      const d=Math.sqrt(v[0]**2+v[1]**2).toFixed(4);
      return'Area = l×w = '+v[0]+'×'+v[1]+' = '+A+'\\nPerimeter = 2(l+w) = '+P+'\\nDiagonal = √(l²+w²) = '+d;
    }},
  rhombus:{fields:['side a','diagonal d1','diagonal d2'],
    compute(v){
      const A=(0.5*v[1]*v[2]).toFixed(4);
      const P=4*v[0];
      return'Area = ½d₁d₂ = ½×'+v[1]+'×'+v[2]+' = '+A+'\\nPerimeter = 4a = '+P+'\\nDiagonals bisect each other at 90°';
    }},
  square:{fields:['side s'],
    compute(v){
      const A=v[0]**2;
      const P=4*v[0];
      const d=(v[0]*Math.sqrt(2)).toFixed(4);
      return'Area = s² = '+A+'\\nPerimeter = 4s = '+P+'\\nDiagonal = s√2 = '+d;
    }},
  trapezoid:{fields:['parallel side a','parallel side b','height h','leg c','leg d'],
    compute(v){
      const A=(0.5*(v[0]+v[1])*v[2]).toFixed(4);
      const P=v[0]+v[1]+v[3]+v[4];
      const med=(0.5*(v[0]+v[1])).toFixed(4);
      return'Area = ½(a+b)h = ½('+v[0]+'+'+v[1]+')×'+v[2]+' = '+A+'\\nPerimeter = '+P+'\\nMedian = ½(a+b) = '+med;
    }},
  kite:{fields:['diagonal d1 (axis)','diagonal d2'],
    compute(v){
      const A=(0.5*v[0]*v[1]).toFixed(4);
      return'Area = ½d₁d₂ = ½×'+v[0]+'×'+v[1]+' = '+A+'\\nd₁ bisects d₂ at 90° (d₁ is the axis of symmetry)';
    }},
};

const defaults={
  parallelogram:[10,6,7,60],
  rectangle:[12,8],
  rhombus:[8,12,10],
  square:[6],
  trapezoid:[10,16,5,6,5],
  kite:[14,10],
};

function buildInputs(shape){
  const cfg=configs[shape];
  inp.innerHTML='';
  cfg.fields.forEach((lbl,i)=>{
    const wrap=document.createElement('label');
    wrap.style.cssText='display:inline-flex;align-items:center;gap:4px;';
    const span=document.createElement('span');span.textContent=lbl+':';
    const input=document.createElement('input');
    input.type='number';input.value=defaults[shape][i]||1;
    input.style.cssText='width:54px;font-family:monospace';
    input.oninput=compute;
    wrap.appendChild(span);wrap.appendChild(input);
    inp.appendChild(wrap);
  });
  compute();
}

function compute(){
  const shape=sel.value;
  const vals=[...inp.querySelectorAll('input')].map(i=>parseFloat(i.value)||0);
  out.textContent=configs[shape].compute(vals);
}

sel.onchange=()=>buildInputs(sel.value);
buildInputs('parallelogram');`,
      outputHeight: 300,
    },

    {
      type: 'challenge',
      instruction: 'A parallelogram has base 15 cm, height 8 cm, and one side of length 10 cm with an included angle of 60°. Find: (a) Area, (b) Perimeter, (c) both diagonal lengths.',
      hint: 'Area = base × height. Perimeter = 2(b+a). Diagonals: use the law of cosines with the two sides and included angle (and its supplement).',
      solution: `(a) Area = base × height = 15 × 8 = 120 cm²

(b) Perimeter = 2(b + a) = 2(15 + 10) = 50 cm

(c) Diagonal 1 (across from 60°):
   d₁² = 15² + 10² - 2(15)(10)cos(60°)
      = 225 + 100 - 300(0.5) = 175
   d₁ = √175 = 5√7 ≈ 13.23 cm

   Diagonal 2 (across from 120°):
   d₂² = 225 + 100 - 300 cos(120°) = 325 + 150 = 475
   d₂ = √475 = 5√19 ≈ 21.79 cm`,
    },

    {
      type: 'challenge',
      instruction: 'A rhombus has diagonals of length 16 cm and 12 cm. Find: (a) Area, (b) side length, (c) perimeter.',
      hint: 'The diagonals of a rhombus bisect each other at right angles. Each half-diagonal and the side form a right triangle.',
      solution: `(a) Area = ½ × d₁ × d₂ = ½ × 16 × 12 = 96 cm²

(b) Half-diagonals: 8 and 6. By Pythagoras:
   side = √(8² + 6²) = √(64 + 36) = √100 = 10 cm

(c) Perimeter = 4 × side = 4 × 10 = 40 cm`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'Every quadrilateral in the family inherits all the properties of its parent. A square IS a rectangle (all properties apply) AND a rhombus (all those too). The hierarchy is about additional constraints, not different rules.',
      },
      {
        type: 'image',
        src: geoQuadUrl,
        alt: 'Quadrilateral family tree showing inheritance of properties',
        caption: 'The hierarchy: each shape inherits all properties from parents above it. Square is the most constrained — it sits at the intersection of rectangle and rhombus.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Memory trick for diagonals: "Rectangle Equals, Rhombus is at Right angles, Square is both." For kite: one diagonal bisects the other perpendicularly — like a kite frame.',
      },
    ],
  },

  quiz: [
    {
      q: 'Which quadrilateral has diagonals that are equal in length AND perpendicular?',
      img: quizQuadUrl,
      choices: ['Square', 'Rectangle', 'Rhombus', 'Kite'],
      answer: 0,
      explanation: 'A square inherits equal diagonals from being a rectangle and perpendicular diagonals from being a rhombus.',
    },
    {
      q: 'Area of a parallelogram with base 14 and height 8?',
      img: quizQuadUrl,
      choices: ['112', '96', '44', '128'],
      answer: 0,
      explanation: 'Area = base × height = 14 × 8 = 112.',
    },
    {
      q: 'A trapezoid has parallel sides 12 cm and 18 cm and height 5 cm. What is its area?',
      img: quizQuadUrl,
      choices: ['75 cm²', '90 cm²', '108 cm²', '60 cm²'],
      answer: 0,
      explanation: 'Area = ½(a+b)h = ½(12+18)(5) = ½(30)(5) = 75 cm².',
    },
    {
      q: 'A rhombus has diagonals 10 cm and 24 cm. What is its area?',
      img: quizQuadUrl,
      choices: ['120 cm²', '240 cm²', '60 cm²', '34 cm²'],
      answer: 0,
      explanation: 'Area = ½d₁d₂ = ½(10)(24) = 120 cm².',
    },
    {
      q: 'Which shape has exactly one pair of parallel sides?',
      choices: ['Trapezoid', 'Rhombus', 'Parallelogram', 'Kite'],
      answer: 0,
      explanation: 'A trapezoid has exactly one pair of parallel sides (the two bases). A parallelogram has two pairs.',
    },
    {
      q: 'In a rectangle with length 9 and width 12, what is the diagonal length?',
      choices: ['15', '21', '√225=15', 'both A and C'],
      answer: 3,
      explanation: 'Diagonal = √(9²+12²) = √(81+144) = √225 = 15. Both A and C state 15, so both are correct.',
    },
    {
      q: 'Sum of interior angles of any quadrilateral?',
      choices: ['360°', '180°', '540°', '720°'],
      answer: 0,
      explanation: 'Any quadrilateral can be split into 2 triangles, each contributing 180°, total 360°.',
    },
    {
      q: 'A kite has diagonals d₁=20 cm and d₂=8 cm. Area?',
      choices: ['80 cm²', '160 cm²', '40 cm²', '28 cm²'],
      answer: 0,
      explanation: 'Area = ½d₁d₂ = ½(20)(8) = 80 cm².',
    },
    {
      q: 'Which property is TRUE for a parallelogram but NOT necessarily a rectangle?',
      choices: ['Diagonals bisect each other', 'All angles are 90°', 'Diagonals are equal', 'It is a special rhombus'],
      answer: 0,
      explanation: 'Diagonals bisect each other in all parallelograms. Equal angles (90°) and equal diagonals are extra rectangle-only properties.',
    },
    {
      q: 'A square has side 7 cm. What is the length of each diagonal?',
      choices: ['7√2 ≈ 9.90 cm', '7 cm', '14 cm', '49 cm'],
      answer: 0,
      explanation: 'Diagonal of a square = s√2 = 7√2 ≈ 9.90 cm.',
    },
  ],
};

LESSON_GEO_6_4.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_6_4.cells, title: LESSON_GEO_6_4.title, subject: LESSON_GEO_6_4.subject, sequential: LESSON_GEO_6_4.sequential } } });

const GEO_6_4_DEFAULT = {
  cells: LESSON_GEO_6_4.cells,
  id: 'geo-6-4',
  title: 'Quadrilaterals: Properties and Classification',
  slug: 'quadrilaterals',
  subject: 'Geometry',
  chapter: 6,
  order: 4,
  tags: ['quadrilaterals', 'parallelogram', 'rectangle', 'rhombus', 'square', 'trapezoid', 'kite'],
  intuition: LESSON_GEO_6_4.intuition,
  quiz: LESSON_GEO_6_4.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_6_4_DEFAULT;
export { LESSON_GEO_6_4 };
