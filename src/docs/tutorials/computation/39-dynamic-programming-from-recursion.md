# Lesson 39: Dynamic Programming from Recursion

**What you will build**: By the end of this lesson you'll be able to take a recursive computation with overlapping subproblems and restructure it entirely — computing every needed subproblem exactly once, smallest first, building upward toward the final answer, using nothing but `loop` and `recur`, with no recursion and no cache to check at all.

**What you need to know first**: The previous lesson's memoization and `fib`'s overlapping subproblems, and Lesson 37's `loop`/`recur`.

**Terms introduced in this lesson**:

- **dynamic programming** — solving a problem by computing every needed subproblem's answer once, in order from smallest to largest, rather than recursing downward from the final answer and caching along the way. *Why it matters*: the previous lesson's memoization still recurses top-down, checking a cache at every step; dynamic programming restructures the identical underlying computation to build bottom-up instead, often eliminating recursion — and the cache-checking overhead — entirely.
- **bottom-up** — computing a problem's smallest subproblems first and combining them upward toward the final answer, as opposed to **top-down**, starting from the final answer and recursing down to smaller subproblems as needed. *Why it matters*: the precise contrast between this lesson's technique and the previous lesson's memoization — both eliminate redundant work, from opposite directions.

**Objects and methods used**: None new. This lesson combines `loop`, `recur`, `+`, and `=`, each already fully covered.

---

## Concept Unit: Building Up Instead of Recursing Down

### The Problem

The previous lesson's `fib-memo` eliminates every redundant recomputation, but it still recurses — `fib-memo(4)` calls `fib-memo(3)` and `fib-memo(2)`, checking a cache at every single call, all the way down to the base cases, before any actual arithmetic combines anything back up. Is checking a cache at every step actually necessary, or could the needed values be computed directly, in the order they're needed, without recursing at all?

### Introduce the concept in isolation

Notice what `fib-memo(4)` actually needs, listed out in the order each value first becomes available: `fib(0)`, then `fib(1)`, then `fib(2)` (computable directly from the previous two), then `fib(3)`, then `fib(4)` — each one depending only on the two immediately before it. Nothing about computing them in exactly this order — smallest first, building upward — requires recursion, a cache, or even remembering more than the two most recent values at any point.

### Generalizing

This reordering — compute the smallest subproblems first, then build upward using only what's already been computed — is **dynamic programming**, and it's available whenever a recursive definition's subproblems can be enumerated and computed in a sensible smallest-to-largest order, which is true of `fib` and of every structurally recursive function this section has written on natural numbers.

### CS Lens

This is the same underlying computation memoization already made efficient, viewed from the opposite direction: memoization starts at the top (`fib(4)`) and works down, remembering answers as it goes; dynamic programming starts at the bottom (`fib(0)`) and works up, using answers the moment they're available. Both visit the same set of genuinely distinct subproblems exactly once; only the order and the mechanism differ.

### SE Lens

Eliminating recursion and cache-checking entirely, in favor of a direct, ordered computation, removes overhead the previous lesson's `fib-memo` still carries — every one of its calls, even a cache hit, involves a function call and a lookup; a bottom-up version, as the next unit shows, can compute the identical answer using nothing but a running loop.

---

## Concept Unit: Deriving `fib-dp` — Bottom-Up Fibonacci

### The Problem

Translate "compute `fib(0)`, then `fib(1)`, then build upward using only the two most recent values" directly into a `loop`.

### Introduce the concept in isolation

```clojure
(defn fib-dp [n]
  (loop [i 0
         prev 0
         current 1]
    (if (= i n)
      prev
      (recur (+ i 1) current (+ prev current)))))
```

```
user=> (fib-dp 4)
3
user=> (fib-dp 7)
13
```

Trace it, tracking what `prev` and `current` represent at each pass — `prev` is always `fib(i)`, `current` is always `fib(i + 1)`:

```
i=0: prev=0 (fib 0), current=1 (fib 1)
i=1: prev=1 (fib 1), current=1 (fib 2)
i=2: prev=1 (fib 2), current=2 (fib 3)
i=3: prev=2 (fib 3), current=3 (fib 4)
i=4: i equals n (4) — return prev, which is fib(4) = 3
```

Every pass advances `i` by one and computes the *next* pair of consecutive Fibonacci values from the current pair — `(current, prev + current)` becomes the new `(prev, current)`, exactly the relationship `fib(i+1) = fib(i) + fib(i-1)` restated as an update rule instead of a recursive call.

### Discard the throwaway example

Not applicable — `fib-dp` is a real, reusable, and meaningfully different implementation from `fib-memo`.

### Project Change

- **Reference Source**: No reference counterpart — a direct bottom-up restructuring of `fib`'s own recursive definition, using `loop`/`recur` in place of recursive calls.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn fib-dp [n]
  (loop [i 0
         prev 0
         current 1]
    (if (= i n)
      prev
      (recur (+ i 1) current (+ prev current)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(loop [i 0 prev 0 current 1] ...)`** — reappearing `loop` (Lesson 37), with three tracked values instead of two — `i` (how far along the sequence this pass has reached), `prev` (the most recently completed Fibonacci value), and `current` (the one after it, already computed one step ahead).
- **`(recur (+ i 1) current (+ prev current))`** — reappearing `recur`; the update rule computing the *next* pair from the current one — `current` becomes the new `prev`, and `(+ prev current)` (the actual Fibonacci recurrence) becomes the new `current`.
- **`(if (= i n) prev ...)`** — the stopping condition: once `i` reaches the target `n`, `prev` already holds exactly `fib(n)`, computed on the *previous* pass — no separate final computation is needed.

### CS Lens

`fib-dp` visits exactly `n` passes to compute `fib(n)` — no more, no fewer, and no repeated computation of any value, matching `fib-memo`'s own count of genuinely distinct subproblems exactly, without ever needing a cache to guarantee it: the loop's own structure, visiting each value in order exactly once, makes redundancy structurally impossible rather than merely avoided.

### SE Lens

`fib-dp` also inherits Lesson 35's constant-space guarantee directly, from `recur` — and unlike `fib-memo`, it needs no cache at all, meaning no memory is spent remembering values beyond the two currently needed. This is a genuine, additional advantage dynamic programming often has over memoization: memoization's cache typically grows to hold every distinct subproblem ever seen; a bottom-up version, when a problem's structure allows it (as `fib`'s does), can discard everything except what's still needed going forward.

### Connection to the previous unit

The previous unit reordered the *idea* — compute smallest subproblems first, build upward; this unit is the direct, working code for that idea, using `loop`/`recur` instead of recursion and a cache.

---

## Concept Unit: Why Only Two Values Are Needed — Space Efficiency

### The Problem

`fib-memo`'s cache, by the end of computing `fib(4)`, holds five entries — every distinct Fibonacci value from `fib(0)` through `fib(4)`, kept around indefinitely. `fib-dp` only ever tracks two values, `prev` and `current`, no matter how large `n` gets. Does discarding older values actually lose anything needed?

### Introduce the concept in isolation

Look at the update rule again: `(current, prev + current)` — computing `fib(i+1)` only ever needs `fib(i)` and `fib(i-1)`, the two most recent values. `fib(i-2)`, `fib(i-3)`, and everything earlier is never referenced again once `fib(i)` and `fib(i+1)` are known. `fib-dp` never stores them because it never needs to — this isn't an optimization applied *after* the fact, it's a direct consequence of Fibonacci's own recurrence only ever depending on its two immediate predecessors.

### Discard the throwaway example

Not applicable — this is a direct observation about the structure already derived.

### Generalizing

Not every dynamic-programming problem has this property — some genuinely need to remember every earlier subproblem's answer, not just the last one or two, and require an actual table (an array or a vector, tools this series hasn't formally covered yet) rather than a small, fixed number of rolling variables. `fib`'s specific recurrence — depending on exactly the two previous values — is what makes the two-variable version possible; recognizing *which* subproblems a recurrence actually depends on is what determines how much needs to be remembered at all.

### CS Lens

This distinction — a recurrence depending on a fixed, small number of previous values versus one depending on an unboundedly growing set of them — is exactly what Lesson 121 (*Knapsack*) and Section VI's broader dynamic-programming material study formally: some problems compress down to `fib-dp`'s constant-space shape; others genuinely require a full table, and recognizing which is which, before writing any code, is real design work.

### SE Lens

`fib-memo`'s growing cache is a real, measurable cost `fib-dp` avoids entirely — for a single computation of `fib(n)`, the cache's later entries are simply never needed again, memory spent for no further benefit. This is the concrete version of Concept Unit 1's SE Lens claim: dynamic programming, when a problem's structure allows it, doesn't just avoid recomputation the way memoization does — it can avoid the memory cost of remembering more than is actually still useful.

### Connection to the previous unit

The previous unit derived `fib-dp`'s two-variable update rule without asking why two was enough; this unit answers that question directly, tracing the recurrence itself to show nothing beyond the two most recent values was ever actually needed.

---

## Connect the Pieces

All three approaches to `fib`, agreeing, with their real, distinguishing tradeoffs restated:

```clojure
(println "Naive recursive, fib(6):" (fib 6))
(println "Memoized, fib-memo(6):" (fib-memo 6))
(println "Bottom-up, fib-dp(6):" (fib-dp 6))
```

```
Naive recursive, fib(6): 8
Memoized, fib-memo(6): 8
Bottom-up, fib-dp(6): 8
```

The naive version (Lesson 23) recomputes overlapping subproblems repeatedly — exponentially many total calls as `n` grows. The memoized version (previous lesson) computes each distinct subproblem exactly once, top-down, at the cost of a growing cache and per-call lookup overhead. The bottom-up version (this lesson) computes each distinct subproblem exactly once too, but in a fixed order, using only `loop`/`recur` and two rolling variables — no recursion, no cache, and no memory beyond what's still needed. All three are correct; only their costs differ, and this lesson's version is the cheapest of the three for `fib` specifically, precisely because of the space-efficiency property Concept Unit 3 identified.

## What Breaks Without This

Suppose `fib-dp`'s update rule accidentally swapped which value became the new `prev` and which became the new `current`:

```clojure
(defn broken-fib-dp [n]
  (loop [i 0
         prev 0
         current 1]
    (if (= i n)
      prev
      (recur (+ i 1) (+ prev current) current))))
```

```
user=> (broken-fib-dp 4)
```

The update now computes `(+ prev current)` — correctly, the *next* Fibonacci value — but stores it as the new `prev` instead of the new `current`, while the *old* `current` (which should have advanced) is kept unchanged instead. Tracing this by hand reveals it drifts from the correct sequence almost immediately, producing a plausible-looking but wrong number rather than an error — precisely the same "technically executes, silently wrong" risk this series has flagged since Lesson 1, here arising from a same-shape variable swap rather than a missing check.

## Exercises

1. **Trace.** By hand, trace `(fib-dp 5)`, tracking `i`, `prev`, and `current` at every pass, the way this lesson traced `fib-dp 4`.
2. **Predict.** Before running it, predict `(fib-dp 0)` and `(fib-dp 1)` using the loop's own initial bindings directly, without tracing any passes at all.
3. **Diagnose.** Run `broken-fib-dp` from "What Breaks Without This" on `n = 4`, and trace it by hand to find exactly where it first diverges from the correct sequence.
4. **Break it, on purpose.** Construct a different, single-character change to `fib-dp` (not the one this lesson already showed) that still runs without error but produces a wrong answer for some input. Find the smallest `n` where it first disagrees with the correct `fib-dp`.
5. **Generalize.** Derive a bottom-up, `loop`-based version of `sum-to` (Lesson 20), tracking only the values actually needed at each step, the way `fib-dp` tracked only `prev` and `current`. Verify it against the original `sum-to`.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between memoization and dynamic programming, using the words "top-down" and "bottom-up," and explain why `fib-dp` only needs two variables instead of a growing cache.

## Definition of Done

- [ ] You can derive a bottom-up, `loop`-based version of a recursive function, given its recurrence relation.
- [ ] You completed Exercise 3 and can point to the exact pass where `broken-fib-dp` first diverges from the correct sequence.
- [ ] You completed Exercise 5 (`sum-to`, bottom-up) and verified it against the original.
- [ ] You can explain, precisely, why `fib`'s recurrence allows a two-variable solution while some other dynamic-programming problems need a full table instead.
- [ ] Commit `fib-dp` and your Exercise 5 bottom-up `sum-to` to your notes repository, with a commit message stating how many variables each one needed to track and why — for example, `"Add fib-dp (2 rolling variables) and bottom-up sum-to (1 running total) — both need only the immediately preceding value(s), no full history"` — not just `"lesson 39 exercise"`.

---

**Next lesson:** Lesson 40, *The Recursive Problem-Solving Method*, closes Section II the way Lesson 18 closed Section I — assembling recursive definitions, structural recursion, termination measures, accumulators, memoization, and dynamic programming into one repeatable procedure, applied start to finish to a problem this series hasn't already solved.
