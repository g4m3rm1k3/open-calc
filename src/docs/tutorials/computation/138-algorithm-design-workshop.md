# Lesson 138: Algorithm Design Workshop

**What you will build**: This lesson works differently from every other one in this section, the same way Lesson 108 did. First, a short, explicit process — distilled from what this entire section has actually *done*, problem after problem, but never named directly until now. Then a real design challenge, worked with that process and nothing else, before this lesson shows you anything further. Finally, a companion implementation containing exactly one deliberately planted mistake, for you to find yourself before it's revealed.

**What you need to know first**: Everything built in this section (Lessons 109–137) is fair game — this lesson scaffolds as little as possible on purpose. Concretely, this lesson's own challenge leans hardest on Lesson 130's `dijkstra`.

---

## A Repeatable Process for Designing an Algorithm

Section VI never named this directly — every lesson in it only ever *demonstrated* a piece of it. Named explicitly, for the first time, here:

1. **Specify precisely what "correct" means, before anything else** (Lesson 110) — exact inputs, exact outputs, exact constraints. A design built on a vague spec can't be checked against anything real.
2. **Start from a brute-force baseline** (Lesson 111). Slow is fine; wrong is not — a brute-force solution is a trustworthy answer to verify anything faster against later.
3. **Look for exploitable structure, and let the structure choose the tool** — not the other way around:
   - Overlapping subproblems with optimal substructure → **dynamic programming** (Lesson 119).
   - A locally greedy choice, provably safe by an exchange argument → **greedy** (Lessons 117–118).
   - The problem is really a graph, shortest-path, spanning-tree, or flow question in disguise → Lessons 123–135.
   - The problem is really variables, domains, and constraints in disguise → **CSP and backtracking search** (Lessons 136–137).
4. **Prove the faster approach still meets the original spec.** A clever-looking idea is not automatically correct just because it's clever.
5. **Verify against small, known cases before trusting it on real input** — exactly what "Find the Mistake," below, asks you to do yourself, before this lesson reveals anything.

---

## The Challenge

A delivery service runs routes over a weighted, directed road network — Lesson 123's own matrix representation, `matrix[u][v]` the real travel cost from `u` to `v`, not necessarily symmetric. Design a function that finds the cheapest total cost of a route from a `source` to a `destination` that is *required* to pass through one specific intermediate `waypoint` along the way — a mandatory pickup, inspection, or fueling stop, not merely a permitted one.

**Before reading any further, stop and design this yourself.** You have everything you need: Lesson 130 already built `dijkstra`, answering "what is the cheapest way from one vertex to every other vertex." The only genuinely new question this challenge asks is how a *required* intermediate stop changes that question — and whether the answer can be built entirely out of `dijkstra` calls you already have, without writing any new pathfinding logic at all.

---

## A Companion Implementation

Here is one real attempt, built entirely from Lesson 130's own `dijkstra`. Read it as if it were handed to you by a collaborator, before checking whether it's actually correct.

```clojure
(defn via-waypoint-cost [matrix source waypoint destination n]
  (+ (get (dijkstra matrix source n) waypoint)
     (get (dijkstra matrix source n) destination)))
```

The idea: run `dijkstra` once from `source`, then read two distances off that single result — the cost to reach `waypoint`, and the cost to reach `destination` — and add them. One already-correct function, reused twice, for what looks like exactly the two pieces this problem needs.

---

## Find the Mistake

Before reading the next section, test this yourself, on a small four-vertex road network:

```clojure
(def matrix [[0 1 2 0] [0 0 0 1] [0 0 0 4] [0 0 0 0]])
```

Vertex `0` is the depot, `1` an ordinary intermediate stop, `2` the *required* stop, `3` the destination. Edges: `0 \to 1` cost `1`, `1 \to 3` cost `1` — a fast route that skips vertex `2` entirely. Separately, `0 \to 2` cost `2`, `2 \to 3` cost `4` — the *only* route in this whole graph that touches vertex `2` at all.

By hand, the one and only path from `0` to `3` that passes through vertex `2` is `0 \to 2 \to 3`, costing `2 + 4 = 6` — no other route through this graph touches vertex `2`. Run `(via-waypoint-cost matrix 0 2 3 4)` yourself and compare it against that hand-computed `6`, before continuing.

---

## Revealed: What's Wrong

```
user=> (via-waypoint-cost matrix 0 2 3 4)
4
```

`4`, not `6`. The bug is in `via-waypoint-cost`'s second term: it calls `(dijkstra matrix source n)` *again* — but `source` is still `0`, not `waypoint`. The first term correctly measures depot-to-waypoint (`0 \to 2`, cost `2`). The second term was supposed to measure *waypoint*-to-destination — the cost of finishing the trip *after* the required stop — but instead measures depot-to-destination directly, `0 \to 3` by the fast route through vertex `1` (cost `2`), which never touches vertex `2` at all. `2 + 2 = 4` isn't merely the wrong number — it doesn't correspond to any real trip through this graph whatsoever: it silently adds "the cost of reaching the required stop" to "the cost of skipping the required stop entirely," two numbers describing two different, non-overlapping routes, never one single real journey.

This is exactly why step `4` of this lesson's own process — *prove* the faster approach still meets the spec, don't just trust a clever-looking decomposition — exists. Reusing `dijkstra` twice to answer "cost through a required waypoint" is a genuinely correct idea; `via-waypoint-cost`'s failure is not in that idea, only in one call's argument not actually matching the sub-problem it was supposed to answer — the same kind of plausible-looking, single-wrong-name mistake Lesson 108's own `minmax-max` made, in a different lesson's tools entirely.

The fix:

```clojure
(defn via-waypoint-cost [matrix source waypoint destination n]
  (+ (get (dijkstra matrix source n) waypoint)
     (get (dijkstra matrix waypoint n) destination)))
```

```
user=> (via-waypoint-cost matrix 0 2 3 4)
6
```

---

## Why This Matters

Every algorithm in this section, until now, was handed to you already correct, its own derivation standing as the proof. This lesson inverted that twice: first asking you to recognize, from a problem that doesn't announce itself as one, exactly *which* already-built tool actually applies — the design half, the process named at the top of this lesson made concrete — and then asking you to verify a plausible-looking use of that tool rather than trust it on sight — the same verification discipline Lesson 108 built. Neither half is about recalling a formula. Both are the actual, transferable point of this entire section: given an unfamiliar problem and a toolbox of already-proven techniques, correctly identify which one fits, and correctly check that your own use of it is real.

## Exercises

1. **Verify.** Confirm, by hand-tracing `dijkstra`'s own relaxation steps (Lesson 130), that `(dijkstra matrix 0 4)` really is `[0 1 2 2]` and `(dijkstra matrix 2 4)` really is `[999999 999999 0 4]` — the two real results `via-waypoint-cost` depends on.
2. **Predict.** Add a direct edge `0 \to 3` with cost `1` to `matrix` (an even faster bypass, still skipping vertex `2`). Predict whether the *corrected* `via-waypoint-cost`'s answer changes. Then verify — and explain, in one sentence, why a cheaper unconstrained route existing doesn't change the cost of a route that's *required* to detour.
3. **Verify.** Extend this lesson's idea to *two* required waypoints, visited in a fixed order: `source → waypoint1 → waypoint2 → destination`. Write `via-two-waypoints-cost`, using three `dijkstra` calls, and verify it on a graph you extend from this lesson's own four vertices.
4. **Break it, on purpose, differently.** Introduce a *different* single-argument mistake into the corrected `via-waypoint-cost` — one that still runs without crashing but produces a wrong number — and describe exactly what test would reveal it.
5. **Reflect.** Before this lesson revealed the bug, did you find it yourself by testing? If not, what would have caught it faster — hand-verifying the graph first, or something else?
6. **Reconstruct.** Close this lesson. From memory, explain why the original bug's answer, `4`, doesn't correspond to any real path through this lesson's graph at all — not just why the number is wrong.

## Definition of Done

- [ ] You designed a candidate solution to this lesson's challenge, using only `dijkstra`, before reading the companion implementation.
- [ ] You tested the companion implementation against a hand-verified ground truth and found the mistake yourself, or confirmed exactly why you didn't.
- [ ] You completed Exercise 3 and implemented a correct `via-two-waypoints-cost`.
- [ ] You completed Exercise 4 and correctly predicted the symptom of your own planted mistake.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you built and found — for example, `"Implement via-two-waypoints-cost; plant and predict symptom of a second waypoint-argument bug"` — not just `"lesson 138 exercise"`.

---

**Next lesson:** Lesson 139, *Abstraction*, opens Section VII, moving from this section's question — "which algorithm, and how do I know it's correct" — to a new one: what it actually means to hide a real implementation behind a simpler interface, and why that's worth doing at all.
