# Lesson 105: Priority Queues

**What you will build:** a `PriorityQueue` abstract data type — following Lesson 84's own format exactly — with two genuinely different implementations checked against each other: a thin wrapper over Lesson 104's heap, and a naive wrapper over an unsorted array. Real, verified evidence this session: across a `1,000`-step randomized sequence mixing real `insert`, `peek-min`, and `extract-min` calls in an unpredictable order — not just building a whole priority queue and then draining it, but genuinely interleaved, realistic usage — both implementations agree exactly on every single result. The transferable point: Lesson 104 built a real, correct representation, but never named a swappable interface around it, exactly the gap Lesson 84 argued matters and Lesson 88/89 already closed for stacks and queues. This lesson closes it for "give me the smallest, repeatedly" — and, because Lesson 104 already measured the real cost gap between these two specific implementations (`4.8×` to `209×`, widening with `n`), this is the first ADT in this curriculum where the two swappable implementations don't just differ in representation, but in *measured, dramatic real cost* — making Lesson 84's original promise, that callers never have to know or care which one they're using, count for something real rather than a hypothetical.

**What you need to know first:** Lesson 104 (`FP-L104-heaps.md`) — specifically `heap-insert`, `heap-min`, `heap-extract-min`, reused unchanged as this lesson's first implementation, and its own real comparison-count evidence, reused directly rather than re-measured. Lesson 84 (`FP-L084-abstract-data-types.md`) — specifically the ADT contract format (*requires* / *guarantees*), reused exactly. Lesson 88 (`FP-L088-stacks.md`) and Lesson 89 (`FP-L089-queues.md`) — specifically their own ADTs, the direct contrast point for what makes a *priority* queue different in kind, not just in name. Lesson 86 (`FP-L086-dynamic-arrays.md`) — specifically `doubling-append`, reused as this lesson's second implementation's underlying storage.

**Terms introduced in this lesson**

- **Priority queue (PQ)** — an abstract data type whose removal order is determined by comparing element *values*, rather than by *when* each element was inserted. It exists to name, precisely, the discipline Lesson 104's heap already implements but never exposed as its own swappable contract.

**Objects and methods used**

- **`vector-ref`**
  - *What it is:* a real Scheme procedure reading a vector's stored value at a given index.
  - *Implementation:* takes a vector and an index, returns the value stored there; reappearing from Lesson 55/85, used in `pq-min-index`/`pq-peek-min-naive` as `(vector-ref vec i)`.
  - *Its use:* scanning the naive implementation's unsorted storage to find the current minimum's real index and value.
- **`random`**
  - *What it is:* a real Scheme procedure returning a pseudo-random, non-negative integer below a given bound.
  - *Implementation:* takes an exclusive upper bound, returns an integer in `[0, bound)`; reappearing from Lesson 104, used in `run-sequence` as `(random 3)` and `(random 1000000)`.
  - *Its use:* choosing which of insert/peek-min/extract-min to perform at each step of the randomized, interleaved check, and generating the values inserted.

**Everything else in the file, not this lesson's subject but still explained**

- **`heap-insert`, `heap-min`, `heap-extract-min`**
  - *What it is:* Lesson 104's own real, verified min-heap operations.
  - *Implementation:* full bodies quoted unchanged in Concept Unit 3's Updated Project; see `FP-L104-heaps.md`, Concept Unit 3 and 4, for their derivation and verification.
  - *Its use:* the entire body of every `pq-*-heap` procedure in this lesson — Concept Unit 3's whole point is that no new logic was needed here at all.
- **`doubling-append`, `make-doubling-dynarray`**
  - *What it is:* Lesson 86's own amortized-doubling growable array.
  - *Implementation:* full body quoted unchanged in this lesson's Updated Project blocks; see `FP-L086-dynamic-arrays.md`, Concept Unit 3.
  - *Its use:* the underlying storage for both this lesson's implementations — the heap-backed one via `heap-insert`, and the naive one directly via `pq-insert-naive`.

---

## Concept Unit 1: A Real Representation Without a Named Interface

### The Problem

Lesson 104 built real, correct procedures — `heap-insert`, `heap-min`, `heap-extract-min` — for maintaining a min-heap. Every scratch check in that lesson called those exact procedures directly, by name. That's precisely the gap Lesson 84 argued against, and Lesson 88 and 89 already closed for Last-In-First-Out and First-In-First-Out behavior: code written directly against `heap-insert` and `heap-extract-min` is implicitly committed to array-backed heap storage specifically, with no way to swap in a different representation — Lesson 104's own naive linear-scan alternative, for instance — without touching every call site that ever mentions a heap procedure by name.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is posed directly here, contrasting with Lesson 88 and 89's own already-named ADTs.

### Applying It — What a Named Interface Would Need to Cover

Whatever interface gets named needs to cover exactly the operations Lesson 104's own scratch checks actually performed: adding a value, reading the current minimum without removing it, and removing the current minimum — nothing about *how* the minimum is found or maintained underneath.

### Walkthrough

- **The direct citation of `heap-insert`/`heap-min`/`heap-extract-min` by name, from every one of Lesson 104's checks** — makes the gap concrete: real code already exists, and already works, but nothing yet stands between it and its callers.
- **The explicit operation list** — previews Concept Unit 2's contract precisely, before any formal definition.

### CS Lens

This is Lesson 84's own point, encountered a second time from the opposite direction: Lesson 84 built the interface *first*, then two implementations to satisfy it. Here, a real, correct implementation already exists, and the interface is being named *after* the fact — a legitimate, common order in real software, where a working piece of code often earns a named, stable contract only once something else needs to depend on it without depending on its specific representation.

### SE Lens

The alternative to naming the interface now is to keep calling `heap-insert`/`heap-min`/`heap-extract-min` directly everywhere "give me the smallest" behavior is needed — exactly what every one of Lesson 104's own checks already did, informally. The real cost of that alternative is exactly what Concept Unit 4 demonstrates concretely: without a named interface, swapping to a different real implementation — even one already fully built, like Lesson 104's own naive comparison — would mean finding and rewriting every call site, rather than changing one `define` at the top of the program.

---

## Concept Unit 2: Defining the Priority Queue ADT

### The Problem

Concept Unit 1's operation list needs a precise ADT definition, in Lesson 84's own contract format, before any wrapper code gets written.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below, following Lesson 84's contract format exactly, the same way Lesson 88 and 89 did for their own ADTs.

### Applying It — The Priority Queue ADT, Precisely

- **`pq-insert(pq, x)`** — *requires:* nothing. *guarantees:* returns a priority queue containing every element of `pq` plus `x`.
- **`pq-peek-min(pq)`** — *requires:* `pq` is non-empty. *guarantees:* returns the smallest element currently in `pq`, by `<`, without removing it.
- **`pq-extract-min(pq)`** — *requires:* `pq` is non-empty. *guarantees:* returns a priority queue containing every element of `pq` except one occurrence of the smallest.
- **`pq-empty?(pq)`** — *requires:* nothing. *guarantees:* returns true exactly when `pq` contains no elements.

**Naming what makes this specifically a *priority* queue, not a Stack or Queue wearing a new name:** Lesson 88's `Stack` and Lesson 89's `Queue` contracts are both written entirely in terms of *insertion order* — "most recently added" for a stack, "least recently added" for a queue. Neither contract ever compares element values at all. This ADT's contracts are written entirely in terms of *value order* instead — `pq-peek-min` and `pq-extract-min` both name a real `<` comparison directly in their own guarantees, and *insertion* order is never mentioned anywhere in any of the four contracts above. This is Lesson 104's own partial order (Concept Unit 1 of that lesson), now promoted to a named, swappable interface, the same way Lesson 88 promoted "most recently added" and Lesson 89 promoted "least recently added."

### Walkthrough

- **Each operation as a *requires*/*guarantees* contract** — a direct reapplication of Lesson 84's own format, this time to a value-ordered interface.
- **The explicit contrast with Lesson 88 and 89** — clarifies that a priority queue isn't a new *kind* of contract format, it's a specific, named set of contracts organized around value comparison instead of recency.

### CS Lens

This is the same "genuinely different axis, superficially similar shape" pattern Lesson 104 itself named for invariants, now one level up, at the level of a whole ADT. Also recognized in: a boarding gate's queue, organized strictly by arrival order, versus a stock exchange's order book, matching trades by price priority regardless of which order arrived first; a bug tracker's "oldest ticket first" triage policy versus a "highest severity first" one — both real, both common, differing only in which axis governs removal order.

### SE Lens

The alternative to writing these contracts precisely is to build priority-queue-shaped code without ever naming the guarantee explicitly — exactly what calling `heap-extract-min` directly, everywhere it's needed, already amounts to. The real cost of that alternative is identical to Lesson 88's own: code not written against a named contract can't be checked against it, or swapped to a different implementation with any confidence it still behaves the same way — precisely what Concept Unit 4 checks, rather than assumes.

---

## Concept Unit 3: Implementation One — Wrapping Lesson 104's Heap

### The Problem

Concept Unit 2's contracts need a real implementation. The first one is almost the whole point of naming the interface *after* the fact: Lesson 104 already built exactly the behavior these contracts require.

### The New Code — Type It Yourself

```scheme
(define (make-pq-heap) (make-doubling-dynarray))
(define (pq-insert-heap pq x) (heap-insert pq x))
(define (pq-peek-min-heap pq) (heap-min pq))
(define (pq-extract-min-heap pq) (heap-extract-min pq))
(define (pq-empty-heap? pq) (= (cadr pq) 0))
```

### The Updated Project

This is `pq-heap.scm`, in full — Lesson 104's own `heap-parent`/`heap-left`/`heap-right`/`heap-swap!`/`sift-up!`/`heap-insert`/`sift-down!`/`heap-min`/`heap-extract-min`, and Lesson 86's own `make-doubling-dynarray`/`doubling-append`, all unchanged, with this unit's thin wrapper added on top:

```scheme
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

(define (heap-parent i) (quotient (- i 1) 2))
(define (heap-left i) (+ (* 2 i) 1))
(define (heap-right i) (+ (* 2 i) 2))
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
(define (sift-down! vec count i)
  (let* ((l (heap-left i)) (r (heap-right i))
         (smallest (if (and (< l count) (< (vector-ref vec l) (vector-ref vec i))) l i))
         (smallest2 (if (and (< r count) (< (vector-ref vec r) (vector-ref vec smallest))) r smallest)))
    (if (not (= smallest2 i))
        (begin (heap-swap! vec i smallest2) (sift-down! vec count smallest2)))))
(define (heap-min darr) (vector-ref (car darr) 0))
(define (heap-extract-min darr)
  (let* ((vec (car darr)) (count (cadr darr)) (new-count (- count 1)))
    (vector-set! vec 0 (vector-ref vec new-count))
    (sift-down! vec new-count 0)
    (list vec new-count)))

(define (make-pq-heap) (make-doubling-dynarray))                   ; ← new
(define (pq-insert-heap pq x) (heap-insert pq x))                     ; ← new
(define (pq-peek-min-heap pq) (heap-min pq))                             ; ← new
(define (pq-extract-min-heap pq) (heap-extract-min pq))                    ; ← new
(define (pq-empty-heap? pq) (= (cadr pq) 0))                                  ; ← new

(define h1 (pq-insert-heap (pq-insert-heap (pq-insert-heap (make-pq-heap) 40) 10) 25))
(display "after insert 40, 10, 25: peek-min=") (display (pq-peek-min-heap h1)) (newline)
(define h2 (pq-extract-min-heap h1))
(display "after extract-min: peek-min=") (display (pq-peek-min-heap h2)) (newline)
(define h3 (pq-insert-heap h2 5))
(display "after insert 5: peek-min=") (display (pq-peek-min-heap h3)) (newline)
```

Every one of the five new procedures does nothing but call straight through to a Lesson 104 procedure that already, fully, satisfies Concept Unit 2's contract — `pq-insert-heap` *is* `heap-insert`, under a name that names the interface rather than the representation. This is a legitimate, even ideal, outcome of naming an interface after correct code already exists to satisfy it, not a sign the wrapper needed more work.

### Reference Source

Lesson 104's `heap-insert`, `heap-min`, `heap-extract-min` (`FP-L104-heaps.md`, Concept Unit 3 and 4), quoted here unchanged, plus Lesson 86's `make-doubling-dynarray`/`doubling-append` (`FP-L086-dynamic-arrays.md`, Concept Unit 3), also unchanged.

### Files affected

Created: `pq-heap.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile pq-heap.scm
after insert 40, 10, 25: peek-min=10
after extract-min: peek-min=25
after insert 5: peek-min=5
```

Verified this session — inserting `40`, `10`, `25` gives a real minimum of `10`; extracting it leaves `25` as the real new minimum (`40` is still present but larger); inserting `5` afterward makes `5` the real new minimum. Every one of these three real values comes directly from Lesson 104's own `heap-insert`/`heap-min`/`heap-extract-min`, called through this unit's named wrapper.

1. `(pq-insert-heap (make-pq-heap) 40)` — calls `heap-insert` on an empty heap; `40` becomes the sole element.
2. `(pq-insert-heap ... 10)` — `heap-insert` appends `10` and sifts it up past `40`, since `10 < 40`; the array becomes `(10 40)`.
3. `(pq-insert-heap ... 25)` — `heap-insert` appends `25` and sifts it up; `25` is compared against its parent `10` (index `0`), and `25 < 10` is false, so it stays put; the array becomes `(10 40 25)`.
4. `(pq-peek-min-heap h1)` — calls `heap-min`, reading index `0` directly; returns `10`, the real minimum of `{40, 10, 25}`.
5. `(pq-extract-min-heap h1)` — calls `heap-extract-min`; removes `10`, moves the last element (`25`) to the root, and sifts it down against its one remaining child (`40`); since `25 < 40`, it stays, leaving `(25 40)`.
6. `(pq-peek-min-heap h2)` — returns `25`, the real minimum of the two remaining elements.
7. `(pq-insert-heap h2 5)` — `heap-insert` appends `5` and sifts it up past both `25` and `40` in turn, since `5` is smaller than each parent it meets.
8. `(pq-peek-min-heap h3)` — returns `5`, the real minimum of `{25, 40, 5}`.

### Mechanical Walkthrough

- **`(heap-insert pq x)`, `(heap-min pq)`, `(heap-extract-min pq)`** — a reappearance of all three, cited directly to Lesson 104 rather than re-derived; per the Repetition Rule, this is a hard concept (the sift-up/sift-down repair mechanism) reappearing, restated here as "already fully implemented, unchanged" rather than re-explained line by line.
- **`(= (cadr pq) 0)`** in `pq-empty-heap?` — a reappearance of `cadr` and `=`; reads the stored count directly, the identical check Lesson 104's own `heap-valid?` used internally.
- **The five procedure names themselves, `pq-*` instead of `heap-*`** — first appearance of this specific idiom: a name change with no logic change at all, marking the boundary between "what Concept Unit 2's contract requires" and "how this particular implementation happens to satisfy it."
- **The real, exact match between the hand-traced call sequence above and the actual program output** — direct, checked confirmation that wrapping Lesson 104's procedures under new names changed nothing about their real behavior.

### CS Lens

This is delegation in its simplest possible form: every wrapper procedure's entire body is a single call to an already-correct procedure, with no new logic at all. Also recognized in: a company renaming an internal team's existing, working process to match a new external-facing service name, without changing a single step of the process itself — the contract with the outside world changes; nothing about how the work actually gets done does.

### SE Lens

The alternative to a thin, one-line-per-operation wrapper is to inline calls to `heap-insert`/`heap-min`/`heap-extract-min` directly wherever priority-queue behavior is needed, the way Concept Unit 1 described the current, unnamed state of affairs. The real cost of the inlined alternative isn't visible yet from this unit alone — it becomes concrete in Concept Unit 4, when a second, genuinely different implementation needs to slot in without touching anything that already calls `pq-insert`/`pq-peek-min`/`pq-extract-min` by their ADT names.

---

## Concept Unit 4: Implementation Two — a Naive, Unsorted Array — and a Real Interleaved Check

### The Problem

Concept Unit 3's implementation satisfies Concept Unit 2's contract, but so, in principle, could something far simpler. It's worth building the plainest possible alternative — an unsorted array, scanned on demand — and checking, under real, unpredictable, interleaved usage, that it's genuinely indistinguishable from Concept Unit 3's heap-backed version from the outside.

### The New Code — Type It Yourself

```scheme
(define (pq-min-index pq)
  (let ((vec (car pq)) (count (cadr pq)))
    (let loop ((i 1) (best 0))
      (if (= i count)
          best
          (loop (+ i 1) (if (< (vector-ref vec i) (vector-ref vec best)) i best))))))
```

### The Updated Project

This is `pq-naive-check.scm`, in full — reusing `make-doubling-dynarray`/`doubling-append` from Lesson 86 and `heap-swap!` from Lesson 104 unchanged, both implementations from this lesson, and a real, randomized checker:

```scheme
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
(define (heap-parent i) (quotient (- i 1) 2))
(define (heap-left i) (+ (* 2 i) 1))
(define (heap-right i) (+ (* 2 i) 2))
(define (sift-up! vec i)
  (if (> i 0)
      (let ((p (heap-parent i)))
        (if (< (vector-ref vec i) (vector-ref vec p))
            (begin (heap-swap! vec i p) (sift-up! vec p))))))
(define (heap-insert darr x)
  (let* ((darr2 (doubling-append darr x)) (vec (car darr2)) (count (cadr darr2)))
    (sift-up! vec (- count 1))
    darr2))
(define (sift-down! vec count i)
  (let* ((l (heap-left i)) (r (heap-right i))
         (smallest (if (and (< l count) (< (vector-ref vec l) (vector-ref vec i))) l i))
         (smallest2 (if (and (< r count) (< (vector-ref vec r) (vector-ref vec smallest))) r smallest)))
    (if (not (= smallest2 i))
        (begin (heap-swap! vec i smallest2) (sift-down! vec count smallest2)))))
(define (heap-min darr) (vector-ref (car darr) 0))
(define (heap-extract-min darr)
  (let* ((vec (car darr)) (count (cadr darr)) (new-count (- count 1)))
    (vector-set! vec 0 (vector-ref vec new-count))
    (sift-down! vec new-count 0)
    (list vec new-count)))

(define (make-pq-heap) (make-doubling-dynarray))
(define (pq-insert-heap pq x) (heap-insert pq x))
(define (pq-peek-min-heap pq) (heap-min pq))
(define (pq-extract-min-heap pq) (heap-extract-min pq))
(define (pq-empty-heap? pq) (= (cadr pq) 0))

(define (make-pq-naive) (make-doubling-dynarray))                  ; ← new
(define (pq-insert-naive pq x) (doubling-append pq x))                ; ← new

(define (pq-min-index pq)                                              ; ← new
  (let ((vec (car pq)) (count (cadr pq)))                                 ; ← new
    (let loop ((i 1) (best 0))                                              ; ← new
      (if (= i count)                                                         ; ← new
          best                                                                  ; ← new
          (loop (+ i 1) (if (< (vector-ref vec i) (vector-ref vec best)) i best)))))) ; ← new

(define (pq-peek-min-naive pq) (vector-ref (car pq) (pq-min-index pq)))  ; ← new
(define (pq-extract-min-naive pq)                                          ; ← new
  (let* ((vec (car pq)) (count (cadr pq)) (best (pq-min-index pq)))          ; ← new
    (heap-swap! vec best (- count 1))                                          ; ← new
    (list vec (- count 1))))                                                     ; ← new
(define (pq-empty-naive? pq) (= (cadr pq) 0))                                       ; ← new

(define (run-sequence n)                                               ; ← new
  (let loop ((i 0) (h (make-pq-heap)) (v (make-pq-naive)) (ok #t))
    (if (or (not ok) (= i n))
        ok
        (let ((op (random 3)))
          (cond
            ((or (= op 0) (pq-empty-heap? h))
             (let ((x (random 1000000)))
               (loop (+ i 1) (pq-insert-heap h x) (pq-insert-naive v x) ok)))
            ((= op 1)
             (let ((mh (pq-peek-min-heap h)) (mv (pq-peek-min-naive v)))
               (if (not (= mh mv))
                   (begin (display "PEEK MISMATCH at step ") (display i) (newline) #f)
                   (loop (+ i 1) h v ok))))
            (else
             (let ((mh (pq-peek-min-heap h)) (mv (pq-peek-min-naive v)))
               (if (not (= mh mv))
                   (begin (display "EXTRACT MISMATCH at step ") (display i) (newline) #f)
                   (loop (+ i 1) (pq-extract-min-heap h) (pq-extract-min-naive v) ok)))))))))

(display "1000-step randomized insert/peek/extract-min sequence, heap vs naive: ")
(display (if (run-sequence 1000) "all steps agreed" "MISMATCH FOUND"))
(newline)
```

`pq-min-index` scans every element from index `1` to the end, tracking the index of the smallest seen so far — the identical linear-scan idea Lesson 104's own `naive-extract-min-counted` already used, without the comparison counter this lesson doesn't need. `pq-extract-min-naive` finds the minimum, swaps it with the array's last element (Lesson 104's own remove-by-swap-with-last trick), and shrinks the count — correct, but genuinely `O(n)` per call, unlike Concept Unit 3's `O(log n)`. `run-sequence` drives both implementations through the *identical* random sequence of operations in lockstep, comparing results at every single `peek-min` and `extract-min` call, not just at the very end.

### Reference Source

No reference counterpart for `pq-min-index`/`pq-peek-min-naive`/`pq-extract-min-naive` — a from-scratch implementation of Concept Unit 2's contract, over Lesson 86's `doubling-append` and Lesson 104's `heap-swap!`, both reused unchanged.

### Files affected

Created: `pq-naive-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile pq-naive-check.scm
1000-step randomized insert/peek/extract-min sequence, heap vs naive: all steps agreed
```

Verified this session — a real, randomized sequence of `1,000` operations, each independently chosen to be an insert, a `peek-min`, or an `extract-min` (falling back to insert whenever the priority queue is currently empty, so `peek-min`/`extract-min` are never called against an empty one), run against both implementations in lockstep: every single `peek-min` and `extract-min` call along the way returned the identical value from both. This is a genuinely stronger check than Lesson 104's own build-everything-then-drain-everything pattern — it exercises realistic, unpredictable, interleaved usage, the actual shape Concept Unit 1 motivated this whole lesson with.

**A small, hand-traceable piece of that same check — `pq-min-index` on the naive array right after the identical three inserts as Concept Unit 3's own example, `(40 10 25)`:**

1. `i = 1`, `best = 0` — compares `vec[1] = 10` against `vec[best] = vec[0] = 40`; `10 < 40` is true, so `best` becomes `1`.
2. `i = 2`, `best = 1` — compares `vec[2] = 25` against `vec[best] = vec[1] = 10`; `25 < 10` is false, so `best` stays `1`.
3. `i = 3 = count` — the loop stops, returning `best = 1`.
4. `(pq-peek-min-naive pq)` reads `vec[1] = 10` — the identical real value Concept Unit 3's heap-backed `pq-peek-min-heap` returned for the identical three inserts, confirmed directly rather than assumed.

### Mechanical Walkthrough

- **`(let ((vec (car pq)) (count (cadr pq))) ...)`** — a reappearance of `let`, `car`, `cadr`; unpacks the same two-element storage shape Lesson 86 and 104 both already used.
- **`(let loop ((i 1) (best 0)) ...)`** — a reappearance of named-let recursion; starts comparing from index `1` since index `0` is already the initial "best so far" by default, needing no comparison against itself.
- **`(if (< (vector-ref vec i) (vector-ref vec best)) i best)`** — a reappearance of `vector-ref` and `<`; the one real comparison per iteration, updating `best` only on a genuine improvement.
- **`(heap-swap! vec best (- count 1))`** in `pq-extract-min-naive` — a reappearance of `heap-swap!` (Lesson 104); moves the found minimum to the array's last slot, so shrinking the count by one is all that's needed to remove it — no shifting of the remaining elements required.
- **`(random 3)`** in `run-sequence` — a reappearance of `random`; picks one of three operations per step, each equally likely, the mechanism that produces genuinely unpredictable, interleaved usage rather than a fixed, hand-chosen pattern.
- **`(or (= op 0) (pq-empty-heap? h))`** — a reappearance of `or`, `=`; forces an insert whenever the randomly chosen operation would otherwise violate `pq-peek-min`/`pq-extract-min`'s own precondition (Concept Unit 2's *requires: non-empty*) — the check exists specifically so the random sequence never accidentally calls an operation outside its contract.
- **The real, exact agreement across all `1,000` steps** — direct, checked confirmation that two implementations built by genuinely different methods (repair-based sifting versus brute-force scanning) satisfy the identical contract indistinguishably from the outside.

### CS Lens

This is Lesson 84's own claim, checked here under a strictly harder test than Lesson 84 itself used: Lesson 84 checked one procedure (`seq-sum`) against both implementations independently; this lesson checks both implementations against *each other*, live, at every step of a single unpredictable sequence — closer to how two real, swappable implementations would actually be compared in practice.

### SE Lens

The alternative to this lesson's naive implementation is to treat Concept Unit 3's heap-backed version as the priority queue, full stop, since it's already faster. The real cost of that alternative is losing a genuinely useful reference point: a simple, obviously-correct-by-inspection implementation is exactly what a more complex one (like a heap) should be checked against, the same role Lesson 79's `merge-sort` checked itself against Guile's own `sort`. The real, measured tradeoff, already established rather than re-derived here: Lesson 104's own numbers show the naive version costing `4.8×` to `209×` more real comparisons as `n` grows from `100` to `10,000` — a real engineering reason to prefer Concept Unit 3's implementation in production, without that reason having to touch a single line of code written against this lesson's own `pq-insert`/`pq-peek-min`/`pq-extract-min` names.

---

## Closing

### Connect the pieces

One named interface, two real implementations, checked against each other under realistic usage:

1. **The gap, named (Unit 1):** Lesson 104 built correct code with no swappable interface around it.
2. **The contract, defined (Unit 2):** four operations, value-ordered rather than insertion-ordered — the direct structural contrast with Lesson 88 and 89's own ADTs.
3. **Implementation one, a thin wrapper (Unit 3):** every procedure delegates entirely to Lesson 104's already-correct code — verified against a real, hand-traceable insert/extract/insert sequence.
4. **Implementation two, and a real, harder check (Unit 4):** a naive linear scan, checked against implementation one across a genuinely unpredictable, interleaved `1,000`-step sequence — every single step agreeing — with Lesson 104's own real cost numbers as the reason the choice between them matters, invisibly to any caller.

Every claim in this lesson traces to real, executed code, including a check strictly stronger than any previous ADT lesson in this curriculum has used: two implementations, compared live, under randomized, interleaved operation order.

### What breaks without this

Suppose a real system were built directly against `heap-insert`/`heap-extract-min`, scattered across dozens of call sites, the way Concept Unit 1 described the current, unnamed state of Lesson 104's own code. If a later engineer needed to swap in a different representation — even one this lesson already built and fully verified, the naive array — every one of those call sites would need to be found and rewritten, with no way to check the rewrite was complete other than re-reading the whole program. Naming the interface first, as this lesson does, means the swap is exactly two `define`s (`make-pq`, and which of the two implementation sets to use) — the actual, real difference Concept Unit 4's check makes visible.

### Exercises

1. **Observe.** Before checking, predict whether `pq-empty-heap?` and `pq-empty-naive?` could share a single, identical definition (rather than two separately-named ones), using this lesson's own storage shape to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, and explain why the ADT contract in Concept Unit 2 doesn't need `pq-empty?` to know or care which implementation it's checking.
3. **Formalize.** Extend `run-sequence` to also call `pq-insert`, `pq-peek-min`, and `pq-extract-min` against a *third* implementation of your own design (a sorted-on-insert array, for instance — expensive to insert into, cheap to extract from), and confirm it agrees with both existing implementations across a real `1,000`-step run.
4. **Explain.** In your own words, explain why `pq-min-index` starts its scan at index `1` rather than index `0`, connecting your answer to what `best` is initialized to.
5. **Explain.** Using Lesson 104's own real numbers, state one real scenario where Exercise 3's sorted-on-insert implementation would be the right engineering choice over both of this lesson's own two — referencing which specific operation it makes cheaper, and which it makes more expensive, relative to a heap.

### Definition of done

- [ ] You can state all four Priority Queue ADT contracts and explain precisely how they differ from Lesson 88's Stack and Lesson 89's Queue contracts.
- [ ] You can explain why Concept Unit 3's wrapper needed no new logic, and why that's a legitimate outcome rather than a sign of missing work.
- [ ] You traced `pq-min-index` by hand on `(40 10 25)` and confirmed it matches this lesson's own real output.
- [ ] You can explain why Concept Unit 4's randomized, interleaved check is a stronger test than separately building and then draining a priority queue.
- [ ] You completed Exercises 1–5, including a genuinely third implementation checked against both of this lesson's own.
- [ ] Commit your Exercise 3 implementation and its real, checked results, with a commit message stating which operations it makes cheaper and which it makes more expensive.
