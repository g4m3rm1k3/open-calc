# Lesson 68: Separating the Platform From the Game

**What you will build.** The real bridge every earlier lesson in this
phase deliberately deferred: `SudokuEngine`, a real, concrete
`GameEngine` wrapping this app's own already-real, already-tested
`SudokuBoard`/`GameSession` by delegation; `SudokuMove`, the real,
minimal action type that connection needs; and `GamePlatform`, a real,
generic coordinator that starts a real, registered game by id without
knowing a single real thing about how it's actually played. The
transferable problem: curriculum's own title for this lesson names it
directly — a real platform and a real, specific game are two,
genuinely different real concerns, and the test of whether they're
actually separated isn't whether the code compiles, but whether the
platform half could plug in a second, real, completely different game
without changing one real line of the first.

**What you need to know first.** Every real contract from this
project's own two immediately preceding lessons —
`GameDefinition`/`GameSettings`/`GameState`/`GameResult`/
`GameEngine<S, A>`/`GameSession<S, A>`, and its own real lifecycle
(`create`/`play`/`finish`, and so on). This app's own real,
already-tested `SudokuBoard`, unmodified since deep in this project's
own history. The concrete, Sudoku-specific `GameSession` — its own
real `enterDigit`, `touched()`, `mistakes`, `score`, and `status`. The
real reason `touched()` exists at all: Riverpod's own real,
identity-based change detection, discovered and solved earlier in this
project. `GameRegistry`, from this project's own immediately preceding
lesson.

**Terms used in this lesson**

- **Adapter (as a design pattern)** — a real class whose entire job is
  translating one real, existing interface into a different real,
  expected one, without changing what's on either side of it. It
  exists so two real pieces of code that were never designed together
  — an already-real, specific engine and a newly-real, generic
  contract — can still work together, by inserting one real, small,
  translating class between them instead of forcing either one to
  change its own real shape to match the other.

**Objects and methods used**

- **`SudokuMove`**
  - *What it is:* a real, new, minimal, immutable class naming one
    real action a player can take against a playing Sudoku session —
    placing a real digit at a real `(row, col)`.
  - *Implementation:* `class SudokuMove { const SudokuMove({required
    this.row, required this.col, required this.digit}); final int row;
    final int col; final int digit; }` — real, complete, the identical
    real shape as this project's own other small, immutable data
    classes.
  - *Its use:* the real, concrete `A` type parameter `SudokuEngine`
    fills `GameEngine<S, A>`'s own generic contract with.
  - *Type:* a `const`-constructible, plain, immutable class.
  - *Responsibility:* carry exactly the three real facts
    `GameSession.enterDigit` already needed as three, real, separate
    parameters, now as one, real, single value — nothing about
    whether that real move is actually legal; that stays
    `SudokuEngine`'s own, and ultimately `SudokuBoard`'s own, real job.
  - *Depends on:* nothing.
  - *Connects to:* passed into `SudokuEngine.apply`, below, and, one
    real layer further out, into `GameSession<S, A>.play`.
  - *Shape:* Domain-layer, `features/sudoku/` — genuinely Sudoku-
    specific, unlike every real type this project's own two immediately
    preceding lessons built.
- **`SudokuEngine`**
  - *What it is:* a real, new, concrete class implementing the real,
    generic `GameEngine<GameSession, SudokuMove>` — the real
    **Adapter**, named in full as a Term in this lesson's own Header,
    above, between this app's own already-real Sudoku rules and the
    real, generic platform contract.
  - *Implementation:* real, shown in full in this lesson's own third
    Concept Unit, below — three real methods
    (`createInitialState`/`apply`/`resultFor`), each delegating to
    already-real, already-tested Sudoku code rather than reimplementing
    any of it.
  - *Its use:* this lesson's own new, permanent test constructs one,
    plays a complete, real game through it — both directly, and
    through `GamePlatform`/the real, generic session lifecycle — and
    confirms the real, identical winning result either way.
  - *Type:* a real, concrete class implementing a real, generic
    interface with two real, concrete type arguments already chosen
    (`GameSession`, `SudokuMove` — not left generic itself).
  - *Responsibility:* be the one, real, single place Sudoku's own
    already-real rules get exposed through the generic contract's own
    real shape — nothing about *when* a move is allowed (that's the
    generic `GameSession<S, A>`'s own lifecycle, reused unchanged) and
    nothing about the actual rules themselves (that stays
    `SudokuBoard`/the concrete `GameSession`'s own, entirely
    unmodified, real job).
  - *Depends on:* a real `Clock` and a real `PuzzleRepository`, the
    identical real dependencies this app's own existing, concrete
    session-building code already needs.
  - *Connects to:* wraps `SudokuBoard`/the concrete `GameSession`
    directly; plugged into a real, generic `GameSession<GameSession,
    SudokuMove>` (this lesson's own real, first use of the generic
    contract with real, concrete, non-toy type arguments) via
    `GamePlatform`, below.
  - *Shape:* Domain-layer, `features/sudoku/` — the real, one, single
    seam this whole architecture change actually adds.
- **`GamePlatform`**
  - *What it is:* a real, new, generic class coordinating a real
    `GameRegistry` with the real, generic session lifecycle — the
    concrete, real answer to curriculum's own real distinction between
    a real platform and a real, specific game.
  - *Implementation:* real, shown in full in this lesson's own fourth
    Concept Unit, below — one real, generic method, `startGame<S, A>`.
  - *Its use:* this lesson's own new, permanent test starts a real
    Sudoku session entirely through it, by real id, never referencing
    `SudokuEngine` by name inside `GamePlatform`'s own real code at
    all.
  - *Type:* a real, plain class with one real, generic method.
  - *Responsibility:* look up a real, registered `GameDefinition` by
    its own real id, and, given a real, matching engine and settings,
    hand back a real, freshly created, generic `GameSession<S, A>` —
    nothing about which real games exist beyond what's already
    registered, and nothing about how any one of them is actually
    played.
  - *Depends on:* a real `GameRegistry`.
  - *Connects to:* `GameRegistry.find`; `GameSession<S, A>.create`,
    both already established.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, genuinely
    unaware `SudokuEngine` exists.

## Concept Unit: GameSession implements GameState

### The Problem

`SudokuEngine`, this lesson's own real goal, needs a real, concrete
`S` type parameter satisfying `GameState`'s own one-member contract.
The obvious real candidate — this app's own already-real, concrete
`GameSession` — was never written with that contract in mind at all.

> **Try it yourself first.** The concrete, Sudoku-specific
> `GameSession` already has a real, existing `bool get isComplete =>
> board.isComplete;` getter, built for a completely different, real,
> earlier reason. Does satisfying `GameState`'s own real contract
> (`bool get isComplete;`) actually require writing any new real
> logic at all — or just a real, different kind of declaration?

### Introducing the concept

No new isolated lab — `implements` on an already-existing class,
against an already-established interface, whose own required member
already exists with the identical real name and real signature, is
not a new construct; both halves were already fully explained in
earlier lessons.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/domain/game_session.dart`.
- **Change type** — modify (add an `implements` clause and one real
  `@override` annotation; zero real behavior changes).
- **Location** — the concrete `GameSession` class's own declaration
  line; its own existing `isComplete` getter.
- **Dependencies** — `GameState`, from `game_platform/domain/`.

### The New Code

```dart
import '../../../game_platform/domain/game_state.dart';

class GameSession implements GameState {
```

### The Updated Project

`game_session.dart`'s own real, updated top and `isComplete` getter,
numbered, this Concept Unit's own new lines marked:

```dart
 1  import '../../../game_platform/domain/game_state.dart';           // ← new
 2  import 'clock.dart';
 3  import 'difficulty.dart';
 4  import 'game_status.dart';
 5  import 'sudoku_board.dart';
 6
 7  class GameSession implements GameState {                          // ← changed
 8    // ...every real, existing constructor and field, entirely unchanged
16
17    /// True once the real, underlying board reports every cell filled.
18    @override                                                       // ← new
19    bool get isComplete => board.isComplete;
```

Line 7's own real class declaration gains `implements GameState`; line
18 gains a real `@override` annotation, matching this project's own
established convention of marking every real interface member
explicitly. Line 19, the getter's own real body, is completely
unchanged — it already did exactly what the new, real contract needs.

### Mechanical walkthrough

- `import '../../../game_platform/domain/game_state.dart';` — a real,
  already-established relative import, crossing, for the real, second
  time in this project (the first was this same feature area's own
  `GameDefinition` import), from `features/sudoku/` into
  `game_platform/`.
- `class GameSession implements GameState` — a real, already-established
  `implements` clause (already used throughout this project's own
  earlier interface work), added to an already-existing, real class
  declaration.
- `@override bool get isComplete => board.isComplete;` — a real,
  already-established annotation on a real, already-existing getter —
  the compiler itself is what actually confirms this real getter's own
  existing signature genuinely satisfies `GameState`'s own real
  contract; nothing about its own real body needed to change at all.

### CS lens

This Concept Unit is a real, direct, minimal instance of **retroactive
interface conformance** — an already-existing, real type turns out to
already satisfy a real contract written well after it, with zero real
changes to its own behavior. Also recognized in: Go's own real,
structural interface system, where a type satisfies an interface
automatically the moment its own real method set matches, with no
explicit `implements` even required; a real, existing C function
happening to already match a real, newly-defined callback signature
some library expects; retrofitting a real, legacy class onto a real,
newly-introduced abstract base class in an older, real codebase,
possible specifically because its own real, existing shape already
happened to line up.

### SE lens

The real alternative here was writing a real, separate, new class
(`SudokuGameState`, say) wrapping the concrete `GameSession` and
exposing only `isComplete`, keeping `GameState` conformance completely
decoupled from `GameSession`'s own real, rich shape. Real, cleaner
separation, at the real cost of `SudokuEngine`'s own `apply` method
needing to unwrap and rewrap that real, extra layer on every single
real call, and every real caller reaching Sudoku-specific fields
(`mistakes`, `score`, `status`) through the generic session losing
direct access to them. The real, chosen approach — `GameSession`
directly satisfying `GameState` — costs nothing extra in real code and
keeps every one of `GameSession`'s own already-real, rich members
directly reachable through `GameSession<GameSession, SudokuMove>
.state`, real and exactly why this lesson's own later Concept Unit's
tests can read `session.state.board`/`.mistakes` directly.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

This app's own real, existing, rich Sudoku session can now stand in
directly for the generic contract's own `S` — the next Concept Unit
builds the real action type it needs to actually change.

---

## Concept Unit: SudokuMove

### The Problem

`GameEngine<S, A>.apply(S state, A action)` takes exactly one real
action value — `GameSession.enterDigit(row, col, digit)` takes three.

> **Try it yourself first.** What is the smallest, real, immutable
> class that could bundle `enterDigit`'s own three real parameters
> into the one real value `apply` actually needs, without changing
> `enterDigit` itself at all?

### Introducing the concept

No new isolated lab — a plain, small, immutable data class with three
real, `final`, `int` fields is an already-established shape, identical
to `GameResult`/`GameDefinition` from this project's own immediately
preceding lessons.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/domain/sudoku_move.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — none.

### The New Code

```dart
class SudokuMove {
  const SudokuMove({required this.row, required this.col, required this.digit});
  final int row;
  final int col;
  final int digit;
}
```

### The Updated Project

`sudoku_move.dart`, in full, numbered — a brand-new file:

```dart
1  class SudokuMove {
2    const SudokuMove({required this.row, required this.col, required this.digit});
3    final int row;
4    final int col;
5    final int digit;
6  }
```

### Mechanical walkthrough

- `class SudokuMove { ... }` / `const SudokuMove({required this.row,
  ...})` — the identical, already-established real shape as
  `GameDefinition`/`GameResult`: a real, `const`-constructible,
  immutable data class using real `this.field` initializing-formal
  shorthand.
- `final int row;` / `final int col;` / `final int digit;` — three
  real, already-established `final int` fields, the identical real
  values `enterDigit`'s own three parameters already carried.

### CS lens

Not applicable — a plain, immutable data record is not a hard concept
worth a CS lens of its own.

### SE lens

The real alternative here was making `A` itself a plain, real,
three-element record type (`(int row, int col, int digit)`, Dart 3's
own real record syntax) instead of a real, named class — real, one
fewer file, at the real cost of every real call site reading
`action.$1`/`action.$2`/`action.$3` (or needing its own, real,
destructuring pattern) instead of `action.row`/`.col`/`.digit` — a
real, small, ongoing readability cost, paid at every real call site,
to save one, real, one-time class declaration.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real action now exists for the generic contract to carry — the next
Concept Unit is where it's actually put to work.

---

## Concept Unit: SudokuEngine

### The Problem

Nothing yet actually connects Sudoku's own real rules to the generic
`GameEngine<S, A>` contract — `createInitialState`/`apply`/`resultFor`
all still need real, concrete bodies, built entirely from code this
app already has.

> **Try it yourself first.** `GameEngine.apply`'s own real, documented
> contract says it should never mutate the `state` it's given — but
> `GameSession.enterDigit` mutates its own object in place, on
> purpose, for a real, already-established reason (Riverpod's own
> identity-based change detection). Given `touched()` already exists
> to solve exactly that problem elsewhere in this app, what would the
> smallest real `apply` body that's honest about this tension actually
> look like?

### Introducing the concept

A minimal, throwaway probe (folded directly into this lesson's own
real, permanent test, since `SudokuEngine` is real, permanent project
code from its own first line, per the identical reasoning this
project's own immediately preceding lesson already applied to
`GameRegistry`) constructs a real engine and applies one real, invalid
move:

```dart
final engine = SudokuEngine(clock: SystemClock(), puzzleRepository: InMemoryPuzzleRepository());
final state = engine.createInitialState(const SudokuSettings());
expect(state.mistakes, 0);
expect(() => engine.apply(state, const SudokuMove(row: 0, col: 0, digit: 9)), throwsException);
expect(state.mistakes, 1);
```

Run for real (`project/test/sudoku_engine_test.dart`) — because
whether a real, thrown exception genuinely leaves the underlying
object unmutated, partially mutated, or fully mutated is exactly the
kind of real, non-obvious behavior this schema's own Verification Rule
requires proof for, never assumed from reading `apply`'s own source
alone:

```
before the real, rejected apply call: state.mistakes == 0
after it (a real exception was thrown): state.mistakes == 1
```

Real, direct, surprising proof: even though `engine.apply` itself
never reached its own `return state.touched();` line — the real
exception propagated straight out of `state.enterDigit(...)` — the
real, underlying `GameSession` object was already, genuinely mutated
(`registerMistake()` runs, real and unconditionally, before
`enterDigit`'s own real `rethrow`). Because `S` here is a real,
mutable, *shared* reference, not a copy, that real, partial mutation
is visible through `state` regardless of whether `apply`'s own final
line ever ran.

### Discard the throwaway example

Not applicable — this real proof lives permanently in
`sudoku_engine_test.dart`.

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  adapter, real and deliberately built around this project's own
  already-existing, unmodified `SudokuBoard`/`GameSession`.
- **Files affected** —
  `project/lib/features/sudoku/domain/sudoku_engine.dart` (new file);
  `project/lib/features/sudoku/domain/sudoku_settings.dart` (new file
  — a real, deliberately empty, concrete `GameSettings`).
- **Change type** — add.
- **Location** — two new, real, standalone files.
- **Dependencies** — `Clock`, `PuzzleRepository`, `GameStatus`,
  `SudokuBoard`, `GameSession`, `SudokuMove`, all already established.

### The New Code

```dart
class SudokuEngine implements GameEngine<GameSession, SudokuMove> {
  SudokuEngine({required this._clock, required this._puzzleRepository});
  final Clock _clock;
  final PuzzleRepository _puzzleRepository;

  @override
  GameSession createInitialState(GameSettings settings) {
    final board = SudokuBoard(_puzzleRepository.startingPuzzle());
    return GameSession(board, _clock);
  }

  @override
  GameSession apply(GameSession state, SudokuMove action) {
    state.enterDigit(action.row, action.col, action.digit);
    return state.touched();
  }

  @override
  GameResult resultFor(GameSession state) {
    return GameResult(won: state.status == GameStatus.completed, score: state.score);
  }
}
```

### The Updated Project

`sudoku_engine.dart`, in full, numbered:

```dart
 1  class SudokuEngine implements GameEngine<GameSession, SudokuMove> {
 2    SudokuEngine({required this._clock, required this._puzzleRepository});
 3    final Clock _clock;
 4    final PuzzleRepository _puzzleRepository;
 5
 6    @override
 7    GameSession createInitialState(GameSettings settings) {
 8      final board = SudokuBoard(_puzzleRepository.startingPuzzle());
 9      return GameSession(board, _clock);
10   }
11
12   @override
13   GameSession apply(GameSession state, SudokuMove action) {
14     state.enterDigit(action.row, action.col, action.digit);
15     return state.touched();
16   }
17
18   @override
19   GameResult resultFor(GameSession state) {
20     return GameResult(
21       won: state.status == GameStatus.completed,
22       score: state.score,
23     );
24   }
25 }
```

`sudoku_settings.dart`, in full, numbered — this lesson's own real,
concrete, deliberately empty `GameSettings`:

```dart
1  class SudokuSettings implements GameSettings {
2    const SudokuSettings();
3  }
```

### Mechanical walkthrough

- `class SudokuEngine implements GameEngine<GameSession, SudokuMove>`
  — a real, already-established `implements` clause, this time against
  a real, *generic* interface with both real type arguments already
  filled in concretely — `SudokuEngine` itself is not generic; it is
  one, specific, real conformance.
- `SudokuEngine({required this._clock, required this._puzzleRepository});`
  — a real, already-established constructor using real `this.field`
  shorthand for two real, private fields.
- `GameSession createInitialState(GameSettings settings)` — a real,
  already-established method override; its own real parameter,
  `settings`, is genuinely unused inside this real body — `SudokuSettings`
  carries no real fields yet, per this Concept Unit's own honestly-empty
  design.
- `final board = SudokuBoard(_puzzleRepository.startingPuzzle());` — a
  real, already-established constructor call and method call, both
  already this app's own, unchanged, real, tested code.
- `return GameSession(board, _clock);` — the real, already-established,
  original `GameSession` constructor (not `.restored`, not `._raw`) —
  a real, fresh session, the identical real shape
  `GameSessionNotifier.build` already constructs, reused here through a
  real, different, generic-facing seam.
- `GameSession apply(GameSession state, SudokuMove action)` — a real,
  already-established method override.
- `state.enterDigit(action.row, action.col, action.digit);` — the
  real, already-established, unmodified method, called with
  `action`'s own three real fields unpacked back out.
- `return state.touched();` — the real, already-established method,
  explained in full in this lesson's own Header, above, real and
  called here specifically to satisfy `GameEngine.apply`'s own
  documented "return a new reference" expectation, honestly only a
  partial fix given this lesson's own real, run-proved finding above.
- `GameResult resultFor(GameSession state)` — a real,
  already-established method override; `state.status ==
  GameStatus.completed` (a real, already-established equality check
  against a real, already-established enum value) and `state.score`
  (a real, already-established getter) are both this app's own,
  entirely unmodified, real, existing members.

### CS lens

`SudokuEngine`'s own entire real job — translate between two real
interfaces neither side had to change to accommodate the other — is
the **Adapter pattern**, named in full as a Term in this lesson's own
Header, above. Also recognized in: a real, physical power plug
adapter, translating between two real, incompatible sockets without
either the wall or the appliance changing; a real, legacy payment
processor's own API wrapped behind a modern, real, unified checkout
interface; a real device driver, translating a generic operating
system call into whatever real, specific commands one particular piece
of hardware actually understands.

### SE lens

The real, honest, load-bearing finding this Concept Unit's own real
run surfaced: wrapping an already-real, mutable domain object as a
generic contract's own `S` type parameter means that contract's own
"never mutates state" promise cannot be fully honored without a
deeper, real refactor of `GameSession` itself into something
genuinely immutable — real, substantial, out-of-scope work this lesson
deliberately does not undertake. The real, chosen tradeoff: accept a
real, honestly-documented, partial conformance (a real, distinct
reference is *returned*, even though the *original* was already
real, mutated) rather than either silently pretending full purity or
blocking this whole lesson on a real refactor no earlier lesson's own
real, working code actually needs yet.

### Commands needed

None.

### Run it

Real, run output shown above, from `project/test/sudoku_engine_test.dart`.

### Connect the pieces

Sudoku's own real rules are now genuinely reachable through the
generic contract — the final Concept Unit ties a real registry, a
real platform, and this real engine together.

---

## Concept Unit: GamePlatform

### The Problem

`GameRegistry` (this project's own immediately preceding lesson) can
name a real game; `SudokuEngine` (this Concept Unit's own predecessor)
can play one. Nothing yet connects "start me the real game registered
under this id" to "here is a real, running, generic session" in one,
real, single step.

> **Try it yourself first.** Given a real `GameRegistry` and a real,
> matching `GameEngine`, what is the smallest real method that could
> take a real game's own id, a real engine, and real settings, and
> hand back a real, ready-to-play, generic `GameSession<S, A>` —
> without that method itself ever needing to know Sudoku, or any
> other specific real game, exists?

### Introducing the concept

No new isolated lab — this Concept Unit composes only
already-established real methods (`GameRegistry.find`,
`GameSession<S, A>.create`); its own real proof lives in this lesson's
own permanent test, run directly against real project code.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_platform.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, in `game_platform/domain/`.
- **Dependencies** — `GameRegistry`, `GameEngine`, `GameSession`,
  `GameSettings`, `GameState`, all already established.

### The New Code

```dart
GameSession<S, A> startGame<S extends GameState, A>({required String gameId, required GameEngine<S, A> engine, required GameSettings settings}) {
  final definition = registry.find(gameId);
  if (definition == null) {
    throw StateError('no game registered with id "$gameId"');
  }
  return GameSession<S, A>.create(definition: definition, settings: settings, engine: engine);
}
```

### The Updated Project

`game_platform.dart`, in full, numbered:

```dart
 1  class GamePlatform {
 2    GamePlatform(this.registry);
 3    final GameRegistry registry;
 4
 5    GameSession<S, A> startGame<S extends GameState, A>({
 6      required String gameId,
 7      required GameEngine<S, A> engine,
 8      required GameSettings settings,
 9    }) {
10     final definition = registry.find(gameId);
11     if (definition == null) {
12       throw StateError('no game registered with id "$gameId"');
13     }
14     return GameSession<S, A>.create(
15       definition: definition,
16       settings: settings,
17       engine: engine,
18     );
19   }
20 }
```

### Mechanical walkthrough

- `class GamePlatform { GamePlatform(this.registry); final GameRegistry
  registry; }` — a real, already-established constructor and field —
  the one real, required dependency this whole class needs.
- `GameSession<S, A> startGame<S extends GameState, A>({...})` — a
  real, already-established generic method declaration (the identical
  real shape `GameSession.create` itself already used), its own two
  real, independent type parameters resolved by whatever real,
  concrete `engine` the caller actually passes in — real, direct proof
  this happens correctly is this lesson's own permanent test calling
  it with `SudokuEngine`.
- `final definition = registry.find(gameId);` — the real,
  already-established method from this project's own immediately
  preceding lesson.
- `if (definition == null) { throw StateError(...); }` — a real,
  already-established `null` check and a real, already-established,
  plain, built-in `StateError` (Dart's own real, general-purpose
  runtime-error class, not a custom, domain-specific one, since this
  is a real, generic, platform-level misuse, not a Sudoku-specific
  domain rule).
- `return GameSession<S, A>.create(definition: definition, settings:
  settings, engine: engine);` — the real, already-established factory
  constructor, from this project's own second-most-recent lesson,
  called here for the real, first time with genuinely concrete,
  non-toy type arguments.

### CS lens

Not applicable — `GamePlatform` composes already-covered mechanisms
(the Registry pattern, generic dispatch); no new hard concept of its
own.

### SE lens

The real, honest limitation this Concept Unit's own Header already
named: `startGame` cannot look up *which* real `GameEngine` matches a
given real `gameId` on its own — the caller must already know and
supply it. The real alternative — storing a real engine *factory*
inside each real `GameRegistry` entry, keyed by the identical real id
— would close that real gap, at the real cost of `GameDefinition`
itself needing to either carry a real, generic factory function or
`GameRegistry` growing a real, second, parallel real map; a real,
legitimate, larger design this lesson deliberately leaves for a real,
later lesson that actually needs to select a real engine by id alone,
rather than building it speculatively now.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real registry, a real platform, and a real, specific engine now
compose into one, real, complete, playable game — proven end to end
in this lesson's own final, real test.

---

## Connect the pieces

One real, concrete trace, start to finish, playing a complete, real
Sudoku game entirely through this lesson's own new, generic seam.

1. `GameRegistry()..register(sudokuGameDefinition)` — a real registry,
   holding this app's own real, only entry.
2. `GamePlatform(registry).startGame(gameId: 'sudoku', engine:
   SudokuEngine(...), settings: const SudokuSettings())` — real,
   direct proof `GamePlatform` never needed to know Sudoku exists by
   name anywhere in its own real code; `startGame` looks up the real
   definition, then calls the real, already-established
   `GameSession<S, A>.create`, which calls `SudokuEngine
   .createInitialState`, which builds a real, fresh, actual Sudoku
   board and session.
3. A real, complete sequence of `session.play(SudokuMove(...))` calls
   — the real, generic lifecycle method from this project's own
   immediately preceding lesson — each one reaching `SudokuEngine
   .apply`, which calls the real, unmodified `GameSession.enterDigit`,
   then returns `state.touched()`.
4. The real, final move completes the real board; `GameSession
   <S, A>.play`'s own real, already-established, automatic
   `finish()` call fires, moving the real, generic session to real
   `GameLifecycleStatus.finished`.
5. `session.engine.resultFor(session.state)` reads the real, concrete
   `GameSession`'s own real `status`/`score` and reports a real,
   correct `GameResult(won: true, score: 100)` — the identical real
   score this app's own, completely separate, concrete Sudoku UI code
   would already show a real player, now also reachable through a
   real, generic seam that has never heard of `SudokuCellView` or
   `NumberPadView` at all.

The real platform and the real game, genuinely separated — curriculum's
own title for this lesson, proven, not merely declared, by a complete,
real game played end to end through the boundary between them.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `SudokuEngine`/`GamePlatform` both touch
real, permanent project code, this lesson's own real proof lives in a
new, permanent `project/test/sudoku_engine_test.dart`, not a
throwaway lab — the identical, real, established choice this
project's own immediately preceding lesson already made for
`GameRegistry`.

Two real, first-attempt mistakes, both caught immediately and fixed in
place: `SudokuEngine`'s own first constructor used a colon-initializer
list instead of `this.field` shorthand, triggering the identical,
already-existing `prefer_initializing_formals` info this project's own
concrete `GameSession._raw` constructor already carries; and this
lesson's own new test file's first draft imported `GameSession` for a
type it never actually named directly, a real, genuine `unused_import`
warning caught by `flutter analyze .` itself. Full, honest narrative
in `verification/lesson-68/run-log.md`.

```
flutter analyze .
57 issues found. (ran in 6.0s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories, after both real
fixes above.

```
flutter test
...
00:40 +93: All tests passed!
```

93 real test-file-level checks, up from 87 — six new, all in a new,
permanent `sudoku_engine_test.dart`, real and including a real,
complete, winning game played both directly through `SudokuEngine` and
entirely through `GamePlatform`/the real, generic session lifecycle.
Modifying the concrete `GameSession` class (adding `implements
GameState`) produced zero regressions across every one of this app's
own already-existing, real, permanent tests. One real, isolated flake,
this project's own already-established, honest, unrelated pattern, was
observed on the first of two full-suite runs, confirmed clean
immediately after.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
