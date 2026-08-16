# Lesson 106: Representation Invariants

**What you will build**: By the end of this lesson you'll formalize a distinction this series has used without naming since Lesson 30 — what a data type *promises* to callers, versus what its chosen internal representation must always satisfy for that promise to hold — and prove it directly, with real code and real output, using three structures already built in this section.

**What you need to know first**: Lesson 92's BST and `is-bst?` (Lesson 93); Lesson 98's AVL tree; Lesson 99's red-black tree; Lesson 16's state invariant, which this lesson finally gives its long-promised formal treatment.

**Terms introduced in this lesson**:

- **abstract data type (ADT)** — a specification of operations and their observable behavior, with nothing said about how they're implemented. *Why it matters*: "an ordered set supporting insert, membership, and minimum" is an ADT; Lesson 92's BST, Lesson 98's AVL tree, and Lesson 99's red-black tree are three *different* answers to "how," all satisfying the *same* answer to "what."
- **representation invariant** — the specific condition a chosen representation must satisfy for its operations to actually deliver what the ADT promises. *Why it matters*: Lesson 93's `is-bst?`, Lesson 98's balance factor bound, and Lesson 99's four red-black rules are three different representation invariants, each specific to its own representation, all serving the identical ADT.
- **abstraction barrier** — the boundary past which a caller of an ADT is not permitted to rely on representation details, only on the ADT's own promised interface. *Why it matters*: the precise reason Lesson 92 built `bst-value`/`bst-left`/`bst-right` instead of letting callers reach into the raw `[value left right]` vector directly.

**Objects and methods used**: None new. This lesson reuses `is-bst?` (Lesson 93), `bst-insert` and `avl-insert` (Lessons 92, 98), `bst-height` (Lesson 98), and `count`/`get` (Lesson 84), each already covered.

---

## Concept Unit: One Promise, Two Representations, Proven

### The Problem

Lesson 92's BST and Lesson 98's AVL tree both support inserting a value and checking whether a value is present. Are these genuinely different data structures, or two different ways of keeping the identical promise — and can that be checked directly, rather than only argued in prose?

### Introduce the concept in isolation

Build the same five values, in the same sorted order, two different ways:

```clojure
(def plain-tree (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert nil 10) 20) 30) 40) 50))
(def avl-tree (avl-insert (avl-insert (avl-insert (avl-insert (avl-insert nil 10) 20) 30) 40) 50))
```

```
user=> (is-bst? plain-tree)
true
user=> (is-bst? avl-tree)
true
user=> (bst-height plain-tree)
4
user=> (bst-height avl-tree)
2
```

Both trees satisfy `is-bst?` — the identical shared promise. But `plain-tree` (Lesson 92's own degenerate sorted-insertion case) has height `4`, while `avl-tree` (Lesson 98's own rebalancing) has height `2` — genuinely different shapes, built from the identical five values in the identical order, both keeping the same promise in different ways.

### Discard the throwaway example

Not applicable — `plain-tree` and `avl-tree` are real trees, built entirely from already-verified functions.

### Project Change

- **Reference Source**: Direct reuse of Lesson 92's `bst-insert`, Lesson 98's `avl-insert`, Lesson 93's `is-bst?`, and Lesson 98's `bst-height`, run here on identical input for the first time to compare their results directly.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def avl-tree (avl-insert (avl-insert (avl-insert (avl-insert (avl-insert nil 10) 20) 30) 40) 50))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(bst-insert (bst-insert ... nil 10) ... 50)`** — reappearing (Lesson 92): five nested calls, each landing the current value as a right child of the previous one, since each new value is larger than every value already present — Lesson 92's own degenerate case, reproduced deliberately here.
- **`(avl-insert (avl-insert ... nil 10) ... 50)`** — reappearing (Lesson 98): the identical five values, identical order, but `avl-rebalance` fires during this sequence (Lesson 98's own single-rotation case), producing a different shape.
- **`(is-bst? plain-tree)`, `(is-bst? avl-tree)`** — reappearing (Lesson 93): the *same* checker function, run against two structurally different trees, both returning `true`.
- **`(bst-height plain-tree)`, `(bst-height avl-tree)`** — reappearing (Lesson 98): the concrete, numeric evidence that "different representation" isn't just a claim — one tree is measurably twice as deep as the other, for the same five values.

### CS Lens

This is Lesson 27's own realization about `reduce` — one shape, several different fillings — reapplied one level up: not several functions sharing a recursive shape, but two entire *data structures* sharing an *interface*, each free to choose its own internal representation as long as its own invariant keeps the shared promise true, now checked directly rather than assumed.

### SE Lens

`avl-insert` reuses `bst-search` *unchanged* from Lesson 92 — this is why: `bst-search`'s own correctness proof (Lesson 93) only ever depended on `is-bst?` holding, and both trees built here, despite their different shapes, both satisfy exactly that.

---

## Concept Unit: The Abstraction Barrier, Proven to Break

### The Problem

If a caller only ever uses `bst-search` — never reaching into a node's raw vector directly — does it matter to that caller which of this lesson's two trees it's given? And if a caller *does* reach past the interface, can that difference be made to actually break something, concretely?

### Introduce the concept in isolation

```clojure
(defn caller-a-check [tree target] (bst-search tree target))
(defn caller-b-check [tree] (= (bst-value tree) 10))
```

```
user=> (caller-a-check plain-tree 30)
30
user=> (caller-a-check avl-tree 30)
30
user=> (caller-b-check plain-tree)
true
user=> (caller-b-check avl-tree)
false
```

`caller-a-check`, using only the interface, gives the *identical* correct answer on both trees. `caller-b-check` assumes something no ADT promise ever stated — that the root's specific value is `10` — and that assumption happens to be true for `plain-tree` (its own degenerate shape puts `10` at the root) and *false* for `avl-tree` (rebalancing moved `20` to the root instead), for the exact same five values. `caller-b-check` has crossed the **abstraction barrier**, and the break is no longer hypothetical.

### Discard the throwaway example

Not applicable — both callers are real functions, run against both real trees.

### Project Change

- **Reference Source**: No reference counterpart — a direct illustration built from this lesson's own `plain-tree`/`avl-tree`, and Lesson 92's `bst-value`/`bst-search`.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn caller-b-check [tree] (= (bst-value tree) 10))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(bst-search tree target)`** — reappearing (Lesson 92, proven Lesson 93): uses only the ordering invariant every representation in this lesson satisfies — nothing representation-specific.
- **`(= (bst-value tree) 10)`** — first appearance of a genuinely representation-dependent check: `bst-value` is a legitimate accessor (not a raw `get`), but *which* value it returns at the root depends entirely on shape, which this lesson's own first unit already proved differs between representations.

### CS Lens

`caller-b-check` isn't wrong the way a bug is wrong — it's an assumption that happened to hold for one specific representation, for reasons the ADT's own interface never promised, and this unit's run output is the direct, measured proof that the assumption silently stops holding the moment the representation changes underneath it.

### SE Lens

This is precisely why Lesson 92 built `bst-value`/`bst-left`/`bst-right` instead of leaving every caller to write its own `(get node 0)` directly — not because the raw vector is secret, but because code written against the *interface* (`caller-a-check`) keeps working when the *representation* changes, and code written against representation details (`caller-b-check`) demonstrably does not, confirmed here rather than only argued.

### Connection to the previous unit

The previous unit proved one promise served by two representations; this unit proves that substitutability is only real for callers who respect the boundary between the two — a caller reaching past it loses exactly the property the previous unit demonstrated, shown here breaking on real output.

---

## Concept Unit: Establishing and Maintaining the Invariant, Checked at Every Step

### The Problem

A representation invariant is only useful if it's actually guaranteed to hold, always — not merely true of the two hand-built trees above. Can that guarantee be checked directly, at *every* intermediate step of a real build, rather than only at the end?

### Introduce the concept in isolation

```clojure
(defn check-invariant-at [tree values i]
  (if (>= i (count values))
    (is-bst? tree)
    (if (is-bst? tree)
      (check-invariant-at (bst-insert tree (get values i)) values (+ i 1))
      false)))

(defn check-invariant-throughout [values]
  (check-invariant-at nil values 0))
```

```
user=> (check-invariant-throughout [10 20 30 40 50])
true
```

`check-invariant-throughout` doesn't just check the *final* tree — it checks `is-bst?` before the very first insertion (`nil`, vacuously valid — **establishment**), and again after every single insertion along the way (**preservation**), returning `false` immediately the instant any intermediate state fails. `true` here is direct, empirical confirmation of both halves of Lesson 93's proof, run against a real five-step sequence rather than trusted from the proof alone.

### Discard the throwaway example

Not applicable — `check-invariant-at` and `check-invariant-throughout` are real, reusable functions.

### Project Change

- **Reference Source**: Reuses Lesson 93's `is-bst?` and Lesson 92's `bst-insert` directly, combined here for the first time into a step-by-step verifier rather than a single end-state check.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn check-invariant-throughout [values]
  (check-invariant-at nil values 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(check-invariant-at nil values 0)`** — first appearance: starts from `nil`, the representation's own **establishment** case — Lesson 93's base case, checked here directly rather than only cited.
- **`(if (>= i (count values)) (is-bst? tree) ...)`** — reappearing counting-up base case (Lesson 94): once every value has been inserted, the final `is-bst?` check is the last of many, not the only one performed.
- **`(if (is-bst? tree) (check-invariant-at ...) false)`** — first appearance: **preservation**, checked fresh at *every* step — a single `false` anywhere in the sequence would short-circuit immediately, rather than being hidden by only checking the end result.

### CS Lens

Establishment and preservation are Lesson 16's initialization and maintenance, applied to a data type's shape instead of a loop's running state — and `check-invariant-throughout` is that same three-part discipline (Lesson 16's loop invariant), instantiated directly: `nil` is initialization, each `bst-insert` step is maintenance, and the final `true` is the guarantee actually cashed in.

### SE Lens

`check-invariant-throughout` costs real, repeated `O(n)` `is-bst?` checks — exactly the expensive, after-the-fact verification Lesson 93's *proof* was meant to make unnecessary in a real system. Running it here is a deliberate, one-time demonstration that the proof's claim actually holds on real data, not a technique to leave running in production.

### Connection to the previous unit

The previous unit showed what happens when a caller ignores the abstraction barrier; this unit shows what backs the barrier from the other side — a real, checked guarantee that every representation this lesson built actually keeps its invariant true at every single step, not merely at the moments this series happened to look.

---

## Connect the Pieces

All three units' checks, together, on one final comparison:

```clojure
(println "plain-tree valid?" (is-bst? plain-tree) "height:" (bst-height plain-tree))
(println "avl-tree valid?" (is-bst? avl-tree) "height:" (bst-height avl-tree))
(println "caller-a-check agrees across both:" (= (caller-a-check plain-tree 30) (caller-a-check avl-tree 30)))
(println "caller-b-check agrees across both:" (= (caller-b-check plain-tree) (caller-b-check avl-tree)))
(println "Invariant held at every step, building avl-tree's own sequence:" (check-invariant-throughout [10 20 30 40 50]))
```

```
plain-tree valid? true height: 4
avl-tree valid? true height: 2
caller-a-check agrees across both: true
caller-b-check agrees across both: false
Invariant held at every step, building avl-tree's own sequence: true
```

Every line is measured, not asserted: two valid representations, one interface that behaves identically across both, one representation-dependent assumption that demonstrably does not, and one guarantee confirmed at every intermediate step of a real build.

## What Breaks Without This

Suppose a system used `avl-insert` to build a tree, but a later maintenance patch — written by someone who only ever saw `bst-value`/`bst-left`/`bst-right`, never `avl-rebalance` itself — replaced `avl-insert` with plain `bst-insert` "since it does the same thing, just simpler." Every caller using only `bst-search`-style operations still gets *correct* answers — `is-bst?` never breaks, since `bst-insert` was always designed to preserve it, confirmed directly by this lesson's own third unit. But any caller depending on the *stronger* guarantee — bounded height specifically, not just correctness — now has no promise left backing that assumption, and nothing in the code signals the change: `(is-bst? ...)` stays `true` throughout, exactly as `check-invariant-throughout` would report, while `(bst-height ...)` silently drifts toward Lesson 92's own worst case with every future insertion.

## Exercises

1. **Trace.** By hand, confirm `bst-value plain-tree` is `10` and `bst-value avl-tree` is `20`, tracing each tree's own construction to explain why.
2. **Predict.** Before checking, predict whether `(check-invariant-throughout [50 40 30 20 10])` (descending order) returns `true`. Verify.
3. **Verify.** Write `check-avl-invariant-throughout`, the same step-by-step checker as this lesson's third unit, but checking both `is-bst?` *and* every balance factor staying in `\{-1,0,1\}` (Lesson 98) at each step, built using `avl-insert` instead of `bst-insert`.
4. **Break it, on purpose.** Write your own `caller-c-check`, assuming something about `plain-tree`'s or `avl-tree`'s *specific depth* rather than its root value, and confirm it also disagrees between the two representations.
5. **Generalize.** State Lesson 96's priority-queue ADT (two operations, no representation details), then state Lesson 94's heap representation invariant separately, the way this lesson separated "ordered set" from `is-bst?`.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between an ADT and a representation invariant, and explain why `caller-a-check` agrees across representations while `caller-b-check` does not.

## Definition of Done

- [ ] You can state an ADT's promise without mentioning any representation detail.
- [ ] You can name the representation invariant for at least three structures built in this section.
- [ ] You can explain the abstraction barrier and point to this lesson's own run output showing it break.
- [ ] You completed Exercise 3 and implemented a step-by-step AVL invariant checker.
- [ ] You completed Exercise 5 and separated Lesson 96's ADT from Lesson 94's representation invariant cleanly.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you built — for example, `"Implement check-avl-invariant-throughout (is-bst? + balance factor, checked at every step); separate priority-queue ADT from heap representation invariant"` — not just `"lesson 106 exercise"`.

---

**Next lesson:** Lesson 107, *Choosing Data Structures*, uses exactly this lesson's ADT-versus-representation vocabulary to build a real, repeatable method for deciding which of this section's many representations actually fits a given problem's operations, workload, and constraints.
