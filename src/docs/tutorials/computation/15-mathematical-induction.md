# Lesson 15: Mathematical Induction

**What you will build**: By the end of this lesson you'll be able to state mathematical induction formally and use it to prove an actual formula correct for every natural number at once — not the informal domino picture from the previous lesson, but the precise logical statement it was standing in for, together with a sharp understanding of why *both* of its two parts are load-bearing, not just one.

**What you need to know first**: The previous lesson's base case and inductive step, Lesson 9's universal quantifier and existential quantifier, Lesson 7's implication (this lesson leans on its exact truth table directly), and Lesson 13's factoring.

**Terms introduced in this lesson**:

- **inductive hypothesis** — the assumption, made only within an inductive step's own argument, that a property already holds for some case *k*, used to derive that it also holds for case *k+1*. *Why it matters*: distinguishes the base case's unconditional, direct check from the inductive step's conditional one — the inductive step never claims *k*'s case is actually true, only that *if* it were, *k+1*'s case would follow.
- **vacuous truth** — a conditional statement that comes out true only because its premise is false, saying nothing meaningful about the case it appears to cover. *Why it matters*: explains precisely how an inductive step can "check out" for a completely wrong claim, if nothing ever confirms the premise is actually true anywhere — exactly what Concept Unit 3 demonstrates directly.

**Objects and methods used**: None new. This lesson is a formal proof technique, illustrated with arithmetic already available since Lesson 2.

---

## Concept Unit: The Formal Statement of Induction

### The Problem

The previous lesson's dominoes gave an intuitive picture — first one falls, each knocks over the next, so all of them fall. What is that picture actually claiming, stated with the same precision Lesson 9's quantifiers and Lesson 7's implication already brought to other claims?

### Introduce the concept in isolation

Let *P(n)* stand for some claim about a natural number *n* — for instance, "the balance is non-negative after *n* transactions," from the previous lesson. Mathematical induction states:

> If *P(0)* is true, **and** for every *n*, *P(n)* implies *P(n+1)*, **then** *P(n)* is true for every natural number *n*.

Every piece of this is vocabulary this series has already built precisely:

- *"P(0) is true"* — the base case, checked directly, exactly as before.
- *"for every n"* — Lesson 9's universal quantifier, ranging over every natural number.
- *"P(n) implies P(n+1)"* — Lesson 7's implication, applied to two instances of the same claim, one step apart. This is the inductive step, restated using the exact connective whose truth table this series already derived.
- *"then P(n) is true for every natural number n"* — the conclusion: not "probably," not "checked so far," but a universal claim over an infinite domain, established from exactly two finite facts.

The domino picture and this statement are the same claim: *P(n)* is "domino *n* falls"; the base case is domino 0 falling; the inductive step, "*P(n)* implies *P(n+1)*," is "if domino *n* falls, domino *n+1* falls" — stated as a genuine implication, with its own truth table, not just a picture.

### Discard the throwaway example

Not applicable — this is a formal statement, not throwaway code; Concept Unit 2 applies it to a real claim.

### Formal Definition, Walked Through

Already walked through, clause by clause, above — the definition itself *is* this unit's content, reusing three already-precise pieces of vocabulary (universal quantification, implication, the base-case/inductive-step shape) rather than introducing new machinery.

### CS Lens

Stating induction with Lesson 7's implication, specifically, rather than some vaguer "leads to" or "causes," matters because implication has an exact truth table — and Concept Unit 3 of this lesson depends entirely on one specific row of it (a false premise makes the whole implication true, regardless of the conclusion) to explain a genuine, easy-to-fall-into mistake. Also recognized in: a formal system's axioms and inference rules (an axiom is a "base case" accepted without proof; an inference rule is an "inductive step" — apply it repeatedly to reach any theorem it can produce), and Lesson 259's *Turing machines*, whose entire theory of what's computable rests on exactly this kind of "base configuration, plus a rule for the next step" structure.

### SE Lens

Precision here isn't pedantry: the previous lesson's domino picture is intuitively convincing, and intuition is exactly the kind of thing that can convince someone a flawed argument is sound. Pinning the technique down to "check this specific implication, formally" — rather than "does this feel like the property keeps propagating" — is what makes it possible to catch the mistake Concept Unit 3 demonstrates, one that feels perfectly fine intuitively and is provably not a proof at all.

---

## Concept Unit: Proving a Formula by Induction — the Sum of the First *n* Numbers

### The Problem

Claim: the sum of the first *n* positive integers — `1 + 2 + 3 + ... + n` — always equals `n(n+1)/2`. Checking this for `n = 4` (`1+2+3+4 = 10`, and `4×5/2 = 10`) and `n = 5` (`1+2+3+4+5 = 15`, and `5×6/2 = 15`) is reassuring, but it's Lesson 9's exhaustive-checking limitation all over again — those two checks say nothing about `n = 1{,}000{,}000`. Prove it for every `n` at once.

### Introduce the concept in isolation

**Base case**, `n = 1`: the sum of the first `1` positive integer is just `1`. The formula gives `1 × (1+1) / 2 = 1 × 2 / 2 = 1`. They match — the base case holds, checked directly, with nothing assumed.

**Inductive step**: assume, as the **inductive hypothesis**, that the formula holds for some specific `k` — that is, assume `1 + 2 + ... + k = k(k+1)/2`. Using only this assumption and ordinary algebra, show the formula also holds for `k+1`:

```
1 + 2 + ... + k + (k+1)
= [1 + 2 + ... + k] + (k+1)              (just grouping the last term separately)
= k(k+1)/2 + (k+1)                        (substitute the inductive hypothesis — Lesson 6's substitution, applied to an assumed equality)
= (k+1) × [k/2 + 1]                       (factor out (k+1) — Lesson 13's factoring)
= (k+1) × (k+2)/2                         (combine k/2 + 1 into a single fraction)
= (k+1)((k+1)+1)/2                        (rewritten to match the formula's own shape, with k+1 in place of n)
```

That last line is *exactly* the claimed formula, with `k+1` substituted for `n`. The inductive step is complete: assuming the formula holds for `k`, it necessarily holds for `k+1` — using nothing but substitution and factoring, both already established techniques, applied to a claim rather than to a single number.

By the previous unit's formal statement — base case true, inductive step true for every `k` — the formula `1 + 2 + ... + n = n(n+1)/2` is proven for *every* positive integer `n`, including the millionth one, without checking it directly.

### Discard the throwaway example

Not applicable — this proof, once established, is a permanent fact this series can now cite rather than discard.

### Mechanical walkthrough — how it works in isolation

- **Substituting the inductive hypothesis** — the single most important step: `1 + 2 + ... + k` was replaced by `k(k+1)/2`, licensed only because the inductive hypothesis *assumed* they were equal. Nothing here claims to know the hypothesis is actually true for any specific `k` — only that *if* it were, the rest of the derivation follows.
- **Factoring `(k+1)` out of `k(k+1)/2 + (k+1)`** — the identical technique from Lesson 13's factoring unit, applied to an expression containing a variable `k` instead of a specific number, proving the algebra generalizes exactly the way that lesson's SE lens claimed it would.

### CS Lens

This proof pattern — base case directly verified, inductive step built from substitution and algebra — is the exact template Lesson 20 will follow to prove a *recursive function* correct: verify it directly on the smallest input, then show that if it's correct on a smaller input, it's correct on the input built from that smaller one. The sum formula proven here, in fact, is precisely what a recursive summing function will be proven to compute, once Section II introduces one.

### SE Lens

A formula proven correct this way can be trusted for every input size without ever running it on the largest ones — a guarantee no amount of testing large inputs directly could match, since testing a million-element case only confirms that one case, while this proof confirms all of them, including cases too large to ever practically test by direct computation.

### Connection to the previous unit

The previous unit stated induction's two required pieces formally; this unit filled both in completely, for a real, checkable, non-obvious mathematical claim — turning the abstract template into a concrete, working proof.

---

## Concept Unit: Why Both Parts Are Required

### The Problem

The inductive step in Concept Unit 2 was genuine algebra, carefully justified. Is it possible for an inductive step to look just as convincing — and be checked just as carefully — while the overall claim is still completely false?

### Introduce the concept in isolation

Consider a deliberately wrong claim: `1 + 2 + ... + n = n(n+1)/2 + 5` — the correct formula, plus `5`. Check the inductive step exactly as before, assuming this *wrong* formula holds for `k`:

```
1 + 2 + ... + k + (k+1)
= [k(k+1)/2 + 5] + (k+1)                  (substitute the wrong inductive hypothesis)
= [k(k+1)/2 + (k+1)] + 5                  (regroup — the +5 just rides along, untouched)
= (k+1)(k+2)/2 + 5                        (the identical factoring from Concept Unit 2)
= (k+1)((k+1)+1)/2 + 5                    (matches the wrong formula's own shape, for k+1)
```

The inductive step **checks out perfectly** — the `+5` never interfered with the algebra at all, because adding a constant to both sides of an assumed equality and tracking it through addition and factoring doesn't break anything. If the inductive step alone were enough, this wrong formula would be "proven." It isn't, because the base case fails:

```
n = 1: LHS = 1.  RHS = 1×2/2 + 5 = 1 + 5 = 6.  1 ≠ 6.
```

The base case is false, so the whole claim is false for every `n` — off by exactly `5`, always, which is exactly what checking one concrete case reveals immediately.

This is **vacuous truth**, made concrete: the inductive step "`P(k)` implies `P(k+1)`" was checked and found true — but per Lesson 7's own truth table for implication, an implication is true whenever its premise is false, and nothing in Concept Unit 2's inductive-step check ever confirmed the premise (`P(k)`, the wrong formula) was actually true for any real `k`. The implication held *vacuously* — true regardless of whether `P(k)` ever really occurs — because the inductive step, by its very nature, only ever checks "does the property propagate," never "does the property start out true anywhere."

### Discard the throwaway example

Not applicable — this deliberately-wrong formula is a proof of a point, not a claim this series adopts.

### Mechanical walkthrough — how it works in isolation

- **The `+5` surviving the entire derivation untouched** — proves the inductive step's algebra was never actually testing whether the *formula itself* was correct, only whether the *relationship between consecutive cases* was consistent. A constant offset is exactly the kind of error this check is structurally blind to.

### CS Lens

This is the same shape as a recursive function with correct recursive logic but a wrong base case — Lesson 22 (*Base Cases and Progress*) names this directly as a real, common bug category: code that correctly reduces a large problem to a smaller one, every time, but never terminates correctly because the smallest case itself returns the wrong answer, and that one wrong answer then propagates through every larger case built on top of it, undetected by any amount of checking the reduction step alone.

### SE Lens

Skipping the base case because "the inductive step obviously works" is not a shortcut — it's skipping the only part of the proof that ever confirms the claim is true *anywhere at all*. The inductive step, this unit just proved, can hold perfectly for an entirely false claim; treating it as sufficient on its own is a mistake this lesson exists specifically to make impossible to fall into unknowingly.

### Connection to the previous unit

The previous unit proved a true formula using both parts together; this unit isolates exactly what goes wrong when only one part — the part that feels like "the real work" — is checked, and the other is assumed or skipped.

---

## Connect the Pieces

Both proofs, side by side, sharing every technique this lesson used:

| | Correct formula: `n(n+1)/2` | Wrong formula: `n(n+1)/2 + 5` |
|---|---|---|
| Base case (`n=1`) | `1 = 1×2/2 = 1` ✓ | `1 ≠ 1×2/2 + 5 = 6` ✗ |
| Inductive step | Holds — verified by substitution and factoring | Holds — identical algebra, the `+5` rides along unchanged |
| Conclusion | **Proven true for every n** | **Not proven — base case fails** |

The inductive step alone cannot distinguish these two rows — it holds identically in both, which is exactly Concept Unit 3's point. Only the base case tells them apart, and it's the base case, not the inductive step, that ultimately decides whether the whole claim is true.

## What Breaks Without This

Suppose someone "proved" the wrong formula by checking only the inductive step, reasoning "the algebra works out, so it must be correct" — precisely the shortcut Concept Unit 3 warned against. Using this "proof," the wrong formula would predict, for `n = 100`: `100×101/2 + 5 = 5050 + 5 = 5055` — a specific, wrong, confidently-stated number, `5` more than the true sum, `5050`. The error isn't subtle or hard to state; it's exactly `5`, every time, for every `n` — and it would have been caught by the single cheapest check available (the base case, `n=1`) rather than discovered later by whoever eventually needed the correct value and got `5055` instead.

## Exercises

1. **Trace.** Verify Concept Unit 2's formula directly for `n = 6` (compute `1+2+3+4+5+6` and `6×7/2` separately) as a sanity check, distinct from trusting the induction proof alone.
2. **Predict.** Before deriving it, predict whether the inductive step would still "check out" for the wrong formula `n(n+1)/2 - 3` (subtracting instead of adding a constant). Derive it and confirm.
3. **Prove.** Using induction, prove that the sum of the first `n` *even* numbers (`2 + 4 + 6 + ... + 2n`) equals `n(n+1)`. State the base case and the inductive step explicitly, the way Concept Unit 2 did.
4. **Break it, on purpose.** Construct your own deliberately-wrong variant of Exercise 3's formula (multiply by a constant, add one, anything), and show the inductive step still holds while the base case fails — the same demonstration Concept Unit 3 gave, on a claim of your own.
5. **Generalize.** State, in your own words, why "prove the base case, prove the inductive step" is a complete proof for *every* natural number, connecting back to the domino propagation argument from the previous lesson, without re-deriving that argument from scratch.
6. **Reconstruct.** Close this lesson. From memory, explain vacuous truth, using Lesson 7's implication truth table specifically — which row of that table is responsible for a false claim's inductive step still holding?

## Definition of Done

- [ ] You can state mathematical induction's formal definition from memory, using the words "base case," "inductive step," and "implies" correctly.
- [ ] You proved Exercise 3's formula completely — both the base case and the inductive step, not just one.
- [ ] You completed Exercise 4 and can point to exactly which row of implication's truth table explains why a wrong claim's inductive step can still hold.
- [ ] You can explain why checking a large number of concrete cases is not the same kind of evidence as a completed induction proof.
- [ ] Commit your Exercise 3 proof to your notes repository, with a commit message stating both the base case value and the inductive hypothesis used — for example, `"Prove sum of first n even numbers = n(n+1) — base case n=1: 2=1x2; step uses substitution + factoring on 2k assumption"` — not just `"lesson 15 exercise"`.

---

**Next lesson:** Lesson 16, *Invariants*, generalizes the previous lesson's "base case, then preserved at every step" shape one more time — from a property proven true for every natural number, to a fact that stays true while an entire running computation changes everything around it, the exact vocabulary Lesson 14's bank-account argument was already using without a formal name.
