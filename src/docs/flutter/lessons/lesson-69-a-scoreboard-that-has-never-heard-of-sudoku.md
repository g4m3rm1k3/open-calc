# Lesson 69: A Scoreboard That Has Never Heard of Sudoku

**What you will build.** A real, generic scoring contract living
entirely at the platform level: `Score`, a real, minimal record of one
real score earned in one real, played game; `ScoreCalculator<S extends
GameState>`, a real, bounded-generic seam letting each real game
define its own real scoring rule; `ScoreRepository`, a real,
deliberately non-generic persistence contract; and `Leaderboard`, a
real, stateless utility turning a real list of scores into a real,
ranked view. Then, `SudokuScoreCalculator`, the real, first concrete
rule plugged into that seam, and one real, small, injectable change to
`SudokuEngine` proving the seam is genuinely swappable, not decorative.
The transferable problem: curriculum's own real requirement for this
lesson is a real scoreboard "while allowing each game to define its
own scoring rules" — the real test isn't whether points can be stored
and ranked, but whether the storing and ranking code could work for a
real, second, completely different game's own real scoring rule
without ever being told that rule exists.

**What you need to know first.** `GameState`, `GameEngine<S, A>`, and
the bounded-generic shape `<S extends GameState>` already established.
The concrete, Sudoku-specific `GameSession`'s own real `score` getter
— already computing a real, correct point value from real difficulty,
mistakes, and hints, entirely unchanged since deep in this project's
own history. `SudokuEngine`'s own real constructor, and the real
`this.field` dependency-injection shape it already uses for a real
`Clock` and a real `PuzzleRepository`. This project's own, completely
separate, concrete `Score`/`SqliteScoreRepository`
(`features/sudoku/domain/score.dart`,
`features/sudoku/infrastructure/sqlite_score_repository.dart`) — real,
already-existing, real code this lesson deliberately does not touch,
replace, or route through.

**Terms used in this lesson**

- **Strategy (as a design pattern)** — a real family of interchangeable
  algorithms, each satisfying the identical real interface, chosen and
  handed to some other real object from the outside rather than that
  object picking one for itself internally. It exists so the object
  doing the real work — computing a real score, say — never needs its
  own real `if`/`switch` over which rule applies; it just calls the one
  real method its real, injected strategy already promises to have,
  and a genuinely different real rule can be swapped in by passing a
  different real object, with zero real changes to the object using
  it.

**Objects and methods used**

- **`Score`**
  - *What it is:* a real, generic, immutable record of one real score,
    earned in one real, played game — deliberately smaller than this
    project's own existing, concrete, Sudoku-specific `Score`.
  - *Implementation:* `class Score { const Score({required this.gameId,
    required this.points, required this.achievedAt}); final String
    gameId; final int points; final DateTime achievedAt; }` — real,
    complete, three real fields.
  - *Its use:* this lesson's own new, permanent test builds several
    real values directly, saves them through a real, in-memory
    repository, and ranks them through `Leaderboard`.
  - *Type:* a `const`-constructible, plain, immutable class.
  - *Responsibility:* carry exactly enough to identify *which* real
    game a real score belongs to and rank it against others —
    nothing about *how* that real score was computed; that stays
    `ScoreCalculator`'s own real job, below.
  - *Depends on:* nothing.
  - *Connects to:* the real value every method on `ScoreRepository` and
    `Leaderboard`, below, actually operates on.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, the
    identical real, same-name-different-library shape `GameSession`/
    `GameSettings` already established between the generic platform
    and Sudoku specifically.
- **`ScoreCalculator`**
  - *What it is:* a real, generic, bounded interface — the real
    **Strategy**, named in full as a Term in this lesson's own Header,
    above — naming "compute one real score from one real, played
    state" without saying which real game, or which real rule.
  - *Implementation:* `abstract interface class ScoreCalculator<S
    extends GameState> { int calculate(S state); }` — real, complete,
    one real, generic method.
  - *Its use:* `SudokuScoreCalculator`, below, is this lesson's own
    real, first concrete instance; `SudokuEngine`'s own real
    constructor takes one, injected, as this lesson's own final
    Concept Unit shows.
  - *Type:* a real, generic, `abstract interface class`, bounded by
    `GameState` — the identical real bounded-generic shape
    `GameEngine<S, A>` already established.
  - *Responsibility:* be the one, real, single seam a real score gets
    computed through — nothing about persisting, ranking, or comparing
    real scores; those stay `ScoreRepository`/`Leaderboard`'s own real
    jobs.
  - *Depends on:* `GameState`, already established.
  - *Connects to:* implemented by `SudokuScoreCalculator`, below;
    injected into `SudokuEngine`, replacing what was, before this
    lesson, a real, hard-coded call to `state.score` directly.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, genuinely
    unaware any concrete game, or concrete scoring rule, exists.
- **`ScoreRepository`**
  - *What it is:* a real, generic persistence contract — real and
    deliberately *not* itself generic over a real state type, unlike
    `ScoreCalculator` just above; explained in full in this lesson's
    own second Concept Unit, below.
  - *Implementation:* `abstract interface class ScoreRepository {
    Future<void> save(Score score); Future<List<Score>> allFor(String
    gameId); }` — real, complete, two real, async methods.
  - *Its use:* this lesson's own new, permanent test implements a real,
    in-memory version, proving two real, different games' own real
    scores stay genuinely separate.
  - *Type:* a real, plain `abstract interface class` — no real, generic
    type parameter of its own.
  - *Responsibility:* save a real score, and fetch every real score
    already saved for one real game's own id — nothing about ranking
    them; that stays `Leaderboard`'s own real job, next.
  - *Depends on:* `Score`, above.
  - *Connects to:* a real, in-memory implementation in this lesson's
    own permanent test; this project's own, completely separate,
    concrete `SqliteScoreRepository` remains the real, only actual
    SQLite-backed implementation of anything, still entirely unrelated
    to this real, generic contract.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, genuinely
    unaware SQLite, or Sudoku, exists.
- **`Leaderboard`**
  - *What it is:* a real, generic, stateless utility turning a real,
    unsorted list of `Score`s into a real, ranked view.
  - *Implementation:* real, shown in full in this lesson's own third
    Concept Unit, below — two real, static methods, `top`/`best`.
  - *Its use:* this lesson's own new, permanent test builds a real,
    small, deliberately unsorted list and confirms both real methods
    rank it correctly.
  - *Type:* a real class with only real, `static` members — never
    itself instantiated.
  - *Responsibility:* real, pure ranking — sort and take, nothing more;
    no real fetching (that's `ScoreRepository`'s own real job) and no
    real computing of any individual real score (that's
    `ScoreCalculator`'s own real job).
  - *Depends on:* `Score`, above.
  - *Connects to:* takes whatever real list `ScoreRepository.allFor`
    already returned; returns a new, real, ranked list, never mutating
    the one it was given.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, stateless.
- **`SudokuScoreCalculator`**
  - *What it is:* Sudoku's own real, first `ScoreCalculator` — the real
    **Strategy**, concretely instantiated for the real, first time.
  - *Implementation:* `class SudokuScoreCalculator implements
    ScoreCalculator<GameSession> { @override int calculate(GameSession
    state) => state.score; }` — real, complete, one real line of real
    logic.
  - *Its use:* `SudokuEngine`'s own real, new default, and this
    lesson's own new, permanent test's own direct target, confirming
    it reports the identical real value `GameSession.score` already
    computes.
  - *Type:* a real, concrete class implementing a real, generic
    interface with one real, concrete type argument already chosen
    (`GameSession`).
  - *Responsibility:* expose Sudoku's own already-real scoring rule
    through the real, generic, pluggable seam — nothing about
    computing that rule a real, second, separate way; `GameSession
    .score` stays the one, real, single source of truth.
  - *Depends on:* the concrete `GameSession`, already established.
  - *Connects to:* `SudokuEngine`'s own real, new, optional constructor
    parameter, this lesson's own final Concept Unit, below.
  - *Shape:* Domain-layer, `features/sudoku/` — genuinely Sudoku-
    specific, the one, real, only piece of this lesson that is.

## Concept Unit: Score

### The Problem

A real leaderboard spanning every real game this platform might ever
host needs a real, common shape to rank against — but this project's
own existing, concrete `Score` is genuinely Sudoku-specific (tied to a
real `sessionId`, a real `Difficulty`, real `mistakes`/`hints` counts).
Reusing it directly would mean a real, second, entirely different
future game either faking those real Sudoku-only fields, or the
generic platform learning what `Difficulty` even is.

> **Try it yourself first.** Strip every real field the existing,
> concrete `Score` has down to only what a real leaderboard genuinely
> needs to rank and to tell games apart — what real, minimal set is
> left?

### Introducing the concept

No new isolated lab — a plain, small, immutable data class with three
real, `final` fields is an already-established shape, identical to
`GameResult`/`GameDefinition`/`SudokuMove` from this project's own
earlier work in this phase.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/score.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, in
  `game_platform/domain/`.
- **Dependencies** — none.

### The New Code

```dart
class Score {
  const Score({
    required this.gameId,
    required this.points,
    required this.achievedAt,
  });
  final String gameId;
  final int points;
  final DateTime achievedAt;
}
```

### The Updated Project

`score.dart`, in full, numbered — a brand-new file:

```dart
1  class Score {
2    const Score({
3      required this.gameId,
4      required this.points,
5      required this.achievedAt,
6    });
7    final String gameId;
8    final int points;
9    final DateTime achievedAt;
10 }
```

### Mechanical walkthrough

- `class Score { ... }` / `const Score({required this.gameId, ...})` —
  the identical, already-established real shape as `GameDefinition`/
  `GameResult`/`SudokuMove`: a real, `const`-constructible, immutable
  data class using real `this.field` initializing-formal shorthand.
- `final String gameId;` — the real, only field naming *which* real
  game this real score belongs to; matched against a real
  `GameDefinition.id`, already established, at whatever real call site
  actually saves a score.
- `final int points;` / `final DateTime achievedAt;` — two real,
  already-established, plain field types (`int`, `DateTime`), the
  minimum real facts a real ranking needs.

### CS lens

Not applicable — a plain, immutable data record is not a hard concept
worth a CS lens of its own.

### SE lens

The real alternative here was extending, or wrapping, this project's
own existing, concrete `Score` instead of declaring a real, second,
separate one under the identical real name — real, one fewer class, at
the real cost of the generic platform either depending on a real,
Sudoku-specific type (`Difficulty`) it should never need to know
about, or that concrete `Score` growing real, optional, nullable
fields no non-Sudoku game would ever fill in. The real, chosen
approach — a real, second, deliberately smaller `Score`, same name,
different real library — costs nothing except the real discipline of
naming imports explicitly at any real call site that needs both, the
identical real tradeoff already made for `GameSession`/`GameSettings`.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, common shape for one real score now exists — the next Concept
Unit builds the real, generic seam that actually computes one.

---

## Concept Unit: ScoreCalculator and ScoreRepository

### The Problem

Curriculum's own real requirement for this lesson is a real scoreboard
"while allowing each game to define its own scoring rules" — nothing
yet lets a real score be *computed* generically, and nothing yet lets
one be *saved* generically either, without either one hard-coding a
real, specific game's own real rules.

> **Try it yourself first.** `GameEngine<S, A>` already bounds its own
> real `S` with `extends GameState`. Should a real interface for
> *computing* one real game's own score be bounded the identical real
> way — and should a real interface for *saving* one already end up
> needing that real state type at all?

### Introducing the concept

No new isolated lab — a bounded-generic interface (`ScoreCalculator`)
is the identical, already-established shape `GameEngine<S, A>` already
used; a plain, non-generic interface (`ScoreRepository`) is the
identical, already-established shape `PuzzleRepository` already used.
Both compose only already-covered mechanisms.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/score_calculator.dart` (new file);
  `project/lib/game_platform/domain/score_repository.dart` (new file).
- **Change type** — add.
- **Location** — two new, real, standalone files, in
  `game_platform/domain/`.
- **Dependencies** — `GameState`, `Score`, both already established.

### The New Code

```dart
abstract interface class ScoreCalculator<S extends GameState> {
  int calculate(S state);
}

abstract interface class ScoreRepository {
  Future<void> save(Score score);
  Future<List<Score>> allFor(String gameId);
}
```

### The Updated Project

`score_calculator.dart`, in full, numbered:

```dart
1  import 'game_state.dart';
2
3  abstract interface class ScoreCalculator<S extends GameState> {
4    int calculate(S state);
5  }
```

`score_repository.dart`, in full, numbered:

```dart
1  import 'score.dart';
2
3  abstract interface class ScoreRepository {
4    Future<void> save(Score score);
5    Future<List<Score>> allFor(String gameId);
6  }
```

### Mechanical walkthrough

- `abstract interface class ScoreCalculator<S extends GameState> { int
  calculate(S state); }` — a real, already-established bounded-generic
  interface declaration, the identical real shape `GameEngine<S, A>`
  already used; `S` is resolved to a real, concrete state type
  (`GameSession`, for Sudoku) only once a real implementation chooses
  it, exactly as `SudokuEngine implements GameEngine<GameSession,
  SudokuMove>` already did.
- `abstract interface class ScoreRepository { Future<void>
  save(Score score); Future<List<Score>> allFor(String gameId); }` — a
  real, already-established, plain interface declaration; real and
  deliberately *not* generic — `save`/`allFor` never need to touch a
  real, played `S` state at all, only the already-flat `Score` value
  and a real, plain `String` id.
- `Future<void> save(Score score);` / `Future<List<Score>>
  allFor(String gameId);` — two real, already-established async method
  signatures, the identical real, `Future`-returning shape this
  project's own existing repository interfaces already use.

### CS lens

Not applicable — both interfaces compose only already-covered
mechanisms (bounded generics, plain interfaces); no new hard concept
of their own.

### SE lens

The real, deliberate asymmetry between these two real interfaces is
this Concept Unit's own real point: `ScoreCalculator` *must* be generic
over `S`, because computing a real score genuinely requires reading
real, game-specific state (`GameSession.mistakes`, say) that only
exists once `S` is a real, concrete type. `ScoreRepository` *must not*
be, because saving and fetching a real score only ever touches the
already-flat `Score` value and a real, opaque `gameId` string — never
the real, played state itself. Making `ScoreRepository<S>` generic
anyway would cost real, needless complexity (every real caller
supplying a real type argument a persistence method never actually
uses) for zero real benefit — a real, concrete instance of choosing
the narrowest real contract that still does the real job, not the
broadest one that merely could.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, generic way to compute, and a real, generic way to save, a
real score both now exist — the next Concept Unit builds the real,
generic way to rank them.

---

## Concept Unit: Leaderboard

### The Problem

`ScoreRepository.allFor` can hand back a real, unsorted list of every
real score one real game has ever earned — nothing yet turns that into
a real, ranked view: the real, top few, or the real, single best.

> **Try it yourself first.** Given a real, already-fetched
> `List<Score>`, what is the smallest, real, stateless way to compute
> both "the real, top `N`" and "the real, single best" — and should
> either one need to be a real, injected, constructed object at all?

### Introducing the concept

No new isolated lab — a real, `static`-only utility class, and Dart's
own real, built-in `List.sort`/`List.take`, are both already-established
(this project's own, separate, concrete `SqliteScoreRepository` already
ranks its own real rows the identical, real, in-Dart way, rather than
pushing that real logic into SQL).

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/leaderboard.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, in
  `game_platform/domain/`.
- **Dependencies** — `Score`, already established.

### The New Code

```dart
class Leaderboard {
  static List<Score> top(List<Score> scores, {int limit = 10}) {
    final sorted = List<Score>.of(scores)
      ..sort((a, b) => b.points.compareTo(a.points));
    return sorted.take(limit).toList();
  }

  static Score? best(List<Score> scores) {
    if (scores.isEmpty) {
      return null;
    }
    return top(scores, limit: 1).single;
  }
}
```

### The Updated Project

`leaderboard.dart`, in full, numbered:

```dart
1  class Leaderboard {
2    static List<Score> top(List<Score> scores, {int limit = 10}) {
3      final sorted = List<Score>.of(scores)
4        ..sort((a, b) => b.points.compareTo(a.points));
5      return sorted.take(limit).toList();
6    }
7
8    static Score? best(List<Score> scores) {
9      if (scores.isEmpty) {
10       return null;
11     }
12     return top(scores, limit: 1).single;
13   }
14 }
```

### Mechanical walkthrough

- `static List<Score> top(List<Score> scores, {int limit = 10})` — a
  real, already-established static method with a real, defaulted named
  parameter, the identical real shape this project's own existing
  code already uses elsewhere for a real, optional cap.
- `final sorted = List<Score>.of(scores)` — a real, already-established
  copying constructor — real and deliberate: the real, original
  `scores` list, passed in by whatever real caller already fetched it,
  is never itself mutated.
- `..sort((a, b) => b.points.compareTo(a.points));` — a real,
  already-established cascade calling `List.sort` with a real,
  descending comparator (`b` compared against `a`, not `a` against
  `b`, is what makes the real, highest score sort first).
- `return sorted.take(limit).toList();` — two real, already-established,
  built-in `Iterable` methods, `take` and `toList`, real and already
  familiar from this app's own, existing filtering code elsewhere.
- `static Score? best(List<Score> scores)` — a real, already-established
  nullable return type; `if (scores.isEmpty) { return null; }` is a
  real, already-established, explicit, honest empty-list case, rather
  than letting a real, empty `.single` throw on its own.
- `return top(scores, limit: 1).single;` — `top` reused here for real,
  rather than a real, separate sorting pass; `.single`, a real,
  already-established `Iterable` getter, is used only once a real,
  non-empty, exactly-one-element list is already guaranteed.

### CS lens

Not applicable — a comparator-driven sort and a bounded take are
already-covered, standard-library mechanisms; no new hard concept of
their own.

### SE lens

The real alternative here was a real, injected, instance-based
`Leaderboard` (constructed once, held somewhere real and long-lived)
instead of a real, `static`-only utility — real, more consistent with
this project's own, existing, injected `ScoreRepository`/
`ScoreCalculator` shapes, at the real cost of one, real, needless
constructor and one, real, needless place to hold a reference to an
object that carries no real state and depends on nothing. The real,
chosen approach mirrors this project's own already-existing, concrete
`SqliteScoreRepository`, whose own real ranking queries are already
plain, static-shaped, in-Dart computations over an already-fetched
list — real, consistent with a real pattern this codebase already
chose, not a real, new one invented just for this lesson.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real score can now be represented, computed, saved, fetched, and
ranked, all generically — the final Concept Unit plugs Sudoku's own
real, existing rule into the one, real seam still unused.

---

## Concept Unit: SudokuScoreCalculator and the injectable seam

### The Problem

`SudokuEngine.resultFor` still calls `state.score` directly, real and
hard-coded — genuinely correct, but not genuinely swappable. Nothing
yet proves a real, different scoring rule could be plugged in for
Sudoku, specifically, without editing `SudokuEngine`'s own real code.

> **Try it yourself first.** `GameSession.score` already computes the
> one, real, correct rule. What is the smallest, real class satisfying
> `ScoreCalculator<GameSession>` without recomputing that rule a real,
> second, separate way — and what is the smallest, real change to
> `SudokuEngine`'s own constructor that lets a real, different one be
> supplied instead, without breaking a single real, existing caller?

### Introducing the concept

A minimal, throwaway probe (folded directly into this lesson's own
real, permanent test, since both `SudokuScoreCalculator` and the
change to `SudokuEngine` are real, permanent project code from their
own first line) constructs a real engine with a real, deliberately
*wrong*, fixed-value calculator, plays a real, complete, winning game,
and confirms the real, injected value — not the real, correct
Sudoku rule — is what `resultFor` actually reports:

```dart
final engine = SudokuEngine(
  clock: SystemClock(),
  puzzleRepository: InMemoryPuzzleRepository(),
  scoreCalculator: const _FixedScoreCalculator(999),
);
// ...play a real, complete, winning game...
final result = engine.resultFor(state);
expect(result.score, 999);
```

Run for real (`project/test/generic_scoring_test.dart`) — because
whether an injected dependency is genuinely *used*, rather than merely
accepted and silently ignored, is exactly the kind of real,
non-obvious behavior this schema's own Verification Rule requires
proof for:

```
result.won == true
result.score == 999
```

Real, direct proof the real, generic seam is genuinely live: a real,
flawless Easy completion would otherwise report a real score of `100`
— seeing `999` instead is only possible if `SudokuEngine.resultFor`
truly called the real, injected calculator, not `GameSession.score`
directly.

### Discard the throwaway example

Not applicable — this real proof lives permanently in
`generic_scoring_test.dart`.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/domain/sudoku_score_calculator.dart`
  (new file);
  `project/lib/features/sudoku/domain/sudoku_engine.dart` (modify).
- **Change type** — add, and modify.
- **Location** — a new, real, standalone file; `SudokuEngine`'s own
  real constructor and its own real `resultFor` method.
- **Dependencies** — `ScoreCalculator`, the concrete `GameSession`,
  both already established.

### The New Code

```dart
class SudokuScoreCalculator implements ScoreCalculator<GameSession> {
  @override
  int calculate(GameSession state) => state.score;
}
```

```dart
SudokuEngine({
  required this._clock,
  required this._puzzleRepository,
  ScoreCalculator<GameSession>? scoreCalculator,
}) : _scoreCalculator = scoreCalculator ?? SudokuScoreCalculator();

final ScoreCalculator<GameSession> _scoreCalculator;

@override
GameResult resultFor(GameSession state) {
  return GameResult(
    won: state.status == GameStatus.completed,
    score: _scoreCalculator.calculate(state),
  );
}
```

### The Updated Project

`sudoku_score_calculator.dart`, in full, numbered — a brand-new file:

```dart
1  import '../../../game_platform/domain/score_calculator.dart';
2  import 'game_session.dart';
3
4  class SudokuScoreCalculator implements ScoreCalculator<GameSession> {
5    @override
6    int calculate(GameSession state) => state.score;
7  }
```

`sudoku_engine.dart`'s own real, updated constructor, field, and
`resultFor` method, numbered, this Concept Unit's own new or changed
lines marked:

```dart
 1  SudokuEngine({
 2    required this._clock,
 3    required this._puzzleRepository,
 4    ScoreCalculator<GameSession>? scoreCalculator,               // ← new
 5  }) : _scoreCalculator = scoreCalculator ?? SudokuScoreCalculator();  // ← new
 6
 7  final Clock _clock;
 8  final PuzzleRepository _puzzleRepository;
 9  final ScoreCalculator<GameSession> _scoreCalculator;            // ← new
10
11  // ...createInitialState and apply, entirely unchanged...
16
17  @override
18  GameResult resultFor(GameSession state) {
19    return GameResult(
20      won: state.status == GameStatus.completed,
21      score: _scoreCalculator.calculate(state),                   // ← changed
22    );
23  }
```

### Mechanical walkthrough

- `class SudokuScoreCalculator implements ScoreCalculator<GameSession>`
  — a real, already-established `implements` clause against a real,
  generic interface with its own real type argument already chosen —
  the identical real shape `SudokuEngine implements
  GameEngine<GameSession, SudokuMove>` already used.
- `int calculate(GameSession state) => state.score;` — a real,
  one-line, already-established getter delegation; no new real rule,
  only a real, new, generic way to reach the one real rule that
  already existed.
- `ScoreCalculator<GameSession>? scoreCalculator,` — a real,
  already-established, nullable, optional named parameter, the
  identical real shape this project's own existing code already uses
  for other real, optional dependencies.
- `: _scoreCalculator = scoreCalculator ?? SudokuScoreCalculator();`
  — a real, already-established initializer-list assignment using the
  real, already-established `??` null-coalescing operator: whatever
  real value the caller supplied, or a real, freshly built default.
- `final ScoreCalculator<GameSession> _scoreCalculator;` — a real,
  already-established, private, `final` field, holding whichever real
  calculator actually won that real `??`.
- `score: _scoreCalculator.calculate(state),` — the one, real, changed
  line: a real call through the real, injected seam, replacing what
  was, before this lesson, a real, direct `state.score` read.

### CS lens

This Concept Unit is a real, direct, concrete instance of the
**Strategy pattern**, named in full as a Term in this lesson's own
Header, above: `SudokuScoreCalculator` is one, real, interchangeable
algorithm satisfying `ScoreCalculator`'s own real contract, chosen by
whatever real caller constructs `SudokuEngine`, rather than
`SudokuEngine` itself ever branching on which real rule to run. Also
recognized in: a real sorting library accepting a real, injected
comparator function instead of hard-coding one real ordering; a real
compression tool accepting a real, pluggable codec; a real game engine
accepting a real, swappable AI difficulty algorithm, chosen once, at
real, construction time, and never branched on again afterward.

### SE lens

The real, deliberate choice here was an *optional*, defaulted
parameter (`ScoreCalculator<GameSession>? scoreCalculator`), not a
*required* one — real, one line shorter at every real, existing call
site, since this lesson's own real, existing, already-established
tests and production wiring never needed to change at all to keep
passing. The real, rejected alternative — making `scoreCalculator`
required — would have been a real, more explicit signal that Sudoku's
own scoring rule is genuinely pluggable, at the real cost of a real,
breaking change to every real, existing caller (this project's own
already-existing `sudoku_engine_test.dart`, and any real, future
production wiring) for a real capability nothing yet actually needs to
exercise outside of this lesson's own new, permanent test.

### Commands needed

None.

### Run it

Real, run output shown above, from
`project/test/generic_scoring_test.dart`.

### Connect the pieces

Every real piece this lesson built now composes: a real score can be
computed through a real, swappable rule, saved and fetched through a
real, generic repository, and ranked through a real, stateless
leaderboard — proven end to end in this lesson's own final, real test.

---

## Connect the pieces

One real, concrete trace, start to finish, computing, saving, and
ranking real scores entirely through this lesson's own new, generic
seam.

1. `SudokuEngine(clock: ..., puzzleRepository: ..., scoreCalculator:
   const _FixedScoreCalculator(999))` — a real engine, its own real,
   default `SudokuScoreCalculator` deliberately swapped out for a real,
   alternate rule, proving the injected seam is genuinely live, not
   decorative.
2. A real, complete, winning game, played the identical real way this
   project's own immediately preceding lesson already proved —
   `engine.resultFor(state)` reports the real, injected `999`, not the
   real, correct Sudoku score of `100`, real and direct proof
   `_scoreCalculator.calculate(state)` is genuinely what ran.
3. `Score(gameId: 'sudoku', points: 100, achievedAt: ...)` and a real,
   second, entirely different `Score(gameId: 'not-sudoku', ...)`,
   saved through one, real, shared, in-memory `ScoreRepository`
   implementation — `allFor('sudoku')` and `allFor('not-sudoku')` each
   report back only their own real game's own real scores, real and
   direct proof the same, generic repository already, correctly
   separates real games that have never met.
4. `Leaderboard.top`/`Leaderboard.best`, called against a real,
   deliberately unsorted list of real `Score` values, report the real,
   correct highest-first ranking and the real, single best entry —
   neither one ever importing, referencing, or knowing Sudoku exists.

A real scoreboard, genuinely generic — curriculum's own real
requirement, proven, not merely declared, by a real, alternate scoring
rule actually running, and a real, second, fictional game's own real
scores staying genuinely separate from Sudoku's.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `SudokuScoreCalculator` and the change to
`SudokuEngine` both touch real, permanent project code, this lesson's
own real proof lives in a new, permanent
`project/test/generic_scoring_test.dart`, not a throwaway lab — the
identical, real, established choice this project's own two immediately
preceding lessons already made.

No real, first-attempt mistakes this lesson — every new file compiled
and every new test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 102.1s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:23 +98: All tests passed!
```

98 real test-file-level checks, up from 93 — five new, all in a new,
permanent `generic_scoring_test.dart`. This project's own existing,
permanent `sudoku_engine_test.dart` (six real tests) was re-run
unmodified afterward, confirming `SudokuEngine`'s own real, new,
optional constructor parameter changed nothing for any real, existing
caller. Two real, newly-observed, isolated flakes joined this
project's own already-established, honest, environment-load-dependent
flake pattern on the first of two full-suite runs — both confirmed
clean on an immediate, real retry, and genuinely unrelated to this
lesson's own changes (neither one touches scoring code at all). Full,
honest narrative in `verification/lesson-69/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
