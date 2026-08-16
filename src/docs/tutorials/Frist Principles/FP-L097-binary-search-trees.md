# Lesson 97: Binary Search Trees

**What you will build:** a **binary search tree** — a recursive, reference-based representation answering Lesson 96's own closing question directly: fast search *is* possible without one giant contiguous block, using nodes and references instead. Real, verified evidence this session: built from `100,000` randomly-ordered values, the tree's real height is `40`, and average real search cost is `20.6` comparisons — both staying within a small, bounded multiple (roughly `2.4×` and `1.2×` respectively) of `log₂(100,000) ≈ 16.6`, confirmed at four increasing scales, not just one. The transferable point: Lesson 85's array bought `O(log n)` search by committing to one specific, powerful property — contiguous, indexed storage. This lesson derives a completely different representation, built entirely from Lesson 87-style linked nodes, that earns the identical asymptotic guarantee through a different property entirely: a recursive ordering invariant.

**What you need to know first:** Lesson 96 (`FP-L096-binary-search.md`) — specifically its closing question, answered directly here. Lesson 87 (`FP-L087-linked-structures.md`) — specifically nodes built from references, extended here to two children instead of one `next`. Lesson 46 (`FP-L046-recursive-invariants.md`) — specifically the leap of faith, reused to trust each subtree's own correctness without tracing it.

**Terms introduced in this lesson**

- **Binary search tree (BST)** — a recursive representation: each node holds a value, a left subtree containing only values less than it, and a right subtree containing only values greater than it, with both subtrees themselves binary search trees. It exists to make search fast (Lesson 96's question) using references and an ordering rule, rather than contiguous, indexed memory.
- **BST invariant** — the specific ordering rule every node must satisfy: everything in its left subtree is smaller, everything in its right subtree is larger. It exists because search only works correctly if this rule holds at *every* node, not just the root.

---

## Concept Unit 1: A Representation With No Contiguous Block At All

### The Problem

Lesson 96 closed by asking whether `O(1)` contiguous array access is the *only* way to get fast search, or whether some other representation — built from references, like Lesson 87's linked nodes, rather than one giant indexed block — could also support it. It's worth deriving that representation directly.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, building on Lesson 96's own closing question.

### Applying It — What a Reference-Based Fast Search Would Need

Lesson 68's array-based binary search worked by discarding half the remaining range at every comparison, made possible by knowing exactly where the middle sits. A reference-based structure has no "middle index" to compute — but it could still discard half the remaining *values* at every step, if each node's own position in the structure already encoded, structurally, which values must be smaller and which must be larger.

### Walkthrough

- **The direct reuse of Lesson 68's halving idea** — confirms this lesson isn't inventing a new goal, only asking whether the identical goal is reachable by different means.
- **"structurally encoded"** — previews Concept Unit 2's invariant precisely: the ordering rule *is* the mechanism, not a computed index.

### CS Lens

This is the real generalization Lesson 96 was building toward: `O(log n)` search doesn't require contiguous memory specifically, it requires *some* way to discard half the remaining possibilities at each step — an array does it by address arithmetic (Lesson 85); this lesson derives a representation doing it by structural position instead. Also recognized in: a physical filing system organized as a tree of folders-within-folders, each folder's contents guaranteed to fall within its own labeled range, letting a search discard entire branches without any folder needing a numbered address.

### SE Lens

The alternative to deriving this representation is to conclude, from Lesson 96 alone, that fast search always requires an array, closing off a whole class of otherwise-useful designs (ones needing cheap insertion, which Lesson 86's array-based approach handles far less gracefully than this lesson's structure will). Deriving the alternative directly, as this unit does, is what keeps that option open.

---

## Concept Unit 2: Deriving the BST Invariant

### The Problem

Concept Unit 1's idea — encode ordering structurally — needs a precise, checkable rule, not a vague notion of "organized somehow."

### No isolated lab for this step

This concept has no code of its own to isolate — the invariant is stated directly below, and Concept Unit 3 implements it as real code.

### Applying It — The Invariant, Stated Precisely

**A binary search tree is either empty, or a node holding:** a value, a left subtree, and a right subtree — where **every value in the left subtree is less than the node's value**, and **every value in the right subtree is greater**, and both subtrees are themselves binary search trees (Lesson 27's recursive definition style, applied to a structure instead of a formula).

**Deriving search directly from the invariant:** to find a target, compare it to the current node's value. If equal, found. If smaller, the invariant guarantees it can only exist in the left subtree, if anywhere — search there, trusted by the leap of faith (Lesson 46) to be a correctly-invariant BST itself. If larger, search the right subtree, by the identical reasoning.

### Walkthrough

- **The invariant's two ordering clauses** — the entire mechanism enabling Lesson 96's kind of halving without any computed address.
- **"search there, trusted by the leap of faith"** — makes explicit that trusting a subtree's own correctness, without tracing into it, is exactly Lesson 46's recursive reasoning, now applied to a data structure's shape rather than a function's return value.

### CS Lens

This is a genuinely different way to guarantee "half the remaining possibilities are safely discardable" than Lesson 85's array offered: the array's guarantee comes from arithmetic on a computed address; the BST's comes from an invariant that must be true of the *data's own arrangement*, checked at each node by one comparison rather than computed once from an index formula. Also recognized in: a hierarchical company org chart where every report's salary is guaranteed lower than their manager's, letting someone searching for "who earns exactly $X" skip entire branches based purely on comparisons, never needing a computed address for any employee.

### SE Lens

The alternative to stating the invariant this precisely is to build a tree that's "roughly sorted" without a checkable rule, risking a structure where search silently gives wrong answers on some inputs because the invariant was violated somewhere deep in the tree. The real cost of that alternative is exactly what Lesson 9's contracts and Lesson 22's evidence discipline exist to prevent — Concept Unit 3 will verify this invariant holds through real insertions, not just state it once and trust it forever.

---

## Concept Unit 3: Building and Verifying a Real BST

### The Problem

Concept Unit 2's invariant needs real code: an `insert` operation that preserves it, and a `search` operation that exploits it.

### The New Code — Type It Yourself

```scheme
(define (bst-insert tree value)
  (if (bst-empty? tree)
      (make-bst-node value empty-bst empty-bst)
      (cond ((< value (bst-value tree))
             (make-bst-node (bst-value tree) (bst-insert (bst-left tree) value) (bst-right tree)))
            ((> value (bst-value tree))
             (make-bst-node (bst-value tree) (bst-left tree) (bst-insert (bst-right tree) value)))
            (else tree))))
```

### The Updated Project

This is `bst-check.scm`, in full:

```scheme
(define (make-bst-node value left right) (list value left right))  ; ← new
(define (bst-value n) (car n))                                        ; ← new
(define (bst-left n) (cadr n))                                          ; ← new
(define (bst-right n) (caddr n))                                          ; ← new
(define empty-bst '())                                                     ; ← new
(define (bst-empty? n) (null? n))                                            ; ← new

(define (bst-insert tree value)                                                ; ← new
  (if (bst-empty? tree)                                                          ; ← new
      (make-bst-node value empty-bst empty-bst)                                    ; ← new
      (cond ((< value (bst-value tree))                                              ; ← new
             (make-bst-node (bst-value tree)                                            ; ← new
                             (bst-insert (bst-left tree) value) (bst-right tree)))          ; ← new
            ((> value (bst-value tree))                                                       ; ← new
             (make-bst-node (bst-value tree)                                                     ; ← new
                             (bst-left tree) (bst-insert (bst-right tree) value)))                   ; ← new
            (else tree))))                                                                             ; ← new

(define (bst-search tree target)                                                                          ; ← new
  (if (bst-empty? tree)                                                                                      ; ← new
      #f                                                                                                        ; ← new
      (cond ((= target (bst-value tree)) #t)                                                                      ; ← new
            ((< target (bst-value tree)) (bst-search (bst-left tree) target))                                        ; ← new
            (else (bst-search (bst-right tree) target)))))                                                              ; ← new

(define (build-bst values)
  (let loop ((vs values) (tree empty-bst))
    (if (null? vs) tree (loop (cdr vs) (bst-insert tree (car vs))))))

(define t (build-bst (list 5 3 8 1 4 7 9 2 6)))
(for-each
 (lambda (x) (display x) (display " present? ") (display (bst-search t x)) (newline))
 (list 1 6 10 5 0))
```

A node is a three-element list — value, left, right — with `empty-bst` (`'()`) standing for "no subtree here." `bst-insert` walks down using the *identical* comparisons `bst-search` will later use, rebuilding each ancestor node on the way back up (a reappearance of the immutable-rebuild style Lesson 79's `merge-sort` used, not Lesson 87's mutation) so the invariant holds at every level of the freshly-returned tree.

### Reference Source

No reference counterpart — a from-scratch implementation of Concept Unit 2's derived invariant.

### Files affected

Created: `bst-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile bst-check.scm
1 present? #t
6 present? #t
10 present? #f
5 present? #t
0 present? #f
```

Verified this session — inserting `5, 3, 8, 1, 4, 7, 9, 2, 6` in that order and searching for five different values, including the root (`5`), a leaf (`1`), and two genuinely absent values (`10`, `0`), all produce the correct result — real, checked confirmation that `bst-insert` preserves Concept Unit 2's invariant well enough for `bst-search` to rely on it.

### Mechanical Walkthrough

- **`(list value left right)`** — a reappearance of `list`; a node's entire representation, three positions, no more.
- **`(if (bst-empty? tree) (make-bst-node value empty-bst empty-bst) ...)`** — a reappearance of `if`; the base case of insertion, a brand-new leaf node when the recursion reaches an empty spot.
- **`(make-bst-node (bst-value tree) (bst-insert (bst-left tree) value) (bst-right tree))`** — the recursive case for a smaller value: keeps the current node's own value and right subtree unchanged, replacing only the left subtree with the result of inserting into it — trusted, by the leap of faith, to still satisfy the invariant.
- **`(cond ((= target (bst-value tree)) #t) ((< target (bst-value tree)) ...) (else ...))`** — a reappearance of `cond`, `=`, `<`; `bst-search`'s entire logic, one comparison choosing among three outcomes at every node.
- **The real, correct results across five varied searches** — direct, checked confirmation of both `insert` and `search` together.

### CS Lens

This is Lesson 46's recursive derivation discipline applied to a data structure's own shape rather than a function's return value: `bst-insert`'s recursive case never needs to verify the *entire* resulting tree's invariant by hand — trusting the recursive call's result, by the leap of faith, to already be a valid BST is exactly what makes the derivation tractable. Also recognized in: verifying a company reorganization by checking only that each manager's own direct reports satisfy the new reporting rule, trusting that each manager's own sub-organization was already verified the identical way, recursively, rather than checking every employee against the CEO directly.

### SE Lens

The alternative to trusting the recursive call is to verify the entire tree's invariant after every single insertion, checking every node against every other node. The real cost of that alternative would make insertion itself far more expensive than the search it's meant to support — trusting the invariant recursively, as this unit's `bst-insert` does, keeps insertion's own cost proportional to the tree's height, not its full size.

---

## Concept Unit 4: Real Cost, and an Honest Warning

### The Problem

Concept Unit 3 confirmed correctness. It's worth measuring, directly, whether this representation actually delivers Concept Unit 1's promised `O(log n)` search — and checking, honestly, whether that promise depends on some assumption about how the tree gets built, the way Lesson 93 and 94's hash table promises turned out to.

### The New Code — Type It Yourself

```scheme
(define (bst-height tree)
  (if (bst-empty? tree) 0
      (+ 1 (max (bst-height (bst-left tree)) (bst-height (bst-right tree))))))
```

### The Updated Project

This is `bst-cost.scm`, in full:

```scheme
(define (make-bst-node value left right) (list value left right))
(define (bst-value n) (car n))
(define (bst-left n) (cadr n))
(define (bst-right n) (caddr n))
(define empty-bst '())
(define (bst-empty? n) (null? n))

(define (bst-insert tree value)
  (if (bst-empty? tree)
      (make-bst-node value empty-bst empty-bst)
      (cond ((< value (bst-value tree))
             (make-bst-node (bst-value tree) (bst-insert (bst-left tree) value) (bst-right tree)))
            ((> value (bst-value tree))
             (make-bst-node (bst-value tree) (bst-left tree) (bst-insert (bst-right tree) value)))
            (else tree))))

(define comparisons 0)
(define (bst-search tree target)
  (if (bst-empty? tree)
      #f
      (begin
        (set! comparisons (+ comparisons 1))
        (cond ((= target (bst-value tree)) #t)
              ((< target (bst-value tree)) (bst-search (bst-left tree) target))
              (else (bst-search (bst-right tree) target))))))

(define (build-bst values)
  (let loop ((vs values) (tree empty-bst))
    (if (null? vs) tree (loop (cdr vs) (bst-insert tree (car vs))))))

(define (bst-height tree)                                        ; ← new
  (if (bst-empty? tree) 0                                           ; ← new
      (+ 1 (max (bst-height (bst-left tree)) (bst-height (bst-right tree)))))) ; ← new

(define (shuffled-list n)
  (map cdr (sort (map (lambda (x) (cons (random 1000000) x)) (iota n))
                 (lambda (a b) (< (car a) (car b))))))

(define (average-search-comparisons tree values)
  (let ((total 0))
    (for-each (lambda (v) (set! comparisons 0) (bst-search tree v) (set! total (+ total comparisons)))
              values)
    (exact->inexact (/ total (length values)))))

(for-each
 (lambda (n)
   (let* ((vals (shuffled-list n))
          (tree (build-bst vals)))
     (display "n=") (display n)
     (display " height=") (display (bst-height tree))
     (display " height/log2n=") (display (exact->inexact (/ (bst-height tree) (/ (log n) (log 2)))))
     (display " avg-search-comparisons=") (display (average-search-comparisons tree vals))
     (display " log2(n)=") (display (exact->inexact (/ (log n) (log 2))))
     (newline)))
 (list 100 1000 10000 100000))

(define sorted-tree (build-bst (iota 1000)))
(display "degenerate (sorted-insert) height for n=1000: ") (display (bst-height sorted-tree)) (newline)
```

`shuffled-list` reuses Lesson 80's shuffling technique (a random key paired with each value, then sorted by the key) to build each tree from a genuinely random insertion order. `average-search-comparisons` searches for *every* value actually in the tree and averages the result — Lesson 74's real average-case measurement, not one cherry-picked search.

### Reference Source

Lesson 80's shuffling technique (`FP-L080-quicksort.md`, Concept Unit 3), reused directly.

### Files affected

Created: `bst-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile bst-cost.scm
n=100 height=14 height/log2n=2.1072099696478683 avg-search-comparisons=7.7 log2(n)=6.643856189774725
n=1000 height=19 height/log2n=1.906523305871881 avg-search-comparisons=11.014 log2(n)=9.965784284662087
n=10000 height=33 height/log2n=2.4834974642278445 avg-search-comparisons=16.6032 log2(n)=13.28771237954945
n=100000 height=40 height/log2n=2.4082399653118496 avg-search-comparisons=20.64366 log2(n)=16.609640474436812
degenerate (sorted-insert) height for n=1000: 1000
```

Verified this session — across four increasing scales, tree height stays within roughly `1.9`–`2.5` times `log₂(n)`, and average real search cost stays within roughly `1.1`–`1.25` times `log₂(n)` — both bounded ratios, neither growing without bound, real confirmation of genuine `Θ(log n)` behavior for a randomly-built tree (not exactly `log₂(n)`, honestly — a real BST isn't perfectly balanced the way Lesson 68's array-halving is, but stays within a real, bounded multiple of it). **The honest warning:** inserting `1,000` values in *already-sorted* order produces a tree of height `1,000` — every single node with only a right child, no different from Lesson 12's plain list. The invariant Concept Unit 2 derived says nothing about *balance*; it only prevents *incorrect* search, and a correctly-invariant tree can still be structurally as bad as a list.

### Mechanical Walkthrough

- **`(+ 1 (max (bst-height (bst-left tree)) (bst-height (bst-right tree))))`** — a reappearance of `+`, `max`; a tree's height is one more than its taller subtree, the standard recursive definition of tree height.
- **The real, bounded ratios at every scale** — direct, measured confirmation of genuine logarithmic behavior, honestly reported as a bounded multiple rather than an exact match.
- **The real height of `1,000` on sorted input** — direct, measured proof that this lesson's invariant alone does not guarantee good performance, only correct results.

### CS Lens

This is the real, complete answer to Concept Unit 1's question: a reference-based representation *can* deliver `Θ(log n)` search, achieving Lesson 68's asymptotic guarantee through a completely different mechanism than contiguous array arithmetic — but only when the tree's actual shape stays reasonably balanced, a property this lesson's invariant does not itself guarantee, exactly as Lesson 93's hash table delivered its speedup only under a similarly unstated assumption (reasonable key distribution). Also recognized in: a company's org chart correctly reflecting who reports to whom (a genuine, checkable invariant) while still being structurally terrible for quick decision-making if one manager has ten thousand direct reports and no middle layer at all.

### SE Lens

The alternative to testing the sorted-insertion case is to report only the randomly-built tree's good real numbers and imply the invariant alone guarantees them. The real cost of that alternative is exactly the trap Lesson 93 and 94 already warned against for hash tables: a correctness guarantee quietly mistaken for a performance guarantee. Measuring the degenerate case honestly, as this unit does, is what correctly sets up Lesson 99's "Degenerate Trees" as solving a real, demonstrated problem — not a hypothetical one.

---

## Closing

### Connect the pieces

One recursive invariant, one real representation, real logarithmic behavior, and an honest limit:

1. **The question, reopened from Lesson 96 (Unit 1):** can fast search work without contiguous memory at all?
2. **The invariant, derived (Unit 2):** left subtree smaller, right subtree larger, recursively — the mechanism replacing computed addresses entirely.
3. **A real BST, built and verified (Unit 3):** insert and search, correct across five real test cases.
4. **Real cost, and its honest limit (Unit 4):** genuine `Θ(log n)` behavior on random insertion order, a real height of `1,000` (completely degenerate) on sorted order — the identical values, the identical invariant, wildly different real performance.

Every claim in this lesson traces to real, checked code: correctness verified directly, cost measured across four scales with an honestly-reported bounded ratio rather than a falsely exact match, and a real, deliberately checked pathological case rather than an implied universal guarantee.

### What breaks without this

Suppose a real system built a BST from data that happened to already arrive in sorted order — timestamps, sequential IDs, alphabetized records, all common in practice. Concept Unit 4's real evidence shows exactly what would happen: a tree of height equal to its full size, with every search degrading to Lesson 96's own list-like `O(n)` cost, despite the code being entirely correct and the invariant holding perfectly at every node. Understanding that the invariant guarantees correctness but not balance, as this lesson derives honestly, is what correctly motivates Lesson 99's and Lesson 101's later work on keeping a BST's real shape under control — not a hypothetical concern, a real, measured one.

### Exercises

1. **Observe.** Before checking, predict the real height of a BST built by inserting `1,000` values in *reverse*-sorted order, using this lesson's sorted-order result to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code and a real measurement.
3. **Formalize.** Implement `bst-delete`, removing a value while preserving Concept Unit 2's invariant, and verify it against at least five real test cases, including deleting the root.
4. **Explain.** In your own words, explain why `bst-insert`'s recursive rebuilding (Lesson 79's immutable style) was chosen over Lesson 87's in-place mutation for this lesson's tree, and what real trade-off that choice makes.
5. **Explain.** Using Lesson 74's vocabulary precisely, explain why this lesson's `avg-search-comparisons` measurement is a genuine average-case result while the sorted-insertion height measurement is closer to a worst-case one — and what real assumption (about insertion order) separates the two.

### Definition of done

- [ ] You can state the BST invariant precisely and explain why it alone guarantees correctness, not balance.
- [ ] You can trace `bst-insert` and `bst-search` by hand on a small tree and predict their results before running them.
- [ ] You can explain, using real measured numbers, why this lesson's height and search-cost ratios are reported as bounded multiples of `log₂(n)`, not exact matches.
- [ ] You verified, with real code, that sorted insertion order produces a fully degenerate tree.
- [ ] You completed Exercises 1–5, including implementing an operation (`bst-delete`) not built in this lesson's own code.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating what you measured or implemented and its real results.
