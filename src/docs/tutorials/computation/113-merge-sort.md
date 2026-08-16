# Lesson 113: Merge Sort

**What you will build**: By the end of this lesson you'll apply Lesson 112's exact three-part strategy — divide, conquer, combine — to sorting itself, where the combine step does real, substantial work rather than Lesson 112's single `O(1)` comparison, and derive precisely why that difference lets this lesson's algorithm beat Lesson 111's `O(n^2)$ brute-force baseline decisively.

**What you need to know first**: Lesson 112's divide-and-conquer pattern and its `declare`-based mutual recursion; Lesson 111's brute-force sort, for direct comparison; Lesson 94's `assoc`-as-append convention; Lesson 43's logarithms.

**Terms introduced in this lesson**:

- **merge** — combining two already-sorted sequences into one sorted sequence, by repeatedly taking the smaller of the two sequences' next unconsumed elements. *Why it matters*: this lesson's actual combine step — genuinely more expensive than Lesson 112's single comparison, and, this lesson's third unit shows, exactly what makes the resulting sort faster than brute force.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), `quot` (Lesson 54), and `declare` (Lesson 38), each already covered.

---

## Concept Unit: `merge` — Combining Two Sorted Pieces

### The Problem

Two already-sorted pieces of the same array — say, positions `0` through `2` and positions `3` through `5` — need to become one sorted piece, positions `0` through `5`, without re-sorting anything already in order. Can this be done by examining each element only once?

### Introduce the concept in isolation

Walk two pointers, one into each sorted piece, always taking whichever pointer's current element is smaller:

```clojure
(defn merge-drain [values src-i src-end k result]
  (if (> src-i src-end)
    result
    (merge-drain values (+ src-i 1) src-end (+ k 1) (assoc result k (get values src-i)))))
```

`merge-drain` handles the case where one side has run out early — the remaining elements of the *other* side are already sorted relative to each other, so they can simply be copied across in order, one position at a time.

```clojure
(declare merge-from)

(defn merge-take-left [values i mid j high k result]
  (merge-from values (+ i 1) mid j high (+ k 1) (assoc result k (get values i))))

(defn merge-take-right [values i mid j high k result]
  (merge-from values i mid (+ j 1) high (+ k 1) (assoc result k (get values j))))
```

`merge-take-left` and `merge-take-right` each place one element (from the left pointer `i` or the right pointer `j`) into position `k` of the result, then advance that one pointer and `k` together.

```clojure
(defn merge-from [values i mid j high k result]
  (if (> i mid)
    (merge-drain values j high k result)
    (if (> j high)
      (merge-drain values i mid k result)
      (if (<= (get values i) (get values j))
        (merge-take-left values i mid j high k result)
        (merge-take-right values i mid j high k result)))))

(defn merge-ranges [values low mid high]
  (merge-from values low mid (+ mid 1) high low values))
```

```
user=> (merge-ranges [1 4 7 2 3 9] 0 2 5)
[1 2 3 4 7 9]
```

`[1 4 7 2 3 9]` has two already-sorted pieces: `[1 4 7]` (positions `0`–`2`) and `[2 3 9]` (positions `3`–`5`). `merge-ranges` walks both from their own start, always taking the smaller current element — `1$, then `2$ (right pointer starts smaller), then `3$, then `4`, then `7`, then the right side's own remaining `9` drains last — producing `[1 2 3 4 7 9]`, fully sorted, examining each of the six elements exactly once.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: No reference counterpart — a direct derivation from the requirement "each of two sorted sequences examined once, smaller element taken first," using Lesson 91's low/high/mid index-range vocabulary and Lesson 94's `assoc`-as-append convention.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn merge-ranges [values low mid high]
  (merge-from values low mid (+ mid 1) high low values))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(merge-from values low mid (+ mid 1) high low values)`** — first appearance: `result` starts as `values` itself, not an empty vector — positions outside `[low, high]` are already correct by simply *being* `values`, and only positions `[low, high]` get overwritten as the merge proceeds.
- **`(<= (get values i) (get values j))`** — first appearance: the one comparison deciding which pointer advances — `<=`, not `<`, so equal elements are handled consistently (the left side's element is taken first, preserving relative order).
- **`(merge-drain values j high k result)`, `(merge-drain values i mid k result)`** — first appearance of the "one side exhausted" case: whichever pointer's range hasn't run out yet has its *entire remainder* copied across, since it's already fully sorted.
- **`(get values i)`, in every branch** — reappearing `get` (Lesson 84), always reading from the *original* `values` parameter, never from the growing `result` — the same original-versus-under-construction discipline Lesson 96's `heap-place-last` and Lesson 92's `bst-insert` both already relied on.

### CS Lens

`merge` costs exactly `O(n)` for `n$ total elements across both pieces — each of the `n` positions is written to `result` exactly once, and each comparison (or drain step) advances exactly one pointer by one position, so the total work is bounded directly by `n`, not by any nested scan.

### SE Lens

This is a genuinely more expensive combine step than Lesson 112's single `max` call — `O(n)` instead of `O(1)` — and this lesson's third unit derives exactly why that additional cost, paid at every level of a divide-and-conquer recursion, still produces a faster *total* algorithm than Lesson 111's brute force.

---

## Concept Unit: `merge-sort` — Divide, Conquer, Then the Expensive Combine

### The Problem

Lesson 112's `dc-max` divided a range, recursively solved each half, and combined with one comparison. Can the identical divide-and-conquer shape sort an entire range, using this lesson's `merge-ranges` as the combine step instead?

### Introduce the concept in isolation

```clojure
(declare merge-sort)

(defn merge-sort-combine [values low high mid]
  (merge-ranges (merge-sort (merge-sort values low mid) (+ mid 1) high) low mid high))

(defn merge-sort [values low high]
  (if (>= low high)
    values
    (merge-sort-combine values low high (quot (+ low high) 2))))
```

```
user=> (merge-sort [3 7 2 9 4] 0 4)
[2 3 4 7 9]
```

**Divide**: split `[0, 4]` at `mid = 2`. **Conquer**: `merge-sort` the left half `[0, 2]` first, producing a new full-size result with positions `0`–`2` sorted (`[2 3 7 9 4]`, positions `3`–`4` untouched); *then* `merge-sort` that result's right half `[3, 4]`, producing positions `3`–`4` sorted too (`[2 3 7 4 9]`), without disturbing the already-sorted left half. **Combine**: `merge-ranges` merges the two now-independently-sorted halves into one fully sorted range, `[2 3 4 7 9]`.

### Discard the throwaway example

Not applicable — `merge-sort` and `merge-sort-combine` are real, reusable functions.

### Project Change

- **Reference Source**: `merge-sort` reuses Lesson 112's `dc-max`/`dc-max-combine` shape directly — identical `declare`-based mutual recursion, identical divide step — with `merge-ranges` (this lesson's own first unit) replacing `dc-max-combine`'s single `max` call.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn merge-sort [values low high]
  (if (>= low high)
    values
    (merge-sort-combine values low high (quot (+ low high) 2))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(>= low high)`** — reappearing base case (Lesson 112, adapted): a range of zero or one elements is already sorted, trivially — no division needed.
- **`(merge-sort values low mid)`** — reappearing structural recursion (Lesson 112): sort the left half first, as a complete operation, before touching the right half at all.
- **`(merge-sort (merge-sort values low mid) (+ mid 1) high)`** — first appearance of this specific sequencing: the *second* `merge-sort` call operates on the *result* of the first, not on the original `values` — the left half's own sorted positions are carried forward, untouched, into the second call.
- **`(merge-ranges ... low mid high)`** — reappearing (this lesson's first unit): the combine step, run only after *both* halves are independently, fully sorted.

### CS Lens

`merge-sort` produces the same result Lesson 111's `brute-force-sort` does — a fully sorted arrangement of the identical values — by a structurally different route: brute force settles one final position per pass, exhaustively; `merge-sort` settles two entire *halves*, recursively, then reconciles them in one linear pass.

### SE Lens

Unlike Lesson 112's `dc-max`, where the combine step's cost didn't depend on how the halves were solved, `merge-sort`'s combine step (`merge-ranges`) is only correct because *both* halves are guaranteed fully sorted by the time it runs — a real dependency between the conquer step and the combine step that Lesson 112's simpler example never had to account for.

### Connection to the previous unit

The previous unit built the expensive combine step in isolation; this unit assembles it into the full divide-and-conquer shape, verified correct on a real, traced example — the next unit is why that extra combine cost is worth paying.

---

## Concept Unit: The Recurrence — Why This Beats Brute Force

### The Problem

Lesson 112's `dc-max` had recurrence `T(n) = 2T(n/2) + O(1)`, solving to `O(n)` — no better than brute force's own best case. `merge-sort`'s combine step costs `O(n)`, not `O(1)`. Does a *more expensive* combine step make the whole algorithm slower, or does something about *where* that cost falls change the answer?

### Introduce the concept in isolation

`merge-sort`'s recurrence: `T(n) = 2T(n/2) + O(n)` — two half-sized recursive calls, plus an `O(n)` merge. Unlike Lesson 112's recurrence, the extra term here scales with `n`, not a constant. Solve it by counting total work **level by level**, the way a recursion tree branches:

```
Level 0 (the whole array):      1 merge call,  covering n elements   -> O(n) total work
Level 1 (two halves):           2 merge calls, each covering n/2     -> O(n) total work
Level 2 (four quarters):        4 merge calls, each covering n/4     -> O(n) total work
...
Level log2(n) (single elements): n calls, each trivial                -> base case, no merge
```

Every level does exactly `O(n)` total work — twice as many merge calls, each covering half as many elements, the same total either way. The number of levels is `\log_2 n$ (Lesson 43's own logarithms — each level halves the range, exactly binary search's own halving, counted the same way). Total cost: `O(n)` work per level, `\times \log_2 n$ levels: `O(n \log n)`.

### Discard the throwaway example

Not applicable — this is a direct derivation of `merge-sort`'s real cost, not new code.

### Mechanical walkthrough — how the argument works, step by step

1. **Count merge calls per level** — reappearing counting argument (Lesson 68's *Counting Recursive Structures*): level `k` has `2^k` merge calls, each on a range of size `n / 2^k`.
2. **Total work per level is `n`, regardless of `k`** — `2^k \times (n / 2^k) = n`, the range-size and call-count exactly cancel, at every single level.
3. **Number of levels is `\log_2 n`** — reappearing (Lesson 91's own binary-search depth argument): each level halves the range, exactly `\lceil \log_2 n \rceil$ times before reaching single elements.
4. **Multiply**: `n$ work per level `\times \log_2 n$ levels `= O(n \log n)`.

### CS Lens

This level-by-level counting method is the standard technique for solving a recurrence of the shape `T(n) = 2T(n/2) + O(n)` — Lesson 48/49's recurrence-solving vocabulary, applied here to a genuinely different shape than either lesson's own simpler examples, but the identical underlying discipline: express total cost as a sum across however many steps the recursion actually takes.

### SE Lens

`O(n \log n)` versus Lesson 111's `O(n^2)$ is not a marginal improvement — for `n = 1{,}000{,}000`, `n^2$ is a trillion; `n \log n$ is around twenty million, fifty-thousand times smaller. This is the exact payoff Lesson 112 deliberately withheld: an `O(n)` combine step, paid at every one of `\log n$ levels, still beats an algorithm that pays `O(n)` work *per position*, `n` positions, with no logarithmic reduction anywhere.

### Connection to the previous unit

The previous unit built a correct, complete `merge-sort`; this unit is why its more expensive combine step, paid `\log n$ times over a shrinking range each time, produces a dramatically cheaper total than Lesson 111's flat, repeated exhaustive scans.

---

## Connect the Pieces

All three algorithms, on the same array, their real costs stated together:

```clojure
(println "Brute force result:" (brute-force-sort [3 7 2 9 4]))
(println "Merge sort result:" (merge-sort [3 7 2 9 4] 0 4))
(println "Brute force cost, n=5:" "O(n^2) = 15 comparisons")
(println "Merge sort cost, n=5:" "O(n log n), roughly 5 x 3 = 15 comparisons at this tiny scale")
(println "At n=1,000,000: brute force ~10^12, merge sort ~2x10^7")
```

```
Brute force result: [9 7 4 3 2]
Merge sort result: [2 3 4 7 9]
Brute force cost, n=5: O(n^2) = 15 comparisons
Merge sort cost, n=5: O(n log n), roughly 5 x 3 = 15 comparisons at this tiny scale
At n=1,000,000: brute force ~10^12, merge sort ~2x10^7
```

At `n=5`, the two costs happen to coincide — small-scale coincidences like this are exactly why Lesson 91's own SE lens insisted the real gap only becomes dramatic at scale, confirmed here with real, if approximate, numbers.

## What Breaks Without This

Suppose `merge-sort-combine` merged *before* both halves were sorted — combining right after the divide step, skipping the conquer step entirely:

```clojure
(defn broken-combine [values low high mid]
  (merge-ranges values low mid high))
```

`merge-ranges` assumes both `[low, mid]` and `[mid+1, high]` are *already* sorted — its own correctness (this lesson's first unit) depends entirely on that precondition. Calling it directly on the raw, unsorted `values` produces a "merge" of two *unsorted* pieces, which `merge-ranges`'s own pointer-walking logic has no way to detect or correct — the result would be `values`, barely rearranged, definitely not sorted, with no error or warning anywhere, since `merge-ranges` was never designed to check the one thing its correctness actually depends on.

## Exercises

1. **Trace.** By hand, trace `(merge-sort [5 1 4 2] 0 3)`, showing every `merge-sort`/`merge-ranges` call in order.
2. **Predict.** Before checking, predict `(merge-ranges [1 2 3 4 5 6] 0 2 5)` — two *already fully interleaved-friendly* sorted halves `[1 2 3]` and `[4 5 6]`. Verify.
3. **Verify.** Confirm `(merge-sort [3 7 2 9 4] 0 4)` and `(brute-force-sort [3 7 2 9 4])` (Lesson 111) contain the identical five values, just in opposite order (ascending versus descending).
4. **Break it, on purpose.** Run `broken-combine` on `[3 7 2 9 4]` directly (treating `low=0, mid=2, high=4` as if both halves were already sorted, though they aren't) and confirm the result is not sorted.
5. **Generalize.** State `merge-sort`'s recurrence and level-by-level cost argument for an input of size `n=16`, computing the exact number of levels.
6. **Reconstruct.** Close this lesson. From memory, explain why `merge-sort`'s more expensive `O(n)` combine step still produces a faster algorithm overall than Lesson 111's brute force, using this lesson's level-by-level argument.

## Definition of Done

- [ ] You can implement `merge-ranges` and explain why it only works correctly on two already-sorted pieces.
- [ ] You can implement `merge-sort` and trace how it sequences its two recursive calls.
- [ ] You can derive `merge-sort`'s `O(n \log n)$ cost using the level-by-level counting argument.
- [ ] You completed Exercise 4 and demonstrated `broken-combine`'s incorrect output.
- [ ] You completed Exercise 5 and computed the exact level count for `n=16`.
- [ ] Commit your Exercise 4 and Exercise 5 work to your notes repository, with a commit message stating what you found and computed — for example, `"Confirm broken-combine produces unsorted output on unsorted halves; compute merge-sort's exact level count for n=16"` — not just `"lesson 113 exercise"`.

---

**Next lesson:** Lesson 114, *Quick Sort*, derives a second `O(n \log n)$-in-the-typical-case sorting algorithm, this time dividing by *value* (partitioning around a chosen pivot) rather than by *position*, and studies directly why its worst case, unlike merge sort's, depends on that choice.
