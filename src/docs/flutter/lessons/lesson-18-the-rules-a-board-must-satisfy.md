# Lesson 18: The Rules a Board Must Satisfy

**What you will build:** A close, real reading of `_isSafe` — the row,
column, and 3x3-box validation `project/lib/sudoku_board.dart` already
built at the Phase 1 milestone, given its first full, rigorous
walkthrough rather than a passing mention — followed by two genuinely
new real methods added to that same file: `candidatesFor`, listing every
digit that could legally go in a given cell, and `isValidMove`, a
non-mutating check a caller can use before committing anything. Every
claim in this lesson is checked against the milestone's own real starting
puzzle, not an invented example.

**What you need to know first:** Lesson 17's own real reading of
`project/lib/sudoku_board.dart`'s representation choice — this lesson
reads the same file again, this time for its validation logic. Lesson 7's
nested loops (the box scan is one). Lesson 9's `List` and its index
operator. Lesson 14's `InvalidMoveException`.

**Terms used in this lesson:**

- **Declaration** — reappearing from Lesson 5, restated in full: the
  statement introducing a variable for the first time, with a type
  (explicit or inferred) and a name.
- **Index operator (`[index]`)** — reappearing from Lesson 9, restated in
  full: reading (or, combined with assignment, writing) a value in a
  `List` by its numeric position.
- **Compile-time constant** — reappearing from Lesson 5, restated in
  full: a value the compiler can compute and fix in place while
  translating the program, before any of it runs — what `const`
  requires.
- **List literal (`[element, element, ...]`)** — reappearing from Lesson
  7, restated in full: a fixed sequence of values written directly into
  source code between square brackets.
- **Generic type parameter (`<E>`)** — reappearing from Lesson 9 (full
  treatment: Lesson 10), restated in full: a type written inside angle
  brackets fixing what specific type a general-purpose class holds this
  time.
- **Method call** — reappearing from Lesson 11, restated in full: using a
  method's name, reached through the object it belongs to, followed by
  parentheses containing its arguments, to run that method's body.
- **Constraint** — a rule a Sudoku board's own values must satisfy at all
  times: no digit repeated in any row, column, or 3x3 box. It exists as
  the actual *definition* of what makes a Sudoku board valid, independent
  of any specific representation (Lesson 17) or any specific way of
  checking it.
- **Conflict** — a specific, concrete violation of a constraint: one
  digit appearing twice within the same row, column, or box. `_isSafe`'s
  entire job is detecting whether placing a given digit would create one.
- **Candidate number** — for one specific empty cell, a digit that could
  legally be placed there *right now*, given the board's current state —
  not necessarily the digit that belongs there in the final solution,
  only one that doesn't yet violate any constraint. It exists because
  Lesson 19's backtracking solver and Lesson 21's difficulty analysis
  both need to know, for any given cell, exactly which digits remain
  legally possible, not just whether one specific guess happens to work.
- **Valid move** — placing one specific digit at one specific empty,
  non-given cell without creating a conflict. `placeDigit` (Lesson 14)
  already enforces this by throwing when it isn't one; this lesson's own
  `isValidMove` answers the same question without committing anything or
  throwing.

**Objects and methods used:**

- **`SudokuBoard`**
  - *What it is:* the same real class Lesson 17 introduced, in
    `project/lib/sudoku_board.dart`.
  - *Implementation:* real, current source, read fresh this session.
    Relevant real members for this lesson: the already-existing private
    `bool _isSafe(int row, int col, int digit)`, and two members this
    lesson adds: `bool isValidMove(int row, int col, int digit)` and
    `List<int> candidatesFor(int row, int col)`.
  - *Its use:* this lesson's entire subject is `_isSafe`'s own real logic,
    plus two new public methods built directly on top of it.
  - *Type:* a real, encapsulated class (Lesson 11's term, reappearing).
  - *Responsibility:* unchanged from Lesson 17 — own a 9x9 board's
    complete state and enforce every rule about how it may legally
    change — now widened to include reporting, not just enforcing,
    what's legal.
  - *Depends on:* unchanged from Lesson 17.
  - *Connects to:* `isValidMove` and `candidatesFor` both call the
    already-existing private `_isSafe` directly, since both live inside
    the same class; `placeDigit` (Lesson 14) already called `_isSafe`
    too, meaning all three now share one single real source of truth for
    what counts as safe.
  - *Shape:* unchanged from Lesson 17 — the real, persisting boundary
    between a board's internal representation and what any other code
    is allowed to know or do with it.
- **`InvalidMoveException`**
  - *What it is:* the same real, custom domain error (Lesson 14's term,
    reappearing) Lesson 14 introduced, in the same file.
  - *Implementation:* `class InvalidMoveException implements Exception {
    final String message; ... }` (verified in Lesson 14 and the Phase 1
    milestone).
  - *Its use:* this lesson's own verification thrown by `placeDigit`
    (unchanged), never by the two new methods this lesson adds — both
    report `false`/an empty list instead of throwing, a deliberate choice
    this lesson's own SE lens examines.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 14.
- **`List`**
  - *What it is:* the same real, generic `dart:core` class Lesson 9
    introduced.
  - *Implementation:* `abstract interface class List<E> implements
    Iterable<E>, _ListIterable<E>` (verified in Lesson 9); relevant real
    member used fresh here: `void add(E value)`.
  - *Its use:* `candidatesFor`'s own return type, built up one digit at a
    time.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 9.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: No Repeats in a Row

### The Problem

`project/lib/sudoku_board.dart`'s own `placeDigit` already rejects
invalid moves — the Phase 1 milestone proved this for real. But that
proof never walked through *how* the rejection actually decides row
uniqueness, line by line. What does `_isSafe`'s own row check actually
do, mechanically?

> **Stop and think before reading on:** Given Lesson 9's own `List` index
> operator, if you needed to check whether a specific digit already
> appears anywhere else in a 9-cell row, what would the loop need to
> skip — and why would skipping the cell being checked itself matter?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`, lines 90-93
  (the `_isSafe` method's row-check loop), quoted verbatim, read fresh
  this session:
  ```dart
  for (int c = 0; c < size; c++) {
    if (c != col && _grid[row][c] == digit) return false;
  }
  ```
- **Files affected:** None — this unit reads and explains already-real,
  already-existing code; it changes nothing.
- **Change type:** N/A — review of existing code.
- **Location:** Inside `_isSafe`, the first of its three checks.
- **Dependencies:** `project/lib/sudoku_board.dart`'s own `_grid` field
  (Lesson 17).

### The New Code

The exact real code, unchanged:

```dart
for (int c = 0; c < size; c++) {
  if (c != col && _grid[row][c] == digit) return false;
}
```

### The Updated Project

Not applicable — no modification; this unit explains already-existing
code in place.

### Introduce the concept in isolation

This exact loop was already exercised for real at the Phase 1 milestone
and again this session, isolating a genuine row conflict: placing `5` at
`(0, 2)`, where row 0 already holds `5` at `(0, 0)`:

```
row conflict: rejected — InvalidMoveException: 5 already appears in that row, column, or 3x3 box
```

Real, iteration-by-iteration trace of this exact loop for that exact
call, `_isSafe(0, 2, 5)`:

```
Iteration c=0: c != col → 0 != 2 → true. _grid[0][0] == digit → 5 == 5 → true. Both conditions true: return false immediately.
```

Only one iteration ever runs — the loop returns the instant it finds the
conflict, never reaching `c=1` through `c=8` at all. This is **row
validation** (this lesson's term).

### Discarding this example

Nothing to discard — this is already-real, permanent project code, not a
throwaway example.

### Mechanical walkthrough

- **`for (int c = 0; c < size; c++)`** — Lesson 7's `for` loop
  (reappearing), walking every column index `0` through `8` (`size`,
  Lesson 17's real `static const int size = 9;`) in the given `row`.
- **`c != col`** — Lesson 6's inequality operator (reappearing): skips
  the *one* column being checked itself — without this, checking whether
  `digit` already equals the very cell it's about to be placed into would
  always find a match against an already-filled cell holding that exact
  same digit, incorrectly reporting a conflict with itself.
- **`_grid[row][c] == digit`** — Lesson 9's index operator (reappearing)
  reading `_grid`'s own private field (Lesson 17), compared with Lesson
  6's equality operator (reappearing) against the digit being tested.
- **`return false`** — Lesson 8's `return` statement (reappearing):
  exits `_isSafe` immediately, the instant any conflict is found,
  without checking the remaining columns at all.

### CS lens

Checking every element of a fixed-size collection for one matching
value, stopping the instant a match is found, is **linear search**
(Lesson 9's own CS lens, reappearing) — here specialized to searching for
a *conflict* rather than a *presence*, over exactly 9 elements every
single time, regardless of the board's overall size.

```
Also recognized in: checking a Sudoku row by hand, scanning left to
right and stopping the moment a duplicate is spotted; validating a
form field against a fixed list of banned values; a spell-checker
comparing one word against every entry in a small, fixed exception
list
```

### SE lens

This loop's own real cost is fixed and small — exactly 9 comparisons in
the worst case, never more, since a row never grows — which is exactly
why Lesson 23 (Performance) will find Sudoku's own constraint checks
cheap regardless of how many times they're called. The real alternative
this project didn't choose — precomputing, for every row, a running
`Set` (Lesson 9) of already-used digits, checked in roughly constant time
instead of scanning 9 cells — would trade a small amount of memory and
bookkeeping (keeping that `Set` in sync with every placed and cleared
digit) for a marginally faster check; at 9 elements, the real, measurable
difference is negligible, which is exactly why the simpler, direct scan
was the right choice here.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Real, verified output already captured this session:

```
row conflict: rejected — InvalidMoveException: 5 already appears in that row, column, or 3x3 box
```

Real, saved in full in
`src/docs/flutter/verification/lesson-18/run-log.md`.

### Connecting this unit

This unit checked one row. The next unit checks the same digit against
an entire column instead.

---

## Concept Unit: No Repeats in a Column

### The Problem

A digit repeated in the same column is just as invalid as one repeated
in the same row, even though a column's 9 cells are scattered across 9
different rows rather than sitting next to each other the way a row's
cells do in `_grid`'s own representation. Does checking a column require
a genuinely different approach from checking a row?

> **Stop and think before reading on:** Given `_grid`'s own real shape,
> `List<List<int?>>` (Lesson 17) — a list of rows, each holding its own
> columns — what would a loop need to vary this time to walk down one
> fixed column instead of across one fixed row?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`, lines 94-96,
  quoted verbatim, read fresh this session:
  ```dart
  for (int r = 0; r < size; r++) {
    if (r != row && _grid[r][col] == digit) return false;
  }
  ```
- **Files affected:** None — reviewing already-existing code.
- **Change type:** N/A.
- **Location:** Inside `_isSafe`, immediately after the row check.
- **Dependencies:** Same as the previous unit.

### The New Code

```dart
for (int r = 0; r < size; r++) {
  if (r != row && _grid[r][col] == digit) return false;
}
```

### The Updated Project

Not applicable — already-existing code, unchanged.

### Introduce the concept in isolation

This exact loop was exercised for real this session, isolating a genuine
column-only conflict — placing `8` at `(7, 2)`, where column 2 already
holds `8` at `(2, 2)`, with row 7 and the bottom-left box both free of any
`8`:

```
column conflict: rejected — InvalidMoveException: 8 already appears in that row, column, or 3x3 box
```

Real, iteration-by-iteration trace of `_isSafe(7, 2, 8)`'s column check
(the row check, run first, found nothing — row 7 has no `8` at all —
so execution reaches this loop):

```
Iteration r=0: r != row → 0 != 7 → true. _grid[0][2] == digit → null == 8 → false. Continue.
Iteration r=1: r != row → 1 != 7 → true. _grid[1][2] == digit → null == 8 → false. Continue.
Iteration r=2: r != row → 2 != 7 → true. _grid[2][2] == digit → 8 == 8 → true. Both conditions true: return false immediately.
```

Iterations `r=3` through `r=8` never run — the loop stops the instant
`r=2` finds the real conflict. This is **column validation** (this
lesson's term).

### Discarding this example

Nothing to discard — already-real, permanent project code.

### Mechanical walkthrough

- **`for (int r = 0; r < size; r++)`** — the same `for` loop shape as the
  row check, here iterating *rows* while `col` stays fixed — the mirror
  image of the previous unit's own loop.
- **`r != row`** — the same skip-the-cell-itself logic as the previous
  unit's `c != col`, here applied to the row index instead.
- **`_grid[r][col] == digit`** — the index operator, here with the outer
  index varying (`r`) and the inner index fixed (`col`) — the opposite of
  the row check's fixed outer, varying inner.
- **`return false`** — the same early-exit `return` as the previous unit.

### CS lens

The same linear search (previous unit's CS lens) applied along a
different axis of the identical underlying `List<List<int?>>` — proof
that the *algorithm* (scan and compare) doesn't change at all between row
and column checking; only *which index varies* does.

```
Also recognized in: reading a spreadsheet column top to bottom versus
a row left to right — same scanning idea, different axis; a matrix
transpose operation, which is exactly "swap which index varies" made
explicit
```

### SE lens

Because `_grid` is stored row-major (Lesson 17's own CS lens: each row is
one contiguous inner `List`), this column check has a real, if minor,
cost the row check doesn't: it touches 9 *different* inner `List`
objects (`_grid[0]` through `_grid[8]`), one per iteration, rather than
repeatedly reading within the *same* inner list the row check stays
inside of. Lesson 23 (Performance) is where this specific difference
would actually be measured, if it ever mattered at this project's real
scale (a single 9x9 board) — at 9 elements, it doesn't, which is exactly
why the code doesn't bother optimizing for it.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Real, verified output already captured this session:

```
column conflict: rejected — InvalidMoveException: 8 already appears in that row, column, or 3x3 box
```

Real, saved in full in
`src/docs/flutter/verification/lesson-18/run-log.md`.

### Connecting this unit

Row and column are both checked. The final constraint — the 3x3 box — is
the one this project's own code already needed nested loops for.

---

## Concept Unit: No Repeats in a 3x3 Box

### The Problem

A row and a column are each a straight line of 9 cells — a single loop
walks each one directly. A 3x3 box is neither a row nor a column; it's a
square region whose cells span 3 different rows *and* 3 different
columns at once. What does checking it actually require?

> **Stop and think before reading on:** Given Lesson 7's own nested
> loops, what do you think two loops, one inside the other, would need to
> compute first — before either loop even starts — to know *which* 3x3
> region a given `(row, col)` actually belongs to?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`, lines 97-103,
  quoted verbatim, read fresh this session:
  ```dart
  final boxRow = (row ~/ boxSize) * boxSize;
  final boxCol = (col ~/ boxSize) * boxSize;
  for (int r = boxRow; r < boxRow + boxSize; r++) {
    for (int c = boxCol; c < boxCol + boxSize; c++) {
      if ((r != row || c != col) && _grid[r][c] == digit) return false;
    }
  }
  ```
- **Files affected:** None — reviewing already-existing code.
- **Change type:** N/A.
- **Location:** Inside `_isSafe`, immediately after the column check.
- **Dependencies:** Same as the previous two units, plus `boxSize`
  (Lesson 17's real `static const int boxSize = 3;`).

### The New Code

```dart
final boxRow = (row ~/ boxSize) * boxSize;
final boxCol = (col ~/ boxSize) * boxSize;
for (int r = boxRow; r < boxRow + boxSize; r++) {
  for (int c = boxCol; c < boxCol + boxSize; c++) {
    if ((r != row || c != col) && _grid[r][c] == digit) return false;
  }
}
```

### The Updated Project

Not applicable — already-existing code, unchanged.

### Introduce the concept in isolation

This exact code was exercised for real this session, isolating a genuine
box-only conflict — placing `8` at `(1, 1)`, where the top-left box
already holds `8` at `(2, 2)`, with row 1 and column 1 both free of any
`8`:

```
box conflict: rejected — InvalidMoveException: 8 already appears in that row, column, or 3x3 box
```

Real values, computed once before either loop starts: `boxRow = (1 ~/ 3)
* 3 = 0 * 3 = 0`; `boxCol = (1 ~/ 3) * 3 = 0 * 3 = 0` — both `0`, meaning
this call checks the box spanning rows 0-2 and columns 0-2. Real,
iteration-by-iteration trace of the nested loop for `_isSafe(1, 1, 8)`
(the row and column checks, run first, both found nothing):

```
Outer r=0: Inner c=0: (r != row || c != col) → (0 != 1 || 0 != 1) → true. _grid[0][0] == 8 → 5 == 8 → false. Continue.
Outer r=0: Inner c=1: (0 != 1 || 1 != 1) → true (first clause alone is enough). _grid[0][1] == 8 → 3 == 8 → false. Continue.
Outer r=0: Inner c=2: (0 != 1 || 2 != 1) → true. _grid[0][2] == 8 → null == 8 → false. Continue.
Outer r=1: Inner c=0: (1 != 1 || 0 != 1) → true (second clause alone is enough — this cell is (1,0), not the cell being checked, (1,1)). _grid[1][0] == 8 → 6 == 8 → false. Continue.
Outer r=1: Inner c=1: (1 != 1 || 1 != 1) → false || false → false. Condition fails — this is `(row, col)` itself, correctly skipped even though `_grid[1][1]` is currently `null`.
Outer r=1: Inner c=2: (1 != 1 || 2 != 1) → true. _grid[1][2] == 8 → null == 8 → false. Continue.
Outer r=2: Inner c=0: (2 != 1 || 0 != 1) → true. _grid[2][0] == 8 → null == 8 → false. Continue.
Outer r=2: Inner c=1: (2 != 1 || 1 != 1) → true. _grid[2][1] == 8 → 9 == 8 → false. Continue.
Outer r=2: Inner c=2: (2 != 1 || 2 != 1) → true. _grid[2][2] == 8 → 8 == 8 → true. Both conditions true: return false immediately.
```

All 9 box cells are checked this time (the conflict sits in the very last
one), proving the box scan genuinely covers the full 3x3 region rather
than stopping early by luck. This is **box validation** (this lesson's
term).

### Discarding this example

Nothing to discard — already-real, permanent project code.

### Mechanical walkthrough

- **`(row ~/ boxSize) * boxSize`, `(col ~/ boxSize) * boxSize`** —
  Lesson 6's truncating division operator (reappearing) and
  multiplication operator (reappearing): `row ~/ boxSize` collapses any
  row `0`-`2` to `0`, `3`-`5` to `1`, `6`-`8` to `2` (which of the 3
  box-rows this row belongs to); multiplying back by `boxSize` converts
  that box-row index back into the *first actual row* of that box (`0`,
  `3`, or `6`) — the same conversion, applied to `col`, for `boxCol`.
- **`for (int r = boxRow; r < boxRow + boxSize; r++)`** — Lesson 7's
  `for` loop (reappearing), walking exactly the 3 rows belonging to this
  box, starting at `boxRow`.
- **`for (int c = boxCol; c < boxCol + boxSize; c++)`** — a second,
  nested `for` loop (Lesson 7's own nested-loop concept, reappearing),
  walking the 3 columns belonging to this box for every one of the outer
  loop's 3 rows — `3 × 3 = 9` total checks, exactly the box's real size.
- **`(r != row || c != col)`** — Lesson 6's logical OR (reappearing):
  unlike the row and column checks' single `!=` condition, the cell being
  placed into could be *anywhere* within this box, not just at one fixed
  position — so skipping it requires checking that it *isn't the exact
  cell* on *both* axes at once; if either axis differs, this isn't the
  cell being checked, and the comparison should proceed.
- **`_grid[r][c] == digit`**, **`return false`** — the same index read,
  equality comparison, and early-exit `return` as the row and column
  checks.

### CS lens

Computing which fixed-size region a coordinate belongs to, then scanning
only that region, is a real, recurring pattern for spatial partitioning —
dividing a larger space into fixed blocks to localize a check, rather
than scanning the entire space.

```
Also recognized in: a spatial hash grid in game development,
partitioning a game world into fixed cells so collision checks only
scan nearby cells; a CPU cache's own cache-line alignment,
grouping memory into fixed-size blocks; a calendar grid, dividing a
month into fixed weeks
```

### SE lens

The box check's real cost — `3 × 3 = 9` comparisons, the same total as
the row or column check's `9`, just organized as nested loops instead of
one flat loop — is a direct, deliberate consequence of representing the
board as `List<List<int?>>` (Lesson 17): the box computation needs two
separate index calculations (`boxRow`, `boxCol`) precisely because a box
isn't a single row or column in this representation at all. A flat
`List<int>` (Lesson 17's own rejected alternative) would need its own,
different index math here too — the real lesson is that *every*
representation choice has to answer "how do I check a box" somehow; this
project's own nested representation answers it with the two-step
division-then-multiplication shown above.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified output already captured this session:

```
box conflict: rejected — InvalidMoveException: 8 already appears in that row, column, or 3x3 box
```

Real, saved in full in
`src/docs/flutter/verification/lesson-18/run-log.md`.

### Connecting this unit

All three constraints — row, column, box — are now walked through in
full, real detail. The next unit combines all three into a new, genuinely
useful question: not "is this one guess safe," but "which digits are
safe at all."

---

## Concept Unit: Every Digit That Could Legally Go Here

### The Problem

`_isSafe` (the previous three units) answers one narrow question: is
*this specific* digit safe at this specific cell? A Sudoku solver
(Lesson 19) and a difficulty analyzer (Lesson 21) both need a broader
answer: for an empty cell, *which* digits, out of all nine, are safe
right now? Nothing in `project/lib/sudoku_board.dart` answers that yet.

> **Stop and think before reading on:** If you already had `_isSafe`
> working correctly for one digit at a time, what's the smallest possible
> change needed to find *every* safe digit for one cell, rather than
> checking just one?

### Project Change

- **Reference Source:** No reference counterpart — this is a genuinely
  new method, not yet part of the project before this lesson.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new public method.
- **Change type:** Add (new method).
- **Location:** Inside the `SudokuBoard` class, directly before the
  already-existing `_isSafe` (added this lesson, placed just above it).
- **Dependencies:** The already-existing `_isSafe` and `_grid` (both
  reviewed in this lesson's previous three units and Lesson 17).

### The New Code

```dart
List<int> candidatesFor(int row, int col) {
  if (_grid[row][col] != null) {
    return const [];
  }
  final candidates = <int>[];
  for (int digit = 1; digit <= 9; digit++) {
    if (_isSafe(row, col, digit)) {
      candidates.add(digit);
    }
  }
  return candidates;
}
```

### The Updated Project

```dart
32:   int? valueAt(int row, int col) => _grid[row][col];
33:
34:   bool isGivenAt(int row, int col) => _isGiven[row][col];
35:
36:   /// [... isComplete, placeDigit, clearCell, _validateCoordinate
37:   ///  unchanged from Lesson 14/17, omitted here only because this
38:   ///  unit doesn't touch them — see project/lib/sudoku_board.dart
39:   ///  for the complete, real file]
40:
41:  List<int> candidatesFor(int row, int col) {     // ← new
42:    if (_grid[row][col] != null) {                // ← new
43:      return const [];                            // ← new
44:    }                                              // ← new
45:    final candidates = <int>[];                    // ← new
46:    for (int digit = 1; digit <= 9; digit++) {      // ← new
47:      if (_isSafe(row, col, digit)) {               // ← new
48:        candidates.add(digit);                      // ← new
49:      }                                             // ← new
50:    }                                               // ← new
51:    return candidates;                              // ← new
52:  }                                                 // ← new
53:
54:  bool _isSafe(int row, int col, int digit) {
55:    /// [... unchanged, all three units above]
56:  }
```

(Line numbers approximate this method's real position in the complete,
current file; the full, real file is
`project/lib/sudoku_board.dart`.)

### Introduce the concept in isolation

Whether this genuinely produces the correct three-digit answer for a
real cell on the real starting puzzle is worth real proof — run for
real:

```
candidates for (0,2): [1, 2, 4]
candidates for an already-filled cell (0,0): []
```

`candidatesFor(0, 2)` returns exactly `[1, 2, 4]` — matching a hand
worked-out check: row 0 already uses `{5, 3, 7}`; column 2 already uses
`{8}`; the top-left box already uses `{5, 3, 6, 9, 8}`; the digits 1-9
not in that combined set are precisely `1`, `2`, and `4`.
`candidatesFor(0, 0)` — a cell that already holds a real value — returns
an empty list, since there's nothing left to candidate for.

### Discarding this example

`candidatesFor`'s own real body is not discarded — it's a genuine,
permanent addition to `project/`. What was disposable was only this
lesson's own throwaway proof of it against one specific cell.

### Mechanical walkthrough

- **`List<int> candidatesFor(int row, int col)`** — a method (Lesson 11's
  term, reappearing) returning `List<int>` (Lesson 9's real class,
  reappearing).
- **`if (_grid[row][col] != null) { return const []; }`** — Lesson 6's
  `if` (reappearing) and Lesson 5's inequality operator (reappearing);
  `const []` is a compile-time-constant (Lesson 5's term, reappearing)
  empty list literal (Lesson 7's term, reappearing) — a cell that already
  holds a value has no candidates at all, by definition.
- **`final candidates = <int>[];`** — a declaration (Lesson 5's term,
  reappearing) using `final` (Lesson 5's term, reappearing) since
  `candidates` itself is never reassigned to a *different* list, only
  grown; `<int>[]` is an empty list literal with an explicit generic type
  parameter (Lesson 9's term, reappearing).
- **`for (int digit = 1; digit <= 9; digit++)`** — Lesson 7's `for` loop
  (reappearing), walking every real Sudoku digit exactly once.
- **`if (_isSafe(row, col, digit))`** — a method call (Lesson 9's term,
  reappearing) on `_isSafe`, the exact same already-existing method the
  previous three units walked through in full — reused here, not
  reimplemented.
- **`candidates.add(digit);`** — `List`'s own real `void add(E value)`
  (Lesson 9's header, reappearing), appending each safe digit found.
- **`return candidates;`** — Lesson 8's `return` statement (reappearing),
  handing back every digit that survived the loop.

### CS lens

Computing every legal option for one decision point, rather than only
checking whether one specific guess happens to work, is exactly the
information a **constraint satisfaction** search (Lesson 19's own subject
— backtracking) needs at every step: knowing the full candidate set lets
a solver try the *most* constrained cell first, or detect immediately
that a cell has *zero* candidates left, both real, load-bearing
optimizations Lesson 19 and 21 build on directly.

```
Also recognized in: a crossword solver listing every word that fits
a given set of constraints, not just checking one guess; a chess
engine enumerating every legal move from a position before deciding
which to actually play; a scheduling system listing every available
time slot rather than only confirming whether one specific slot works
```

### SE lens

`candidatesFor` reuses `_isSafe` entirely rather than reimplementing row/
column/box checking a second time — the real payoff of the previous three
units' own careful, real walkthrough: because `_isSafe` is already
correct and already tested (this lesson's own real proofs), `candidatesFor`
inherits that correctness for free, at the cost of calling it up to 9
times per cell (once per candidate digit) rather than computing all three
constraint sets once and comparing directly — a real, small inefficiency
Lesson 23 (Performance) is positioned to measure and, if it actually
matters at this project's scale, address.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.
- **`dart analyze <file>`** — reappearing from Lesson 5, restated in
  full: statically checks a file for compile-time errors without running
  it — run against the whole `project/` directory after this addition,
  confirming no static errors were introduced.

### Run it

Real, verified output:

```
candidates for (0,2): [1, 2, 4]
candidates for an already-filled cell (0,0): []
```

And, confirming the addition introduced no static errors:

```
Analyzing ....
No issues found!
```

Both real, saved in full in
`src/docs/flutter/verification/lesson-18/run-log.md`.

### Connecting this unit

This unit answered "which digits are safe." The final unit answers a
related but different question: is *this one* move safe, without
committing to it or risking an exception.

---

## Concept Unit: Checking a Move Without Committing to It

### The Problem

`placeDigit` (Lesson 14) is the only way to test whether a specific move
is legal — and it either succeeds, permanently changing the board, or
throws. A future Flutter UI (Phase 3) will want to highlight an invalid
cell *before* the player commits to it — which means checking legality
without either mutating anything or catching an exception just to
discard it.

> **Stop and think before reading on:** `placeDigit` already makes three
> checks in order: is the coordinate in range, is the cell a given clue,
> and is the digit itself in range and safe. What would a method need to
> do differently with those same three checks to report `true`/`false`
> instead of throwing or mutating?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`, `placeDigit`
  (Lesson 14), whose own three checks this new method mirrors —
  quoted, for comparison, from the real, current file: `_validateCoordinate`
  (throws for an out-of-range coordinate), `if (_isGiven[row][col])`
  (throws for a given clue), `if (digit < 1 || digit > 9)` (throws for an
  out-of-range digit), `if (!_isSafe(row, col, digit))` (throws for a
  conflict).
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new public method.
- **Change type:** Add (new method).
- **Location:** Inside the `SudokuBoard` class, directly before
  `candidatesFor` (added this lesson, in the previous unit).
- **Dependencies:** `_isGiven`, `_isSafe` (both already reviewed this
  lesson and in Lesson 17).

### The New Code

```dart
bool isValidMove(int row, int col, int digit) {
  if (row < 0 || row >= size || col < 0 || col >= size) return false;
  if (_isGiven[row][col]) return false;
  if (digit < 1 || digit > 9) return false;
  return _isSafe(row, col, digit);
}
```

### The Updated Project

```dart
30:   bool isValidMove(int row, int col, int digit) {   // ← new
31:     if (row < 0 || row >= size || col < 0 || col >= size) return false;  // ← new
32:     if (_isGiven[row][col]) return false;            // ← new
33:     if (digit < 1 || digit > 9) return false;         // ← new
34:     return _isSafe(row, col, digit);                  // ← new
35:   }                                                  // ← new
36:
37:  List<int> candidatesFor(int row, int col) {
38:    /// [... this lesson's previous unit, unchanged]
39:  }
```

(Line numbers approximate this method's real position, placed directly
before `candidatesFor` in the complete, current file.)

### Introduce the concept in isolation

Whether this genuinely matches `placeDigit`'s own real accept/reject
behavior, without ever mutating the board, is worth real proof — run for
real:

```
isValidMove(0,2,4): true
isValidMove(0,2,5): false
isValidMove(0,0,4): false
board unchanged at (0,2) after checks: null
```

`isValidMove(0, 2, 4)` is `true` — `4` is exactly one of the three real
candidates the previous unit computed for that cell. `isValidMove(0, 2,
5)` is `false` — the same real row conflict this lesson's very first unit
proved. `isValidMove(0, 0, 4)` is `false` — `(0, 0)` is a given clue. And
`board.valueAt(0, 2)` is still `null` after every single one of those
checks — proving `isValidMove` genuinely never mutates the board, unlike
`placeDigit`.

### Discarding this example

`isValidMove`'s own real body is not discarded — a genuine, permanent
addition to `project/`. Only this lesson's own throwaway proof of it is
disposable.

### Mechanical walkthrough

- **`bool isValidMove(int row, int col, int digit)`** — a method
  returning `bool` (Lesson 5's real class, reappearing) instead of
  `void`, and reporting instead of throwing.
- **`if (row < 0 || row >= size || col < 0 || col >= size) return
  false;`** — the same coordinate-range check `_validateCoordinate`
  already makes (throwing there), here returning `false` instead —
  Lesson 6's relational operators and logical OR (both reappearing).
- **`if (_isGiven[row][col]) return false;`** — reading the same
  `_isGiven` field `placeDigit` already checks (Lesson 11, Lesson 17).
- **`if (digit < 1 || digit > 9) return false;`** — the same digit-range
  check `placeDigit` already makes.
- **`return _isSafe(row, col, digit);`** — the same already-existing
  method this lesson's first three units walked through in full, its own
  `bool` result returned directly rather than being used inside another
  `if`.

### CS lens

Providing two different ways to ask the identical underlying question —
one that commits and reports failure loudly (`placeDigit`, throwing), one
that only inspects and reports quietly (`isValidMove`, returning `bool`)
— is a real, common API design pattern: a **query** (asks a question,
changes nothing) kept genuinely separate from a **command** (performs an
action, may change state) — often called **command-query separation**.

```
Also recognized in: a bank's own "check my balance" versus "withdraw
funds" as two genuinely separate operations, never the same call; a
file system's own "does this file exist" check versus "delete this
file"; a video game's own "can I afford this item" preview before an
actual "purchase" action commits anything
```

### SE lens

Without `isValidMove`, a UI wanting to preview legality would have to
call `placeDigit` inside a `try`/`catch` (Lesson 14) purely to discover
whether it *would* have thrown — awkward, and, worse, it would actually
commit the move if it happened to succeed, meaning a mere "preview" could
silently change the board. `isValidMove`'s real cost is real code
duplication: three of its four checks are near-identical copies of
`placeDigit`'s own checks, a maintenance risk if one is ever updated
without the other — a real, honest tradeoff this project accepts for now,
worth flagging for Lesson 101 (Refactoring) rather than solving
prematurely here.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified output:

```
isValidMove(0,2,4): true
isValidMove(0,2,5): false
isValidMove(0,0,4): false
board unchanged at (0,2) after checks: null
```

Real, saved in full in
`src/docs/flutter/verification/lesson-18/run-log.md`.

### Connecting this unit

This unit closed this lesson exactly where it started — the same three
constraints (row, column, box) `_isSafe` already enforced — now
accessible three different ways: committing and throwing
(`placeDigit`), listing every option (`candidatesFor`), and previewing
one specific option safely (`isValidMove`).

---

## Connect the Pieces

Trace cell `(0, 2)` — empty, on the real Phase 1 milestone starting
puzzle — through everything this lesson built. Concept Unit 1's row
check found row 0 already holds `5`, `3`, and `7`. Concept Unit 2's
column check found column 2 already holds `8`. Concept Unit 3's box
check found the top-left box already holds `5`, `3`, `6`, `9`, and `8` —
each constraint real-traced, iteration by iteration, against
`_isSafe`'s own already-existing, unmodified code. Concept Unit 4's new
`candidatesFor(0, 2)` combined all three constraints across every digit
`1` through `9` at once, real-proved to return exactly `[1, 2, 4]` —
matching a hand-worked check precisely. And Concept Unit 5's new
`isValidMove(0, 2, 4)` confirmed `true` for one of those three real
candidates, `isValidMove(0, 2, 5)` confirmed `false` for the exact row
conflict Concept Unit 1 proved, and the board itself real-proved
completely unchanged afterward — a genuine preview, not a commitment.

`project/lib/sudoku_board.dart` now offers three distinct, real ways to
ask about a move's legality, all built on the identical, already-correct
`_isSafe`. Lesson 19 turns from *checking* one move to *finding* an
entire solution: backtracking, recursion, and the search tree a solver
actually walks.
