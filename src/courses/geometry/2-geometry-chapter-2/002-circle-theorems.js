// Geometry · Chapter 2 · Lesson 2
// Circle Theorems and Angles
import geoCircleVocabUrl from '../diagrams/geo-circle-vocab.svg?url'
import geoInscribedAngleUrl from '../diagrams/geo-inscribed-angle.svg?url'
import quizInscribedAngleUrl from '../diagrams/quiz-inscribed-angle-find.svg?url'

const LESSON_GEO_2_1 = {
  subject: 'Geometry',
  title: 'Circle Theorems and Angles',
  subtitle: 'Why the angle in a semicircle is always 90° — and the surprising pattern that connects every inscribed angle to its arc.',
  sequential: true,

  cells: [

    // ── Opening ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### A Pattern That Shouldn't Exist

Here is an experiment. Take a circle. Mark two points on it — call them A and B. Now pick any other point P on the circle and draw the two line segments PA and PB. Measure the angle at P.

Now move P to a completely different location on the circle. Measure the angle again.

Move P again. Measure again.

Every time, no matter where P is — as long as it stays on the same arc — the angle is identical.

This is not intuitive. Why would the angle at P depend only on the arc AB and not at all on where P is on that arc? There seems to be no reason for it. Yet it is provably, certifiably true: any point on the same arc sees the same chord at the same angle.

This is the **Inscribed Angle Theorem**, and it is one of the most beautiful results in geometry. It explains why the angle in a semicircle is always 90°. It is the foundation of every angle-in-a-circle calculation in engineering and design. And the proof, which we'll work through carefully, uses only the Isosceles Triangle Theorem and the Triangle Angle Sum — tools you already have.

Understanding it deeply requires first getting the definitions straight, so let's build from the ground up.`,
    },

    // ── Circle vocabulary ──────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Vocabulary of Circles

A **circle** is the set of all points in a plane equidistant from a fixed center point. The fixed distance is the **radius** (plural: radii). A **diameter** is any chord passing through the center — its length is twice the radius.

A **chord** is a line segment connecting any two points on the circle. A **secant** is a line that intersects the circle at two points. A **tangent** is a line that touches the circle at exactly one point, called the **point of tangency**.

An **arc** is a connected portion of the circle. The arc between two points A and B can be the **minor arc** (shorter path) or the **major arc** (longer path). We distinguish them by whether a third labeled point lies on the arc. An arc is measured in degrees — the fraction of the full 360° circle it occupies.

A **central angle** is an angle whose vertex is at the center of the circle. The central angle and its intercepted arc have the same degree measure — this is essentially a definition. A central angle of 60° intercepts an arc of 60°.

An **inscribed angle** is an angle whose vertex is on the circle and whose sides are chords of the circle. The arc between the two endpoints of the chords (on the opposite side from the vertex) is the **intercepted arc**.

The Inscribed Angle Theorem connects these two types of angles: the inscribed angle is always exactly half the central angle that intercepts the same arc. This single relationship unlocks all the circle theorems.`,
    },

    // ── Visual 1 — Central vs inscribed angle ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Central Angle vs. Inscribed Angle

Drag point P around the circle. The central angle (at center O) and the inscribed angle (at P) both intercept the same arc AB. Watch the invariant: the inscribed angle is always exactly half the central angle — regardless of where P sits on the major arc.`,
      html: `<canvas id="cv" width="700" height="400" style="cursor:pointer"></canvas>
<div id="angle-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var cx=W/2,cy=H/2,R=150;

// A and B fixed on circle
var angA=210*Math.PI/180,angB=330*Math.PI/180;
var A={x:cx+R*Math.cos(angA),y:cy+R*Math.sin(angA)};
var B={x:cx+R*Math.cos(angB),y:cy+R*Math.sin(angB)};

// P draggable on major arc (top of circle)
var pAngle=-90*Math.PI/180;
var dragging=false;

cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  var P={x:cx+R*Math.cos(pAngle),y:cy+R*Math.sin(pAngle)};
  if(Math.hypot(mx-P.x,my-P.y)<20)dragging=true;
});
cv.addEventListener('mouseup',function(){dragging=false;});
cv.addEventListener('mousemove',function(e){
  if(!dragging)return;
  var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  pAngle=Math.atan2(my-cy,mx-cx);
  // Keep P on major arc (not between A and B on minor arc)
  draw();
});
cv.addEventListener('touchstart',function(e){e.preventDefault();dragging=true;},{passive:false});
cv.addEventListener('touchend',function(){dragging=false;});
cv.addEventListener('touchmove',function(e){
  e.preventDefault();
  var r=cv.getBoundingClientRect(),t=e.touches[0];
  pAngle=Math.atan2((t.clientY-r.top)*(H/r.height)-cy,(t.clientX-r.left)*(W/r.width)-cx);
  draw();
},{passive:false});

function angleBetween(v,p,q){
  var a=Math.atan2(p.y-v.y,p.x-v.x),b=Math.atan2(q.y-v.y,q.x-v.x);
  var d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;
  return d*180/Math.PI;
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var P={x:cx+R*Math.cos(pAngle),y:cy+R*Math.sin(pAngle)};
  var O={x:cx,y:cy};

  // Circle
  ctx.strokeStyle='#d1d5db';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(cx,cy,R,0,2*Math.PI);ctx.stroke();

  // Minor arc AB highlighted
  var a1=angA,a2=angB;
  ctx.strokeStyle='#dc2626';ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(cx,cy,R,a1,a2);ctx.stroke();

  // Central angle from O
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(O.x,O.y);ctx.lineTo(A.x,A.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(O.x,O.y);ctx.lineTo(B.x,B.y);ctx.stroke();

  // Inscribed angle from P
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(A.x,A.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(B.x,B.y);ctx.stroke();

  // Angle arcs
  var centralAng=angleBetween(O,A,B);
  var inscribedAng=angleBetween(P,A,B);
  var r1=28,r2=22;

  // Central arc
  var ca1=Math.atan2(A.y-O.y,A.x-O.x),ca2=Math.atan2(B.y-O.y,B.x-O.x);
  var clo=Math.min(ca1,ca2),chi=Math.max(ca1,ca2);
  if(chi-clo>Math.PI){var tmp=clo;clo=chi;chi=tmp+2*Math.PI;}
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(O.x,O.y,r1,clo,chi);ctx.stroke();

  // Inscribed arc
  var ia1=Math.atan2(A.y-P.y,A.x-P.x),ia2=Math.atan2(B.y-P.y,B.x-P.x);
  var ilo=Math.min(ia1,ia2),ihi=Math.max(ia1,ia2);
  if(ihi-ilo>Math.PI){var tmp2=ilo;ilo=ihi;ihi=tmp2+2*Math.PI;}
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(P.x,P.y,r2,ilo,ihi);ctx.stroke();

  // Points
  [{p:O,l:'O (center)',c:'#374151',ox:12,oy:-12},
   {p:A,l:'A',c:'#dc2626',ox:-16,oy:-12},
   {p:B,l:'B',c:'#dc2626',ox:12,oy:-12},
   {p:P,l:'P (drag)',c:'#1a3a2a',ox:14,oy:-12}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,6,0,2*Math.PI);ctx.fillStyle=v.c;ctx.fill();
    ctx.fillStyle=v.c;ctx.font='bold 12px Georgia';ctx.textAlign='left';
    ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  // Angle labels
  var cmid={x:O.x+(r1+14)*Math.cos((clo+chi)/2),y:O.y+(r1+14)*Math.sin((clo+chi)/2)};
  ctx.fillStyle='#1e3a5f';ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText(centralAng.toFixed(1)+'°',cmid.x,cmid.y);

  var imid={x:P.x+(r2+16)*Math.cos((ilo+ihi)/2),y:P.y+(r2+16)*Math.sin((ilo+ihi)/2)};
  ctx.fillStyle='#1a3a2a';ctx.font='bold 13px Georgia';
  ctx.fillText(inscribedAng.toFixed(1)+'°',imid.x,imid.y);

  // Legend
  ctx.fillStyle='#dc2626';ctx.font='11px Georgia';ctx.textAlign='left';
  ctx.fillText('Intercepted arc (minor arc AB)',14,H-40);
  ctx.fillStyle='#1e3a5f';ctx.fillText('Central angle ∠AOB = '+centralAng.toFixed(1)+'°',14,H-25);
  ctx.fillStyle='#1a3a2a';ctx.fillText('Inscribed angle ∠APB = '+inscribedAng.toFixed(1)+'° (always half the central angle)',14,H-10);

  // Ratio
  var ratio=(centralAng/inscribedAng).toFixed(2);
  ctx.fillStyle='#92400e';ctx.font='bold 14px Georgia';ctx.textAlign='right';
  ctx.fillText('∠AOB / ∠APB = '+ratio+' ≈ 2',W-14,H-14);

  document.getElementById('angle-info').innerHTML=
    '<strong>Central angle ∠AOB = '+centralAng.toFixed(1)+'°</strong> (at center O, intercepts arc AB)'
    +'<br><strong>Inscribed angle ∠APB = '+inscribedAng.toFixed(1)+'°</strong> (at P on circle, same intercepted arc)'
    +'<br><strong style="color:#92400e">Ratio = '+ratio+' ≈ 2 always.</strong> '
    +'Drag P anywhere on the major arc — the inscribed angle never changes, and is always exactly half the central angle.';
}
draw();`,
      outputHeight: 480,
    },

    // ── The Inscribed Angle Theorem Proof ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Proving the Inscribed Angle Theorem

**Theorem.** *The measure of an inscribed angle is half the measure of the central angle that intercepts the same arc.*

Equivalently: the inscribed angle equals half its intercepted arc.

The proof handles three cases based on where the center O lies relative to the inscribed angle. We'll prove the most important case — center inside the angle — and state the others.

**Case 1: Center O lies on one side of the inscribed angle.**

Let ∠APB be the inscribed angle with O on side PB. Draw radius OA.

Triangle OAP is isosceles (OA = OP = radii). Therefore ∠OAP = ∠OPA (Isosceles Triangle Theorem).

∠AOB is an exterior angle of △OAP. By the Exterior Angle Theorem:
$$m\\angle AOB = m\\angle OAP + m\\angle OPA = 2 \\cdot m\\angle OPA = 2 \\cdot m\\angle APB$$

So the central angle is twice the inscribed angle. ✓

**Case 2: Center O lies inside the inscribed angle.**

Draw diameter PD through O. By Case 1, applied twice:
$$m\\angle AOD = 2 \\cdot m\\angle APD \\quad \\text{and} \\quad m\\angle BOD = 2 \\cdot m\\angle BPD$$

Adding: m∠AOB = m∠AOD + m∠BOD = 2(m∠APD + m∠BPD) = 2·m∠APB. ✓

**Case 3: Center O lies outside the inscribed angle.** (Similar argument by subtraction.)

**The key corollary follows immediately:**

*Inscribed angles intercepting the same arc are equal.*

If P and Q are both on the major arc, both inscribed angles ∠APB and ∠AQB equal half the same central angle ∠AOB. Therefore ∠APB = ∠AQB.

This is the remarkable result we observed at the start: any point on the same arc sees the chord AB at the same angle.`,
    },

    // ── Angle in a semicircle ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Thales' Theorem: The Angle in a Semicircle

**Corollary (Thales' Theorem).** *The angle inscribed in a semicircle is always 90°.*

**Proof.** If AB is a diameter, the central angle ∠AOB = 180° (a straight line). By the Inscribed Angle Theorem, any inscribed angle ∠APB intercepting this semicircle equals 180°/2 = 90°. □

This is attributed to Thales of Miletus (circa 600 BCE), making it one of the oldest recorded geometric theorems. The legend says he sacrificed an ox to celebrate the discovery.

**Converse of Thales' Theorem:** *If ∠APB = 90°, then P lies on a circle with diameter AB.*

This converse is used constantly in construction and engineering: if you want to find all points from which a segment AB subtends a right angle, the answer is a circle with AB as diameter.

**Application:** Engineers use this to find the center of a circular pipe cross-section. Inscribe any right angle in the unknown circle — the right angle must be inscribed in a semicircle, so the hypotenuse is a diameter. Find two such diameters; their intersection is the center.

**Why this matters theoretically:** Thales' Theorem connects the concept of angle to the concept of circle in a profound way. It says that "right angle" and "semicircle" are, in a precise sense, the same geometric object — one viewed from outside (the arc), one from inside (the angle).`,
    },

    // ── Visual 2 — Thales and inscribed angles ────────────────────────────────
    {
      type: 'js',
      instruction: `### Thales' Theorem and the Equal Inscribed Angles

The left panel shows Thales' Theorem: any point on the semicircle sees the diameter at 90°. The right panel shows the equal inscribed angles corollary: two points on the same arc see the same chord at the same angle. Drag the points to verify.`,
      html: `<canvas id="cv" width="700" height="320" style="cursor:pointer"></canvas>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

// Left panel: Thales
var lCx=175,lCy=H/2,lR=120;
var thalesAngle=Math.PI*1.4;
var draggingThales=false;

// Right panel: equal inscribed angles
var rCx=530,rCy=H/2,rR=120;
var angA2=200*Math.PI/180,angB2=340*Math.PI/180;
var p1Angle=90*Math.PI/180,p2Angle=30*Math.PI/180;
var draggingP=0;

cv.addEventListener('mousedown',function(e){
  var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  var P={x:lCx+lR*Math.cos(thalesAngle),y:lCy+lR*Math.sin(thalesAngle)};
  if(Math.hypot(mx-P.x,my-P.y)<18)draggingThales=true;
  var P1={x:rCx+rR*Math.cos(p1Angle),y:rCy+rR*Math.sin(p1Angle)};
  var P2={x:rCx+rR*Math.cos(p2Angle),y:rCy+rR*Math.sin(p2Angle)};
  if(Math.hypot(mx-P1.x,my-P1.y)<18)draggingP=1;
  if(Math.hypot(mx-P2.x,my-P2.y)<18)draggingP=2;
});
cv.addEventListener('mouseup',function(){draggingThales=false;draggingP=0;});
cv.addEventListener('mousemove',function(e){
  var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  if(draggingThales)thalesAngle=Math.atan2(my-lCy,mx-lCx);
  if(draggingP===1)p1Angle=Math.atan2(my-rCy,mx-rCx);
  if(draggingP===2)p2Angle=Math.atan2(my-rCy,mx-rCx);
  draw();
});

function angBetween(v,p,q){
  var a=Math.atan2(p.y-v.y,p.x-v.x),b=Math.atan2(q.y-v.y,q.x-v.x);
  var d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;
  return Math.round(d*180/Math.PI);
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  // Divider
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,20);ctx.lineTo(W/2,H-20);ctx.stroke();

  // ── LEFT: Thales ──
  ctx.strokeStyle='#d1d5db';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(lCx,lCy,lR,0,2*Math.PI);ctx.stroke();

  // Diameter
  var dA={x:lCx-lR,y:lCy},dB={x:lCx+lR,y:lCy};
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(dA.x,dA.y);ctx.lineTo(dB.x,dB.y);ctx.stroke();

  // Semicircle arc highlight
  ctx.strokeStyle='#dc2626';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(lCx,lCy,lR,Math.PI,2*Math.PI);ctx.stroke();

  var P={x:lCx+lR*Math.cos(thalesAngle),y:lCy+lR*Math.sin(thalesAngle)};
  // Keep on upper semicircle
  if(P.y>lCy)P.y=lCy-2;

  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(dA.x,dA.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(dB.x,dB.y);ctx.stroke();

  var thalesAng=angBetween(P,dA,dB);
  // Right angle box at P
  var sqS=12;
  var pA=Math.atan2(dA.y-P.y,dA.x-P.x),pB=Math.atan2(dB.y-P.y,dB.x-P.x);
  var s1x=P.x+sqS*Math.cos(pA),s1y=P.y+sqS*Math.sin(pA);
  var s2x=P.x+sqS*Math.cos(pB),s2y=P.y+sqS*Math.sin(pB);
  ctx.strokeStyle='#374151';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(s1x,s1y);ctx.lineTo(s1x+(s2x-P.x),s1y+(s2y-P.y));ctx.lineTo(s2x,s2y);ctx.stroke();

  [{p:dA,l:'A',c:'#1e3a5f',ox:-14,oy:16},{p:dB,l:'B',c:'#1e3a5f',ox:8,oy:16},{p:P,l:'P',c:'#1a3a2a',ox:10,oy:-12},{p:{x:lCx,y:lCy},l:'O',c:'#374151',ox:8,oy:14}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle=v.c;ctx.fill();
    ctx.fillStyle=v.c;ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });
  ctx.fillStyle='#1a3a2a';ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('∠APB = '+thalesAng+'° (always 90°)',lCx,H-14);
  ctx.fillStyle='#374151';ctx.font='12px Georgia';ctx.fillText('Drag P',lCx,H-28);
  ctx.fillStyle='#1e3a5f';ctx.font='bold 13px Georgia';ctx.fillText('Thales\' Theorem',lCx,28);

  // ── RIGHT: Equal inscribed angles ──
  ctx.strokeStyle='#d1d5db';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(rCx,rCy,rR,0,2*Math.PI);ctx.stroke();

  var A2={x:rCx+rR*Math.cos(angA2),y:rCy+rR*Math.sin(angA2)};
  var B2={x:rCx+rR*Math.cos(angB2),y:rCy+rR*Math.sin(angB2)};

  // Minor arc AB
  ctx.strokeStyle='#dc2626';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(rCx,rCy,rR,angA2,angB2);ctx.stroke();

  var P1={x:rCx+rR*Math.cos(p1Angle),y:rCy+rR*Math.sin(p1Angle)};
  var P2={x:rCx+rR*Math.cos(p2Angle),y:rCy+rR*Math.sin(p2Angle)};

  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(P1.x,P1.y);ctx.lineTo(A2.x,A2.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(P1.x,P1.y);ctx.lineTo(B2.x,B2.y);ctx.stroke();
  ctx.strokeStyle='#7c3aed';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(P2.x,P2.y);ctx.lineTo(A2.x,A2.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(P2.x,P2.y);ctx.lineTo(B2.x,B2.y);ctx.stroke();

  var ang1=angBetween(P1,A2,B2),ang2=angBetween(P2,A2,B2);
  var equal=Math.abs(ang1-ang2)<=2;

  [{p:A2,l:'A',c:'#dc2626',ox:-14,oy:-12},{p:B2,l:'B',c:'#dc2626',ox:8,oy:-12},
   {p:P1,l:'P₁',c:'#1e3a5f',ox:10,oy:-12},{p:P2,l:'P₂',c:'#7c3aed',ox:10,oy:-12}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,6,0,2*Math.PI);ctx.fillStyle=v.c;ctx.fill();
    ctx.fillStyle=v.c;ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  ctx.fillStyle='#1e3a5f';ctx.font='13px Georgia';ctx.textAlign='center';
  ctx.fillText('∠AP₁B = '+ang1+'°',rCx-30,H-28);
  ctx.fillStyle='#7c3aed';ctx.fillText('∠AP₂B = '+ang2+'°',rCx+30,H-14);
  ctx.fillStyle=equal?'#1a3a2a':'#dc2626';ctx.font='bold 13px Georgia';
  ctx.fillText(equal?'Equal! ✓':'Move P₁, P₂ to same arc',rCx,H-42);
  ctx.fillStyle='#374151';ctx.font='bold 13px Georgia';ctx.fillText('Equal Inscribed Angles',rCx,28);
}
draw();`,
      outputHeight: 380,
    },

    // ── Tangent theorems ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Tangent Lines: The Perpendicularity Theorem

A tangent to a circle is perpendicular to the radius at the point of tangency.

**Theorem.** *If a line is tangent to a circle at point T, then the radius OT is perpendicular to the tangent line.*

**Proof.** Suppose for contradiction that OT is not perpendicular to the tangent ℓ. Then there exists a point T' on ℓ such that OT' < OT (the foot of the perpendicular from O to ℓ is closer to O than T). But T' lies on the tangent line, which is entirely outside the circle except at T. So OT' > radius = OT, contradicting OT' < OT. Therefore OT must be perpendicular to ℓ. □

**Corollary: Tangent segments from an external point are equal.**

If two tangent segments are drawn from an external point P to a circle with center O, touching at T₁ and T₂, then PT₁ = PT₂.

**Proof.** Consider triangles △OT₁P and △OT₂P:
- OT₁ = OT₂ (radii)
- ∠OT₁P = ∠OT₂P = 90° (tangent perpendicular to radius)
- OP = OP (common side)

By HL (Hypotenuse-Leg), △OT₁P ≅ △OT₂P. Therefore PT₁ = PT₂ by CPCTC. □

This result is used in compass-and-straightedge constructions and in proving the **Power of a Point** theorem — a deeper result that unifies all the cases where a point relates to a circle by secants or tangents.`,
    },

    // ── Visual 3 — Tangent from external point ────────────────────────────────
    {
      type: 'js',
      instruction: `### Tangent Segments from an External Point

Drag point P outside the circle. The two tangent segments from P to the circle are always equal. The right angles at the tangent points are shown — these are the HL congruence in action.`,
      html: `<canvas id="cv" width="700" height="340" style="cursor:pointer"></canvas>
<div id="tang-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var cx=W/2,cy=H/2,R=110;
var P={x:W-80,y:H/2};
var dragging=false;

cv.addEventListener('mousedown',function(e){var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);if(Math.hypot(mx-P.x,my-P.y)<20)dragging=true;});
cv.addEventListener('mouseup',function(){dragging=false;});
cv.addEventListener('mousemove',function(e){if(!dragging)return;var r=cv.getBoundingClientRect();P.x=Math.max(cx+R+10,Math.min(W-10,(e.clientX-r.left)*(W/r.width)));P.y=Math.max(10,Math.min(H-10,(e.clientY-r.top)*(H/r.height)));draw();});
cv.addEventListener('touchstart',function(e){e.preventDefault();dragging=true;},{passive:false});
cv.addEventListener('touchend',function(){dragging=false;});
cv.addEventListener('touchmove',function(e){e.preventDefault();var r=cv.getBoundingClientRect(),t=e.touches[0];P.x=Math.max(cx+R+10,Math.min(W-10,(t.clientX-r.left)*(W/r.width)));P.y=Math.max(10,Math.min(H-10,(t.clientY-r.top)*(H/r.height)));draw();},{passive:false});

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  // Circle
  ctx.strokeStyle='#d1d5db';ctx.lineWidth=1.5;ctx.fillStyle='rgba(59,130,246,0.04)';
  ctx.beginPath();ctx.arc(cx,cy,R,0,2*Math.PI);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,3,0,2*Math.PI);ctx.fillStyle='#374151';ctx.fill();
  ctx.fillStyle='#374151';ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText('O',cx,cy-10);

  // Find tangent points
  var d=Math.hypot(P.x-cx,P.y-cy);
  if(d<=R){draw_invalid();return;}
  var a=Math.asin(R/d);
  var base=Math.atan2(P.y-cy,P.x-cx);
  var t1A=base+Math.PI+a,t2A=base+Math.PI-a;
  var T1={x:cx+R*Math.cos(t1A),y:cy+R*Math.sin(t1A)};
  var T2={x:cx+R*Math.cos(t2A),y:cy+R*Math.sin(t2A)};

  // Tangent segments
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(T1.x,T1.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(T2.x,T2.y);ctx.stroke();

  // Radii to tangent points
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(T1.x,T1.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(T2.x,T2.y);ctx.stroke();
  ctx.setLineDash([]);

  // Right angle markers at T1 and T2
  function drawRightAngle(T,O,P_){
    var toO=Math.atan2(O.y-T.y,O.x-T.x);
    var toP=Math.atan2(P_.y-T.y,P_.x-T.x);
    var s=12;
    var s1x=T.x+s*Math.cos(toO),s1y=T.y+s*Math.sin(toO);
    var s2x=T.x+s*Math.cos(toP),s2y=T.y+s*Math.sin(toP);
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(s1x,s1y);ctx.lineTo(s1x+(s2x-T.x),s1y+(s2y-T.y));ctx.lineTo(s2x,s2y);ctx.stroke();
  }
  drawRightAngle(T1,{x:cx,y:cy},P);
  drawRightAngle(T2,{x:cx,y:cy},P);

  // Tick marks for equal tangent lengths
  function tick(p1,p2,color){
    var mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
    var dx=p2.x-p1.x,dy=p2.y-p1.y,len=Math.hypot(dx,dy);
    var nx=-dy/len*8,ny=dx/len*8;
    ctx.strokeStyle=color;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(mx+nx,my+ny);ctx.lineTo(mx-nx,my-ny);ctx.stroke();
  }
  tick(P,T1,'#1a3a2a');tick(P,T2,'#1a3a2a');

  var pt1=Math.hypot(P.x-T1.x,P.y-T1.y).toFixed(1);
  var pt2=Math.hypot(P.x-T2.x,P.y-T2.y).toFixed(1);

  [{p:T1,l:'T₁',c:'#1a3a2a',ox:-18,oy:-10},{p:T2,l:'T₂',c:'#1a3a2a',ox:-18,oy:16},{p:P,l:'P (drag)',c:'#374151',ox:10,oy:-10}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,6,0,2*Math.PI);ctx.fillStyle=v.c;ctx.fill();
    ctx.fillStyle=v.c;ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  var equal=Math.abs(parseFloat(pt1)-parseFloat(pt2))<0.5;
  document.getElementById('tang-info').innerHTML=
    '<strong>PT₁ = '+pt1+'</strong> and <strong>PT₂ = '+pt2+'</strong>. '
    +(equal?'<strong style="color:#1a3a2a">Equal ✓</strong>':'')
    +'<br>Proof: △OT₁P ≅ △OT₂P by HL (OT₁ = OT₂ = radius, ∠T₁ = ∠T₂ = 90°, OP shared). By CPCTC: PT₁ = PT₂.'
    +'<br><span style="color:var(--color-text-tertiary, #9ca3af);font-size:11px">Drag P to change the external point. The tangent segments always remain equal.</span>';
}
function draw_invalid(){
  ctx.fillStyle='#dc2626';ctx.font='13px Georgia';ctx.textAlign='center';ctx.fillText('P must be outside the circle',W/2,H/2);
}
draw();`,
      outputHeight: 420,
    },

    // ── Angle in alternate segment ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Alternate Segment Theorem (Tangent-Chord Angle)

One more beautiful theorem connects tangent lines to inscribed angles.

**Alternate Segment Theorem.** *The angle between a tangent to a circle and a chord drawn from the point of tangency equals the inscribed angle subtended by the chord on the opposite side.*

In other words: if you have a tangent ℓ at point T, and chord TB, the angle between ℓ and TB (on one side) equals any inscribed angle in the alternate segment (the arc on the other side of TB).

**Proof.** Let ∠BTℓ be the angle between tangent ℓ and chord TB. Draw diameter TA. Since OT ⊥ ℓ, we have ∠OTB + ∠BTℓ = 90°. Triangle OTB is isosceles (OT = OB = radii), so ∠OTB = ∠OBT. Since ∠TOB + 2∠OTB = 180° (angle sum), we get ∠OTB = 90° − ∠TOB/2. Therefore ∠BTℓ = 90° − ∠OTB = ∠TOB/2.

But ∠TOB/2 is the inscribed angle from any point on the major arc TB (by the Inscribed Angle Theorem). Therefore the tangent-chord angle equals the inscribed angle in the alternate segment. □

**Summary of the four major circle angle relationships:**

| Configuration | Relationship |
|---|---|
| Central angle ∠AOB | Equals arc AB |
| Inscribed angle ∠APB | Equals ½ arc AB |
| Two chords intersecting inside | ∠ = ½(arc₁ + arc₂) |
| Tangent-chord angle | Equals inscribed angle in alternate segment |`,
    },

    // ── Challenges ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `An inscribed angle in a circle measures 38°. What is the measure of the central angle intercepting the same arc, and what is the arc measure?`,
      options: [
        { label: 'A', text: 'Central angle = 76°; arc = 76°. By the Inscribed Angle Theorem, the central angle is twice the inscribed angle, and a central angle always equals its intercepted arc.' },
        { label: 'B', text: 'Central angle = 19°; arc = 19°.' },
        { label: 'C', text: 'Central angle = 38°; arc = 76°.' },
        { label: 'D', text: 'Central angle = 76°; arc = 152°.' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Inscribed Angle Theorem: central angle = 2 × inscribed angle = 2 × 38° = 76°. A central angle always equals its intercepted arc by definition, so arc = 76°. Key chain: inscribed angle → × 2 → central angle = arc.',
      failMessage: 'The Inscribed Angle Theorem states the inscribed angle equals half the central angle (or half the arc). So central angle = 2 × 38° = 76°. The central angle and its intercepted arc are always equal in degree measure (this is essentially the definition of arc measure). So arc = 76°.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `Point P is outside a circle. Two tangent segments are drawn from P to the circle, touching at T₁ and T₂. The angle ∠T₁PT₂ = 48°. What is the arc T₁T₂ (the minor arc between the two tangent points) on the same side as P?`,
      options: [
        { label: 'A', text: '132° — the minor arc near P' },
        { label: 'B', text: '48° — same as the angle at P' },
        { label: 'C', text: '96° — twice the angle at P' },
        { label: 'D', text: '312° — the major arc' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Quadrilateral OT₁PT₂ has angles: ∠OT₁P = ∠OT₂P = 90° (tangent perpendicular to radius), ∠T₁PT₂ = 48°. Angle sum of quadrilateral = 360°, so ∠T₁OT₂ = 360° − 90° − 90° − 48° = 132°. The central angle ∠T₁OT₂ = arc T₁T₂ = 132° (the minor arc near P). The major arc = 360° − 132° = 228°.',
      failMessage: 'Use the quadrilateral OT₁PT₂. Its four angles sum to 360°. ∠OT₁P = 90° and ∠OT₂P = 90° (tangent ⊥ radius). ∠T₁PT₂ = 48°. So ∠T₁OT₂ = 360° − 90° − 90° − 48° = 132°. The central angle equals the arc, so the near arc = 132°.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `△ABC is inscribed in a circle (all three vertices on the circle). Side BC is a diameter. What is ∠BAC, and why? If ∠ABC = 35°, what is ∠ACB?`,
      options: [
        { label: 'A', text: '∠BAC = 90° (Thales\' Theorem: angle inscribed in semicircle). ∠ACB = 55° (since 90° + 35° + ∠ACB = 180°).' },
        { label: 'B', text: '∠BAC = 45°; ∠ACB = 100°' },
        { label: 'C', text: '∠BAC = 90°; ∠ACB = 35°' },
        { label: 'D', text: '∠BAC = 60°; ∠ACB = 85°' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Since BC is a diameter, A is inscribed in a semicircle, so ∠BAC = 90° by Thales\' Theorem. Then ∠BAC + ∠ABC + ∠ACB = 180°, giving 90° + 35° + ∠ACB = 180°, so ∠ACB = 55°. This is a classic combination of Thales\' Theorem and the Triangle Angle Sum.',
      failMessage: 'BC is a diameter → A lies on a semicircle → ∠BAC = 90° by Thales\' Theorem. Then the Triangle Angle Sum: 90° + 35° + ∠ACB = 180°, so ∠ACB = 55°.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },
  ],
};

export default {
  id: 'geo-2-1',
  slug: 'circle-theorems',
  chapter: 'geometry-2',
  order: 1,
  title: 'Circle Theorems and Angles',
  subtitle: 'Why the angle in a semicircle is always 90° — and the pattern connecting every inscribed angle to its arc.',
  tags: ['geometry', 'circles', 'inscribed-angle', 'central-angle', 'thales', 'tangent', 'arc'],
  hook: {
    question: 'Why is the angle in a semicircle always exactly 90°?',
    realWorldContext: 'The Inscribed Angle Theorem and Thales\' Theorem are used in engineering to locate circle centers, in optics to design lenses, and in stadium design to ensure every seat has the same viewing angle to the playing field.',
    previewVisualizationId: 'G2_1_CircleTheorems1',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**A circle\'s geometry is built on one key vocabulary.** Every angle theorem in circles traces back to the relationship between arcs and angles — and that relationship depends on where the angle\'s vertex sits: at the center, on the circle, or outside it.',
        ],
      },
      {
        type: 'image',
        src: geoCircleVocabUrl,
        alt: 'Circle diagram showing center, radius, diameter, chord, arc, and tangent with labels and key relationships',
        caption: 'Central angle = arc (definition). Inscribed angle = ½ arc (theorem). Tangent ⊥ radius (theorem).',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The Inscribed Angle Theorem** is the master relationship: an inscribed angle (vertex on the circle) equals exactly half the central angle intercepting the same arc. Because the arc is fixed, any two inscribed angles intercepting the same arc are equal to each other — regardless of where on the circle the vertex sits.',
          'Thales\' Theorem is a direct corollary: when the intercepted arc is a semicircle (180°), the inscribed angle is half of 180° = 90°. Any angle inscribed in a semicircle is a right angle.',
        ],
      },
      {
        type: 'image',
        src: geoInscribedAngleUrl,
        alt: 'Two circles side by side: left shows central angle 2θ over arc AB; right shows inscribed angle θ from point P over same arc AB',
        caption: 'Same arc AB, different vertex positions. Central angle = 2θ. Inscribed angle = θ. The arc is the link.',
      },
      {
        type: 'callout',
        kind: 'important',
        title: 'The master relationship',
        body: 'Inscribed angle = ½ arc = ½ central angle. This single formula drives every circle angle theorem: Thales\' Theorem (semicircle → 90°), equal inscribed angles (same arc → same angle), and the tangent-chord angle (equals inscribed angle in alternate segment).',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_2_1 },
        mathBridge: 'Work through the interactive exercises: drag the inscribed angle point around the circle to confirm it stays constant over the same arc, explore tangent properties, and use the quadrilateral explorer to see why opposite angles in a cyclic quadrilateral sum to 180°.',
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Central angle = arc (definition). Inscribed angle = ½ arc (theorem).',
    'Same arc → same inscribed angle, regardless of where on the circle.',
    'Diameter as chord → inscribed angle = 90° (Thales).',
    'Tangent ⊥ radius. Two tangents from external point: equal length (HL proof).',
    'Quadrilateral inscribed in circle: opposite angles supplementary (sum 180°).',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizInscribedAngleUrl,
      diagramAlt: 'Circle with center O. Arc AB = 116°. Point P on circle with inscribed angle x.',
      text: 'Arc AB = 116°. Find the inscribed angle x at P.',
      options: ['232°', '58°', '116°'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Two inscribed angles both subtend the same arc of a circle. Without measuring, what can you conclude?',
      options: [
        'They are supplementary (sum to 180°)',
        'They are equal — inscribed angles over the same arc are always congruent',
        'They sum to the central angle over that arc',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why is any angle inscribed in a semicircle always 90°?',
      options: [
        'A semicircle arc = 180°, so inscribed angle = ½ × 180° = 90°',
        'Diameters always bisect inscribed angles',
        'The center is equidistant from all points, forcing a right angle',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A cyclic quadrilateral (all four vertices on a circle) has angles 85°, 95°, x, and y. What is x + y?',
      options: ['180°', '360°', '90°'],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A central angle is 100°. What is the inscribed angle subtending the same arc?',
      options: ['200°', '50°', '100°'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A tangent line meets a circle at point T. A radius is drawn to T. The angle between the tangent and the radius at T is…',
      options: ['45°', '90° — tangent is always perpendicular to the radius at the point of tangency', '60°'],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Two tangent segments are drawn from an external point P to points T₁ and T₂ on a circle. By HL congruence (applied to △OT₁P and △OT₂P), what can you conclude?',
      options: [
        'PT₁ = PT₂ — the tangent segments are equal in length',
        'T₁T₂ is a diameter',
        '∠T₁OT₂ = 90°',
      ],
      correct: 0,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Triangle ABC is inscribed in a circle with BC as a diameter. ∠ABC = 40°. What is ∠ACB?',
      options: ['50° (since ∠BAC = 90° and 90° + 40° + ∠ACB = 180°)', '40°', '80°'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'The Inscribed Angle Theorem proof uses which other theorems?',
      options: [
        'Only the definition of a circle',
        'The Isosceles Triangle Theorem (radii equal → isosceles) and Triangle Angle Sum',
        'The Pythagorean Theorem and SAS congruence',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A chord subtends a minor arc of 80°. What is the inscribed angle from the major arc side that intercepts this minor arc?',
      options: ['80°', '40°', '140°'],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_2_1 };
