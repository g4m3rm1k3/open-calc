# Lesson 32: From Static Picture to Something You Can Touch

**What you will build:** Every one of `project/`'s own 81 real Sudoku
cells becomes genuinely tappable — a real tap moves the real, visible
selection to that exact cell, with real Material ink feedback under
your finger, and the previously-selected cell's own highlight
genuinely disappears. Lesson 31 built a real board that could only ever
show cell `(4, 4)` as selected, hardcoded; this lesson is where that
stops being true, and two real, honest discoveries — `InkWell` refusing
to work without a real `Material` ancestor, and Material's own
`ElevatedButton` turning out to use the exact same real mechanism this
lesson introduces — both happened along the way, kept in the record.

**What you need to know first:**
- Lesson 5 — `final`.
- Lesson 6 — `==`.
- Lesson 8 — named, optional parameters, applied here to
  `SudokuBoardView`'s own new `onCellTap` callback.
- Lesson 12 — composition, reused as the real, central idea behind
  `InkWell` itself.
- Lesson 15 — first-class functions, reused for `onCellTap`'s own real
  type, `void Function(int row, int col)?`, and for the real closures
  this lesson passes as `onTap` callbacks.
- Lesson 24 — the real, permanent `project/test/` convention, reused
  for this lesson's own new test files.
- Lesson 25 — `StatelessWidget`, `BuildContext`.
- Lesson 26 — `MaterialApp`, `Scaffold`.
- Lesson 28 — `StatefulWidget`/`State`/`setState`, promoted here from
  `_SessionStatus` (Lesson 28's own real subject) to `SudokuApp` itself,
  the exact same real mechanism, reused for a different real purpose.
- Lesson 29 — the real, honest consequence of a widget losing its own
  `const`-ability once it reads non-constant instance fields, already
  met once in `Scaffold`/`AppBar`, met again here.
- Lesson 31 — `SudokuBoardView`, `SudokuCellView`, and the real,
  hardcoded `selectedRow`/`selectedCol` this lesson makes genuinely
  dynamic.

**Terms used in this lesson:**
- **Gesture** — new: any real, recognized pattern of real touch input —
  a tap, a double-tap, a long-press, a drag — not only "a tap." It
  exists as its own real, broader category because a real touchscreen
  reports raw pointer-down/pointer-move/pointer-up events, and something
  has to real, honestly interpret sequences of those into a specific,
  named, higher-level real gesture.
- **Touch feedback** — new: a real, visible response to a touch,
  confirming to a real user that their tap actually registered — Material
  Design's own real, specific answer is an expanding ink splash,
  spreading from the real point of contact.

**Objects and methods used:**

- **`InkWell`**
  - *What it is:* the real, standard Material widget that makes its own
    child tappable and paints a real ink-splash effect when tapped.
  - *Implementation:* real, verbatim (its own internal composition),
    from `C:\flutter\packages\flutter\lib\src\material\ink_well.dart`,
    lines 1406-1419:
    ```dart
    child: GestureDetector(
      onTapDown: _primaryEnabled ? handleTapDown : null,
      onTapUp: _primaryEnabled ? handleTapUp : null,
      onTap: _primaryEnabled ? handleTap : null,
      onTapCancel: _primaryEnabled ? handleTapCancel : null,
      onDoubleTap: widget.onDoubleTap != null ? handleDoubleTap : null,
      onLongPress: widget.onLongPress != null ? handleLongPress : null,
      onLongPressUp: widget.onLongPressUp != null ? handleLongPressUp : null,
      ...
    ),
    ```
  - *Its use:* wraps every one of `SudokuCellView`'s own real
    `Container`s — real, direct evidence why: this lesson's own
    `onTap`, handed to `InkWell`, ends up handed straight through to the
    real, quoted `GestureDetector`'s own `onTap:` parameter, one layer
    down.
  - *Type:* a concrete class extending `StatelessWidget` (itself
    building the real `InkResponse` shown above).
  - *Responsibility:* to recognize a real tap gesture (by real,
    internal composition with `GestureDetector`, this lesson's own
    other Header entry) *and*, at the same time, paint a real, visible
    ink-splash — two real real jobs, genuinely composed together, not
    one widget doing both by coincidence.
  - *Depends on:* a real `Material` ancestor (this lesson's own real,
    honest discovery — without one, a real, specific error is thrown,
    not a silent failure) and, optionally, a real `onTap` callback.
  - *Connects to:* wraps each `SudokuCellView`'s own real `Container`;
    its own `onTap` calls `SudokuCellView`'s own `onTap` field, which,
    inside `SudokuBoardView`, calls `onCellTap!(row, col)`.
  - *Shape:* a small, public, extremely commonly used real Material
    widget — this project's own first real, interactive widget.

- **`GestureDetector`**
  - *What it is:* the real, lower-level Flutter widget that recognizes
    raw touch patterns and calls named real callbacks — `onTap`,
    `onDoubleTap`, `onLongPress`, and more — without drawing anything
    itself.
  - *Implementation:* real shape (partial, matching what this lesson's
    own quoted `InkWell` source uses):
    `GestureDetector({this.onTap, this.onDoubleTap, this.onLongPress, this.onTapDown, this.onTapUp, this.onTapCancel, super.child, ...})`.
  - *Its use:* not constructed directly by this project's own code —
    real, quoted evidence that `InkWell` itself is built from one,
    internally, confirming this lesson's own **Gesture** Header term:
    `onTap` is only one of several real, named callbacks `GestureDetector`
    recognizes, `InkWell` simply wires up that one specifically (plus
    `onDoubleTap`/`onLongPress`, unused by this project) while also
    painting real ink feedback on top.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to turn real, raw pointer events into real, named,
    higher-level gesture callbacks — no painting, no visual opinion at
    all.
  - *Depends on:* one real child and any real subset of its many
    optional gesture callbacks.
  - *Connects to:* built internally by `InkWell`'s own real
    `InkResponse`; every one of `InkWell`'s own gesture-related
    parameters (`onTap`, `onDoubleTap`, `onLongPress`) is, per the real,
    quoted source, forwarded straight to one of `GestureDetector`'s own
    real, matching parameters.
  - *Shape:* a small, public, foundational real widget — one layer
    beneath `InkWell` in this curriculum's own now-real understanding of
    how a tap actually reaches a callback.

- **`SudokuBoardView.onCellTap`**
  - *What it is:* a new, real, optional field on `SudokuBoardView`
    (Lesson 31's own class) — a real callback the board calls, naming
    exactly which real cell was tapped.
  - *Implementation:* real, from `project/lib/sudoku_board_view.dart`:
    `final void Function(int row, int col)? onCellTap;`.
  - *Its use:* `SudokuApp`'s own real state (this lesson's own next
    unit) supplies one; `SudokuBoardView.build()` hands each real cell
    its own real, position-specific closure,
    `onCellTap == null ? null : () => onCellTap!(row, col)`.
  - *Type:* a real, nullable field of a real function type.
  - *Responsibility:* to let `SudokuBoardView` stay exactly what Lesson
    31's own SE lens already established it as — a real, purely
    presentational widget with no opinion of its own about *what
    happens* when a cell is tapped, only *that* something can be told.
  - *Depends on:* nothing to leave it `null` (a non-interactive board,
    still real and valid); a real function matching its own declared
    shape to make cells tappable.
  - *Connects to:* read inside `SudokuBoardView.build()`; called,
    indirectly (through each real cell's own closure), by `InkWell`'s
    own `onTap`.
  - *Shape:* a small, public field — the real, minimal seam between a
    purely visual board and whoever actually owns real selection state.

---

## Concept Unit: `InkWell` — Recognizing a Tap, Showing It Happened

### The Problem

Lesson 31's own `SudokuCellView` shows a real digit and real borders,
but nothing about it responds to touch at all — tapping it does
nothing, and nothing about it even *looks* tappable. Curriculum's own
Lesson 32 bullets name "Gestures," "Taps," and "Touch feedback" as three
separate real things. What real, single Flutter widget answers all
three at once?

> **Pause and think:** Given Lesson 31's own SE lens already decided
> `SudokuCellView` should stay a small, focused, real widget, and given
> this lesson's own Header already names two candidates —
> `GestureDetector` (recognizes touch, draws nothing) and `InkWell`
> (recognizes touch, *and* draws a real ink splash) — which would you
> reach for first, given curriculum's own explicit "Touch feedback"
> bullet, not just "Taps"? Given Lesson 25's own real, quoted
> `RenderObject` architecture, what real problem would you expect if a
> widget tried to paint a real visual effect (ink) with no real,
> painted surface (a `Material`) declared anywhere above it?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/sudoku_board_view.dart`, modified. **Change type:** wrap;
add. **Location:** `SudokuCellView.build()`'s own returned `Container`;
new fields on both `SudokuBoardView` and `SudokuCellView`.
**Dependencies:** unchanged.

### The New Code

```dart
Widget build(BuildContext context) {
  return InkWell(
    onTap: onTap,
    child: Container(
      // ...unchanged from Lesson 31...
    ),
  );
}
```

### The Updated Project

The complete, real `SudokuCellView`, with this unit's own new lines
marked:

```dart
1  class SudokuCellView extends StatelessWidget {
2    const SudokuCellView({
3      super.key,
4      required this.row,
5      required this.col,
6      required this.value,
7      required this.isSelected,
8      this.onTap,                                                       // ← new
9    });
10
11   final int row;
12   final int col;
13   final int? value;
14   final bool isSelected;
15   final VoidCallback? onTap;                                          // ← new
16
17   @override
18   Widget build(BuildContext context) {
19     return InkWell(                                                    // ← new
20       onTap: onTap,                                                    // ← new
21       child: Container(                                                // ← changed (now InkWell's child)
22         width: 36,
23         height: 36,
24         alignment: Alignment.center,
25         decoration: BoxDecoration(
26           color: isSelected ? Colors.blue.shade100 : null,
27           border: Border(
28             top: BorderSide(width: row % 3 == 0 ? 2 : 0.5),
29             left: BorderSide(width: col % 3 == 0 ? 2 : 0.5),
30             right: BorderSide(width: col == 8 ? 2 : 0.5),
31             bottom: BorderSide(width: row == 8 ? 2 : 0.5),
32           ),
33         ),
34         child: Text(value == null ? '' : '$value'),
35       ),                                                                // ← changed
36     );                                                                  // ← new
37   }
38 }
```

### Isolate

A real, honest, deliberately-triggered failure served as this unit's
own real evidence — no separate throwaway lab needed, since
`project/`'s own already-real, permanent test suite (Lesson 31) itself
produced it directly the moment `InkWell` was added:

```
No Material widget found.
_InkResponseStateWidget widgets require a Material widget ancestor within
the closest LookupBoundary.
```

This is real, direct confirmation of the previous unit's own Socratic
prompt: `InkWell` genuinely cannot paint its own real ink effect without
a real `Material` widget somewhere above it in the tree — Lesson 31's
own test file pumped `SudokuBoardView` wrapped only in a bare
`Directionality`, with no real `Material` anywhere. Fixed by wrapping
every affected real test in `MaterialApp(home: Material(child: ...))`
instead — the real, permanent `project/`'s own actual app already has a
real `Material` (via `Scaffold`, itself built on one), so this failure
never occurs outside a test — only Lesson 31's own already-written
tests needed the real fix.

A second real, honest discovery followed immediately after: a real test
asserting exactly `81` real `InkWell`s found `82` instead — Lesson 28's
own real `ElevatedButton` ("Start New Game") turned out to be built from
a real `InkWell` too, confirming this lesson's own claim that `InkWell`
is Material's own standard, widely-reused answer to "tappable, with real
feedback" — not a Sudoku-specific invention. Fixed by scoping the real
finder to descendants of `SudokuBoardView` specifically.

### Discard

Not applicable — no throwaway lab; every real fact here comes from
real, permanent test failures and fixes, kept in the actual project.

### Mechanical Walkthrough

- `InkWell(onTap: onTap, child: Container(...))` — this lesson's own
  new `InkWell` Header entry: wraps the entire, previously-built real
  cell; `onTap: onTap` passes this cell's own real, nullable callback
  field straight through — reading a field and naming it as an argument
  with the identical name, Dart's own real shorthand already familiar
  from every named-parameter call this curriculum has written since
  Lesson 8, just visually identical on both sides here.
- `final VoidCallback? onTap;` — `VoidCallback`, a real, standard
  Flutter typedef for `void Function()` — nullable (reappearing from
  Lesson 5/10), so a cell built with no `onTap` at all stays real and
  valid, simply not tappable.

### CS Lens

`InkWell` — one real widget genuinely doing two real jobs (gesture
recognition, via a real, composed `GestureDetector`; visual feedback,
via its own real ink-painting logic) — is a real, working instance of
**composing two independent real behaviors into one convenient real
surface**, the same real idea Lesson 12's own composition unit already
named, applied here to *behavior* (recognize + paint) rather than
*data* (a `BoardPosition` held inside a `SudokuCell`).

```
Also recognized in: a car's own cruise control combining speed sensing
and throttle control in one real system, a smoke detector combining
sensing and alarm-sounding, a doorbell combining a button press and a
chime — sensing one real event, producing one real, connected response
```

### SE Lens

The alternative — wiring a bare `GestureDetector` directly, with no real
visual feedback at all — was rejected because curriculum's own explicit
bullet names "Touch feedback" as its own real requirement, not merely
"Taps"; a real user tapping a cell with zero visible response has no
real way to know their tap even registered. The real cost of `InkWell`
specifically, discovered the hard way in this unit's own real test
failure: it requires real, specific tree structure (a `Material`
ancestor) that a bare `GestureDetector` would never have demanded —
real convenience traded for a real, specific dependency.

### Commands Needed

None beyond `flutter analyze`/`flutter test`, already explained.

### Run It

Deferred — `onCellTap`, the real value that actually flows into each
cell's own `onTap`, is this lesson's own next unit's own subject; the
Verification Rule's own Batching guidance prefers one complete real run
over this stage in isolation.

### Connect

Every real cell can now recognize a tap and show real, visible feedback
— but nothing yet happens *because* of that tap. The next unit makes a
tap actually move the real, visible selection.

---

## Concept Unit: Selection State That Actually Moves

### The Problem

`SudokuApp` (Lesson 26) is a plain `StatelessWidget`, hardcoding
`selectedRow: 4, selectedCol: 4` (Lesson 31) with no way to ever change.
Given the previous unit's own real `onTap` now fires on every real tap,
what real, minimal change lets a tap actually update which cell is
selected?

> **Pause and think:** Lesson 28's own real `_SessionStatusState`
> already proved the exact real shape needed here — a real, mutable
> field, changed inside a real `setState` call, triggering a real
> rebuild. Given `SudokuApp` is currently a `StatelessWidget`, and
> Lesson 28's own real, quoted `StatefulElement` evidence showed
> `createState()` is only ever called once, what real, structural change
> would you expect promoting `SudokuApp` from `StatelessWidget` to
> `StatefulWidget` to actually require?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/main.dart`, modified; `project/test/cell_selection_test.dart`,
created (a real, permanent test); `project/test/
sudoku_board_view_test.dart`, extended. **Change type:** refactor; add.
**Location:** `SudokuApp` itself, promoted from `StatelessWidget` to
`StatefulWidget`. **Dependencies:** unchanged.

### The New Code

```dart
class SudokuApp extends StatefulWidget {
  const SudokuApp({super.key});

  @override
  State<SudokuApp> createState() => _SudokuAppState();
}

class _SudokuAppState extends State<SudokuApp> {
  int? _selectedRow = 4;
  int? _selectedCol = 4;

  void _selectCell(int row, int col) {
    setState(() {
      _selectedRow = row;
      _selectedCol = col;
    });
  }

  @override
  Widget build(BuildContext context) {
    // ...MaterialApp/Scaffold unchanged, SudokuBoardView now real, dynamic...
  }
}
```

### The Updated Project

The complete, real `SudokuApp`/`_SudokuAppState`, with this unit's own
new lines marked:

```dart
1  class SudokuApp extends StatefulWidget {                              // ← changed (was StatelessWidget)
2    const SudokuApp({super.key});
3
4    @override                                                           // ← new
5    State<SudokuApp> createState() => _SudokuAppState();                // ← new
6  }                                                                      // ← changed
7
8  class _SudokuAppState extends State<SudokuApp> {                      // ← new
9    int? _selectedRow = 4;                                              // ← new
10   int? _selectedCol = 4;                                              // ← new
11
12   void _selectCell(int row, int col) {                                // ← new
13     setState(() {                                                     // ← new
14       _selectedRow = row;                                             // ← new
15       _selectedCol = col;                                             // ← new
16     });                                                                // ← new
17   }                                                                     // ← new
18
19   @override
20   Widget build(BuildContext context) {
21     return MaterialApp(
22       home: Scaffold(
23         appBar: AppBar(title: const Text('Sudoku')),
24         body: Padding(                                                  // ← changed (no longer const)
25           padding: const EdgeInsets.all(16),
26           child: Column(
27             children: [
28               Expanded(
29                 child: Align(
30                   alignment: Alignment.center,
31                   child: SudokuBoardView(
32                     cells: _displayPuzzle,
33                     selectedRow: _selectedRow,                          // ← changed (was hardcoded 4)
34                     selectedCol: _selectedCol,                          // ← changed (was hardcoded 4)
35                     onCellTap: _selectCell,                            // ← new
36                   ),
37                 ),
38               ),
39               const _SessionStatus(),
40             ],
41           ),
42         ),
43       ),
44     );
45   }
46 }
```

`body:` lost its own `const` here — `SudokuBoardView`'s own `selectedRow`/
`selectedCol`/`onCellTap` arguments now read real, per-build instance
fields (`_selectedRow`, `_selectCell`), which are not themselves
compile-time constants, the same real, honest consequence Lesson 29's
own `Scaffold`/`AppBar` unit already met once before.

### Isolate and Discard

Not applicable — every construct here (`StatefulWidget`/`State`/
`setState`) was already given a real, isolated lab in Lesson 28.

### Mechanical Walkthrough

- `class SudokuApp extends StatefulWidget` — reappearing in full from
  Lesson 28: `SudokuApp` itself is still a real, cheap, throwaway
  configuration object; only its separate, real `_SudokuAppState` is
  long-lived.
- `int? _selectedRow = 4; int? _selectedCol = 4;` — real, mutable,
  nullable fields, initialized to Lesson 31's own real starting
  selection — the exact same real starting values, now genuinely
  changeable instead of hardcoded into `SudokuBoardView`'s own
  constructor call directly.
- `void _selectCell(int row, int col) { setState(() { _selectedRow = row; _selectedCol = col; }); }`
  — `setState`, reappearing in full from Lesson 28: mutates both real
  fields together, inside one real callback, then tells the framework
  this widget's own description is stale — the exact same real
  mechanism `_SessionStatusState._startNewGame` already used, reused
  here for a different real purpose.
- `onCellTap: _selectCell` — passes the real method itself as a value
  (reappearing first-class-function treatment from Lesson 15), matching
  `SudokuBoardView`'s own real, declared `void Function(int row, int
  col)?` shape exactly.

### Execution Trace

Real, run this session, via `flutter test test\cell_selection_test.dart`:

```
tapping a real cell in the real running app moves the real selection
```

1. `tester.pumpWidget(const SudokuApp())` — the real app starts with
   `_selectedRow: 4, _selectedCol: 4`; real-measured, cell `(4, 4)`'s own
   `BoxDecoration.color` is non-null, cell `(0, 0)`'s is `null`.
2. `await tester.tap(targetCell)` — a real, simulated tap on the real
   cell at `(0, 0)`; this reaches `InkWell.onTap`, which is the real
   closure `SudokuBoardView.build()` built for that exact position:
   `() => onCellTap!(0, 0)`.
3. That real call reaches `_SudokuAppState._selectCell(0, 0)`, which
   calls `setState`, mutating `_selectedRow`/`_selectedCol` to `0`/`0`.
4. `await tester.pump()` processes the real, resulting rebuild —
   `SudokuBoardView` is constructed again, this time with `selectedRow:
   0, selectedCol: 0`.
5. Real, final measurement: cell `(0, 0)`'s own `BoxDecoration.color` is
   now non-null; cell `(4, 4)`'s own color is now `null` — the real
   selection genuinely moved, not merely "also" highlighted a second
   cell.

### CS Lens

Lifting selection state from individual cells up to their real, common
parent (`_SudokuAppState`) — rather than each of 81 real
`SudokuCellView`s somehow tracking "am I selected" independently — is a
real, working instance of **single source of truth** — exactly one real
place decides which cell is selected, and every cell simply reflects
that one real answer.

```
Also recognized in: a radio-button group's own single selected value
(never each button tracking its own "am I checked" independently), a
spreadsheet's own single active-cell reference, a music player's own
single "currently playing track" index shared across every row of a
real playlist view
```

### SE Lens

The alternative — Lesson 31's own SE lens already named this exact
choice in reverse: giving each `SudokuCellView` its own internal,
mutable "am I selected" state was rejected there because no single
cell can correctly know about every other cell's own state. This unit
is where that decision's real payoff arrives: adding real interactivity
required changing exactly one class (`SudokuApp`), not renegotiating how
81 already-correct cells talk to each other. The real cost paid instead:
`SudokuBoardView`/`SudokuCellView` must both pass real callbacks through
an extra real layer (`onCellTap` down, then each cell's own closure)
rather than each cell handling its own tap directly — a small, real
indirection cost for a real, structural guarantee.

### Commands Needed

None beyond `flutter analyze`/`flutter test`, already explained.

### Run It

Real, captured output, this session, from the full `flutter test` run:

```
tapping a real cell in the real running app moves the real selection
every real cell provides real Material touch feedback (81, precisely)
every real cell shows its own given digit, or nothing
cells on a 3x3 boundary get a real, thicker border
exactly the real selected cell gets the real highlight color
tapping a real cell reports its own real row and column
PASS: (8 real Sudoku-engine tests, unchanged from Lesson 24)
the Sudoku shell shows a title and a real board
tapping Start New Game increments the real, on-screen count
the elapsed-time counter ticks once per real second
All tests passed!
```

No new screenshot this lesson — three consecutive real Chrome attempts
across Lessons 26, 29, and 31 each hit a different real, unresolved
environment issue, and no physical device was connected this session;
logged honestly in `verification/lesson-32/run-log.md`. The real,
measured, end-to-end proof above (the highlight genuinely moving from
one real cell to another, confirmed by reading real `BoxDecoration`
values before and after a real, simulated tap) is stronger evidence for
this lesson's own specific claim than a static image would be.

### Connect

A real tap on any of `project/`'s own 81 real cells now genuinely moves
the real, visible selection — the last piece curriculum's own Lesson 32
bullets named.

---

## Connect the Pieces

Follow one real tap, on the real cell at `(0, 0)`, through everything
this lesson built:

1. A real, simulated touch reaches `SudokuCellView`'s own real
   `InkWell` (Concept Unit 1) — real, quoted evidence shows this same
   widget internally builds a real `GestureDetector`, recognizing the
   real tap as specifically an `onTap` event (one of several real
   gestures it could have recognized), while separately painting a
   real, visible ink response — the concrete, real difference between
   this lesson's own **Gesture** and **Touch feedback** Header terms,
   both satisfied by one real widget.
2. `InkWell.onTap` calls the real closure `SudokuBoardView.build()`
   built specifically for this cell: `() => onCellTap!(0, 0)`.
3. That real call reaches `_SudokuAppState._selectCell(0, 0)` (Concept
   Unit 2), which calls the exact same real `setState` mechanism Lesson
   28 already proved — mutating `_selectedRow`/`_selectedCol`, both real
   fields living on the `State` object, not the throwaway `Widget`,
   exactly as Lesson 25/28's own architecture already established.
4. A real rebuild follows — `SudokuBoardView` is reconstructed with the
   new real selected position, and, real-measured, cell `(0, 0)`'s own
   `BoxDecoration.color` becomes non-null while cell `(4, 4)`'s own
   color reverts to `null`.
5. Two real, honest discoveries surfaced along the way, both kept: a
   real `Material`-ancestor requirement that `InkWell` genuinely cannot
   work without, and a real, incidental proof that Material's own
   `ElevatedButton` — already present in this project since Lesson 28 —
   uses this exact same real `InkWell` mechanism underneath, confirming
   this lesson's own choice is Material's own standard answer, not a
   Sudoku-specific invention.

`project/`'s own real board is no longer just a picture — every real
cell genuinely responds to a real touch, with real, visible feedback,
and the real, single source of truth for "which cell is selected" lives
in exactly one place, ready for Lesson 33's own real number-entry system
to build on next.
