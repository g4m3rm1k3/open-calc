# Lesson 68: Counting Recursive Structures

**What you will build**: By the end of this lesson you'll be able to count two genuinely different kinds of structured objects — valid strings and grid paths — one by deriving a Fibonacci-shaped recurrence from scratch, the other by recognizing a disguised combination count, connecting Lesson 48's recurrences and Lesson 62's combinations to counting problems neither lesson originally covered.

**What you need to know first**: Lesson 48's recurrence-writing process, Lesson 23's `fib`, and Lesson 62's `combination-count`.

**Terms introduced in this lesson**: None new — this lesson applies already-established recurrence and combination vocabulary to two new counting problems.

**Objects and methods used**: None new. This lesson combines `if`, `=`, `+`, and `combination-count` (Lesson 62), each already covered.

---

## Concept Unit: Counting Valid Strings via Recurrence

### The Problem

How many binary strings of length `n` (each character `0` or `1`) contain no two consecutive `1`s? Direct enumeration works for small `n`, but doubling in size every time `n` grows by one — is there a recurrence, the way Lesson 48 derived one for algorithm costs, that counts these directly?

### Introduce the concept in isolation

Split by what the *last* character is — an exhaustive, non-overlapping case split (Lesson 17):

- **Ends in `0`:** the first `n-1` characters can be *any* valid string of length `n-1` — `a(n-1)` possibilities.
- **Ends in `1`:** the character before it can't also be `1` (the no-consecutive-`1`s rule), so it must be `0` — meaning the string ends in `01`, and the first `n-2` characters form any valid string of length `n-2` — `a(n-2)` possibilities.

By the addition rule (Lesson 60), `a(n) = a(n-1) + a(n-2)` — exactly `fib`'s own recurrence shape (Lesson 23), with different base cases: `a(0) = 1` (the empty string, trivially valid) and `a(1) = 2` (`"0"` and `"1"`, both valid).

```clojure
(defn valid-strings-count [n]
  (if (= n 0)
    1
    (if (= n 1)
      2
      (+ (valid-strings-count (- n 1)) (valid-strings-count (- n 2))))))
```

```
user=> (valid-strings-count 3)
5
```

Check directly: length-`3` strings with no `"11"` substring — `000, 001, 010, 100, 101` — exactly `5`, matching (`011, 110, 111` are the only invalid ones, out of `8` total).

### Discard the throwaway example

Not applicable — `valid-strings-count` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct translation of this unit's own derived recurrence.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn valid-strings-count [n]
  (if (= n 0)
    1
    (if (= n 1)
      2
      (+ (valid-strings-count (- n 1)) (valid-strings-count (- n 2))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(+ (valid-strings-count (- n 1)) (valid-strings-count (- n 2)))`** — reappearing `fib`-shaped two-recursive-call structure (Lesson 23), but counting valid strings, not Fibonacci numbers directly — the identical recurrence *shape* solving a genuinely different combinatorial question, connected only by both satisfying `a(n) = a(n-1) + a(n-2)`.

### CS Lens

This exact recurrence — counting binary strings avoiding a consecutive pattern — is a real, named sequence (closely related to the Fibonacci numbers themselves, offset by one), and the identical technique (case split on the last element, derive a recurrence, solve it the way Lesson 49 solved others) applies to counting valid parenthesizations, valid game states, and many other "no forbidden local pattern" counting problems.

### SE Lens

Recognizing this recurrence's `fib`-like shape immediately flags a real, practical concern: exactly the overlapping-subproblems cost Lesson 23 identified in naive `fib` applies here too, unmemoized — Lesson 38's memoization pattern applies directly, with no new derivation needed, the moment this shape is recognized.

---

## Concept Unit: Counting Grid Paths via Combinations

### The Problem

On a grid, moving only right or up, one step at a time, from `(0,0)` to `(m,n)` — how many distinct paths exist? A different kind of counting problem entirely; does it also reduce to something already derived?

### Introduce the concept in isolation

Every path from `(0,0)` to `(m,n)` consists of exactly `m` right-moves and `n` up-moves, in *some* order — `m+n` total moves, and a path is completely determined by *which* `m` of those `m+n` positions are right-moves (the rest automatically being up-moves). This is exactly `combination-count(m+n, m)`:

```clojure
(defn grid-paths [m n]
  (combination-count (+ m n) m))
```

```
user=> (grid-paths 2 2)
6
```

Check directly: paths from `(0,0)` to `(2,2)` as sequences of two `R`s and two `U`s — `RRUU, RURU, RUUR, URRU, URUR, UURR` — exactly `6`, matching.

### Discard the throwaway example

Not applicable — `grid-paths` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct recognition that grid paths are combinations of move positions.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `combination-count`, from Lesson 62.

### The New Code — type it yourself

```clojure
(defn grid-paths [m n]
  (combination-count (+ m n) m))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(combination-count (+ m n) m)`** — reappearing `combination-count` (Lesson 62): choosing which `m` of the `m+n` total move-slots are right-moves, exactly the way Lesson 62's own combination formula chose which positions from a total belonged to a subset.

### CS Lens

A grid path is, structurally, identical to Lesson 67's stars-and-bars representation — a row of symbols (here, `R`s and `U`s instead of stars and bars), counted by choosing positions for one symbol out of the total — the same underlying "positions in a row" counting idea recurring a third time in this section, after combinations (Lesson 62) and distributions (Lesson 67).

### SE Lens

Recognizing a grid-path problem as "really" a combination count avoids writing a much more expensive recursive path-counting function that would actually trace every path — the same closed-form-versus-generate-and-count tradeoff this series has favored since Lesson 15's very first proven formula.

### Connection to the previous unit

The previous unit derived a genuinely new recurrence from a case-split argument; this unit instead *recognized* an already-solved formula hiding inside a differently-worded problem — two different, both valid routes to counting a recursively-structured object.

---

## Connect the Pieces

Both techniques, and a brief look at what a *third* recursively-structured count — the number of distinct binary trees with `n` nodes — would require: neither a simple two-term recurrence like `valid-strings-count`'s, nor a direct combination like `grid-paths`'s, but a genuinely different recurrence (`C(n) = \sum_{i=0}^{n-1} C(i) \times C(n-1-i)`, summing over every possible split between left and right subtree sizes) — the **Catalan numbers**, a named sequence this series' tree-counting will meet properly once Section VI's advanced structures return to it.

```clojure
(println "Valid 4-length strings, no consecutive 1s:" (valid-strings-count 4))
(println "Paths from (0,0) to (3,2):" (grid-paths 3 2))
```

```
Valid 4-length strings, no consecutive 1s: 8
Paths from (0,0) to (3,2): 10
```

Two structurally different counting problems, each solved by recognizing which already-derived tool actually fits — a recurrence for one, a combination for the other — the central skill this lesson, and this section, has been building toward.

## What Breaks Without This

Suppose `grid-paths` were computed by actually tracing every path recursively instead of recognizing the combination shortcut:

```clojure
(defn grid-paths-naive [m n]
  (if (= m 0)
    1
    (if (= n 0)
      1
      (+ (grid-paths-naive (- m 1) n) (grid-paths-naive m (- n 1))))))
```

This is correct — and has exactly `fib`'s own overlapping-subproblems cost (Lesson 23), recomputing identical smaller grids repeatedly. For a modest `10×10` grid, this naive version performs a genuinely large number of redundant calls, while `grid-paths`'s combination formula computes the identical answer, `C(20,10) = 184{,}756`, in one step — a direct, concrete instance of Lesson 50's growth-rate table, applied to a problem this lesson introduced fresh rather than one already analyzed.

## Exercises

1. **Trace.** By hand, list all `valid-strings-count(2)`'s `3` valid strings, confirming the recurrence's prediction.
2. **Predict.** Before computing it, predict `grid-paths(3,3)` using `combination-count` directly. Verify.
3. **Verify.** Confirm `grid-paths-naive` and `grid-paths` agree on `(2,2)`.
4. **Break it, on purpose.** Estimate (don't necessarily run to completion) how many recursive calls `grid-paths-naive` would make for `(10,10)`, using Lesson 48's recurrence-counting reasoning, and compare to `grid-paths`'s single combination computation.
5. **Generalize.** Derive a recurrence for counting binary strings of length `n` with no three consecutive `1`s (a genuinely different forbidden pattern than this lesson's). State the recurrence and its base cases before implementing it.
6. **Reconstruct.** Close this lesson. From memory, explain why `valid-strings-count` and `fib` share a recurrence shape despite counting completely different things, and explain why `grid-paths` needed no new recurrence at all.

## Definition of Done

- [ ] You can derive a counting recurrence from a case-split argument, the way this lesson did for valid strings.
- [ ] You can recognize when a counting problem reduces to an already-known combination formula, the way `grid-paths` did.
- [ ] You completed Exercise 5, deriving a new recurrence for a different forbidden-pattern string-counting problem.
- [ ] You can explain why `grid-paths-naive` has the same overlapping-subproblems cost as naive `fib`.
- [ ] Commit your Exercise 5 recurrence to your notes repository, with a commit message stating its base cases and verified value — for example, `"Derive no-three-consecutive-1s recurrence a(n)=a(n-1)+a(n-2)+a(n-3), base cases a(0)=1,a(1)=2,a(2)=4; verified a(3)=7"` — not just `"lesson 68 exercise"`.

---

**Next lesson:** Lesson 69, *Generating Functions — Motivation*, introduces a genuinely different way to represent an entire counting sequence at once — as a single algebraic object — previewing a technique Section IV's remaining probability lessons don't need directly, but which unifies everything this section has counted so far.
