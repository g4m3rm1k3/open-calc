// Geometry · Chapter 1 · Lesson 1
// Foundations of Everything — The Axiomatic Method

const LESSON_GEO_1_1 = {
  title: 'Foundations of Everything',
  subtitle: 'How five sentences became the blueprint for all of geometry — and the model for all of mathematics.',
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
      css: `body{margin:0;background:#fafaf8;font-family:'Georgia',serif}
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
  plainEl.style.cssText='font-size:12px;color:#64748b;margin-top:4px;';
  plainEl.textContent='In plain English: '+p.plain;
  
  textEl.appendChild(latinEl);
  textEl.appendChild(plainEl);
  header.appendChild(numEl);
  header.appendChild(textEl);
  
  var expandEl=document.createElement('div');
  expandEl.style.cssText='padding:12px 16px 14px 54px;background:#fff;display:none;border-top:1px solid #f0f0ee;font-size:13px;color:#374151;line-height:1.7;font-family:Georgia,serif;';
  expandEl.innerHTML='<strong style="color:'+p.border+'">Why this?</strong> '+p.why;
  
  card.appendChild(header);
  card.appendChild(expandEl);
  
  card.onclick=function(){
    if(openIdx===i){openIdx=null;expandEl.style.display='none';card.style.boxShadow='none';}
    else{
      postulates.forEach(function(_,j){
        var cards=scene.querySelectorAll('[data-idx]');
        // reset all
      });
      // close all
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

// Note at bottom
var note=document.createElement('div');
note.style.cssText='margin:10px 14px 14px;padding:10px 14px;background:#fafaf8;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;color:#64748b;font-family:Georgia,serif;line-height:1.65;';
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

    // ── Visual 2 — Building the first theorems ─────────────────────────────────
    {
      type: 'js',
      instruction: `### From Postulates to Theorems: The First Proof

Once we have the postulates, we can begin deriving theorems. The first few theorems Euclid proves are deceptively simple — but they establish the pattern that every proof in this course will follow.

**Theorem 1.** *Two distinct lines intersect in at most one point.*

This is the canvas below. Hover over each step of the proof to understand the logical structure.`,
      html: `<canvas id="cv" width="700" height="320"></canvas>
<div id="proof-steps" style="padding:14px;font-family:Georgia,serif"></div>`,
      css: `body{margin:0;background:#fafaf8;font-family:Georgia,serif}
#proof-steps{background:#fff;border-top:1px solid #e2e8f0}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);

// Draw two intersecting lines
var line1={x1:80,y1:60,x2:580,y2:260};
var line2={x1:100,y1:280,x2:560,y2:80};

// Find intersection
function intersect(l1,l2){
  var d1x=l1.x2-l1.x1,d1y=l1.y2-l1.y1;
  var d2x=l2.x2-l2.x1,d2y=l2.y2-l2.y1;
  var cross=d1x*d2y-d1y*d2x;
  if(Math.abs(cross)<1e-10)return null;
  var t=((l2.x1-l1.x1)*d2y-(l2.y1-l1.y1)*d2x)/cross;
  return{x:l1.x1+t*d1x,y:l1.y1+t*d1y};
}

var pt=intersect(line1,line2);

function drawScene(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  
  // Lines
  ctx.strokeStyle='#1e3a5f';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(line1.x1,line1.y1);ctx.lineTo(line1.x2,line1.y2);ctx.stroke();
  ctx.strokeStyle='#1a3a2a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(line2.x1,line2.y1);ctx.lineTo(line2.x2,line2.y2);ctx.stroke();
  
  // Labels
  ctx.fillStyle='#1e3a5f';ctx.font='italic 14px Georgia';ctx.textAlign='left';
  ctx.fillText('line ℓ₁',line1.x2-60,line1.y2+18);
  ctx.fillStyle='#1a3a2a';
  ctx.fillText('line ℓ₂',line2.x2-60,line2.y2-8);
  
  // Intersection point
  if(pt){
    ctx.beginPath();ctx.arc(pt.x,pt.y,6,0,Math.PI*2);
    ctx.fillStyle='#dc2626';ctx.fill();
    ctx.fillStyle='#dc2626';ctx.font='bold 13px Georgia';ctx.textAlign='left';
    ctx.fillText('P',pt.x+10,pt.y-6);
  }
  
  // "Phantom" second intersection - with X
  var phantom={x:pt.x-120,y:pt.y+40};
  ctx.beginPath();ctx.arc(phantom.x,phantom.y,6,0,Math.PI*2);
  ctx.strokeStyle='rgba(200,0,0,0.25)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='rgba(200,0,0,0.18)';ctx.fill();
  ctx.fillStyle='rgba(180,0,0,0.4)';ctx.font='bold 13px Georgia';
  ctx.fillText('Q ?',phantom.x-28,phantom.y-10);
  
  // X through phantom
  ctx.strokeStyle='rgba(200,0,0,0.4)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(phantom.x-10,phantom.y-10);ctx.lineTo(phantom.x+10,phantom.y+10);ctx.stroke();
  ctx.beginPath();ctx.moveTo(phantom.x+10,phantom.y-10);ctx.lineTo(phantom.x-10,phantom.y+10);ctx.stroke();
}

drawScene();

// Proof steps
var steps=[
  {
    label:'Claim',
    text:'Two distinct lines ℓ₁ and ℓ₂ cannot intersect in more than one point.',
    note:''
  },
  {
    label:'Proof by contradiction.',
    text:'Suppose they do intersect at two distinct points P and Q.',
    note:'We assume the opposite of what we want to prove and look for a contradiction.'
  },
  {
    label:'Apply Postulate I.',
    text:'Postulate I states that through any two points, there is exactly one straight line. Since P and Q are two points, there is exactly one line through them.',
    note:'This is the key step. P I says one line — not two.'
  },
  {
    label:'Contradiction.',
    text:'But we assumed both ℓ₁ and ℓ₂ pass through P and Q. That gives two distinct lines through the same two points.',
    note:'Two lines, but Postulate I guarantees only one. This is the contradiction.'
  },
  {
    label:'Conclusion. □',
    text:'The assumption that two lines can meet at two points contradicts Postulate I. Therefore, two distinct lines intersect in at most one point.',
    note:'The □ symbol (or QED) marks the end of the proof.'
  }
];

var stepsEl=document.getElementById('proof-steps');

steps.forEach(function(step,i){
  var row=document.createElement('div');
  row.style.cssText='display:flex;gap:12px;padding:9px 0;border-bottom:1px solid #f0f0ee;align-items:flex-start;cursor:default;';
  
  var numEl=document.createElement('div');
  numEl.style.cssText='min-width:28px;height:28px;border-radius:14px;background:#1e3a5f;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px;flex-shrink:0;font-family:sans-serif;';
  numEl.textContent=i+1;
  
  var textEl=document.createElement('div');
  var labelEl=document.createElement('span');
  labelEl.style.cssText='font-weight:700;color:#1e3a5f;font-size:13px;';
  labelEl.textContent=step.label+' ';
  var bodyEl=document.createElement('span');
  bodyEl.style.cssText='font-size:13px;color:#374151;line-height:1.65;';
  bodyEl.textContent=step.text;
  textEl.appendChild(labelEl);
  textEl.appendChild(bodyEl);
  if(step.note){
    var noteEl=document.createElement('div');
    noteEl.style.cssText='font-size:11px;color:#9ca3af;margin-top:3px;font-style:italic;';
    noteEl.textContent=step.note;
    textEl.appendChild(noteEl);
  }
  
  row.appendChild(numEl);
  row.appendChild(textEl);
  stepsEl.appendChild(row);
});`,
      outputHeight: 600,
    },

    // ── The anatomy of a proof ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Anatomy of a Proof

The proof above — simple as it is — contains every ingredient that every proof in mathematics contains. Let's name them explicitly, because you will use this structure for the rest of your mathematical life.

**Claim.** A precisely stated proposition. Not "these angles are equal" but "vertical angles are equal." Not "the line is parallel" but "if a transversal crosses two parallel lines, the alternate interior angles are equal." Precision is not pedantry — vague claims cannot be proven or refuted.

**Given.** The assumptions in force for this specific proof. What are we starting with?

**Prove.** What exactly must we establish? State it before starting.

**Proof.** The logical sequence. Each step follows from previous steps, from the given, from the postulates, or from previously proven theorems. Each step cites its justification explicitly.

**QED (□).** The signal that the proof is complete.

There are two main proof strategies you'll encounter first:

**Direct proof:** start with the given, apply definitions and theorems step by step, and arrive at the conclusion. Most proofs in this chapter are direct.

**Proof by contradiction (reductio ad absurdum):** assume the opposite of what you want to prove, derive a contradiction, and conclude that the opposite must be true. The proof above used this strategy.

The discipline of writing a proof — choosing a strategy, stating justifications explicitly, not skipping steps — is the skill being developed. The geometry is the vehicle. The proof-writing is the destination.`,
    },

    // ── Visual 3 — Definitions interactive ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Definitions: The Other Building Blocks

Alongside postulates and undefined terms, geometry requires precise definitions. Unlike undefined terms (which we accept without definition) and postulates (which we accept without proof), definitions introduce new vocabulary by *exactly* describing combinations of existing concepts.

Click each definition to see how it builds on the undefined terms and earlier definitions.`,
      html: `<div id="defs" style="padding:14px;display:flex;flex-direction:column;gap:8px"></div>`,
      css: `body{margin:0;background:#fafaf8;font-family:Georgia,serif}`,
      startCode: `var defs=[
  {
    term:'Line Segment',
    symbol:'AB̄',
    def:'The set of all points on line AB that lie between (and including) points A and B.',
    depends:'Built from: Point (undefined), Line (undefined)',
    note:'A segment has a definite length. A line does not — it extends infinitely. This is a critical distinction for measurement.',
    color:'#1e3a5f'
  },
  {
    term:'Ray',
    symbol:'AB⃗',
    def:'The part of line AB that starts at point A and extends infinitely through B in one direction.',
    depends:'Built from: Point (undefined), Line (undefined)',
    note:'A ray has one endpoint and one infinite end. The naming convention matters: AB⃗ and BA⃗ are different rays pointing in opposite directions.',
    color:'#1a3a2a'
  },
  {
    term:'Angle',
    symbol:'∠ABC',
    def:'Two rays (AB⃗ and BC⃗) that share a common endpoint B. The angle is the "opening" between them.',
    depends:'Built from: Ray (defined above)',
    note:'The vertex of the angle is the shared endpoint B. The sides are the two rays. Angles are measured in degrees (°) or radians (rad).',
    color:'#3b2a1a'
  },
  {
    term:'Right Angle',
    symbol:'90°',
    def:'An angle equal to 90 degrees — one quarter of a full rotation.',
    depends:'Built from: Angle (defined above)',
    note:'By Postulate IV, all right angles are equal. A right angle is marked with a small square in diagrams.',
    color:'#2a1a3b'
  },
  {
    term:'Perpendicular Lines',
    symbol:'ℓ₁ ⊥ ℓ₂',
    def:'Two lines that intersect to form a right angle.',
    depends:'Built from: Line (undefined), Right Angle (defined above)',
    note:'Perpendicularity is a relationship between two lines — it requires both lines to be present. A single line is neither perpendicular nor non-perpendicular.',
    color:'#1a3a2a'
  },
  {
    term:'Parallel Lines',
    symbol:'ℓ₁ ∥ ℓ₂',
    def:'Two lines in the same plane that never intersect, no matter how far extended.',
    depends:'Built from: Line (undefined), Plane (undefined)',
    note:'Parallel lines require Postulate V (the Parallel Postulate) for most interesting results. This is why Postulate V is so significant — without it, you cannot prove much about parallel lines.',
    color:'#3a1a1a'
  }
];

var defsEl=document.getElementById('defs');

defs.forEach(function(d){
  var card=document.createElement('div');
  card.style.cssText='border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#fff;';
  
  var header=document.createElement('div');
  header.style.cssText='padding:12px 14px;cursor:pointer;display:flex;align-items:baseline;gap:10px;';
  header.innerHTML='<span style="font-weight:700;font-size:14px;color:'+d.color+'">'+d.term+'</span>'
    +'<span style="font-family:serif;font-size:13px;color:#9ca3af;font-style:italic">'+d.symbol+'</span>'
    +'<span style="margin-left:auto;font-size:11px;color:#94a3b8">click to expand ▾</span>';
  
  var body=document.createElement('div');
  body.style.cssText='padding:0 14px 12px;display:none;border-top:1px solid #f0f0ee;';
  body.innerHTML='<div style="font-size:13px;color:#374151;line-height:1.65;margin-top:10px;font-style:italic">'+d.def+'</div>'
    +'<div style="font-size:11px;color:#9ca3af;margin-top:6px;">'+d.depends+'</div>'
    +'<div style="font-size:12px;color:#64748b;margin-top:8px;padding:8px 10px;background:#fafaf8;border-radius:6px;border-left:3px solid '+d.color+'">'+d.note+'</div>';
  
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

What you just encountered — the axiomatic method — is the most powerful intellectual tool humanity has developed. Let me be concrete about why.

**It produces absolute certainty.** If the postulates are true and the logic is valid, the theorem is true. Not probably true, not true in all tested cases, but necessarily true. This kind of certainty is unavailable in science (which relies on evidence that could in principle be overturned), in philosophy (where premises are contestable), or in everyday argument (where ambiguity is everywhere).

**It made modern science possible.** When Newton wanted to establish mechanics on rigorous foundations, he modeled his *Principia Mathematica* directly on Euclid's *Elements*, presenting definitions, axioms, and theorems. Einstein's general relativity is expressed in the language of differential geometry — an axiomatic extension of Euclidean geometry. Maxwell's equations are derived from postulates. The physical sciences borrowed their logical structure from Euclid.

**It is the model for computer science.** Every formal logic system, every programming language type system, every cryptographic protocol is built on the axiomatic method. When you write a proof that an algorithm is correct, you are doing Euclidean geometry with different primitives.

**It forces precision.** The act of writing a proof — of having to state every step and its justification — reveals hidden assumptions. The discovery of non-Euclidean geometry happened because mathematicians tried to prove Postulate V from the others and instead discovered that it was independent. The attempt to prove revealed the truth.

In the next lesson, we will use this machinery to prove our first real result: that vertical angles are always equal. It takes two steps. Those two steps are your first proof.`,
    },

    // ── Challenge ──────────────────────────────────────────────────────────────
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
      successMessage: 'Correct. This is the deep point about axiomatic systems: every system must begin with assumptions that are accepted without proof. The choice of postulates is a choice of what to assume. "Obvious" and "provable from simpler assumptions" are different things. Two thousand years of mathematicians found Postulate V "obvious" — yet it is genuinely independent of the other four, as non-Euclidean geometry proves.',
      failMessage: 'The key insight is that postulates are not stated because they are provable, but because they are the unprovable starting points that everything else is built on. Postulate I is obvious, yes — that is intentional. Euclid chose the most obviously true statements he could find as his starting points precisely so that no one could reasonably object to them. But "obvious" and "provable" are different things entirely.',
      html: '', css: 'body{margin:0;padding:0;font-family:Georgia,serif}', startCode: '', outputHeight: 280,
    },

    {
      type: 'challenge',
      instruction: `Which of the following correctly identifies all three categories of geometric foundation introduced in this lesson?`,
      options: [
        { label: 'A', text: 'Theorems, proofs, and definitions' },
        { label: 'B', text: 'Undefined terms, postulates, and definitions — everything else (theorems) is derived from these using logic' },
        { label: 'C', text: 'Points, lines, and planes' },
        { label: 'D', text: 'Axioms, lemmas, and corollaries' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The three foundations are: (1) Undefined terms — point, line, plane — accepted intuitively without formal definition. (2) Postulates — statements accepted as true without proof. (3) Definitions — new concepts defined precisely in terms of earlier ones. Everything else is a theorem: a statement proven using logic from these foundations.',
      failMessage: 'Points, lines, and planes are the undefined terms — one category. Theorems, lemmas, and corollaries are all things proven from the foundations — not foundations themselves. The three foundational categories are: undefined terms (point, line, plane), postulates (the five axioms), and definitions (precise descriptions of new concepts). Theorems are derived, not assumed.',
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
    realWorldContext: 'Euclid\'s axiomatic method is the intellectual foundation of mathematics, formal logic, computer science, and physics. Every proof you write in any mathematical subject uses the structure Euclid established in 300 BCE.',
    previewVisualizationId: 'G1_1_FivePostulates',
  },
  intuition: {
    prose: [
      'Euclid built all of geometry from five postulates — statements so simple and obvious that everyone accepts them, yet sufficient to derive the entire body of Euclidean geometry.',
      'The three foundational categories: undefined terms (accepted intuitively), postulates (accepted without proof), and definitions (built from earlier concepts). Theorems are derived from these using logic.',
      '"Obvious" is not the same as "provable." The fifth postulate looked obvious for 2,000 years — then non-Euclidean geometry proved it was genuinely independent.',
    ],
    callouts: [
      { type: 'important', title: 'The axiomatic method', body: 'Start with the smallest possible set of accepted assumptions (postulates). Derive everything else by pure logic. This produces absolute certainty — not empirical probability, not expert consensus, but logical necessity.' },
    ],
    visualizations: [{ id: 'G1_1_FivePostulates', title: "Euclid's Five Postulates" }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Undefined terms (point, line, plane): accepted intuitively, never formally defined.',
    'Postulates: accepted as true without proof — the axioms.',
    'Definitions: new concepts defined exactly from prior ones.',
    'Theorems: derived by logic from the above. Every step must be justified.',
    'Proof by contradiction: assume the opposite, derive a contradiction, conclude the original is true.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_GEO_1_1 };
