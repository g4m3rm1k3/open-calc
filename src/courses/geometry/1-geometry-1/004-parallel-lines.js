// Geometry · Chapter 1 · Lesson 4
// Parallel Lines and Transversals
import geoParallelTransversalUrl from '../diagrams/geo-parallel-transversal.svg?url'
import geoAnglePairsUrl from '../diagrams/geo-angle-pairs.svg?url'
import quizParallelFindUrl from '../diagrams/quiz-parallel-find-angle.svg?url'

const LESSON_GEO_1_4 = {
  title: "Parallel Lines and Transversals",
  subtitle:
    "How a single crossing line reveals the hidden geometry of parallel lines — and why it all depends on one postulate.",
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: "markdown",
      instruction: `### The Most Consequential Postulate in Geometry

Every theorem about parallel lines — and there are many — flows from a single source: Euclid's Fifth Postulate. It is the most argued-about axiom in the history of mathematics.

For two thousand years, mathematicians suspected the Fifth Postulate wasn't really a postulate at all. It looked more complicated than the other four, less obviously primitive. Mathematicians repeatedly attempted to prove it from the other four. Every attempt failed — but the failures were not immediately recognized as such. It took until 1830, when Lobachevsky and Bolyai independently constructed consistent geometries where the Fifth Postulate is false, to prove it genuinely cannot be derived from the others.

The standard equivalent form of the Fifth Postulate states: *Through a point not on a given line, there is exactly one line parallel to the given line.*

Change "exactly one" to "none" and you get spherical geometry, where lines (great circles) always intersect and parallel lines don't exist. Change it to "infinitely many" and you get hyperbolic geometry. Both are internally consistent — just different from what you learned in grade school.

What this means: every theorem about parallel lines you'll prove in this lesson is a theorem of *flat* Euclidean geometry. It describes the geometry of the plane you draw on, the floors you walk on, the grids your city is built on. But not the geometry of the cosmos. Keep this in the back of your mind as we proceed.`,
    },

    {
      type: "markdown",
      instruction: `### The Setup: Eight Angles from Two Intersections

**Parallel lines** are lines in the same plane that never intersect, no matter how far extended. Notation: ℓ₁ ∥ ℓ₂.

A **transversal** is any line that intersects two or more other lines. When a transversal crosses two lines, it creates eight angles — four at each intersection point.

These eight angles are categorized by their positions:

**Corresponding angles** occupy the same relative position at each intersection — both above-left, both below-right, etc. Think of "corresponding" as "copy-pasted to the other intersection."

**Alternate interior angles** lie between the two lines (interior) and on opposite sides of the transversal. They form a Z-shape or N-shape.

**Alternate exterior angles** lie outside both lines and on opposite sides of the transversal.

**Co-interior angles** (also called same-side interior, or consecutive interior) lie between the two lines and on the same side of the transversal. They form a U-shape or C-shape.

When the two lines are parallel, these pairs have exact, provable relationships. When the lines are not parallel, the relationships fail. This makes angle pairs a precise diagnostic for parallelism — not just a visual impression, but a theorem with a proof.`,
    },

    // ── Visual 1 ───────────────────────────────────────────────────────────────
    {
      type: "js",
      instruction: `### Interactive: Eight Angles, Two Intersections

Drag the transversal angle slider. Toggle the parallel lock to see the relationships break when lines are not parallel. Click any angle in the table to see which pair it belongs to.`,
      html: `<div style="padding:10px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;gap:14px;flex-wrap:wrap;align-items:center">
  <label style="font-family:Georgia,serif;font-size:13px;display:flex;align-items:center;gap:8px;cursor:pointer">
    <input type="checkbox" id="par-ck" checked style="width:14px;height:14px"> Lines are parallel
  </label>
  <div style="display:flex;align-items:center;gap:8px">
    <span style="font-family:Georgia,serif;font-size:13px">Transversal: <strong id="tang-lbl">55°</strong></span>
    <input type="range" id="tang-sl" min="15" max="165" value="55" style="width:130px">
  </div>
  <div style="display:flex;align-items:center;gap:8px;opacity:0.35" id="tilt-row">
    <span style="font-family:Georgia,serif;font-size:13px">ℓ₂ tilt: <strong id="tilt-lbl">0°</strong></span>
    <input type="range" id="tilt-sl" min="-20" max="20" value="0" style="width:90px" disabled>
  </div>
</div>
<canvas id="cv" width="700" height="290"></canvas>
<div id="ang-table" style="padding:10px 14px 4px;font-family:Georgia,serif;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0)"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}canvas{display:block}`,
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

var parCk=document.getElementById('par-ck');
var tangSl=document.getElementById('tang-sl'),tangLbl=document.getElementById('tang-lbl');
var tiltSl=document.getElementById('tilt-sl'),tiltLbl=document.getElementById('tilt-lbl');
var tiltRow=document.getElementById('tilt-row');

parCk.onchange=function(){
  var isP=parCk.checked;
  tiltRow.style.opacity=isP?'0.35':'1';
  tiltSl.disabled=isP;
  if(isP){tiltSl.value=0;tiltLbl.textContent='0°';}
  draw();
};
tangSl.oninput=function(){tangLbl.textContent=tangSl.value+'°';draw();};
tiltSl.oninput=function(){tiltLbl.textContent=tiltSl.value+'°';draw();};

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var t=+tangSl.value,tilt=+tiltSl.value*(parCk.checked?0:1);
  var y1=H*0.28,y2=H*0.72,mx=W/2;
  var tRad=(180-t)*Math.PI/180;
  var L=250;

  // Line 1
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(24,y1);ctx.lineTo(W-24,y1);ctx.stroke();
  // Line 2 (possibly tilted)
  var tr2=tilt*Math.PI/180;
  ctx.strokeStyle=parCk.checked?'#1e3a5f':'#dc2626';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(24,y2+Math.sin(tr2)*(mx-24));ctx.lineTo(W-24,y2-Math.sin(tr2)*(W-24-mx));ctx.stroke();
  // Transversal
  ctx.strokeStyle=TEXT;ctx.lineWidth=2;
  var tx1=mx-L*Math.cos(tRad),ty1=y1-L*Math.sin(tRad)-30;
  var tx2=mx+L*Math.cos(tRad),ty2=y2+L*Math.sin(tRad)+30;
  ctx.beginPath();ctx.moveTo(tx1,ty1);ctx.lineTo(tx2,ty2);ctx.stroke();

  // Intersections
  var ix1=mx-(y1-H/2)/Math.tan(tRad);
  var ix2=mx-(y2-H/2)/Math.tan(tRad);
  [ix1,ix2].forEach(function(ix,i){
    var iy=i===0?y1:y2;
    ctx.beginPath();ctx.arc(ix,iy,5,0,2*Math.PI);ctx.fillStyle=TEXT;ctx.fill();
  });

  // Angles
  var a=t, s=180-t;
  var a2=t+tilt, s2=180-t-tilt;
  // Label positions: 4 per intersection (UL, UR, LR, LL)
  var labels1=[
    {n:'∠1',v:s, dx:-38,dy:-18,c:'#1e3a5f'},
    {n:'∠2',v:a, dx: 38,dy:-18,c:'#1a3a2a'},
    {n:'∠3',v:s, dx: 38,dy: 18,c:'#92400e'},
    {n:'∠4',v:a, dx:-38,dy: 18,c:'#7c3aed'},
  ];
  var labels2=[
    {n:'∠5',v:s2,dx:-38,dy:-18,c:'#0891b2'},
    {n:'∠6',v:a2,dx: 38,dy:-18,c:'#b45309'},
    {n:'∠7',v:s2,dx: 38,dy: 18,c:'#374151'},
    {n:'∠8',v:a2,dx:-38,dy: 18,c:'#6b21a8'},
  ];

  function drawLabels(ix,iy,labs){
    labs.forEach(function(l){
      ctx.fillStyle=l.c;ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(l.n+'='+Math.round(l.v)+'°',ix+l.dx,iy+l.dy);
    });
  }
  drawLabels(ix1,y1,labels1);
  drawLabels(ix2,y2,labels2);

  // Parallel tick marks on lines
  if(parCk.checked){
    [[ix1-20,y1],[ix1+20,y1],[ix2-20,y2],[ix2+20,y2]].forEach(function(p,i){
      if(i<2||true){
        ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(p[0]-4,p[1]-7);ctx.lineTo(p[0]+4,p[1]);ctx.lineTo(p[0]-4,p[1]+7);ctx.stroke();
      }
    });
  }

  // Line labels
  ctx.fillStyle=NAVY;ctx.font='italic 12px Georgia';ctx.textAlign='left';
  ctx.fillText('ℓ₁',28,y1-14);
  ctx.fillStyle=parCk.checked?'#1e3a5f':'#dc2626';
  ctx.fillText('ℓ₂',28,y2-14);
  ctx.fillStyle=TEXT;ctx.textAlign='right';
  ctx.fillText('t',W-14,ty1+14);

  // Table
  var p=parCk.checked;
  var pairs=[
    {name:'Corresponding',pair:'∠1 & ∠5',a:s,b:s2,type:'equal'},
    {name:'Corresponding',pair:'∠2 & ∠6',a:a,b:a2,type:'equal'},
    {name:'Alt. Interior',pair:'∠3 & ∠5',a:s,b:s2,type:'equal'},
    {name:'Alt. Interior',pair:'∠4 & ∠6',a:a,b:a2,type:'equal'},
    {name:'Co-interior',pair:'∠4 & ∠5',a:a,b:s2,type:'supp'},
    {name:'Co-interior',pair:'∠3 & ∠6',a:s,b:a2,type:'supp'},
  ];
  var html='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;font-size:11px">';
  pairs.forEach(function(pr){
    var check=pr.type==='equal'?Math.abs(pr.a-pr.b)<2:Math.abs(pr.a+pr.b-180)<3;
    var ok=p&&check;
    html+='<div style="padding:4px 8px;border-radius:5px;background:'+(ok?'#f0fdf4':'#fef2f2')+';border:1px solid '+(ok?'#86efac':'#fca5a5')+'">'
      +'<span style="color:var(--color-text-secondary, #475569)">'+pr.name+'</span> '
      +'<strong style="color:'+(ok?'#16a34a':'#dc2626')+'">'+pr.pair+' '+(ok?'✓':'✗')+'</strong>'
      +'<div style="color:var(--color-text-primary, #1e293b)">'+Math.round(pr.a)+'° & '+Math.round(pr.b)+'° ('+(pr.type==='equal'?'should be equal':'should sum to 180°')+')</div>'
      +'</div>';
  });
  html+='</div>';
  document.getElementById('ang-table').innerHTML=(p
    ?'<div style="color:#1a3a2a;font-weight:700;font-size:12px;margin-bottom:5px">Parallel — all relationships hold ✓</div>'
    :'<div style="color:#dc2626;font-weight:700;font-size:12px;margin-bottom:5px">Not parallel — relationships fail ✗</div>'
  )+html;
}
draw();`,
      outputHeight: 540,
    },

    // ── Theorems ───────────────────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### The Three Key Theorems and Their Proofs

When two parallel lines are cut by a transversal, three theorems describe what must be true. Each proof builds on the previous one — they form a chain.

---

**Theorem 1 — Corresponding Angles.** *If two parallel lines are cut by a transversal, corresponding angles are equal.*

In most curricula, this is taken as a postulate (the Corresponding Angles Postulate), adding it directly to Euclid's axioms. It can be derived from the Fifth Postulate, but the derivation requires more machinery than we have built yet. Accept it as foundational for now.

---

**Theorem 2 — Alternate Interior Angles.** *If two parallel lines are cut by a transversal, alternate interior angles are equal.*

**Proof.** Label the angles at the first intersection ∠1 (upper-right) and ∠4 (lower-left, its vertical angle). At the second intersection, ∠5 (upper-right) is the corresponding angle to ∠1.

By Vertical Angles Theorem: ∠1 = ∠4.
By Corresponding Angles: ∠1 = ∠5.
By Transitive Property: ∠4 = ∠5.

∠4 and ∠5 are alternate interior angles. They are equal. □

---

**Theorem 3 — Co-interior Angles.** *If two parallel lines are cut by a transversal, co-interior (same-side interior) angles are supplementary.*

**Proof.** ∠4 and ∠5 are alternate interior angles (just proven equal). ∠5 and ∠6 are a linear pair: ∠5 + ∠6 = 180°. By substitution (replacing ∠5 with ∠4): ∠4 + ∠6 = 180°.

∠4 and ∠6 are co-interior angles. They sum to 180°. □

---

Notice the economy: one postulate plus two previously proven theorems (Vertical Angles, Linear Pair) yields three new theorems. This is the compounding power of the axiomatic method.`,
    },

    // ── Visual 2 — Proof walkthrough ──────────────────────────────────────────
    {
      type: "js",
      instruction: `### The Chain of Proofs Visualized

The three theorems form a logical chain. Click each theorem to see which earlier results it depends on and how the angles connect.`,
      html: `<div style="padding:8px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;gap:8px" id="thm-btns"></div>
<canvas id="cv" width="700" height="250"></canvas>
<div id="thm-detail" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.75"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}canvas{display:block}`,
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

var theorems=[
  {
    id:'CA',label:'Corresponding Angles',color:'#1e3a5f',
    pairs:[[1,5]],highlightType:'corresponding',
    statement:'∠1 = ∠5',
    reason:'Corresponding Angles Postulate (same position at each intersection)',
    chain:'Assumed as a postulate — the foundation for the other two.',
    angleStyle:'equal'
  },
  {
    id:'AIA',label:'Alt. Interior Angles',color:'#1a3a2a',
    pairs:[[4,6]],highlightType:'alternate-interior',
    statement:'∠4 = ∠6',
    reason:'Vertical Angles Theorem (∠1=∠4) + Corresponding Angles (∠1=∠5=∠6) + Transitive',
    chain:'Depends on: Vertical Angles Theorem → Corresponding Angles Postulate',
    angleStyle:'equal'
  },
  {
    id:'CIA',label:'Co-interior Angles',color:'#92400e',
    pairs:[[4,5]],highlightType:'co-interior',
    statement:'∠4 + ∠5 = 180°',
    reason:'Alt. Interior Angles (∠4=∠6) + Linear Pair (∠5+∠6=180°) + Substitution',
    chain:'Depends on: Alternate Interior Angles Theorem → Linear Pair Theorem',
    angleStyle:'supp'
  }
];

var selected=0;
var btnContainer=document.getElementById('thm-btns');
var btns=[];
theorems.forEach(function(thm,i){
  var btn=document.createElement('button');
  btn.textContent=thm.label;
  btn.style.cssText='padding:6px 13px;border-radius:7px;border:1.5px solid '+thm.color+(i===0?';background:'+thm.color+'22;color:'+thm.color:';background:transparent;color:rgba(55,65,81,0.5)')+';font-family:Georgia,serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;';
  btn.onclick=function(){
    selected=i;
    btns.forEach(function(b,j){
      b.style.background=j===i?theorems[j].color+'22':'transparent';
      b.style.color=j===i?theorems[j].color:'rgba(55,65,81,0.5)';
    });
    render();
  };
  btnContainer.appendChild(btn);
  btns.push(btn);
});

function render(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  var thm=theorems[selected];
  var t=58;
  var y1=H*0.27,y2=H*0.73,mx=W/2;
  var tRad=(180-t)*Math.PI/180;
  var L=240;
  var ix1=mx-(y1-H/2)/Math.tan(tRad);
  var ix2=mx-(y2-H/2)/Math.tan(tRad);

  // Lines
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(24,y1);ctx.lineTo(W-24,y1);ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,y2);ctx.lineTo(W-24,y2);ctx.stroke();
  // Transversal
  ctx.strokeStyle=TEXT;ctx.lineWidth=2;
  var tx1=mx-L*Math.cos(tRad),ty1=y1-70;
  var tx2=mx+L*Math.cos(tRad),ty2=y2+70;
  ctx.beginPath();ctx.moveTo(tx1,ty1);ctx.lineTo(tx2,ty2);ctx.stroke();
  [ix1,ix2].forEach(function(ix,i){
    ctx.beginPath();ctx.arc(ix,i===0?y1:y2,5,0,2*Math.PI);ctx.fillStyle=TEXT;ctx.fill();
  });

  var a=t,s=180-t;
  // angles: 1=upper-left i1, 2=upper-right i1, 3=lower-right i1, 4=lower-left i1
  //         5=upper-left i2, 6=upper-right i2, 7=lower-right i2, 8=lower-left i2
  // positions
  var angPos=[
    {n:'∠1',v:s,ix:ix1,iy:y1,dx:-34,dy:-18},
    {n:'∠2',v:a,ix:ix1,iy:y1,dx: 34,dy:-18},
    {n:'∠3',v:a,ix:ix1,iy:y1,dx: 34,dy: 18},
    {n:'∠4',v:s,ix:ix1,iy:y1,dx:-34,dy: 18},
    {n:'∠5',v:s,ix:ix2,iy:y2,dx:-34,dy:-18},
    {n:'∠6',v:a,ix:ix2,iy:y2,dx: 34,dy:-18},
    {n:'∠7',v:a,ix:ix2,iy:y2,dx: 34,dy: 18},
    {n:'∠8',v:s,ix:ix2,iy:y2,dx:-34,dy: 18},
  ];

  // Highlight relevant pairs
  var hlPairs=thm.highlightType==='corresponding'?[0,5]:
              thm.highlightType==='alternate-interior'?[3,5]:
              [3,4]; // co-interior: ∠4 and ∠5

  angPos.forEach(function(ap,i){
    var isHL=hlPairs.indexOf(i)>=0;
    ctx.fillStyle=isHL?thm.color:'#94a3b8';
    ctx.font=(isHL?'bold ':'')+'11px Georgia';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(ap.n+'='+ap.v+'°',ap.ix+ap.dx,ap.iy+ap.dy);
    if(isHL){
      ctx.beginPath();ctx.arc(ap.ix+ap.dx,ap.iy+ap.dy,18,0,2*Math.PI);
      ctx.strokeStyle=thm.color+'66';ctx.lineWidth=1.5;ctx.stroke();
    }
  });

  // Relationship label
  var rLabel=thm.angleStyle==='equal'
    ?angPos[hlPairs[0]].n+' = '+angPos[hlPairs[1]].n+' = '+a+'°'
    :angPos[hlPairs[0]].n+' + '+angPos[hlPairs[1]].n+' = '+s+' + '+a+' = 180°';
  ctx.fillStyle=thm.color;ctx.font='bold 14px Georgia';ctx.textAlign='center';
  ctx.fillText(rLabel,W/2,H-14);

  // Detail panel
  var detEl=document.getElementById('thm-detail');
  detEl.innerHTML='<strong style="color:'+thm.color+'">'+thm.label+' Theorem: </strong><em>'+thm.statement+'</em>'
    +'<br><strong>Proof chain:</strong> '+thm.reason
    +'<br><span style="color:var(--color-text-tertiary, #9ca3af);font-size:11px">Logical dependency: '+thm.chain+'</span>';
}
render();`,
      outputHeight: 430,
    },

    // ── Converse ───────────────────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### The Converses: Proving Lines Are Parallel

The theorems above start with parallel lines and conclude angle relationships. The **converses** start with angle relationships and conclude parallel lines. They're equally important — they answer the carpenter's question.

**Converse of the Corresponding Angles Postulate:** *If corresponding angles are equal, the lines are parallel.*

**Converse of the Alternate Interior Angles Theorem:** *If alternate interior angles are equal, the lines are parallel.*

**Converse of the Co-interior Angles Theorem:** *If co-interior angles are supplementary (sum to 180°), the lines are parallel.*

**Proof of the Alternate Interior Angles Converse** (by contradiction):

Suppose ∠4 = ∠5 (alternate interior angles are equal) but ℓ₁ is not parallel to ℓ₂. Since the lines are not parallel, they intersect at some point P, forming a triangle with the two intersection points on the transversal.

In this triangle, ∠5 is an interior angle and ∠4 is an exterior angle at the opposite vertex. But the Exterior Angle Theorem (which we'll prove fully in the next lesson) states that an exterior angle of a triangle is strictly greater than either non-adjacent interior angle. So ∠4 > ∠5.

This contradicts our assumption that ∠4 = ∠5. Therefore, ℓ₁ must be parallel to ℓ₂. □

The converses are how parallelism is detected and verified in practice — in construction, drafting, engineering, and the proofs that follow in this course.`,
    },

    // ── Challenges ─────────────────────────────────────────────────────────────
    {
      type: "challenge",
      instruction: `A transversal crosses two parallel lines. One co-interior (same-side interior) angle measures 112°. What is the other co-interior angle, and which theorem justifies this?`,
      options: [
        {
          label: "A",
          text: "112° — co-interior angles of parallel lines are equal.",
        },
        {
          label: "B",
          text: "68° — Co-interior Angles Theorem: co-interior angles between parallel lines are supplementary (sum to 180°), so 180° − 112° = 68°.",
        },
        {
          label: "C",
          text: "90° — all angles formed by parallel lines and a transversal are right angles.",
        },
        { label: "D", text: "44° — co-interior angles are complementary." },
      ],
      check: (label) => label === "B",
      successMessage:
        "Correct. The Co-interior Angles Theorem: co-interior (same-side interior) angles between parallel lines are supplementary — they sum to 180°. So 180° − 112° = 68°. This contrasts with alternate interior angles, which are EQUAL. The difference: alternate angles are on opposite sides (Z-shape), co-interior are on the same side (C-shape).",
      failMessage:
        "Co-interior angles (same side of the transversal, between the parallel lines) are supplementary — they sum to 180°. This is the Co-interior Angles Theorem. So 180° − 112° = 68°. Do not confuse with alternate interior angles, which are EQUAL. The shape memory: alternate = Z-shape → equal; co-interior = C-shape → supplementary.",
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },

    {
      type: "challenge",
      instruction: `A student measures alternate interior angles at 73° and 73° where a transversal crosses two lines. She concludes the lines are parallel. Her classmate says measuring at one point can't tell you what happens far away. Who is right?`,
      options: [
        {
          label: "A",
          text: "The classmate — measurements are local and can't guarantee behavior at infinity.",
        },
        {
          label: "B",
          text: "The student — the Converse of the Alternate Interior Angles Theorem is a proven theorem, not just a local observation. Equal alternate interior angles logically guarantee the lines are parallel everywhere.",
        },
        {
          label: "C",
          text: "Neither — you need to measure at multiple transversals.",
        },
        {
          label: "D",
          text: "The student, but only if the measurement is exact to many decimal places.",
        },
      ],
      check: (label) => label === "B",
      successMessage:
        'Correct. This is precisely the point of proof over measurement. The converse theorem is a logical consequence of the Parallel Postulate. It doesn\'t say "the lines look parallel near this transversal." It says IF alternate interior angles are equal, THEN the lines are parallel — everywhere, forever. One measurement (if exact) gives logical certainty. That is what makes mathematics different from science.',
      failMessage:
        "The converse is a theorem — a logical deduction from axioms. It provides universal certainty, not local approximation. The classmate is confusing a physical measurement (which is approximate and local) with a logical proof (which is exact and universal). If the alternate interior angles are exactly equal, the Parallel Postulate guarantees the lines never intersect — not near the transversal, not anywhere.",
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },
  ],
};

export default {
  id: "geo-1-4",
  subject: 'Geometry',
  slug: "parallel-lines",
  chapter: "geometry-1",
  order: 4,
  title: "Parallel Lines and Transversals",
  subtitle:
    "How a single crossing line reveals the hidden geometry of parallel lines — and why it all depends on one postulate.",
  tags: [
    "geometry",
    "parallel-lines",
    "transversal",
    "alternate-interior-angles",
    "corresponding-angles",
    "co-interior-angles",
    "parallel-postulate",
  ],
  hook: {
    question:
      "How can you prove two lines are truly parallel — with certainty, not just appearance?",
    realWorldContext:
      "Every angle relationship formed by a transversal cutting parallel lines is a theorem derived from Euclid's Fifth Postulate. The converses let you prove parallelism from angle measurement — the test used in construction and navigation for centuries.",
    previewVisualizationId: "G1_3_ParallelLines",
  },
  intuition: {
    blocks: [
      { type: 'prose', md: 'When a **transversal** crosses two parallel lines, it creates 8 angles — 4 at each intersection. These angles are not arbitrary: they obey exact relationships guaranteed by Euclid\'s Fifth Postulate. Every theorem about parallel lines traces back to that single postulate.' },
      { type: 'image', src: geoParallelTransversalUrl, alt: '8 angles formed by a transversal cutting two parallel lines', caption: 'A transversal creates 8 angles. Angles at each intersection are supplementary pairs (55° and 125°). The parallel lines force the two intersections to mirror each other.' },
      { type: 'prose', md: 'Three theorems organize the angle relationships: **Corresponding angles** (F-shape, same position at each intersection) are **equal**. **Alternate interior angles** (Z-shape, between the lines on opposite sides) are **equal**. **Co-interior angles** (C-shape, between the lines on the same side) are **supplementary** — they sum to 180°.' },
      { type: 'image', src: geoAnglePairsUrl, alt: 'Corresponding, alternate interior, and co-interior angle pairs', caption: 'Three angle pair types: F-shape (equal), Z-shape (equal), C-shape (supplementary). The shape tells you the rule.' },
      { type: 'callout', kind: 'important', title: 'Alternate vs. Co-interior', body: 'Alternate interior angles (Z-shape, opposite sides): EQUAL. Co-interior angles (C-shape, same side): SUPPLEMENTARY (sum to 180°). The shape memory — Z vs C — prevents the most common confusion in this topic.' },
      { type: 'viz', id: 'ScienceNotebook', props: { lesson: LESSON_GEO_1_4 }, mathBridge: 'Use the interactive to drag the transversal angle and toggle the parallel lock. Watch all six angle pair relationships in the table — observe which ones hold only when the lines are parallel and which ones always hold regardless.' },
      { type: 'viz', id: 'G1_3_ParallelLines', title: 'Transversals and Parallel Patterns' },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    "Parallel + transversal → 8 angles. Corresponding = equal. Alternate interior = equal. Co-interior = supplementary.",
    "Proof chain: Corresponding Angles (postulate) → Alternate Interior (uses Vertical Angles + Corresponding) → Co-interior (uses Alternate Interior + Linear Pair).",
    "Converses: angle evidence → parallel conclusion. The foundation of parallelism tests in construction.",
    "Everything depends on the Parallel Postulate. Different postulate = different geometry (spherical, hyperbolic).",
  ],
  checkpoints: ["read-intuition"],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizParallelFindUrl,
      diagramAlt: 'Two parallel lines ℓ₁ and ℓ₂ cut by a transversal. The upper-left angle at ℓ₁ is 118°. The lower-right angle x is unknown.',
      text: 'ℓ₁ ∥ ℓ₂. The marked angle at ℓ₁ is 118°. Find x.',
      options: ['62° — x is an alternate interior angle (equal to 180°−118°)', '118° — x corresponds to the 118° angle', '62° — x is co-interior (supplementary), so 180°−118°=62°'],
      correct: 2,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Two parallel lines cut by a transversal. One alternate interior angle is 70°. The other is:',
      options: ['110°', '70°', '90°'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Co-interior angles between two parallel lines. One measures 65°. The other is:',
      options: ['115°', '65°', '25°'],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A transversal crosses two lines. Corresponding angles are equal. You can conclude the lines are:',
      options: [
        'Perpendicular',
        'Parallel — equal corresponding angles is the converse of the Corresponding Angles Postulate',
        'The same line',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Which shape best describes co-interior angles — and what rule do they follow?',
      options: [
        'Z-shape, and they are equal',
        'C-shape, and they are supplementary (sum to 180°)',
        'F-shape, and they are supplementary',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The proof of the Alternate Interior Angles Theorem depends on which two earlier results?',
      options: [
        'Triangle Angle Sum Theorem and Segment Addition Postulate',
        'Corresponding Angles Postulate and Vertical Angles Theorem',
        'Linear Pair Theorem and the Pythagorean Theorem',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Two lines are cut by a transversal. The alternate interior angles measure 84° and 96°. Are the lines parallel?',
      options: [
        'Yes — they are close enough to parallel',
        'No — parallel lines require alternate interior angles to be exactly equal, and 84° ≠ 96°',
        'Cannot tell without measuring more angles',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Co-interior angles are 3x° and (2x + 10)°. For the lines to be parallel, what must x equal?',
      options: ['x = 34', 'x = 38', 'x = 30'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'On the surface of a sphere, does the Alternate Interior Angles Theorem hold for parallel lines?',
      options: [
        'Yes — angle relationships are universal',
        'No — on a sphere, "parallel lines" (great circles) always intersect, so the theorem\'s premise never applies',
        'Yes, but only for small triangles',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A transversal crosses two parallel lines. An angle at the first intersection is 112°. What are the other three angles at that intersection?',
      options: [
        '68°, 112°, 68°',
        '68°, 68°, 112°',
        'All equal to 112°',
      ],
      correct: 0,
    },
  ],
};

export { LESSON_GEO_1_4 };
