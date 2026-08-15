# Lesson 49: Solving Simple Recurrences

**What you will build**: By the end of this lesson you'll be able to solve all three of the previous lesson's recurrences — turning "here's the equation" into "here's exactly how fast this grows" — using nothing but repeated substitution and the series formulas Lessons 46 and 47 already proved. You'll also see, honestly, where this lesson's technique reaches its limit on `fib`'s genuinely harder recurrence, and what a careful bound still recovers from it.

**What you need to know first**: The previous lesson's three recurrences, and Lessons 46 and 47's arithmetic and geometric series formulas.

**Terms introduced in this lesson**:

- **expansion** — repeatedly substituting a recurrence into itself, replacing `T(n-1)` with its own definition, until a pattern in terms of the base case emerges. *Why it matters*: the actual mechanical technique this lesson uses to solve all three of the previous lesson's recurrences, turning an equation defined in terms of itself into one that can be computed directly.
- **closed form** — an expression for a quantity that can be computed directly, without first computing the same quantity for every smaller input. *Why it matters*: distinguishes a recurrence (self-referential by definition) from its solution — the same relationship Lesson 15's proven formula had to `sum-to`'s own recursive definition, now generalized to any recurrence.

**Objects and methods used**: None new. This lesson solves equations algebraically, connecting the results back to already-verified code.

---

## Concept Unit: Solving T(n) = T(n-1) + c by Expansion

### The Problem

`sum-to`'s recurrence, `T(n) = T(n-1) + c`, defines `T(n)` in terms of a smaller `T` — not yet a closed form. What is `T(n)` actually equal to, directly, in terms of `n`?

### Introduce the concept in isolation

Substitute the recurrence into itself, repeatedly:

```
T(n) = T(n-1) + c
     = [T(n-2) + c] + c        = T(n-2) + 2c
     = [T(n-3) + c] + 2c       = T(n-3) + 3c
     ...
     = T(n-k) + kc             (pattern, after k substitutions)
```

Continue until `n - k = 0` — that is, `k = n`:

> **T(n) = T(0) + nc**

A **closed form**: given `n` directly, `T(n)` is computable in one step, no recursion needed. This matches Lesson 20's own confirmation that `sum-to`'s work grows proportionally to `n` — one addition per element, no more, no less — now derived from the recurrence itself rather than just observed.

### Discard the throwaway example

Not applicable — this is a formal derivation, not code.

### Generalizing

**Expansion** — substitute, watch a pattern emerge, stop at the base case — is the general technique this entire lesson applies to all three of the previous lesson's recurrences. The pattern here was especially simple (`kc` accumulates by a fixed amount each substitution); the next two units show what happens when the accumulated term isn't constant.

### CS Lens

`T(n) = T(0) + nc` is precisely what Section IV will call **linear** growth — proportional to `n` itself. Deriving it by expansion, rather than simply asserting "one recursive call per level means linear cost," gives a real, checkable derivation behind a claim this series has been making informally since `sum-to` was first written.

### SE Lens

Expansion works cleanly here because every substitution step looks identical — the same `+ c` at every level — letting the pattern be spotted after just two or three steps. Not every recurrence is this cooperative, as the next two units show.

---

## Concept Unit: Solving T(n) = T(n-1) + (n-1) by Expansion

### The Problem

`reverse-naive`'s recurrence, `T(n) = T(n-1) + (n-1)`, has a *changing* extra term at each level, not a fixed `c`. Does expansion still work?

### Introduce the concept in isolation

```
T(n) = T(n-1) + (n-1)
     = [T(n-2) + (n-2)] + (n-1)              = T(n-2) + (n-2) + (n-1)
     = [T(n-3) + (n-3)] + (n-2) + (n-1)       = T(n-3) + (n-3) + (n-2) + (n-1)
     ...
     = T(n-k) + (n-k) + (n-k+1) + ... + (n-1)   (pattern, after k substitutions)
```

At `k = n`:

> **T(n) = T(0) + [0 + 1 + 2 + ... + (n-1)]**

The bracketed sum is exactly an arithmetic series (Lesson 46) — `n` terms, first `= 0`, last `= n-1` — solvable directly by Lesson 46's own pairing formula: `n × (0 + (n-1)) / 2 = n(n-1)/2`. So:

> **T(n) = T(0) + n(n-1)/2**

A closed form — and precisely the quantity Lesson 28 already counted by hand for `reverse-naive`'s real `my-append` cost. Expansion, followed by recognizing the resulting sum as one Lesson 46 already solved, is what turned the recurrence into this exact, previously hand-verified answer.

### Discard the throwaway example

Not applicable — this derivation directly confirms Lesson 28's own counted result algebraically.

### Generalizing

This is the actual payoff of Lessons 44 through 47's notation and series formulas: expansion routinely produces a sum that needs solving on its own, and having Lesson 46's and Lesson 47's closed forms already proven means that sum doesn't need to be counted by hand the way Lesson 28 originally had to — it can be recognized and solved immediately.

### CS Lens

`T(n) = T(0) + n(n-1)/2` is **quadratic** growth — proportional to `n²` for large `n`, since `n(n-1)/2` is dominated by its `n²` term. This is the precise, now-derived reason `reverse-naive` costs roughly `n²/2` operations, exactly matching Lesson 28's own hand count, now produced by solving the recurrence rather than tracing execution directly.

### SE Lells

Recognizing a recurrence's "extra work" term as a known series (arithmetic, geometric, or otherwise) is the actual skill this lesson builds — not a new formula to memorize, but the habit of expanding a recurrence far enough to expose a familiar shape, then reaching for the tool already proven to solve it.

### Connection to the previous unit

The previous unit's expansion produced a simple `kc` term, summed trivially; this unit's expansion produced a genuine arithmetic series, requiring Lesson 46's formula to finish — the same expansion technique, applied to a recurrence whose accumulated term itself needed solving.

---

## Concept Unit: T(n) = T(n-1) + T(n-2) + c — Where Simple Expansion Runs Out

### The Problem

`fib`'s recurrence, `T(n) = T(n-1) + T(n-2) + c`, has *two* smaller `T` terms, not one. Does the same expansion technique still produce a clean closed form?

### Introduce the concept in isolation

Attempt the same substitution:

```
T(n) = T(n-1) + T(n-2) + c
```

Substituting `T(n-1)`'s own definition introduces `T(n-2)` and `T(n-3)`; substituting `T(n-2)`'s definition introduces `T(n-3)` and `T(n-4)` — the number of terms *doubles* with every substitution, rather than staying at one term the way the previous two units' expansions did. No simple, single-line pattern like `T(n-k) + kc` emerges this cleanly — this recurrence genuinely needs a more advanced technique (solving via its **characteristic equation**, a method outside this lesson's scope) to reach its *exact* closed form.

What expansion *can* still do honestly is bound it. Since `T(n-2) ≤ T(n-1)` for any function that's actually growing (a smaller input never costs more than a larger one, for either of this series' cost recurrences so far), replace `T(n-2)` with `T(n-1)` to get a genuine upper bound:

```
T(n) ≤ T(n-1) + T(n-1) + c = 2T(n-1) + c
```

*This* recurrence, `U(n) = 2U(n-1) + c`, expands cleanly:

```
U(n) = 2U(n-1) + c
     = 2[2U(n-2) + c] + c        = 4U(n-2) + 3c
     = 4[2U(n-3) + c] + 3c       = 8U(n-3) + 7c
     ...
     = 2^k U(n-k) + (2^k - 1)c     (pattern, after k substitutions)
```

At `k = n`: **U(n) = 2ⁿU(0) + (2ⁿ - 1)c** — recognize the `(2ⁿ - 1)` term as exactly Lesson 47's geometric series, `1 + 2 + 4 + ... + 2^(n-1) = 2ⁿ - 1`, appearing here directly. `U(n)` grows **exponentially** — and since `T(n) ≤ U(n)`, `fib`'s true cost is *at most* exponential, a genuine, honestly-derived conclusion, even without pinning down its exact closed form.

### Discard the throwaway example

Not applicable — this bound is a real, useful conclusion, stated honestly as a bound rather than an exact solution.

### CS Lens

This upper-bound argument is exactly what Lesson 23's evaluation tree already showed concretely: a tree that branches in two at every level has a size that doubles with depth, matching `2ⁿ` directly. Section IV's Big-O notation (Lesson 51) is built specifically to make bounds like this one — "at most exponential" — precise and comparable, without always needing an exact closed form, which real recurrences frequently don't have in a simple, elementary shape at all.

### SE Lells

Knowing when a technique reaches its limit is as important as knowing the technique — claiming to have "solved" `fib`'s recurrence exactly, using only simple expansion, would be a real overclaim; deriving a provable, honestly-labeled *bound* instead is both mathematically correct and practically sufficient for the purpose (knowing `fib` is exponential, not linear or quadratic) this series actually needs it for.

### Connection to the previous unit

The previous unit's expansion terminated cleanly in a known series; this unit's does not, honestly, and the bound it produces instead is still directly useful — connecting back to the exact same geometric series (Lesson 47) the previous section's tree-node-counting already used, now reached from an algorithm's cost rather than a tree's shape.

---

## Connect the Pieces

All three closed forms (or bounds), next to their already-established, independently-verified behaviors:

| Function | Recurrence | Solved form | Matches |
|---|---|---|---|
| `sum-to` | `T(n)=T(n-1)+c` | `T(n) = T(0) + nc` — linear | Lesson 20's direct understanding |
| `reverse-naive` | `T(n)=T(n-1)+(n-1)` | `T(n) = T(0) + n(n-1)/2` — quadratic | Lesson 28's exact hand count |
| `fib` | `T(n)=T(n-1)+T(n-2)+c` | `T(n) ≤ 2ⁿT(0) + (2ⁿ-1)c` — at most exponential | Lesson 23's evaluation tree |

Every solved form connects back to a fact this series already established by direct observation, several lessons earlier — the algebra in this lesson didn't discover anything new about these three functions' behavior; it derived, precisely and generally, what direct tracing had already shown for specific small cases.

## What Breaks Without This

Suppose someone, having only ever run `fib` on small inputs (`n` up to `10` or so, where even the naive version returns quickly), assumed its cost "seemed roughly proportional to `n`" — a plausible impression from limited testing, the same trap Lesson 18's closing lesson warned against directly (checking a few convenient examples isn't the same as knowing the general behavior). This lesson's derived bound, `T(n) ≤ 2ⁿT(0) + (2ⁿ-1)c`, makes the actual growth impossible to mistake for linear: at `n = 30`, `2³⁰` is over a billion — a difference between "finishes instantly" and "may not finish in a reasonable time" that no amount of testing on `n ≤ 10` would ever reveal, and that only deriving the recurrence's actual shape catches before the larger input is ever attempted.

## Exercises

1. **Trace.** By hand, expand `T(n) = T(n-1) + 2` (a fixed constant of `2` instead of `c`) for four substitutions, and state its closed form directly.
2. **Predict.** Before solving it, predict whether `T(n) = T(n-1) + n²` (the previous lesson's Exercise territory, applied to a squared extra term) grows faster or slower than `reverse-naive`'s quadratic recurrence. Expand it and check — what series does the accumulated term become?
3. **Solve.** Expand and solve `T(n) = T(n-1) + 2^n`, recognizing the accumulated term as a geometric series (Lesson 47).
4. **Break it, on purpose.** Attempt to apply this lesson's simple, single-term expansion technique directly to `T(n) = T(n-1) + T(n-2) + c` (skipping the upper-bound step), and describe, concretely, where and why the pattern fails to stay a single clean expression.
5. **Generalize.** `count-halvings`' recurrence (Lesson 48, Exercise 3) has the form `T(n) = T(n/2) + c` — a *different* kind of shrinking than `n - 1`. Attempt to expand it, and state what closed form emerges (connect it to Lesson 43's logarithms).
6. **Reconstruct.** Close this lesson. From memory, explain why `fib`'s recurrence can't be solved by this lesson's simple expansion technique, and explain what a valid upper bound still proves even without an exact answer.

## Definition of Done

- [ ] You can expand a simple recurrence by hand and reach its closed form.
- [ ] You completed Exercise 3, recognizing an accumulated term as a geometric series and solving it with Lesson 47's formula.
- [ ] You completed Exercise 5 (`count-halvings`) and connected its closed form to Lesson 43's logarithms.
- [ ] You can explain, honestly, why `fib`'s recurrence resists simple expansion, and what the upper-bound technique still proves.
- [ ] Commit your Exercise 3 and Exercise 5 solutions to your notes repository, with a commit message stating each closed form — for example, `"Solve T(n)=T(n-1)+2^n via geometric series (closed form: T(0)+2^(n+1)-2); solve count-halvings recurrence, closed form is c*log2(n)"` — not just `"lesson 49 exercise"`.

---

**Next lesson:** Lesson 50, *Growth Rates*, takes every closed form this lesson derived — linear, quadratic, exponential, logarithmic — and compares them directly, side by side, at increasing input sizes, making precise exactly how much the difference between them actually matters in practice.
