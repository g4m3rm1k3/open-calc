# Lesson 121: Cycles

**What you will build:** a real, correct `has-cycle?`, built directly on Lesson 119's gray/black distinction — and real, direct proof that the naive alternative (treating any "already visited" vertex as a cycle) is genuinely wrong, not just theoretically imprecise. Real, verified evidence this session: a real "diamond" graph (`A→B`, `A→C`, `B→D`, `C→D`) — two paths converging on `D`, with no cycle anywhere — is correctly identified as acyclic by this lesson's real `has-cycle?`, exactly because `D` is black, not gray, the second time it's reached. A disconnected graph, with a real cycle hidden in a component the traversal doesn't start in, is still correctly detected — real, working evidence that a single DFS call from one vertex isn't enough. Across `30` real, randomly generated graphs, `has-cycle?` matches an independent, brute-force reference exactly, every time. The transferable point: Lesson 119 built gray/black coloring without yet putting it to real use; this lesson is that use — and the diamond graph is real, concrete proof that the distinction wasn't optional precision, it was the difference between a correct and an incorrect answer.

**What you need to know first:** Lesson 119 (`FP-L119-dfs-state.md`) — specifically the white/gray/black coloring and back-edge definition, reused and put to direct, real use for the first time. Lesson 120 (`FP-L120-connected-components.md`) — specifically visiting every vertex, not just one, to handle disconnected graphs correctly.

**Terms introduced in this lesson**

- **Cycle** — a real path that starts and ends at the identical vertex, using at least one edge. It exists to name, precisely, what a back edge (Lesson 119) is direct evidence of.
- **DAG (Directed Acyclic Graph)** — a directed graph containing no cycles at all. It exists to name the specific structural property Lesson 122's upcoming topological ordering depends on.

**Objects and methods used**

No new objects or methods this lesson — every procedure reappears from Lesson 119/120 unchanged.

---

## Concept Unit 1: Why "Already Visited" Is the Wrong Test

### The Problem

A tempting, simpler cycle check: if DFS ever reaches an already-visited vertex, report a cycle. Lesson 120's own connected-components work already produced a real counterexample to this idea without naming it: two separate paths converging on the identical vertex (as in a real "diamond" shape, `A→B`, `A→C`, `B→D`, `C→D`) makes `D` "already visited" the second time it's reached — with no cycle anywhere in the graph at all.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, extending Lesson 119 and 120's own already-established distinction.

### Reference Source

No reference counterpart — the motivating problem draws on Lesson 119's own gray/black distinction, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — The Real Fix Was Already Built

Lesson 119 derived exactly the distinction this problem needs: gray (still actively on the current path) versus black (fully finished, no longer active). A cycle requires reaching back to something still gray — reaching an already-black vertex, as the diamond example does, means two separate, non-overlapping paths happened to lead to the identical place, not that either path looped back on itself.

### Walkthrough

- **The diamond graph, named concretely, with no cycle anywhere in it** — real, checkable proof the naive test is genuinely wrong, not merely imprecise.
- **"the real fix was already built"** — signals this lesson mostly assembles Lesson 119's own machinery for a real, direct purpose, rather than deriving something new from scratch.

### CS Lens

This is Lesson 98's own "a plausible-sounding check can still be wrong" lesson, encountered concretely a second time: "already visited" *sounds* like it should mean "a cycle," and only a real, constructed counterexample — not intuition — settles that it doesn't.

### SE Lens

The alternative to using gray/black specifically is implementing the naive, visited-only check, since it's simpler code. The real, demonstrated cost of that shortcut: a real system checking for circular dependencies (module `A` depending on module `B` depending on module `A`) using the naive check would report false cycles on any dependency diamond — two modules both depending on one common, shared third module — a completely ordinary, legitimate real structure.

---

## Concept Unit 2: Cycle and DAG, Defined via Back Edges

### The Problem

Concept Unit 1 established the need for gray/black specifically. It needs a precise definition connecting "cycle" directly to Lesson 119's own back-edge vocabulary.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below, and Concept Unit 3 implements and checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation connecting directly to Lesson 119's own already-established vocabulary.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Cycle Exists If and Only If a Back Edge Exists

**Cycle, precisely:** a real path `v₁ → v₂ → ... → vₖ → v₁`, using at least one real edge. **The claim:** a directed graph contains a cycle if and only if a DFS over it (Lesson 119's own coloring) finds at least one back edge. **Why "if":** a back edge `v → u`, where `u` is gray, means `u` is an ancestor of `v` on the current DFS path — a real path from `u` down to `v` already exists (the path DFS took to reach `v`), and the back edge itself closes it into a cycle. **Why "only if":** any real cycle, followed by DFS, must eventually reach a vertex already on the current path (since the cycle returns to its own start) — and a vertex on the current path is, by definition, gray.

**DAG, precisely:** a directed graph with zero cycles — equivalently, by the claim above, a directed graph whose DFS finds zero back edges, over every vertex, including ones in separate, disconnected pieces.

### Walkthrough

- **Both directions of "if and only if" argued separately** — a real proof, not just a plausible-sounding restatement.
- **DAG defined via "zero back edges," not independently** — keeps the definition directly checkable by the identical mechanism, rather than a separate, new check.

### CS Lens

This is Lesson 43's own "prove both directions separately" discipline for an if-and-only-if claim, applied here to connect a purely structural property (a path returning to its start) to an algorithmic one (a back edge found during a specific traversal) — two different-looking claims, shown to be exactly equivalent.

### SE Lens

The alternative to proving both directions is trusting the "if" direction (a back edge implies a cycle) and assuming the converse holds too, without checking. The real risk: an algorithm reporting "no back edge found" would only be trustworthy as "no cycle exists" if the *converse* genuinely holds — exactly what the second half of Concept Unit 2's argument establishes.

---

## Concept Unit 3: Implementing and Verifying `has-cycle?`

### The Problem

Concept Unit 2 established the equivalence. It needs real code — one that correctly handles disconnected graphs (Lesson 120's own concern) and correctly distinguishes convergence from a real cycle (Concept Unit 1's own concern) — checked against exactly the cases most likely to expose a bug.

### The New Code — Type It Yourself

```scheme
(define (has-cycle? g)
  (let ((color (list)))
    (define (get-color v) (let ((r (assoc v color))) (if r (cdr r) 'white)))
    (define found #f)
    (define (visit v)
      (set! color (cons (cons v 'gray) color))
      (for-each (lambda (n)
                  (let ((c (get-color n)))
                    (cond ((eq? c 'white) (visit n))
                          ((eq? c 'gray) (set! found #t))
                          (else 'nothing))))
                (graph-neighbors g v))
      (set! color (cons (cons v 'black) color)))
    (for-each (lambda (v) (if (eq? (get-color v) 'white) (visit v))) (graph-vertices g))
    found))
```

### Reference Source

Lesson 119's own colored DFS (`FP-L119-dfs-state.md`, Concept Unit 3), adapted here into a direct boolean check, extended with Lesson 120's own "visit every vertex, not just one" discipline to correctly handle disconnected graphs.

### Files affected

Created: `cycles-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `cycles-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-vertices g) (car g))
(define (graph-edges g) (cdr g))
(define (graph-neighbors g a) (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define (has-cycle? g)                                              ; ← new
  (let ((color (list)))                                                ; ← new
    (define (get-color v) (let ((r (assoc v color))) (if r (cdr r) 'white))) ; ← new
    (define found #f)                                                          ; ← new
    (define (visit v)                                                             ; ← new
      (set! color (cons (cons v 'gray) color))                                       ; ← new
      (for-each (lambda (n)                                                             ; ← new
                  (let ((c (get-color n)))                                                 ; ← new
                    (cond ((eq? c 'white) (visit n))                                          ; ← new
                          ((eq? c 'gray) (set! found #t))                                        ; ← new
                          (else 'nothing))))                                                        ; ← new
                (graph-neighbors g v))                                                                 ; ← new
      (set! color (cons (cons v 'black) color)))                                                          ; ← new
    (for-each (lambda (v) (if (eq? (get-color v) 'white) (visit v))) (graph-vertices g))                      ; ← new
    found))                                                                                                       ; ← new

(define gcyc (make-graph '(A B C D) (list (cons 'A 'B) (cons 'B 'C) (cons 'C 'A) (cons 'C 'D))))
(define gacyc (make-graph '(A B C D) (list (cons 'A 'B) (cons 'B 'C) (cons 'C 'D))))
(display "gcyc has-cycle? ") (display (has-cycle? gcyc)) (newline)
(display "gacyc has-cycle? ") (display (has-cycle? gacyc)) (newline)

(define gdis (make-graph '(A B X Y Z) (list (cons 'A 'B) (cons 'X 'Y) (cons 'Y 'Z) (cons 'Z 'X))))
(display "disconnected graph (cycle only in X-Y-Z) has-cycle? ") (display (has-cycle? gdis)) (newline)

(define gdiamond (make-graph '(A B C D) (list (cons 'A 'B) (cons 'A 'C) (cons 'B 'D) (cons 'C 'D))))
(display "diamond DAG (converging paths, no cycle) has-cycle? ") (display (has-cycle? gdiamond)) (newline)
```

`get-color` defaults any vertex not yet in `color` to `'white`, exactly Lesson 119's own convention. The outer `for-each` visits every vertex still white — not just the first one — the direct fix for Lesson 120's own disconnected-graph concern: a graph's cycle might live entirely in a component the first vertex never reaches.

### Mechanical Walkthrough

- **`(for-each (lambda (v) (if (eq? (get-color v) 'white) (visit v))) (graph-vertices g))`** — a reappearance of `for-each`, `eq?`; the specific fix ensuring every component gets its own DFS start, not only the first vertex's.
- **`((eq? c 'gray) (set! found #t))`** — a reappearance of `eq?`, `set!`; the literal execution of Concept Unit 2's own claim — a back edge, and only a back edge, sets `found`.
- **`((eq? c 'white) (visit n))`** versus the implicit black case (`else 'nothing`)** — a hard concept reappearing (Lesson 119's own coloring), restated: white triggers real, further exploration; black — Concept Unit 1's own diamond case — triggers nothing at all.
- **The real, exact `#t` for `gcyc` and the disconnected graph, and the real, exact `#f` for both `gacyc` and the diamond graph** — direct, checked confirmation of exactly the distinction Concept Unit 1 argued matters: convergence (diamond) correctly reported as no cycle, a genuine cycle in an unreached component correctly still found.

### CS Lens

This is Lesson 120's own "visit every vertex, not just the first" discipline, reapplied here for a genuinely different reason: Lesson 120 needed it to find every *component*; this lesson needs it because a cycle can hide in any one of them, and a single DFS call from one vertex provides no guarantee about vertices it never reaches at all.

### SE Lens

The alternative to testing the diamond graph specifically is testing only genuinely cyclic and genuinely acyclic-with-no-convergence graphs. The real value of the diamond test: it's the one case that would silently pass a naive, visited-only implementation while correctly failing this lesson's own real, gray-based one — exactly the case worth testing on purpose, not the case most likely to be tried by accident.

### Run It — Show the Real Output

```
$ guile cycles-check.scm
gcyc has-cycle? #t
gacyc has-cycle? #f
disconnected graph (cycle only in X-Y-Z) has-cycle? #t
diamond DAG (converging paths, no cycle) has-cycle? #f
```

Verified this session — real cycles are correctly found, including one hidden in a disconnected component; the real diamond graph, despite `D` being visited twice, is correctly reported as acyclic — direct, checked confirmation that gray-versus-black, not mere visitation, is what actually distinguishes a cycle from convergence.

---

## Concept Unit 4: A Real, Broad Stress Test

### The Problem

Concept Unit 3 confirmed correctness on a handful of deliberately chosen cases. It's worth checking `has-cycle?` against a genuinely independent reference across many random graphs, the same broad-evidence standard Lesson 117 applied to BFS.

### The New Code — Type It Yourself

```scheme
(define (has-cycle-bruteforce? g)
  (define found #f)
  (define (dfs-path v path)
    (for-each (lambda (n)
                (if (member n path) (set! found #t)
                    (dfs-path n (cons n path))))
              (graph-neighbors g v)))
  (for-each (lambda (v) (dfs-path v (list v))) (graph-vertices g))
  found)
```

### Reference Source

No reference counterpart — an independent, deliberately different-mechanism reference: instead of coloring, `has-cycle-bruteforce?` tracks the real, explicit current path as a list, checking direct membership at every step.

### Files affected

Modified: `cycles-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `cycles-check.scm`, extended with a real, `30`-trial stress test:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define (has-cycle-bruteforce? g)                                   ; ← new
  (define found #f)                                                    ; ← new
  (define (dfs-path v path)                                               ; ← new
    (for-each (lambda (n)                                                    ; ← new
                (if (member n path) (set! found #t)                             ; ← new
                    (dfs-path n (cons n path))))                                   ; ← new
              (graph-neighbors g v)))                                                 ; ← new
  (for-each (lambda (v) (dfs-path v (list v))) (graph-vertices g))                        ; ← new
  found)                                                                                     ; ← new

(define (random-graph n edge-prob)
  (let ((vs (iota n)))
    (make-graph vs
                (apply append (map (lambda (a) (filter (lambda (x) x)
                                                         (map (lambda (b) (if (and (not (= a b)) (< (random 100) edge-prob)) (cons a b) #f)) vs))) vs)))))

(define all-match #t)
(for-each (lambda (trial)
            (define g (random-graph 8 20))
            (if (not (eq? (if (has-cycle? g) #t #f) (if (has-cycle-bruteforce? g) #t #f)))
                (begin (set! all-match #f) (display "MISMATCH trial ") (display trial) (newline))))
          (iota 30))
(display "30 random 8-vertex graphs, has-cycle? matches brute force? ") (display all-match) (newline)
```

`has-cycle-bruteforce?` re-derives cycle detection from first principles — tracking the literal, current path as an explicit list and checking real membership — deliberately not reusing Lesson 119's coloring mechanism at all, so a bug shared between the two would be a genuine coincidence, not a shared blind spot.

### Mechanical Walkthrough

- **`(if (member n path) (set! found #t) (dfs-path n (cons n path)))`** — a reappearance of `member`, `cons`; checks the *explicit* current path directly, a real, independent stand-in for Lesson 119's own gray check.
- **The real, exact agreement across all `30` random trials** — direct, checked confirmation that `has-cycle?` and a structurally unrelated reference implementation agree on graph shapes never specifically hand-picked, the identical broad-evidence standard Lesson 117 established for BFS.

### CS Lens

This is Lesson 117's own independent-reference discipline, applied a second time in this Era: correctness checked not against a second copy of the same mechanism, but against a genuinely different one, so a design-level bug — not just a typo — would have to occur identically in both to slip through undetected.

### SE Lens

The alternative to a broad, randomized stress test is trusting Concept Unit 3's own hand-picked cases (cyclic, acyclic, disconnected, diamond) as sufficient. The real value of the additional `30`-trial check: hand-picked cases are chosen specifically because the author already suspects they matter — a randomized check can surface a real failure mode nobody thought to construct on purpose.

### Run It — Show the Real Output

```
$ guile cycles-check.scm
30 random 8-vertex graphs, has-cycle? matches brute force? #t
```

Verified this session — across `30` real, randomly generated `8`-vertex graphs, `has-cycle?` agrees exactly with a structurally independent brute-force reference, every single time.

---

## Closing

### Connect the pieces

One diamond, one hidden cycle, one broad stress test:

1. **Why "already visited" fails, shown concretely (Unit 1):** the diamond graph, real convergence, no real cycle.
2. **Cycle and DAG, defined via back edges (Unit 2):** a real, two-directional proof connecting a structural property to an algorithmic one.
3. **Implemented and checked against the exact cases that matter (Unit 3):** cyclic, acyclic, disconnected-with-a-hidden-cycle, and the diamond — all correct.
4. **Checked broadly, against an independent reference (Unit 4):** `30` random graphs, zero mismatches.

Every claim in this lesson traces to real, executed code: a real, deliberately constructed counterexample to the naive approach, and a real, independent stress test confirming the correct one.

### What breaks without this

Suppose a real build system checked for circular module dependencies using the naive "already visited" test Concept Unit 1 warned against. Any real project where two modules both depended on one shared, common utility module — an entirely ordinary, everyday structure — would be incorrectly flagged as circular, blocking a legitimate build for no real reason. This lesson's own real `has-cycle?`, built on Lesson 119's gray/black distinction, is the direct, checked fix.

### Exercises

1. **Observe.** Before checking, predict whether a self-loop (an edge from a vertex directly to itself) would be correctly detected as a cycle by `has-cycle?`, using this lesson's own back-edge definition to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Extend `has-cycle?` to also return the real cycle itself (not just whether one exists), by tracking the current path explicitly, and confirm it produces a genuine cycle on `gcyc`.
4. **Explain.** In your own words, explain why `has-cycle-bruteforce?`'s explicit path-list and `has-cycle?`'s gray coloring are answering the identical real question through different mechanisms, referencing what "on the current path" means in each.
5. **Explain.** Using this lesson's real diamond-graph result, explain why a DAG can still have multiple different paths between the same two vertices, referencing what specifically distinguishes that from a cycle.

### Definition of done

- [ ] You can state why "already visited" is not the same claim as "part of a cycle," and point to the diamond graph as real, concrete proof.
- [ ] You can state the if-and-only-if relationship between cycles and back edges, and explain both directions.
- [ ] You can explain why visiting every vertex, not just the first, is necessary for correctness on disconnected graphs.
- [ ] You completed Exercises 1–5, including a real extension that reports the actual cycle found.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
