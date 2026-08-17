# Lesson 266: Approximation Algorithms

- **What you will build**: A brute-force optimal solver and a fast greedy
  approximation for the Minimum Vertex Cover problem, run both against the
  identical real graph, and prove — with a concrete, checked argument, not
  just an asserted bound — that the greedy answer is never worse than twice
  the true optimum.
- **What you need to know first**: recursion and branching search built up
  across this curriculum's recursive-search lessons, especially Lesson 121's
  Knapsack-style include/exclude decision search; the certificate-checker,
  brute-force-over-candidates framing built in Lesson 264 (`P and NP`);
  NP-completeness from Lesson 265 (`NP-Completeness`); and graphs as
  vertices/edges from Lesson 123 (`Graphs as Computational Objects`).
- **Terms used in this lesson**:
  - **vertex cover** — a subset of a graph's vertices such that every edge
    has at least one of its two endpoints inside the subset; it exists as a
    concept because many real problems (camera placement covering every
    street segment, monitoring nodes covering every network link) reduce to
    "touch every edge with as few chosen points as possible."
  - **NP-hard** — a problem at least as hard as every problem in NP, meaning
    no known algorithm solves it in polynomial time for the general case;
    this matters here because it is exactly the condition under which
    "give up on exact and get provably close instead" becomes a reasonable
    engineering choice rather than laziness.
  - **approximation algorithm** — an algorithm that runs in polynomial time
    and is guaranteed, by proof rather than by luck, to return an answer no
    worse than some fixed multiple of the true optimum; it exists because
    "fast but sometimes arbitrarily wrong" and "always correct but
    exponential" are not the only two options.
  - **approximation ratio** — the fixed number `k` such that, for every
    possible input, the approximation algorithm's cost is at most `k` times
    the optimal cost; it exists to turn "this seems to work well in
    practice" into a provable, input-independent guarantee.
  - **matching** — a set of edges in a graph no two of which share a vertex;
    it exists here because it is the exact structure the greedy algorithm
    below is proven correct against.
  - **greedy algorithm** — an algorithm that makes the locally best-looking
    choice at each step and never reconsiders it; it exists as a strategy
    because for some problems (this one included) a provably-bounded answer
    can be reached without ever backtracking, which is far cheaper than
    exhaustive search.
  - **certificate / verifier** — a proposed solution plus a fast function
    that checks whether it is actually valid; it exists because checking a
    claimed answer and finding one from scratch are, for many hard
    problems, computationally very different tasks.
  - **branch-and-bound search** — an exhaustive search that, at each
    decision point, tries every option and keeps only the best result found
    across all of them; it exists as the honest, correct-by-construction
    baseline against which a faster algorithm's guarantee can actually be
    measured, since without a trustworthy true answer there is nothing to
    compare an approximation to.
  - **recursion** — a function defined in terms of a smaller call to itself,
    with a base case that stops the calls; it exists because both algorithms
    in this lesson are naturally defined as "handle one piece, then recurse
    on what's left."
  - `defn` — Clojure's form for naming a function; it exists so a
    computation can be given a name and reused by that name instead of
    rewritten at every call site.
  - `cond` — Clojure's multi-branch conditional, tried top to bottom,
    returning the value from the first branch whose test is true; it exists
    because every function in this lesson needs to pick between more than
    two cases (empty input, a matching condition, everything else).
  - **vector literal** `[...]` — Clojure's fixed-size, indexed sequence
    syntax; it exists here as the representation for a single edge (two
    vertices), a cover (a growing list of chosen vertices), and the whole
    edge list of a graph.
  - `get` — reads the value at a given index of a vector; it exists so an
    edge's first or second vertex can be read out by position (`(get edge
    0)`, `(get edge 1)`) instead of by name.
  - `assoc` — returns a new vector with one index's value replaced (or, when
    the index equals the vector's own `count`, effectively appended); it
    exists so a vector can be "grown" one element at a time without any
    mutation construct, since nothing in this vector actually changes in
    place — a brand new vector is returned each time.
  - `count` — returns how many elements a vector holds; it exists here both
    to measure a cover's size and, combined with `assoc`, to compute the
    index one past the end for an append.
  - `first` / `rest` — read the first element of a sequence, and everything
    after it; they exist as this lesson's way of walking through an edge
    list or vertex list one element at a time during recursion.
  - `empty?` — true exactly when a sequence has no elements; it exists as
    the base-case test that stops every recursive walk in this lesson.
  - `or` — Boolean "either," short-circuiting: true the moment any argument
    is true, without evaluating the rest; it exists here to ask "does this
    edge touch vertex `v` at either end?" without writing two separate
    `if`s.
  - `=` — value equality; it exists to compare two vertex names (plain
    strings) or two whole edges for exact sameness.
  - `<` — numeric less-than; it exists to compare two candidate cover sizes
    and keep the smaller.
  - `inc` — adds exactly `1` to a number; it exists to count "one more
    vertex was added to the cover" without writing `(+ n 1)`.
  - `println` — prints a value followed by a newline, for real, to the
    console; it exists so this lesson's claims can be checked against
    actual program output instead of predicted by hand.
  - `def` — binds a name to a value at the top level, once, not
    reassignable by ordinary code; it exists here to name the one sample
    graph both algorithms in this lesson are measured against.
- **Objects and methods used**: None. This lesson's code calls no external
  class, interface, or interop method — everything is a plain Clojure
  function defined from scratch or a core language form, both covered
  under Terms, above.

---

## Concept Unit: The Vertex Cover Problem and Exhaustive Search

### The Problem

Suppose a network has a set of links (edges) between nodes (vertices), and
every link needs to be observed by a monitor placed at one of its two
endpoints. Placing a monitor at every node would obviously work, but wastes
money — the real question is: what is the *smallest* set of nodes such that
every single link has a monitor at one end or the other? That smallest set
is called a **minimum vertex cover**, and the general problem — given an
arbitrary graph, find its minimum vertex cover — is **NP-hard**: it is one
of Karp's original twenty-one problems shown NP-complete by reduction from
another already-NP-complete problem. That original reduction is a real,
substantial result in its own right and is not re-derived here, the same
honest citation this curriculum already made for Subset-Sum's own
NP-completeness rather than re-deriving Cook-Levin's theorem from scratch.

Being NP-hard does not mean "impossible" — it means no known algorithm
solves every instance in time that scales polynomially with the graph's
size. For a *small* graph, plain exhaustive search is still completely
usable, and it produces something valuable beyond just an answer: a
trustworthy baseline. Before any faster algorithm's claimed guarantee can be
checked against anything real, there has to be a real, correctly-computed
optimal answer to check it against. That baseline is what this Concept Unit
builds.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because Section XII builds standalone, `bb`-verified scripts per
  lesson rather than extending one persistent project file.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn touches?
  [vertex edge]
  (or (= vertex (get edge 0)) (= vertex (get edge 1))))

(defn keep-edge
  [edge rest-result]
  (assoc rest-result (count rest-result) edge))

(defn remove-covered-edges
  [vertex edges]
  (cond
    (empty? edges) []
    (touches? vertex (first edges)) (remove-covered-edges vertex (rest edges))
    true (keep-edge (first edges) (remove-covered-edges vertex (rest edges)))))

(defn smaller-of
  [a b]
  (cond
    (< a b) a
    true b))

(defn min-cover-size
  [edges vertices]
  (cond
    (empty? edges) 0
    (empty? vertices) 999
    true (smaller-of
          (min-cover-size edges (rest vertices))
          (inc (min-cover-size (remove-covered-edges (first vertices) edges) (rest vertices))))))
```

### The Updated Project

Skipped — no enclosing file exists yet; these are brand-new, freestanding
functions, exactly the case this step is skipped for.

### Mechanical Walkthrough

- `(defn touches? [vertex edge] ...)` — names a new two-argument function.
  `defn` is Clojure's function-naming form: it exists so `touches?` can be
  called by name from every function below instead of its body being
  copy-pasted wherever the check is needed.
- `(or (= vertex (get edge 0)) (= vertex (get edge 1)))` — `get edge 0` and
  `get edge 1` each read one indexed slot of the two-element `edge` vector,
  returning that edge's first and second vertex respectively; `get` exists
  precisely so a position inside a vector can be read without any special
  syntax beyond an index. Each `=` then compares that vertex against the
  `vertex` argument for exact value equality. `or` combines the two
  comparisons: true the instant either one is true, without needing to
  evaluate the second once the first already succeeded — this is
  `or`'s short-circuiting behavior, and it exists so "does this edge touch
  this vertex at either end" reads as one direct expression instead of two
  nested `if`s.
- `(defn keep-edge [edge rest-result] (assoc rest-result (count rest-result) edge))`
  — a second small named function. `count rest-result` reads how many
  elements the `rest-result` vector currently holds; `assoc` then returns a
  *new* vector, identical to `rest-result` except with `edge` placed at
  that count-index — since a vector's valid indices run from `0` to
  `count - 1`, writing at exactly `count` extends it by one slot rather
  than overwriting anything. Nothing about `rest-result` itself changes in
  place; `keep-edge` hands back a brand-new vector each call, one element
  longer.
- `(defn remove-covered-edges [vertex edges] (cond ...))` — a third named
  function, whose body is a `cond`: Clojure's multi-branch conditional,
  evaluated top to bottom, returning the value paired with the first test
  that comes back true. It exists here because this function has three
  genuinely different cases to handle, not just two.
  - `(empty? edges) []` — the first branch: `empty?` asks whether the
    `edges` sequence has any elements left; when it doesn't, there is
    nothing left to filter, so the function returns an empty vector,
    written `[]`. This is the recursion's base case — the point where it
    stops calling itself.
  - `(touches? vertex (first edges)) (remove-covered-edges vertex (rest edges))`
    — `first edges` reads the very next edge to consider; passing it,
    along with `vertex`, into the `touches?` function just explained,
    tests whether that edge is now covered because `vertex` was just added
    to the cover. When it is, this edge is dropped: the function skips
    straight to recursing on `rest edges` — every edge except the one just
    read — without adding anything to the result. `rest` exists as the
    counterpart to `first`: together they let a function consume a
    sequence one element at a time.
  - `true (keep-edge (first edges) (remove-covered-edges vertex (rest edges)))`
    — the fallback branch, using `cond`'s convention of a literal `true`
    test that always matches once every earlier branch has failed. This
    edge does *not* touch `vertex`, so it survives: the function first
    recurses on the rest of the list (`remove-covered-edges vertex (rest
    edges)`), and once that inner call has produced its own filtered
    result, hands it — together with this edge — to `keep-edge`, just
    explained above, which appends the surviving edge onto the end of that
    result. Because `(remove-covered-edges vertex (rest edges))` appears
    only once, as a single argument expression, it is computed exactly
    once per call, not recomputed for each use — the same "compute once,
    pass it to a helper" shape this curriculum has relied on since its
    early recursive-accumulator lessons.
- `(defn smaller-of [a b] (cond (< a b) a true b))` — a fourth named
  function. `<` is ordinary numeric less-than, testing whether `a` is
  strictly smaller than `b`. The `cond` returns `a` when that's true, and
  otherwise (the `true` fallback branch) returns `b` — an ordinary
  "pick the smaller of two numbers" helper, needed because nothing in bare
  Clojure syntax does this for exactly two values without writing it out.
- `(defn min-cover-size [edges vertices] (cond ...))` — the function this
  whole Concept Unit exists to build. Its `cond` has three branches:
  - `(empty? edges) 0` — if every edge has already been accounted for
    (removed by some earlier `remove-covered-edges` call further up the
    recursion), no more vertices are needed: the cost of finishing from
    here is `0`.
  - `(empty? vertices) 999` — if there are no vertices left to try but
    edges remain uncovered, this branch of the search has failed; `999`
    stands in for "infeasible," a deliberately large sentinel number no
    real, valid cover of this small a graph could ever reach, so it can
    never accidentally win a `smaller-of` comparison against a real
    answer.
  - `true (smaller-of (min-cover-size edges (rest vertices)) (inc (min-cover-size (remove-covered-edges (first vertices) edges) (rest vertices))))`
    — the real work. For the next vertex, `(first vertices)`, the function
    tries both of its only two possibilities and keeps whichever is
    cheaper, via `smaller-of`, explained just above. The first
    possibility, `(min-cover-size edges (rest vertices))`, is *excluding*
    this vertex from the cover: the edge list is left completely
    untouched, and the search continues with one fewer vertex to decide
    about. The second, `(inc (min-cover-size (remove-covered-edges (first
    vertices) edges) (rest vertices)))`, is *including* it: every edge
    `remove-covered-edges` finds touching this vertex is stripped out
    before recursing (this vertex now covers them, so they no longer
    constrain anything downstream), and `inc` adds exactly `1` to whatever
    that smaller sub-problem costs, to account for the vertex just spent.
    This is the identical include-or-exclude branching shape this
    curriculum has already used to derive an optimal choice by trying
    both options and keeping the better one — here applied to minimizing a
    cover's size instead of maximizing a knapsack's value. Because it
    tries every combination of every vertex being in or out, this is an
    exhaustive **branch-and-bound search**: correct by brute force, not by
    cleverness, which is exactly the property that makes it trustworthy
    as a baseline.
- `(def cycle-edges [["a" "b"] ["b" "c"] ["c" "d"] ["d" "e"] ["e" "a"]])` and
  `(def cycle-vertices ["a" "b" "c" "d" "e"])` — `def` binds a name to a
  value once, at the top level; it exists so a value can be referred to by
  name afterward instead of written out again. Each vertex is an ordinary
  Clojure string (`"a"` through `"e"`), and each edge is a two-element
  vector literal holding two such strings. Read together, `cycle-edges`
  describes a graph shaped like a five-sided ring — `a` connects to `b`,
  `b` to `c`, and so on, with the final edge `e`-`a` closing the ring back
  on itself.
- `(println "min-cover-size:" (min-cover-size cycle-edges cycle-vertices))`
  — `println` prints its arguments, space-separated, followed by a
  newline, to the real console; it exists so this lesson's numeric claim
  can be checked against an actual run instead of a predicted one.

### CS Lens

Trying every combination and keeping the best is **branch-and-bound
search**, a pattern that recurs constantly whenever a problem has no known
shortcut: the 0/1 Knapsack problem's include/exclude decision at every
item, N-Queens and other backtracking puzzles pruning a decision tree,
real integer-programming solvers used in logistics and scheduling software,
and exhaustive move-search in game-playing programs before any heuristic
pruning is added on top.

### SE Lens

An exponential brute-force search is never something to *ship* against a
large input — but it is exactly the right thing to *build first* as a
reference implementation, the same role a slow, obviously-correct
implementation plays when validating a fast one in any domain: without a
trustworthy source of truth, "the fast version looks right" cannot be
distinguished from "the fast version is actually right." The real cost
being paid here is honest and bounded: `min-cover-size` explores every
one of the `2^5 = 32` possible vertex subsets of this five-vertex graph in
well under a second, which is only viable because the graph stays small —
the alternative not chosen, skipping the brute-force baseline entirely and
trusting the faster algorithm's guarantee on faith, would leave the very
number this lesson is about to check that guarantee against unverified.

### Run It

```
user=> (println "min-cover-size:" (min-cover-size cycle-edges cycle-vertices))
min-cover-size: 3
```

A real, exhaustively-checked answer: no set of fewer than 3 vertices covers
every edge of this 5-vertex ring, and a set of exactly 3 does — `{"a" "c"
"d"}` is one such set, confirmed for real further below once this lesson's
verifier function exists.

---

## Concept Unit: A Greedy 2-Approximation and the Approximation Ratio

### The Problem

`min-cover-size` is correct, but it is exponential: doubling the number of
vertices roughly squares the number of subsets it has to consider. On a
graph with a few hundred vertices, it would never finish. Real systems
that need to compute something like a vertex cover — placing a minimal set
of monitoring nodes on an actual network, for instance — cannot wait on an
exponential search. What's needed is a polynomial-time algorithm — one
whose running time scales predictably, not explosively, with input size —
that gives up on *guaranteed optimal* in exchange for *fast*, while still
offering some real, provable guarantee about how far from optimal its
answer can be. That guarantee is what turns "probably good enough" into
"provably good enough," and it is the entire reason an **approximation
algorithm** is a meaningfully different thing from an algorithm that is
merely fast and hopeful.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch addition,
  same reason as the Concept Unit above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; reuses `touches?` and
  `keep-edge`, already defined above in this same file.

### The New Code

```clojure
(defn remove-touching-either
  [edge edges]
  (cond
    (empty? edges) []
    (or (touches? (get edge 0) (first edges)) (touches? (get edge 1) (first edges)))
    (remove-touching-either edge (rest edges))
    true (keep-edge (first edges) (remove-touching-either edge (rest edges)))))

(defn append-vertex
  [subset vertex]
  (assoc subset (count subset) vertex))

(defn add-both-endpoints
  [edge cover-so-far]
  (append-vertex (append-vertex cover-so-far (get edge 0)) (get edge 1)))

(defn greedy-vertex-cover
  [edges]
  (cond
    (empty? edges) []
    true (add-both-endpoints (first edges)
                              (greedy-vertex-cover (remove-touching-either (first edges) (rest edges))))))
```

### The Updated Project

Skipped — brand-new, freestanding functions, same as the Concept Unit
above.

### Mechanical Walkthrough

- `(defn remove-touching-either [edge edges] (cond ...))` — a function
  shaped almost identically to `remove-covered-edges` above, but checking
  *both* endpoints of a whole `edge`, not one `vertex`.
  - `(empty? edges) []` — the same base case as before: nothing left to
    filter.
  - `(or (touches? (get edge 0) (first edges)) (touches? (get edge 1) (first edges))) (remove-touching-either edge (rest edges))`
    — `get edge 0` and `get edge 1` read the two vertices of the edge just
    picked; each is checked, via `touches?` (defined in the Concept Unit
    above and reused here unchanged), against the next edge in the list,
    `(first edges)`. `or` again short-circuits: true if *either* endpoint
    touches this edge. When true, the edge is dropped and the search
    recurses on `(rest edges)` — it is now covered, since one of its
    endpoints is about to be added to the cover.
  - `true (keep-edge (first edges) (remove-touching-either edge (rest edges)))`
    — the surviving-edge case, structured exactly like
    `remove-covered-edges`'s own fallback branch: recurse first, then hand
    the result and this edge to `keep-edge` to append.
- `(defn append-vertex [subset vertex] (assoc subset (count subset) vertex))`
  — the identical append-by-`assoc`-at-`count` idiom `keep-edge` already
  used above, restated here under its own name because this one appends a
  single vertex string onto a cover, not a whole edge onto a filtered edge
  list — the same construct, doing the same job, on a different kind of
  vector.
- `(defn add-both-endpoints [edge cover-so-far] (append-vertex (append-vertex cover-so-far (get edge 0)) (get edge 1)))`
  — reads both of `edge`'s vertices via `get edge 0` and `get edge 1`, the
  same indexed reads used throughout this lesson, and appends them onto
  `cover-so-far` one at a time: the inner `(append-vertex cover-so-far
  (get edge 0))` runs first, producing a new vector with the first vertex
  added, and the outer `append-vertex` call adds the second vertex onto
  *that* result. Two ordinary nested function calls — no new construct,
  just `append-vertex` used twice in a row.
- `(defn greedy-vertex-cover [edges] (cond ...))` — the approximation
  algorithm itself.
  - `(empty? edges) []` — base case: no edges left means no vertices are
    needed to cover them.
  - `true (add-both-endpoints (first edges) (greedy-vertex-cover (remove-touching-either (first edges) (rest edges))))`
    — the entire algorithm in one line: take the next edge, `(first
    edges)`; recurse on whatever remains *after* stripping out every edge
    that touches either of its endpoints — `(remove-touching-either
    (first edges) (rest edges))`, just explained above; and once that
    smaller recursive call has produced its own cover, add this edge's two
    endpoints onto it via `add-both-endpoints`. This is the whole
    **greedy algorithm**: pick any remaining edge, commit both its
    endpoints to the cover, discard every edge that decision just covered,
    and repeat — never reconsidering a choice once made.

### The approximation ratio, checked concretely

Running `greedy-vertex-cover` on the identical `cycle-edges` graph
`min-cover-size` already measured:

```
user=> (println "greedy-vertex-cover:" (greedy-vertex-cover cycle-edges))
greedy-vertex-cover: [d e a b]
user=> (println "greedy size:" (count (greedy-vertex-cover cycle-edges)))
greedy size: 4
```

Four vertices, against a real optimal of three. Before trusting that `4`
is even a *valid* cover, it needs checking — the same certificate-checker
framing already used when this section built a verifier for proposed
Subset-Sum solutions:

```clojure
(defn vertex-in-cover?
  [v cover]
  (cond
    (empty? cover) false
    (= v (first cover)) true
    true (vertex-in-cover? v (rest cover))))

(defn edge-covered?
  [edge cover]
  (or (vertex-in-cover? (get edge 0) cover) (vertex-in-cover? (get edge 1) cover)))

(defn all-covered?
  [edges cover]
  (cond
    (empty? edges) true
    (edge-covered? (first edges) cover) (all-covered? (rest edges) cover)
    true false))
```

`vertex-in-cover?` walks a cover vector looking for a match, exactly the
same first/rest recursive walk this lesson has used throughout —
`(empty? cover) false` when the walk runs out without finding it,
`(= v (first cover)) true` when the vertex at the front matches, and the
`true` fallback recursing on `(rest cover)` otherwise. `edge-covered?`
checks both of an edge's endpoints against the cover via `or`, the same
short-circuiting combination `touches?` used at the very start of this
lesson. `all-covered?` walks the full edge list, recursing on `(rest
edges)` for as long as each edge in turn comes back covered, and only
reaches its `true` base case — `(empty? edges) true` — if every single one
did; the `false` fallback fires the moment any edge fails the check.

```
user=> (println "greedy cover valid?" (all-covered? cycle-edges (greedy-vertex-cover cycle-edges)))
greedy cover valid? true
```

A real, checked `true` — not merely a plausible-looking result. Now the
actual bound: an **approximation ratio** of `2` means greedy's cover size
must never exceed `2 x` the true optimal, for *any* graph, not just this
one. Checked against this lesson's own real numbers:

```
user=> (println "2 x optimal:" (* 2 (min-cover-size cycle-edges cycle-vertices)))
2 x optimal: 6
```

Greedy's real size, `4`, sits comfortably inside the bound of `6` — a ratio
of `4/3`, not the worst case, but a real instance of the guarantee holding.

### Why the bound holds, checked, not just asserted

The proof rests on one structural fact about `greedy-vertex-cover`: because
`remove-touching-either` strips out *every* edge touching either endpoint
of the edge just picked, no edge picked on a later recursive call can ever
share a vertex with an edge already picked. The edges greedy actually
commits to therefore form a real **matching** — a set of vertex-disjoint
edges — by construction, every single time, not by coincidence on this one
graph. That can be checked directly against this run: the first edge
greedy picks is `cycle-edges`'s own first entry, `["a" "b"]`; the edges
still remaining right after it is picked are:

```
user=> (println "edges remaining after picking a-b:" (remove-touching-either (first cycle-edges) (rest cycle-edges)))
edges remaining after picking a-b: [[d e] [c d]]
```

so the second edge greedy picks is `["d" "e"]`, the front of that
remaining list. Checking those two picked edges against each other, using
`touches?` from the first Concept Unit:

```
user=> (println "picked edges disjoint?" (and (not (touches? "a" ["d" "e"])) (not (touches? "b" ["d" "e"]))))
picked edges disjoint? true
```

Real, confirmed: `["a" "b"]` and `["d" "e"]` share no vertex. Now the
argument that connects this fact to the `2x` bound: any valid vertex cover
— including the true optimal one — must contain at least one endpoint of
*every* edge in this matching, because a matching's edges are, by
definition, pairwise vertex-disjoint, so no single chosen vertex can ever
cover more than one of them. With `k` matching edges, the optimal cover
must therefore have size at least `k`. Greedy, meanwhile, adds *both*
endpoints of every matching edge it picks, so its own cover has size
exactly `2k`. Put together: `greedy size = 2k <= 2 x optimal size`, for any
graph at all — the bound is not specific to this five-vertex ring, it
follows from the shape of the algorithm itself.

### CS Lens

**Approximation algorithms** are a whole discipline built on exactly this
move — trade guaranteed optimality for a guaranteed *bound* on how far from
optimal an answer can be, provable rather than hoped for. The same idea
recurs in: the Traveling Salesman Problem's triangle-inequality-based
approximations, Set Cover's greedy algorithm (which gives a logarithmic,
not constant, approximation ratio — a real, different bound for a related
but structurally different problem), first-fit bin-packing, and
load-balancing/makespan scheduling algorithms that guarantee no machine
ends up more than some fixed factor over the ideal even load.

### SE Lens

Choosing `greedy-vertex-cover` over `min-cover-size` for a real system is a
concrete instance of a very common tradeoff: bounded imperfection,
delivered fast and predictably, versus perfect correctness, delivered on a
timeline that grows explosively with input size. The alternative not
chosen — always computing the true optimum — is not just slower, it is
*unusable* past a few dozen vertices; a real monitoring system with
thousands of network links has no exponential search to fall back on. The
real cost being paid for speed here is honest and bounded, not hidden: up
to twice as many monitors as strictly necessary, in the worst case,
provably never more. A system that needs a tighter bound than `2` has to
reach for a different, usually more expensive, approximation algorithm —
this ratio is not free to improve without paying for it somewhere else.

### What Breaks Without This

The entire `2x` guarantee depends on one specific line:
`remove-touching-either` must strip out *every* edge touching either
endpoint of the picked edge, not just the picked edge itself. Breaking
that on purpose, by removing only the exact edge chosen instead of every
edge touching its endpoints:

```clojure
(defn remove-exact-edge
  [edge edges]
  (cond
    (empty? edges) []
    (= edge (first edges)) (remove-exact-edge edge (rest edges))
    true (keep-edge (first edges) (remove-exact-edge edge (rest edges)))))

(defn broken-greedy-vertex-cover
  [edges]
  (cond
    (empty? edges) []
    true (add-both-endpoints (first edges)
                              (broken-greedy-vertex-cover (remove-exact-edge (first edges) (rest edges))))))
```

```
user=> (println "broken greedy size:" (count (broken-greedy-vertex-cover cycle-edges)))
broken greedy size: 10
```

A real, `bb`-checked `10` — every one of the graph's 5 edges now gets
picked in turn, since none of them are ever pre-emptively removed by an
earlier pick sharing a vertex, and each contributes 2 more vertices with no
deduplication. `10` is nearly the full graph, blowing straight past the
`2 x optimal = 6` bound this lesson just proved. The picked edges under
`remove-exact-edge` are no longer guaranteed vertex-disjoint — they are no
longer a matching at all — so the entire argument connecting "how many
edges greedy picks" to "how large the true optimal cover must be" collapses
along with it. One `=` in place of one `or`-of-two-`touches?` is the exact
difference between a provable `2x` guarantee and no guarantee whatsoever.

---

## Connect the Pieces

Follow the graph itself, `cycle-edges`, end to end: `min-cover-size`
exhaustively tries every combination of its five vertices and reports the
real optimal cover size, `3`. `greedy-vertex-cover` walks the same edge
list exactly once, picks the edge `["a" "b"]`, strips out every edge that
choice covers via `remove-touching-either`, picks the next surviving edge
`["d" "e"]`, strips again, and returns `[d e a b]` — a cover of size `4`,
confirmed valid by `all-covered?` and confirmed to rest on two genuinely
vertex-disjoint picked edges. `4` sits inside the proven bound of `2 x 3 =
6`. Swapping `remove-touching-either` for `remove-exact-edge` — one
construct, `=`, in place of another, `or`-of-`touches?` — breaks the
disjointness the whole proof depends on and the real measured size jumps
to `10`, blowing past that same bound.

## Exercises

1. Change `cycle-edges` to a graph shaped like a straight line of 4 edges
   (`a-b-c-d-e`, no edge closing `e` back to `a`) instead of a ring. Run
   both `min-cover-size` and `greedy-vertex-cover` again — does the
   optimal size change? Does greedy's?
2. Add one extra edge to `cycle-edges` connecting two vertices that are
   not currently adjacent (for example `["a" "c"]`). Recompute both
   answers. Does the `2x` bound still hold?
3. `greedy-vertex-cover` always picks whatever edge happens to be first in
   the list at each step. Reorder `cycle-edges` (same 5 edges, different
   order) and rerun `greedy-vertex-cover`. Does it still return a cover of
   size `4`, or does the specific vertices chosen change? Does its *size*
   ever exceed `6`?
4. Using `all-covered?`, check by hand whether `["b" "d"]` — only 2
   vertices — is a valid cover of `cycle-edges`. What does that confirm
   about whether `3` really is the minimum, and not just a number
   `min-cover-size` happened to return?

## Definition of Done

- [ ] `touches?`, `keep-edge`, `remove-covered-edges`, `smaller-of`, and
      `min-cover-size` are defined and return `3` for `cycle-edges`.
- [ ] `remove-touching-either`, `append-vertex`, `add-both-endpoints`, and
      `greedy-vertex-cover` are defined and return a 4-vertex cover for
      `cycle-edges`.
- [ ] `vertex-in-cover?`, `edge-covered?`, and `all-covered?` are defined
      and confirm the greedy cover is valid.
- [ ] The picked-edges disjointness check and the `2 x optimal` bound have
      both been run for real and shown to hold.
- [ ] `remove-exact-edge` and `broken-greedy-vertex-cover` have been run
      for real, showing a broken cover of size `10` that violates the
      bound.
- [ ] `git commit -m "Add Vertex Cover brute force and greedy 2-approximation, proving the bound depends on picking a vertex-disjoint matching"`
