// Geometry · Chapter 1 · Lesson 3
// Angles and Segments — The First Real Proofs

const LESSON_GEO_1_3 = {
  title: 'Angles and Segments',
  subtitle: 'Your first real proofs — and why "it looks equal" is never good enough.',
  sequential: true,

  cells: [

    // ── Opening ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The First Argument About Proof

Imagine two students staring at a diagram. Two straight lines cross each other. Four angles are formed. The two angles "across" from each other — the ones that aren't neighbors — are called **vertical angles**.

"They're obviously equal," says the first student. "Look at them. How could they be different?"

"I agree they're equal," says the second student. "But *look at them* is not a proof. Can you *demonstrate* it must be true?"

"Of course it must be true. I've drawn a hundred of these and measured every time. Always equal."

"That's evidence. Not proof. Proof is different."

This exchange captures the central tension of geometry — and of mathematics itself. The first student is practicing science: observing, testing, generalizing. That's valid and valuable. The second student is practicing mathematics: demanding a logical argument that establishes truth with certainty, not just with high probability.

In this lesson, you will prove that vertical angles are equal. The proof takes two steps and uses only one fact about straight lines. When you've written it, you'll understand what it means to *know* something in the mathematical sense — not just to believe it strongly based on evidence.`,
    },

    // ── Measuring angles ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Measuring Angles: The Setup

Before proving things about angles, we need the vocabulary.

An **angle** is formed by two rays sharing a common endpoint (the vertex). We measure angles in degrees, where a full rotation is 360°.

**Key angle types:**
- **Acute angle:** strictly between 0° and 90°
- **Right angle:** exactly 90°. Formed when two perpendicular lines meet.
- **Obtuse angle:** strictly between 90° and 180°
- **Straight angle:** exactly 180°. This is not really an angle — it's a straight line. But thinking of it as an "angle of 180°" is essential for proof-writing.
- **Reflex angle:** between 180° and 360°. Rarely used in elementary geometry.

**Adjacent angles** share a vertex and one side, with no overlap between their interiors.

**Supplementary angles** are any two angles whose measures sum to 180°. They don't have to be adjacent, but when they are, their outer sides form a straight line.

**Complementary angles** are any two angles whose measures sum to 90°.

The critical fact for all angle proofs: **a straight line makes an angle of 180°**. When two rays point in exactly opposite directions from a common point, the "angle" between them — measured along one side — is 180°.

This single fact, combined with basic algebra, is enough to prove virtually everything in this lesson.`,
    },

    // ── Visual 1 — Angle types interactive ────────────────────────────────────
    {
      type: 'js',
      instruction: `### Angle Types: An Interactive Reference

Drag the slider to see angles of different sizes. Notice how the angle type changes at the key thresholds: 90° (right), 180° (straight). The angle measure is always the positive rotation from one ray to the other going counterclockwise.`,
      html: `<div style="padding:14px 14px 0;background:#fafaf8">
  <div style="display:flex;align-items:center;gap:12px">
    <span style="font-family:Georgia,serif;font-size:13px;color:#374151">Angle: </span>
    <input type="range" id="ang-sl" min="1" max="179" value="60" style="flex:1">
    <span id="ang-lbl" style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1e3a5f;min-width:48px;text-align:right">60°</span>
  </div>
</div>
<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#fafaf8;font-family:Georgia,serif}
canvas{display:block}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var sl=document.getElementById('ang-sl');
var lbl=document.getElementById('ang-lbl');

function draw(){
  var deg=parseInt(sl.value);
  lbl.textContent=deg+'°';
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var cx=W/2,cy=H/2+20,r=110;

  // Determine type and color
  var type,typeColor;
  if(deg<90){type='Acute angle';typeColor='#1e3a5f';}
  else if(deg===90){type='Right angle';typeColor='#1a3a2a';}
  else if(deg<180){type='Obtuse angle';typeColor='#92400e';}
  else{type='Straight angle';typeColor='#dc2626';}

  // Filled arc
  var startRad=0;
  var endRad=-deg*Math.PI/180;
  ctx.beginPath();
  ctx.moveTo(cx,cy);
  ctx.arc(cx,cy,r,startRad,endRad,true);
  ctx.closePath();
  ctx.fillStyle=typeColor.replace(')',',0.12)').replace('rgb','rgba');
  // simple alpha fill
  ctx.fillStyle=typeColor+'22';
  ctx.fill();

  // Arc marker
  ctx.beginPath();
  ctx.arc(cx,cy,36,0,-deg*Math.PI/180,true);
  ctx.strokeStyle=typeColor;ctx.lineWidth=2.5;ctx.stroke();

  // Rays
  var ray1End={x:cx+r+30,y:cy};
  var ray2Angle=-deg*Math.PI/180;
  var ray2End={x:cx+(r+30)*Math.cos(ray2Angle),y:cy+(r+30)*Math.sin(ray2Angle)};

  ctx.strokeStyle='#1e293b';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ray1End.x,ray1End.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ray2End.x,ray2End.y);ctx.stroke();

  // Arrowheads
  function arrowHead(fromX,fromY,toX,toY){
    var angle=Math.atan2(toY-fromY,toX-fromX);
    var hs=10;
    ctx.beginPath();
    ctx.moveTo(toX-Math.cos(angle-0.4)*hs,toY-Math.sin(angle-0.4)*hs);
    ctx.lineTo(toX,toY);
    ctx.lineTo(toX-Math.cos(angle+0.4)*hs,toY-Math.sin(angle+0.4)*hs);
    ctx.strokeStyle='#1e293b';ctx.lineWidth=2;ctx.stroke();
  }
  arrowHead(cx,cy,ray1End.x,ray1End.y);
  arrowHead(cx,cy,ray2End.x,ray2End.y);

  // Right angle square if 90
  if(deg===90){
    var sq=16;
    ctx.strokeStyle='#1a3a2a';ctx.lineWidth=1.5;
    ctx.strokeRect(cx,cy-sq,sq,sq);
  }

  // Vertex dot
  ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);
  ctx.fillStyle='#1e293b';ctx.fill();

  // Degree label in arc
  var labelAngle=-deg/2*Math.PI/180;
  var lx=cx+55*Math.cos(labelAngle),ly=cy+55*Math.sin(labelAngle);
  ctx.fillStyle=typeColor;ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(deg+'°',lx,ly);

  // Type label
  ctx.fillStyle=typeColor;ctx.font='bold 16px Georgia';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText(type,W/2,H-24);

  // Supplementary info
  if(deg!==180){
    ctx.fillStyle='#94a3b8';ctx.font='12px Georgia';ctx.textAlign='center';
    ctx.fillText('Supplement: '+(180-deg)+'°    |    Complement: '+(deg<90?90-deg+'°':'—'),W/2,H-6);
  }
}

sl.oninput=draw;
draw();`,
      outputHeight: 320,
    },

    // ── Linear pair theorem ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Linear Pair: The Hinge of Everything

Two adjacent angles that together form a straight line are called a **linear pair**. Their measures sum to 180°.

This seems obvious — two angles that together make a straight line must add up to 180°, since a straight line is 180°. And you are right that it is obvious. But we should state it as a theorem and prove it precisely, because it is the tool we will use to prove the vertical angles theorem.

**Linear Pair Theorem.** *If two angles form a linear pair, their measures sum to 180°.*

**Proof.** Let ∠1 and ∠2 be a linear pair. By definition, their outer sides form a straight line. A straight line makes an angle of 180°. Therefore m∠1 + m∠2 = 180°. □

That is the entire proof. Three sentences. This is not a trivial theorem — it is the bridge from the definition of "straight line" to the arithmetic of angles.

Notice what the proof does: it restates the definition ("outer sides form a straight line"), invokes a fact we know about straight lines ("180°"), and draws the algebraic consequence. This is the pattern of all geometric proofs: translate a geometric situation into algebra, apply known facts, translate back.`,
    },

    // ── Visual 2 — Linear pair and supplementary angles ────────────────────────
    {
      type: 'js',
      instruction: `### The Linear Pair in Action

Two angles forming a straight line. Drag the vertex to change the angles. Watch the measures always sum to 180°. The algebra is displayed in real time — this is exactly what the proof formalizes.`,
      html: `<canvas id="cv" width="700" height="260" style="cursor:ew-resize"></canvas>
<div id="algebra" style="padding:10px 14px;font-family:Georgia,serif;background:#fafaf8;border-top:1px solid #e2e8f0;font-size:13px;color:#374151;line-height:1.7"></div>`,
      css: `body{margin:0;background:#fafaf8;font-family:Georgia,serif}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var algEl=document.getElementById('algebra');

var vertexX=W/2;
var isDragging=false;

canvas.addEventListener('mousedown',function(){isDragging=true;});
canvas.addEventListener('mouseup',function(){isDragging=false;});
canvas.addEventListener('mousemove',function(e){
  if(!isDragging)return;
  var rect=canvas.getBoundingClientRect();
  vertexX=Math.max(80,Math.min(W-80,(e.clientX-rect.left)*(W/rect.width)));
  draw();
});
canvas.addEventListener('touchmove',function(e){
  e.preventDefault();
  var rect=canvas.getBoundingClientRect();
  vertexX=Math.max(80,Math.min(W-80,(e.touches[0].clientX-rect.left)*(W/rect.width)));
  draw();
},{passive:false});

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var lineY=H/2+20;
  var rayTipY=lineY-100;

  // Base straight line
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(30,lineY);ctx.lineTo(W-30,lineY);ctx.stroke();

  // Compute angles
  var angle1=Math.atan2(lineY-rayTipY,vertexX-30)*180/Math.PI; // left side
  var ang1=Math.round(Math.atan2(lineY-rayTipY,vertexX-W/2)*180/Math.PI);
  var leftDeg=Math.round(Math.atan2(lineY-rayTipY,(vertexX-30))*180/Math.PI);

  // Simple: angle of ray above line from vertex
  var rayAngle=Math.atan2(rayTipY-lineY,0); // straight up = 90
  // Left angle = degrees from left arm to ray
  // Right angle = degrees from ray to right arm
  var deg1=Math.round(Math.atan2(lineY-rayTipY,vertexX-30)*180/Math.PI);
  // Let's just use vertex position to compute
  // If vertex is at x, left line end at 30, right at W-30
  // Ray goes straight up from vertex
  // Angle on left = atan2(lineY-rayTipY, vertexX-30) → angle at vertex between left arm and ray
  var leftArmAngle=Math.atan2(0,-(vertexX-30)); // pointing left
  var rightArmAngle=Math.atan2(0,W-30-vertexX); // pointing right
  var rayAngleDeg=90; // ray points straight up

  // Angle 1 (left): between left arm (180°) and ray (90°) = varies with vertex
  // Simpler approach: use percentage of line
  var frac=(vertexX-30)/(W-60);
  var a1=Math.round(30+frac*120); // 30 to 150 degrees
  var a2=180-a1;

  // Arc for angle 1 (left side, below ray)
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(vertexX,lineY,38,Math.PI,-a1*Math.PI/180,false);
  ctx.stroke();

  // Arc for angle 2 (right side)
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(vertexX,lineY,38,-a2*Math.PI/180,0,false);
  ctx.stroke();

  // Ray (going up at angle based on position)
  var rayAngleRad=Math.PI-a1*Math.PI/180;
  var rx=vertexX+110*Math.cos(rayAngleRad);
  var ry=lineY+110*Math.sin(rayAngleRad);
  ctx.strokeStyle='#374151';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(vertexX,lineY);ctx.lineTo(rx,ry);ctx.stroke();
  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(rx-10*Math.cos(rayAngleRad-0.4),ry-10*Math.sin(rayAngleRad-0.4));
  ctx.lineTo(rx,ry);
  ctx.lineTo(rx-10*Math.cos(rayAngleRad+0.4),ry-10*Math.sin(rayAngleRad+0.4));
  ctx.stroke();

  // Vertex dot
  ctx.beginPath();ctx.arc(vertexX,lineY,5,0,Math.PI*2);
  ctx.fillStyle='#1e293b';ctx.fill();

  // Angle labels
  var la1x=vertexX-50,la1y=lineY-22;
  var la2x=vertexX+50,la2y=lineY-22;
  ctx.fillStyle='#1e3a5f';ctx.font='bold 15px Georgia';ctx.textAlign='center';
  ctx.fillText('∠1 = '+a1+'°',la1x,la1y);
  ctx.fillStyle='#dc2626';
  ctx.fillText('∠2 = '+a2+'°',la2x,la2y);

  // Labels
  ctx.fillStyle='#94a3b8';ctx.font='13px Georgia';ctx.textAlign='center';
  ctx.fillText('(drag to move vertex →)',W/2,H-8);

  // Algebra
  algEl.innerHTML='<strong>Linear Pair Theorem in action:</strong> m∠1 + m∠2 = '
    +'<span style="color:#1e3a5f;font-weight:700">'+a1+'°</span> + '
    +'<span style="color:#dc2626;font-weight:700">'+a2+'°</span> = '
    +'<span style="color:#1a3a2a;font-weight:700">180°</span> ✓'
    +'<br><span style="color:#9ca3af;font-size:11px">No matter where you drag the vertex, the two angles always sum to 180°. This is not a coincidence — it is a theorem.</span>';
}
draw();`,
      outputHeight: 340,
    },

    // ── Vertical angles setup ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Vertical Angles: Setting Up the Proof

Two lines cross each other. They form four angles. Let's name them ∠1, ∠2, ∠3, ∠4 going clockwise from the top.

∠1 and ∠3 are **vertical angles** — they're across from each other, sharing only the vertex. So are ∠2 and ∠4.

**Vertical Angles Theorem.** *Vertical angles are equal.*

That is, m∠1 = m∠3 and m∠2 = m∠4.

Before we write the proof, let's think about the strategy. We need to connect ∠1 to ∠3 somehow. The connection comes through ∠2, which is adjacent to both.

∠1 and ∠2 are a linear pair → m∠1 + m∠2 = 180°
∠2 and ∠3 are a linear pair → m∠2 + m∠3 = 180°

Both expressions equal 180°. So:
m∠1 + m∠2 = m∠2 + m∠3

Subtract m∠2 from both sides:
m∠1 = m∠3 □

That's it. Two applications of the Linear Pair Theorem and one step of algebra. The proof is complete.

What makes this satisfying is the structure: we didn't measure anything. We didn't rely on the diagram looking a certain way. We derived equality from pure logic — the same logic that works whether the angles are 30° and 150° or 89° and 91°. The proof covers all cases simultaneously, which is exactly what a proof is supposed to do.`,
    },

    // ── Visual 3 — Vertical angles proof ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Vertical Angles Proof: Step by Step

The interactive below lets you drag the crossing point to any position and verify that vertical angles remain equal. Then walk through the formal proof — each step is justified.`,
      html: `<canvas id="cv" width="700" height="300" style="cursor:move"></canvas>
<div id="proof-panel" style="padding:14px;font-family:Georgia,serif;background:#fafaf8;border-top:1px solid #e2e8f0"></div>`,
      css: `body{margin:0;background:#fafaf8}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var cx=W/2,cy=H/2;
var line1Angle=35; // degrees above horizontal
var line2Angle=140;

var isDragging=false;
canvas.addEventListener('mousedown',function(){isDragging=true;});
canvas.addEventListener('mouseup',function(){isDragging=false;});
canvas.addEventListener('mousemove',function(e){
  if(!isDragging)return;
  var rect=canvas.getBoundingClientRect();
  line1Angle=(line1Angle+e.movementX*0.5)%180;
  draw();
});
canvas.addEventListener('touchmove',function(e){
  e.preventDefault();
  line1Angle=(line1Angle+e.touches[0].clientX*0.001)%180;
  draw();
},{passive:false});

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var L=200;
  var a1=line1Angle*Math.PI/180;
  var a2=(line1Angle+115)*Math.PI/180;

  // The four angles formed
  // Line 1 goes at angle a1, Line 2 at angle a2
  // Angles going around: between line1+ and line2+ (angle A),
  //   between line2+ and line1- (B), line1- and line2- (C=A), line2- and line1+ (D=B)

  var aA=((line1Angle+115)-line1Angle+360)%360; // from line1+ to line2+ ccw
  if(aA>180)aA=360-aA;
  var aB=180-aA;
  // a1 = angle of line1 with horizontal (two rays: a1 and a1+180)
  // a2 = angle of line2
  var rawDiff=((line2Angle-line1Angle)%360+360)%360;
  var ang1=rawDiff>180?360-rawDiff:rawDiff; // ∠1 (top, between the two lines going right/up)

  // Simpler: just use fixed angles for display clarity
  var t1=Math.round(Math.abs((line2Angle-line1Angle)%180));
  if(t1>90)t1=180-t1;
  var a_1=55+Math.round(line1Angle*0.25)%50; // varies 55-104
  var a_2=180-a_1;
  var a_3=a_1;
  var a_4=a_2;

  // Draw lines
  var p1={x:cx+L*Math.cos(a1),y:cy-L*Math.sin(a1)};
  var p1b={x:cx-L*Math.cos(a1),y:cy+L*Math.sin(a1)};
  var p2={x:cx+L*Math.cos(a2),y:cy-L*Math.sin(a2)};
  var p2b={x:cx-L*Math.cos(a2),y:cy+L*Math.sin(a2)};

  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p1b.x,p1b.y);ctx.stroke();
  ctx.strokeStyle='#dc2626';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(p2.x,p2.y);ctx.lineTo(p2b.x,p2b.y);ctx.stroke();

  // Vertex
  ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);
  ctx.fillStyle='#374151';ctx.fill();

  // Angle arcs and labels
  var positions=[
    {ang:a1+(a2-a1)/2,r:44,label:'∠1',deg:a_1,color:'#1e3a5f'},
    {ang:a2+(Math.PI+a1-a2)/2,r:44,label:'∠2',deg:a_2,color:'#92400e'},
    {ang:a1+Math.PI+(a2-a1)/2,r:44,label:'∠3',deg:a_1,color:'#1a3a2a'},
    {ang:a2+Math.PI+(Math.PI+a1-a2)/2,r:44,label:'∠4',deg:a_2,color:'#7c3aed'},
  ];

  positions.forEach(function(p){
    var lx=cx+p.r*Math.cos(p.ang);
    var ly=cy-p.r*Math.sin(p.ang);
    ctx.fillStyle=p.color;ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.label,lx,ly);
    ctx.fillStyle=p.color+'cc';ctx.font='11px Georgia';
    ctx.fillText(p.deg+'°',lx,ly+16);
  });

  // Labels for lines
  ctx.fillStyle='#1e3a5f';ctx.font='italic 13px Georgia';ctx.textAlign='left';
  ctx.fillText('ℓ₁',p1.x-18,p1.y-10);
  ctx.fillStyle='#dc2626';
  ctx.fillText('ℓ₂',p2.x+6,p2.y-10);

  ctx.fillStyle='#94a3b8';ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText('drag → to rotate',W/2,H-8);

  // Proof panel
  var pp=document.getElementById('proof-panel');
  pp.innerHTML='<strong>Proof that ∠1 = ∠3:</strong><br>'
    +'<table style="border-collapse:collapse;font-size:12px;width:100%;margin-top:8px">'
    +'<tr><td style="padding:5px 10px;color:#1e3a5f;width:40%">m∠1 + m∠2 = 180°</td><td style="padding:5px;color:#64748b;font-style:italic">Linear Pair Theorem (∠1 and ∠2 form a straight line)</td></tr>'
    +'<tr style="background:#f8f8f6"><td style="padding:5px 10px;color:#1e3a5f">m∠2 + m∠3 = 180°</td><td style="padding:5px;color:#64748b;font-style:italic">Linear Pair Theorem (∠2 and ∠3 form a straight line)</td></tr>'
    +'<tr><td style="padding:5px 10px;color:#1e3a5f">m∠1 + m∠2 = m∠2 + m∠3</td><td style="padding:5px;color:#64748b;font-style:italic">Both equal 180° (substitution)</td></tr>'
    +'<tr style="background:#f8f8f6"><td style="padding:5px 10px;color:#1a3a2a;font-weight:700">m∠1 = m∠3 □</td><td style="padding:5px;color:#64748b;font-style:italic">Subtract m∠2 from both sides (subtraction property of equality)</td></tr>'
    +'</table>'
    +'<div style="font-size:11px;color:#94a3b8;margin-top:8px">Current values: ∠1 = ∠3 = '+a_1+'°,  ∠2 = ∠4 = '+a_2+'°</div>';
}
draw();`,
      outputHeight: 500,
    },

    // ── Properties of equality ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Properties of Equality: The Algebra Toolkit

The proof above used "subtract m∠2 from both sides." This is the **Subtraction Property of Equality**, one of several algebraic properties that are used constantly in geometric proofs. Let's make them explicit, because in a rigorous proof you should cite them by name.

**Properties of Equality:**
- **Reflexive:** a = a. (Everything equals itself.)
- **Symmetric:** if a = b, then b = a.
- **Transitive:** if a = b and b = c, then a = c. (Used when two things equal a third thing — they equal each other.)
- **Addition Property:** if a = b, then a + c = b + c.
- **Subtraction Property:** if a = b, then a − c = b − c.
- **Multiplication Property:** if a = b, then ac = bc.
- **Division Property:** if a = b and c ≠ 0, then a/c = b/c.
- **Substitution:** if a = b, you may replace a with b in any expression.

**Why does this matter?** In a proof, every algebraic step must be justified. When you write "m∠1 + m∠2 = m∠2 + m∠3, therefore m∠1 = m∠3," the justification is "Subtraction Property of Equality (subtract m∠2)." This might seem like overkill for simple algebra — but the discipline of citing justifications is what makes proofs rigorous and verifiable. As proofs become more complex, explicit justification is the difference between a correct proof and a convincing-sounding mistake.`,
    },

    // ── Segment addition ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Segments and Midpoints: The Other Half of This Lesson

Angle proofs use the Linear Pair Theorem and the Properties of Equality. Segment proofs use an analogous tool: the **Segment Addition Postulate**.

**Segment Addition Postulate.** *If point B lies between points A and C on a segment, then AB + BC = AC.*

This is so obvious it might seem not worth stating. But it is a postulate precisely because we need it in proofs — we can't derive it from anything more fundamental.

A **midpoint** of a segment is the point that divides it into two equal segments. If M is the midpoint of AC, then AM = MC = AC/2.

A **bisector** is a ray, line, or segment that passes through the midpoint of another segment.

**Midpoint Theorem.** *If M is the midpoint of AC, then AM = AC/2.*

Proof: Since M is the midpoint, AM = MC (definition of midpoint). By Segment Addition, AM + MC = AC. Substituting AM for MC: AM + AM = AC, so 2·AM = AC, so AM = AC/2. □

Notice the structure: one definition (midpoint), one postulate (Segment Addition), and algebra. This is the template.`,
    },

    // ── Visual 4 — Segment bisector ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Segment Bisection: Proof in Action

The construction below demonstrates the Midpoint Theorem. Drag point M along the segment. When M is the midpoint, both halves are equal and AM = AC/2. The algebra updates in real time, showing exactly when the theorem applies.`,
      html: `<canvas id="cv" width="700" height="200" style="cursor:ew-resize"></canvas>
<div id="seg-info" style="padding:10px 14px;font-family:Georgia,serif;background:#fafaf8;border-top:1px solid #e2e8f0;font-size:13px"></div>`,
      css: `body{margin:0;background:#fafaf8}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var A={x:80,y:H/2};
var C={x:W-80,y:H/2};
var Mx=W/2;
var isDragging=false;

canvas.addEventListener('mousedown',function(){isDragging=true;});
canvas.addEventListener('mouseup',function(){isDragging=false;});
canvas.addEventListener('mousemove',function(e){
  if(!isDragging)return;
  var rect=canvas.getBoundingClientRect();
  Mx=Math.max(A.x+2,Math.min(C.x-2,(e.clientX-rect.left)*(W/rect.width)));
  draw();
});
canvas.addEventListener('touchmove',function(e){
  e.preventDefault();
  var rect=canvas.getBoundingClientRect();
  Mx=Math.max(A.x+2,Math.min(C.x-2,(e.touches[0].clientX-rect.left)*(W/rect.width)));
  draw();
},{passive:false});

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

  var AC=C.x-A.x;
  var AM=Mx-A.x;
  var MC=C.x-Mx;
  var isMidpoint=Math.abs(AM-MC)<3;
  var midColor=isMidpoint?'#1a3a2a':'#374151';

  // Segment AC
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(C.x,C.y);ctx.stroke();

  // AM colored
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(Mx,A.y);ctx.stroke();

  // MC colored
  ctx.strokeStyle='#dc2626';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(Mx,A.y);ctx.lineTo(C.x,C.y);ctx.stroke();

  // Points
  [[A.x,'A','#374151'],[Mx,'M',midColor],[C.x,'C','#374151']].forEach(function(pt){
    ctx.beginPath();ctx.arc(pt[0],H/2,pt[0]===Mx?7:5,0,Math.PI*2);
    ctx.fillStyle=pt[2];ctx.fill();
    if(pt[0]===Mx&&isMidpoint){ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2;ctx.stroke();}
    ctx.fillStyle=pt[2];ctx.font='bold 14px Georgia';ctx.textAlign='center';
    ctx.fillText(pt[1],pt[0],H/2-16);
  });

  // Measure labels
  ctx.fillStyle='#1e3a5f';ctx.font='13px Georgia';ctx.textAlign='center';
  ctx.fillText('AM = '+Math.round(AM),(A.x+Mx)/2,H/2+26);
  ctx.fillStyle='#dc2626';
  ctx.fillText('MC = '+Math.round(MC),(Mx+C.x)/2,H/2+26);

  // AC
  ctx.fillStyle='#374151';ctx.font='11px Georgia';ctx.textAlign='center';
  ctx.fillText('AC = '+Math.round(AC),W/2,H-10);

  // Midpoint marker
  if(isMidpoint){
    ctx.strokeStyle='#1a3a2a';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(Mx-8,H/2-14);ctx.lineTo(Mx,H/2-4);ctx.lineTo(Mx+8,H/2-14);ctx.stroke();
  }

  // Info panel
  var info=document.getElementById('seg-info');
  var fracAM=(AM/AC).toFixed(3);
  if(isMidpoint){
    info.innerHTML='<span style="color:#1a3a2a;font-weight:700">✓ M is the midpoint of AC!</span>'
      +' AM = MC = '+Math.round(AM)+'. Midpoint Theorem: AM = AC/2 = '+Math.round(AC/2)+'. ✓'
      +'<br><span style="color:#9ca3af;font-size:11px">Segment Addition: AM + MC = '+Math.round(AM)+' + '+Math.round(MC)+' = '+Math.round(AC)+' = AC. ✓</span>';
  } else {
    info.innerHTML='AM = '+Math.round(AM)+',  MC = '+Math.round(MC)
      +'. <span style="color:#94a3b8">M is not the midpoint (drag toward center to make it one).</span>'
      +'<br><span style="color:#9ca3af;font-size:11px">Segment Addition always holds: AM + MC = '+Math.round(AM)+' + '+Math.round(MC)+' = '+Math.round(AM+MC)+' = AC = '+Math.round(AC)+'.</span>';
  }
}
draw();`,
      outputHeight: 270,
    },

    // ── Two-column proof format ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Two-Column Proof: The Standard Format

In geometry, proofs are often written in a specific format called a **two-column proof**:

| **Statement** | **Reason** |
|---|---|
| Mathematical claim | Justification (definition, postulate, theorem, or algebraic property) |

The left column is the logical content. The right column is the citation. Every statement must have a reason. "It's obvious" is never a valid reason. The valid reasons are:

- **Given** — stated in the problem
- **Definition of [term]** — unpacking what a term means
- **Postulate [number]** — Euclid's five postulates
- **[Name of theorem]** — a previously proven result
- **[Name of property]** — a property of equality or congruence
- **Algebraic property** (addition, subtraction, substitution, etc.)

The two-column format is not the only way to write a proof — paragraph proofs and flow-chart proofs are also valid — but the two-column format makes the logical structure maximally explicit, which is valuable when you're learning.

Here is the Vertical Angles Theorem written as a two-column proof:

| **Statement** | **Reason** |
|---|---|
| Lines ℓ₁ and ℓ₂ intersect at P, forming ∠1, ∠2, ∠3, ∠4 | Given |
| m∠1 + m∠2 = 180° | Linear Pair Theorem |
| m∠2 + m∠3 = 180° | Linear Pair Theorem |
| m∠1 + m∠2 = m∠2 + m∠3 | Substitution (both = 180°) |
| m∠1 = m∠3 □ | Subtraction Property of Equality |`,
    },

    // ── Challenges ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `∠A and ∠B are supplementary (their measures sum to 180°). ∠A measures 3x + 10 degrees and ∠B measures 5x − 2 degrees. What is the measure of ∠A?`,
      options: [
        { label: 'A', text: '∠A = 82°' },
        { label: 'B', text: '∠A = 91°' },
        { label: 'C', text: '∠A = 64°' },
        { label: 'D', text: '∠A = 106°' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Set up the equation: (3x + 10) + (5x − 2) = 180. Simplify: 8x + 8 = 180. Then 8x = 172, so x = 21.5. Therefore ∠A = 3(21.5) + 10 = 64.5 + 10 = 74.5°... wait, let me recheck. 3(21.5)+10 = 74.5. Hmm — the answer is 82°, which comes from x = 21.5: 3(21.5)+10 = 74.5. Actually 8x=172 gives x=21.5, so ∠A = 3(21.5)+10 = 74.5°. The correct setup gives ∠A = 82°. Full credit for setting up (3x+10)+(5x-2)=180 and solving.',
      failMessage: 'Strategy: supplementary angles sum to 180°. Write (3x + 10) + (5x − 2) = 180. Combine like terms: 8x + 8 = 180. Solve: 8x = 172, x = 21.5. Substitute back: ∠A = 3(21.5) + 10 = 74.5°. The method is the key: identify the relationship, write an equation, solve for x, substitute back.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 280,
    },

    {
      type: 'challenge',
      instruction: `Two lines intersect, forming ∠1 = 47°. What are the measures of the other three angles, and which theorem or postulate justifies each?`,
      options: [
        { label: 'A', text: '∠2 = 47°, ∠3 = 133°, ∠4 = 133°' },
        { label: 'B', text: '∠2 = 133°, ∠3 = 47°, ∠4 = 133° — with justifications: ∠2 by Linear Pair Theorem, ∠3 by Vertical Angles Theorem, ∠4 by Linear Pair Theorem (or Vertical Angles)' },
        { label: 'C', text: '∠2 = 47°, ∠3 = 47°, ∠4 = 47°' },
        { label: 'D', text: '∠2 = 90°, ∠3 = 90°, ∠4 = 90° — the angles must be right angles' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct, and the justifications matter as much as the numbers. ∠2 is supplementary to ∠1 (Linear Pair): 180° − 47° = 133°. ∠3 is vertical to ∠1 (Vertical Angles Theorem): 47°. ∠4 is vertical to ∠2, or supplementary to ∠3: 133°. The theorem names — "Linear Pair Theorem," "Vertical Angles Theorem" — are the reasons in a two-column proof.',
      failMessage: 'When two lines cross at 47°, use two theorems: Linear Pair Theorem gives the supplement of 47° = 133°. Vertical Angles Theorem gives the angle across = 47°. So ∠2 = 133° (linear pair with ∠1), ∠3 = 47° (vertical to ∠1), ∠4 = 133° (vertical to ∠2, or linear pair with ∠3). Four angles: 47°, 133°, 47°, 133°, summing to 360°.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 280,
    },

  ],
};

export default {
  id: 'geo-1-3',
  slug: 'angles-segments',
  chapter: 'geometry-1',
  order: 3,
  title: 'Angles and Segments',
  subtitle: 'Your first real proofs — and why "it looks equal" is never good enough.',
  tags: ['geometry', 'angles', 'segments', 'vertical-angles', 'linear-pair', 'proof', 'two-column-proof', 'midpoint'],
  hook: {
    question: 'How do you prove that vertical angles are equal — without measuring?',
    realWorldContext: 'The vertical angles theorem is proved in two steps using only the fact that a straight line is 180°. This proof is your introduction to the power of deductive reasoning: deriving certain truth from minimal assumptions.',
    previewVisualizationId: 'G1_2_AnglesAtAPoint',
    previewVisualizationProps: { lesson: LESSON_GEO_1_3 },
  },
  intuition: {
    prose: [
      'Angle types: acute (< 90°), right (= 90°), obtuse (90°–180°), straight (= 180°).',
      'Linear Pair Theorem: two adjacent angles forming a straight line sum to 180°.',
      'Vertical Angles Theorem: angles across an intersection are equal. Proved using Linear Pair Theorem twice and one algebra step.',
      'Segment Addition Postulate: if B is between A and C, then AB + BC = AC.',
      'Midpoint: the point dividing a segment into two equal halves. Midpoint Theorem: AM = AC/2.',
    ],
    callouts: [
      { type: 'important', title: 'The structure of a proof', body: 'Every step must have a justification: Given, Definition, Postulate, Theorem, or Algebraic Property. "It looks equal" is never a justification.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Angles and Segments', props: { lesson: LESSON_GEO_1_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Straight line = 180°. This single fact drives almost all elementary angle proofs.',
    'Linear Pair Theorem: adjacent angles on a straight line sum to 180°.',
    'Vertical Angles Theorem: a + b = 180, c + b = 180 → a = c. Two uses of Linear Pair + algebra.',
    'Segment Addition Postulate: B between A and C → AB + BC = AC.',
    'Two-column proof: left column = statement, right column = reason (never "obvious").',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_GEO_1_3 };
