// Geometry · Chapter 1 · Lesson 1
// Foundations of Everything — The Axiomatic Method
import geoAxiomHierarchyUrl from '../diagrams/geo-axiom-hierarchy.svg?url'
import geoFivePostulatesUrl from '../diagrams/geo-five-postulates.svg?url'
import geoProofAnatomyUrl from '../diagrams/geo-proof-anatomy.svg?url'
import quizTwoLinesUrl from '../diagrams/quiz-two-lines-proof.svg?url'

const LESSON_GEO_1_1 = {
  title: 'Foundations of Everything',
  subtitle: 'How five sentences became the blueprint for all of geometry — and the model for all of mathematics.',
  subject: 'Geometry',
  sequential: true,

  cells: [

    // ── Opening ────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### A Book That Changed How Humans Think

In 300 BCE, a Greek mathematician named Euclid sat down to write a textbook. The result, *Elements*, became the most reproduced book in history after the Bible — printed in more than a thousand editions since the invention of the printing press. Abraham Lincoln carried it on the frontier and read it by firelight to sharpen his mind for argument. Einstein described encountering it at age twelve as a revelation, "the holy geometry booklet."

Why? Not because it contains exotic facts. The geometry in *Elements* is elementary by any modern measure. The reason *Elements* changed human civilization is its *method*.

Euclid didn't just state facts about triangles and circles. He established a completely new way of thinking: begin with a tiny number of assumptions so obvious that everyone accepts them without argument, then use pure logic to derive every other result. No experiments, no measuring, no appeals to authority — just the relentless application of deductive reasoning.

This is the **axiomatic method**, and it is the foundation of mathematics, formal logic, computer science, and modern physics. Every proof you will ever write in this course — and in every mathematics course that follows — uses the machinery Euclid built.`,
    },

    // ── What is a proof? ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Problem With "Obviously True"

Imagine you draw two lines that cross each other. Look at the four angles formed at the crossing point. The two angles across from each other — the *vertical angles* — appear to be equal. You could draw a hundred different pairs of crossing lines, measure every time, and they'd always be equal.

Is that a proof?

No. No number of examples is a proof. A proof must establish truth with certainty — not just "I've checked enough cases that I'm convinced," but "I can demonstrate by pure logic that this must always be true, for every conceivable pair of lines."

The problem with "obviously true" is that things can look obviously true and be wrong. For two thousand years, mathematicians believed Euclid's fifth postulate was "obviously" a consequence of the first four. It took until the 19th century, when Gauss, Lobachevsky, and Bolyai independently discovered non-Euclidean geometries, to prove that the fifth postulate is genuinely independent — you can build consistent geometries where it doesn't hold. What looked obvious was not provable from what came before.

This is why mathematics requires proof. Not because mathematicians are pedantic, but because human intuition about geometry is calibrated by experience in a roughly flat, roughly Euclidean world. When we leave that world — at cosmological scales, or in theoretical mathematics — intuition fails. Proof is the only reliable guide.`,
    },

    // ── Visual 1 — The Five Postulates ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Euclid's Five Postulates: The Foundation

These five statements are all Euclid assumed. Everything else — the Pythagorean Theorem, properties of circles, the theory of parallel lines — he derived from these alone. Click each postulate to see what it claims and why it was chosen.`,
      html: `<div id="scene" style="padding:0"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:'Georgia',serif}
#scene{display:flex;flex-direction:column;gap:0}`,
      startCode: `var scene=document.getElementById('scene');
var postulates=[
  {
    num:'I',
    latin:'A straight line can be drawn from any point to any other point.',
    plain:'Two points determine a unique straight line.',
    why:'This establishes that space is connected — you can always get from here to there. It also implicitly assumes points exist and lines exist.',
    color:'#1e3a5f',
    bg:'#e8f0fb',
    border:'#3b82f6'
  },
  {
    num:'II',
    latin:'A finite straight line can be extended continuously in a straight line.',
    plain:'Any line segment can be extended indefinitely.',
    why:'Space has no edges. This rules out geometries where lines wrap around (like the surface of a sphere, where a "line" eventually returns to its starting point).',
    color:'#1a3a2a',
    bg:'#e8f5ee',
    border:'#10b981'
  },
  {
    num:'III',
    latin:'A circle can be drawn with any center and any radius.',
    plain:'Given a point and a distance, there exists a circle.',
    why:'The compass exists in geometry. You can measure and reproduce any distance. This postulate makes lengths transferable.',
    color:'#3b2a1a',
    bg:'#fef3e8',
    border:'#f97316'
  },
  {
    num:'IV',
    latin:'All right angles are equal to one another.',
    plain:'Every right angle is the same — 90° is 90° everywhere.',
    why:'Space is homogeneous and isotropic — it looks the same everywhere and in every direction. A right angle in Athens is the same as a right angle in Alexandria.',
    color:'#2a1a3b',
    bg:'#f5e8fe',
    border:'#a855f7'
  },
  {
    num:'V',
    latin:'If a line crossing two lines makes interior angles on one side summing to less than two right angles, those two lines meet on that side.',
    plain:'Through a point not on a line, exactly one parallel line exists.',
    why:'This is the famous Parallel Postulate. Euclid clearly felt uneasy about it — he delayed using it as long as possible. Two millennia later, mathematicians discovered geometries where it fails: on a sphere (no parallels) and in hyperbolic space (infinitely many parallels).',
    color:'#3a1a1a',
    bg:'#fde8e8',
    border:'#ef4444'
  }
];

var openIdx=null;

postulates.forEach(function(p,i){
  var card=document.createElement('div');
  card.style.cssText='border-left:4px solid '+p.border+';margin:6px 14px;border-radius:8px;overflow:hidden;cursor:pointer;transition:all .2s;';

  var header=document.createElement('div');
  header.style.cssText='padding:12px 16px;background:'+p.bg+';display:flex;align-items:flex-start;gap:12px;';

  var numEl=document.createElement('div');
  numEl.style.cssText='font-family:Georgia,serif;font-size:15px;font-weight:700;color:'+p.border+';min-width:26px;padding-top:1px;';
  numEl.textContent='P'+p.num;

  var textEl=document.createElement('div');
  textEl.style.cssText='flex:1';

  var latinEl=document.createElement('div');
  latinEl.style.cssText='font-family:Georgia,serif;font-size:13px;font-style:italic;color:'+p.color+';line-height:1.55;';
  latinEl.textContent='"'+p.latin+'"';

  var plainEl=document.createElement('div');
  plainEl.style.cssText='font-size:12px;color:var(--color-text-secondary, #475569);margin-top:4px;';
  plainEl.textContent='In plain English: '+p.plain;

  textEl.appendChild(latinEl);
  textEl.appendChild(plainEl);
  header.appendChild(numEl);
  header.appendChild(textEl);

  var expandEl=document.createElement('div');
  expandEl.style.cssText='padding:12px 16px 14px 54px;background:var(--color-background-primary, #ffffff);display:none;border-top:1px solid var(--color-border-primary, #e2e8f0);font-size:13px;color:var(--color-text-primary, #1e293b);line-height:1.7;font-family:Georgia,serif;';
  expandEl.innerHTML='<strong style="color:'+p.border+'">Why this?</strong> '+p.why;

  card.appendChild(header);
  card.appendChild(expandEl);

  card.onclick=function(){
    if(openIdx===i){openIdx=null;expandEl.style.display='none';card.style.boxShadow='none';}
    else{
      scene.querySelectorAll('.exp-panel').forEach(function(el){el.style.display='none';});
      scene.querySelectorAll('.p-card').forEach(function(el){el.style.boxShadow='none';});
      openIdx=i;
      expandEl.style.display='block';
      card.style.boxShadow='0 2px 12px rgba(0,0,0,0.10)';
    }
  };

  card.classList.add('p-card');
  expandEl.classList.add('exp-panel');
  scene.appendChild(card);
});

var note=document.createElement('div');
note.style.cssText='margin:10px 14px 14px;padding:10px 14px;background:var(--color-background-secondary, #f8fafc);border:1px solid var(--color-border-primary, #e2e8f0);border-radius:8px;font-size:12px;color:var(--color-text-secondary, #475569);font-family:Georgia,serif;line-height:1.65;';
note.innerHTML='<strong>Euclid also stated five "Common Notions"</strong> — logical axioms not specific to geometry, such as "things equal to the same thing are equal to each other." These, combined with the five postulates, constitute the complete foundation of Euclidean geometry.';
scene.appendChild(note);`,
      outputHeight: 460,
    },

    // ── Undefined terms ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Terms We Cannot Define

Before the postulates, there is something even more fundamental: the *undefined terms*.

In any axiomatic system, you cannot define every word. If you try, you run into an infinite regress: to define "point," you use words that must themselves be defined, which use more words, and so on without end. To escape this trap, every axiomatic system designates certain primitive concepts — the undefined terms — which everyone agrees to understand intuitively without formal definition.

In Euclidean geometry, the undefined terms are:

**Point.** A location. No size, no dimension — just position. Euclid described it as "that which has no part," which is poetry, not definition. We accept that we know what a point is.

**Line.** An infinite, straight, one-dimensional object extending in both directions. "Straight" is left undefined. "Infinite" is left to intuition.

**Plane.** A flat, two-dimensional surface extending infinitely. Again, "flat" is primitive.

This might feel uncomfortable. Surely we can *define* these things? The answer is: we can describe them, we can draw pictures, we can point to examples — but we cannot define them in terms of simpler geometric concepts, because there are none simpler. The undefined terms are the bedrock.

This is not a weakness. It is honesty. Every mathematical system requires some primitive starting points. Geometry names them. Logic has its own (proposition, truth, inference). Set theory has its own (set, membership). The discipline is knowing where your assumptions live.`,
    },

    // ── Visual 2 — Step-through proof ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Step Through the First Proof

**Theorem 1.** *Two distinct lines intersect in at most one point.*

This proof uses **contradiction** — assume the opposite, derive an impossibility, conclude the original is true. Click **Next** to walk through each step. The diagram updates to show exactly what the logic is doing.`,
      html: `<div style="background:var(--color-background-secondary,#f8fafc)">
<canvas id="cv" width="700" height="240" style="display:block"></canvas>
<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:var(--color-background-primary,#fff);border-top:1px solid var(--color-border-primary,#e2e8f0)">
  <button id="prevBtn" style="padding:6px 16px;border-radius:8px;border:1.5px solid #1e3a5f;background:transparent;color:#1e3a5f;font-family:Georgia,serif;font-size:13px;font-weight:700;cursor:pointer">← Prev</button>
  <span id="stepCount" style="flex:1;text-align:center;font-family:Georgia,serif;font-size:12px;color:#64748b"></span>
  <button id="nextBtn" style="padding:6px 16px;border-radius:8px;border:none;background:#1e3a5f;color:#fff;font-family:Georgia,serif;font-size:13px;font-weight:700;cursor:pointer">Next →</button>
</div>
<div id="stepBox" style="padding:14px 16px;background:var(--color-background-primary,#fff);border-top:1px solid var(--color-border-primary,#e2e8f0);min-height:80px"></div>
</div>`,
      css: `body{margin:0;font-family:Georgia,serif}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

// Two intersecting lines
var L1={x1:60,y1:50,x2:560,y2:200};
var L2={x1:80,y1:210,x2:540,y2:60};

function lineIntersect(a,b){
  var dx1=a.x2-a.x1,dy1=a.y2-a.y1,dx2=b.x2-b.x1,dy2=b.y2-b.y1;
  var d=dx1*dy2-dy1*dx2;if(!d)return null;
  var t=((b.x1-a.x1)*dy2-(b.y1-a.y1)*dx2)/d;
  return{x:a.x1+t*dx1,y:a.y1+t*dy1};
}
var P=lineIntersect(L1,L2); // real intersection ~(300,125)
var Q={x:P.x-130,y:P.y+45}; // hypothetical second intersection

var step=0;
var steps=[
  {
    tag:'Claim',color:'#1e3a5f',
    title:'Two distinct lines intersect in at most one point.',
    body:'We want to prove that two different lines can share at most one point in common. This is the claim. A proof must then show it is <em>logically necessary</em>.',
    draw:function(){
      drawLines(1,1);
      dot(P,'P','#1e3a5f');
    }
  },
  {
    tag:'Step 1 — Assume the opposite',color:'#dc2626',
    title:'Suppose lines ℓ₁ and ℓ₂ intersect at two distinct points P and Q.',
    body:'We start the contradiction: assume both P <em>and</em> Q lie on both lines. We don\'t believe this is true — we\'re going to show it leads to an impossibility.',
    draw:function(){
      drawLines(1,1);
      dot(P,'P','#dc2626');
      dot(Q,'Q','#dc2626');
    }
  },
  {
    tag:'Step 2 — Apply Postulate I',color:'#7c3aed',
    title:'By Postulate I: through P and Q, there is exactly one straight line.',
    body:'Postulate I is non-negotiable. P and Q are two points, so exactly one line passes through them. Not two. Not more. Exactly one.',
    draw:function(){
      drawLines(0.2,0.2);
      dot(P,'P','#7c3aed');
      dot(Q,'Q','#7c3aed');
      // Draw the "unique" line from Postulate I through P and Q
      var dx=Q.x-P.x,dy=Q.y-P.y,len=Math.hypot(dx,dy);
      var ux=dx/len,uy=dy/len;
      ctx.strokeStyle='#7c3aed';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(P.x-ux*200,P.y-uy*200);ctx.lineTo(Q.x+ux*200,Q.y+uy*200);ctx.stroke();
      ctx.fillStyle='#7c3aed';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
      ctx.fillText('one line through P and Q (Postulate I)',P.x+(Q.x-P.x)/2,P.y+(Q.y-P.y)/2-14);
      dot(P,'P','#7c3aed');dot(Q,'Q','#7c3aed');
    }
  },
  {
    tag:'Step 3 — Contradiction',color:'#dc2626',
    title:'But ℓ₁ and ℓ₂ are already two different lines through P and Q.',
    body:'We assumed two separate lines both pass through P and both pass through Q. That gives two lines through the same two points. But Postulate I says <strong>exactly one</strong> such line exists. This is the contradiction.',
    draw:function(){
      drawLines(1,1);
      dot(P,'P','#dc2626');
      dot(Q,'Q','#dc2626');
      // Draw a big ✗ between P and Q
      var mx=(P.x+Q.x)/2,my=(P.y+Q.y)/2;
      ctx.strokeStyle='#dc2626';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(mx-18,my-18);ctx.lineTo(mx+18,my+18);ctx.stroke();
      ctx.beginPath();ctx.moveTo(mx+18,my-18);ctx.lineTo(mx-18,my+18);ctx.stroke();
      ctx.fillStyle='#dc2626';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
      ctx.fillText('2 lines through P and Q — impossible! (Postulate I)',mx,my-28);
    }
  },
  {
    tag:'Conclusion □',color:'#1a3a2a',
    title:'The assumption leads to a contradiction. Therefore the theorem is proved.',
    body:'Since assuming two intersection points creates a contradiction with Postulate I, the assumption must be false. Two distinct lines can intersect in <em>at most one point</em>. QED.',
    draw:function(){
      drawLines(1,1);
      dot(P,'P','#1a3a2a');
      // Show only one intersection point — the theorem is proved
      ctx.fillStyle='#1a3a2a';ctx.font='bold 13px Georgia';ctx.textAlign='center';
      ctx.fillText('exactly one intersection point — proved □',P.x,P.y-18);
    }
  }
];

function drawLines(a1,a2){
  ctx.globalAlpha=a1;
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(L1.x1,L1.y1);ctx.lineTo(L1.x2,L1.y2);ctx.stroke();
  ctx.fillStyle='#1e3a5f';ctx.font='italic 13px Georgia';ctx.textAlign='left';
  ctx.fillText('ℓ₁',L1.x2+4,L1.y2+4);
  ctx.globalAlpha=a2;
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(L2.x1,L2.y1);ctx.lineTo(L2.x2,L2.y2);ctx.stroke();
  ctx.fillStyle='#1a3a2a';
  ctx.fillText('ℓ₂',L2.x2+4,L2.y2-8);
  ctx.globalAlpha=1;
}

function dot(p,label,color){
  ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);
  ctx.fillStyle=color;ctx.fill();
  ctx.fillStyle=color;ctx.font='bold 13px Georgia';ctx.textAlign='left';
  ctx.fillText(label,p.x+10,p.y-6);
}

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  steps[step].draw();
  document.getElementById('stepCount').textContent='Step '+(step+1)+' / '+steps.length;
  document.getElementById('prevBtn').disabled=(step===0);
  document.getElementById('nextBtn').disabled=(step===steps.length-1);
  document.getElementById('prevBtn').style.opacity=step===0?'0.35':'1';
  document.getElementById('nextBtn').style.opacity=step===steps.length-1?'0.35':'1';
  var s=steps[step];
  document.getElementById('stepBox').innerHTML=
    '<div style="display:flex;gap:10px;align-items:flex-start">'
    +'<div style="min-width:88px;padding:3px 8px;border-radius:6px;background:'+s.color+'18;color:'+s.color+';font-size:10px;font-weight:700;font-family:sans-serif;margin-top:2px;text-align:center">'+s.tag+'</div>'
    +'<div><div style="font-size:13px;font-weight:700;color:'+s.color+';margin-bottom:4px">'+s.title+'</div>'
    +'<div style="font-size:13px;color:var(--color-text-primary,#1e293b);line-height:1.7">'+s.body+'</div></div></div>';
}

document.getElementById('prevBtn').onclick=function(){if(step>0){step--;render();}};
document.getElementById('nextBtn').onclick=function(){if(step<steps.length-1){step++;render();}};
render();`,
      outputHeight: 420,
    },

    // ── The anatomy of a proof ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Anatomy of a Proof

The proof above — simple as it is — contains every ingredient that every proof in mathematics contains. Let's name them explicitly, because you will use this structure for the rest of your mathematical life.

**Claim.** A precisely stated proposition. Not "these angles are equal" but "vertical angles are equal." Precision is not pedantry — vague claims cannot be proven or refuted.

**Given.** The assumptions in force for this specific proof. What are we starting with?

**Prove.** What exactly must we establish? State it before starting.

**Proof.** The logical sequence. Each step follows from previous steps, from the given, from the postulates, or from previously proven theorems. Each step cites its justification explicitly.

**QED (□).** The signal that the proof is complete.

There are two main proof strategies you'll encounter first:

**Direct proof:** start with the given, apply definitions and theorems step by step, and arrive at the conclusion. Most proofs in this chapter are direct.

**Proof by contradiction (reductio ad absurdum):** assume the opposite of what you want to prove, derive a contradiction, and conclude that the opposite must be true. The proof above used this strategy.`,
    },

    // ── Visual 3 — Definitions interactive ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Definitions: The Other Building Blocks

Alongside postulates and undefined terms, geometry requires precise definitions. Unlike undefined terms (which we accept without definition) and postulates (which we accept without proof), definitions introduce new vocabulary by *exactly* describing combinations of existing concepts.

Click each definition to see how it builds on the undefined terms and earlier definitions.`,
      html: `<div id="defs" style="padding:14px;display:flex;flex-direction:column;gap:8px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}`,
      startCode: `var defs=[
  {term:'Line Segment',symbol:'AB̅',def:'The set of all points on line AB that lie between (and including) points A and B.',depends:'Built from: Point (undefined), Line (undefined)',note:'A segment has a definite length. A line does not — it extends infinitely. This is a critical distinction for measurement.',color:'#1e3a5f'},
  {term:'Ray',symbol:'AB⃗',def:'The part of line AB that starts at point A and extends infinitely through B in one direction.',depends:'Built from: Point (undefined), Line (undefined)',note:'A ray has one endpoint and one infinite end. The naming convention matters: AB⃗ and BA⃗ are different rays pointing in opposite directions.',color:'#1a3a2a'},
  {term:'Angle',symbol:'∠ABC',def:'Two rays (AB⃗ and BC⃗) that share a common endpoint B. The angle is the "opening" between them.',depends:'Built from: Ray (defined above)',note:'The vertex of the angle is the shared endpoint B. The sides are the two rays. Angles are measured in degrees (°) or radians (rad).',color:'#3b2a1a'},
  {term:'Right Angle',symbol:'90°',def:'An angle equal to 90 degrees — one quarter of a full rotation.',depends:'Built from: Angle (defined above)',note:'By Postulate IV, all right angles are equal. A right angle is marked with a small square in diagrams.',color:'#2a1a3b'},
  {term:'Perpendicular Lines',symbol:'ℓ₁ ⊥ ℓ₂',def:'Two lines that intersect to form a right angle.',depends:'Built from: Line (undefined), Right Angle (defined above)',note:'Perpendicularity is a relationship between two lines — it requires both lines to be present.',color:'#1a3a2a'},
  {term:'Parallel Lines',symbol:'ℓ₁ ∥ ℓ₂',def:'Two lines in the same plane that never intersect, no matter how far extended.',depends:'Built from: Line (undefined), Plane (undefined)',note:'Parallel lines require Postulate V (the Parallel Postulate) for most interesting results. This is why Postulate V is so significant — without it, you cannot prove much about parallel lines.',color:'#3a1a1a'}
];

var defsEl=document.getElementById('defs');

defs.forEach(function(d){
  var card=document.createElement('div');
  card.style.cssText='border:1px solid var(--color-border-primary, #e2e8f0);border-radius:10px;overflow:hidden;background:var(--color-background-primary, #ffffff);';
  var header=document.createElement('div');
  header.style.cssText='padding:12px 14px;cursor:pointer;display:flex;align-items:baseline;gap:10px;';
  header.innerHTML='<span style="font-weight:700;font-size:14px;color:'+d.color+'">'+d.term+'</span>'
    +'<span style="font-family:serif;font-size:13px;color:var(--color-text-tertiary, #9ca3af);font-style:italic">'+d.symbol+'</span>'
    +'<span style="margin-left:auto;font-size:11px;color:#94a3b8">click to expand ▾</span>';
  var body=document.createElement('div');
  body.style.cssText='padding:0 14px 12px;display:none;border-top:1px solid var(--color-border-primary, #e2e8f0);';
  body.innerHTML='<div style="font-size:13px;color:var(--color-text-primary, #1e293b);line-height:1.65;margin-top:10px;font-style:italic">'+d.def+'</div>'
    +'<div style="font-size:11px;color:var(--color-text-tertiary, #9ca3af);margin-top:6px;">'+d.depends+'</div>'
    +'<div style="font-size:12px;color:var(--color-text-secondary, #475569);margin-top:8px;padding:8px 10px;background:var(--color-background-secondary, #f8fafc);border-radius:6px;border-left:3px solid '+d.color+'">'+d.note+'</div>';
  var open=false;
  header.onclick=function(){
    open=!open;
    body.style.display=open?'block':'none';
    header.querySelector('span:last-child').textContent=open?'click to collapse ▴':'click to expand ▾';
  };
  card.appendChild(header);
  card.appendChild(body);
  defsEl.appendChild(card);
});`,
      outputHeight: 420,
    },

    // ── Why this matters ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why This Is the Most Important Lesson in Mathematics

What you just encountered — the axiomatic method — is the most powerful intellectual tool humanity has developed.

**It produces absolute certainty.** If the postulates are true and the logic is valid, the theorem is true. Not probably true, not true in all tested cases, but necessarily true. This kind of certainty is unavailable in science (which relies on evidence that could in principle be overturned).

**It made modern science possible.** When Newton wanted to establish mechanics on rigorous foundations, he modeled his *Principia Mathematica* directly on Euclid's *Elements*, presenting definitions, axioms, and theorems. Einstein's general relativity is expressed in the language of differential geometry — an axiomatic extension of Euclidean geometry.

**It is the model for computer science.** Every formal logic system, every programming language type system, every cryptographic protocol is built on the axiomatic method. When you write a proof that an algorithm is correct, you are doing Euclidean geometry with different primitives.

**It forces precision.** The act of writing a proof — of having to state every step and its justification — reveals hidden assumptions. The discovery of non-Euclidean geometry happened because mathematicians tried to prove Postulate V from the others and instead discovered that it was independent.

In the next lesson, we will meet the three undefined terms — point, line, and plane — and the postulates that govern them.`,
    },

    // ── Challenges ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Euclid's Postulate I states that through any two points, there is a straight line. A student says: "That postulate is obvious — I can *see* that two points determine a line. Why do we need to state it as a postulate?" What is the best response?`,
      options: [
        { label: 'A', text: 'The student is correct — postulates should be provable, and this one could be proven from simpler facts.' },
        { label: 'B', text: 'In an axiomatic system, we need to state what we assume explicitly, even if it seems obvious. "Obvious" is not the same as "provable from something more basic." Every axiomatic system must start somewhere.' },
        { label: 'C', text: 'The postulate is needed so that students remember the fact, not because it serves a logical function.' },
        { label: 'D', text: 'The postulate is only needed for advanced geometry — beginners can skip it.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. This is the deep point about axiomatic systems: every system must begin with assumptions accepted without proof. "Obvious" and "provable from simpler assumptions" are different things. Two thousand years of mathematicians found Postulate V "obvious" — yet it is genuinely independent of the other four, as non-Euclidean geometry proves.',
      failMessage: 'The key insight: postulates are stated not because they are provable, but because they are the unprovable starting points that everything else is built on. "Obvious" and "provable" are entirely different things.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 280,
    },

    {
      type: 'challenge',
      instruction: `Which correctly identifies all three categories of geometric foundation introduced in this lesson?`,
      options: [
        { label: 'A', text: 'Theorems, proofs, and definitions' },
        { label: 'B', text: 'Undefined terms, postulates, and definitions — everything else (theorems) is derived from these using logic' },
        { label: 'C', text: 'Points, lines, and planes' },
        { label: 'D', text: 'Axioms, lemmas, and corollaries' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. (1) Undefined terms — point, line, plane — accepted intuitively. (2) Postulates — accepted as true without proof. (3) Definitions — new concepts defined from earlier ones. Theorems are derived, not assumed.',
      failMessage: 'Points, lines, and planes are the undefined terms — one category. The three foundational categories are: undefined terms, postulates, and definitions. Theorems are derived from these.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 280,
    },

  ],
};

export default {
  id: 'geo-1-1',
  slug: 'intro-geometry',
  chapter: 'geometry-1',
  order: 1,
  title: 'Foundations of Everything',
  subtitle: 'How five sentences became the blueprint for all of geometry — and the model for all of mathematics.',
  tags: ['geometry', 'intro-geometry', 'euclid', 'postulates', 'axiomatic-method', 'proof', 'undefined-terms'],
  hook: {
    question: 'How do you prove something that "looks" obvious — and why does it matter?',
    realWorldContext: 'Euclid\'s axiomatic method is the intellectual foundation of mathematics, formal logic, computer science, and physics. Every proof you write in any mathematical subject uses the structure Euclid established in 300 BCE. His five postulates — five sentences — were sufficient to derive all of Euclidean geometry for two thousand years.',
    previewVisualizationId: 'G1_1_FivePostulates',
  },
  intuition: {
    blocks: [

      // ── The axiomatic method ────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**The axiomatic method.** In 300 BCE, Euclid chose five simple statements — postulates — as his starting assumptions. From those five statements alone, he derived hundreds of geometric facts using nothing but deductive logic. No measurements, no experiments, no appeals to authority. This method is the foundation of all mathematics.',
          'The key hierarchy has three levels: **undefined terms** (accepted without definition), **postulates** (accepted without proof), and **definitions** (built from earlier concepts). Everything else — every theorem, every formula, every result — is derived from these three foundations by logic.',
        ],
      },
      {
        type: 'image',
        src: geoAxiomHierarchyUrl,
        alt: 'Hierarchy diagram: undefined terms and postulates at the bottom, definitions in the middle, theorems at the top, connected by logic arrows',
        caption: 'The axiomatic structure of geometry. Theorems at the top are proved — but only because the foundations below were accepted first.',
      },

      // ── The five postulates ─────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**Euclid\'s Five Postulates.** Euclid started with the most obvious geometric facts imaginable — so obvious that no one could reasonably object to them. These are his five postulates: (I) two points determine a line, (II) lines extend infinitely, (III) circles exist for any center and radius, (IV) all right angles are equal, (V) through a point not on a line, exactly one parallel exists.',
          'The first four were accepted easily. The fifth — the **Parallel Postulate** — troubled mathematicians for 2,000 years. It looks less "obvious" than the others. In the 19th century, Gauss, Lobachevsky, and Bolyai proved it is genuinely independent: you can build consistent geometries where it fails (on a sphere, no parallel lines exist; in hyperbolic space, infinitely many parallels exist).',
        ],
      },
      {
        type: 'image',
        src: geoFivePostulatesUrl,
        alt: 'Visual summary of all five Euclidean postulates with geometric diagrams for each',
        caption: 'Five postulates, five geometric facts. The red Postulate V is the one that resisted proof for 2,000 years — because it cannot be proved from the others.',
      },

      // ── Proof anatomy ───────────────────────────────────────────────────────
      {
        type: 'prose',
        paragraphs: [
          '**The anatomy of every proof.** A mathematical proof has a fixed structure. Every proof you write — in this course and beyond — follows the same four-part pattern. The structure exists for a reason: without it, a "proof" is just an argument, and arguments can be wrong.',
          '"Obvious" is not a justification. Every step of a proof must cite a specific postulate, definition, or previously proved theorem. This discipline is not pedantry — it is what gives mathematics its certainty. The discovery of non-Euclidean geometry happened precisely because someone refused to accept "obvious" and insisted on proof.',
        ],
      },
      {
        type: 'image',
        src: geoProofAnatomyUrl,
        alt: 'Four-part proof structure: Claim (blue), Given (green), Proof steps (amber), QED (purple)',
        caption: 'Every proof has these four parts. Learn this structure once — it applies to every theorem in mathematics.',
      },

      // ── Interactive notebook ────────────────────────────────────────────────
      {
        type: 'viz',
        id: 'ScienceNotebook',
        mathBridge: 'Work through the notebook: (1) click each postulate card to read the "Why?" explanation — especially Postulate V; (2) step through the proof to see how contradiction works; (3) expand the definitions to trace each term back to the undefined primitives. Try to predict each next step before clicking.',
        props: { lesson: LESSON_GEO_1_1 },
      },

    ],
  },
  mentalModel: [
    'Undefined terms (point, line, plane): accepted intuitively, never formally defined — every system needs a starting vocabulary.',
    'Postulates: the five axioms accepted as true without proof. The smallest possible set of assumptions.',
    'Definitions: new concepts defined exactly from prior ones. Build upward from undefined terms.',
    'Theorems: derived by logic from the above. Every step must cite a postulate, definition, or prior theorem.',
    'Proof by contradiction: assume ¬P, derive a contradiction, conclude P is true.',
    'Postulate V (Parallel Postulate) is independent — dropping it gives non-Euclidean geometry where parallel lines behave differently.',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Why does geometry accept "point," "line," and "plane" without formal definitions?',
      options: [
        'Mathematicians haven\'t found the right definitions yet',
        'Every definition requires prior terms; you must start somewhere — undefined terms are the bedrock everyone agrees to accept intuitively',
        'They are too simple to need defining',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What distinguishes a postulate from a theorem?',
      options: [
        'Postulates are more important than theorems',
        'Postulates are assumed true as a starting point; theorems must be derived by logical proof from postulates and prior theorems',
        'Postulates can be disproved later; theorems cannot',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What is wrong with saying "this step is obviously true" in a formal proof?',
      options: [
        'Nothing — obvious facts are acceptable in proofs',
        '"Obviously" is not a mathematical reason. Every step must cite a specific definition, postulate, or previously proved theorem',
        'Obvious statements must be listed as definitions first',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'In proof by contradiction, you assume the opposite of what you want to prove. Why does finding a contradiction then prove the original claim?',
      options: [
        'Because the assumption was made by the opponent, so any flaw disproves it',
        'If assuming ¬P leads to a logical contradiction, then ¬P must be false, so P must be true',
        'Contradiction proofs only work for existence claims',
      ],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      diagram: quizTwoLinesUrl,
      diagramAlt: 'Two lines ℓ₁ and ℓ₂ intersecting at point P. A faded point Q with an X through it represents the impossible second intersection.',
      text: 'The diagram shows ℓ₁ and ℓ₂ intersecting at P. The faded Q represents an assumed second intersection. Which postulate makes Q impossible — and why?',
      options: [
        'Postulate III — circles determine distances',
        'Postulate I — through P and Q there is exactly one line, but ℓ₁ and ℓ₂ would be two lines through the same two points, a contradiction',
        'Postulate V — the parallel postulate forbids second intersections',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'Postulate IV states "all right angles are equal." What geometric property of space does this postulate express?',
      options: [
        'Space has no edges',
        'Space is homogeneous and isotropic — it looks the same everywhere and in every direction',
        'Two parallel lines never meet',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Why did Euclid\'s fifth postulate (the Parallel Postulate) trouble mathematicians for 2,000 years?',
      options: [
        'It was harder to state in Latin than the other postulates',
        'Mathematicians suspected it could be proved from the other four — but it cannot; it is genuinely independent',
        'It was only needed for three-dimensional geometry',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A definition in geometry differs from an undefined term in that a definition…',
      options: [
        'Is accepted without proof, just like a postulate',
        'Introduces new vocabulary by exactly describing a combination of already-accepted concepts',
        'Replaces a postulate once geometry is established',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'In non-Euclidean geometry (e.g., on the surface of a sphere), which postulate fails?',
      options: [
        'Postulate I — two points do not determine a unique line',
        'Postulate V — through a point, zero parallel lines exist to a given line (all lines eventually meet)',
        'Postulate IV — right angles are different sizes in different places',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'The correct order of dependence in the axiomatic system is…',
      options: [
        'Theorems → Definitions → Postulates → Undefined terms',
        'Undefined terms + Postulates → Definitions → Theorems (derived by logic)',
        'Postulates → Undefined terms → Theorems → Definitions',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_1_1 };
