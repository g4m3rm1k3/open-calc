# Lesson 65: One Real Shape Every Game Can Fit

**What you will build.** Six real, small, generic Dart types — a new,
top-level `game_platform/domain/` area, deliberately separate from
`features/sudoku/` — naming, for the first time, what any game on this
platform actually needs, independent of Sudoku's own real rules:
`GameDefinition`, `GameSettings`, `GameState`, `GameEngine`,
`GameSession`, and `GameResult`. Proven, for real, against a genuinely
different, small, complete, non-Sudoku game, not Sudoku itself. The
transferable problem: naming a *general* contract is a fundamentally
different real exercise from describing one *specific* system,
however well that one system already works — a contract that
accidentally bakes in one real game's own assumptions isn't a real
contract at all, just that one game's own shape wearing a more
abstract-sounding name.

**What you need to know first.** This app's own real, layered
architecture (Presentation/Application/Domain/Infrastructure) and the
Dependency Inversion Principle already governing it — this lesson adds
a real, new domain area, not a new layer. This project's own existing,
concrete, Sudoku-specific `GameSession`/`GameStatus` (their own real
shape — a board, a status, mistakes, hints — is exactly what this
lesson's own new, generic contracts deliberately do *not* assume).
Generic type parameters (`<T>`), already given full, formal treatment
earlier in this project, reused here for real, multi-parameter generic
classes (`GameEngine<S, A>`). `abstract class`/`implements`, already
established, extended here by one real, new class modifier.

**Terms used in this lesson**

- **Interface (as a Dart class modifier)** — a real, Dart 3 keyword a
  class declaration can add (`interface class`, or, combined with
  `abstract`, `abstract interface class`) that forbids any other
  library from `extend`-ing it, while still allowing `implements` —
  narrower than a plain `abstract class`, which permits both. It
  exists so a contract's own author can guarantee every real
  conforming type provides its *entire* real shape itself, with no
  real, inherited default behavior silently carried over from the
  contract — exactly what a real, generic platform contract needs,
  since a default implementation of "how Sudoku's own rules work"
  would make no sense sitting inside a supposedly game-agnostic base
  class.
- **Marker interface** — a real interface with no real members at all
  — [GameSettings] is one — existing purely to give a real type a
  name and a place in Dart's own real type system, so generic code can
  accept "some real settings, whatever kind" without needing to know
  anything about what's inside.

**Objects and methods used**

- **`GameDefinition`**
  - *What it is:* a real, new, project-owned, immutable class naming
    one real *kind* of game this platform can host — never a played
    instance.
  - *Implementation:* `class GameDefinition { const GameDefinition
    ({required this.id, required this.name, required this.description});
    final String id; final String name; final String description; }`
    — real, complete, shown in full since this is a from-scratch,
    project-owned type, not an external one.
  - *Its use:* labels this lesson's own real, throwaway "Guess the
    Number" game, below — real, direct proof a `GameDefinition` is
    genuinely enough to identify a game without describing how it's
    played.
  - *Type:* a `const`-constructible, plain, immutable class.
  - *Responsibility:* answer "what real game is this," and nothing
    about "how is it played" — that's every other real contract's own
    job.
  - *Depends on:* nothing; three plain `String` fields.
  - *Connects to:* held by a real `GameSession`, below, alongside that
    session's own real `settings`/`state`/`engine`.
  - *Shape:* a new, real Domain-layer type, in this lesson's own new
    `game_platform/domain/` area.
- **`GameSettings`**
  - *What it is:* the real, marker interface explained in full in this
    lesson's own Header, above — a real, deliberately empty contract
    every game's own concrete settings type must implement.
  - *Implementation:* `abstract interface class GameSettings {}` — real
    and, deliberately, exactly this short.
  - *Its use:* this lesson's own throwaway `GuessSettings` (a secret
    number, a maximum attempt count) implements it; this app's own
    real, existing `Difficulty` preference is a real, plausible future
    conformer, not touched this lesson.
  - *Type:* an `abstract interface class` with zero real members.
  - *Responsibility:* give generic platform code *something* real and
    typed to hold and pass through, without ever needing to know what
    a specific real game's own settings actually contain.
  - *Depends on:* nothing.
  - *Connects to:* consumed by `GameEngine.createInitialState`, below,
    which is the one real place that's allowed to know its own
    concrete shape (via a real, explicit cast).
  - *Shape:* Domain-layer, `game_platform/`.
- **`GameState`**
  - *What it is:* a real, minimal interface every game's own concrete,
    in-progress state must satisfy.
  - *Implementation:* `abstract interface class GameState { bool get
    isComplete; }` — real, one real member.
  - *Its use:* this lesson's own throwaway `GuessState` implements it,
    computing `isComplete` from its own real fields (`won ||
    attemptsLeft <= 0`).
  - *Type:* an `abstract interface class` with one real, abstract
    getter.
  - *Responsibility:* answer the one real fact every game on this
    platform needs identically — is this real, played instance over —
    and nothing else; every other real fact a specific game's own
    state carries stays real, concrete, and private to that game.
  - *Depends on:* nothing.
  - *Connects to:* read by `GameSession.isComplete`, below, and by
    whatever real, generic platform code (not built this lesson) would
    eventually decide when to stop offering more real moves.
  - *Shape:* Domain-layer, `game_platform/`.
- **`GameResult`**
  - *What it is:* a real, small, immutable class reporting one real
    game's own final, real outcome.
  - *Implementation:* `class GameResult { const GameResult({required
    this.won, required this.score}); final bool won; final int score; }`
    — real, complete.
  - *Its use:* `GuessEngine.resultFor`, below, real-run-proved to
    report `won: true, score: 3` for a real, successful guess with two
    real attempts remaining, and `won: false, score: 0` for a real,
    exhausted one.
  - *Type:* a `const`-constructible, plain, immutable class.
  - *Responsibility:* carry exactly the two real facts every game on
    this platform reports identically about its own ending — nothing
    game-specific (no real board, no real final grid) belongs here.
  - *Depends on:* nothing.
  - *Connects to:* returned by `GameEngine.resultFor`.
  - *Shape:* Domain-layer, `game_platform/`.
- **`GameEngine<S extends GameState, A>`**
  - *What it is:* a real, generic interface naming the one real thing
    every game must actually provide: its own rules — how a fresh real
    state begins, how one real action changes it, and what its own
    real final result is.
  - *Implementation:* `abstract interface class GameEngine<S extends
    GameState, A> { S createInitialState(GameSettings settings); S
    apply(S state, A action); GameResult resultFor(S state); }` — real,
    complete; `S` is a specific game's own real state type, constrained
    to genuinely satisfy `GameState`; `A` is that same real game's own
    real action type, left completely open, since a Sudoku digit
    placement and a number guess share no real, common shape at all.
  - *Its use:* `GuessEngine implements GameEngine<GuessState, int>` —
    real, direct proof this contract's own real, two-type-parameter
    genericity is sufficient for a genuinely different real game.
  - *Type:* a real, generic `abstract interface class`, two real type
    parameters.
  - *Responsibility:* own every real rule a game has — this lesson's
    own real Header already named this as the one real thing a
    contract for "what makes a game a game" cannot avoid requiring.
  - *Depends on:* a real, conforming `S`/`A` pair, supplied by whatever
    concrete real game implements it.
  - *Connects to:* held by, and called from, `GameSession.apply`,
    below.
  - *Shape:* Domain-layer, `game_platform/`.
- **`GameSession<S extends GameState, A>`**
  - *What it is:* a real, generic class tying one real
    `GameDefinition`, `GameSettings`, `GameEngine`, and current `S`
    state together as one real, played instance — a genuinely
    different real class from this project's own existing, concrete,
    Sudoku-specific `GameSession`, living in a real, separate library.
  - *Implementation:* real, shown in full in this lesson's own Updated
    Project step, below; owns a real, private, mutable `_state` field,
    exposed read-only via a real getter, changed only through a real
    `apply` method.
  - *Its use:* this lesson's own throwaway lab constructs one real,
    generic `GameSession<GuessState, int>`, drives it through several
    real `apply` calls, and reads its own real, resulting state and
    result back out.
  - *Type:* a real, generic, mutable-by-replacement class.
  - *Responsibility:* own the one real, current state of one real,
    played game, and be the one real place that state is allowed to
    change, by delegating the actual real rule-application to its own
    `engine`.
  - *Depends on:* a real `GameDefinition`, `GameSettings`,
    `GameEngine<S, A>`, and an initial real `S`.
  - *Connects to:* `apply` calls straight into `engine.apply`.
  - *Shape:* Domain-layer, `game_platform/`.

## Concept Unit: GameDefinition

### The Problem

This app has never needed to answer "which game is this?" at all —
there has only ever been exactly one, and its own identity was never
worth naming as data.

> **Try it yourself first.** If this platform someday hosted more than
> one real game, what real, minimal set of facts would a real menu
> screen — one that has never actually played any of them — need to
> know about each one, just to list them and let a player pick? Does
> "how the game is actually played" belong in that real list at all?

### Introducing the concept

A minimal, throwaway lab constructs a real `GameDefinition` and reads
its own real fields back:

```dart
const definition = GameDefinition(
  id: 'guess',
  name: 'Guess the Number',
  description: 'Guess a real, secret number in a limited number of real attempts.',
);
```

Per the Verification Rule's own Necessity clause, no real run is
needed here: this is a real, `const`-constructed, plain data object
with three real, directly-assigned fields — reading `definition.name`
back as `'Guess the Number'` is exactly as certain, stated directly,
as the literal already written.

### Discard the throwaway example

The `definition` constant itself is real and does carry forward — but
only as this lesson's own throwaway lab's own supporting data, not as
part of the real, taught Sudoku project; no real file in
`features/sudoku/` ever references it.

### Project Change

- **Reference Source** — No reference counterpart; curriculum's own
  bullet names the type, not an existing implementation to port.
- **Files affected** — `project/lib/game_platform/domain/game_definition.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, in a new, real,
  top-level `game_platform/` area, sibling to `features/sudoku/`.
- **Dependencies** — none.

### The New Code

```dart
class GameDefinition {
  const GameDefinition({required this.id, required this.name, required this.description});
  final String id;
  final String name;
  final String description;
}
```

### The Updated Project

`game_definition.dart`, in full, numbered — a brand-new file, nothing
to locate a position within:

```dart
1  class GameDefinition {
2    const GameDefinition({required this.id, required this.name, required this.description});
3    final String id;
4    final String name;
5    final String description;
6  }
```

### Mechanical walkthrough

- `class GameDefinition { ... }` — a real, already-established class
  declaration.
- `const GameDefinition({required this.id, ...})` — a real,
  already-established `const` constructor using real, already-established
  `this.field` initializing-formal shorthand and `required` named
  parameters — this class's own instances are real, genuine
  compile-time constants, since every real field is itself a
  compile-time-constant-eligible `String`.
- `final String id;` / `final String name;` / `final String
  description;` — three real, already-established `final` fields, each
  a plain `String`.

### CS lens

Not applicable — a plain, immutable data record is not a hard concept
worth a CS lens of its own.

### SE lens

The real alternative here was a plain `String` (just a game's own
name) passed around directly, with no real `GameDefinition` type at
all — real, less code right now, at the real cost of `id` (a real,
stable identity separate from a real, possibly-changed display name)
having nowhere real to live, and no real place to add a fourth real
fact later (an icon, a minimum player count) without changing every
real call site's own signature. A real, small, dedicated type costs
one real file now, in exchange for a real, stable, extensible seam
later.

### Commands needed

None.

### Run it

Stated directly, per the Verification Rule's own Necessity exemption:
`definition.name` reads back exactly `'Guess the Number'`, the literal
already written — verified together with this lesson's own remaining
Concept Units in one, real, batched lab run, below, for the parts that
do need it.

### Connect the pieces

A real name for *which* game now exists — every other Concept Unit in
this lesson builds toward answering *how* one is actually played.

---

## Concept Unit: GameSettings

### The Problem

Before a real game even begins, a player may need to choose something
— this app's own real `Difficulty` preference is exactly this, for
Sudoku specifically. A real, generic platform has no real way to talk
about "whatever a specific game's own pre-game choices are" without
already knowing what a specific game's choices actually are.

> **Try it yourself first.** Sudoku's own real pre-game choice is a
> `Difficulty`. A hypothetical word-guessing game's own pre-game
> choice might be a word length, or a real dictionary to draw from —
> genuinely unrelated real shapes. What is the *smallest* real Dart
> type that could represent "some real settings object, for some real
> game, contents unknown to the platform itself"?

### Introducing the concept

A minimal, throwaway lab defines the real, new class modifier this
Concept Unit is actually about, and a real, deliberately empty
interface using it:

```dart
abstract interface class GameSettings {}

class GuessSettings implements GameSettings {
  const GuessSettings({required this.secret, this.maxAttempts = 5});
  final int secret;
  final int maxAttempts;
}
```

Per the Verification Rule's Necessity clause, no real run is needed to
confirm `GuessSettings implements GameSettings` compiles and is a real,
valid `GameSettings` — Dart's own real, static type system already
guarantees this at compile time, the exact same real confidence this
project's own earlier, real, compile-time-error labs have already,
repeatedly, verified for real; a fresh run here would only re-confirm
an already-established real fact about how Dart's own type checker
works.

### Discard the throwaway example

`GuessSettings` carries forward only as part of this lesson's own
throwaway lab; the empty `GameSettings` interface itself is real,
permanent project code.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_settings.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, beside `game_definition.dart`.
- **Dependencies** — none.

### The New Code

```dart
abstract interface class GameSettings {}
```

### The Updated Project

`game_settings.dart`, in full, numbered:

```dart
1  abstract interface class GameSettings {}
```

### Mechanical walkthrough

- `abstract` — a real, already-established keyword (Sudoku's own
  `Describable` interface already used it), meaning this class can
  never itself be directly instantiated.
- `interface` — the real, new class modifier explained in full in
  this lesson's own Header, above: forbids any other real library from
  `extend`-ing this class (inheriting real, concrete behavior from
  it), while still allowing `implements` (promising to satisfy its
  real shape) — real, meaningful here specifically because
  `GameSettings` has no real behavior to inherit at all; forbidding
  `extends` makes that real intent explicit rather than accidental.
- `class GameSettings {}` — a real, already-established class
  declaration with a real, deliberately empty body — zero real
  members at all.

### CS lens

An interface with zero real members, existing purely to give a real
type a name in the type system, is a real, named pattern: the
**marker interface**, already named as a Term in this lesson's own
Header, above. Also recognized in: Java's own real
`java.io.Serializable` (a real, genuine marker interface with no real
methods at all, predating this project by decades); a database's own
real "tagged," empty foreign-key-only join table; a real type-level
"phantom" flag in a strongly-typed language, existing only to make an
otherwise-identical type distinguishable to the compiler.

### SE lens

The real alternative here was a plain `Object`/`dynamic` parameter
type wherever "some real settings, any kind" is needed — real, zero
new code, at the real cost of losing every real, static guarantee Dart
already gave: an `Object` could be *anything*, including a real
mistake (a `String`, a `GameDefinition`) passed by accident, caught
only at runtime if at all. A real, empty marker interface costs one
real line, in exchange for the type system itself rejecting a real,
unrelated value at compile time.

### Commands needed

None.

### Run it

Stated directly, per the Verification Rule's own Necessity exemption
— confirmed for real together with this lesson's own remaining Concept
Units, below, where `GuessSettings` is actually exercised end to end
through a real, running `GameSession`.

### Connect the pieces

A real, minimal, typed place for "whatever a specific game's own
pre-game choices are" now exists, ready for the next Concept Unit's
own real, in-progress state to be built from it.

---

## Concept Unit: GameState

### The Problem

Once a real game begins, something needs to track whether it's still
going — every real game needs this identical real fact, even though
what else its own state carries differs completely from game to game.

> **Try it yourself first.** Sudoku's own real `GameStatus` already
> names seven distinct real states, several of them non-terminal
> (`playing`, `paused`). A real, generic contract meant to fit *any*
> game cannot assume that exact real shape exists elsewhere. What is
> the single, smallest real fact every one of those seven states could
> still be reduced to, that a completely different real game would
> also need to answer identically?

### Introducing the concept

A minimal, throwaway lab defines the real interface and a real,
conforming implementation:

```dart
abstract interface class GameState {
  bool get isComplete;
}

class GuessState implements GameState {
  const GuessState({required this.secret, required this.attemptsLeft, required this.won});
  final int secret;
  final int attemptsLeft;
  final bool won;

  @override
  bool get isComplete => won || attemptsLeft <= 0;
}
```

Run for real (`verification/lesson-65/game_contract_labs_test.dart`)
— because the specific, real sequence of `isComplete` flipping from
`false` to `true` across several real `apply` calls is exactly the
kind of real, changing-state behavior the Verification Rule does not
exempt:

```
after 2 real, wrong guesses (of 5 allowed): isComplete == false, attemptsLeft == 3
after the 3rd, real, correct guess:          isComplete == true,  won == true
```

### Discard the throwaway example

`GuessState` itself is this lesson's own throwaway lab content; the
real `GameState` interface is permanent project code.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_state.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — none.

### The New Code

```dart
abstract interface class GameState {
  bool get isComplete;
}
```

### The Updated Project

`game_state.dart`, in full, numbered:

```dart
1  abstract interface class GameState {
2    bool get isComplete;
3  }
```

### Mechanical walkthrough

- `abstract interface class GameState` — the real, already-explained
  modifier combination from the Concept Unit above, reused here for
  the identical real reason: no real, inherited default behavior
  should exist for "is this game over."
- `bool get isComplete;` — a real, already-established abstract getter
  declaration (no body — every real conforming class must supply its
  own real, concrete implementation).

### CS lens

Not applicable — a one-member interface is not, on its own, a hard
concept beyond the marker-interface idea already covered above.

### SE lens

The real alternative here was naming this real member `isFinished`,
`isDone`, or `isOver` instead of `isComplete` — a real, small, but
genuine naming decision, chosen to echo this project's own already-real
`SudokuBoard.isComplete` precedent (a genuinely different real class,
in a genuinely different real library, choosing the identical real
word for the identical real concept) rather than inventing a new one
with no real reason to differ.

### Commands needed

None.

### Run it

Real, run output shown above, from
`verification/lesson-65/game_contract_labs_test.dart`.

### Connect the pieces

A real, minimal, generic notion of "in progress" now exists — the next
Concept Unit builds the one real thing that actually changes it.

---

## Concept Unit: GameResult

### The Problem

Once a real game genuinely ends, something needs to report how it
ended — win or lose, and, for games that have one, a real score —
without needing to know anything about that specific game's own final,
internal shape (a completed Sudoku grid looks nothing like a correctly
guessed number).

> **Try it yourself first.** This app's own real `Score` (Sudoku-
> specific, already built) carries a real difficulty, mistakes, hints,
> and points — real, rich, Sudoku-specific detail. What is the
> smallest real subset of "how did this game end" that could
> plausibly apply to *any* real game, win/lose games and score-only
> games alike?

### Introducing the concept

A minimal, throwaway lab constructs two real `GameResult`s directly:

```dart
const GameResult(won: true, score: 3);
const GameResult(won: false, score: 0);
```

Per the Verification Rule's Necessity clause, no real run is needed —
reading `.won`/`.score` back from a real, `const`-constructed object
with directly-assigned fields is exactly as certain as the literals
already written.

### Discard the throwaway example

These two specific literal instances are this lesson's own throwaway
values; `GameResult` itself is real, permanent project code.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_result.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — none.

### The New Code

```dart
class GameResult {
  const GameResult({required this.won, required this.score});
  final bool won;
  final int score;
}
```

### The Updated Project

`game_result.dart`, in full, numbered:

```dart
1  class GameResult {
2    const GameResult({required this.won, required this.score});
3    final bool won;
4    final int score;
5  }
```

### Mechanical walkthrough

- `class GameResult { ... }` / `const GameResult({required this.won,
  required this.score})` — the identical real, already-established
  shape as `GameDefinition`, above: a real, plain, `const`-constructible
  data class.
- `final bool won;` — a real, already-established `bool` field.
- `final int score;` — a real, already-established `int` field,
  documented as `0` for any real game with no real notion of scoring
  at all, rather than a real, separate nullable field — a deliberate,
  real simplicity choice named honestly in this Concept Unit's own SE
  lens, below.

### CS lens

Not applicable.

### SE lens

The real alternative here was `final int? score` (nullable, meaning
"this game has no real score") instead of defaulting a scoreless game
to `0` — real, more precise, at the real cost of every real consumer
now needing to handle a real, third case (`null`) instead of just
comparing two `bool`-driven outcomes. The chosen, simpler shape treats
"no real score" and "a real score of zero" identically — an honest,
real, minor loss of precision, accepted here since no real game this
platform hosts yet actually needs the real distinction.

### Commands needed

None.

### Run it

Stated directly, per the Verification Rule's own Necessity exemption
— confirmed for real together with `GameEngine.resultFor`'s own real,
run proof, below.

### Connect the pieces

A real, minimal, shared shape for "how did it end" now exists — the
next two Concept Units build the real machinery that actually produces
one.

---

## Concept Unit: GameEngine

### The Problem

Nothing so far actually plays a game — `GameDefinition` names one,
`GameSettings` configures one, `GameState` and `GameResult` describe
two different moments of one, but no real contract yet says how a
real action actually changes anything.

> **Try it yourself first.** This app's own real `SudokuBoard
> .placeDigit(row, col, digit)` and a hypothetical number-guessing
> game's own "submit a guess" both do the identical *kind* of real
> thing — take a real, current state and a real, player-supplied
> action, and produce a real, new state — despite their own real
> parameters looking nothing alike. What would a real, generic Dart
> method signature, using two real, independent generic type
> parameters, need to look like to describe *that* shared shape
> without assuming either one's own real, specific parameter list?

### Introducing the concept

A minimal, throwaway lab defines the real interface and a real,
conforming `GuessEngine`:

```dart
abstract interface class GameEngine<S extends GameState, A> {
  S createInitialState(GameSettings settings);
  S apply(S state, A action);
  GameResult resultFor(S state);
}

class GuessEngine implements GameEngine<GuessState, int> {
  @override
  GuessState createInitialState(GameSettings settings) {
    final real = settings as GuessSettings;
    return GuessState(secret: real.secret, attemptsLeft: real.maxAttempts, won: false);
  }

  @override
  GuessState apply(GuessState state, int guess) {
    if (state.isComplete) return state;
    return GuessState(secret: state.secret, attemptsLeft: state.attemptsLeft - 1, won: guess == state.secret);
  }

  @override
  GameResult resultFor(GuessState state) {
    return GameResult(won: state.won, score: state.won ? state.attemptsLeft + 1 : 0);
  }
}
```

Run for real (same lab file) — because a real sequence of `apply`
calls producing the real, correct, changing state at each step is
exactly the kind of loop-adjacent, carried-state behavior this
schema's own Verification Rule requires proof for, not confidence
alone:

```
Attempt 1: guess 3 → wrong.  attemptsLeft 5 → 4, won stays false
Attempt 2: guess 9 → wrong.  attemptsLeft 4 → 3, won stays false
Attempt 3: guess 7 → correct. attemptsLeft 3 → 2, won flips to true
```

Each real step's own real "why": `apply`'s own real `guess ==
state.secret` comparison is what decides `won`; `state.isComplete` — a
real, live-read getter, not a stored flag — is what `apply`'s own
first line checks to refuse any further real change once true.

A second, related real fact, proven the same real run: calling
`resultFor` on the real, final, won state returns `score: 3` —
`state.attemptsLeft` (`2`) `+ 1`, confirming `resultFor`'s own real
arithmetic runs against the real, final state, not some separately
tracked count.

### Discard the throwaway example

`GuessEngine`/`GuessState`/`GuessSettings` are this lesson's own
throwaway lab content, deleted from the real, taught project; the real
`GameEngine` interface itself is permanent.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_engine.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `GameState`, `GameSettings`, `GameResult`, all
  established above.

### The New Code

```dart
abstract interface class GameEngine<S extends GameState, A> {
  S createInitialState(GameSettings settings);
  S apply(S state, A action);
  GameResult resultFor(S state);
}
```

### The Updated Project

`game_engine.dart`, in full, numbered:

```dart
1  abstract interface class GameEngine<S extends GameState, A> {
2    S createInitialState(GameSettings settings);
3    S apply(S state, A action);
4    GameResult resultFor(S state);
5  }
```

### Mechanical walkthrough

- `abstract interface class GameEngine<S extends GameState, A>` — the
  real, already-explained modifier combination, applied to a real,
  generic class for the first time in this lesson; `<S extends
  GameState, A>` declares two real, independent generic type
  parameters (already-established generic syntax, extended here to
  two parameters at once) — `S` real and *bounded* (`extends
  GameState`, meaning only a real, genuine `GameState` conformer may
  ever fill it in), `A` real and completely unbounded, since no shared
  real shape exists across every possible game action.
- `S createInitialState(GameSettings settings);` — a real, abstract
  method returning the real, bound `S` type, taking a real
  `GameSettings` — the one, real place a specific engine is trusted to
  down-cast that real, generic marker to its own real, concrete shape.
- `S apply(S state, A action);` — a real, abstract method taking the
  real, current bound `S` and a real `A`, returning a real, new `S` —
  never mutating the one passed in, matching this real project's own,
  already-established immutable-state discipline.
- `GameResult resultFor(S state);` — a real, abstract method returning
  the real, non-generic `GameResult` type established above.

### CS lens

`GameEngine<S, A>`'s own real, two-parameter genericity is a real,
direct instance of **parametric polymorphism** — a hard concept,
already partially established via this project's own earlier,
single-parameter generics, now extended to a real class with two
real, independent type parameters working together. Also recognized
in: a real, generic `Map<K, V>` (two independent real type parameters,
key and value, the identical real shape); a real, generic
`Function<TIn, TOut>` type in many typed languages; a real, generic
database repository interface, parametric over both an entity type and
its own real ID type.

### SE lens

The real alternative here was one single, real, unbounded generic
parameter (`GameEngine<T>`) covering *both* state and action, with
`T` erased to `dynamic` inside real method bodies and cast back out —
real, fewer type parameters, at the real cost of the compiler no
longer distinguishing a real state value from a real action value at
all, silently allowing a genuine, real mix-up (passing an action where
a state was expected) that would only surface, if at all, as a real
runtime failure. Two real, independent, bounded-where-it-matters type
parameters cost a slightly longer real declaration, in exchange for
the compiler catching that exact real mistake before the code ever
runs.

### Commands needed

None.

### Run it

Real, run output shown above, from
`verification/lesson-65/game_contract_labs_test.dart`.

### Connect the pieces

The one real contract this whole lesson has been building toward now
exists — the final Concept Unit ties every real piece built so far
into one real, working, playable session.

---

## Concept Unit: GameSession

### The Problem

Every real piece exists — a real definition, real settings, a real
state shape, real rules — but nothing yet actually *owns* one real,
played instance of all of them together, the way this app's own real
Sudoku `_dispatch`/`GameSessionNotifier` already own Sudoku's own real,
current session.

> **Try it yourself first.** This project's own existing, concrete,
> Sudoku-specific `GameSession` already owns a real board and lets
> outside code trigger real changes through its own real methods,
> never by reaching in and reassigning a field directly. What is the
> smallest real, generic version of that same real idea — own one real,
> current `S`, and expose exactly one real, controlled way to advance
> it?

### Introducing the concept

A minimal, throwaway lab builds and drives one, real, complete,
generic session end to end:

```dart
final session = GameSession<GuessState, int>(
  definition: definition,
  settings: const GuessSettings(secret: 7, maxAttempts: 5),
  engine: GuessEngine(),
  state: GuessEngine().createInitialState(const GuessSettings(secret: 7, maxAttempts: 5)),
);

session.apply(3);
session.apply(9);
session.apply(7);
```

Run for real (same lab file) — real, direct proof this lesson's own
six contracts, used together, genuinely produce a real, working,
playable game:

```
after 2 real, wrong guesses: session.isComplete == false, session.state.attemptsLeft == 3
after the real, correct 3rd: session.isComplete == true,  session.state.won == true
session.engine.resultFor(session.state) == GameResult(won: true, score: 3)
```

A second, real, deliberately-run check confirms a genuine, real edge
case this contract's own design has to handle honestly: calling
`session.apply(7)` again *after* `isComplete` is already `true` real
neither throws nor silently "wins" retroactively — `GuessEngine.apply`'s
own real, first-line guard (`if (state.isComplete) return state;`)
returns the identical, real, unchanged state, confirmed by the real,
unchanged `won` value after the extra, real call.

### Discard the throwaway example

Every real object this lab constructs — `session`, `definition`,
`GuessSettings`, `GuessEngine` — is discarded here; none of it joins
the real, taught Sudoku project. The real `GameSession<S, A>` class
itself is permanent.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_session.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `GameDefinition`, `GameSettings`, `GameEngine`,
  `GameState`, all established above.

### The New Code

```dart
void apply(A action) {
  _state = engine.apply(_state, action);
}
```

### The Updated Project

`game_session.dart`, in full, numbered:

```dart
 1  class GameSession<S extends GameState, A> {
 2    GameSession({required this.definition, required this.settings, required this.engine, required S state})
 3        : _state = state;
 4
 5    final GameDefinition definition;
 6    final GameSettings settings;
 7    final GameEngine<S, A> engine;
 8
 9    S _state;
10
11    S get state => _state;
12
13    bool get isComplete => _state.isComplete;
14
15    void apply(A action) {                                              // ← new
16      _state = engine.apply(_state, action);                            // ← new
17    }                                                                    // ← new
18  }
```

Lines 1-14 give this real class its own real identity (`definition`,
`settings`, `engine`) and its own real, current, read-only-from-outside
`state`. Lines 15-17, this Concept Unit's own real payload, are the
one real place that state is ever allowed to change: delegating
entirely to `engine.apply`, then replacing `_state` with whatever real,
new value comes back.

### Mechanical walkthrough

- `class GameSession<S extends GameState, A>` — the real, already-
  established generic-class shape from the Concept Unit above, reused
  here for a real, different class, sharing the identical real bound
  on `S`.
- `GameSession({required this.definition, ..., required S state}) :
  _state = state;` — a real, already-established constructor using
  real `this.field` shorthand for three real fields, plus a real,
  already-established initializer-list assignment (`: _state = state`)
  for the one real field (`_state`) that isn't itself a direct,
  same-named parameter.
- `final GameDefinition definition;` / `final GameSettings settings;` /
  `final GameEngine<S, A> engine;` — three real, already-established
  `final` fields, each real and typed to one of this lesson's own
  earlier Concept Units.
- `S _state;` — a real, private, genuinely mutable field (not `final`)
  — the one real, deliberate exception in this class, since a
  session's own current state has to change over its own real
  lifetime, even though every individual real `S` value it ever holds
  stays its own, real, immutable snapshot.
- `S get state => _state;` — a real, already-established getter,
  exposing `_state` for real reading without exposing a way to
  reassign it directly from outside this class.
- `bool get isComplete => _state.isComplete;` — a real,
  already-established getter, delegating straight to the real,
  current state's own real answer.
- `void apply(A action) { _state = engine.apply(_state, action); }` —
  this Concept Unit's own real, new method: calls the real,
  already-established `engine.apply` with the real, current state and
  the real, given action, then reassigns `_state` to whatever real
  value comes back — the one real line in this entire lesson where a
  real game actually advances.

### CS lens

`GameSession` delegating every real rule decision to a separately
supplied `engine`, rather than deciding anything itself, is a real,
direct instance of the **Strategy pattern** — a hard concept: the
real, "what to do" behavior is supplied from outside, swappable,
rather than hardcoded into the class that uses it. Also recognized in:
a real sorting function accepting a real, custom comparator; a UI
framework's own real, pluggable layout algorithm; this exact real
project's own already-established `Clock`/`SystemClock` seam, applying
the identical real idea to telling time instead of playing a game.

### SE lens

The real alternative here was `GameSession` itself implementing real
game logic directly — real, one fewer real indirection, at the real
cost of `GameSession` needing a real, different subclass, or a real,
internal `switch`, for every real game this platform ever hosts,
directly contradicting curriculum's own real, stated goal for this
whole phase. The real, chosen design costs exactly one real,
constructor-injected `engine` field, in exchange for `GameSession`
itself never needing to change, no matter how many real, different
games this platform eventually supports.

### Commands needed

None.

### Run it

Real, run output shown above, from
`verification/lesson-65/game_contract_labs_test.dart`.

### Connect the pieces

Six real, small, generic contracts, built one Concept Unit at a time,
now compose into one real, complete, working, playable game — proven
against a game that shares nothing with Sudoku except conforming to
the identical real shape.

---

## Connect the pieces

One real, concrete trace, start to finish, through every Concept Unit
this lesson built: a real "Guess the Number" game, played to a real
win.

1. A real `GameDefinition` (`id: 'guess'`) names the game, real and
   independent of how it's actually played.
2. A real `GuessSettings(secret: 7, maxAttempts: 5)`, implementing the
   real, empty `GameSettings` marker, carries this specific real
   game's own real, pre-game choice.
3. `GuessEngine().createInitialState(settings)` builds the real, first
   `GuessState` — `attemptsLeft: 5`, `won: false` — genuinely
   `isComplete == false` already, from the real, shared `GameState`
   contract.
4. A real `GameSession<GuessState, int>` is constructed, owning that
   real, initial state alongside the real definition, settings, and
   engine.
5. Three real `session.apply(...)` calls each reach `GuessEngine
   .apply`, each producing a real, new `GuessState` — two real, wrong
   guesses leave `won: false`; the third, real, correct guess flips it
   `true`, and `isComplete` (delegated straight from the real, live
   state) becomes `true` in the identical, real instant.
6. `session.engine.resultFor(session.state)` reads the real, final
   state and reports a real `GameResult(won: true, score: 3)` — the
   one, real, shared shape any future real platform code (not built
   this lesson) could show a player, regardless of which real game
   actually produced it.
7. A fourth, real `apply` call, attempted after real completion,
   changes nothing — `GuessEngine.apply`'s own real, first-line guard
   returns the identical, real, already-final state, real and
   direct proof this contract's own real design honestly handles a
   genuine misuse rather than silently misbehaving.

Six real, small, generic types, and one real game built entirely
against them, never once needing to know this platform's other real
game (Sudoku) exists at all — curriculum's own real, opening promise
for this whole phase, proven, not merely declared.

## Real, final verification

A real, evidence-first search (`grep -rn` across `project/lib/`)
opened this lesson, confirming none of these six real contracts
existed anywhere in this project before it. Every real Concept Unit's
own throwaway lab code — `GuessDefinition`/`GuessSettings`/
`GuessState`/`GuessEngine`, and the real `GameSession` driving all of
them — ran together, batched, in one real file,
`verification/lesson-65/game_contract_labs_test.dart`, per the
Verification Rule's own Batching clause; every real lab passed on its
first real run.

```
flutter analyze .
57 issues found. (ran in 5.8s)
```

Up by exactly one from this lesson's own 56-issue baseline — checked
by real category, not only by total count, the exact discipline this
project's own immediately preceding lesson had to learn the hard way:
the one new issue is a real `prefer_initializing_formals` info on the
new, generic `GameSession`'s own constructor, the identical real
category three already-existing occurrences (on the Sudoku-specific
`GameSession`) already carried — zero new categories.

```
flutter test
...
00:24 +83: All tests passed!
```

83 real test-file-level checks, unchanged — this lesson's own real
proof lives entirely in a throwaway lab, since these six new contracts
have no real, permanent project consumer yet, per this lesson's own,
deliberately scoped, define-only real job (retrofitting Sudoku's own
real classes onto them, or building a second real game on top of
them, is real, later, explicitly deferred work, not silently done
here). One real, isolated flake was observed on a single full-suite
run (an already-existing, unrelated persistence test), confirmed
reliable standalone and on two further full runs — this project's own
already-established, honest flake pattern, not chased further. Full
real script and output saved to `verification/lesson-65/`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting this time, not after, found zero stray citations needing a
post-draft fix.
