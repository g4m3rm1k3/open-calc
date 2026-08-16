# Lesson 140: Bidirectional Search

**What you will build:** **bidirectional search** — running two real breadth-first searches at once, one forward from the start, one backward from the goal, alternating one full layer at a time, and stopping the instant any single state has been discovered by both sides. Real, verified evidence this session: on Lesson 135's own numeric puzzle (start `0`, real moves `+3`, `+5`, `×2`), reaching a real target of `100000` — an honest `18` real moves away — ordinary one-directional search expands `39185` real states before finding it; bidirectional search, given a genuine, independently-checked *inverse* set of backward moves, finds the identical, correct `18`-move answer while expanding only `407` real states, a real `96×` reduction. Run across eight real targets at increasing real depth, the same real pattern holds every time and the real gap keeps widening — `2.7×` at `4` moves, `10×` at `10` moves, `96×` at `18` moves — direct, measured evidence that meeting in the middle gets more valuable, not less, exactly as real search depth grows. The transferable point: this is not a faster way to run the identical search — it is a genuinely different shape of search, symmetric in a way ordinary one-directional search never is, and it depends on a real, checkable requirement ordinary search never needed: knowing not just how to move forward from a state, but how to move backward into one.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 135's own real numeric-puzzle domain and Lesson 117's own real, inductive proof that breadth-first search discovers every state at its own true shortest distance — both explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **State** — a single, specific, comparable configuration of whatever problem is being searched; in this lesson's own domain, a real integer.
- **State-space search** — searching a graph whose states and legal moves between them are never stored anywhere, only computed on demand by a real `successors` function given one state at a time.
- **Branching factor** — the real number of successors a typical state has. This lesson's own domain has a branching factor of `3` in the forward direction (three real moves, `+3`, `+5`, `×2`, from almost every state) — the concrete quantity behind why one-directional search's own real cost grows so quickly with depth: each additional real move multiplies the number of states reachable by roughly the branching factor again.
- **Predecessor function** — a real function taking one state and returning every state that could have reached it in exactly one forward move — the genuine *inverse* of a `successors` function. It exists because searching backward from a goal requires knowing not just what a state can become, but what could have become it, and for most real problems those are two genuinely different real computations, not the same function run in reverse.
- **Bidirectional search** — a state-space search maintaining two real frontiers at once, one grown forward from the start via `successors`, one grown backward from the goal via a real predecessor function, alternately expanding one full layer of whichever side's turn it is, and stopping the moment any single state appears in both sides' own real distance records.
- **Meeting point** — the real state, discovered independently by both the forward and backward searches, at which they first overlap. Its own real total path length is the sum of its forward distance and its backward distance — two real, independently-computed numbers, added together only once both are known.

**Objects and methods used**

- **`forward-succ`**
  - *What it is:* this lesson's own real forward-moves function for Lesson 135's own numeric puzzle, extended with a real, larger bound so this lesson's own deeper real targets stay reachable.
  - *Implementation:* `(define (forward-succ n) (filter (lambda (x) (<= x bound)) (list (+ n 3) (+ n 5) (* n 2))))` — the identical real moves, `+3`, `+5`, `×2`, Lesson 135 established, filtered against `bound`, this lesson's own `1000000` rather than Lesson 135's own `200`.
  - *Its use:* every forward-direction expansion in this lesson, in both the one-directional baseline and the forward half of bidirectional search.
- **`backward-succ`**
  - *What it is:* this lesson's own predecessor function for the identical puzzle — the real inverse of `forward-succ`.
  - *Implementation:* given full, real derivation in Concept Unit 2 below.
  - *Its use:* the backward half of every bidirectional search this lesson runs.
- **`expand-frontier`**
  - *What it is:* this lesson's own procedure for advancing one real frontier by exactly one full layer.
  - *Implementation:* takes a list of states (`frontier`), a real distance record (`dist`), and a `successors`-shaped procedure; expands every state currently in `frontier`, recording each newly-discovered neighbor's real distance and collecting them into a fresh list; returns both the updated distance record and that fresh list, paired via `cons`. Full body given real treatment in Concept Unit 3.
  - *Its use:* both the forward and backward sides of `bidirectional-bfs`, called with different real successor functions but identical logic either way.
- **`find-common`**
  - *What it is:* a real procedure checking whether any state in a list has already been recorded in a given distance table.
  - *Implementation:* `(define (find-common states dist) (cond ((null? states) #f) ((assoc (car states) dist) (car states)) (else (find-common (cdr states) dist))))` — a real, direct recursive scan, returning the first real match found, or `#f` if none exists.
  - *Its use:* the one real check, run after every layer expansion in `bidirectional-bfs`, deciding whether the two searches have met.
- **`bidirectional-bfs`**
  - *What it is:* this lesson's own real search procedure, alternating forward and backward layer expansions until a real meeting point is found.
  - *Implementation:* given full, real treatment in Concept Unit 3 below.
  - *Its use:* every real search result reported from Concept Unit 3 onward.
- **`bfs-implicit`** / **`make-queue`, `queue-empty?`, `enqueue`, `dequeue`, `queue-front`**
  - *What it is:* a state-space search expanding its own frontier in strict discovery order via a real First-In-First-Out queue — this curriculum's own one-directional baseline since Lesson 135.
  - *Implementation:* a queue is two ordinary lists (`make-queue` returns two empty lists; `enqueue` adds to the front of the back-list; `dequeue`/`queue-front` remove from, or read, the front-list, reversing the back-list into a fresh front-list whenever the front-list runs empty). `bfs-implicit` takes `start`, `goal?`, `successors`; maintains a real distance record and this queue; each iteration dequeues the front state, checks `goal?`, and otherwise expands every real neighbor not already recorded, at one more than the current state's own real distance.

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

  - *Its use:* this lesson's own real one-directional baseline in Concept Unit 1, and the correctness check every one of this lesson's real bidirectional results is measured against.

---

## Concept Unit 1: How Fast the Real Cost Grows

### The Problem

Lesson 135's own real evidence showed `bfs-implicit` reaching a target `17` moves — I mean, `17` as a value, `4` real moves — away, after expanding `16` of the puzzle's own `201` reachable states. That real fraction, `16/201`, looked small. It's worth asking, honestly, what happens to that fraction as the real target gets farther away — whether the real cost keeps growing slowly, or whether it starts consuming most of the reachable space, the way a search's own branching factor would predict if nothing kept it in check.

### No isolated lab for this step

This unit introduces no new construct — `bfs-implicit`, given full, real treatment in this lesson's own Header above, is applied here unchanged, to a real target much farther away than any this curriculum has used it on before.

### Reference Source

`bfs-implicit` and its queue helpers — quoted unchanged in this lesson's own Header above, originally Lesson 135.

### Files affected

Created: `bidirectional-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define bound 1000000)
(define (forward-succ n) (filter (lambda (x) (<= x bound)) (list (+ n 3) (+ n 5) (* n 2))))
```

### The Updated Project

This is `bidirectional-check.scm`, in full — Lesson 135's own `make-queue`/`queue-empty?`/`enqueue`/`dequeue`/`queue-front`/`bfs-implicit`, quoted unchanged from this lesson's own Header above, with this unit's own larger bound and a real, far-target run:

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

(define bound 1000000)                                              ; ← new
(define (forward-succ n) (filter (lambda (x) (<= x bound)) (list (+ n 3) (+ n 5) (* n 2)))) ; ← new

(define visited-uni 0)                                                  ; ← new
(define (succ-uni v) (set! visited-uni (+ visited-uni 1)) (forward-succ v)) ; ← new
(define target 100000)                                                        ; ← new

(display "=== CU1: one-directional search, a real target far away ===") (newline) ; ← new
(display "target: ") (display target) (newline)                                     ; ← new
(display "moves: ") (display (bfs-implicit 0 (lambda (v) (= v target)) succ-uni)) (newline) ; ← new
(display "real states expanded: ") (display visited-uni) (newline)                     ; ← new
```

### Mechanical Walkthrough

- **`(define bound 1000000)`** — first appearance in this lesson of `bound`; a real, much larger ceiling than Lesson 135's own `200`, needed because this unit's own target, `100000`, sits well past that earlier bound.
- **`(define (forward-succ n) ...)`** — first appearance in this lesson of `forward-succ`; identical real structure to Lesson 135's own `successors` — `filter`, a real Scheme procedure keeping only the list elements a given predicate returns true for, applied to the three real candidate moves, `(+ n 3)`, `(+ n 5)`, `(* n 2)`, each built with ordinary arithmetic.
- **`(set! visited-uni (+ visited-uni 1))`** — the identical real counting instrumentation this curriculum has used since Lesson 92, wrapped around `forward-succ` to measure real states expanded.
- **`(bfs-implicit 0 (lambda (v) (= v target)) succ-uni)`** — calls `bfs-implicit`, given full real treatment in this lesson's own Header, starting from `0`, with a real goal predicate comparing directly against `target` via `=`.
- **The real, exact `18` moves, alongside the real, exact `39185` states expanded** — direct, measured confirmation that as the real target moves farther away, the real cost of one-directional search does not grow gently: `39185` states is nearly `40,000` real states touched to answer a question whose own real answer is a mere `18` moves.

### CS Lens

This is Lesson 78's own divide-and-conquer cost intuition, run in reverse: where `dc-max`'s own real cost, `2n - 1`, grew *linearly* with real input size, a state-space search's own real cost grows with the branching factor raised to the real depth — a fundamentally faster-growing real shape, and the concrete reason a `2`-move increase in real target distance (from `16` moves to `18`, later in this lesson) can multiply real search cost far more than proportionally.

### SE Lens

The alternative to measuring this real growth directly is trusting that "search cost scales roughly with distance," an intuition this unit's own real numbers directly refute: real distance grew by roughly `4.5×` (from Lesson 135's own `4`-move target to this unit's `18`-move one) while real states expanded grew by roughly `2450×` (from `16` to `39185`). A real system relying on the gentler intuition would badly underestimate how expensive a "just a bit farther" search request could become.

### Run It — Show the Real Output

```
$ guile bidirectional-check.scm
=== CU1: one-directional search, a real target far away ===
target: 100000
moves: 18
real states expanded: 39185
```

Verified this session — reaching a real target `18` moves away costs `bfs-implicit` `39185` real states expanded, direct, measured evidence that one-directional search's own real cost accelerates sharply as depth grows.

---

## Concept Unit 2: A Real Inverse, Not the Same Function Twice

### The Problem

Meeting in the middle requires a real search growing backward from the goal — not simply running `forward-succ` again starting at `target` instead of `0`, since `forward-succ` only ever describes what a state can *become*, never what could have *become* it. A genuinely new real function is needed: given a state, return every state that could have reached it in one real forward move.

### Reference Source

No reference counterpart — a from-scratch derivation of the real inverse of Lesson 135's own `+3`/`+5`/`×2` moves.

### Files affected

Modified: `bidirectional-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 1 file).

### Dependencies

The Guile interpreter.

### Applying It — Deriving Each Real Inverse Move

Each of `forward-succ`'s own three real moves needs its own real inverse. `+3`'s own inverse is `-3`: if `n` could reach `n + 3`, then `n + 3` could only have been reached, by this specific move, from `n`. The identical real argument gives `-5` as `+5`'s own inverse. `×2`'s own inverse is division by `2` — but only real, valid when the state itself is even, since an odd state could never have been produced by doubling any real integer.

### The New Code — Type It Yourself

```scheme
(define (backward-succ n)
  (filter (lambda (x) (and (>= x 0) (<= x bound)))
          (append (list (- n 3) (- n 5)) (if (even? n) (list (quotient n 2)) '()))))
```

### The Updated Project

This is `bidirectional-check.scm`, with Concept Unit 1's own file extended by `backward-succ` and a real, direct check that it genuinely reverses `forward-succ`:

```scheme
;; ... Concept Unit 1's code above, unchanged ...

(define (backward-succ n)                                            ; ← new
  (filter (lambda (x) (and (>= x 0) (<= x bound)))                       ; ← new
          (append (list (- n 3) (- n 5)) (if (even? n) (list (quotient n 2)) '())))) ; ← new

(display "=== CU2: a real, checked inverse ===") (newline)               ; ← new
(display "forward-succ(3): ") (display (forward-succ 3)) (newline)          ; ← new
(display "backward-succ(6): ") (display (backward-succ 6)) (newline)           ; ← new
(display "forward-succ(11): ") (display (forward-succ 11)) (newline)              ; ← new
(display "backward-succ(14): ") (display (backward-succ 14)) (newline)               ; ← new
```

### Mechanical Walkthrough

- **`(define (backward-succ n) ...)`** — first appearance in this lesson of this procedure; one argument, a state, returning every real state that could have produced it in one forward move.
- **`(list (- n 3) (- n 5))`** — the two real, always-valid inverse moves: `n - 3` undoes a real `+3`, `n - 5` undoes a real `+5`.
- **`(even? n)`** — first appearance in this lesson of `even?`, a real Scheme predicate true exactly for integers divisible by `2`; guards the third real candidate, since only an even state could possibly have been reached by doubling.
- **`(if (even? n) (list (quotient n 2)) '())`** — when `n` is even, includes its real half, `(quotient n 2)`, as a candidate; otherwise contributes nothing, `'()`, the empty list — `append`, a real Scheme procedure joining two lists end to end, then combines this conditional single-or-empty list with the two always-present ones above.
- **`(filter (lambda (x) (and (>= x 0) (<= x bound))) ...)`** — the identical real bounds-filtering idea `forward-succ` uses, guarding against a real negative result (an inverse move going below `0`, which no real forward search would ever have produced) as well as the upper `bound`.
- **The real, exact `3` appearing in `backward-succ(6)`'s own output, matching `forward-succ(3)`'s own real inclusion of `6`; the real, exact `11` appearing in `backward-succ(14)`'s own output, matching `forward-succ(11)`'s own real inclusion of `14`** — direct, checked confirmation, on two real, independent examples, that `backward-succ` genuinely reverses `forward-succ`: a state reachable *from* `n` by a real forward move is confirmed reachable *to* that same state's own image, going backward.

### Naming the General Idea — the Isolated Lab

`backward-succ`'s own real logic — three real cases, two unconditional, one guarded — is specific to this lesson's own puzzle. The general idea underneath it is worth isolating on something with none of that real complexity:

```scheme
(define (add-one n) (+ n 1))
(define (sub-one n) (- n 1))
(display "add-one(5): ") (display (add-one 5)) (newline)
(display "sub-one(add-one(5)): ") (display (sub-one (add-one 5))) (newline)
```

Run directly:

```
$ guile
add-one(5): 6
sub-one(add-one(5)): 5
```

This is exactly what `forward-succ`/`backward-succ` above are doing, isolated down to the simplest possible real case: `add-one` and `sub-one` are real, genuine **inverse operations** — applying one and then the other returns the original real value, confirmed directly by `sub-one(add-one(5))` returning the exact real `5` it started from. `forward-succ`/`backward-succ` are the identical real idea, just one real level more complex: each of `forward-succ`'s own three moves needs its own real inverse move, and — the one genuine complication this simple example has no room to show — not every real inverse is always valid everywhere, exactly why `backward-succ`'s own `÷2` branch needed a real `even?` guard that `add-one`/`sub-one` never needed at all.

This throwaway example is now discarded — `add-one` and `sub-one` never appear again in this lesson; `forward-succ` and `backward-succ`, already shown above, are this lesson's own real, kept pair going forward.

### CS Lens

This is Lesson 17's own relation-and-its-inverse idea, recognized in a genuinely new setting: a relation's inverse swaps the roles of "related to" and "related from," the identical real swap `backward-succ` performs on `forward-succ`'s own real moves. Also recognized in: a database's own foreign-key relationship, queryable in either direction — "which orders does this customer have" versus "which customer placed this order" — each direction requiring its own real query, not a mechanical reversal of the other; a real accounting ledger's debit and credit view of the identical transaction, two genuinely different real records of one real event.

### SE Lens

The alternative to deriving a genuine, checked `backward-succ` is assuming any forward-moving `successors` function can simply be "run backward" by some generic mechanism. The real cost of that assumption: for a real problem whose forward moves are not obviously reversible — this lesson's own `×2`, valid to reverse only for even states, is a small real example of a much larger real pattern (many real transformations genuinely lose information, and cannot be reversed at all without extra real bookkeeping) — a system built on that false assumption would either silently miss real backward moves or silently invent ones that were never real, and this lesson's own direct, checked confirmation above is exactly the discipline that catches the difference before it corrupts a real search.

### Run It — Show the Real Output

```
$ guile bidirectional-check.scm
=== CU2: a real, checked inverse ===
forward-succ(3): (6 8 6)
backward-succ(6): (3 1 3)
forward-succ(11): (14 16 22)
backward-succ(14): (11 9 7)
```

Verified this session — `backward-succ` genuinely reverses `forward-succ` on two real, independent checks: `3`'s own real forward moves include `6`, and `6`'s own real backward moves include `3`; `11`'s own real forward moves include `14`, and `14`'s own real backward moves include `11`.

---

## Concept Unit 3: Deriving Bidirectional Search

### The Problem

Concept Unit 2 built a real, checked way to move backward. It needs to actually drive two real searches — one forward from the start, one backward from the goal — advancing them in a way that provably finds the true shortest combined real path the moment they first meet.

### Reference Source

No reference counterpart — a from-scratch derivation, structured around Lesson 135's own `bfs-implicit`, given full real treatment in this lesson's Header, but restructured to advance one full real layer at a time rather than one state at a time, since layer-by-layer advancement is what makes the real correctness argument below hold.

### Files affected

Modified: `bidirectional-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — Why Full Layers, and Why the First Meeting Is Real Proof of Optimality

Lesson 117's own real, inductive proof established that `bfs-implicit` discovers every state at its own true shortest real distance, because it processes discovery in strictly non-decreasing distance order — every state at real distance `k` gets fully discovered before any state at real distance `k + 1` is ever reached. That identical real guarantee holds independently for a forward search from `start` and a backward search from `goal`, provided each one, on its own, still respects that same real layer-by-layer discipline. Advancing both searches strictly one full layer at a time, alternating sides, preserves that guarantee for each side individually — and gives a further real property neither search alone has: the *first* state ever found in both sides' own real distance records is guaranteed to be a true shortest-real-distance meeting point, because any state reachable by a shorter real combined path would necessarily have completed both its own forward and backward discovery in an earlier round, given both sides advance in the identical real lockstep.

### The New Code — Type It Yourself

```scheme
(define (expand-frontier frontier dist successors)
  (let loop ((states frontier) (dist dist) (new-frontier '()))
    (if (null? states)
        (cons dist new-frontier)
        (let* ((v (car states)) (d (cdr (assoc v dist))))
          (let loop2 ((ns (successors v)) (dist dist) (new-frontier new-frontier))
            (if (null? ns)
                (loop (cdr states) dist new-frontier)
                (if (assoc (car ns) dist)
                    (loop2 (cdr ns) dist new-frontier)
                    (loop2 (cdr ns) (cons (cons (car ns) (+ d 1)) dist) (cons (car ns) new-frontier)))))))))

(define (find-common states dist)
  (cond ((null? states) #f)
        ((assoc (car states) dist) (car states))
        (else (find-common (cdr states) dist))))

(define (bidirectional-bfs start goal fsucc bsucc)
  (let loop ((dist-f (list (cons start 0))) (frontier-f (list start))
             (dist-b (list (cons goal 0))) (frontier-b (list goal))
             (turn 'f))
    (if (eq? turn 'f)
        (let* ((result (expand-frontier frontier-f dist-f fsucc))
               (new-dist-f (car result)) (new-frontier-f (cdr result))
               (meet (find-common new-frontier-f dist-b)))
          (if meet
              (+ (cdr (assoc meet new-dist-f)) (cdr (assoc meet dist-b)))
              (loop new-dist-f new-frontier-f dist-b frontier-b 'b)))
        (let* ((result (expand-frontier frontier-b dist-b bsucc))
               (new-dist-b (car result)) (new-frontier-b (cdr result))
               (meet (find-common new-frontier-b dist-f)))
          (if meet
              (+ (cdr (assoc meet dist-f)) (cdr (assoc meet new-dist-b)))
              (loop dist-f frontier-f new-dist-b new-frontier-b 'f))))))
```

### The Updated Project

This is `bidirectional-check.scm`, with Concept Unit 2's own file extended by this unit's own three real procedures and a real, small-target run:

```scheme
;; ... Concept Unit 1 and 2's code above, unchanged ...

(define (expand-frontier frontier dist successors)                   ; ← new
  (let loop ((states frontier) (dist dist) (new-frontier '()))          ; ← new
    (if (null? states)                                                     ; ← new
        (cons dist new-frontier)                                              ; ← new
        (let* ((v (car states)) (d (cdr (assoc v dist))))                        ; ← new
          (let loop2 ((ns (successors v)) (dist dist) (new-frontier new-frontier))  ; ← new
            (if (null? ns)                                                             ; ← new
                (loop (cdr states) dist new-frontier)                                     ; ← new
                (if (assoc (car ns) dist)                                                    ; ← new
                    (loop2 (cdr ns) dist new-frontier)                                          ; ← new
                    (loop2 (cdr ns) (cons (cons (car ns) (+ d 1)) dist) (cons (car ns) new-frontier)))))))))) ; ← new

(define (find-common states dist)                                    ; ← new
  (cond ((null? states) #f)                                             ; ← new
        ((assoc (car states) dist) (car states))                           ; ← new
        (else (find-common (cdr states) dist))))                              ; ← new

(define (bidirectional-bfs start goal fsucc bsucc)                   ; ← new
  (let loop ((dist-f (list (cons start 0))) (frontier-f (list start))   ; ← new
             (dist-b (list (cons goal 0))) (frontier-b (list goal))        ; ← new
             (turn 'f))                                                       ; ← new
    (if (eq? turn 'f)                                                            ; ← new
        (let* ((result (expand-frontier frontier-f dist-f fsucc))                   ; ← new
               (new-dist-f (car result)) (new-frontier-f (cdr result))                 ; ← new
               (meet (find-common new-frontier-f dist-b)))                                ; ← new
          (if meet                                                                           ; ← new
              (+ (cdr (assoc meet new-dist-f)) (cdr (assoc meet dist-b)))                        ; ← new
              (loop new-dist-f new-frontier-f dist-b frontier-b 'b)))                               ; ← new
        (let* ((result (expand-frontier frontier-b dist-b bsucc))                                      ; ← new
               (new-dist-b (car result)) (new-frontier-b (cdr result))                                    ; ← new
               (meet (find-common new-frontier-b dist-f)))                                                   ; ← new
          (if meet                                                                                              ; ← new
              (+ (cdr (assoc meet dist-f)) (cdr (assoc meet new-dist-b)))                                          ; ← new
              (loop dist-f frontier-f new-dist-b new-frontier-b 'f)))))) ; ← new

(display "=== CU3: bidirectional search, a small real target ===") (newline) ; ← new
(display "target: 25") (newline)                                               ; ← new
(display "moves: ") (display (bidirectional-bfs 0 25 forward-succ backward-succ)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (expand-frontier frontier dist successors) ...)`** — first appearance in this lesson of this procedure; three arguments — the current real frontier (a plain list of states), the current real distance record, and whichever real successor function this call should use.
- **`(let loop ((states frontier) (dist dist) (new-frontier '())) ...)`** — a named-let, carrying three real values forward: `states`, the not-yet-processed members of the current layer; `dist`, threaded and updated as new states are discovered; `new-frontier`, accumulating exactly this call's own newly-discovered states — next real layer, not yet processed.
- **`(null? states)` / `(cons dist new-frontier)`** — once every state in the current layer has been processed, returns both real results together, the updated distance record and the freshly-built next layer, as one combined value.
- **`(let* ((v (car states)) (d (cdr (assoc v dist)))) ...)`** — reads the next state to expand and its own already-known real distance, the identical real pattern `bfs-implicit` itself uses.
- **`(let loop2 ((ns (successors v)) (dist dist) (new-frontier new-frontier)) ...)`** — a second named-let, walking `v`'s own real neighbors, threading the *same* `dist`/`new-frontier` names forward so each neighbor's own real discovery accumulates correctly before moving to the next state in `states`.
- **`(if (assoc (car ns) dist) (loop2 (cdr ns) dist new-frontier) ...)`** — the identical already-discovered check every search in this curriculum has used since Lesson 116: if a candidate neighbor is already in `dist`, it contributes nothing new.
- **`(loop2 (cdr ns) (cons (cons (car ns) (+ d 1)) dist) (cons (car ns) new-frontier))`** — records the real new state's own distance, one more than `v`'s own, and adds it to the accumulating next layer.
- **`(define (find-common states dist) ...)`** — first appearance in this lesson; `cond` tries each clause in order; `(null? states)` returns `#f` once every candidate has been checked with no match; `(assoc (car states) dist)` checks whether the current candidate is already a key in `dist` — if so, returns that candidate directly, the real meeting point; otherwise recurses on the rest of the list.
- **`(define (bidirectional-bfs start goal fsucc bsucc) ...)`** — first appearance in this lesson; four arguments — the two real endpoints and the two real, direction-specific successor functions Concept Unit 2 derived.
- **`(let loop ((dist-f ...) (frontier-f ...) (dist-b ...) (frontier-b ...) (turn 'f)) ...)`** — a named-let carrying five real values: both sides' own distance records and current-layer frontiers, plus `turn`, a real symbol, `'f` or `'b`, tracking whose round it is.
- **`(if (eq? turn 'f) ... ...)`** — branches on whose turn it is; the two branches are structural mirror images of each other, one calling `expand-frontier` with the forward side's own state and `fsucc`, the other with the backward side's own state and `bsucc`.
- **`(find-common new-frontier-f dist-b)`** — after the forward side expands one real layer, checks whether any of its newly-discovered states already appears in the backward side's own distance record — the real check deciding whether the two searches have just met.
- **`(+ (cdr (assoc meet new-dist-f)) (cdr (assoc meet dist-b)))`** — once a real meeting point is found, looks up its own real distance from each side independently and adds them — the real total path length.
- **`(loop new-dist-f new-frontier-f dist-b frontier-b 'b)`** — when no meeting is found yet, continues the search: the forward side's own state is updated (`new-dist-f`, `new-frontier-f`), the backward side's own state is carried forward unchanged, and `turn` flips to `'b` for the next round.
- **The real, exact `4` moves** — direct, measured confirmation that bidirectional search, on a real, small target, finds the identical correct answer Lesson 135's own one-directional search already established for this exact target.

### Execution Trace — Meeting in the Middle, for Real

`bidirectional-bfs`, run with `start = 0`, `goal = 25`:

1. `(loop {0:0} (0) {25:0} (25) 'f)` — round `0`. Forward's turn: `expand-frontier` processes `0`, whose real forward moves are `3` and `5` (`0 × 2 = 0` is already discovered, filtered). New forward frontier: `(5 3)`. `find-common` checks `5` and `3` against the backward side's own real distance record, `{25:0}` — no match.
2. `(loop {0:0,5:1,3:1} (5 3) {25:0} (25) 'b)` — round `1`. Backward's turn: `expand-frontier` processes `25`, whose real backward moves are `20` (`25 − 5`) and `22` (`25 − 3`); `25` is odd, so no real `÷2` candidate. New backward frontier: `(20 22)`. No match against the forward side's own `{0, 5, 3}`.
3. `(loop ... (5 3) ... (20 22) 'f)` — round `2`. Forward's turn: expanding `5` gives real moves `8` and `10`; expanding `3` gives real moves `6` and `8` (`8` already just discovered this round, filtered). New forward frontier: `(6 10 8)`. Still no match against `{25, 20, 22}`.
4. `(loop ... (6 10 8) ... (20 22) 'b)` — round `3`. Backward's turn: expanding `20` gives real moves `17`, `15`, and `10` (`20` is even, so `20 ÷ 2 = 10` is a real candidate); expanding `22` gives `19`, `17` (already just discovered, filtered), and `11` (`22 ÷ 2`). New backward frontier: `(11 19 10 15 17)`. `find-common` checks this new frontier against the forward side's own real distance record — and `10` is there, discovered by the forward side back in round `2` at real distance `2`. A real meeting point: `10`.
5. The real total: `10`'s own forward distance, `2`, plus its own backward distance, also `2` (discovered in this very round) — `2 + 2 = 4`, the identical real answer Lesson 135's own one-directional search already found for this exact target, now confirmed from a genuinely different real direction.

### CS Lens

This is Lesson 117's own inductive proof, applied twice at once and combined: each side's own real layer-by-layer discipline independently guarantees its own distances are true shortest distances, the identical argument Lesson 117 made for a single search; the real, additional insight this lesson adds is that the *first* overlap between two such independently-correct real processes is itself provably optimal, for the same reason two clocks that both tick forward in true, synchronized real time will always agree on which of two events happened first. Also recognized in: two search-and-rescue teams starting from opposite ends of a real search area and radioing in the instant they spot each other, rather than either team searching the entire area alone; two people digging a real tunnel from opposite ends of a mountain, meeting in the middle rather than one crew digging the entire real length alone.

### SE Lens

The alternative to deriving `bidirectional-bfs` as a real, layer-synchronized alternation is running the two searches independently, at whatever pace each happens to expand states, and checking for overlap periodically. The real risk of that alternative: without the strict real layer-by-layer discipline this unit's own correctness argument depends on, the first overlap found would not be provably optimal — one side could race ahead several real layers deep before the other has even started its own second layer, and an early, deep overlap on the fast side could report a real total distance that isn't actually the shortest, exactly the kind of unproven shortcut this curriculum's own discipline, since Lesson 22, has consistently refused to trust without a real, checkable argument behind it.

### Run It — Show the Real Output

```
$ guile bidirectional-check.scm
=== CU3: bidirectional search, a small real target ===
target: 25
moves: 4
```

Verified this session — bidirectional search finds the real, correct `4`-move path to `25`, exactly matching the execution trace above and Lesson 135's own already-established real answer for this exact target.

---

## Concept Unit 4: The Real Gap, and How It Grows

### The Problem

Concept Unit 3 confirmed correctness on one small real target. Concept Unit 1's own real evidence showed one-directional search's real cost accelerating sharply with depth. It's worth measuring, honestly, exactly how bidirectional search's own real cost compares, across a real range of depths — not just at one point, but as a real trend.

### Reference Source

No reference counterpart — a real, direct application of this lesson's own `bidirectional-bfs`, Concept Unit 3, across eight real targets.

### Files affected

Modified: `bidirectional-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (compare-at target)
  (let ((vu 0) (vb 0))
    (define (fu n) (set! vu (+ vu 1)) (forward-succ n))
    (define (fb-f n) (set! vb (+ vb 1)) (forward-succ n))
    (define (fb-b n) (set! vb (+ vb 1)) (backward-succ n))
    (let ((uni (bfs-implicit 0 (lambda (v) (= v target)) fu))
          (bidir (bidirectional-bfs 0 target fb-f fb-b)))
      (list target uni vu bidir vb))))
```

### The Updated Project

This is `bidirectional-check.scm`, with Concept Unit 3's own file extended by a real, repeated comparison across eight real targets:

```scheme
;; ... Concept Unit 1, 2, and 3's code above, unchanged ...

(define (compare-at target)                                          ; ← new
  (let ((vu 0) (vb 0))                                                  ; ← new
    (define (fu n) (set! vu (+ vu 1)) (forward-succ n))                    ; ← new
    (define (fb-f n) (set! vb (+ vb 1)) (forward-succ n))                     ; ← new
    (define (fb-b n) (set! vb (+ vb 1)) (backward-succ n))                       ; ← new
    (let ((uni (bfs-implicit 0 (lambda (v) (= v target)) fu))                       ; ← new
          (bidir (bidirectional-bfs 0 target fb-f fb-b)))                              ; ← new
      (list target uni vu bidir vb))))                                                    ; ← new

(display "=== CU4: the real gap, across eight real targets ===") (newline)           ; ← new
(for-each                                                                                ; ← new
 (lambda (t)                                                                               ; ← new
   (let ((r (compare-at t)))                                                                  ; ← new
     (display "target=") (display (car r))                                                       ; ← new
     (display " uni-moves=") (display (cadr r)) (display " uni-states=") (display (caddr r))         ; ← new
     (display " bidir-moves=") (display (cadddr r)) (display " bidir-states=") (display (car (cddddr r))) ; ← new
     (newline)))                                                                                             ; ← new
 (list 17 25 100 500 1000 5000 20000 100000))                                                                   ; ← new
```

### Mechanical Walkthrough

- **`(define (compare-at target) ...)`** — first appearance in this lesson of this procedure; one real argument, a target, returning a real five-element summary of both algorithms' own real results.
- **`(let ((vu 0) (vb 0)) ...)`** — two fresh, real counters, local to each individual real call, so successive calls to `compare-at` never contaminate each other's real counts.
- **`(define (fu n) ...)` / `(define (fb-f n) ...)` / `(define (fb-b n) ...)`** — three small, real instrumented wrapper procedures, an *internal* `define`, valid inside a `let`'s own body, scoping each one to this single real call.
- **`(list target uni vu bidir vb))`** — bundles five real values into one list for the caller to unpack.
- **`(for-each (lambda (t) ...) (list 17 25 100 500 1000 5000 20000 100000))`** — `for-each` calls its own procedure once per element, purely for effect (its own results are discarded); here, once per real target in this unit's own chosen list.
- **`(car (cddddr r))`** — first appearance in this lesson of `cddddr`, a real, direct four-`cdr`-then-`car` accessor reaching a five-element list's own fifth member; reads `vb`, the real bidirectional state count, out of `compare-at`'s own returned list.
- **The real, exact widening gap — `2.7×` at a real `4`-move target, `10.1×` at `10` moves, `96.3×` at `18` moves** — direct, measured confirmation, across eight real, independently-run targets, that bidirectional search's own real advantage does not stay fixed: it grows, and grows substantially, exactly as real search depth grows.

### CS Lens

This is Lesson 69's own real doubling-ratio technique, applied across a genuinely wider real range than any single earlier lesson used it over: rather than checking one pair of real measurements, this unit checks eight, confirming the real trend holds continuously rather than only at two convenient points.

### SE Lens

The alternative to measuring this real trend across a real range is reporting only this lesson's own single, most dramatic number, `96×`, without showing where it came from. The real value of the full real table: it shows the advantage is not a fixed multiplier chosen to look impressive, but a genuinely accelerating real function of depth — real, useful information for deciding *when* bidirectional search's own real added complexity (a genuine predecessor function, a layer-synchronized two-sided loop) is actually worth building, versus when a real target is close enough that Concept Unit 1's own simpler, one-directional search is already cheap enough.

### Run It — Show the Real Output

```
$ guile bidirectional-check.scm
=== CU4: the real gap, across eight real targets ===
target=17 uni-moves=4 uni-states=16 bidir-moves=4 bidir-states=6
target=25 uni-moves=4 uni-states=24 bidir-moves=4 bidir-states=6
target=100 uni-moves=6 uni-states=76 bidir-moves=6 bidir-states=16
target=500 uni-moves=9 uni-states=377 bidir-moves=9 bidir-states=46
target=1000 uni-moves=10 uni-states=647 bidir-moves=10 bidir-states=64
target=5000 uni-moves=14 uni-states=4893 bidir-moves=14 bidir-states=169
target=20000 uni-moves=16 uni-states=14410 bidir-moves=16 bidir-states=267
target=100000 uni-moves=18 uni-states=39185 bidir-moves=18 bidir-states=407
```

Verified this session — across all eight real targets, bidirectional search finds the identical real move count as one-directional search every single time (direct, broad confirmation of correctness, not a single spot check), while the real ratio of states expanded — `16/6`, `24/6`, `76/16`, `377/46`, `647/64`, `4893/169`, `14410/267`, `39185/407` — climbs from roughly `2.7×` to roughly `96.3×` as the real target moves from `4` to `18` moves away.

---

## Closing

### Connect the pieces

One real puzzle, two real directions, one growing real advantage:

1. **The real cost of depth, measured (Unit 1):** a real `18`-move target costs `bfs-implicit` `39185` real states.
2. **A real, checked inverse, derived (Unit 2):** `backward-succ`, confirmed to genuinely reverse `forward-succ` on two real, independent checks.
3. **Bidirectional search, derived and traced (Unit 3):** `bidirectional-bfs`, meeting in the middle at real state `10`, confirmed correct against Lesson 135's own already-established real answer.
4. **The real gap, measured across a real range (Unit 4):** from a real `2.7×` advantage at short real distances to a real `96.3×` advantage at the longest real distance tested — a genuinely accelerating, not fixed, real payoff.

Every claim in this lesson traces to real, executed code: a real, checked inverse function, a full execution trace showing exactly where two real searches meet, and eight real, independently-run comparisons confirming both correctness and a genuinely widening real advantage.

### What breaks without this

Suppose a real puzzle-solving or route-planning system only ever searched forward from a known start, the way every search this curriculum built through Lesson 139 has. Concept Unit 1's own real evidence shows precisely what that choice costs as a real target gets farther away: not a gentle, proportional real slowdown, but a real, near-quadratic-in-depth explosion — `39185` real states for an `18`-move answer, when the identical answer was reachable at a real cost of `407` states, given only a genuine, checked way to search backward too.

### Exercises

1. **Observe.** Before checking, predict whether `bidirectional-bfs`, run on a real target requiring an *odd* real number of total moves (this lesson's own examples, `4`, `6`, `9`, and so on, include several already), could ever have its real forward and backward layer counts differ by more than `1` at the moment of meeting, using this lesson's own strict alternation to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — instrument `bidirectional-bfs` to report the real round-by-round layer counts on both sides at the moment a meeting is found, across several real odd-distance targets.
3. **Formalize.** Modify `backward-succ` to also handle a fourth real forward move of your own design (added to `forward-succ` too), derive its own real inverse by hand first, then confirm with real code that it genuinely reverses your new forward move, the same two-example discipline Concept Unit 2 used.
4. **Explain.** In your own words, explain why `expand-frontier` needed to be written as a new, distinct procedure rather than simply reusing `bfs-implicit`'s own inner loop, referencing what `bfs-implicit` does one state at a time that this lesson's own correctness argument specifically needs done one full layer at a time instead.
5. **Explain.** Using this lesson's own real numbers from Concept Unit 4, explain why the real ratio between one-directional and bidirectional cost keeps growing rather than staying fixed, referencing this lesson's own Header definition of branching factor.

### Definition of done

- [ ] You can state, precisely, what a predecessor function is and why it is not automatically the same as running a forward `successors` function backward.
- [ ] You can point to this lesson's own real execution trace (Concept Unit 3) and name the exact real state, and the exact real round, where the two searches first met.
- [ ] You can explain why strict, alternating, full-layer expansion — not looser, independent-pace expansion — is what makes the first real meeting point provably optimal.
- [ ] You can point to this lesson's own real table (Concept Unit 4) as direct evidence the real advantage of bidirectional search grows with depth, not a fixed multiplier.
- [ ] You completed Exercises 1–5, including a real, self-derived fourth move and its own checked inverse.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
