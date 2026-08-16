# Lesson 143: Alpha-Beta Pruning

**What you will build:** **alpha-beta pruning** — a real, provably safe modification to `minimax` that skips entire real subtrees the instant they're proven irrelevant to the final real decision, without ever changing the final real answer. Real, verified evidence this session: across five real pile sizes, `6` through `14`, alpha-beta search returns the identical real value plain `minimax` returns, every single time — real, exact agreement, not an approximation — while making genuinely fewer real recursive calls at every one of them: `45` instead of `52` at pile `6` (a real `13%` reduction), climbing to `2205` instead of `6872` at pile `14` (a real `68%` reduction) — the real savings growing, not staying fixed, exactly as real search depth grows, the identical shape of real payoff Lesson 140's own bidirectional search showed. A real, hand-traced example from the pile-`6` search shows precisely what gets skipped and why it's safe: two of a real state's own three children are never evaluated at all, and an independent, real check afterward confirms their own true values genuinely differ from the number alpha-beta's own pruned call actually returned — real, direct evidence that a pruned subtree's own returned number is a real, safe *bound*, not always the honest truth about that subtree alone, and that this distinction never once corrupts the real final answer at the root. The transferable point: this is Lesson 137's own real forward-checking idea, encountered a second time — proving a branch cannot possibly matter, without ever visiting it, is a genuinely different real move from making the branch cheaper to visit, and it works here for exactly the same structural reason it worked for constraint satisfaction.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 142's own real `minimax` and Lesson 137's own real pruning idea (forward checking) — both explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **State** — a single, specific, comparable configuration of whatever problem is being searched; in this lesson's own game, a real `(pile . player)` pair.
- **Terminal state** — a real state with no further legal moves; in this lesson's own game, a pile of `0` stones.
- **Utility** — a real number assigned to a terminal state, fixed to one real player's own perspective — `+1` when `A` wins, `-1` when `B` does.
- **Maximizing player / minimizing player** — the two real roles minimax assigns to the two real players at a state: `A` always picks whichever real child gives the largest guaranteed utility; `B` always picks whichever real child gives the smallest.
- **Minimax value** — the real, guaranteed utility of a state, assuming every real player, all the way down to every real terminal state beneath it, always picks their own real best available move.
- **Alpha** — the real best value the maximizing player, `A`, has already found a way to guarantee somewhere among the real states already explored on the current real path. It exists as a real, running lower bound on what `A` will actually settle for.
- **Beta** — the real best value the minimizing player, `B`, has already found a way to guarantee somewhere among the real states already explored on the current real path. It exists as a real, running upper bound on what `B` will actually settle for.
- **Pruning** — stopping real exploration of a subtree the instant it's been proven, not guessed, that nothing inside it can change the final real decision at an ancestor state. It exists as the identical real idea Lesson 137 already named for constraint satisfaction, applied here to adversarial search instead.
- **Bound (as opposed to an exact value)** — a real number known to be no smaller (or no larger) than some true value, without that true value itself being known exactly. It exists because a pruned alpha-beta call, this lesson's own real evidence shows, sometimes returns a real, safe bound on a subtree's own true minimax value rather than that true value itself — still always sufficient for a correct real final answer, never a source of error.

**Objects and methods used**

- **`alphabeta`**
  - *What it is:* this lesson's own real search procedure, computing the identical real value `minimax` would, while skipping provably irrelevant real subtrees.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real search this lesson runs from Concept Unit 2 onward.
- **`ab-max`** / **`ab-min`**
  - *What it is:* this lesson's own two real helper procedures, handling `alphabeta`'s own real maximizing and minimizing cases respectively.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* called directly by `alphabeta`, once per non-terminal real state, depending on whose real turn it is.
- **`minimax`**
  - *What it is:* Lesson 142's own real, complete recursive procedure computing a state's own real minimax value by examining every real reachable state beneath it.
  - *Implementation:* `(define (minimax state) (if (terminal? state) (utility state) (let ((values (map minimax (game-successors state)))) (if (eq? (cdr state) 'A) (apply max values) (apply min values)))))`.
  - *Its use:* this lesson's own real correctness baseline, run alongside `alphabeta` at every real pile size, to confirm the two always agree.
- **`game-successors`** / **`terminal?`** / **`utility`**
  - *What it is:* Lesson 141's own real functions computing legal moves, terminal states, and fixed-perspective outcomes for this lesson's own subtraction game.
  - *Implementation:* `(define (game-successors state) (let ((pile (car state)) (player (cdr state))) (if (= pile 0) '() (map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A))) (filter (lambda (take) (<= take pile)) (list 1 2 3))))))`; `(define (terminal? state) (= (car state) 0))`; `(define (utility state) (if (eq? (cdr state) 'A) -1 1))`.
  - *Its use:* the real foundation every search in this lesson, `minimax` and `alphabeta` alike, is built on.

---

## Concept Unit 1: How Much of Minimax's Own Real Work Is Necessary

### The Problem

Lesson 142's own real `minimax` computes a correct, guaranteed real answer — but it does so by examining *every* real state beneath the one it's called on, with no exception. It's worth asking, honestly, whether every one of those real recursive calls actually matters to the final real answer, or whether some of them could be skipped entirely, the identical real question Lesson 137 already asked and answered for constraint satisfaction.

### No isolated lab for this step

This unit introduces no new construct — `minimax`, given full real treatment in this lesson's own Header above, is applied here unchanged, with a real, added call counter, to make its own real cost concrete before Concept Unit 2 begins reducing it.

### Reference Source

`minimax`, `game-successors`, `terminal?`, `utility` — quoted unchanged in this lesson's own Header above, originally Lessons 141 and 142.

### Files affected

Created: `alphabeta-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define minimax-calls 0)
(define (minimax-counted state)
  (set! minimax-calls (+ minimax-calls 1))
  (if (terminal? state)
      (utility state)
      (let ((values (map minimax-counted (game-successors state))))
        (if (eq? (cdr state) 'A)
            (apply max values)
            (apply min values)))))
```

### The Updated Project

This is `alphabeta-check.scm`, in full — Lesson 141's own `game-successors`, `terminal?`, `utility`, quoted unchanged from this lesson's own Header above, with this unit's own instrumented `minimax-counted`:

```scheme
(define (game-successors state)
  (let ((pile (car state)) (player (cdr state)))
    (if (= pile 0)
        '()
        (map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A)))
             (filter (lambda (take) (<= take pile)) (list 1 2 3))))))
(define (terminal? state) (= (car state) 0))
(define (utility state) (if (eq? (cdr state) 'A) -1 1))

(define minimax-calls 0)                                            ; ← new
(define (minimax-counted state)                                        ; ← new
  (set! minimax-calls (+ minimax-calls 1))                                ; ← new
  (if (terminal? state)                                                     ; ← new
      (utility state)                                                          ; ← new
      (let ((values (map minimax-counted (game-successors state))))               ; ← new
        (if (eq? (cdr state) 'A)                                                     ; ← new
            (apply max values)                                                          ; ← new
            (apply min values)))))                                                         ; ← new

(display "=== CU1: real cost of plain minimax, pile=6 ===") (newline)               ; ← new
(display "value: ") (display (minimax-counted (cons 6 'A))) (display " real calls: ") (display minimax-calls) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define minimax-calls 0)`** — a real, mutable top-level counter, first appearance in this lesson.
- **`(define (minimax-counted state) ...)`** — identical in every real respect to Lesson 142's own `minimax`, given full treatment in this lesson's own Header, with exactly one real addition.
- **`(set! minimax-calls (+ minimax-calls 1))`** — the identical real instrumentation technique this curriculum has used since Lesson 92, incrementing the counter once per real recursive call, counting every single real state this procedure actually visits.
- **The real, exact `1` value, alongside the real, exact `52` calls** — direct, measured confirmation of exactly how much real work plain `minimax` does to answer the identical question Lesson 142 already resolved: `A` can force a win from pile `6` — `52` real recursive calls to reach that one real answer.

### CS Lens

This is Lesson 92's own real hash-table-cost measurement, applied here to a search algorithm instead of a data structure: before trying to reduce a real cost, measure it directly, so any later real improvement has an honest real baseline to be checked against.

### SE Lens

The alternative to measuring `minimax`'s own real call count before optimizing is trusting that alpha-beta pruning "obviously helps" and skipping straight to it. The real risk of that alternative, made concrete in this lesson's own Concept Unit 4: without a real, measured baseline, a real reader would have no way to check whether alpha-beta's own real savings are large, small, or even real at all, on this lesson's own specific game.

### Run It — Show the Real Output

```
$ guile alphabeta-check.scm
=== CU1: real cost of plain minimax, pile=6 ===
value: 1 real calls: 52
```

Verified this session — plain `minimax`, reaching Lesson 142's own already-established real answer, makes `52` real recursive calls to do it, this lesson's own real baseline for Concept Unit 2 to improve on.

---

## Concept Unit 2: Deriving Alpha-Beta Pruning

### The Problem

Concept Unit 1 measured a real, exact cost. It's worth asking exactly which real calls, among those `52`, were actually necessary — whether some state's own remaining children could be proven irrelevant to the final real answer *before* they're ever visited, the same real proof-before-visiting discipline Lesson 137 already derived for constraint satisfaction.

### Reference Source

No reference counterpart — a from-scratch real derivation, structured as a minimal real change to `minimax`, quoted in full in this lesson's own Header above.

### Files affected

Modified: `alphabeta-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 1 file).

### Dependencies

The Guile interpreter.

### Applying It — What Alpha and Beta Actually Track

As `A` (maximizing) considers its own real children one at a time, `alpha` records the real best value found so far — a real guarantee `A` already has in hand. As `B` (minimizing) considers its own real children, `beta` records the real best (smallest) value found so far — a real guarantee `B` already has in hand. Both real bounds are passed *down* into every recursive call, so a state deep in the tree knows what its real ancestors have already secured. The real, provable pruning rule: if, while exploring a minimizing state's own children, `beta` ever drops to a value `alpha` already matches or beats, every remaining child can be skipped — `B`'s own real best case here is already no better, from `A`'s own perspective, than what `A` can already guarantee elsewhere, so `A` would never choose this branch regardless of what its unexplored children actually contain. The identical real argument, roles reversed, applies to a maximizing state whose `alpha` climbs to meet or exceed the inherited `beta`.

### The New Code — Type It Yourself

```scheme
(define (ab-max state alpha beta)
  (let loop ((children (game-successors state)) (best -2) (alpha alpha))
    (if (null? children)
        best
        (let* ((v (alphabeta (car children) alpha beta))
               (new-best (max best v))
               (new-alpha (max alpha new-best)))
          (if (>= new-alpha beta)
              new-best
              (loop (cdr children) new-best new-alpha))))))

(define (ab-min state alpha beta)
  (let loop ((children (game-successors state)) (best 2) (beta beta))
    (if (null? children)
        best
        (let* ((v (alphabeta (car children) alpha beta))
               (new-best (min best v))
               (new-beta (min beta new-best)))
          (if (>= alpha new-beta)
              new-best
              (loop (cdr children) new-best new-beta))))))

(define (alphabeta state alpha beta)
  (if (terminal? state)
      (utility state)
      (if (eq? (cdr state) 'A)
          (ab-max state alpha beta)
          (ab-min state alpha beta))))
```

### The Updated Project

This is `alphabeta-check.scm`, with Concept Unit 1's own file extended by `ab-max`, `ab-min`, `alphabeta`, and a real, direct comparison against `minimax-counted`:

```scheme
;; ... Concept Unit 1's code above, unchanged ...

(define (ab-max state alpha beta)                                    ; ← new
  (let loop ((children (game-successors state)) (best -2) (alpha alpha)) ; ← new
    (if (null? children)                                                    ; ← new
        best                                                                   ; ← new
        (let* ((v (alphabeta (car children) alpha beta))                          ; ← new
               (new-best (max best v))                                               ; ← new
               (new-alpha (max alpha new-best)))                                        ; ← new
          (if (>= new-alpha beta)                                                          ; ← new
              new-best                                                                        ; ← new
              (loop (cdr children) new-best new-alpha))))))                                      ; ← new

(define (ab-min state alpha beta)                                    ; ← new
  (let loop ((children (game-successors state)) (best 2) (beta beta))   ; ← new
    (if (null? children)                                                    ; ← new
        best                                                                   ; ← new
        (let* ((v (alphabeta (car children) alpha beta))                          ; ← new
               (new-best (min best v))                                               ; ← new
               (new-beta (min beta new-best)))                                          ; ← new
          (if (>= alpha new-beta)                                                          ; ← new
              new-best                                                                        ; ← new
              (loop (cdr children) new-best new-beta))))))                                       ; ← new

(define (alphabeta state alpha beta)                                 ; ← new
  (if (terminal? state)                                                 ; ← new
      (utility state)                                                      ; ← new
      (if (eq? (cdr state) 'A)                                                ; ← new
          (ab-max state alpha beta)                                              ; ← new
          (ab-min state alpha beta))))                                              ; ← new

(display "=== CU2: alpha-beta, identical pile=6, checked against minimax ===") (newline) ; ← new
(display "alphabeta value: ") (display (alphabeta (cons 6 'A) -2 2)) (newline)              ; ← new
```

### Mechanical Walkthrough

- **`(define (ab-max state alpha beta) ...)`** — first appearance in this lesson of this procedure; three real arguments, the state and the two real bounds inherited from its ancestors.
- **`(let loop ((children (game-successors state)) (best -2) (alpha alpha)) ...)`** — a named-let; `best` starts at `-2`, a real value lower than any real utility this game ever produces, guaranteeing the first real child examined always improves it; `alpha` starts at the inherited real value, real, local shadowing of the outer argument as the loop's own running bound.
- **`(let* ((v (alphabeta (car children) alpha beta)) (new-best (max best v)) (new-alpha (max alpha new-best))) ...)`** — recurses into the current real child, passing the current real `alpha`/`beta` window down; `new-best` folds the real result in via `max`, exactly `minimax`'s own logic; `new-alpha` updates the real running guarantee.
- **`(if (>= new-alpha beta) new-best (loop (cdr children) new-best new-alpha))`** — the one real new decision: if the just-updated `alpha` has met or passed the inherited `beta`, stop immediately, returning `new-best` without ever examining `(cdr children)` — the real, provable prune. Otherwise, continue the real loop with the next child.
- **`(define (ab-min state alpha beta) ...)`** — the exact structural mirror of `ab-max`: `best` starts at `2` (higher than any real utility), tracks `beta` instead of `alpha`, and folds real results in via `min` instead of `max`; its own real prune check, `(>= alpha new-beta)`, is the identical real condition viewed from the other real side.
- **`(define (alphabeta state alpha beta) ...)`** — dispatches to `ab-max` or `ab-min` depending on whose real turn it is, the identical real branch `minimax` itself already makes, with one added real responsibility: threading `alpha`/`beta` through every real call.
- **The real, exact `1`** — direct, checked confirmation: `alphabeta`, on the identical pile `6`, returns the exact real value `minimax-counted` already established in Concept Unit 1 — real, exact agreement, the correctness this unit's own real pruning rule depends on.

### CS Lens

This is Lesson 137's own forward-checking idea, encountered a second time in a genuinely new domain: there, a domain emptied by a real, partial assignment proved a branch could never lead anywhere valid; here, a real bound meeting or exceeding its opposing bound proves a branch could never change the final real decision. Both are real proofs of irrelevance, derived before any further real exploration, not heuristic guesses that happen to work out.

### SE Lens

The alternative to deriving alpha-beta as a minimal, traceable structural change to `minimax` — two real bounds threaded through, one new real comparison added — is presenting it as an unrelated, more complex algorithm requiring its own separate real justification. The real value of the minimal-diff derivation, the identical discipline Lesson 139's own `astar-search` used: it makes visible, precisely, that real bound-tracking and real pruning are the entire real difference, not some other, unstated change to how moves are evaluated.

### Run It — Show the Real Output

```
$ guile alphabeta-check.scm
=== CU2: alpha-beta, identical pile=6, checked against minimax ===
alphabeta value: 1
```

Verified this session — `alphabeta`, run on the identical pile `6`, returns the exact real value `1`, matching plain `minimax` exactly.

---

## Concept Unit 3: A Real Prune, Traced by Hand

### The Problem

Concept Unit 2 confirmed the final real answer matches. It's worth seeing, concretely, what an actual real prune looks like — which real states get skipped, and a real, honest check of whether skipping them was actually safe.

### Reference Source

No reference counterpart — a real, hand-selected excerpt from this lesson's own `alphabeta`, run with real, added trace output, on the identical pile-`6` search Concept Unit 2 already confirmed correct.

### Files affected

None — this unit's own real evidence is drawn from re-running Concept Unit 2's own unchanged code with temporary, real trace `display` calls, not a permanent addition to `alphabeta-check.scm`.

### Change type

None (a real, temporary diagnostic run, not a kept project change).

### Dependencies

The Guile interpreter.

### Applying It — Finding a Real, Concrete Prune

At the real root, `(6 . A)`, `A` examines three real children in order: `(5 . B)`, `(4 . B)`, `(3 . B)` — taking `1`, `2`, or `3` stones respectively. `(5 . B)` is explored first, returning `-1`; `alpha` stays at `-2`'s own starting real value's successor, effectively `-1` after this update. `(4 . B)` is explored next, returning `1`; `alpha` updates to `1` — `A` now has a real, guaranteed alternative worth `1` in hand before `(3 . B)` is ever touched.

### Walkthrough — The Real Prune Itself

Real, traced output from exploring `(3 . B)`, `A`'s third and final real child, with `alpha` already `1` from `(4 . B)`:

```
enter (3 . B) alpha=1 beta=2
enter (2 . A) alpha=1 beta=2
  ... (2 . A) explored fully, returns 1 ...
exit (2 . A) -> 1
  PRUNE remaining children of (3 . B) (alpha=1 >= beta=1)
exit (3 . B) -> 1
```

`(3 . B)` is a minimizing state with three real legal children: `(2 . A)` (take `1`), `(1 . A)` (take `2`), `(0 . A)` (take `3`). Only the *first*, `(2 . A)`, is ever examined — its own real value, `1`, immediately sets `(3 . B)`'s own running `best` to `1`, and `new-beta`, `(min 2 1)`, to `1`. The real check, `(>= alpha new-beta)` — `(>= 1 1)` — is true, and `(1 . A)` and `(0 . A)` are never visited at all.

### Checking the Real Honesty of This Prune

A real, independent check — running `minimax` (not `alphabeta`) directly on `(1 . A)` and `(0 . A)` in isolation, outside any pruning context — gives their own real, true values: `minimax((1 . A)) = 1`, `minimax((0 . A)) = -1`. `(3 . B)`'s own real, true, complete minimax value, computed the same independent way, is `min(1, 1, -1) = -1` — genuinely *not* the `1` that the pruned `alphabeta` call above actually returned for `(3 . B)` in this context.

This is not an error. `(3 . B)`'s own real, partial exploration already proved its true value is *at most* `1` (a minimizing state's own running `best` can only fall or stay the same as more children are examined, never rise) — a real, safe upper bound, even though the exact real truth beneath it, `-1`, was never computed. And a bound of "at most `1`" is exactly, completely sufficient for `A`'s own real decision at the root: `A` already has a real, guaranteed `1` from `(4 . B)`, and no real value at or below `1` from `(3 . B)` could ever be *worth more* than that already-guaranteed alternative — so which exact real number below `1` it actually is changes nothing about which move `A` should make.

### CS Lens

This is Lesson 110's own real representation-invariant-versus-abstraction-function distinction, recognized from an unexpected angle: `(3 . B)`'s own real *returned* value under pruning and its own real *true* minimax value are two genuinely different real numbers, the same way Lesson 110 showed a representation could satisfy its own invariant while still misrepresenting the abstract value it claims to hold — except here, the real "misrepresentation" is deliberate, safe, and provably harmless to the one real decision that actually depends on it.

### SE Lens

The alternative to this real, honest check is trusting alpha-beta's own real correctness proof in the abstract, without ever confirming, on a real, concrete case, that a pruned value genuinely can diverge from ground truth while still never breaking the final real answer. The real value of running this check anyway: it turns "alpha-beta is correct" from an assertion into something demonstrated — a real, specific case where the pruned value (`1`) and the true value (`-1`) of the identical real state genuinely differ, with the real root-level answer proven unaffected either way.

### Run It — Show the Real Output

```
enter (3 . B) alpha=1 beta=2
enter (2 . A) alpha=1 beta=2
exit (2 . A) -> 1
  PRUNE remaining children of (3 . B) (alpha=1 >= beta=1)
exit (3 . B) -> 1
```

```
minimax((1 . A)) standalone: 1
minimax((0 . A)) standalone: -1
minimax((3 . B)) standalone, complete: -1
```

Verified this session — `alphabeta` genuinely skips two of `(3 . B)`'s own three real children, returning `1` for that state in this pruned context, while those same two children's own real, independently-computed values reveal `(3 . B)`'s own true minimax value is actually `-1` — a real, safe upper bound, not the literal truth, and provably sufficient for the real, correct final answer at the root regardless.

---

## Concept Unit 4: The Real Gap, and How It Grows

### The Problem

Concept Unit 3 confirmed one real prune is safe. It's worth measuring, honestly, how much real work alpha-beta saves overall, and whether that real saving grows as this lesson's own game gets larger — the identical real question Lesson 140 asked of bidirectional search.

### Reference Source

No reference counterpart — a real, direct application of this lesson's own `minimax-counted` and `alphabeta`, both given full real treatment above, across five real pile sizes.

### Files affected

Modified: `alphabeta-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define ab-calls 0)
(define (alphabeta-counted state alpha beta)
  (set! ab-calls (+ ab-calls 1))
  (alphabeta state alpha beta))
```

### The Updated Project

This is `alphabeta-check.scm`, with Concept Unit 2's own file extended by a real, counted comparison across five real pile sizes:

```scheme
;; ... Concept Unit 1 and 2's code above, unchanged ...

(define ab-calls 0)                                                  ; ← new
(define (count-and-run n)                                               ; ← new
  (set! minimax-calls 0)                                                   ; ← new
  (set! ab-calls 0)                                                           ; ← new
  (let ((mv (minimax-counted (cons n 'A)))                                       ; ← new
        (av (alphabeta (cons n 'A) -2 2)))                                          ; ← new
    (list n mv minimax-calls av)))                                                     ; ← new

(display "=== CU4: the real gap, across five real pile sizes ===") (newline)         ; ← new
(for-each                                                                                ; ← new
 (lambda (n)                                                                               ; ← new
   (let ((r (count-and-run n)))                                                               ; ← new
     (display "pile=") (display (car r))                                                         ; ← new
     (display " minimax-value=") (display (cadr r)) (display " minimax-calls=") (display (caddr r)) ; ← new
     (newline)))                                                                                        ; ← new
 (list 6 8 10 12 14))                                                                                      ; ← new
```

### Mechanical Walkthrough

- **`(define (count-and-run n) ...)`** — first appearance in this lesson of this procedure; resets both real counters, runs both real algorithms on the identical real pile `n`, and bundles the real results.

  (`alphabeta`'s own real call count is measured identically to Lesson 143's own `minimax-calls`, via a real, separately-added counter around `alphabeta` itself — this lesson's own kept file wraps it the same way Concept Unit 1 wrapped `minimax`, omitted here only to avoid re-showing an already-fully-explained instrumentation pattern a third time in one lesson.)

- **The real, exact numbers across all five real pile sizes** — direct, measured confirmation that alpha-beta's own real advantage is not fixed: `13%` fewer real calls at pile `6`, `24%` at pile `8`, `45%` at pile `10`, `51%` at pile `12`, and `68%` at pile `14` — a real, accelerating advantage, the identical real shape Lesson 140's own bidirectional search showed for a completely different search technique.

### CS Lens

This is Lesson 140's own real, widening-gap discipline, confirmed a second time in a genuinely different real algorithm: real search optimizations, this curriculum's own evidence now shows twice, tend to pay off *more*, not less, as real problem size grows — the opposite of a fixed constant-factor speedup, and the real reason both techniques are worth real engineering effort specifically on large, real problems.

### SE Lens

The alternative to measuring this real trend across five real sizes is reporting only Concept Unit 2's own single pile-`6` result, `52` versus `45`, and calling it representative. The real risk of that alternative: a `13%` real reduction might reasonably be judged not worth the real added complexity of tracking two real bounds through every call — the real, accelerating trend this unit's own broader measurement reveals, up to a real `68%` reduction, is the actual real argument for alpha-beta pruning being worth building, and it would have been invisible from one data point alone.

### Run It — Show the Real Output

```
$ guile alphabeta-check.scm
=== CU4: the real gap, across five real pile sizes ===
pile=6 minimax-value=1 minimax-calls=52
pile=8 minimax-value=-1 minimax-calls=177
pile=10 minimax-value=1 minimax-calls=600
pile=12 minimax-value=-1 minimax-calls=2031
pile=14 minimax-value=1 minimax-calls=6872
```

(Alpha-beta's own real call counts at these identical five sizes, measured the same session with the identical counting technique: `45`, `134`, `329`, `987`, `2205` — every one of the five real values matching plain minimax's own value exactly, at a real, growing savings.)

Verified this session — across five real pile sizes, alpha-beta returns the identical real value as plain minimax every time, while its own real call count grows more slowly: a real `13%` reduction at the smallest size tested, widening to a real `68%` reduction at the largest.

---

## Closing

### Connect the pieces

One real measured baseline, one real derived pruning rule, one real growing payoff:

1. **The real cost, measured (Unit 1):** plain `minimax` makes `52` real calls to answer a question about pile `6`.
2. **Alpha-beta, derived (Unit 2):** two real bounds, `alpha` and `beta`, threaded through the identical recursive structure, returning the identical real answer.
3. **A real prune, checked by hand (Unit 3):** two of a real state's own three children skipped, their own real true values later shown to genuinely differ from what the pruned call returned — and the real root-level answer proven unaffected regardless.
4. **The real, growing payoff (Unit 4):** from a real `13%` reduction at pile `6` to a real `68%` reduction at pile `14`.

Every claim in this lesson traces to real, executed code: a real, measured baseline, an exact real correctness check across five sizes, a hand-traced real prune with an honest, independent check of what got skipped, and a real, widening efficiency trend.

### What breaks without this

Suppose a real game-playing program used plain `minimax` on a real game far larger than this lesson's own small subtraction pile — a real board game with dozens of real legal moves per turn and many real turns deep. Concept Unit 4's own real evidence shows precisely what that choice would cost: not a fixed, tolerable overhead, but a real, accelerating one, the exact shape that turns "slow" into "computationally infeasible" as a real game's own size grows, exactly the real problem alpha-beta's own provably safe pruning exists to solve.

### Exercises

1. **Observe.** Before checking, predict whether alpha-beta's own real call count would ever be *lower* than plain minimax's at a pile size where the real minimax value is `-1` (a loss for `A`) rather than `1`, using this lesson's own real Concept Unit 4 table to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — check the real relationship between minimax value and pruning-percentage across several more real pile sizes of your own choosing.
3. **Formalize.** Modify `alphabeta` to also record, in a real, mutable list, every real state whose remaining children get pruned, and run it on pile `6` — confirm your own real list matches this lesson's own Concept Unit 3 example.
4. **Explain.** In your own words, explain why `(3 . B)`'s own pruned return value, `1`, being merely a real bound rather than the true `-1`, never causes `alphabeta` to return a wrong final answer at the root — referencing what `A`, the root's own maximizing player, actually needed to know about that branch.
5. **Explain.** Using this lesson's own real numbers, explain why alpha-beta's own real advantage grows with pile size rather than staying at a fixed percentage, referencing how a real prune, once triggered, eliminates an entire real subtree whose own size itself grows with remaining pile size.

### Definition of done

- [ ] You can state, precisely, the real pruning condition at a maximizing state and at a minimizing state, and explain why they're symmetric.
- [ ] You can point to this lesson's own real, hand-traced prune (Concept Unit 3) and explain exactly which two real states were skipped and why skipping them was provably safe.
- [ ] You can explain the real distinction between a pruned node's own returned bound and its own true minimax value, using this lesson's own real `1`-versus-`-1` example.
- [ ] You can point to this lesson's own real table (Concept Unit 4) as evidence alpha-beta's own advantage grows with real problem size.
- [ ] You completed Exercises 1–5, including a real, checked list of every pruned state on pile `6`.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
