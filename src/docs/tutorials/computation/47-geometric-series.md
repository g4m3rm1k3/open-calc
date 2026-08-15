# Lesson 47: Geometric Series

**What you will build**: By the end of this lesson you'll be able to derive the closed-form sum of a sequence that *multiplies* by a fixed ratio at every step — a genuinely different derivation technique than either of the previous lesson's — and use it to count exactly how many nodes a complete binary tree of a given depth has, connecting directly back to the branching shape Lesson 23's `fib` evaluation tree and Lesson 32's `power-set` both already exhibited.

**What you need to know first**: Lesson 46's arithmetic series and pairing derivation, Lesson 43's exponent laws, and Lesson 30's binary trees.

**Terms introduced in this lesson**:

- **geometric series** — a sum of numbers where each term is a fixed multiple, called the common ratio, of the previous one. *Why it matters*: the multiplicative counterpart to Lesson 46's arithmetic series — this is the exact shape behind every exponential-growth pattern this series has already measured by hand, from `fib`'s evaluation tree to `power-set`'s doubling subset count.

**Objects and methods used**: None new. This lesson combines `if`, `=`, `+`, `-`, `*`, `/`, and `power` (Lesson 42), each already fully covered.

---

## Concept Unit: Deriving the Geometric Series Formula

### The Problem

Lesson 46's pairing trick worked because an arithmetic series' terms increase by a fixed *amount*. A **geometric series** — `a + ar + ar² + ... + ar^(n-1)` — increases by a fixed *ratio* instead; pairing the first and last terms no longer produces a constant total the way it did for addition. Is there an analogous trick for multiplication?

### Introduce the concept in isolation

Multiply the whole sum by `r`, and subtract the original from the result:

```
   S = a + ar + ar² + ... + ar^(n-1)
  rS =     ar + ar² + ... + ar^(n-1) + ar^n
--------------------------------------------
S - rS = a - ar^n
```

Every term except the very first (`a`) and the very last (`ar^n`, appearing only in `rS`) cancels exactly — `ar` appears in both `S` and `rS`, `ar²` appears in both, and so on, all the way through `ar^(n-1)`. What's left is `S - rS = a - ar^n`, which factors (Lesson 13) as `S(1-r) = a(1-r^n)`, giving:

> **S = a(1 - rⁿ) / (1 - r)**, for `r ≠ 1`

Check it against a concrete case: `a = 1`, `r = 2`, `n = 4` terms (`1 + 2 + 4 + 8`): direct addition gives `15`; the formula gives `1 × (1 - 2⁴) / (1 - 2) = (1 - 16) / (-1) = (-15) / (-1) = 15` — matching exactly.

### Discard the throwaway example

Not applicable — this is a formal derivation, verified against real code in Concept Unit 2.

### Generalizing

This "multiply by the ratio, subtract, watch everything cancel" technique is called **telescoping** — the middle terms collapse away, leaving only the two ends, the same visual image as a collapsing telescope. It's a genuinely different derivation method than Lesson 46's pairing, arriving at an analogous kind of closed-form result for a structurally different (multiplicative, not additive) series.

### CS Lens

Telescoping recurs throughout mathematics and computer science wherever a sum or product has this cancel-the-middle structure — Lesson 152 (*Folds as Algebra*), much later, revisits exactly this kind of structural collapse in a more general algebraic setting.

### SE Lens

Like Lesson 46's arithmetic-series shortcut, this formula turns a loop that would otherwise multiply and accumulate `n` separate terms into a fixed handful of operations (one exponentiation, a subtraction, a division) — the same "recognize the pattern, use the closed form" payoff, this time for exponential rather than linear accumulation.

---

## Concept Unit: Counting Nodes in a Complete Binary Tree

### The Problem

A **complete** binary tree — every level entirely full — of depth `d` has `1` node at the root (level `0`), `2` at level `1`, `4` at level `2`, doubling at every level down to `2^d` at level `d`. How many nodes does the whole tree have, total?

### Introduce the concept in isolation

The total is exactly a geometric series: `1 + 2 + 4 + ... + 2^d` — first term `a = 1`, common ratio `r = 2`, and `d + 1` terms (levels `0` through `d`). Apply this lesson's formula directly:

```clojure
(defn geometric-sum-formula [a r n]
  (/ (* a (- 1 (power r n))) (- 1 r)))

(defn complete-tree-node-count [depth]
  (geometric-sum-formula 1 2 (+ depth 1)))
```

```
user=> (complete-tree-node-count 3)
15
```

A depth-`3` complete binary tree (four levels: `1, 2, 4, 8` nodes) has `15` nodes total — matching `2^(3+1) - 1 = 16 - 1 = 15`, the well-known closed form for a complete binary tree's node count, now derived directly from the geometric series formula rather than pattern-matched from memory.

### Discard the throwaway example

Not applicable — `complete-tree-node-count` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct application of the geometric series formula to the level-by-level doubling a complete binary tree exhibits by definition.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `power`, from Lesson 42.

### The New Code — type it yourself

```clojure
(defn complete-tree-node-count [depth]
  (geometric-sum-formula 1 2 (+ depth 1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(geometric-sum-formula 1 2 (+ depth 1))`** — reappearing formula, applied with `a = 1` (one root node), `r = 2` (each level doubles the previous one's count), and `n = depth + 1` (levels `0` through `depth` is `depth + 1` levels total, a boundary detail worth checking carefully, per Lesson 22's own emphasis on exact boundaries).

### CS Lens

This is exactly why `fib`'s evaluation tree (Lesson 23) and `power-set`'s subset count (Lesson 32) both grow so fast: both have this identical doubling-per-level shape (`fib`'s tree branches in two at every non-base node; `power-set`'s recursive calls double the possibilities at every element considered), and this lesson's formula is the precise, closed-form reason why — a tree of depth `d` with branching factor `2` has a total size on the order of `2^d`, not `d` or `d²`, matching Lesson 32's own observation that `power-set`'s output doubles with every additional list element.

### SE Lens

Knowing a system's growth is geometric (doubling, or growing by any fixed ratio greater than `1`) rather than arithmetic is what makes a rough size estimate possible before writing any code at all: a complete binary tree of depth `20` has roughly two million nodes (`2^21 - 1`), computable in one line with this lesson's formula, without ever needing to actually build or traverse a tree that large just to count it.

### Connection to the previous unit

The previous unit derived the general geometric series formula abstractly; this unit applies it to a real, already-familiar structure — a complete binary tree — connecting this lesson's algebra directly to the branching shapes Lesson 23 and Lesson 32 already traced by hand.

---

## Connect the Pieces

The formula, checked against direct summation, for the exact tree size Lesson 23's `fib(4)` evaluation tree (nine calls, not a complete tree, but the same doubling *shape*) hinted at:

```clojure
(defn geometric-sum-direct [a r n]
  (if (= n 0)
    0
    (+ a (geometric-sum-direct (* a r) r (- n 1)))))

(println "Direct summation, depth-3 tree:" (geometric-sum-direct 1 2 4))
(println "Formula:" (complete-tree-node-count 3))
(println "They agree:" (= (geometric-sum-direct 1 2 4) (complete-tree-node-count 3)))
```

```
Direct summation, depth-3 tree: 15
Formula: 15
They agree: true
```

Both methods agree — `geometric-sum-direct` actually adds `1 + 2 + 4 + 8` one term at a time, tracing the levels the way a real tree traversal would; `complete-tree-node-count`, built on the telescoping formula, computes the identical total in one step, without ever needing to enumerate the levels individually.

## What Breaks Without This

Suppose `complete-tree-node-count` used `depth` directly as the formula's `n`, forgetting the `+1` (an off-by-one boundary mistake, Lesson 22's exact category):

```clojure
(defn broken-tree-node-count [depth]
  (geometric-sum-formula 1 2 depth))
```

```
user=> (broken-tree-node-count 3)
7
```

`7`, not `15` — the formula, given `n = 3` instead of `4`, computes the sum of only *three* terms (`1 + 2 + 4`), silently excluding the deepest level (`8` nodes) entirely. This is a plausible, real-looking number — `7` is a perfectly sensible node count for *some* tree — and nothing about the computation signals that an entire level was dropped; only checking it against a direct, level-by-level count (the way Connect the Pieces did) or carefully re-deriving the boundary (`depth + 1` levels, not `depth`) catches it.

## Exercises

1. **Trace.** By hand, telescope `S - rS` for `a = 3`, `r = 2`, `n = 3` (the series `3 + 6 + 12`), confirming the formula's result matches direct addition.
2. **Predict.** Before computing it, predict `complete-tree-node-count 5` using the closed form `2^(d+1) - 1` directly, then verify against the formula function.
3. **Derive.** A savings account earning `10%` interest, compounded annually, on an initial `$1000` with no further deposits, has a balance of `1000 × 1.1ⁿ` after `n` years. This isn't itself a series to sum — but the *total interest earned* over `n` years, if withdrawn and re-invested elsewhere each year, would be. Using this lesson's formula, express the sum of interest amounts earned in years `1` through `n` as a geometric series, and compute it for `n = 5`.
4. **Break it, on purpose.** Reproduce `broken-tree-node-count`'s off-by-one mistake yourself, and confirm it silently drops the deepest level for a tree of your own chosen depth.
5. **Generalize.** Derive the formula for a geometric series with `r` between `0` and `1` (a *shrinking* series, like `1 + 0.5 + 0.25 + ...`) — does the same telescoping derivation still apply? Verify with `a=1, r=1/2, n=4` against direct summation.
6. **Reconstruct.** Close this lesson. From memory, re-derive the telescoping argument for the geometric series formula, and explain why a complete binary tree's total node count is a geometric series specifically, not an arithmetic one.

## Definition of Done

- [ ] You can derive the geometric series formula from scratch using the telescoping (multiply-and-subtract) method.
- [ ] You can apply it to count a complete binary tree's total nodes, getting the boundary (`depth + 1` terms) exactly right.
- [ ] You completed Exercise 5 and confirmed the formula works correctly for a ratio less than `1`, not just greater than `1`.
- [ ] You can explain why `fib`'s evaluation tree and `power-set`'s subset count both grow geometrically, using this lesson's formula directly.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating the ratio and term count used in each — for example, `"Derive compound-interest series sum (r=1.1, n=5); verify geometric formula for r=0.5 shrinking series against direct sum"` — not just `"lesson 47 exercise"`.

---

**Next lesson:** Lesson 48, *Recurrences*, generalizes past both this lesson's and the previous lesson's fixed-pattern series, translating a recursive algorithm's own cost directly into an equation — the mathematical object behind `fib`'s and `reverse-naive`'s already-measured, but not yet formally solved, growth.
