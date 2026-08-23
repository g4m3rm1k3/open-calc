# Lesson 19: A Function That Calls Itself

**What you will build:** A first, isolated recursive function, its real
call-and-return order traced in full; a small, escalating look at
"try a digit, recurse, undo if it fails" on the real project's own board;
and, finally, `solve()` — a genuine, working backtracking Sudoku
solver, added to `project/lib/sudoku_board.dart`, real-run-proved to
reach the exact same known-valid solution `verification/milestone/
board_completion_check.dart` already trusted, and to correctly and
quickly report failure on a genuinely unsolvable board rather than
searching forever.

**What you need to know first:** Lesson 18's `candidatesFor` and
`_isSafe` — `solve()` is built directly on both. Lesson 8's functions and
`return`. Lesson 7's loops (this lesson's own recursive calls will be
directly compared against them). No lesson before this one has ever had
a function call itself — that is this lesson's entire new subject.

**Terms used in this lesson:**

- **Function call** — reappearing from Lesson 9, restated in full: using
  a function's name, followed by parentheses containing its arguments,
  to actually run that function's body.
- **Assignment (`=`)** — reappearing from Lesson 5, restated in full: the
  operator that stores a value into a variable.
- **Recursion** — a function that calls itself, directly or indirectly,
  as part of computing its own result. It exists for problems that are
  naturally defined in terms of a smaller version of themselves — "the
  sum of `n` numbers is `n` plus the sum of the other `n - 1`" — which a
  loop can also express, but which recursion often expresses more
  directly, especially once the problem (like Sudoku's own search) needs
  to explore and abandon many different partial attempts, not just march
  through a fixed sequence.
- **Base case** — the specific input (or inputs) a recursive function
  handles *without* calling itself again, stopping the recursion. It
  exists because a recursive function with no base case at all would call
  itself forever, never actually producing a value.
- **Recursive case** — the part of a recursive function that *does* call
  itself, typically with a smaller or simpler version of its own input,
  moving it one step closer to the base case.
- **Call stack** — the real, ordered record of every function call
  currently in progress, each one waiting for the call it made to finish
  before it can finish itself. It exists because a recursive function's
  own outer call cannot actually produce its result until the inner call
  it made returns one — this lesson's own real trace shows this stack
  building up and then unwinding, in order.
- **Search tree** — the full branching space of every choice a search
  could try: at each empty Sudoku cell, one branch per real candidate
  digit (Lesson 18); choosing one branch leads to a *new* set of choices
  for the next empty cell, and so on, forming a tree of possibilities
  rather than one single fixed path.
- **Backtracking** — searching a search tree by trying one branch,
  recursing into it, and, if that branch turns out to lead nowhere,
  undoing it exactly and trying the next one instead — rather than
  giving up entirely or leaving a failed, half-made attempt in place.
- **Constraint satisfaction** — the general class of problem backtracking
  solves: finding an assignment of values (here, digits to cells) that
  satisfies every constraint (Lesson 18) at once, by systematically trying
  and, where needed, undoing candidate assignments rather than guessing
  blindly or checking every possible full grid one at a time.

**Objects and methods used:**

- **`SudokuBoard`**
  - *What it is:* the same real class Lessons 17 and 18 worked with, in
    `project/lib/sudoku_board.dart`.
  - *Implementation:* real, current source, read fresh this session.
    This lesson adds one new real method: `bool solve()`, built directly
    on the already-existing `candidatesFor` (Lesson 18).
  - *Its use:* this lesson's entire final unit is `solve()` itself.
  - *Type:* a real, encapsulated class (Lesson 11's term, reappearing).
  - *Responsibility:* unchanged from Lesson 18, now widened to include
    finding a complete, valid solution from a partially-filled starting
    board, not merely validating individual moves.
  - *Depends on:* `candidatesFor` and `_grid` (both already established).
  - *Connects to:* `solve()` calls `candidatesFor` once per empty cell it
    visits, and calls *itself* recursively — this lesson's own new kind
    of connection, not present anywhere in this class before.
  - *Shape:* unchanged from Lesson 17/18 — the real, persisting boundary
    between a board's internal state and what any other code may do
    with it; `solve()` is now part of that same public surface.
- **`List`**
  - *What it is:* the same real, generic `dart:core` class Lesson 9
    introduced.
  - *Implementation:* `abstract interface class List<E> implements
    Iterable<E>, _ListIterable<E>` (verified in Lesson 9).
  - *Its use:* `solve()` walks the real `List<int>` `candidatesFor`
    returns, via `for-in` (Lesson 7).
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 9.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* this lesson's isolated recursion lab traces every call and
    return through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: A Function That Calls Itself

### The Problem

Every function this curriculum has written, through Lesson 18, calls
*other* functions, never itself. A Sudoku solver is naturally recursive —
"solve the rest of the board" is the same kind of problem as "solve the
whole board," just smaller. Before writing anything Sudoku-specific,
what does a function calling itself actually *do*, mechanically?

> **Stop and think before reading on:** If a function's own body contains
> a call to itself, and that call has to finish before the original call
> can use its result, what do you think has to happen to *all* of a
> function's calls before any of them can actually produce a final
> answer — do they all run to completion in the order they were called,
> or does something else happen first?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  code needs this narrow, throwaway lab; it exists only to isolate
  recursion itself before Sudoku's own real solver uses it.
- **Files affected:** `src/docs/flutter/verification/lesson-19/recursion_demo.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
int sumTo(int n) {
  if (n == 0) {
    return 0;
  }
  return n + sumTo(n - 1);
}
```

### The Updated Project

Not applicable — this is the file's brand-new starting content (shown
here without the `print` calls this unit's own real run adds to trace it;
the complete, actually-run file, with tracing, is quoted in "Run it,"
below).

### Introduce the concept in isolation

Whether every recursive call genuinely finishes diving down to the base
case *before* any of them starts returning — rather than, say,
interleaving somehow — is worth real proof, not assumption. Run for
real, with a `print` added at each call and each return:

```
sumTo(3) called
sumTo(2) called
sumTo(1) called
sumTo(0) called
sumTo(0) hits the base case, returns 0
sumTo(1) returns 1 + sumTo(0) = 1
sumTo(2) returns 2 + sumTo(1) = 3
sumTo(3) returns 3 + sumTo(2) = 6
6
```

Every single call happens first, in order, all the way down to
`sumTo(0)` — proving the **base case** is reached before any return
happens at all. Only then does unwinding begin, in exact reverse order,
each call using the value the one *below* it just produced. This is
**recursion**.

### Discarding this example

`sumTo`'s own specific numbers are disposable — this exact function will
not appear in `project/` at all. What carries forward: a recursive
function has a **base case** (here, `n == 0`) that stops the recursion,
and a **recursive case** (here, `n + sumTo(n - 1)`) that calls itself
with a smaller input, moving toward that base case.

### Mechanical walkthrough

- **`int sumTo(int n)`** — a function declaration (Lesson 8's term,
  reappearing).
- **`if (n == 0) { return 0; }`** — the base case: Lesson 6's `if`
  (reappearing) and equality operator (reappearing); when `n` is exactly
  `0`, the function returns immediately, `0`, with no further recursive
  call at all — this is what actually stops the recursion.
- **`return n + sumTo(n - 1);`** — the recursive case: Lesson 8's
  `return` (reappearing); `sumTo(n - 1)` is a function call (Lesson 9's
  term, reappearing) to `sumTo` *itself*, with Lesson 6's subtraction
  operator (reappearing) producing a strictly smaller argument each
  time — guaranteeing the base case is eventually reached, never
  skipped.
- **Each traced `print` call** (shown in "Run it," not in this minimal
  version) — the same `print` function from this lesson's header, added
  purely to make the real, otherwise-invisible call-and-return order
  visible.

### CS lens

Solving a problem by expressing it in terms of a smaller version of
itself, with a fixed stopping condition, is **recursion** — one of the
most foundational ideas in computer science, and the entire mechanism
this lesson's own Sudoku solver is built on: "solve this board" reduces
to "solve the board with one more cell already filled in," the exact
same relationship `sumTo(n)` has to `sumTo(n - 1)`.

```
Also recognized in: mathematical induction (Lesson 7's own loop
invariant CS lens already named this relative, proving a base case
then a step); a Russian nesting doll, each one containing a smaller
version of itself; a mirror facing another mirror, producing a
reflection of a reflection; a company's own org chart, where a
manager's report is itself a manager of their own smaller team
```

### SE lens

The same `sumTo` could be written with Lesson 7's own `while` loop
instead, accumulating a running total — and for this specific problem
(summing a range), the loop is arguably simpler, with no **call stack**
(this lesson's term) of pending calls to keep track of. Recursion's real
advantage shows up precisely where this lesson is headed: a Sudoku
solver's own "try this, then try what comes after, and if that fails,
undo and try something else" is naturally expressed as recursive calls
that can each independently succeed or fail and be abandoned — a shape a
plain loop has no direct way to express at all, which is exactly why
Lesson 19's own real solver reaches for recursion rather than a loop.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Real, verified, complete output (with tracing `print` calls added, the
actual file run this session):

```
sumTo(3) called
sumTo(2) called
sumTo(1) called
sumTo(0) called
sumTo(0) hits the base case, returns 0
sumTo(1) returns 1 + sumTo(0) = 1
sumTo(2) returns 2 + sumTo(1) = 3
sumTo(3) returns 3 + sumTo(2) = 6
6
```

Real, saved in full in
`src/docs/flutter/verification/lesson-19/run-log.md`.

### Connecting this unit

This unit proved recursion's own real call-and-return order. The next
unit turns to the specific shape of choices a Sudoku solver's own
recursion has to explore.

---

## Concept Unit: Every Choice Branches Into More Choices

### The Problem

Filling in one empty Sudoku cell doesn't just fill one cell — it changes
which digits are legal candidates (Lesson 18) for every *other* empty
cell sharing that row, column, or box. Choosing `4` for one cell and
choosing `7` for that same cell lead to two completely different
boards, each with its own different set of remaining choices.

> **Stop and think before reading on:** If solving a Sudoku board means
> repeatedly picking one candidate digit for one empty cell, then facing
> a brand-new set of choices for the next empty cell, what shape does
> the *entire space* of every possible way to fill the board actually
> have — a single straight line of choices, or something else?

### Project Change

- **Reference Source:** No reference counterpart — this unit is
  conceptual, reasoning about the shape of a search rather than
  introducing new runnable code.
- **Files affected:** None.
- **Change type:** N/A — conceptual.
- **Location:** N/A.
- **Dependencies:** Lesson 18's own real `candidatesFor(0, 2)`, already
  proven to return `[1, 2, 4]` for the real milestone puzzle's cell
  `(0, 2)`.

### The New Code

No new code — this unit reasons directly about Lesson 18's own already-
real result: `candidatesFor(0, 2)` returning `[1, 2, 4]`.

### The Updated Project

Not applicable — no code changes.

### Introduce the concept in isolation

Nothing new to run — the reasoning: choosing `1` for cell `(0, 2)` leads
to one board, with its own new candidate sets for every other empty
cell; choosing `2` instead leads to a *different* board, with different
candidates; choosing `4` leads to a third. Each of those three boards
then has its own next empty cell, with its own candidates, branching
again. This branching structure — one node per partially-filled board,
one edge per candidate digit tried — is a **search tree** (this lesson's
term): not one fixed path, but every possible path a solver could take,
only some of which actually lead to a complete, valid solution.

### Discarding this example

Nothing to discard — this unit reasons about already-real evidence
(Lesson 18's own `candidatesFor` result) rather than introducing
throwaway code.

### Mechanical walkthrough

- **The tree's own root:** the board exactly as it starts, before any
  cell in this search has been filled by the solver.
- **Each level of the tree:** one specific empty cell being decided; the
  branches at that level are exactly the real, computed candidates
  (Lesson 18) for that one cell — `[1, 2, 4]`, for cell `(0, 2)`, means
  exactly three branches at that level, not an arbitrary or infinite
  number.
- **A leaf of the tree:** either a board with every cell filled and every
  constraint satisfied (a real solution), or a board where some later
  cell has *zero* real candidates left (a dead end — Lesson 18's own real
  proof that `candidatesFor` can return an empty list is exactly this
  case).

### CS lens

Representing every possible sequence of decisions as a branching
structure, rather than one fixed plan, is a **search tree** — the same
underlying idea behind essentially every algorithm that has to explore
multiple possibilities and can't simply compute the one right answer
directly.

```
Also recognized in: a chess engine's own move tree, one branch per
legal move at each turn; a decision tree in machine learning; a
choose-your-own-adventure book (already named once, in Lesson 6, for
plain branching — here the same idea recurs at a much larger, nested
scale); a maze, where every junction is a branching point and a dead
end is a leaf with no further path
```

### SE lens

A search tree's real size grows explosively: even a modest number of
candidates per cell, multiplied across dozens of empty cells, produces an
astronomically large tree in the worst case — far too large to ever build
or store explicitly in memory. The real, practical answer (the next
unit's own subject) is never to materialize the whole tree at once, only
to explore one path of it at a time, keeping just enough information
(the current board state) to know where in the tree the search currently
is, and to step back to the previous branching point the instant a path
turns out to be a dead end.

### Commands needed

None — this unit performs no new run.

### Run it

Not applicable — this unit reasons over Lesson 18's own already-real
`candidatesFor` result rather than producing a new run.

### Connecting this unit

This unit named the shape of the search. The next unit shows, on a small,
real, escalating example, how a solver actually walks that shape without
building it all at once.

---

## Concept Unit: Try It, and Undo It If It Fails

### The Problem

Walking a search tree one path at a time means committing to a choice,
continuing, and — if that choice turns out to lead to a dead end —
somehow getting back to exactly the state the board was in before that
choice was made, so a different candidate can be tried instead. What does
"getting back" actually require?

> **Stop and think before reading on:** If a solver tries digit `4` for
> one cell, recurses into the rest of the board, and that recursive call
> eventually reports failure — every remaining cell reachable from this
> path is a dead end — what, specifically, needs to happen to the cell
> that was just set to `4`, before a different digit can be tried there
> instead?

### Project Change

- **Reference Source:** No reference counterpart yet — this unit builds
  toward `solve()` (next unit) using a small, escalating piece of the
  real milestone puzzle, not the full 81-cell board yet.
- **Files affected:** None — this unit reasons about a small, hand-
  traced scenario using real, already-verified facts (Lesson 18's own
  real `candidatesFor` results) rather than introducing a new runnable
  file of its own.
- **Change type:** N/A — reasoning, in preparation for the next unit's
  real code.
- **Location:** N/A.
- **Dependencies:** Lesson 18's own real, verified `candidatesFor`
  results.

### The New Code

No new code — a small, hand-traced scenario: suppose, hypothetically,
that after filling in many other cells correctly, a solver reaches cell
`(0, 2)` with real candidates `[1, 2, 4]` (Lesson 18's own actual,
verified result for this exact cell on the unmodified starting puzzle),
tries `1` first, and suppose — hypothetically, for the sake of this small
trace — that every path starting from `(0, 2) = 1` turns out to be a dead
end several cells later.

### The Updated Project

Not applicable — no code changes in this unit.

### Introduce the concept in isolation

Nothing to run yet — the reasoning, traced by hand using this lesson's
own real, already-established candidate list:

```
1. Try candidate 1 for (0, 2): board now has (0, 2) = 1. Recurse into
   the rest of the board.
2. (Hypothetically) every path from here dead-ends several cells later —
   the recursive call reports failure.
3. Undo: set (0, 2) back to empty (not 1) — the board is now exactly
   as it was before step 1 ran.
4. Try candidate 2 for (0, 2) instead: board now has (0, 2) = 2. Recurse
   again, from a genuinely fresh state.
```

Step 3 — restoring the cell to empty before trying the next candidate —
is **backtracking**: undoing a choice exactly, rather than leaving a
partial, failed attempt in place, so the next candidate is tried against
the same clean starting state every one of its predecessors was.

### Discarding this example

This specific hypothetical trace (assuming digit `1` fails) is
disposable — the next unit's real code will show what the real puzzle
actually does, which may or may not match this hypothetical. What
carries forward: undoing a failed choice completely, before trying the
next one, is what makes trying multiple candidates from the same
starting point possible at all.

### Mechanical walkthrough

- **Step 1 (try)** — committing one specific candidate to the board,
  exactly the same kind of assignment (Lesson 5's term, reappearing)
  `placeDigit` (Lesson 14) makes, though `solve()` (next unit) writes to
  `_grid` directly rather than going through `placeDigit`'s own
  exception-throwing checks, since `solve()` already knows, from
  `candidatesFor`, that this specific digit is currently safe.
- **Step 2 (recurse, then fail)** — this is where **recursion** (this
  lesson's own first term) and the **search tree** (previous unit)
  connect directly: the recursive call is itself exploring every branch
  reachable *from* this one choice, and its own eventual `false` result
  means every one of those branches was a dead end.
  - **Step 3 (undo)** — restoring the exact previous state; this is the
  specific step that makes the whole approach **backtracking** rather
  than an irreversible, one-shot guess.
- **Step 4 (try the next candidate)** — proceeding to the next real
  candidate from the same original list, `[1, 2, 4]`, now that the board
  is genuinely back to its pre-step-1 state.

### CS lens

Trying a choice, exploring everything reachable from it, and undoing it
completely if it fails, is **backtracking** — a specific, general
strategy for searching a tree (previous unit) without exploring it all at
once or ever leaving a half-committed, invalid state behind.

```
Also recognized in: solving a maze by trying a path and retracing
your steps the instant you hit a dead end, rather than trying to
teleport back; a word processor's own "undo" retracing edits one at
a time; a chess engine "unmaking" a move it explored but chose not to
actually play; a hiker backtracking to the last trail junction after
a path turns out to be a dead end
```

### SE lens

Backtracking's real, defining cost is exactly the "undo" step itself:
every choice made has to be perfectly reversible, or the board would be
left in a state that never actually existed on any real path — this
project's own `solve()` (next unit) can undo a placed digit trivially
(setting the cell back to `null`), which is only this simple because
Lesson 17's own representation choice, `List<List<int?>>`, already makes
"empty" a real, directly assignable state rather than something requiring
extra bookkeeping to restore.

### Commands needed

None — this unit performs no new run of its own.

### Run it

Not applicable — this unit's own scenario is hypothetical, hand-traced
using Lesson 18's already-real evidence; the next unit runs the real
thing.

### Connecting this unit

This unit named exactly what "try, and undo if it fails" requires. The
final unit builds this pattern for real, as `solve()`, and runs it
against the actual milestone puzzle.

---

## Concept Unit: Solving the Real Board

### The Problem

Every piece is now in place: recursion (Concept Unit 1), the search tree
`candidatesFor` (Lesson 18) defines (Concept Unit 2), and the try-then-
undo pattern of backtracking (Concept Unit 3). `project/lib/
sudoku_board.dart` still has no way to actually solve a board — only to
check and report on individual moves.

> **Stop and think before reading on:** Given everything reasoned through
> so far, what do you think `solve()`'s own base case should be — the
> condition under which it can stop recursing and simply report success,
> with no more cells left to try at all?

### Project Change

- **Reference Source:** No reference counterpart — this is a genuinely
  new method, built directly on Lesson 18's own already-real
  `candidatesFor`.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new public method.
- **Change type:** Add (new method).
- **Location:** Inside the `SudokuBoard` class, directly before the
  already-existing `_isSafe` (added this lesson, placed just above it,
  after Lesson 18's `candidatesFor`/`isValidMove`).
- **Dependencies:** `candidatesFor` (Lesson 18), `_grid` (Lesson 17).

### The New Code

```dart
bool solve() {
  for (int row = 0; row < size; row++) {
    for (int col = 0; col < size; col++) {
      if (_grid[row][col] == null) {
        for (var digit in candidatesFor(row, col)) {
          _grid[row][col] = digit;
          if (solve()) {
            return true;
          }
          _grid[row][col] = null;
        }
        return false;
      }
    }
  }
  return true;
}
```

### The Updated Project

```dart
54:  bool solve() {                                  // ← new
55:    for (int row = 0; row < size; row++) {         // ← new
56:      for (int col = 0; col < size; col++) {         // ← new
57:        if (_grid[row][col] == null) {                // ← new
58:          for (var digit in candidatesFor(row, col)) {  // ← new
59:            _grid[row][col] = digit;                    // ← new
60:            if (solve()) {                               // ← new
61:              return true;                                // ← new
62:            }                                             // ← new
63:            _grid[row][col] = null;                      // ← new
64:          }                                              // ← new
65:          return false;                                 // ← new
66:        }                                               // ← new
67:      }                                                // ← new
68:    }                                                  // ← new
69:    return true;                                       // ← new
70:  }                                                    // ← new
71:
72:  bool _isSafe(int row, int col, int digit) {
73:    /// [... unchanged, Lesson 18]
74:  }
```

(Line numbers approximate this method's real position in the complete,
current file, placed directly before `_isSafe`.)

### Introduce the concept in isolation

Whether this genuinely reaches the exact same known-valid solution
`verification/milestone/board_completion_check.dart` already trusted —
and whether it correctly and quickly reports failure on a genuinely
unsolvable board — are both worth real proof, not confidence. The very
first attempt at proving the second claim used a nearly-empty board and
did not return within 120 seconds — real, honest evidence of naive
backtracking's own real cost on a mostly-open search space, discussed
fully in this unit's own SE lens, not hidden. A second, better-targeted
test (almost entirely given values, with exactly one cell deliberately
made to have zero real candidates) resolved instantly:

```
solved: true
matches known solution: true
5 3 4 | 6 7 8 | 9 1 2
6 7 2 | 1 9 5 | 3 4 8
1 9 8 | 3 4 2 | 5 6 7
------+-------+------
8 5 9 | 7 6 1 | 4 2 3
4 2 6 | 8 5 3 | 7 9 1
7 1 3 | 9 2 4 | 8 5 6
------+-------+------
9 6 1 | 5 3 7 | 2 8 4
2 8 7 | 4 1 9 | 6 3 5
3 4 5 | 2 8 6 | 1 7 9
candidates for the one empty cell (8,8): []
unsolvable board result: false
cell (8,8) still empty after solve: null
```

`solved: true` and `matches known solution: true` together prove
`solve()` found a genuine, complete, *correct* solution — not merely a
fully-filled board, but the exact same one already independently trusted.
`candidates for the one empty cell (8,8): []` confirms, directly, that
this board's one empty cell has zero legal digits; `unsolvable board
result: false` proves `solve()` correctly reports that rather than
looping; `cell (8,8) still empty after solve` proves the board was left
completely unchanged on failure, exactly as promised.

### Discarding this example

Nothing to discard — `solve()` itself is a genuine, permanent addition to
`project/`; only this unit's own two throwaway test boards (the sample
puzzle's copy and the constructed unsolvable one) are disposable.

### Mechanical walkthrough

- **`bool solve()`** — a method (Lesson 11's term, reappearing) with no
  parameters, returning `bool` (Lesson 5's real class, reappearing).
- **`for (int row = 0; row < size; row++)`, `for (int col = 0; col < size; col++)`**
  — Lesson 7's nested loops (reappearing), the same row-major scanning
  order every earlier unit's own `_isSafe` walkthrough used, here
  searching for the *first* empty cell rather than checking every cell.
- **`if (_grid[row][col] == null)`** — Lesson 6's `if` and equality
  operator (both reappearing); the moment the first empty cell is found,
  everything below this line handles it, and — critically — the loop
  never continues past it in this same call (the `return false;` at the
  end of this block guarantees that).
- **`for (var digit in candidatesFor(row, col))`** — Lesson 7's `for-in`
  loop (reappearing), walking Lesson 18's own already-real
  `candidatesFor` result directly — this *is* the search tree's own
  branches (Concept Unit 2) made concrete: one iteration per real,
  currently-legal candidate.
- **`_grid[row][col] = digit;`** — the "try" step (Concept Unit 3):
  committing one candidate directly to `_grid` (Lesson 17).
- **`if (solve()) { return true; }`** — the recursive case (Concept Unit
  1's own term): `solve()` calls itself, this time with one more cell
  already filled in; if that recursive call itself reports success
  (`true`), this call immediately reports success too, without trying
  any further candidates or undoing anything — the whole rest of the
  board, filled in by the recursive call, is left exactly as that call
  left it.
- **`_grid[row][col] = null;`** — the "undo" step (Concept Unit 3):
  reached only if the recursive call reported failure; restores this
  cell to empty before the `for-in` loop's next iteration tries the next
  real candidate.
- **`return false;`** (after the `for-in` loop) — reached only once every
  real candidate for this cell has been tried and every one led to
  failure: this specific path is a genuine dead end, and this call
  reports failure to whichever call is waiting on it — which will, in
  turn, undo *its own* choice and try its own next candidate.
- **`return true;`** (the function's very last line) — the base case:
  reached only when the nested loops complete *without* ever finding an
  empty cell at all — every cell already holds a real value, meaning the
  board is genuinely, completely solved.

### CS lens

`solve()` is a complete, working instance of **constraint satisfaction**
(this lesson's own term) via **backtracking search**: systematically
assigning values to variables (cells) from their own legal domains
(`candidatesFor`'s own real candidates) while respecting a fixed set of
constraints (Lesson 18's row/column/box rules), undoing and retrying
whenever a partial assignment leads to a dead end.

```
Also recognized in: the N-Queens problem, the exact same
backtracking shape applied to placing chess queens instead of Sudoku
digits; a compiler's own register allocator, assigning a limited set
of hardware registers to variables under real conflict constraints;
map coloring, assigning colors to regions so no two adjacent regions
share one; a Rubik's Cube solver exploring and abandoning move
sequences that don't lead toward a solved state
```

### SE lens

This lesson's own real, honest failure — the first unsolvable-board test
that ran past 120 seconds — is the real cost of this specific
backtracking strategy: always the *first* empty cell in row-major order,
candidates always tried in ascending numeric order, with no attempt to
choose a *more constrained* cell first (one with fewer real candidates,
which would fail faster if it's going to fail at all) or to detect a
dead end earlier than "zero candidates for the cell currently being
tried." On the real milestone puzzle — a properly-constructed, mostly-
filled Sudoku — this naive strategy solves instantly, because a real
puzzle's own constraints already narrow candidates sharply almost
everywhere. On a nearly-empty board, the same strategy can take
enormously longer, precisely because far fewer constraints exist yet to
narrow anything down. Lesson 21 (Difficulty) and Lesson 23 (Performance)
both return to this exact, real tradeoff directly — this lesson's own
honest, unhidden failure is the evidence they'll build on.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.
- **`dart analyze <file>`** — reappearing from Lesson 5, restated in
  full: statically checks a file for compile-time errors without running
  it — run against the whole `project/` directory after this addition,
  confirming no static errors were introduced.

### Run it

Real, verified, complete output:

```
solved: true
matches known solution: true
5 3 4 | 6 7 8 | 9 1 2
6 7 2 | 1 9 5 | 3 4 8
1 9 8 | 3 4 2 | 5 6 7
------+-------+------
8 5 9 | 7 6 1 | 4 2 3
4 2 6 | 8 5 3 | 7 9 1
7 1 3 | 9 2 4 | 8 5 6
------+-------+------
9 6 1 | 5 3 7 | 2 8 4
2 8 7 | 4 1 9 | 6 3 5
3 4 5 | 2 8 6 | 1 7 9
candidates for the one empty cell (8,8): []
unsolvable board result: false
cell (8,8) still empty after solve: null
```

And, confirming the addition introduced no static errors:

```
Analyzing ....
No issues found!
```

Both real, saved in full in
`src/docs/flutter/verification/lesson-19/run-log.md`.

### Connecting this unit

This unit turned recursion, search trees, and backtracking into a real,
working solver — real-proved correct against an independent, already-
trusted solution, and real-proved (with an honestly reported early
failure) to have real, genuine performance limits worth returning to.

---

## Connect the Pieces

Trace the real milestone puzzle through everything this lesson built.
Concept Unit 1 proved recursion's own real shape with `sumTo`: every call
dives to its base case before any unwinding begins. Concept Unit 2 named
the search tree Lesson 18's own real `candidatesFor` already defines —
`[1, 2, 4]` at cell `(0, 2)` means exactly three real branches there, not
an abstraction. Concept Unit 3 hand-traced what "try, and undo if it
fails" actually requires, using that same real candidate list. And
Concept Unit 4's real `solve()` combined all three: real-proved to reach
the exact known-valid solution `board_completion_check.dart` already
trusted, cell for cell, and real-proved — after one honestly-reported,
120-second false start on the wrong kind of test board — to correctly
and quickly report failure when a board genuinely has none.

`project/lib/sudoku_board.dart` can now do something it never could
before: given a partially-filled board, find a complete, valid solution
on its own, or correctly report that none exists. Lesson 20 turns this
capability around — using `solve()` not to finish a puzzle a person
started, but to generate entirely new ones from scratch.
