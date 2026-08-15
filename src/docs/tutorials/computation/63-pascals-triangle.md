# Lesson 63: Pascal's Triangle

**What you will build**: By the end of this lesson you'll have a second, structurally different way to compute binomial coefficients — a recursive relationship, `C(n,k) = C(n-1,k-1) + C(n-1,k)`, derived from a direct argument about a chosen item rather than from factorials at all — and you'll see it avoids computing any factorial whatsoever, a real, different tradeoff from Lesson 62's closed form.

**What you need to know first**: Lesson 62's `combination-count` and its factorial-based formula, and Lesson 17's proof by cases.

**Terms introduced in this lesson**: None new — this lesson derives a second computational route to a concept (the binomial coefficient) Lesson 62 already named.

**Objects and methods used**: None new. This lesson combines `if`, `=`, `+`, and `combination-count` (Lesson 62), each already covered.

---

## Concept Unit: A Recursive Relationship Between Binomial Coefficients

### The Problem

`combination-count(n,k)` requires computing three factorials — `n!`, `k!`, and `(n-k)!` — even for a small `n` and `k`. Is there a way to compute `C(n,k)` directly from *smaller* binomial coefficients, without any factorial at all?

### Introduce the concept in isolation

Pick any one specific item from the `n` available — call it item `X`. Every `k`-element combination either includes `X` or it doesn't — an exhaustive, non-overlapping case split (Lesson 17):

- **Includes `X`:** the remaining `k-1` items must be chosen from the other `n-1` items — `C(n-1, k-1)` ways.
- **Excludes `X`:** all `k` items must be chosen from the other `n-1` items — `C(n-1, k)` ways.

By the addition rule (Lesson 60 — these two cases are exhaustive and non-overlapping), the total is their sum:

> **C(n,k) = C(n-1,k-1) + C(n-1,k)**

Check against a known small case: `C(4,2) = 6`. The formula predicts `C(3,1) + C(3,2) = 3 + 3 = 6` — matching exactly.

### Discard the throwaway example

Not applicable — this identity is verified directly against code in the next unit.

### CS Lens

This proof technique — split into cases based on whether one specific element is included, and count each case separately — is a genuinely different derivation method than Lesson 62's factorial-division argument, arriving at an equivalent result by an entirely different route, the same "two independent derivations agreeing" confidence Lesson 46 and Lesson 49 both already demonstrated for other formulas.

### SE Lells

A recurrence expressed purely in terms of *smaller instances of itself*, with no factorial computation anywhere, is exactly the shape Section II's entire recursive-function toolkit was built to implement directly — this identity translates into code with no new technique needed at all.

---

## Concept Unit: Implementing and Comparing

### The Problem

Translate the identity directly into a recursive function, and compare its actual computation against `combination-count`'s factorial-based approach.

### Introduce the concept in isolation

```clojure
(defn pascal [n k]
  (if (= k 0)
    1
    (if (= k n)
      1
      (+ (pascal (- n 1) (- k 1)) (pascal (- n 1) k)))))
```

```
user=> (pascal 4 2)
6
user=> (pascal 5 2)
10
```

Both match `combination-count`'s own results exactly. Two base cases, not one: `C(n,0) = 1` (choosing nothing has exactly one way) and `C(n,n) = 1` (choosing everything has exactly one way) — both needed directly, since the recursive case's own two smaller calls, `C(n-1,k-1)` and `C(n-1,k)`, would otherwise never bottom out cleanly without both boundaries handled explicitly.

### Discard the throwaway example

Not applicable — `pascal` is a real, historically named function (this recursive layout, arranged by row, is exactly **Pascal's Triangle** — each entry the sum of the two entries above it).

### Project Change

- **Reference Source**: No reference counterpart — a direct translation of this lesson's own derived identity.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn pascal [n k]
  (if (= k 0)
    1
    (if (= k n)
      1
      (+ (pascal (- n 1) (- k 1)) (pascal (- n 1) k)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (= k 0) 1 (if (= k n) 1 ...))`** — two base cases in sequence, both required (Lesson 19's own allowance for a recursive definition to have more than one base case, used here for the second time since Lesson 41's symbolic expressions).
- **`(+ (pascal (- n 1) (- k 1)) (pascal (- n 1) k))`** — the recursive case, exactly this lesson's derived identity, with two recursive calls per Lesson 30's own two-call shape for genuinely branching recursion.

### CS Lens

`pascal`'s evaluation tree has *exactly* the same overlapping-subproblems character Lesson 23 first found in `fib` — `pascal(2,1)`, for instance, gets recomputed independently many times while computing `pascal(5,2)` — meaning `pascal`, exactly like naive `fib`, is a strong candidate for Lesson 38's memoization, a direct, concrete connection between two sections' techniques.

### SE Lells

`pascal` trades `combination-count`'s three factorial computations (each itself costing real work, per Lesson 20) for repeated addition and — without memoization — genuinely more total calls for the same answer, an honest tradeoff rather than a strictly better replacement: `combination-count` is faster as written; `pascal` avoids factorials but reintroduces `fib`'s own exponential-redundancy risk.

### Connection to the previous unit

The previous unit derived the identity by a case-based counting argument; this unit is its direct, verified implementation, immediately revealing a real cost tradeoff against the previous lesson's closed form rather than a strict improvement.

---

## Connect the Pieces

Both computation routes, agreeing, laid out as the actual triangle this lesson is named for:

```clojure
(println "Row 4:" (pascal 4 0) (pascal 4 1) (pascal 4 2) (pascal 4 3) (pascal 4 4))
(println "combination-count row 4:" (combination-count 4 0) (combination-count 4 1) (combination-count 4 2) (combination-count 4 3) (combination-count 4 4))
```

```
Row 4: 1 4 6 4 1
combination-count row 4: 1 4 6 4 1
```

Every entry in row `4` matches between the two independently-derived methods — `1, 4, 6, 4, 1`, the actual fourth row of Pascal's Triangle, each entry the sum of the two entries above it in the row before, exactly as Concept Unit 1's identity specifies.

## What Breaks Without This

Suppose `pascal` were written with only *one* base case, `(= k 0)`, omitting `(= k n)` entirely:

```clojure
(defn broken-pascal [n k]
  (if (= k 0)
    1
    (+ (broken-pascal (- n 1) (- k 1)) (broken-pascal (- n 1) k))))
```

Calling `(broken-pascal 4 4)` recurses toward `(broken-pascal 0 4)` — `n` reaches `0` while `k` is still `4`, and neither base case fires (`k` isn't `0`), so the recursive case calls `(broken-pascal -1 3)` and `(broken-pascal -1 4)`, continuing into negative `n` indefinitely. This is Lesson 19's completeness requirement violated concretely — a recursive definition with two genuinely needed base cases, implemented with only one, fails to terminate exactly at the boundary the missing case was supposed to catch.

## Exercises

1. **Trace.** By hand, trace `(pascal 4 2)`, drawing out the two-branch recursive tree the way Lesson 23 traced `fib`.
2. **Predict.** Before computing it, predict row `5` of Pascal's Triangle (`pascal 5 0` through `pascal 5 5`) using row `4`'s values from Connect the Pieces and the addition identity directly, without calling `pascal` itself.
3. **Verify.** Confirm your Exercise 2 prediction by actually calling `pascal` for each value in row `5`.
4. **Break it, on purpose.** Confirm, by running it yourself (ready to interrupt), that `broken-pascal` fails to terminate on `(broken-pascal 4 4)`.
5. **Generalize.** Using Lesson 38's memoization pattern (`declare`, a helper calling its own memoized wrapper, `memoize`), write a memoized version of `pascal`, and explain what specific redundancy it eliminates.
6. **Reconstruct.** Close this lesson. From memory, re-derive the identity `C(n,k) = C(n-1,k-1) + C(n-1,k)` using the "does this one specific item get included" case split.

## Definition of Done

- [ ] You can derive Pascal's identity from the case-split argument, from memory.
- [ ] You completed Exercise 2 and Exercise 3, predicting and then verifying an entire row of Pascal's Triangle.
- [ ] You completed Exercise 5, memoizing `pascal` correctly using Lesson 38's pattern.
- [ ] You can state one genuine tradeoff between `combination-count` and `pascal`, not just that they compute the same thing.
- [ ] Commit your memoized `pascal` to your notes repository, with a commit message stating what redundancy it removes — for example, `"Add memoized pascal — eliminates repeated computation of pascal(2,1) and similar overlapping subproblems, same fix pattern as fib-memo"` — not just `"lesson 63 exercise"`.

---

**Next lesson:** Lesson 64, *Binomial Theorem*, connects this lesson's triangle directly to polynomial expansion — showing `(x+y)ⁿ`'s expanded coefficients are exactly the binomial coefficients this section has now derived three separate ways.
