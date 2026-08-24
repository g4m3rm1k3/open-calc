# Lesson 35: When One Widget's State Isn't Enough

**What you will build:** No major new `project/` code this lesson —
Phase 4 opens by naming, precisely, five different real *kinds* of state
this app already contains real examples of (or honestly lacks one for),
using code that already exists rather than inventing illustrative
examples: local state (`_SessionStatusState`'s own real elapsed-time
timer), shared state (`_SudokuAppState`'s own real `_board`/
`_selectedRow`/`_selectedCol`, lifted to the one place both the board and
the number pad can reach it), application state (a real, honest gap —
this app has exactly one screen, confirmed by a real search, not
assumed), derived state (`_cells`/`_givenCells`, computed fresh from
`_board` on every read, never stored), and persistent state (a second
real, honest gap, proved for real, not just asserted). Two new, real,
throwaway probes surface a genuine bug hiding in plain sight since Lesson
28: the real "Games started" counter has never once touched the real
board — a concrete, motivating problem for the whole of Phase 4, not an
abstract warning about state management in general.

**What you need to know first:**
- Lesson 1 — the real CPU/RAM/storage distinction, reused directly as
  the reasoning behind this lesson's own new persistent-state term.
- Lesson 2 — terminal fundamentals; this lesson's own Concept Unit 3
  uses `Select-String`, the first genuinely new terminal cmdlet since
  then.
- Lesson 4 — distinguishing symptom from cause, reused as the same real
  discipline behind this lesson's own real, run search for navigation
  infrastructure.
- Lesson 5 — nullable types (`?`), `isNull`.
- Lesson 8 — anonymous-function syntax, reused inside `Timer.periodic`'s
  own callback.
- Lesson 9 — `.contains`, reused inside `SudokuBoard.isComplete`, and
  this lesson's own `List.generate`, reappearing from Lesson 17.
- Lesson 10 — `?.`, nullable types, the `is` type-check operator, and
  generic type arguments (`<SudokuCellView>`).
- Lesson 15 — functions as values, reused for both a `Timer` callback
  and a widget's own `onCellTap` callback.
- Lesson 20 — the increment operator (`++`), `static const`.
- Lesson 22 — the real, honestly-reported false start pattern, reused
  as the model for this lesson's own two real, run probes.
- Lesson 27 — `super.key`-style constructor fields, reused in this
  lesson's own reasoning about `SudokuApp`'s real constructor.
- Lesson 29 — `SizedBox`.
- Lesson 11 — encapsulation; `SudokuBoard`'s own real `valueAt`/
  `isGivenAt` read methods are this lesson's own concrete evidence for
  derived state's "compute from the real source of truth" half.
- Lesson 12 — `super`, reappearing inside `initState`/`dispose`.
- Lesson 17 — `List.generate`, reused inside `_cells`/`_givenCells`.
- Lesson 21 — the real milestone puzzle's own cell `(4, 4)`, already
  proved there to be a naked single with exactly one true candidate, `5`
  — reused again this lesson to build both new real probes.
- Lesson 24 — the real, permanent `project/test/` convention, and the
  separate `verification/lesson-NN/` convention this lesson's own two
  throwaway probes follow instead, since neither is meant to outlive
  this lesson.
- Lesson 25 — `Widget`/`Element`/`State`, and the real, `identical()`-
  proved fact that Flutter's own reconciliation can genuinely preserve
  or genuinely discard a `State` object depending on what widget type
  comes next — the exact real mechanism this lesson's own persistence
  probe depends on.
- Lesson 26 — `MaterialApp`, `Scaffold`, and `flutter_test`'s own real
  `WidgetTester`/`testWidgets`, reused for both of this lesson's own new
  probes.
- Lesson 28 — `StatefulWidget`/`State`/`setState`/`initState`/`dispose`/
  `Timer.periodic`, all reappearing in full as this lesson's own real,
  central example of local state.
- Lesson 31 — `SudokuBoardView`/`SudokuCellView`.
- Lesson 32 — real selection state (`_selectedRow`/`_selectedCol`),
  reused as this lesson's own real, central example of shared state.
- Lesson 33 — `NumberPadView`, `tester.ensureVisible`.
- Lesson 34 — `SudokuBoard _board`, and the real `_cells`/`_givenCells`
  getters, reused as this lesson's own real, central example of derived
  state.

**Terms used in this lesson:**
- **Local (ephemeral) state** — new: state that matters to exactly one
  widget's own subtree and nothing else in the app — safe to lose, on
  that widget's own disposal, without breaking any other part of the UI.
  It exists as a named category because most of a real app's own state
  genuinely is this simple, and naming it plainly prevents
  over-engineering something that never needed to leave one widget in
  the first place.
- **Shared state** — new: state more than one widget needs to read or
  change, where neither widget is an ancestor of the other. It exists
  because Flutter widgets can only pass data one direction — down, via
  constructor parameters — so two sibling widgets have no direct way to
  see each other's own data at all without a real plan for where that
  data actually lives.
- **Lifting state up** — new: the real, standard fix for shared state —
  moving the value to the nearest single widget that is a real ancestor
  of every widget that needs it, then passing it back down to each of
  them as a constructor parameter. It exists because Flutter's own
  one-directional data flow (down only) makes "store it in whichever
  widget happened to need it first" stop working the moment a second,
  unrelated widget needs the same value too.
- **Application state** — new: state needed across more than one screen
  or feature of the whole app, not just within one screen's own widget
  subtree — the same real problem shared state solves, one level higher,
  where the nearest common ancestor is the whole app rather than one
  screen.
- **Derived state** — new: a value computed from other, already-stored
  state, on demand, rather than stored anywhere as its own separate
  field. It exists to remove an entire category of real bug: two
  separately stored values that are supposed to always agree can
  silently drift apart the moment one is updated and the other is
  forgotten; a derived value can never disagree with its own source,
  because it has no independent existence to drift from.
- **Persistent state** — new: state that survives the actual process
  ending — not just a widget rebuild, a genuine, full restart. It exists
  because every other kind of state named in this lesson, no matter how
  carefully organized, is still held only in this one process's own RAM
  — Lesson 1's own Concept Unit 1 (CPU/RAM/storage) already named the
  real distinction this category depends on: RAM's own contents
  disappear the instant the process holding them stops running; only
  storage genuinely survives that.

**Objects and methods used:**

- **`Select-String`**
  - *What it is:* a real PowerShell cmdlet — this lesson's own first
    genuinely new terminal tool since Lesson 2 — that searches real text
    content for lines matching a real pattern.
  - *Implementation:* real shape used here: `Select-String -Path
    <files> -Pattern <regex>`; returns one real `MatchInfo` object per
    matching line, or produces genuinely no console output at all when
    nothing matches — PowerShell's own real convention for "zero
    results," distinct from an error.
  - *Its use:* this lesson's own real, run proof for Concept Unit 3 —
    searching every real file in `project/lib/` for any trace of
    navigation infrastructure (`Navigator`, `MaterialPageRoute`, and
    similar) and getting real, confirmed silence back.
  - *Type:* a cmdlet — PowerShell's own real term for a built-in
    command, implemented as a compiled .NET method, not a script the
    reader could open and read the way `Get-ChildItem` (Lesson 2) is
    documented as one.
  - *Responsibility:* to read every real file matching `-Path`, line by
    line, and report every real line matching `-Pattern`.
  - *Depends on:* a real, valid path expression and a real regular
    expression pattern.
  - *Connects to:* reads real files on disk; used here purely to
    interrogate `project/lib/`'s own real, current content — it does not
    connect to any of this project's own Dart code at all.
  - *Shape:* a real, standard terminal tool, external to this project's
    own codebase entirely — used here to verify a claim about the
    codebase, not part of it.

- **`Timer`/`Timer.periodic`**
  - *What it is:* reappearing in full from Lesson 28 — a real Dart
    standard-library class that schedules a real callback to run
    repeatedly, on a real fixed interval, without blocking anything else
    from running in between.
  - *Implementation:* real shape used here, from `_SessionStatusState`:
    `Timer.periodic(const Duration(seconds: 1), (_) { setState(() {
    _elapsedSeconds++; }); })` — a real, named constructor taking a real
    `Duration` and a real callback, itself receiving the firing `Timer`
    as its one real argument (discarded here via `_`, reappearing from
    Lesson 28's own discard-name convention).
  - *Its use:* this lesson's own real, central example of **local
    state** — the real `Timer` object itself, and the real
    `_elapsedSeconds` count it drives, exist entirely inside
    `_SessionStatusState` and are never read by any other real widget in
    this app.
  - *Type:* a concrete class from `dart:async`.
  - *Responsibility:* to hold a real, running, repeating schedule and
    invoke its own real callback on every real tick until told to stop.
  - *Depends on:* a real `Duration` and a real callback function to run.
  - *Connects to:* created inside `initState`; explicitly canceled
    inside `dispose` via `_ticker?.cancel()` — without that real call,
    the real, repeating callback would keep trying to call `setState` on
    a real `State` object that no longer exists, a real, already-proved
    failure from Lesson 28's own deliberately-triggered "Pending timers"
    error.
  - *Shape:* a real, general-purpose async primitive — not specific to
    Flutter or this project at all.

- **`State.initState`/`State.dispose`**
  - *What it is:* reappearing in full from Lesson 28 — two real,
    inherited lifecycle methods every `State` object has, called by the
    real framework itself at two fixed, real moments: once, right after
    a `State` object is first created, and once, right before that same
    real object is permanently destroyed.
  - *Implementation:* real shape used here: `@override void initState()
    { super.initState(); _ticker = Timer.periodic(...); }` and
    `@override void dispose() { _ticker?.cancel(); super.dispose(); }`.
  - *Its use:* the real, exact place this lesson's own local-state
    `Timer` is both born and cleaned up — nowhere else in
    `_SessionStatusState` runs at those two specific real moments.
  - *Type:* two real instance methods, declared on the abstract `State`
    class and overridden here (`@override`, reappearing from Lesson 25).
  - *Responsibility:* `initState` — run real one-time setup exactly
    once, the real moment a `State` object starts existing. `dispose` —
    run real one-time teardown exactly once, the real moment a `State`
    object stops existing, so nothing it started keeps running after.
  - *Depends on:* being called by the real framework itself — never
    called directly by this project's own code.
  - *Connects to:* `initState` calls `super.initState()` first;
    `dispose` calls `super.dispose()` last — because the real, abstract
    `State` class itself also has real setup/teardown work of its own to
    do.
  - *Shape:* part of the real, framework-defined `State` contract every
    `StatefulWidget` implicitly agrees to.

- **`SudokuBoard.valueAt`/`SudokuBoard.isGivenAt`**
  - *What it is:* reappearing in full from Lesson 34 (originally defined
    Lessons 17/24) — two real, public, read-only methods on the real
    Phase 2 engine, each returning one real fact about one real cell
    without ever exposing the engine's own private grid directly.
  - *Implementation:* real, verbatim, from
    `project/lib/sudoku_board.dart`, lines 35-37: `int? valueAt(int row,
    int col) => _grid[row][col];` and `bool isGivenAt(int row, int col)
    => _isGiven[row][col];`.
  - *Its use:* this lesson's own real, central example of **derived
    state**'s other half — `_cells`/`_givenCells` (below) call these on
    every single read, so there is never a moment where a stored copy
    could disagree with what `_board` itself actually holds.
  - *Type:* two real instance methods, using Dart's arrow-function body
    syntax (reappearing from Lesson 8).
  - *Responsibility:* answer one real, narrow question each about one
    real cell, computed directly from `SudokuBoard`'s own real private
    state every time, never cached.
  - *Depends on:* a real `row`/`col` pair already validated by whatever
    calls them (neither method itself checks bounds).
  - *Connects to:* called by `_SudokuAppState._cells`/`_givenCells`;
    reads `SudokuBoard`'s own private `_grid`/`_isGiven` fields directly,
    since both live inside the same real class.
  - *Shape:* Phase 2's own real, already-tested public read API —
    unchanged since Lesson 34.

- **`_SudokuAppState._cells`/`_givenCells`**
  - *What it is:* reappearing in full from Lesson 34 — two real Dart
    getters, each rebuilding a brand-new `List<List<...>>` from
    `_board`'s own real, current state every single time either one is
    read, never storing the result anywhere.
  - *Implementation:* real, verbatim, from `project/lib/main.dart`:
    ```dart
    List<List<int?>> get _cells {
      return List.generate(
        SudokuBoard.size,
        (row) => List.generate(SudokuBoard.size, (col) => _board.valueAt(row, col)),
      );
    }
    ```
  - *Its use:* this lesson's own single clearest real example of
    **derived state** — `SudokuBoardView`'s own `cells:` parameter reads
    fresh, real, current values every rebuild, with no real risk of ever
    showing stale data, because there is no separately-stored "cells"
    value that could ever fall out of sync with `_board`.
  - *Type:* a real Dart getter — a method called with property-access
    syntax, no parentheses, reappearing from Lesson 9's own `.length`.
  - *Responsibility:* to answer "what does the board look like right
    now," recomputed in full on every single call, never partially.
  - *Depends on:* `_board`, and, transitively, `List.generate`.
  - *Connects to:* read by `build()`, handed straight to
    `SudokuBoardView(cells: _cells, ...)`.
  - *Shape:* a real, deliberate architectural choice inside
    `_SudokuAppState` — compute, don't cache.

- **`WidgetTester.pumpWidget`**
  - *What it is:* reappearing in full from Lesson 25 — a real method on
    Flutter's own test-only `WidgetTester` class that builds (or
    rebuilds) a real widget tree inside a real, in-memory test
    environment, with no actual device or browser involved.
  - *Implementation:* real shape used here: `Future<void>
    pumpWidget(Widget widget, [Duration? duration, EnginePhase
    phase])` — this lesson calls it with just the one required real
    `Widget` argument, same as every earlier Flutter lesson.
  - *Its use:* this lesson's own two new real, throwaway probes each
    call it more than once in sequence — the real, central new
    discovery this lesson adds: calling it again with a *different*
    real widget type first, then a fresh `SudokuApp()`, genuinely tears
    down and rebuilds the whole tree, rather than reusing anything from
    the call before it.
  - *Type:* a real instance method on `WidgetTester`.
  - *Responsibility:* attach the given real widget as the real root of a
    test-only widget tree, running exactly the same real
    `Widget`→`Element`→`RenderObject` pipeline Lesson 25 already proved
    — reusing the existing tree when the new root widget is real
    compatible with what's already there, or discarding it entirely and
    starting over when it isn't.
  - *Depends on:* a real `Widget` to pump; an active `testWidgets` real
    test environment providing `tester` in the first place.
  - *Connects to:* called directly from this lesson's own two probe
    functions; every earlier Flutter lesson's own real widget tests
    already called it the same way.
  - *Shape:* real, standard `flutter_test` API surface — not part of
    `project/`'s own production code at all.

- **`SizedBox`**
  - *What it is:* reappearing in full from Lesson 29 — a real, general-
    purpose Flutter widget that occupies a fixed real size (or, with no
    arguments at all, exactly zero size) and paints nothing of its own.
  - *Implementation:* real shape used here: `const SizedBox()` — every
    constructor argument (`width`, `height`, `child`) genuinely omitted.
  - *Its use:* this lesson's own real, deliberate choice for Concept
    Unit 5's own probe — a real widget of a genuinely *different*
    runtime type than `SudokuApp`, pumped in between two real
    `SudokuApp()` pumps specifically to force a real, complete teardown.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* narrowly, here: exist as some real, minimal,
    already-taught widget with nothing in common with `SudokuApp` at
    all, so Flutter's own real reconciliation has no real reason to
    preserve anything across the swap.
  - *Depends on:* nothing — it takes no required arguments.
  - *Connects to:* pumped directly by `WidgetTester.pumpWidget`, with
    nothing before or after it in this lesson's own probe.
  - *Shape:* a small, public, extremely commonly used real widget,
    reused here for a purpose (forcing teardown) unrelated to its usual
    layout role.

---

## Concept Unit: Local State — `_SessionStatusState`'s Own Real Timer

### The Problem

`_SessionStatusState` has held its own real `_elapsedSeconds` count and
its own real `_ticker` since Lesson 28. No other widget in this app has
ever asked to read either one. Is that a gap, or is it actually the
correct, deliberate design?

> **Pause and think:** Given everything Lesson 28 already proved about
> `State` objects — that each one is private to its own widget subtree,
> reachable only through that widget's own constructor parameters — what
> would a sibling widget (say, `SudokuBoardView`) have to do to read
> `_SessionStatusState`'s real `_elapsedSeconds` value directly, without
> it being passed down explicitly? Given that no code anywhere in this
> project attempts this, what does that suggest about whether this
> value actually needs to be seen outside `_SessionStatusState` at all?

### Project Change

No reference counterpart — this unit reviews real, already-existing
code (Lesson 28) without modifying any project file.

### The New Code

Real, verbatim, from `project/lib/main.dart` — `_SessionStatusState`'s
own complete, real class body, unchanged since Lesson 28:

```dart
class _SessionStatusState extends State<_SessionStatus> {
  int _gamesStarted = 0;
  int _elapsedSeconds = 0;
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        _elapsedSeconds++;
      });
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _startNewGame() {
    setState(() {
      _gamesStarted++;
    });
  }
  // ...build() — this lesson's own next Concept Unit's subject.
}
```

### The Updated Project

Not applicable — this unit's own "New Code" above already is the
complete, real, already-existing `_SessionStatusState` class body,
unmodified. There is no smaller-then-larger structure to return to,
because nothing here is new or changed.

### Isolate and Discard

Not applicable — this is real, already-shipped project code, examined in
place, not a throwaway lab.

### Mechanical Walkthrough

- `int _gamesStarted = 0;` / `int _elapsedSeconds = 0;` — two real,
  private (leading-underscore, reappearing from Lesson 11), mutable
  `int` fields, each initialized to a real literal `0`. Both are
  genuinely private to this one `State` object's own instance — no
  syntax exists anywhere in Dart to reach either field from outside this
  class without `_SessionStatusState` itself exposing a real accessor,
  and it never does.
- `Timer? _ticker;` — a real, private, nullable (`?`, reappearing from
  Lesson 5) field, holding either a real, running `Timer` or `null`
  before one has started. Nullable specifically because a `State`
  object briefly exists (during construction) before `initState` has
  run and actually created the real `Timer`.
- `void initState() { super.initState(); _ticker = Timer.periodic(...); }`
  — reappearing in full: the real, one-time setup hook; `super
  .initState()` runs the real, abstract `State` class's own base setup
  first, then this override creates the real, repeating `Timer`,
  assigning it to `_ticker`.
- `(const Duration(seconds: 1), (_) { setState(() { _elapsedSeconds++; }); })`
  — a real `Duration` literal (reappearing from Lesson 28) and a real
  anonymous callback (reappearing from Lesson 15); `_elapsedSeconds++`
  is the real increment operator (reappearing from Lesson 20), wrapped
  in `setState` (reappearing from Lesson 28) so the real framework knows
  to rebuild this one `State` object's own subtree after the value
  changes — and, critically, *only* this one subtree; nothing else in
  the app rebuilds because of it.
- `void dispose() { _ticker?.cancel(); super.dispose(); }` — reappearing
  in full: `?.` (reappearing from Lesson 10) safely calls `.cancel()`
  only if `_ticker` is genuinely non-null; `super.dispose()` runs last,
  handing real teardown control back to the base `State` class after
  this override's own real cleanup is done.
- `void _startNewGame() { setState(() { _gamesStarted++; }); }` — a real,
  private method, called only from this same class's own `build()`
  (next unit); increments `_gamesStarted` the identical real way
  `_elapsedSeconds` increments above.

### CS Lens

Every one of these five real members lives inside one real object with
one real, private scope — this is **encapsulation** (Lesson 11's own
hard concept, reappearing in full), applied here specifically to
*temporal* state (a value that changes over real time) rather than the
structural state Lesson 11 first taught it with.

```
Also recognized in: a thermostat's own internal temperature-averaging
buffer (never exposed to the room's other devices), a video game's own
per-enemy AI cooldown timer (invisible to every other enemy), a web
browser tab's own scroll position (never visible to a different tab)
```

### SE Lens

The alternative — making `_elapsedSeconds`/`_ticker` reachable from
outside `_SessionStatusState`, just in case something someday needs them
— was not chosen, and this lesson names why explicitly for the first
time: doing that "just in case" is exactly the failure Lesson 12's own
SE lens already warned about in a different shape (premature
generality). The real cost of over-exposing local state early is real,
ongoing maintenance risk with no present benefit — every additional
reader of a mutable field is one more place that has to be checked, and
possibly broken, the next time this field's own meaning changes. The
real, correct call here: nothing else in this app needs this value, so
nothing else can see it, and that is the desired outcome, not an
oversight.

### Commands Needed

None — no new commands this unit.

### Run It

Not applicable — no new execution; Lesson 28's own already-real,
already-saved test run (`session_status_test.dart`, still passing as
part of the current 16/16 suite) already covers this exact code.

### Connect

`_SessionStatusState` is a real, complete, correct example of state that
should stay local — genuinely private, genuinely safe to keep that way.
The next unit shows what happens the moment two *different* widgets
genuinely need the same real value.

---

## Concept Unit: Shared State — Lifting `_board` Up to `_SudokuAppState`

### The Problem

`SudokuBoardView` needs to know which cell is selected, to draw its real
highlight. `NumberPadView`'s own tap needs to know which cell is
selected too, to know where to write the real digit. Neither widget is
an ancestor of the other — they're real siblings, both built inside the
same `Column` in `_SudokuAppState.build()`. Given Lesson 28's own real
proof that a `State` object is genuinely private, how can two sibling
widgets possibly coordinate on the same real value at all?

> **Pause and think:** Since Flutter widgets only ever receive data
> *down*, through their own constructor parameters (already true since
> Lesson 27's own `required this.message`-style fields) — if
> `SudokuBoardView` and `NumberPadView` cannot pass data directly to each
> other as true siblings, where is the *one* real place both of their
> own real parameter lists could originate from at once? Given
> `_SudokuAppState` is the one real object that already constructs both
> of them inside the same `build()` method — what does that suggest
> about where `_selectedRow`/`_selectedCol` and `_board` itself should
> actually live?

### Project Change

**Reference Source:** `project/lib/main.dart`, lines 35-74 (the complete,
real `_SudokuAppState` field and method declarations, unchanged since
Lesson 34), read fresh this session. **Files affected:** none this
unit — reviewing already-real code. **Change type:** none (review only).
**Location:** not applicable.

### The New Code

Real, verbatim, from `project/lib/main.dart`:

```dart
class _SudokuAppState extends State<SudokuApp> {
  final SudokuBoard _board = SudokuBoard(_startingPuzzle);
  int? _selectedRow = 4;
  int? _selectedCol = 4;

  void _selectCell(int row, int col) {
    setState(() {
      _selectedRow = row;
      _selectedCol = col;
    });
  }
```

### The Updated Project

The complete, real `build()` method both `_selectCell` and `_board`
ultimately feed, unchanged since Lesson 34, numbered:

```dart
1   Widget build(BuildContext context) {
2     return MaterialApp(
3       scaffoldMessengerKey: _scaffoldMessengerKey,
4       home: Scaffold(
5         appBar: AppBar(title: const Text('Sudoku')),
6         body: SingleChildScrollView(
7           padding: const EdgeInsets.all(16),
8           child: Column(
9             children: [
10              SudokuBoardView(
11                cells: _cells,
12                givenCells: _givenCells,
13                selectedRow: _selectedRow,        // ← shared value, read
14                selectedCol: _selectedCol,         // ← shared value, read
15                onCellTap: _selectCell,             // ← shared behavior, read
16              ),
17              const SizedBox(height: 16),
18              NumberPadView(onDigitTap: _enterDigit),  // ← reaches the same _board via _enterDigit
19              const SizedBox(height: 16),
20              const _SessionStatus(),
21            ],
22          ),
23        ),
24      ),
25    );
26  }
```

Both real siblings — `SudokuBoardView` at line 10 and `NumberPadView` at
line 18 — receive their own real piece of the same shared state from the
one real object that constructs them both: `_selectedRow`/
`_selectedCol` flow down into `SudokuBoardView`'s own real constructor
parameters at lines 13-14, and `_board` (not directly visible here,
reached through `_enterDigit`) is what `NumberPadView`'s own real tap
callback ultimately writes to at line 18. Neither widget has ever needed
to know the other exists.

### Isolate and Discard

This is exactly what Lesson 34 already built for a different reason
(connecting the UI to the real engine) — no new throwaway lab is needed
to isolate the *pattern* itself, since the real project code already is
the clearest possible real instance of it. What this unit isolates
instead, in the next section, is a genuine counter-example: a value
that was *not* lifted, and the real, provable gap that leaves behind.

### Mechanical Walkthrough

- `final SudokuBoard _board = SudokuBoard(_startingPuzzle);` — a real,
  `final` (reappearing from Lesson 5) field, constructed exactly once
  when `_SudokuAppState` itself is created. This is the real, single
  shared owner of every Sudoku rule in this app — **lifting state up**,
  this lesson's own new term, means exactly this: the value lives here,
  one level above every widget that needs to touch it, instead of inside
  either sibling.
- `int? _selectedRow = 4;` / `int? _selectedCol = 4;` — two real,
  nullable, mutable fields (reappearing from Lesson 10's own nullable
  types), also owned here rather than inside `SudokuBoardView` itself,
  for the identical real reason: `NumberPadView`'s own tap needs to know
  which cell is selected, and `NumberPadView` is not, and can never be,
  an ancestor of `SudokuBoardView`.
- `void _selectCell(int row, int col) { setState(() { _selectedRow = row; _selectedCol = col; }); }`
  — a real method, also living on the shared owner, not inside
  `SudokuBoardView`. This is **shared state**'s other real half:
  it is not enough to lift the *value* — the real *behavior* that
  changes it has to live in the same shared place too, or the two
  widgets would still have no way to agree on how the value is allowed
  to change.
- `SudokuBoardView(cells: _cells, givenCells: _givenCells, selectedRow: _selectedRow, selectedCol: _selectedCol, onCellTap: _selectCell)`
  — a real widget constructor call passing five real, named arguments
  down; `selectedRow`/`selectedCol` hand the real, shared value down as
  plain data; `onCellTap: _selectCell` hands the real, shared *behavior*
  down as a real callback (reappearing from Lesson 15's own
  functions-as-values) — this is the only real direction data is
  allowed to travel in Flutter's own widget tree: down, from the shared
  owner into each real child.
- `NumberPadView(onDigitTap: _enterDigit)` — the real, second sibling,
  receiving its own real callback from the identical shared owner;
  `_enterDigit` (already fully explained in Lesson 34, reappearing in
  full here) reaches the same real `_board` `_selectCell` reads,
  proving both siblings really do share the same real, single source of
  truth, never a separate copy each.

### CS Lens

Moving a value to the nearest real common ancestor of everything that
needs it is a real, working instance of **lifting state up** — a name
Flutter's own official documentation uses for exactly this pattern,
which is itself a specific real application of a more general idea:
placing shared mutable data at the lowest point in a real hierarchy that
still dominates every reader and writer of it.

```
Also recognized in: a shared bank account balance, stored once at the
bank rather than duplicated in each account holder's own private
ledger; a version-control system's own single shared remote repository,
rather than each collaborator keeping an unsynchronized private copy; a
building's own single shared thermostat, rather than one per room with
no way to agree on a target temperature
```

### SE Lens

The alternative — duplicating `_selectedRow`/`_selectedCol` separately
inside both `SudokuBoardView` and `NumberPadView`, each keeping its own
private copy — was rejected because the two copies would have no real
way to stay in agreement: tapping a cell in the board would update the
board's own private copy, while the number pad's own separate copy
would still say something else entirely, silently. The real cost of
lifting the value up instead: `_SudokuAppState` itself grows larger and
has to know slightly more about what its own children need, which is a
real, ongoing trade Lesson 41 (architecture) will eventually revisit as
this app grows past one screen's worth of state.

### Commands Needed

None — no new commands this unit.

### Run It

Not applicable — no new execution for this unit's own review; the
existing `cell_selection_test.dart` and `number_pad_test.dart` (already
part of the current 16/16 passing suite) already prove, for real, that
both siblings genuinely observe the same shared selection.

### Connect

Shared state, correctly lifted, is invisible precisely because it works
— nothing about `SudokuBoardView`/`NumberPadView` looks unusual. The
next unit proves, with a real, run probe, what a value looks like when
it was *not* lifted to where it needed to be.

---

## Concept Unit: The Real Gap — a Value That Was Never Shared At All

### The Problem

`_gamesStarted` lives inside `_SessionStatusState` — genuinely local
state, by Concept Unit 1's own real reasoning. But "Start New Game" is
not a neutral label; it claims, in plain English, that tapping it starts
a *new game*. Does it actually reach `_board` at all?

> **Pause and think:** Given `_SessionStatusState` and `_SudokuAppState`
> are two genuinely separate `State` objects (Lesson 28), and
> `_gamesStarted` was deliberately kept local in Concept Unit 1 — what,
> concretely, would `_startNewGame()` have to do differently to actually
> reset `_board`? Given `_board` is a real, `final` field on
> `_SudokuAppState`, not `_SessionStatusState` — can
> `_SessionStatusState._startNewGame()` reach it at all, today, without
> a genuine change to how this state is organized?

### Project Change

No reference counterpart — this unit's own real evidence is a
deliberately-run throwaway probe against already-shipped `project/`
code, not a new `project/` feature.

### The New Code

Real, verbatim, from a throwaway probe temporarily placed at
`project/test/lesson35_session_disconnect_probe_test.dart`, run this
session, then moved to `verification/lesson-35/
session_disconnect_probe_test.dart` and deleted from `project/test/`:

```dart
await tester.pumpWidget(const SudokuApp());

await tester.tap(
  find.descendant(of: find.byType(NumberPadView), matching: find.text('5')),
);
await tester.pump();

final placedCell = tester.widget<SudokuCellView>(
  find.byWidgetPredicate((widget) => widget is SudokuCellView && widget.row == 4 && widget.col == 4),
);
expect(placedCell.value, 5);

final startButton = find.text('Start New Game');
await tester.ensureVisible(startButton);
await tester.tap(startButton);
await tester.pump();

expect(find.text('Games started: 1'), findsOneWidget);

final stillPlacedCell = tester.widget<SudokuCellView>(
  find.byWidgetPredicate((widget) => widget is SudokuCellView && widget.row == 4 && widget.col == 4),
);
expect(stillPlacedCell.value, 5);
```

### The Updated Project

Not applicable in the usual sense — no tracked `project/` file changes.
The minimal already-established piece this probe actually runs
against, per this schema's own callout for exactly this situation, is
`_SessionStatusState._startNewGame` (already shown in full in Concept
Unit 1) and `_SudokuAppState._board` (Concept Unit 2) — the probe's own
entire point is that the first never reaches the second.

### Isolate and Discard

This probe *is* the isolated case — the smallest real sequence that
proves the gap. Discarded from `project/test/` immediately after this
session's real run; its own source and real output are preserved
permanently in `verification/lesson-35/`, per the Verification Rule's
own Persistence clause.

### Mechanical Walkthrough

- `await tester.pumpWidget(const SudokuApp());` — reappearing in full:
  builds the real, complete app tree, `await` (reappearing from Lesson
  16) pausing this async test function until the real build finishes.
- `tester.tap(find.descendant(of: find.byType(NumberPadView), matching: find.text('5')));`
  — `find.descendant`/`find.byType`/`find.text`, all reappearing in
  full from Lessons 32/33: locates the real `Text('5')` specifically
  *inside* `NumberPadView`, not any other real `'5'` already on screen
  (Lesson 33's own already-real ambiguous-finder lesson, reapplied
  here); `tester.tap` (reappearing from Lesson 32) simulates a real
  finger press on it.
- `await tester.pump();` — reappearing in full: processes exactly one
  real frame, letting the real `setState` call `_enterDigit` triggers
  actually rebuild the tree before this test reads anything.
- `tester.widget<SudokuCellView>(find.byWidgetPredicate((widget) => widget is SudokuCellView && widget.row == 4 && widget.col == 4))`
  — reappearing in full from Lesson 31: `find.byWidgetPredicate` runs a
  real boolean test (`is`, reappearing from Lesson 10) against every
  real widget in the tree; `tester.widget<SudokuCellView>` retrieves the
  one real matching instance, typed as `SudokuCellView` via the real
  generic type argument `<SudokuCellView>` (reappearing from Lesson 10).
- `expect(placedCell.value, 5);` — reappearing in full from Lesson 24:
  a real assertion; `.value`, a real property read (reappearing from
  Lesson 11), confirms the real digit landed where expected before the
  probe's own actual point even begins.
- `final startButton = find.text('Start New Game'); await tester.ensureVisible(startButton);`
  — `find.text`, reappearing; `tester.ensureVisible`, reappearing in
  full from Lesson 33 — scrolls the real, scrollable body until the
  real button is actually on the visible real test surface, without
  which `tester.tap` on it would fail.
- `await tester.tap(startButton); await tester.pump();` — reappearing:
  the real tap this whole unit is actually about — this is the real,
  same tap `session_status_test.dart` already proved increments
  `_gamesStarted`.
- `expect(find.text('Games started: 1'), findsOneWidget);` —
  `findsOneWidget`, reappearing from Lesson 24: confirms the real,
  on-screen counter did increment — the local-state half of
  `_startNewGame` genuinely works.
- `final stillPlacedCell = ...; expect(stillPlacedCell.value, 5);` —
  the real, central assertion this whole probe exists for: re-reads the
  identical real cell from Concept Unit 2's own already-shared `_board`,
  and confirms, for real, that it still holds `5` — the exact digit
  placed *before* "Start New Game" was ever tapped. A genuine new game
  would have reset this to `null`, since `(4, 4)` is not a given clue.

### CS Lens

This is a real, concrete instance of **state that was never actually
lifted** — `_gamesStarted` sits in the wrong real scope for what its own
label claims to do, the exact real failure mode Concept Unit 2's own CS
Lens described in the abstract, now proved with a real, passing-yet-
damning test rather than described in prose alone.

```
Also recognized in: a UI's "Save" button that only writes to an
in-memory draft and never reaches the real database it claims to save
to, a smart-home app's "All Off" switch that only controls the lights
its own screen happens to list, a game's own "Restart Level" button
that resets the on-screen timer display but not the actual level state
underneath it
```

### SE Lens

The honest alternative already available today — reaching into
`_SudokuAppState` from `_SessionStatusState` some other way, without
first restructuring where this state actually lives — was not attempted
and would not have worked cleanly: Lesson 28's own real proof that
`State` objects are genuinely private already rules out any direct
reference between two unrelated `State` classes. The real, honest cost
this project is currently carrying, named plainly: a button whose own
label makes a promise its own current code cannot keep. This is
precisely the motivating problem the rest of Phase 4 exists to solve —
not a bug to patch narrowly inside `_startNewGame`, but the reason a
real, single, well-modeled game session (Lesson 36) needs to exist as
its own real thing in the first place.

### Commands Needed

- `flutter test test/lesson35_session_disconnect_probe_test.dart` — the
  same `flutter test` invocation established since Lesson 24, given one
  specific real file path so only this probe runs.

### Run It

Real, run this session:

```
00:00 +0: loading .../lesson35_session_disconnect_probe_test.dart
00:00 +0: a real, honest gap: Start New Game never touches the real board
00:02 +1: All tests passed!
```

The real test passes — which is itself the point: it does not assert
that a bug exists as a failure, it asserts, and confirms, the real
*current* behavior, so this gap is documented with evidence rather than
left to be rediscovered by accident later.

### Connect

Concept Unit 2 showed shared state done correctly; this unit shows,
with a real, run probe, exactly what an *unshared* value that should
have been shared looks like from the outside — a button that lies by
omission. The next unit turns to a real category this app has not yet
had any occasion to need at all.

---

## Concept Unit: Application State — a Real, Honest Absence

### The Problem

Shared state (two real units ago) needed a common ancestor *within one
screen*. This app has always had exactly one screen. Does that mean
application state — Phase 4's third named category — simply doesn't
exist here yet, or is it silently present without a name?

> **Pause and think:** Given every widget this app has ever built lives
> inside the one real `Scaffold` in `_SudokuAppState.build()` — has any
> lesson so far ever built a second, separate screen, or any real
> mechanism for moving between two screens? If the answer is genuinely
> no, what would you expect a real, honest search of `project/lib/` to
> turn up if you searched it for Flutter's own real navigation
> vocabulary?

### Project Change

No reference counterpart — this unit's own evidence is a real search of
already-existing files, not a new feature.

### The New Code

Real, run this session, from a terminal at the repository root:

```powershell
Select-String -Path "project\lib\*.dart" -Pattern "Navigator|MaterialPageRoute|onGenerateRoute|routes:|Route<"
```

### The Updated Project

Not applicable — no project file is modified or even opened for editing
this unit; this is a real, read-only search across the four files that
already exist (`main.dart`, `sudoku_board.dart`, `sudoku_board_view.dart`,
`number_pad_view.dart`).

### Isolate and Discard

Not applicable — a real, one-shot terminal command, not a throwaway code
lab.

### Mechanical Walkthrough

- `Select-String` — this lesson's own new Header entry: a real
  PowerShell cmdlet, distinct from every terminal tool taught since
  Lesson 2, purpose-built for searching real text content rather than
  managing files, paths, or processes.
- `-Path "project\lib\*.dart"` — a real, named parameter (PowerShell's
  own dash-prefixed parameter syntax, first seen informally in Lesson
  2's own `Get-ChildItem Env:` but not yet named this explicitly);
  `*.dart` is a real, literal wildcard, matching every real file in that
  one folder ending in `.dart`.
- `-Pattern "Navigator|MaterialPageRoute|onGenerateRoute|routes:|Route<"`
  — a real regular expression (the vertical bar `|` meaning "or,"
  matching any one of five real alternatives), naming the concrete,
  real vocabulary Flutter's own navigation system actually uses:
  `Navigator` (the real class that manages a stack of screens),
  `MaterialPageRoute` (a real, concrete screen-transition type),
  `onGenerateRoute`/`routes:` (two real, alternate ways an app declares
  which screens exist), and `Route<` (the real, generic base type
  underneath all of them).

### CS Lens

Searching real source text for the exact vocabulary a feature would have
to use, rather than reasoning abstractly about whether that feature
exists, is a real instance of **verifying absence, not just asserting
it** — the same real discipline this curriculum has already applied
more than once (Lesson 4's own symptom-vs-cause tracing; Lesson 22's own
real, checked `assert()` no-op discovery) applied here to a structural,
architectural claim instead of a runtime bug.

```
Also recognized in: a security audit grepping a codebase for a banned
function before claiming it's unused, a linter's own real "unused
import" check scanning actual usage rather than trusting a comment, a
database migration review searching for every real reference to a
column before claiming it's safe to drop
```

### SE Lens

The alternative — simply asserting "this app is single-screen, so
application state doesn't apply yet" without checking — was rejected for
the same reason this curriculum has rejected every other unverified
claim about real, existing code: an assumption that happens to be true
today is indistinguishable, without evidence, from one that quietly
stopped being true after an edit nobody remembered to reconsider. The
real, honest cost of this category being absent: nothing in
`project/lib/` has ever had to reason about "does this value need to be
the same across two different screens," which is exactly why this unit
cannot show a real example the way the previous two could — only a real,
verified absence, honestly reported as one, with a forward pointer to
where this actually becomes unavoidable: Lesson 64 (Settings) and Lesson
70 (Achievements) are both real, later, separate screens this
curriculum's own `curriculum.md` already commits to, and either one will
be the first place a value (a sound-on/off preference; an achievement
unlocked while playing) genuinely needs to be seen from more than one
screen at once.

### Commands Needed

- `Select-String -Path <files> -Pattern <regex>` — explained in full
  above; no additional flags used.

### Run It

Real, run this session. Real output: none — PowerShell prints nothing
at all when `Select-String` finds zero matches, which is itself the
real, confirmed result: every one of `project/lib/`'s own four files was
searched, and not one of the five real navigation terms appears
anywhere in any of them.

### Connect

Shared state and application state are the *same* real pattern (lift to
the nearest common ancestor), differing only in how far up the tree that
ancestor sits — this app has only ever needed the nearer of the two so
far, confirmed rather than assumed. The next unit turns to a category
this app already has a real, working example of.

---

## Concept Unit: Derived State — `_cells`/`_givenCells`, Computed, Never Stored

### The Problem

`_board` is the one real, shared source of truth (two units ago). But
`SudokuBoardView` doesn't accept a `SudokuBoard` directly — its own real
`cells:` parameter wants a plain `List<List<int?>>` (Lesson 31). Where
should that plain list actually come from, and when should it be built?

> **Pause and think:** Given `SudokuBoard` deliberately never exposes
> its own real grid directly (Lesson 11's own encapsulation), what two
> real options exist for getting a plain `List<List<int?>>` out of it:
> building one once and storing it as its own separate field, or
> building one fresh every time it's needed? Given Concept Unit 3's own
> real gap (a value that quietly went stale because nothing kept it in
> sync with its real source) — which of those two options would
> guarantee that can never happen here, and why?

### Project Change

**Reference Source:** `project/lib/main.dart`, lines 41-53 (the complete,
real `_cells`/`_givenCells` getters, unchanged since Lesson 34), read
fresh this session. **Files affected:** none — reviewing already-real
code. **Change type:** none (review only). **Location:** not applicable.

### The New Code

Real, verbatim, from `project/lib/main.dart`:

```dart
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

Not applicable — this unit's own "New Code" already is the complete,
unmodified pair of getters; nothing here changes.

### Isolate and Discard

Not applicable — real, already-shipped project code, examined in place.

### Mechanical Walkthrough

- `List<List<int?>> get _cells { ... }` — `get`, reappearing in full
  from Lesson 9's own `.length`: declares a real Dart getter, called
  with plain property syntax (`_cells`, no parentheses) at every real
  call site, even though real work happens underneath every single time
  it's read.
- `List.generate(SudokuBoard.size, (row) => List.generate(SudokuBoard.size, (col) => _board.valueAt(row, col)))`
  — `List.generate`, reappearing in full from Lesson 17: a real, static
  factory constructor building a brand-new real `List` of the given
  real length by calling its own second argument (a real anonymous
  function) once per real index; nested here (the outer call's own
  generator function itself calls `List.generate` again) to build a
  genuine 9x9 real structure, one row at a time; `SudokuBoard.size`, a
  real `static const` (reappearing from Lesson 20), supplies the real
  `9` both nested calls need without either one hardcoding it.
- `_board.valueAt(row, col)` — reappearing in full (this lesson's own
  Header entry, above): reads one real, current digit directly from the
  one real, shared `_board`, every single time this generator runs.
- `List<List<bool>> get _givenCells { ... }` — the identical real shape,
  reading `_board.isGivenAt(row, col)` instead — this project's own
  second real getter proving the same point a second time: no stored
  `_givenCells` field exists anywhere in `_SudokuAppState` for this
  value to ever go stale in.

### CS Lens

Neither getter stores its own result anywhere — each one is a real,
working instance of **derived state**, this lesson's own new term:
recomputing a value from its real source on every read, rather than
caching it, trades a small, real, repeated cost (rebuilding an 81-cell
list on every rebuild, genuinely cheap at this scale) for an absolute
real guarantee: `_cells` can never disagree with `_board`, because
`_cells` has no independent existence at all to disagree from.

```
Also recognized in: a spreadsheet formula cell recalculated from its
own real inputs every time a dependency changes rather than cached
stale, a database VIEW computed fresh from its underlying real tables on
every real query rather than materialized once, a build system's own
incremental output recomputed from real, current source files rather
than trusted from a previous, possibly-stale run
```

### SE Lens

The alternative — storing `_cells` as its own real, separate field,
updated by hand inside `_enterDigit` alongside the real call to
`_board.placeDigit` — was not chosen, and the real reason connects
directly to Concept Unit 3's own real, proved gap: any place a value is
updated by hand, in more than one place, is a real place that update can
eventually be forgotten. Deriving `_cells` fresh every time removes that
entire real risk for this specific value, at the real, accepted cost of
recomputing 81 real cells on every rebuild rather than reusing a cached
list — a cost genuinely worth paying at this project's own real, current
scale, and one Lesson 89 (Performance profiling) is where this curriculum
would actually revisit that trade-off if this board ever grew far larger
than 9x9.

### Commands Needed

None — no new commands this unit.

### Run It

Not applicable as a fresh execution — the existing, already-passing
`number_pad_test.dart` (part of the current 16/16 suite, unmodified this
lesson) is itself real, already-saved evidence for this exact claim: it
places a real digit via `_enterDigit`, then immediately reads
`SudokuCellView.value` for that same cell and finds the new digit
already there, with no separate refresh step anywhere in the test — the
Verification Rule's own Persistence clause covers reusing this
already-real, already-saved run rather than re-executing an identical
check.

### Connect

`_cells`/`_givenCells` are the one real category this app already
handles cleanly, with zero risk of the drift Concept Unit 3 proved is
possible elsewhere. The final unit turns to the one category this app
has no real defense against at all yet.

---

## Concept Unit: Persistent State — a Real, Proved Absence

### The Problem

Every kind of state this lesson has named so far — local, shared,
application — still only describes *where inside one running process* a
value lives. None of them describe what happens when that process stops
running entirely. Does anything in this app survive that?

> **Pause and think:** Given Lesson 1's own real CPU/RAM/storage
> distinction — `_board`, `_selectedRow`, `_elapsedSeconds`, and every
> other real field this app has built across Phase 3 all live in one
> place: this process's own RAM — what real, concrete event would cause
> every one of them to disappear at once? Given `flutter_test` builds a
> real, fresh widget tree every time `pumpWidget` is given an
> incompatible new root widget (Lesson 25's own real reconciliation
> rules) — could that specific real behavior be used to *simulate* that
> event inside a test, without actually closing and reopening a real
> app window?

### Project Change

No reference counterpart — this unit's own real evidence is a
deliberately-run throwaway probe, not a new `project/` feature.

### The New Code

Real, verbatim, from a throwaway probe temporarily placed at
`project/test/lesson35_persistence_probe_test.dart`, run this session,
then moved to `verification/lesson-35/persistence_probe_test.dart` and
deleted from `project/test/`:

```dart
await tester.pumpWidget(const SudokuApp());

await tester.tap(
  find.descendant(of: find.byType(NumberPadView), matching: find.text('5')),
);
await tester.pump();

expect(
  tester
      .widget<SudokuCellView>(
        find.byWidgetPredicate((w) => w is SudokuCellView && w.row == 4 && w.col == 4),
      )
      .value,
  5,
);

await tester.pumpWidget(const SizedBox());
await tester.pumpWidget(const SudokuApp());

expect(
  tester
      .widget<SudokuCellView>(
        find.byWidgetPredicate((w) => w is SudokuCellView && w.row == 4 && w.col == 4),
      )
      .value,
  isNull,
);
```

### The Updated Project

Not applicable in the usual sense — no tracked `project/` file changes.
The minimal already-established piece this probe runs against, per this
schema's own callout for exactly this situation, is `SudokuApp`'s own
real, unmodified constructor (`const SudokuApp({super.key})`, Lesson 27)
and `_SudokuAppState`'s own real field initializers (Concept Unit 2,
above) — the probe's entire point is that a fresh construction of the
first produces entirely fresh values for the second.

### Isolate and Discard

This probe *is* the isolated case. Discarded from `project/test/`
immediately after this session's real run; source and real output
preserved permanently in `verification/lesson-35/`.

### Mechanical Walkthrough

- The first six real lines (`pumpWidget`, `tap`, `pump`, `expect`) —
  every token here reappears in full, already fully explained in this
  lesson's own previous unit's walkthrough: build the real app, place a
  real `5` at `(4, 4)`, confirm it landed.
- `await tester.pumpWidget(const SizedBox());` — this lesson's own new
  Header entry: pumps a real widget of a genuinely different runtime
  type as the new root. Because `SizedBox` shares no real type
  relationship with `SudokuApp` at all, Flutter's own real
  reconciliation (Lesson 25) has no compatible existing `Element` to
  update — it unmounts the entire previous tree instead, calling every
  real `dispose()` method along the way, including
  `_SudokuAppState`'s own (inherited, never overridden, so the default,
  real, inherited version runs).
- `await tester.pumpWidget(const SudokuApp());` — a second, real,
  fresh `SudokuApp()`. Because the *previous* root was just torn down
  completely, this call has nothing real to reconcile against — it
  builds a genuinely new `_SudokuAppState`, running its own real field
  initializers (`SudokuBoard(_startingPuzzle)`, `_selectedRow = 4`, and
  so on, Concept Unit 2) from scratch, exactly as if this were the very
  first time this app had ever been built.
- `expect(..., isNull);` — `isNull`, reappearing from Lesson 5: the
  real, central proof this whole unit exists for — the identical cell,
  `(4, 4)`, that held a real `5` moments ago, is genuinely empty again,
  because it belongs to a completely different, freshly-constructed
  `SudokuBoard` instance than the one the earlier `5` was written into.

### CS Lens

Tearing down and rebuilding a whole real object graph from its own
initial construction, with nothing carried over, is a real, working
instance of **process restart** — the same real event Lesson 1's own
Concept Unit 1 named as the boundary between RAM (contents lost) and
storage (contents kept), reproduced here at the scale of one widget
tree instead of a whole operating-system process, because `flutter_test`
gives no other real way to trigger an actual OS-level restart from
inside a test.

```
Also recognized in: a web page's own JavaScript state disappearing on a
real browser refresh, a video game's own in-memory world state resetting
on a real console power cycle, a server's own in-memory cache emptying
on a real process restart, regardless of how carefully organized any of
that in-memory state was beforehand
```

### SE Lens

The alternative — treating this app's current, complete lack of real
persistence as acceptable because "the demo works" — was rejected for
the same honest reason Concept Unit 3 named its own gap plainly rather
than assuming it away: a real player who plays for ten real minutes and
then genuinely loses the app (a real phone call, a real low-battery
shutdown, simply closing the app) loses every real minute of that
progress, with no warning anywhere in this app's own current UI that
this is even a risk. The real cost this project is currently, honestly
carrying: nothing about `_board`, `_selectedRow`, `_gamesStarted`, or
`_elapsedSeconds` survives past this one process's own lifetime, and
nothing in Phase 4 is going to fix that either — Phase 6 (Persistence,
Lessons 49-57) is the real, specific, later place this curriculum
already commits to actually writing state to real, durable storage;
naming the gap honestly now, rather than pretending it doesn't exist
until Phase 6 arrives, is this unit's entire real point.

### Commands Needed

- `flutter test test/lesson35_persistence_probe_test.dart` — the same
  established `flutter test` invocation, given one specific real file
  path.

### Run It

Real, run this session, together with the previous unit's own probe, in
one batched pass per the Verification Rule's own Batching clause:

```
00:00 +0: loading .../lesson35_session_disconnect_probe_test.dart
00:00 +0: a real, honest gap: Start New Game never touches the real board
00:02 +1: loading .../lesson35_persistence_probe_test.dart
00:02 +1: nothing survives a real restart — a fresh State starts over
00:02 +2: All tests passed!
```

### Connect

Every real kind of state this lesson named — local, shared, application,
derived — still only ever describes arrangements *within* one running
process. This last, real, run-proved gap is the one none of the first
four can fix by better organization alone: it needs real, durable
storage, which this app genuinely does not have yet.

---

## Connect the Pieces

Follow one single real value — the digit `5`, placed at real cell
`(4, 4)` — through every kind of state this lesson named:

1. Placing it at all required `_selectedRow`/`_selectedCol` (**shared
   state**, Concept Unit 2) to already correctly identify `(4, 4)` as
   selected, and `NumberPadView`'s own tap to reach the one real,
   shared `_board` both it and `SudokuBoardView` depend on.
2. The instant it landed, `_cells` (**derived state**, Concept Unit 4)
   recomputed a brand-new 9x9 list from `_board`'s own real, current
   contents — with no separate step required to "notice" the change,
   because `_cells` never stored the old answer to begin with.
3. Meanwhile, `_SessionStatusState`'s own real `_elapsedSeconds`
   (**local state**, Concept Unit 1) kept ticking, completely unaware
   this digit was ever placed — correctly so, since nothing about a
   session timer needs to know which cell was just filled.
4. Tapping "Start New Game" proved, with a real, run probe (Concept Unit
   3), that this digit's own real survival had nothing to do with
   whether that button was pressed — a real, honest gap, because
   `_gamesStarted` was never actually connected to `_board` at all.
5. Tearing the whole app down and rebuilding it fresh (**persistent
   state**, Concept Unit 5) proved, with a second real, run probe, that
   this same digit *does* disappear the moment the process holding it
   stops — the one real kind of loss this lesson named but did not, and
   could not yet, fix.

This app now has a name for exactly what's wrong with it: a real button
that claims to start a new game but doesn't, sitting next to a real
board that would lose everything anyway if the process actually
restarted. The next lesson gives this problem a real, single, modeled
owner: `GameSession`.
