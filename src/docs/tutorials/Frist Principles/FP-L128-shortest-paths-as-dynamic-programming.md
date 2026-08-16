# Lesson 128: Shortest Paths as Dynamic Programming

**What you will build:** an explicit dynamic-programming table for shortest paths — `dist_k(v)`, the true shortest distance to `v` using *at most* `k` edges — proving Bellman-Ford was a DP table-fill in disguise all along, and uncovering a real, honest subtlety Lesson 127 never surfaced. Real, verified evidence this session: on Lesson 126's own failing graph, the pure DP table, built strictly row-by-row with no shortcuts, needs the *entire* derived bound, all `4` rounds (`|V| − 1` for this `5`-vertex graph), before `D`'s value settles at the true `−2` — genuinely using every round the Lesson 127 proof allows. Lesson 127's own real `relax-all-edges`, run as actual code, reaches the identical final answer in just `1` round, because its sequential updates let a later edge in the same pass see an earlier edge's fresh update from that same pass — a real, legitimate speedup the pure DP formulation deliberately doesn't take. The transferable point: both are correct, and both converge to the identical final table — but only the strict, row-separated version is what Lesson 127's own `|V| − 1` proof actually reasons about, and this lesson's own graph is real, checked proof that bound is tight, not merely a safe overestimate.

**What you need to know first:** Lesson 127 (`FP-L127-bellman-ford.md`) — specifically `bellman-ford`'s own real `|V| − 1` round count and its own graph, `g2`, reused directly. Era III's own dynamic-programming work — specifically the general idea of building a table bottom-up from smaller subproblems to larger ones, applied here to shortest paths for the first time.

**Terms introduced in this lesson**

- **Optimal substructure** — the property that a problem's optimal solution is built directly from optimal solutions to smaller versions of the same problem. It exists to name, precisely, why shortest paths admit a DP formulation at all: the shortest path to `v` using at most `k` edges is always built from the shortest path to some neighbor using at most `k − 1` edges, plus one more edge — never from a suboptimal one.

**Objects and methods used**

No new objects or methods this lesson — every procedure reappears from Lesson 127 unchanged, or is a small, direct variant.

---

## Concept Unit 1: A Question Never Directly Asked

### The Problem

Lesson 127 derived Bellman-Ford's `|V| − 1` round count by reasoning about the *longest possible* true shortest path. It never asked the more precise, DP-shaped question: what, exactly, does each individual round compute? Era III's own dynamic-programming lessons built tables indexed by a shrinking subproblem size, filled from the smallest case up — a question worth asking directly of shortest paths, rather than left implicit inside Bellman-Ford's own loop.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, connecting Lesson 127's own algorithm to Era III's own vocabulary.

### Reference Source

No reference counterpart — the motivating question draws on Lesson 127's own already-built algorithm and Era III's own general DP idea, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What a DP Formulation Needs

A real DP formulation needs a precisely-defined subproblem, indexed by something that shrinks toward a real base case, and a recurrence expressing the larger subproblem's answer directly in terms of smaller ones — exactly the shape Era III's own recurrence work established generally.

### Walkthrough

- **The direct citation of Era III's own DP vocabulary, applied to a genuinely new domain** — frames this lesson as recognizing an existing pattern, not inventing a new one.
- **"indexed by something that shrinks toward a real base case"** — previews Concept Unit 2's own choice of index precisely.

### CS Lens

This is Lesson 78's own divide-and-conquer recognition, applied a second time to an algorithm this curriculum already built for other reasons: Bellman-Ford was derived directly from Lesson 124's relaxation, with no DP vocabulary in sight — recognizing it as a DP table afterward is a real act of pattern-matching, not part of the original derivation.

### SE Lens

The alternative to naming the DP structure explicitly is treating Bellman-Ford as a self-contained algorithm, unrelated to Era III's own general technique. The real cost of that separation: a real engineer familiar with DP but not with Bellman-Ford specifically would have to re-derive the connection from scratch, rather than recognizing an already-known pattern immediately.

---

## Concept Unit 2: The DP Recurrence for Shortest Paths

### The Problem

Concept Unit 1 named the requirement. It needs a precise subproblem definition and recurrence, connecting directly to Bellman-Ford's own real round structure.

### No isolated lab for this step

This concept has no code of its own to isolate — the recurrence is derived directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation connecting Lesson 127's own algorithm to Era III's own general DP structure.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — `dist_k(v)`, Defined and Recurred

**The subproblem:** `dist_k(v)` — the true shortest distance from the start to `v`, using *at most* `k` edges.

**The base case:** `dist_0(start) = 0`; `dist_0(v) = ∞` for every other `v` — using zero edges, only the start is reachable, at cost zero.

**The recurrence:** `dist_k(v) = min(dist_{k-1}(v), min over every edge (u, v) of dist_{k-1}(u) + w(u, v))` — either `v`'s best distance doesn't improve at all with one more edge allowed, or it improves by routing through some neighbor `u`'s own, already-known, `(k-1)`-edge-or-fewer best distance.

**Why this is optimal substructure, precisely:** `dist_k(v)`'s own optimal value is built *entirely* from `dist_{k-1}` values that are themselves already optimal for their own, smaller subproblem — never from a merely plausible or partially-computed intermediate value.

**The connection to Bellman-Ford, made explicit:** one full round of `relax-all-edges`, applied uniformly to a *fixed* prior table, computes exactly one row of this recurrence — `dist_k` from `dist_{k-1}` — and Lesson 127's own `|V| − 1` rounds are exactly `|V| − 1` rows of this table, filled bottom-up.

### Walkthrough

- **`dist_k(v)` indexed by "edges used," shrinking to `k = 0`'s real base case** — the exact shape Concept Unit 1 required.
- **The recurrence's own `min` over two real alternatives** — mirrors exactly how Era III's own recurrences chose between "don't extend" and "extend via one more step."
- **"a fixed prior table," stated explicitly** — the precise detail Concept Unit 3's own real check turns out to matter for.

### CS Lens

This is Lesson 55's own dynamic-programming emergence, encountered a second time in a genuinely different domain: the identical recognition — a naive, repeated computation hides a table that can be filled bottom-up instead — now applied to graphs rather than a single recursive numeric function.

### SE Lens

The alternative to deriving the recurrence precisely is trusting the informal connection ("Bellman-Ford is kind of like DP") without stating exactly what the table's rows and recurrence are. The real value of precision here: Concept Unit 3's own real check — comparing the strict DP table row-by-row against Bellman-Ford's actual code — would be impossible to state clearly without first pinning down exactly what each row is supposed to mean.

---

## Concept Unit 3: Building the Real DP Table, and a Genuine Surprise

### The Problem

Concept Unit 2 derived the recurrence. It needs real code, and a real, direct comparison against Lesson 127's own actual `bellman-ford` — checking not just the final answer, but every intermediate row.

### The New Code — Type It Yourself

```scheme
(define (dp-shortest-paths g start)
  (let ((n (length (wgraph-vertices g))))
    (let loop ((k 0) (table (list (list (cons start 0)))))
      (if (= k (- n 1))
          (reverse table)
          (let ((prev (car table)))
            (let ((next (fold-left (lambda (d e)
                                      (let* ((u (car e)) (v (cadr e)) (w (caddr e))
                                             (cand (+ (dget prev u) w)))
                                        (if (< cand (dget d v))
                                            (cons (cons v cand) (filter (lambda (p) (not (equal? (car p) v))) d))
                                            d)))
                                    prev (wgraph-edges g))))
              (loop (+ k 1) (cons next table))))))))
```

### Reference Source

Lesson 127's own `bellman-ford`, `relax-all-edges`, and `g2` (`FP-L127-bellman-ford.md`, Concept Unit 3), quoted here unchanged, run alongside this lesson's own strict DP formulation for direct comparison.

### Files affected

Created: `sp-dp-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `sp-dp-check.scm`, in full:

```scheme
(define (make-wgraph vertices edges) (cons vertices edges))
(define (wgraph-vertices g) (car g))
(define (wgraph-edges g) (cdr g))
(define INF 999999)
(define (dget dist v) (let ((r (assoc v dist))) (if r (cdr r) INF)))
(define (fold-left f init lst) (if (null? lst) init (fold-left f (f init (car lst)) (cdr lst))))

(define (dp-shortest-paths g start)                                 ; ← new
  (let ((n (length (wgraph-vertices g))))                               ; ← new
    (let loop ((k 0) (table (list (list (cons start 0)))))                 ; ← new
      (if (= k (- n 1))                                                       ; ← new
          (reverse table)                                                        ; ← new
          (let ((prev (car table)))                                                 ; ← new
            (let ((next (fold-left (lambda (d e)                                       ; ← new
                                      (let* ((u (car e)) (v (cadr e)) (w (caddr e))        ; ← new
                                             (cand (+ (dget prev u) w)))                      ; ← new
                                        (if (< cand (dget d v))                                  ; ← new
                                            (cons (cons v cand) (filter (lambda (p) (not (equal? (car p) v))) d)) ; ← new
                                            d)))                                                                     ; ← new
                                    prev (wgraph-edges g))))                                                            ; ← new
              (loop (+ k 1) (cons next table))))))))                                                                      ; ← new

;; ... Lesson 127's own edge-weight, relax, relax-all-edges, unchanged ...
(define (edge-weight g a b) (caddr (car (filter (lambda (e) (equal? (cadr e) b)) (filter (lambda (e) (equal? (car e) a)) (wgraph-edges g))))))
(define (relax dist g u v)
  (let ((cand (+ (dget dist u) (edge-weight g u v))))
    (if (< cand (dget dist v)) (cons (cons v cand) (filter (lambda (p) (not (equal? (car p) v))) dist)) dist)))
(define (relax-all-edges dist g) (fold-left (lambda (d e) (relax d g (car e) (cadr e))) dist (wgraph-edges g)))
(define (bellman-ford-rounds g start)
  (let ((n (length (wgraph-vertices g))))
    (let loop ((i 0) (dist (list (cons start 0))) (rounds (list (list (cons start 0)))))
      (if (= i (- n 1)) (reverse rounds)
          (let ((d2 (relax-all-edges dist g))) (loop (+ i 1) d2 (cons d2 rounds)))))))

(define g2 (make-wgraph '(S A B C D) (list (list 'S 'A 1) (list 'S 'B 2) (list 'B 'C 1) (list 'C 'A -10) (list 'A 'D 5))))
(define dp-table (dp-shortest-paths g2 'S))
(define bf-rounds (bellman-ford-rounds g2 'S))

(display "DP table rows: ") (display dp-table) (newline)
(display "Bellman-Ford rounds: ") (display bf-rounds) (newline)
(display "identical, row for row? ") (display (equal? dp-table bf-rounds)) (newline)
```

`dp-shortest-paths` computes each row *strictly* from the previous row, `prev` — never letting a same-row update influence a later edge's own candidate distance within that row, the exact, literal execution of Concept Unit 2's recurrence. `bellman-ford-rounds` is Lesson 127's own algorithm, unchanged, with each round's result additionally recorded for direct comparison.

### Mechanical Walkthrough

- **`(let ((prev (car table))) (let ((next (fold-left ... prev ...))) ...))`** — first appearance of this specific separation: `next` is built entirely by reading from `prev`, the fixed, unchanging table from the previous round — deliberately never reading from `next` itself mid-construction.
- **`(dget prev u)`**, specifically reading from `prev` rather than the row currently being built** — the literal enforcement of Concept Unit 2's own recurrence, `dist_k` built only from `dist_{k-1}`.
- **The real, exact `#f` for row-by-row equality between the strict DP table and Lesson 127's own actual `bellman-ford`** — a genuine, checked surprise: both converge to the identical *final* answer, but by different real intermediate paths.

### CS Lens

This is Lesson 60's own honest, non-overclaiming treatment of imperfect data, encountered here in a new form: rather than smoothing over the real, checked mismatch between the pure DP table and Bellman-Ford's own actual code, this unit reports it directly — a real, informative difference, not a bug.

### SE Lens

The alternative to comparing every row is checking only the final answer and declaring the DP framing confirmed. The real value of the row-by-row check: it surfaces a genuine, useful distinction — between the *provable worst-case bound* (which the strict DP table actually achieves) and a *real implementation's* typical, often-faster behavior — that checking only the end result would have hidden completely.

### Run It — Show the Real Output

```
$ guile sp-dp-check.scm
DP table rows: (((S . 0)) ((B . 2) (A . 1) (S . 0)) ((D . 6) (C . 3) (B . 2) (A . 1) (S . 0)) ((A . -7) (D . 6) (C . 3) (B . 2) (S . 0)) ((D . -2) (A . -7) (C . 3) (B . 2) (S . 0)))
Bellman-Ford rounds: (((S . 0)) ((D . -2) (A . -7) (C . 3) (B . 2) (S . 0)) ((D . -2) (A . -7) (C . 3) (B . 2) (S . 0)) ((D . -2) (A . -7) (C . 3) (B . 2) (S . 0)) ((D . -2) (A . -7) (C . 3) (B . 2) (S . 0)))
identical, row for row? #f
```

Verified this session — the strict DP table takes all `4` real rows to reach `D`'s final value, `−2`: row `1` finds `A = 1` and `B = 2`; row `2` extends to `D = 6` and `C = 3`, still using the stale `A = 1`; row `3` finally corrects `A` to `−7`, but `D` stays at the stale `6` for one more row, since row `3`'s own `D` computation still reads `prev`'s `A = 1`; only row `4` propagates the corrected `A` into `D`, reaching `−2`. Lesson 127's own actual `bellman-ford`, by contrast, reaches the fully correct final answer already after round `1` — its sequential, same-round chaining lets `C`'s correction reach `A`, and `A`'s correction reach `D`, all within one real pass.

---

## Concept Unit 4: Why the Bound Is Tight, and What Real Chaining Buys

### The Problem

Concept Unit 3 found the strict DP table genuinely needs every one of its `4` rows. It's worth naming precisely why — confirming Lesson 127's own `|V| − 1` bound isn't a loose overestimate, at least not for every graph — and naming exactly what Bellman-Ford's own real chaining buys over the strict formulation.

### The New Code — Type It Yourself

```scheme
(display "dist using at most 1 edge, A: ") (display (dget (car (cdr dp-table)) 'A)) (newline)
(display "dist using at most 2 edges, D (built from the above): ") (display (dget (car (cddr dp-table)) 'D)) (newline)
```

### Reference Source

Concept Unit 3's own `dp-table`, read directly at specific rows.

### Files affected

Modified: `sp-dp-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `sp-dp-check.scm`, extended with a direct read of two specific, real rows:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(display "dist using at most 1 edge, A: ") (display (dget (car (cdr dp-table)) 'A)) (newline) ; ← new
(display "dist using at most 2 edges, D (built from the above): ") (display (dget (car (cddr dp-table)) 'D)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(car (cdr dp-table))`** — a reappearance of `car`, `cdr`; reads row `k = 1` directly (row `0` is the table's own first element).
- **`(car (cddr dp-table))`** — a reappearance of `cddr`; reads row `k = 2` directly, the row `D`'s own first, stale value, `6`, appears in.
- **The real, exact `1` for `A` at `k = 1`, feeding directly into the real, exact `6` for `D` at `k = 2`** — direct, checked confirmation that `D`'s early value genuinely depends on `A`'s own not-yet-corrected one, exactly the mechanism Concept Unit 3's own row-by-row divergence traces back to.

### CS Lens

This is optimal substructure's own real limitation made concrete: the recurrence guarantees `dist_k(v)` is optimal *given* `dist_{k-1}` is fully optimal — but `dist_{k-1}(u)` for the specific `u` a correction routes through might itself still be one round away from its own true value, exactly why `D`'s correction here needs a genuinely separate row from `A`'s own.

### SE Lens

The alternative to Bellman-Ford's real, sequential chaining is always using the strict, row-separated DP formulation, guaranteeing the full `|V| − 1` rounds every time, even on graphs (like Lesson 123's own non-negative one) where far fewer would suffice in practice. The real, honest tradeoff: strict separation is what the *worst-case* proof needs and can rely on; real chaining is a legitimate, safe optimization on top of it, whose real benefit — this lesson's own `4`-rows-versus-`1`-round gap — depends entirely on the specific graph and edge order, exactly as Lesson 124's own order-sensitivity finding first showed.

### Run It — Show the Real Output

```
$ guile sp-dp-check.scm
dist using at most 1 edge, A: 1
dist using at most 2 edges, D (built from the above): 6
```

Verified this session — `A`'s own real distance using at most `1` edge is `1`, not yet the true `−7`; `D`'s real distance using at most `2` edges, built directly from that same, not-yet-corrected value, is `6`, not yet the true `−2` — real, direct confirmation of exactly which stale value propagates forward, and why this lesson's own graph needs the full `4`-row bound under strict DP separation.

---

## Closing

### Connect the pieces

One recurrence, one graph, one genuine surprise:

1. **The unasked question, posed (Unit 1):** Bellman-Ford was never explicitly framed as a DP table, though Era III already had the vocabulary.
2. **The recurrence, derived (Unit 2):** `dist_k(v)`, built from `dist_{k-1}` alone — real optimal substructure, precisely stated.
3. **The strict table built, and a real divergence found (Unit 3):** `4` rows needed under strict separation, versus Lesson 127's own `1`-round real convergence.
4. **The mechanism traced precisely (Unit 4):** `A`'s stale `1` at row `1` produces `D`'s stale `6` at row `2`, the exact chain strict DP takes an extra round to fix.

Every claim in this lesson traces to real, executed code: a real, row-by-row comparison between a strict DP formulation and Lesson 127's own actual algorithm, and a real, traced explanation of exactly where and why they diverge before reconverging.

### What breaks without this

Suppose an engineer, having proven Lesson 127's own `|V| − 1` bound, assumed it was a loose, rarely-reached worst case, and built a system that stopped early after only a few rounds "to save time," trusting real chaining to always converge faster in practice. This lesson's own real graph is a genuine, checked counterexample under strict separation — and even Lesson 127's own faster, chained version depends on a specific, favorable edge order (Lesson 124's own point) that isn't guaranteed on every real graph. Understanding the DP structure precisely, as this lesson derives it, is what shows exactly when the full bound is genuinely needed, not just usually generous.

### Exercises

1. **Observe.** Before checking, predict whether reversing `g2`'s own edge order (Lesson 124's own reordering technique) would make Bellman-Ford's *real* code need more than `1` round to converge, using this lesson's own strict-versus-chained distinction to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Build a real, strict DP table for Lesson 123's own non-negative graph, and confirm its final row matches Dijkstra and Bellman-Ford's own already-established answer, `3`, for `D`.
4. **Explain.** In your own words, explain why `dp-shortest-paths` reads only from `prev`, never from `next` mid-construction, referencing what would happen to the recurrence's own correctness guarantee if it read from `next` instead.
5. **Explain.** Using this lesson's real numbers, explain precisely why Bellman-Ford's real, chained version is still safe despite skipping the strict separation, referencing Lesson 124's own safety-in-any-order proof.

### Definition of done

- [ ] You can state the `dist_k(v)` recurrence precisely and explain what optimal substructure means for shortest paths specifically.
- [ ] You can explain why the strict DP table and Lesson 127's own real `bellman-ford` reach the identical final answer by genuinely different real intermediate paths.
- [ ] You can point to this lesson's own real numbers — `A = 1` at row `1`, `D = 6` at row `2` — as the concrete, traced mechanism behind that divergence.
- [ ] You completed Exercises 1–5, including a real strict-DP check against Lesson 123's own non-negative graph.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
