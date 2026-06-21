import geoCirclePartsUrl from '../diagrams/geo-circle-parts.svg?url'

const LESSON_GEO_6_2 = {
  title: 'Circles: Arcs, Chords, and Sectors',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Circle: One Ratio Governs Everything

All circle calculations use a single ratio: **the fraction of the full circle**. For a central angle $\\theta$:

| Quantity | Degrees | Radians |
|---|---|---|
| Arc length | $\\frac{\\theta}{360°} \\times 2\\pi r$ | $r\\theta$ |
| Sector area | $\\frac{\\theta}{360°} \\times \\pi r^2$ | $\\frac{1}{2}r^2\\theta$ |

**Key theorems:**
- **Inscribed angle** = ½ × central angle (on the same arc)
- **Thales' theorem**: Angle in a semicircle = 90°
- **Intersecting chords**: $AP \\cdot PB = CP \\cdot PD$`,
    },

    {
      type: 'js',
      instruction: `### Arc Length and Sector Area Explorer

Drag the angle slider and the radius slider. Both arc length and sector area update instantly using the fraction-of-circle idea. Switch between degrees and radians to see how the radian formulas $s = r\\theta$ and $A = \\frac{1}{2}r^2\\theta$ simplify the calculations.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:12px;flex-wrap:wrap;align-items:center">
  <label style="font-family:Georgia,serif;font-size:12px">Radius r: <input type="range" id="circR" min="2" max="10" value="6" style="width:100px"> <span id="rV">6</span></label>
  <label style="font-family:Georgia,serif;font-size:12px">Angle θ: <input type="range" id="circTheta" min="1" max="359" value="90" style="width:120px"> <span id="tV">90</span>°</label>
  <label style="font-family:Georgia,serif;font-size:12px"><input type="checkbox" id="useRad"> Show in radians</label>
</div>
<canvas id="cv" width="700" height="250"></canvas>
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

var SCALE=18;

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var r=parseInt(document.getElementById('circR').value);
  var deg=parseInt(document.getElementById('circTheta').value);
  var useRad=document.getElementById('useRad').checked;
  document.getElementById('rV').textContent=r;
  document.getElementById('tV').textContent=deg;

  var cx=W/2,cy=H/2+20;
  var rs=r*SCALE;
  var rad=deg*Math.PI/180;

  // Full circle outline
  ctx.beginPath();ctx.arc(cx,cy,rs,0,Math.PI*2);
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.stroke();

  // Sector fill
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,rs,-Math.PI/2,-Math.PI/2+rad);ctx.closePath();
  ctx.fillStyle='#1e3a5f33';ctx.fill();

  // Arc (thicker)
  ctx.beginPath();ctx.arc(cx,cy,rs,-Math.PI/2,-Math.PI/2+rad);
  ctx.strokeStyle='#dc2626';ctx.lineWidth=3;ctx.stroke();

  // Radii
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,cy-rs);ctx.stroke();
  var ex=cx+rs*Math.sin(rad),ey=cy-rs*Math.cos(rad);
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();

  // Labels
  ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText('r='+r,cx+rs/2*Math.sin(rad/2)+12,cy-rs/2*Math.cos(rad/2));

  // Computations
  var frac=deg/360;
  var arcLen=(frac*2*Math.PI*r).toFixed(2);
  var secArea=(frac*Math.PI*r*r).toFixed(2);
  var thetaRad=(deg*Math.PI/180).toFixed(3);

  var html='';
  if(!useRad){
    html='<b>Arc length</b> = (θ/360°)×2πr = ('+deg+'/360)×2π×'+r+' ≈ <b>'+arcLen+'</b>';
    html+='&emsp;|&emsp;<b>Sector area</b> = (θ/360°)×πr² = ('+deg+'/360)×π×'+r+'² ≈ <b>'+secArea+'</b>';
  } else {
    html='θ = '+thetaRad+' rad&emsp;|&emsp;<b>Arc</b> = rθ = '+r+'×'+thetaRad+' ≈ <b>'+arcLen+'</b>&emsp;|&emsp;<b>Sector</b> = ½r²θ = ½×'+r+'²×'+thetaRad+' ≈ <b>'+secArea+'</b>';
  }
  document.getElementById('info').innerHTML=html;
}

['circR','circTheta','useRad'].forEach(function(id){
  document.getElementById(id).addEventListener('input',draw);
  document.getElementById(id).addEventListener('change',draw);
});
draw();`,
      outputHeight: 380,
    },

    {
      type: 'js',
      instruction: `### Inscribed Angle Theorem

Drag point P around the circle. The inscribed angle at P always equals exactly half the central angle O, no matter where P is on the major arc. When P lands on the semicircle (diameter as chord), the inscribed angle snaps to 90° — Thales' Theorem.`,
      html: `<canvas id="cv" width="700" height="280"></canvas>
<div id="info" style="padding:8px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc)"></div>`,
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

var cx=W/2,cy=H/2+10,R=110;
var pAngle=Math.PI*1.5; // point P angle on circle
var dragging=false;

function ptOnCircle(a){return {x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)};}
// Fixed chord endpoints: A at top-left, B at top-right
var aAngle=-Math.PI*0.75, bAngle=-Math.PI*0.25;
var A=ptOnCircle(aAngle), B=ptOnCircle(bAngle);

function angleDeg(vx,vy,ux,uy){
  var dot=vx*ux+vy*uy,m1=Math.sqrt(vx*vx+vy*vy),m2=Math.sqrt(ux*ux+uy*uy);
  return Math.acos(Math.max(-1,Math.min(1,dot/(m1*m2))))*180/Math.PI;
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  // Circle
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.stroke();
  // Center O
  ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);ctx.fillStyle=NAVY;ctx.fill();
  ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText('O',cx,cy-10);
  // Central angle arc
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(A.x,A.y);ctx.moveTo(cx,cy);ctx.lineTo(B.x,B.y);
  ctx.strokeStyle=NAVY;ctx.lineWidth=2;ctx.stroke();
  var centralDeg=angleDeg(A.x-cx,A.y-cy,B.x-cx,B.y-cy);
  // Chord A-B
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.stroke();
  // A, B dots
  [A,B].forEach(function(p,i){
    ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fillStyle=NAVY;ctx.fill();
    ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText(i===0?'A':'B',p.x+(i===0?-14:14),p.y+4);
  });
  // P on circle
  var P=ptOnCircle(pAngle);
  ctx.beginPath();ctx.arc(P.x,P.y,6,0,Math.PI*2);ctx.fillStyle=RED;ctx.fill();
  ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText('P',P.x+14,P.y);
  // Inscribed angle lines
  ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(A.x,A.y);ctx.moveTo(P.x,P.y);ctx.lineTo(B.x,B.y);
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.stroke();
  var inscribedDeg=angleDeg(A.x-P.x,A.y-P.y,B.x-P.x,B.y-P.y);
  // Info
  document.getElementById('info').innerHTML=
    '<b style="color:#1e3a5f">Central angle (at O): '+centralDeg.toFixed(1)+'°</b>&emsp;|&emsp;'
    +'<b style="color:#dc2626">Inscribed angle (at P): '+inscribedDeg.toFixed(1)+'°</b>'
    +'&emsp;→&emsp;Inscribed = ½ × Central: '+(inscribedDeg*2).toFixed(1)+'° ≈ '+centralDeg.toFixed(1)+'°'
    +(centralDeg>178?'&emsp;<b>⬅ Diameter! Inscribed angle = 90° (Thales)</b>':'');
}

cv.addEventListener('mousedown',function(e){var r=cv.getBoundingClientRect();var mx=e.clientX-r.left,my=e.clientY-r.top;var P=ptOnCircle(pAngle);if(Math.hypot(mx-P.x,my-P.y)<16){dragging=true;}});
cv.addEventListener('mousemove',function(e){if(!dragging)return;var r=cv.getBoundingClientRect();var mx=e.clientX-r.left,my=e.clientY-r.top;pAngle=Math.atan2(my-cy,mx-cx);draw();});
cv.addEventListener('mouseup',function(){dragging=false;});
draw();`,
      outputHeight: 360,
    },

    {
      type: 'challenge',
      instruction: `A circle has radius $5$ cm. A sector has central angle $72°$. What is the arc length of the sector?`,
      options: [
        { label: 'A', text: '$2\\pi$ cm' },
        { label: 'B', text: '$4\\pi$ cm' },
        { label: 'C', text: '$5\\pi$ cm' },
        { label: 'D', text: '$10\\pi$ cm' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Arc = (θ/360°) × 2πr = (72/360) × 2π × 5 = (1/5) × 10π = 2π cm. In radians: θ = 72° × (π/180) = 2π/5 rad, arc = rθ = 5 × 2π/5 = 2π cm.',
      failMessage: 'Arc = (θ/360°) × 2πr = (72/360) × 2π × 5. Since 72/360 = 1/5, arc = (1/5) × 10π = 2π cm. Check: the full circumference is 2π×5 = 10π, and 1/5 of that is 2π.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `An inscribed angle intercepts an arc. The central angle for the same arc is $140°$. What is the inscribed angle?`,
      options: [
        { label: 'A', text: '$140°$' },
        { label: 'B', text: '$70°$' },
        { label: 'C', text: '$280°$' },
        { label: 'D', text: '$35°$' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Inscribed angle = ½ × central angle = ½ × 140° = 70°. This theorem holds regardless of where the inscribed angle vertex sits on the major arc.',
      failMessage: 'Inscribed angle = ½ × central angle = ½ × 140° = 70°. The inscribed angle is always exactly half the central angle subtending the same arc.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-6-2',
  slug: 'circles',
  chapter: 'geometry-6',
  subject: 'Geometry',
  title: 'Circles: Arcs, Chords, and Sectors',
  subtitle: 'How the circle\'s perfect symmetry produces exact formulas for every part of it',
  tags: ['geometry', 'circles', 'arc-length', 'sector-area', 'chord', 'inscribed-angle', 'central-angle'],
  hook: {
    question: 'How much pizza do you get with a 60° slice? And how long is its crust?',
    realWorldContext: 'Arc length and sector area determine the material in a pie slice, the sweep of a windshield wiper, the length of a curved road, and the coverage area of a rotating sprinkler. Every engineering problem involving circular motion comes down to these two formulas.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Circle anatomy.** A circle of radius $r$ has circumference $C = 2\\pi r$ (the total perimeter) and area $A = \\pi r^2$. These formulas are the foundation for every partial-circle calculation.',
          'A **central angle** has its vertex at the center. An **arc** is the portion of the circle between two points — the arc\'s length is proportional to the central angle. A **chord** is a straight-line segment connecting two points on the circle. A **sector** is the "pie slice" region bounded by two radii and an arc.',
        ],
      },
      {
        type: 'image',
        src: geoCirclePartsUrl,
        alt: 'Circle diagram showing: center O, radius to point A (red), chord BC (green), arc AD (purple), sector (shaded pie slice), inscribed angle at E (orange dashed). Legend box shows inscribed angle = ½ central angle.',
        caption: 'Circle vocabulary: radius, chord, arc, sector, central angle, inscribed angle. Key theorem: inscribed angle = ½ × central angle subtending the same arc.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Arc length.** An arc of central angle $\\theta$ (in degrees) is $\\frac{\\theta}{360°}$ of the full circle. Its length is that fraction of the circumference:',
        ],
      },
      {
        type: 'math',
        tex: '\\ell = \\frac{\\theta}{360°} \\times 2\\pi r = \\frac{\\theta \\pi r}{180°}',
        caption: 'Arc length — fraction of circumference. In radians: ℓ = rθ (the cleanest form)',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Sector area.** The sector (pie slice) is the same fraction of the full disk area:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{sector}} = \\frac{\\theta}{360°} \\times \\pi r^2',
        caption: 'Sector area — fraction of circle area. In radians: A = ½r²θ',
      },
      {
        type: 'prose',
        paragraphs: [
          'In radians, these formulas become $\\ell = r\\theta$ and $A = \\frac{1}{2}r^2\\theta$ — much simpler, which is why radians are the preferred unit in calculus and physics.',
        ],
      },
      {
        type: 'viz',
        id: 'G2_6_ArcSectorPi',
        title: 'Arc Length and Sector Area',
        mathBridge: 'Adjust the central angle from $0°$ to $360°$. The arc length grows proportionally — at $180°$ it is exactly half the circumference, at $360°$ it equals the full circumference. The sector area grows as the square of the angle fraction — watch how $\\frac{1}{2}$ the circle has $\\frac{1}{2}$ the area. Try $\\theta = 60°$: arc $= \\frac{60}{360} \\times 2\\pi r = \\frac{\\pi r}{3}$.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Central angles and inscribed angles.** The **inscribed angle theorem** is one of the most useful circle theorems: an inscribed angle (vertex ON the circle) is exactly half the central angle that subtends the same arc.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Inscribed angle} = \\frac{1}{2} \\times \\text{Central angle (same arc)}',
        caption: 'The inscribed angle theorem — any angle inscribed in a semicircle is exactly 90°',
      },
      {
        type: 'prose',
        paragraphs: [
          'A special case: any angle inscribed in a **semicircle** (the arc being a diameter, central angle $180°$) equals $\\frac{1}{2} \\times 180° = 90°$. This is Thales\' Theorem: every angle inscribed in a semicircle is a right angle.',
          '**Chord relationships.** A chord cuts the circle into two arcs. Key theorems:',
          '— **Equal chords subtend equal arcs** (and vice versa).',
          '— **Perpendicular bisector of a chord passes through the center.** This is how you find the center of a circle given three points on it.',
          '— **Two chords that intersect inside a circle:** if chords $AB$ and $CD$ intersect at $P$, then $AP \\cdot PB = CP \\cdot PD$ (the "intersecting chords theorem").',
        ],
      },
      {
        type: 'math',
        tex: 'AP \\cdot PB = CP \\cdot PD',
        caption: 'Intersecting chords — the product of the two segments is equal for both chords',
      },
      {
        type: 'viz',
        id: 'G2_1_CircleTheorems1',
        title: 'Circle Theorems: Central and Inscribed Angles',
        mathBridge: 'Move the inscribed angle vertex around the circle. It always equals half the central angle, regardless of where the vertex is on the circle. Slide the point to the endpoint of the diameter: the inscribed angle becomes exactly 90°, confirming Thales\' Theorem.',
      },
      {
        type: 'viz',
        id: 'G2_2_CircleTheorems2',
        title: 'Circle Theorems: Chords and Tangents',
        mathBridge: 'Drag the two chords inside the circle. The products $AP \\cdot PB$ and $CP \\cdot PD$ are always equal, no matter where you position the chords. This is the intersecting chords theorem in action.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_6_2 },
        mathBridge: 'Drag the arc and radius sliders to compute any arc length or sector area instantly. Then drag point P around the circle to see the inscribed angle theorem update in real time — it always holds at exactly half the central angle, until the chord becomes a diameter and the angle snaps to 90°.',
      },
    ],
  },
  mentalModel: [
    'Arc and sector are the same fraction of the full circle: arc length = (θ/360°)×2πr, sector area = (θ/360°)×πr²',
    'In radians: arc = rθ, sector area = ½r²θ — the natural unit for circle calculations',
    'Inscribed angle theorem: inscribed angle = ½ central angle on the same arc. Inscribed in semicircle = 90° (Thales)',
    'Intersecting chords: AP·PB = CP·PD — the products of each chord\'s two segments are always equal',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A circle has radius $6$ cm. What is the arc length of a $90°$ sector?',
      options: ['$3\\pi$ cm', '$6\\pi$ cm', '$9\\pi$ cm'],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A circle has radius $10$ cm. What is the area of a $120°$ sector?',
      options: ['$\\frac{100\\pi}{3}$ cm²', '$40\\pi$ cm²', '$50\\pi$ cm²'],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'An inscribed angle intercepts an arc of $140°$. The inscribed angle measures…',
      options: ['$140°$', '$70°$', '$280°$'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: "Thales' Theorem states that any angle inscribed in a semicircle is…",
      options: ['$60°$', '$90°$', '$180°$'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Two chords intersect inside a circle. One chord is split into segments $3$ and $8$. The other chord is split into segments $4$ and $x$. What is $x$?',
      options: ['6', '4', '12'],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'Why does the perpendicular bisector of any chord always pass through the center?',
      options: [
        'By convention — it is defined that way',
        'The center is equidistant from all points on the circle, so it lies on the perpendicular bisector of any chord (the set of equidistant points from the chord\'s endpoints)',
        'This is only true for diameters',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'A central angle of $\\frac{\\pi}{3}$ radians has arc length $r \\cdot \\frac{\\pi}{3}$. If $r = 9$ cm, the arc length is…',
      options: ['$3\\pi$ cm', '$6\\pi$ cm', '$9$ cm'],
      correct: 0,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Two arcs in the same circle are equal in length if and only if…',
      options: [
        'Their chords are perpendicular',
        'Their central angles are equal',
        'The arcs both lie in the same semicircle',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'A windshield wiper of length $40$ cm sweeps through $150°$. What area does it clean?',
      options: ['$\\frac{2000\\pi}{3}$ cm²', '$100\\pi$ cm²', '$\\frac{1000\\pi}{3}$ cm²'],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'The sector area formula $A = \\frac{1}{2}r^2\\theta$ (in radians) resembles the triangle area $\\frac{1}{2}bh$. Why?',
      options: [
        'A sector can be cut and rearranged into a triangle of the same area',
        'As the angle gets very small, the sector becomes a thin triangle with base $r\\theta$ (the arc) and height $r$ — the areas converge',
        'The two formulas are not related',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_6_2 };
