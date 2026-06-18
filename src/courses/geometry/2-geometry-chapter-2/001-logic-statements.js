// Geometry · Chapter 2 · Lesson 1
// Logic and Statements

const LESSON_GEO_2_1_LOGIC = {
  title: "Logic and Statements",
  subtitle:
    "The grammar of mathematical certainty — how geometry converts informal observations into airtight arguments.",
  sequential: true,

  cells: [
    {
      type: "markdown",
      instruction: `### The Language Underneath Every Proof

Before a geometer can prove anything, they need a precise language. Natural language — English, French, mathematics-as-spoken — is too ambiguous. "The line is long." "The angles are about equal." "Obviously the triangles match." None of these can appear in a proof. A proof demands statements that are unambiguously true or false, connected by logical operations that preserve truth.

This is what logic provides: a formal grammar for making and combining exact claims.

Consider the statement: "If two lines are parallel and cut by a transversal, then alternate interior angles are equal."

This is not just a geometric observation. It has a precise logical structure: a **conditional** statement with a hypothesis ("two lines are parallel and cut by a transversal") and a conclusion ("alternate interior angles are equal"). Understanding that structure is what lets you:

- Identify exactly what you're assuming and what you're proving
- Recognize when the converse is a different (and not automatically true) claim
- Write the contrapositive — which is logically equivalent and sometimes easier to prove
- Determine what a counterexample would look like

Every theorem in geometry has this structure. Learning to read and manipulate logical statements is not a detour from geometry — it is the foundation of what makes geometry mathematics rather than observation.`,
    },

    {
      type: "markdown",
      instruction: `### Propositions: The Atoms of Logic

A **proposition** is a statement that is either true or false — not both, not neither, not "it depends."

**Valid propositions:**
- "Triangle ABC is equilateral." (Either it is or it isn't.)
- "The sum of angles in any triangle equals 180°." (True, in Euclidean geometry.)
- "5 is an even number." (False, but a proposition — it has a definite truth value.)
- "AB is longer than CD." (True or false depending on the specific segments.)

**Not propositions:**
- "This statement is false." (A paradox — has no consistent truth value.)
- "Draw the perpendicular bisector of AB." (A command, not a claim.)
- "Is AB parallel to CD?" (A question, not a claim.)
- "x > 3." (Neither true nor false without knowing x — this is a **predicate**, not a proposition.)

The truth or falsity of a proposition is called its **truth value**: T (true) or F (false).

In geometry, the propositions you work with are geometric claims about specific figures or about all figures satisfying certain conditions. The job of a proof is to show that a particular geometric proposition is true — not just plausible, not just likely from examples, but logically necessary given the axioms and prior theorems.`,
    },

    // ── Visual 1 — Proposition identifier ────────────────────────────────────
    {
      type: "js",
      instruction: `### Is It a Proposition? Classify each statement.

Click each statement to reveal whether it is a proposition and, if so, its truth value. Understanding what counts as a proposition is the first step in writing precise geometric claims.`,
      html: `<div id="prop-cards" style="padding:14px;display:flex;flex-direction:column;gap:8px"></div>
<div id="prop-feedback" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7;min-height:44px;color:var(--color-text-secondary, #475569)">Click any statement to classify it.</div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}`,
      startCode: `var items=[
  {text:'"Every equilateral triangle is equiangular."',
   isProp:true,truth:'True',
   explain:'A valid proposition. Provable from the Isosceles Triangle Theorem applied twice. Definitely true.'},
  {text:'"Construct the midpoint of segment AB."',
   isProp:false,truth:null,
   explain:'Not a proposition — it\'s a command. Commands cannot be true or false.'},
  {text:'"∠A = 47°."',
   isProp:true,truth:'Depends on the specific angle',
   explain:'A valid proposition about a specific angle. It has a definite truth value once the angle is identified — we just don\'t know it without more information.'},
  {text:'"Some triangles have four sides."',
   isProp:true,truth:'False',
   explain:'A valid proposition — clearly false, since triangles by definition have exactly three sides. False propositions are still propositions.'},
  {text:'"Is AB perpendicular to CD?"',
   isProp:false,truth:null,
   explain:'Not a proposition — it\'s a question. Questions invite answers; they do not themselves make claims with truth values.'},
  {text:'"If AB = CD and CD = EF, then AB = EF."',
   isProp:true,truth:'True',
   explain:'A valid proposition — true by the Transitive Property of Equality. This is also a conditional statement (If...then) whose truth can be verified logically.'},
  {text:'"This triangle is beautiful."',
   isProp:false,truth:null,
   explain:'Not a proposition in the logical sense — "beautiful" is a subjective judgment without a definite truth value. Logic requires objective, verifiable claims.'},
  {text:'"For all triangles ABC, m∠A + m∠B + m∠C = 180°."',
   isProp:true,truth:'True (in Euclidean geometry)',
   explain:'A universal proposition — it claims something holds for all triangles. True in Euclidean geometry (proved from the Parallel Postulate). Would be false in spherical geometry.'},
];

var cardsEl=document.getElementById('prop-cards'),feedbackEl=document.getElementById('prop-feedback');

items.forEach(function(item,i){
  var card=document.createElement('div');
  card.style.cssText='border:1.5px solid var(--color-border-primary, #e2e8f0);border-radius:8px;padding:10px 14px;cursor:pointer;background:var(--color-background-primary, #ffffff);display:flex;align-items:center;gap:10px;transition:all .15s;';

  var numEl=document.createElement('div');
  numEl.style.cssText='min-width:22px;height:22px;border-radius:11px;background:#e2e8f0;color:var(--color-text-secondary, #475569);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:sans-serif;';
  numEl.textContent=i+1;

  var textEl=document.createElement('div');
  textEl.style.cssText='font-size:13px;color:var(--color-text-primary, #1e293b);flex:1;font-family:Georgia,serif;font-style:italic;';
  textEl.textContent=item.text;

  var badgeEl=document.createElement('div');
  badgeEl.style.cssText='font-size:10px;font-weight:700;padding:2px 9px;border-radius:10px;flex-shrink:0;opacity:0;transition:opacity .2s;font-family:sans-serif;';
  if(item.isProp){
    badgeEl.textContent='PROPOSITION';
    badgeEl.style.background='#dbeafe';badgeEl.style.color='#1e40af';
  } else {
    badgeEl.textContent='NOT A PROPOSITION';
    badgeEl.style.background='#fee2e2';badgeEl.style.color='#991b1b';
  }

  card.appendChild(numEl);card.appendChild(textEl);card.appendChild(badgeEl);

  var revealed=false;
  card.onclick=function(){
    revealed=!revealed;
    badgeEl.style.opacity=revealed?'1':'0';
    card.style.borderColor=revealed?(item.isProp?'#93c5fd':'#fca5a5'):'#e2e8f0';
    card.style.background=revealed?(item.isProp?'#eff6ff':'#fef2f2'):'#fff';
    feedbackEl.innerHTML=revealed
      ?'<strong style="color:'+(item.isProp?'#1e40af':'#991b1b')+'">'+(item.isProp?'Proposition':'Not a proposition')+'.</strong> '
        +(item.truth?'Truth value: <strong>'+item.truth+'</strong>. ':'')+item.explain
      :'Click any statement to classify it.';
  };
  cardsEl.appendChild(card);
});`,
      outputHeight: 480,
    },

    {
      type: "markdown",
      instruction: `### Conditional Statements: The Heart of Every Theorem

Almost every theorem in geometry is a **conditional statement** — an "if-then" claim. Understanding the logical anatomy of conditionals is essential.

**The conditional P → Q** ("if P then Q") has two parts:
- **Hypothesis (antecedent):** P — the "if" part. The condition being assumed.
- **Conclusion (consequent):** Q — the "then" part. What we claim follows from the condition.

**Example:** "If two sides of a triangle are equal, then the angles opposite those sides are equal."
- Hypothesis P: "Two sides of a triangle are equal."
- Conclusion Q: "The angles opposite those sides are equal."

The conditional P → Q is false only when P is true and Q is false — when the hypothesis is met but the conclusion fails. Every other combination makes the conditional true (including when the hypothesis is false — the conditional is "vacuously" true, because the promise was never invoked).

**The three related conditionals:**

| Name | Form | Logical relation to P → Q |
|---|---|---|
| Original | P → Q | — |
| Converse | Q → P | Not equivalent |
| Inverse | ¬P → ¬Q | Not equivalent |
| Contrapositive | ¬Q → ¬P | **Logically equivalent** |

The contrapositive is always logically equivalent to the original. If P → Q is true, then ¬Q → ¬P is true, and vice versa. This is the foundation of proof by contrapositive.

The converse is a different statement and may have a different truth value. "If the base angles of a triangle are equal, then the two sides opposite them are equal" is the converse of the Isosceles Triangle Theorem — and it happens to also be true. But "If the angles of a quadrilateral sum to 360°, it is a rectangle" is a converse that is false (any quadrilateral has angles summing to 360°, but most aren't rectangles).

A theorem whose converse is also true is called a **biconditional**: P ↔ Q ("P if and only if Q," abbreviated "P iff Q").`,
    },

    // ── Visual 2 — Conditional and its relatives ──────────────────────────────
    {
      type: "js",
      instruction: `### The Four Forms of a Conditional

Select any theorem below to see its original form, converse, inverse, and contrapositive. For each form, determine whether it is true or false — the results will surprise you.`,
      html: `<div style="padding:8px 14px 0;background:var(--color-background-secondary, #f8fafc);display:flex;gap:8px;flex-wrap:wrap" id="thm-sel"></div>
<canvas id="cv" width="700" height="280"></canvas>
<div id="cond-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}canvas{display:block}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var W=cv.width,H=cv.height;

var theorems=[
  {
    name:'Isosceles Triangle',
    P:'Two sides of a triangle are equal',
    Q:'The base angles are equal',
    original_true:true,
    converse_true:true,
    is_bicon:true,
    converse_note:'Also true — this is the Isosceles Triangle Theorem Converse. Both directions hold → biconditional.',
    original_note:'The Isosceles Triangle Theorem. Proved by SSS using the median to the base.',
  },
  {
    name:'Right Angle',
    P:'Two lines are perpendicular',
    Q:'They form a 90° angle',
    original_true:true,
    converse_true:true,
    is_bicon:true,
    original_note:'Definition of perpendicular — this is literally what perpendicular means.',
    converse_note:'Also true by definition — if they form a 90° angle, they are perpendicular.',
  },
  {
    name:'Quadrilateral Angles',
    P:'A quadrilateral is a rectangle',
    Q:'Its angles sum to 360°',
    original_true:true,
    converse_true:false,
    is_bicon:false,
    original_note:'True — all rectangles have four 90° angles, summing to 360°.',
    converse_note:'FALSE. All quadrilaterals have angles summing to 360°, but most are not rectangles. A parallelogram, trapezoid, or random quadrilateral also sums to 360°.',
  },
  {
    name:'Parallel Lines',
    P:'Two lines are parallel',
    Q:'Alternate interior angles are equal when cut by a transversal',
    original_true:true,
    converse_true:true,
    is_bicon:true,
    original_note:'The Alternate Interior Angles Theorem.',
    converse_note:'Also true — the Converse of the Alternate Interior Angles Theorem. Equal alternate interior angles guarantee parallelism.',
  },
];

var selected=0;
var selEl=document.getElementById('thm-sel');
var btns=[];
theorems.forEach(function(t,i){
  var btn=document.createElement('button');
  btn.textContent=t.name;
  btn.style.cssText='padding:5px 12px;border-radius:7px;border:1.5px solid #1e3a5f;'+(i===0?'background:#1e3a5f22;color:#1e3a5f':'background:transparent;color:rgba(55,65,81,0.5)')+';font-family:Georgia,serif;font-size:12px;font-weight:700;cursor:pointer;';
  btn.onclick=function(){
    selected=i;
    btns.forEach(function(b,j){b.style.background=j===i?'#1e3a5f22':'transparent';b.style.color=j===i?'#1e3a5f':'rgba(55,65,81,0.5)';});
    render();
  };
  selEl.appendChild(btn);btns.push(btn);
});

function render(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fafaf8';ctx.fillRect(0,0,W,H);
  var t=theorems[selected];

  var forms=[
    {name:'Original',form:'P → Q',P:t.P,Q:t.Q,isTrue:t.original_true,note:t.original_note,color:'#1e3a5f'},
    {name:'Converse',form:'Q → P',P:t.Q,Q:t.P,isTrue:t.converse_true,note:t.converse_note,color:'#1a3a2a'},
    {name:'Inverse',form:'¬P → ¬Q',P:'NOT: '+t.P,Q:'NOT: '+t.Q,isTrue:t.original_true===t.converse_true,note:'The inverse has the same truth value as the converse (both are contrapositives of each other).',color:'#92400e'},
    {name:'Contrapositive',form:'¬Q → ¬P',P:'NOT: '+t.Q,Q:'NOT: '+t.P,isTrue:t.original_true,note:'Always has the same truth value as the original. Proving the contrapositive proves the original.',color:'#7c3aed'},
  ];

  var colW=W/4-8,rowH=H-20,startY=16;

  forms.forEach(function(f,i){
    var x=i*(colW+10)+6;
    ctx.fillStyle=f.isTrue?'rgba(26,58,42,0.08)':'rgba(220,38,38,0.06)';
    ctx.beginPath();ctx.roundRect(x,startY,colW,rowH,8);ctx.fill();
    ctx.strokeStyle=f.isTrue?'#86efac':'#fca5a5';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(x,startY,colW,rowH,8);ctx.stroke();

    ctx.fillStyle=f.color;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    ctx.fillText(f.name,x+colW/2,startY+18);
    ctx.fillStyle='#64748b';ctx.font='11px Georgia';
    ctx.fillText(f.form,x+colW/2,startY+32);

    // Truth badge
    ctx.fillStyle=f.isTrue?'#dcfce7':'#fee2e2';
    ctx.beginPath();ctx.roundRect(x+colW/2-24,startY+38,48,18,6);ctx.fill();
    ctx.fillStyle=f.isTrue?'#166534':'#991b1b';ctx.font='bold 10px sans-serif';
    ctx.fillText(f.isTrue?'TRUE':'FALSE',x+colW/2,startY+50);

    // P and Q text (wrapped)
    function wrapText(text,mx,my,maxW,lineH){
      var words=text.split(' '),line='';
      var lines=[];
      words.forEach(function(w){
        var test=line+w+' ';
        if(ctx.measureText(test).width>maxW&&line!==''){lines.push(line.trim());line=w+' ';}
        else line=test;
      });
      if(line.trim())lines.push(line.trim());
      lines.forEach(function(l,li){ctx.fillText(l,mx,my+li*lineH);});
      return lines.length;
    }

    ctx.fillStyle='#1e3a5f';ctx.font='10px Georgia';ctx.textAlign='center';
    ctx.fillText('If:',x+colW/2,startY+72);
    ctx.fillStyle='#374151';ctx.font='10px Georgia';
    var n1=wrapText(f.P,x+colW/2,startY+84,colW-12,13);

    ctx.fillStyle='#1a3a2a';ctx.font='10px Georgia';
    ctx.fillText('Then:',x+colW/2,startY+84+n1*13+8);
    ctx.fillStyle='#374151';
    wrapText(f.Q,x+colW/2,startY+84+n1*13+20,colW-12,13);

    // Equivalence markers
    if(i===0||i===3){
      ctx.fillStyle='#7c3aed';ctx.font='bold 9px sans-serif';
      ctx.fillText('EQUIVALENT',x+colW/2,startY+rowH-8);
    }
    if(i===1||i===2){
      ctx.fillStyle='#92400e';ctx.font='bold 9px sans-serif';
      ctx.fillText('EQUIVALENT',x+colW/2,startY+rowH-8);
    }
  });

  // Equivalence bracket between 0 and 3
  ctx.strokeStyle='#7c3aed';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(6,H-6);ctx.lineTo(colW+6,H-6);ctx.stroke();
  ctx.beginPath();ctx.moveTo(3*(colW+10)+6,H-6);ctx.lineTo(4*(colW+10)-4,H-6);ctx.stroke();
  ctx.setLineDash([]);

  // Biconditional note
  var infoEl=document.getElementById('cond-info');
  infoEl.innerHTML=(t.is_bicon
    ?'<strong style="color:#1a3a2a">This theorem is a biconditional (P ↔ Q).</strong> Both the original and its converse are true. The theorem can be stated "P if and only if Q."'
    :'<strong style="color:#dc2626">The converse is FALSE.</strong> The original theorem is true, but the converse is not. This is why you cannot assume a theorem\'s converse is automatically valid — it requires a separate proof.')
    +'<br>Hover over the cards to explore. Original ↔ Contrapositive (always equivalent). Converse ↔ Inverse (always equivalent, but different from the original).';
}
render();`,
      outputHeight: 360,
    },

    {
      type: "markdown",
      instruction: `### Quantifiers: Statements About All or Some

Geometric theorems are rarely about a single specific triangle or line. They make claims about *every* triangle satisfying certain conditions, or about the *existence* of some geometric object. These are **quantified statements**.

**Universal quantifier ∀ ("for all"):** Claims the property holds for every object in the domain.

"For all triangles, the angle sum equals 180°." → ∀ triangles T, angle_sum(T) = 180°.

To **prove** a universal statement, you cannot check every case (there are infinitely many triangles). You must construct a general argument — a proof that works for an *arbitrary* triangle representing all triangles.

To **disprove** a universal statement, you need only a single **counterexample** — one case where the property fails.

**Existential quantifier ∃ ("there exists"):** Claims at least one object in the domain has the property.

"There exists a triangle with all angles equal." → ∃ triangle T such that all angles of T are equal.

To **prove** an existential statement, you only need to exhibit one example (the equilateral triangle).

To **disprove** an existential statement, you must show that *no* object has the property — a universal claim.

**Negating quantified statements:**

¬(∀x, P(x)) = ∃x, ¬P(x) — "Not all x satisfy P" means "some x fails P."

¬(∃x, P(x)) = ∀x, ¬P(x) — "No x satisfies P" means "every x fails P."

This is why a single counterexample destroys a "for all" claim: finding one triangle whose angles don't sum to 180° would disprove the Triangle Angle Sum Theorem. (On a sphere, such triangles exist — which is why the theorem only holds in Euclidean geometry, where the Parallel Postulate is in force.)`,
    },

    {
      type: "markdown",
      instruction: `### Definitions: The Precision Engine

In everyday speech, definitions are optional. In mathematics, definitions are mandatory and exact. A geometric definition establishes a term with complete precision — no more, no less than what is stated.

**The anatomy of a good definition:**

1. Names the term being defined.
2. States the class it belongs to.
3. Gives the distinguishing properties that separate it from other members of that class.

"A **right triangle** is a triangle in which one interior angle measures exactly 90°."

- Class: triangle
- Distinguishing property: one interior angle = 90°

**Definitions are biconditionals.** If X satisfies the definition of a right triangle, then X is a right triangle. If X is a right triangle, then X satisfies the definition. The word "is" in a definition always means "if and only if."

This is why definitions can be used in proofs in both directions:
- Forward: "Since △ABC is a right triangle, one angle equals 90°."
- Backward: "Since ∠C = 90°, △ABC is a right triangle."

**The danger of imprecise definitions:** "A large angle is one that is big." This is circular (what does "big" mean?), subjective, and unusable in a proof. Mathematical definitions must be stated in terms of previously defined concepts and measured quantities.

**The hierarchy of definitions:** You can only define a new term using terms that have already been defined or explicitly designated as undefined (primitive). This creates a definition hierarchy — every geometric concept traces back to the undefined primitives: point, line, plane.`,
    },

    // ── Visual 3 — Definitions as biconditionals ──────────────────────────────
    {
      type: "js",
      instruction: `### Using Definitions in Both Directions

Definitions are biconditionals. The interactive below shows how the same definition is used in the forward direction (from term to property) and the backward direction (from property to term) in geometric proofs.`,
      html: `<div id="def-cards" style="padding:14px;display:flex;flex-direction:column;gap:10px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}`,
      startCode: `var defs=[
  {
    term:'Midpoint',
    def:'M is the midpoint of AB if and only if M lies on AB and AM = MB.',
    forward:{scenario:'△ABM ≅ △CBM is given.',use:'Since M is the midpoint of AC, AM = MC (Definition of Midpoint — forward direction).'},
    backward:{scenario:'We have proved that DM = ME.',use:'Since DM = ME and M lies on DE, M is the midpoint of DE (Definition of Midpoint — backward direction).'},
    color:'#1e3a5f'
  },
  {
    term:'Isosceles Triangle',
    def:'△ABC is isosceles if and only if it has at least two equal sides.',
    forward:{scenario:'We are given that △PQR is isosceles with PQ = PR.',use:'Since △PQR is isosceles (with PQ = PR), we know two sides are equal (Definition of Isosceles Triangle — forward direction). We can now apply the Isosceles Triangle Theorem to conclude ∠Q = ∠R.'},
    backward:{scenario:'We have proved that XY = XZ in △XYZ.',use:'Since XY = XZ (two equal sides), △XYZ is isosceles (Definition of Isosceles Triangle — backward direction).'},
    color:'#1a3a2a'
  },
  {
    term:'Perpendicular Lines',
    def:'Two lines are perpendicular if and only if they intersect to form a right angle (90°).',
    forward:{scenario:'Line ℓ ⊥ line m is given.',use:'Since ℓ ⊥ m, the angle at their intersection = 90° (Definition of Perpendicular Lines — forward direction).'},
    backward:{scenario:'We have proved that ∠ABC = 90°.',use:'Since BA and BC meet at a right angle, BA ⊥ BC (Definition of Perpendicular Lines — backward direction).'},
    color:'#92400e'
  },
];

var container=document.getElementById('def-cards');
defs.forEach(function(d){
  var card=document.createElement('div');
  card.style.cssText='border:1px solid var(--color-border-primary, #e2e8f0);border-radius:10px;overflow:hidden;background:var(--color-background-primary, #ffffff);';

  var header=document.createElement('div');
  header.style.cssText='padding:10px 14px;background:'+d.color+'18;border-bottom:1px solid var(--color-border-primary, #e2e8f0);';
  header.innerHTML='<div style="font-weight:700;font-size:14px;color:'+d.color+'">'+d.term+'</div>'
    +'<div style="font-size:12px;font-style:italic;color:var(--color-text-primary, #1e293b);margin-top:3px">'+d.def+'</div>';

  var body=document.createElement('div');
  body.style.cssText='padding:10px 14px;display:grid;grid-template-columns:1fr 1fr;gap:10px;';

  var fw=document.createElement('div');
  fw.style.cssText='padding:8px 10px;background:#eff6ff;border-radius:7px;border-left:3px solid '+d.color+';';
  fw.innerHTML='<div style="font-size:11px;font-weight:700;color:'+d.color+';margin-bottom:4px;font-family:sans-serif">→ FORWARD: Term to Property</div>'
    +'<div style="font-size:11px;color:var(--color-text-secondary, #475569);margin-bottom:4px;font-style:italic">Scenario: '+d.forward.scenario+'</div>'
    +'<div style="font-size:12px;color:var(--color-text-primary, #1e293b);line-height:1.6">'+d.forward.use+'</div>';

  var bk=document.createElement('div');
  bk.style.cssText='padding:8px 10px;background:#f0fdf4;border-radius:7px;border-left:3px solid '+d.color+';';
  bk.innerHTML='<div style="font-size:11px;font-weight:700;color:'+d.color+';margin-bottom:4px;font-family:sans-serif">← BACKWARD: Property to Term</div>'
    +'<div style="font-size:11px;color:var(--color-text-secondary, #475569);margin-bottom:4px;font-style:italic">Scenario: '+d.backward.scenario+'</div>'
    +'<div style="font-size:12px;color:var(--color-text-primary, #1e293b);line-height:1.6">'+d.backward.use+'</div>';

  body.appendChild(fw);body.appendChild(bk);
  card.appendChild(header);card.appendChild(body);
  container.appendChild(card);
});`,
      outputHeight: 460,
    },

    {
      type: "markdown",
      instruction: `### Logical Connectives in Geometric Statements

Complex geometric propositions combine simpler ones using **logical connectives**. Understanding these is essential for reading theorems and writing proofs correctly.

**AND (∧):** Both must hold. "AB = CD and ∠A = ∠D" is true only if both equalities hold simultaneously. To prove a conjunction, you must establish both components.

**OR (∨):** At least one must hold (inclusive or). "The triangle is acute or right" means at least one condition is satisfied. In geometry, OR appears most often in case analysis: "the angle is obtuse or it is not obtuse." These cases are exhaustive and mutually exclusive.

**NOT (¬):** The negation. "AB is not parallel to CD" = ¬(AB ∥ CD). Negation reverses the truth value.

**IF-THEN (→):** The conditional, discussed above. "If AB bisects CD, then AM = MC."

**IFF (↔):** Biconditional — both directions. "M is the midpoint of AB if and only if AM = MB and M lies on AB." Used in definitions and in theorems where the converse is also true.

**De Morgan's Laws** — essential for manipulating negations of AND and OR:

¬(P ∧ Q) ≡ ¬P ∨ ¬Q: "Not both P and Q" means "P is false or Q is false."

¬(P ∨ Q) ≡ ¬P ∧ ¬Q: "Neither P nor Q" means "P is false and Q is false."

These appear whenever you need to negate a complex condition — for instance, in proof by contradiction when you assume the negation of the conclusion, which may be a conjunction.

**Example:** The converse of "If AB ∥ CD and AB = CD, then ABCD is a parallelogram" would require proving that ABCD is a parallelogram implies both AB ∥ CD and AB = CD. Negating the conclusion gives ¬(AB ∥ CD ∧ AB = CD) = ¬(AB ∥ CD) ∨ ¬(AB = CD). A counterexample must show that at least one of the two conditions fails.`,
    },

    // ── Challenges ────────────────────────────────────────────────────────────
    {
      type: "challenge",
      instruction: `Consider the theorem: "If a quadrilateral is a square, then its diagonals are perpendicular." Write the converse, inverse, and contrapositive. Which of the four statements are true?`,
      options: [
        {
          label: "A",
          text: 'Converse: "If diagonals are perpendicular, it is a square." (FALSE — a rhombus also has perpendicular diagonals). Contrapositive: "If diagonals are not perpendicular, it is not a square." (TRUE — equivalent to original). All four are true.',
        },
        {
          label: "B",
          text: "Original: TRUE. Converse: FALSE (rhombus has perpendicular diagonals but is not a square). Contrapositive: TRUE (equivalent to original). Inverse: FALSE (equivalent to converse).",
        },
        {
          label: "C",
          text: "All four are true because squares have special properties.",
        },
        {
          label: "D",
          text: "The converse and original are always the same for geometric theorems.",
        },
      ],
      check: (label) => label === "B",
      successMessage:
        "Correct. Original (P→Q): TRUE. A square's diagonals are perpendicular. Converse (Q→P): FALSE. A rhombus has perpendicular diagonals but is not a square (its angles aren't necessarily 90°). Contrapositive (¬Q→¬P): TRUE — always equivalent to the original. Inverse (¬P→¬Q): FALSE — equivalent to the converse. The rhombus is the key counterexample: it disproves both the converse and the inverse.",
      failMessage:
        'Work through each form. Original: "square → perpendicular diagonals" — TRUE (provable). Converse: "perpendicular diagonals → square" — FALSE: a rhombus has perpendicular diagonals but needn\'t be a square (it may have non-right angles). Contrapositive: "diagonals not perpendicular → not a square" — TRUE (equivalent to original). Inverse: "not square → diagonals not perpendicular" — FALSE (same truth value as converse; a rhombus disproves it).',
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },

    {
      type: "challenge",
      instruction: `A student tries to disprove the statement "All isosceles triangles have at least one angle measuring 60°" by arguing: "I can't find a counterexample, so it must be true." Evaluate this reasoning.`,
      options: [
        {
          label: "A",
          text: "The reasoning is valid — failure to find a counterexample is strong evidence for truth.",
        },
        {
          label: "B",
          text: "The reasoning is invalid. To prove a universal statement requires a proof, not failure to find a counterexample. To disprove it requires one counterexample. Consider an isosceles triangle with angles 80°-80°-20° — no 60° angle. This counterexample disproves the statement.",
        },
        {
          label: "C",
          text: "The reasoning is invalid because all triangles have 60° angles.",
        },
        {
          label: "D",
          text: "The reasoning is valid for geometric statements specifically.",
        },
      ],
      check: (label) => label === "B",
      successMessage:
        "Correct. The student commits a fundamental logical error: absence of a counterexample is not proof of truth. There are infinitely many isosceles triangles, and the student hasn't checked them all. A specific counterexample: an isosceles triangle with legs meeting at 20° has base angles of (180°-20°)/2 = 80°. Its angles are 80°, 80°, 20° — none equal to 60°. One counterexample is sufficient to disprove the universal claim.",
      failMessage:
        'The reasoning is invalid. To disprove a universal statement "All X have property P," you only need one counterexample. An isosceles triangle with apex angle 20° has base angles of 80°, giving angles 80°-80°-20°. None equals 60°. This single counterexample disproves the claim. Failure to find a counterexample is not a proof — it could mean the claim is true, or it could mean you haven\'t looked hard enough.',
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },

    {
      type: "challenge",
      instruction: `You are proving: "If ∠A and ∠B are supplementary and ∠B and ∠C are supplementary, then ∠A = ∠C." Which logical property most directly justifies the conclusion after you have established m∠A + m∠B = 180° and m∠B + m∠C = 180°?`,
      options: [
        { label: "A", text: "Reflexive Property — ∠A = ∠A." },
        {
          label: "B",
          text: "Substitution and Subtraction Property of Equality: from m∠A + m∠B = 180° and m∠B + m∠C = 180°, set the left sides equal (both = 180°), giving m∠A + m∠B = m∠B + m∠C. Subtract m∠B from both sides: m∠A = m∠C.",
        },
        { label: "C", text: "Definition of supplementary angles." },
        { label: "D", text: "Vertical Angles Theorem." },
      ],
      check: (label) => label === "B",
      successMessage:
        'Correct. The chain of reasoning: (1) m∠A + m∠B = 180° and m∠B + m∠C = 180° (given/definition of supplementary). (2) m∠A + m∠B = m∠B + m∠C (Substitution — both equal 180°, so they equal each other). (3) m∠A = m∠C (Subtraction Property of Equality — subtract m∠B from both sides). This is the standard proof that "supplements of the same angle are equal."',
      failMessage:
        "From m∠A + m∠B = 180° and m∠B + m∠C = 180°: since both left sides equal 180°, they equal each other: m∠A + m∠B = m∠B + m∠C (Substitution Property). Subtract m∠B from both sides (Subtraction Property of Equality): m∠A = m∠C. The key steps are substitution (to set the two expressions equal) and the subtraction property (to eliminate the common term).",
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },
  ],
};

export default {
  id: "geo-2-1-logic",
  slug: "logic-statements",
  chapter: "geometry-2",
  order: 1,
  title: "Logic and Statements",
  subtitle:
    "The grammar of mathematical certainty — how geometry converts informal observations into airtight arguments.",
  tags: [
    "geometry",
    "logic",
    "conditional-statements",
    "propositions",
    "contrapositive",
    "converse",
    "quantifiers",
    "definitions",
  ],
  hook: {
    question:
      'How does geometry convert "it looks obvious" into "it must be true"?',
    realWorldContext:
      "Every theorem in geometry is a conditional statement with precise logical structure. Understanding conditionals, their converses, and quantifiers is what separates geometric proof from geometric observation.",
    previewVisualizationId: "G2_3_Constructions",
  },
  intuition: {
    prose: [
      "A proposition has a definite truth value (T or F). Not all sentences are propositions.",
      "Every theorem is a conditional P → Q. The converse (Q → P) is NOT automatically true. The contrapositive (¬Q → ¬P) IS equivalent.",
      "Quantifiers: ∀ (for all) — requires general proof; one counterexample destroys it. ∃ (there exists) — one example suffices.",
      "Definitions are biconditionals: usable in both directions in proofs.",
      "Logical connectives: AND, OR, NOT, IF-THEN, IFF. De Morgan: ¬(P∧Q) = ¬P∨¬Q.",
    ],
    callouts: [
      {
        type: "important",
        title: "Converse ≠ Original",
        body: 'The converse of a true theorem is NOT automatically true. It requires a separate proof. If both directions are true, the theorem is a biconditional (P iff Q). A rhombus disproves "perpendicular diagonals iff square."',
      },
    ],
    visualizations: [
      {
        id: "ScienceNotebook",
        title: "Logic and Statements",
        props: { lesson: LESSON_GEO_2_1_LOGIC },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    "Proposition: a statement with a definite T/F value. Commands and questions are not propositions.",
    "Conditional P→Q: false only when P=T and Q=F. Contrapositive ¬Q→¬P always equivalent.",
    "Converse Q→P: different claim, needs separate proof. Biconditional when both directions hold.",
    "∀: one counterexample destroys it. ∃: one example proves it.",
    "Definitions are biconditionals — always usable forward (term→property) and backward (property→term).",
  ],
  checkpoints: ["read-intuition"],
  quiz: [],
};

export { LESSON_GEO_2_1_LOGIC };
