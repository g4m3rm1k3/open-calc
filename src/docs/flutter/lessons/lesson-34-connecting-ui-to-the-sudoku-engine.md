# Lesson 34: The Screen Meets the Rules

**What you will build:** `project/`'s own real screen stops pretending —
`_cells`, the plain, rule-free `List<List<int?>>` this phase has used
since Lesson 31, is replaced by a real, live `SudokuBoard`, the exact
same, fully-tested engine Phase 2 built with zero Flutter dependency and
has not been touched since. Tapping a digit now genuinely goes through
`SudokuBoard.placeDigit` — a real given clue can no longer be
overwritten, a real conflicting digit is genuinely rejected, both with a
real, visible error message — and given clues render visually distinct
(bold) for the first time, because the real engine can finally say,
honestly, which cells those are. Two real, honest discoveries happened
getting here: a classic `BuildContext` mistake, and a wrong assumption
about which digit was actually valid where — both kept, both fixed for
real. This is the last lesson of Phase 3.

**What you need to know first:**
- Lesson 5 — `final`.
- Lesson 6 — the real, corrected `switch`-fallthrough assumption, reused
  as the same discipline this lesson's own wrong test assumption is held
  to.
- Lesson 7 — nested loops, the real mechanism behind `_isSafe`'s own box
  scan, reused here unmodified.
- Lesson 9 — `.map`, the real index operator.
- Lesson 11 — encapsulation — `SudokuBoard`'s own real, private `_grid`/
  `_isGiven`, never exposed directly, is the exact real reason this
  lesson never has to reimplement a single Sudoku rule.
- Lesson 14 — domain errors — `InvalidMoveException`, thrown by
  `SudokuBoard.placeDigit`/`clearCell`, real and unchanged since Phase 2,
  finally caught by real UI code for the first time.
- Lesson 16 — the real proof that an uncaught, thrown error propagates
  up the call stack, reused as the real reasoning behind this lesson's
  own decision to catch `InvalidMoveException` rather than let it
  crash the app.
- Lesson 17 — `List.generate`, reused to build real, read-only snapshots
  of the engine's own live state for display.
- Lesson 18 — `candidatesFor`/`isValidMove`, the real methods
  `_isSafe` (Lesson 7's own real nested-loop check) ultimately backs —
  not called directly this lesson, but the real reason `placeDigit`
  rejects what it rejects.
- Lesson 21 — the real milestone puzzle's own cell `(4, 4)`, already
  proved there to be a naked single with exactly one true candidate,
  `5` — reused here to catch and fix this lesson's own real, wrong test
  assumption.
- Lesson 24 — the real, permanent `project/test/` convention.
- Lesson 25 — `BuildContext`, and the real, quoted fact that it *is* an
  `Element` — the exact real reason this lesson's own `ScaffoldMessenger`
  mistake happened the way it did.
- Lesson 26 — `MaterialApp`, `Scaffold`.
- Lesson 27 — the same real risk this lesson's own SE lens names again
  (two independent places that could disagree), first named there for
  test duplication.
- Lesson 28 — `StatefulWidget`/`State`/`setState`.
- Lesson 31 — `SudokuBoardView`/`SudokuCellView`, and the real,
  display-only `_displayPuzzle` this lesson finally retires.
- Lesson 32 — `onCellTap`, real selection state.
- Lesson 33 — `NumberPadView`/`_enterDigit`, and this lesson's own real,
  second discovery in the same code this unit modifies.

**Terms used in this lesson:**
- **Given-clue protection** — new: the real, specific rule that a cell
  present in the *original* starting puzzle can never be overwritten or
  cleared, enforced by `SudokuBoard` itself (Phase 2, unchanged), not by
  new UI code. It exists as this lesson's own most concrete proof of
  curriculum's own architectural point: the UI asks the engine, the
  engine decides, the UI shows the real answer.

**Objects and methods used:**

- **`SudokuBoard`**
  - *What it is:* reappearing in full from Phase 2 — the real,
    already-fully-tested Sudoku engine, completely unmodified since the
    Phase 2 milestone, now finally constructed and read by this
    project's own real UI for the first time.
  - *Implementation:* real, verbatim, from
    `project/lib/sudoku_board.dart` (read fresh this session): the real
    constructor, `SudokuBoard(List<List<int?>> initial) : _grid =
    List.generate(size, (row) => List.of(initial[row])), _isGiven =
    List.generate(size, (row) => List.generate(size, (col) =>
    initial[row][col] != null));`; `int? valueAt(int row, int col) =>
    _grid[row][col];`; `bool isGivenAt(int row, int col) =>
    _isGiven[row][col];`; `void placeDigit(int row, int col, int digit)`
    (quoted in full in this lesson's own next Concept Unit).
  - *Its use:* `_SudokuAppState._board`, a real, permanent field,
    constructed once from `_startingPuzzle`; every real digit this
    lesson's own UI shows or writes goes through it.
  - *Type:* a concrete class (see Lesson 11's own real, full CRC
    treatment for its complete architectural standing).
  - *Responsibility:* unchanged from Phase 2 — hold the real, current
    grid, know which cells are locked given clues, and enforce every
    real Sudoku rule through its own public methods, never exposing raw,
    uncontrolled grid access.
  - *Depends on:* a real starting `List<List<int?>>`, unchanged since
    Lesson 11's own constructor.
  - *Connects to:* constructed by `_SudokuAppState`; read by `_cells`/
    `_givenCells` (this lesson's own new getters); written to by
    `_enterDigit`, via `placeDigit`.
  - *Shape:* Phase 2's own real, finished product — this lesson is the
    first time it's used for anything other than its own tests.

- **`InvalidMoveException`**
  - *What it is:* reappearing in full from Lesson 14 — the real, custom
    domain error `SudokuBoard.placeDigit`/`clearCell` throw, naming
    exactly which real rule a move violated.
  - *Implementation:* real, verbatim, from `sudoku_board.dart`:
    `class InvalidMoveException implements Exception { final String
    message; InvalidMoveException(this.message); }`.
  - *Its use:* caught, for the first time in this project's own real UI
    code, inside `_enterDigit`'s own `try`/`on InvalidMoveException
    catch (e)` — its own real `message` field is shown directly to the
    real user via a real `SnackBar`.
  - *Type:* a concrete class implementing `Exception`.
  - *Responsibility:* unchanged from Lesson 14 — carry a real, specific,
    human-readable reason a move was rejected.
  - *Depends on:* a real `String` message, supplied at the real throw
    site inside `SudokuBoard`.
  - *Connects to:* thrown by `SudokuBoard.placeDigit`; caught by
    `_SudokuAppState._enterDigit`.
  - *Shape:* Phase 2's own real, already-tested error type — this lesson
    is the first time anything outside `project/test/
    sudoku_board_test.dart` actually catches one.

- **`ScaffoldMessenger` / `GlobalKey<ScaffoldMessengerState>`**
  - *What it is:* `ScaffoldMessenger` is the real, standard Material
    object that shows transient real messages (`SnackBar`s) above a
    real `Scaffold`; a `GlobalKey<ScaffoldMessengerState>` is a real,
    specific handle letting code reach a `ScaffoldMessengerState`
    directly, without needing a `BuildContext` positioned underneath it.
  - *Implementation:* real shape used here:
    `final _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();`,
    handed to `MaterialApp(scaffoldMessengerKey: _scaffoldMessengerKey,
    ...)`; called via `_scaffoldMessengerKey.currentState
    ?.showSnackBar(SnackBar(content: Text(e.message)))`.
  - *Its use:* this lesson's own real, direct fix for a real, triggered
    failure (below) — `_SudokuAppState`'s own `context` sits above the
    `ScaffoldMessenger` its own `build()` creates, so `ScaffoldMessenger
    .of(context)` cannot find one; the key sidesteps needing the right
    context entirely.
  - *Type:* a real, generic class, `GlobalKey<T extends State>`.
  - *Responsibility:* to give real, direct access to a specific real
    `State` object's own public API (here, `showSnackBar`) from
    anywhere holding the same key, regardless of `BuildContext`
    position.
  - *Depends on:* being handed to the exact real widget whose `State`
    it should reach (`MaterialApp`'s own `scaffoldMessengerKey:`).
  - *Connects to:* assigned once, as a real field; read inside
    `_enterDigit`.
  - *Shape:* a small, real, standard Flutter escape hatch for exactly
    this situation — reaching Material infrastructure from a context
    that doesn't sit underneath it.

---

## Concept Unit: A Real Engine Where Display Data Used to Be

### The Problem

Since Lesson 31, `_SudokuAppState` has held a plain, mutable
`List<List<int?>>` — real digits, but no real rules at all; any cell,
given or not, could be overwritten with anything. `project/lib/
sudoku_board.dart`'s own real `SudokuBoard` has enforced every Sudoku
rule since Phase 2, fully tested, completely unused by the UI until now.
What's the smallest real change that makes the UI ask *that* real object
instead of a bare list?

> **Pause and think:** Given `SudokuBoard`'s own real constructor takes
> the exact same real shape, `List<List<int?>>`, this project's own
> `_startingPuzzle` has always had — what real, minimal change would you
> expect turning `_cells` from a bare list into a real `SudokuBoard`
> instance to actually require in the rest of `_SudokuAppState`? Given
> `SudokuBoardView` expects a real `List<List<int?>>` for its own
> `cells:` parameter, and `SudokuBoard` deliberately never exposes its
> own real grid directly (Lesson 11's own encapsulation) — what real,
> small piece of code would need to exist to bridge the two?

### Project Change

**Reference Source:** `project/lib/sudoku_board.dart`, lines 18-37 (the
real, complete public read API: the constructor, `valueAt`,
`isGivenAt`), read fresh this session. **Files affected:**
`project/lib/main.dart`, modified; `project/lib/sudoku_board_view.dart`,
modified (a new, real, required `givenCells` parameter). **Change
type:** refactor; add. **Location:** `_SudokuAppState`'s own fields and
new getters; `SudokuBoardView`/`SudokuCellView`'s own constructors.
**Dependencies:** `import 'sudoku_board.dart';`, added to `main.dart`.

### The New Code

```dart
final SudokuBoard _board = SudokuBoard(_startingPuzzle);

List<List<int?>> get _cells {
  return List.generate(
    SudokuBoard.size,
    (row) => List.generate(SudokuBoard.size, (col) => _board.valueAt(row, col)),
  );
}

List<List<bool>> get _givenCells {
  return List.generate(
    SudokuBoard.size,
    (row) => List.generate(SudokuBoard.size, (col) => _board.isGivenAt(row, col)),
  );
}
```

### The Updated Project

The complete, real `_SudokuAppState`, with this unit's own new lines
marked (Concept Units 2-3's own additions shown in later units):

```dart
1  class _SudokuAppState extends State<SudokuApp> {
2    final SudokuBoard _board = SudokuBoard(_startingPuzzle);            // ← changed (was List<List<int?>> _cells)
3    int? _selectedRow = 4;
4    int? _selectedCol = 4;
5
6    List<List<int?>> get _cells {                                       // ← new
7      return List.generate(                                             // ← new
8        SudokuBoard.size,                                                // ← new
9        (row) => List.generate(SudokuBoard.size, (col) => _board.valueAt(row, col)),  // ← new
10     );                                                                  // ← new
11   }                                                                     // ← new
12
13   List<List<bool>> get _givenCells {                                   // ← new
14     return List.generate(                                              // ← new
15       SudokuBoard.size,                                                 // ← new
16       (row) => List.generate(SudokuBoard.size, (col) => _board.isGivenAt(row, col)),  // ← new
17     );                                                                   // ← new
18   }                                                                      // ← new
19
20   void _selectCell(int row, int col) {
21     setState(() {
22       _selectedRow = row;
23       _selectedCol = col;
24     });
25   }
26
27   // ...(_enterDigit — this lesson's own next two units)...
28
29   @override
30   Widget build(BuildContext context) {
31     return MaterialApp(
32       home: Scaffold(
33         appBar: AppBar(title: const Text('Sudoku')),
34         body: SingleChildScrollView(
35           padding: const EdgeInsets.all(16),
36           child: Column(
37             children: [
38               SudokuBoardView(
39                 cells: _cells,                                          // ← unchanged name, real different source
40                 givenCells: _givenCells,                                // ← new
41                 selectedRow: _selectedRow,
42                 selectedCol: _selectedCol,
43                 onCellTap: _selectCell,
44               ),
45               // ...
46             ],
47           ),
48         ),
49       ),
50     );
51   }
52 }
```

`SudokuBoardView`/`SudokuCellView` (`project/lib/sudoku_board_view.dart`)
each gained one new, real, `required` field —
`givenCells: List<List<bool>>` on the board, `isGiven: bool` on each
cell — read directly from `_board.isGivenAt`, for the first time letting
the UI honestly know which cells it must never let the player overwrite.

### Isolate and Discard

Not applicable — every construct here (`.map`/`List.generate`, getters,
real constructor calls) was already given a real, isolated lab in the
specific earlier lessons cited in this lesson's own Header.

### Mechanical Walkthrough

- `final SudokuBoard _board = SudokuBoard(_startingPuzzle);` — `final`,
  reappearing from Lesson 5: the *reference* to this one, real,
  permanent `SudokuBoard` is never reassigned — only the object it
  points to is ever mutated, through its own real, public methods,
  never by reaching into it directly (Lesson 11's own encapsulation,
  reappearing in full, now actually enforced against this project's own
  UI code, not just its own tests).
- `List<List<int?>> get _cells { return List.generate(...); }` — a real,
  computed getter (reappearing property-access syntax, extended here to
  a computed rather than stored value); `List.generate`, reappearing in
  full from Lesson 17; `_board.valueAt(row, col)`, this lesson's own
  `SudokuBoard` Header entry — real, current, on-demand read of the
  engine's own live state, recomputed fresh every time `_cells` is
  accessed, never stored or allowed to go stale.
- `List<List<bool>> get _givenCells { ... }` — the identical real
  pattern, reading `_board.isGivenAt(row, col)` instead — this lesson's
  own real, direct answer to "which cells are given," a fact the UI
  genuinely could not know on its own before this lesson, since
  `_displayPuzzle`'s own plain `null`/non-`null` values never
  distinguished "empty" from "given but currently blank" (an impossible
  state for a given clue, but the UI itself had no way to enforce that
  distinction before now).

### CS Lens

Reading `_board`'s own real state fresh, on every access, rather than
keeping a separately-maintained, potentially-stale copy in the UI
layer, is a real, working instance of **a single source of truth read
on demand** — the same real principle Lesson 32's own CS lens already
named for *selection* state, now applied to the *entire board's* own
real content.

```
Also recognized in: a database view computed fresh from underlying
tables rather than a manually-synchronized cache, a spreadsheet formula
cell recalculating from its real, current inputs rather than storing a
stale answer, a UI framework's own "derived state" pattern reading a
store directly rather than duplicating it into local component state
```

### SE Lens

The alternative — keeping the plain `List<List<int?>>` this phase
already had, and separately, manually enforcing given-clue protection
and conflict checking with new, UI-layer code — was rejected for exactly
the reason curriculum's own architecture insists on: Phase 2 already
built, and already fully tested (Lesson 24, 8/8 real tests passing),
every one of those rules once. Reimplementing them here would be real,
duplicated logic, with two independent, real places that could
disagree about whether a move is legal — precisely the risk Lesson 27's
own SE lens already named for a different reason (test duplication) and
Lesson 32's own SE lens named again for selection state; this lesson is
where that same principle finally applies to the real Sudoku rules
themselves, not just UI bookkeeping.

### Commands Needed

None beyond `flutter analyze`/`flutter test`, already explained.

### Run It

Deferred — `_enterDigit` still needs to be rewritten to actually call
`_board.placeDigit`; the Verification Rule's own Batching guidance
prefers one complete real run over this stage in isolation.

### Connect

`project/`'s own UI now reads the real engine's own real state — but
nothing yet writes to it through the engine's own real rules. The next
unit makes given clues genuinely un-overwritable.

---

## Concept Unit: Given Clues Are Now Real and Protected

### The Problem

`_enterDigit` still directly mutates a plain list (from before this
lesson's own first unit). `SudokuBoard.placeDigit` has thrown a real
`InvalidMoveException` for exactly "this cell is a given clue" since
Lesson 14 — completely unused by the UI until now. What's the smallest
real change that makes tapping a digit over a given clue actually fail,
visibly, instead of silently succeeding?

> **Pause and think:** Given `SudokuBoard.placeDigit`'s own real,
> already-quoted first check, `if (_isGiven[row][col]) { throw
> InvalidMoveException(...); }` — if `_enterDigit` simply calls
> `_board.placeDigit(row, col, digit)` directly and does nothing else,
> what real, concrete thing would happen the instant a given cell is
> targeted? Given Lesson 16's own real proof that an uncaught, thrown
> error propagates up the call stack — would you expect a real Flutter
> app to crash entirely if this specific real exception is never caught
> anywhere?

### Project Change

**Reference Source:** `project/lib/sudoku_board.dart`, lines 53-69 (the
real, complete `placeDigit` method), read fresh this session. **Files
affected:** `project/lib/main.dart`, modified. **Change type:**
refactor. **Location:** `_enterDigit`. **Dependencies:** unchanged.

### The New Code

```dart
void _enterDigit(int digit) {
  final row = _selectedRow;
  final col = _selectedCol;
  if (row == null || col == null) {
    return;
  }
  try {
    _board.placeDigit(row, col, digit);
    setState(() {});
  } on InvalidMoveException catch (e) {
    _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));
  }
}
```

### The Updated Project

The complete, real `_enterDigit`, with this unit's own new lines marked:

```dart
1  void _enterDigit(int digit) {
2    final row = _selectedRow;
3    final col = _selectedCol;
4    if (row == null || col == null) {
5      return;
6    }
7    try {                                                                // ← new
8      _board.placeDigit(row, col, digit);                                // ← changed (was _cells[row][col] = digit)
9      setState(() {});                                                    // ← changed (empty — real state already mutated)
10   } on InvalidMoveException catch (e) {                                 // ← new
11     _scaffoldMessengerKey.currentState?.showSnackBar(                   // ← new
12       SnackBar(content: Text(e.message)),                               // ← new
13     );                                                                   // ← new
14   }                                                                      // ← new
15 }
```

### Isolate and Discard

Not applicable — `try`/`on`/`catch` were already given a real, isolated
lab in Lesson 14; this lesson reuses that construct against a real,
already-existing exception type, unchanged.

### Mechanical Walkthrough

- `try { _board.placeDigit(row, col, digit); setState(() {}); }` —
  `try`, reappearing in full from Lesson 14: `placeDigit` is called
  first; if it returns normally (the move was legal), `setState(() {})`
  — an *empty* callback — still tells the framework to rebuild, because
  `_board`'s own internal state already changed the instant
  `placeDigit` returned, and the next `build()` will read it fresh via
  `_cells`, this lesson's own first unit.
- `on InvalidMoveException catch (e) { ... }` — `on`/`catch`,
  reappearing in full from Lesson 14, this time catching the exact real
  exception type `SudokuBoard` itself already, real, throws — not a new
  one invented for this lesson.
- `_scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));`
  — this lesson's own new `GlobalKey<ScaffoldMessengerState>` Header
  entry; `?.`, reappearing from Lesson 28's own null-aware method call;
  `e.message`, reading the real, specific string
  `InvalidMoveException`'s own real constructor stored — the exact real
  words `SudokuBoard` itself chose ("row X, col Y is a given clue and
  cannot be changed"), shown to the real user unchanged.

### Execution Trace

Real, run this session, via `flutter test test\number_pad_test.dart`:

```
the real engine rejects overwriting a given clue, with a real message
```

1. `tester.tap(...)` selects real cell `(0, 0)` — a real given clue,
   `5`, per `_startingPuzzle`.
2. `tester.tap(_padButton(9))` calls `_enterDigit(9)`.
3. `_board.placeDigit(0, 0, 9)` runs; its own real, first check,
   `if (_isGiven[0][0])`, is real-true; it throws a real
   `InvalidMoveException('row 0, col 0 is a given clue and cannot be
   changed')` — this lesson's own real, quoted evidence for exactly this
   line.
4. The real `catch` block runs instead of `setState`; the real board's
   own actual grid is completely untouched.
5. Real, final assertions: `(0, 0)`'s own real value is still `5`;
   `find.textContaining('given clue')` finds the real `SnackBar` text on
   screen.

A real, honest discovery happened building this exact test: the very
first real attempt used `ScaffoldMessenger.of(context)` (inside
`_SudokuAppState`, using its own `context`) instead of the real
`GlobalKey` shown above, and failed with a real, triggered error:

```
No ScaffoldMessenger widget found.
SudokuApp widgets require a ScaffoldMessenger widget ancestor.
```

Real, worked-out cause: `_SudokuAppState`'s own `context` is the real
`BuildContext` for `SudokuApp` itself — the widget whose own `build()`
*constructs* the `MaterialApp`/`Scaffold`/`ScaffoldMessenger` beneath
it. `.of(context)` searches upward from the given context for an
ancestor; there is genuinely nothing above `SudokuApp` providing a
`ScaffoldMessenger`, because `SudokuApp` is *above* the one it builds,
not beneath it. Lesson 25's own real, quoted fact — a `BuildContext`
*is*, concretely, an `Element` — makes this precise: `context` here is
literally `SudokuApp`'s own `Element`, sitting one level above the
`MaterialApp` `Element` it's about to construct. Fixed with the real
`GlobalKey<ScaffoldMessengerState>` shown in this unit's own New Code —
a real, direct handle that doesn't depend on tree position at all.

### CS Lens

Catching a real, specific exception type by name (`InvalidMoveException`)
and translating it into a real, user-facing message is a real, working
instance of **the boundary between a system's own internal error
representation and what a user actually needs to see** — the same real
idea underneath an HTTP API translating an internal database exception
into a real, specific `400 Bad Request` with a human-readable body.

```
Also recognized in: a compiler translating an internal parse-tree
inconsistency into a real, specific "unexpected token" message, a
banking app translating a real, internal `InsufficientFundsException`
into "You don't have enough balance for this transfer," a form
validator translating a regex mismatch into "Please enter a valid email"
```

### SE Lens

The alternative — letting `InvalidMoveException` propagate uncaught,
crashing the real app the instant any given clue was tapped — was
rejected because Lesson 16's own real event-loop understanding already
implies an uncaught real exception is a genuine, user-visible failure,
not a graceful one; a real Sudoku app that crashes on the single most
common real player mistake (trying to overwrite a clue) would be a
genuinely broken product. The real cost of catching it instead: every
new kind of real rejection `SudokuBoard` might ever throw needs its own
real, considered handling here too — currently, this lesson's own
`catch` block handles every `InvalidMoveException` identically (show its
own message), a real, deliberate simplicity choice that a future lesson
could refine (different real visual treatment for "given clue" versus
"conflict," for instance) without needing to change `SudokuBoard`
itself at all.

### Commands Needed

None beyond `flutter test`, already explained.

### Run It

Real, captured output, this session — shown above in the Execution
Trace.

### Connect

Given clues are now genuinely protected by the real engine, not merely
displayed differently. The last unit proves the engine's other real job
— rejecting genuine conflicts — works the same real way.

---

## Concept Unit: Real Conflicts Are Now Rejected Too

### The Problem

`_enterDigit` now correctly rejects a tap on a given clue. `SudokuBoard
.placeDigit`'s own real, second and third checks — an out-of-range
digit, and a real row/column/box conflict via `_isSafe` — throw the
exact same real `InvalidMoveException` type. Does the real code already
written in the previous unit handle those too, or does something
specific to "given clue" need to change?

> **Pause and think:** Given the previous unit's own real `catch`
> block catches `InvalidMoveException` generically — not a specific
> given-clue-only exception type — what would you predict happens,
> already, without any further code changes, the instant a real,
> conflicting (but not given) digit is tapped? Given this project's own
> real milestone puzzle, and column `4` already holding a real `7` at
> `(0, 4)` — if cell `(4, 4)` (empty, selected by default) receives a
> tapped `7`, what real, specific rejection message would you expect,
> based on `placeDigit`'s own real, quoted source?

### Project Change

**Reference Source:** `project/lib/sudoku_board.dart`, lines 60-67 (the
real digit-range and conflict checks inside `placeDigit`), read fresh
this session. **Files affected:** `project/test/number_pad_test.dart`,
extended (a real, permanent test; no further changes to
`project/lib/main.dart` — this unit's own real point is that none were
needed). **Change type:** add (tests only). **Dependencies:** unchanged.

### The New Code

```dart
testWidgets('the real engine rejects a digit that conflicts, with a real message', (
  WidgetTester tester,
) async {
  await tester.pumpWidget(const SudokuApp());

  await tester.tap(_padButton(7));
  await tester.pump();

  final stillEmpty = tester.widget<SudokuCellView>(
    find.byWidgetPredicate((widget) => widget is SudokuCellView && widget.row == 4 && widget.col == 4),
  );
  expect(stillEmpty.value, isNull);
  expect(find.textContaining('row, column, or 3x3 box'), findsOneWidget);
});
```

### The Updated Project

Not applicable — no production code changed in this unit; the real test
file's own complete, updated content already appears in this lesson's
own closing evidence.

### Isolate and Discard

Not applicable — reuses the real, already-established `_padButton`
helper and `SudokuCellView` inspection pattern from earlier units and
Lesson 33.

### Execution Trace

Real, run this session, via `flutter test test\number_pad_test.dart`:

```
the real engine rejects a digit that conflicts, with a real message
```

1. A real, first, genuinely wrong assumption: this test originally
   expected `7` to be *accepted* at `(4, 4)`, and failed —
   `Expected: <7>`, `Actual: <null>` — not a bug in `_enterDigit`, but a
   correct, real rejection this test's own author (this lesson) hadn't
   verified against the real puzzle data first.
2. Real cause, worked out directly: column `4` already holds a real `7`
   at row `0` (`_startingPuzzle[0][4] == 7`); `SudokuBoard._isSafe`,
   unchanged since Lesson 7, correctly finds that real conflict and
   returns `false`; `placeDigit`'s own real, quoted third check throws
   `InvalidMoveException('7 already appears in that row, column, or 3x3
   box')`.
3. Real fix: since Lesson 21 had already, honestly, established that
   `(4, 4)`'s one true candidate is `5`, the *other* real test in this
   same file (Concept Unit 1's own "tapping a digit places it into the
   real selected cell") was corrected to use `5`; *this* test kept `7`
   deliberately, now correctly asserting the real rejection instead of a
   wrongly-assumed success.
4. Real, final assertions: `(4, 4)`'s own value is still `null` — the
   real, attempted `7` never landed; `find.textContaining('row, column,
   or 3x3 box')` finds the real, exact rejection text `_isSafe`'s own
   real, quoted failure produces.

### CS Lens

This unit's own real false start — assuming a digit would be accepted
without checking the real, existing puzzle data first — is a real,
direct instance of **verifying an assumption against ground truth
before trusting it**, the exact same discipline this whole curriculum
has practiced since Lesson 6's own corrected `switch`-fallthrough
assumption: a plausible-sounding guess, checked for real, and revised
once real evidence disagreed.

```
Also recognized in: a scientist's own hypothesis revised after a real
experiment's own real data, a code reviewer catching an assumption a
test's own comment states but the test itself never actually verifies,
a chess engine's own opening-book assumption overridden the instant
real search finds a concrete refutation
```

### SE Lens

The alternative — writing this real test without first checking whether
`7` was actually a legal digit at `(4, 4)` — is exactly the mistake this
unit's own real run caught, immediately, with a real, specific,
diagnosable failure (`Expected: <7>`, `Actual: <null>`), rather than a
silent, wrong test that happened to pass for the wrong reason. The real
cost of verifying every test assumption against real data first: more
real lookups before writing an assertion — a small, real, worthwhile
price this curriculum has paid, deliberately, every time a "genuine,
honestly-reported false start" appears in one of its own lessons.

### Commands Needed

None beyond `flutter test`, already explained.

### Run It

Real, captured output, this session — shown above in the Execution
Trace; the complete, final real suite output is shown in this lesson's
own closing section.

### Connect

Every real Sudoku rule `SudokuBoard` has enforced since Phase 2 — given-
clue protection, row/column/box conflicts — now genuinely, visibly
governs `project/`'s own real, playable screen, with zero new rule
logic written anywhere in the UI layer.

---

## Connect the Pieces

Follow the real digit `5` — cell `(4, 4)`'s own one true candidate,
established for real back in Lesson 21 — through everything this
lesson, and this whole phase, built:

1. `_SudokuAppState._board` (Concept Unit 1) is a real, live
   `SudokuBoard`, constructed once from `_startingPuzzle` — the exact
   same real grid `bin/sudoku_console.dart`'s own console game has used
   since the Phase 1 milestone.
2. `_cells`/`_givenCells`, two real, computed getters, read `_board`'s
   own real `valueAt`/`isGivenAt` fresh, every time `SudokuBoardView`
   rebuilds — real, live data, never a separately-maintained,
   potentially-stale copy.
3. A real, simulated tap selects cell `(4, 4)`; a real, simulated tap on
   the number pad's own real "5" button calls `_enterDigit(5)`
   (Concept Unit 2), which calls `_board.placeDigit(4, 4, 5)` —
   Phase 2's own real, unmodified method, checking (in order): is this a
   given clue (no); is `5` a valid digit (yes); does `5` conflict with
   any real, existing row/column/box value (no — `5` is genuinely this
   cell's one true candidate) — and commits it, for real, to `_board`'s
   own internal grid.
4. `setState(() {})` triggers a real rebuild; `_cells` reads the new
   real `5` back out; `SudokuBoardView` shows it, real, on screen.
5. Attempting the same real action against a given clue (Concept Unit
   2), or a genuinely conflicting digit like `7` at that same cell
   (Concept Unit 3), instead throws a real, specific
   `InvalidMoveException` — caught, and shown, honestly, to the real
   user, with zero new rule-checking code written anywhere in
   `project/lib/main.dart` or `sudoku_board_view.dart`.

Real, final, complete evidence — the whole real test suite, run
together this session:

```
tapping a real cell in the real running app moves the real selection
every real cell provides real Material touch feedback
tapping a digit places it into the real selected cell
a digit tap only changes the real selected cell, no others
the real engine rejects overwriting a given clue, with a real message
the real engine rejects a digit that conflicts, with a real message
tapping Start New Game increments the real, on-screen count
the elapsed-time counter ticks once per real second
every real cell shows its own given digit, or nothing
cells on a 3x3 boundary get a real, thicker border
exactly the real selected cell gets the real highlight color
a real given clue renders bold; a player-fillable cell does not
tapping a real cell reports its own real row and column
the real body has 16px padding on every side
the elapsed and games-started text sit side by side
the Sudoku shell shows a title and a real board
PASS: (8 real Sudoku-engine tests, unchanged from Lesson 24)
All tests passed!
```

And a real, final screenshot (`verification/lesson-34/
final-app-chrome.png`) — the real milestone puzzle, real 3×3 borders,
cell `(4, 4)` genuinely highlighted, waiting for the one real digit that
belongs there.

---

## Phase 3 milestone — a real, playable Sudoku app, its own real engine

untouched since Phase 2 — done.

Curriculum's own architectural point, stated at the very start of
Phase 3, is now real and concrete, not aspirational:

```
Flutter UI
     ↓
Game/application layer
     ↓
Sudoku engine
```

`project/lib/sudoku_board.dart` — 411 real lines, every method built
across Phase 2, fully tested (Lesson 24, 8/8) — required **zero
changes** to become this real app's own actual rule enforcement. Every
real Flutter concept Phase 3 taught — `Widget`/`Element`/`RenderObject`
(Lesson 25), the real app shell (Lesson 26), reusable widget classes
(Lesson 27), `State`/`setState` (Lesson 28), layout (Lessons 29-30), a
real 9×9 board (Lesson 31), real interaction (Lesson 32), real input
(Lesson 33) — culminates here, in one real, playable screen, governed
by rules this project proved correct two phases ago and never had to
prove again.

## Phase 3 (Lessons 25-34) is now fully complete.

Per `project_flutter_curriculum_checkpoints`: checkpoints happen at
phase boundaries. This is one — pause here for user review before
starting Phase 4 (state management — Riverpod), the same convention
Phases 1 and 2 both followed.
