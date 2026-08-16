# Lesson 123: Graphs as Computational Objects

**What you will build**: By the end of this lesson you'll represent a graph — vertices and the relationships between them — two genuinely different ways, an adjacency list and an adjacency matrix, both verified on the identical small example, establishing the vocabulary and representations every graph algorithm from Lesson 124 onward builds on directly.

**What you need to know first**: Lesson 102's array-of-indices convention for representing elements as integers; Lesson 85's vector-as-pair; Lesson 94's array-as-complete-structure indexing discipline.

**Terms introduced in this lesson**:

- **graph** — a set of **vertices** (the things) together with a set of **edges** (the relationships between pairs of them). *Why it matters*: this series' most general structure yet — Lesson 92's BST and Lesson 30's tree are both graphs with an extra constraint (no cycles, one path between any two vertices); a plain graph drops that constraint entirely.
- **directed** versus **undirected** — a directed edge `(u, v)` points one way, from `u` to `v` only; an undirected edge `\{u, v\}` connects both ways at once. *Why it matters*: "who follows whom" (directed, like a social network) and "who's connected to whom" (undirected, like a road network) are genuinely different relationships, needing different representations.
- **weighted** — an edge carrying a number (distance, cost, capacity) beyond simply existing. *Why it matters*: Lesson 130 (*Dijkstra's Algorithm*), much later, needs weighted edges specifically to define "shortest" as more than just "fewest edges."
- **adjacency list** — a representation where each vertex stores a list of the vertices it has an edge to. *Why it matters*: this lesson's primary representation, efficient for the "what are this vertex's neighbors" question every graph-traversal algorithm from Lesson 124 onward asks constantly.
- **adjacency matrix** — a representation where a 2D table's `[i][j]` entry records whether (or how expensively) an edge exists from `i` to `j`. *Why it matters*: a different tradeoff — `O(1)` to check *whether* a specific edge exists, at the cost of space proportional to the *square* of the vertex count, regardless of how few edges actually exist.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: Vertices, Edges, and an Adjacency List

### The Problem

Lesson 92's BST and Lesson 30's tree both connect values via references, but always with a strict shape — one parent, no cycles. Most real relationships — a road network, a dependency graph, a social network — don't respect that shape at all. What's the most direct way to represent "these vertices, these relationships" with no shape constraint whatsoever?

### Introduce the concept in isolation

Represent vertices as integers `0` through `n-1` (Lesson 102's own convention), and edges as `[from to]` pairs (Lesson 85's vector-as-pair):

```clojure
(defn empty-adj-at [n i adj]
  (if (>= i n)
    adj
    (empty-adj-at n (+ i 1) (assoc adj i []))))

(defn add-edge-to-adj [adj edge]
  (assoc adj (get edge 0) (assoc (get adj (get edge 0)) (count (get adj (get edge 0))) (get edge 1))))

(defn build-adj-from [adj edges i]
  (if (>= i (count edges))
    adj
    (build-adj-from (add-edge-to-adj adj (get edges i)) edges (+ i 1))))

(defn build-adj [n edges]
  (build-adj-from (empty-adj-at n 0 []) edges 0))
```

```
user=> (build-adj 5 [[0 1] [0 2] [1 3] [2 3] [3 4]])
[[1 2] [3] [3] [4] []]
```

Five vertices, five directed edges: `0 \to 1`, `0 \to 2`, `1 \to 3`, `2 \to 3`, `3 \to 4`. The result is an **adjacency list**: position `0` holds `[1 2]` — vertex `0`'s own two neighbors — position `4` holds `[]`, since vertex `4` has no outgoing edges at all.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified.

### Project Change

- **Reference Source**: No reference counterpart — a direct translation of "each vertex stores its own neighbor list," using Lesson 94's `assoc`-as-append convention at two levels: appending an empty list per vertex, then appending a neighbor into the correct vertex's own list.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn build-adj [n edges]
  (build-adj-from (empty-adj-at n 0 []) edges 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(empty-adj-at n i adj)`** — first appearance: builds `n` separate empty neighbor lists, one per vertex, before any edge is added — every vertex exists in the representation even if it ends up with no edges at all.
- **`(get adj (get edge 0))`** — first appearance: looks up the *current* neighbor list of the edge's `from` vertex, to append onto it.
- **`(assoc (get adj (get edge 0)) (count (get adj (get edge 0))) (get edge 1))`** — reappearing `assoc`-as-append (Lesson 94), applied to a vertex's own inner list, adding its new neighbor.
- **`(assoc adj (get edge 0) ...)`** — reappearing `assoc` at the outer level: the modified inner list replaces the old one at the correct vertex position.

### CS Lens

An adjacency list is Lesson 94's own array-as-structure idea, nested one level deeper: rather than one array holding values directly, this is an array of arrays, each inner array holding exactly the neighbors relevant to one specific vertex.

### SE Lens

Building `n` empty lists *before* processing any edges (`empty-adj-at`) is what guarantees every vertex — even an isolated one with no edges — has a well-defined (empty) entry, rather than causing a lookup failure the first time some later algorithm asks "what are vertex `4`'s neighbors" and finds nothing there at all.

---

## Concept Unit: Adjacency Matrix and Weighted Edges

### The Problem

An adjacency list answers "what are this vertex's neighbors" efficiently, but answering "is there specifically an edge from `3` to `4`" means scanning vertex `3`'s entire neighbor list. Is there a representation trading list-scanning for direct lookup — and how would it represent an edge's *weight*, not just its existence?

### Introduce the concept in isolation

```clojure
(defn empty-matrix-row [n j row]
  (if (>= j n)
    row
    (empty-matrix-row n (+ j 1) (assoc row j 0))))

(defn empty-matrix [n i matrix]
  (if (>= i n)
    matrix
    (empty-matrix n (+ i 1) (assoc matrix i (empty-matrix-row n 0 [])))))

(defn add-weighted-edge [matrix edge]
  (assoc matrix (get edge 0) (assoc (get matrix (get edge 0)) (get edge 1) (get edge 2))))

(defn build-matrix [n edges]
  (build-matrix-from (empty-matrix n 0 []) edges 0))

(defn build-matrix-from [matrix edges i]
  (if (>= i (count edges))
    matrix
    (build-matrix-from (add-weighted-edge matrix (get edges i)) edges (+ i 1))))
```

```
user=> (build-matrix 3 [[0 1 5] [1 2 3] [0 2 10]])
[[0 5 10] [0 0 3] [0 0 0]]
```

Each `[from to weight]` triple sets exactly one matrix cell: `matrix[0][1] = 5` (an edge `0 \to 1`, weight `5`), and so on. `0` in any other cell means **no edge** — a real, honest ambiguity this representation carries (a genuine zero-weight edge would look identical to "no edge") — worth naming rather than glossing over, though this lesson's own examples never need a genuine zero-weight edge.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified.

### Project Change

- **Reference Source**: `empty-matrix`/`add-weighted-edge` extend this lesson's own first-unit pattern one dimension further — a vector of vectors, sized `n \times n`, rather than a vector of variable-length neighbor lists.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn build-matrix [n edges]
  (build-matrix-from (empty-matrix n 0 []) edges 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(empty-matrix-row n j row)`** — first appearance: one entire row of `n` zeros, representing "no edges yet from this one vertex to anywhere."
- **`(empty-matrix n i matrix)`** — first appearance: `n` such rows, one per vertex — an `n \times n` table, `O(n^2)` cells, built before any real edge exists.
- **`(assoc (get matrix (get edge 0)) (get edge 1) (get edge 2))`** — first appearance: sets exactly one cell, `[from][to]`, to the edge's own weight — `O(1)`, no scanning required.

### CS Lens

`build-matrix`'s `O(n^2)` space cost, paid regardless of how many edges actually exist, versus `build-adj`'s space proportional only to the *actual* edge count — this is Lesson 100's own wide-versus-narrow tradeoff, transplanted: a matrix trades space for guaranteed `O(1)` edge lookup; a list trades guaranteed lookup speed for space proportional to what's actually there.

### SE Lens

For a **sparse** graph — far fewer edges than the `n^2` a matrix always allocates — an adjacency list is usually the better choice; for a **dense** graph, or when "does this specific edge exist" needs to be checked constantly, a matrix's `O(1)` lookup can be worth its larger space cost. Neither representation is universally correct, the identical lesson Lesson 107's own four-question method already taught for choosing among Section V's structures.

### Connection to the previous unit

The previous unit built the space-efficient, neighbor-list-oriented representation; this unit builds the lookup-efficient, fixed-size alternative — the same graph, two genuinely different tradeoffs, exactly the choice Lesson 124 onward will make once per algorithm based on what each one actually needs.

---

## Connect the Pieces

The identical five-vertex graph, both ways:

```clojure
(println "Adjacency list:" (build-adj 5 [[0 1] [0 2] [1 3] [2 3] [3 4]]))
(println "Vertex 3's neighbors, via list:" (get (build-adj 5 [[0 1] [0 2] [1 3] [2 3] [3 4]]) 3))
```

```
Adjacency list: [[1 2] [3] [3] [4] []]
Vertex 3's neighbors, via list: [4]
```

Every graph algorithm this series builds from Lesson 124 forward will construct one of these two representations first, exactly the way every Section V structure began with a representation before any operation was derived on top of it.

## What Breaks Without This

Suppose `build-adj` skipped `empty-adj-at`, starting instead from an empty vector `[]` and relying on edges alone to populate it:

```clojure
(defn broken-build-adj [edges]
  (build-adj-from [] edges 0))
```

Vertex `4`, with no outgoing edges in this lesson's own example, would simply never get an entry at all — `(get result 4)` would return `nil`, not `[]`, and any later algorithm calling `(count (get result 4))` to check how many neighbors vertex `4` has would fail immediately, rather than correctly reporting zero. Pre-populating every vertex's entry, even an empty one, before processing any edge is what makes "no neighbors" a real, checkable answer instead of a missing one.

## Exercises

1. **Trace.** By hand, trace `(build-adj 3 [[0 1] [1 2] [2 0]])` (a directed cycle), confirming every vertex has exactly one outgoing edge.
2. **Predict.** Before checking, predict `(build-matrix 3 [[0 1] [1 2] [2 0]])`'s shape if edges are given as `[from to]` pairs without weights — what would need to change in `add-weighted-edge` to handle an unweighted edge (existence only, no third element)?
3. **Verify.** Confirm `(get (build-adj 5 [[0 1] [0 2] [1 3] [2 3] [3 4]]) 4)` is `[]`, not `nil`, matching this lesson's own empty-list guarantee.
4. **Break it, on purpose.** Run `broken-build-adj` on this lesson's own five-edge example and confirm `(count (get result 4))` fails.
5. **Generalize.** Write `build-undirected-adj`, adding *both* `[from to]` and `[to from]` for every input edge, representing an undirected graph.
6. **Reconstruct.** Close this lesson. From memory, explain the space-versus-lookup tradeoff between an adjacency list and an adjacency matrix, and when each is the better choice.

## Definition of Done

- [ ] You can build both an adjacency list and an adjacency matrix from an edge list.
- [ ] You can explain the difference between directed and undirected, and weighted and unweighted, edges.
- [ ] You can state the space-versus-lookup tradeoff between the two representations precisely.
- [ ] You completed Exercise 3 and confirmed the empty-neighbor-list guarantee directly.
- [ ] You completed Exercise 5 and implemented a correct `build-undirected-adj`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you confirmed and built — for example, `"Confirm isolated vertices get empty (not nil) neighbor lists; implement build-undirected-adj adding edges in both directions"` — not just `"lesson 123 exercise"`.

---

**Next lesson:** Lesson 124, *Breadth-First Search*, derives the first real algorithm on this lesson's adjacency-list representation — exploring a graph one full "layer" of distance at a time, reusing Lesson 87's plain FIFO queue directly.
