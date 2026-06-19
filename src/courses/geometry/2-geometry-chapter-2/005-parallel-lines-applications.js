// Geometry · Chapter 2 · Lesson 3 (variant)
// Parallel Lines in Depth

// ─────────────────────────────────────────────────────────────────────────────
// LESSON: Parallel Lines (Chapter 2 deeper treatment)
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
      html: `<div style="padding:10px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <span style="font-family:Georgia,serif;font-size:13px">Sides: <strong id="n-lbl">5</strong></span>
  <input type="range" id="n-sl" min="3" max="12" value="5" style="flex:1;min-width:100px">
  <span id="formula-lbl" style="font-family:Georgia,serif;font-size:13px;color:#1e3a5f;font-weight:700"></span>
</div>
<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
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
<div id="para-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:12px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.8"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
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
    +'<br><span style="color:var(--color-text-tertiary, #9ca3af);font-size:11px">Drag A, B, or D to change the parallelogram. All properties hold regardless of shape.</span>';
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

// ─────── Export ──────────────────────────────────────────────────────────────

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
    visualizations: [
      { id: 'ScienceNotebook', title: 'Parallel Lines: Deeper Applications', props: { lesson: LESSON_GEO_2_PARALLEL } }
    ],
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

export default GEO_2_PARALLEL_DEFAULT;
