# Lesson 147: Lattices

**What you will build**: By the end of this lesson you'll show that Lesson 146's own incomparable sets — `\#\{1,2\}` and `\#\{3,4\}`, neither a subset of the other — still have a well-defined "smallest set containing both" and "largest set contained in both," even though neither is comparable to the other directly. That guarantee, holding for *every* pair, is a **lattice**, and it's exactly the structure a compiler's dataflow analysis leans on to combine information from multiple branches — and to guarantee that combining process actually terminates.

**What you need to know first**: Lesson 146's partial order, antisymmetric, and incomparable; Lesson 10's `clojure.set/union` and `clojure.set/intersection`.

**Terms introduced in this lesson**:

- **join** (least upper bound) — for two elements `a` and `b`, the *smallest* element that is `\geq` both, if one exists. *Why it matters*: even when `a` and `b` are incomparable — neither `\geq` the other — a join can still exist, giving a precise, minimal way to "combine" two incomparable pieces of information into one.
- **meet** (greatest lower bound) — for two elements `a` and `b`, the *largest* element that is `\leq` both, if one exists. *Why it matters*: the dual of join — the most that can be said to hold in common between two elements, without overclaiming.
- **lattice** — a partial order (Lesson 146) in which *every* pair of elements has both a join and a meet. *Why it matters*: the guarantee that "combine these two, however incomparable they are" always has a well-defined answer, not just for pairs that happen to already be comparable.

**Objects and methods used**: None new. This lesson reuses `clojure.set/union`, `clojure.set/intersection`, and `clojure.set/subset?` (Lesson 10), each already covered.

---

## Concept Unit: Join — the Smallest Set Containing Both

### The Problem

`\#\{1,2\}` and `\#\{3,4\}` are incomparable under `\subseteq` (Lesson 146) — neither is a subset of the other. Is there still a precise, smallest set that contains both of them as subsets?

### Introduce the concept in isolation

```
user=> (clojure.set/union #{1 2} #{3 4})
#{1 4 3 2}
user=> (clojure.set/subset? #{1 2} (clojure.set/union #{1 2} #{3 4}))
true
user=> (clojure.set/subset? #{3 4} (clojure.set/union #{1 2} #{3 4}))
true
```

`\#\{1,2,3,4\}$ — the union — contains both `\#\{1,2\}` and `\#\{3,4\}` as subsets, confirmed directly on the last two lines. It's also the *smallest* such set: removing any element would break containment of one side or the other (removing `1` or `2` would break `\#\{1,2\} \subseteq \ldots`; removing `3` or `4` would break `\#\{3,4\} \subseteq \ldots`). This is the **join** of `\#\{1,2\}` and `\#\{3,4\}` — their least upper bound under `\subseteq` — and it exists even though the two sets are incomparable.

### Discard the throwaway example

Not applicable — every result is real, and containment was checked directly, not assumed from familiarity with union.

### Project Change

- **Reference Source**: No reference counterpart — direct verification of `clojure.set/union`'s already-existing behavior against this lesson's own defined property.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit checks an existing function against an existing pair rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(clojure.set/union #{1 2} #{3 4})`** — reappearing `clojure.set/union` (Lesson 10), used here specifically as a join, a role it was never explicitly named for before.
- **`(clojure.set/subset? #{1 2} (clojure.set/union #{1 2} #{3 4}))`** — reappearing `clojure.set/subset?`, nested, checking the join actually contains one of its two original inputs — the defining property of an upper bound, verified rather than assumed.

### CS Lens

Union being a well-defined join for *every* pair of sets — comparable or not — is exactly what makes `(\text{sets}, \subseteq)` a **lattice**, not merely a partial order: Lesson 146's `\subseteq` already had the ordering; this lesson adds the guarantee that combining any two elements always has a precise answer.

### SE Lens

A join gives a *minimal* honest combination — not "everything anyone could possibly know," but the smallest thing that respects both inputs. This distinction matters directly: a join that overclaimed (included elements neither original set actually had) would be unsound information, not merely imprecise.

---

## Concept Unit: Meet — the Largest Set Contained in Both

### The Problem

Join found the smallest set containing both. Is there a dual — the largest set contained in *both* — and does it exist for this same incomparable pair?

### Introduce the concept in isolation

```
user=> (clojure.set/intersection #{1 2} #{3 4})
#{}
user=> (clojure.set/subset? (clojure.set/intersection #{1 2} #{3 4}) #{1 2})
true
user=> (clojure.set/subset? (clojure.set/intersection #{1 2} #{3 4}) #{3 4})
true
```

The **meet** — greatest lower bound — of `\#\{1,2\}` and `\#\{3,4\}` is `\#\{\}`, the empty set: it's a subset of both (checked directly), and it's the *largest* such set, since `\#\{1,2\}` and `\#\{3,4\}` share no elements at all. The meet existing, and being the empty set specifically rather than undefined or an error, is exactly what "every pair has a meet" requires — even for two sets sharing nothing in common.

### Discard the throwaway example

Not applicable — real output, both containment checks verified directly.

### Project Change

- **Reference Source**: No reference counterpart — direct verification of `clojure.set/intersection`'s already-existing behavior against this lesson's own defined property.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit checks an existing function against an existing pair rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(clojure.set/intersection #{1 2} #{3 4})`** — reappearing `clojure.set/intersection` (Lesson 10), used here specifically as a meet.
- **`(clojure.set/subset? (clojure.set/intersection #{1 2} #{3 4}) #{1 2})`** — reappearing `clojure.set/subset?`, checking the meet is contained in one of its two original inputs — the defining property of a lower bound.

### CS Lens

Union and intersection together, always defined for any pair of sets, are why `(\text{sets}, \subseteq)$ is one of the cleanest, most concrete lattices to reason about — every property this lesson names has a real, checkable, familiar operation behind it.

### SE Lens

A meet's honesty runs the opposite direction from a join's: it only claims what's genuinely shared, discarding anything present in just one side — exactly the caution a program analysis needs when asking "what do I know for certain, regardless of which path execution actually took."

### Connection to the previous unit

The previous unit found the smallest set containing both inputs; this unit finds the largest set contained in both — join and meet, the two halves that together make `\subseteq` a genuine lattice, not just a partial order.

---

## Concept Unit: Combining Facts From Two Branches — Join and Meet as Program Analysis

### The Problem

A compiler analyzing a program with an `if` sees two possible execution paths merge back into one. If path `A` establishes some facts and path `B` establishes different facts, what can the compiler *honestly* claim is true after the merge?

### Introduce the concept in isolation

```clojure
(def facts-path-a #{:x-positive :y-even})
(def facts-path-b #{:x-positive :z-null})
```

```
user=> (clojure.set/intersection facts-path-a facts-path-b)
#{:x-positive}
user=> (clojure.set/union facts-path-a facts-path-b)
#{:y-even :z-null :x-positive}
```

Two branches of an `if`, each establishing its own facts. **Must-facts** — true no matter which branch actually ran — are the **meet**: only `:x\text{-positive}` holds on *both* paths, so that's the only fact safe to trust unconditionally after the merge. **May-facts** — true on at least one possible path — are the **join**: all three facts, since each one held somewhere. A real analysis reaching for "what's guaranteed" uses meet; one reaching for "what's possible" uses join — the identical two operations this lesson already built, doing real analytical work.

### Discard the throwaway example

Not applicable — `facts-path-a`/`facts-path-b` are real sets, and both combinations are genuine `clojure.set` operations, not simulated.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch, small illustration of dataflow merging, built entirely on already-taught set operations.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit applies existing operations (`union`, `intersection`) to a new illustrative pair of sets, rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(clojure.set/intersection facts-path-a facts-path-b)`** — reappearing `clojure.set/intersection` (this lesson's second unit), applied to program-analysis facts instead of arbitrary numbers: the meet, "true everywhere."
- **`(clojure.set/union facts-path-a facts-path-b)`** — reappearing `clojure.set/union` (this lesson's first unit): the join, "true somewhere."

### CS Lens

Real compiler dataflow analysis — constant propagation, reachability, liveness analysis — is built on exactly this shape: a lattice of possible facts, a join (or meet, depending on the analysis) to combine information at merge points, and a guarantee, from the lattice having finite height, that repeatedly applying join can only climb so far before it stabilizes — which is the real, provable reason such analyses are guaranteed to *terminate*, not merely observed to in practice.

### SE Lens

Choosing meet (must-hold) versus join (may-hold) isn't a stylistic choice — it's determined entirely by what the analysis is *for*. An optimization that assumes a fact is true everywhere, when it only actually held on some paths, would be an unsound transformation — a real compiler bug; using meet specifically prevents that by construction, never overclaiming past what every path actually guarantees.

### Connection to the previous unit

The previous unit built join and meet as abstract operations on arbitrary sets; this unit shows those same two operations answering a real, concrete question — what can honestly be claimed after two branches of a program merge back together.

---

## Connect the Pieces

Join and meet, on both an abstract pair and a concrete analysis example:

```clojure
(println "Join of #{1 2} and #{3 4}:" (clojure.set/union #{1 2} #{3 4}))
(println "Meet of #{1 2} and #{3 4}:" (clojure.set/intersection #{1 2} #{3 4}))
(println "Must-facts (meet):" (clojure.set/intersection facts-path-a facts-path-b))
(println "May-facts (join):" (clojure.set/union facts-path-a facts-path-b))
```

```
Join of #{1 2} and #{3 4}: #{1 4 3 2}
Meet of #{1 2} and #{3 4}: #{}
Must-facts (meet): #{:x-positive}
Must-facts (join): #{:y-even :z-null :x-positive}
```

The identical two operations — union as join, intersection as meet — answer both an abstract question about incomparable sets and a real, concrete question about what a program actually knows after two branches merge.

## What Breaks Without This

Suppose a compiler's analysis used **join** (may-hold) where it needed **meet** (must-hold) — claiming `:y\text{-even}` was true after the merge in this lesson's own example, because it held on *one* branch, not both. An optimization built on that overclaimed fact — skipping a runtime check because "the compiler knows `y` is even" — would be wrong whenever execution actually took the branch where `y` wasn't established as even at all, a real, silent correctness bug, not a performance issue. The entire safety of "must" reasoning depends on using meet specifically, never join, for facts a later optimization will treat as guaranteed.

## Exercises

1. **Trace.** By hand, confirm `\#\{1,2,3,4\}` (this lesson's own join) really is the *smallest* set containing both `\#\{1,2\}` and `\#\{3,4\}` — show that removing any single element breaks containment of one side.
2. **Predict.** Before checking, predict the join and meet of `\#\{1,2,3\}` and `\#\{2,3,4\}` — two sets that overlap, unlike this lesson's own disjoint example. Then verify both with `clojure.set/union`/`clojure.set/intersection`.
3. **Verify.** Confirm the meet of *any* set with itself is that same set, and the join of any set with itself is also that same set — a real, checkable property of every lattice element paired with itself.
4. **Break it, on purpose.** Describe a three-branch merge (three sets of facts, not two) and compute its must-facts and may-facts using `clojure.set/intersection`/`clojure.set/union` chained appropriately.
5. **Generalize.** Describe, without coding it, why divisibility (Lesson 146's own second partial-order example) also forms a lattice, and what its join (hint: `\text{lcm}`, Lesson 58) and meet (hint: `\gcd`, Lesson 55) would be.
6. **Reconstruct.** Close this lesson. From memory, explain why a compiler combining facts from multiple branches must use meet, not join, for anything a later optimization will treat as guaranteed.

## Definition of Done

- [ ] You can define join and meet, and explain why they're guaranteed to exist even for incomparable elements in a lattice.
- [ ] You can explain why `(\text{sets}, \subseteq)` is a lattice, using union and intersection as its join and meet.
- [ ] You can explain the difference between must-facts (meet) and may-facts (join) in a program-analysis setting, and why using the wrong one is a real correctness bug.
- [ ] You completed Exercise 2 and computed the join and meet of two overlapping sets.
- [ ] You completed Exercise 5 and identified `\text{lcm}`/`\gcd` as divisibility's own join and meet.
- [ ] Commit your Exercise 2 and Exercise 5 work to your notes repository, with a commit message stating what you found — for example, `"Compute join/meet of overlapping sets {1,2,3}/{2,3,4}; confirm lcm/gcd serve as divisibility's join/meet"` — not just `"lesson 147 exercise"`.

---

**Next lesson:** Lesson 148, *Graphs as Relations*, unifies this whole run of relational vocabulary — equivalence relations, partial orders, lattices — with Lesson 123's own graphs, showing a graph's edges *are* a relation, and every property this section has named corresponds to a real, checkable structural fact about that graph.
