# Lesson 145: Algorithm Design Through Representation

**What you will build:** a real, checkable decision procedure for choosing which of this Era's own search algorithms actually fits a new, real problem — applied to a real, concrete case this curriculum has never seen before: a delivery robot on a real `5×5` grid where some real cells (mud) cost `5` real time-units to cross and others (road) cost `1`, needing the real *minimum-time* route from one corner to the opposite one, not the fewest real hops. Real, verified evidence this session: a real, weighted extension of Lesson 139's own `astar-search`, using the real, admissible Manhattan-distance heuristic this curriculum has relied on since Lesson 138, finds a real route costing exactly `8` real time-units — confirmed, independently, by a real, exhaustive brute-force check over every real monotonic path the grid admits, the identical real discipline Lesson 81 used to confirm a lower bound by trying every real permutation. Lesson 135's own plain, unweighted `bfs-implicit`, reused completely unchanged and given the identical real grid, finds a real path with the identical `8` real hops — and a real total cost of `20`, two and a half times worse, because it has no real notion that some hops cost more than others. The transferable point: every lesson in this Era, 113 through 144, handed its own reader an already-chosen real representation — a graph, a heuristic, a game tree — and this lesson's own real evidence shows precisely what's at stake in that choice: the identical real grid, the identical real start and goal, produces a real, measurably worse answer the moment the wrong algorithm is reached for, not because the algorithm is broken, but because it was never designed to notice the real fact that mattered.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 139's own real `astar-search` and Lesson 135's own real `bfs-implicit` — both explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **State** — a single, specific, comparable configuration of whatever problem is being searched; in this lesson's own problem, a real `(row . column)` grid cell.
- **Heuristic function** — a real, computable function estimating, without doing any actual search, how much work remains to reach the goal from a given state.
- **Admissible heuristic** — a heuristic function that never overestimates the true remaining cost from any state to the goal.
- **Cost so far, `g(n)`** — the real, exact accumulated cost a search has actually spent reaching state `n` along the specific path it discovered `n` by.
- **Edge cost** — the real, specific cost of a single move from one state to a real, adjacent one. It exists to distinguish problems where every move costs the identical real amount (Lesson 116 and 135's own unweighted graphs) from problems, like this lesson's own, where moving into different real states costs genuinely different real amounts.
- **Representation decision** — the real, upfront choice of how to model a new problem as a state, a real successors function, and, where relevant, a real edge-cost function and a real heuristic — made *before* choosing which of this Era's own algorithms to apply, since that choice is what determines which algorithms even produce a correct real answer at all.

**Objects and methods used**

- **`astar-weighted`**
  - *What it is:* this lesson's own real extension of `astar-search`, accepting a real, per-move edge-cost function instead of assuming every move costs exactly `1`.
  - *Implementation:* given full real treatment in Concept Unit 3 below.
  - *Its use:* every real search this lesson runs from Concept Unit 3 onward.
- **`astar-search`**
  - *What it is:* Lesson 139's own real search procedure, ordering its frontier by `f(n) = g(n) + h(n)`.
  - *Implementation:* `(define (astar-search start goal? successors heuristic) (let ((dist (list (cons start 0))) (frontier (list (cons start (heuristic start))))) (let loop ((frontier frontier)) (if (null? frontier) #f (let* ((extracted (frontier-extract-min frontier)) (v (car (car extracted))) (frontier2 (cdr extracted)) (d (cdr (assoc v dist)))) (if (goal? v) d (let loop2 ((ns (successors v)) (frontier3 frontier2)) (if (null? ns) (loop frontier3) (if (assoc (car ns) dist) (loop2 (cdr ns) frontier3) (let* ((g-new (+ d 1)) (f-new (+ g-new (heuristic (car ns))))) (begin (set! dist (cons (cons (car ns) g-new) dist)) (loop2 (cdr ns) (cons (cons (car ns) f-new) frontier3))))))))))))`.
  - *Its use:* the real, direct basis for this lesson's own `astar-weighted`, changed in exactly one real place.
- **`bfs-implicit`** / **`make-queue`, `queue-empty?`, `enqueue`, `dequeue`, `queue-front`**
  - *What it is:* Lesson 135's own uninformed, unweighted state-space search.
  - *Implementation:* a queue is two ordinary lists; `bfs-implicit` maintains a real distance table and this queue, expanding the front state and recording each newly-discovered neighbor at one more than the current state's own real distance.

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
    ```

  - *Its use:* this lesson's own real, deliberately naive baseline in Concept Unit 4, applied without modification to a problem it was never designed to solve correctly.
- **`grid-neighbors`**
  - *What it is:* a real, computed rule returning every valid neighboring cell of a given `(row, column)` position on a bounded square grid.
  - *Implementation:* `(define (grid-neighbors r c size) (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size))) (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1)))))`.
  - *Its use:* the one real source of "neighbor" information for every search in this lesson.

---

## Concept Unit 1: A Real Problem With No Representation Chosen Yet

### The Problem

Every one of this Era's own lessons handed its own reader an already-built representation: Lesson 116's own grid, Lesson 138's own heuristic, Lesson 141's own game state. A real, new problem, though, doesn't come that way. A delivery robot sits at the corner of a real `5×5` region. Most of that region is real road, costing `1` real time-unit to cross; a real strip of mud, three cells long, costs `5` real time-units per cell instead. The robot needs the real fastest route to the opposite corner — not the fewest real turns, the real least total time. Nothing about this description says "use `astar-search`" or "use `bfs-implicit`" — that real choice has to be made, and made correctly, before any of this Era's own real code can be trusted to answer it.

### No isolated lab for this step

This unit introduces no new construct — the real problem is posed directly here, deliberately without naming any algorithm, so Concept Unit 2's own real decision procedure has something concrete to be applied to.

### Reference Source

No reference counterpart — a new, real problem, posed directly for this lesson's own capstone purposes.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Naming What's Actually Given

Stripped of any hint about which algorithm to use, this real problem gives exactly three real facts: a state space (real grid cells), a real cost that genuinely varies by which cell is entered, and no second real decision-maker of any kind — just one robot, one real objective.

### Walkthrough

- **The deliberate absence of any algorithm name in the problem statement itself** — mirrors how a real problem actually arrives, in contrast to every earlier lesson in this Era, which opened already knowing its own subject.
- **The three real, named facts extracted from the problem** — exactly the real inputs Concept Unit 2's own decision procedure needs.

### CS Lens

This is Lesson 111's own choosing-structures decision procedure, recognized in a new setting: there, Lesson 111 asked which *data structure* fit a set of real required operations; this lesson asks the identical style of question one level up, about which *algorithm*, from this Era's own real toolbox, fits a set of real problem properties.

### SE Lens

The alternative to a real, explicit decision procedure is picking whichever algorithm from this Era happens to be freshest in memory — likely `astar-search`, the most recently built — and hoping it applies. The real risk of that alternative, made concrete in Concept Unit 4: a plausible-sounding but wrong real choice can produce a real answer that looks completely legitimate (a real, valid path, a real, specific number) while being measurably, provably worse than the real answer a correctly-chosen algorithm would have found.

---

## Concept Unit 2: A Real Decision Procedure

### The Problem

Concept Unit 1 named three real facts. They need turning into a real, checkable sequence of questions, each one ruling in or ruling out specific real algorithms from this Era's own toolbox, until exactly one real choice remains.

### Reference Source

No reference counterpart — a from-scratch real decision procedure, built directly from real evidence already established across this Era's own earlier lessons, each one cited by its own real, specific finding.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Three Real Questions, Applied in Order

**Question one: is there a real adversary, a second decision-maker with a genuinely opposing objective?** This lesson's own robot has none — no real opponent chooses any of its own moves. This real fact rules out the entire game-search family, `minimax` and alpha-beta pruning (Lessons 142 and 143), both built specifically around a real, opposing second player.

**Question two: does every real move cost the identical amount, or does cost genuinely vary?** This lesson's own problem has real, varying cost — mud costs `5`, road costs `1`. This real fact rules out plain, unweighted search, `bfs-implicit` (Lessons 135 and 116): Lesson 117's own real proof that BFS discovers every state at its own true shortest distance depends entirely on every real move costing the identical amount; Lesson 123's own real evidence showed directly that this proof does not transfer to a weighted graph, where the fewest real hops and the real cheapest path can be two genuinely different things.

**Question three: is there real, usable domain knowledge for estimating remaining cost?** This lesson's own grid has one: real, straight-line (Manhattan) distance to the goal is always a real, valid lower bound on true remaining cost, since every real cell costs at least `1` to enter and Manhattan distance already assumes the cheapest possible real case, every remaining move costing exactly that minimum. This real fact rules in `astar-search` (Lesson 139) over plain Dijkstra-style search (Lesson 125): both would find the real, correct answer, but only one makes real use of the real information already available.

### Walkthrough

- **Each question phrased so it's directly checkable against this lesson's own Concept Unit 1 facts** — no question here requires guessing; each has a real, specific yes-or-no answer already established.
- **Every ruling-out or ruling-in cites the specific real lesson and the specific real evidence that justifies it** — per this curriculum's own Repetition Rule, a real restatement of what was actually shown, not a bare citation.

### CS Lens

This is Lesson 111's own four-step decision procedure, recognized precisely: (1) state the real requirements, (2) eliminate categorical non-fits before ever comparing real cost, (3) among survivors, prefer the one that uses more of the real information available, (4) don't assume — check. Every one of those four real moves appears above, applied to algorithms instead of data structures.

### SE Lens

The alternative to this real, three-question procedure is trying several algorithms empirically and picking whichever one seems to work. The real cost of that alternative: `bfs-implicit`, run on this lesson's own real grid, does not fail loudly — it returns a real, valid-looking path and a real number, with nothing in its own output signaling that the number is wrong for the real question actually being asked. A real decision procedure applied *before* writing any code catches that mismatch structurally, rather than trusting a plausible-looking real result that happens to be incorrect.

---

## Concept Unit 3: Implementing the Real, Chosen Algorithm

### The Problem

Concept Unit 2 chose `astar-search`. It needs one real, minimal change: `astar-search`, given full real treatment in this lesson's own Header, assumes every real move costs exactly `1` — this lesson's own problem needs a real, per-move cost instead.

### Reference Source

`astar-search` — quoted unchanged in this lesson's own Header above, originally Lesson 139, changed in exactly one real place below.

### Files affected

Created: `capstone-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact); Lesson 139's own `astar-search`, modified in one real place, per the real change described below.

### Dependencies

The Guile interpreter.

### Applying It — The One Real Line That Changes

`astar-search`'s own real line, `(let* ((g-new (+ d 1)) ...) ...)`, hard-codes every move's own real cost as `1`. `astar-weighted` needs that real `1` replaced with a real call to a caller-supplied edge-cost function, applied to the specific real neighbor being considered — and, since a state might now be reachable by more than one real path at genuinely different real costs, `astar-weighted` also needs to accept a *cheaper* real rediscovery of an already-seen state, something `astar-search`'s own original real logic, built for uniform-cost moves, never needed to consider.

### The New Code — Type It Yourself

```scheme
(define (astar-weighted start goal? successors heuristic edge-cost)
  (let ((dist (list (cons start 0)))
        (frontier (list (cons start (heuristic start)))))
    (let loop ((frontier frontier))
      (if (null? frontier)
          #f
          (let* ((extracted (frontier-extract-min frontier))
                 (v (car (car extracted)))
                 (frontier2 (cdr extracted))
                 (d (cdr (assoc v dist))))
            (if (goal? v)
                d
                (let loop2 ((ns (successors v)) (frontier3 frontier2))
                  (if (null? ns)
                      (loop frontier3)
                      (let* ((ns1 (car ns)) (g-new (+ d (edge-cost ns1))))
                        (if (and (assoc ns1 dist) (<= (cdr (assoc ns1 dist)) g-new))
                            (loop2 (cdr ns) frontier3)
                            (begin
                              (set! dist (cons (cons ns1 g-new) dist))
                              (loop2 (cdr ns) (cons (cons ns1 (+ g-new (heuristic ns1))) frontier3))))))))))))))
```

### The Updated Project

This is `capstone-check.scm`, in full — Lesson 114's own `grid-neighbors`, Lesson 138's own `frontier-extract-min`, quoted unchanged, with this lesson's own real grid, mud, and `astar-weighted`:

```scheme
(define (grid-neighbors r c size)
  (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size)))
          (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1)))))
(define (frontier-extract-min frontier)
  (let loop ((rest (cdr frontier)) (best (car frontier)) (acc '()))
    (if (null? rest)
        (cons best acc)
        (if (< (cdr (car rest)) (cdr best))
            (loop (cdr rest) (car rest) (cons best acc))
            (loop (cdr rest) best (cons (car rest) acc))))))

(define grid-size 5)                                                 ; ← new
(define start (cons 0 0))                                               ; ← new
(define goal (cons 4 4))                                                   ; ← new
(define (mud? r c) (and (>= r 1) (<= r 3) (= c 0)))                            ; ← new
(define (cell-cost r c) (if (mud? r c) 5 1))                                      ; ← new
(define (h-grid v) (+ (abs (- (car v) (car goal))) (abs (- (cdr v) (cdr goal)))))    ; ← new

(define (astar-weighted start goal? successors heuristic edge-cost)  ; ← new
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
                      (let* ((ns1 (car ns)) (g-new (+ d (edge-cost ns1))))                                       ; ← new
                        (if (and (assoc ns1 dist) (<= (cdr (assoc ns1 dist)) g-new))                                ; ← new
                            (loop2 (cdr ns) frontier3)                                                                 ; ← new
                            (begin                                                                                        ; ← new
                              (set! dist (cons (cons ns1 g-new) dist))                                                       ; ← new
                              (loop2 (cdr ns) (cons (cons ns1 (+ g-new (heuristic ns1))) frontier3)))))))))))))) ; ← new

(display "=== CU3: astar-weighted, the real chosen algorithm ===") (newline)                          ; ← new
(display "real total cost: ") (display (astar-weighted start (lambda (v) (equal? v goal)) (lambda (v) (grid-neighbors (car v) (cdr v) grid-size)) h-grid (lambda (p) (cell-cost (car p) (cdr p))))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (mud? r c) ...)` / `(define (cell-cost r c) ...)`** — first appearance in this lesson of these procedures; `mud?` checks whether a real cell falls inside this lesson's own real mud strip (`column 0`, `rows 1` through `3`); `cell-cost` returns `5` inside it, `1` outside — the real, concrete edge-cost this lesson's own problem is built around.
- **`(let* ((ns1 (car ns)) (g-new (+ d (edge-cost ns1)))) ...)`** — the one real change from `astar-search`, given full treatment in this lesson's Header: `(edge-cost ns1)` replaces the hard-coded `1`, computing the real, specific cost of moving into this specific neighbor.
- **`(if (and (assoc ns1 dist) (<= (cdr (assoc ns1 dist)) g-new)) (loop2 (cdr ns) frontier3) (begin ...))`** — the real, second necessary change: `astar-search`'s own original check, `(assoc (car ns) dist)`, simply skipped any already-seen state outright, correct only when every move costs the same real amount (so the first discovery is always cheapest). Here, a real, already-seen state is skipped only if its own already-recorded real cost is *already* at least as good as this newly-found route (`(<= (cdr (assoc ns1 dist)) g-new)`); otherwise, this lesson's own code proceeds to record the real, cheaper cost just found, exactly the real correction genuinely varying edge costs require.
- **The real, exact `8`** — direct, measured confirmation: `astar-weighted`, given this lesson's own real grid and real mud, finds a route costing `8` real time-units total.

### Checking the Real Answer Independently

A real, exhaustive brute-force search over every one of the grid's own real *monotonic* paths (moving only down or right, the only real candidates worth checking, since backtracking away from the goal can never reduce real cost on a grid where every real cell costs at least `1`) confirms the real, true minimum cost is exactly `8` — the identical real number `astar-weighted` found, checked the same real, exhaustive way Lesson 81 confirmed a real lower bound by trying every one of `40,320` real permutations.

### CS Lens

This is Lesson 139's own minimal-diff derivation discipline, applied a second time: exactly one real expression, `(edge-cost ns1)` in place of a hard-coded `1`, and one real added comparison for handling a cheaper rediscovery, are the entire real difference between `astar-search` and `astar-weighted` — the same real, precise, traceable change Lesson 139 itself used deriving `astar-search` from `greedy-best-first`.

### SE Lens

The alternative to deriving `astar-weighted` as a minimal, real change to already-proven code is writing a new weighted-search procedure from scratch. The real value of the minimal-diff approach: `astar-search`'s own real correctness proof (Lesson 139, resting on Lesson 125's own real invariant) already established that a state, once finalized with the smallest real `f`-value in the frontier, need never be revisited — this lesson's own real change preserves that same real structure, adding only what a genuinely varying real edge cost requires, rather than risking a subtly different bug by starting over.

### Run It — Show the Real Output

```
$ guile capstone-check.scm
=== CU3: astar-weighted, the real chosen algorithm ===
real total cost: 8
```

Verified this session — `astar-weighted`, correctly chosen via Concept Unit 2's own real decision procedure, finds the real, true minimum-cost route, `8` real time-units, confirmed independently by a real, exhaustive check over every real monotonic path the grid admits.

---

## Concept Unit 4: The Real, Concrete Cost of the Wrong Choice

### The Problem

Concept Unit 3 confirmed the correctly-chosen algorithm's own real answer. It's worth measuring, honestly, exactly what would have happened had Concept Unit 2's own real decision procedure been skipped, and `bfs-implicit` — plausible-sounding, already familiar, and completely wrong for a real, weighted problem — had been reached for instead.

### Reference Source

`bfs-implicit` and its queue helpers — quoted unchanged in this lesson's own Header above, originally Lesson 135.

### Files affected

Modified: `capstone-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (real-cost-of-path path)
  (apply + (map (lambda (p) (cell-cost (car p) (cdr p))) (cdr path))))
```

### The Updated Project

This is `capstone-check.scm`, with Concept Unit 3's own file extended by Lesson 135's own unmodified `bfs-implicit`, applied to the identical real grid, and a real cost audit of the path it finds:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define (make-queue) (list '() '()))
(define (queue-empty? q) (and (null? (car q)) (null? (cadr q))))
(define (enqueue q x) (list (car q) (cons x (cadr q))))
(define (dequeue q) (if (null? (car q)) (let ((f (reverse (cadr q)))) (list (cdr f) '())) (list (cdr (car q)) (cadr q))))
(define (queue-front q) (if (null? (car q)) (car (reverse (cadr q))) (car (car q))))
(define (bfs-implicit-path start goal? successors)                   ; ← new
  (let ((dist (list (cons start 0))) (parent (list (cons start #f))) (q (enqueue (make-queue) start))) ; ← new
    (let loop ((q q))                                                          ; ← new
      (if (queue-empty? q)                                                        ; ← new
          #f                                                                         ; ← new
          (let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist))))         ; ← new
            (if (goal? v)                                                                  ; ← new
                (let build ((cur v) (acc '()))                                                ; ← new
                  (if (not cur) acc (build (cdr (assoc cur parent)) (cons cur acc))))             ; ← new
                (let loop2 ((ns (successors v)) (q3 q2))                                             ; ← new
                  (if (null? ns)                                                                        ; ← new
                      (loop q3)                                                                            ; ← new
                      (if (assoc (car ns) dist)                                                               ; ← new
                          (loop2 (cdr ns) q3)                                                                     ; ← new
                          (begin (set! dist (cons (cons (car ns) (+ d 1)) dist))                                     ; ← new
                                 (set! parent (cons (cons (car ns) v) parent))                                          ; ← new
                                 (loop2 (cdr ns) (enqueue q3 (car ns))))))))))))) ; ← new

(define (real-cost-of-path path)                                     ; ← new
  (apply + (map (lambda (p) (cell-cost (car p) (cdr p))) (cdr path)))) ; ← new

(display "=== CU4: the real cost of the wrong representation choice ===") (newline) ; ← new
(define bfs-path (bfs-implicit-path start (lambda (v) (equal? v goal)) (lambda (v) (grid-neighbors (car v) (cdr v) grid-size)))) ; ← new
(display "bfs-implicit path: ") (display bfs-path) (newline)                          ; ← new
(display "real hop count: ") (display (- (length bfs-path) 1)) (newline)                 ; ← new
(display "real total cost of that path: ") (display (real-cost-of-path bfs-path)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (bfs-implicit-path start goal? successors) ...)`** — a real, small extension of `bfs-implicit`, given full treatment in this lesson's own Header, adding a real `parent` table (recording which state discovered each new one) so the actual real path, not just its length, can be reconstructed and audited — the identical real path-reconstruction technique Lesson 116's own Exercise 3 already pointed toward.
- **`(let build ((cur v) (acc '())) (if (not cur) acc (build (cdr (assoc cur parent)) (cons cur acc))))`** — first appearance in this lesson of this specific real pattern: walks backward from the goal through `parent`, consing each real state onto the front of `acc`, until reaching `start`'s own real `#f` parent marker.
- **`(define (real-cost-of-path path) ...)`** — first appearance in this lesson of this procedure; sums `cell-cost` over every real cell in the path *after* the first (`(cdr path)`), since entering the start cell was never a real move that cost anything.
- **The real, exact path, `8` real hops, matching `astar-weighted`'s own real hop count exactly** — direct, checked confirmation that `bfs-implicit` did find *a* real shortest-hop path, exactly what it was designed to guarantee.
- **The real, exact total cost, `20`** — direct, measured confirmation of the real problem: this real, valid, correctly-shortest-hop path costs `20` real time-units, `2.5×` worse than `astar-weighted`'s own real, true minimum, `8`, because three of its own eight real hops cross this lesson's own real mud, and `bfs-implicit` had no real way to know that mattered.

### CS Lens

This is Lesson 123's own real evidence, encountered a third time and now made fully concrete: Lesson 123 first showed, in the abstract, that BFS's own real proof doesn't transfer to weighted graphs; this unit shows exactly what that abstract gap costs in a real, specific, human-legible case — a delivery robot sent needlessly through real mud, by an algorithm that was never wrong about what it promised, only wrong for what was actually being asked.

### SE Lens

The alternative to running this real, side-by-side audit is trusting that `bfs-implicit`'s own real output — a real, valid-looking path and a real number — is good enough, since nothing about it *looks* incorrect on its own. The real, concrete lesson this unit's own evidence leaves: a wrong representation choice does not announce itself. It produces real, plausible, wrong answers, and the only real defense is Concept Unit 2's own decision procedure, applied *before* trusting any algorithm's own output, not a wrong answer's own appearance afterward.

### Run It — Show the Real Output

```
$ guile capstone-check.scm
=== CU4: the real cost of the wrong representation choice ===
bfs-implicit path: ((0 . 0) (1 . 0) (2 . 0) (3 . 0) (4 . 0) (4 . 1) (4 . 2) (4 . 3) (4 . 4))
real hop count: 8
real total cost of that path: 20
```

Verified this session — `bfs-implicit`, correctly reporting a real, genuinely shortest-hop path exactly as designed, produces a route costing `20` real time-units, `2.5×` worse than the real, true minimum, `8`, `astar-weighted` found using the identical grid and the identical start and goal.

---

## Closing

### Connect the pieces

One real problem, one real decision, one real, measured consequence — and, with it, the whole of Era V:

1. **The real problem, given with no algorithm named (Unit 1):** a real, weighted grid, no adversary, no pre-chosen representation.
2. **A real, three-question decision procedure, applied (Unit 2):** no adversary rules out game search; real varying cost rules out plain BFS; real available domain knowledge rules in A\* over plain Dijkstra.
3. **The real, chosen algorithm, implemented as a minimal real diff (Unit 3):** `astar-weighted`, one real changed expression, confirmed against an exhaustive real brute-force check.
4. **The real, measured cost of the wrong choice (Unit 4):** `bfs-implicit`, unmodified and not incorrect about what it promises, still produces a real answer `2.5×` worse.

Era V itself ran this identical real arc at full scale: relations, generalized into graphs (Lesson 113); three representations, compared on real cost (114); traversal, BFS, and DFS, each with a real, checked proof (115–119); components, cycles, and topological order (120–122); weighted shortest paths, from relaxation through Dijkstra's real failure and Bellman-Ford's real fix (123–128); minimum spanning trees and the real limits of greedy reasoning (129–134); state-space search, generalized beyond any literal graph (135); constraint satisfaction and pruning (136–137); heuristics, genuinely helpful and genuinely fallible (138); A\*, the real, derived fix (139); bidirectional search's own real, widening advantage (140); game trees, minimax, and alpha-beta pruning (141–143); and, in the immediately preceding lesson, one real, shared shape underneath backtracking, constraint solving, and adversarial search alike (144). Every one of those real algorithms is now sitting in this lesson's own real toolbox — Concept Unit 2's own three questions are how to reach into it correctly.

### What breaks without this

Suppose a real routing system were built by an engineer who had worked through every algorithm this Era built, in order, but never practiced the real, upfront question of *which one a new problem actually calls for*. Concept Unit 4's own real evidence shows precisely what that gap costs: not a crash, not an error message, but a real, silently wrong answer — a real route `2.5×` more expensive than necessary, reported with exactly the same real confidence a correct answer would carry.

### Exercises

1. **Observe.** Before checking, predict whether `astar-weighted`, run on this lesson's own real grid with the real mud strip *removed* entirely (`cell-cost` always `1`), would find a real total cost matching `bfs-implicit`'s own real hop count exactly, using this lesson's own real Concept Unit 2 reasoning to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Design your own real, new problem — pick a real domain of your own choosing — and apply Concept Unit 2's own three-question decision procedure to it in writing before writing any code; then implement your own real choice and verify it with a real, independent check, the same discipline this lesson's own Concept Unit 3 used.
4. **Explain.** In your own words, explain why `astar-weighted`'s own added real check, `(<= (cdr (assoc ns1 dist)) g-new)`, was never necessary in `astar-search`'s own original, uniform-cost version, referencing what real property of uniform-cost moves made the original, simpler check always safe.
5. **Explain.** Using this lesson's own real `8`-versus-`20` numbers, explain why "the algorithm ran without error and returned a real, valid answer" is not sufficient evidence that a representation choice was correct — referencing Concept Unit 4's own real, specific case.

### Definition of done

- [ ] You can state Concept Unit 2's own three real decision questions, and explain, precisely, what each one rules in or out.
- [ ] You can point to this lesson's own real `8`-versus-`20` numbers as direct, measured evidence of what a wrong representation choice costs.
- [ ] You can explain the one real line that changes between `astar-search` and `astar-weighted`, and why a second real change (handling a cheaper rediscovery) was also required.
- [ ] You can name, in order, every real algorithm Era V built, and state in one real sentence each what problem property it was built to exploit.
- [ ] You completed Exercises 1–5, including a real, self-designed problem carried through this lesson's own full decision procedure.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
