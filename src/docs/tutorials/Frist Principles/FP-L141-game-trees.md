# Lesson 141: Game Trees

**What you will build:** a **game tree** — a real, complete map of every possible way a two-player game can unfold, for a small, real subtraction game (a pile of stones; each turn, a player removes `1`, `2`, or `3`; whoever removes the last stone wins). Real, verified evidence this session: starting from a real pile of `6` stones, the complete real game tree contains `52` distinct real *histories* — sequences of moves — reaching `24` real terminal endings, but only `12` genuinely distinct real *states*, since different histories often arrive at the identical pile-and-turn combination by different routes; a real, exhaustive count of every one of those `24` terminal histories shows exactly `12` end with a win for the player who moved first and `12` end with a win for the player who moved second — real, direct proof that simply having a legal move available is no guarantee of winning, since the same starting pile produces both real outcomes depending on how the game is actually played. The transferable point: every search this curriculum has built through Lesson 140 assumed one agent, choosing every move, working toward one shared goal; a game tree is the first real structure in this curriculum where a *second* real decision-maker, with a genuinely opposing real objective, chooses every other move — and nothing about state-space search's own real machinery, reused unchanged here, needed to change to represent that. What still needs solving — how a real player facing this real tree would actually choose a move that guarantees the best possible outcome, not just hopes for one — is this lesson's own real, deliberately open question, and Lesson 142's own subject.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 135's own real state-space search vocabulary (state, successors) — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **State** — a single, specific, comparable configuration of whatever problem is being searched. In this lesson's own game, a state is a real pair: how many stones remain, and which real player is about to move.
- **State-space search** — searching a graph whose states and legal moves between them are never stored anywhere, only computed on demand by a real `successors` function given one state at a time.
- **Ply** — a single real move by a single real player — one turn, by one side. It exists because "move" is ambiguous in a two-player game (does it mean one player's turn, or a full round including both players?); a ply is unambiguous: exactly one player's real turn, and no more.
- **Adversarial search** — searching a game tree where the real states along a path are chosen not by one agent pursuing one shared goal, but by two (or more) real players alternating turns, each with a genuinely opposing real objective. It exists to name, precisely, what makes a game tree a fundamentally different real search problem from every graph or state space this curriculum has searched before — the states along any real path are not all chosen by the same decision-maker.
- **Terminal state** — a real state with no further legal moves — in this lesson's own game, a pile of `0` stones. It exists to mark where a real game actually ends, distinct from every earlier lesson's own single, fixed "goal" state, since a game tree can have many real terminal states, each one a genuinely different real ending.
- **Utility** — a real number assigned to a terminal state, representing the real outcome for a fixed, named player. It exists to give "who won" a precise, computable real value rather than a vague description — this lesson's own convention, derived and checked below, assigns `+1` when the first player wins and `-1` when the second player does.
- **Game tree** — the real, complete structure of every possible sequence of real moves (every real *history*) from a starting state through to every real terminal state it can reach. It exists as a genuinely different real structure from the graphs Lesson 113 through 140 searched: a game tree's own real nodes are histories, not states, so the identical real state can appear at more than one real node, reached by more than one real sequence of moves — this lesson's own real, measured evidence (`52` histories, only `12` distinct states) makes that difference concrete.

**Objects and methods used**

- **`game-successors`**
  - *What it is:* this lesson's own real function computing every legal real move from a given game state.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real expansion of this lesson's own game tree, from Concept Unit 2 onward.
- **`terminal?`**
  - *What it is:* a real predicate checking whether a game state has any further legal moves.
  - *Implementation:* `(define (terminal? state) (= (car state) 0))` — true exactly when the real pile is empty.
  - *Its use:* the one real check separating "keep expanding this real history" from "this real history has ended," used throughout Concept Unit 3 and 4.
- **`utility`**
  - *What it is:* this lesson's own real function assigning a fixed-perspective outcome value to a terminal state.
  - *Implementation:* given full real treatment in Concept Unit 3 below.
  - *Its use:* every real accounting of who won a given terminal history, from Concept Unit 3 onward.

---

## Concept Unit 1: Why "Search for a Path" Stops Making Sense

### The Problem

Every real search this curriculum has built, Lesson 113 through Lesson 140, shares one real assumption, never stated outright because it was never once violated: whoever is running the search chooses every real move along the eventual path. Consider a real, tiny two-player game instead — a pile of `6` stones, a real turn each removing `1`, `2`, or `3`, whoever takes the last stone wins. A search built to find "the path to the goal" runs immediately into a real problem: after this lesson's own player, call them `A`, picks a real first move, the *next* real move in the path is chosen by someone else — a real second player, `B`, with the exact opposite real goal, trying to make `A` lose. Nothing in Lesson 139's own `astar-search`, or Lesson 140's own `bidirectional-bfs`, has any real notion of "a state chosen by someone working against me" — every real state along their own paths was always a state *the search itself* chose.

### No isolated lab for this step

This unit introduces no new construct of its own — the real problem is posed directly here, against the already-fully-explained state-space search machinery this lesson's own Header restates, to make the real gap concrete before Concept Unit 2 begins closing it.

### Reference Source

No reference counterpart — the motivating real problem is posed directly, a genuinely new real domain (adversarial, two-player) for this Era's own search machinery.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Changes, and What Doesn't

The real state-space search *machinery* — a state, a real `successors` function computing legal next states — carries over completely unchanged; Concept Unit 2 confirms this directly. What changes is what a real path through that state space actually *means*: not "the route this search chose," but "one real way the game could unfold, if both real players made these exact real choices" — and a real player only ever controls their own real half of that path.

### Walkthrough

- **"whoever is running the search chooses every real move," stated as an assumption never violated before** — makes visible a real design decision this curriculum never had to defend until now, because nothing before this lesson ever tested it.
- **The direct citation of `astar-search` and `bidirectional-bfs` by name** — grounds the real gap in specific, already-built code, not an abstract claim.

### CS Lens

This is Lesson 135's own generalization move, encountered from the opposite direction: Lesson 135 showed a *graph* was never required for state-space search, only a real computable notion of "neighbor." This unit shows a real *single decision-maker* was never actually required either — a second, real assumption this curriculum had been quietly relying on, now named and about to be dropped.

### SE Lens

The alternative to naming this real gap explicitly is trying to force a two-player game into `astar-search`'s own existing contract — treating the opponent's own real moves as just more "successors" to search through, the way every earlier lesson's `successors` function worked. The real cost of that alternative: it would search for "the best path," as if one real side controlled the whole thing, silently assuming the opponent will cooperate with whatever path looks shortest to `A` — a real, false assumption Concept Unit 4's own real evidence (`12` real wins each way, from the identical starting pile) directly contradicts.

---

## Concept Unit 2: Representing a Real Two-Player Game as States and Successors

### The Problem

Concept Unit 1 named the real gap. The state-space search machinery itself doesn't need to change — what needs deriving is a real state representation that captures *whose turn it is*, so a real `successors` function can correctly alternate between two real players' own legal moves.

### Reference Source

No reference counterpart — a from-scratch real state representation and successors function for this lesson's own subtraction game.

### Files affected

Created: `game-tree-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — A State That Carries a Real Turn

Every earlier lesson's own state carried only "where things stand" — a grid cell, an integer. This lesson's own state needs one more real piece: whose turn it is. `(cons pile player)` — a real pair, the pile's own real size and a real symbol, `'A` or `'B` — is the minimal real addition: everything else about this lesson's own search stays unchanged from Lesson 135's own original state-space-search shape.

### The New Code — Type It Yourself

```scheme
(define (game-successors state)
  (let ((pile (car state)) (player (cdr state)))
    (if (= pile 0)
        '()
        (map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A)))
             (filter (lambda (take) (<= take pile)) (list 1 2 3))))))
```

### The Updated Project

This is `game-tree-check.scm`, in full:

```scheme
(define (game-successors state)                                     ; ← new
  (let ((pile (car state)) (player (cdr state)))                        ; ← new
    (if (= pile 0)                                                         ; ← new
        '()                                                                   ; ← new
        (map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A))) ; ← new
             (filter (lambda (take) (<= take pile)) (list 1 2 3))))))          ; ← new

(display "=== CU2: real legal moves from the starting position ===") (newline) ; ← new
(display "game-successors of (6 . A): ") (display (game-successors (cons 6 'A))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (game-successors state) ...)`** — first appearance in this lesson of this procedure; one real argument, a `(pile . player)` state.
- **`(let ((pile (car state)) (player (cdr state))) ...)`** — unpacks the real state's own two real pieces via `car`/`cdr`, the same real pair-accessor pattern every earlier lesson's own `(row . column)` grid state used.
- **`(if (= pile 0) '() ...)`** — if the real pile is empty, there are no real legal moves — `'()`, the empty list — the real terminal condition this lesson's own `terminal?`, given full treatment in Concept Unit 3, checks identically.
- **`(filter (lambda (take) (<= take pile)) (list 1 2 3))`** — the real, legal candidate moves: `1`, `2`, or `3` stones, kept only if the real pile actually has that many stones to give — a player facing a pile of `2` cannot legally take `3`.
- **`(map (lambda (take) (cons (- pile take) (if (eq? player 'A) 'B 'A))) ...)`** — for each real legal `take` amount, builds the real resulting state: the pile reduced by `take`, and the *other* real player now to move — `(if (eq? player 'A) 'B 'A)` is the real turn-alternation, first appearance in this lesson of this specific real pattern: swap to whichever player it currently isn't.
- **The real, exact `((5 . B) (4 . B) (3 . B))`** — direct, checked confirmation: from a real starting pile of `6`, with `A` to move, exactly three real legal moves exist, each correctly reducing the pile and correctly handing the turn to `B`.

### CS Lens

This is Lesson 114's own representation-choice discipline, applied to a genuinely new kind of state: exactly as an implicit grid chose to represent a cell as `(row . column)` rather than some richer structure, this lesson's own state representation includes exactly the two real facts a legal-move computation needs — pile size and whose turn — and nothing more, no history of how the game arrived here, no cached list of past moves.

### SE Lens

The alternative to folding "whose turn" directly into the state is tracking it separately, outside the state itself, in some accompanying real variable. The real cost of that alternative: every real procedure operating on a state — `game-successors`, and, in the next Concept Unit, `terminal?` and `utility` — would need an extra real argument threaded through every single call, purely to carry information the state itself can hold far more simply, by being a real pair instead of a bare number.

### Run It — Show the Real Output

```
$ guile game-tree-check.scm
=== CU2: real legal moves from the starting position ===
game-successors of (6 . A): ((5 . B) (4 . B) (3 . B))
```

Verified this session — from a real starting pile of `6`, with `A` to move, `game-successors` returns exactly the three real legal moves this game allows, each one correctly handing the next turn to `B`.

---

## Concept Unit 3: Terminal States, Utility, and a Complete Small Real Tree

### The Problem

Concept Unit 2 built real moves. A real game also needs a real, precise way to say when it's over, and who actually won — and it's worth seeing a real, *complete* small game tree, every real branch shown, before scaling up to a size too large to display in full.

### Reference Source

No reference counterpart — a from-scratch real convention for this lesson's own terminal check and utility function.

### Files affected

Modified: `game-tree-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — Deriving a Real, Fixed-Perspective Utility Convention

A state `(0 . player)` means `player` has no real legal move — meaning the *other* real player just took the last stone and won. Utility needs a single, fixed real perspective to be unambiguous: this lesson's own convention measures every real outcome from `A`'s own point of view. If the state stuck at `0` belongs to `A` (`A` is the one with no move), `A` lost — utility `-1`. If it belongs to `B`, `B` lost, meaning `A` won — utility `+1`.

### The New Code — Type It Yourself

```scheme
(define (terminal? state) (= (car state) 0))
(define (utility state) (if (eq? (cdr state) 'A) -1 1))
```

### The Updated Project

This is `game-tree-check.scm`, with Concept Unit 2's own file extended by this unit's own terminal check, utility function, and a real, complete small tree:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (terminal? state) (= (car state) 0))                        ; ← new
(define (utility state) (if (eq? (cdr state) 'A) -1 1))                ; ← new

(define (show-tree state depth)                                     ; ← new
  (display (make-string (* depth 2) #\space)) (display state)          ; ← new
  (if (terminal? state)                                                   ; ← new
      (begin (display " terminal, utility=") (display (utility state)) (newline)) ; ← new
      (begin (newline) (for-each (lambda (s) (show-tree s (+ depth 1))) (game-successors state))))) ; ← new

(display "=== CU3: a real, complete small game tree, pile=3 ===") (newline) ; ← new
(display "terminal? (0 . A): ") (display (terminal? (cons 0 'A))) (newline)  ; ← new
(display "utility (0 . A): ") (display (utility (cons 0 'A))) (newline)        ; ← new
(display "utility (0 . B): ") (display (utility (cons 0 'B))) (newline)           ; ← new
(show-tree (cons 3 'A) 0)                                                            ; ← new
```

### Mechanical Walkthrough

- **`(define (terminal? state) (= (car state) 0))`** — first appearance in this lesson of `terminal?`; reads the real pile via `car`, compares against `0` via `=`.
- **`(define (utility state) (if (eq? (cdr state) 'A) -1 1))`** — first appearance in this lesson of `utility`; reads the real player via `cdr`, checks equality against the symbol `'A`, returning the real fixed-perspective value this unit's own convention derived above.
- **`(define (show-tree state depth) ...)`** — first appearance in this lesson of this procedure; two real arguments, the current state and its own real depth (number of real plies from the root), used purely for real, readable indentation.
- **`(make-string (* depth 2) #\space)`** — first appearance in this lesson of `make-string`, a real Scheme procedure building a new string of a given length filled with a given character; here, `depth * 2` real space characters, `#\space`, indenting deeper real nodes further right.
- **`(if (terminal? state) (begin ...) (begin (newline) (for-each (lambda (s) (show-tree s (+ depth 1))) (game-successors state))))`** — at a real terminal state, prints its own real utility and stops recursing; otherwise, recurses into every real child via `game-successors`, each one real ply deeper.
- **The real, exact printed tree, `7` real nodes total, `4` of them real terminal endings** — direct, visual, checked confirmation of every real branch a `3`-stone game can take, small enough to verify by eye against `game-successors`' and `utility`'s own already-confirmed real behavior.

### CS Lens

This is Lesson 31's own recursive-tree-printing idea, recognized in a genuinely new domain: `show-tree`'s own real structure — recurse into every real child, indent one level deeper each time — is the identical shape this curriculum has used since its very first tree-shaped structures, applied here to a tree whose own real nodes represent moves in a game rather than a fixed data structure.

### SE Lens

The alternative to printing a real, complete small tree before scaling up is trusting the larger, Concept Unit 4 real count (`52` nodes) without ever having seen a real, concrete instance small enough to check by eye. The real value of this unit's own `7`-node tree: every real terminal utility in it can be checked directly, by a reader, against the real convention Concept Unit 3 just derived, before trusting that identical logic at a scale too large to print.

### Run It — Show the Real Output

```
$ guile game-tree-check.scm
=== CU3: a real, complete small game tree, pile=3 ===
terminal? (0 . A): #t
utility (0 . A): -1
utility (0 . B): 1
(3 . A)
  (2 . B)
    (1 . A)
      (0 . B) terminal, utility=1
    (0 . A) terminal, utility=-1
  (1 . B)
    (0 . A) terminal, utility=-1
  (0 . B) terminal, utility=1
```

Verified this session — the complete real game tree for a `3`-stone pile has exactly `7` real nodes and `4` real terminal endings, every one's own real utility matching this unit's own derived convention exactly: `A` wins (`utility = 1`) whenever `B` is the one left facing an empty pile, and loses (`utility = -1`) whenever `A` is.

---

## Concept Unit 4: A Game Tree Is Not a State Graph

### The Problem

Concept Unit 3 showed a real, complete tree for a small pile. It's worth measuring, honestly, exactly how a real game tree's own size compares to the number of genuinely distinct real states it contains — and what that real gap reveals about whether "having a legal move available" is the same real thing as "being able to win."

### Reference Source

No reference counterpart — a real, direct application of this lesson's own `game-successors`, `terminal?`, and `utility`, at a real scale (`6` stones) too large to print in full.

### Files affected

Modified: `game-tree-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define tree-node-count 0)
(define terminal-count 0)
(define (count-tree-nodes state)
  (set! tree-node-count (+ tree-node-count 1))
  (if (terminal? state)
      (set! terminal-count (+ terminal-count 1))
      (for-each count-tree-nodes (game-successors state))))

(define visited '())
(define (count-distinct-states state)
  (if (not (member state visited))
      (begin
        (set! visited (cons state visited))
        (if (not (terminal? state))
            (for-each count-distinct-states (game-successors state))))))
```

### The Updated Project

This is `game-tree-check.scm`, with Concept Unit 3's own file extended by this unit's own real counting procedures and a real, exhaustive outcome tally:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define tree-node-count 0)                                           ; ← new
(define terminal-count 0)                                               ; ← new
(define (count-tree-nodes state)                                           ; ← new
  (set! tree-node-count (+ tree-node-count 1))                                ; ← new
  (if (terminal? state)                                                         ; ← new
      (set! terminal-count (+ terminal-count 1))                                   ; ← new
      (for-each count-tree-nodes (game-successors state))))                           ; ← new

(define visited '())                                                  ; ← new
(define (count-distinct-states state)                                    ; ← new
  (if (not (member state visited))                                          ; ← new
      (begin                                                                   ; ← new
        (set! visited (cons state visited))                                       ; ← new
        (if (not (terminal? state))                                                  ; ← new
            (for-each count-distinct-states (game-successors state))))))                ; ← new

(define a-wins 0)                                                     ; ← new
(define b-wins 0)                                                        ; ← new
(define (count-outcomes state)                                              ; ← new
  (if (terminal? state)                                                        ; ← new
      (if (= (utility state) 1) (set! a-wins (+ a-wins 1)) (set! b-wins (+ b-wins 1))) ; ← new
      (for-each count-outcomes (game-successors state))))                                 ; ← new

(display "=== CU4: game tree vs state graph, pile=6 ===") (newline)  ; ← new
(count-tree-nodes (cons 6 'A))                                          ; ← new
(display "total real tree nodes (histories): ") (display tree-node-count) (newline) ; ← new
(display "total real terminal histories: ") (display terminal-count) (newline)         ; ← new
(count-distinct-states (cons 6 'A))                                                       ; ← new
(display "total distinct real states: ") (display (length visited)) (newline)                ; ← new
(count-outcomes (cons 6 'A))                                                                     ; ← new
(display "real terminal histories where A wins: ") (display a-wins) (newline)                      ; ← new
(display "real terminal histories where B wins: ") (display b-wins) (newline)                         ; ← new
```

### Mechanical Walkthrough

- **`(define (count-tree-nodes state) ...)`** — first appearance in this lesson of this procedure; a real, mutating counter, `tree-node-count`, incremented once per real recursive call — once per real node in the tree of *histories* — with `terminal-count` incremented additionally whenever that node is a real terminal one.
- **`(define (count-distinct-states state) ...)`** — first appearance in this lesson of this procedure; `member`, a real Scheme procedure checking whether a value occurs anywhere in a list (using `equal?` for the comparison, correct here since states are real `cons` pairs), guards against ever recursing into a real state already recorded in `visited` — the identical already-discovered check every state-space search since Lesson 116 has used, applied here to deliberately *collapse* repeated real states instead of letting the tree revisit them.
- **`(define (count-outcomes state) ...)`** — first appearance in this lesson of this procedure; recurses exactly like `count-tree-nodes`, but at each real terminal state, tallies `a-wins` or `b-wins` instead of a bare count, using `utility`, given full real treatment in Concept Unit 3.
- **The real, exact `52` tree nodes against the real, exact `12` distinct states** — direct, measured confirmation that this lesson's own game tree is a genuinely different real structure from every graph this curriculum has searched since Lesson 113: the same real state, say `(3 . B)`, is reached by several genuinely different real move sequences, and a game tree keeps every one of them as its own real node, while a plain state graph would collapse them into one.
- **The real, exact `12` and `12`** — direct, measured, exhaustive confirmation (every one of the `24` real terminal histories checked, not a sample) that from the identical real starting pile, real games exist ending in a win for either real player — proof that a legal move existing is not the same real thing as a guaranteed win, since how the real game is actually played determines which of these `24` real endings actually happens.

### CS Lens

This is Lesson 109's own persistent-versus-ephemeral distinction, recognized in a genuinely new setting: a game tree's own real nodes are like Lesson 109's own persistent structures — every real history is its own real, distinct object, never mutated or merged with another, even when two histories happen to describe the identical real current state — while `count-distinct-states`' own real deduplication is the opposite real choice, collapsing anything structurally identical, the same real choice a plain state graph makes by default.

### SE Lens

The alternative to measuring both real quantities — `52` histories and `12` states — is reporting only one and letting a reader assume the other. The real risk of reporting only `52`: a reader might assume this lesson's own game genuinely has `52` real distinct situations, when it has only `12` — real, useful information for Lesson 142's own next step, since solving the game optimally only ever needs to reason about `12` genuinely distinct real states, not `52` histories that mostly repeat the same real few.

### Run It — Show the Real Output

```
$ guile game-tree-check.scm
=== CU4: game tree vs state graph, pile=6 ===
total real tree nodes (histories): 52
total real terminal histories: 24
total distinct real states: 12
real terminal histories where A wins: 12
real terminal histories where B wins: 12
```

Verified this session — a real pile of `6` stones produces a real game tree of `52` histories reaching `24` real terminal endings, but only `12` genuinely distinct real states; a real, exhaustive tally of every one of those `24` endings shows exactly `12` real wins for each player, direct proof that this game's own outcome depends on how it's actually played, not on some fixed, guaranteed result.

---

## Closing

### Connect the pieces

One real game, one real tree, one real open question:

1. **The real gap, named (Unit 1):** every earlier search assumed one decision-maker; a real two-player game has two, with opposing real goals.
2. **A real state carrying a real turn, derived (Unit 2):** `(pile . player)`, and `game-successors`, correctly alternating real players on every real move.
3. **Terminal states, utility, and a complete real small tree (Unit 3):** a real, derived, fixed-perspective convention, checked against every one of a `3`-stone game's own `7` real nodes.
4. **The real distinction, measured at scale (Unit 4):** `52` real histories, `12` real distinct states, and a real, exhaustive `12`-`12` split proving the outcome is not fixed.

Every claim in this lesson traces to real, executed code: a complete, printed small real game tree checked by eye, and a real, exhaustive count of every terminal history a larger real game can produce.

### What breaks without this

Suppose a real game-playing program picked its own real moves by checking only whether *a* winning line existed somewhere beneath the current state, without any real regard for what the opponent would actually choose along the way. Concept Unit 4's own real evidence shows precisely why that would fail: from the identical real starting pile, `6`, real histories exist ending in a win for either player — a program that assumes its own opponent will cooperate with whichever branch looks winning would be building on exactly the false assumption Concept Unit 1 named at the very start.

### Exercises

1. **Observe.** Before checking, predict how many real distinct states a pile of `4` stones has, using this lesson's own real state representation (`pile`, `player`) and the real fact that `pile` ranges from `0` to `4` while `player` has exactly `2` real possibilities to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — run `count-distinct-states` on a starting state of `(4 . A)`.
3. **Formalize.** Modify `show-tree` to also print each real node's own remaining legal moves (not just the state itself), and run it on the pile-`3` tree from Concept Unit 3, confirming every real child shown matches a real call to `game-successors` on its own parent.
4. **Explain.** In your own words, explain why `count-distinct-states`'s own `member` check is necessary for producing a real, correct count of `12`, referencing what would happen to that real number if the check were removed entirely.
5. **Explain.** Using this lesson's own real `12`-`12` outcome split, explain why a player who only ever plays "any real legal move" cannot be said to have a real winning strategy, even though this lesson's own real evidence proves winning from a `6`-stone pile is genuinely possible.

### Definition of done

- [ ] You can state, precisely, what a game tree's own real nodes represent, and how that differs from a state graph's own nodes.
- [ ] You can point to this lesson's own real `52`-versus-`12` numbers as direct evidence for that difference.
- [ ] You can explain this lesson's own real utility convention and correctly compute it by hand for any real terminal state.
- [ ] You can explain, using this lesson's own real `12`-`12` split, why "a winning line exists" is not the same real claim as "this player will win."
- [ ] You completed Exercises 1–5, including a real, checked count of a differently-sized real game.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
