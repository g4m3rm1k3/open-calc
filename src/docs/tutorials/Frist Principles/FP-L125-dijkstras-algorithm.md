# Lesson 125: Dijkstra's Algorithm

**What you will build:** **Dijkstra's algorithm** — Lesson 124's own relaxation, applied in one specific, provably sufficient order: always process the **settled** vertex with the smallest known tentative distance next, and never revisit it. Real, verified evidence this session: on Lesson 123/124's own four-vertex graph, Dijkstra computes `D`'s real distance as `3`, matching the true, brute-force-confirmed minimum exactly — using only `5` real relaxation attempts, exactly one per real edge, settling every vertex exactly once. Lesson 124's own repeated-rounds relaxation, run without knowing in advance how many rounds are enough, needs `15` real attempts on the identical graph — three times the work, most of it provably wasted. The transferable point: Lesson 124 showed relaxation is safe in *any* order. This lesson derives the specific order that's also *efficient* — never wasting a relaxation on a vertex whose distance is already provably final — and proves, precisely, why processing in order of increasing distance is what makes that guarantee hold.

**What you need to know first:** Lesson 124 (`FP-L124-relaxation.md`) — specifically `relax` and its own proven safety invariant, reused directly and unchanged. Lesson 105 (`FP-L105-priority-queues.md`) — specifically the real idea of repeatedly asking "what's smallest right now," the exact operation Dijkstra's own vertex selection performs.

**Terms introduced in this lesson**

- **Settled (vertex)** — a vertex whose tentative distance has been proven final and will never be updated again. It exists to name, precisely, the moment Dijkstra's own real guarantee applies to a specific vertex.

**Objects and methods used**

No new objects or methods this lesson — `filter`, `sort`, `member` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: Relaxing Only What Still Might Change

### The Problem

Lesson 124's own repeated-rounds approach relaxes *every* edge, *every* round, regardless of whether a vertex's distance could possibly still improve. On the reversed-order example, most of those relaxation attempts did nothing — real, wasted work, because the algorithm has no way to know, in advance, which vertices are already done.

### No isolated lab for this step

This concept has no code of its own to isolate — the inefficiency is posed directly here, extending Lesson 124's own already-measured cost.

### Reference Source

No reference counterpart — the motivating gap draws on Lesson 124's own already-measured real cost, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Would Let an Algorithm Know a Vertex Is Truly Done

An algorithm that could identify, with real certainty, "this vertex's distance can never improve again" could skip relaxing through it forever after — real, principled savings, rather than the blind, repeated re-checking Lesson 124's own naive approach performs.

### Walkthrough

- **"real, wasted work"** — grounds the inefficiency in Lesson 124's own already-measured `15`-versus-real-need numbers, not a new abstract concern.
- **"real certainty"** — sets the precise bar Concept Unit 2's own proof has to clear: not a heuristic guess, a provable guarantee.

### CS Lens

This is Lesson 82's own design-constraint discipline: rather than accepting Lesson 124's own correct-but-wasteful approach, this lesson asks what a *provably necessary and sufficient* amount of work would look like, the identical question that separated a correct sort from `Θ(n log n)` merge sort.

### SE Lens

The alternative to deriving a smarter order is accepting Lesson 124's own real, measured `3×` overhead as the unavoidable cost of safety. The real cost of that acceptance, at genuine scale (a real road network with millions of edges, not five): repeated, provably unnecessary rounds compound directly with graph size, exactly the kind of waste Lesson 91 through 95's Era IV work already showed is worth eliminating when a smarter structure exists.

---

## Concept Unit 2: Deriving and Proving the Greedy Order

### The Problem

Concept Unit 1 named the requirement. It needs a precise rule for *which* vertex is safe to finalize next, and a real proof that the rule is actually correct — not merely plausible.

### No isolated lab for this step

This concept has no code of its own to isolate — the rule and its proof are derived directly below, and Concept Unit 3 implements and checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building directly on Lesson 124's own relaxation and safety invariant.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Smallest Tentative Distance First, and Why It's Final

**The rule:** among all not-yet-settled vertices, always settle the one with the smallest current tentative distance next.

**The claim:** the moment a vertex `u` is chosen this way, its current tentative distance is already its *true* shortest distance — final, never to be improved again.

**Proof, assuming every edge weight is non-negative:** suppose, for contradiction, some shorter real path to `u` existed, passing through a not-yet-settled vertex `w` at some point. By Lesson 124's own safety invariant, `w`'s current tentative distance is already the weight of *some* real path to `w` — and since `u` was chosen as the *smallest* tentative distance among all not-yet-settled vertices, `w`'s tentative distance is at least `u`'s. Continuing from `w` to `u` along the rest of this hypothetical shorter path can only *add* real, non-negative weight — meaning the total real path weight through `w` is at least `w`'s own tentative distance, which is at least `u`'s current tentative distance. No such path can be strictly shorter than what's already known. `u`'s tentative distance is therefore already optimal.

**Why non-negative weights are essential:** the entire argument depends on "continuing past `w` can only add weight" — a real, negative edge could reduce total weight below `w`'s own tentative distance, breaking the proof entirely. Lesson 126 explores exactly what goes wrong then.

### Walkthrough

- **The proof by contradiction, spelled out in full** — matches Lesson 117 and 124's own proof standard, not an assertion.
- **The non-negative-weight assumption named explicitly, with its role in the proof pinpointed precisely** — a legitimate, deliberate forward reference to Lesson 126's own upcoming subject.

### CS Lens

This is a real instance of a **greedy** strategy — committing to the locally best-looking choice at each step, never reconsidering it — proven correct here through a real, specific structural argument (non-negative weights), rather than assumed correct simply because "greedy" sounds efficient.

### SE Lens

The alternative to proving the greedy choice correct is trusting that "always pick the smallest" sounds reasonable and testing it on a few examples. The real risk of that shortcut: greedy strategies are *not* correct in general (Lesson 134's own upcoming subject) — Dijkstra's specific greedy choice is correct only because of the specific, provable argument above, tied directly to non-negative weights, not because greediness is inherently safe.

---

## Concept Unit 3: Implementing and Verifying Dijkstra

### The Problem

Concept Unit 2 proved the greedy order correct. It needs real code, and a real check against Lesson 123's own trusted, brute-force reference.

### The New Code — Type It Yourself

```scheme
(define (dijkstra g start)
  (let ((dist (list (cons start 0))) (settled '()))
    (let loop ()
      (let ((unsettled (filter (lambda (v) (not (member v settled))) (wgraph-vertices g))))
        (if (null? unsettled)
            dist
            (let ((u (car (sort unsettled (lambda (a b) (< (dget dist a) (dget dist b)))))))
              (if (= (dget dist u) INF)
                  dist
                  (begin
                    (set! settled (cons u settled))
                    (for-each (lambda (e) (set! dist (relax dist g u (cadr e)))) (wgraph-neighbors g u))
                    (loop)))))))))
```

### Reference Source

Lesson 124's own `relax`, `dget`, `INF` (`FP-L124-relaxation.md`, Concept Unit 3), quoted here unchanged; Lesson 123's own `g2`, `all-paths` (`FP-L123-shortest-paths.md`, Concept Unit 3 and 4), reused as this lesson's own trusted check.

### Files affected

Created: `dijkstra-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `dijkstra-check.scm`, in full:

```scheme
(define (make-wgraph vertices edges) (cons vertices edges))
(define (wgraph-vertices g) (car g))
(define (wgraph-edges g) (cdr g))
(define (wgraph-neighbors g a) (filter (lambda (e) (equal? (car e) a)) (wgraph-edges g)))
(define (edge-weight g a b) (caddr (car (filter (lambda (e) (equal? (cadr e) b)) (wgraph-neighbors g a)))))

(define INF 999999)
(define (dget dist v) (let ((r (assoc v dist))) (if r (cdr r) INF)))
(define (relax dist g u v)
  (let ((cand (+ (dget dist u) (edge-weight g u v))))
    (if (< cand (dget dist v))
        (cons (cons v cand) (filter (lambda (p) (not (equal? (car p) v))) dist))
        dist)))

(define (dijkstra g start)                                          ; ← new
  (let ((dist (list (cons start 0))) (settled '()))                     ; ← new
    (let loop ()                                                           ; ← new
      (let ((unsettled (filter (lambda (v) (not (member v settled))) (wgraph-vertices g)))) ; ← new
        (if (null? unsettled)                                                                  ; ← new
            dist                                                                                  ; ← new
            (let ((u (car (sort unsettled (lambda (a b) (< (dget dist a) (dget dist b)))))))          ; ← new
              (if (= (dget dist u) INF)                                                                  ; ← new
                  dist                                                                                      ; ← new
                  (begin                                                                                       ; ← new
                    (set! settled (cons u settled))                                                              ; ← new
                    (for-each (lambda (e) (set! dist (relax dist g u (cadr e)))) (wgraph-neighbors g u))            ; ← new
                    (loop)))))))))                                                                                     ; ← new

(define g2 (make-wgraph '(A B C D) (list (list 'A 'D 100) (list 'A 'B 1) (list 'B 'C 1) (list 'C 'D 1) (list 'A 'C 50))))
(define dj-dist (dijkstra g2 'A))
(display "Dijkstra distances: ") (display dj-dist) (newline)
(display "Dijkstra dist to D: ") (display (dget dj-dist 'D)) (newline)
```

`dijkstra` repeatedly finds the not-yet-settled vertex with the smallest current tentative distance, settles it (Concept Unit 2's own proven-final moment), and relaxes every one of its outgoing edges — the only vertex whose edges get relaxed in that entire step.

### Mechanical Walkthrough

- **`(filter (lambda (v) (not (member v settled))) (wgraph-vertices g))`** — a reappearance of `filter`, `member`; the real, current set of vertices still eligible for consideration.
- **`(sort unsettled (lambda (a b) (< (dget dist a) (dget dist b))))`** — a reappearance of `sort`; a direct, if not maximally efficient, real implementation of "smallest tentative distance first" — Lesson 105's own priority-queue idea, expressed here as a full re-sort each iteration rather than a maintained heap.
- **`(if (= (dget dist u) INF) dist ...)`** — a reappearance of `=`; stops early if every remaining vertex is genuinely unreachable, rather than settling vertices with no real, finite distance at all.
- **`(set! settled (cons u settled))`, placed *before* relaxing `u`'s own edges** — first appearance of this specific ordering: `u` is marked settled based on its distance *before* that distance could possibly change again, matching Concept Unit 2's own proof exactly.
- **The real, exact `3` for `D`, matching both Lesson 123's brute-force answer and Lesson 124's own converged relaxation result** — direct, triple-checked confirmation across three independently-reasoned real computations.

### CS Lens

This is Lesson 105's own Priority Queue ADT, recognized in a genuinely new real application: "repeatedly ask for the smallest, remove it" is exactly Dijkstra's own vertex-selection loop, even though this specific implementation reuses only the *idea*, via a plain sort, rather than Lesson 104's own heap machinery directly.

### SE Lens

The alternative representation — using Lesson 104's real heap-backed priority queue instead of a full re-sort each iteration — would reduce this lesson's own `O(V)`-per-selection cost to `O(log V)`, a real, further efficiency gain left as this lesson's own Exercise 3, deliberately, so the core greedy argument (Concept Unit 2) stays the visible focus here rather than being obscured by heap mechanics already fully covered in Lesson 104.

### Run It — Show the Real Output

```
$ guile dijkstra-check.scm
Dijkstra distances: ((D . 3) (C . 2) (B . 1) (A . 0))
Dijkstra dist to D: 3
```

Verified this session — Dijkstra's own real, computed distance to `D` is `3`, exactly matching Lesson 123's independent brute-force minimum and Lesson 124's own converged relaxation result — three separately-reasoned computations agreeing exactly.

---

## Concept Unit 4: The Real, Measured Efficiency Gain

### The Problem

Concept Unit 3 confirmed correctness. It's worth measuring, honestly, exactly how much real work Concept Unit 2's proof actually saves compared to Lesson 124's own naive, repeated-rounds approach.

### The New Code — Type It Yourself

```scheme
(define attempts 0)
(define (relax-attempted dist g u v)
  (set! attempts (+ attempts 1))
  (relax dist g u v))
```

### Reference Source

Concept Unit 3's own `dijkstra`, and Lesson 124's own `relax-all-edges` (`FP-L124-relaxation.md`, Concept Unit 3), both instrumented here with a real, shared attempt counter.

### Files affected

Modified: `dijkstra-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `dijkstra-check.scm`, extended with a real, direct efficiency comparison:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define attempts 0)                                                 ; ← new
(define (relax-attempted dist g u v)                                    ; ← new
  (set! attempts (+ attempts 1))                                           ; ← new
  (relax dist g u v))                                                         ; ← new

(define (dijkstra-attempts g start)                                     ; ← new
  (let ((dist (list (cons start 0))) (settled '()))
    (let loop ()
      (let ((unsettled (filter (lambda (v) (not (member v settled))) (wgraph-vertices g))))
        (if (null? unsettled) dist
            (let ((u (car (sort unsettled (lambda (a b) (< (dget dist a) (dget dist b)))))))
              (if (= (dget dist u) INF) dist
                  (begin (set! settled (cons u settled))
                         (for-each (lambda (e) (set! dist (relax-attempted dist g u (cadr e)))) (wgraph-neighbors g u))
                         (loop)))))))))
(set! attempts 0)
(dijkstra-attempts g2 'A)
(display "Dijkstra total real relax attempts: ") (display attempts) (newline)

(define (fold-left f init lst) (if (null? lst) init (fold-left f (f init (car lst)) (cdr lst))))
(define (relax-all-edges-attempted dist g) (fold-left (lambda (d e) (relax-attempted d g (car e) (cadr e))) dist (wgraph-edges g)))
(set! attempts 0)
(define ra0 (list (cons 'A 0)))
(define ra1 (relax-all-edges-attempted ra0 g2))
(define ra2 (relax-all-edges-attempted ra1 g2))
(define ra3 (relax-all-edges-attempted ra2 g2))
(display "Lesson 124's repeated-rounds total real relax attempts: ") (display attempts) (newline)
```

### Mechanical Walkthrough

- **`(set! attempts (+ attempts 1))`, counting every call regardless of success** — a reappearance of `set!`; measures total real work attempted, the fairer comparison than counting only successful improvements.
- **The real, exact `5` for Dijkstra — one relaxation attempt per real edge, no more** — direct, measured confirmation that Concept Unit 2's proof translates into zero wasted work: every vertex is settled, and every one of its edges relaxed, exactly once.
- **The real, exact `15` for the repeated-rounds approach — three full passes over all five edges** — direct, measured confirmation of Lesson 124's own real overhead: not knowing in advance when convergence is complete forces conservative, repeated re-checking.

### CS Lens

This is the real, measured version of Concept Unit 2's own proof: a provable stopping condition (a settled vertex needs no further relaxation) converts directly into real, eliminated work — `5` real attempts instead of `15`, a genuine `3×` reduction on this small graph, growing larger still on bigger, real ones.

### SE Lens

The alternative to measuring both is trusting that a "smarter" algorithm must be faster, without checking by how much on a real, concrete case. The real, exact numbers — `5` versus `15` — turn Concept Unit 1's own motivating concern into confirmed, quantified evidence, the same discipline this Era has applied to every prior algorithmic comparison since Lesson 79.

### Run It — Show the Real Output

```
$ guile dijkstra-check.scm
Dijkstra total real relax attempts: 5
Lesson 124's repeated-rounds total real relax attempts: 15
```

Verified this session — Dijkstra needs exactly `5` real relaxation attempts, one per edge, to fully and correctly solve this graph; Lesson 124's own repeated-rounds relaxation needs `15` — three times the real work, the concrete, measured cost of not knowing which vertices are already provably done.

---

## Closing

### Connect the pieces

One graph, one proof, one real, measured efficiency gain:

1. **The waste, named (Unit 1):** Lesson 124's own repeated rounds re-check vertices with no way to know they're already finished.
2. **The greedy order, derived and proven (Unit 2):** smallest tentative distance first is always final — a real proof by contradiction, depending on non-negative weights.
3. **Implemented and triple-checked (Unit 3):** the identical real answer, `3`, from Dijkstra, Lesson 124's own relaxation, and Lesson 123's own brute force.
4. **The real, measured savings (Unit 4):** `5` versus `15` real relaxation attempts — Concept Unit 2's proof, converted into confirmed, eliminated work.

Every claim in this lesson traces to real, executed code: a real proof-by-contradiction converted into working code, and a real, direct efficiency measurement against Lesson 124's own naive baseline.

### What breaks without this

Suppose a real routing system used Lesson 124's own repeated-rounds relaxation directly, on a real road network with millions of edges, needing many full rounds to guarantee convergence with no way to know in advance how many. This lesson's own real numbers show precisely what Dijkstra's proof buys back: real work proportional to settling each vertex exactly once, not repeated, provably redundant passes over the entire graph — the actual, measured reason Dijkstra, not naive relaxation, is what real navigation systems are built on.

### Exercises

1. **Observe.** Before checking, predict whether Dijkstra's real relax-attempt count would ever exceed the graph's own real edge count, using Concept Unit 3's own "settle once, relax its edges once" structure to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code on a real, larger graph of your own design.
3. **Formalize.** Replace `dijkstra`'s own `sort`-based vertex selection with Lesson 104's real heap-backed priority queue, and measure whether the real *number* of relax attempts changes (it shouldn't) versus the real *cost* of each vertex-selection step (it should).
4. **Explain.** In your own words, walk through Concept Unit 2's proof by contradiction on this lesson's own graph, naming which vertex plays the role of `w` when `C` is correctly settled before `D`.
5. **Explain.** Using this lesson's real numbers, explain why Concept Unit 2's proof explicitly requires non-negative edge weights, referencing exactly which step of the contradiction argument would fail if a negative edge existed.

### Definition of done

- [ ] You can state Dijkstra's own greedy rule precisely and walk through the full proof-by-contradiction for why it's correct.
- [ ] You can explain exactly why the proof requires non-negative weights, pointing to the specific step that depends on it.
- [ ] You can point to this lesson's own real `5`-versus-`15` numbers as concrete, measured evidence of the real efficiency gain, not an assumed one.
- [ ] You completed Exercises 1–5, including a real heap-backed version reusing Lesson 104's own priority queue.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
