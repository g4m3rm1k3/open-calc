// Geometry · Chapter 2 · Lesson 3 (variant)
// Parallel Lines in Depth — and the geo-2 Similarity lesson
// NOTE: Two lessons in one file, each exported separately.

// ─────────────────────────────────────────────────────────────────────────────
// LESSON A: Parallel Lines (Chapter 2 deeper treatment)
// ─────────────────────────────────────────────────────────────────────────────

const LESSON_GEO_2_PARALLEL = {
  title: 'Parallel Lines: Deeper Applications',
  subtitle: 'From angle pairs to polygon angle sums — what parallel lines really unlock.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Building on Parallel Lines

In Chapter 1 we proved the three core parallel-line theorems: corresponding angles equal, alternate interior angles equal, co-interior angles supplementary. We proved the Triangle Angle Sum Theorem using a single parallel line auxiliary construction.

In this lesson we go deeper: using parallel lines to derive the angle sum of any polygon, prove properties of parallelograms, and understand why the parallel structure of coordinate grids makes distance and slope calculations work the way they do.

The key idea is **transitive parallelism**: if ℓ₁ ∥ ℓ₂ and ℓ₂ ∥ ℓ₃, then ℓ₁ ∥ ℓ₃. This lets us chain parallel relationships, which is exactly what happens inside polygons and parallelograms.

We'll also revisit the Fifth Postulate from a new angle: **Playfair's Axiom** (the most common modern equivalent) states that through any point not on a line, there is *exactly one* line parallel to the given line. The word "exactly" does both halves of the work — it guarantees existence (at least one) and uniqueness (at most one). Non-Euclidean geometries violate exactly one of these: spherical geometry has zero parallels, hyperbolic geometry has infinitely many.`,
    },

    {
      type: 'markdown',
      instruction: `### Polygon Angle Sums: Triangles All the Way Down

Any polygon can be divided into triangles from a single interior vertex. A polygon with n sides, triangulated from one vertex, produces (n−2) triangles.

**Interior angle sum of a convex polygon with n sides:**

$$S = (n-2) \\times 180°$$

**Proof by triangulation:**

Choose any interior vertex V of the polygon. Draw diagonals from V to all non-adjacent vertices. This divides the polygon into (n−2) triangles, all sharing vertex V.

Each triangle contributes 180° to the total angle sum. The angles at V from all triangles together make up the interior angle at V, and the angles at the base vertices of each triangle correspond exactly to the remaining interior angles of the polygon.

Total angle sum = (n−2) × 180°. □

**Check:**
- Triangle (n=3): (3−2) × 180° = 180° ✓
- Quadrilateral (n=4): (4−2) × 180° = 360° ✓
- Pentagon (n=5): (5−2) × 180° = 540° ✓
- Hexagon (n=6): (6−2) × 180° = 720° ✓

**Exterior angle sum:** For any convex polygon, walk along all sides and turn at each vertex. You make one full rotation (360°), so the sum of all exterior angles is always 360° — regardless of the number of sides.

**Regular polygon interior angle:** If the polygon is regular (all sides and angles equal), each interior angle = (n−2) × 180° / n.`,
    },

    // ── Visual 1 — Polygon angle sums ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Polygon Angle Sum: The Triangulation Argument

Adjust the number of sides. Watch the polygon triangulate from one vertex, and see the angle sum formula in action.`,
      html: `<div style="padding:10px 14px 0;background:#fafaf8;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <span style="font-family:Georgia,serif;font-size:13px">Sides: <strong id="n-lbl">5</strong></span>
  <input type="range" id="n-sl" min="3" max="12" value="5" style="flex:1;min-width:100px">
  <span id="formula-lbl" style="font-family:Georgia,serif;font-size:13px;color:#1e3a5f;font-weight:700"></span>
</div>
<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var nSl=document.getElementById('n-sl'),nLbl=document.getElementById('n-lbl'),fLbl=document.getElementById('formula-lbl');

function draw(){
  var n=parseInt(nSl.value);
  nLbl.textContent=n;
  var sum=(n-2)*180;
  var each=sum/n;
  fLbl.textContent='Sum = ('+(n-2)+')×180° = '+sum+'°  |  Each angle = '+each.toFixed(1)+'°';
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var cx=W/2,cy=H/2,R=120;
  var pts=[];
  for(var i=0;i<n;i++){
    var a=-Math.PI/2+i*2*Math.PI/n;
    pts.push({x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)});
  }

  // Polygon fill
  ctx.fillStyle='rgba(59,130,246,0.06)';
  ctx.beginPath();pts.forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
  ctx.closePath();ctx.fill();
  // Polygon outline
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;
  ctx.beginPath();pts.forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
  ctx.closePath();ctx.stroke();

  // Triangulation diagonals from vertex 0
  var triColors=['#1a3a2a','#92400e','#7c3aed','#0891b2','#b45309','#dc2626','#1e3a5f','#374151','#065f46','#6b21a8'];
  for(var j=1;j<n-1;j++){
    ctx.strokeStyle=triColors[(j-1)%triColors.length]+'88';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);ctx.lineTo(pts[j+1].x,pts[j+1].y);ctx.stroke();
    ctx.setLineDash([]);
    // Triangle fill (alternating)
    ctx.fillStyle=triColors[(j-1)%triColors.length]+(j%2===0?'12':'06');
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.lineTo(pts[j+1].x,pts[j+1].y);ctx.closePath();ctx.fill();
  }
  // Re-draw outline on top
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;ctx.setLineDash([]);
  ctx.beginPath();pts.forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.closePath();ctx.stroke();

  // Triangle count label
  ctx.fillStyle='#1e3a5f';ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText((n-2)+' triangle'+(n-2>1?'s':'')+' × 180° = '+sum+'°',cx,H-10);

  // Vertex 0 highlight
  ctx.beginPath();ctx.arc(pts[0].x,pts[0].y,8,0,2*Math.PI);ctx.fillStyle='#1e3a5f';ctx.fill();
  ctx.fillStyle='#1e3a5f';ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText('V (base vertex)',pts[0].x+12,pts[0].y+4);
}
nSl.oninput=draw;draw();`,
      outputHeight: 360,
    },

    {
      type: 'markdown',
      instruction: `### Parallelograms: When Parallel Comes in Pairs

A **parallelogram** is a quadrilateral with both pairs of opposite sides parallel.

From this single definition, using the parallel-line theorems, we can derive all properties of parallelograms:

**Property 1: Opposite sides are equal.** (AB = CD, BC = DA)

**Proof:** Draw diagonal AC. △ABC and △CDA share AC. ∠BAC = ∠DCA (alternate interior angles, AB ∥ CD) and ∠BCA = ∠DAC (alternate interior angles, BC ∥ DA). By ASA, △ABC ≅ △CDA. By CPCTC, AB = CD and BC = DA. □

**Property 2: Opposite angles are equal.** (∠A = ∠C, ∠B = ∠D)

**Proof:** From Property 1, CPCTC gives ∠ABC = ∠CDA. For ∠A = ∠C: note that ∠A + ∠B = 180° (co-interior angles, AB ∥ CD) and ∠C + ∠B = 180° (co-interior angles, same side). Therefore ∠A = ∠C. □

**Property 3: Diagonals bisect each other.**

**Proof:** Let diagonals AC and BD intersect at M. In △ABM and △CDM: AB = CD (Property 1), ∠BAM = ∠DCM and ∠ABM = ∠CDM (alternate interior angles from both pairs of parallel sides). By ASA, △ABM ≅ △CDM. By CPCTC, AM = CM and BM = DM. □

**The converse theorems** (each independently sufficient to prove a quadrilateral is a parallelogram):
- Both pairs of opposite sides are equal → parallelogram
- Both pairs of opposite angles are equal → parallelogram
- Diagonals bisect each other → parallelogram
- One pair of sides is both parallel and equal → parallelogram`,
    },

    // ── Visual 2 — Parallelogram proof ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Parallelogram Properties: The Diagonal Proof

The animation shows the diagonal of a parallelogram creating two congruent triangles — the engine behind all three properties. Drag the corners to change the parallelogram shape and see the properties verified numerically.`,
      html: `<canvas id="cv" width="700" height="300" style="cursor:move"></canvas>
<div id="para-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:12px;background:#fafaf8;border-top:1px solid #e2e8f0;line-height:1.8"></div>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
// Parallelogram ABCD: A, B fixed base; D sets the slant; C = B + (D - A)
var pts=[{x:120,y:230},{x:420,y:230},{x:500,y:110},{x:200,y:110}];
var drag=-1;

cv.addEventListener('mousedown',function(e){var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);pts.forEach(function(p,i){if(Math.hypot(mx-p.x,my-p.y)<18&&i!==2)drag=i;});});
cv.addEventListener('mouseup',function(){drag=-1;});
cv.addEventListener('mousemove',function(e){
  if(drag<0)return;
  var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);
  if(drag===0){pts[0].x=Math.max(10,Math.min(W-10,mx));pts[0].y=Math.max(10,Math.min(H-10,my));}
  else if(drag===1){pts[1].x=Math.max(10,Math.min(W-10,mx));pts[1].y=Math.max(10,Math.min(H-10,my));}
  else if(drag===3){pts[3].x=Math.max(10,Math.min(W-10,mx));pts[3].y=Math.max(10,Math.min(H-10,my));}
  // Keep it a parallelogram: C = B + D - A
  pts[2].x=pts[1].x+pts[3].x-pts[0].x;
  pts[2].y=pts[1].y+pts[3].y-pts[0].y;
  draw();
});

function dist(p,q){return Math.hypot(p.x-q.x,p.y-q.y).toFixed(1);}
function angDeg(v,p,q){var a=Math.atan2(p.y-v.y,p.x-v.x),b=Math.atan2(q.y-v.y,q.x-v.x);var d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;return Math.round(d*180/Math.PI);}
function midPt(p,q){return{x:(p.x+q.x)/2,y:(p.y+q.y)/2};}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  var A=pts[0],B=pts[1],C=pts[2],D=pts[3];

  // Triangle ABD fill (blue)
  ctx.fillStyle='rgba(30,58,95,0.1)';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.fill();
  // Triangle ACD fill (green)
  ctx.fillStyle='rgba(26,58,42,0.1)';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(C.x,C.y);ctx.lineTo(D.x,D.y);ctx.closePath();ctx.fill();

  // Parallelogram outline
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.lineTo(D.x,D.y);ctx.closePath();ctx.stroke();

  // Diagonal AC
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.setLineDash([6,4]);
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(C.x,C.y);ctx.stroke();ctx.setLineDash([]);

  // Diagonal BD
  ctx.strokeStyle='#9333ea';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);
  ctx.beginPath();ctx.moveTo(B.x,B.y);ctx.lineTo(D.x,D.y);ctx.stroke();ctx.setLineDash([]);

  // Intersection M
  var M=midPt(A,C);
  ctx.beginPath();ctx.arc(M.x,M.y,5,0,2*Math.PI);ctx.fillStyle='#dc2626';ctx.fill();
  ctx.fillStyle='#dc2626';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.fillText('M',M.x,M.y-10);

  // Vertex labels
  var verts=[{p:A,l:'A',c:'#1e3a5f',ox:-14,oy:16},{p:B,l:'B',c:'#1e3a5f',ox:10,oy:16},{p:C,l:'C',c:'#1a3a2a',ox:10,oy:-10},{p:D,l:'D',c:'#1a3a2a',ox:-14,oy:-10}];
  verts.forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,6,0,2*Math.PI);ctx.fillStyle=v.c;ctx.fill();
    ctx.fillStyle=v.c;ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  // Tick marks: equal sides
  function tick(p1,p2,n,c){var mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2,dx=p2.x-p1.x,dy=p2.y-p1.y,len=Math.hypot(dx,dy),nx=-dy/len*7,ny=dx/len*7;for(var i=0;i<n;i++){var off=(i-(n-1)/2)*5;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mx+nx+dx/len*off,my+ny+dy/len*off);ctx.lineTo(mx-nx+dx/len*off,my-ny+dy/len*off);ctx.stroke();}}
  tick(A,B,1,'#1e3a5f');tick(D,C,1,'#1e3a5f');
  tick(A,D,2,'#1a3a2a');tick(B,C,2,'#1a3a2a');

  // Properties
  var AB=dist(A,B),DC=dist(D,C),AD=dist(A,D),BC_=dist(B,C);
  var angA=angDeg(A,B,D),angC=angDeg(C,B,D);
  var AM=dist(A,M),MC=dist(M,C),BM=dist(B,M),MD=dist(M,D);
  var infoEl=document.getElementById('para-info');
  infoEl.innerHTML='<strong>Properties verified:</strong> '
    +'<span style="color:#1e3a5f">AB = DC = '+AB+'</span> | '
    +'<span style="color:#1a3a2a">AD = BC = '+AD+'</span> '
    +'(opposite sides equal ✓)  |  '
    +'<span style="color:#dc2626">AM = '+AM+', MC = '+MC+'</span> '
    +'(AC bisected ✓)  |  '
    +'<span style="color:#9333ea">BM = '+BM+', MD = '+MD+'</span> '
    +'(BD bisected ✓)'
    +'<br><span style="color:#9ca3af;font-size:11px">Drag A, B, or D to change the parallelogram. All properties hold regardless of shape.</span>';
}
draw();`,
      outputHeight: 380,
    },

    {
      type: 'challenge',
      instruction: `A regular polygon has interior angles measuring 150°. How many sides does it have?`,
      options: [
        { label: 'A', text: '10 sides' },
        { label: 'B', text: '12 sides. Formula: each interior angle = (n−2)×180°/n = 150°. Solve: (n−2)×180 = 150n → 180n − 360 = 150n → 30n = 360 → n = 12.' },
        { label: 'C', text: '15 sides' },
        { label: 'D', text: '9 sides' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Each interior angle of a regular n-gon = (n−2)×180°/n. Set equal to 150°: (n−2)×180 = 150n. Expand: 180n − 360 = 150n. Subtract 150n: 30n = 360. Divide: n = 12. A regular dodecagon (12 sides) has interior angles of 150°.',
      failMessage: 'Use the formula: each interior angle of a regular n-gon = (n−2)×180°/n. Set this equal to 150 and solve for n: (n−2)×180 = 150n → 180n − 360 = 150n → 30n = 360 → n = 12.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `In parallelogram ABCD, ∠A = 3x + 10° and ∠C = 5x − 30°. Find x and all four angles.`,
      options: [
        { label: 'A', text: 'x = 20; ∠A = ∠C = 70°; ∠B = ∠D = 110°' },
        { label: 'B', text: 'x = 20; ∠A = ∠C = 70°; ∠B = ∠D = 110°. Since opposite angles are equal: 3x+10 = 5x−30 → 40 = 2x → x = 20. ∠A = 70°. Co-interior: ∠A + ∠B = 180° → ∠B = 110°.' },
        { label: 'C', text: 'x = 10; ∠A = ∠C = 40°' },
        { label: 'D', text: 'x = 20; ∠A = 70°; ∠C = 70°; ∠B = ∠D = 90°' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Property: opposite angles of a parallelogram are equal. So ∠A = ∠C: 3x+10 = 5x−30 → 2x = 40 → x = 20. Then ∠A = 3(20)+10 = 70° and ∠C = 5(20)−30 = 70° ✓. Co-interior angles sum to 180°: ∠B = 180°−70° = 110°. All four: 70°, 110°, 70°, 110°, summing to 360° ✓.',
      failMessage: 'Parallelogram: opposite angles are equal (∠A = ∠C). Set 3x+10 = 5x−30: subtract 3x from both sides: 10 = 2x−30; add 30: 40 = 2x; x = 20. Then ∠A = 70°, ∠C = 70°. Co-interior angles of a parallelogram are supplementary: ∠B = 180°−70° = 110°, ∠D = 110°.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON B: Similarity and Proportion
// ─────────────────────────────────────────────────────────────────────────────

const LESSON_GEO_2_SIMILARITY = {
  title: 'Similarity and Proportion',
  subtitle: 'How triangles of different sizes can be geometrically identical — and why this fact powers all of trigonometry.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Measuring the Unmeasurable

Around 600 BCE, the Greek philosopher Thales traveled to Egypt and stunned the Egyptian priests by measuring the height of the Great Pyramid — without a measuring rod long enough to reach the top.

His method: he waited until the moment of day when his own shadow equaled his height. At that moment, the pyramid's shadow also equaled the pyramid's height. By measuring the shadow of the pyramid on the ground (entirely possible), he obtained the height directly.

The deeper principle: a vertical stick and the Great Pyramid, illuminated by the same sun at the same angle, cast shadows in the same ratio as their heights. The triangles formed — stick, shadow, and sun ray; pyramid, shadow, and sun ray — are **similar**. Same shape, different scale.

This is the geometric core of similarity: if two figures have the same shape (all angles equal), then all corresponding lengths are in the same ratio. It doesn't matter whether the figure is 2 meters tall or 2,000 meters tall — the proportions are fixed by the angles alone.

Similarity is also the foundation of trigonometry. Why does "sin(30°) = 0.5" make sense as a universal constant? Because all right triangles with a 30° angle are similar — they all have the same ratio of opposite to hypotenuse, regardless of their size. Sin, cos, and tan are ratios of similar triangles.`,
    },

    {
      type: 'markdown',
      instruction: `### Defining Similarity Precisely

Two polygons are **similar** (symbol: ~) if:
1. All corresponding angles are equal, AND
2. All corresponding sides are in the same ratio (proportional).

For triangles, condition 2 follows from condition 1 — you only need to verify the angles. This is because a triangle's shape is completely determined by its angles (unlike other polygons, where knowing all angles doesn't fix the ratios — a rectangle and a square both have four 90° angles but are not necessarily similar).

If △ABC ~ △DEF with ratio k (the **scale factor**), then:
$$\\frac{DE}{AB} = \\frac{EF}{BC} = \\frac{FD}{CA} = k$$

and all corresponding angles are equal: ∠A = ∠D, ∠B = ∠E, ∠C = ∠F.

The scale factor k can be any positive number. If k = 1, the triangles are congruent (similar and equal in size).

**Similarity criteria for triangles** (parallel to the congruence criteria):

**AA (Angle-Angle):** If two angles of one triangle equal two angles of another, the triangles are similar. (The third angles are forced equal by the angle sum theorem.)

**SAS~ (Side-Angle-Side for similarity):** If two sides of one triangle are proportional to two sides of another, and the included angles are equal, the triangles are similar.

**SSS~ (Side-Side-Side for similarity):** If all three pairs of corresponding sides are proportional, the triangles are similar.

Note: for similarity, AA suffices where AAA is needed conceptually — proving two angles equal forces the third.`,
    },

    // ── Visual 1 — Similarity ratio explorer ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Similarity: Same Angles, Proportional Sides

Drag the scale slider to resize one triangle. Watch the side lengths change proportionally while all angles remain identical. The ratio of any pair of corresponding sides is always the scale factor k.`,
      html: `<div style="padding:10px 14px 0;background:#fafaf8;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <span style="font-family:Georgia,serif;font-size:13px">Scale factor k: <strong id="k-lbl">1.0</strong></span>
  <input type="range" id="k-sl" min="0.4" max="2.5" value="1.0" step="0.05" style="flex:1;min-width:120px">
</div>
<canvas id="cv" width="700" height="300"></canvas>
<div id="sim-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:#fafaf8;border-top:1px solid #e2e8f0;line-height:1.8"></div>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var kSl=document.getElementById('k-sl'),kLbl=document.getElementById('k-lbl');

// Base triangle: right triangle with legs 80, 60, hyp 100
var baseA={x:120,y:240},baseB={x:280,y:240},baseC={x:120,y:100};

function angD(v,p,q){var a=Math.atan2(p.y-v.y,p.x-v.x),b=Math.atan2(q.y-v.y,q.x-v.x);var d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;return Math.round(d*180/Math.PI);}
function dist(p,q){return Math.hypot(p.x-q.x,p.y-q.y).toFixed(1);}

function draw(){
  var k=parseFloat(kSl.value);
  kLbl.textContent=k.toFixed(2);
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  // Original triangle (fixed)
  ctx.fillStyle='rgba(30,58,95,0.1)';
  ctx.beginPath();ctx.moveTo(baseA.x,baseA.y);ctx.lineTo(baseB.x,baseB.y);ctx.lineTo(baseC.x,baseC.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(baseA.x,baseA.y);ctx.lineTo(baseB.x,baseB.y);ctx.lineTo(baseC.x,baseC.y);ctx.closePath();ctx.stroke();

  var angA1=angD(baseA,baseB,baseC),angB1=angD(baseB,baseA,baseC),angC1=angD(baseC,baseA,baseB);

  // Right angle at A
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=1.5;ctx.strokeRect(baseA.x,baseA.y-12,12,12);

  var verts1=[{p:baseA,l:'A',ox:-14,oy:16},{p:baseB,l:'B',ox:8,oy:16},{p:baseC,l:'C',ox:-18,oy:-6}];
  verts1.forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle='#1e3a5f';ctx.fill();
    ctx.fillStyle='#1e3a5f';ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  // Side labels
  ctx.fillStyle='#1e3a5f';ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText('AB='+dist(baseA,baseB),(baseA.x+baseB.x)/2,(baseA.y+baseB.y)/2+16);
  ctx.fillText('AC='+dist(baseA,baseC),(baseA.x+baseC.x)/2-22,(baseA.y+baseC.y)/2);
  ctx.fillText('BC='+dist(baseB,baseC),(baseB.x+baseC.x)/2+22,(baseB.y+baseC.y)/2);

  // Scaled triangle (right side)
  var cx2=510,cy2=220;
  var dx=baseB.x-baseA.x,dy=baseB.y-baseA.y;
  var dcx=baseC.x-baseA.x,dcy=baseC.y-baseA.y;
  var sA={x:cx2,y:cy2};
  var sB={x:cx2+dx*k*0.6,y:cy2+dy*k*0.6};
  var sC={x:cx2+dcx*k*0.6,y:cy2+dcy*k*0.6};

  ctx.fillStyle='rgba(26,58,42,0.12)';
  ctx.beginPath();ctx.moveTo(sA.x,sA.y);ctx.lineTo(sB.x,sB.y);ctx.lineTo(sC.x,sC.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(sA.x,sA.y);ctx.lineTo(sB.x,sB.y);ctx.lineTo(sC.x,sC.y);ctx.closePath();ctx.stroke();

  // Right angle at A'
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=1.5;ctx.strokeRect(sA.x,sA.y-12,12,12);

  var verts2=[{p:sA,l:"A'",ox:-18,oy:16},{p:sB,l:"B'",ox:8,oy:16},{p:sC,l:"C'",ox:-22,oy:-6}];
  verts2.forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle='#1a3a2a';ctx.fill();
    ctx.fillStyle='#1a3a2a';ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  ctx.fillStyle='#1a3a2a';ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText("A'B'="+dist(sA,sB),(sA.x+sB.x)/2,(sA.y+sB.y)/2+16);
  ctx.fillText("A'C'="+dist(sA,sC),(sA.x+sC.x)/2-22,(sA.y+sC.y)/2);
  ctx.fillText("B'C'="+dist(sB,sC),(sB.x+sC.x)/2+22,(sB.y+sC.y)/2);

  // Similarity label
  ctx.fillStyle='#374151';ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('△ABC ~ △A\'B\'C\'  (scale factor k = '+k.toFixed(2)+')',W/2,H-10);

  // Angles
  var angA2=angD(sA,sB,sC),angB2=angD(sB,sA,sC),angC2=angD(sC,sA,sB);

  document.getElementById('sim-info').innerHTML=
    '<strong>Angles:</strong> △ABC: ∠A='+angA1+'°, ∠B='+angB1+'°, ∠C='+angC1+'° | '
    +'△A\'B\'C\': ∠A\'='+angA2+'°, ∠B\'='+angB2+'°, ∠C\'='+angC2+'° '
    +'— <strong style="color:#1a3a2a">all equal ✓</strong>'
    +'<br><strong>Side ratios:</strong> A\'B\'/AB = '+k.toFixed(2)+', A\'C\'/AC = '+k.toFixed(2)+', B\'C\'/BC = '+k.toFixed(2)
    +' — <strong style="color:#1a3a2a">all equal to k = '+k.toFixed(2)+' ✓</strong>';
}
kSl.oninput=draw;draw();`,
      outputHeight: 400,
    },

    {
      type: 'markdown',
      instruction: `### Proving Triangles Similar: AA in Practice

The AA criterion is the workhorse. In most geometry problems, you identify two pairs of equal angles — one pair is often obvious (vertical angles, or a shared angle), and the second requires a theorem (parallel lines, inscribed angles, etc.).

**Classic configurations that produce similar triangles:**

**1. Parallel lines cutting two sides of a triangle (Triangle Proportionality Theorem):**
If a line parallel to one side of a triangle intersects the other two sides, it divides those sides proportionally. And the smaller triangle formed is similar to the original.

*Proof:* Let DE ∥ BC in △ABC. Then ∠ADE = ∠ABC (corresponding angles, DE ∥ BC) and ∠A is shared. By AA, △ADE ~ △ABC.

**2. Two triangles sharing an angle with a right angle in each:**
Two right triangles sharing an acute angle are similar (AA: the right angle and the shared acute angle).

**3. The altitude to the hypotenuse (from the Pythagorean proof):**
We proved earlier that in a right triangle, the altitude to the hypotenuse creates two triangles each similar to the original and to each other (AA: they share the right angle and each shares one other angle with the original).

**Using proportions once similarity is established:**

If △ABC ~ △DEF with ratio k, then:
$$\\frac{DE}{AB} = \\frac{EF}{BC} = \\frac{FD}{CA} = k$$

This gives you three equations to work with. Typically you know some lengths and use the proportions to find others. Cross-multiplication converts a proportion a/b = c/d into ad = bc, which is easier to solve.`,
    },

    {
      type: 'markdown',
      instruction: `### The Angle Bisector Theorem and Cross-Ratio

**Angle Bisector Theorem:** In △ABC, if BD bisects angle B (so ∠ABD = ∠CBD), then:

$$\\frac{AD}{DC} = \\frac{AB}{BC}$$

The angle bisector divides the opposite side in the ratio of the adjacent sides.

**Proof via parallel lines:** Draw a line through C parallel to BD, meeting AB extended at E. Then ∠CBE = ∠DBC = ∠ABD (alternate interior angles, CE ∥ BD, plus the bisector condition). So △BCE is isosceles with BC = CE. Now in △ABD and △AEC: ∠A is shared and ∠ADB = ∠AEC (corresponding angles, BD ∥ CE). By AA, △ABD ~ △AEC. Therefore:

$$\\frac{AD}{DC} = \\frac{AB}{CE} = \\frac{AB}{BC}$$

This theorem is used in triangle geometry (incircle, excircles), in mass-point geometry, and in computational geometry for triangle subdivision.

**The Midpoint Theorem:** The segment connecting the midpoints of two sides of a triangle is parallel to the third side and half its length.

**Proof:** Let M and N be midpoints of AB and AC. Draw MN. △AMN ~ △ABC (SAS~: AM/AB = AN/AC = 1/2, and ∠A is shared). The scale factor is 1/2, so MN = BC/2. Since corresponding sides of similar triangles are parallel (the AA + ratio criterion implies ∠AMN = ∠ABC, which means MN ∥ BC). □`,
    },

    // ── Visual 2 — Similar triangles in practice ──────────────────────────────
    {
      type: 'js',
      instruction: `### Similar Triangles: Finding Unknown Lengths

The classic application — two similar triangles where you know some sides and want to find others. Drag the slider to change what you know and see the proportion solve the unknown.`,
      html: `<div style="padding:10px 14px 0;background:#fafaf8;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <span style="font-family:Georgia,serif;font-size:13px">Known side AB: <strong id="ab-lbl">6</strong></span>
  <input type="range" id="ab-sl" min="3" max="12" value="6" style="flex:1;min-width:100px">
  <span style="font-family:Georgia,serif;font-size:13px">Known side A'B': <strong id="ab2-lbl">9</strong></span>
  <input type="range" id="ab2-sl" min="3" max="18" value="9" style="flex:1;min-width:100px">
</div>
<canvas id="cv" width="700" height="260"></canvas>
<div id="prop-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:#fafaf8;border-top:1px solid #e2e8f0;line-height:1.8"></div>`,
      css: `body{margin:0;background:#fafaf8}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var abSl=document.getElementById('ab-sl'),ab2Sl=document.getElementById('ab2-sl');
var abLbl=document.getElementById('ab-lbl'),ab2Lbl=document.getElementById('ab2-lbl');

function draw(){
  var AB=parseInt(abSl.value),AB2=parseInt(ab2Sl.value);
  abLbl.textContent=AB;ab2Lbl.textContent=AB2;
  var k=AB2/AB;
  // Fixed similar triangles, scaled by k
  var BC=8,AC=10; // original triangle sides
  var BC2=BC*k,AC2=AC*k;

  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var scale=14;
  // Left triangle
  var lA={x:80,y:220},lB={x:80+AB*scale,y:220},lC={x:80,y:220-AC*scale*0.8};
  ctx.fillStyle='rgba(30,58,95,0.1)';ctx.beginPath();ctx.moveTo(lA.x,lA.y);ctx.lineTo(lB.x,lB.y);ctx.lineTo(lC.x,lC.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(lA.x,lA.y);ctx.lineTo(lB.x,lB.y);ctx.lineTo(lC.x,lC.y);ctx.closePath();ctx.stroke();

  // Right angle
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=1.5;ctx.strokeRect(lA.x,lA.y-12,12,12);

  [{p:lA,l:'A',ox:-14,oy:16},{p:lB,l:'B',ox:6,oy:16},{p:lC,l:'C',ox:-16,oy:-6}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle='#1e3a5f';ctx.fill();
    ctx.fillStyle='#1e3a5f';ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });
  ctx.fillStyle='#1e3a5f';ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText('AB = '+AB,(lA.x+lB.x)/2,lA.y+18);
  ctx.fillText('BC = '+BC,(lB.x+lC.x)/2+20,(lB.y+lC.y)/2);
  ctx.fillStyle='#dc2626';ctx.font='bold 12px Georgia';ctx.fillText('AC = ?',lA.x-28,(lA.y+lC.y)/2);

  // Right triangle (scaled)
  var scale2=scale*k*0.75;
  var rA={x:430,y:220},rB={x:430+AB2*scale2/k,y:220},rC={x:430,y:220-AC2*scale2/k*0.8};
  ctx.fillStyle='rgba(26,58,42,0.12)';ctx.beginPath();ctx.moveTo(rA.x,rA.y);ctx.lineTo(rB.x,rB.y);ctx.lineTo(rC.x,rC.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(rA.x,rA.y);ctx.lineTo(rB.x,rB.y);ctx.lineTo(rC.x,rC.y);ctx.closePath();ctx.stroke();
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=1.5;ctx.strokeRect(rA.x,rA.y-12,12,12);

  [{p:rA,l:"A'",ox:-18,oy:16},{p:rB,l:"B'",ox:6,oy:16},{p:rC,l:"C'",ox:-20,oy:-6}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle='#1a3a2a';ctx.fill();
    ctx.fillStyle='#1a3a2a';ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });
  ctx.fillStyle='#1a3a2a';ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText("A'B' = "+AB2,(rA.x+rB.x)/2,(rA.y+rB.y)/2+18);
  ctx.fillText("B'C' = "+BC2.toFixed(1),(rB.x+rC.x)/2+22,(rB.y+rC.y)/2);
  ctx.fillStyle='#1a3a2a';ctx.font='bold 12px Georgia';
  ctx.fillText("A'C' = "+AC2.toFixed(1),rA.x-26,(rA.y+rC.y)/2);

  // Proportion display
  ctx.fillStyle='#374151';ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('△ABC ~ △A\'B\'C\'   k = A\'B\' / AB = '+AB2+' / '+AB+' = '+k.toFixed(3),W/2,H-10);

  document.getElementById('prop-info').innerHTML=
    '<strong>Proportion:</strong> AB/A\'B\' = BC/B\'C\' = AC/A\'C\' = 1/'+k.toFixed(2)
    +'<br><strong>Solving for A\'C\':</strong> AC/A\'C\' = AB/A\'B\' → '+AC+'/A\'C\' = '+AB+'/'+AB2
    +' → A\'C\' = '+AC+' × '+AB2+'/'+AB+' = <strong style="color:#1a3a2a">'+AC2.toFixed(2)+'</strong>'
    +'<br><span style="color:#9ca3af;font-size:11px">This is the universal method: identify the similar triangles, write the proportion, cross-multiply and solve.</span>';
}
abSl.oninput=draw;ab2Sl.oninput=draw;draw();`,
      outputHeight: 380,
    },

    {
      type: 'markdown',
      instruction: `### Similarity and Trigonometry: The Deep Connection

Similarity is why trigonometry makes sense as a subject.

Define, for any right triangle with an acute angle θ:
$$\\sin(\\theta) = \\frac{\\text{opposite}}{\\text{hypotenuse}}, \\quad \\cos(\\theta) = \\frac{\\text{adjacent}}{\\text{hypotenuse}}, \\quad \\tan(\\theta) = \\frac{\\text{opposite}}{\\text{adjacent}}$$

For these to be well-defined constants depending only on θ — not on the size of the triangle — we need: all right triangles with the same acute angle θ are similar (AA: the right angle and θ are shared). Since they are similar, the ratios of corresponding sides are all equal to the scale factor. In particular, the ratio opposite/hypotenuse is the same for every such triangle.

This is the fact that makes sin(θ) a function of θ alone, not of the triangle size. Without similarity, "sin(30°) = 0.5" would be meaningless — the ratio would change with the triangle.

**The small angle approximation:** For small θ (in radians), sin(θ) ≈ θ and tan(θ) ≈ θ. This comes from similar triangles: for a small angle, the arc, the opposite side, and the tangent are approximately equal. Engineers use this constantly (sin(5°) ≈ 0.0872 ≈ 5×π/180 = 0.0873).

**Scale factor and area:** If two similar figures have scale factor k, their areas are in ratio k². This is because area scales as the square of linear dimensions. If k = 2, the areas are in ratio 4:1. If a map has scale 1:50,000, actual area = map area × 50,000² = map area × 2.5 × 10⁹.`,
    },

    {
      type: 'challenge',
      instruction: `A flagpole casts a shadow 15 m long. At the same time, a nearby 2 m measuring stick casts a shadow 1.5 m long. How tall is the flagpole? Which theorem justifies the calculation?`,
      options: [
        { label: 'A', text: 'Height = 20 m. By AA similarity (same sun angle → same angle of elevation → same acute angle in both right triangles), the triangles are similar. Scale factor = 15/1.5 = 10. Flagpole = 2 m × 10 = 20 m.' },
        { label: 'B', text: 'Height = 22.5 m' },
        { label: 'C', text: 'Height = 10 m' },
        { label: 'D', text: 'Height = 17 m' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. The sun rays are parallel (the sun is effectively infinitely far away), so both triangles — (flagpole, shadow, sun ray) and (stick, shadow, sun ray) — have the same angle where the sun ray hits the ground. Both also have a right angle at the base. By AA similarity, the triangles are similar. Proportion: flagpole/stick = shadow_flagpole/shadow_stick → flagpole/2 = 15/1.5 → flagpole = 2 × 10 = 20 m.',
      failMessage: 'The sun rays are parallel (sun is very far away), creating two right triangles with the same angle of elevation. By AA similarity: right angle + equal sun angle → similar. Proportion: height/shadow = 2/1.5 (from the measuring stick). So flagpole height = 15 × (2/1.5) = 15 × (4/3) = 20 m.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `In △ABC, DE is drawn parallel to BC with D on AB and E on AC. If AD = 4, DB = 6, and BC = 15, find DE. State the theorem you used.`,
      options: [
        { label: 'A', text: 'DE = 6. Triangle Proportionality Theorem: DE/BC = AD/AB = 4/10 = 2/5. DE = 15 × (2/5) = 6.' },
        { label: 'B', text: 'DE = 9' },
        { label: 'C', text: 'DE = 10' },
        { label: 'D', text: 'DE = 7.5' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. DE ∥ BC → △ADE ~ △ABC (AA: ∠A shared, ∠ADE = ∠ABC as corresponding angles). Scale factor = AD/AB = 4/(4+6) = 4/10 = 2/5. Therefore DE/BC = 2/5, so DE = 15 × 2/5 = 6. The Triangle Proportionality Theorem gives this directly: a line parallel to one side creates a smaller similar triangle.',
      failMessage: 'DE ∥ BC means △ADE ~ △ABC by AA (∠A shared; ∠ADE = ∠ABC as corresponding angles from DE ∥ BC). AB = AD + DB = 4 + 6 = 10. Scale factor = AD/AB = 4/10 = 2/5. Corresponding sides are proportional: DE/BC = 2/5 → DE = BC × 2/5 = 15 × 2/5 = 6.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },

    {
      type: 'challenge',
      instruction: `Two similar triangles have a scale factor of 3. If the smaller triangle has area 12 cm², what is the area of the larger triangle?`,
      options: [
        { label: 'A', text: '36 cm²' },
        { label: 'B', text: '108 cm². Area scales as k² = 3² = 9. Larger area = 12 × 9 = 108 cm².' },
        { label: 'C', text: '36 cm²' },
        { label: 'D', text: '72 cm²' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. When two figures are similar with scale factor k, areas are in ratio k². Here k = 3, so k² = 9. Larger area = 12 × 9 = 108 cm². This is why doubling the dimensions of a square quadruples its area — and why a map at 1:100,000 scale has areas reduced by a factor of 10,000,000,000.',
      failMessage: 'Areas scale as k², not k. With scale factor k = 3: area ratio = 3² = 9. Larger area = 12 × 9 = 108 cm². A common error is multiplying by k (giving 36) instead of k² (giving 108). Remember: linear dimensions scale by k, areas scale by k², volumes scale by k³.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 270,
    },
  ],
};

// ─────── Exports ─────────────────────────────────────────────────────────────

export const GEO_2_PARALLEL_DEFAULT = {
  id: 'geo-2-parallel-deep',
  slug: 'parallel-lines-applications',
  chapter: 'geometry-2',
  order: 3,
  title: 'Parallel Lines: Deeper Applications',
  subtitle: 'From polygon angle sums to parallelogram properties — what parallel lines really unlock.',
  tags: ['geometry', 'parallel-lines', 'polygon-angles', 'parallelogram', 'angle-sum'],
  hook: {
    question: 'How does the Triangle Angle Sum theorem extend to all polygons — and why do all parallelogram properties follow from two parallel line relationships?',
    realWorldContext: 'Polygon angle sums power architectural design, tiling, and gear geometry. Parallelogram properties are the foundation of vector mathematics and structural engineering.',
    previewVisualizationId: 'G2_3_Constructions',
  },
  intuition: {
    prose: [
      'Polygon interior angle sum = (n−2)×180°, by triangulating from one vertex into (n−2) triangles.',
      'Exterior angle sum of any convex polygon = 360° (one full rotation).',
      'Parallelogram: both pairs opposite sides parallel → opposite sides equal, opposite angles equal, diagonals bisect each other. All proved by drawing one diagonal and applying ASA/CPCTC.',
    ],
    callouts: [
      { type: 'definition', title: 'Regular polygon interior angle', body: 'Each interior angle = (n−2)×180°/n. For n=6 (hexagon): 120°. For n=12 (dodecagon): 150°. As n→∞, approaches 180°.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Polygon angle sum = (n−2)×180°. Source: triangulation into (n−2) triangles.',
    'Exterior angle sum = 360° always (for convex polygons).',
    'Parallelogram: parallel sides → equal sides, equal angles, bisecting diagonals (all via ASA + CPCTC).',
    'Converse: if opposite sides equal (or angles equal, or diagonals bisect) → parallelogram.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export const GEO_2_SIMILARITY_DEFAULT = {
  id: 'geo-2-similarity',
  slug: 'similarity',
  chapter: 'geometry-2',
  order: 5,
  title: 'Similarity and Proportion',
  subtitle: 'How triangles of different sizes can be geometrically identical — and why this fact powers all of trigonometry.',
  tags: ['geometry', 'similarity', 'proportion', 'AA', 'scale-factor', 'trigonometry', 'angle-bisector'],
  hook: {
    question: 'How did Thales measure the height of the Great Pyramid without a measuring rod — and what does his method have to do with sine and cosine?',
    realWorldContext: 'Similar triangles power shadow measurements, map scales, architectural proportions, telescope and camera optics, and the very definition of trigonometric ratios. Similarity is why sin(30°) = 0.5 for every right triangle with a 30° angle, regardless of size.',
    previewVisualizationId: 'G2_4_SimilarTriangles',
  },
  intuition: {
    prose: [
      'Two triangles are similar (~) if all angles are equal. Then all corresponding sides are proportional with the same ratio k (scale factor).',
      'AA criterion: two pairs of equal angles → similar (third angle forced by angle sum).',
      'Classic similar triangle setups: parallel line across a triangle, altitude to hypotenuse, shadow-and-stick.',
      'Trig ratios (sin, cos, tan) are defined from similar triangles — the ratios are constant for a given angle regardless of triangle size.',
      'Area ratio = k². Linear scale factor k → area scales by k².',
    ],
    callouts: [
      { type: 'important', title: 'Why trig works', body: 'All right triangles with the same acute angle θ are similar (AA). Therefore the ratio opposite/hypotenuse is the same for all of them — it depends only on θ. That ratio is sin(θ). Without similarity, trigonometry would not exist.' },
    ],
    visualizations: [{ id: 'G2_4_SimilarTriangles', title: 'Similarity Scaling Demonstration' }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Similar triangles: same angles, proportional sides. Scale factor k = any ratio of corresponding sides.',
    'AA: two equal angles → similar. SAS~: proportional sides with equal included angle → similar.',
    'To find unknown length: identify similar triangles, write proportion, cross-multiply.',
    'Triangle Proportionality Theorem: line parallel to one side divides other two sides proportionally.',
    'Area scales as k² when linear dimensions scale by k.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_GEO_2_PARALLEL, LESSON_GEO_2_SIMILARITY };
