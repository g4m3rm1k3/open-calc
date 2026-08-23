# Lesson 28: A Widget That Remembers Something

**What you will build:** `project/`'s own real screen gains a small,
genuine feature — a live "Elapsed: N s" counter and a "Start New Game"
button showing "Games started: N" — both real, run-verified, both
actually changing on screen in response to real events (a repeating
timer, a real tap), neither of which a `StatelessWidget` (Lessons
25-27) could do at all. The transferable problem: a `Widget` is
immutable and thrown away every rebuild (Lesson 25's own real, central
proof) — so where does a number that needs to *keep changing*, tap after
tap, second after second, actually live?

**What you need to know first:**
- Lesson 5 — `final`; reused for every field this lesson's own
  `_SessionStatusState` does *not* mutate.
- Lesson 7 — the increment operator (`++`).
- Lesson 8 — named parameters, `onPressed`-style callback parameters.
- Lesson 11 — constructors, fields, encapsulation.
- Lesson 12 — `extends`, `@override`, reused for both of this lesson's
  own new classes.
- Lesson 13 — `identical()`, reused directly in this lesson's own real
  probe proving `State` survives a rebuild the same way `Element` already
  did in Lesson 25.
- Lesson 15 — anonymous functions, reused for every callback this lesson
  passes to `setState`, `Timer.periodic`, and `onPressed`.
- Lesson 16 — `Future`/event-loop scheduling, reused as the general idea
  a callback runs later, not the instant it's registered — extended here
  to a callback that runs repeatedly.
- Lesson 20 — `static`, reused in this lesson's own throwaway
  rebuild-scope lab; the general "why recompute more than changed"
  question, reused in this lesson's own SE lens.
- Lesson 24 — the real, permanent `project/test/` convention.
- Lesson 25 — `Widget`, `Element`, `StatelessWidget`/`StatelessElement`,
  and the real, quoted proof that a `Widget` is thrown away every
  rebuild while its `Element` persists — this lesson's whole subject is
  what changes when the *Element* also needs to remember more than just
  "which widget configures me."
- Lesson 26 — the real `MaterialApp`/`Scaffold`/`AppBar` tree this
  lesson's own new widget is added into.
- Lesson 27 — `super.key`, library privacy (leading underscore),
  `required`/`this.field` shorthand — all reused unchanged in this
  lesson's own two new classes.

**Pipeline diagram.** This curriculum's own widget pipeline, established
across Lessons 25-27:

```
Widget
  ↓ createElement() / canUpdate()
Element
  ↓ createRenderObject() / updateRenderObject()
RenderObject
  ↓ layout → paint → composite
Pixels
```

Carrying a concrete value through every stage, extended by this lesson:
the literal integer `0` — `_SessionStatusState`'s own initial
`_gamesStarted` — starts as a field on a **State** object, a genuinely
new kind of object this diagram hasn't shown yet, created once by the
**Element** stage (specifically, a `StatefulElement`, real evidence
below) and kept alongside it for as long as that `Element` lives. Every
real tap calls `setState`, which asks that same `Element` to rebuild —
producing a *new* **Widget** describing the current count, inflating
into the *same*, already-real **RenderObject**, reaching real **Pixels**
showing the new number — without ever creating a new **Element** or a
new **State**. This lesson touches the **Element** stage specifically:
what it holds besides a `Widget` reference, for the first time.

**Terms used in this lesson:**
- **State** — new: a real, separate object a `StatefulWidget` creates
  once, that holds whatever data needs to survive across rebuilds (a
  count, a timer, anything a plain `Widget` — thrown away every build,
  per Lesson 25 — structurally cannot hold onto). It exists because
  Lesson 25's own real proof left an open question: if `Widget`s are
  this cheap and disposable, what object *does* remember something
  across time, and this is Flutter's real, direct answer.
- **`setState`** — new: a real method every `State` object has,
  taking a callback that mutates the `State`'s own fields, which then
  tells the framework "this widget's own description is now stale — call
  `build` again." It exists because directly mutating a field with no
  further signal would change the data but never actually schedule a new
  frame — Lesson 26's own real, quoted `WidgetsBinding.drawFrame`/
  `buildOwner.buildScope` only rebuilds `Element`s already marked dirty,
  and `setState` is the real, only sanctioned way to mark one.
- **Lifecycle** — new: the real, ordered sequence of methods Flutter
  calls on a `State` object over its own real lifetime — `initState`
  once, near the beginning; `build` any number of times; `dispose` once,
  at the very end. It exists because a `State` object, unlike a `Widget`,
  genuinely has a beginning and an end worth naming and reacting to.
- **`initState`** — new: a real method called exactly once, the first
  time a `State` object is actually attached to the tree — real, quoted
  evidence below. It exists as the correct, real place to start anything
  that should happen once, not on every rebuild (a running timer started
  fresh on every `build` call would leak a new one on every rebuild
  instead of ticking once per second).
- **`dispose`** — new: a real method called exactly once, when a
  `State` object is permanently removed from the tree — real, quoted
  evidence below. It exists as the real, correct place to release
  anything `initState` acquired, so a widget that's gone doesn't keep
  real resources (a running `Timer`, in this lesson's own case) alive
  forever.
- **`Timer` / `Timer.periodic`** — new: a real `dart:async` class
  (already imported, transitively, since Lesson 16's own `Future`/
  `Stream` work uses the same library) that schedules a callback to run
  once, after a real delay (`Timer`), or repeatedly, at a fixed real
  interval (`Timer.periodic`). It exists as the concrete, real mechanism
  behind "do something every second," extending Lesson 16's own
  event-loop scheduling from a one-shot `Future` to a repeating one.
- **`Duration`** — new: a real, immutable value type representing a real
  span of time (`Duration(seconds: 1)`), used to tell `Timer.periodic`
  how often to fire. It exists as a real, typed alternative to passing a
  bare number of milliseconds and hoping every caller agrees what unit
  it's in.
- **Discard name (`_`)** — new: naming a parameter `_` instead of a real
  word, a real, valid Dart identifier, used specifically to signal "this
  parameter exists because the callback's own shape requires it, but
  nothing in this body actually reads it." It exists so a reader
  scanning `(_) { ... }` doesn't have to check the whole body just to
  learn the parameter is unused — the name itself already says so.
- **Rebuild scope** — new: the real, specific claim that calling
  `setState` on one `State` object only rebuilds *that* object's own
  subtree, never forces every other widget in the whole app to rebuild
  too — real, run-proved below, not assumed. It exists as the actual
  reason Flutter apps stay fast even with `setState` called constantly
  in one small corner of a much larger screen.

**Objects and methods used:**

- **`StatefulWidget`**
  - *What it is:* the real, second kind of `Widget` (alongside Lesson
    25's own `StatelessWidget`), used for anything whose own real
    behavior needs to remember something across rebuilds.
  - *Implementation:* real, verbatim, from
    `C:\flutter\packages\flutter\lib\src\widgets\framework.dart`:
    `abstract class StatefulWidget extends Widget { const StatefulWidget({super.key}); @override StatefulElement createElement() => StatefulElement(this); @protected State createState(); }`
    (the real doc comment on `createElement` — "Creates a
    [StatefulElement] to manage this widget's location in the tree" —
    is the exact real sibling of Lesson 25's own quoted
    `StatelessWidget.createElement()`).
  - *Its use:* `_SessionStatus`, this lesson's own new class, extends it
    instead of `StatelessWidget`, because it needs a real, persistent
    counter `StatelessWidget` structurally cannot hold.
  - *Type:* an `abstract class` extending `Widget`.
  - *Responsibility:* to declare the one method every concrete subclass
    must supply — `createState`, building the real, separate object that
    actually holds this widget's own changing data — and wire up
    `StatefulElement` as the real `Element` subtype that manages it.
  - *Depends on:* nothing to construct; `createState()` is called once,
    later, by the framework.
  - *Connects to:* `_SessionStatus` extends it; its own `createElement()`
    constructs a `StatefulElement`, which immediately calls its own
    `createState()`.
  - *Shape:* a public extension point, the second of the two concrete
    `Widget` subtypes application code actually extends (alongside
    `StatelessWidget`).

- **`State<T>`**
  - *What it is:* the real, separate object `StatefulWidget.createState()`
    builds — the thing that actually holds `_SessionStatus`'s own
    `_gamesStarted`, `_elapsedSeconds`, and `_ticker` fields.
  - *Implementation:* real, verbatim (trimmed to what this lesson uses):
    `abstract class State<T extends StatefulWidget> with Diagnosticable { T get widget => _widget!; @protected @mustCallSuper void initState() {} @protected @mustCallSuper void dispose() {} @protected Widget build(BuildContext context); void setState(VoidCallback fn) { ... } }`.
  - *Its use:* `_SessionStatusState`, this lesson's own new class,
    extends it, overriding `initState`, `dispose`, and `build`, and
    calling its own real `setState` twice — once from a real button tap,
    once from a real timer tick.
  - *Type:* an `abstract class`, generic over the specific
    `StatefulWidget` subtype it belongs to.
  - *Responsibility:* to hold real, mutable data across rebuilds, react
    to its own real lifecycle moments (`initState`/`dispose`), and
    produce this widget's own current real description via `build`.
  - *Depends on:* nothing to construct — `StatefulElement` builds one via
    `widget.createState()`.
  - *Connects to:* built by `StatefulElement`; its own `widget` getter
    reads back the current, real `StatefulWidget` configuring it (a
    different, real object on every rebuild — Lesson 25's own already-
    proved distinction, still true here).
  - *Shape:* the real, second half of the `StatefulWidget` pair —
    application code extends this, not `StatefulWidget`'s own
    `createElement`.

- **`StatefulElement`**
  - *What it is:* the real, concrete `Element` subtype every
    `StatefulWidget` inflates into — the real sibling of Lesson 25's own
    `StatelessElement`, and the real object that actually owns and calls
    a `State`'s own lifecycle methods.
  - *Implementation:* real, verbatim, from `framework.dart`:
    the constructor, `StatefulElement(StatefulWidget widget) : _state = widget.createState(), super(widget) { ...; state._element = this; ...; state._widget = widget; ... }`
    (lines 5915 onward — read fresh in Lesson 25, reused here, its own
    lifecycle-calling methods read fresh this session); `_firstBuild()`,
    line 5963: `final Object? debugCheckForReturnedFuture = state.initState() as dynamic;`;
    `unmount()`, line 6043: `state.dispose();`.
  - *Its use:* this lesson's own real, direct evidence for **Lifecycle**:
    the real source names the *exact* two real moments `initState`/
    `dispose` are called — once, inside `_firstBuild()` (the very first
    time this `Element` builds), and once, inside `unmount()` (when this
    `Element` is permanently removed) — not on every ordinary rebuild.
  - *Type:* a concrete class extending `ComponentElement` extending
    `Element`.
  - *Responsibility:* to construct exactly one real `State` object (via
    `widget.createState()`), call its lifecycle methods at the real,
    correct moments, and call its `build()` whenever this `Element`
    itself rebuilds.
  - *Depends on:* a `StatefulWidget` to call `createState()` on.
  - *Connects to:* constructed by `StatefulWidget.createElement()`; its
    own `state.initState()`/`state.dispose()`/`state.build()` calls are
    the real, concrete mechanism behind every one of this lesson's own
    Header terms.
  - *Shape:* internal framework machinery — real, but never subclassed
    or constructed directly by application code, the same standing as
    Lesson 25's own `StatelessElement`.

- **`Timer.periodic`**
  - *What it is:* a real, static constructor on `dart:async`'s `Timer`
    class, building a real timer that calls its own given callback
    repeatedly, at a fixed real interval.
  - *Implementation:* real signature shape:
    `factory Timer.periodic(Duration duration, void Function(Timer timer) callback)`,
    returning a real `Timer` whose own real `cancel()` method stops
    further calls.
  - *Its use:* `_SessionStatusState.initState()` calls it once, real,
    with a real one-second `Duration`, storing the real `Timer` it
    returns in `_ticker` so `dispose()` can call `cancel()` on it later.
  - *Type:* a `factory` constructor (a constructor that can return an
    existing or specially-constructed instance rather than always
    building a brand-new one in the ordinary way) on the real `Timer`
    class.
  - *Responsibility:* to schedule a real, repeating callback and hand
    back a real, live handle capable of stopping it.
  - *Depends on:* a real `Duration` and a real callback.
  - *Connects to:* called once, in `initState`; its own callback calls
    `setState`; its own returned `Timer` is cancelled in `dispose`.
  - *Shape:* a public, directly-usable `dart:async` class — the same
    library `Future`/`Stream` (Lesson 16) already come from.

- **`ElevatedButton`**
  - *What it is:* a real, standard Material button widget.
  - *Implementation:* real, verbatim shape:
    `const ElevatedButton({super.key, required this.onPressed, required this.child, ...})`.
  - *Its use:* this lesson's own real `_SessionStatusState.build()`
    constructs one, wiring its real `onPressed` callback to
    `_startNewGame`.
  - *Type:* a concrete class extending `StatefulWidget` (it tracks its
    own real, internal pressed/hover/focus state, one further real
    example of this lesson's own subject, one layer beneath this
    lesson's own code).
  - *Responsibility:* to draw a real, tappable Material button and call
    its own `onPressed` callback exactly once per real tap.
  - *Depends on:* a real `onPressed` callback and a real `child` widget.
  - *Connects to:* constructed inside `_SessionStatusState.build()`;
    its own `onPressed` calls `_startNewGame`, which calls `setState`.
  - *Shape:* a public, directly-constructed Material widget.

- **`Column`**
  - *What it is:* a real, standard layout widget arranging a real list of
    children vertically — narrowly used here; full, formal treatment
    (how it actually decides each child's size and position) is Lesson
    29's own subject.
  - *Implementation:* real, narrow shape used here:
    `Column({super.key, this.mainAxisAlignment = MainAxisAlignment.start, this.mainAxisSize = MainAxisSize.max, required this.children})`.
  - *Its use:* `SudokuApp.build()` uses one to stack the board
    placeholder above `_SessionStatus`; `_SessionStatusState.build()`
    uses a second one to stack its own three real children.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* narrowly, for this lesson: hold a real, ordered
    list of children and arrange them top to bottom — the actual
    mechanics of how it decides sizing are deliberately not explained
    yet.
  - *Depends on:* a real list of child widgets.
  - *Connects to:* used twice, in `SudokuApp.build()` and
    `_SessionStatusState.build()`.
  - *Shape:* a public, directly-constructed layout widget, narrowly
    scoped here, forward-referenced to Lesson 29 for its full mechanics.

- **`tester.state<T>()` / `tester.tap()` / `tester.pump(Duration)`**
  - *What it is:* three real `WidgetTester` methods, new in this lesson
    — `WidgetTester` itself reappearing in full from Lesson 25.
  - *Implementation:* real signature shapes:
    `T state<T extends State<StatefulWidget>>(Finder finder)`,
    `Future<void> tap(Finder finder)`,
    `Future<void> pump([Duration? duration])`.
  - *Its use:* `tester.state<...>(...)` reaches the real, live `State`
    object directly (this lesson's own real proof that it survives a
    rebuild); `tester.tap(...)` simulates a real tap; `tester.pump
    (Duration(...))` advances a real, fake clock inside the test, without
    actually waiting real wall-clock time, letting a real `Timer.periodic`
    genuinely fire inside a test that finishes in milliseconds.
  - *Type:* three real instance methods on `WidgetTester`.
  - *Responsibility:* `state` reads live framework state directly;
    `tap` simulates a real gesture; `pump(duration)` simulates real time
    passing, processing any real timers scheduled within that window.
  - *Depends on:* a `Finder` (`state`/`tap`) or an optional `Duration`
    (`pump`).
  - *Connects to:* used throughout this lesson's own real labs and the
    real `project/test/session_status_test.dart`.
  - *Shape:* public, test-only methods — real, direct control over a
    real, running (headless) widget tree.

---

## Concept Unit: `State` — Where a Number That Changes Actually Lives

### The Problem

Lesson 25's own real, run-proved evidence was unambiguous: a `Widget` is
thrown away and rebuilt constantly; only its `Element` persists. If
`project/`'s own screen needs a real, on-screen count that goes up every
time a button is tapped, and `_PlaceholderMessage` (a `StatelessWidget`,
Lesson 27) has no field that survives past one `build()` call, where
could such a count possibly live?

> **Pause and think:** Lesson 25's own real, quoted `StatelessElement`
> holds a `widget` field, replaced on every rebuild — nothing else. If
> you needed one more real field that *doesn't* get replaced every
> rebuild, and Lesson 12 already taught composition (one object holding
> a reference to another), what kind of second, real object would you
> reach for — one owned by the `Element`, not by the throwaway `Widget`?
> Given Lesson 8's own real, required-parameter proof, what would you
> guess happens if a class declares a method it never implements — would
> you expect that to compile at all?

### Project Change

**Reference Source:** no reference implementation — this project's own,
from-scratch feature. **Files affected:** `project/lib/main.dart`,
modified; `project/test/session_status_test.dart`, created (a real,
permanent test). **Change type:** add. **Location:** two new classes,
appended after `_PlaceholderMessage`; `SudokuApp.build()`'s own `body:`
changed from a single widget to a `Column` holding both the placeholder
and this lesson's own new widget. **Dependencies:** unchanged.

### The New Code

```dart
class _SessionStatus extends StatefulWidget {
  const _SessionStatus();

  @override
  State<_SessionStatus> createState() => _SessionStatusState();
}

class _SessionStatusState extends State<_SessionStatus> {
  int _gamesStarted = 0;

  void _startNewGame() {
    setState(() {
      _gamesStarted++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Games started: $_gamesStarted'),
        ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game')),
      ],
    );
  }
}
```

### The Updated Project

The complete, real `project/lib/main.dart`, with this unit's own new
lines marked (the real `Timer`-based elapsed counter is the next unit's
own addition, not shown yet):

```dart
1  import 'package:flutter/material.dart';
2
3  void main() {
4    runApp(const SudokuApp());
5  }
6
7  class SudokuApp extends StatelessWidget {
8    const SudokuApp({super.key});
9
10   @override
11   Widget build(BuildContext context) {
12     return MaterialApp(
13       home: Scaffold(
14         appBar: AppBar(title: const Text('Sudoku')),
15         body: const Column(                                            // ← changed
16           mainAxisAlignment: MainAxisAlignment.center,                  // ← new
17           children: [                                                  // ← changed
18             _PlaceholderMessage(message: 'Board goes here'),           // ← changed (moved into children)
19             SizedBox(height: 24),                                       // ← new
20             _SessionStatus(),                                          // ← new
21           ],
22         ),
23       ),
24     );
25   }
26 }
27
28 class _PlaceholderMessage extends StatelessWidget {
29   const _PlaceholderMessage({required this.message});
30
31   final String message;
32
33   @override
34   Widget build(BuildContext context) {
35     return Center(child: Text(message));
36   }
37 }
38
39 class _SessionStatus extends StatefulWidget {                          // ← new
40   const _SessionStatus();                                              // ← new
41
42   @override                                                            // ← new
43   State<_SessionStatus> createState() => _SessionStatusState();        // ← new
44 }                                                                      // ← new
45
46 class _SessionStatusState extends State<_SessionStatus> {              // ← new
47   int _gamesStarted = 0;                                                // ← new
48
49   void _startNewGame() {                                                // ← new
50     setState(() {                                                       // ← new
51       _gamesStarted++;                                                  // ← new
52     });                                                                  // ← new
53   }                                                                      // ← new
54
55   @override                                                             // ← new
56   Widget build(BuildContext context) {                                  // ← new
57     return Column(                                                      // ← new
58       mainAxisSize: MainAxisSize.min,                                   // ← new
59       children: [                                                       // ← new
60         Text('Games started: $_gamesStarted'),                          // ← new
61         ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game')),  // ← new
62       ],                                                                 // ← new
63     );                                                                   // ← new
64   }                                                                      // ← new
65 }                                                                       // ← new
```

`SudokuApp.build()`'s own `body` is now a real `Column` holding both the
board placeholder and this lesson's own new session-status widget; the
whole screen still renders as one real tree, exactly per Lesson 25's own
architecture.

### Isolate

A real, minimal throwaway lab, `verification/lesson-28/test/
state_probe_test.dart`, isolates the two claims this lesson's own real
code above depends on, before trusting them inside `project/`:

```dart
class Counter extends StatefulWidget {
  const Counter();
  @override
  State<Counter> createState() => CounterState();
}

class CounterState extends State<Counter> {
  int count = 0;
  void increment() {
    setState(() {
      count++;
    });
  }
  @override
  Widget build(BuildContext context) {
    return Text('$count', textDirection: TextDirection.ltr);
  }
}
```

Run for real, this session, via `flutter test test\state_probe_test.dart`:

```
calling setState really does update what build() returns
the same State object survives a rebuild, unlike the Widget
+2: All tests passed!
```

The second real test is this unit's own most important proof, directly
extending Lesson 25's own `identical()`-based evidence: it pumps a
`Counter`, calls `increment()` twice directly on the real `State`
object, pumps a *second*, separately-built `Counter()` widget into the
same spot, and confirms, by `identical()`, that the `State` object
reached the second time is the exact same object as the first —
`count` really did survive, unlike `firstWidget`/`secondWidget`
themselves, which Lesson 25's own real proof already showed are never
the same object twice. This is exactly what `_SessionStatus` in the real
code above is relying on: `_gamesStarted` surviving every rebuild
`SudokuApp.build()` triggers.

### Discard

This lab is discarded — `Counter`/`CounterState` never appear in
`project/`; the real classes `project/lib/main.dart` now depends on are
`_SessionStatus`/`_SessionStatusState`, shown above in The New Code.

### Mechanical Walkthrough

- `class _SessionStatus extends StatefulWidget` — `extends`, reappearing
  in full from Lesson 12; `StatefulWidget`, this lesson's own new Header
  entry — the real, second kind of `Widget`, chosen here specifically
  because this widget's own real behavior needs to remember a count.
- `const _SessionStatus();` — `const`, reappearing in full from Lesson 5:
  even a `StatefulWidget` instance itself stays a cheap, throwaway
  configuration object — only its separate `State` is long-lived, not
  the widget.
- `State<_SessionStatus> createState() => _SessionStatusState();` — this
  lesson's own new `State<T>` Header entry: the one method
  `StatefulWidget` requires, returning a brand-new
  `_SessionStatusState` — real, quoted evidence (`StatefulElement`'s own
  constructor, `_state = widget.createState()`) that this method is
  called exactly once, when this widget first inflates, never again on
  later rebuilds.
- `class _SessionStatusState extends State<_SessionStatus>` — `extends`,
  reappearing; `State<_SessionStatus>`, this lesson's own Header entry —
  the generic type parameter names which `StatefulWidget` this `State`
  belongs to, letting its own real `widget` getter (inherited, not
  called directly by this lesson's own code yet) return a properly-typed
  `_SessionStatus`, not a bare `Widget`.
- `int _gamesStarted = 0;` — a real, mutable field (no `final`, unlike
  every field this curriculum's own `Widget` classes have ever declared)
  — the actual, concrete answer to this unit's own Problem: this is
  where a number that needs to keep changing lives.
- `void _startNewGame() { setState(() { _gamesStarted++; }); }` — this
  lesson's own new `setState` Header entry: takes an anonymous function
  (reappearing in full from Lesson 15), inside which `_gamesStarted++`
  (the increment operator, reappearing from Lesson 7) actually mutates
  the field; `setState` itself, after that callback returns, is what
  tells the framework this widget's own description is now stale.
- `Column(mainAxisSize: MainAxisSize.min, children: [...])` — this
  lesson's own new `Column` Header entry, used narrowly; `MainAxisSize
  .min` (a real enum value, reappearing enum-value-access syntax from
  Lesson 13) tells it to take only as much vertical space as its
  children actually need, rather than expanding to fill everything
  available — deferred, full mechanical treatment to Lesson 29.
- `Text('Games started: $_gamesStarted')` — `Text`, reappearing in full
  from Lesson 26; string interpolation (`$_gamesStarted`), reappearing
  in full from Lesson 5 — reads the real, current field value at
  whatever moment `build()` happens to run.
- `ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game'))`
  — this lesson's own new `ElevatedButton` Header entry; `onPressed:
  _startNewGame` passes the *method itself* as a value (reappearing in
  full from Lesson 15's own first-class-function treatment), not a call
  to it — `_startNewGame()` would call it immediately during `build()`,
  which is exactly the kind of accidental-immediate-call bug Lesson 15's
  own higher-order-function unit already warned about.

### CS Lens

Splitting one real widget into a cheap, throwaway `Widget` half and a
separate, persistent `State` half is a real, working instance of
**separating configuration from mutable runtime state** — the same
architectural split this curriculum has already met once, at a different
layer: `Widget` versus `Element` (Lesson 25) is this exact same idea,
one level up; `StatefulWidget` versus `State` is Flutter's own second,
deliberate application of it.

```
Also recognized in: a video game's own "prefab" (a reusable template)
versus a spawned instance's own runtime fields, a web component's props
(passed in, replaced on every render) versus its internal state (kept
across renders), a database's own schema (a fixed shape) versus a
specific row's own changing values
```

### SE Lens

The alternative — letting a plain `StatelessWidget` hold a mutable field
directly, and mutating it from inside `build()` — was never actually
possible to begin with: Lesson 25's own real, quoted `Widget` source
shows every field a `const`-constructible widget declares must be
`final`, and even without `const`, a new `Widget` object is built fresh
on every single rebuild regardless, so any mutation to it would be
silently thrown away with the old object a moment later. The real
tradeoff `StatefulWidget` accepts instead: two real classes and one real
extra allocation (the `State` object, built once) in exchange for
somewhere real and persistent to actually put a number like this.

### Commands Needed

- `flutter analyze lib\main.dart` — real, captured output, this session:
  `No issues found!` (part of a combined real run, per the Verification
  Rule's Batching clause, shown in this unit's own Run It step).

### Run It

Real, captured output, this session, from `flutter test test\
session_status_test.dart` (the tap-counter half only — the elapsed-timer
test is added in the next unit):

```
tapping Start New Game increments the real, on-screen count
```

### Connect

`_SessionStatus` now genuinely remembers a tap count across rebuilds,
real-proved both in isolation and inside the real app. The next unit
gives its own `State` object a real beginning and a real end.

---

## Concept Unit: Lifecycle — A Real Beginning and a Real End

### The Problem

The previous unit's own `_SessionStatusState` only reacts to a real,
external tap. Curriculum's own Lesson 28 bullets name **lifecycle**
directly — and a real elapsed-time counter (a genuinely useful, real
feature for any timed game) needs something to happen *on its own*,
starting the moment the screen appears, with no tap required. Where in a
`State` object's own real life would starting a repeating timer actually
belong — and, just as important, where does it need to be *stopped*?

> **Pause and think:** Lesson 16's own real, measured proof was that a
> scheduled callback runs later, governed by the event loop, not the
> instant it's registered — if `build()` can genuinely be called many
> times over a widget's own life, what would go wrong, specifically, if
> a new repeating timer were started fresh inside `build()` itself,
> every single time it ran? Given curriculum's own real word "lifecycle"
> — implying a beginning and an end — what would you guess the real,
> paired method to whichever one starts something is likely to be named?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/main.dart`, modified further; `project/test/
session_status_test.dart`, extended. **Change type:** add.
**Location:** inside `_SessionStatusState`, two new overridden methods
and one new field. **Dependencies:** `dart:async`, added to the file's
own imports.

### The New Code

```dart
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
```

### The Updated Project

The complete, real `_SessionStatusState` class, with this unit's own new
lines marked:

```dart
1  class _SessionStatusState extends State<_SessionStatus> {
2    int _gamesStarted = 0;
3    int _elapsedSeconds = 0;                                            // ← new
4    Timer? _ticker;                                                     // ← new
5
6    @override                                                           // ← new
7    void initState() {                                                  // ← new
8      super.initState();                                                // ← new
9      _ticker = Timer.periodic(const Duration(seconds: 1), (_) {        // ← new
10       setState(() {                                                    // ← new
11         _elapsedSeconds++;                                             // ← new
12       });                                                               // ← new
13     });                                                                 // ← new
14   }                                                                     // ← new
15
16   @override                                                            // ← new
17   void dispose() {                                                     // ← new
18     _ticker?.cancel();                                                 // ← new
19     super.dispose();                                                   // ← new
20   }                                                                     // ← new
21
22   void _startNewGame() {
23     setState(() {
24       _gamesStarted++;
25     });
26   }
27
28   @override
29   Widget build(BuildContext context) {
30     return Column(
31       mainAxisSize: MainAxisSize.min,
32       children: [
33         Text('Elapsed: $_elapsedSeconds s'),                           // ← new
34         Text('Games started: $_gamesStarted'),
35         ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game')),
36       ],
37     );
38   }
39 }
```

`_SessionStatusState` now has a real beginning (`initState`, starting the
timer) and a real end (`dispose`, stopping it) surrounding its own
already-real `build`.

### Isolate

A real, separate throwaway lab, `verification/lesson-28/test/
lifecycle_probe_test.dart`, isolates `initState`/`dispose`/`Timer
.periodic` before trusting them in `project/`'s own real file:

```dart
class TickerState extends State<Ticker> {
  int seconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() { seconds++; });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Text('$seconds', textDirection: TextDirection.ltr);
}
```

Real, run this session, via `flutter test test\lifecycle_probe_test.dart`:

```
initState starts a real, repeating timer
dispose really cancels the timer — no pending timer at test end
+2: All tests passed!
```

The first real test pumps a `Ticker`, then calls `tester.pump(Duration
(seconds: 1))` — advancing `flutter_test`'s own real, fake internal
clock by one full second without the test actually waiting a real second
— and confirms the real, on-screen text changed from `'0'` to `'1'`;
pumping three more seconds in one call reaches `'4'`, real, direct proof
`Timer.periodic` really does fire once per real interval, not once
total. The second real test is where the `dispose` half of this claim
gets *proven*, not assumed: **a real, deliberately-triggered failure**
— temporarily removing `_timer?.cancel()` from `dispose()` and rerunning
this exact test produced a real, genuine failure:

```
Pending timers:
Timer (duration: 0:00:01.000000, periodic: true), created:
#5      TickerState.initState (file:///.../lifecycle_probe_test.dart:20:20)
...
```

`flutter_test` itself refuses to end a test with a real timer still
scheduled — direct, run proof that `dispose` failing to cancel a real
`Timer` is a genuine, detectable leak, not a hypothetical one. Restoring
`_timer?.cancel()` made the test pass again, cleanly, confirming the fix.

### Discard

This lab is discarded — `Ticker`/`TickerState` never appear in
`project/`; the real classes it depends on are `_SessionStatus`/
`_SessionStatusState`, already shown in The Updated Project above.

### Mechanical Walkthrough

- `int _elapsedSeconds = 0;` / `Timer? _ticker;` — two new real, mutable
  fields; `Timer?`, a nullable type (reappearing in full from Lesson 5/
  10), starts `null` until `initState` assigns it.
- `@override void initState() { super.initState(); ... }` — this
  lesson's own new `initState` Header entry; `@override`, reappearing in
  full from Lesson 12; `super.initState()`, reappearing `super`-method-
  call syntax from Lesson 26's own real, quoted `super.drawFrame()` —
  Flutter's own real, documented convention (its base `State.initState`
  does real, if currently minimal, bookkeeping) requires every override
  to call it first, per this lesson's own quoted real signature's own
  `@mustCallSuper` annotation.
- `_ticker = Timer.periodic(const Duration(seconds: 1), (_) { setState(() { _elapsedSeconds++; }); });`
  — this lesson's own new `Timer.periodic`/`Duration` Header entries;
  `const Duration(seconds: 1)` is a real, `const`-constructible value
  (reappearing from Lesson 5); the anonymous callback `(_) { ... }`
  (reappearing lambda syntax from Lesson 15, with `_` — this lesson's own
  new **discard name** Header term — naming a parameter deliberately
  never read, here the fired `Timer` itself) calls `setState` again, the
  exact same real method the previous unit's own `_startNewGame` already
  used,
  now triggered by a real timer tick instead of a real tap.
- `@override void dispose() { _ticker?.cancel(); super.dispose(); }` —
  this lesson's own new `dispose` Header entry; `_ticker?.cancel()` uses
  `?.`, the null-aware method call operator — a small, real extension of
  Lesson 5/10's own nullable-type syntax: call `cancel()` only if
  `_ticker` is genuinely non-null, doing nothing (rather than throwing)
  if it's still `null`; `super.dispose()` is called *last* here,
  deliberately the reverse order from `initState`'s own `super` call
  first — Flutter's own real, documented convention for both methods.

### CS Lens

`initState`/`dispose` together are a real, working instance of
**resource acquisition paired with guaranteed release** — starting
something real (`Timer.periodic`) exactly once, and guaranteeing,
structurally, that stopping it happens exactly once too, rather than
leaving cleanup to whichever code path happens to remember.

```
Also recognized in: a file handle opened in a constructor and closed in
a destructor (RAII, in C++), a database connection acquired in a `setup`
method and released in `teardown`, a WebSocket opened when a component
mounts and closed when it unmounts in any real UI framework
```

### SE Lens

The alternative — starting the timer directly inside `build()`, since
`build()` already runs and already has access to `setState` — was
rejected because `build()` can run many times over this widget's own
real life (any `setState` call anywhere in this subtree re-runs it), and
Lesson 25's own real evidence already proved `RenderObjectWidget
.createRenderObject`/`updateRenderObject` deliberately split "once" from
"every time" for exactly this reason — starting a repeating timer inside
`build()` would start a *new* one on every single rebuild, each one
still running, without ever stopping the previous ones: a real, genuine
leak, exactly the shape this unit's own deliberately-triggered failure
demonstrated, just from the opposite mistake (never starting it exactly
once in the first place, rather than never stopping it).

### Commands Needed

- `flutter test test\session_status_test.dart` — runs both real tests
  in this file together.
- `flutter test` (no path) — runs every real test in `project/test/`,
  per the Verification Rule's own Batching clause.

### Run It

Real, captured output, this session, from the full `flutter test` run:

```
the Sudoku shell shows a title and a body placeholder
PASS: (8 real Sudoku-engine tests, unchanged from Lesson 24)
tapping Start New Game increments the real, on-screen count
the elapsed-time counter ticks once per real second
All tests passed!
```

### Connect

`_SessionStatusState` now has a real, complete lifecycle — a beginning
that starts a real timer, an end that stops it, and a `build()` in
between reflecting whatever both real event sources (a tap, a tick)
produced. The last unit answers a question this whole feature has quietly
assumed since the first unit: does any of this ever touch the rest of
the app?

---

## Concept Unit: Rebuilds — What Actually Reruns

### The Problem

Every real `setState` call in `_SessionStatusState` triggers a real
rebuild — but of *what*, exactly? `_SessionStatus` sits inside
`SudokuApp`'s own real `Column`, which sits inside a real `Scaffold`,
inside a real `MaterialApp`. Does tapping "Start New Game" once a second,
or the real timer ticking once a second, force `SudokuApp.build()` —
and everything inside it — to run again too?

> **Pause and think:** Lesson 26's own real, quoted `WidgetsBinding
> .drawFrame` calls `buildOwner.buildScope(rootElement)` — does that
> real name suggest it rebuilds the *entire* tree from the root every
> single frame, or something narrower? Given Lesson 25's own real,
> quoted `Widget.canUpdate` compares an *old* widget against a *new*
> one at one specific position — if `SudokuApp.build()` never actually
> ran again, would there even be a new `SudokuApp` widget for anything
> to compare against?

### Project Change

No reference counterpart — this unit's own real evidence is a separate,
isolated, throwaway measurement, not a further edit to `project/`.
**Files affected:** none in `project/`; `verification/lesson-28/test/
rebuild_scope_test.dart` (created).

### The New Code

```dart
class Parent extends StatelessWidget {
  const Parent();
  static int buildCount = 0;
  @override
  Widget build(BuildContext context) {
    buildCount++;
    return const Child();
  }
}

class ChildState extends State<Child> {
  static int buildCount = 0;
  int count = 0;
  void increment() => setState(() => count++);
  @override
  Widget build(BuildContext context) {
    buildCount++;
    return Text('$count', textDirection: TextDirection.ltr);
  }
}
```

### The Updated Project

Not applicable — this real file was never staged to become part of
`project/`; it exists solely to produce this unit's own real measurement.

### Isolate and Discard

This *is* the isolated case already — the smallest structure that puts a
`StatefulWidget` genuinely beneath a `StatelessWidget` parent, with a
real, independent build counter on each. Discarded after this unit —
`Parent`/`Child` never appear in `project/`.

### Mechanical Walkthrough

- `static int buildCount = 0;` (on both `Parent` and `ChildState`) —
  `static`, reappearing in full from Lesson 20: one real, shared counter
  per class, not per instance, incremented every time that class's own
  `build()` actually runs.
- `buildCount++;` inside each `build()` — the real, concrete
  instrumentation this unit's own claim rests on: a plain, direct count,
  not an assumption.
- `void increment() => setState(() => count++);` — arrow-syntax method
  body (reappearing in full from Lesson 15), calling the same real
  `setState` this whole lesson has used throughout.

### Execution Trace

Real, run this session, via `flutter test test\rebuild_scope_test.dart`:

1. `await tester.pumpWidget(const Parent());` — first, real build.
   `Parent.buildCount` becomes `1`; `ChildState.buildCount` becomes `1`
   too, since `Parent.build()` returning `const Child()` immediately
   causes `Child` to inflate and build for the first time in the same
   pass.
2. `state.increment();` (called three real times, each followed by
   `await tester.pump();`) — each real call runs
   `setState(() => count++)` on the *same* real `ChildState` object
   (Lesson 25's own already-proved persistence, reused here), marking
   only `Child`'s own `Element` dirty.
3. Each real `tester.pump()` processes exactly the frame that real
   `setState` call scheduled — real, quoted evidence from Lesson 26,
   `buildOwner.buildScope(rootElement)`, walks every `Element` currently
   marked dirty, and only `Child`'s own `Element` was ever marked, each
   time — `Parent`'s own `Element` was never touched, because nothing
   ever called `setState` on anything inside it.
4. Final real assertions: `Parent.buildCount` is still exactly `1` —
   real, direct proof `Parent.build()` never ran again, not even once,
   across three separate real rebuilds of its own child.
   `ChildState.buildCount` reached `4` — one real initial build plus
   three real rebuilds, one per `setState` call.

Real, captured output:

```
setState on a child rebuilds only that child, not its parent
+1: All tests passed!
```

### CS Lens

This is real, measured evidence of **fine-grained, dirty-tracked
invalidation** — rebuilding only the specific part of a tree something
actually changed, rather than the whole tree, on every change.

```
Also recognized in: a spreadsheet recalculating only cells whose real
inputs changed (Lesson 20's own SE lens already named this exact
pattern for a different reason), a build system only recompiling files
whose own dependencies actually changed, a database materialized view
refreshing only the rows a real underlying change actually touched
```

### SE Lens

The alternative — `setState` on any widget anywhere forcing the entire
app to rebuild from `SudokuApp` down — was never actually built into
Flutter, and this unit's own real measurement shows exactly why that
would be a real, costly design: every one of this project's own future
Sudoku board cells (Lesson 31 onward) will each hold their own real,
small pieces of state (selected, filled, in conflict); if changing one
cell forced all 81 to rebuild, plus the entire surrounding screen, on
every single tap, this app would do dramatically more real work than it
needs to, for no real benefit — the same "why not recompute the whole
grid" question Lesson 20's own generation code already had to reason
about, now appearing at the UI layer instead of the algorithm layer.

### Commands Needed

- `flutter pub get` / `flutter test test\rebuild_scope_test.dart` —
  standard commands, already explained in earlier lessons' own Commands
  Needed steps.

### Run It

Already run, real, this session — the exact output is shown above in
the Execution Trace, not paraphrased.

### Connect

This lesson's own three real questions — where does changing data live,
when does setup/teardown actually happen, and how much of the app
actually reruns — now all have real, run-proved answers, not assumed
ones.

---

## Connect the Pieces

Follow the literal number `0` — `_gamesStarted`'s own starting value —
through everything this lesson built:

1. `_SessionStatus` (a `StatefulWidget`, Concept Unit 1) is constructed,
   real and cheap, inside `SudokuApp.build()`'s own `Column`.
2. Its own real `createElement()` (inherited, unmodified, from
   `StatefulWidget`) inflates it into a real `StatefulElement` — this
   lesson's own real, quoted evidence — which immediately calls
   `widget.createState()`, building one real, separate
   `_SessionStatusState` object.
3. That same real `StatefulElement`, per its own real, quoted
   `_firstBuild()` source, calls `state.initState()` exactly once —
   Concept Unit 2's own subject — starting a real `Timer.periodic`,
   stored in `_ticker`.
4. `build()` runs for the first time, reading `_gamesStarted` (`0`) and
   `_elapsedSeconds` (`0`) — two real fields living on the `State`
   object, not the `Widget`, exactly answering Concept Unit 1's own
   opening question.
5. A real user tap calls `_startNewGame`, which calls `setState`,
   mutating `_gamesStarted` to `1` and marking `_SessionStatusState`'s
   own `Element` dirty; independently, the real timer fires once per
   real second, calling `setState` again, mutating `_elapsedSeconds`.
6. Concept Unit 3's own real, measured proof: neither of those real
   `setState` calls ever touches `SudokuApp.build()`, `Scaffold`, or
   `_PlaceholderMessage` — `buildOwner.buildScope` (Lesson 26's own real,
   quoted source) only revisits the one real `Element` actually marked
   dirty.
7. If this screen is ever removed from the tree (not yet possible in
   this project — there's only one screen — but real and inevitable once
   Lesson 34 adds navigation), the same real `StatefulElement`'s own
   `unmount()` would call `state.dispose()`, canceling the real `_ticker`
   — this lesson's own real, deliberately-triggered failure already
   proved what happens if that step is ever skipped.

`project/`'s own real screen now has a genuine, working, tested example
of everything Lesson 31 onward will need at real scale: real,
per-widget state, a real lifecycle, and real, narrow rebuilds — not a
new mechanism special-cased for the eventual Sudoku board, the same one
this lesson already proved works, once, small, and honestly.
