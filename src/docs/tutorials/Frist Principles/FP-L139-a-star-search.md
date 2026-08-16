# Lesson 139: A* Search

**What you will build:** **A\* search** — a state-space search whose frontier is ordered by `f(n) = g(n) + h(n)`, the real accumulated cost to reach a state, `g(n)`, plus a heuristic estimate of what's left, `h(n)`, rather than the heuristic estimate alone. Real, verified evidence this session: on the identical six-state graph where greedy best-first search, using a real, checked-admissible heuristic, returned a wrong `4`-move answer, A\* — the identical graph, the identical heuristic, changed only to weigh real cost alongside the estimate — returns the true `2`-move answer, confirmed by a full, real execution trace showing exactly where the two algorithms' choices diverge. On a real `10×10` grid with a wall forcing a detour, all three algorithms built across these last two lessons find the identical, true `27`-move shortest path, but at real, measured, different costs: blind search expands `90` states, greedy best-first expands `49`, and A\* expands `63` — more than greedy, but with a guarantee greedy does not have, made concrete in this lesson's own closing evidence: given a deliberately inadmissible heuristic instead of an admissible one, A\* returns the identical wrong `4`-move answer greedy did. The transferable point: A\* is not "greedy best-first, but smarter" in some vague sense — it is a precise, derivable fix for the exact structural gap Lesson 138 identified, and its own real guarantee is conditional on the same real property, admissibility, that made that gap fixable at all.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 138's own real, verified evidence (greedy best-first's real failure) and Lesson 125/127's own real accumulated-cost tracking (Dijkstra's and Bellman-Ford's own `dist`/relaxation machinery) — both explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **State** — a single, specific, comparable configuration of whatever problem is being searched. A state carries no memory of how it was reached; every search in this lesson tracks that separately, in its own real bookkeeping alongside the state itself.
- **State-space search** — searching a graph whose states and legal moves between them are never stored anywhere, only computed on demand by a real `successors` function given one state at a time.
- **Implicit graph** — a graph represented not by stored vertices and edges but by a real rule computing neighbors from a state's own structure, such as this lesson's own grid, whose neighbors are computed fresh from a cell's row and column every time, with no list of cells or connections ever built.
- **Frontier** — the set of states discovered but not yet expanded, at any point during a search. Every search in this lesson keeps one frontier at a time; what differs is only the rule choosing which member gets expanded next.
- **Heuristic function** — a real, computable function `h(n)` estimating, without doing any actual search, how much work remains to reach the goal from state `n`. It never inspects a path already taken — only `n` itself and the fixed goal.
- **Admissible heuristic** — a heuristic function that never overestimates the true remaining cost from any state to the goal: for every state `n`, `h(n) ≤` the real shortest remaining distance from `n`. Lesson 138's own real evidence showed admissibility alone does not make greedy best-first search optimal; this lesson's own real evidence shows it is exactly the property A\*'s own optimality guarantee depends on.
- **Cost so far, `g(n)`** — the real, exact number of moves a search has actually spent reaching state `n` along the specific path it discovered `n` by. It exists to distinguish *known, already-paid* cost from `h(n)`'s own *estimated, not-yet-paid* cost — the identical real quantity Dijkstra's own `dist` table and Bellman-Ford's own relaxation both track, given a new name here to pair precisely against `h(n)`.
- **Evaluation function, `f(n) = g(n) + h(n)`** — the real sum of a state's own known cost so far and its own estimated cost still remaining: a single number representing "the best total path length this state could possibly be part of, assuming the heuristic's own estimate for the rest is accurate." It exists because ranking frontier states by `h(n)` alone, as greedy best-first does, discards `g(n)` entirely — `f(n)` is the minimal real fix restoring it to the comparison.
- **A\* search** — a state-space search whose frontier is ordered by `f(n)` rather than `h(n)` alone, always expanding whichever frontier state currently has the smallest `f(n)`. It exists as the direct, derived answer to Lesson 138's own closing question: what would a search need to add to avoid being fooled the way greedy best-first was.
- **Informed search / uninformed (blind) search** — a search is *informed* when it uses a real heuristic function to choose which frontier state to expand next, and *uninformed*, or *blind*, when it has no such estimate, falling back only on structural properties of discovery order. A\*, like greedy best-first before it, is informed; unlike greedy best-first, it is informed *and* keeps real, exact track of cost already spent.

**Objects and methods used**

- **`astar-search`**
  - *What it is:* this lesson's own state-space search procedure, derived as the minimal real structural change to Lesson 138's own `greedy-best-first` needed to weigh real cost so far alongside heuristic estimate.
  - *Implementation:* takes the identical four arguments as `greedy-best-first` — `start`, `goal?`, `successors`, `heuristic` — and returns the real number of moves from `start` to the first state satisfying `goal?`, or `#f` if the frontier is exhausted first. Full body given real, complete treatment in Concept Unit 2 below.
  - *Its use:* every real search this lesson runs from Concept Unit 2 onward.
- **`grid-neighbors-walled`**
  - *What it is:* this lesson's own small variant of `grid-neighbors`, adding a real obstacle check.
  - *Implementation:* identical in shape to `grid-neighbors`, below, with one added condition: a candidate neighbor is only kept if it also fails a real `blocked?` check, excluding cells that fall inside a wall this lesson's own Concept Unit 3 defines.
  - *Its use:* the one real source of "neighbor" information for Concept Unit 3's own obstacle grid — every search run there, blind, greedy, or A\*, calls this exact procedure, never the unwalled `grid-neighbors`.
- **`frontier-extract-min`**
  - *What it is:* a real procedure finding and removing the entry with the smallest second value from an unordered list of `(state . value)` pairs — this lesson reuses it completely unchanged from Lesson 138, where it was built to compare `h`-values; here it compares `f`-values instead, needing no change at all, since it never assumed anything about what the second value of each pair actually represents.
  - *Implementation:* takes one argument, `frontier`, a non-empty list of `(state . value)` pairs; scans every entry exactly once, tracking the smallest value seen so far and every other entry; returns `(cons min-entry remaining-entries)`. On a tie, the first-encountered entry during the scan is kept, since its own comparison is a strict `<`.

    ```scheme
    (define (frontier-extract-min frontier)
      (let loop ((rest (cdr frontier)) (best (car frontier)) (acc '()))
        (if (null? rest)
            (cons best acc)
            (if (< (cdr (car rest)) (cdr best))
                (loop (cdr rest) (car rest) (cons best acc))
                (loop (cdr rest) best (cons (car rest) acc))))))
    ```

  - *Its use:* the one real mechanism both `greedy-best-first` and this lesson's own `astar-search` depend on to find the frontier's own current minimum, regardless of which quantity, `h` or `f`, that minimum is measured over.
- **`greedy-best-first`**
  - *What it is:* Lesson 138's own state-space search, ordering its frontier purely by heuristic estimate, `h(n)`, with no regard at all for real cost already spent.
  - *Implementation:* takes `start`, `goal?`, `successors`, `heuristic`; maintains `dist` (real cost so far per discovered state) and `frontier` (a list of `(state . h-value)` pairs); repeatedly extracts the frontier's own minimum-`h` entry, checks it against `goal?`, and otherwise expands it, pairing every newly-discovered neighbor with its own `(heuristic neighbor)` value before adding it to the frontier.

    ```scheme
    (define (greedy-best-first start goal? successors heuristic)
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
                          (if (assoc (car ns) dist)
                              (loop2 (cdr ns) frontier3)
                              (begin
                                (set! dist (cons (cons (car ns) (+ d 1)) dist))
                                (loop2 (cdr ns) (cons (cons (car ns) (heuristic (car ns))) frontier3))))))))))))
    ```

  - *Its use:* this lesson's own real, concrete baseline in Concept Unit 1 (its already-established, real failure, reconfirmed) and Concept Unit 3 (the real, three-way comparison against blind search and A\*).
- **`bfs-implicit`** / **`make-queue`, `queue-empty?`, `enqueue`, `dequeue`, `queue-front`**
  - *What it is:* a state-space search expanding its frontier in strict discovery order via a real First-In-First-Out queue, with no heuristic at all — this curriculum's own uninformed baseline since Lesson 135.
  - *Implementation:* `bfs-implicit` takes `start`, `goal?`, `successors`; maintains `dist` and a FIFO queue `q`, built from two ordinary lists (`make-queue` returns two empty lists; `enqueue` adds to the front of the back-list; `dequeue`/`queue-front` remove from, or read, the front-list, reversing the back-list into a fresh front-list whenever the front-list runs empty). Each iteration dequeues the front state, checks `goal?`, and otherwise expands every real neighbor not already in `dist`, recording each one's distance as one more than the current state's own.

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

  - *Its use:* this lesson's own real "no information at all" baseline in Concept Unit 3's three-way comparison.
- **`grid-neighbors`**
  - *What it is:* a real, computed rule returning every valid neighboring cell of a given `(row, column)` position on a bounded square grid.
  - *Implementation:* takes `r`, `c`, `size`; builds the four candidate neighbors as `(row . column)` pairs, then filters to only those whose row and column both fall inside `[0, size)`.

    ```scheme
    (define (grid-neighbors r c size)
      (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size)))
              (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1)))))
    ```

  - *Its use:* the basis `grid-neighbors-walled`, this lesson's own subject above, adds one real condition to.
- **`h-grid`**
  - *What it is:* Lesson 138's own heuristic function, the real two-point Manhattan distance from a grid state to a fixed goal.
  - *Implementation:* `(define (h-grid v) (+ (abs (- (car v) (car goal))) (abs (- (cdr v) (cdr goal)))))` — the unsigned sum of a state's own row and column separation from `goal`.
  - *Its use:* the real heuristic every search in this lesson's own Concept Unit 3 uses on the grid.

---

## Concept Unit 1: What Greedy Best-First Left on the Table

### The Problem

Lesson 138 built a small, real, six-state graph — `s`, `a`, `b`, `c`, `d`, `g` — with a heuristic, `h-ex`, checked and confirmed admissible at every single state. Greedy best-first search, run on that graph, returned `4` real moves, even though the true shortest path, confirmed by an independent brute-force search, is `2`. The heuristic was never wrong; the algorithm simply never once asked how much real distance a frontier state had already cost to reach — `a`, sitting in the frontier the entire time with a real, correct `h(a) = 1`, represented an actual `2`-move path to the goal, `s → a → g`, and was never chosen, because three other states, `b`, `c`, and `d`, kept presenting an even smaller `h` value at every single step, despite the real path through them being twice as long.

### No isolated lab for this step

This unit introduces no new construct — `successors-ex`, `h-ex`, and `greedy-best-first` all receive full, real treatment in this lesson's own Header, above, and this unit's own real content is reconfirming their already-established real behavior as the concrete motivation for what Concept Unit 2 derives next.

### Reference Source

`successors-ex`, `h-ex`, `greedy-best-first`, and `frontier-extract-min` — Lesson 138 (this session's own prior work, quoted unchanged in this lesson's own Header, above).

### Files affected

Created: `astar-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

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

This is `astar-check.scm`, in full — Lesson 138's own `frontier-extract-min` and `greedy-best-first`, quoted unchanged from this lesson's own Header above, with this unit's own graph and a real, reconfirming run:

```scheme
(define (frontier-extract-min frontier)
  (let loop ((rest (cdr frontier)) (best (car frontier)) (acc '()))
    (if (null? rest)
        (cons best acc)
        (if (< (cdr (car rest)) (cdr best))
            (loop (cdr rest) (car rest) (cons best acc))
            (loop (cdr rest) best (cons (car rest) acc))))))

(define (greedy-best-first start goal? successors heuristic)
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
                      (if (assoc (car ns) dist)
                          (loop2 (cdr ns) frontier3)
                          (begin
                            (set! dist (cons (cons (car ns) (+ d 1)) dist))
                            (loop2 (cdr ns) (cons (cons (car ns) (heuristic (car ns))) frontier3))))))))))))

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

(display "=== CU1: reconfirm greedy best-first's real failure ===") (newline) ; ← new
(display "greedy moves S to G: ") (display (greedy-best-first 's (lambda (v) (eq? v 'g)) successors-ex h-ex)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(cond ((eq? v 's) (list 'a 'b)) ...)`** in `successors-ex` — `cond` tries each clause's own test in order, evaluating the first true one's body; `eq?` compares two values for object identity, the correct comparison for symbols like `'s`, `'a`; `(list 'a 'b)` returns `s`'s own two real successors.
- **`(cond ((eq? v 's) 2) ...)`** in `h-ex` — the identical `cond`/`eq?` structure, returning each state's own fixed, hand-checked, admissible heuristic value instead of a successor list.
- **`(greedy-best-first 's (lambda (v) (eq? v 'g)) successors-ex h-ex)`** — calls `greedy-best-first`, given full real treatment in this lesson's own Header, with `s` as the start state and an anonymous goal predicate checking `eq?` against `'g`.
- **The real, exact `4`** — direct, checked reconfirmation, this session, of Lesson 138's own real result: greedy best-first search, on this graph, with this admissible heuristic, still returns a path twice as long as the true shortest one.

### CS Lens

This is Lesson 82's own discipline — naming, precisely, which of several available tools solved a specific job, before reaching for a new one — applied here in reverse: before deriving a new algorithm, name precisely what the existing one, greedy best-first, actually gets wrong, so the fix that follows can be judged against a specific, real gap rather than a vague sense that "it should be better somehow."

### SE Lens

The alternative to precisely reconfirming this real failure before deriving a fix is trusting memory of Lesson 138's own conclusion and moving straight to a new algorithm. The real value of reconfirming it here, with the identical real code and a fresh run: the exact real numbers this lesson's own Concept Unit 2 needs to improve on, `4` versus a true `2`, are established freshly, in this lesson's own real output, not assumed.

### Run It — Show the Real Output

```
$ guile astar-check.scm
=== CU1: reconfirm greedy best-first's real failure ===
greedy moves S to G: 4
```

Verified this session — greedy best-first search, run fresh against this lesson's own copy of Lesson 138's graph and heuristic, returns the identical real, wrong answer, `4`, confirming the concrete gap this lesson's own Concept Unit 2 derives a fix for.

---

## Concept Unit 2: Deriving A* — Adding Real Cost Back Into the Comparison

### The Problem

Concept Unit 1 reconfirmed the gap precisely: `greedy-best-first` orders its frontier by `h(n)` alone, discarding `d`, each state's own real, already-known cost so far, entirely. The minimal real fix is to stop discarding it — order the frontier by `f(n) = g(n) + h(n)` instead, so a state's own real progress counts alongside its own estimated remaining distance.

### Reference Source

No reference counterpart for `astar-search` itself — a from-scratch derivation, structured as the minimal real change to `greedy-best-first`, quoted in full in this lesson's own Header above, needed to weigh `g(n)` alongside `h(n)`. `frontier-extract-min`, reused completely unchanged, is the identical procedure Lesson 138 built — no adaptation was needed at all, since it only ever compares each pair's own `cdr`, never assuming what that value represents.

### Files affected

Modified: `astar-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 1 file).

### Dependencies

The Guile interpreter.

### Applying It — What Changes, and What Doesn't

`greedy-best-first` stores `(heuristic (car ns))` — `h` alone — as each new frontier entry's own second value. `astar-search` needs to store `f`, the *sum* of that same `h` value and the new state's own real cost so far, `g-new`, which is simply `d`, the current state's own already-known real cost, plus `1` for the one real move just taken — the identical `(+ d 1)` computation `bfs-implicit` and `greedy-best-first` both already use to update `dist`. Nothing about `frontier-extract-min` needs to change; nothing about the overall discover-check-expand structure needs to change. Exactly one real expression, at exactly one place, changes.

### The New Code — Type It Yourself

```scheme
(define (astar-search start goal? successors heuristic)
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
                      (if (assoc (car ns) dist)
                          (loop2 (cdr ns) frontier3)
                          (let* ((g-new (+ d 1)) (f-new (+ g-new (heuristic (car ns)))))
                            (begin
                              (set! dist (cons (cons (car ns) g-new) dist))
                              (loop2 (cdr ns) (cons (cons (car ns) f-new) frontier3)))))))))))))
```

### The Updated Project

This is `astar-check.scm`, with Concept Unit 1's own file extended by `astar-search` and a real run on the identical graph:

```scheme
;; ... Concept Unit 1's code above, unchanged ...

(define (astar-search start goal? successors heuristic)             ; ← new
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
                          (let* ((g-new (+ d 1)) (f-new (+ g-new (heuristic (car ns)))))                              ; ← new
                            (begin                                                                                      ; ← new
                              (set! dist (cons (cons (car ns) g-new) dist))                                                ; ← new
                              (loop2 (cdr ns) (cons (cons (car ns) f-new) frontier3))))))))))))) ; ← new

(display "=== CU2: A* on the identical graph ===") (newline)                        ; ← new
(display "A* moves S to G: ") (display (astar-search 's (lambda (v) (eq? v 'g)) successors-ex h-ex)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (astar-search start goal? successors heuristic) ...)`** — first appearance in this lesson of this procedure; identical argument list to `greedy-best-first`'s own, given full treatment in this lesson's Header.
- **Every line up through `(d (cdr (assoc v dist))))`** — identical, unchanged, to `greedy-best-first`'s own corresponding lines: the same named-let, the same `frontier-extract-min` call, the same real lookup of `v`'s own already-known cost so far, `d`. Nothing here differs.
- **`(if (goal? v) d ...)`** — identical to `greedy-best-first`'s own goal check: if `v` is the goal, return its real recorded cost so far immediately.
- **`(let loop2 ((ns (successors v)) (frontier3 frontier2)) ...)`** through **`(if (assoc (car ns) dist) (loop2 (cdr ns) frontier3) ...)`** — identical to `greedy-best-first`'s own inner loop and already-visited check.
- **`(let* ((g-new (+ d 1)) (f-new (+ g-new (heuristic (car ns))))) ...)`** — the one real new expression: a sequential-binding `let*` computing two real values before doing anything with them — `g-new`, the new neighbor's own real cost so far (`v`'s own cost, `d`, plus the one real move just taken), and `f-new`, the sum of that real cost and the neighbor's own `(heuristic (car ns))` estimate.
- **`(set! dist (cons (cons (car ns) g-new) dist))`** — records `g-new`, not `f-new`, as the neighbor's own entry in `dist` — `dist` tracks *real* cost so far only, exactly as it did in `greedy-best-first` and `bfs-implicit` alike; the estimate never gets stored there.
- **`(cons (cons (car ns) f-new) frontier3)`** — the one other real change from `greedy-best-first`: the frontier entry pairs the neighbor with `f-new`, the combined value, in place of `greedy-best-first`'s own bare `(heuristic (car ns))`.
- **The real, exact `2`** — direct, measured confirmation that this one real change is sufficient: the identical graph, the identical heuristic, now finds the true shortest path.

### Execution Trace — Watching `a` Win This Time

1. `(loop ((s . 2)))` — frontier holds only `s`, `f = g(0) + h(2) = 2`. Popped; not goal. Real successors `a` (`g = 1, h = 1, f = 2`) and `b` (`g = 1, h = 0, f = 1`) are both newly discovered.
2. `(loop ((b . 1) (a . 2)))` — `b`, `f = 1`, beats `a`, `f = 2`; `b` is popped. Its real successor `c` (`g = 2, h = 0, f = 2`) is newly discovered.
3. `(loop ((c . 2) (a . 2)))` — a real tie at `f = 2`; `frontier-extract-min`'s own strict `<` keeps whichever was encountered first in its scan, `c`, popped ahead of `a`. `c`'s real successor `d` (`g = 3, h = 0, f = 3`) is newly discovered — and here is the real divergence from greedy best-first: `d`'s own `f`, `3`, is now *worse* than `a`'s own `f`, still `2`, because `d`'s real cost so far, `3`, has climbed even though its heuristic, `0`, looks perfect.
4. `(loop ((d . 3) (a . 2)))` — `a`, `f = 2`, now strictly beats `d`, `f = 3`; `a` is popped, this session's own real turning point. Its real successor `g` (`g = 2, h = 0, f = 2`) is newly discovered.
5. `(loop ((g . 2) (d . 3)))` — `g`, `f = 2`, beats `d`, `f = 3`; `g` is popped, `(goal? g)` is true, and the search returns `g`'s own real recorded cost so far, `2` — the true shortest path, `s → a → g`, found this time.

The real reason this works: `h` alone can only ever get smaller as a search moves toward states that *look* close, with no penalty for how long the real journey there has been. `f = g + h` means a branch's own real, already-spent cost directly raises its ranking number, every single step — the long branch through `b`, `c`, `d` keeps climbing (`1 → 2 → 3`) exactly as fast as its heuristic estimate falls, while the short branch through `a` never climbs past `2` at all, because it never needed to.

### CS Lens

This is Lesson 128's own dynamic-programming reformulation, recognized a second time in a genuinely different setting: `dist_k(v)`, there, was built strictly from already-known, already-correct smaller subproblems, never re-derived from scratch; `g(n)` here plays the identical structural role — a real, already-settled fact about cost already spent, combined with, but never overridden by, an estimate about what's still unknown. Also recognized in: a project budget tracker that weighs money already spent against a remaining-cost estimate, rather than approving further spending based on the estimate alone; a marathon runner's own real pacing decisions, which weigh actual distance already covered against a remaining-distance guess, not the guess in isolation.

### SE Lens

The alternative to deriving `astar-search` as a minimal, traceable one-expression change to `greedy-best-first` is presenting it as an unrelated new algorithm requiring its own from-scratch justification. The real value of the minimal-diff derivation, the identical discipline Lesson 116 and Lesson 138 both already used: it makes visible, precisely, that adding `g(n)` back into the ranking — and nothing else — is the entire real fix, rather than leaving a reader to wonder whether some other unstated difference between the two algorithms is doing the actual work.

### Run It — Show the Real Output

```
$ guile astar-check.scm
=== CU2: A* on the identical graph ===
A* moves S to G: 2
```

Verified this session — A\*, given the identical graph and the identical heuristic that fooled greedy best-first, finds the real, true `2`-move shortest path, confirmed by the execution trace above and matching Lesson 138's own independent brute-force result exactly.

---

## Concept Unit 3: The Real Cost of a Guarantee

### The Problem

Concept Unit 2 fixed a real failure. It's worth checking, honestly, what this fix actually costs in practice — on a real, larger problem, does weighing real cost alongside estimate make A\* slower than greedy best-first, and by how much, compared to blind search's own real cost?

### Reference Source

`bfs-implicit` and its queue helpers — quoted unchanged in this lesson's own Header, originally Lesson 135. `grid-neighbors` — quoted unchanged in this lesson's own Header, originally Lesson 114. `h-grid` — quoted unchanged in this lesson's own Header, originally Lesson 138.

### Files affected

Modified: `astar-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define wall-col 5)
(define (blocked? r c) (and (= c wall-col) (>= r 0) (<= r 8)))
(define (grid-neighbors-walled r c size)
  (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size) (not (blocked? (car p) (cdr p)))))
          (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1)))))
```

### The Updated Project

This is `astar-check.scm`, with Concept Unit 2's own file extended by a real, walled `10×10` grid and a real three-way comparison:

```scheme
;; ... Concept Unit 1 and 2's code above, unchanged ...
;; ... grid-neighbors, from this lesson's own Header, above ...

(define grid-size 10)                                                ; ← new
(define start (cons 0 0))                                               ; ← new
(define goal (cons 0 9))                                                   ; ← new
(define (h-grid v) (+ (abs (- (car v) (car goal))) (abs (- (cdr v) (cdr goal))))) ; ← new

(define wall-col 5)                                                  ; ← new
(define (blocked? r c) (and (= c wall-col) (>= r 0) (<= r 8)))          ; ← new
(define (grid-neighbors-walled r c size)                                  ; ← new
  (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size) (not (blocked? (car p) (cdr p))))) ; ← new
          (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1))))) ; ← new

(define visited-blind 0)                                             ; ← new
(define (succ-blind v) (set! visited-blind (+ visited-blind 1)) (grid-neighbors-walled (car v) (cdr v) grid-size)) ; ← new
(define visited-greedy 0)                                               ; ← new
(define (succ-greedy v) (set! visited-greedy (+ visited-greedy 1)) (grid-neighbors-walled (car v) (cdr v) grid-size)) ; ← new
(define visited-astar 0)                                                   ; ← new
(define (succ-astar v) (set! visited-astar (+ visited-astar 1)) (grid-neighbors-walled (car v) (cdr v) grid-size)) ; ← new

(display "=== CU3: three-way comparison, 10x10 grid with a wall, (0,0) to (0,9) ===") (newline) ; ← new
(display "blind BFS moves: ") (display (bfs-implicit start (lambda (v) (equal? v goal)) succ-blind)) (display " states: ") (display visited-blind) (newline) ; ← new
(display "greedy best-first moves: ") (display (greedy-best-first start (lambda (v) (equal? v goal)) succ-greedy h-grid)) (display " states: ") (display visited-greedy) (newline) ; ← new
(display "A* moves: ") (display (astar-search start (lambda (v) (equal? v goal)) succ-astar h-grid)) (display " states: ") (display visited-astar) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define wall-col 5)`** — a fixed column index, first appearance in this lesson, marking where this unit's own real obstacle sits.
- **`(define (blocked? r c) (and (= c wall-col) (>= r 0) (<= r 8)))`** — first appearance of `blocked?`; `and` requires every sub-expression true; a cell is blocked exactly when its column equals `wall-col` and its row falls between `0` and `8` inclusive — leaving row `9` as the wall's own single real gap.
- **`(not (blocked? (car p) (cdr p)))`** in `grid-neighbors-walled` — `not` inverts a boolean; added as one more real condition alongside `grid-neighbors`'s own four bounds checks, excluding any candidate that `blocked?` reports true for.
- **Three separately-named counters, `visited-blind`/`visited-greedy`/`visited-astar`, and three separately-named wrapper procedures** — the identical instrumentation technique used throughout this curriculum since Lesson 92, applied three times over so each of the three real algorithms' own real cost can be measured independently, in the same real run, without one algorithm's count contaminating another's.
- **The real, exact `27` moves from all three algorithms, alongside three real, different state-expansion counts — `90`, `49`, `63`** — direct, measured confirmation that every algorithm here finds the identical true shortest path around the wall, but at genuinely different real costs: blind search touches the most, greedy the fewest, and A\* sits in between.

### CS Lens

This is Lesson 132's own greedy-algorithm-abstraction lens, applied here to search strategy rather than a greedy construction step: greedy best-first's own real cheapness on this particular instance is not a general property of the algorithm — it is this specific instance rewarding a strategy with no real safety net, the same way Lesson 132's own `greedy-build` template happened to match Kruskal's real correctness on some inputs and diverge from it on others, depending entirely on what the comparison quantity actually captures.

### SE Lens

The alternative to running this real, three-way comparison is assuming A\*'s own real guarantee comes for free, with no real trade-off against Concept Unit 1's own cheaper-but-riskier greedy best-first. The real, measured cost here — `63` states versus greedy's own `49`, a real `29%` increase — is the honest price of A\*'s own real safety net: it never fully trusts an estimate the way greedy best-first does, so it keeps a wider set of real possibilities open, verified by real cost, before committing. On this particular instance, that safety net wasn't strictly *needed* — greedy also happened to find the true optimum — but Concept Unit 1's own real evidence, and this lesson's own closing Concept Unit 4, are exactly why "happened to" is not something a real system should be built to depend on.

### Run It — Show the Real Output

```
$ guile astar-check.scm
=== CU3: three-way comparison, 10x10 grid with a wall, (0,0) to (0,9) ===
blind BFS moves: 27 states: 90
greedy best-first moves: 27 states: 49
A* moves: 27 states: 63
```

Verified this session — all three real algorithms find the identical, true `27`-move shortest path around the wall, at three real, different measured costs: `90` states for blind search, `49` for greedy best-first, `63` for A\*.

---

## Concept Unit 4: The Guarantee's Own Real Condition

### The Problem

Concept Unit 3 showed A\* pays a real, modest cost for a real guarantee. It's worth checking, honestly, what that guarantee actually rests on — Lesson 138 named admissibility as the property a heuristic needs; this unit checks, with real code, whether A\* actually needs it too, or whether adding `g(n)` back in was enough on its own regardless of the heuristic's own real quality.

### Reference Source

No reference counterpart — a small, from-scratch modification of this lesson's own Concept Unit 1 heuristic, `h-ex`, built specifically to violate admissibility at exactly one state and check the real consequence.

### Files affected

Modified: `astar-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### Applying It — Breaking Admissibility on Purpose

`h-ex`, from Concept Unit 1, assigned `a` a real value of `1` — exactly `a`'s own true remaining distance, tight and admissible. This unit's own `h-ex-bad` changes exactly that one value, to `10` — a real, deliberate overestimate of `a`'s own true remaining cost of `1`, violating admissibility at precisely the one state whose real path was the true shortcut.

### The New Code — Type It Yourself

```scheme
(define (h-ex-bad v)
  (cond ((eq? v 's) 2) ((eq? v 'a) 10) ((eq? v 'b) 0)
        ((eq? v 'c) 0) ((eq? v 'd) 0) ((eq? v 'g) 0) (else 999)))
```

### The Updated Project

This is `astar-check.scm`, with Concept Unit 3's own file extended by this unit's own deliberately inadmissible heuristic and a real, final run:

```scheme
;; ... Concept Unit 1, 2, and 3's code above, unchanged ...

(define (h-ex-bad v)                                                 ; ← new
  (cond ((eq? v 's) 2) ((eq? v 'a) 10) ((eq? v 'b) 0)                   ; ← new
        ((eq? v 'c) 0) ((eq? v 'd) 0) ((eq? v 'g) 0) (else 999)))          ; ← new

(display "=== CU4: A* with an inadmissible heuristic ===") (newline)      ; ← new
(display "A* moves S to G (bad h): ") (display (astar-search 's (lambda (v) (eq? v 'g)) successors-ex h-ex-bad)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (h-ex-bad v) ...)`** — first appearance in this lesson of a heuristic function built specifically to fail; identical `cond`/`eq?` shape to `h-ex`, with exactly one value, `a`'s own, changed.
- **`((eq? v 'a) 10)`** — the one real change: `10` in place of `h-ex`'s own `1`, a real overestimate of `a`'s own true remaining distance, `1` — this single value is no longer admissible.
- **`(astar-search 's (lambda (v) (eq? v 'g)) successors-ex h-ex-bad)`** — the identical `astar-search`, given full treatment in Concept Unit 2, reused completely unchanged; only the heuristic argument differs from Concept Unit 2's own call.
- **The real, exact `4`** — direct, measured confirmation that A\*, given an inadmissible heuristic, returns the identical wrong answer greedy best-first did on the original, admissible version: `a`'s own real `f`-value, now `g(1) + h(10) = 11`, is worse than the long branch's own climbing-but-still-lower `f`-values, so `a` gets passed over exactly as it was under plain `h`-alone ranking — the real cost-tracking fix Concept Unit 2 added never gets a chance to help, because the corrupted estimate itself is now wrong at the one state that mattered.

### CS Lens

This is Lesson 126's own real lesson, encountered a second time in a new setting: Dijkstra's own real correctness guarantee depended on a stated, checkable assumption — non-negative edge weights — and broke, concretely, the moment that assumption was violated, not gradually or unpredictably. A\*'s own guarantee depends on the identical shape of assumption, admissibility, and breaks the identical way — precisely, not vaguely — the moment it's violated.

### SE Lens

The alternative to checking this real boundary condition directly is trusting that A\*'s own real fix from Concept Unit 2 is unconditionally safe, since it fixed Concept Unit 1's own real failure. The real cost of that trust: a real system feeding A\* a heuristic that seems reasonable but happens to overestimate somewhere — an easy real mistake, since nothing about a heuristic function's own code announces whether it's admissible — would silently inherit greedy best-first's own exact failure mode, with no warning, despite using "the algorithm with the guarantee." The real discipline this unit's own evidence argues for: admissibility has to be checked, the same real way Lesson 138's own table checked it state by state, not assumed because an algorithm's name sounds trustworthy.

### Run It — Show the Real Output

```
$ guile astar-check.scm
=== CU4: A* with an inadmissible heuristic ===
A* moves S to G (bad h): 4
```

Verified this session — A\*, given a heuristic that overestimates at exactly one real state, returns the identical wrong `4`-move answer greedy best-first returned in Concept Unit 1, direct, real confirmation that A\*'s own optimality guarantee is conditional on admissibility, not automatic.

---

## Closing

### Connect the pieces

One real six-state graph, one real obstacle grid, one guarantee and its own real condition:

1. **The gap, reconfirmed (Unit 1):** greedy best-first, real and admissible heuristic alike, still returns `4` instead of the true `2`.
2. **The minimal fix, derived and traced (Unit 2):** `f(n) = g(n) + h(n)`, one real expression added; the identical graph now returns the true `2`, every real step of the divergence from greedy best-first traced by hand against real, printed output.
3. **The real cost of the fix, measured honestly (Unit 3):** `90` blind, `49` greedy, `63` A\* — all three correct, at three genuinely different real prices.
4. **The guarantee's own real boundary (Unit 4):** break admissibility at exactly one state, and A\* fails the identical way greedy best-first did — the fix from Unit 2 is real, but conditional, not magic.

Every claim in this lesson traces to real, executed code: a full execution trace showing precisely where A\* and greedy best-first diverge, an honest three-way cost comparison, and a real, deliberately broken heuristic confirming exactly what A\*'s own guarantee depends on.

### What breaks without this

Suppose a real navigation system used greedy best-first search, the way Lesson 138's own real evidence might tempt a system designer who only ever tested it on easy, obstacle-free routes (exactly this lesson's own open-grid case from Lesson 138, where greedy already found the true optimum). Concept Unit 1's own graph, and Concept Unit 4's own broken-heuristic run, both show precisely what a harder real route — one requiring a real trade-off between a state that looks good right now and a state that's already most of the way there — would expose: a route recommendation that's honestly, measurably longer than necessary, with nothing in the system's own output revealing that a better option was available the entire time.

### Exercises

1. **Observe.** Before checking, predict whether `astar-search`, run on Concept Unit 1's own graph with `h-ex-bad`, would still find the true shortest path if the overestimate at `a` were changed from `10` to `2` instead (still inadmissible, since `2 > 1`, but less severely), using this lesson's own real `f`-value arithmetic to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Modify Concept Unit 3's own `astar-search` call to also count, separately, how many times a state gets discovered *more than once* at a worse `g`-value than it was first recorded with (a real possibility this lesson's own `astar-search` currently ignores, since it never updates `dist` after a state's first discovery) — report whether this happens at all on the wall grid, and explain, referencing your own real result, whether it could happen on a grid where all real edge costs are equal to `1`.
4. **Explain.** In your own words, explain why `frontier-extract-min` needed zero code changes to go from ranking by `h` (Lesson 138) to ranking by `f` (this lesson), referencing what the procedure does and does not know about the meaning of the values it compares.
5. **Explain.** Using this lesson's own real numbers from Concept Unit 3, explain why A\* expanding more states than greedy best-first, `63` versus `49`, is evidence of A\*'s own carefulness rather than a real inefficiency — referencing Concept Unit 1's own graph as the concrete case that carefulness protects against.

### Definition of done

- [ ] You can state the real formula `f(n) = g(n) + h(n)` and explain, in your own words, what real problem each of its two terms solves on its own.
- [ ] You can point to this lesson's own real execution trace (Concept Unit 2) and name the exact step where A\*'s own choice diverges from greedy best-first's.
- [ ] You can explain why A\*'s own real guarantee depends on admissibility, referencing Concept Unit 4's own real, broken-heuristic result.
- [ ] You completed Exercises 1–5, including a real, checked prediction about a partially-broken heuristic.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
