# Lesson 131: Bellman-Ford

**What you will build**: By the end of this lesson you'll derive a shortest-path algorithm that works exactly where Lesson 130's proof said Dijkstra's couldn't — graphs with negative edge weights — by relaxing every edge repeatedly rather than greedily finalizing vertices, and derive a direct way to detect when "shortest path" stops meaning anything at all: a negative cycle.

**What you need to know first**: Lesson 130's `relax`/`relax-all` and its greedy-invariant proof; Lesson 129's `path-weight`.

**Terms introduced in this lesson**:

- **negative cycle** — a cycle whose total edge weight is negative. *Why it matters*: a path that can loop through a negative cycle can always be made cheaper by looping one more time — "shortest path" has no well-defined answer at all for any vertex reachable through one.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), and Lesson 130's `relax`/`relax-all`, each already covered.

---

## Concept Unit: Relaxing Every Edge, `V-1` Times

### The Problem

Dijkstra's own correctness proof (Lesson 130) depends entirely on non-negative weights — greedily trusting the smallest unfinalized distance breaks the instant a later negative edge could make some other path cheaper after the fact. Is there a way to find correct shortest distances *without* ever greedily trusting any vertex's distance as final until the very end?

### Introduce the concept in isolation

```clojure
(defn bellman-round [matrix dist u n]
  (if (>= u n)
    dist
    (bellman-round matrix (relax-all matrix dist u 0 n) (+ u 1) n)))

(defn bellman-rounds [matrix dist round n]
  (if (>= round (- n 1))
    dist
    (bellman-rounds matrix (bellman-round matrix dist 0 n) (+ round 1) n)))

(defn bellman-ford [matrix source n]
  (bellman-rounds matrix (assoc (all-infinity n 0 []) source 0) 0 n))
```

```
user=> (bellman-ford [[0 4 1 0] [0 0 0 1] [0 1 0 5] [0 0 0 0]] 0 4)
[0 2 1 3]
```

`bellman-round` relaxes *every* edge in the graph once, in one pass over all vertices. `bellman-rounds` repeats this `n-1$ times — no greedy selection, no "trust this vertex now," every distance revisable on every single round. On Lesson 130's own graph, this converges to `[0 2 1 3]` — the identical answer Dijkstra proved correct, reached by simple repetition rather than any greedy invariant at all.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified round by round before being shown here.

### Project Change

- **Reference Source**: `bellman-round`/`bellman-rounds` reuse Lesson 130's `relax-all` directly, unchanged — the only difference from Dijkstra is *which* vertices get relaxed from, and in what order: every one, every round, rather than one greedily-chosen vertex per round.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn bellman-ford [matrix source n]
  (bellman-rounds matrix (assoc (all-infinity n 0 []) source 0) 0 n))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(>= round (- n 1))`** — first appearance: exactly `n-1` rounds, no more — the precise number justified by this unit's own CS lens.
- **`(bellman-round matrix dist 0 n)`**, called once per round — reappearing `relax-all` chained across every vertex, in plain increasing order, never chosen by any distance comparison the way Dijkstra's `min-unvisited` was.

### CS Lens

Any **simple** shortest path (no repeated vertices) in a graph with `n` vertices has at most `n-1` edges — so after `n-1` full rounds of relaxing every edge, the correct distance has had enough rounds to propagate along even the *longest possible* shortest path, one edge further confirmed correct per round, regardless of which order the edges happened to be processed in.

### SE Lens

`bellman-ford`'s cost is `O(V \times E)` — every edge relaxed, `V-1` times — genuinely more expensive than Dijkstra's `O(V^2)` (or `O((V+E)\log V)` with a priority queue) for graphs where Dijkstra's assumption actually holds; this cost is the real, honest price of not needing that assumption at all.

---

## Concept Unit: Handling a Genuine Negative Edge

### The Problem

Lesson 130's own Exercise 4 asked where its proof breaks under a negative weight. Does this lesson's repeat-relaxation approach actually get the *correct* answer on a graph where Dijkstra's greedy choice would be led astray?

### Introduce the concept in isolation

```
user=> (bellman-ford [[0 5 2] [0 0 0] [0 -4 0]] 0 3)
[0 -2 2]
```

Graph: `0 \to 1` weight `5`; `0 \to 2` weight `2`; `2 \to 1` weight `-4`. The direct edge to `1` costs `5`; the path through `2` costs `2 + (-4) = -2` — genuinely cheaper, and correctly found: `-2`. Dijkstra, greedily finalizing whichever vertex looked closest *first*, would have finalized vertex `1` at distance `5` immediately (nothing yet known to be closer) and *never revisited it* — exactly Lesson 130's own proof identifying this as the step that requires non-negative weights. `bellman-ford` never finalizes anything early; every distance stays open to revision through every round.

### Discard the throwaway example

Not applicable — a genuine, hand-verified result on a graph containing a real negative edge.

### CS Lens

This is the direct payoff of never greedily trusting a distance: `relax`'s own condition (Lesson 130) — strictly less than the current best — doesn't care whether the improving edge's weight is positive or negative; the algorithm's correctness never leaned on that distinction anywhere.

### SE Lens

Choosing Bellman-Ford over Dijkstra is a real engineering decision, not merely knowing two names for the same thing: any graph modeling something whose weights can genuinely go negative — cost that can decrease, elevation, currency arbitrage — needs this lesson's algorithm specifically, not merely a slower version of the same idea.

### Connection to the previous unit

The previous unit showed both algorithms agree where Dijkstra's own assumption holds; this unit is the case where they must genuinely disagree — Dijkstra provably wrong, Bellman-Ford correct, on the exact graph shape Lesson 130's own proof flagged as dangerous.

---

## Concept Unit: Detecting a Negative Cycle

### The Problem

If a graph contains a cycle whose total weight is negative, "shortest path" to any vertex reachable through it has no real answer — looping the cycle once more is always cheaper. Can Bellman-Ford's own structure detect this directly?

### Introduce the concept in isolation

```clojure
(defn has-negative-cycle? [matrix dist n]
  (not (= dist (bellman-round matrix dist 0 n))))
```

```
user=> (def result (bellman-ford [[0 1 0] [0 0 -3] [0 1 0]] 0 3))
user=> result
[0 -3 -4]
user=> (has-negative-cycle? [[0 1 0] [0 0 -3] [0 1 0]] result 3)
true
```

This graph has a cycle `1 \to 2 \to 1`, total weight `-3 + 1 = -2` — genuinely negative. After `bellman-ford`'s own regular `n-1$ rounds, running **one more** round of relaxation *still* finds an improvement (`-4` can still drop further) — proof that no true minimum exists at all. On a graph with no negative cycle, this extra round changes nothing, since every distance already reached its true minimum within the guaranteed `n-1$ rounds.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and confirmed both to detect a genuine negative cycle and to correctly report `false` on this lesson's own earlier, cycle-free examples.

### Project Change

- **Reference Source**: `has-negative-cycle?` reuses `bellman-round` (this lesson's first unit) directly, run one extra time past the guaranteed `n-1` — any further change is only possible if the `n-1`-round bound (this unit's own CS lens) was violated, which only a negative cycle can do.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn has-negative-cycle? [matrix dist n]
  (not (= dist (bellman-round matrix dist 0 n))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(bellman-round matrix dist 0 n)`** — reappearing (this lesson's first unit), run *once more* past the algorithm's own guaranteed stopping point.
- **`(not (= dist ...))`** — first appearance: any difference at all between the pre- and post-extra-round distances is proof a true minimum was never reached — the only way that's possible after `n-1` already-guaranteed rounds is a negative cycle.

### CS Lens

This is the exact contrapositive of this lesson's own first-unit claim: "a simple shortest path needs at most `n-1` edges, so `n-1` rounds suffice" — if an `n`-th round still finds improvement, no *simple* path is being improved anymore (there are none longer than `n-1` edges); what's improving is a path looping a negative cycle indefinitely.

### SE Lens

A system trusting shortest-path distances without ever checking for negative cycles risks reporting a plausible-looking, confidently wrong number — a distance that only appears final because the computation happened to be stopped, not because it actually converged to anything real.

### Connection to the previous unit

The previous unit proved the algorithm handles genuine negative edges correctly; this unit is the one honest limit even Bellman-Ford has — not negative weights themselves, but a negative *cycle*, detected directly rather than silently producing a meaningless answer.

---

## Connect the Pieces

All three graphs, all three outcomes:

```clojure
(println "Non-negative graph, matches Dijkstra:" (bellman-ford [[0 4 1 0] [0 0 0 1] [0 1 0 5] [0 0 0 0]] 0 4))
(println "Negative edge, no cycle, correct distance:" (bellman-ford [[0 5 2] [0 0 0] [0 -4 0]] 0 3))
(println "Negative cycle detected?" (has-negative-cycle? [[0 1 0] [0 0 -3] [0 1 0]] (bellman-ford [[0 1 0] [0 0 -3] [0 1 0]] 0 3) 3))
```

```
Non-negative graph, matches Dijkstra: [0 2 1 3]
Negative edge, no cycle, correct distance: [0 -2 2]
Negative cycle detected? true
```

Three genuinely different graphs, one algorithm, correctly handling every one of them — agreement where Dijkstra also works, correctness where Dijkstra provably doesn't, and honest detection of the one case where "shortest path" was never a real question to begin with.

## What Breaks Without This

Suppose a system computed shortest paths for a graph whose weights could occasionally go negative — a currency-exchange graph, say, where an edge weight represents a rate — using Bellman-Ford but *without* this lesson's own negative-cycle check. If the underlying rates ever formed a genuine arbitrage loop (a negative cycle: converting through several currencies and ending up with more than you started with), `bellman-ford` would still return *some* set of distances after its `n-1` rounds — plausible-looking numbers, silently wrong, since the true "shortest path" through a negative cycle is unbounded below. Only `has-negative-cycle?`, run explicitly, would reveal that the computation never actually converged to anything meaningful at all.

## Exercises

1. **Trace.** By hand, trace `bellman-round`'s first pass on the negative-cycle graph (`0 \to 1$ weight `1`, `1 \to 2$ weight `-3`, `2 \to 1$ weight `1`), confirming `dist` after round `1` matches this lesson's own intermediate value.
2. **Predict.** Before checking, predict whether `has-negative-cycle?` reports `true` or `false` on this lesson's *first* graph (Lesson 130's own non-negative example). Verify.
3. **Verify.** Confirm, using `path-weight` (Lesson 129), that the path `[0 2 1]` in this lesson's negative-edge graph has total weight `-2`, matching `bellman-ford`'s own reported distance.
4. **Break it, on purpose.** Run `bellman-ford` (not `has-negative-cycle?`) on the negative-cycle graph, and confirm its returned distances are *not* trustworthy by running `bellman-round` on them one more time yourself and observing they still change.
5. **Generalize.** State, in one sentence each, when you would choose Dijkstra over Bellman-Ford, and when the reverse, using both algorithms' own real costs and assumptions.
6. **Reconstruct.** Close this lesson. From memory, explain why `n-1` rounds suffice for a graph with no negative cycle, and why one additional round changing anything proves one exists.

## Definition of Done

- [ ] You can implement `bellman-ford` and explain why it needs exactly `n-1` rounds.
- [ ] You can implement `has-negative-cycle?` and explain what a further change after `n-1` rounds proves.
- [ ] You can state a graph where Dijkstra gives a wrong answer but Bellman-Ford gives a correct one.
- [ ] You completed Exercise 3 and confirmed `path-weight` agrees with `bellman-ford`'s own distance.
- [ ] You completed Exercise 4 and confirmed the negative-cycle graph's distances keep changing indefinitely.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed — for example, `"Confirm path-weight matches bellman-ford's -2 distance; confirm negative-cycle distances keep decreasing past n-1 rounds"` — not just `"lesson 131 exercise"`.

---

**Next lesson:** Lesson 132, *Minimum Spanning Trees*, leaves shortest paths behind and defines a genuinely different optimization problem — connecting every vertex as cheaply as possible, with no notion of a starting point at all.
