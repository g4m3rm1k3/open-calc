import geoLawCosinesUrl from '../diagrams/geo-law-of-cosines.svg?url'
import quizLawCosinesUrl from '../diagrams/quiz-geo-law-of-cosines.svg?url'

const LESSON_GEO_5_6 = {
  title: 'Law of Cosines',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Pythagorean Theorem — Generalized

For a right triangle, $c^2 = a^2 + b^2$. For **any** triangle with included angle $C$ between sides $a$ and $b$:

$$c^2 = a^2 + b^2 - 2ab\\cos C$$

The extra term $-2ab\\cos C$ is the "correction" for the angle not being 90°:
- If $C = 90°$: $\\cos 90° = 0$ → reduces to Pythagorean theorem
- If $C < 90°$: $\\cos C > 0$ → correction subtracts → $c$ shorter than expected
- If $C > 90°$: $\\cos C < 0$ → correction adds → $c$ longer than expected

**Use when you know**: SAS (two sides + included angle) or SSS (all three sides — to find angles).`,
    },

    {
      type: 'js',
      instruction: `### SAS → Find the Missing Side

Drag the two side sliders and the angle. The law of cosines computes the third side live, and the diagram shows the triangle updating. Notice how the third side grows when the included angle opens wider.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:14px;align-items:center;flex-wrap:wrap">
  <label style="font-family:Georgia,serif;font-size:13px">Side b: <input type="range" id="sb" min="2" max="12" value="7" style="width:100px"> <span id="sbV" style="color:#1e3a5f;font-weight:700">7</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Side c: <input type="range" id="sc" min="2" max="12" value="10" style="width:100px"> <span id="scV" style="color:#166534;font-weight:700">10</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Angle A (included): <input type="range" id="angA" min="10" max="170" value="60" style="width:120px"> <span id="angAV" style="color:#dc2626;font-weight:700">60°</span></label>
</div>
<canvas id="cv" width="700" height="240"></canvas>
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

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var b=parseFloat(document.getElementById('sb').value);
  var c=parseFloat(document.getElementById('sc').value);
  var A=parseFloat(document.getElementById('angA').value);
  document.getElementById('sbV').textContent=b;
  document.getElementById('scV').textContent=c;
  document.getElementById('angAV').textContent=A+'°';
  var rad=A*Math.PI/180;
  var a2=b*b+c*c-2*b*c*Math.cos(rad);
  var a=Math.sqrt(Math.max(0,a2));

  var SCALE=Math.min(180/Math.max(b,c,a),22);
  var ox=80,oy=H-30;
  // Vertex A at (ox,oy), one side along horizontal (length c)
  var Bx=ox+c*SCALE, By=oy;
  // Cx = ox + b*cos(A), Cy = oy - b*sin(A)
  var Cx=ox+b*Math.cos(rad)*SCALE, Cy=oy-b*Math.sin(rad)*SCALE;

  ctx.fillStyle='#1e3a5f11';
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(Bx,By);ctx.lineTo(Cx,Cy);ctx.closePath();ctx.fill();

  // Sides
  [[ox,oy,Cx,Cy,'#1e3a5f','b='+b],[ox,oy,Bx,By,'#166534','c='+c],[Bx,By,Cx,Cy,'#dc2626','a='+a.toFixed(3)]].forEach(function(s){
    ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[2],s[3]);ctx.strokeStyle=s[4];ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle=s[4];ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(s[5],(s[0]+s[2])/2+(s[4]==='#1e3a5f'?-18:s[4]==='#dc2626'?16:0),(s[1]+s[3])/2+(s[4]==='#166534'?18:0));
  });
  // Angle arc at A
  ctx.beginPath();ctx.arc(ox,oy,44,0,-rad,true);ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=RED;ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.fillText(A+'°',ox+58,oy-12);
  // Vertices
  [['A',ox,oy],['B',Bx,By],['C',Cx,Cy]].forEach(function(v){
    ctx.beginPath();ctx.arc(v[1],v[2],5,0,Math.PI*2);ctx.fillStyle=TEXT;ctx.fill();
    ctx.fillStyle=TEXT;ctx.font='13px Georgia';ctx.textAlign='center';
    ctx.fillText(v[0],v[1]+(v[0]==='B'?14:v[0]==='C'?14:-14),v[2]+(v[0]==='A'||v[0]==='B'?18:-12));
  });

  // Other angles
  var cosB=(a2+c*c-b*b)/(2*a*c),cosC=(a2+b*b-c*c)/(2*a*b);
  var B=Math.acos(Math.max(-1,Math.min(1,cosB)))*180/Math.PI;
  var C=Math.acos(Math.max(-1,Math.min(1,cosC)))*180/Math.PI;

  document.getElementById('info').innerHTML=
    '<b>a² = b²+c²−2bc·cosA</b> = '+b+'²+'+c+'²−2·'+b+'·'+c+'·cos('+A+'°)'
    +'<br>= '+(b*b).toFixed(0)+' + '+(c*c).toFixed(0)+' − '+(2*b*c*Math.cos(rad)).toFixed(2)
    +' = <b>'+a2.toFixed(2)+'</b>'
    +'&emsp;→ <b>a = √'+a2.toFixed(2)+' = '+a.toFixed(4)+'</b>'
    +'<br>Angles: A='+A+'°, B='+B.toFixed(2)+'°, C='+C.toFixed(2)+'°&emsp;Sum = '+(A+B+C).toFixed(1)+'°';
}

['sb','sc','angA'].forEach(function(id){document.getElementById(id).addEventListener('input',draw);});
draw();`,
      outputHeight: 380,
    },

    {
      type: 'js',
      instruction: `### SSS → Find All Angles

Given all three sides, use the Law of Cosines to recover each angle. The formula rearranges to $\\cos A = \\frac{b^2+c^2-a^2}{2bc}$. Drag the sliders — the triangle updates and all three angles are computed live. Try making it a right triangle (check when one angle hits 90°).`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:14px;align-items:center;flex-wrap:wrap">
  <label style="font-family:Georgia,serif;font-size:13px">Side a: <input type="range" id="sa" min="2" max="14" value="6" style="width:100px"> <span id="saV" style="color:#dc2626;font-weight:700">6</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Side b: <input type="range" id="sb2" min="2" max="14" value="8" style="width:100px"> <span id="sb2V" style="color:#1e3a5f;font-weight:700">8</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Side c: <input type="range" id="sc2" min="2" max="14" value="10" style="width:100px"> <span id="sc2V" style="color:#166534;font-weight:700">10</span></label>
</div>
<canvas id="cv" width="700" height="240"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:2;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px"></div>`,
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

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var a=parseFloat(document.getElementById('sa').value);
  var b=parseFloat(document.getElementById('sb2').value);
  var c=parseFloat(document.getElementById('sc2').value);
  document.getElementById('saV').textContent=a;
  document.getElementById('sb2V').textContent=b;
  document.getElementById('sc2V').textContent=c;

  // Triangle validity
  var valid=(a+b>c)&&(a+c>b)&&(b+c>a);
  if(!valid){
    ctx.fillStyle=RED;ctx.font='bold 16px Georgia';ctx.textAlign='center';
    ctx.fillText('Not a valid triangle: '+a+'+'+b+' > '+c+' ?',W/2,H/2);
    document.getElementById('info').innerHTML='<span style="color:#dc2626">Triangle inequality violated — no triangle exists with these sides.</span>';
    return;
  }

  // Angles via law of cosines
  var cosA=(b*b+c*c-a*a)/(2*b*c);
  var cosB=(a*a+c*c-b*b)/(2*a*c);
  var cosC=(a*a+b*b-c*c)/(2*a*b);
  var A=Math.acos(Math.max(-1,Math.min(1,cosA)))*180/Math.PI;
  var B=Math.acos(Math.max(-1,Math.min(1,cosB)))*180/Math.PI;
  var C=Math.acos(Math.max(-1,Math.min(1,cosC)))*180/Math.PI;

  // Draw using A at origin, c along x-axis
  var SCALE=Math.min(200/c,16);
  var ox=100,oy=H-30;
  var Bx=ox+c*SCALE,By=oy;
  var radA=A*Math.PI/180;
  var Cx=ox+b*Math.cos(radA)*SCALE,Cy=oy-b*Math.sin(radA)*SCALE;

  ctx.fillStyle='#1e3a5f11';ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(Bx,By);ctx.lineTo(Cx,Cy);ctx.closePath();ctx.fill();
  var SCOLORS=['#dc2626','#1e3a5f','#166534'];
  // a=BC, b=AC, c=AB
  [[Bx,By,Cx,Cy,'#dc2626','a='+a],[ox,oy,Cx,Cy,'#1e3a5f','b='+b],[ox,oy,Bx,By,'#166534','c='+c]].forEach(function(s,i){
    ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[2],s[3]);ctx.strokeStyle=s[4];ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle=s[4];ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(s[5],(s[0]+s[2])/2+(i===0?16:i===1?-18:0),(s[1]+s[3])/2+(i===2?18:0));
  });
  // Angle arcs
  var ACOLORS=['#dc2626','#1e3a5f','#b45309'];
  var verts=[[ox,oy,A,'A'],[Bx,By,B,'B'],[Cx,Cy,C,'C']];
  verts.forEach(function(v,i){
    ctx.beginPath();ctx.arc(v[0],v[1],5,0,Math.PI*2);ctx.fillStyle=ACOLORS[i];ctx.fill();
    ctx.fillStyle=ACOLORS[i];ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(v[3]+(Math.abs(v[2]-90)<1?' = 90°':''),v[0]+(i===0?-14:i===1?14:0),v[1]+(i<2?18:-14));
  });

  // Right angle mark if needed
  if(Math.abs(A-90)<0.5){ctx.beginPath();ctx.moveTo(ox+14,oy);ctx.lineTo(ox+14,oy-14);ctx.lineTo(ox,oy-14);ctx.strokeStyle=TEXT;ctx.lineWidth=1.5;ctx.stroke();}
  if(Math.abs(B-90)<0.5){ctx.beginPath();ctx.moveTo(Bx-14,By);ctx.lineTo(Bx-14,By-14);ctx.lineTo(Bx,By-14);ctx.strokeStyle=TEXT;ctx.lineWidth=1.5;ctx.stroke();}

  document.getElementById('info').innerHTML=
    '<span><b style="color:#dc2626">cos A</b> = (b²+c²−a²)/(2bc)<br>= ('+b+'²+'+c+'²−'+a+'²)/(2·'+b+'·'+c+')<br>= <b>A = '+A.toFixed(2)+'°</b>'+(Math.abs(A-90)<1?' ← right angle!':'')+'</span>'
    +'<span><b style="color:#1e3a5f">cos B</b> = (a²+c²−b²)/(2ac)<br>= ('+a+'²+'+c+'²−'+b+'²)/(2·'+a+'·'+c+')<br>= <b>B = '+B.toFixed(2)+'°</b></span>'
    +'<span><b style="color:#b45309">cos C</b> = (a²+b²−c²)/(2ab)<br>= ('+a+'²+'+b+'²−'+c+'²)/(2·'+a+'·'+b+')<br>= <b>C = '+C.toFixed(2)+'°</b></span>'
    +'<span style="grid-column:1/-1;color:#374151;font-size:12px">Check: A+B+C = '+(A+B+C).toFixed(2)+'°</span>';
}

['sa','sb2','sc2'].forEach(function(id){document.getElementById(id).addEventListener('input',draw);});
draw();`,
      outputHeight: 420,
    },

    {
      type: 'challenge',
      instruction: `In a triangle with $b = 7$, $c = 10$, and included angle $A = 60°$, find side $a$. ($\\cos 60° = 0.5$)`,
      options: [
        { label: 'A', text: '$a = \\sqrt{79} \\approx 8.89$' },
        { label: 'B', text: '$a = \\sqrt{149} - 70 \\approx 2.2$' },
        { label: 'C', text: '$a = \\sqrt{99} \\approx 9.95$' },
        { label: 'D', text: '$a = 7 + 10 = 17$' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. a² = b²+c²−2bc·cosA = 49+100−2(7)(10)(0.5) = 149−70 = 79. So a = √79 ≈ 8.888.',
      failMessage: 'a² = b²+c²−2bc·cosA = 7²+10²−2(7)(10)cos60° = 49+100−140(0.5) = 149−70 = 79. So a = √79 ≈ 8.89.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `A triangle has sides $a=6$, $b=8$, $c=10$. Is the triangle right-angled, and at which vertex?`,
      options: [
        { label: 'A', text: 'Right angle at C: $c^2 = a^2+b^2$ → $100 = 36+64$ ✓' },
        { label: 'B', text: 'Right angle at A: $a^2 = b^2+c^2$ → $36 = 164$ ✗' },
        { label: 'C', text: 'Not right-angled — only Pythagorean triples are right' },
        { label: 'D', text: 'Right angle at B: $b^2 = a^2+c^2$ → $64 = 136$ ✗' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. c²=100, a²+b²=36+64=100. Since c²=a²+b², angle C=90° (Law of Cosines with cosC=(a²+b²-c²)/(2ab)=0/96=0 → C=90°). This is the 3-4-5 family.',
      failMessage: 'Check: c² = 10² = 100, a²+b² = 6²+8² = 36+64 = 100. So c²=a²+b² → C=90°. The right angle is at C (opposite the longest side c). Law of cosines confirms: cosC=(36+64-100)/(2·6·8)=0.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-5-6',
  slug: 'law-of-cosines',
  chapter: 'geometry-5',
  subject: 'Geometry',
  title: 'Law of Cosines',
  subtitle: 'The generalization of the Pythagorean theorem — works for any triangle, not just right triangles',
  tags: ['geometry', 'trigonometry', 'law-of-cosines', 'SAS', 'SSS', 'pythagorean-generalization'],
  hook: {
    question: 'If the Pythagorean theorem only works for right triangles, what do you use for all other triangles?',
    realWorldContext: 'Structural engineers use the Law of Cosines to find forces in diagonal braces. Game developers use it to detect collisions. Navigators use it to find distances between two GPS waypoints when the angle between them is known. Anytime you have two known sides and the angle between them — the SAS case — the Law of Cosines gives the third side directly.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The generalization**: In a right triangle with the right angle at $C$, $c^2 = a^2 + b^2$. Now tilt the right angle to $C = 70°$ instead. The theorem no longer holds exactly — but it holds *approximately* with a correction factor: $c^2 = a^2 + b^2 - 2ab\\cos C$. The correction term vanishes when $C = 90°$ because $\\cos 90° = 0$.',
          '**Proof strategy**: drop altitude $h$ from $C$ to side $c$. Let $d = b\\cos A$ be the horizontal projection of $b$. Apply Pythagoras to both right triangles formed by the altitude: $h^2 = b^2 - d^2$ and $h^2 = a^2 - (c-d)^2$. Setting equal and substituting $d = b\\cos A$ gives $a^2 = b^2 + c^2 - 2bc\\cos A$.',
        ],
      },
      {
        type: 'image',
        src: geoLawCosinesUrl,
        alt: 'Triangle ABC with altitude h from C showing the proof: h²=b²-d² and h²=a²-(c-d)², combined to give a²=b²+c²-2bc·cosA. Formula box: a²=b²+c²-2bc·cosA and its rearrangement cosA=(b²+c²-a²)/(2bc). Special case when C=90° reducing to Pythagorean theorem. When-to-use box: SAS and SSS.',
        caption: 'Law of Cosines: a² = b²+c²−2bc·cosA. The correction term −2bc·cosA adjusts for the angle. At 90°, it vanishes. For obtuse angles, cosC < 0 so the term adds — making c² larger than a²+b².',
      },
      {
        type: 'math',
        tex: 'a^2 = b^2 + c^2 - 2bc\\cos A \\qquad \\cos A = \\frac{b^2 + c^2 - a^2}{2bc}',
        caption: 'Two forms: use the left to find a side (SAS), use the right to find an angle (SSS).',
      },
      {
        type: 'prose',
        paragraphs: [
          '**SAS: find the missing side**. Substitute the two sides and included angle directly into $a^2 = b^2 + c^2 - 2bc\\cos A$, then take the square root.',
          '**SSS: find all angles**. Rearrange to $\\cos A = (b^2 + c^2 - a^2)/(2bc)$. Compute $A = \\cos^{-1}$ of that value. Then find $B$ the same way, and get $C = 180° - A - B$. After finding the largest angle (opposite the longest side), use the Law of Sines for efficiency on the remaining two.',
          '**vs. Law of Sines**: Use the Law of Cosines for SAS and SSS. Use the Law of Sines for AAS and ASA. Never start with SSA in the Law of Cosines (it creates an equation you need the quadratic formula for).',
        ],
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_5_6 },
        mathBridge: 'In the SAS cell, drag the included angle to 90° — watch the correction term 2bc·cosA hit zero and the formula reduce to pure Pythagoras. In the SSS cell, set sides 3, 4, 5 or 5, 12, 13 and watch one angle snap to exactly 90°. Try an obtuse triangle (e.g. a=14, b=5, c=6) and see cosA become negative.',
      },
    ],
  },
  mentalModel: [
    'a² = b²+c²−2bc·cosA. The correction term disappears at 90°, shrinks the side for acute angles, enlarges it for obtuse',
    'SAS → find side: substitute directly. SSS → find angle: rearrange to cosA = (b²+c²−a²)/(2bc)',
    'Always find the largest angle (opposite longest side) first in SSS — it\'s most likely to be obtuse, and law of cosines handles obtuse angles without ambiguity',
    'Law of Cosines for SAS/SSS; Law of Sines for AAS/ASA. Don\'t use Law of Cosines for SSA (messy quadratic)',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizLawCosinesUrl,
      diagramAlt: 'SAS triangle with b=7, c=10, A=60° — find side a. SSS triangle with a=6, b=8, c=10 — find all angles.',
      text: 'In the SAS triangle ($b=7$, $c=10$, $A=60°$), which expression gives $a^2$?',
      options: [
        '$7^2 + 10^2 - 2(7)(10)\\cos 60°$',
        '$7^2 + 10^2 + 2(7)(10)\\cos 60°$',
        '$7^2 + 10^2$',
        '$2(7)(10)\\cos 60° - 7^2 - 10^2$',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      diagram: quizLawCosinesUrl,
      diagramAlt: 'SAS triangle with b=7, c=10, A=60°',
      text: 'Complete the calculation: $a^2 = 49 + 100 - 2(7)(10)(0.5)$. What is $a$?',
      options: [
        '$a = \\sqrt{219} \\approx 14.8$',
        '$a = \\sqrt{79} \\approx 8.89$',
        '$a = \\sqrt{149} \\approx 12.2$',
        '$a = \\sqrt{9} = 3$',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A triangle has $a=11$, $b=13$, and $C=120°$. ($\\cos 120° = -0.5$). Find $c^2$.',
      options: [
        '$c^2 = 121 + 169 - 143 = 147$',
        '$c^2 = 121 + 169 + 143 = 433$',
        '$c^2 = 121 + 169 - 2(11)(13)(-0.5) = 433$',
        '$c^2 = 121 + 169 - 2(-0.5) = 291$',
      ],
      correct: 2,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What happens to $c^2 = a^2+b^2-2ab\\cos C$ when $C=90°$?',
      options: [
        'It becomes $c^2 = a^2+b^2+2ab$ — the full expansion',
        'The correction term vanishes and it reduces to the Pythagorean theorem $c^2 = a^2+b^2$',
        'It becomes $c^2 = (a+b)^2$',
        'It becomes $c = a+b$',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      diagram: quizLawCosinesUrl,
      diagramAlt: 'SSS triangle with a=6, b=8, c=10',
      text: 'In the SSS triangle ($a=6$, $b=8$, $c=10$), find $\\cos C$ (angle opposite side $c=10$).',
      options: [
        '$\\cos C = \\frac{36+64-100}{96} = 0$',
        '$\\cos C = \\frac{100-36-64}{96} = 0$',
        '$\\cos C = \\frac{36+64+100}{96} = 2.08$',
        '$\\cos C = \\frac{36 \\cdot 64}{100} = 23.04$',
      ],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      diagram: quizLawCosinesUrl,
      diagramAlt: 'SSS triangle with a=6, b=8, c=10',
      text: 'From the previous result ($\\cos C = 0$), what is angle $C$?',
      options: ['$C = 0°$', '$C = 45°$', '$C = 90°$', '$C = 180°$'],
      correct: 2,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'In a triangle with sides $5$, $7$, $8$: which angle is the largest?',
      options: [
        'The angle opposite side $5$ (smallest side)',
        'The angle opposite side $7$',
        'The angle opposite side $8$ (largest side)',
        'All angles are equal',
      ],
      correct: 2,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A parallelogram has sides $6$ and $9$ with an included angle of $110°$. Find the length of the longer diagonal. ($\\cos 110° \\approx -0.342$)',
      options: [
        '$d = \\sqrt{36+81-108(-0.342)} = \\sqrt{154.0} \\approx 12.4$',
        '$d = \\sqrt{36+81+108(0.342)} = \\sqrt{154.0} \\approx 12.4$',
        '$d = \\sqrt{36 \\times 81} \\approx 54$',
        '$d = 6+9 = 15$',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'For which given information should you use the Law of Cosines rather than the Law of Sines?',
      options: [
        'AAS — two angles and a non-included side',
        'ASA — two angles and the included side',
        'SAS — two sides and the included angle',
        'SSA — two sides and a non-included angle',
      ],
      correct: 2,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A triangle has $a=4$, $b=5$, $c=9$. Is this a valid triangle?',
      options: [
        'Yes — all sides are positive so it must be valid',
        'No — $4+5 = 9$, violating the strict triangle inequality ($a+b > c$)',
        'Yes — the Law of Cosines will find the angles',
        'No — it would need a right angle to exist',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_5_6 };
