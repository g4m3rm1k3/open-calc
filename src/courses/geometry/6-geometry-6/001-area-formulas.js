import geoAreaFormulasUrl from '../diagrams/geo-area-formulas.svg?url'

const LESSON_GEO_6_1 = {
  title: 'Mastering Area Formulas',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### One Idea, Every Shape

All polygon areas come from the rectangle. The secret is **shear invariance**: sliding the top of a parallelogram sideways doesn't change the area — only base × perpendicular height matters.

| Shape | Area Formula | Derivation |
|---|---|---|
| Rectangle | $A = bh$ | Definition |
| Parallelogram | $A = bh$ | Shear the rectangle |
| Triangle | $A = \\frac{1}{2}bh$ | Half a parallelogram |
| Trapezoid | $A = \\frac{1}{2}(b_1+b_2)h$ | Two triangles |
| Regular $n$-gon | $A = \\frac{1}{2}pa$ | $p$ = perimeter, $a$ = apothem |
| Circle | $A = \\pi r^2$ | Regular $n$-gon as $n\\to\\infty$ |

**Critical rule**: height always means the *perpendicular* distance — never the slant side.`,
    },

    {
      type: 'js',
      instruction: `### Area Formula Explorer

Select a shape and drag its dimensions. The diagram updates live and shows the exact derivation from the rectangle. Notice: the parallelogram formula is identical to the rectangle — only the height counts, not the slant.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;gap:12px;flex-wrap:wrap;align-items:center">
  <select id="aShape" style="padding:5px 10px;border-radius:6px;border:1.5px solid #1e3a5f;font-family:Georgia,serif;font-size:13px">
    <option value="rect">Rectangle</option>
    <option value="para">Parallelogram</option>
    <option value="tri">Triangle</option>
    <option value="trap">Trapezoid</option>
    <option value="circle">Circle</option>
  </select>
  <label style="font-family:Georgia,serif;font-size:12px">Base: <input type="range" id="aBase" min="2" max="14" value="8" style="width:100px"> <span id="aBaseV">8</span></label>
  <label style="font-family:Georgia,serif;font-size:12px">Height: <input type="range" id="aHeight" min="2" max="10" value="5" style="width:100px"> <span id="aHeightV">5</span></label>
  <label id="b2wrap" style="font-family:Georgia,serif;font-size:12px">Top base: <input type="range" id="aBase2" min="1" max="12" value="5" style="width:100px"> <span id="aBase2V">5</span></label>
</div>
<canvas id="cv" width="700" height="220"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:1.8"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height,pad=60,SCALE=16;


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
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var shape=document.getElementById('aShape').value;
  var b=parseInt(document.getElementById('aBase').value);
  var h=parseInt(document.getElementById('aHeight').value);
  var b2=parseInt(document.getElementById('aBase2').value);
  document.getElementById('aBaseV').textContent=b;
  document.getElementById('aHeightV').textContent=h;
  document.getElementById('aBase2V').textContent=b2;
  document.getElementById('b2wrap').style.display=(shape==='trap')?'':'none';
  var bs=b*SCALE, hs=h*SCALE, b2s=b2*SCALE;
  var cx=W/2, cy=H/2+30;
  var area=0, label='', formula='';
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;ctx.fillStyle='#1e3a5f22';

  if(shape==='rect'){
    var x0=cx-bs/2,y0=cy-hs;
    ctx.fillRect(x0,y0,bs,hs);ctx.strokeRect(x0,y0,bs,hs);
    // dimension lines
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(x0,cy+16);ctx.lineTo(x0+bs,cy+16);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x0-16,y0);ctx.lineTo(x0-16,cy);ctx.stroke();
    ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText('b = '+b,cx,cy+30);ctx.fillText('h = '+h,x0-28,y0+hs/2+5);
    area=b*h;formula='A = b×h = '+b+'×'+h+' = '+area;
  } else if(shape==='para'){
    var off=20,x0=cx-bs/2;
    ctx.beginPath();ctx.moveTo(x0,cy);ctx.lineTo(x0+bs,cy);ctx.lineTo(x0+bs+off,cy-hs);ctx.lineTo(x0+off,cy-hs);ctx.closePath();ctx.fill();ctx.stroke();
    // height dashed line
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(x0+bs,cy);ctx.lineTo(x0+bs,cy-hs);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText('b = '+b,cx,cy+22);ctx.fillText('h = '+h,x0+bs+20,cy-hs/2+5);
    area=b*h;formula='A = b×h = '+b+'×'+h+' = '+area+' (same as rectangle — shear does not change area)';
  } else if(shape==='tri'){
    var x0=cx-bs/2;
    ctx.beginPath();ctx.moveTo(x0,cy);ctx.lineTo(x0+bs,cy);ctx.lineTo(cx+20,cy-hs);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(cx+20,cy);ctx.lineTo(cx+20,cy-hs);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText('b = '+b,cx,cy+22);ctx.fillText('h = '+h,cx+20+18,cy-hs/2+5);
    area=0.5*b*h;formula='A = ½×b×h = ½×'+b+'×'+h+' = '+area;
  } else if(shape==='trap'){
    var x0=cx-bs/2, x1=cx-b2s/2, indent=(bs-b2s)/2;
    ctx.beginPath();ctx.moveTo(x0,cy);ctx.lineTo(x0+bs,cy);ctx.lineTo(x0+indent+b2s,cy-hs);ctx.lineTo(x0+indent,cy-hs);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(x0+bs,cy);ctx.lineTo(x0+bs,cy-hs);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText('b₁='+b,cx,cy+22);ctx.fillText('b₂='+b2,cx,cy-hs-12);ctx.fillText('h='+h,x0+bs+22,cy-hs/2+5);
    area=0.5*(b+b2)*h;formula='A = ½(b₁+b₂)h = ½('+b+'+'+b2+')×'+h+' = '+area;
  } else if(shape==='circle'){
    var r=b,rs=r*SCALE/2;
    ctx.beginPath();ctx.arc(cx,cy-rs,rs,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(cx,cy-rs);ctx.lineTo(cx+rs,cy-rs);ctx.stroke();
    ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText('r = '+r,cx+rs/2,cy-rs+16);
    area=(Math.PI*r*r).toFixed(2);formula='A = πr² = π×'+r+'² ≈ '+area;
  }

  document.getElementById('info').innerHTML='<b style="color:#1e3a5f">'+formula+'</b>';
}

['aShape','aBase','aHeight','aBase2'].forEach(function(id){
  document.getElementById(id).addEventListener('change',draw);
  document.getElementById(id).addEventListener('input',draw);
});
draw();`,
      outputHeight: 380,
    },

    {
      type: 'js',
      instruction: `### Proof: Why Triangle Area = ½ × base × height

Drag the slider to rotate a copy of the triangle. Two congruent triangles always form a parallelogram — so every triangle has exactly half the area of the surrounding parallelogram.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;align-items:center;gap:12px">
  <span style="font-family:Georgia,serif;font-size:13px">Rotation:</span>
  <input type="range" id="rot" min="0" max="180" value="0" style="width:200px">
  <span id="rotLbl" style="font-family:Georgia,serif;font-size:13px;color:#1e3a5f">0°</span>
</div>
<canvas id="cv" width="700" height="240"></canvas>
<div id="info" style="padding:8px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc)"></div>`,
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

var rotEl=document.getElementById('rot');
var rotLbl=document.getElementById('rot').nextElementSibling||document.getElementById('rotLbl');

// Original triangle vertices: bottom-left, bottom-right, apex
var A={x:-100,y:60},B={x:100,y:60},C={x:30,y:-70};
var mx=(B.x+C.x)/2, my=(B.y+C.y)/2;

function rotPt(p,angle,ox,oy){
  var dx=p.x-ox,dy=p.y-oy,rad=angle*Math.PI/180;
  return {x:ox+dx*Math.cos(rad)-dy*Math.sin(rad),y:oy+dx*Math.sin(rad)+dy*Math.cos(rad)};
}

function drawTri(pts,fill,stroke){
  ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);ctx.lineTo(pts[1].x,pts[1].y);ctx.lineTo(pts[2].x,pts[2].y);ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var angle=parseInt(rotEl.value);
  document.getElementById('rotLbl').textContent=angle+'°';
  var cx=W/2,cy=H/2+20;
  var orig=[{x:cx+A.x,y:cy+A.y},{x:cx+B.x,y:cy+B.y},{x:cx+C.x,y:cy+C.y}];
  // Rotate copy 180° around midpoint of hypotenuse (BC)
  var t=angle/180;
  var omx=cx+(mx),omy=cy+(my);
  var copyPts=orig.map(function(p){return rotPt(p,t*180,omx,omy);});
  drawTri(copyPts,'#1e3a5f33','#1e3a5f66');
  drawTri(orig,'#dc262622','#dc2626');
  // Labels
  ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.textAlign='center';
  ctx.fillText('Original triangle',cx+A.x/2+B.x/2,cy+A.y+20);
  ctx.fillStyle=NAVY;
  ctx.fillText('Rotated copy',omx,omy-80);
  if(angle===180){
    document.getElementById('info').innerHTML='<b>Two triangles form a parallelogram</b> — so triangle area = ½ × parallelogram area = ½bh ✓';
  } else {
    document.getElementById('info').innerHTML='Rotate the copy 180° around the midpoint of side BC to see the proof.';
  }
}
rotEl.addEventListener('input',draw);
draw();`,
      outputHeight: 340,
    },

    {
      type: 'challenge',
      instruction: `A trapezoid has parallel sides of $6$ cm and $10$ cm, and a perpendicular height of $8$ cm. Find its area.`,
      options: [
        { label: 'A', text: '$64$ cm²' },
        { label: 'B', text: '$48$ cm²' },
        { label: 'C', text: '$80$ cm²' },
        { label: 'D', text: '$32$ cm²' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. A = ½(b₁ + b₂) × h = ½(6 + 10) × 8 = ½ × 16 × 8 = 64 cm². The trapezoid formula is the average of the two bases times the height.',
      failMessage: 'A = ½(b₁ + b₂) × h = ½(6 + 10) × 8 = ½ × 16 × 8 = 64 cm². Think of it as a rectangle with base equal to the average of the two parallel sides.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `A parallelogram has base $12$ m and slant side $7$ m. The perpendicular height is $5$ m. What is the area?`,
      options: [
        { label: 'A', text: '$84$ m² (using slant side)' },
        { label: 'B', text: '$60$ m² (using perpendicular height)' },
        { label: 'C', text: '$35$ m² (using slant × height)' },
        { label: 'D', text: '$42$ m² (using half of slant × base)' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A = b × h = 12 × 5 = 60 m². The slant side of 7 m is irrelevant — height always means perpendicular distance. Using the slant is the most common area mistake.',
      failMessage: 'A = b × h = 12 × 5 = 60 m². The 7 m slant side is a trap — height means perpendicular height. The formula A = b × slant would give the wrong answer every time.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-6-1',
  slug: 'area-formulas',
  chapter: 'geometry-6',
  subject: 'Geometry',
  title: 'Mastering Area Formulas',
  subtitle: 'Every polygon area derives from one idea — and that idea is a rectangle',
  tags: ['geometry', 'area', 'triangle', 'parallelogram', 'trapezoid', 'regular-polygon'],
  hook: {
    question: 'If you only know the area formula for a rectangle, can you derive all the others?',
    realWorldContext: 'Flooring, paint coverage, land surveys, fabric cutting — every area calculation in the real world reduces to a formula. Understanding where these formulas come from (not just memorizing them) means you can never forget them.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**All area formulas derive from the rectangle.** A rectangle with width $w$ and height $h$ has area $A = wh$. Every other polygon area formula is obtained by cutting rectangles, rearranging pieces, or comparing to a rectangle. This is not a coincidence — it is the foundational idea behind all area measurement.',
        ],
      },
      {
        type: 'image',
        src: geoAreaFormulasUrl,
        alt: 'Area formula derivations: rectangle A=bh, parallelogram (shear keeps same area), triangle (half parallelogram), circle (limit of regular polygon = πr²), trapezoid A=½(a+b)h, sector A=½r²θ, Heron\'s formula.',
        caption: 'One formula, all shapes: A = b×h is the seed. Shear → parallelogram. Diagonal → triangle. Average base → trapezoid. Unrolled sectors → circle πr².',
      },
      {
        type: 'math',
        tex: 'A_{\\text{rectangle}} = w \\times h = bh',
        caption: 'The starting point for all area formulas',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Parallelogram.** A parallelogram has a base $b$ and a height $h$ (the perpendicular distance between the base and the opposite side — NOT the slant side length). If you cut a right triangle from one end and attach it to the other, you get a rectangle of the same base and height. Therefore:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{parallelogram}} = b \\times h',
        caption: 'Same formula as a rectangle — the slant does not change the area',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Triangle.** A triangle is exactly half a parallelogram. Any triangle can be duplicated and rotated to form a parallelogram with the same base and height. So the triangle\'s area is half the parallelogram\'s:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{triangle}} = \\frac{1}{2} b h',
        caption: 'Half the parallelogram — and h is always the perpendicular height, never the slant side',
      },
      {
        type: 'viz',
        id: 'G2_5_AreaFormulas',
        title: 'Area Formula Explorer',
        mathBridge: 'Watch the triangle and parallelogram transform. When you duplicate and rotate a triangle, it locks into a parallelogram of equal base and height — that\'s where the $\\frac{1}{2}$ comes from. Try a right triangle, an obtuse triangle, and an acute triangle: all give $\\frac{1}{2}bh$. The formula is blind to the type of triangle.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Trapezoid.** A trapezoid has two parallel sides (called **bases**) $b_1$ and $b_2$, and a perpendicular height $h$ between them. Duplicate the trapezoid, rotate it $180°$, and attach it to get a parallelogram with base $b_1 + b_2$ and height $h$. The original trapezoid is half that parallelogram:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{trapezoid}} = \\frac{1}{2}(b_1 + b_2)h',
        caption: 'Average the two bases, multiply by height — or think of it as half a parallelogram',
      },
      {
        type: 'prose',
        paragraphs: [
          'Notice the pattern: the trapezoid formula averages the two bases. A parallelogram is a special trapezoid where $b_1 = b_2 = b$, giving $\\frac{1}{2}(b + b)h = bh$. A triangle is a trapezoid where $b_2 = 0$, giving $\\frac{1}{2}(b + 0)h = \\frac{1}{2}bh$. One formula contains all three.',
          '**Rhombus.** A rhombus (all sides equal) has diagonals $d_1$ and $d_2$ that are perpendicular bisectors of each other. The four triangles formed by the diagonals fill the rhombus exactly — their total area is $4 \\times \\frac{1}{2} \\cdot \\frac{d_1}{2} \\cdot \\frac{d_2}{2} = \\frac{d_1 d_2}{2}$:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{rhombus}} = \\frac{d_1 \\cdot d_2}{2}',
        caption: 'Half the product of the diagonals — works for any quadrilateral with perpendicular diagonals',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Regular polygon.** A regular polygon with $n$ sides of length $s$ can be divided into $n$ congruent isosceles triangles from the center. The **apothem** $a$ is the perpendicular distance from the center to the midpoint of each side (the height of each triangle). Each triangle has base $s$ and height $a$, so:',
        ],
      },
      {
        type: 'math',
        tex: 'A_{\\text{regular polygon}} = \\frac{1}{2} \\times \\text{perimeter} \\times a = \\frac{1}{2} P a',
        caption: 'n triangles each with area ½·s·a, summed: ½·(ns)·a = ½Pa',
      },
      {
        type: 'prose',
        paragraphs: [
          'As $n \\to \\infty$, the perimeter $P \\to 2\\pi r$ (the circumference) and the apothem $a \\to r$ (the radius), so $A \\to \\frac{1}{2}(2\\pi r)(r) = \\pi r^2$ — the area of a circle. The circle formula is the limit of the polygon formula.',
        ],
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_6_1 },
        mathBridge: 'Select any polygon shape and drag its dimensions to see the area formula apply. The triangle proof cell shows two congruent triangles rotating into a parallelogram — making ½bh visually inevitable. Notice how every formula traces back to the rectangle.',
      },
    ],
  },
  mentalModel: [
    'All polygon areas derive from the rectangle: parallelogram = rearranged rectangle; triangle = ½ parallelogram; trapezoid = ½(b₁+b₂)h',
    'Height always means perpendicular distance — never the slant side. Wrong height = wrong area.',
    'Regular polygon area = ½ × perimeter × apothem. As n→∞ this becomes πr² (the circle)',
    'The trapezoid formula ½(b₁+b₂)h generalizes: set b₂=0 for a triangle, b₁=b₂=b for a parallelogram',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A parallelogram has base $10$ cm and slant height $6$ cm. The perpendicular height is $5$ cm. What is its area?',
      options: ['60 cm²', '50 cm²', '30 cm²'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is the area formula for a parallelogram $bh$ and not $b \\times \\text{slant side}$?',
      options: [
        'Slant side and height are always equal in a parallelogram',
        'Area measures how much flat surface is covered — perpendicular height is the correct dimension, not the slant',
        'The formula was defined that way by convention',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A triangle has base $12$ m and height $7$ m. Its area is…',
      options: ['84 m²', '42 m²', '21 m²'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A trapezoid has parallel sides of $5$ and $9$ cm, and height $4$ cm. Its area is…',
      options: ['56 cm²', '28 cm²', '36 cm²'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'The trapezoid area formula $\\frac{1}{2}(b_1 + b_2)h$ reduces to $\\frac{1}{2}bh$ when…',
      options: [
        '$b_1 = b_2$',
        '$b_2 = 0$ (one base shrinks to zero, making it a triangle)',
        '$h = 0$',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A rhombus has diagonals of $8$ and $10$ cm. Its area is…',
      options: ['80 cm²', '40 cm²', '18 cm²'],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'The apothem of a regular polygon is…',
      options: [
        'The length of each side',
        'The perpendicular distance from the center to the midpoint of a side',
        'The distance from one vertex to the opposite vertex',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A regular hexagon has perimeter $48$ cm and apothem $4\\sqrt{3}$ cm. Its area is…',
      options: ['$96\\sqrt{3}$ cm²', '$48\\sqrt{3}$ cm²', '$192\\sqrt{3}$ cm²'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'As the number of sides $n$ of a regular polygon increases without bound, its area formula $\\frac{1}{2}Pa$ approaches…',
      options: ['$2\\pi r$', '$\\pi r^2$', '$4\\pi r^2$'],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A triangle is described as "half a parallelogram." What transformation proves this?',
      options: [
        'Rotating the triangle 180° around the midpoint of one side creates a congruent triangle that together with the original forms a parallelogram',
        'Scaling the triangle by a factor of 2',
        'Reflecting the triangle over its base',
      ],
      correct: 0,
    },
  ],
};

export { LESSON_GEO_6_1 };
