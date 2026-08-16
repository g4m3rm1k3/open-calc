# Lesson 98: Tree Invariants

**What you will build:** a real, automated checker for Lesson 97's BST invariant — and proof that the *obvious* way to write one is wrong. Real, verified evidence this session: a hand-built tree (`10` at the root, `5` on the left, `15` on the right, with `6` tucked under `15`'s left branch) passes a naive checker that only compares each node against its immediate children (`#t`, incorrectly reported valid) while a correct, range-based checker reports it invalid (`#f`) — because `6` genuinely violates the tree's global ordering, despite looking locally fine at every single parent-child comparison. The real, concrete cost of that violation: searching this exact tree for `6` — a value genuinely present in it — returns `#f`, not found, because `bst-search` trusts the very invariant this tree secretly breaks. The transferable point: Lesson 97 verified correctness with a handful of specific searches. This lesson asks whether that was actually enough evidence, derives the *right* way to check an invariant holds everywhere, and shows concretely what breaks when it doesn't.

**What you need to know first:** Lesson 97 (`FP-L097-binary-search-trees.md`) — specifically the BST invariant itself and `bst-search`, both directly tested here. Lesson 9 (`FP-L009-preconditions-and-postconditions.md`) — specifically the discipline of stating a checkable guarantee precisely, applied here to a whole recursive structure instead of one function call.

**Terms introduced in this lesson**

- **Local check** — verifying an invariant by comparing each node only against its immediate children, one level at a time. This lesson shows it is *not* sufficient for the BST invariant, despite looking like a direct translation of "left smaller, right larger."
- **Range-based check** — verifying the BST invariant correctly, by tracking the valid range (a lower and upper bound) each node must fall within, inherited from *every* ancestor comparison made so far, not just the immediate parent.

---

## Concept Unit 1: Was a Handful of Searches Enough?

### The Problem

Lesson 97 verified `bst-insert` and `bst-search` by checking five specific values against a small tree, all correct. It's worth asking directly: does a handful of correct searches actually confirm the invariant holds *everywhere* in a tree, or could a tree violate it somewhere while still answering those particular searches correctly by coincidence?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, building on Lesson 97's own verification.

### Applying It — Why "A Few Searches Passed" Isn't the Same as "The Invariant Holds"

A search only visits one root-to-leaf path per call. Five searches visit at most five such paths — in a tree with many nodes, most of the tree's actual structure is never touched by any of them. A violation sitting outside every path those five searches happened to take would go completely undetected, exactly the same gap Lesson 24 warned about for trusting a few confirming examples over a real, general check.

### Walkthrough

- **"at most five such paths"** — makes the coverage gap concrete: a handful of searches is real evidence about *those specific paths*, not the whole tree.
- **The direct reuse of Lesson 24's warning** — this isn't a new kind of caution, it's the identical principle (confirming examples aren't proof) applied to a data structure instead of a mathematical claim.

### CS Lens

This is the general problem of verifying a property of a large structure using only a small number of probes: the probes can all pass while the property genuinely fails elsewhere, unless the check is specifically designed to cover the whole structure, not just the parts a few chosen operations happen to touch. Also recognized in: a building inspector checking a handful of rooms and declaring the whole building sound, missing a structural problem in a room nobody happened to walk into.

### SE Lens

The alternative to asking this question is to trust Lesson 97's five-search verification as sufficient evidence forever, even as the tree grows through many more insertions, deletions, or future operations (Lesson 97's own Exercise 3, `bst-delete`, for instance) this curriculum hasn't yet stress-tested. The real cost of that alternative is exactly what Concept Unit 3 and 4 demonstrate: a real, silent violation that no small set of spot-checks happened to catch.

---

## Concept Unit 2: Deriving the Correct Check

### The Problem

A real invariant-checking function is needed. The most obvious way to write one — check that each node's children satisfy the ordering, one level at a time — needs testing directly against whether it's actually correct.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation and its subtle failure are stated directly below, then checked with real code in Concept Unit 3.

### Applying It — The Tempting, Wrong Version, and the Right One

**The tempting version:** for each node, check that its left child (if any) is smaller and its right child (if any) is larger — a direct, one-level-at-a-time translation of "left smaller, right larger."

**Why it's wrong:** Lesson 97's invariant requires *every* value in the left subtree to be smaller, and *every* value in the right subtree to be larger — not just the immediate children. A node several levels down could satisfy its own immediate parent comparison while still violating the ordering relative to a *grandparent* or earlier ancestor, and the one-level-at-a-time check would never notice.

**The correct version:** track a valid range — a lower bound and an upper bound — as the check recurses, updating it at every step. The root has no bound in either direction. Recursing left tightens the upper bound to the current node's value; recursing right tightens the lower bound. A node is valid only if it falls strictly within the range accumulated from *every* ancestor step taken to reach it, not just its immediate parent.

### Walkthrough

- **The tempting version, named as tempting specifically because it looks correct** — honest about why this is a real, easy mistake, not an obviously bad idea.
- **"a grandparent or earlier ancestor"** — the precise gap the local check misses, stated before any code makes it concrete.
- **The range accumulated "from every ancestor step"** — the entire fix, in one sentence, before Concept Unit 3 turns it into real code.

### CS Lens

This is a real instance of a common invariant-checking mistake: verifying a *local* consequence of a *global* property and mistaking it for the property itself — the local check is a necessary condition for the invariant (every genuinely valid BST does satisfy it), but not a sufficient one. Also recognized in: verifying a chain of command by checking only that each person's direct supervisor outranks them, missing a case where an entire misplaced sub-team reports, correctly locally, into the wrong branch of the organization entirely.

### SE Lens

The alternative to deriving the range-based version carefully is to ship the tempting, local-only checker, since it passes every test built from correctly-constructed trees (which never trigger the gap). The real cost of that alternative is a verification tool that provides false confidence — it will correctly validate every good tree, and *also* incorrectly validate some genuinely broken ones, which is precisely the dangerous combination Concept Unit 3 demonstrates concretely.

---

## Concept Unit 3: Both Checkers, and the Tree That Exposes the Difference

### The Problem

Concept Unit 2's claim — the local check is insufficient — needs real, executed proof: a real tree where the two checkers actually disagree.

### The New Code — Type It Yourself

```scheme
(define (valid-bst? tree lo hi)
  (if (bst-empty? tree)
      #t
      (and (or (not lo) (> (bst-value tree) lo))
           (or (not hi) (< (bst-value tree) hi))
           (valid-bst? (bst-left tree) lo (bst-value tree))
           (valid-bst? (bst-right tree) (bst-value tree) hi))))
```

### The Updated Project

This is `invariant-check.scm`, in full:

```scheme
(define (make-bst-node value left right) (list value left right))
(define (bst-value n) (car n))
(define (bst-left n) (cadr n))
(define (bst-right n) (caddr n))
(define empty-bst '())
(define (bst-empty? n) (null? n))

(define (locally-valid? tree)                                  ; ← new
  (if (bst-empty? tree)                                            ; ← new
      #t                                                             ; ← new
      (let ((l (bst-left tree)) (r (bst-right tree)))                  ; ← new
        (and (or (bst-empty? l) (< (bst-value l) (bst-value tree)))       ; ← new
             (or (bst-empty? r) (> (bst-value r) (bst-value tree)))         ; ← new
             (locally-valid? l)                                              ; ← new
             (locally-valid? r)))))                                            ; ← new

(define (valid-bst? tree lo hi)                                                   ; ← new
  (if (bst-empty? tree)                                                             ; ← new
      #t                                                                              ; ← new
      (and (or (not lo) (> (bst-value tree) lo))                                        ; ← new
           (or (not hi) (< (bst-value tree) hi))                                          ; ← new
           (valid-bst? (bst-left tree) lo (bst-value tree))                                 ; ← new
           (valid-bst? (bst-right tree) (bst-value tree) hi))))                                ; ← new

(define bad-tree
  (make-bst-node 10
    (make-bst-node 5 empty-bst empty-bst)
    (make-bst-node 15
      (make-bst-node 6 empty-bst empty-bst)
      (make-bst-node 20 empty-bst empty-bst))))

(display "locally-valid? bad-tree: ") (display (locally-valid? bad-tree)) (newline)
(display "valid-bst? bad-tree (range-based): ") (display (valid-bst? bad-tree #f #f)) (newline)
```

`bad-tree` is built by hand with `make-bst-node` directly, not through `bst-insert` — standing in for however a real violation might actually arise (a bug in a future operation like `bst-delete` or a tree-merging function neither this curriculum nor Lesson 97 has built yet). `#f` for `lo`/`hi` means "no bound yet," used only at the very top call.

### Reference Source

No reference counterpart — both checkers are from-scratch implementations of Concept Unit 2's two derived approaches.

### Files affected

Created: `invariant-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile invariant-check.scm
locally-valid? bad-tree: #t
valid-bst? bad-tree (range-based): #f
```

Verified this session — the naive, local-only checker reports `bad-tree` valid (`#t`): at the root, `5 < 10` and `15 > 10` both hold; at node `15`, `6 < 15` and `20 > 15` both hold too — every single immediate comparison passes. The range-based checker correctly reports it invalid (`#f`), because by the time it reaches `6`, it has inherited the range "must be greater than `10`" from the earlier right-turn at the root — and `6` fails that inherited bound, even though it never fails a purely local comparison.

### Mechanical Walkthrough

- **`(or (bst-empty? l) (< (bst-value l) (bst-value tree)))`** — a reappearance of `or`, `<`; `locally-valid?`'s entire, insufficient check: compare only against the immediate node.
- **`(or (not lo) (> (bst-value tree) lo))`** — a reappearance of `not`, `>`; `valid-bst?`'s lower-bound check, `#f` for `lo` meaning "no lower bound has been inherited yet."
- **`(valid-bst? (bst-left tree) lo (bst-value tree))`** — recursing left *tightens the upper bound* to the current node's value, carrying the *existing* lower bound forward unchanged — the exact mechanism `locally-valid?` never performs.
- **The real, disagreeing `#t`/`#f` results on the identical tree** — direct, checked proof the two approaches are genuinely different, not just stylistically different ways of writing the same check.

### CS Lens

This is the real, demonstrated gap between a necessary condition and a sufficient one: every node individually satisfying its immediate ordering is *necessary* for a valid BST, but Concept Unit 3's own real counterexample proves it is not *sufficient* — the range-based check is what closes that gap, by making each node's constraint depend on its full ancestry, not just its parent.

### SE Lens

The alternative to constructing a real, disagreeing example is to state the local check's insufficiency as an abstract warning and move on. The real cost of that alternative is exactly what this curriculum's evidence discipline exists to prevent since Lesson 22 — an unconfirmed claim about a bug class, rather than one real, executed tree where the bug provably exists and is caught by the correct tool.

---

## Concept Unit 4: The Real Consequence, and Exhaustive Preservation

### The Problem

Concept Unit 3 proved the checkers disagree. It's worth showing, concretely, why the difference actually matters — what really breaks when the invariant is violated — and confirming the *correct* insert operation genuinely preserves it, not just once, but across every single step of a long, real sequence.

### The New Code — Type It Yourself

```scheme
(define (bst-search tree target)
  (if (bst-empty? tree)
      #f
      (cond ((= target (bst-value tree)) #t)
            ((< target (bst-value tree)) (bst-search (bst-left tree) target))
            (else (bst-search (bst-right tree) target)))))
```

### The Updated Project

This is `consequence-check.scm`, in full:

```scheme
(define (make-bst-node value left right) (list value left right))
(define (bst-value n) (car n))
(define (bst-left n) (cadr n))
(define (bst-right n) (caddr n))
(define empty-bst '())
(define (bst-empty? n) (null? n))

(define (bst-search tree target)                                ; ← new
  (if (bst-empty? tree)                                             ; ← new
      #f                                                              ; ← new
      (cond ((= target (bst-value tree)) #t)                            ; ← new
            ((< target (bst-value tree)) (bst-search (bst-left tree) target)) ; ← new
            (else (bst-search (bst-right tree) target)))))                       ; ← new

(define bad-tree
  (make-bst-node 10
    (make-bst-node 5 empty-bst empty-bst)
    (make-bst-node 15
      (make-bst-node 6 empty-bst empty-bst)
      (make-bst-node 20 empty-bst empty-bst))))

(display "search for 6 (really present in the tree): ") (display (bst-search bad-tree 6)) (newline)
(display "search for 15 (present, root of right subtree): ") (display (bst-search bad-tree 15)) (newline)
(display "search for 20 (present): ") (display (bst-search bad-tree 20)) (newline)
```

`bst-search` is Lesson 97's own procedure, quoted verbatim, unchanged — the whole point is that nothing about `bst-search` itself is broken; only the data it's trusting to search is.

### Reference Source

Lesson 97's `bst-search` (`FP-L097-binary-search-trees.md`, Concept Unit 3), unchanged; Concept Unit 3's own `bad-tree`, reused directly.

### Files affected

Created: `consequence-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile consequence-check.scm
search for 6 (really present in the tree): #f
search for 15 (present, root of right subtree): #t
search for 20 (present): #t
```

Verified this session — searching for `6`, a value genuinely sitting in the tree, returns `#f`, not found. **Naming exactly why:** `6 < 10`, so search goes left to node `5`; `6 ≠ 5` and `6 > 5`, so search tries `5`'s right child — empty — and gives up. Search never even looks inside `10`'s *right* subtree, where `6` is actually hiding under `15`. `bst-search`'s entire logic trusts the invariant Concept Unit 3 already proved this specific tree violates — and the real, concrete cost of that violation is a value that exists becoming silently, permanently unfindable.

**Confirming the correct operation doesn't have this problem, exhaustively.** This extends the file above with `bst-insert` (Lesson 97) and Concept Unit 3's own `valid-bst?`:

```scheme
(define (shuffled-list n)
  (map cdr (sort (map (lambda (x) (cons (random 1000000) x)) (iota n))
                 (lambda (a b) (< (car a) (car b))))))

(define vals (shuffled-list 500))

(let loop ((vs vals) (tree empty-bst) (i 0))
  (if (null? vs)
      (begin (display "checked all ") (display i) (display " insertions: invariant held throughout") (newline))
      (let ((tree2 (bst-insert tree (car vs))))
        (if (not (valid-bst? tree2 #f #f))
            (begin (display "INVARIANT VIOLATED at insertion ") (display i) (newline))
            (loop (cdr vs) tree2 (+ i 1))))))
```

```
$ guile exhaustive-check.scm
checked all 500 insertions: invariant held throughout
```

Checking `valid-bst?` after *every single insertion* in a real, `500`-value random sequence, not just once at the end, confirms the invariant holds continuously throughout — real, exhaustive evidence for `bst-insert` specifically, which `bad-tree`'s hand-built construction never had to satisfy.

### Walkthrough

- **The real `#f` for a genuinely present value** — turns "the invariant matters" from an abstract claim into a concrete, felt failure: correct-looking code, `bst-search`, given bad data, silently returns a wrong answer.
- **"search never even looks inside `10`'s right subtree"** — the precise mechanical reason the failure happens, not just the fact that it does.
- **Checking after every insertion, not just the final tree** — a stronger, exhaustive form of verification than checking the end result once, catching a violation at the exact moment it would occur, not after it's had time to compound.

### CS Lens

This is the real reason maintaining an invariant matters operationally, not just formally: every other operation built on top of it — here, `bst-search` — is written *assuming* the invariant holds, and inherits any violation as a silent, hard-to-trace failure rather than a visible error. Also recognized in: a GPS system trusting that road data is accurate, silently routing a driver down a road that was actually closed, because the routing algorithm's own correctness was never in question — the data it trusted was.

### SE Lens

The alternative to checking after every single insertion is to check only the final tree, the way Concept Unit 3's one-time check might suggest is sufficient. The real cost of that alternative, for a real system where a tree persists and grows over a long session, is losing the ability to pinpoint exactly *when* a violation was introduced, if one ever is — checking continuously, as this unit does, is what would catch a future bug (in `bst-delete`, or any other operation added later) at the precise moment it breaks the invariant, not sometime after.

---

## Closing

### Connect the pieces

One question about sufficient evidence, one wrong-looking-right checker, one real counterexample, and its real consequence:

1. **The gap, named (Unit 1):** a handful of correct searches doesn't confirm an invariant holds throughout an entire tree.
2. **Two checkers, derived (Unit 2):** a tempting, local-only version, and the correct, range-based one — necessary versus sufficient.
3. **A real, disagreeing tree (Unit 3):** `bad-tree`, real and hand-built, where the two checkers give opposite, real answers.
4. **The real cost, and real exhaustive preservation (Unit 4):** a genuinely present value, silently unfindable; `bst-insert`, checked continuously across `500` real insertions, never once violating the invariant.

Every claim in this lesson traces to real, executed code: two genuinely different checking algorithms run on the identical real tree, a real search failure demonstrating the practical cost of violation, and exhaustive, step-by-step confirmation that the trusted operation never actually causes it.

### What breaks without this

Suppose a future addition to this curriculum's BST — `bst-delete` (Lesson 97's own Exercise 3), or a tree-merging operation — contained a bug that occasionally produced a tree shaped like this lesson's `bad-tree`. Without a real, range-based invariant checker run regularly against real data, that bug could go undetected for a long time: existing tests checking a handful of specific values (Lesson 97's own five-search verification) might never happen to probe the exact path where the violation lives, exactly the gap Concept Unit 1 named. Building and running the correct checker, as this lesson does, is what would catch such a bug immediately, with a precise, checkable "invariant violated" answer instead of a mysterious, occasional "search says this value isn't here" report from somewhere else in a real system.

### Exercises

1. **Observe.** Before checking, predict whether `locally-valid?` and `valid-bst?` would agree or disagree on a tree built by inserting `7, 3, 12, 1, 5, 9, 15` in that order via Lesson 97's real `bst-insert`.
2. **Formalize.** Confirm your Exercise 1 prediction by building that tree and running both checkers against it.
3. **Formalize.** Construct a second hand-built counterexample tree, different in shape from `bad-tree`, where `locally-valid?` and `valid-bst?` disagree, and verify the disagreement with real code.
4. **Explain.** In your own words, explain why `valid-bst?`'s recursive calls pass different `lo`/`hi` values to the left and right subtrees, referencing exactly which bound tightens in each direction and why the other one doesn't change.
5. **Explain.** If you completed Lesson 97's Exercise 3 (`bst-delete`), run Concept Unit 4's continuous-checking technique across a real sequence mixing inserts and deletes, and report whether the invariant held throughout or whether you found a real violation.

### Definition of done

- [ ] You can explain precisely why a local, immediate-children-only check is insufficient for the BST invariant, using a real example, not just the abstract argument.
- [ ] You can state the range-based check's rule: what bound tightens on a left recursion, what bound tightens on a right recursion.
- [ ] You can explain, using this lesson's real `bst-search` failure, why an invariant violation causes a *silent* wrong answer rather than a visible error.
- [ ] You ran a continuous, after-every-operation invariant check across a real sequence of insertions, not just a check of the final result.
- [ ] You completed Exercises 1–5, including constructing a second, different counterexample tree.
- [ ] Commit your Exercise 3 and 5 findings, with a commit message stating the counterexample you built or the delete-sequence you checked.
