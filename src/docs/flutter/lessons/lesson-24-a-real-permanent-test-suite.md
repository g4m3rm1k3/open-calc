# Lesson 24: A Real, Permanent Test Suite

**What you will build:** `project/test/sudoku_board_test.dart` — this
project's first real, permanent test file, systematically covering
curriculum.md's own five explicit categories: valid boards, invalid
boards, multiple solutions, no solutions, and generated puzzle
uniqueness. One genuinely new method, `isValidStartingGrid`, closes a
real gap this project has carried since Lesson 19: nothing has ever
checked whether a board's own *given* clues are mutually consistent with
each other, only whether a *new* placement conflicts with what's already
there. This is Phase 2's final lesson before its own milestone.

**What you need to know first:** Lesson 22's own small, self-written
`expectEqual` test harness, extended here into `expectTrue`/`expectFalse`
— the same pattern, not a different one. Lesson 20's own real, ambiguous
`1`/`2`-swap puzzle and Lesson 19's own real, zero-candidate construction
— both reused directly as real test cases, not reinvented.

**Terms used in this lesson:**

- **Declaration** — reappearing from Lesson 5, restated in full: the
  statement introducing a variable for the first time.
- **Increment operator (`++`)** — reappearing from Lesson 7, restated in
  full: shorthand for adding exactly `1` to a variable and storing the
  result back into it.
- **Ternary expression (`condition ? a : b`)** — reappearing from Lesson
  6, restated in full: evaluates `condition`; the whole expression
  becomes `a` if `true`, `b` otherwise.
- **Test suite** — a collection of individual tests, run together,
  covering many different real scenarios for the same code under test.
  It exists because a single test only ever proves one specific
  scenario; real confidence in a piece of code comes from a suite
  covering the meaningfully different cases that code needs to handle
  correctly, not just one.
- **Test, expectation** — reappearing from Lesson 22, restated in full: a
  **test** runs a real operation and checks its real result against a
  known, expected one; an **expectation** is one specific such check.

**Objects and methods used:**

- **`SudokuBoard`**
  - *What it is:* the same real class Lessons 17-23 worked with, in
    `project/lib/sudoku_board.dart`.
  - *Implementation:* real, current source, read fresh this session.
    This lesson adds one new public method: `bool
    isValidStartingGrid()`.
  - *Its use:* this lesson's entire test suite exercises this class.
  - *Type:* a real, encapsulated class (Lesson 11's term, reappearing).
  - *Responsibility:* widened once more — beyond validating moves,
    solving, generating, and classifying, `SudokuBoard` can now also
    validate its own *starting* state.
  - *Depends on:* `_isSafe` (Lesson 18), reused directly by
    `isValidStartingGrid`.
  - *Connects to:* `isValidStartingGrid` calls `_isSafe` once per
    already-filled cell, checking each against every *other* cell in its
    own row/column/box — the same real method every earlier check on a
    *new* placement already used, here applied to cells that were
    already there from the start.
  - *Shape:* unchanged from Lesson 17 — the real, persisting boundary
    between a board's internal state and what other code may do with it.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every test result in this lesson's suite is reported
    through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: Confirming a Valid Board Behaves Correctly

### The Problem

Every real proof so far has checked one specific method's own behavior in
isolation. Curriculum's own first testing category asks a broader
question: does a genuinely *valid* board behave correctly across every
relevant check at once — completeness, internal consistency, and
uniqueness together?

> **Stop and think before reading on:** A fully-solved board has no empty
> cells at all. Given that, what do you predict `hasUniqueSolution`
> (Lesson 20) reports for a board that's already completely solved — does
> "checking for a second solution" even make sense once there are no
> empty cells left to search?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new test
  function, exercising already-existing methods.
- **Files affected:** `project/test/sudoku_board_test.dart` — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file, inside a new `project/test/` folder.
- **Dependencies:** `isComplete` (Lesson 17), `hasUniqueSolution` (Lesson
  20), `isValidStartingGrid` (this lesson's own next unit).

### The New Code

```dart
void expectTrue(bool actual, String description) {
  testsRun++;
  if (actual != true) {
    testsFailed++;
    print('FAIL: $description — expected true, got $actual');
  } else {
    print('PASS: $description');
  }
}

void _testValidBoards() {
  final completeBoard = SudokuBoard(
      List.generate(9, (r) => List<int?>.from(knownSolution[r])));
  expectTrue(completeBoard.isComplete, 'a fully-solved board isComplete');
  expectTrue(completeBoard.hasUniqueSolution(),
      'a fully-solved board has exactly one solution (itself)');
}
```

### The Updated Project

Not applicable — this is the file's brand-new starting content (`test/`
did not exist in `project/` before this lesson).

### Introduce the concept in isolation

Whether a fully-solved board genuinely reports both `true`s is worth
real proof — run for real, batched with this lesson's remaining units:

```
PASS: a fully-solved board isComplete
PASS: a fully-solved board has exactly one solution (itself)
```

`hasUniqueSolution` genuinely does make sense on an already-complete
board: `_countSolutionsUpTo` (Lesson 20) finds no empty cell at all on
its very first check, hits its own base case immediately, and reports
exactly `1` — the board is already its own one and only solution.

### Discarding this example

Nothing to discard — this is real, permanent project code, not a
throwaway example.

### Mechanical walkthrough

- **`void expectTrue(bool actual, String description)`** — a function
  declaration (Lesson 8's term, reappearing), extending Lesson 22's own
  `expectEqual` pattern to the narrower, common case of "this should be
  `true`."
- **`testsRun++;`, `if (actual != true)`** — the increment operator and
  `if`/inequality operator (all reappearing from Lessons 6, 7, 22).
- **`SudokuBoard(List.generate(9, (r) => List<int?>.from(knownSolution[r])))`**
  — Lesson 11's constructor, Lesson 17's real `List.generate`
  construction (both reappearing), building a board from an already-fully-
  solved grid.
- **`completeBoard.isComplete`** — Lesson 17's own real getter
  (reappearing).
- **`completeBoard.hasUniqueSolution()`** — Lesson 20's own already-real
  method, exercised here on a case it was never specifically tested
  against before: a board with zero empty cells.

### CS lens

Testing a "boundary" case — here, zero empty cells, the extreme opposite
of every other puzzle this project has generated — is a specific,
well-known testing technique: **edge-case testing**, deliberately
checking behavior at the limits of what an input can be, not just
typical, middle-of-the-road cases.

```
Also recognized in: testing a sorting function on an already-sorted
list or an empty list, not just a shuffled one; testing a `List`'s
own index operator at position `0` and at its very last valid
position; testing a bank withdrawal of exactly the full account
balance, not just a partial amount
```

### SE lens

Without this specific test, a subtle bug in `_countSolutionsUpTo`'s own
base case (Lesson 20) — say, an off-by-one error in checking for empty
cells — could silently misreport an already-solved board as having zero
or multiple solutions, and nothing else in this project would ever have
caught it, since every other real usage so far has been on boards with
genuine empty cells.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's tests are combined with this lesson's remaining units into one
file, run once. Complete real output shown in Concept Unit 5's own "Run
it" step, saved in `src/docs/flutter/verification/lesson-24/run-log.md`.

### Connecting this unit

This unit confirmed a valid board behaves correctly. The next unit builds
a genuinely new method to catch a kind of invalid board nothing has ever
checked for.

---

## Concept Unit: Catching a Board That Was Never Valid to Begin With

### The Problem

Every validation this project has ever performed (Lesson 18's `_isSafe`)
only ever checks a *new* digit being placed against cells already on the
board. Nothing has ever checked whether the *starting* grid's own given
clues are mutually consistent with each other — two given `5`s in the
same row, for instance, would currently be accepted silently by
`SudokuBoard`'s own constructor.

> **Stop and think before reading on:** Given that `_isSafe(row, col,
> digit)` already checks whether `digit` conflicts with *other* cells in
> the same row/column/box, what do you predict happens if you call it
> using an *already-filled* cell's own existing digit, rather than a new
> one being considered for an empty cell?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new
  method, filling a real gap this project has carried since Lesson 19's
  own investigation first surfaced it.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new public method.
- **Change type:** Add (new method).
- **Location:** Directly before `findNakedSingle` (Lesson 21).
- **Dependencies:** `_isSafe` (Lesson 18).

### The New Code

```dart
bool isValidStartingGrid() {
  for (int row = 0; row < size; row++) {
    for (int col = 0; col < size; col++) {
      final digit = _grid[row][col];
      if (digit != null && !_isSafe(row, col, digit)) {
        return false;
      }
    }
  }
  return true;
}
```

### The Updated Project

```dart
192:  bool isValidStartingGrid() {                    // ← new
193:    for (int row = 0; row < size; row++) {          // ← new
194:      for (int col = 0; col < size; col++) {          // ← new
195:        final digit = _grid[row][col];                 // ← new
196:        if (digit != null && !_isSafe(row, col, digit)) { // ← new
197:          return false;                                  // ← new
198:        }                                                // ← new
199:      }                                                 // ← new
200:    }                                                   // ← new
201:    return true;                                        // ← new
202:  }                                                    // ← new
203:
204:  List<int>? findNakedSingle() {
205:    /// [... unchanged, Lesson 21]
```

### Introduce the concept in isolation

This unit's own Socratic question is worth real, contrasted proof — run
for real, batched:

```
PASS: the real milestone puzzle has no internal conflicts
PASS: two given 5s in the same row is correctly detected as invalid
```

The real, published milestone puzzle's own given clues are confirmed
mutually consistent. A deliberately constructed grid with two given `5`s
in row `0` is correctly detected as invalid — proving `_isSafe`, called
against an already-filled cell's own existing digit, correctly detects
that digit conflicting with *another* already-filled cell, exactly the
same way it already detects a *new* digit conflicting with existing
ones.

### Discarding this example

Nothing to discard — `isValidStartingGrid` is a genuine, permanent
addition to `project/`; the deliberately-broken grid used to prove it is
disposable test data.

### Mechanical walkthrough

- **`bool isValidStartingGrid()`** — a method (Lesson 11's term,
  reappearing) with no parameters, returning `bool`.
- **The nested `for` loops** — Lesson 7's nested loops (reappearing), the
  same row-major scan every earlier real method has used.
- **`final digit = _grid[row][col];`** — a declaration (Lesson 5's term,
  reappearing), reading whatever this cell currently holds — possibly
  `null`.
- **`if (digit != null && !_isSafe(row, col, digit))`** — Lesson 6's `if`,
  inequality operator, and logical AND (all reappearing), short-
  circuiting (Lesson 6's term, reappearing): a `null` cell is skipped
  entirely, since an empty cell has nothing to check for conflicts.
  Lesson 6's logical NOT operator (reappearing) inverts `_isSafe`'s own
  real result — `_isSafe(row, col, digit)` asks "would placing `digit`
  here be safe," and since `digit` is already *sitting* there, this
  correctly asks whether it conflicts with anything *else* already on
  the board.
- **`return false;`**, **`return true;`** — Lesson 8's `return`
  (reappearing), reporting the first conflict found, or, if the entire
  board was scanned with no conflict at all, confirming the whole
  starting grid is genuinely valid.

### CS lens

Validating a data structure's own *initial* state, separately from
validating every operation performed *on* it afterward, is a real,
general software correctness principle: an operation can be proven
correct in isolation and still produce a wrong overall result if the data
it started from was already invalid — exactly the gap this method closes.

```
Also recognized in: a database migration validating existing data
before applying new constraints, not just enforcing constraints on
future writes; a compiler validating a configuration file's own
internal consistency before using any of it; a spell-checker
validating a document already open, not only new text as it's typed
```

### SE lens

This gap existed silently since Lesson 19 — nothing in this project ever
actually needed it, because every puzzle used so far (the real milestone
puzzle, every real generated puzzle) happened to start from a genuinely
valid grid. `isValidStartingGrid`'s real value is defensive: if
`project/`'s own puzzle-loading code (not yet built — a real Flutter UI
is Phase 3's job) ever accepted a puzzle from an untrusted source (a
user-typed grid, a corrupted save file), this method is what would catch
an already-broken starting point before wasting any time trying to solve
or play it.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.
- **`dart analyze <file>`** — reappearing from Lesson 5, restated in
  full: statically checks a file for compile-time errors without running
  it.

### Run it

Not run standalone; full output in Concept Unit 5's own "Run it" step.

### Connecting this unit

This unit caught a board that was never valid to begin with. The next
unit reuses a puzzle that *is* validly built, but still has more than one
real solution.

---

## Concept Unit: Reusing a Real, Already-Built Ambiguous Puzzle

### The Problem

Lesson 20 already built a real, deliberately non-unique puzzle to prove
`hasUniqueSolution` works — reinventing a second one here would be
redundant. Curriculum's own "multiple solutions" testing category is
exactly what that puzzle already demonstrates.

> **Stop and think before reading on:** Given Lesson 20's own real
> `1`/`2`-swap construction (emptying every cell holding a `1` or `2` in
> a known solution, since swapping the two everywhere is a valid
> symmetry of any completed Sudoku), is writing a *new* test for this
> exact scenario actually testing anything new, or is it re-confirming
> something Lesson 20 already proved?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`'s own real
  `hasUniqueSolution` (Lesson 20) — this unit reuses Lesson 20's own
  already-real ambiguous puzzle construction directly, not a new one.
- **Files affected:** `project/test/sudoku_board_test.dart` — modified,
  adding a new test function.
- **Change type:** Add (new function).
- **Location:** Directly after `_testInvalidBoards`.
- **Dependencies:** `hasUniqueSolution` (Lesson 20).

### The New Code

```dart
void _testMultipleSolutions() {
  final ambiguousGrid = List.generate(
    9,
    (r) => List<int?>.generate(
      9,
      (c) => (knownSolution[r][c] == 1 || knownSolution[r][c] == 2)
          ? null
          : knownSolution[r][c],
    ),
  );
  expectFalse(
      SudokuBoard(ambiguousGrid).hasUniqueSolution(),
      'a deliberately ambiguous 1/2-swap puzzle is correctly detected as '
      'non-unique');
}
```

### The Updated Project

```dart
 1: import 'dart:math';
 2: import '../lib/sudoku_board.dart';
 3:
 4: /// [... testsRun, testsFailed, expectTrue, expectFalse, _samplePuzzle,
 5: ///  _knownSolution, _testValidBoards, _testInvalidBoards from earlier
 6: ///  units in this lesson, unchanged]
 7:
 8: void _testMultipleSolutions() {                              // ← new
 9:   final ambiguousGrid = List.generate(                       // ← new
10:     9,                                                       // ← new
11:     (r) => List<int?>.generate(                               // ← new
12:       9,                                                       // ← new
13:       (c) => (knownSolution[r][c] == 1 || knownSolution[r][c] == 2)  // ← new
14:           ? null                                                    // ← new
15:           : knownSolution[r][c],                                    // ← new
16:     ),                                                       // ← new
17:   );                                                         // ← new
18:   expectFalse(                                               // ← new
19:       SudokuBoard(ambiguousGrid).hasUniqueSolution(),          // ← new
20:       'a deliberately ambiguous 1/2-swap puzzle is correctly detected as '  // ← new
21:       'non-unique');                                          // ← new
22: }                                                            // ← new
```

### Introduce the concept in isolation

Whether reusing this exact real construction still correctly reports
non-uniqueness, as part of this new, permanent test file rather than
Lesson 20's own throwaway verification script, is worth real
confirmation — run for real, batched:

```
PASS: a deliberately ambiguous 1/2-swap puzzle is correctly detected as non-unique
```

### Discarding this example

Nothing new to discard — this exact construction is Lesson 20's own
already-real evidence, now given a permanent home as a real, named test.

### Mechanical walkthrough

- **`List.generate(9, (r) => List<int?>.generate(9, (c) => ...))`** —
  Lesson 17's real `List.generate` construction, nested (Lesson 20's own
  real pattern, reappearing): the outer call builds 9 rows, the inner
  call builds each row's own 9 cells.
- **`(knownSolution[r][c] == 1 || knownSolution[r][c] == 2) ? null : knownSolution[r][c]`**
  — the ternary expression (Lesson 6's term, reappearing): if this cell's
  real solved value is `1` or `2` (Lesson 6's logical OR and equality
  operator, both reappearing), it becomes `null`; otherwise, it keeps its
  real solved value.
- **`SudokuBoard(ambiguousGrid).hasUniqueSolution()`** — the same real
  method call as Concept Unit 1, this time on a board proven, by
  Lesson 20's own real reasoning, to have at least two solutions.

### CS lens

Reusing an already-proven test scenario, rather than constructing a new
one for the same underlying property, is **test reuse** — avoiding
redundant test-writing effort while still exercising the exact same
real, meaningful case.

```
Also recognized in: a regression test suite reusing the exact input
that once triggered a real, fixed bug, rather than inventing new
inputs for the same fix; a physics simulation's own known analytical
solutions, reused across many different test suites as ground truth
```

### SE lens

Constructing a *new* ambiguous puzzle here, rather than reusing Lesson
20's own real one, would cost real effort for no real additional
confidence — the underlying property being tested (does
`hasUniqueSolution` detect a second solution) is identical either way.
Reuse here is the right call specifically because the *scenario* is
identical, not because reuse is always preferable — a genuinely
different kind of ambiguity (not derivable from a simple digit swap)
would still deserve its own, separate test.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this
  lesson.

### Run it

Not run standalone; full output in Concept Unit 5's own "Run it" step.

### Connecting this unit

This unit reused a real, already-proven ambiguous case. The next unit
does the same for a puzzle with no solution at all.

---

## Concept Unit: Reusing a Real, Already-Engineered Unsolvable Board

### The Problem

Lesson 19 already built a real, hand-engineered board with exactly zero
candidates for its one remaining empty cell, to prove `solve()` correctly
reports failure. Curriculum's own "no solutions" testing category is
exactly this scenario.

> **Stop and think before reading on:** Given Lesson 19's own real
> construction (corrupting one given digit elsewhere in a row so the
> one remaining empty cell has no legal digit left at all), would
> constructing a *different* unsolvable board actually test anything
> `solve()`'s own real behavior on *this* one hasn't already covered?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`'s own real
  `solve` (Lesson 19) — this unit reuses Lesson 19's own already-real
  unsolvable construction directly.
- **Files affected:** `project/test/sudoku_board_test.dart` — modified,
  adding a new test function.
- **Change type:** Add (new function).
- **Location:** Directly after `_testMultipleSolutions`.
- **Dependencies:** `solve` (Lesson 19).

### The New Code

```dart
void _testNoSolutions() {
  final unsolvableGrid = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [9, 4, 5, 2, 8, 6, 1, 7, null],
  ];
  expectFalse(
      SudokuBoard(unsolvableGrid).solve(),
      'a board engineered to have zero real candidates for its one empty '
      'cell fails to solve');
}
```

### The Updated Project

```dart
23: void _testNoSolutions() {                          // ← new
24:   final unsolvableGrid = [                          // ← new
25:     [5, 3, 4, 6, 7, 8, 9, 1, 2],                       // ← new
26:     /// [... rows 1-7, the real known solution's own values, unchanged]
33:     [9, 4, 5, 2, 8, 6, 1, 7, null],                    // ← new
34:   ];                                                  // ← new
35:   expectFalse(                                        // ← new
36:       SudokuBoard(unsolvableGrid).solve(),              // ← new
37:       'a board engineered to have zero real candidates for its one empty '  // ← new
38:       'cell fails to solve');                          // ← new
39: }                                                     // ← new
```

(Rows 1-7 are the real known solution's own middle rows, identical to
row 8's own real neighbors in Lesson 19's original construction, omitted
here only for length — the complete, real file is
`project/test/sudoku_board_test.dart`.)

### Introduce the concept in isolation

Real, verified output, batched:

```
PASS: a board engineered to have zero real candidates for its one empty cell fails to solve
```

### Discarding this example

Nothing new to discard — Lesson 19's own already-real construction, now
given a permanent home as a real, named test.

### Mechanical walkthrough

- **`unsolvableGrid`** — Lesson 19's own real construction, reappearing
  unchanged: almost the entire known solution, given as fixed clues,
  except row `8`'s own last cell, deliberately left empty after row `8`'s
  own first value was changed to create a redundant digit — leaving that
  one empty cell with zero real legal candidates.
- **`SudokuBoard(unsolvableGrid).solve()`** — Lesson 19's own already-real
  method, expected here to return `false`.

### CS lens

The same **test reuse** (previous unit's own CS lens) applies here
identically — a genuinely unsolvable board is a real, specific scenario,
and Lesson 19's own construction already proves `solve()` handles it
correctly.

```
Also recognized in: (see the previous unit's own CS lens — the
identical underlying idea, applied here to a different real scenario)
```

### SE lens

Keeping this exact construction as a permanent, named test means any
*future* change to `solve` (Lesson 19), `candidatesFor` (Lesson 18), or
`_isSafe` (Lesson 18) that accidentally broke unsolvable-board detection
would be caught immediately, automatically, the next time this suite
runs — rather than only being noticed if someone happened to manually
retest this exact scenario by hand.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this
  lesson.

### Run it

Not run standalone; full output in the final unit's own "Run it" step.

### Connecting this unit

This unit reused a real, already-proven unsolvable case. The final unit
adds the last of curriculum's own five categories: confirming freshly
*generated* puzzles are actually unique, not just already-known ones.

---

## Concept Unit: Confirming Fresh, Generated Puzzles Stay Unique

### The Problem

Every real puzzle tested so far in this lesson was either already known
(the milestone puzzle) or deliberately hand-engineered (the ambiguous and
unsolvable cases). Curriculum's own final category asks about puzzles
this project's *own generation pipeline* (Lesson 20) actually produces —
does a freshly generated, freshly carved puzzle reliably come out
unique?

> **Stop and think before reading on:** Given Lesson 20's own real
> finding that random removal becomes unreliable past roughly `50` empty
> cells (no unique puzzle turned up in 60 real attempts each at `50`+),
> what number of empty cells would make a *reliable*, single-attempt test
> of `generateComplete`/`removeDigits`/`hasUniqueSolution` together —
> reliable enough to trust running just once, rather than needing its own
> retry loop?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`'s own real
  `generateComplete`/`removeDigits`/`hasUniqueSolution` (Lesson 20) —
  this unit exercises the complete, real generation pipeline together,
  for the first time, as one single, permanent test.
- **Files affected:** `project/test/sudoku_board_test.dart` — modified,
  adding a new test function and a real `main` tying every test together,
  completing this lesson's own file.
- **Change type:** Add (new function; new `main`).
- **Location:** Directly after `_testNoSolutions`; `main` at the end of
  the file.
- **Dependencies:** `generateComplete`, `removeDigits`,
  `hasUniqueSolution` (Lesson 20).

### The New Code

```dart
void _testGeneratedPuzzleUniqueness() {
  final complete = SudokuBoard.generateComplete(Random(123));
  final generatedGrid = complete.removeDigits(Random(456), 35);
  expectTrue(
      SudokuBoard(generatedGrid).hasUniqueSolution(),
      'a freshly generated, lightly-carved puzzle (35 empty cells) has a '
      'unique solution');
}

void main() {
  _testValidBoards();
  _testInvalidBoards();
  _testMultipleSolutions();
  _testNoSolutions();
  _testGeneratedPuzzleUniqueness();
  print('$testsRun tests run, $testsFailed failed');
}
```

### The Updated Project

The complete, final `project/test/sudoku_board_test.dart` (new lines
marked; everything above is exactly what this lesson's earlier units
left it as):

```dart
40: void _testGeneratedPuzzleUniqueness() {              // ← new
41:   final complete = SudokuBoard.generateComplete(Random(123));  // ← new
42:   final generatedGrid = complete.removeDigits(Random(456), 35); // ← new
43:   expectTrue(                                        // ← new
44:       SudokuBoard(generatedGrid).hasUniqueSolution(),  // ← new
45:       'a freshly generated, lightly-carved puzzle (35 empty cells) has a '  // ← new
46:       'unique solution');                            // ← new
47: }                                                    // ← new
48:
49: void main() {                                         // ← new
50:   _testValidBoards();                                  // ← new
51:   _testInvalidBoards();                                // ← new
52:   _testMultipleSolutions();                             // ← new
53:   _testNoSolutions();                                   // ← new
54:   _testGeneratedPuzzleUniqueness();                     // ← new
55:   print('$testsRun tests run, $testsFailed failed');    // ← new
56: }                                                      // ← new
```

### Introduce the concept in isolation

Choosing `35` empty cells — well below Lesson 20's own real `50`+
unreliability threshold — is exactly what answers this unit's own
Socratic question: reliable enough for a single real attempt, no retry
loop needed. Real, verified proof:

```
PASS: a freshly generated, lightly-carved puzzle (35 empty cells) has a unique solution
```

And the complete, final suite, all five categories together:

```
PASS: a fully-solved board isComplete
PASS: a fully-solved board has no internal conflicts
PASS: a fully-solved board has exactly one solution (itself)
PASS: the real milestone puzzle has no internal conflicts
PASS: two given 5s in the same row is correctly detected as invalid
PASS: a deliberately ambiguous 1/2-swap puzzle is correctly detected as non-unique
PASS: a board engineered to have zero real candidates for its one empty cell fails to solve
PASS: a freshly generated, lightly-carved puzzle (35 empty cells) has a unique solution
8 tests run, 0 failed
```

### Discarding this example

Nothing to discard — the entire file is now real, permanent project
code.

### Mechanical walkthrough

- **`SudokuBoard.generateComplete(Random(123))`** — Lesson 20's own real,
  `static` (Lesson 20's term, reappearing) method, seeded (Lesson 22's
  term, reappearing) for reproducibility.
- **`complete.removeDigits(Random(456), 35)`** — Lesson 20's own real
  method, carving out `35` cells — deliberately chosen, per this unit's
  own Socratic question, to sit well inside Lesson 20's own real,
  observed reliable range.
- **`void main()`** — Dart's own entry point (Lesson 1's term,
  reappearing), here calling every one of this lesson's five test
  functions in sequence, then reporting the real, final tally.

### CS lens

Running an entire pipeline's own real, composed behavior end to end —
generation, carving, and uniqueness-checking together — rather than only
testing each piece in isolation, is an **integration test**: proving the
pieces genuinely work correctly *together*, not just individually.

```
Also recognized in: testing an entire assembly line's own output,
not just each individual machine; a car's own full road test, not
just bench-testing each individual part; a restaurant's own finished
dish tasted as a whole, not just each ingredient checked separately
```

### SE lens

Choosing `35` specifically (rather than, say, `50`) is a deliberate,
honest engineering decision this unit's own Socratic question already
surfaced: a test that occasionally fails through no fault of the code
under test — because randomness happened to produce a rare, genuinely
non-unique puzzle at a higher removal count — would be a real, ongoing
maintenance burden (a "flaky" test, undermining trust in the whole
suite). Choosing a removal count Lesson 20's own real data already shows
is reliable trades a small amount of real puzzle sparsity for a test that
can be trusted to mean something every single time it runs.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this
  lesson.
- **`dart analyze <file>`** — reappearing from Lesson 5, restated in
  full: statically checks a file for compile-time errors without running
  it — run against the whole `project/` directory, confirming this
  lesson's additions introduced no static errors.

### Run it

Real, verified, complete output for this lesson's entire, permanent test
suite:

```
Analyzing ....
No issues found!
--- running test suite ---
PASS: a fully-solved board isComplete
PASS: a fully-solved board has no internal conflicts
PASS: a fully-solved board has exactly one solution (itself)
PASS: the real milestone puzzle has no internal conflicts
PASS: two given 5s in the same row is correctly detected as invalid
PASS: a deliberately ambiguous 1/2-swap puzzle is correctly detected as non-unique
PASS: a board engineered to have zero real candidates for its one empty cell fails to solve
PASS: a freshly generated, lightly-carved puzzle (35 empty cells) has a unique solution
8 tests run, 0 failed
```

Real, saved in full in
`src/docs/flutter/verification/lesson-24/run-log.md`.

### Connecting this unit

This unit closed Phase 2's final lesson with a real, composed,
integration-level proof that this project's entire generation pipeline
works correctly end to end — the last of curriculum's own five explicit
testing categories, all real, all passing, all permanent.

---

## Connect the Pieces

Trace this project's own entire test suite through everything Phase 2
built. Concept Unit 1 confirmed a valid, fully-solved board behaves
correctly at every relevant check — `isComplete`, and, genuinely tested
for the first time, `hasUniqueSolution` on a board with zero empty
cells. Concept Unit 2 closed a real gap this project carried silently
since Lesson 19: a new `isValidStartingGrid`, real-proved to catch two
given `5`s conflicting in the same row — something nothing in this
project had ever checked before. Concept Unit 3 reused, rather than
reinvented, Lesson 20's own real ambiguous `1`/`2`-swap puzzle. Concept
Unit 4 reused Lesson 19's own real, zero-candidate unsolvable
construction. And Concept Unit 5 closed this lesson — and this project's
own Phase 2 code — with a real, composed integration test: generate,
carve, and confirm uniqueness, all three real methods working correctly
together, at a removal count deliberately chosen, from Lesson 20's own
real data, to be reliable every time this suite runs.

`project/test/sudoku_board_test.dart` is now a real, permanent,
passing test suite — 8 real tests, 0 failures, covering all five of
curriculum's own explicit categories, living inside the actual project
rather than session-scoped verification scratch. Phase 2's own
milestone is next: a final, honest review of `project/lib/
sudoku_board.dart` as a whole — every method Lessons 17 through 24 built,
together — and one last full run of this exact suite, confirming
curriculum's own promise: "a robust, fully tested Sudoku engine
independent of Flutter."
