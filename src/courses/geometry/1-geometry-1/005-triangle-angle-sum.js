// Geometry · Chapter 1 · Lesson 5
// The Triangle Angle Sum
import geoTriangleAuxUrl from '../diagrams/geo-triangle-aux-line.svg?url'
import geoExteriorAngleUrl from '../diagrams/geo-exterior-angle.svg?url'
import quizTriangleFindUrl from '../diagrams/quiz-triangle-find-angle.svg?url'
import quizExteriorAngleUrl from '../diagrams/quiz-exterior-angle.svg?url'

const LESSON_GEO_1_5 = {
  title: "The Triangle Angle Sum",
  subtitle:
    "Why every triangle on a flat plane adds up to exactly 180° — and what happens when it doesn't.",
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: "markdown",
      instruction: `### The Fact Everyone Knows, and Almost Nobody Has Proven

Ask anyone who has taken geometry: the angles of a triangle sum to 180°. They know it. They've used it. They've computed hundreds of missing angles with it.

Ask them why it's true. Most will say: "Because it just is." Or: "I measured triangles and they always came out to 180°." Or: "My teacher told me."

None of those is a proof. Measurement gives evidence. Authority gives tradition. Proof gives certainty.

The proof of the triangle angle sum is one of the most elegant in elementary geometry — not because it's complicated, but because it's unexpectedly simple. It requires exactly one construction: draw a single line through one vertex of the triangle, parallel to the opposite side. Everything else follows from what you already know about parallel lines and straight angles.

The proof is also a perfect illustration of mathematical technique: you introduce a new element — the parallel line — not because it was there to begin with, but because it creates exactly the connection you need. This is called an **auxiliary construction**, and it is one of the most important proof strategies in geometry.

One caveat before we begin: this proof only works in flat, Euclidean geometry. On the surface of a sphere, the angles of a triangle sum to more than 180°. On a hyperbolic surface, less than 180°. The 180° result is not a universal truth about triangles — it is a theorem about triangles drawn on flat planes, and the Parallel Postulate is doing the work, quietly, in the background.`,
    },

    {
      type: "markdown",
      instruction: `### The Proof: One Line Changes Everything

**Theorem.** *The sum of the interior angles of any triangle is 180°.*

**Proof.**

Let △ABC be any triangle, with interior angles ∠A, ∠B, and ∠C.

**The construction:** Through vertex C, draw line ℓ parallel to side AB. (The Parallel Postulate guarantees this line exists and is unique.)

The line ℓ passes through C, and the three angles at C along ℓ are:
- ∠1 on the left (between ℓ going left and side CA)
- ∠C in the middle (the interior angle of the triangle)
- ∠2 on the right (between side CB and ℓ going right)

Since ℓ is a straight line, these three angles together form a straight angle:

$$m\\angle 1 + m\\angle C + m\\angle 2 = 180°$$

Now we need to connect ∠1 to ∠A and ∠2 to ∠B.

**Step 1:** Line segment AC is a transversal cutting the parallel lines AB and ℓ. Angles ∠A and ∠1 are alternate interior angles. By the Alternate Interior Angles Theorem:
$$m\\angle 1 = m\\angle A$$

**Step 2:** Line segment BC is a transversal cutting the parallel lines AB and ℓ. Angles ∠B and ∠2 are alternate interior angles. By the Alternate Interior Angles Theorem:
$$m\\angle 2 = m\\angle B$$

**Substitution:** Replace ∠1 with ∠A and ∠2 with ∠B in the straight-angle equation:

$$m\\angle A + m\\angle C + m\\angle B = 180° \\quad \\square$$

The proof is complete. Two applications of the Alternate Interior Angles Theorem, one straight-angle fact, and one substitution. Four steps from a single auxiliary line.`,
    },

    // ── Visual 1 — Draggable proof ────────────────────────────────────────────
    {
      type: "js",
      instruction: `### The Proof Visualized: Any Triangle, Always 180°

Drag the vertices to any triangle shape. The parallel line through C is constructed automatically. Watch ∠1 track ∠A and ∠2 track ∠B exactly — and observe the three angles at C always filling a straight line.`,
      html: `<canvas id="cv" width="700" height="340" style="cursor:move"></canvas>
<div id="proof-panel" style="padding:12px 14px;font-family:Georgia,serif;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);font-size:12px;line-height:1.75"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var pts=[{x:150,y:270},{x:530,y:270},{x:290,y:80}];
var drag=-1;

function addDrag(el){
  el.addEventListener('mousedown',function(e){var r=el.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);pts.forEach(function(p,i){if(Math.hypot(mx-p.x,my-p.y)<20)drag=i;});});
  el.addEventListener('mouseup',function(){drag=-1;});
  el.addEventListener('mousemove',function(e){if(drag<0)return;var r=el.getBoundingClientRect();pts[drag].x=Math.max(30,Math.min(W-30,(e.clientX-r.left)*(W/r.width)));pts[drag].y=Math.max(30,Math.min(H-60,(e.clientY-r.top)*(H/r.height)));draw();});
}
addDrag(cv);

function angD(v,p,q){var a=Math.atan2(p.y-v.y,p.x-v.x),b=Math.atan2(q.y-v.y,q.x-v.x);var d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;return Math.round(d*180/Math.PI);}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  var A=pts[0],B=pts[1],C=pts[2];
  var aA=angD(A,B,C),aB=angD(B,A,C),aC=angD(C,A,B);
  var sum=aA+aB+aC;

  // Unit vector along AB (direction of parallel line)
  var dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy);
  var ux=dx/len,uy=dy/len;
  var ext=300;

  // Parallel line through C
  ctx.strokeStyle='#7c3aed';ctx.lineWidth=1.8;ctx.setLineDash([9,5]);
  ctx.beginPath();ctx.moveTo(C.x-ext*ux,C.y-ext*uy);ctx.lineTo(C.x+ext*ux,C.y+ext*uy);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#7c3aed';ctx.font='italic 12px Georgia';ctx.textAlign='right';
  ctx.fillText('ℓ ∥ AB',C.x-ext*ux+40,C.y-ext*uy-8);

  // Triangle fill
  ctx.fillStyle='rgba(59,130,246,0.07)';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.fill();
  // Triangle sides
  ctx.strokeStyle='#1e293b';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.stroke();

  // Angle arcs at vertices
  function arcAt(v,p,q,color,r){
    var a1=Math.atan2(p.y-v.y,p.x-v.x),a2=Math.atan2(q.y-v.y,q.x-v.x);
    var lo=Math.min(a1,a2),hi=Math.max(a1,a2);
    if(hi-lo>Math.PI){var tmp=lo;lo=hi;hi=tmp+2*Math.PI;}
    ctx.strokeStyle=color;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(v.x,v.y,r,lo,hi);ctx.stroke();
  }
  arcAt(A,B,C,'#1e3a5f',32);
  arcAt(B,A,C,'#1a3a2a',32);
  arcAt(C,A,B,'#dc2626',32);

  // ∠1 arc at C (between parallel-left direction and CA)
  var parLeftAngle=Math.atan2(-uy,-ux);
  var caAngle=Math.atan2(A.y-C.y,A.x-C.x);
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=1.5;ctx.setLineDash([3,2]);
  var lo1=Math.min(parLeftAngle,caAngle),hi1=Math.max(parLeftAngle,caAngle);
  if(hi1-lo1>Math.PI){var t=lo1;lo1=hi1;hi1=t+2*Math.PI;}
  ctx.beginPath();ctx.arc(C.x,C.y,20,lo1,hi1);ctx.stroke();
  ctx.setLineDash([]);

  // ∠2 arc at C (between CB and parallel-right direction)
  var parRightAngle=Math.atan2(uy,ux);
  var cbAngle=Math.atan2(B.y-C.y,B.x-C.x);
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=1.5;ctx.setLineDash([3,2]);
  var lo2=Math.min(parRightAngle,cbAngle),hi2=Math.max(parRightAngle,cbAngle);
  if(hi2-lo2>Math.PI){var t2=lo2;lo2=hi2;hi2=t2+2*Math.PI;}
  ctx.beginPath();ctx.arc(C.x,C.y,20,lo2,hi2);ctx.stroke();
  ctx.setLineDash([]);

  // Labels
  var vData=[
    {p:A,l:'A',ang:aA,c:'#1e3a5f',ox:-18,oy:18},
    {p:B,l:'B',ang:aB,c:'#1a3a2a',ox:16,oy:18},
    {p:C,l:'C',ang:aC,c:'#dc2626',ox:0,oy:-18},
  ];
  vData.forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,6,0,2*Math.PI);ctx.fillStyle=v.c;ctx.fill();
    ctx.fillStyle=v.c;ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(v.l+' = '+v.ang+'°',v.p.x+v.ox,v.p.y+v.oy);
  });

  ctx.fillStyle='#1e3a5f';ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText('∠1='+aA+'°',C.x-42,C.y+14);
  ctx.fillStyle='#1a3a2a';
  ctx.fillText('∠2='+aB+'°',C.x+42,C.y+14);

  // Sum
  var sc=Math.abs(sum-180)<=2?'#1a3a2a':'#dc2626';
  ctx.fillStyle=sc;ctx.font='bold 14px Georgia';ctx.textAlign='center';
  ctx.fillText('∠A + ∠B + ∠C = '+aA+'° + '+aB+'° + '+aC+'° = '+sum+'°',W/2,H-10);

  // Two-column proof
  var pp=document.getElementById('proof-panel');
  pp.innerHTML='<strong>Two-column proof:</strong><table style="border-collapse:collapse;width:100%;font-size:12px;margin-top:6px">'
    +'<tr style="background:#f0f0ee"><th style="padding:4px 8px;text-align:left;width:46%">Statement</th><th style="padding:4px 8px;text-align:left">Reason</th></tr>'
    +'<tr><td style="padding:4px 8px">Draw ℓ through C, ℓ ∥ AB</td><td style="padding:4px 8px;font-style:italic;color:var(--color-text-secondary, #475569)">Construction (Parallel Postulate)</td></tr>'
    +'<tr style="background:#f8f8f6"><td style="padding:4px 8px">m∠1 + m∠C + m∠2 = 180°</td><td style="padding:4px 8px;font-style:italic;color:var(--color-text-secondary, #475569)">Straight angle along ℓ (Linear Pair / Angle Addition)</td></tr>'
    +'<tr><td style="padding:4px 8px;color:#1e3a5f">m∠1 = m∠A</td><td style="padding:4px 8px;font-style:italic;color:var(--color-text-secondary, #475569)">Alternate Interior Angles (AC transversal, AB ∥ ℓ)</td></tr>'
    +'<tr style="background:#f8f8f6"><td style="padding:4px 8px;color:#1a3a2a">m∠2 = m∠B</td><td style="padding:4px 8px;font-style:italic;color:var(--color-text-secondary, #475569)">Alternate Interior Angles (BC transversal, AB ∥ ℓ)</td></tr>'
    +'<tr><td style="padding:4px 8px;font-weight:700">m∠A + m∠C + m∠B = 180° □</td><td style="padding:4px 8px;font-style:italic;color:var(--color-text-secondary, #475569)">Substitution</td></tr>'
    +'</table>';
}
draw();`,
      outputHeight: 600,
    },

    {
      type: "markdown",
      instruction: `### Corollaries: What Follows Immediately

A **corollary** is a result that follows so directly from a theorem that it needs almost no new work. The 180° angle sum theorem produces several important ones.

**Corollary 1 — The Exterior Angle Theorem.**
*An exterior angle of a triangle equals the sum of the two non-adjacent interior angles.*

**Proof.** Let ∠4 be the exterior angle at C, formed by extending side BC. Then ∠C and ∠4 form a linear pair: m∠C + m∠4 = 180°. By the angle sum theorem: m∠A + m∠B + m∠C = 180°. Therefore m∠A + m∠B = 180° − m∠C = m∠4. □

This corollary also establishes that every exterior angle is strictly greater than either of the two remote interior angles — because it equals their sum, and both are positive.

**Corollary 2.** *Each angle of an equilateral triangle measures 60°.*

An equilateral triangle has three equal angles (by the Isosceles Triangle Theorem applied twice). If each equals x, then 3x = 180°, so x = 60°.

**Corollary 3.** *A triangle can have at most one right angle and at most one obtuse angle.*

If two angles were each ≥ 90°, their sum would be ≥ 180°, leaving no room for the required positive third angle.

**Corollary 4.** *The acute angles of a right triangle sum to 90° (they are complementary).*

If one angle is exactly 90°, the other two sum to 180° − 90° = 90°.

Each corollary takes one or two lines once you have the main theorem. This is the compounding architecture of mathematics — proved results become the raw material for the next tier.`,
    },

    // ── Visual 2 — Exterior angle ─────────────────────────────────────────────
    {
      type: "js",
      instruction: `### The Exterior Angle Theorem

The exterior angle at any vertex equals the sum of the two remote interior angles. Drag the vertices to verify with any triangle.`,
      html: `<canvas id="cv" width="700" height="260" style="cursor:move"></canvas>
<div id="ext-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var pts=[{x:140,y:220},{x:510,y:220},{x:270,y:75}];
var drag=-1;
cv.addEventListener('mousedown',function(e){var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);pts.forEach(function(p,i){if(Math.hypot(mx-p.x,my-p.y)<18)drag=i;});});
cv.addEventListener('mouseup',function(){drag=-1;});
cv.addEventListener('mousemove',function(e){if(drag<0)return;var r=cv.getBoundingClientRect();pts[drag].x=Math.max(30,Math.min(W-30,(e.clientX-r.left)*(W/r.width)));pts[drag].y=Math.max(30,Math.min(H-30,(e.clientY-r.top)*(H/r.height)));draw();});

function angD(v,p,q){var a=Math.atan2(p.y-v.y,p.x-v.x),b=Math.atan2(q.y-v.y,q.x-v.x);var d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;return Math.round(d*180/Math.PI);}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  var A=pts[0],B=pts[1],C=pts[2];
  var aA=angD(A,B,C),aB=angD(B,A,C),aC=angD(C,A,B);
  var ext=aA+aB;

  // Extend side AB beyond B
  var dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
  var extPt={x:B.x+110*ux,y:B.y+110*uy};

  // Triangle
  ctx.fillStyle='rgba(59,130,246,0.07)';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1e293b';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.stroke();

  // Extension
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.setLineDash([7,4]);
  ctx.beginPath();ctx.moveTo(B.x,B.y);ctx.lineTo(extPt.x,extPt.y);ctx.stroke();ctx.setLineDash([]);

  // Labels
  ctx.fillStyle='#1e3a5f';ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('∠A = '+aA+'°',A.x-14,A.y+18);
  ctx.fillStyle='#1a3a2a';ctx.fillText('∠C = '+aC+'°',C.x,C.y-16);
  ctx.fillStyle='#374151';ctx.fillText('∠B = '+aB+'°',B.x+14,B.y+18);
  ctx.fillStyle='#dc2626';ctx.fillText('ext = '+ext+'°',extPt.x+10,extPt.y-14);

  // Dots
  [A,B,C].forEach(function(p){ctx.beginPath();ctx.arc(p.x,p.y,5,0,2*Math.PI);ctx.fillStyle='#374151';ctx.fill();});
  ctx.beginPath();ctx.arc(extPt.x,extPt.y,4,0,2*Math.PI);ctx.fillStyle='#dc2626';ctx.fill();

  // Equation
  ctx.fillStyle='#dc2626';ctx.font='bold 14px Georgia';ctx.textAlign='center';
  ctx.fillText('ext∠ = ∠A + ∠C = '+aA+'° + '+aC+'° = '+ext+'°',W/2,H-10);

  document.getElementById('ext-info').innerHTML=
    '<strong>Exterior Angle Theorem:</strong> The exterior angle ('+ext+'°) = ∠A ('+aA+'°) + ∠C ('+aC+'°). '
    +'It is strictly greater than either individual remote angle: '+ext+' > '+aA+' and '+ext+' > '+aC+'.'
    +'<br><span style="color:var(--color-text-tertiary, #9ca3af);font-size:11px">Proof: ext + ∠B = 180° (linear pair). ∠A + ∠B + ∠C = 180° (angle sum). Subtract: ext = ∠A + ∠C.</span>';
}
draw();`,
      outputHeight: 340,
    },

    {
      type: "markdown",
      instruction: `### When 180° Fails: The Geometry of Curved Space

The triangle angle sum theorem depends entirely on the Parallel Postulate. Remove that postulate and the theorem fails — and you get radically different geometry.

**Spherical geometry (positive curvature):** Draw a triangle on a globe. Start at the North Pole, walk straight south to the equator (a quarter of the way around). Turn 90° east, walk along the equator another quarter-circle. Turn 90° and walk straight north back to the Pole. You've traced a triangle with three vertices and three sides — and three right angles. Its angle sum is 270°, not 180°. On a sphere, every triangle has angle sum strictly greater than 180°, and the excess is proportional to the triangle's area.

**Hyperbolic geometry (negative curvature):** On a saddle-shaped surface, triangles have angle sums strictly less than 180°. The deficit below 180° is again proportional to area.

**Why this matters beyond mathematics:** Einstein's general relativity describes gravity as curvature of spacetime. Near a massive object, the local geometry is not Euclidean. Light bends around stars — a phenomenon observed during the 1919 solar eclipse that confirmed general relativity. GPS satellites must account for both special and general relativistic corrections to maintain the precision that makes GPS work. The geometry of the universe is not Euclidean at large scales or near massive objects.

The 180° angle sum is an extraordinarily good approximation for everyday engineering and construction, where surfaces are nearly flat and distances are small. But it is a local approximation, not a universal truth — and knowing that distinction is what separates a mathematician from someone who has merely memorized a formula.`,
    },

    {
      type: "challenge",
      instruction: `In the proof of the Triangle Angle Sum Theorem, what is the essential role of the auxiliary parallel line through C? Why couldn't the proof simply work with the triangle as drawn, without adding any new line?`,
      options: [
        {
          label: "A",
          text: "The parallel line makes the diagram look more symmetric, which makes the proof easier to follow.",
        },
        {
          label: "B",
          text: "Without the parallel line there is no straight angle to anchor the three angles to 180°, and no transversal relationships to transport ∠A and ∠B to vertex C. The parallel line simultaneously creates the 180° container and the angle-transfer mechanism.",
        },
        {
          label: "C",
          text: "The parallel line is required by Euclid's Postulate I, which says a line must pass through every point.",
        },
        {
          label: "D",
          text: "The parallel line replaces side AB so the proof can use the straight angle at C.",
        },
      ],
      check: (label) => label === "B",
      successMessage:
        "Correct. The auxiliary parallel line does two things: (1) it creates a straight angle at C, giving a container of exactly 180°, and (2) it creates transversal relationships with sides AC and BC, allowing the Alternate Interior Angles Theorem to transport ∠A and ∠B to vertex C. Without the line, we have three angles trapped in a triangle with no straight-angle reference and no way to compare them across vertices.",
      failMessage:
        "The parallel line serves two precise logical functions: it creates a straight angle at C (so the three angles there sum to 180°) and it creates alternate interior angle pairs with each side of the triangle (allowing ∠A and ∠B to be transferred to C). Without it, we have three angles in a triangle but no mechanism to combine them into a straight line.",
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },

    {
      type: "challenge",
      instruction: `An exterior angle of a triangle measures 134°. One of the two remote interior angles is 71°. What are the measures of all three interior angles of the triangle?`,
      options: [
        {
          label: "A",
          text: "Remote angles: 71° and 63°. Interior angle at the vertex: 46°.",
        },
        {
          label: "B",
          text: "Remote angles: 71° and 63°. Interior angle at the vertex: 46°. Verify: 71 + 63 + 46 = 180° ✓",
        },
        {
          label: "C",
          text: "Remote angles: 71° and 67°. Interior angle at the vertex: 42°.",
        },
        {
          label: "D",
          text: "Remote angles: 71° and 109°. Interior angle at the vertex: 0°.",
        },
      ],
      check: (label) => label === "B",
      successMessage:
        "Correct. Exterior Angle Theorem: exterior angle = sum of two remote interior angles. So 134° = 71° + x, giving x = 63°. The interior angle at the vertex where the exterior angle is drawn forms a linear pair with it: 180° − 134° = 46°. Verify with the angle sum: 71° + 63° + 46° = 180° ✓.",
      failMessage:
        "Two steps. First: Exterior Angle Theorem gives the second remote angle: 134° = 71° + x, so x = 63°. Second: the interior angle at the vertex where the exterior angle is drawn forms a linear pair with it: 180° − 134° = 46°. Verify: 71° + 63° + 46° = 180° ✓.",
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },
  ],
};

export default {
  id: "geo-1-5",
  slug: "triangle-angle-sum",
  chapter: "geometry-1",
  order: 5,
  title: "The Triangle Angle Sum",
  subtitle:
    "Why every triangle on a flat plane adds up to exactly 180° — and what happens when it doesn't.",
  tags: [
    "geometry",
    "triangle-angle-sum",
    "parallel-lines",
    "exterior-angle",
    "corollaries",
    "non-euclidean",
  ],
  hook: {
    question:
      "Why does every triangle sum to exactly 180 degrees — and is it always true?",
    realWorldContext:
      "The proof uses one auxiliary parallel line and two applications of the Alternate Interior Angles Theorem. The 180° result holds only in flat Euclidean geometry — on a sphere or in curved spacetime, triangle angles sum to different values.",
    previewVisualizationId: "G1_4_TriangleAngleSum",
  },
  intuition: {
    blocks: [
      { type: 'prose', md: 'Every triangle\'s interior angles sum to exactly 180° — but why? The proof uses one clever construction: draw a line through vertex C **parallel to the opposite side AB**. This creates a straight angle at C (three parts summing to 180°) and two transversal pairs that transfer ∠A and ∠B to vertex C.' },
      { type: 'image', src: geoTriangleAuxUrl, alt: 'Triangle with auxiliary parallel line through C showing the proof', caption: 'The auxiliary line ℓ through C (parallel to AB) is the key. Alternate interior angles transfer ∠A and ∠B to C, where they combine with ∠C along a straight line.' },
      { type: 'prose', md: 'A powerful corollary: the **Exterior Angle Theorem**. Extend any side of a triangle beyond a vertex — the angle formed outside (the exterior angle) equals the sum of the two remote interior angles. It is strictly greater than either remote angle individually.' },
      { type: 'image', src: geoExteriorAngleUrl, alt: 'Triangle with exterior angle equal to sum of two remote interior angles', caption: 'Exterior angle = ∠A + ∠C. Proof: exterior + ∠B = 180° (linear pair); ∠A + ∠B + ∠C = 180° (angle sum); subtract ∠B.' },
      { type: 'callout', kind: 'important', title: 'Why the auxiliary line is necessary', body: 'Without drawing ℓ through C, there is no straight-angle container and no transversal mechanism to transport ∠A and ∠B to the same location. The proof literally cannot work. This is what auxiliary constructions do: introduce new structure that creates the logical connection you need.' },
      { type: 'viz', id: 'ScienceNotebook', props: { lesson: LESSON_GEO_1_5 }, mathBridge: 'Drag the triangle vertices to any shape — the parallel line through C adjusts automatically and the proof panel updates in real time. Notice ∠1 always equals ∠A and ∠2 always equals ∠B, proving the sum is always 180°.' },
      { type: 'viz', id: 'G1_4_TriangleAngleSum', title: 'Proving the 180 Degree Fact' },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    "Auxiliary line through C parallel to AB → three angles at C in a straight line = 180°.",
    "Alternate Interior Angles transports ∠A and ∠B up to vertex C.",
    "Substitution completes the proof: ∠A + ∠B + ∠C = 180°.",
    "Exterior Angle Theorem: ext = sum of two remote interior angles.",
    "On a sphere: angle sum > 180°. In hyperbolic geometry: < 180°. The Parallel Postulate is critical.",
  ],
  checkpoints: ["read-intuition"],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Why does drawing a line through C parallel to AB help prove the triangle angle sum?',
      options: [
        'It creates a right angle at C',
        'It creates alternate interior angles at C equal to ∠A and ∠B — then all three angles at C lie on a straight line summing to 180°',
        'It divides the triangle into two right triangles',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      diagram: quizTriangleFindUrl,
      diagramAlt: 'Triangle ABC with angle A = 47°, angle B = 65°, angle C labeled x.',
      text: '∠A = 47°, ∠B = 65°. Find angle x at vertex C.',
      options: ['68°', '58°', '78°'],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      diagram: quizExteriorAngleUrl,
      diagramAlt: 'Triangle ABC with side AB extended to D. Angle A = 48°, angle C = 73°. Exterior angle x at B.',
      text: '∠A = 48°, ∠C = 73°. Find the exterior angle x at B.',
      options: ['121°', '59°', '131°'],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does a triangle drawn on a globe have angle sum greater than 180°?',
      options: [
        'Triangles on spheres use larger units of measurement',
        'The Parallel Postulate fails on a sphere — great circles always intersect, changing the geometry fundamentally',
        'Spheres distort angles making them appear larger',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'An exterior angle of a triangle is 134°. One remote interior angle is 71°. Find the other remote interior angle.',
      options: ['63°', '46°', '109°'],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'Can a triangle have two obtuse angles?',
      options: [
        'Yes, if both are exactly 91°',
        'No — two angles of 90° or more would already sum to ≥ 180°, leaving no room for a positive third angle',
        'Yes, in non-Euclidean geometry only',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Each angle of an equilateral triangle equals:',
      options: ['60°', '90°', '45°'],
      correct: 0,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'In a right triangle, one acute angle is 37°. What is the other acute angle?',
      options: ['53°', '63°', '47°'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'The two remote interior angles of an exterior angle are both equal to x. The exterior angle is:',
      options: ['x°', '2x°', '180° − x°'],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'On a sphere, a triangle has three 90° angles. What is its angle sum?',
      options: ['180°', '270°', '360°'],
      correct: 1,
    },
  ],
};
export { LESSON_GEO_1_5 };
