import geoTrigAppsUrl from '../diagrams/geo-trig-applications.svg?url'
import quizTrigAppsUrl from '../diagrams/quiz-geo-trig-applications.svg?url'

const LESSON_GEO_5_7 = {
  title: 'Trigonometry Applications',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Real-World Trig: Bearings and Multi-Step Problems

**Bearing** is a navigation angle measured **clockwise from North**, always written as 3 digits (e.g. 050°, not 50°).

| Direction | Bearing |
|---|---|
| North | 000° |
| East | 090° |
| South | 180° |
| West | 270° |
| N 40° E | 040° |
| S 30° W | 210° |

**Back bearing** = bearing + 180° (mod 360°) — the direction pointing back the way you came.

**Multi-step strategy**: Draw a diagram. Label every known side and angle. Pick the right law (SOH-CAH-TOA for right triangles, Law of Sines/Cosines for others). Set up simultaneous equations when two angles observe the same unknown height.`,
    },

    {
      type: 'js',
      instruction: `### Bearing Navigation Explorer

Enter a starting point, bearing, and distance. The path is drawn on a compass grid with North up. Add a second leg to see how bearings chain — and use the Law of Cosines to find the straight-line return distance.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;font-family:Georgia,serif;font-size:13px">
  <label>Leg 1 bearing (°): <input type="number" id="b1" value="050" min="0" max="359" style="width:70px;padding:4px;border-radius:4px;border:1.5px solid #1e3a5f"></label>
  <label>Leg 1 distance (km): <input type="number" id="d1" value="60" min="1" max="200" style="width:70px;padding:4px;border-radius:4px;border:1.5px solid #1e3a5f"></label>
  <label>Leg 2 bearing (°): <input type="number" id="b2" value="140" min="0" max="359" style="width:70px;padding:4px;border-radius:4px;border:1.5px solid #1e3a5f"></label>
  <label>Leg 2 distance (km): <input type="number" id="d2" value="80" min="1" max="200" style="width:70px;padding:4px;border-radius:4px;border:1.5px solid #1e3a5f"></label>
</div>
<canvas id="cv" width="700" height="280"></canvas>
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

function bearingToXY(deg,dist){
  var rad=deg*Math.PI/180;
  return{dx:dist*Math.sin(rad),dy:-dist*Math.cos(rad)};
}
function dist2(ax,ay,bx,by){return Math.sqrt((bx-ax)**2+(by-ay)**2);}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var b1=parseFloat(document.getElementById('b1').value)||50;
  var d1=parseFloat(document.getElementById('d1').value)||60;
  var b2=parseFloat(document.getElementById('b2').value)||140;
  var d2=parseFloat(document.getElementById('d2').value)||80;

  var v1=bearingToXY(b1,d1),v2=bearingToXY(b2,d2);
  var allX=[0,v1.dx,v1.dx+v2.dx],allY=[0,v1.dy,v1.dy+v2.dy];
  var minX=Math.min(...allX),maxX=Math.max(...allX),minY=Math.min(...allY),maxY=Math.max(...allY);
  var rangeX=maxX-minX||1,rangeY=maxY-minY||1;
  var SCALE=Math.min((W-120)/rangeX,(H-80)/rangeY)*0.75;
  var padX=80,padY=50;
  function tx(x){return padX+(x-minX)*SCALE;}
  function ty(y){return padY+(y-minY)*SCALE;}

  var Sx=tx(0),Sy=ty(0),Px=tx(v1.dx),Py=ty(v1.dy),Qx=tx(v1.dx+v2.dx),Qy=ty(v1.dy+v2.dy);

  // Grid (light)
  ctx.strokeStyle=GRID;ctx.lineWidth=1;
  for(var g=-200;g<=300;g+=20){
    var gx=tx(g);if(gx>0&&gx<W){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
    var gy=ty(g);if(gy>0&&gy<H){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
  }

  // North arrows from S and P
  [[Sx,Sy],[Px,Py]].forEach(function(pt){
    ctx.beginPath();ctx.moveTo(pt[0],pt[1]);ctx.lineTo(pt[0],pt[1]-40);
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#94a3b8';ctx.font='11px Georgia';ctx.textAlign='center';ctx.fillText('N',pt[0],pt[1]-46);
  });

  // Leg 1: S→P
  ctx.beginPath();ctx.moveTo(Sx,Sy);ctx.lineTo(Px,Py);ctx.strokeStyle='#dc2626';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText(b1.toFixed(0)+'° / '+d1+' km',(Sx+Px)/2+18,(Sy+Py)/2);

  // Leg 2: P→Q
  ctx.beginPath();ctx.moveTo(Px,Py);ctx.lineTo(Qx,Qy);ctx.strokeStyle=NAVY;ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText(b2.toFixed(0)+'° / '+d2+' km',(Px+Qx)/2+18,(Py+Qy)/2);

  // Return S→Q
  ctx.beginPath();ctx.moveTo(Sx,Sy);ctx.lineTo(Qx,Qy);ctx.strokeStyle='#b45309';ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([]);

  // Dots
  [{p:[Sx,Sy],l:'S'},{p:[Px,Py],l:'P'},{p:[Qx,Qy],l:'Q'}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p[0],v.p[1],6,0,Math.PI*2);
    ctx.fillStyle=v.l==='S'?'#374151':v.l==='P'?'#dc2626':'#1e3a5f';ctx.fill();
    ctx.fillStyle=TEXT;ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(v.l,v.p[0],v.p[1]-12);
  });

  // Law of cosines for return distance
  var angBetween=Math.abs(b2-b1);if(angBetween>180)angBetween=360-angBetween;
  var interiorAngle=180-angBetween; // angle at P between the two legs (supplementary to difference)
  // Actually: angle at P = |b2 - (b1+180)| adjusted
  var b1rev=(b1+180)%360;
  var ang=Math.abs(b2-b1rev);if(ang>180)ang=360-ang;
  var SQsq=d1*d1+d2*d2-2*d1*d2*Math.cos(ang*Math.PI/180);
  var SQ=Math.sqrt(Math.max(0,SQsq));
  // Return bearing from S to Q
  var retBearing=Math.atan2(v1.dx+v2.dx,-(v1.dy+v2.dy))*180/Math.PI;
  if(retBearing<0)retBearing+=360;

  document.getElementById('info').innerHTML=
    'Angle at P between the two legs = '+ang.toFixed(1)+'°<br>'
    +'Return distance SQ = √(d₁²+d₂²−2d₁d₂·cos θ) = √('+d1+'²+'+d2+'²−2·'+d1+'·'+d2+'·cos '+ang.toFixed(1)+'°)<br>'
    +'= <b>'+SQ.toFixed(2)+' km</b>&emsp;|&emsp;Return bearing from S to Q: <b>'+retBearing.toFixed(1)+'°</b>';
}

['b1','d1','b2','d2'].forEach(function(id){
  document.getElementById(id).addEventListener('input',draw);
  document.getElementById(id).addEventListener('change',draw);
});
draw();`,
      outputHeight: 430,
    },

    {
      type: 'js',
      instruction: `### Two-Observation Height Problem

A classic geometry problem: measure the angle of elevation to the top of a tower from **two different distances**. Each observation gives a different equation; together they solve for the unknown height $h$ and unknown near-distance $d$ simultaneously.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:14px;align-items:center;flex-wrap:wrap">
  <label style="font-family:Georgia,serif;font-size:13px">Angle from A (farther): <input type="range" id="angA2" min="15" max="75" value="30" style="width:120px"> <span id="angA2V" style="color:#dc2626;font-weight:700">30°</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Angle from B (closer): <input type="range" id="angB2" min="20" max="85" value="50" style="width:120px"> <span id="angB2V" style="color:#166534;font-weight:700">50°</span></label>
  <label style="font-family:Georgia,serif;font-size:13px">Distance AB: <input type="range" id="abDist" min="10" max="100" value="40" style="width:120px"> <span id="abDistV" style="color:#1e3a5f;font-weight:700">40</span> m</label>
</div>
<canvas id="cv" width="700" height="240"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:2"></div>`,
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
  var angA=parseFloat(document.getElementById('angA2').value);
  var angB=parseFloat(document.getElementById('angB2').value);
  var AB=parseFloat(document.getElementById('abDist').value);
  document.getElementById('angA2V').textContent=angA+'°';
  document.getElementById('angB2V').textContent=angB+'°';
  document.getElementById('abDistV').textContent=AB;

  if(angA>=angB){
    ctx.fillStyle=RED;ctx.font='13px Georgia';ctx.textAlign='center';
    ctx.fillText('Angle from B must be larger than angle from A (B is closer to tower)',W/2,H/2);
    document.getElementById('info').innerHTML='<span style="color:#dc2626">Angle from closer point B must exceed angle from farther point A.</span>';
    return;
  }
  var radA=angA*Math.PI/180,radB=angB*Math.PI/180;
  // tan(angA)=h/(d+AB), tan(angB)=h/d → h = d·tan(angB) → d = AB·tan(angA)/(tan(angB)-tan(angA))
  var tanA=Math.tan(radA),tanB=Math.tan(radB);
  var d=AB*tanA/(tanB-tanA);
  var h=d*tanB;

  var SCALE=Math.min(180/h,7);
  var baseY=H-30,ax=80,bx=ax+AB*SCALE,tx=bx+d*SCALE;

  // Ground
  ctx.beginPath();ctx.moveTo(40,baseY);ctx.lineTo(W-20,baseY);ctx.strokeStyle=TEXT;ctx.lineWidth=1.5;ctx.stroke();
  // Tower
  ctx.beginPath();ctx.moveTo(tx,baseY);ctx.lineTo(tx,baseY-h*SCALE);ctx.strokeStyle=NAVY;ctx.lineWidth=4;ctx.stroke();
  // Sight lines
  [[ax,'#dc2626',angA,''],[bx,'#166534',angB,'']].forEach(function(s){
    ctx.beginPath();ctx.moveTo(s[0],baseY);ctx.lineTo(tx,baseY-h*SCALE);ctx.strokeStyle=s[1];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
    var r=s[2]*Math.PI/180,arcR=40;
    ctx.beginPath();ctx.arc(s[0],baseY,arcR,0,-r,true);ctx.strokeStyle=s[1];ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=s[1];ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText(s[2]+'°',s[0]+56,baseY-12);
  });
  // Labels
  ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText('A',ax,baseY+18);
  ctx.fillStyle=GREEN;ctx.fillText('B',bx,baseY+18);
  ctx.fillStyle=TEXT;ctx.fillText('T',tx,baseY-h*SCALE-10);
  // Distance labels
  ctx.fillStyle=TEXT;ctx.font='12px Georgia';
  ctx.fillText('AB='+AB+' m',(ax+bx)/2,baseY+32);
  ctx.fillText('d='+d.toFixed(1)+' m',(bx+tx)/2,baseY+32);
  // Height label
  ctx.fillStyle=NAVY;ctx.fillText('h='+h.toFixed(1)+' m',tx+40,baseY-h*SCALE/2);

  document.getElementById('info').innerHTML=
    'Let d = BT (near distance), h = height.<br>'
    +'From A: tan '+angA+'° = h/(d+'+AB+')   →   h = (d+'+AB+')·'+tanA.toFixed(4)+'<br>'
    +'From B: tan '+angB+'° = h/d   →   h = d·'+tanB.toFixed(4)+'<br>'
    +'Setting equal: d·'+tanB.toFixed(4)+' = (d+'+AB+')·'+tanA.toFixed(4)
    +' → d('+tanB.toFixed(4)+'−'+tanA.toFixed(4)+') = '+AB+'·'+tanA.toFixed(4)
    +' → <b>d = '+d.toFixed(2)+' m</b>, <b>h = '+h.toFixed(2)+' m</b>';
}

['angA2','angB2','abDist'].forEach(function(id){document.getElementById(id).addEventListener('input',draw);});
draw();`,
      outputHeight: 410,
    },

    {
      type: 'challenge',
      instruction: `A ship sails on bearing 050° for 60 km, then bearing 140° for 80 km. The interior angle at the turning point between the return leg and leg 2 is 90°. What is the straight-line distance from start to finish?`,
      options: [
        { label: 'A', text: '$60 + 80 = 140$ km' },
        { label: 'B', text: '$\\sqrt{60^2 + 80^2} = 100$ km' },
        { label: 'C', text: '$\\sqrt{60^2 + 80^2 - 2(60)(80)\\cos 90°} = 100$ km' },
        { label: 'D', text: '$60 \\times 80 = 4800$ km' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The angle between leg 1 reversed (230°) and leg 2 (140°) is 90° — a right angle at P. So by Pythagoras: SQ = √(60²+80²) = √(3600+6400) = √10000 = 100 km. This is the 3-4-5 triple scaled by 20.',
      failMessage: 'The two legs (60 km and 80 km) form a right angle at the turning point P. Pythagoras: SQ = √(60²+80²) = √10000 = 100 km. Law of cosines with cos90°=0 also gives the same result.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `From point A (farther), the angle of elevation to a tower top is 30°. From point B, 20 m closer, it is 60°. The height $h = \\frac{AB \\tan A \\tan B}{\\tan B - \\tan A}$. Use $\\tan 30° = \\frac{1}{\\sqrt{3}}$ and $\\tan 60° = \\sqrt{3}$ to find $h$.`,
      options: [
        { label: 'A', text: '$h = \\frac{20 \\cdot \\frac{1}{\\sqrt{3}} \\cdot \\sqrt{3}}{\\sqrt{3}-\\frac{1}{\\sqrt{3}}} = 10\\sqrt{3}$ m' },
        { label: 'B', text: '$h = \\frac{20}{\\sqrt{3}} \\approx 11.5$ m' },
        { label: 'C', text: '$h = 20\\sqrt{3} \\approx 34.6$ m' },
        { label: 'D', text: '$h = 20 \\cdot \\tan 30° + \\tan 60° \\approx 13.3$ m' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. h = AB·tanA·tanB/(tanB−tanA) = 20·(1/√3)·√3/(√3−1/√3) = 20·1/(√3−1/√3) = 20/(2/√3) = 20·√3/2 = 10√3 ≈ 17.3 m.',
      failMessage: 'h = AB·tanA·tanB/(tanB−tanA) = 20·(1/√3)·(√3)/(√3−1/√3). Numerator = 20·1 = 20. Denominator = √3−1/√3 = (3−1)/√3 = 2/√3. So h = 20/(2/√3) = 10√3 ≈ 17.3 m.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-5-7',
  slug: 'trig-applications',
  chapter: 'geometry-5',
  subject: 'Geometry',
  title: 'Trigonometry in the Real World',
  subtitle: 'Bearings, multi-step height problems, and applying all three trig tools together',
  tags: ['geometry', 'trigonometry', 'bearing', 'navigation', 'angle-of-elevation', 'angle-of-depression', 'multi-step'],
  hook: {
    question: 'A ship leaves port, sails 60 km north-east, then 80 km south-east. How far is it from port — and in what direction should it sail to return?',
    realWorldContext: 'Surveyors use triangulation with angles of elevation from two measured positions to find the height of inaccessible objects. Ships and planes navigate using bearings. Architects calculate sight lines and ramp gradients. Construction crews find diagonal distances across uneven terrain. All of these are multi-step applications of the same trig toolkit.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The method for every application problem**: (1) draw a clear diagram with all known sides and angles labeled; (2) identify which triangle(s) are present; (3) choose the right tool — SOH-CAH-TOA for right triangles, Law of Sines for AAS/ASA, Law of Cosines for SAS/SSS; (4) set up equations and solve. For multi-step problems, introduce variable names for unknowns and combine equations.',
          '**Bearings**: Always measured clockwise from North, written as 3 digits. Converting to x-y components: $x = d\\sin\\theta$ (East), $y = d\\cos\\theta$ (North). The back bearing adds 180° (mod 360°).',
        ],
      },
      {
        type: 'image',
        src: geoTrigAppsUrl,
        alt: 'Left: compass rose showing bearing 040° measured clockwise from North with the direction line, back bearing at 220°, and bearing rules box. Right: two-building problem with observer P on the ground, angle of elevation α to top of far building, showing step 1 h₂=d·tanα and step 2 to find h₁.',
        caption: 'Bearing is always from North, clockwise, 3 digits. For multi-step problems: draw everything, name every unknown, set up one equation per unknown.',
      },
      {
        type: 'math',
        tex: 'h = \\frac{AB \\cdot \\tan\\alpha \\cdot \\tan\\beta}{\\tan\\beta - \\tan\\alpha}',
        caption: 'Two-observation height formula: angles α (far) and β (near) from two points AB apart. Derived by writing h = (d+AB)·tanα = d·tanβ and solving for d, then h.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Two-observation height**: From point A (farther), angle of elevation is $\\alpha$; from B (closer), it is $\\beta$. Let $d$ = near distance BT. Then $h = d\\tan\\beta$ and $h = (d + AB)\\tan\\alpha$. Subtracting: $d(\\tan\\beta - \\tan\\alpha) = AB\\tan\\alpha$, so $d = \\frac{AB\\tan\\alpha}{\\tan\\beta - \\tan\\alpha}$ and $h = d\\tan\\beta$.',
          '**Navigation with Law of Cosines**: After two bearing legs of length $d_1$ and $d_2$, the angle $\\theta$ at the turning point between the reverse of leg 1 and leg 2 determines the return distance: $SQ^2 = d_1^2 + d_2^2 - 2d_1 d_2 \\cos\\theta$.',
        ],
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_5_7 },
        mathBridge: 'In the bearing explorer, set leg 1 to 050° / 60 km and leg 2 to 140° / 80 km — the return distance comes out to exactly 100 km (the 3-4-5 triple scaled by 20). In the two-observation cell, set angles to 30° and 60° with AB=20: watch the formula compute h=10√3 exactly.',
      },
    ],
  },
  mentalModel: [
    'Bearing: clockwise from North, 3 digits. North=000°, East=090°, South=180°, West=270°. Back bearing = +180° mod 360°',
    'Two-observation height: h = AB·tanα·tanβ / (tanβ−tanα). Draw the diagram and derive this each time rather than memorizing',
    'Multi-step: one variable per unknown, one equation per triangle. Combine at the end',
    'x-components use sin (East), y-components use cos (North). Return distance: Law of Cosines with the angle at the turning point',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizTrigAppsUrl,
      diagramAlt: 'Left: tower T with point A (30° elevation, farther) and B (45° elevation, closer, 20m nearer). Right: ship navigation with two bearing legs.',
      text: 'From A, the angle of elevation to tower T is 30°. From B (20 m closer), it is 45°. Let $d$ = BT. Which equation correctly expresses the height $h$ from both observations?',
      options: [
        '$h = d\\tan 30°$ and $h = (d+20)\\tan 45°$',
        '$h = (d+20)\\tan 30°$ and $h = d\\tan 45°$',
        '$h = d\\tan 30°$ and $h = d\\tan 45°$',
        '$h = 20\\tan 30°$ and $h = 20\\tan 45°$',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      diagram: quizTrigAppsUrl,
      diagramAlt: 'Tower height problem with A=30°, B=45°, AB=20m',
      text: 'From $h = (d+20)\\tan 30°$ and $h = d\\tan 45° = d$, find $d$. ($\\tan 30° = 1/\\sqrt{3}$, $\\tan 45° = 1$)',
      options: [
        '$d = \\frac{20/\\sqrt{3}}{1 - 1/\\sqrt{3}} = \\frac{20}{\\sqrt{3}-1} \\approx 27.3$ m',
        '$d = 20(\\tan 30° + \\tan 45°) \\approx 31.5$ m',
        '$d = 20\\tan 30° \\approx 11.5$ m',
        '$d = 20(1 - \\tan 30°) \\approx 8.5$ m',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Using $d \\approx 27.3$ m and $h = d\\tan 45° = d$, what is the height of the tower?',
      options: [
        '$h \\approx 11.5$ m',
        '$h \\approx 27.3$ m',
        '$h \\approx 47.3$ m',
        '$h \\approx 54.6$ m',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      diagram: quizTrigAppsUrl,
      diagramAlt: 'Ship navigation: S → P on bearing 050° for 60 km, then P → Q on bearing 140° for 80 km',
      text: 'A ship goes from S to P on bearing 050° for 60 km, then P to Q on bearing 140° for 80 km. The angle at P between leg SP reversed and leg PQ is 90°. What is SQ?',
      options: [
        '$\\sqrt{60+80} \\approx 11.8$ km',
        '$60+80 = 140$ km',
        '$\\sqrt{60^2+80^2} = 100$ km',
        '$\\frac{1}{2}(60)(80) = 2400$ km²',
      ],
      correct: 2,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A plane flies on bearing 120° for 200 km. What are its East and North displacements?',
      options: [
        'East = 200 cos 120° ≈ −100 km, North = 200 sin 120° ≈ 173 km',
        'East = 200 sin 120° ≈ 173 km, North = −200 cos 120° ≈ 100 km (south)',
        'East = 200 sin 60° ≈ 173 km, North = 200 cos 60° ≈ 100 km',
        'East = 200 cos 60° ≈ 100 km, North = 200 sin 60° ≈ 173 km',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'What is the back bearing from a bearing of 250°?',
      options: ['070°', '110°', '290°', '080°'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'An observer on a 120 m cliff looks down at a boat at an angle of depression of 28°. A second boat is directly behind the first and at an angle of depression of 15°. What is the distance between the two boats?',
      options: [
        '$120(\\cot 15° - \\cot 28°) \\approx 120(3.732-1.881) \\approx 222$ m',
        '$120(\\tan 28° - \\tan 15°) \\approx 120(0.532 - 0.268) \\approx 31.6$ m',
        '$120(\\tan 15° + \\tan 28°) \\approx 96$ m',
        '$120\\tan 28° \\approx 63.8$ m',
      ],
      correct: 0,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Two ships leave a harbour simultaneously. Ship A travels on bearing 035° at 20 knots; Ship B on bearing 125° at 15 knots. After 2 hours the angle at harbour between the two courses is 90°. How far apart are the ships?',
      options: [
        '$\\sqrt{(20\\times2)^2 + (15\\times2)^2} = \\sqrt{1600+900} = 50$ nautical miles',
        '$\\sqrt{20^2+15^2} = 25$ nautical miles',
        '$(20+15)\\times2 = 70$ nautical miles',
        '$\\sqrt{40^2-30^2} \\approx 26.5$ nautical miles',
      ],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Which bearing corresponds to "South 40° West"?',
      options: ['040°', '140°', '220°', '310°'],
      correct: 2,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'From the top of a 60 m building, the angle of depression to the base of a shorter building is 55°, and to the top of the shorter building is 30°. What is the height of the shorter building?',
      options: [
        '$60 - d\\tan 30°$ where $d = 60/\\tan 55° \\approx 42$ m → $h \\approx 60 - 24.2 \\approx 35.8$ m',
        '$60\\tan 55° \\approx 85.7$ m',
        '$60\\tan 30° \\approx 34.6$ m',
        '$d(\\tan 55° - \\tan 30°)$ where $d = 60/\\tan 55°$',
      ],
      correct: 0,
    },
  ],
};

export { LESSON_GEO_5_7 };
