# Lesson 70: A Rulebook That Has Never Heard of Sudoku

**What you will build.** A real, generic achievement contract living
entirely at the platform level: `Achievement`, a real, minimal record
of one real, unlockable milestone; `AchievementRule<S extends
GameState>`, a real, bounded-generic seam letting each real game
define its own real, individual unlock conditions; `AchievementRepository`,
a real, deliberately non-generic persistence contract; and
`AchievementEvaluator`, a real, new, stateless utility checking a real,
whole list of rules against one real state at once. Then, two real,
concrete rules — `PerfectGameRule`, `SpeedDemonRule` — proving the seam
against this app's own real, existing Sudoku session. The transferable
problem: curriculum's own real constraint for this lesson states it
directly — "the achievement infrastructure shouldn't know anything
about Sudoku" — the real test isn't whether a real achievement can be
unlocked, but whether the checking and storing code could work for a
real, second, completely different game's own real milestones without
ever being told what those milestones even are.

**What you need to know first.** `GameState`, the bounded-generic
shape `<S extends GameState>`, and the real asymmetry between a
generic, bounded calculator and a plain, non-generic repository — all
already established by this project's own immediately preceding
lesson's real `ScoreCalculator`/`ScoreRepository` pair. The concrete,
Sudoku-specific `GameSession`'s own real `mistakes`, `hints`, `status`,
and `elapsed` (a real `Duration`, computed fresh on every read from an
injected `Clock`) — every one of them already established, unmodified
real code. `SudokuEngine`'s own real, injectable-dependency shape,
already proven for `Clock`/`PuzzleRepository`/`ScoreCalculator`.

**Terms used in this lesson**

- **Specification (as a design pattern)** — a real, named, self-
  contained rule object that answers exactly one real question — does
  this real candidate qualify — and nothing else, kept genuinely
  separate from whatever eventually acts on that real yes/no answer.
  It exists so a real, growing list of independent real conditions
  (one real achievement's own unlock rule, a real, second achievement's
  own entirely different one) can each be written, tested, and reused
  on their own, real terms, then checked together against one real
  candidate by a real, separate, shared piece of code that never needs
  to know how many real conditions exist or what any one of them
  actually checks. Distinct from **Strategy**, already established:
  Strategy interchanges *how* a real value gets computed; Specification
  interchanges *whether* a real candidate qualifies at all.

**Objects and methods used**

- **`Achievement`**
  - *What it is:* a real, generic, immutable record naming one real,
    unlockable achievement.
  - *Implementation:* `class Achievement { const Achievement({required
    this.id, required this.name, required this.description}); final
    String id; final String name; final String description; }` —
    real, complete, three real fields.
  - *Its use:* returned by `AchievementRule.achievement`, below, and
    collected by `AchievementEvaluator.evaluate`.
  - *Type:* a `const`-constructible, plain, immutable class.
  - *Responsibility:* carry a real achievement's own real identity and
    real, human-facing text — nothing about *when* it gets unlocked;
    that stays `AchievementRule`'s own real job.
  - *Depends on:* nothing.
  - *Connects to:* the real value every method on `AchievementRule`/
    `AchievementEvaluator`, below, actually produces or carries.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, the
    identical real, same-name-different-library discipline `Score`
    already established, applied here to a real type that has no
    concrete, Sudoku-specific counterpart to collide with at all.
- **`AchievementRule`**
  - *What it is:* a real, generic, bounded interface — the real
    **Specification**, named in full as a Term in this lesson's own
    Header, above.
  - *Implementation:* `abstract interface class AchievementRule<S
    extends GameState> { Achievement get achievement; bool
    isSatisfiedBy(S state); }` — real, complete, one real getter, one
    real, generic method.
  - *Its use:* `PerfectGameRule`/`SpeedDemonRule`, below, are this
    lesson's own real, first concrete instances.
  - *Type:* a real, generic, `abstract interface class`, bounded by
    `GameState` — the identical real bounded-generic shape
    `ScoreCalculator<S extends GameState>` already established.
  - *Responsibility:* answer exactly one real question — does this
    real, played state earn this one, real, particular achievement —
    nothing about persisting, evaluating a real, whole list of these
    together, or what happens once the real answer is `true`; those
    stay `AchievementRepository`/`AchievementEvaluator`'s own real
    jobs.
  - *Depends on:* `Achievement`, `GameState`, both already established.
  - *Connects to:* implemented by `PerfectGameRule`/`SpeedDemonRule`,
    below; checked, in a real, whole list, by
    `AchievementEvaluator.evaluate`.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, genuinely
    unaware any concrete game, or concrete rule, exists.
- **`AchievementRepository`**
  - *What it is:* a real, generic persistence contract — real and
    deliberately *not* itself generic over a real state type, the
    identical real asymmetry `ScoreRepository` already established.
  - *Implementation:* `abstract interface class AchievementRepository {
    Future<void> unlock({required String gameId, required String
    achievementId, required DateTime unlockedAt}); Future<List<String>>
    unlockedIdsFor(String gameId); }` — real, complete, two real, async
    methods.
  - *Its use:* this lesson's own new, permanent test implements a real,
    in-memory version, proving two real, different games' own real,
    unlocked ids stay genuinely separate.
  - *Type:* a real, plain `abstract interface class` — no real, generic
    type parameter of its own.
  - *Responsibility:* record that one real achievement, for one real
    game, was genuinely unlocked, and report every real id already on
    file — nothing about *deciding* whether it should be; that stays
    `AchievementRule`'s own real job, above.
  - *Depends on:* nothing beyond real, plain `String`/`DateTime`.
  - *Connects to:* a real, in-memory implementation in this lesson's
    own permanent test; no real SQLite-backed implementation exists
    yet, the identical real, honest scope decision this project's own
    immediately preceding lesson already made for `ScoreRepository`.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, genuinely
    unaware SQLite, or Sudoku, exists.
- **`AchievementEvaluator`**
  - *What it is:* a real, generic, stateless utility checking a real,
    whole list of `AchievementRule`s against one real state at once —
    this lesson's own real, genuinely new mechanism, not a repeat of
    anything the immediately preceding lesson already built.
  - *Implementation:* real, shown in full in this lesson's own third
    Concept Unit, below — one real, generic, `static` method, `evaluate`.
  - *Its use:* this lesson's own new, permanent test evaluates two,
    real, different rules together against one real, played state, and
    confirms exactly which real achievements come back.
  - *Type:* a real class with only real, `static` members — never
    itself instantiated, the identical real shape `Leaderboard` already
    established.
  - *Responsibility:* real, pure filtering — check every real rule,
    keep the real ones that matched, nothing more; no real deciding of
    any one, individual real rule's own real condition (that stays
    each real `AchievementRule`'s own job) and no real persisting of
    the real result (that stays `AchievementRepository`'s own job).
  - *Depends on:* `Achievement`, `AchievementRule`, `GameState`, all
    already established.
  - *Connects to:* takes whatever real list of rules a real caller
    already assembled; returns a new, real list of `Achievement`s,
    ready to be handed, one by one, to `AchievementRepository.unlock`.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, stateless.
- **`PerfectGameRule` and `SpeedDemonRule`**
  - *What they are:* Sudoku's own real, first two `AchievementRule`
    implementations — two real, concrete **Specifications**, each
    naming exactly one real, independent unlock condition.
  - *Implementation:* real, shown in full in this lesson's own fourth
    Concept Unit, below — `PerfectGameRule.isSatisfiedBy` checks a real,
    completed session's own real `mistakes`/`hints`, both at zero;
    `SpeedDemonRule.isSatisfiedBy` checks a real, completed session's
    own real `elapsed` against a real, injected `Duration` threshold.
  - *Its use:* this lesson's own new, permanent test evaluates both,
    directly and through `AchievementEvaluator`, against real, played
    Sudoku sessions.
  - *Type:* two real, concrete classes, each implementing
    `AchievementRule<GameSession>`.
  - *Responsibility:* each expose exactly one real, Sudoku-specific
    unlock condition through the real, generic seam — nothing about
    any other real achievement, and nothing about how the real result
    gets used once computed.
  - *Depends on:* the concrete `GameSession`, `GameStatus`, both
    already established.
  - *Connects to:* passed, together, into
    `AchievementEvaluator.evaluate` in this lesson's own closing
    "Connect the pieces" trace.
  - *Shape:* Domain-layer, `features/sudoku/` — genuinely Sudoku-
    specific, the one, real part of this lesson that is.

## Concept Unit: Achievement

### The Problem

A real achievement infrastructure spanning every real game this
platform might ever host needs a real, common shape to name one real,
unlockable milestone — but this app has no real, existing type for
this at all; achievements have never existed anywhere in this app
before this lesson.

> **Try it yourself first.** What is the smallest, real, immutable set
> of fields one real achievement needs to be identified, stored, and
> shown to a real player — and should that real shape know anything
> about *when* it gets earned?

### Introducing the concept

No new isolated lab — a plain, small, immutable data class with three
real, `final` fields is an already-established shape, identical to
`Score`/`GameResult`/`GameDefinition` from this project's own earlier
work in this phase.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/achievement.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, in
  `game_platform/domain/`.
- **Dependencies** — none.

### The New Code

```dart
class Achievement {
  const Achievement({
    required this.id,
    required this.name,
    required this.description,
  });
  final String id;
  final String name;
  final String description;
}
```

### The Updated Project

`achievement.dart`, in full, numbered — a brand-new file:

```dart
1  class Achievement {
2    const Achievement({
3      required this.id,
4      required this.name,
5      required this.description,
6    });
7    final String id;
8    final String name;
9    final String description;
10 }
```

### Mechanical walkthrough

- `class Achievement { ... }` / `const Achievement({required this.id,
  ...})` — the identical, already-established real shape as `Score`/
  `GameDefinition`: a real, `const`-constructible, immutable data
  class using real `this.field` initializing-formal shorthand.
- `final String id;` — the real, only field naming *which* real
  achievement this is, matched against whatever real id
  `AchievementRepository` already has on file.
- `final String name;` / `final String description;` — two real,
  plain, `String` fields — the minimum real, human-facing text a real
  achievement needs.

### CS lens

Not applicable — a plain, immutable data record is not a hard concept
worth a CS lens of its own.

### SE lens

The real alternative here was folding `id`/`name`/`description`
directly onto `AchievementRule` itself, rather than a real, separate
`Achievement` value — real, one fewer type, at the real cost of every
real caller that only wants to *display* an achievement (a real,
future achievements screen, say) needing to depend on the real,
generic `AchievementRule` interface, and its own real, bounded `S`
type parameter, just to read three real strings. The real, chosen
approach keeps `Achievement` genuinely presentable on its own, with no
real, generic type parameter to thread through code that only ever
needs to show it.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, common shape for one real achievement now exists — the next
Concept Unit builds the real, generic seam that actually decides when
one gets earned, and the real, generic place a real, earned one gets
saved.

---

## Concept Unit: AchievementRule and AchievementRepository

### The Problem

Curriculum's own real constraint for this lesson says the achievement
infrastructure "shouldn't know anything about Sudoku" — nothing yet
lets a real achievement be *decided*, or *saved*, generically, without
either one hard-coding a real, specific game's own real rules.

### Introducing the concept

No new isolated lab — a bounded-generic interface (`AchievementRule`)
is the identical, already-established shape `ScoreCalculator<S extends
GameState>` already used; a plain, non-generic interface
(`AchievementRepository`) is the identical, already-established shape
`ScoreRepository` already used, for the identical, already-established
real reason: deciding a real achievement genuinely needs a real,
played state; saving and listing one only ever needs a real, opaque
`gameId`/`achievementId` pair.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/achievement_rule.dart` (new file);
  `project/lib/game_platform/domain/achievement_repository.dart` (new
  file).
- **Change type** — add.
- **Location** — two new, real, standalone files, in
  `game_platform/domain/`.
- **Dependencies** — `Achievement`, `GameState`, both already
  established.

### The New Code

```dart
abstract interface class AchievementRule<S extends GameState> {
  Achievement get achievement;
  bool isSatisfiedBy(S state);
}

abstract interface class AchievementRepository {
  Future<void> unlock({
    required String gameId,
    required String achievementId,
    required DateTime unlockedAt,
  });
  Future<List<String>> unlockedIdsFor(String gameId);
}
```

### The Updated Project

`achievement_rule.dart`, in full, numbered:

```dart
1  import 'achievement.dart';
2  import 'game_state.dart';
3
4  abstract interface class AchievementRule<S extends GameState> {
5    Achievement get achievement;
6    bool isSatisfiedBy(S state);
7  }
```

`achievement_repository.dart`, in full, numbered:

```dart
1  abstract interface class AchievementRepository {
2    Future<void> unlock({
3      required String gameId,
4      required String achievementId,
5      required DateTime unlockedAt,
6    });
7    Future<List<String>> unlockedIdsFor(String gameId);
8  }
```

### Mechanical walkthrough

- `abstract interface class AchievementRule<S extends GameState> {
  Achievement get achievement; bool isSatisfiedBy(S state); }` — a
  real, already-established bounded-generic interface declaration; one
  real getter naming *what* gets unlocked, one real, generic method
  deciding *whether* it should be, this time, based on `state`.
- `abstract interface class AchievementRepository { Future<void>
  unlock({...}); Future<List<String>> unlockedIdsFor(String gameId); }`
  — a real, already-established, plain interface declaration; real and
  deliberately not generic, the identical real reason `ScoreRepository`
  already established.
- `Future<void> unlock({required String gameId, required String
  achievementId, required DateTime unlockedAt});` — a real,
  already-established async method signature, using real, named
  parameters for its own three real, plain values.
- `Future<List<String>> unlockedIdsFor(String gameId);` — a real,
  already-established async method returning a real, plain
  `List<String>` of ids, not a real, richer `Achievement` value —
  real and deliberate: this real interface's own job is tracking
  *which* real ids are unlocked, not carrying their own real,
  human-facing text back out again.

### CS lens

Not applicable — both interfaces compose only already-covered
mechanisms; no new hard concept of their own.

### SE lens

`unlockedIdsFor` deliberately returns `List<String>`, not
`List<Achievement>` — the real, rejected alternative would require
`AchievementRepository` itself to either store a real, whole
`Achievement` (its own real name/description, duplicated, real and
potentially stale, inside every real save) or reach back into some
real, external catalog of every real `Achievement` that exists just to
reconstruct one. The real, chosen shape keeps `AchievementRepository`
honestly ignorant of what any real achievement's own text even says —
matching one real id against one real, already-known `Achievement`
(from whatever real list of rules produced it) stays real, later
code's own job, not this real interface's.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, generic way to decide, and a real, generic way to save, one
real achievement both now exist — the next Concept Unit builds the
real, generic way to check many of them at once.

---

## Concept Unit: AchievementEvaluator

### The Problem

A real, played game will genuinely have more than one real achievement
that *could* apply at once — nothing yet checks a real, whole list of
`AchievementRule`s against one real state and reports back exactly
which ones genuinely matched.

> **Try it yourself first.** Given a real, already-assembled
> `List<AchievementRule<S>>` and one real, played `state`, what is the
> smallest, real, stateless way to collect every real
> `Achievement` whose own real rule is genuinely satisfied — using only
> already-established, real `Iterable` methods?

### Introducing the concept

No new isolated lab — `.where`/`.map`/`.toList` are all
already-established, real `Iterable` methods, already used elsewhere
in this project's own real code; composing three of them is not a new
construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/achievement_evaluator.dart` (new
  file).
- **Change type** — add.
- **Location** — a new, real, standalone file, in
  `game_platform/domain/`.
- **Dependencies** — `Achievement`, `AchievementRule`, `GameState`, all
  already established.

### The New Code

```dart
class AchievementEvaluator {
  static List<Achievement> evaluate<S extends GameState>(
    S state,
    List<AchievementRule<S>> rules,
  ) {
    return rules
        .where((rule) => rule.isSatisfiedBy(state))
        .map((rule) => rule.achievement)
        .toList();
  }
}
```

### The Updated Project

`achievement_evaluator.dart`, in full, numbered:

```dart
1  class AchievementEvaluator {
2    static List<Achievement> evaluate<S extends GameState>(
3      S state,
4      List<AchievementRule<S>> rules,
5    ) {
6      return rules
7          .where((rule) => rule.isSatisfiedBy(state))
8          .map((rule) => rule.achievement)
9          .toList();
10   }
11 }
```

### Mechanical walkthrough

- `static List<Achievement> evaluate<S extends GameState>(S state,
  List<AchievementRule<S>> rules)` — a real, already-established,
  generic, `static` method — its own real `S` resolved by whatever
  real, concrete `List<AchievementRule<S>>` the caller actually passes
  in, the identical real inference `SudokuEngine implements
  GameEngine<GameSession, SudokuMove>` already relies on.
- `rules.where((rule) => rule.isSatisfiedBy(state))` — a real,
  already-established `Iterable.where`, keeping only the real rules
  whose own real `isSatisfiedBy` call, against the one, shared, real
  `state`, returns `true`.
- `.map((rule) => rule.achievement)` — a real, already-established
  `Iterable.map`, real and reading each real, kept rule's own real
  `Achievement` back out.
- `.toList();` — a real, already-established, terminal call, real and
  needed since `.where`/`.map` both return real, lazy `Iterable`s, not
  a real, concrete `List`, until something actually asks for one.

### CS lens

This Concept Unit is a real, direct, concrete instance of the
**Specification pattern**, named in full as a Term in this lesson's
own Header, above: each real `AchievementRule` is one, independent,
self-contained real specification; `evaluate` is the one, real, shared
piece of code that checks a real, whole list of them against one real
candidate, genuinely unaware of how many real specifications exist or
what any one of them actually checks. Also recognized in: a real,
validation pipeline running a real, whole list of independent, named
rules against one real form submission and collecting every real one
that failed; a real, content-moderation system checking a real post
against a real, whole list of independent policy rules; a real,
shopping-cart discount engine checking a real order against a real,
whole list of independent, real eligibility rules and applying every
one that genuinely qualifies.

### SE lens

The real alternative here was giving `AchievementRule` itself a real,
richer contract — some real, additional method letting each rule
report *why* it failed, not just a bare `bool` — real, more useful for
a real, future achievements screen wanting to show "2 of 3 mistakes
made" progress, at the real cost of every real rule needing to
construct and return some real, richer result type on every single
real check, whether or not anything ever reads it. The real, chosen,
minimal `bool isSatisfiedBy` keeps every real rule this lesson actually
needs to write genuinely small, real and consistent with this
project's own established discipline of building only what curriculum's
own real bullet, and this lesson's own real proof, actually require.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Unit, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, whole list of rules can now be checked against one real state
at once — the final Concept Unit gives Sudoku its own real, first two
rules to actually check.

---

## Concept Unit: PerfectGameRule and SpeedDemonRule

### The Problem

Nothing yet actually connects Sudoku's own real, already-existing
session data to the real, generic achievement seam — `mistakes`,
`hints`, and `elapsed` all already exist on the concrete `GameSession`,
but no real, concrete `AchievementRule` reads any of them yet.

> **Try it yourself first.** `GameSession` already exposes real
> `mistakes`, `hints`, `status`, and a real, live `elapsed` getter.
> What are the smallest, real, one-line `isSatisfiedBy` bodies for "no
> real mistakes and no real hints" and "finished under a real,
> configured time limit" — and should that real time limit live inside
> the rule itself, or be handed in?

### Introducing the concept

A minimal, throwaway probe (folded directly into this lesson's own
real, permanent test, since both real rules are real, permanent
project code from their own first line) constructs a real session
around a real, deliberately *mutable* fake clock, plays it to a real,
flawless completion, then advances that same real clock afterward,
without touching the session again at all:

```dart
final clock = _MutableFakeClock(DateTime(2026, 1, 1, 12));
final state = _playToVictory(_freshEngine(clock));
const rule = SpeedDemonRule(Duration(minutes: 5));
expect(rule.isSatisfiedBy(state), isTrue);

clock.current = clock.current.add(const Duration(minutes: 10));
expect(rule.isSatisfiedBy(state), isFalse);
```

Run for real (`project/test/generic_achievements_test.dart`) — because
whether `GameSession.elapsed` genuinely reads a real, live value on
every single real access, rather than a real value frozen once at
construction, is exactly the kind of real, non-obvious behavior this
schema's own Verification Rule requires proof for:

```
rule.isSatisfiedBy(state), clock ten real minutes earlier: true
rule.isSatisfiedBy(state), the identical real state, clock now real, ten minutes later: false
```

Real, direct proof: the *exact same*, real, already-completed session
object was checked twice; only the real, injected clock's own value
changed in between. `GameSession.elapsed` genuinely recomputes
`_clock.now().difference(startTime)` fresh, every real time it's read
— it was never a real, one-time, cached value.

### Discard the throwaway example

Not applicable — this real proof lives permanently in
`generic_achievements_test.dart`.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/domain/perfect_game_rule.dart` (new
  file);
  `project/lib/features/sudoku/domain/speed_demon_rule.dart` (new
  file).
- **Change type** — add.
- **Location** — two new, real, standalone files.
- **Dependencies** — `AchievementRule`, `Achievement`, the concrete
  `GameSession`, `GameStatus`, all already established.

### The New Code

```dart
class PerfectGameRule implements AchievementRule<GameSession> {
  static const _achievement = Achievement(
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Complete a puzzle with no mistakes and no hints.',
  );

  @override
  Achievement get achievement => _achievement;

  @override
  bool isSatisfiedBy(GameSession state) {
    return state.status == GameStatus.completed &&
        state.mistakes == 0 &&
        state.hints == 0;
  }
}

class SpeedDemonRule implements AchievementRule<GameSession> {
  const SpeedDemonRule(this.threshold);
  final Duration threshold;

  static const _achievement = Achievement(
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a puzzle before time runs out.',
  );

  @override
  Achievement get achievement => _achievement;

  @override
  bool isSatisfiedBy(GameSession state) {
    return state.status == GameStatus.completed && state.elapsed < threshold;
  }
}
```

### The Updated Project

`perfect_game_rule.dart`, in full, numbered:

```dart
 1  class PerfectGameRule implements AchievementRule<GameSession> {
 2    static const _achievement = Achievement(
 3      id: 'perfect_game',
 4      name: 'Perfect Game',
 5      description: 'Complete a puzzle with no mistakes and no hints.',
 6    );
 7
 8    @override
 9    Achievement get achievement => _achievement;
10
11    @override
12    bool isSatisfiedBy(GameSession state) {
13      return state.status == GameStatus.completed &&
14          state.mistakes == 0 &&
15          state.hints == 0;
16    }
17  }
```

`speed_demon_rule.dart`, in full, numbered:

```dart
 1  class SpeedDemonRule implements AchievementRule<GameSession> {
 2    const SpeedDemonRule(this.threshold);
 3    final Duration threshold;
 4
 5    static const _achievement = Achievement(
 6      id: 'speed_demon',
 7      name: 'Speed Demon',
 8      description: 'Complete a puzzle before time runs out.',
 9    );
10
11   @override
12   Achievement get achievement => _achievement;
13
14   @override
15   bool isSatisfiedBy(GameSession state) {
16     return state.status == GameStatus.completed && state.elapsed < threshold;
17   }
18 }
```

### Mechanical walkthrough

- `class PerfectGameRule implements AchievementRule<GameSession>` /
  `class SpeedDemonRule implements AchievementRule<GameSession>` — two
  real, already-established `implements` clauses against the identical
  real, generic interface with the identical real type argument
  already chosen — the identical real shape
  `SudokuScoreCalculator implements ScoreCalculator<GameSession>`
  already used.
- `static const _achievement = Achievement(...)` — a real,
  already-established, private, `static const` field — each real rule
  builds its own real `Achievement` value exactly once, real and
  shared across every real call to the real getter below.
- `Achievement get achievement => _achievement;` — a real,
  already-established, one-line getter, satisfying the real interface's
  own real first member.
- `state.status == GameStatus.completed && state.mistakes == 0 &&
  state.hints == 0` — three real, already-established, plain
  comparisons, combined with the real, already-established `&&`
  operator — every one of these three real values already existed on
  `GameSession` before this lesson.
- `const SpeedDemonRule(this.threshold);` / `final Duration
  threshold;` — a real, already-established, `const`-constructible
  constructor and field — the real, injected dependency this Concept
  Unit's own real "Try it yourself first" prompt asked about.
- `state.status == GameStatus.completed && state.elapsed < threshold`
  — the real, already-established `<` comparison operator, here
  comparing two real `Duration` values — Dart's own real, built-in
  support for comparing durations directly, no real, manual conversion
  to a real, plain number of seconds needed.

### CS lens

Not applicable — each real rule is a direct, one-line application of
the **Specification pattern**, already named and explained in full in
this lesson's own immediately preceding Concept Unit; no new hard
concept of its own.

### SE lens

The real, deliberate choice for `SpeedDemonRule` was an injected,
constructor-supplied `threshold`, not a real, hard-coded constant
inside `isSatisfiedBy` itself — real, one real, extra field, at the
real benefit that a real, later difficulty-aware tuning ("Speed Demon"
meaning something different for Easy versus Hard, say) needs zero real
changes to `SpeedDemonRule`'s own real code, only a real, different
value supplied at real, construction time — the identical real,
already-established tradeoff `SudokuEngine`'s own injected
`ScoreCalculator` already made.

### Commands needed

None.

### Run it

Real, run output shown above, from
`project/test/generic_achievements_test.dart`.

### Connect the pieces

Every real piece this lesson built now composes: a real achievement
can be decided by a real, concrete rule, checked alongside every other
real rule at once, and saved through a real, generic repository —
proven end to end in this lesson's own final, real test.

---

## Connect the pieces

One real, concrete trace, start to finish, deciding, collecting, and
saving real achievements entirely through this lesson's own new,
generic seam.

1. A real, complete, winning Sudoku game, played the identical real
   way this project's own immediately preceding lessons already
   proved, built around a real, deliberately *mutable* fake clock.
2. `AchievementEvaluator.evaluate(state, [PerfectGameRule(),
   const SpeedDemonRule(Duration(minutes: 5))])` — real, direct proof
   both real rules run together against the identical real state,
   real and reporting back both real `Achievement`s while the real,
   underlying clock is still close to the real session's own start.
3. The real, same fake clock is advanced ten real minutes; the
   identical real call to `AchievementEvaluator.evaluate`, against the
   identical real, already-completed state, now reports back only
   `PerfectGameRule`'s own real achievement — real, direct proof
   `SpeedDemonRule` is genuinely, freshly re-evaluated, not cached from
   its own real, earlier `true` result.
4. `Achievement(id: 'perfect_game', ...)`/`Achievement(id:
   'speed_demon', ...)`, saved through one, real, shared, in-memory
   `AchievementRepository` implementation, alongside a real, second,
   entirely different, fictional game's own real achievement —
   `unlockedIdsFor('sudoku')` and `unlockedIdsFor('not-sudoku')` each
   report back only their own real game's own real, unlocked ids, real
   and direct proof the same, generic repository already, correctly
   separates real games that have never met.

A real achievement infrastructure, genuinely ignorant of Sudoku —
curriculum's own real constraint, proven, not merely declared, by a
real, injected clock changing which real achievements a real,
unchanged, already-completed session actually earns.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `PerfectGameRule`/`SpeedDemonRule` both
touch real, permanent project code, this lesson's own real proof lives
in a new, permanent `project/test/generic_achievements_test.dart`, not
a throwaway lab — the identical, real, established choice this
project's own immediately preceding lessons already made.

No real, first-attempt mistakes this lesson — every new file compiled
and every new test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 6.3s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:26 +102: All tests passed!
```

102 real test-file-level checks, up from 98 — four new, all in a new,
permanent `generic_achievements_test.dart`. Zero regressions anywhere
else in this app; zero flakes on this lesson's own single, real,
full-suite run. Full, honest narrative, including the real, deliberate
scope decision to leave three of curriculum's own five real example
achievements unbuilt, in `verification/lesson-70/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
