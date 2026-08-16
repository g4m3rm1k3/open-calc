# Lesson 127: Bellman-Ford

**What you will build:** **Bellman-Ford** — Lesson 124's own repeated relaxation, run a precise, derived number of times, real proof that it fixes Lesson 126's own demonstrated failure and correctly detects a **negative cycle** when one exists. Real, verified evidence this session: on Lesson 126's own failing graph, Bellman-Ford computes `D`'s real distance as `−2` — the true minimum, exactly where Dijkstra computed the wrong value, `6`. On a real graph containing a genuine negative cycle (`X→Y→Z→X`, total weight `−1`), a real check after the derived number of rounds correctly detects it; the identical check on Lesson 126's own cycle-free graph correctly reports none. The real cost of this safety: `15` relaxation attempts on Lesson 123's own non-negative graph, three times Dijkstra's `5`. The transferable point: Bellman-Ford isn't a smarter algorithm than Dijkstra — it's a more conservative one, trading Dijkstra's real efficiency gain for a real, provable guarantee Dijkstra's own proof explicitly couldn't offer once weights go negative.

**What you need to know first:** Lesson 124 (`FP-L124-relaxation.md`) — specifically `relax-all-edges`, reused directly and unchanged. Lesson 126 (`FP-L126-why-dijkstra-fails.md`) — specifically its own failing graph, `g2`, the direct real test this lesson's algorithm is checked against.

**Terms introduced in this lesson**

- **Negative cycle** — a real cycle whose total edge weight sums to a negative number. It exists to name the one case where "shortest path" stops being well-defined at all — a real path could repeat the cycle indefinitely, making its own weight arbitrarily small, with no true minimum to find.

**Objects and methods used**

No new objects or methods this lesson — every procedure reappears from Lesson 124/126 unchanged.

---

## Concept Unit 1: A Deliberately Unclever Fix

### The Problem

Lesson 126 showed precisely why Dijkstra's own cleverness — settling each vertex exactly once, in greedy order — breaks with negative edges: a settled vertex's outgoing edges are relaxed exactly once, and a later correction to that vertex never propagates forward. The most direct fix imaginable: stop trying to be clever about order at all, and simply relax *every* edge, *repeatedly*, enough times to guarantee nothing gets missed.

### No isolated lab for this step

This concept has no code of its own to isolate — the fix is posed directly here, contrasting with Lesson 125's own greedy ordering.

### Reference Source

No reference counterpart — the motivating fix draws on Lesson 124's own already-established repeated-relaxation idea, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "Enough Times" Needs to Mean Precisely

"Repeat enough times" isn't yet a real algorithm — it needs a precise, derivable number of rounds, provably sufficient for *any* graph without a negative cycle, not just Lesson 126's own specific example.

### Walkthrough

- **The direct contrast with Dijkstra's own "exactly once" settling** — frames Bellman-Ford as choosing the opposite tradeoff deliberately, not as a lesser algorithm.
- **"provably sufficient for any graph"** — the precise standard Concept Unit 2's own derivation has to meet.

### CS Lens

This is Lesson 82's own design-constraint discipline, applied in reverse from Lesson 125: rather than deriving the minimum necessary work (Dijkstra's own goal), this lesson derives the minimum *sufficient* work that requires no cleverness about order at all — a real, different point on the same tradeoff curve.

### SE Lens

The alternative to deriving a precise round count is relaxing edges "a lot" and hoping it's enough. The real risk of that vagueness: without a provable bound, there's no way to know whether a computed answer is actually final, or merely hasn't finished changing yet — exactly the kind of unchecked assumption this curriculum has avoided since Lesson 22.

---

## Concept Unit 2: Deriving the Round Count and Cycle Detection

### The Problem

Concept Unit 1 named the requirement. It needs a precise, provable number of rounds, and a real way to detect the one case — a negative cycle — where no true shortest path even exists.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building directly on Lesson 124's own safety invariant.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — `|V| − 1` Rounds, and One More to Check

**The round count, derived:** any real shortest path, assuming no negative cycle exists, never needs to repeat a vertex — repeating one would mean traversing some cycle, and a non-negative cycle can only add weight, never help, while a negative cycle would make "shortest" undefined entirely (Concept Unit 2's own next point). A real path visiting each of a graph's `|V|` vertices at most once uses at most `|V| − 1` edges. By induction on the number of edges in the true shortest path: after `k` full rounds of relaxing every edge, every vertex whose true shortest path uses `k` or fewer edges has its correct, final distance. After `|V| − 1` rounds, every vertex is covered, since no true shortest path (again, assuming no negative cycle) needs more edges than that.

**Negative cycle, detected:** if a genuinely *additional* round — a `|V|`-th — still finds an edge to relax, that improvement cannot come from any real, simple path (already fully accounted for after `|V| − 1` rounds). It can only come from a cycle whose repeated traversal keeps lowering some real distance estimate — precisely a negative cycle, and precisely the case where "shortest path" has no true minimum at all.

### Walkthrough

- **The round count tied directly to "at most `|V| − 1` edges in any simple path"** — a real, countable bound, not an approximation.
- **Negative cycle detection derived as a direct consequence of the round count, not a separate mechanism** — the identical relaxation check, run one round further, is all that's needed.

### CS Lens

This is Lesson 43's own induction technique, applied to a quantity ("number of edges in the true shortest path") bounded by the graph's own finite size — the same style of argument Lesson 117 used for BFS's own distance-order guarantee, now generalized to weighted edges.

### SE Lens

The alternative to deriving negative-cycle detection as a byproduct of the round count is building a separate, dedicated cycle-detection pass (Lesson 121's own `has-cycle?`, for instance). The real value of the derived approach: it reuses the identical relaxation check already being run, at zero real additional design cost, rather than combining two separately-verified mechanisms.

---

## Concept Unit 3: Implementing and Verifying the Real Fix

### The Problem

Concept Unit 2 derived the algorithm. It needs real code, checked directly against Lesson 126's own real, documented failure.

### The New Code — Type It Yourself

```scheme
(define (bellman-ford g start)
  (let ((n (length (wgraph-vertices g))))
    (let loop ((i 0) (dist (list (cons start 0))))
      (if (= i (- n 1))
          dist
          (loop (+ i 1) (relax-all-edges dist g))))))
```

### Reference Source

Lesson 124's own `relax-all-edges` (`FP-L124-relaxation.md`, Concept Unit 3), quoted here unchanged; Lesson 126's own `g2` (`FP-L126-why-dijkstra-fails.md`, Concept Unit 3), reused as this lesson's own direct correctness check.

### Files affected

Created: `bellmanford-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `bellmanford-check.scm`, in full:

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
    (if (< cand (dget dist v)) (cons (cons v cand) (filter (lambda (p) (not (equal? (car p) v))) dist)) dist)))
(define (fold-left f init lst) (if (null? lst) init (fold-left f (f init (car lst)) (cdr lst))))
(define (relax-all-edges dist g) (fold-left (lambda (d e) (relax d g (car e) (cadr e))) dist (wgraph-edges g)))

(define (bellman-ford g start)                                      ; ← new
  (let ((n (length (wgraph-vertices g))))                               ; ← new
    (let loop ((i 0) (dist (list (cons start 0))))                         ; ← new
      (if (= i (- n 1))                                                       ; ← new
          dist                                                                   ; ← new
          (loop (+ i 1) (relax-all-edges dist g))))))                               ; ← new

(define g2 (make-wgraph '(S A B C D) (list (list 'S 'A 1) (list 'S 'B 2) (list 'B 'C 1) (list 'C 'A -10) (list 'A 'D 5))))
(define bf-dist (bellman-ford g2 'S))
(display "Bellman-Ford dist to A: ") (display (dget bf-dist 'A)) (newline)
(display "Bellman-Ford dist to D: ") (display (dget bf-dist 'D)) (newline)
```

`bellman-ford` runs `relax-all-edges` exactly `|V| − 1` times — Concept Unit 2's own derived count, no more, no fewer — with no attempt at all to choose a clever order among the real edges.

### Mechanical Walkthrough

- **`(let ((n (length (wgraph-vertices g)))) ...)`** — a reappearance of `length`; reads the real vertex count once, the exact quantity Concept Unit 2's round count depends on.
- **`(let loop ((i 0) (dist ...)) (if (= i (- n 1)) dist (loop (+ i 1) (relax-all-edges dist g))))`** — a reappearance of named-let recursion; the literal execution of "relax every edge, `|V| − 1` times," nothing more.
- **The real, exact `−2` for `D`'s distance** — direct, checked confirmation that Bellman-Ford, unlike Dijkstra, correctly solves Lesson 126's own real, documented failure case.

### CS Lens

This is Lesson 111's own decision-procedure discipline, demonstrated concretely: Concept Unit 2's derivation predicted this exact fix would work; running it against the exact graph that broke the previous approach is the direct, checked confirmation, not a new, separate hope.

### SE Lens

The alternative to checking against Lesson 126's own specific failing graph is checking Bellman-Ford only on fresh, new examples. The real value of reusing `g2` directly: it turns "Bellman-Ford fixes the negative-weight problem" from a general claim into a checked reversal of a specific, already-documented real failure.

### Run It — Show the Real Output

```
$ guile bellmanford-check.scm
Bellman-Ford dist to A: -7
Bellman-Ford dist to D: -2
```

Verified this session — Bellman-Ford's real distance to `D` is `−2`, the true minimum, exactly where Lesson 126's Dijkstra computed `6` — real, direct, checked proof that repeated, unordered relaxation fixes the exact real failure Lesson 126 documented.

---

## Concept Unit 4: Negative Cycle Detection and the Real Cost of Safety

### The Problem

Concept Unit 3 confirmed correctness on a negative-edge, cycle-free graph. It's worth checking Concept Unit 2's own negative-cycle detection directly, on both a graph that has one and a graph that doesn't — and measuring, honestly, what this lesson's own safety costs in real relaxation attempts.

### The New Code — Type It Yourself

```scheme
(define (has-negative-cycle? g dist)
  (let ((improved #f))
    (for-each (lambda (e) (if (< (+ (dget dist (car e)) (caddr e)) (dget dist (cadr e))) (set! improved #t)))
              (wgraph-edges g))
    improved))
```

### Reference Source

No reference counterpart — a from-scratch implementation of Concept Unit 2's own derived detection rule: one additional relaxation check, run after `bellman-ford`'s own `|V| − 1` rounds complete.

### Files affected

Modified: `bellmanford-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `bellmanford-check.scm`, extended with negative-cycle detection and a real cost comparison:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define (has-negative-cycle? g dist)                                ; ← new
  (let ((improved #f))                                                  ; ← new
    (for-each (lambda (e) (if (< (+ (dget dist (car e)) (caddr e)) (dget dist (cadr e))) (set! improved #t))) ; ← new
              (wgraph-edges g))                                                                                  ; ← new
    improved))                                                                                                     ; ← new

(display "negative cycle in g2? ") (display (has-negative-cycle? g2 bf-dist)) (newline)

(define gneg (make-wgraph '(X Y Z) (list (list 'X 'Y 1) (list 'Y 'Z -3) (list 'Z 'X 1))))   ; ← new
(define bfneg (bellman-ford gneg 'X))
(display "negative cycle in gneg (X->Y->Z->X, total -1)? ") (display (has-negative-cycle? gneg bfneg)) (newline)

(define g123 (make-wgraph '(A B C D) (list (list 'A 'D 100) (list 'A 'B 1) (list 'B 'C 1) (list 'C 'D 1) (list 'A 'C 50))))
(define attempts 0)                                                    ; ← new
(define (relax-attempted dist g u v) (set! attempts (+ attempts 1)) (relax dist g u v)) ; ← new
(define (relax-all-edges-attempted dist g) (fold-left (lambda (d e) (relax-attempted d g (car e) (cadr e))) dist (wgraph-edges g))) ; ← new
(define (bellman-ford-attempts g start)                                                    ; ← new
  (let ((n (length (wgraph-vertices g))))                                                     ; ← new
    (let loop ((i 0) (dist (list (cons start 0)))) (if (= i (- n 1)) dist (loop (+ i 1) (relax-all-edges-attempted dist g)))))) ; ← new
(set! attempts 0)
(bellman-ford-attempts g123 'A)
(display "Bellman-Ford real relax attempts (Lesson 123's graph): ") (display attempts) (newline)
```

`has-negative-cycle?` runs the identical relaxation *check* — without applying the update — one round past `bellman-ford`'s own final round; any real edge that would still improve something is direct proof of a negative cycle, per Concept Unit 2's own derivation.

### Mechanical Walkthrough

- **`(< (+ (dget dist (car e)) (caddr e)) (dget dist (cadr e)))`** — a reappearance of `<`, `+`; the literal relaxation *condition*, checked without performing the update — a real, one-round-further test.
- **The real, exact `#f` for `g2` (no negative cycle) and `#t` for `gneg` (a genuine one)** — direct, checked confirmation of Concept Unit 2's detection rule, on both a case that should and shouldn't trigger it.
- **The real, exact `15` relax attempts for Bellman-Ford, against Dijkstra's own real `5`** — direct, measured confirmation of the honest cost this lesson's safety carries, a real `3×` overhead on the identical graph.

### CS Lens

This is Lesson 111's own real cost-comparison discipline, closing this Era's shortest-path arc: Dijkstra and Bellman-Ford aren't ranked "better" and "worse" — they occupy two real, different points on a genuine tradeoff, efficiency against a broader correctness guarantee, exactly the kind of choice Lesson 111's own decision procedure exists to make explicit.

### SE Lens

The alternative to measuring Bellman-Ford's real cost is treating "it's more correct" as reason enough to always prefer it. The real, honest numbers — `15` versus `5` on a graph where Dijkstra was already fully correct — show why real systems check whether negative weights can genuinely occur before paying this lesson's own real overhead by default.

### Run It — Show the Real Output

```
$ guile bellmanford-check.scm
negative cycle in g2? #f
negative cycle in gneg (X->Y->Z->X, total -1)? #t
Bellman-Ford real relax attempts (Lesson 123's graph): 15
```

Verified this session — `g2`, real and negative-edged but cycle-free, correctly reports no negative cycle. `gneg`, a real, deliberately constructed cycle (`X→Y→Z→X`, total weight `−1`), is correctly detected. Bellman-Ford's real cost on Lesson 123's own graph, `15` relax attempts, is three times Dijkstra's own real `5` — the honest, measured price of this lesson's broader guarantee.

---

## Closing

### Connect the pieces

One failing graph, fixed; one negative cycle, caught; one honest cost:

1. **The deliberately unclever fix, proposed (Unit 1):** stop ordering cleverly, relax everything, enough times.
2. **The precise round count and cycle detection, derived (Unit 2):** `|V| − 1` rounds, by induction on true shortest-path length; one more round catches a negative cycle.
3. **The real failure, fixed and checked (Unit 3):** Lesson 126's own wrong `6` becomes the correct `−2`.
4. **Detection and cost, both measured directly (Unit 4):** correct `#t`/`#f` on two real graphs, and a real, honest `15`-versus-`5` cost against Dijkstra.

Every claim in this lesson traces to real, executed code: a real fix checked against a documented prior failure, real detection checked on both a cyclic and an acyclic graph, and a real, measured cost comparison.

### What breaks without this

Suppose a real system needed shortest paths over data that could genuinely contain negative-weight edges — a currency-arbitrage graph, where some conversion sequences produce real net gains — and used Bellman-Ford's own negative-cycle detection to distinguish "a real best answer exists" from "no true minimum exists at all, because gains can be repeated indefinitely." Without Concept Unit 2's own derived, provable round count, there'd be no way to know how many rounds are *actually* enough, or to distinguish "still converging" from "diverging forever through a negative cycle" — exactly the two real, distinguishable cases this lesson's algorithm separates directly.

### Exercises

1. **Observe.** Before checking, predict how many real relaxation attempts Bellman-Ford would need on a graph with `10` vertices and `20` edges, using this lesson's own `|V| − 1` round count to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Extend `has-negative-cycle?` to report *which* real edge triggered the detection, and confirm it correctly identifies one of `gneg`'s own three edges.
4. **Explain.** In your own words, explain why a negative cycle makes "shortest path" undefined rather than merely "hard to compute," referencing what repeatedly traversing the cycle does to a real path's total weight.
5. **Explain.** Using this lesson's real numbers, state one real scenario where Bellman-Ford's `3×` overhead would be clearly worth paying over Dijkstra, and one where it would not, referencing whether negative weights are even possible in each scenario.

### Definition of done

- [ ] You can state and derive the `|V| − 1` round count, and explain why it's provably sufficient for any graph without a negative cycle.
- [ ] You can explain how negative-cycle detection reuses the identical relaxation check, one round further, with no separate mechanism needed.
- [ ] You can point to this lesson's own real numbers — `−2` fixing Lesson 126's `6`, and `15` versus Dijkstra's `5` — as concrete, checked evidence for both this lesson's fix and its real cost.
- [ ] You completed Exercises 1–5, including a real extension identifying which specific edge triggered cycle detection.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
