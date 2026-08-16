# Lesson 129: Minimum Spanning Trees

**What you will build:** a real, direct demonstration that a **minimum spanning tree (MST)** — connecting every vertex in an undirected graph at minimum total edge weight — is a genuinely different real problem from shortest paths, with a genuinely different real answer. Real, verified evidence this session: on a real, four-vertex weighted graph, Dijkstra's own shortest-path tree from `A` has real total weight `8` (edges `A–B`, `B–C`, `B–D`). A real, brute-force check over every possible spanning tree confirms the true minimum spanning tree has real total weight `6` (edges `A–B`, `B–C`, `C–D`) — a genuinely different tree, cheaper by a real, checked `2`. The transferable point: Lesson 123 through 128 optimized *one specific quantity* — total distance from one fixed source to every other vertex. Minimizing the *sum of every selected edge*, with no fixed source at all, is a different optimization problem entirely, and this lesson's own real numbers prove the two problems' optimal answers don't even coincide on the same, small example.

**What you need to know first:** Lesson 118 (`FP-L118-depth-first-search.md`) — specifically what a tree is, reused directly for "spanning tree." Lesson 121 (`FP-L121-cycles.md`) — specifically the definition of a cycle, reused directly for "no cycle." Lesson 125 (`FP-L125-dijkstras-algorithm.md`) — specifically Dijkstra's own shortest-path tree, the direct real contrast point this lesson's Concept Unit 3 measures against.

**Terms introduced in this lesson**

- **Spanning tree** — a subset of an undirected graph's edges connecting every vertex, containing no cycle. It exists to name, precisely, "a way to connect everything with the fewest possible edges" — exactly `|V| − 1` of them, the same real count Lesson 118's own tree definition already implies.
- **Minimum spanning tree (MST)** — among every possible spanning tree of a graph, the one whose real, total edge weight is smallest. It exists to give "connect everything as cheaply as possible" a precise, computable meaning.

**Objects and methods used**

No new objects or methods this lesson — `filter`, `member`, `apply`, `+`, `sort` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: A Question With No Fixed Source

### The Problem

Every algorithm since Lesson 116 has answered a question of the shape "distance from *this specific* vertex to every other." A real, genuinely different question: given a set of locations — towns needing a road network, buildings needing network cable — connect *all* of them, at minimum total real cost, with no particular location singled out as a starting point at all.

### No isolated lab for this step

This concept has no code of its own to isolate — the new question is posed directly here, contrasting with every shortest-path lesson since Lesson 116.

### Reference Source

No reference counterpart — the motivating contrast draws on Lesson 116 through 128's own already-established shortest-path framing, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Why "No Fixed Source" Is a Real, Structural Difference

A shortest-path tree is built by asking, repeatedly, "what's closest to the *source*." A spanning tree connecting everyone at minimum total cost asks a structurally different question — not about distance from any one point, but about the total real cost of the *edges themselves*, considered together as one connected whole.

### Walkthrough

- **Two concrete real motivating examples (roads, cable), neither naming a starting location** — grounds "no fixed source" in something checkable, not abstract.
- **"the edges themselves, considered together"** — previews Concept Unit 2's own precise definition.

### CS Lens

This is Lesson 111's own decision-procedure discipline, applied to recognizing when a *new* problem, not merely a new algorithm, is actually being asked: the required operations here (connect everyone, minimize total cost) are genuinely different from Lesson 123's own (minimize distance from one source), not a variant needing only a small adjustment.

### SE Lens

The alternative to naming this as a genuinely separate problem is assuming Dijkstra's own shortest-path tree already solves it, since both produce a real, connected tree over the same vertices. The real, demonstrated cost of that assumption, made concrete in Concept Unit 3: a real network built from Dijkstra's tree would cost real, measurably more than necessary — not a hypothetical inefficiency, a checked one.

---

## Concept Unit 2: Spanning Tree and MST, Defined Precisely

### The Problem

Concept Unit 1 named the new question. It needs a precise definition, connecting directly to Lesson 118's own tree vocabulary and Lesson 121's own cycle vocabulary.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below, and Concept Unit 3 checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation connecting directly to Lesson 118 and 121's own already-established vocabulary.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — A Tree, Spanning Every Vertex, at Minimum Cost

**Spanning tree, precisely:** a subset of a connected, undirected graph's own edges such that every vertex is connected (Lesson 115's own reachability, applied without direction) and no cycle (Lesson 121's own definition) exists among the selected edges. By Lesson 118's own tree property, this always means exactly `|V| − 1` edges — any fewer couldn't connect everyone; any more would necessarily create a cycle.

**Minimum spanning tree, precisely:** among every real spanning tree a graph admits — and a graph with more edges than `|V| − 1` typically admits many — the one whose real, summed edge weight is the smallest.

### Walkthrough

- **"exactly `|V| − 1` edges," derived from Lesson 118's own tree property, not asserted freshly** — a direct reuse, not a new fact.
- **"a graph typically admits many" spanning trees** — sets up Concept Unit 3's own real, exhaustive search as a genuinely non-trivial computation, not a formality.

### CS Lens

This is Lesson 129's own real instance of a broader pattern this Era has repeated: name the precise object first (spanning tree), then the precise optimization over it (minimum) — the identical two-step discipline Lesson 123 applied to paths and weight.

### SE Lens

The alternative to defining MST precisely via "no cycle, minimum weight" is describing it only informally as "the cheapest way to connect everything." The real value of precision: Concept Unit 3's own brute-force search needs an exact, checkable test — "does this specific edge subset actually span every vertex, with no cycle" — that only a precise definition makes possible to implement correctly.

---

## Concept Unit 3: A Real, Direct Proof the Two Problems Differ

### The Problem

Concept Unit 2 defined MST precisely. It's worth checking, directly and concretely, whether Dijkstra's own shortest-path tree — a real, already-built tree spanning every vertex — happens to already be a minimum spanning tree, or whether it's a genuinely different, more expensive answer.

### The New Code — Type It Yourself

```scheme
(define (connects-all? edges verts)
  (let ((visited (list (car verts))))
    (let loop ((changed #t))
      (if changed
          (let ((added #f))
            (for-each (lambda (e)
                        (cond ((and (member (car e) visited) (not (member (cadr e) visited)))
                               (set! visited (cons (cadr e) visited)) (set! added #t))
                              ((and (member (cadr e) visited) (not (member (car e) visited)))
                               (set! visited (cons (car e) visited)) (set! added #t))))
                      edges)
            (loop added))))
    (= (length visited) (length verts))))
```

### Reference Source

Lesson 125's own `dijkstra` (`FP-L125-dijkstras-algorithm.md`, Concept Unit 3), extended here to also record each vertex's real parent — its own shortest-path tree — checked against a real, from-scratch brute-force spanning-tree search.

### Files affected

Created: `mst-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `mst-check.scm`, in full:

```scheme
(define uedges (list (list 'A 'B 1) (list 'A 'C 4) (list 'B 'C 2) (list 'B 'D 5) (list 'C 'D 3)))
(define uverts '(A B C D))

(define (make-wgraph vertices edges) (cons vertices edges))
(define (wgraph-vertices g) (car g))
(define (wgraph-edges g) (cdr g))
(define (wgraph-neighbors g a) (filter (lambda (e) (equal? (car e) a)) (wgraph-edges g)))
(define directed-edges (apply append (map (lambda (e) (list (list (car e) (cadr e) (caddr e)) (list (cadr e) (car e) (caddr e)))) uedges)))
(define dg (make-wgraph uverts directed-edges))

(define INF 999999)
(define (dget dist v) (let ((r (assoc v dist))) (if r (cdr r) INF)))
(define (edge-weight g a b) (caddr (car (filter (lambda (e) (equal? (cadr e) b)) (wgraph-neighbors g a)))))
(define (relax dist g u v)
  (let ((cand (+ (dget dist u) (edge-weight g u v))))
    (if (< cand (dget dist v)) (cons (cons v cand) (filter (lambda (p) (not (equal? (car p) v))) dist)) dist)))
(define (dijkstra g start)
  (let ((dist (list (cons start 0))) (settled '()) (parent (list)))
    (let loop ()
      (let ((unsettled (filter (lambda (v) (not (member v settled))) (wgraph-vertices g))))
        (if (null? unsettled) (list dist parent)
            (let ((u (car (sort unsettled (lambda (a b) (< (dget dist a) (dget dist b)))))))
              (if (= (dget dist u) INF) (list dist parent)
                  (begin (set! settled (cons u settled))
                         (for-each (lambda (e) (let* ((v (cadr e)) (old (dget dist v)))
                                                  (set! dist (relax dist g u v))
                                                  (if (< (dget dist v) old)
                                                      (set! parent (cons (cons v u) (filter (lambda (p) (not (equal? (car p) v))) parent))))))
                                   (wgraph-neighbors g u))
                         (loop)))))))))

(define result (dijkstra dg 'A))
(define dj-parent (cadr result))
(display "Dijkstra shortest-path tree (child . parent): ") (display dj-parent) (newline)
(define dj-tree-weight (apply + (map (lambda (p) (edge-weight dg (cdr p) (car p))) dj-parent)))
(display "Dijkstra shortest-path tree, total real weight: ") (display dj-tree-weight) (newline)

(define (combinations lst k)
  (cond ((= k 0) (list '()))
        ((null? lst) '())
        (else (append (map (lambda (c) (cons (car lst) c)) (combinations (cdr lst) (- k 1)))
                       (combinations (cdr lst) k)))))

(define (connects-all? edges verts)                                 ; ← new
  (let ((visited (list (car verts))))                                   ; ← new
    (let loop ((changed #t))                                               ; ← new
      (if changed                                                             ; ← new
          (let ((added #f))                                                     ; ← new
            (for-each (lambda (e)                                                  ; ← new
                        (cond ((and (member (car e) visited) (not (member (cadr e) visited))) ; ← new
                               (set! visited (cons (cadr e) visited)) (set! added #t))            ; ← new
                              ((and (member (cadr e) visited) (not (member (car e) visited)))       ; ← new
                               (set! visited (cons (car e) visited)) (set! added #t))))                ; ← new
                      edges)                                                                              ; ← new
            (loop added))))                                                                                  ; ← new
    (= (length visited) (length verts))))                                                                       ; ← new

(define candidates (combinations uedges 3))
(define spanning-trees (filter (lambda (c) (connects-all? c uverts)) candidates))
(define weighted (map (lambda (t) (cons t (apply + (map caddr t)))) spanning-trees))
(define mst (car (sort weighted (lambda (a b) (< (cdr a) (cdr b))))))
(display "true MST (brute force over all spanning trees): ") (display mst) (newline)
```

`connects-all?` performs a real, direct spread-of-visited-vertices check: starting from any one vertex, repeatedly add any vertex reachable through the candidate edge set, until nothing new is added; the candidate set is a real spanning tree exactly when every vertex ends up visited. `combinations` generates every real way to choose `|V| − 1` edges from the graph's own edge set — the real, exhaustive search space Concept Unit 2's definition requires checking.

### Mechanical Walkthrough

- **`(apply append (map (lambda (e) (list (list ...) (list ...))) uedges))`** — a reappearance of `apply`, `append`, `map`; builds the directed, both-ways graph Dijkstra itself needs, from the single, canonical undirected edge list this lesson's own MST search uses directly.
- **`(let ((added #f)) (for-each ...) (loop added))`** in `connects-all?` — first appearance of this specific fixed-point idiom: repeat spreading visited status until a full pass adds nothing new, guaranteeing every reachable vertex through this specific edge subset is found.
- **`(combinations lst k)`** — first appearance of a real, general combinations generator, recursively either including or excluding each element.
- **The real, exact `8` for Dijkstra's own shortest-path tree, against the real, exact `6` for the true, brute-force-confirmed MST** — direct, checked proof of Concept Unit 1's own claim: the two trees are genuinely different, and Dijkstra's is real, measurably more expensive.

### CS Lens

This is Lesson 123's own `all-paths` discipline, applied to a structurally different search space: rather than enumerating every real *path*, this unit enumerates every real *spanning tree* — the correct, trusted brute-force reference for a genuinely different problem, built the same careful way.

### SE Lens

The alternative to a real brute-force check is trusting that "a tree connecting everyone, built by a trusted shortest-path algorithm" must be reasonably close to optimal for this new problem too. The real, measured gap — `8` versus `6`, a real `33%` overhead — shows that intuition alone would have understated a genuine, checkable inefficiency.

### Run It — Show the Real Output

```
$ guile mst-check.scm
Dijkstra shortest-path tree (child . parent): ((D . B) (C . B) (B . A))
Dijkstra shortest-path tree, total real weight: 8
true MST (brute force over all spanning trees): (((A B 1) (B C 2) (C D 3)) . 6)
```

Verified this session — Dijkstra's own real shortest-path tree from `A` uses edges `A–B`, `B–C`, `B–D`, real total weight `8`. The true minimum spanning tree, confirmed by an exhaustive, real brute-force search over every possible spanning tree, uses `A–B`, `B–C`, `C–D` instead — real total weight `6`, a genuinely different tree, real proof the two problems don't share an optimal answer.

---

## Concept Unit 4: Why the Difference Is Real, Not an Accident of This Graph

### The Problem

Concept Unit 3 found a real gap on one graph. It's worth naming precisely *why* that gap exists — not merely that it does — connecting the real numbers back to what each algorithm actually optimizes.

### The New Code — Type It Yourself

```scheme
(display "Dijkstra's real distance to D, via its own tree: 6 (1+5, direct through B)") (newline)
(display "MST's real cost to connect D: 3 (C-D edge alone, ignoring distance-from-A entirely)") (newline)
```

### Reference Source

Concept Unit 3's own real, already-computed `dj-parent` and `mst` results, restated here as a direct real comparison.

### Files affected

Modified: `mst-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file as commentary on its own real output).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `mst-check.scm`, with a real, direct explanatory trace added:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(display "Dijkstra's real distance to D, via its own tree: ") (display (dget (car result) 'D)) (newline) ; ← new
(display "MST's real cost of the edge connecting D (C-D): ") (display (caddr (list-ref (car mst) 2))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(dget (car result) 'D)`** — a reappearance of `dget`; reads Dijkstra's own real distance to `D`, `6`, the specific quantity Dijkstra's own tree-building process optimizes for.
- **`(caddr (list-ref (car mst) 2))`** — a reappearance of `caddr`, `list-ref`; reads the real weight of the MST's own edge connecting `D`, `3` — a quantity Dijkstra's algorithm never once considers, since it only ever compares candidate distances *from `A`*, never a standalone edge's own weight in isolation.
- **The real contrast, `6` versus `3`** — direct, checked confirmation of exactly why the two trees differ: Dijkstra chose `B–D` (weight `5`) because it minimized *distance from `A`* (`1 + 5 = 6`); the MST chose `C–D` (weight `3`) because it minimized the *edge's own real cost*, with no reference to `A` at all.

### CS Lens

This is the precise, real distinction this whole lesson exists to draw: Dijkstra's own greedy choice (Lesson 125) always compares *candidate total distances from the source*; an MST algorithm's own greedy choice, as Lesson 130 and 131 will derive, compares *real, standalone edge weights* directly — two different real quantities, driving two different real trees.

### SE Lens

The alternative to tracing the exact mechanism is leaving Concept Unit 3's real gap as an unexplained, if checked, curiosity. The real value of naming it precisely: it's the exact reason Lesson 130's Kruskal and Lesson 131's Prim need genuinely different greedy rules than Dijkstra's own — not a stylistic choice, a real, structural requirement of optimizing a different quantity.

### Run It — Show the Real Output

```
$ guile mst-check.scm
Dijkstra's real distance to D, via its own tree: 6
MST's real cost of the edge connecting D (C-D): 3
```

Verified this session — Dijkstra's own real distance to `D` is `6`, built by minimizing total distance from `A`. The MST's own real edge connecting `D`, `C–D`, costs only `3` on its own — a genuinely different real quantity, optimized without any reference to `A` at all, exactly the structural reason the two trees diverge.

---

## Closing

### Connect the pieces

Four vertices, two real trees, one confirmed, measured gap:

1. **The new question, named (Unit 1):** connect everyone at minimum total cost, with no fixed source at all.
2. **Spanning tree and MST, defined precisely (Unit 2):** `|V| − 1` edges, no cycle, minimum real total weight.
3. **The real gap, proven directly (Unit 3):** Dijkstra's tree costs `8`; the true MST, confirmed by brute force, costs `6`.
4. **The mechanism, traced precisely (Unit 4):** Dijkstra minimizes distance-from-source; MST minimizes standalone edge weight — two real, different quantities.

Every claim in this lesson traces to real, executed code: a real shortest-path tree, a real, exhaustive brute-force search over every spanning tree, and a real, traced explanation of exactly why they diverge.

### What breaks without this

Suppose a real engineer, needing to design a minimum-cost network connecting a set of real locations, reused Dijkstra's own shortest-path tree directly, reasoning that "it already connects everyone." This lesson's own real numbers show precisely what that mistake would cost: a real, `33%` overspend (`8` instead of `6` on this small example, and compounding at real scale) — not because Dijkstra is broken, but because it was never solving this problem at all.

### Exercises

1. **Observe.** Before checking, predict whether Dijkstra's shortest-path tree, run from a *different* start vertex (`D`, say, instead of `A`), would produce the identical real total weight, `8`, using this lesson's own understanding of what Dijkstra actually optimizes to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Build a real, five-vertex weighted graph of your own design, and confirm, via a real brute-force search, that its own MST differs from at least one vertex's own shortest-path tree.
4. **Explain.** In your own words, explain why an MST is always guaranteed to have exactly `|V| − 1` edges, connecting this lesson's own definition back to Lesson 118's tree property.
5. **Explain.** Using this lesson's real numbers, explain precisely why `connects-all?`'s fixed-point loop (repeat until nothing new is added) is necessary, rather than a single pass over the candidate edges, referencing what a single pass could miss.

### Definition of done

- [ ] You can state the precise definitions of spanning tree and minimum spanning tree, and explain why every spanning tree has exactly `|V| − 1` edges.
- [ ] You can explain, precisely, why Dijkstra's shortest-path tree is not generally a minimum spanning tree, referencing what each algorithm actually optimizes.
- [ ] You can point to this lesson's own real `8`-versus-`6` numbers as concrete, checked evidence, not an assumed distinction.
- [ ] You completed Exercises 1–5, including a real, self-designed graph confirming the same divergence.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
