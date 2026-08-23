# Lesson 21: What Difficulty Actually Means

**What you will build:** `findNakedSingle` and `findHiddenSingle` — two
genuinely different ways of detecting a cell whose value is already
logically forced — combined into `classifyDifficulty`, a real, honest
difficulty classifier for `project/lib/sudoku_board.dart`'s own
`SudokuBoard`, judged by *which* technique a puzzle actually needs to
solve, never by how many cells are empty. Tested against three real,
generated puzzles: the milestone's own real starting puzzle (`Easy`), a
real generated puzzle needing hidden singles (`Medium`), and a real
generated puzzle — found only after a genuine, reported search — that
neither technique alone can finish (`Hard`).

**What you need to know first:** Lesson 18's `candidatesFor` — both of
this lesson's own detection methods are built on it. Lesson 20's
`generateComplete`/`removeDigits`/`hasUniqueSolution`, reused directly to
produce this lesson's own real test puzzles.

**Terms used in this lesson:**

- **`while` loop** — reappearing from Lesson 7, restated in full: repeats
  a block of code for as long as a condition keeps holding, checking that
  condition again before every repetition.
- **`continue`** — used inside a loop, immediately jumps back to the
  loop's own next repetition (re-checking its condition), skipping
  whatever code in the loop's body would otherwise run after it, for
  this one pass only. It exists for exactly this lesson's own case: after
  successfully placing a naked single, `_applyLogicalTechniques` (Concept
  Unit 3) needs to re-check for naked singles again from scratch, rather
  than falling through to the more expensive hidden-single check every
  single time.
- **Naked single** — an empty cell with exactly one real candidate
  (Lesson 18) left — the digit that must go there is already fully
  determined just by looking at that one cell alone.
- **Unit** — a row, a column, or a 3x3 box — any one of the three groups
  of 9 cells a Sudoku's own constraints (Lesson 18) apply to. This
  lesson's own `findHiddenSingle` treats all three the same way, one
  unit at a time.
- **Hidden single** — a digit that only fits in exactly one empty cell
  *within one unit*, even though that one cell may still have other real
  candidates too — "hidden" because it isn't visible from that cell's own
  candidate list alone, only by comparing every cell in the same unit
  against each other.
- **Candidate elimination** — repeatedly applying naked-single and
  hidden-single detection, each placement narrowing every other cell's
  own candidates further, until either the board is complete or neither
  technique finds anything left to place. It exists as the real,
  human-like way a Sudoku puzzle is normally solved *without* guessing —
  distinct from Lesson 19's own backtracking, which always guesses and
  is prepared to undo a wrong guess.
- **Difficulty** — curriculum's own explicit warning, restated as this
  lesson's real subject: not the number of empty cells a puzzle has, but
  *which* technique is actually required to solve it — naked singles
  alone, hidden singles too, or genuine guessing (backtracking) beyond
  both.

**Objects and methods used:**

- **`SudokuBoard`**
  - *What it is:* the same real class Lessons 17-20 worked with, in
    `project/lib/sudoku_board.dart`.
  - *Implementation:* real, current source, read fresh this session.
    This lesson adds `List<int>? findNakedSingle()`, `List<int>?
    findHiddenSingle()` (backed by new private `_hiddenSingleIn`,
    `_rowCells`, `_colCells`, `_boxCells`, and `_applyLogicalTechniques`),
    and `String classifyDifficulty()`.
  - *Its use:* this lesson's entire subject.
  - *Type:* a real, encapsulated class (Lesson 11's term, reappearing).
  - *Responsibility:* widened again — beyond solving and generating,
    `SudokuBoard` can now judge how hard a puzzle actually is to solve by
    hand.
  - *Depends on:* `candidatesFor` (Lesson 18); `classifyDifficulty` also
    depends on the `SudokuBoard` constructor (Lesson 11) to build the
    copies it tests against.
  - *Connects to:* `findHiddenSingle` calls `candidatesFor` once per cell
    in each unit it checks; `classifyDifficulty` builds two separate
    fresh copies (never mutating the real board) and calls
    `findNakedSingle`/`_applyLogicalTechniques` on each.
  - *Shape:* unchanged from Lesson 17 — the real, persisting boundary
    between a board's internal state and what other code may do with it.
- **`List`**
  - *What it is:* the same real, generic `dart:core` class Lesson 9
    introduced.
  - *Implementation:* `abstract interface class List<E> implements
    Iterable<E>, _ListIterable<E>` (verified in Lesson 9).
  - *Its use:* `findNakedSingle`/`findHiddenSingle` both return
    `List<int>?` — `[row, col, digit]` or `null`.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 9.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: A Cell With Only One Real Option

### The Problem

Lesson 18's `candidatesFor` already computes every legal digit for a
cell. Sometimes that list has exactly one entry — meaning the cell's own
value is already fully determined, with no guessing needed at all. Does
`project/lib/sudoku_board.dart` have any way to find such a cell
directly?

> **Stop and think before reading on:** Given `candidatesFor` already
> exists (Lesson 18), what's the smallest possible check needed to find
> the *first* empty cell whose own candidate list has exactly one entry?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new
  method, built directly on Lesson 18's own `candidatesFor`.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new public method.
- **Change type:** Add (new method).
- **Location:** Directly after `_countSolutionsUpTo` (Lesson 20).
- **Dependencies:** `candidatesFor` (Lesson 18).

### The New Code

```dart
List<int>? findNakedSingle() {
  for (int row = 0; row < size; row++) {
    for (int col = 0; col < size; col++) {
      if (_grid[row][col] == null) {
        final candidates = candidatesFor(row, col);
        if (candidates.length == 1) {
          return [row, col, candidates[0]];
        }
      }
    }
  }
  return null;
}
```

### The Updated Project

```dart
192:  List<int>? findNakedSingle() {                       // ← new
193:    for (int row = 0; row < size; row++) {               // ← new
194:      for (int col = 0; col < size; col++) {               // ← new
195:        if (_grid[row][col] == null) {                       // ← new
196:          final candidates = candidatesFor(row, col);         // ← new
197:          if (candidates.length == 1) {                       // ← new
198:            return [row, col, candidates[0]];                 // ← new
199:          }                                                  // ← new
200:        }                                                    // ← new
201:      }                                                      // ← new
202:    }                                                        // ← new
203:    return null;                                             // ← new
204:  }                                                          // ← new
```

### Introduce the concept in isolation

Whether the real, published milestone puzzle actually has a real naked
single is worth real proof — run for real, batched with this lesson:

```
first naked single on the real milestone puzzle: [4, 4, 5]
candidates at that cell: [5]
```

Cell `(4, 4)` has exactly one real candidate, `5` — confirmed a second
way, directly through `candidatesFor(4, 4)`, matching. This is a **naked
single**.

### Discarding this example

Nothing to discard — `findNakedSingle` is a genuine, permanent addition
to `project/`.

### Mechanical walkthrough

- **`List<int>? findNakedSingle()`** — a method (Lesson 11's term,
  reappearing) returning a nullable `List<int>` (Lesson 5's term,
  reappearing, applied to a generic type — Lesson 9's term,
  reappearing).
- **The nested `for` loops, `if (_grid[row][col] == null)`** — Lesson
  7's loops and Lesson 6's `if`/equality operator (all reappearing), the
  exact same row-major scan `solve` (Lesson 19) already used.
- **`candidatesFor(row, col)`** — a method call (Lesson 9's term,
  reappearing) to Lesson 18's already-real method.
- **`candidates.length == 1`** — `List`'s own real `length` getter
  (Lesson 9, reappearing) compared with Lesson 6's equality operator
  (reappearing): exactly one entry means the cell's value is already
  fully determined.
- **`return [row, col, candidates[0]];`** — a list literal (Lesson 7's
  term, reappearing) bundling the cell's position and its one forced
  digit together as this method's own real result.

### CS lens

Detecting a variable with only one remaining legal value in a constraint
satisfaction problem (Lesson 19's own term, reappearing) is a specific,
well-known technique called **unit propagation** or **constraint
propagation**: a forced assignment for one variable narrows the legal
values for every other variable that shares a constraint with it,
sometimes cascading into further forced assignments.

```
Also recognized in: propositional logic's own unit propagation in a
SAT solver; a Boolean logic circuit where one input being fixed
forces certain outputs regardless of other inputs; a crossword
puzzle where one intersecting letter already fully determines an
otherwise-ambiguous word
```

### SE lens

`findNakedSingle` costs nothing new to compute — it's a thin, direct
reading of a value `candidatesFor` already produces — which is exactly
why it's the *first*, cheapest technique this lesson's own difficulty
classifier reaches for, before anything more expensive: any puzzle
solvable this way alone genuinely requires no real reasoning about
*other* cells at all, just repeatedly checking one cell's own candidate
count.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's code is combined with this lesson's remaining units into one file,
run once. Complete real output shown in Concept Unit 4's own "Run it"
step, saved in `src/docs/flutter/verification/lesson-21/run-log.md`.

### Connecting this unit

This unit found a value forced by looking at one cell alone. The next
unit finds a value forced by looking at a whole unit of 9 cells together,
something a naked single alone can never detect.

---

## Concept Unit: A Digit That Only Fits One Place

### The Problem

A naked single only exists when a cell's *own* candidate list has shrunk
to one. Sometimes a cell still has *several* real candidates — say, `3`,
`5`, and `7` — but one of those digits, say `5`, doesn't fit *anywhere
else* in that same row. That cell is still forced to be `5`, even though
`findNakedSingle` (previous unit) would never notice, since it only ever
looks at one cell's own candidate count.

> **Stop and think before reading on:** To find a digit that only fits
> one cell within an entire row, what would you need to check for *every*
> digit `1` through `9`, across *every* empty cell in that one row — not
> just one cell's own candidates, the way the previous unit did?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new
  method and several new private helpers.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  new members.
- **Change type:** Add (new members).
- **Location:** Directly after `findNakedSingle`.
- **Dependencies:** `candidatesFor` (Lesson 18), `boxSize`/`size`
  (Lesson 17).

### The New Code

```dart
List<int>? findHiddenSingle() {
  for (int row = 0; row < size; row++) {
    final found = _hiddenSingleIn(_rowCells(row));
    if (found != null) return found;
  }
  for (int col = 0; col < size; col++) {
    final found = _hiddenSingleIn(_colCells(col));
    if (found != null) return found;
  }
  for (int boxRow = 0; boxRow < size; boxRow += boxSize) {
    for (int boxCol = 0; boxCol < size; boxCol += boxSize) {
      final found = _hiddenSingleIn(_boxCells(boxRow, boxCol));
      if (found != null) return found;
    }
  }
  return null;
}
```

```dart
List<int>? _hiddenSingleIn(List<List<int>> cells) {
  for (int digit = 1; digit <= 9; digit++) {
    final cellsWithDigit = <List<int>>[];
    for (var cell in cells) {
      if (_grid[cell[0]][cell[1]] == null &&
          candidatesFor(cell[0], cell[1]).contains(digit)) {
        cellsWithDigit.add(cell);
      }
    }
    if (cellsWithDigit.length == 1) {
      final cell = cellsWithDigit[0];
      return [cell[0], cell[1], digit];
    }
  }
  return null;
}
```

### The Updated Project

```dart
205:  List<int>? findHiddenSingle() {                          // ← new
206:    for (int row = 0; row < size; row++) {                  // ← new
207:      final found = _hiddenSingleIn(_rowCells(row));          // ← new
208:      if (found != null) return found;                        // ← new
209:    }                                                        // ← new
210:    for (int col = 0; col < size; col++) {                    // ← new
211:      final found = _hiddenSingleIn(_colCells(col));            // ← new
212:      if (found != null) return found;                         // ← new
213:    }                                                         // ← new
214:    for (int boxRow = 0; boxRow < size; boxRow += boxSize) {    // ← new
215:      for (int boxCol = 0; boxCol < size; boxCol += boxSize) {   // ← new
216:        final found = _hiddenSingleIn(_boxCells(boxRow, boxCol)); // ← new
217:        if (found != null) return found;                         // ← new
218:      }                                                        // ← new
219:    }                                                          // ← new
220:    return null;                                              // ← new
221:  }                                                           // ← new
222:
223:  List<List<int>> _rowCells(int row) =>                       // ← new
224:      List.generate(size, (col) => [row, col]);               // ← new
225:
226:  List<List<int>> _colCells(int col) =>                       // ← new
227:      List.generate(size, (row) => [row, col]);               // ← new
228:
229:  List<List<int>> _boxCells(int boxRow, int boxCol) {          // ← new
230:    final cells = <List<int>>[];                              // ← new
231:    for (int r = boxRow; r < boxRow + boxSize; r++) {           // ← new
232:      for (int c = boxCol; c < boxCol + boxSize; c++) {          // ← new
233:        cells.add([r, c]);                                       // ← new
234:      }                                                         // ← new
235:    }                                                          // ← new
236:    return cells;                                              // ← new
237:  }                                                           // ← new
238:
239:  List<int>? _hiddenSingleIn(List<List<int>> cells) {          // ← new
240:    for (int digit = 1; digit <= 9; digit++) {                  // ← new
241:      final cellsWithDigit = <List<int>>[];                     // ← new
242:      for (var cell in cells) {                                  // ← new
243:        if (_grid[cell[0]][cell[1]] == null &&                    // ← new
244:            candidatesFor(cell[0], cell[1]).contains(digit)) {     // ← new
245:          cellsWithDigit.add(cell);                                // ← new
246:        }                                                         // ← new
247:      }                                                          // ← new
248:      if (cellsWithDigit.length == 1) {                          // ← new
249:        final cell = cellsWithDigit[0];                          // ← new
250:        return [cell[0], cell[1], digit];                        // ← new
251:      }                                                         // ← new
252:    }                                                          // ← new
253:    return null;                                               // ← new
254:  }                                                           // ← new
```

### Introduce the concept in isolation

Whether this genuinely finds a real hidden single on a real puzzle where
naked singles alone aren't enough is proven directly in Concept Unit 4's
own real classification results (a real puzzle classified `Medium`
specifically *because* `findHiddenSingle` succeeded where naked singles
alone had already stalled) — shown there rather than repeated here, since
this unit's own code is exercised as part of that same real run.

### Discarding this example

Nothing to discard — every member added this unit is a genuine,
permanent part of `project/`.

### Mechanical walkthrough

- **`_rowCells(row)`, `_colCells(col)`, `_boxCells(boxRow, boxCol)`** —
  three small helper methods, each returning a **unit** (this lesson's
  term) as a `List` of `[row, col]` pairs — `_rowCells`/`_colCells` using
  `List.generate` (Lesson 17's own real construction, reappearing) to
  build 9 pairs varying one index while holding the other fixed;
  `_boxCells` using Lesson 18's own real box-scan nested loops
  (reappearing) to collect exactly the 9 cells of one 3x3 box.
- **`findHiddenSingle()`** — calls `_hiddenSingleIn` once per row (9
  calls), then once per column (9 more), then once per box (9 more, via
  nested loops stepping by `boxSize`) — checking every one of the
  board's 27 total units, stopping at the very first one that yields a
  result.
- **`_hiddenSingleIn(cells)`** — for each digit `1` through `9` in turn:
  `cellsWithDigit` collects every still-empty cell, *within this one
  unit only*, whose own real candidates (Lesson 18) include this digit;
  if exactly one such cell exists, that digit is a **hidden single**
  (this lesson's term) for that cell — even though `candidatesFor` for
  that cell might list several other digits too, which is exactly why
  this couldn't be found by looking at that cell alone.
- **`_grid[cell[0]][cell[1]] == null && candidatesFor(cell[0], cell[1]).contains(digit)`**
  — Lesson 6's logical AND (reappearing), short-circuiting (Lesson 6's
  term, reappearing): an already-filled cell is skipped before its
  candidates are even computed, since a filled cell has none.

### CS lens

Checking every value's own possible positions within a group, rather than
every position's own possible values, is the same underlying **constraint
propagation** idea the previous unit named, applied from the opposite
direction — exactly the kind of dual view (by cell, versus by value) that
recurs throughout constraint satisfaction generally.

```
Also recognized in: a scheduling problem checked both "which time
slots does this person have free" and "which people are free at this
time slot" — the same constraint, viewed from two directions; a
seating chart checked by "which seats can this guest use" and
separately "which guests can use this seat"
```

### SE lens

`findHiddenSingle`'s real cost is genuinely higher than `findNakedSingle`
— it recomputes `candidatesFor` for every cell in a unit, for every
digit, for every one of 27 units, in the worst case, rather than reading
one already-computed list — exactly why `classifyDifficulty` (Concept
Unit 4) only reaches for it once naked singles alone have already
stalled, never as the first thing tried.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Not run standalone; full output in Concept Unit 4's own "Run it" step.

### Connecting this unit

This unit found values forced by an entire unit's own shape. The next
unit applies both techniques repeatedly, together, until neither finds
anything further.

---

## Concept Unit: Repeating Both Techniques Until Nothing Changes

### The Problem

A single naked single or hidden single rarely finishes a whole puzzle by
itself — placing one digit narrows other cells' own candidates, which
can reveal a *new* naked or hidden single that wasn't there before. How
does a puzzle actually get solved this way, without ever guessing?

> **Stop and think before reading on:** If placing one forced digit can
> reveal a new one elsewhere, what should a solver do immediately after
> successfully placing a naked or hidden single — stop, or check again
> from the start?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new,
  private method combining the previous two units' own real methods.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new private method.
- **Change type:** Add (new method).
- **Location:** Directly after `_hiddenSingleIn`.
- **Dependencies:** `findNakedSingle`, `findHiddenSingle` (both this
  lesson's own previous units).

### The New Code

```dart
int _applyLogicalTechniques() {
  var filled = 0;
  while (true) {
    final naked = findNakedSingle();
    if (naked != null) {
      _grid[naked[0]][naked[1]] = naked[2];
      filled++;
      continue;
    }
    final hidden = findHiddenSingle();
    if (hidden != null) {
      _grid[hidden[0]][hidden[1]] = hidden[2];
      filled++;
      continue;
    }
    return filled;
  }
}
```

### The Updated Project

```dart
255:  int _applyLogicalTechniques() {              // ← new
256:    var filled = 0;                            // ← new
257:    while (true) {                              // ← new
258:      final naked = findNakedSingle();           // ← new
259:      if (naked != null) {                        // ← new
260:        _grid[naked[0]][naked[1]] = naked[2];       // ← new
261:        filled++;                                   // ← new
262:        continue;                                   // ← new
263:      }                                            // ← new
264:      final hidden = findHiddenSingle();            // ← new
265:      if (hidden != null) {                          // ← new
266:        _grid[hidden[0]][hidden[1]] = hidden[2];      // ← new
267:        filled++;                                     // ← new
268:        continue;                                     // ← new
269:      }                                              // ← new
270:      return filled;                                  // ← new
271:    }                                                // ← new
272:  }                                                 // ← new
```

### Introduce the concept in isolation

This method's own real correctness is proven directly through
`classifyDifficulty`'s own real results in the next unit, where this
exact loop is what determines whether a puzzle is `Medium` (finishes
using it) or `Hard` (doesn't).

### Discarding this example

Nothing to discard — a genuine, permanent addition to `project/`.

### Mechanical walkthrough

- **`while (true)`** — Lesson 7's `while` loop (reappearing), here
  deliberately given a condition that's always `true` — the loop itself
  never decides to stop; only a `return` inside it does.
- **`findNakedSingle()`, `if (naked != null)`** — this lesson's own
  Concept Unit 1 method, checked first every single pass, since it's the
  cheaper of the two techniques (this lesson's own previous unit's SE
  lens).
- **`_grid[naked[0]][naked[1]] = naked[2];`** — Lesson 9's index
  operator, applied twice (reappearing), placing the forced digit
  directly.
- **`continue;`** — a new keyword: immediately jumps back to the top of
  the enclosing loop, skipping everything below it in this one pass —
  used here so that after successfully placing a naked single, the
  method re-checks for naked singles *again* from scratch (since placing
  one may have just created another) before ever trying the more
  expensive hidden-single check.
- **`findHiddenSingle()`, same placement pattern** — reached only once
  `findNakedSingle` has found nothing at all; the same `continue`
  pattern applies.
- **`return filled;`** — reached only once *neither* technique finds
  anything — either the board is now complete, or it genuinely needs
  something beyond both.

### CS lens

Repeating two techniques, always trying the cheaper one first and
restarting from scratch after any successful placement, is a **fixed-
point iteration**: applying a transformation repeatedly until applying it
again changes nothing further — the board reaches a state neither
technique can push past, whatever that state turns out to be.

```
Also recognized in: a spreadsheet recalculating repeatedly until no
cell's value changes anymore; a compiler's own constant-folding pass,
repeated until no further simplification is possible; water finding
its own level, settling once no further flow would change anything
```

### SE lens

Always retrying the cheaper naked-single check first, rather than
alternating strictly between the two, is a deliberate ordering decision:
most of the time, placing one forced digit creates *more* naked singles
before it creates any hidden ones, so checking the cheap technique first,
every single time, avoids unnecessary hidden-single searches whenever the
cheap one alone would have found the next step anyway.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone; full output in the next unit's own "Run it" step.

### Connecting this unit

This unit combined both techniques into one repeatable process. The
final unit uses it to build a real, honest difficulty classifier and
tests it against three real, distinct difficulty levels.

---

## Concept Unit: Judging a Puzzle by What It Actually Requires

### The Problem

Curriculum's own explicit warning is this lesson's real destination: a
puzzle's difficulty should never be judged by how many cells are empty.
This project now has three real techniques of increasing power — naked
singles alone, naked-plus-hidden singles, and (implicitly) Lesson 19's
own full backtracking guessing for anything neither logical technique
resolves. How should a puzzle actually be classified?

> **Stop and think before reading on:** If a puzzle can be completely
> solved using naked singles alone, what would you want to call it? If
> it needs hidden singles too, but never guessing? And if, after both are
> exhausted, cells are still empty?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new
  method, tying together `findNakedSingle` and `_applyLogicalTechniques`.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new public method, completing this lesson's additions.
- **Change type:** Add (new method).
- **Location:** Directly after `_applyLogicalTechniques`.
- **Dependencies:** `findNakedSingle`, `_applyLogicalTechniques` (both
  this lesson's own previous units), the `SudokuBoard` constructor
  (Lesson 11), `isComplete` (Lesson 17).

### The New Code

```dart
String classifyDifficulty() {
  final nakedOnlyCopy =
      SudokuBoard(List.generate(size, (row) => List.of(_grid[row])));
  while (true) {
    final naked = nakedOnlyCopy.findNakedSingle();
    if (naked == null) break;
    nakedOnlyCopy._grid[naked[0]][naked[1]] = naked[2];
  }
  if (nakedOnlyCopy.isComplete) {
    return 'Easy';
  }

  final logicalCopy =
      SudokuBoard(List.generate(size, (row) => List.of(_grid[row])));
  logicalCopy._applyLogicalTechniques();
  if (logicalCopy.isComplete) {
    return 'Medium';
  }

  return 'Hard';
}
```

### The Updated Project

```dart
273:  String classifyDifficulty() {                                 // ← new
274:    final nakedOnlyCopy =                                       // ← new
275:        SudokuBoard(List.generate(size, (row) => List.of(_grid[row])));  // ← new
276:    while (true) {                                               // ← new
277:      final naked = nakedOnlyCopy.findNakedSingle();               // ← new
278:      if (naked == null) break;                                    // ← new
279:      nakedOnlyCopy._grid[naked[0]][naked[1]] = naked[2];           // ← new
280:    }                                                            // ← new
281:    if (nakedOnlyCopy.isComplete) {                               // ← new
282:      return 'Easy';                                              // ← new
283:    }                                                             // ← new
284:
285:    final logicalCopy =                                          // ← new
286:        SudokuBoard(List.generate(size, (row) => List.of(_grid[row])));  // ← new
287:    logicalCopy._applyLogicalTechniques();                        // ← new
288:    if (logicalCopy.isComplete) {                                  // ← new
289:      return 'Medium';                                            // ← new
290:    }                                                             // ← new
291:
292:    return 'Hard';                                                // ← new
293:  }                                                              // ← new
```

### Introduce the concept in isolation

Whether this genuinely tells three real difficulty levels apart is
worth real, contrasted proof across real puzzles — run for real:

```
first naked single on the real milestone puzzle: [4, 4, 5]
candidates at that cell: [5]
milestone puzzle classified as: Easy
40 empty cells, 23 unique puzzles found: [Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Medium, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Medium]
46 empty cells, 7 unique puzzles found: [Easy, Medium, Easy, Easy, Easy, Easy, Easy]
48 empty cells, 3 unique puzzles found: [Easy, Medium, Easy]
50 empty cells, 0 unique puzzles found: []
52 empty cells, 0 unique puzzles found: []
```

The real, published milestone puzzle classifies `Easy`. Real generated
puzzles at `40`-`48` empty cells (checked for uniqueness first, via
Lesson 20's own `hasUniqueSolution`) mostly classify `Easy`, with a real
minority classifying `Medium` — genuine puzzles where naked singles alone
stall but hidden singles finish the job. At `50`+ empty cells, no unique
puzzle turned up at all in 60 real attempts each — direct evidence random
removal becomes unreliable well before removing anywhere near all 81
cells.

No `Hard` puzzle appeared in that sweep — worth searching further rather
than assuming none exists. A broader, real search did find one:

```
unique: true
difficulty: Hard
. 7 3 | . 1 . | 6 . .
6 4 . | 7 3 . | . . 5
. . 9 | 6 2 . | . . 4
------+-------+------
4 . . | 3 . . | 2 . .
. . 8 | . . . | . . 3
. 3 . | . 4 1 | . . .
------+-------+------
7 . 4 | . . 3 | . . 1
. . . | . . 7 | 4 . 2
. 8 . | 2 9 . | 3 . 7
```

A real, unique, 48-empty-cell puzzle where `_applyLogicalTechniques`
genuinely stalls before completion — correctly classified `Hard`.

### Discarding this example

Nothing to discard — `classifyDifficulty` is a genuine, permanent
addition to `project/`; the three specific puzzles tested are disposable
verification artifacts, not part of `project/` itself.

### Mechanical walkthrough

- **`SudokuBoard(List.generate(size, (row) => List.of(_grid[row])))`** —
  the same real copy-construction pattern `removeDigits`/
  `hasUniqueSolution` (Lesson 20) already used, here made *twice*,
  independently, so neither the naked-singles-only test nor the full
  logical-techniques test ever mutates the real board or each other.
- **The `while (true)` / `findNakedSingle` / `break` loop** — deliberately
  *not* calling `_applyLogicalTechniques` (which would also try hidden
  singles) — this first copy tests, specifically, whether naked singles
  *alone* are enough, which is exactly why it's a separate, narrower
  loop rather than reusing the combined method.
- **`nakedOnlyCopy.isComplete`** — Lesson 17's own real getter
  (reappearing), checked after the naked-singles-only loop stalls;
  `true` here means naked singles alone genuinely finished the entire
  board.
- **`logicalCopy._applyLogicalTechniques();`** — this lesson's own
  Concept Unit 3 method, called on the *second* fresh copy — reached
  only when the first copy's naked-singles-only attempt didn't finish.
- **`logicalCopy.isComplete`** — the same real getter, now checked after
  both techniques were tried repeatedly; `true` means hidden singles
  closed the gap naked singles alone couldn't.
- **`return 'Hard';`** — reached only when neither copy ever completed:
  real, direct proof that this specific puzzle needs something beyond
  both logical techniques — in Lesson 19's own vocabulary, real guessing
  and potential backtracking.

### CS lens

Classifying a problem instance by *which* algorithm or technique
actually solves it, rather than by a superficial measure of its size (the
number of empty cells), is a real, recurring idea in algorithm analysis:
the same-sized input can have wildly different real difficulty depending
on its actual structure, not just how much of it is "given."

```
Also recognized in: a graph's own difficulty for a shortest-path
algorithm depending on its structure, not just its number of nodes;
a math problem's real difficulty depending on which theorem or
technique actually applies, not how long the problem statement is;
a chess position's real difficulty for a human depending on its
tactical structure, not merely how many pieces remain on the board
```

### SE lens

This three-tier classifier is a deliberate simplification: `'Hard'`
really means "needs more than naked-plus-hidden singles," lumping
together every more advanced technique real Sudoku solvers use (naked
pairs, pointing pairs, X-wing, and more) together with genuine
backtracking guessing, rather than distinguishing between them. That's
an honest, bounded scope for this lesson — curriculum's own explicit
ask was avoiding the "difficulty equals empty-cell-count" mistake, not
building a complete taxonomy of every known Sudoku technique — and this
lesson's own real, contrasted proof (a real `Easy`, a real `Medium`, and
a real `Hard` puzzle, each genuinely earning its label) delivers exactly
that, honestly, without overclaiming a finer-grained classification this
project doesn't actually implement.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.
- **`dart analyze <file>`** — reappearing from Lesson 5, restated in
  full: statically checks a file for compile-time errors without running
  it.

### Run it

Real, verified, complete output for this lesson's entire demonstration
(both files):

```
first naked single on the real milestone puzzle: [4, 4, 5]
candidates at that cell: [5]
milestone puzzle classified as: Easy
40 empty cells, 23 unique puzzles found: [Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Medium, Easy, Easy, Easy, Easy, Easy, Easy, Easy, Medium]
46 empty cells, 7 unique puzzles found: [Easy, Medium, Easy, Easy, Easy, Easy, Easy]
48 empty cells, 3 unique puzzles found: [Easy, Medium, Easy]
50 empty cells, 0 unique puzzles found: []
52 empty cells, 0 unique puzzles found: []
```

```
unique: true
difficulty: Hard
```

And, confirming no static errors were introduced:

```
Analyzing ....
No issues found!
```

All real, saved in full in
`src/docs/flutter/verification/lesson-21/run-log.md`.

### Connecting this unit

This unit closed this lesson on curriculum's own explicit warning,
answered honestly: three real puzzles, each genuinely earning its own
real label, not by counting empty cells, but by exactly which technique
actually finishes each one.

---

## Connect the Pieces

Trace three real puzzles through everything this lesson built. The real,
published milestone puzzle's cell `(4, 4)` was a real naked single —
`candidatesFor` already narrowed it to exactly `[5]` — and Concept Unit
4 confirmed the *entire* puzzle falls to naked singles alone: `Easy`. A
real generated puzzle, at `46` empty cells, stalled under naked singles
alone but finished once `findHiddenSingle` — checking every row, column,
and box as its own unit — found a digit hidden in plain sight, forced
into exactly one cell of some unit even though that cell's own candidate
list showed more than one option: `Medium`. And a third real, genuinely
harder puzzle — found only after a broader, honestly-reported search,
not assumed to exist — stalled even after `_applyLogicalTechniques`
repeated both techniques until neither found anything further: `Hard`,
the label this project reserves for whatever Lesson 19's own real
backtracking would still need to finish.

`project/lib/sudoku_board.dart` can now judge a puzzle's real difficulty
by what it actually takes to solve, not by a superficial cell count —
exactly curriculum's own explicit warning, answered with real, contrasted
evidence across three genuine difficulty levels. Lesson 22 turns to
making this project's own randomness — already used narrowly here and in
Lesson 20 — fully reproducible on purpose, the real foundation Lesson 24's
own algorithm tests will need.
