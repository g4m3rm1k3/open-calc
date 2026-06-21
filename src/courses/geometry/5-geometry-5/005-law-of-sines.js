import geoLawSinesUrl from '../diagrams/geo-law-of-sines.svg?url'
import quizLawSinesUrl from '../diagrams/quiz-geo-law-of-sines.svg?url'

const LESSON_GEO_5_5 = {
  title: 'Law of Sines',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### When the Triangle Isn't Right

SOH-CAH-TOA only works in **right** triangles. For any other triangle, the **Law of Sines** gives the key relationship:

$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$$

Each side divided by the sine of its **opposite** angle gives the same value — which equals the diameter of the circumscribed circle ($2R$).

**Use when you know**: AAS, ASA, or SSA (but check for the ambiguous case).

**Proof in one line**: drop altitude $h$ from $C$ → $h = b\\sin A = a\\sin B$ → divide both sides by $ab$ → $\\frac{\\sin A}{a} = \\frac{\\sin B}{b}$.`,
    },

    {
      type: 'js',
      instruction: `### Law of Sines Explorer

Drag any of the three vertices of the triangle. The three ratios $a/\\sin A$, $b/\\sin B$, $c/\\sin C$ update live — watch them stay perfectly equal no matter how you reshape the triangle. The circumscribed circle (circumcircle) is also drawn — its diameter equals the common ratio.`,
      html: `<canvas id="cv" width="700" height="310"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:2;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block;cursor:grab}`,
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

var pts=[{x:120,y:260},{x:560,y:260},{x:340,y:80}];
var COLORS=['#dc2626','#1e3a5f','#b45309'];
var NAMES=['A','B','C'];
var drag=-1;

function dist(a,b){return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);}
function angleDeg(P,O,Q){
  var dx1=P.x-O.x,dy1=P.y-O.y,dx2=Q.x-O.x,dy2=Q.y-O.y;
  var cos=(dx1*dx2+dy1*dy2)/(Math.sqrt(dx1*dx1+dy1*dy1)*Math.sqrt(dx2*dx2+dy2*dy2));
  return Math.acos(Math.max(-1,Math.min(1,cos)))*180/Math.PI;
}
function circumcircle(A,B,C){
  var ax=A.x,ay=A.y,bx=B.x,by=B.y,cx=C.x,cy=C.y;
  var D=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
  if(Math.abs(D)<0.001)return null;
  var ux=((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/D;
  var uy=((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/D;
  var r=dist({x:ux,y:uy},A);
  return{x:ux,y:uy,r:r};
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var A=pts[0],B=pts[1],C=pts[2];
  // Sides
  var sides=[dist(B,C),dist(A,C),dist(A,B)]; // a=BC, b=AC, c=AB
  var angles=[angleDeg(B,A,C),angleDeg(A,B,C),angleDeg(A,C,B)]; // A,B,C

  // Circumcircle
  var cc=circumcircle(A,B,C);
  if(cc){
    ctx.beginPath();ctx.arc(cc.x,cc.y,cc.r,0,Math.PI*2);
    ctx.strokeStyle='#7c3aed33';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.stroke();ctx.setLineDash([]);
  }

  // Triangle sides
  var sideColors=['#dc2626','#1e3a5f','#b45309'];
  var sidePairs=[[B,C],[A,C],[A,B]];
  sidePairs.forEach(function(p,i){
    ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);
    ctx.strokeStyle=sideColors[i];ctx.lineWidth=2.5;ctx.stroke();
    var mx=(p[0].x+p[1].x)/2,my=(p[0].y+p[1].y)/2;
    ctx.fillStyle=sideColors[i];ctx.font='bold 15px Georgia';ctx.textAlign='center';
    var off=['#dc2626','#1e3a5f','#b45309'];
    ctx.fillText(['a','b','c'][i],mx+10,my+4);
  });

  // Vertices + angle arcs + labels
  pts.forEach(function(p,i){
    ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.fillStyle=COLORS[i];ctx.fill();
    ctx.fillStyle=COLORS[i];ctx.font='bold 15px Georgia';ctx.textAlign='center';
    ctx.fillText(NAMES[i],p.x+(i===0?-16:i===1?16:0),p.y+(i<2?20:-14));
    ctx.fillText(angles[i].toFixed(1)+'°',p.x+(i===0?-36:i===1?36:0),p.y+(i<2?38:-28));
  });

  // Info panel
  var ratios=sides.map(function(s,i){return s/Math.sin(angles[i]*Math.PI/180);});
  var r2R=cc?cc.r*2:0;
  var infoEl=document.getElementById('info');
  infoEl.innerHTML=
    ['a','b','c'].map(function(s,i){
      return '<span><b style="color:'+sideColors[i]+'">'+s+' / sin '+NAMES[i]+'</b><br>'
        +sides[i].toFixed(2)+' / sin('+angles[i].toFixed(1)+'°)<br>= '+sides[i].toFixed(2)+' / '+Math.sin(angles[i]*Math.PI/180).toFixed(4)+'<br>= <b>'+ratios[i].toFixed(2)+'</b></span>';
    }).join('')
    +'<span style="grid-column:1/-1;color:#7c3aed;font-size:12px">All three ratios ≈ '+(ratios[0]).toFixed(2)+' &emsp;Circumdiameter 2R = '+(r2R).toFixed(2)+'</span>';
}

cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  drag=pts.findIndex(function(p){return dist({x:mx,y:my},p)<18;});
});
cv.addEventListener('mousemove',function(e){
  if(drag<0)return;
  var r=cv.getBoundingClientRect();
  pts[drag]={x:e.clientX-r.left,y:e.clientY-r.top};
  draw();
});
cv.addEventListener('mouseup',function(){drag=-1;});
draw();`,
      outputHeight: 430,
    },

    {
      type: 'js',
      instruction: `### The Ambiguous Case (SSA)

When you know two sides and a **non-included** angle, there can be **0, 1, or 2** valid triangles. This interactive shows all possible outcomes — drag the sliders and watch the second triangle appear or disappear based on the height threshold $h = b\\sin A$.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:14px;align-items:center;flex-wrap:wrap">
  <label style="font-family:Georgia,serif;font-size:13px">Angle A: <input type="range" id="angA" min="10" max="80" value="35" style="width:120px"> <span id="angAV" style="color:#dc2626;font-weight:700">35°</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Side b (adjacent): <input type="range" id="sideB" min="2" max="14" value="10" style="width:120px"> <span id="sideBV" style="color:#1e3a5f;font-weight:700">10</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Side a (opposite): <input type="range" id="sideA" min="1" max="14" value="6" style="width:120px"> <span id="sideAV" style="color:#b45309;font-weight:700">6</span></label>
</div>
<canvas id="cv" width="700" height="250"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:1.9;min-height:48px"></div>`,
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
  var A=parseFloat(document.getElementById('angA').value);
  var b=parseFloat(document.getElementById('sideB').value);
  var a=parseFloat(document.getElementById('sideA').value);
  document.getElementById('angAV').textContent=A+'°';
  document.getElementById('sideBV').textContent=b;
  document.getElementById('sideAV').textContent=a;
  var rad=A*Math.PI/180;
  var h=b*Math.sin(rad); // altitude threshold
  var SCALE=14;
  var ox=80,oy=220;

  // Draw side b from A
  var bx=ox+b*Math.cos(rad)*SCALE, by=oy-b*Math.sin(rad)*SCALE;
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(bx,by);
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle=NAVY;ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('b='+b,(ox+bx)/2-12,(oy+by)/2);

  // Angle arc at A
  ctx.beginPath();ctx.arc(ox,oy,40,0,-rad,true);ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=RED;ctx.font='bold 13px Georgia';ctx.fillText(A+'°',ox+56,oy-8);
  ctx.fillStyle=TEXT;ctx.fillText('A',ox-14,oy+16);
  // Base line from A extended
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(W-40,oy);ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.stroke();ctx.setLineDash([]);

  // Altitude from B (top of b)
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,oy);ctx.strokeStyle=PURPLE;ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=PURPLE;ctx.font='12px Georgia';ctx.textAlign='left';
  ctx.fillText('h = b·sinA = '+h.toFixed(2),bx+6,(by+oy)/2);

  // Draw circle of radius a centred at B
  var r=a*SCALE;
  ctx.beginPath();ctx.arc(bx,by,r,0,Math.PI*2);ctx.strokeStyle='#b45309';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#b45309';ctx.font='11px Georgia';ctx.textAlign='center';ctx.fillText('arc of radius a='+a,bx,by-r-6);

  // Intersections with base line (oy)
  var dy=oy-by; // ≥ 0 if b·sinA > 0
  var disc=r*r-dy*dy;
  var cases=[];
  if(disc<0){
    // No intersection
  } else if(disc===0){
    cases.push({x:bx,y:oy});
  } else {
    var dx=Math.sqrt(disc);
    cases.push({x:bx+dx,y:oy});
    if(bx-dx>ox)cases.push({x:bx-dx,y:oy});
  }
  // Filter: only valid C positions to the right of A
  cases=cases.filter(function(c){return c.x>ox+4;});

  // Draw valid triangles
  var triColors=['#dc2626','#166534'];
  cases.forEach(function(C,i){
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(bx,by);ctx.lineTo(C.x,C.y);ctx.closePath();
    ctx.strokeStyle=triColors[i];ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=triColors[i]+'22';ctx.fill();
    ctx.fillStyle=triColors[i];ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText('C'+(cases.length>1?(i+1):''),C.x,C.y+16);
    ctx.fillText('a='+a,(bx+C.x)/2+10,(by+C.y)/2-4);
  });

  // Result text
  var result;
  if(a<h){result='<b style="color:#dc2626">No triangle</b>: a ('+a+') &lt; h ('+h.toFixed(2)+') — the arc doesn\\'t reach the base';}
  else if(Math.abs(a-h)<0.01){result='<b style="color:#b45309">Exactly 1 right triangle</b>: a = h ('+h.toFixed(2)+') — arc is tangent to base';}
  else if(a>=b){result='<b style="color:#166534">Exactly 1 triangle</b>: a ('+a+') ≥ b ('+b+') — arc only crosses base once on valid side';}
  else{result='<b style="color:#dc2626">2 triangles possible</b>: h ('+h.toFixed(2)+') &lt; a ('+a+') &lt; b ('+b+') — arc crosses base at two valid points';}
  document.getElementById('info').innerHTML='h = b·sin A = '+b+'·sin('+A+'°) = '+h.toFixed(2)+'&emsp;|&emsp;'+result;
}

['angA','sideB','sideA'].forEach(function(id){
  document.getElementById(id).addEventListener('input',draw);
});
draw();`,
      outputHeight: 390,
    },

    {
      type: 'challenge',
      instruction: `In a triangle, $A = 50°$, $B = 70°$, and $a = 8$. Find side $b$.`,
      options: [
        { label: 'A', text: '$b = \\frac{8 \\sin 70°}{\\sin 50°} \\approx 9.80$' },
        { label: 'B', text: '$b = \\frac{8 \\sin 50°}{\\sin 70°} \\approx 6.52$' },
        { label: 'C', text: '$b = 8 \\times \\frac{70}{50} = 11.2$' },
        { label: 'D', text: '$b = \\frac{\\sin 70°}{8 \\sin 50°} \\approx 0.145$' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Law of Sines: a/sin A = b/sin B → b = a·sin B / sin A = 8·sin 70° / sin 50° ≈ 8 × 0.9397 / 0.7660 ≈ 9.80.',
      failMessage: 'Law of Sines: a/sin A = b/sin B → b = a × sin B / sin A = 8 × sin 70° / sin 50° ≈ 9.80. Cross-multiply the proportion: b·sin A = a·sin B, then isolate b.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `In an SSA triangle with $A = 30°$, $a = 6$, $b = 10$: how many triangles are possible? ($\\sin 30° = 0.5$)`,
      options: [
        { label: 'A', text: 'Exactly 1 triangle' },
        { label: 'B', text: 'No triangle — the arc doesn\'t reach' },
        { label: 'C', text: '2 triangles — the ambiguous case' },
        { label: 'D', text: 'Infinitely many' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. h = b·sin A = 10 × 0.5 = 5. Since h (5) < a (6) < b (10), there are two possible triangles. sin B = b·sin A / a = 10×0.5/6 ≈ 0.833, giving B₁ ≈ 56.4° or B₂ ≈ 123.6°.',
      failMessage: 'Compute h = b·sin A = 10×sin 30° = 10×0.5 = 5. Since h (5) < a (6) < b (10), the arc of radius a=6 from B crosses the base at two valid points → 2 triangles. This is the classic ambiguous case.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-5-5',
  slug: 'law-of-sines',
  chapter: 'geometry-5',
  subject: 'Geometry',
  title: 'Law of Sines',
  subtitle: 'Any triangle can be solved when you know an angle and the side opposite it — and the ratio is always the same',
  tags: ['geometry', 'trigonometry', 'law-of-sines', 'AAS', 'ASA', 'SSA', 'ambiguous-case', 'circumcircle'],
  hook: {
    question: 'If you know two angles of a triangle and one side, can you find everything else without a right angle?',
    realWorldContext: 'Law of Sines is how surveyors triangulate positions, how GPS calculates distances from signal angles, and how astronomers measure stellar parallax. Whenever you have angle-angle-side data about a triangle — common in real measurement — this law gives you all remaining sides and angles.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The proof in one sentence**: drop an altitude $h$ from $C$ to side $AB$. In the two right triangles formed, $h = b\\sin A$ and $h = a\\sin B$. Setting these equal: $b\\sin A = a\\sin B$, which rearranges to $\\frac{a}{\\sin A} = \\frac{b}{\\sin B}$. Repeat for the third side to get all three equal.',
          '**What the common ratio equals**: $\\frac{a}{\\sin A} = 2R$ where $R$ is the radius of the circumscribed circle (circumcircle). This is a beautiful geometric fact — the law of sines is secretly a statement about the circumcircle.',
        ],
      },
      {
        type: 'image',
        src: geoLawSinesUrl,
        alt: 'Triangle ABC with altitude h from C, showing h = b sinA = a sinB derivation. Law of Sines formula a/sinA = b/sinB = c/sinC = 2R. Ambiguous case SSA chart: when b·sinA < a < b, two triangles exist. When to use chart: AAS, ASA, SSA.',
        caption: 'Law of Sines: each side divided by the sine of its opposite angle gives the same value — the diameter of the circumscribed circle. The ambiguous SSA case can produce 0, 1, or 2 valid triangles.',
      },
      {
        type: 'math',
        tex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R',
        caption: 'The law of sines. Label: side a is opposite angle A, side b opposite B, side c opposite C.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The ambiguous case (SSA)**: given angle $A$, side $b$ (adjacent to $A$), and side $a$ (opposite $A$), compute the altitude $h = b\\sin A$. If $a < h$: no triangle. If $a = h$: exactly one (right triangle). If $h < a < b$: two triangles. If $a \\geq b$: one triangle.',
          '**How to solve AAS or ASA**: use the angle sum ($A + B + C = 180°$) to find the third angle, then apply the law of sines to find the remaining sides in one step each.',
        ],
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_5_5 },
        mathBridge: 'Drag the triangle vertices and watch the three ratios a/sinA, b/sinB, c/sinC stay perfectly equal — this is the law of sines proved visually. The circumcircle (dashed purple) has radius R = (common ratio)/2. Then use the ambiguous case explorer: set A=35°, b=10, slide a from 1 to 14 and watch the triangle count switch between 0, 1, and 2.',
      },
    ],
  },
  mentalModel: [
    'Law of Sines: a/sinA = b/sinB = c/sinC. Each side over the sine of its OPPOSITE angle — all three ratios are equal',
    'Use for AAS (two angles + any side) or ASA (two angles + included side). Always find the third angle first via A+B+C=180°',
    'SSA (ambiguous case): compute h = b·sinA. If a<h: none. If a=h: one right triangle. If h<a<b: two triangles. If a≥b: one triangle',
    'Common ratio = 2R (circumradius). Larger circumcircle = larger ratio = longer sides for the same angles',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizLawSinesUrl,
      diagramAlt: 'AAS triangle with A=50°, B=70°, a=8 (side opposite A); and SSA diagram showing ambiguous case with A=30°, b=10, a=6 and two possible triangles',
      text: 'In the AAS triangle ($A=50°$, $B=70°$, $a=8$), find angle $C$.',
      options: ['$C = 70°$', '$C = 60°$', '$C = 80°$', '$C = 40°$'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      diagram: quizLawSinesUrl,
      diagramAlt: 'AAS triangle with A=50°, B=70°, a=8 (side opposite A); and SSA diagram',
      text: 'Using the Law of Sines in the AAS triangle, find side $b$ (opposite $B=70°$, given $a=8$, $A=50°$).',
      options: [
        '$b = \\frac{8\\sin 70°}{\\sin 50°} \\approx 9.80$',
        '$b = \\frac{8\\sin 50°}{\\sin 70°} \\approx 6.52$',
        '$b = 8 + \\sin 70° - \\sin 50° \\approx 7.18$',
        '$b = \\frac{\\sin 70°}{\\sin 50°} \\approx 1.23$',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      diagram: quizLawSinesUrl,
      diagramAlt: 'AAS triangle with A=50°, B=70°, a=8',
      text: 'Find side $c$ (opposite $C=60°$) in the same triangle ($a=8$, $A=50°$).',
      options: [
        '$c = \\frac{8\\sin 60°}{\\sin 50°} \\approx 9.03$',
        '$c = \\frac{8\\sin 50°}{\\sin 60°} \\approx 7.08$',
        '$c = 8 \\times 60/50 = 9.6$',
        '$c = 8 + \\sin 60° = 8.87$',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'In a triangle with $a=12$, $A=45°$, and $B=75°$, find side $b$.',
      options: [
        '$b = \\frac{12\\sin 75°}{\\sin 45°} \\approx 16.39$',
        '$b = \\frac{12\\sin 45°}{\\sin 75°} \\approx 8.78$',
        '$b = 12 \\times \\frac{75}{45} = 20$',
        '$b = 12 + 75° - 45° = 42$',
      ],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      diagram: quizLawSinesUrl,
      diagramAlt: 'SSA diagram with A=30°, b=10, a=6 and two possible triangles B1 and B2',
      text: 'In the SSA case ($A=30°$, $a=6$, $b=10$), what is the altitude $h = b\\sin A$?',
      options: ['$h = 10$', '$h = 5$', '$h = 3$', '$h = 6$'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      diagram: quizLawSinesUrl,
      diagramAlt: 'SSA diagram with A=30°, b=10, a=6 and two possible triangles B1 and B2',
      text: 'In the SSA case ($A=30°$, $a=6$, $b=10$, $h=5$), how many triangles exist?',
      options: ['0', '1', '2', 'Infinitely many'],
      correct: 2,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'For SSA with $A=30°$, $a=6$, $b=10$: use the Law of Sines to find $\\sin B$. Which of the following is correct?',
      options: [
        '$\\sin B = \\frac{6 \\sin 30°}{10} = 0.3$',
        '$\\sin B = \\frac{10 \\sin 30°}{6} \\approx 0.833$',
        '$\\sin B = \\frac{\\sin 30°}{6 \\times 10} \\approx 0.0083$',
        '$\\sin B = 10 \\times 6 \\times \\sin 30° = 30$',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A triangle has $B = 110°$, $C = 40°$, and $b = 15$. Find side $c$.',
      options: [
        '$c = \\frac{15\\sin 40°}{\\sin 110°} \\approx 10.26$',
        '$c = \\frac{15\\sin 110°}{\\sin 40°} \\approx 21.93$',
        '$c = \\frac{15\\sin 30°}{\\sin 110°} \\approx 7.98$',
        '$c = 15 - \\sin 40° \\approx 14.36$',
      ],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'The common ratio in the Law of Sines equals $2R$. What does $R$ represent?',
      options: [
        'The radius of the inscribed circle (incircle)',
        'The radius of the circumscribed circle (circumcircle)',
        'Half the longest side',
        'The altitude of the triangle',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'For SSA with $A = 50°$, $a = 9$, $b = 7$: how many triangles are possible?',
      options: [
        '0 — arc does not reach the base',
        '1 — arc is tangent to the base',
        '2 — classic ambiguous case',
        '1 — since $a > b$, the arc only crosses once',
      ],
      correct: 3,
    },
  ],
};

export { LESSON_GEO_5_5 };
