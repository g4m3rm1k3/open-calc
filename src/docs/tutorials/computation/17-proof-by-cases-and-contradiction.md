# Lesson 17: Proof by Cases and Contradiction

**What you will build**: By the end of this lesson you'll have two more proof techniques in this series' toolkit — splitting a claim into every possibility it could fall into and checking each one, and assuming a claim is false to derive an impossibility that proves it true. You'll also recognize that both techniques have already appeared quietly, several times, in earlier lessons' arguments, without being named.

**What you need to know first**: `apply-withdrawal`'s two-branch `if` and its role in previous lessons' invariant proofs, and Lesson 8's counterexample technique for disproving equivalence.

**Terms introduced in this lesson**:

- **proof by cases** (or **case analysis**) — splitting a claim into an exhaustive set of non-overlapping possibilities, and proving the claim holds within each one separately. *Why it matters*: a claim doesn't need one single argument covering every situation at once, if it can be split into a small number of situations, each individually easy to check completely.
- **exhaustive** — covering every possible case, with no gaps left unconsidered. *Why it matters*: the one property that makes proof by cases valid at all — a case split that misses even one possibility proves nothing about the missed case, however thoroughly the covered cases were checked.
- **proof by contradiction** — assuming a claim is false, deriving a logically impossible consequence from that assumption, and concluding the original claim must be true after all. *Why it matters*: a genuinely different strategy from directly building up to a claim — sometimes showing that the opposite assumption breaks something is more direct than constructing a positive proof from scratch.

**Objects and methods used**: None new. This lesson names and applies reasoning already used informally in earlier lessons.

---

## Concept Unit: Proof by Cases — Splitting Into Exhaustive Possibilities

### The Problem

Prove that for any number `x`, its absolute value is always at least as large as `x` itself — `|x| ≥ x`. Absolute value behaves differently depending on whether `x` is negative or not (`|5| = 5`, but `|-5| = 5`, not `-5`), so no single, uniform calculation covers every number at once. How does a proof handle a claim whose truth depends on which "kind" of input it's given?

### Introduce the concept in isolation

Split the claim into every possibility `x` could fall into — for a real number, exactly two: `x ≥ 0`, or `x < 0`. Nothing else is possible; every number is one or the other, never neither, never both.

**Case 1: `x ≥ 0`.** By the definition of absolute value, `|x| = x` for a non-negative number. So the claim `|x| ≥ x` becomes `x ≥ x` — true, with equality.

**Case 2: `x < 0`.** By definition, `|x| = -x` for a negative number. Since `x < 0`, `-x` is positive — and a positive number is always greater than a negative one, so `-x > x`. That means `|x| = -x > x`, which certainly satisfies `|x| ≥ x`.

Both cases prove the claim; together, they cover *every* number — there's no third possibility left unchecked. This is **proof by cases**: split into an **exhaustive** set of possibilities (here, `x ≥ 0` or `x < 0` — two cases, covering every real number with nothing left out and nothing double-counted), and prove the claim separately within each.

### Discard the throwaway example

Not applicable — this is a formal proof, checked against the definition of absolute value rather than run as code.

### Formal Definition, Walked Through

> A **proof by cases** for a claim *P* splits the domain into cases *C₁, C₂, ..., Cₙ* such that every element of the domain falls into at least one case (the cases are **exhaustive**), and proves *P* holds within each case individually.

- *"every element of the domain falls into at least one case"* — this is Lesson 9's universal quantifier applied to the *case split itself*, before it's even applied to the claim: for all `x`, `x ≥ 0` or `x < 0` — itself a claim worth being sure of, not assumed for free. For real numbers, this particular two-way split genuinely is exhaustive; a careless split (checked in Concept Unit 3) might not be.

### CS Lens

Proof by cases is the mathematical justification behind `if`'s own correctness: a two-branch `if` is only guaranteed to handle every possible input if its condition genuinely splits the input space exhaustively — true or false, with nothing else a boolean condition can be. Also recognized in: a legal contract's "in the event that... otherwise..." clauses (meant to cover every possible circumstance), and a flowchart with a single yes/no decision diamond at every branch point — each one, correctly built, an exhaustive two-way case split.

### SE Lens

The strength of a proof by cases depends entirely on the case split actually being exhaustive — a proof that checks `x > 0` and `x < 0` separately, and calls it complete, has silently left out `x = 0`, and nothing about how carefully the two checked cases were proven compensates for the missing one. This is exactly the discipline `apply-withdrawal`'s `if` already had, by construction: `>=` splits every possible balance-versus-amount comparison into exactly two cases, with no third possibility a number comparison could produce.

---

## Concept Unit: Proof by Contradiction — Assuming the Opposite

### The Problem

Prove that `apply-withdrawal`, given a non-negative starting balance, never returns a negative result — not by tracing every possible balance and amount (infinitely many pairs), but by a different strategy entirely: what if the claim were false, and where would that assumption lead?

### Introduce the concept in isolation

Recall `apply-withdrawal`'s definition:

```clojure
(defn apply-withdrawal [balance amount]
  (if (>= balance amount)
    (- balance amount)
    balance))
```

**Assume, for contradiction, that `apply-withdrawal` returns a negative number** for some non-negative `balance` and some `amount`. There are only two possible ways it could have returned that value — the same two branches Concept Unit 1's case split already relies on:

- **If the result came from `(- balance amount)`:** this branch only runs when `(>= balance amount)` is true — meaning `balance ≥ amount`, meaning `balance - amount ≥ 0`. But the result of this branch *is* `balance - amount`, which was just shown to be `≥ 0` — contradicting the assumption that the result is negative.
- **If the result came from `balance` (the else branch):** the result is just `balance` itself, unchanged — and `balance` was assumed non-negative from the start. A non-negative result, again contradicting the assumption that the result is negative.

Both possible sources of the result lead to a contradiction with the assumption. Since assuming "the result is negative" leads to an impossibility no matter which branch actually produced it, the assumption must be false: `apply-withdrawal` never returns a negative result, given a non-negative starting balance.

### Discard the throwaway example

Not applicable — this is a formal proof, using `apply-withdrawal`'s already-established definition rather than new code.

### Formal Definition, Walked Through

> A **proof by contradiction** of a claim *P* assumes ¬*P* (not *P*), derives a statement that is logically impossible from that assumption, and concludes *P* must be true.

- *"derives a statement that is logically impossible"* — in this unit's proof, the impossibility was concrete: the same value was shown to be both negative (the assumption) and non-negative (derived from the assumption, via `apply-withdrawal`'s own branches) — `x < 0` and `x ≥ 0` can't both be true of the same `x`, which is the actual contradiction the proof rests on.
- This proof also used proof by cases *inside* the contradiction: assuming the result was negative, both possible branches that could have produced it were checked, exhaustively, and each one independently contradicted the assumption — the two techniques compose directly, not as separate, unrelated tools.

### CS Lens

Proof by contradiction is the exact strategy behind proving a program *cannot* produce a certain bad outcome — rather than tracing every possible execution directly (often infeasible), assume the bad outcome occurs and show it's inconsistent with the program's own logic. Lesson 261 (*The Halting Problem*) is this series' most famous later use of exactly this technique — assuming a general halting-detector exists, and deriving a genuine logical impossibility from that assumption alone.

### SE Lens

A direct proof of "this can never go negative" would need to consider every possible balance and amount pair — infinitely many. Proof by contradiction sidestepped that entirely: instead of checking every pair directly, it assumed the *bad outcome* and showed the function's own structure rules it out, regardless of which specific numbers were involved. This is often the more tractable strategy exactly when a direct case-by-case check over the entire input space would be too large to complete.

### Connection to the previous unit

The previous unit split a claim into exhaustive cases and proved each one directly; this unit assumed the claim's opposite and used that same exhaustive case split — every branch `apply-withdrawal` could possibly take — to show the assumption is impossible from every angle, combining both techniques into one proof.

---

## Concept Unit: Where These Techniques Were Already Hiding

### The Problem

Both techniques in this lesson feel, on reflection, familiar — has this series actually been using them all along, under different names?

### Introduce the concept in isolation

**Proof by cases**, in disguise: every earlier lesson's argument about `apply-withdrawal`'s invariant checked *both* branches of its `if` separately — the maintenance step of the loop invariant proof was, precisely, a two-case proof by cases, exhaustive because `>=` genuinely produces only `true` or `false`, nothing else.

**Proof by contradiction**, in disguise: Lesson 8's counterexample technique for disproving logical equivalence is a contradiction proof running in miniature. Disproving "`and` is equivalent to `or`" worked by assuming they *were* equivalent (assuming they'd agree on every row) and exhibiting one row where they disagree — a direct impossibility, given the assumption of total agreement. Finding a single disagreeing row *is* deriving a contradiction from "they always agree."

Neither technique was new content when it first appeared — both were doing real work, unnamed, several lessons before this one gave them formal names.

### Generalizing

This is not a coincidence specific to this series' bank-account example: proof by cases and proof by contradiction are two of the most commonly reached-for tools in mathematics and computer science precisely because so many real claims naturally split into a small number of possibilities (a comparison's two outcomes, a value's sign, a boolean's two states) or are more easily disproven by assuming they hold and finding where that assumption breaks, than by building a positive argument from nothing.

### CS Lens

Recognizing an already-used argument as an instance of a named technique, retroactively, is itself a useful skill — it's what lets a single proof strategy (case analysis on a two-branch condition, say) be recognized instantly in a completely unfamiliar piece of code, rather than needing to be puzzled out fresh each time. Lesson 293 (*Read an Unfamiliar Problem*) leans on exactly this kind of pattern recognition, applied to problems instead of proofs.

### SE Lens

Knowing these techniques by name changes how a correctness argument gets *communicated*, not just how it's constructed: "this is a proof by cases over the `if`'s two branches" tells a reviewer exactly what to check (is the split really exhaustive? is each case actually proven?) far more precisely than an unstructured paragraph asserting the code "handles both situations correctly." Lesson 290 (*Code Review as Proof Review*) depends on exactly this: a reviewer who can name the technique being used can check it was applied correctly, not just that the conclusion sounds plausible.

### Connection to the previous unit

The previous unit combined proof by cases and proof by contradiction into one new proof; this unit looks backward and finds both techniques were already load-bearing in earlier lessons' arguments — proof that naming a technique doesn't create new power, it makes power that was already being used easier to recognize, check, and reuse deliberately.

---

## Connect the Pieces

One claim, proven with both techniques together, exercising every idea from this lesson: **no sequence of transactions processed by `apply-withdrawal`, starting from a non-negative balance, can ever produce a negative balance at any point** — the complete claim the last four lessons have been building toward from different angles.

**By cases** (Concept Unit 1, reused from the loop invariant's maintenance step): at each transaction, `apply-withdrawal`'s `if` produces exactly two possibilities — the subtraction branch or the unchanged branch — exhaustively covering every way one transaction could be processed.

**By contradiction** (Concept Unit 2): assume some transaction in the sequence *did* produce a negative balance. By the case split just named, it came from one of exactly two branches — and both were already shown, directly, to be incapable of producing a negative result from a non-negative input. Contradiction; no such transaction exists.

**By induction** (the previous three lessons): this argument, once established for *one arbitrary transaction* (the inductive step), extends to a sequence of any length via the base case and propagation already proven.

Three separate techniques — cases, contradiction, induction — converge on the exact same claim this series has been circling since Lesson 1, each one supplying a piece the others don't: cases handle "which branch," contradiction handles "assume it fails, show that's impossible," and induction handles "for a sequence of any length."

## What Breaks Without This

Suppose a case split were attempted for a *three-way* comparison — checking a transaction amount against zero using only `amount > 0` and `amount < 0` as the two cases, and treating that as exhaustive:

```
Case 1: amount > 0 — a genuine deposit or withdrawal.
Case 2: amount < 0 — treated as invalid, rejected.
"Every case is covered."
```

This case split isn't exhaustive — `amount = 0` falls into neither case, and whatever claim was being proven ("every transaction is either a valid positive amount or correctly rejected," say) is left completely unproven for that missing case, no matter how carefully cases 1 and 2 were checked. A zero-amount transaction might silently behave in some third, never-verified way — accepted, rejected, or something stranger — because the proof never actually considered it. This is precisely the gap Concept Unit 1 warned about: a case split's exhaustiveness has to be checked as its own claim, not assumed just because two cases were named.

## Exercises

1. **Trace.** Prove, by cases, that for any integer `n`, `n` is either even or odd, and that `n + n` is always even — checking both cases directly (an even number plus itself; an odd number plus itself).
2. **Predict.** Before proving it, predict whether "for any number `x`, `x * x ≥ 0`" needs a case split at all, or whether a single argument covers every number at once. Prove it either way.
3. **Contradiction.** Prove, by contradiction, that `apply-deposit` (given a positive `amount`) never returns a value smaller than the starting balance. Assume the opposite, and find the impossibility.
4. **Break it, on purpose.** Construct a case split — for any claim of your choosing — that looks exhaustive but actually misses one possibility, the way "What Breaks Without This" missed `amount = 0`. State the missing case explicitly.
5. **Generalize.** Combine cases and contradiction the way Concept Unit 2 did: prove, by contradiction using an exhaustive case split on `apply-withdrawal`'s two branches, that the function's result is always less than or equal to the starting balance (never larger).
6. **Reconstruct.** Close this lesson. From memory, explain why proof by contradiction and Lesson 8's counterexample technique are, underneath, the same idea — and why an exhaustive case split is a precondition for trusting a proof by cases, not an afterthought to check once the cases are already written.

## Definition of Done

- [ ] You can construct a proof by cases for a claim of your own, and explain why your case split is exhaustive.
- [ ] You can construct a proof by contradiction, correctly identifying the specific impossibility your assumption leads to.
- [ ] You completed Exercise 5, combining both techniques the way Concept Unit 2 did.
- [ ] You can explain, from memory, how Lesson 8's counterexample technique is a proof by contradiction in miniature.
- [ ] Commit your Exercise 5 proof to your notes repository, with a commit message naming both techniques used — for example, `"Prove apply-withdrawal never increases balance — contradiction assuming it does, ruled out by cases on both if branches"` — not just `"lesson 17 exercise"`.

---

**Next lesson:** Lesson 18, *The Computational Proof Mindset*, closes Section I by combining every technique built so far — specification, examples, invariants, induction, cases, contradiction, and testing — into one repeatable problem-solving method, the last piece before Section II's recursion and recursive data put all of it to real, sustained use.
