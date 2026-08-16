# Lesson 124: Breadth-First Search

**What you will build**: By the end of this lesson you'll derive **breadth-first search** — visiting every vertex reachable from a starting point, one full "layer" of distance at a time — reusing Lesson 87's already-proven FIFO queue directly, verified on Lesson 123's own five-vertex graph.

**What you need to know first**: Lesson 123's adjacency list; Lesson 87's `make-queue`/`enqueue`/`dequeue`/`queue-peek`, trusted here via their own already-proven FIFO behavior, not re-derived; Lesson 102's array-of-booleans convention, reused here for tracking visited vertices.

**Terms introduced in this lesson**:

- **breadth-first search (BFS)** — visiting every vertex reachable from a start vertex, ordered so every vertex at distance `k` (in number of edges) is visited before any vertex at distance `k+1`. *Why it matters*: the queue's FIFO discipline (Lesson 87) is precisely what enforces this layer-by-layer order — a stack's LIFO discipline would produce a completely different traversal, Lesson 125's own subject.
- **frontier** — the set of vertices discovered but not yet fully explored, held in the queue at any given moment. *Why it matters*: BFS's entire behavior is captured by how the frontier grows and shrinks, one vertex processed and its unvisited neighbors added, every single step.

**Objects and methods used**: None new. This lesson reuses `make-queue`, `enqueue`, `dequeue`, `queue-peek`, `queue-in`, `queue-out` (Lesson 87), and `get`/`assoc`/`count`/`empty?` (Lesson 84, Lesson 85), each already covered.

---

## Concept Unit: Why a Queue Enforces Layer-by-Layer Order

### The Problem

Starting from one vertex, visiting every vertex reachable from it, Lesson 123's adjacency list gives direct access to any vertex's immediate neighbors — but nothing yet about the *order* to visit them in. Does the choice of which structure holds "discovered but not yet explored" vertices actually determine that order?

### Introduce the concept in isolation

A queue's FIFO discipline (Lesson 87) does exactly this: the *first* vertex discovered is the *first* one explored, meaning every vertex discovered *while exploring it* — its direct neighbors — is added *after* every vertex already waiting. Vertex `0`'s neighbors are explored before any of *their* neighbors get a chance, which are explored before *their* neighbors, and so on — exactly a queue's own arrival-order guarantee, applied to graph exploration, producing exactly one full layer of distance before the next begins.

### Discard the throwaway example

Not applicable — this unit states why the strategy works; the next unit builds the real algorithm.

### CS Lens

This is Lesson 87's own FIFO proof, reused for an entirely different purpose than the one it was originally built for: nothing about `enqueue`/`dequeue`'s correctness needed to know anything about graphs — BFS is simply the first algorithm in this series to *need* the ordering guarantee a queue was already proven to provide.

### SE Lens

Choosing a queue here isn't an implementation detail to decide later — it's the entire mechanism producing BFS's defining property (layer-by-layer order). A different structure holding the frontier (Lesson 125's stack, for depth-first search) produces a genuinely different traversal order from the identical graph and starting point.

---

## Concept Unit: Tracking Visited Vertices and Expanding a Frontier

### The Problem

Discovering a vertex's neighbors and adding them to the queue is only correct if a vertex already discovered is never added *again* — otherwise the same vertex could be explored repeatedly, or worse, the process might never terminate on a graph with cycles. What has to be tracked, and when?

### Introduce the concept in isolation

```clojure
(defn all-false [n i v]
  (if (>= i n)
    v
    (all-false n (+ i 1) (assoc v i false))))

(defn bfs-continue-step [adj visited q order neighbors i]
  (if (get visited (get neighbors i))
    (bfs-continue adj visited q order neighbors (+ i 1))
    (bfs-continue adj (assoc visited (get neighbors i) true) (enqueue q (get neighbors i)) order neighbors (+ i 1))))

(defn bfs-continue [adj visited q order neighbors i]
  (if (>= i (count neighbors))
    (bfs-loop adj visited q order)
    (bfs-continue-step adj visited q order neighbors i)))
```

```
user=> (all-false 5 0 [])
[false false false false false]
```

`visited` is Lesson 102's own array-of-booleans convention, one entry per vertex. `bfs-continue-step` checks *before* enqueuing: an already-visited neighbor is skipped entirely; an unvisited one is marked visited **immediately**, at the moment it's discovered — not when it's later dequeued — which is exactly what prevents the same vertex from being added to the queue twice by two different already-processed neighbors.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: `visited` reuses Lesson 102's own array-of-booleans convention directly; `bfs-continue-step`'s "mark visited at discovery time, not at processing time" is this lesson's own derivation, necessary for correctness on any graph containing cycles or multiple paths to the same vertex.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn bfs-continue-step [adj visited q order neighbors i]
  (if (get visited (get neighbors i))
    (bfs-continue adj visited q order neighbors (+ i 1))
    (bfs-continue adj (assoc visited (get neighbors i) true) (enqueue q (get neighbors i)) order neighbors (+ i 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get visited (get neighbors i))`** — first appearance: checks whether the `i`-th neighbor has already been discovered, *before* deciding anything else.
- **`(assoc visited (get neighbors i) true)`** — first appearance: marking visited happens in the *same step* as the decision to enqueue — never separated, never deferred, since either one happening without the other would allow a duplicate enqueue.
- **`(enqueue q (get neighbors i))`** — reappearing (Lesson 87): adds the newly-discovered vertex to the *back* of the queue, behind everything already waiting — the exact mechanism enforcing this lesson's own layer-by-layer claim.

### CS Lens

Marking visited at discovery time, not processing time, is a real, specific correctness requirement graphs introduce that Section V's tree traversals never needed — a tree (Lesson 30) has no cycles and exactly one path to any node, so "already visited" was never a question worth asking there at all.

### SE Lens

Getting this ordering wrong — marking visited only when a vertex is *dequeued*, for instance — would allow the same vertex to be enqueued multiple times by different neighbors discovering it before any of those duplicate entries get processed, wasting work and, on some graphs, growing the queue without bound.

### Connection to the previous unit

The previous unit explained why a queue produces the right order; this unit is the mechanism keeping that order correct — every vertex enqueued exactly once, the moment it's first discovered.

---

## Concept Unit: The Main Loop, Verified End to End

### The Problem

Given the neighbor-processing step, what drives the whole traversal — deciding which vertex to process next, and when the entire search is finished?

### Introduce the concept in isolation

```clojure
(defn bfs-visit [adj visited q order current]
  (bfs-continue adj visited (dequeue q) (assoc order (count order) current) (get adj current) 0))

(defn bfs-loop [adj visited q order]
  (if (and (empty? (queue-in q)) (empty? (queue-out q)))
    order
    (bfs-visit adj visited q order (queue-peek q))))

(defn bfs [adj start n]
  (bfs-loop adj (assoc (all-false n 0 []) start true) (enqueue (make-queue) start) []))
```

```
user=> (bfs [[1 2] [3] [3] [4] []] 0 5)
[0 1 2 3 4]
```

Starting from vertex `0` on Lesson 123's own five-vertex graph: `0`'s neighbors `1` and `2` are discovered and enqueued (layer `1`); `1`'s neighbor `3` is discovered (layer `2`); `2`'s only neighbor, `3`, is *already* visited by the time `2` is processed — skipped, exactly this lesson's second unit's own guarantee working correctly; `3`'s neighbor `4` is discovered last (layer `3`). Final order: `[0 1 2 3 4]` — every vertex visited exactly once, in increasing distance from `0`.

### Discard the throwaway example

Not applicable — `bfs`, `bfs-loop`, and `bfs-visit` are real, reusable functions, hand-traced completely before being shown here.

### Project Change

- **Reference Source**: `bfs-loop`'s empty check reuses `queue-in`/`queue-out` (Lesson 87) directly — Lesson 87 itself only assigned a `queue-empty?` implementation as an exercise, not a guaranteed function, so this lesson checks both internal stacks explicitly rather than assuming it exists.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn bfs [adj start n]
  (bfs-loop adj (assoc (all-false n 0 []) start true) (enqueue (make-queue) start) []))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(assoc (all-false n 0 []) start true)`** — first appearance: the start vertex is marked visited *before* the loop even begins — it will never be re-discovered through any path back to itself.
- **`(enqueue (make-queue) start)`** — reappearing `make-queue`/`enqueue` (Lesson 87): the frontier begins holding exactly one vertex, the start.
- **`(and (empty? (queue-in q)) (empty? (queue-out q)))`** — first appearance: the traversal ends exactly when nothing remains to explore — no more discovered-but-unprocessed vertices anywhere.
- **`(queue-peek q)`** — reappearing (Lesson 87): reads the frontier's oldest member without removing it, passed to `bfs-visit` to decide what's processed this step.

### CS Lens

BFS visiting every reachable vertex, exactly once, in increasing distance order, is the direct graph generalization of Lesson 30's `tree-sum`: a tree traversal that visits every node exactly once, using structural recursion instead of a queue, because a tree's own shape (no cycles) makes "already visited" unnecessary — BFS is what that same goal requires once cycles become possible.

### SE Lens

`bfs`'s cost is `O(V + E)` — every vertex processed once (`V`), every edge examined once, while checking its destination's visited status (`E`) — genuinely efficient, proportional to the graph's actual size, not to any worse bound a naive re-exploration of already-visited vertices might have produced.

### Connection to the previous unit

The previous unit built the correctness mechanism (mark visited at discovery); this unit assembles the complete algorithm around it, verified in full on a real graph, producing exactly the layer-by-layer order this lesson's first unit predicted from the queue's own FIFO discipline alone.

---

## Connect the Pieces

The full traversal, and what its output order actually proves:

```clojure
(println "BFS order from vertex 0:" (bfs [[1 2] [3] [3] [4] []] 0 5))
```

```
BFS order from vertex 0: [0 1 2 3 4]
```

This order isn't arbitrary — it's a direct, checkable record of each vertex's distance from `0`, in edges: `0` at distance `0`, `1` and `2` at distance `1`, `3` at distance `2`, `4` at distance `3` — a fact Lesson 129 (*Shortest Paths*) builds on directly for unweighted graphs.

## What Breaks Without This

Suppose `bfs-continue-step` marked a vertex visited only when it was *dequeued* (processed), not when it was first *discovered*:

```clojure
(defn broken-continue-step [adj visited q order neighbors i]
  (bfs-continue adj visited (enqueue q (get neighbors i)) order neighbors (+ i 1)))
```

On this lesson's own graph, vertex `3` would be enqueued *twice* — once while processing vertex `1` (its neighbor), and again while processing vertex `2` (also its neighbor) — since neither enqueue checked or updated `visited` at all. The traversal would still terminate here (the graph is small and acyclic), but it would visit `3` twice, and on a graph containing an actual cycle, vertices could be enqueued without bound, never terminating — exactly the correctness requirement this lesson's second unit named as graphs' own genuine departure from Section V's tree traversals.

## Exercises

1. **Trace.** By hand, trace `(bfs [[1 2] [3] [3] [4] []] 3 5)` — starting from vertex `3` instead of `0`. Which vertices are unreachable, and what does `bfs`'s own final `order` contain for them?
2. **Predict.** Before checking, predict `(bfs [[1] [2] [0]] 0 3)` (a directed 3-cycle: `0 \to 1 \to 2 \to 0`). Confirm the traversal terminates correctly despite the cycle.
3. **Verify.** Confirm, using `bfs`'s own output order, that vertex `3` is discovered at exactly distance `2` from vertex `0` — one edge from either `1` or `2`, both themselves one edge from `0`.
4. **Break it, on purpose.** Run `broken-continue-step` (substituted into `bfs-continue`) on this lesson's own graph, and confirm vertex `3` appears twice in the output order.
5. **Generalize.** Modify `bfs` to also return each vertex's distance from the start (not just the visit order), by tracking one more piece of state alongside `visited`.
6. **Reconstruct.** Close this lesson. From memory, explain why marking a vertex visited at discovery time, not processing time, is required for correctness, and why a queue specifically (not any other structure) produces layer-by-layer order.

## Definition of Done

- [ ] You can implement `bfs` and trace its execution on a small graph by hand.
- [ ] You can explain why marking visited at discovery time (not processing time) is required.
- [ ] You can explain why a queue, specifically, produces layer-by-layer order.
- [ ] You completed Exercise 2 and confirmed correct termination on a graph containing a cycle.
- [ ] You completed Exercise 5 and extended `bfs` to track distances.
- [ ] Commit your Exercise 2 and Exercise 5 work to your notes repository, with a commit message stating what you confirmed and built — for example, `"Confirm bfs terminates correctly on a 3-cycle; extend bfs to track per-vertex distance from start"` — not just `"lesson 124 exercise"`.

---

**Next lesson:** Lesson 125, *Depth-First Search*, replaces this lesson's queue with a stack — or, equivalently, plain recursion — and derives a traversal order that explores as deep as possible before backtracking, a structurally different strategy from the identical starting point.
