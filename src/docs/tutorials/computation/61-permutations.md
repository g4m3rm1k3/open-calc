# Lesson 61: Permutations

**What you will build**: By the end of this lesson you'll have derived the closed-form permutation formula, `n!/(n-k)!`, directly from `permutation-count`'s own recursive definition (Lesson 45) using nothing but cancellation — and confirmed that arranging *every* item in a set is exactly what `factorial` was already computing, made precise rather than assumed.

**What you need to know first**: Lesson 45's `permutation-count` and its recursive shape, and Lesson 13's cancellation.

**Terms introduced in this lesson**:

- **permutation** — an arrangement of items where order matters; a specific ordered sequence chosen from a larger set. *Why it matters*: names precisely what `permutation-count` (Lesson 45) has been counting all along — this lesson gives the concept itself a definition, not just the counting function.

**Objects and methods used**: None new. This lesson combines `factorial` (Lesson 20) and `quot`, both already covered.

---

## Concept Unit: Deriving n!/(n-k)! From permutation-count

### The Problem

`permutation-count(n, k)` (Lesson 45) computes `n × (n-1) × ... × (n-k+1)` recursively — correct, but not yet connected to `factorial`, a function this series has trusted since Lesson 20. Is there a closed form expressing `permutation-count` directly in terms of `factorial`?

### Introduce the concept in isolation

`permutation-count(n, k)`'s product has exactly `k` terms, counting down from `n`. Multiply and divide by the *same* quantity — the product of everything `permutation-count` *didn't* include, `(n-k) × (n-k-1) × ... × 1`, which is exactly `(n-k)!`:

```
permutation-count(n,k) = [n × (n-1) × ... × (n-k+1)]
                        = [n × (n-1) × ... × (n-k+1)] × (n-k)! / (n-k)!
                        = [n × (n-1) × ... × (n-k+1) × (n-k) × (n-k-1) × ... × 1] / (n-k)!
                        = n! / (n-k)!
```

The bracketed numerator, once the extra `(n-k)!` factor is multiplied in, is exactly `n × (n-1) × ... × 1` — `n!` itself — and the `(n-k)!` introduced to make that happen is still there in the denominator, uncancelled. This is Lesson 13's cancellation technique, run in reverse: instead of removing a common factor, one was deliberately introduced (multiplying and dividing by the identical quantity changes nothing) specifically to reveal a recognizable pattern, `n!`, hiding inside the original product.

### Discard the throwaway example

Not applicable — this is a formal derivation, verified against code in the next unit.

### Formal Definition, Walked Through

> **permutation-count(n, k) = n! / (n-k)!**

- *"n! / (n-k)!"* — the numerator counts arranging *all* `n` items; the denominator divides out the arrangements of the `n-k` items that were *never chosen* at all, leaving only the count that actually depends on which `k` were selected and in what order.

### CS Lens

This is the identical "introduce a factor to reveal a hidden pattern" move a compiler's algebraic simplifier or a symbolic math system performs constantly — Lesson 41's `eval-expr` and Section VII's algebraic structures both eventually formalize the kind of manipulation this derivation just performed by hand.

### SE Lells

Having *both* forms available — the direct recursive product (Lesson 45, cheap to compute, no risk of an intermediate factorial overflowing) and this closed form (elegant, directly connects to already-trusted `factorial`) — is a real, practical choice: for large `n`, computing `n!` directly (this unit's formula) can produce an enormous intermediate number even when the final `permutation-count` result is comparatively modest, exactly the kind of tradeoff Lesson 42's Horner's method already illustrated between two provably-equal but differently-costed computations.

---

## Concept Unit: The Special Case — Arranging Everything

### The Problem

What does the closed form give when `k = n` — arranging *every* item, not just a subset?

### Introduce the concept in isolation

```clojure
(defn permutation-count-formula [n k]
  (quot (factorial n) (factorial (- n k))))
```

```
user=> (permutation-count-formula 5 2)
20
user=> (permutation-count-formula 5 5)
120
```

`permutation-count-formula(5, 2) = 20`, matching `permutation-count(5,2)` from Lesson 45 exactly. `permutation-count-formula(5, 5) = 5! / 0! = 120 / 1 = 120` — exactly `factorial(5)`, confirming precisely: **arranging every item in a set of `n` distinct items has exactly `n!` possible orders**, with `0! = 1` (Lesson 20's own base case) being exactly what's needed to make the formula collapse correctly to `n!` at this boundary, rather than requiring a separate, special-cased rule.

### Discard the throwaway example

Not applicable — `permutation-count-formula` is a real, reusable function.

### Project Change

- **Reference Source**: `permutation-count`, from Lesson 45, is the direct reference this formula is verified against.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `factorial`, from Lesson 20.

### The New Code — type it yourself

```clojure
(defn permutation-count-formula [n k]
  (quot (factorial n) (factorial (- n k))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(factorial n)`, `(factorial (- n k))`** — reappearing `factorial` (Lesson 20), computing the numerator and denominator of Concept Unit 1's derived formula directly.
- **`quot`** — reappearing integer division (Lesson 43); the division is guaranteed to come out exact (no remainder), since `(n-k)!` is always a genuine factor of `n!` by the derivation's own construction.

### CS Lens

`0! = 1` isn't an arbitrary convention chosen to make this formula work — it's Lesson 20's own base case, chosen because "the number of ways to arrange zero items" genuinely is `1` (there's exactly one way to arrange nothing: do nothing), the identical "one way to choose nothing" logic Lesson 32's `power-set` and Lesson 45's own base case already relied on.

### SE Lells

Confirming a special case (`k = n`) reduces correctly to an already-trusted, independently-derived result (`factorial`) is real, valuable verification — not just a curiosity, but exactly the kind of cross-check Lesson 20's Connect the Pieces first modeled, catching an error in either derivation before it could go unnoticed.

### Connection to the previous unit

The previous unit derived the general closed form; this unit checks its most extreme, most important special case against an independently-trusted function, confirming the derivation holds together at its boundary, not just in the middle of its range.

---

## Connect the Pieces

Both forms of `permutation-count`, plus a genuine application — how many different orders a list of `4` distinct transactions could have been processed in, connecting directly back to Lesson 18's own investigation of whether transaction order matters:

```clojure
(println "permutation-count(5,2):" (permutation-count 5 2))
(println "permutation-count-formula(5,2):" (permutation-count-formula 5 2))
(println "Orderings of 4 distinct transactions:" (permutation-count-formula 4 4))
(println "Same as factorial(4):" (= (permutation-count-formula 4 4) (factorial 4)))
```

```
permutation-count(5,2): 20
permutation-count-formula(5,2): 20
Orderings of 4 distinct transactions: 24
Same as factorial(4): true
```

Lesson 18 found, by deliberate counterexample search, that transaction order matters whenever withdrawals can be rejected — this lesson now supplies the precise count of *how many* distinct orderings `4` transactions could have been processed in: `24`, exactly `factorial(4)`, confirming both that the two derivations of `permutation-count` agree and that "arrange everything" really is `factorial`, not merely a suggestive resemblance.

## What Breaks Without This

Suppose the closed form were applied with `k > n` — say, `permutation-count-formula(3, 5)`, asking to arrange `5` items chosen from only `3` — without checking the domain (exactly the unguarded risk Lesson 45's own "What Breaks Without This" already flagged for the recursive version):

```
user=> (permutation-count-formula 3 5)
```

`(- n k)` computes `3 - 5 = -2`, and `(factorial -2)` recurses on `(- -2 1) = -3`, then `-4`, and so on — never reaching `0`, the exact "measure decreases but never hits the base case" failure Lesson 22 named directly, this time triggered by an out-of-domain input rather than a flawed step size. Both the recursive and closed-form versions of `permutation-count` share this identical, unguarded gap — a direct confirmation that deriving a second, algebraically equivalent formula doesn't automatically fix a domain problem neither version ever checked for.

## Exercises

1. **Trace.** By hand, derive `permutation-count-formula(6, 3)` using `6!/3!` directly, and confirm it matches `6 × 5 × 4`.
2. **Predict.** Before computing it, predict whether `permutation-count-formula(n, 0)` equals `1` for any `n`, using the formula directly (`n!/n! `). Verify.
3. **Verify.** Confirm `permutation-count` and `permutation-count-formula` agree on three pairs of `(n, k)` you choose yourself.
4. **Break it, on purpose.** Confirm, by running it yourself (and being ready to interrupt it), that `permutation-count-formula(3, 5)` fails to terminate the way "What Breaks Without This" described.
5. **Generalize.** Add a domain guard to `permutation-count-formula` that returns `0` for `k > n`, matching Lesson 45's own suggested fix, and verify it against Exercise 4's previously-broken input.
6. **Reconstruct.** Close this lesson. From memory, re-derive `permutation-count(n,k) = n!/(n-k)!` using the "multiply and divide by the same quantity" technique, and explain why `k = n` reduces to plain `factorial`.

## Definition of Done

- [ ] You can derive the closed-form permutation formula from `permutation-count`'s recursive definition, from memory.
- [ ] You can explain why `0! = 1` is what makes the `k = n` case collapse correctly to `factorial(n)`.
- [ ] You completed Exercise 5, adding a domain guard and verifying it fixes the previously-broken input.
- [ ] You can state both forms of `permutation-count` and explain one real tradeoff between them.
- [ ] Commit your guarded `permutation-count-formula` to your notes repository, with a commit message stating what input it now handles correctly — for example, `"Guard permutation-count-formula against k>n, returns 0 instead of infinite recursion for permutation-count-formula(3,5)"` — not just `"lesson 61 exercise"`.

---

**Next lesson:** Lesson 62, *Combinations*, derives what happens to this lesson's formula once *order stops mattering* — dividing out the orderings within each selection to count groups instead of sequences.
