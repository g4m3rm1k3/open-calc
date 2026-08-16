# Lesson 104: Heaps

**What you will build:** a real **binary min-heap** — the first structure in this curriculum that deliberately gives up Lesson 97's total-ordering invariant in exchange for a weaker, cheaper one, and gets a genuinely different representation out of the trade: an implicit tree stored directly in an array (Lesson 85, growable via Lesson 86's own doubling strategy), with no reference-based nodes at all. Real, verified evidence this session: inserting `5, 3, 8, 1` in that order, one at a time, produces the real array `(1 3 8 5)`; extracting its minimum returns `1` and leaves the real array `(3 5 8)` — both hand-traceable and confirmed by running the actual code. At larger scale, `1,000` random insertions keep the heap-order invariant valid after every single one, and draining a `20`-value heap completely reproduces Guile's own built-in `sort` exactly. The real payoff, measured rather than assumed: at `n = 10,000`, a heap answers "insert, then repeatedly remove the minimum" using `239,198` real comparisons, against `49,995,000` for a naive linear-scan approach doing the identical job — **over `200` times fewer**, a gap that widens with `n`, not a fixed constant. The transferable point: Lesson 97 through 103 spent seven straight lessons building and maintaining a strong invariant because a strong invariant was genuinely required. This lesson asks the same design question Lesson 82 asked in the abstract — what does the actual required operation set need? — and derives a structure that pays for exactly that, nothing more.

**What you need to know first:** Lesson 97 (`FP-L097-binary-search-trees.md`) — specifically the BST invariant, the direct point of contrast this lesson opens with. Lesson 85 (`FP-L085-arrays.md`) — specifically the `address(i) = base + i × element-size` formula, the same *kind* of index arithmetic this lesson derives a second time for a genuinely different layout. Lesson 86 (`FP-L086-dynamic-arrays.md`) — specifically `make-doubling-dynarray` and `doubling-append`, reused here unchanged as this lesson's own underlying storage. Lesson 87 (`FP-L087-linked-structures.md`) — specifically real mutation, reused here for the first time since that lesson to swap elements in place rather than building new structure.

**Terms introduced in this lesson**

- **Total order** — a relation where *every* pair of elements is comparable, and that comparison is consistent across the whole collection: for any two elements `A` and `B`, either `A` comes before `B` or `B` comes before `A`, and that fact holds no matter which other elements are involved. Lesson 97's BST invariant is a total order — walking any path from the root tells you, correctly, how any two values in the tree compare. It exists as a name here because this lesson's own invariant deliberately gives it up.
- **Partial order** — a weaker relation where only *some* pairs of elements are required to be comparable; others simply have no defined relative order at all. It exists because a real workload that never asks "is `A` before `B`" for two arbitrary elements shouldn't have to pay to maintain an answer to a question nobody asks.
- **Binary heap (min-heap)** — a binary tree obeying the heap-order invariant (below), conventionally also required to be a complete binary tree (below). It exists to answer "what's the smallest element right now?" repeatedly, at a real cost far below what maintaining a full BST-style total order would require.
- **Heap-order invariant** — every node's value is less than or equal to both of its children's values, if they exist. Nothing is said about how a node's left child compares to its right child, or how two elements in different subtrees compare to each other — the specific partial order this lesson's heap actually maintains.
- **Complete binary tree** — a binary tree where every level is completely filled except possibly the last, and the last level's nodes are filled from left to right with no gaps. It exists because completeness, specifically, is what makes a flat array — not reference-based nodes — a correct, gap-free way to store a tree.
- **Sift-up / sift-down** — the two repair operations that restore the heap-order invariant after, respectively, inserting a new element at the tree's next open slot (sift-up: compare the new element against its parent, swap and repeat, moving up) or replacing the root with the tree's last element after removing the minimum (sift-down: compare it against its children, swap with the smaller and repeat, moving down). They exist because a single insertion or removal can only ever break the invariant locally, along one path — sifting is the cheapest possible repair that fixes exactly that path.

**Objects and methods used**

- **`quotient`**
  - *What it is:* a real Scheme procedure performing integer division, discarding any remainder.
  - *Implementation:* takes a dividend and a divisor, returns the truncated integer quotient; reappearing from Lesson 66, used here as `(quotient (- i 1) 2)`.
  - *Its use:* computes a node's parent index directly from Concept Unit 2's derived formula.
- **`vector-ref`**
  - *What it is:* a real Scheme procedure reading a vector's stored value at a given index, in one step.
  - *Implementation:* takes a vector and an index, returns the value stored there; reappearing from Lesson 55/85, used throughout as `(vector-ref vec i)`.
  - *Its use:* reading heap elements at computed array positions, both for comparisons during sifting and for the final drained output.
- **`vector-set!`**
  - *What it is:* a real Scheme procedure that mutates a vector, writing a new value into a given index.
  - *Implementation:* takes a vector, an index, and a value, mutating the vector in place; reappearing from Lesson 55/85, used throughout as `(vector-set! vec i val)`.
  - *Its use:* performing the actual element swaps in `heap-swap!`, and writing the moved root/last element during extraction.
- **`make-vector`**
  - *What it is:* a real Scheme procedure creating a new vector of a given length.
  - *Implementation:* takes a length, returns a fresh vector; reappearing from Lesson 55, used via Lesson 86's `make-doubling-dynarray`/`doubling-append` as `(make-vector 1)` and `(make-vector (* cap 2))`.
  - *Its use:* allocates the heap's own growable backing storage.
- **`vector-length`**
  - *What it is:* a real Scheme procedure returning a vector's total allocated size.
  - *Implementation:* takes a vector, returns its length as an integer; reappearing from Lesson 86, used inside `doubling-append` as `(vector-length vec)`.
  - *Its use:* checking whether the backing array still has room before appending — the trigger for Lesson 86's doubling growth.
- **`random`**
  - *What it is:* a real Scheme procedure returning a pseudo-random, non-negative integer below a given bound.
  - *Implementation:* takes an exclusive upper bound, returns an integer in `[0, bound)`; reappearing from pre-Era-IV use, used here as `(random 1000000)`.
  - *Its use:* generating the `1,000` random values inserted and drained in Concept Unit 3 and 4's continuous invariant checks.
- **`sort`**
  - *What it is:* a real Guile procedure sorting a list according to a given comparison procedure.
  - *Implementation:* takes a list and a `<`-shaped predicate, returns a newly ordered list; reappearing from Lesson 79, used here as `(sort vals <)`.
  - *Its use:* the independent, trusted reference Concept Unit 4 checks a full heap drain against.

---

## Concept Unit 1: Is a Full Ordering Necessary Just to Find the Minimum?

### The Problem

Lessons 97 through 103 spent seven straight lessons building and maintaining a BST's total order: for *any* two values held in the tree, walking a path from the root tells you, correctly, which one is smaller. That guarantee is genuinely powerful — but it's worth asking what it actually costs to maintain (Lesson 100's rotations, Lesson 101 through 103's whole balancing apparatus) against what a specific, narrower real workload actually needs. A job scheduler that always runs the highest-priority job next, or Lesson 105's own upcoming subject, never asks "is job `A` more urgent than job `B`" for two arbitrary jobs sitting in the queue — it only ever asks one question, repeatedly: "what's the most urgent job right now?" It's worth asking whether answering that narrower question, over and over, actually requires paying for a full total order at all.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, contrasting with Lesson 97's own precisely-defined BST invariant.

### Applying It — Naming the Weaker Requirement Precisely

A **total order** — the word for what Lesson 97's BST invariant actually provides — requires *every* pair of elements to be comparable, consistently, across the whole collection: for any two values `A` and `B` held anywhere in the tree, the invariant guarantees a correct answer to "which is smaller," reachable by walking a path. Repeatedly asking only "what's the smallest element right now" never actually uses that full guarantee — it only ever needs to know how an element compares to its *own* immediate neighbors in whatever structure holds it, never to some unrelated element sitting elsewhere. Naming that narrower requirement precisely: a **partial order**, where only *some* pairs are required to be comparable, and the rest are simply left undefined — not incorrect, just never promised.

### Walkthrough

- **"which is smaller" versus "what's the smallest right now"** — two genuinely different questions; the first needs to compare any two arbitrary elements, the second only ever needs local comparisons, never a global one.
- **Total order named precisely, for the first time** — Lesson 97 built one without ever naming the general concept; naming it here is what makes "give some of it up, deliberately" a legible engineering move rather than a vague weakening.

### CS Lens

This is a real instance of a recurring design pattern: match the strength of an invariant to the strength of the guarantee an actual required operation set needs, rather than reaching for the strongest, most general one by default. Also recognized in: a hospital emergency room's triage queue, which only ever needs to identify the single most urgent patient next, never a full ranking of every patient against every other; an operating system's process scheduler, repeatedly asking only "which process should run next," never "rank every process in the system"; a printer spooler serving the next queued job without maintaining any opinion about how job `12` compares to job `47` if neither is next.

### SE Lens

The alternative to seeking a narrower-fitting invariant is to reach for the strongest, most general structure already known — a BST, already trusted from Lesson 97 onward — for every problem that merely resembles "keep some values in order," regardless of what the actual operations performed on it are. The real cost of that alternative is exactly what Lesson 100 through 103 required: rotations, height tracking, coloring rules — real, ongoing enforcement work, paid on every insertion, in service of a guarantee (arbitrary-pair comparability) a "what's the minimum" workload never once queries. Naming the actual required operation set precisely, as this unit does, is what makes it possible to notice that mismatch before building the wrong structure.

---

## Concept Unit 2: Deriving the Heap-Order Invariant and Its Array Shape

### The Problem

Concept Unit 1 named the weaker requirement in the abstract. It needs a precise, checkable rule — Lesson 97's own format for stating an invariant, applied to a genuinely different, weaker relation — and a decision about representation: reference-based nodes, the way Lesson 97's BST was built, or something else entirely.

### No isolated lab for this step

This concept has no code of its own to isolate — the invariant and the array-index formulas are derived directly below, and Concept Unit 3 implements and verifies them as real code.

### Applying It — The Invariant, the Shape, and the Formula

**The heap-order invariant, precisely:** every node's value is less than or equal to both of its children's values, if they exist. Compare this directly to Lesson 97's BST invariant: BST orders a node against *every* value in both of its subtrees; a heap orders a node only against its own two immediate children. Nothing here says anything about how a node's left child compares to its right child, or how two values sitting in different subtrees compare to each other — exactly the pairs Concept Unit 1 named as never actually queried.

The invariant alone doesn't yet pin down a *shape*. This lesson's heap also requires a **complete binary tree**: every level completely filled except possibly the last, and the last level's nodes filled left to right with no gaps. Completeness is a deliberate, additional constraint — Lesson 99 showed a BST can become arbitrarily skewed while its own invariant holds perfectly; a heap rules that out entirely by requiring every level packed tight before the next one starts.

**Why completeness, specifically, matters:** a complete tree has no gaps anywhere in its level-by-level layout, which means it can be stored in one flat array, with the root at index `0`, and every subsequent level's nodes placed immediately after the previous level's, left to right — no wasted slots, and, critically, no stored references at all. This is Lesson 85's own contiguous-array idea, reused for a tree instead of a flat sequence.

**Deriving the index formulas, by hand:** place the root at index `0`. Its two children, being the next two nodes in level order, sit at indices `1` and `2`. Node `1`'s own two children, the next two nodes after that, sit at indices `3` and `4`; node `2`'s children sit at `5` and `6`. The pattern: a node at index `i` has children at `2i + 1` and `2i + 2`, and — read the same relationship in reverse — a node at index `i` has its parent at index `⌊(i − 1) / 2⌋`.

```
left(i)   = 2i + 1
right(i)  = 2i + 2
parent(i) = ⌊(i − 1) / 2⌋
```

Checked directly against the hand-worked example above: `left(0) = 1`, `right(0) = 2`; `parent(1) = 0`, `left(1) = 3`, `right(1) = 4`; `parent(2) = 0`, `right(2) = 6` — every value matching the level-order layout reasoned through above.

**This is a second instance of Lesson 85's own formula-deriving move, not a coincidence:** Lesson 85 derived `address(i) = base + i × element-size` to explain *why* flat array access is `O(1)`. This lesson derives a second, differently-shaped formula from the identical underlying idea — a tree's shape, once it's *complete*, is fully implied by position alone, so index arithmetic can locate a parent or child without ever storing a reference to one.

### Walkthrough

- **The invariant stated precisely, then directly contrasted against Lesson 97's** — parent-versus-children only, never node-versus-everything, is the exact partial order Concept Unit 1 asked for.
- **Completeness named as a deliberate additional constraint, not a consequence of the invariant alone** — the heap-order invariant, by itself, permits skewed shapes just as the BST invariant did; completeness is what a heap adds on top.
- **The index formulas, derived by hand from level order and checked against the worked example** — the concrete mechanism Concept Unit 3 turns into real code.

### CS Lens

This is an **implicit data structure**: a tree with zero explicit pointers, its entire shape implied by index arithmetic over one flat array. Also recognized in: representing a chessboard's `64` squares in a single flat array and computing a square's row and column from its index via division and remainder, rather than storing explicit two-dimensional coordinates; a spreadsheet engine computing a neighboring cell's position by formula rather than storing an explicit "next cell" reference.

### SE Lens

The alternative is building this heap from Lesson 87-style reference-based nodes, the same representation Lesson 97's BST used. The real tradeoff: reference-based nodes would need extra bookkeeping just to find "the next empty slot that keeps the tree complete" — something array indexing gives away for free, as literally the next unused slot in the array — plus the real memory cost of storing explicit child references at every single node. The honest cost being taken on in exchange: this lesson's heap gives up BST-style flexible reshaping (Lesson 100's rotations) entirely, committing to a far more rigid array layout — a deliberate trade, not an oversight, matched to Concept Unit 1's narrower requirement.

---

## Concept Unit 3: Implementing Insert — Sift-Up

### The Problem

Concept Unit 2 derived the invariant, the shape, and the formulas. It needs real code: inserting a new value while keeping both the complete-shape property and the heap-order invariant intact, using Lesson 86's own growable array as the underlying storage.

### The New Code — Type It Yourself

```scheme
(define (sift-up! vec i)
  (if (> i 0)
      (let ((p (heap-parent i)))
        (if (< (vector-ref vec i) (vector-ref vec p))
            (begin (heap-swap! vec i p) (sift-up! vec p))))))
```

### The Updated Project

This is `heap-insert-check.scm`, in full:

```scheme
(define (heap-parent i) (quotient (- i 1) 2))                    ; ← new

(define (make-doubling-dynarray) (list (make-vector 1) 0))
(define (doubling-append darr x)
  (let* ((vec (car darr)) (count (cadr darr)) (cap (vector-length vec)))
    (if (< count cap)
        (begin (vector-set! vec count x) (list vec (+ count 1)))
        (let ((new-vec (make-vector (* cap 2))))
          (let loop ((i 0))
            (if (< i cap)
                (begin (vector-set! new-vec i (vector-ref vec i)) (loop (+ i 1)))))
          (vector-set! new-vec count x)
          (list new-vec (+ count 1))))))

(define (heap-swap! vec i j)                                       ; ← new
  (let ((tmp (vector-ref vec i)))                                     ; ← new
    (vector-set! vec i (vector-ref vec j))                              ; ← new
    (vector-set! vec j tmp)))                                             ; ← new

(define (sift-up! vec i)                                           ; ← new
  (if (> i 0)                                                         ; ← new
      (let ((p (heap-parent i)))                                        ; ← new
        (if (< (vector-ref vec i) (vector-ref vec p))                     ; ← new
            (begin (heap-swap! vec i p) (sift-up! vec p))))))                ; ← new

(define (heap-insert darr x)                                       ; ← new
  (let* ((darr2 (doubling-append darr x)) (vec (car darr2)) (count (cadr darr2)))
    (sift-up! vec (- count 1))                                          ; ← new
    darr2))

(define (heap-valid? darr)                                         ; ← new
  (let ((vec (car darr)) (count (cadr darr)))
    (let loop ((i 1))
      (cond ((>= i count) #t)
            ((> (vector-ref vec (heap-parent i)) (vector-ref vec i)) #f)
            (else (loop (+ i 1)))))))

(define (heap-array darr)
  (let loop ((i 0) (acc '()))
    (if (= i (cadr darr)) (reverse acc) (loop (+ i 1) (cons (vector-ref (car darr) i) acc)))))

(define small
  (heap-insert (heap-insert (heap-insert (heap-insert (make-doubling-dynarray) 5) 3) 8) 1))
(display "small heap array: ") (display (heap-array small)) (newline)
(display "small heap valid? ") (display (heap-valid? small)) (newline)

(let loop ((i 0) (darr (make-doubling-dynarray)))
  (if (= i 1000)
      (display "checked all 1000 random insertions: heap-valid throughout\n")
      (let ((darr2 (heap-insert darr (random 1000000))))
        (if (not (heap-valid? darr2))
            (begin (display "HEAP INVARIANT VIOLATED at insertion ") (display i) (newline))
            (loop (+ i 1) darr2)))))
```

`heap-insert` reuses Lesson 86's `doubling-append` unchanged as the mechanism for placing a new value at the tree's next open slot — the specific slot that keeps the shape complete, found for free by appending to the end of a growable array rather than by any tree-specific bookkeeping. `sift-up!` then repairs the invariant: while the new element's index is greater than `0` and it's smaller than its own parent, swap them and continue from the parent's position; stop the moment either the root is reached or the parent is no longer larger.

### Reference Source

No reference counterpart — `heap-parent`, `heap-swap!`, `sift-up!`, `heap-insert`, and `heap-valid?` are a from-scratch implementation of Concept Unit 2's derived invariant and formulas, checked against Guile's own `sort` in Concept Unit 4 as an independent reference.

### Files affected

Created: `heap-insert-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile heap-insert-check.scm
small heap array: (1 3 8 5)
small heap valid? #t
checked all 1000 random insertions: heap-valid throughout
```

Verified this session — inserting `5`, `3`, `8`, `1` in that exact order produces the real array `(1 3 8 5)`, and `1,000` further, genuinely random insertions each individually leave `heap-valid?` confirming the invariant holds, not just at the end.

**Execution trace — inserting `1` into the already-built `(3 5 8)`:**

1. `(doubling-append darr 1)` — appends `1` at the array's next open slot, index `3`, producing `(3 5 8 1)`; the shape stays complete because appending to the end of a level-order array always fills the next slot in level order.
2. `(sift-up! vec 3)` — `i = 3 > 0`, so `p = (heap-parent 3) = (quotient 2 2) = 1`; `vec[3] = 1` is compared against `vec[1] = 5`.
3. `1 < 5` is true, so `(heap-swap! vec 3 1)` swaps them, producing `(3 1 8 5)`, and `sift-up!` recurses with `i = 1`.
4. `i = 1 > 0`, so `p = (heap-parent 1) = (quotient 0 2) = 0`; `vec[1] = 1` is compared against `vec[0] = 3`.
5. `1 < 3` is true, so `(heap-swap! vec 1 0)` swaps them, producing `(1 3 8 5)`, and `sift-up!` recurses with `i = 0`.
6. `i = 0`, so the `(> i 0)` check fails and `sift-up!` stops — the new element has either reached the root or found a parent no larger than itself, and the invariant holds throughout the array.

### Mechanical Walkthrough

- **`(quotient (- i 1) 2)`** in `heap-parent` — a reappearance of `quotient` (Lesson 66) and `-`; the literal parent formula Concept Unit 2 derived, executed for real.
- **`(let ((tmp (vector-ref vec i))) (vector-set! vec i (vector-ref vec j)) (vector-set! vec j tmp))`** in `heap-swap!` — a reappearance of real, in-place mutation, the hard concept Lesson 87 first introduced; every structure built since Lesson 97 (BST, AVL, red-black) instead built entirely new nodes rather than ever mutating existing ones, so this is the first time since Lesson 87 this curriculum's own project code has genuinely mutated existing storage rather than returning a fresh structure — a real, deliberate consequence of committing to array storage over persistent, reference-based nodes.
- **`(if (> i 0) ...)`** in `sift-up!` — first appearance of this specific stopping condition: sifting stops once the root is reached, since index `0` has no parent to compare against.
- **`(let ((p (heap-parent i))) ...)`** — a reappearance of `let`; binds the current element's parent index once, reused by both the comparison and the recursive call.
- **`(< (vector-ref vec i) (vector-ref vec p))`** — a reappearance of `vector-ref` and `<`; the literal heap-order invariant check, comparing a node directly against its parent, never against any other element.
- **`(begin (heap-swap! vec i p) (sift-up! vec p))`** — a reappearance of `begin` (Lesson 73) and recursion; on a violation, swap the pair and continue checking one level up, since only the path from the new element to the root could possibly still violate the invariant.
- **`(let* ((darr2 (doubling-append darr x)) ...) ...)`** in `heap-insert` — a reappearance of `let*` and Lesson 86's `doubling-append`, cited here rather than re-derived: the identical amortized-doubling growable array, reused unchanged as this lesson's own storage.
- **The real, exact match between the hand-traced insertion above and the actual `heap-array` output** — direct, checked confirmation that `sift-up!` performs exactly the repair Concept Unit 2's invariant requires, no more and no less.

### CS Lens

This is the identical local-repair strategy every one of Lesson 100 through 103's rebalancing operations already used, applied to a strictly cheaper invariant: a single insertion can only ever violate the invariant along the one path from the new element to the root, so the repair only ever needs to walk that one path, never the whole structure.

### SE Lens

The alternative to sifting only along the affected path is re-checking the entire heap's invariant after every insertion, the way `heap-valid?` itself does for verification purposes. The real cost of that alternative is `O(n)` work per insertion, regardless of how small the actual disturbance was; `sift-up!`'s real cost is bounded by the tree's height alone — `O(log n)`, since a complete tree's height is `⌊log₂ n⌋` — because the invariant, by construction, can only ever be broken along one specific path, never anywhere else.

---

## Concept Unit 4: Implementing Extract-Min — Sift-Down, and a Real Cost Comparison

### The Problem

Concept Unit 3 built insertion. The heap also needs to answer Concept Unit 1's actual motivating question — "what's the smallest element right now, and remove it" — and it's worth measuring, honestly, exactly how much real advantage the resulting structure buys over the plainest possible alternative: a linear scan.

### The New Code — Type It Yourself

```scheme
(define (sift-down! vec count i)
  (let* ((l (heap-left i)) (r (heap-right i))
         (smallest (if (and (< l count) (< (vector-ref vec l) (vector-ref vec i))) l i))
         (smallest2 (if (and (< r count) (< (vector-ref vec r) (vector-ref vec smallest))) r smallest)))
    (if (not (= smallest2 i))
        (begin (heap-swap! vec i smallest2) (sift-down! vec count smallest2)))))
```

### The Updated Project

This is `heap-extract-check.scm`, in full:

```scheme
(define (heap-parent i) (quotient (- i 1) 2))
(define (heap-left i) (+ (* 2 i) 1))                                ; ← new
(define (heap-right i) (+ (* 2 i) 2))                                ; ← new

(define (make-doubling-dynarray) (list (make-vector 1) 0))
(define (doubling-append darr x)
  (let* ((vec (car darr)) (count (cadr darr)) (cap (vector-length vec)))
    (if (< count cap)
        (begin (vector-set! vec count x) (list vec (+ count 1)))
        (let ((new-vec (make-vector (* cap 2))))
          (let loop ((i 0))
            (if (< i cap)
                (begin (vector-set! new-vec i (vector-ref vec i)) (loop (+ i 1)))))
          (vector-set! new-vec count x)
          (list new-vec (+ count 1))))))

(define (heap-swap! vec i j)
  (let ((tmp (vector-ref vec i)))
    (vector-set! vec i (vector-ref vec j))
    (vector-set! vec j tmp)))

(define (sift-up! vec i)
  (if (> i 0)
      (let ((p (heap-parent i)))
        (if (< (vector-ref vec i) (vector-ref vec p))
            (begin (heap-swap! vec i p) (sift-up! vec p))))))

(define (heap-insert darr x)
  (let* ((darr2 (doubling-append darr x)) (vec (car darr2)) (count (cadr darr2)))
    (sift-up! vec (- count 1))
    darr2))

(define (sift-down! vec count i)                                   ; ← new
  (let* ((l (heap-left i)) (r (heap-right i))                          ; ← new
         (smallest (if (and (< l count) (< (vector-ref vec l) (vector-ref vec i))) l i))  ; ← new
         (smallest2 (if (and (< r count) (< (vector-ref vec r) (vector-ref vec smallest))) r smallest))) ; ← new
    (if (not (= smallest2 i))                                          ; ← new
        (begin (heap-swap! vec i smallest2) (sift-down! vec count smallest2))))) ; ← new

(define (heap-min darr) (vector-ref (car darr) 0))                 ; ← new

(define (heap-extract-min darr)                                    ; ← new
  (let* ((vec (car darr)) (count (cadr darr)) (new-count (- count 1)))  ; ← new
    (vector-set! vec 0 (vector-ref vec new-count))                        ; ← new
    (sift-down! vec new-count 0)                                            ; ← new
    (list vec new-count)))                                                    ; ← new

(define (heap-valid? darr)
  (let ((vec (car darr)) (count (cadr darr)))
    (let loop ((i 1))
      (cond ((>= i count) #t)
            ((> (vector-ref vec (heap-parent i)) (vector-ref vec i)) #f)
            (else (loop (+ i 1)))))))

(define vals (let loop ((i 0) (acc '())) (if (= i 20) acc (loop (+ i 1) (cons (random 1000000) acc)))))
(define built (let loop ((vs vals) (darr (make-doubling-dynarray)))
                (if (null? vs) darr (loop (cdr vs) (heap-insert darr (car vs))))))
(define drained
  (let loop ((darr built) (acc '()))
    (if (= (cadr darr) 0)
        (reverse acc)
        (let ((m (heap-min darr))) (loop (heap-extract-min darr) (cons m acc))))))
(display "drained from heap:     ") (display drained) (newline)
(display "guile sort of same 20: ") (display (sort vals <)) (newline)
(display "match? ") (display (equal? drained (sort vals <))) (newline)
```

`heap-extract-min` moves the array's last element into the now-vacated root slot (keeping the shape complete, since the last slot in level order is exactly the one just freed) and calls `sift-down!` from the root. `sift-down!` compares a node against *both* of its children — not just one, since either could be the smaller — and swaps with whichever child is smaller, continuing from there; it stops the moment the node is no larger than either remaining child.

### Reference Source

No reference counterpart — `heap-left`, `heap-right`, `sift-down!`, `heap-min`, and `heap-extract-min` are a from-scratch implementation of Concept Unit 2's derived formulas and invariant, checked here against Guile's own built-in `sort` (Lesson 79) as an independent, already-trusted reference.

### Files affected

Created: `heap-extract-check.scm`, and — for the real cost comparison below — `heap-cost-compare.scm`.

### Change type

Add (new files; this lesson's real, kept artifacts).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile heap-extract-check.scm
drained from heap:     (24145 66911 96509 103910 110786 208691 224818 230122 326253 326825 435446 487159 723028 736524 778978 865221 871844 902445 917425 968125)
guile sort of same 20: (24145 66911 96509 103910 110786 208691 224818 230122 326253 326825 435446 487159 723028 736524 778978 865221 871844 902445 917425 968125)
match? #t
```

Verified this session — repeatedly calling `heap-min` then `heap-extract-min` until the heap is empty produces `20` values in exactly ascending order, matching Guile's own built-in `sort` on the identical input exactly.

**Execution trace — extracting the minimum from `(1 3 8 5)`, Concept Unit 3's own result:**

1. `(heap-min darr)` — reads `vec[0] = 1`, the value about to be returned as the minimum.
2. `(vector-set! vec 0 (vector-ref vec 3))` — the last element, `5`, overwrites the root, producing `(5 3 8)` in the first three slots; the invariant is now very likely broken at the root, since `5` was never compared to anything on the way in.
3. `(sift-down! vec 3 0)` — at `i = 0`: `l = 1`, `r = 2`; `vec[1] = 3 < vec[0] = 5` is true, so `smallest = 1`; `vec[2] = 8 < vec[1] = 3` is false, so `smallest2` stays `1`.
4. `1 ≠ 0`, so `(heap-swap! vec 0 1)` swaps them, producing `(3 5 8)`, and `sift-down!` recurses with `i = 1`.
5. At `i = 1`: `l = 3`, which is not less than `count = 3`, so `smallest = i = 1` without comparing; `r = 4`, also not less than `3`, so `smallest2` stays `1`.
6. `1 = 1` (`smallest2 = i`), so `sift-down!` stops — every remaining node is no larger than its children, and the heap-order invariant holds again across the whole array.

The real, checked result: `heap-min` returns `1`, and the array becomes `(3 5 8)` — matching this lesson's earlier hand trace exactly.

**A separate check — the invariant holds through a full drain, not just one extraction:**

```
checked heap-valid through all 1000 extractions
```

Verified this session — building a `1,000`-element heap and calling `heap-extract-min` repeatedly until empty, `heap-valid?` confirms the invariant after every single extraction, not only the final state.

**The real cost comparison — heap versus a naive linear scan, both doing the identical job (`n` insertions, then `n` repeated remove-the-minimum operations):**

```
$ guile heap-cost-compare.scm
n=100 heap(insert+extract)=1029 (insert-only=192) naive(extract-only)=4950 ratio=4.810495626822157
n=1000 heap(insert+extract)=17161 (insert-only=2191) naive(extract-only)=499500 ratio=29.106695414020162
n=10000 heap(insert+extract)=239198 (insert-only=22589) naive(extract-only)=49995000 ratio=209.0109449075661
```

`heap-cost-compare.scm` extends this unit's own `heap-insert`/`heap-extract-min` with `set!`-based counters on every real comparison — the identical instrumentation technique as Lesson 92's `count-collisions` and Lesson 103's `restructure-count` — and pairs them against a `naive-extract-min-counted` that scans the *entire* remaining array, comparison by comparison, to find the minimum before removing it.

**Naming why, directly:** the naive approach's real numbers match `n(n − 1) / 2` exactly at every scale checked — `4,950` at `n = 100`, `499,500` at `n = 1,000`, `49,995,000` at `n = 10,000` — because its first extraction scans `n − 1` elements, its second scans `n − 2`, and so on down to `0`, the identical arithmetic series Lesson 64 already summed. The heap's real total tracks `n log₂ n` closely, not `n²`: `1,029` against a predicted `664.4` at `n = 100`, `17,161` against `9,965.8` at `n = 1,000`, `239,198` against `132,877.1` at `n = 10,000` — the ratio to `n log₂ n` drifting from `1.55` up toward `1.80` as `n` grows, consistent with `sift-down!` making up to two real comparisons per level (checking both children) while `sift-up!` makes only one, and both operations' real costs summing into the one measured total.

### Mechanical Walkthrough

- **`(+ (* 2 i) 1)`, `(+ (* 2 i) 2)`** in `heap-left`/`heap-right` — a reappearance of `+` and `*`; the literal child formulas Concept Unit 2 derived, executed for real.
- **`(let* ((l (heap-left i)) (r (heap-right i)) ...) ...)`** — a reappearance of `let*`; computes both child indices once, reused by both comparisons below.
- **`(and (< l count) (< (vector-ref vec l) (vector-ref vec i)))`** — a reappearance of `and` and `<`; the left child only counts as a candidate if its index is actually inside the heap's current size *and* it's smaller than the current node — the shape check must come first, since a child index past `count` doesn't correspond to a real element at all.
- **The second `and` clause, comparing the right child against `vec[smallest]` rather than `vec[i]`** — first appearance of this specific ordering: comparing against whichever of `{i, left}` is currently smallest, not against `i` directly, is what correctly finds the smallest of *all three* candidates rather than only ever picking between `i` and one child.
- **`(if (not (= smallest2 i)) (begin (heap-swap! vec i smallest2) (sift-down! vec count smallest2)))`** — a reappearance of `not`, `=`, `begin`, `heap-swap!`, and recursion; stops the moment the current node is already no larger than either child, the mirror-image stopping condition to `sift-up!`'s own.
- **`(vector-set! vec 0 (vector-ref vec new-count))`** in `heap-extract-min` — a reappearance of `vector-set!`/`vector-ref`; overwrites the root with the array's last element before shrinking, the specific move that keeps the shape complete without any explicit "find the next slot" search.
- **The real, exact match between the drained heap and Guile's own `sort`** — direct, checked confirmation that repeated `heap-min`/`heap-extract-min` correctly reproduces a full sort, the same external-reference discipline Lesson 79 applied to `merge-sort`.
- **The real comparison-count numbers, and their exact match to the predicted `n(n − 1)/2` and approximate `n log₂ n` formulas** — direct, measured evidence of the two structures' genuinely different growth-rate categories, not an assumed or estimated difference.

### CS Lens

This is Lesson 82's design-constraint discipline applied to a brand-new structure: predicting a growth-rate category from the algorithm's own shape (`O(log n)` per operation, since both `sift-up!` and `sift-down!` are bounded by a complete tree's height) before measuring, then confirming it with real numbers rather than trusting the prediction alone. Also recognized in: a hospital's triage queue (Concept Unit 1's own example) genuinely outperforming a clipboard that has to be re-scanned in full every time a nurse asks "who's next" — the identical structural gap, at real, human scale.

### SE Lens

The alternative to building a heap at all, for a "give me the minimum, repeatedly" workload, is exactly `naive-extract-min-counted`'s own approach: keep values in any convenient unordered container and scan for the minimum on demand. The real cost of that alternative, honestly measured rather than assumed, is `Θ(n²)` total work across a full insert-then-drain-everything sequence — a cost that becomes dramatically worse, not just somewhat worse, as `n` grows, exactly the `4.8×` at `n = 100` widening to `209×` at `n = 10,000` measured above. The heap's own real cost — maintaining the weaker, cheaper invariant Concept Unit 1 and 2 derived — is what buys that difference back.

---

## Closing

### Connect the pieces

One value, `1`, traced through every unit this lesson built:

1. **The narrower requirement, named (Unit 1):** repeatedly asking "what's the minimum" only ever needs a partial order, not Lesson 97's full total order.
2. **The invariant, shape, and formulas, derived (Unit 2):** heap-order (parent ≤ children only), completeness (no gaps), and `left(i) = 2i+1`, `right(i) = 2i+2`, `parent(i) = ⌊(i−1)/2⌋` — turning a complete tree into pure index arithmetic over Lesson 85's own array.
3. **Insertion, implemented and verified (Unit 3):** inserting `5, 3, 8, 1` in order, one `sift-up!` at a time, produces the real array `(1 3 8 5)` — checked continuously across `1,000` random insertions.
4. **Extraction, implemented and verified, with a real cost payoff (Unit 4):** extracting from `(1 3 8 5)` returns `1` and leaves `(3 5 8)`, a full drain reproduces Guile's own `sort` exactly, and the real comparison counts show the heap winning by a widening margin — `4.8×` at `n = 100`, `209×` at `n = 10,000` — over the plainest possible alternative.

Every claim in this lesson traces to real, executed code: a hand-traceable small example, a continuous invariant check across `1,000` operations, an external-reference match against `sort`, and a real, measured cost comparison against a genuinely different approach to the identical problem.

### What breaks without this

Suppose an engineer needed a "run the next highest-priority job" queue and reached for a BST — already trusted, already understood from Lesson 97 onward — without asking what the actual required operations were. Every insertion would pay Lesson 100 through 103's real rebalancing cost, in service of a total-order guarantee (arbitrary-pair comparability) the workload never queries even once; meanwhile, finding the *minimum* specifically in a plain, unbalanced BST still means walking all the way down its left spine, a real cost this lesson's heap never pays, since the minimum always sits at index `0`. Naming the actual required operations precisely, as Concept Unit 1 does, is what catches a mismatched structure before it's built.

### Exercises

1. **Observe.** Before checking, predict whether a **max**-heap — the mirror-image structure, always returning the *largest* element — would need any change to `heap-parent`, `heap-left`, or `heap-right`, using this lesson's own derivation (Concept Unit 2) to justify your answer.
2. **Formalize.** Implement `sift-up-max!` and `sift-down-max!` by changing only the comparison direction in this lesson's `sift-up!`/`sift-down!`, and confirm a full drain of a max-heap produces values in *descending* order, checked against `(sort vals >)`.
3. **Formalize.** Measure the real comparison count for `heap-valid?` itself (add a counter) at `n = 1,000` and `n = 10,000`, and confirm it's `Θ(n)` — a full, one-time check, genuinely different in kind from the `Θ(log n)` cost of a single `sift-up!` or `sift-down!` call.
4. **Explain.** In your own words, explain why `heap-extract-min` moves the array's *last* element into the vacated root, specifically, rather than any other element — connecting your answer to what "keeping the shape complete" requires.
5. **Explain.** Using this lesson's real ratio numbers (`4.8×`, `29.1×`, `209.0×` at `n = 100`, `1,000`, `10,000`), explain why the gap between the heap and the naive approach keeps widening rather than settling at a fixed multiple, referencing the two structures' different growth-rate categories from Era III.

### Definition of done

- [ ] You can state the heap-order invariant and explain precisely how it differs from Lesson 97's BST invariant.
- [ ] You can derive `left(i)`, `right(i)`, and `parent(i)` from a complete tree's level-order layout, by hand, without looking them up.
- [ ] You traced `sift-up!` inserting `1` into `(3 5 8)` and `sift-down!` extracting the minimum from `(1 3 8 5)`, matching this lesson's own real output at every step.
- [ ] You can explain why `heap-swap!`'s in-place mutation is a deliberate consequence of choosing array storage over Lesson 97's persistent, reference-based nodes.
- [ ] You completed Exercises 1–5, including a working max-heap and a real, measured `heap-valid?` comparison count at two scales.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
