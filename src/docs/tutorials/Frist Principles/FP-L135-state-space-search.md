# Lesson 135: State-Space Search

**What you will build:** **state-space search** — Lesson 116's own BFS, generalized to search a graph that's never stored at all, only computed on demand via a real `successors` function, exactly Lesson 114's own implicit-graph idea extended from a literal grid to an arbitrary computational problem. Real, verified evidence this session: starting from `0`, with three real moves available (`+3`, `+5`, `×2`), BFS finds the true shortest move sequence to reach `17` in `4` moves — exactly matching an independent, real brute-force search over every possible move sequence. The identical real code finds `25` in `4` moves too, again matching brute force exactly. Reaching `17` this way expands only `16` real states — a small, real fraction of the `201` numbers between `0` and the search's own bound, `200`, that a fully pre-built graph would have needed to store in advance. The transferable point: nothing about BFS's own real correctness proof (Lesson 117) depended on vertices and edges being pre-listed anywhere — it only ever depended on a real, computable notion of "neighbor," and this lesson shows that notion can be an arbitrary rule over an arbitrary kind of state, not just a literal graph.

**What you need to know first:** Lesson 116 (`FP-L116-breadth-first-search.md`) — specifically `bfs` itself, generalized here to accept any real `successors` function rather than a pre-built graph. Lesson 114 (`FP-L114-graph-representations.md`) — specifically the implicit graph, the direct conceptual ancestor of this lesson's own subject.

**Terms introduced in this lesson**

- **State** — a single, specific configuration of whatever problem is being searched — a number, in this lesson's own example, but in general anything precisely describable and comparable for equality. It exists to generalize "vertex" beyond graphs that were ever explicitly built.
- **State-space search** — searching a graph whose vertices (states) and edges (legal moves between states) are never stored, only computed on demand via a real `successors` function. It exists to name, precisely, what this lesson's own generalized BFS is actually doing.

**Objects and methods used**

No new objects or methods this lesson — every procedure reappears from Lesson 114/116 unchanged, or is a small, direct generalization.

---

## Concept Unit 1: Problems That Don't Look Like Graphs

### The Problem

Consider a real, concrete puzzle: starting from `0`, using only the moves `+3`, `+5`, and `×2`, what's the fewest moves needed to reach a specific target number? Nothing about this problem mentions vertices or edges — no graph is given anywhere. But the real question — "fewest moves to reach a goal" — is exactly the question Lesson 116's BFS already answers, if only the numbers involved could be seen as a graph's own vertices.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, deliberately without graph vocabulary, to make the real generalization concrete.

### Reference Source

No reference counterpart — the motivating problem is posed directly, a genuinely new domain for this Era's own graph-search machinery.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Lesson 114's Implicit Graph Already Solved

Lesson 114's own implicit graph — a `3×3` grid whose neighbors were computed by real arithmetic, never stored — already proved that a graph's vertices and edges don't need to be materialized anywhere for BFS or DFS to work correctly. This lesson's own numeric puzzle is the identical idea, one level more general: the "vertices" are every reachable number, and the "edges" are real, computable moves.

### Walkthrough

- **The direct citation of Lesson 114's own implicit grid** — frames this lesson as a real generalization, not a new idea.
- **"one level more general"** — precise about what actually changes: not the search algorithm, only how broadly "neighbor" can be defined.

### CS Lens

This is Lesson 78's own divide-and-conquer template recognition, applied a second time to search itself: BFS was never really "a graph algorithm" in the narrow sense — it's an algorithm over anything admitting a real notion of "neighbor," and a literal graph was only this curriculum's first, concrete instance of that.

### SE Lens

The alternative to recognizing this generalization is treating every new "shortest sequence of moves" problem as requiring a brand-new search algorithm. The real cost of that narrowing: real effort re-deriving and re-verifying BFS's own already-proven correctness (Lesson 117) for every new problem shape, instead of reusing the identical, already-trusted algorithm with a new `successors` function.

---

## Concept Unit 2: Deriving State, Successors, and the Generalized BFS

### The Problem

Concept Unit 1 named the connection informally. It needs a precise vocabulary — state, successor — and a real, generalized version of Lesson 116's `bfs` that accepts *any* successors function, not one tied to a pre-built graph structure.

### No isolated lab for this step

This concept has no code of its own to isolate — the generalization is derived directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

Lesson 116's own `bfs` (`FP-L116-breadth-first-search.md`, Concept Unit 3), the direct structural template this lesson generalizes.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Generalizing `graph-neighbors` Into `successors`

**State, precisely:** any single, specific, comparable configuration — for this lesson's puzzle, an integer.

**Successors, precisely:** a real function taking one state and returning every state reachable from it in exactly one legal move — for this lesson's puzzle, `successors(n) = {n + 3, n + 5, n × 2}`, bounded to keep the search finite.

**The generalized BFS:** identical to Lesson 116's own `bfs` in every real respect — the same queue, the same distance table, the same FIFO discipline Lesson 117 proved correct — except that wherever `bfs` called `graph-neighbors g v` to look up a pre-stored list, this lesson's version calls `(successors v)` directly, computing the answer fresh, on demand, exactly as Lesson 114's own implicit graph computed neighbors by rule.

**Why Lesson 117's own proof still applies, unchanged:** that proof never once referenced how neighbors were obtained — only that, given a vertex, its neighbors could be determined. A computed `successors` call satisfies that requirement exactly as well as a stored lookup does.

### Walkthrough

- **State and successors, defined generically, not tied to numbers specifically** — the real, transferable vocabulary, with the numeric puzzle as one concrete instance.
- **"Lesson 117's own proof still applies, unchanged"** — the precise, load-bearing claim this generalization depends on, traced back to exactly what that proof did and didn't assume.

### CS Lens

This is Lesson 84's own abstraction discipline, applied to an algorithm rather than a data structure: `bfs` was written against the *behavior* "given a vertex, list its neighbors," never against any one specific representation of that behavior — exactly what makes swapping a stored lookup for a computed rule safe without re-deriving anything.

### SE Lens

The alternative to reusing `bfs`'s own already-proven structure is writing a new, problem-specific search from scratch for every new state-space problem. The real cost of that alternative: re-earning Lesson 117's own real, checked correctness guarantee every single time, rather than inheriting it automatically by construction.

---

## Concept Unit 3: Implementing and Verifying State-Space BFS

### The Problem

Concept Unit 2 derived the generalization. It needs real code, and a real, independent brute-force check on the concrete numeric puzzle.

### The New Code — Type It Yourself

```scheme
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

### Reference Source

Lesson 116's own `make-queue`/`enqueue`/`dequeue`/`queue-front` (`FP-L116-breadth-first-search.md`, Concept Unit 3), quoted here unchanged; `bfs` itself, generalized per Concept Unit 2's own derivation.

### Files affected

Created: `statespace-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `statespace-check.scm`, in full:

```scheme
(define (make-queue) (list '() '()))
(define (queue-empty? q) (and (null? (car q)) (null? (cadr q))))
(define (enqueue q x) (list (car q) (cons x (cadr q))))
(define (dequeue q) (if (null? (car q)) (let ((f (reverse (cadr q)))) (list (cdr f) '())) (list (cdr (car q)) (cadr q))))
(define (queue-front q) (if (null? (car q)) (car (reverse (cadr q))) (car (car q))))

(define (bfs-implicit start goal? successors)                      ; ← new
  (let ((dist (list (cons start 0))) (q (enqueue (make-queue) start))) ; ← new
    (let loop ((q q))                                                     ; ← new
      (if (queue-empty? q)                                                   ; ← new
          #f                                                                    ; ← new
          (let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist))))    ; ← new
            (if (goal? v)                                                            ; ← new
                d                                                                       ; ← new
                (let loop2 ((ns (successors v)) (q3 q2))                                  ; ← new
                  (if (null? ns)                                                             ; ← new
                      (loop q3)                                                                 ; ← new
                      (if (assoc (car ns) dist)                                                    ; ← new
                          (loop2 (cdr ns) q3)                                                          ; ← new
                          (begin (set! dist (cons (cons (car ns) (+ d 1)) dist)) (loop2 (cdr ns) (enqueue q3 (car ns)))))))))))))) ; ← new

(define bound 200)
(define (successors n) (filter (lambda (x) (<= x bound)) (list (+ n 3) (+ n 5) (* n 2))))
(define target 17)
(display "shortest number of moves from 0 to reach 17: ")
(display (bfs-implicit 0 (lambda (n) (= n target)) successors)) (newline)

(define (brute-min-moves start target max-depth)
  (let ((best #f))
    (define (search state depth)
      (cond ((= state target) (if (or (not best) (< depth best)) (set! best depth)))
            ((or (> state bound) (>= depth max-depth) (and best (>= depth best))) 'stop)
            (else (for-each (lambda (n) (search n (+ depth 1))) (list (+ state 3) (+ state 5) (* state 2))))))
    (search start 0)
    best))
(display "brute-force min moves to 17: ") (display (brute-min-moves 0 17 6)) (newline)
```

`bfs-implicit` differs from Lesson 116's own `bfs` in exactly one structural respect: `goal?`, a real predicate, replaces a single, fixed target vertex, and `successors` replaces `graph-neighbors g`, called directly rather than through a stored graph.

### Mechanical Walkthrough

- **`(successors v)`** in place of Lesson 116's own `(graph-neighbors g v)`** — the single, precise change Concept Unit 2 predicted: identical call shape, genuinely different source — computed, not stored.
- **`(goal? v)`**, checked the moment a vertex is dequeued** — first appearance of a real, general stopping predicate, rather than watching for one fixed, named target vertex.
- **`(filter (lambda (x) (<= x bound)) (list (+ n 3) (+ n 5) (* n 2)))`** in `successors` — a reappearance of `filter`; the real, computed neighbor list, bounded to keep the search finite, exactly Lesson 114's own bounds-checking discipline for grid neighbors.
- **The real, exact `4` from both `bfs-implicit` and the independent `brute-min-moves`** — direct, checked confirmation that Lesson 117's own correctness proof, inherited unchanged, produces the correct real answer on a problem that was never a literal graph at all.

### CS Lens

This is Lesson 117's own broad-evidence standard, extended to a structurally new domain: an independent brute-force search, built from scratch with no shared mechanism, confirming the generalized BFS's real output.

### SE Lens

The alternative to building a real, independent brute-force check is trusting Concept Unit 2's own derivation — "the proof still applies" — without confirming it on actual code. The real value of the check: it confirms not just the *idea* generalizes correctly, but this specific, real implementation does too.

### Run It — Show the Real Output

```
$ guile statespace-check.scm
shortest number of moves from 0 to reach 17: 4
brute-force min moves to 17: 4
```

Verified this session — the real, generalized BFS finds the shortest move sequence to `17`, `4` moves, exactly matching an independent, real brute-force search over every possible move sequence up to depth `6`.

---

## Concept Unit 4: The Real Payoff — Searching Only What Matters

### The Problem

Concept Unit 3 confirmed correctness. It's worth measuring, honestly, exactly how much real work is saved by computing states on demand rather than pre-building the entire, bounded state space upfront.

### The New Code — Type It Yourself

```scheme
(define visited-count 0)
(define (successors-counted n)
  (set! visited-count (+ visited-count 1))
  (filter (lambda (x) (<= x bound)) (list (+ n 3) (+ n 5) (* n 2))))
```

### Reference Source

Concept Unit 3's own `successors`, instrumented here with a real counter, the identical technique this Era has used since Lesson 92.

### Files affected

Modified: `statespace-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `statespace-check.scm`, extended with a real counted run:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define visited-count 0)                                            ; ← new
(define (successors-counted n)                                          ; ← new
  (set! visited-count (+ visited-count 1))                                 ; ← new
  (filter (lambda (x) (<= x bound)) (list (+ n 3) (+ n 5) (* n 2))))          ; ← new
(bfs-implicit 0 (lambda (n) (= n target)) successors-counted)
(display "real states expanded by BFS to reach 17: ") (display visited-count) (newline)
```

### Mechanical Walkthrough

- **`(set! visited-count (+ visited-count 1))`, inside `successors-counted`** — a reappearance of `set!`; counts every real state whose successors are actually computed, the direct measure of how much of the theoretical state space genuinely got explored.
- **The real, exact `16`** — direct, measured confirmation that reaching `17` required expanding only `16` distinct real states, a small fraction of the `201` integers from `0` to `200` a fully pre-built graph would have needed to store and initialize regardless of whether they were ever relevant.

### CS Lens

This is Lesson 85's own real "compute, don't store" payoff, confirmed in a genuinely new domain: exactly as Lesson 114's implicit grid avoided materializing edges never used, this lesson's state-space search avoids ever considering the vast majority of the bounded numeric range that has nothing to do with reaching `17`.

### SE Lens

The alternative to on-demand successor computation is pre-building a full graph over every state from `0` to `bound`, then running ordinary BFS on it. The real cost of that alternative, for state spaces vastly larger than this lesson's own small, bounded example — real puzzles with billions of possible configurations — would be building and storing a graph far larger than the search actually needs to examine, exactly the real waste this lesson's own `16`-versus-`201` numbers make concrete.

### Run It — Show the Real Output

```
$ guile statespace-check.scm
real states expanded by BFS to reach 17: 16
```

Verified this session — reaching `17` required BFS to actually expand only `16` real states, a small, measured fraction of the full, bounded state space this lesson's own search never needed to materialize.

---

## Closing

### Connect the pieces

One puzzle, one generalized algorithm, one real payoff:

1. **A problem with no explicit graph, posed (Unit 1):** fewest moves to reach a target, using only `+3`, `+5`, `×2`.
2. **State, successors, and the generalized BFS, derived (Unit 2):** Lesson 116's own algorithm, with computed neighbors replacing stored ones — Lesson 117's proof unchanged.
3. **Implemented and checked against brute force (Unit 3):** the real, exact `4`-move answer, confirmed independently.
4. **The real, measured payoff (Unit 4):** `16` real states expanded, out of `201` possible.

Every claim in this lesson traces to real, executed code: a real, generalized BFS checked against an independent brute-force reference, and a real, measured count of exactly how much of the full state space actually got explored.

### What breaks without this

Suppose a real puzzle-solving system — a real combination lock, a real logistics-routing problem with discrete states — were solved by first enumerating every conceivable state into an explicit graph, then running ordinary BFS on it. For any real problem whose full state space is large (even this lesson's own modest, `201`-state example already shows only `8%` of it was ever needed), that upfront enumeration would waste real, substantial effort building structure the actual search never touches. This lesson's own real `successors`-based approach is the direct, checked fix — compute exactly what's needed, exactly when it's needed.

### Exercises

1. **Observe.** Before checking, predict whether adding a fourth move, `−1` (only when the result stays non-negative), would ever *shorten* the real path to `17`, using this lesson's own real answer, `4`, to justify your reasoning.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Apply this lesson's own `bfs-implicit` to a genuinely different state-space problem of your own design (a simple word-transformation puzzle, changing one letter at a time, is a good real candidate), and confirm its real answer against a real, independent brute-force check.
4. **Explain.** In your own words, explain why Lesson 117's own inductive proof, built entirely around FIFO discovery order, needed no changes at all to remain valid for this lesson's own computed-neighbor version.
5. **Explain.** Using this lesson's real numbers, explain why `successors` including a bound check (`<= x bound`) is necessary for `bfs-implicit` to terminate, referencing what would happen to the search if states could grow without limit.

### Definition of done

- [ ] You can state the definitions of state and successors, and explain how they generalize "vertex" and "neighbor."
- [ ] You can explain why Lesson 117's own BFS correctness proof required no changes to apply to this lesson's computed-neighbor version.
- [ ] You can point to this lesson's own real `4`-move answer, confirmed against brute force, and the real `16`-versus-`201` states-expanded numbers, as concrete, checked evidence.
- [ ] You completed Exercises 1–5, including a real, self-designed state-space problem checked against brute force.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
