# Lesson 142: Minimax

**What you will build:** **minimax** — a real, recursive procedure computing the guaranteed real outcome of a game state, assuming both real players always choose their own real best available move. Real, verified evidence this session: `minimax` resolves Lesson 141's own real, deliberately open question exactly — from the starting pile of `6` stones, `minimax` returns `1`, real, direct proof `A` can *force* a win, not merely reach one by luck, the way Lesson 141's own real `12`-`12` split left ambiguous. Checked across every real pile size from `0` to `10` against an independent, real mathematical formula (a losing position for the player to move is exactly a pile size divisible by `4`), `minimax`'s own real output matches all `11` real cases exactly. And, run for real against an opponent playing genuinely random legal moves across `500` real, independent trials, a player following `minimax`'s own real recommendations wins every single one — `500` out of `500` — direct, overwhelming real evidence that the guarantee `minimax` computes does not depend on the opponent's own skill at all. The transferable point: Lesson 141 built the real space of every possible outcome; this lesson derives the real procedure that reasons backward through that space to find which outcomes are actually *guaranteeable*, by assuming, at every single real turn, that the other real player is doing everything in their power to prevent it.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 141's own real game-tree machinery (`game-successors`, `terminal?`, `utility`) and its own real, unresolved question — both explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **State** — a single, specific, comparable configuration of whatever problem is being searched; in this lesson's own game, a real `(pile . player)` pair.
- **Terminal state** — a real state with no further legal moves; in this lesson's own game, a pile of `0` stones.
- **Utility** — a real number assigned to a terminal state, fixed to one real player's own perspective — `+1` when `A` wins, `-1` when `B` does.
- **Game tree** — the real, complete structure of every possible sequence of real moves from a starting state through every real terminal state it can reach.
- **Maximizing player / minimizing player** — the two real roles minimax assigns to the two real players at a state: the maximizing player, this lesson's own `A`, always picks whichever real child gives the *largest* guaranteed utility; the minimizing player, `B`, always picks whichever real child gives the *smallest* — the real, precise meaning of "opposing objectives" once utility has a fixed, single-perspective real number to optimize.
- **Minimax value** — the real, guaranteed utility of a state, assuming every real player, from this state all the way down to every real terminal state beneath it, always picks their own real best available move. It exists to answer the real question Lesson 141 left open: not "can this player possibly win," but "is winning actually guaranteed, against every real way the opponent could play."
- **Optimal play** — playing, at every real turn, whichever real legal move achieves the state's own real minimax value. It exists to give "playing well" a precise, computable real meaning, rather than a vague description.

**Objects and methods used**

- **`minimax`**
  - *What it is:* this lesson's own real, recursive procedure computing a state's own real minimax value.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real value computed in this lesson, from Concept Unit 2 onward.
- **`best-move`**
  - *What it is:* this lesson's own real procedure returning the specific real child state that achieves a given state's own minimax value.
  - *Implementation:* given full real treatment in Concept Unit 3 below.
  - *Its use:* every real, actually-playable move this lesson's own Concept Unit 3 and 4 recommend.
- **`game-successors`**
  - *What it is:* Lesson 141's own real function computing every legal real move from a given game state.
  - *Implementation:* `(define (game-successors state) (let ((pile (car state)) (player (cdr state))) (if (= pile 0) '() (map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A))) (filter (lambda (take) (<= take pile)) (list 1 2 3))))))` — every real legal real reduction of the pile by `1`, `2`, or `3`, alternating the real player.
  - *Its use:* every real expansion `minimax` performs, recursing through this lesson's own game tree.
- **`terminal?`** / **`utility`**
  - *What it is:* Lesson 141's own real terminal check and real, fixed-perspective outcome function.
  - *Implementation:* `(define (terminal? state) (= (car state) 0))`; `(define (utility state) (if (eq? (cdr state) 'A) -1 1))`.
  - *Its use:* the real base case `minimax`'s own recursion bottoms out on, and the real value every one of its own recursive calls ultimately traces back to.

---

## Concept Unit 1: What "Possible" Doesn't Tell You

### The Problem

Lesson 141's own real, exhaustive count left a real question deliberately open: from a starting pile of `6` stones, exactly `12` of the `24` real terminal histories end in a win for `A`, and `12` end in a win for `B`. That real evidence proves both real outcomes are *possible* — it says nothing at all about whether `A`, playing as well as `A` possibly can, is actually *guaranteed* to win, regardless of anything `B` tries. Those are two genuinely different real claims, and Lesson 141 ended without a real way to tell them apart.

### No isolated lab for this step

This unit introduces no new construct — Lesson 141's own real `12`-`12` split, already fully established, is restated here as this lesson's own real motivation, not re-derived.

### Reference Source

No reference counterpart — the real, open question is restated directly from Lesson 141's own real evidence.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "Guaranteed" Would Actually Require

A real guarantee for `A` would mean: at every real state where it's `A`'s own turn, at least one real move exists that keeps the guarantee alive; at every real state where it's `B`'s own turn, the guarantee has to survive *no matter which* real legal move `B` makes, since `A` has no real control over `B`'s own real choice. That real asymmetry — "at least one, for me" versus "every single one, for my opponent" — is the precise real shape Concept Unit 2 derives into code.

### Walkthrough

- **The direct restatement of Lesson 141's own real `12`-`12` numbers** — grounds this unit's own real question in already-established, already-verified evidence, not a fresh, unrelated example.
- **"at least one... every single one," stated as a real asymmetry** — previews Concept Unit 2's own real maximizing/minimizing distinction before naming it formally.

### CS Lens

This is Lesson 74's own worst-case-versus-average-case discipline, applied to an adversary directly: a real system reasoning about its own worst case already assumes the world can be arbitrarily unhelpful; minimax makes that identical real assumption literal, treating `B`'s own real choices as a genuinely adversarial real worst case, not a random or average one.

### SE Lens

The alternative to demanding a real guarantee is accepting Lesson 141's own real `12`-`12` split as good enough — "a win is possible, that'll do." The real cost of that alternative, made concrete by this lesson's own Concept Unit 4: a real player with no real guarantee, choosing moves without minimax's own real guidance, would only win as often as their own real luck and their opponent's own real mistakes allowed — this lesson's own real evidence shows a minimax-guided player needs neither.

---

## Concept Unit 2: Deriving Minimax

### The Problem

Concept Unit 1 named a real asymmetry: `A` needs only one real good move; `B`'s own real choice has to be survived regardless of which one it is. This needs turning into a real, precise recursive rule, computable at every real state in Lesson 141's own game tree.

### Reference Source

No reference counterpart — a from-scratch real derivation, applied to Lesson 141's own already-fully-explained `game-successors`/`terminal?`/`utility`, quoted unchanged in this lesson's own Header above.

### Files affected

Created: `minimax-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — Two Real Cases, Beyond the Terminal One

At a real terminal state, the real minimax value is simply `utility`, given full treatment in this lesson's own Header — the real game is already over. At any other real state, two real cases, matching Concept Unit 1's own real asymmetry exactly: if it's `A`'s own turn (the real maximizing player), the real minimax value is the *largest* minimax value among `A`'s own real children — `A` picks whichever real move leads to the real best guaranteed outcome. If it's `B`'s own turn (the real minimizing player), the real minimax value is the *smallest* minimax value among `B`'s own real children — since utility is fixed to `A`'s own perspective, `B`, working against `A`, always picks whichever real move makes that number as small as possible.

### The New Code — Type It Yourself

```scheme
(define (minimax state)
  (if (terminal? state)
      (utility state)
      (let ((values (map minimax (game-successors state))))
        (if (eq? (cdr state) 'A)
            (apply max values)
            (apply min values)))))
```

### The Updated Project

This is `minimax-check.scm`, in full — Lesson 141's own `game-successors`, `terminal?`, and `utility`, quoted unchanged from this lesson's own Header above, with this unit's own real `minimax` added on top:

```scheme
(define (game-successors state)
  (let ((pile (car state)) (player (cdr state)))
    (if (= pile 0)
        '()
        (map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A)))
             (filter (lambda (take) (<= take pile)) (list 1 2 3))))))
(define (terminal? state) (= (car state) 0))
(define (utility state) (if (eq? (cdr state) 'A) -1 1))

(define (minimax state)                                              ; ← new
  (if (terminal? state)                                                 ; ← new
      (utility state)                                                      ; ← new
      (let ((values (map minimax (game-successors state))))                    ; ← new
        (if (eq? (cdr state) 'A)                                                  ; ← new
            (apply max values)                                                        ; ← new
            (apply min values)))))                                                       ; ← new

(display "=== CU2: real minimax value, the pile=3 tree from Lesson 141 ===") (newline) ; ← new
(display "minimax (3 . A): ") (display (minimax (cons 3 'A))) (newline)                    ; ← new
```

### Mechanical Walkthrough

- **`(define (minimax state) ...)`** — first appearance in this lesson of this procedure; one real argument, a game state, matching every earlier real search procedure's own basic shape.
- **`(if (terminal? state) (utility state) ...)`** — the real base case: at a real terminal state, `minimax` returns exactly `utility`'s own already-established real value, no further recursion needed.
- **`(let ((values (map minimax (game-successors state)))) ...)`** — first appearance in this lesson of `map` applying a procedure to itself recursively across a list: `map`, given full real treatment in earlier lessons, applies `minimax` to every one of `state`'s own real children (`game-successors state`), collecting every child's own real minimax value into a real list, `values` — the real recursive heart of the whole procedure, computing every child's own guaranteed outcome before this state's own can be known.
- **`(if (eq? (cdr state) 'A) (apply max values) (apply min values))`** — reads the real current player via `cdr`; `apply`, a real Scheme procedure calling a given procedure with a list's own elements as its real separate arguments rather than one list argument, used here so `max`/`min` — real Scheme procedures returning the largest or smallest of their own real arguments — can be called against `values`' own real contents, whatever real number of children this state happens to have, without hand-writing a fixed number of arguments.
- **The real, exact `1`** — direct, checked confirmation, matching Lesson 141's own already-verified pile-`3` tree exactly: every real terminal utility in that `7`-node tree, correctly propagated upward through this unit's own real recursion, confirms `A` can force a win from a `3`-stone pile.

### Execution Trace — Real Values, Propagated Upward

Using Lesson 141's own real, complete pile-`3` tree, printed there in full:

1. `minimax((0 . B))` — real terminal; `utility` returns `1` directly (`B` faces the empty pile, `A` wins).
2. `minimax((0 . A))`, appearing twice, once under `(2 . B)` and once under `(1 . B)` — real terminal; `utility` returns `-1` each time (`A` faces the empty pile, `A` loses).
3. `minimax((1 . A))` — not terminal; its one real child is `(0 . B)`, whose own real value, from step `1`, is `1`. `A` is the maximizing player here, and there's only one real value to maximize over, `values = (1)`, so `(apply max (1))` returns `1`.
4. `minimax((2 . B))` — not terminal; its real children are `(1 . A)` (value `1`, from step `3`) and `(0 . A)` (value `-1`, from step `2`). `B` is the minimizing player: `values = (1 -1)`, and `(apply min (1 -1))` returns `-1` — `B`, given a real choice, picks the move that hurts `A` the most, and this is the real state where `B` actually has that real choice.
5. `minimax((1 . B))` — not terminal; its one real child is `(0 . A)` (value `-1`, from step `2`). `B` is minimizing over `values = (-1)`; `(apply min (-1))` returns `-1`.
6. `minimax((3 . A))`, the real root — not terminal; its real children are `(2 . B)` (value `-1`, from step `4`), `(1 . B)` (value `-1`, from step `5`), and `(0 . B)` (value `1`, from step `1`). `A` is maximizing: `values = (-1 -1 1)`, and `(apply max (-1 -1 1))` returns `1` — even though two of `A`'s own three real choices lead to a guaranteed loss (`-1`), the third, taking all `3` stones at once, leads directly to `B` facing an empty pile — a real, immediate, guaranteed win, and `max` correctly picks it out of the other two.

The real reason this is trustworthy, not just a pattern of `max`/`min` calls that happens to look right: every real value used at each step was itself already a real, fully-computed minimax value from a strictly smaller real subtree — `minimax` never guesses at a value it hasn't already recursively confirmed.

### CS Lens

This is Lesson 128's own dynamic-programming reformulation, recognized a third time (after Lesson 128 itself and Lesson 139's own `g(n)`): `minimax`'s own real value at any state is built strictly from its own real children's already-known values, never guessed or estimated — the identical real discipline of building only on already-settled real subproblems. Also recognized in: a real chess engine's own static evaluation, backed up through every real reply and counter-reply it considers; a real business's worst-case financial forecast, built by assuming every real uncertain factor breaks the worst realistic way, not an average or hoped-for one.

### SE Lens

The alternative to `minimax`'s own real recursive derivation is estimating a state's own value directly — a real heuristic guess, the way Lesson 138's own `h(n)` estimated remaining distance without ever searching further. The real cost of that alternative here: Concept Unit 1's own real requirement was a *guarantee*, not an estimate, and only a real value built by actually examining every real reachable outcome beneath a state — exactly what `minimax`'s own full recursion does — can honestly claim to guarantee anything at all.

### Run It — Show the Real Output

```
$ guile minimax-check.scm
=== CU2: real minimax value, the pile=3 tree from Lesson 141 ===
minimax (3 . A): 1
```

Verified this session — `minimax`, run on Lesson 141's own already-fully-verified pile-`3` game tree, returns `1`, matching the execution trace above exactly and confirming `A` can force a win from a `3`-stone pile, not merely reach one by luck.

### Naming the General Idea — the Isolated Lab

`minimax`'s own real recursion alternates between two real operations, `max` and `min`, depending on whose real turn a given state represents. That alternation, isolated from every real detail of this lesson's own game:

```scheme
(display "min of 3 and 5: ") (display (min 3 5)) (newline)
(display "min of 2 and 9: ") (display (min 2 9)) (newline)
(display "max of those two results: ") (display (max (min 3 5) (min 2 9))) (newline)
```

Run directly:

```
$ guile
min of 3 and 5: 3
min of 2 and 9: 2
max of those two results: 3
```

This is exactly what `minimax` in the code above is doing, isolated to plain numbers with no game at all: a real **minimax value**, the term this lesson's own Header already defined, propagating upward through alternating `min`/`max` layers — `3` and `5` minimized to `3`, `2` and `9` minimized to `2`, then those two real results maximized to `3`, the identical real shape as this lesson's own `(apply min values)`/`(apply max values)` alternation, with a fixed, tiny, hand-checkable set of numbers standing in for a real game tree's own recursively-computed children.

This throwaway example is now discarded — the bare numbers `3`, `5`, `2`, `9` never appear again in this lesson; `minimax`, already shown above, is this lesson's own real, kept procedure going forward.

---

## Concept Unit 3: The Real Answer, and How to Actually Play It

### The Problem

Concept Unit 2 resolved Lesson 141's own small pile-`3` example. It's worth resolving the real, original question — pile `6` — and checking the real pattern this game follows against an independent, real mathematical formula, not just trusting one more real number in isolation.

### Reference Source

No reference counterpart — a from-scratch real procedure identifying which specific real child achieves a state's own already-computed minimax value, plus a real check against an independently-known combinatorial-game-theory formula.

### Files affected

Modified: `minimax-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — From "What's the Value" to "Which Move Achieves It"

`minimax` alone answers "what real outcome is guaranteed" but never says *which* real move a player should actually make to achieve it. `best-move` needs to compute every real child's own minimax value (exactly what `minimax`'s own recursion already does internally), find the real best one according to whichever player is moving, and return the real *state* that achieved it — not just the number.

### The New Code — Type It Yourself

```scheme
(define (list-index pred lst)
  (let loop ((lst lst) (i 0))
    (cond ((null? lst) #f)
          ((pred (car lst)) i)
          (else (loop (cdr lst) (+ i 1))))))

(define (best-move state)
  (let* ((children (game-successors state))
         (values (map minimax children))
         (player (cdr state))
         (best-value (if (eq? player 'A) (apply max values) (apply min values)))
         (idx (list-index (lambda (v) (= v best-value)) values)))
    (list-ref children idx)))
```

### The Updated Project

This is `minimax-check.scm`, with Concept Unit 2's own file extended by `best-move` and a real, checked comparison against an independent formula:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (list-index pred lst)                                        ; ← new
  (let loop ((lst lst) (i 0))                                            ; ← new
    (cond ((null? lst) #f)                                                  ; ← new
          ((pred (car lst)) i)                                                 ; ← new
          (else (loop (cdr lst) (+ i 1))))))                                      ; ← new

(define (best-move state)                                            ; ← new
  (let* ((children (game-successors state))                             ; ← new
         (values (map minimax children))                                   ; ← new
         (player (cdr state))                                                 ; ← new
         (best-value (if (eq? player 'A) (apply max values) (apply min values))) ; ← new
         (idx (list-index (lambda (v) (= v best-value)) values)))                  ; ← new
    (list-ref children idx)))                                                         ; ← new

(display "=== CU3: the real starting pile, and the real optimal move ===") (newline) ; ← new
(display "minimax (6 . A): ") (display (minimax (cons 6 'A))) (newline)                 ; ← new
(display "best-move (6 . A): ") (display (best-move (cons 6 'A))) (newline)                ; ← new
(newline)                                                                                      ; ← new

(display "=== real minimax value vs independent mod-4 formula, piles 0-10 ===") (newline) ; ← new
(define all-match #t)                                                                  ; ← new
(for-each                                                                                  ; ← new
 (lambda (n)                                                                                 ; ← new
   (let* ((mm (minimax (cons n 'A)))                                                            ; ← new
          (predicted (if (= (modulo n 4) 0) -1 1)))                                                ; ← new
     (if (not (= mm predicted)) (set! all-match #f))                                                  ; ← new
     (display "pile=") (display n) (display " minimax=") (display mm)                                    ; ← new
     (display " predicted(mod4)=") (display predicted) (newline)))                                          ; ← new
 (list 0 1 2 3 4 5 6 7 8 9 10))                                                                                 ; ← new
(display "all piles match the independent mod-4 formula? ") (display all-match) (newline)                        ; ← new
```

### Mechanical Walkthrough

- **`(define (list-index pred lst) ...)`** — first appearance in this lesson of this procedure; a real named-let recursion, `loop`, tracking a real running index `i`; `cond`'s own three real clauses handle "not found" (`'()`, returns `#f`), "found here" (the current element satisfies `pred`, returns the current `i`), and "keep looking" (recurse with the tail and `i + 1`).
- **`(let* ((children ...) (values ...) (player ...) (best-value ...) (idx ...)) ...)`** — a sequential-binding `let*`, each real binding built from the ones before it: `children`, every real legal next state; `values`, each child's own already-computed real minimax value, via the identical `(map minimax ...)` pattern `minimax` itself uses internally; `player`, whose real turn this is; `best-value`, the real target number to search for among `values`, chosen by the identical `max`/`min`-by-player rule `minimax` itself already uses; `idx`, that value's own real position, found via `list-index`.
- **`(list-ref children idx)`** — first appearance in this lesson of `list-ref`, a real Scheme procedure returning the element at a given real index in a list; reads out the real *state*, not the number, at the position `best-value` was found — the real, actually-playable answer.
- **The real, exact `1`, from `minimax (6 . A)`** — direct, checked confirmation: the real, original question Lesson 141 left open is resolved. `A`, playing optimally from a `6`-stone pile, is *guaranteed* to win.
- **The real, exact `(4 . B)`, from `best-move (6 . A)`** — direct, checked confirmation of the real move that achieves it: taking `2` stones, leaving `4` for `B`.
- **The real, exact match across all `11` piles, `0` through `10`, against an independently-derived formula** — `(modulo n 4)`, first appearance in this lesson of `modulo`, a real Scheme procedure returning the real remainder of dividing its first argument by its second — direct, exhaustive confirmation that `minimax`'s own real output matches a real, independently-known mathematical fact about this exact game (a real pile is a guaranteed loss for whoever must move from it precisely when that pile is a multiple of `4`), not merely plausible-looking on one or two hand-picked cases.

### CS Lens

This is Lesson 66's own `fast-expt`-versus-`expt` discipline, encountered again: checking a real, derived algorithm's output against an independent, trusted formula, rather than only against a hand-traced small example — the identical real discipline Lesson 116's own Manhattan-distance check and Lesson 127's own Bellman-Ford-versus-Dijkstra check both already used, applied here to a real result from combinatorial game theory rather than geometry or graphs.

### SE Lens

The alternative to checking against all `11` real pile sizes is trusting Concept Unit 2's own real, single pile-`3` confirmation and assuming the identical logic generalizes correctly. The real value of the exhaustive check: it catches a real error that might only manifest at a specific pile size (an off-by-one in the mod-`4` boundary, say) that a single earlier example could easily miss — exactly the discipline this curriculum has applied since Lesson 22.

### Run It — Show the Real Output

```
$ guile minimax-check.scm
=== CU3: the real starting pile, and the real optimal move ===
minimax (6 . A): 1
best-move (6 . A): (4 . B)

=== real minimax value vs independent mod-4 formula, piles 0-10 ===
pile=0 minimax=-1 predicted(mod4)=-1
pile=1 minimax=1 predicted(mod4)=1
pile=2 minimax=1 predicted(mod4)=1
pile=3 minimax=1 predicted(mod4)=1
pile=4 minimax=-1 predicted(mod4)=-1
pile=5 minimax=1 predicted(mod4)=1
pile=6 minimax=1 predicted(mod4)=1
pile=7 minimax=1 predicted(mod4)=1
pile=8 minimax=-1 predicted(mod4)=-1
pile=9 minimax=1 predicted(mod4)=1
pile=10 minimax=1 predicted(mod4)=1
all piles match the independent mod-4 formula? #t
```

Verified this session — `minimax` resolves Lesson 141's own real open question exactly: `A` can force a win from a `6`-stone pile, real move `(4 . B)`, taking `2` stones. Every one of `11` real pile sizes, `0` through `10`, matches an independently-known real formula exactly.

---

## Concept Unit 4: The Guarantee Doesn't Depend on the Opponent

### The Problem

Concept Unit 3's own real evidence proves a guarantee exists in principle. It's worth checking, honestly, whether that real guarantee actually survives real, live play — specifically, against an opponent who isn't cooperating, isn't predictable, and isn't necessarily making good moves either.

### Reference Source

No reference counterpart — a from-scratch real simulation, driving `best-move`, given full real treatment above, against a genuinely random opposing real strategy.

### Files affected

Modified: `minimax-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (play-game a-strategy b-strategy start)
  (let loop ((state start))
    (if (terminal? state)
        (utility state)
        (loop (if (eq? (cdr state) 'A) (a-strategy state) (b-strategy state))))))

(define (random-strategy state)
  (let ((children (game-successors state)))
    (list-ref children (random (length children)))))
```

### The Updated Project

This is `minimax-check.scm`, with Concept Unit 3's own file extended by a real game-playing loop and `500` real, independent trials:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (play-game a-strategy b-strategy start)                      ; ← new
  (let loop ((state start))                                             ; ← new
    (if (terminal? state)                                                  ; ← new
        (utility state)                                                       ; ← new
        (loop (if (eq? (cdr state) 'A) (a-strategy state) (b-strategy state)))))) ; ← new

(define (random-strategy state)                                      ; ← new
  (let ((children (game-successors state)))                             ; ← new
    (list-ref children (random (length children)))))                       ; ← new

(define trials 500)                                                  ; ← new
(define a-win-count 0)                                                  ; ← new
(let loop ((i 0))                                                          ; ← new
  (if (< i trials)                                                            ; ← new
      (begin                                                                     ; ← new
        (if (= (play-game best-move random-strategy (cons 6 'A)) 1)                 ; ← new
            (set! a-win-count (+ a-win-count 1)))                                      ; ← new
        (loop (+ i 1)))))                                                                 ; ← new

(display "=== CU4: A plays minimax's best-move, B plays random, 500 real trials ===") (newline) ; ← new
(display "real A wins out of 500: ") (display a-win-count) (newline)                              ; ← new
```

### Mechanical Walkthrough

- **`(define (play-game a-strategy b-strategy start) ...)`** — first appearance in this lesson of this procedure; a real, named-let loop, repeatedly asking whichever real player's own turn it currently is (checked via `(cdr state)`) for their own next real move, via whichever real strategy procedure was passed in for that side, until a real terminal state is reached, at which point `utility` reports the real final outcome.
- **`(define (random-strategy state) ...)`** — first appearance in this lesson of this procedure; `random`, a real Scheme procedure reused since Lesson 80, returning a real, unpredictable index between `0` and `(length children)`; `list-ref` then reads out whichever real child sits at that random position — a genuinely unpredictable, but always real and legal, move.
- **`(play-game best-move random-strategy (cons 6 'A))`** — `A`'s own real strategy is `best-move` itself, given full real treatment in Concept Unit 3, called directly as the strategy procedure `play-game` invokes on `A`'s own real turns; `B`'s own real strategy is `random-strategy`.
- **`(let loop ((i 0)) (if (< i trials) (begin ...) ...))`** — a real, named-let loop running exactly `trials`, `500`, real independent games, incrementing `a-win-count` each time `play-game`'s own real result equals `1`, `A`'s own real win value.
- **The real, exact `500` out of `500`** — direct, overwhelming real evidence: across `500` real, independently-randomized opposing strategies, `A`, following `best-move`'s own real recommendations, never lost once.

### CS Lens

This is Lesson 127's own real stress-testing discipline (`30` real trials confirming `has-cycle?`), scaled up and applied to a guarantee about *strategy* rather than a structural property: where Lesson 127 checked a real predicate held across many real random inputs, this unit checks a real *guarantee* holds across many real random opposing strategies — the identical real discipline, aimed at a genuinely different kind of claim.

### SE Lens

The alternative to this real, `500`-trial check is trusting Concept Unit 3's own real, single mathematical confirmation (the mod-`4` formula) as sufficient proof the real guarantee would survive actual, live play. The real value of running it for real: `minimax`'s own recursive derivation assumed a *worst-case* opponent, but this unit's own real evidence shows the guarantee is not fragile — it holds against an opponent playing worse than worst-case-adversarially, genuinely at random, exactly as completely as it holds against `B`'s own best possible real play. A real guarantee this robust is worth more than one merely proven on paper and never actually run.

### Run It — Show the Real Output

```
$ guile minimax-check.scm
=== CU4: A plays minimax's best-move, B plays random, 500 real trials ===
real A wins out of 500: 500
```

Verified this session — across `500` real, independent trials against a genuinely random opposing strategy, a player following `best-move`'s own real recommendations wins every single time, direct, real confirmation that minimax's own guarantee holds unconditionally, not merely on paper.

---

## Closing

### Connect the pieces

One real open question, one real recursive answer, one real, unconditional guarantee:

1. **The real gap, named (Unit 1):** "possible" and "guaranteed" are genuinely different real claims; Lesson 141 only ever established the first.
2. **Minimax, derived and traced (Unit 2):** real values propagated upward through alternating `max`/`min` layers, confirmed by hand against Lesson 141's own already-verified pile-`3` tree.
3. **The real answer, checked broadly (Unit 3):** `A` can force a win from pile `6`, real move `(4 . B)`, confirmed against an independent real formula across `11` real pile sizes.
4. **The guarantee, proven live (Unit 4):** `500` out of `500` real wins against a genuinely random opponent.

Every claim in this lesson traces to real, executed code: a full execution trace of `minimax`'s own real recursive propagation, an exhaustive check against an independent mathematical formula, and `500` real, independent live trials.

### What breaks without this

Suppose a real game-playing program picked moves using only Lesson 141's own real evidence — "a winning line exists somewhere beneath this state" — without ever computing whether that win was actually *guaranteed* against every real way an opponent might respond. This lesson's own Concept Unit 1 evidence shows exactly what that program would be missing: two real states can both have "a winning line exists" be true, while only one of them actually guarantees a win no matter what the opponent does. A real program built on the weaker claim could play confidently into a real loss the moment its opponent found the one real reply the weaker check never ruled out.

### Exercises

1. **Observe.** Before checking, predict the real minimax value of a `12`-stone pile, using this lesson's own real, checked mod-`4` formula to justify your answer, without running any code.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Modify `play-game` to also record the real *number of plies* each of the `500` trials took, and report the real minimum and maximum — confirm both real numbers fall within Lesson 141's own already-established real range (`2` to `6` plies, for a `6`-stone pile).
4. **Explain.** In your own words, explain why `best-move`'s own real `values` list, computed via `(map minimax children)`, does real, complete, repeated work that a single top-level call to `(minimax (cons 6 'A))` alone does not expose — referencing what `minimax`'s own recursion does internally versus what `best-move` needs to additionally know.
5. **Explain.** Using this lesson's own real `500`-out-of-`500` result, explain why that number is stronger real evidence for minimax's own guarantee than a single game played against one specific, fixed opposing strategy would be — referencing what "guaranteed regardless of opponent" actually requires checking.

### Definition of done

- [ ] You can state, precisely, the real recursive rule minimax uses at a maximizing state and at a minimizing state, and explain why they're opposite operations.
- [ ] You can point to this lesson's own real execution trace (Concept Unit 2) and explain, in your own words, why `A`'s real choice at the root ignores two of its own three children's values.
- [ ] You can point to this lesson's own real `500`-out-of-`500` result as direct evidence the guarantee holds regardless of opponent skill, not just against optimal play.
- [ ] You completed Exercises 1–5, including a real, checked prediction for a pile size this lesson never directly computed.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
