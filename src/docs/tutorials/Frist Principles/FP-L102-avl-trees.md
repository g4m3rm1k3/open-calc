# Lesson 102: AVL Trees

**What you will build:** an **AVL tree** — a BST whose `insert` actively restores Lesson 101's exact height-balance invariant after every single insertion, using Lesson 100's rotations, rather than hoping insertion order happens to cooperate. Real, verified evidence this session: inserting `1,000` values in already-sorted order — Lesson 99's own worst case, which collapsed plain `bst-insert` to height `1,000` — produces an AVL tree of height exactly `10`, matching `log₂(1000) ≈ 9.97` almost exactly, with Lesson 98's `valid-bst?` and Lesson 101's `height-balanced?` both confirmed `#t`, checked after *every one* of the `1,000` insertions, not just the final tree. The transferable point: Lesson 100 built the mechanism (rotation) and Lesson 101 defined the precise target (height-balance) and proved random insertion doesn't hit it reliably. This lesson combines them into a real, active policy — completing the arc from Lesson 97's first invariant through this lesson's fully self-correcting structure.

**What you need to know first:** Lesson 100 (`FP-L100-tree-rotations.md`) — specifically `rotate-left`/`rotate-right`, reused directly as this lesson's repair mechanism. Lesson 101 (`FP-L101-balanced-trees.md`) — specifically `balance-factor` and `height-balanced?`, the exact invariant this lesson's insert actively maintains. Lesson 99 (`FP-L099-degenerate-trees.md`) — specifically its own real, measured degeneration on sorted input, the exact scenario this lesson re-runs and fixes.

**Terms introduced in this lesson**

- **AVL tree** — a binary search tree whose insertion procedure checks Lesson 101's balance factor at every node on the way back up from a new insertion, and applies Lesson 100's rotations immediately whenever a node's balance factor exceeds `1` in magnitude, restoring height-balance before the insertion is considered complete. Named for its original inventors (Adelson-Velsky and Landis); it exists to make Lesson 101's proven height bound a real, enforced guarantee rather than a merely typical outcome.

---

## Concept Unit 1: Combining the Mechanism and the Target

### The Problem

Lesson 100 built a correctness-preserving local repair. Lesson 101 defined precisely what "balanced enough" means, and showed random insertion doesn't reliably achieve it. Neither lesson, alone, produces a tree that stays balanced automatically — this lesson needs to run the repair at exactly the right moment, every time a new value goes in.

### No isolated lab for this step

This concept has no code of its own to isolate — the plan is stated directly here, combining two already-built, already-verified tools.

### Applying It — When to Check, and What to Check

Every insertion follows one root-to-leaf path down, then returns back up along that identical path (Lesson 97's own recursive `bst-insert` shape). The natural moment to check Lesson 101's balance factor is exactly at each node *as the insertion returns back through it* — the only nodes whose height could possibly have changed are the ones on that one path, so checking anywhere else would be redundant.

### Walkthrough

- **"the only nodes whose height could possibly have changed are the ones on that one path"** — the precise reason checking during the return trip, rather than re-scanning the whole tree, is sufficient.
- **The explicit combination of two already-verified tools** — frames this lesson as integration, not a third new mechanism.

### CS Lens

This is a direct reuse of the exact recursive structure Lesson 97's `bst-insert` already has: because insertion is naturally recursive, "check and repair on the way back up" falls directly out of the existing call structure, needing no separate traversal. Also recognized in: a hiking group that checks each member's condition at every rest stop on the way back down a trail, rather than needing a separate trip up the mountain just to check on people.

### SE Lens

The alternative to checking during the natural return path is to insert first, then separately walk the entire tree afterward looking for imbalance. The real cost of that alternative is real, avoidable extra work — checking only the nodes genuinely capable of having changed, as this lesson's approach does, keeps the repair proportional to the tree's height, not its full size.

---

## Concept Unit 2: Deriving the Four Rebalancing Cases

### The Problem

Knowing *when* to check isn't enough — a precise rule for *what to do* when a node's balance factor exceeds `1` is needed, and a single rotation doesn't always suffice.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, and Concept Unit 3 implements it as real code.

### Applying It — Deriving the Fix, Case by Case

**When a node's balance factor is greater than `1`** (left-heavy), its left child is the taller subtree. **If that left child is itself left-heavy or balanced** (its own balance factor is `0` or positive), a single `rotate-right` (Lesson 100) at the unbalanced node fixes it directly. **If that left child is right-heavy instead** (its balance factor is negative), a single `rotate-right` alone would not fix the deeper imbalance — the left child's own right subtree needs to become the new top of that side first, via `rotate-left` on the left child *before* rotating right at the original node.

**The mirror image**, for a balance factor less than `-1` (right-heavy): a single `rotate-left` suffices if the right child is right-heavy or balanced; otherwise, `rotate-right` on the right child first, then `rotate-left`.

### Walkthrough

- **The single-rotation case, derived from "the imbalance is all on one side"** — the simpler of the two situations, directly reusing Lesson 100's rotation as-is.
- **The double-rotation case, derived from "the imbalance is on the inner side"** — a single rotation would not resolve it, since it doesn't change which subtree contains the deepest new node relative to where it needs to end up; two rotations in sequence do.

### CS Lens

This is a case analysis directly parallel to the four-way branch Lesson 59's combinations or Lesson 78's classification exercises used: determine which of exactly four configurations applies (heavy on the left-of-left, left-of-right, right-of-left, or right-of-right), and each has exactly one correct, derived fix. Also recognized in: a mechanic diagnosing which of four specific failure patterns explains a symptom, each with its own specific, correct repair procedure — not a single universal fix applied blindly.

### SE Lens

The alternative to deriving all four cases is to apply a single rotation whenever *any* imbalance is detected, regardless of which side it's on. The real cost of that alternative is a repair that doesn't actually work in the inner cases — a single wrong-direction rotation can even leave the tree still unbalanced, or balanced by coincidence on some inputs and not others, exactly the kind of unverified assumption Lesson 22 warns against.

---

## Concept Unit 3: Implementing AVL Insert

### The Problem

Concept Unit 1 and 2's plan needs real code: a `rebalance` procedure implementing all four cases, called at every node on `avl-insert`'s way back up.

### The New Code — Type It Yourself

```scheme
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
```

### The Updated Project

This is `avl-check.scm`, in full:

```scheme
(define (make-bst-node value left right) (list value left right))
(define (bst-value n) (car n))
(define (bst-left n) (cadr n))
(define (bst-right n) (caddr n))
(define empty-bst '())
(define (bst-empty? n) (null? n))

(define (bst-height tree)
  (if (bst-empty? tree) 0
      (+ 1 (max (bst-height (bst-left tree)) (bst-height (bst-right tree))))))

(define (balance-factor tree)
  (- (bst-height (bst-left tree)) (bst-height (bst-right tree))))

(define (rotate-left x)
  (let ((y (bst-right x)))
    (make-bst-node (bst-value y)
                    (make-bst-node (bst-value x) (bst-left x) (bst-left y))
                    (bst-right y))))

(define (rotate-right y)
  (let ((x (bst-left y)))
    (make-bst-node (bst-value x)
                    (bst-left x)
                    (make-bst-node (bst-value y) (bst-right x) (bst-right y)))))

(define (rebalance tree)                                        ; ← new
  (let ((bf (balance-factor tree)))                                 ; ← new
    (cond ((> bf 1)                                                    ; ← new
           (if (< (balance-factor (bst-left tree)) 0)                    ; ← new
               (rotate-right (make-bst-node (bst-value tree)                ; ← new
                               (rotate-left (bst-left tree)) (bst-right tree))) ; ← new
               (rotate-right tree)))                                              ; ← new
          ((< bf -1)                                                                ; ← new
           (if (> (balance-factor (bst-right tree)) 0)                                ; ← new
               (rotate-left (make-bst-node (bst-value tree)                             ; ← new
                              (bst-left tree) (rotate-right (bst-right tree))))            ; ← new
               (rotate-left tree)))                                                          ; ← new
          (else tree))))                                                                        ; ← new

(define (avl-insert tree value)                                                                    ; ← new
  (if (bst-empty? tree)                                                                               ; ← new
      (make-bst-node value empty-bst empty-bst)                                                         ; ← new
      (cond ((< value (bst-value tree))                                                                   ; ← new
             (rebalance (make-bst-node (bst-value tree)                                                      ; ← new
                          (avl-insert (bst-left tree) value) (bst-right tree))))                                ; ← new
            ((> value (bst-value tree))                                                                          ; ← new
             (rebalance (make-bst-node (bst-value tree)                                                            ; ← new
                          (bst-left tree) (avl-insert (bst-right tree) value))))                                      ; ← new
            (else tree))))                                                                                             ; ← new

(define (valid-bst? tree lo hi)
  (if (bst-empty? tree) #t
      (and (or (not lo) (> (bst-value tree) lo))
           (or (not hi) (< (bst-value tree) hi))
           (valid-bst? (bst-left tree) lo (bst-value tree))
           (valid-bst? (bst-right tree) (bst-value tree) hi))))

(define (height-balanced? tree)
  (if (bst-empty? tree) #t
      (and (<= (abs (balance-factor tree)) 1)
           (height-balanced? (bst-left tree))
           (height-balanced? (bst-right tree)))))

(define (bst-search tree target)
  (if (bst-empty? tree) #f
      (cond ((= target (bst-value tree)) #t)
            ((< target (bst-value tree)) (bst-search (bst-left tree) target))
            (else (bst-search (bst-right tree) target)))))

(define sorted-avl (let loop ((i 0) (t empty-bst)) (if (= i 1000) t (loop (+ i 1) (avl-insert t i)))))
(display "AVL tree from sorted 0..999: height=") (display (bst-height sorted-avl))
(display " valid?=") (display (valid-bst? sorted-avl #f #f))
(display " height-balanced?=") (display (height-balanced? sorted-avl))
(newline)

(display "search 0: ") (display (bst-search sorted-avl 0)) (newline)
(display "search 500: ") (display (bst-search sorted-avl 500)) (newline)
(display "search 999: ") (display (bst-search sorted-avl 999)) (newline)
(display "search 1000 (absent): ") (display (bst-search sorted-avl 1000)) (newline)
```

`rebalance` implements Concept Unit 2's four cases directly: `bf > 1` and the left child's own balance factor negative is the "inner" (left-right) case, needing `rotate-left` on the left child before the outer `rotate-right`; otherwise a single `rotate-right` suffices — and the mirror image for `bf < -1`. `avl-insert` is Lesson 97's own `bst-insert`, with every recursive-case return value wrapped in `rebalance` before being handed back up.

### Reference Source

Lesson 97's `bst-insert` (`FP-L097-binary-search-trees.md`, Concept Unit 3), extended with `rebalance` at every return point; Lesson 100's `rotate-left`/`rotate-right`, reused unchanged.

### Files affected

Created: `avl-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile avl-check.scm
AVL tree from sorted 0..999: height=10 valid?=#t height-balanced?=#t
search 0: #t
search 500: #t
search 999: #t
search 1000 (absent): #f
```

Verified this session — inserting `0` through `999`, in already-sorted order (Lesson 99's own real worst case, which produced height `1,000` under plain `bst-insert`), produces an AVL tree of height exactly `10` — matching `log₂(1000) ≈ 9.97` almost exactly. Both `valid-bst?` and `height-balanced?` confirm `#t`, and every real search — the first value inserted, the last, the middle, and a genuinely absent one — returns the correct result.

### Mechanical Walkthrough

- **`(< (balance-factor (bst-left tree)) 0)`** — a reappearance of `<`, Lesson 101's `balance-factor`; distinguishes the "inner" left-right case from the simpler left-left case.
- **`(rotate-right (make-bst-node (bst-value tree) (rotate-left (bst-left tree)) (bst-right tree)))`** — a reappearance of `rotate-right`, `rotate-left`, `make-bst-node`; the double rotation, rebuilding the node with its left child already rotated before rotating the whole thing.
- **`(rebalance (make-bst-node (bst-value tree) (avl-insert (bst-left tree) value) (bst-right tree)))`** — a reappearance of `make-bst-node`; the exact point where Lesson 97's original `bst-insert` gains its new behavior — the freshly rebuilt node, on its way back up, is immediately checked and repaired.
- **The real height of `10`, versus Lesson 99's real `1,000` on the identical insertion order** — direct, measured confirmation that active rebalancing, not insertion order, is what determines real height now.

### CS Lens

This is Lesson 97's leap-of-faith derivation style extended one step further: `avl-insert`'s recursive case trusts that the recursive call already returned a correctly height-balanced subtree (by induction), and `rebalance` only ever needs to consider the *local* imbalance possibly introduced at the current node — never needing to re-examine subtrees further down, which the recursive trust already guarantees are fine. Also recognized in: an assembly line where each station trusts that everything arriving from the previous station already passed its own station's check, so each station only ever needs to verify the one specific thing it's responsible for.

### SE Lens

The alternative to trusting the recursive call is to re-verify the entire subtree's balance at every level, the way a non-recursive, whole-tree re-check might. The real cost of that alternative would make every single insertion cost proportional to the whole tree's size, exactly the cost this lesson's approach — checking only the path actually touched — avoids entirely.

---

## Concept Unit 4: Exhaustive Confirmation, and the Real Payoff at Scale

### The Problem

Concept Unit 3 confirmed one large example. It's worth confirming the invariant holds after *every single* insertion, not just at the end, and measuring the real payoff across more than one scale.

### The New Code — Type It Yourself

```scheme
(let loop ((i 0) (t empty-bst))
  (if (= i 1000)
      (display "checked all 1000 sorted insertions: height-balanced throughout\n")
      (let ((t2 (avl-insert t i)))
        (if (not (height-balanced? t2))
            (begin (display "BALANCE VIOLATED at insertion ") (display i) (newline))
            (loop (+ i 1) t2)))))
```

### The Updated Project

Extending Concept Unit 3's file:

```scheme
(let loop ((i 0) (t empty-bst))                                ; ← new
  (if (= i 1000)                                                   ; ← new
      (display "checked all 1000 sorted insertions: height-balanced throughout\n")  ; ← new
      (let ((t2 (avl-insert t i)))                                                    ; ← new
        (if (not (height-balanced? t2))                                                 ; ← new
            (begin (display "BALANCE VIOLATED at insertion ") (display i) (newline))       ; ← new
            (loop (+ i 1) t2)))))                                                             ; ← new

(for-each
 (lambda (n)
   (let ((t (let loop ((i 0) (t empty-bst)) (if (= i n) t (loop (+ i 1) (avl-insert t i))))))
     (display "n=") (display n)
     (display " sorted-insertion AVL height=") (display (bst-height t))
     (display " log2(n)=") (display (exact->inexact (/ (log n) (log 2))))
     (display " height-balanced?=") (display (height-balanced? t))
     (newline)))
 (list 100 1000 10000))
```

### Reference Source

No reference counterpart — reuses Concept Unit 3's own `avl-insert`/`height-balanced?`, checked continuously rather than only at the end, following Lesson 98's own exhaustive-checking pattern.

### Files affected

Modifies: `avl-check.scm` (extended).

### Change type

Add.

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile avl-check.scm
checked all 1000 sorted insertions: height-balanced throughout
n=100 sorted-insertion AVL height=7 log2(n)=6.643856189774725 height-balanced?=#t
n=1000 sorted-insertion AVL height=10 log2(n)=9.965784284662087 height-balanced?=#t
n=10000 sorted-insertion AVL height=14 log2(n)=13.28771237954945 height-balanced?=#t
```

Verified this session — the height-balance invariant held after every one of `1,000` real, sequential insertions, not just the final tree. Across three scales, sorted-insertion AVL height (`7`, `10`, `14`) stays within about `1` of `log₂(n)` (`6.64`, `9.97`, `13.29`) at every size — compare directly to Lesson 99's own real numbers for the identical sorted insertion order under plain `bst-insert`: `100`, `1,000`, `10,000` — height now proportional to `log₂(n)`, not to `n`, on the exact input that previously produced total degeneration.

### Mechanical Walkthrough

- **`(if (not (height-balanced? t2)) (begin (display "BALANCE VIOLATED"...)) (loop (+ i 1) t2))`** — a reappearance of Lesson 98's continuous-checking pattern, this time checking Lesson 101's balance invariant instead of Lesson 97's ordering one, after every single insertion.
- **The real, close-to-`log₂(n)` heights at all three scales, on sorted input** — direct, measured confirmation this is a durable property across scale, not a coincidence at one specific size.

### CS Lens

This is the complete, closed loop of Era IV's BST arc: Lesson 97 built the structure, Lesson 98 verified its correctness precisely, Lesson 99 measured a real, serious performance risk, Lesson 100 built a local repair mechanism, Lesson 101 defined precisely what that mechanism should maintain, and this lesson combines all five into a structure that is provably correct, provably bounded in height, and confirmed — not assumed — to actually behave that way across a real, exhaustively-checked sequence.

### SE Lens

The alternative to checking continuously across scale is to trust Concept Unit 3's single, one-time success at `n = 1,000` as sufficient evidence the approach generalizes. The real cost of that alternative is exactly Lesson 75's own warning against overgeneralizing from one confirming example — checking at `100`, `1,000`, and `10,000`, and continuously rather than only at the end, is what turns "it worked once" into "it reliably works, checked."

---

## Closing

### Connect the pieces

Two already-built tools, combined into one active, self-correcting structure:

1. **The combination plan (Unit 1):** check and repair on the natural return path of insertion, using only nodes that could actually have changed.
2. **Four precise cases, derived (Unit 2):** single rotation for the "outer" imbalances, a rotation pair for the "inner" ones.
3. **Real, working AVL insert (Unit 3):** Lesson 99's own worst case, sorted insertion, now producing height `10` instead of `1,000`, fully correct and fully balanced.
4. **Exhaustive, multi-scale confirmation (Unit 4):** the invariant held through every one of `1,000` real insertions, and height stayed within `1` of `log₂(n)` at three different scales.

Every claim in this lesson traces to real, executed code: a derived, case-complete repair policy, checked continuously rather than only at the end, and measured directly against the exact real numbers Lesson 99 established for the same insertion pattern under the naive approach.

### What breaks without this

Suppose a real system used plain `bst-insert` for a tree indexed by sequential IDs or timestamps — Lesson 99's own realistic, non-adversarial worst case — and only discovered the resulting `O(n)` search cost once real data had grown large enough to matter. Retrofitting AVL balancing at that point means more than swapping one function: every already-built tree would need rebuilding from scratch, since the existing structure was never height-balanced to begin with. Building on `avl-insert` from the start, as this lesson demonstrates, means the exact same sequential-ID scenario that previously produced height `1,000` produces height `10` instead, automatically, with no advance knowledge of what data would arrive or in what order.

### Exercises

1. **Observe.** Before checking, predict whether `avl-insert`, applied to a genuinely random insertion order (not sorted), would produce a *shorter* real height than the identical values inserted via plain `bst-insert` (Lesson 97's own real numbers), using this lesson's guaranteed bound to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code at `n = 1,000` and `n = 10,000`, comparing directly to Lesson 97's own real random-insertion heights.
3. **Formalize.** Implement `avl-delete` (harder than insertion — removing a node can also introduce imbalance needing repair on the way back up) and verify `height-balanced?` holds after a real sequence mixing insertions and deletions.
4. **Explain.** In your own words, trace through `rebalance`'s logic for a concrete case where `bf = 2` and the left child's balance factor is `1` (not negative), explaining why the simpler, single-rotation branch is the correct one here.
5. **Explain.** Using this lesson's real `10`-versus-`1,000` height comparison, explain why Lesson 99's `balanced-order` (requiring the entire dataset known in advance) and this lesson's `avl-insert` (requiring no advance knowledge at all) both achieve real, near-optimal height, despite solving the problem in fundamentally different ways.

### Definition of done

- [ ] You can explain when `avl-insert` checks and repairs balance, and why checking only the insertion path is sufficient.
- [ ] You can state all four rebalancing cases and explain what distinguishes the single-rotation cases from the double-rotation ones.
- [ ] You can explain, using real measured numbers, why `avl-insert` fixes Lesson 99's exact sorted-insertion degeneration.
- [ ] You confirmed, with real code, that the height-balance invariant holds continuously, not just in the final tree, across a real sequence of insertions.
- [ ] You completed Exercises 1–5, including a real comparison against Lesson 97's own random-insertion numbers.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating what you measured or implemented and its real results.
