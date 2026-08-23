# Lesson 31: Eighty-One Widgets, One Grid

**What you will build:** `project/`'s own real screen finally shows an
actual Sudoku board — a real 9×9 grid of real, bordered cells, each
showing either a real digit or nothing, thicker real borders marking
each 3×3 region, and one real cell (this lesson's own hardcoded choice:
row 4, column 4 — the exact same real cell Lesson 21 already proved is
a naked single in this exact puzzle) visibly highlighted as selected.
The real data is Phase 1's own real milestone puzzle, duplicated here
for display only — curriculum's own explicit architectural point is
that connecting this board to the *real* `SudokuBoard` engine is Lesson
34's job, not this one; this lesson builds the screen half in isolation
first, on purpose.

**What you need to know first:**
- Lesson 5 — `final`, `const`.
- Lesson 6 — the modulo operator (`%`), the ternary expression, `==`.
- Lesson 8 — named, required parameters.
- Lesson 9 — the real index operator (`[]`), reused for every real
  `cells[row][col]` read in this lesson's own code.
- Lesson 12 — `extends`.
- Lesson 15 — anonymous functions, reused for every real generator
  function this lesson passes to `List.generate`.
- Lesson 17 — `List.generate`, reused here to build both axes of a real
  9×9 grid; the real milestone puzzle's own `List<List<int?>>` shape,
  reused verbatim as this lesson's own display data.
- Lesson 20 — the "don't store what you can cheaply recompute"
  reasoning, reused directly in this lesson's own SE lens.
- Lesson 21 — the real milestone puzzle's own cell `(4, 4)`, already
  proved there to be a naked single — reused here, unchanged, as this
  lesson's own hardcoded "selected" cell.
- Lesson 24 — the real, permanent `project/test/` convention, reused for
  this lesson's own new test file.
- Lesson 25 — `StatelessWidget`, `BuildContext`, and the real **paint**
  pipeline stage a cell's own `BoxDecoration` is actually applied
  during.
- Lesson 26 — `SizedBox`, `Text`.
- Lesson 27 — `super.key`, `required`/`this.field` shorthand.
- Lesson 29 — `Row`, `Column`, and everything this lesson's own grid
  structure is built from.
- Lesson 30 — the real constraint mechanism underneath every one of
  this lesson's own 81 real cells being laid out correctly.

**Terms used in this lesson:**
- **`BoxDecoration`** — new: a real, immutable value describing how to
  paint a box's own background and border, handed to a `Container`'s
  own `decoration:` parameter. It exists because a plain `Container`
  has no real opinion about borders or background color on its own —
  `BoxDecoration` is the real, separate object that supplies one.
- **`Border` / `BorderSide`** — new: `Border` is a real value holding
  four real `BorderSide`s (`top`/`right`/`bottom`/`left`), each with its
  own real `width`. It exists so each of a box's own four real edges can
  have a genuinely different real thickness — exactly what a Sudoku
  cell's own 3×3-boundary borders need.

**Objects and methods used:**

- **`SudokuBoardView`**
  - *What it is:* this project's own new, real, top-level widget
    representing the whole real 9×9 board.
  - *Implementation:* real, from `project/lib/sudoku_board_view.dart`:
    `class SudokuBoardView extends StatelessWidget { const SudokuBoardView({super.key, required this.cells, this.selectedRow, this.selectedCol}); final List<List<int?>> cells; final int? selectedRow; final int? selectedCol; }`.
  - *Its use:* constructed once, inside `SudokuApp.build()`, replacing
    Lesson 26's own `_PlaceholderMessage` — this lesson's own real,
    named payoff for that placeholder's own name.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to take a real 9×9 grid of digits (or `null`) and
    an optional real selected position, and build a real, complete
    visual board from them — nothing about *how* those digits got
    decided is this widget's own concern.
  - *Depends on:* a real `List<List<int?>>`, exactly 9 by 9; optionally,
    one real selected row/column pair.
  - *Connects to:* constructed by `SudokuApp.build()`; its own `build()`
    constructs 81 real `SudokuCellView`s.
  - *Shape:* a public, directly-constructed widget — this project's own
    first real, dedicated UI class living in its own file, not
    `main.dart`.

- **`SudokuCellView`**
  - *What it is:* this project's own new, real widget for exactly one
    Sudoku cell.
  - *Implementation:* real, from the same file:
    `class SudokuCellView extends StatelessWidget { const SudokuCellView({super.key, required this.row, required this.col, required this.value, required this.isSelected}); final int row; final int col; final int? value; final bool isSelected; }`.
  - *Its use:* constructed 81 real times by `SudokuBoardView.build()`,
    each with its own real, distinct `row`/`col`/`value`/`isSelected`.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to draw one real, bordered box, showing its own
    real `value` (or nothing), tinted if it's the real selected cell,
    with border thickness that depends on its own real position within
    the 3×3 region grid.
  - *Depends on:* its own real `row`/`col` (to decide border thickness
    and position), `value` (what to show), `isSelected` (whether to
    tint it).
  - *Connects to:* constructed by `SudokuBoardView.build()`; its own
    `build()` constructs one real `Container` wrapping one real `Text`.
  - *Shape:* a small, public, directly-constructed widget — this
    project's own first real, reusable "one grid cell" pattern, a shape
    Lesson 65 onward (a whole future game platform) will see again in
    other games' own grids.

- **`Container`**
  - *What it is:* reappearing in full from Lesson 30 (used there only
    as a plain, resizable probe) — here given its own real, meaningful
    use for the first time: a real, decorated, fixed-size box.
  - *Implementation:* real shape used here:
    `Container({super.key, this.width, this.height, this.alignment, this.decoration, this.child, ...})`.
  - *Its use:* `SudokuCellView.build()` constructs one, real, 36×36
    logical pixels, decorated with a real `BoxDecoration`.
  - *Type:* a concrete class, itself composed internally of several
    smaller real widgets (`Padding`, `DecoratedBox`, `ConstrainedBox`,
    among others — not detailed further here).
  - *Responsibility:* to occupy a real, fixed size, paint a real
    background/border via its own `decoration`, and center its own real
    child within itself via `alignment`.
  - *Depends on:* its own real `width`/`height`/`decoration`/`child`,
    all optional individually.
  - *Connects to:* wraps a real `Text` inside `SudokuCellView`.
  - *Shape:* a small, public, extremely commonly used real widget —
    Flutter's own real "just give me a decorated box" tool.

- **`BoxDecoration`**
  - *What it is:* this lesson's own new Header term, given full
    treatment: a real, immutable description of a box's own real
    background color and border.
  - *Implementation:* real shape used here:
    `const BoxDecoration({this.color, this.border, ...})`.
  - *Its use:* `SudokuCellView.build()` constructs one real
    `BoxDecoration` per cell, `color` set only when `isSelected` is
    real and `true`, `border` built fresh from that cell's own real
    `row`/`col`.
  - *Type:* an immutable value class (not a `Widget`).
  - *Responsibility:* to hold real paint instructions a `Container`
    (via its own internal `DecoratedBox`) actually applies during the
    real **paint** stage (Lesson 25's own already-named pipeline stage).
  - *Depends on:* nothing to construct — every real field is optional.
  - *Connects to:* constructed inside `Container`'s own `decoration:`
    argument.
  - *Shape:* a small, public, real value type.

- **`Border` / `BorderSide`**
  - *What it is:* this lesson's own new Header term, given full
    treatment — `Border` real-composed of four real `BorderSide`
    values.
  - *Implementation:* real shapes used here:
    `const Border({this.top = BorderSide.none, this.right = BorderSide.none, this.bottom = BorderSide.none, this.left = BorderSide.none})`,
    `const BorderSide({this.width = 1.0, ...})`.
  - *Its use:* `SudokuCellView.build()` constructs one real `Border`
    per cell, computing each of its four real `BorderSide` widths from
    that cell's own real `row`/`col` — this lesson's own central,
    concrete answer to curriculum's own "3×3 regions" bullet.
  - *Type:* two immutable value classes.
  - *Responsibility:* to hold four independently real-configurable edge
    widths, letting one cell's own top edge be thick while its own
    right edge stays thin.
  - *Depends on:* nothing to construct — every real field is optional
    with a real default.
  - *Connects to:* four real `BorderSide` values constructed directly
    inside `Border`'s own four named arguments.
  - *Shape:* small, public, real value types.

---

## Concept Unit: The 9×9 Grid

### The Problem

Lesson 26's own `_PlaceholderMessage` has said "Board goes here" since
it was written. Phase 1's own real milestone puzzle
(`bin/sudoku_console.dart`) is a real `List<List<int?>>`, 9 real rows of
9 real values each. What's the smallest real widget structure that turns
81 real values into 81 real, visually arranged boxes?

> **Pause and think:** Lesson 29's own real, measured proof already
> showed a `Column` stacks children top to bottom and a `Row` places
> them left to right — given a 9×9 grid is genuinely both (9 real rows,
> each holding 9 real columns), what would you guess the smallest real
> combination of the two actually looks like? Given Lesson 17's own real
> `List.generate(count, generator)`, already proven to build a list from
> a real, repeated pattern, what would you guess happens if you call it
> *inside* another call to itself?

### Project Change

**Reference Source:** no reference implementation — this project's own,
from-scratch board. **Files affected:**
`project/lib/sudoku_board_view.dart` (created);
`project/lib/main.dart` (modified — `_PlaceholderMessage` replaced).
**Change type:** add; replace. **Location:** a new file; inside
`SudokuApp.build()`'s own `Align`. **Dependencies:** none beyond
`package:flutter/material.dart`, already used throughout.

### The New Code

```dart
class SudokuBoardView extends StatelessWidget {
  const SudokuBoardView({super.key, required this.cells, this.selectedRow, this.selectedCol});

  final List<List<int?>> cells;
  final int? selectedRow;
  final int? selectedCol;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(
        9,
        (row) => Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(
            9,
            (col) => SudokuCellView(
              row: row,
              col: col,
              value: cells[row][col],
              isSelected: row == selectedRow && col == selectedCol,
            ),
          ),
        ),
      ),
    );
  }
}
```

### The Updated Project

This is a brand-new file with nothing surrounding this fragment yet —
Project Change already covers this case. `project/lib/main.dart`'s own
real change is shown in this lesson's own next unit, once
`SudokuCellView` — referenced here but not yet defined — actually
exists.

### Isolate and Discard

Not applicable — every construct this code uses (`List.generate`,
`Row`, `Column`) was already given a real, isolated lab in the specific
earlier lesson cited in this lesson's own Header, and gets full,
real re-explanation below, per the Repetition Rule, rather than a new
lab for already-proved syntax.

### Mechanical Walkthrough

- `class SudokuBoardView extends StatelessWidget` — `extends`,
  reappearing from Lesson 12; `StatelessWidget`, reappearing from Lesson
  25 — this project's own first *dedicated* UI class, not a widget
  built inline inside another method.
- `const SudokuBoardView({super.key, required this.cells, this.selectedRow, this.selectedCol});`
  — `super.key`, reappearing from Lesson 27; `required`, reappearing
  from Lesson 8, applied only to `cells` — a real board with no data at
  all is a genuine compile error; `selectedRow`/`selectedCol` stay
  optional (real, nullable `int?`, reappearing from Lesson 5/10),
  because a board with nothing selected is a genuinely valid real state.
- `Column(mainAxisSize: MainAxisSize.min, children: List.generate(9, (row) => Row(...)))`
  — `Column`, reappearing in full from Lesson 29; `List.generate(9,
  (row) => ...)`, reappearing in full from Lesson 17 — real-run-proved
  there to build a list from a repeated real pattern — called here with
  a real anonymous function (reappearing from Lesson 15) that ignores
  nothing: `row`, the real index `List.generate` hands it each time,
  from `0` through `8`, is read directly to build that row's own real
  content.
- `Row(mainAxisSize: MainAxisSize.min, children: List.generate(9, (col) => SudokuCellView(...)))`
  — the identical real pattern, nested one level in — `List.generate`
  called *inside* the outer one's own generator function, once per real
  outer `row`, producing 9 real inner calls each — `9 × 9 = 81` real
  `SudokuCellView`s, genuinely, not a coincidence of the two real
  numbers matching.
- `cells[row][col]` — real index-operator access (reappearing from
  Lesson 9), reading the real digit (or `null`) at this exact real
  position from the `cells` field this widget itself was constructed
  with.
- `row == selectedRow && col == selectedCol` — `==`/`&&`, reappearing in
  full from Lesson 6 — real, exact, both real coordinates must match for
  this one real cell, out of 81, to be told it's selected.

### CS Lens

Nested `List.generate` calls building a real 2D structure from two real
1D loops is a real, working instance of **iterating over a Cartesian
product** — every real combination of a row index and a column index,
systematically, without missing or repeating one.

```
Also recognized in: a spreadsheet engine iterating every real cell in a
grid, a chess engine enumerating every real square on an 8×8 board, a
tilemap renderer in a 2D game drawing every real tile in a level,
nested `for` loops over pixel rows and columns in an image filter
```

### SE Lens

The alternative — a single, flat `List<SudokuCellView>` of 81 real
widgets, computing each one's own row/col from a single real index via
division and modulo — was rejected in favor of the real, nested
`Row`-of-`Column` (or here, `Column`-of-`Row`) shape specifically because
it lets `Row`/`Column`'s own already-real layout logic (Lesson 29) do
the actual 2D arrangement, rather than this project re-deriving pixel
positions by hand. The real cost: this shape assumes every real row has
exactly the same real number of columns — true for a Sudoku board,
specifically, but not a free, general-purpose grid; a genuinely
irregular real grid would need a different real structure entirely.

### Commands Needed

None beyond `flutter analyze`/`flutter test`, already explained.

### Run It

Deferred to this lesson's own final unit's Run It step — `SudokuCellView`
doesn't exist as real code yet; the Verification Rule's own Batching
guidance prefers one real run over the finished file to a run against
an incomplete one.

### Connect

81 real `SudokuCellView`s are now requested, in the right real
positions — but that class doesn't exist yet. The next unit builds it.

---

## Concept Unit: `SudokuCellView` — One Real Box, One Real Value

### The Problem

`SudokuBoardView` references `SudokuCellView` with four real,
per-cell values — `row`, `col`, `value`, `isSelected`. What's the
smallest real widget that turns those four real values into one visible
box showing a digit or nothing?

> **Pause and think:** Lesson 27's own `_PlaceholderMessage` already
> showed the shape of a small, `required`-parameterized `StatelessWidget`
> — given `value` here is genuinely allowed to be `null` (an empty
> Sudoku cell) while `row`/`col`/`isSelected` are not, what real,
> different treatment would you expect `value`'s own declared type to
> need compared to the other three?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/sudoku_board_view.dart`, extended (same file as the
previous unit). **Change type:** add. **Location:** a new class, below
`SudokuBoardView`. **Dependencies:** unchanged.

### The New Code

```dart
class SudokuCellView extends StatelessWidget {
  const SudokuCellView({
    super.key,
    required this.row,
    required this.col,
    required this.value,
    required this.isSelected,
  });

  final int row;
  final int col;
  final int? value;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      child: Text(value == null ? '' : '$value'),
    );
  }
}
```

(Borders and the real selected-cell tint are this lesson's own next two
units — this stage shows a plain, undecorated real box, to isolate this
unit's own subject: showing the right real value at all.)

### The Updated Project

The complete, real `project/lib/sudoku_board_view.dart`, with this
unit's own new class added after the previous unit's own
`SudokuBoardView`:

```dart
1  import 'package:flutter/material.dart';
2
3  class SudokuBoardView extends StatelessWidget {
4    const SudokuBoardView({super.key, required this.cells, this.selectedRow, this.selectedCol});
5
6    final List<List<int?>> cells;
7    final int? selectedRow;
8    final int? selectedCol;
9
10   @override
11   Widget build(BuildContext context) {
12     return Column(
13       mainAxisSize: MainAxisSize.min,
14       children: List.generate(
15         9,
16         (row) => Row(
17           mainAxisSize: MainAxisSize.min,
18           children: List.generate(
19             9,
20             (col) => SudokuCellView(
21               row: row,
22               col: col,
23               value: cells[row][col],
24               isSelected: row == selectedRow && col == selectedCol,
25             ),
26           ),
27         ),
28       ),
29     );
30   }
31 }
32
33 class SudokuCellView extends StatelessWidget {                          // ← new
34   const SudokuCellView({                                                // ← new
35     super.key,                                                          // ← new
36     required this.row,                                                  // ← new
37     required this.col,                                                  // ← new
38     required this.value,                                                // ← new
39     required this.isSelected,                                           // ← new
40   });                                                                    // ← new
41
42   final int row;                                                        // ← new
43   final int col;                                                        // ← new
44   final int? value;                                                     // ← new
45   final bool isSelected;                                                // ← new
46
47   @override                                                             // ← new
48   Widget build(BuildContext context) {                                  // ← new
49     return Container(                                                   // ← new
50       width: 36,                                                        // ← new
51       height: 36,                                                       // ← new
52       alignment: Alignment.center,                                      // ← new
53       child: Text(value == null ? '' : '$value'),                       // ← new
54     );                                                                   // ← new
55   }                                                                      // ← new
56 }                                                                       // ← new
```

`SudokuBoardView`'s own real reference to `SudokuCellView`, from the
previous unit, now resolves to a real, complete class.

### Isolate and Discard

Not applicable — every construct this class uses (`required`,
`this.field`, the ternary expression, `Container`, `Text`) was already
given a real, isolated lab in the specific earlier lesson cited in this
lesson's own Header.

### Mechanical Walkthrough

- `final int? value;` — a real, nullable field (reappearing from Lesson
  5/10) — the one real field among the four allowed to be `null`,
  because an empty Sudoku cell is a real, valid, expected state, unlike
  a cell with no real row or column.
- `Container(width: 36, height: 36, alignment: Alignment.center, child: ...)`
  — this lesson's own new `Container` Header entry: a real, fixed
  36×36-logical-pixel box; `alignment: Alignment.center`, reappearing
  `Alignment` value from Lesson 29, centers this cell's own real child
  within that fixed real size.
- `Text(value == null ? '' : '$value')` — the ternary expression,
  reappearing in full from Lesson 6: real-run-proved there to be a
  genuine expression, not a statement — here choosing between a real
  empty string and a real, interpolated digit based on whether `value`
  is genuinely `null`; string interpolation, reappearing from Lesson 5.

### CS Lens

One small, real, `required`-parameterized widget, reused 81 real times
with 81 genuinely different real argument sets, is a real, direct
instance of **the same template, instantiated with different real
data** — the same idea Lesson 20's own `generateComplete`/`removeDigits`
already applied to algorithms (one real function, many real random
seeds), here applied to UI instead.

```
Also recognized in: a spreadsheet's own single cell-rendering formula
applied to every real cell in a sheet, an HTML `<template>` element
stamped out once per real data row, a game engine's own single "enemy"
prefab spawned with different real health/position values per instance
```

### SE Lens

The alternative — inlining all 81 real cells' own widget trees directly
inside `SudokuBoardView.build()`, with no separate `SudokuCellView`
class at all — was rejected because it would make `SudokuBoardView`'s
own `build()` enormous and would prevent testing one real cell's own
behavior in isolation (this lesson's own real,
permanent test file does exactly that, testing `SudokuCellView`
directly, never needing to construct a whole real board just to check
one cell's own real border width). The real cost: one more real, small
class and, per Lesson 25's own architecture, 81 more real `Element`s in
the tree instead of a hypothetical single, larger one — a real, small
overhead this project already accepted once, for `Padding` (Lesson 29's
own SE lens made the same real tradeoff explicitly).

### Commands Needed

None beyond `flutter analyze`/`flutter test`, already explained.

### Run It

Deferred — this stage doesn't have real borders or a real selected-cell
tint yet; this lesson's own final unit's Run It step covers the
complete, real, final version, per the Verification Rule's own Batching
guidance.

### Connect

Every real cell now shows its own correct real digit or nothing. The
next unit gives each cell its own real, 3×3-aware border.

---

## Concept Unit: Borders and 3×3 Regions

### The Problem

Every real cell currently looks identical except for its own digit — no
real grid lines at all, and nothing marking where one 3×3 box ends and
the next begins. A real Sudoku board's own defining visual feature is
exactly that: thin lines between ordinary cells, thick lines at every
3×3 boundary. What real, per-cell logic decides which is which?

> **Pause and think:** Given a cell's own real `row`/`col` range from
> `0` to `8`, and Sudoku's own real 3×3 regions start at rows/columns
> `0`, `3`, and `6` — what real, simple arithmetic test would tell you
> "this cell's own top edge is the start of a new region"? Given Lesson
> 6's own real, run-proved modulo operator (`%`), what would `row % 3`
> actually equal for rows `0`, `3`, and `6` specifically, compared to
> rows `1`, `2`, `4`, `5`, `7`, `8`?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/sudoku_board_view.dart`, modified. **Change type:** add.
**Location:** inside `SudokuCellView.build()`'s own `Container`.
**Dependencies:** unchanged.

### The New Code

```dart
decoration: BoxDecoration(
  border: Border(
    top: BorderSide(width: row % 3 == 0 ? 2 : 0.5),
    left: BorderSide(width: col % 3 == 0 ? 2 : 0.5),
    right: BorderSide(width: col == 8 ? 2 : 0.5),
    bottom: BorderSide(width: row == 8 ? 2 : 0.5),
  ),
),
```

### The Updated Project

The complete, real `SudokuCellView.build()`, with this unit's own new
lines marked:

```dart
1  Widget build(BuildContext context) {
2    return Container(
3      width: 36,
4      height: 36,
5      alignment: Alignment.center,
6      decoration: BoxDecoration(                                        // ← new
7        border: Border(                                                 // ← new
8          top: BorderSide(width: row % 3 == 0 ? 2 : 0.5),               // ← new
9          left: BorderSide(width: col % 3 == 0 ? 2 : 0.5),              // ← new
10         right: BorderSide(width: col == 8 ? 2 : 0.5),                 // ← new
11         bottom: BorderSide(width: row == 8 ? 2 : 0.5),                // ← new
12       ),                                                                // ← new
13     ),                                                                  // ← new
14     child: Text(value == null ? '' : '$value'),
15   );
16 }
```

### Isolate and Discard

Not applicable — `%`, the ternary expression, and named-argument
construction were all already given real, isolated labs in earlier
lessons.

### Mechanical Walkthrough

- `border: Border(top: ..., left: ..., right: ..., bottom: ...)` — this
  lesson's own new `Border` Header entry: four real, independently
  configured `BorderSide`s — one real edge, four real, potentially
  different real thicknesses.
- `BorderSide(width: row % 3 == 0 ? 2 : 0.5)` — this lesson's own new
  `BorderSide` Header entry; `row % 3`, reappearing modulo from Lesson
  6: real-computed, exactly `0` for rows `0`, `3`, `6` (the top edge of
  each real 3×3 region) and non-zero otherwise; the ternary expression
  picks a real `2`-pixel width for a region boundary, `0.5` otherwise.
- `BorderSide(width: col % 3 == 0 ? 2 : 0.5)` — the identical real
  pattern, applied to the `left` edge using `col` instead of `row`.
- `BorderSide(width: col == 8 ? 2 : 0.5)` / `BorderSide(width: row == 8 ? 2 : 0.5)`
  — `==`, reappearing from Lesson 6: the real board's own outer right
  and bottom edges need their own real, explicit check, since `col % 3
  == 0`/`row % 3 == 0` alone would never catch the *last* column/row
  (`8 % 3 = 2`, not `0`) — every *interior* boundary is caught by the
  modulo check; only the real, outermost edge needs this separate,
  explicit case.

### Execution Trace

Real, run this session, via `flutter test test\
sudoku_board_view_test.dart` — real, measured, not assumed:

```
cells on a 3x3 boundary get a real, thicker border
```

1. Real cell `(0, 0)` — `row % 3 == 0` (`0 % 3 = 0`) and `col % 3 == 0`
   (`0 % 3 = 0`) both real-true — its own real `top`/`left` border
   widths measured at exactly `2`.
2. Real cell `(1, 1)` — `row % 3 == 0` (`1 % 3 = 1`, false) and `col %
   3 == 0` (`1 % 3 = 1`, false) — its own real `top`/`left` border
   widths measured at exactly `0.5`.

### CS Lens

Deciding a real, per-item visual property from that item's own real
position via modulo arithmetic is a real, working instance of **periodic
pattern detection** — the same real idea underneath a calendar
highlighting every seventh real day as a weekend, a spreadsheet's own
alternating real row-striping, a chessboard's own real light/dark square
pattern (`(row + col) % 2`).

```
Also recognized in: CSS's own `:nth-child(3n)` selector, a musical
sequencer's own beat markers every fourth real step, a manufacturing
line's own quality-check station triggered every Nth real unit
```

### SE Lens

The alternative — storing a real, precomputed "is this a region
boundary" flag on each cell ahead of time, rather than computing it from
`row`/`col` on every real build — was rejected because the real
computation is cheap (a single real modulo and comparison) and the
*data* (`row`, `col`) already fully determines the answer; storing a
separate, derived real flag would risk it silently going stale if a
cell's own position ever changed without updating the flag too — the
same real "don't store what you can cheaply recompute" reasoning Lesson
20's own SE lens already applied to `hasUniqueSolution` versus caching
a stale result.

### Commands Needed

None beyond `flutter test`, already explained.

### Run It

Real, captured output, this session — shown above in the Execution
Trace.

### Connect

Every real cell now shows correct real grid lines, thick exactly where
a 3×3 region actually starts or the board actually ends. The last unit
gives one real cell its own visual selected state.

---

## Concept Unit: The Selected Cell

### The Problem

Curriculum's own Lesson 31 bullets name "Selected cell" as its own real
concept, distinct from Lesson 32's own later "Selection state" (which
covers *choosing* a cell by a real tap). This lesson's own job is
narrower: what does a selected cell actually *look like*, given the
data already exists (`SudokuCellView.isSelected`, built in this
lesson's own first unit)?

> **Pause and think:** Given `BoxDecoration`'s own real `color:`
> parameter is optional, defaulting to no real color at all when
> omitted — what real, minimal change would make exactly one cell out
> of 81 look different, using only data this lesson's widgets already
> compute (`isSelected`)?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/sudoku_board_view.dart`, modified further;
`project/lib/main.dart`, modified (replacing `_PlaceholderMessage`);
`project/test/main_smoke_test.dart` and
`project/test/sudoku_board_view_test.dart`, created/updated.
**Change type:** add; replace. **Location:** `SudokuCellView.build()`'s
own `BoxDecoration`; `SudokuApp.build()`'s own `Align`. **Dependencies:**
unchanged.

### The New Code

```dart
decoration: BoxDecoration(
  color: isSelected ? Colors.blue.shade100 : null,
  border: Border(/* ...unchanged from the previous unit... */),
),
```

### The Updated Project

The complete, real `SudokuCellView.build()`:

```dart
1  Widget build(BuildContext context) {
2    return Container(
3      width: 36,
4      height: 36,
5      alignment: Alignment.center,
6      decoration: BoxDecoration(
7        color: isSelected ? Colors.blue.shade100 : null,                // ← new
8        border: Border(
9          top: BorderSide(width: row % 3 == 0 ? 2 : 0.5),
10         left: BorderSide(width: col % 3 == 0 ? 2 : 0.5),
11         right: BorderSide(width: col == 8 ? 2 : 0.5),
12         bottom: BorderSide(width: row == 8 ? 2 : 0.5),
13       ),
14     ),
15     child: Text(value == null ? '' : '$value'),
16   );
17 }
```

And the complete, real `SudokuApp.build()`'s own body, `_PlaceholderMessage`
finally replaced:

```dart
1  Widget build(BuildContext context) {
2    return MaterialApp(
3      home: Scaffold(
4        appBar: AppBar(title: const Text('Sudoku')),
5        body: const Padding(
6          padding: EdgeInsets.all(16),
7          child: Column(
8            children: [
9              Expanded(
10               child: Align(
11                 alignment: Alignment.center,
12                 child: SudokuBoardView(                               // ← changed
13                   cells: _displayPuzzle,                              // ← new
14                   selectedRow: 4,                                     // ← new
15                   selectedCol: 4,                                     // ← new
16                 ),                                                     // ← new
17               ),
18             ),
19             _SessionStatus(),
20           ],
21         ),
22       ),
23     ),
24   );
25 }
```

`_displayPuzzle` is a new, real, module-level `const List<List<int?>>`
in `main.dart`, a verbatim, real duplicate of the Phase 1 milestone's
own puzzle from `bin/sudoku_console.dart` — an honest, explicitly
commented, temporary duplication, resolved for real when Lesson 34
connects the UI to a real `SudokuBoard` instead.

### Isolate and Discard

Not applicable — the ternary expression is already-established syntax;
`Colors.blue.shade100` is a real, standard Material color constant, used
here without further isolation, matching the same treatment `Colors.
deepPurple` received (unexplained, supporting color) in Lesson 26's own
generated `main.dart`.

### Mechanical Walkthrough

- `color: isSelected ? Colors.blue.shade100 : null` — the ternary
  expression, reappearing; `isSelected`, this cell's own real field,
  computed once, back in this lesson's own first unit
  (`row == selectedRow && col == selectedCol`) — read here, unchanged,
  to decide a real, visible color versus real, explicit `null` (no
  color at all).
- `SudokuBoardView(cells: _displayPuzzle, selectedRow: 4, selectedCol: 4)`
  — real, named arguments (reappearing from Lesson 8); `4, 4` is not an
  arbitrary real choice — it's the exact real cell Lesson 21 already
  proved is a naked single in this exact real puzzle, a small, deliberate
  continuity with this project's own already-established real data.

### Execution Trace

Real, run this session, via `flutter test test\sudoku_board_view_test
.dart`:

```
exactly the real selected cell gets the real highlight color
```

1. `SudokuBoardView(cells: _puzzle, selectedRow: 4, selectedCol: 4)` is
   pumped, real.
2. Real cell `(4, 4)` — `row == selectedRow && col == selectedCol`
   (`4 == 4 && 4 == 4`) real-true — its own real `BoxDecoration.color`
   measured as non-null.
3. Real cell `(4, 5)` — `col == selectedCol` (`5 == 4`) real-false —
   its own real `BoxDecoration.color` measured as exactly `null`.

### CS Lens

One real boolean field (`isSelected`), computed once per cell from two
real integer comparisons, deciding a real visual property, is the same
real, minimal shape as Lesson 28's own `_gamesStarted`/`_elapsedSeconds`
— real, plain data driving what `build()` produces — here read-only
(`StatelessWidget`), there mutable (`StatefulWidget`), because *which*
cell is selected doesn't yet change in this lesson (Lesson 32's own job)
— this lesson only had to make one, real, static choice visible
correctly.

```
Also recognized in: a spreadsheet's own single highlighted "active cell,"
a text editor's own cursor position tracked as plain row/column data, a
map application's own single selected pin among many rendered the same
way
```

### SE Lens

The alternative — giving `SudokuCellView` its own internal, mutable
"selected" state (a `StatefulWidget`, Lesson 28) — was rejected because
*which* cell is selected is real, shared information across all 81
cells at once (only one can be selected), not something any single
cell could correctly own about itself; `SudokuBoardView`, the real
parent, is the only real place that information can live correctly —
exactly Lesson 28's own SE lens, in reverse: some real state belongs on
a parent, not scattered across children who'd have no way to agree.

### Commands Needed

None beyond `flutter analyze`/`flutter test`, already explained.

### Run It

Real, captured output, this session, from the full `flutter test` run:

```
the real body has 16px padding on every side
the elapsed and games-started text sit side by side
PASS: (8 real Sudoku-engine tests, unchanged from Lesson 24)
the Sudoku shell shows a title and a real board
tapping Start New Game increments the real, on-screen count
the elapsed-time counter ticks once per real second
every real cell shows its own given digit, or nothing
cells on a 3x3 boundary get a real, thicker border
exactly the real selected cell gets the real highlight color
All tests passed!
```

No new screenshot this lesson — a real attempt was made (Chrome, this
session's own established technique) and hit a real, unresolved
rendering/capture issue in this specific environment (a persistently
blank captured page despite a clean, error-free launch); logged
honestly in `verification/lesson-31/run-log.md` rather than silently
retried until something looked right. The real, measured widget-test
evidence above is, for this lesson's own specific claims (exact border
widths, exact selected-cell color, exact per-cell values), stronger
proof than a static image would have been regardless.

### Connect

`project/`'s own real screen now shows an actual, real, correctly
bordered 9×9 Sudoku board, with the real milestone puzzle's own digits
in place and one real cell visibly selected.

---

## Connect the Pieces

Follow the real digit `5` — `_displayPuzzle[0][0]`'s own real value,
Phase 1's own real starting clue — through everything this lesson built:

1. `SudokuBoardView.build()` (Concept Unit 1) calls
   `List.generate(9, (row) => Row(children: List.generate(9, (col) =>
   SudokuCellView(...))))` — at `row: 0, col: 0`, this real, nested
   generation reaches `cells[0][0]`, the real value `5`.
2. `SudokuCellView` (Concept Unit 2), constructed with `value: 5`, its
   own real `build()` produces `Text('5')` — real, correct, the exact
   real digit this exact real cell has always had, since the Phase 1
   milestone.
3. That same real cell, at `row: 0, col: 0`, is also on both a row and
   column 3×3 boundary (Concept Unit 3) — its own real `top`/`left`
   border widths, real-measured, come out to exactly `2`, thicker than
   its own real right/bottom edges.
4. It is not, however, the real selected cell — `row == selectedRow &&
   col == selectedCol` (`0 == 4 && 0 == 4`, Concept Unit 4) is real-false
   for this specific cell, so its own real `BoxDecoration.color` stays
   `null`, while the real cell at `(4, 4)`, elsewhere in this same real
   grid, is the one real-measured to carry the real highlight color
   instead.

Every one of these four real facts — the digit, the border widths, the
selected state — was computed from nothing but this cell's own real,
constructor-supplied data (`row`, `col`, `value`, `isSelected`), and
every one was confirmed by a real, passing, permanent test, not assumed
from reading the code alone. `project/lib/sudoku_board_view.dart` is
now a real, complete, standalone visual board — still entirely
disconnected from the real `SudokuBoard` engine Phase 2 already built
and fully tested, exactly as curriculum's own architecture intends,
until Lesson 34 connects the two.
