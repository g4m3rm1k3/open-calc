import geoSpecialRightUrl from '../diagrams/geo-special-right-triangles.svg?url'

const LESSON_GEO_5_3 = {
  title: 'Special Right Triangles',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Two Triangles That Unlock All of Trigonometry

**45-45-90** (from half a square): legs $1, 1$; hypotenuse $\\sqrt{2}$. Ratio: $1:1:\\sqrt{2}$.

**30-60-90** (from half an equilateral triangle): sides $1, \\sqrt{3}, 2$. Ratio: $1:\\sqrt{3}:2$.

Why memorize these? Because they produce **exact** trig values — the only angles where sine, cosine, and tangent are rational or simple surds. Every other angle requires a decimal approximation.

On the unit circle (radius 1), these triangles inscribed at 30°, 45°, 60° give the exact coordinates of those points — which is why the unit circle IS these two triangles, repeated.`,
    },

    {
      type: 'js',
      instruction: `### Finding Any Side from One

Given one side of a special right triangle, find the rest by multiplying or dividing by the ratio. Select the triangle type and enter any side — the others compute instantly.`,
      html: `<div style="padding:10px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:16px;flex-wrap:wrap;align-items:center">
  <select id="triType" style="padding:5px 10px;border-radius:6px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
    <option value="45">45-45-90</option>
    <option value="30">30-60-90</option>
  </select>
  <select id="givenSide" style="padding:5px 10px;border-radius:6px;border:1.5px solid #dc2626;font-family:Georgia,serif;font-size:13px">
    <option value="0">Given: short leg</option>
    <option value="1">Given: long leg</option>
    <option value="2">Given: hypotenuse</option>
  </select>
  <label style="font-family:Georgia,serif;font-size:13px">Value: <input type="number" id="givenVal" value="5" min="0.1" step="0.1" style="width:70px;padding:4px 8px;border:1.5px solid #94a3b8;border-radius:6px;font-family:Georgia,serif;font-size:13px"></label>
</div>
<canvas id="cv" width="700" height="260"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:1.9"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

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

var SCALE=16;

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var type=document.getElementById('triType').value;
  var given=parseInt(document.getElementById('givenSide').value);
  var val=parseFloat(document.getElementById('givenVal').value)||5;

  var leg1,leg2,hyp;
  if(type==='45'){
    // Ratio 1:1:√2
    if(given===0){leg1=val;leg2=val;hyp=val*Math.SQRT2;}
    else if(given===1){leg1=val;leg2=val;hyp=val*Math.SQRT2;}
    else{leg1=val/Math.SQRT2;leg2=val/Math.SQRT2;hyp=val;}
    document.getElementById('givenSide').options[1].text='Given: leg 2 (equal)';
  } else {
    // Ratio 1:√3:2
    if(given===0){leg1=val;leg2=val*Math.sqrt(3);hyp=val*2;}
    else if(given===1){leg2=val;leg1=val/Math.sqrt(3);hyp=leg1*2;}
    else{hyp=val;leg1=val/2;leg2=val*Math.sqrt(3)/2;}
    document.getElementById('givenSide').options[1].text='Given: long leg (60° side)';
  }
  document.getElementById('givenSide').options[0].text='Given: '+(type==='45'?'leg (either)':'short leg (30° side)');
  document.getElementById('givenSide').options[2].text='Given: hypotenuse';

  var bPx=Math.min(leg2*SCALE,300),aPx=Math.min(leg1*SCALE,200);
  var ox=W/2-bPx/2,oy=H/2+aPx/2;

  // Triangle
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.fillStyle='#1e3a5f15';
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+bPx,oy);ctx.lineTo(ox+bPx,oy-aPx);ctx.closePath();
  ctx.fill();ctx.stroke();

  // Right angle
  ctx.strokeStyle=TEXT;ctx.lineWidth=1.5;
  ctx.strokeRect(ox+bPx-14,oy-14,14,14);

  // Angle labels
  var ang1=type==='45'?'45°':'30°';
  var ang2=type==='45'?'45°':'60°';
  ctx.fillStyle=PURPLE;ctx.font='bold 13px Georgia';ctx.textAlign='left';
  ctx.fillText(ang1,ox+16,oy-10);
  ctx.textAlign='right';
  ctx.fillText(ang2,ox+bPx-4,oy-aPx-8);

  // Side labels with given highlighted
  var sides=[
    {label:'leg₁ = '+leg1.toFixed(3),x:ox+bPx+36,y:oy-aPx/2,col:given===0?'#dc2626':'#374151'},
    {label:'leg₂ = '+leg2.toFixed(3),x:ox+bPx/2,y:oy+18,col:given===1?'#dc2626':'#374151'},
    {label:'hyp = '+hyp.toFixed(3),x:ox+bPx/2-30,y:oy-aPx/2-12,col:given===2?'#dc2626':'#1a3a2a'},
  ];
  sides.forEach(function(s){
    ctx.fillStyle=s.col;ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(s.label,s.x,s.y);
  });

  var ratioStr=type==='45'?'1 : 1 : √2':'1 : √3 : 2';
  document.getElementById('info').innerHTML=
    (type==='45'?'45-45-90':'30-60-90')+' triangle. Ratio '+ratioStr
    +'<br>Given side: <b style="color:#dc2626">'+val.toFixed(3)+'</b>'
    +' → leg₁ = <b>'+leg1.toFixed(3)+'</b>, leg₂ = <b>'+leg2.toFixed(3)+'</b>, hyp = <b>'+hyp.toFixed(3)+'</b>';
}

['triType','givenSide','givenVal'].forEach(function(id){
  document.getElementById(id).addEventListener('input',draw);
  document.getElementById(id).addEventListener('change',draw);
});
draw();`,
      outputHeight: 390,
    },

    {
      type: 'js',
      instruction: `### Unit Circle: Where Both Triangles Live

The unit circle (radius 1) has these two special triangles inscribed at the key angles. The coordinates of the point are exactly $(\\cos\\theta, \\sin\\theta)$ — which come directly from the triangle ratios. Drag the angle to see it.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;align-items:center;gap:12px">
  <span style="font-family:Georgia,serif;font-size:13px">Angle:</span>
  <input type="range" id="ang" min="0" max="360" value="30" style="width:220px">
  <span id="angLbl" style="font-family:Georgia,serif;font-size:14px;font-weight:700;color:#1e3a5f;min-width:40px">30°</span>
  <span style="font-family:Georgia,serif;font-size:11px;color:#64748b">Snap to: 30°, 45°, 60°, 90°, 120°, 135°, 150°...</span>
</div>
<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

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

var angEl=document.getElementById('ang');
var lbl=document.getElementById('angLbl');
var R=110,cx=W/2,cy=H/2;

var SPECIALS=[0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];
var EXACT_COS={0:'1',30:'√3/2',45:'√2/2',60:'1/2',90:'0',180:'−1',270:'0',360:'1'};
var EXACT_SIN={0:'0',30:'1/2',45:'√2/2',60:'√3/2',90:'1',180:'0',270:'−1',360:'0'};

function snapAngle(a){
  var best=a,bd=999;
  SPECIALS.forEach(function(s){var d=Math.abs(a-s);if(d<bd){bd=d;best=s;}});
  return bd<8?best:a;
}

function draw(){
  var deg=parseInt(angEl.value);
  var snapped=snapAngle(deg);
  if(snapped!==deg){deg=snapped;}
  lbl.textContent=deg+'°';

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  // Circle
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();

  // Axes
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(cx-R-20,cy);ctx.lineTo(cx+R+20,cy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy-R-20);ctx.lineTo(cx,cy+R+20);ctx.stroke();

  var rad=deg*Math.PI/180;
  var px=cx+R*Math.cos(rad);
  var py=cy-R*Math.sin(rad);

  // Triangle legs
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;
  ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(px,cy);ctx.lineTo(px,py);ctx.stroke(); // vertical
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,cy);ctx.stroke(); // horizontal
  ctx.setLineDash([]);

  // Hypotenuse (radius)
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.stroke();

  // Point on circle
  ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fillStyle=RED;ctx.fill();

  // Angle arc
  ctx.strokeStyle=PURPLE;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(cx,cy,30,0,-rad,rad>0);ctx.stroke();
  ctx.fillStyle=PURPLE;ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText(deg+'°',cx+45*Math.cos(rad/2),cy-45*Math.sin(rad/2)+4);

  // Coordinate labels
  var cosV=Math.cos(rad),sinV=Math.sin(rad);
  var cosStr=EXACT_COS[deg]?EXACT_COS[deg]:cosV.toFixed(3);
  var sinStr=EXACT_SIN[deg]?EXACT_SIN[deg]:sinV.toFixed(3);

  ctx.fillStyle=NAVY;ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('cos '+deg+'° = '+cosStr,cx+70,cy+(sinV<0?32:-18));
  ctx.fillStyle=GREEN;ctx.textAlign='left';
  ctx.fillText('sin '+deg+'° = '+sinStr,px+12,py+(sinV>0?-6:16));

  ctx.fillStyle=TEXT;ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText('( '+cosV.toFixed(3)+', '+sinV.toFixed(3)+' )',px,py-16);

  // Special angle dot label
  if(EXACT_COS[deg]){
    ctx.fillStyle=PURPLE;ctx.font='bold 11px Georgia';ctx.textAlign='left';
    ctx.fillText('Special angle ✓',cx-R-18,cy-R-8);
  }
}

angEl.addEventListener('input',function(){var d=parseInt(angEl.value);angEl.value=snapAngle(d);draw();});
draw();`,
      outputHeight: 380,
    },

    {
      type: 'challenge',
      instruction: `The hypotenuse of a 30-60-90 triangle is $14$. What are the lengths of both legs?`,
      options: [
        { label: 'A', text: 'Short leg = $7$; long leg = $7\\sqrt{3}$' },
        { label: 'B', text: 'Short leg = $7\\sqrt{2}$; long leg = $7\\sqrt{6}$' },
        { label: 'C', text: 'Short leg = $\\frac{14}{\\sqrt{3}}$; long leg = $14\\sqrt{3}/2$' },
        { label: 'D', text: 'Short leg = $14\\sqrt{3}$; long leg = $7$' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. In a 30-60-90 triangle, hypotenuse = 2 × short leg, so short leg = 14/2 = 7. Long leg = short leg × √3 = 7√3.',
      failMessage: 'In a 30-60-90 triangle, the ratio is 1:√3:2. Hypotenuse = 2×(short leg) → short leg = 14÷2 = 7. Long leg = 7×√3 = 7√3.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `A square has diagonal $10\\sqrt{2}$ cm. What is the side length?`,
      options: [
        { label: 'A', text: '5 cm' },
        { label: 'B', text: '10 cm' },
        { label: 'C', text: '$5\\sqrt{2}$ cm' },
        { label: 'D', text: '$10$ cm — same as the diagonal' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The diagonal of a square makes a 45-45-90 triangle. Diagonal = side × √2, so side = diagonal ÷ √2 = 10√2 ÷ √2 = 10 cm.',
      failMessage: 'A square\'s diagonal is the hypotenuse of a 45-45-90 triangle with legs equal to the sides. Hypotenuse = leg × √2, so leg = hypotenuse ÷ √2 = 10√2 ÷ √2 = 10 cm.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-5-3',
  slug: 'special-right-triangles',
  chapter: 'geometry-5',
  subject: 'Geometry',
  title: 'Special Right Triangles',
  subtitle: 'The 45-45-90 and 30-60-90 ratios — exact values that unlock all of trigonometry',
  tags: ['geometry', 'special-right-triangles', '45-45-90', '30-60-90', 'exact-values', 'trigonometry'],
  hook: {
    question: 'Why does a square\'s diagonal have length exactly $\\sqrt{2}$ times its side?',
    realWorldContext: 'Carpenters, tile-setters, and engineers constantly work with 45° and 60° angles. The exact values from special right triangles appear in trigonometry tables, electrical engineering (phase angles), and every architectural diagonal. Knowing these two triangles cold lets you skip the calculator for a huge class of problems.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Two triangles worth memorizing.** Most right triangles require a calculator for exact side lengths. But two special cases produce side ratios that are clean surds (roots of integers), and they appear so often in mathematics and engineering that having them memorized is genuinely useful.',
        ],
      },
      {
        type: 'image',
        src: geoSpecialRightUrl,
        alt: 'Two triangles side by side. Left: 45-45-90 triangle with equal legs 1, hypotenuse √2. Ratio 1:1:√2. Right: 30-60-90 triangle with short leg 1, long leg √3, hypotenuse 2. Ratio 1:√3:2.',
        caption: 'Two triangles to memorize: 45-45-90 (from half a square) and 30-60-90 (from half an equilateral triangle). These ratios appear in every branch of mathematics.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The 45-45-90 triangle** comes from cutting a square in half along its diagonal. A square with side length $a$ has a diagonal of $a\\sqrt{2}$ (by Pythagoras: $a^2 + a^2 = 2a^2$, so $d = a\\sqrt{2}$). Since the square\'s angles are 90°, cutting along the diagonal gives two 45-45-90 triangles.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Legs: } a,\\ a \\qquad \\text{Hypotenuse: } a\\sqrt{2}',
        caption: '45-45-90 triangle — isosceles right triangle. Ratio: 1 : 1 : √2',
      },
      {
        type: 'prose',
        paragraphs: [
          'Given any one side, you can find the others:',
          '— If a **leg** is $a$: the other leg is $a$, hypotenuse is $a\\sqrt{2}$.',
          '— If the **hypotenuse** is $h$: each leg is $\\frac{h}{\\sqrt{2}} = \\frac{h\\sqrt{2}}{2}$ (rationalize the denominator).',
          'Common problem: a square has diagonal $10$. Side $= \\frac{10}{\\sqrt{2}} = 5\\sqrt{2}$.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**The 30-60-90 triangle** comes from cutting an equilateral triangle in half with its altitude. An equilateral triangle with side $2a$ has all angles $60°$. The altitude bisects the base (creating two $30-60-90$ right triangles with base $a$, hypotenuse $2a$) and has length $\\sqrt{(2a)^2 - a^2} = \\sqrt{3a^2} = a\\sqrt{3}$.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Short leg (opp. 30°): } a \\qquad \\text{Long leg (opp. 60°): } a\\sqrt{3} \\qquad \\text{Hypotenuse (opp. 90°): } 2a',
        caption: '30-60-90 triangle — half of an equilateral triangle. Ratio: 1 : √3 : 2',
      },
      {
        type: 'prose',
        paragraphs: [
          'Given any one side, you can find the others:',
          '— If the **short leg** (opposite 30°) is $a$: long leg is $a\\sqrt{3}$, hypotenuse is $2a$.',
          '— If the **long leg** (opposite 60°) is $b$: short leg is $\\frac{b}{\\sqrt{3}} = \\frac{b\\sqrt{3}}{3}$, hypotenuse is $\\frac{2b}{\\sqrt{3}} = \\frac{2b\\sqrt{3}}{3}$.',
          '— If the **hypotenuse** is $h$: short leg is $\\frac{h}{2}$, long leg is $\\frac{h\\sqrt{3}}{2}$.',
          'Common problem: an equilateral triangle has side $12$. Its altitude $= \\frac{12\\sqrt{3}}{2} = 6\\sqrt{3}$.',
        ],
      },
      {
        type: 'viz',
        id: 'G1_6_Pythagorean',
        title: 'Right Triangle Side Relationships',
        mathBridge: 'Set one leg to the other (equal legs) to see the 45-45-90 case: hypotenuse is always the leg times $\\sqrt{2}$. Then set the legs in ratio $1:\\sqrt{3}$ (e.g., 5 and 8.66) to see the 30-60-90 case: hypotenuse is exactly twice the short leg. These ratios lock in as soon as the angles are fixed — changing only the scale.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_5_3 },
        mathBridge: 'Use the side calculator to practice all three "given side" cases for both triangles. Then drag the unit circle to 30°, 45°, 60°, and 90° — see how the exact coordinates match the triangle ratios exactly. The unit circle IS these two triangles, rotated to four quadrants.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Why these triangles appear everywhere.** The exact values from these two triangles are the sine and cosine of the four most common angles in trigonometry:',
        ],
      },
      {
        type: 'math',
        tex: '\\sin 30°=\\tfrac{1}{2},\\; \\cos 30°=\\tfrac{\\sqrt{3}}{2} \\qquad \\sin 45°=\\tfrac{\\sqrt{2}}{2},\\; \\cos 45°=\\tfrac{\\sqrt{2}}{2} \\qquad \\sin 60°=\\tfrac{\\sqrt{3}}{2},\\; \\cos 60°=\\tfrac{1}{2}',
        caption: 'These six values come directly from the two special right triangles — no calculator needed',
      },
      {
        type: 'prose',
        paragraphs: [
          'Every trigonometry "special angle" value you will encounter is derived from one of these two triangles. The unit circle is just these triangles inscribed in a circle of radius 1.',
        ],
      },
    ],
  },
  mentalModel: [
    '45-45-90: legs a, a; hypotenuse a√2. From a square cut along its diagonal.',
    '30-60-90: short leg a, long leg a√3, hypotenuse 2a. From an equilateral triangle cut in half.',
    'Given any one side, you can find all three — multiply or divide by √2 (45-45-90) or use ×2 and ×√3 (30-60-90)',
    'The six trig values at 30°, 45°, 60° come directly from these triangles — they are the same numbers',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A 45-45-90 triangle has a leg of $9$. What is its hypotenuse?',
      options: ['$9\\sqrt{3}$', '$9\\sqrt{2}$', '$18$'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A 45-45-90 triangle has a hypotenuse of $8\\sqrt{2}$. What is each leg?',
      options: ['$4\\sqrt{2}$', '$8$', '$4$'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A square has side length $6$. What is the length of its diagonal?',
      options: ['$6\\sqrt{3}$', '$6\\sqrt{2}$', '$12$'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 30-60-90 triangle has a short leg (opposite 30°) of $7$. Its hypotenuse is…',
      options: ['$7\\sqrt{3}$', '$14$', '$7\\sqrt{2}$'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A 30-60-90 triangle has a hypotenuse of $20$. Its long leg (opposite 60°) is…',
      options: ['$10\\sqrt{3}$', '$10$', '$20\\sqrt{3}$'],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The 30-60-90 triangle is derived by cutting which shape in half?',
      options: ['A right isosceles triangle', 'An equilateral triangle', 'A rectangle'],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'An equilateral triangle has side $16$. What is its altitude?',
      options: ['$8\\sqrt{3}$', '$8\\sqrt{2}$', '$8$'],
      correct: 0,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Which trig value equals $\\frac{\\sqrt{3}}{2}$?',
      options: ['$\\sin 45°$', '$\\cos 30°$ (and $\\sin 60°$)', '$\\cos 45°$'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'A 30-60-90 triangle has a long leg of $6\\sqrt{3}$. What is its short leg?',
      options: ['$6$', '$3\\sqrt{3}$', '$12$'],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Why are these called "special" right triangles?',
      options: [
        'They are the only right triangles that exist',
        'Their side ratios are exact surds that appear in trigonometry — every other right triangle requires a calculator',
        'They are only used in advanced mathematics',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_5_3 };
