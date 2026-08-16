# Lesson 129: Shortest Paths

**What you will build**: By the end of this lesson you'll define "shortest path" precisely for a weighted graph — minimum total weight, not fewest edges — and prove directly, with a concrete counterexample, that Lesson 124's BFS answers a genuinely different question the moment edge weights vary at all.

**What you need to know first**: Lesson 124's BFS and its own distance-by-edge-count result; Lesson 123's adjacency matrix, reused here for weight lookup.

**Terms introduced in this lesson**: None new — this lesson defines "shortest path" precisely using vocabulary already built, rather than naming a new concept.

**Objects and methods used**: None new. This lesson reuses `get` (Lesson 84) and Lesson 123's weighted adjacency matrix, each already covered.

---

## Concept Unit: Total Weight, Not Edge Count

### The Problem

Lesson 124's BFS found the fewest-edges path to every reachable vertex. Once edges carry weights (Lesson 123), is "fewest edges" still the right notion of "shortest" — or does "shortest" have to mean something else entirely?

### Introduce the concept in isolation

```clojure
(defn path-weight [matrix path i total]
  (if (>= (+ i 1) (count path))
    total
    (path-weight matrix path (+ i 1) (+ total (get (get matrix (get path i)) (get path (+ i 1)))))))
```

```
user=> (path-weight [[0 10 1] [0 0 0] [0 1 0]] [0 1] 0 0)
10
user=> (path-weight [[0 10 1] [0 0 0] [0 1 0]] [0 2 1] 0 0)
2
```

`path-weight` sums the matrix weight between every consecutive pair of vertices along a given path. On a `3`-vertex graph (`0 \to 1` weight `10`; `0 \to 2` weight `1`; `2 \to 1` weight `1`): the direct path `[0, 1]` totals `10`; the two-edge path `[0, 2, 1]` totals `2` — genuinely, unambiguously *cheaper*, despite using *more* edges. **Shortest path** means minimum total weight, defined here precisely, independent of how many edges that total happens to be spread across.

### Discard the throwaway example

Not applicable — `path-weight` is a real, reusable function.

### Project Change

- **Reference Source**: `path-weight` reuses Lesson 123's weighted adjacency matrix directly, for `O(1)` weight lookup between any two consecutive path vertices.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn path-weight [matrix path i total]
  (if (>= (+ i 1) (count path))
    total
    (path-weight matrix path (+ i 1) (+ total (get (get matrix (get path i)) (get path (+ i 1)))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(>= (+ i 1) (count path))`** — the base case: once `i` is the *last* index in `path`, every consecutive pair has already been summed.
- **`(get (get matrix (get path i)) (get path (+ i 1)))`** — reappearing nested `get` (Lesson 120): looks up the weight between `path`'s `i`-th and `(i+1)`-th vertices directly, `O(1)`, exactly Lesson 123's own adjacency-matrix tradeoff.

### CS Lens

This definition makes "shortest path" a precise, checkable claim — Lesson 110's own specification-first discipline: a candidate path is genuinely shortest exactly when no other valid path from the same start to the same end has a smaller `path-weight`, a claim `path-weight` alone is enough to test.

### SE Lens

Nothing about this definition assumes weights are positive, equal, or even non-negative — it's a definition first, before any algorithm's own assumptions get added on top, exactly the order Lesson 110 insists on.

---

## Concept Unit: When BFS's Answer Is Exactly Right

### The Problem

Lesson 124's BFS never looked at weights at all — it only counted edges. Is there a specific condition under which "fewest edges" and "minimum total weight" happen to agree completely?

### Introduce the concept in isolation

If **every edge has the identical weight** — say, `1` — then a path's total weight is *exactly* its edge count, by definition: `n` edges, each weight `1`, sum to `n`. Lesson 124's own BFS result on the five-vertex graph (`0 \to 1 \to 3`, distance `2`) is, under this assumption, *simultaneously* a correct answer to "fewest edges" and "minimum total weight" — not a coincidence, but a direct consequence of every edge contributing the identical amount to both counts.

### Discard the throwaway example

Not applicable — a direct restatement of Lesson 124's own already-verified result, under this lesson's new definition.

### CS Lens

This is why BFS is correctly described, in most treatments, as "the shortest-path algorithm for unweighted graphs" — not a separate, unrelated algorithm from Dijkstra (Lesson 130, immediately next), but the *exact same problem*, solved under the specific, simplifying assumption that every edge weight is `1`.

### SE Lens

Recognizing "unweighted" as a *special case* of "weighted," rather than a wholly different problem, is what makes it obvious BFS should be replaced, not merely supplemented, the moment real weights enter — Lesson 130 doesn't solve a new problem, it generalizes this lesson's own definition to the case BFS's assumption no longer covers.

### Connection to the previous unit

The previous unit defined shortest path in general; this unit is the specific condition — uniform edge weight — under which Lesson 124's already-built algorithm happens to answer it correctly, without ever being designed to.

---

## Concept Unit: When BFS's Answer Is Wrong

### The Problem

This lesson's first unit already showed `[0, 2, 1]` (weight `2`) beats `[0, 1]` (weight `10`) by total weight. Which path would BFS itself actually report reaching vertex `1` by?

### Introduce the concept in isolation

BFS explores by edge count, layer by layer: vertex `1` is reachable from vertex `0` directly, in *one* edge — the *first* path BFS would discover, at distance `1`. The two-edge path through vertex `2` would only be discovered *after*, at distance `2` — layer `2`, strictly later than layer `1`. **BFS would report vertex `1` reached via the direct edge — the `10`-weight path — because it counts hops, never weight, and one hop always looks "closer" to BFS than two, regardless of what those hops actually cost.**

```clojure
(println "BFS-preferred path weight (fewest edges):" (path-weight [[0 10 1] [0 0 0] [0 1 0]] [0 1] 0 0))
(println "True shortest path weight:" (path-weight [[0 10 1] [0 0 0] [0 1 0]] [0 2 1] 0 0))
```

```
BFS-preferred path weight (fewest edges): 10
True shortest path weight: 2
```

A five-times-more-expensive path, confidently reported as "closest," purely because BFS's own notion of distance never had access to the one number — weight — that actually determines the right answer.

### Discard the throwaway example

Not applicable — a direct, verified demonstration using this lesson's own already-built `path-weight`.

### CS Lens

This is precisely the same failure shape as Lesson 106's `caller-b-check` and Lesson 119's `broken-dp-best`: a piece of code that is *completely correct* for the question it was actually built to answer (fewest edges), applied confidently to a *different* question (minimum weight) it was never designed for, producing a wrong answer with no error, no crash, nothing visibly amiss.

### SE Lens

This is the concrete, provable reason Lesson 130's Dijkstra's algorithm and Lesson 131's Bellman-Ford exist at all, rather than everyone simply reusing BFS everywhere: the moment weights genuinely vary, BFS's own core assumption — every edge costs the same — is violated, and its answer, while still a real, valid *path*, is no longer a *shortest* one.

### Connection to the previous unit

The previous unit showed BFS is correct under one specific assumption; this unit shows, concretely, exactly what breaks the instant that assumption is dropped — motivating every algorithm this section builds from here forward to handle weights explicitly, rather than reusing a tool built for a narrower case.

---

## Connect the Pieces

The full comparison, weights included:

```clojure
(println "Graph: 0->1 (weight 10), 0->2 (weight 1), 2->1 (weight 1)")
(println "Fewest-edges path to 1:" [0 1] "weight" (path-weight [[0 10 1] [0 0 0] [0 1 0]] [0 1] 0 0))
(println "True shortest path to 1:" [0 2 1] "weight" (path-weight [[0 10 1] [0 0 0] [0 1 0]] [0 2 1] 0 0))
```

```
Graph: 0->1 (weight 10), 0->2 (weight 1), 2->1 (weight 1)
Fewest-edges path to 1: [0 1] weight 10
True shortest path to 1: [0 2 1] weight 2
```

One graph, one clean definition (`path-weight`), and direct, numeric proof that "shortest" and "fewest edges" are the same question only under a condition (uniform weight) real graphs frequently don't satisfy.

## What Breaks Without This

Suppose a mapping application used BFS-style edge counting to recommend routes, treating "fewest road segments" as "shortest route" — exactly this lesson's own conflation. A route crossing one very long highway segment would be recommended over a route using two much shorter segments, whenever the two-segment total distance is actually less — a real, understandable, costly mistake, arising from exactly the assumption this lesson's third unit proved doesn't hold once weights (real distances, in this case) vary.

## Exercises

1. **Trace.** By hand, compute `path-weight` for a third candidate path in a graph you construct yourself, with at least three genuinely different-weight edges.
2. **Predict.** Before checking, predict whether BFS's fewest-edges answer and the true shortest-weight answer *always* disagree once weights vary, or only sometimes. Construct a weighted graph where they happen to agree despite unequal weights.
3. **Verify.** Confirm, using `path-weight`, that `[0, 2, 1]` really is the *minimum*-weight path from `0` to `1` in this lesson's own graph — check there is no third possible path to compare it against, given only three vertices and three directed edges.
4. **Break it, on purpose.** Construct a graph where the fewest-edges path and the true shortest path are the *same specific path*, purely by coincidence, then modify one edge weight slightly to break that coincidence.
5. **Generalize.** State, in one sentence each, what Lesson 130 (Dijkstra) and Lesson 131 (Bellman-Ford) will need to assume about edge weights, based on this lesson's own framing of "compare assumptions" — you do not need to derive either algorithm, only name the likely constraint each will need.
6. **Reconstruct.** Close this lesson. From memory, explain precisely why BFS is correct for unweighted graphs but not weighted ones, using this lesson's own worked counterexample.

## Definition of Done

- [ ] You can implement `path-weight` and use it to compare two candidate paths.
- [ ] You can explain why BFS's answer coincides with shortest-weight exactly when all weights are equal.
- [ ] You can construct a weighted graph where BFS's fewest-edges path is not the shortest-weight path.
- [ ] You completed Exercise 3 and confirmed no cheaper path exists in this lesson's own three-vertex graph.
- [ ] You completed Exercise 4 and constructed both a coincidental agreement and a broken one.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and constructed — for example, `"Confirm [0 2 1] is genuinely minimal in the 3-vertex example; construct a graph where BFS and shortest-weight coincidentally agree, then break the coincidence"` — not just `"lesson 129 exercise"`.

---

**Next lesson:** Lesson 130, *Dijkstra's Algorithm*, derives a genuinely correct shortest-path algorithm for weighted graphs — reusing Lesson 96's priority queue directly — under one real, necessary assumption this lesson's own framing already anticipates: every edge weight must be non-negative.
