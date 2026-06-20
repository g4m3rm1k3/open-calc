// Geometry · Chapter 2 · Lesson 3
// Introduction to Proofs

const LESSON_GEO_2_3 = {
  title: "Introduction to Proofs",
  subtitle:
    "What a proof actually is, why it matters, and how to write one from scratch.",
  sequential: true,

  cells: [
    // ── Opening ────────────────────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### The Difference Between Knowing and Proving

You know that the sum of the first n odd numbers is n². Check it: 1 = 1². 1+3 = 4 = 2². 1+3+5 = 9 = 3². 1+3+5+7 = 16 = 4². It works every time you try.

Do you know it's true for n = 1,000,000?

You haven't checked that. And you can't — you'd need to add a million numbers. What you have is strong evidence from a few cases. But in mathematics, evidence is not proof. Proof is a logical argument that leaves no case unchecked — not by checking them all, but by constructing a chain of logic that is valid for all cases simultaneously.

Here is a proof that 1 + 3 + 5 + ⋯ + (2n−1) = n²:

Arrange n² dots in an n×n square. The first odd number (1) is the top-left corner. The second odd number (3) is the two-sided L-shape wrapping around it. The third (5) is the next L-shape. Each L-shape adds 2k−1 dots to the previous (k−1)×(k−1) square to form a k×k square. So the sum of the first n odd numbers equals the area of the n×n square = n².

That argument covers every n simultaneously. It doesn't check cases — it explains the structure that makes it necessarily true.

This is what proof is: not checking examples, but revealing the structure.`,
    },

    // ── What is a proof ────────────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### What a Proof Is — and What It Isn't

A **mathematical proof** is a finite sequence of statements, where each statement is either:
1. A given (something assumed or stated in the problem)
2. A definition (the precise meaning of a term)
3. A previously proven theorem
4. An axiom/postulate
5. A logical consequence of previous statements

The final statement in the sequence is the conclusion — the thing you wanted to prove.

Every step must be explicitly justified. "It's obvious" is not a justification. "I can see it from the diagram" is not a justification. The diagram is a visual aid; the proof is the logical argument.

**What a proof is not:**

*Not a calculation.* A calculation is a sequence of algebraic manipulations. It might constitute a proof if every step is justified — but a bare calculation with no words explaining what you're doing is not a proof.

*Not a demonstration.* Demonstrating that something works for 10,000 cases is a demonstration, not a proof. The 10,001st case might fail.

*Not an explanation.* An explanation tells you why something is true intuitively. A proof shows that it must be true logically. Good proofs do both — but intuition and logic serve different purposes.

*Not an argument from authority.* "Newton believed this, therefore it is true" is authority. Mathematics does not accept authority — only proof. (Newton was sometimes wrong.)

**The test:** A valid proof should convince a logically perfect reader who knows all the relevant definitions and theorems but assumes nothing that hasn't been stated. If you would need to appeal to a diagram, to intuition, or to the reader's goodwill to complete the argument, the proof has a gap.`,
    },

    // ── Visual 1 — Valid vs invalid proof steps ───────────────────────────────
    {
      type: "js",
      instruction: `### Identifying Valid and Invalid Proof Steps

Each item below is a step from a geometric proof. Click each one to see whether it is a valid justification — and why.`,
      html: `<div id="steps-container" style="padding:14px;display:flex;flex-direction:column;gap:8px"></div>
<div id="step-feedback" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7;min-height:48px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}`,
      startCode: `var items=[
  {statement:'∠1 = ∠3 because they are vertical angles.',
   valid:true,
   reason:'Valid — cites the Vertical Angles Theorem by name.',
   color:'#1a3a2a'},
  {statement:'AB = CD because they look the same length in the diagram.',
   valid:false,
   reason:'Invalid — diagram appearances are not justifications. You need a proof that they are equal, not a visual impression.',
   color:'#dc2626'},
  {statement:'m∠A + m∠B + m∠C = 180° since △ABC is a triangle.',
   valid:true,
   reason:'Valid — cites the Triangle Angle Sum Theorem.',
   color:'#1a3a2a'},
  {statement:'The lines are parallel because they don\'t seem to meet.',
   valid:false,
   reason:'Invalid — parallelism requires proof from angle evidence or the Parallel Postulate. Visual appearance is not a proof.',
   color:'#dc2626'},
  {statement:'△ABM ≅ △CBM by SSS: AB=CB (given), BM=BM (reflexive), AM=CM (M is midpoint).',
   valid:true,
   reason:'Valid — cites the SSS congruence criterion with explicit justifications for each pair of equal sides.',
   color:'#1a3a2a'},
  {statement:'Therefore ∠P = ∠Q since the triangles are congruent.',
   valid:false,
   reason:'Invalid (incomplete) — needs to cite CPCTC (Corresponding Parts of Congruent Triangles are Congruent) and identify which triangles and which correspondence.',
   color:'#dc2626'},
  {statement:'Since a = b and b = c, we have a = c by the Transitive Property of Equality.',
   valid:true,
   reason:'Valid — cites the Transitive Property by name, with all three quantities identified.',
   color:'#1a3a2a'},
  {statement:'The angle is 90° because it looks like a right angle.',
   valid:false,
   reason:'Invalid — right angles must be established by construction, given conditions, or theorems. A diagram is illustrative, not authoritative.',
   color:'#dc2626'},
];

var container=document.getElementById('steps-container');
var feedback=document.getElementById('step-feedback');

items.forEach(function(item,i){
  var card=document.createElement('div');
  card.style.cssText='border:1.5px solid var(--color-border-primary, #e2e8f0);border-radius:8px;padding:10px 14px;cursor:pointer;transition:all .15s;background:var(--color-background-primary, #ffffff);display:flex;align-items:flex-start;gap:10px;';

  var numEl=document.createElement('div');
  numEl.style.cssText='min-width:22px;height:22px;border-radius:11px;background:#e2e8f0;color:var(--color-text-secondary, #475569);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;font-family:sans-serif;';
  numEl.textContent=i+1;

  var textEl=document.createElement('div');
  textEl.style.cssText='font-size:13px;color:var(--color-text-primary, #1e293b);flex:1;font-family:Georgia,serif;line-height:1.6;';
  textEl.textContent=item.statement;

  var badge=document.createElement('div');
  badge.style.cssText='font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;flex-shrink:0;opacity:0;transition:opacity .2s;font-family:sans-serif;';
  badge.textContent=item.valid?'VALID':'INVALID';
  badge.style.background=item.valid?'#dcfce7':'#fee2e2';
  badge.style.color=item.valid?'#166534':'#991b1b';

  card.appendChild(numEl);card.appendChild(textEl);card.appendChild(badge);

  var revealed=false;
  card.onclick=function(){
    revealed=!revealed;
    badge.style.opacity=revealed?'1':'0';
    card.style.borderColor=revealed?(item.valid?'#86efac':'#fca5a5'):'#e2e8f0';
    card.style.background=revealed?(item.valid?'#f0fdf4':'#fef2f2'):'#fff';
    feedback.innerHTML=revealed
      ?'<strong style="color:'+item.color+'">'+(item.valid?'✓ Valid':'✗ Invalid')+'</strong> — '+item.reason
      :'Click a statement to evaluate it.';
  };
  container.appendChild(card);
});

feedback.textContent='Click any statement to evaluate whether it is a valid proof step.';`,
      outputHeight: 500,
    },

    // ── Proof strategies ───────────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### The Four Proof Strategies — Chosen by the Shape of the Claim

Proof is not just writing — it is strategic thinking. Before you write a single step, you should decide which strategy to use. The choice depends on the structure of what you're trying to prove.

**Strategy 1: Direct Proof**

Assume the given, apply definitions and theorems step by step, arrive at the conclusion. Use this when you can see a clear logical path from hypothesis to conclusion.

*Example:* Prove that if two sides of a triangle are equal, the base angles are equal.
- Direct: Let the triangle be △ABC with AB = AC. Draw the median from A to midpoint M of BC. By SSS (AB=AC, AM=AM, BM=MC), △ABM ≅ △ACM. By CPCTC, ∠B = ∠C. □

**Strategy 2: Proof by Contradiction (Reductio ad Absurdum)**

Assume the opposite of what you want to prove, derive a logical contradiction, conclude the opposite must be true. Use this for "there is no..." or "at most one..." claims, or when the direct path is unclear.

*Example:* Prove that two distinct lines intersect in at most one point.
- Contradiction: Assume they meet at two points P and Q. By Postulate I, exactly one line passes through P and Q. But two distinct lines both pass through P and Q — contradiction. □

**Strategy 3: Proof by Contrapositive**

Instead of proving P → Q, prove ¬Q → ¬P (the contrapositive), which is logically equivalent. Use this when the contrapositive is easier to work with than the original.

*Example:* Prove "if n² is even, then n is even."
- Contrapositive: "if n is odd, then n² is odd."
- Direct proof of contrapositive: if n = 2k+1, then n² = 4k²+4k+1 = 2(2k²+2k)+1 is odd. □

**Strategy 4: Proof by Cases**

Split the claim into exhaustive, non-overlapping cases. Prove each case separately. Use when different subsets of the domain behave differently.

*Example:* Prove |x| ≥ 0 for all real x.
- Case 1: x ≥ 0. Then |x| = x ≥ 0. ✓
- Case 2: x < 0. Then |x| = −x > 0 ≥ 0. ✓
- Both cases exhausted. □`,
    },

    // ── Visual 2 — Strategy selector ─────────────────────────────────────────
    {
      type: "js",
      instruction: `### Choosing a Proof Strategy

For each claim below, select the most appropriate proof strategy. The feedback explains why one strategy is better suited than others — and why the choice isn't always unique.`,
      html: `<div id="claims-container" style="padding:14px;display:flex;flex-direction:column;gap:16px"></div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}`,
      startCode: `var claims=[
  {
    claim:'If a triangle has two equal angles, it has two equal sides.',
    strategies:['Direct','Contradiction','Contrapositive','Cases'],
    best:'Direct',
    explanations:{
      'Direct':'Best choice. You can directly construct the needed triangles using the equal angles (ASA or AAS) and conclude equal sides by CPCTC.',
      'Contradiction':'Works but awkward. You\'d assume no two sides equal, then try to derive that no two angles are equal. More steps.',
      'Contrapositive':'The contrapositive is "no two equal sides → no two equal angles." This is essentially the Isosceles Triangle Theorem in reverse — valid but not the most natural direction.',
      'Cases':'Not needed — the claim doesn\'t split naturally into distinct cases.'
    }
  },
  {
    claim:'There is no integer n such that n² = 2.',
    strategies:['Direct','Contradiction','Contrapositive','Cases'],
    best:'Contradiction',
    explanations:{
      'Direct':'Cannot easily prove something "doesn\'t exist" directly — what would you start from?',
      'Contradiction':'Best choice. Assume n² = 2 for some integer n. Then n = √2, which is irrational (proven separately). Contradiction.',
      'Contrapositive':'Doesn\'t apply naturally to existence claims.',
      'Cases':'Could work (cases: n even, n odd) but contradiction is cleaner.'
    }
  },
  {
    claim:'For any integer n, if n² is odd then n is odd.',
    strategies:['Direct','Contradiction','Contrapositive','Cases'],
    best:'Contrapositive',
    explanations:{
      'Direct':'Starting from "n² is odd" and trying to prove "n is odd" is awkward — what property of odd squares forces the base to be odd?',
      'Contradiction':'Works: assume n² is odd and n is even; then n=2k so n²=4k² is even. Contradiction.',
      'Contrapositive':'Best choice. Contrapositive: "n is even → n² is even." Direct proof: n=2k → n²=4k²=2(2k²), which is even. □',
      'Cases':'Could work (cases: n even, n odd) but contrapositive is most direct.'
    }
  },
  {
    claim:'Every integer is either even or odd.',
    strategies:['Direct','Contradiction','Contrapositive','Cases'],
    best:'Cases',
    explanations:{
      'Direct':'Hard to prove without splitting — "every integer" covers two distinct behaviors.',
      'Contradiction':'Works but awkward.',
      'Contrapositive':'Not the natural direction.',
      'Cases':'Best choice. By the Division Algorithm, every integer n satisfies n = 2q or n = 2q+1. Case 1: even. Case 2: odd. Both cases exhausted. □'
    }
  }
];

var container=document.getElementById('claims-container');
claims.forEach(function(c,ci){
  var card=document.createElement('div');
  card.style.cssText='border:1px solid var(--color-border-primary, #e2e8f0);border-radius:10px;padding:12px 14px;background:var(--color-background-primary, #ffffff);';

  var claimEl=document.createElement('div');
  claimEl.style.cssText='font-size:13px;font-weight:700;color:var(--color-text-primary, #1e293b);font-family:Georgia,serif;margin-bottom:10px;font-style:italic;';
  claimEl.textContent='"'+c.claim+'"';

  var btnRow=document.createElement('div');
  btnRow.style.cssText='display:flex;gap:7px;flex-wrap:wrap;margin-bottom:8px;';

  var explEl=document.createElement('div');
  explEl.style.cssText='font-size:12px;color:var(--color-text-primary, #1e293b);font-family:Georgia,serif;line-height:1.65;padding:8px 10px;border-radius:7px;display:none;';

  c.strategies.forEach(function(s){
    var btn=document.createElement('button');
    btn.textContent=s;
    var isBest=s===c.best;
    btn.style.cssText='padding:5px 12px;border-radius:7px;border:1.5px solid '+(isBest?'#1a3a2a':'#e2e8f0')+';background:'+(isBest?'rgba(26,58,42,0.08)':'transparent')+';color:'+(isBest?'#1a3a2a':'#64748b')+';font-family:Georgia,serif;font-size:12px;cursor:pointer;';
    btn.onclick=function(){
      btnRow.querySelectorAll('button').forEach(function(b){
        var bs=b.textContent;var isB=bs===c.best;
        b.style.borderColor=bs===s?'#1e3a5f':(isB?'#1a3a2a':'#e2e8f0');
        b.style.background=bs===s?'rgba(30,58,95,0.12)':(isB?'rgba(26,58,42,0.08)':'transparent');
        b.style.color=bs===s?'#1e3a5f':(isB?'#1a3a2a':'#64748b');
      });
      var isBestChoice=s===c.best;
      explEl.style.display='block';
      explEl.style.background=isBestChoice?'#f0fdf4':'#fef2f2';
      explEl.style.borderLeft='3px solid '+(isBestChoice?'#1a3a2a':'#dc2626');
      explEl.innerHTML=(isBestChoice?'<strong style="color:#1a3a2a">✓ Best choice: </strong>':'<strong style="color:#dc2626">Not optimal: </strong>')+c.explanations[s];
    };
    btnRow.appendChild(btn);
  });

  card.appendChild(claimEl);card.appendChild(btnRow);card.appendChild(explEl);
  container.appendChild(card);
});`,
      outputHeight: 480,
    },

    // ── Writing a complete proof ───────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### Writing a Complete Proof: The Template

Here is the template every proof in geometry follows. Internalize this structure — it works for every theorem you'll ever encounter.

---

**Theorem:** [State the theorem precisely. If it's an "if-then" statement, identify the hypothesis (the "if" part) and the conclusion (the "then" part).]

**Given:** [List everything you are allowed to assume. This is the hypothesis of the theorem, plus any labeled diagram elements.]

**Prove:** [State exactly what you must establish. This is the conclusion.]

**Proof:**

[Step 1: the first logical move]     [Justification: Given / Definition of X / Theorem Y / Property Z]

[Step 2: follows from Step 1]        [Justification]

...

[Final step: the conclusion]         [Justification] □

---

**The discipline of explicit justification** — writing a reason for every step — serves three purposes:

1. **It catches errors.** When you have to write down why each step is valid, you notice gaps you'd otherwise gloss over.

2. **It communicates.** Another mathematician reading your proof can verify every step independently, without trusting you.

3. **It develops understanding.** The act of finding a justification forces you to understand *why* each step works, not just *that* it works.

The □ symbol at the end of a proof (or "QED," from *quod erat demonstrandum* — "which was to be demonstrated") signals that the proof is complete.`,
    },

    // ── A full worked proof ────────────────────────────────────────────────────
    {
      type: "js",
      instruction: `### A Complete Proof, Annotated

The proof below shows that the diagonals of a rectangle are equal. Every step has a justification, and every justification cites something specific. Hover over any step to see why that justification is the right one — and what would happen if you tried to skip it.`,
      html: `<div id="proof-table" style="padding:14px;font-family:Georgia,serif"></div>
<div id="hover-info" style="padding:10px 14px;font-family:Georgia,serif;font-size:13px;background:var(--color-background-secondary, #f8fafc);border-top:1px solid var(--color-border-primary, #e2e8f0);line-height:1.7;min-height:48px;color:var(--color-text-secondary, #475569)">
  Hover over any step to see why the justification is necessary.
</div>`,
      css: `body{margin:0;background:var(--color-background-secondary, #f8fafc);font-family:Georgia,serif}`,
      startCode: `var proofSteps=[
  {
    num:'Given',
    statement:'Rectangle ABCD with diagonals AC and BD.',
    reason:'Given',
    note:'The starting conditions. A rectangle is defined as a quadrilateral with four right angles. This definition will be used in the next step.',
    color:'var(--color-text-primary, #1e293b)"
  },
  {
    num:'1',
    statement:'∠DAB = ∠CBA = 90°',
    reason:'Definition of rectangle',
    note:'We can state both angles are 90° because a rectangle is defined to have four right angles. Without naming the definition, this step would look like it came from nowhere.',
    color:'#1e3a5f'
  },
  {
    num:'2',
    statement:'AB = AB',
    reason:'Reflexive Property of Equality',
    note:'Seemingly trivial, but essential: we need to show three pairs of equal quantities to apply SAS. AB is the shared side between the two triangles we are about to compare. Without this, we only have two pairs.',
    color:'#1e3a5f'
  },
  {
    num:'3',
    statement:'AD = BC',
    reason:'Opposite sides of a rectangle are equal',
    note:'This is a property of rectangles (which follows from the definition and the parallel sides). We must cite it explicitly — we cannot assume sides are equal just because ABCD "looks" like a rectangle.',
    color:'#1e3a5f'
  },
  {
    num:'4',
    statement:'△DAB ≅ △CBA',
    reason:'SAS (AD=BC from step 3, ∠DAB=∠CBA=90° from step 1, AB=AB from step 2)',
    note:'SAS requires two sides and the included angle. Here: AD=BC (one side), ∠DAB=∠CBA (included angle), AB=AB (second side). The angle must be between the two sides — here it is, between AD and AB in each triangle.',
    color:'#1a3a2a'
  },
  {
    num:'5',
    statement:'AC = BD',
    reason:'CPCTC (Corresponding Parts of Congruent Triangles are Congruent)',
    note:'Once the triangles are proven congruent in step 4, ALL corresponding parts are equal. AC corresponds to BD (both are hypotenuses of the congruent triangles). CPCTC gives this for free — but we must name it.',
    color:'#1a3a2a'
  },
  {
    num:'□',
    statement:'The diagonals of rectangle ABCD are equal.',
    reason:'From step 5',
    note:'The conclusion restates what we set out to prove, connecting it to the final step. The □ signals the proof is complete.',
    color:'#92400e'
  }
];

var tableEl=document.getElementById('proof-table');
var hoverEl=document.getElementById('hover-info');

tableEl.innerHTML='<strong>Theorem:</strong> The diagonals of a rectangle are equal.<br>'
  +'<strong>Given:</strong> Rectangle ABCD. <strong>Prove:</strong> AC = BD.<br><br>'
  +'<table style="border-collapse:collapse;width:100%;font-size:12px">'
  +'<tr style="background:#f0f0ee"><th style="padding:5px 8px;text-align:left;width:8%">Step</th>'
  +'<th style="padding:5px 8px;text-align:left;width:52%">Statement</th>'
  +'<th style="padding:5px 8px;text-align:left">Reason</th></tr>'
  +proofSteps.map(function(s,i){
    var bg=i%2===0?'#fafaf8':'#fff';
    return '<tr style="background:'+bg+';cursor:pointer" data-idx="'+i+'">'
      +'<td style="padding:6px 8px;font-weight:700;color:'+s.color+'">'+s.num+'</td>'
      +'<td style="padding:6px 8px;color:var(--color-text-primary, #1e293b)">'+s.statement+'</td>'
      +'<td style="padding:6px 8px;font-style:italic;color:var(--color-text-secondary, #475569)">'+s.reason+'</td></tr>';
  }).join('')
  +'</table>';

tableEl.querySelectorAll('tr[data-idx]').forEach(function(row){
  var idx=parseInt(row.getAttribute('data-idx'));
  row.addEventListener('mouseenter',function(){
    row.style.background='rgba(30,58,95,0.08)';
    hoverEl.innerHTML='<strong style="color:'+proofSteps[idx].color+'">Step '+proofSteps[idx].num+':</strong> '
      +proofSteps[idx].note;
  });
  row.addEventListener('mouseleave',function(){
    row.style.background=idx%2===0?'#fafaf8':'#fff';
    hoverEl.innerHTML='<span style="color:var(--color-text-secondary, #475569)">Hover over any step to see why the justification is necessary.</span>';
  });
});`,
      outputHeight: 480,
    },

    // ── Common errors ──────────────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### The Most Common Proof Errors

Learning to write proofs means learning to avoid a specific set of recurring mistakes. Here are the most important ones, with examples.

**Error 1: Circular Reasoning.** Using the conclusion to prove the conclusion. "AB = CD because CD = AB." The statement is trivially true but proves nothing new. More subtle: using a theorem that depends on what you're trying to prove.

**Error 2: Missing Justification.** Writing a statement that is true but giving no reason. "Therefore ∠A = ∠B." Why? Which theorem? Even if the reader can guess, the proof is incomplete.

**Error 3: Diagram Dependence.** "Since the diagram shows that PQ bisects angle R, we have ∠PRQ = ∠QRS." Diagrams are illustrative, not authoritative. What's given in the diagram must be stated as a given or proved, not assumed.

**Error 4: Assuming What's to Be Proven.** A subtler version of circularity. In a proof that △ABC ≅ △DEF, writing "since the triangles are congruent, AB = DE" — but that's what you're proving, not a step toward it.

**Error 5: Invalid Inference.** Drawing a conclusion that doesn't follow from the premises. "∠A = ∠B and ∠B = ∠C, therefore ∠A = ∠B = ∠C = 60°." The first two equalities don't fix the actual value.

**Error 6: Wrong Congruence Criterion.** Claiming SSA congruence (invalid) or forgetting that SAS requires the angle to be *included* between the two sides.

**Error 7: Incomplete Cases.** In a proof by cases, omitting one case. "I proved it for even n" when the theorem is about all integers — what about odd n?

**The remedy for all of these:** Write slowly, one step at a time, and demand a specific justification for each step before moving on.`,
    },

    // ── Challenges ────────────────────────────────────────────────────────────
    {
      type: "challenge",
      instruction: `A student writes: "Since ∠A and ∠B are both 90°, we have ∠A = ∠B. Therefore the triangles are congruent by ASA." Identify every error in this reasoning.`,
      options: [
        {
          label: "A",
          text: "No errors — if two angles are equal, ASA applies.",
        },
        {
          label: "B",
          text: "Two errors: (1) ASA requires two angles AND the included side to be equal — the student has given no side. (2) Even knowing two pairs of equal angles, you need a side to use ASA or AAS. The step jumps to congruence without establishing a side.",
        },
        {
          label: "C",
          text: "One error: the student should have used AA instead of ASA.",
        },
        {
          label: "D",
          text: "One error: 90° angles should use the HL criterion, not ASA.",
        },
      ],
      check: (label) => label === "B",
      successMessage:
        "Correct. ASA requires: two angles AND the included side between them, for both triangles, matching up as corresponding pairs. The student has: one pair of equal angles (∠A = ∠B = 90°). That is one condition out of three for ASA. The included side between what angles? There is no second angle stated, no side stated. AA congruence does not exist — AA gives similarity, not congruence. HL applies only when you already know you have right triangles with equal hypotenuses and a leg.",
      failMessage:
        'ASA requires: (1) two pairs of corresponding angles are equal, and (2) the pair of corresponding sides between those angles are equal. The student has shown only one pair of angles (both 90°). There is no second pair of angles and no side identified. Jumping to "congruent by ASA" without these is an invalid inference — a critical proof error.',
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },

    {
      type: "challenge",
      instruction: `You want to prove: "If two lines cut by a transversal have equal alternate interior angles, then the lines are parallel." Which proof strategy is most appropriate, and why?`,
      options: [
        {
          label: "A",
          text: "Direct proof — assume equal alternate interior angles, immediately conclude the lines are parallel.",
        },
        {
          label: "B",
          text: "Proof by contradiction — assume the lines are NOT parallel (so they intersect), then show this forces the alternate interior angles to be unequal — contradicting the given. This is the standard proof of the Alternate Interior Angles Converse.",
        },
        {
          label: "C",
          text: "Proof by cases — consider acute and obtuse alternate interior angles separately.",
        },
        {
          label: "D",
          text: "Proof by induction — the result holds for one transversal, then the next.",
        },
      ],
      check: (label) => label === "B",
      successMessage:
        'Correct. The direct proof is difficult: "equal angles → parallel" is hard to establish directly, because parallelism (lines never meeting) is a negative, universal claim that\'s hard to prove positively. Contradiction works perfectly: assume NOT parallel → the lines meet at some point P, forming a triangle → the exterior angle theorem gives the alternate interior angles as unequal → contradicts the given. Contradiction is the natural strategy for "these lines have a certain property everywhere" when you can easily derive a contradiction from the opposite assumption.',
      failMessage:
        'The direct approach is hard because "parallel" means "never intersect — anywhere, at any distance." That\'s a negative, universal claim. It\'s much easier to assume the lines DO intersect (forming a triangle) and show this creates a contradiction with the given equal alternate interior angles. Contradiction is the standard strategy when the conclusion is a universal negative ("never intersect") and the negation is a specific positive ("they meet somewhere") that you can work with algebraically.',
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },

    {
      type: "challenge",
      instruction: `Write the missing justification for each step of this proof fragment: "In △ABC, let M be the midpoint of BC. We claim AM² + BM² is related to AB². [Step 1] AM = AM. [Step 2] BM = MC. [Step 3] △ABM ≅ △ACM." Which set of justifications is correct?`,
      options: [
        {
          label: "A",
          text: "Step 1: Given. Step 2: Looks equal in diagram. Step 3: SSS.",
        },
        {
          label: "B",
          text: "Step 1: Reflexive Property of Equality. Step 2: Definition of midpoint. Step 3: Cannot conclude congruence yet — need a third pair of equal quantities (AB = AC is not given).",
        },
        {
          label: "C",
          text: "Step 1: Reflexive Property. Step 2: Definition of midpoint. Step 3: SSS (AM=AM, BM=MC, AB=AC).",
        },
        {
          label: "D",
          text: "Step 1: Transitive Property. Step 2: Given. Step 3: SAS.",
        },
      ],
      check: (label) => label === "B",
      successMessage:
        "Correct. Step 1: AM = AM by the Reflexive Property — any quantity equals itself. Step 2: BM = MC by the Definition of Midpoint — a midpoint divides a segment into two equal halves. Step 3: We cannot yet conclude △ABM ≅ △ACM. We have AM = AM (one side) and BM = MC (one side), but we don't know AB = AC — that would require the triangle to be isosceles, which is not given. The proof needs more information before claiming congruence.",
      failMessage:
        "Step 1: AM = AM because any quantity equals itself (Reflexive Property). Step 2: BM = MC because M is the midpoint — the midpoint divides a segment into two equal halves (Definition of Midpoint). Step 3: To claim △ABM ≅ △ACM by SSS, we need three pairs of equal sides: AM=AM ✓, BM=MC ✓, but AB=AC is not given (the triangle might not be isosceles). Claiming SSS without the third pair is an error.",
      html: "",
      css: "body{margin:0;padding:0;font-family:Georgia,serif}",
      startCode: "",
      outputHeight: 270,
    },
  ],
};

export default {
  id: "geo-2-3",
  slug: "intro-to-proofs",
  chapter: "geometry-2",
  order: 3,
  title: "Introduction to Proofs",
  subtitle:
    "What a proof actually is, why it matters, and how to write one from scratch.",
  tags: [
    "geometry",
    "proofs",
    "logic",
    "direct-proof",
    "contradiction",
    "contrapositive",
    "justification",
    "two-column-proof",
  ],
  hook: {
    question:
      'How do you prove something that "looks" obvious — and why isn\'t checking examples enough?',
    realWorldContext:
      "Every theorem in mathematics, every verified algorithm in computer science, and every safety-critical system specification rests on proof. Understanding what makes an argument a proof — and what the common errors are — is the most transferable skill in formal mathematics.",
    previewVisualizationId: "G2_3_Constructions",
  },
  intuition: {
    prose: [
      "A proof is a finite sequence of statements where each follows from a given, definition, postulate, theorem, or previous step. Every step must have an explicit justification.",
      'Diagrams illustrate; they do not prove. "It looks equal" is never a valid justification.',
      "Four strategies: Direct (assume P, derive Q), Contradiction (assume ¬Q, derive absurdity), Contrapositive (prove ¬Q → ¬P), Cases (split and cover all subcases).",
      "Common errors: circular reasoning, missing justification, diagram dependence, wrong congruence criterion, incomplete cases.",
    ],
    callouts: [
      {
        type: "important",
        title: "The test for a complete proof",
        body: "A valid proof must convince a logically perfect reader who knows all relevant definitions and theorems but assumes nothing not explicitly stated. Every step needs a reason. Any gap — however small — makes the proof incomplete.",
      },
    ],
    visualizations: [
      {
        id: "ScienceNotebook",
        title: "Introduction to Proofs",
        props: { lesson: LESSON_GEO_2_3 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    "Proof = finite logical chain: Given → definitions/theorems → conclusion. Every step justified.",
    'Not a proof: diagram argument, "looks equal," checking examples, appeal to authority.',
    "Strategy by claim shape: can I see the path? (Direct). Is conclusion a negative/universal? (Contradiction). Is the backwards direction easier? (Contrapositive). Do cases behave differently? (Cases).",
    "Template: Given → Prove → numbered steps with reasons → □.",
    "CPCTC: once triangles are proven congruent by SSS/SAS/ASA/AAS/HL, all corresponding parts are equal. Cite this explicitly.",
  ],
  checkpoints: ["read-intuition"],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Proof = finite logical chain: Given → definitions/theorems → conclusion. Every step justified." What makes a proof different from an explanation?',
      options: [
        'Proofs are longer than explanations',
        'Every step in a proof must cite a specific axiom, definition, or previously proved theorem — no step can rely on intuition or visual appearance',
        'Proofs use symbols while explanations use words',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Not a proof: diagram argument, \'looks equal\', checking examples." A student measures 10 triangles and finds the angle sum is always 180°. Is this a proof?',
      options: [
        'Yes — 10 examples is enough evidence',
        'No — checking examples only establishes the pattern for those cases; it cannot rule out a counterexample you haven\'t checked. A proof must work for ALL cases',
        'Yes — if no counterexample was found, the theorem is proved',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Proof by contradiction: assume the opposite, derive a contradiction." When is proof by contradiction especially useful?',
      options: [
        'When the conclusion is easy to verify directly',
        'When the conclusion is a negative ("there is no...") or universal ("for all...") claim that is hard to prove directly',
        'When you want a shorter proof than direct proof provides',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"CPCTC: once triangles are proven congruent, all corresponding parts are equal." In what order do you use CPCTC in a proof?',
      options: [
        'Use CPCTC first to establish which parts are equal, then prove the triangles congruent',
        'Use SSS/SAS/ASA/AAS/HL to prove the triangles congruent first, THEN cite CPCTC to conclude that specific corresponding parts (like sides or angles) are equal',
        'CPCTC and SSS/SAS/ASA/AAS/HL are used simultaneously',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_GEO_2_3 };
