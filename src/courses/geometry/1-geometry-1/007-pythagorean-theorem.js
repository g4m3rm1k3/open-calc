// Geometry · Chapter 1 · Lesson 7
// The Pythagorean Theorem: Three Proofs
import geoPythagoreanProofUrl from '../diagrams/geo-pythagorean-proof.svg?url'
import distanceFormulaUrl from '../diagrams/distance-formula.svg?url'
import quizPythagFindCUrl from '../diagrams/quiz-pythagorean-find-c.svg?url'
import quizPythagFindLegUrl from '../diagrams/quiz-pythagorean-find-leg.svg?url'

const LESSON_GEO_1_7 = {
  title: "The Pythagorean Theorem: Three Proofs",
  subtitle:
    "Why the most famous theorem in mathematics has been proved over 370 times — and what each approach reveals.",
  subject: 'Geometry',
  sequential: true,

  cells: [
    {
      type: "markdown",
      instruction: `### The Most Proven Theorem in Mathematics

The Pythagorean Theorem has been proved more times than any other theorem in mathematics. The Guinness World Record belongs to Elisha Scott Loomis, who collected 371 distinct proofs in his 1927 book *The Pythagorean Proposition*. Since then, more have been added — including a proof published in 2023 by two high-school students using trigonometry in a way that had been believed impossible for over a century.

Why would anyone prove the same theorem 370 times?

Because each proof reveals something different. A proof is not just a certificate of truth — it is a *route* through mathematical territory. Different routes illuminate different landscapes. The area proof shows why the theorem is about squares. The similar triangles proof reveals a deep self-similarity in right triangles. The algebraic proof demonstrates how coordinates and algebra reach geometric conclusions that felt purely visual.

When you understand three proofs of the same theorem, you understand the theorem three times as deeply. You see it from three angles, each casting a different light. And you develop the most important mathematical skill there is: the ability to approach the same problem from completely different directions.

We'll work through three proofs, each using different tools:
1. **The Square Dissection Proof** — area and rearrangement
2. **The Similar Triangles Proof** — ratios and self-similarity
3. **The Algebraic Proof** — the distance formula`,
    },

    {
      type: "markdown",
      instruction: `### The Statement, Precisely

**Pythagorean Theorem.** *In any right triangle with legs a and b and hypotenuse c:*
$$a^2 + b^2 = c^2$$

The legs are the two sides adjacent to the right angle. The hypotenuse is the side opposite the right angle — always the longest side.

The theorem says something precise about areas: the area of the square built on the hypotenuse equals the sum of the areas of the squares built on the two legs. This is a statement about area, not just about lengths. Understanding it this way makes the first proof natural.

The converse is also true and equally useful: *If a² + b² = c² in a triangle, then the triangle has a right angle opposite side c.* This is how carpenters check for right angles using the 3-4-5 rule: a triangle with sides 3, 4, 5 satisfies 3² + 4² = 5² (9 + 16 = 25), so the angle opposite the side of length 5 is exactly 90°.`,
    },

    // ── Proof 1 — Dissection ──────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### Proof 1: The Square Dissection (Visual / Area)

This proof was known in ancient China, India, and Babylon — possibly before Pythagoras himself.

**Setup:** Take a right triangle with legs a, b and hypotenuse c. Build a large square with side (a + b). Fill it two different ways and compare.

**Filling 1:** Place four copies of the right triangle inside the (a+b)² square, arranged so their hypotenuses form an inner square of side c. The inner square has area c². The four triangles together have area 4 × (½ab) = 2ab. So:

$$(a+b)^2 = c^2 + 2ab$$

**Filling 2:** Now rearrange the four triangles to leave two rectangular gaps instead of one square gap. The two remaining rectangles have combined area a² + b². The four triangles are the same, so:

$$(a+b)^2 = a^2 + b^2 + 2ab$$

**Combining:** Both expressions equal (a+b)². Therefore:

$$c^2 + 2ab = a^2 + b^2 + 2ab$$

Subtract 2ab from both sides:

$$c^2 = a^2 + b^2 \quad \square$$

The key insight: the same four triangles can be arranged two ways inside the same square, leaving different empty regions. Since the triangles are identical in both arrangements, the empty regions must have equal total area. One empty region is c²; the other is a² + b².`,
    },

    // ── Visual 1 — Dissection proof ───────────────────────────────────────────
    {
      type: "js",
      instruction: `### Proof 1 Animated: The Two Arrangements

Toggle between the two arrangements of four identical triangles inside the same (a+b)² square. Watch the empty area change shape but not size — and see why a² + b² = c² must follow.`,
      html: `<div style="padding:10px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;gap:12px;align-items:center;flex-wrap:wrap">
  <button id="toggle-arr" style="padding:7px 18px;border-radius:8px;border:1.5px solid #1e3a5f;background:#1e3a5f;color:#fff;font-family:Georgia,serif;font-size:13px;cursor:pointer">Show Arrangement 2</button>
  <span style="font-family:Georgia,serif;font-size:13px;color:var(--color-text-primary, #1e293b)">Drag slider to change triangle shape:</span>
  <input type="range" id="ratio-sl" min="20" max="80" value="38" style="width:120px">
  <span id="ratio-lbl" style="font-family:Georgia,serif;font-size:12px;color:var(--color-text-secondary, #475569)">a=38, b=62</span>
</div>
<canvas id="cv" width="700" height="360"></canvas>
<div id="area-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var arr=1;
var ratioSl=document.getElementById('ratio-sl');
var ratioLbl=document.getElementById('ratio-lbl');
var toggleBtn=document.getElementById('toggle-arr');

toggleBtn.onclick=function(){
  arr=arr===1?2:1;
  toggleBtn.textContent=arr===1?'Show Arrangement 2':'Show Arrangement 1';
  draw();
};
ratioSl.oninput=function(){draw();};

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  var a=parseInt(ratioSl.value),b=100-a;
  ratioLbl.textContent='a='+a+', b='+b;
  var scale=2.6;
  var a_=a*scale,b_=b*scale,s_=(a+b)*scale;
  var ox=(W-s_)/2,oy=(H-s_)/2;

  // Big square background
  ctx.fillStyle='rgba(226,232,240,0.4)';
  ctx.fillRect(ox,oy,s_,s_);
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
  ctx.strokeRect(ox,oy,s_,s_);

  var tri_color='rgba(59,130,246,0.25)';
  var tri_stroke='#1e3a5f';

  if(arr===1){
    // Arrangement 1: four triangles leave inner square of side c
    // Triangle 1: top-left corner
    ctx.fillStyle=tri_color;ctx.strokeStyle=tri_stroke;ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+a_,oy);ctx.lineTo(ox,oy+b_);ctx.closePath();ctx.fill();ctx.stroke();
    // Triangle 2: top-right
    ctx.beginPath();ctx.moveTo(ox+s_,oy);ctx.lineTo(ox+s_,oy+a_);ctx.lineTo(ox+b_,oy);ctx.closePath();ctx.fill();ctx.stroke();
    // Triangle 3: bottom-right
    ctx.beginPath();ctx.moveTo(ox+s_,oy+s_);ctx.lineTo(ox+s_-a_,oy+s_);ctx.lineTo(ox+s_,oy+s_-b_);ctx.closePath();ctx.fill();ctx.stroke();
    // Triangle 4: bottom-left
    ctx.beginPath();ctx.moveTo(ox,oy+s_);ctx.lineTo(ox,oy+s_-a_);ctx.lineTo(ox+b_,oy+s_);ctx.closePath();ctx.fill();ctx.stroke();

    // Inner square (c²)
    ctx.fillStyle='rgba(220,38,38,0.18)';
    ctx.beginPath();ctx.moveTo(ox+a_,oy);ctx.lineTo(ox+s_,oy+a_);ctx.lineTo(ox+s_-a_,oy+s_);ctx.lineTo(ox,oy+s_-a_);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(ox+a_,oy);ctx.lineTo(ox+s_,oy+a_);ctx.lineTo(ox+s_-a_,oy+s_);ctx.lineTo(ox,oy+s_-a_);ctx.closePath();ctx.stroke();

    // Label inner square
    ctx.fillStyle='#dc2626';ctx.font='bold 16px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('c²',W/2,H/2);

  } else {
    // Arrangement 2: four triangles leave two rectangles (a² and b²)
    // Triangle 1: top-left
    ctx.fillStyle=tri_color;ctx.strokeStyle=tri_stroke;ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+b_,oy);ctx.lineTo(ox,oy+a_);ctx.closePath();ctx.fill();ctx.stroke();
    // Triangle 2: top-right
    ctx.beginPath();ctx.moveTo(ox+b_,oy);ctx.lineTo(ox+s_,oy);ctx.lineTo(ox+s_,oy+b_);ctx.closePath();ctx.fill();ctx.stroke();
    // Triangle 3: bottom-right
    ctx.beginPath();ctx.moveTo(ox+s_,oy+b_);ctx.lineTo(ox+s_,oy+s_);ctx.lineTo(ox+a_,oy+s_);ctx.closePath();ctx.fill();ctx.stroke();
    // Triangle 4: bottom-left
    ctx.beginPath();ctx.moveTo(ox+a_,oy+s_);ctx.lineTo(ox,oy+s_);ctx.lineTo(ox,oy+a_);ctx.closePath();ctx.fill();ctx.stroke();

    // a² square (top right area)
    ctx.fillStyle='rgba(26,58,42,0.18)';
    ctx.fillRect(ox+b_,oy,a_,a_);
    ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2;ctx.strokeRect(ox+b_,oy,a_,a_);
    ctx.fillStyle='#1a3a2a';ctx.font='bold 15px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('a²',ox+b_+a_/2,oy+a_/2);

    // b² square (bottom left area)
    ctx.fillStyle='rgba(124,58,237,0.18)';
    ctx.fillRect(ox,oy+a_,b_,b_);
    ctx.strokeStyle='#7c3aed';ctx.lineWidth=2;ctx.strokeRect(ox,oy+a_,b_,b_);
    ctx.fillStyle='#7c3aed';ctx.font='bold 15px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('b²',ox+b_/2,oy+a_+b_/2);
  }

  // Side labels
  ctx.fillStyle='#374151';ctx.font='13px Georgia';ctx.textAlign='center';
  ctx.fillText('a',ox+a_/2,oy-10);
  ctx.fillText('b',ox+a_+b_/2,oy-10);
  ctx.fillText('a+b',ox+s_/2,oy+s_+18);

  var c2=a*a+b*b;
  var c=Math.sqrt(c2).toFixed(1);
  var infoEl=document.getElementById('area-info');
  if(arr===1){
    infoEl.innerHTML='<strong>Arrangement 1:</strong> Four triangles leave an inner square of side c. '
      +'Empty area = c² = '+(c2)+'. Equation: (a+b)² = c² + 2ab = '+c2+' + '+(2*a*b)+' = '+((a+b)*(a+b))+'.'
      +'<br><span style="color:var(--color-text-tertiary, #9ca3af);font-size:11px">Toggle to Arrangement 2 to see the same four triangles leave a² + b² empty.</span>';
  } else {
    infoEl.innerHTML='<strong>Arrangement 2:</strong> Same four triangles leave two squares: a² = '+a*a+' and b² = '+b*b+'. '
      +'Empty area = a² + b² = '+(a*a+b*b)+'. Equation: (a+b)² = a² + b² + 2ab = '+(a*a+b*b)+' + '+(2*a*b)+' = '+((a+b)*(a+b))+'.'
      +'<br><strong style="color:#1a3a2a">Since both empty areas come from the same square minus the same four triangles: c² = a² + b².</strong>';
  }
}
draw();`,
      outputHeight: 480,
    },

    // ── Proof 2 — Similar triangles ───────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### Proof 2: Similar Triangles (Euclid's Own Proof)

This is the proof Euclid himself gave in Book I, Proposition 47 of the Elements. It uses similar triangles — a concept we'll develop more fully in a later chapter, but whose core idea is accessible now.

**Key fact about right triangles:** In a right triangle, the altitude drawn from the right angle to the hypotenuse divides the triangle into two smaller triangles, both of which are **similar** to the original and to each other.

Two triangles are similar if they have the same three angle measures (same shape, possibly different size).

**Setup:** Let △ABC have a right angle at C. Draw altitude CD to hypotenuse AB, where D is the foot of the altitude. This creates triangles △ACD and △CBD.

**Claim:** △ABC ~ △ACD ~ △CBD (all three are similar).

**Proof of similarity:**
- In △ACD: ∠A is shared with △ABC. ∠ADC = 90°. So ∠ACD = 90° − ∠A = ∠B (angle sum).
- In △CBD: ∠B is shared with △ABC. ∠BDC = 90°. So ∠BCD = 90° − ∠B = ∠A (angle sum).
- All three triangles have angles A, B, and 90°. They are similar.

**Using the similar triangles:**

Since △ABC ~ △ACD: corresponding sides are proportional.
$$\\frac{AC}{AB} = \\frac{AD}{AC} \\implies AC^2 = AB \\cdot AD$$

That is: $b^2 = c \\cdot AD$.

Since △ABC ~ △CBD:
$$\\frac{BC}{AB} = \\frac{BD}{BC} \\implies BC^2 = AB \\cdot BD$$

That is: $a^2 = c \\cdot BD$.

**Add the two equations:**
$$a^2 + b^2 = c \\cdot BD + c \\cdot AD = c(AD + BD) = c \\cdot AB = c \\cdot c = c^2 \\quad \\square$$

The self-similar structure of the right triangle — the altitude creates two smaller copies of itself — is the heart of this proof.`,
    },

    // ── Visual 2 — Similar triangles ─────────────────────────────────────────
    {
      type: "js",
      instruction: `### Proof 2 Visualized: The Three Similar Triangles

The altitude from the right angle to the hypotenuse creates three similar triangles. Click each triangle to highlight it and see which angles correspond. Drag the right-angle vertex to change the proportions.`,
      html: `<div style="padding:8px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;gap:8px" id="sim-btns"></div>
<canvas id="cv" width="700" height="300" style="cursor:move"></canvas>
<div id="sim-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
// Right angle at C, A and B on base
var A={x:80,y:250},B={x:580,y:250};
var Cy=90; // C height adjustable
var drag=false;

cv.addEventListener('mousedown',function(e){drag=true;});
cv.addEventListener('mouseup',function(){drag=false;});
cv.addEventListener('mousemove',function(e){
  if(!drag)return;
  var r=cv.getBoundingClientRect();
  // Move C horizontally only for simplicity
  var mx=(e.clientX-r.left)*(W/r.width);
  var my=(e.clientY-r.top)*(H/r.height);
  // snap C to be above AB
  var ab_y=250;
  var t=Math.max(0.2,Math.min(0.8,(mx-A.x)/(B.x-A.x)));
  Cy=Math.max(60,Math.min(200,my));
  // Keep C on a circle above AB (right angle condition is automatic for any C above AB)
  cFrac=t;
  draw();
});

var cFrac=0.38;
var selected=0;

var btnData=[
  {label:'△ABC (original)',color:'#1e3a5f'},
  {label:'△ACD (left)',color:'#1a3a2a'},
  {label:'△CBD (right)',color:'#dc2626'},
];
var btnContainer=document.getElementById('sim-btns');
var btns=[];
btnData.forEach(function(b,i){
  var btn=document.createElement('button');
  btn.textContent=b.label;
  btn.style.cssText='padding:5px 12px;border-radius:7px;border:1.5px solid '+b.color+';'+(i===0?'background:'+b.color+'22;color:'+b.color:'background:transparent;color:rgba(55,65,81,0.5)')+';font-family:Georgia,serif;font-size:12px;font-weight:700;cursor:pointer;';
  btn.onclick=function(){
    selected=i;
    btns.forEach(function(bx,j){
      bx.style.background=j===i?btnData[j].color+'22':'transparent';
      bx.style.color=j===i?btnData[j].color:'rgba(55,65,81,0.5)';
    });
    draw();
  };
  btnContainer.appendChild(btn);
  btns.push(btn);
});

function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  var Cx=A.x+(B.x-A.x)*cFrac,Cy2=Cy;
  var C={x:Cx,y:Cy2};

  // Foot of altitude from C to AB
  // AB is horizontal, so D is directly below C
  var D={x:Cx,y:A.y};

  // Angle computations
  function angD(v,p,q){var a=Math.atan2(p.y-v.y,p.x-v.x),b=Math.atan2(q.y-v.y,q.x-v.x);var d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;return Math.round(d*180/Math.PI);}
  var aA=angD(A,B,C),aB=angD(B,A,C),aC=angD(C,A,B);

  // Triangles
  var triangles=[
    {pts:[A,B,C],color:'#1e3a5f',fill:'rgba(30,58,95,0.08)',name:'△ABC'},
    {pts:[A,D,C],color:'#1a3a2a',fill:'rgba(26,58,42,0.15)',name:'△ACD'},
    {pts:[C,D,B],color:'#dc2626',fill:'rgba(220,38,38,0.15)',name:'△CBD'},
  ];

  // Draw all, highlight selected
  triangles.forEach(function(t,i){
    ctx.fillStyle=i===selected?t.fill:'rgba(0,0,0,0.03)';
    ctx.beginPath();ctx.moveTo(t.pts[0].x,t.pts[0].y);ctx.lineTo(t.pts[1].x,t.pts[1].y);ctx.lineTo(t.pts[2].x,t.pts[2].y);ctx.closePath();ctx.fill();
    ctx.strokeStyle=i===selected?t.color:'#d1d5db';
    ctx.lineWidth=i===selected?2.5:1;
    ctx.beginPath();ctx.moveTo(t.pts[0].x,t.pts[0].y);ctx.lineTo(t.pts[1].x,t.pts[1].y);ctx.lineTo(t.pts[2].x,t.pts[2].y);ctx.closePath();ctx.stroke();
  });

  // Altitude line
  ctx.strokeStyle='#9333ea';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(C.x,C.y);ctx.lineTo(D.x,D.y);ctx.stroke();ctx.setLineDash([]);
  // Right angle at D
  var sq=10;
  ctx.strokeStyle='#9333ea';ctx.lineWidth=1.5;
  ctx.strokeRect(D.x,D.y-sq,sq,sq);

  // Right angle at C
  ctx.strokeStyle='#374151';ctx.lineWidth=1.5;
  var cSq=10;
  var cA=Math.atan2(A.y-C.y,A.x-C.x),cB=Math.atan2(B.y-C.y,B.x-C.x);
  // Small square at C indicating right angle
  ctx.beginPath();
  var s1x=C.x+cSq*Math.cos(cA),s1y=C.y+cSq*Math.sin(cA);
  var s2x=C.x+cSq*Math.cos(cB),s2y=C.y+cSq*Math.sin(cB);
  var cornerX=s1x+(s2x-C.x),cornerY=s1y+(s2y-C.y);
  ctx.moveTo(s1x,s1y);ctx.lineTo(cornerX,cornerY);ctx.lineTo(s2x,s2y);
  ctx.strokeStyle='#374151';ctx.lineWidth=1.5;ctx.stroke();

  // Labels
  var pts=[{p:A,l:'A',ox:-14,oy:16},{p:B,l:'B',ox:14,oy:16},{p:C,l:'C',ox:0,oy:-14},{p:D,l:'D',ox:14,oy:16}];
  pts.forEach(function(v){
    ctx.beginPath();ctx.arc(v.p.x,v.p.y,5,0,2*Math.PI);ctx.fillStyle='#374151';ctx.fill();
    ctx.fillStyle='#374151';ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(v.l,v.p.x+v.ox,v.p.y+v.oy);
  });

  // Side labels
  function midLabel(p,q,label,color,off){
    var mx=(p.x+q.x)/2+(off||0),my=(p.y+q.y)/2-(off?0:12);
    ctx.fillStyle=color;ctx.font='italic 13px Georgia';ctx.textAlign='center';ctx.fillText(label,mx,my);
  }
  midLabel(A,C,'b','#1e3a5f',-10);
  midLabel(B,C,'a','#1a3a2a',10);
  midLabel(A,B,'c','#374151',0);
  midLabel(A,D,'AD','#9333ea',0);
  midLabel(D,B,'BD','#9333ea',0);

  // Info
  var simEl=document.getElementById('sim-info');
  var infos=[
    'All three triangles share angles ∠A, ∠B, and 90°. They are similar to each other.<br>'
    +'Equations from similar ratios: <strong>b² = c·AD</strong> (from △ACD ~ △ABC) and <strong>a² = c·BD</strong> (from △CBD ~ △ABC).<br>'
    +'Adding: a² + b² = c·BD + c·AD = c(AD+BD) = c·c = c². □',
    '△ACD ~ △ABC: ∠A is shared, ∠ADC = 90° = ∠ACB. Third angle must also match.<br>'
    +'Proportion: AC/AB = AD/AC, so AC² = AB·AD → <strong>b² = c·AD</strong>.',
    '△CBD ~ △ABC: ∠B is shared, ∠BDC = 90° = ∠ACB. Third angle must also match.<br>'
    +'Proportion: BC/AB = BD/BC, so BC² = AB·BD → <strong>a² = c·BD</strong>.',
  ];
  simEl.innerHTML='<strong style="color:'+btnData[selected].color+'">'+btnData[selected].label+':</strong> '+infos[selected];
}
draw();`,
      outputHeight: 440,
    },

    // ── Proof 3 — Algebraic ───────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### Proof 3: The Distance Formula (Algebraic)

This proof places the right triangle in a coordinate system and uses algebra to derive the theorem. It is the most modern of the three — it shows how Euclidean geometry and algebra unify.

**Setup:** Place the right angle at the origin. Let the legs lie along the positive x and y axes. Then the three vertices are:
- C = (0, 0) — the right angle
- A = (a, 0) — end of leg a along x-axis
- B = (0, b) — end of leg b along y-axis

The hypotenuse is segment AB, with length c.

**The distance formula** states that the distance between two points (x₁, y₁) and (x₂, y₂) is:
$$d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$$

Apply this to find the length of AB:
$$c = \sqrt{(a-0)^2 + (0-b)^2} = \sqrt{a^2 + b^2}$$

Squaring both sides:
$$c^2 = a^2 + b^2 \quad \square$$

But wait — where does the distance formula come from? It is derived by applying the Pythagorean Theorem to a right triangle formed by the horizontal and vertical differences between the two points. So this proof is circular if the distance formula was derived from Pythagoras!

The resolution: the distance formula can be derived independently from the coordinate axioms of analytic geometry without invoking the Pythagorean Theorem. When the foundations of coordinate geometry are laid properly, the derivation is valid. This is an important lesson about proof: you must know what you're allowed to assume.

This proof illustrates something powerful: algebra and geometry are not separate subjects. They are two languages for the same mathematical reality. The Pythagorean Theorem, expressed as a² + b² = c², is simultaneously a statement about areas (Proof 1), about similar triangles (Proof 2), and about distances in the coordinate plane (Proof 3).`,
    },

    // ── Visual 3 — All three proofs side by side ──────────────────────────────
    {
      type: "js",
      instruction: `### Three Proofs, One Theorem

Enter any values of a and b to verify the theorem. All three proof approaches are shown confirming the same result simultaneously.`,
      html: `<div style="padding:10px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;gap:16px;flex-wrap:wrap;align-items:center">
  <div style="display:flex;align-items:center;gap:8px">
    <span style="font-family:Georgia,serif;font-size:13px">a = <strong id="a-lbl">3</strong></span>
    <input type="range" id="a-sl" min="1" max="9" value="3" style="width:100px">
  </div>
  <div style="display:flex;align-items:center;gap:8px">
    <span style="font-family:Georgia,serif;font-size:13px">b = <strong id="b-lbl">4</strong></span>
    <input type="range" id="b-sl" min="1" max="9" value="4" style="width:100px">
  </div>
</div>
<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc)}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;
var aSl=document.getElementById('a-sl'),bSl=document.getElementById('b-sl');
var aLbl=document.getElementById('a-lbl'),bLbl=document.getElementById('b-lbl');

function draw(){
  var a=parseInt(aSl.value),b=parseInt(bSl.value);
  aLbl.textContent=a;bLbl.textContent=b;
  var c2=a*a+b*b,c=Math.sqrt(c2).toFixed(3);
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var panels=[
    {x:10,w:220,title:'Proof 1: Area',color:'#1e3a5f'},
    {x:240,w:220,title:'Proof 2: Similar △',color:'#1a3a2a'},
    {x:470,w:220,title:'Proof 3: Distance',color:'#7c3aed'},
  ];

  panels.forEach(function(p){
    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.roundRect(p.x,8,p.w,H-16,10);ctx.fill();
    ctx.strokeStyle=p.color+'44';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(p.x,8,p.w,H-16,10);ctx.stroke();
    ctx.fillStyle=p.color;ctx.font='bold 13px Georgia';ctx.textAlign='center';
    ctx.fillText(p.title,p.x+p.w/2,32);
  });

  var scale=18;

  // Panel 1: Draw the big square with inner c² square
  var p1=panels[0];var ox=p1.x+20,oy=50;
  var as=a*scale*0.7,bs=b*scale*0.7;var ss=as+bs;
  ctx.fillStyle='rgba(30,58,95,0.1)';
  ctx.beginPath();ctx.moveTo(ox+as,oy);ctx.lineTo(ox+ss,oy+as);ctx.lineTo(ox+ss-as,oy+ss);ctx.lineTo(ox,oy+ss-as);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(ox+as,oy);ctx.lineTo(ox+ss,oy+as);ctx.lineTo(ox+ss-as,oy+ss);ctx.lineTo(ox,oy+ss-as);ctx.closePath();ctx.stroke();
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=1.5;ctx.strokeRect(ox,oy,ss,ss);
  ctx.fillStyle='#dc2626';ctx.font='bold 14px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('c²='+c2,ox+ss/2,oy+ss/2);
  ctx.fillStyle='#1e3a5f';ctx.font='12px Georgia';ctx.textBaseline='alphabetic';
  ctx.fillText('a²+b²='+a*a+'+'+b*b+'='+c2,p1.x+p1.w/2,H-30);
  ctx.fillStyle='#1a3a2a';ctx.font='bold 13px Georgia';
  ctx.fillText('✓ c²=a²+b²='+c2,p1.x+p1.w/2,H-14);

  // Panel 2: Similar triangles diagram
  var p2=panels[1];var p2cx=p2.x+p2.w/2;
  var p2scale=14;
  var p2A={x:p2.x+15,y:H-50},p2B={x:p2.x+p2.w-15,y:H-50};
  var p2ab=p2B.x-p2A.x;
  // C above AB at angle proportional to a,b
  var frac=b*b/(a*a+b*b); // AD/c = b²/c²
  var p2D={x:p2A.x+p2ab*(b*b/(a*a+b*b)),y:H-50};
  var altH=a*b/Math.sqrt(a*a+b*b)*p2scale;
  var p2C={x:p2D.x,y:H-50-altH};

  // Triangle
  ctx.fillStyle='rgba(26,58,42,0.1)';
  ctx.beginPath();ctx.moveTo(p2A.x,p2A.y);ctx.lineTo(p2B.x,p2B.y);ctx.lineTo(p2C.x,p2C.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(p2A.x,p2A.y);ctx.lineTo(p2B.x,p2B.y);ctx.lineTo(p2C.x,p2C.y);ctx.closePath();ctx.stroke();
  // Altitude
  ctx.strokeStyle='#9333ea';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(p2C.x,p2C.y);ctx.lineTo(p2D.x,p2D.y);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#9333ea';ctx.lineWidth=1;ctx.strokeRect(p2D.x,p2D.y-8,8,8);

  ctx.fillStyle='#1a3a2a';ctx.font='11px Georgia';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('A',p2A.x-8,p2A.y+14);ctx.fillText('B',p2B.x+8,p2A.y+14);ctx.fillText('C',p2C.x,p2C.y-10);ctx.fillText('D',p2D.x+10,p2D.y+14);
  ctx.font='12px Georgia';
  ctx.fillText('b²=c·AD; a²=c·BD',p2cx,55);
  ctx.fillText('a²+b²=c(AD+BD)=c²',p2cx,70);
  ctx.fillStyle='#1a3a2a';ctx.font='bold 13px Georgia';
  ctx.fillText('✓ c²='+c2,p2cx,H-14);

  // Panel 3: Coordinate grid
  var p3=panels[2];var p3ox=p3.x+30,p3oy=H-55;
  var cscale=Math.min(14,160/Math.max(a,b));
  var p3A={x:p3ox+a*cscale,y:p3oy};var p3B={x:p3ox,y:p3oy-b*cscale};var p3C={x:p3ox,y:p3oy};

  // Axes
  ctx.strokeStyle='#d1d5db';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(p3.x+15,p3oy);ctx.lineTo(p3.x+p3.w-10,p3oy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(p3ox,H-20);ctx.lineTo(p3ox,50);ctx.stroke();

  // Triangle
  ctx.fillStyle='rgba(124,58,237,0.12)';
  ctx.beginPath();ctx.moveTo(p3A.x,p3A.y);ctx.lineTo(p3B.x,p3B.y);ctx.lineTo(p3C.x,p3C.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#7c3aed';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(p3A.x,p3A.y);ctx.lineTo(p3B.x,p3B.y);ctx.lineTo(p3C.x,p3C.y);ctx.closePath();ctx.stroke();

  // Right angle marker
  ctx.strokeStyle='#374151';ctx.lineWidth=1;ctx.strokeRect(p3ox,p3oy-10,10,10);

  // Labels
  ctx.fillStyle='#7c3aed';ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText('('+a+',0)',p3A.x,p3A.y+14);ctx.fillText('(0,'+b+')',p3B.x-22,p3B.y);ctx.fillText('(0,0)',p3ox-16,p3oy+14);
  ctx.font='italic 12px Georgia';
  ctx.fillText('a='+a,p3ox+a*cscale/2,p3oy+12);ctx.fillText('b='+b,p3ox-16,p3oy-b*cscale/2);
  // Hypotenuse label
  ctx.fillStyle='#7c3aed';ctx.font='12px Georgia';
  ctx.fillText('c=√(a²+b²)='+c,(p3A.x+p3B.x)/2+16,(p3A.y+p3B.y)/2-6);
  ctx.font='12px Georgia';ctx.textAlign='center';
  ctx.fillText('d=√('+a+'²+'+b+'²)=√'+c2+'='+c,p3.x+p3.w/2,55);
  ctx.fillStyle='#7c3aed';ctx.font='bold 13px Georgia';
  ctx.fillText('✓ c²='+c2,p3.x+p3.w/2,H-14);
}
aSl.oninput=draw;bSl.oninput=draw;
draw();`,
      outputHeight: 320,
    },

    {
      type: "markdown",
      instruction: `### What Three Proofs Reveal

The three proofs do not just confirm the same fact three times. They illuminate different aspects of the theorem and different proof techniques.

**Proof 1 (Area)** shows that the theorem is fundamentally about *area conservation*. The same four triangles rearrange to leave different regions — and those regions must have equal area. This proof requires no algebra and no angles — only the fact that area is conserved when you rearrange shapes. It is visually intuitive and the most ancient.

**Proof 2 (Similar Triangles)** reveals a profound *self-similarity*: every right triangle contains two smaller copies of itself. The proof works by chasing the proportions created by this self-similarity. It shows why the theorem is really a statement about ratios — the foundation of trigonometry.

**Proof 3 (Algebra/Distance)** shows that the Pythagorean Theorem is the *definition of distance* in the coordinate plane. The distance formula IS the Pythagorean Theorem, written for arbitrary points. This is why the theorem is so central to physics, computer graphics, and data science: Euclidean distance in any number of dimensions is always computed by this same formula.

Each proof is also a template. The dissection technique (Proof 1) is used throughout combinatorics and probability. The similar-triangles technique (Proof 2) is the foundation of trigonometry and the basis for every compass-and-straightedge construction. The algebraic technique (Proof 3) is the basis for analytic geometry.

Learning three proofs of one theorem gives you three proof tools for free.`,
    },

    {
      type: "challenge",
      instruction: `A right triangle has legs of length 5 and 12. Without a calculator, what is the exact length of the hypotenuse? What integer values make a right triangle (a Pythagorean triple)?`,
      options: [
        {
          label: "A",
          text: "c = 13. Pythagorean triple: (5, 12, 13) since 25 + 144 = 169 = 13².",
        },
        {
          label: "B",
          text: "c = 17. Pythagorean triple: (5, 12, 17) since 5 + 12 = 17.",
        },
        {
          label: "C",
          text: "c = √169 = 13. The triple is (5, 12, 13). Note: not all triples are multiples of (3,4,5).",
        },
        {
          label: "D",
          text: "c = √119 ≈ 10.9. There is no integer hypotenuse.",
        },
      ],
      check: (label) => label === "A",
      successMessage:
        "Correct. c² = 5² + 12² = 25 + 144 = 169 = 13². So c = 13 exactly. (5, 12, 13) is a Pythagorean triple — three positive integers satisfying a² + b² = c². The most famous is (3, 4, 5). Others include (8, 15, 17) and (7, 24, 25). Any multiple of a triple is also a triple: (6, 8, 10), (9, 12, 15), etc.",
      failMessage:
        "Apply the Pythagorean Theorem: c² = a² + b² = 5² + 12² = 25 + 144 = 169. Then c = √169 = 13 exactly. (5, 12, 13) is a Pythagorean triple — a set of positive integers satisfying a² + b² = c². You can verify: 25 + 144 = 169 ✓.",
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },

    {
      type: "challenge",
      instruction: `In Proof 2 (the similar triangles proof), the altitude CD is drawn from the right angle C to the hypotenuse AB. Why must △ACD be similar to △ABC — what specific angle relationship justifies it?`,
      options: [
        {
          label: "A",
          text: "Both triangles have a right angle at D and C respectively, and they share angle A. Two pairs of equal angles are sufficient to prove similarity (AA).",
        },
        { label: "B", text: "Both triangles have the same perimeter." },
        { label: "C", text: "Both triangles have equal hypotenuses." },
        {
          label: "D",
          text: "The altitude bisects the right angle at C, creating equal angles in both triangles.",
        },
      ],
      check: (label) => label === "A",
      successMessage:
        "Correct. △ACD has: ∠ADC = 90° (altitude is perpendicular to hypotenuse) and ∠A is shared with △ABC. By AA similarity (two pairs of equal angles), △ACD ~ △ABC. This is why similarity can be established without measuring sides — two angles determine the shape of a triangle completely (since the third angle is forced by the 180° sum).",
      failMessage:
        "The key is AA similarity: two pairs of equal angles are sufficient to prove triangles similar. △ACD shares ∠A with △ABC, and ∠ADC = 90° = ∠ACB. So two angles match, and by the Triangle Angle Sum, the third must also match. Equal perimeters and equal hypotenuses are not criteria for similarity.",
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },
  ],
};

export default {
  id: "geo-1-7",
  slug: "pythagorean-theorem",
  chapter: "geometry-1",
  order: 7,
  title: "The Pythagorean Theorem: Three Proofs",
  subtitle:
    "Why the most famous theorem in mathematics has been proved over 370 times — and what each approach reveals.",
  tags: [
    "geometry",
    "pythagoras",
    "pythagorean-theorem",
    "similar-triangles",
    "area",
    "distance-formula",
    "proofs",
  ],
  hook: {
    question: "Why would you prove the same theorem three different ways?",
    realWorldContext:
      "Each proof of the Pythagorean Theorem reveals a different mathematical structure: area conservation (Proof 1), self-similar ratios (Proof 2), and the nature of distance in coordinate space (Proof 3). The theorem is the same; the understanding is three times deeper.",
    previewVisualizationId: "G1_6_Pythagorean",
  },
  intuition: {
    blocks: [
      { type: 'prose', md: 'In any right triangle with legs **a** and **b** and hypotenuse **c**: **a² + b² = c²**. The theorem has been proved over 370 ways — each proof reveals different mathematics. Three are essential: area dissection (ancient, visual), similar triangles (the key to trigonometry), and the distance formula (the bridge to coordinate geometry).' },
      { type: 'image', src: geoPythagoreanProofUrl, alt: 'Area dissection proof: two arrangements of four triangles in the same square', caption: 'Proof 1: the same (a+b)² square filled two ways with the same four triangles. The remaining areas must be equal: c² = a² + b².' },
      { type: 'prose', md: 'The **distance formula** — the Pythagorean Theorem in coordinate form — gives the distance between any two points. Place legs along the x and y axes: the hypotenuse length c = √(a² + b²), so c² = a² + b². This is why Euclidean distance in any dimension always uses this formula.' },
      { type: 'image', src: distanceFormulaUrl, alt: 'The distance formula as the Pythagorean theorem on a coordinate grid', caption: 'The distance formula is the Pythagorean Theorem expressed algebraically. The legs Δx and Δy are the horizontal and vertical separations; d is the hypotenuse.' },
      { type: 'callout', kind: 'definition', title: 'Pythagorean Triple', body: 'Three positive integers a, b, c satisfying a²+b²=c². Key triples: (3,4,5), (5,12,13), (8,15,17). Any multiple of a triple is also a triple: (6,8,10), (9,12,15). Carpenters use the 3-4-5 triple to verify right angles.' },
      { type: 'viz', id: 'ScienceNotebook', props: { lesson: LESSON_GEO_1_7 }, mathBridge: 'Work through all three proofs interactively. Toggle between the two triangle arrangements in Proof 1, explore the three similar triangles created by the altitude in Proof 2, and verify the distance formula in Proof 3.' },
      { type: 'viz', id: 'G1_6_Pythagorean', title: 'Three Independent Proofs of Pythagoras' },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    "a² + b² = c² in any right triangle. Legs a, b; hypotenuse c (opposite right angle).",
    "Proof 1: area dissection — same triangles, two arrangements, equal empty area.",
    "Proof 2: altitude to hypotenuse → three similar triangles → ratio equations add to a²+b²=c².",
    "Proof 3: coordinates → distance formula → squaring gives a²+b²=c².",
    "Converse: if a²+b²=c², the triangle has a right angle opposite side c.",
  ],
  checkpoints: ["read-intuition"],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      diagram: quizPythagFindCUrl,
      diagramAlt: 'Right triangle with legs 6 and 8, hypotenuse labeled x. Right angle at A.',
      text: 'Find the hypotenuse x.',
      options: ['14', '10', '√100'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What does the area-dissection proof show?',
      options: [
        'The perimeters of the two leg-squares sum to the hypotenuse-square perimeter',
        'Four identical triangles fill the same outer square two ways, leaving areas c² or a²+b² — so they must be equal',
        'Area of the triangle equals half the hypotenuse',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A triangle has sides 5, 12, 13. Is it a right triangle?',
      options: [
        'No — 5+12 ≠ 13',
        'Yes — 5² + 12² = 169 = 13², so by the converse it has a right angle',
        'Cannot tell without measuring the angles',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The distance formula d = √((x₂−x₁)² + (y₂−y₁)²) is a version of:',
      options: [
        'The midpoint formula',
        'The Pythagorean Theorem — Δx and Δy are the legs, d is the hypotenuse',
        'The slope formula',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      diagram: quizPythagFindLegUrl,
      diagramAlt: 'Right triangle with one leg = 5, hypotenuse = 13, and the other leg labeled x.',
      text: 'Find leg x. (Hypotenuse = 13, one leg = 5.)',
      options: ['12', '8', '√144'],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'Which set of numbers is a Pythagorean triple?',
      options: ['(4, 5, 6)', '(8, 15, 17)', '(6, 7, 9)'],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Find the distance between points (1, 1) and (4, 5).',
      options: ['5', '6', '√34'],
      correct: 0,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'In the similar-triangles proof, the altitude from the right angle to the hypotenuse creates:',
      options: [
        'Two triangles, each with a right angle and one shared angle with the original — proving similarity by AA',
        'Two congruent triangles by HL',
        'A new triangle that is equilateral',
      ],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'The Converse of the Pythagorean Theorem states: if a² + b² = c², then the triangle:',
      options: [
        'Is equilateral',
        'Has a right angle opposite side c',
        'Is isosceles',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A carpenter uses a triangle with sides 6, 8, 10 to check for right angles. This works because:',
      options: [
        '6+8+10 = 24, a multiple of 6',
        '(6,8,10) is a multiple of (3,4,5), a Pythagorean triple: 6²+8²=36+64=100=10²',
        'The angles happen to be 45-45-90',
      ],
      correct: 1,
    },
  ],
};
export { LESSON_GEO_1_7 };
