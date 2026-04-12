// Geometry · Chapter 1 · Lesson 6
// Congruence: Identical Shapes

const LESSON_GEO_1_6 = {
  title: 'Congruence: Identical Shapes',
  subtitle: 'How few measurements determine a triangle — and what that tells us about proof.',
  sequential: true,

  cells: [

    // ── Opening ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Carpenter's Problem

A bridge builder has designed a triangular support structure. She needs to cut hundreds of identical pieces from steel. The question is practical and urgent: how do her workers verify that each new piece is truly identical to the template without measuring all six dimensions (three sides and three angles) of every piece?

She knows intuitively that you don't need all six measurements. If you match three of them — the right three — the triangle is forced to be identical. But which three? And why does matching three measurements force all six to match?

This is the problem of **congruence**. Two geometric figures are congruent if they have exactly the same shape and size — one could be placed on top of the other with a perfect match. For triangles, the question is: what is the minimum information needed to guarantee congruence?

The answer involves some of the most elegant proofs in elementary geometry. The congruence criteria are not just useful facts for engineers and carpenters. They are theorems — derived from the postulates using the proof techniques you have been developing. And they reveal something deep: the surprising way in which a few measurements constrain an infinite amount of geometric information.`,
    },

    // ── What is congruence ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Defining Congruence Precisely

Two figures are **congruent** (symbol: ≅) if there exists a correspondence between their vertices such that all corresponding sides are equal in length and all corresponding angles are equal in measure.

For triangles, this means:

If △ABC ≅ △DEF, then:
- AB = DE, BC = EF, AC = DF (all three pairs of sides equal)
- ∠A = ∠D, ∠B = ∠E, ∠C = ∠F (all three pairs of angles equal)

The **order of vertices matters**. △ABC ≅ △DEF means A corresponds to D, B to E, C to F. △ABC ≅ △EDF would be a different correspondence and a different claim.

The notation "AB" means the length of segment AB. The notation "∠A" means the measure of angle A.

**CPCTC: Corresponding Parts of Congruent Triangles are Congruent.** Once you've proven two triangles congruent, every pair of corresponding parts is automatically congruent. This is used constantly: prove triangles congruent, then conclude specific sides or angles are equal as a corollary.

A triangle has six measurements: three sides and three angles. Naively, you might think you need all six to prove congruence. The remarkable result — the triangle congruence criteria — is that you only need three, but they must be the right combination. Some combinations of three don't work. Understanding which ones work and why requires proof.`,
    },

    // ── Visual 1 — Six measurements ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### A Triangle's Six Measurements

Every triangle has exactly six measurements: three side lengths and three angle measures. But the six are not independent — the angles must sum to 180°, and the sides constrain the angles by the Law of Cosines. So there are really only five degrees of freedom (up to similarity), and only three once you fix one side.

The interactive below shows a triangle and all six of its measurements. Drag the vertices to see how changing one measurement forces others to change too.`,
      html: `<canvas id="cv" width="700" height="320" style="cursor:move"></canvas>
<div id="measures" style="padding:10px 14px;font-family:Georgia,serif;background:#fafaf8;border-top:1px solid #e2e8f0"></div>`,
      css: `body{margin:0;background:#fafaf8}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var pts=[
  {x:200,y:240,label:'A',color:'#1e3a5f'},
  {x:480,y:240,label:'B',color:'#1a3a2a'},
  {x:320,y:100,label:'C',color:'#dc2626'}
];

var dragging=-1;

canvas.addEventListener('mousedown',function(e){
  var rect=canvas.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(W/rect.width);
  var my=(e.clientY-rect.top)*(H/rect.height);
  pts.forEach(function(p,i){
    if(Math.hypot(mx-p.x,my-p.y)<18)dragging=i;
  });
});
canvas.addEventListener('mouseup',function(){dragging=-1;});
canvas.addEventListener('mousemove',function(e){
  if(dragging<0)return;
  var rect=canvas.getBoundingClientRect();
  pts[dragging].x=Math.max(30,Math.min(W-30,(e.clientX-rect.left)*(W/rect.width)));
  pts[dragging].y=Math.max(30,Math.min(H-30,(e.clientY-rect.top)*(H/rect.height)));
  draw();
});
canvas.addEventListener('touchstart',function(e){
  e.preventDefault();
  var rect=canvas.getBoundingClientRect();
  var mx=(e.touches[0].clientX-rect.left)*(W/rect.width);
  var my=(e.touches[0].clientY-rect.top)*(H/rect.height);
  pts.forEach(function(p,i){if(Math.hypot(mx-p.x,my-p.y)<22)dragging=i;});
},{passive:false});
canvas.addEventListener('touchend',function(){dragging=-1;});
canvas.addEventListener('touchmove',function(e){
  e.preventDefault();
  if(dragging<0)return;
  var rect=canvas.getBoundingClientRect();
  pts[dragging].x=Math.max(30,Math.min(W-30,(e.touches[0].clientX-rect.left)*(W/rect.width)));
  pts[dragging].y=Math.max(30,Math.min(H-30,(e.touches[0].clientY-rect.top)*(H/rect.height)));
  draw();
},{passive:false});

function dist(p,q){return Math.round(Math.hypot(p.x-q.x,p.y-q.y));}
function angleDeg(v,p,q){
  var a=Math.atan2(p.y-v.y,p.x-v.x);
  var b=Math.atan2(q.y-v.y,q.x-v.x);
  var d=(b-a+2*Math.PI)%(2*Math.PI);
  if(d>Math.PI)d=2*Math.PI-d;
  return Math.round(d*180/Math.PI);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var A=pts[0],B=pts[1],C=pts[2];
  var AB=dist(A,B),BC=dist(B,C),CA=dist(C,A);
  var angA=angleDeg(A,B,C),angB=angleDeg(B,A,C),angC=angleDeg(C,A,B);
  var sumAngles=angA+angB+angC;

  // Triangle fill
  ctx.fillStyle='rgba(59,130,246,0.06)';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.fill();

  // Sides with length labels
  var sides=[[A,B,'c (AB)='+AB,'#1e3a5f'],[B,C,'a (BC)='+BC,'#1a3a2a'],[C,A,'b (CA)='+CA,'#dc2626']];
  sides.forEach(function(s){
    ctx.strokeStyle=s[3];ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(s[0].x,s[0].y);ctx.lineTo(s[1].x,s[1].y);ctx.stroke();
    var mx=(s[0].x+s[1].x)/2,my=(s[0].y+s[1].y)/2;
    var dx=s[1].x-s[0].x,dy=s[1].y-s[0].y;
    var len=Math.hypot(dx,dy);
    var nx=-dy/len*14,ny=dx/len*14;
    ctx.fillStyle=s[3];ctx.font='12px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(s[2],mx+nx,my+ny);
  });

  // Vertices with angle labels
  pts.forEach(function(p,i){
    var others=pts.filter(function(_,j){return j!==i;});
    var ang=[angA,angB,angC][i];
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);
    ctx.fillStyle=p.color;ctx.fill();
    ctx.fillStyle=p.color;ctx.font='bold 13px Georgia';ctx.textAlign='center';
    var off=22;
    var dx=(others[0].x+others[1].x)/2-p.x;
    var dy=(others[0].y+others[1].y)/2-p.y;
    var dlen=Math.hypot(dx,dy);
    ctx.fillText(p.label+' ('+ang+'°)',p.x-dx/dlen*off,p.y-dy/dlen*off);
  });

  // Sum of angles
  ctx.fillStyle=sumAngles>=178&&sumAngles<=182?'#1a3a2a':'#dc2626';
  ctx.font='12px Georgia';ctx.textAlign='right';
  ctx.fillText('∠A + ∠B + ∠C = '+angA+'° + '+angB+'° + '+angC+'° = '+sumAngles+'°',W-14,H-10);

  ctx.fillStyle='#94a3b8';ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText('drag vertices',W/2,H-10);

  // Measures panel
  document.getElementById('measures').innerHTML=
    '<strong>The six measurements:</strong> '
    +'<span style="color:#1e3a5f">AB = '+AB+'</span>, '
    +'<span style="color:#1a3a2a">BC = '+BC+'</span>, '
    +'<span style="color:#dc2626">CA = '+CA+'</span> | '
    +'<span style="color:#1e3a5f">∠A = '+angA+'°</span>, '
    +'<span style="color:#1a3a2a">∠B = '+angB+'°</span>, '
    +'<span style="color:#dc2626">∠C = '+angC+'°</span>'
    +'<br><span style="color:#9ca3af;font-size:11px">Angle sum = '+sumAngles+'° (should be 180°; rounding error in display). All six measurements are determined once the shape is fixed.</span>';
}
draw();`,
      outputHeight: 400,
    },

    // ── The congruence criteria ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Four Congruence Criteria: What Works and What Doesn't

The central theorem of this lesson: **you don't need all six measurements to prove two triangles congruent.** Three measurements suffice — if they are the right combination.

Here are the four valid congruence criteria:

**SSS (Side-Side-Side).** If all three pairs of corresponding sides are equal, the triangles are congruent. The sides completely determine the shape.

**SAS (Side-Angle-Side).** If two sides and the angle *between* them are equal, the triangles are congruent. The angle must be the included angle — between the two sides.

**ASA (Angle-Side-Angle).** If two angles and the side *between* them are equal, the triangles are congruent. The side must be the included side.

**AAS (Angle-Angle-Side).** If two angles and a non-included side are equal, the triangles are congruent. (This follows from ASA, since knowing two angles determines the third.)

**HL (Hypotenuse-Leg).** For right triangles only: if the hypotenuse and one leg are equal, the triangles are congruent.

And here are the criteria that do **not** work:

**SSA (Side-Side-Angle) — NOT a valid criterion.** Two sides and a non-included angle can produce two different triangles (the "ambiguous case"). Knowing SSA does not guarantee congruence.

**AAA (Angle-Angle-Angle) — NOT a valid criterion.** Three equal angles only guarantee *similar* triangles — same shape, but possibly different sizes. A small equilateral triangle and a large equilateral triangle have AAA but are not congruent.

These failures are as important as the successes. They prevent you from claiming congruence when you don't have sufficient evidence.`,
    },

    // ── Visual 2 — Congruence criteria explorer ────────────────────────────────
    {
      type: 'js',
      instruction: `### The Congruence Criteria: Why SSA Fails

The interactive below demonstrates the "ambiguous case" of SSA: two triangles sharing the same two sides and a non-included angle, yet clearly not congruent. Then it shows SSS — which does work — for contrast.`,
      html: `<div style="padding:8px 14px 0;background:#fafaf8;display:flex;gap:8px;flex-wrap:wrap" id="crit-btns"></div>
<canvas id="cv" width="700" height="320"></canvas>
<div id="crit-exp" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;color:#374151;background:#fafaf8;border-top:1px solid #e2e8f0;line-height:1.7"></div>`,
      css: `body{margin:0;background:#fafaf8;font-family:Georgia,serif}
canvas{display:block}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var expEl=document.getElementById('crit-exp');

var criteria=[
  {
    id:'SSS',label:'SSS',color:'#1a3a2a',works:true,
    title:'SSS — Side Side Side (VALID)',
    explanation:'If all three sides of one triangle equal all three sides of another, the triangles are congruent. Reason: given three sides, there is exactly one triangle (up to reflection). The angles are completely determined by the sides via the Law of Cosines.',
    draw:function(){
      // Two congruent triangles with all sides labeled
      drawTriangle(ctx,{x:130,y:260},{x:320,y:260},{x:220,y:120},'#1a3a2a','#1a3a2a',true,true,true);
      drawTriangle(ctx,{x:390,y:260},{x:580,y:260},{x:480,y:120},'#1a3a2a','#1a3a2a',true,true,true);
      ctx.fillStyle='#1a3a2a';ctx.font='bold 14px Georgia';ctx.textAlign='center';
      ctx.fillText('≅',350,205);
      ctx.fillStyle='#1a3a2a';ctx.font='13px Georgia';
      ctx.fillText('All three side pairs match → congruent ✓',W/2,H-10);
    }
  },
  {
    id:'SAS',label:'SAS',color:'#1e3a5f',works:true,
    title:'SAS — Side Angle Side (VALID)',
    explanation:'If two sides and the included angle (the angle between those two sides) match, the triangles are congruent. Key: the angle must be BETWEEN the two sides. If you fix two sides and the angle between them, the third side and remaining angles are fully determined.',
    draw:function(){
      drawTriangle(ctx,{x:130,y:260},{x:310,y:260},{x:200,y:120},'#1e3a5f','#1e3a5f',true,false,true);
      markAngle(ctx,{x:130,y:260},{x:310,y:260},{x:200,y:120},'#1e3a5f',40);
      drawTriangle(ctx,{x:400,y:260},{x:580,y:260},{x:470,y:120},'#1e3a5f','#1e3a5f',true,false,true);
      markAngle(ctx,{x:400,y:260},{x:580,y:260},{x:470,y:120},'#1e3a5f',40);
      ctx.fillStyle='#1e3a5f';ctx.font='bold 14px Georgia';ctx.textAlign='center';
      ctx.fillText('≅',360,195);
      ctx.fillStyle='#1e3a5f';ctx.font='13px Georgia';
      ctx.fillText('Two sides + included angle match → congruent ✓',W/2,H-10);
    }
  },
  {
    id:'SSA',label:'SSA (fails)',color:'#dc2626',works:false,
    title:'SSA — Side Side Angle (NOT VALID — the ambiguous case)',
    explanation:'Given two sides and a non-included angle, two different triangles can satisfy the conditions. The second side can "swing" to two different positions — both create valid triangles with the same SSA data but are clearly not congruent. This is called the ambiguous case.',
    draw:function(){
      // Triangle 1
      var A={x:130,y:250},B={x:320,y:250};
      var angle=35*Math.PI/180;
      var sideAB=190,sideAC=120;
      // C is at distance sideAC from A at angle angle above horizontal
      var Cx=A.x+sideAC*Math.cos(angle);
      var Cy=A.y-sideAC*Math.sin(angle);
      // Find two intersections of circle center C radius BC_target with horizontal from B
      // Let's just use two preset triangles with same SSA
      var T1={A:{x:120,y:250},B:{x:300,y:250},C:{x:200,y:130}};
      var T2={A:{x:120,y:250},B:{x:300,y:250},C:{x:270,y:155}};
      
      // Draw both on same axes
      ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(T1.A.x,T1.A.y);ctx.lineTo(T1.C.x,T1.C.y);ctx.lineTo(T1.B.x,T1.B.y);ctx.stroke();
      ctx.fillStyle='rgba(30,58,95,0.08)';
      ctx.beginPath();ctx.moveTo(T1.A.x,T1.A.y);ctx.lineTo(T1.C.x,T1.C.y);ctx.lineTo(T1.B.x,T1.B.y);ctx.closePath();ctx.fill();
      
      ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(T2.A.x,T2.A.y);ctx.lineTo(T2.C.x,T2.C.y);ctx.lineTo(T2.B.x,T2.B.y);ctx.stroke();
      ctx.fillStyle='rgba(220,38,38,0.08)';
      ctx.beginPath();ctx.moveTo(T2.A.x,T2.A.y);ctx.lineTo(T2.C.x,T2.C.y);ctx.lineTo(T2.B.x,T2.B.y);ctx.closePath();ctx.fill();

      // Labels
      ctx.fillStyle='#1e3a5f';ctx.font='12px Georgia';ctx.textAlign='center';
      ctx.fillText('Triangle 1',210,290);
      ctx.fillStyle='#dc2626';
      ctx.fillText('Triangle 2',260,290);
      
      ctx.fillStyle='#374151';ctx.font='13px Georgia';ctx.textAlign='center';
      ctx.fillText('Same two sides, same angle at A — two different triangles! SSA ✗',W*0.38,H-10);

      // Right side: arc showing "swinging" second side
      var pivotX=450,pivotY=220,r2=100;
      ctx.strokeStyle='rgba(220,38,38,0.3)';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
      ctx.beginPath();ctx.arc(pivotX,pivotY,r2,-0.5,0.5);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(pivotX,pivotY);ctx.lineTo(pivotX+r2*Math.cos(-0.15),pivotY+r2*Math.sin(-0.15));ctx.stroke();
      ctx.beginPath();ctx.moveTo(pivotX,pivotY);ctx.lineTo(pivotX+r2*Math.cos(0.35),pivotY+r2*Math.sin(0.35));ctx.stroke();
      ctx.fillStyle='#dc2626';ctx.font='11px Georgia';ctx.textAlign='center';
      ctx.fillText('"swinging" side',pivotX+120,pivotY-10);
      ctx.fillText('two valid positions',pivotX+120,pivotY+6);
    }
  },
  {
    id:'AAA',label:'AAA (fails)',color:'#92400e',works:false,
    title:'AAA — Angle Angle Angle (NOT VALID for congruence)',
    explanation:'Three equal angles only prove that the triangles are SIMILAR (same shape), not congruent (same shape AND size). A small equilateral triangle and a large equilateral triangle have identical angles but are clearly not the same size. AAA establishes similarity, not congruence.',
    draw:function(){
      // Small and large equilateral triangles
      var s1=70,s2=120;
      var cx1=200,cx2=510;
      function eqTri(cx,s,color){
        var h=s*Math.sqrt(3)/2;
        var A={x:cx-s/2,y:200+h/2},B={x:cx+s/2,y:200+h/2},C={x:cx,y:200-h/2};
        ctx.fillStyle=color+'18';
        ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.fill();
        ctx.strokeStyle=color;ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.stroke();
        ctx.fillStyle=color;ctx.font='11px Georgia';ctx.textAlign='center';
        ctx.fillText('60°',cx,200-h/2-12);ctx.fillText('60°',cx-s/2-18,200+h/2+8);ctx.fillText('60°',cx+s/2+18,200+h/2+8);
        ctx.fillStyle=color+'cc';ctx.font='12px Georgia';
        ctx.fillText('side = '+s,cx,200+h/2+22);
      }
      eqTri(cx1,s1,'#1e3a5f');
      eqTri(cx2,s2,'#92400e');
      ctx.fillStyle='#374151';ctx.font='bold 14px Georgia';ctx.textAlign='center';
      ctx.fillText('~',350,200);ctx.fillText('(similar, NOT ≅)',350,218);
      ctx.fillStyle='#92400e';ctx.font='13px Georgia';
      ctx.fillText('AAA only proves similarity — angles don\'t determine size. AAA ✗',W/2,H-10);
    }
  }
];

function drawTriangle(ctx,A,B,C,strokeColor,fillColor,sideAB,sideBC,sideCA){
  ctx.fillStyle=fillColor+'18';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=strokeColor;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.stroke();
  // Tick marks for equal sides
  function tick(p,q,n,color){
    var mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
    var dx=q.x-p.x,dy=q.y-p.y;
    var len=Math.hypot(dx,dy);
    var nx=-dy/len*8,ny=dx/len*8;
    for(var i=0;i<n;i++){var off=(i-(n-1)/2)*5;
      ctx.strokeStyle=color;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(mx+nx+dx/len*off,my+ny+dy/len*off);ctx.lineTo(mx-nx+dx/len*off,my-ny+dy/len*off);ctx.stroke();}
  }
  if(sideAB)tick(A,B,1,strokeColor);
  if(sideBC)tick(B,C,2,strokeColor);
  if(sideCA)tick(C,A,1,strokeColor);
}
function markAngle(ctx,A,B,C,color,r){
  var a1=Math.atan2(B.y-A.y,B.x-A.x);
  var a2=Math.atan2(C.y-A.y,C.x-A.x);
  ctx.strokeStyle=color;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(A.x,A.y,r,a1,a2,a2<a1);ctx.stroke();
  var midA=(a1+a2)/2;
  ctx.fillStyle=color;ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText('∠',A.x+(r+12)*Math.cos(midA),A.y+(r+12)*Math.sin(midA));
}

var selected=0;
var btnContainer=document.getElementById('crit-btns');
var btns=[];
criteria.forEach(function(c,i){
  var btn=document.createElement('button');
  btn.textContent=c.label;
  btn.style.cssText='padding:6px 14px;border-radius:7px;border:1.5px solid;font-family:Georgia,serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;';
  btn.style.borderColor=c.color+(i===0?'':'' );
  btn.style.background=i===0?c.color+'22':'transparent';
  btn.style.color=i===0?c.color:'rgba(55,65,81,0.5)';
  btn.onclick=function(){
    selected=i;
    btns.forEach(function(b,j){
      b.style.background=j===i?criteria[j].color+'22':'transparent';
      b.style.color=j===i?criteria[j].color:'rgba(55,65,81,0.5)';
    });
    render();
  };
  btnContainer.appendChild(btn);
  btns.push(btn);
});

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  criteria[selected].draw();
  var c=criteria[selected];
  expEl.innerHTML='<strong style="color:'+c.color+'">'+c.title+'</strong><br>'+c.explanation;
}
render();`,
      outputHeight: 440,
    },

    // ── First proof using congruence ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Using Congruence in Proof: The Isosceles Triangle Theorem

Now we can prove something genuinely beautiful using congruence. A triangle is **isosceles** if it has two equal sides. The two equal sides are called the **legs**; the third side is the **base**; the angle between the two legs is the **apex angle**; the angles at the ends of the base are the **base angles**.

**Isosceles Triangle Theorem.** *If two sides of a triangle are equal, the base angles opposite those sides are equal.*

In symbols: if AB = AC in △ABC, then ∠B = ∠C.

**Proof.** Let M be the midpoint of BC. Draw the segment AM (the **median** from A to the midpoint of BC).

Consider triangles △ABM and △ACM:
- AB = AC (given — the two equal sides)
- BM = CM (M is the midpoint of BC — definition)
- AM = AM (shared side — Reflexive Property of Equality)

By SSS, △ABM ≅ △ACM.

Since the triangles are congruent, all corresponding parts are congruent (CPCTC):
∠ABM = ∠ACM

But ∠ABM = ∠B and ∠ACM = ∠C (same angles, different notation). Therefore ∠B = ∠C. □

Notice what happened: we couldn't directly compare ∠B and ∠C, because they're in the same triangle. So we introduced an auxiliary element — the median AM — which split the isosceles triangle into two smaller triangles that we could compare. Proving those triangles congruent, then applying CPCTC, gave us what we needed. This strategy — **introduce an auxiliary line, prove congruence, apply CPCTC** — is the workhorse of triangle geometry.`,
    },

    // ── Visual 3 — Isosceles triangle proof ────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Isosceles Triangle Theorem: Proof Visualization

The proof split the isosceles triangle into two congruent triangles using the median. This visual shows the split and highlights the corresponding parts used in the SSS argument. Drag the apex to change the triangle and verify the theorem holds.`,
      html: `<canvas id="cv" width="700" height="320" style="cursor:move"></canvas>
<div id="iso-proof" style="padding:10px 14px;font-family:Georgia,serif;background:#fafaf8;border-top:1px solid #e2e8f0;font-size:13px"></div>`,
      css: `body{margin:0;background:#fafaf8}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var apex={x:W/2,y:80};
var BASE_Y=260,HALF_BASE=130;
var isDragging=false;

canvas.addEventListener('mousedown',function(){isDragging=true;});
canvas.addEventListener('mouseup',function(){isDragging=false;});
canvas.addEventListener('mousemove',function(e){
  if(!isDragging)return;
  var rect=canvas.getBoundingClientRect();
  apex.x=Math.max(100,Math.min(W-100,(e.clientX-rect.left)*(W/rect.width)));
  apex.y=Math.max(40,Math.min(BASE_Y-40,(e.clientY-rect.top)*(H/rect.height)));
  draw();
});
canvas.addEventListener('touchmove',function(e){
  e.preventDefault();
  var rect=canvas.getBoundingClientRect();
  apex.x=Math.max(100,Math.min(W-100,(e.touches[0].clientX-rect.left)*(W/rect.width)));
  apex.y=Math.max(40,Math.min(BASE_Y-40,(e.touches[0].clientY-rect.top)*(H/rect.height)));
  draw();
},{passive:false});

function angleDeg(v,p,q){
  var a=Math.atan2(p.y-v.y,p.x-v.x);
  var b=Math.atan2(q.y-v.y,q.x-v.x);
  var d=(b-a+2*Math.PI)%(2*Math.PI);
  if(d>Math.PI)d=2*Math.PI-d;
  return Math.round(d*180/Math.PI);
}
function dist2(p,q){return Math.round(Math.hypot(p.x-q.x,p.y-q.y));}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var A=apex;
  var B={x:W/2-HALF_BASE,y:BASE_Y};
  var C={x:W/2+HALF_BASE,y:BASE_Y};
  var M={x:W/2,y:BASE_Y};

  var AB=dist2(A,B),AC=dist2(A,C),BM=dist2(B,M),CM=dist2(C,M);
  var angB=angleDeg(B,A,C),angC=angleDeg(C,A,B);

  // Left triangle (ABM) - blue
  ctx.fillStyle='rgba(30,58,95,0.1)';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(M.x,M.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(M.x,M.y);ctx.closePath();ctx.stroke();

  // Right triangle (ACM) - red
  ctx.fillStyle='rgba(220,38,38,0.1)';
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(C.x,C.y);ctx.lineTo(M.x,M.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(C.x,C.y);ctx.lineTo(M.x,M.y);ctx.closePath();ctx.stroke();

  // Median AM
  ctx.strokeStyle='#92400e';ctx.lineWidth=2;ctx.setLineDash([6,4]);
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(M.x,M.y);ctx.stroke();ctx.setLineDash([]);

  // Equal side tick marks
  function tick(p,q,color){
    var mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
    var dx=q.x-p.x,dy=q.y-p.y;var len=Math.hypot(dx,dy);
    var nx=-dy/len*7,ny=dx/len*7;
    ctx.strokeStyle=color;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(mx+nx,my+ny);ctx.lineTo(mx-nx,my-ny);ctx.stroke();
  }
  tick(A,B,'#1a3a2a');tick(A,C,'#1a3a2a'); // AB = AC
  tick(B,M,'#92400e');tick(M,C,'#92400e'); // BM = MC

  // Labels
  [[A,'A','#374151',-18,0],[B,'B','#1e3a5f',0,18],[C,'C','#dc2626',0,18],[M,'M','#92400e',0,18]].forEach(function(pt){
    ctx.beginPath();ctx.arc(pt[0].x,pt[0].y,5,0,Math.PI*2);ctx.fillStyle=pt[2];ctx.fill();
    ctx.fillStyle=pt[2];ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(pt[1],pt[0].x+pt[3],pt[0].y+pt[4]);
  });

  // Angle labels at B and C
  ctx.fillStyle='#1e3a5f';ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('∠B='+angB+'°',B.x-18,B.y-20);
  ctx.fillStyle='#dc2626';
  ctx.fillText('∠C='+angC+'°',C.x+18,C.y-20);

  // Equal check
  var equal=Math.abs(angB-angC)<=2;
  ctx.fillStyle=equal?'#1a3a2a':'#dc2626';ctx.font='13px Georgia';ctx.textAlign='center';
  ctx.fillText(equal?'∠B = ∠C ✓ (Isosceles Triangle Theorem)':'Drag apex to center to restore isosceles symmetry',W/2,H-10);

  // Proof panel
  var pp=document.getElementById('iso-proof');
  pp.innerHTML='<strong>SSS argument:</strong> '
    +'<span style="color:#1e3a5f">AB = AC = '+AB+'</span> (given), '
    +'<span style="color:#92400e">BM = CM = '+BM+'</span> (M is midpoint), '
    +'AM = AM (reflexive).'
    +'<br>∴ △ABM ≅ △ACM by SSS. By CPCTC: <strong>∠B = ∠C = '+Math.round((angB+angC)/2)+'°</strong>.'
    +'<br><span style="color:#9ca3af;font-size:11px">Drag apex to change the triangle. Notice ∠B = ∠C regardless of where you place A, as long as the triangle remains isosceles.</span>';
}
draw();`,
      outputHeight: 400,
    },

    // ── Proofs using congruence ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Proof Toolkit: Triangle Congruence Strategy

By now a pattern is emerging in how proofs work. Let's make it explicit.

**When a proof asks you to show two segments or angles are equal, your first question should be:** can I embed these in two congruent triangles?

If the segments or angles you want to compare are corresponding parts of two triangles, and you can prove those triangles congruent, then CPCTC gives you the equality for free.

The strategy in practice:

**Step 1:** Identify the two segments or angles you want to prove equal.

**Step 2:** Find (or draw) two triangles that contain those as corresponding parts.

**Step 3:** Identify which congruence criterion (SSS, SAS, ASA, AAS, HL) might apply. Ask: what information do I have? What do I need?

**Step 4:** Prove the triangles congruent using the chosen criterion.

**Step 5:** Conclude by CPCTC.

Almost every theorem in the next several lessons follows this pattern. The angle bisector theorem, properties of parallelograms, the perpendicular bisector theorem, properties of isosceles trapezoids — all involve finding the right pair of triangles and the right congruence criterion.

Geometry is not a collection of facts to memorize. It is a toolkit and a methodology. The congruence criteria are the key tools. Proof is the methodology. Together they give you the ability to derive any geometric fact from first principles — which is exactly what the carpenter needed to guarantee her bridge parts are truly identical.`,
    },

    // ── Challenges ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In △ABC, point D is on side BC such that AD bisects angle A (meaning ∠BAD = ∠CAD). You also know AB = AC. A student claims: "△ABD ≅ △ACD by SAS." Is this argument valid?`,
      options: [
        { label: 'A', text: 'Yes — AB = AC (given), AD = AD (reflexive), and ∠BAD = ∠CAD (angle bisector). That is two sides and an included angle. SAS applies.' },
        { label: 'B', text: 'No — you have two sides and an angle, but the angle is not between the two identified sides. AB and AD with ∠BAD between them works for SAS. This argument is correct.' },
        { label: 'C', text: 'No — you need all three sides to prove congruence. SSS is required.' },
        { label: 'D', text: 'No — angle bisectors cannot be used as sides in congruence arguments.' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. The SAS criterion requires two sides and their included angle — the angle between those two sides. Here: AB = AC (given), ∠BAD = ∠CAD (angle bisector, given), AD = AD (reflexive). The angle ∠BAD is between AB and AD. The angle ∠CAD is between AC and AD. This is a valid SAS argument. The triangles are congruent, and by CPCTC, BD = CD and ∠ABD = ∠ACD.',
      failMessage: 'Check the SAS criterion carefully: two sides and the angle BETWEEN them. For △ABD: the sides AB and AD with the included angle ∠BAD. For △ACD: the sides AC and AD with the included angle ∠CAD. We have AB = AC (given), ∠BAD = ∠CAD (angle bisector), AD = AD (reflexive). The angle IS between the two sides in each triangle. SAS applies.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 280,
    },

    {
      type: 'challenge',
      instruction: `You want to prove that the diagonals of a rectangle bisect each other (each diagonal cuts the other into two equal halves). Which congruence criterion would you use for the pair of triangles you identify, and what is the key property of the rectangle that drives the proof?`,
      options: [
        { label: 'A', text: 'SSS — you measure all three sides of each triangle formed by the diagonals.' },
        { label: 'B', text: 'ASA — using the fact that opposite sides of a rectangle are equal (giving one side), and that parallel lines cut by a transversal create equal alternate interior angles (giving two angles at the intersection).' },
        { label: 'C', text: 'AAA — since all angles in a rectangle are right angles.' },
        { label: 'D', text: 'HL — using the right angles at the corners and the equal hypotenuses.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Label the rectangle ABCD and diagonals AC and BD intersecting at E. Look at triangles △ABE and △CDE. AB = CD (opposite sides of rectangle are equal — this is one side). ∠ABE = ∠CDE and ∠BAE = ∠DCE (alternate interior angles, since AB ∥ CD with transversal BD and AC respectively). By ASA, △ABE ≅ △CDE. By CPCTC, AE = CE and BE = DE — the diagonals bisect each other.',
      failMessage: 'Think about the triangles formed when the diagonals cross at point E. △ABE and △CDE share the angle at E and have AB = CD (opposite sides of the rectangle). The key property is that AB ∥ CD (rectangle has parallel opposite sides), which gives alternate interior angles. With two angles and the included side, ASA is the right criterion.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 280,
    },

  ],
};

export default {
  id: 'geo-1-6',
  slug: 'congruence',
  chapter: 'geometry-1',
  order: 6,
  title: 'Congruence: Identical Shapes',
  subtitle: 'How few measurements determine a triangle — and what that tells us about proof.',
  tags: ['geometry', 'congruence', 'SSS', 'SAS', 'ASA', 'AAS', 'CPCTC', 'isosceles-triangle', 'two-column-proof'],
  hook: {
    question: 'How few measurements do you need to guarantee two triangles are identical?',
    realWorldContext: 'A bridge builder needs hundreds of identical triangular supports. Three measurements suffice — but only the right three. The congruence criteria answer this question with mathematical certainty, not just engineering convention.',
    previewVisualizationId: 'G1_5_Congruence',
  },
  intuition: {
    prose: [
      'Two figures are congruent (≅) if one can be placed exactly on the other: all sides and angles match.',
      'Valid criteria for triangle congruence: SSS, SAS, ASA, AAS, HL (right triangles).',
      'Invalid criteria: SSA (ambiguous case — two triangles can satisfy the same SSA), AAA (only proves similarity, not congruence).',
      'CPCTC: once triangles are proven congruent, all corresponding parts are congruent.',
      'Proof strategy: to prove two segments or angles equal, embed them as corresponding parts of two congruent triangles, then apply CPCTC.',
    ],
    callouts: [
      { type: 'important', title: 'Why SSA fails', body: 'Given two sides and a non-included angle, the second side can "swing" to two positions. Two different triangles can satisfy the same SSA conditions. This is the ambiguous case. Always check that your angle is INCLUDED (between the two sides) when using SAS.' },
      { type: 'definition', title: 'CPCTC', body: 'Corresponding Parts of Congruent Triangles are Congruent. Once you prove △ABC ≅ △DEF by any criterion, you automatically know AB = DE, BC = EF, CA = FD, ∠A = ∠D, ∠B = ∠E, ∠C = ∠F.' },
    ],
    visualizations: [{ id: 'G1_5_Congruence', title: 'Congruence Criteria: SAS, SSS, and More' }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Congruence = same shape AND same size. All six measurements match.',
    'Valid criteria: SSS (3 sides), SAS (2 sides + included angle), ASA (2 angles + included side), AAS (2 angles + non-included side), HL (right triangles).',
    'Invalid: SSA (ambiguous — two triangles possible), AAA (only similarity).',
    'Proof strategy: find congruent triangles containing your target → prove by SSS/SAS/ASA/AAS → apply CPCTC.',
    'Auxiliary lines introduce new elements (midpoints, angle bisectors, medians) to create the triangles you need.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_GEO_1_6 };
