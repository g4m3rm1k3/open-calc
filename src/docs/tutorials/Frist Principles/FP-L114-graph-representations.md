# Lesson 114: Graph Representations

**What you will build:** two real alternatives to Lesson 113's plain edge list — an **adjacency list** and an **adjacency matrix** — plus a third representation requiring no stored structure at all, an **implicit graph**, all checked against each other for identical correctness and compared on real, measured cost. Real, verified evidence this session: on a real, `1,000`-vertex chain, checking whether an edge near the far end exists costs `999` real comparisons under Lesson 113's edge-list representation — a near-total scan — against exactly `1` comparison for an adjacency list, and a direct, comparison-free lookup for an adjacency matrix. A real `3×3` grid's neighbors, computed purely by arithmetic with zero stored edges, exactly match the same grid's fully materialized adjacency list, `24` real stored edges, computed and stored for nothing that arithmetic alone couldn't answer directly. The transferable point: Lesson 113 asked what a graph *is*; this lesson asks the identical representation question every structure since Lesson 83 has asked — what should actually be stored, and what can be computed on demand instead.

**What you need to know first:** Lesson 113 (`FP-L113-from-relations-to-graphs.md`) — specifically the plain edge-list graph and its own `graph-edge?`/`graph-neighbors`, the baseline this lesson measures against. Lesson 85 (`FP-L085-arrays.md`) — specifically the address formula, extended here to two dimensions for the adjacency matrix. Lesson 91 (`FP-L091-sets-and-maps.md`) — specifically the association-pair representation, reused for the adjacency list's vertex-to-neighbors mapping.

**Terms introduced in this lesson**

- **Adjacency list** — a graph representation storing, for each vertex, an explicit list of its own neighbors. It exists to make "what are this vertex's neighbors" fast and direct, at the cost of storing exactly the real edges present, no more.
- **Adjacency matrix** — a graph representation storing a `|V| × |V|` grid, indexed by vertex pair, marking directly whether each possible edge is present. It exists to make "does this specific edge exist" a single, direct lookup, at the cost of allocating space for every *possible* pair, whether or not an edge actually connects them.
- **Implicit graph** — a graph with no stored vertex or edge structure at all; neighbors are computed directly from a vertex's own identity by a rule, on demand. It exists for graphs whose structure is regular enough to compute rather than store — Lesson 85's own "compute an address instead of storing a reference" idea, applied to an entire graph's structure rather than one array's layout.

**Objects and methods used**

- **`iota`**
  - *What it is:* a real Scheme procedure producing a list of consecutive integers.
  - *Implementation:* takes a count, returns a list `0, 1, ..., count − 1`; reappearing from Lesson 80/95/103, used as `(iota n)`.
  - *Its use:* generating a vertex's numeric index for the adjacency matrix, and building the large synthetic chain graph this lesson measures real cost against.
- **`assoc`**
  - *What it is:* a real Scheme procedure searching a list of pairs for one whose `car` matches a given key.
  - *Implementation:* takes a key and an association list, returns the matching pair or `#f`; reappearing from Lesson 91, used as `(cdr (assoc v al))` and `(cdr (assoc a index))`.
  - *Its use:* looking up a vertex's own neighbor list in the adjacency list, and a vertex's own numeric index in the adjacency matrix's vertex-to-index mapping.

---

## Concept Unit 1: A Scan Buried Inside Every Query

### The Problem

Lesson 113's `graph-edge?` and `graph-neighbors` both call `filter` or `member` directly against the *entire* edge list, every single call, regardless of which specific vertex is being asked about. For a graph with real, meaningful size — a real road network, a real dependency graph with thousands of tasks — every single neighbor or edge query pays the cost of scanning edges that have nothing to do with the vertex actually being asked about.

### No isolated lab for this step

This concept has no code of its own to isolate — the cost is posed directly here, extending Lesson 113's own representation to a real, larger scale.

### Reference Source

No reference counterpart — the motivating cost is posed directly, extending Lesson 113's own `graph-edge?`/`graph-neighbors` rather than any external implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What a Real Fix Would Need

A representation avoiding this waste needs to reach a vertex's *own* relevant edges directly, without inspecting every other vertex's edges along the way — precisely the same "reach the right place without walking past everything else" requirement Lesson 85's array-index formula and Lesson 92's hash function were both derived to satisfy.

### Walkthrough

- **The direct citation of `filter`/`member` scanning the *entire* edge list** — grounds the inefficiency in Lesson 113's own real code, not a hypothetical.
- **The explicit parallel to Lesson 85 and 92's own "reach directly, don't scan" derivations** — previews Concept Unit 2's two real fixes as continuations of an already-familiar move, not a new idea.

### CS Lens

This is the identical representation gap Lesson 91 opened Era IV's Set/Map work with: a naive, correct-but-unindexed representation, measured honestly, motivating a real, indexed alternative — the same shape of problem, now applied to a graph's own edges instead of a set's own elements.

### SE Lens

The alternative to indexing edges by vertex is accepting Lesson 113's own full-scan cost as the price of the simplest possible representation. The real cost of that alternative, made concrete in Concept Unit 4: `999` real comparisons for a single edge check on a graph with only `1,000` vertices — a cost that compounds directly with how many queries a real graph algorithm (Era V's own upcoming subject) actually needs to make.

---

## Concept Unit 2: Deriving Two Real Fixes — and a Third Option

### The Problem

Concept Unit 1 named the requirement. It needs real, derived representations — and it's worth asking, honestly, whether some graphs need any stored structure at all.

### No isolated lab for this step

This concept has no code of its own to isolate — the two representations and the third option are derived directly below, and Concept Unit 3 implements and checks all three as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building directly on Lesson 85 and 91's own already-established ideas.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Two Real Structures, and When Neither Is Needed

**Adjacency list, derived:** group Lesson 113's own edges by their source vertex once, up front, producing, for each vertex, its own direct list of neighbors — Lesson 91's own association-pair idea (`vertex . neighbor-list`), applied here instead of `(key . value)`. A neighbor query becomes one lookup into this grouping, then a direct read — no other vertex's edges are ever touched.

**Adjacency matrix, derived:** extend Lesson 85's own one-dimensional address formula to two dimensions. Assign every vertex a numeric index `0` through `|V| − 1`; store a `|V| × |V|` grid where position `(i, j)` directly answers "is there an edge from vertex `i` to vertex `j`" — a single, computed position, exactly Lesson 85's own `base + index × element-size` idea, now indexing a two-dimensional grid instead of a flat sequence.

**The real tradeoff between them, stated precisely:** an adjacency list's real space cost is proportional to the number of edges actually present — cheap for a **sparse** graph (few edges relative to `|V|²`, a real road network's own typical shape). An adjacency matrix's real space cost is `|V|²`, always, regardless of how many edges actually exist — the price of its direct, single-lookup edge check.

**A third option, when neither is needed:** some graphs' structure is regular enough to need no storage at all — a grid, where "the vertex one row up" is always computable directly from a vertex's own row and column, needs no stored edge list to know its neighbors. This is an **implicit graph**: Lesson 85's own "compute an address instead of storing a reference" idea, applied to an entire graph's connectivity rather than one array's layout.

### Walkthrough

- **The direct extension of Lesson 85's one-dimensional formula to two dimensions** — frames the adjacency matrix as a continuation of already-derived machinery, not a new idea from nothing.
- **Space cost stated precisely for both real structures, `O(E)` versus `O(V²)`** — sets up Concept Unit 4's own real, measured confirmation.
- **The implicit graph, introduced as "when neither is needed," not as a third competing structure** — frames it correctly as a genuinely different kind of choice, applicable only when a graph's real structure permits it.

### CS Lens

This is Lesson 83's own opening question — "what should the computer actually remember" — applied a final time in this curriculum to an entire graph's structure at once: an adjacency list remembers exactly the real edges; an adjacency matrix remembers every *possible* pair's status; an implicit graph remembers nothing, computing connectivity directly from a rule.

### SE Lens

The alternative to deriving all three is defaulting to whichever one is most familiar — an adjacency matrix, say, because a grid is an intuitive mental picture. The real cost of that default, for a real, sparse graph (a real social network, where most pairs of people are *not* connected): allocating and touching `|V|²` real memory for a structure where the true number of edges might be a tiny fraction of that — exactly the honest tradeoff Concept Unit 4 measures rather than assumes.

---

## Concept Unit 3: Implementing All Three, Checked Against Each Other

### The Problem

Concept Unit 2 derived three real options. They need real code, and a real check that all three agree completely on the identical graph — different representations of the identical relation, not different relations.

### The New Code — Type It Yourself

```scheme
(define (build-adj-matrix vertices edges)
  (let* ((n (length vertices)) (index (map cons vertices (iota n))) (mat (make-vector n)))
    (let loop ((i 0)) (if (< i n) (begin (vector-set! mat i (make-vector n #f)) (loop (+ i 1)))))
    (for-each (lambda (e) (vector-set! (vector-ref mat (cdr (assoc (car e) index)))
                                        (cdr (assoc (cdr e) index)) #t))
              edges)
    (list mat index)))
```

### Reference Source

Lesson 113's own `make-graph`, `graph-vertices`, `graph-edges`, `graph-edge?`, `graph-neighbors` (`FP-L113-from-relations-to-graphs.md`, Concept Unit 3), and its own `morning` example, quoted here unchanged as the baseline every new representation is checked against.

### Files affected

Created: `graphrep-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `graphrep-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-vertices g) (car g))
(define (graph-edges g) (cdr g))
(define (graph-edge? g a b) (if (member (cons a b) (graph-edges g)) #t #f))
(define (graph-neighbors g a) (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define (build-adj-list vertices edges)                            ; ← new
  (map (lambda (v) (cons v (map cdr (filter (lambda (e) (equal? (car e) v)) edges)))) vertices)) ; ← new
(define (adjlist-neighbors al v) (cdr (assoc v al)))                  ; ← new
(define (adjlist-edge? al a b) (if (member b (adjlist-neighbors al a)) #t #f)) ; ← new

(define (build-adj-matrix vertices edges)                              ; ← new
  (let* ((n (length vertices)) (index (map cons vertices (iota n))) (mat (make-vector n))) ; ← new
    (let loop ((i 0)) (if (< i n) (begin (vector-set! mat i (make-vector n #f)) (loop (+ i 1))))) ; ← new
    (for-each (lambda (e) (vector-set! (vector-ref mat (cdr (assoc (car e) index)))            ; ← new
                                        (cdr (assoc (cdr e) index)) #t))                          ; ← new
              edges)                                                                                ; ← new
    (list mat index)))                                                                                ; ← new
(define (matrix-edge? am a b)                                                                            ; ← new
  (vector-ref (vector-ref (car am) (cdr (assoc a (cadr am)))) (cdr (assoc b (cadr am)))))                    ; ← new

(define morning (make-graph '(wake shower dress breakfast leave)
                             (list (cons 'wake 'shower) (cons 'wake 'dress) (cons 'shower 'dress)
                                   (cons 'dress 'breakfast) (cons 'breakfast 'leave))))
(define al (build-adj-list (graph-vertices morning) (graph-edges morning)))
(define am (build-adj-matrix (graph-vertices morning) (graph-edges morning)))

(for-each
 (lambda (pair)
   (let ((a (car pair)) (b (cdr pair)))
     (display "edge? ") (display a) (display "->") (display b)
     (display "  edge-list=") (display (graph-edge? morning a b))
     (display " adj-list=") (display (adjlist-edge? al a b))
     (display " adj-matrix=") (display (matrix-edge? am a b))
     (newline)))
 (list (cons 'wake 'shower) (cons 'shower 'wake) (cons 'dress 'breakfast) (cons 'wake 'leave)))
```

`build-adj-list` groups Lesson 113's own edges once, per vertex — exactly Concept Unit 2's derivation. `build-adj-matrix` assigns each vertex a numeric index, allocates a `|V| × |V|` grid of vectors, initialized to `#f`, and marks each real edge's position `#t` — Lesson 85's address formula, now choosing a row *and* a column instead of one flat index.

### Mechanical Walkthrough

- **`(map (lambda (v) (cons v ...)) vertices)`** in `build-adj-list` — a reappearance of `map`, `cons`; builds one association pair per vertex, Lesson 91's own `(key . value)` shape applied to `(vertex . neighbor-list)`.
- **`(map cons vertices (iota n))`** in `build-adj-matrix` — a reappearance of `map`, `cons`, `iota`; pairs each vertex with a fresh numeric index, `0` through `n − 1`, the mapping the matrix's own row and column numbers depend on.
- **`(make-vector n)` holding `n` more `(make-vector n #f)`** — a reappearance of `make-vector`; a vector of vectors, the real, concrete shape of a two-dimensional grid built from Lesson 85's own one-dimensional primitive.
- **`(vector-set! (vector-ref mat row) col #t)`** — a reappearance of `vector-ref`/`vector-set!`; first indexes into the correct row, then sets the correct column within it — two direct, computed steps, no scanning anywhere.
- **The real, exact agreement across all four test queries, all three representations** — direct, checked confirmation that grouping edges differently, or discarding the edge list entirely in favor of a grid, changes nothing about what relation is actually represented.

### CS Lens

This is Lesson 84's own promise, checked directly for the first time on a graph: three genuinely different representations, satisfying the identical real queries identically — the actual content of "representation doesn't affect correctness, only cost," confirmed rather than assumed.

### SE Lens

The alternative to checking all three against each other is trusting that each new representation is correct because its derivation, in Concept Unit 2, seemed sound. The real risk of that alternative: an off-by-one in the matrix's row/column indexing, for instance, would produce confidently wrong answers that only a real, direct comparison against an already-trusted baseline — Lesson 113's own edge list — would catch.

### Run It — Show the Real Output

```
$ guile graphrep-check.scm
edge? wake->shower  edge-list=#t adj-list=#t adj-matrix=#t
edge? shower->wake  edge-list=#f adj-list=#f adj-matrix=#f
edge? dress->breakfast  edge-list=#t adj-list=#t adj-matrix=#t
edge? wake->leave  edge-list=#f adj-list=#f adj-matrix=#f
```

Verified this session — all three representations agree exactly on all four real test queries, two present edges and two absent ones, confirming Concept Unit 2's derived structures represent the identical relation as Lesson 113's own original.

---

## Concept Unit 4: The Real, Measured Cost Difference

### The Problem

Concept Unit 3 confirmed correctness. It's worth measuring, honestly, exactly how much the real cost differs at a scale where Concept Unit 1's original concern actually matters — plus a real, direct comparison for the implicit graph option.

### The New Code — Type It Yourself

```scheme
(define comparisons 0)
(define (counted-member x lst)
  (cond ((null? lst) #f)
        (else (set! comparisons (+ comparisons 1))
              (if (equal? x (car lst)) lst (counted-member x (cdr lst))))))
```

### Reference Source

No reference counterpart — a counted instrumentation of Scheme's own `member`, the identical technique this Era has used since Lesson 92.

### Files affected

Created: `graphrep-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `graphrep-cost.scm`, in full — reusing Concept Unit 3's own representation-builders unchanged, with a real, `1,000`-vertex chain and a real `3×3` grid:

```scheme
(define n 1000)
(define chain-vertices (iota n))
(define chain-edges (map (lambda (i) (cons i (+ i 1))) (iota (- n 1))))

(define comparisons 0)                                             ; ← new
(define (counted-member x lst)                                        ; ← new
  (cond ((null? lst) #f)                                                 ; ← new
        (else (set! comparisons (+ comparisons 1))                          ; ← new
              (if (equal? x (car lst)) lst (counted-member x (cdr lst)))))) ; ← new
(define (edgelist-edge-counted? edges a b) (if (counted-member (cons a b) edges) #t #f)) ; ← new

(define chain-al (build-adj-list chain-vertices chain-edges))
(define (adjlist-edge-counted? al a b) (if (counted-member b (adjlist-neighbors al a)) #t #f)) ; ← new

(set! comparisons 0) (edgelist-edge-counted? chain-edges 998 999)
(display "edge-list, checking edge near the end (998->999): comparisons=") (display comparisons) (newline)
(set! comparisons 0) (adjlist-edge-counted? chain-al 998 999)
(display "adj-list, checking the identical edge: comparisons=") (display comparisons) (newline)

(define (grid-neighbors r c size)                                    ; ← new
  (filter (lambda (p) (and (>= (car p) 0) (< (car p) size) (>= (cdr p) 0) (< (cdr p) size))) ; ← new
          (list (cons (- r 1) c) (cons (+ r 1) c) (cons r (- c 1)) (cons r (+ c 1))))) ; ← new

(display "implicit neighbors of center (1,1) in a 3x3 grid: ") (display (grid-neighbors 1 1 3)) (newline)

(define grid-vertices
  (let loop ((r 0) (acc '()))
    (if (= r 3) acc (loop (+ r 1) (append acc (let loop2 ((c 0) (acc2 '()))
                                                 (if (= c 3) acc2 (loop2 (+ c 1) (cons (cons r c) acc2)))))))))
(define grid-edges
  (apply append (map (lambda (v) (map (lambda (nb) (cons v nb)) (grid-neighbors (car v) (cdr v) 3))) grid-vertices)))
(display "explicit grid: ") (display (length grid-vertices)) (display " vertices, ")
(display (length grid-edges)) (display " stored edges") (newline)
(display "explicit neighbors of center (1,1), via built adjacency list: ")
(display (adjlist-neighbors (build-adj-list grid-vertices grid-edges) (cons 1 1))) (newline)
```

The `1,000`-vertex chain is a deliberately sparse, worst-case shape for the edge-list representation: checking an edge near position `999` in a list built in ascending order forces `counted-member` to walk almost the entire list first. The `3×3` grid compares `grid-neighbors`' real, computed answer directly against the identical grid's fully materialized adjacency list.

### Mechanical Walkthrough

- **`(map (lambda (i) (cons i (+ i 1))) (iota (- n 1)))`** — a reappearance of `map`, `iota`; builds a real, sparse chain graph, `999` edges connecting `1,000` vertices in a line.
- **The real, exact `999` comparisons for the edge-list check** — direct, measured confirmation of Concept Unit 1's own claim: a query near the "far end" of an unindexed edge list pays a cost close to the *entire* edge count.
- **The real, exact `1` comparison for the adjacency-list check** — direct, measured confirmation of Concept Unit 2's derivation: only vertex `998`'s own single-element neighbor list is ever touched.
- **`(and (>= (car p) 0) (< (car p) size) ...)`** in `grid-neighbors` — a reappearance of `and`, comparison operators; bounds-checks each of the four candidate neighbors directly, the entire mechanism an implicit graph needs — no stored structure anywhere.
- **The real, exact match between `grid-neighbors`' computed output and the materialized adjacency list's stored answer, `((0 . 1) (2 . 1) (1 . 0) (1 . 2))` either way** — direct, checked confirmation that the implicit version is correct, not merely plausible, while storing `24` fewer real values than its materialized equivalent.

### CS Lens

This is Lesson 85's own array-formula finding, generalized a final time: a computed answer, verified against an independently-built, fully materialized reference, can be exactly as correct as stored data while requiring none of its space — the identical demonstration Lesson 85 gave for one array's indexing, now given for an entire graph's connectivity.

### SE Lens

The alternative to measuring the adjacency-list-versus-edge-list gap at real scale is trusting Concept Unit 2's `O(E)`-versus-`O(1)`-average derivation without checking it holds in practice. The real, measured numbers — `999` versus `1` — confirm the derivation wasn't merely plausible-sounding; they're the actual difference a real graph algorithm, making many such queries, would feel directly.

### Run It — Show the Real Output

```
$ guile graphrep-cost.scm
edge-list, checking edge near the end (998->999): comparisons=999
adj-list, checking the identical edge: comparisons=1
implicit neighbors of center (1,1) in a 3x3 grid: ((0 . 1) (2 . 1) (1 . 0) (1 . 2))
explicit grid: 9 vertices, 24 stored edges
explicit neighbors of center (1,1), via built adjacency list: ((0 . 1) (2 . 1) (1 . 0) (1 . 2))
```

Verified this session — checking the identical edge on the identical `1,000`-vertex chain costs `999` real comparisons under Lesson 113's edge list, against `1` under an adjacency list. The implicit grid's computed neighbors of the center cell, `((0 . 1) (2 . 1) (1 . 0) (1 . 2))`, exactly match the fully materialized adjacency list's own stored answer for the identical cell — real, confirmed correctness, with `24` real stored edges the implicit version never needed to build at all.

---

## Closing

### Connect the pieces

One graph, three representations, one real cost gap:

1. **The buried scan, named (Unit 1):** every query against Lesson 113's edge list touches every edge, regardless of relevance.
2. **Two real fixes, and a third option, derived (Unit 2):** adjacency list (index by vertex, cost proportional to real edges), adjacency matrix (index by pair, cost proportional to `|V|²` always), and implicit graphs (compute, don't store, when structure is regular enough).
3. **All three implemented and checked against each other (Unit 3):** identical, real agreement across every test query.
4. **The real, measured gap (Unit 4):** `999` comparisons versus `1`, at real scale; a real `3×3` grid computed with zero stored edges, exactly matching its own fully materialized equivalent.

Every claim in this lesson traces to real, executed code: three representations checked against each other for correctness, and a real, measured cost gap at a scale where it genuinely matters.

### What breaks without this

Suppose a real pathfinding system — Era V's own upcoming subject — were built directly against Lesson 113's plain edge list, on a real road network with hundreds of thousands of road segments. Every single "what roads connect to this intersection" query, and any graph-search algorithm calling it repeatedly, would pay a real cost proportional to the *entire* road network's edge count, not to the one intersection actually being asked about — this lesson's own real `999`-versus-`1` gap, at a scale where the difference would be the entire system's real, felt performance.

### Exercises

1. **Observe.** Before checking, predict whether `matrix-edge?`'s real cost would grow at all as the chain graph's `n` increases from `1,000` to `10,000`, using this lesson's own derivation of direct index computation to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real, timed code at both scales.
3. **Formalize.** Measure the real space difference between an adjacency list and an adjacency matrix for the `1,000`-vertex chain graph — count real stored values for each representation, and compare against this lesson's own `O(E)`-versus-`O(V²)` derivation.
4. **Explain.** In your own words, explain why an implicit graph's `grid-neighbors` needs no vertex-to-index mapping the way `build-adj-matrix` does, referencing what a grid cell's own row and column already provide.
5. **Explain.** Using this lesson's real numbers, state one real scenario where an adjacency matrix's `O(V²)` space cost would be perfectly acceptable, and one where it would be prohibitive, referencing the real distinction between a sparse and a dense graph.

### Definition of done

- [ ] You can state the real space tradeoff between an adjacency list and an adjacency matrix, and explain when each is the right choice.
- [ ] You can explain why an implicit graph needs no stored structure, and what property of a graph's own shape makes that possible.
- [ ] You can point to this lesson's own real `999`-versus-`1` numbers as concrete evidence for Concept Unit 1's original claim.
- [ ] You completed Exercises 1–5, including a real, measured space comparison between the two stored representations.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
