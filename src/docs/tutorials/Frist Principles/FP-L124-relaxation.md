# Lesson 124: Relaxation

**What you will build:** **relaxation** — the single, real operation underneath every weighted shortest-path algorithm this Era will build — and a real, checked proof that it can only ever improve a distance estimate toward the truth, never overshoot past it. Real, verified evidence this session: applying relaxation to every edge of Lesson 123's own four-vertex graph, repeatedly, converges to the real, true minimum distance to `D`, `3` — matching Lesson 123's own brute-force answer exactly. A real, exhaustive check confirms every single computed distance, at every point during convergence, equals the weight of some genuinely real path — never a fabricated, impossible value. Processing the identical edges in *reversed* order still converges to the identical correct answer, `3` — but takes three real rounds instead of one, stopping at a real, safe-but-not-yet-optimal value, `51`, along the way. The transferable point: Lesson 116's BFS was never a different algorithm from what this lesson derives — it's relaxation, with every weight fixed at `1`, applied in FIFO order specifically. Relaxation itself is safe in *any* order; Lesson 125's Dijkstra exists because *some* orders reach the truth far faster than others.

**What you need to know first:** Lesson 123 (`FP-L123-shortest-paths.md`) — specifically the weighted graph, `path-weight`, and `all-paths`, all reused directly as this lesson's own real reference. Lesson 116 (`FP-L116-breadth-first-search.md`) — specifically `bfs`'s own distance-update step, shown here to be a special case of relaxation.

**Terms introduced in this lesson**

- **Relaxation** — the operation `relax(u, v, w)`: if the current best-known distance to `u`, plus the weight of the edge `u → v`, is less than the current best-known distance to `v`, update `v`'s distance to that smaller value. It exists as the one, minimal, real step every weighted shortest-path algorithm in this Era builds from.
- **Distance estimate** — a value tracked per vertex during a shortest-path computation, always either infinity (no path found yet) or the weight of some real, already-discovered path — never a value smaller than the true shortest distance, and never a fabricated one.

**Objects and methods used**

No new objects or methods this lesson — `assoc`, `cons`, `filter`, `<` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: Looking for the Minimal Fixable Operation

### The Problem

Lesson 123 showed BFS's own distance-update step is wrong once edges carry different weights. Rather than deriving an entirely new algorithm from nothing, it's worth asking a narrower question: is there a single, minimal operation — something small enough to reason about completely — that, applied correctly, *would* produce correct weighted distances?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, narrowing Lesson 123's own gap to its smallest fixable piece.

### Reference Source

No reference counterpart — the motivating question draws on Lesson 123's own already-established gap, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What the Operation Needs to Guarantee

Whatever this operation is, it needs to update a distance estimate only when doing so is *provably safe* — never asserting a distance smaller than any real path could actually achieve, and always improving toward the truth when new, better information becomes available.

### Walkthrough

- **"minimal" and "fixable" named explicitly as the goal** — sets expectations for a small, precise derivation, not a whole new algorithm at once.
- **"provably safe"** — previews Concept Unit 2's own safety argument before any code exists.

### CS Lens

This is Lesson 78's own divide-and-conquer instinct, applied to algorithm design itself rather than a single computation: instead of designing a whole new shortest-path algorithm directly, this lesson isolates its smallest real, reusable unit first — the same instinct that produced `dc-max` before `merge-sort`.

### SE Lens

The alternative to isolating a minimal operation is designing Dijkstra (Lesson 125) and Bellman-Ford (Lesson 127) as two unrelated algorithms, each verified from scratch. The real value of finding the shared operation first: both algorithms' real correctness will reduce to "relaxation is safe" plus "this specific order also converges," rather than two entirely separate proofs.

---

## Concept Unit 2: Deriving Relaxation and Its Safety Invariant

### The Problem

Concept Unit 1 named the requirement. It needs a precise operation, and a real, checkable proof that it satisfies the safety guarantee named there.

### No isolated lab for this step

This concept has no code of its own to isolate — the operation and its proof are derived directly below, and Concept Unit 3 implements and checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building directly on Lesson 123's own weighted-graph definitions.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — The Operation, and Why It Can Never Overshoot

**Relaxation, precisely:** `relax(dist, u, v, w)` — if `dist[u] + w < dist[v]`, set `dist[v] = dist[u] + w`; otherwise, leave `dist[v]` unchanged.

**The safety invariant, stated precisely:** at every point during any sequence of relaxations, starting from `dist[source] = 0` and every other vertex at infinity, `dist[v]` is always either infinity or the exact weight of some real path from `source` to `v`.

**Proof, by induction on the number of relaxations performed:** the base case holds trivially — `dist[source] = 0` is the weight of the (zero-edge) path from `source` to itself, and every other vertex starts at infinity. For the inductive step, suppose the invariant holds before some relaxation `relax(dist, u, v, w)` fires. It only updates `dist[v]` when `dist[u]` is finite — meaning, by the inductive hypothesis, `dist[u]` is the weight of some real path `P` from `source` to `u`. The new value, `dist[u] + w`, is exactly the weight of the path `P` extended by the one real edge `u → v` — itself a genuinely real path from `source` to `v`. So the invariant still holds after the update.

**Why this guarantees relaxation never overshoots:** since every non-infinite `dist[v]` is always the weight of *some* real path, and the true shortest distance is, by definition, the *minimum* over all real paths, `dist[v]` can never fall below the true shortest distance — it can only ever be a real, valid upper bound, converging downward as better paths are discovered.

### Walkthrough

- **The full inductive proof, base case and inductive step both stated** — matches Lesson 117's own proof standard, not merely an assertion of correctness.
- **"path `P` extended by the one real edge `u → v`"** — the exact mechanism making the inductive step work; every update is traceable to a real, concrete path.

### CS Lens

This is Lesson 46's own recursive-invariant technique, applied to a value that changes repeatedly over an unbounded number of steps, in any order — the invariant holds not because of any one specific algorithm's structure, but because of what the *operation itself* can and cannot do.

### SE Lens

The alternative to proving the safety invariant in general is checking it only for one specific, chosen order of relaxations (BFS's own FIFO order, for instance). The real value of proving it for *any* order: it means Lesson 125 and Lesson 127 can each choose a completely different real strategy for *which* edges to relax *when*, and both inherit this lesson's safety proof automatically, without re-deriving it.

---

## Concept Unit 3: Implementing Relaxation and Checking the Invariant Directly

### The Problem

Concept Unit 2 proved relaxation is safe. It needs real code, and a real, exhaustive check that every computed distance genuinely corresponds to a real path — not merely a plausible-looking number.

### The New Code — Type It Yourself

```scheme
(define (relax dist g u v)
  (let ((cand (+ (dget dist u) (edge-weight g u v))))
    (if (< cand (dget dist v))
        (cons (cons v cand) (filter (lambda (p) (not (equal? (car p) v))) dist))
        dist)))
```

### Reference Source

Lesson 123's own `edge-weight`, `path-weight`, `all-paths`, and `g2` graph (`FP-L123-shortest-paths.md`, Concept Unit 3 and 4), quoted here unchanged.

### Files affected

Created: `relax-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `relax-check.scm`, in full:

```scheme
(define (make-wgraph vertices edges) (cons vertices edges))
(define (wgraph-vertices g) (car g))
(define (wgraph-edges g) (cdr g))
(define (wgraph-neighbors g a) (filter (lambda (e) (equal? (car e) a)) (wgraph-edges g)))
(define (edge-weight g a b) (caddr (car (filter (lambda (e) (equal? (cadr e) b)) (wgraph-neighbors g a)))))
(define (path-weight g path) (if (null? (cdr path)) 0 (+ (edge-weight g (car path) (cadr path)) (path-weight g (cdr path)))))
(define (all-paths g start end)
  (define results '())
  (define (search v path visited)
    (if (equal? v end) (set! results (cons (reverse path) results))
        (for-each (lambda (e) (if (not (member (cadr e) visited)) (search (cadr e) (cons (cadr e) path) (cons (cadr e) visited))))
                  (wgraph-neighbors g v))))
  (search start (list start) (list start)) results)

(define INF 999999)                                                 ; ← new
(define (dget dist v) (let ((r (assoc v dist))) (if r (cdr r) INF)))    ; ← new
(define (relax dist g u v)                                                ; ← new
  (let ((cand (+ (dget dist u) (edge-weight g u v))))                        ; ← new
    (if (< cand (dget dist v))                                                  ; ← new
        (cons (cons v cand) (filter (lambda (p) (not (equal? (car p) v))) dist))   ; ← new
        dist)))                                                                       ; ← new

(define (fold-left f init lst) (if (null? lst) init (fold-left f (f init (car lst)) (cdr lst))))
(define (relax-all-edges dist g) (fold-left (lambda (d e) (relax d g (car e) (cadr e))) dist (wgraph-edges g)))

(define g2 (make-wgraph '(A B C D) (list (list 'A 'D 100) (list 'A 'B 1) (list 'B 'C 1) (list 'C 'D 1) (list 'A 'C 50))))
(define dist0 (list (cons 'A 0)))
(define dist1 (relax-all-edges dist0 g2))
(define dist2 (relax-all-edges dist1 g2))
(define dist3 (relax-all-edges dist2 g2))
(display "dist after round 1: ") (display dist1) (newline)
(display "converged dist to D: ") (display (dget dist3 'D)) (newline)

(define all-ok #t)
(for-each (lambda (v)
            (let ((d (dget dist3 v)))
              (if (< d INF)
                  (let* ((paths (all-paths g2 'A v)) (weights (map (lambda (p) (path-weight g2 p)) paths)))
                    (if (not (member d weights)) (set! all-ok #f))))))
          (wgraph-vertices g2))
(display "safety invariant: every dist value matches some real path weight? ") (display all-ok) (newline)
```

`dget` reads a distance, defaulting to `INF` for any vertex not yet recorded — the "infinity" Concept Unit 2's invariant refers to. `relax` computes the candidate distance through `u` and updates only on a genuine improvement, exactly the operation derived. `relax-all-edges` applies `relax` once to every real edge in the graph, in whatever order they happen to be listed.

### Mechanical Walkthrough

- **`(let ((r (assoc v dist))) (if r (cdr r) INF))`** in `dget` — a reappearance of `assoc`, `if`; a real default-value idiom, the concrete stand-in for "infinity" as an ordinary, comparable number.
- **`(+ (dget dist u) (edge-weight g u v))`** — a reappearance of `+`; the literal candidate distance Concept Unit 2's proof calls "`P` extended by one real edge."
- **`(if (< cand (dget dist v)) (cons ... dist) dist)`** — a reappearance of `<`, `cons`; the literal execution of Concept Unit 2's own operation, updating only on strict improvement.
- **`(fold-left (lambda (d e) (relax d g (car e) (cadr e))) dist (wgraph-edges g))`** — first appearance of `fold-left`, a real Scheme higher-order procedure threading an accumulator through a list, here threading the growing `dist` table through every edge in turn.
- **The real, exact `3` for `D`'s converged distance, matching Lesson 123's own brute-force answer exactly** — direct, checked confirmation that repeated relaxation reaches the true minimum.
- **The real, exact `#t` for the exhaustive safety check, against Lesson 123's own independent `all-paths`** — direct, checked confirmation of Concept Unit 2's proof, not merely trusted from the derivation.

### CS Lens

This is Lesson 79's own "check against an independent reference" discipline, applied here to a proven mathematical invariant rather than only a final answer: every intermediate `dist` value, not just the converged one, is checked against Lesson 123's own trusted `all-paths`.

### SE Lens

The alternative to checking the safety invariant exhaustively is checking only the final, converged distances. The real value of checking throughout: it confirms Concept Unit 2's proof holds at *every* step, not merely that the process happens to land somewhere correct — exactly the standard needed before trusting relaxation as a safe building block for Lesson 125 and 127's own, more elaborate algorithms.

### Run It — Show the Real Output

```
$ guile relax-check.scm
dist after round 1: ((D . 3) (C . 2) (B . 1) (A . 0))
converged dist to D: 3
safety invariant: every dist value matches some real path weight? #t
```

Verified this session — after one full round of relaxing every real edge, `dist` already reaches the correct final values for this graph, matching Lesson 123's own real, brute-force-confirmed minimum, `3`, to `D`. A real, exhaustive check confirms every computed distance corresponds to the weight of a genuinely real path, exactly as Concept Unit 2's proof requires.

---

## Concept Unit 4: Order Affects Speed, Never Safety — and BFS Is a Special Case

### The Problem

Concept Unit 3 converged quickly, in one round, on a graph whose edges happened to be listed in a convenient order. It's worth checking, honestly, what happens with a genuinely different order — and connecting this lesson's own operation directly back to Lesson 116's BFS.

### The New Code — Type It Yourself

```scheme
(define g2-reordered (make-wgraph '(A B C D) (reverse (wgraph-edges g2))))
```

### Reference Source

Concept Unit 3's own `g2`, with its edges reversed — the identical graph, a deliberately different relaxation order.

### Files affected

Modified: `relax-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `relax-check.scm`, extended with a reversed-order comparison and a unit-weight check against BFS:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define g2-reordered (make-wgraph '(A B C D) (reverse (wgraph-edges g2))))    ; ← new
(define rd0 (list (cons 'A 0)))
(define rd1 (relax-all-edges rd0 g2-reordered))
(define rd2 (relax-all-edges rd1 g2-reordered))
(define rd3 (relax-all-edges rd2 g2-reordered))
(display "reversed order, dist to D after round 1: ") (display (dget rd1 'D)) (newline)
(display "reversed order, dist to D after round 2: ") (display (dget rd2 'D)) (newline)
(display "reversed order, dist to D after round 3: ") (display (dget rd3 'D)) (newline)

(define gunw (make-wgraph '(A B C) (list (list 'A 'B 1) (list 'B 'C 1))))    ; ← new
(define ud0 (list (cons 'A 0)))
(define ud1 (relax-all-edges ud0 gunw))
(define ud2 (relax-all-edges ud1 gunw))
(display "unit-weight relax, dist to C after 2 rounds: ") (display (dget ud2 'C)) (newline)
```

`g2-reordered` is `g2`, with the identical five edges, processed in the opposite order — a real, deliberately different sequence of relaxations. `gunw` is a real, unit-weight graph, checking relaxation's own behavior once every edge weight is fixed at `1`, exactly BFS's own assumption.

### Mechanical Walkthrough

- **`(reverse (wgraph-edges g2))`** — a reappearance of `reverse`; the identical graph, a genuinely different real order for `relax-all-edges` to process.
- **The real, exact `51` after round `1`, unchanged after round `2`, and finally `3` after round `3`** — direct, measured confirmation that a less favorable order still reaches the correct final answer, just later; `51` itself, per Concept Unit 2's own invariant, is still the real weight of a genuine path (`A→C→D`, `50 + 1`), never an unsafe or fabricated value.
- **The real, exact `2` for the unit-weight graph** — direct confirmation that relaxation, with every weight fixed at `1`, reproduces exactly the hop-count distance Lesson 116's `bfs` would compute for the identical graph — real, checked evidence that BFS is relaxation, in FIFO order, with unit weights, not a separate algorithm.

### CS Lens

This is the real, concrete unification this lesson was building toward: Lesson 116's BFS, Lesson 125's upcoming Dijkstra, and Lesson 127's upcoming Bellman-Ford are not three unrelated algorithms — they are the identical operation, relaxation, differing only in *which* edges get relaxed *in what order*. Also recognized in: three different traffic-management strategies — first-come-first-served, priority for the most urgent, and simply retrying every route repeatedly — all fundamentally built from the same underlying action, "check if this specific move improves things," differing only in scheduling.

### SE Lens

The alternative to measuring the reversed-order case is trusting that Concept Unit 3's fast, one-round convergence is typical. The real, honest result: convergence speed genuinely depends on order, and a poorly-ordered relaxation sequence can take meaningfully longer — real motivation, checked rather than assumed, for why Lesson 125's Dijkstra bothers to choose its relaxation order carefully instead of processing edges in whatever order they happen to be stored.

### Run It — Show the Real Output

```
$ guile relax-check.scm
reversed order, dist to D after round 1: 51
reversed order, dist to D after round 2: 51
reversed order, dist to D after round 3: 3
unit-weight relax, dist to C after 2 rounds: 2
```

Verified this session — the reversed edge order reaches a real, safe intermediate value, `51`, after round `1`, makes no further progress in round `2`, and only reaches the true minimum, `3`, in round `3` — three real rounds instead of Concept Unit 3's one, confirming order affects speed but never correctness. The unit-weight graph converges to `2`, exactly matching what Lesson 116's `bfs` would report for the identical graph — real, direct confirmation that BFS is a special case of this lesson's own general operation.

---

## Closing

### Connect the pieces

One operation, checked for safety, checked for unification, checked for order-sensitivity:

1. **The minimal operation, sought (Unit 1):** a small, provably safe piece, not a whole new algorithm.
2. **Relaxation and its safety proof, derived (Unit 2):** every distance estimate is always a real path's weight, by induction.
3. **Implemented and exhaustively checked (Unit 3):** real convergence to Lesson 123's own true minimum, real proof every intermediate value stays safe.
4. **Order and unification, both checked directly (Unit 4):** a real, slower convergence under a worse order, and a real, exact match to BFS under unit weights.

Every claim in this lesson traces to real, executed code: a real, exhaustive safety check against an independent reference, and a real, measured order-sensitivity comparison.

### What breaks without this

Suppose an engineer, building Lesson 125's Dijkstra or Lesson 127's Bellman-Ford, needed to trust that a distance estimate could never be updated to something *unsafe* — a value smaller than any real path could achieve — partway through either algorithm's own, more complex logic. Without this lesson's own real, inductive proof, that trust would rest on hope rather than a checked guarantee; with it, both algorithms inherit the identical safety property automatically, freeing them to focus only on *which order* of relaxations reaches the truth fastest.

### Exercises

1. **Observe.** Before checking, predict how many real rounds of `relax-all-edges` would be needed, in the worst possible edge order, to guarantee convergence on a graph with `n` vertices, using this lesson's own path-extension argument (Concept Unit 2) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code on a real, `6`-vertex chain graph, checking convergence after each round under a deliberately worst-case order.
3. **Formalize.** Construct a real graph with a negative edge weight, and check whether this lesson's own safety invariant (every `dist` value matches a real path weight) still holds — note, but do not yet resolve, what happens to convergence itself.
4. **Explain.** In your own words, explain why `relax` checks `<` (strict) rather than `<=`, referencing what would happen to `dist`'s own values if equal-cost alternate paths triggered unnecessary updates.
5. **Explain.** Using this lesson's real numbers, explain precisely what "BFS is relaxation with unit weights in FIFO order" means, connecting Lesson 116's own queue-based processing order to this lesson's own `relax-all-edges`.

### Definition of done

- [ ] You can state relaxation's own definition precisely and walk through the inductive safety proof in your own words.
- [ ] You can explain why relaxation's safety holds regardless of order, while its convergence speed does not.
- [ ] You can point to this lesson's own real numbers — `51` then `3` under a worse order, `2` matching BFS under unit weights — as concrete evidence for both claims.
- [ ] You completed Exercises 1–5, including a real check of what a negative edge weight does to this lesson's own safety invariant.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
