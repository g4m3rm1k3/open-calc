# Lesson 133: Kruskal and Prim

**What you will build**: By the end of this lesson you'll derive two structurally different algorithms for finding a minimum spanning tree — Kruskal's, growing a forest globally by cheapest edge, reusing Lesson 128's union-find directly; Prim's, growing one tree locally by cheapest frontier edge, reusing Lesson 130's extract-minimum pattern — verified to converge on the identical tree from Lesson 132's own graph.

**What you need to know first**: Lesson 132's MST definition and its own six-edge graph; Lesson 102's `uf-make`/`uf-union` and Lesson 128's `uf-connected?`; Lesson 130's `min-unvisited`-style extraction pattern.

**Terms introduced in this lesson**: None new — this lesson derives two algorithms for an already-defined problem rather than naming a new concept.

**Objects and methods used**: None new. This lesson reuses `get`/`assoc`/`count` (Lesson 84, Lesson 94), `uf-make`/`uf-union` (Lesson 102), and `uf-connected?` (Lesson 128), each already covered.

---

## Concept Unit: Kruskal's Algorithm — Cheapest Edge Globally

### The Problem

Lesson 132 showed several candidate spanning trees, compared by total weight, but never a systematic way to *find* the cheapest one. Could sorting every edge by weight and greedily accepting the cheapest one that doesn't create a cycle — reusing Lesson 128's own connectivity check — build it directly?

### Introduce the concept in isolation

```clojure
(defn kruskal-consider [parents edges i mst]
  (if (uf-connected? parents (get (get edges i) 0) (get (get edges i) 1))
    (kruskal-step parents edges (+ i 1) mst)
    (kruskal-step (uf-union parents (get (get edges i) 0) (get (get edges i) 1)) edges (+ i 1) (assoc mst (count mst) (get edges i)))))

(defn kruskal-step [parents edges i mst]
  (if (>= i (count edges))
    mst
    (kruskal-consider parents edges i mst)))

(defn kruskal [n sorted-edges]
  (kruskal-step (uf-make n) sorted-edges 0 []))
```

```
user=> (kruskal 4 [[0 1 1] [1 2 2] [0 3 2] [2 3 3] [0 2 4] [1 3 5]])
[[0 1 1] [1 2 2] [0 3 2]]
```

Edges given pre-sorted by weight, `[from to weight]` triples. `\{0\text{-}1, 1\text{-}2\}` are accepted immediately — their endpoints start disconnected. `0\text{-}3` (weight `2`, tied with `1\text{-}2`) connects `3` in — still no cycle. `2\text{-}3` (weight `3`) is *rejected* — `uf-connected?` reports `2` and `3` already connected (through `1` and `0`), so adding it would form a cycle. `0\text{-}2$ and `1\text{-}3` are rejected identically, for the same reason. Result: `\{0\text{-}1, 1\text{-}2, 0\text{-}3\}`, total weight `5` — exactly Lesson 132's own verified minimum.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified edge by edge.

### Project Change

- **Reference Source**: `kruskal-consider` reuses Lesson 128's `uf-connected?` and Lesson 102's `uf-union` directly, unchanged — the exact promise Lesson 103's own SE lens named for this lesson, delivered a second time after Lesson 128's own component-counting use.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn kruskal [n sorted-edges]
  (kruskal-step (uf-make n) sorted-edges 0 []))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(uf-connected? parents (get (get edges i) 0) (get (get edges i) 1))`** — reappearing (Lesson 128): the exact check that *is* Kruskal's own cycle test — two vertices already in the same union-find group are already connected by tree edges, so one more edge between them would be redundant, forming a cycle.
- **`(uf-union parents ...)`**, only in the *accept* branch — reappearing (Lesson 102): merging happens only when the edge is genuinely kept, growing the tree by exactly one merge per accepted edge.
- **`(assoc mst (count mst) (get edges i))`** — reappearing `assoc`-as-append (Lesson 94): the MST itself is built up one accepted edge at a time.

### CS Lens

Kruskal's greedy choice — always the globally cheapest remaining edge — is exactly the shape Lesson 118's exchange argument style would justify: accepting the cheapest edge that doesn't create a cycle can always be shown to belong to *some* minimum spanning tree, the identical "safe to commit to greedily" property Lesson 118 proved for activity selection, here proved (not shown in full) for a different problem.

### SE Lens

Kruskal's cost is dominated by sorting the edges — `O(E \log E)` — plus near-linear union-find operations (Lesson 103's own amortized result) — efficient specifically because it never needs to know anything about the graph's *structure* beyond connectivity, exactly why a plain sorted edge list, not an adjacency list, is all `kruskal` ever touches.

---

## Concept Unit: Prim's Algorithm — Cheapest Edge Locally

### The Problem

Kruskal considers every edge globally, regardless of whether either endpoint is anywhere near the growing structure yet. Could a genuinely different strategy — grow *one* tree, starting from a single vertex, always extending it by the cheapest edge connecting the current tree to anything outside it — reach the identical answer?

### Introduce the concept in isolation

```clojure
(defn prim-min-frontier [key in-tree v best]
  (if (>= v (count key))
    best
    (if (get in-tree v)
      (prim-min-frontier key in-tree (+ v 1) best)
      (if (or (= best -1) (< (get key v) (get key best)))
        (prim-min-frontier key in-tree (+ v 1) v)
        (prim-min-frontier key in-tree (+ v 1) best)))))

(defn prim-update [matrix state in-tree u v]
  (if (= (get (get matrix u) v) 0)
    state
    (if (and (not (get in-tree v)) (< (get (get matrix u) v) (get (get state 0) v)))
      [(assoc (get state 0) v (get (get matrix u) v)) (assoc (get state 1) v u)]
      state)))

(defn prim-update-all [matrix state in-tree u v n]
  (if (>= v n)
    state
    (prim-update-all matrix (prim-update matrix state in-tree u v) in-tree u (+ v 1) n)))
```

```
user=> (prim [[0 1 4 2] [1 0 2 5] [4 2 0 3] [2 5 3 0]] 0 4)
[false 0 1 0]
```

`key[v]` tracks the cheapest edge weight found *so far* connecting `v` to the current tree; `parent[v]` tracks *which* tree vertex offers it. `prim-min-frontier` is Lesson 130's own `min-unvisited`, renamed: find the smallest `key` among vertices not yet `in-tree`. The result — `parent = [false, 0, 1, 0]` — reads directly as edges: vertex `1$'s cheapest connection is through `0`; vertex `2`'s is through `1`; vertex `3`'s is through `0` — exactly `\{0\text{-}1, 1\text{-}2, 0\text{-}3\}`, Kruskal's own identical result.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified step by step before being shown here.

### Project Change

- **Reference Source**: `prim-min-frontier` reuses Lesson 130's `min-unvisited` structure directly, renamed for this lesson's own vocabulary (`key`/`in-tree` in place of `dist`/`finalized`); `prim-update` reuses Lesson 130's `relax` shape, updating a *best-known-edge* rather than a *best-known-distance*.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn prim [matrix start n]
  (prim-step matrix [(assoc (all-infinity n 0 []) start 0) (all-false n 0 [])] (all-false n 0 []) n))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(< (get (get matrix u) v) (get (get state 0) v))`** — first appearance: compares a *single edge's own weight* against the best known so far — critically, **not** accumulated distance from a source the way Dijkstra's `relax` compared `dist[u] + \text{weight}` — Prim only ever cares about the one edge directly connecting the tree to `v`, never a running total.
- **`(and (not (get in-tree v)) ...)`** — reappearing pattern (Lesson 130's own `relax`, adapted): only vertices genuinely outside the tree are candidates for a cheaper connection at all.

### CS Lens

Prim's `key[v]` and Dijkstra's `dist[v]` (Lesson 130) look almost identical in code, but mean genuinely different things: Dijkstra accumulates total path cost from a fixed source; Prim tracks only the *single cheapest edge* connecting `v` to whatever's already been grown — the one-line difference in `prim-update`'s comparison (`(get (get matrix u) v)` alone, not added to anything) is the entire distinction between the two algorithms.

### SE Lens

Prim's cost, as written, is `O(V^2)` — identical in shape to Lesson 130's own honestly-scoped Dijkstra, and for the identical reason: a production implementation would reuse Lesson 96's priority queue for `O(E \log V)`, a refinement this lesson names but doesn't build.

### Connection to the previous unit

The previous unit grew a *forest* globally, considering every edge without regard to any specific structure; this unit grows a single *tree* locally, only ever considering edges touching what's already been built — two different strategies, reaching the identical answer on this lesson's own graph.

---

## Concept Unit: Comparing the Two Strategies

### The Problem

Both algorithms found the identical minimum spanning tree. Is that a coincidence of this lesson's own small example, or does it reveal something real about how the two strategies relate?

### Introduce the concept in isolation

Both algorithms are greedy, in Lesson 117's own sense — Kruskal commits to the globally cheapest *edge* that doesn't create a cycle; Prim commits to the locally cheapest edge *extending the current tree*. Neither ever reconsiders a choice once made. Both happen to be *provably* correct (Lesson 118's exchange-argument style, named but not fully re-derived here for either) — a real, non-obvious fact about this specific problem: unlike Lesson 117's coin-change cliffhanger, where greedy could confidently fail, minimum spanning tree is a problem where a certain *kind* of greedy choice — cheapest safe edge, whether chosen globally or locally — is always exchangeable into an optimal solution.

### Discard the throwaway example

Not applicable — a direct comparison of this lesson's own two already-verified algorithms.

### CS Lens

Kruskal's edge-centric view and Prim's vertex-centric view are the identical underlying fact — "always take the cheapest safe connection" — observed from two different vantage points, the same way Lesson 124's BFS and Lesson 125's DFS were both "visit everything reachable," differing only in which structure orders the frontier.

### SE Lens

Choosing between them is almost entirely about representation and scale, not correctness: Kruskal is the natural choice when edges are already available as a flat, sortable list (or arrive incrementally, since union-find handles that gracefully — Lesson 128's own point); Prim is the natural choice when an adjacency-based representation (Lesson 123) is already at hand and the graph is dense enough that examining every vertex's neighbors repeatedly isn't wasteful.

### Connection to the previous unit

The previous two units built genuinely different algorithms; this unit is why their agreement isn't a coincidence — both are legitimate greedy strategies for a problem where greedy, chosen carefully, really does work.

---

## Connect the Pieces

Both algorithms, the identical graph, the identical answer:

```clojure
(println "Kruskal's MST edges:" (kruskal 4 [[0 1 1] [1 2 2] [0 3 2] [2 3 3] [0 2 4] [1 3 5]]))
(println "Prim's MST parents:" (prim [[0 1 4 2] [1 0 2 5] [4 2 0 3] [2 5 3 0]] 0 4))
```

```
Kruskal's MST edges: [[0 1 1] [1 2 2] [0 3 2]]
Prim's MST parents: [false 0 1 0]
```

Two structurally different derivations — one global and edge-first, one local and vertex-first — reaching the identical `\{0\text{-}1, 1\text{-}2, 0\text{-}3\}`, total weight `5`, confirming Lesson 132's own hand-computed minimum.

## What Breaks Without This

Suppose `kruskal-consider` used `visited`-style tracking (Lesson 124) instead of `uf-connected?`, checking only whether *either* endpoint had been touched before, rather than whether they're already in the *same* component:

```clojure
(defn broken-consider [visited edges i mst]
  (if (and (get visited (get (get edges i) 0)) (get visited (get (get edges i) 1)))
    (kruskal-step visited edges (+ i 1) mst)
    (kruskal-step (assoc (assoc visited (get (get edges i) 0) true) (get (get edges i) 1) true) edges (+ i 1) (assoc mst (count mst) (get edges i)))))
```

This would accept `0\text{-}2$ (weight `4`) once vertex `2` first appears "unvisited" from some other edge's perspective, potentially both accepting edges that create cycles and rejecting ones that don't — `uf-connected?`'s actual question, "are these two already in the same connected group," is genuinely different from "have I seen both of these vertices somewhere before," and only the first one is Kruskal's real cycle test.

## Exercises

1. **Trace.** By hand, trace `kruskal`'s own rejection of edge `2\text{-}3` (weight `3`), confirming `uf-connected?` reports `true` at that point using the already-built union-find state.
2. **Predict.** Before checking, predict `(prim [[0 1 4 2] [1 0 2 5] [4 2 0 3] [2 5 3 0]] 2 4)` — starting Prim from vertex `2` instead of `0`. Does the resulting tree still total weight `5`, even with a different `parent` structure?
3. **Verify.** Confirm, using Lesson 129's `path-weight`, that summing Kruskal's own three returned edge weights (`1`, `2`, `2`) gives `5`, matching Lesson 132's independently-verified minimum.
4. **Break it, on purpose.** Run `broken-consider` on this lesson's own six-edge list and find a specific edge it accepts that `kruskal` correctly rejects.
5. **Generalize.** State, in one sentence each, when you'd choose Kruskal over Prim and the reverse, using this lesson's own SE lens.
6. **Reconstruct.** Close this lesson. From memory, explain the one-line difference between Prim's `key` update and Dijkstra's `dist` update, and why that single difference produces two different algorithms.

## Definition of Done

- [ ] You can implement `kruskal` and explain why `uf-connected?`, not `visited`, is its correct cycle test.
- [ ] You can implement `prim` and explain the one-line difference from Dijkstra's own `relax`.
- [ ] You can explain why both algorithms, despite different strategies, reach the same minimum weight.
- [ ] You completed Exercise 3 and confirmed the MST's total weight two independent ways.
- [ ] You completed Exercise 4 and found a specific edge `broken-consider` incorrectly accepts.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm Kruskal's MST totals 5 via path-weight sum; find broken-consider incorrectly accepting edge 0-2"` — not just `"lesson 133 exercise"`.

---

**Next lesson:** Lesson 134, *Network Flow*, introduces a genuinely different graph problem — how much can move from one vertex to another through edges with limited capacity — framed as conservation, the same principle underlying Lesson 1's own original bank-account invariant.
