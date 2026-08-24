# Lesson 43: Naming Where Data Actually Comes From

**Repositories**

## What you will build

`GameSessionNotifier.build()` (`project/lib/game_session_provider.dart`)
has, since Lesson 38, read a hardcoded `List<List<int?>>` constant
sitting directly in that same file to build every fresh session's board.
This lesson gives that data source its own real name and its own real
seam: a new `PuzzleRepository` interface, one real implementation
(`InMemoryPuzzleRepository`, returning the exact same real puzzle,
unchanged), and a real provider wiring it in — the identical real shape
`Clock`/`SystemClock`/`clockProvider` already established in Lesson 39.
The transferable problem: curriculum.md's own Lesson 43 bullet asks why
an application shouldn't know whether its data comes from SQLite,
Firebase, a REST API, local files, or memory. This app has no database
yet — Phase 6's job — so this lesson answers that question with the one
real, current data source this app actually has, proving the same real
architectural seam pays off even with only one real implementation
behind it.

## What you need to know first

- Lesson 39 ("Naming and Injecting a Dependency") — `Clock`,
  `SystemClock`, `clockProvider` — the exact real pattern this lesson
  applies a second time, to a different real dependency.
- Lesson 38 ("Choosing Who Actually Owns the State") — `GameSessionNotifier
  .build()`, `Provider`, `ProviderContainer`, `overrideWithValue`, all
  reused again in this lesson's own real test.
- Lesson 41 ("Naming the Boundaries Already There") — Application vs.
  Infrastructure layers; this lesson's own new `InMemoryPuzzleRepository`
  is the second real occupant the Infrastructure layer has ever had.
- Lesson 12 ("Building on What Already Exists") — `abstract class`,
  `implements` — the real shape `PuzzleRepository`/
  `InMemoryPuzzleRepository` reuses.

## Terms used in this lesson

- **Repository (pattern)** — a real design pattern naming one, specific
  seam: an abstraction the rest of the app depends on for "get me this
  kind of data," with the actual real source (a hardcoded constant, a
  file, a database) hidden behind it. Exists so the rest of the app's
  own code never has to change when *where* the data comes from changes
  — only the one real class behind the seam does.
- **Interface (reappearing, Lesson 12)** — a real contract naming what a
  class can do without saying how. `PuzzleRepository`, this lesson's own
  real example, is Dart's own `abstract class` shape (Lesson 12,
  reappearing) used this way, the identical real shape `Clock` already
  used in Lesson 39.
- **Dependency injection (reappearing, Lesson 39)** — supplying a real
  object the code that needs it, from the outside, rather than that code
  constructing its own dependency directly. `GameSessionNotifier.build()`
  reads its `PuzzleRepository` from `ref.watch(puzzleRepositoryProvider)`
  rather than ever writing `InMemoryPuzzleRepository()` itself.
- **`ProviderContainer` (reappearing, Lesson 38)** — Riverpod's own real,
  standalone holder of every provider's current real state, usable with
  zero widgets involved at all.
- **`overrideWithValue` (reappearing, Lesson 39)** — a real
  `ProviderContainer` constructor argument replacing one specific
  provider's real value for the lifetime of that one container, without
  touching the provider's own declaration.
- **`UncontrolledProviderScope` (reappearing, Lesson 38)** — a real
  Flutter widget handing an already-built `ProviderContainer` to a
  widget tree, instead of `ProviderScope`'s own default behavior of
  building a fresh container itself.

## Objects and methods used

- **`PuzzleRepository`**
  - *What it is:* a new, real interface naming "the ability to supply a
    starting Sudoku puzzle."
  - *Implementation:* `abstract class PuzzleRepository { List<List<int?>>
    startingPuzzle(); }` (`project/lib/puzzle_repository.dart`, new
    file).
  - *Its use:* the real seam `GameSessionNotifier.build()` now depends
    on, instead of a hardcoded constant.
  - *Type:* an `abstract class` with one real, unimplemented instance
    method.
  - *Responsibility:* define the contract "give me a starting puzzle,
    however you get it" — nothing about *which* real source that puzzle
    actually comes from.
  - *Depends on:* nothing — no import at all in `puzzle_repository.dart`.
  - *Connects to:* implemented by `InMemoryPuzzleRepository` (real) and,
    in this lesson's own test, by `_FakePuzzleRepository`; read by
    `GameSessionNotifier` through its own constructor-free provider
    read, never constructed by `GameSessionNotifier` itself.
  - *Shape:* the real seam between the Application layer (which only
    ever sees `PuzzleRepository`) and the Infrastructure layer (which is
    the only place a concrete implementation exists) — the exact same
    real shape `Clock` already gave the Domain layer in Lesson 39,
    applied here one layer over, since `GameSessionNotifier` itself, not
    `GameSession`, is the real reader.

- **`InMemoryPuzzleRepository`**
  - *What it is:* the one, real, current implementation of
    `PuzzleRepository` — returns this project's own real, hardcoded
    Phase 1 puzzle, moved here from `game_session_provider.dart`.
  - *Implementation:* `class InMemoryPuzzleRepository implements
    PuzzleRepository { @override List<List<int?>> startingPuzzle() =>
    _startingPuzzle; }` (`project/lib/puzzle_repository.dart`).
  - *Its use:* the real, concrete answer `puzzleRepositoryProvider`
    (below) supplies in production.
  - *Type:* a concrete class, real `implements PuzzleRepository`.
  - *Responsibility:* answer `startingPuzzle()` by returning this
    project's own real, fixed literal grid — no randomness, no I/O, no
    real external resource touched at all, unlike `SystemClock`'s own
    real OS call.
  - *Depends on:* the real, private `_startingPuzzle` constant declared
    in the same file.
  - *Connects to:* constructed exactly once, inside
    `puzzleRepositoryProvider`; called by `GameSessionNotifier.build()`
    indirectly, through the `PuzzleRepository` interface.
  - *Shape:* the real, current, single occupant of this seam's own
    Infrastructure side — genuinely temporary, per its own real doc
    comment, since it holds no actual outside data yet.

- **`puzzleRepositoryProvider`**
  - *What it is:* the one real, app-wide place a `PuzzleRepository` is
    actually obtained from.
  - *Implementation:* `final puzzleRepositoryProvider =
    Provider<PuzzleRepository>((ref) => InMemoryPuzzleRepository());`
    (`project/lib/game_session_provider.dart`) — the identical real
    shape as `clockProvider`, one line above it in the same real file.
  - *Its use:* the real place `GameSessionNotifier.build()` now reads
    from, instead of referencing `_startingPuzzle` directly.
  - *Type:* a top-level, real, immutable value of Riverpod's own
    `Provider<PuzzleRepository>` type.
  - *Responsibility:* answer "give me the current real
    `PuzzleRepository`" exactly once per real `ProviderContainer`,
    handing back the same real `InMemoryPuzzleRepository` instance every
    time, unless a test overrides it.
  - *Depends on:* `InMemoryPuzzleRepository`'s own real, zero-argument
    constructor.
  - *Connects to:* read by `GameSessionNotifier.build()`; overridden in
    this lesson's own real test via
    `puzzleRepositoryProvider.overrideWithValue(...)`.
  - *Shape:* the real, concrete dependency-injection seam for this
    lesson's own new dependency — Application-layer wiring, same real
    shape as `clockProvider`.

- **`GameSessionNotifier.build()` (reappearing, Lesson 38)**
  - *What it is:* the real method Riverpod calls to produce a
    `NotifierProvider`'s own real initial state.
  - *Implementation:* `GameSession build() => GameSession(SudokuBoard(ref
    .watch(puzzleRepositoryProvider).startingPuzzle()), ref
    .watch(clockProvider));` — changed this lesson from directly
    referencing `_startingPuzzle`.
  - *Its use:* Concept Unit 2's own central real change site.
  - *Type:* an instance method overriding `Notifier<GameSession>`'s own
    abstract `build()`.
  - *Responsibility:* construct this app's one real, shared
    `GameSession`, reading every real dependency it needs
    (`PuzzleRepository`, `Clock`) from Riverpod rather than constructing
    either itself.
  - *Depends on:* `ref.watch(puzzleRepositoryProvider)` and
    `ref.watch(clockProvider)`, both real provider reads.
  - *Connects to:* called by Riverpod's own real framework code the
    first time `gameSessionProvider` is read; calls
    `PuzzleRepository.startingPuzzle()` and `SudokuBoard`'s own real
    constructor.
  - *Shape:* Application layer.

---

## Concept Unit 1: The Repository Interface

### The Problem

`_startingPuzzle`, before this lesson, was a real, private constant
declared directly inside `game_session_provider.dart` — the Application
layer file Lesson 41 already proved orchestrates but doesn't decide
domain rules. That same file also decided, by simple proximity, exactly
*where* a fresh session's puzzle comes from, with zero real seam a test
or a future lesson could use to supply a different one.

> **Socratic prompt:** `Clock` (Lesson 39) is three real lines: `abstract
> class Clock { DateTime now(); }`. What would the equivalent three
> lines look like for "the ability to supply a starting Sudoku puzzle,"
> reusing that exact real shape? Second: `GameSessionNotifier.build()`
> currently reads `_startingPuzzle` as a private, file-local constant.
> If Phase 6 later needed to read a puzzle from a real SQLite database
> instead, how many real files would have to change under that shape —
> and how many would have to change if `build()` instead depended on an
> abstraction it didn't know the real implementation of?

### Project Change

- **Reference Source:** no reference counterpart — curriculum.md, lines
  500-516, names `GameRepository`/`ScoreRepository`/`SettingsRepository`
  as its own example interfaces, none of which this project has a real
  backing data source for yet; this unit's own real shape
  (`PuzzleRepository`) is a from-scratch addition, deliberately narrowed
  to the one real, current data-source seam this app actually has,
  modeled directly on `Clock`'s own already-real shape
  (`project/lib/clock.dart`, read fresh this session).
- **Files affected:** `project/lib/puzzle_repository.dart` (new).
- **Change type:** add.
- **Location:** a brand-new file — nothing to locate a position within.
- **Dependencies:** none.

### The New Code

```dart
abstract class PuzzleRepository {
  List<List<int?>> startingPuzzle();
}
```

### Isolate and Discard

No throwaway lab for this unit — `abstract class Clock { DateTime
now(); }` (Lesson 39, `project/lib/clock.dart`, reread fresh this
session) already is the real, isolated example this exact shape was
learned from; nothing new needs a fresh invented demonstration. This
real pattern — one abstract method naming a real capability, with zero
commitment to how it's fulfilled — is called the **Repository**
pattern (Terms, above) when the capability being named is specifically
"supply this kind of data."

### Mechanical Walkthrough

- `abstract class PuzzleRepository` — Dart's own real `abstract` class
  modifier (Lesson 12, reappearing): a class explicitly marked as unable
  to be instantiated directly, existing purely to declare a real
  contract other classes commit to.
- `List<List<int?>> startingPuzzle();` — a real abstract method: a
  signature with no body at all, a real promise that any concrete
  subclass must supply one. Its own real return type,
  `List<List<int?>>` (Lesson 9/10, reappearing — a `List` of `List<int?>`,
  the identical real shape `SudokuBoard`'s own constructor already
  takes), names exactly what "a starting puzzle" real data looks like,
  without saying where it comes from.

### CS Lens

The **Repository** pattern is a hard concept — a real, general way of
hiding *where* data lives behind one, real, stable interface.

```
Also recognized in: the Data Access Object (DAO) pattern in enterprise
Java, an ORM's own real Model/QuerySet abstraction (Django, Active
Record), a file system's own real interface (`open`/`read`/`write`
identical whether the real bytes sit on a local disk, a network share,
or a USB stick), a browser's own `fetch` API (an app calls it the same
real way whether the response actually comes from a live server or a
service worker's own local cache)
```

### SE Lens

The real principle is the same **dependency injection** Lesson 39
already established, applied to a second, different real dependency.
The alternative not chosen: leave `_startingPuzzle` a private constant
read directly by `GameSessionNotifier.build()`, exactly as it was
through Lessons 38-42. The real tradeoff: one new, real, six-line file
for the real payoff Concept Unit 3, below, actually proves — a test can
now supply a genuinely different puzzle without touching
`GameSessionNotifier` at all. The honest, present cost: with only one
real implementation behind this interface right now, the abstraction's
own real payoff is entirely about testability, not about genuinely
swapping real data sources — that half of the real argument only
becomes concrete once Phase 6 adds a second, real implementation.

### Run It

No command to run — a real, freestanding interface with no body has
nothing to execute. `flutter analyze .`, at the end of Concept Unit 2,
covers this file too.

### Connect

`PuzzleRepository` names the real capability. Concept Unit 2 supplies
its one, real, current answer.

---

## Concept Unit 2: The Real Implementation and Wiring

### The Problem

An interface with no implementation can't build anything. This unit
gives `PuzzleRepository` its one, real, current answer — the exact same
puzzle this app has used since Phase 1 — and rewires
`GameSessionNotifier.build()` to read it through the new seam instead of
a hardcoded constant.

> **Socratic prompt:** `SystemClock` (Lesson 39) is the one real class
> that actually calls `DateTime.now()`. Given `PuzzleRepository`'s own
> real shape from Concept Unit 1, what would the equivalent real
> implementation for "supply the Phase 1 puzzle" look like? Second:
> `clockProvider` is `Provider<Clock>((ref) => SystemClock());` — one
> real line. What would the equivalent line for `PuzzleRepository` look
> like, reusing that exact real shape?

### Project Change

- **Reference Source:** no reference counterpart — modeled directly on
  `clockProvider` (`project/lib/game_session_provider.dart`, read fresh
  this session).
- **Files affected:** `project/lib/puzzle_repository.dart` (modified:
  adds `InMemoryPuzzleRepository` and the moved `_startingPuzzle`
  constant); `project/lib/game_session_provider.dart` (modified: removes
  `_startingPuzzle`, adds `puzzleRepositoryProvider`, rewrites
  `GameSessionNotifier.build()`).
- **Change type:** add (the new class), remove + replace (the moved
  constant and the rewired `build()`).
- **Location:** `puzzle_repository.dart`, after `PuzzleRepository`;
  `game_session_provider.dart`, immediately before `clockProvider`, and
  inside `GameSessionNotifier.build()`.
- **Dependencies:** none beyond `PuzzleRepository` itself.

### The New Code

```dart
class InMemoryPuzzleRepository implements PuzzleRepository {
  @override
  List<List<int?>> startingPuzzle() => _startingPuzzle;
}
```

### The Updated Project

`game_session_provider.dart`'s own real top section, in full, with the
changed lines marked:

```dart
1  import 'package:flutter/widgets.dart' show AppLifecycleState;
2  import 'package:flutter_riverpod/flutter_riverpod.dart';
3
4  import 'clock.dart';
5  import 'game_session.dart';
6  import 'game_status.dart';
7  import 'puzzle_repository.dart';                                          // ← new
8  import 'sudoku_board.dart';
9
10 final puzzleRepositoryProvider = Provider<PuzzleRepository>((ref) => InMemoryPuzzleRepository()); // ← new
11
12 final clockProvider = Provider<Clock>((ref) => SystemClock());
13
14 final gameSessionProvider = NotifierProvider<GameSessionNotifier, GameSession>(
15   GameSessionNotifier.new,
16 );
17
18 class GameSessionNotifier extends Notifier<GameSession> {
19   @override
20   GameSession build() => GameSession(                                      // ← changed
21         SudokuBoard(ref.watch(puzzleRepositoryProvider).startingPuzzle()), // ← changed
22         ref.watch(clockProvider),                                          // ← changed
23       );
```

As a whole, this file's own real job is unchanged: it's still the one,
real, app-wide place `PuzzleRepository` and `Clock` are actually
obtained from, and the one place a fresh `GameSession` gets built —
only *where* the starting puzzle's own real data comes from moved behind
a real seam, the same way `Clock` already did in Lesson 39.

### Isolate and Discard

No throwaway lab — `SystemClock`/`clockProvider` (Lesson 39, reread
fresh this session) are already the real, isolated examples this exact
shape was learned from.

### Mechanical Walkthrough

- `class InMemoryPuzzleRepository implements PuzzleRepository` — Dart's
  own real `implements` keyword (Lesson 12, reappearing): commits this
  class to providing a real, concrete body for `startingPuzzle()`.
- `@override` — a real Dart annotation (Lesson 12, reappearing), marking
  that `startingPuzzle()` below deliberately fulfills the abstract
  method `PuzzleRepository` left unimplemented.
- `List<List<int?>> startingPuzzle() => _startingPuzzle;` — a real
  arrow-bodied method (Lesson 9, reappearing) whose entire body reads
  the file's own real, private `_startingPuzzle` constant (unchanged
  literal data, just moved from `game_session_provider.dart` into this
  file).
- `final puzzleRepositoryProvider = Provider<PuzzleRepository>((ref) =>
  InMemoryPuzzleRepository());` — a real top-level variable declaration
  (`final`, Lesson 5, reappearing) whose value is a real
  `Provider<PuzzleRepository>` (Lesson 10's own generic type parameter,
  reappearing) constructed with a real anonymous function (Lesson 15,
  reappearing) — `(ref) => InMemoryPuzzleRepository()` — that Riverpod
  calls the first time this provider is read, constructing exactly one
  real `InMemoryPuzzleRepository`.
- `ref.watch(puzzleRepositoryProvider)` — a real Riverpod call (Lesson
  38, reappearing): reads the current real value of
  `puzzleRepositoryProvider`, subscribing this `Notifier` to future
  changes (none are expected here, but the mechanism is identical to
  `ref.watch(clockProvider)` beside it).
- `.startingPuzzle()` — the real interface method call this whole unit
  exists to wire in — `GameSessionNotifier` calls it through the
  `PuzzleRepository` type, with no real knowledge that
  `InMemoryPuzzleRepository` is the concrete class actually answering.
- `SudokuBoard(...)` — `SudokuBoard`'s own real constructor (Lesson 11,
  reappearing), now receiving the puzzle repository's own real return
  value instead of a bare reference to `_startingPuzzle`.

### CS Lens

Not repeated here as a separate hard-concept entry — this unit is the
same real Repository/dependency-injection pattern Concept Unit 1 already
gave full CS-lens treatment to, now shown with its one real
implementation attached; see that unit's own real, unrelated
recurrences above, all still accurate here.

### SE Lens

The real principle is exactly Lesson 39's own SE lens, reapplied: keep
the **unpredictable or swappable part** (here, not unpredictable at
all — a fixed literal, but genuinely *swappable*, per Phase 6's own
future job) behind a thin, real seam. The alternative not chosen:
`GameSessionNotifier.build()` calling `InMemoryPuzzleRepository()`
directly, inline, with no `puzzleRepositoryProvider` in between — which
would work today, identically, but would leave no real, overridable seam
for Concept Unit 3's own test to use at all. The real tradeoff: one
extra real provider and one extra real method call
(`.startingPuzzle()`) for the real payoff Concept Unit 3 proves
directly. The honest, present cost: `InMemoryPuzzleRepository` still
lives in the same file as its own abstraction, same as `Clock`/
`SystemClock` already do — Lesson 47's own job, not fixed here.

### Commands Needed

- **`flutter analyze .` / `flutter test`** — run from `project/`, this
  session, after all three real files changed.

### Run It

Real, captured output, `flutter analyze .`:

```
26 issues found.
```

— the same real, pre-existing `avoid_print`/`avoid_relative_lib_imports`
categories as Lesson 42's own run; zero new errors or warnings from
either the new file or the rewired `build()`.

Real, captured output, `flutter test` (full suite, before Concept Unit
3's own new test existed): every real test file passed, unchanged —
`game_session_test.dart` 33/33, `sudoku_board_test.dart` 8/8, every
real widget test still passing, since `InMemoryPuzzleRepository`
returns the exact same real puzzle `_startingPuzzle` always did.

### Connect

`PuzzleRepository` now has one, real, working answer, wired into the
real app exactly the way `Clock` already is. Concept Unit 3 proves, with
a real test, that this new seam actually does something a hardcoded
constant couldn't.

---

## Concept Unit 3: Proving the Seam Is Real

### The Problem

Concept Unit 2's own SE lens claimed a real payoff: a test can now
supply a different puzzle without touching `GameSessionNotifier` at all.
Lesson 39 already proved the identical claim for `Clock`, with a real,
overridden `FakeClock`. This unit runs the same real proof again, for
`PuzzleRepository`.

> **Socratic prompt:** `game_session_provider_test.dart` already has a
> real test overriding `clockProvider` with a `FakeClock`
> (`clockProvider.overrideWithValue(fakeClock)`). Given
> `puzzleRepositoryProvider`'s own identical real shape, what would the
> equivalent override call look like? Second: if this new test builds a
> fake puzzle with `7` at cell `(0, 0)` and every other cell empty, what
> real value should `container.read(gameSessionProvider).board.valueAt(0,
> 0)` return if the override genuinely worked — and what would it return
> instead if `GameSessionNotifier.build()` still secretly read
> `InMemoryPuzzleRepository` directly?

### Project Change

- **Reference Source:** `project/test/game_session_provider_test.dart`,
  lines 27-46 (the existing, real `clockProvider` override test, read
  fresh this session) — this unit's own new test is a direct, real
  structural parallel to it.
- **Files affected:** `project/test/game_session_provider_test.dart`
  (modified: one new import, one new test-only class, one new
  `testWidgets` block).
- **Change type:** add.
- **Location:** the file's own top import block; a new class placed
  before `main()`; a new test placed as the first block inside `main()`.
- **Dependencies:** `package:flutter_test`, `package:flutter_riverpod`
  (both already real project dependencies).

### The New Code

```dart
class _FakePuzzleRepository implements PuzzleRepository {
  _FakePuzzleRepository(this._puzzle);
  final List<List<int?>> _puzzle;

  @override
  List<List<int?>> startingPuzzle() => _puzzle;
}
```

### The Updated Project

The new real test, in full, exactly as added to
`game_session_provider_test.dart` (line numbers count from the test's
own first line):

```dart
1  testWidgets('overriding puzzleRepositoryProvider with a real fake changes the real starting puzzle', (
2    WidgetTester tester,
3  ) async {
4    final fakePuzzle = List.generate(9, (row) => List<int?>.filled(9, null));
5    fakePuzzle[0][0] = 7;
6    final container = ProviderContainer(
7      overrides: [puzzleRepositoryProvider.overrideWithValue(_FakePuzzleRepository(fakePuzzle))],
8    );
9    addTearDown(container.dispose);
10
11   await tester.pumpWidget(UncontrolledProviderScope(container: container, child: const SudokuApp()));
12
13   expect(
14     container.read(gameSessionProvider).board.valueAt(0, 0),
15     7,
16     reason: 'the real, shared session was built from the overridden fake repository, not the real one',
17   );
18   expect(
19     container.read(gameSessionProvider).board.valueAt(0, 1),
20     null,
21     reason: 'every other real cell matches the fake puzzle too, not the real Phase 1 one',
22   );
23 });
```

This test's own real job, as a whole: build an app whose real,
shared session is deliberately constructed from a fake puzzle instead of
the real one, then check two real cells to confirm the fake genuinely
took effect, not just that nothing crashed.

### Isolate and Discard

No throwaway lab — the real, already-existing `clockProvider` override
test (Concept Unit 3's own Reference Source, above) is the real,
isolated example this exact structure was learned from; this unit's own
new test is that same real structure, applied to a second, real
provider.

### Mechanical Walkthrough

- `class _FakePuzzleRepository implements PuzzleRepository` — a real,
  test-only class (leading underscore, Lesson 11's own real per-file
  privacy, reappearing), committing to `PuzzleRepository`'s own real
  contract, the same shape `game_session_test.dart`'s own `FakeClock`
  already uses for `Clock`.
- `_FakePuzzleRepository(this._puzzle);` — a real constructor using
  `this.field` shorthand (Lesson 11, reappearing), storing whatever real
  puzzle this fake is built with.
- `final List<List<int?>> _puzzle;` — a real, private, `final` field
  (Lesson 11, reappearing) holding a genuinely different real puzzle
  each time this class is constructed, unlike `InMemoryPuzzleRepository`
  's own fixed constant.
- `List.generate(9, (row) => List<int?>.filled(9, null))` — real,
  already-explained (Lesson 17) constructs: `List.generate` (Lesson 9,
  reappearing) building 9 real rows; `List<int?>.filled(9, null)`
  (Lesson 17, reappearing) building each row as 9 real, independent
  `null` cells — Lesson 17's own already-real aliasing-trap proof is
  exactly why `.filled` is safe here only because `List.generate`'s own
  outer callback runs once per row, producing 9 genuinely separate real
  lists, not 9 references to the same one.
- `fakePuzzle[0][0] = 7;` — a real, direct index assignment (Lesson 9,
  reappearing) on the freshly-built, still-local `fakePuzzle`, setting
  exactly one real cell before it's ever handed to anything.
- `ProviderContainer(overrides: [...])` — real, already-established
  (Lesson 38) construct; `overrides` here holds exactly one real
  `Override` value this time, `puzzleRepositoryProvider
  .overrideWithValue(_FakePuzzleRepository(fakePuzzle))` — Riverpod's own
  real `overrideWithValue` (Lesson 39, reappearing), replacing
  `puzzleRepositoryProvider`'s own real value for this one container's
  entire lifetime.
- `addTearDown(container.dispose);` — real, already-established (Lesson
  38) cleanup registration.
- `tester.pumpWidget(UncontrolledProviderScope(container: container,
  child: const SudokuApp()))` — real, already-established (Lesson 38)
  construct: builds the real app against this specific, overridden
  container instead of a fresh default one.
- `container.read(gameSessionProvider).board.valueAt(0, 0)` — a real
  chain: `.read` (Lesson 38, reappearing — reads a provider's current
  real value without subscribing), `.board` (Lesson 36, reappearing — the
  real `GameSession.board` field), `.valueAt(0, 0)` (Lesson 17,
  reappearing — `SudokuBoard`'s own real cell reader).
- `expect(..., 7, reason: ...)` — `flutter_test`'s own real `expect`
  function (Lesson 25, reappearing), asserting the real value at `(0,
  0)` genuinely is `7` — the fake's own value, not the real Phase 1
  puzzle's `5`.

### CS Lens

Not repeated separately — this unit's own real evidence is the direct
completion of Concept Unit 1's already-given Repository-pattern CS
lens, above: a test substituting one real implementation for another
behind an unchanged interface is the concrete, run proof of the same
real idea named there.

### SE Lens

The real principle proven here, concretely, is **testability through
dependency inversion** — the actual, measurable payoff of Concept Units
1-2's own real design choice. The alternative not chosen — a hardcoded
`InMemoryPuzzleRepository()` call inline inside `build()` — is not
merely less flexible in the abstract; this exact real test could not
have been written against it at all, since nothing would exist to
override. The real tradeoff already paid, concretely: roughly twenty
real lines of test code, for a real, provable guarantee that this
project's own future `SqlitePuzzleRepository` (Phase 6) can be tested
the identical real way, without ever touching a real device's file
system during a test run. No new honest cost beyond what Concept Unit 2
already named.

### Commands Needed

- **`flutter test test\game_session_provider_test.dart`** — runs only
  this one real file, to confirm the new test by name before trusting
  the full-suite run.

### Run It

Real, captured output, run this session:

```
00:00 +0: overriding puzzleRepositoryProvider with a real fake changes the real starting puzzle
00:01 +1: overriding clockProvider with a real fake gives deterministic elapsed time
00:01 +2: a real, rejected move increments the shared session's own real mistake count
00:02 +3: a real, accepted move is reflected live through the same shared session
00:03 +4: All tests passed!
```

All four real tests in this file pass, including the new one, by name,
first in the run.

### Connect

Concept Unit 1 named the seam. Concept Unit 2 gave it its one, real,
current answer, wired into the real app. This unit proves, with a real,
run test — not an assertion — that the seam genuinely works: a
completely different real puzzle reaches the real, shared session with
zero change to `GameSessionNotifier` itself.

---

## Connect the Pieces

Before this lesson, `GameSessionNotifier.build()` read a private
constant sitting three lines above it in the same file — nothing a test
or a future lesson could touch without editing that file directly.
After this lesson, it reads `ref.watch(puzzleRepositoryProvider)
.startingPuzzle()` — a real, named seam, with exactly one real,
production implementation (`InMemoryPuzzleRepository`, still returning
the identical Phase 1 puzzle, confirmed by every real, unchanged
pre-existing test still passing) and, in this lesson's own new test, a
second real implementation (`_FakePuzzleRepository`) proving the seam
genuinely swaps. The real app plays exactly the puzzle it always has;
what changed is that *where that puzzle comes from* is now a real,
independent, Infrastructure-layer decision — the same real shape
`Clock` already established for "what time it is," now applied a second
time, and the real shape Phase 6's own future `SqlitePuzzleRepository`
will reuse without requiring a single change to `GameSessionNotifier`.
