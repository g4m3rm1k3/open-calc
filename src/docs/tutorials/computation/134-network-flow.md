# Lesson 134: Network Flow

**What you will build**: By the end of this lesson you'll define a flow network precisely — capacities on every edge, and a conservation requirement at every intermediate vertex — and build a real checker confirming whether a candidate flow assignment is valid, the exact same specification-first discipline Lesson 110 established, applied here to a genuinely new kind of problem.

**What you need to know first**: Lesson 123's weighted adjacency matrix, reused here for edge capacities; Lesson 16's invariants and Lesson 1's own bank-account conservation, for direct comparison; Lesson 110's specification-checking discipline.

**Terms introduced in this lesson**:

- **flow network** — a directed graph where every edge carries a **capacity** — the maximum amount that can flow across it — together with one designated **source** vertex and one **sink** vertex. *Why it matters*: a genuinely different kind of graph problem from every one this section has built so far — not "how do I get from here to there," but "how much can move through this system at once."
- **conservation** — the requirement that, at every vertex except the source and sink, total flow *in* equals total flow *out*. *Why it matters*: nothing is created or destroyed anywhere except at the two designated endpoints — the graph-theoretic version of Lesson 1's own bank-account balance, which never gained or lost money except through deliberate transactions.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: Capacities and a Candidate Flow

### The Problem

A flow network's edges don't carry a fixed weight the way Lesson 123's weighted graphs did — they carry a *limit*, an upper bound on how much can pass through. What does an actual, specific flow assignment — a real number of units moving across each edge — look like, and how is it distinguished from the network's own capacities?

### Introduce the concept in isolation

```clojure
(defn capacity-ok? [capacity flow u v]
  (<= (get (get flow u) v) (get (get capacity u) v)))

(defn all-capacity-ok? [capacity flow u v n]
  (if (>= u n)
    true
    (if (>= v n)
      (all-capacity-ok? capacity flow (+ u 1) 0 n)
      (if (capacity-ok? capacity flow u v)
        (all-capacity-ok? capacity flow u (+ v 1) n)
        false))))
```

```
user=> (all-capacity-ok? [[0 3 2 0] [0 0 1 2] [0 0 0 3] [0 0 0 0]] [[0 2 2 0] [0 0 0 2] [0 0 0 2] [0 0 0 0]] 0 0 4)
true
```

Two separate matrices, both Lesson 123's own representation: `capacity` (the network's fixed limits) and `flow` (a specific candidate assignment). `all-capacity-ok?` checks every single edge, confirming `flow[u][v] \leq \text{capacity}[u][v]` everywhere — here, every edge respects its limit, some exactly at capacity (`0 \to 2`, `1 \to 3$, both flowing their full `2`).

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified on every edge.

### Project Change

- **Reference Source**: `capacity`/`flow` both reuse Lesson 123's own weighted adjacency matrix representation directly, applied here as two parallel matrices over the identical vertex set.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn capacity-ok? [capacity flow u v]
  (<= (get (get flow u) v) (get (get capacity u) v)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(<= (get (get flow u) v) (get (get capacity u) v))`** — first appearance: the one condition every single edge in the network must satisfy, checked here directly rather than only described.
- **`(if (>= v n) (all-capacity-ok? capacity flow (+ u 1) 0 n) ...)`** — first appearance of this specific nested-scan shape: once one row (`u`'s own outgoing edges) is fully checked, move to the next row, resetting the inner counter — the standard shape for scanning an entire `n \times n` matrix.

### CS Lens

A capacity constraint is a **precondition** on a flow assignment in exactly Lesson 110's own sense — not a claim about what the flow *achieves*, only about what it's allowed to be, checkable before conservation (this lesson's next concern) is even considered.

### SE Lens

Checking capacity and conservation as two entirely *separate* functions, rather than one tangled check, is Lesson 17's own proof-by-cases discipline applied to code structure: two genuinely different conditions, checked independently, are each easier to get right — and easier to verify — than one function trying to confirm both at once.

---

## Concept Unit: Conservation — Lesson 1's Invariant, Generalized

### The Problem

A capacity-respecting flow could still be nonsensical — inventing units of flow out of nowhere at some vertex, or losing them. What has to be true at every *intermediate* vertex for a flow assignment to actually make physical sense?

### Introduce the concept in isolation

```clojure
(defn flow-in [flow v u total n]
  (if (>= u n)
    total
    (flow-in flow v (+ u 1) (+ total (get (get flow u) v)) n)))

(defn flow-out [flow v u total n]
  (if (>= u n)
    total
    (flow-out flow v (+ u 1) (+ total (get (get flow v) u)) n)))

(defn conserved? [flow v n]
  (= (flow-in flow v 0 0 n) (flow-out flow v 0 0 n)))
```

```
user=> (conserved? [[0 2 2 0] [0 0 0 2] [0 0 0 2] [0 0 0 0]] 1 4)
true
```

`flow-in` sums every edge pointing *into* `v`; `flow-out` sums every edge pointing *out of* `v`. For vertex `1` in this lesson's own network: in `= 2` (from `0`), out `= 2` (to `3`) — balanced. **Conservation**, generalized directly from Lesson 1's own bank-account invariant: nothing accumulates and nothing vanishes at any vertex except the two designated endpoints — the *sum* in must equal the *sum* out, exactly Lesson 16's own state-invariant framing, now checked over a graph's own structure rather than a single running balance.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified.

### Project Change

- **Reference Source**: `conserved?` is a direct generalization of Lesson 1's own bank-account balance invariant — there, one running number had to stay non-negative across transactions; here, two *sums* (in and out) must stay equal at every vertex, across an entire flow assignment.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn conserved? [flow v n]
  (= (flow-in flow v 0 0 n) (flow-out flow v 0 0 n)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get (get flow u) v)`, in `flow-in`** — reads column `v` across every row `u` — every edge that could possibly point *at* `v`.
- **`(get (get flow v) u)`, in `flow-out`** — reads row `v` across every column `u` — every edge `v` itself sends *out*.
- **`(= (flow-in ...) (flow-out ...))`** — reappearing equality (Lesson 2): the single condition this entire unit exists to check, stated directly.

### CS Lens

This is Lesson 16's loop invariant, restructured: rather than "true before, preserved by each step, true after" for a *sequence* of operations, conservation is "true at every vertex, simultaneously, for a *static* assignment" — the identical demand for an unbroken guarantee, checked over a graph's structure instead of a timeline.

### SE Lens

`conserved?` correctly excludes the source and sink from its own requirement (checked by the calling code, not this function itself) — the entire *point* of a flow network is that units genuinely originate at the source and terminate at the sink; only the vertices in between are required to pass everything through unchanged.

### Connection to the previous unit

The previous unit checked each edge stays within its own limit; this unit checks the *whole* structure stays honest at every intermediate point — together, exactly what "a valid flow" requires.

---

## Concept Unit: Max-Flow — Easy to Check, Hard to Find

### The Problem

Given both checks, is there a *best* flow — one moving the most possible total units from source to sink — and how hard is finding it, compared to simply confirming a candidate is valid?

### Introduce the concept in isolation

```clojure
(defn is-valid-flow? [capacity flow source sink n]
  (and (all-capacity-ok? capacity flow 0 0 n) (all-conserved? flow source sink 0 n)))
```

```
user=> (is-valid-flow? [[0 3 2 0] [0 0 1 2] [0 0 0 3] [0 0 0 0]] [[0 2 2 0] [0 0 0 2] [0 0 0 2] [0 0 0 0]] 0 3 4)
true
```

**Max-flow** asks for the flow assignment maximizing total units out of the source (equal, by conservation, to total units into the sink), subject to both this lesson's own checks holding everywhere. `is-valid-flow?` answers a genuinely *easier* question — "is this one candidate legitimate" — in a single, fast pass over the network, exactly Lesson 109's own correctness-relative-to-a-specification idea. *Finding* the actual maximum, rather than checking one candidate, is a real algorithmic problem (classically solved by repeatedly finding an "augmenting path" and pushing more flow along it) — genuinely more involved than this lesson's own definitional scope, named here rather than derived.

### Discard the throwaway example

Not applicable — `is-valid-flow?` is a real, reusable function, combining both of this lesson's already-verified checks.

### CS Lens

This is the identical gap Lesson 110 built its entire discipline around: `is-valid-flow?` is this problem's specification, checkable in one pass; an actual max-flow-finding algorithm is a *candidate solution* to be checked against it — the same relationship `is-largest?` had to `find-largest-from`, now for a problem where finding the optimal answer is genuinely harder than checking one.

### SE Lens

Being able to *verify* a claimed maximum flow quickly, even without being able to *find* one from scratch in this lesson, is itself a real, useful capability — a system receiving "here is a flow assignment, trust me it's optimal" from an external source can check the claim's basic legitimacy (`is-valid-flow?`) immediately, even before independently confirming it's actually the maximum.

### Connection to the previous unit

The previous unit completed the full validity check; this unit is why that check, on its own, is a genuinely useful stopping point — verifying is this lesson's own scope; finding the true maximum is real, additional work this lesson names honestly rather than claims to have done.

---

## Connect the Pieces

A valid flow, and a broken one, checked directly:

```clojure
(println "Valid flow?" (is-valid-flow? [[0 3 2 0] [0 0 1 2] [0 0 0 3] [0 0 0 0]] [[0 2 2 0] [0 0 0 2] [0 0 0 2] [0 0 0 0]] 0 3 4))
(println "Broken flow (vertex 1 unbalanced)?" (is-valid-flow? [[0 3 2 0] [0 0 1 2] [0 0 0 3] [0 0 0 0]] [[0 2 2 0] [0 0 0 1] [0 0 0 2] [0 0 0 0]] 0 3 4))
```

```
Valid flow? true
Broken flow (vertex 1 unbalanced)? false
```

Lowering `1 \to 3`'s flow from `2` to `1`, with nothing else changed, breaks vertex `1`'s own conservation (`2` in, only `1` out) — `is-valid-flow?` catches it immediately, exactly the way a bad transaction would have broken Lesson 1's own bank-account invariant.

## What Breaks Without This

Suppose a system modeling network bandwidth, water pipes, or traffic flow accepted a proposed flow assignment without checking conservation at every intermediate point — only checking that no single edge exceeded its own capacity. A flow that quietly "loses" units at some junction (routes less out than came in) would pass every capacity check while describing something physically impossible — the graph-theoretic equivalent of a bank account where deposits and withdrawals stop actually summing correctly, exactly the kind of silent, structural violation Lesson 1's own original invariant was built to rule out from the very first lesson of this series.

## Exercises

1. **Trace.** By hand, compute `flow-in` and `flow-out` for vertex `2` in this lesson's own valid flow, confirming both equal `2`.
2. **Predict.** Before checking, predict whether a flow assignment violating *capacity* at one edge but satisfying conservation everywhere would be caught by `is-valid-flow?`. Construct one and verify.
3. **Verify.** Confirm the total flow leaving the source (`0`) in this lesson's own valid flow equals the total flow entering the sink (`3`), both `4` — conservation's own consequence at the network's two endpoints, even though `conserved?` itself is never checked there directly.
4. **Break it, on purpose.** Modify this lesson's valid flow so vertex `2` receives more than it sends out, and confirm `is-valid-flow?` reports `false`.
5. **Generalize.** Write `total-flow-value`, computing the total flow out of the source directly, reusing `flow-out`.
6. **Reconstruct.** Close this lesson. From memory, explain conservation using Lesson 1's own bank-account language, and explain why checking a candidate flow is easier than finding the maximum one.

## Definition of Done

- [ ] You can implement `is-valid-flow?` and explain what each of its two checks confirms.
- [ ] You can explain conservation as a direct generalization of Lesson 1's own invariant.
- [ ] You can explain why verifying a flow is easier than finding the maximum one.
- [ ] You completed Exercise 3 and confirmed source-outflow equals sink-inflow.
- [ ] You completed Exercise 5 and implemented a correct `total-flow-value`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you confirmed and built — for example, `"Confirm source outflow (4) equals sink inflow (4); implement total-flow-value via flow-out"` — not just `"lesson 134 exercise"`.

---

**Next lesson:** Lesson 135, *Matching*, connects a seemingly unrelated problem — pairing up elements from two groups as extensively as possible — directly to this lesson's own flow network model, reusing conservation to prove the connection precisely rather than only by analogy.
