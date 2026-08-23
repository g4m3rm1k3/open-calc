# Lesson 20: Turning a Solver Into a Generator

**What you will build:** Four genuinely new real methods on
`project/lib/sudoku_board.dart`'s `SudokuBoard` — `generateComplete`,
building a brand-new, randomly-filled, fully solved board; `removeDigits`,
carving a playable puzzle out of one; and `hasUniqueSolution`, backed by a
new private `_countSolutionsUpTo`, checking that a puzzle has exactly one
real solution rather than zero or several. Every claim is checked for
real, including one that started this lesson: whether Lesson 19's own
backtracking `solve()`, called on a completely empty board, is fast at
all, or repeats Lesson 19's own 120-second false start.

**What you need to know first:** Lesson 19's `solve()` and Lesson 18's
`candidatesFor` — this lesson's own `generateComplete` and
`_countSolutionsUpTo` are both built directly on them. Lesson 17's
`List<List<int?>>` board representation. Lesson 9's `List`.

**Terms used in this lesson:**

- **Declaration** — reappearing from Lesson 5, restated in full: the
  statement introducing a variable for the first time.
- **List literal (`[element, element, ...]`)** — reappearing from Lesson
  7, restated in full: a fixed sequence of values written directly into
  source code between square brackets.
- **Generic type parameter (`<E>`)** — reappearing from Lesson 9 (full
  treatment: Lesson 10), restated in full: a type fixing what specific
  type a general-purpose class holds this time.
- **Index operator (`[index]`)** — reappearing from Lesson 9, restated in
  full: reading or writing a `List` value by its numeric position.
- **Compound assignment operator (`+=`)** — reappearing from Lesson 7,
  restated in full: a combined operator and assignment in one.
- **Optional named parameter** — reappearing from Lesson 8, restated in
  full: a parameter inside `{ }` that a caller may omit, taking on
  `null` (for a nullable type) or a declared default otherwise.
- **Private member (`_name`)** — reappearing from Lesson 11, restated in
  full: a field or method whose name starts with an underscore, hidden
  from code outside the same file (library), though — Lesson 11's own
  real proof — not from other code in that same file.
- **`static`** — a keyword marking a member (a field or method) as
  belonging to the *class itself*, not to any one specific object built
  from it — reached as `ClassName.memberName` rather than
  `someObject.memberName`. `SudokuBoard`'s own `size` and `boxSize`
  fields have been `static` since Lesson 17, without this word ever being
  explained; this lesson's own `generateComplete` is the first `static`
  *method* this project adds, which is exactly why the word finally gets
  its own real treatment here. It exists for exactly this lesson's own
  case: building a brand-new `SudokuBoard` isn't something any *existing*
  board object can do for you — there's no object to call it on yet —
  so it belongs to the class itself instead.
- **Seed** — a starting value handed to a random number generator that
  fully determines every "random" value it will ever produce afterward —
  the same seed, used twice, produces the exact same sequence every
  time. This lesson uses this narrowly, only enough to prove
  `generateComplete` can be made reproducible; seeds, and why
  reproducibility specifically matters for testing, get their full,
  formal treatment in Lesson 22 (Deterministic Puzzle Generation).

**Objects and methods used:**

- **`SudokuBoard`**
  - *What it is:* the same real class Lessons 17-19 worked with, in
    `project/lib/sudoku_board.dart`.
  - *Implementation:* real, current source, read fresh this session. This
    lesson adds `static SudokuBoard generateComplete(Random random)`,
    `List<List<int?>> removeDigits(Random random, int count)`, `bool
    hasUniqueSolution()`, and a new private `int
    _countSolutionsUpTo(int limit)`; it also widens `solve` itself to
    `bool solve({Random? random})`, an optional addition that changes
    nothing about how Lesson 19's own already-verified plain `solve()`
    calls behave (`random` defaults to `null`, meaning "no shuffling,"
    exactly the previous behavior).
  - *Its use:* this lesson's entire subject.
  - *Type:* a real, encapsulated class (Lesson 11's term, reappearing).
  - *Responsibility:* widened again — beyond owning one board's state and
    solving it, `SudokuBoard` can now also manufacture brand-new,
    playable puzzles from scratch.
  - *Depends on:* `candidatesFor` (Lesson 18) and `solve` (Lesson 19),
    both reused directly by this lesson's new members.
  - *Connects to:* `generateComplete` calls `solve` internally;
    `hasUniqueSolution` builds a fresh `SudokuBoard` copy and calls its
    own private `_countSolutionsUpTo`, never mutating the original board.
  - *Shape:* unchanged from Lesson 17 — the real, persisting boundary
    between a board's internal state and what other code may do with it,
    now including *creating* boards, not only acting on ones that already
    exist.
- **`Random`**
  - *What it is:* a real class from `dart:math`.
  - *Implementation:* `Random([int? seed])` — a constructor optionally
    taking a **seed** (this lesson's term); with no seed given, it
    produces a genuinely different sequence each run; with one given, the
    exact same sequence every time.
  - *Its use:* passed into `generateComplete`, `solve`, and `removeDigits`
    to control exactly how "random" choices are actually made.
  - *Type:* a class.
  - *Responsibility:* produce a sequence of pseudorandom values, either
    reproducibly (given a seed) or not (left to the system's own entropy).
  - *Depends on:* an optional seed at construction.
  - *Connects to:* handed to `List.shuffle` (below) and used inside
    `solve`'s own optional shuffling.
  - *Shape:* `dart:math`'s own standard-library surface, a new dependency
    for this project, imported for the first time this lesson.
- **`List`**
  - *What it is:* the same real, generic `dart:core` class Lesson 9
    introduced.
  - *Implementation:* two real members used fresh here: `void
    shuffle([Random? random])`, reordering a list's own elements
    randomly in place, and `Iterable<E> take(int count)` (a real member
    of the shared `Iterable` interface, Lesson 9), returning a lazy view
    of only the first `count` elements.
  - *Its use:* `solve`'s own shuffled candidate order calls `.shuffle`
    directly; `removeDigits` calls `.shuffle` on every board position,
    then `.take` to select only as many as requested.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 9, with these two members newly relevant.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: A Solver That Always Gives the Same Answer

### The Problem

Lesson 19's `solve()` fills in a partially-completed board — but
generating a *brand-new* puzzle needs a complete, valid board to start
from, built from nothing. Could `solve()`, called on a completely empty
board, produce that? And — a real, honest question after Lesson 19's own
120-second false start on a *different* nearly-empty board — would it
even finish quickly?

> **Stop and think before reading on:** `solve()` always tries the first
> empty cell's candidates in the exact same ascending order,
> `candidatesFor` already returns them in (Lesson 18). If nothing about a
> completely empty board's own candidates ever differs between two
> separate calls, what do you predict happens if `solve()` is called
> twice, separately, both starting from empty — the same board both
> times, or two different ones?

### Project Change

- **Reference Source:** No reference counterpart — this unit checks a
  real behavioral question about already-existing code (`solve`, Lesson
  19) rather than introducing new code of its own yet.
- **Files affected:** `src/docs/flutter/verification/lesson-20/empty_board_solve_check.dart`
  and `src/docs/flutter/verification/lesson-20/determinism_check.dart` —
  both created.
- **Change type:** N/A for `project/` — no project code changes in this
  unit; the next unit adds the real fix.
- **Location:** N/A.
- **Dependencies:** `solve()` (Lesson 19).

### The New Code

```dart
var emptyGrid = List.generate(9, (_) => List<int?>.filled(9, null));
var board = SudokuBoard(emptyGrid);
board.solve();
```

### The Updated Project

Not applicable — no project file changes in this unit.

### Introduce the concept in isolation

Whether an empty board solves quickly at all was worth checking first,
given Lesson 19's own real precedent:

```
solved: true
elapsed ms: 3
```

3 milliseconds — nothing like Lesson 19's own pathological case; an
empty board (with no conflicting givens anywhere to trip up the search)
turns out to be the easiest possible input for this algorithm. Then, the
real question this unit's Socratic prompt asked — run for real:

```
two separate solves from empty produced identical boards: true
```

Confirmed: `solve()`, called twice from empty, produces the exact same
complete board both times. `candidatesFor`'s own always-ascending order
(Lesson 18) means the very first candidate tried at every cell is always
the same, every single time — nothing in `solve()` itself ever varies.

### Discarding this example

Nothing here becomes part of `project/` — this unit's own two throwaway
checks exist purely to establish the problem the next unit actually
solves.

### Mechanical walkthrough

- **`List.generate(9, (_) => List<int?>.filled(9, null))`** — Lesson 17's
  own real construction, reappearing: a 9x9 grid with every cell `null`.
- **`SudokuBoard(emptyGrid)`** — Lesson 11's constructor (reappearing);
  since every value is `null`, `_isGiven` (Lesson 17) ends up entirely
  `false` — nothing is locked, every cell is open for `solve()` to fill.
- **`board.solve()`** — Lesson 19's own already-real method, called with
  no arguments at all, exactly as every one of Lesson 19's own real
  proofs already called it.

### CS lens

An algorithm that always produces the identical output for the identical
input is **deterministic** — a real, precise term, not just "not random":
every one of this curriculum's own real compiler errors since Lesson 5
has also been deterministic in exactly this sense (the same broken code
always produces the same real error), which is usually exactly what you
want — except here, where generating *varied* puzzles is the entire
point.

```
Also recognized in: any pure function (Lesson 8/15's own subject,
reappearing) — determinism by a different name; a hash function,
which must be deterministic to be useful at all; a calculator, which
would be useless if `2 + 2` sometimes produced something other than
`4`
```

### SE lens

Determinism is usually a *feature*, not a bug — it's exactly what let
Lesson 19's own real proof trust that `solve()` reached the *same* known
solution every time it was checked. The real, honest tension this unit
surfaces: the identical property that makes `solve()` trustworthy as a
*solver* makes it useless, unmodified, as a *generator* of varied
puzzles — a real, structural reason this project needs a genuinely
different entry point (the next unit's own `generateComplete`) rather
than reusing `solve()` completely as-is.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Real, verified output, both checks:

```
solved: true
elapsed ms: 3
```

```
two separate solves from empty produced identical boards: true
```

Real, saved in full in
`src/docs/flutter/verification/lesson-20/run-log.md`.

### Connecting this unit

This unit proved `solve()` alone can't generate varied puzzles. The next
unit fixes that, with a genuinely random search.

---

## Concept Unit: Building a Random, Complete Board

### The Problem

`solve()`'s own determinism (previous unit) comes entirely from
`candidatesFor`'s fixed, ascending order — every call tries `1` before
`2` before `3`, with nothing to make a different choice ever look
equally good. What would make two separate generations actually differ?

> **Stop and think before reading on:** If, instead of always trying
> candidates in ascending order, `solve()` tried them in a *randomly
> shuffled* order each time it reached a new cell, what do you predict
> would happen to two separate calls starting from the exact same empty
> board — and would the result still be guaranteed to be a genuinely
> valid, complete Sudoku board?

### Project Change

- **Reference Source:** No reference counterpart — this is a genuinely
  new capability, built by widening Lesson 19's own already-real `solve`
  rather than replacing it.
- **Files affected:** `project/lib/sudoku_board.dart` — modified: `solve`
  gains an optional parameter; a new static method, `generateComplete`,
  is added.
- **Change type:** Refactor (`solve`'s own signature, backward-
  compatible); add (`generateComplete`).
- **Location:** `solve` itself, and a new method directly after it.
- **Dependencies:** `candidatesFor` (Lesson 18), `solve` (Lesson 19),
  `dart:math`'s `Random` (this lesson's header) — this project's first
  import beyond its own files.

### The New Code

```dart
bool solve({Random? random}) {
  for (int row = 0; row < size; row++) {
    for (int col = 0; col < size; col++) {
      if (_grid[row][col] == null) {
        final digits = candidatesFor(row, col);
        if (random != null) {
          digits.shuffle(random);
        }
        for (var digit in digits) {
          _grid[row][col] = digit;
          if (solve(random: random)) {
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

static SudokuBoard generateComplete(Random random) {
  final emptyGrid = List.generate(size, (_) => List<int?>.filled(size, null));
  final board = SudokuBoard(emptyGrid);
  board.solve(random: random);
  return board;
}
```

### The Updated Project

```dart
124:  bool solve({Random? random}) {                              // ← changed
125:    for (int row = 0; row < size; row++) {
126:      for (int col = 0; col < size; col++) {
127:        if (_grid[row][col] == null) {
128:          final digits = candidatesFor(row, col);              // ← new
129:          if (random != null) {                                // ← new
130:            digits.shuffle(random);                            // ← new
131:          }                                                    // ← new
132:          for (var digit in digits) {                          // ← changed
133:            _grid[row][col] = digit;
134:            if (solve(random: random)) {                        // ← changed
135:              return true;
136:            }
137:            _grid[row][col] = null;
138:          }
139:          return false;
140:        }
141:      }
142:    }
143:    return true;
144:  }
145:
146:  static SudokuBoard generateComplete(Random random) {          // ← new
147:    final emptyGrid =                                          // ← new
148:        List.generate(size, (_) => List<int?>.filled(size, null));  // ← new
149:    final board = SudokuBoard(emptyGrid);                       // ← new
150:    board.solve(random: random);                                // ← new
151:    return board;                                               // ← new
152:  }                                                             // ← new
```

`solve()` still behaves exactly as every one of Lesson 19's own real
proofs verified it — `random` defaults to `null`, and the `if (random !=
null)` guard means no shuffling happens at all unless a caller
deliberately opts in.

### Introduce the concept in isolation

Whether two different seeds genuinely produce two different real boards
— and whether the *same* seed reproduces the *same* board, a real,
load-bearing guarantee for testing — is worth real proof, batched with
this lesson's remaining units:

```
two random complete boards identical: false
same seed reproduces the same board: true
```

`SudokuBoard.generateComplete(Random(1))` and `.generateComplete(Random(2))`
produced two genuinely different real, complete, valid boards. Calling
`generateComplete(Random(1))` a second time reproduced the *identical*
board to the first call — real, verified proof that a **seed** (this
lesson's term) genuinely determines the entire outcome, not just
influences it.

### Discarding this example

Nothing to discard — `solve`'s own widened signature and
`generateComplete` are both genuine, permanent additions to `project/`.

### Mechanical walkthrough

- **`bool solve({Random? random})`** — Lesson 8's optional named
  parameter (reappearing), here `Random?` (this lesson's header,
  combined with Lesson 5's nullable-type `?`) — `null` by default,
  preserving Lesson 19's own exact previous behavior for any caller that
  doesn't pass one.
- **`final digits = candidatesFor(row, col);`** — the same already-real
  method call (Lesson 18) as before, now stored in a variable rather than
  walked directly, specifically so it can be shuffled first.
- **`if (random != null) { digits.shuffle(random); }`** — Lesson 6's `if`
  and inequality operator (both reappearing); `List`'s own real `void
  shuffle([Random? random])` (this lesson's header), reordering
  `digits`'s own elements in place, using `random`'s own pseudorandom
  sequence.
- **`for (var digit in digits)`** — Lesson 7's `for-in` loop
  (reappearing), now walking a possibly-shuffled list instead of always
  the same ascending one.
- **`solve(random: random)`** — the recursive call (Lesson 19's own
  term), now passing `random` along so every recursive level shuffles
  consistently using the *same* underlying `Random` sequence, not a fresh
  one each time.
- **`static SudokuBoard generateComplete(Random random)`** — `static`
  (this lesson's term): a method belonging to `SudokuBoard` the class
  itself, called as `SudokuBoard.generateComplete(...)`, not on any
  already-existing board object — appropriate here specifically because
  there is no existing board yet to call it on.
- **`List.generate(size, (_) => List<int?>.filled(size, null))`** —
  Lesson 17's own real construction, reappearing, building a fresh empty
  grid.
- **`board.solve(random: random)`** — the same widened `solve`, called
  here with a real `random`, guaranteeing this specific call actually
  shuffles.
- **`return board;`** — Lesson 8's `return` (reappearing), handing back
  the now-complete board.

### CS lens

Introducing controlled randomness into an otherwise-deterministic search,
specifically to produce *varied* valid outputs instead of always the
same one, is a real, common technique wherever an algorithm's own
correctness doesn't depend on *which* valid answer it finds, only that it
finds *a* valid one.

```
Also recognized in: shuffling a deck of cards before a game (many
valid orderings, no reason to prefer one); randomized algorithms in
computer science generally, where randomness improves average-case
behavior or, as here, output variety, without threatening correctness;
a maze generator using randomized backtracking, structurally almost
identical to this lesson's own approach
```

### SE lens

Shuffling candidate order changes *which* valid solution `solve()` finds
first, never *whether* the result is valid — every digit tried still
passes through the exact same `candidatesFor`/`_isSafe` (Lessons 18-19)
real checks, so correctness is never at risk, only variety. The real cost
of this specific approach: `generateComplete` still has to run a full
backtracking search, same as `solve()` — proven fast here (an empty board
is the easy case, Concept Unit 1), but this project has no guarantee yet
that shuffling candidates couldn't occasionally hit a slow path the way
Lesson 19's own nearly-empty-with-conflicting-givens case did; Lesson 23
(Performance) is the place to actually measure that, not assume it here.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Real, verified output (batched with this lesson's remaining units):

```
two random complete boards identical: false
same seed reproduces the same board: true
```

Real, saved in full in
`src/docs/flutter/verification/lesson-20/run-log.md`.

### Connecting this unit

This unit turned a deterministic solver into a real, varied generator.
The next unit turns one complete board into an actual, playable puzzle.

---

## Concept Unit: Carving a Puzzle Out of a Complete Board

### The Problem

A complete, fully-filled board (previous unit) isn't a puzzle at all —
there's nothing left for a player to do. A real Sudoku puzzle needs most
of its cells emptied, leaving only enough given clues for a player to
work from.

> **Stop and think before reading on:** If you needed to empty a specific
> number of cells at *random* positions across the whole board, rather
> than, say, always the same fixed pattern, what would you need — beyond
> `Random` itself — to make sure you don't accidentally pick the exact
> same position twice, wasting one of the removals?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new
  method.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new public method.
- **Change type:** Add (new method).
- **Location:** Directly after `generateComplete`.
- **Dependencies:** `_grid` (Lesson 17), `Random` (this lesson's header).

### The New Code

```dart
List<List<int?>> removeDigits(Random random, int count) {
  final grid = List.generate(size, (row) => List.of(_grid[row]));
  final positions = <List<int>>[];
  for (int row = 0; row < size; row++) {
    for (int col = 0; col < size; col++) {
      positions.add([row, col]);
    }
  }
  positions.shuffle(random);
  for (var position in positions.take(count)) {
    grid[position[0]][position[1]] = null;
  }
  return grid;
}
```

### The Updated Project

```dart
153:  List<List<int?>> removeDigits(Random random, int count) {   // ← new
154:    final grid = List.generate(size, (row) => List.of(_grid[row]));  // ← new
155:    final positions = <List<int>>[];                          // ← new
156:    for (int row = 0; row < size; row++) {                     // ← new
157:      for (int col = 0; col < size; col++) {                   // ← new
158:        positions.add([row, col]);                              // ← new
159:      }                                                        // ← new
160:    }                                                          // ← new
161:    positions.shuffle(random);                                  // ← new
162:    for (var position in positions.take(count)) {               // ← new
163:      grid[position[0]][position[1]] = null;                    // ← new
164:    }                                                           // ← new
165:    return grid;                                                // ← new
166:  }                                                             // ← new
```

### Introduce the concept in isolation

Whether this genuinely empties exactly the requested number of real
cells is worth real proof — batched with this lesson's other units:

```
cells emptied by removeDigits: 40
```

Requesting `40` removed cells and counting exactly `40` real `null`
cells afterward confirms `removeDigits` empties precisely as many
positions as asked, no more and no fewer.

### Discarding this example

Nothing to discard — `removeDigits` is a genuine, permanent addition to
`project/`.

### Mechanical walkthrough

- **`List.generate(size, (row) => List.of(_grid[row]));`** — builds a
  fresh, independent copy of this board's current grid (Lesson 17's own
  `List.of`, reappearing) — critically a *copy*, not a reference to
  `_grid` itself, so this method never mutates the board it's called on.
- **`final positions = <List<int>>[];`** — a declaration (Lesson 5's
  term, reappearing) of an empty list literal (Lesson 7's term,
  reappearing) with an explicit generic type parameter (Lesson 9's term,
  reappearing): a list of `[row, col]` pairs, each itself a small
  `List<int>`.
- **The nested `for` loops, `positions.add([row, col]);`** — Lesson 7's
  nested loops (reappearing), building one `[row, col]` entry (a list
  literal, Lesson 7's term) for every one of the board's 81 real
  positions.
- **`positions.shuffle(random);`** — the same real `List.shuffle` (this
  lesson's header) as `solve`'s own new shuffling, here randomizing the
  *order* every position will be considered in — this, not a separate
  "avoid picking the same position twice" check, is exactly what answers
  this unit's own Socratic question: shuffling the full, complete list of
  positions once means the first `count` of them, taken in order, can
  never repeat, because each position appears in that list exactly once
  to begin with.
- **`positions.take(count)`** — `Iterable`'s own real `Iterable<E>
  take(int count)` (this lesson's header), producing a lazy view (Lesson
  9's own real, run-proved laziness) of only the first `count` shuffled
  positions.
- **`grid[position[0]][position[1]] = null;`** — Lesson 9's index
  operator (reappearing), read twice (`position[0]` for the row,
  `position[1]` for the column) then used to index into `grid` itself;
  assignment (Lesson 5's term, reappearing) sets that one cell to `null`.
- **`return grid;`** — Lesson 8's `return` (reappearing), handing back a
  brand-new starting grid — not a `SudokuBoard` itself, since a caller
  will decide separately whether to actually build one from it (the
  next unit's own `hasUniqueSolution` needs to check it first).

### CS lens

Shuffling a complete list of every possible position once, then taking a
fixed number from the front, is a specific, correct way to sample without
repetition — choosing `count` genuinely distinct items from a fixed
population at random, with no position ever selectable twice.

```
Also recognized in: dealing cards from a shuffled deck (each card
dealt exactly once); a raffle drawing tickets from a shuffled,
already-complete pool rather than repeatedly drawing and checking for
duplicates; random sampling in statistics, choosing a subset without
replacement
```

### SE lens

An alternative, more naive approach — repeatedly picking a *random* row
and column directly, checking whether that specific cell is already
empty, and trying again if it is — would also work, at a real cost:
as more cells become empty, the chance of randomly re-picking an
already-empty one grows, making that approach slower the more digits are
removed. Shuffling the complete position list once, up front, avoids that
entirely — the cost is fixed (build and shuffle 81 entries) regardless of
how many are actually removed afterward.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified output (batched):

```
cells emptied by removeDigits: 40
```

Real, saved in full in
`src/docs/flutter/verification/lesson-20/run-log.md`.

### Connecting this unit

This unit carved a playable puzzle out of a complete board. The final
unit checks the one thing carving alone can never guarantee: that the
result is still a *legitimate* Sudoku puzzle.

---

## Concept Unit: Making Sure Exactly One Answer Exists

### The Problem

`removeDigits` (previous unit) empties cells with no regard at all for
whether the result still makes sense as a puzzle. A real Sudoku puzzle
must have *exactly* one solution — not zero (an over-eager removal could
make it unsolvable) and not more than one (too many related cells removed
at once can leave more than one way to fill them in, both equally valid).
Lesson 19's own `solve()` only ever finds the *first* solution it
encounters — it says nothing at all about whether a *second, different*
one might also exist.

> **Stop and think before reading on:** If you already had a way to find
> one solution, and needed to know whether a *second, different* one
> also exists, would you need to search the *entire* remaining space to
> be sure, or is there a way to stop looking the instant you're already
> certain there's more than one?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new
  method, and a new private helper.
- **Files affected:** `project/lib/sudoku_board.dart` — modified, adding
  a new public method and a new private method.
- **Change type:** Add (new members).
- **Location:** Directly after `removeDigits`.
- **Dependencies:** `candidatesFor` (Lesson 18), the `SudokuBoard`
  constructor (Lesson 11).

### The New Code

```dart
bool hasUniqueSolution() {
  final copy = SudokuBoard(List.generate(size, (row) => List.of(_grid[row])));
  return copy._countSolutionsUpTo(2) == 1;
}

int _countSolutionsUpTo(int limit) {
  for (int row = 0; row < size; row++) {
    for (int col = 0; col < size; col++) {
      if (_grid[row][col] == null) {
        var total = 0;
        for (var digit in candidatesFor(row, col)) {
          _grid[row][col] = digit;
          total += _countSolutionsUpTo(limit - total);
          _grid[row][col] = null;
          if (total >= limit) {
            return total;
          }
        }
        return total;
      }
    }
  }
  return 1;
}
```

### The Updated Project

```dart
167:  bool hasUniqueSolution() {                                    // ← new
168:    final copy =                                               // ← new
169:        SudokuBoard(List.generate(size, (row) => List.of(_grid[row])));  // ← new
170:    return copy._countSolutionsUpTo(2) == 1;                    // ← new
171:  }                                                             // ← new
172:
173:  int _countSolutionsUpTo(int limit) {                          // ← new
174:    for (int row = 0; row < size; row++) {                       // ← new
175:      for (int col = 0; col < size; col++) {                     // ← new
176:        if (_grid[row][col] == null) {                            // ← new
177:          var total = 0;                                         // ← new
178:          for (var digit in candidatesFor(row, col)) {             // ← new
179:            _grid[row][col] = digit;                              // ← new
180:            total += _countSolutionsUpTo(limit - total);          // ← new
181:            _grid[row][col] = null;                               // ← new
182:            if (total >= limit) {                                 // ← new
183:              return total;                                       // ← new
184:            }                                                     // ← new
185:          }                                                      // ← new
186:          return total;                                          // ← new
187:        }                                                        // ← new
188:      }                                                          // ← new
189:    }                                                            // ← new
190:    return 1;                                                    // ← new
191:  }                                                              // ← new
```

### Introduce the concept in isolation

Whether this genuinely tells a real, legitimate puzzle apart from a
genuinely ambiguous one is worth real, contrasted proof — run for real:

```
real milestone puzzle has a unique solution: true
deliberately ambiguous puzzle has a unique solution: false
```

`hasUniqueSolution()`, called on the real, published Phase 1 milestone
puzzle, correctly reports `true`. A second board — built by emptying
every cell holding a `1` or a `2` in the known solution, since swapping
`1` and `2` everywhere is a valid symmetry of *any* completed Sudoku,
guaranteeing at least two real solutions — correctly reports `false`.
This is real, contrasted, positive-and-negative proof, not a single
one-sided check.

### Discarding this example

Nothing to discard — `hasUniqueSolution` and `_countSolutionsUpTo` are
both genuine, permanent additions to `project/`.

### Mechanical walkthrough

- **`bool hasUniqueSolution()`** — a method (Lesson 11's term,
  reappearing) with no parameters, returning `bool`.
- **`SudokuBoard(List.generate(size, (row) => List.of(_grid[row])))`** —
  the same constructor as `removeDigits`'s own copy, here building an
  entirely separate `SudokuBoard` object so the counting search below
  never mutates the real board `hasUniqueSolution` was called on.
- **`copy._countSolutionsUpTo(2)`** — a method call (Lesson 9's term,
  reappearing) on `_countSolutionsUpTo` — a *private* method (Lesson 11's
  term, reappearing), reachable here because this call happens inside the
  exact same class, `SudokuBoard`, that declares it; `2` is the real
  limit: "stop as soon as you know there are at least two."
- **`for (var digit in candidatesFor(row, col))`, `_grid[row][col] = digit; ... _grid[row][col] = null;`**
  — the same backtracking shape as `solve` (Lesson 19), reused here for
  *counting* instead of stopping at the first success.
- **`total += _countSolutionsUpTo(limit - total);`** — Lesson 6's
  compound assignment (Lesson 7's term, reappearing); the recursive call
  (Lesson 19's own term) is handed a *shrinking* limit — `limit - total`
  — so a branch already known to contribute, say, `1` solution only ever
  needs to confirm `1` more before this whole search can stop, never
  more than that.
- **`if (total >= limit) { return total; }`** — Lesson 6's relational
  operator (reappearing); the moment the running total reaches the
  limit, the search stops immediately, exactly answering this unit's own
  Socratic question: no need to explore the entire remaining space once
  "more than one" is already certain.
- **`return 1;`** (final line) — the base case: reached only when every
  cell is already filled — one more complete, valid solution has genuinely
  been found.

### CS lens

Counting how many solutions exist, rather than only finding one, while
still stopping early the instant the answer no longer matters, is a
direct, minimal extension of the exact backtracking search Lesson 19
already built — proof that the same underlying algorithm answers a
subtly different question just by changing what it does at its own base
case and how it combines results, rather than needing to be rewritten
from scratch.

```
Also recognized in: counting solutions to the N-Queens problem
(a well-known extension of the exact same search); a database query
using `LIMIT 2` to check "does more than one row match" without
scanning the whole table; a proof by counterexample, which only ever
needs to find a *second* case to disprove uniqueness, never every
case
```

### SE lens

Counting *every* solution before deciding uniqueness would work, at a
real, unnecessary cost: for a board with many solutions, a full count
could take far longer than simply confirming "more than one exists."
Capping at `2` is a real, deliberate optimization exploiting exactly
what `hasUniqueSolution` actually needs — this project doesn't care
*how* non-unique an ambiguous puzzle is, only whether it's unique at
all — the same kind of early-exit reasoning `_isSafe` (Lesson 18) already
used to stop at the first conflict found, applied here to stop at the
first *extra* solution found instead.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.
- **`dart analyze <file>`** — reappearing from Lesson 5, restated in
  full: statically checks a file for compile-time errors without running
  it.

### Run it

Real, verified, complete output for this lesson's entire generation demo:

```
two random complete boards identical: false
same seed reproduces the same board: true
cells emptied by removeDigits: 40
real milestone puzzle has a unique solution: true
deliberately ambiguous puzzle has a unique solution: false
```

And, confirming no static errors were introduced:

```
Analyzing ....
No issues found!
```

Both real, saved in full in
`src/docs/flutter/verification/lesson-20/run-log.md`.

### Connecting this unit

This unit closed the loop this whole lesson opened: a deterministic
solver became a random generator, a complete board became a carved
puzzle, and that puzzle is now provably a legitimate one — exactly one
real solution, neither zero nor several, both proven for real rather
than assumed.

---

## Connect the Pieces

Trace one new, generated puzzle through everything this lesson built.
Concept Unit 1 proved `solve()` alone, called on an empty board, always
produces the identical result — real, useful for a solver, useless for a
generator. Concept Unit 2's `generateComplete` fixed that by shuffling
candidate order with a real `Random`, real-proved to produce genuinely
different boards from different seeds, and the identical board from the
same seed reused twice. Concept Unit 3's `removeDigits` carved a real,
playable starting grid out of that complete board, real-proved to empty
exactly the requested number of cells, no more and no fewer. And Concept
Unit 4's `hasUniqueSolution`, built on a genuine extension of Lesson 19's
own backtracking search, real-proved — against both a real, legitimate
puzzle and a deliberately constructed ambiguous one — that it can tell
the two apart correctly, stopping its own search the instant more than
one solution is certain rather than wastefully counting every one.

`project/lib/sudoku_board.dart` can now do something genuinely new: not
just check or solve a board someone else built, but manufacture an
entirely fresh, real, legitimate puzzle from nothing, with real,
verified control over how varied and how reproducible that generation
actually is. Lesson 21 turns to a question this lesson's own uniqueness
check doesn't yet answer at all: whether a generated puzzle is actually
*easy* or *hard* for a person to solve.
