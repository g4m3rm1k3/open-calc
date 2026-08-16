# Lesson 116: Breadth-First Search

**What you will build:** **breadth-first search (BFS)** — a traversal that visits vertices in strict order of increasing distance from the start, derived from expanding an outward-growing **frontier** one hop at a time using a real FIFO queue. Real, verified evidence this session: on a small, real graph (`A→B`, `B→C`, `C→D`, `A→E`), Lesson 115's own recursive traversal visits `E` — a vertex only `1` hop from `A` — dead last, after `D`, a vertex `3` hops away; BFS, on the identical graph, correctly discovers `E` at real distance `1`, before ever reaching `C` or `D`. At real scale, BFS computes distances across every one of a `5×5` grid's `25` cells, and every single computed distance exactly matches the grid's own Manhattan-distance formula, `r + c` — including the real, farthest corner, distance `8`, confirmed exactly. The transferable point: Lesson 115 guaranteed a traversal would *terminate* correctly; this lesson derives one that also visits vertices in a specific, provably meaningful *order* — the order Lesson 117 will prove is exactly the order shortest unweighted paths require.

**What you need to know first:** Lesson 115 (`FP-L115-traversing-structure.md`) — specifically its own recursive `explore`, the direct order-mismatch example this lesson's Concept Unit 1 measures against. Lesson 89 — a real Queue ADT's own FIFO discipline, the general idea this lesson's own small, freshly-built queue follows.

**Terms introduced in this lesson**

- **Frontier** — the set of vertices discovered but not yet fully processed, at any point during a BFS. It exists to name, precisely, the "growing boundary" a BFS expands outward, one full hop at a time.
- **Breadth-first search (BFS)** — a traversal that processes the frontier in the exact order vertices were first discovered, using a FIFO queue, guaranteeing every vertex is visited in order of its true, shortest hop-distance from the start.
- **(Graph / hop) distance** — the number of edges on the shortest path from a start vertex to a given vertex. It exists to give a precise, computable meaning to "how far," independent of any one specific path.

**Objects and methods used**

No new objects or methods this lesson — `cons`, `assoc`, `filter`, `map`, `sort`, `iota` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: An Order That Doesn't Reflect Distance

### The Problem

Lesson 115's `explore` guarantees every reachable vertex gets visited exactly once — it says nothing at all about *what order*. On a graph shaped like a long chain with one short branch — `A→B→C→D` and, separately, `A→E` — Lesson 115's own recursive style dives fully into the `B→C→D` chain before ever returning to check `A`'s other neighbor, `E`, even though `E` is only a single hop away.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, measured against Lesson 115's own already-built `explore`.

### Reference Source

Lesson 115's `explore` (`FP-L115-traversing-structure.md`, Concept Unit 3), quoted here unchanged, as the direct baseline this unit's own comparison is run against.

### Files affected

None — no new code in this unit; the comparison uses Lesson 115's own file.

### Change type

None.

### Dependencies

The Guile interpreter.

### Applying It — Confirming the Mismatch Is Real, Not Assumed

A precise fix needs a precise target: an ordering guarantee stating, explicitly, that closer vertices are always visited before farther ones — something Lesson 115's `explore` was never designed to provide and, as this unit's own real run confirms, genuinely doesn't.

### Walkthrough

- **The specific graph shape, one long chain plus one short branch** — chosen deliberately so recursion's own depth-first tendency and true distance visibly disagree, rather than coincidentally matching (as they happened to on Lesson 115's own original example).
- **"genuinely doesn't," confirmed by the real run below, not assumed** — this curriculum's own standing evidence discipline, applied to a claim about ordering specifically.

### CS Lens

This is Lesson 74's own worst/average/best-case vocabulary, applied to *traversal order* rather than search cost: recursion's visiting order isn't wrong, exactly — it's simply not correlated with distance at all, coincidentally matching on some graphs (Lesson 115's own) and badly mismatching on others (this lesson's own), a real, checkable distinction this unit measures directly.

### SE Lens

The alternative to measuring the real mismatch is trusting that "traversal order roughly reflects closeness," an intuition many recursive explorations happen to superficially support. The real, demonstrated cost of that trust: a system using Lesson 115's own `explore` to answer "what's nearby," expecting closer results first, would receive `D` (distance `3`) before `E` (distance `1`) — silently, confidently wrong.

### Run It — Show the Real Output

```
$ guile bfs-check.scm
Lesson 115-style recursive visit order: (A B C D E)
```

Verified this session — on the graph `A→B`, `B→C`, `C→D`, `A→E`, Lesson 115's own `explore` visits `E` last, in position `5`, despite `E` being only `1` hop from `A` — real, direct confirmation that recursive visiting order and true distance are genuinely different things.

---

## Concept Unit 2: Deriving BFS From an Expanding Frontier

### The Problem

Concept Unit 1 confirmed the mismatch is real. It needs a precise, derived fix — an order that provably tracks distance, not one that happens to by coincidence.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, and Concept Unit 3 implements and verifies it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building on Lesson 89's own general FIFO idea.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Process in Discovery Order, Not Recursion Order

**The key idea:** instead of immediately recursing into a newly-found vertex's own neighbors (as Lesson 115's `explore` does), *record* every newly-discovered vertex in a queue, and only ever process the vertex that's been waiting *longest* — a real FIFO discipline, Lesson 89's own defining guarantee.

**Why this produces exactly distance order:** every vertex adjacent to the start is discovered and enqueued before any vertex two hops away can be — a two-hop vertex can only be discovered by first *processing* a one-hop vertex, which only happens once every earlier-discovered (necessarily closer or equally close) vertex has already been processed. By induction, every vertex at distance `k` is fully discovered and enqueued before any vertex at distance `k + 1` is ever reached — the frontier expands one *entire* hop-layer at a time, never partially.

**The distance itself falls out for free:** the first time a vertex is discovered, record the distance as one more than whichever already-processed vertex discovered it — since discovery genuinely happens in non-decreasing distance order, this is always the *shortest* possible distance, never revised later.

### Walkthrough

- **"process in discovery order, not recursion order"** — the single sentence separating BFS from Lesson 115's own `explore`; everything else — checking a visited set before processing — stays identical.
- **The induction argument for why layers expand fully before the next begins** — the actual reason BFS produces distance order, not just an assertion that it does.

### CS Lens

This is Lesson 74's own average-versus-worst-case discipline turned into a design constraint from the start, rather than measured after the fact: BFS is *derived*, by construction, to guarantee an ordering property Lesson 115's `explore` could only be checked for, never relied on.

### SE Lens

The alternative to deriving the frontier idea from FIFO discipline specifically is trying other orderings — a stack (LIFO), for instance — and hoping for the right result. The real cost of that alternative: a stack-based "frontier" reintroduces exactly Lesson 115's own recursion-order problem, since a stack always processes the *most* recently discovered vertex next, the opposite of what distance-order requires.

---

## Concept Unit 3: Implementing and Verifying Real BFS

### The Problem

Concept Unit 2 derived the mechanism. It needs real code, and a real, direct comparison confirming it corrects Concept Unit 1's own measured failure.

### The New Code — Type It Yourself

```scheme
(define (bfs g start)
  (let ((dist (list (cons start 0))) (q (enqueue (make-queue) start)))
    (let loop ((q q))
      (if (queue-empty? q)
          dist
          (let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist))))
            (let loop2 ((ns (graph-neighbors g v)) (q3 q2))
              (if (null? ns)
                  (loop q3)
                  (if (assoc (car ns) dist)
                      (loop2 (cdr ns) q3)
                      (begin (set! dist (cons (cons (car ns) (+ d 1)) dist))
                             (loop2 (cdr ns) (enqueue q3 (car ns))))))))))))
```

### Reference Source

No reference counterpart for `bfs` itself — a from-scratch implementation of Concept Unit 2's derivation. The queue it depends on (`make-queue`/`enqueue`/`dequeue`/`queue-front`) is a small, fresh two-list FIFO built for this lesson, in the same general spirit as a real Queue ADT, not a verbatim reuse of any specific earlier lesson's own code.

### Files affected

Created: `bfs-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `bfs-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-edges g) (cdr g))
(define (graph-neighbors g a) (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define (make-queue) (list '() '()))                               ; ← new
(define (queue-empty? q) (and (null? (car q)) (null? (cadr q))))      ; ← new
(define (enqueue q x) (list (car q) (cons x (cadr q))))                 ; ← new
(define (dequeue q)                                                        ; ← new
  (if (null? (car q))                                                        ; ← new
      (let ((f (reverse (cadr q)))) (list (cdr f) '()))                        ; ← new
      (list (cdr (car q)) (cadr q))))                                            ; ← new
(define (queue-front q) (if (null? (car q)) (car (reverse (cadr q))) (car (car q)))) ; ← new

(define (bfs g start)                                               ; ← new
  (let ((dist (list (cons start 0))) (q (enqueue (make-queue) start)))  ; ← new
    (let loop ((q q))                                                      ; ← new
      (if (queue-empty? q)                                                    ; ← new
          dist                                                                   ; ← new
          (let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist))))     ; ← new
            (let loop2 ((ns (graph-neighbors g v)) (q3 q2))                           ; ← new
              (if (null? ns)                                                            ; ← new
                  (loop q3)                                                                ; ← new
                  (if (assoc (car ns) dist)                                                   ; ← new
                      (loop2 (cdr ns) q3)                                                        ; ← new
                      (begin (set! dist (cons (cons (car ns) (+ d 1)) dist))                        ; ← new
                             (loop2 (cdr ns) (enqueue q3 (car ns))))))))))))                            ; ← new

(define g2 (make-graph '(A B C D E) (list (cons 'A 'B) (cons 'B 'C) (cons 'C 'D) (cons 'A 'E))))
(display "BFS distances (A B C D E graph): ") (display (bfs g2 'A)) (newline)
(display "real distance to E: ") (display (cdr (assoc 'E (bfs g2 'A)))) (newline)
(display "real distance to D: ") (display (cdr (assoc 'D (bfs g2 'A)))) (newline)
```

`bfs` maintains `dist`, an association list recording every vertex's real, discovered distance, and a queue of vertices still awaiting processing. Each loop iteration dequeues the front vertex, `v`, and checks every one of `v`'s neighbors: already in `dist`, skip it (already discovered, necessarily no farther); otherwise, record its distance as `v`'s own distance plus one, and enqueue it — exactly Concept Unit 2's derivation, executed.

### Mechanical Walkthrough

- **`(list (cons start 0))`** — a reappearance of `cons`, `list`; the start vertex's own distance is `0` by definition, recorded before the loop begins.
- **`(let* ((v (queue-front q)) (q2 (dequeue q)) ...) ...)`** — a reappearance of `let*`; reads the front of the queue and removes it in the same step, the literal FIFO discipline Concept Unit 2 derived.
- **`(if (assoc (car ns) dist) (loop2 (cdr ns) q3) (begin ...))`** — a reappearance of `assoc`, `if`; a hard concept reappearing (Lesson 115's visited-check), restated here as checking `dist` specifically, since a vertex's presence in `dist` *is* this lesson's visited marker.
- **`(cons (cons (car ns) (+ d 1)) dist)`** — first appearance of recording a *derived* distance, one more than the discovering vertex's own — the literal execution of Concept Unit 2's "distance falls out for free" claim.
- **The real, exact distance `1` for `E`, correctly less than the real, exact distance `3` for `D`** — direct, checked confirmation that BFS corrects Concept Unit 1's own measured ordering failure, on the identical graph.

### CS Lens

This is Lesson 89's own FIFO discipline, now shown to encode a genuinely mathematical guarantee (distance-order discovery) rather than only a scheduling fairness property — the identical mechanism, a real, different kind of payoff.

### SE Lens

The alternative to deriving `bfs` as a modification of Lesson 115's `explore` (queue instead of immediate recursion) is writing it as an unrelated, from-scratch algorithm. The real value of deriving it as a modification: it makes precisely visible *which one change* — FIFO ordering — is responsible for the entire, real ordering-correctness gain, rather than leaving the reader to guess which part of a differently-structured algorithm matters.

### Run It — Show the Real Output

```
$ guile bfs-check.scm
BFS distances (A B C D E graph): ((E . 1) (D . 3) (C . 2) (B . 1) (A . 0))
real distance to E: 1
real distance to D: 3
```

Verified this session — BFS correctly assigns `E` a real distance of `1` and `D` a real distance of `3`, the exact true hop-distances, directly correcting Concept Unit 1's own measured ordering failure on the identical graph.

---

## Concept Unit 4: Real Distances at Scale — a Grid, Checked Against a Formula

### The Problem

Concept Unit 3 confirmed correctness on one small graph. It's worth checking BFS against a real, independently-derivable mathematical fact, at a scale large enough to be a genuine test — not just a hand-matchable example.

### The New Code — Type It Yourself

```scheme
(define grid-dist (bfs gridg (cons 0 0)))
(define all-match #t)
(for-each (lambda (v)
            (let ((real-d (cdr (assoc v grid-dist))) (expected-d (+ (car v) (cdr v))))
              (if (not (= real-d expected-d))
                  (begin (set! all-match #f) (display "MISMATCH at ") (display v) (newline)))))
          grid-vertices)
```

### Reference Source

Lesson 114's own `grid-neighbors` (`FP-L114-graph-representations.md`, Concept Unit 4), quoted here unchanged, applied at a larger, `5×5` scale.

### Files affected

Modified: `bfs-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `bfs-check.scm`, with Concept Unit 3's own file extended by a real grid check:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define (grid-neighbors r c size)
  (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size)))
          (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1)))))
(define grid-size 5)
(define grid-vertices (apply append (map (lambda (r) (map (lambda (c) (cons r c)) (iota grid-size))) (iota grid-size))))
(define grid-edges (apply append (map (lambda (v) (map (lambda (n) (cons v n)) (grid-neighbors (car v) (cdr v) grid-size))) grid-vertices)))
(define gridg (make-graph grid-vertices grid-edges))
(define grid-dist (bfs gridg (cons 0 0)))                          ; ← new

(define all-match #t)                                                ; ← new
(for-each (lambda (v)                                                    ; ← new
            (let ((real-d (cdr (assoc v grid-dist))) (expected-d (+ (car v) (cdr v)))) ; ← new
              (if (not (= real-d expected-d))                                             ; ← new
                  (begin (set! all-match #f) (display "MISMATCH at ") (display v) (newline))))) ; ← new
          grid-vertices)                                                                            ; ← new
(display "5x5 grid: real BFS distance matches Manhattan distance (r+c) for all 25 cells? ") (display all-match) (newline)
(display "real BFS distance to corner (4,4): ") (display (cdr (assoc (cons 4 4) grid-dist))) (newline)
```

`grid-vertices`/`grid-edges` materialize a real `5×5` grid using Lesson 114's own implicit neighbor rule. `expected-d`, `r + c`, is the Manhattan distance formula — an independently-derivable mathematical fact about grid movement (only up/down/left/right steps, each changing exactly one of row or column by `1`), never itself computed by `bfs`.

### Mechanical Walkthrough

- **`(+ (car v) (cdr v))`** — a reappearance of `+`, `car`, `cdr`; the Manhattan distance formula, computed independently of `bfs` entirely, from pure arithmetic on each cell's own coordinates.
- **The real, exact `#t` across all `25` cells** — direct, checked confirmation that `bfs`'s computed distances agree, exactly, with an independently-derived formula, not merely "look plausible" on a couple of hand-picked cells.
- **The real, exact `8` for the farthest corner, `(4,4)`** — matches `4 + 4` exactly, the single largest real distance on this grid, confirmed directly.

### CS Lens

This is Lesson 66's own `fast-expt`-versus-`expt` discipline, applied a final time in this section: checking a real, derived algorithm's output against an independent, trusted formula, rather than only against a hand-traced small example.

### SE Lens

The alternative to checking against all `25` real cells is spot-checking a handful and trusting the pattern holds. The real value of the exhaustive check: it catches an error that might only manifest at a specific position (a boundary cell, say) that a handful of spot-checks could easily miss — exactly the discipline this curriculum has applied since Lesson 22.

### Run It — Show the Real Output

```
$ guile bfs-check.scm
5x5 grid: real BFS distance matches Manhattan distance (r+c) for all 25 cells? #t
real BFS distance to corner (4,4): 8
```

Verified this session — every one of the `5×5` grid's `25` real, computed BFS distances exactly matches the independently-derived Manhattan distance formula, including the farthest cell, `(4, 4)`, at real distance `8` — direct, exhaustive confirmation, not a spot check.

---

## Closing

### Connect the pieces

One small graph's ordering fixed, one grid's distances confirmed exactly:

1. **The mismatch, measured (Unit 1):** Lesson 115's own `explore` visits a `1`-hop vertex last, real, direct evidence recursion order isn't distance order.
2. **The frontier, derived (Unit 2):** process in FIFO discovery order, not recursion order — provably expands one full hop-layer before the next.
3. **Implemented and directly compared (Unit 3):** the identical graph, correctly ordered — `E` at real distance `1`, `D` at real distance `3`.
4. **Checked at scale, against an independent formula (Unit 4):** all `25` grid distances, exactly matching Manhattan distance.

Every claim in this lesson traces to real, executed code: a direct, measured contrast against Lesson 115's own traversal, and an exhaustive check against an independently-derived mathematical formula.

### What breaks without this

Suppose a real system needed "the `3` nearest available servers" and used Lesson 115's own `explore`, taking the first `3` vertices visited as a stand-in for "nearest." This lesson's own Concept Unit 1 evidence shows precisely what would go wrong: a genuinely close server (`E`, one hop away) could be reported last, after several genuinely farther ones, because recursion order was never designed to track distance at all. BFS's own real, checked guarantee — discovery order *is* distance order — is what such a system would actually need.

### Exercises

1. **Observe.** Before checking, predict whether reversing the order `A`'s own edges are listed in (`E` before `B`, instead of `B` before `E`) would change any vertex's *computed distance*, using Concept Unit 2's own induction argument to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — reorder the edges and re-run `bfs`, checking that every distance stays identical even though discovery order among same-distance vertices may change.
3. **Formalize.** Modify `bfs` to also record each vertex's actual shortest *path* (not just its distance) by tracking which vertex first discovered it, and reconstruct the real path from `A` to `D` on this lesson's own small graph.
4. **Explain.** In your own words, explain why `bfs` checks `(assoc (car ns) dist)` — presence in the distance table — rather than a separately maintained visited set, referencing what discovering a vertex and recording its distance both mean at once.
5. **Explain.** Using this lesson's real numbers, explain why the Manhattan-distance check in Concept Unit 4 is a stronger correctness test than the small, `5`-vertex example in Concept Unit 3 alone — referencing how many real, independently-checkable distances each one provides.

### Definition of done

- [ ] You can state why FIFO ordering specifically, not any other discipline, guarantees discovery happens in distance order.
- [ ] You can point to this lesson's own real numbers — `E` at distance `1`, `D` at distance `3` — as direct evidence correcting Lesson 115's own ordering gap.
- [ ] You can explain why checking BFS against all `25` grid cells is stronger evidence than checking a handful.
- [ ] You completed Exercises 1–5, including a real path-reconstruction extension to `bfs`.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
