# Lesson 125: Depth-First Search

**What you will build**: By the end of this lesson you'll derive **depth-first search** — exploring as far as possible along each path before backtracking — using plain recursion instead of Lesson 124's explicit queue, and verify directly that the identical graph, the identical starting vertex, produces a genuinely different visit order depending only on which structure holds the frontier.

**What you need to know first**: Lesson 124's BFS and its visited-tracking discipline; Lesson 21's structural recursion; Lesson 102's array-of-booleans convention.

**Terms introduced in this lesson**:

- **depth-first search (DFS)** — visiting a vertex, then fully exploring one entire unvisited neighbor (and everything reachable through it) before moving on to the next neighbor. *Why it matters*: the direct structural opposite of Lesson 124's BFS — a stack's (or, equivalently here, the call stack's own) LIFO discipline explores the *most recently* discovered vertex next, rather than the *earliest*.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: Recursion as an Implicit Stack

### The Problem

Lesson 124's BFS used an explicit queue to hold the frontier, producing layer-by-layer order. Is there a way to produce the opposite order — as deep as possible, immediately — without building an explicit stack data structure at all?

### Introduce the concept in isolation

A recursive function call *is* a stack, implicitly — Lesson 91's own mutual recursion already relied on this, and every recursive call this series has ever made pushes a new frame; returning pops it. Visiting a vertex and immediately **recursing into an unvisited neighbor**, before even considering that vertex's *other* neighbors, produces exactly depth-first order: the most recently discovered vertex is explored next, the identical LIFO discipline Lesson 86's stack enforced explicitly, here provided for free by the language's own call mechanism.

### Discard the throwaway example

Not applicable — this unit states the strategy; the next unit builds the real algorithm.

### CS Lens

This is Lesson 21's own structural recursion, applied to a graph instead of a tree: a tree's structural recursion visits both children before returning; DFS on a graph visits *every currently-unvisited* neighbor, one at a time, each one a full recursive excursion completed before moving to the next.

### SE Lens

Choosing recursion over an explicit stack is a genuine implementation choice, not a difference in the underlying algorithm — DFS built with an explicit stack (pushing neighbors, popping the most recent) produces the identical visit order as this lesson's recursive version, just without relying on the language's own call stack to hold the frontier.

---

## Concept Unit: `dfs-visit` and `dfs-explore` — Recursing Into Each Neighbor

### The Problem

Can this lesson's strategy — visit, then recurse fully into one neighbor before considering the next — be written directly, reusing Lesson 124's own visited-tracking discipline?

### Introduce the concept in isolation

```clojure
(defn dfs-visit [adj visited order current]
  (dfs-explore adj (assoc visited current true) (assoc order (count order) current) (get adj current) 0))

(defn dfs-explore [adj visited order neighbors i]
  (if (>= i (count neighbors))
    [visited order]
    (dfs-explore-step adj visited order neighbors i)))

(defn dfs-explore-step [adj visited order neighbors i]
  (if (get visited (get neighbors i))
    (dfs-explore adj visited order neighbors (+ i 1))
    (dfs-continue-after adj (dfs-visit adj visited order (get neighbors i)) neighbors i)))

(defn dfs-continue-after [adj visited-and-order neighbors i]
  (dfs-explore adj (get visited-and-order 0) (get visited-and-order 1) neighbors (+ i 1)))
```

```
user=> (dfs-visit [[1 2] [3] [3] [4] []] [false false false false false] [] 0)
[[true true true true true] [0 1 3 4 2]]
```

`dfs-visit` marks the current vertex visited, records it in `order`, then hands off to `dfs-explore`, which walks the neighbor list one at a time. The moment an unvisited neighbor is found, `dfs-explore-step` calls `dfs-visit` **recursively** on it — a full, complete exploration of that neighbor's entire reachable subgraph — before `dfs-continue-after` resumes the *original* vertex's remaining neighbors.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified step by step before being shown here.

### Project Change

- **Reference Source**: `dfs-visit`/`dfs-explore` reuse Lesson 124's visited-at-discovery discipline directly, replacing the queue-and-loop structure with recursive calls — Lesson 85's vector-as-pair carries `[visited order]` back out of each recursive excursion.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn dfs-explore-step [adj visited order neighbors i]
  (if (get visited (get neighbors i))
    (dfs-explore adj visited order neighbors (+ i 1))
    (dfs-continue-after adj (dfs-visit adj visited order (get neighbors i)) neighbors i)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get visited (get neighbors i))`** — reappearing (Lesson 124): the identical already-visited check, checked before recursing, not after.
- **`(dfs-visit adj visited order (get neighbors i))`** — first appearance of this specific recursive shape: a *full* call into the neighbor, which will itself run to completion — visiting everything reachable from it — before this line's own result is ever used.
- **`(dfs-continue-after adj (dfs-visit ...) neighbors i)`** — first appearance: only *after* the recursive excursion fully returns does exploration resume at the current vertex's *next* neighbor — the exact mechanism producing depth-first order, since nothing about the current vertex's remaining neighbors is even considered until the first one's entire reachable subgraph has been exhausted.

### CS Lens

`dfs-visit` calling itself, indirectly, through `dfs-explore-step`, is genuine recursion in exactly Lesson 20's original sense — a smaller version of the same problem (explore starting from *this* vertex) solved by delegating to itself on a smaller instance (explore starting from a neighbor), the identical shape as every other recursive function this series has built, applied here to a graph instead of a number or a list.

### SE Lens

Vertex `2`, in this lesson's own worked trace, is visited *last*, not second — a direct, visible consequence of vertex `0` fully finishing its excursion into vertex `1` (and everything reachable from `1`) *before* ever considering vertex `2` at all, the exact opposite priority from Lesson 124's BFS, which explored both of `0`'s neighbors before either one's own neighbors.

### Connection to the previous unit

The previous unit argued recursion provides an implicit stack; this unit is the real algorithm built on that argument, verified completely on Lesson 124's own graph.

---

## Concept Unit: The Same Graph, a Genuinely Different Order

### The Problem

Lesson 124's BFS and this lesson's DFS both start from vertex `0`, on the identical graph. Do they actually produce different results, or does the distinction between "layer by layer" and "as deep as possible" turn out not to matter in practice?

### Introduce the concept in isolation

```clojure
(defn dfs [adj start n]
  (get (dfs-visit adj (all-false n 0 []) [] start) 1))
```

```
user=> (bfs [[1 2] [3] [3] [4] []] 0 5)
[0 1 2 3 4]
user=> (dfs [[1 2] [3] [3] [4] []] 0 5)
[0 1 3 4 2]
```

Identical graph, identical start vertex — genuinely different orders. BFS visits `2` *third*, immediately after `0`'s other neighbor `1`. DFS visits `2` *last*, only after fully exhausting everything reachable through `1` first (`1 \to 3 \to 4`). Both are completely correct traversals — "visit every reachable vertex exactly once" — satisfying different, equally valid orderings of the identical requirement.

### Discard the throwaway example

Not applicable — `dfs` is a real, reusable function, and both outputs shown are genuine, verified results.

### Project Change

- **Reference Source**: `dfs` reuses Lesson 124's own `all-false` (Lesson 102) directly, seeding the identical starting state `bfs` used, isolating the *only* real difference between the two lessons to the frontier's own discipline (queue versus recursion).
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn dfs [adj start n]
  (get (dfs-visit adj (all-false n 0 []) [] start) 1))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(all-false n 0 [])`** — reappearing (Lesson 124, Lesson 102): the identical starting condition BFS used, ensuring the comparison isolates only the traversal *strategy*, not any difference in setup.
- **`(get (dfs-visit ...) 1)`** — reappearing vector-as-pair access (Lesson 85): `dfs-visit`'s own returned pair holds both the final `visited` array and `order`; only `order` is this function's own concern.

### CS Lens

Both `bfs` and `dfs` cost `O(V + E)` — the identical asymptotic class, despite producing entirely different orders — proof that *order* and *cost* are two separate questions a graph traversal answers, exactly the way Lesson 91's `binary-search` and Lesson 92's `bst-search` shared a cost class while differing completely in mechanism.

### SE Lens

Choosing BFS or DFS for a real problem depends on which *order* the problem actually needs — Lesson 129 (*Shortest Paths*) needs BFS's own layer-by-layer guarantee specifically; Lesson 126 (*DFS Invariants and Timestamps*), immediately next, needs DFS's own deep-exploration structure for a different purpose entirely — neither traversal is a generally "better" choice, only a differently-shaped one.

### Connection to the previous unit

The previous unit built DFS in full; this unit is the direct, verified proof that the choice between Lesson 124's queue and this lesson's recursion was never cosmetic — it's the entire reason the two traversals produce different, equally correct results.

---

## Connect the Pieces

Both traversals, side by side, on the identical graph:

```clojure
(println "BFS from 0:" (bfs [[1 2] [3] [3] [4] []] 0 5))
(println "DFS from 0:" (dfs [[1 2] [3] [3] [4] []] 0 5))
```

```
BFS from 0: [0 1 2 3 4]
DFS from 0: [0 1 3 4 2]
```

Two algorithms, one graph, one starting point, one shared cost class, and two genuinely different — both correct — answers to "in what order should every reachable vertex be visited."

## What Breaks Without This

Suppose `dfs-explore-step` called `dfs-visit` on a neighbor *without* first checking whether it's already visited:

```clojure
(defn broken-explore-step [adj visited order neighbors i]
  (dfs-continue-after adj (dfs-visit adj visited order (get neighbors i)) neighbors i))
```

On any graph containing a cycle — including this lesson's own, where vertex `3` is reachable from both `1` and `2` — this would recurse into an already-fully-explored vertex again, and on a graph with a genuine cycle back to an *ancestor* still being explored, this recursion would never terminate at all, exactly the correctness requirement Lesson 124's second unit already identified for BFS, needed here just as much: check `visited` before recursing, never after.

## Exercises

1. **Trace.** By hand, trace `(dfs [[1] [2] [0]] 0 3)` — the directed `3`-cycle from Lesson 124's own Exercise 2 — confirming DFS also terminates correctly on it.
2. **Predict.** Before checking, predict `(dfs [[1 2] [3] [3] [4] []] 2 5)` — starting DFS from vertex `2` instead of `0`. Which vertices are reachable, and in what order?
3. **Verify.** Confirm `bfs` and `dfs`, starting from vertex `0` on this lesson's graph, visit the identical *set* of vertices, `\{0,1,2,3,4\}`, despite the different order.
4. **Break it, on purpose.** Run `broken-explore-step` (substituted into `dfs-explore`) on Exercise 1's `3`-cycle, and confirm it fails to terminate (interrupt it after confirming the pattern).
5. **Generalize.** Rewrite `dfs` to visit neighbors in *reverse* order (last neighbor first), and predict how that changes the visit order on this lesson's own graph before checking.
6. **Reconstruct.** Close this lesson. From memory, explain why recursion alone, with no explicit stack data structure, is enough to produce depth-first order, and state one concrete difference between when BFS and when DFS is the better choice.

## Definition of Done

- [ ] You can implement `dfs` using plain recursion and trace its execution by hand.
- [ ] You can explain why recursion provides an implicit stack, without building one explicitly.
- [ ] You can state the visit-order difference between BFS and DFS on a concrete graph.
- [ ] You completed Exercise 3 and confirmed both traversals visit the identical vertex set.
- [ ] You completed Exercise 5 and predicted, then confirmed, the effect of reversing neighbor order.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm bfs and dfs visit the identical vertex set despite different order; confirm reversed neighbor order changes dfs's own visit sequence"` — not just `"lesson 125 exercise"`.

---

**Next lesson:** Lesson 126, *DFS Invariants and Timestamps*, records exactly *when* each vertex is first discovered and fully finished during a DFS run, deriving a real tool for reasoning about a graph's own structure from those two numbers alone.
