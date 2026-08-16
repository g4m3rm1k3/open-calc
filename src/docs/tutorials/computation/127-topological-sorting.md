# Lesson 127: Topological Sorting

**What you will build**: By the end of this lesson you'll order every vertex of a DAG so that every edge points forward in the ordering — a **topological sort** — by reusing Lesson 126's finish times directly, and prove the algorithm correct using the exact parenthesis property Lesson 126 already established.

**What you need to know first**: Lesson 126's discovery/finish times, parenthesis property, and `has-cycle?`; Lesson 110's precondition discipline.

**Terms introduced in this lesson**:

- **topological sort** — an ordering of a directed acyclic graph's vertices such that for every edge `u \to v`, `u` appears before `v`. *Why it matters*: the precise formalization of "dependency order" — a build system's compile order, a course's prerequisite order, a project's task order.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), and Lesson 126's `has-cycle?`, each already covered.

---

## Concept Unit: Building Order From Finish Time

### The Problem

Lesson 126's DFS finishes vertex `4` first (time `4`), then `3`, then `1`, then `2`, then `0` last (time `9`) — every edge in this lesson's own graph points from an earlier-discovered vertex toward a later one. Does ordering vertices by finish time — specifically, *decreasing* finish time — actually produce a valid dependency order?

### Introduce the concept in isolation

```clojure
(defn reverse-vec-from [v i result]
  (if (< i 0)
    result
    (reverse-vec-from v (- i 1) (assoc result (count result) (get v i)))))

(defn reverse-vec [v]
  (reverse-vec-from v (- (count v) 1) []))

(declare topo-visit)

(defn topo-explore-step [adj state neighbors i current]
  (if (get (get state 0) (get neighbors i))
    (topo-explore adj state neighbors (+ i 1) current)
    (topo-explore adj (topo-visit adj state (get neighbors i)) neighbors (+ i 1) current)))

(defn topo-explore [adj state neighbors i current]
  (if (>= i (count neighbors))
    [(get state 0) (assoc (get state 1) (count (get state 1)) current)]
    (topo-explore-step adj state neighbors i current)))

(defn topo-visit [adj state current]
  (topo-explore adj [(assoc (get state 0) current true) (get state 1)] (get adj current) 0 current))

(defn topo-sort [adj n]
  (reverse-vec (get (topo-visit adj [(all-false n 0 []) []] 0) 1)))
```

```
user=> (topo-sort [[1 2] [3] [3] [4] []] 5)
[0 2 1 3 4]
```

`topo-visit` reuses Lesson 125's own DFS shape, appending each vertex to `order` at the exact moment it **finishes** (`topo-explore`'s base case) — producing `[4 3 1 2 0]`, vertices in *increasing* finish-time order. `reverse-vec` flips it to `[0 2 1 3 4]` — decreasing finish time. Checking every edge: `0` before `1` and `2`; `1$ before `3`; `2` before `3`; `3` before `4` — every single one points forward.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified.

### Project Change

- **Reference Source**: `topo-visit`/`topo-explore` reuse Lesson 126's `dfsx-visit`/`dfsx-explore` structure directly, recording only the finish-time *order*, not the numeric timestamps themselves.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn topo-sort [adj n]
  (reverse-vec (get (topo-visit adj [(all-false n 0 []) []] 0) 1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(assoc (get state 1) (count (get state 1)) current)`** — reappearing `assoc`-as-append (Lesson 94), triggered by `topo-explore`'s own base case — appending happens exactly once per vertex, at finish, never at discovery.
- **`reverse-vec-from`** — first appearance: walks `v` from its last index down to `0`, appending each element to a fresh result — the standard shape for reversing a vector using only `get`/`assoc`/`count`.

### CS Lens

This is the identical technique Lesson 126's own `dfsx-visit` used, reused for a third distinct purpose: Lesson 126's first unit computed numeric timestamps; its third unit tracked an `on-path` boolean; this lesson tracks *order of finishing* directly — three different pieces of information, extracted from the identical DFS traversal shape.

### SE Lens

`topo-sort`'s cost is `O(V + E)` — identical to a plain DFS (Lesson 125), since it performs exactly one, with no additional traversal or comparison-based sorting step required at all — the finish-time order *is* the sort, requiring no separate comparison logic.

---

## Concept Unit: Why Decreasing Finish Time Is Always Correct

### The Problem

Lesson 126's example happened to produce a valid order. Is this a guaranteed property of every DAG, or did this lesson's own graph just happen to cooperate?

### Introduce the concept in isolation

**Claim**: for every edge `u \to v` in a DAG, `\text{fin}(u) > \text{fin}(v)`.

**Proof**, by cases on when `v` is discovered relative to `u`:

- **`v` is discovered *during* the exploration of `u`** (reached via this exact edge, or already an active descendant): `u`'s own `dfsx-explore` call cannot reach its base case — cannot finish — until every neighbor's own exploration, including `v`'s entire subtree, has returned. `v` must finish strictly before `u` does.
- **`v` was already fully finished *before* `u` was even discovered**: `\text{fin}(v)` was already fixed, earlier than `\text{disc}(u)$, which is itself earlier than `\text{fin}(u)$ — so `\text{fin}(v) < \text{fin}(u)$ still holds.
- **`v` is a currently-active ancestor of `u`**: this would make `u \to v` a **back edge** (Lesson 126) — meaning the graph has a cycle, contradicting this algorithm's own precondition (a DAG). This case cannot occur.

Every remaining case gives `\text{fin}(u) > \text{fin}(v)$ — so sorting by *decreasing* finish time always places `u` before `v`, for every edge, unconditionally. ∎

### Discard the throwaway example

Not applicable — a formal proof about already-established code, not new code.

### Mechanical walkthrough — how the proof works, step by step

1. **Case split on relative discovery** — reappearing proof by cases (Lesson 17): every possible relationship between `u` and `v`'s discovery is covered, exhaustively.
2. **The nested case uses the parenthesis property directly** — reappearing (Lesson 126): `v`'s interval nested inside `u`'s forces `\text{fin}(v) < \text{fin}(u)` by definition of nesting.
3. **The disjoint case uses simple ordering** — `v` finished before `u` was even discovered, so trivially before `u` finishes too.
4. **The ancestor case is ruled out by precondition** — reappearing (Lesson 110): this is exactly why `topo-sort` requires `has-cycle?` to be `false` first — the proof's third case simply doesn't exist in a DAG.

### CS Lens

This proof leans on Lesson 126's parenthesis property directly — not as a passing reference, but as the load-bearing fact in its second case: without knowing intervals nest or stay disjoint, "which finishes first" would have no guaranteed relationship to "which was an ancestor" at all.

### SE Lens

`topo-sort`'s correctness is *conditional* on its input being acyclic — calling it on a graph containing a cycle produces some order, but not a meaningful one, since this proof's third case is exactly what a cycle violates. Lesson 110's own precondition discipline applies directly: `has-cycle?` (Lesson 126) should be checked *before* trusting `topo-sort`'s result, not after.

### Connection to the previous unit

The previous unit built and verified the algorithm on one example; this unit proves it correct for every DAG, using the exact structural property (Lesson 126's parenthesis nesting) that made the previous unit's one example work out.

---

## Connect the Pieces

The full pipeline, precondition checked first:

```clojure
(println "Has a cycle?" (has-cycle? [[1 2] [3] [3] [4] []] 5))
(println "Topological order:" (topo-sort [[1 2] [3] [3] [4] []] 5))
```

```
Has a cycle? false
Topological order: [0 2 1 3 4]
```

The precondition confirmed first, exactly as Lesson 110's own discipline requires, before trusting the ordering this lesson's proof guarantees.

## What Breaks Without This

Suppose `topo-sort` were run without first checking `has-cycle?`, on a graph containing a genuine cycle — Lesson 126's own three-vertex example, `0 \to 1 \to 2 \to 0`:

```
user=> (topo-sort [[1] [2] [0]] 3)
```

Some order comes back — `topo-sort` never crashes, since every vertex still gets discovered and finished eventually — but this lesson's own proof's third case, ruled out only by the acyclic precondition, is exactly what's been violated: there's no meaningful "before" and "after" for a cycle's own vertices, since each one genuinely depends on the others circularly. The returned order would place *some* vertex before another that actually depends on it, silently, with nothing about `topo-sort` itself signaling anything went wrong — exactly why checking `has-cycle?` first isn't optional caution, it's the one fact this entire lesson's correctness proof actually depends on.

## Exercises

1. **Trace.** By hand, confirm `(topo-sort [[1 2] [3] [3] [4] []] 5)`'s own intermediate `order` (before reversal) is `[4 3 1 2 0]`, matching Lesson 126's own finish-time sequence.
2. **Predict.** Before checking, predict a valid topological order for `[[1] [2] [] []]` (vertex `0 \to 1 \to 2`, vertex `3` isolated). Verify by tracing.
3. **Verify.** For every edge in this lesson's own graph, confirm directly, using Lesson 126's own computed finish times (`[9 6 8 5 4]`), that the source's finish time exceeds the destination's.
4. **Break it, on purpose.** Run `topo-sort` on Lesson 126's `3`-cycle and observe that it still returns *some* order — confirm, using the graph's own edges, that this order fails to respect at least one edge.
5. **Generalize.** Explain, in one sentence, why a graph with *multiple* valid topological orders (this lesson's own graph has several) doesn't contradict this lesson's proof — the proof only claims decreasing finish time is *one* valid order, never the unique one.
6. **Reconstruct.** Close this lesson. From memory, reconstruct this lesson's three-case proof, and explain precisely which case a cycle would violate.

## Definition of Done

- [ ] You can implement `topo-sort` and explain why it appends to `order` at finish time, not discovery time.
- [ ] You can reconstruct the three-case proof that decreasing finish time is always a valid order.
- [ ] You can explain why `has-cycle?` must be checked before trusting `topo-sort`'s result.
- [ ] You completed Exercise 3 and confirmed the finish-time ordering claim directly on every edge.
- [ ] You completed Exercise 4 and demonstrated `topo-sort`'s meaningless output on a cyclic graph.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and demonstrated — for example, `"Confirm fin(u) > fin(v) for every edge in the 5-vertex DAG; demonstrate topo-sort producing an order that violates an edge on Lesson 126's 3-cycle"` — not just `"lesson 127 exercise"`.

---

**Next lesson:** Lesson 128, *Connected Components*, returns to undirected graphs, deriving how repeated traversals from unvisited vertices partition an entire graph into its separate, connected pieces.
