# Lesson 20: Recursive Functions

**What you will build**: By the end of this lesson you'll have written this series' first recursive Clojure functions — derived directly from a recursive definition's own base case and recursive case, not invented separately from it — and verified one of them against a formula the previous section already proved correct by induction.

**What you need to know first**: The previous lesson's recursive definitions (base case, recursive case, and the natural numbers specifically), and Lesson 15's proven formula for the sum of the first `n` positive integers.

**Terms introduced in this lesson**:

- **recursive function** — a function whose definition includes a call to itself, applied to a smaller input, mirroring a recursive data definition's own base case and recursive case. *Why it matters*: this is the direct, mechanical translation target for a recursive definition — the definition describes a class of objects; the function computes something about them, using the identical two-part shape.
- **recursive call** — the specific place inside a recursive function's body where it calls itself. *Why it matters*: names the actual mechanism that makes a function recursive — without at least one call to itself somewhere in its body, a function isn't recursive, no matter how its logic is otherwise organized.

**Objects and methods used**: None new. This lesson combines `defn`, `if`, `=`, `+`, `*`, and `-`, each already fully covered, into a new pattern: a function calling itself.

---

## Concept Unit: From Recursive Definition to Recursive Function

### The Problem

The previous lesson proved the sum of the first `n` positive integers equals `n(n+1)/2`, by induction. That formula computes the sum directly, in one step, given `n`. It says nothing about *summing* the way Lesson 1's bank-account balance was actually computed — one transaction at a time. Is there a way to write a function that computes the sum the "long way," one number at a time, directly reflecting what "sum of the first `n` numbers" actually *means*, rather than the closed-form shortcut?

### Introduce the concept in isolation

State what "the sum of the first `n` positive integers" means, recursively, using the previous lesson's exact two-part shape:

- **Base case:** the sum of the first `0` positive integers is `0` (there's nothing to sum).
- **Recursive case:** the sum of the first `n` positive integers (for `n > 0`) is `n` plus the sum of the first `n - 1` positive integers.

Translate this directly into Clojure — each part of the definition becomes one part of the function:

```clojure
(defn sum-to [n]
  (if (= n 0)
    0
    (+ n (sum-to (- n 1)))))
```

```
user=> (sum-to 4)
10
user=> (sum-to 0)
0
```

Every piece of the definition is visible directly in the code: `(= n 0)` checks whether the base case applies; `0` is the base case's answer, written exactly as stated; `(+ n (sum-to (- n 1)))` is the recursive case, written exactly as stated — `n` plus the sum of the first `n - 1` positive integers, where `(sum-to (- n 1))` *is* "the sum of the first `n - 1` positive integers," expressed as a call to the very function being defined. This is a **recursive function**: `sum-to`'s own body contains a **recursive call** — `(sum-to (- n 1))` — to `sum-to` itself.

### Discard the throwaway example

Not applicable — `sum-to` is worth keeping; the rest of this lesson builds on it directly.

### Project Change

- **Reference Source**: No reference counterpart — this is the direct, mechanical translation of the previous lesson's own recursive definition of summation.
- **Files affected**: None yet — REPL session, same as most of this series' earlier code examples.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn sum-to [n]
  (if (= n 0)
    0
    (+ n (sum-to (- n 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`defn sum-to [n]`** — reappearing function definition; nothing new about the shape itself.
- **`(if (= n 0) ...)`** — reappearing `if` and `=`; the condition distinguishing the base case from the recursive case, exactly mirroring the recursive definition's own two-way split.
- **`0`** — the base case's answer, a plain literal, requiring nothing further to evaluate — this is where the recursion, once it reaches this branch, stops calling itself.
- **`(+ n (sum-to (- n 1)))`** — first appearance of a **recursive call**: `sum-to` appearing inside its own definition, called with `(- n 1)` — a *smaller* input than `n`, mirroring the recursive definition's own "smaller instance of the same kind" requirement precisely. This is not a different function that happens to share a name; it is the exact same `sum-to`, invoked again, the same way any other function call (Lesson 4) invokes any other function — nothing about calling a function changes just because the function being called happens to be the one currently being defined.

### CS Lens

Translating a recursive definition into a recursive function this directly — one line of code per part of the definition — is not a coincidence specific to `sum-to`; Lesson 21 (*Structural Recursion*), immediately next, names this as a general, reliable method: a recursive function's shape can be read almost mechanically off of the recursive definition of whatever it operates on. Also recognized in: a Russian nesting doll's own "opening instructions" (open this doll to find a smaller doll, plus the exact same instructions again), and a mirror facing another mirror (each reflection containing a smaller reflection of the identical scene).

### SE Lens

`sum-to` computes the same value the previous lesson's formula does, using dramatically more work — `sum-to 1000000` makes a million recursive calls; `1000000 * 1000001 / 2` is one multiplication and one division. This isn't a flaw in `sum-to`; it's a genuine, real tradeoff this series names properly starting in Section IV (growth rates, Big-O): the recursive version directly mirrors the problem's own recursive definition, which is exactly why it's easy to derive and trust, while the closed-form formula is faster precisely because it *isn't* a direct translation of the definition — it required Lesson 15's separate proof to establish it's even correct.

---

## Concept Unit: A Second Example — Factorial

### The Problem

Is `sum-to`'s translation — base case becomes a literal, recursive case becomes a recursive call — specific to addition, or does the identical translation work for a completely different operation?

### Introduce the concept in isolation

State factorial's recursive definition, the same two-part shape as before:

- **Base case:** the factorial of `0` is `1`.
- **Recursive case:** the factorial of `n` (for `n > 0`) is `n` times the factorial of `n - 1`.

```clojure
(defn factorial [n]
  (if (= n 0)
    1
    (* n (factorial (- n 1)))))
```

```
user=> (factorial 4)
24
user=> (factorial 0)
1
```

The translation is identical in shape to `sum-to`'s: check for the base case, return its literal answer directly; otherwise, combine `n` with a recursive call on `n - 1` — only the specific literal (`0` versus `1`) and the specific combining operation (`+` versus `*`) changed, because those are the only two things that differed in the underlying recursive definitions themselves.

### Discard the throwaway example

Not applicable — `factorial` is a standard, reusable function, worth keeping.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn factorial [n]
  (if (= n 0)
    1
    (* n (factorial (- n 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (= n 0) 1 ...)`** — reappearing pattern from `sum-to`; the base case's literal answer is `1` here instead of `0`, because factorial's own recursive definition says so — nothing about the *shape* of the check changed, only the specific value being returned.
- **`(* n (factorial (- n 1)))`** — reappearing recursive-call shape from `sum-to`'s own recursive case, with `*` in place of `+` — the exact substitution factorial's recursive definition calls for, and nothing more.

### CS Lens

Two functions with visibly identical shapes, differing only in their base case's literal and their combining operation, is early, concrete evidence for a much larger idea Lesson 27 (*Fold / Reduce*) makes fully explicit: an enormous number of recursive functions are really the same underlying pattern (a base case, and a way of combining the current element with the result of the smaller recursive call), with only the base case's value and the combining operation actually changing between them.

### SE Lens

Recognizing `sum-to` and `factorial` as instances of one shared shape — rather than as two unrelated functions that happen to look similar — is what will make Lesson 27's `reduce` land as "the shape that was already here, made reusable," instead of a brand-new idea introduced from nowhere. Noticing repeated shapes across separately-written code is, more generally, exactly the instinct Lesson 280 (*Refactoring*) asks a working programmer to have constantly.

### Connection to the previous unit

The previous unit derived one recursive function directly from its recursive definition; this unit repeats the identical translation process for a genuinely different operation, showing the *process* generalizes even though the two specific functions compute completely different things.

---

## Concept Unit: Verifying a Recursive Function Against What It Should Compute

### The Problem

`sum-to` was derived from a recursive definition of summation, not from Lesson 15's closed-form formula. Do the two actually agree — does the "long way" recursive function compute the same thing the proven formula predicts?

### Introduce the concept in isolation

Trace `(sum-to 4)` by hand, the way Lesson 2 traced nested arithmetic:

```
(sum-to 4)
= (+ 4 (sum-to 3))                          [4 ≠ 0, so the recursive case applies]
= (+ 4 (+ 3 (sum-to 2)))                    [expand (sum-to 3) the same way]
= (+ 4 (+ 3 (+ 2 (sum-to 1))))
= (+ 4 (+ 3 (+ 2 (+ 1 (sum-to 0)))))
= (+ 4 (+ 3 (+ 2 (+ 1 0))))                 [base case: (sum-to 0) is 0, directly]
= (+ 4 (+ 3 (+ 2 1)))
= (+ 4 (+ 3 3))
= (+ 4 6)
= 10
```

Lesson 15's formula predicts `4 × (4+1) / 2 = 4 × 5 / 2 = 10` for the same input. They match — and per the previous section's own proof, they'll match for *every* natural number `n`, not just `4`, because Lesson 15 already proved the formula correct by induction, and `sum-to` computes summation by the exact recursive definition that formula was proven against.

### Discard the throwaway example

Not applicable — this trace is a verification, not throwaway code.

### CS Lens

Two independently-derived ways of computing the same value — one direct and slow (`sum-to`), one fast and requiring proof (the closed-form formula) — agreeing on every case is a genuinely useful way to gain confidence in a proof, distinct from the proof itself: if `sum-to`'s recursive, definition-following computation and the formula's shortcut ever disagreed on some input, at least one of them would be wrong, and comparing many concrete cases (Lesson 8's exhaustive-checking spirit, applied here as a spot check rather than a proof) is real, useful evidence neither one is.

### SE Lens

In real code, this is exactly how a fast, non-obvious implementation gets tested: not by trusting it blindly, and not by re-deriving its correctness proof every time, but by checking it against a slower, more directly correct reference implementation on cases small enough for both to run — `sum-to`, slow and obviously correct by direct translation from the definition, is exactly this kind of reference implementation for the fast formula.

### Connection to the previous unit

The previous unit showed the definition-to-function translation generalizes across different operations; this unit connects the specific function it produced back to a result the previous section already established by an entirely different method — proof by induction — closing the loop between Section I's proof techniques and Section II's actual running code.

---

## Connect the Pieces

Both functions, run against several inputs, checked against what's already known to be true:

```clojure
(defn sum-to [n]
  (if (= n 0)
    0
    (+ n (sum-to (- n 1)))))

(defn factorial [n]
  (if (= n 0)
    1
    (* n (factorial (- n 1)))))

(println "sum-to 4:" (sum-to 4) "— formula predicts 4*5/2 =" (/ (* 4 5) 2))
(println "sum-to 6:" (sum-to 6) "— formula predicts 6*7/2 =" (/ (* 6 7) 2))
(println "factorial 4:" (factorial 4))
(println "factorial 0:" (factorial 0))
```

```
sum-to 4: 10 — formula predicts 4*5/2 = 10
sum-to 6: 21 — formula predicts 6*7/2 = 21
factorial 4: 24
factorial 0: 1
```

Every value matches what's already known or independently checkable: `sum-to`'s outputs match Lesson 15's proven formula exactly, and `factorial 0`'s result (`1`) matches its base case directly, by definition, with nothing to compute at all. Both functions were derived the same way — read the recursive definition, translate each part directly into code — and both check out against independent evidence.

## What Breaks Without This

Suppose `sum-to`'s recursive case were written with the recursive call on `n` instead of `(- n 1)` — a small, easy typo:

```clojure
(defn broken-sum-to [n]
  (if (= n 0)
    0
    (+ n (broken-sum-to n))))
```

This function's recursive case never actually reduces its input — every recursive call is on the exact same `n` it started with, never getting any smaller, never reaching the base case `(= n 0)`. Calling `(broken-sum-to 4)` doesn't return a wrong number; it never returns *anything* — it calls itself, on the identical input, forever, until the program runs out of resources to keep track of all the pending calls and crashes with an error. This is exactly why the recursive case's "smaller instance of the same kind" requirement, from the previous lesson's recursive definitions, isn't optional decoration — a recursive *function* that doesn't actually shrink its input toward the base case has no way to ever reach it. Lesson 22 (*Base Cases and Progress*) is dedicated entirely to this exact failure mode.

## Exercises

1. **Trace.** By hand, trace `(factorial 3)` the way this lesson traced `(sum-to 4)` — showing every recursive call, then every value resolving back up.
2. **Predict.** Before running it, predict `(sum-to 10)` using Lesson 15's formula, then verify by tracing `sum-to`'s recursive calls (or reasoning about the pattern) rather than by running code.
3. **Derive.** Write a recursive definition (base case and recursive case), and then a matching recursive Clojure function, for "the largest of the first `n` positive integers" — trivial as a formula (it's just `n`), but write it the "long way," recursively, the way `sum-to` was written the long way instead of using the closed-form formula directly.
4. **Break it, on purpose.** Predict what happens if `factorial`'s base case checked `(= n 1)` instead of `(= n 0)`, and then called `(factorial 0)`. Trace it far enough to see whether it reaches a base case at all.
5. **Generalize.** Write a recursive function `product-to` computing the product of the first `n` positive integers *starting from a given number* rather than from `1` — that is, `product-to 3 6` should compute `3 × 4 × 5 × 6`. State its base case and recursive case first, the way this lesson did for `sum-to` and `factorial`.
6. **Reconstruct.** Close this lesson. From memory, explain why `sum-to` and `factorial` have visibly the same shape, and name exactly the two places their definitions differ.

## Definition of Done

- [ ] You can write a recursive function, given only a recursive definition's base case and recursive case, without additional guidance.
- [ ] You can trace a recursive function's execution by hand, the way this lesson traced `sum-to 4`.
- [ ] You completed Exercise 5 (`product-to`), stating its recursive definition before writing the code.
- [ ] You can explain, from memory, what goes wrong when a recursive call doesn't reduce its input toward the base case.
- [ ] Commit `sum-to`, `factorial`, and your Exercise 5 `product-to` to your notes repository, with a commit message stating which formula (if any) you checked each one against — for example, `"Add sum-to, factorial, product-to — sum-to verified against Lesson 15's n(n+1)/2 formula for n=4 and n=6"` — not just `"lesson 20 exercises"`.

---

**Next lesson:** Lesson 21, *Structural Recursion*, names directly what this lesson's two examples already demonstrated in practice — that a recursive function's shape is determined by the recursive shape of whatever data or definition it operates on, not chosen independently of it.
