# Lesson 33: Nine Buttons, One Real Number Getting Written

**What you will build:** `project/`'s own real screen gains a real,
tappable 1-9 number pad — curriculum's own literal `1 2 3 / 4 5 6 / 7
8 9` — and tapping a digit genuinely writes it into whichever real cell
is currently selected, visible immediately on screen. Getting there
required fixing a real, honest aliasing trap (a `const` puzzle's own
nested lists staying immutable through a naive copy), and hit a real,
*unplanned* `RenderFlex` overflow — the exact same failure Lesson 30
deliberately staged in isolation, this time appearing organically the
moment the real screen actually got full — plus a real, second-order
consequence once that overflow was fixed by making the screen
scrollable. All of it kept in the record, not smoothed over.

**What you need to know first:**
- Lesson 5 — `final`; this lesson's own real, legitimate lint (`_cells`
  should be `final`) is a direct, practical use of the distinction
  between locking a reference and locking what it points to.
- Lesson 6 — arithmetic operators, reused for this lesson's own real
  `rowIndex * 3 + colIndex + 1` digit calculation.
- Lesson 8 — named, required parameters.
- Lesson 9 — the real index operator (`cells[row][col] = digit`).
- Lesson 12 — `extends`.
- Lesson 15 — first-class functions, reused for `onDigitTap`'s own real
  type and every real closure this lesson builds.
- Lesson 17 — `List.generate`; `List<int?>.from(row)`, this lesson's own
  real fix for its own aliasing trap, is a close real cousin of
  `List.generate`'s own already-proved real aliasing safety.
- Lesson 24 — the real, permanent `project/test/` convention.
- Lesson 25 — `StatelessWidget`.
- Lesson 26 — `MaterialApp`, `Scaffold`.
- Lesson 27 — `super.key`, `required`/`this.field` shorthand.
- Lesson 28 — `StatefulWidget`/`State`/`setState`, reused again, this
  time to hold the real, changeable board contents, not just the
  selected position.
- Lesson 29 — `Row`, `Column`, `Padding`.
- Lesson 30 — the real `RenderFlex overflowed` error, deliberately
  staged there in isolation — this lesson is where the exact same real
  failure shows up unplanned, in the real app itself.
- Lesson 31 — `SudokuBoardView`, `SudokuCellView`, `Border`
  (this lesson's own `Border.all()` is a real, simpler sibling of
  Lesson 31's own four-argument `Border(...)` constructor).
- Lesson 32 — `InkWell`, `SudokuBoardView.onCellTap`, and the real,
  single-source-of-truth selection state this lesson writes into.

**Terms used in this lesson:**
- **Aliasing** — new: when two real variables (or, here, a copied outer
  list and its own still-shared inner lists) refer to the *same*
  underlying real object, so a change made through one is visible
  through the other — or, as this lesson's own real, triggered failure
  showed, isn't even possible to make at all if that shared object is
  itself immutable. It exists as a real, named hazard because copying a
  *container* is not the same real operation as copying everything the
  container refers to.
- **`TextStyle`** — new: a real, immutable value describing how text
  should look — font size, weight, color — handed to a `Text`'s own
  `style:` parameter. It exists because `Text`'s own required argument
  is just the real string to show; every visual detail about *how* to
  show it is this separate, real, optional object instead.

**Objects and methods used:**

- **`NumberPadView`**
  - *What it is:* this project's own new, real widget for the whole
    1-9 number pad.
  - *Implementation:* real, from `project/lib/number_pad_view.dart`:
    `class NumberPadView extends StatelessWidget { const NumberPadView({super.key, required this.onDigitTap}); final void Function(int digit) onDigitTap; }`.
  - *Its use:* constructed once inside `SudokuApp.build()`, between the
    real board and the real session-status row.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to display nine real, tappable digit buttons in
    curriculum's own literal `1 2 3 / 4 5 6 / 7 8 9` arrangement, and
    report, by number alone, which real digit was tapped — nothing
    about *what happens* to that digit is this widget's own concern.
  - *Depends on:* a real `onDigitTap` callback.
  - *Connects to:* its own `build()` constructs nine real
    `NumberPadButtonView`s; `_SudokuAppState._enterDigit` is the real
    function `SudokuApp` hands it.
  - *Shape:* a public, directly-constructed widget — this project's own
    second real, dedicated UI class, alongside `SudokuBoardView`.

- **`NumberPadButtonView`**
  - *What it is:* this project's own new, real widget for exactly one
    number-pad button.
  - *Implementation:* real, from the same file:
    `class NumberPadButtonView extends StatelessWidget { const NumberPadButtonView({super.key, required this.digit, required this.onTap}); final int digit; final VoidCallback onTap; }`.
  - *Its use:* constructed nine real times by `NumberPadView.build()`,
    each with its own real digit (`1` through `9`) and its own real,
    position-specific `onTap`.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to draw one real, bordered, tappable box showing
    one real digit, with real Material touch feedback.
  - *Depends on:* its own real `digit` and `onTap`.
  - *Connects to:* constructed by `NumberPadView.build()`; its own real
    `InkWell` (reappearing from Lesson 32) calls `onTap` on a real tap.
  - *Shape:* a small, public widget — structurally the number pad's own
    real echo of `SudokuCellView` (Lesson 31): a small, reusable,
    position-aware button, the same real shape, a different real job.

- **`Border.all()`**
  - *What it is:* a real, named constructor on `Border` (reappearing
    from Lesson 31), building all four real sides with the *same*
    width, in one call.
  - *Implementation:* real shape:
    `const Border.all({BorderSide side = const BorderSide()})` (a real,
    simpler alternative to Lesson 31's own four-separate-`BorderSide`
    constructor).
  - *Its use:* `NumberPadButtonView.build()` uses it directly — a
    number-pad button, unlike a Sudoku cell, has no real 3×3-region
    logic requiring different real widths per side.
  - *Type:* a real, named constructor on the same `Border` class.
  - *Responsibility:* to build a real, uniform border with a single,
    real argument, rather than four.
  - *Depends on:* nothing — its own real default (`BorderSide()`) is a
    real, standard 1-pixel solid border.
  - *Connects to:* constructed inside `NumberPadButtonView`'s own
    `BoxDecoration`.
  - *Shape:* a small, public, real convenience constructor.

- **`SingleChildScrollView`**
  - *What it is:* a real widget that makes its own single child
    scrollable, if that child ends up taller (or wider) than the real
    space available.
  - *Implementation:* real shape used here:
    `SingleChildScrollView({super.child, EdgeInsetsGeometry? padding, ...})`.
  - *Its use:* wraps `SudokuApp.build()`'s own entire body — this
    lesson's own real, direct fix for a real, organically-triggered
    overflow (below).
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to let its own child be its own real, natural
    size — never forcing it to fit — and provide real scrolling when
    that natural size exceeds the real available space.
  - *Depends on:* one real child.
  - *Connects to:* wraps the real `Column` holding the board, number
    pad, and session status together.
  - *Shape:* a small, public, extremely commonly used real widget.

- **`WidgetTester.ensureVisible`**
  - *What it is:* a real `WidgetTester` method (`WidgetTester` itself
    reappearing from Lesson 25), new in this lesson.
  - *Implementation:* real signature shape:
    `Future<void> ensureVisible(Finder finder, {...})`.
  - *Its use:* called before tapping the real "Start New Game" button
    (Lesson 28) once it could genuinely end up scrolled outside the
    real, visible test surface — this lesson's own real, second-order
    discovery.
  - *Type:* a real instance method on `WidgetTester`.
  - *Responsibility:* to scroll the nearest real `Scrollable` ancestor
    until the given real widget is genuinely reachable by a simulated
    real tap.
  - *Depends on:* a `Finder` naming the real target widget.
  - *Connects to:* used in `project/test/session_status_test.dart`,
    immediately before `tester.tap`.
  - *Shape:* a public, test-only method — real, necessary the moment
    any real content becomes scrollable.

---

## Concept Unit: `NumberPadView` — Nine Buttons, One Shape

### The Problem

`project/`'s own real screen has no way to enter a digit at all —
tapping a cell only selects it (Lesson 32). Curriculum's own Lesson 33
bullet shows exactly what to build: a literal `1 2 3 / 4 5 6 / 7 8 9`
grid. What's the smallest real widget structure that produces it?

> **Pause and think:** Lesson 31's own `SudokuBoardView` already built a
> real 9×9 grid from nested `List.generate` calls over `Row`/`Column` —
> given a number pad is a real 3×3 grid instead, what would you guess
> the smallest real change to that same pattern looks like? Given the
> real digits need to read `1` through `9`, not `0` through `8` the way
> `List.generate`'s own real index starts, what real, small arithmetic
> adjustment would turn a `0`-based row/column pair into the exact real
> digit curriculum's own diagram shows at that position?

### Project Change

**Reference Source:** no reference implementation — this project's own,
from-scratch number pad. **Files affected:**
`project/lib/number_pad_view.dart` (created); `project/lib/main.dart`
(modified — the number pad added to the real screen). **Change type:**
add. **Location:** a new file; inside `SudokuApp.build()`'s own body.
**Dependencies:** none beyond `package:flutter/material.dart`.

### The New Code

```dart
class NumberPadView extends StatelessWidget {
  const NumberPadView({super.key, required this.onDigitTap});

  final void Function(int digit) onDigitTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(
        3,
        (rowIndex) => Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (colIndex) {
            final digit = rowIndex * 3 + colIndex + 1;
            return NumberPadButtonView(digit: digit, onTap: () => onDigitTap(digit));
          }),
        ),
      ),
    );
  }
}
```

### The Updated Project

This is a brand-new file with nothing surrounding this fragment yet —
Project Change already covers this case. `NumberPadButtonView` —
referenced here but not yet defined — is this lesson's own next unit.

### Isolate and Discard

Not applicable — `List.generate`, `Row`, `Column`, and anonymous
functions were all already given real, isolated labs in the specific
earlier lessons cited in this lesson's own Header.

### Mechanical Walkthrough

- `Column(mainAxisSize: MainAxisSize.min, children: List.generate(3, (rowIndex) => Row(...)))`
  — the identical real nesting pattern Lesson 31's own `SudokuBoardView`
  already used, `9` replaced by `3` on both axes — real, direct proof
  the same real shape scales down cleanly to a smaller real grid.
- `final digit = rowIndex * 3 + colIndex + 1;` — real, computed once per
  real button: multiplication and addition (reappearing from Lesson 6),
  converting a `0`-based `(rowIndex, colIndex)` pair into curriculum's
  own real `1`-through-`9` layout — `rowIndex: 0, colIndex: 0` gives
  `1`; `rowIndex: 2, colIndex: 2` gives `9`, matching curriculum's own
  literal diagram exactly.
- `NumberPadButtonView(digit: digit, onTap: () => onDigitTap(digit))` —
  a real anonymous function (reappearing from Lesson 15), capturing
  this specific real `digit` value — the identical real closure-capture
  pattern `SudokuBoardView` already used for `onCellTap`.

### CS Lens

Reusing the exact real `List.generate`-over-`Row`/`Column` shape from
Lesson 31, just with different real dimensions and a different real
per-position calculation, is a real, working instance of **the same
structural pattern, applied to a new real problem** — the layout logic
didn't need to be reinvented, only its real parameters changed.

```
Also recognized in: a spreadsheet template reused at a different real
size, a calculator app's own keypad and a phone's own dial pad sharing
the identical real grid-of-buttons shape, a game's own inventory grid
and its own crafting grid built from the same real underlying component
```

### SE Lens

The alternative — writing nine real, separate `NumberPadButtonView`
constructions by hand, one per digit — was rejected for the same real
reason Lesson 31's own 81-cell board wasn't hand-written 81 times: the
real, systematic relationship between position and content
(`rowIndex * 3 + colIndex + 1`) is exactly the kind of real pattern
`List.generate` exists to express directly, rather than as nine
individually-typed real literals a future edit could easily get
inconsistent.

### Commands Needed

None beyond `flutter analyze`/`flutter test`, already explained.

### Run It

Deferred — `NumberPadButtonView` doesn't exist as real code yet; the
Verification Rule's own Batching guidance prefers one complete real run
to a run against an incomplete file.

### Connect

Nine real button positions are now requested, each with the exact real
digit curriculum's own layout calls for — but `NumberPadButtonView`
itself doesn't exist yet. The next unit builds it.

---

## Concept Unit: `NumberPadButtonView` and Writing Into the Real Board

### The Problem

`NumberPadView` references `NumberPadButtonView` — a real class that
doesn't exist yet — and even once it does, tapping a real digit needs
somewhere real to actually go: the currently selected cell's own real
value, which, since Lesson 31, has lived in an unchanging `const`
puzzle. What real changes make a tapped digit actually, visibly appear
on the real board?

> **Pause and think:** Given Lesson 31's own `_displayPuzzle` is
> declared `const`, and Lesson 5's own real, established rule that
> `const` demands a genuine compile-time constant — could `SudokuApp`
> ever mutate that exact list directly, even if it wanted to? Given
> `List`'s own real `.toList()` method (reappearing from Lesson 9)
> builds a new real list from an existing one, would you expect that
> new real outer list's own *inner* lists to be independent, brand-new
> real lists too, or the exact same real ones the original had?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/number_pad_view.dart`, extended; `project/lib/main.dart`,
modified (`_cells` real, mutable field added; `_enterDigit`; the number
pad wired in; the real overflow fix, below). **Change type:** add;
refactor. **Location:** a new class; `_SudokuAppState`.
**Dependencies:** unchanged.

### The New Code

```dart
class NumberPadButtonView extends StatelessWidget {
  const NumberPadButtonView({super.key, required this.digit, required this.onTap});

  final int digit;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        alignment: Alignment.center,
        decoration: BoxDecoration(border: Border.all()),
        child: Text('$digit', style: const TextStyle(fontSize: 18)),
      ),
    );
  }
}
```

And, in `_SudokuAppState`:

```dart
final List<List<int?>> _cells = _displayPuzzle.map((row) => List<int?>.from(row)).toList();

void _enterDigit(int digit) {
  final row = _selectedRow;
  final col = _selectedCol;
  if (row == null || col == null) {
    return;
  }
  setState(() {
    _cells[row][col] = digit;
  });
}
```

### The Updated Project

The complete, real `_SudokuAppState`, with this unit's own new lines
marked:

```dart
1  class _SudokuAppState extends State<SudokuApp> {
2    final List<List<int?>> _cells =                                     // ← new
3        _displayPuzzle.map((row) => List<int?>.from(row)).toList();      // ← new
4    int? _selectedRow = 4;
5    int? _selectedCol = 4;
6
7    void _selectCell(int row, int col) {
8      setState(() {
9        _selectedRow = row;
10       _selectedCol = col;
11     });
12   }
13
14   void _enterDigit(int digit) {                                       // ← new
15     final row = _selectedRow;                                         // ← new
16     final col = _selectedCol;                                         // ← new
17     if (row == null || col == null) {                                 // ← new
18       return;                                                          // ← new
19     }                                                                   // ← new
20     setState(() {                                                      // ← new
21       _cells[row][col] = digit;                                        // ← new
22     });                                                                 // ← new
23   }                                                                     // ← new
24
25   @override
26   Widget build(BuildContext context) {
27     return MaterialApp(
28       home: Scaffold(
29         appBar: AppBar(title: const Text('Sudoku')),
30         body: SudokuBoardView(                                          // ← changed, see next unit for the real, full body
31           cells: _cells,                                                // ← changed (was _displayPuzzle)
32           selectedRow: _selectedRow,
33           selectedCol: _selectedCol,
34           onCellTap: _selectCell,
35         ),
36       ),
37     ),
38   );
39 }
```

(The full, real body — including the number pad and the overflow fix —
is this lesson's own next unit; this step isolates the real data-model
change first.)

### Isolate

A real, separate, plain-Dart lab, `verification/lesson-33/
aliasing_trap.dart`, isolates this unit's own central real hazard before
trusting a fix inside `project/`:

```dart
const List<List<int?>> original = [
  [5, 3, null],
  [6, null, null],
];

final shallowCopy = original.toList();
shallowCopy[0][0] = 9; // ← real, deliberate attempt
```

Run for real, this session, via `dart run aliasing_trap.dart`:

```
Attempting shallowCopy[0][0] = 9 ...
Real error: Unsupported operation: Cannot modify an unmodifiable list
deepCopy[0] after mutation: [9, 3, null]
original[0] unchanged:     [5, 3, null]
```

This is real, direct, run proof of this lesson's own **aliasing**
Header term: `original.toList()` copies only the *outer* real list;
every one of its own real inner lists is still the exact same,
`const`-derived, genuinely immutable list the original had — attempting
to mutate one throws a real, specific error, not a silent no-op. The
real fix, `original.map((row) => List<int?>.from(row)).toList())`,
builds a genuinely new, independent, real inner list for every row —
confirmed, real-run, to allow mutation while leaving `original` itself
completely untouched.

### Discard

This lab is discarded — `original`/`shallowCopy`/`deepCopy` never
appear in `project/`; the real fix `project/lib/main.dart` now depends
on is the identical real expression, shown above in The New Code,
applied to `_displayPuzzle` specifically.

### Mechanical Walkthrough

- `InkWell(onTap: onTap, child: Container(...))` — reappearing in full
  from Lesson 32, identical real shape to `SudokuCellView`'s own
  wrapping.
- `decoration: BoxDecoration(border: Border.all())` — `BoxDecoration`,
  reappearing from Lesson 31; `Border.all()`, this lesson's own new
  Header entry — one real, uniform border, no per-side logic needed.
- `Text('$digit', style: const TextStyle(fontSize: 18))` — `Text`,
  reappearing from Lesson 26; `style:`, this lesson's own new
  `TextStyle` Header entry, a real, separate, optional object
  describing *how* to draw the string, distinct from the string itself.
- `final List<List<int?>> _cells = _displayPuzzle.map((row) => List<int?>.from(row)).toList();`
  — `final`, reappearing from Lesson 5 (this exact field is this
  lesson's own real, legitimate lint fix, discovered by real,
  triggered `flutter analyze` output, not merely assumed); `.map`,
  reappearing from Lesson 9; `List<int?>.from(row)`, this lesson's own
  real, direct fix for the aliasing trap just proved — a genuinely new,
  independent real list per row.
- `void _enterDigit(int digit) { ...; if (row == null || col == null) { return; } setState(() { _cells[row][col] = digit; }); }`
  — `if`/`return`, reappearing from Lessons 6/8; `_cells[row][col] =
  digit`, the real index operator (reappearing from Lesson 9), now
  genuinely mutating a real, independent list rather than throwing;
  `setState`, reappearing from Lesson 28, the exact same real mechanism
  `_selectCell` already used, reused here for different real data.

### CS Lens

The real fix — mapping over every row to build a genuinely new,
independent list — is a real, working instance of **deep versus shallow
copying** — a real, named distinction between duplicating a container
and duplicating everything that container refers to.

```
Also recognized in: a version-control system's own shallow clone (just
the latest snapshot) versus a full clone (every real historical commit),
a spreadsheet's own "paste values" versus "paste formula reference,"
a photo editor's own "flatten image" (bakes every layer into one) versus
keeping real, independent layers
```

### SE Lens

The alternative — declaring `_displayPuzzle` as a real, ordinary
(non-`const`) mutable list from the start, sidestepping this whole real
hazard — was rejected because `const` genuinely, correctly describes
what `_displayPuzzle` itself actually is: a fixed, unchanging, real
starting configuration, and Lesson 5's own real `const` rules exist
precisely to let the compiler guarantee that. The real cost accepted
instead: a real, deliberate copy step, with its own real, easy-to-miss
failure mode (this exact lesson's own aliasing trap) — a small, honest
price for keeping the *source* data genuinely, provably constant.

### Commands Needed

- `dart run aliasing_trap.dart` — plain Dart, no Flutter needed (this
  lab touches no widget, only `dart:core` lists).

### Run It

Real, captured output, this session — shown above in the Isolate step.

### Connect

A tapped digit can now genuinely reach a real, mutable cell — but the
number pad isn't wired into the real screen yet, and adding it, as the
next unit shows for real, doesn't go smoothly on the first try.

---

## Concept Unit: Fitting It All On Screen

### The Problem

`NumberPadView` and the real `_enterDigit` wiring both exist now — what
happens, for real, the moment the number pad is actually added to
`SudokuApp`'s own real, already-full screen (a board, a session-status
row, an `AppBar`)?

> **Pause and think:** Lesson 30 deliberately, artificially triggered a
> real `RenderFlex overflowed` error in an isolated lab, to prove the
> mechanism without waiting for it to happen by accident. Given this
> project's own real screen already held a 324-logical-pixel-tall board
> plus a real session-status row, all inside a `SizedBox`-free
> `Column`, what would you predict happens the moment a real,
> additional 132-pixel-tall number pad gets added to that same column,
> without changing anything else about the layout?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/main.dart`, modified further. **Change type:** refactor.
**Location:** `SudokuApp.build()`'s own `body:`. **Dependencies:**
unchanged.

### The New Code

```dart
body: SingleChildScrollView(
  padding: const EdgeInsets.all(16),
  child: Column(
    children: [
      SudokuBoardView(/* ... */),
      const SizedBox(height: 16),
      NumberPadView(onDigitTap: _enterDigit),
      const SizedBox(height: 16),
      const _SessionStatus(),
    ],
  ),
),
```

### The Updated Project

The complete, real `SudokuApp.build()`, with every change from this
lesson's own three units marked together:

```dart
1  Widget build(BuildContext context) {
2    return MaterialApp(
3      home: Scaffold(
4        appBar: AppBar(title: const Text('Sudoku')),
5        body: SingleChildScrollView(                                     // ← changed (was Padding, no scrolling)
6          padding: const EdgeInsets.all(16),
7          child: Column(
8            children: [
9              SudokuBoardView(                                            // ← changed (Expanded/Align removed)
10               cells: _cells,                                           // ← changed
11               selectedRow: _selectedRow,
12               selectedCol: _selectedCol,
13               onCellTap: _selectCell,
14             ),
15             const SizedBox(height: 16),                                 // ← new
16             NumberPadView(onDigitTap: _enterDigit),                     // ← new
17             const SizedBox(height: 16),                                 // ← new
18             const _SessionStatus(),
19           ],
20         ),
21       ),
22     ),
23   );
24 }
```

### Isolate and Discard

Not applicable — this real, organic failure and its real fix happened
directly against `project/`'s own permanent test suite, not a
throwaway lab.

### Execution Trace

Real, run this session, via `flutter test` — a real, un-staged failure,
not deliberately triggered like Lesson 30's own lab:

```
A RenderFlex overflowed by 52 pixels on the bottom.
The relevant error-causing widget was:
  Column
  Column:file:///.../lib/sudoku_board_view.dart:19:12
```

1. `SudokuApp`'s own `Column` — board, number pad, session status — was
   handed real, bounded constraints matching `flutter_test`'s own fixed
   surface height.
2. Every real child's own natural height, summed (board: `324`; number
   pad: `132`; session status: roughly `80`; two `16`-pixel gaps;
   `32` pixels of body padding), genuinely exceeded that real bound by
   `52` real pixels.
3. This is exactly Lesson 30's own real mechanism, met again: real
   children wanting more real space than a `Column` was given, reported
   with a real, exact number — here, organically, not staged.

Fixed by removing the previous `Expanded`/`Align` wrapping around the
board (no longer the right real tool, now that several naturally-sized
real sections share one screen) and wrapping the whole real body in
`SingleChildScrollView` instead — letting the `Column` be its own real,
natural (if too-tall-for-one-screen) size, with real scrolling handling
the rest.

A second, real, honest consequence followed immediately:

```
Warning: A call to tap() ... derived an Offset (Offset(400.0, 612.0))
that would not hit test on the specified widget. ... Offset(400.0,
612.0) is outside the bounds of the root of the render tree,
Size(800.0, 600.0).
```

The real "Start New Game" button, now real-scrolled below the visible
600-pixel test surface, couldn't be reached by `tester.tap`'s own real,
coordinate-based simulated touch. Fixed with this lesson's own new
`tester.ensureVisible` Header entry, called immediately before the real
tap in `project/test/session_status_test.dart`.

A third, real, honest discovery followed while testing the number pad
itself: a first real attempt used `find.text('7')` to find the number
pad's own "7" button, and failed — `"ambiguously found multiple
matching widgets"` — because the real milestone puzzle's own board
*already* displays a real "7" digit in more than one cell. Fixed with a
precise, scoped real finder:
`find.descendant(of: find.byType(NumberPadView), matching: find.text('7'))`.

### CS Lens

A real layout failure appearing *organically*, from ordinary, real
feature growth, rather than being deliberately staged, is real, direct
proof that Lesson 30's own mechanism was never a special case built for
one lab — it's the same real protocol every `RenderFlex` in this
project runs, every time, whether or not anyone's watching for it.

```
Also recognized in: a database schema that works fine until real
production data volume reveals a missing index, a compiler's own
resource limit (stack depth, memory) that only surfaces once a real
program grows past a threshold nobody deliberately tested for, a real
API rate limit nobody notices until real traffic actually reaches it
```

### SE Lens

The alternative — permanently fixing the board's own on-screen size at
whatever made it fit *before* the number pad existed, rather than making
the whole screen scrollable — was rejected because it doesn't scale:
the real session status row, the real number pad, and Lesson 34's own
future real additions (win/lose messages, a difficulty display) will
keep needing real vertical space, and a real phone's own actual screen
size (Lesson 26's own real Motorola Razr, 1080×2640, a very different
real aspect ratio from this session's own 800×600 test default) makes
"assume it always fits" a genuinely false assumption to build on. The
real cost accepted instead: every test touching scrollable content now
has to consider real visibility explicitly, exactly the real, second-
order consequence this unit's own `tester.ensureVisible` fix already
had to pay.

### Commands Needed

- `flutter test` — real, captured output, this session, already shown
  above and in this lesson's own closing "Connect the Pieces."

### Run It

Real, captured output, this session — shown above in the Execution
Trace; final, complete real suite output shown in this lesson's own
closing section.

### Connect

Every real piece — the board, the number pad, the session status — now
fits on one real, if scrollable, screen, and every real test reaches
every real widget it needs to, including the ones a real, deliberate
scroll is now required to reach.

---

## Connect the Pieces

Follow the real digit `7` through everything this lesson built:

1. `NumberPadView.build()` (Concept Unit 1) computes `digit = 2 * 3 + 0
   + 1 = 7` for the real button at `rowIndex: 2, colIndex: 0` —
   curriculum's own exact literal layout, real-derived from simple
   arithmetic, not hand-typed nine separate times.
2. A real, simulated tap reaches that button's own real `InkWell`
   (Concept Unit 2), calling the real closure `NumberPadView.build()`
   built for it: `() => onDigitTap(7)`.
3. That real call reaches `_SudokuAppState._enterDigit(7)`, which reads
   the real, currently-selected `_selectedRow`/`_selectedCol` (Lesson
   32's own state) and, finding both real and non-null, calls `setState`
   to write `7` into `_cells[row][col]` — the exact real field this
   lesson's own aliasing-trap lab (Concept Unit 2) proved was safe to
   mutate, unlike the original, still-`const` `_displayPuzzle` it was
   copied from.
4. A real rebuild follows; `SudokuBoardView`, reading the same real
   `_cells` list, shows the real `7` in the exact real cell that was
   selected — real, confirmed by this lesson's own permanent test,
   `project/test/number_pad_test.dart`.
5. Getting the whole real screen to actually show all of this at once
   required Concept Unit 3's own real, organic overflow fix
   (`SingleChildScrollView`) and its own two real, honest downstream
   consequences (`tester.ensureVisible`; a precise, scoped `Finder`)
   — none of it staged, all of it kept.

`project/`'s own real Sudoku app can now genuinely be played, start to
finish, at least mechanically — select a cell, tap a digit, watch it
appear — with no real Sudoku rules enforced at all yet (a given clue can
be overwritten; nothing checks for conflicts). That's honest, and
deliberate: curriculum's own explicit architectural point is that the
UI should not implement Sudoku rules, and Lesson 34, next, is where the
real, already-fully-tested `SudokuBoard` engine — untouched since Phase
2 — finally takes over that real job.
