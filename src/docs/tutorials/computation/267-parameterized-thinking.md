# Lesson 267: Parameterized Thinking

- **What you will build**: A search that answers "does a vertex cover of
  size at most `k` exist?" whose real, measured cost depends on `k`, not on
  the size of the graph — then a concrete, computed contrast showing why
  that distinction is the difference between usable and useless on a large
  input.
- **What you need to know first**: Lesson 266's Minimum Vertex Cover
  (`touches?`, `keep-edge`, `remove-covered-edges`, and the brute-force
  `min-cover-size`, all reused and restated here), Lesson 264's `NP` and
  brute-force-search framing, and Lesson 265's `NP`-completeness.
- **Terms used in this lesson**:
  - **parameter** — a number describing one specific aspect of an input,
    chosen separately from the input's overall size; it exists as a concept
    because two problem instances can have wildly different total sizes
    while sharing the exact same value for the one number that actually
    controls how hard they are to solve.
  - **fixed-parameter tractable (FPT)** — a problem solvable in time
    `f(k) * n^c`, where `n` is the input size, `k` is a chosen parameter,
    `c` is a fixed constant, and `f` is some function that depends only on
    `k`, never on `n`; it exists to name the specific, valuable shape where
    all of the "explosive" cost is pushed onto `k` alone, leaving the `n`
    part to grow only polynomially.
  - **bounded search tree** — a recursive search that branches into a fixed
    number of choices at each step and is guaranteed to stop once a budget
    counter reaches zero; it exists as the concrete mechanism that turns
    "parameterized by `k`" from an abstract cost claim into an actual,
    running algorithm.
  - **decision problem** — a problem whose answer is only ever `true` or
    `false` ("does a cover of size at most `k` exist"), as opposed to an
    **optimization problem**, whose answer is the best value achievable
    ("what is the smallest cover"); it exists here because the algorithm
    this lesson builds only answers the decision version directly — the
    optimization version is recovered by asking the decision version
    repeatedly, shown at the end of the first Concept Unit below.
  - **recursion** — a function defined in terms of a smaller call to
    itself, with a base case that stops the calls; both functions built in
    this lesson are defined exactly that way.
  - `defn` — Clojure's form for naming a function, reused unchanged from
    every earlier lesson that used it; it exists so a computation can be
    called by name instead of rewritten at each use.
  - `cond` — Clojure's multi-branch conditional, tried top to bottom,
    returning the value from the first true test; every function in this
    lesson needs more than a single two-way choice, which is exactly what
    `cond` is for.
  - **vector literal** `[...]` — Clojure's fixed-size, indexed sequence
    syntax; it is this lesson's representation for a single edge (two
    vertex strings) and for a whole edge list.
  - `get` — reads the value at a given index of a vector; used here, as in
    Lesson 266, to read an edge's first or second vertex by position.
  - `assoc` — returns a new vector with one index's value replaced, or, at
    an index equal to the vector's own `count`, effectively appended; it
    exists so a vector can grow one element at a time with nothing ever
    mutated in place.
  - `count` — returns how many elements a vector holds; combined with
    `assoc`, it is how this lesson's reused append pattern finds the index
    one past the end.
  - `first` / `rest` — read the first element of a sequence, and everything
    after it; the mechanism this lesson's recursive functions use to walk
    an edge list one element at a time.
  - `empty?` — true exactly when a sequence has no elements left; the base
    case test that stops every recursive walk here.
  - `or` — Boolean "either," short-circuiting: true the instant any
    argument is true; used both inside the reused `touches?` and directly
    inside this lesson's own new search function.
  - `=` — value equality; used to compare a vertex name against another,
    and to compare the numeric budget `k` against `0`.
  - `dec` — subtracts exactly `1` from a number; it exists here to spend
    one unit of the search budget `k` every time the search commits to
    including one more vertex.
  - `*` — ordinary numeric multiplication; used in this lesson's own
    doubling function to compute powers of two directly, without any
    external library call.
  - `println` — prints its arguments, space-separated, followed by a
    newline, to the real console; it exists so every claim in this lesson
    can be checked against an actual run rather than predicted by hand.
  - `def` — binds a name to a value once, at the top level; used to name
    the graph both this lesson and Lesson 266 share.
- **Objects and methods used**: None. This lesson's code calls no external
  class, interface, or interop method — every function is either restated
  from Lesson 266 or built fresh from ordinary Clojure forms, both covered
  under Terms, above.

---

## Concept Unit: A Search Bounded by `k`, Not by the Graph

### The Problem

Lesson 266's `min-cover-size` answers "what is the smallest vertex cover of
this graph?" by trying every one of the `2^n` possible subsets of the
graph's `n` vertices. That cost is measured entirely in `n` — the number
of vertices — and it explodes no matter how the graph is shaped. But that
is not the only honest way to measure the difficulty of an instance. Many
real graphs that show up in practice — a network needing only a handful of
monitoring points, a scheduling conflict graph with only a few genuinely
contested slots — have a *huge* number of vertices `n` but a *tiny*
minimum vertex cover `k`. The real question worth asking is not "how does
the cost grow with the size of the whole input," but "which specific
number, out of everything describing this input, is actually the one
driving the cost?" For vertex cover, that number does not have to be `n`
at all — it can be `k`, the size of the cover itself, and an algorithm can
be built whose cost is measured in `k` instead.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch addition,
  matching Section XII's standalone, `bb`-verified-per-lesson convention.
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

(defn vertex-cover-exists?
  [edges k]
  (cond
    (empty? edges) true
    (= k 0) false
    true (or (vertex-cover-exists? (remove-covered-edges (get (first edges) 0) edges) (dec k))
             (vertex-cover-exists? (remove-covered-edges (get (first edges) 1) edges) (dec k)))))
```

### The Updated Project

Skipped — brand-new, freestanding functions, no enclosing file to place
them inside.

### Mechanical Walkthrough

- `(defn touches? [vertex edge] (or (= vertex (get edge 0)) (= vertex (get edge 1))))`
  — restated here in full, unchanged from Lesson 266, per the Repetition
  Rule. `get edge 0` and `get edge 1` read an edge vector's two vertex
  slots by index; each `=` checks one of them against `vertex` for exact
  value equality; `or` combines the two checks, short-circuiting true the
  moment either one succeeds, so the whole expression asks "does this edge
  touch this vertex at either end" as one direct check.
- `(defn keep-edge [edge rest-result] (assoc rest-result (count rest-result) edge))`
  — also restated unchanged. `count rest-result` reads how many elements
  the vector currently holds; `assoc` returns a brand-new vector, identical
  to `rest-result` except with `edge` written at that count-index, which —
  since valid indices run only up to `count - 1` — extends the vector by
  one slot instead of overwriting anything already there.
- `(defn remove-covered-edges [vertex edges] (cond ...))` — restated
  unchanged: walks `edges` one at a time via `first`/`rest`, dropping any
  edge `touches?` reports as touching `vertex` and recursing on the rest,
  otherwise keeping it by recursing first and handing the result to
  `keep-edge`. `empty?` on `edges` is the base case that stops the walk.
- `(defn vertex-cover-exists? [edges k] (cond ...))` — the new function
  this Concept Unit exists to build, a **bounded search tree** searching
  for *any* vertex cover of size at most `k`, not the smallest one.
  - `(empty? edges) true` — if every edge is already covered, whatever
    vertices have been committed to so far (however many that turned out
    to be, tracked only implicitly by how much `k` has been spent) were
    enough; this branch of the search succeeds.
  - `(= k 0) false` — if the budget has run out — `k` has reached `0` —
    but `edges` is not empty (checked first, and failed, on the branch
    above), no more vertices can be added, so this branch of the search
    has failed. This is the base case that makes the search **bounded**:
    without it, the recursion below could keep trying to spend budget it
    does not have.
  - `true (or (vertex-cover-exists? (remove-covered-edges (get (first edges) 0) edges) (dec k)) (vertex-cover-exists? (remove-covered-edges (get (first edges) 1) edges) (dec k)))`
    — the fallback branch, and the actual search. `(first edges)` reads
    one real, uncovered edge — any edge works, since *some* vertex must
    eventually cover it, and every valid cover must include at least one
    of its two endpoints. `get (first edges) 0` and `get (first edges) 1`
    read that edge's two vertices, the same indexed read `touches?` uses.
    The search then tries both possibilities in turn: covering with the
    first vertex — `remove-covered-edges` strips out every edge that
    vertex now covers, and `dec k` spends one unit of budget for
    committing to it — or covering with the second vertex, computed the
    same way. `or` combines the two recursive attempts: true the moment
    *either* one eventually succeeds, without needing to fully explore the
    second branch if the first already found an answer. Because every
    single call spends exactly one unit of `k` and branches into exactly
    two further calls, the entire search tree has depth at most `k` and at
    most `2^k` leaves — not `2^n`. This is the whole mechanism: the
    branching factor is fixed at `2` regardless of how large the graph is,
    and the recursion's *depth*, the only thing controlling how many times
    that `2` gets multiplied by itself, is bounded by `k` alone.

### Run It

```
user=> (println "cover of size <= 3 exists?" (vertex-cover-exists? cycle-edges 3))
cover of size <= 3 exists? true
user=> (println "cover of size <= 2 exists?" (vertex-cover-exists? cycle-edges 2))
cover of size <= 2 exists? false
user=> (println "cover of size <= 4 exists?" (vertex-cover-exists? cycle-edges 4))
cover of size <= 4 exists? true
```

Real, `bb`-checked answers, and they line up exactly with Lesson 266's own
brute-force result: `min-cover-size` found the true minimum to be `3` —
and here, a budget of `3` succeeds, a budget of `2` genuinely fails, and a
looser budget of `4` still succeeds. `vertex-cover-exists?` only answers
the **decision problem** — yes or no for one specific `k` — not the
**optimization problem** `min-cover-size` answers directly. The minimum
itself can still be recovered from it, by calling it with `k = 0, 1, 2, ...`
in order and stopping at the first `k` that returns `true`; that smallest
successful `k` is the true minimum cover size, computed without ever
generating a single actual subset of vertices, the way `min-cover-size`
had to.

### CS Lens

Branching into a fixed number of choices at each step, with a budget
counter that forces the recursion to eventually stop, is a **bounded
search tree** — the exact same shape that underlies fixed-parameter
algorithms for many other `NP`-hard problems: Feedback Vertex Set (branch
on which vertex breaks a found cycle), 3-Hitting Set (branch on which
element of a found unhit triple to pick), and Cluster Editing (branch on
which edge of a found bad triangle to add or remove). In every case, the
same trick applies: find one small, unavoidable piece of structure the
solution must resolve, try every way of resolving it, and let a shrinking
budget bound how deep the branching can go.

### SE Lens

Choosing to solve the decision version, "does a cover of size `<= k`
exist," instead of jumping straight to the optimization version mirrors a
common real engineering pattern: build the cheaper, narrower primitive
first, and get the more general answer by calling that primitive
repeatedly, rather than building one large function that tries to do both
at once. The real cost is calling `vertex-cover-exists?` up to `k + 1`
times instead of once to find the true minimum — cheap compared to the
alternative of writing and separately maintaining a second, more
complicated function that tracks the actual minimum directly during a
single search.

---

## Concept Unit: The Parameter, Not the Input Size, Drives the Cost

### The Problem

`vertex-cover-exists?`'s search tree has at most `2^k` leaves — but *why*
does that matter more than `min-cover-size`'s `2^n`? Because `k` and `n`
are free to be completely different numbers. A graph can have an enormous
`n` while its true minimum vertex cover `k` stays small. Whether a
parameterized algorithm is actually *useful* comes down to a concrete
question: for realistic values of `k`, how much smaller is `2^k` than
`2^n` really — not as an abstract asymptotic claim, but as an actual,
computed number.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch addition,
  same reason as the Concept Unit above.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn power-of-two
  [n]
  (cond
    (= n 0) 1
    true (* 2 (power-of-two (dec n)))))
```

### The Updated Project

Skipped — a single brand-new, freestanding function.

### Mechanical Walkthrough

- `(defn power-of-two [n] (cond (= n 0) 1 true (* 2 (power-of-two (dec n)))))`
  — a small function computing `2^n` without reaching for any external
  math library. `(= n 0) 1` is the base case: `2^0` is `1` by definition,
  returned directly. The fallback branch, `(* 2 (power-of-two (dec n)))`,
  uses `*`, ordinary numeric multiplication, to double whatever
  `(power-of-two (dec n))` — one smaller call to this same function, using
  `dec` to subtract exactly `1` — comes back with. This is the ordinary
  recursive definition of exponentiation by repeated doubling: `2^n` is
  just `2` times `2^(n-1)`, all the way down to the base case.

### Run It — Real Numbers, Not an Asymptotic Claim

```
user=> (println "2^3 =" (power-of-two 3))
2^3 = 8
user=> (println "2^10 =" (power-of-two 10))
2^10 = 1024
user=> (println "2^40 =" (power-of-two 40))
2^40 = 1099511627776
user=> (println "2^60 =" (power-of-two 60))
2^60 = 1152921504606846976
```

Real, computed values. A graph whose true minimum vertex cover is `k = 3`
— the exact value this lesson's own `cycle-edges` graph has — costs at
most `2^3 = 8` leaves for `vertex-cover-exists?` to explore, *regardless
of how many vertices `n` that graph actually has*. A graph with `n = 40`
vertices costs `min-cover-size` up to `2^40`, over a trillion subsets, to
brute-force through — completely unusable, even though the *parameterized*
search on that same graph would still cost only `2^k` if its true cover
size happened to stay small. At `n = 60`, `min-cover-size`'s brute force
would be exploring over `10^18` subsets; `vertex-cover-exists?`, run with
whatever `k` that graph's real minimum happens to be, pays no penalty at
all for `n` growing that large — only for `k` growing. This is exactly
what **fixed-parameter tractable** names: the explosive part of the cost,
however bad it is, is a function of `k` alone, `f(k) = 2^k` here, entirely
decoupled from `n`.

### What Breaks Without This

The whole guarantee depends on one specific base case: `(= k 0) false`
when edges are still uncovered. Breaking it on purpose, by returning
`true` there instead of `false`:

```clojure
(defn broken-vertex-cover-exists?
  [edges k]
  (cond
    (empty? edges) true
    (= k 0) true
    true (or (broken-vertex-cover-exists? (remove-covered-edges (get (first edges) 0) edges) (dec k))
             (broken-vertex-cover-exists? (remove-covered-edges (get (first edges) 1) edges) (dec k)))))
```

```
user=> (println "BROKEN: cover of size <= 2 exists?" (broken-vertex-cover-exists? cycle-edges 2))
BROKEN: cover of size <= 2 exists? true
```

A real, `bb`-checked `true` — for a budget the correct version already
proved insufficient. Once the budget runs out, this broken version simply
gives up and claims success anyway, rather than reporting that the
remaining, still-uncovered edges made this branch a failure. Every claim
this lesson made about `k` — that `2` genuinely fails while `3` genuinely
succeeds, that the minimum really is `3` and not smaller — depended on the
search being able to honestly report failure when the budget was spent
and edges still remained; without that one branch, the function cannot
distinguish "a small cover truly exists" from "the search merely ran out
of budget," and the whole parameterized guarantee becomes meaningless.

---

## Connect the Pieces

Follow `cycle-edges`, the same 5-edge ring from Lesson 266, through both
functions built here: `vertex-cover-exists?` searches for a cover using a
budget of `3` and, by branching on real edges and spending that budget one
vertex at a time via `remove-covered-edges`, finds one — `true`. Run again
with a budget of `2`, the identical search now runs out of budget with
edges still uncovered and correctly reports `false`, agreeing exactly with
Lesson 266's own brute-force answer that `3` is this graph's true minimum.
`power-of-two` then turns the abstract claim "this search costs `2^k`, not
`2^n`" into real numbers: `8` for this exact graph's `k = 3`, against a
brute-force cost that would reach into the trillions for graphs no larger
than `40` vertices. Breaking the one base case that lets the search report
failure collapses the whole guarantee — the broken version claims a
too-small cover exists when Lesson 266's own trustworthy brute-force
answer already proved it does not.

## Exercises

1. Call `vertex-cover-exists?` on `cycle-edges` with `k = 1` and with
   `k = 0`. Do both come back `false`? Why must they, given the graph has
   5 edges and no single vertex touches all of them?
2. Using `vertex-cover-exists?` called with increasing values of `k`
   starting at `0`, find the smallest `k` for which it returns `true`.
   Does it match Lesson 266's `min-cover-size` result exactly?
3. `power-of-two` computes `2^n` by doubling `n` times. Trace, by hand,
   how many total recursive calls `(power-of-two 5)` makes before hitting
   its base case. How does that number compare to the *value* `2^5`
   returns?
4. Extend `cycle-edges` with two extra vertices connected only to each
   other (a disconnected edge, `["f" "g"]`, sharing no vertex with the
   rest of the graph). Recompute the true minimum with `vertex-cover-exists?`
   called at increasing `k`. Does the answer grow by exactly `1`? Why does
   a vertex cover need to handle every connected piece of a graph
   separately?

## Definition of Done

- [ ] `touches?`, `keep-edge`, and `remove-covered-edges` are restated and
      unchanged from Lesson 266.
- [ ] `vertex-cover-exists?` is defined and returns `true` for `k = 3`,
      `false` for `k = 2`, and `true` for `k = 4`, all against
      `cycle-edges`.
- [ ] `power-of-two` is defined and its output checked against real,
      printed values for `n = 3, 10, 40, 60`.
- [ ] `broken-vertex-cover-exists?` has been run for real, showing it
      incorrectly returns `true` for `k = 2`.
- [ ] `git commit -m "Add a bounded-search-tree FPT algorithm for Vertex Cover, showing cost scales with k, not with the graph's own size"`
