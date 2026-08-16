# Lesson 132: Minimum Spanning Trees

**What you will build**: By the end of this lesson you'll define a genuinely different optimization problem from every shortest-path algorithm this section has built — connecting every vertex of a graph as cheaply as possible in total, with no starting point at all — and prove directly, with a real counterexample, that a minimum spanning tree's own internal paths are *not* the same thing as shortest paths, even though both problems are built from the identical weighted graph.

**What you need to know first**: Lesson 129's `path-weight`; Lesson 128's connected components; Lesson 30's tree definition, for this lesson's own spanning-tree requirement.

**Terms introduced in this lesson**:

- **spanning tree** — a subset of a connected graph's edges that touches every vertex, contains no cycle, and keeps the graph connected. *Why it matters*: exactly `V-1` edges, always — one more would create a cycle, one fewer would leave some vertex unreachable.
- **minimum spanning tree (MST)** — among every possible spanning tree of a graph, the one (or one of the ones, if several tie) with the smallest total edge weight. *Why it matters*: a real optimization problem — many spanning trees usually exist, most of them not minimal.

**Objects and methods used**: None new. This lesson reuses Lesson 129's `path-weight`, each already covered.

---

## Concept Unit: A Spanning Tree Has Exactly `V-1` Edges

### The Problem

Given a connected, undirected, weighted graph, what does it even mean to "connect every vertex" using as few edges as possible — and is there a fixed number of edges that requirement always demands, regardless of the graph's own shape?

### Introduce the concept in isolation

A **spanning tree** touches every one of a graph's `V` vertices, using a subset of its edges, with no cycle anywhere — Lesson 30's own tree definition, applied here to a chosen subset of an existing graph's edges rather than built fresh. Any tree on `V` vertices has *exactly* `V-1` edges: one fewer edge than a cycle-free connected structure could ever have, and one more edge than that would necessarily create a cycle somewhere (Lesson 126's own `has-cycle?` would detect it directly).

### Discard the throwaway example

Not applicable — this unit states a structural fact, connecting to already-established tree vocabulary rather than introducing new code.

### CS Lens

This `V-1` count is the identical fact Lesson 128's own connected-components work already implied: a graph with `V` vertices split into `k` separate components needs at least `V - k` edges just to be *fully* connected as one piece — for a single connected component (`k=1`), that's exactly `V-1`, no more, no fewer, for a tree specifically (no wasted, cycle-forming edges).

### SE Lens

Checking "is this a valid spanning tree" reduces to two already-built checks: `V-1` edges exactly, and no cycle (Lesson 126's `has-cycle?`) — connectivity then follows automatically, since a cycle-free graph with exactly `V-1` edges covering all `V` vertices cannot help but be connected.

---

## Concept Unit: Many Spanning Trees, One Cheapest

### The Problem

A graph with cycles in it has more than `V-1` edges available — meaning more than one way to choose a cycle-free, fully-connecting subset. Do these different choices actually cost different total amounts?

### Introduce the concept in isolation

A four-vertex graph, undirected: `0\text{-}1$ (weight `1`), `0\text{-}2$ (weight `4`), `1\text{-}2$ (weight `2`), `1\text{-}3$ (weight `5`), `2\text{-}3$ (weight `3`) — five edges, though a spanning tree needs only `V-1=3`. Four different valid spanning trees, compared directly:

```
{0-1, 1-2, 2-3}:  weight 1 + 2 + 3 = 6
{0-1, 0-2, 1-3}:  weight 1 + 4 + 5 = 10
{0-2, 1-2, 2-3}:  weight 4 + 2 + 3 = 9
{0-1, 1-2, 1-3}:  weight 1 + 2 + 5 = 8
```

All four are genuinely valid spanning trees — three edges each, every vertex touched, no cycle in any of them. Their total weights range from `6` to `10` — a real, substantial difference for connecting the *identical* four vertices. `\{0\text{-}1, 1\text{-}2, 2\text{-}3\}`, at weight `6`, is the cheapest of these four — this is the **minimum spanning tree** this lesson's title names, an optimization problem with a genuine, non-obvious answer.

### Discard the throwaway example

Not applicable — a direct comparison of four genuinely valid, hand-computed spanning trees.

### CS Lens

This is Lesson 111's own brute-force spirit, applied to a new problem: checking every candidate spanning tree's total weight directly would work, but — exactly the concern Lesson 111 raised for "find the largest" — the number of possible spanning trees grows explosively with graph size, motivating Lesson 133's own smarter, non-exhaustive derivation.

### SE Lens

The four candidates shown here weren't chosen arbitrarily — they represent four different *local* choices (which edge connects vertex `3$, which edge connects vertex `2`) combining into four different *global* totals — exactly the kind of interacting-choices structure that makes "minimum spanning tree" a real optimization problem, not a question with an obvious answer by inspection.

### Connection to the previous unit

The previous unit established every spanning tree has the identical edge *count*; this unit shows that identical count still allows wildly different total *weight*, depending entirely on which specific edges are chosen.

---

## Concept Unit: An MST's Own Paths Are Not Shortest Paths

### The Problem

A minimum spanning tree connects every vertex as cheaply as possible, in total. Does that mean the path *between any two specific vertices*, found by walking within the MST, is also their shortest path in the original graph?

### Introduce the concept in isolation

Add a sixth edge to this lesson's own graph: `0\text{-}3` (weight `2`). Recomputing the minimum spanning tree with this new option available: `\{0\text{-}1 (1), 1\text{-}2 (2), 0\text{-}3 (2)\}`, total weight `5` — cheaper than any option from the previous unit, since `0\text{-}3` now offers a cheaper way to reach vertex `3` than the old `1\text{-}3` (weight `5`) or `2\text{-}3` (weight `3`) ever did.

```clojure
(println "MST path from 2 to 3, via 2-1-0-3:" (path-weight [[0 1 0 2] [1 0 2 0] [0 2 0 0] [2 0 0 0]] [2 1 0 3] 0 0))
```

```
MST path from 2 to 3, via 2-1-0-3: 5
```

The MST itself contains **no direct edge between `2` and `3`** at all — the only route between them *within the tree* is `2 \to 1 \to 0 \to 3`, costing `5`. But the original graph's own direct edge, `2\text{-}3`, weight `3`, was never included in the MST at all — genuinely cheaper than the MST's own internal route between those two specific vertices. The MST minimizes the cost to connect *everything*; it makes no promise whatsoever about the cost between any two particular vertices once you're restricted to walking only its own edges.

### Discard the throwaway example

Not applicable — a real, hand-verified divergence between an MST's internal path and the graph's own true shortest path.

### Project Change

- **Reference Source**: This unit reuses Lesson 129's `path-weight` directly, applied here for the first time to a path *within* an MST rather than within the original graph, to make the divergence concrete and measured rather than only asserted.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### CS Lens

This is a direct, structural consequence of Lesson 130's own SE lens, restated for a different problem: an MST and a shortest-path tree are two different optimization objectives built from the identical weighted graph — one minimizes total tree weight, the other minimizes each individual vertex's distance from one chosen source — and optimizing one gives no guarantee whatsoever about the other.

### SE Lens

Choosing between "build an MST" and "run Dijkstra" is a real, consequential decision about what a system actually needs: a network design problem (lay the cheapest possible cabling connecting every building) wants an MST; a navigation problem (get from here to there as cheaply as possible) wants a shortest-path algorithm — using the wrong one silently answers a question nobody asked.

### Connection to the previous unit

The previous unit showed multiple spanning trees cost different totals; this unit shows even the *cheapest* one, once found, doesn't answer a question ("what's the cheapest way between these two specific vertices") it was never built to answer.

---

## Connect the Pieces

Both problems, the identical graph, genuinely different answers:

```clojure
(println "MST total weight:" 5)
(println "MST-internal path, 2 to 3:" (path-weight [[0 1 0 2] [1 0 2 0] [0 2 0 0] [2 0 0 0]] [2 1 0 3] 0 0))
(println "True shortest path, 2 to 3 (direct edge, excluded from MST):" 3)
```

```
MST total weight: 5
MST-internal path, 2 to 3: 5
True shortest path, 2 to 3 (direct edge, excluded from MST): 3
```

The MST is genuinely optimal at its own job — minimizing total connection cost — and genuinely *not* optimal at a job (shortest path between two specific vertices) it was never asked to do.

## What Breaks Without This

Suppose a network engineer built a minimum spanning tree to lay physical cable connecting every office cheaply, then assumed that *tree's own routing* would also give the fastest data path between any two specific offices — exactly this lesson's own confusion. Two offices connected only through several intermediate hops within the MST (`2` to `3`, in this lesson's example, forced through `1` and `0`) could have a direct, fast connection available in the original network topology that the MST, optimizing for total cable cost rather than any specific pair's latency, simply never included at all.

## Exercises

1. **Trace.** By hand, confirm this lesson's six-edge MST (`\{0\text{-}1, 1\text{-}2, 0\text{-}3\}`) really is cheaper than every alternative spanning tree using the new `0\text{-}3` edge in a different combination.
2. **Predict.** Before checking, predict whether the MST path from `1` to `3` (within the tree) matches the true shortest path from `1` to `3` in the full six-edge graph. Verify using `path-weight`.
3. **Verify.** Confirm this lesson's MST has exactly `V-1=3` edges and contains no cycle, using Lesson 126's own reasoning.
4. **Break it, on purpose.** Construct a graph where the minimum spanning tree and *every* shortest-path tree (from any possible source) happen to be identical — explain what property of your graph makes this true.
5. **Generalize.** State, in your own words, why "minimum spanning tree" has no source vertex at all, while "shortest path" always requires one.
6. **Reconstruct.** Close this lesson. From memory, explain why an MST's own internal path between two vertices can be more expensive than their true shortest path in the original graph.

## Definition of Done

- [ ] You can state why a spanning tree always has exactly `V-1` edges.
- [ ] You can compare several candidate spanning trees and identify the minimum by total weight.
- [ ] You can explain, with a concrete example, why an MST's own paths aren't shortest paths.
- [ ] You completed Exercise 3 and confirmed the MST's edge count and acyclic structure.
- [ ] You completed Exercise 4 and constructed a graph where MST and shortest-path trees coincide.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and constructed — for example, `"Confirm MST has V-1 edges and no cycle; construct a graph where MST and SPT-from-any-source always coincide"` — not just `"lesson 132 exercise"`.

---

**Next lesson:** Lesson 133, *Kruskal and Prim*, derives two genuinely different algorithms for actually finding a minimum spanning tree — one growing a forest by cheapest edge globally, reusing Lesson 128's union-find directly; the other growing one tree by cheapest edge locally, reusing Lesson 94's priority queue.
