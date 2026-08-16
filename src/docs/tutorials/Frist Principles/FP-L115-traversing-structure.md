# Lesson 115: Traversing Structure

**What you will build:** a real **traversal** — systematically visiting every vertex reachable from a starting point — and a real, deliberately bounded demonstration of exactly why Era IV's tree-traversal habits are unsafe on a general graph. Real, verified evidence this session: recursively visiting neighbors with no memory of what's already been seen, on a graph containing a real cycle (`A→B→C→A`), blows past a safety cap of `50` real recursive calls, reaching `66`, without ever terminating on its own — real, direct proof of an infinite loop, made observable without actually running one forever. Adding a real **visited set** fixes it completely: the identical graph, traversed with tracking, terminates naturally after exactly `5` real calls, visiting precisely `{A, B, C, D}` — and correctly excludes `E` and `F`, vertices connected to each other but not reachable from `A` at all. The transferable point: every tree this curriculum has traversed since Lesson 42 was safe by *accident* of shape — a tree has no cycles, so nothing needed tracking. A general graph offers no such guarantee, and this lesson derives, from a real, observed failure, the one piece of state that restores safety.

**What you need to know first:** Lesson 113 (`FP-L113-from-relations-to-graphs.md`) and Lesson 114 (`FP-L114-graph-representations.md`) — specifically graphs and neighbor queries, reused directly. Lesson 91 (`FP-L091-sets-and-maps.md`) — specifically `Set`'s own membership check, reused here to track visited vertices.

**Terms introduced in this lesson**

- **Traversal** — the process of visiting every vertex reachable from a starting vertex, systematically, exactly once each. It exists to name the general problem this lesson solves, independent of *which order* vertices get visited in — a question Lesson 116 and 118 answer separately.
- **Visited set** — the set of vertices a traversal has already visited, checked before visiting any vertex to guarantee it is never processed a second time. It exists because a general graph can contain cycles, and revisiting an already-processed vertex without limit is exactly what causes non-termination.
- **Reachable** — vertex `b` is reachable from vertex `a` if a traversal starting at `a` eventually visits `b`. It exists to give a precise, checkable name to "connected, possibly through several intermediate steps" — the real question a visited-set traversal directly answers.

**Objects and methods used**

No new objects or methods this lesson — `member`, `cons`, `for-each` all reappear unchanged from Lesson 88/91 and earlier.

---

## Concept Unit 1: A Real, Bounded Demonstration of Infinite Recursion

### The Problem

Every tree Era IV traversed — BST, AVL, red-black, trie — had no cycles, by construction: a node's children are always strictly "further from the root" in some sense, so ordinary recursion, visiting every child, always terminates. Lesson 113 and 114's graphs carry no such guarantee. A cycle — `A→B→C→A`, a completely legitimate real graph — means recursing into every neighbor, the exact style Era IV's tree traversals used safely, would visit `A`, then `B`, then `C`, then `A` again, then `B` again, forever.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, contrasting with Era IV's own always-safe tree recursion.

### Reference Source

No reference counterpart — the motivating contrast draws on Era IV's own tree-traversal habits, not any new implementation.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Making an Infinite Loop Observable Without Running One Forever

A real, direct demonstration needs to prove non-termination without actually looping forever — impossible to show real, complete output from. The honest fix: add a hard cap on the number of real recursive calls permitted, and show the naive version *hitting* that cap rather than finishing naturally — real, bounded, checkable evidence that nothing about the recursion itself would ever stop.

### Walkthrough

- **The specific cycle, `A→B→C→A`, named concretely before any code exists** — grounds "infinite loop" in one real, small, checkable structure rather than an abstract warning.
- **"hitting the cap rather than finishing naturally"** — the precise, schema-honest standard Concept Unit 3's own real evidence is held to.

### CS Lens

This is Lesson 47's own "termination" concept, revisited on genuinely new ground: every earlier lesson's termination argument relied on structural properties (a shrinking list, a tree's finite depth) true by construction; a general graph provides no such guarantee, and termination has to be *engineered* in, not assumed from shape.

### SE Lens

The alternative to deriving the fix first is porting Era IV's tree-traversal code directly onto graph data, assuming "it worked for trees" generalizes automatically. The real, demonstrated cost of that alternative, made concrete in Concept Unit 3: a real program, given a real graph with even one cycle, simply never returns — not a slow answer, no answer at all.

---

## Concept Unit 2: Deriving the Visited Set

### The Problem

Concept Unit 1 named the failure. It needs a precise fix — some real state remembering what's already been visited, checked before any further recursion.

### No isolated lab for this step

This concept has no code of its own to isolate — the fix is derived directly below, and Concept Unit 3 implements and checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation building directly on Lesson 91's own `Set`.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — One Rule, Checked Before Every Visit

**The rule:** before visiting any vertex, check whether it's already in the visited set. If it is, do nothing — recursion for that path stops here. If it isn't, add it to the visited set, *then* recurse into its neighbors.

**Why this guarantees termination on any real, finite graph:** every vertex can be added to the visited set at most once, ever — the check itself prevents a second addition. Since a real graph has a finite number of vertices, the visited set can grow at most that many times before every reachable vertex has been added, at which point every further neighbor check finds an already-visited vertex and recursion stops.

**Why this doesn't miss anything:** a vertex is only ever skipped because it's already been visited — never because it seemed unreachable or unimportant. Every vertex actually reachable from the start gets added exactly once, the moment it's first encountered.

### Walkthrough

- **The rule split into "check first, then recurse"** — the precise ordering that makes the guarantee hold; recursing before checking would defeat the whole mechanism.
- **The finite-graph termination argument, stated precisely** — the actual reason this works, not just an assertion that it does.

### CS Lens

This is memoization's own core idea (Lesson 54), applied to *visiting* rather than *computing*: both cache the fact that some unit of work has already happened, specifically to avoid redoing it — Lesson 54 to save real computation time, this lesson's visited set to guarantee termination at all.

### SE Lens

The alternative to a visited set is trusting real-world graph data to happen not to contain cycles, and only adding tracking if a real failure is observed in production. The real cost of that alternative: a program that works correctly on every test graph tried, right up until the first real input containing a cycle, at which point it doesn't fail gracefully — it simply never returns, exactly Concept Unit 1's own demonstrated failure mode.

---

## Concept Unit 3: Implementing and Verifying Both Versions

### The Problem

Concept Unit 2 derived the fix. It needs real code for both versions — the naive, capped one, and the fixed one — run against the identical real graph, to make the contrast direct and checkable.

### The New Code — Type It Yourself

```scheme
(define (explore g start)
  (let ((visited '()))
    (define (visit v)
      (if (not (member v visited))
          (begin (set! visited (cons v visited))
                 (for-each visit (graph-neighbors g v)))))
    (visit start)
    visited))
```

### Reference Source

Lesson 113's `graph-neighbors` (`FP-L113-from-relations-to-graphs.md`, Concept Unit 3), reused unchanged.

### Files affected

Created: `traverse-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `traverse-check.scm`, in full:

```scheme
(define (make-graph vertices edges) (cons vertices edges))
(define (graph-edges g) (cdr g))
(define (graph-neighbors g a) (map cdr (filter (lambda (e) (equal? (car e) a)) (graph-edges g))))

(define g (make-graph '(A B C D E F)
                       (list (cons 'A 'B) (cons 'B 'C) (cons 'C 'A) (cons 'C 'D) (cons 'E 'F))))

(define naive-calls 0)                                             ; ← new
(define (naive-explore g v cap)                                       ; ← new
  (set! naive-calls (+ naive-calls 1))                                   ; ← new
  (if (< naive-calls cap)                                                   ; ← new
      (for-each (lambda (n) (naive-explore g n cap)) (graph-neighbors g v)))) ; ← new
(naive-explore g 'A 50)
(display "naive explore (no visited set), calls before hitting the 50-call cap: ") (display naive-calls) (newline)

(define (explore g start)                                          ; ← new
  (let ((visited '()))                                                ; ← new
    (define (visit v)                                                    ; ← new
      (if (not (member v visited))                                          ; ← new
          (begin (set! visited (cons v visited))                              ; ← new
                 (for-each visit (graph-neighbors g v)))))                       ; ← new
    (visit start)                                                                  ; ← new
    visited))                                                                         ; ← new

(define reachable-from-A (explore g 'A))
(display "explore from A, real visited set: ") (display reachable-from-A) (newline)
(display "reachable from A includes D? ") (display (if (member 'D reachable-from-A) #t #f)) (newline)
(display "reachable from A includes E? ") (display (if (member 'E reachable-from-A) #t #f)) (newline)
```

`naive-explore` recurses into every neighbor with no memory at all, counting real calls and stopping only once the cap is exceeded — never because the traversal itself finished. `explore` adds exactly Concept Unit 2's one rule: check `visited` first, recurse only if genuinely new.

### Mechanical Walkthrough

- **`(set! naive-calls (+ naive-calls 1))`** — a reappearance of `set!`; counts every real recursive invocation, the direct evidence of runaway recursion.
- **`(if (< naive-calls cap) (for-each ...))`** — first appearance of a recursion *safety cap*, distinct from a real base case: this check exists only to make the demonstration observable, not as part of the algorithm being demonstrated as broken.
- **`(let ((visited '())) (define (visit v) ...) (visit start) visited)`** in `explore` — a reappearance of `let`, internal `define`; `visited` is captured by the inner `visit` procedure via closure, the identical technique Lesson 92's own counters used, here holding real, growing state instead of a number.
- **`(if (not (member v visited)) (begin ...))`** — a reappearance of `member`, `not`; the literal execution of Concept Unit 2's rule, checked before any further recursion happens.
- **The real, exact `66` for the naive version, and the real, exact `(D C B A)` for the fixed one** — direct, checked confirmation of both halves of Concept Unit 2's claim: the naive version genuinely doesn't terminate on its own, and the fixed version genuinely does, with the correct result.

### CS Lens

This is Lesson 22's own evidence discipline applied to a claim about *non*-termination specifically — the hardest kind of claim to prove by running code, since "it never stops" can't be directly observed by waiting. A bounded cap, hit and reported, is the honest, checkable substitute this lesson uses instead of an unbounded wait.

### SE Lens

The alternative to instrumenting a real call counter is describing the infinite loop in prose only, without ever running code that demonstrates it. The real cost of that alternative, given this curriculum's own standing rule against unverified claims: a described-but-unrun failure is exactly the kind of "confident sentence" Lesson 110 and others have already warned isn't proof — the real `66`-calls-and-still-climbing number is what turns the claim into evidence.

### Run It — Show the Real Output

```
$ guile traverse-check.scm
naive explore (no visited set), calls before hitting the 50-call cap: 66
explore from A, real visited set: (D C B A)
reachable from A includes D? #t
reachable from A includes E? #f
```

Verified this session — the naive traversal, with no visited tracking, blows past its own `50`-call safety cap, reaching `66` real recursive calls before the cap forcibly stops it — real, direct evidence it would never terminate on its own, driven by the real cycle `A→B→C→A` regenerating identical calls without end. The fixed traversal, with Concept Unit 2's one rule added, terminates naturally, visiting exactly `{A, B, C, D}` — correctly including `D` (reachable via `C`) and correctly excluding `E` (connected only to `F`, an entirely separate part of the graph, unreachable from `A`).

---

## Concept Unit 4: Reachability as a Real, Checkable Question

### The Problem

Concept Unit 3 confirmed the fixed traversal terminates correctly. It's worth naming, precisely, the real question it answers — and confirming it correctly distinguishes vertices connected to each other from vertices merely *existing* in the same graph.

### The New Code — Type It Yourself

```scheme
(define (reachable? g a b) (if (member b (explore g a)) #t #f))
```

### Reference Source

Concept Unit 3's own `explore`, reused unchanged.

### Files affected

Modified: `traverse-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `traverse-check.scm`, with Concept Unit 3's own file extended by a direct reachability check:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define (reachable? g a b) (if (member b (explore g a)) #t #f))    ; ← new

(display "reachable? A to D: ") (display (reachable? g 'A 'D)) (newline) ; ← new
(display "reachable? A to F: ") (display (reachable? g 'A 'F)) (newline) ; ← new
(display "reachable? E to F: ") (display (reachable? g 'E 'F)) (newline) ; ← new
(display "reachable? F to E: ") (display (reachable? g 'F 'E)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(member b (explore g a))`** — a reappearance of `member`, `explore`; `reachable?` adds no new traversal logic at all — Concept Unit 3's `explore` already computes the complete real answer; this unit only names the specific question being asked of it.
- **The real, exact `#f` for `reachable? F to E`, contrasted with `#t` for `reachable? E to F`** — direct, checked confirmation that `reachable?` is direction-sensitive, exactly as Lesson 113's own directed-graph definition requires: an edge `E→F` says nothing about the reverse.

### CS Lens

This is Lesson 113's own directed-versus-undirected distinction, now shown to matter for a real, computed question rather than only for edge existence: `reachable?` genuinely depends on direction, the same way `graph-neighbors` did in Lesson 113's own Concept Unit 4.

### SE Lens

The alternative to naming `reachable?` as its own procedure is calling `explore` and checking `member` manually everywhere the question arises. The real cost of that alternative is exactly Lesson 84's own argument: a question this fundamental deserves a named, direct answer, not a pattern re-typed at every call site.

### Run It — Show the Real Output

```
$ guile traverse-check.scm
reachable? A to D: #t
reachable? A to F: #f
reachable? E to F: #t
reachable? F to E: #f
```

Verified this session — `D` is correctly reachable from `A` (via `C`); `F` is correctly unreachable from `A` (a genuinely separate part of the graph). `E` correctly reaches `F` directly, but `F` does *not* reach `E` — the real, direction-sensitive asymmetry Lesson 113 first defined, now confirmed for a computed traversal rather than a single stored edge.

---

## Closing

### Connect the pieces

One cycle, one safety cap, one real fix:

1. **The failure, made observable (Unit 1):** a bounded call cap, not an infinite wait, is how "this never terminates" gets proven with real, run code.
2. **The fix, derived (Unit 2):** check the visited set before recursing — every vertex visited at most once, guaranteed by the graph's own finiteness.
3. **Both implemented and directly contrasted (Unit 3):** `66` calls and still climbing, against `5` calls and a correct, natural stop.
4. **Reachability, named and checked (Unit 4):** a direct, direction-sensitive question, answered entirely by code already built, nothing new required.

Every claim in this lesson traces to real, executed code: a real, bounded proof of non-termination, and a real, correctly-terminating fix confirmed against a graph containing both a cycle and a genuinely disconnected piece.

### What breaks without this

Suppose a real system computed "which servers can this one reach" by traversing a real network topology graph using Era IV-style unguarded recursion, on data that — unlike every hand-built tree this curriculum traversed before — happened to contain a real cycle (two servers routing through each other). This lesson's own Concept Unit 1 shows precisely what would happen: not a wrong answer, no answer at all, ever, exactly the real, bounded `66`-calls-and-counting evidence this lesson produced on purpose, in miniature.

### Exercises

1. **Observe.** Before checking, predict whether `explore`, called from `D` instead of `A`, would visit all six vertices, using this lesson's own graph and the real, direction-sensitive nature of `reachable?` to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Add one new edge, `D→E`, to this lesson's graph, and confirm with real code that `reachable? A F` becomes `#t` — a real, checked demonstration that reachability depends on the exact edge set, not just which vertices happen to exist.
4. **Explain.** In your own words, explain why `visited`, captured by closure inside `explore`'s inner `visit` procedure, doesn't need to be passed as an explicit argument to every recursive call, referencing Lesson 92's own use of the identical technique.
5. **Explain.** Using this lesson's real numbers, explain why the naive version's call count (`66`) depends on the chosen cap (`50`) while the fixed version's call count (`5`) does not — referencing what causes each version to actually stop.

### Definition of done

- [ ] You can state the visited-set rule precisely and explain why checking before recursing, not after, is essential to the guarantee.
- [ ] You can explain why every tree traversed in Era IV was safe without a visited set, and what specifically changes for a general graph.
- [ ] You can point to this lesson's own real `66`-versus-`5` numbers as the concrete evidence for both halves of this lesson's central claim.
- [ ] You completed Exercises 1–5, including a real edge addition that changes a real reachability result.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
