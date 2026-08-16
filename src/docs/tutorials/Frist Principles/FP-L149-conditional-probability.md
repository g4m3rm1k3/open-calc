# Lesson 149: Conditional Probability

**What you will build:** real, direct evidence for how learning that one real event has occurred changes the real probability of another — computed two genuinely different real ways and checked against each other. Real, verified evidence this session: over Lesson 147 and 148's own real, `36`-outcome two-dice sample space, the real probability of doubles, computed *directly*, is `0.1667`; but once it's real, known information that the sum is even — narrowing the real universe of possibility down to Lesson 148's own `18`-outcome even-sum event — the real probability of doubles rises to `0.3333`, exactly double, confirmed two ways: once by a real, general ratio formula, and once by literally restricting the sample space to the `18` real outcomes where the sum is even and recomputing doubles' own real probability from scratch inside that smaller real universe — both real methods agree exactly. Run the identical real question in the other real direction — given doubles, what's the real probability the sum is even — the real answer is `1.0`, *certainty*, not `0.3333`: a genuinely different real number for what might look like a related question. The transferable point: information changes probability by real, precise, computable amounts, never by intuition alone, and which real event is given and which is being asked about are not interchangeable — `P(A \mid B)` and `P(B \mid A)` are, this lesson's own real numbers show, often nowhere close to equal.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 147's own real sample space and Lesson 148's own real events, `event-doubles` and `event-even-sum`, and their own already-established real relationship (doubles entirely contained in even-sum) — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Sample space (Ω)** — the real, complete set of every possible outcome of a real random process.
- **Event** — a real, precise subset of a sample space, collecting every atomic outcome sharing some real, checkable property.
- **Conditional probability, `P(A | B)`** — the real probability that event `A` occurs, *given* that event `B` is already known to have occurred. It exists to give "how does knowing `B` change my belief about `A`" a real, precise, computable meaning, rather than an informal impression.
- **Restricted sample space** — the real, smaller universe of outcomes that remains possible once a specific event is known to have occurred — every outcome outside that event is no longer real, live possibilities at all, only ones that were never going to happen given what's now known.

**Objects and methods used**

- **`cond-prob`**
  - *What it is:* this lesson's own real procedure computing a conditional probability via the real ratio formula.
  - *Implementation:* given full real treatment in Concept Unit 3 below.
  - *Its use:* every conditional probability this lesson computes from Concept Unit 3 onward.
- **`event-intersection`**
  - *What it is:* Lesson 148's own real procedure returning the real, shared overlap between two events.
  - *Implementation:* `(define (event-intersection a b) (filter (lambda (x) (member x b)) a))`.
  - *Its use:* the real numerator every conditional probability in this lesson is built from.
- **`filter`** / **`length`** / **`member`**
  - *What it is:* real Scheme procedures, reused unchanged from earlier lessons — `filter` keeps only list elements satisfying a real predicate; `length` counts a list's own real elements; `member` checks whether a value occurs in a list.
  - *Implementation:* each takes a real predicate or value and a real list, returning a new real list or a real boolean-like result accordingly.
  - *Its use:* every real event and every real restricted sample space this lesson builds.

---

## Concept Unit 1: Does Knowing One Thing Change Another?

### The Problem

Lesson 148's own real evidence already revealed something worth asking about directly: every one of the `6` real "doubles" outcomes is also an "even sum" outcome. If someone is told, honestly, that a real dice roll's sum came out even — nothing more — does that real piece of information make it *more* likely the roll was doubles than it would otherwise be? Or does it change nothing at all?

### No isolated lab for this step

This unit introduces no new construct — Lesson 148's own real `event-doubles` and `event-even-sum`, given full real treatment in this lesson's own Header, are restated here as the concrete real question Concept Unit 2 and 3 answer directly.

### Reference Source

`event-doubles`, `event-even-sum` — no reference counterpart to quote verbatim this session, since they are this same lesson's own file, rebuilt fresh below using Lesson 147 and 148's own already-established real constructions.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — The Real Intuition, Stated Precisely

Before conditioning on anything, doubles' own real probability, computed over the full `36`-outcome sample space, is `6/36`. The real question this unit poses is whether that same real fraction still applies once the real universe of possibility has been narrowed to only the `18` outcomes where the sum is even — or whether, inside that smaller real universe, doubles makes up a real, different fraction of what remains.

### Walkthrough

- **The direct citation of Lesson 148's own real `6`-and-`18` numbers** — grounds this unit's own real question in already-verified evidence, not a fresh, unrelated example.
- **"a real, different fraction of what remains"** — previews Concept Unit 2's own real restriction approach before any code is written.

### CS Lens

This is Lesson 147's own real "a probability is always a fraction of a real, precisely-defined sample space" discipline, extended: this unit asks whether that real, defining sample space itself can legitimately change mid-problem, once real information arrives — and, Concept Unit 2's own real evidence shows, it can, and does.

### SE Lens

The alternative to checking this real question directly is assuming information never changes anything unless it obviously should — a real, informal judgment call. The real risk of that alternative, made concrete in Concept Unit 3: this lesson's own real numbers show information *can* change a real probability by a real, exact, computable factor (here, exactly double), and there is no substitute for actually computing it.

---

## Concept Unit 2: Conditioning as Restricting the Real Sample Space

### The Problem

Concept Unit 1 posed a real, checkable question. The most direct real way to answer it: if the sum is known to be even, the real universe of possibility genuinely shrinks to exactly the `18` outcomes in `event-even-sum` — every other real outcome is no longer live. Doubles' own real probability, *within that smaller real universe*, can be recomputed completely fresh.

### Reference Source

No reference counterpart — a from-scratch real application of Lesson 148's own already-established `event-doubles`/`event-even-sum`, restricting one to the other directly.

### Files affected

Created: `cond-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define restricted-to-even-sum event-even-sum)
(define doubles-within-restricted (filter event-doubles? restricted-to-even-sum))
```

### The Updated Project

This is `cond-check.scm`, in full — Lesson 147 and 148's own real sample space and events, quoted unchanged, with this unit's own real restriction added on top:

```scheme
(define die-faces (list 1 2 3 4 5 6))
(define two-dice-outcomes
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces)))
(define (event-doubles? p) (= (car p) (cdr p)))
(define (event-even-sum? p) (even? (+ (car p) (cdr p))))
(define event-doubles (filter event-doubles? two-dice-outcomes))
(define event-even-sum (filter event-even-sum? two-dice-outcomes))

(define restricted-to-even-sum event-even-sum)                      ; ← new
(define doubles-within-restricted (filter event-doubles? restricted-to-even-sum)) ; ← new

(display "=== CU2: doubles, recomputed within a real, restricted universe ===") (newline) ; ← new
(display "real |restricted universe| (even-sum): ") (display (length restricted-to-even-sum)) (newline) ; ← new
(display "real |doubles within restricted universe|: ") (display (length doubles-within-restricted)) (newline) ; ← new
(display "P(doubles), computed directly within the restricted universe: ") ; ← new
(display (exact->inexact (/ (length doubles-within-restricted) (length restricted-to-even-sum)))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define restricted-to-even-sum event-even-sum)`** — first appearance in this lesson of this real idea: `event-even-sum`, given full real treatment in this lesson's own Header, is reinterpreted here not merely as "a subset of outcomes sharing a property," but as an entire real, self-contained universe in its own right, once the sum is known to be even.
- **`(filter event-doubles? restricted-to-even-sum)`** — the identical real `filter` idiom Lesson 148 already used, applied now to the *restricted* real universe instead of the full `36`-outcome one — the real, direct way to ask "how much of what's left is doubles."
- **`(/ (length doubles-within-restricted) (length restricted-to-even-sum))`** — divides by the real, restricted universe's own size, `18`, not the original `36` — the real, precise meaning of "a fraction of what remains."
- **The real, exact `18`, `6`, and `0.3333`** — direct, measured confirmation: within the real, restricted universe of `18` even-sum outcomes, exactly `6` are doubles — a real, exact `1/3`, genuinely different from doubles' own original, unconditioned real probability, `1/6`.

### CS Lens

This is Lesson 91's own real Set ADT discipline, applied here with a real twist: `event-even-sum`, a real *subset* in Concept Unit 2's own original role, becomes, in this unit, the real *entire universe* a new, smaller probability problem is defined over — the identical real data, playing two genuinely different real structural roles depending on what's actually being asked.

### SE Lens

The alternative to literally rebuilding a restricted real sample space is reasoning informally about how doubles and even-sum "relate," without ever computing a real number over the genuinely smaller real universe. The real value of doing it directly: this unit's own real `0.3333`, computed by brute, direct restriction, is exactly what Concept Unit 3's own general formula needs to be checked against — a real, independent confirmation, not merely a formula trusted on its own.

### Run It — Show the Real Output

```
$ guile cond-check.scm
=== CU2: doubles, recomputed within a real, restricted universe ===
real |restricted universe| (even-sum): 18
real |doubles within restricted universe|: 6
P(doubles), computed directly within the restricted universe: 0.3333333333333333
```

Verified this session — within the real, restricted universe of `18` even-sum outcomes, doubles makes up exactly `6` of them, a real `1/3`, genuinely different from its own original, unconditioned real probability of `1/6`.

---

## Concept Unit 3: The Real Ratio Formula, and a Real Asymmetry

### The Problem

Concept Unit 2's own real, direct restriction approach works, but rebuilding an entire restricted sample space for every new real question is real, unnecessary work. A real, general formula, computable from quantities already known, would answer the identical question — and it's worth checking, honestly, whether asking the identical question in *reverse* — given doubles, what's the real probability the sum is even — gives the identical real answer or a genuinely different one.

### Reference Source

`event-intersection` — quoted unchanged in this lesson's own Header above, originally Lesson 148.

### Files affected

Modified: `cond-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — Deriving the Real Ratio From the Real Restriction

Concept Unit 2's own real computation was `|doubles ∩ even\text{-}sum| / |even\text{-}sum|` — the real size of the overlap, divided by the real size of the restricted universe. That's already a real, general formula, needing nothing but `event-intersection`, given full real treatment in this lesson's own Header, to compute directly: `P(A \mid B) = P(A \cap B) / P(B)`, or, equivalently, since both real probabilities share the identical real denominator (`36`), simply `|A \cap B| / |B|`.

### The New Code — Type It Yourself

```scheme
(define (cond-prob a-and-b b) (/ (length a-and-b) (length b)))
```

### The Updated Project

This is `cond-check.scm`, with Concept Unit 2's own file extended by this unit's own general formula, checked both directions:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (event-intersection a b) (filter (lambda (x) (member x b)) a))
(define inter-de (event-intersection event-doubles event-even-sum))

(define (cond-prob a-and-b b) (/ (length a-and-b) (length b))) ; ← new

(display "=== CU3: the real ratio formula, checked both directions ===") (newline) ; ← new
(display "P(doubles | even-sum) via ratio: ") (display (exact->inexact (cond-prob inter-de event-even-sum))) (newline) ; ← new
(display "P(even-sum | doubles) via ratio: ") (display (exact->inexact (cond-prob inter-de event-doubles))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (cond-prob a-and-b b) (/ (length a-and-b) (length b)))`** — first appearance in this lesson of this procedure; two real arguments, the real intersection (already computed) and the real event being conditioned *on* — divides the real overlap's own size by the real conditioning event's own size.
- **`(cond-prob inter-de event-even-sum)`** — computes `P(\text{doubles} \mid \text{even-sum})`: the real, shared overlap, divided by `event-even-sum`'s own real size, `18`.
- **`(cond-prob inter-de event-doubles)`** — computes `P(\text{even-sum} \mid \text{doubles})`: the identical real overlap, but now divided by `event-doubles`'s own real size, `6`, instead.
- **The real, exact `0.3333`, matching Concept Unit 2's own real, directly-restricted computation exactly** — direct, checked confirmation that the real, general ratio formula and the real, brute-force restriction approach agree completely.
- **The real, exact `1.0`, for the reversed real question** — direct, measured evidence of a genuine asymmetry: given doubles, the sum is *certainly* even (every real double sums to an even number, Lesson 148's own already-established real fact), while given an even sum, doubles is only a real `1`-in-`3` possibility among several ways an even sum could have happened.

### CS Lens

This is Lesson 17's own real relation asymmetry, recognized in a new setting: exactly as a real directed relation ("is a parent of") need not hold in both directions even when its own reverse ("is a child of") is closely related, `P(A \mid B)` and `P(B \mid A)` are two genuinely different real quantities, related but not interchangeable, computed from the identical real overlap divided by two different real denominators.

### SE Lens

The alternative to checking both real directions is computing whichever conditional probability is easiest to reach for and assuming the reverse question would give roughly the identical real answer. The real cost of that alternative, made stark by this unit's own real numbers: `0.3333` and `1.0` are not "roughly the same" by any real measure — a real system that confused the two, treating "given doubles, sum is even" and "given even sum, it's doubles" as interchangeable, would be off by a real factor of `3`, not a rounding error.

### Run It — Show the Real Output

```
$ guile cond-check.scm
=== CU3: the real ratio formula, checked both directions ===
P(doubles | even-sum) via ratio: 0.3333333333333333
P(even-sum | doubles) via ratio: 1.0
```

Verified this session — the real, general ratio formula matches Concept Unit 2's own direct restriction exactly for `P(\text{doubles} \mid \text{even-sum})`, `0.3333`, and reveals a genuine real asymmetry: `P(\text{even-sum} \mid \text{doubles})` is `1.0`, real certainty, not the same number at all.

---

## Concept Unit 4: Why the Real Asymmetry Makes Sense

### The Problem

Concept Unit 3's own real evidence showed `P(A \mid B) \ne P(B \mid A)`, a real, correct, but potentially surprising result. It's worth checking, with real numbers already in hand, exactly why — not just that the two real quantities differ, but what real, structural fact about this lesson's own two events makes the direction of conditioning matter so much.

### Reference Source

No reference counterpart — a real, direct reuse of every real number already computed in Concept Unit 2 and 3.

### Files affected

None — this unit draws entirely on values Concept Unit 2 and 3's own file already computed; no new code.

### Change type

None.

### Dependencies

None.

### Applying It — The Real Reason, Traced to a Real Size Difference

`P(\text{doubles} \mid \text{even-sum})` divides the real overlap, `6`, by `18` — a real, large denominator, since even-sum is a real, common event, and doubles is only one of several genuinely different ways an even sum can occur (Lesson 148's own real evidence: sums `2`, `4`, `6`, `8`, `10`, `12` are all even, and only the "matching pair" route to each of those sums counts as doubles). `P(\text{even-sum} \mid \text{doubles})` divides the identical real overlap, `6`, by `6` — a real, small denominator, since doubles is a real, rare, specific event, and the real fact "every double has an even sum" leaves *no* real room for exception. The real asymmetry comes entirely from `event-doubles` and `event-even-sum` being two real, very differently-sized events sharing the identical real overlap — divide the same real number by a big denominator or a small one, and the real result cannot come out the same.

### Walkthrough

- **The direct, numeric restatement of both real denominators, `18` and `6`** — grounds the real explanation in already-computed real values, not a fresh abstraction.
- **"no real room for exception"** — states plainly why the reversed conditional probability reached the real extreme, `1.0`, rather than merely a larger number.

### CS Lens

This is Lesson 20's own real counting discipline, applied to explain a probability rather than to compute one directly: the real asymmetry between `P(A \mid B)` and `P(B \mid A)` is, ultimately, always a real story about the relative real sizes of `A` and `B` — the smaller, more specific real event, conditioned on, tends to leave the *larger* real event's own presence looking closer to certain, exactly as this unit's own real `1.0` shows.

### SE Lens

The alternative to explaining this real asymmetry structurally is treating it as a fact to memorize — "conditional probability isn't symmetric" — without a real, checkable reason why. The real value of tracing it to the two real events' own differing sizes: it turns a real, surprising-sounding rule into something a reader can predict in advance for a *new* pair of events, simply by comparing their own real sizes, before ever computing either conditional probability directly.

---

## Closing

### Connect the pieces

One real overlap, two real directions, one real, structural explanation:

1. **The real question, posed (Unit 1):** does knowing the sum is even change doubles' own real probability?
2. **Real restriction, computed directly (Unit 2):** within the real `18`-outcome even-sum universe, doubles is a real `1/3`, not `1/6`.
3. **The real, general formula, checked both directions (Unit 3):** `0.3333` one way, `1.0` the other — a real, genuine asymmetry.
4. **The real, structural reason, traced (Unit 4):** the identical real overlap, divided by two very differently-sized real denominators.

Every claim in this lesson traces to real, executed code: a real, direct restriction of the sample space, a real, general ratio formula checked against it, and a real, reversed computation revealing an asymmetry traced back to real, already-known event sizes.

### What breaks without this

Suppose a real medical-testing system reported "if the test is positive, here's the real chance you have the condition" by silently reusing the real number for "if you have the condition, here's the real chance the test is positive" — treating the two conditional probabilities as interchangeable, the exact real confusion Concept Unit 3's own `0.3333`-versus-`1.0` result warns against. Depending on how rare the real condition is relative to how often the test comes back positive overall — precisely the real, structural asymmetry Concept Unit 4 traced to differing event sizes — those two real numbers could be worlds apart, with the confused version giving someone a badly, dangerously wrong real sense of their own situation.

### Exercises

1. **Observe.** Before checking, predict whether `P(\text{sum} \ge 10 \mid \text{doubles})` would be closer to `0.3333` or to `1.0`, using this lesson's own real Concept Unit 4 reasoning about event sizes to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — define a real `event-sum-at-least-10?` predicate and compute the real conditional probability using `cond-prob`.
3. **Formalize.** Compute `P(\text{doubles} \mid \text{sum} \ge 10)` as well, and confirm, with real code, whether this pair of conditional probabilities shows the identical kind of real asymmetry this lesson's own doubles-and-even-sum pair did.
4. **Explain.** In your own words, explain why `cond-prob`'s own real implementation never needed to divide by `36`, the sample space's own total size, anywhere — referencing what happens to that real factor when Concept Unit 3's own formula is derived from Concept Unit 2's own direct restriction.
5. **Explain.** Using this lesson's own real Concept Unit 4 reasoning, explain, in general terms, when `P(A \mid B)` and `P(B \mid A)` *could* come out equal, referencing what real relationship between `A` and `B`'s own sizes would have to hold.

### Definition of done

- [ ] You can state the real ratio formula for conditional probability and explain why it's equivalent to directly restricting the sample space.
- [ ] You can point to this lesson's own real `0.3333`-versus-`1.0` numbers as direct evidence that `P(A|B)` and `P(B|A)` are genuinely different quantities.
- [ ] You can explain, in terms of real event sizes, why that specific asymmetry came out the way it did.
- [ ] You completed Exercises 1–5, including a real, checked new conditional-probability pair of your own.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
