# Lesson 93: Tree Invariants

**What you will build**: By the end of this lesson you'll formally define the ordering invariant Lesson 92 only described in prose, as a real, checkable function — and *prove*, for every binary search tree whatsoever, not just the one example Lesson 92 happened to run, that `bst-insert` preserves it and `bst-search` depends on it for correctness, by generalizing Lesson 15's induction to Lesson 21's two-branch tree structure for the first time.

**What you need to know first**: Lesson 92's `bst-search`, `bst-insert`, and its informal ordering invariant; Lesson 15's induction (base case, inductive step); Lesson 16's invariants, specifically its state invariant; Lesson 17's proof by cases and proof by contradiction; Lesson 21's structural recursion, specifically its observation that a tree's recursive case names *two* smaller instances.

**Terms introduced in this lesson**:

- **structural induction** — proving a property holds for every instance of a recursively-defined data type by proving it for the base case, and proving that if it holds for every smaller instance a recursive case refers to, it also holds for the instance built from them. *Why it matters*: Lesson 15's induction only ever had *one* smaller instance per step (`n-1`); a tree's own recursive case (Lesson 19, Lesson 30) refers to *two* — this is the precise generalization that makes proving something about an entire tree possible at all.

**Objects and methods used**: None new. This lesson combines `and` (Lesson 7), `nil?` (Lesson 85), and Lesson 92's own `bst-value`, `bst-left`, `bst-right`, `bst-search`, and `bst-insert`, each already covered.

---

## Concept Unit: Generalizing Induction to Trees — Structural Induction

### The Problem

Lesson 92's "Connect the Pieces" ran `bst-insert` on exactly one tree, with exactly one new value, and observed the result still looked ordered. That's one data point — Lesson 9's exhaustive-checking limitation all over again. Lesson 15's induction proves a claim for *every* natural number using a base case and one inductive step. A binary tree isn't built the same way natural numbers are, though: Lesson 21 already showed a tree's recursive case refers to *two* smaller instances — a left subtree and a right subtree — not one. Does induction still work when there are two smaller instances to account for instead of one?

### Introduce the concept in isolation

**Structural induction** on binary trees: to prove a property *P* holds for every binary tree (Lesson 30's definition — the empty tree, or a value together with a left and a right subtree), prove:

1. *P* holds for the empty tree (the **base case**).
2. If *P* holds for a tree's left subtree **and** *P* holds for its right subtree (two **inductive hypotheses**, not one), then *P* holds for the tree built from a value together with those two subtrees (the **inductive step**).

Every piece of this is vocabulary this series has already built:

- *"for every binary tree"* — Lesson 9's universal quantifier, now ranging over trees instead of natural numbers.
- *"P holds for the empty tree"* — Lesson 15's base case, matching Lesson 30's own base case for a tree (the empty tree) exactly.
- *"if P holds for left and P holds for right"* — Lesson 15 needed exactly one inductive hypothesis, because the natural numbers' recursive case names one smaller instance (`n-1`). A tree's recursive case names *two* (Lesson 21's own observation, applied here for the first time to a proof rather than a function), so structural induction needs two hypotheses to match.
- *"then P holds for the tree built from them"* — Lesson 15's inductive step, generalized to combine two hypotheses instead of one.

### Discard the throwaway example

Not applicable — this is a formal proof technique, not code.

### Formal Definition, Walked Through

Already walked through, clause by clause, above — reusing three already-precise pieces of vocabulary (universal quantification, Lesson 15's base-case/inductive-step shape, Lesson 21's two-smaller-instances observation) rather than introducing new machinery.

### CS Lens

This is the exact proof-side mirror of Lesson 21's structural *recursion*: a structurally recursive function makes precisely the two recursive calls this induction principle needs hypotheses for, and nothing more — the same underlying fact (a tree's recursive case names two smaller instances) determines both how a correct function on trees is *shaped* and how a correct proof about trees is *structured*. Also recognized in: formal verification tools that generate one proof obligation per data-type constructor automatically, and any compiler's type-checker walking an AST recursively, handling each node kind by combining results already computed for its children.

### SE Lens

Lesson 21's SE lens claimed a structurally recursive function's shape is "almost forced" once a data definition is fixed — decide the base case's answer and the combining operation, and the rest follows. The identical benefit applies to proofs: once Lesson 30's tree definition is fixed, a structural-induction proof's shape is almost forced too — decide what's true of the empty tree and how two subtree hypotheses combine to say something about the whole tree, and the proof's own validity is inherited from Lesson 19's well-foundedness, the same guarantee that already made structural recursion's termination automatic.

---

## Concept Unit: Defining the Invariant Precisely, and Proving `bst-insert` Preserves It

### The Problem

Lesson 92 described the ordering invariant in prose — "smaller left, larger right, everywhere" — precise enough to write `bst-search` and `bst-insert` against, but never precise enough to prove something about. Stated formally, as a real function, and proven for *every* tree using this lesson's first unit: does `bst-insert` genuinely always preserve it, or only on the one tree Lesson 92 happened to check?

### Introduce the concept in isolation

```clojure
(defn bst-all-less-than? [node bound]
  (if (nil? node)
    true
    (and (< (bst-value node) bound)
         (bst-all-less-than? (bst-left node) bound)
         (bst-all-less-than? (bst-right node) bound))))

(defn bst-all-greater-than? [node bound]
  (if (nil? node)
    true
    (and (> (bst-value node) bound)
         (bst-all-greater-than? (bst-left node) bound)
         (bst-all-greater-than? (bst-right node) bound))))

(defn is-bst? [node]
  (if (nil? node)
    true
    (and (bst-all-less-than? (bst-left node) (bst-value node))
         (bst-all-greater-than? (bst-right node) (bst-value node))
         (is-bst? (bst-left node))
         (is-bst? (bst-right node)))))
```

```
user=> (is-bst? bst)
true
```

Run it against a tree that looks locally fine but isn't:

```clojure
(def broken-tree
  (make-bst-node 40
    (make-bst-node 35 nil (make-bst-node 45 nil nil))
    nil))
```

```
user=> (is-bst? broken-tree)
false
```

`broken-tree`'s *immediate* parent-child pairs each look ordered — `35 < 40` (left child less than root), `45 > 35` (right child greater than its own parent) — but `45` sits in `40`'s *left* subtree while being *greater* than `40` itself, which the true invariant forbids. This is exactly why `bst-all-less-than?` passes a `bound` down through every recursive call, checking each value against the bound inherited from an *ancestor*, not just against its immediate parent — a version that only compared immediate parent-child pairs would call `broken-tree` valid, incorrectly.

### Discard the throwaway example

Not applicable — `is-bst?`, `bst-all-less-than?`, and `bst-all-greater-than?` are real, reusable functions.

### Project Change

- **Reference Source**: `is-bst?` and its two helpers formalize Lesson 92's own prose description of the ordering invariant directly, in the sense Lesson 16's **state invariant** already gave that word — a condition checked against the data itself, wherever it appears, not tied to one specific loop.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn is-bst? [node]
  (if (nil? node)
    true
    (and (bst-all-less-than? (bst-left node) (bst-value node))
         (bst-all-greater-than? (bst-right node) (bst-value node))
         (is-bst? (bst-left node))
         (is-bst? (bst-right node)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? node)`** — reappearing base case (Lesson 85): an empty subtree trivially satisfies the invariant, with nothing inside it to violate anything.
- **`(bst-all-less-than? (bst-left node) (bst-value node))`, `(bst-all-greater-than? (bst-right node) (bst-value node))`** — first appearance of passing a *bound* down through recursive calls rather than only comparing a node to its immediate parent — precisely the mechanism that catches `broken-tree`, which no immediate-parent-only check could.
- **`(is-bst? (bst-left node))`, `(is-bst? (bst-right node))`** — reappearing structural recursion (Lesson 21, Lesson 30): the ordering constraint must hold not just *between* a node and its two subtrees, but recursively *within* each subtree too.
- **`and`** — reappearing (Lesson 7): all four conditions must hold together for the whole tree to be valid; the first falsy one short-circuits the rest, exactly Lesson 7's own `(and 5 10)` behavior applied here to four boolean checks instead of two.

### Formal Statement and Proof

**Theorem.** For every node `node` and every `target`: if `is-bst?(node)` holds, then `is-bst?(bst-insert(node, target))` holds.

This needs one supporting fact first:

**Lemma (bounds survive insertion).** If `bst-all-less-than?(node, bound)` holds and `target < bound`, then `bst-all-less-than?(bst-insert(node, target), bound)` holds. (Symmetrically for `bst-all-greater-than?` and `target > bound`.)

*Proof of the Lemma*, by structural induction (this lesson's first unit) on `node`:

- **Base case, `node = nil`**: `bst-insert(nil, target)` builds a single leaf holding `target`. `bst-all-less-than?` on that leaf requires `target < bound` (given directly) and the trivial `nil` case twice over. Holds.
- **Inductive step**, `node` non-empty with value `v`: by proof by cases (Lesson 17) on `bst-insert`'s three branches — `target = v` returns `node` unchanged, so the already-given hypothesis carries over unchanged; `target < v` or `target > v` rebuilds one subtree via a recursive `bst-insert` call, and the **inductive hypothesis** (this lemma, assumed for that smaller subtree) applies directly, since that subtree's own bound-check already held and `target < bound` was given regardless of which branch fired. Holds either way.

*Proof of the Theorem*, by structural induction on `node`, using the Lemma:

- **Base case, `node = nil`**: `bst-insert(nil, target)` is a leaf — both its subtrees are empty, so `is-bst?` holds trivially (vacuously, in Lesson 15's own sense).
- **Inductive step**, `node = (make-bst-node v left right)`, with `is-bst?(node)` given — meaning `bst-all-less-than?(left, v)`, `bst-all-greater-than?(right, v)`, `is-bst?(left)`, and `is-bst?(right)` all hold — and, by structural induction, two inductive hypotheses available: `is-bst?(left) implies is-bst?(bst-insert(left, target))`, and the same for `right`.
  - **`target = v`**: `node` is returned unchanged; `is-bst?(node)` was already given. Holds.
  - **`target < v`**: the new node is `(make-bst-node v (bst-insert left target) right)`. Its four required conditions: `bst-all-less-than?(bst-insert(left, target), v)` holds by the **Lemma** (`bst-all-less-than?(left, v)` was given, and `target < v` matches the branch just taken); `bst-all-greater-than?(right, v)` holds unchanged; `is-bst?(bst-insert(left, target))` holds by the **inductive hypothesis** for `left`; `is-bst?(right)` holds unchanged. All four hold.
  - **`target > v`**: symmetric, recursing right instead.

By structural induction, the theorem holds for every `node`. ∎

### CS Lens

This proof is Lesson 16's state invariant, made fully formal for the first time on real, structured data rather than only described in prose: "the ordering invariant holds for the current value" is exactly the kind of claim Lesson 16 said has to be defended everywhere a value could be created or modified, and this proof is that defense, discharged once, for the one place (`bst-insert`) this series has for modifying a BST.

### SE Lens

`is-bst?` itself costs `O(n)` to run — checking the invariant after the fact means re-scanning the entire tree. Proving `bst-insert` preserves the invariant, once, for every possible tree, is precisely what makes it unnecessary to ever pay that `O(n)` cost after a real insertion just to stay confident the tree is still valid — the proof substitutes for repeated checking, the same tradeoff Lesson 15's SE lens already made for testing versus induction.

### Connection to the previous unit

The previous unit stated structural induction's general shape; this unit filled it in completely, for a real, non-obvious claim about real code — turning the abstract template into a finished, working proof.

---

## Concept Unit: Proving `bst-search` Is Correct, Given the Invariant

### The Problem

Lesson 92's own closing section showed, by a single example, that a misordered *array* makes binary search silently miss a present value. Does `bst-search`'s correctness actually *depend* on `is-bst?` holding — provably, not just by one example — the way that array example only suggested informally?

### Introduce the concept in isolation

**Theorem.** If `is-bst?(node)` holds, then for every `target`: if `target` is present anywhere in `node`'s tree, `bst-search(node, target)` finds it.

*Proof*, at an arbitrary node `node` with value `v`, by proof by cases (Lesson 17) on how `bst-search` compares `target` to `v`:

- **`target = v`**: found immediately, at this very node.
- **`target < v`**: `bst-search` recurses into `bst-left node`. Suppose, for contradiction (Lesson 17), that `target` were instead present somewhere in `bst-right node`. Since `is-bst?(node)` holds, `bst-all-greater-than?(bst-right node, v)` holds — every value in the right subtree is greater than `v`. So `target`, if present there, would have to satisfy `target > v` — directly contradicting `target < v`. So `target` cannot be in the right subtree; if it's present at all, it's in the left subtree, exactly where `bst-search` just recursed.
- **`target > v`**: symmetric — a value in the left subtree would have to be less than `v`, contradicting `target > v`.

This argument applies at *every* node `bst-search` visits, and each subtree it recurses into is itself smaller and still satisfies `is-bst?` (Lesson 30's structural recursion guarantees the first; the fact that `is-bst?` of a node requires `is-bst?` of both its subtrees, by `is-bst?`'s own definition, guarantees the second). By structural induction (this lesson's first unit), the argument holds no matter how deep `target` actually sits. ∎

### Discard the throwaway example

Not applicable — this is a formal proof about already-established code (Lesson 92's `bst-search`), not new code.

### Mechanical walkthrough — how the proof works, step by step

1. **`target = v`** — the direct, immediately-verified case: nothing to search further.
2. **`target < v`, assume for contradiction `target` is in the right subtree** — a hard concept reappearing: this is Lesson 17's proof by contradiction, applied here to a specific subtree membership claim instead of a numeric result.
3. **`bst-all-greater-than?(bst-right node, v)` forces `target > v`** — the invariant, proven preserved by the previous unit, doing the actual work: without it, nothing would rule out `target` hiding in the "wrong" subtree.
4. **Contradiction with `target < v`** — the impossibility Lesson 17's technique requires: `target` cannot be both less than and greater than the same value `v`.
5. **Generalize via structural induction** — reappearing (this lesson's first unit): the same argument, re-applied at whichever node comes next, covers a target at any depth.

### CS Lens

"Assume the target is on the wrong side, derive a contradiction from the invariant" is the same technique binary search itself used informally (Lesson 91's own justification for eliminating half the array without inspecting it) — the array's contiguous, globally sorted order and a BST's locally-enforced invariant are two different structures licensing the identical proof move. Also recognized in: a database query planner skipping an index partition it can prove, from that partition's own known bounds, cannot contain a matching row.

### SE Lens

This proof's hypothesis is `is-bst?(node)` — not "the tree looks roughly ordered," the exact, formal condition the previous unit proved `bst-insert` preserves. `broken-tree`, from the previous unit, violates that hypothesis directly, which means this theorem simply doesn't apply to it — and, as the closing section shows concretely, `bst-search` on a tree that violates the invariant doesn't just run slower (Lesson 92's own concern), it can return a wrong answer outright, a strictly worse failure than the speed loss a degenerate-but-valid tree causes.

### Connection to the previous unit

The previous unit proved the invariant survives the one operation that changes a BST; this unit proves the invariant is exactly what the other operation's own correctness rests on — together, the two units justify everything Lesson 92 only demonstrated by running code on one example.

---

## Connect the Pieces

Both proofs, confirmed on Lesson 92's own running example, using this lesson's checker rather than only visual inspection:

```clojure
(println "Original bst is valid:" (is-bst? bst))
(def bst2 (bst-insert bst 25))
(println "After inserting 25, still valid:" (is-bst? bst2))
(println "bst-search still finds 25:" (bst-search bst2 25))
```

```
Original bst is valid: true
After inserting 25, still valid: true
bst-search still finds 25: 25
```

Nothing here needed hand-tracing to be trusted — the second unit's theorem already guarantees `is-bst?(bst2)` had to come out `true`, for *any* value inserted into *any* tree that started valid, not just `25` inserted into this particular `bst`.

## What Breaks Without This

Return to `broken-tree`, where the invariant this lesson formalized does *not* hold:

```clojure
(println "broken-tree is valid:" (is-bst? broken-tree))
(println "bst-search for 45:" (bst-search broken-tree 45))
```

```
broken-tree is valid: false
bst-search for 45: nil
```

`45` is genuinely present in `broken-tree` — it's `40`'s left child's right child, sitting right there in the structure — but `bst-search` reports it absent. This is exactly what the second unit's theorem predicted would happen the moment its hypothesis fails: `is-bst?(broken-tree)` is `false`, so the correctness proof simply doesn't cover this tree, and `bst-search`'s comparison at the root (`45 > 40`, go right) sends it away from the one branch that actually contains `45`. This isn't a new bug in `bst-search` — the function hasn't changed at all since Lesson 92 — it's the precise, predicted consequence of an invariant this lesson proved is required, being violated.

## Exercises

1. **Trace.** By hand, trace `(is-bst? broken-tree)`, showing exactly which call to `bst-all-less-than?` or `bst-all-greater-than?` returns `false` first.
2. **Predict.** Before checking, predict whether `(bst-search broken-tree 40)` (searching for the root's own value) succeeds. Verify by tracing — does a violated invariant break *every* search, or only some?
3. **Verify.** Construct your own tree that violates the invariant differently from `broken-tree` (put an out-of-bounds value in a *right* subtree instead of a left one), confirm `is-bst?` reports it `false`, and find a value `bst-search` fails to locate on it.
4. **Break it, on purpose.** Write a deliberately weaker version of `is-bst?` that only compares each node to its *immediate* children, not to an inherited bound. Confirm it incorrectly reports `broken-tree` as valid.
5. **Generalize.** Prove, using this lesson's structural induction (Concept Unit 1) and proof by cases (Lesson 17), that `bst-search(node, target)` returns `nil` whenever `target` is genuinely absent from a *valid* tree — the direction this lesson's second proof didn't cover.
6. **Reconstruct.** Close this lesson. From memory, state structural induction's two parts, and explain why a tree needs two inductive hypotheses where Lesson 15's induction needed only one.

## Definition of Done

- [ ] You can state structural induction's base case and inductive step from memory, and explain why it needs two hypotheses for a binary tree.
- [ ] You can explain, using the Lemma and Theorem this lesson proved, why `bst-insert` can never produce an invalid tree from a valid one.
- [ ] You can explain why `bst-search`'s correctness proof genuinely requires `is-bst?` to hold, not just "the tree looks sorted."
- [ ] You completed Exercise 3 and found a value a corrupted tree fails to locate.
- [ ] You completed Exercise 5 and proved the absent-value direction of `bst-search`'s correctness.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you found and proved — for example, `"Construct right-subtree invariant violation; confirm bst-search misses it; prove bst-search correctly returns nil on genuinely absent values in a valid tree"` — not just `"lesson 93 exercise"`.

---

**Next lesson:** Lesson 94, *Heaps*, moves to a tree-shaped invariant of a genuinely different kind — not an ordering between a node's left and right subtrees, but a constraint between a node and its *parent* — deriving priority queues from that different partial ordering, and reusing this lesson's structural-induction technique on new ground.
