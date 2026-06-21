// Geometry · Chapter 2 · Lesson 5
// Similarity and Proportion
import geoSimilarTrianglesUrl from '../diagrams/geo-similar-triangles.svg?url'
import quizSimilarShadowUrl from '../diagrams/quiz-similar-shadow.svg?url'

const LESSON_GEO_2_SIMILARITY = {
  title: 'Similarity and Proportion',
  subtitle: 'How triangles of different sizes can be geometrically identical — and why this fact powers all of trigonometry.',
  subject: 'Geometry',
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
      html: `<div style="padding:10px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <span style="font-family:Georgia,serif;font-size:13px">Scale factor k: <strong id="k-lbl">1.0</strong></span>
  <input type="range" id="k-sl" min="0.4" max="2.5" value="1.0" step="0.05" style="flex:1;min-width:120px">
</div>
<canvas id="cv" width="700" height="300"></canvas>
<div id="sim-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.8"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
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

var kSl=document.getElementById('k-sl'),kLbl=document.getElementById('k-lbl');

// Base triangle: right triangle with legs 80, 60, hyp 100
var baseA={x:120,y:240},baseB={x:280,y:240},baseC={x:120,y:100};

function angD(v,p,q){var a=Math.atan2(p.y-v.y,p.x-v.x),b=Math.atan2(q.y-v.y,q.x-v.x);var d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;return Math.round(d*180/Math.PI);}
function dist(p,q){return Math.hypot(p.x-q.x,p.y-q.y).toFixed(1);}

function draw(){
  var k=parseFloat(kSl.value);
  kLbl.textContent=k.toFixed(2);
  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  // Original triangle (fixed)
  ctx.fillStyle='rgba(30,58,95,0.1)';
  ctx.beginPath();ctx.moveTo(baseA.x,baseA.y);ctx.lineTo(baseB.x,baseB.y);ctx.lineTo(baseC.x,baseC.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(baseA.x,baseA.y);ctx.lineTo(baseB.x,baseB.y);ctx.lineTo(baseC.x,baseC.y);ctx.closePath();ctx.stroke();

  var angA1=angD(baseA,baseB,baseC),angB1=angD(baseB,baseA,baseC),angC1=angD(baseC,baseA,baseB);

  // Right angle at A
  ctx.strokeStyle=NAVY;ctx.lineWidth=1.5;ctx.strokeRect(baseA.x,baseA.y-12,12,12);

  var verts1=[{p:baseA,l:'A',ox:-14,oy:16},{p:baseB,l:'B',ox:8,oy:16},{p:baseC,l:'C',ox:-18,oy:-6}];
  verts1.forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle=NAVY;ctx.fill();
    ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  // Side labels
  ctx.fillStyle=NAVY;ctx.font='11px Georgia';ctx.textAlign='center';
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
  ctx.strokeStyle=GREEN;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(sA.x,sA.y);ctx.lineTo(sB.x,sB.y);ctx.lineTo(sC.x,sC.y);ctx.closePath();ctx.stroke();

  // Right angle at A'
  ctx.strokeStyle=GREEN;ctx.lineWidth=1.5;ctx.strokeRect(sA.x,sA.y-12,12,12);

  var verts2=[{p:sA,l:"A'",ox:-18,oy:16},{p:sB,l:"B'",ox:8,oy:16},{p:sC,l:"C'",ox:-22,oy:-6}];
  verts2.forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle=GREEN;ctx.fill();
    ctx.fillStyle=GREEN;ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  ctx.fillStyle=GREEN;ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText("A'B'="+dist(sA,sB),(sA.x+sB.x)/2,(sA.y+sB.y)/2+16);
  ctx.fillText("A'C'="+dist(sA,sC),(sA.x+sC.x)/2-22,(sA.y+sC.y)/2);
  ctx.fillText("B'C'="+dist(sB,sC),(sB.x+sC.x)/2+22,(sB.y+sC.y)/2);

  // Similarity label
  ctx.fillStyle=TEXT;ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('△ABC ~ △A\\'B\\'C\\'  (scale factor k = '+k.toFixed(2)+')',W/2,H-10);

  // Angles
  var angA2=angD(sA,sB,sC),angB2=angD(sB,sA,sC),angC2=angD(sC,sA,sB);

  document.getElementById('sim-info').innerHTML=
    '<strong>Angles:</strong> △ABC: ∠A='+angA1+'°, ∠B='+angB1+'°, ∠C='+angC1+'° | '
    +'△A\\'B\\'C\\': ∠A\\'='+angA2+'°, ∠B\\'='+angB2+'°, ∠C\\'='+angC2+'° '
    +'— <strong style="color:#1a3a2a">all equal ✓</strong>'
    +'<br><strong>Side ratios:</strong> A\\'B\\'/AB = '+k.toFixed(2)+', A\\'C\\'/AC = '+k.toFixed(2)+', B\\'C\\'/BC = '+k.toFixed(2)
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
      html: `<div style="padding:10px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <span style="font-family:Georgia,serif;font-size:13px">Known side AB: <strong id="ab-lbl">6</strong></span>
  <input type="range" id="ab-sl" min="3" max="12" value="6" style="flex:1;min-width:100px">
  <span style="font-family:Georgia,serif;font-size:13px">Known side A'B': <strong id="ab2-lbl">9</strong></span>
  <input type="range" id="ab2-sl" min="3" max="18" value="9" style="flex:1;min-width:100px">
</div>
<canvas id="cv" width="700" height="260"></canvas>
<div id="prop-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.8"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
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

var abSl=document.getElementById('ab-sl'),ab2Sl=document.getElementById('ab2-sl');
var abLbl=document.getElementById('ab-lbl'),ab2Lbl=document.getElementById('ab2-lbl');

function draw(){
  var AB=parseInt(abSl.value),AB2=parseInt(ab2Sl.value);
  abLbl.textContent=AB;ab2Lbl.textContent=AB2;
  var k=AB2/AB;
  // Fixed similar triangles, scaled by k
  var BC=8,AC=10; // original triangle sides
  var BC2=BC*k,AC2=AC*k;

  ctx.clearRect(0,0,W,H);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

  var scale=14;
  // Left triangle
  var lA={x:80,y:220},lB={x:80+AB*scale,y:220},lC={x:80,y:220-AC*scale*0.8};
  ctx.fillStyle='rgba(30,58,95,0.1)';ctx.beginPath();ctx.moveTo(lA.x,lA.y);ctx.lineTo(lB.x,lB.y);ctx.lineTo(lC.x,lC.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=NAVY;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(lA.x,lA.y);ctx.lineTo(lB.x,lB.y);ctx.lineTo(lC.x,lC.y);ctx.closePath();ctx.stroke();

  // Right angle
  ctx.strokeStyle=NAVY;ctx.lineWidth=1.5;ctx.strokeRect(lA.x,lA.y-12,12,12);

  [{p:lA,l:'A',ox:-14,oy:16},{p:lB,l:'B',ox:6,oy:16},{p:lC,l:'C',ox:-16,oy:-6}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle=NAVY;ctx.fill();
    ctx.fillStyle=NAVY;ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });
  ctx.fillStyle=NAVY;ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText('AB = '+AB,(lA.x+lB.x)/2,lA.y+18);
  ctx.fillText('BC = '+BC,(lB.x+lC.x)/2+20,(lB.y+lC.y)/2);
  ctx.fillStyle=RED;ctx.font='bold 12px Georgia';ctx.fillText('AC = ?',lA.x-28,(lA.y+lC.y)/2);

  // Right triangle (scaled)
  var scale2=scale*k*0.75;
  var rA={x:430,y:220},rB={x:430+AB2*scale2/k,y:220},rC={x:430,y:220-AC2*scale2/k*0.8};
  ctx.fillStyle='rgba(26,58,42,0.12)';ctx.beginPath();ctx.moveTo(rA.x,rA.y);ctx.lineTo(rB.x,rB.y);ctx.lineTo(rC.x,rC.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=GREEN;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(rA.x,rA.y);ctx.lineTo(rB.x,rB.y);ctx.lineTo(rC.x,rC.y);ctx.closePath();ctx.stroke();
  ctx.strokeStyle=GREEN;ctx.lineWidth=1.5;ctx.strokeRect(rA.x,rA.y-12,12,12);

  [{p:rA,l:"A'",ox:-18,oy:16},{p:rB,l:"B'",ox:6,oy:16},{p:rC,l:"C'",ox:-20,oy:-6}].forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle=GREEN;ctx.fill();
    ctx.fillStyle=GREEN;ctx.font='bold 12px Georgia';ctx.textAlign='left';ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });
  ctx.fillStyle=GREEN;ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText("A'B' = "+AB2,(rA.x+rB.x)/2,(rA.y+rB.y)/2+18);
  ctx.fillText("B'C' = "+BC2.toFixed(1),(rB.x+rC.x)/2+22,(rB.y+rC.y)/2);
  ctx.fillStyle=GREEN;ctx.font='bold 12px Georgia';
  ctx.fillText("A'C' = "+AC2.toFixed(1),rA.x-26,(rA.y+rC.y)/2);

  // Proportion display
  ctx.fillStyle=TEXT;ctx.font='bold 13px Georgia';ctx.textAlign='center';
  ctx.fillText('△ABC ~ △A\\'B\\'C\\'   k = A\\'B\\' / AB = '+AB2+' / '+AB+' = '+k.toFixed(3),W/2,H-10);

  document.getElementById('prop-info').innerHTML=
    '<strong>Proportion:</strong> AB/A\\'B\\' = BC/B\\'C\\' = AC/A\\'C\\' = 1/'+k.toFixed(2)
    +'<br><strong>Solving for A\\'C\\':</strong> AC/A\\'C\\' = AB/A\\'B\\' → '+AC+'/A\\'C\\' = '+AB+'/'+AB2
    +' → A\\'C\\' = '+AC+' × '+AB2+'/'+AB+' = <strong style="color:#1a3a2a">'+AC2.toFixed(2)+'</strong>'
    +'<br><span style="color:var(--color-text-tertiary, #9ca3af);font-size:11px">This is the universal method: identify the similar triangles, write the proportion, cross-multiply and solve.</span>';
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

export default {
  id: 'geo-2-similarity',
  subject: 'Geometry',
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
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Two triangles are similar (△ABC ~ △DEF)** if all three pairs of angles are equal. When angles match, the sides are automatically **proportional** — every ratio of corresponding sides equals the same scale factor k.',
          '**The AA criterion** is the workhorse: if two pairs of angles match, the triangles are similar (the third pair is forced by the angle sum = 180°). You never need to check all three angles.',
        ],
      },
      {
        type: 'image',
        src: geoSimilarTrianglesUrl,
        alt: 'Two similar triangles: small 3-4-5 triangle ABC and large 6-8-10 triangle DEF. All angle pairs match; side ratios all equal 1/2 (scale factor k=2).',
        caption: 'Similar triangles △ABC ~ △DEF with scale factor k = 2. Every pair of corresponding sides has ratio 1:2. Angles are identical.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Classic setups that create similar triangles:** (1) A line parallel to one side of a triangle cuts the other two sides proportionally (Triangle Proportionality Theorem). (2) The altitude from the right angle to the hypotenuse creates three mutually similar triangles. (3) Shadow-and-stick problems: the same sun angle creates equal angles, giving similar triangles.',
          '**Why trigonometry works:** All right triangles with a given acute angle θ are similar by AA (they share θ and 90°). Therefore the ratio opposite/hypotenuse is the same for every one of them — depending only on θ. That constant ratio is sin(θ). Without the similarity guarantee, "sin(30°)" would not have a unique value.',
          '**Area scales as k²:** if the linear scale factor is k, then corresponding areas scale by k². Double all lengths → quadruple the area.',
        ],
      },
      {
        type: 'callout',
        kind: 'important',
        title: 'Why trig works — similarity is the foundation',
        body: 'All right triangles with the same acute angle θ are similar (AA criterion). The ratio opp/hyp is therefore the same constant for all of them. That constant is sin(θ). Without the similarity theorem, every different-sized triangle with angle 30° would potentially have a different ratio — trigonometry would be impossible.',
      },
      {
        type: 'viz',
        id: 'ScienceNotebook',
        props: { lesson: LESSON_GEO_2_SIMILARITY },
        mathBridge: 'Work through the notebook: (1) drag the scale slider and watch all side ratios update together — confirming the single scale factor k; (2) in the proportion finder, set up the correct ratio equation for the shadow problem; (3) use the trig connection cell to see why sin(30°) = 0.5 regardless of triangle size.',
      },
    ],
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
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"AA: two equal angles → similar." Triangle ABC has angles 50° and 70°. Triangle DEF has angles 50° and 70°. Are they similar?',
      options: [
        'Only if their sides are also proportional',
        'Yes — two pairs of equal angles guarantee similarity (the third angles must also match since all three sum to 180°)',
        'Only if they have the same orientation',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Scale factor k = any ratio of corresponding sides." Two similar triangles have sides 3, 4, 5 and 6, 8, 10. What is the scale factor?',
      options: [
        '1.5',
        '2',
        '3',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"To find unknown length: identify similar triangles, write proportion, cross-multiply." A 6m pole casts a 4m shadow. Simultaneously a tree casts a 10m shadow. How tall is the tree?',
      options: [
        '12m',
        '15m',
        '8m',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Area scales as k² when linear dimensions scale by k." Two similar triangles have linear scale factor 3. If the smaller has area 10 cm², what is the area of the larger?',
      options: [
        '30 cm²',
        '90 cm²',
        '100 cm²',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      diagram: quizSimilarShadowUrl,
      diagramAlt: 'A 6m pole with a 4m shadow, and a tree with a 10m shadow. Same sun angle creates similar triangles.',
      text: 'A 6 m pole casts a 4 m shadow. Simultaneously, a tree casts a 10 m shadow. The sun angle is the same, creating similar triangles. How tall is the tree?',
      options: [
        '12 m',
        '15 m',
        '8 m',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'Triangles △PQR and △XYZ have ∠P = ∠X and ∠Q = ∠Y. Why are the triangles guaranteed to be similar?',
      options: [
        'They are not — you need all three angle pairs to match',
        'Two equal angle pairs are enough (AA criterion): the third pair must also be equal because all angles in each triangle sum to 180°. Same angle sum forces the third angle to equal (180° − ∠P − ∠Q).',
        'They are similar only if PQ is parallel to XY',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'In the right triangle with altitude drawn to the hypotenuse, the altitude creates two smaller triangles. What is their relationship to the original triangle and to each other?',
      options: [
        'The two smaller triangles are congruent to each other but not to the original',
        'All three triangles (original + two smaller) are mutually similar — they share angles by the AA criterion',
        'The smaller triangles are only similar if the original is isosceles',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Map scale is 1 : 25,000. A region on the map has area 4 cm². What is the actual area?',
      options: [
        '100,000 cm² = 10 m²',
        '2,500,000,000 cm² = 2.5 km²',
        '100 cm²',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'The Triangle Proportionality Theorem says: a line parallel to one side of a triangle divides the other two sides proportionally. If the line cuts sides AB and AC such that the upper portions are 4 and 6, what are the ratios of the lower portions?',
      options: [
        'Lower portions must be 4 and 6 (equal)',
        'Lower portions have the same ratio 4:6 = 2:3 to the total sides, so they are proportional (but their exact values depend on where the parallel line is placed)',
        'The theorem only applies to isosceles triangles',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Why does sin(45°) = √2/2 for any right triangle containing a 45° angle, regardless of the triangle\'s size?',
      options: [
        'It is a coincidence that works only for the specific triangle where the legs each have length 1',
        'All right triangles with a 45° angle are similar by AA (they share 45° and 90°). Similarity guarantees the ratio opposite/hypotenuse is the same constant for all of them. That constant is √2/2.',
        'Trigonometric ratios are defined by convention to be size-independent',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_2_SIMILARITY };
