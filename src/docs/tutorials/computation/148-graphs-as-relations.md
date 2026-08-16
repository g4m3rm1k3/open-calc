# Lesson 148: Graphs as Relations

**What you will build**: By the end of this lesson you'll show that Lesson 123's own graph edges are nothing more than Lesson 11's relation — a set of ordered pairs — and that a plain directed graph is generally *neither* reflexive nor symmetric, unlike every relation Section VII has built so far. You'll then compute a real **transitive closure** by hand-coded chaining, and show that a DAG's own reachability relation (Lesson 127) is exactly a **partial order** (Lesson 146), the concrete graph fact underneath a purely abstract definition.

**What you need to know first**: Lesson 11's relation (a set of ordered pairs); Lesson 123's graph edges; Lesson 145's reflexive/symmetric/transitive; Lesson 146's partial order, antisymmetric, and comparable; Lesson 127's topological sort and DAGs.

**Terms introduced in this lesson**:

- **transitive closure** — the smallest relation that contains a given relation and is also transitive: for every chain `a \sim b` and `b \sim c` already present, `a \sim c` is added, repeated until nothing new is added. *Why it matters*: names precisely what "reachability" (Lesson 124's BFS, Lesson 125's DFS) computes over a graph's direct-edge relation — not the edges themselves, but everything the edges *chain into*.

**Objects and methods used**: None new. This lesson reuses `get`/`count` (Lesson 84, Lesson 94) and `and`/`=` (Lesson 7, Lesson 6), each already covered.

---

## Concept Unit: Edges Are a Relation — and Usually Neither Reflexive Nor Symmetric

### The Problem

Lesson 11 defined a relation as a set of ordered pairs. Lesson 123's graph edges are, literally, a set of ordered pairs (`[u v]$, an edge from `u` to `v`). Does an ordinary directed graph automatically satisfy the properties Section VII has spent lessons naming — reflexive, symmetric, transitive — the way Lesson 145's equivalence relation did?

### Introduce the concept in isolation

```clojure
(declare related-at?)

(defn related? [pairs u v] (related-at? pairs u v 0))

(defn related-at? [pairs u v i]
  (if (>= i (count pairs))
    false
    (if (and (= (get (get pairs i) 0) u) (= (get (get pairs i) 1) v))
      true
      (related-at? pairs u v (+ i 1)))))
```

```
user=> (def edges [[0 1] [0 2] [1 2] [1 3] [2 3]])
user=> (related? edges 0 0)
false
user=> (related? edges 0 1)
true
user=> (related? edges 1 0)
false
```

`related?` is the direct-edge relation, checked exactly the way Lesson 145's `same-remainder?` checked its own relation. Unlike every relation this section has built so far: **not reflexive** — `(related? edges 0 0)` is `false`, no vertex is related to itself by a plain directed edge, unless a self-loop happens to exist. **Not symmetric** — `0` relates to `1`, but `1` does not relate to `0`; a directed edge only ever goes one way.

### Discard the throwaway example

Not applicable — `related?` is real, reusable, and both properties were checked directly, not assumed from the word "graph."

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch relation checker over Lesson 123's own edge-list representation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn related? [pairs u v] (related-at? pairs u v 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(declare related-at?)`** — reappearing forward declaration (Lesson 36): `related?` calls `related-at?` before it's read.
- **`(and (= (get (get pairs i) 0) u) (= (get (get pairs i) 1) v))`** — reappearing nested `get`/`=`/`and` (Lesson 84, Lesson 6, Lesson 7): checks whether edge `i` is exactly the pair `[u v]` being searched for.
- **`related-at?`'s own recursion** — reappearing scan-with-index shape (used constantly since Lesson 94): checks every edge in order, returning `false` only once the whole list is exhausted with no match found.

### CS Lens

A directed graph is, precisely, a relation on its vertex set that happens to be neither reflexive nor symmetric in general — Lesson 123 never needed Section VII's vocabulary to build graphs correctly, but every property named since Lesson 145 was quietly describable in graph terms the entire time.

### SE Lens

Checking reflexivity and symmetry directly, rather than assuming a graph automatically has whichever properties feel intuitive, is exactly the discipline this whole section has repeated: Lesson 123's own undirected-graph exercise represented undirected edges as *pairs going both ways explicitly* — a real, deliberate design choice to force symmetry, not a property directed edges provide for free.

---

## Concept Unit: Transitive Closure — What Chains Into What

### The Problem

`related?` only reports a *direct* edge. Lesson 124's BFS and Lesson 125's DFS both answer a different question — "is there a path at all" — without either of them ever being described as computing a relation's property. Is reachability precisely this lesson's own missing property, transitivity, made real?

### Introduce the concept in isolation

```clojure
(defn transitive? [pairs u v w] (and (related? pairs u v) (related? pairs v w)))
```

```
user=> (def dag-edges [[0 1] [1 2]])
user=> (related? dag-edges 0 2)
false
user=> (transitive? dag-edges 0 1 2)
true
```

No direct edge `0 \to 2` exists in `dag-edges` — `related?` correctly reports `false`. But a chain does: `0 \to 1` and `1 \to 2` both hold, confirmed by `transitive?`. The **transitive closure** of `dag-edges` is the smallest relation containing every original edge *plus* every pair reachable by chaining — here, `[0 1]`, `[1 2]`, and `[0 2]`, the last one added specifically because the first two chain into it. This is precisely what Lesson 124's BFS or Lesson 125's DFS, run from every vertex, would compute: not the edges themselves, but the full transitive closure of the edge relation.

### Discard the throwaway example

Not applicable — every result is real, confirming the direct edge is genuinely absent while the chain genuinely exists.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch check connecting this lesson's own `related?` to Lesson 145's transitivity property.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn transitive? [pairs u v w] (and (related? pairs u v) (related? pairs v w)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(related? pairs u v)`, `(related? pairs v w)`** — reappearing `related?` (this lesson's first unit), both calls checking one link each of a two-edge chain.
- **`(and ...)`** — reappearing `and` (Lesson 7): both links must hold for the chain to exist at all.

### CS Lens

Lesson 128's connected components and Lesson 124/125's reachability were always computing a graph's transitive closure — Section VI built the algorithm before Section VII had a name for exactly what it was closing over.

### SE Lens

Distinguishing "direct edge" from "reachable via a chain" matters practically: a permissions system checking "does user `A` have access to resource `C`" through a chain of group memberships is checking transitive closure, not a direct edge — conflating the two (checking only direct grants) would silently miss every legitimately inherited permission.

### Connection to the previous unit

The previous unit showed a plain graph relation lacks reflexivity and symmetry; this unit shows the one property it *can* gain through chaining — transitivity — and names that gain precisely as transitive closure.

---

## Concept Unit: A DAG's Reachability Is a Partial Order

### The Problem

Lesson 146 named reflexive, transitive, antisymmetric together as a partial order, using sets and `\subseteq` as the example. Does a real graph structure already built in this curriculum satisfy the identical three properties?

### Introduce the concept in isolation

A DAG's own reachability relation — "`v` is reachable from `u`," the transitive closure this lesson's second unit just computed — is: **transitive**, by construction, since transitive closure is exactly "close under transitivity." **Antisymmetric**, because a DAG has no cycles (Lesson 127's own defining property): if `u` reaches `v` and `v` also reaches `u`, that's a cycle, forbidden unless `u = v`. **Reflexive**, once every vertex is understood to trivially reach itself (a path of length zero) — the one property this lesson's first unit found missing from the *raw* edge relation, restored the moment reachability, not direct adjacency, is the relation being considered.

Reachability in a DAG is a genuine partial order — which is exactly why Lesson 146's own closing pointed here: Lesson 127's topological sort was always extending *this* partial order into a total order, the specific, concrete instance underneath that lesson's entirely abstract closing claim.

### Discard the throwaway example

Not applicable — this unit names a real structural fact about DAGs, using properties already checked concretely in this lesson's first two units.

### CS Lens

"Reachability in a DAG is a partial order" is the precise, checkable reason a DAG can always be topologically sorted at all — Lesson 146's own theorem (every partial order extends to some total order) applied to this one concrete case is *why* Lesson 127's algorithm is guaranteed to succeed on any DAG, not merely observed to work on the examples that lesson happened to try.

### SE Lens

Recognizing "this is a partial order" before writing graph code lets an engineer reuse a whole body of already-proven theory — every property Lesson 146 and 147 proved about partial orders and lattices applies immediately to any DAG's reachability, without re-deriving a single one of those proofs from scratch for graphs specifically.

### Connection to the previous unit

The previous unit computed one concrete transitive closure; this unit shows that closure, for any DAG specifically, always satisfies the exact three properties Lesson 146 named a partial order — turning this section's most abstract definition into a fact about a data structure Section VI already built.

---

## Connect the Pieces

A directed edge relation, its transitive closure, and the partial order that closure forms on a DAG:

```clojure
(println "Direct edge 0->2?" (related? dag-edges 0 2))
(println "Chain 0->1->2 exists?" (transitive? dag-edges 0 1 2))
(println "So reachability(0,2) is true even though the raw edge relation says false.")
```

```
Direct edge 0->2? false
Chain 0->1->2 exists? true
So reachability(0,2) is true even though the raw edge relation says false.
```

The raw edge relation and its transitive closure disagree on this exact pair — the entire reason "reachable" and "directly connected" are different, checkable questions, not interchangeable phrasings of the same one.

## What Breaks Without This

Suppose a permissions system checked only `related?` — direct grants — when a user's access was actually inherited through a chain of group memberships two or three levels deep. Every indirect grant would be invisible: a user legitimately entitled to a resource, through a real chain of direct relationships, would be denied, because the system never computed the transitive closure its own actual access model required. Conversely, a security audit checking only direct edges for *revoked* access would miss every lingering indirect path, a much more dangerous version of the identical mistake. The fix in both directions is the same: know explicitly whether the question being asked is about direct relation or its transitive closure, and compute the one actually needed.

## Exercises

1. **Trace.** By hand, using `related?`'s own definition, confirm `edges` (this lesson's first unit) has exactly five direct pairs, matching its own literal definition.
2. **Predict.** Before checking, predict whether `(transitive? edges 0 1 3)` is `true`, using `edges`'s own five pairs. Then verify.
3. **Verify.** Confirm `dag-edges`'s transitive closure — `[0 1]`, `[1 2]`, `[0 2]` — is itself transitive: no further chain exists beyond those three pairs.
4. **Break it, on purpose.** Add an edge `[2 0]` to `dag-edges`, creating a cycle, and explain why the resulting relation is no longer antisymmetric — name the specific pair that breaks it.
5. **Generalize.** Describe, without coding it, why an *undirected* graph's edge relation is automatically symmetric by construction, unlike the directed `edges` this lesson used throughout.
6. **Reconstruct.** Close this lesson. From memory, explain why a DAG's reachability relation is always a partial order, using this lesson's own three-property argument, not a general statement about graphs.

## Definition of Done

- [ ] You can explain why a plain directed graph's edge relation is generally neither reflexive nor symmetric.
- [ ] You can compute a transitive closure by hand for a small chain of edges and explain how it differs from the raw edge relation.
- [ ] You can explain why a DAG's reachability relation is always a partial order — reflexive, transitive, and antisymmetric — and connect that directly to Lesson 127's topological sort.
- [ ] You completed Exercise 3 and confirmed `dag-edges`'s transitive closure is itself transitive.
- [ ] You completed Exercise 4 and identified exactly which pair breaks antisymmetry once a cycle is introduced.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm dag-edges closure {[0 1] [1 2] [0 2]} is transitive; show adding [2 0] breaks antisymmetry via 0 and 2 reaching each other"` — not just `"lesson 148 exercise"`.

---

**Next lesson:** Lesson 149, *Trees as Recursive Algebras*, turns from graphs back to Lesson 30's own recursive trees, treating a tree's own recursive definition as an algebraic structure in its own right — the same shift in perspective this lesson just gave graphs, applied to a structure this curriculum has used since Section III.
