import geoCompUrl from '../diagrams/geo-composite-figures.svg?url'
import quizCompUrl from '../diagrams/quiz-geo-composite.svg?url'

const LESSON_GEO_6_5 = {
  title: 'Composite Figures: Area and Perimeter',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Composite Figures

A **composite figure** is a shape formed by combining or subtracting simple shapes.

**The strategy:**
1. Decompose: identify each simple part (rectangle, triangle, circle, semicircle, trapezoid…)
2. Assign signs: **+** for regions inside the figure, **−** for holes cut out
3. Compute each sub-area with its standard formula
4. Sum: Total area = Σ(signed sub-areas)

**Perimeter** = trace only the outer boundary. Internal partition lines are NOT part of the perimeter.

**Common sub-areas to know:**
| Shape | Formula |
|---|---|
| Rectangle | l × w |
| Triangle | ½ base × height |
| Circle | πr² |
| Semicircle | ½πr² |
| Trapezoid | ½(a+b)h |
| Sector (angle θ°) | (θ/360)πr² |

**Common perimeter components:**
| Arc | Formula |
|---|---|
| Full circle circumference | 2πr |
| Semicircle arc | πr |
| Arc of sector θ° | (θ/360)(2πr) |

![Composite figure examples: L-shape, rectangle minus circle, stadium](${geoCompUrl})`,
    },

    {
      type: 'js',
      instruction: 'Build a composite shape by checking pieces. The total area and perimeter update live.',
      html: `<div style="font-family:monospace;font-size:12px;padding:8px">
<b>Add to figure:</b>
<label><input type="checkbox" id="cb_rect" checked> Rectangle (w=<input id="rw" type="number" value="20" style="width:40px">, h=<input id="rh" type="number" value="12" style="width:40px">)</label><br>
<label><input type="checkbox" id="cb_tri"> Triangle on top (same base, h=<input id="th" type="number" value="8" style="width:40px">)</label><br>
<label><input type="checkbox" id="cb_semi"> Semicircle on right (r = half of rectangle height)</label><br>
<label><input type="checkbox" id="cb_hole"> Subtract circle hole (r=<input id="hr" type="number" value="4" style="width:40px">)</label><br>
<button id="calcComp" style="margin-top:6px;padding:4px 10px;cursor:pointer">Compute</button>
</div>
<canvas id="compcv" width="580" height="220" style="border-radius:8px;display:block;margin:4px auto"></canvas>
<pre id="compinfo" style="background:#1e293b;color:#93c5fd;border-radius:8px;padding:8px;font-size:12px;margin-top:4px;min-height:80px"></pre>`,
      css: `#compcv{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('compcv');
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

const out=document.getElementById('compinfo');

function getVals(){
  return {
    rect:document.getElementById('cb_rect').checked,
    rw:+document.getElementById('rw').value||20,
    rh:+document.getElementById('rh').value||12,
    tri:document.getElementById('cb_tri').checked,
    th:+document.getElementById('th').value||8,
    semi:document.getElementById('cb_semi').checked,
    hole:document.getElementById('cb_hole').checked,
    hr:+document.getElementById('hr').value||4,
  };
}

function draw(){
  ctx.clearRect(0,0,W,H);
  const v=getVals();
  const scale=12;
  const ox=60, oy=H-50;
  const bw=v.rw*scale, bh=v.rh*scale;
  const r=v.rh/2*scale;
  const hx=ox+bw/2, hy=oy-bh/2;
  const th=v.th*scale;
  const hr=v.hr*scale;

  let area=0, perimParts=[];

  if(v.rect){
    ctx.fillStyle='#dbeafe88';ctx.fillRect(ox,oy-bh,bw,bh);
    ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.strokeRect(ox,oy-bh,bw,bh);
    area+=v.rw*v.rh;
    perimParts.push('Rect perimeter base: 2('+v.rw+'+'+v.rh+')='+(2*(v.rw+v.rh)));
  }
  if(v.tri&&v.rect){
    ctx.beginPath();ctx.moveTo(ox,oy-bh);ctx.lineTo(ox+bw/2,oy-bh-th);ctx.lineTo(ox+bw,oy-bh);ctx.closePath();
    ctx.fillStyle='#bbf7d088';ctx.fill();ctx.strokeStyle=GREEN;ctx.lineWidth=2;ctx.stroke();
    area+=0.5*v.rw*v.th;
    const leg=Math.sqrt((v.rw/2)**2+v.th**2).toFixed(3);
    perimParts.push('Triangle adds 2 legs: 2×'+leg+'='+  (2*parseFloat(leg)).toFixed(3));
  }
  if(v.semi&&v.rect){
    ctx.beginPath();ctx.arc(ox+bw,oy-r,r,Math.PI*1.5,Math.PI*0.5);ctx.closePath();
    ctx.fillStyle='#fde68a88';ctx.fill();ctx.strokeStyle='#b45309';ctx.lineWidth=2;ctx.stroke();
    area+=0.5*Math.PI*(v.rh/2)**2;
    perimParts.push('Semicircle arc: pi×r='+( Math.PI*(v.rh/2)).toFixed(3));
  }
  if(v.hole&&v.rect){
    ctx.beginPath();ctx.arc(hx,hy,hr,0,2*Math.PI);
    ctx.fillStyle='#f8fafc';ctx.fill();ctx.strokeStyle='#dc2626';ctx.setLineDash([4,3]);ctx.lineWidth=1.5;ctx.stroke();
    ctx.setLineDash([]);
    area-=Math.PI*v.hr**2;
    perimParts.push('Hole subtracts from area: -pi×r²='+ (-Math.PI*v.hr**2).toFixed(3)+' (hole perimeter NOT in outer boundary)');
  }
  const lines=['Area breakdown:'];
  if(v.rect) lines.push('  Rectangle: '+v.rw+'×'+v.rh+' = '+(v.rw*v.rh));
  if(v.tri&&v.rect) lines.push('  + Triangle: ½×'+v.rw+'×'+v.th+' = '+(0.5*v.rw*v.th));
  if(v.semi&&v.rect) lines.push('  + Semicircle: ½π('+v.rh/2+')² = '+(0.5*Math.PI*(v.rh/2)**2).toFixed(4));
  if(v.hole&&v.rect) lines.push('  - Circle hole: π('+v.hr+')² = '+(-Math.PI*v.hr**2).toFixed(4));
  lines.push('  TOTAL AREA = '+area.toFixed(4)+' sq units');
  lines.push('');
  perimParts.forEach(p=>lines.push('  '+p));
  out.textContent=lines.join('\\n');
}

['cb_rect','cb_tri','cb_semi','cb_hole'].forEach(id=>document.getElementById(id).onchange=draw);
['rw','rh','th','hr'].forEach(id=>document.getElementById(id).oninput=draw);
document.getElementById('calcComp').onclick=draw;
draw();`,
      outputHeight: 440,
    },

    {
      type: 'js',
      instruction: 'Draw your own composite figure on the canvas by clicking to place points. Holes can be added as circles. Area is estimated by pixel counting (Monte Carlo).',
      html: `<div style="font-family:monospace;font-size:12px;padding:6px">
<button id="btnPoly" style="padding:4px 8px;cursor:pointer">Polygon mode</button>
<button id="btnCirc" style="padding:4px 8px;cursor:pointer">Add circle hole</button>
<button id="btnClear" style="padding:4px 8px;cursor:pointer">Clear</button>
<span id="modeLabel" style="margin-left:8px;color:#1e3a5f;font-weight:bold">Mode: polygon</span>
</div>
<canvas id="drawcv" width="580" height="260" style="border-radius:8px;display:block;margin:4px auto;cursor:crosshair"></canvas>
<div id="drawinfo" style="font-family:monospace;font-size:12px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:4px"></div>`,
      css: `#drawcv{background:#f8fafc;border:1px solid #e2e8f0}`,
      startCode: `const cv=document.getElementById('drawcv');
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

const info=document.getElementById('drawinfo');
const modeLabel=document.getElementById('modeLabel');
let mode='polygon', pts=[], circles=[], circCenter=null;

function redraw(){
  ctx.clearRect(0,0,W,H);
  // polygon
  if(pts.length>0){
    ctx.beginPath();
    pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
    if(pts.length>2)ctx.closePath();
    ctx.fillStyle='#dbeafe66';ctx.fill();
    ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.stroke();
    pts.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],4,0,2*Math.PI);ctx.fillStyle=NAVY;ctx.fill();});
  }
  // circles
  circles.forEach(c=>{
    ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,2*Math.PI);
    ctx.fillStyle='#f8fafc88';ctx.fill();
    ctx.strokeStyle='#dc2626';ctx.setLineDash([5,3]);ctx.lineWidth=1.5;ctx.stroke();
    ctx.setLineDash([]);
  });
  // pending circle center
  if(circCenter){
    ctx.beginPath();ctx.arc(circCenter[0],circCenter[1],6,0,2*Math.PI);
    ctx.fillStyle=RED;ctx.fill();
    ctx.fillStyle=TEXT;ctx.font='10px monospace';
    ctx.fillText('click to set radius',circCenter[0]+8,circCenter[1]-4);
  }
  if(pts.length>=3){
    const A=shoelace(pts);
    const holeA=circles.reduce((s,c)=>s+Math.PI*c.r*c.r,0);
    info.textContent='Polygon area (shoelace): '+A.toFixed(2)+'\\nCircle holes: -'+holeA.toFixed(2)+'\\nNet area: '+(A-holeA).toFixed(2)+' px²\\n(scale to real units by dividing by pixels/unit)²';
  } else {
    info.textContent='Click to place polygon vertices. Double-click to close. Then add circle holes.';
  }
}

function shoelace(p){
  let s=0;
  for(let i=0;i<p.length;i++){const j=(i+1)%p.length;s+=p[i][0]*p[j][1]-p[j][0]*p[i][1];}
  return Math.abs(s)/2;
}

cv.onclick=e=>{
  const r=cv.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;
  if(mode==='polygon'){pts.push([x,y]);}
  else if(mode==='circle'){
    if(!circCenter){circCenter=[x,y];}
    else{
      const rad=Math.hypot(x-circCenter[0],y-circCenter[1]);
      circles.push({x:circCenter[0],y:circCenter[1],r:rad});
      circCenter=null;
    }
  }
  redraw();
};

document.getElementById('btnPoly').onclick=()=>{mode='polygon';modeLabel.textContent='Mode: polygon';};
document.getElementById('btnCirc').onclick=()=>{mode='circle';circCenter=null;modeLabel.textContent='Mode: circle hole (click center, then edge)';};
document.getElementById('btnClear').onclick=()=>{pts=[];circles=[];circCenter=null;redraw();};
redraw();`,
      outputHeight: 430,
    },

    {
      type: 'challenge',
      instruction: 'A running track consists of a rectangle 100 m long and two semicircles at each end with radius 36 m. Find: (a) Total area enclosed, (b) Total length of the track (the outer perimeter).',
      hint: 'The two semicircles together form one full circle. For perimeter: two straight sides plus the full circle circumference (2πr).',
      solution: `(a) Total area = rectangle + full circle
   = 100 × 72 + π(36)²
   = 7200 + 1296π
   ≈ 7200 + 4071.5
   ≈ 11,271.5 m²

(b) Perimeter = 2 straight sides + full circle circumference
   = 2(100) + 2π(36)
   = 200 + 72π
   ≈ 200 + 226.2
   ≈ 426.2 m`,
    },

    {
      type: 'challenge',
      instruction: 'A square with side 20 cm has 4 quarter-circles (radius 10 cm) cut from each corner. Find the area of the remaining shape (a plus/cross shape).',
      hint: 'Area of square minus 4 quarter-circles = square minus 1 full circle (since 4 × ¼ = 1).',
      solution: `Area of square = 20² = 400 cm²

4 quarter-circles together = 1 full circle of radius 10 cm
Area removed = π(10)² = 100π ≈ 314.16 cm²

Remaining area = 400 - 100π ≈ 400 - 314.16 ≈ 85.84 cm²`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'Composite figures unlock ANY shape: you never need a new formula if you can decompose a complex shape into rectangles, triangles, and circles. The only trap is forgetting to subtract holes or accidentally including interior partition lines in the perimeter.',
      },
      {
        type: 'image',
        src: geoCompUrl,
        alt: 'Composite figure examples showing addition and subtraction strategies',
        caption: 'Left: L-shape split into two rectangles (add). Center: rectangle with circular hole (subtract). Right: stadium = rectangle + full circle (add).',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Perimeter trap: trace only what a bug would walk along on the outside. Internal cuts that split the shape into parts are NOT part of the perimeter.',
      },
    ],
  },

  quiz: [
    {
      q: 'A T-shape is formed by a 180×50 top rectangle and a 40×110 stem. What is the total area?',
      img: quizCompUrl,
      choices: ['13,400', '9,000 + 4,400 = 13,400', '8,600', '15,800'],
      answer: 0,
      explanation: 'Area = 180×50 + 40×110 = 9,000 + 4,400 = 13,400 sq units.',
    },
    {
      q: '"House" shape: rectangle 100×80 plus triangle (base=100, h=62). Total area?',
      img: quizCompUrl,
      choices: ['11,100', '8,000', '14,200', '6,200'],
      answer: 0,
      explanation: 'Area = 100×80 + ½(100)(62) = 8,000 + 3,100 = 11,100.',
    },
    {
      q: 'A 180×120 rectangle has a circle (r=40) cut out. What is the remaining area?',
      img: quizCompUrl,
      choices: ['21,600 − 1600π ≈ 16,573', '21,600 + 1600π', '21,600 − 80π', '21,600'],
      answer: 0,
      explanation: 'Area = 180×120 − π(40)² = 21,600 − 1600π ≈ 21,600 − 5,027 ≈ 16,573.',
    },
    {
      q: 'Stadium: rectangle 120×48 plus semicircles of r=24 at each end. Total area?',
      img: quizCompUrl,
      choices: ['5,760 + 576π ≈ 7,569', '5,760 − 576π', '5,760 + 48π', '6,912'],
      answer: 0,
      explanation: 'Area = 120×48 + π(24)² (two semicircles = one circle) = 5,760 + 576π ≈ 7,569.',
    },
    {
      q: 'Perimeter of the stadium above (rectangle 120×48, r=24 semicircles)?',
      choices: ['2×120 + 2π(24) = 240 + 48π ≈ 390.8', '2(120+48) = 336', '120 + 48 + 2π(24)', '4×120'],
      answer: 0,
      explanation: 'Perimeter = 2 straight sides + full circle circumference = 2(120) + 2π(24) = 240 + 48π ≈ 390.9.',
    },
    {
      q: 'Which of these is NOT included in the perimeter of an L-shape split into two rectangles?',
      choices: ['The internal cut line', 'The two vertical outer sides', 'The two horizontal outer sides', 'The step edges'],
      answer: 0,
      explanation: 'The internal partition line you drew to split the L-shape into rectangles is interior — it is not part of the outer boundary.',
    },
    {
      q: 'A circle of radius 5 is added to the top of a rectangle 10×8. What is the combined area?',
      choices: ['80 + 25π ≈ 158.5', '80 + 5π', '80 + 10π ≈ 111.4', '80 × 25π'],
      answer: 0,
      explanation: 'Area = 10×8 + π(5)² = 80 + 25π ≈ 158.5.',
    },
    {
      q: 'A square with side 10 has a triangle (base 10, height 6) on top. Area?',
      choices: ['130', '100 + 30 = 130', '60', '160'],
      answer: 0,
      explanation: 'Area = 10² + ½(10)(6) = 100 + 30 = 130.',
    },
    {
      q: 'A semicircle is placed on top of a rectangle (rectangle 8×6, semicircle r=4). Total area?',
      choices: ['48 + 8π ≈ 73.1', '48 + 16π', '48 + 4π', '8×6 + π(4)²'],
      answer: 0,
      explanation: 'Semicircle area = ½π(4)² = 8π. Total = 48 + 8π ≈ 48 + 25.1 ≈ 73.1.',
    },
    {
      q: 'How many full circles do 4 quarter-circles of radius r together make?',
      choices: ['1', '4', '2', 'None — they make a half-circle'],
      answer: 0,
      explanation: '4 × ¼ = 1. Four quarter-circles of the same radius combine to exactly one full circle of area πr².',
    },
  ],
};

LESSON_GEO_6_5.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_6_5.cells, title: LESSON_GEO_6_5.title, subject: LESSON_GEO_6_5.subject, sequential: LESSON_GEO_6_5.sequential } } });

const GEO_6_5_DEFAULT = {
  cells: LESSON_GEO_6_5.cells,
  id: 'geo-6-5',
  title: 'Composite Figures: Area and Perimeter',
  slug: 'composite-figures',
  subject: 'Geometry',
  chapter: 6,
  order: 5,
  tags: ['composite figures', 'area', 'perimeter', 'decomposition', 'subtract regions'],
  intuition: LESSON_GEO_6_5.intuition,
  quiz: LESSON_GEO_6_5.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_6_5_DEFAULT;
export { LESSON_GEO_6_5 };
