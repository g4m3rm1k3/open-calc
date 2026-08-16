# Lesson 153: Functors as Structure-Preserving Transformations

**What you will build**: By the end of this lesson you'll write `map-tree`, a tree's own version of Lesson 25's `map` — transforming every value inside a tree while leaving its exact shape untouched — and prove that directly: the doubled tree has exactly as many nodes as the original, checked with Lesson 149's own `count-nodes`, not assumed. Both `map` and `map-tree` are **functors**: a way to apply a function "inside" a structure without disturbing the structure itself.

**What you need to know first**: Lesson 25's `map`; Lesson 149's tree constructors and `count-nodes`; Lesson 139's abstraction, revisited here as "shape" specifically.

**Terms introduced in this lesson**:

- **functor** — a structure that supports mapping a function over every value it holds, producing the identical structure with only the values transformed. *Why it matters*: names precisely what Lesson 25's `map` and this lesson's `map-tree` share — a list and a tree look nothing alike, but "transform every value, keep the shape" is the identical operation on both.

**Objects and methods used**: None new. This lesson reuses `map` (Lesson 25), `nil?` (Lesson 136), and `=`/`not=` (Lesson 6, Lesson 136), each already covered.

---

## Concept Unit: `map` Already Preserved Shape

### The Problem

Lesson 25's `map` has always transformed every element of a list. Was it also, this whole time, guaranteeing something about the list's own *shape* — not just its contents?

### Introduce the concept in isolation

```clojure
(defn double-it [x] (* x 2))
```

```
user=> (map double-it [1 2 3])
(2 4 6)
user=> (count [1 2 3])
3
user=> (count (map double-it [1 2 3]))
3
```

`map`'s result has exactly as many elements as its input — `3`, both times, checked directly rather than assumed. Every value changed (`1`, `2`, `3` became `2`, `4`, `6`), but the *count*, the list's own shape, didn't move at all.

### Discard the throwaway example

Not applicable — every result is real, `map` used exactly as Lesson 25 already taught it.

### Project Change

- **Reference Source**: No reference counterpart — direct verification of `map`'s already-existing, already-taught behavior against a property never explicitly named before.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit verifies an existing function's existing behavior rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(map double-it [1 2 3])`** — reappearing `map` (Lesson 25), applied here specifically to observe its shape-preserving behavior, not only its value-transforming one.
- **`(count [1 2 3])`, `(count (map double-it [1 2 3]))`** — reappearing `count` (Lesson 94), compared directly to confirm shape (length) is unchanged.

### CS Lens

Lists are the first, most familiar example of a **functor**: a structure supporting "transform every value, keep the shape" as one operation — `map`, already fully built, already fully understood, only now given the general name this property has beyond lists specifically.

### SE Lens

Guaranteeing shape preservation is what makes `map`'s result predictable without inspecting it: any code that already knows how to walk the *original* list's shape can walk `map`'s result the identical way, with zero adjustment, because the shape itself is a guarantee, not an accident of how `map` happens to be implemented.

---

## Concept Unit: `map-tree` — the Identical Guarantee, for Trees

### The Problem

Does a tree support the same "transform every value, keep the shape" operation `map` gives lists — and can that be proven, not just claimed by analogy?

### Introduce the concept in isolation

```clojure
(defn map-tree [t f]
  (if (nil? t)
    nil
    (make-node (f (node-value t)) (map-tree (node-left t) f) (map-tree (node-right t) f))))
```

```
user=> (def tree (make-node 5 (make-node 3 nil nil) (make-node 8 nil (make-node 9 nil nil))))
user=> (map-tree tree double-it)
[10 [6 nil nil] [16 nil [18 nil nil]]]
user=> (count-nodes tree)
4
user=> (count-nodes (map-tree tree double-it))
4
```

`map-tree tree double-it` produces a genuinely new tree — every value doubled, `5 \to 10`, `3 \to 6`, `8 \to 16`, `9 \to 18` — with `nil?`/`make-node`'s own structure exactly mirrored at every point the original had it. `count-nodes`, Lesson 149's own function, confirms the shape claim directly: `4` nodes before, `4` nodes after, not assumed from the code's own resemblance to `map`.

### Discard the throwaway example

Not applicable — `map-tree` is real, reusable, and its shape-preservation checked with an already-built, independent function (`count-nodes`), not merely inspected by eye.

### Project Change

- **Reference Source**: Lesson 149's own tree constructors (`make-node`, `node-value`, `node-left`, `node-right`), reused directly, unchanged.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn map-tree [t f]
  (if (nil? t)
    nil
    (make-node (f (node-value t)) (map-tree (node-left t) f) (map-tree (node-right t) f))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (nil? t) nil ...)`** — reappearing base case (Lesson 149's own `fold-tree`, restated): an empty subtree maps to an empty subtree — the shape's own empty case, preserved exactly.
- **`(make-node (f (node-value t)) (map-tree (node-left t) f) (map-tree (node-right t) f))`** — first appearance of this specific shape: rebuilds the *identical* node structure, applying `f` only to the value slot, while both subtree slots get the identical recursive treatment — never `fold-tree`'s single combined result, always a real new node.

### CS Lens

`map-tree` and `fold-tree` (Lesson 149) share a recursive skeleton but do genuinely different jobs: `fold-tree` collapses a tree down to one value; `map-tree` produces another tree, same shape, transformed values — the difference between a functor's `map` and a monoid-driven fold, even though both walk the identical structure.

### SE Lens

Any code written to walk a tree's shape — searching it, printing it, measuring its height — works unmodified on `map-tree`'s output, for the identical reason list-walking code works unmodified on `map`'s output: the shape guarantee is what makes that safe, not a coincidence specific to this one example.

### Connection to the previous unit

The previous unit showed `map` preserves a list's shape; this unit shows `map-tree` gives the identical guarantee for a genuinely different structure, confirmed the same way — checking, not assuming.

---

## Connect the Pieces

Both functors, shape preservation checked directly on each:

```clojure
(println "List: same count?" (= (count [1 2 3]) (count (map double-it [1 2 3]))))
(println "Tree: same node count?" (= (count-nodes tree) (count-nodes (map-tree tree double-it))))
(println "Tree: values actually changed?" (not= tree (map-tree tree double-it)))
```

```
List: same count? true
Tree: same node count? true
Tree: values actually changed? true
```

Two structures that share nothing in common except this one property — map, applied, changes what's inside without ever changing the shape holding it.

## What Breaks Without This

Suppose `map-tree` had a bug that occasionally dropped a subtree — say, mishandling the case where `node-right` returns `nil` but `node-left` doesn't. Code downstream that trusted `map-tree`'s shape-preservation guarantee — comparing the mapped tree's own structure against the original for validation, say — would silently pass a tree with real, missing data, because nothing about calling `map-tree` warns that the guarantee might not hold this time. This lesson's own `count-nodes` check isn't decorative: it's the concrete, checkable proof that the guarantee a functor promises is actually being kept, the same discipline this curriculum has applied to every other property claimed since Lesson 108.

## Exercises

1. **Trace.** By hand, trace `(map-tree tree double-it)` through all four nodes, confirming each value doubles while every `nil?`/real-node position stays exactly where it was in the original.
2. **Predict.** Before checking, write a named function that subtracts `1` from its argument, predict whether mapping it over `tree` with `map-tree` changes `count-nodes`'s result, then verify.
3. **Verify.** Confirm `map-tree tree double-it`, mapped a *second* time with `double-it` again, quadruples every original value while node count still stays `4`.
4. **Break it, on purpose.** Write a deliberately broken `map-tree` variant that returns `nil` instead of recursing into `node-right` under some condition, and show `count-nodes` on its output no longer matches the original.
5. **Generalize.** Describe, without coding it, what `map-tree` would need to look like for a tree where each node has three children instead of two, the same generalization Lesson 149's own Exercise 5 asked for `fold-tree`.
6. **Reconstruct.** Close this lesson. From memory, explain why `map-tree` and `fold-tree` walk the identical recursive skeleton but produce fundamentally different kinds of results.

## Definition of Done

- [ ] You can explain why `map` preserves a list's shape, and demonstrate it with a real `count` comparison.
- [ ] You can write `map-tree` and explain why it rebuilds the tree rather than combining it to one value.
- [ ] You can explain the real difference between `map-tree` (Lesson 153) and `fold-tree` (Lesson 149), despite their shared recursive skeleton.
- [ ] You completed Exercise 3 and confirmed a double-mapped tree quadruples values while keeping node count fixed.
- [ ] You completed Exercise 4 and showed a broken `map-tree` variant fails the shape-preservation check.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm double-mapping quadruples values with node count unchanged; show a right-dropping map-tree variant breaks count-nodes agreement"` — not just `"lesson 153 exercise"`.

---

**Next lesson:** Lesson 154, *Monads as Computational Composition*, tackles a case `map`/`map-tree` can't handle cleanly — a function that might fail, or that needs to chain with others that might also fail — the real, practical problem monads exist to solve, explained before any formal definition.
