# Lesson 44: Mathematical Induction

**What you will build:** A complete proof that Lesson 27's recursive `sum(n)` always equals the closed-form formula `n(n+1)/2`, for every natural number `n` — checked against real Scheme output first, then established for good. The transferable problem this lesson is actually about: mathematical induction, the technique most learners meet first and think of as its own separate subject, is not actually separate from Lesson 43's structural induction at all. The natural numbers are recursively defined data, exactly like lists and trees, and mathematical induction is simply structural induction applied to that one specific, extremely common recursive definition.

**What you need to know first:** Lesson 21 (`FP-L021-finite-and-infinite-thinking.md`) — specifically the natural numbers and the `N + 1` argument, revisited directly as this lesson's own recursive data definition. Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically `sum(n)`'s exact recursive definition, reused directly as this lesson's central example. Lesson 43 (`FP-L043-structural-induction.md`) — specifically *structural induction* and *inductive hypothesis*, both directly specialized in this lesson rather than replaced.

**Terms introduced in this lesson**

- **Mathematical induction** — structural induction (Lesson 43), applied specifically to the natural numbers' own recursive definition: `0` is a natural number (the base case), and if `k` is a natural number, so is `k + 1` (the recursive case). A mathematical induction proof therefore has the identical two parts as any structural induction proof — a base case at `0`, and an inductive step showing `P(k)` implies `P(k + 1)` — just specialized to a data type this curriculum has used since Lesson 3, without ever naming its recursive structure until now.
- **Strong induction** — a variant of mathematical induction where the inductive step assumes `P` holds for *every* natural number up to `k`, not just `k` itself, before proving `P(k + 1)`. Strong induction is needed exactly when a recursive case depends on more than just the one immediately smaller instance — the same situation Lesson 29 already found for Fibonacci's two-step-back recursive case.

## Objects and methods used

None new. This lesson reuses `sum` (Lesson 27) and ordinary arithmetic, checked against a closed-form formula computed the same way.

---

## Concept Unit 1: Natural Numbers Are Recursively Defined Too

### The Problem

Lesson 21 described the natural numbers, `{0, 1, 2, 3, ...}`, and proved they never finish being counted — but never framed `0, 1, 2, 3, ...` itself as a recursive *definition*, the way Lesson 27 later defined factorial or Lesson 32 defined lists. It's worth stating this directly, because doing so is what makes Lesson 43's entire technique available for proofs about numbers specifically.

### No isolated lab for this step

This concept has no code of its own to isolate — recognizing the natural numbers' own recursive structure is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Defining ℕ the Way Lesson 27 Defined Factorial

**The base case:** `0` is a natural number.

**The recursive case:** if `k` is a natural number, then `k + 1` is a natural number.

**Confirming this is a genuine recursive definition, in Lesson 27's exact sense:** a base case, stated directly with no self-reference, and a recursive case building a larger instance from a smaller one — exactly the same shape as `0! = 1` and `n! = n × (n − 1)!`, or `'()` and `cons`-built lists.

**Confirming every natural number is reachable this way, connecting directly to Lesson 21's own argument:** `1` is `0 + 1`; `2` is `1 + 1`; every natural number is reached by applying the recursive case some finite number of times to the base case, `0` — the identical mechanism Lesson 21's `N + 1` argument already relied on, now recognized as literally the natural numbers' own defining recursive case.

### Walkthrough

- **`0` as the base case, `k + 1` as the recursive case** — first appearance of the natural numbers' own recursive definition, stated in exactly Lesson 27's format.
- **The direct comparison to factorial and lists** — confirms this is genuinely the same shape already used repeatedly, not a superficially similar but different idea.
- **The connection to Lesson 21's `N + 1` argument** — not a new concept, but the recognition that a mechanism already used in this curriculum was, all along, an instance of this recursive definition.

### CS Lens

This is the discovery that something used constantly since this curriculum's earliest lessons — plain counting numbers — was itself recursively defined the whole time, in exactly the same sense as every other recursive data type built since Lesson 27, simply never named that way because numbers feel too familiar to seem "defined" at all. Also recognized in: a calendar, which feels like a fixed, given structure but is actually recursively defined (today, and whatever day follows any given day); a queue at a counter, which feels like a simple line but is recursively defined (the front person, and the queue that remains behind them); a staircase, which feels like a fixed physical object but is recursively defined (one step, and the staircase that continues above it).

### SE Lens

The alternative to recognizing this explicitly is to keep treating "numbers" and "recursively defined data" as two unrelated categories — the first learned in early childhood, the second learned starting in Lesson 27 of this curriculum — never noticing they were the same kind of thing the entire time. The real cost of that alternative is losing the direct transfer Concept Unit 2 is about to supply: without recognizing ℕ's own recursive structure, mathematical induction has to be learned as an entirely separate technique, memorized on its own terms, rather than recognized as a specific instance of a tool already fully understood. Naming the connection explicitly, as this unit does, costs nothing beyond the comparison itself; it is what makes the rest of this lesson feel like direct application rather than new material.

---

## Concept Unit 2: Mathematical Induction — Structural Induction Applied to ℕ

### The Problem

Concept Unit 1 established that ℕ has a base case and a recursive case. Lesson 43 already supplies a complete proof technique for exactly this shape of definition — applying it here means specializing that already-established technique to this one specific recursive structure, rather than learning anything new.

### No isolated lab for this step

This concept has no code of its own to isolate — the specialization is stated directly below, not through a construct with its own syntax.

### Applying It — Specializing Lesson 43's Technique

**Lesson 43's general technique, restated:** prove `P` holds for the base case directly; assume `P` holds for every smaller instance a recursive case is built from, and show this implies `P` holds for the recursive case.

**Specialized to ℕ's specific recursive definition (Concept Unit 1):** prove `P(0)` directly; assume `P(k)` — the inductive hypothesis, exactly as Lesson 43 named it — and show this implies `P(k + 1)`.

**Naming this specialization directly:** mathematical induction — the exact technique most learners encounter first, revealed here as nothing more than structural induction, aimed at the one specific recursive data type (the natural numbers) that happens to come up constantly.

**Confirming nothing new is actually required beyond what Lesson 43 already established:** the reason the inductive hypothesis isn't circular reasoning, the reason both parts together cover every natural number, and the reason a recursive procedure's self-trust on smaller input is justified — every one of these was already fully explained in Lesson 43, for recursive data in general, and applies here without modification.

### Walkthrough

- **Lesson 43's technique, restated in full** — a direct reappearance of *structural induction*, examined here specifically for how it specializes.
- **The ℕ-specific version, base case `P(0)`, inductive step `P(k) → P(k + 1)`** — first appearance of *mathematical induction*, defined by exactly this specialization rather than as an independent technique.
- **"nothing new is actually required"** — not a new concept, but the precise, honest confirmation that this unit has added no new proof-theoretic machinery, only a specific, extremely common application.

### CS Lens

This is the recognition that a technique commonly taught as though it applied only to numbers is, underneath, exactly as general as Lesson 43 already established — and that recognizing this generality, rather than learning "induction on numbers" and "induction on data structures" as separate skills, is what actually saves effort going forward. Also recognized in: a single accounting principle, taught early using cash transactions specifically, later recognized as applying identically to any kind of asset; a single grammatical rule, taught early using regular verbs specifically, later recognized as the same rule underlying irregular ones; a single physical law, taught early using falling objects specifically, later recognized as governing orbital motion the same way.

### SE Lens

The alternative to recognizing this specialization is to treat mathematical induction as a wholly separate technique from Lesson 43's structural induction, learning its base-case-and-inductive-step form as though encountering it for the first time. The real cost of that alternative is redundant learning — re-deriving, from scratch, a justification for the inductive hypothesis that Lesson 43 already worked out in full generality. Recognizing the specialization directly, as this unit does, costs nothing beyond the comparison; it means Concept Unit 3's actual proof can proceed immediately, using a technique already fully trusted.

---

## Concept Unit 3: A Worked Proof — the Sum Formula

### The Problem

Lesson 27 defined `sum(n)` recursively and unfolded it by hand for `sum(4)`. A closed-form formula, `n(n + 1) / 2`, computes the identical value without any recursion at all — and it's worth proving, rigorously, for every natural number `n`, that the two genuinely always agree, rather than trusting the formula because it happens to be well known.

### No isolated lab for this step

This concept has no code of its own to isolate — the complete proof is given directly below, not through a construct with its own syntax.

### Applying It — the Full Proof

**The property `P(n)`, stated precisely:** `sum(n) = n(n + 1) / 2`.

**Base case: `n = 0`.** `sum(0) = 0`, by `sum`'s own base case (Lesson 27). `0(0 + 1) / 2 = 0`. Both sides equal `0`. `P(0)` holds.

**Inductive step: assume `P(k)` holds for some natural number `k` — that is, `sum(k) = k(k + 1) / 2`. Show `P(k + 1)` holds.**

> 1. `sum(k + 1) = (k + 1) + sum(k)`, by `sum`'s own recursive case (Lesson 27).
> 2. By the inductive hypothesis, `sum(k) = k(k + 1) / 2`. Substituting into Step 1: `sum(k + 1) = (k + 1) + k(k + 1) / 2`.
> 3. Factoring out `(k + 1)`: `sum(k + 1) = (k + 1) [1 + k / 2] = (k + 1)(k + 2) / 2`.
> 4. Checking this matches what `P(k + 1)` actually claims: `P(k + 1)` states `sum(k + 1) = (k + 1)((k + 1) + 1) / 2 = (k + 1)(k + 2) / 2` — exactly what Step 3 derived.

**Confirming both parts together establish the claim for every natural number, exactly as Concept Unit 2 requires:** `P(0)` is proven directly; `P(k) → P(k + 1)` is proven for an arbitrary `k`, so `P(1)` follows from `P(0)`, `P(2)` follows from `P(1)`, and so on, covering every natural number without ever checking one individually.

**Checking this against real, running code before trusting it fully — evidence, in Lesson 22's sense, gathered honestly before the proof, not instead of it:**

```
$ guile -q
scheme@(guile-user)> (define (sum n) (if (= n 0) 0 (+ n (sum (- n 1)))))
scheme@(guile-user)> (define (closed-form n) (/ (* n (+ n 1)) 2))
scheme@(guile-user)> (list (sum 10) (closed-form 10))
$1 = (55 55)
scheme@(guile-user)> (list (sum 100) (closed-form 100))
$2 = (5050 5050)
scheme@(guile-user)> (= (sum 100) (closed-form 100))
$3 = #t
```

Verified this session — agreement at `n = 10` and `n = 100`, consistent with, and no longer needed to establish, what the proof above already guarantees for every natural number.

### Walkthrough

- **The base case, `n = 0`, both sides `0`** — a direct application of Concept Unit 2's specialized technique.
- **Step 1, reappearing `sum`'s exact recursive case from Lesson 27** — grounds the proof in the real definition, not an abstract restatement.
- **Step 2, substituting the inductive hypothesis directly** — the crux of the entire proof, using the assumption exactly the way Lesson 43's Concept Unit 3 used its own inductive hypothesis for `inorder`.
- **Step 4, checking the algebra against what `P(k + 1)` actually needed to say** — confirms the derived formula genuinely matches the claim being proven, not merely something similar-looking.

### CS Lens

This is a complete, general proof connecting a recursive algorithm (`sum`) to a closed-form formula — establishing, for the first time in this curriculum with actual certainty, that the two compute identically for every natural number, not merely the ones checked. Also recognized in: proving a recursive algorithm's running time matches a closed-form formula, the standard method complexity analysis will use throughout this curriculum's later eras; proving a recursively defined sequence (like compound interest, computed period by period) matches a closed-form financial formula; proving a physical process modeled recursively (position updated step by step) matches a closed-form equation of motion.

### SE Lens

The alternative to writing this proof is to trust the closed-form formula because it's well known and matches every example checked, exactly the evidence-only confidence Lesson 22 already warned isn't the same as certainty. The real cost of that alternative, however unlikely the formula actually being wrong might seem, is treating a widely repeated claim as though repetition itself were verification — a habit this curriculum has consistently pushed back against since Lesson 22's very first lesson on this subject. Writing the complete inductive proof, as this unit does, costs the real algebraic work of Steps 1 through 4; it establishes the connection between `sum` and its closed form with the same rigor this curriculum has demanded of every other claim it has relied on.

---

## Concept Unit 4: Connecting Induction Directly to Recursive Algorithms

### The Problem

Concept Unit 3's proof and `sum`'s own recursive definition are not two separate things that happen to resemble each other — they are the same structure, examined from two different angles. It's worth stating this connection as directly and concretely as possible, since it's the whole reason mathematical induction is worth knowing at all for someone building recursive algorithms rather than only studying pure mathematics.

### No isolated lab for this step

This concept has no code of its own to isolate — the direct correspondence between the proof and the code is demonstrated below, not through a construct with its own syntax.

### Applying It — Reading the Proof and the Code Side by Side

**`sum`'s definition, from Lesson 27:**

```scheme
(define (sum n)
  (if (= n 0)
      0
      (+ n (sum (- n 1)))))
```

**The proof's base case, matched directly to the code's base case:** `sum(0) = 0` — exactly the `(if (= n 0) 0 ...)` branch, read directly.

**The proof's inductive step, matched directly to the code's recursive case:** `sum(k + 1) = (k + 1) + sum(k)` — exactly `(+ n (sum (- n 1)))`, read with `n` playing the role of `k + 1` and `(- n 1)` playing the role of `k`.

**Stating the practical payoff directly:** anyone who has already written a correct recursive procedure, following Lesson 27's base-case-and-recursive-case discipline, has already done most of the work of a mathematical induction proof about that procedure — the base case and inductive step are visible directly in the code's own two branches. Writing the actual proof means making explicit, and verifying algebraically, a correspondence the code's own structure already suggests.

### Walkthrough

- **`sum`'s code, reappearing from Lesson 27** — examined here specifically for its direct correspondence to Concept Unit 3's proof.
- **The base case and inductive step, each matched line by line against the code's two branches** — not a new concept, but the explicit, side-by-side comparison this lesson's entire argument has been building toward.
- **The stated practical payoff** — a direct, honest statement of why this matters for someone who writes recursive algorithms rather than only studies proofs about them in the abstract.

### CS Lens

This is the direct, practical realization of Lesson 43's own closing point — structural recursion and structural induction share one underlying justification — made completely concrete for a specific, already-familiar procedure, closing the loop between "here is a proof technique" and "here is exactly how it applies to code you've already written." Also recognized in: an engineer's stress calculation directly mirroring the physical structure of the beam it analyzes, joint by joint; a financial audit directly mirroring a company's own ledger structure, entry by entry; a legal brief directly mirroring the structure of the statute it interprets, clause by clause.

### SE Lens

The alternative to drawing this correspondence explicitly is to treat mathematical induction as a purely mathematical exercise, disconnected from the actual recursive code it's capable of proving things about. The real cost of that alternative is exactly the artificial separation this curriculum's own stated philosophy warns against — a learner who can write correct recursive Scheme procedures and separately prove abstract induction exercises, without ever recognizing the two are the same underlying skill applied in two directions. Drawing the correspondence directly, line by line, as this unit does, costs one careful side-by-side reading; it is what makes mathematical induction feel like a tool for reasoning about the exact code already being written, not a separate academic exercise.

---

## Concept Unit 5: Strong Induction — When You Need More Than Just "The Step Before"

### The Problem

Concept Unit 3's proof only ever needed `P(k)` to establish `P(k + 1)` — exactly matching `sum`'s recursive case, which only ever needs `sum(k)` to compute `sum(k + 1)`. Lesson 29 already found a recursive definition that doesn't fit this shape: Fibonacci's recursive case needs *two* smaller instances, `fib(k)` and `fib(k − 1)`, not just the one immediately before `fib(k + 1)`. Proving something about Fibonacci by induction needs a correspondingly stronger inductive hypothesis.

### No isolated lab for this step

This concept has no code of its own to isolate — the generalized technique is stated directly below, connecting explicitly to Lesson 29's own Fibonacci discussion, not through a construct with its own syntax.

### Applying It — Strengthening the Inductive Hypothesis

**Ordinary mathematical induction's inductive step, restated:** assume `P(k)`; prove `P(k + 1)`.

**What this cannot directly support, connecting to Lesson 29's own finding:** a claim about `fib(n)` whose proof needs to reference both `fib(n − 1)` and `fib(n − 2)` — ordinary induction's inductive hypothesis, `P(k)` alone, says nothing about `P(k − 1)`.

**The strengthened technique:** assume `P` holds for *every* natural number from `0` up to `k` — not just `k` itself — and use whichever of those the inductive step actually needs.

**Naming this directly:** strong induction — identical in its base case, differing only in how much the inductive step is allowed to assume.

**Confirming this is still fully justified by Lesson 43's original argument, not a separate leap of faith:** every one of the natural numbers from `0` up to `k` is still strictly smaller than `k + 1`, and Lesson 43's justification for trusting smaller instances never actually required trusting only the *one* immediately smaller instance — it applies equally to trusting every smaller instance at once, which is all strong induction actually does.

### Walkthrough

- **Ordinary induction's inductive step, restated** — a reappearance of Concept Unit 2's specific form, examined here for its actual limit.
- **The connection to Lesson 29's Fibonacci finding** — a direct reappearance of that lesson's own diagnosis (two recursive calls needing two smaller instances), now recognized as exactly the situation strong induction exists to handle.
- **"strong induction"** — first appearance of the term, defined by direct contrast with ordinary induction's single-step-back assumption.
- **The confirmation that this remains justified by Lesson 43's original argument** — not a new concept, but reassurance that strengthening the assumption isn't a weaker or riskier move; it's the same justified trust, extended to more of the smaller instances already available.

### CS Lens

This is the direct proof-side counterpart to Lesson 29's own finding about Fibonacci's recursive case — a recursive definition needing more than the one immediately smaller instance needs an inductive hypothesis assuming more than the one immediately smaller case, for exactly the same underlying reason. Also recognized in: a genealogical claim needing to reference not just a person's parents but their grandparents as well, requiring an inductive hypothesis covering more than one generation back; a numerical method needing not just the previous time step but the two before it, requiring an inductive hypothesis covering more than one step back; a legal precedent argument needing to reference not just the immediately prior ruling but an entire line of earlier rulings.

### SE Lens

The alternative to recognizing when strong induction is needed is to attempt an ordinary induction proof on a claim like Fibonacci's regardless, and become stuck exactly where the inductive step needs information ordinary induction's hypothesis doesn't provide — the proof-writing equivalent of the wall Lesson 39, Concept Unit 5, ran into trying to make `fib` tail recursive with only a single accumulator. Recognizing in advance, from the recursive definition's own shape, whether ordinary or strong induction is needed, as this unit teaches, costs nothing beyond checking how many smaller instances the recursive case actually references; it prevents the wasted effort of a stalled proof attempt built on an inductive hypothesis too weak for the claim at hand.

---

## Closing

### Connect the pieces

One recursive procedure, `sum(n)`, and one closed-form formula, traced through every unit built in this lesson, start to finish:

1. **ℕ recognized as recursive data (Unit 1):** `0` as base case, `k + 1` as recursive case — the same shape as every other recursive definition in this curriculum.
2. **Mathematical induction named as a specialization (Unit 2):** Lesson 43's structural induction, aimed specifically at ℕ's own recursive definition.
3. **The sum formula proven completely (Unit 3):** `sum(n) = n(n + 1)/2`, established for every natural number, then checked against real Scheme output.
4. **The proof matched directly to the code (Unit 4):** base case and inductive step shown to correspond, line by line, to `sum`'s own two branches.
5. **The technique strengthened for harder cases (Unit 5):** strong induction, needed whenever a recursive case (like Fibonacci's) depends on more than one smaller instance.

Unit 4's correspondence directly explains why Unit 3's proof was structured the way it was — not a separate observation, but the precise reason the proof's two parts mirrored `sum`'s own two branches so exactly.

### What breaks without this

Suppose a closed-form formula were proposed for some other recursive procedure this curriculum has already built — a formula for `factorial`, say, or for `tree-size` applied to a specific family of trees — and accepted on the strength of matching a handful of checked examples, the same unproven confidence Lesson 22's `n² + n + 41` warned against, now specifically in the context of a formula meant to replace a working recursive procedure entirely, perhaps for performance reasons. If the formula were subtly wrong — correct for small inputs, diverging at some larger one never checked — replacing the trusted recursive procedure with it would silently introduce a real defect, difficult to trace back to its actual cause since the recursive procedure it replaced had already been fully trusted and was no longer being run to compare against. Restoring this lesson's discipline — proving a proposed closed-form formula matches its recursive original via mathematical induction, the way Concept Unit 3 did for `sum`, before ever trusting it to replace working, verified code — is what prevents this exact category of silent regression.

### Exercises

1. **Observe.** Choose a recursive numeric procedure from your own earlier exercises (Lesson 27 or Lesson 30) and propose a closed-form formula you believe matches it, checked first against two or three real values.
2. **Formalize.** State your Exercise 1 claim precisely, in the form `P(n)`, the way Concept Unit 3 stated `sum(n) = n(n + 1)/2`.
3. **Formalize.** Write the complete mathematical induction proof for your Exercise 1 claim, following Concept Unit 3's exact structure — base case, inductive hypothesis stated explicitly, and the algebra connecting them.
4. **Explain.** Match your Exercise 3 proof's base case and inductive step directly to your Exercise 1 procedure's own two branches, the way Concept Unit 4 matched `sum`'s proof to its code, line by line.
5. **Explain.** Determine whether your Exercise 1 procedure's recursive case depends on exactly one smaller instance or more than one, and state whether ordinary or strong induction would be needed to prove a claim about it, using Lesson 29's Fibonacci diagnosis as a model.

### Definition of done

- [ ] You can state the natural numbers' own recursive definition, and explain why mathematical induction is a specialization of structural induction rather than a separate technique.
- [ ] You can write a complete mathematical induction proof connecting a recursive procedure to a closed-form formula, checked against real code first as evidence, then established properly as proof.
- [ ] You can match a proof's base case and inductive step directly to a recursive procedure's own two branches, line by line.
- [ ] You can determine, from a recursive definition's own shape, whether ordinary or strong induction is needed to prove a claim about it.
- [ ] You completed Exercises 1–5 using a procedure of your own choosing, not `sum`.
- [ ] Commit your Exercise 3 proof and the real code check that preceded it, with a commit message stating whether your Exercise 1 formula turned out to be correct, and if not, at what value it first diverged.
