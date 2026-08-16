# Lesson 95: Heap Construction

**What you will build**: By the end of this lesson you'll derive `sift-down` — the mirror image of Lesson 94's `sift-up` — and use it to build an entire heap from a raw, unordered array in one pass, then compare that approach's real cost against simply calling Lesson 94's `heap-insert` once per value, discovering the two strategies, despite building the identical kind of structure, cost genuinely different amounts of work.

**What you need to know first**: Lesson 94's heap property, array representation, `heap-swap`, and `sift-up`/`heap-insert`; Lesson 91's `declare`-based mutual recursion pattern; Lesson 44's summation notation and Lesson 47's geometric series, for this lesson's cost argument; Lesson 53's amortized analysis, for the shape of that argument.

**Terms introduced in this lesson**:

- **height** — the number of levels from a node down to its farthest leaf (a leaf itself has height `0`). *Why it matters*: Lesson 30's **depth** measures distance from the *root* down to a node; height measures distance from a node down to *its own* farthest leaf — the opposite direction, and this lesson's cost argument depends on keeping the two straight.
- **sift-down** — repeatedly swapping a node with its smaller child until the heap property holds at every position it passed through, moving *down* the tree. *Why it matters*: the mirror operation to Lesson 94's `sift-up`, needed because a value placed at the *root* of an otherwise-valid heap (rather than appended as a new leaf) can only ever be too large, never too small — it has no parent to be smaller than.
- **heapify** — building an entire heap from an unordered array in one bottom-up pass, by calling `sift-down` once per internal node, from the last one back to the root. *Why it matters*: this lesson's central alternative to calling `heap-insert` once per value, and, as this lesson derives, a genuinely cheaper one.

**Objects and methods used**: None new. This lesson reuses `count`, `get`, and `assoc` (Lesson 84 and Lesson 94), `quot` (Lesson 54), and `declare` (Lesson 38), each already covered.

---

## Concept Unit: `sift-down` — Restoring the Heap Property Moving Downward

### The Problem

Lesson 94's `sift-up` fixes a value that's too *small* for its position, moving it toward the root. Given a raw, unordered array — no insertions involved at all — a value sitting near the *root* could easily be too *large* for its position instead. `sift-up` has nothing to compare a root against; it needs a parent. Is there a symmetric operation for fixing a value that's too large, moving the other direction?

### Introduce the concept in isolation

```clojure
(defn heap-smaller-child-index [heap i]
  (if (>= (heap-right-index i) (count heap))
    (heap-left-index i)
    (if (< (get heap (heap-left-index i)) (get heap (heap-right-index i)))
      (heap-left-index i)
      (heap-right-index i))))

(declare sift-down)

(defn sift-down-at-child [heap i child]
  (if (< (get heap child) (get heap i))
    (sift-down (heap-swap heap i child) child)
    heap))

(defn sift-down [heap i]
  (if (>= (heap-left-index i) (count heap))
    heap
    (sift-down-at-child heap i (heap-smaller-child-index heap i))))
```

```
user=> (sift-down [70 20 30] 0)
[20 70 30]
```

`70` at the root is larger than both children (`20` and `30`); `heap-smaller-child-index` picks `20` (the smaller of the two), `70` and `20` swap, and `sift-down` recurses on position `1` — where `70` now sits with no children of its own (`heap-left-index(1) = 3`, past the array's end), so it stops immediately. One swap restores the heap property.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: `sift-down`/`sift-down-at-child` mirror Lesson 94's `sift-up`/`sift-up-at-parent` structure directly — mutual recursion via `declare` (Lesson 91's pattern), a value computed once and passed to a helper — moving toward leaves instead of toward the root.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn sift-down [heap i]
  (if (>= (heap-left-index i) (count heap))
    heap
    (sift-down-at-child heap i (heap-smaller-child-index heap i))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`heap-smaller-child-index`** — first appearance: picks whichever child is smaller, defaulting to the left child when no right child exists (`(>= (heap-right-index i) (count heap))`) — necessary because, unlike `sift-up`'s single parent, a node sifting down has *two* possible children to compare against, and swapping with the larger one could re-violate the property against the smaller one.
- **`(>= (heap-left-index i) (count heap))`** — the base case: if even the *left* child's index falls outside the array, this node is a leaf, with nothing beneath it to compare against.
- **`(< (get heap child) (get heap i))`** — reappearing comparison shape (Lesson 94's `sift-up-at-parent`), reversed: here, the *child* is checked against the current node, rather than the current node against its *parent*.

### CS Lens

`sift-up` and `sift-down` are the same underlying idea — repeatedly swap toward wherever the property is violated — applied in opposite directions, for the same reason Lesson 30's `tree-sum` and `tree-depth` shared a shape while differing only in their combining step: both are structurally recursive on the same tree shape, and only the direction of travel and the comparison's exact target differ.

### SE Lens

`sift-down`'s cost is `O(\text{height})` — the number of levels *below* the starting node — not `O(\text{depth})`, the number of levels *above* it. For a node near the bottom of the tree, height is small even if depth is large; this distinction, easy to blur, is exactly what the next unit's cost argument depends on getting right.

---

## Concept Unit: `heapify` — Building a Heap Bottom-Up

### The Problem

`sift-down`, called at the *root* of an otherwise fully-valid heap, fixes one violation. Given a completely raw, unordered array — nothing validated anywhere yet — can repeated calls to `sift-down`, applied in the right order, build a valid heap from scratch, without ever calling `heap-insert` at all?

### Introduce the concept in isolation

```clojure
(defn heapify-from [heap i]
  (if (< i 0)
    heap
    (heapify-from (sift-down heap i) (- i 1))))

(defn heapify [arr]
  (heapify-from arr (heap-parent-index (- (count arr) 1))))
```

```
user=> (heapify [40 60 20 70 10 50 30])
[10 40 20 70 60 50 30]
```

Every leaf (roughly the array's second half) already satisfies the heap property trivially — a leaf has no children to violate anything against — so `heapify-from` starts at the *last non-leaf position* (`heap-parent-index` of the last index) and works backward to the root, one `sift-down` per position. By the time position `0` is reached, both its subtrees are already valid heaps (every position below it was already fixed), so a single `sift-down` at the root finishes the job.

### Discard the throwaway example

Not applicable — `heapify-from` and `heapify` are real, reusable functions.

### Project Change

- **Reference Source**: No reference counterpart — a direct derivation from `sift-down`'s own precondition (both subtrees already valid), applied working backward from the last internal position.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn heapify [arr]
  (heapify-from arr (heap-parent-index (- (count arr) 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(heap-parent-index (- (count arr) 1))`** — reappearing arithmetic (Lesson 94), applied to `count arr - 1` (the last valid index) to find the last position that has any children at all — every position after it is a leaf.
- **`(if (< i 0) heap ...)`** — reappearing counting-down base case (the same shape as `sum-to`'s own descent to its base case, Lesson 20), now walking array positions backward instead of counting numbers downward.
- **`(heapify-from (sift-down heap i) (- i 1))`** — first appearance of this exact combination: fix position `i` completely (`sift-down`, which may itself recurse several levels below `i`) *before* moving to the next position up, guaranteeing every position `heapify-from` visits already has two valid subtrees beneath it by the time it's processed.

### CS Lens

Processing positions from the *bottom up* — rather than the top down, the way `heap-insert` implicitly does by always adding at the end — is exactly what lets each `sift-down` call assume its subtrees are already correct, the same precondition-by-construction idea Lesson 39's dynamic programming used: solve smaller subproblems first, so every larger one can simply build on already-trusted results.

### SE Lens

`heapify` never calls `heap-insert` at all — it works entirely in place on values already sitting in the array, in whatever order they started in. This is a genuinely different construction strategy, not a rearrangement of the same one, and the next unit shows precisely why it's worth having as a separate tool rather than just calling `heap-insert` `n` times.

### Connection to the previous unit

The previous unit built `sift-down` to fix one position; this unit chains it across every internal position, in an order that guarantees each call's own precondition — both subtrees already valid — is satisfied by the time it runs.

---

## Concept Unit: Comparing the Two Construction Costs

### The Problem

Both `heapify` and `n` repeated calls to `heap-insert` produce a valid heap from `n` values. Do they cost the same total amount of work, or does building bottom-up, all at once, actually save something real?

### Introduce the concept in isolation

**Incremental construction** (Lesson 94): each `heap-insert` call costs at most `O(\text{depth})`, and a complete tree of `n` values has depth `O(\log n)` (Lesson 94's own SE lens). `n` insertions, each up to `O(\log n)`: `O(n \log n)` total, in the worst case.

**Bottom-up `heapify`**: each `sift-down` call at position `i` costs `O(\text{height}(i))` — not depth, *height* (this lesson's new term). Most positions are near the *bottom* of the tree: roughly half of all `n` positions are leaves (height `0`, free), roughly a quarter have height `1`, roughly an eighth have height `2`, and so on — only a single position (the root) ever has the tree's full height, `O(\log n)`. Summing every position's actual cost (Lesson 44's summation notation):

```
total cost  ≈  (n/2)·0  +  (n/4)·1  +  (n/8)·2  +  (n/16)·3  +  ...
```

Each term is smaller than the last by more than the multiplier grows — exactly Lesson 47's geometric series shape — and a series like this converges to a small constant multiple of `n`, not `n log n`. `heapify` costs `O(n)`.

### Discard the throwaway example

Not applicable — this cost comparison is a genuine derived fact about both already-existing construction strategies.

### Mechanical walkthrough — how the argument works, step by step

1. **Count positions by height, not depth** — a hard concept reappearing (this lesson's own `height` vs. Lesson 30's `depth`): the number of positions *at* a given height shrinks by roughly half each time height increases by one, the mirror of how the number of positions at a given *depth* doubles each level down.
2. **Multiply each height by how many positions have it** — `(n/2)·0`, `(n/4)·1`, and so on — the total work `heapify` actually performs, not an upper bound assuming every position costs the maximum.
3. **Recognize the series' shape** — a hard concept reappearing (Lesson 47's geometric series): each term's *position count* keeps halving even as its *height* only grows by one, so the sum stays bounded by a constant multiple of `n` rather than growing with `\log n`.
4. **Contrast with the incremental bound** — `n` calls, each individually bounded by the *tree's* full height (`O(\log n)`), without accounting for the fact that most calls are cheap — exactly the looser, per-operation bound Lesson 53's amortized analysis warned against trusting without checking the aggregate.

### CS Lens

This is Lesson 53's amortized analysis playing out on a second, genuinely different structure: naively multiplying "worst case per operation" by "number of operations" (`O(n) \times O(\log n)`) overstates the true cost, because it silently assumes every single operation hits its own worst case simultaneously — here, provably false, since the vast majority of positions have small height by the complete tree's own shape.

### SE Lens

Preferring `heapify` over `n` calls to `heap-insert` when building a heap from data that's *already all available up front* — rather than arriving one value at a time — is a real, concrete engineering decision this cost difference justifies directly: `O(n)` versus `O(n \log n)` is not a marginal difference at scale, the same categorical gap Lesson 91's `O(\log n)` versus `O(n)` already was.

### Connection to the previous unit

The previous unit built `heapify` without proving anything about its cost; this unit shows the specific order it processes positions in — bottom-up, cheapest positions dominating — is exactly what makes it asymptotically cheaper than the alternative already available since Lesson 94.

---

## Connect the Pieces

Both construction strategies, on the same seven values, confirmed to produce valid heaps by `heap-peek`:

```clojure
(def via-insert (heap-insert (heap-insert (heap-insert (heap-insert (heap-insert (heap-insert (heap-insert [] 40) 60) 20) 70) 10) 50) 30))
(def via-heapify (heapify [40 60 20 70 10 50 30]))
(println "Via heap-insert, minimum:" (heap-peek via-insert))
(println "Via heapify, minimum:" (heap-peek via-heapify))
```

```
Via heap-insert, minimum: 10
Via heapify, minimum: 10
```

Both strategies correctly surface `10` as the minimum — they don't necessarily produce the *identical* array (different valid heaps can hold the same values), but both satisfy the heap property completely, and this lesson's third unit is what explains why one of them got there for meaningfully less total work.

## What Breaks Without This

Suppose `heapify-from` processed positions **top-down** instead — from the root (`0`) forward to the last position — rather than bottom-up:

```clojure
(defn broken-heapify-from [heap i last]
  (if (> i last)
    heap
    (broken-heapify-from (sift-down heap i) (+ i 1) last)))
```

Calling `sift-down` at the root *first* assumes its subtrees are already valid heaps — Concept Unit 2's own stated precondition — but on a raw array, they aren't yet; nothing has fixed them. `sift-down` at the root could sink a large value down into a subtree that itself still contains violations further down, positions this backward order will only visit *after* the root, potentially undoing or missing what the root's own `sift-down` assumed. The bottom-up order isn't a stylistic preference — it's what guarantees every `sift-down` call's precondition is actually true by the time that call runs.

## Exercises

1. **Trace.** By hand, trace `(heapify [70 60 50 40 30 20 10])` — the same seven values, in fully reversed order — showing every `sift-down` call.
2. **Predict.** Before computing it, predict roughly how many total swaps `heapify` performs on a `15`-element array (four full levels), using this lesson's height-counting argument, then verify by hand-tracing a concrete example.
3. **Verify.** Run `broken-heapify-from` (top-down) on a small array where it produces an invalid heap, and identify exactly which position's `sift-down` call ran before one of its own descendants had been fixed.
4. **Break it, on purpose.** Modify `heapify` to start from position `0` instead of `(heap-parent-index (- (count arr) 1))`. Confirm it wastes work by calling `sift-down` on leaf positions, where it can never find anything to do.
5. **Generalize.** State, without computing an exact sum, why a `1{,}000{,}000`-element `heapify` call is much closer to `1{,}000{,}000` total swaps than to `1{,}000{,}000 \times 20` (`n \log n` for this size).
6. **Reconstruct.** Close this lesson. From memory, explain the difference between height and depth, and derive why `heapify`'s total cost is `O(n)` rather than `O(n \log n)`.

## Definition of Done

- [ ] You can implement `sift-down` and explain how it differs from Lesson 94's `sift-up`.
- [ ] You can implement `heapify` and explain why it must process positions bottom-up, not top-down.
- [ ] You can explain, using height rather than depth, why `heapify`'s total cost is `O(n)`.
- [ ] You completed Exercise 3 and identified exactly where top-down processing breaks the heap property.
- [ ] You completed Exercise 5 and can justify the `O(n)` versus `O(n \log n)` gap without computing an exact sum.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you found — for example, `"Confirm top-down heapify-from breaks the heap property; justify O(n) construction cost via height distribution"` — not just `"lesson 95 exercise"`.

---

**Next lesson:** Lesson 96, *Priority Queues*, takes the `heap-peek`, `heap-insert`, and now `heapify` this lesson and the previous one built, and wraps them into the actual abstraction a heap exists to support — a queue that always serves its most urgent item next, regardless of arrival order.
