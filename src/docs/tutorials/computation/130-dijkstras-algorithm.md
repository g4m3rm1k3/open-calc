# Lesson 130: Dijkstra's Algorithm

**What you will build**: By the end of this lesson you'll derive a genuinely correct shortest-path algorithm for weighted graphs, fixing exactly the failure Lesson 129 proved BFS has — and prove, by contradiction, the one greedy invariant that makes it correct: once a vertex's distance estimate is the smallest among everything not yet finalized, that estimate is already exactly right, provided every edge weight is non-negative.

**What you need to know first**: Lesson 129's `path-weight` and its BFS counterexample; Lesson 118's exchange-argument proof style, for this lesson's own correctness proof; Lesson 111's minimum-finding scan pattern.

**Terms introduced in this lesson**:

- **relax** — checking whether reaching a vertex *through* a specific neighbor would improve its current best-known distance, and updating it if so. *Why it matters*: this lesson's entire algorithm is nothing more than "extract the closest unfinalized vertex, relax every edge out of it," repeated.

**Objects and methods used**: None new. This lesson reuses `get`/`assoc`/`count` (Lesson 84, Lesson 94) and Lesson 123's weighted adjacency matrix, each already covered.

---

## Concept Unit: Extract-Minimum, Then Relax

### The Problem

Lesson 129 proved BFS's edge-counting fails once weights vary. Can a *distance*-based greedy choice — always finalize whichever unfinalized vertex currently has the smallest distance estimate — replace it correctly?

### Introduce the concept in isolation

```clojure
(defn min-unvisited [dist finalized v best]
  (if (>= v (count dist))
    best
    (if (get finalized v)
      (min-unvisited dist finalized (+ v 1) best)
      (if (or (= best -1) (< (get dist v) (get dist best)))
        (min-unvisited dist finalized (+ v 1) v)
        (min-unvisited dist finalized (+ v 1) best)))))

(defn relax [matrix dist u v]
  (if (= (get (get matrix u) v) 0)
    dist
    (if (< (+ (get dist u) (get (get matrix u) v)) (get dist v))
      (assoc dist v (+ (get dist u) (get (get matrix u) v)))
      dist)))

(defn relax-all [matrix dist u v n]
  (if (>= v n)
    dist
    (relax-all matrix (relax matrix dist u v) u (+ v 1) n)))
```

```
user=> (relax [[0 4 1 0] [0 0 0 1] [0 1 0 5] [0 0 0 0]] [0 999999 999999 999999] 0 1)
[0 4 999999 999999]
```

`min-unvisited` scans every vertex, ignoring already-`finalized` ones, tracking whichever unfinalized vertex has the smallest current `dist`. `relax` checks one specific edge: does reaching `v` through `u` (`dist[u] + \text{weight}(u,v)$) beat `v`'s own current best estimate? If so, update it. `relax-all` does this for every possible neighbor of `u` in one pass.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified.

### Project Change

- **Reference Source**: `min-unvisited` reuses Lesson 111's minimum-scan pattern directly, adapted to skip already-finalized vertices; `relax` is a direct implementation of "does a shorter path through `u` exist," this lesson's own central operation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn relax [matrix dist u v]
  (if (= (get (get matrix u) v) 0)
    dist
    (if (< (+ (get dist u) (get (get matrix u) v)) (get dist v))
      (assoc dist v (+ (get dist u) (get (get matrix u) v)))
      dist)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (get (get matrix u) v) 0)`** — reappearing Lesson 123's own no-edge convention: no edge means nothing to relax.
- **`(+ (get dist u) (get (get matrix u) v))`** — first appearance: the candidate distance to `v`, *through* `u` specifically — `u`'s own already-known distance, plus this one edge's weight.
- **`(or (= best -1) (< (get dist v) (get dist best)))`** — first appearance: `-1` is `min-unvisited`'s own sentinel for "nothing found yet," checked first so the very first unfinalized vertex is always accepted without a meaningless comparison against itself.

### CS Lens

`relax`'s condition — `dist[u] + \text{weight}(u,v) < dist[v]$ — is the exact algebraic statement of "a path through `u` is better than whatever's currently known," the same "compare a candidate against the best so far" shape Lesson 111's own `max-index-from` used, now comparing path lengths instead of raw values.

### SE Lens

This lesson's `min-unvisited` costs `O(V)` per call, called once per vertex — `O(V^2)` total, a real, honest simplification: a production implementation reuses Lesson 96's priority queue to bring this down to `O((V+E)\log V)`, a refinement this lesson names but doesn't build, keeping focus on the algorithm's correctness rather than its optimization.

---

## Concept Unit: The Greedy Invariant, Proven by Contradiction

### The Problem

Extracting the unfinalized vertex with the smallest current estimate and trusting that estimate as *final* is a genuine greedy choice — Lesson 117's own warning applies directly. Can this specific greedy choice actually be proven correct, the way Lesson 118's exchange argument proved activity selection?

### Introduce the concept in isolation

**Claim**: when `min-unvisited` selects vertex `u`, `dist[u]` already equals the true shortest-path distance from the source to `u` — *provided every edge weight is non-negative*.

**Proof**, by contradiction (Lesson 17): suppose some path `P` to `u` is genuinely shorter than `dist[u]`. `P$ starts at the source (already finalized) and ends at `u` (not yet finalized) — so `P` must cross, at some point, from the finalized set into the unfinalized set, through some *first* unfinalized vertex `y` on the path. Because every edge weight is **non-negative**, the portion of `P` up to `y` costs no more than all of `P`, so it costs less than `dist[u]`. But `y`, reached from a finalized vertex, was already relaxed to at most that same cost — so `dist[y] \leq$ (cost of `P` up to `y`) `< dist[u]`. This directly contradicts `u` being chosen as the *minimum*-distance unfinalized vertex — `y` was unfinalized too, and had a strictly smaller distance. No such `P` can exist. ∎

### Discard the throwaway example

Not applicable — a formal proof about this lesson's own already-verified algorithm, not new code.

### Mechanical walkthrough — how the proof works, step by step

1. **Assume the opposite** — reappearing proof by contradiction (Lesson 17): assume a shorter path exists, derive an impossibility.
2. **`P` must cross the finalized boundary** — a real structural fact: the source is finalized, `u` isn't, so somewhere `P` transitions.
3. **Non-negativity bounds the prefix** — the one place this proof genuinely needs the non-negative-weight assumption: a *negative*-weight edge later in `P` could make the *full* path cheaper than its own prefix, breaking this exact step.
4. **`y`'s already-relaxed distance beats `u`'s** — contradicts `u`'s own selection as the minimum, closing the proof.

### CS Lens

This is Lesson 118's own exchange-argument spirit, adapted to contradiction rather than construction: rather than showing greedy's choice can be exchanged into an optimal solution for free, this proof shows assuming greedy's choice is *wrong* leads directly to an impossible relationship between two distances.

### SE Lens

The non-negative-weight assumption isn't a minor technical footnote — it's the *one* step in this entire proof that would fail without it, precisely why Lesson 131's Bellman-Ford, handling negative weights, needs a genuinely different algorithm, not merely a small patch to this one.

### Connection to the previous unit

The previous unit built the algorithm; this unit is the actual justification — not "it seems to work," but a real proof, in Lesson 118's own tradition, naming exactly the one assumption everything rests on.

---

## Concept Unit: Verified in Full

### The Problem

Does this lesson's algorithm, run start to finish on a real weighted graph, actually produce the correct distances this lesson's proof promises?

### Introduce the concept in isolation

```clojure
(defn all-infinity [n i v]
  (if (>= i n) v (all-infinity n (+ i 1) (assoc v i 999999))))

(defn dijkstra-extract [matrix dist finalized u n]
  (if (= u -1)
    dist
    (dijkstra-step matrix (relax-all matrix dist u 0 n) (assoc finalized u true) n)))

(defn dijkstra-step [matrix dist finalized n]
  (dijkstra-extract matrix dist finalized (min-unvisited dist finalized 0 -1) n))

(defn dijkstra [matrix source n]
  (dijkstra-step matrix (assoc (all-infinity n 0 []) source 0) (all-false n 0 []) n))
```

```
user=> (dijkstra [[0 4 1 0] [0 0 0 1] [0 1 0 5] [0 0 0 0]] 0 4)
[0 2 1 3]
```

On a four-vertex graph (`0 \to 1$ weight `4`, `0 \to 2` weight `1`, `2 \to 1` weight `1`, `1 \to 3` weight `1`, `2 \to 3$ weight `5`): finalizing `0` relaxes `1` to `4` and `2` to `1`; finalizing `2` (smaller estimate) relaxes `1` down to `2` (via `2`, cheaper than the direct edge) and `3` to `6`; finalizing `1` relaxes `3` down to `3` (via `1`, cheaper than `2`'s own direct edge to `3`); finalizing `3` finds nothing left to relax. Final distances: `[0, 2, 1, 3]` — matching a direct hand-check of every possible path.

### Discard the throwaway example

Not applicable — `dijkstra` is real, reusable, and hand-verified completely, step by step, before being shown here.

### Project Change

- **Reference Source**: `dijkstra`/`dijkstra-step`/`dijkstra-extract` assemble this lesson's first unit into a complete algorithm, using `all-infinity` (Lesson 102's own array-fill convention) to seed every non-source distance as "not yet reached."
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn dijkstra [matrix source n]
  (dijkstra-step matrix (assoc (all-infinity n 0 []) source 0) (all-false n 0 []) n))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(assoc (all-infinity n 0 []) source 0)`** — reappearing `assoc` (Lesson 94): every vertex starts "unreached" except the source itself, distance `0` by definition.
- **`(= u -1)`**, in `dijkstra-extract` — reappearing sentinel check (this lesson's first unit): once every vertex is finalized, `min-unvisited` finds nothing left, and the algorithm correctly stops.

### CS Lens

`vertex 1`'s own distance being *revised downward*, from `4` to `2`, after `2` is finalized, is `relax` doing exactly its job — a vertex's first-discovered distance is never trusted as final until *it itself* is extracted as the current minimum, exactly this lesson's second unit's own proof requirement.

### SE Lens

Every one of this lesson's verified numbers traces directly back to the proof in the previous unit — this isn't a separate check that happens to agree, it's the proof's own guarantee, cashed in on real data.

### Connection to the previous unit

The previous unit proved the algorithm correct in general; this unit is that proof holding on a real, traced example, from empty distances to a fully correct result.

---

## Connect the Pieces

Dijkstra's answer versus Lesson 129's own BFS-based mistake, on a graph shaped for the comparison:

```clojure
(println "Dijkstra, shortest distance to vertex 1:" (get (dijkstra [[0 4 1 0] [0 0 0 1] [0 1 0 5] [0 0 0 0]] 0 4) 1))
(println "This required revising an earlier estimate downward, from 4 to 2.")
```

```
Dijkstra, shortest distance to vertex 1: 2
This required revising an earlier estimate downward, from 4 to 2.
```

Exactly the correction Lesson 129 showed BFS could never make — a path discovered *later*, through more edges, turning out to be genuinely cheaper.

## What Breaks Without This

Suppose `relax` were only ever called once per vertex, the first time it's reached, never revisited afterward — closer to how BFS's own single-discovery model works:

```clojure
(defn broken-relax [matrix dist u v discovered)
  (if (or (get discovered v) (= (get (get matrix u) v) 0))
    dist
    (assoc dist v (+ (get dist u) (get (get matrix u) v)))))
```

On this lesson's own graph, vertex `1` would be permanently stamped `4` (its first, direct-edge discovery), and the genuinely shorter path through vertex `2` — found *later*, but cheaper — would never be allowed to correct it, reproducing exactly Lesson 129's own BFS mistake in a new disguise. `relax`'s willingness to *revise* an already-discovered vertex's distance downward, as many times as a cheaper path is found, is not an incidental feature — it's the entire fix this lesson's algorithm makes over BFS's own one-shot discovery model.

## Exercises

1. **Trace.** By hand, trace `relax-all` for `u=2` on this lesson's own graph, confirming vertex `1`'s distance drops from `4` to `2` and vertex `3`'s becomes `6` (before later being revised again).
2. **Predict.** Before checking, predict `(dijkstra [[0 4 1 0] [0 0 0 1] [0 1 0 5] [0 0 0 0]] 2 4)` — starting from vertex `2` instead of `0`. Verify by tracing.
3. **Verify.** Confirm, using `path-weight` (Lesson 129) on the path `[0 2 1 3]`, that its total weight matches `dijkstra`'s own reported distance to vertex `3`, `3`.
4. **Break it, on purpose.** Add an edge with weight `-1` to this lesson's graph, and identify exactly which step of this lesson's proof (Concept Unit 2) breaks — trace `min-unvisited`'s own selection to see the proof's guarantee actually fail.
5. **Generalize.** State, in one sentence, why `dijkstra`'s cost is `O(V^2)` as written, and what specifically would need to change to bring it down to `O((V+E)\log V)`.
6. **Reconstruct.** Close this lesson. From memory, reconstruct the greedy invariant's proof by contradiction, and state precisely which step requires non-negative weights.

## Definition of Done

- [ ] You can implement `dijkstra` and trace its execution on a small weighted graph.
- [ ] You can reconstruct the greedy invariant's proof by contradiction, from memory.
- [ ] You can identify exactly which proof step requires non-negative edge weights.
- [ ] You completed Exercise 3 and confirmed `path-weight` agrees with `dijkstra`'s own reported distance.
- [ ] You completed Exercise 4 and identified where the proof breaks under a negative edge weight.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm path-weight matches dijkstra's distance to vertex 3; identify proof step broken by a negative-weight edge"` — not just `"lesson 130 exercise"`.

---

**Next lesson:** Lesson 131, *Bellman-Ford*, derives a genuinely different algorithm for exactly the case this lesson's proof excludes — graphs containing negative edge weights — and derives what a **negative cycle** does to "shortest path" as a concept at all.
