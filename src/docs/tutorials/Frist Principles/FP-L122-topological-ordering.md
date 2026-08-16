# Lesson 122: Topological Ordering

**What you will build:** **topological ordering** — a real, complete task order respecting every dependency at once — derived directly from Lesson 119's own finish times, and checked against the exact graph Lesson 113 opened this whole Era with. Real, verified evidence this session: sorting Lesson 113's own five-task morning routine by *decreasing* DFS finish time produces `wake, shower, dress, breakfast, leave` — the real, intuitively correct order — and a direct, exhaustive check confirms every single one of the graph's five real edges is respected: every dependency's source appears before its destination. Attempting the identical procedure on a graph containing a real cycle is caught and refused before any order is even computed, using Lesson 121's own `has-cycle?` directly. The transferable point: Lesson 119 built finish times without yet using them for anything beyond confirming the parenthesis property; this lesson is the real reason they matter — a single number per vertex that, sorted, directly answers a real scheduling question Lesson 113 posed and left open five lessons ago.

**What you need to know first:** Lesson 113 (`FP-L113-from-relations-to-graphs.md`) — specifically the `morning` dependency graph itself, reused here unchanged as this lesson's own real, checked example. Lesson 119 (`FP-L119-dfs-state.md`) — specifically finish times, the exact machinery this lesson repurposes. Lesson 121 (`FP-L121-cycles.md`) — specifically `has-cycle?`, used here as a real precondition check.

**Terms introduced in this lesson**

- **Topological order(ing)** — an arrangement of a DAG's vertices such that, for every edge `u → v`, `u` appears before `v`. It exists to give a precise, checkable meaning to "a valid order to do these tasks in," given only their pairwise dependencies.

**Objects and methods used**

- **`sort`**
  - *What it is:* a real Guile procedure sorting a list according to a given comparison procedure.
  - *Implementation:* takes a list and a `<`-shaped predicate, returns a newly ordered list; reappearing from Lesson 79, used here as `(sort (finish-times g) (lambda (a b) (> (cdr a) (cdr b))))`.
  - *Its use:* the entire algorithm, reduced to one call — sorting vertices by finish time, decreasing.

---

## Concept Unit 1: A Real Question Left Open Since Lesson 113

### The Problem

Lesson 113's own real, motivating example — `wake→shower`, `wake→dress`, `shower→dress`, `dress→breakfast`, `breakfast→leave` — poses an obvious real question that lesson never answered: given only these dependencies, what's a valid *complete order* to actually do all five tasks in? Lesson 121 established that this question only has an answer at all if the dependency graph is a DAG — a real cycle (task `A` depending, even indirectly, on itself) would make no valid order possible.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, reopening Lesson 113's own real example.

### Reference Source

Lesson 113's own `morning` graph (`FP-L113-from-relations-to-graphs.md`, Concept Unit 3), quoted here unchanged as this lesson's own real, checked example.

### Files affected

None — no new code in this unit; the question is posed against Lesson 113's own already-built graph.

### Change type

None.

### Dependencies

None.

### Applying It — What a Real Answer Needs to Guarantee

A real answer needs to be a single, complete ordering of every vertex such that, checked against *every* edge in the graph simultaneously, the source always comes before the destination — not merely for one edge in isolation, but for all of them at once.

### Walkthrough

- **Lesson 113's own real graph, reopened rather than reinvented** — a direct, satisfying callback, not a fresh example.
- **"all of them at once"** — the precise standard Concept Unit 3's own real check confirms exhaustively.

### CS Lens

This is Lesson 84's own "name the real question precisely before building anything" discipline, applied here across an entire Era boundary: the question was posed informally in Lesson 113, left unanswered deliberately, and only now — with Lesson 119's finish times and Lesson 121's cycle check both in hand — does this curriculum have the real tools to answer it.

### SE Lens

The alternative to deriving a real algorithm is manually reasoning out a valid order by hand for small examples, the way a person naturally would for five morning tasks. The real cost of that alternative: it doesn't scale to Concept Unit 4's own `7`-task build-dependency graph, let alone a real system with thousands of real dependencies — exactly why a general, checkable algorithm is worth deriving.

---

## Concept Unit 2: Deriving the Order From Finish Times

### The Problem

Concept Unit 1 named the requirement. It needs a real, derived algorithm — and it's worth noticing that Lesson 119 already computed something directly useful, without yet saying why.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building directly on Lesson 119's own already-established finish times.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Why Decreasing Finish Time Works

**The claim:** sorting every vertex by *decreasing* DFS finish time produces a valid topological order.

**The argument, for any edge `u → v`:** when DFS first examines the edge `u → v`, exactly one of two things is true about `v`. Either `v` is white — in which case DFS recurses into `v` immediately, and since `v`'s entire subtree, including `v` itself, must finish before control returns to `u`, `v` finishes strictly before `u` does. Or `v` is already black — meaning `v` finished at some earlier point, necessarily before `u`'s own exploration of this edge, which is itself before `u` finishes. (`v` cannot be gray when this edge is examined — that would mean a back edge, and Concept Unit 1 already established the graph is a DAG, so no back edges exist at all.) Either way, `v` always finishes strictly before `u` — so sorting by *decreasing* finish time always places `u` before `v`, for every real edge, simultaneously.

### Walkthrough

- **The two-case argument, white versus black, with gray explicitly ruled out by the DAG precondition** — a real, complete proof, not an assertion.
- **"for every real edge, simultaneously"** — the exact standard Concept Unit 1 required, now shown to follow from a single, uniform sorting rule.

### CS Lens

This is Lesson 43's own case-based proof technique, applied to a genuinely new claim: rather than proving a property holds for one input, this argument shows a *sorting rule*, applied once, satisfies every one of a graph's edges at once — a real, general algorithm derived from a real, general argument.

### SE Lens

The alternative to reusing Lesson 119's own finish times is building a separate, dedicated topological-sort algorithm from scratch. The real value of reusing them: this lesson's entire algorithm reduces to a single `sort` call over data Lesson 119 already knew how to compute — real evidence that naming and computing the right intermediate quantity (finish time) once pays off in a later lesson never anticipated when it was first derived.

---

## Concept Unit 3: Implementing and Verifying Topological Sort

### The Problem

Concept Unit 2 derived the algorithm. It needs real code, and a real, exhaustive check against Lesson 113's own graph — every edge, not a sample.

### The New Code — Type It Yourself

```scheme
(define (topo-sort g)
  (if (has-cycle? g)
      'error-graph-has-a-cycle
      (begin (set! time 0)
             (map car (sort (finish-times g) (lambda (a b) (> (cdr a) (cdr b))))))))
```

### Reference Source

Lesson 121's own `has-cycle?` (`FP-L121-cycles.md`, Concept Unit 3), quoted here unchanged as this lesson's own precondition check; Lesson 119's own finish-time computation (`FP-L119-dfs-state.md`, Concept Unit 3), reused directly, adapted here to return only finish times.

### Files affected

Created: `toposort-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `toposort-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-vertices g) (car g))
(define (graph-edges g) (cdr g))
(define (graph-neighbors g a) (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define (has-cycle? g)
  (let ((color (list)))
    (define (get-color v) (let ((r (assoc v color))) (if r (cdr r) 'white)))
    (define found #f)
    (define (visit v)
      (set! color (cons (cons v 'gray) color))
      (for-each (lambda (n) (let ((c (get-color n)))
                              (cond ((eq? c 'white) (visit n)) ((eq? c 'gray) (set! found #t)) (else 'nothing))))
                (graph-neighbors g v))
      (set! color (cons (cons v 'black) color)))
    (for-each (lambda (v) (if (eq? (get-color v) 'white) (visit v))) (graph-vertices g))
    found))

(define time 0)                                                     ; ← new
(define (finish-times g)                                               ; ← new
  (let ((color (list)) (fin '()))                                         ; ← new
    (define (get-color v) (let ((r (assoc v color))) (if r (cdr r) 'white))) ; ← new
    (define (visit v)                                                          ; ← new
      (set! color (cons (cons v 'gray) color))                                    ; ← new
      (for-each (lambda (n) (if (eq? (get-color n) 'white) (visit n))) (graph-neighbors g v)) ; ← new
      (set! color (cons (cons v 'black) color))                                                  ; ← new
      (set! time (+ time 1)) (set! fin (cons (cons v time) fin)))                                   ; ← new
    (for-each (lambda (v) (if (eq? (get-color v) 'white) (visit v))) (graph-vertices g))               ; ← new
    fin))                                                                                                 ; ← new

(define (topo-sort g)                                                  ; ← new
  (if (has-cycle? g)                                                      ; ← new
      'error-graph-has-a-cycle                                               ; ← new
      (begin (set! time 0)                                                      ; ← new
             (map car (sort (finish-times g) (lambda (a b) (> (cdr a) (cdr b))))))))  ; ← new

(define morning (make-graph '(wake shower dress breakfast leave)
                             (list (cons 'wake 'shower) (cons 'wake 'dress) (cons 'shower 'dress)
                                   (cons 'dress 'breakfast) (cons 'breakfast 'leave))))
(define order (topo-sort morning))
(display "topological order: ") (display order) (newline)

(define (before? u v order) (> (length (member u order)) (length (member v order))))
(define all-ok #t)
(for-each (lambda (e) (if (not (before? (car e) (cdr e) order)) (set! all-ok #f))) (graph-edges morning))
(display "every edge respected in the computed order? ") (display all-ok) (newline)

(define gcyc (make-graph '(A B C) (list (cons 'A 'B) (cons 'B 'C) (cons 'C 'A))))
(display "topo-sort on a cyclic graph: ") (display (topo-sort gcyc)) (newline)
```

`topo-sort` checks `has-cycle?` first, refusing to proceed at all if the graph isn't a DAG — Concept Unit 1's own precondition, enforced directly rather than silently producing a meaningless result. `finish-times` is Lesson 119's own colored DFS, stripped down to record only the one quantity this lesson needs.

### Mechanical Walkthrough

- **`(if (has-cycle? g) 'error-graph-has-a-cycle ...)`** — a reappearance of `if`, `has-cycle?`; the entire correctness of Concept Unit 2's argument depends on the graph being a DAG (no gray-vertex case to worry about), so this check isn't optional defensive code — it's the argument's own stated precondition, enforced.
- **`(sort (finish-times g) (lambda (a b) (> (cdr a) (cdr b))))`** — a reappearance of `sort`; the literal execution of Concept Unit 2's own claim, decreasing finish time, nothing more.
- **`(map car ...)`** — a reappearance of `map`; discards the finish-time numbers themselves once they've done their job ordering the vertices, keeping only the vertex order the real question actually asked for.
- **`(> (length (member u order)) (length (member v order)))`** in `before?` — a reappearance of `member`, `length`; a real position-comparison built from a list's own suffix length, checked for every real edge in Concept Unit 3's own verification loop.
- **The real, exact order `(wake shower dress breakfast leave)`, and the real, exact `#t` confirming every one of the five edges is respected** — direct, checked confirmation of Concept Unit 2's proof, on the identical graph Lesson 113 first posed this question about.

### CS Lens

This is Lesson 22's own evidence discipline, closing a real loop across nine lessons: a question posed informally in Lesson 113, machinery built for an unrelated-seeming purpose in Lesson 119, a precondition established in Lesson 121, and a real, checked answer here — none of it planned as one unit in advance, all of it composing correctly because each piece was built precisely.

### SE Lens

The alternative to checking `has-cycle?` first is running `finish-times` regardless and returning whatever order results. The real cost of that alternative: Concept Unit 2's own proof simply doesn't hold without the DAG precondition — a "topological order" computed from a cyclic graph would be a real, computed list that satisfies no actual guarantee, silently misleading anything trusting it.

### Run It — Show the Real Output

```
$ guile toposort-check.scm
topological order: (wake shower dress breakfast leave)
every edge respected in the computed order? #t
topo-sort on a cyclic graph: error-graph-has-a-cycle
```

Verified this session — the real, computed topological order for Lesson 113's own morning routine, `(wake shower dress breakfast leave)`, is exactly the intuitively correct real-world order, and a real, exhaustive check confirms every one of the graph's five edges is respected. On a genuinely cyclic graph, `topo-sort` correctly refuses rather than returning a meaningless order.

---

## Concept Unit 4: A Larger, Real Dependency Graph

### The Problem

Concept Unit 3 confirmed correctness on a five-task example. It's worth checking on a real graph with genuine parallel structure — multiple independent paths converging, the way a real build system's dependencies actually look.

### The New Code — Type It Yourself

```scheme
(define build (make-graph '(compile-a compile-b compile-c link test-a test-b package)
                           (list (cons 'compile-a 'link) (cons 'compile-b 'link) (cons 'compile-c 'link)
                                 (cons 'link 'test-a) (cons 'link 'test-b)
                                 (cons 'test-a 'package) (cons 'test-b 'package))))
```

### Reference Source

No reference counterpart — a from-scratch, realistically-shaped build-dependency graph, chosen specifically because it converges (three independent compiles feeding one link step) — the real shape Lesson 121's own diamond example warned matters.

### Files affected

Modified: `toposort-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `toposort-check.scm`, extended with a real, `7`-vertex build-dependency graph:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define build (make-graph '(compile-a compile-b compile-c link test-a test-b package)     ; ← new
                           (list (cons 'compile-a 'link) (cons 'compile-b 'link) (cons 'compile-c 'link) ; ← new
                                 (cons 'link 'test-a) (cons 'link 'test-b)                                  ; ← new
                                 (cons 'test-a 'package) (cons 'test-b 'package))))                            ; ← new
(define border (topo-sort build))
(display "build order: ") (display border) (newline)
(define ball-ok #t)
(for-each (lambda (e) (if (not (before? (car e) (cdr e) border)) (set! ball-ok #f))) (graph-edges build))
(display "build order respects every dependency? ") (display ball-ok) (newline)
```

### Mechanical Walkthrough

- **Three independent `compile-*` vertices, all feeding into `link`** — deliberately mirrors Lesson 121's own diamond shape, at a real, slightly larger scale — the exact structure that would trip up any implementation conflating "already visited" with "cycle."
- **The real, exact `#t` confirming all seven of the build graph's real edges are respected** — direct, checked confirmation that Concept Unit 2's proof holds on a graph shape genuinely different from Lesson 113's own simple chain-with-one-branch.

### CS Lens

This is Lesson 117's own "one example is evidence, not proof" standard, applied here in miniature: a second, structurally different real graph, checked with the identical exhaustive standard as the first, strengthens confidence beyond what one example alone could.

### SE Lens

The alternative to testing a second, differently-shaped graph is trusting that Lesson 113's own simple, mostly-linear example generalizes. The real value of the build-dependency graph specifically: its real convergence (three compiles into one link step) is exactly the shape most likely to expose a bug that a simpler, non-converging graph would never trigger.

### Run It — Show the Real Output

```
$ guile toposort-check.scm
build order: (compile-c compile-b compile-a link test-b test-a package)
build order respects every dependency? #t
```

Verified this session — the real, computed build order correctly places all three `compile-*` steps before `link`, both `test-*` steps after `link` and before `package`, and `package` last — a real, exhaustively checked valid order for a graph shape genuinely different from, and more structurally demanding than, Lesson 113's own original example.

---

## Closing

### Connect the pieces

One graph reopened, one new one built, one algorithm connecting three earlier lessons:

1. **The question, reopened (Unit 1):** Lesson 113's own dependencies, still without a real, complete order.
2. **The algorithm, derived (Unit 2):** decreasing finish time — a real, two-case proof that every edge is respected at once.
3. **Implemented and exhaustively checked (Unit 3):** the exact, intuitive order for Lesson 113's own graph, every edge confirmed, cyclic input correctly refused.
4. **Checked on a genuinely different, converging shape (Unit 4):** a real `7`-task build graph, every dependency respected.

Every claim in this lesson traces to real, executed code: an exhaustive per-edge check on two structurally different real graphs, and a real, enforced precondition refusing invalid input.

### What breaks without this

Suppose a real build system computed a task order without checking for cycles first, the way `topo-sort` deliberately refuses to. A genuinely circular dependency — module `A` requiring module `B` requiring module `A` — would produce *some* order from a naive finish-time sort, one satisfying no actual guarantee, silently different depending on which vertex the traversal happened to start from. This lesson's own explicit `has-cycle?` check, run first, is what turns a real, structural impossibility into a caught, reported error instead of a silently wrong build order.

### Exercises

1. **Observe.** Before checking, predict whether a topological order is always unique for a given DAG, using Lesson 122's own `build` graph (where `test-a` and `test-b` have no dependency on each other) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — check whether swapping the order `compile-a`, `compile-b`, and `compile-c` are visited in changes the real computed order at all.
3. **Formalize.** Add a real edge to `build` that would create a cycle (`package → compile-a`, for instance), and confirm `topo-sort` correctly refuses it.
4. **Explain.** In your own words, explain why Concept Unit 2's argument specifically rules out the gray case for `v`, referencing what a gray `v` at that point would actually mean.
5. **Explain.** Using this lesson's real numbers, explain why testing on Lesson 113's own simple graph alone would not have been sufficient evidence, referencing what specific structural feature of the `build` graph a simpler test could miss.

### Definition of done

- [ ] You can state what a topological order guarantees, precisely, in terms of edges.
- [ ] You can walk through Concept Unit 2's two-case argument (white `v`, black `v`) and explain why gray is impossible for a DAG.
- [ ] You can explain why `topo-sort` checks `has-cycle?` first, and what would go wrong if it didn't.
- [ ] You completed Exercises 1–5, including a real, constructed cycle that `topo-sort` correctly refuses.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
