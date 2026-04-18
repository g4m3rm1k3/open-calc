// Geometry · Chapter 2 · Lesson 2
// Classical Constructions

const LESSON_GEO_2_2 = {
  title: 'Classical Constructions',
  subtitle: 'How compass and straightedge implement the axioms directly — and why three problems resisted solution for 2,000 years.',
  sequential: true,

  cells: [

    // ── Opening ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Rules of the Game

The ancient Greeks imposed a strict constraint on geometric construction: you may use only two tools.

**The straightedge** — not a ruler. A ruler has measurements marked on it. A straightedge has none. You can draw a line through two points, or extend a line segment, but you cannot measure length.

**The compass** — a tool for drawing circles and arcs, and for transferring distances. You set the compass to a given length by placing the pivot at one point and the pencil at another, then use that fixed radius to draw circles or copy the distance elsewhere.

No protractors. No calculators. No coordinates. Just these two instruments, implementing Euclid's first three postulates directly:
- Postulate 1: Draw a line through any two points. (The straightedge.)
- Postulate 2: Extend any line segment. (The straightedge.)
- Postulate 3: Draw a circle with any center and radius. (The compass.)

Under these constraints, the Greeks managed to construct an extraordinary variety of figures — angle bisectors, perpendicular bisectors, regular polygons up to 17 sides, square roots, and much more. They also identified three problems they could not solve: trisecting an angle, doubling a cube, and squaring a circle.

It took 2,000 years and the invention of abstract algebra to prove those three problems genuinely impossible — not just difficult. The impossibility proofs, using Galois theory in the 19th century, are among the greatest achievements in mathematics.

Understanding classical construction means understanding how axioms become algorithms — how abstract rules generate precise figures.`,
    },

    // ── Why proofs accompany constructions ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Constructions and Proofs: Inseparable

A construction without a proof is just a drawing. The proof is what establishes that the construction actually achieves what you claim.

Every classical construction comes paired with a proof that it works — typically using congruence (SSS, SAS) or circle properties. The proof doesn't just confirm the result; it reveals *why* the construction works, which is what makes it mathematics rather than drafting.

The general structure:

1. **State what you will construct** — precisely.
2. **Give the construction steps** — numbered, each step using only compass or straightedge.
3. **Prove the construction is correct** — citing which theorem or property justifies the result.

You'll see this structure in every construction in this lesson. By the end, you'll understand not just *how* to perform each construction but *why* it works — which means you could invent variations and new constructions yourself.

One philosophical note: a construction that uses 100 steps is no less valid than one that uses 5. Efficiency matters in practice, but correctness depends only on whether each step is legal (straightedge or compass) and the proof is valid.`,
    },

    // ── Construction 1: Perpendicular bisector ────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Construction 1: Perpendicular Bisector of a Segment

**Task:** Given segment AB, construct its perpendicular bisector.

**Steps:**
1. Set the compass to any radius greater than half of AB.
2. With center A, draw an arc above and below segment AB.
3. With the same radius and center B, draw arcs that intersect the first pair at points P and Q.
4. Draw the line through P and Q.

Line PQ is the perpendicular bisector of AB.

**Proof:**

Consider triangles △APB and △AQB. We have:
- AP = BP (P lies on both arcs, drawn with the same radius)
- AQ = BQ (Q lies on both arcs, drawn with the same radius)
- AB = AB (common side)

By SSS, △APB ≅ △AQB. Therefore ∠PAB = ∠QAB (corresponding angles).

Now consider △APM and △BPM where M is the intersection of PQ and AB:
- AP = BP (same radius)
- PM = PM (common)
- ∠PAM = ∠PBM (just proved equal)

By SAS, △APM ≅ △BPM. Therefore AM = BM (M bisects AB) and ∠PMA = ∠PMB. Since these two angles are supplementary, ∠PMA = ∠PMB = 90°. Therefore PQ ⊥ AB at M. □

**What this construction gives you:**
- The midpoint M of segment AB
- The perpendicular bisector line
- Equal distances from any point on PQ to both A and B (this is the locus definition of the perpendicular bisector)`,
    },

    // ── Visual 1 — Perpendicular bisector step-by-step ────────────────────────
    {
      type: 'js',
      instruction: `### Construction 1: Perpendicular Bisector

Click through each step of the construction. The arcs appear in sequence, then the bisector line. The proof reasoning is shown for each step.`,
      html: `<div style="padding:8px 14px 0;background:#fafaf8;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
  <button id="prev-btn" style="padding:6px 14px;border-radius:7px;border:1.5px solid #94a3b8;background:transparent;color:#64748b;font-family:Georgia,serif;font-size:12px;cursor:pointer">← Back</button>
  <span id="step-lbl" style="font-family:Georgia,serif;font-size:13px;color:#374151;font-weight:700">Step 1 of 5</span>
  <button id="next-btn" style="padding:6px 14px;border-radius:7px;border:1.5px solid #1e3a5f;background:#1e3a5f22;color:#1e3a5f;font-family:Georgia,serif;font-size:12px;font-weight:700;cursor:pointer">Next →</button>
</div>
<canvas id="cv" width="700" height="280"></canvas>
<div id="step-desc" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:#fafaf8;border-top:1px solid #e2e8f0;line-height:1.7;min-height:52px"></div>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

var A={x:160,y:H/2},B={x:520,y:H/2};
var r=Math.hypot(B.x-A.x,B.y-A.y)*0.65;
var P={x:(A.x+B.x)/2,y:H/2-r*0.85};
var Q={x:(A.x+B.x)/2,y:H/2+r*0.85};
var M={x:(A.x+B.x)/2,y:H/2};

var step=0;
var steps=[
  {title:'Step 1 of 5: Mark endpoints A and B',
   desc:'We are given segment AB. We will construct its perpendicular bisector using only compass and straightedge.',
   draw:function(){drawSeg();drawPt(A,'A',-12,16,'#374151');drawPt(B,'B',10,16,'#374151');}},
  {title:'Step 2 of 5: Arc from center A',
   desc:'Set compass radius > ½AB. With center A, draw an arc intersecting both above and below AB. Any radius greater than half the length works — we just need the two arcs to intersect.',
   draw:function(){
     drawSeg();
     ctx.strokeStyle='#1e3a5f44';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
     ctx.beginPath();ctx.arc(A.x,A.y,r,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);
     ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
     ctx.beginPath();ctx.arc(A.x,A.y,r,-Math.PI*0.9,-Math.PI*0.1);ctx.stroke();
     ctx.beginPath();ctx.arc(A.x,A.y,r,Math.PI*0.1,Math.PI*0.9);ctx.stroke();
     drawPt(A,'A',-12,16,'#1e3a5f');drawPt(B,'B',10,16,'#374151');
   }},
  {title:'Step 3 of 5: Arc from center B (same radius)',
   desc:'Without changing the compass width, place the center at B and draw arcs that intersect the first pair. The equal radii ensure the intersection points P and Q are equidistant from both A and B.',
   draw:function(){
     drawSeg();
     ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
     ctx.beginPath();ctx.arc(A.x,A.y,r,-Math.PI*0.9,-Math.PI*0.1);ctx.stroke();
     ctx.beginPath();ctx.arc(A.x,A.y,r,Math.PI*0.1,Math.PI*0.9);ctx.stroke();
     ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
     ctx.beginPath();ctx.arc(B.x,B.y,r,-Math.PI+0.1,-Math.PI*0.1);ctx.stroke();
     ctx.beginPath();ctx.arc(B.x,B.y,r,Math.PI*0.1,Math.PI-0.1);ctx.stroke();
     drawPt(A,'A',-12,16,'#1e3a5f');drawPt(B,'B',10,16,'#dc2626');
     drawPt(P,'P',8,-14,'#92400e');drawPt(Q,'Q',8,18,'#92400e');
   }},
  {title:'Step 4 of 5: Connect P and Q',
   desc:'Draw the line through the two intersection points P and Q. This line is the perpendicular bisector — but we still need to prove it.',
   draw:function(){
     drawSeg();
     ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2.5;
     ctx.beginPath();ctx.moveTo(P.x,P.y-20);ctx.lineTo(Q.x,Q.y+20);ctx.stroke();
     ctx.strokeStyle='#1e3a5f66';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
     ctx.beginPath();ctx.arc(A.x,A.y,r,-Math.PI*0.9,-Math.PI*0.1);ctx.stroke();
     ctx.beginPath();ctx.arc(A.x,A.y,r,Math.PI*0.1,Math.PI*0.9);ctx.stroke();
     ctx.strokeStyle='#dc262666';
     ctx.beginPath();ctx.arc(B.x,B.y,r,-Math.PI+0.1,-Math.PI*0.1);ctx.stroke();
     ctx.beginPath();ctx.arc(B.x,B.y,r,Math.PI*0.1,Math.PI-0.1);ctx.stroke();
     ctx.setLineDash([]);
     drawPt(A,'A',-12,16,'#374151');drawPt(B,'B',10,16,'#374151');
     drawPt(P,'P',8,-14,'#1a3a2a');drawPt(Q,'Q',8,18,'#1a3a2a');
   }},
  {title:'Step 5 of 5: Verify — midpoint M, right angle',
   desc:'By SSS: AP=BP and AQ=BQ (equal radii), AB=AB. So △APB ≅ △AQB. Then by SAS on the smaller triangles: M bisects AB and ∠PMA = 90°. The line PQ is perpendicular to AB at its midpoint.',
   draw:function(){
     drawSeg();
     ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2.5;
     ctx.beginPath();ctx.moveTo(P.x,P.y-20);ctx.lineTo(Q.x,Q.y+20);ctx.stroke();
     // Right angle marker at M
     var sq=12;
     ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
     ctx.strokeRect(M.x,M.y-sq,sq,sq);
     // Equal length tick marks
     function tick(p1,p2,n){
       var mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
       var dx=p2.x-p1.x,dy=p2.y-p1.y,len=Math.hypot(dx,dy);
       var nx=-dy/len*7,ny=dx/len*7;
       for(var i=0;i<n;i++){
         var off=(i-(n-1)/2)*5;
         ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
         ctx.beginPath();ctx.moveTo(mx+nx+dx/len*off,my+ny+dy/len*off);ctx.lineTo(mx-nx+dx/len*off,my-ny+dy/len*off);ctx.stroke();
       }
     }
     tick(A,M,1);tick(M,B,1);
     drawPt(A,'A',-12,16,'#374151');drawPt(B,'B',10,16,'#374151');
     drawPt(M,'M (midpoint)',8,18,'#dc2626');
     drawPt(P,'P',8,-14,'#1a3a2a');drawPt(Q,'Q',8,18,'#1a3a2a');
     ctx.fillStyle='#1a3a2a';ctx.font='bold 13px Georgia';ctx.textAlign='center';
     ctx.fillText('PQ ⊥ AB and AM = MB ✓',W/2,H-10);
   }},
];

function drawSeg(){
  ctx.strokeStyle='#374151';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();
}
function drawPt(p,label,ox,oy,color){
  ctx.beginPath();ctx.arc(p.x,p.y,6,0,2*Math.PI);ctx.fillStyle=color||'#374151';ctx.fill();
  ctx.fillStyle=color||'#374151';ctx.font='bold 13px Georgia';ctx.textAlign='left';
  ctx.fillText(label,p.x+ox,p.y+oy);
}

function render(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  steps[step].draw();
  document.getElementById('step-lbl').textContent=steps[step].title;
  document.getElementById('step-desc').textContent=steps[step].desc;
  document.getElementById('prev-btn').style.opacity=step===0?'0.3':'1';
  document.getElementById('next-btn').style.opacity=step===steps.length-1?'0.3':'1';
}

document.getElementById('next-btn').onclick=function(){if(step<steps.length-1){step++;render();}};
document.getElementById('prev-btn').onclick=function(){if(step>0){step--;render();}};
render();`,
      outputHeight: 430,
    },

    // ── Construction 2: Angle bisector ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Construction 2: Angle Bisector

**Task:** Given angle ∠ABC, construct its bisector.

**Steps:**
1. With center B, draw an arc intersecting both sides of the angle at points D and E.
2. With center D and any radius, draw an arc inside the angle.
3. With the same radius and center E, draw an arc intersecting the first at point F.
4. Draw ray BF. This is the angle bisector.

**Proof:**

In triangles △BDF and △BEF:
- BD = BE (both radii from Step 1, equal compass setting)
- DF = EF (both radii from Steps 2–3, equal compass setting)
- BF = BF (common side)

By SSS, △BDF ≅ △BEF. Therefore ∠DBF = ∠EBF (corresponding angles). Ray BF bisects angle ∠DBE = ∠ABC. □

**Applications:**

The angle bisector appears throughout geometry:
- **Angle Bisector Theorem:** The bisector of an angle in a triangle divides the opposite side in the ratio of the adjacent sides: BD/DC = AB/AC.
- **Incircle:** The three angle bisectors of a triangle meet at a single point (the incenter), which is equidistant from all three sides. The circle centered at the incenter and tangent to all three sides is the inscribed circle (incircle).
- **Construction of 30°, 45°, 15°, etc.:** Bisecting a 60° angle gives 30°; bisecting a 90° gives 45°; bisecting a 45° gives 22.5°, and so on.`,
    },

    // ── Construction 3: Perpendicular from a point ────────────────────────────
    {
      type: 'markdown',
      instruction: `### Construction 3: Perpendicular from a Point to a Line

**Task:** Given line ℓ and point P not on ℓ, construct the perpendicular from P to ℓ.

**Steps:**
1. With center P and a radius large enough to intersect ℓ at two points, draw an arc cutting ℓ at A and B.
2. Construct the perpendicular bisector of AB (using Construction 1).
3. The perpendicular bisector of AB passes through P and is perpendicular to ℓ.

**Proof:**

The perpendicular bisector of AB is perpendicular to AB (which lies on ℓ) by the Perpendicular Bisector Theorem. Since PA = PB (equal radii from Step 1), P lies on the perpendicular bisector of AB. Therefore the perpendicular bisector passes through P and is perpendicular to ℓ. □

**Why this matters:** The foot of the perpendicular from P to ℓ is the closest point on ℓ to P. This is the definition of the distance from a point to a line — the perpendicular distance, not the distance to any arbitrary point on ℓ. Every distance formula in geometry and engineering refers to this perpendicular.

### Construction 4: Copying an Angle

**Task:** Copy angle ∠ABC to a new location.

**Steps:**
1. Draw a ray from the new vertex V.
2. With center B, draw arc intersecting both sides at D and E.
3. With the same radius and center V, draw an arc intersecting the new ray at D'.
4. With radius DE and center D', draw an arc intersecting the previous arc at E'.
5. Draw ray VE'. Angle ∠D'VE' = ∠ABC.

**Proof:** By SSS, △BDE ≅ △VD'E' (three pairs of equal sides by construction). Therefore ∠DBE = ∠D'VE'. □`,
    },

    // ── Visual 2 — Interactive construction canvas ────────────────────────────
    {
      type: 'js',
      instruction: `### Construction Playground: Perpendicular Bisector and Angle Bisector

Watch both constructions performed side by side. The left panel shows the perpendicular bisector with its proof annotations. The right panel shows the angle bisector. Drag the slider to reveal each construction step.`,
      html: `<div style="padding:8px 14px 0;background:#fafaf8;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <span style="font-family:Georgia,serif;font-size:13px">Construction progress:</span>
  <input type="range" id="prog-sl" min="0" max="100" value="0" style="flex:1;min-width:120px">
  <span id="prog-lbl" style="font-family:Georgia,serif;font-size:12px;color:#64748b;white-space:nowrap">0%</span>
</div>
<canvas id="cv" width="700" height="320"></canvas>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var sl=document.getElementById('prog-sl'),lbl=document.getElementById('prog-lbl');

function draw(){
  var p=parseInt(sl.value)/100;
  lbl.textContent=Math.round(p*100)+'%';
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  // Panel divider
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,16);ctx.lineTo(W/2,H-16);ctx.stroke();

  ctx.fillStyle='#374151';ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('Perpendicular Bisector',W/4,22);
  ctx.fillText('Angle Bisector',3*W/4,22);

  // ── LEFT: Perpendicular Bisector ──
  var A={x:60,y:H/2},B={x:300,y:H/2};
  var r2=120;
  var Pm={x:180,y:H/2-r2*0.9};
  var Qm={x:180,y:H/2+r2*0.9};
  var M={x:180,y:H/2};

  ctx.strokeStyle='#374151';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();
  [{p:A,l:'A',ox:-14,oy:16},{p:B,l:'B',ox:8,oy:16}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle='#374151';ctx.fill();
    ctx.fillStyle='#374151';ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  // Arc from A
  if(p>0.1){
    ctx.globalAlpha=Math.min(1,(p-0.1)/0.2);
    ctx.strokeStyle='#1e3a5f';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(A.x,A.y,r2,-1.4,-0.2);ctx.stroke();
    ctx.beginPath();ctx.arc(A.x,A.y,r2,0.2,1.4);ctx.stroke();
    ctx.globalAlpha=1;
  }
  // Arc from B
  if(p>0.3){
    ctx.globalAlpha=Math.min(1,(p-0.3)/0.2);
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(B.x,B.y,r2,Math.PI+0.2,Math.PI*2-0.2);ctx.stroke();
    ctx.beginPath();ctx.arc(B.x,B.y,r2,Math.PI*1,Math.PI-0.2,true);ctx.stroke();
    ctx.globalAlpha=1;
    ctx.beginPath();ctx.arc(Pm.x,Pm.y,5,0,2*Math.PI);ctx.fillStyle='#92400e';ctx.fill();
    ctx.beginPath();ctx.arc(Qm.x,Qm.y,5,0,2*Math.PI);ctx.fillStyle='#92400e';ctx.fill();
    ctx.fillStyle='#92400e';ctx.font='bold 12px Georgia';ctx.textAlign='left';
    ctx.fillText('P',Pm.x+8,Pm.y-6);ctx.fillText('Q',Qm.x+8,Qm.y+14);
  }
  // Bisector line
  if(p>0.6){
    ctx.globalAlpha=Math.min(1,(p-0.6)/0.2);
    ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(Pm.x,Pm.y-14);ctx.lineTo(Qm.x,Qm.y+14);ctx.stroke();
    ctx.globalAlpha=1;
  }
  // Proof annotations
  if(p>0.8){
    ctx.globalAlpha=Math.min(1,(p-0.8)/0.2);
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;ctx.strokeRect(M.x,M.y-10,10,10);
    ctx.fillStyle='#1a3a2a';ctx.font='11px Georgia';ctx.textAlign='center';
    ctx.fillText('AP=BP, AQ=BQ',M.x,M.y+28);
    ctx.fillText('SSS → ✓',M.x,M.y+42);
    ctx.globalAlpha=1;
  }

  // ── RIGHT: Angle Bisector ──
  var Bv={x:W/2+50,y:H*0.72};
  var r3=90;
  // Two rays from B at 50° apart
  var ray1Ang=-Math.PI*0.7,ray2Ang=-Math.PI*0.3;
  var D={x:Bv.x+r3*Math.cos(ray1Ang),y:Bv.y+r3*Math.sin(ray1Ang)};
  var E={x:Bv.x+r3*Math.cos(ray2Ang),y:Bv.y+r3*Math.sin(ray2Ang)};
  var bisectAng=(ray1Ang+ray2Ang)/2;
  var Fb={x:Bv.x+r3*1.5*Math.cos(bisectAng),y:Bv.y+r3*1.5*Math.sin(bisectAng)};

  // Rays
  ctx.strokeStyle='#374151';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(Bv.x,Bv.y);ctx.lineTo(Bv.x+r3*1.6*Math.cos(ray1Ang),Bv.y+r3*1.6*Math.sin(ray1Ang));ctx.stroke();
  ctx.beginPath();ctx.moveTo(Bv.x,Bv.y);ctx.lineTo(Bv.x+r3*1.6*Math.cos(ray2Ang),Bv.y+r3*1.6*Math.sin(ray2Ang));ctx.stroke();
  ctx.beginPath();ctx.arc(Bv.x,Bv.y,5,0,2*Math.PI);ctx.fillStyle='#374151';ctx.fill();
  ctx.fillStyle='#374151';ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText('B',Bv.x,Bv.y+18);

  // Arc from B
  if(p>0.15){
    ctx.globalAlpha=Math.min(1,(p-0.15)/0.15);
    ctx.strokeStyle='#1e3a5f';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(Bv.x,Bv.y,r3,ray1Ang,ray2Ang);ctx.stroke();
    ctx.beginPath();ctx.arc(D.x,D.y,5,0,2*Math.PI);ctx.fillStyle='#1e3a5f';ctx.fill();
    ctx.beginPath();ctx.arc(E.x,E.y,5,0,2*Math.PI);ctx.fillStyle='#1e3a5f';ctx.fill();
    ctx.fillStyle='#1e3a5f';ctx.font='bold 12px Georgia';ctx.textAlign='left';
    ctx.fillText('D',D.x+8,D.y+4);ctx.fillText('E',E.x+8,E.y+4);
    ctx.globalAlpha=1;
  }
  // Arcs from D and E
  if(p>0.4){
    ctx.globalAlpha=Math.min(1,(p-0.4)/0.2);
    var r4=Math.hypot(D.x-E.x,D.y-E.y)*0.6;
    ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(D.x,D.y,r4,ray2Ang-0.8,ray1Ang+0.8);ctx.stroke();
    ctx.strokeStyle='#92400e';
    ctx.beginPath();ctx.arc(E.x,E.y,r4,ray1Ang-0.8,ray2Ang+0.8,true);ctx.stroke();
    ctx.beginPath();ctx.arc(Fb.x,Fb.y,5,0,2*Math.PI);ctx.fillStyle='#92400e';ctx.fill();
    ctx.fillStyle='#92400e';ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText('F',Fb.x+8,Fb.y+4);
    ctx.globalAlpha=1;
  }
  // Bisector ray
  if(p>0.65){
    ctx.globalAlpha=Math.min(1,(p-0.65)/0.2);
    ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2.5;ctx.setLineDash([8,4]);
    ctx.beginPath();ctx.moveTo(Bv.x,Bv.y);ctx.lineTo(Fb.x,Fb.y);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=1;
  }
  if(p>0.85){
    ctx.globalAlpha=Math.min(1,(p-0.85)/0.15);
    ctx.fillStyle='#1a3a2a';ctx.font='11px Georgia';ctx.textAlign='center';
    ctx.fillText('BD=BE, DF=EF, BF=BF',Bv.x+50,Bv.y+36);
    ctx.fillText('SSS → ∠DBF = ∠EBF ✓',Bv.x+50,Bv.y+50);
    ctx.globalAlpha=1;
  }
}
sl.oninput=draw;
draw();`,
      outputHeight: 380,
    },

    // ── The three impossible problems ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Three Impossible Problems

For over 2,000 years, Greek geometers attacked three construction problems that resisted all attempts:

**1. Squaring the Circle:** Construct a square with the same area as a given circle. This requires constructing a length of √π. In 1882, Lindemann proved that π is transcendental — it cannot be the root of any polynomial equation with rational coefficients. Lengths constructible with compass and straightedge are always algebraic (roots of polynomials with rational coefficients). Therefore π — and hence √π — is not constructible. The problem is provably impossible.

**2. Doubling the Cube:** Construct a cube with twice the volume of a given cube. If the original has side 1 and volume 1, the new cube needs side ∛2 and volume 2. Wantzel proved in 1837 that ∛2 is not constructible — it satisfies the polynomial x³ − 2 = 0, which is irreducible over the rationals and has degree 3. Constructible lengths correspond to numbers reachable by a tower of square-root operations (field extensions of degree 2). Cube roots require degree-3 extensions, which are not reachable.

**3. Trisecting the Angle:** Given an arbitrary angle, construct one-third of it. For some specific angles trisection is possible (90°: one-third is 30°, which is constructible). But for a general angle — specifically 60° — trisection requires constructing cos(20°), which satisfies the irreducible cubic 8x³ − 6x − 1 = 0. Again, degree 3, not constructible.

The common thread: compass-and-straightedge constructions correspond to building field extensions of degree 2 over the rationals. Any length reachable must satisfy a polynomial of degree 2ⁿ. These three problems require degree-3 extensions, which fall outside this tower.

**What was actually proven:** The impossibility proofs don't say "no one has been clever enough yet." They say "the required numbers live in a different algebraic tier from the numbers compass and straightedge can reach." No cleverness, however infinite, can bridge that gap.

This is one of the most profound lessons in mathematics: proving that something is impossible is a legitimate and important mathematical achievement — often harder than finding a construction, and more illuminating.`,
    },

    // ── Visual 3 — Constructible numbers ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### What Compass and Straightedge Can and Cannot Build

The interactive shows the hierarchy of constructible numbers. Every number reachable by compass and straightedge is algebraic of degree 2ⁿ. The three impossible problems require degree 3. Click any node to see what operations created it.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>
<div id="node-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:#fafaf8;border-top:1px solid #e2e8f0;line-height:1.7"></div>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

var nodes=[
  {id:'Q',x:W/2,y:50,label:'ℚ (rationals)',color:'#1e3a5f',
   desc:'Starting point: all rational numbers. Any length measurable with a marked ruler is here.',
   constructible:true},
  {id:'sqrt2',x:W/2-140,y:140,label:'√2, √3, √5...',color:'#1a3a2a',
   desc:'Square roots of rationals. Constructible by the geometric mean construction or the right-triangle method. Degree 2 over ℚ.',
   constructible:true},
  {id:'sqrt_sqrt',x:W/2-220,y:230,label:'√(2+√3), etc.',color:'#1a3a2a',
   desc:'Nested square roots — square roots of expressions already containing square roots. Still degree 2ⁿ. Constructible.',
   constructible:true},
  {id:'trig',x:W/2+140,y:140,label:'cos(30°)=√3/2\ncos(45°)=√2/2',color:'#1a3a2a',
   desc:'Trig values for constructible angles. 30°, 45°, 60°, 90° are constructible. Their cosines are square roots of rationals.',
   constructible:true},
  {id:'cbrt2',x:W/2+80,y:240,label:'∛2',color:'#dc2626',
   desc:'Cube root of 2. Satisfies x³ − 2 = 0 (degree 3, irreducible over ℚ). NOT constructible. This is why the cube cannot be doubled.',
   constructible:false},
  {id:'cos20',x:W/2+220,y:240,label:'cos(20°)',color:'#dc2626',
   desc:'Satisfies 8x³ − 6x − 1 = 0 (degree 3). NOT constructible. This is why a 60° angle cannot be trisected.',
   constructible:false},
  {id:'pi',x:W/2-80,y:310,label:'π, √π',color:'#dc2626',
   desc:'π is transcendental — not algebraic at all. NOT constructible. This is why the circle cannot be squared.',
   constructible:false},
];

var edges=[
  ['Q','sqrt2'],['Q','trig'],['sqrt2','sqrt_sqrt'],['trig','cos20'],['Q','cbrt2'],['Q','pi']
];

var selected=null;

cv.onclick=function(e){
  var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  nodes.forEach(function(n){
    if(Math.hypot(mx-n.x,my-n.y)<28){selected=n.id;draw();}
  });
};

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  // Edges
  edges.forEach(function(e){
    var from=nodes.find(function(n){return n.id===e[0];});
    var to=nodes.find(function(n){return n.id===e[1];});
    ctx.strokeStyle=to.constructible?'#94a3b8':'rgba(220,38,38,0.3)';
    ctx.lineWidth=to.constructible?1.5:1.5;
    ctx.setLineDash(to.constructible?[]:[5,4]);
    ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();
    ctx.setLineDash([]);
  });

  // Region labels
  ctx.fillStyle='rgba(26,58,42,0.08)';ctx.beginPath();ctx.roundRect(30,100,W/2+40,180,12);ctx.fill();
  ctx.fillStyle='rgba(220,38,38,0.06)';ctx.beginPath();ctx.roundRect(W/2+50,200,230,130,12);ctx.fill();
  ctx.fillStyle='rgba(220,38,38,0.06)';ctx.beginPath();ctx.roundRect(30,280,200,50,12);ctx.fill();

  ctx.fillStyle='#1a3a2a';ctx.font='italic 11px Georgia';ctx.textAlign='left';
  ctx.fillText('Constructible with compass + straightedge',38,116);
  ctx.fillStyle='#dc2626';ctx.font='italic 11px Georgia';
  ctx.fillText('NOT constructible (degree 3 or transcendental)',W/2+58,216);

  // Nodes
  nodes.forEach(function(n){
    var isSel=n.id===selected;
    ctx.beginPath();ctx.arc(n.x,n.y,isSel?22:18,0,2*Math.PI);
    ctx.fillStyle=n.constructible?n.color+'22':'rgba(220,38,38,0.12)';
    ctx.fill();
    ctx.strokeStyle=n.constructible?n.color:'#dc2626';
    ctx.lineWidth=isSel?3:2;
    ctx.stroke();
    if(isSel){ctx.shadowColor=n.color;ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;}

    ctx.fillStyle=n.constructible?n.color:'#dc2626';
    ctx.font=(isSel?'bold ':'')+'10px Georgia';
    ctx.textAlign='center';ctx.textBaseline='middle';
    var lines=n.label.split('\n');
    lines.forEach(function(line,i){ctx.fillText(line,n.x,n.y+(i-(lines.length-1)/2)*12);});
    ctx.textBaseline='alphabetic';
  });

  // Info
  var infoEl=document.getElementById('node-info');
  if(selected){
    var node=nodes.find(function(n){return n.id===selected;});
    infoEl.innerHTML='<strong style="color:'+node.color+'">'+node.label.replace('\n',' / ')+'</strong>'
      +' — '+(node.constructible?'<span style="color:#1a3a2a">Constructible ✓</span>':'<span style="color:#dc2626">NOT constructible ✗</span>')
      +'<br>'+node.desc;
  } else {
    infoEl.textContent='Click any node to learn about that number\'s constructibility.';
  }
}
draw();`,
      outputHeight: 400,
    },

    // ── Constructing regular polygons ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Regular Polygons: Which Are Constructible?

Gauss proved in 1796 (at age 19) that a regular n-gon is constructible if and only if n is of the form:

$$n = 2^k \\cdot p_1 \\cdot p_2 \\cdots p_m$$

where k ≥ 0 and p₁, p₂, ..., pₘ are distinct **Fermat primes** — primes of the form 2^(2^k) + 1.

The known Fermat primes are: **3, 5, 17, 257, 65537**. No other Fermat primes are known (and it's an open problem whether there are any more).

**Constructible regular polygons (selected examples):**
- n = 3: equilateral triangle ✓ (3 is a Fermat prime)
- n = 4: square ✓ (4 = 2²)
- n = 5: pentagon ✓ (5 is a Fermat prime)
- n = 6: hexagon ✓ (6 = 2 × 3)
- n = 15: 15-gon ✓ (15 = 3 × 5, both Fermat primes)
- n = 17: 17-gon ✓ (17 is a Fermat prime — Gauss's discovery at 19)

**Not constructible:**
- n = 7: heptagon ✗ (7 is prime but not a Fermat prime)
- n = 9: nonagon ✗ (9 = 3² — requires trisecting a 60° angle)
- n = 11, 13, 14: ✗

Gauss was so proud of discovering the constructibility of the regular 17-gon that he asked for it to be engraved on his tombstone. (The stonemason reportedly declined, saying it would look like a circle.)

### The Construction of the Regular Pentagon

The regular pentagon uses the golden ratio φ = (1+√5)/2, which is constructible (it's a square root). The key length is the diagonal of a unit pentagon, which equals φ times the side length. Here is the classic construction, which requires about 15 steps from a given circle.`,
    },

    // ── Challenges ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In the construction of the perpendicular bisector of segment AB, the compass is set to a radius greater than half of AB. Why must the radius be greater than half AB? What goes wrong if the radius is exactly half, or less than half?`,
      options: [
        { label: 'A', text: 'The radius must be greater than half AB so the arcs from A and B overlap and intersect, creating points P and Q. If the radius is ≤ ½AB, the arcs don\'t reach each other and there are no intersection points — the construction fails.' },
        { label: 'B', text: 'The radius must be greater than half AB so the construction lines look symmetrical.' },
        { label: 'C', text: 'Any radius works; the size is only a matter of preference.' },
        { label: 'D', text: 'The radius must equal AB exactly for the construction to produce a right angle.' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Two circles each of radius r centered at A and B (distance d apart) intersect if and only if |d − r| < r < d + r, which simplifies to r > d/2. If r ≤ d/2, the circles don\'t reach each other and the arcs never cross. No intersection points P and Q means no bisector line. The constraint r > ½AB is not aesthetic — it is logically necessary for the construction to succeed.',
      failMessage: 'Think about when two circles intersect. Circles centered at A and B with the same radius r intersect when r > ½AB (the circles must overlap). If r = ½AB exactly, they touch at one point — on segment AB itself, not above or below it — and the construction degenerates. If r < ½AB, the circles don\'t reach each other at all. The radius must strictly exceed ½AB.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `The ancient problem of trisecting an arbitrary angle cannot be solved with compass and straightedge. Which mathematical fact makes it impossible, and what does this mean in practice?`,
      options: [
        { label: 'A', text: 'It is impossible because angles cannot be divided into three equal parts.' },
        { label: 'B', text: 'It is impossible because compass and straightedge can only construct lengths satisfying polynomials of degree 2ⁿ. Trisecting 60° requires constructing cos(20°), which satisfies an irreducible cubic (degree 3). Degree 3 is unreachable. In practice: no sequence of compass and straightedge steps — however clever — will ever trisect a general angle.' },
        { label: 'C', text: 'It is impossible because no one has been clever enough to find the construction yet.' },
        { label: 'D', text: 'It is impossible in Euclidean geometry but possible in non-Euclidean geometry.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. This is one of the most important lessons in mathematics: impossibility can be proven. Wantzel\'s 1837 proof showed that the constructible numbers form a field closed under square roots, but not cube roots. cos(20°) satisfies 8x³ − 6x − 1 = 0, an irreducible cubic — it requires a degree-3 field extension, which lies outside the reach of compass and straightedge. No amount of ingenuity can overcome a structural algebraic barrier.',
      failMessage: 'Trisection of individual angles like 90° is possible (one-third is 30°, which is constructible). The impossibility is about *arbitrary* angles. The proof: constructible lengths are exactly those satisfying polynomials of degree 2ⁿ. Trisecting 60° requires cos(20°), which satisfies 8x³ − 6x − 1 = 0 — irreducible over ℚ, degree 3. This degree is unreachable, so the construction is provably impossible — not just hard.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `You want to construct a 75° angle using only compass and straightedge. Is this possible? If so, describe a strategy. (Hint: 75 = 45 + 30.)`,
      options: [
        { label: 'A', text: 'No — 75° is not a standard angle.' },
        { label: 'B', text: 'Yes. Construct a 90° angle (perpendicular), bisect it to get 45°. Construct a 60° equilateral triangle angle, bisect it to get 30°. Then add: place the 30° adjacent to the 45°. Since 45° and 30° are both constructible and addition of angles is achievable by adjacent placement, 75° = 45° + 30° is constructible.' },
        { label: 'C', text: 'No — 75° is not a multiple of 15°.' },
        { label: 'D', text: 'Yes, but only by trisecting a 225° angle.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Constructible angles are closed under addition and halving. 60° is constructible (equilateral triangle). 30° = 60°/2 is constructible (bisect 60°). 90° is constructible (perpendicular). 45° = 90°/2 is constructible. 75° = 45° + 30°: construct the 45° and 30° at the same vertex with a shared ray, and the outer ray makes 75°. Any angle of the form k × (360°/2ⁿ) or sums of such angles with any constructible fraction is constructible.',
      failMessage: '75 = 45 + 30. Both 45° and 30° are constructible: 90° is constructible (erect a perpendicular), halve it to get 45°. 60° is constructible (equilateral triangle), halve it to get 30°. To add angles: construct both angles at the same vertex with one shared side — the outer side makes the sum angle. 75° = 45° + 30° is constructible.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },
  ],
};

export default {
  id: 'geo-2-2',
  slug: 'constructions',
  chapter: 'geometry-2',
  order: 2,
  title: 'Classical Constructions',
  subtitle: 'How compass and straightedge implement the axioms directly — and why three problems resisted solution for 2,000 years.',
  tags: ['geometry', 'constructions', 'compass-straightedge', 'perpendicular-bisector', 'angle-bisector', 'impossible-constructions', 'Galois'],
  hook: {
    question: 'How do you draw a perfect perpendicular without a ruler — and why did three ancient problems take 2,000 years to solve?',
    realWorldContext: 'Compass-and-straightedge constructions implement Euclid\'s postulates directly. The impossibility proofs for squaring the circle, doubling the cube, and trisecting the angle — solved only in the 19th century using abstract algebra — are among mathematics\' greatest achievements.',
    previewVisualizationId: 'G2_3_Constructions',
  },
  intuition: {
    prose: [
      'Straightedge: draws lines through two points. Compass: draws circles and transfers distances. No measurements.',
      'Perpendicular bisector: two arcs of equal radius from each endpoint → intersection points determine the bisector. Proof: SSS congruence.',
      'Angle bisector: arc from vertex + equal arcs from the two ray-points → intersection gives bisector. Proof: SSS congruence.',
      'Constructible numbers: lengths satisfying polynomials of degree 2ⁿ. Square roots yes; cube roots no.',
      'Three impossible problems: squaring the circle (π transcendental), doubling the cube (∛2 degree 3), trisecting an angle (cos(20°) degree 3).',
    ],
    callouts: [
      { type: 'important', title: 'Impossibility is provable', body: 'The three classical problems are not unsolved — they are proven impossible. Wantzel (1837) proved trisection and cube-doubling impossible. Lindemann (1882) proved squaring the circle impossible. These are not "too hard" — they are structurally unreachable by compass and straightedge.' },
    ],
    visualizations: [{ id: 'G2_3_Constructions', title: 'Step-by-Step Classical Constructions' }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Every construction step: draw a line through two points (straightedge) or draw a circle with given center and radius (compass).',
    'Proof of construction = congruence (usually SSS) showing the constructed object has the required property.',
    'Constructible lengths ↔ polynomials of degree 2ⁿ over ℚ. Square roots reachable; cube roots not.',
    'Regular n-gon constructible iff n = 2ᵏ × (distinct Fermat primes). Known Fermat primes: 3, 5, 17, 257, 65537.',
    'Impossible ≠ unsolved. Proved impossible by showing required algebraic structure is unreachable.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_GEO_2_2 };
