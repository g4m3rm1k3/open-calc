import quizPythagFindCUrl from '../diagrams/quiz-pythagorean-find-c.svg?url'
import quizPythagFindLegUrl from '../diagrams/quiz-pythagorean-find-leg.svg?url'

const LESSON_GEO_5_2 = {
  title: 'The Pythagorean Theorem and Distance',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Pythagorean Triples: Integer Right Triangles

Most right triangles have irrational side lengths. But some have all-integer sides — these are **Pythagorean triples**. The most famous: $(3, 4, 5)$.

Every triple $(a, b, c)$ satisfies $a^2 + b^2 = c^2$. Multiples of triples are also triples: $(6, 8, 10)$, $(9, 12, 15)$. The key test: if $a^2 + b^2 = c^2$ for positive integers, it's a triple.

**The Euclid formula** generates ALL primitive triples: given $m > n > 0$ with $m, n$ coprime and not both odd:
$$a = m^2 - n^2, \\quad b = 2mn, \\quad c = m^2 + n^2$$`,
    },

    {
      type: 'js',
      instruction: `### Pythagorean Triple Explorer

Adjust legs $a$ and $b$. The calculator checks if $c = \\sqrt{a^2 + b^2}$ is an integer (a Pythagorean triple). Known triples are highlighted. Try $(5, 12)$, $(8, 15)$, $(7, 24)$, $(9, 40)$.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:16px;align-items:center;flex-wrap:wrap">
  <label style="font-family:Georgia,serif;font-size:13px">a: <input type="range" id="sA" min="1" max="40" value="3" style="width:120px"> <span id="aLbl">3</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">b: <input type="range" id="sB" min="1" max="40" value="4" style="width:120px"> <span id="bLbl">4</span></label>
</div>
<canvas id="cv" width="700" height="260"></canvas>
<div id="info" style="padding:8px 16px;font-family:Georgia,serif;font-size:14px;text-align:center;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0)"></div>`,
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

var sA=document.getElementById('sA'),sB=document.getElementById('sB');
var aLbl=document.getElementById('aLbl'),bLbl=document.getElementById('bLbl');
var SCALE=6;

var KNOWN=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[9,40,41],[6,8,10],[9,12,15],[12,16,20]];
function isTriple(a,b,c){return KNOWN.some(function(t){
  var k=Math.round(a/t[0]);return k>0&&k*t[0]===a&&k*t[1]===b&&k*t[2]===Math.round(c);
});}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var a=parseInt(sA.value),b=parseInt(sB.value);
  aLbl.textContent=a;bLbl.textContent=b;
  var c=Math.sqrt(a*a+b*b);
  var isInt=Math.abs(c-Math.round(c))<0.001;
  var triple=isInt&&isTriple(a,b,c);

  var aPx=a*SCALE,bPx=b*SCALE;
  var ox=W/2-bPx/2,oy=H/2+aPx/2;

  // Triangle
  ctx.strokeStyle=isInt?'#1a3a2a':'#1e3a5f';ctx.lineWidth=2.5;
  ctx.fillStyle=(isInt?'#1a3a2a':'#1e3a5f')+'15';
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+bPx,oy);ctx.lineTo(ox+bPx,oy-aPx);ctx.closePath();
  ctx.fill();ctx.stroke();

  // Right angle mark
  ctx.strokeStyle=TEXT;ctx.lineWidth=1.5;
  ctx.strokeRect(ox+bPx-14,oy-14,14,14);

  // Side labels
  ctx.font='bold 14px Georgia';ctx.textAlign='center';
  ctx.fillStyle=NAVY;ctx.fillText('b = '+b,ox+bPx/2,oy+18);
  ctx.fillStyle=RED;ctx.fillText('a = '+a,ox+bPx+28,oy-aPx/2);
  ctx.fillStyle=isInt?'#1a3a2a':'#7c3aed';
  ctx.fillText('c = '+c.toFixed(3),ox+bPx/2-24,oy-aPx/2-10);

  // Squares on sides
  function drawSquare(x,y,w,h,col){
    ctx.fillStyle=col;ctx.globalAlpha=0.15;
    ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;
    ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);
    ctx.fillStyle=col;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText(Math.round(w/SCALE)+'² = '+Math.round((w/SCALE)*(w/SCALE)),x+w/2,y+h/2+4);
  }
  drawSquare(ox,oy,bPx,bPx,'#1e3a5f');
  drawSquare(ox+bPx,oy-aPx,aPx,aPx,'#dc2626');

  document.getElementById('info').innerHTML=
    a+'² + '+b+'² = '+(a*a)+' + '+(b*b)+' = '+(a*a+b*b)
    +' = c² &nbsp;→&nbsp; c = <b style="color:'+(isInt?'#1a3a2a':'#7c3aed')+'">'+c.toFixed(4)+'</b>'
    +(isInt?'&emsp;<b style="color:#1a3a2a">✓ Pythagorean triple! Integer hypotenuse = '+Math.round(c)+'</b>':'&emsp;<span style="color:#94a3b8">Not a perfect integer — no triple</span>');
}

sA.addEventListener('input',draw);sB.addEventListener('input',draw);
draw();`,
      outputHeight: 390,
    },

    {
      type: 'js',
      instruction: `### 3D Distance Formula

The Pythagorean theorem extends to three dimensions: apply it twice. First find the horizontal distance $d_{xy}$, then apply Pythagoras again with the vertical $z$ component. Drag the sliders to explore 3D distances.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:10px;flex-wrap:wrap;align-items:center">
  <b style="font-family:Georgia,serif;font-size:12px">Point A:</b>
  <label style="font-size:11px;font-family:Georgia,serif">x<sub>1</sub>: <input type="range" id="x1" min="-5" max="5" value="0" style="width:70px"> <span id="x1v">0</span></label>
  <label style="font-size:11px;font-family:Georgia,serif">y<sub>1</sub>: <input type="range" id="y1" min="-5" max="5" value="0" style="width:70px"> <span id="y1v">0</span></label>
  <label style="font-size:11px;font-family:Georgia,serif">z<sub>1</sub>: <input type="range" id="z1" min="-5" max="5" value="0" style="width:70px"> <span id="z1v">0</span></label>
  <b style="font-family:Georgia,serif;font-size:12px">Point B:</b>
  <label style="font-size:11px;font-family:Georgia,serif">x<sub>2</sub>: <input type="range" id="x2" min="-5" max="5" value="3" style="width:70px"> <span id="x2v">3</span></label>
  <label style="font-size:11px;font-family:Georgia,serif">y<sub>2</sub>: <input type="range" id="y2" min="-5" max="5" value="4" style="width:70px"> <span id="y2v">4</span></label>
  <label style="font-size:11px;font-family:Georgia,serif">z<sub>2</sub>: <input type="range" id="z2" min="-5" max="5" value="0" style="width:70px"> <span id="z2v">0</span></label>
</div>
<canvas id="cv" width="700" height="220"></canvas>
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

var ids=['x1','y1','z1','x2','y2','z2'];

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var vals={};
  ids.forEach(function(id){
    var v=parseInt(document.getElementById(id).value);
    vals[id]=v;
    document.getElementById(id+'v').textContent=v;
  });

  var dx=vals.x2-vals.x1,dy=vals.y2-vals.y1,dz=vals.z2-vals.z1;
  var dxy=Math.sqrt(dx*dx+dy*dy);
  var d3=Math.sqrt(dx*dx+dy*dy+dz*dz);

  // Draw the two-step triangle visually
  var cx=W/2,cy=H/2+20,SCALE=28;
  var step1x=cx-80,step1y=cy;
  var step2x=cx+80,step2y=cy;
  var step3x=cx+80,step3y=cy-80;

  // Step 1: horizontal distance (dxy)
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(step1x,cy);ctx.lineTo(step2x,cy);ctx.stroke();
  ctx.fillStyle=NAVY;ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText('d_xy = √(Δx²+Δy²) = '+dxy.toFixed(3),(step1x+step2x)/2,cy+18);

  // Step 2: vertical leg (dz)
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(step2x,cy);ctx.lineTo(step3x,step3y);ctx.stroke();
  ctx.fillStyle=RED;ctx.font='12px Georgia';ctx.textAlign='left';
  ctx.fillText('Δz = '+Math.abs(dz),step2x+8,(cy+step3y)/2);

  // Step 3: 3D hypotenuse
  ctx.strokeStyle=GREEN;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(step1x,cy);ctx.lineTo(step3x,step3y);ctx.stroke();
  ctx.fillStyle=GREEN;ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('d₃D = '+d3.toFixed(3),(step1x+step3x)/2-14,(cy+step3y)/2-8);

  // Right angle at step2
  ctx.strokeStyle=TEXT;ctx.lineWidth=1.5;
  ctx.strokeRect(step2x-12,step3y,12,12);

  document.getElementById('info').innerHTML=
    'Δx = '+dx+', Δy = '+dy+', Δz = '+dz
    +'<br>Step 1: d<sub>xy</sub> = √('+dx+'²+'+dy+'²) = √'+(dx*dx+dy*dy)+' = '+dxy.toFixed(3)
    +'<br>Step 2: d<sub>3D</sub> = √(d<sub>xy</sub>²+Δz²) = √('+dx*dx+dy*dy+'+'+dz*dz+') = √'+(dx*dx+dy*dy+dz*dz)+' = <b style="color:#1a3a2a">'+d3.toFixed(3)+'</b>';
}

ids.forEach(function(id){
  document.getElementById(id).addEventListener('input',draw);
});
draw();`,
      outputHeight: 380,
    },

    {
      type: 'challenge',
      instruction: `A rectangular room is $8$ m long, $6$ m wide, and $3$ m high. What is the 3D diagonal distance from one corner to the opposite corner?`,
      options: [
        { label: 'A', text: '$\\sqrt{109}$ m ≈ 10.44 m' },
        { label: 'B', text: '$\\sqrt{145}$ m ≈ 12.04 m' },
        { label: 'C', text: '17 m' },
        { label: 'D', text: '$\\sqrt{100}$ = 10 m' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. First find the floor diagonal: d_floor = √(8²+6²) = √100 = 10 m. Then apply Pythagoras with the height: d_3D = √(10²+3²) = √(100+9) = √109 ≈ 10.44 m.',
      failMessage: 'Apply Pythagoras twice: floor diagonal = √(8²+6²) = √100 = 10. Then 3D diagonal = √(10²+3²) = √(100+9) = √109 ≈ 10.44 m.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `The Euclid formula $a = m^2 - n^2$, $b = 2mn$, $c = m^2 + n^2$ generates all primitive triples. Use $m = 3$, $n = 2$ to find the triple.`,
      options: [
        { label: 'A', text: '$(5, 12, 13)$' },
        { label: 'B', text: '$(3, 4, 5)$' },
        { label: 'C', text: '$(8, 6, 10)$' },
        { label: 'D', text: '$(7, 24, 25)$' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. a = 3²−2² = 9−4 = 5. b = 2·3·2 = 12. c = 3²+2² = 9+4 = 13. Triple: (5, 12, 13). Check: 25+144 = 169 = 13². ✓',
      failMessage: 'Apply the formula: a = m²−n² = 9−4 = 5; b = 2mn = 2·3·2 = 12; c = m²+n² = 9+4 = 13. Triple: (5, 12, 13). Verify: 5²+12² = 25+144 = 169 = 13².',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-5-2',
  slug: 'pythagorean-distance',
  chapter: 'geometry-5',
  subject: 'Geometry',
  title: 'The Pythagorean Theorem and Distance',
  subtitle: 'The most-proved theorem in mathematics — and why it extends to three dimensions',
  tags: ['geometry', 'pythagorean-theorem', 'distance', 'right-triangle', 'hypotenuse', '3D'],
  hook: {
    question: 'How do you measure the straight-line distance between two points in 3D space?',
    realWorldContext: 'GPS satellites compute your position using 3D distance formulas. Video game engines check collision by computing distances between objects. The Pythagorean theorem is in every navigation system, physics engine, and computer graphics card on the planet.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The Pythagorean Theorem.** In any right triangle, the square of the hypotenuse (the side opposite the right angle) equals the sum of the squares of the other two sides (the legs):',
        ],
      },
      {
        type: 'math',
        tex: 'a^2 + b^2 = c^2',
        caption: 'where c is the hypotenuse and a, b are the legs',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Why it is true — the area proof.** Arrange four copies of the right triangle (legs $a$ and $b$, hypotenuse $c$) inside a large square of side $(a + b)$. The four triangles leave a tilted inner square whose side is $c$. The large square has area $(a + b)^2 = a^2 + 2ab + b^2$. The four triangles together have area $4 \\cdot \\frac{1}{2}ab = 2ab$. The inner square has area $(a+b)^2 - 2ab = a^2 + b^2$. But its side is $c$, so its area is also $c^2$. Therefore $a^2 + b^2 = c^2$.',
          'There are over 370 known proofs of the Pythagorean theorem — more than any other result in mathematics. U.S. President James Garfield published his own proof in 1876.',
        ],
      },
      {
        type: 'viz',
        id: 'G1_6_Pythagorean',
        title: 'Pythagorean Theorem Explorer',
        mathBridge: 'Drag the legs $a$ and $b$ to any lengths. The squares built on each side — area $a^2$, $b^2$, and $c^2$ — update instantly. The blue and red squares always together equal the green square. This visual proof is almost 2,500 years old: it\'s in Euclid\'s *Elements*, Book I, Proposition 47.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_5_2 },
        mathBridge: 'Try the triple explorer: find $(5, 12, 13)$, $(8, 15, 17)$, $(7, 24, 25)$. Notice the pattern — each is generated by the Euclid formula. Then use the 3D distance tool: set all three differences and watch it apply Pythagoras twice. Try the room diagonal: Δx=8, Δy=6, Δz=3.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The Converse.** If $a^2 + b^2 = c^2$ for the three sides of a triangle, then the triangle has a right angle opposite side $c$. This is how you test whether a triangle is right-angled: check the equation. Ancient Egyptians knotted ropes in a 3-4-5 ratio to create right angles for surveying.',
          '**Pythagorean triples** are integer solutions to $a^2 + b^2 = c^2$. Common examples: $(3,4,5)$, $(5,12,13)$, $(8,15,17)$, $(7,24,25)$. Any multiple of a triple is also a triple: $(6,8,10)$, $(9,12,15)$, etc.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Extending to the coordinate plane.** Two points $(x_1, y_1)$ and $(x_2, y_2)$ define a right triangle: horizontal leg $\\Delta x = x_2 - x_1$, vertical leg $\\Delta y = y_2 - y_1$, and the straight-line distance $d$ is the hypotenuse. Apply $a^2 + b^2 = c^2$:',
        ],
      },
      {
        type: 'math',
        tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
        caption: 'The 2D distance formula — Pythagoras applied to coordinates',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The 3D distance formula.** In three-dimensional space, a point has three coordinates $(x, y, z)$. To find the distance between $(x_1, y_1, z_1)$ and $(x_2, y_2, z_2)$, apply Pythagoras twice: first find the horizontal distance in the $xy$-plane, then apply Pythagoras again with the vertical $z$-component:',
        ],
      },
      {
        type: 'math',
        tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}',
        caption: '3D distance formula — one more squared term, same structure',
      },
      {
        type: 'prose',
        paragraphs: [
          'The pattern generalizes to any number of dimensions: $n$-dimensional distance has $n$ squared difference terms under the square root. This is why the Pythagorean theorem appears in machine learning (computing distances between data points in hundreds of dimensions), physics (spacetime intervals), and computer graphics (3D rendering).',
          '**Special right triangles.** Two common right triangles have exact, memorable side ratios that appear constantly:',
          '**45-45-90 triangle** (isosceles right triangle): legs $a$ and $a$, hypotenuse $a\\sqrt{2}$. If $a = 1$, the hypotenuse is $\\sqrt{2} \\approx 1.414$.',
          '**30-60-90 triangle**: sides are in ratio $1 : \\sqrt{3} : 2$. The short leg (opposite 30°) has length $a$, the long leg (opposite 60°) has length $a\\sqrt{3}$, and the hypotenuse (opposite 90°) has length $2a$.',
        ],
      },
      {
        type: 'math',
        tex: '45\\text{-}45\\text{-}90:\\quad a,\\ a,\\ a\\sqrt{2} \\qquad\\qquad 30\\text{-}60\\text{-}90:\\quad a,\\ a\\sqrt{3},\\ 2a',
        caption: 'The two special right triangles — memorize the ratios, derive any value from a single side',
      },
    ],
  },
  mentalModel: [
    'Pythagorean theorem: a²+b²=c² for any right triangle. The hypotenuse is c (opposite the right angle)',
    '2D distance = √(Δx²+Δy²), 3D distance = √(Δx²+Δy²+Δz²) — each adds one squared-difference term',
    'Pythagorean triples: (3,4,5), (5,12,13), (8,15,17) and their multiples are integer right triangles',
    '45-45-90: sides a, a, a√2. 30-60-90: sides a, a√3, 2a. These two ratios appear in nearly every geometry problem',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizPythagFindCUrl,
      diagramAlt: 'Right triangle with legs labelled 6 and 8, hypotenuse labelled x.',
      text: 'A right triangle has legs $6$ and $8$. Its hypotenuse is…',
      options: ['10', '14', '$\\sqrt{28}$'],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The Pythagorean theorem applies to…',
      options: [
        'Any triangle',
        'Only right triangles',
        'Only triangles with integer sides',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A triangle has sides 5, 12, 13. Is it a right triangle?',
      options: [
        'No — you must measure the angle to determine',
        'Yes — $5^2 + 12^2 = 25 + 144 = 169 = 13^2$, so it satisfies $a^2 + b^2 = c^2$',
        'Only if the 90° angle is between the sides of length 5 and 12',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the distance between points $(1, 2)$ and $(4, 6)$?',
      options: ['5', '7', '$\\sqrt{7}$'],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'What is the 3D distance between $(0, 0, 0)$ and $(1, 2, 2)$?',
      options: ['3', '5', '$\\sqrt{3}$'],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A 45-45-90 triangle has a leg of length 7. Its hypotenuse is…',
      options: ['$7\\sqrt{2}$', '$7\\sqrt{3}$', '$14$'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'A 30-60-90 triangle has a short leg of $5$. Its hypotenuse is…',
      options: ['$5\\sqrt{3}$', '$10$', '$5\\sqrt{2}$'],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'In the area proof of the Pythagorean theorem, four congruent right triangles are placed inside a $(a+b)\\times(a+b)$ square. The inner tilted square has side length…',
      options: ['$a + b$', '$c$ (the hypotenuse)', '$\\sqrt{ab}$'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Which is a Pythagorean triple?',
      options: ['$(6, 7, 8)$', '$(8, 15, 17)$', '$(4, 5, 7)$'],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'The $n$-dimensional distance formula has how many squared terms under the square root?',
      options: ['Always 2', '$n$ — one for each coordinate axis', '$n - 1$'],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_5_2 };
