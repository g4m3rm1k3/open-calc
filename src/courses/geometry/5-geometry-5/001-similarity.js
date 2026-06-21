import geoSimilarTrianglesUrl from '../diagrams/geo-similar-triangles.svg?url'

const LESSON_GEO_5_1 = {
  title: 'Similarity and the AA Postulate',
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### The Deeper Geometry of Similarity

You know that two triangles are similar when their angles match. Now let's go further:

**The altitude-to-hypotenuse theorem.** Drop an altitude from the right angle of a right triangle to the hypotenuse. This creates **three similar triangles** — the original, the left sub-triangle, and the right sub-triangle. All three share the same angles and are mutually similar.

This is one of the most powerful results in elementary geometry: a single line segment creates geometric means, enables construction of square roots, and is the geometric foundation of trigonometry.`,
    },

    {
      type: 'js',
      instruction: `### Three Similar Triangles from One Altitude

Click on the hypotenuse to place point D (foot of the altitude from C). The three triangles △ABC, △ACD, △CBD are all similar to each other. Drag D along the hypotenuse and watch the ratios stay proportional.`,
      html: `<canvas id="cv" width="700" height="300" style="cursor:ew-resize"></canvas>
<div id="info" style="padding:10px 16px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0);line-height:1.8"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary,#f8fafc)}canvas{display:block;cursor:ew-resize}`,
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

// Right triangle ABC: A at left, B at right, C above on hypotenuse
var A={x:80,y:240},B={x:580,y:240};
var Cx=280; // position of C varies with D
var Dx=280; // foot of altitude
var drag=false;

function getC(dx){
  // C is directly above D such that angle ACB = 90 at C
  // C lies on semicircle with diameter AB
  var mx=(A.x+B.x)/2,my=(A.y+B.y)/2;
  var r=(B.x-A.x)/2;
  var distFromMid=dx-mx;
  var yOff=Math.sqrt(Math.max(0,r*r-distFromMid*distFromMid));
  return{x:dx,y:A.y-yOff};
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var C=getC(Dx);
  var D={x:Dx,y:A.y};

  // Compute sides
  var ab=B.x-A.x;
  var ad=D.x-A.x;
  var db=B.x-D.x;
  var cd=C.y<A.y?A.y-C.y:0;
  var ac=Math.hypot(C.x-A.x,C.y-A.y);
  var bc=Math.hypot(C.x-B.x,C.y-B.y);

  // Triangle △ABC
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.fillStyle='#1e3a5f15';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();
  ctx.fill();ctx.stroke();

  // Triangle △ACD (left sub)
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
  ctx.fillStyle='#dc262615';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(D.x,D.y);ctx.lineTo(C.x,C.y);ctx.closePath();
  ctx.fill();ctx.stroke();

  // Triangle △CBD (right sub)
  ctx.strokeStyle=GREEN;ctx.lineWidth=2;
  ctx.fillStyle='#1a3a2a15';
  ctx.beginPath();ctx.moveTo(B.x,B.y);ctx.lineTo(D.x,D.y);ctx.lineTo(C.x,C.y);ctx.closePath();
  ctx.fill();ctx.stroke();

  // Altitude CD
  ctx.strokeStyle=PURPLE;ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(C.x,C.y);ctx.lineTo(D.x,D.y);ctx.stroke();
  ctx.setLineDash([]);

  // Right angle at C mark
  ctx.strokeStyle=NAVY;ctx.lineWidth=1.5;
  var s=12;
  var v1={x:A.x-C.x,y:A.y-C.y},v2={x:B.x-C.x,y:B.y-C.y};
  var l1=Math.hypot(v1.x,v1.y),l2=Math.hypot(v2.x,v2.y);
  v1={x:v1.x/l1*s,y:v1.y/l1*s};v2={x:v2.x/l2*s,y:v2.y/l2*s};
  ctx.strokeRect(C.x+v1.x-s/2,C.y+v1.y-s/2,s,s);

  // Right angle at D
  ctx.strokeRect(D.x-s/2,D.y-s,s,s);

  // Labels
  function label(p,t,col,ox,oy){ctx.fillStyle=col;ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.fillText(t,p.x+ox,p.y+oy);}
  label(A,'A','#374151',-12,0);
  label(B,'B','#374151',12,0);
  label(C,'C','#374151',0,-12);
  label(D,'D','#7c3aed',0,18);

  // Drag handle on D
  ctx.beginPath();ctx.arc(D.x,D.y,7,0,Math.PI*2);ctx.fillStyle=PURPLE;ctx.fill();

  var ac_=ac.toFixed(1),bc_=bc.toFixed(1),ab_=ab.toFixed(1),ad_=ad.toFixed(1),db_=db.toFixed(1),cd_=cd.toFixed(1);
  document.getElementById('info').innerHTML=
    'AD = <b>'+ad_+'</b>, DB = <b>'+db_+'</b>, CD = <b>'+cd_+'</b>'
    +'<br>Geometric mean: CD² = AD·DB = '+ad_+'×'+db_+' = <b>'+(ad*db).toFixed(0)+'</b>;  CD² = '+(cd*cd).toFixed(0)+' ✓'
    +'<br>△ACD ~ △ABC ~ △CBD &emsp; ← all three triangles share the same angles';
}

cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*(W/r.width);
  if(Math.abs(px-Dx)<20){drag=true;}
});
cv.addEventListener('mousemove',function(e){
  if(!drag)return;
  var r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*(W/r.width);
  Dx=Math.max(A.x+20,Math.min(B.x-20,px));
  draw();
});
cv.addEventListener('mouseup',function(){drag=false;});
draw();`,
      outputHeight: 420,
    },

    {
      type: 'js',
      instruction: `### Trig Ratios as Similarity Ratios

Adjust the angle θ. In every right triangle with angle θ — regardless of size — the ratio opposite/hypotenuse is always the same number. That number is **sin θ**. The ratio adjacent/hypotenuse is **cos θ**. Trig functions ARE similarity ratios.`,
      html: `<div style="padding:8px 14px;background:var(--color-background-secondary,#f8fafc);display:flex;align-items:center;gap:12px">
  <span style="font-family:Georgia,serif;font-size:13px">Angle θ:</span>
  <input type="range" id="angleSlider" min="10" max="80" value="30" style="width:200px">
  <span id="angleLbl" style="font-family:Georgia,serif;font-size:14px;font-weight:700;color:#1e3a5f">30°</span>
</div>
<canvas id="cv" width="700" height="270"></canvas>
<div id="info" style="padding:8px 16px;font-family:Georgia,serif;font-size:13px;text-align:center;background:var(--color-background-secondary,#f8fafc);border-top:1px solid var(--color-border-primary,#e2e8f0)"></div>`,
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

var sl=document.getElementById('angleSlider');
var lbl=document.getElementById('angleLbl');
var colors=['#1e3a5f','#dc2626','#1a3a2a'];
var sizes=[180,120,70];

function draw(){
  var deg=parseInt(sl.value);
  lbl.textContent=deg+'°';
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var baseX=70,baseY=H-40;
  var rad=deg*Math.PI/180;

  sizes.forEach(function(hyp,i){
    var adj=hyp*Math.cos(rad);
    var opp=hyp*Math.sin(rad);
    var ox=baseX+i*20;
    // Right triangle: angle at left base
    ctx.strokeStyle=colors[i];ctx.lineWidth=2.5;
    ctx.fillStyle=colors[i]+'18';
    ctx.beginPath();
    ctx.moveTo(ox,baseY);
    ctx.lineTo(ox+adj,baseY);
    ctx.lineTo(ox+adj,baseY-opp);
    ctx.closePath();ctx.fill();ctx.stroke();
    // Angle arc
    ctx.strokeStyle=colors[i];ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(ox,baseY,20,0,-rad,true);ctx.stroke();
    // Label
    ctx.fillStyle=colors[i];ctx.font='bold 11px Georgia';ctx.textAlign='center';
    ctx.fillText('opp='+opp.toFixed(1),ox+adj+24,baseY-opp/2);
    ctx.fillText('adj='+adj.toFixed(1),ox+adj/2,baseY+14);
    ctx.fillText('hyp='+hyp,ox+adj/2-8,baseY-opp/2-6);
  });

  var s=Math.sin(rad),c=Math.cos(rad),t=Math.tan(rad);
  document.getElementById('info').innerHTML=
    'All three triangles have angle θ = '+deg+'° &nbsp;→&nbsp; '
    +'<b style="color:#1e3a5f">sin '+deg+'° = opp/hyp = '+s.toFixed(4)+'</b> &nbsp; '
    +'<b style="color:#dc2626">cos '+deg+'° = adj/hyp = '+c.toFixed(4)+'</b> &nbsp; '
    +'<b style="color:#1a3a2a">tan '+deg+'° = opp/adj = '+t.toFixed(4)+'</b>'
    +'<br><span style="color:#64748b;font-size:11px">Same ratio regardless of triangle size — trig IS similarity</span>';
}

sl.addEventListener('input',draw);
draw();`,
      outputHeight: 390,
    },

    {
      type: 'challenge',
      instruction: `In a right triangle with hypotenuse $c = 20$, the altitude to the hypotenuse has length $h = 8$. What are the two segments the altitude divides the hypotenuse into? (Hint: $h^2 = p \\cdot q$, $p + q = c$)`,
      options: [
        { label: 'A', text: '$p = 4$, $q = 16$' },
        { label: 'B', text: '$p = 10$, $q = 10$' },
        { label: 'C', text: '$p = 6$, $q = 14$' },
        { label: 'D', text: '$p = 8$, $q = 12$' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. h² = p·q gives 64 = p·q, and p+q = 20. Solving: p·(20−p) = 64 → 20p−p² = 64 → p²−20p+64 = 0 → (p−4)(p−16) = 0 → p = 4, q = 16.',
      failMessage: 'Use the geometric mean: h² = p·q and p + q = c. So 64 = p·q and p+q = 20. Substituting: p(20−p)=64. Solving the quadratic: p=4, q=16 (or vice versa).',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },

    {
      type: 'challenge',
      instruction: `Two similar triangles have areas $36$ cm² and $100$ cm². What is the ratio of their corresponding side lengths?`,
      options: [
        { label: 'A', text: '6:10' },
        { label: 'B', text: '3:5' },
        { label: 'C', text: '36:100' },
        { label: 'D', text: '6:10 and simplified to 3:5' },
      ],
      check: (label) => label === 'D',
      successMessage: 'Correct. Areas scale by k². The area ratio is 36:100, so k² = 36/100, giving k = 6/10 = 3/5. The side lengths are in ratio 3:5.',
      failMessage: 'Areas scale by k² (the square of the scale factor). Area ratio = 36/100, so k = √(36/100) = 6/10 = 3/5. Side ratio = 3:5.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 260,
    },
  ],
};

export default {
  id: 'geo-5-1',
  slug: 'similarity',
  chapter: 'geometry-5',
  subject: 'Geometry',
  title: 'Similarity and the AA Postulate',
  subtitle: 'Same shape, different size — and why two angles are enough to guarantee it',
  tags: ['geometry', 'similarity', 'AA-postulate', 'similar-triangles', 'scale-factor', 'proportional'],
  hook: {
    question: 'How do you know two triangles are the same shape without measuring all six parts?',
    realWorldContext: 'Architects scale blueprints. Photographers scale images. Surveyors measure inaccessible heights by shadow length. All of these use the fact that two triangles with equal angles are similar — and similar triangles have proportional sides. You can find the height of a tree or the width of a river without ever touching it.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Similar figures have the same shape but not necessarily the same size.** When you zoom in or out on a photo, you create a similar image: every angle is preserved, every length changes by the same scale factor. Two figures are **similar** (written $\\triangle ABC \\sim \\triangle DEF$) if:',
          '(1) All corresponding angles are equal, AND',
          '(2) All corresponding sides are proportional (same ratio between each pair).',
          'Both conditions always hold together — you do not need to check them separately if you know either one is true, as the AA Postulate will show.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**The scale factor.** If $\\triangle ABC \\sim \\triangle DEF$ with scale factor $k$, then every side of $\\triangle DEF$ is $k$ times the corresponding side of $\\triangle ABC$: $DE = k \\cdot AB$, $EF = k \\cdot BC$, $DF = k \\cdot AC$. Areas scale by $k^2$ (not $k$) because area is two-dimensional.',
        ],
      },
      {
        type: 'image',
        src: geoSimilarTrianglesUrl,
        alt: 'Two similar triangles: small 3-4-5 triangle ABC and large 6-8-10 triangle DEF. All angle pairs match. Side ratios all equal 1/2; scale factor k=2.',
        caption: 'Similar triangles △ABC ~ △DEF with k = 2. Every corresponding side ratio is the same constant k. Angles match exactly.',
      },
      {
        type: 'math',
        tex: '\\frac{DE}{AB} = \\frac{EF}{BC} = \\frac{DF}{AC} = k \\qquad \\text{and} \\qquad \\frac{\\text{Area}(DEF)}{\\text{Area}(ABC)} = k^2',
        caption: 'Scale factor k applies to sides; k² applies to areas',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The AA (Angle-Angle) Postulate.** If two angles of one triangle are equal to two angles of another triangle, then the triangles are similar.',
          'Why is two angles enough? Because the three angles of any triangle sum to 180°. If two angles match, the third must also match (180° minus the same two numbers always gives the same result). So two equal angles force all three to be equal — and equal angles force the sides to be proportional.',
          'The AA Postulate is the most useful similarity test because angles are often the easiest things to identify from a diagram (especially when parallel lines create equal alternate interior angles).',
        ],
      },
      {
        type: 'viz',
        id: 'G2_4_SimilarTriangles',
        title: 'Similar Triangles Explorer',
        mathBridge: 'Drag the vertices of both triangles. When two angle pairs match (watch the angle readouts), the side ratios become equal automatically. Try making a large and small triangle with the same angles — the scale factor $k$ appears in the side-ratio display. This confirms: AA → similar → proportional sides.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_5_1 },
        mathBridge: 'Drag point D along the hypotenuse in the altitude cell. Watch the geometric mean relationship: CD² = AD × DB at every position. Then use the trig cell to explore how sin, cos, tan are the same ratio regardless of triangle size — drag the angle and notice all three similar triangles give identical ratios.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Other similarity tests.** While AA is most common, there are two more:',
          '**SAS Similarity:** If two sides of one triangle are proportional to two sides of another, and the included angles are equal, the triangles are similar.',
          '**SSS Similarity:** If all three pairs of corresponding sides are proportional, the triangles are similar.',
          'Note: ASS (two sides and a non-included angle) does NOT guarantee similarity — this is the "ambiguous case," where two different triangles can satisfy the conditions.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Applications of similar triangles.** The most powerful use is indirect measurement — finding lengths that are difficult or impossible to measure directly.',
          '**Shadow method:** A person $1.8$ m tall casts a $2.4$ m shadow. A nearby tree casts a $14.4$ m shadow. The person and their shadow form a triangle similar to the tree and its shadow (both have a right angle at ground level, and the sun makes the same angle for both). So:',
        ],
      },
      {
        type: 'math',
        tex: '\\frac{\\text{tree height}}{\\text{tree shadow}} = \\frac{\\text{person height}}{\\text{person shadow}} \\quad \\Rightarrow \\quad h = \\frac{1.8 \\times 14.4}{2.4} = 10.8\\text{ m}',
        caption: 'Indirect measurement via similar triangles — the method surveyors and architects use',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Triangle Proportionality Theorem.** If a line is drawn parallel to one side of a triangle and intersects the other two sides, it divides those sides proportionally. This theorem is the reason that the midsegment of a triangle (connecting the midpoints of two sides) is parallel to the third side and exactly half its length.',
        ],
      },
    ],
  },
  mentalModel: [
    'Similar triangles: same shape, different size — equal angles AND proportional sides (the two always go together)',
    'AA Postulate: two equal angle pairs → similar. Since angles sum to 180°, two equal angles force the third to match',
    'Scale factor k: sides scale by k, areas scale by k². Always specify which triangle is which when writing a ratio',
    'Indirect measurement: similar triangle ratios let you find inaccessible lengths from measurable shadows or distances',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Two triangles are similar. One has sides 3, 4, 5. The other has a shortest side of 6. What is its longest side?',
      options: ['8', '10', '12'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The AA Postulate says two triangles are similar when…',
      options: [
        'All three angles and all three sides correspond',
        'Two pairs of corresponding angles are equal',
        'Two pairs of corresponding sides are proportional',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why is knowing two pairs of equal angles sufficient to conclude similarity?',
      options: [
        'Two angles determine the shape uniquely because the third is forced by the 180° rule',
        'Two angles are easier to measure than sides, so they are used for convenience',
        'Two angles guarantee equal sides, which guarantees similarity',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'If two similar triangles have a scale factor of 3, their areas differ by a factor of…',
      options: ['3', '6', '9'],
      correct: 2,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A 2 m stick casts a 3 m shadow. A flagpole casts an 18 m shadow. How tall is the flagpole?',
      options: ['9 m', '12 m', '27 m'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: '$\\triangle ABC \\sim \\triangle DEF$. If $AB = 4$, $DE = 10$, and $BC = 6$, what is $EF$?',
      options: ['15', '12', '8'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'The SAS Similarity theorem requires which of the following?',
      options: [
        'Two equal angles and one equal side',
        'Two proportional sides AND the included angle (between those sides) is equal',
        'Two proportional sides regardless of angle',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'The midsegment of a triangle connects the midpoints of two sides. It is always parallel to the third side and…',
      options: [
        'Equal in length to the third side',
        'Half the length of the third side',
        'One-third the length of the third side',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Which similarity test does NOT work? (The "ambiguous case")',
      options: ['AA', 'SSS Similarity', 'SSA (two sides and a non-included angle)'],
      correct: 2,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Two triangles have all three pairs of corresponding angles equal. Are they necessarily congruent?',
      options: [
        'Yes — equal angles force equal sides',
        'No — they are similar but may be different sizes (the scale factor may not be 1)',
        'Only if one angle is a right angle',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_5_1 };
