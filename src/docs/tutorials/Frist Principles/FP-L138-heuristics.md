# Lesson 138: Heuristics

**What you will build:** a **heuristic function** — a real, computable estimate of how far a state is from the goal — and **greedy best-first search**, a state-space search that always expands whichever frontier state its heuristic claims is closest to done, instead of expanding states in blind, undirected discovery order. Real, verified evidence this session: on an open `8×8` grid, searching from `(0,0)` to `(7,7)`, blind state-space search expands `63` of the grid's `64` real cells before finding the goal; heuristic-guided greedy best-first search finds the identical `14`-move shortest path while expanding only `14` real states — a direct, measured payoff from using known information about where the goal actually is. The same real code is then run on a small, deliberately constructed six-state graph with an **admissible** heuristic — one proven never to overestimate — and returns `4` moves when an independent brute-force search proves the true shortest path is `2` moves. The heuristic never lied; greedy best-first still got it wrong, because it never once looks at how much real distance a path has already covered. The transferable point: approximate knowledge can make search dramatically cheaper, but a search that trusts only the estimate and ignores real accumulated cost is not a safe general-purpose fix — a genuine limitation, not a bug, and the exact gap the next lesson's algorithm is built to close.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units — nothing here is a citation standing in for an explanation. The state-space search machinery, the implicit grid, and the heuristic-ordering pattern this lesson builds on originate in Lessons 135, 114, 116, and 105 respectively; those lesson numbers are named here only to place this lesson in the curriculum's sequence, not as a substitute for anything this lesson itself needs to say.

**Terms used in this lesson**

- **State** — a single, specific, comparable configuration of whatever problem is being searched. It exists to generalize "vertex" beyond a graph that was ever explicitly built — this lesson's own states are grid cells, `(row . column)` pairs, and, later, six arbitrary named positions in a small hand-built example. A state carries no memory of how it was reached; it is only ever compared for equality against another state, never inspected for history.
- **State-space search** — searching a graph whose states and legal moves between them are never stored anywhere, only computed on demand by a real `successors` function given one state at a time. It exists because most real search problems (a puzzle, a route, a plan) have far too many reachable configurations to list in advance; the search only ever needs to know, for whichever state it currently holds, what states are reachable from it in one move — never the whole shape of the problem at once.
- **Implicit graph** — a graph represented not by stored vertices and edges but by a real rule computing neighbors from a state's own structure. This lesson's grid is implicit: no list of the `64` cells or their connections is ever built; a cell's neighbors are computed fresh, every time, from its own row and column.
- **Frontier** — the set of states that have been discovered but not yet expanded, at any point during a search. Every search this lesson runs keeps exactly one frontier at a time; what differs, unit to unit, is only the *rule* governing which frontier member gets expanded next — first-discovered, in Concept Unit 1's blind search, or lowest-estimated-remaining-distance, from Concept Unit 3 onward.
- **Heuristic function** — a real, computable function `h(n)` that estimates, without doing any actual search, how much work remains to reach the goal from state `n`. It exists to give a search a real basis for *ordering* its choices — "which of these several discovered-but-unexpanded states looks most promising to try next" — using domain knowledge (in this lesson's case, straight-line distance on a grid) that the search algorithm itself has no other way to access.
- **Admissible heuristic** — a heuristic function that never overestimates the true remaining cost from any state to the goal: for every state `n`, `h(n) ≤` the real shortest remaining distance from `n`. It exists as a precise, checkable property separating a heuristic that is merely "a number" from one with a real mathematical guarantee attached to it — and, as this lesson's own Concept Unit 4 demonstrates with real, verified evidence, admissibility alone is not enough to guarantee a search using only `h(n)` finds the shortest path.
- **Informed search / uninformed (blind) search** — a search is *informed* when it uses a real heuristic function to choose which frontier state to expand next; it is *uninformed*, or *blind*, when it has no such estimate and can only fall back on structural properties of the search order itself (first-discovered, most-recently-discovered). Lesson 135's own `bfs-implicit`, reused unchanged in this lesson's Concept Unit 1, is uninformed — it has no notion of "closer to the goal" at all, only "discovered earlier." This lesson's own greedy best-first search, derived in Concept Unit 3, is this curriculum's first informed search.
- **Greedy best-first search** — a state-space search that maintains its frontier ordered by heuristic estimate rather than by discovery order, and always expands whichever frontier state currently has the smallest `h(n)`. It exists as the most direct possible way to put a heuristic function to use: trust the estimate completely, every single step.

**Objects and methods used**

- **`frontier-extract-min`**
  - *What it is:* this lesson's own procedure for finding and removing the entry with the smallest heuristic value from an unordered list of `(state . h-value)` pairs.
  - *Implementation:* takes one argument, `frontier`, a non-empty list of `(state . h-value)` pairs; scans every entry exactly once, tracking the smallest `h-value` seen so far and the pairs that were *not* the smallest; returns a single new pair, `(cons min-entry remaining-entries)` — the smallest entry, and every other entry, in one value. On a tie (two entries with equal `h-value`), the entry encountered *first* during the scan is kept as `best`, since the comparison `(< (cdr (car rest)) (cdr best))` is a strict less-than and does not replace `best` on an equal value.
  - *Its use:* the single mechanism, derived in Concept Unit 3, that makes greedy best-first search "greedy" at all — every other real difference between it and Lesson 135's blind `bfs-implicit` comes down to *which* structure decides expansion order, and this procedure is that structure for this lesson's search.
- **`greedy-best-first`**
  - *What it is:* this lesson's own state-space search procedure, derived in Concept Unit 3 as the minimal structural change to Lesson 135's own `bfs-implicit` needed to make expansion order track a heuristic estimate instead of discovery order.
  - *Implementation:* takes four arguments — `start` (a state), `goal?` (a one-argument predicate), `successors` (a one-argument procedure returning a list of states), and `heuristic` (a one-argument procedure returning a number) — and returns the real number of moves from `start` to the first state satisfying `goal?`, or `#f` if the frontier is exhausted first. Full body given real, complete treatment in Concept Unit 3 below.
  - *Its use:* every real search this lesson runs from Concept Unit 3 onward, on both the open grid and the small six-state counterexample graph in Concept Unit 4.

**Everything else in the file, not this lesson's own subject but still explained**

- **`bfs-implicit`**
  - *What it is:* a state-space search procedure that expands its frontier in strict order of discovery, using a real first-in-first-out queue, guaranteeing (Lesson 117's own proof, which this procedure inherits unchanged per Lesson 135's own argument) that the first time it discovers any state, that discovery happened at the state's true shortest distance from `start`.
  - *Implementation:* takes three arguments — `start`, `goal?`, and `successors` — identical in shape to `greedy-best-first`'s own first three parameters (no `heuristic` argument, since this search has no notion of one). Maintains two pieces of real, changing state as it runs: `dist`, an association list mapping every state discovered so far to its real distance from `start`, and `q`, a queue of states discovered but not yet expanded. Each iteration removes the front of `q`, checks whether that state satisfies `goal?` (returning its recorded distance immediately if so), and otherwise calls `successors` on it, adding every not-yet-seen result to both `dist` (at one more than the current state's own distance) and the back of `q`.

    ```scheme
    (define (bfs-implicit start goal? successors)
      (let ((dist (list (cons start 0))) (q (enqueue (make-queue) start)))
        (let loop ((q q))
          (if (queue-empty? q)
              #f
              (let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist))))
                (if (goal? v)
                    d
                    (let loop2 ((ns (successors v)) (q3 q2))
                      (if (null? ns)
                          (loop q3)
                          (if (assoc (car ns) dist)
                              (loop2 (cdr ns) q3)
                              (begin (set! dist (cons (cons (car ns) (+ d 1)) dist)) (loop2 (cdr ns) (enqueue q3 (car ns)))))))))))))
    ```

    Element by element: `(let ((dist ...) (q ...)) ...)` binds the search's own two pieces of real state before the loop begins; `(list (cons start 0))` builds a one-entry association list recording `start`'s own distance as `0` by definition; `(enqueue (make-queue) start)` builds a fresh empty queue and immediately adds `start` to it. `(let loop ((q q)) ...)` is a named-let, Scheme's own construct for writing a loop as a self-recursive local procedure — `loop` is both the loop's name and, inside its own body, a callable procedure that re-enters the loop with new argument values; calling `(loop q3)` does not return to any earlier point in the code textually, it *is* the next iteration. `(queue-empty? q)` checks whether both of the queue's own two internal lists are empty (its own full mechanism is given directly below); if so, the entire frontier has been exhausted with no goal found, and the search returns `#f`, Scheme's boolean false. `(let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist)))) ...)` is a sequential-binding let — each binding can see the ones before it — reading the front of the queue into `v`, computing the queue with that front removed into `q2`, and looking up `v`'s own already-recorded real distance into `d` via `(assoc v dist)`, which scans the association list for the first pair whose `car` equals `v` (using Scheme's `equal?`, since these states are cons pairs, not symbols or numbers), then `(cdr ...)` reads that pair's stored distance out. `(if (goal? v) d ...)` calls the caller-supplied predicate directly on the just-dequeued state; if it's the goal, the search stops immediately and returns `d`, the real, already-known distance — no further searching needed, since `d` is guaranteed (Lesson 117's proof) to already be the true shortest distance. Otherwise, `(let loop2 ((ns (successors v)) (q3 q2)) ...)` is a second named-let, nested inside the first, walking the list of `v`'s own real neighbors one at a time: `ns` starts as the full neighbor list from `(successors v)`, and `q3` starts as `q2`, threading the queue forward through this inner loop the same way `q` threads through the outer one. `(null? ns)` checks whether every neighbor has been processed; if so, `(loop q3)` re-enters the *outer* loop with the updated queue, continuing the search. Otherwise, `(assoc (car ns) dist)` checks whether the current neighbor, `(car ns)`, has already been discovered; if it has, nothing new is learned (its distance is already correctly recorded from an earlier, equally-short-or-shorter discovery), so `(loop2 (cdr ns) q3)` simply moves on to the next neighbor with no change. If it has *not* been seen, `(begin (set! dist ...) (loop2 (cdr ns) (enqueue q3 (car ns))))` does two real things in sequence — `begin` evaluates each of its sub-expressions in order, for effect, returning only the last one's value — first `(set! dist (cons (cons (car ns) (+ d 1)) dist))` mutates the outer `dist` variable, adding a new pair recording this neighbor's real distance as one more than `v`'s own, and then the inner loop continues with this same neighbor added to the back of the queue via `(enqueue q3 (car ns))`.
  - *Its use:* this lesson's own uninformed baseline in Concept Unit 1 — the exact same real correctness guarantee this curriculum has relied on since Lesson 117, applied here to measure, honestly, how much real work a search with no notion of "closer to the goal" has to do.
- **`make-queue` / `queue-empty?` / `enqueue` / `dequeue` / `queue-front`**
  - *What it is:* a small, real First-In-First-Out queue, built from two ordinary Scheme lists rather than any specialized data structure — the same general FIFO discipline a real Queue ADT guarantees, applied here to the specific job of tracking which states a blind search has discovered but not yet expanded.
  - *Implementation:* a queue is represented as a two-element list, `(front-list back-list)`. `(make-queue)` returns `(list '() '())`, two empty lists. `(queue-empty? q)` is true exactly when both `(car q)` and `(cadr q)` are the empty list `'()`. `(enqueue q x)` returns a new queue with `x` added to the *front* of the back-list — `(list (car q) (cons x (cadr q)))` — an `O(1)` operation regardless of how large the queue already is. `(dequeue q)` removes the queue's own real front element: if the front-list is non-empty, it simply drops that list's own first element, `(list (cdr (car q)) (cadr q))`; if the front-list is empty (every element currently sits in the back-list, added since the front-list was last refilled), it reverses the back-list into a fresh front-list — `(reverse (cadr q))` — which restores true insertion order, then removes that new front-list's own first element. `(queue-front q)` reads, without removing, whichever element `dequeue` would remove next, using the identical front-list-or-reversed-back-list logic.
  - *Its use:* the entire real mechanism `bfs-implicit` depends on to guarantee discovery order tracks true distance — every one of Lesson 117's own real, checked correctness claims rests on this exact FIFO discipline.
- **`grid-neighbors`**
  - *What it is:* a real, computed rule returning every valid neighboring cell of a given `(row, column)` position on a bounded square grid — this lesson's own concrete implicit graph.
  - *Implementation:* takes three arguments, `r`, `c`, and `size`; builds the four candidate neighbors — one row up, one row down, one column left, one column right — as a list of four `(row . column)` pairs, then filters that list down to only the candidates whose row and column both fall inside `[0, size)`.

    ```scheme
    (define (grid-neighbors r c size)
      (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size)))
              (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1)))))
    ```

    `(list (cons (- r 1) c) ...)` builds the four candidates directly, each one a `cons` pair pairing a row with a column — `(- r 1)` and `(+ r 1)` change the row by one while holding the column fixed; `(- c 1)` and `(+ c 1)` do the mirror operation on the column. `filter` is a Scheme procedure taking a one-argument predicate and a list, returning a new list containing only the elements for which the predicate returns true; here the predicate is an anonymous `lambda` checking, via `and` (true only if every one of its own sub-expressions is true), that a candidate's row is both `>= 0` and `< size`, and that its column is too — `and` short-circuits, stopping at the first false sub-expression, though this predicate has no side effects that would make the difference observable.
  - *Its use:* the one real source of "neighbor" information for every search this lesson runs on the grid — no grid is ever stored; every neighbor list is this exact real computation, run fresh, every time a state is expanded.

---

## Concept Unit 1: What Blind Search Doesn't Know

### The Problem

Lesson 135's own `bfs-implicit` is correct — Lesson 117's proof guarantees it always finds the true shortest path. But correctness says nothing about how much real work it does along the way. Searching an open `8×8` grid from one corner, `(0,0)`, to the opposite corner, `(7,7)`, `bfs-implicit` has no notion at all of *where* `(7,7)` is relative to any state it's currently holding — it only ever knows "this state was discovered before that one." It's worth measuring, honestly, exactly how much of the grid a search with no such notion ends up touching before it happens to reach the one cell that matters.

### No isolated lab for this step

This Concept Unit introduces no new language construct or syntax of its own — `bfs-implicit` and `grid-neighbors`, reused unchanged, already received full, real treatment in this lesson's own Header, above, and Concept Isolation labs exist to isolate a construct before its first real use, not to re-derive an already-fully-explained procedure's own mechanism a second time in the same lesson. This unit's own real content is the measurement itself, taken next.

### Reference Source

`bfs-implicit`, `make-queue`/`queue-empty?`/`enqueue`/`dequeue`/`queue-front` — Lesson 135 (`FP-L135-state-space-search.md`, Concept Unit 3, `statespace-check.scm`, lines 160–179), quoted unchanged, full mechanism given real treatment in this lesson's own Header, above. `grid-neighbors` — Lesson 114 (`FP-L114-graph-representations.md`, Concept Unit 4, lines 288–290), quoted unchanged, likewise given full treatment in this lesson's own Header.

### Files affected

Created: `heuristics-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define visited-count-blind 0)
(define (successors-blind v)
  (set! visited-count-blind (+ visited-count-blind 1))
  (grid-neighbors (car v) (cdr v) grid-size))
```

### The Updated Project

This is `heuristics-check.scm`, in full — Lesson 135's own `make-queue`/`queue-empty?`/`enqueue`/`dequeue`/`queue-front`/`bfs-implicit` and Lesson 114's own `grid-neighbors`, both quoted unchanged, with this unit's own grid setup and instrumented wrapper added on top:

```scheme
(define (make-queue) (list '() '()))
(define (queue-empty? q) (and (null? (car q)) (null? (cadr q))))
(define (enqueue q x) (list (car q) (cons x (cadr q))))
(define (dequeue q) (if (null? (car q)) (let ((f (reverse (cadr q)))) (list (cdr f) '())) (list (cdr (car q)) (cadr q))))
(define (queue-front q) (if (null? (car q)) (car (reverse (cadr q))) (car (car q))))

(define (bfs-implicit start goal? successors)
  (let ((dist (list (cons start 0))) (q (enqueue (make-queue) start)))
    (let loop ((q q))
      (if (queue-empty? q)
          #f
          (let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist))))
            (if (goal? v)
                d
                (let loop2 ((ns (successors v)) (q3 q2))
                  (if (null? ns)
                      (loop q3)
                      (if (assoc (car ns) dist)
                          (loop2 (cdr ns) q3)
                          (begin (set! dist (cons (cons (car ns) (+ d 1)) dist)) (loop2 (cdr ns) (enqueue q3 (car ns)))))))))))))

(define (grid-neighbors r c size)
  (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size)))
          (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1)))))

(define grid-size 8)                                                ; ← new
(define start (cons 0 0))                                              ; ← new
(define goal (cons 7 7))                                                  ; ← new

(define visited-count-blind 0)                                              ; ← new
(define (successors-blind v)                                                   ; ← new
  (set! visited-count-blind (+ visited-count-blind 1))                            ; ← new
  (grid-neighbors (car v) (cdr v) grid-size))                                        ; ← new

(display "=== CU1: blind state-space BFS, 8x8 open grid, (0,0) to (7,7) ===") (newline)
(display "moves to goal: ") (display (bfs-implicit start (lambda (v) (equal? v goal)) successors-blind)) (newline)
(display "real states expanded: ") (display visited-count-blind) (newline)
(display "total cells in grid: ") (display (* grid-size grid-size)) (newline)
```

The whole program now sets up an `8×8` implicit grid, runs Lesson 135's own uninformed `bfs-implicit` across it from one corner to the opposite one, and reports both the real move count and the real number of states the search actually had to expand along the way.

### Mechanical Walkthrough

- **`(define visited-count-blind 0)`** — first appearance, in this lesson, of a mutable top-level counter; `define` at the top level creates a new binding, here initialized to the number `0`, which later code will change in place via `set!` rather than replace by re-evaluating.
- **`(define (successors-blind v) ...)`** — first appearance in this lesson of `define`'s own procedure-defining shorthand: `(define (name arg) body)` is equivalent to `(define name (lambda (arg) body))`, creating a one-argument procedure bound to the name `successors-blind`.
- **`(set! visited-count-blind (+ visited-count-blind 1))`** — `set!` mutates an existing variable's stored value in place, unlike `define`, which introduces a new binding; here it reads the counter's current value, adds `1` via `+`, and stores the result back under the identical name, the exact real instrumentation technique this curriculum has used since Lesson 92 to count real operations without changing the procedure's own actual computation.
- **`(grid-neighbors (car v) (cdr v) grid-size)`** — calls `grid-neighbors`, given full treatment in this lesson's own Header above, passing `v`'s own row and column, read out via `car` and `cdr` (a `cons` pair's own two real accessors — `car` for the first element, `cdr` for the second), plus this lesson's own `grid-size`.
- **`(cons 0 0)` / `(cons 7 7)`** — `cons` builds a new pair from two values; here, each call builds a `(row . column)` state exactly as Lesson 114's own grid vertices were built — `start` at the grid's own `(0,0)` corner, `goal` at the opposite `(7,7)` corner, the two farthest-apart cells the grid has.
- **`(lambda (v) (equal? v goal))`** — an anonymous procedure, `bfs-implicit`'s own `goal?` argument; `equal?` compares two values for structural equality — here, whether a candidate state's own row and column both match `goal`'s — rather than `eq?`'s object-identity comparison, since two separately-built `cons` pairs holding the same numbers are `equal?` but not necessarily `eq?`.
- **The real, exact `14` moves, alongside the real, exact `63` states expanded out of the grid's own `64` total cells** — direct, measured confirmation that a search with no notion of where the goal actually sits ends up touching nearly the entire grid, `98%` of its real cells, to find a path that itself only needs `14` of them.

### CS Lens

This is Lesson 74's own worst/average/best-case discipline, applied here to a search algorithm's real *exploration footprint* rather than its comparison count: `bfs-implicit`'s own correctness (Lesson 117) never depended on how much of the search space it touched, only on the order it touched things in — but "correct" and "cheap" are genuinely different properties, and this unit measures the second one honestly rather than assuming a correct algorithm is automatically an efficient one for a specific real problem shape.

### SE Lens

The alternative to measuring this real gap is trusting, on faith, that a correct search algorithm is "good enough" for any real deployment. The real cost of that trust, made concrete here: a real routing or pathfinding system built on blind search alone would, on a large enough real map, expand something close to the *entire* map before ever finding a route to a specific known destination — real, wasted computation that grows directly with the size of the search space, not with the real length of the path actually needed.

### Run It — Show the Real Output

```
$ guile heuristics-check.scm
=== CU1: blind state-space BFS, 8x8 open grid, (0,0) to (7,7) ===
moves to goal: 14
real states expanded: 63
total cells in grid: 64
```

Verified this session — blind state-space search finds the real, correct `14`-move shortest path from `(0,0)` to `(7,7)`, but only after expanding `63` of the grid's `64` real cells, confirming this unit's own real concern: correctness alone says nothing about how much of the search space gets touched along the way.

---

## Concept Unit 2: The Heuristic Function

### The Problem

Concept Unit 1 measured a real cost. The fix requires the search to know something about where the goal actually is — not the true remaining distance (computing that would require already having solved the search), but a real, cheap-to-compute *estimate* of it, usable to prioritize which frontier state looks most worth trying next.

### Reference Source

No reference counterpart — a from-scratch application, to this lesson's own grid, of the two-point Manhattan-distance idea. Lesson 116's own formula (`FP-L116-breadth-first-search.md`, Concept Unit 4) computed `r + c`, the distance from a grid cell to the fixed origin `(0,0)` specifically — equivalent to `|r − 0| + |c − 0|`. This lesson generalizes that formula to the distance between any two arbitrary cells, since this lesson's own goal is not always the origin.

### Files affected

Modified: `heuristics-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 1 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (h-grid v) (+ (abs (- (car v) (car goal))) (abs (- (cdr v) (cdr goal)))))
```

### The Updated Project

This is `heuristics-check.scm`, with Concept Unit 1's own file extended by this unit's own heuristic function and a real, direct check of it:

```scheme
;; ... Concept Unit 1's code above, unchanged ...

(define (h-grid v) (+ (abs (- (car v) (car goal))) (abs (- (cdr v) (cdr goal))))) ; ← new

(display "=== CU2: heuristic function, checked at two real points ===") (newline)  ; ← new
(display "h-grid at start (0,0): ") (display (h-grid start)) (newline)               ; ← new
(display "h-grid at goal (7,7): ") (display (h-grid goal)) (newline)                    ; ← new
```

`h-grid` is this lesson's own heuristic function: given any grid state `v`, it returns the Manhattan distance from `v` to this lesson's own fixed `goal` — the real number of up/down/left/right grid moves that distance represents, ignoring any obstacles (this grid has none).

### Mechanical Walkthrough

- **`(define (h-grid v) ...)`** — first appearance, in this lesson, of a procedure defined specifically to compute a heuristic estimate — `h-grid` never searches anything; it only ever inspects `v`'s own coordinates and `goal`'s own fixed coordinates.
- **`(- (car v) (car goal))`** — subtracts `goal`'s own row from `v`'s own row, via `car`, giving a signed row difference — positive if `v` is below `goal`, negative if above.
- **`(abs ...)`** — first appearance in this lesson of `abs`, a real Scheme procedure returning a number's non-negative magnitude, discarding its sign; here it turns a signed row difference into an unsigned count of rows of separation, since "three rows above" and "three rows below" both represent the identical real distance.
- **`(+ (abs ...) (abs ...))`** — sums the unsigned row and column separations, giving the total number of single-step grid moves needed to align both coordinates — the real Manhattan-distance value.
- **The real, exact `14` at `start` and `0` at `goal`** — direct, checked confirmation that `h-grid` behaves exactly as its own definition claims: `h-grid`'s value at the goal itself is necessarily `0` (no distance left to close), and its value at `start`, `14`, exactly matches Concept Unit 1's own real, independently-measured shortest-path length — on this particular grid, with no obstacles anywhere, the heuristic's very first real check already turns out to be *exact*, not merely close.

### Reusing Manhattan Distance as an Estimate — the Isolated Lab

Lesson 116's own Manhattan-distance formula was used there as *ground truth*: a real, independently-derivable fact, checked directly against `bfs-implicit`'s own computed distances to confirm they matched exactly. This lesson's `h-grid`, right above, computes the identical arithmetic — but its *role* here is different: it's consulted *before* any real path is found, as a guess about what a real search will eventually confirm, not as an after-the-fact check against a real result already in hand. That distinction — an estimate consulted to guide a choice, versus a fact checked against an already-known answer — is worth isolating directly, on a domain with nothing to do with grids at all.

```scheme
(define target 10)
(define (h n) (abs (- target n)))
(define candidates (list 12 45 7 30))
(display "candidates: ") (display candidates) (newline)
(display "h estimates: ") (display (map h candidates)) (newline)
(display "sorted by h (closest to target first): ") (display (sort candidates (lambda (a b) (< (h a) (h b))))) (newline)
```

Run directly:

```
$ guile
candidates: (12 45 7 30)
h estimates: (2 35 3 20)
sorted by h (closest to target first): (12 7 30 45)
```

This is exactly what `h-grid` in the code above is doing, isolated to plain numbers instead of grid pairs: `target`, `10`, plays `goal`'s own role; `h`, `(abs (- target n))`, is the identical one-dimensional shape as `h-grid`'s own two-dimensional sum; and sorting the candidates by `h` rather than by their own raw value proves the point concretely — `12` is numerically *larger* than `7`, yet `12` sorts *first*, because `12` is only `2` away from the target while `7` is `3` away. This is called a **heuristic ordering**: choosing among options by an estimate of remaining distance to a goal, not by the options' own raw values. `map` is a real Scheme procedure applying a given one-argument procedure to every element of a list, returning a new list of the results in the same order — here, `h` applied to each of the four candidates. `sort` is Guile's own built-in sort, reused unchanged from Lesson 79, taking a list and a two-argument "comes before" predicate; here that predicate is `(lambda (a b) (< (h a) (h b)))`, comparing two candidates not by `<` on themselves but by `<` on their own `h` values — exactly how Concept Unit 3's real frontier will be ordered next.

This throwaway example is now discarded — `target`, `h`, and `candidates` never appear again in this lesson; `h-grid`, already shown above, is this lesson's own real, kept heuristic going forward.

### CS Lens

This is Lesson 68's own binary-search intuition, generalized: binary search uses a comparison to eliminate half the remaining possibilities without checking them; a heuristic function uses an estimate to *rank* the remaining possibilities without yet knowing which is truly best. Also recognized in: an online map application's real-time "estimated arrival" figure, updated continuously without recomputing the entire remaining route from scratch; a chess engine's static position evaluation, scoring a board without playing out every remaining possible game; a project manager's "T-shirt sizing" estimate for a task, useful for prioritizing work before any of it has actually been measured.

### SE Lens

The alternative to deriving a heuristic function at all is treating every frontier state as equally worth trying, exactly Concept Unit 1's own real behavior. The real cost of that alternative is precisely what Concept Unit 1 already measured: `63` real states expanded to find a `14`-move path. The real cost *of* using a heuristic, honestly stated up front rather than glossed over: `h-grid` is only as good as the real domain knowledge it encodes — this lesson's own grid has no obstacles, so Manhattan distance happens to be an exact preview of real remaining cost; Concept Unit 4 shows, with real, verified evidence, exactly what can go wrong when a heuristic's own local ranking and a path's own true remaining cost genuinely diverge.

### Run It — Show the Real Output

```
$ guile heuristics-check.scm
=== CU2: heuristic function, checked at two real points ===
h-grid at start (0,0): 14
h-grid at goal (7,7): 0
```

Verified this session — `h-grid` returns the real, exact Manhattan distance at both of this lesson's own fixed reference points, `14` at `start` and `0` at `goal`, confirming the formula behaves exactly as derived before it gets wired into a real search next.

---

## Concept Unit 3: Deriving Greedy Best-First Search

### The Problem

Concept Unit 2 built a real estimate. It needs to actually change how a search behaves — replacing `bfs-implicit`'s own discovery-order frontier with one ordered by `h-grid`'s own estimate, so the search can genuinely use the knowledge Concept Unit 2 gave it.

### Reference Source

No reference counterpart for `greedy-best-first` itself — a from-scratch derivation, structured as the minimal real change to `bfs-implicit` (this lesson's own Header, above) needed to swap discovery-order expansion for heuristic-order expansion. `frontier-extract-min`'s own real technique — linear-scan for the minimum of a real, unordered collection — is the identical idea Lesson 105's own `pq-min-index` (`FP-L105-priority-queues.md`, Concept Unit 4, lines 238–243) already used over a vector of plain numbers; this lesson adapts it to a plain list of `(state . h-value)` pairs, comparing each pair's own `cdr` rather than comparing raw vector elements directly, since this lesson's own priorities are attached to states, not numbers that are themselves the priority.

### Files affected

Modified: `heuristics-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — From FIFO Queue to Heuristic-Ordered Frontier

`bfs-implicit`'s own frontier, `q`, is a FIFO queue: `enqueue` always adds to the back, `dequeue`/`queue-front` always remove from the front, so expansion order is strictly discovery order, no comparison of the states themselves ever happens. A heuristic-ordered frontier needs the opposite discipline: every time a state is about to be expanded, the frontier must be searched for whichever currently-held state has the smallest `h` value — a real comparison Lesson 105's own naive priority-queue pattern already solved once, over plain numbers, and this lesson now adapts to `(state . h-value)` pairs.

### The New Code — Type It Yourself

```scheme
(define (frontier-extract-min frontier)
  (let loop ((rest (cdr frontier)) (best (car frontier)) (acc '()))
    (if (null? rest)
        (cons best acc)
        (if (< (cdr (car rest)) (cdr best))
            (loop (cdr rest) (car rest) (cons best acc))
            (loop (cdr rest) best (cons (car rest) acc))))))
```

### The Updated Project

This is `heuristics-check.scm`, with Concept Unit 2's own file extended by `frontier-extract-min` and this unit's own `greedy-best-first`:

```scheme
;; ... Concept Unit 1 and 2's code above, unchanged ...

(define (frontier-extract-min frontier)                              ; ← new
  (let loop ((rest (cdr frontier)) (best (car frontier)) (acc '()))     ; ← new
    (if (null? rest)                                                       ; ← new
        (cons best acc)                                                       ; ← new
        (if (< (cdr (car rest)) (cdr best))                                     ; ← new
            (loop (cdr rest) (car rest) (cons best acc))                           ; ← new
            (loop (cdr rest) best (cons (car rest) acc))))))                          ; ← new

(define (greedy-best-first start goal? successors heuristic)         ; ← new
  (let ((dist (list (cons start 0)))                                    ; ← new
        (frontier (list (cons start (heuristic start)))))                  ; ← new
    (let loop ((frontier frontier))                                           ; ← new
      (if (null? frontier)                                                       ; ← new
          #f                                                                        ; ← new
          (let* ((extracted (frontier-extract-min frontier))                          ; ← new
                 (v (car (car extracted)))                                               ; ← new
                 (frontier2 (cdr extracted))                                                ; ← new
                 (d (cdr (assoc v dist))))                                                     ; ← new
            (if (goal? v)                                                                         ; ← new
                d                                                                                    ; ← new
                (let loop2 ((ns (successors v)) (frontier3 frontier2))                                  ; ← new
                  (if (null? ns)                                                                           ; ← new
                      (loop frontier3)                                                                        ; ← new
                      (if (assoc (car ns) dist)                                                                  ; ← new
                          (loop2 (cdr ns) frontier3)                                                                ; ← new
                          (begin                                                                                      ; ← new
                            (set! dist (cons (cons (car ns) (+ d 1)) dist))                                              ; ← new
                            (loop2 (cdr ns) (cons (cons (car ns) (heuristic (car ns))) frontier3)))))))))))) ; ← new
```

`greedy-best-first` differs from `bfs-implicit`, quoted in full in this lesson's own Header above, in exactly the way Concept Unit 2 predicted: `frontier`, a list of `(state . h-value)` pairs, replaces `q`, a FIFO queue of bare states; `frontier-extract-min`, a real linear scan for the smallest `h-value`, replaces `queue-front`/`dequeue`'s own front-of-line lookup; and every newly-discovered state is paired with its own real `(heuristic state)` value before being added to the frontier, rather than simply appended.

### Mechanical Walkthrough

- **`(define (frontier-extract-min frontier) ...)`** — first appearance in this lesson of this specific procedure; takes one argument, a non-empty list of `(state . h-value)` pairs.
- **`(let loop ((rest (cdr frontier)) (best (car frontier)) (acc '())) ...)`** — a named-let (the identical Scheme construct `bfs-implicit`'s own outer loop used, given full treatment in this lesson's Header) carrying three real values forward each iteration: `rest`, the not-yet-examined tail of the frontier, starting at everything after the first entry; `best`, the smallest entry found so far, starting as the frontier's own first entry, `(car frontier)`; and `acc`, every entry confirmed *not* to be the minimum, starting empty.
- **`(null? rest)`** — checks whether every entry has been examined; `null?` is a real Scheme predicate returning true exactly for the empty list.
- **`(cons best acc)`** — once scanning is complete, builds the real return value: `best`, the true minimum entry, paired via `cons` with `acc`, every other entry, in one combined value the caller can destructure.
- **`(< (cdr (car rest)) (cdr best))`** — the one real comparison this procedure performs, once per entry: `(car rest)` reads the next unexamined pair, `(cdr ...)` reads its own `h-value` out of it; `(cdr best)` reads the current best's own `h-value`; `<` compares the two numbers directly.
- **`(loop (cdr rest) (car rest) (cons best acc))`** — taken when the current entry beats `best`: continues scanning the remaining tail, `(cdr rest)`, with the new best now `(car rest)`, and the *old* best moved into `acc` via `cons`, since it's now known not to be the true minimum.
- **`(loop (cdr rest) best (cons (car rest) acc))`** — taken when the current entry does *not* beat `best` (including on a tie, since the comparison above is strict `<`): `best` stays unchanged, and the current entry moves into `acc` instead.
- **`(define (greedy-best-first start goal? successors heuristic) ...)`** — first appearance in this lesson of this procedure; four arguments, one more than `bfs-implicit`'s own three, the added `heuristic` argument being the entire real difference in the two procedures' own contracts.
- **`(list (cons start (heuristic start)))`** — builds the frontier's own real starting point: a single-entry list pairing `start` with `start`'s own heuristic estimate, computed by calling the caller-supplied `heuristic` procedure directly.
- **`(let* ((extracted (frontier-extract-min frontier)) (v (car (car extracted))) (frontier2 (cdr extracted)) (d (cdr (assoc v dist)))) ...)`** — a sequential-binding `let*`, the same construct `bfs-implicit` used for its own front-of-queue read, adapted here: `extracted` holds `frontier-extract-min`'s own two-part result; `v`, the state about to be expanded, is read out via `(car (car extracted))` — the minimum entry's own `car`, since each frontier entry is itself a `(state . h-value)` pair; `frontier2` is every remaining entry; `d` is `v`'s own already-recorded real distance, looked up in `dist` exactly as `bfs-implicit` looked up its own current state's distance.
- **`(goal? v)` / `d`** — identical in shape and purpose to `bfs-implicit`'s own goal check: if `v` satisfies the caller's goal predicate, the search stops and returns `v`'s own real, already-recorded distance.
- **`(let loop2 ((ns (successors v)) (frontier3 frontier2)) ...)`** — a second named-let, walking `v`'s own real neighbors one at a time, in the identical structural role as `bfs-implicit`'s own `loop2` — only the name of the threaded collection, `frontier3` instead of `q3`, differs.
- **`(assoc (car ns) dist)`** — checks whether the current neighbor has already been discovered, the identical already-visited check `bfs-implicit` performs; a state discovered once by *any* search in this lesson never gets a second, possibly-worse distance recorded over it.
- **`(cons (cons (car ns) (heuristic (car ns))) frontier3)`** — the one real place this procedure's own behavior diverges from `bfs-implicit`'s: instead of `(enqueue q3 (car ns))`, appending the bare new state to a FIFO queue, this pairs the new state with its own real `(heuristic (car ns))` value before adding it to the frontier — the exact real information `frontier-extract-min` will later need to decide expansion order.
- **The real, exact `4` moves on the small `3×3` grid, and the real, exact `14` moves — matching Concept Unit 1's own real answer exactly — on the identical `8×8` grid, found while expanding only `14` states instead of Concept Unit 1's own `63`** — direct, measured confirmation that ordering the frontier by heuristic estimate, rather than discovery order, finds the identical correct answer at a fraction of the real cost, on this obstacle-free grid.

### Execution Trace — the Small 3×3 Grid, Corner to Corner

`greedy-best-first`, run with `start = (0,0)`, `goal = (2,2)`, `successors` computing real neighbors on a `3×3` grid, and `heuristic` the identical Manhattan-distance idea as `h-grid`, applied to `(2,2)` instead of `(7,7)`:

1. `(loop ((0 . 0) . 4))` — the frontier holds exactly one entry, `start` itself, paired with its own real heuristic value, `4` (two rows plus two columns of separation from `(2,2)`). `frontier-extract-min` has only one entry to return, so `(0 . 0)` is popped; it is not the goal, so its real neighbors, `(0 . 1)` and `(1 . 0)`, both newly discovered, are added with their own real `h` values, `3` each.
2. `(loop ((0 . 1) . 3) ((1 . 0) . 3))` — both frontier entries currently tie at `h = 3`; `frontier-extract-min`'s own strict `<` comparison keeps whichever was encountered *first* during its scan as `best`, so `(0 . 1)` — the entry already at the front of the list — is popped, not `(1 . 0)`, even though either would have been an equally valid next step toward the goal. Its own real neighbors are `(0 . 0)` (already discovered — skipped) and `(0 . 2)`/`(1 . 1)` (newly discovered, `h = 2` each).
3. `(loop ((0 . 2) . 2) ((1 . 1) . 2) ((1 . 0) . 3))` — `(0 . 2)`, encountered first among the two current `h = 2` ties, is popped. Its real neighbors are `(0 . 1)` (already discovered) and `(1 . 2)` (newly discovered, `h = 1`).
4. `(loop ((1 . 2) . 1) ((1 . 0) . 3) ((1 . 1) . 2))` — `(1 . 2)`, the only entry with `h = 1`, is popped without any tie to resolve. Its own real neighbor `(2 . 2)` — the goal itself — is newly discovered, `h = 0`.
5. `(loop ((2 . 2) . 0) ((1 . 1) . 2) ((1 . 0) . 3))` — `(2 . 2)` has the smallest `h` value in the entire frontier, `0`, so it is popped next; `(goal? (2 . 2))` is true, and the search returns `(2 . 2)`'s own real recorded distance, `4` — the true shortest path length on this obstacle-free `3×3` grid, confirmed by this lesson's own real, traced run.

Every real value in this trace — the frontier's own contents, which entry gets popped, and why on a tie — comes directly from running this unit's own `greedy-best-first` and `frontier-extract-min`, this session, with real, printed intermediate state at every step, not a hand-simulated approximation.

### CS Lens

This is Lesson 78's own divide-and-conquer template-recognition move, applied a second time to search itself, the same way Lesson 135 recognized state-space search as one level more general than a literal graph: `bfs-implicit` and `greedy-best-first` are not two unrelated algorithms — they are the identical real skeleton (discover, check goal, expand neighbors, track distance) with exactly one real decision, "which frontier member goes next," swapped out. Also recognized in: a hospital triage system routing patients by estimated severity instead of arrival order; a customer-support queue re-ordered by a support agent's own quick guess at how long each ticket will take, rather than strictly first-come-first-served.

### SE Lens

The alternative to deriving `greedy-best-first` as a minimal, traceable modification of `bfs-implicit` is writing an entirely new, unrelated search procedure from scratch. The real value of deriving it as a modification, the same real discipline Lesson 116 applied when deriving `bfs` from Lesson 115's own `explore`: it makes visible, precisely, that *one* real change — which structure decides expansion order — is responsible for the entire measured gap between `63` states and `14`, rather than leaving a reader to wonder whether some other, unstated difference between the two procedures is actually doing the work.

### Run It — Show the Real Output

```
$ guile heuristics-check.scm
=== CU3 (small, hand-traceable): 3x3 grid, (0,0) to (2,2) ===
moves: 4

=== CU3: greedy best-first, identical 8x8 grid as CU1 ===
moves to goal: 14
real states expanded: 14
```

Verified this session — greedy best-first search finds the real, correct `4`-move path on the small `3×3` grid, exactly matching the execution trace above, and the real, correct `14`-move path on the identical `8×8` grid Concept Unit 1 searched — while expanding only `14` real states, against Concept Unit 1's own real, measured `63`.

---

## Concept Unit 4: The Honest Limit — Greedy Best-First Is Not Optimal

### The Problem

Concept Unit 3 showed a real, dramatic win: heuristic guidance found the identical correct path while touching a small fraction of the states blind search needed. It's worth checking, honestly, whether that win is a general guarantee or something this particular obstacle-free grid happened to make possible — using a small, deliberately constructed example, the same real technique Lesson 126 used to expose Dijkstra's own hidden assumption about negative edges.

### Reference Source

No reference counterpart — a small, from-scratch counterexample graph, built specifically to test whether `greedy-best-first`, reused unchanged from Concept Unit 3, always finds the true shortest path even when its own heuristic is real and admissible.

### Files affected

Modified: `heuristics-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### Applying It — Building a Heuristic That Never Overestimates, and Still Fails

Six states: `s` (start), `a`, `b`, `c`, `d`, `g` (goal). Two real routes from `s` to `g`: a short one, `s → a → g`, `2` real moves, and a long one, `s → b → c → d → g`, `4` real moves. The heuristic assigned to each state is chosen to be **admissible** — never overestimating that state's own true remaining distance — and checked, state by state, against the real true remaining distance computed directly from the graph's own structure:

| State | `h(n)` | True remaining distance | Admissible? |
|---|---|---|---|
| `s` | `2` | `2` (via `a`) | yes, tight |
| `a` | `1` | `1` (`a → g`) | yes, tight |
| `b` | `0` | `3` (`b → c → d → g`) | yes, `0 ≤ 3` |
| `c` | `0` | `2` (`c → d → g`) | yes, `0 ≤ 2` |
| `d` | `0` | `1` (`d → g`) | yes, `0 ≤ 1` |
| `g` | `0` | `0` | yes |

Every single entry satisfies admissibility. `b`, `c`, and `d` are simply given an *uninformative* heuristic — `0` everywhere, never claiming to know anything — which is honest, not wrong: a heuristic is allowed to underestimate freely; admissibility only forbids overestimating.

### The New Code — Type It Yourself

```scheme
(define (successors-ex v)
  (cond ((eq? v 's) (list 'a 'b))
        ((eq? v 'a) (list 'g))
        ((eq? v 'b) (list 'c))
        ((eq? v 'c) (list 'd))
        ((eq? v 'd) (list 'g))
        (else '())))
(define (h-ex v)
  (cond ((eq? v 's) 2) ((eq? v 'a) 1) ((eq? v 'b) 0)
        ((eq? v 'c) 0) ((eq? v 'd) 0) ((eq? v 'g) 0) (else 999)))
```

### The Updated Project

This is `heuristics-check.scm`, with Concept Unit 3's own file extended by this small counterexample graph and a real, independent brute-force check:

```scheme
;; ... Concept Unit 1, 2, and 3's code above, unchanged ...

(define (successors-ex v)                                            ; ← new
  (cond ((eq? v 's) (list 'a 'b))                                       ; ← new
        ((eq? v 'a) (list 'g))                                             ; ← new
        ((eq? v 'b) (list 'c))                                                ; ← new
        ((eq? v 'c) (list 'd))                                                   ; ← new
        ((eq? v 'd) (list 'g))                                                      ; ← new
        (else '())))                                                                   ; ← new
(define (h-ex v)                                                     ; ← new
  (cond ((eq? v 's) 2) ((eq? v 'a) 1) ((eq? v 'b) 0)                    ; ← new
        ((eq? v 'c) 0) ((eq? v 'd) 0) ((eq? v 'g) 0) (else 999)))          ; ← new

(display "=== CU4: greedy best-first with an admissible heuristic, real counterexample ===") (newline) ; ← new
(display "greedy best-first moves S to G: ") (display (greedy-best-first 's (lambda (v) (eq? v 'g)) successors-ex h-ex)) (newline) ; ← new

(define best #f)                                                        ; ← new
(define (brute-search state depth)                                         ; ← new
  (cond ((eq? state 'g) (if (or (not best) (< depth best)) (set! best depth))) ; ← new
        ((>= depth 6) 'stop)                                                      ; ← new
        (else (for-each (lambda (n) (brute-search n (+ depth 1))) (successors-ex state))))) ; ← new
(brute-search 's 0)                                                          ; ← new
(display "brute-force true shortest S to G: ") (display best) (newline)        ; ← new
```

### Mechanical Walkthrough

- **`(define (successors-ex v) ...)`** — first appearance in this lesson of a hand-built, non-grid `successors` function, satisfying the identical real contract every earlier search in this lesson has used: one state in, a list of directly-reachable states out.
- **`(cond ((eq? v 's) (list 'a 'b)) ...)`** — `cond` is Scheme's own multi-branch conditional, trying each clause's own test in order and evaluating the body of the first one that's true; `eq?` compares two values for object identity — here, whether `v` is the literal symbol `'s`, `'a`, and so on — the correct, basic comparison for symbols, distinct from `equal?`'s own structural comparison used earlier in this lesson for `cons`-pair states.
- **`(else '())`** — `cond`'s own catch-all final clause, matched only if every earlier test failed; `'()`, the empty list, correctly represents "no real successors" for `g`, the graph's own dead end.
- **`(define (h-ex v) ...)`** — first appearance in this lesson of a hand-authored heuristic function returning fixed, deliberately chosen values rather than a computed formula — the real admissibility table above, translated directly into code.
- **`(greedy-best-first 's (lambda (v) (eq? v 'g)) successors-ex h-ex)`** — the identical `greedy-best-first`, given full treatment in Concept Unit 3, reused completely unchanged; only the four real arguments — the start state, the goal predicate (now comparing symbols via `eq?` rather than pairs via `equal?`), and this unit's own new `successors-ex`/`h-ex` — differ from Concept Unit 3's own grid-based call.
- **`(define best #f)`** — a mutable top-level variable, initialized to Scheme's boolean false, tracking the smallest real depth at which `'g'` has been found so far during the brute-force check.
- **`(define (brute-search state depth) ...)`** — a real, independent search, sharing no code at all with `greedy-best-first`, built specifically to verify this unit's own real claim from the outside; `for-each` is a real Scheme procedure, structurally identical to `map` but discarding its own results, calling a given one-argument procedure once per list element purely for effect — here, recursing into every one of `state`'s own real successors.
- **`(if (or (not best) (< depth best)) (set! best depth))`** — `or` is true if either of its own sub-expressions is true; `(not best)` is true exactly the first time `'g'` is ever found, when `best` is still `#f`; `(< depth best)` catches every later discovery at a real, strictly shorter depth. Either condition triggers `(set! best depth)`, recording the smaller value.
- **The real, exact `4` from `greedy-best-first`, against the real, exact `2` from the independent `brute-search`** — direct, measured confirmation that greedy best-first search, using a real, checked, admissible heuristic, still returns a real path *twice* as long as the true shortest one.

### Execution Trace — Watching the True Shortcut Get Starved

1. `(loop ((s . 2)))` — the frontier holds only `s` itself, `h = 2`. Popped (only entry); not the goal. Its real successors, `a` (`h = 1`) and `b` (`h = 0`), are both newly discovered.
2. `(loop ((b . 0) (a . 1)))` — `b`, with the smaller `h` value, `0`, is popped ahead of `a`, whose own `h` is `1` — exactly the ranking `h-ex`'s own table specifies, and, on its own, a completely reasonable choice: nothing about `h = 0` versus `h = 1` reveals that `b`'s real remaining distance, `3`, is actually *worse* than `a`'s, `1`. `b`'s real successor `c`, `h = 0`, is newly discovered; `a` — a real, `1`-move-from-done state — stays in the frontier, untouched.
3. `(loop ((c . 0) (a . 1)))` — `c`, the only `h = 0` entry, is popped. Its real successor `d`, `h = 0`, is newly discovered. `a` still waits, still real, still `1` move from the goal.
4. `(loop ((d . 0) (a . 1)))` — `d` is popped. Its real successor, `g` itself, `h = 0`, is newly discovered.
5. `(loop ((g . 0) (a . 1)))` — `g` now has the smallest `h` value in the entire frontier, `0`, tied with nothing (`a`'s own `h` is `1`), so `g` is popped; `(goal? g)` is true, and the search returns `g`'s own real recorded distance, `4` — reached via `s → b → c → d → g`, the long route. `a`, sitting in the frontier the entire time with a real, correctly-admissible `h = 1`, and representing an actual `2`-move path to the goal, was never popped at all — every one of `b`, `c`, and `d`'s own `h = 0` values kept looking more attractive, step after step, right up until the goal itself was reached the long way.

The failure is not that `h-ex` lied — every single value in this lesson's own admissibility table, above, is real and checked. The failure is structural: `greedy-best-first` never once asks how many real moves it has *already* spent reaching a frontier state, only how good that state's own heuristic estimate of what's *left* looks. `a`'s own real cost-so-far, `1`, was exactly as cheap as `b`'s, but nothing in this search ever compares the two.

### CS Lens

This is the identical real technique Lesson 126 used to expose Dijkstra's own hidden assumption about negative edges: a small, deliberately constructed graph, checked by an independent brute-force search, rather than an abstract argument alone. Also recognized in: any purely reputation-ranked recommendation system that never checks how much a user has already invested in an in-progress option before suggesting a "better-looking" fresh one; a hiring process that ranks candidates purely on interview-day impression, with no real weight given to a candidate's already-demonstrated, harder-to-fake track record.

### SE Lens

The alternative to building and checking this real counterexample is trusting that "using a real, admissible heuristic" is, by itself, enough to guarantee correctness — a real, common misconception this unit's own evidence directly refutes: admissibility is a property of the *heuristic*, and this lesson's own `h-ex` genuinely has it, checked directly in the table above. The real, measured failure comes from `greedy-best-first`'s own *algorithm*, which was never designed to weigh real accumulated cost against estimated remaining cost — a genuinely different, additional property a search would need. That gap is exactly what the next lesson's algorithm, A*, is built to close: combining a state's own real cost-so-far with its heuristic estimate, rather than trusting the estimate alone.

### Run It — Show the Real Output

```
$ guile heuristics-check.scm
=== CU4: greedy best-first with an admissible heuristic, real counterexample ===
greedy best-first moves S to G: 4
brute-force true shortest S to G: 2
```

Verified this session — `greedy-best-first`, run with a real, checked-admissible heuristic, returns `4`, while an independent, from-scratch brute-force search confirms the true shortest path is `2` — direct, real evidence that an admissible heuristic alone does not make greedy best-first search optimal.

---

## Closing

### Connect the pieces

One grid, one small counterexample graph, one real, honest lesson in two parts:

1. **The real cost of knowing nothing (Unit 1):** blind state-space search, reused unchanged from Lesson 135, expands `63` of `64` real grid cells to find a `14`-move path.
2. **A real heuristic, derived and checked (Unit 2):** `h-grid`, generalizing Lesson 116's own origin-only Manhattan formula to any two points, checked at two real reference values before ever being used for search.
3. **Greedy best-first search, derived and measured (Unit 3):** the identical `14`-move answer, found while expanding only `14` states — a real, dramatic win, traced by hand on a small grid first.
4. **The honest limit (Unit 4):** the identical real algorithm, given a real, checked-admissible heuristic, returns `4` moves on a small graph whose true shortest path, confirmed independently, is `2` — because it never once weighs real cost already spent.

Every claim in this lesson traces to real, executed code: a direct, measured comparison against Lesson 135's own uninformed baseline, and a small, real counterexample checked against an independent brute-force search, in the same spirit as Lesson 126's own real evidence against Dijkstra.

### What breaks without this

Suppose a real trip-planning system used greedy best-first search, ranking routes purely by straight-line distance remaining to a destination, the way Concept Unit 3's own real win might tempt a system designer to trust completely. Concept Unit 4's own real evidence shows precisely what could go wrong: a route already most of the way to the destination, but whose *next* visible step happens to look slightly farther away in a straight line, could be passed over indefinitely in favor of a route that keeps looking marginally closer, step after step, while actually taking twice as long in real distance travelled. The heuristic itself would never be at fault — exactly as `h-ex`, above, is genuinely admissible — the algorithm's own refusal to ever weigh real distance already covered is the actual, structural gap.

### Exercises

1. **Observe.** Before checking, predict what real move count `greedy-best-first` would return if Concept Unit 4's own `h-ex` assigned `a` a value of `0` instead of `1` (still admissible, since `0 ≤ 1`), using this lesson's own execution trace to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — a modified `h-ex`, run against the unchanged `greedy-best-first` and `successors-ex`.
3. **Formalize.** Build a second small counterexample graph of your own design, with a heuristic you check for admissibility by hand before running it, and confirm with real code whether `greedy-best-first` finds the true shortest path — check your own real result against an independent brute-force search, the same discipline this lesson's own Concept Unit 4 used.
4. **Explain.** In your own words, explain why `frontier-extract-min`'s own tie-breaking rule — keep the first-encountered entry on an exact tie — has no effect on Concept Unit 4's own real result, referencing which specific step in the execution trace would need an actual tie in `h` values for the rule to matter at all.
5. **Explain.** Using this lesson's own real numbers, explain why Concept Unit 1's blind `bfs-implicit`, run on the identical Concept Unit 4 graph, would be guaranteed to find the real, true `2`-move answer — referencing Lesson 117's own proof and what, specifically, that proof does that `greedy-best-first` does not.

### Definition of done

- [ ] You can state the definition of a heuristic function and of admissibility, and explain why the two are different properties.
- [ ] You can point to this lesson's own real numbers — `63` versus `14` states expanded on the open grid, and `4` versus `2` real moves on the small counterexample graph — as direct, checked evidence for both heuristic search's real payoff and its real limitation.
- [ ] You can explain, in your own words, exactly why `greedy-best-first` returned a wrong answer on Concept Unit 4's graph despite a genuinely admissible heuristic — specifically, what real information the algorithm never consults.
- [ ] You completed Exercises 1–5, including a real, self-designed counterexample checked against independent brute force.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
