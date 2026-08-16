# Lesson 112: Divide and Conquer

**What you will build**: By the end of this lesson you'll derive a genuinely different strategy from Lesson 111's brute force — splitting a problem into smaller pieces of the *same* problem, solving each independently, and combining the results — applied to the identical "find the largest" problem Lesson 110 specified and Lesson 111 solved by exhaustive scan, verified against that same specification directly.

**What you need to know first**: Lesson 110's `is-largest?` specification; Lesson 111's brute-force baseline, for direct contrast; Lesson 91's low/high index-range pattern; Lesson 30's `max`.

**Terms introduced in this lesson**:

- **divide and conquer** — a strategy solving a problem by splitting it into smaller subproblems of the identical kind, solving each recursively, and combining their results into a solution for the whole. *Why it matters*: a structurally different approach from Lesson 111's brute force, which examines every element in one flat pass — this lesson's strategy instead recurses on shrinking pieces, the same recursive-decomposition idea Lesson 21's structural recursion first named, now applied deliberately as an algorithm-design technique in its own right.

**Objects and methods used**: None new. This lesson reuses `max` (Lesson 30), `quot` (Lesson 54), `get` (Lesson 84), and `declare` (Lesson 38), each already covered.

---

## Concept Unit: Divide, Conquer, Combine

### The Problem

Lesson 111's brute force checked every element of an array in one pass, left to right. Is there a genuinely different way to organize the identical exhaustiveness — one that doesn't scan flat, but instead breaks the problem itself into smaller versions of the same problem?

### Introduce the concept in isolation

**Divide and conquer** has three parts, applied to any problem of size `n`: **divide** the input into smaller pieces (commonly, though not necessarily, splitting roughly in half); **conquer** each piece by solving it recursively, using the *identical* strategy on the smaller piece; **combine** the pieces' results into an answer for the whole. The recursion needs a base case — a piece small enough to solve directly, without dividing further, exactly Lesson 22's own base-case-and-progress requirement, now applied to a problem's *size* rather than a single number's value.

### Discard the throwaway example

Not applicable — this unit states the general pattern; the next unit builds a real instance of it.

### CS Lens

This is Lesson 21's structural recursion, reapplied at the level of algorithm design rather than function definition: a structurally recursive function's shape was "almost forced" once a data definition was fixed (Lesson 21's own claim); divide and conquer is the identical observation turned into a deliberate strategy — split a problem the way Lesson 30's tree definition splits into two subtrees, and a recursive solution's shape follows nearly automatically.

### SE Lens

Divide and conquer doesn't automatically beat brute force — this lesson's own second and third units show a case where it doesn't, asymptotically. Its real value is structural: many problems that resist an obvious flat scan (Lesson 113's merge sort, much later in this series, is the case where the speedup is dramatic) become tractable once split into smaller, identically-shaped pieces.

---

## Concept Unit: `dc-max` — The Same Problem, a Different Strategy

### The Problem

Lesson 110 specified "find the largest" precisely (`is-largest?`); Lesson 111 solved it by brute force. Can the identical specification be satisfied by splitting the input in half, finding each half's maximum recursively, and combining the two results — verified against the exact same specification, without changing it at all?

### Introduce the concept in isolation

```clojure
(declare dc-max)

(defn dc-max-combine [values low high mid]
  (max (dc-max values low mid) (dc-max values (+ mid 1) high)))

(defn dc-max [values low high]
  (if (= low high)
    (get values low)
    (dc-max-combine values low high (quot (+ low high) 2))))
```

```
user=> (dc-max [3 7 2 9 4] 0 4)
9
user=> (is-largest? [3 7 2 9 4] (dc-max [3 7 2 9 4] 0 4))
true
```

`dc-max` **divides** the range `[low, high]` at its midpoint, **conquers** each half by calling itself on `[low, mid]` and `[mid+1, high]`, and **combines** the two results with a single `max` call. The base case — `low = high`, a single element — needs no division at all. `is-largest?` (Lesson 110), never modified, confirms `9` is correct: the same specification, satisfied by a structurally different algorithm than Lesson 111's brute-force scan.

### Discard the throwaway example

Not applicable — `dc-max` and `dc-max-combine` are real, reusable functions.

### Project Change

- **Reference Source**: `dc-max` reuses Lesson 91's low/high index-range pattern directly, and Lesson 91's own `declare`-based mutual recursion (`dc-max`/`dc-max-combine` calling each other, exactly `binary-search`/`search-at-mid`'s shape).
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn dc-max [values low high]
  (if (= low high)
    (get values low)
    (dc-max-combine values low high (quot (+ low high) 2))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= low high)`** — first appearance of this specific base case: a range of exactly one element needs no further division — the smallest possible instance of "find the largest," trivially itself.
- **`(quot (+ low high) 2)`** — reappearing midpoint arithmetic (Lesson 91), the **divide** step, splitting the current range in half.
- **`(dc-max values low mid)`, `(dc-max values (+ mid 1) high)`** — reappearing structural recursion (Lesson 21), the **conquer** step — two recursive calls, each on a strictly smaller range.
- **`(max ... ...)`** — reappearing `max` (Lesson 30), the **combine** step: the larger of the two halves' own maximums is the whole range's maximum.

### CS Lens

`dc-max` and Lesson 111's `find-largest-from` both satisfy the identical `is-largest?` specification, verified here directly rather than only argued — concrete evidence for Lesson 106's own claim that an ADT's promise can be kept by genuinely different representations, now extended to *algorithms* rather than only *data structures*: "find the largest" is the promise; brute-force scanning and divide-and-conquer splitting are two different ways to keep it.

### SE Lens

Nothing about `dc-max`'s correctness depended on understanding brute force at all — its own base case and combine step are a complete, self-contained argument, checked directly against Lesson 110's specification rather than by comparison to Lesson 111's algorithm. This is precisely the value of a specification-first discipline (Lesson 110): a genuinely different algorithm can be validated without ever needing to reason about a previous one.

### Connection to the previous unit

The previous unit stated divide-and-conquer's three-part shape abstractly; this unit is a complete, real, verified instance of it, checked against a specification this series had already built before this lesson began.

---

## Concept Unit: Counting the Cost — a Recurrence, Not a Flat Count

### The Problem

Lesson 111 counted brute force's cost directly, as a sum: `n + (n-1) + \ldots$. `dc-max`'s cost isn't a flat sum over one pass — it's defined by calls to *itself*, on half-sized inputs. What does counting the cost of a function defined recursively, in terms of smaller calls to itself, actually look like?

### Introduce the concept in isolation

Trace every `dc-max-combine` call — the only place any real work (`max`) happens — for `n=5`:

```
combine(0,4) -> combine(0,2), combine(3,4)
combine(0,2) -> combine(0,1), (0,0 and 2,2 are base cases)
combine(0,1) -> (0,0 and 1,1 are base cases)
combine(3,4) -> (3,3 and 4,4 are base cases)
```

Four `combine` calls total, for `n=5` — one fewer than the number of elements. This isn't a coincidence: every `combine` call corresponds to one internal branching point in the recursion, and a binary recursion splitting `n$ leaves always has exactly `n-1` internal branch points, the same counting fact Lesson 68 (*Counting Recursive Structures*) studies in general. `dc-max`'s total cost is `O(n)` — genuinely no better than Lesson 111's own `O(n^2)$... except for `dc-max` specifically, since a single `max` call is `O(1)`, unlike brute force's own repeated *full re-scans*. `dc-max`'s `O(n)` here actually **matches** Lesson 111's own theoretical minimum for this problem (every element must be examined at least once by any correct algorithm) — divide and conquer didn't beat brute force's asymptotic class for *this specific problem*, it matched the best possible bound by a different route.

### Discard the throwaway example

Not applicable — a direct count of this lesson's own already-run example, not new code.

### CS Lens

This is Lesson 48/49's recurrence-solving vocabulary, applied for the first time to an actual divide-and-conquer algorithm rather than a plain sequence: `dc-max`'s cost `T(n)` satisfies `T(n) = 2T(n/2) + O(1)$ — two half-sized recursive calls plus one `O(1)` combine step — a recurrence whose solution is `O(n)`, confirmed here by direct counting rather than only by formula.

### SE Lens

Divide and conquer's real payoff isn't guaranteed just by splitting a problem in half — it depends entirely on how expensive the **combine** step is relative to the pieces it's combining. Here, combining is a single `O(1)` comparison, and the result merely matches brute force's own best case. Lesson 113's merge sort combines two *already-sorted* pieces with an `O(n)` merge step, not `O(1)` — a genuinely different tradeoff this lesson's honest, non-dramatic result sets up directly, rather than overselling divide and conquer as automatically faster.

### Connection to the previous unit

The previous unit built and verified `dc-max`; this unit counts its real cost precisely, honestly reporting that this specific application doesn't beat brute force asymptotically — setting up exactly the question Lesson 113 answers for a problem where it does.

---

## Connect the Pieces

Both algorithms, the identical specification, and both real costs, together:

```clojure
(println "Brute force result:" (find-largest-from [3 7 2 9 4]))
(println "Divide and conquer result:" (dc-max [3 7 2 9 4] 0 4))
(println "Both satisfy is-largest??" (and (is-largest? [3 7 2 9 4] (find-largest-from [3 7 2 9 4])) (is-largest? [3 7 2 9 4] (dc-max [3 7 2 9 4] 0 4))))
(println "Brute force comparisons, n=5:" 5)
(println "Divide-and-conquer combine calls, n=5:" 4)
```

```
Brute force result: 9
Divide and conquer result: 9
Both satisfy is-largest?? true
Brute force comparisons, n=5: 5
Divide-and-conquer combine calls, n=5: 4
```

Two structurally different algorithms, one unmodified specification, both verified correct against it directly — and a real, counted cost showing this particular application of divide and conquer matches brute force's own best case rather than beating it, an honest result this lesson's own SE lens explains rather than glosses over.

## What Breaks Without This

Suppose `dc-max` were called with `low > high` — an empty range, the way Lesson 111's `find-largest-from` never had to consider, since it always starts from a non-empty precondition-checked input:

```
user=> (dc-max [3 7 2 9 4] 3 2)
```

`(= low high)` is `false` (`3 \neq 2$), so `dc-max-combine` runs, computing `mid = (quot (+ 3 2) 2) = 2`, then recursing into `(dc-max values 3 2)` again — the identical call, unchanged, forever. `dc-max` was only ever proven correct (Lesson 110's `is-largest?`) relative to its own precondition — a valid, non-empty range with `low \leq high$ — exactly Lesson 110's own opening lesson: a specification's guarantee only ever covers the inputs its precondition actually admits, and this lesson's `dc-max` never had a `valid-input?`-style guard because its every real use, so far, respected that precondition by construction.

## Exercises

1. **Trace.** By hand, trace `(dc-max [5 1 4 2] 0 3)`, showing every `combine` call and its two recursive results.
2. **Predict.** Before checking, predict how many `combine` calls `(dc-max [1 2 3 4 5 6 7 8] 0 7)` (`n=8`) makes, using this lesson's `n-1` claim. Verify by tracing.
3. **Verify.** Confirm `(is-largest? [5 1 4 2] (dc-max [5 1 4 2] 0 3))` reports `true`, the same specification-checking discipline this lesson used throughout.
4. **Break it, on purpose.** Call `dc-max` with `low > high`, as "What Breaks Without This" describes, and confirm it never terminates (interrupt it after confirming the pattern, rather than waiting).
5. **Generalize.** Write `dc-min`, the divide-and-conquer counterpart for finding the *smallest* value, changing only the `combine` step's comparison.
6. **Reconstruct.** Close this lesson. From memory, state divide and conquer's three parts, and explain why this lesson's own application didn't beat brute force's asymptotic cost, even though it used a genuinely different strategy.

## Definition of Done

- [ ] You can state divide and conquer's three parts from memory.
- [ ] You can implement `dc-max` and verify it against Lesson 110's `is-largest?` specification directly.
- [ ] You can explain why this lesson's `dc-max` doesn't beat brute force asymptotically, using the cost of its combine step.
- [ ] You completed Exercise 2 and confirmed the `n-1` combine-call count for `n=8`.
- [ ] You completed Exercise 5 and implemented a correct `dc-min`.
- [ ] Commit your Exercise 2 and Exercise 5 work to your notes repository, with a commit message stating what you confirmed and built — for example, `"Confirm n-1 combine calls for n=8; implement dc-min via divide and conquer"` — not just `"lesson 112 exercise"`.

---

**Next lesson:** Lesson 113, *Merge Sort*, applies this lesson's exact three-part strategy to sorting itself — where, unlike this lesson's `dc-max`, the combine step does real, substantial work, and that difference is precisely what lets it beat Lesson 111's brute-force baseline decisively rather than merely matching it.
