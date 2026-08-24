# Lesson 46: Crossing the Boundary in Both Directions

**Mapping**

## What you will build

`SudokuBoardDto`, defined but unused in Lesson 45, gets its real,
working bridge to `SudokuBoard`: a real `SudokuBoardDto.fromBoard`
factory (Domain → DTO) and a real `toBoard()` method (DTO → Domain).
`main.dart` is rewired to build one real `SudokuBoardDto` per frame
instead of calling its own former, separately-duplicated `_cellsOf`/
`_givenCellsOf` functions — closing the real gap Lesson 45 named but
didn't fix. Along the way, this lesson hits a real, genuine, caught bug:
naively rebuilding a `SudokuBoard` from a DTO's `cells` alone, through
the existing default constructor, silently locks every real
player-filled digit as if it were a given clue — proven with a real,
run demonstration, then fixed with a new, real `SudokuBoard.withState`
constructor. The transferable problem: curriculum.md's own Lesson 46
bullet asks for real mapping in both directions — this lesson builds
both, and the DTO → Domain direction turns out to be the harder, more
interesting one.

## What you need to know first

- Lesson 45 ("Data Shaped for Carrying, Not for Deciding") —
  `SudokuBoardDto`, defined but not yet wired in; this lesson is where
  that changes.
- Lesson 11 ("A Shape of Data You Define") — constructors, including
  `SudokuBoard`'s own original, default one, contrasted directly against
  this lesson's new second constructor.
- Lesson 17 ("Choosing How Data Is Shaped") — `SudokuBoard`'s own
  internal `_grid`/`_isGiven` representation, and Lesson 17's own
  already-real aliasing-trap lesson, directly relevant to this lesson's
  own real `List.generate`/`List.of` copying choices.
- Lesson 14 ("When Something Goes Wrong") — `InvalidMoveException`,
  reused in this lesson's own real proof that a rebuilt board still
  correctly enforces given-clue locking.

## Terms used in this lesson

- **Mapping** — the real, mechanical act of converting one real shape of
  data into another, structurally different shape, without changing
  what it actually represents. Exists as its own named step because,
  per Lesson 45's own real proof, a domain object and a DTO are
  genuinely different real shapes — something concrete has to bridge
  them, in both directions.
- **Round trip** — converting a real value from one shape to another and
  back again, then checking the result still represents the same real
  thing. Exists as a real testing technique because a mapping that looks
  correct in one direction can still silently lose real information
  going the other way — this lesson's own central real discovery.
- **Named constructor (reappearing sense, formalized)** — Dart's own
  real syntax, `ClassName.name(...)`, for a class to offer more than one
  real way to be constructed, each with its own distinct real
  parameters and meaning. `SudokuBoard.withState`, this lesson's own new
  example, is a real, second, alternate way to build a `SudokuBoard`
  alongside its original, default constructor.

## Objects and methods used

- **`SudokuBoardDto.fromBoard` (new)**
  - *What it is:* a real, named factory constructor performing Domain →
    DTO mapping.
  - *Implementation:* `factory SudokuBoardDto.fromBoard(SudokuBoard
    board) { return SudokuBoardDto(List.generate(...), List.generate
    (...)); }` (`project/lib/sudoku_board_dto.dart`) — the exact real
    logic `main.dart`'s own former `_cellsOf`/`_givenCellsOf` functions
    used to perform separately, now unified.
  - *Its use:* Concept Unit 1's own central real subject; replaces both
    former functions at their one real call site in `main.dart`.
  - *Type:* a `factory` constructor.
  - *Responsibility:* read a real, live `SudokuBoard`'s current state,
    cell by cell, and copy it into a new, plain, disconnected
    `SudokuBoardDto` — a real, one-time snapshot, never a live reference.
  - *Depends on:* `SudokuBoard.valueAt`/`isGivenAt` (both reappearing,
    Lesson 17).
  - *Connects to:* called once per frame by `_SudokuAppState.build`
    (`main.dart`).
  - *Shape:* the real Domain → DTO half of this lesson's own new mapping
    seam.

- **`SudokuBoardDto.toBoard` (new)**
  - *What it is:* a real instance method performing DTO → Domain
    mapping.
  - *Implementation:* `SudokuBoard toBoard() => SudokuBoard.withState
    (cells, givenCells);` (`project/lib/sudoku_board_dto.dart`).
  - *Its use:* Concept Unit 2's own central real subject — not yet
    called by any real production code (Phase 6's own future job, saving
    and reloading a session), but real, run, tested this lesson via its
    own new, permanent test file.
  - *Type:* an instance method.
  - *Responsibility:* build a genuinely new, real, live `SudokuBoard`
    from this DTO's own plain data — correctly, which turns out to
    require `SudokuBoard.withState`, not `SudokuBoard`'s own default
    constructor.
  - *Depends on:* `SudokuBoard.withState`.
  - *Connects to:* tested directly in `sudoku_board_dto_test.dart`.
  - *Shape:* the real DTO → Domain half of this lesson's own new mapping
    seam.

- **`SudokuBoard.withState` (new)**
  - *What it is:* a new, real, second constructor for `SudokuBoard`,
    alongside its original, default one.
  - *Implementation:* `SudokuBoard.withState(List<List<int?>> cells,
    List<List<bool>> givenCells) : _grid = List.generate(size, (row) =>
    List.of(cells[row])), _isGiven = List.generate(size, (row) =>
    List.of(givenCells[row]));` (`project/lib/sudoku_board.dart`).
  - *Its use:* this lesson's own real fix for the bug Concept Unit 2
    discovers and proves.
  - *Type:* a real, named constructor.
  - *Responsibility:* rebuild a board's own two real internal arrays
    (`_grid`, `_isGiven`) from two already-separate real sources, instead
    of inferring one from the other the way the default constructor
    does.
  - *Depends on:* two real, already-matching-shape `List<List<...>>`
    arguments.
  - *Connects to:* called only by `SudokuBoardDto.toBoard`.
  - *Shape:* Domain layer — `SudokuBoard`'s own real internals,
    unchanged in every other respect.

- **`SudokuBoard` (reappearing, default constructor, Lesson 11)**
  - *What it is:* the same real class's original, default constructor,
    now contrasted directly against `withState`.
  - *Implementation:* `SudokuBoard(List<List<int?>> initial) : _grid =
    ..., _isGiven = List.generate(size, (row) => List.generate(size,
    (col) => initial[row][col] != null));` — real, unchanged since
    Lesson 11, quoted again here in full per the Repetition Rule.
  - *Its use:* Concept Unit 2's own central real point of comparison —
    the exact real line (`initial[row][col] != null`) that makes it
    unsuitable for rebuilding an in-progress game.
  - *Type:* the class's own default (unnamed) constructor.
  - *Responsibility:* build a board from a single, real starting grid,
    always inferring "non-null means given" — correct only when every
    non-null cell genuinely *is* a given clue, which is true for a fresh
    puzzle and false for an in-progress one.
  - *Depends on:* one real `List<List<int?>>` argument.
  - *Connects to:* still called everywhere it always was
    (`InMemoryPuzzleRepository`, every existing test) — this lesson adds
    a second real way to build a `SudokuBoard`, it does not remove or
    change the first.
  - *Shape:* Domain layer, unchanged.

---

## Concept Unit 1: Domain → DTO, For Real

### The Problem

`SudokuBoardDto.fromBoard` doesn't exist yet — Lesson 45's own new type
has fields but no real way to actually get real data into it from a
live `SudokuBoard`, beyond calling its bare constructor by hand with two
already-computed lists, exactly what `main.dart`'s own `_cellsOf`/
`_givenCellsOf` still do, separately, today.

> **Socratic prompt:** `main.dart`'s own `_cellsOf`/`_givenCellsOf`
> functions (Lesson 34, quoted in Lesson 45) each take one real
> `SudokuBoard` and return one real `List`. Given `SudokuBoardDto`'s own
> two real fields, what would the smallest real function combining both
> of those existing real functions into one call look like? Second: Dart
> lets a constructor be named (`ClassName.name(...)`), not just the
> default, unnamed one. Given that a `factory` constructor (unlike a
> plain one) can run real logic and choose what to actually construct,
> why might `fromBoard` want to be a `factory` rather than a plain
> named constructor built with an initializer list?

### Project Change

- **Reference Source:** `project/lib/main.dart`, lines 18-30 as they
  existed at the end of Lesson 45 (the real, soon-to-be-replaced
  `_cellsOf`/`_givenCellsOf` functions, read fresh this session before
  being removed) — the real logic being unified, not ported from
  anywhere external.
- **Files affected:** `project/lib/sudoku_board_dto.dart` (modified:
  adds `fromBoard`, an `import 'sudoku_board.dart';`);
  `project/lib/main.dart` (modified: removes `_cellsOf`/
  `_givenCellsOf`, adds one real `SudokuBoardDto.fromBoard` call, updates
  the `SudokuBoardView` call site).
- **Change type:** add (the new factory), remove (the two old
  functions), replace (the call site).
- **Location:** `sudoku_board_dto.dart`, inside the `SudokuBoardDto`
  class; `main.dart`'s own `build` method, immediately before its
  `return MaterialApp(...)`.
- **Dependencies:** none beyond `SudokuBoard` itself.

### The New Code

```dart
factory SudokuBoardDto.fromBoard(SudokuBoard board) {
  return SudokuBoardDto(
    List.generate(
      SudokuBoard.size,
      (row) => List.generate(SudokuBoard.size, (col) => board.valueAt(row, col)),
    ),
    List.generate(
      SudokuBoard.size,
      (row) => List.generate(SudokuBoard.size, (col) => board.isGivenAt(row, col)),
    ),
  );
}
```

### The Updated Project

`sudoku_board_dto.dart`, in full, with the new lines marked (line
numbers count from the file's own first line):

```dart
1  import 'sudoku_board.dart';                                        // ← new
2
3  class SudokuBoardDto {
4    SudokuBoardDto(this.cells, this.givenCells);
5
6    factory SudokuBoardDto.fromBoard(SudokuBoard board) {             // ← new
7      return SudokuBoardDto(                                         // ← new
8        List.generate(                                               // ← new
9          SudokuBoard.size,                                          // ← new
10         (row) => List.generate(SudokuBoard.size, (col) => board.valueAt(row, col)), // ← new
11       ),                                                           // ← new
12       List.generate(                                               // ← new
13         SudokuBoard.size,                                          // ← new
14         (row) => List.generate(SudokuBoard.size, (col) => board.isGivenAt(row, col)), // ← new
15       ),                                                           // ← new
16     );                                                              // ← new
17   }                                                                 // ← new
18
19   final List<List<int?>> cells;
20   final List<List<bool>> givenCells;
21 }
```

As a whole, `SudokuBoardDto` now knows how to build itself from a real,
live board, not just from two already-computed lists a caller hands it
directly.

And `main.dart`'s own real `build` method's relevant section, in full,
with the changed lines marked:

```dart
1  final canTogglePause = session.status == GameStatus.playing || session.status == GameStatus.paused;
2  final boardDto = SudokuBoardDto.fromBoard(session.board);          // ← new
3  return MaterialApp(
4    ...
5    SudokuBoardView(
6      cells: boardDto.cells,                                         // ← changed
7      givenCells: boardDto.givenCells,                                // ← changed
8      ...
9    ),
```

`_cellsOf`/`_givenCellsOf` are gone from the file entirely — real,
complete removal, not left behind as unused dead code.

### Isolate and Discard

No throwaway lab — `main.dart`'s own real, former `_cellsOf`/
`_givenCellsOf` functions, already quoted in Lesson 45, are the real,
already-isolated example this new factory unifies; nothing new needed
inventing.

### Mechanical Walkthrough

- `factory SudokuBoardDto.fromBoard(SudokuBoard board)` — Dart's own
  real `factory` keyword (new to this curriculum): unlike an ordinary
  constructor, a `factory` constructor's own body is real, ordinary
  code, free to run any real logic before deciding what to return —
  here, reading `board`'s own current real state and building a
  brand-new `SudokuBoardDto` from it, rather than an initializer list
  wiring parameters straight to fields.
- `SudokuBoardDto.fromBoard` — a real named constructor (Terms, above):
  `SudokuBoardDto` (the class), `.` (Lesson 11's own real member-access
  syntax, reappearing, here naming a constructor instead of a field or
  method), `fromBoard` (this constructor's own real, chosen name,
  distinct from the class's default, unnamed constructor).
- `return SudokuBoardDto(...)` — a real `return` statement (Lesson 8,
  reappearing) calling the class's own original, default constructor
  (Lesson 11, reappearing) from inside this new factory — the smallest
  possible real bridge between the two.
- `List.generate(SudokuBoard.size, (row) => List.generate(SudokuBoard.size,
  (col) => board.valueAt(row, col)))` — already given full, real
  treatment in Lesson 34's own original `_cellsOf`; reread here,
  reappearing, unchanged: `List.generate` (Lesson 9) building 9 real
  rows, each itself built by a nested `List.generate` reading
  `board.valueAt(row, col)` (Lesson 17, reappearing) once per real cell.
- `board.isGivenAt(row, col)` — already given full treatment in Lesson
  17; reappearing here, unchanged, inside the second real
  `List.generate` pair, building `givenCells` the identical real way.

### CS Lens

Not a new hard concept here — this unit is **Mapping** (Terms, above)
in its simpler, single real direction; Concept Unit 2's own real
discovery is where the harder half of this same concept shows up.

### SE Lens

The real principle is **removing real duplication by naming the shared
logic once**. The alternative not chosen: leave `_cellsOf`/
`_givenCellsOf` exactly as they were, two independent real functions
always called together. The real tradeoff: one new, real factory
constructor, for the payoff Lesson 45's own Socratic prompt already
named directly — it's now structurally impossible to accidentally pass
`_cellsOf` for one board and `_givenCellsOf` for a different one, since
there's only one real call, on one real board, producing both real
values together. No new honest cost — this factory's own real body is
the identical real logic the two old functions already had, just
combined.

### Commands Needed

None yet — Concept Unit 2's own real verification covers both units
together, below.

### Run It

Not run standalone — verified together with Concept Unit 2, below,
since both real changes were made and tested in the same session.

### Connect

`SudokuBoardDto` can now build itself from a real board. Concept Unit 2
asks whether it can build a real board back.

---

## Concept Unit 2: DTO → Domain — A Real, Caught Bug

### The Problem

The obvious real approach: `SudokuBoard toBoard() => SudokuBoard
(cells);` — hand `cells` straight to `SudokuBoard`'s own existing,
default constructor. Does that actually work?

> **Socratic prompt:** `SudokuBoard`'s own default constructor infers a
> given clue with exactly one real rule: `initial[row][col] != null`.
> If a `SudokuBoardDto`'s own `cells` includes a real digit the *player*
> entered — not one of the puzzle's original givens — what would that
> rule conclude about that cell when rebuilding? Second: `givenCells` is
> `SudokuBoardDto`'s own *second* real field, entirely separate from
> `cells`. Does the naive `SudokuBoard(cells)` approach use it at all —
> and if not, what real information does it throw away?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`, lines 28-33
  (the real, original default constructor, read fresh this session) —
  this unit's own new constructor is a deliberate, real contrast against
  it, not a port of anything external.
- **Files affected:** `project/lib/sudoku_board.dart` (modified: adds
  `SudokuBoard.withState`); `project/lib/sudoku_board_dto.dart`
  (modified: adds `toBoard`); `project/test/sudoku_board_dto_test.dart`
  (new).
- **Change type:** add.
- **Location:** `sudoku_board.dart`, immediately after the default
  constructor; `sudoku_board_dto.dart`, after `fromBoard`.
- **Dependencies:** none.

### The New Code

```dart
SudokuBoard.withState(List<List<int?>> cells, List<List<bool>> givenCells)
    : _grid = List.generate(size, (row) => List.of(cells[row])),
      _isGiven = List.generate(size, (row) => List.of(givenCells[row]));
```

### Isolate and Discard

A real, throwaway lab, run first — before writing the fix above — to
actually check whether the naive approach was safe:

```dart
final original = SudokuBoard(_milestonePuzzle);
original.placeDigit(0, 2, 4); // a real player move, not a given clue
print('before: isGivenAt(0,2) = ${original.isGivenAt(0, 2)}');

final cells = List.generate(9, (r) => List.generate(9, (c) => original.valueAt(r, c)));
final rebuilt = SudokuBoard(cells); // the naive approach
print('after naive round-trip: isGivenAt(0,2) = ${rebuilt.isGivenAt(0, 2)}');

try {
  rebuilt.clearCell(0, 2);
  print('clearCell(0,2) succeeded');
} on InvalidMoveException catch (e) {
  print('clearCell(0,2) REJECTED: $e');
}
```

Real, captured output (`dart run`):

```
before: isGivenAt(0,2) = false
after naive round-trip: isGivenAt(0,2) = true
clearCell(0,2) REJECTED: InvalidMoveException: row 0, col 2 is a given clue and cannot be cleared
```

A real, genuine bug: `isGivenAt(0, 2)` flips from `false` to `true`
across the naive round trip, and the rebuilt board wrongly refuses to
let the player ever touch that real cell again — the naive approach
silently discards `givenCells`, exactly the real information the second
Socratic question above named directly. Discarded now — this lab's own
file never existed inside `project/`; `SudokuBoard.withState`, shown
above, is the real, permanent fix, using `givenCells` explicitly instead
of inferring it.

### Mechanical Walkthrough

- `SudokuBoard.withState(List<List<int?>> cells, List<List<bool>>
  givenCells)` — a real named constructor (Terms, above), this time on
  `SudokuBoard` itself rather than `SudokuBoardDto` — two real
  parameters instead of the default constructor's one.
- `: _grid = List.generate(size, (row) => List.of(cells[row]))` — a real
  constructor initializer (Lesson 11, reappearing), building `_grid`
  from `cells` directly — real, defensive copying (Lesson 17's own
  aliasing-trap lesson, reappearing): `List.of` makes a genuinely new
  real list per row, so this board's own future mutations never reach
  back into the caller's original `cells` list.
- `_isGiven = List.generate(size, (row) => List.of(givenCells[row]))` —
  the real fix itself: `_isGiven` is copied directly from `givenCells`,
  never inferred from `cells`, which is exactly what makes this
  constructor correctly distinguish a real given clue from a real
  player-filled digit.
- `SudokuBoard toBoard() => SudokuBoard.withState(cells, givenCells);`
  — a real arrow-bodied method (Lesson 9, reappearing) on
  `SudokuBoardDto`, calling the new real constructor with this DTO's own
  two real fields.

### CS Lens

**Round-tripping** (Terms, above) as a verification technique is a hard
concept — proving a mapping is lossless by actually reversing it, not
just checking one direction looks plausible.

```
Also recognized in: compression algorithms verified by decompressing
and diffing against the original, a database migration tested by
migrating forward then back, a text encoding verified by encoding then
decoding and comparing strings, a cryptographic scheme's own real
encrypt-then-decrypt correctness test
```

### SE Lens

The real principle is that **a mapping's correctness is not obvious
from its own code reading plausibly** — the naive `SudokuBoard(cells)`
approach reads like reasonable code; it compiles cleanly; `flutter
analyze` says nothing about it. Only a real, run round-trip test catches
the real problem. The alternative not chosen, now proven wrong by real
evidence rather than merely avoided by instinct: rebuild through the
existing default constructor, since `cells` "already has the data." The
real tradeoff for the fix: one new, real, second constructor, so
`SudokuBoard`'s own existing default constructor and every one of its
current, correct real callers (`InMemoryPuzzleRepository`, every
existing test) stay completely unaffected — this bug is fixed by
*adding* a correct path, not by changing the meaning of the one that
already works for its own real, different use case (a fresh puzzle,
where "non-null means given" genuinely is always true). The honest,
present cost: `SudokuBoard` now has two real constructors instead of
one, and a future reader has to know which real situation calls for
which.

### Commands Needed

- **`flutter analyze .` / `flutter test`** — run from `project/`, this
  session, after all real production and test files changed.

### Run It

Real, captured output, `flutter analyze .`:

```
33 issues found.
```

— up from Lesson 45's own 26; the seven new real issues are entirely
`sudoku_board_dto_test.dart`'s own new file, in the same two
already-established categories (`avoid_relative_lib_imports`,
`avoid_print`) every other test file already carries — zero new
categories, zero errors or warnings anywhere.

Real, captured output, `sudoku_board_dto_test.dart`'s own new,
permanent tests (run as part of the full `flutter test` pass):

```
PASS: fromBoard copies a real player-filled cell
PASS: fromBoard copies a real given cell too
PASS: fromBoard marks a real given cell as given
PASS: fromBoard marks a real player-filled cell as NOT given
PASS: the real player-filled value survives the round trip
PASS: the real player-filled cell is NOT locked as a given clue after the round trip — the exact real bug the default SudokuBoard constructor would have introduced
PASS: the rebuilt board genuinely still allows clearing that real cell
PASS: a real given cell is still given after the round trip
PASS: the rebuilt board still genuinely rejects overwriting a real given clue
9 tests run, 0 failed
```

Every other real, pre-existing test file passes unchanged, confirming
`main.dart`'s own rewiring (Concept Unit 1) still renders the identical
real app.

### Connect

Concept Unit 1's real mapping loses nothing going Domain → DTO — every
real field copies directly. This unit proves the reverse direction is
genuinely harder, catches the real information the naive approach would
have silently discarded, and fixes it with a second, real, honest
constructor rather than smoothing the bug over.

---

## Connect the Pieces

`main.dart` now builds exactly one real `SudokuBoardDto` per frame,
`SudokuBoardDto.fromBoard(session.board)`, replacing two real functions
that used to compute the identical data separately. That same DTO type
can also go the other way — `toBoard()` — not yet called by any real
production code, but real, tested, and correct, because Concept Unit 2
caught, with a real, run demonstration, the exact real bug a more naive
version would have shipped: a real player's own move, silently relocked
as an unchangeable given clue the moment it crossed the DTO boundary and
came back. `SudokuBoard.withState`, this lesson's own real fix, is now
sitting ready for Phase 6's own future job — reloading a saved,
in-progress game — to use directly, already proven correct by a real,
permanent test, months before that phase actually arrives.
