# Lesson 135: Matching

**What you will build**: By the end of this lesson you'll take a matching problem — pairing elements from two groups as extensively as possible — and prove it's secretly a flow network in disguise, converting a real matching directly into a flow assignment and verifying it valid using Lesson 134's own `is-valid-flow?`, unmodified.

**What you need to know first**: Lesson 134's flow networks, conservation, and `is-valid-flow?`; Lesson 123's `build-matrix`.

**Terms introduced in this lesson**:

- **bipartite matching** — given two groups of vertices and a set of edges connecting them (never within a group), a **matching** is a subset of those edges where no vertex appears more than once. *Why it matters*: "pair workers with jobs," "pair students with schools," "pair applicants with positions" — a genuinely common real-world shape, distinct from every graph problem this section has built so far.

**Objects and methods used**: None new. This lesson reuses `build-matrix` (Lesson 123) and Lesson 134's `is-valid-flow?`, each already covered.

---

## Concept Unit: A Matching, Found by Reasoning

### The Problem

Three vertices in one group (`0, 1, 2`), three in another (`3, 4, 5`), with compatibility edges `0\text{-}3`, `0\text{-}4`, `1\text{-}4`, `2\text{-}4`, `2\text{-}5` — no vertex may appear in more than one chosen pair. Can every vertex be matched, or does the shared dependency on vertex `4` (compatible with `0`, `1`, *and* `2`) force someone out?

### Introduce the concept in isolation

Vertex `1`'s *only* compatible partner is `4` — so any matching using every vertex must pair `1` with `4`. That forces `4` unavailable to `0` and `2`. `0`'s only remaining option is `3`; `2`'s only remaining option is `5`. The matching `\{0\text{-}3, 1\text{-}4, 2\text{-}5\}` — size `3` — pairs every single vertex, a **perfect matching**, the largest possible given only `3` vertices per side.

### Discard the throwaway example

Not applicable — a direct reasoning argument, not new code.

### CS Lens

Vertex `1`'s single compatible option forcing the *entire* rest of the matching is a small instance of a real structural fact matching problems share with Lesson 117's greedy failures — a locally forced choice can cascade into consequences far beyond the one vertex it directly involves, exactly the kind of interaction that makes matching a genuine combinatorial optimization problem, not a per-vertex independent choice.

### SE Lens

Finding this matching by direct reasoning worked because the example is small and has an unusually constrained vertex (`1`) to anchor the argument — real matching problems, with many vertices and no single forced choice, need a systematic algorithm, exactly what this lesson's next unit reduces to a problem this series has already solved.

---

## Concept Unit: The Same Matching, as a Flow

### The Problem

Can this exact matching be re-expressed as a flow network — source, sink, capacities — and checked valid using Lesson 134's own already-built `is-valid-flow?`, with no modification to that function at all?

### Introduce the concept in isolation

Add a **source** (vertex `6`) connected to every group-`A` vertex (`0, 1, 2`), capacity `1` each — "each worker available once." Add a **sink** (vertex `7`), with every group-`B` vertex (`3, 4, 5`) connected to it, capacity `1` each — "each job fillable once." Every original compatibility edge gets capacity `1`.

```clojure
(def capacity (build-matrix 8 [[6 0 1] [6 1 1] [6 2 1] [0 3 1] [0 4 1] [1 4 1] [2 4 1] [2 5 1] [3 7 1] [4 7 1] [5 7 1]]))
(def flow (build-matrix 8 [[6 0 1] [6 1 1] [6 2 1] [0 3 1] [1 4 1] [2 5 1] [3 7 1] [4 7 1] [5 7 1]]))
```

```
user=> (is-valid-flow? capacity flow 6 7 8)
true
```

`flow` includes only the matching's own three edges (`0\text{-}3`, `1\text{-}4`, `2\text{-}5`), plus the source/sink edges *for exactly the vertices actually used*. Every matched vertex sees one unit in, one unit out — conservation, checked by the identical `is-valid-flow?` from Lesson 134, unchanged. `0\text{-}4$, `2\text{-}4$ — edges that exist in `capacity` but weren't part of this matching — simply carry `0` flow, correctly excluded.

### Discard the throwaway example

Not applicable — `capacity` and `flow` are real, hand-verified matrices, and `is-valid-flow?`'s `true` result is genuine, checked, not assumed.

### Project Change

- **Reference Source**: `capacity`/`flow` both reuse Lesson 123's `build-matrix` directly; `is-valid-flow?` reused entirely unchanged from Lesson 134 — no new function required to check this genuinely different-looking problem at all.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def flow (build-matrix 8 [[6 0 1] [6 1 1] [6 2 1] [0 3 1] [1 4 1] [2 5 1] [3 7 1] [4 7 1] [5 7 1]]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[6 0 1]`, `[6 1 1]`, `[6 2 1]`** — reappearing `build-matrix` edge triples (Lesson 123): the source sending exactly one unit to each *matched* group-`A` vertex.
- **`[0 3 1]`, `[1 4 1]`, `[2 5 1]`** — the matching's own three edges, each carrying exactly one unit — the *only* group-`A`-to-group-`B` edges present in `flow` at all, despite `capacity` allowing more.
- **`[3 7 1]`, `[4 7 1]`, `[5 7 1]`** — every matched group-`B` vertex sending its one unit onward to the sink, completing conservation at each of them.

### CS Lens

Every unit of flow, source to sink, traces exactly one matched pair — `6 \to 0 \to 3 \to 7`, `6 \to 1 \to 4 \to 7$, `6 \to 2 \to 5 \to 7$ — three separate source-to-sink journeys, each one *is* one matched pair, made structurally impossible to double-count: capacity `1` on every source and sink edge means no vertex can carry more than one unit, exactly matching's own "used at most once" requirement.

### SE Lens

Nothing about `is-valid-flow?` needed to know it was checking a matching rather than a literal transportation network — the identical function, unmodified, correctly validates both, because the actual mathematical structure (conservation, capacity) is genuinely the same problem underneath two different-sounding descriptions.

### Connection to the previous unit

The previous unit found a matching by direct reasoning; this unit re-expresses that identical matching as a flow, checked valid by code that has never heard the word "matching" at all.

---

## Concept Unit: Why the Connection Is Exact, Not Just Analogous

### The Problem

Is this reduction merely a cute reformulation, or does it genuinely mean "maximum matching" and "maximum flow" are the *same* problem, provably?

### Introduce the concept in isolation

Every unit-capacity source-to-sink path in this construction passes through exactly one group-`A` vertex and one group-`B` vertex (the network's own shape forces this — there's no other way through). A **maximum flow** in this network — the largest total units source to sink achievable at all — therefore corresponds *exactly* to the **maximum matching**: each unit of flow is one matched pair, and the flow value (total units) equals the matching size, always, for any bipartite graph converted this exact way. Finding the actual maximum (not merely checking one candidate, this lesson's own honest scope) is real, additional work — the same max-flow-finding algorithm Lesson 134 named but didn't derive, now doing double duty for a problem that doesn't look like a flow problem on its own terms at all.

### Discard the throwaway example

Not applicable — this unit states the general correspondence this lesson's own worked example already demonstrated concretely.

### CS Lens

This is **combinatorial optimization**'s own recurring pattern, named directly by this lesson's own BRD-level goal: many problems that look structurally unrelated on the surface — scheduling, matching, routing — turn out to be the identical underlying optimization once translated into a shared model (here, flow), the same transfer-recognition skill Lesson 96's own closing survey (priority queues) and Lesson 122's interval problems both already practiced.

### SE Lens

Recognizing "this is secretly a flow problem" is worth real engineering effort precisely because it means an already-solved, already-optimized algorithm (max-flow, however it's eventually implemented) can be reused directly, rather than inventing and separately trusting a brand-new algorithm for what only *looks* like a new problem.

### Connection to the previous unit

The previous unit verified one matching-as-flow example works; this unit is why that success generalizes to *every* bipartite matching problem, not merely a coincidence of this lesson's own small graph.

---

## Connect the Pieces

The matching, the flow, and the equivalence, together:

```clojure
(println "Matching:" [[0 3] [1 4] [2 5]] "size 3")
(println "Equivalent flow, valid?" (is-valid-flow? capacity flow 6 7 8))
(println "Flow value (source outflow):" (+ (get (get flow 6) 0) (get (get flow 6) 1) (get (get flow 6) 2)))
```

```
Matching: [[0 3] [1 4] [2 5]] size 3
Equivalent flow, valid? true
Flow value (source outflow): 3
```

The matching's own size and the flow's own value are the identical number, `3`, not by coincidence — by the exact structural correspondence this lesson's third unit proved holds for every such construction.

## What Breaks Without This

Suppose someone tried to *directly* check whether a proposed matching was valid — no vertex reused — by writing an entirely new, matching-specific checker from scratch, rather than recognizing the flow reduction. That checker would need its own careful correctness argument, its own tests, its own chance to contain a subtle bug — real, duplicated effort for a problem this lesson proved is already solved. Worse, a team maintaining both a matching checker and a flow checker, unaware they're the identical underlying logic, risks the two silently drifting apart — one gets updated or fixed, the other doesn't — exactly the kind of hidden, costly redundancy recognizing a genuine reduction prevents entirely.

## Exercises

1. **Trace.** By hand, confirm `flow-in`/`flow-out` (Lesson 134) balance at vertex `4` in this lesson's own flow — `1` unit in (from vertex `1`), `1` unit out (to the sink).
2. **Predict.** Before checking, predict whether a flow using edge `0\text{-}4` instead of `0\text{-}3` (with `1` still matched to `4`) could be valid simultaneously — both `0` and `1` sending flow into `4`. Explain why capacity alone rules this out.
3. **Verify.** Confirm this lesson's `flow` matrix has total outflow from the source exactly equal to total inflow to the sink, both `3`, using Lesson 134's own `flow-out`/`flow-in`.
4. **Break it, on purpose.** Construct a `flow` matrix attempting to match vertex `2` to *both* `4` and `5` simultaneously (capacity `1` each, `1` unit on each edge), and confirm `is-valid-flow?` reports `false` — identify which vertex's conservation actually fails.
5. **Generalize.** Describe, without building it, how this lesson's reduction would need to change for a matching problem where each group-`A` vertex could be matched to *up to two* group-`B` vertices, rather than exactly one.
6. **Reconstruct.** Close this lesson. From memory, explain why a maximum flow in this lesson's own network construction always equals a maximum matching, using the "one path, one pair" argument directly.

## Definition of Done

- [ ] You can convert a bipartite matching into an equivalent flow network by hand.
- [ ] You can verify a matching-as-flow using Lesson 134's `is-valid-flow?` unmodified.
- [ ] You can explain why maximum flow and maximum matching are the same problem in this construction, not merely similar.
- [ ] You completed Exercise 3 and confirmed source-outflow equals sink-inflow for this lesson's own matching.
- [ ] You completed Exercise 4 and identified exactly which vertex's conservation fails under a double-match attempt.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm source/sink flow both equal 3; identify vertex 4's conservation failure under an attempted double-match"` — not just `"lesson 135 exercise"`.

---

**Next lesson:** Lesson 136, *Constraint Satisfaction*, generalizes far beyond graphs entirely — framing a problem as variables, their possible values, and constraints between them — a model general enough to describe matching, scheduling, and puzzles alike, using one shared vocabulary.
