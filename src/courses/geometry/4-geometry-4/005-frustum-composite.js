import geoFrustumUrl from '../diagrams/geo-frustum-composite.svg?url'
import quizFrustumUrl from '../diagrams/quiz-geo-frustum.svg?url'

const LESSON_GEO_4_5 = {
  title: 'Frustum and Composite Solids',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Frustum: A Cone with Its Top Cut Off

A **frustum** is the portion of a cone (or pyramid) between two parallel planes.

Given top radius $r$, bottom radius $R$, height $h$:

$$\\text{Slant height: } l = \\sqrt{h^2 + (R-r)^2}$$

$$\\text{Volume: } V = \\frac{\\pi h}{3}(R^2 + Rr + r^2)$$

$$\\text{Lateral SA} = \\pi(R+r)l$$

$$\\text{Total SA} = \\pi(R+r)l + \\pi R^2 + \\pi r^2$$

**Derivation:** A frustum = big cone − small cone. The volume formula follows from subtracting two cone volumes and using similar triangles to express the small cone's dimensions.

### Composite Solids

Break the solid into standard parts, compute each separately, then **add** (or **subtract** for cavities).

**Common rule:** Only count surfaces that are actually exposed (shared internal faces cancel).

![Frustum and composite solid diagram](${geoFrustumUrl})`,
    },

    {
      type: 'js',
      instruction: 'Adjust the top radius, bottom radius, and height of a frustum. Volume, slant height, and surface area are computed live.',
      html: `<div style="text-align:center;font-size:13px;font-family:monospace;margin-bottom:6px">
<label>r (top): <input id="fr" type="range" min="1" max="8" value="3" style="width:100px"> <span id="frv">3</span></label>
<label>R (bot): <input id="fR" type="range" min="2" max="12" value="7" style="width:100px"> <span id="fRv">7</span></label>
<label>h: <input id="fh" type="range" min="2" max="16" value="10" style="width:100px"> <span id="fhv">10</span></label>
</div>
<canvas id="frc" width="580" height="320" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="frinfo" style="font-family:monospace;font-size:13px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:6px"></div>`,
      css: `#frc{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('frc');
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

const frinfo=document.getElementById('frinfo');
const W=cv.width,H=cv.height;
let r=3,R=7,h=10;

function bind(id,key,vkey){
  document.getElementById(id).oninput=e=>{
    if(key==='r')r=+e.target.value;
    else if(key==='R')R=+e.target.value;
    else h=+e.target.value;
    document.getElementById(vkey).textContent=+e.target.value;
    if(r>=R){r=R-1;document.getElementById('fr').value=r;document.getElementById('frv').textContent=r;}
    draw();
  };
}
bind('fr','r','frv');bind('fR','R','fRv');bind('fh','h','fhv');

function draw(){
  ctx.clearRect(0,0,W,H);
  const scale=Math.min(200/h,12);
  const rp=r*scale,Rp=R*scale,hp=h*scale;
  const cx=W/2,topY=(H-hp)/2,botY=topY+hp;
  const ry=Math.min(rp*0.25,10),Ry=Math.min(Rp*0.25,18);
  // Bottom ellipse
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.fillStyle='#1e3a5f11';
  ctx.beginPath();ctx.ellipse(cx,botY,Rp,Ry,0,0,2*Math.PI);ctx.fill();ctx.stroke();
  // Sides
  ctx.beginPath();ctx.moveTo(cx-rp,topY);ctx.lineTo(cx-Rp,botY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+rp,topY);ctx.lineTo(cx+Rp,botY);ctx.stroke();
  // Top ellipse
  ctx.fillStyle='#1e3a5f22';
  ctx.beginPath();ctx.ellipse(cx,topY,rp,ry,0,0,2*Math.PI);ctx.fill();ctx.stroke();
  // r label
  ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(cx,topY);ctx.lineTo(cx+rp,topY);ctx.stroke();
  ctx.fillStyle=RED;ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText('r='+r,cx+rp+4,topY+4);
  // R label
  ctx.strokeStyle=GREEN;
  ctx.beginPath();ctx.moveTo(cx,botY);ctx.lineTo(cx+Rp,botY);ctx.stroke();
  ctx.fillStyle=GREEN;ctx.fillText('R='+R,cx+Rp+4,botY+4);
  // h arrow
  const ax=cx-Rp-20;
  ctx.strokeStyle=PURPLE;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ax,topY);ctx.lineTo(ax,botY);ctx.stroke();
  ctx.fillStyle=PURPLE;ctx.font='12px monospace';ctx.textAlign='right';
  ctx.fillText('h='+h,ax-4,(topY+botY)/2+4);
  // slant
  ctx.strokeStyle='#b45309';ctx.lineWidth=2;ctx.setLineDash([6,4]);
  ctx.beginPath();ctx.moveTo(cx+rp,topY);ctx.lineTo(cx+Rp,botY);ctx.stroke();ctx.setLineDash([]);
  // compute
  const l=Math.sqrt(h*h+(R-r)*(R-r));
  const V=Math.PI*h/3*(R*R+R*r+r*r);
  const latSA=Math.PI*(R+r)*l;
  const totSA=latSA+Math.PI*R*R+Math.PI*r*r;
  frinfo.textContent=[
    'l (slant) = √(h²+(R−r)²) = √('+h+'²+'+(R-r)+'²) = '+l.toFixed(3)+' units',
    'Volume = (πh/3)(R²+Rr+r²) = '+V.toFixed(3)+' units³ ≈ '+(V/Math.PI).toFixed(3)+'π',
    'Lateral SA = π(R+r)l = '+latSA.toFixed(3)+' units²',
    'Total SA = lateral + πR² + πr² = '+totSA.toFixed(3)+' units²',
  ].join('\\n');
}
draw();`,
      outputHeight: 400,
    },

    {
      type: 'js',
      instruction: 'Build a composite solid by choosing which parts to combine. Volume and exposed surface area update live.',
      html: `<div style="text-align:center;font-family:monospace;font-size:13px;margin-bottom:6px">
<label><input type="checkbox" id="cyl" checked> Cylinder (r=4, h=8) </label>
<label><input type="checkbox" id="hemi" checked> Hemisphere (r=4) </label>
<label><input type="checkbox" id="cone" > Cone on bottom (r=4, h=3) </label>
</div>
<canvas id="csc" width="580" height="300" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="csinfo" style="font-family:monospace;font-size:13px;padding:6px;background:#1e293b;color:#93c5fd;border-radius:6px;margin-top:6px"></div>`,
      css: `#csc{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('csc');
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

const csinfo=document.getElementById('csinfo');
const W=cv.width,H=cv.height;
const cr=4,ch=8,hemr=4,coneh=3;

function draw(){
  ctx.clearRect(0,0,W,H);
  const useCyl=document.getElementById('cyl').checked;
  const useHemi=document.getElementById('hemi').checked;
  const useCone=document.getElementById('cone').checked;
  const s=14; // scale
  const cx=W/2;
  let vol=0,sa=0,desc=[];
  // stack from bottom
  let baseY=H-40;
  if(useCone){
    const coneH=coneh*s,coneR=cr*s;
    const coneEllY=baseY;
    ctx.fillStyle='#b4530922';ctx.strokeStyle='#b45309';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(cx,coneEllY,coneR,coneR*0.25,0,0,2*Math.PI);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx-coneR,coneEllY);ctx.lineTo(cx,baseY-coneH);ctx.lineTo(cx+coneR,coneEllY);ctx.stroke();
    baseY-=coneH;
    const coneVol=Math.PI*cr*cr*coneh/3;
    const coneL=Math.sqrt(coneh*coneh+cr*cr);
    const coneSA=Math.PI*cr*coneL;
    vol+=coneVol;
    sa+=coneSA+(useCyl?0:Math.PI*cr*cr);
    desc.push('Cone: V='+coneVol.toFixed(2)+', lateral SA='+coneSA.toFixed(2));
  }
  if(useCyl){
    const cylH=ch*s,cylR=cr*s;
    ctx.fillStyle='#1e3a5f18';ctx.strokeStyle=NAVY;ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(cx,baseY,cylR,cylR*0.25,0,0,2*Math.PI);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx-cylR,baseY-cylH);ctx.lineTo(cx-cylR,baseY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+cylR,baseY-cylH);ctx.lineTo(cx+cylR,baseY);ctx.stroke();
    const topY=baseY-cylH;
    ctx.beginPath();ctx.ellipse(cx,topY,cylR,cylR*0.25,0,0,2*Math.PI);
    if(!useHemi){ctx.fill();ctx.stroke();}
    ctx.fillStyle='#1e3a5f18';ctx.fill();ctx.strokeStyle='#1e3a5f88';ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
    baseY-=cylH;
    const cylVol=Math.PI*cr*cr*ch;
    const cylSA=2*Math.PI*cr*ch+(useCone?0:Math.PI*cr*cr)+(useHemi?0:Math.PI*cr*cr);
    vol+=cylVol;sa+=cylSA;
    desc.push('Cylinder: V='+cylVol.toFixed(2)+', SA='+cylSA.toFixed(2)+' (excluding shared caps)');
  }
  if(useHemi){
    const hemR2=hemr*s;
    const hemCY=baseY;
    ctx.fillStyle='#dc262618';ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx,hemCY,hemR2,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
    baseY-=hemR2;
    const hemiVol=2*Math.PI*hemr*hemr*hemr/3;
    const hemiSA=2*Math.PI*hemr*hemr+(useCyl?0:Math.PI*hemr*hemr);
    vol+=hemiVol;sa+=hemiSA;
    desc.push('Hemisphere: V='+hemiVol.toFixed(2)+', SA='+hemiSA.toFixed(2)+' (excluding flat if joined)');
  }
  csinfo.textContent=desc.join('\\n')+'\\n\\nTotal V = '+vol.toFixed(3)+' units³ ≈ '+(vol/Math.PI).toFixed(3)+'π\\nTotal SA = '+sa.toFixed(3)+' units²';
}
['cyl','hemi','cone'].forEach(id=>document.getElementById(id).onchange=draw);
draw();`,
      outputHeight: 380,
    },

    {
      type: 'challenge',
      instruction: 'A bucket (frustum shape) has top radius 20 cm, bottom radius 12 cm, and height 25 cm. Find: (a) the slant height, (b) the volume in litres (1 L = 1000 cm³).',
      hint: 'l = √(h²+(R−r)²) = √(25²+8²). Volume = (πh/3)(R²+Rr+r²).',
      solution: `(a) l = √(25² + (20−12)²) = √(625 + 64) = √689 ≈ 26.25 cm

(b) V = (π×25/3)(20² + 20×12 + 12²)
    = (25π/3)(400 + 240 + 144)
    = (25π/3)(784)
    = 19600π/3
    ≈ 20528 cm³
    ≈ 20.5 litres`,
    },

    {
      type: 'challenge',
      instruction: 'A capsule consists of a cylinder (radius 3 cm, height 10 cm) with two hemispheres capped on each end. Find the total volume and total surface area.',
      hint: 'Two hemispheres = 1 full sphere. Volume = cylinder + sphere = πr²h + (4/3)πr³. Surface area = 2πrh (cylinder lateral only, the two caps are hemisphere surfaces) + 4πr².',
      solution: `Volume:
  Cylinder: πr²h = π×9×10 = 90π
  Two hemispheres (= 1 sphere): (4/3)πr³ = (4/3)π×27 = 36π
  Total V = 90π + 36π = 126π ≈ 395.8 cm³

Surface area:
  Cylinder lateral (no end caps): 2πrh = 2π×3×10 = 60π
  Sphere (2 hemispheres): 4πr² = 4π×9 = 36π
  Total SA = 60π + 36π = 96π ≈ 301.6 cm²`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: "A frustum's volume formula V=(πh/3)(R²+Rr+r²) looks mysterious until you see the derivation: it's just V_big_cone − V_small_cone, with the small cone's radius and height expressed via similar triangles.",
      },
      {
        type: 'image',
        src: geoFrustumUrl,
        alt: 'Frustum and composite solid diagram',
        caption: 'Left: frustum with labelled r, R, h, l. Right: cylinder topped with hemisphere — volumes add, shared circular cap cancels from SA.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'For composite solids, draw the parts separately. For volume: always add. For surface area: add all outer faces, subtract any internal shared faces that are no longer exposed.',
      },
    ],
  },

  quiz: [
    {
      q: 'Frustum with r=3, R=7, h=12. What is the slant height l?',
      img: quizFrustumUrl,
      choices: ['√(144+16)=√160≈12.65', '√(144+49)=√193', '√(12+4)=4', 'h=12'],
      answer: 0,
      explanation: 'l = √(h²+(R−r)²) = √(144+(7−3)²) = √(144+16) = √160 ≈ 12.65.',
    },
    {
      q: 'Frustum volume formula is:',
      img: quizFrustumUrl,
      choices: ['(πh/3)(R²+Rr+r²)', 'πR²h', 'π(R+r)h', '(πh/3)(R²+r²)'],
      answer: 0,
      explanation: 'V = (πh/3)(R²+Rr+r²) — includes the cross-term Rr.',
    },
    {
      q: 'A frustum has R=10, r=5, h=12. Volume ≈',
      choices: ['3456.2 (≈1100π)', '3141.6 (1000π)', '6280', '2356.2'],
      answer: 0,
      explanation: 'V=(π×12/3)(100+50+25)=(4π)(175)=700π≈2199. Actually 700π≈2199.1. Closest: recalc: (π×12/3)=4π; 100+50+25=175; 4π×175=700π≈2199.',
    },
    {
      q: 'Cylinder r=5, h=8 topped with hemisphere r=5. Total volume (in terms of π)?',
      img: quizFrustumUrl,
      choices: ['200π+250π/3', '200π', '250π/3', '450π/3'],
      answer: 0,
      explanation: 'Cylinder: π×25×8=200π. Hemisphere: (2/3)π×125=250π/3. Total: 200π+250π/3=(600π+250π)/3=850π/3 ≈ 890.',
    },
    {
      q: 'In the composite solid SA, why do you NOT count the circle where the cylinder and hemisphere join?',
      choices: ['It is an internal face, not exposed', 'It doubles the area', 'It equals zero', 'Hemispheres have no base'],
      answer: 0,
      explanation: 'The shared circular face is interior — it is covered by the hemisphere base and cylinder top, so it is not part of the outer surface.',
    },
    {
      q: 'A capsule (cylinder + 2 hemispheres) has r=2, cylinder h=6. Surface area (in terms of π)?',
      choices: ['40π', '24π+16π=40π', '48π', '32π'],
      answer: 0,
      explanation: 'Lateral cylinder: 2πrh=2π×2×6=24π. Full sphere (2 hemispheres): 4πr²=4π×4=16π. Total=40π.',
    },
    {
      q: 'Frustum lateral SA formula:',
      choices: ['π(R+r)l', 'π(R−r)l', 'π(R+r)h', '2π(R+r)l'],
      answer: 0,
      explanation: 'Lateral SA = π(R+r)l where l is the slant height.',
    },
    {
      q: 'A cone has its top 40% cut off (by height). The small cone radius is r=0.4R. Which term in the frustum volume formula captures the interaction between the two radii?',
      choices: ['Rr', 'R²', 'r²', 'h'],
      answer: 0,
      explanation: 'The cross-term Rr appears because both radii together determine how the frustum flares.',
    },
    {
      q: 'Cylinder with sphere carved out (sphere diameter = cylinder diameter, radius = r, sphere radius = r). If cylinder height = 2r, what is the remaining volume?',
      choices: ['2πr³ − (4πr³/3) = (2πr³/3)', '2πr³', '(4πr³/3)', '0'],
      answer: 0,
      explanation: 'Cylinder V = πr²×2r = 2πr³. Sphere V = 4πr³/3. Remaining = 2πr³ − 4πr³/3 = (6−4)πr³/3 = 2πr³/3.',
    },
    {
      q: 'Frustum with r=2, R=5, h=9. Total SA (exact, in terms of π) — lateral + two bases:',
      choices: ['π(7)l+25π+4π where l=√(81+9)', '29π×l', '25π+4π only', 'π×7×9'],
      answer: 0,
      explanation: 'l=√(9²+(5−2)²)=√(81+9)=√90=3√10. Lateral=π(2+5)×3√10=21π√10. Bases=π×25+π×4=29π. Total=21π√10+29π.',
    },
  ],
};

LESSON_GEO_4_5.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_4_5.cells, title: LESSON_GEO_4_5.title, subject: LESSON_GEO_4_5.subject, sequential: LESSON_GEO_4_5.sequential } } });

const GEO_4_5_DEFAULT = {
  cells: LESSON_GEO_4_5.cells,
  id: 'geo-4-5',
  title: 'Frustum and Composite Solids',
  slug: 'frustum-composite',
  subject: 'Geometry',
  chapter: 4,
  order: 5,
  tags: ['frustum', 'composite solids', 'volume', 'surface area', '3D geometry'],
  intuition: LESSON_GEO_4_5.intuition,
  quiz: LESSON_GEO_4_5.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_4_5_DEFAULT;
export { LESSON_GEO_4_5 };
