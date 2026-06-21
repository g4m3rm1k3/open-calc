import geoProbUrl from '../diagrams/geo-geometric-probability.svg?url'
import quizProbUrl from '../diagrams/quiz-geo-geometric-prob.svg?url'

const LESSON_GEO_6_6 = {
  title: 'Geometric Probability',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Geometric Probability

When outcomes are distributed **continuously** over a geometric region, probability is computed as a ratio of measures:

$$P(\\text{event}) = \\frac{\\text{favorable measure}}{\\text{total measure}}$$

**Three measure types:**

| Model | Measure | Formula |
|---|---|---|
| Area model | Point lands in subregion | favorable area / total area |
| Length model | Point on a segment | favorable length / total length |
| Angle model | Spinner lands in sector | sector angle / 360° |

**Key assumption:** every point (position, time, angle) is **equally likely** (uniform distribution).

**Classic results:**
- Point in unit square → P(inside inscribed circle) = π/4 ≈ 0.785
- Point in circle of radius R → P(inside inner circle r) = (r/R)²
- Buffon's Needle, Monte Carlo π — all geometric probability!

**Monte Carlo estimation:** throw N random darts at a unit square; count H hits inside the inscribed circle. Then π ≈ 4H/N.

![Geometric probability: area, length, and Monte Carlo models](${geoProbUrl})`,
    },

    {
      type: 'js',
      instruction: 'Simulate geometric probability with a Monte Carlo dart throw. Adjust the target shape and watch the probability estimate converge.',
      html: `<div style="font-family:monospace;font-size:12px;padding:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
<label>Target: <select id="targetSel" style="font-size:12px">
  <option value="circle">Circle in square</option>
  <option value="triangle">Triangle in square</option>
  <option value="ring">Ring (outer-inner circles)</option>
</select></label>
<label>Darts: <input id="nDarts" type="range" min="100" max="10000" step="100" value="1000" style="width:80px"><span id="nVal">1000</span></label>
<button id="throwBtn" style="padding:4px 10px;cursor:pointer">Throw darts!</button>
<button id="resetBtn" style="padding:4px 10px;cursor:pointer">Reset</button>
</div>
<canvas id="monteCV" width="580" height="260" style="border-radius:8px;display:block;margin:4px auto"></canvas>
<div id="monteInfo" style="font-family:monospace;font-size:12px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:4px"></div>`,
      css: `#monteCV{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('monteCV');
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

const info=document.getElementById('monteInfo');
const nSlider=document.getElementById('nDarts');
document.getElementById('nVal').textContent=nSlider.value;
nSlider.oninput=e=>document.getElementById('nVal').textContent=e.target.value;

const SZ=240, OX=20, OY=10;
let hits=0,total=0;

function inTarget(x,y,shape){
  const cx=0.5,cy=0.5;
  if(shape==='circle') return (x-cx)**2+(y-cy)**2<=0.25;
  if(shape==='triangle') return y>=0 && x>=0 && x+y<=1;
  if(shape==='ring'){
    const d2=(x-cx)**2+(y-cy)**2;
    return d2<=0.25 && d2>=(0.1)**2;
  }
  return false;
}

function trueP(shape){
  if(shape==='circle') return Math.PI/4;
  if(shape==='triangle') return 0.5;
  if(shape==='ring') return Math.PI*(0.25-0.01);
  return 0;
}

function drawShape(shape){
  ctx.strokeStyle=GREEN;ctx.lineWidth=2;
  if(shape==='circle'){
    ctx.beginPath();ctx.arc(OX+SZ/2,OY+SZ/2,SZ/2,0,2*Math.PI);
    ctx.fillStyle='#bbf7d044';ctx.fill();ctx.stroke();
  } else if(shape==='triangle'){
    ctx.beginPath();ctx.moveTo(OX,OY+SZ);ctx.lineTo(OX+SZ,OY+SZ);ctx.lineTo(OX,OY);ctx.closePath();
    ctx.fillStyle='#bbf7d044';ctx.fill();ctx.stroke();
  } else if(shape==='ring'){
    ctx.beginPath();ctx.arc(OX+SZ/2,OY+SZ/2,SZ/2,0,2*Math.PI);
    ctx.fillStyle='#bbf7d044';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(OX+SZ/2,OY+SZ/2,SZ*0.1,0,2*Math.PI);
    ctx.fillStyle='#f8fafc';ctx.fill();ctx.strokeStyle='#dc2626';ctx.stroke();
  }
}

function reset(){
  hits=0;total=0;
  ctx.clearRect(0,0,W,H);
  // Draw square
  ctx.fillStyle='#eff6ff88';ctx.fillRect(OX,OY,SZ,SZ);
  ctx.strokeStyle=NAVY;ctx.lineWidth=1.5;ctx.strokeRect(OX,OY,SZ,SZ);
  drawShape(document.getElementById('targetSel').value);
  info.textContent='Click "Throw darts!" to start';
}

function throwDarts(){
  const N=+nSlider.value;
  const shape=document.getElementById('targetSel').value;
  for(let i=0;i<N;i++){
    const x=Math.random(),y=Math.random();
    total++;
    const h=inTarget(x,y,shape);
    if(h)hits++;
    if(i<2000){
      const sx=OX+x*SZ,sy=OY+y*SZ;
      ctx.beginPath();ctx.arc(sx,sy,1.5,0,2*Math.PI);
      ctx.fillStyle=h?'#166534':'#dc2626';ctx.fill();
    }
  }
  const est=hits/total;
  const tp=trueP(shape);
  info.textContent=[
    'Darts thrown: '+total+'  Hits: '+hits,
    'Estimated P = '+hits+'/'+total+' = '+est.toFixed(6),
    'True P = '+tp.toFixed(6),
    'Error = '+(Math.abs(est-tp)/tp*100).toFixed(3)+'%',
    '',
    shape==='circle'?'(π ≈ 4P = '+  (4*est).toFixed(6)+')':'',
  ].join('\\n');
}

document.getElementById('throwBtn').onclick=throwDarts;
document.getElementById('resetBtn').onclick=reset;
document.getElementById('targetSel').onchange=reset;
reset();`,
      outputHeight: 430,
    },

    {
      type: 'js',
      instruction: 'Set a spinner with sectors of given angles. Click "Spin" to see where it lands and accumulate statistics.',
      html: `<div style="font-family:monospace;font-size:12px;padding:6px">
<b>Sectors (angles must total ≤ 360°):</b><br>
<div id="sectorInputs" style="display:flex;gap:8px;flex-wrap:wrap;margin:4px 0"></div>
<button id="addSector" style="padding:3px 8px;cursor:pointer">+ Add sector</button>
<button id="spinBtn" style="padding:3px 8px;margin-left:8px;cursor:pointer">Spin ×1000</button>
<button id="clearSpin" style="padding:3px 8px;cursor:pointer">Reset</button>
</div>
<canvas id="spinCV" width="580" height="240" style="border-radius:8px;display:block;margin:4px auto"></canvas>
<div id="spinInfo" style="font-family:monospace;font-size:12px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:4px"></div>`,
      css: `#spinCV{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('spinCV');
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

const info=document.getElementById('spinInfo');
const COLORS=['#166534','#1e3a5f','#dc2626','#b45309','#7c3aed','#0891b2'];
let sectors=[{angle:120,label:'A'},{angle:90,label:'B'},{angle:60,label:'C'},{angle:90,label:'D'}];
let counts={};

function buildInputs(){
  const div=document.getElementById('sectorInputs');
  div.innerHTML='';
  sectors.forEach((s,i)=>{
    const wrap=document.createElement('div');
    wrap.style.cssText='display:inline-flex;align-items:center;gap:4px;border:1px solid '+COLORS[i%6]+';border-radius:4px;padding:2px 4px';
    wrap.innerHTML='<span style="color:'+COLORS[i%6]+'">'+(s.label||('S'+(i+1)))+'</span>'+
      ' ang:<input type="number" value="'+s.angle+'" style="width:44px;font-family:monospace" data-idx="'+i+'" class="angInp">'+
      ' <input type="text" value="'+(s.label||('S'+(i+1)))+'" style="width:28px;font-family:monospace" data-idx="'+i+'" class="lblInp">'+
      ' <button data-idx="'+i+'" class="delSec" style="cursor:pointer;color:#dc2626;font-size:11px">×</button>';
    div.appendChild(wrap);
  });
  div.querySelectorAll('.angInp').forEach(el=>el.oninput=e=>{sectors[+e.target.dataset.idx].angle=+e.target.value||0;drawSpinner();});
  div.querySelectorAll('.lblInp').forEach(el=>el.oninput=e=>{sectors[+e.target.dataset.idx].label=e.target.value;drawSpinner();});
  div.querySelectorAll('.delSec').forEach(el=>el.onclick=e=>{sectors.splice(+e.target.dataset.idx,1);buildInputs();drawSpinner();});
}

function drawSpinner(pointer){
  ctx.clearRect(0,0,W,H);
  const cx=200,cy=120,r=100;
  let start=-Math.PI/2;
  const total=sectors.reduce((s,sec)=>s+sec.angle,0);
  sectors.forEach((sec,i)=>{
    const sweep=sec.angle/360*2*Math.PI;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,start,start+sweep);ctx.closePath();
    ctx.fillStyle=COLORS[i%6]+'99';ctx.fill();
    ctx.strokeStyle=COLORS[i%6];ctx.lineWidth=2;ctx.stroke();
    // Label
    const mid=start+sweep/2;
    ctx.fillStyle='#fff';ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(sec.label||('S'+(i+1)),cx+Math.cos(mid)*r*0.65,cy+Math.sin(mid)*r*0.65);
    ctx.fillStyle=TEXT;ctx.font='11px monospace';
    ctx.fillText(sec.angle+'° ('+((sec.angle/total)*100).toFixed(1)+'%)',cx+Math.cos(mid)*r*1.22,cy+Math.sin(mid)*r*1.22);
    start+=sweep;
  });
  if(pointer!==undefined){
    const a=-Math.PI/2+pointer/360*2*Math.PI;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*r*1.05,cy+Math.sin(a)*r*1.05);
    ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.stroke();
  }
  // Stats panel
  if(Object.keys(counts).length){
    const tot2=Object.values(counts).reduce((s,v)=>s+v,0);
    let y=30;
    ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='11px monospace';
    ctx.fillStyle='#1e293b';ctx.fillRect(330,15,240,20+sectors.length*16+6);
    ctx.fillStyle='#93c5fd';ctx.fillText('Spins: '+tot2,340,30);
    sectors.forEach((sec,i)=>{
      const c=counts[sec.label]||0;
      ctx.fillStyle=COLORS[i%6];
      ctx.fillText(sec.label+': '+c+' / '+tot2+' = '+(c/tot2*100).toFixed(1)+'%  (true: '+(sec.angle/total*100).toFixed(1)+'%)',340,46+i*16);
    });
  }
}

function spin(){
  const total=sectors.reduce((s,sec)=>s+sec.angle,0);
  for(let t=0;t<1000;t++){
    const r=Math.random()*total;
    let acc=0;
    for(const sec of sectors){
      acc+=sec.angle;
      if(r<acc){
        counts[sec.label]=(counts[sec.label]||0)+1;
        break;
      }
    }
  }
  drawSpinner();
}

document.getElementById('addSector').onclick=()=>{
  const labels='ABCDEFGHIJ';
  sectors.push({angle:60,label:labels[sectors.length%10]});
  buildInputs();drawSpinner();
};
document.getElementById('spinBtn').onclick=spin;
document.getElementById('clearSpin').onclick=()=>{counts={};drawSpinner();};

buildInputs();drawSpinner();`,
      outputHeight: 430,
    },

    {
      type: 'challenge',
      instruction: 'A dart is thrown randomly at a circular dartboard of radius 30 cm. The bullseye has radius 5 cm. (a) What is the probability of hitting the bullseye? (b) If you throw 200 darts, how many bullseyes do you expect?',
      hint: 'P(bullseye) = area of bullseye / area of board = π(5)² / π(30)². Expected hits = N × P.',
      solution: `(a) P(bullseye) = π(5)² / π(30)²
               = 25 / 900
               = 1/36 ≈ 0.0278 (2.78%)

(b) Expected bullseyes = 200 × (1/36) = 200/36 ≈ 5.56 bullseyes`,
    },

    {
      type: 'challenge',
      instruction: 'A spinner is divided into 3 sectors: Red = 150°, Blue = 120°, Green = 90°. (a) What is P(Blue)? (b) If the spinner is spun 360 times, how many times is Green expected?',
      hint: 'P(sector) = angle/360°. Expected count = N × P.',
      solution: `(a) P(Blue) = 120°/360° = 1/3 ≈ 33.3%

(b) P(Green) = 90°/360° = 1/4
    Expected Green = 360 × 1/4 = 90 times`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'Geometric probability connects spatial reasoning to statistics: the probability of a random event equals the fraction of the total "space" that the favorable outcome occupies. This is also the foundation of Monte Carlo simulation — use randomness to estimate areas and constants like π.',
      },
      {
        type: 'image',
        src: geoProbUrl,
        alt: 'Geometric probability: area model, length model, and Monte Carlo π estimation',
        caption: 'Left: area model — P(in circle) = πr²/side². Center: length model — P(in interval) = favorable length / total. Right: Monte Carlo π ≈ 4 × hits/total.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Classic result: if you drop a point randomly in a unit square, the probability it falls inside the inscribed circle is π/4. Multiply your hit fraction by 4 and you have an estimate of π!',
      },
    ],
  },

  quiz: [
    {
      q: 'A point is chosen at random inside a square of side 140. What is P(the point is also inside the inscribed circle of radius 70)?',
      img: quizProbUrl,
      choices: ['π/4 ≈ 0.785', '1/2', '1/4', 'π/2'],
      answer: 0,
      explanation: 'P = π(70)²/140² = 4900π/19600 = π/4 ≈ 0.785.',
    },
    {
      q: 'A number is chosen uniformly at random from [0,10]. P(it falls in [3,7])?',
      img: quizProbUrl,
      choices: ['0.4', '0.3', '0.7', '0.6'],
      answer: 0,
      explanation: 'P = (7-3)/10 = 4/10 = 0.4.',
    },
    {
      q: 'A dartboard has outer radius 90 and bullseye radius 30. P(bullseye | hits board)?',
      img: quizProbUrl,
      choices: ['1/9', '1/3', '1/6', '1/4'],
      answer: 0,
      explanation: 'P = π(30)²/π(90)² = 900/8100 = 1/9.',
    },
    {
      q: 'A spinner has sectors: Red 90°, Blue 150°, Green 120°. P(Green)?',
      choices: ['1/3', '5/12', '1/4', '1/2'],
      answer: 0,
      explanation: 'P(Green) = 120°/360° = 1/3.',
    },
    {
      q: 'In a Monte Carlo simulation with 10,000 darts, 7,854 land inside the unit circle inscribed in the unit square. Estimate for π?',
      choices: ['4 × 7854/10000 = 3.1416', '7854/10000 = 0.7854', '2 × 7854/10000', '7854/2500'],
      answer: 0,
      explanation: 'π ≈ 4 × (hits/total) = 4 × 0.7854 = 3.1416.',
    },
    {
      q: 'A point is chosen at random in a circle of radius 10. What is P(it is within 5 of the center)?',
      choices: ['1/4', '1/2', '1/3', '√2/2'],
      answer: 0,
      explanation: 'P = π(5)²/π(10)² = 25/100 = 1/4.',
    },
    {
      q: 'A bus arrives uniformly between 2:00 and 3:00. P(you arrive at 2:20 and wait at most 10 min)?',
      choices: ['1/6', '1/3', '1/2', '1/4'],
      answer: 0,
      explanation: 'Bus must arrive in [2:20, 2:30] — a 10-min window out of 60 min: P = 10/60 = 1/6.',
    },
    {
      q: 'A chord is drawn randomly across a circle. Which measure is used to define geometric probability here?',
      choices: ['Length (of the segment on a diameter)', 'Area', 'Angle (sector)', 'Volume'],
      answer: 0,
      explanation: "Bertrand's paradox involves chords: different random models use length, angle, or area — showing that the method of choosing 'at random' matters.",
    },
    {
      q: 'Rectangle 18×12 has a circular hole of radius 4 cut out. P(random point in rectangle is in the shaded region)?',
      choices: ['(216 - 16π)/216', '16π/216', '1 - 4/216', '(16π - 216)/216'],
      answer: 0,
      explanation: 'Shaded = rectangle minus circle. P = (18×12 - π(4)²)/(18×12) = (216 - 16π)/216.',
    },
    {
      q: 'A spinner with four equal 90° sectors is spun 400 times. Expected number of times landing on one specific sector?',
      choices: ['100', '90', '400', '200'],
      answer: 0,
      explanation: 'P(one sector) = 90°/360° = 1/4. Expected = 400 × 1/4 = 100.',
    },
  ],
};

LESSON_GEO_6_6.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_6_6.cells, title: LESSON_GEO_6_6.title, subject: LESSON_GEO_6_6.subject, sequential: LESSON_GEO_6_6.sequential } } });

const GEO_6_6_DEFAULT = {
  cells: LESSON_GEO_6_6.cells,
  id: 'geo-6-6',
  title: 'Geometric Probability',
  slug: 'geometric-probability',
  subject: 'Geometry',
  chapter: 6,
  order: 6,
  tags: ['geometric probability', 'area model', 'length model', 'Monte Carlo', 'spinner', 'uniform distribution'],
  intuition: LESSON_GEO_6_6.intuition,
  quiz: LESSON_GEO_6_6.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_6_6_DEFAULT;
export { LESSON_GEO_6_6 };
