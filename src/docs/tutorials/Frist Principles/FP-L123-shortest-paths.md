# Lesson 123: Shortest Paths

**What you will build:** a real **weighted graph** and a real, direct proof that Lesson 116/117's own BFS — correct for unweighted shortest paths — gives the *wrong* answer the moment edges carry different real costs. Real, verified evidence this session: on a real, three-vertex graph with a direct, expensive edge (`A→C`, weight `10`) and a cheaper two-hop route (`A→B→C`, weights `1` and `1`, total `2`), BFS's own hop-count distance says `C` is `1` hop from `A` — correctly, by hop count — while the real, minimum-*weight* path is the `2`-hop route, at real total weight `2`, five times cheaper. On a slightly larger, real four-vertex graph, brute-force enumeration of every real path confirms the true minimum weight is `3`, via a `3`-hop route — while BFS's own hop-count answer would point to a direct, `1`-hop edge costing `100`. The transferable point: BFS doesn't merely compute shortest paths *slower* when weights vary — it computes a genuinely different, wrong quantity, because it silently treats every edge as costing exactly `1`. This lesson formalizes what "shortest" really means once that assumption is dropped, setting up Lesson 124 and 125's real fix.

**What you need to know first:** Lesson 116 (`FP-L116-breadth-first-search.md`) and Lesson 117 (`FP-L117-bfs-correctness.md`) — specifically `bfs` itself and its own proven correctness, the exact algorithm this lesson shows is insufficient once weights vary. Lesson 113 (`FP-L113-from-relations-to-graphs.md`) — specifically the edge-as-pair representation, extended here to carry a real number.

**Terms introduced in this lesson**

- **Weighted graph** — a graph whose edges each carry a real number, their weight, representing a real cost (distance, time, price) rather than a mere connection. It exists to model real relationships where not every connection costs the same.
- **Path weight** — the sum of every edge weight along a real path. It exists to give "how expensive is this specific route" a precise, computable value.
- **Shortest (weighted) path** — the real path between two vertices with the minimum possible path weight, among every real path connecting them. It exists to generalize Lesson 116's own "fewest hops" into "least total cost," the real question a weighted graph actually poses.

**Objects and methods used**

No new objects or methods this lesson — `filter`, `car`, `cadr`, `caddr` all reappear unchanged from earlier lessons, applied here to a new, three-element edge shape.

---

## Concept Unit 1: When Fewer Hops Isn't Cheaper

### The Problem

Lesson 116 and 117 proved BFS correctly finds the shortest path by hop count, for any graph. Many real relationships aren't well modeled by "every connection costs the same": a direct flight might cost far more than two connecting flights combined; a direct road might be far slower than two shorter roads. BFS, run on such a graph unchanged, would still confidently report a real answer — it just wouldn't be the one that actually matters.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, extending Lesson 116's own already-proven algorithm to a case it was never designed for.

### Reference Source

No reference counterpart — the motivating gap draws on Lesson 116's own already-established algorithm, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "Formalizing" Actually Requires

A precise formalization needs three things, stated with equal precision to Lesson 113's own graph definition: what a weighted edge actually carries, what a path's total cost actually means, and what "shortest" actually means once cost, not hop count, is the real quantity being minimized.

### Walkthrough

- **The direct citation of Lesson 116/117's own proven correctness** — makes clear this lesson isn't finding a bug in BFS, but a real boundary on what problem it was ever proven to solve.
- **Real-world examples (flights, roads) grounding "cost" in something concrete** — before any graph or code exists.

### CS Lens

This is Lesson 74's own worst/average/best-case discipline, applied to an algorithm's own *scope* rather than its running time: BFS isn't slow on weighted graphs — it's answering a subtly different question than the one being asked, exactly the kind of gap only checking, not intuition, reliably catches.

### SE Lens

The alternative to formalizing weighted shortest paths precisely is applying BFS to weighted data anyway, on the assumption that "shortest path" means the same thing regardless. The real, demonstrated cost of that assumption, made concrete in Concept Unit 3: a real system routing traffic, cost, or time by hop count alone would confidently recommend the *worst* real option in exactly the situations weights were introduced to model.

---

## Concept Unit 2: Weighted Graphs, Path Weight, and Shortest Path, Precisely

### The Problem

Concept Unit 1 named the gap. It needs precise definitions, extending Lesson 113's own edge-as-pair representation to carry a real cost.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below, and Concept Unit 3 implements and checks them as real code.

### Reference Source

Lesson 113's own edge-as-pair representation (`FP-L113-from-relations-to-graphs.md`, Concept Unit 3), extended here directly rather than replaced.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Three Definitions, Built on Lesson 113's Own Edge

**Weighted graph:** a graph `(V, E)` where each edge in `E` is not just a pair but a triple, `(u, v, w)` — Lesson 113's own edge, with a real number `w`, its weight, attached. **Path weight:** for a path `v₁ → v₂ → ... → vₖ`, the sum `w(v₁, v₂) + w(v₂, v₃) + ... + w(vₖ₋₁, vₖ)` — every edge weight along the way, added. **Shortest path:** the real path between two vertices whose path weight is the smallest among every real path connecting them — not the fewest edges, the smallest total.

**Why BFS's own guarantee doesn't transfer:** Lesson 117's proof depended entirely on FIFO discovery order tracking true hop-distance — and it does, exactly, when every edge counts as `1`. Nothing in that proof mentions or accounts for edges of different real weight; the proof simply doesn't apply once weights vary, not because it was wrong, but because it was never about this quantity.

### Walkthrough

- **The edge extended from a pair to a triple, directly building on Lesson 113's own representation** — a real, minimal extension, not a new structure from scratch.
- **The explicit statement that Lesson 117's proof "simply doesn't apply"** — precise about *why* BFS fails here: not a bug, a scope boundary.

### CS Lens

This is Lesson 111's own decision-procedure discipline, applied retroactively to an algorithm rather than a data structure: BFS was correctly matched to unweighted shortest paths; a weighted graph is a genuinely different required operation, and Concept Unit 1's gap is exactly what checking categorical fit, not just reusing a trusted tool, would have caught in advance.

### SE Lens

The alternative to precisely defining path weight is trusting an intuitive sense of "total cost" without a checkable formula. The real value of the precise sum: Concept Unit 3's own `path-weight` procedure is a direct, one-line translation of this definition, leaving no ambiguity about what number is actually being computed or compared.

---

## Concept Unit 3: Implementing and Verifying the Real Gap

### The Problem

Concept Unit 2 defined the real quantities. It needs real code, and a real, direct demonstration that BFS's own hop-count answer and the true minimum-weight path can genuinely disagree.

### The New Code — Type It Yourself

```scheme
(define (path-weight g path)
  (if (null? (cdr path))
      0
      (+ (edge-weight g (car path) (cadr path)) (path-weight g (cdr path)))))
```

### Reference Source

Lesson 116's own `bfs` (`FP-L116-breadth-first-search.md`, Concept Unit 3), quoted here unchanged, run against weighted data it was never designed for, specifically to make the real gap observable.

### Files affected

Created: `shortestpath-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `shortestpath-check.scm`, in full:

```scheme
(define (make-wgraph vertices edges) (cons vertices edges))
(define (wgraph-edges g) (cdr g))
(define (wgraph-neighbors g a) (filter (lambda (e) (equal? (car e) a)) (wgraph-edges g)))
(define (edge-weight g a b) (caddr (car (filter (lambda (e) (equal? (cadr e) b)) (wgraph-neighbors g a))))) ; ← new

(define (path-weight g path)                                        ; ← new
  (if (null? (cdr path))                                                ; ← new
      0                                                                     ; ← new
      (+ (edge-weight g (car path) (cadr path)) (path-weight g (cdr path))))) ; ← new

(define (make-queue) (list '() '()))
(define (queue-empty? q) (and (null? (car q)) (null? (cadr q))))
(define (enqueue q x) (list (car q) (cons x (cadr q))))
(define (dequeue q) (if (null? (car q)) (let ((f (reverse (cadr q)))) (list (cdr f) '())) (list (cdr (car q)) (cadr q))))
(define (queue-front q) (if (null? (car q)) (car (reverse (cadr q))) (car (car q))))
(define (bfs-hops g start)
  (let ((dist (list (cons start 0))) (q (enqueue (make-queue) start)))
    (let loop ((q q))
      (if (queue-empty? q) dist
          (let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist))))
            (let loop2 ((ns (map cadr (wgraph-neighbors g v))) (q3 q2))
              (if (null? ns) (loop q3)
                  (if (assoc (car ns) dist) (loop2 (cdr ns) q3)
                      (begin (set! dist (cons (cons (car ns) (+ d 1)) dist)) (loop2 (cdr ns) (enqueue q3 (car ns))))))))))))

(define g (make-wgraph '(A B C) (list (list 'A 'C 10) (list 'A 'B 1) (list 'B 'C 1))))
(display "BFS hop-count distance A to C: ") (display (cdr (assoc 'C (bfs-hops g 'A)))) (newline)
(display "real weight of direct path A->C: ") (display (path-weight g '(A C))) (newline)
(display "real weight of path A->B->C: ") (display (path-weight g '(A B C))) (newline)
```

`edge-weight` looks up a specific edge's own weight by matching both endpoints. `path-weight` recurses down a path one edge at a time, summing — Concept Unit 2's own sum, executed directly. `bfs-hops` is Lesson 116's own `bfs`, adapted only to read a weighted edge's *destination* (`cadr` of the triple) while ignoring its weight entirely — the literal, concrete meaning of "BFS treats every edge as cost `1`."

### Mechanical Walkthrough

- **`(map cadr (wgraph-neighbors g v))`** inside `bfs-hops` — a reappearance of `map`, `cadr`; extracts only each neighbor's destination vertex from the weighted triple, discarding the weight — the exact, concrete mechanism by which BFS becomes blind to cost.
- **`(caddr (car (filter (lambda (e) (equal? (cadr e) b)) (wgraph-neighbors g a))))`** in `edge-weight` — a reappearance of `caddr`, `filter`; finds the specific edge from `a` to `b` and reads its third element, the real weight.
- **`(if (null? (cdr path)) 0 (+ ... (path-weight g (cdr path))))`** in `path-weight` — a reappearance of recursion; the base case (a single-vertex path remnant) contributes zero further weight, exactly matching Concept Unit 2's own sum definition.
- **The real, exact `1` for BFS's hop-count answer, against the real, exact `10` and `2` for the two candidate paths' true weights** — direct, checked confirmation of Concept Unit 1's own claim: BFS's answer (favoring the `1`-hop, weight-`10` route) is not the minimum-weight path (the `2`-hop, weight-`2` route).

### CS Lens

This is Lesson 66's own `fast-expt`-versus-`expt` discipline, run in reverse: rather than confirming an optimized algorithm agrees with a trusted reference, this unit confirms a *trusted* algorithm (BFS) genuinely *disagrees* with the real, correct answer once its own assumption (unit-weight edges) no longer holds.

### SE Lens

The alternative to running BFS directly on weighted data is assuming, without checking, that "shortest path" behaves consistently regardless of whether edges are weighted. The real, demonstrated cost of that assumption: a real system built this way would confidently recommend the expensive direct route over the genuinely cheaper multi-hop one, with no error or warning at all — a silently wrong, not a loudly broken, result.

### Run It — Show the Real Output

```
$ guile shortestpath-check.scm
BFS hop-count distance A to C: 1
real weight of direct path A->C: 10
real weight of path A->B->C: 2
```

Verified this session — BFS correctly reports `C` as `1` hop from `A`, via the direct edge. That direct edge's real weight is `10`; the two-hop alternative's real total weight is `2`, five times cheaper — direct, checked evidence that "fewest hops" and "least total cost" are genuinely different real quantities, not two names for the same thing.

---

## Concept Unit 4: A Real, Larger Gap, Confirmed by Brute Force

### The Problem

Concept Unit 3 demonstrated the gap on one small graph. It's worth checking on a real, slightly larger graph, against every real possible path — not just the two most obvious candidates — to confirm the true minimum weight directly.

### The New Code — Type It Yourself

```scheme
(define (all-paths g start end)
  (define results '())
  (define (search v path visited)
    (if (equal? v end)
        (set! results (cons (reverse path) results))
        (for-each (lambda (e) (if (not (member (cadr e) visited))
                                   (search (cadr e) (cons (cadr e) path) (cons (cadr e) visited))))
                  (wgraph-neighbors g v))))
  (search start (list start) (list start))
  results)
```

### Reference Source

No reference counterpart — a from-scratch, brute-force real path enumerator, deliberately independent of both BFS and any weighted shortest-path algorithm, built specifically to serve as this lesson's own trusted reference.

### Files affected

Modified: `shortestpath-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `shortestpath-check.scm`, extended with a real, four-vertex graph and exhaustive path enumeration:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define g2 (make-wgraph '(A B C D)
                         (list (list 'A 'D 100) (list 'A 'B 1) (list 'B 'C 1) (list 'C 'D 1) (list 'A 'C 50))))

(define (all-paths g start end)                                     ; ← new
  (define results '())                                                 ; ← new
  (define (search v path visited)                                        ; ← new
    (if (equal? v end)                                                      ; ← new
        (set! results (cons (reverse path) results))                           ; ← new
        (for-each (lambda (e) (if (not (member (cadr e) visited))                 ; ← new
                                   (search (cadr e) (cons (cadr e) path) (cons (cadr e) visited)))) ; ← new
                  (wgraph-neighbors g v))))                                                            ; ← new
  (search start (list start) (list start))                                                                ; ← new
  results)                                                                                                    ; ← new

(define paths (all-paths g2 'A 'D))
(define weights (map (lambda (p) (cons p (path-weight g2 p))) paths))
(display "all real A->D paths and their real weights: ") (display weights) (newline)
(display "true minimum weight (brute force): ") (display (apply min (map cdr weights))) (newline)
(display "BFS hop-count answer for A to D: ") (display (cdr (assoc 'D (bfs-hops g2 'A)))) (display " hops") (newline)
```

`all-paths` walks every real, simple path (no repeated vertices, using a real, per-branch `visited` list) from `start` to `end`, recording each one found. Applying Concept Unit 3's own `path-weight` to every result gives the real weight of every real candidate, with no possibility of missing one.

### Mechanical Walkthrough

- **`(if (not (member (cadr e) visited)) (search ...))`** — a reappearance of `member`, `not`; prevents infinite recursion on any real cycles in the graph, the identical discipline Lesson 115 first established, applied here to path *enumeration* rather than single-traversal visitation.
- **`(apply min (map cdr weights))`** — a reappearance of `apply`, `min`, `map`; the real, true minimum weight, computed directly from every real candidate, not assumed from a plausible-looking one.
- **The real, exact three paths and their weights — `100` (direct), `51` (via `C`), `3` (via `B` then `C`)** — direct, exhaustive confirmation of every real route this small graph actually offers.
- **The real, exact mismatch: true minimum weight `3`, against BFS's own hop-count-favored direct edge at weight `100`** — a dramatically larger real gap than Concept Unit 3's own first example, over `33` times the true minimum cost.

### CS Lens

This is Lesson 117's own independent-reference standard, applied here to weighted paths for the first time: `all-paths` shares no mechanism at all with BFS, making its real, brute-force-confirmed minimum a genuinely trustworthy baseline for Lesson 125's upcoming Dijkstra to be checked against.

### SE Lens

The alternative to brute-force enumeration is trusting the two-candidate comparison from Concept Unit 3 as sufficient evidence. The real value of the larger, exhaustive check: it confirms the gap isn't a quirk of one specific small example, and it establishes a real, reusable reference — `all-paths` plus `path-weight` — that Lesson 125 can check its own, more efficient algorithm against directly.

### Run It — Show the Real Output

```
$ guile shortestpath-check.scm
all real A->D paths and their real weights: (((A C D) . 51) ((A B C D) . 3) ((A D) . 100))
true minimum weight (brute force): 3
BFS hop-count answer for A to D: 1 hops
```

Verified this session — three real paths from `A` to `D` exist, with real weights `100`, `51`, and `3`. The true minimum, confirmed by brute force over every real candidate, is `3` — the three-hop route. BFS's own hop-count answer, `1` hop, points directly at the real, `100`-weight edge — the single worst of the three real options, not merely a suboptimal one.

---

## Closing

### Connect the pieces

Three vertices, then four, one real, growing gap:

1. **The scope limit, named (Unit 1):** BFS was proven correct for hop count, never for cost.
2. **Weighted graphs, path weight, and shortest path, defined precisely (Unit 2):** a direct, minimal extension of Lesson 113's own edge.
3. **The gap demonstrated directly (Unit 3):** a real `2`-versus-`10` mismatch between the true minimum-weight path and BFS's own hop-count answer.
4. **The gap confirmed exhaustively, at larger real scale (Unit 4):** a real `3`-versus-`100` mismatch, checked against every one of three real candidate paths.

Every claim in this lesson traces to real, executed code: a real weighted graph, a real, independent brute-force reference, and a real, measured, worsening gap between hop count and true cost.

### What breaks without this

Suppose a real navigation system computed "shortest route" using Lesson 116's own BFS directly on real road data carrying genuinely different travel times per segment. This lesson's own real evidence shows precisely what would go wrong: a route recommendation confidently pointing to the *worst* available option — a single long, slow direct road — over a real, much faster multi-turn alternative, with no indication anything was wrong at all, exactly the silent failure mode Concept Unit 3 and 4 both demonstrated directly.

### Exercises

1. **Observe.** Before checking, predict whether `all-paths` would ever terminate on a graph containing a real cycle, using its own `visited`-per-branch discipline to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, adding a cycle to `g2` and confirming `all-paths` still terminates and returns only real, cycle-free paths.
3. **Formalize.** Build a real, five-vertex weighted graph of your own design, with at least three real candidate paths between two chosen vertices, and confirm the true minimum weight using `all-paths` and `path-weight` together.
4. **Explain.** In your own words, explain why `bfs-hops`'s use of `(map cadr ...)` — discarding edge weight entirely — is the precise, concrete reason it can't be fixed by simply "running it on weighted data," referencing what information that line permanently throws away.
5. **Explain.** Using this lesson's real numbers, explain why brute-force path enumeration (Concept Unit 4) is not itself a practical general solution, referencing how the number of real simple paths could grow as a graph gets larger.

### Definition of done

- [ ] You can state the precise definitions of weighted graph, path weight, and shortest path, and explain why BFS's proof doesn't extend to them.
- [ ] You can point to this lesson's own real numbers — `2` versus `10`, and `3` versus `100` — as concrete, checked evidence of the gap, not just an assumed one.
- [ ] You can explain exactly which line of `bfs-hops` discards the information that makes it wrong for weighted graphs.
- [ ] You completed Exercises 1–5, including a real, self-designed weighted graph checked by brute force.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
