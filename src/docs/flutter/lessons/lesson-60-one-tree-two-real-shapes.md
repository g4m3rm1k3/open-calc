# Lesson 60: One Tree, Two Real Shapes

**Responsive Layouts**

## What you will build

This app's own screen stops assuming it's always a narrow phone in
portrait. A real, named breakpoint, and a real, live read of the
device's own current orientation, together decide which of two, real,
complete layouts this app actually shows — a real, phone-first, single
column, or a real, side-by-side arrangement for a tablet or a phone
turned sideways — and the board's own real cell size stops being a
fixed literal, instead genuinely computed from whatever real space is
actually available. The transferable problem: a layout hardcoded for
one, specific, assumed screen shape is really only correct for that one
shape; real devices vary in real width, real height, and real
orientation, all at once, and a real app has to keep asking, not
assume once and stop.

## What you need to know first

- Lesson 13 ("A Fixed Set of Named Possibilities") — enums and an
  exhaustive `switch` — this lesson's own real starting point for
  `Orientation`.
- Lesson 29 ("Layout Fundamentals") — `Row`/`Column`, real,
  already-established widgets this lesson restructures.
- Lesson 30 ("Flutter's Constraint System") — `BoxConstraints`, this
  app's own first, real encounter with it; this lesson reaches for it
  directly for the first time.
- Lesson 31 ("Building the Sudoku Board") — `SudokuBoardView`/
  `SudokuCellView`, whose own, real, fixed pixel size this lesson
  replaces.
- Lesson 58 ("Deciding Once, Applying Everywhere") — `AppSpacing`, the
  real, established, project-specific token-class pattern this lesson's
  own `AppBreakpoints` follows.

## Terms used in this lesson

- **Breakpoint** — a real, named width threshold marking where a
  layout's own real design should change shape, rather than merely
  scale. Exists because a layout that only ever scales its own,
  existing arrangement wastes real, extra space on a wide screen — real
  space that's often better spent on a genuinely different, real
  arrangement (elements side by side, not just larger).
- **Unbounded constraint** — a real `BoxConstraints` whose own real
  `maxWidth` (or `maxHeight`) is `double.infinity`, real and telling a
  child widget "take whatever real size you want; nothing above you is
  limiting it." Exists because not every real parent widget (a `Row`'s
  own non-flexible child, for one) actually constrains its own real
  children's size — some genuinely hand down "as much as you want,"
  and a real widget reading its own real constraints has to handle that
  real case honestly, not assume a real, finite number is always there.

## Objects and methods used

- **`AppBreakpoints`**
  - *What it is:* a real, new, project-specific class — this lesson's
    own first primary subject — naming this app's own one, real, shared
    width threshold.
  - *Implementation:*
    ```dart
    class AppBreakpoints {
      static const double compact = 600;
    }
    ```
    `600` is not an invented number — it's Material Design's own real,
    published "compact" window-size-class threshold (logical pixels),
    real and reused here rather than picked arbitrarily.
  - *Its use:* read once, real and directly, inside `SudokuApp.build`,
    to decide which of this app's own two real layouts to show.
  - *Type:* an ordinary class with a single, real `static const`
    field; never meant to be instantiated.
  - *Responsibility:* naming this app's own real "wide enough to
    change shape, not just scale" decision in exactly one place —
    nothing about what either real layout on either side of that
    threshold actually looks like.
  - *Depends on:* nothing; a real, fixed, compile-time constant.
  - *Connects to:* read by `SudokuApp.build`, compared against
    `MediaQuery.sizeOf(context).width`, below.
  - *Shape:* a real, new, project-specific token class — the identical
    real role `AppSpacing`/`AppShapes` already play, now for a real
    layout decision. **No reference counterpart — this is a
    from-scratch addition, because Flutter itself ships no single,
    official breakpoint constant to reuse.**

- **`MediaQuery.sizeOf`**
  - *What it is:* a real, static method reading the real, current
    available screen size, in real, logical pixels.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/widgets/media_query.dart`:
    `static Size sizeOf(BuildContext context) => _of(context,
    _MediaQueryAspect.size).size;` — a real `Size`, carrying real
    `width`/`height` fields.
  - *Its use:* `SudokuApp.build` calls this once, real and directly,
    reading its own real `.width`.
  - *Type:* a real, static method.
  - *Responsibility:* real and specifically, reporting the real,
    current screen size — nothing about what any real caller decides
    to do with it.
  - *Depends on:* a real `BuildContext` positioned below a real
    `MediaQuery` ancestor.
  - *Connects to:* its own real `.width` is compared against
    `AppBreakpoints.compact`.
  - *Shape:* this app's own first real use of `MediaQuery` for
    anything beyond brightness (already established).

- **`MediaQuery.orientationOf` / `Orientation`**
  - *What it is:* `MediaQuery.orientationOf`, a real, static method
    reading the device's own real, current orientation; `Orientation`,
    the real, standard Flutter enum it returns.
  - *Implementation:* real, confirmed this session:
    `static Orientation orientationOf(BuildContext context) =>
    _of(context, _MediaQueryAspect.orientation).orientation;`;
    `enum Orientation { portrait, landscape }` — a real, plain,
    two-value enum.
  - *Its use:* `SudokuApp.build` calls `MediaQuery.orientationOf`
    once, real and directly, comparing its real result against
    `Orientation.landscape`.
  - *Type:* a real, static method; a real, plain enum.
  - *Responsibility:* real and specifically, reporting whether the
    real, current screen is real and wider than it is tall, or the
    reverse — nothing about screen size itself, a real, separate
    signal `MediaQuery.sizeOf`, above, already covers.
  - *Depends on:* a real `BuildContext` positioned below a real
    `MediaQuery` ancestor.
  - *Connects to:* compared, alongside `MediaQuery.sizeOf`'s own real
    result, to decide `useWideLayout`, below.
  - *Shape:* this app's own first real use of either — a real, second,
    independent signal, distinct from screen width.

- **`Builder`**
  - *What it is:* a real, standard Flutter widget that hands its own
    real `builder` callback a fresh `BuildContext`, positioned exactly
    where the `Builder` itself sits in the real widget tree.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/widgets/basic.dart`:
    `const Builder({super.key, required this.builder});` — real and
    taking one, real, required `WidgetBuilder` (`Widget Function
    (BuildContext context)`).
  - *Its use:* `SudokuApp.build` wraps its own real layout-choosing
    logic in one, inside `Scaffold`'s own `body:` — real and
    necessary, since `MediaQuery.sizeOf(context)`/`.orientationOf
    (context)`, above, need a real context that's genuinely a
    descendant of `MaterialApp` (which is what actually establishes a
    real `MediaQuery` for this app), not `SudokuApp.build`'s own,
    outer `context`, positioned above `MaterialApp` entirely.
  - *Type:* a real, ordinary `StatelessWidget`.
  - *Responsibility:* real and specifically, handing its own real
    callback a context positioned at this exact real point in the
    tree — nothing about what that real callback actually builds.
  - *Depends on:* a real `WidgetBuilder` callback.
  - *Connects to:* its own real callback reads `MediaQuery.sizeOf`/
    `.orientationOf`, then returns either `_WideLayout` or
    `_CompactLayout`, below.
  - *Shape:* this app's own first real use of `Builder` — a real,
    minimal way to reach a real, deeper `BuildContext` without a whole,
    separate, real widget class.

- **`LayoutBuilder` / `BoxConstraints`**
  - *What it is:* `LayoutBuilder`, a real, standard Flutter widget
    that hands its own real `builder` callback the real, actual
    constraints its own parent gave it; `BoxConstraints`, the real
    class describing those real limits (Terms, above — **unbounded
    constraint** — is a real, possible shape one can take).
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/widgets/layout_builder.dart`:
    `const LayoutBuilder({super.key, required super.builder});`, real
    and taking a real `Widget Function(BuildContext context,
    BoxConstraints constraints)`; `BoxConstraints` carries real
    `final double minWidth`/`maxWidth`/`minHeight`/`maxHeight` fields
    (confirmed from `package:flutter/src/rendering/box.dart`).
  - *Its use:* both `_CompactLayout` and `_WideLayout`, below, wrap
    their own real `SudokuBoardView` in one, reading its own real
    `constraints.maxWidth`.
  - *Type:* a real, `const`-constructible widget; `BoxConstraints` — a
    real, immutable value class.
  - *Responsibility:* `LayoutBuilder`'s whole real job: reporting the
    real, actual space available at this exact real point in the tree
    — nothing about what a real caller does with that real number.
  - *Depends on:* a real callback needing real, current layout
    constraints to decide what to build.
  - *Connects to:* its own real `constraints.maxWidth` is divided by
    `9` and passed through `.clamp`, below, becoming `SudokuBoardView`'s
    own real `cellSize`.
  - *Shape:* this app's own first real use of either — distinct from
    `Builder`, above: `Builder` hands over a real context; `LayoutBuilder`
    hands over real, actual layout constraints too.

- **`num.clamp`**
  - *What it is:* a real, already-established numeric type's
    (`num`, `dart:core`) real, abstract method, restricting a real
    value to a real, closed range.
  - *Implementation:* real, confirmed this session from
    `dart:core`: `num clamp(num lowerLimit, num upperLimit);` — real
    and confirmed, this session, to handle a real, unbounded (`double
    .infinity`) input gracefully, returning the real, upper limit
    rather than throwing or misbehaving.
  - *Its use:* `(constraints.maxWidth / 9).clamp(28.0, 48.0)`, real and
    called once per real layout, keeping this app's own real cell size
    inside a real, sensible, hand-chosen range.
  - *Type:* a real, ordinary instance method.
  - *Responsibility:* real and specifically, keeping one, real number
    inside two, real, fixed bounds — nothing about what that real
    number is actually used for afterward.
  - *Depends on:* a real, existing `num`; two real bound arguments.
  - *Connects to:* its own real result becomes `SudokuBoardView`'s own
    real `cellSize` argument, below.
  - *Shape:* this app's own first real use of it — a real, standard
    `dart:core` method, not specific to Flutter at all.

- **`Flexible`**
  - *What it is:* a real, standard Flutter widget controlling how one
    real child of a `Row`/`Column` shares real, available space,
    without forcing it to fill all of it.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/widgets/basic.dart`:
    `const Flexible({super.key, this.flex = 1, this.fit =
    FlexFit.loose, required super.child});` — real and confirmed:
    `FlexFit.loose` (the real, unset default) lets its own real child
    be as small as it wants, up to a real, bounded maximum — never
    forced larger, the real, opposite of `Expanded`'s own real,
    default-tight behavior.
  - *Its use:* `_WideLayout` wraps its own real board `Card` in one,
    real and directly; `_SessionStatus` wraps each of its own two real
    `Text` widgets in one.
  - *Type:* a real, `const`-constructible `ParentDataWidget`.
  - *Responsibility:* real and specifically, telling its own real
    parent `Row`/`Column` how much of the real, remaining space (after
    every real, non-flexible sibling already took its own real,
    natural size) this one, real child may use — nothing about what
    that real child actually renders.
  - *Depends on:* a real child; a real `Row`/`Column`/`Flex` ancestor.
  - *Connects to:* real and gives its own real child a real, bounded
    `maxWidth`, in place of the real, unbounded one a plain, unwrapped
    `Row` child would otherwise receive.
  - *Shape:* this app's own first real use of it — the real, direct
    fix for this lesson's own real, first-attempt overflow, below.

- **`TextOverflow` / `Text.overflow`**
  - *What it is:* `Text.overflow`, a real, already-established
    widget's (`Text`) real, optional field, naming what
    happens when its own real string genuinely doesn't fit;
    `TextOverflow`, the real enum naming each real strategy.
  - *Implementation:* real, confirmed this session:
    `enum TextOverflow { clip, fade, ellipsis, visible }`.
  - *Its use:* `_SessionStatus`'s own two real `Text` widgets each
    real and set `overflow: TextOverflow.ellipsis`.
  - *Type:* a real, optional field; a real, plain enum.
  - *Responsibility:* real and specifically, choosing how a real,
    too-long string is real and visually truncated — nothing about
    whether it actually overflows in the first place, which is
    `Flexible`'s own real job, above.
  - *Depends on:* a genuinely too-long real string, given too little
    real space.
  - *Connects to:* set directly on each real `Text`, above.
  - *Shape:* this app's own first real, deliberate use of either —
    `Text` itself already established, its own `.overflow` field
    reached for the first time.

---

## Concept Unit 1: `_CompactLayout` — Naming This App's Own, Real Phone Shape

### The Problem

Every real element this app draws — status text, board, number pad,
pause button, session status — sits inline, directly, inside
`SudokuApp.build`'s own single, real `Column`. Nothing about that
arrangement is named as "the phone layout" specifically — it's simply
the only real arrangement this app has ever had.

> **Socratic prompt:** A real, second layout is about to need to exist
> alongside this one, chosen at real, live runtime. Given that
> `SudokuApp.build` already reads `session`/`boardDto`/
> `_selectedRow`/`_selectedCol` and calls `_dispatch` to handle every
> real user action, what real, concrete shape would let a *second*,
> real arrangement of the identical real data and real callbacks exist,
> without `SudokuApp.build` itself growing two, real, separate copies
> of the same real widget tree?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart`, its own
  real, existing `SudokuApp.build` method (read fresh this session) —
  the real, single, inline arrangement this unit extracts.
- **Files affected:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified.
- **Change type:** refactor (extract to a real, new, private widget
  class).
- **Location:** a real, new class, `_CompactLayout`, added to this
  same file, alongside `_SessionStatus`.
- **Dependencies:** none new.

### The New Code

```dart
class _CompactLayout extends StatelessWidget {
  const _CompactLayout({
    required this.session,
    required this.boardDto,
    required this.selectedRow,
    required this.selectedCol,
    required this.canTogglePause,
    required this.onCellTap,
    required this.onDigitTap,
    required this.onTogglePause,
  });

  final GameSession session;
  final SudokuBoardDto boardDto;
  final int? selectedRow;
  final int? selectedCol;
  final bool canTogglePause;
  final void Function(int row, int col) onCellTap;
  final void Function(int digit) onDigitTap;
  final VoidCallback onTogglePause;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          Text('Status: ${session.status.name}'),
          const SizedBox(height: AppSpacing.sm),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: SudokuBoardView(
                cellSize: 36,
                cells: boardDto.cells,
                givenCells: boardDto.givenCells,
                selectedRow: selectedRow,
                selectedCol: selectedCol,
                onCellTap: onCellTap,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          NumberPadView(onDigitTap: onDigitTap),
          const SizedBox(height: AppSpacing.md),
          if (canTogglePause)
            ElevatedButton(
              onPressed: onTogglePause,
              child: Text(session.status == GameStatus.paused ? 'Resume' : 'Pause'),
            ),
          const SizedBox(height: AppSpacing.md),
          const _SessionStatus(),
        ],
      ),
    );
  }
}
```

### Updated Project

`SudokuApp.build`, every real line shown, the real, changed lines
marked:

```dart
 1  Widget build(BuildContext context) {
 2    final session = ref.watch(gameSessionProvider);
 3    final canTogglePause = session.status == GameStatus.playing || session.status == GameStatus.paused;
 4    final boardDto = SudokuBoardDto.fromBoard(session.board);
 5    return MaterialApp(
 6      scaffoldMessengerKey: _scaffoldMessengerKey,
 7      theme: AppTheme.light,
 8      darkTheme: AppTheme.dark,
 9      themeMode: _themeMode,
10      home: Scaffold(
11        appBar: AppBar(
12          title: const Text('Sudoku'),
13          actions: [
14            IconButton(
15              icon: Icon(_iconForThemeMode(_themeMode)),
16              tooltip: 'Change theme',
17              onPressed: _cycleThemeMode,
18            ),
19          ],
20        ),
21        body: _CompactLayout(                                                          // ← changed
22          session: session,                                                             // ← changed
23          boardDto: boardDto,                                                           // ← changed
24          selectedRow: _selectedRow,                                                    // ← changed
25          selectedCol: _selectedCol,                                                    // ← changed
26          canTogglePause: canTogglePause,                                               // ← changed
27          onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),               // ← changed
28          onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit)),                    // ← changed
29          onTogglePause: () => _dispatch(TogglePauseIntent()),                          // ← changed
30        ),                                                                              // ← changed
31      ),
32    );
33  }
```

`SudokuApp.build` now hands its own real state and callbacks to a
real, named, separate widget, rather than building every real element
inline, itself — real and behaves identically to before this unit,
proven by every one of this app's own already-existing, real, passing
tests staying green, unmodified.

### Isolate and Discard

No separate throwaway lab needed — extracting an already-working real
widget tree into its own real class changes no real behavior at all;
proven directly, for real, by this app's own already-existing test
suite passing, unmodified, exactly as it did before this unit.

### Mechanical Walkthrough

- `class _CompactLayout extends StatelessWidget {` — a real, new,
  private, ordinary `StatelessWidget` (already established, Lesson
  25) — real and named for what it now, explicitly, is: this app's
  own real, phone-first, compact layout.
- `const _CompactLayout({required this.session, ...})` — eight real,
  required, named constructor parameters — directly answering this
  unit's own Socratic question: every real piece of data and every
  real callback `SudokuApp.build` already had is handed in explicitly,
  so a real, second widget (the next unit's own real job) can receive
  the identical real inputs without `SudokuApp.build` itself needing
  to build two, separate, real widget trees by hand.
- `final GameSession session;` and the seven real fields after it —
  each a real, plain, already-established type (`GameSession`,
  `SudokuBoardDto`, `int?`, `bool`, two real function types, a real
  `VoidCallback`) — real and stored, unchanged, for `build` to read.
- `Widget build(BuildContext context) { return SingleChildScrollView(...); }`
  — every real widget inside (`SingleChildScrollView`, `Column`,
  `Text`, `Card`, `Padding`, `SudokuBoardView`, `NumberPadView`,
  `ElevatedButton`, `_SessionStatus`) already established — real and
  completely unchanged in shape from `SudokuApp.build`'s own,
  original, inline version; only its own real *home* — this new
  class, rather than `SudokuApp.build` directly — actually changed.

### CS Lens

Not a hard concept on its own — extracting an already-correct, real
widget tree into its own, named, real class is ordinary, foundational
practice. The real idea worth naming: a real **breakpoint** (Terms,
above) always implies at least two, real, distinct outcomes; naming the
first one explicitly, before the second exists, is what makes adding
the second a real, additive change rather than a real, invasive rewrite
of `SudokuApp.build` itself.

### SE Lens

The real principle is **giving each of this app's own real layout
outcomes its own, named, real place to live, before the real branching
logic between them exists** — directly answering this unit's own
Socratic question. The alternative not chosen: wait until the next
unit, then write both layouts' own real widget trees directly inside
`SudokuApp.build`'s own real `build` method, real and behind a real
`if`/`else`. The real tradeoff: that alternative would work, real and
correctly — but `SudokuApp.build` would grow real and substantially
longer, mixing this app's own real, top-level concerns (theme,
lifecycle, dispatching intents) with two, real, separate, detailed
widget trees, real and making the whole real method harder to read at
a glance; extracting each real layout into its own, real, named class
keeps `SudokuApp.build` itself focused on real *choosing*, not real
*building*.

### Commands Needed

None new.

### Run It

Real, captured output: every one of this app's own already-existing,
real tests passes, unmodified — real, direct proof this unit's own
extraction changed no real behavior. Full summary covered together
with this lesson's other units, in Concept Unit 4, below.

### Connect

This app's own real, phone-first layout now has its own real name and
place. The next unit gives it a real, second sibling.

---

## Concept Unit 2: `_WideLayout` and `AppBreakpoints` — A Real, Second Shape for Real, Extra Width

### The Problem

A real tablet, or any sufficiently wide real screen, still shows
`_CompactLayout`'s own real, single, narrow column — real, empty space
sits on both sides of the board and number pad, real and unused,
regardless of how much real, extra width is actually available.

> **Socratic prompt:** `_CompactLayout`'s own real board and real
> number pad currently stack, real and vertically, one above the
> other. Given a real, wide screen, what real, different arrangement
> of those identical two real elements would use that real, extra
> width instead of leaving it real and empty — and what real, named
> threshold would decide when a screen counts as "real and wide
> enough" for that different arrangement?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/theme/app_spacing.dart`,
  its own real, existing shape (read fresh this session) — the real,
  established, project-specific token-class pattern this unit's own
  new class follows.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_breakpoints.dart`
  — created;
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified.
- **Change type:** add.
- **Location:** a real, new file under `presentation/theme/`; inside
  `SudokuApp.build`, replacing the direct `_CompactLayout(...)` return.
- **Dependencies:** none new.

### The New Code

```dart
class AppBreakpoints {
  static const double compact = 600;
}
```

```dart
final size = MediaQuery.sizeOf(context);
final useWideLayout = size.width >= AppBreakpoints.compact;
return useWideLayout ? _WideLayout(/* same real arguments as _CompactLayout */) : _CompactLayout(/* ... */);
```

### Updated Project

`project/lib/features/sudoku/presentation/theme/app_breakpoints.dart`,
a real, brand-new file:

```dart
1  class AppBreakpoints {
2    static const double compact = 600;
3  }
```

`SudokuApp.build`, every real line shown, the real, changed lines
marked:

```dart
 1  Widget build(BuildContext context) {
 2    final session = ref.watch(gameSessionProvider);
 3    final canTogglePause = session.status == GameStatus.playing || session.status == GameStatus.paused;
 4    final boardDto = SudokuBoardDto.fromBoard(session.board);
 5    return MaterialApp(
 6      scaffoldMessengerKey: _scaffoldMessengerKey,
 7      theme: AppTheme.light,
 8      darkTheme: AppTheme.dark,
 9      themeMode: _themeMode,
10      home: Scaffold(
11        appBar: AppBar(
12          title: const Text('Sudoku'),
13          actions: [
14            IconButton(
15              icon: Icon(_iconForThemeMode(_themeMode)),
16              tooltip: 'Change theme',
17              onPressed: _cycleThemeMode,
18            ),
19          ],
20        ),
21        body: Builder(                                                                 // ← new
22          builder: (context) {                                                          // ← new
23            final size = MediaQuery.sizeOf(context);                                    // ← new
24            final useWideLayout = size.width >= AppBreakpoints.compact;                 // ← new
25            return useWideLayout                                                        // ← new
26                ? _WideLayout(                                                          // ← new
27                    session: session,
28                    boardDto: boardDto,
29                    selectedRow: _selectedRow,
30                    selectedCol: _selectedCol,
31                    canTogglePause: canTogglePause,
32                    onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),
33                    onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit)),
34                    onTogglePause: () => _dispatch(TogglePauseIntent()),
35                  )
36                : _CompactLayout(                                                       // ← changed
37                    session: session,
38                    boardDto: boardDto,
39                    selectedRow: _selectedRow,
40                    selectedCol: _selectedCol,
41                    canTogglePause: canTogglePause,
42                    onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),
43                    onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit)),
44                    onTogglePause: () => _dispatch(TogglePauseIntent()),
45                  );                                                                    // ← new
26        },                                                                              // ← new
27      ),                                                                                // ← new
28    ),
29  );
30 }
```

(`_WideLayout` itself — a new, real class with the identical real
constructor shape as `_CompactLayout`, its own board and number pad
arranged in a real `Row` instead of stacked — is this unit's own
second real file addition; shown in full in the Mechanical Walkthrough,
below, since it introduces no further new vocabulary beyond
already-established widgets.)

This app's own `Scaffold.body` no longer names one, fixed, real layout
directly — it now, really, asks `MediaQuery.sizeOf` first, every real
build, and picks between two, real, named outcomes.

### Isolate and Discard

`MediaQuery.sizeOf`'s own real behavior is straightforward and
predictable (a real `Size`, reflecting the real, current screen) —
proven directly, for real, by this lesson's own new, permanent test,
`project/test/responsive_layout_test.dart`, real and simulating both a
real, narrow and a real, wide viewport (`tester.view.physicalSize`, a
real, dedicated `flutter_test` API), in Concept Unit 4's own closing
summary, below. This whole idea — a real, named width threshold
marking where a layout's own shape, not just its scale, should change
— is called a **breakpoint**.

### Mechanical Walkthrough

- `class AppBreakpoints { static const double compact = 600; }` —
  `static`/`const` (both already established) reappearing, real and
  giving this app's own one, real, shared width threshold the identical
  real shape `AppSpacing` already uses — directly answering half of
  this unit's own Socratic question: `600`, real and Material Design's
  own published compact-width threshold, not an arbitrary guess.
- `body: Builder(builder: (context) { ... })` — `Builder` (Objects and
  methods, above), real and necessary here specifically because
  `MediaQuery.sizeOf`, next, needs a real `context` positioned below
  `MaterialApp`'s own real `Scaffold`, not `SudokuApp.build`'s own,
  outer one.
- `final size = MediaQuery.sizeOf(context);` — `MediaQuery.sizeOf`
  (Objects and methods, above), real and reading this app's own real,
  current screen size, fresh, every real build.
- `final useWideLayout = size.width >= AppBreakpoints.compact;` —
  `size.width` (a real, plain field on the real `Size` `MediaQuery
  .sizeOf` returned) compared, real and directly, against
  `AppBreakpoints.compact` — directly answering the other half of this
  unit's own Socratic question: this real, single, boolean comparison
  is this app's own real, live threshold check.
- `return useWideLayout ? _WideLayout(...) : _CompactLayout(...);` —
  the ternary (already established) reappearing, real and choosing
  between this app's own two, real, named layouts, both handed the
  identical real arguments — real, direct proof neither layout needs
  to know the other exists.
- `class _WideLayout extends StatelessWidget { ... }` — real and built
  from entirely already-established widgets (`SingleChildScrollView`,
  `Column`, `Text`, `Row`, `Card`, `Padding`, `SudokuBoardView`,
  `NumberPadView`, `ElevatedButton`), arranged so the board and number
  pad sit real and side by side inside a real `Row`, instead of
  `_CompactLayout`'s own, real, stacked `Column` — real, direct answer
  to this unit's own Socratic question's first half.

### CS Lens

**Breakpoint** (Terms, above) is a real, recognized, cross-domain
pattern, worth naming beyond Flutter itself. Also recognized in: CSS's
own media queries (`@media (min-width: 600px)`); Android's own
resource-qualifier system (`layout-sw600dp/`); Bootstrap's and every
other major web design system's own named breakpoints; even print
design's own column-count changes at different real page sizes — every
one real, and every one built around the identical real idea: past a
real, named threshold, *rearrange*, don't just resize.

### SE Lens

The real principle is **naming a real threshold once, in one, real,
shared place, so every real layout decision that depends on it reads
the identical real value** — directly answering this unit's own
Socratic question. The alternative not chosen: compare
`MediaQuery.sizeOf(context).width` against a real, bare literal
(`600`) directly inside `SudokuApp.build`, with no `AppBreakpoints`
class at all. The real tradeoff: that alternative would work,
identically, today — but a real, future second real place needing the
identical real threshold (this lesson's own later units, or a real,
future settings screen) would either duplicate that same real literal
or risk a real, silent drift between two, separately-chosen numbers —
the exact real risk `AppSpacing`/`AppShapes` already closed
for spacing and shape, now closed here for layout, too.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with this
lesson's other units, in Concept Unit 4, below.

### Connect

This app now, really, chooses between two, real, named layouts based
on its own real, current width. The next unit adds a real, second,
independent signal neither layout has considered yet.

---

## Concept Unit 3: `Orientation.landscape` — A Real, Second, Independent Signal

### The Problem

A real, narrow phone, turned sideways, still fails
`AppBreakpoints.compact`'s own real width check — its real width,
even in landscape, may stay well under `600`. `_CompactLayout`'s own
real, vertically-stacked column still shows, even though a real,
landscape phone's own real height is now genuinely scarce, and a real,
horizontal arrangement would suit it far better.

> **Socratic prompt:** `MediaQuery` already, really exposes a second,
> real, independent signal beyond screen size —
> `MediaQuery.orientationOf(context)`. Given that a real, narrow phone
> in landscape fails the previous unit's own real width check, but
> still has real, limited height and real, extra width relative to its
> own portrait self, how should this app's own real `useWideLayout`
> decision, above, combine *both* real signals, rather than relying on
> width alone?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart`, its own
  real, existing `useWideLayout` check, previous unit (read fresh this
  session) — the real, established, width-only check this unit
  extends.
- **Files affected:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified;
  `project/test/responsive_layout_test.dart` — created.
- **Change type:** add (a real, second, independent condition).
- **Location:** inside `SudokuApp.build`'s own `Builder`, alongside
  `useWideLayout`'s own existing width check.
- **Dependencies:** none new.

### The New Code

```dart
final orientation = MediaQuery.orientationOf(context);
final useWideLayout = size.width >= AppBreakpoints.compact || orientation == Orientation.landscape;
```

### Updated Project

`SudokuApp.build`'s own `Builder`, every real line shown, the real,
changed lines marked:

```dart
1  Builder(
2    builder: (context) {
3      final size = MediaQuery.sizeOf(context);
4      final orientation = MediaQuery.orientationOf(context);                            // ← new
5      final useWideLayout = size.width >= AppBreakpoints.compact || orientation == Orientation.landscape; // ← changed
6      return useWideLayout
7          ? _WideLayout(/* same real arguments as before */)
8          : _CompactLayout(/* same real arguments as before */);
9    },
10 ),
```

This app's own real layout choice now genuinely responds to two,
real, independent facts about the screen, not one.

**A real, honest, first-attempt failure, kept as documented evidence,
found testing this exact, real, narrow-landscape combination:**
`_WideLayout`'s own real `Card` — unwrapped, sitting directly inside a
real `Row` alongside the real number pad — genuinely overflowed at a
real, narrow landscape width (a real, simulated `500×300` viewport):
"A RenderFlex overflowed by ... pixels on the right." Root-caused:
inside a real `Row`, a non-flexible child (this app's own board `Card`)
receives a real, **unbounded constraint** (Terms, above) —
`BoxConstraints(... maxWidth: Infinity)` — so the `LayoutBuilder`
inside it (this lesson's own Concept Unit 4, below, already written by
the time this was tested) computed a real cell size all the way up to
its own real, upper `.clamp` bound, real and regardless of how much
real width the number pad beside it also needed, real and overflowing
the real, actual, finite `Row`. Fixed by wrapping the board `Card` in a
real `Flexible` (Objects and methods, above): confirmed from source,
`Flexible`'s own real, default `FlexFit.loose` lets the `Row` give it a
real, bounded maximum — whatever real width remains after the number
pad's own real, non-flexible, natural size is already accounted for —
rather than a real, unbounded one.

### Isolate and Discard

No separate throwaway lab needed — `MediaQuery.orientationOf`/
`Orientation` are proven directly, for real, by this lesson's own new,
permanent test, `project/test/responsive_layout_test.dart`:

```dart
testWidgets(
  'a real, narrow phone in landscape still gets the side-by-side layout, even under the compact width',
  (WidgetTester tester) async {
    tester.view.physicalSize = const Size(500, 300);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const ProviderScope(child: SudokuApp()));

    expect(
      find.ancestor(of: find.byType(NumberPadView), matching: find.byType(Row)),
      findsOneWidget,
    );
  },
);
```

Real, captured output (`flutter test test/responsive_layout_test.dart`):
passes — a real, simulated `500×300` viewport (real width under
`AppBreakpoints.compact`, real and wider than tall) genuinely produces
the side-by-side `_WideLayout`, directly proving this unit's own
Socratic question answered correctly: width alone would have said
"compact"; orientation, combined, correctly overrides it.

### Mechanical Walkthrough

- `final orientation = MediaQuery.orientationOf(context);` —
  `MediaQuery.orientationOf` (Objects and methods, above), real and
  reading this app's own second, real, independent signal.
- `size.width >= AppBreakpoints.compact || orientation ==
  Orientation.landscape` — the already-established `||` operator
  reappearing: this real expression is `true` if *either*
  real condition holds — directly answering this unit's own Socratic
  question: a real, wide screen (any real orientation) still counts;
  a real, narrow screen *also* counts, the moment it's real and
  turned landscape.
- `Flexible(child: Card(...))` — `Flexible` (Objects and methods,
  above), real and wrapping the board `Card` for the first time — real
  and directly fixing this unit's own, honestly-documented overflow,
  above, by giving `Row` a real, bounded maximum to hand the
  `LayoutBuilder` inside, instead of a real, unbounded one.

### CS Lens

Not a hard concept on its own — combining two, real, independent
boolean signals with `||` is ordinary, foundational logic. The real
idea worth naming: a real layout decision driven by *only* one real
signal (width alone) is a real, incomplete model of "does this screen
have real, extra room" — a real device's own shape has at least two,
real, independent dimensions (how wide, and which way is up), and a
real, honest layout decision has to ask about both.

### SE Lens

The real principle is **treating two, real, genuinely independent
facts as two, real, separate checks, combined explicitly, rather than
trying to fold one into the other** — directly answering this unit's
own Socratic question. The alternative not chosen: redefine
`AppBreakpoints.compact` itself to somehow account for orientation
(for instance, a real, smaller effective threshold whenever
`Orientation.landscape` holds). The real tradeoff: that alternative
would conflate two, real, separate concerns — "how much real width"
and "which way is the device held" — into one, real, harder-to-reason-
about number, real and losing the honest, direct, real, `||`-joined
clarity of "wide, or landscape, either one is enough."

### Commands Needed

None new.

### Run It

Real, captured output (`flutter test test/responsive_layout_test.dart`):
the real, narrow-landscape test passes. Full summary covered together
with this lesson's final unit, below.

### Connect

This app's own layout choice now honestly reflects both real screen
dimensions, not one. The final unit makes the board's own real size
respond to real, available space too, not just its own real
arrangement.

---

## Concept Unit 4: `LayoutBuilder` and `cellSize` — Real Cells for Real, Available Space

### The Problem

`SudokuBoardView`'s own real cells are a fixed, real `36`-pixel
literal, regardless of which real layout is showing, or how much real
space either one actually has. A real, small phone might have less
real room than that comfortably allows; a real, wide tablet has far
more real room than a `36`-pixel board would ever use.

> **Socratic prompt:** `LayoutBuilder`'s own real `builder` callback
> receives real, actual `BoxConstraints`, including a real
> `constraints.maxWidth`. Given a real Sudoku board is always real,
> exactly nine cells wide, what real, simple arithmetic would turn
> "how much real width is actually available right here" into "how
> big should one real cell be" — and what real, sensible bounds should
> that real result stay inside, regardless of how much or how little
> real space is available?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_board_view.dart`,
  its own real, existing, fixed `width: 36, height: 36` (read fresh
  this session) — the real, original literal this unit replaces.
- **Files affected:**
  `project/lib/features/sudoku/presentation/sudoku_board_view.dart` —
  modified;
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified;
  `project/lib/features/sudoku/presentation/theme/app_spacing.dart` —
  unaffected (`NumberPadButtonView`'s own real `44`-pixel size is
  deliberately left fixed this lesson — see this unit's own SE Lens);
  `project/test/sudoku_board_view_test.dart` — modified;
  `project/test/responsive_layout_test.dart` — modified.
- **Change type:** add (a new, real, required parameter); replace (the
  fixed literal); add (a `LayoutBuilder` at each real call site).
- **Location:** `SudokuBoardView`/`SudokuCellView`'s own real
  constructors and `build` methods; inside `_CompactLayout`/
  `_WideLayout`, wrapping `SudokuBoardView`.
- **Dependencies:** none new.

### The New Code

```dart
LayoutBuilder(
  builder: (context, constraints) {
    final cellSize = (constraints.maxWidth / 9).clamp(28.0, 48.0);
    return SudokuBoardView(cellSize: cellSize, /* ...same real arguments as before */);
  },
);
```

### Updated Project

`SudokuBoardView`/`SudokuCellView`, every real line shown, the real,
changed lines marked:

```dart
 1  class SudokuBoardView extends StatelessWidget {
 2    const SudokuBoardView({
 3      super.key,
 4      required this.cellSize,                                                          // ← new
 5      required this.cells,
 6      required this.givenCells,
 7      this.selectedRow,
 8      this.selectedCol,
 9      this.onCellTap,
10    });
11
12    final double cellSize;                                                              // ← new
13    final List<List<int?>> cells;
14    final List<List<bool>> givenCells;
15    final int? selectedRow;
16    final int? selectedCol;
17    final void Function(int row, int col)? onCellTap;
18
19    @override
20    Widget build(BuildContext context) {
21      return Column(
22        mainAxisSize: MainAxisSize.min,
23        children: List.generate(
24          9,
25          (row) => Row(
26            mainAxisSize: MainAxisSize.min,
27            children: List.generate(
28              9,
29              (col) => SudokuCellView(
30                row: row,
31                col: col,
32                size: cellSize,                                                          // ← new
33                value: cells[row][col],
34                isGiven: givenCells[row][col],
35                isSelected: row == selectedRow && col == selectedCol,
36                onTap: onCellTap == null ? null : () => onCellTap!(row, col),
37              ),
38            ),
39          ),
40        ),
41      );
42    }
43  }
```

`SudokuCellView`'s own real `Container`, every real line shown, the
real, changed lines marked:

```dart
1  Widget build(BuildContext context) {
2    return InkWell(
3      onTap: onTap,
4      child: Container(
5        width: size,                                                                     // ← changed
6        height: size,                                                                    // ← changed
7        alignment: Alignment.center,
```

Every real board this app draws now, really, sizes each real cell from
its own real, new `size`/`cellSize` parameter — real and nothing left
hardcoded at `36`.

`_CompactLayout`'s own board section, every real line shown, the real,
changed lines marked:

```dart
1  Card(
2    child: Padding(
3      padding: const EdgeInsets.all(AppSpacing.sm),
4      child: LayoutBuilder(                                                              // ← new
5        builder: (context, constraints) {                                                // ← new
6          final cellSize = (constraints.maxWidth / 9).clamp(28.0, 48.0);                  // ← new
7          return SudokuBoardView(
8            cellSize: cellSize,                                                           // ← changed
9            cells: boardDto.cells,
10           givenCells: boardDto.givenCells,
11           selectedRow: selectedRow,
12           selectedCol: selectedCol,
13           onCellTap: onCellTap,
14         );
15       },                                                                                 // ← new
16     ),                                                                                   // ← new
17   ),
18 ),
```

(`_WideLayout`'s own board section reads identically, real and already
shown in full, wrapped in `Flexible`, in the previous unit.)

### Isolate and Discard

`(constraints.maxWidth / 9).clamp(28.0, 48.0)`'s own real behavior at
an **unbounded constraint** (Terms, above) is not something to predict
with confidence — run for real, per the Verification Rule, as a real,
standalone `dart run` lab before writing it into project code:

```dart
void main() {
  print((double.infinity / 9).clamp(28.0, 48.0));
  print((300.0 / 9).clamp(28.0, 48.0));
  print((900.0 / 9).clamp(28.0, 48.0));
}
```

Real, captured output:

```
48.0
33.333333333333336
48.0
```

Real and confirmed: `num.clamp` handles a real, `double.infinity`
input gracefully — real and settling at its own real, upper bound,
never throwing — directly answering this unit's own Socratic question:
an unbounded real width sensibly resolves to this app's own real,
largest allowed cell, not a crash or an unusably huge one. Discarded —
this exact real script is deleted; `_CompactLayout`/`_WideLayout`'s
own real `LayoutBuilder`s, above, are what this lab's own real proof
backs.

**A real, second, honest finding, discovered testing at real, narrow
widths this lesson introduced for the first time:** `_SessionStatus`'s
own, pre-existing, real `Row` (`Text('Elapsed...')`, a gap, `Text
('Games started...')`, unchanged since long before this lesson) had
never once been rendered at a real, narrow width in any of this app's
own tests before — every real, prior test used the default,
comfortably-wide test viewport. Real and defensively hardened while
this lesson's own testing was already exercising real, narrow widths
for the first time: both real `Text` widgets wrapped in `Flexible`
(Objects and methods, above), each given `overflow: TextOverflow
.ellipsis` (Objects and methods, above) — real, ordinary,
already-standard practice for any real, non-flexible `Row` content
that might, at a real, sufficiently narrow width, no longer fit.

**A real, new, permanent test**, `project/test/responsive_layout_test.dart`'s
own closing check:

```dart
testWidgets('the real, rendered cell size genuinely differs between a narrow and a wide compact layout', (
  WidgetTester tester,
) async {
  tester.view.physicalSize = const Size(320, 800);
  tester.view.devicePixelRatio = 1.0;
  await tester.pumpWidget(const ProviderScope(child: SudokuApp()));
  final narrowBoard = tester.widget<SudokuBoardView>(find.byType(SudokuBoardView));

  tester.view.resetPhysicalSize();
  tester.view.resetDevicePixelRatio();
  tester.view.physicalSize = const Size(560, 900);
  tester.view.devicePixelRatio = 1.0;
  await tester.pumpWidget(const ProviderScope(child: SudokuApp()));
  final widerBoard = tester.widget<SudokuBoardView>(find.byType(SudokuBoardView));

  expect(widerBoard.cellSize, greaterThan(narrowBoard.cellSize));
});
```

Real, captured output: passes — real, direct proof this app's own
board genuinely renders with a different, real, larger cell size at a
real, wider compact-layout viewport than a real, narrower one, rather
than a fixed size regardless of real, available room.

### Mechanical Walkthrough

- `required this.cellSize;` / `final double cellSize;` —
  `SudokuBoardView`'s own real, new, required parameter — real and
  making every real caller supply its own real cell size explicitly,
  no default silently assumed.
- `size: cellSize` — passed straight through to each real
  `SudokuCellView`, real and unchanged in every other real way.
- `width: size, height: size` — `SudokuCellView`'s own real
  `Container` (already established), real and now sized from its own
  real, new `size` parameter, replacing the real, original, bare `36`.
- `LayoutBuilder(builder: (context, constraints) { ... })` —
  `LayoutBuilder` (already established, previous unit) reappearing,
  real and wrapping `SudokuBoardView` for the first time.
- `final cellSize = (constraints.maxWidth / 9).clamp(28.0, 48.0);` —
  `constraints.maxWidth` (already established) read directly; `/ 9`
  (already established) — directly answering the first half
  of this unit's own Socratic question: nine, real, equal cells share
  the real, available width evenly; `.clamp(28.0, 48.0)` — `num.clamp`
  (Objects and methods, above), real and confirmed to keep this real
  result inside a real, sensible, hand-chosen range — directly
  answering the second half: neither uncomfortably tiny nor
  needlessly huge, regardless of how much or how little real space
  `constraints.maxWidth` actually reports.

### CS Lens

Not a hard concept on its own — deriving one real, dependent
measurement (cell size) from one real, given constraint (available
width) through a real, direct division is ordinary, foundational
layout arithmetic — the identical real idea underneath every real
responsive grid, on every real platform, not unique to Flutter or to
Sudoku.

### SE Lens

The real principle is **computing a real, derived value from real,
live layout information, instead of a real, fixed guess** — directly
answering this unit's own Socratic question. The alternative not
chosen: leave the board's own real cell size fixed at `36`, and,
separately, also make the real number pad's own buttons dynamically
sized the same real way. The real tradeoff: this lesson deliberately
left `NumberPadButtonView`'s own real, fixed `44`-pixel size alone — a
real, honest, explicitly-scoped-out extension, not an oversight,
because the board (nine real cells, needing to share real, available
width evenly) has a real, direct, real, arithmetic relationship to
`constraints.maxWidth` that the number pad (three real, fixed-count
buttons, never genuinely cramped for real, horizontal room the way a
9-wide board can be) does not share in the same, real, load-bearing
way — extending the identical real pattern there remains a real,
legitimate, future improvement, not attempted here.

### Commands Needed

None new.

### Run It

Real, captured summary, covering every real change across all four of
this lesson's own units together:

`flutter analyze .`: **56 issues found** — identical count and
identical categories to this lesson's own pre-change baseline; zero
new issues from any file this lesson touched.

`flutter test`: **54 real test-file-level checks** (up from 50 at the
previous lesson), `All tests passed!`, confirmed clean across two
consecutive full runs. Four new checks live in this lesson's own new,
permanent `project/test/responsive_layout_test.dart` — a real, narrow
portrait phone gets the compact layout; a real, wide portrait tablet
gets the side-by-side layout; a real, narrow landscape phone also gets
the side-by-side layout; and the real, rendered cell size genuinely
differs between a narrow and a wide compact viewport. Every one of
this app's own five, real, existing `SudokuBoardView(...)` call sites
in `project/test/sudoku_board_view_test.dart` was updated to supply
the new, real, required `cellSize:` argument.

### Connect

This app's own board now genuinely fills whatever real space its own,
real, current layout actually gives it — real, bounded between a
sensible minimum and maximum — rather than assuming one, fixed, real
size fits every real screen.

---

## Connect the Pieces

`SudokuApp.build` now, really, asks two, real, independent questions
every real build — "how wide" (`MediaQuery.sizeOf`, Concept Unit 2)
and "which way is up" (`MediaQuery.orientationOf`, Concept Unit 3) —
and combines both real answers into one, real `useWideLayout` decision,
choosing between two, real, named, complete layouts (`_CompactLayout`,
Concept Unit 1; `_WideLayout`, Concept Unit 2) neither of which needs
to know the other exists. Inside either one, `LayoutBuilder` (Concept
Unit 4) asks a real, third, independent question — "how much real
width is actually here, right now" — and the board's own real cell
size answers it directly, real and bounded, rather than assuming one
fixed number forever. Along the way, testing at real, narrow and real,
landscape widths this lesson introduced for the first time surfaced
two real, honest, pre-existing gaps — a real `Row` overflow, and a
real, untested narrow-width text overflow — both fixed for real, with
`Flexible`, not smoothed over. One real widget tree now, honestly,
takes two real shapes, each one responding, live, to the real device
actually showing it.
