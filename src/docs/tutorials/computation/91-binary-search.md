# Lesson 91: Binary Search

**What you will build**: By the end of this lesson you'll be able to derive a search technique that beats Lesson 24's linear search outright on a sorted array — not through hashing, but by exploiting *order* itself — using Lesson 36's mutual recursion, and prove its cost is `O(log n)` by direct comparison-counting, connecting straight back to Lesson 43's logarithms.

**What you need to know first**: Lesson 84's arrays and `get`, Lesson 24's linear search, Lesson 36's mutual recursion, and Lesson 43's logarithms.

**Terms introduced in this lesson**:

- **binary search** — a search technique on a *sorted* array that repeatedly halves the remaining search space by comparing against the middle element. *Why it matters*: the first technique in this series to search faster than checking every element, without needing Lesson 89's hashing machinery at all — order alone is enough.

**Objects and methods used**: None new. This lesson combines `get` (Lesson 84), `quot` (Lesson 54), and `declare` (Lesson 38), each already covered.

---

## Concept Unit: Deriving Search from Order

### The Problem

Lesson 24's linear search checks elements one at a time, in no particular order, costing `O(n)` in the worst case. If the array is *already sorted*, does knowing that give any way to skip checking most of it?

### Introduce the concept in isolation

Compare the target against the *middle* element. If they match, done. If the target is *smaller*, every element from the middle rightward is already known to be too large (the array is sorted) — the target, if present, must be in the left half only. If the target is *larger*, symmetrically, only the right half needs searching. Either way, half the remaining elements are eliminated *without ever looking at them*.

```clojure
(declare binary-search)

(defn search-at-mid [v target low high mid]
  (if (= (get v mid) target)
    mid
    (if (< (get v mid) target)
      (binary-search v target (+ mid 1) high)
      (binary-search v target low (- mid 1)))))

(defn binary-search [v target low high]
  (if (> low high)
    nil
    (search-at-mid v target low high (quot (+ low high) 2))))
```

```
user=> (def v [10 20 30 40 50 60 70])
user=> (binary-search v 40 0 6)
3
user=> (binary-search v 70 0 6)
6
user=> (binary-search v 15 0 6)
nil
```

`(binary-search v 40 0 6)` finds `40` immediately — it's exactly the middle element of a `7`-element array. `(binary-search v 70 0 6)` and `(binary-search v 15 0 6)` both require narrowing the range further, one comparison at a time, but each comparison eliminates *half* of whatever remained, not just one element.

### Discard the throwaway example

Not applicable — `binary-search` is a real, complete, correct function.

### Project Change

- **Reference Source**: `get`, from Lesson 84; contrasted directly against Lesson 24's linear search.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn binary-search [v target low high]
  (if (> low high)
    nil
    (search-at-mid v target low high (quot (+ low high) 2))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(declare binary-search)`** — reappearing forward-declaration (Lesson 38's `declare` pattern): `search-at-mid` calls `binary-search`, and `binary-search` calls `search-at-mid` — genuine **mutual recursion** (Lesson 36), which needs `binary-search`'s name known *before* `search-at-mid` is defined, even though its actual body comes later.
- **`(quot (+ low high) 2)`** — reappearing `quot` (Lesson 54), computing the midpoint index, computed once and passed into `search-at-mid` as `mid` — the same "compute once, pass as an argument" pattern Lesson 87's `dequeue-from-ready` used to avoid recomputing an expensive result.
- **`(if (> low high) nil ...)`** — the base case: once the range is empty (`low` has crossed past `high`), the target cannot be present, and the search correctly reports absence.

### CS Lens

This is precisely why binary search *requires* a sorted array and cannot work on an unsorted one, or on Lesson 85's linked structure: eliminating half the remaining elements *without inspecting them* depends entirely on knowing their relative order from position alone — information a linked structure's one-directional references, or an unsorted array's arbitrary ordering, simply doesn't provide.

### SE Lens

Unlike Lesson 89's hash table, binary search needs no extra structure, no hash function, and no risk of collisions — its entire advantage comes from a property (sortedness) the data either already has or must be sorted into first, a real, upfront cost worth weighing against Lesson 89's own tradeoffs when choosing between the two.

---

## Concept Unit: Counting the Cost — O(log n)

### The Problem

Each comparison eliminates half the remaining elements. How many comparisons does that actually take, and how does it compare concretely to Lesson 24's linear search on the identical array?

### Introduce the concept in isolation

Trace `(binary-search v 100 0 6)` — searching for an absent value, the worst case:

```
low=0, high=6, mid=3, v[3]=40, 100>40 -> search right half
low=4, high=6, mid=5, v[5]=60, 100>60 -> search right half
low=6, high=6, mid=6, v[6]=70, 100>70 -> search right half
low=7, high=6 -> low>high -> nil
```

```
user=> (binary-search v 100 0 6)
nil
```

Exactly **`3`** element comparisons before correctly reporting absence — compare this to Lesson 24's linear search, which would need all **`7`** comparisons to reach the identical, correct conclusion on this same array. `3` is not a coincidence: `7` elements, halved three times (`7 → 3 → 1 → 0`), matches `\lceil \log_2(7+1) \rceil = 3` directly — Lesson 43's logarithms, now measuring exactly how many times a real search space actually gets halved.

### Discard the throwaway example

Not applicable — this comparison count is a genuine, hand-verified fact about this lesson's own function.

### CS Lens

This is Lesson 50's growth-rate table made concrete on a real algorithm: linear search is `O(n)`, binary search is `O(\log n)` — categorically different growth rates, not just "somewhat faster." For `7` elements the gap is `7` versus `3`, modest; for a million elements, linear search needs up to a million comparisons, while binary search needs only about `20` (`\log_2(1{,}000{,}000) \approx 20`) — the difference Lesson 50's own numbers already showed becomes dramatic, not subtle, at real scale.

### SE Lens

Binary search's `O(\log n)` cost is precisely why searching a large, sorted dataset (a phone book, a sorted database index) remains fast even as the dataset grows enormously — doubling the data adds only *one* more comparison in the worst case, not proportionally more, a genuinely different scaling behavior than linear search's own.

### Connection to the previous unit

The previous unit derived binary search's mechanism from order alone; this unit measures precisely what that mechanism buys, in concrete, comparable numbers, connecting directly back to Lesson 43's logarithms and Lesson 50's growth-rate categories.

---

## Connect the Pieces

Both searches, on the identical array, compared directly:

```clojure
(println "Binary search, found at 3:" (binary-search v 40 0 6))
(println "Binary search, absent, 3 comparisons:" (binary-search v 100 0 6))
(println "Array:" v)
```

```
Binary search, found at 3: 3
Binary search, absent, 3 comparisons: nil
Array: [10 20 30 40 50 60 70]
```

Both results are correct, and both were reached by eliminating half the remaining search space at every single step — the entire lesson's derivation, confirmed directly on real, traced output rather than only asserted.

## What Breaks Without This

Suppose binary search were run on an array that *looked* sorted but had one element out of place — say, `[10 20 30 45 50 40 70]` (`45` and `40` swapped relative to `v`). Searching for `40`: `mid=3`, `v[3]=45`, and since `40 < 45`, the search would go *left*, entirely skipping the right half where the misplaced `40` actually sits — silently returning `nil` for a value that's genuinely present in the array. This isn't a bug in `binary-search`'s logic; it's a direct consequence of the algorithm's own core assumption (Concept Unit 1's derivation) being violated: binary search doesn't merely prefer a sorted array, its correctness *depends* on one.

## Exercises

1. **Trace.** By hand, trace `(binary-search v 20 0 6)`, counting exactly how many comparisons it takes.
2. **Predict.** Before checking, predict how many comparisons `(binary-search v 10 0 6)` (searching for the very first element) will take. Verify by tracing it.
3. **Verify.** Using the misplaced-element example from "What Breaks Without This," run `(binary-search [10 20 30 45 50 40 70] 40 0 6)` yourself and confirm it really does return `nil`, despite `40` being present in the array.
4. **Break it, on purpose.** Attempt to call `binary-search` with `low > high` from the very first call (an already-empty range). Confirm it correctly returns `nil` immediately, without error.
5. **Generalize.** Extend `binary-search` into `binary-search-count`, returning the *number of comparisons* made (not just the found index), and confirm it matches this lesson's hand-traced counts for both example searches.
6. **Reconstruct.** Close this lesson. From memory, derive binary search's `O(\log n)` cost from "each comparison halves the remaining search space," and explain precisely why it requires a sorted array.

## Definition of Done

- [ ] You can implement binary search using mutual recursion and explain why `declare` is needed.
- [ ] You can derive binary search's `O(\log n)` cost from repeated halving.
- [ ] You completed Exercise 3 and confirmed binary search fails silently on a nearly-sorted array.
- [ ] You completed Exercise 5 and implemented a correct `binary-search-count`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you found and built — for example, `"Confirm binary search silently fails on nearly-sorted input; implement binary-search-count matching hand-traced comparison counts"` — not just `"lesson 91 exercise"`.

---

**Next lesson:** Lesson 92, *Binary Search Trees*, takes this lesson's core idea — order eliminates half the remaining possibilities — and builds it directly into a tree's own shape, rather than needing a sorted array prepared in advance.
