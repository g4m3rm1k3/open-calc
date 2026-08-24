# Lesson 37: One Real Direction for Every User Action

**What you will build:** `project/lib/game_intent.dart` — a new,
permanent, three-class file naming exactly two things a player can do in
this app (select a cell, enter a digit) as plain, real data — plus a
real refactor of `project/lib/main.dart`, replacing its own two,
independent `_selectCell`/`_enterDigit` handler methods (each separately
deciding, in one step, both *what happened* and *how to react to it*)
with one single, real choke point, `_dispatch`, that every user action
in this app now funnels through. This is curriculum's own diagram, made
real and literal: `User action → Intent → State change → New state →
UI`. Behavior is provably unchanged — every existing widget test still
passes without modification — because this lesson is a pure refactor of
*shape*, not a change to *what* the app does.

**What you need to know first:**
- Lesson 5 — `final`.
- Lesson 6 — `switch`, reappearing here with real, new case-label syntax.
- Lesson 8 — arrow-function bodies (`=>`).
- Lesson 10 — the `is` type-check operator, reused conceptually to
  contrast with this lesson's own new object-pattern syntax.
- Lesson 11 — constructor-shorthand fields (`this.row`).
- Lesson 12 — `extends`, and `sealed`, named narrowly there (inside a
  quoted `dart:core` signature) — this lesson gives it its own real,
  full, hands-on treatment for the first time.
- Lesson 13 — exhaustive `switch` over an enum, and the real,
  compiler-enforced error a missing case produces — reused directly this
  lesson, over a sealed class hierarchy instead of an enum.
- Lesson 14 — `InvalidMoveException`, the real domain error `_dispatch`
  already catches, unchanged in shape this lesson.
- Lesson 15 — anonymous functions, reused for this lesson's own new
  `(row, col) => _dispatch(...)`/`(digit) => _dispatch(...)` callbacks.
- Lesson 28 — `setState`.
- Lesson 31 — `SudokuBoardView.onCellTap`.
- Lesson 33 — `NumberPadView.onDigitTap`.
- Lesson 34 — `_enterDigit`'s own real, original body — quoted again
  here in full before this lesson replaces it — and `InvalidMoveException`.
- Lesson 35 — shared state (`_selectedRow`/`_selectedCol`/`_board`,
  reused unchanged) and the real, honest gap this lesson's own new
  `_dispatch` does not yet fix (that's Lesson 40's job).
- Lesson 36 — `GameSession`, not yet wired into `main.dart` — this
  lesson's own `_dispatch` still updates `_board` directly, the same as
  before; giving `_dispatch` a real `GameSession` to update instead is a
  later lesson's own job.

**Pipeline diagram.** Curriculum's own state-management pipeline, named
for the first time this lesson, now built for real:

```
User action
    ↓
Intent
    ↓
State change
    ↓
New state
    ↓
UI
```

Concrete value carried through every stage: a real tap on cell `(0, 0)`.
**User action** — a real finger (or test-simulated) press on
`SudokuCellView`'s own `InkWell` (Lesson 32). **Intent** — this lesson's
own new stage: that tap now constructs a real `SelectCellIntent(0, 0)`
object before anything else happens. **State change** — `_dispatch`,
this lesson's own new single choke point, pattern-matches the real
intent and runs `setState(() { _selectedRow = 0; _selectedCol = 0; })`.
**New state** — `_SudokuAppState`'s own real fields now hold `0`/`0`.
**UI** — Flutter's own real framework (Lesson 25) rebuilds
`SudokuBoardView`, moving the real highlight.

**Terms used in this lesson:**
- **Intent** — new: a real, plain data object naming *what a user did*,
  deliberately carrying no logic at all for *how to respond* to it. It
  exists to separate two real jobs that were previously fused into one
  method call each: recognizing an action, and reacting to it — keeping
  them apart is what makes a single, later choke point (`_dispatch`)
  possible at all.
- **Unidirectional data flow** — new, hard concept (curriculum's own
  named Lesson 37 topic): a real architectural rule that data is only
  ever allowed to travel through a fixed sequence of stages, in one
  direction, never skipping a stage or flowing backward outside it. It
  exists because, without a rule like this, any part of an app could
  change state from anywhere, in any order, making it genuinely
  impossible to reason about what caused a given change after the fact
  — Lesson 35's own real, proved gap (a button that silently didn't do
  what it claimed) is exactly the kind of confusion a real, enforced
  single direction is meant to prevent.
- **Sealed class** — reappearing (named narrowly in Lesson 12, inside a
  quoted `dart:core` signature; full treatment for the first time here):
  a real class whose complete set of direct subclasses must all be
  declared in the same real library (file) as the sealed class itself —
  no code outside that file can add a new one. It exists specifically to
  let Dart's own compiler know, with total certainty, every real shape a
  value of that type could possibly be — the exact real mechanism behind
  this lesson's own exhaustiveness checking, below.
- **Object pattern** — new: real Dart 3 syntax inside a `switch` case
  label — `SelectCellIntent(row: final row, col: final col)` — that
  simultaneously checks a value's real runtime type *and* pulls its real
  field values out into new local variables, in one step. It exists to
  replace what would otherwise take two separate real steps (an `is`
  check, Lesson 10, followed by manually reading each field) with one.
- **Exhaustiveness checking** — reappearing (Lesson 13, there applied to
  an enum's real, fixed set of values): the real compiler guarantee that
  a `switch` covering every real case of a closed type is verified
  complete at compile time, with a real, specific error the instant a
  case goes missing. This lesson applies the identical real guarantee to
  a **sealed class** hierarchy instead of an enum — proving, for real,
  that the same mechanism generalizes.

**Objects and methods used:**

- **`GameIntent`**
  - *What it is:* this lesson's own new, real, sealed base class — the
    complete, closed real set of things a player can ask this app to do.
  - *Implementation:* real, complete, from `project/lib/game_intent.dart`:
    `sealed class GameIntent {}` — no fields or methods of its own.
  - *Its use:* the real, common type both `SelectCellIntent` and
    `EnterDigitIntent` extend; `_dispatch`'s own parameter type, so it
    can accept either real subtype.
  - *Type:* an abstract-in-effect, sealed class (Dart does not require
    the `abstract` keyword for a class with no instantiable body of its
    own, though this one is never constructed directly either way).
  - *Responsibility:* to exist purely as a real, closed umbrella type —
    it does no work itself; its entire job is letting the compiler know
    the complete real list of what can extend it.
  - *Depends on:* nothing.
  - *Connects to:* extended by `SelectCellIntent`/`EnterDigitIntent`;
    accepted as `_dispatch`'s own parameter type.
  - *Shape:* a small, new, permanent file of its own — `project/lib/
    game_intent.dart` — this project's first file holding no widgets and
    no Sudoku rules at all, only real, named user actions.

- **`SelectCellIntent`/`EnterDigitIntent`**
  - *What it is:* two real, concrete subclasses of `GameIntent`, each
    carrying exactly the real data its own action needs and nothing
    else.
  - *Implementation:* real, complete: `class SelectCellIntent extends
    GameIntent { SelectCellIntent(this.row, this.col); final int row;
    final int col; }` and `class EnterDigitIntent extends GameIntent {
    EnterDigitIntent(this.digit); final int digit; }`.
  - *Its use:* constructed directly at each real tap site —
    `SudokuBoardView`'s own `onCellTap` callback builds a
    `SelectCellIntent`; `NumberPadView`'s own `onDigitTap` callback
    builds an `EnterDigitIntent` — then immediately handed to
    `_dispatch`.
  - *Type:* two concrete classes, each extending the real, sealed
    `GameIntent`.
  - *Responsibility:* hold exactly the real data one specific user
    action needs to be handled later, and nothing about *how* to handle
    it.
  - *Depends on:* real `int` arguments, supplied at each real
    construction site.
  - *Connects to:* constructed inside `_SudokuAppState.build()`; matched
    and destructured by `_dispatch`'s own real `switch`.
  - *Shape:* the real, complete, closed set of `GameIntent`'s own
    subclasses — `sealed` guarantees no third one can exist anywhere
    else in this codebase without also being declared right here.

- **`_SudokuAppState._dispatch`**
  - *What it is:* this lesson's own new, single, real method — every
    user action in this app now reaches `setState` only by passing
    through here first.
  - *Implementation:* real, complete, from `project/lib/main.dart`
    (shown in full in this lesson's own Concept Unit 2).
  - *Its use:* replaces `_selectCell`/`_enterDigit` (Lessons 32/34)
    entirely — both real behaviors now live inside one method's own real
    `switch`.
  - *Type:* a real instance method, `void _dispatch(GameIntent intent)`.
  - *Responsibility:* to be the one, single, real place a `GameIntent`
    is turned into an actual change to `_SudokuAppState`'s own fields —
    curriculum's own "State change" stage, made literal.
  - *Depends on:* a real `GameIntent` value; `_board`, `_selectedRow`/
    `_selectedCol`, and `_scaffoldMessengerKey` (all pre-existing real
    fields, Lessons 32/34/35).
  - *Connects to:* called from `build()`'s own two real callback
    closures; internally calls `setState`, `_board.placeDigit`, and
    `_scaffoldMessengerKey.currentState?.showSnackBar`.
  - *Shape:* `_SudokuAppState`'s own new real center of gravity — every
    other method that used to independently call `setState` no longer
    does.

---

## Concept Unit: Naming What Happened — `GameIntent`

### The Problem

`_selectCell` and `_enterDigit` (Lessons 32/34) each do two real jobs at
once, fused into a single method call: recognizing that a specific
action occurred, and immediately deciding how to react to it. Nothing in
this app currently has a name for "the player tapped a cell" as its own
real, separate thing — only the *reaction* to it exists in code.

> **Pause and think:** Given `_selectCell(int row, int col)` and
> `_enterDigit(int digit)` are two separate, real methods today — if you
> wanted one single, real place in this codebase where you could see
> *everything* a player is capable of doing to this app, all at once,
> without reading every widget's own callback wiring — where would you
> look, and does that place currently exist? Given Lesson 13's own real,
> compiler-enforced enum exhaustiveness (every `Difficulty` case must be
> handled, or the compiler complains) — what would it take to get that
> same real guarantee for "every kind of user action this app supports,"
> if user actions were their own real type instead of just method calls?

### Project Change

**Reference Source:** no reference counterpart — a from-scratch
addition; curriculum's own Lesson 37 diagram (`User action → Intent →
...`) names the shape, not an existing file. **Files affected:**
`project/lib/game_intent.dart`, created. **Change type:** add.
**Location:** new file. **Dependencies:** none.

### The New Code

```dart
sealed class GameIntent {}

class SelectCellIntent extends GameIntent {
  SelectCellIntent(this.row, this.col);
  final int row;
  final int col;
}

class EnterDigitIntent extends GameIntent {
  EnterDigitIntent(this.digit);
  final int digit;
}
```

### The Updated Project

Not applicable — this is a brand-new file with nothing surrounding it
yet; the code shown above already is the file's own complete, real
content.

### Isolate and Discard

Real, throwaway lab, `verification/lesson-37/pattern_match_probe.dart`,
run this session, then discarded (no project dependency at all —
`sealed class Shape`/`Circle`/`Square`, standing in generically for
`GameIntent`/`SelectCellIntent`/`EnterDigitIntent`):

```dart
sealed class Shape {}

class Circle extends Shape {
  Circle(this.radius);
  final double radius;
}

class Square extends Shape {
  Square(this.side);
  final double side;
}

double area(Shape shape) => switch (shape) {
      Circle(radius: final r) => 3.14159 * r * r,
      Square(side: final s) => s * s,
    };

void main() {
  print(area(Circle(2)));
  print(area(Square(3)));
}
```

Real, captured output:

```
12.56636
9.0
```

This is exactly this lesson's own real `GameIntent` shape, isolated:
one real `sealed` base class, two real concrete subclasses, and a real
`switch` that inspects *and* destructures each one in the same case
label — this lesson's own new **object pattern** term, proved here
before the next unit builds `_dispatch` around the identical real
mechanism. A second real, deliberately broken copy,
`pattern_match_non_exhaustive_error.dart`, removed the `Square` case
entirely and ran `dart analyze` against it — real, captured output:

```
error - ...: The type 'Shape' isn't exhaustively matched by the switch cases since it doesn't match the pattern 'Square()'. Try adding a wildcard pattern or cases that match 'Square()'. - non_exhaustive_switch_expression
```

Both real files are discarded now — neither is part of `project/` — but
both proofs (the real, correct run, and the real, triggered error) are
preserved permanently in `verification/lesson-37/`.

### Mechanical Walkthrough

- `sealed class GameIntent {}` — this lesson's own new **sealed class**
  Header term, given its full, real treatment for the first time:
  `sealed` (reappearing the bare word from Lesson 12, now fully
  explained) tells the real Dart compiler that every direct subclass of
  `GameIntent` must live in this same real file — no other file in this
  project, or any future package, could add a third kind of intent
  without editing this exact file. `{}` — an empty real class body:
  `GameIntent` itself carries no data or behavior; it exists purely as a
  real, closed umbrella.
- `class SelectCellIntent extends GameIntent {` / `class
  EnterDigitIntent extends GameIntent {` — `extends`, reappearing in
  full from Lesson 12: two real, ordinary subclasses — nothing about
  `sealed` changes how a subclass itself is declared, only where it's
  allowed to live.
- `SelectCellIntent(this.row, this.col);` / `EnterDigitIntent
  (this.digit);` — reappearing in full from Lesson 11: real
  constructor-shorthand parameters, assigning each real constructor
  argument straight to a same-named field.
- `final int row;` / `final int col;` / `final int digit;` — three real,
  `final` fields (Lesson 5, reappearing): each intent is a real, small,
  immutable value once constructed — nothing about *handling* the
  action lives on these classes at all, only the real data describing
  it.
- `double area(Shape shape) => switch (shape) { Circle(radius: final r) => ..., Square(side: final s) => ... };`
  — from the isolation lab: `switch` as a real *expression* (reappearing
  the keyword from Lesson 6, which only ever used it as a *statement*
  before) — each `case` is now this lesson's own new **object pattern**:
  `Circle(radius: final r)` checks, in one real step, that `shape` is
  genuinely a `Circle` *and* extracts its real `radius` field into a
  brand-new local variable named `r`, declared right there with `final`
  (reappearing from Lesson 5, in a genuinely new position: a pattern's
  own binding, not an ordinary variable declaration).
- The real, triggered analyzer error — removing the `Square` case and
  re-running `dart analyze` — is this lesson's own real proof of
  **exhaustiveness checking**, reappearing from Lesson 13: the real
  compiler already knows, from `sealed`'s own real guarantee, that
  `Shape` can only ever be a `Circle` or a `Square` — nothing else is
  possible — so a `switch` missing either one is caught at real compile
  time, before the code could ever run and silently fall through.

### CS Lens

`GameIntent` and its real, closed set of subclasses is a real, working
instance of a **sum type** (also called a tagged union or algebraic data
type) — a real type whose every possible value is one of a small,
completely enumerable set of alternatives, each potentially carrying its
own different real data.

```
Also recognized in: Rust's own `enum` (not Dart's — Rust's own richer
kind, each variant able to carry different real fields), TypeScript's
own "discriminated union" pattern, a Protocol Buffers `oneof` field,
Haskell's own algebraic data types — the same real idea recurring under
a different name in nearly every language with real, modern type-safety
features
```

### SE Lens

The alternative — keeping `_selectCell`/`_enterDigit` as two,
independent, ordinary method calls, with no shared real type describing
"a user action" at all — was Phase 3's own real, working choice for four
whole lessons (31-34), and nothing about it was ever technically broken.
The real cost it was quietly accumulating: every new kind of action
(Lesson 39's dependency-injected testing needs, Lesson 40's real state
machine transitions) would mean one more independent method, with no
real, compiler-enforced guarantee that anything ever sees the *complete*
real list of what this app supports doing. The real cost of the
`GameIntent` approach instead: two new small classes and one new file,
for a real app currently supporting exactly two actions — a genuine,
honest amount of ceremony that only starts paying for itself once a
third and fourth real action need to be added, which Lesson 40 is about
to do.

### Commands Needed

- `dart run pattern_match_probe.dart` — the established `dart run`
  invocation.
- `dart analyze pattern_match_non_exhaustive_error.dart` — the
  established `dart analyze` invocation (Lesson 5), given one specific
  real file.

### Run It

Real, captured output — shown above in Isolate and Discard.

### Connect

`GameIntent` now exists as a real, closed, nameable set of everything a
player can do. The next unit builds the one real place that actually
reacts to one.

---

## Concept Unit: One Real Choke Point — `_dispatch`

### The Problem

`_selectCell` and `_enterDigit` still exist, unchanged, as two separate
real methods, each independently calling `setState`. Now that
`GameIntent` names both real actions as data, where should the real
logic that reacts to each one actually live?

> **Pause and think:** Given the isolation lab's own real `switch`
> expression already proved a sealed hierarchy can be matched and
> destructured in one place — what would it look like to replace *two*
> separate real methods with *one* real method containing a `switch`
> over `GameIntent`? Given `_enterDigit`'s own real body already has to
> check `_selectedRow`/`_selectedCol` for `null` and catch a real
> `InvalidMoveException` (Lesson 34) — should that real logic move,
> unchanged, into one of the new `switch` cases, or does it need to
> change to fit?

### Project Change

**Reference Source:** `project/lib/main.dart`, the real, complete,
pre-refactor `_selectCell`/`_enterDigit` methods (Lessons 32/34), quoted
in full below before being replaced. **Files affected:**
`project/lib/main.dart`, modified. **Change type:** replace.
**Location:** `_SudokuAppState`, replacing the two named methods with
one `_dispatch` method; `build()`'s own `SudokuBoardView`/`NumberPadView`
constructor calls updated to match. **Dependencies:** `import
'game_intent.dart';`, added to `main.dart`.

The real, complete methods being replaced, quoted in full (Lessons
32/34, unchanged until now):

```dart
void _selectCell(int row, int col) {
  setState(() {
    _selectedRow = row;
    _selectedCol = col;
  });
}

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

### The New Code

```dart
void _dispatch(GameIntent intent) {
  switch (intent) {
    case SelectCellIntent(row: final row, col: final col):
      setState(() {
        _selectedRow = row;
        _selectedCol = col;
      });
    case EnterDigitIntent(digit: final digit):
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
}
```

### The Updated Project

The complete, real `_SudokuAppState` class, this unit's own changed
lines marked, numbered:

```dart
1   class _SudokuAppState extends State<SudokuApp> {
2     final SudokuBoard _board = SudokuBoard(_startingPuzzle);
3     final _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
4     int? _selectedRow = 4;
5     int? _selectedCol = 4;
6
7     List<List<int?>> get _cells {
8       return List.generate(
9         SudokuBoard.size,
10        (row) => List.generate(SudokuBoard.size, (col) => _board.valueAt(row, col)),
11      );
12    }
13
14    List<List<bool>> get _givenCells {
15      return List.generate(
16        SudokuBoard.size,
17        (row) => List.generate(SudokuBoard.size, (col) => _board.isGivenAt(row, col)),
18      );
19    }
20
21    void _dispatch(GameIntent intent) {                                       // ← replaced _selectCell/_enterDigit
22      switch (intent) {                                                        // ← new
23        case SelectCellIntent(row: final row, col: final col):                 // ← new
24          setState(() {                                                        // ← new
25            _selectedRow = row;                                                 // ← new
26            _selectedCol = col;                                                 // ← new
27          });                                                                    // ← new
28        case EnterDigitIntent(digit: final digit):                             // ← new
29          final row = _selectedRow;                                            // ← new
30          final col = _selectedCol;                                            // ← new
31          if (row == null || col == null) {                                    // ← new
32            return;                                                             // ← new
33          }                                                                      // ← new
34          try {                                                                  // ← new
35            _board.placeDigit(row, col, digit);                                  // ← new
36            setState(() {});                                                      // ← new
37          } on InvalidMoveException catch (e) {                                  // ← new
38            _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));  // ← new
39          }                                                                        // ← new
40      }                                                                            // ← new
41    }
42
43    @override
44    Widget build(BuildContext context) {
45      return MaterialApp(
46        scaffoldMessengerKey: _scaffoldMessengerKey,
47        home: Scaffold(
48          appBar: AppBar(title: const Text('Sudoku')),
49          body: SingleChildScrollView(
50            padding: const EdgeInsets.all(16),
51            child: Column(
52              children: [
53                SudokuBoardView(
54                  cells: _cells,
55                  givenCells: _givenCells,
56                  selectedRow: _selectedRow,
57                  selectedCol: _selectedCol,
58                  onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),  // ← changed
59                ),
60                const SizedBox(height: 16),
61                NumberPadView(onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit))),  // ← changed
62                const SizedBox(height: 16),
63                const _SessionStatus(),
64              ],
65            ),
66          ),
67        ),
68      );
69    }
70  }
```

`_SudokuAppState` now has exactly one real method (`_dispatch`, lines
21-41) that ever calls `setState` on this class's own behalf; `build()`
itself (lines 43-69) constructs a real `GameIntent` at each of its two
real callback sites (lines 58, 61) and hands it straight to `_dispatch`,
rather than calling two separately-named handler methods directly.

### Isolate and Discard

Not applicable — this unit reuses the identical real mechanism the
previous unit's own isolation lab already proved (`sealed`/object
patterns/exhaustiveness); no new language construct is introduced here,
only its application to this project's own real code.

### Mechanical Walkthrough

- `void _dispatch(GameIntent intent) {` — a real, new method, its one
  real parameter typed as `GameIntent` (this lesson's own Header entry)
  — able to accept either real subtype, since both `extends` it.
- `switch (intent) {` — `switch`, reappearing in full from Lesson 6 —
  used here as a real *statement* (each case runs real statements —
  `setState`, `try`/`catch` — not just producing one expression value,
  unlike the isolation lab's own `switch` expression).
- `case SelectCellIntent(row: final row, col: final col):` — this
  lesson's own new **object pattern**, reappearing from the isolation
  lab: matches only when `intent` is genuinely a `SelectCellIntent`,
  simultaneously binding its real `row`/`col` fields to two brand-new,
  real local variables sharing their own field names.
- `setState(() { _selectedRow = row; _selectedCol = col; });` —
  reappearing in full, identical body to the original `_selectCell`
  (Lesson 32) — real proof this refactor changed *where* this code
  lives, not *what* it does.
- `case EnterDigitIntent(digit: final digit):` — the second real object
  pattern, binding `digit`.
- The five real lines that follow (`final row = _selectedRow; ...`
  through the real `try`/`on InvalidMoveException catch`) — reappearing
  in full, identical to the original `_enterDigit` (Lesson 34): reading
  the real, currently-shared `_selectedRow`/`_selectedCol` (Lesson 35),
  guarding against a `null` selection, and catching a real
  `InvalidMoveException` (Lesson 14) to show its own real message via
  `_scaffoldMessengerKey` (Lesson 34) — none of this real logic changed
  at all, only its home.
- `onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col))` — a
  real anonymous function (Lesson 15, reappearing) whose entire real
  body constructs a `SelectCellIntent` and immediately hands it to
  `_dispatch` — this is the real, concrete "Intent" stage of curriculum's
  own pipeline, made literal: a tap no longer calls a handler directly,
  it first becomes a real, named piece of data.
- `onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit))` — the
  identical real shape, for digit entry.

### Execution Trace

A real tap on cell `(0, 0)`, followed by a real tap on digit `9` — no
loop or recursion here, so this trace follows curriculum's own real
control-flow sequence, one real step at a time, not changing values in a
loop:

1. `SudokuCellView`'s own real `InkWell` (Lesson 32) receives a real tap
   on cell `(0, 0)` and calls its own `onTap` callback, ultimately
   invoking `onCellTap(0, 0)` from `SudokuBoardView`.
2. `build()`'s own real closure, `(row, col) => _dispatch(SelectCellIntent(row, col))`,
   runs with `row = 0, col = 0` — this is the exact real moment
   curriculum's own "Intent" stage happens: a brand-new
   `SelectCellIntent(0, 0)` object is constructed, before any real state
   changes at all.
3. `_dispatch` receives that real `SelectCellIntent`; its own `switch`
   matches the first case, destructuring `row: 0, col: 0` into two new,
   real local bindings — this is why the match succeeds on the *first*
   case rather than the second: `intent`'s own real runtime type is
   `SelectCellIntent`, not `EnterDigitIntent`, and Dart's own pattern
   matching checks real type before attempting to bind any fields.
4. `setState(() { _selectedRow = 0; _selectedCol = 0; });` runs — this
   is curriculum's own real "State change" stage — `_SudokuAppState`'s
   own real fields are now `0`/`0`, and Flutter schedules a real
   rebuild.
5. A real, later tap on digit `9` repeats steps 1-2 with
   `NumberPadView`'s own `onDigitTap`, constructing a real
   `EnterDigitIntent(9)` instead.
6. `_dispatch` receives it; the `switch` this time falls to the *second*
   real case, since `intent`'s own runtime type is now
   `EnterDigitIntent` — `row`/`col` are read fresh from
   `_selectedRow`/`_selectedCol` (now `0`/`0`, from step 4), and
   `_board.placeDigit(0, 0, 9)` runs — a real rejection here (cell
   `(0, 0)` is a given clue, Lesson 34), caught and shown via
   `_scaffoldMessengerKey`.
7. Every real step above ends the same real way: Flutter's own real
   framework (Lesson 25) rebuilds `SudokuBoardView`/`_SessionStatus` from
   whatever `_SudokuAppState`'s own fields now hold — curriculum's own
   real "UI" stage, unchanged since Lesson 34.

### CS Lens

Funneling every real action through one single method before any state
changes is a real, working instance of **unidirectional data flow**
(this lesson's own new hard concept) — the real guarantee it buys: at
any point this codebase is read, there is exactly one place
(`_dispatch`) to look to see every real way `_SudokuAppState`'s own
fields can ever change, rather than needing to search the whole class
for every scattered `setState` call.

```
Also recognized in: Redux's own single real reducer function (every
action in a whole web app funnels through it), a database's own single
real write-ahead log (every change recorded through one real, ordered
path before being applied), a building's own single real electrical
panel (every circuit's power flows through one real, inspectable point
rather than being wired ad hoc from a dozen different sources)
```

### SE Lens

The alternative — leaving `_selectCell`/`_enterDigit` as two, separate,
independently-`setState`-calling methods — genuinely worked, and this
lesson's own real, unmodified passing tests prove the *behavior* was
never the problem. The real cost that alternative carries as this app
grows: every new kind of action needs its own new method, each one a
separate real place capable of mutating shared state, with no single
real vantage point from which to audit, log, or intercept every action
uniformly — a real, concrete need Lesson 39 (dependency injection,
testing with fakes) and Lesson 40 (state machines, validating whether a
transition is even legal before it happens) both depend on having
exactly one real place to add that logic to, rather than duplicating it
across an ever-growing number of handler methods. The real cost paid
today: two new small classes, one new file, and a `switch` slightly
longer than either original method — a real, honest, small tax, paid
once, for a real structural guarantee.

### Commands Needed

None new — `flutter analyze .` and `flutter test` (both established
since Lesson 5/24), rerun to confirm the refactor.

### Run It

Real, run this session:

```
flutter analyze .
```

23 info-level lints — the identical pre-existing categories and count as
Lesson 36's own last-known-good baseline; zero errors.

```
flutter test
```

All 17 real test files still pass, unmodified — including
`cell_selection_test.dart` and `number_pad_test.dart`, both written
before `GameIntent`/`_dispatch` ever existed:

```
00:04 +16: All tests passed!
```

This is this unit's own strongest real proof: a refactor that changes
*how* code is organized without changing *what* it does should leave
every existing, behavior-level test passing without a single edit to
any of them — and it did.

### Connect

Every real tap this app has ever handled now passes through exactly one
real method on its way to becoming a state change. `GameSession`
(Lesson 36) still isn't part of this flow yet — `_dispatch` still reads
and writes `_board` directly, the same as before this lesson.

---

## Connect the Pieces

Follow one real tap — cell `(0, 0)`, then digit `9` — through every
stage curriculum's own diagram names, built for real across this
lesson's two units:

1. **User action** — a real press on `SudokuCellView`'s own `InkWell`
   (Lesson 32, unchanged).
2. **Intent** — Concept Unit 1's own new, real, sealed `GameIntent`
   hierarchy gives this action a name and a shape for the first time:
   `SelectCellIntent(0, 0)`, constructed the instant the tap is
   recognized, before any state changes at all.
3. **State change** — Concept Unit 2's own new `_dispatch`, the one
   real place left in this entire app that calls `setState` on
   `_SudokuAppState`'s own behalf — its real `switch`, built on the
   exact same object-pattern mechanism the isolation lab proved in
   miniature, matches `SelectCellIntent` and runs the identical real
   logic `_selectCell` always had.
4. **New state** — `_selectedRow`/`_selectedCol` now hold `0`/`0`, the
   same real, shared fields Lesson 35 already named as this app's own
   central example of shared state.
5. **UI** — Flutter's own real, unmodified rendering pipeline (Lesson
   25) rebuilds the board with the real, moved highlight, exactly as it
   always has.

The second real tap, digit `9`, proves the same five real stages work
identically for a completely different kind of action, matched by the
`switch`'s own second real case — real, direct evidence that this
lesson's new structure genuinely generalizes, rather than being built to
fit exactly one example. The next lesson chooses which real framework
should manage this state going forward.
