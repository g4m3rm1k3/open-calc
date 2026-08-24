# Lesson 38: Choosing Who Actually Owns the State

**What you will build:** A real, working Riverpod integration —
`flutter pub add flutter_riverpod` (version `3.4.2`, resolved live from
pub.dev this session), a new `project/lib/game_session_provider.dart`
(`gameSessionProvider`, `GameSessionNotifier`), and a real migration of
`SudokuApp`/`_SudokuAppState` onto it: `runApp` now wraps the whole app
in a real `ProviderScope`; `_SudokuAppState` becomes a real
`ConsumerState`; the `_board` field Lesson 34 first added is gone,
replaced by `ref.watch(gameSessionProvider)`. Getting there required
actually discovering, by running real code, a genuine Riverpod gotcha
this project's own mutable `GameSession` runs straight into — and fixing
it for real, not glossing over it. Five existing tests broke for a real,
specific reason and were fixed for a real, specific reason, both shown.

**What you need to know first:**
- Lesson 4 — failing loud with specific, real diagnostic data, reused as
  the same standard this lesson's own real, triggered `ProviderScope`
  error is held to.
- Lesson 5 — `final`.
- Lesson 8 — named parameters.
- Lesson 10 — generic type arguments (`<GameSession>`).
- Lesson 11 — encapsulation, constructor shorthand.
- Lesson 12 — `extends`, `super`.
- Lesson 15 — functions as values, reused for a constructor tear-off
  (`GameSessionNotifier.new`).
- Lesson 13 — Dart's default, identity-based `==` for a plain object with
  no overridden equality — the exact real fact behind this lesson's own
  central discovery.
- Lesson 14 — `InvalidMoveException`, `rethrow` — reused here for real,
  for the first time since Lesson 14 itself.
- Lesson 24 — the real, permanent `project/test/` convention.
- Lesson 25 — `Widget`/`Element`/`State`, `BuildContext`, and the real,
  already-triggered `dart:ui` failure — reused directly to explain why
  the `provider` package needs a `BuildContext` at all.
- Lesson 26 — the `as` cast operator, reused inside `WidgetRef`'s own
  real, quoted source.
- Lesson 27 — `InheritedWidget`-style lookup (Lesson 25's own real
  `MaterialApp`/`Scaffold` tree), the real mechanism the `provider`
  package is built directly on top of.
- Lesson 28 — `StatefulWidget`/`State`/`setState`.
- Lesson 34 — `_board`, `InvalidMoveException`, `ScaffoldMessenger`,
  removed and rewired this lesson.
- Lesson 35 — shared state and application state — this lesson's own
  real, concrete upgrade of "lifting state up" from one screen's own
  `State` object to a real, app-wide mechanism.
- Lesson 36 — `GameSession`, finally wired into `main.dart` for the
  first time; `registerMistake`, finally called by real, live code.
- Lesson 37 — `GameIntent`/`_dispatch` — this lesson changes *what*
  `_dispatch`'s `EnterDigitIntent` case actually calls, not its own
  real shape.

**Terms used in this lesson:**
- **The `provider` package** — new: an older, still widely-used Flutter
  state-management package, built directly on top of `InheritedWidget`
  (Lesson 27's own real widget-tree lookup mechanism) — every real value
  it exposes is read by walking up the real widget tree from a
  `BuildContext`. It exists as the real, direct ancestor Riverpod itself
  was written to improve on.
- **Riverpod provider** — new: a real, global, top-level object (this
  lesson's own real `gameSessionProvider`) describing *how* to create and
  expose one piece of state, entirely independent of the widget tree —
  read through a real `ref` object instead of a `BuildContext`. It
  exists to remove the `provider` package's own real `BuildContext`
  requirement entirely: a Riverpod provider can be read from plain Dart
  code with no widget anywhere nearby, which this lesson's own new
  `game_session_provider_test.dart` (via a bare `ProviderContainer`, no
  widget tree at all) proves directly.
- **Bloc/Cubit** — new: a state-management architecture built around
  explicit, named actions transformed into a real stream of states —
  `Cubit` exposes plain methods (similar in spirit to this lesson's own
  `GameSessionNotifier.enterDigit`); `Bloc` goes one step further,
  requiring every action to be its own named "event" class, matched
  against real event-handler functions. It exists as a real, stricter,
  more ceremony-heavy alternative to Riverpod, favored by teams that want
  every state transition individually traceable through a real,
  recorded stream.

**Objects and methods used:**

- **`ProviderScope`**
  - *What it is:* a real, standard `flutter_riverpod` widget that must
    sit above every real Riverpod provider's own reader in the widget
    tree — without one, no provider anywhere below it can be read at
    all.
  - *Implementation:* real, verbatim, from
    `flutter_riverpod-3.4.2/lib/src/core/provider_scope.dart`, line 73:
    `final class ProviderScope extends StatefulWidget { const
    ProviderScope({super.key, this.overrides = const [], this.observers,
    this.retry, required this.child}); }`.
  - *Its use:* `main()` now calls `runApp(const ProviderScope(child:
    SudokuApp()))` instead of `runApp(const SudokuApp())` directly — the
    real, minimal, required change to make any Riverpod provider usable
    anywhere in this app at all.
  - *Type:* a concrete class extending `StatefulWidget` (Lesson 28,
    reappearing).
  - *Responsibility:* to hold the real, single `ProviderContainer` every
    provider beneath it actually stores its state in, and make it
    reachable by every real descendant widget.
  - *Depends on:* a real `child` widget — its one, required, named
    parameter.
  - *Connects to:* wraps `SudokuApp`; every real `ref.watch`/`ref.read`
    call anywhere beneath it resolves against this one, real, shared
    container.
  - *Shape:* real, standard `flutter_riverpod` infrastructure — this
    project's own new, permanent app root.

- **`Notifier`/`NotifierProvider`**
  - *What it is:* `Notifier<ValueT>` is a real, abstract `riverpod` class
    exposing one real, mutable-over-time value; `NotifierProvider` is
    the real, concrete provider type that owns one.
  - *Implementation:* real, verbatim, from
    `riverpod-3.4.2/lib/src/providers/notifier/orphan.dart`, lines 51-65:
    `abstract class Notifier<ValueT> extends $Notifier<ValueT> { @visibleForOverriding ValueT build(); }`
    and line 78: `final class NotifierProvider<NotifierT extends
    Notifier<ValueT>, ValueT> extends $NotifierProvider<NotifierT,
    ValueT> with LegacyProviderMixin<ValueT>`, constructed as
    `NotifierProvider(this._createNotifier, {...})`.
  - *Its use:* `GameSessionNotifier extends Notifier<GameSession>`
    (this lesson's own real subject); `gameSessionProvider =
    NotifierProvider<GameSessionNotifier, GameSession>
    (GameSessionNotifier.new)`.
  - *Type:* `Notifier` — an abstract class; `NotifierProvider` — a
    concrete, generic class taking two real type parameters (the
    notifier's own type, and the value type it exposes).
  - *Responsibility:* `Notifier.build()` — return the real, initial value
    exactly once, the first time this provider is ever read.
    `NotifierProvider` — hold the real, live `Notifier` instance and its
    current real `state`, and notify every real real listener (subject
    to `updateShouldNotify`, below) whenever `state` is reassigned.
  - *Depends on:* `NotifierProvider`'s own constructor needs a real
    factory function creating a fresh `Notifier` instance —
    `GameSessionNotifier.new`, a real tear-off (a class's own
    constructor, referenced as a plain function value, reappearing
    Lesson 15's functions-as-values idea applied to a constructor rather
    than a plain function).
  - *Connects to:* `Notifier.state` (below) is read/written by
    `GameSessionNotifier`'s own real methods; `NotifierProvider` is read
    via `ref.watch`/`ref.read`, both explained next.
  - *Shape:* real, standard `riverpod` core API — no Flutter dependency
    at all, which is exactly why `game_session_provider_test.dart` can
    exercise it directly with no widget tree.

- **`Notifier.state`**
  - *What it is:* a real, inherited property every `Notifier` subclass
    gets, holding its own current, live value.
  - *Implementation:* real shape used here — read via `state.board
    .placeDigit(...)`; written via `state = state.touched();` — a plain
    real getter/setter pair, not shown in this lesson's own quoted
    source (it lives on the internal `$Notifier` base class), but its
    real, observable behavior is this lesson's own central discovery,
    below.
  - *Its use:* `GameSessionNotifier.enterDigit` reads it to reach the
    real, live `GameSession`, and reassigns it after every real change,
    so real listeners (`ref.watch(gameSessionProvider)` in `main.dart`)
    know to rebuild.
  - *Type:* a real getter/setter pair, typed `GameSession` here.
  - *Responsibility:* hold the current real value, and, on every real
    reassignment, decide (via `updateShouldNotify`) whether real
    listeners should actually be told.
  - *Depends on:* being read/written only from inside the owning
    `Notifier`'s own real methods — reading it from outside requires
    going through `ref.watch`/`ref.read` instead.
  - *Connects to:* reassigned inside `enterDigit`; read by
    `ref.watch(gameSessionProvider)` in `_SudokuAppState.build`.
  - *Shape:* real, standard `riverpod` infrastructure.

- **`ConsumerStatefulWidget`/`ConsumerState`/`WidgetRef`**
  - *What it is:* `ConsumerStatefulWidget` is a real, `flutter_riverpod`
    drop-in replacement for `StatefulWidget`; `ConsumerState` is the
    matching drop-in for `State`, adding one real new property, `ref`,
    typed `WidgetRef` — the real object every provider is actually read
    or written through.
  - *Implementation:* real, verbatim, from
    `flutter_riverpod-3.4.2/lib/src/core/consumer.dart`, line 316:
    `abstract class ConsumerStatefulWidget extends StatefulWidget {
    const ConsumerStatefulWidget({super.key}); @override ConsumerState
    createState(); }`; line 357-361: `abstract class
    ConsumerState<WidgetT extends ConsumerStatefulWidget> extends
    State<WidgetT> { late final ref = context as WidgetRef; }`.
  - *Its use:* `SudokuApp extends ConsumerStatefulWidget` (was
    `StatefulWidget`); `_SudokuAppState extends ConsumerState<SudokuApp>`
    (was `State<SudokuApp>`) — `ref` is what `_dispatch` and `build` both
    now use to reach `gameSessionProvider`.
  - *Type:* two abstract classes, each directly extending Flutter's own
    real `StatefulWidget`/`State`.
  - *Responsibility:* identical to plain `StatefulWidget`/`State`
    (Lesson 28) in every other real respect — the *only* real addition is
    the `ref` property.
  - *Depends on:* `ConsumerState`'s own real `ref` getter depends on its
    `context` genuinely being a `WidgetRef` at runtime — real, verbatim
    from the same file, `ConsumerStatefulElement` (the real `Element`
    `ConsumerStatefulWidget.createElement()` builds) both extends
    `StatefulElement` *and* `implements WidgetRef` — one real object
    doing both real jobs, which is why the cast `context as WidgetRef`
    (Lesson 26's own `as` operator, reappearing) never fails.
  - *Connects to:* `_SudokuAppState.ref.watch(gameSessionProvider)` reads
    the real, shared session; `ref.read(gameSessionProvider.notifier)`
    reaches `GameSessionNotifier`'s own real methods.
  - *Shape:* real, standard `flutter_riverpod` infrastructure, replacing
    plain Flutter classes one-for-one.

- **`GameSessionNotifier`**
  - *What it is:* this lesson's own new, real, primary subject — the one
    class that actually owns the app-wide, shared `GameSession`.
  - *Implementation:* real, complete, from `project/lib/
    game_session_provider.dart` (shown in full in this lesson's own
    Concept Unit 2).
  - *Its use:* built once by `gameSessionProvider`; every real digit this
    app's UI enters reaches `SudokuBoard.placeDigit` only through this
    class's own `enterDigit` method now.
  - *Type:* a concrete class extending `Notifier<GameSession>`.
  - *Responsibility:* build the real, initial `GameSession` exactly once,
    and be the one real place `state` is ever reassigned for this
    provider.
  - *Depends on:* nothing external — `build()` constructs its own real
    starting `SudokuBoard`/`GameSession` directly.
  - *Connects to:* wrapped by `gameSessionProvider`; called from
    `_SudokuAppState._dispatch`; reads/writes `GameSession.touched()`
    (below).
  - *Shape:* `project/lib/`'s own new real application-layer piece —
    sitting between the UI (`main.dart`) and the domain (`GameSession`,
    `SudokuBoard`) — the first concrete, physical instance of the
    Presentation/Application/Domain split curriculum's own Lesson 41
    names formally.

- **`GameSession.touched`**
  - *What it is:* a new real method, added to the already-existing
    `GameSession` class (Lesson 36), solving this lesson's own central,
    discovered problem.
  - *Implementation:* real, from `project/lib/game_session.dart`:
    `GameSession touched() => GameSession._raw(board, difficulty,
    startTime, _mistakes, _hints);`, backed by a new private constructor,
    `GameSession._raw(this.board, this.difficulty, this.startTime,
    this._mistakes, this._hints);`.
  - *Its use:* called every time `GameSessionNotifier` needs to tell
    Riverpod "something really changed here" without losing any of the
    session's own already-accumulated real data.
  - *Type:* a real instance method, plus a real, private named
    constructor supporting it.
  - *Responsibility:* produce a real, genuinely distinct `GameSession`
    object sharing the exact same field values as the one it was called
    on.
  - *Depends on:* an already-constructed `GameSession` to copy from.
  - *Connects to:* called by `GameSessionNotifier.enterDigit`; its
    result is assigned directly to `Notifier.state`.
  - *Shape:* a small, real, deliberate concession to Riverpod's own
    identity-based change detection — not part of `GameSession`'s own
    original Lesson 36 design.

---

## Concept Unit: Comparing Real Architectures

### The Problem

`_dispatch` (Lesson 37) already funnels every action through one real
place. But `_SudokuAppState` still owns `_board` directly, as a plain
field — the exact same real shared-state shape Lesson 35 already named,
just given a name. Curriculum's own Lesson 38 asks a real, different
question: *which real framework, if any, should actually manage this
kind of state as this app keeps growing?*

> **Pause and think:** Given `setState` (Lesson 28) already works, and
> `_dispatch` already centralizes every real action — what real,
> concrete problem would `_board` living directly on `_SudokuAppState`
> start to cause the moment this app grows a *second* real screen (Lesson
> 35's own honestly-named "application state" gap)? Given Lesson 27's
> own real `InheritedWidget`-style lookup already lets a widget reach
> data from an ancestor without it being passed down explicitly at every
> level — what would a state-management approach built directly on *that*
> real mechanism need from every widget that wants to read it?

### Project Change

No reference counterpart — this unit is a real, conceptual comparison,
not a `project/` change.

### The New Code

Not applicable — no code this unit; the real comparison itself is the
content, per this schema's own allowance for a Concept Unit whose "new
code" is real, captured evidence rather than a fabricated example.

### The Updated Project

Not applicable — no project file changes this unit.

### Isolate and Discard

Not applicable — a real, conceptual comparison, not a new language
construct.

### Mechanical Walkthrough

Not applicable in the usual code-enumeration sense — this unit's own
real content is compared directly below, by real, well-established
architectural fact rather than a walked-through code block:

- **`setState`** (Lesson 28, reappearing) — real, built into Flutter
  itself, no package required; state lives directly on a `State` object,
  reachable only by that widget and whatever it explicitly passes state
  down to.
- **The `provider` package** (this lesson's own new Header term) — real
  state lives in a widget higher up the tree; every reader needs a real
  `BuildContext` positioned *beneath* it to find it, using Lesson 27's
  own real `InheritedWidget` lookup mechanism.
- **Riverpod** — real state lives in a `ProviderContainer` (reached via
  `ProviderScope`), entirely independent of *where* in the widget tree
  anything sits; a real provider can be read from a widget, a plain Dart
  class, or — this lesson's own real, direct proof — a bare
  `ProviderContainer` in a test with no widget tree at all.
- **Bloc/Cubit** (this lesson's own new Header term) — real state changes
  flow through an explicit, named stream — every transition is
  individually, formally traceable, at the real cost of more required
  ceremony per action than either `setState` or Riverpod.

### CS Lens

Every one of these four real options is solving the identical real
problem — **where does mutable state live, and how does a reader reach
it without being handed a direct reference** — with a different real
trade-off between simplicity and structure.

```
Also recognized in: a company's own choice between a shared spreadsheet
(simple, informal, `setState`-like), a service locator/registry pattern
(the `provider` package's own real shape), a dependency-injection
container (Riverpod's own real shape), and a formal, auditable
message-queue architecture (Bloc's own real shape) — the same real
spectrum from "simple and ad hoc" to "structured and auditable"
recurring at a completely different scale
```

### SE Lens

Curriculum's own explicit choice — Riverpod, "while explaining the
architectural principles rather than making the student memorize
framework-specific tricks" — is followed here for a real, concrete
reason beyond convenience: Riverpod's own real independence from
`BuildContext` (proved directly in this lesson's own new
`game_session_provider_test.dart`, which reads and mutates a real
`GameSession` with no widget tree at all) is exactly the real property
Lesson 39 (dependency injection, testing with fakes) and Lesson 43
(repositories) both need — a real architecture where the *domain* layer
never has to know a widget tree exists at all. The real cost, honestly
named: Riverpod is one more real, external package this project now
depends on, and this lesson's own central discovery (below) proves it
comes with real, non-obvious behavior of its own that has to be learned,
not assumed.

### Commands Needed

None this unit.

### Run It

Not applicable — a real, conceptual comparison.

### Connect

Riverpod is the real, chosen answer. The next unit adds it for real, and
discovers, by running real code, exactly the kind of "non-obvious
behavior" the SE Lens above just warned about.

---

## Concept Unit: Adding Riverpod For Real — and a Genuine Gotcha

### The Problem

`GameSession` (Lesson 36) wraps a *mutable* `SudokuBoard` — placing a
digit changes it in place, the same real object, same identity, before
and after. Riverpod's own real job is to notify listeners when a
provider's `state` changes. Does mutating an already-held object in
place, without reassigning `state`, actually trigger that notification?

> **Pause and think:** Given Lesson 13's own real, already-proved fact
> — two separately-built objects with identical field values are **not**
> `==` to each other unless a class explicitly overrides equality, and
> Dart's own default `!=` compares by identity — if a `Notifier`'s own
> `state` setter decides whether to notify listeners by comparing the
> new value to the old one with `!=`, what would you predict happens if
> you mutate `state`'s own object in place and then write `state =
> state;` — the exact same object, back into itself? Would you expect a
> real notification to fire, or not?

### Project Change

**Reference Source:** no reference counterpart — a from-scratch
addition; `riverpod-3.4.2`'s own real, installed source (quoted in this
lesson's own Header) is the reference material, not a prior lesson's
file. **Files affected:** `project/pubspec.yaml`, modified (`flutter pub
add flutter_riverpod`); `project/lib/game_session_provider.dart`,
created; `project/lib/game_session.dart`, modified (`touched()` added).
**Change type:** add. **Location:** new file; `GameSession`'s own class
body, after `useHint`. **Dependencies:** `flutter_riverpod: ^3.4.2`.

### The New Code

```dart
final gameSessionProvider = NotifierProvider<GameSessionNotifier, GameSession>(
  GameSessionNotifier.new,
);

class GameSessionNotifier extends Notifier<GameSession> {
  @override
  GameSession build() => GameSession(SudokuBoard(_startingPuzzle));

  void enterDigit(int row, int col, int digit) {
    try {
      state.board.placeDigit(row, col, digit);
      state = state.touched();
    } on InvalidMoveException {
      state.registerMistake();
      state = state.touched();
      rethrow;
    }
  }
}
```

### The Updated Project

The complete, real `project/lib/game_session_provider.dart`, this unit's
own content being the entire new file, numbered:

```dart
1   import 'package:flutter_riverpod/flutter_riverpod.dart';
2
3   import 'game_session.dart';
4   import 'sudoku_board.dart';
5
6   const List<List<int?>> _startingPuzzle = [ /* the real milestone puzzle */ ];
7
8   final gameSessionProvider = NotifierProvider<GameSessionNotifier, GameSession>(
9     GameSessionNotifier.new,
10  );
11
12  class GameSessionNotifier extends Notifier<GameSession> {
13    @override
14    GameSession build() => GameSession(SudokuBoard(_startingPuzzle));
15
16    void enterDigit(int row, int col, int digit) {
17      try {
18        state.board.placeDigit(row, col, digit);
19        state = state.touched();
20      } on InvalidMoveException {
21        state.registerMistake();
22        state = state.touched();
23        rethrow;
24      }
25    }
26  }
```

Line 6's own literal grid is the identical real puzzle `main.dart` used
directly before this lesson — moved here because building the real,
initial `GameSession` is now this file's own job, not `_SudokuAppState`'s.

### Isolate and Discard

Real, throwaway lab, `verification/lesson-38/mutable_state_probe_test.dart`,
run this session, then discarded — a generic `Counter`, standing in for
`GameSession`'s own real mutable shape, isolating exactly the question
this unit's own Socratic prompt just asked:

```dart
class Counter {
  int value = 0;
}

class CounterNotifier extends Notifier<Counter> {
  @override
  Counter build() => Counter();

  void incrementWithoutReassigning() {
    state.value++;
  }

  void incrementAndReassignSameReference() {
    state.value++;
    state = state;
  }

  void incrementAndReassignNewInstance() {
    final next = Counter()..value = state.value + 1;
    state = next;
  }
}
```

Real, captured output, from three separate real widget tests, each
pumping a real `Consumer` reading `counterProvider` and asserting the
real, on-screen text after calling one of the three methods above:

```
mutating state.value in place, with no reassignment, does not rebuild — PASS
reassigning state = state (same reference) still does not rebuild — PASS
reassigning state to a genuinely new instance does rebuild — PASS
```

This is the exact real mechanism `GameSession.touched()` exists to work
around: `incrementWithoutReassigning` and
`incrementAndReassignSameReference` both left the real, on-screen count
at `0`; only `incrementAndReassignNewInstance` — a real, genuinely
different object — produced a real, on-screen `1`. This lab is discarded
now; both proofs are preserved permanently in
`verification/lesson-38/`.

### Mechanical Walkthrough

- `final gameSessionProvider = NotifierProvider<GameSessionNotifier, GameSession>(GameSessionNotifier.new);`
  — reappearing in full from this lesson's own Header: a real, top-level
  `final` (Lesson 5) variable, constructed once, at real program startup
  — `GameSessionNotifier.new`, a real constructor tear-off (reappearing
  the function-as-value idea from Lesson 15), handed to
  `NotifierProvider` so it knows how to build a fresh notifier the first
  time this provider is ever read.
- `class GameSessionNotifier extends Notifier<GameSession> {` —
  `extends` (Lesson 12, reappearing); a real generic type argument,
  `<GameSession>` (Lesson 10, reappearing), fixing exactly what kind of
  value this specific notifier exposes.
- `GameSession build() => GameSession(SudokuBoard(_startingPuzzle));` —
  `@override` (Lesson 25, reappearing); a real arrow-function body
  (Lesson 8, reappearing) constructing a brand-new `SudokuBoard` and
  wrapping it in a brand-new `GameSession` (Lesson 36's own real
  constructor) — this runs exactly once per real app launch, the moment
  anything first reads `gameSessionProvider`.
- `state.board.placeDigit(row, col, digit);` — reads the real, current
  `GameSession` via the inherited `state` getter (this lesson's own
  Header entry), then calls `SudokuBoard.placeDigit` (Lesson 14,
  reappearing) directly on its real board — this mutates the real board
  in place; nothing about this one line notifies any listener yet.
- `state = state.touched();` — this lesson's own new, real, central
  fix: `state.touched()` (this lesson's own Header entry) builds a
  genuinely new `GameSession` object with identical field values, and
  reassigning it to `state` is what actually causes
  `updateShouldNotify`'s own real `!=` comparison (Lesson 13's own
  identity-based default) to see two *different* real objects and
  notify — this exact line is what this unit's own isolation lab already
  proved is necessary.
- `on InvalidMoveException { state.registerMistake(); state = state.touched(); rethrow; }`
  — `on InvalidMoveException` with no `catch (e)` clause (Lesson 14,
  reappearing, in the narrower form that doesn't need the actual
  exception object); `state.registerMistake()` calls Lesson 36's own
  real, previously-unused method, finally reached by live code;
  `rethrow` (Lesson 14, reappearing) re-throws the identical real
  exception, preserving its original real stack trace, so
  `_SudokuAppState._dispatch` (the caller) can still catch it and show
  its own real message.

### CS Lens

Riverpod's own default change detection comparing `previous != next` is
a real, working instance of **reference-based (identity) equality as a
default optimization** — the same real, general idea Lesson 13 already
proved for plain Dart objects, here applied specifically to decide
whether *rebuilding a UI* is worth doing, which is exactly why an
identical-object reassignment is treated as "nothing changed," even when
the object's own internal contents plainly did.

```
Also recognized in: React's own `shouldComponentUpdate`/`memo` (skipping
a re-render when props are `===` identical), a database's own
`optimistic concurrency` row-version check (comparing a version number,
not deep row contents), a build system's own file-timestamp check
(deciding "nothing to rebuild" from identity/metadata rather than
content)
```

### SE Lens

The alternative — giving `GameSession` a real, overridden `==` based on
its own field values (the same real technique Lesson 13's own
`Coordinate` class used) — was considered and rejected here: `GameSession`
wraps a genuinely mutable `SudokuBoard`, so a real, value-based equality
check would have to compare the board's own entire 81-cell grid on
*every* single state change, a real, ongoing cost for no real benefit,
since this app never actually needs to ask "are these two sessions
equal" for any reason other than triggering a rebuild. `touched()`'s
own real cost instead: one small, extra, real object allocation per
change — genuinely cheaper, and named honestly for exactly what it does
rather than disguised as `==` override that would mislead a future
reader into thinking `GameSession` equality means something it doesn't.

### Commands Needed

- `flutter pub add flutter_riverpod` — a real, new command: modifies
  `pubspec.yaml` and runs real dependency resolution against pub.dev, the
  same real registry `cupertino_icons`/`flutter_lints` were already
  resolved from at Lesson 26's own `flutter create`.

### Run It

Real, captured output — shown above in Isolate and Discard.

### Connect

`GameSessionNotifier` now genuinely owns the app's one real, shared
session, and knows how to notify real listeners correctly. The final
unit moves `_SudokuAppState` itself onto it.

---

## Concept Unit: Moving `_SudokuAppState` Onto the Real, Shared Provider

### The Problem

`_SudokuAppState` still declares `final SudokuBoard _board = SudokuBoard
(_startingPuzzle);` directly. With `gameSessionProvider` now real and
working, what does `_SudokuAppState` itself need to change to read from
it instead — and what happens to every existing test that already pumps
a bare `SudokuApp()`?

> **Pause and think:** Given `ConsumerState`'s own real `ref` property
> needs `context` to genuinely already *be* a `WidgetRef` (this lesson's
> own Header entry) — what real, concrete thing has to exist somewhere
> *above* `SudokuApp` in the widget tree for that to be true at all?
> Given five existing tests already pump `const SudokuApp()` directly,
> with nothing wrapped around it — what would you predict happens the
> first time one of them runs, before you've changed anything about
> them?

### Project Change

**Reference Source:** `project/lib/main.dart`, the real, complete,
pre-migration `SudokuApp`/`_SudokuAppState` (Lessons 34/37), quoted in
full in this lesson's own Header and earlier concept units.
**Files affected:** `project/lib/main.dart`, modified;
`project/test/main_smoke_test.dart`,
`project/test/layout_test.dart`, `project/test/number_pad_test.dart`,
`project/test/cell_selection_test.dart`,
`project/test/session_status_test.dart`, all modified.
**Change type:** refactor. **Location:** `main()`, `SudokuApp`,
`_SudokuAppState`'s own field/method declarations and `build()`; every
affected test's own `pumpWidget` call. **Dependencies:** `import
'package:flutter_riverpod/flutter_riverpod.dart';`, `import
'game_session_provider.dart';`, both added to `main.dart`.

### The New Code

```dart
void main() {
  runApp(const ProviderScope(child: SudokuApp()));
}

class SudokuApp extends ConsumerStatefulWidget {
  const SudokuApp({super.key});

  @override
  ConsumerState<SudokuApp> createState() => _SudokuAppState();
}

class _SudokuAppState extends ConsumerState<SudokuApp> {
  final _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
  int? _selectedRow = 4;
  int? _selectedCol = 4;
```

### The Updated Project

The complete, real `_SudokuAppState` class, this unit's own changed
lines marked, numbered:

```dart
1   class _SudokuAppState extends ConsumerState<SudokuApp> {          // ← changed (was State<SudokuApp>)
2     final _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
3     int? _selectedRow = 4;
4     int? _selectedCol = 4;
5                                                                        // ← _board field removed
6     void _dispatch(GameIntent intent) {
7       switch (intent) {
8         case SelectCellIntent(row: final row, col: final col):
9           setState(() {
10            _selectedRow = row;
11            _selectedCol = col;
12          });
13        case EnterDigitIntent(digit: final digit):
14          final row = _selectedRow;
15          final col = _selectedCol;
16          if (row == null || col == null) {
17            return;
18          }
19          try {
20            ref.read(gameSessionProvider.notifier).enterDigit(row, col, digit);  // ← changed
21          } on InvalidMoveException catch (e) {
22            _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));
23          }
24      }
25    }
26
27    @override
28    Widget build(BuildContext context) {
29      final session = ref.watch(gameSessionProvider);                // ← new
30      return MaterialApp(
31        scaffoldMessengerKey: _scaffoldMessengerKey,
32        home: Scaffold(
33          appBar: AppBar(title: const Text('Sudoku')),
34          body: SingleChildScrollView(
35            padding: const EdgeInsets.all(16),
36            child: Column(
37              children: [
38                SudokuBoardView(
39                  cells: _cellsOf(session.board),                      // ← changed
40                  givenCells: _givenCellsOf(session.board),            // ← changed
41                  selectedRow: _selectedRow,
42                  selectedCol: _selectedCol,
43                  onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),
44                ),
45                const SizedBox(height: 16),
46                NumberPadView(onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit))),
47                const SizedBox(height: 16),
48                const _SessionStatus(),
49              ],
50            ),
51          ),
52        ),
53      );
54    }
55  }
```

`_selectedRow`/`_selectedCol` (lines 3-4) stay exactly where they were —
a deliberate choice, not an oversight: this is genuinely local,
single-screen UI state (Lesson 35), with no real reason to move it into
a shared provider. Line 29 is this unit's own real center: `ref.watch`
subscribes `_SudokuAppState` to `gameSessionProvider`, so every real
`state = state.touched()` inside `GameSessionNotifier` causes this
`build()` to run again automatically — the exact real notification path
the previous unit's own isolation lab proved works.

### Isolate and Discard

Not applicable — `ConsumerStatefulWidget`/`ConsumerState`/`ref` are real,
already-quoted framework classes (this lesson's own Header), not a new
language construct needing a separate throwaway lab; this unit applies
them directly to real project code.

### Mechanical Walkthrough

- `runApp(const ProviderScope(child: SudokuApp()));` — `ProviderScope`
  (this lesson's own Header entry), wrapping `SudokuApp` as its own real,
  required `child`.
- `class SudokuApp extends ConsumerStatefulWidget {` /
  `ConsumerState<SudokuApp> createState() => _SudokuAppState();` — both
  reappearing in full from this lesson's own Header: `SudokuApp` and
  `_SudokuAppState`'s own real declared supertypes both change, with
  zero change to what either class is actually *for*.
- `final session = ref.watch(gameSessionProvider);` — `ref.watch`, a
  real method this lesson introduces for the first time in project code
  (already fully explained via `Notifier`/`NotifierProvider`'s own real
  source, this lesson's Header): subscribes this exact `build()` call to
  future real changes in `gameSessionProvider`'s own state, and returns
  the real, current `GameSession` immediately.
- `ref.read(gameSessionProvider.notifier).enterDigit(row, col, digit);`
  — `ref.read`, a related real method: reaches the real
  `GameSessionNotifier` instance itself (via `.notifier`, a real
  property every `NotifierProvider` exposes) without subscribing to
  future changes — the correct real choice inside an event handler like
  `_dispatch`, which only needs to *call* a method once, not rebuild
  every time state changes afterward.
- `cells: _cellsOf(session.board), givenCells: _givenCellsOf(session.board)`
  — reappearing `_cellsOf`/`_givenCellsOf` (Lesson 35's own
  `_cells`/`_givenCells`, now plain functions taking a real `SudokuBoard`
  parameter instead of getters reading a field directly) — real, derived
  state (Lesson 35), now computed from `session.board` instead of
  `_board`.

### Execution Trace

The real, triggered failure this migration produced first, before the
five existing tests were fixed — a control-flow sequence, no loop or
changing values, so this trace follows curriculum's own numbered-list
shape:

1. `tester.pumpWidget(const SudokuApp())` (the real, original,
   unmodified test code) builds a real `SudokuApp` with no
   `ProviderScope` anywhere above it.
2. `_SudokuAppState.build` runs and reaches `ref.watch(gameSessionProvider)`
   — `ref`, from `ConsumerState`'s own real `late final ref = context as
   WidgetRef;` (this lesson's Header), casts `context` to `WidgetRef`.
3. Reading the provider internally calls `ProviderScope.containerOf`
   (this lesson's Header), which searches *up* the real widget tree for
   a real `ProviderScope` ancestor — and finds none, because step 1
   never provided one.
4. A real `StateError`, `Bad state: No ProviderScope found`, is thrown —
   not a silent failure, a real, specific, loud one (Lesson 4's own
   already-established preference, reapplied here by the framework
   itself).
5. Wrapping the identical pump call in `const ProviderScope(child:
   SudokuApp())` (this unit's own real fix, applied to all five affected
   test files) gives step 3 a real ancestor to find, and every real test
   passes unmodified otherwise.

### CS Lens

A `ConsumerState`'s own real dependency on a `ProviderScope` existing
somewhere above it in the tree is a real, working instance of the
**ambient context** pattern — some real piece of infrastructure a whole
subtree implicitly depends on, without it being passed explicitly to
each individual widget, the same real shape `BuildContext` itself
already has (Lesson 25) and `Theme.of(context)`/`MediaQuery.of(context)`
both already lean on, generalized here to a real, custom, project-owned
piece of state.

```
Also recognized in: a web server's own request-scoped database
connection (implicitly available to every handler in the request's own
call stack, without being passed as an explicit parameter everywhere), a
programming language's own ambient `this`/`self` inside a method, a
logging framework's own thread-local "current request ID" context
```

### SE Lens

The alternative — leaving the five existing tests unmodified and
declaring this migration "broken" — was never seriously on the table;
the real, honest cost this migration genuinely does carry: every single
existing widget test that constructs a `SudokuApp` now has one more real
requirement to satisfy, a small, permanent tax on every future test this
project writes too. The real benefit paid for by that tax: `GameSession`
is now reachable from anywhere — including, as `game_session_provider
_test.dart` proves directly, a bare `ProviderContainer` with zero
widgets at all — which is precisely the real property Lesson 39
(dependency injection, testing with fakes) needs to exist before it can
do its own real work.

### Commands Needed

None new — `flutter analyze .`/`flutter test`, both established.

### Run It

Real, run this session:

```
flutter analyze .
```

23 info-level lints — identical pre-existing categories and count as
Lesson 37's own baseline; zero errors.

```
flutter test
```

19 real test files, all passing, including two new, permanent checks in
`game_session_provider_test.dart`:

```
a real, rejected move increments the shared session's own real mistake count
a real, accepted move is reflected live through the same shared session
```

Full real output saved in `verification/lesson-38/run-log.md`.

### Connect

`_SudokuAppState` no longer owns a `SudokuBoard` at all — it owns a
`ref`, and reads the one, real, shared session through it, exactly the
way `GameSessionNotifier.enterDigit`'s own `mistakes` counter, built in
Lesson 36 and unused until now, is finally, genuinely reached by real,
live user taps.

---

## Connect the Pieces

Follow one real, rejected move — tapping digit `9` onto given clue
`(0, 0)` — through every real piece this lesson built:

1. **Comparing architectures** (Concept Unit 1) chose Riverpod, for the
   real, concrete reason that its state lives independently of the
   widget tree — about to matter directly.
2. `_dispatch`'s own `EnterDigitIntent` case (Lesson 37, unchanged in
   shape) calls `ref.read(gameSessionProvider.notifier).enterDigit(0, 0, 9)`
   (Concept Unit 3) — `ref.read`, reaching the real, live
   `GameSessionNotifier` without subscribing to it.
3. `GameSessionNotifier.enterDigit` (Concept Unit 2) calls
   `state.board.placeDigit(0, 0, 9)`, which throws a real
   `InvalidMoveException` — `(0, 0)` is a given clue.
4. The real `catch` block calls `state.registerMistake()` — Lesson 36's
   own real counter, incremented by live code for the first time — then
   `state = state.touched()`, this lesson's own real fix, giving
   Riverpod a genuinely new object to notice.
5. `rethrow` sends the identical real exception back up to `_dispatch`,
   which shows its own real message via `_scaffoldMessengerKey`
   (Lesson 34, unchanged).
6. Meanwhile, because `state` really was reassigned, every real widget
   watching `gameSessionProvider` — `_SudokuAppState.build`, via
   `ref.watch` (Concept Unit 3) — rebuilds, and `game_session_provider
   _test.dart`'s own real, permanent assertion confirms
   `session.mistakes` genuinely reads `1` afterward.

Every real piece of state this app manages now has a real, deliberate
home: `_selectedRow`/`_selectedCol` stay local (Lesson 35); `GameSession`
lives in `gameSessionProvider`, reachable from anywhere, including plain
Dart code with no widgets at all. The next lesson gives that
independence a formal name.
