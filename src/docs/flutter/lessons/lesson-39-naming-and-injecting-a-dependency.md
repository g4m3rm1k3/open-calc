# Lesson 39: Naming and Injecting a Dependency

**What you will build:** `project/lib/clock.dart` — a new, real,
minimal `Clock` interface and its one production implementation,
`SystemClock` — and a real refactor of `GameSession`/`GameSessionNotifier`
so neither ever calls `DateTime.now()` directly again; instead, both
receive a `Clock` from outside themselves. A real, app-wide
`clockProvider` (Riverpod, Lesson 38) supplies the real `SystemClock` in
production; a new, real, test-only `FakeClock` supplies a fully
controllable one in tests — proved by a real, permanent test that
advances time by an exact amount with zero real waiting. Getting
`clock.dart` right required a second real, honest discovery this
session: an early draft of that exact file accidentally depended on
Flutter, and running a plain-Dart test against it re-triggered Lesson
25's own already-documented `dart:ui` failure for a brand-new reason.

**What you need to know first:**
- Lesson 5 — `final`.
- Lesson 10 — the `??` null-coalescing operator, reused inside
  `GameSession`'s own real constructor.
- Lesson 11 — encapsulation, constructor shorthand.
- Lesson 12 — `implements`, abstract classes as interfaces — this
  lesson's own real interface, `Clock`, reuses that exact pattern for a
  new purpose.
- Lesson 13 — value objects and equality — reused conceptually to
  explain why a fake needs no overridden `==` of its own.
- Lesson 15 — anonymous functions, reused inside `Provider<Clock>`'s own
  real constructor call.
- Lesson 22 — the real, permanent `verification/lesson-NN/` convention,
  reused directly for this lesson's own two throwaway probes.
- Lesson 25 — the real, already-triggered `dart:ui` failure, reused
  directly this lesson for an entirely new, real reason.
- Lesson 36 — `GameSession`'s own original `{DateTime? startTime}`
  parameter — this lesson's own real point of comparison: a first,
  narrower form of dependency injection, built before the term existed
  in this curriculum.
- Lesson 38 — `Provider`, `NotifierProvider`, `ref.watch`, `ref.read`,
  `ProviderContainer`, `overrides` — all reappearing, now applied to a
  second, different kind of real dependency.

**Terms used in this lesson:**
- **Dependency** — new: anything a piece of code needs from *outside*
  itself to do its job, rather than being able to produce internally.
  It exists as a named concept because not every dependency is obvious —
  `GameSession.elapsed` (Lesson 36) depended on the real system clock
  the entire time, silently, via a direct `DateTime.now()` call, with no
  visible sign anywhere in its own constructor that this dependency
  existed at all.
- **Dependency injection** — new, hard concept: supplying a dependency
  to a piece of code from outside, at construction time, rather than
  letting that code reach out and obtain it itself. It exists to make a
  hidden dependency visible and swappable — Lesson 36's own
  `GameSession` already *had* to depend on "the current time" from the
  moment it was written; injection doesn't add that dependency, it just
  stops hiding it.
- **Fake** — new: a real, working, simplified stand-in implementing the
  exact same real interface as a production dependency, built
  specifically to be predictable and controllable in a test, rather than
  behaving like the real thing. It exists because some real dependencies
  (the actual system clock) are either slow, non-deterministic, or both
  — a fake sidesteps that entirely by simply reporting whatever it's
  told to.
- **Mock** — new: a related, but distinct, test double that goes one
  step further than a fake — it records *how* it was called (which
  methods, how many times, with what real arguments) so a test can
  assert on that history, not just on the resulting behavior. This
  lesson builds a **fake**, not a mock, because nothing about `Clock`'s
  own real, single method needs its call history verified — only its
  return value needs to be controllable.

**Objects and methods used:**

- **`Clock`**
  - *What it is:* this lesson's own new, real, minimal interface — one
    method, naming "the ability to report the current real moment" as
    its own, separate thing.
  - *Implementation:* real, complete, from `project/lib/clock.dart`:
    `abstract class Clock { DateTime now(); }`.
  - *Its use:* the real, common type `GameSession`, `SystemClock`, and
    `FakeClock` all agree on — `GameSession` never knows or cares which
    real implementation it was actually given.
  - *Type:* an abstract class with one unimplemented method (Lesson 12's
    own real interface shape, reappearing).
  - *Responsibility:* to be a real, minimal contract — nothing more than
    "can report a `DateTime`" — small enough that implementing it
    honestly (a fake) is trivial.
  - *Depends on:* nothing.
  - *Connects to:* implemented by `SystemClock` (production) and
    `FakeClock` (tests); depended on by `GameSession`'s own real
    constructor.
  - *Shape:* `project/lib/`'s own smallest real file — deliberately kept
    free of any Flutter or Riverpod dependency (this lesson's own real,
    honest discovery, below, is exactly why that matters).

- **`SystemClock`**
  - *What it is:* the one, real, production implementation of `Clock`.
  - *Implementation:* real, complete: `class SystemClock implements
    Clock { @override DateTime now() => DateTime.now(); }`.
  - *Its use:* the real value `clockProvider` (below) hands out in
    production — behavior is completely unchanged from the direct
    `DateTime.now()` calls `GameSession` made before this lesson; only
    *where* that call happens has moved.
  - *Type:* a concrete class implementing `Clock`.
  - *Responsibility:* forward `.now()` to the real, actual system clock,
    with zero real logic of its own.
  - *Depends on:* the real system clock (`DateTime.now()`'s own real
    source, Lesson 36).
  - *Connects to:* constructed once, inside `clockProvider`.
  - *Shape:* a small, real, production-only implementation.

- **`clockProvider`**
  - *What it is:* a real Riverpod provider (Lesson 38's own
    `Provider<ValueT>`, not `NotifierProvider`) exposing a `Clock`.
  - *Implementation:* real, verbatim, from
    `riverpod-3.4.2/lib/src/providers/provider.dart`, line 17: `final
    class Provider<ValueT> extends $FunctionalProvider<ValueT, ValueT,
    ValueT>`, constructed as `Provider(this._create, {...})` where
    `_create` is a real function, `ValueT Function(Ref ref)`; this
    project's own real usage: `final clockProvider = Provider<Clock>((ref)
    => SystemClock());`.
  - *Its use:* `GameSessionNotifier.build` reads it via `ref.watch
    (clockProvider)` instead of ever constructing a `SystemClock`
    directly — the real, single seam this lesson's own tests override.
  - *Type:* a concrete, generic class, distinct from Lesson 38's own
    `NotifierProvider`.
  - *Responsibility:* build a `Clock` exactly once (the real value never
    changes on its own afterward, unlike `gameSessionProvider`'s own
    `GameSession`), and hand out that same real instance to every real
    reader.
  - *Depends on:* nothing to construct in production (`SystemClock()`
    takes no arguments); a real `Override` value, in a test, to replace
    it.
  - *Connects to:* read by `GameSessionNotifier.build`; overridden by
    `game_session_provider_test.dart`'s own new real test via
    `clockProvider.overrideWithValue(fakeClock)`.
  - *Shape:* real, standard Riverpod application-layer wiring — sits
    beside `gameSessionProvider`, in the one file already allowed to
    depend on Riverpod.

- **`FakeClock`**
  - *What it is:* this lesson's own new, real, test-only class — a
    genuine **fake** (this lesson's own Header term), not shipped as
    part of `project/lib/` at all.
  - *Implementation:* real, complete, duplicated (deliberately, not
    shared) in both `project/test/game_session_test.dart` and
    `project/test/game_session_provider_test.dart`:
    ```dart
    class FakeClock implements Clock {
      FakeClock(this._now);
      DateTime _now;

      @override
      DateTime now() => _now;

      void advance(Duration by) {
        _now = _now.add(by);
      }
    }
    ```
  - *Its use:* built with one, real, fixed starting `DateTime`; `.now()`
    always reports exactly that value until `.advance()` is called,
    letting a test move time forward by an exact real amount with zero
    real waiting.
  - *Type:* a concrete class implementing `Clock`.
  - *Responsibility:* behave exactly like `Clock`'s own real contract
    requires, while being completely controllable by the test that
    constructs it.
  - *Depends on:* nothing beyond its own starting `DateTime`.
  - *Connects to:* passed directly to `GameSession`'s own constructor in
    `game_session_test.dart`; passed via `clockProvider
    .overrideWithValue(...)` in `game_session_provider_test.dart`.
  - *Shape:* a small, real, test-only double — the concrete reason
    `Clock` exists as its own interface at all.

---

## Concept Unit: A Dependency Named as an Interface — `Clock`

### The Problem

`GameSession.elapsed` (Lesson 36) calls `DateTime.now()` directly, deep
inside a getter. `game_session_test.dart`'s own original test for this
(Lesson 36) had to work around that by injecting a *value*
(`startTime`), not the *ability to tell time* itself — which meant
`elapsed` itself still secretly called the real, live system clock every
time it was read. What would it take to make "the current time" a real,
visible, swappable dependency, not a hidden one?

> **Pause and think:** Given Lesson 12's own real `Describable` interface
> already proved one abstract method can be implemented by more than one
> unrelated real class — what would the smallest possible real interface
> naming "the ability to report the current moment" actually need to
> declare? Given `GameSession`'s own constructor already takes real
> arguments (`board`, and optionally `startTime`) — what real, minimal
> change would let it receive *this* dependency the same explicit way,
> instead of reaching for a global function by name?

### Project Change

**Reference Source:** no reference counterpart — a from-scratch
addition. **Files affected:** `project/lib/clock.dart`, created;
`project/lib/game_session.dart`, modified. **Change type:** add;
refactor. **Location:** new file; `GameSession`'s own constructor and
`elapsed` getter. **Dependencies:** none for `clock.dart` itself —
deliberately.

### The New Code

```dart
abstract class Clock {
  DateTime now();
}

class SystemClock implements Clock {
  @override
  DateTime now() => DateTime.now();
}
```

### The Updated Project

The complete, real `GameSession` constructor and `elapsed` getter, this
unit's own changed lines marked, numbered:

```dart
1   GameSession(this.board, this._clock, {DateTime? startTime})   // ← changed (added this._clock)
2       : difficulty = board.classifyDifficulty(),
3         startTime = startTime ?? _clock.now();                    // ← changed (was DateTime.now())
4
5   final SudokuBoard board;
6   final Clock _clock;                                              // ← new
7   final String difficulty;
8   final DateTime startTime;
9
10  // ...
11
12  Duration get elapsed => _clock.now().difference(startTime);      // ← changed (was DateTime.now())
```

`GameSession` no longer contains a single direct call to `DateTime.now()`
anywhere — every real place it needs "the current moment" now asks
`_clock` instead, a real field it was handed at construction rather than
a global function it reached for itself.

### Isolate and Discard

Not applicable — `abstract class`/`implements` (Lesson 12) are already
fully lab'd; this unit's own real newness is architectural (naming a
hidden dependency explicitly), not a new language construct.

### An honest, real discovery: this file almost depended on Flutter

The very first real draft of `clock.dart` declared `clockProvider`
directly in this same file — which meant adding `import
'package:flutter_riverpod/flutter_riverpod.dart';` right here, next to
`Clock` itself. Running `game_session_test.dart` (the real, pure-Dart
test file, invoked with plain `dart run`) against that draft re-triggered
Lesson 25's own already-documented real failure:

```
/C:/flutter/packages/flutter/lib/src/foundation/binding.dart:19:8: Error: Dart library 'dart:ui' is not available on this platform.
Context: The unavailable library 'dart:ui' is imported through these packages:
    ../lib/clock.dart => package:flutter_riverpod => package:flutter => dart:ui
```

The real, honest cause: `flutter_riverpod` itself transitively imports
Flutter, and `game_session_test.dart` is a genuinely plain-Dart file,
run with plain `dart run`, exactly the way `sudoku_board_test.dart` has
been since Lesson 22. The real fix, applied before finalizing the code
shown above: `clockProvider` moved out of `clock.dart` entirely, into
`game_session_provider.dart` (the one file already committed to
depending on Riverpod) — leaving `Clock`/`SystemClock` genuinely free of
any framework dependency at all.

### Mechanical Walkthrough

- `abstract class Clock { DateTime now(); }` — `abstract class`
  (Lesson 12, reappearing) with one real, unimplemented instance method
  — the identical real shape as Lesson 12's own `Describable` interface,
  applied here to a completely different real problem: not modeling a
  domain concept, but naming a swappable dependency.
- `class SystemClock implements Clock { @override DateTime now() =>
  DateTime.now(); }` — `implements` (Lesson 12, reappearing); `@override`
  (Lesson 25, reappearing); the real method body is a single, direct
  real call to `DateTime.now()` (Lesson 36, reappearing) — the exact
  same real call that used to live inside `GameSession` itself, moved
  here, and only here.
- `GameSession(this.board, this._clock, {DateTime? startTime})` —
  `this._clock` is real constructor-shorthand syntax (Lesson 11,
  reappearing), assigning the second real positional argument directly
  to a new, real, private field.
- `final Clock _clock;` — a real, private (Lesson 11, reappearing),
  `final` (Lesson 5, reappearing) field, typed as the real *interface*,
  `Clock`, not as `SystemClock` specifically — this is what actually
  makes injection possible: `GameSession` only ever promises to work
  with *anything* that satisfies `Clock`'s own real contract, never
  naming a specific real implementation anywhere in its own code.
- `startTime = startTime ?? _clock.now();` / `Duration get elapsed =>
  _clock.now().difference(startTime);` — both reappearing in full,
  `??`/`.difference` (Lesson 10/36) unchanged in shape; the only real
  difference from Lesson 36's own original code is which real object
  `.now()` is called on — `_clock`, not the global `DateTime` class
  directly.

### CS Lens

Typing `_clock` as the real, abstract `Clock` interface rather than the
concrete `SystemClock` class is a real, working instance of
**programming to an interface, not an implementation** — a real,
general software design principle, here made concretely necessary
because `GameSession`'s own real code has to compile and run correctly
against *either* `SystemClock` or `FakeClock`, interchangeably, with
zero changes to `GameSession` itself.

```
Also recognized in: a car's own real ignition system accepting any real
key cut to the correct real shape, regardless of manufacturer; a power
outlet accepting any real plug meeting the real, standard socket shape;
a shipping container's own standardized real dimensions, letting any
real ship, train, or truck built to that same real standard move it
```

### SE Lens

The alternative — leaving `DateTime.now()` calls directly inside
`GameSession`, the way Lesson 36 originally wrote them — genuinely
worked, and this lesson's own real, honest discovery (the accidental
Flutter dependency) proves the fix isn't free: even the *interface*
naming this dependency needs real, careful attention to what it itself
depends on. The real cost of the original approach: Lesson 36's own
`_testElapsedIsLiveDerivedState` had to compute a real `DateTime
.now().subtract(...)` value at the *test's own* call site just to get a
predictable-enough real starting point — a real, working, but slightly
awkward pattern, now replaced by a genuinely controllable fake.

### Commands Needed

None new this unit.

### Run It

Real, run this session — the triggered `dart:ui` failure and its fix are
shown above; the corrected file's own real test run is shown in this
lesson's own final unit (all three concept units share one real,
batched verification pass).

### Connect

`Clock` now exists as a real, minimal, swappable dependency. The next
unit gives production code a real, single place to obtain one.

---

## Concept Unit: Injecting It — Two Real Ways, Compared

### The Problem

`GameSessionNotifier.build` (Lesson 38) needs to construct the real,
initial `GameSession` — which now requires a real `Clock` argument.
Lesson 36 already showed one real way to inject a dependency (a
constructor parameter, `{DateTime? startTime}`); Lesson 38 already built
a second real mechanism entirely (a Riverpod provider). Which should
supply the real `Clock` here?

> **Pause and think:** Given `GameSessionNotifier.build` already has
> access to `ref` (Lesson 38's own real `AnyNotifier.ref`) — what would
> `ref.watch(clockProvider)` actually return, and how is that different
> from `GameSession`'s own constructor simply defaulting `_clock` to `
> SystemClock()` internally if nothing were passed? Given Lesson 38's
> own real discovery (identity-based change detection) — does a `Clock`
> dependency need `ref.watch` (subscribing to future changes) the same
> way `gameSessionProvider` itself does, or would `ref.read` be more
> honest about what this dependency actually is?

### Project Change

**Reference Source:** `project/lib/game_session_provider.dart`, the
real, existing `GameSessionNotifier.build` (Lesson 38), read fresh this
session. **Files affected:** `project/lib/game_session_provider.dart`,
modified. **Change type:** add; modify. **Location:** top of the file
(new `clockProvider`); `GameSessionNotifier.build`'s own real body.
**Dependencies:** `import 'clock.dart';`, added.

### The New Code

```dart
final clockProvider = Provider<Clock>((ref) => SystemClock());
```

### The Updated Project

The complete, real `GameSessionNotifier.build`, this unit's own changed
line marked:

```dart
1  class GameSessionNotifier extends Notifier<GameSession> {
2    @override
3    GameSession build() => GameSession(SudokuBoard(_startingPuzzle), ref.watch(clockProvider));  // ← changed
4
5    void enterDigit(int row, int col, int digit) {
6      // ...unchanged from Lesson 38...
7    }
8  }
```

### Isolate and Discard

Not applicable — `Provider<ValueT>` is already fully explained via
real, quoted source in this lesson's own Header; this unit applies it
directly, no new construct to isolate.

### Mechanical Walkthrough

- `final clockProvider = Provider<Clock>((ref) => SystemClock());` —
  `Provider<Clock>` (this lesson's own Header entry): a real generic
  type argument fixing exactly what this provider exposes; `(ref) =>
  SystemClock()` is a real anonymous function (Lesson 15, reappearing)
  — Riverpod calls this exactly once, the first time anything reads
  `clockProvider`, and reuses that same real `SystemClock` instance for
  every reader afterward, unless a test overrides it.
- `ref.watch(clockProvider)` — reappearing `ref.watch` (Lesson 38) used
  here for a genuinely different real reason than
  `_SudokuAppState.build`'s own use of it: `GameSessionNotifier.build`
  only runs *once* per real app launch anyway, so whether this
  particular call would "watch for future changes" barely matters in
  practice — it's used here for real, honest consistency (Riverpod's own
  own convention: reading one provider from inside another always goes
  through `ref`, watch by default, unless there's a specific reason to
  prefer `ref.read`), not because `Clock` itself is expected to change.

### CS Lens

`GameSession`'s own constructor parameter (Lesson 36's `{DateTime?
startTime}`) and Riverpod's own `clockProvider` are both real, working
instances of **dependency injection** — the same real principle, at two
different real scales: constructor injection hands a dependency to one
specific object, directly, by whoever constructs it; a Riverpod provider
hands the identical real dependency to *anything*, anywhere in the app,
that asks — the real difference is reach, not the underlying idea.

```
Also recognized in: a function argument (the narrowest, most local form
of injection there is), a config file read once at program startup and
passed down through a whole call chain, an operating system's own
environment variables (injected into every process that runs, without
any of them needing to know or care where the values actually came
from)
```

### SE Lens

The alternative — having `GameSession` default `_clock` to `SystemClock()`
internally whenever none is passed (`Clock? clock` instead of a required
`Clock _clock`) — was rejected here specifically: a real, optional,
silently-defaulted dependency can still be forgotten in a test, quietly
falling back to the real system clock and reintroducing exactly the
non-determinism this whole lesson exists to remove. Making `_clock` a
real, required, unnamed positional parameter instead means every real
call site — including every existing test — has to make an active,
visible choice about which `Clock` it wants, which is precisely why
`game_session_test.dart`'s own three unrelated tests all had to be
touched this lesson, each one now explicit about using a real
`SystemClock()` or a real `FakeClock`.

### Commands Needed

None new this unit.

### Run It

Not applicable as a separate execution — verified together with Concept
Unit 3's own real, final run.

### Connect

Every real reader of `Clock` now gets it from one of two deliberate,
real places — a constructor argument, or `clockProvider`. The final
unit proves both are genuinely swappable in a real test.

---

## Concept Unit: Testing With a Fake — `FakeClock`

### The Problem

`game_session_test.dart`'s own original elapsed-time test (Lesson 36)
worked, but by computing a real `DateTime.now().subtract(...)` value at
the test's own call site — real wall-clock arithmetic, just to get a
predictable starting point. With `Clock` now a real, injectable
interface, is there a cleaner, more controllable way to prove the exact
same real claim?

> **Pause and think:** Given `Clock` declares exactly one real method,
> `DateTime now();` — what would the smallest possible real class
> satisfying that contract, built purely for a test, actually need to
> do? Given this lesson's own new **fake**/**mock** distinction — does a
> test proving `GameSession.elapsed` computes a correct real span
> actually need to know *how many times* `.now()` was called, or only
> *what it returns*?

### Project Change

**Reference Source:** no reference counterpart — a from-scratch
addition. **Files affected:** `project/test/game_session_test.dart`,
modified; `project/test/game_session_provider_test.dart`, modified.
**Change type:** add; refactor. **Location:** top of each file (new
`FakeClock` class); each file's own real test bodies that construct a
`GameSession` or override `clockProvider`. **Dependencies:** `import
'../lib/clock.dart';`, added to `game_session_test.dart`; `import
'package:open_calc_sudoku/clock.dart';`, added to
`game_session_provider_test.dart`.

### The New Code

```dart
class FakeClock implements Clock {
  FakeClock(this._now);
  DateTime _now;

  @override
  DateTime now() => _now;

  void advance(Duration by) {
    _now = _now.add(by);
  }
}
```

### The Updated Project

The complete, real, rewritten elapsed-time test, this unit's own changed
lines marked, numbered:

```dart
1  void _testElapsedIsLiveDerivedState() {
2    final fakeClock = FakeClock(DateTime(2026, 1, 1, 12, 0, 0));          // ← changed (was a real DateTime.now() computation)
3    final session = GameSession(SudokuBoard(_milestonePuzzle), fakeClock); // ← changed
4    expectEqual(session.elapsed, Duration.zero, 'elapsed is exactly zero at the instant a session starts');  // ← new
5
6    fakeClock.advance(const Duration(seconds: 5));                        // ← new
7    expectEqual(
8        session.elapsed,
9        const Duration(seconds: 5),
10       'elapsed reflects the injected clock, live, with no real wall-clock '
11       'delay needed to prove it');
12 }
```

And the real, new, widget-level proof in `game_session_provider_test.dart`:

```dart
1  testWidgets('overriding clockProvider with a real fake gives deterministic elapsed time', (
2    WidgetTester tester,
3  ) async {
4    final fakeClock = FakeClock(DateTime(2026, 1, 1, 12, 0, 0));
5    final container = ProviderContainer(overrides: [clockProvider.overrideWithValue(fakeClock)]);  // ← new
6    addTearDown(container.dispose);
7
8    await tester.pumpWidget(UncontrolledProviderScope(container: container, child: const SudokuApp()));
9
10   expect(container.read(gameSessionProvider).elapsed, Duration.zero);
11
12   fakeClock.advance(const Duration(minutes: 3));
13
14   expect(
15     container.read(gameSessionProvider).elapsed,
16     const Duration(minutes: 3),
17     reason: 'the real, shared session reads the same overridden fake clock everywhere',
18   );
19 });
```

### Isolate and Discard

Not applicable — `implements Clock` reuses fully-lab'd interface syntax;
the real newness here (a controllable test double, and Riverpod's own
`overrides`) is proved directly against real project code below, which
already is the smallest real, meaningful demonstration.

### Mechanical Walkthrough

- `class FakeClock implements Clock { FakeClock(this._now); DateTime
  _now; @override DateTime now() => _now; }` — `implements`
  (reappearing); a real, private, *mutable* field, `_now` (not `final`
  — deliberately, unlike almost every other field this curriculum has
  built, because this one real field's whole purpose is to change on
  command); `.now()` always returns whatever `_now` currently holds.
- `void advance(Duration by) { _now = _now.add(by); }` — a real, public
  method; `.add` (a real `DateTime` instance method, reappearing the
  general shape from `.difference`, Lesson 36) computes a new real
  moment offset forward by `by`, reassigned back into `_now`.
- `final fakeClock = FakeClock(DateTime(2026, 1, 1, 12, 0, 0));` — a
  real, literal `DateTime` constructor call (Lesson 36's own class,
  reappearing, this time with explicit year/month/day/hour/minute/second
  arguments rather than `.now()`) — completely arbitrary, and completely
  irrelevant to the test's own real point, which is only ever about the
  real *difference* `advance` produces.
- `ProviderContainer(overrides: [clockProvider.overrideWithValue(fakeClock)])`
  — `ProviderContainer` (Lesson 38, reappearing); `overrides`, a real,
  named constructor parameter taking a real `List` of `Override` values;
  `clockProvider.overrideWithValue(fakeClock)` (this lesson's own Header
  entry) — tells this one, specific real container "whenever anything
  reads `clockProvider`, hand back this exact real `fakeClock` instead
  of ever constructing a `SystemClock`."
- `UncontrolledProviderScope(container: container, child: const SudokuApp())`
  — reappearing from Lesson 38's own run-log, given full treatment here:
  a real, alternate `ProviderScope`-like widget that takes an
  already-built `ProviderContainer` directly, instead of creating its own
  internally — the real, necessary mechanism for a test to keep its own
  handle on the exact container the widget tree is using, so it can
  `container.read(...)` and assert on real state from outside the tree.
- `fakeClock.advance(const Duration(minutes: 3));` — called directly
  from the test, entirely outside any widget or provider machinery —
  real, direct proof that `FakeClock` is a plain, ordinary real object,
  not something Riverpod has any special awareness of.

### CS Lens

`FakeClock` is a real, minimal instance of the **test double** family —
specifically a **fake** (this lesson's own Header term, distinguished
from a **mock**): it behaves correctly according to `Clock`'s own real
contract, fully controllably, with no built-in memory of how or how
often it was called, because nothing about this lesson's own real
claims (`elapsed` computes a correct difference) needs that history —
only the real return value matters here.

```
Also recognized in: a flight simulator standing in for a real aircraft
during pilot training, a crash-test dummy standing in for a real human
body, a stunt double standing in for a real actor — each one built to
behave correctly for a specific, narrow real purpose, never as a
complete, faithful replica of the real thing
```

### SE Lens

The alternative — testing `elapsed` only against the real system clock,
the way Lesson 36's own original test did — genuinely worked, but every
such test either has to tolerate a small real margin of error (real
wall-clock time keeps moving while the test runs) or introduce a real,
deliberate `sleep`, slowing the whole suite down for no real benefit.
The real cost of `FakeClock` instead: two small, near-identical class
definitions, deliberately duplicated rather than shared across a
pure-Dart file and a Flutter-dependent one — a real, small, accepted
cost, paid twice, in exchange for tests that are both faster and
genuinely exact (`Duration.zero`, `const Duration(seconds: 5)` — real,
precise values, not "close enough").

### Commands Needed

None new — `dart run`/`flutter test`, both established.

### Run It

Real, run this session:

```
dart run test/game_session_test.dart
```

12 real checks, 0 failed (full output in
`verification/lesson-39/run-log.md`), including this unit's own two new
lines:

```
PASS: elapsed is exactly zero at the instant a session starts
PASS: elapsed reflects the injected clock, live, with no real wall-clock delay needed to prove it
```

```
flutter test test/game_session_provider_test.dart
```

```
overriding clockProvider with a real fake gives deterministic elapsed time — PASS
a real, rejected move increments the shared session's own real mistake count — PASS
a real, accepted move is reflected live through the same shared session — PASS
```

`flutter analyze .`/`flutter test` (whole project): 24 info-level lints
(the same pre-existing categories, plus one new relative-import line in
`game_session_test.dart`); zero errors; 20 real test files, all passing.

### Connect

`Clock` is now genuinely swappable at every real layer this app has:
directly, via a constructor argument, and app-wide, via
`clockProvider.overrideWithValue`. Every real dependency this codebase
has is either already this explicit, or — Lesson 40's own real subject —
about to become explicit for a different, structural reason.

---

## Connect the Pieces

Follow "the current time" — a genuinely hidden dependency until this
lesson — through every unit built here:

1. **Naming it** (Concept Unit 1): `GameSession` used to call
   `DateTime.now()` directly, an invisible dependency; `Clock` gives it
   a real, minimal, visible name — and building `clock.dart` correctly
   required a real, honest fix after it accidentally depended on
   Flutter through Riverpod.
2. **Injecting it** (Concept Unit 2): production code obtains a real
   `Clock` from exactly one place, `clockProvider`, itself built on
   Lesson 38's own `Provider` — the same real dependency-injection idea
   Lesson 36's own `{DateTime? startTime}` parameter already used at a
   smaller scale, now generalized.
3. **Faking it** (Concept Unit 3): `FakeClock` satisfies the identical
   real `Clock` contract while being fully controllable — proved twice,
   once via plain constructor injection (`game_session_test.dart`) and
   once via a real Riverpod override (`game_session_provider_test.dart`),
   both reaching the exact same real `GameSession.elapsed` code with
   zero changes to `GameSession` itself.

Every real dependency this app has is now either already explicit, like
`Clock`, or a plain, direct field, like `SudokuBoard`. The next lesson
gives this same app a different kind of explicitness: naming, formally,
every real state a game session can actually be in.
