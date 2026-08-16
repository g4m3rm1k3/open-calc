# Lesson 94: Heaps

**What you will build**: By the end of this lesson you'll derive a tree that trades away Lesson 92's full ordering invariant for a deliberately weaker one — a **heap**, guaranteeing only that a node is no larger than its own children, nothing about siblings or distant cousins — and discover this weaker guarantee is still enough to find the smallest value in `O(1)`, represented not with Lesson 85's node references at all, but as a plain array, positions computed the way Lesson 84 already computes them.

**What you need to know first**: Lesson 84's arrays, `get`, and `assoc`; Lesson 54's `quot`; Lesson 91's `declare`-based mutual recursion and its compute-once-pass-to-a-helper pattern; Lesson 92's BST ordering invariant, for direct contrast; Lesson 30's recursive tree definition.

**Terms introduced in this lesson**:

- **heap** — a complete binary tree in which every node's value is no larger than either of its children's values (a **min-heap**; a **max-heap** flips every comparison). *Why it matters*: unlike Lesson 92's BST, a heap says nothing about how a node compares to its sibling or to values in a different branch entirely — a strictly weaker promise, and this lesson's whole point is discovering what that weaker promise still buys.
- **complete binary tree** — a binary tree in which every level is entirely filled except possibly the last, which fills left to right with no gaps. *Why it matters*: this exact shape constraint is what lets a tree be stored as a plain array with no wasted positions and no explicit left/right references at all — position alone determines every parent-child relationship.

**Objects and methods used**:

- **`count`**
  - *What it is:* a Clojure core function returning how many elements a collection holds.
  - *Implementation:* `(count coll)` — for a vector specifically, this is `O(1)`, since a Clojure vector tracks its own length directly, unlike Lesson 85's node-and-reference lists, which would need that lesson's own `node-length` — a real recursive walk, `O(n)` — to answer the identical question.
  - *Its use:* this lesson's `heap-insert`, to find the next open array position.

This lesson also reuses `get` and `assoc` (Lesson 84), `quot` (Lesson 54), and `declare` (Lesson 38), each already covered.

---

## Concept Unit: A Weaker Invariant — the Heap Property

### The Problem

Lesson 93 proved `bst-search` and `bst-insert` correct, but a BST answers one specific question well — "is `x` present?" A different question — "what's the *smallest* value currently stored?" — Lesson 93's own Exercise 5 already showed costs `O(\text{depth})` on a BST (`bst-min` must walk the leftmost path). Does finding the minimum *repeatedly*, over and over as values come and go, need a tree that maintains Lesson 92's *full* ordering — or would something weaker already suffice?

### Introduce the concept in isolation

A **heap** requires only this: every node's value is no larger than either of its children's values. Nothing is claimed about a node versus its *sibling*, or about two values in entirely different branches — a strictly weaker promise than Lesson 92's "everything left is smaller, everything right is larger, everywhere."

```
        10
       /  \
     20    30
    /  \   /  \
   40  50 60  70
```

Here, `20 ≤ 40` and `20 ≤ 50` (a parent-child check), but nothing is claimed about `20` versus `30`, or `40` versus `60` — siblings and cousins are never compared at all. Contrast this with Lesson 92's `bst`, which required `20`'s entire left *and* right subtree to stay below `40` — a heap drops that requirement entirely, keeping only the parent-child piece.

### Discard the throwaway example

Not applicable — the diagram above is this lesson's real running example, built concretely later in this lesson.

### CS Lens

A heap's invariant is a genuine weakening of Lesson 92's BST invariant — every BST also happens to satisfy "no node exceeds either child" along its left spine, but a heap drops the requirement everywhere else, in exchange for something Concept Unit 3 shows directly: a cheaper guarantee about the *one* position — the root — that matters for "find the minimum."

### SE Lens

This is a genuine, deliberate tradeoff, not a strictly better structure: Lesson 92's BST answers "is `x` present?" in `O(\text{depth})` for *any* `x`; a heap, as this lesson builds it, only ever answers that question quickly for the *minimum* specifically — asking a heap "is `x` present?" for an arbitrary `x` requires checking most of the tree, since nothing about a heap's shape rules out `x` living in either branch. Choosing between them means choosing which question needs to be fast.

---

## Concept Unit: Complete Binary Trees as Arrays

### The Problem

Lesson 85 needed explicit `next` references because nodes could, in principle, live anywhere and connect in any shape. A heap, as diagrammed above, is always a **complete binary tree** — every level full except possibly the last, filled left to right, no gaps anywhere. Does a shape with that strong a constraint on *where* every node sits still need explicit references at all?

### Introduce the concept in isolation

Number the diagram's positions left to right, top to bottom, starting at `0`:

```
position:   0   1   2   3   4   5   6
value:     10  20  30  40  50  60  70
```

Every parent-child relationship is now computable directly from position alone:

```clojure
(defn heap-parent-index [i] (quot (- i 1) 2))
(defn heap-left-index [i] (+ (* 2 i) 1))
(defn heap-right-index [i] (+ (* 2 i) 2))
```

```
user=> (def sample-heap [10 20 30 40 50 60 70])
user=> (get sample-heap (heap-left-index 1))
40
user=> (get sample-heap (heap-right-index 1))
50
user=> (heap-parent-index (heap-left-index 1))
1
```

`sample-heap`'s position `1` (value `20`) has left child at `heap-left-index(1) = 3` (value `40`) and right child at `heap-right-index(1) = 4` (value `50`) — exactly the diagram's own shape, with no node ever storing a reference to another. `(heap-parent-index (heap-left-index 1))` returning `1` confirms the two formulas genuinely invert each other, not just on this one example.

### Discard the throwaway example

Not applicable — `heap-parent-index`, `heap-left-index`, and `heap-right-index` are real, reusable functions.

### Project Change

- **Reference Source**: No reference counterpart — a direct derivation from the complete-tree shape constraint, using Lesson 84's array positions and Lesson 54's `quot` in place of Lesson 85's explicit references.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn heap-parent-index [i] (quot (- i 1) 2))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(quot (- i 1) 2)`** — reappearing `quot` (Lesson 54) and subtraction; integer-divides `i - 1` by `2`, discarding the remainder — a first appearance of this exact arithmetic pattern used to *locate* a position rather than to compute a midpoint the way Lesson 91's own `quot` call did.
- **`(+ (* 2 i) 1)`, `(+ (* 2 i) 2)`** — reappearing multiplication and addition; every position `i` has its two children at exactly `2i+1` and `2i+2`, a direct consequence of "every level fills completely before the next one starts" — the complete-tree constraint made concrete as arithmetic.

### CS Lens

This is the exact structural mirror of Lesson 85's own SE lens, reversed: Lesson 85's node-and-reference structure let nodes live anywhere, at the cost of needing an explicit reference to find each one; a heap's completeness constraint is precisely what buys back Lesson 84's contiguous-position addressing for a tree shape, something Lesson 92's BST — which permits *any* shape, not only complete ones — could never do.

### SE Lens

Nothing about `heap-parent-index`, `heap-left-index`, or `heap-right-index` checks that the array they're given actually *is* shaped like a complete tree — these formulas assume it, the same way Lesson 91's `binary-search` assumed a sorted array without checking. The next two units derive operations that preserve completeness by construction, rather than needing to check it after the fact.

### Connection to the previous unit

The previous unit stated the heap property in the abstract; this unit shows the shape it always comes packaged with — completeness — is what makes storing a heap as a plain array, with no references anywhere, actually possible.

---

## Concept Unit: `heap-peek` — What the Weaker Invariant Still Buys

### The Problem

Lesson 93's Exercise 5 `bst-min` walks the leftmost path of a BST, costing `O(\text{depth})`. Does the heap property — weaker than a BST's full ordering — still guarantee the smallest value sits somewhere findable in `O(1)`?

### Introduce the concept in isolation

```clojure
(defn heap-peek [heap]
  (get heap 0))
```

```
user=> (heap-peek sample-heap)
10
```

The heap property says every node is no larger than either child — applied at the root, that means the root is no larger than *its* children; applied again at each child, *they're* no larger than *their* children, and so on down every path to a leaf. Chained all the way down, the root is no larger than every value anywhere in the tree — it must be the minimum, and it's always sitting at position `0`, a single `get` away.

### Discard the throwaway example

Not applicable — `heap-peek` is a real, reusable function.

### Project Change

- **Reference Source**: `(get heap 0)` reuses Lesson 84's indexed `get` directly, applied here for the first time to read a value whose *meaning* (the minimum) is guaranteed by an invariant rather than by having just been computed.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn heap-peek [heap]
  (get heap 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get heap 0)`** — reappearing indexed access (Lesson 84); the entire function, one call, no recursion and no comparison needed at all — everything that makes this correct was already proven true of `heap` before this function ever runs.

### CS Lens

`heap-peek`'s `O(1)` cost versus `bst-min`'s `O(\text{depth})` is Lesson 92's own SE lens playing out concretely: a BST's stronger invariant (full ordering) has to be *walked* to extract "the smallest," one comparison per level; a heap's weaker invariant is arranged so the answer to that one specific question is already sitting in a fixed place, nothing to walk at all.

### SE Lens

This is precisely why a heap is chosen specifically for repeated "what's the minimum right now" queries — Lesson 96 (*Priority Queues*) builds directly on exactly this — and not chosen when arbitrary membership queries ("is `x` present?") matter, which is exactly where Lesson 92's BST remains the better fit.

### Connection to the previous unit

The previous unit made position, not reference, the way this tree is navigated; this unit shows the single most important position — `0` — is guaranteed meaningful by the heap property alone, no traversal required.

---

## Concept Unit: `heap-insert` — Adding a Value Without Breaking Either Guarantee

### The Problem

Inserting into this array has to preserve *two* things at once: completeness (Concept Unit 2's shape) and the heap property (Concept Unit 1's ordering). Appending a new value at the very next open position preserves completeness automatically — but the new value could easily be smaller than its new parent, breaking the heap property immediately. Can the second guarantee be restored without disturbing the first?

### Introduce the concept in isolation

```clojure
(defn heap-swap [heap i j]
  (assoc (assoc heap i (get heap j)) j (get heap i)))

(declare sift-up)

(defn sift-up-at-parent [heap i parent]
  (if (< (get heap i) (get heap parent))
    (sift-up (heap-swap heap i parent) parent)
    heap))

(defn sift-up [heap i]
  (if (= i 0)
    heap
    (sift-up-at-parent heap i (heap-parent-index i))))

(defn heap-insert [heap value]
  (sift-up (assoc heap (count heap) value) (count heap)))
```

```
user=> (def h (heap-insert [] 40))
user=> (def h (heap-insert h 20))
user=> h
[20 40]
```

Trace the second insertion: `heap-insert [40] 20` appends `20` at `(count [40])`, position `1`, giving `[40 20]`, then calls `(sift-up [40 20] 1)`. Since `1 ≠ 0`, this calls `(sift-up-at-parent [40 20] 1 (heap-parent-index 1))` — `heap-parent-index(1)` is `0`. `(get heap 1)` is `20`, `(get heap 0)` is `40`; `20 < 40`, so `heap-swap` exchanges positions `1` and `0`, producing `[20 40]`, and `sift-up` recurses on the new position `0` — which immediately returns, since `0 = 0`. The new value **sifts up** one level at a time, only as far as the heap property actually requires.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: `sift-up`/`sift-up-at-parent` reuse Lesson 91's `binary-search`/`search-at-mid` mutual-recursion pattern directly — a value (here, the parent index) computed once and passed to a helper, rather than recomputed inside it.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn heap-insert [heap value]
  (sift-up (assoc heap (count heap) value) (count heap)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`heap-swap`** — first appearance: two nested `assoc` calls, each reading from the *original* `heap` parameter (Clojure's immutability means `heap` never changes mid-function, so `(get heap i)` in the outer call still reads the pre-swap value) — the same "read the original, build something new" discipline Lesson 92's `bst-insert` already relied on.
- **`(declare sift-up)`** — reappearing forward-declaration (Lesson 38); `sift-up-at-parent` calls `sift-up`, and `sift-up` calls `sift-up-at-parent` — genuine mutual recursion (Lesson 36), needing `sift-up`'s name known before `sift-up-at-parent` is defined.
- **`(if (= i 0) heap ...)`** — the base case: position `0` has no parent, so a value that's sifted all the way to the root is done.
- **`(< (get heap i) (get heap parent))`** — the heap-property check itself: if the child is smaller than its parent, the property is violated at this one position and must be fixed; otherwise, it already holds here and nothing further up can be wrong either, since nothing below position `i` was touched.
- **`(assoc heap (count heap) value)`** — reappearing `assoc` (Lesson 84), at index exactly `(count heap)` — one past the last existing position, which Clojure's own `assoc` treats as a genuine append, not an error, growing the vector by exactly one.
- **`(count heap)`** — first appearance (covered fully in Objects and methods used, above): finds the next open position, the one guaranteed to keep the array a complete tree.

### CS Lens

`sift-up` only ever compares and swaps along *one path* — from the new leaf straight up to the root — never touching any sibling branch. This is possible only because a violation caused by inserting one new value can only ever exist between that value and its own ancestors, never anywhere else — a direct consequence of every other parent-child pair in the tree having already satisfied the heap property before this insertion began.

### SE Lens

`sift-up`'s cost is `O(\text{depth})`, and — because this lesson's array is always kept complete — a complete tree holding `n` values has depth `O(\log n)`, unconditionally, unlike Lesson 92's BST, whose depth depended entirely on insertion order (Lesson 92's own closing section). A heap can never degrade into a slow, linked-list-shaped structure the way an unluckily-ordered BST can — completeness is enforced by every single insertion, not left to chance.

### Connection to the previous unit

The previous unit showed the root is meaningful only because the heap property holds everywhere beneath it; this unit derives the one operation responsible for keeping that property true after every change, so the previous unit's `O(1)` guarantee never quietly stops being true.

---

## Connect the Pieces

Build a heap from the identical seven values Lessons 91–93 have used throughout, inserted in that same order, and confirm the root is always the running minimum:

```clojure
(def heap7 (heap-insert (heap-insert (heap-insert (heap-insert (heap-insert (heap-insert (heap-insert [] 40) 20) 60) 10) 50) 30) 70))
(println "Final heap:" heap7)
(println "Minimum, O(1):" (heap-peek heap7))
```

```
Final heap: [10 20 30 40 50 60 70]
Minimum, O(1): 10
```

This particular insertion order happens to leave the array looking fully sorted — a coincidence of these specific values, not a general property of heaps (Exercise 2 constructs a counterexample). What's guaranteed, and checked at every single `sift-up` call along the way, is only the heap property: no position holds a value larger than either of its children's.

## What Breaks Without This

Suppose `heap-insert` appended the new value but skipped calling `sift-up` entirely:

```clojure
(defn broken-heap-insert [heap value]
  (assoc heap (count heap) value))
```

```
user=> (def bh (broken-heap-insert (broken-heap-insert [] 40) 20))
user=> bh
[40 20]
user=> (heap-peek bh)
40
```

`(heap-peek bh)` returns `40` — but `20`, inserted second, is the actual smaller value. This isn't a slowdown, the way Lesson 92's degenerate BST was — `heap-peek` still runs in `O(1)`, exactly as fast as ever, and returns a **wrong answer** with complete confidence, because its entire correctness was borrowed from a heap-property guarantee this broken version never bothered to restore. Concept Unit 3's `O(1)` speed and Concept Unit 4's `sift-up` are not two independent features — the first is only ever as trustworthy as the second actually is.

## Exercises

1. **Trace.** By hand, trace `(heap-insert heap7 5)` from "Connect the Pieces," showing every comparison `sift-up` makes on its way to the root.
2. **Predict.** Before running it, predict whether inserting the same seven values in the order `70, 60, 50, 40, 30, 20, 10` produces a sorted array like this lesson's example did. Build it and check.
3. **Verify.** Using `broken-heap-insert`, build a three-element broken heap where `heap-peek` returns the wrong value, and state which value it should have returned instead.
4. **Break it, on purpose.** Modify `sift-up-at-parent`'s comparison from `<` to `<=`. Find a sequence of insertions where this change causes an unnecessary swap — one where the heap property already held and didn't need fixing.
5. **Generalize.** Write `heap-parent-index`, `heap-left-index`, and `heap-right-index`'s counterparts are already symmetric — now write `sift-up` for a **max-heap** instead, changing only the one comparison that needs to flip.
6. **Reconstruct.** Close this lesson. From memory, explain why a heap's array never needs explicit left/right references, and derive `heap-peek`'s `O(1)` cost from the heap property alone.

## Definition of Done

- [ ] You can explain the heap property and how it differs from Lesson 92's full BST ordering.
- [ ] You can compute a position's parent and children using only arithmetic, with no references anywhere.
- [ ] You can explain why `heap-peek` is `O(1)` and why that depends entirely on `sift-up` having run correctly on every prior insertion.
- [ ] You completed Exercise 3 and demonstrated `heap-peek` returning a wrong answer on a broken heap.
- [ ] You completed Exercise 5 and implemented a correct max-heap `sift-up`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you built — for example, `"Demonstrate broken-heap-insert returning wrong peek value; implement max-heap sift-up by flipping the comparison"` — not just `"lesson 94 exercise"`.

---

**Next lesson:** Lesson 95, *Heap Construction*, compares two ways to build a whole heap from scratch — repeating this lesson's `heap-insert` one value at a time, versus a faster bottom-up approach that sifts values *down* instead of up — and derives why the two strategies end up with different total costs despite building the identical kind of structure.
