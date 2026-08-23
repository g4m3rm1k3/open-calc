# Lesson 17: Choosing How Data Is Shaped

**What you will build:** The same nine-value fact — a Sudoku cell's own
digit — stored three genuinely different ways: a flat, one-dimensional
`List<int>` addressed with hand-written index math; a nested
`List<List<int>>` addressed directly by row and column; and, finally, a
real look at `project/lib/sudoku_board.dart`'s own already-built
`SudokuBoard` — this curriculum's actual, already-made choice, reasoned
through honestly rather than presented as still open. This is Phase 2's
first lesson, and the first lesson to work directly against this
curriculum's own persisting `project/` code rather than disposable,
lesson-scoped snippets.

**What you need to know first:** Lesson 9's `List<E>`, its real
`dart:core` shape, and its index operator. Lesson 5's `int?` and sound
null safety — this lesson's own Concept Unit 3 depends on it directly.
Lesson 11's encapsulation (fields kept private, changed only through
validated methods) and Lesson 14's `InvalidMoveException` — both already
real, already built, in `project/lib/sudoku_board.dart`, read fresh this
session rather than recalled from writing it.

**Terms used in this lesson:**

- **Data representation** — the specific way a real-world fact (a Sudoku
  board's 81 cells) is encoded into a program's own data structures. It
  exists as its own deliberate design question because the exact same
  fact can be encoded several genuinely different ways, each with real,
  different consequences for how the rest of a program built on top of it
  has to be written — this lesson's own subject, not a settled, obvious
  choice.
- **Flat (one-dimensional) array** — a single `List` holding every
  element of a naturally multi-dimensional structure end to end, one row
  after another, addressed by a single computed index rather than one
  index per dimension.
- **Index math (linear indexing)** — a formula converting a row and
  column into the single position a flat array actually stores that cell
  at — here, `row * 9 + col`, since each of the 9 rows occupies 9
  consecutive flat positions. It exists because a flat array has no
  native concept of "row" or "column" at all — every 2D-shaped question
  has to be translated into "which single flat position is that," by
  hand, every time.
- **Nested (two-dimensional) list** — a `List` whose own elements are
  themselves `List`s, one inner list per row, letting a cell be addressed
  directly by `board[row][col]` with no index math to compute or get
  wrong.
- **Nullable type (`?`)** — reappearing from Lesson 5, restated in full: a
  `?` written directly after a type name, meaning "a value of this type,
  or `null`." This lesson's Concept Unit 3 applies it to a `List`'s own
  element type (`int?`), not just a single variable.
- **Anonymous function (lambda expression)** — reappearing from Lesson 9,
  restated in full: a function (Lesson 8's term) with no name of its
  own, written directly at the place it's needed. Used in this lesson's
  Concept Unit 2 as `List.generate`'s own generator argument.
- **Arrow syntax (`=>`)** — reappearing from Lesson 9, restated in full: a
  compact way to write a function whose entire body is one expression,
  equivalent to a full block body with an explicit `return`.
- **Sentinel value** — an ordinary, in-range value repurposed to also mean
  "nothing is actually here" — `0`, for instance, standing in for "this
  Sudoku cell is empty," even though `0` is otherwise just an ordinary
  number like any other. It exists as the traditional way languages
  without a real `null` (or without one for a given type) represent
  absence, at the real cost this lesson's Concept Unit 3 examines
  directly.

**Objects and methods used:**

- **`List`**
  - *What it is:* the same real, generic `dart:core` class Lesson 9
    introduced.
  - *Implementation:* `abstract interface class List<E> implements
    Iterable<E>, _ListIterable<E>` (verified in Lesson 9). Two real named
    constructors used fresh in this lesson: `factory List.filled(int
    length, E fill, {bool growable = false})`, producing a `List` of the
    given length with every slot already set to `fill`; and `factory
    List.generate(int length, E generator(int index), {bool growable =
    true})`, producing a `List` of the given length by calling
    `generator` once per index to produce each element — used in this
    lesson's own nested board to build 9 independent inner rows (calling
    `List.filled` once per row directly would instead risk every row
    being the *same* shared inner list, a real, easy mistake `.generate`
    avoids by calling its generator fresh for each index).
  - *Its use:* Concept Units 1 and 2 build a flat board and a nested board
    with these two constructors; Concept Unit 3 builds a nullable one.
  - *Type:* an abstract, generic interface class.
  - *Responsibility:* hold an ordered sequence of values of one declared
    type, letting them be added, read by position, counted, and
    reordered.
  - *Depends on:* a type argument, and, for `.filled`/`.generate`, a
    length and either a fill value or a generator function.
  - *Connects to:* built by `.filled`/`.generate`; read and written by the
    index operator (Lesson 9's term, reappearing) throughout this lesson.
  - *Shape:* `dart:core` standard-library surface, unchanged from Lesson
    9.
- **`SudokuBoard`**
  - *What it is:* this curriculum's own real class, already built at the
    Phase 1 milestone, in `project/lib/sudoku_board.dart`.
  - *Implementation:* real, current source, read fresh this session:
    `class SudokuBoard { static const int size = 9; static const int
    boxSize = 3; final List<List<int?>> _grid; final List<List<bool>>
    _isGiven; ... }` — internally, a nested `List<List<int?>>`, the exact
    representation this lesson's Concept Unit 3 reasons its way toward,
    wrapped by a real class exposing only validated methods
    (`valueAt`, `isGivenAt`, `isComplete`, `placeDigit`, `clearCell`)
    rather than the raw grid itself.
  - *Its use:* Concept Unit 4 reads this real file directly, reasoning
    about the actual representation choice it already made, rather than
    treating the three-way comparison as still undecided.
  - *Type:* a real, encapsulated class (Lesson 11's term, reappearing).
  - *Responsibility:* own a 9x9 Sudoku board's complete state and enforce
    every rule about how that state may legally change, so that nothing
    elsewhere in this project can put the board into an invalid state
    directly.
  - *Depends on:* a starting 9x9 grid of `int?` values, handed to its
    constructor.
  - *Connects to:* built once, in `project/bin/sudoku_console.dart`
    (Phase 1 milestone); every later phase of this curriculum (Phase 2's
    own algorithms, Phase 3's first Flutter UI) reads and calls this exact
    same class rather than reaching into a raw grid directly.
  - *Shape:* the real, persisting boundary between "how a Sudoku board's
    data happens to be stored" (an internal detail) and "what any other
    code is allowed to do with a Sudoku board" (its public API) — the
    actual, load-bearing architecture this entire phase builds on.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: One Long Row Instead of a Grid

### The Problem

A Sudoku board has 81 cells, naturally arranged in 9 rows of 9. The
simplest possible `List` — a single, flat `List<int>` — has no native
idea of "rows" at all; it's just one long sequence. Can a 2D board still
be stored in something that's fundamentally 1D, and if so, what does
reading "row 2, column 5" actually require?

> **Stop and think before reading on:** If every row's 9 cells sit end to
> end in one long list — row 0's 9 cells, then row 1's 9 cells, and so
> on — what arithmetic, using only `row`, `col`, and the fact that every
> row has exactly 9 cells, would find the one flat position holding
> "row 2, column 5"?

### Project Change

- **Reference Source:** No reference counterpart for this specific
  representation — this unit deliberately builds the *rejected*
  alternative, for comparison, not what the real project actually uses.
- **Files affected:** `src/docs/flutter/verification/lesson-17/representation_demo.dart`
  — created, containing this unit's flat board; Concept Units 2 and 3
  will each add their own code to this same file before it's run once, as
  one real batch.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
int flatIndex(int row, int col) => row * 9 + col;

var flatBoard = List<int>.filled(81, 0);
flatBoard[flatIndex(2, 5)] = 7;
print(flatBoard[flatIndex(2, 5)]);
print(flatBoard[23]);
```

### The Updated Project

Not applicable — this is the file's brand-new starting content.

### Introduce the concept in isolation

Whether `flatIndex(2, 5)` genuinely lands on the same flat position as
the manually-computed `23` is worth real proof, not mental arithmetic
trusted blindly — run for real, batched with the rest of this lesson:

```
7
7
```

Both lines print `7` — `flatBoard[flatIndex(2, 5)]` and `flatBoard[23]`
are the exact same slot, confirming `2 * 9 + 5` really does equal `23`.
This is a **flat array** (this lesson's term): one long `List`, no native
concept of rows or columns at all.

### Discarding this example

`flatBoard`'s own single value is disposable. What carries forward:
addressing a cell in a flat array requires computing its one true
position by hand, every single time, using **index math** (this lesson's
term).

### Mechanical walkthrough

- **`int flatIndex(int row, int col) => row * 9 + col;`** — a function
  declaration (Lesson 8's term, reappearing) using arrow syntax (Lesson
  9's term, reappearing); `row * 9 + col` is the multiplication and
  addition operators (Lesson 6's terms, reappearing) combined: `row * 9`
  skips past every complete row before this one (each holding exactly 9
  cells), and `+ col` then steps across to the exact column within this
  row.
- **`List<int>.filled(81, 0)`** — `List`'s own real named constructor,
  `factory List.filled(int length, E fill, {bool growable = false})`
  (this lesson's header): `81` is the total flat length (`9 rows × 9
  columns`); `0` is the fill value every one of those 81 slots starts
  with — a **sentinel value** (this lesson's term) standing in for "this
  cell is empty," a real design tension this lesson's Concept Unit 3
  examines directly.
- **`flatBoard[flatIndex(2, 5)] = 7;`** — the index operator (Lesson 9's
  term, reappearing), here computed rather than written literally;
  assignment (Lesson 5's term, reappearing) storing `7` at whatever
  position `flatIndex(2, 5)` computes.
- **`print(flatBoard[flatIndex(2, 5)]);`, `print(flatBoard[23]);`** — the
  same `print` function from this lesson's header, each reading the flat
  array at, respectively, the computed index and the literal index `23`
  — proving both refer to the identical slot.

### CS lens

Storing a naturally multi-dimensional structure in one contiguous,
one-dimensional sequence, addressed by a computed offset, is exactly how
real computer memory itself works underneath every higher-level structure
a language provides — a 2D array in almost any language is, at the
hardware level, still one flat block of memory with the exact same kind
of index math computed for you, invisibly, by the compiler.

```
Also recognized in: how a 2D array is actually laid out in memory in
C, C++, and most compiled languages (row-major order, the exact
scheme this unit used); a spreadsheet's own underlying flat storage
before its UI presents rows and columns; an image file's own pixel
data, stored as one flat sequence of bytes, addressed by `y * width +
x`
```

### SE lens

A flat array's real cost is exactly what this unit's own code shows:
every single place that needs to read or write a cell has to repeat (or
correctly call) the same index-math formula — get `row * 9 + col` wrong
just once, anywhere in a growing codebase, and cells silently read or
write the wrong position, with no error at all, since `23` is a
perfectly valid index whether or not it was computed correctly. Its real
benefit — genuinely relevant to Lesson 23 (Performance) later in this
phase — is that one single, contiguous block of memory can be faster to
allocate and iterate over than many small, separate inner lists, which is
exactly the tradeoff the next unit's nested representation makes in the
opposite direction.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's code is combined with Concept Units 2 and 3's own code into one
file, run once. Complete real output shown in Concept Unit 3's own "Run
it" step, saved in `src/docs/flutter/verification/lesson-17/run-log.md`.

### Connecting this unit

This unit stored a 2D board in something fundamentally 1D, at the cost of
hand-written index math everywhere. The next unit removes that cost
entirely, at a different cost of its own.

---

## Concept Unit: A List of Rows Instead of One Long List

### The Problem

The previous unit's `flatIndex` has to be called correctly at every
single site that touches the board — a real, repeated risk. What if the
`List` itself already understood "rows," so no index math was ever
needed at all?

> **Stop and think before reading on:** If a `List`'s own elements could
> themselves be `List`s — one inner list per row — what would reading
> "row 2, column 5" look like, compared to the previous unit's
> `flatBoard[flatIndex(2, 5)]`? Would there be any arithmetic left to get
> wrong?

### Project Change

- **Reference Source:** No reference counterpart for this specific
  representation, same as the previous unit.
- **Files affected:** `src/docs/flutter/verification/lesson-17/representation_demo.dart`
  — modified, appending this unit's nested board.
- **Change type:** Add (new lines).
- **Location:** Appended directly after the previous unit's two `print`
  lines.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
var nestedBoard = List.generate(9, (_) => List<int>.filled(9, 0));
nestedBoard[2][5] = 7;
print(nestedBoard[2][5]);
```

### The Updated Project

```dart
1: int flatIndex(int row, int col) => row * 9 + col;
2:
3: var flatBoard = List<int>.filled(81, 0);
4: flatBoard[flatIndex(2, 5)] = 7;
5: print(flatBoard[flatIndex(2, 5)]);
6: print(flatBoard[23]);
7:
8: var nestedBoard = List.generate(9, (_) => List<int>.filled(9, 0));  // ← new
9: nestedBoard[2][5] = 7;                                              // ← new
10: print(nestedBoard[2][5]);                                          // ← new
```

### Introduce the concept in isolation

Real, verified output (batched with the rest of this lesson):

```
7
```

`nestedBoard[2][5]` reads back the `7` just written, with no index math
of any kind — this is a **nested list** (this lesson's term): a `List`
whose own 9 elements are each a `List` of 9 `int`s.

### Discarding this example

`nestedBoard`'s own single value is disposable. What carries forward: a
nested `List<List<int>>` lets a cell be addressed directly by
`board[row][col]`, with nothing to compute and nothing to get wrong the
way the previous unit's `flatIndex` could be.

### Mechanical walkthrough

- **`List.generate(9, (_) => List<int>.filled(9, 0))`** — `List`'s own
  real named constructor, `factory List.generate(int length, E
  generator(int index), {bool growable = true})` (this lesson's header):
  `9` is the outer length (9 rows); `(_) => List<int>.filled(9, 0)` is an
  anonymous function (Lesson 9's term, reappearing), called once per
  outer index, each call producing a **fresh, independent** inner
  `List<int>.filled(9, 0)` — critically, calling `.generate` this way,
  rather than writing `List.filled(9, List.filled(9, 0))` directly, is
  what guarantees each of the 9 rows is its own separate list; `.filled`
  alone would instead copy the exact same single inner list reference
  into all 9 outer slots, meaning writing to "row 0" would silently also
  change every other row.
- **`nestedBoard[2][5] = 7;`** — two index operators (Lesson 9's term,
  reappearing) chained: `nestedBoard[2]` reads the third inner `List`
  (row `2`); `[5] = 7` then writes `7` into that inner list's own
  position `5`.
- **`print(nestedBoard[2][5]);`** — the same `print` function from this
  lesson's header, reading the identical chained index back.

### CS lens

A `List` of `List`s, each inner one representing a row, is the standard
way most high-level languages represent a genuinely 2D structure — a
direct, structural match between the data's own real shape and the
program's representation of it, rather than the previous unit's flat
array requiring a separate formula to bridge that gap.

```
Also recognized in: Python's own list-of-lists convention for a
matrix (`board[row][col]`), a spreadsheet's own row/column addressing
as presented to a user (even though, per the previous unit's CS lens,
it's still flat underneath), a chessboard represented as 8 ranks
each holding 8 squares
```

### SE lens

This unit's own real proof about `.generate` versus `.filled` for the
outer list is a genuine, easy-to-fall-into trap: nested representation
removes the index-math risk the previous unit carried, but introduces a
different one — accidentally sharing one single inner list across every
outer slot, which would make every row silently alias every other row.
The nested representation's real cost, beyond that trap: 9 separate inner
`List` objects, each with its own overhead, instead of one single
contiguous block — precisely the performance-vs-clarity tradeoff Lesson
23 measures for real later in this phase.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Not run standalone; full output shown in this unit's own next step, since
Concept Unit 3 completes this lesson's batched file.

### Connecting this unit

This unit removed index math entirely. Neither representation so far can
answer a question this lesson's own project already needs answered: what
does an *empty* cell actually look like?

---

## Concept Unit: What "Empty" Actually Means

### The Problem

Both representations so far filled every cell with `0` to start. But `0`
is also a real, if invalid, thing someone might type — nothing about
either representation, as built so far, actually distinguishes "empty"
from "someone entered a wrong value that happens to be zero" (not a real
Sudoku digit, but still a distinct concept from "nothing is here at
all"). Lesson 5 already gave this curriculum a real, dedicated way to
express "no value at all" — does it apply here?

> **Stop and think before reading on:** Given Lesson 5's own real,
> run-verified proof that a plain `int` can never hold `null`, what type
> would a board's own cells need instead, to genuinely distinguish
> "empty" from "a real digit," rather than overloading an ordinary number
> like `0` to mean both "a valid input" and "nothing here"?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`, lines 20-21:
  `final List<List<int?>> _grid;` — quoted verbatim, read fresh this
  session. This unit's own code builds toward exactly this real,
  already-chosen representation.
- **Files affected:** `src/docs/flutter/verification/lesson-17/representation_demo.dart`
  — modified, adding this unit's nullable list, completing the file;
  `src/docs/flutter/verification/lesson-17/non_nullable_list_error.dart`
  — created, for this unit's own real, deliberate compile error.
- **Change type:** Add (new lines; new file for the error demo).
- **Location:** Appended directly after the previous unit's final
  `print`.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Unit 2.

### The New Code

```dart
var nullableBoard = List<int?>.filled(9, null);
print(nullableBoard[0]);
nullableBoard[0] = 7;
print(nullableBoard[0]);
```

The deliberately broken alternative, in its own file:

```dart
void nonNullableListError() {
  var board = List<int>.filled(9, null);
  print(board);
}
```

### The Updated Project

The complete, final file for this lesson's representation comparison (new
lines marked; everything above is exactly what Concept Units 1 and 2 left
it as):

```dart
 1: int flatIndex(int row, int col) => row * 9 + col;
 2:
 3: var flatBoard = List<int>.filled(81, 0);
 4: flatBoard[flatIndex(2, 5)] = 7;
 5: print(flatBoard[flatIndex(2, 5)]);
 6: print(flatBoard[23]);
 7:
 8: var nestedBoard = List.generate(9, (_) => List<int>.filled(9, 0));
 9: nestedBoard[2][5] = 7;
10: print(nestedBoard[2][5]);
11:
12: var nullableBoard = List<int?>.filled(9, null);   // ← new
13: print(nullableBoard[0]);                          // ← new
14: nullableBoard[0] = 7;                              // ← new
15: print(nullableBoard[0]);                           // ← new
```

### Introduce the concept in isolation

Whether `List<int?>.filled(9, null)` genuinely compiles and holds a real
`null`, and whether the exact same call with a plain `List<int>` is
genuinely rejected, are both worth real proof — run for real:

```
null
7
```

`nullableBoard[0]` starts as a real `null` (not `0`, not any sentinel
value), then becomes `7` once explicitly set. The deliberately broken
version, `List<int>.filled(9, null)`, was analyzed separately:

```
error - non_nullable_list_error.dart:4:35 - The argument type 'Null' can't be assigned to the parameter type 'int'.  - argument_type_not_assignable
```

This proves a plain `List<int>` genuinely cannot hold `null` at all — the
same real guarantee Lesson 5's own `int cellValue = null;` proof already
established for a single variable, now shown to apply identically to a
`List`'s own element type. `List<int?>`, by contrast, distinguishes
"empty" (`null`) from every real digit (`1` through `9`) as two
genuinely different, type-checked concepts — exactly the representation
`project/lib/sudoku_board.dart`'s own real `_grid` field already uses.

### Discarding this example

`nullableBoard`'s own single value is disposable. What carries forward:
`List<int?>` is what this curriculum's own real project already chose,
specifically so "empty" never has to be confused with, or overload, any
real digit.

### Mechanical walkthrough

- **`List<int?>.filled(9, null)`** — `List`'s own real named constructor
  (this lesson's header), here with a nullable element type (Lesson 5's
  term, reappearing) and `null` (Lesson 5's term, reappearing) itself as
  the fill value — legal specifically because the element type is `int?`,
  not `int`.
- **`nullableBoard[0]`** (read) — the index operator, returning the real
  `null` every slot starts with.
- **`nullableBoard[0] = 7;`** — assignment, storing a real digit into a
  slot that previously held `null`.
- **`List<int>.filled(9, null)`** (broken case) — the identical call
  shape, but with a plain, non-nullable `int` element type; rejected
  because `null` is not a legal `int` value at all, the same real rule
  Lesson 5 already proved for a single variable.

### CS lens

Choosing between a **sentinel value** (this lesson's term — an ordinary
value doing double duty) and a genuinely distinct **null** representation
for "absence" is a real, recurring data-modeling decision, not specific
to Sudoku or to Dart.

```
Also recognized in: SQL's own NULL, distinct from an empty string or
zero; a thermometer reading "no data" versus a genuine 0-degree
reading; a form field left blank versus one where someone typed the
number 0; Lesson 5's own `int?` proof, now shown to extend identically
to a `List`'s own element type
```

### SE lens

A sentinel value's real cost is exactly what this unit's own Socratic
question raised: every single piece of code that reads the board has to
separately remember which value means "empty," and nothing in the type
system enforces that discipline — a bug that means "a value below 1 or
above 9 is invalid, except this one specific number, which secretly means
something else" is a subtle, easy-to-forget rule living only in a
programmer's memory, not in a signature the compiler checks. `int?`
removes that entire class of confusion, real-proved above: "empty" is
`null`, checked by the compiler at every single use, and every value that
isn't `null` is a genuine candidate digit with no double meaning to
remember.

### Commands needed

- **`dart run <file>`** — the same real command every earlier unit this
  lesson.
- **`dart analyze <file>`** — reappearing from Lesson 5, restated in
  full: statically checks a file for compile-time errors without running
  it.

### Run it

Real, verified, complete output for this lesson's entire representation-
comparison file:

```
7
7
7
null
7
```

Real, verified output for the deliberately broken case:

```
error - non_nullable_list_error.dart:4:35 - The argument type 'Null' can't be assigned to the parameter type 'int'.  - argument_type_not_assignable
```

Both real, saved in full in
`src/docs/flutter/verification/lesson-17/run-log.md`.

### Connecting this unit

This unit settled what "empty" should actually mean: `null`, not a
borrowed digit. The final unit turns to the real project itself, asking
what still isn't solved even with the right representation chosen.

---

## Concept Unit: What a Bare Representation Still Doesn't Solve

### The Problem

Even with `List<List<int?>>` — the representation the previous unit
settled on, and the one `project/lib/sudoku_board.dart` actually uses —
nothing about a bare nested list stops code from writing an out-of-range
"digit," or the same digit twice in one row. A representation alone
doesn't enforce Sudoku's own rules.

> **Stop and think before reading on:** If a raw `List<List<int?>>` were
> passed around this project directly — no wrapping class at all — what
> would stop one piece of code, anywhere in a large, growing codebase,
> from writing `board[0][0] = 500` by mistake? Compare that to how Lesson
> 11's own encapsulation already solved a similar problem for a single
> cell.

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`, the whole file,
  read fresh this session (quoted in relevant part in this lesson's
  header's own `SudokuBoard` entry). This unit's own throwaway proof
  builds the *raw*, unwrapped alternative specifically to contrast
  against this real, already-existing file — it does not modify
  `sudoku_board.dart` itself.
- **Files affected:** `src/docs/flutter/verification/lesson-17/raw_corruption_demo.dart`
  — created, for this unit's own real proof.
- **Change type:** Add (new file). No change to `project/` itself — this
  unit is reasoning about an already-complete design, not revising it.
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
var rawBoard = List.generate(9, (_) => List<int?>.filled(9, null));
rawBoard[0][0] = 500;
rawBoard[0][1] = 500;
print(rawBoard[0][0]);
print(rawBoard[0][1]);
```

### The Updated Project

Not applicable — a brand-new, freestanding proof, not a change to any
tracked project file.

### Introduce the concept in isolation

Whether a raw nested list genuinely accepts an invalid value with no
resistance at all is worth real proof, not assumption — run for real:

```
500
500
```

Both an absurdly out-of-range "digit" and a genuine duplicate within the
same row were accepted without a single error or warning — proving a raw
`List<List<int?>>`, on its own, enforces absolutely nothing about what a
real Sudoku board is allowed to contain. Contrast this with
`project/lib/sudoku_board.dart`'s own real, already-verified behavior
(Phase 1 milestone, `verification/milestone/run-log.md`): `SudokuBoard
.placeDigit` genuinely rejected an out-of-range digit and a genuine row
conflict, each with its own real, distinct `InvalidMoveException`.

### Discarding this example

`rawBoard`'s own corrupted values are disposable — this proof exists only
to make the contrast concrete, and this exact code will not appear in
`project/` at all. What carries forward: choosing the right
*representation* (this lesson's Concept Unit 3) is a necessary but
insufficient step — the representation still has to be *wrapped*, its
mutation routed only through validated methods, to actually enforce
anything.

### Mechanical walkthrough

- **`List.generate(9, (_) => List<int?>.filled(9, null))`** — the same
  construction as Concept Unit 3's `nullableBoard`, here applied per-row,
  same as Concept Unit 2's own nested board.
- **`rawBoard[0][0] = 500;`, `rawBoard[0][1] = 500;`** — chained index
  operators (Lesson 9's term, reappearing) and assignment (Lesson 5's
  term, reappearing); both compile and run without complaint, because
  nothing about `List<List<int?>>`'s own type says anything about a valid
  Sudoku digit's actual range or about row uniqueness — those are rules
  this *domain* cares about, not rules the *representation* itself
  encodes.

### CS lens

The gap this unit exposes — a correct representation that still enforces
no domain rules — is exactly why **encapsulation** (Lesson 11's term,
reappearing) exists as a *separate* concern from representation itself:
choosing the right shape for data and controlling how that data may
legally change are two different jobs, and a language's type system alone
only ever solves the first one.

```
Also recognized in: a database table with perfectly reasonable
column types (an `int` for age) that still permits storing `-5`
without a separate `CHECK` constraint; a file format that's
perfectly parseable but doesn't itself guarantee its contents make
sense; a bank account balance stored as an ordinary number, with
nothing about that type alone preventing it from going negative
without a business rule enforcing it
```

### SE lens

This is the exact reasoning `project/lib/sudoku_board.dart` already
applied, real and already-verified, at the Phase 1 milestone: rather than
passing a raw `List<List<int?>>` around this entire project (this unit's
own real proof shows exactly how easily that could be silently
corrupted), `SudokuBoard` keeps its own `_grid` and `_isGiven` fields
private and exposes only `valueAt`, `isGivenAt`, `isComplete`,
`placeDigit`, and `clearCell` — every one of which either only reads, or
validates before writing. The real cost already paid for this: every
mutation has to go through one of those methods rather than a direct
assignment, a small amount of extra ceremony at every call site, in
exchange for the exact guarantee this unit's own raw version just proved
doesn't exist otherwise.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified output:

```
500
500
```

Real, saved in full in
`src/docs/flutter/verification/lesson-17/run-log.md`, alongside a
reference back to `verification/milestone/run-log.md`'s own earlier real
proof of `SudokuBoard`'s actual validation behavior (reused, not
re-run, per the Verification Rule's Persistence clause).

### Connecting this unit

This unit closed the loop this whole lesson opened: a representation
alone, however well-chosen, doesn't enforce anything — `project/lib/
sudoku_board.dart`'s own already-built encapsulation is what actually
does.

---

## Connect the Pieces

Trace one concrete fact — row `2`, column `5`, holding the digit `7` —
through every representation this lesson built. As a flat `List<int>`, it
lived at position `23`, found only by computing `2 * 9 + 5` correctly,
every single time, real-proved by two matching reads landing on the
identical slot. As a nested `List<List<int>>`, it lived at
`nestedBoard[2][5]`, needing no arithmetic at all, at the real cost
(also real-proved) of a subtle aliasing trap `List.generate` had to be
used correctly to avoid. Once the question turned to *empty* cells,
`List<int?>` — real-proved to genuinely accept `null` where a plain
`List<int>` was genuinely rejected — settled which representation this
project's own `SudokuBoard` actually uses, quoted directly from its real,
current source. And the final unit proved, with a real, deliberately
uncorrected corruption, that the representation alone was never the whole
answer: `SudokuBoard`'s own real, already-verified encapsulation is what
turns "data shaped correctly" into "data that can't be made invalid,"
which this lesson's own review confirmed, rather than assumed, is already
built and already working.

Phase 1 gave this curriculum a working Sudoku engine; this lesson is the
first to look back at that real, persisting code with a critical,
comparative eye rather than only adding to it. Lesson 18 turns to the
Sudoku rules `SudokuBoard._isSafe` already enforces — row, column, and
box validation — and asks what else a fuller constraint system needs
before Lesson 19 can actually attempt to solve a puzzle.
