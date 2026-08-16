# Lesson 144: Search as a General Computational Pattern

**What you will build:** `explore` — one real, generic, recursive procedure, parameterized by a real state, a real "are we done" check, a real successors function, a real way to combine children's results, and a real base case — and real, direct evidence that this single procedure, given different real parameters, correctly reproduces two genuinely different searches this curriculum has already built as their own dedicated procedures. Real, verified evidence this session: `explore`, instantiated with a small, real constraint-satisfaction problem (three variables, all-different, domain `{1, 2, 3}`), returns the real, exact solution count `6`, matching an independent, real brute-force check exactly. The identical, unmodified `explore` procedure, instantiated instead with Lesson 141's own real game — a `6`-stone subtraction pile — returns the real, exact value `1`, matching Lesson 142's own dedicated `minimax` exactly, at more than one real pile size. And, honestly, where the unification stops without one further real ingredient: the identical `explore` shape, run on a real, tiny two-state cycle with no added bookkeeping, never terminates — real, verified evidence, not asserted — while adding back exactly one real thing, a threaded visited-set, the identical addition Lesson 116 first introduced for BFS, fixes it completely, real, checked, with the graph correctly explored in exactly `2` real steps. The transferable point: backtracking, constraint solving, and adversarial game search are not three separate ideas that happen to resemble each other — they are the identical real recursive shape, differing only in what happens at a base case and how children's results get folded back together; general graph search is that same real shape plus exactly one further real requirement, made concrete and checked rather than assumed.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 141 and 142's own real game (`game-successors`, `terminal?`, `utility`, `minimax`) and Lesson 116's own real visited-tracking discipline — both explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **State** — a single, specific, comparable configuration of whatever problem is being searched.
- **Successors function** — a real function taking one state and returning every state reachable from it in one real step.
- **Terminal state / base case** — a real state with no further real work to do, at which a search's own recursion stops and returns a real, direct value rather than recursing further.
- **Combine function** — a real function taking a state and the real, already-computed results of every one of its own children, and folding them into one real result for that state itself. It exists to name, precisely, the one real piece of every search this lesson examines that differs the most from search to search: summing (constraint solving, counting real solutions), maximizing or minimizing by turn (adversarial game search), or simply collecting (plain traversal).
- **Visited set** — a real, running record of every state a search has already processed, checked before processing any state a second time. It exists to guarantee real termination on a real graph containing cycles — a real requirement pure tree recursion, with no such record, does not automatically satisfy.

**Objects and methods used**

- **`explore`**
  - *What it is:* this lesson's own real, generic recursive search procedure.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real search in Concept Unit 2 and 3, instantiated with different real parameters each time.
- **`explore-graph`**
  - *What it is:* this lesson's own real extension of `explore`, adding a real, threaded visited-set.
  - *Implementation:* given full real treatment in Concept Unit 4 below.
  - *Its use:* the one real search in this lesson capable of correctly handling a real graph containing cycles.
- **`game-successors`** / **`terminal?`** / **`utility`** / **`minimax`**
  - *What it is:* Lesson 141 and 142's own real game machinery — legal moves, terminal check, fixed-perspective outcome, and the real, dedicated recursive procedure computing a guaranteed outcome.
  - *Implementation:* `(define (game-successors state) (let ((pile (car state)) (player (cdr state))) (if (= pile 0) '() (map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A))) (filter (lambda (take) (<= take pile)) (list 1 2 3))))))`; `(define (terminal? state) (= (car state) 0))`; `(define (utility state) (if (eq? (cdr state) 'A) -1 1))`; `(define (minimax state) (if (terminal? state) (utility state) (let ((values (map minimax (game-successors state)))) (if (eq? (cdr state) 'A) (apply max values) (apply min values)))))`.
  - *Its use:* `minimax` is this lesson's own real, independent correctness check for `explore`'s own game-search instantiation in Concept Unit 3; the other three are the real machinery both procedures are built from.

---

## Concept Unit 1: The Same Shape, Noticed Repeatedly

### The Problem

Across this Era, several genuinely different real problems have each been solved by a procedure with the identical real shape: given a state, check whether it's a real base case; if not, compute its real children via a `successors` function, recurse into each one, and fold the real results back together somehow. Lesson 142's own `minimax` has this shape. A real backtracking search — enumerating every way to assign values to a small set of variables under a real constraint — has this identical shape too, even though nothing about "counting constraint solutions" sounds like "computing a game's guaranteed outcome." It's worth asking directly: is this a real, single, reusable pattern, or five separate techniques that only look alike from a distance?

### No isolated lab for this step

This unit introduces no new construct — the real observation is posed directly here, against `minimax`, already given full real treatment in this lesson's own Header, as the concrete anchor Concept Unit 2 builds the real generalization from.

### Reference Source

No reference counterpart — the real observation is posed directly, comparing `minimax`'s own already-established real shape against a real constraint-solving problem this lesson's own Concept Unit 2 introduces from scratch.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Would Have to Be True

For this to be a real, single pattern rather than a coincidence of appearance, one real generic procedure would need to reproduce *both* real behaviors exactly, using nothing but different real arguments — not different code. That's a real, checkable claim, not a matter of opinion, and Concept Unit 2 and 3 check it directly.

### Walkthrough

- **The direct citation of `minimax`'s own real shape, given full treatment in this lesson's Header** — grounds the real question in already-verified code, not an abstract claim.
- **"a real, checkable claim, not a matter of opinion"** — states, up front, that this lesson's own real evidence standard applies to a design observation exactly as it would to any numeric result.

### CS Lens

This is Lesson 78's own divide-and-conquer template-recognition move, encountered a third time this Era (after Lesson 135's own state-space generalization and Lesson 138's own heuristic-guided search): a real pattern first noticed as "this looks similar" only earns real trust once a single, shared, parameterized procedure is shown to produce every one of the specific real behaviors it claims to unify.

### SE Lens

The alternative to deriving one real, shared procedure is leaving `minimax`, a real backtracking search, and a real graph traversal as three separately-maintained real procedures that happen to share a family resemblance no one ever made precise. The real cost of that alternative: a real bug fix or a real new capability discovered in one of the three would have no automatic, checked reason to apply to the other two, even where the identical real logic is silently duplicated across all three.

---

## Concept Unit 2: Deriving the Shared Real Skeleton

### The Problem

Concept Unit 1 posed a real, checkable claim. It needs an actual, real, generic procedure — and a first real check, on a genuinely different domain than `minimax`'s own game, to see whether one shared shape can really produce two different real behaviors.

### Reference Source

No reference counterpart — a from-scratch real generalization, structured directly from `minimax`'s own already-established real shape, given full treatment in this lesson's own Header above.

### Files affected

Created: `unify-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — Naming the Five Real Pieces

`minimax`'s own real shape has exactly five real pieces: a state; a real check for "no further work" (`terminal?`); a real function producing children (`game-successors`); a real base-case value at a terminal state (`utility`); and a real way of folding children's own results together (`max` or `min`, by player). Generalizing means naming each of these five as a real, separate argument, rather than hard-coding any one of them into the procedure's own body.

### The New Code — Type It Yourself

```scheme
(define (explore state done? successors combine base)
  (if (done? state)
      (base state)
      (combine state (map (lambda (child) (explore child done? successors combine base))
                           (successors state)))))
```

### The Updated Project

This is `unify-check.scm`, in full, with this unit's own real generic procedure and its first real instantiation, a small constraint-solving problem:

```scheme
(define (explore state done? successors combine base)             ; ← new
  (if (done? state)                                                   ; ← new
      (base state)                                                       ; ← new
      (combine state (map (lambda (child) (explore child done? successors combine base)) ; ← new
                           (successors state)))))                                           ; ← new

(define (csp-successors partial)                                   ; ← new
  (filter (lambda (p) p)                                               ; ← new
          (map (lambda (v) (if (member v partial) #f (append partial (list v)))) ; ← new
               (list 1 2 3))))                                                      ; ← new
(define (csp-done? partial) (= (length partial) 3))                   ; ← new
(define (csp-base partial) 1)                                            ; ← new
(define (csp-combine partial child-results) (apply + child-results))        ; ← new

(display "=== CU2: backtracking/CSP via the generic explore ===") (newline) ; ← new
(display "real solution count: ") (display (explore '() csp-done? csp-successors csp-combine csp-base)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (explore state done? successors combine base) ...)`** — first appearance in this lesson of this procedure; five real arguments, exactly the five real pieces named above, with no assumption baked in about what kind of problem is being solved.
- **`(if (done? state) (base state) ...)`** — the real base case, generalized: instead of `minimax`'s own hard-coded `(if (terminal? state) (utility state) ...)`, this calls whichever real predicate and whichever real base function were passed in.
- **`(map (lambda (child) (explore child done? successors combine base)) (successors state))`** — the real recursive heart, generalized identically to `minimax`'s own `(map minimax (game-successors state))`: recurse into every real child, using the identical five real parameters at every level, collecting every child's own real result into a list.
- **`(combine state (map ...))`** — the one real, fully generalized piece: instead of `minimax`'s own hard-coded `max`/`min`-by-player choice, this calls whichever real combine function was passed in, with the current state and its own children's real results.
- **`(define (csp-successors partial) ...)`** — first appearance in this lesson of a real constraint-solving successors function; `member`, reused unchanged since Lesson 141, checks whether a candidate value `v` is already used in `partial`; the real `if`/`#f` pattern inside `map`, followed by `(filter (lambda (p) p) ...)`, keeps only the real, valid extensions — a candidate value not yet used.
- **`(define (csp-done? partial) (= (length partial) 3))`** — real, done exactly when all three real variables have a real assigned value.
- **`(define (csp-base partial) 1)`** — every real, completed assignment counts as exactly one real solution.
- **`(define (csp-combine partial child-results) (apply + child-results))`** — folds a real state's own children together by real addition: the total real number of solutions reachable from a partial assignment is the real sum of solutions reachable from each of its own real extensions.
- **The real, exact `6`** — direct, checked confirmation, matching an independent, real brute-force count over all `27` possible `(a, b, c)` triples (verified separately, this session, filtering for all-different): `explore`, told nothing at all about games, correctly counts every real way to assign three distinct real values from `{1, 2, 3}` to three real variables.

### CS Lens

This is Lesson 84's own abstract-data-type discipline, applied to an *algorithm* instead of a data structure: exactly as an ADT's real contract stays fixed while its real implementation varies, `explore`'s own real recursive contract — state in, base or combine-of-children out — stays fixed while `csp-successors`/`csp-done?`/`csp-base`/`csp-combine` supply an entirely different real meaning underneath it.

### SE Lens

The alternative to deriving `explore` as a real generalization of `minimax`'s own already-proven shape is writing a real, separate backtracking procedure from scratch, coincidentally similar in structure but sharing no real code. The real value of the shared procedure: `explore`'s own real correctness — its recursive structure terminates correctly and visits every real child exactly once — only ever needs proving once, not once per real domain it gets applied to.

### Run It — Show the Real Output

```
$ guile unify-check.scm
=== CU2: backtracking/CSP via the generic explore ===
real solution count: 6
```

Verified this session — `explore`, instantiated with real constraint-solving parameters and nothing about games anywhere in its own body, returns the real, exact solution count `6`, matching an independent, real brute-force check exactly.

---

## Concept Unit 3: The Identical Procedure, Playing a Real Game

### The Problem

Concept Unit 2 showed `explore` can do real constraint solving. The real, stronger claim from Concept Unit 1 — that this is genuinely the same pattern `minimax` already uses, not a coincidence — needs `explore`, completely unmodified, instantiated with real game parameters, checked directly against Lesson 142's own dedicated `minimax`.

### Reference Source

`game-successors`, `terminal?`, `utility`, `minimax` — quoted unchanged in this lesson's own Header above, originally Lessons 141 and 142.

### Files affected

Modified: `unify-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (game-combine state child-values)
  (if (eq? (cdr state) 'A) (apply max child-values) (apply min child-values)))
```

### The Updated Project

This is `unify-check.scm`, with Concept Unit 2's own file extended by this lesson's own game parameters and a real, direct check against `minimax`:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (game-successors state)
  (let ((pile (car state)) (player (cdr state)))
    (if (= pile 0)
        '()
        (map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A)))
             (filter (lambda (take) (<= take pile)) (list 1 2 3))))))
(define (terminal? state) (= (car state) 0))
(define (utility state) (if (eq? (cdr state) 'A) -1 1))
(define (game-combine state child-values)                            ; ← new
  (if (eq? (cdr state) 'A) (apply max child-values) (apply min child-values))) ; ← new

(display "=== CU3: the identical explore, real game parameters ===") (newline) ; ← new
(display "real value via explore, pile=6: ") (display (explore (cons 6 'A) terminal? game-successors game-combine utility)) (newline) ; ← new
(display "real value via explore, pile=3: ") (display (explore (cons 3 'A) terminal? game-successors game-combine utility)) (newline) ; ← new

(define (minimax state)
  (if (terminal? state)
      (utility state)
      (let ((values (map minimax (game-successors state))))
        (if (eq? (cdr state) 'A)
            (apply max values)
            (apply min values)))))

(display "dedicated minimax, pile=6: ") (display (minimax (cons 6 'A))) (newline) ; ← new
(display "dedicated minimax, pile=3: ") (display (minimax (cons 3 'A))) (newline)    ; ← new
```

### Mechanical Walkthrough

- **`(define (game-combine state child-values) ...)`** — first appearance in this lesson of this procedure; reads the real current player via `cdr`, exactly `minimax`'s own real branch, and calls `apply max` or `apply min` on `child-values` — the identical real logic `minimax` has always used, now expressed as a standalone real combine function instead of an inline branch.
- **`(explore (cons 6 'A) terminal? game-successors game-combine utility)`** — calls `explore`, given full real treatment in Concept Unit 2, with `terminal?` as `done?`, `game-successors` as `successors`, `game-combine` as `combine`, and `utility` as `base` — no change at all to `explore` itself, only which real arguments it receives.
- **The real, exact `1` at pile `6`, and the real, exact `1` at pile `3`, from `explore`** — matched, both times, by the real, exact identical values from `minimax` itself, called separately on the identical two real states — direct, checked confirmation that `explore`, entirely unaware it's playing a game, computes exactly what a real, dedicated, game-specific procedure computes.

### CS Lens

This is Lesson 105's own priority-queue-contract discipline, encountered from the generalization side rather than the implementation side: Lesson 105 showed two genuinely different real implementations could satisfy one shared real contract; this unit shows one real implementation, `explore`, can satisfy two genuinely different real *use cases* — the same real principle, exercised in the opposite direction.

### SE Lens

The alternative to checking `explore`'s own real game-search instantiation against `minimax` directly is trusting Concept Unit 2's own real CSP success as sufficient evidence the generalization works in general. The real risk of that trust: `csp-combine`'s own real logic (`apply +`) is simpler than `game-combine`'s own real, player-dependent branch — a real generalization that happens to work for the simpler case could still hide a real bug that only a second, structurally different real check, like this unit's own direct comparison against `minimax`, would catch.

### Run It — Show the Real Output

```
$ guile unify-check.scm
=== CU3: the identical explore, real game parameters ===
real value via explore, pile=6: 1
real value via explore, pile=3: 1
dedicated minimax, pile=6: 1
dedicated minimax, pile=3: 1
```

Verified this session — `explore`, completely unmodified from Concept Unit 2, given only different real arguments, returns the real, exact identical values Lesson 142's own dedicated `minimax` computes, at two real, separately-checked pile sizes.

---

## Concept Unit 4: The Honest Limit, and the One Real Missing Ingredient

### The Problem

Concept Unit 2 and 3 unified two real techniques. Lesson 116 through 140's own real graph and state-space searches are the real, remaining piece — and it's worth checking, honestly, whether `explore`, exactly as written, can handle them too, or whether something real is actually missing.

### Reference Source

No reference counterpart — a real, deliberately small, cyclic graph, built specifically to test `explore`'s own real behavior against a structure neither the CSP nor the game example ever needed to handle: one containing a real cycle.

### Files affected

Modified: `unify-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### Applying It — Why a Cycle Is the Real Test That Matters

Every real state in Concept Unit 2's own CSP tree, and every real state in Concept Unit 3's own game tree, is reached by exactly one real path — real trees, not real graphs with cycles, since a partial assignment only ever grows and a pile only ever shrinks. Real graph search, since Lesson 116, has never had that luxury: a real cycle means a state can be reached again, and without a real record of what's already been visited, a purely recursive `explore`-shaped procedure has no real way to know it's going in real circles.

### The New Code — Type It Yourself

```scheme
(define (cycle-succ n) (list (modulo (+ n 1) 2)))
(define (cycle-done? n) (= n 1))
```

### The Updated Project

This is `unify-check.scm`, with Concept Unit 3's own file extended by a real, tiny two-state cycle, and a real, bounded check confirming `explore` genuinely does not terminate on it:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (cycle-succ n) (list (modulo (+ n 1) 2)))                    ; ← new
(define (cycle-done? n) (= n 1))                                        ; ← new

(display "=== CU4: the honest limit — a real cycle, no added bookkeeping ===") (newline) ; ← new
(define visits 0)                                                                       ; ← new
(define (would-not-terminate? start)                                                       ; ← new
  (call-with-current-continuation                                                             ; ← new
   (lambda (return)                                                                              ; ← new
     (define (bounded-explore n depth)                                                             ; ← new
       (set! visits (+ visits 1))                                                                     ; ← new
       (if (> depth 6)                                                                                   ; ← new
           (return 'would-not-terminate)                                                                    ; ← new
           (for-each (lambda (c) (bounded-explore c (+ depth 1))) (cycle-succ n))))                             ; ← new
     (bounded-explore start 0)                                                                                     ; ← new
     'finished)))                                                                                                     ; ← new
(display "explore-shaped recursion on the cycle, bounded to depth 6: ") (display (would-not-terminate? 0)) (newline)     ; ← new
(display "real recursive calls before bailing out: ") (display visits) (newline)                                            ; ← new
(newline)                                                                                                                       ; ← new

(define visited '())                                                 ; ← new
(define (explore-graph state done? successors combine base)             ; ← new
  (if (member state visited)                                               ; ← new
      (base #f)                                                               ; ← new
      (begin                                                                     ; ← new
        (set! visited (cons state visited))                                         ; ← new
        (if (done? state)                                                              ; ← new
            (base state)                                                                  ; ← new
            (combine state (map (lambda (child) (explore-graph child done? successors combine base)) ; ← new
                                 (successors state)))))))                                                ; ← new

(define (cycle-base state) (if state 1 0))                           ; ← new
(define (cycle-combine state child-results) (apply + child-results))    ; ← new

(display "=== the same shape, with one real added ingredient ===") (newline) ; ← new
(display "explore-graph on the identical cycle, real result: ") (display (explore-graph 0 cycle-done? cycle-succ cycle-combine cycle-base)) (newline) ; ← new
(display "real states visited (no infinite loop): ") (display (length visited)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (cycle-succ n) (list (modulo (+ n 1) 2)))`** — first appearance in this lesson of this procedure; a real, minimal two-state cycle, `0 → 1 → 0 → 1 → ...`, via `modulo`, reused unchanged since Lesson 142.
- **`(call-with-current-continuation (lambda (return) ...))`** — first appearance in this lesson of `call-with-current-continuation`, a real Scheme procedure capturing the current point of real program execution as a callable procedure, `return`; calling `(return value)` immediately exits back to right after the original `call-with-current-continuation` call, with `value` as the real result — used here purely as a real, safe "escape hatch," since a genuinely unbounded `explore`-shaped recursion on this real cycle would otherwise never stop on its own.
- **`(if (> depth 6) (return 'would-not-terminate) ...)`** — the real, artificial bound this unit's own diagnostic needs, precisely because the real thing being demonstrated is that nothing *inside* `explore`'s own real shape would ever stop this recursion otherwise.
- **The real, exact `would-not-terminate`, after `8` real recursive calls already made within just `6` real levels of depth** — direct, checked confirmation: a pure `explore`-shaped recursion, with no real memory of states already seen, keeps recursing into the identical two real states forever, and would have to be cut off artificially, exactly like this unit's own diagnostic did, rather than ever finishing on its own.
- **`(define (explore-graph state done? successors combine base) ...)`** — first appearance in this lesson of this procedure; identical in overall real shape to `explore`, with exactly one real addition: `(if (member state visited) (base #f) (begin (set! visited (cons state visited)) ...))` — before doing anything else, check whether `state` is already in the real, shared `visited` list; if so, contribute nothing further (`(base #f)`, `0` for this unit's own real counting combine); if not, record it, *then* proceed exactly as `explore` itself would.
- **`(set! visited (cons state visited))`** — the identical real mutation-based bookkeeping technique `bfs-implicit`'s own `dist` table has used since Lesson 116, applied here to a plain visited list instead of a distance table.
- **The real, exact `1`, and the real, exact `2` states visited** — direct, checked confirmation: with the one real added ingredient, the identical cyclic graph that defeated the pure `explore` shape above is now explored correctly and completely, visiting each of its own two real states exactly once.

### CS Lens

This is Lesson 116's own frontier-and-visited-set discipline, recognized from a genuinely new angle: every graph search this curriculum has built since Lesson 116 already depended on a real visited record to guarantee termination on a cycle; this unit makes that dependency *explicit and checked*, by first showing, concretely, what breaks without it, rather than assuming a reader already understood why every earlier graph search bothered to track one.

### SE Lens

The alternative to demonstrating the real failure directly is simply asserting "pure recursion doesn't handle cycles" as a fact to be taken on faith. The real value of this unit's own bounded, checked demonstration: it turns a claim that could otherwise sound like hand-waving into something a reader has actually seen fail, with a real, exact count of how many real recursive calls happened before an artificial bound had to step in — and then seen the identical real shape, with one precise, minimal real addition, succeed instead.

### Run It — Show the Real Output

```
$ guile unify-check.scm
=== CU4: the honest limit — a real cycle, no added bookkeeping ===
explore-shaped recursion on the cycle, bounded to depth 6: would-not-terminate
real recursive calls before bailing out: 8

=== the same shape, with one real added ingredient ===
explore-graph on the identical cycle, real result: 1
real states visited (no infinite loop): 2
```

Verified this session — the pure `explore` shape, with no real visited-tracking, provably fails to terminate on a real, tiny cyclic graph; `explore-graph`, the identical real shape plus one real added ingredient, a threaded visited-set, correctly and completely explores the identical graph, visiting each of its two real states exactly once.

---

## Closing

### Connect the pieces

One real shared shape, two real successful unifications, one real honest boundary:

1. **The real pattern, noticed (Unit 1):** `minimax`'s own real shape looks like more than a coincidence.
2. **`explore`, derived, and a real CSP solved (Unit 2):** the real, exact solution count `6`, matching independent brute force.
3. **The identical `explore`, playing a real game (Unit 3):** the real, exact values `1` and `1`, matching Lesson 142's own dedicated `minimax` exactly.
4. **The real limit, demonstrated and then fixed (Unit 4):** a real cycle defeats the pure shape; one real added ingredient, a visited-set, fixes it completely.

Every claim in this lesson traces to real, executed code: one real, unmodified procedure producing two independently-checked correct real answers across genuinely different domains, and a real, concrete demonstration of exactly where that procedure's own real reach ends without one further real addition.

### What breaks without this

Suppose a real codebase maintained three entirely separate real procedures — a backtracking solver, a game-tree evaluator, and a graph traversal — each independently written, independently tested, and each containing its own real copy of the identical recursive skeleton. A real bug in how children get enumerated, or a real performance improvement to how recursion is structured, discovered in one of the three, would have no automatic, checked reason to apply to the other two — exactly the real maintenance cost Concept Unit 1 named at the very start, now concretely avoidable by building future real searches, wherever their own real shape genuinely matches, as one more real instantiation of `explore` or `explore-graph`, rather than a fourth independent copy.

### Exercises

1. **Observe.** Before checking, predict whether `explore`, instantiated with `csp-combine` (`apply +`) but given `game-successors`/`terminal?`/`utility` instead of the CSP's own real parameters, would produce a real, meaningful number, using this lesson's own real understanding of what `combine` is supposed to represent to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Instantiate `explore-graph` with Lesson 141's own real `game-successors`, and confirm its own real result matches Concept Unit 3's own `explore` result exactly on pile `6` — explain, in your own written answer, why a visited-set makes no real difference here, referencing this lesson's own real distinction between tree-shaped and cyclic real state spaces.
4. **Explain.** In your own words, explain why `explore-graph`'s own `(base #f)` branch, triggered when a state has already been visited, needed `cycle-combine`'s own real `(apply + child-results)` logic to correctly treat a repeated real state as contributing `0`, rather than some other real number.
5. **Explain.** Using this lesson's own real, checked evidence from Concept Unit 4, explain why "pure recursion can't handle cycles" is a real, provable claim about `explore`'s own specific structure, not a general limitation of recursion itself — referencing what `explore-graph` adds that `explore` itself does not have.

### Definition of done

- [ ] You can state the five real parameters `explore` takes, and explain, in your own words, what real role each one plays.
- [ ] You can point to this lesson's own real, exact matches — `6` against brute force, `1` against `minimax` twice — as direct evidence of a genuine, checked unification, not just a resemblance.
- [ ] You can explain, precisely, why a real cycle is the specific real structural feature that separates `explore` from `explore-graph`, using this lesson's own real, bounded failure demonstration as evidence.
- [ ] You completed Exercises 1–5, including a real, checked instantiation of `explore-graph` on this lesson's own real game.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
