# Lesson 52: Counting Recursive Possibilities

**What you will build:** Nothing new in code — this lesson goes back to Lesson 51's own real, measured numbers, `2047` wasteful calls against `11` efficient ones for a ten-item list, and derives both of them mathematically, from scratch, before ever running anything. The transferable problem this lesson is actually about: Lesson 51 discovered its `2047`-versus-`11` gap by measuring, after the fact, with real instrumented code. This lesson builds the tool that would have *predicted* that exact number in advance — a recurrence relation, unfolded the same way Lesson 27 unfolded factorial, applied here to a recursive procedure's own cost rather than to a value it computes.

**What you need to know first:** Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically *unfolding* a recursive definition, applied here to a count instead of a value. Lesson 44 (`FP-L044-mathematical-induction.md`) — specifically the technique for proving a closed form matches a recursive definition, reused directly to confirm this lesson's derivations. Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically the real, measured `2047` and `11`, both derived mathematically here for the first time.

**Terms introduced in this lesson**

- **Recurrence relation** — an equation defining a quantity in terms of the same quantity at a smaller value, together with a base case — exactly Lesson 27's recursive-definition shape, applied specifically to counting something (values produced, or calls made) rather than to defining a value directly. `S(n) = 2 × S(n − 1)`, with `S(0) = 1`, is a recurrence relation for the number of subsets of an `n`-item list.

## Objects and methods used

None. This lesson introduces no new code, working entirely from Lesson 51's already-run, already-verified real output.

---

## Concept Unit 1: Predicting Growth Before Running Anything

### The Problem

Lesson 51 measured `all-subsets`'s output size — `8` for three items, `32` for five — and separately measured the wasteful version's call count — `2047` for ten items — entirely by running real code and counting afterward. It's worth asking whether either number could have been predicted in advance, from the procedure's own recursive structure, without running anything at all.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly below, not through a construct with its own syntax.

### Applying It — What's Already Known, and What Isn't

**What Lesson 51 already established, by measurement:** `all-subsets` applied to `3` items produces `8` subsets; applied to `5` items, `32`; the wasteful double-call version applied to `10` items makes `2047` calls; the `let`-based version makes `11`.

**What hasn't yet been established:** *why* these specific numbers, derived from the procedure's own recursive case, rather than from running it and counting the result.

**Naming what's needed:** an equation describing how the count at size `n` relates to the count at a smaller size — precisely Lesson 27's recursive-definition shape, aimed at a count instead of a value.

### Walkthrough

- **Lesson 51's four already-measured numbers, `8`, `32`, `2047`, `11`, restated together** — establishes exactly what's already known from measurement, before this lesson derives the same numbers a second, independent way.
- **"an equation describing how the count at size `n` relates to the count at a smaller size"** — a direct forward-reference to *recurrence relation*, previewing Concept Unit 2's actual technique.

### CS Lens

This is the difference between empirical measurement — running code and observing what happens — and analytical prediction — deriving what must happen from a procedure's own structure, before ever running it. Also recognized in: an engineer predicting a bridge's load capacity from its design specifications, rather than only from a physical stress test; an economist predicting a market's behavior from a mathematical model, rather than only from historical data; a physicist predicting a projectile's trajectory from the laws of motion, rather than only from watching it fly.

### SE Lens

The alternative to seeking a predictive technique is to rely permanently on Lesson 51's approach — build it, run it, measure it, and hope the same pattern holds at a larger, untested scale. The real cost of that alternative is exactly Lesson 22's evidence-versus-proof gap, applied to performance rather than correctness: measuring `2047` calls at ten items is evidence the growth is severe, not proof of exactly how severe it will be at fifteen, or twenty, items — a gap this lesson's recurrence relation closes completely.

---

## Concept Unit 2: A Recurrence for the Number of Subsets

### The Problem

`all-subsets`'s own recursive case, from Lesson 51, already states a relationship between the subset count at size `n` and the subset count at size `n − 1` — it's simply never been extracted and stated as its own equation.

### No isolated lab for this step

This concept has no code of its own to isolate — the recurrence is derived directly below, from `all-subsets`'s own already-written code, not through a new construct with its own syntax.

### Applying It — Extracting the Recurrence Directly From the Code

**`all-subsets`'s recursive case, quoted from Lesson 51:** every subset of `(cdr items)`, with `(car items)` added, together with every subset of `(cdr items)` unchanged.

**Letting `S(n)` denote the number of subsets of a list with `n` items, and reading the recursive case as an equation about `S`:** the "included" half has exactly as many subsets as `(cdr items)` has — `S(n − 1)` of them. The "excluded" half has exactly the same count again — another `S(n − 1)`. The two halves never overlap (Lesson 16's *intersection*, checked directly: a subset either includes `(car items)` or it doesn't, never both). The total is their sum.

**The recurrence, stated precisely:** `S(n) = S(n − 1) + S(n − 1) = 2 × S(n − 1)`, for `n > 0`.

**The base case, read directly from `all-subsets`'s own base case:** `S(0) = 1` — the empty list has exactly one subset, itself.

### Walkthrough

- **`all-subsets`'s recursive case, reappearing from Lesson 51** — the actual source this unit's equation is extracted from, not an independently invented formula.
- **`S(n) = 2 × S(n − 1)`** — first appearance of a recurrence relation stated formally, directly mirroring the code's own two-halves-of-equal-size structure.
- **`S(0) = 1`** — the base case, read directly from `(list '())`'s own single member.

### CS Lens

This is the direct translation of a recursive procedure's code into a mathematical recurrence describing its output size — the identical translation Lesson 44, Concept Unit 4, already performed in the other direction, matching a proof's structure to a procedure's own two branches. Also recognized in: a population biologist translating a species' reproductive pattern directly into a growth equation; an economist translating a compounding interest rule directly into a recurrence for account balance; a physicist translating a radioactive decay process directly into a recurrence for remaining material.

### SE Lens

The alternative to extracting the recurrence directly from the code is to guess at a formula for subset count from general knowledge (many people already know "it's `2ⁿ`") without ever connecting that knowledge back to `all-subsets`'s own specific structure. The real cost of that alternative is a formula trusted for the wrong reason — memorized rather than derived — leaving no way to adapt the technique to a differently-structured procedure whose growth pattern isn't already a well-known fact. Deriving the recurrence directly from the code, as this unit does, costs the careful translation just performed; it produces a technique that transfers to any recursive procedure, not just this one.

---

## Concept Unit 3: Solving the Recurrence by Unfolding

### The Problem

`S(n) = 2 × S(n − 1)` is a relationship, not yet a closed-form answer — exactly the same gap Lesson 27 found between a recursive definition and an actual value, before unfolding closed it.

### No isolated lab for this step

This concept has no code of its own to isolate — the unfolding is demonstrated directly below, using exactly Lesson 27's technique, not through a construct with its own syntax.

### Applying It — Unfolding S(n)

**Unfolding, exactly the way Lesson 27, Concept Unit 3, unfolded `5!`:**

> `S(n) = 2 × S(n − 1)`
> `= 2 × (2 × S(n − 2)) = 4 × S(n − 2)`
> `= 4 × (2 × S(n − 3)) = 8 × S(n − 3)`
> `= ...`
> `= 2ⁿ × S(0)`

**Substituting the base case, `S(0) = 1`:** `S(n) = 2ⁿ × 1 = 2ⁿ`.

**Checking this closed form against Lesson 51's own real, measured numbers:** `S(3) = 2³ = 8`, matching `all-subsets`'s measured output for `(1 2 3)` exactly. `S(5) = 2⁵ = 32`, matching the measured output for a five-item list exactly.

**Confirming this with a proper proof, rather than resting on the pattern of unfolding alone, using Lesson 44's exact technique:** base case, `S(0) = 2⁰ = 1`, holds directly. Inductive step: assuming `S(k) = 2ᵏ` (the inductive hypothesis), `S(k + 1) = 2 × S(k) = 2 × 2ᵏ = 2ᵏ⁺¹`, exactly matching what the closed form claims for `S(k + 1)`. Both parts hold, so `S(n) = 2ⁿ` for every natural number `n`.

### Walkthrough

- **The unfolding, `S(n) = 2ⁿ × S(0)`** — a direct reappearance of Lesson 27's own unfolding technique, applied here to a count rather than to a factorial.
- **`S(3) = 8` and `S(5) = 32`, checked against Lesson 51's own measured output** — confirms the derived closed form against real, previously-established data, not merely internal consistency.
- **The mathematical-induction proof, following Lesson 44's exact structure** — elevates the unfolding pattern from a suggestive derivation to an actually-proven fact, exactly the discipline Lesson 22 has insisted on since it was first introduced.

### CS Lens

This is the exact same unfold-then-prove sequence Lesson 27 and Lesson 44 already established for `factorial` and `sum`, now applied to a count of possibilities rather than a numeric value — confirming the technique is genuinely general, not tied to the specific kind of recursive definition it was first demonstrated on. Also recognized in: solving a compound-interest recurrence to get a closed-form balance formula; solving a population-growth recurrence to get a closed-form population formula; solving a radioactive-decay recurrence to get a closed-form remaining-quantity formula — every one of these a real recurrence, unfolded and proven the identical way.

### SE Lens

The alternative to proving the closed form, and stopping at the suggestive pattern from unfolding alone, is exactly the risk Lesson 22 has warned against since its first lesson: a pattern that holds for the terms actually written out is not yet a guarantee it holds for every `n`. Proving it by induction, as this unit does, costs the same disciplined extra step Lesson 44 already modeled; it is what makes `S(n) = 2ⁿ` a genuinely established fact, usable with full confidence in Concept Unit 4's second derivation.

---

## Concept Unit 4: A Recurrence for the Wasteful Call Count

### The Problem

`S(n) = 2ⁿ` explains the *output size* — how many subsets exist. It does not yet explain the wasteful version's `2047` calls for `n = 10`, a number Lesson 51 measured but never derived. That needs its own, separate recurrence.

### No isolated lab for this step

This concept has no code of its own to isolate — the second recurrence is derived and solved directly below, not through a construct with its own syntax.

### Applying It — Deriving and Solving C(n)

**Letting `C(n)` denote the number of calls the *wasteful* version (Lesson 51, Concept Unit 3) makes on an `n`-item list, examining its recursive case directly:** one call for the current level, plus a full, independent exploration of `(all-subsets-wasteful (cdr items))` — costing `C(n − 1)` calls — plus a *second*, entirely separate, full exploration of the identical smaller problem — costing another `C(n − 1)` calls.

**The recurrence:** `C(n) = 1 + C(n − 1) + C(n − 1) = 1 + 2 × C(n − 1)`, for `n > 0`.

**The base case:** `C(0) = 1` — the empty-list case makes exactly one call, itself, with no further recursion.

**Unfolding, the identical technique as Concept Unit 3:**

> `C(n) = 1 + 2 × C(n − 1)`
> `= 1 + 2 × (1 + 2 × C(n − 2)) = 1 + 2 + 4 × C(n − 2)`
> `= 1 + 2 + 4 × (1 + 2 × C(n − 3)) = 1 + 2 + 4 + 8 × C(n − 3)`
> `= ...`
> `= (1 + 2 + 4 + ... + 2ⁿ⁻¹) + 2ⁿ × C(0)`

**Recognizing the parenthesized sum as a geometric series (Lesson 26), and substituting `C(0) = 1`:** `1 + 2 + 4 + ... + 2ⁿ⁻¹ = 2ⁿ − 1` (a standard geometric sum), so `C(n) = (2ⁿ − 1) + 2ⁿ = 2ⁿ⁺¹ − 1`.

**Checking this against Lesson 51's exact, real, measured number:** `C(10) = 2¹¹ − 1 = 2048 − 1 = 2047` — matching the real, instrumented `2047` calls measured in Lesson 51, Concept Unit 3, exactly.

### Walkthrough

- **`C(n) = 1 + 2 × C(n − 1)`** — a second recurrence, derived directly from the wasteful version's own code, structurally similar to `S(n)`'s but with an extra `+1` accounting for the current level's own call.
- **The unfolding, producing a geometric series** — a reappearance of *geometric series* language (Lesson 26), recognized directly inside the unfolded expression rather than derived separately.
- **`C(10) = 2047`, matching Lesson 51's real output exactly** — the central payoff of this entire lesson: a number measured empirically in an earlier lesson, now derived independently, from first principles, and found to agree exactly.

### CS Lens

This is the completed answer to Concept Unit 1's original question: `2047` was never an arbitrary or mysterious number — it is `2¹¹ − 1`, following directly and necessarily from the wasteful procedure's own recursive structure, derivable in advance for any list length without running a single line of code. Also recognized in: an engineer predicting exactly how many rivets a bridge design requires, before construction begins, directly from the design's own specifications; a chemist predicting exactly how much product a reaction yields, before running it, directly from the reaction's own stoichiometry; a project manager predicting exactly how many total meetings a project requires, before it begins, directly from its own defined structure.

### SE Lens

The alternative to deriving `C(n)` is to remain permanently dependent on Lesson 51's measurement-only approach — useful for confirming a specific, already-built case, but offering no way to predict the cost of a *new* design before building and running it. The real cost of that alternative, for a real engineering decision (is this recursive structure practical for the actual input sizes expected in production), is having to build and test at full scale before finding out, rather than checking a closed-form prediction in advance. Deriving `C(n) = 2ⁿ⁺¹ − 1`, as this unit does, costs the careful recurrence-and-unfold work just completed; it means the exact cost of the wasteful design, at any size, is now knowable without ever running it.

---

## Concept Unit 5: Why This Matters — Predicting Cost Before Writing Code

### The Problem

Concept Unit 4's derivation could look, in isolation, like an interesting mathematical exercise disconnected from real engineering decisions. It's worth stating directly why the ability to set up and solve a recurrence is a genuinely practical skill, not merely a mathematical curiosity.

### No isolated lab for this step

This concept has no code of its own to isolate — the practical payoff is stated directly below, not through a construct with its own syntax.

### Applying It — What This Technique Actually Buys

**A question this lesson's technique can now answer, in advance, that Lesson 51's measurement alone could not:** how many calls would the wasteful version make on a twenty-item list, before ever running it? `C(20) = 2²¹ − 1 = 2,097,151` — over two million calls, derivable directly from the formula, with no need to wait for a slow, or possibly impractically long, real run to find out.

**Confirming the formula's predictive power is exactly what makes it useful, not merely its correctness:** Lesson 51 could only ever report what already happened, after running actual code; this lesson's closed form reports what *will* happen, for an input never actually tried, checked as reliable by the same induction proof (Concept Unit 3) this curriculum has trusted since Lesson 44.

**Connecting this directly to a design decision, tying back to Lesson 51's own closing:** knowing `C(n)` grows like `2ⁿ⁺¹` — before ever building the wasteful version at a large scale — is exactly the kind of advance knowledge that would justify choosing the `let`-based design from the very start, rather than discovering the problem only after building, running, and measuring the wasteful version first.

**Naming what comes next, honestly, as this curriculum's own forward-pointer discipline requires:** this lesson solved two specific recurrences by unfolding, checked against real numbers. A general, systematic way to solve recurrences of many different shapes — not just "unfold and recognize the pattern" — is the subject of a dedicated era later in this curriculum, building directly on the specific technique just practiced here.

### Walkthrough

- **`C(20) = 2,097,151`, computed from the formula alone** — the concrete demonstration of prediction, for an input size never actually run in this lesson or Lesson 51.
- **The explicit contrast between Lesson 51's after-the-fact measurement and this lesson's before-the-fact prediction** — not a new concept, but the precise statement of what this lesson's technique actually adds.
- **The honest forward-pointer to a later, more systematic treatment** — consistent with this curriculum's established practice (Lesson 14, Lesson 21) of naming what's ahead without overclaiming what's already been fully covered.

### CS Lens

This is the practical purpose behind every recurrence relation this curriculum will build from here forward: not a mathematical formality, but the tool that lets a design's cost be known and judged *before* committing real time to building and running it at full scale. Also recognized in: an architect's structural calculations, letting a building's safety be judged before construction; a financial model's projections, letting an investment's likely return be judged before committing capital; a flight plan's fuel calculations, letting a route's feasibility be judged before departure.

### SE Lens

The alternative to building this predictive skill is to remain dependent on Lesson 51's build-first, measure-after approach for every future design decision. The real cost of that alternative, for a genuinely large or costly system, could be substantial: discovering a design's impractical exponential cost only after building it and running it at a scale large enough to make the problem obvious, rather than predicting the problem from the recursive structure alone, the way this lesson's `C(n) = 2ⁿ⁺¹ − 1` now allows for any input size, checked and trusted before a single line of the wasteful version is ever run again.

---

## Closing

### Connect the pieces

Two numbers from Lesson 51, `2047` and `11`, along with two others, `8` and `32`, all traced through every unit built in this lesson, start to finish:

1. **The gap named (Unit 1):** Lesson 51's numbers were measured, never derived — this lesson asks whether they could have been predicted.
2. **A recurrence for subset count (Unit 2):** `S(n) = 2 × S(n − 1)`, `S(0) = 1`, extracted directly from `all-subsets`'s own code.
3. **Solved and proven (Unit 3):** `S(n) = 2ⁿ`, checked against Lesson 51's measured `8` and `32`, and proven by induction rather than merely observed.
4. **A recurrence for wasteful call count (Unit 4):** `C(n) = 1 + 2 × C(n − 1)`, solved to `C(n) = 2ⁿ⁺¹ − 1`, matching Lesson 51's measured `2047` exactly at `n = 10`.
5. **The predictive payoff, stated directly (Unit 5):** `C(20)` computed in advance, over two million, without ever running the wasteful procedure at that size.

Unit 4's final check, `C(10) = 2047`, is not a new measurement — it is Lesson 51's own real, already-verified number, now derived a completely independent way and found to agree exactly.

### What breaks without this

Suppose a design decision like Lesson 51's `let`-versus-double-call choice needed to be made for a genuinely large system, where actually building and running the "wasteful" version at full scale — to see whether it's actually a problem — would itself take hours, or days, or simply be impractical to attempt. Without this lesson's technique, the only way to know whether a given recursive design's redundancy is severe would be to build it and wait, exactly the limitation Concept Unit 5 named directly. With a recurrence derived and solved in advance, the way this lesson derived `C(n) = 2ⁿ⁺¹ − 1`, the severity of the problem is knowable from the design's own recursive structure alone, before committing any time to building or running it at the scale where the problem would actually become painfully obvious. Restoring this lesson's discipline — extracting a recurrence directly from a recursive procedure's own code, solving it by unfolding, and proving the solution by induction — is what turns "we'll find out once we build it" into "we already know, before we build anything at all."

### Exercises

1. **Observe.** Return to one of your own recursive procedures from Lesson 51's exercises, and extract a recurrence relation for either its output size or its own call count, directly from its recursive case, the way Concept Unit 2 extracted `S(n)`.
2. **Formalize.** Solve your Exercise 1 recurrence by unfolding, following Concept Unit 3's exact technique, arriving at a closed form.
3. **Formalize.** Prove your Exercise 2 closed form correct using mathematical induction, following Lesson 44's exact structure — base case, then inductive step.
4. **Explain.** Check your Exercise 3 closed form against any real numbers you measured in Lesson 51's own exercises, confirming agreement, the way Concept Unit 3 and Concept Unit 4 both checked against Lesson 51's real data.
5. **Explain.** Using your Exercise 3 closed form, predict what your procedure's output size or call count would be for an input roughly twice as large as anything you actually measured, the way Concept Unit 5 predicted `C(20)` without running it.

### Definition of done

- [ ] You can extract a recurrence relation directly from a recursive procedure's own code, stating both its base case and its recursive equation.
- [ ] You can solve a recurrence by unfolding, following Lesson 27's exact technique, to arrive at a closed-form expression.
- [ ] You can prove a closed-form solution correct using mathematical induction, rather than trusting the pattern from unfolding alone.
- [ ] You can use a proven closed form to predict a procedure's behavior at a scale you have not actually run or measured.
- [ ] You completed Exercises 1–5 using your own procedure from Lesson 51's exercises, not `all-subsets` or its wasteful sibling.
- [ ] Commit your Exercise 1–3 derivation and your Exercise 5 prediction, with a commit message stating what your Exercise 5 predicted value was, and whether you were able to confirm it against a real run.
