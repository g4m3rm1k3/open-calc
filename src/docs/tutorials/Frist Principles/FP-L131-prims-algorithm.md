# Lesson 131: Prim's Algorithm

**What you will build:** **Prim's algorithm** — a minimum spanning tree grown incrementally from one starting vertex, always adding the cheapest real edge connecting the tree-so-far to something outside it, structurally similar to Dijkstra (Lesson 125) but comparing a genuinely different real quantity. Real, verified evidence this session: on Lesson 129/130's own four-vertex graph, Prim's real, computed tree is `C–D`, `B–C`, `A–B` — the identical three edges Kruskal found, real total weight `6`. On the larger, five-vertex graph, Prim's real weight, `9`, matches both Kruskal and the independent brute-force reference exactly — and, run from a genuinely different starting vertex (`E` instead of `A`), still produces the identical real total weight, `9`. The transferable point: Prim and Dijkstra share an outward-growing, single-tree structure, but Prim's own greedy comparison — cheapest *edge* leaving the tree — is exactly Kruskal's own quantity (Lesson 129's own Concept Unit 4 distinction), not Dijkstra's cumulative distance. Two structurally different algorithms, Kruskal and Prim, reaching the identical real answer, is this Era's own "different tools, same correct answer" pattern, demonstrated once more.

**What you need to know first:** Lesson 125 (`FP-L125-dijkstras-algorithm.md`) — specifically Dijkstra's own outward-growing, single-tree structure, the direct structural comparison point. Lesson 129 (`FP-L129-minimum-spanning-trees.md`) and Lesson 130 (`FP-L130-kruskals-algorithm.md`) — specifically their own real graphs and results, reused directly as this lesson's own trusted checks.

**Terms introduced in this lesson**

No new terms this lesson — it applies MST vocabulary already established (Lesson 129) via a structure already established (Lesson 125's own outward-growing tree).

**Objects and methods used**

No new objects or methods this lesson — `filter`, `sort`, `member`, `apply` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: Growing One Tree, Comparing a Different Quantity

### The Problem

Kruskal considers every real edge in one global, upfront sorted order, with no notion of "inside" or "outside" any particular structure as it goes. Dijkstra, by contrast, grows a single tree outward from one vertex, always extending it — but by comparing cumulative distance from the source, exactly the quantity Lesson 129 showed produces the *wrong* answer for this problem. A real, open question: does Dijkstra's own outward-growing shape work for MST too, if the comparison itself is fixed?

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, connecting Lesson 125's own structure to Lesson 129's own required quantity.

### Reference Source

Lesson 125's own `dijkstra` (`FP-L125-dijkstras-algorithm.md`, Concept Unit 3), cited here directly as the structural template this lesson's own algorithm follows, with one deliberate change.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Changes, and What Doesn't

Dijkstra's own loop structure — grow a settled set outward, one vertex at a time, always picking the cheapest real candidate — stays entirely intact. What changes is the *quantity* being compared: not "distance from source plus this edge's weight," but the real, standalone edge weight itself, exactly Lesson 129's own Concept Unit 4 distinction, applied directly to a growing tree instead of a global sort.

### Walkthrough

- **"stays entirely intact"** — makes explicit that this lesson reuses Dijkstra's own structural shape deliberately, not by coincidence.
- **The direct citation of Lesson 129's own Concept Unit 4 distinction** — names precisely which one quantity changes.

### CS Lens

This is Lesson 111's own decision-procedure discipline, applied to *reusing a structure* rather than a whole algorithm: Dijkstra's own outward-growing shape is a real, general pattern — "grow a settled frontier, always taking the cheapest real candidate" — separable from the specific quantity it happens to compare.

### SE Lens

The alternative to recognizing this structural reuse is deriving Prim's algorithm as if from nothing, missing the direct parallel to Dijkstra already built in Lesson 125. The real value of recognizing it: Concept Unit 3's own implementation is a small, precise edit to a structure already fully understood, not a new algorithm learned from scratch.

---

## Concept Unit 2: Deriving Prim's Rule

### The Problem

Concept Unit 1 named what changes. It needs a precise rule for selecting the next edge, and a real explanation for why this rule, unlike Dijkstra's, correctly optimizes Lesson 129's own required quantity.

### No isolated lab for this step

This concept has no code of its own to isolate — the rule is derived directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building directly on Lesson 125's own structure and Lesson 129's own required quantity.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Cheapest Edge Leaving the Tree, Every Step

**The rule:** maintain a growing set of vertices already in the tree, starting from any one chosen start vertex. At every step, among every real edge with exactly one endpoint inside the tree and one outside, pick the one with the smallest real weight; add it, and its outside endpoint, to the tree. Repeat until every vertex is included.

**Why this correctly optimizes total tree weight, unlike Dijkstra's own rule:** each step adds exactly one real edge and one real vertex, and always the cheapest real edge *currently available* to extend the tree — never comparing to any cumulative total, only to other real, standalone candidate edges, exactly Kruskal's own comparison, applied locally to the tree's current boundary instead of globally to the whole edge set.

**Why the starting vertex doesn't affect the final answer:** since the comparison never references a fixed source's own distance, only real, standalone edge weights, growing the tree from any different starting point still greedily selects among the identical real edge weights — the same real, minimum-total answer, reachable from any starting vertex.

### Walkthrough

- **"exactly one endpoint inside... one outside"** — the precise real condition defining a candidate edge at any point in the algorithm's run.
- **The explicit contrast, "never comparing to any cumulative total"** — the exact, single sentence separating this rule from Dijkstra's own.

### CS Lens

This is Lesson 129's own Concept Unit 4 distinction, now doing real, load-bearing work inside an algorithm's own derivation, not just an explanatory aside: the *entire* correctness difference between Prim and Dijkstra reduces to this one, precisely-named difference in what quantity gets compared.

### SE Lens

The alternative to deriving why the starting vertex doesn't matter is simply observing it empirically. The real value of the derivation: it explains *why* Concept Unit 3's own real check (two different start vertices, identical total weight) is expected to succeed, turning a hopeful test into a predicted, then confirmed, result — Lesson 66's own "predict, then confirm" discipline.

---

## Concept Unit 3: Implementing and Verifying Prim

### The Problem

Concept Unit 2 derived the rule. It needs real code, and a real, direct check against Lesson 129 and 130's own already-trusted results.

### The New Code — Type It Yourself

```scheme
(define (prim verts edges start)
  (define in-tree (list start))
  (define mst '())
  (define (candidates)
    (filter (lambda (e) (or (and (member (car e) in-tree) (not (member (cadr e) in-tree)))
                             (and (member (cadr e) in-tree) (not (member (car e) in-tree)))))
            edges))
  (let loop ()
    (if (< (length in-tree) (length verts))
        (let* ((cs (candidates)) (best (car (sort cs (lambda (a b) (< (caddr a) (caddr b)))))))
          (set! mst (cons best mst))
          (set! in-tree (cons (if (member (car best) in-tree) (cadr best) (car best)) in-tree))
          (loop))))
  mst)
```

### Reference Source

Lesson 129's own `uedges`/`uverts` graph and Lesson 130's own `kmst` result (`FP-L129-minimum-spanning-trees.md`, `FP-L130-kruskals-algorithm.md`), reused directly as this lesson's own correctness check.

### Files affected

Created: `prim-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `prim-check.scm`, in full:

```scheme
(define (prim verts edges start)                                    ; ← new
  (define in-tree (list start))                                        ; ← new
  (define mst '())                                                        ; ← new
  (define (candidates)                                                       ; ← new
    (filter (lambda (e) (or (and (member (car e) in-tree) (not (member (cadr e) in-tree))) ; ← new
                             (and (member (cadr e) in-tree) (not (member (car e) in-tree))))) ; ← new
            edges))                                                                              ; ← new
  (let loop ()                                                                                      ; ← new
    (if (< (length in-tree) (length verts))                                                            ; ← new
        (let* ((cs (candidates)) (best (car (sort cs (lambda (a b) (< (caddr a) (caddr b)))))))            ; ← new
          (set! mst (cons best mst))                                                                          ; ← new
          (set! in-tree (cons (if (member (car best) in-tree) (cadr best) (car best)) in-tree))                  ; ← new
          (loop))))                                                                                                  ; ← new
  mst)                                                                                                                  ; ← new

(define uedges (list (list 'A 'B 1) (list 'A 'C 4) (list 'B 'C 2) (list 'B 'D 5) (list 'C 'D 3)))
(define uverts '(A B C D))
(define pmst (prim uverts uedges 'A))
(display "Prim's MST: ") (display pmst) (newline)
(display "Prim's total real weight: ") (display (apply + (map caddr pmst))) (newline)
```

`candidates` computes exactly Concept Unit 2's own condition — real edges with exactly one endpoint already in the tree — recomputed fresh at every step, since the tree's own boundary changes after every real addition.

### Mechanical Walkthrough

- **`(or (and (member (car e) in-tree) (not (member (cadr e) in-tree))) (and ...))`** — a reappearance of `or`, `and`, `member`, `not`; the literal execution of "exactly one endpoint inside, one outside," checked both ways since an edge's own two endpoints could appear in either order.
- **`(sort cs (lambda (a b) (< (caddr a) (caddr b))))`** — a reappearance of `sort`; Concept Unit 2's own "cheapest real candidate," recomputed fresh every step, exactly Dijkstra's own vertex-selection style but over real edges, not real cumulative distances.
- **`(if (member (car best) in-tree) (cadr best) (car best))`** — first appearance of this specific idiom: identifying *which* of the chosen edge's two endpoints is the genuinely new one, since either could be the "outside" vertex depending on the edge's own stored direction.
- **The real, exact match — Prim's own tree, `C–D`, `B–C`, `A–B`, the identical three edges Kruskal found in Lesson 130** — direct, checked confirmation that two structurally different algorithms reach the identical real answer.

### CS Lens

This is Lesson 120's own "two structurally unrelated algorithms, identical real partition" pattern, encountered a second time for MST specifically: Kruskal (global sort) and Prim (local, incremental growth) share no real mechanism at all, yet produce the identical real tree here — direct, checked confirmation neither algorithm's own correctness depends on the other's approach.

### SE Lens

The alternative to checking against Kruskal's own real result is trusting Concept Unit 2's derivation alone. The real value of the direct comparison: two independently-derived algorithms agreeing exactly is stronger real evidence than either one's own internal consistency check could provide alone.

### Run It — Show the Real Output

```
$ guile prim-check.scm
Prim's MST: ((C D 3) (B C 2) (A B 1))
Prim's total real weight: 6
```

Verified this session — Prim's own real, computed tree uses the identical three edges Kruskal found in Lesson 130, `C–D`, `B–C`, `A–B`, at the identical real total weight, `6` — two structurally different algorithms, the identical real answer.

---

## Concept Unit 4: The Starting Vertex Genuinely Doesn't Matter

### The Problem

Concept Unit 2 predicted that Prim's own starting vertex wouldn't affect the final total weight, unlike Dijkstra's own shortest-path tree (Lesson 129), which depends entirely on its chosen source. It's worth checking this real, specific prediction directly.

### The New Code — Type It Yourself

```scheme
(display "bigger graph Prim's MST weight, starting from A: ") (display (apply + (map caddr (prim uverts2 uedges2 'A)))) (newline)
(display "bigger graph Prim's MST weight, starting from E: ") (display (apply + (map caddr (prim uverts2 uedges2 'E)))) (newline)
```

### Reference Source

Concept Unit 3's own `prim`, run twice on the identical graph with two different real starting vertices.

### Files affected

Modified: `prim-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `prim-check.scm`, extended with a real, larger graph and a real two-start-vertex comparison:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define uedges2 (list (list 'A 'B 2) (list 'A 'C 3) (list 'B 'C 1) (list 'B 'D 4)
                       (list 'C 'D 5) (list 'C 'E 6) (list 'D 'E 2)))
(define uverts2 '(A B C D E))
(display "bigger graph Prim's MST weight, starting from A: ")                          ; ← new
(display (apply + (map caddr (prim uverts2 uedges2 'A)))) (newline)                       ; ← new
(display "bigger graph Prim's MST weight, starting from E: ")                                ; ← new
(display (apply + (map caddr (prim uverts2 uedges2 'E)))) (newline)                             ; ← new
```

### Mechanical Walkthrough

- **`(prim uverts2 uedges2 'A)`, then `(prim uverts2 uedges2 'E)`** — a reappearance of `prim`; the identical graph, two genuinely different starting vertices — the exact real test Concept Unit 2's own claim predicts should agree.
- **The real, exact match, `9` both times** — direct, checked confirmation of Concept Unit 2's own prediction: unlike Dijkstra's shortest-path tree, whose total real weight is tied to its specific source (Lesson 129's own real `8`, computed only from `A`), Prim's total weight is genuinely independent of where it starts.

### CS Lens

This is the real, measured version of Concept Unit 2's own claim: because Prim's comparison never references a fixed source's cumulative distance, only real, standalone edge weights, the greedy process explores the identical real weight landscape regardless of starting point — a real, structural guarantee, now checked rather than assumed.

### SE Lens

The alternative to checking two different start vertices is trusting the derivation's own logical argument alone. The real value of the check: it directly, concretely distinguishes Prim's own real behavior from Dijkstra's — a claim about *this specific algorithm*, not merely a plausible-sounding general property of "greedy tree-growing" algorithms in general.

### Run It — Show the Real Output

```
$ guile prim-check.scm
bigger graph Prim's MST weight, starting from A: 9
bigger graph Prim's MST weight, starting from E: 9
```

Verified this session — Prim's own real total weight is `9` regardless of whether the tree is grown starting from `A` or from `E` — real, direct confirmation that Concept Unit 2's prediction holds, and a genuine, checked contrast with Dijkstra's own source-dependent shortest-path tree.

---

## Closing

### Connect the pieces

One graph, two algorithms, one shared answer, one starting-vertex-independence check:

1. **The reused structure, recognized (Unit 1):** Dijkstra's own outward-growing shape, with one deliberate change in what's compared.
2. **The rule, derived (Unit 2):** cheapest real edge leaving the tree, every step — Kruskal's own quantity, applied locally.
3. **Implemented and checked against Kruskal directly (Unit 3):** the identical three edges, the identical real weight, `6`.
4. **Starting-vertex independence, checked directly (Unit 4):** real weight `9` from two genuinely different starting vertices.

Every claim in this lesson traces to real, executed code: a real, direct cross-check against Kruskal's own independently-derived algorithm, and a real, two-start-vertex confirmation of a specific, predicted structural property.

### What breaks without this

Suppose an engineer, familiar with Dijkstra's own real dependence on its starting vertex, assumed Prim's algorithm carried the identical dependence, and worried about which real location to designate as the "start" for a minimum-cost network design. This lesson's own real numbers — identical weight, `9`, from two genuinely different starts — show that concern is unfounded for MST specifically, precisely because Prim's own comparison never references a source's cumulative distance at all, unlike Dijkstra's.

### Exercises

1. **Observe.** Before checking, predict whether Prim, run from every one of a graph's `5` vertices in turn, would always select the *identical* set of edges, or only the identical *total weight*, using this lesson's own real edge weights (which include no ties) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, running Prim from all `5` starting vertices on Lesson 131's own bigger graph.
3. **Formalize.** Measure Prim's own real number of edge-candidate scans on the bigger graph, and compare it against Kruskal's own real number of edges examined (Lesson 130's own Exercise 1/2).
4. **Explain.** In your own words, explain why `candidates` must be recomputed fresh at every step, rather than filtered once at the start, referencing how the tree's own boundary changes as vertices are added.
5. **Explain.** Using this lesson's real numbers, explain precisely why Prim's algorithm is structurally closer to Dijkstra than to Kruskal, despite computing the identical real answer as Kruskal, referencing what specifically is shared with each.

### Definition of done

- [ ] You can state Prim's algorithm precisely and explain exactly which one quantity separates it from Dijkstra's own rule.
- [ ] You can explain why Prim's total weight doesn't depend on its starting vertex, while Dijkstra's shortest-path tree does.
- [ ] You can point to this lesson's own real, exact matches — against Kruskal, and across two different starting vertices — as concrete, checked evidence.
- [ ] You completed Exercises 1–5, including a real, full check across every possible starting vertex.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
