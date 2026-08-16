# Lesson 117: BFS Correctness

**What you will build:** a real proof, by induction, that BFS's computed distances always equal true shortest-path distances — on *any* graph, not just the one grid Lesson 116 happened to check — plus a real, deliberate counterexample proving the proof's own key assumption, FIFO ordering specifically, is load-bearing. Real, verified evidence this session: BFS is checked against a genuinely independent reference algorithm (level-set expansion, not queue-based) across `20` real, randomly generated `10`-vertex graphs — `200` real vertex-distance comparisons, all matching exactly. Then, replacing the queue with a stack — otherwise identical code — produces a real, wrong answer: distance `4` to a vertex whose true shortest distance is `2`, on a real, constructed graph where the long route happens to be explored first. The transferable point: Lesson 98 already established that "passed a few tests" isn't the same as "provably correct." This lesson proves BFS correct by induction, then shows, with real, executed code, exactly what breaks when the one property the proof depends on is removed.

**What you need to know first:** Lesson 116 (`FP-L116-breadth-first-search.md`) — specifically `bfs` itself, unchanged, the exact algorithm this lesson proves correct. Lesson 43 (`FP-L043-structural-induction.md`) — specifically proof by induction, the technique this lesson applies to a loop instead of a recursive structure. Lesson 98 (`FP-L098-tree-invariants.md`) — specifically why passing test cases isn't proof, the standard this lesson holds BFS to.

**Terms introduced in this lesson**

- **BFS invariant** — the precise, inductively-maintained claim this lesson proves: at any point during BFS, every vertex already assigned a distance has been assigned its *true* shortest distance, and every vertex at distance `≤ k` has been assigned before any vertex at distance `k + 1` is discovered. It exists to name, precisely, the exact property Lesson 116's derivation argued for informally, now proven rigorously.

**Objects and methods used**

No new objects or methods this lesson — every procedure reappears from Lesson 116 unchanged, or is a small, freshly-built independent reference for this lesson's own verification.

---

## Concept Unit 1: One Grid Is Evidence, Not Proof

### The Problem

Lesson 116's own Concept Unit 4 checked BFS against a real formula, on one specific graph — a `5×5` grid. That's real, exhaustive evidence for *that* graph. It says nothing, by itself, about whether BFS is correct on a graph shaped completely differently — one with cycles, uneven branching, or multiple paths of different lengths to the same vertex.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is posed directly here, extending Lesson 98's own "passed a few tests isn't proof" standard to BFS specifically.

### Reference Source

No reference counterpart — the motivating gap draws on Lesson 98's own already-established standard, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What a Real Proof Needs to Cover

A real proof needs to hold for *every* possible graph shape at once — every possible arrangement of cycles, multiple paths, and branching — not by checking each shape individually, but by reasoning about the algorithm's own mechanism directly, the way Lesson 43's structural induction reasoned about every possible list shape at once rather than checking lists one at a time.

### Walkthrough

- **The direct citation of Lesson 98's own standard** — frames this lesson's own proof requirement as a continuation of an already-established discipline, not a new one.
- **"reasoning about the algorithm's own mechanism directly"** — previews Concept Unit 2's inductive argument.

### CS Lens

This is Lesson 81's own lower-bound discipline, encountered from the opposite direction: Lesson 81 proved no comparison sort could beat `Θ(n log n)`, for *any* input; this lesson proves BFS gets distances right, for *any* graph — both real proofs about every possible case at once, neither checkable by exhaustive testing alone.

### SE Lens

The alternative to a real proof is trusting Lesson 116's own grid evidence to generalize, the same trust Lesson 98 already warned against for tree invariants. The real risk of that trust, made concrete in Concept Unit 4: an algorithm that happens to work on every *tested* graph shape can still be subtly wrong on a shape never tried — exactly what this lesson's own stack-based counterexample demonstrates for a close relative of BFS.

---

## Concept Unit 2: The Inductive Proof

### The Problem

Concept Unit 1 established the need. It needs the actual argument — precise enough to be checked, not just asserted.

### No isolated lab for this step

This concept has no code of its own to isolate — the proof is stated directly below, and Concept Unit 3 checks its conclusion against real, independent evidence.

### Reference Source

No reference counterpart — a from-scratch proof, applying Lesson 43's induction technique to Lesson 116's own already-built `bfs`.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Proof by Strong Induction on True Distance

**Claim:** for every vertex `v` reachable from the start, `bfs` assigns `dist[v]` equal to `v`'s true shortest-path distance, and does so before any vertex at a strictly greater true distance is ever assigned.

**Base case (`k = 0`):** only the start vertex has true distance `0`, and `bfs` assigns it `dist = 0` directly, before the loop even begins. Correct, trivially.

**Inductive hypothesis:** assume that for every distance `j ≤ k`, every vertex with true distance `j` has already been correctly assigned `dist = j`, and every such vertex has already been dequeued and processed, before any vertex of true distance `k + 1` is discovered.

**Inductive step:** consider any vertex `u` with true shortest distance `k + 1`. By definition of shortest distance, `u` has at least one neighbor, `w`, with true distance `k` (the second-to-last vertex on some shortest path to `u`). By the inductive hypothesis, `w` has already been correctly assigned `dist = k` and already dequeued and processed by the time any distance-`(k+1)` vertex is discovered. When `w` is processed, `bfs` examines every one of `w`'s neighbors, including `u` — and since `u` has true distance `k + 1 > k`, it cannot already be in `dist` (by the inductive hypothesis, only distance-`≤ k` vertices are in `dist` at this point), so `bfs` assigns `dist[u] = dist[w] + 1 = k + 1` — the correct value — and enqueues it. Because the queue is FIFO, every distance-`k` vertex was enqueued (and will be dequeued) before any distance-`(k+1)` vertex, guaranteeing every distance-`(k+1)` vertex gets processed only after every distance-`k` vertex — extending the inductive hypothesis to `k + 1`.

**Why a distance, once assigned, is never revised:** `bfs` checks `(assoc (car ns) dist)` before ever assigning a new distance — a vertex already present in `dist` is never touched again. Combined with the induction above (the *first* assignment is always the true shortest distance), this guarantees the *final* value is also always correct.

### Walkthrough

- **The inductive hypothesis stated precisely, over "true distance," not "processing order"** — the exact quantity the whole argument is built around.
- **"a second-to-last vertex on some shortest path"** — the specific existence claim the inductive step depends on; every shortest path of length `k + 1` genuinely has such a vertex, by definition.
- **The FIFO-dependence made explicit, in the inductive step's own final sentence** — previews Concept Unit 4's own real demonstration of what happens when this specific property is removed.

### CS Lens

This is Lesson 46's own recursive-invariant discipline (an invariant true at the start, and preserved by every step), applied to a `while`-style loop instead of a recursive call — the identical proof shape, a different kind of repetition.

### SE Lens

The alternative to writing out the full inductive step is trusting the base case plus a general sense that "it keeps working" for larger `k`. The real risk of that shortcut: the inductive step is exactly where FIFO ordering's necessity becomes visible — a hand-wave here would miss the one property the entire proof actually depends on, precisely what Concept Unit 4 shows breaking when it's removed.

---

## Concept Unit 3: Checking the Proof's Conclusion Broadly, Not Just Once

### The Problem

Concept Unit 2 proved BFS correct in general. It's worth checking that conclusion against real, independently-computed evidence across many differently-shaped graphs — not to substitute for the proof, but to catch any gap between the proof's own reasoning and the actual code.

### The New Code — Type It Yourself

```scheme
(define (levels-reachable g start max-k)
  (let loop ((k 0) (frontier (list start)) (found (list (cons start 0))))
    (if (or (> k max-k) (null? frontier))
        found
        (let* ((raw (apply append (map (lambda (v) (graph-neighbors g v)) frontier)))
               (new-vs (filter (lambda (v) (not (assoc v found))) (dedup raw))))
          (loop (+ k 1) new-vs (append (map (lambda (v) (cons v (+ k 1))) new-vs) found))))))
```

### Reference Source

Lesson 116's own `bfs` (`FP-L116-breadth-first-search.md`, Concept Unit 3), quoted here unchanged, checked against `levels-reachable` — a genuinely independent implementation strategy (expanding a whole *set* of vertices per layer, with no queue at all), built fresh for this lesson.

### Files affected

Created: `bfscorrect-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `bfscorrect-check.scm`, in full:

```scheme
;; ... Lesson 116's own graph, queue, and bfs code, unchanged ...

(define (dedup lst)                                                 ; ← new
  (let loop ((l lst) (acc '()))                                        ; ← new
    (if (null? l) (reverse acc) (loop (cdr l) (if (member (car l) acc) acc (cons (car l) acc)))))) ; ← new

(define (levels-reachable g start max-k)                            ; ← new
  (let loop ((k 0) (frontier (list start)) (found (list (cons start 0)))) ; ← new
    (if (or (> k max-k) (null? frontier))                                ; ← new
        found                                                               ; ← new
        (let* ((raw (apply append (map (lambda (v) (graph-neighbors g v)) frontier))) ; ← new
               (new-vs (filter (lambda (v) (not (assoc v found))) (dedup raw)))) ; ← new
          (loop (+ k 1) new-vs (append (map (lambda (v) (cons v (+ k 1))) new-vs) found)))))) ; ← new

(define (random-graph n edge-prob)                                    ; ← new
  (let ((vs (iota n)))                                                    ; ← new
    (make-graph vs                                                           ; ← new
                (apply append (map (lambda (a) (filter (lambda (x) x)              ; ← new
                                                         (map (lambda (b) (if (and (not (= a b)) (< (random 100) edge-prob)) (cons a b) #f)) vs))) ; ← new
                                    vs)))))                                                                                                            ; ← new

(define all-match #t) (define graphs-checked 0)
(for-each
 (lambda (trial)
   (define g (random-graph 10 25))
   (define bfs-d (bfs g 0))
   (define ref-d (levels-reachable g 0 10))
   (set! graphs-checked (+ graphs-checked 1))
   (for-each (lambda (v)
               (if (not (equal? (assoc v bfs-d) (assoc v ref-d)))
                   (begin (set! all-match #f) (display "MISMATCH trial ") (display trial) (newline))))
             (iota 10)))
 (iota 20))
(display "checked ") (display graphs-checked)
(display " random 10-vertex graphs against the independent reference: all matched? ") (display all-match) (newline)
```

`levels-reachable` computes the identical abstract answer — shortest distance from `start` to every vertex — via a completely different mechanism: expanding the *entire* current layer into the next as a set, with no queue, no per-vertex processing order at all. `random-graph` builds a genuinely random directed graph, with each possible edge present independently at a fixed probability.

### Mechanical Walkthrough

- **`(dedup raw)`** — first appearance of this specific helper; `levels-reachable` may discover the same vertex from multiple frontier members in one layer, and duplicates must be removed before deciding which vertices are genuinely new.
- **`(apply append (map (lambda (v) (graph-neighbors g v)) frontier))`** — a reappearance of `apply`, `append`, `map`; collects every neighbor of every current-frontier vertex in one step, the literal "expand the whole layer at once" idea, structurally unlike `bfs`'s own one-vertex-at-a-time queue processing.
- **`(< (random 100) edge-prob)`** in `random-graph` — a reappearance of `random`, `<`; each of the `n × (n − 1)` possible directed edges is included independently, with real probability `edge-prob` out of `100`.
- **The real, exact agreement across all `20` trials, `200` total vertex checks** — direct, checked confirmation that Concept Unit 2's proof and Lesson 116's actual code agree, on graph shapes never specifically hand-picked or anticipated.

### CS Lens

This is Lesson 79's own "check against an independent reference" discipline, applied to a graph algorithm at real, randomized scale for the first time in this Era — not one grid, not one hand-built graph, but `20` genuinely different, randomly generated shapes.

### SE Lens

The alternative to building a genuinely independent reference is checking BFS against a second copy of BFS, or a lightly-modified version of the same code. The real risk of that alternative: a bug present in the *design* of BFS itself (as opposed to a typo) would likely be present in both copies identically, and the check would pass while the underlying reasoning remained genuinely broken — exactly why `levels-reachable`'s structurally different mechanism matters.

### Run It — Show the Real Output

```
$ guile bfscorrect-check.scm
checked 20 random 10-vertex graphs against the independent reference: all matched? #t
```

Verified this session — `20` real, randomly generated `10`-vertex graphs, `200` total real vertex-distance comparisons against a structurally independent reference algorithm, all matching exactly — broad, real evidence supporting Concept Unit 2's proof, not a substitute for it.

---

## Concept Unit 4: A Real Counterexample — Proving FIFO Is Load-Bearing

### The Problem

Concept Unit 2's proof depended, explicitly, on FIFO ordering. It's worth checking, with real code, that this dependency is genuine — not an artifact of the proof's own phrasing — by replacing the queue with a stack and observing what actually happens.

### The New Code — Type It Yourself

```scheme
(define (stack-search g start)
  (let ((dist (list (cons start 0))) (s (spush (make-stack) start)))
    (let loop ((s s))
      (if (stack-empty? s) dist
          (let* ((v (stack-top s)) (s2 (spop s)) (d (cdr (assoc v dist))))
            (let loop2 ((ns (graph-neighbors g v)) (s3 s2))
              (if (null? ns) (loop s3)
                  (if (assoc (car ns) dist) (loop2 (cdr ns) s3)
                      (begin (set! dist (cons (cons (car ns) (+ d 1)) dist)) (loop2 (cdr ns) (spush s3 (car ns))))))))))))
```

### Reference Source

Lesson 116's own `bfs`, with every queue operation replaced by its stack equivalent — otherwise character-for-character identical, isolating FIFO-versus-LIFO as the *only* real difference.

### Files affected

Modified: `bfscorrect-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `bfscorrect-check.scm`, with Concept Unit 3's own file extended by a real counterexample:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define (make-stack) '())                                          ; ← new
(define (stack-empty? s) (null? s))                                    ; ← new
(define (spush s x) (cons x s))                                           ; ← new
(define (spop s) (cdr s))                                                    ; ← new
(define (stack-top s) (car s))                                                  ; ← new

(define (stack-search g start) ...)                                              ; ← new (shown above)

(define counter-g (make-graph '(A B C D E X)
                               (list (cons 'A 'D) (cons 'D 'X) (cons 'A 'B) (cons 'B 'C) (cons 'C 'E) (cons 'E 'X))))
(display "true shortest distance to X (via A-D-X): 2") (newline)
(display "BFS (queue) distance to X: ") (display (cdr (assoc 'X (bfs counter-g 'A)))) (newline)
(display "stack-based distance to X: ") (display (cdr (assoc 'X (stack-search counter-g 'A)))) (newline)
```

`counter-g` has two real paths to `X`: a short one, `A→D→X` (length `2`), and a long one, `A→B→C→E→X` (length `4`), with `A`'s edge to `D` listed *first*. `stack-search` is `bfs` with every queue call replaced by its stack equivalent, nothing else changed.

### Mechanical Walkthrough

- **`(list (cons 'A 'D) (cons 'D 'X) (cons 'A 'B) ...)`** — the edge order is deliberate: `A`'s neighbor list becomes `(D B)`, so `D` is pushed onto the stack first and `B` second, leaving `B` on *top* — the specific setup that makes a stack explore the long route before the short one.
- **`(spush s3 (car ns))`** in place of `bfs`'s `(enqueue q3 (car ns))`, the single line changed** — makes the most recently *discovered* vertex, not the least recently discovered one, the next to be *processed* — exactly the property Concept Unit 2's inductive step depended on holding the opposite way.
- **The real, exact `4` for `stack-search`'s own distance to `X`, against the real, exact `2` true shortest distance** — direct, checked confirmation that removing FIFO ordering breaks the theorem's conclusion, not merely its proof technique.

### CS Lens

This is a real, constructed instance of Lesson 46's own warning made concrete: an invariant genuinely depends on the *specific* mechanism preserving it, not just "some systematic order" — swapping FIFO for LIFO changes nothing about *that* `dist` values are assigned exactly once and never revised, and everything about whether the *first* assignment is guaranteed correct.

### SE Lens

The alternative to constructing a real counterexample is trusting Concept Unit 2's proof's own claim that FIFO matters, without checking what specifically goes wrong if it's removed. The real value of the counterexample: it turns "the proof depends on FIFO ordering" from an assertion inside a derivation into a directly observed, `4`-versus-`2` real discrepancy — the same standard this curriculum has held every other claim to since Lesson 22.

### Run It — Show the Real Output

```
$ guile bfscorrect-check.scm
true shortest distance to X (via A-D-X): 2
BFS (queue) distance to X: 2
stack-based distance to X: 4
```

Verified this session — `bfs`, using a real FIFO queue, correctly computes `X`'s true shortest distance, `2`. `stack-search` — identical code, LIFO instead of FIFO — incorrectly computes `4`, having discovered `X` via the long route (`A→B→C→E→X`) before the short route (`A→D→X`) was ever explored, exactly because `B` sat on top of the stack ahead of `D`. Real, direct, executed proof that Concept Unit 2's dependence on FIFO ordering isn't a phrasing choice — removing it genuinely breaks the theorem.

---

## Closing

### Connect the pieces

One proof, one broad stress test, one real, constructed failure:

1. **The gap between "tested" and "proven," named (Unit 1):** one grid's worth of matching evidence isn't a proof for every graph.
2. **The inductive proof itself (Unit 2):** by strong induction on true distance, every vertex is discovered — and correctly, permanently assigned — in non-decreasing distance order, precisely because of FIFO ordering.
3. **The conclusion checked broadly (Unit 3):** `20` random graphs, `200` real comparisons against a structurally independent reference, all agreeing.
4. **The dependency proven load-bearing (Unit 4):** one line changed — FIFO to LIFO — and a real, provably wrong distance, `4` instead of `2`, on a graph built specifically to expose it.

Every claim in this lesson traces to real, executed code: a genuinely independent reference checked across many random graphs, and a real, deliberately constructed counterexample isolating the one property the entire proof depends on.

### What breaks without this

Suppose an engineer, reaching for "some kind of graph traversal" without checking which specific ordering discipline it used, substituted a stack-based traversal for BFS in a real shortest-path feature — perhaps because a stack felt like a simpler, more familiar structure. This lesson's own Concept Unit 4 shows precisely, and quantifiably, what would go wrong: a real, silently wrong distance, computed confidently, on exactly the kind of graph shape — multiple paths of different lengths to the same destination — that real road networks and dependency graphs both routinely contain.

### Exercises

1. **Observe.** Before checking, predict whether `stack-search` would ever produce a *smaller* distance than the true shortest one, using Concept Unit 4's own mechanism (distances are only assigned on first discovery, never revised) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, testing `stack-search` against `levels-reachable`'s own correct reference across several real graphs, and characterize whether its errors are always overestimates, always underestimates, or a mix.
3. **Formalize.** Extend Concept Unit 3's random-graph stress test to `50` trials at `20` vertices each, and confirm `bfs` still matches `levels-reachable` on every single check.
4. **Explain.** In your own words, walk through Concept Unit 2's inductive step by hand on this lesson's own `counter-g`, explaining precisely which vertex plays the role of `w` (the "second-to-last vertex on a shortest path") when `X` is correctly discovered via `bfs`.
5. **Explain.** Using this lesson's real numbers, explain why checking BFS against `levels-reachable` (Concept Unit 3) and constructing the stack counterexample (Concept Unit 4) are both necessary — referencing what each one can catch that the other cannot.

### Definition of done

- [ ] You can state Concept Unit 2's inductive claim precisely and walk through both the base case and the inductive step in your own words.
- [ ] You can explain exactly which single change turns correct `bfs` into incorrect `stack-search`, and why that change specifically breaks the proof's own key step.
- [ ] You can point to this lesson's own real numbers — `200` matching comparisons, and a real `4`-versus-`2` counterexample — as the concrete evidence for both this lesson's positive and negative claims.
- [ ] You completed Exercises 1–5, including a real, characterized description of `stack-search`'s own error pattern.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
