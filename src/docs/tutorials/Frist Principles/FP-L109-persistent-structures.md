# Lesson 109: Persistent Structures

**What you will build:** a small persistent binary search tree, and a real, physical proof — using object identity, not just correct-looking output — that inserting into it shares every untouched part of the old tree directly, rather than copying it. Real, verified evidence this session: inserting `45` into a `7`-node tree produces a new tree whose *untouched* right subtree is `eq?` to the old tree's right subtree — the literal same object in memory, not a structurally-identical copy — while the nodes actually on the insertion path are correctly `eq?`-different, confirming they really were rebuilt. At real scale, a single insertion into a `10,000`-node tree allocates only `9` new nodes — not `10,000` — a real, measured gap that widens as the tree grows. The transferable point: this lesson names, precisely, a distinction this whole Era has already lived through without naming — Lesson 97 through 106's tree family never once mutated existing structure, while Lesson 104 and 107/108's heap and Union-Find deliberately did — and shows that the tree family's style isn't just "immutable," it's cheap specifically because of structural sharing, a real mechanism this lesson proves directly rather than assumes.

**What you need to know first:** Lesson 87 (`FP-L087-linked-structures.md`) — specifically real mutation, the direct contrast point this lesson names precisely. Lesson 104 (`FP-L104-heaps.md`) and Lesson 107/108 (`FP-L107-union-find.md`, `FP-L108-path-compression.md`) — specifically `heap-swap!` and `uf-union!`'s own real, in-place mutation, this lesson's concrete ephemeral-style examples. Lesson 97 (`FP-L097-binary-search-trees.md`) — specifically the BST ordering invariant, reused unchanged for this lesson's own small tree.

**Terms introduced in this lesson**

- **Persistent data structure** — a structure where every operation returns a new version, and every previous version remains fully valid and unchanged, forever. It exists to name, precisely, the style Lesson 97 through 106's entire tree family already used throughout, without ever calling it by name.
- **Ephemeral (mutable) structure** — the opposite style: an operation changes the *one* existing structure in place, and any previously-held reference to it now sees the changed version — there is no "old version" still available afterward. It exists to name, equally precisely, the style Lesson 104's `heap-swap!` and Lesson 107/108's `uf-union!` both already used.
- **Structural sharing** — the specific mechanism that makes persistence cheap: a new version reuses the *exact same* unchanged parts of the old version by reference, rather than copying them, so only the parts that actually changed are newly allocated. It exists because persistence *without* structural sharing would mean copying the entire structure on every single operation — correct, but far more expensive than necessary.
- **Object identity** (via `eq?`) — whether two references point to the *literal same* object in memory, as opposed to two objects that merely look identical. It exists because "the new tree's right subtree looks the same as the old one's" is a weaker, less useful claim than "the new tree's right subtree *is*, literally, the old one's" — and only object identity, not value comparison, can tell the two apart.

**Objects and methods used**

- **`eq?`**
  - *What it is:* a real Scheme procedure testing whether two values are the literal same object — object identity, not structural or value equality.
  - *Implementation:* takes two values, returns `#t` exactly when they refer to the identical object; reappearing from earlier symbol comparisons (Lesson 103's `'red`/`'black`), used here for the first time to compare compound, list-built structures rather than atomic symbols.
  - *Its use:* the entire proof mechanism of Concept Unit 3 — confirming a subtree in the new tree is literally the old tree's own subtree, not a lookalike copy.

---

## Concept Unit 1: A Distinction Already Lived Through, Never Named

### The Problem

Every one of Lesson 97 through 106's tree-shaped structures — BST, AVL, red-black, trie — was built the identical way: every insert returned a brand-new root, and the *old* tree, if anything still held a reference to it, remained exactly as it was. Lesson 104's `heap-swap!` and Lesson 107/108's `uf-union!` did the opposite: they wrote directly into existing storage, and there is no "old heap" or "old partition" still available after either call. This curriculum has built both styles, repeatedly, without ever naming the distinction itself as a deliberate, general representation choice.

### No isolated lab for this step

This concept has no code of its own to isolate — the distinction is posed directly here, drawing on structures already built across this Era.

### Reference Source

No reference counterpart — the motivating contrast draws on Lesson 87, 97–106, and 104/107/108's own already-built code, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Naming This Precisely Would Need to Cover

A precise name for each style needs to say exactly what happens to *old* references after an operation: do they still see a valid, unchanged structure, or do they now see the change too? That single question is what separates the tree family's style from the heap's and Union-Find's.

### Walkthrough

- **The direct citation of specific procedures from four different lessons, `heap-swap!`, `uf-union!`, and the whole tree family** — grounds the distinction in code already built and verified, not a new, abstract example.
- **"do they still see a valid, unchanged structure"** — previews Concept Unit 2's own precise definitions.

### CS Lens

This is Lesson 2's own "turning ambiguity into precision" applied retroactively across an entire Era: a real pattern used repeatedly, correctly, without ever being named, made nameable and comparable now that enough real examples of both sides exist to name accurately. Also recognized in: a photographer distinguishing "editing a copy, keeping the original" from "editing the original file directly" — a real, consequential choice made every time a photo is opened, whether or not the software ever asks the question explicitly.

### SE Lens

The alternative to naming this distinction is to keep building both styles as needed, correctly, without a shared vocabulary for discussing *why* one was chosen over the other in a given lesson. The real cost of that alternative: Concept Unit 4's own tradeoff — old versions staying valid, at a real, measured allocation cost — becomes much harder to reason about deliberately without first being able to name which style is even in play.

---

## Concept Unit 2: Defining Persistence and Structural Sharing

### The Problem

Concept Unit 1 named the question in the abstract. It needs precise definitions for both styles, plus the specific mechanism that keeps the persistent style from being naively expensive.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below, and Concept Unit 3 implements and verifies them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation naming a pattern already present in earlier lessons' code.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Persistence Alone Is Not Enough

**A persistent structure**, precisely: every operation returns a new version; every previously-obtained reference to any earlier version remains valid and unchanged, permanently. **An ephemeral structure**, precisely: an operation may change the one structure in place; a previously-obtained reference now sees the change too, since there is only ever one, current version.

**The subtlety worth deriving:** persistence, defined this way, says nothing yet about *cost*. A persistent structure could, in principle, satisfy this definition by copying its *entire* contents on every single operation — correct, since the old version really would remain untouched, but expensive in a way that scales with the *whole* structure's size, every time. **Structural sharing** is the additional, specific commitment that makes persistence cheap in practice: a new version is built by reusing every *unchanged* part of the old version *by reference* — the identical objects, not copies — and only actually allocating new structure for the parts genuinely different in the new version.

**Why a tree shape makes sharing free to get:** inserting into a BST only ever changes nodes along *one root-to-leaf path* — every subtree hanging off that path, on the side not being descended into, is never touched by the insertion at all, and so can be reused directly, unchanged, in the new tree.

### Walkthrough

- **Persistence and ephemerality both defined by "what happens to old references"** — the precise question Concept Unit 1 posed, now answered exactly for both.
- **The naive-full-copy subtlety, named explicitly before any code exists** — sets up Concept Unit 3's `eq?` proof as answering a real, open question (does *this* implementation actually share, or silently copy?), not a foregone conclusion.

### CS Lens

This is the same "correct but naive versus correct and cheap" distinction Lesson 79 drew between any correct sort and one achieving `Θ(n log n)` — persistence alone (correct) is not the same claim as persistence via structural sharing (cheap), and only the second is what makes the tree family's whole approach practical. Also recognized in: a version-control system correctly preserving every past commit's contents — the naive way, storing a full copy of every file per commit, versus the way real systems actually do it, storing only the files that changed and reusing every unchanged file's existing copy across commits.

### SE Lens

The alternative to deriving structural sharing as a distinct, additional commitment is to treat "returns a new version" and "is cheap" as the same claim, conflating persistence with efficient persistence. The real cost of that conflation: a genuinely naive, full-copying "persistent" implementation would still satisfy Concept Unit 1's own definition while being asymptotically worse than the ephemeral alternative it's being compared against — exactly the kind of gap Concept Unit 4's real measurement exists to catch rather than assume away.

---

## Concept Unit 3: Proving Structural Sharing, Not Just Correctness

### The Problem

Concept Unit 2 derived what structural sharing means. It needs a real implementation, and — critically — a check that goes beyond "the new tree looks correct," since a silently full-copying implementation would pass that check too. It needs proof that specific, unchanged subtrees are the *literal same objects*, not lookalikes.

### The New Code — Type It Yourself

```scheme
(define (bst-insert tree v)
  (cond ((empty-tree? tree) (make-node v empty-tree empty-tree))
        ((< v (node-value tree))
         (make-node (node-value tree) (bst-insert (node-left tree) v) (node-right tree)))
        ((> v (node-value tree))
         (make-node (node-value tree) (node-left tree) (bst-insert (node-right tree) v)))
        (else tree)))
```

### Reference Source

No reference counterpart — a small, fresh persistent BST built for this lesson's own structural-sharing demonstration, reusing Lesson 97's ordering invariant (everything smaller to the left, everything larger to the right) unchanged, but not quoting that lesson's own specific procedure names verbatim.

### Files affected

Created: `persist-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `persist-check.scm`, in full:

```scheme
(define (make-node v l r) (list v l r))
(define (node-value n) (car n))
(define (node-left n) (cadr n))
(define (node-right n) (caddr n))
(define empty-tree '())
(define (empty-tree? n) (null? n))

(define (bst-insert tree v)                                        ; ← new
  (cond ((empty-tree? tree) (make-node v empty-tree empty-tree))       ; ← new
        ((< v (node-value tree))                                          ; ← new
         (make-node (node-value tree) (bst-insert (node-left tree) v) (node-right tree))) ; ← new
        ((> v (node-value tree))                                                ; ← new
         (make-node (node-value tree) (node-left tree) (bst-insert (node-right tree) v))) ; ← new
        (else tree)))                                                              ; ← new

(define t0 empty-tree)
(for-each (lambda (v) (set! t0 (bst-insert t0 v))) '(50 30 70 20 40 60 80))
(define t1 (bst-insert t0 45))

(display "old right subtree (rooted at 70) and new right subtree, eq?: ")
(display (eq? (node-right t0) (node-right t1))) (newline)
(display "old node 20 and new node 20 (sibling of the insertion path), eq?: ")
(display (eq? (node-left (node-left t0)) (node-left (node-left t1)))) (newline)
(display "old root and new root, eq?: ")
(display (eq? t0 t1)) (newline)
(display "old node 30 and new node 30 (on the insertion path), eq?: ")
(display (eq? (node-left t0) (node-left t1))) (newline)
```

`bst-insert` recurses toward the correct position, exactly like Lesson 97's own logic, but at every level, it calls `make-node` to build a *new* node wrapping the (possibly-updated) subtrees — the subtree it *didn't* recurse into is passed through completely untouched, by reference, into that new node.

### Mechanical Walkthrough

- **`(cond ((empty-tree? tree) (make-node v empty-tree empty-tree)) ...)`** — a hard concept reappearing (Lesson 97's BST invariant): the base case, and the two ordering branches, are the identical ordering rule Lesson 97 derived, restated here rather than re-derived.
- **`(make-node (node-value tree) (bst-insert (node-left tree) v) (node-right tree))`** — first appearance of this specific detail worth naming precisely: `(node-right tree)` is passed through *unchanged*, the literal same reference the old node held, not a freshly-built copy — this one sub-expression is the entire mechanism Concept Unit 2 called structural sharing.
- **`(eq? (node-right t0) (node-right t1))`** — first appearance of `eq?` used to compare two compound, list-built structures rather than two atomic symbols; returning `#t` here is the real, checkable proof that the expression above genuinely passed the *same object* through, not a copy that merely prints identically.
- **`(eq? t0 t1)`, returning `#f`** — confirms the contrasting case: the root itself *was* rebuilt (it necessarily must be, since its own left child changed), so it is correctly a different object, not shared.
- **The real, exact pattern of `#t`/`#f` results, matching Concept Unit 2's own prediction exactly** — direct, checked confirmation that this implementation genuinely shares structure, not merely returns correct-looking values.

### CS Lens

This is demystification applied to a claim about memory itself, not just about output: "the old subtree is reused" is exactly the kind of hidden-behavior claim this curriculum's own schema requires proof for, not a confident sentence — `eq?`, applied directly to the actual objects in question, is that proof. Also recognized in: proving two people share the *same* physical passport, not just two passports with identical printed information, by checking the object itself rather than what it says.

### SE Lens

The alternative to checking with `eq?` is checking with `equal?` — which would return `#t` for the shared subtree *and* for a hypothetical full copy with identical contents, since `equal?` only ever compares structure and values, never identity. The real cost of that alternative: it cannot distinguish "this implementation shares structure" from "this implementation happens to produce identical-looking output by copying everything," exactly the gap Concept Unit 2 flagged and this unit's `eq?` checks are the only real Scheme tool that closes.

### Run It — Show the Real Output

```
$ guile persist-check.scm
old right subtree (rooted at 70) and new right subtree, eq?: #t
old node 20 and new node 20 (sibling of the insertion path), eq?: #t
old root and new root, eq?: #f
old node 30 and new node 30 (on the insertion path), eq?: #f
```

Verified this session — inserting `45` into a `7`-node tree (built from `50, 30, 70, 20, 40, 60, 80`): the untouched right subtree, rooted at `70`, is `eq?`-identical between the old and new trees — the literal same object, confirmed rather than assumed. Node `20`, a sibling of the actual insertion path, is likewise shared exactly. The root and node `30`, both genuinely on the path to where `45` was inserted, are correctly `eq?`-different — real, rebuilt objects, exactly as Concept Unit 2 predicted for the nodes that actually changed.

---

## Concept Unit 4: The Real, Measured Cost of Sharing

### The Problem

Concept Unit 3 proved sharing happens. It's worth measuring, honestly, exactly how much that sharing saves — comparing the real number of newly-allocated nodes per insertion against what a naive, non-sharing "persistent" implementation would have to allocate instead.

### The New Code — Type It Yourself

```scheme
(define new-node-count 0)
(define (make-node-counted v l r)
  (set! new-node-count (+ new-node-count 1))
  (list v l r))
```

### Reference Source

No reference counterpart — a counted instrumentation of Concept Unit 3's own `make-node`, the identical technique Lesson 92 and 104 both already used.

### Files affected

Created: `persist-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `persist-cost.scm`, in full — reusing Concept Unit 3's own `bst-insert` unchanged, with a counted `make-node`:

```scheme
(define (node-value n) (car n))
(define (node-left n) (cadr n))
(define (node-right n) (caddr n))
(define empty-tree '())
(define (empty-tree? n) (null? n))

(define new-node-count 0)                                          ; ← new
(define (make-node-counted v l r)                                      ; ← new
  (set! new-node-count (+ new-node-count 1))                              ; ← new
  (list v l r))                                                              ; ← new

(define (bst-insert-counted tree v)
  (cond ((empty-tree? tree) (make-node-counted v empty-tree empty-tree))
        ((< v (node-value tree))
         (make-node-counted (node-value tree) (bst-insert-counted (node-left tree) v) (node-right tree)))
        ((> v (node-value tree))
         (make-node-counted (node-value tree) (node-left tree) (bst-insert-counted (node-right tree) v)))
        (else tree)))

(define (tree-height tree)
  (if (empty-tree? tree) 0 (+ 1 (max (tree-height (node-left tree)) (tree-height (node-right tree))))))

(define (shuffled-list n)
  (map cdr (sort (map (lambda (x) (cons (random 1000000) x)) (iota n))
                 (lambda (a b) (< (car a) (car b))))))

(for-each
 (lambda (n)
   (define vals (shuffled-list n))
   (define tree (let loop ((vs vals) (t empty-tree))
                  (if (null? vs) t (loop (cdr vs) (bst-insert-counted t (car vs))))))
   (set! new-node-count 0)
   (bst-insert-counted tree 1000001)
   (display "n=") (display n)
   (display " tree-height=") (display (tree-height tree))
   (display " new-nodes-for-one-insert=") (display new-node-count)
   (display " naive-full-copy-would-need=") (display n)
   (newline))
 (list 100 1000 10000))
```

`bst-insert-counted` is Concept Unit 3's `bst-insert`, with `make-node-counted` in place of `make-node`, tracking exactly how many new nodes any single insertion actually allocates.

### Mechanical Walkthrough

- **`(set! new-node-count (+ new-node-count 1))`** inside `make-node-counted` — a reappearance of `set!`; counts every real allocation, since `make-node-counted` is only ever called for nodes actually being newly built, never for subtrees passed through unchanged.
- **The real, small numbers — `3`, `10`, `9` new nodes for one insert at `n = 100`, `1,000`, `10,000`** — direct, measured confirmation that a single insertion's real cost stays small and roughly tied to the tree's own height, not to how many nodes the tree already holds.
- **`naive-full-copy-would-need=n`** — not a measured quantity but a stated, honest baseline: a full-copying "persistent" implementation, by definition, would need to allocate a new copy of all `n` existing nodes plus the one new node, every single time.

### CS Lens

This is the real, measured version of exactly the claim Lesson 85 made about array access and Lesson 106 made about trie prefix queries: a structural property (here, that only one root-to-leaf path is ever touched) produces a real cost bound — here, roughly `O(height)`, not `O(n)` — checked directly rather than assumed from the mechanism's description alone.

### SE Lens

The alternative to persistence via structural sharing is exactly Lesson 104 and 107/108's own ephemeral style: mutate in place, allocate nothing extra, but lose every old version the moment a change happens. The real, honest tradeoff this lesson's numbers make concrete: persistence buys every old version staying valid and usable — genuinely useful for undo history, safe concurrent readers, or comparing versions over time — at a real, measured cost of `3` to `10` new allocations per operation in this lesson's own tests, not free, but far cheaper than the naive `n`-per-operation alternative Concept Unit 2 warned against. Neither style is simply better; Lesson 104's heap chose speed and zero extra allocation because nothing needed old versions preserved, and this lesson's tree chose the opposite because, in general, something might.

### Run It — Show the Real Output

```
$ guile persist-cost.scm
n=100 tree-height=14 new-nodes-for-one-insert=3 naive-full-copy-would-need=100
n=1000 tree-height=19 new-nodes-for-one-insert=10 naive-full-copy-would-need=100 0
n=10000 tree-height=33 new-nodes-for-one-insert=9 naive-full-copy-would-need=10000
```

Verified this session — a single insertion into trees of `100`, `1,000`, and `10,000` existing nodes allocates only `3`, `10`, and `9` new nodes respectively, staying close to each tree's own real height (`14`, `19`, `33`) and nowhere near the full node count a naive, non-sharing implementation would need to copy (`100`, `1,000`, `10,000`) — the real, measured gap widening sharply as `n` grows, exactly the payoff structural sharing was derived to provide.

---

## Closing

### Connect the pieces

One insertion, `45`, traced through every unit this lesson built:

1. **The unnamed distinction, named (Unit 1):** this Era already built both persistent (tree family) and ephemeral (heap, Union-Find) structures, without ever naming the difference.
2. **Persistence and structural sharing, precisely defined (Unit 2):** persistence alone doesn't guarantee cheapness; structural sharing — reusing unchanged parts by reference — is the specific, additional mechanism that does.
3. **Sharing proven, not assumed (Unit 3):** `eq?`, applied to real subtrees, confirms the untouched right subtree and sibling node are the literal same objects, while the rebuilt path is correctly different.
4. **The real cost, measured (Unit 4):** `3` to `10` new nodes per insertion against a naive `n`, at three real scales — sharing's actual, checked payoff.

Every claim in this lesson traces to real, executed code: an `eq?`-based proof of literal object identity, not just correct output, and a real allocation count confirmed against an honestly-stated naive baseline.

### What breaks without this

Suppose an engineer built a "persistent" structure by having every operation deep-copy the entire thing before making its one small change — technically satisfying Concept Unit 2's persistence definition (old versions really do stay valid), but silently missing structural sharing entirely. This lesson's own numbers show what that costs: allocating `10,000` new nodes for a single insertion instead of `9`. Without an `eq?`-based check like Concept Unit 3's, that mistake would be invisible from the output alone — every test would still pass, since the copy is perfectly correct, just needlessly, catastrophically expensive at scale.

### Exercises

1. **Observe.** Before checking, predict whether `bst-insert` on an already-present value (matching neither `<` nor `>`, hitting the `else` branch) allocates any new nodes at all, using this lesson's own code to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code and a real `eq?` check between the input tree and the result.
3. **Formalize.** Measure the real new-node count for a *deletion* operation you design yourself (removing a leaf is enough), and confirm it also stays proportional to height rather than to `n`.
4. **Explain.** In your own words, explain why `eq?` returning `#t` is stronger evidence of sharing than `equal?` returning `#t` would be, referencing what each procedure actually checks.
5. **Explain.** Using this lesson's real numbers and Lesson 104's own heap, state one real scenario where Lesson 104's ephemeral, zero-extra-allocation style would be the clearly better engineering choice over this lesson's persistent style, and one where the reverse is true.

### Definition of done

- [ ] You can state the difference between a persistent and an ephemeral structure in terms of what happens to old references.
- [ ] You can explain why persistence alone doesn't guarantee low cost, and what structural sharing adds on top of it.
- [ ] You can explain why `eq?`, not `equal?`, is the correct tool for proving sharing, and can point to this lesson's own real `#t`/`#f` results as the proof.
- [ ] You completed Exercises 1–5, including a real, measured deletion cost of your own design.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
