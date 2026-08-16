# Lesson 114: Quick Sort

**What you will build**: By the end of this lesson you'll derive a second `O(n \log n)$-typical sorting algorithm — dividing by *value* around a chosen **pivot** rather than by *position* the way Lesson 113's merge sort did — and derive precisely why, unlike merge sort, its worst case depends entirely on that choice, connecting directly to Lesson 97's own insertion-order concern for BSTs.

**What you need to know first**: Lesson 113's merge sort and its recurrence; Lesson 97's BST degeneration under adversarial input, for direct comparison; Lesson 94's `heap-swap`; Lesson 85's vector-as-pair, for this lesson's own return-two-things problem.

**Terms introduced in this lesson**:

- **pivot** — a chosen element used to split a range into "smaller than the pivot" and "greater than the pivot" before recursing on each part. *Why it matters*: quick sort's entire divide step is built around this one choice, and, this lesson's third unit shows, a poor choice of pivot is what causes its worst case — a genuinely different failure mode than merge sort has at all.
- **partition** — rearranging a range so every element less than or equal to the pivot comes before it and every element greater comes after, placing the pivot itself in its final sorted position. *Why it matters*: quick sort's actual combine-by-dividing step, replacing merge sort's separate merge operation entirely.

**Objects and methods used**: None new. This lesson reuses `heap-swap` (Lesson 94), `get` (Lesson 84), and `declare` (Lesson 38), each already covered.

---

## Concept Unit: `partition` — Dividing by Value, Not by Position

### The Problem

Lesson 113's merge sort divides a range purely by *position* — always the exact midpoint, regardless of the values there. Can a range instead be divided by *value* — everything at most some chosen element on one side, everything greater on the other — placing that element directly into its own final, correct position in the same pass?

### Introduce the concept in isolation

```clojure
(declare partition-from)

(defn partition-step [values pivot-value i j high]
  (if (<= (get values j) pivot-value)
    (partition-from (heap-swap values (+ i 1) j) pivot-value (+ i 1) (+ j 1) high)
    (partition-from values pivot-value i (+ j 1) high)))

(defn partition-from [values pivot-value i j high]
  (if (>= j high)
    [(heap-swap values (+ i 1) high) (+ i 1)]
    (partition-step values pivot-value i j high)))

(defn partition-range [values low high]
  (partition-from values (get values high) (- low 1) low high))
```

```
user=> (partition-range [7 2 9 4 3] 0 4)
[[2 3 9 4 7] 1]
```

The last element, `3`, is chosen as the **pivot**. `i` starts at `low - 1` — "nothing confirmed smaller-or-equal yet" — and `j` scans from `low` up to (but not including) `high`, where the pivot itself sits. Every time an element `\leq` the pivot is found, `i` advances and that element swaps into the boundary position, growing the "smaller-or-equal" region by exactly one. Once scanning finishes, the pivot swaps from `high` into position `i+1` — its own final position — and `partition-range` returns **both** the rearranged array and that position, Lesson 85's vector-as-pair, since a caller needs both to know where to recurse next.

### Discard the throwaway example

Not applicable — every function here is real, and its output was verified by hand-tracing every step, not assumed.

### Project Change

- **Reference Source**: No reference counterpart — a direct derivation of the Lomuto partition scheme, using Lesson 94's `heap-swap`, Lesson 91's low/high index-range vocabulary, and Lesson 85's vector-as-pair for the two-part result.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn partition-range [values low high]
  (partition-from values (get values high) (- low 1) low high))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(- low 1)`** — first appearance of this specific starting value: `i` begins *one position before* the range even starts, so that the very first confirmed-smaller element correctly lands at `low` itself once `i` advances to it.
- **`(>= j high)`** — first appearance of this exact boundary: scanning stops *before* reaching `high`, since the pivot itself sits there and must never be compared against itself mid-scan.
- **`(<= (get values j) pivot-value)`** — first appearance: the one test deciding whether the scanned element belongs in the "smaller-or-equal" region.
- **`(heap-swap values (+ i 1) j)`** — reappearing `heap-swap` (Lesson 94), moving a confirmed element into the boundary position, extending the region by exactly one.
- **`[(heap-swap values (+ i 1) high) (+ i 1)]`** — first appearance: once scanning is complete, the pivot (still at `high`) swaps into position `i+1`; the result pair carries both the rearranged array and that exact index forward.

### CS Lens

Every element from `low` to `high - 1` is examined exactly once during the scan, and at most one additional swap places the pivot — `partition` costs `O(n)` for a range of `n` elements, the identical cost class as Lesson 113's own `merge`, achieved by a structurally different mechanism: comparing against one fixed value, not merging two already-sorted pieces.

### SE Lens

Unlike Lesson 113's merge, which needed both halves *already sorted* before combining, `partition` needs nothing sorted beforehand at all — it's a genuine, self-contained divide step, which is exactly why quick sort's recursive structure (next unit) looks different from merge sort's: the "combine" work happens *before* recursing, not after.

---

## Concept Unit: `quick-sort` — Recursing Around an Already-Placed Pivot

### The Problem

Once `partition-range` places the pivot in its own final position, with everything smaller-or-equal before it and everything larger after, what's left to sort — and how does a caller know *where* to recurse, given `partition-range` returns a pair, not a plain array?

### Introduce the concept in isolation

```clojure
(declare quick-sort)

(defn quick-sort-around [partitioned low high]
  (quick-sort (quick-sort (get partitioned 0) low (- (get partitioned 1) 1)) (+ (get partitioned 1) 1) high))

(defn quick-sort [values low high]
  (if (>= low high)
    values
    (quick-sort-around (partition-range values low high) low high)))
```

```
user=> (quick-sort [7 2 9 4 3] 0 4)
[2 3 4 7 9]
```

`(get partitioned 1)` — the pivot's own index, carried in the pair `partition-range` returned — is exactly where `quick-sort-around` splits its two recursive calls: everything from `low` to `pivot-index - 1`, and everything from `pivot-index + 1` to `high`. The pivot's own position is never touched by either call, since `partition-range` already proved it's exactly where it belongs.

### Discard the throwaway example

Not applicable — `quick-sort` and `quick-sort-around` are real, reusable functions, hand-traced in full before being presented here.

### Project Change

- **Reference Source**: `quick-sort`/`quick-sort-around` reuse Lesson 113's `merge-sort`/`merge-sort-combine` `declare`-based recursive shape directly, with `partition-range` (this lesson's own first unit) replacing the divide-by-midpoint step, and its returned pair (Lesson 85) replacing a plain midpoint value.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn quick-sort [values low high]
  (if (>= low high)
    values
    (quick-sort-around (partition-range values low high) low high)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(>= low high)`** — reappearing base case (Lesson 112, Lesson 113): a range of zero or one elements needs no partitioning.
- **`(get partitioned 0)`, `(get partitioned 1)`** — reappearing vector-as-pair access (Lesson 85): the rearranged array and the pivot's index, read out of `partition-range`'s own returned pair.
- **`(quick-sort (get partitioned 0) low (- (get partitioned 1) 1))`** — reappearing structural recursion (Lesson 112, Lesson 113): sort everything strictly before the pivot first, as a complete operation.
- **`(quick-sort ... (+ (get partitioned 1) 1) high)`** — the second recursive call, on the result of the first, sorting everything strictly after the pivot — the identical sequencing discipline Lesson 113's `merge-sort` used for its own two halves.

### CS Lens

Quick sort's divide step *is* its combine step — `partition-range` both splits the range and places one element in its final position simultaneously, unlike merge sort, where dividing (a plain midpoint split) and combining (the separate `merge` pass) are two entirely distinct operations.

### SE Lens

Because the pivot is always chosen from the data itself — here, whatever happens to sit at `high` — the *quality* of the split (roughly even halves, or badly lopsided) depends entirely on what value that happens to be, a dependency merge sort's own midpoint-by-position divide never has at all.

### Connection to the previous unit

The previous unit built `partition-range`, a self-contained divide-and-combine step returning both a rearranged array and a position; this unit recurses around exactly that position, producing a complete sort whose correctness follows directly from `partition-range`'s own guarantee: smaller-or-equal before, larger after, pivot exactly between.

---

## Concept Unit: Why the Pivot Choice Decides the Worst Case

### The Problem

Lesson 113's merge sort always splits exactly in half, regardless of the data — its `O(n \log n)$ cost held unconditionally. Quick sort's split depends on where the pivot value actually lands. Does a poorly-chosen pivot degrade quick sort the same way Lesson 97 showed a poorly-ordered insertion sequence degrades a plain BST?

### Introduce the concept in isolation

Trace `(partition-range [1 2 3] 0 2)` — already-sorted input, pivot always the *last* (and therefore largest) element:

```
i=-1, j=0: values[0]=1<=3 -> swap(0,0) [no-op], i=0
i=0,  j=1: values[1]=2<=3 -> swap(1,1) [no-op], i=1
j>=high (2>=2): swap(2,2) [no-op] -> pivot-index=2
```

Every element was `\leq` the pivot — the split is `[0,1]` (`2` elements) and `[3,2]` (empty, since `3 > 2$). `quick-sort` on already-sorted input, choosing the last element as pivot every time, produces the most lopsided split possible: `n-1` and `0`, at every single level, not roughly-equal halves.

### Discard the throwaway example

Not applicable — this trace confirms a real property of already-verified code.

### CS Lens

This is precisely Lesson 97's own concern, transplanted from a BST's insertion order to quick sort's pivot choice: a plain BST's depth depends on insertion order because nothing constrains where a new value lands; quick sort's split depends on pivot choice because nothing here constrains which value gets chosen, and "always pick the last element" interacts disastrously with already-sorted input, the identical shape of adversarial-input concern Lesson 97 raised for a completely different structure.

### SE Lens

`n-1`-and-`0` splits at every level mean `n` levels, not `\log n$ — each level's partition still costs `O(\text{its own range size})`, and summing `n + (n-1) + (n-2) + \ldots + 1$ is exactly Lesson 111's own arithmetic series, `O(n^2)$. This is a real, honest cost quick sort carries that merge sort never does: sorted or nearly-sorted input — common in practice, exactly as Lesson 97 already argued — is this algorithm's *worst* case, not a neutral one, whenever the pivot is chosen naively from a fixed position. Real-world implementations choose pivots more carefully (a random element, or the median of a few samples) specifically to make this degenerate case rare rather than routine — a refinement this lesson names honestly without deriving in full.

### Connection to the previous unit

The previous unit assembled a complete, correct sort; this unit is why its cost is not unconditionally `O(n \log n)$ the way merge sort's is — the pivot choice this lesson made simplest (always the last element) is exactly the choice that fails hardest on exactly the input Lesson 97 already showed is common, not rare.

---

## Connect the Pieces

Both sorts, their recurrences, and their differing worst-case honesty, together:

```clojure
(println "Quick sort on [7 2 9 4 3]:" (quick-sort [7 2 9 4 3] 0 4))
(println "Merge sort's guarantee: O(n log n), every input, unconditionally")
(println "Quick sort's typical cost: O(n log n), for a reasonably balanced pivot")
(println "Quick sort's worst case: O(n^2), on already-sorted input with a naive pivot choice")
```

```
Quick sort on [7 2 9 4 3]: [2 3 4 7 9]
Merge sort's guarantee: O(n log n), every input, unconditionally
Quick sort's typical cost: O(n log n), for a reasonably balanced pivot
Quick sort's worst case: O(n^2), on already-sorted input with a naive pivot choice
```

Two algorithms, the identical typical-case cost class, and one genuine, honest difference: merge sort's guarantee never depends on the input; quick sort's does, in exactly the way Lesson 97 already warned a naive structure's guarantee can.

## What Breaks Without This

Suppose a system sorted timestamped log entries — nearly sorted by their very nature, exactly Lesson 97's own realistic scenario — using this lesson's `quick-sort`, always choosing the last element as pivot, trusting "quick sort is `O(n \log n)`" as an unconditional fact the way merge sort's guarantee actually is. Every partition would split `n-1` and `0`, reproducing this lesson's third unit's own worst case at real scale: `O(n^2)$, not `O(n \log n)`, silently, with `quick-sort` remaining fully correct throughout — every element still ends up in its right place — while running far slower than the same data would through Lesson 113's merge sort, whose guarantee never depended on the data's own order at all.

## Exercises

1. **Trace.** By hand, trace `(partition-range [4 1 3 2 5] 0 4)` — pivot `5`, already the largest — confirming it produces a `4`-and-`0` split with pivot-index `4`.
2. **Predict.** Before checking, predict `(quick-sort [5 4 3 2 1] 0 4)` (fully reverse-sorted). Does the naive last-element pivot choice also degrade on this input? Trace `partition-range` on it to confirm.
3. **Verify.** Confirm `(quick-sort [7 2 9 4 3] 0 4)` and `(merge-sort [7 2 9 4 3] 0 4)` (Lesson 113) produce identical sorted output.
4. **Break it, on purpose.** Count the total partition-scan work for `(quick-sort [1 2 3 4 5] 0 4)` (already sorted), confirming it matches this lesson's own `O(n^2)$ claim via Lesson 111's arithmetic series.
5. **Generalize.** Describe, without implementing it, how choosing the pivot *randomly* (Lesson 78's `shuffle`-style randomization) would change this lesson's worst-case argument.
6. **Reconstruct.** Close this lesson. From memory, explain why quick sort's worst case depends on its input while merge sort's does not, connecting directly to Lesson 97's own BST concern.

## Definition of Done

- [ ] You can implement `partition-range` and explain why `i` starts at `low - 1`, not `low`.
- [ ] You can implement `quick-sort` and explain why it needs both elements of `partition-range`'s returned pair.
- [ ] You can explain why already-sorted input is quick sort's worst case under a naive pivot choice.
- [ ] You completed Exercise 3 and confirmed matching output against Lesson 113's merge sort.
- [ ] You completed Exercise 4 and confirmed the `O(n^2)$ worst case numerically.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed — for example, `"Confirm quick-sort and merge-sort agree on output; confirm O(n^2) worst case on sorted input via arithmetic series"` — not just `"lesson 114 exercise"`.

---

**Next lesson:** Lesson 115, *Selection Algorithms*, reuses this lesson's own `partition-range` step for a genuinely different question than sorting — finding just the `k`-th smallest value without fully sorting anything — and derives why that narrower question can be answered faster than sorting the whole input.
