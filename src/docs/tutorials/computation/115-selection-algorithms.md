# Lesson 115: Selection Algorithms

**What you will build**: By the end of this lesson you'll reuse Lesson 114's own `partition-range` for a genuinely different question than sorting — "what's the `k`-th smallest value?" — and derive why answering that one narrower question never requires fully sorting the input at all, typically costing `O(n)` rather than `O(n \log n)`.

**What you need to know first**: Lesson 114's `partition-range` and `quick-sort`; Lesson 47's geometric series, for this lesson's cost derivation; Lesson 91's low/high index-range vocabulary.

**Terms introduced in this lesson**:

- **order statistic** — the `k`-th smallest value in a collection (the `0`-th is the minimum, the last is the maximum). *Why it matters*: "sort everything, then read off position `k`" answers this question correctly but does far more work than the question actually requires — this lesson derives an algorithm that answers it directly.

**Objects and methods used**: None new. This lesson reuses `partition-range` (Lesson 114), `get` (Lesson 84), and `declare` (Lesson 38), each already covered.

---

## Concept Unit: Why Only One Side Ever Matters

### The Problem

`partition-range` places its pivot in its own final, correct sorted position — every element before it smaller-or-equal, every element after it larger. If the pivot happens to land *exactly* at position `k`, the answer to "what's the `k`-th smallest" is already known, with no further work at all. What if it doesn't land there?

### Introduce the concept in isolation

If the pivot lands at some position *greater* than `k`, every element the `k`-th smallest value could possibly be is entirely contained in the *left* partition — nothing in the right partition, all confirmed larger than the pivot, and the pivot itself, could ever be the `k`-th smallest. Symmetrically, if the pivot lands *before* `k`, the answer must be somewhere in the right partition. Either way, **one entire side can be discarded without ever examining it** — a genuinely different move than Lesson 114's `quick-sort`, which recurses into *both* sides every time.

### Discard the throwaway example

Not applicable — this unit states the key insight; the next unit builds a real algorithm from it.

### CS Lens

This is Lesson 91's own binary-search elimination logic, reapplied: a single comparison (here, the pivot's position against `k`) proves an entire region can't contain the answer, discarding it without inspection — the identical "eliminate half without looking at it" idea, now driven by a partition's own guarantee rather than a sorted array's ordering.

### SE Lens

Discarding one whole side, rather than recursing into both the way `quick-sort` must, is precisely what this lesson's third unit shows makes selection cheaper than sorting — sorting has to place *every* element correctly; finding one order statistic only ever has to correctly place the elements on the path to position `k`.

---

## Concept Unit: `quick-select` — Recursing Into Only the Relevant Side

### The Problem

Can this lesson's own elimination insight be written as a real, complete algorithm, reusing `partition-range` exactly as it already exists?

### Introduce the concept in isolation

```clojure
(declare quick-select)

(defn quick-select-around [partitioned low high k]
  (if (= (get partitioned 1) k)
    (get (get partitioned 0) k)
    (if (< k (get partitioned 1))
      (quick-select (get partitioned 0) low (- (get partitioned 1) 1) k)
      (quick-select (get partitioned 0) (+ (get partitioned 1) 1) high k))))

(defn quick-select [values low high k]
  (if (= low high)
    (get values low)
    (quick-select-around (partition-range values low high) low high k)))
```

```
user=> (quick-select [7 2 9 4 3] 0 4 0)
2
user=> (quick-select [7 2 9 4 3] 0 4 2)
4
user=> (quick-select [7 2 9 4 3] 0 4 4)
9
```

Fully sorted, `[7 2 9 4 3]` becomes `[2 3 4 7 9]` — `k=0` (the minimum) is `2`, `k=2` (the median) is `4`, `k=4` (the maximum) is `9`. `quick-select` reaches each one directly: for `k=2`, the first partition places its pivot (`3`) at index `1` — since `2 > 1`, the entire left side is discarded and the search continues only in `[2, 4]`; a second partition there places `7` at index `3` — since `2 < 3`, the *right* side of that is discarded, narrowing to a single remaining element, `4`, found immediately.

### Discard the throwaway example

Not applicable — every function here is real and reusable; all three results were hand-traced in full before being shown here.

### Project Change

- **Reference Source**: `quick-select`/`quick-select-around` reuse Lesson 114's `partition-range` directly, unchanged, with `quick-sort-around`'s two-recursive-calls replaced by exactly one, chosen by comparing `k` against the pivot's own index.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn quick-select [values low high k]
  (if (= low high)
    (get values low)
    (quick-select-around (partition-range values low high) low high k)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= low high)`** — reappearing base case (Lesson 112, Lesson 114): a single-element range is trivially its own `0`-th (and only) order statistic.
- **`(= (get partitioned 1) k)`** — first appearance: the pivot's own index already equals the target — done, no recursion needed at all.
- **`(< k (get partitioned 1))`** — first appearance of this lesson's own elimination decision: `k` sits strictly before the pivot's position, so the answer must be in the left partition.
- **`(quick-select (get partitioned 0) low (- (get partitioned 1) 1) k)`, `(quick-select ... (+ (get partitioned 1) 1) high k)`** — reappearing structural recursion (Lesson 114), but — unlike `quick-sort-around` — only *one* of these two ever actually runs per call, never both.

### CS Lens

`quick-select` and `quick-sort` share their entire divide step (`partition-range`, byte for byte) and differ in exactly one place: how many of the two possible recursive calls actually happen — a direct, concrete instance of Lesson 106's own lesson, two algorithms built from nearly identical parts, differing only in the one place their actual questions diverge.

### SE Lens

`quick-select` never sorts the "discarded" side at all — in the trace above, the right partition from the first split (`[9]`, the elements larger than `3`) is never touched again once eliminated, unlike `quick-sort`, which would recurse into it regardless. This is the entire reason selection can be cheaper than sorting: sorting can't skip any element's placement; selection can skip an entire side's.

### Connection to the previous unit

The previous unit argued one side can always be discarded; this unit is the real algorithm doing exactly that, reusing Lesson 114's partition unchanged and verified correct on three different order statistics from the identical input.

---

## Concept Unit: Why Selection Beats Sorting

### The Problem

"Sort everything, then read off position `k`" costs `O(n \log n)` (Lesson 113 or Lesson 114) and is always correct. Does discarding one side at each step actually cost less overall, or does it only feel cheaper without actually being so?

### Introduce the concept in isolation

Each `partition-range` call costs `O(\text{its own range size})`. When the pivot splits roughly evenly, the range searched shrinks by about half each time: `n$, then `n/2`, then `n/4`, and so on. Summing this — Lesson 47's own geometric series — gives a total bounded by `n + n/2 + n/4 + \ldots \approx 2n`, still `O(n)`. Compare this directly to `quick-sort`'s own recurrence (Lesson 113/114): sorting must recurse into *both* halves at every level, `\log n` levels, `O(n)` work each — `O(n \log n)` total. Selection only ever follows *one* branch, so its geometric series collapses to a constant multiple of `n`, not `n` multiplied by `\log n$ separate levels.

### Discard the throwaway example

Not applicable — a direct cost derivation, not new code.

### CS Lens

This is the identical geometric-series shape Lesson 95's `heapify` cost argument used — most of the "levels" a naive analysis might count contribute vanishingly little once weighted correctly, and the total collapses to a constant multiple of `n` rather than growing with the number of levels.

### SE Lens

This lesson's own honest caveat, directly inherited from Lesson 114: `quick-select`'s `O(n)` cost assumes a reasonably balanced split at each step, exactly like `quick-sort`'s `O(n \log n)`. On already-sorted input with this lesson's own naive last-element pivot, `partition-range` produces the identical `n-1`-and-`0$ split Lesson 114 already demonstrated, and `quick-select` degrades to `O(n^2)` in the worst case too — the same adversarial-input risk, inherited directly because the divide step is the identical, unmodified code.

### Connection to the previous unit

The previous unit built and verified `quick-select`; this unit is why discarding one side at each step, rather than recursing into both, changes the total cost class from `O(n \log n)` to `O(n)`, typically — and why that typical case carries the identical caveat Lesson 114 already named honestly.

---

## Connect the Pieces

Selection versus full sorting, on the same input, both correct:

```clojure
(println "quick-select for k=2:" (quick-select [7 2 9 4 3] 0 4 2))
(println "Full sort, then index 2:" (get (quick-sort [7 2 9 4 3] 0 4) 2))
(println "Selection typical cost: O(n)")
(println "Full-sort-then-index cost: O(n log n)")
```

```
quick-select for k=2: 4
Full sort, then index 2: 4
Selection typical cost: O(n)
Full-sort-then-index cost: O(n log n)
```

Both approaches agree — `4` is genuinely the median of these five values — and both are correct for every `k`, but only one of them does the strictly smaller amount of work the question actually required.

## What Breaks Without This

Suppose `quick-select-around` recursed into *both* sides, the way `quick-sort-around` does, then picked out the correct answer afterward:

```clojure
(defn broken-select-around [partitioned low high k]
  (get (quick-sort-around partitioned low high) k))
```

This still produces a correct answer — a fully sorted array indexed at `k` is exactly right — but it does so by fully sorting *both* partitions, including the entire side this lesson's own first unit proved could never contain the answer. `broken-select-around` isn't wrong, it's merely `quick-sort` again, wearing this lesson's name — the actual saving this lesson derives (discarding a whole side, unexamined) evaporates the moment both sides get recursed into regardless.

## Exercises

1. **Trace.** By hand, trace `(quick-select [4 1 3 2 5] 0 4 1)`, showing which side gets discarded at each step.
2. **Predict.** Before checking, predict how many total `partition-range` calls `(quick-select [7 2 9 4 3] 0 4 4)` needs, using this lesson's own worked trace for `k=4`. Verify by re-reading the trace above.
3. **Verify.** Confirm `(quick-select [7 2 9 4 3] 0 4 3)` matches `(get (quick-sort [7 2 9 4 3] 0 4) 3)` — the fourth-smallest value, found two different ways.
4. **Break it, on purpose.** Run `quick-select` on already-sorted input `[1 2 3 4 5]` searching for `k=4` (the maximum), and count how many elements `partition-range` actually examines at each level — confirm it matches this lesson's own worst-case concern.
5. **Generalize.** Using Lesson 47's geometric series formula directly, derive the exact constant this lesson's `\approx 2n$ estimate comes from.
6. **Reconstruct.** Close this lesson. From memory, explain why `quick-select` only ever recurses into one side, and why that single change drops the typical cost from `O(n \log n)` to `O(n)`.

## Definition of Done

- [ ] You can implement `quick-select` and explain why it discards one side entirely rather than recursing into both.
- [ ] You can derive `quick-select`'s typical `O(n)` cost using Lesson 47's geometric series.
- [ ] You can explain why `quick-select` inherits `quick-sort`'s own worst-case risk on adversarial input.
- [ ] You completed Exercise 3 and confirmed selection and full-sort-then-index agree.
- [ ] You completed Exercise 4 and confirmed the worst case concretely on sorted input.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed — for example, `"Confirm quick-select and sort-then-index agree on k=3; confirm O(n^2) worst case on sorted input for k=n-1"` — not just `"lesson 115 exercise"`.

---

**Next lesson:** Lesson 116, *Lower Bounds*, steps back from any one algorithm to ask a different kind of question entirely — not "how fast is this specific solution," but "how fast could *any* correct solution to this problem possibly be," establishing when Lesson 111 through this lesson's own algorithms are already, provably, as good as anything could ever be.
