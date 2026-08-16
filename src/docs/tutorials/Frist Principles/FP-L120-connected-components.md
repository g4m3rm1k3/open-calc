# Lesson 120: Connected Components

**What you will build:** two genuinely different real algorithms for the identical question — partitioning an entire graph into its **connected components** — one built from repeated traversal (Lesson 115 through 119's own machinery), the other built from Lesson 107/108's Union-Find, checked directly against each other. Real, verified evidence this session: on a real, six-vertex graph with three separate pieces (`{A, B, C}`, `{D, E}`, `{F}`), both algorithms produce the identical partition — confirmed vertex by vertex, not just by matching component counts. At real scale, `500` disjoint vertex pairs (`1,000` vertices total): the traversal approach performs `1,500` real visit operations to find all `500` components; Union-Find performs `2,500` real find operations across `1,000` union calls. The transferable point: this is Lesson 111's own decision-procedure lesson, revisited concretely — two structures built for entirely different original reasons (traversal, for exploring; Union-Find, for merging groups) turn out to solve the identical real problem, and checking them against each other, not just trusting either one alone, is what confirms it.

**What you need to know first:** Lesson 115 (`FP-L115-traversing-structure.md`) — specifically `explore` and its own visited-set discipline. Lesson 107 (`FP-L107-union-find.md`) and Lesson 108 (`FP-L108-path-compression.md`) — specifically the Union-Find ADT, applied here to graph edges directly for the first time.

**Terms introduced in this lesson**

- **Connected component** — a maximal set of vertices, every pair of which is connected by some path (through any number of intermediate vertices), in an undirected graph. It exists to name the real, natural "pieces" a graph breaks into — Lesson 115's own reachability, generalized from one starting vertex to the whole graph at once.

**Objects and methods used**

No new objects or methods this lesson — every procedure reappears from Lesson 107/108 and 115 unchanged, or is a small, direct combination of both.

---

## Concept Unit 1: From One Start Vertex to the Whole Graph

### The Problem

Every traversal this curriculum has built since Lesson 115 answers "what's reachable from *this one* vertex." A real, natural next question: given an entire graph, break it into its complete set of separate, connected pieces — every vertex assigned to exactly one piece, with every vertex in a piece reachable from every other vertex in that same piece, and from no vertex outside it.

### No isolated lab for this step

This concept has no code of its own to isolate — the extension is posed directly here, building on Lesson 115's own single-start traversal.

### Reference Source

No reference counterpart — the motivating extension draws on Lesson 115's own already-built `explore`, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Two Genuinely Different Real Approaches

**Repeated traversal:** run `explore` from any not-yet-visited vertex; everything it finds is one complete component; repeat from the next not-yet-visited vertex, until every vertex belongs to some component. **Union-Find:** treat every vertex as its own group initially (Lesson 107's own `make-uf`), then process every edge, `uf-union!`-ing its two endpoints; the final groups, read by representative, are the components. Both approaches answer the identical question, built from entirely different original motivations.

### Walkthrough

- **The precise definition of "maximal connected piece"** — every pair reachable, from no vertex outside — the exact target both real algorithms in this lesson are checked against.
- **Two approaches named before either is implemented** — sets up Concept Unit 3's own direct comparison.

### CS Lens

This is Lesson 111's own decision-procedure lesson, encountered again from a different angle: rather than choosing *between* two structures for one problem, this lesson shows two structures, built for different original purposes, *both* correctly solving an identical problem — worth checking against each other specifically because neither was designed with this exact use in mind.

### SE Lens

The alternative to deriving both is picking whichever tool feels more natural — traversal, since it's already familiar from Lesson 115 through 119 — without considering Union-Find as a real option. The real cost of that narrowing: Concept Unit 4's own real cost comparison would never get made, and a genuinely reasonable alternative would go unconsidered.

---

## Concept Unit 2: Why Both Approaches Produce the Identical Partition

### The Problem

Concept Unit 1 named two approaches. It's worth deriving, precisely, why they're guaranteed to agree — not merely hoping a real check confirms it by luck.

### No isolated lab for this step

This concept has no code of its own to isolate — the argument is stated directly below, and Concept Unit 3 checks its conclusion as real code.

### Reference Source

No reference counterpart — a from-scratch argument connecting Lesson 107 and 115's own already-established definitions.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Both Compute the Identical Equivalence Relation

Lesson 107 named equivalence classes precisely: reflexive, symmetric, transitive groupings. "Being connected" on an undirected graph is exactly such a relation — every vertex is connected to itself (reflexive), if `a` connects to `b` then `b` connects to `a` (symmetric, since the graph is undirected), and if `a` connects to `b` and `b` connects to `c`, a path exists from `a` to `c` through `b` (transitive). Both algorithms compute this identical equivalence relation: traversal, by directly finding every vertex reachable from a start; Union-Find, by directly merging every pair an edge connects, and — by transitivity, guaranteed by repeated merging — every pair connected through a longer chain of edges as well.

### Walkthrough

- **Connectivity named explicitly as an equivalence relation** — a direct citation of Lesson 107's own vocabulary, not a new concept.
- **Transitivity singled out as the reason Union-Find's edge-by-edge merging is sufficient** — the specific property guaranteeing indirect connections get captured too, not just direct edges.

### CS Lens

This is Lesson 17's own relation vocabulary, now shown load-bearing a second time in Era V (after Lesson 113's own graph-as-relation derivation): naming *which* properties a real, practical grouping problem satisfies is what licenses using either algorithm at all, and confirms in advance that they must agree.

### SE Lens

The alternative to deriving why both approaches must agree is simply running both and observing that they happen to, on the graphs tested. The real value of the derivation: it explains *why* the check in Concept Unit 3 is expected to pass, turning a hopeful test into a confirmed prediction — exactly Lesson 66's own "predict, then confirm" discipline.

---

## Concept Unit 3: Implementing Both, Checked Against Each Other

### The Problem

Concept Unit 2 argued both approaches must agree. It needs real code for both, and a real, direct comparison — not assuming the derivation alone is sufficient evidence.

### The New Code — Type It Yourself

```scheme
(define (components-via-traversal g)
  (let loop ((vs (graph-vertices g)) (visited '()) (comps '()))
    (if (null? vs) comps
        (if (member (car vs) visited)
            (loop (cdr vs) visited comps)
            (let ((comp (explore g (car vs) visited)))
              (loop (cdr vs) comp (cons (filter (lambda (x) (not (member x visited))) comp) comps)))))))
```

### Reference Source

Lesson 107's `make-uf`, `uf-find`, `uf-union!` (`FP-L107-union-find.md`, Concept Unit 3), quoted here unchanged; Lesson 115's `explore` (`FP-L115-traversing-structure.md`, Concept Unit 3), reused unchanged as this lesson's own traversal primitive.

### Files affected

Created: `components-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `components-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-vertices g) (car g))
(define (graph-edges g) (cdr g))
(define (graph-neighbors g a) (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define g (make-graph '(A B C D E F)
                       (list (cons 'A 'B) (cons 'B 'A) (cons 'B 'C) (cons 'C 'B) (cons 'D 'E) (cons 'E 'D))))

(define (explore g start visited-so-far)
  (let ((visited visited-so-far))
    (define (visit v) (if (not (member v visited)) (begin (set! visited (cons v visited)) (for-each visit (graph-neighbors g v)))))
    (visit start) visited))

(define (components-via-traversal g)                               ; ← new
  (let loop ((vs (graph-vertices g)) (visited '()) (comps '()))        ; ← new
    (if (null? vs) comps                                                  ; ← new
        (if (member (car vs) visited)                                        ; ← new
            (loop (cdr vs) visited comps)                                       ; ← new
            (let ((comp (explore g (car vs) visited)))                             ; ← new
              (loop (cdr vs) comp (cons (filter (lambda (x) (not (member x visited))) comp) comps))))))) ; ← new

(display "components via traversal: ") (display (components-via-traversal g)) (newline)

(define (make-uf n) (let ((p (make-vector n))) (let loop ((i 0)) (if (< i n) (begin (vector-set! p i i) (loop (+ i 1))))) p))
(define (uf-find p x) (let loop ((x x)) (if (= (vector-ref p x) x) x (loop (vector-ref p x)))))
(define (uf-union! p a b) (let ((ra (uf-find p a)) (rb (uf-find p b))) (if (not (= ra rb)) (vector-set! p ra rb))))

(define vlist '(A B C D E F))
(define (vidx v) (- (length vlist) (length (member v vlist))))
(define p (make-uf 6))
(for-each (lambda (e) (uf-union! p (vidx (car e)) (vidx (cdr e)))) (graph-edges g))
(define uf-groups (map (lambda (v) (cons v (uf-find p (vidx v)))) vlist))
(display "union-find groups (vertex . representative): ") (display uf-groups) (newline)

(define (same-partition? v1 v2 groups) (equal? (cdr (assoc v1 groups)) (cdr (assoc v2 groups))))
(display "A,B,C all same component? ") (display (and (same-partition? 'A 'B uf-groups) (same-partition? 'B 'C uf-groups))) (newline)
(display "A,D different components? ") (display (not (same-partition? 'A 'D uf-groups))) (newline)
(display "F its own component? ") (display (and (not (same-partition? 'F 'A uf-groups)) (not (same-partition? 'F 'D uf-groups)))) (newline)
```

`components-via-traversal` walks every vertex once; any not already visited becomes the start of a fresh `explore` call, and every vertex that call finds joins the current component. The Union-Find side processes every edge directly, unioning its two endpoints — `vidx` converts a symbolic vertex name into the numeric index Lesson 107's own array-backed structure requires.

### Mechanical Walkthrough

- **`(if (member (car vs) visited) (loop (cdr vs) visited comps) ...)`** — a reappearance of `member`, `if`; skips any vertex already claimed by an earlier component, ensuring every vertex belongs to exactly one.
- **`(explore g (car vs) visited)`** — a reappearance of `explore`, called with the *accumulated* visited set from every prior component, not a fresh one each time — the specific detail that keeps components from overlapping.
- **`(for-each (lambda (e) (uf-union! p (vidx (car e)) (vidx (cdr e)))) (graph-edges g))`** — a reappearance of `for-each`, `uf-union!`; every edge, processed once, directly executing Concept Unit 2's own claim that edge-by-edge merging captures the full transitive closure.
- **The real, exact agreement between traversal's three components and Union-Find's three real representative groups** — direct, checked confirmation of Concept Unit 2's own derived claim, not merely a matching count.

### CS Lens

This is Lesson 84's own "different representations, identical behavior" claim, checked here across two structures with genuinely different internal mechanisms and genuinely different original purposes — a stronger form of the check Lesson 114 performed for three representations of the identical graph, since here the two *algorithms* themselves, not just the storage, differ completely.

### SE Lens

The alternative to running both and comparing is trusting Concept Unit 2's derivation alone. The real value of the direct check: it catches an implementation bug in either algorithm that the derivation's own correct reasoning wouldn't reveal — a real distinction between "the idea is right" and "this specific code correctly executes it."

### Run It — Show the Real Output

```
$ guile components-check.scm
components via traversal: ((F) (E D) (C B A))
union-find groups (vertex . representative): ((A . 2) (B . 2) (C . 2) (D . 4) (E . 4) (F . 5))
A,B,C all same component? #t
A,D different components? #t
F its own component? #t
```

Verified this session — traversal finds exactly three real components, `{F}`, `{D, E}`, `{A, B, C}`; Union-Find's own real groups agree exactly — `A`, `B`, `C` all share representative `2`; `D` and `E` share `4`; `F` alone holds `5`. Two structurally unrelated algorithms, the identical real partition.

---

## Concept Unit 4: The Real, Measured Cost at Scale

### The Problem

Concept Unit 3 confirmed both approaches agree on a small graph. It's worth measuring their real cost at a scale large enough to be meaningful, rather than assuming one is obviously cheaper.

### The New Code — Type It Yourself

```scheme
(define (components-via-traversal-counted g)
  (let loop ((vs (graph-vertices g)) (visited '()) (n 0))
    (if (null? vs) n
        (if (member (car vs) visited) (loop (cdr vs) visited n)
            (loop (cdr vs) (explore-counted g (car vs) visited) (+ n 1))))))
```

### Reference Source

Concept Unit 3's own `explore`/`uf-union!`, instrumented here with real `set!`-based counters, the identical technique this Era has used since Lesson 92.

### Files affected

Modified: `components-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `components-check.scm`, extended with a real, `1,000`-vertex test: `500` disjoint pairs, each its own tiny component.

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define big-n 1000)
(define pair-edges (apply append (map (lambda (i) (list (cons (* i 2) (+ (* i 2) 1)) (cons (+ (* i 2) 1) (* i 2)))) (iota 500))))
(define big-g (make-graph (iota big-n) pair-edges))

(define trav-ops 0)                                                 ; ← new
(define (explore-counted g start visited-so-far)                        ; ← new
  (let ((visited visited-so-far))                                          ; ← new
    (define (visit v) (set! trav-ops (+ trav-ops 1))                          ; ← new
      (if (not (member v visited)) (begin (set! visited (cons v visited)) (for-each visit (graph-neighbors g v))))) ; ← new
    (visit start) visited))                                                                                            ; ← new
(define (components-via-traversal-counted g)                                                                              ; ← new
  (let loop ((vs (graph-vertices g)) (visited '()) (n 0))                                                                     ; ← new
    (if (null? vs) n                                                                                                             ; ← new
        (if (member (car vs) visited) (loop (cdr vs) visited n)                                                                     ; ← new
            (loop (cdr vs) (explore-counted g (car vs) visited) (+ n 1))))))                                                           ; ← new
(set! trav-ops 0)
(define n-comps-1 (components-via-traversal-counted big-g))
(display "traversal: found ") (display n-comps-1) (display " components, real total visit-ops=") (display trav-ops) (newline)

(define uf-ops 0)                                                    ; ← new
(define (uf-find-counted p x)                                           ; ← new
  (let loop ((x x)) (set! uf-ops (+ uf-ops 1)) (if (= (vector-ref p x) x) x (loop (vector-ref p x))))) ; ← new
(define (uf-union-counted! p a b)                                                                          ; ← new
  (let ((ra (uf-find-counted p a)) (rb (uf-find-counted p b))) (if (not (= ra rb)) (vector-set! p ra rb)))) ; ← new
(define big-p (make-uf big-n))
(set! uf-ops 0)
(for-each (lambda (e) (uf-union-counted! big-p (car e) (cdr e))) pair-edges)
(display "union-find: real total find-ops across ") (display (length pair-edges)) (display " union calls=") (display uf-ops) (newline)
```

### Mechanical Walkthrough

- **`(apply append (map (lambda (i) (list (cons ...) (cons ...))) (iota 500)))`** — a reappearance of `apply`, `append`, `map`; builds `500` genuinely disjoint pairs, each a separate, tiny component — deliberately chosen to make counting meaningful without needing a much larger, slower-to-verify graph.
- **`(set! trav-ops (+ trav-ops 1))`, placed at the very start of `visit`** — a reappearance of `set!`; counts every real call, whether or not the vertex turns out to be new.
- **The real, exact `1,500` total visit operations, and the real, exact `2,500` total find operations** — direct, measured confirmation that both real algorithms complete this task using an amount of work proportional to the graph's own size, not a fixed or exploding cost.

### CS Lens

This is Lesson 111's own real cost-comparison discipline, applied here to two algorithms rather than two data representations: correctness alone (Concept Unit 3) doesn't settle which is the better real engineering choice — that requires the real, measured numbers this unit provides.

### SE Lens

The alternative to measuring both is assuming Union-Find, already known for its own real efficiency (Lesson 108), must be the faster choice here too. The real, honest result: on this lesson's own small-component graph, both approaches land in the same real order of magnitude — `1,500` versus `2,500` — a reminder that a general efficiency reputation doesn't automatically transfer to every specific real workload without checking.

### Run It — Show the Real Output

```
$ guile components-check.scm
traversal: found 500 components, real total visit-ops=1500
union-find: real total find-ops across 1000 union calls=2500
```

Verified this session — both real algorithms correctly find all `500` components on a `1,000`-vertex graph, at real, comparable cost: `1,500` total visit operations for traversal, `2,500` total find operations for Union-Find (across `1,000` real union calls, since each of the `500` pairs contributes two directed edge entries) — genuinely close, honest evidence that neither approach dominates the other on this specific graph shape.

---

## Closing

### Connect the pieces

Six vertices, three components, two algorithms, checked and measured:

1. **The extension, named (Unit 1):** from "reachable from one vertex" to "the whole graph's natural pieces" — two real approaches proposed.
2. **Why they must agree, derived (Unit 2):** connectivity is an equivalence relation (Lesson 107's own vocabulary), and both algorithms compute the identical one.
3. **Both implemented and directly checked (Unit 3):** the identical real partition, `{F}`, `{D, E}`, `{A, B, C}`, from two structurally unrelated algorithms.
4. **The real, measured cost, honestly comparable (Unit 4):** `1,500` versus `2,500`, on a `1,000`-vertex graph — no dramatic winner, a real, checked result rather than an assumed one.

Every claim in this lesson traces to real, executed code: two independently-built algorithms checked against each other for correctness, and a real cost measurement at meaningful scale.

### What breaks without this

Suppose a real system needed to identify isolated clusters in a social network — which users can reach which others, at all — and an engineer, familiar only with Union-Find from Lesson 107/108, never considered that Lesson 115's own traversal could answer the identical question just as validly. This lesson's own real evidence — both approaches producing the identical partition — is what would let that engineer choose based on real, other constraints (whether the graph is already stored as an edge stream, favoring Union-Find; or already reachable via neighbor queries, favoring traversal) rather than defaulting to whichever tool happened to be most recently learned.

### Exercises

1. **Observe.** Before checking, predict whether `components-via-traversal`'s real cost would change meaningfully if this lesson's `500`-pair graph were replaced by one giant, single connected component of the identical `1,000` vertices, using this lesson's own reasoning about `explore`'s per-vertex cost to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Measure both algorithms' real cost on a `1,000`-vertex graph shaped as one long chain instead of `500` disjoint pairs, and compare against this lesson's own numbers.
4. **Explain.** In your own words, explain why `components-via-traversal` passes the *accumulated* visited set into each new `explore` call rather than starting fresh each time, referencing what would go wrong if it didn't.
5. **Explain.** Using Lesson 111's own four-step decision procedure, state one real, concrete scenario where Union-Find would be the clearly preferable choice over traversal for computing components, and one where the reverse is true.

### Definition of done

- [ ] You can state why connectivity is an equivalence relation, and name its reflexive, symmetric, and transitive properties for a real graph.
- [ ] You can explain why traversal and Union-Find are guaranteed to produce the identical partition, not merely observed to.
- [ ] You can point to this lesson's own real `1,500`-versus-`2,500` numbers as honest, checked evidence neither approach dominates on every graph shape.
- [ ] You completed Exercises 1–5, including a real cost comparison on a differently-shaped graph.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
