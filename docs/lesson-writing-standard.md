# UpSkillOS Lesson Writing Standard
> Applies to all Schema A courses: Calculus, Linear Algebra, Geometry, Physics, Discrete Math, Precalc, Chemistry (Schema E where noted). The gold standard examples are **Calculus Chapter 2 & 3** and **Linear Algebra Chapters 1–4**.

## The One-Sentence Test
Before writing anything, complete this sentence:
> "A student who finishes this lesson can **[do X specific technique]** given **[Y specific inputs]**."

Every sentence in the lesson must serve that sentence or be cut.

---

## Absolute Rules

### Rule 1: Concrete before abstract — always
Intuition prose **must** follow this order:
1. Start with a specific example using real numbers (no variables yet)
2. Walk through it step by step, observing what happens
3. Name the pattern you just saw
4. State the general formula as a result, not a starting point

**Never:** state the formula in the first paragraph, then explain it afterward.

---

### Rule 2: Define before use — no exceptions
Before writing any sentence, verify: has every symbol in this sentence been defined **in this lesson** or explicitly linked to a named prerequisite?

- First use of a symbol: define it inline — e.g., *"the cofactor $C_{ij}$ (defined as $(-1)^{i+j}$ times the minor $M_{ij}$, which is..."*
- Do not assume "the student knows det" — say *"the determinant $\det(A)$, which you computed in la2-005"*
- Never use a term in prose paragraph 2 that is defined in callout 3

---

### Rule 3: State the technique as a numbered procedure
Every lesson that teaches a technique must have an explicit callout:

```
type: 'procedure'  (or 'insight' if needed)
title: 'Procedure: [Technique Name]'
body: 'Step 1. ...\nStep 2. ...\nStep 3. ...'
```

This is the thing the student screenshots and refers back to. It must appear in the **intuition** section.

---

### Rule 4: Math section uses only what intuition introduced
The `math.prose` proofs may **not** introduce new notation or concepts.

If a proof requires "multilinearity of the determinant," that concept must have appeared in intuition first. Otherwise: either add it to intuition, or replace the proof with one that uses only known tools.

---

### Rule 5: Example 1 is always the technique on the simplest possible case
- **Minimum 3 examples required:** easy / medium / hard
- **Example 1:** smallest case, all steps shown, no shortcuts, annotations in plain English
- **Example 2:** moderate complexity, one additional complication introduced
- **Example 3+:** hard case — symbolic/parametric input, or real-world framing; add more examples when the topic has genuinely distinct use cases

---

### Rule 6: Rigor section is for advanced students — it does not repeat intuition
Rigor prose assumes the student has absorbed intuition + math. It introduces formal framework, edge cases, and cross-topic connections. Do **not** re-explain the technique here.

---

### Rule 7: Cognitive load limits — enforce them numerically
- Each prose paragraph may introduce at most **3 new symbols**.
- Each worked example may introduce at most **1 new abstraction layer** beyond the previous example.
- No proof step may require tracking more than **2 simultaneous transformations**.
- A single sentence may introduce **at most 1 new concept** — not two connected by "and" or "where."

---

### Rule 8: Language discipline — prefer verbs over nouns
- Target sentence length: ≤ 25 words for instructional sentences; explanatory sentences may be longer.
- Never introduce two new concepts in one sentence, even coordinated with "and."
- Prefer active verbs: *"the matrix scales the vector"* not *"scaling of the vector by the matrix occurs."*
- A sentence containing a new symbol may not also contain a nested subordinate clause.

---

### Rule 9: Every lesson must contain a prediction moment
At least one prose segment — typically in intuition — must ask the student to predict an outcome **before** the answer is revealed:

> *"Before reading on, predict: what happens to det(A) if two rows of A are identical?"*

Prediction activates error-driven learning. A lesson without a prediction moment is a lecture, not a lesson.

---

### Rule 10: Mastery has four levels — declare which one this lesson targets
Before writing, choose the target level:
- **Level 1 — Compute:** execute the algorithm given an input
- **Level 2 — Explain:** describe what each step does and why
- **Level 3 — Detect:** recognize when the technique applies vs. does not apply
- **Level 4 — Transfer:** apply to an unfamiliar representation without prompting

State the target level in `mastery.targetLevel`. A lesson with no transfer example may not claim Level 3 or 4.

---

## Per-Field Checklist

### `intuition.prose[]`
- [ ] First paragraph begins with a specific example using concrete numbers
- [ ] Every symbol defined before it appears
- [ ] Technique procedure stated explicitly (in prose or callout)

### `intuition.callouts[]`
- [ ] At least one callout is a numbered procedure
- [ ] At least one `type: 'warning'` explains what goes wrong if student misapplies the technique
- [ ] Definition callouts come **before** the prose that uses those terms (or are inline)

### `intuition.visualizations[]`
Each visualization entry must serve an explicit purpose. Attach a comment or companion callout:
- [ ] States which **misconception** the visual directly contradicts
- [ ] States which **invariant** stays constant while something else changes (e.g., *direction is preserved, length changes*)
- [ ] A visual without a stated purpose is worse than no visual — it adds cognitive load without payoff
- [ ] Every lesson must have at least one visualization, and each visualistaion it like a lesson in itself. 

### `math.prose[]`
- [ ] Proof uses only symbols introduced in intuition
- [ ] Each logical step is annotated: *"because [property] from la2-005"*

### `rigor.prose[]`
Four required paragraphs, each with a distinct purpose:
- [ ] **P1 — Formal statement:** theorem with all conditions named (not just the result)
- [ ] **P2 — Invariant viewpoint:** what does *not* change under this operation? Why does that matter?
- [ ] **P3 — Geometric/operator interpretation:** what does this look like in vector space? Can you draw it?
- [ ] **P4 — Future abstraction link:** basis-free formulation, or connection to a theorem the student hasn't seen yet
- [ ] Proof sketch uses only tools introduced by intuition + math sections (no new imports)

### `examples[]`
- [ ] ID format: `la[ch]-[num]-ex[N]`
- [ ] Steps format: `[{expression, annotation, strategyTitle, checkpoint, hints}]`
- [ ] Minimum 3 examples: easy / medium / hard (more allowed for topics with distinct use cases)
- [ ] Example 1 annotation uses plain English, no unexplained terms

### `challenges[]`
- [ ] ID format: `la[ch]-[num]-ch[N]`
- [ ] Exactly 3 challenges: easy / medium / hard minimum
- [ ] `walkthrough: [{expression, annotation}]` — annotations **teach**, not just show
- [ ] `answer` is a complete sentence, not just a value

### `semantics.core[]`
- [ ] Format: `[{symbol, meaning}]` — **never** bare strings
- [ ] `meaning` explains in English what the symbol **does**, not just what it is called
- [ ] 4–6 entries covering all symbols introduced in this lesson

### `semantics.rulesOfThumb[]`
- [ ] 4–5 entries
- [ ] Each one is a practical heuristic — not a restatement of a definition

### `spiral`
- [ ] `recoveryPoints`: `[{lessonId, label, note}]` — `note` names the **specific concept** to review
- [ ] `futureLinks`: `[{lessonId, label, note}]` — `note` explains **how** this lesson feeds the future one

### `checkpoints[]`
- [ ] Format: `[{id, label, type}]` — **never** strings or `{question, answer}` objects
- [ ] ID format: `cp-la[ch]-[num]-[N]`
- [ ] 8 checkpoints total: 3 read, 2 lab, 2 example, 1 challenge
- [ ] `label` starts with an action verb (*Read …*, *Run …*, *Complete …*, *Attempt …*)

### `assessment.questions[]`
- [ ] ID format: `la[ch]-[num]-assess-1`
- [ ] Format: `{id, type: 'choice', text, options, answer: string, hint}`
- [ ] `answer` must **exactly match** one option string (copy-paste it)
- [ ] `hint` explains the reasoning, not just restates the answer

### `quiz[]`
- [ ] ID format: `la[ch]-[num]-quiz-[N]`
- [ ] Format: `{id, type: 'choice', text, options, answer: string, hints: [...], reviewSection}`
- [ ] 6 questions minimum
- [ ] `answer` must **exactly match** one option string
- [ ] `hints` is an **array** (not a single string)
- [ ] `reviewSection` names the specific tab + callout title to review
- [ ] At least 1 question tests **detection** ("which of these is NOT a valid application...")
- [ ] At least 1 question uses a **near-miss distractor** (an answer that is almost right but fails one condition)

---

### `misconceptions[]` *(minimum 2 entries)*

Schema:
```js
{
  falseBelief:        "Eigenvectors don't move — they stay fixed.",
  whyStudentsThinkIt: "'Eigen' sounds like 'own/fixed'; students conflate direction-preserved with position-fixed.",
  correctionExample:  "Av = λv means output is parallel to input. If λ=3, the vector triples in length along the same line.",
  contrastCase:       "A rotation matrix has no real eigenvectors — every direction changes."
}
```
- [ ] `falseBelief` is a full sentence stating what the student believes, not what they should believe
- [ ] `correctionExample` uses a concrete number, not a general explanation
- [ ] `contrastCase` shows a situation where the false belief would predict the wrong answer

---

### `transferPrompts[]` *(minimum 2 entries)*

Schema:
```js
{
  situation:             "You need to solve Ax=b for only one variable, and A is 3×3.",
  competingTechniques:   ["Gaussian elimination", "Cramer's Rule"],
  whyThisTechniqueWins:  "Cramer's Rule gives one variable directly with one determinant; elimination computes all three."
}
```
- [ ] Situations are novel framings — not restatements of the numbered examples
- [ ] At least one `competingTechniques` entry is an incorrect or inefficient alternative
- [ ] The student must be able to recognize the situation without being told which technique to use

---

### `debugging[]` *(minimum 2 entries)*

Schema:
```js
{
  commonError:     "Replacing the wrong column when forming A_i(b).",
  symptom:         "One variable is correct but the others are wrong.",
  whyItHappened:   "Cramer's Rule is 1-indexed (replace column 1 for x₁), but 0-indexed code arrays shift this by 1.",
  repairStrategy:  "Write A_i explicitly before computing: 'For x₂, I replace column 2 (middle column) with b.'"
}
```
- [ ] Errors must be mistakes students *actually make*, not theoretical possibilities
- [ ] `symptom` describes what the student **observes**, not what the error **is**
- [ ] `repairStrategy` is a concrete action, not general advice to "be careful"

---

### `mastery` *(required)*

Schema:
```js
{
  targetLevel: 2,  // 1=Compute  2=Explain  3=Detect  4=Transfer
  solveIndependently:        "Compute the solution to a 3×3 system using Cramer's Rule without a reference sheet.",
  explainVerbally:           "Describe what A_i(b) is and why replacing that column produces x_i.",
  detectIncorrectApplication: "Identify when Cramer's Rule is impractical (n > 4) and suggest row reduction instead.",
  transferToUnfamiliar:      "Apply the formula to a system with a symbolic parameter k; determine for which k the system has no solution."
}
```
- [ ] `targetLevel` is declared and lesson content matches it
- [ ] Levels above `targetLevel` are still defined as stretch goals — not required, but present

---

## Self-Check Before Finishing a Lesson

Run through all **14 questions** before committing a lesson as done. Do not skip any.

**Exposition**
1. Read `intuition.prose[0]` aloud — does it start with real numbers, not a formula?
2. Find the first symbol in `prose[0]` — is it defined before it appears?
3. Count new symbols in each prose paragraph. Is any paragraph over 3? If yes → split it.
4. Is there a callout with a numbered procedure?
5. Does `math.prose` use any concept not present in `intuition`? If yes → add it to intuition or remove it from math.
6. Is there at least one prediction moment — a place where the student is asked to guess before the answer is shown?

**Practice**
7. Does Example 1 walk through every step of the numbered procedure callout, one-to-one?
8. Do the 3 challenges include at least one reverse problem, debugging task, or "choose the method" task?
9. Are there at least 2 `transferPrompts` entries, each naming a competing technique?
10. Are there at least 2 `misconceptions` entries, each with a concrete `correctionExample`?

**Structure**
11. Are **all** IDs prefixed with the lesson ID? (examples, challenges, checkpoints, assessment, quiz)
12. Do all `quiz` and `assessment` `answer` fields exactly match one option string?
13. Are all `checkpoints` in `{id, label, type}` format with action-verb labels?
14. Is `mastery.targetLevel` declared, and does the hardest challenge actually demand that level?

---


