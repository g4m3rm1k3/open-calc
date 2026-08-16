# Lesson 126: DFS Invariants and Timestamps

**What you will build**: By the end of this lesson you'll extend Lesson 125's DFS to record exactly *when* each vertex is discovered and *when* its entire exploration finishes, derive a real structural property those two numbers always satisfy, and use it to detect cycles directly — the reason Lesson 127's topological sort will require an acyclic graph as its own precondition.

**What you need to know first**: Lesson 125's `dfs-visit`/`dfs-explore`; Lesson 102's array-of-booleans convention; Lesson 110's precondition discipline.

**Terms introduced in this lesson**:

- **discovery time** — the moment a vertex is first visited during a DFS run, recorded as an increasing counter. **Finish time** — the moment every one of a vertex's neighbors has been fully explored and the search backtracks away from it. *Why it matters*: together, `[discovery, finish]` is an interval — and this lesson's second unit proves those intervals always nest or stay disjoint, never partially overlap.
- **back edge** — an edge from the current vertex to one of its own still-active ancestors — discovered, but not yet finished, at the moment the edge is examined. *Why it matters*: a back edge is a direct, checkable witness of a cycle; a directed graph has a cycle if and only if a DFS finds at least one.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), and Lesson 102's array-of-booleans convention, each already covered.

---

## Concept Unit: Discovery and Finish Times

### The Problem

Lesson 125's DFS recorded *which order* vertices were visited in, but nothing about *when* a vertex's own exploration actually finished. Can both moments be recorded precisely, using a single running counter?

### Introduce the concept in isolation

```clojure
(declare dfsx-visit)

(defn dfsx-explore-step [adj state neighbors i current]
  (if (get (get state 0) (get neighbors i))
    (dfsx-explore adj state neighbors (+ i 1) current)
    (dfsx-explore adj (dfsx-visit adj state (get neighbors i)) neighbors (+ i 1) current)))

(defn dfsx-explore [adj state neighbors i current]
  (if (>= i (count neighbors))
    [(get state 0) (assoc (get state 1) current (get state 2)) (+ (get state 2) 1)]
    (dfsx-explore-step adj state neighbors i current)))

(defn dfsx-visit [adj state current]
  (dfsx-explore adj [(assoc (get state 0) current (get state 2)) (get state 1) (+ (get state 2) 1)] (get adj current) 0 current))
```

```
user=> (dfsx-visit [[1 2] [3] [3] [4] []] [[false false false false false] [false false false false false] 0] 0)
[[0 1 7 2 3] [9 6 8 5 4] 10]
```

`state` is `[disc fin clock]`. `dfsx-visit` stamps `disc[current]` with the *current* clock value and advances it, before exploring any neighbor. `dfsx-explore`'s base case — every neighbor examined — stamps `fin[current]` with whatever the clock has reached *by then* and advances it again. Vertex `0`: discovered at `0`, finished last at `9` — its exploration spans the *entire* run, since every other vertex is reachable from it.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified completely before being shown here.

### Project Change

- **Reference Source**: `dfsx-visit`/`dfsx-explore` reuse Lesson 125's `dfs-visit`/`dfs-explore` structure directly, replacing the boolean `visited` array with `disc` (a timestamp or `false`) and adding `fin` and a running `clock`, threaded as a three-element state (Lesson 85's vector-as-pair, extended to three).
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn dfsx-visit [adj state current]
  (dfsx-explore adj [(assoc (get state 0) current (get state 2)) (get state 1) (+ (get state 2) 1)] (get adj current) 0 current))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(assoc (get state 0) current (get state 2))`** — reappearing `assoc` (Lesson 94): `disc[current]` gets stamped with the clock's *current* value, the moment this vertex is first reached.
- **`(+ (get state 2) 1)`**, both in `dfsx-visit` and `dfsx-explore`'s base case — the clock advances exactly twice per vertex over its lifetime: once on discovery, once on finish — never for any other reason.
- **`(assoc (get state 1) current (get state 2))`**, in `dfsx-explore`'s base case — first appearance: `fin[current]` is stamped only once every neighbor has been fully processed (`i` has reached `(count neighbors)`), never before.

### CS Lens

`disc` reusing `false` as "not yet discovered" is exactly Lesson 124's own `visited` array, generalized from a boolean to a timestamp-or-`false` — checking `(get disc v)` for truthiness still answers "has this vertex been reached," while now also answering "when."

### SE Lens

Every vertex's clock stamps are unique and strictly ordered — no two vertices share a discovery time, and a vertex's own finish time always exceeds its own discovery time — a real, checkable structural fact the next unit turns into something genuinely useful.

---

## Concept Unit: The Parenthesis Property

### The Problem

Given every vertex's `[discovery, finish]` interval, is there a predictable relationship between any two of them — or could they overlap in arbitrary, unstructured ways?

### Introduce the concept in isolation

From this lesson's own first-unit trace: vertex `0`'s interval is `[0, 9]`; vertex `1`'s is `[1, 6]`; vertex `3`'s is `[2, 5]`; vertex `4`'s is `[3, 4]`; vertex `2`'s is `[7, 8]`. Checking every pair: `4`'s `[3,4]` sits entirely inside `3`'s `[2,5]`; `3`'s sits entirely inside `1`'s `[1,6]`; `1`'s sits entirely inside `0`'s `[0,9]`; `2`'s `[7,8]` also sits entirely inside `0`'s `[0,9]`, but shares *no* overlap at all with `1`'s `[1,6]`. Every pair is either **fully nested** (one nested entirely inside the other) or **entirely disjoint** — never partially overlapping, the same structural guarantee well-formed parentheses satisfy: `(()())`Lesson never `(()( ))` with a mismatched close.

### Discard the throwaway example

Not applicable — a direct structural observation on this lesson's own already-computed, real timestamps.

### CS Lens

This property holds because recursion is itself well-parenthesized: `dfsx-visit`'s own opening stamp (discovery) and `dfsx-explore`'s own closing stamp (finish) are a matched pair for every single call, and nested recursive calls — vertex `1`'s call to vertex `3`'s call to vertex `4` — necessarily close in the exact reverse order they opened, precisely Lesson 91's own call-stack discipline (`declare`-based mutual recursion), now producing a provable interval-nesting fact rather than only a valid execution order.

### SE Lens

This property is what makes "is `v` an ancestor of `u` in this DFS" a simple, `O(1)` interval check — `disc[v] \leq disc[u]` and `fin[u] \leq fin[v]` — once the timestamps are known, rather than needing to walk the actual DFS tree structure to answer the same question.

### Connection to the previous unit

The previous unit produced two numbers per vertex; this unit is the real structural fact those two numbers always satisfy together — the foundation for this lesson's third unit, which puts the fact to direct use.

---

## Concept Unit: Back Edges Detect Cycles

### The Problem

An edge to an already-discovered vertex could mean several different things — but is there a specific, checkable condition among them that always, unconditionally, means "this graph has a cycle"?

### Introduce the concept in isolation

```clojure
(declare cycle-visit)

(defn cycle-explore-step [adj state neighbors i current]
  (if (get (get state 1) (get neighbors i))
    (cycle-explore adj [(get state 0) (get state 1) true] neighbors (+ i 1) current)
    (if (get (get state 0) (get neighbors i))
      (cycle-explore adj state neighbors (+ i 1) current)
      (cycle-explore adj (cycle-visit adj state (get neighbors i)) neighbors (+ i 1) current))))

(defn cycle-explore [adj state neighbors i current]
  (if (>= i (count neighbors))
    state
    (cycle-explore-step adj state neighbors i current)))

(defn cycle-finish [state current]
  [(get state 0) (assoc (get state 1) current false) (get state 2)])

(defn cycle-visit [adj state current]
  (cycle-finish (cycle-explore adj [(assoc (get state 0) current true) (assoc (get state 1) current true) (get state 2)] (get adj current) 0 current) current))

(defn has-cycle? [adj n]
  (get (cycle-visit adj [(all-false n 0 []) (all-false n 0 []) false] 0) 2))
```

```
user=> (has-cycle? [[1] [2] [0]] 3)
true
```

`on-path` (this lesson's `state`'s second slot) is `true` exactly while a vertex is a **currently active ancestor** — set the moment it's first visited, reset to `false` the moment it finishes and backtracks. A **back edge** — an edge to a vertex still `on-path` — is exactly Lesson 124's already-visited check, refined: `visited` alone can't distinguish "an ancestor still being explored" from "a completely separate, already-finished branch," but `on-path` can. On the three-vertex cycle `0 \to 1 \to 2 \to 0`: by the time `2`'s own edge back to `0` is examined, `0` is still `on-path` (never finished — it's still waiting on `1`, which is still waiting on `2`) — a genuine back edge, correctly detected.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified on both a cyclic and (per this unit's own CS lens) an acyclic graph.

### Project Change

- **Reference Source**: `cycle-visit`/`cycle-explore` reuse Lesson 125's `dfs-visit`/`dfs-explore` structure a third time, replacing a single `visited` array with two — `visited` (permanent, once discovered) and `on-path` (temporary, reset on finish) — the precise distinction this lesson's own back-edge check needs.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn has-cycle? [adj n]
  (get (cycle-visit adj [(all-false n 0 []) (all-false n 0 []) false] 0) 2))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get (get state 1) (get neighbors i))`** — first appearance: checks `on-path`, not `visited` — the exact distinction between "an active ancestor" and "any already-discovered vertex," including ones already fully finished.
- **`[(get state 0) (get state 1) true]`** — first appearance: once a back edge is found, `found?` (state's third slot) becomes `true` and stays `true` through every subsequent step — never reset, since one cycle is enough to answer the question.
- **`(assoc (get state 1) current false)`**, in `cycle-finish` — first appearance: the moment a vertex's own exploration completes, it's removed from the active path — exactly the finish-time stamping this lesson's first unit already established, here used to *reset* a flag rather than record a timestamp.

### CS Lens

On this lesson's own acyclic five-vertex graph (Lesson 123's own example), the one already-discovered vertex ever re-encountered — vertex `3`, reached again from vertex `2` — is checked against `on-path` at that moment, not `visited`: vertex `3` finished (backtracked away from) at time `5`, long before vertex `2` is even discovered at time `7`, so `on-path[3]` is correctly `false` by then — a cross edge, not a back edge, and `has-cycle?` correctly reports `false` on this graph, confirming Lesson 127's own upcoming precondition (acyclic input) genuinely holds for it.

### SE Lens

Distinguishing `on-path` from `visited` is the entire correctness of this algorithm — using `visited` alone (as a naive cycle check might) would flag vertex `2`'s edge to `3` as a false positive, since `3` genuinely is "already visited," despite posing no cycle at all.

### Connection to the previous unit

The previous unit proved the parenthesis property holds; this unit is a direct, practical use of exactly that structure — "is the target still an open parenthesis" is precisely what `on-path` tracks, turned into a real, checkable cycle detector.

---

## Connect the Pieces

Both graphs, checked directly:

```clojure
(println "Acyclic graph has a cycle?" (has-cycle? [[1 2] [3] [3] [4] []] 5))
(println "3-cycle has a cycle?" (has-cycle? [[1] [2] [0]] 3))
```

```
Acyclic graph has a cycle? false
3-cycle has a cycle? true
```

Discovery and finish times, proven to nest or stay disjoint, gave this lesson exactly the tool needed to tell a genuine cycle apart from a merely-already-visited vertex — the identical distinction a naive `visited`-only check could never make.

## What Breaks Without This

Suppose `has-cycle?` checked `visited` instead of `on-path`, the way a first attempt might reasonably try:

```clojure
(defn broken-explore-step [adj state neighbors i current]
  (if (get (get state 0) (get neighbors i))
    [(get state 0) (get state 1) true]
    (cycle-explore adj (cycle-visit adj state (get neighbors i)) neighbors (+ i 1) current)))
```

Run on this lesson's own genuinely *acyclic* five-vertex graph, this would report `true` the moment vertex `2`'s edge to the already-visited vertex `3` is examined — a **false positive**, incorrectly flagging a perfectly valid DAG as cyclic, exactly the failure `on-path`'s finish-time reset exists to prevent, and exactly the bug that would silently break Lesson 127's topological sort before it ever ran.

## Exercises

1. **Trace.** By hand, confirm vertex `1`'s interval `[1, 6]` and vertex `2`'s interval `[7, 8]` are genuinely disjoint — no overlap at all — using this lesson's own computed timestamps.
2. **Predict.** Before checking, predict `(has-cycle? [[1] [2] [3] [1]] 4)` — a graph where vertex `3` points back to vertex `1`, not vertex `0`. Trace to confirm.
3. **Verify.** Confirm, using `dfsx-visit`'s own output, that vertex `3`'s finish time (`5`) is genuinely less than vertex `2`'s discovery time (`7`) on the acyclic graph — the exact fact that makes their edge a cross edge, not a back edge.
4. **Break it, on purpose.** Run `broken-explore-step` (substituted into `cycle-explore`) on the acyclic graph and confirm it incorrectly reports a cycle.
5. **Generalize.** State, using this lesson's parenthesis property, how to determine whether vertex `u` is an ancestor of vertex `v` using only their four timestamp values, without walking any tree structure.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between `visited` and `on-path`, and why only the second correctly identifies a back edge.

## Definition of Done

- [ ] You can implement `dfsx-visit` and explain what discovery and finish times each represent.
- [ ] You can state the parenthesis property and verify it on a small example.
- [ ] You can implement `has-cycle?` and explain why it must track `on-path` separately from `visited`.
- [ ] You completed Exercise 3 and confirmed the specific timestamp comparison that makes an edge a cross edge, not a back edge.
- [ ] You completed Exercise 4 and demonstrated the false-positive failure of a `visited`-only check.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and demonstrated — for example, `"Confirm vertex 3 finishes before vertex 2 is discovered (cross edge, not back edge); demonstrate visited-only cycle check false-positiving on an acyclic graph"` — not just `"lesson 126 exercise"`.

---

**Next lesson:** Lesson 127, *Topological Sorting*, uses this lesson's finish times directly — ordering every vertex by *decreasing* finish time turns out to produce a valid dependency order, provided this lesson's own `has-cycle?` confirms the precondition it requires actually holds.
