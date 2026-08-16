# Lesson 119: DFS State

**What you will build:** real, three-state coloring for DFS — **white** (undiscovered), **gray** (actively being explored, still on the current path), **black** (fully finished) — plus real discovery and finish timestamps, precisely distinguishing a real cycle from mere path convergence. Real, verified evidence this session: on a graph containing a real cycle (`A→B→C→A`, plus `C→D`), DFS correctly identifies exactly one **back edge**, `C→A` — an edge to a vertex still *gray* at the moment it's encountered, real proof of the cycle. The identical algorithm run on an acyclic version of the same graph finds zero back edges. A real, exhaustive check of every one of the four vertices' `[discovery, finish]` time intervals confirms the **parenthesis property** holds for every single pair: any two intervals are either completely nested or completely disjoint, never partially overlapping. The transferable point: Lesson 118's visited set could tell "seen before" from "never seen" — it could not tell "still actively being explored" from "long since finished," and that distinction is exactly what Lesson 121's own upcoming cycle detection depends on.

**What you need to know first:** Lesson 118 (`FP-L118-depth-first-search.md`) — specifically DFS's own recursive structure and parent-tracking, extended here rather than replaced.

**Terms introduced in this lesson**

- **White / gray / black (DFS coloring)** — three states a vertex can be in during DFS: white (not yet discovered), gray (discovered, currently on the path from the start to whatever's actively being explored), black (fully finished — every one of its own descendants has also finished). It exists to distinguish "on the current path right now" from "already completely done," a distinction Lesson 118's plain visited set could not make.
- **Discovery time / finish time** — the real step count at which a vertex turns gray (discovery) and at which it turns black (finish). They exist to give DFS's own timing a precise, comparable number, rather than only a relative visit order.
- **Back edge** — an edge from the vertex currently being explored to a vertex that is still gray. It exists because encountering a gray vertex means reaching back to something still on the current exploration path — the precise, checkable signature of a real cycle.
- **Parenthesis property** — for any two vertices, their `[discovery, finish]` intervals are either fully nested (one entirely inside the other) or fully disjoint (no overlap at all) — never partially overlapping. It exists as a real, checkable consequence of DFS's own recursive structure, worth confirming directly rather than assuming.

**Objects and methods used**

No new objects or methods this lesson — `cons`, `assoc`, `for-each`, `eq?` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: A Distinction the Visited Set Cannot Make

### The Problem

Lesson 118's `visited` set answers one question: has this vertex been seen before, yes or no. It cannot answer a genuinely different, real question: is this vertex *still* being actively explored right now — still sitting somewhere on the current chain of recursive calls — or has it, and everything reachable from it, already been completely finished? An edge pointing back to a vertex still mid-exploration means something entirely different from an edge pointing to a vertex finished long ago.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap is posed directly here, extending Lesson 118's own `visited`/`parent` machinery.

### Reference Source

No reference counterpart — the motivating gap draws on Lesson 118's own already-built code, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Why "Already Visited" Alone Can Mean Two Different Things

Consider DFS exploring `A→B→C`, with `C` also connected back to `A`. At the moment `C`'s edge to `A` is examined, `A` has already been visited — but `A` is also still actively on the current path (its own recursive call hasn't returned yet). That's a real cycle. Contrast a *different* graph, `A→B`, `A→C`, `B→D`, `C→D`: when `C`'s edge to `D` is examined, `D` may already be visited (discovered earlier, through `B`) — but `D` is fully finished, no longer on any active path. That's not a cycle at all, just two paths converging on the same vertex.

### Walkthrough

- **Two concrete, contrasting real examples, both involving "already visited"** — makes the real distinction checkable rather than only described.
- **"still on the current path" versus "finished, no longer active"** — the exact two states Concept Unit 2 names precisely.

### CS Lens

This is the identical distinction Lesson 89's own Queue/Stack contrast drew at a smaller scale, now applied to an entire vertex's lifecycle: a stack of currently-active recursive calls (gray vertices) versus everything that's already been fully resolved (black vertices) — DFS's own call stack, made visible as real, inspectable state.

### SE Lens

The alternative to tracking this distinction is treating every "already visited" encounter identically, the way Lesson 118's own `visited` set did. The real cost of that alternative, made concrete in Concept Unit 3: cycle detection (Lesson 121's own upcoming subject) would be unable to tell a real cycle apart from harmless path convergence, without this lesson's own finer-grained state.

---

## Concept Unit 2: Deriving Colors, Timestamps, and Back Edges

### The Problem

Concept Unit 1 named the missing distinction. It needs a precise, three-way state and a real, countable notion of timing.

### No isolated lab for this step

This concept has no code of its own to isolate — the states and their meaning are derived directly below, and Concept Unit 3 implements and checks them as real code.

### Reference Source

No reference counterpart — a from-scratch derivation extending Lesson 118's own DFS structure.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Three States, Two Timestamps, One New Edge Category

**White:** not yet discovered — Lesson 118's own "not in `visited`." **Gray:** discovered, and still actively on the path — assigned the moment a vertex is first reached, turned back to another color only once every one of its own neighbors has been fully processed. **Black:** fully finished — every descendant has also finished; assigned the moment a vertex's own exploration completes and control returns to its parent.

**Discovery time and finish time:** a single, ever-increasing counter, advanced by one at every discovery *and* every finish. A vertex's own `[discovery, finish]` interval, read this way, directly encodes "the entire span of real steps during which this vertex was gray."

**Back edge, precisely:** an edge examined while its destination is currently gray. This is exactly Concept Unit 1's own "reaching back to something still active" — and, in a directed graph, exactly the signature of a real cycle: a path from the destination back to the source already exists (since the destination is gray, meaning it's an ancestor on the current path), and the edge itself closes the loop.

### Walkthrough

- **Gray defined as "on the path," not merely "visited"** — the precise upgrade over Lesson 118's own binary state.
- **The single shared counter for both discovery and finish** — what makes the parenthesis property (Concept Unit 4) a real, checkable consequence rather than a coincidence.
- **Back edge tied directly to "gray," not "already visited"** — the exact fix for Concept Unit 1's own named gap.

### CS Lens

This is Lesson 46's own recursive-invariant discipline, applied to *timing* specifically: a vertex's own interval is entirely determined by when its recursive call begins and ends — real, inspectable proof that DFS's exploration order has a precise, nested structure, not just an informal "depth-first feel."

### SE Lens

The alternative to tracking real timestamps is tracking only the three colors, discarding timing information once a vertex turns black. The real cost of that alternative: the parenthesis property, and later algorithms (topological ordering, Lesson 122, depends directly on finish-time order) would have nothing precise to check or sort by — colors alone answer "what state," timestamps answer "in what order, precisely."

---

## Concept Unit 3: Implementing and Verifying Colored DFS

### The Problem

Concept Unit 2 derived the mechanism. It needs real code, and a real, direct check that back edges correctly appear exactly when a cycle genuinely exists, and nowhere else.

### The New Code — Type It Yourself

```scheme
(cond
  ((eq? c 'white)
   (set! color (cons (cons n 'gray) color))
   (set! time (+ time 1)) (set! disc (cons (cons n time) disc))
   (set! parent (cons (cons n v) parent))
   (visit n)
   (set! color (cons (cons n 'black) color))
   (set! time (+ time 1)) (set! fin (cons (cons n time) fin)))
  ((eq? c 'gray)
   (set! back-edges (cons (cons v n) back-edges)))
  (else 'nothing))
```

### Reference Source

Lesson 118's own `dfs` (`FP-L118-depth-first-search.md`, Concept Unit 3), extended here with real color tracking, timestamps, and back-edge detection, rather than only a visited set and parent tree.

### Files affected

Created: `dfsstate-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `dfsstate-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-edges g) (cdr g))
(define (graph-neighbors g a) (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define time 0)                                                     ; ← new
(define (dfs-colored g start)                                          ; ← new
  (let ((color (list (cons start 'gray))) (disc (list)) (fin (list)) (parent (list (cons start #f))) (back-edges '())) ; ← new
    (set! time (+ time 1))                                                  ; ← new
    (set! disc (cons (cons start time) disc))                                  ; ← new
    (define (visit v)                                                            ; ← new
      (for-each                                                                     ; ← new
       (lambda (n)                                                                     ; ← new
         (let ((c (cdr (or (assoc n color) (cons n 'white)))))                            ; ← new
           (cond                                                                            ; ← new
             ((eq? c 'white)                                                                   ; ← new
              (set! color (cons (cons n 'gray) color))                                            ; ← new
              (set! time (+ time 1)) (set! disc (cons (cons n time) disc))                            ; ← new
              (set! parent (cons (cons n v) parent))                                                     ; ← new
              (visit n)                                                                                    ; ← new
              (set! color (cons (cons n 'black) color))                                                       ; ← new
              (set! time (+ time 1)) (set! fin (cons (cons n time) fin)))                                        ; ← new
             ((eq? c 'gray)                                                                                         ; ← new
              (set! back-edges (cons (cons v n) back-edges)))                                                          ; ← new
             (else 'nothing))))                                                                                           ; ← new
       (graph-neighbors g v)))                                                                                               ; ← new
    (visit start)                                                                                                               ; ← new
    (set! color (cons (cons start 'black) color))                                                                                  ; ← new
    (set! time (+ time 1)) (set! fin (cons (cons start time) fin))                                                                    ; ← new
    (list disc fin back-edges)))                                                                                                          ; ← new

(define gcyc (make-graph '(A B C D) (list (cons 'A 'B) (cons 'B 'C) (cons 'C 'A) (cons 'C 'D))))
(set! time 0)
(define result (dfs-colored gcyc 'A))
(display "discovery times: ") (display (car result)) (newline)
(display "finish times: ") (display (cadr result)) (newline)
(display "back edges (real cycle evidence): ") (display (caddr result)) (newline)

(define gacyc (make-graph '(A B C D) (list (cons 'A 'B) (cons 'B 'C) (cons 'C 'D))))
(set! time 0)
(define result2 (dfs-colored gacyc 'A))
(display "acyclic graph, back edges: ") (display (caddr result2)) (newline)
```

`(cdr (or (assoc n color) (cons n 'white)))` reads a vertex's current color, defaulting to `'white` for any vertex not yet in the `color` table at all — the initial state Concept Unit 2 named but never needs an explicit entry for. The three-branch `cond` is Concept Unit 2's own three states, executed directly: white triggers full discovery, recursion, and finishing; gray triggers back-edge recording; black (`else`) does nothing at all, since a black vertex is already fully resolved.

### Mechanical Walkthrough

- **`(cdr (or (assoc n color) (cons n 'white)))`** — a reappearance of `assoc`, `or`, `cons`; a real, working default-value idiom, first appearance of `or` used specifically to supply a fallback rather than to combine boolean conditions.
- **`(set! time (+ time 1))`, appearing at both discovery and finish** — a reappearance of `set!`; the single shared counter Concept Unit 2 specified, advanced identically at both events.
- **`(set! back-edges (cons (cons v n) back-edges))`** — first appearance of recording an edge (not a vertex) as data; captures exactly which edge closed a cycle, not merely that one exists.
- **The real, exact single back edge, `(C . A)`, on the cyclic graph, and the real, exact empty list on the acyclic one** — direct, checked confirmation of Concept Unit 2's own claim: back edges appear exactly where a real cycle exists, and nowhere else.

### CS Lens

This is Lesson 98's own invariant-checking discipline, applied to a genuinely new invariant: "a back edge exists if and only if a cycle exists" is exactly the kind of claim that could plausibly hold on the one example checked and fail elsewhere — checking it on both a cyclic *and* an acyclic version of the same graph, as this unit does, is what makes the claim checked rather than merely illustrated.

### SE Lens

The alternative to checking both a cyclic and an acyclic graph is checking only the cyclic one and confirming a back edge appears. The real gap that alone would leave open: a broken implementation reporting a "back edge" on *every* traversal, cycle or not, would pass that single check completely — only the acyclic graph's real, empty result rules that out.

### Run It — Show the Real Output

```
$ guile dfsstate-check.scm
discovery times: ((D . 4) (C . 3) (B . 2) (A . 1))
finish times: ((A . 8) (B . 7) (C . 6) (D . 5))
back edges (real cycle evidence): ((C . A))
acyclic graph, back edges: ()
```

Verified this session — real discovery order `A, B, C, D` (times `1` through `4`), and real finish order `D, C, B, A` (times `5` through `8`), exactly the reverse — `D`, discovered last, finishes first, since it has no further neighbors to explore. Exactly one real back edge, `C→A`, is detected on the cyclic graph — the literal edge closing the real cycle — and zero back edges on the acyclic version of the identical vertex set.

---

## Concept Unit 4: Verifying the Parenthesis Property Directly

### The Problem

Concept Unit 2 claimed discovery/finish intervals are always either nested or disjoint. It's worth checking that claim directly, exhaustively, against this lesson's own real timestamps — not trusting it from the derivation alone.

### The New Code — Type It Yourself

```scheme
(define (nested-or-disjoint? iv1 iv2)
  (or (< (cdr iv1) (car iv2))
      (< (cdr iv2) (car iv1))
      (and (< (car iv1) (car iv2)) (> (cdr iv1) (cdr iv2)))
      (and (< (car iv2) (car iv1)) (> (cdr iv2) (cdr iv1)))))
```

### Reference Source

No reference counterpart — a from-scratch check of Concept Unit 2's own derived claim, against Concept Unit 3's own real, computed timestamps.

### Files affected

Modified: `dfsstate-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `dfsstate-check.scm`, with Concept Unit 3's own file extended by a real, exhaustive check:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define (interval v disc fin) (cons (cdr (assoc v disc)) (cdr (assoc v fin))))  ; ← new
(define (nested-or-disjoint? iv1 iv2)                                             ; ← new
  (or (< (cdr iv1) (car iv2))                                                        ; ← new
      (< (cdr iv2) (car iv1))                                                           ; ← new
      (and (< (car iv1) (car iv2)) (> (cdr iv1) (cdr iv2)))                                ; ← new
      (and (< (car iv2) (car iv1)) (> (cdr iv2) (cdr iv1)))))                                 ; ← new

(define vs '(A B C D))
(define disc (car result)) (define fin (cadr result))
(define all-ok #t)                                                                                  ; ← new
(for-each (lambda (u)                                                                                  ; ← new
            (for-each (lambda (v)                                                                         ; ← new
                        (if (not (equal? u v))                                                               ; ← new
                            (if (not (nested-or-disjoint? (interval u disc fin) (interval v disc fin)))         ; ← new
                                (begin (set! all-ok #f) (display "VIOLATION: ") (display u) (display " ") (display v) (newline))))) ; ← new
                      vs))                                                                                                                ; ← new
          vs)                                                                                                                                ; ← new
(display "parenthesis property holds for every pair? ") (display all-ok) (newline)
```

`nested-or-disjoint?` checks all four ways two real intervals can relate without partially overlapping: entirely before, entirely after, the first strictly containing the second, or the second strictly containing the first. The nested double `for-each` checks every one of the `4 × 3 = 12` ordered pairs of distinct vertices, not a hand-picked sample.

### Mechanical Walkthrough

- **`(< (cdr iv1) (car iv2))`, `(< (cdr iv2) (car iv1))`** — a reappearance of `<`; the two "entirely disjoint" cases, one interval finishing before the other even begins.
- **`(and (< (car iv1) (car iv2)) (> (cdr iv1) (cdr iv2)))`** — a reappearance of `and`, `<`, `>`; the "fully nested" case, `iv2` starting after and ending before `iv1`.
- **The nested `for-each` over all pairs, `4 × 3` real checks** — a reappearance of `for-each`; exhaustive, not sampled, matching this curriculum's own standing evidence discipline.
- **The real, exact `#t` across all twelve checked pairs** — direct, checked confirmation of Concept Unit 2's own derived claim, on real, computed timestamps rather than only a hand-argued proof.

### CS Lens

This is Lesson 43's own structural-induction result, made concrete for a specific real instance: the parenthesis property is a genuine, provable consequence of recursion's own call-and-return structure (a vertex's interval necessarily contains every descendant's interval, since a call cannot return before its own recursive calls do), now checked directly rather than only argued.

### SE Lens

The alternative to checking all `12` pairs is checking a couple of obviously-nested ones (`A` and `B`, say) and calling the property confirmed. The real value of exhaustiveness here: a subtle bug in timestamp bookkeeping — advancing `time` in the wrong place, for instance — could easily produce correct-looking nesting for adjacent vertices while quietly breaking it for a pair further apart in the tree, exactly the kind of gap only a full, exhaustive check would catch.

### Run It — Show the Real Output

```
$ guile dfsstate-check.scm
parenthesis property holds for every pair? #t
```

Verified this session — every one of the `12` real, ordered pairs of distinct vertices satisfies the parenthesis property exactly: `A`'s interval `[1, 8]` contains `B`'s `[2, 7]`, which contains `C`'s `[3, 6]`, which contains `D`'s `[4, 5]` — a real, fully nested chain, confirmed pair by pair, not assumed from the chain's own visual shape.

---

## Closing

### Connect the pieces

One cycle, one real edge that closes it, one property checked exhaustively:

1. **The missing distinction, named (Unit 1):** "already visited" conflates "still active" and "long finished" — two genuinely different real states.
2. **Colors, timestamps, and back edges, derived (Unit 2):** white/gray/black, a shared counter, and a precise definition of what makes an edge a back edge.
3. **Implemented and directly checked (Unit 3):** exactly one real back edge on a cyclic graph, zero on an acyclic one.
4. **The parenthesis property, verified exhaustively (Unit 4):** all `12` real interval pairs, nested or disjoint, never overlapping.

Every claim in this lesson traces to real, executed code: real timestamps, a real, correctly-detected back edge distinguishing a genuine cycle from mere convergence, and an exhaustive, real check of a derived mathematical property.

### What breaks without this

Suppose a real dependency-checking tool used Lesson 118's own plain visited set to look for circular dependencies, treating any "already visited" encounter as a cycle. This lesson's own Concept Unit 1 example shows exactly what would go wrong: two independent modules that both depend on a common, already-finished third module would be incorrectly flagged as circular, since the plain visited set cannot distinguish that convergence from an actual cycle — precisely the false positive gray/black coloring exists to prevent.

### Exercises

1. **Observe.** Before checking, predict how many real back edges a graph with *two* separate cycles sharing no vertices would produce, using Concept Unit 2's own definition to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Extend `dfs-colored` to also record **forward edges** (an edge to an already-black descendant, discovered via a *different*, longer path) and **cross edges** (an edge to an already-black vertex that isn't a descendant at all), and classify every edge in this lesson's own `gacyc` graph.
4. **Explain.** In your own words, explain why a back edge can only ever point to an *ancestor* on the current path, never to some other, unrelated gray vertex, referencing what "gray" actually means at any given moment.
5. **Explain.** Using this lesson's real timestamps, explain why `D`'s interval, `[4, 5]`, is the smallest of all four, referencing what real property of `D` (within this specific graph) causes that.

### Definition of done

- [ ] You can state what each of white, gray, and black means, and explain why gray specifically (not merely "visited") is what defines a back edge.
- [ ] You can explain why the parenthesis property is a genuine consequence of recursion, not a coincidence of this lesson's own example.
- [ ] You can point to this lesson's own real back-edge results — one on the cyclic graph, zero on the acyclic one — as the concrete evidence for Concept Unit 2's claim.
- [ ] You completed Exercises 1–5, including real forward- and cross-edge classification.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
