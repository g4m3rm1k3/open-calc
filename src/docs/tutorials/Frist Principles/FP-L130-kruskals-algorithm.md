# Lesson 130: Kruskal's Algorithm

**What you will build:** **Kruskal's algorithm** — a real minimum spanning tree, built by directly combining two tools already fully verified in this curriculum: `sort` (Lesson 79) and Union-Find (Lesson 107/108). Real, verified evidence this session: on Lesson 129's own four-vertex graph, Kruskal's real, computed tree — edges `C–D`, `B–C`, `A–B` — has real total weight `6`, exactly matching Lesson 129's own brute-force-confirmed minimum, and using the identical three edges. On a real, five-vertex, seven-edge graph, Kruskal's real weight, `9`, again exactly matches an independent brute-force search over every possible spanning tree. The algorithm needs exactly `4` real, successful Union-Find merges — precisely `|V| − 1`, never more. The transferable point: Kruskal's greedy rule is genuinely different from Dijkstra's own (Lesson 125) — it never compares a candidate edge to any notion of "distance from a source" at all. It only ever asks one, real, already-solved question, repeatedly: would adding this specific edge create a cycle? Union-Find answers that question directly, in real, already-measured, near-constant time.

**What you need to know first:** Lesson 129 (`FP-L129-minimum-spanning-trees.md`) — specifically its own real graph and brute-force MST, the direct check this lesson's algorithm is verified against. Lesson 107/108 (`FP-L107-union-find.md`, `FP-L108-path-compression.md`) — specifically `uf-find`/`uf-union!`, reused directly as the cycle-detection mechanism. Lesson 79 (`FP-L079-merge-sort.md`) — specifically `sort`, reused directly.

**Terms introduced in this lesson**

No new terms this lesson — it combines Union-Find (Lesson 107/108) and sorting (Lesson 79) directly, applying vocabulary already fully established.

**Objects and methods used**

- **`sort`**
  - *What it is:* a real Guile procedure sorting a list according to a given comparison procedure.
  - *Implementation:* takes a list and a `<`-shaped predicate, returns a newly ordered list; reappearing from Lesson 79, used here as `(sort edges (lambda (a b) (< (caddr a) (caddr b))))`.
  - *Its use:* the entire real ordering Kruskal's own greedy rule depends on — cheapest real edge considered first, always.

---

## Concept Unit 1: A Question Already Fully Solved

### The Problem

Lesson 129 named the real requirement: choose real edges, cheapest first, without ever forming a cycle. The second half of that requirement — "does adding this edge create a cycle" — is a question this curriculum has already answered directly and efficiently: Lesson 107 and 108's own Union-Find, built specifically to track which vertices are already connected.

### No isolated lab for this step

This concept has no code of its own to isolate — the connection is posed directly here, linking Lesson 129's own requirement to Lesson 107/108's already-built tool.

### Reference Source

Lesson 107's own `uf-find`/`uf-union!` (`FP-L107-union-find.md`, Concept Unit 3), quoted here directly rather than paraphrased, as the tool this lesson's own cycle check reuses unchanged.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Why Union-Find Answers Exactly the Right Question

Adding an edge `(u, v)` creates a cycle exactly when `u` and `v` are already connected through some other, already-selected path — precisely `uf-find(u) = uf-find(v)`, Union-Find's own already-defined "same group" check. If they're *not* already connected, adding the edge is always safe, and `uf-union!` records the merge directly.

### Walkthrough

- **The direct citation of Union-Find's own real contract** — makes clear this lesson reuses, rather than re-derives, cycle detection.
- **"exactly when `u` and `v` are already connected"** — the precise, checkable condition Concept Unit 3's own real code implements directly.

### CS Lens

This is Lesson 111's own decision-procedure discipline, demonstrated in its most direct form yet: rather than building anything new, this lesson recognizes that two already-verified tools, sorting and Union-Find, compose directly into a complete, correct algorithm for a third, different problem.

### SE Lens

The alternative to reusing Union-Find is implementing a fresh cycle check for this specific use — perhaps a full traversal (Lesson 121's own `has-cycle?`) after each candidate edge. The real cost of that alternative: a full traversal is real, unnecessary work when Union-Find already answers the identical "same component" question in the near-constant real time Lesson 108 already measured.

---

## Concept Unit 2: Deriving Kruskal's Greedy Rule

### The Problem

Concept Unit 1 named the reusable tool. It needs a precise algorithm: exactly what order to consider edges in, and exactly what to do with each one.

### No isolated lab for this step

This concept has no code of its own to isolate — the algorithm is derived directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation combining Lesson 79 and Lesson 107/108's own already-established tools.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Sort, Then Greedily Accept

**The algorithm:** sort every real edge by weight, ascending. Process them in that order; for each edge, check via Union-Find whether its two endpoints are already connected. If not, add the edge to the growing tree and union the two components. If they already are, skip the edge — adding it would create a cycle.

**Why cheapest-first is safe:** considering edges in increasing weight order means every edge actually added is the cheapest real edge available at the moment it's considered, among all edges that don't yet create a cycle — the same greedy commitment style Lesson 125 used for Dijkstra, applied here to a genuinely different quantity (an edge's own standalone weight, not distance from any source, exactly Lesson 129's own Concept Unit 4 distinction).

**When to stop:** once exactly `|V| − 1` edges have been accepted — Lesson 129's own tree property guarantees no further edge could be needed, and every remaining edge would necessarily create a cycle.

### Walkthrough

- **The two-branch decision (connect or skip) for every edge, in sorted order** — the entire algorithm, stated in one sentence, exactly reflecting Concept Unit 1's own reused tool.
- **The explicit contrast with Dijkstra's own greedy rule** — cheapest *standalone edge*, not cheapest *distance from a source* — the precise structural difference Lesson 129 identified.

### CS Lens

This is Lesson 132's own upcoming general vocabulary, encountered here concretely before being named formally: committing to the locally cheapest available choice, never reconsidering it, and proving (in outline, here; formally, in Lesson 132/133) that this produces a real global optimum.

### SE Lens

The alternative to sorting all edges upfront is repeatedly scanning for the cheapest remaining edge at each step. The real cost of that alternative: a full scan every step is real, repeated work Lesson 79's own `sort`, run once, avoids entirely — the identical "sort once, then process in order" efficiency Lesson 122's topological sort already demonstrated.

---

## Concept Unit 3: Implementing and Verifying Kruskal

### The Problem

Concept Unit 2 derived the algorithm. It needs real code, and a real, direct check against Lesson 129's own trusted, brute-force MST.

### The New Code — Type It Yourself

```scheme
(define (kruskal verts edges)
  (define n (length verts))
  (define p (make-uf n))
  (define (vidx v) (- (length verts) (length (member v verts))))
  (define sorted-edges (sort edges (lambda (a b) (< (caddr a) (caddr b)))))
  (let loop ((es sorted-edges) (mst '()))
    (if (null? es)
        mst
        (let ((e (car es)))
          (if (uf-union! p (vidx (car e)) (vidx (cadr e)))
              (loop (cdr es) (cons e mst))
              (loop (cdr es) mst))))))
```

### Reference Source

Lesson 107's own `make-uf`, `uf-find` (`FP-L107-union-find.md`, Concept Unit 3), quoted here unchanged; Lesson 129's own `uedges`/`uverts` graph and its own brute-force MST result (`FP-L129-minimum-spanning-trees.md`, Concept Unit 3), reused directly as this lesson's own correctness check.

### Files affected

Created: `kruskal-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `kruskal-check.scm`, in full:

```scheme
(define (make-uf n) (let ((p (make-vector n))) (let loop ((i 0)) (if (< i n) (begin (vector-set! p i i) (loop (+ i 1))))) p))
(define (uf-find p x) (let loop ((x x)) (if (= (vector-ref p x) x) x (loop (vector-ref p x)))))
(define (uf-union! p a b)
  (let ((ra (uf-find p a)) (rb (uf-find p b)))
    (if (not (= ra rb)) (begin (vector-set! p ra rb) #t) #f)))

(define (kruskal verts edges)                                       ; ← new
  (define n (length verts))                                             ; ← new
  (define p (make-uf n))                                                    ; ← new
  (define (vidx v) (- (length verts) (length (member v verts))))               ; ← new
  (define sorted-edges (sort edges (lambda (a b) (< (caddr a) (caddr b)))))        ; ← new
  (let loop ((es sorted-edges) (mst '()))                                            ; ← new
    (if (null? es)                                                                      ; ← new
        mst                                                                                ; ← new
        (let ((e (car es)))                                                                   ; ← new
          (if (uf-union! p (vidx (car e)) (vidx (cadr e)))                                        ; ← new
              (loop (cdr es) (cons e mst))                                                           ; ← new
              (loop (cdr es) mst))))))                                                                  ; ← new

(define uedges (list (list 'A 'B 1) (list 'A 'C 4) (list 'B 'C 2) (list 'B 'D 5) (list 'C 'D 3)))
(define uverts '(A B C D))
(define kmst (kruskal uverts uedges))
(display "Kruskal's MST: ") (display kmst) (newline)
(display "Kruskal's total real weight: ") (display (apply + (map caddr kmst))) (newline)
```

`uf-union!` returns `#t` only on a genuine merge — the precise, real signal Kruskal needs to decide whether an edge is safe to add. `vidx` converts a symbolic vertex name into Union-Find's own required numeric index, exactly Lesson 120's own connected-components technique.

### Mechanical Walkthrough

- **`(sort edges (lambda (a b) (< (caddr a) (caddr b))))`** — a reappearance of `sort`; the literal execution of Concept Unit 2's own "cheapest first" rule.
- **`(if (uf-union! p (vidx (car e)) (vidx (cadr e))) (loop (cdr es) (cons e mst)) (loop (cdr es) mst))`** — a reappearance of `if`, `cons`; the entire greedy decision, made in one real call: `uf-union!`'s own return value directly decides whether to keep or discard each edge.
- **The real, exact match — Kruskal's own tree, `C–D`, `B–C`, `A–B`, real weight `6` — against Lesson 129's own brute-force MST, the identical three edges** — direct, checked confirmation that Concept Unit 2's derivation is not merely plausible, but produces the actual, verified-optimal answer.

### CS Lens

This is Lesson 84's own promise, checked a final time in this Era on a genuinely new problem: an algorithm built entirely from already-verified components (`sort`, Union-Find) inherits real correctness confidence from each, and this unit's own direct check against Lesson 129's brute-force reference confirms the composition itself introduced no new error.

### SE Lens

The alternative to checking against Lesson 129's own real reference is trusting Concept Unit 2's derivation alone. The real value of the direct check: it confirms not just that the greedy *idea* is sound, but that *this specific code* — the exact `vidx`, `sort`, and `uf-union!` calls — correctly implements it, the same standard this Era has applied to every real algorithm since Lesson 79.

### Run It — Show the Real Output

```
$ guile kruskal-check.scm
Kruskal's MST: ((C D 3) (B C 2) (A B 1))
Kruskal's total real weight: 6
```

Verified this session — Kruskal's own real, computed minimum spanning tree uses exactly the three edges Lesson 129's brute-force search found, `C–D`, `B–C`, `A–B`, at the identical real total weight, `6`.

---

## Concept Unit 4: A Larger Real Graph, and the Real Cost

### The Problem

Concept Unit 3 confirmed correctness on Lesson 129's own small graph. It's worth checking on a real, larger graph — a genuinely different shape, more edges than vertices — and measuring the real number of Union-Find operations Kruskal actually performs.

### The New Code — Type It Yourself

```scheme
(define uedges2 (list (list 'A 'B 2) (list 'A 'C 3) (list 'B 'C 1) (list 'B 'D 4)
                       (list 'C 'D 5) (list 'C 'E 6) (list 'D 'E 2)))
```

### Reference Source

No reference counterpart — a real, fresh five-vertex, seven-edge graph, checked against a real, from-scratch brute-force spanning-tree search, the identical technique Lesson 129 already used.

### Files affected

Modified: `kruskal-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `kruskal-check.scm`, extended with a real, larger graph and a real brute-force cross-check:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define uedges2 (list (list 'A 'B 2) (list 'A 'C 3) (list 'B 'C 1) (list 'B 'D 4)     ; ← new
                       (list 'C 'D 5) (list 'C 'E 6) (list 'D 'E 2)))                     ; ← new
(define uverts2 '(A B C D E))
(define kmst2 (kruskal uverts2 uedges2))
(display "bigger graph Kruskal MST weight: ") (display (apply + (map caddr kmst2))) (newline)

(define (combinations lst k)
  (cond ((= k 0) (list '())) ((null? lst) '())
        (else (append (map (lambda (c) (cons (car lst) c)) (combinations (cdr lst) (- k 1))) (combinations (cdr lst) k)))))
(define (connects-all? edges verts)
  (let ((visited (list (car verts))))
    (let loop ((changed #t))
      (if changed (let ((added #f))
                    (for-each (lambda (e) (cond ((and (member (car e) visited) (not (member (cadr e) visited)))
                                                  (set! visited (cons (cadr e) visited)) (set! added #t))
                                                 ((and (member (cadr e) visited) (not (member (car e) visited)))
                                                  (set! visited (cons (car e) visited)) (set! added #t))))
                              edges)
                    (loop added))))
    (= (length visited) (length verts))))
(define candidates2 (combinations uedges2 4))
(define spanning2 (filter (lambda (c) (connects-all? c uverts2)) candidates2))
(define weighted2 (map (lambda (t) (apply + (map caddr t))) spanning2))
(display "true minimum (brute force over all spanning trees): ") (display (apply min weighted2)) (newline)
```

### Mechanical Walkthrough

- **`(combinations uedges2 4)`** — a reappearance of `combinations`; every real way to choose `4` edges (`|V| − 1` for this `5`-vertex graph) from the `7` available, checked exhaustively.
- **The real, exact match, `9`, between Kruskal's own computed weight and the true, brute-force-confirmed minimum** — direct, checked confirmation on a genuinely different, larger real graph than Concept Unit 3's own example.

### CS Lens

This is Lesson 117's own broad-evidence standard, applied here a second time: a single successful check (Concept Unit 3) is real evidence; a second, structurally different real graph, independently verified, is stronger evidence still.

### SE Lens

The alternative to checking a second graph is trusting Concept Unit 3's own single, small example generalizes. The real value of the second check: this graph has more edges than the first relative to its vertex count, exercising `uf-union!`'s own real rejection path (skipping an edge that *would* create a cycle) more heavily than the first, smaller example did.

### Run It — Show the Real Output

```
$ guile kruskal-check.scm
bigger graph Kruskal MST weight: 9
true minimum (brute force over all spanning trees): 9
```

Verified this session — Kruskal's own real weight on the larger graph, `9`, exactly matches the true minimum confirmed by exhaustive brute-force search over every possible spanning tree — real, checked correctness on a second, structurally different graph.

---

## Closing

### Connect the pieces

Two graphs, two real, exact matches, one algorithm built entirely from already-trusted parts:

1. **The reusable question, recognized (Unit 1):** "does this create a cycle" is exactly what Union-Find already answers.
2. **The greedy rule, derived (Unit 2):** sort by weight, accept if it doesn't create a cycle, stop at `|V| − 1` edges.
3. **Implemented and checked against a trusted reference (Unit 3):** the identical three edges, the identical real weight, `6`.
4. **Checked again, on a genuinely different graph (Unit 4):** real weight `9`, matching an independent brute-force search exactly.

Every claim in this lesson traces to real, executed code: two separately-verified real graphs, each checked directly against an independent, trusted reference.

### What breaks without this

Suppose an engineer, needing a real minimum-cost network, implemented cycle detection from scratch for this specific purpose — a full traversal per candidate edge, rather than reaching for Lesson 107/108's own already-built, already-efficient Union-Find. The real cost of that duplication: real, unnecessary implementation and testing effort, rebuilding a tool this curriculum had already verified correct and fast, exactly the kind of waste Lesson 111's decision procedure exists to prevent.

### Exercises

1. **Observe.** Before checking, predict how many real edges Kruskal would examine (not just accept) on Lesson 129's own graph before finding all `3` it needs, using the graph's own real edge count and sorted order to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, counting every edge considered, not just accepted.
3. **Formalize.** Modify `kruskal` to also record which real edges were *rejected* (would have created a cycle), and confirm, for Lesson 129's own graph, exactly which edge(s) that turns out to be.
4. **Explain.** In your own words, explain why Kruskal's algorithm never needs to know anything about a "source" vertex at all, connecting your answer directly to Lesson 129's own Concept Unit 4 distinction.
5. **Explain.** Using this lesson's real numbers, explain why sorting all edges once, upfront, is strictly better than repeatedly scanning for the cheapest remaining edge, referencing Lesson 79's own real complexity work.

### Definition of done

- [ ] You can state Kruskal's algorithm precisely and explain why Union-Find is exactly the right tool for its cycle check.
- [ ] You can explain why Kruskal's greedy rule (cheapest standalone edge) is a genuinely different quantity from Dijkstra's own (cheapest distance from source).
- [ ] You can point to this lesson's own real, exact matches against two independent brute-force references as concrete evidence of correctness.
- [ ] You completed Exercises 1–5, including a real accounting of which edges get rejected and why.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
