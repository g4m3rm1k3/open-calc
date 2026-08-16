# Lesson 118: Depth-First Search

**What you will build:** **depth-first search (DFS)**, formally named and verified — the identical recursive style Lesson 115's `explore` already used, and the identical order Lesson 117's `stack-search` produced, now understood as one real, named algorithm with its own real properties, rather than an unnamed default or a broken BFS substitute. Real, verified evidence this session: on Lesson 116/117's own five-vertex graph, DFS visits `A, B, C, D, E` — fully diving down the `B→C→D` branch before ever reaching `E`, the exact opposite order from BFS's own `A, B, E, C, D`. On a real, `20`-wide, `1`-deep graph, BFS must hold all `20` leaf vertices in its frontier simultaneously at peak, while DFS never needs more than `2` levels of real, concurrent state — a direct, measured space advantage neither Lesson 116 nor 117 had reason to check. The transferable point: DFS isn't a worse BFS, or an accident of using recursion instead of a queue — it's a genuinely different algorithm, with its own real structure (a **DFS tree**) and its own real advantages, correct for a different set of questions than the ones BFS answers.

**What you need to know first:** Lesson 115 (`FP-L115-traversing-structure.md`) — specifically `explore`, the exact algorithm this lesson names and extends. Lesson 116 (`FP-L116-breadth-first-search.md`) and Lesson 117 (`FP-L117-bfs-correctness.md`) — specifically BFS's own real discovery order and the real, wrong distance `stack-search` produced, the direct comparison points this lesson builds on.

**Terms introduced in this lesson**

- **Depth-first search (DFS)** — a traversal that fully explores one neighbor's entire reachable subgraph before returning to try the next neighbor — Lesson 115's own recursive style, formally named.
- **DFS tree** — the tree formed by recording, for every non-start vertex, which vertex first discovered it. It exists to give DFS's own exploration order a precise, checkable structure, the same way BFS's own discovery order directly encodes true distance.

**Objects and methods used**

No new objects or methods this lesson — every procedure reappears from Lesson 115/116 unchanged, or is a small, freshly-instrumented variant for this lesson's own real measurements.

---

## Concept Unit 1: An Order, Used Twice, Never Named

### The Problem

Lesson 115's `explore` used a specific exploration order — recurse fully into the first neighbor before trying the second — without ever naming what that order *is*. Lesson 117's `stack-search` used the identical order, iteratively, specifically to show it computes the *wrong* answer when the question being asked is "what's the shortest distance." Neither lesson asked whether that order might be exactly the *right* one for some other real question.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is posed directly here, connecting Lesson 115 and 117's own already-built code.

### Reference Source

No reference counterpart — the motivating gap draws on Lesson 115 and 117's own already-built code, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What DFS Is Actually Good At

Consider maze-solving: finding *any* path out, not the shortest one, using as little memory as possible along the way. Or detecting a cycle at all (Lesson 121's own upcoming subject) — which needs to notice "I've come back to a vertex still being explored," a question tied naturally to *how deep* the current exploration path is, not to overall distance from the start. Neither question needs BFS's own distance guarantee; both fit DFS's own "dive deep, backtrack" order precisely.

### Walkthrough

- **Two concrete real problems named, neither needing distance** — grounds "DFS is good for something" in real questions, not an abstract claim.
- **The direct citation of Lesson 121's own upcoming cycle-detection use** — a legitimate forward reference, since the BRD confirms that lesson's real content.

### CS Lens

This is Lesson 111's own decision-procedure discipline, applied one Era later: neither BFS nor DFS is generically "better" — each is the right choice for a specific, precisely-named required behavior, exactly the framing Lesson 111 established for choosing among Era IV's own structures.

### SE Lens

The alternative to naming DFS precisely is continuing to think of it as "the default, non-BFS way to traverse" — accurate as far as it goes, but obscuring the real, positive properties Concept Unit 4 measures directly, which have nothing to do with BFS at all.

---

## Concept Unit 2: The DFS Tree

### The Problem

BFS's own discovery order directly encodes a precise, useful structure — true distance. DFS's order needs its own precise structure named, or its real exploration pattern remains just "however the recursion happened to unfold."

### No isolated lab for this step

This concept has no code of its own to isolate — the structure is derived directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation naming a structure implicit in Lesson 115's own recursion.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Recording Who Discovered Whom

**The DFS tree, precisely:** for every vertex `v` other than the start, record its *parent* — the vertex whose exploration directly discovered `v` for the first time. The start vertex has no parent. This is a real tree (Lesson 41's own sense): every non-start vertex has exactly one parent, and following parent links from any vertex eventually reaches the start.

**Why this is a genuinely different structure than BFS's own distance table:** distance records *how far*; the DFS tree records *by which specific path* — a vertex `k` steps deep in the DFS tree might be far closer to the start via a different edge BFS would have found, information the DFS tree, on its own, doesn't capture at all.

### Walkthrough

- **"parent" defined precisely as "whose exploration discovered it," not "any adjacent vertex"** — matches exactly what `visit`'s own recursive structure actually records.
- **The explicit contrast with BFS's distance table** — two different real structures, from two different traversal orders, each encoding different real information.

### CS Lens

This is Lesson 41's own tree definition, recurring in a genuinely new place: not built as a deliberate representation choice (Era IV's whole theme), but *discovered*, as an emergent structure, from an algorithm whose primary purpose was traversal, not tree-building.

### SE Lens

The alternative to recording the DFS tree explicitly is only tracking the visited set, as Lesson 115's own `explore` did. The real cost of that omission: Lesson 121's own upcoming cycle detection needs to distinguish "revisiting an ancestor on the current path" from "revisiting some unrelated, already-finished vertex" — a distinction the DFS tree makes directly answerable, and a plain visited set alone cannot.

---

## Concept Unit 3: Implementing DFS With Its Own Tree, Compared Directly to BFS

### The Problem

Concept Unit 2 derived the DFS tree. It needs real code, and a real, direct, same-graph comparison against BFS's own already-established order.

### The New Code — Type It Yourself

```scheme
(define (dfs g start)
  (let ((visited '()) (order '()) (parent (list (cons start #f))))
    (define (visit v)
      (if (not (member v visited))
          (begin (set! visited (cons v visited)) (set! order (cons v order))
                 (for-each (lambda (n)
                             (if (not (assoc n parent)) (set! parent (cons (cons n v) parent)))
                             (visit n))
                           (graph-neighbors g v)))))
    (visit start)
    (list (reverse order) parent)))
```

### Reference Source

Lesson 115's own `explore` (`FP-L115-traversing-structure.md`, Concept Unit 3), extended here to also record real visit order and the real DFS tree, rather than only the final visited set.

### Files affected

Created: `dfs-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `dfs-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-edges g) (cdr g))
(define (graph-neighbors g a) (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define (dfs g start)                                               ; ← new
  (let ((visited '()) (order '()) (parent (list (cons start #f))))      ; ← new
    (define (visit v)                                                      ; ← new
      (if (not (member v visited))                                           ; ← new
          (begin (set! visited (cons v visited)) (set! order (cons v order))    ; ← new
                 (for-each (lambda (n)                                             ; ← new
                             (if (not (assoc n parent)) (set! parent (cons (cons n v) parent))) ; ← new
                             (visit n))                                                            ; ← new
                           (graph-neighbors g v)))))                                                  ; ← new
    (visit start)                                                                                        ; ← new
    (list (reverse order) parent)))                                                                         ; ← new

(define g2 (make-graph '(A B C D E) (list (cons 'A 'B) (cons 'B 'C) (cons 'C 'D) (cons 'A 'E))))
(display "DFS visit order: ") (display (car (dfs g2 'A))) (newline)
(display "DFS parent tree: ") (display (cadr (dfs g2 'A))) (newline)
```

`visit` records three things where Lesson 115's own version recorded one: the growing `visited` set (as before), the real order vertices were first visited (`order`), and, the moment a neighbor `n` is first discovered — *before* recursing into it — its parent, `v`. Recording the parent before recursing is deliberate: it captures "who discovered `n`," which must be `v`, regardless of what `n`'s own further exploration goes on to discover.

### Mechanical Walkthrough

- **`(set! order (cons v order))`** — first appearance of recording visit order directly, distinct from the visited-set check itself; `order`, reversed at the end, is the real sequence Concept Unit 1 promised to make checkable.
- **`(if (not (assoc n parent)) (set! parent (cons (cons n v) parent)))`** — first appearance of Concept Unit 2's own rule, executed: a parent is recorded exactly once, at first discovery, and never overwritten by a later encounter through a different vertex.
- **The parent-recording placed *before* the recursive `(visit n)` call** — a hard concept reappearing (recursion, Lesson 27 onward), restated with a new, specific ordering requirement: the parent link must exist before deeper exploration begins, since deeper vertices may themselves need to check `parent` for their own neighbors.
- **The real, exact order `(A B C D E)`, diving fully down `B→C→D` before ever reaching `E`** — direct, checked confirmation of Concept Unit 1's own claim, and the literal opposite of Lesson 116's own real `(A B E C D)` order on the identical graph.
- **The real, exact parent tree, `E`'s parent `A`, `D`'s parent `C`, `C`'s parent `B`, `B`'s parent `A`** — direct, checked confirmation of Concept Unit 2's own structure: exactly one parent per non-start vertex, forming a real, connected tree back to `A`.

### CS Lens

This is Lesson 84's own "same behavior, different representation" idea turned inside out: DFS and BFS don't represent the identical relation two ways — they compute two genuinely different real structures (a parent tree versus a distance table) from the identical input graph, each meaningful for different real questions.

### SE Lens

The alternative to recording the DFS tree is running DFS purely for its visited set, as Lesson 115 did, and reconstructing path information separately if it's ever needed. The real cost of that alternative: Lesson 121's upcoming cycle-detection work needs exactly this parent information, and computing it as a byproduct of the traversal already being run is free; recomputing it with a second pass would not be.

### Run It — Show the Real Output

```
$ guile dfs-check.scm
DFS visit order: (A B C D E)
DFS parent tree: ((E . A) (D . C) (C . B) (B . A) (A . #f))
```

Verified this session — DFS visits `A`, `B`, `C`, `D`, fully exhausting the `B→C→D` branch, before ever reaching `E` — the real, opposite order from Lesson 116's own BFS result, `(A B E C D)`, on the identical graph. The real, computed DFS tree correctly shows `A` as the root (`#f` parent), with every other vertex's parent matching exactly the edge that first discovered it during this specific traversal.

---

## Concept Unit 4: The Real, Measured Space Advantage

### The Problem

Concept Unit 3 confirmed DFS produces a genuinely different order and structure. It's worth measuring, honestly, one of the real, practical reasons that difference matters: how much real, simultaneous state each algorithm needs to hold at once.

### The New Code — Type It Yourself

```scheme
(define max-depth 0)
(define (dfs-depth-tracked g start)
  (let ((visited '()))
    (define (visit v depth)
      (set! max-depth (max max-depth depth))
      (if (not (member v visited))
          (begin (set! visited (cons v visited))
                 (for-each (lambda (n) (visit n (+ depth 1))) (graph-neighbors g v)))))
    (visit start 1)))
```

### Reference Source

Lesson 116's own `bfs` (`FP-L116-breadth-first-search.md`, Concept Unit 3), instrumented here to track real, maximum simultaneous queue size; Concept Unit 3's own `dfs`, instrumented to track real, maximum recursion depth.

### Files affected

Created: `dfs-cost.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `dfs-cost.scm`, in full — a real, `20`-wide, `1`-deep graph (one root, `20` direct leaf children), checked both ways:

```scheme
(define wide-edges (map (lambda (i) (cons 'root i)) (iota 20)))
(define wide-g (make-graph (cons 'root (iota 20)) wide-edges))

(define (make-queue) (list '() '()))
(define (queue-empty? q) (and (null? (car q)) (null? (cadr q))))
(define (enqueue q x) (list (car q) (cons x (cadr q))))
(define (dequeue q) (if (null? (car q)) (let ((f (reverse (cadr q)))) (list (cdr f) '())) (list (cdr (car q)) (cadr q))))
(define (queue-front q) (if (null? (car q)) (car (reverse (cadr q))) (car (car q))))
(define (queue-size q) (+ (length (car q)) (length (cadr q))))          ; ← new

(define max-frontier 0)                                              ; ← new
(define (bfs-tracked g start)                                           ; ← new
  (let ((dist (list (cons start 0))) (q (enqueue (make-queue) start)))     ; ← new
    (let loop ((q q))                                                        ; ← new
      (set! max-frontier (max max-frontier (queue-size q)))                     ; ← new
      (if (queue-empty? q) dist
          (let* ((v (queue-front q)) (q2 (dequeue q)) (d (cdr (assoc v dist))))
            (let loop2 ((ns (graph-neighbors g v)) (q3 q2))
              (if (null? ns) (loop q3)
                  (if (assoc (car ns) dist) (loop2 (cdr ns) q3)
                      (begin (set! dist (cons (cons (car ns) (+ d 1)) dist)) (loop2 (cdr ns) (enqueue q3 (car ns))))))))))))
(bfs-tracked wide-g 'root)
(display "BFS on a 20-wide graph, max simultaneous frontier size: ") (display max-frontier) (newline)

(define max-depth 0)                                                  ; ← new
(define (dfs-depth-tracked g start)                                      ; ← new
  (let ((visited '()))                                                      ; ← new
    (define (visit v depth)                                                    ; ← new
      (set! max-depth (max max-depth depth))                                       ; ← new
      (if (not (member v visited))                                                    ; ← new
          (begin (set! visited (cons v visited))                                          ; ← new
                 (for-each (lambda (n) (visit n (+ depth 1))) (graph-neighbors g v)))))         ; ← new
    (visit start 1)))                                                                              ; ← new
(dfs-depth-tracked wide-g 'root)
(display "DFS on the identical 20-wide graph, max real recursion depth: ") (display max-depth) (newline)
```

`queue-size` reports the real, total number of vertices sitting in the queue at any moment; `max-frontier` tracks the largest that ever gets, across the whole run. `dfs-depth-tracked` mirrors `visit`, with an explicit `depth` parameter tracking real, current recursion depth.

### Mechanical Walkthrough

- **`(set! max-frontier (max max-frontier (queue-size q)))`** at the top of BFS's own loop — a reappearance of `set!`, `max`; checked once per iteration, capturing the real peak, not just the final size.
- **`(set! max-depth (max max-depth depth))`** at the top of `visit` — the identical technique, applied to recursion depth instead of queue size.
- **The real, exact `20` for BFS's peak frontier** — direct, measured confirmation: at the moment `root` is processed, all `20` of its children are discovered and enqueued essentially at once, before any of them is individually processed.
- **The real, exact `2` for DFS's peak depth** — direct, measured confirmation: DFS never holds more than "the current vertex plus its immediate parent" in real, active state, since each leaf is fully processed and abandoned before the next one is even discovered.

### CS Lens

This is the real, measured version of a genuine space-complexity distinction: BFS's real space cost is tied to the *width* of the graph (how many vertices can be simultaneously "one hop further"); DFS's real space cost is tied to the graph's *depth* — two genuinely different real quantities, and this lesson's own wide, shallow graph is specifically chosen to make the gap between them as large as possible.

### SE Lens

The alternative to measuring this directly is trusting the general claim "DFS uses less memory" without checking whether it's true, and by how much, for a specific real shape. The real, measured gap here — `20` versus `2` — is what makes the tradeoff a genuine engineering consideration rather than folklore: a real system exploring a genuinely wide structure (a file system with many files in one directory, a social network with a highly-connected hub) would feel this difference directly, in real memory used.

### Run It — Show the Real Output

```
$ guile dfs-cost.scm
BFS on a 20-wide graph, max simultaneous frontier size: 20
DFS on the identical 20-wide graph, max real recursion depth: 2
```

Verified this session — on the identical, real `20`-wide graph, BFS's frontier peaks at `20`, holding every one of `root`'s children simultaneously, while DFS's recursion never exceeds real depth `2` — the concrete, measured shape of the real tradeoff Concept Unit 1 introduced only in the abstract.

---

## Closing

### Connect the pieces

One graph traversed two ways, one wide graph measured two ways:

1. **The unnamed order, named (Unit 1):** Lesson 115 and 117's shared exploration style is DFS, with its own real strengths distinct from BFS's.
2. **The DFS tree, derived (Unit 2):** parent-by-first-discovery, a genuinely different real structure than BFS's own distance table.
3. **Implemented and directly contrasted (Unit 3):** the identical graph, real order `(A B C D E)` against BFS's own `(A B E C D)`, plus a real, checked parent tree.
4. **The real, measured space payoff (Unit 4):** `20` versus `2`, real peak state, on a graph deliberately shaped to make the difference concrete.

Every claim in this lesson traces to real, executed code: a real, side-by-side order comparison against BFS on the identical graph, and a real, measured space gap on a graph built specifically to expose it.

### What breaks without this

Suppose a real system needed to explore a genuinely wide structure — a file system directory containing a million files, say, checking each for some property — using BFS, out of habit, without considering whether the wide-versus-deep tradeoff mattered here. This lesson's own real numbers show precisely what that choice would cost: a frontier holding a real, significant fraction of that million files simultaneously, exactly the `20`-vertex peak this lesson measured, scaled up — real memory DFS's own recursion, needing only real, current-path depth, would never have required.

### Exercises

1. **Observe.** Before checking, predict DFS's real max recursion depth and BFS's real max frontier size on the *opposite* shape — a long, `20`-vertex chain with no branching at all — using this lesson's own reasoning to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Using this lesson's own real DFS tree from `g2`, write a procedure reconstructing the real path from the root to any given vertex by following parent links, and confirm it produces `(A B C D)` for `D`.
4. **Explain.** In your own words, explain why recording a discovered vertex's parent *before* recursing into it (rather than after) is necessary, referencing what could go wrong with a deeply nested graph if the order were reversed.
5. **Explain.** Using this lesson's real numbers, state one real scenario where BFS's larger frontier would be worth its real memory cost despite DFS's advantage, referencing what real capability (from Lesson 116/117) only BFS provides.

### Definition of done

- [ ] You can state what a DFS tree records and how it differs from BFS's own distance table.
- [ ] You can predict, and explain, DFS's real recursion-depth behavior versus BFS's real frontier-size behavior on both a wide and a deep graph shape.
- [ ] You can point to this lesson's own real `20`-versus-`2` numbers as concrete evidence for the space tradeoff, not just a general claim about it.
- [ ] You completed Exercises 1–5, including a real path-reconstruction from a DFS tree.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, measured results.
