# Lesson 128: Connected Components

**What you will build**: By the end of this lesson you'll partition an undirected graph into its separate, connected pieces two genuinely different ways — repeated DFS, and Lesson 103's own union-find, promised back then and delivered now — verified against each other on the identical graph, and see directly why Lesson 133's Kruskal's algorithm will need the second approach specifically.

**What you need to know first**: Lesson 125's DFS; Lesson 102's `uf-make`/`uf-union` and Lesson 103's path-compressing `uf-find`; Lesson 123's undirected-adjacency exercise.

**Terms introduced in this lesson**:

- **connected component** — a maximal set of vertices where every pair is reachable from each other via some path of undirected edges. *Why it matters*: a graph need not be one connected piece at all — this lesson's own example has three separate ones.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), and `uf-make`/`uf-union` (Lesson 102, Lesson 103), each already covered.

---

## Concept Unit: Repeated DFS — One Traversal per Component

### The Problem

Lesson 125's DFS, run once, visits every vertex *reachable* from its starting point — but not necessarily every vertex in the graph, if the graph isn't a single connected piece. Can running it repeatedly, once per still-unvisited vertex, partition the whole graph?

### Introduce the concept in isolation

```clojure
(declare comp-visit)

(defn comp-explore-step [adj comp-id state neighbors i current]
  (if (get (get state 0) (get neighbors i))
    (comp-explore adj comp-id state neighbors (+ i 1) current)
    (comp-explore adj comp-id (comp-visit adj comp-id state (get neighbors i)) neighbors (+ i 1) current)))

(defn comp-explore [adj comp-id state neighbors i current]
  (if (>= i (count neighbors))
    state
    (comp-explore-step adj comp-id state neighbors i current)))

(defn comp-visit [adj comp-id state current]
  (comp-explore adj comp-id [(assoc (get state 0) current true) (assoc (get state 1) current comp-id)] (get adj current) 0 current))

(defn comp-find-from [adj state comp-id v n]
  (if (>= v n)
    (get state 1)
    (if (get (get state 0) v)
      (comp-find-from adj state comp-id (+ v 1) n)
      (comp-find-from adj (comp-visit adj comp-id state v) (+ comp-id 1) (+ v 1) n))))

(defn components [adj n]
  (comp-find-from adj [(all-false n 0 []) (all-false n 0 [])] 0 0 n))
```

```
user=> (components [[1] [0 2] [1] [4] [3] []] 6)
[0 0 0 1 1 1]
```

`comp-find-from` scans vertex `0` through `n-1`; each still-unvisited vertex starts a *fresh* DFS, using the *same* `comp-id` for every vertex it reaches, then increments `comp-id` before continuing the scan. Six vertices, three components: `\{0,1,2\}` (component `0`), `\{3,4\}` (component `1`), `\{5\}$ (component `2`, isolated — reached by no edges at all, but still assigned its own `comp-id` when the scan reaches it directly).

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified.

### Project Change

- **Reference Source**: `comp-visit`/`comp-explore` reuse Lesson 125's `dfs-visit`/`dfs-explore` structure directly, replacing the recorded `order` with a `comp-id` stamped on every reached vertex instead.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn components [adj n]
  (comp-find-from adj [(all-false n 0 []) (all-false n 0 [])] 0 0 n))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get (get state 0) v)`, in `comp-find-from`** — first appearance of this specific check: skips any vertex a *previous* component's DFS already reached, ensuring every vertex gets exactly one `comp-id`.
- **`(+ comp-id 1)`**, only in the branch that starts a *new* DFS — reappearing counting pattern: the ID only advances when a genuinely new, previously-unreached component is found.
- **`(assoc (get state 1) current comp-id)`** — reappearing `assoc` (Lesson 94): every vertex reached during one DFS call shares the identical `comp-id`, by construction.

### CS Lens

This is Lesson 124's own BFS-versus-DFS choice, revisited: BFS would work identically here — the *order* within one component doesn't matter for this problem, only *which* component each vertex ends up assigned to, so either traversal answers this question equally well.

### SE Lens

`components`'s cost is `O(V + E)` — a single pass over the entire graph, each vertex and edge examined exactly once across all the repeated DFS calls combined, not once *per* call.

---

## Concept Unit: Union-Find — the Approach Lesson 103 Promised

### The Problem

Lesson 103's own SE lens named Lesson 128 directly as a place union-find would be used. Can the identical partitioning be computed by processing edges, one at a time, rather than traversing the graph structurally at all?

### Introduce the concept in isolation

```clojure
(defn uf-components-from [parents edges i]
  (if (>= i (count edges))
    parents
    (uf-components-from (uf-union parents (get (get edges i) 0) (get (get edges i) 1)) edges (+ i 1))))

(defn uf-components [n edges]
  (uf-components-from (uf-make n) edges 0))
```

```
user=> (uf-components 6 [[0 1] [1 2] [3 4]])
[1 2 2 4 4 5]
```

Each undirected edge is simply `uf-union`ed. `(uf-find parents 0)`, `(uf-find parents 1)`, and `(uf-find parents 2)` all reach the identical root, `2` — the same component `components` (this lesson's first unit) called `0`. `3` and `4` share root `4` (matching component `1`); `5`, untouched by any edge, is its own root, `5` (matching component `2`). Different labels, identical partition.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and directly confirmed against the previous unit's own result.

### Project Change

- **Reference Source**: `uf-components`/`uf-components-from` reuse Lesson 102's `uf-make`/`uf-union` directly, unchanged — the exact promise Lesson 103's own SE lens made about this lesson.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn uf-components [n edges]
  (uf-components-from (uf-make n) edges 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(uf-union parents (get (get edges i) 0) (get (get edges i) 1))`** — reappearing (Lesson 102): each edge merges its two endpoints' groups, regardless of whether they're already connected (`uf-union-roots`'s own no-op case, Lesson 102, handles that safely).
- **`(uf-components-from ... edges (+ i 1))`** — reappearing structural recursion: edges are processed **one at a time**, each one immediately updating the structure — a genuinely different access pattern than `components`'s own single full-graph traversal.

### CS Lens

`components` needs the *entire* adjacency list available before it can run at all; `uf-components` processes edges one at a time, in any order, updating a valid answer incrementally after each one — a real, structural difference this lesson's third unit shows is the actual reason to prefer one over the other.

### SE Lens

Nothing about `uf-components` required building an adjacency list (Lesson 123) at all — a plain edge list was enough, since union-find never needs to ask "what are this vertex's neighbors," only "merge these two, and are these two already merged."

### Connection to the previous unit

The previous unit partitioned the graph via structural traversal; this unit partitions the identical graph via incremental edge processing, confirmed to produce the same underlying grouping despite using entirely different machinery.

---

## Concept Unit: Why Kruskal's Algorithm Needs Union-Find, Not DFS

### The Problem

Both approaches cost `O(V + E)`-ish and produce equivalent results. Is there a real reason to prefer union-find specifically, beyond "it happens to also work"?

### Introduce the concept in isolation

`uf-components` processes edges **one at a time**, and after *every single one*, `uf-connected?` (Lesson 102) can correctly answer "are these two vertices in the same component *right now*" — a genuinely incremental, any-time answer. `components`, by contrast, needs the *entire* graph's adjacency list built and a *complete* traversal finished before it can answer anything at all. Lesson 133 (*Kruskal and Prim*), much later, builds a minimum spanning tree by considering edges *one at a time*, in increasing weight order, needing "would adding this edge connect two already-connected vertices?" answered incrementally, after each decision — exactly what `uf-connected?` provides and repeated DFS structurally cannot.

### Discard the throwaway example

Not applicable — this unit names the real, forward-looking reason for this lesson's second approach, introducing no new code.

### CS Lens

This is Lesson 106's own lesson again: two representations (a full adjacency-list traversal, an incremental union-find) serving the identical ADT ("which vertices are connected") — but only one of them supports being *queried mid-construction*, a capability the ADT's own bare definition never mentioned, yet turns out to matter enormously for a later algorithm.

### SE Lens

Choosing union-find over repeated DFS for connectivity isn't about raw cost — both are efficient — it's about which one's *access pattern* matches the actual problem: a batch question ("here's the whole graph, partition it") fits `components`; an incremental question ("as I consider edges one at a time, would this one create a redundant connection?") fits `uf-components`, and only `uf-components`.

### Connection to the previous unit

The previous unit showed both approaches agree; this unit is why the choice between them isn't arbitrary — Lesson 103's own forward reference to this exact moment is finally, concretely justified.

---

## Connect the Pieces

Both approaches, confirmed to agree on the identical graph:

```clojure
(println "Via repeated DFS:" (components [[1] [0 2] [1] [4] [3] []] 6))
(println "Via union-find, roots:" (uf-components 6 [[0 1] [1 2] [3 4]]))
```

```
Via repeated DFS: [0 0 0 1 1 1]
Via union-find, roots: [1 2 2 4 4 5]
```

Different labels — component IDs `0, 1, 2` versus roots `2, 4, 5` — but the identical grouping: vertices `\{0,1,2\}` together, `\{3,4\}` together, `5` alone, confirmed two structurally unrelated ways.

## What Breaks Without This

Suppose Kruskal's algorithm (previewed, not built, in this lesson's third unit) used `components` instead of union-find, needing to re-run a full graph traversal after *every single edge decision* to check whether adding it would connect two already-connected vertices. Each check would cost `O(V + E)` — the *entire* graph re-traversed — and with `E` edges to consider one at a time, the total cost would balloon to `O(E \times (V + E))`, drastically worse than `uf-components`'s own near-linear, incrementally-updated cost (Lesson 103's own amortized result). Both algorithms would still be *correct* — the failure here is purely a cost one, invisible until run on a graph large enough for the difference to actually matter.

## Exercises

1. **Trace.** By hand, trace `(components [[1] [0] [] []] 4)` — vertices `0` and `1` connected, `2` and `3` both isolated. Confirm three separate component IDs.
2. **Predict.** Before checking, predict `(uf-components 4 [[0 1]])` — the identical graph as Exercise 1, as an edge list. Confirm the roots partition identically.
3. **Verify.** Using this lesson's own six-vertex example, confirm `(uf-connected? (uf-components 6 [[0 1] [1 2] [3 4]]) 0 2)` is `true` and `(uf-connected? ... 0 3)` is `false`.
4. **Break it, on purpose.** Add a *fourth* edge, `[2 3]`, to this lesson's edge list, and confirm both `components` (on the corresponding updated adjacency list) and `uf-components` now report only *two* components, not three.
5. **Generalize.** Write `component-count`, returning how many distinct components a graph has, using either this lesson's `components` or `uf-components` as its own foundation.
6. **Reconstruct.** Close this lesson. From memory, explain the real, structural reason Kruskal's algorithm (Lesson 133) needs union-find rather than repeated DFS, not just that both happen to work.

## Definition of Done

- [ ] You can implement `components` using repeated DFS and explain why `comp-id` only advances on a genuinely new component.
- [ ] You can implement `uf-components` and confirm it agrees with `components` on the same graph.
- [ ] You can explain the real, incremental-versus-batch reason to prefer union-find for some problems.
- [ ] You completed Exercise 3 and confirmed `uf-connected?` correctly distinguishes same- and different-component pairs.
- [ ] You completed Exercise 5 and implemented a correct `component-count`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you confirmed and built — for example, `"Confirm uf-connected? correctly distinguishes 0-2 (same component) from 0-3 (different); implement component-count"` — not just `"lesson 128 exercise"`.

---

**Next lesson:** Lesson 129, *Shortest Paths*, defines precisely what "shortest" means once edges carry weights, and compares the assumptions different shortest-path algorithms make — starting with why Lesson 124's own BFS already solves this problem exactly, but only for unweighted graphs.
