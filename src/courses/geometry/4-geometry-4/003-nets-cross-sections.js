import geoNetsUrl from '../diagrams/geo-nets-cross-sections.svg?url'
import quizNetsUrl from '../diagrams/quiz-geo-nets.svg?url'

const LESSON_GEO_4_3 = {
  title: 'Nets and Cross-Sections',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Unfolding 3D Shapes: Nets

A **net** is a 2D pattern that folds into a 3D solid. Unfolding lets you compute **surface area** by adding the areas of all faces.

| Solid | Net contains | SA formula |
|---|---|---|
| Cube (edge $a$) | 6 congruent squares | $6a^2$ |
| Rectangular prism $l\\times w\\times h$ | 3 pairs of rectangles | $2(lw+lh+wh)$ |
| Cylinder (r, h) | 2 circles + rectangle | $2\\pi r^2+2\\pi rh$ |
| Cone (r, l) | circle + sector | $\\pi r^2+\\pi rl$ |
| Square pyramid (base $b$, slant $l$) | square + 4 triangles | $b^2+2bl$ |

### Cross-Sections of a Cone

A plane slicing through a double cone produces a **conic section**:

| Cut angle | Shape |
|---|---|
| Horizontal (⊥ axis) | Circle |
| Tilted (not through base) | Ellipse |
| Parallel to one slant edge | Parabola |
| Steeper (cuts both nappes) | Hyperbola |

![Nets and cross-sections diagram](${geoNetsUrl})`,
    },

    {
      type: 'js',
      instruction: 'Pick a solid type and adjust its dimensions. The net unfolds live and the surface area is computed from the faces you see.',
      html: `<div style="text-align:center;font-size:13px;font-family:monospace;margin-bottom:6px">
<select id="solid" style="padding:4px 8px;font-size:13px">
  <option value="cube">Cube</option>
  <option value="prism">Rectangular Prism</option>
  <option value="cylinder">Cylinder</option>
  <option value="cone">Cone</option>
</select>
&nbsp;
<span id="sliders"></span>
</div>
<canvas id="nc" width="580" height="340" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="ninfo" style="text-align:center;font-family:monospace;font-size:13px;margin-top:6px"></div>`,
      css: `#nc{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('nc');
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

const info=document.getElementById('ninfo');
const W=cv.width,H=cv.height;
const solidSel=document.getElementById('solid');
const slidersDiv=document.getElementById('sliders');
const dims={a:4,l:5,w:3,h:6,r:3,ht:5,sl:5};

function makeSlider(id,label,min,max,val){
  return '<label>'+label+': <input type="range" id="'+id+'" min="'+min+'" max="'+max+'" value="'+val+'" style="width:70px"> <span id="'+id+'v">'+val+'</span></label> ';
}
function buildSliders(){
  const s=solidSel.value;
  let html='';
  if(s==='cube') html=makeSlider('a','a',1,8,dims.a);
  if(s==='prism') html=makeSlider('l','l',1,8,dims.l)+makeSlider('w','w',1,6,dims.w)+makeSlider('h','h',1,8,dims.h);
  if(s==='cylinder') html=makeSlider('r','r',1,6,dims.r)+makeSlider('ht','h',1,8,dims.ht);
  if(s==='cone') html=makeSlider('r','r',1,6,dims.r)+makeSlider('sl','slant',2,10,dims.sl);
  slidersDiv.innerHTML=html;
  ['a','l','w','h','r','ht','sl'].forEach(k=>{
    const el=document.getElementById(k);
    if(el) el.oninput=e=>{dims[k]=+e.target.value;document.getElementById(k+'v').textContent=dims[k];draw();};
  });
}

function drawNet(){
  ctx.clearRect(0,0,W,H);
  const s=solidSel.value;
  const U=40;
  if(s==='cube'){
    const a=dims.a*U/4;
    const ox=W/2-a*2, oy=H/2-a*2;
    const faces=[
      [ox+a,oy,a,a,'#1e3a5f22','#1e3a5f','top'],
      [ox,oy+a,a,a,'#dc262622','#dc2626','left'],
      [ox+a,oy+a,a,a,'#1e3a5f22','#1e3a5f','front'],
      [ox+2*a,oy+a,a,a,'#16653422','#166534','right'],
      [ox+3*a,oy+a,a,a,'#b4530922','#b45309','back'],
      [ox+a,oy+2*a,a,a,'#7c3aed22','#7c3aed','bottom'],
    ];
    faces.forEach(([x,y,w,h,f,s,t])=>{
      ctx.fillStyle=f;ctx.fillRect(x,y,w,h);
      ctx.strokeStyle=s;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
      ctx.fillStyle=s;ctx.font='11px monospace';ctx.textAlign='center';
      ctx.fillText(t,x+w/2,y+h/2+4);
    });
    const sa=6*dims.a*dims.a;
    info.textContent='SA = 6a² = 6×'+dims.a+'² = '+sa+' units²';
  } else if(s==='prism'){
    const l=dims.l*U/4,w=dims.w*U/4,h=dims.h*U/4;
    const ox=W/2-l-w/2,oy=20;
    ctx.fillStyle='#1e3a5f22';ctx.strokeStyle=NAVY;ctx.lineWidth=2;
    // top
    ctx.fillRect(ox+w,oy,l,w);ctx.strokeRect(ox+w,oy,l,w);
    // front, back
    ctx.fillRect(ox+w,oy+w,l,h);ctx.strokeRect(ox+w,oy+w,l,h);
    ctx.fillRect(ox+w,oy+w+h,l,w);ctx.strokeRect(ox+w,oy+w+h,l,w);
    ctx.fillRect(ox+w,oy+w+h+w,l,h);ctx.strokeRect(ox+w,oy+w+h+w,l,h);
    // sides
    ctx.fillRect(ox,oy+w,w,h);ctx.strokeRect(ox,oy+w,w,h);
    ctx.fillRect(ox+w+l,oy+w,w,h);ctx.strokeRect(ox+w+l,oy+w,w,h);
    const sa=2*(dims.l*dims.w+dims.l*dims.h+dims.w*dims.h);
    info.textContent='SA = 2(lw+lh+wh) = 2('+dims.l+'×'+dims.w+'+'+dims.l+'×'+dims.h+'+'+dims.w+'×'+dims.h+') = '+sa.toFixed(1)+' units²';
  } else if(s==='cylinder'){
    const r=dims.r*U/4,h=dims.ht*U/4;
    const cx=W/2,cy=H/2-20;
    // rectangle (lateral surface)
    const rw=2*Math.PI*r;
    ctx.fillStyle='#1e3a5f22';ctx.strokeStyle=NAVY;ctx.lineWidth=2;
    ctx.fillRect(cx-rw/2,cy-h/2,rw,h);ctx.strokeRect(cx-rw/2,cy-h/2,rw,h);
    ctx.fillStyle='#dc262622';
    ctx.beginPath();ctx.ellipse(cx,cy-h/2-r,r,r*0.4,0,0,2*Math.PI);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(cx,cy+h/2+r,r,r*0.4,0,0,2*Math.PI);ctx.fill();ctx.stroke();
    ctx.fillStyle=TEXT;ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('2πr='+( 2*Math.PI*dims.r).toFixed(1),cx,cy-h/2-r*2-6);
    ctx.fillText('h='+dims.ht,cx+rw/2+20,cy);
    const sa=2*Math.PI*dims.r*dims.r+2*Math.PI*dims.r*dims.ht;
    info.textContent='SA = 2πr² + 2πrh = 2π×'+dims.r+'² + 2π×'+dims.r+'×'+dims.ht+' = '+sa.toFixed(2)+' units²';
  } else {
    // cone: circle + sector
    const r=dims.r*U/4,sl=dims.sl*U/4;
    const cx=W/2,cy=H/2+30;
    ctx.fillStyle='#1e3a5f22';ctx.strokeStyle=NAVY;ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(cx,cy,r,r*0.4,0,0,2*Math.PI);ctx.fill();ctx.stroke();
    ctx.fillStyle='#dc262622';
    // sector (approximate as wedge)
    const angle=2*Math.PI*dims.r/dims.sl;
    const sx=cx-sl-20,sy=cy;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.arc(sx,sy,sl,-angle/2,angle/2);ctx.closePath();
    ctx.fill();ctx.stroke();
    ctx.fillStyle=TEXT;ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('r='+dims.r,cx,cy+r*0.5+14);
    ctx.fillText('slant l='+dims.sl,sx+sl*0.5,sy-sl*0.2);
    const sa=Math.PI*dims.r*dims.r+Math.PI*dims.r*dims.sl;
    info.textContent='SA = πr² + πrl = π×'+dims.r+'²+π×'+dims.r+'×'+dims.sl+' = '+sa.toFixed(2)+' units²';
  }
}

function draw(){drawNet();}
solidSel.onchange=()=>{buildSliders();draw();};
buildSliders();draw();`,
      outputHeight: 400,
    },

    {
      type: 'js',
      instruction: 'Adjust the cutting angle for a cone. See which conic section is produced and why.',
      html: `<div style="text-align:center;font-size:13px;font-family:monospace;margin-bottom:6px">
<label>Cut angle (°): <input id="cutAngle" type="range" min="0" max="90" value="0" style="width:180px"> <span id="angleVal">0</span>°</label>
<span id="ctype" style="margin-left:16px;font-weight:bold;color:#7c3aed"></span>
</div>
<canvas id="cc" width="580" height="320" style="border-radius:8px;display:block;margin:auto"></canvas>
<div id="cinfo" style="text-align:center;font-family:monospace;font-size:13px;margin-top:6px"></div>`,
      css: `#cc{background:#f8fafc}`,
      startCode: `const cv=document.getElementById('cc');
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

const info=document.getElementById('cinfo');
const ctype=document.getElementById('ctype');
const angleSlider=document.getElementById('cutAngle');
const W=cv.width,H=cv.height;
const CX=W/2,APEX=60,BASEC_Y=280,R=120,semiAngle=55;

function draw(){
  const deg=+angleSlider.value;
  document.getElementById('angleVal').textContent=deg;
  ctx.clearRect(0,0,W,H);

  // Cone outline
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(CX-R,BASEC_Y);ctx.lineTo(CX,APEX);ctx.lineTo(CX+R,BASEC_Y);ctx.stroke();
  ctx.strokeStyle='#1e3a5f88';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(CX,BASEC_Y,R,18,0,0,Math.PI,false);ctx.stroke();
  ctx.beginPath();ctx.ellipse(CX,BASEC_Y,R,18,0,Math.PI,2*Math.PI,false);ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);

  // Cut line
  const rad=deg*Math.PI/180;
  const height=BASEC_Y-APEX;
  const cx2=CX,cy2=(APEX+BASEC_Y)/2;
  const dx=Math.cos(rad)*160, dy=Math.sin(rad)*160;
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(cx2-dx,cy2-dy);ctx.lineTo(cx2+dx,cy2+dy);ctx.stroke();

  // Conic type
  const halfAngle=semiAngle;
  let shape,col;
  if(deg<2){shape='Circle';col='#dc2626';}
  else if(deg<halfAngle-2){shape='Ellipse';col='#b45309';}
  else if(Math.abs(deg-halfAngle)<3){shape='Parabola';col='#7c3aed';}
  else{shape='Hyperbola';col='#166534';}
  ctype.textContent=shape;ctype.style.color=col;
  info.textContent='Half-angle of cone ≈ '+halfAngle+'°. Cut at '+deg+'° → '+shape;
}

angleSlider.oninput=draw;
draw();`,
      outputHeight: 370,
    },

    {
      type: 'challenge',
      instruction: 'A rectangular box has length 10 cm, width 4 cm, and height 6 cm. What is the total surface area? Draw the net and label each face.',
      hint: 'SA = 2(lw + lh + wh). Three pairs of faces: top/bottom (10×4), front/back (10×6), left/right (4×6).',
      solution: `SA = 2(lw + lh + wh)
   = 2(10×4 + 10×6 + 4×6)
   = 2(40 + 60 + 24)
   = 2 × 124
   = 248 cm²

Net: cross-shaped layout with 6 rectangles.
  Top/Bottom: 2 × (10×4) = 80
  Front/Back: 2 × (10×6) = 120
  Left/Right: 2 × (4×6) = 48
  Total: 248 cm²`,
    },

    {
      type: 'challenge',
      instruction: 'A cone has base radius 5 cm and slant height 13 cm. Compute (a) the lateral surface area, (b) the total surface area, and (c) the height of the cone.',
      hint: 'Lateral SA = πrl. Total SA = πr² + πrl. Height h = √(l²−r²) by Pythagoras.',
      solution: `(a) Lateral SA = πrl = π × 5 × 13 = 65π ≈ 204.2 cm²

(b) Total SA = πr² + πrl = π(25) + 65π = 90π ≈ 282.7 cm²

(c) h = √(l² − r²) = √(169 − 25) = √144 = 12 cm`,
    },
  ],

  intuition: {
    blocks: [
      {
        type: 'prose',
        text: 'A net makes surface area concrete: unfold the 3D shape flat, then just add up the 2D areas you see. The count of faces tells you how many terms to sum.',
      },
      {
        type: 'image',
        src: geoNetsUrl,
        alt: 'Nets and cross-sections diagram',
        caption: 'Left: cube net (6 squares → SA=6a²). Right: cone cross-sections at different angles produce all four conic sections.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'The four conics (circle, ellipse, parabola, hyperbola) arise from just one shape — a double cone — sliced at different angles. This unification, discovered by the Greeks, is one of geometry\'s most elegant results.',
      },
    ],
  },

  quiz: [
    {
      q: 'A cube with edge length 5 has surface area:',
      img: quizNetsUrl,
      choices: ['150', '125', '25', '75'],
      answer: 0,
      explanation: 'SA = 6a² = 6 × 25 = 150.',
    },
    {
      q: 'A cylinder net consists of:',
      img: quizNetsUrl,
      choices: ['Two circles and one rectangle', 'Two squares and one circle', 'One circle and one triangle', 'Four rectangles'],
      answer: 0,
      explanation: 'Unroll the cylinder: you get two circular discs (top and bottom) and one rectangle (the lateral surface, width = circumference = 2πr).',
    },
    {
      q: 'A horizontal cut through a cone produces:',
      img: quizNetsUrl,
      choices: ['A circle', 'An ellipse', 'A parabola', 'A hyperbola'],
      answer: 0,
      explanation: 'A cut perpendicular to the axis gives a circle.',
    },
    {
      q: 'A cut through a cone parallel to one slant edge produces:',
      img: quizNetsUrl,
      choices: ['A parabola', 'A circle', 'An ellipse', 'A hyperbola'],
      answer: 0,
      explanation: 'A plane parallel to a generator (slant edge) produces a parabola.',
    },
    {
      q: 'Rectangular prism: l=6, w=4, h=3. Surface area?',
      choices: ['108', '72', '54', '144'],
      answer: 0,
      explanation: 'SA = 2(lw+lh+wh) = 2(24+18+12) = 2(54) = 108.',
    },
    {
      q: 'Cone with r=6, slant height l=10. Lateral SA =',
      choices: ['60π', '36π', '100π', '12π'],
      answer: 0,
      explanation: 'Lateral SA = πrl = π×6×10 = 60π.',
    },
    {
      q: 'How many faces does a triangular prism net have?',
      choices: ['5', '4', '6', '3'],
      answer: 0,
      explanation: 'Triangular prism: 2 triangular bases + 3 rectangular side faces = 5 faces.',
    },
    {
      q: 'Which conic section is produced when a plane cuts BOTH nappes of a double cone?',
      choices: ['Hyperbola', 'Parabola', 'Ellipse', 'Circle'],
      answer: 0,
      explanation: 'A steep cut that intersects both nappes of the double cone produces a hyperbola (two separate branches).',
    },
    {
      q: 'A square pyramid has base 8 cm and slant height 5 cm. Total SA =',
      choices: ['144', '160', '80', '64'],
      answer: 0,
      explanation: 'SA = b² + 2bl = 64 + 2×8×5 = 64+80 = 144 cm².',
    },
    {
      q: 'A cylinder has radius 4 and height 7. Total SA =',
      choices: ['88π', '56π', '32π', '112π'],
      answer: 0,
      explanation: 'SA = 2πr² + 2πrh = 2π×16 + 2π×4×7 = 32π + 56π = 88π.',
    },
  ],
};

LESSON_GEO_4_3.intuition.blocks.push({ type: 'viz', id: 'ScienceNotebook', props: { lesson: { cells: LESSON_GEO_4_3.cells, title: LESSON_GEO_4_3.title, subject: LESSON_GEO_4_3.subject, sequential: LESSON_GEO_4_3.sequential } } });

const GEO_4_3_DEFAULT = {
  cells: LESSON_GEO_4_3.cells,
  id: 'geo-4-3',
  title: 'Nets and Cross-Sections',
  slug: 'nets-cross-sections',
  subject: 'Geometry',
  chapter: 4,
  order: 3,
  tags: ['nets', 'surface area', 'cross-sections', 'conic sections', '3D geometry'],
  intuition: LESSON_GEO_4_3.intuition,
  quiz: LESSON_GEO_4_3.quiz.map(function(item, i) {
    return { id: 'q'+(i+1), type: 'choice', text: item.q, options: item.choices, correct: item.answer, explanation: item.explanation };
  }),
};

export default GEO_4_3_DEFAULT;
export { LESSON_GEO_4_3 };
