# Lesson 103: Red-Black Trees

**What you will build:** a real **red-black tree** — a genuinely different invariant from Lesson 101 and 102's strict height-balance, using node coloring instead of a numeric balance factor, verified with the identical rigor: real insertion, continuous invariant checking, and a real height comparison against AVL. Real, verified evidence this session: inserting `0` through `999` in sorted order — Lesson 99's own worst case — produces a red-black tree of real height `15`, comfortably under the derived bound `2 × log₂(1001) ≈ 19.9`, but genuinely taller than the identical data's AVL height of `10` (Lesson 102). The real surprise, checked rather than assumed: counting actual restructuring operations during insertion — the specific claim textbooks often make in AVL's disfavor — shows `985` for red-black versus `990` for AVL on sorted insertion, and `654` versus `671` on random insertion — real numbers, close enough that the commonly-repeated "red-black needs dramatically fewer rotations" claim does not hold up as starkly as expected, for insertion specifically. The transferable point: Lesson 102 built one correct, working answer to "how do you maintain balance automatically." This lesson verifies that it isn't the only one — and that even a well-known, oft-cited trade-off deserves the identical checking discipline this curriculum has applied to everything else since Lesson 22.

**What you need to know first:** Lesson 102 (`FP-L102-avl-trees.md`) — specifically `avl-insert` and its real height numbers, the direct comparison point for everything in this lesson. Lesson 97 (`FP-L097-binary-search-trees.md`) — specifically the BST ordering invariant, which red-black trees also satisfy, unchanged, underneath their own additional coloring rules. Lesson 99 (`FP-L099-degenerate-trees.md`) — specifically the sorted-insertion worst case, reused directly as this lesson's real torture test.

**Terms introduced in this lesson**

- **Red-black tree** — a binary search tree where every node is colored red or black, satisfying three rules: the root is black; no red node has a red child (no two reds in a row along any path); and every path from the root to an empty subtree passes through the identical number of black nodes.
- **Black-height** — the number of black nodes along any root-to-empty-subtree path in a red-black tree. The third rule above guarantees this number is the same no matter which path is walked, which is precisely what makes it a meaningful, single number to talk about.

---

## Concept Unit 1: Is Strict Balance the Only Option?

### The Problem

Lesson 101 and 102's AVL invariant is a strict, numeric rule — every single node's balance factor bounded by exactly `1`. It's worth asking whether that specific strictness is actually necessary for a real, provable height bound, or whether a looser, differently-shaped invariant could also guarantee `O(log n)` height while requiring less enforcement work to maintain.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, contrasting with Lesson 101's own strict definition.

### Applying It — What "Looser but Still Bounded" Would Need

A looser invariant would need to permit *some* real unevenness between subtrees — more than AVL's `1`-node tolerance — while still guaranteeing that unevenness can never compound into Lesson 99's real degeneration. That requires a genuinely different kind of rule, not just a bigger numeric tolerance on the identical balance-factor idea.

### Walkthrough

- **The explicit framing as "genuinely different," not "AVL with a bigger number"** — sets up Concept Unit 2's coloring-based rule as a real alternative in kind, not a minor variation.

### CS Lens

This is a real instance of a common pattern in algorithm design: more than one invariant can guarantee the identical asymptotic property, and choosing between them is a genuine engineering trade-off, not a search for the single "correct" answer. Also recognized in: multiple genuinely different building-code standards, each independently sufficient to guarantee structural safety, differing in exactly what they permit and what they don't.

### SE Lens

The alternative to seeking a second approach is to treat AVL's strict rule as the only viable way to bound tree height, closing off a real trade-off space worth understanding.

---

## Concept Unit 2: Deriving the Red-Black Invariant

### The Problem

Concept Unit 1's requirement needs a real, precise rule — Lesson 97's format for stating an invariant, applied to a genuinely different mechanism than a numeric balance factor.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below, and Concept Unit 3 checks it as real code.

### Applying It — Three Rules, One New Idea

**Every node is colored red or black.** **The root is always black.** **No red node has a red child** — two reds never appear consecutively along any path. **Every root-to-empty-subtree path passes through the identical number of black nodes** — its black-height.

**Why this bounds height, in outline:** the "no two reds in a row" rule means red nodes can never make up more than half of any path — at minimum, every red node is immediately followed by a black one. Combined with every path sharing the identical black-height, the *longest* possible path (alternating black-red-black-red as much as the rules allow) can be at most roughly twice as long as the *shortest* possible path (all black, no red at all) — a real, provable bound, derived from a completely different mechanism than AVL's per-node numeric comparison.

### Walkthrough

- **The three rules, stated precisely** — color, root color, and the two path-based constraints — none of which mention a numeric balance factor at all.
- **The outline bound, "roughly twice as long"** — previews Concept Unit 4's real, checked bound before any code exists.

### CS Lens

This is balance enforced through a completely different lens than AVL's: instead of measuring and comparing subtree heights directly at every node, red-black trees encode a bound *structurally*, through a coloring rule that never requires computing or storing a height at all. Also recognized in: a company enforcing a maximum reporting-chain length not by measuring each chain's exact length, but by a structural rule ("no manager may report to another manager of the identical seniority tier without an intervening senior tier") that provably bounds the chain length as a side effect.

### SE Lens

The alternative to deriving a fundamentally different rule is to treat "some kind of local balance rule" as interchangeable, without appreciating that AVL's numeric comparison and red-black's structural coloring are solving the identical problem through genuinely different mechanisms, with genuinely different real costs to maintain — exactly what Concept Unit 4 measures rather than assumes.

---

## Concept Unit 3: Implementing and Verifying a Real Red-Black Tree

### The Problem

Concept Unit 2's three rules need real code: an `insert` that maintains them, and a checker confirming they hold.

### The New Code — Type It Yourself

```scheme
(define (balance color a x b)
  (cond
    ((and (eq? color 'black) (not (rb-empty? a)) (eq? (rb-color a) 'red)
          (not (rb-empty? (rb-left a))) (eq? (rb-color-of (rb-left a)) 'red))
     (make-node 'red
                (make-node 'black (rb-left (rb-left a)) (rb-value (rb-left a)) (rb-right (rb-left a)))
                (rb-value a)
                (make-node 'black (rb-right a) x b)))
    (else (make-node color a x b))))
```

### The Updated Project

This is `rb-check.scm`, in full (the complete `balance`, handling all four possible red-red configurations, is shown in full below):

```scheme
(define (make-node color left value right) (list color left value right))
(define (rb-color n) (car n))
(define (rb-left n) (cadr n))
(define (rb-value n) (caddr n))
(define (rb-right n) (cadddr n))
(define empty-rb '())
(define (rb-empty? n) (null? n))
(define (rb-color-of n) (if (rb-empty? n) 'black (rb-color n)))

(define (balance color a x b)                                   ; ← new
  (cond
    ;; left child red, left-left grandchild red
    ((and (eq? color 'black) (not (rb-empty? a)) (eq? (rb-color a) 'red)
          (not (rb-empty? (rb-left a))) (eq? (rb-color-of (rb-left a)) 'red))
     (make-node 'red
                (make-node 'black (rb-left (rb-left a)) (rb-value (rb-left a)) (rb-right (rb-left a)))
                (rb-value a)
                (make-node 'black (rb-right a) x b)))
    ;; left child red, left-right grandchild red
    ((and (eq? color 'black) (not (rb-empty? a)) (eq? (rb-color a) 'red)
          (not (rb-empty? (rb-right a))) (eq? (rb-color-of (rb-right a)) 'red))
     (make-node 'red
                (make-node 'black (rb-left a) (rb-value a) (rb-left (rb-right a)))
                (rb-value (rb-right a))
                (make-node 'black (rb-right (rb-right a)) x b)))
    ;; right child red, right-left grandchild red
    ((and (eq? color 'black) (not (rb-empty? b)) (eq? (rb-color b) 'red)
          (not (rb-empty? (rb-left b))) (eq? (rb-color-of (rb-left b)) 'red))
     (make-node 'red
                (make-node 'black a x (rb-left (rb-left b)))
                (rb-value (rb-left b))
                (make-node 'black (rb-right (rb-left b)) (rb-value b) (rb-right b))))
    ;; right child red, right-right grandchild red
    ((and (eq? color 'black) (not (rb-empty? b)) (eq? (rb-color b) 'red)
          (not (rb-empty? (rb-right b))) (eq? (rb-color-of (rb-right b)) 'red))
     (make-node 'red
                (make-node 'black a x (rb-left b))
                (rb-value b)
                (make-node 'black (rb-left (rb-right b)) (rb-value (rb-right b)) (rb-right (rb-right b)))))
    (else (make-node color a x b))))

(define (ins x tree)
  (if (rb-empty? tree)
      (make-node 'red empty-rb x empty-rb)
      (let ((color (rb-color tree)) (a (rb-left tree)) (y (rb-value tree)) (b (rb-right tree)))
        (cond ((< x y) (balance color (ins x a) y b))
              ((> x y) (balance color a y (ins x b)))
              (else tree)))))

(define (make-black tree) (make-node 'black (rb-left tree) (rb-value tree) (rb-right tree)))
(define (rb-insert x tree) (make-black (ins x tree)))

(define (rb-height tree)
  (if (rb-empty? tree) 0 (+ 1 (max (rb-height (rb-left tree)) (rb-height (rb-right tree))))))

(define (check-rb tree)
  (if (rb-empty? tree)
      1
      (let ((left-bh (check-rb (rb-left tree))) (right-bh (check-rb (rb-right tree))))
        (cond ((or (not left-bh) (not right-bh)) #f)
              ((not (= left-bh right-bh)) #f)
              ((and (eq? (rb-color tree) 'red)
                    (or (eq? (rb-color-of (rb-left tree)) 'red)
                        (eq? (rb-color-of (rb-right tree)) 'red)))
               #f)
              (else (+ left-bh (if (eq? (rb-color tree) 'black) 1 0)))))))

(define (rb-valid? tree) (and (eq? (rb-color-of tree) 'black) (if (check-rb tree) #t #f)))

(define (rb-search tree target)
  (if (rb-empty? tree) #f
      (cond ((= target (rb-value tree)) #t)
            ((< target (rb-value tree)) (rb-search (rb-left tree) target))
            (else (rb-search (rb-right tree) target)))))

(define sorted-rb (let loop ((i 0) (t empty-rb)) (if (= i 1000) t (loop (+ i 1) (rb-insert i t)))))
(display "RB tree from sorted 0..999: height=") (display (rb-height sorted-rb))
(display " valid?=") (display (rb-valid? sorted-rb))
(newline)
(display "search 0: ") (display (rb-search sorted-rb 0)) (newline)
(display "search 500: ") (display (rb-search sorted-rb 500)) (newline)
(display "search 999: ") (display (rb-search sorted-rb 999)) (newline)
(display "search 1000 (absent): ") (display (rb-search sorted-rb 1000)) (newline)

(let loop ((i 0) (t empty-rb))
  (if (= i 1000)
      (display "checked all 1000 sorted insertions: rb-valid throughout\n")
      (let ((t2 (rb-insert i t)))
        (if (not (rb-valid? t2))
            (begin (display "RB INVARIANT VIOLATED at insertion ") (display i) (newline))
            (loop (+ i 1) t2)))))
```

`balance` checks all four possible places a red-red violation could appear after an insertion — left-left, left-right, right-left, right-right — and, in every case, produces the identical resulting shape: the offending three nodes rearranged into one red node with two black children. When none of the four patterns match, the `else` clause leaves the node completely unchanged. `ins` inserts a new node as red (the choice that can only ever violate the "no red-red" rule, never the black-height rule, since a red node doesn't change any path's black count) and calls `balance` on every return; `rb-insert` forces the final root black afterward, restoring rule one unconditionally.

### Reference Source

No reference counterpart — a from-scratch implementation of Concept Unit 2's three rules, following a well-known technique (Okasaki's unified balancing function) for combining all four rebalancing cases into one shared, structurally-identical rewrite.

### Files affected

Created: `rb-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile rb-check.scm
RB tree from sorted 0..999: height=15 valid?=#t
search 0: #t
search 500: #t
search 999: #t
search 1000 (absent): #f
checked all 1000 sorted insertions: rb-valid throughout
```

Verified this session — inserting `0` through `999` in sorted order (Lesson 99's real worst case for plain `bst-insert`, and Lesson 102's own AVL torture test) produces a real height of `15`, with `rb-valid?` confirming all three of Concept Unit 2's rules hold — checked not just on the final tree, but after every single one of the `1,000` real insertions individually. All four real searches — first, middle, last, and genuinely absent — return correctly.

### Mechanical Walkthrough

- **`(eq? color 'black)`** — first appearance of `eq?` used for a symbol comparison in this lesson's own code (already established generally); checks the current node is black, since `balance` should only ever fire when the *parent* of a potential red-red pair is black — a red parent would itself already be a violation caught one level up.
- **The four `cond` clauses, one per configuration** — a reappearance of `cond`; each clause checks one of the four places a red-red pair could appear, relative to the node currently being rebuilt.
- **`(make-node 'red (make-node 'black ...) ... (make-node 'black ...))`** — the shared repair shape common to all four cases: the middle of the three affected values becomes red with two black children, regardless of which of the four configurations triggered it.
- **`(make-node 'red empty-rb x empty-rb)`** in `ins`'s base case — a new node is always inserted red, the specific choice that means only rule two (no red-red) can ever be freshly violated by an insertion, never rule three (black-height).
- **The real, exact match between predicted and confirmed behavior across `1,000` real insertions** — direct, checked confirmation the unified `balance` function correctly handles every case that actually arose, not just the cases it was designed for in the abstract.

### CS Lens

This is a genuinely different mechanism achieving Lesson 101's original goal: instead of AVL's "measure heights, compare, rotate if needed," red-black maintains its invariant by pattern-matching a small, fixed set of local shapes and rewriting them — no height computation anywhere in `balance` or `ins` at all.

### SE Lens

The alternative to implementing all four cases as one shared rewrite is to write four separate, case-specific rotation sequences, the way a more traditional imperative implementation often does. The real cost of that alternative is four times the code to get right and verify; expressing all four as the identical rewrite pattern, as this unit's `balance` does, is what keeps the real, checkable surface area small.

---

## Concept Unit 4: A Real, Honest Comparison — Height and Rotation Count

### The Problem

Concept Unit 3 built a working red-black tree. It's worth comparing it honestly against Lesson 102's AVL tree on two real, separate claims often made together: that red-black trees are typically taller, and that they need fewer restructuring operations during insertion — checking both rather than assuming either.

### The New Code — Type It Yourself

```scheme
(define restructure-count 0)
(define (balance-counted color a x b)
  (cond
    ((and (eq? color 'black) (not (rb-empty? a)) (eq? (rb-color a) 'red)
          (not (rb-empty? (rb-left a))) (eq? (rb-color-of (rb-left a)) 'red))
     (set! restructure-count (+ restructure-count 1))
     (make-node 'red (make-node 'black (rb-left (rb-left a)) (rb-value (rb-left a)) (rb-right (rb-left a)))
                (rb-value a) (make-node 'black (rb-right a) x b)))
    (else (make-node color a x b))))
```

### The Updated Project

This is `rb-cost.scm`, in full — extending Concept Unit 3's file with height comparison and a counted copy of `balance`:

```scheme
(for-each
 (lambda (n)
   (let ((t (let loop ((i 0) (t empty-rb)) (if (= i n) t (loop (+ i 1) (rb-insert i t))))))
     (display "n=") (display n)
     (display " RB height=") (display (rb-height t))
     (display " log2(n)=") (display (exact->inexact (/ (log n) (log 2))))
     (display " 2*log2(n+1)=") (display (exact->inexact (* 2 (/ (log (+ n 1)) (log 2)))))
     (newline)))
 (list 100 1000 10000))

(define restructure-count 0)                                    ; ← new
(define (balance-counted color a x b)                              ; ← new
  (cond
    ((and (eq? color 'black) (not (rb-empty? a)) (eq? (rb-color a) 'red)
          (not (rb-empty? (rb-left a))) (eq? (rb-color-of (rb-left a)) 'red))
     (set! restructure-count (+ restructure-count 1))
     (make-node 'red (make-node 'black (rb-left (rb-left a)) (rb-value (rb-left a)) (rb-right (rb-left a)))
                (rb-value a) (make-node 'black (rb-right a) x b)))
    ((and (eq? color 'black) (not (rb-empty? a)) (eq? (rb-color a) 'red)
          (not (rb-empty? (rb-right a))) (eq? (rb-color-of (rb-right a)) 'red))
     (set! restructure-count (+ restructure-count 1))
     (make-node 'red (make-node 'black (rb-left a) (rb-value a) (rb-left (rb-right a)))
                (rb-value (rb-right a)) (make-node 'black (rb-right (rb-right a)) x b)))
    ((and (eq? color 'black) (not (rb-empty? b)) (eq? (rb-color b) 'red)
          (not (rb-empty? (rb-left b))) (eq? (rb-color-of (rb-left b)) 'red))
     (set! restructure-count (+ restructure-count 1))
     (make-node 'red (make-node 'black a x (rb-left (rb-left b))) (rb-value (rb-left b))
                (make-node 'black (rb-right (rb-left b)) (rb-value b) (rb-right b))))
    ((and (eq? color 'black) (not (rb-empty? b)) (eq? (rb-color b) 'red)
          (not (rb-empty? (rb-right b))) (eq? (rb-color-of (rb-right b)) 'red))
     (set! restructure-count (+ restructure-count 1))
     (make-node 'red (make-node 'black a x (rb-left b)) (rb-value b)
                (make-node 'black (rb-left (rb-right b)) (rb-value (rb-right b)) (rb-right (rb-right b)))))
    (else (make-node color a x b))))                                ; ← new

(define (ins-counted x tree)                                          ; ← new
  (if (rb-empty? tree)
      (make-node 'red empty-rb x empty-rb)
      (let ((color (rb-color tree)) (a (rb-left tree)) (y (rb-value tree)) (b (rb-right tree)))
        (cond ((< x y) (balance-counted color (ins-counted x a) y b))
              ((> x y) (balance-counted color a y (ins-counted x b)))
              (else tree)))))
(define (rb-insert-counted x tree) (make-black (ins-counted x tree)))    ; ← new

(define (shuffled-list n)
  (map cdr (sort (map (lambda (x) (cons (random 1000000) x)) (iota n))
                 (lambda (a b) (< (car a) (car b))))))

(set! restructure-count 0)
(let loop ((i 0) (t empty-rb)) (if (< i 1000) (loop (+ i 1) (rb-insert-counted i t))))
(display "RB real restructuring events across 1000 sorted insertions: ") (display restructure-count) (newline)

(set! restructure-count 0)
(let ((vals (shuffled-list 1000)))
  (let loop ((vs vals) (t empty-rb)) (if (not (null? vs)) (loop (cdr vs) (rb-insert-counted (car vs) t)))))
(display "RB real restructuring events across 1000 RANDOM insertions: ") (display restructure-count) (newline)
```

`balance-counted` mirrors `balance` exactly, adding `(set! restructure-count (+ restructure-count 1))` inside each of the four real-rewrite branches, leaving the `else` (no change) branch uncounted — the identical instrumentation technique as Lesson 31's `call-count`, applied here to count real structural rewrites rather than calls.

For the AVL side of the comparison, this is `avl-cost.scm`, in full — Lesson 102's own `bst-height`, `balance-factor`, `rotate-left`/`rotate-right`, `rebalance`, and `avl-insert`, unchanged, with counting added to both rotation procedures:

```scheme
(define (make-bst-node value left right) (list value left right))
(define (bst-value n) (car n))
(define (bst-left n) (cadr n))
(define (bst-right n) (caddr n))
(define empty-bst '())
(define (bst-empty? n) (null? n))
(define (bst-height tree)
  (if (bst-empty? tree) 0 (+ 1 (max (bst-height (bst-left tree)) (bst-height (bst-right tree))))))
(define (balance-factor tree) (- (bst-height (bst-left tree)) (bst-height (bst-right tree))))

(define avl-rotation-count 0)                                    ; ← new
(define (rotate-left x)
  (set! avl-rotation-count (+ avl-rotation-count 1))                ; ← new
  (let ((y (bst-right x)))
    (make-bst-node (bst-value y) (make-bst-node (bst-value x) (bst-left x) (bst-left y)) (bst-right y))))
(define (rotate-right y)
  (set! avl-rotation-count (+ avl-rotation-count 1))                ; ← new
  (let ((x (bst-left y)))
    (make-bst-node (bst-value x) (bst-left x) (make-bst-node (bst-value y) (bst-right x) (bst-right y)))))

(define (rebalance tree)
  (let ((bf (balance-factor tree)))
    (cond ((> bf 1)
           (if (< (balance-factor (bst-left tree)) 0)
               (rotate-right (make-bst-node (bst-value tree) (rotate-left (bst-left tree)) (bst-right tree)))
               (rotate-right tree)))
          ((< bf -1)
           (if (> (balance-factor (bst-right tree)) 0)
               (rotate-left (make-bst-node (bst-value tree) (bst-left tree) (rotate-right (bst-right tree))))
               (rotate-left tree)))
          (else tree))))

(define (avl-insert tree value)
  (if (bst-empty? tree)
      (make-bst-node value empty-bst empty-bst)
      (cond ((< value (bst-value tree))
             (rebalance (make-bst-node (bst-value tree) (avl-insert (bst-left tree) value) (bst-right tree))))
            ((> value (bst-value tree))
             (rebalance (make-bst-node (bst-value tree) (bst-left tree) (avl-insert (bst-right tree) value))))
            (else tree))))

(define (shuffled-list n)
  (map cdr (sort (map (lambda (x) (cons (random 1000000) x)) (iota n))
                 (lambda (a b) (< (car a) (car b))))))

(set! avl-rotation-count 0)
(let loop ((i 0) (t empty-bst)) (if (< i 1000) (loop (+ i 1) (avl-insert t i))))
(display "AVL real rotations across 1000 sorted insertions: ") (display avl-rotation-count) (newline)

(set! avl-rotation-count 0)
(let ((vals (shuffled-list 1000)))
  (let loop ((vs vals) (t empty-bst)) (if (not (null? vs)) (loop (cdr vs) (avl-insert t (car vs))))))
(display "AVL real rotations across 1000 RANDOM insertions: ") (display avl-rotation-count) (newline)
```

### Reference Source

Lesson 102's `avl-insert` (`FP-L102-avl-trees.md`, Concept Unit 3), instrumented identically for the comparison point below (counting real `rotate-left`/`rotate-right` calls), to make the comparison fair — both counted using the same technique, on the identical real input sequences.

### Files affected

Created: `rb-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

**Real height, sorted insertion, RB versus AVL (Lesson 102's own numbers):**

```
$ guile rb-cost.scm
n=100 RB height=9 log2(n)=6.643856189774725 2*log2(n+1)=13.316422965503591
n=1000 RB height=15 log2(n)=9.965784284662087 2*log2(n+1)=19.934452517671986
n=10000 RB height=18 log2(n)=13.28771237954945 2*log2(n+1)=26.57571328368109
RB real restructuring events across 1000 sorted insertions: 985
RB real restructuring events across 1000 RANDOM insertions: 654
```

Verified this session — RB height (`9`, `15`, `18`) stays comfortably under the derived `2 × log₂(n+1)` bound at every scale, and is genuinely, measurably taller than Lesson 102's own AVL numbers for the identical sorted insertion (`7`, `10`, `14`) — the real, confirmed cost of red-black's looser invariant.

**The AVL side of the comparison — Lesson 102's own `avl-insert`, with the identical counting technique added to `rotate-left`/`rotate-right`:**

```
$ guile avl-cost.scm
AVL real rotations across 1000 sorted insertions: 990
AVL real rotations across 1000 RANDOM insertions: 671
```

**The full, honest comparison, both trees, both insertion patterns, on the identical `1,000` values:**

```
RB real restructuring events across 1000 sorted insertions: 985
AVL real rotations across 1000 sorted insertions: 990
RB real restructuring events across 1000 RANDOM insertions: 654
AVL real rotations across 1000 RANDOM insertions: 671
```

**The honest surprise:** red-black needs *fewer* real restructuring events than AVL in both patterns tested — `985` versus `990` (sorted), `654` versus `671` (random) — confirming the general *direction* of the commonly-cited trade-off. But the *size* of the real gap is far smaller than the dramatic difference often implied — a few percent, not a large multiple. **Naming why honestly:** the frequently-repeated claim that "red-black needs dramatically fewer rotations" is more precisely a claim about *worst-case bounds per single operation* (red-black insertion needs at most one rotation event, plus possibly a chain of recoloring; AVL can, in rarer cases, cascade further) — it is not, on this real evidence, a claim that red-black trees need dramatically fewer restructurings *summed across a whole realistic insertion sequence*. Checking the specific real numbers, rather than repeating the commonly-cited version of the claim, is what caught the difference between the two.

### Mechanical Walkthrough

- **`(set! restructure-count (+ restructure-count 1))` inside each matching branch only** — a reappearance of `set!`; counts genuine rewrites, not every call to `balance-counted`, exactly the same discipline as Lesson 92's `count-collisions` counting only genuine collisions.
- **The real, close restructuring counts across both algorithms and both insertion patterns** — direct, measured evidence, checked rather than assumed, of exactly how large a commonly-cited trade-off actually is in practice.

### CS Lens

This is Lesson 22's evidence discipline applied to a claim from outside this curriculum entirely — a widely-repeated fact about two well-known algorithms, checked here with real, executed code rather than accepted on authority. The real result — the *direction* of the trade-off holds, the *magnitude* is smaller than commonly implied — is exactly the kind of nuance that only checking, rather than citing, can surface.

### SE Lens

The alternative to measuring both real numbers is to state the standard textbook comparison (red-black favors insertion-heavy workloads with fewer rotations; AVL favors search-heavy workloads with tighter height) as received fact. The real cost of that alternative, for someone making an actual engineering decision based on it, is over-trusting a claim whose real magnitude, at least for pure insertion sequences, turns out to be much smaller than the folklore version suggests — exactly the gap this lesson's real measurement closes.

---

## Closing

### Connect the pieces

One different invariant, implemented, verified, and honestly compared:

1. **A genuinely different rule sought (Unit 1):** not a looser numeric tolerance, but a structurally different mechanism.
2. **Red-black's three rules, derived (Unit 2):** coloring, no red-red, equal black-height — bounding height without ever computing one directly.
3. **Real insertion, built and verified (Unit 3):** one unified `balance` rewrite handling all four cases, checked continuously across `1,000` real insertions.
4. **An honest, checked comparison (Unit 4):** real height confirms red-black is genuinely taller than AVL; real restructuring counts confirm the commonly-cited "fewer rotations" claim's *direction* but not its often-implied *magnitude*.

Every claim in this lesson traces to real, executed code — including, distinctively, a widely-repeated claim from outside this curriculum, checked with the identical rigor as everything built inside it.

### What breaks without this

Suppose an engineer chose a data structure for a real, insertion-heavy system based on the commonly-repeated claim that red-black trees need "far fewer" rotations than AVL trees, expecting a correspondingly large real performance advantage. This lesson's real measurement — a few percent difference, not a large multiple — shows that expectation would likely go unmet, for insertion specifically; whatever real performance difference such a system observed would need a different explanation, since the assumed cause doesn't hold up at the measured magnitude. Checking a widely-cited claim directly, as this lesson does, is what would have caught the mismatch between folklore and reality before it shaped a real design decision.

### Exercises

1. **Observe.** Before checking, predict whether the gap between RB and AVL restructuring counts would grow, shrink, or stay proportionally similar at `n = 10,000`, using this lesson's `n = 1,000` real numbers.
2. **Formalize.** Confirm your Exercise 1 prediction with real code at `n = 10,000`, for both sorted and random insertion.
3. **Formalize.** Measure the real *maximum* number of restructuring events triggered by any *single* insertion (not summed across the whole sequence) for both RB and AVL, across the same `1,000`-value sequences — the specific per-operation bound the textbook claim is more precisely about.
4. **Explain.** In your own words, explain why inserting a new node as red, specifically, guarantees only rule two (no red-red) can be freshly violated, never rule three (equal black-height), referencing what a red node does and doesn't contribute to a path's black count.
5. **Explain.** Using this lesson's real numbers and Lesson 102's, state one concrete, real scenario where AVL's tighter height bound would matter more than red-black's real restructuring-count difference, and one where the reverse might be true.

### Definition of done

- [ ] You can state red-black's three invariant rules and explain why "no red-red" and "equal black-height" together bound height.
- [ ] You can trace `balance`'s four cases and explain why all four produce the identical resulting shape.
- [ ] You can explain why inserting new nodes as red is a deliberate, load-bearing choice, not an arbitrary one.
- [ ] You checked a commonly-cited claim (fewer rotations) with real code and can state precisely how your real result compares to the commonly-repeated version.
- [ ] You completed Exercise 3, measuring the real per-operation maximum rather than only the summed total.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the scale you tested and your real, measured results.
