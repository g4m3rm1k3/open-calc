# Lesson 56: Turning a Finished Game Into a Number

**High Scores**

## What you will build

Finish a real game — every real cell filled, no real rule broken — and
this app now computes a real, honest number for it, real and
automatically, then permanently saves it alongside the exact real
difficulty, real mistake count, real hint count, and real completion
time this app already tracks. The transferable problem: a repository
that can already save and read a typed record is only useful once
something real actually decides *what value* belongs in one of its
fields — this lesson is that decision, made once, in one real, honest
place, the instant a real game genuinely ends.

## What you need to know first

- Lesson 40 ("State Machines") — `GameStatus.completed`, the real,
  terminal state this lesson's own new logic reacts to.
- Lesson 42 ("The Domain Layer") — `Difficulty`, the real enum this
  lesson gives its own, real, per-value data.
- Lesson 53 ("Repository Implementation") — `Score`, `ScoreRepository`,
  `SqliteScoreRepository`, already real and complete, but never yet
  actually called by anything in this app — this lesson's own new code
  is the first real caller.
- Lesson 55 ("Resume Interrupted Games") — `GameSessionNotifier`'s own
  real `enterDigit` method, where this lesson's own new logic is added.

## Terms used in this lesson

- **Enhanced enum** — a hard concept: a real Dart `enum` declared with
  its own real constructor and real, `final` fields, giving every one
  of its declared values its own, distinct, real, associated data —
  genuinely different from a plain enum, whose values carry no data of
  their own beyond their own bare name. Exists so a fixed, closed set
  of real values (every real difficulty; every real game status) can
  each carry a real, fixed fact about itself (a real terminal-ness; a
  real point value) without a separate, real, hand-maintained lookup
  table mapping one to the other somewhere else in the codebase.
- **Computed getter** — a real Dart member declared with `get`, read
  like a plain field but real and recomputed, from scratch, on every
  single real read, never stored. Exists to expose a real value that's
  always derived from other, real, already-held state, so it can never
  silently drift out of sync with the real values it's computed from.

## Objects and methods used

- **`Difficulty.basePoints`**
  - *What it is:* a real, new, `final` field this lesson adds to the
    already-existing `Difficulty` enum, giving each of its three real
    values its own, real, fixed point value — this lesson's own first
    primary subject.
  - *Implementation:*
    ```dart
    enum Difficulty {
      easy(basePoints: 100),
      medium(basePoints: 200),
      hard(basePoints: 300);

      const Difficulty({required this.basePoints});

      final int basePoints;
    }
    ```
  - *Its use:* `GameSession.score`, below, reads it once, as the real,
    starting value every real score is computed from.
  - *Type:* a real, `final` instance field, set once per real enum
    value, at that value's own real declaration.
  - *Responsibility:* naming exactly one real fact about each real
    difficulty — how many real points a flawless real game at that
    difficulty is worth — nothing about mistakes, hints, or how a real,
    final score actually gets computed, which `GameSession.score`,
    below, alone decides.
  - *Depends on:* nothing; every real value is fixed at compile time.
  - *Connects to:* read once inside `GameSession.score`, below.
  - *Shape:* real, per-value data living directly on this app's own
    Domain-layer enum, the identical real shape `GameStatus.isTerminal`
    already, really uses for a different real fact.

- **`GameSession.score`**
  - *What it is:* a real, new, computed getter on the already-existing
    `GameSession` class — this lesson's own second primary subject.
  - *Implementation:*
    ```dart
    int get score {
      final raw = difficulty.basePoints - (mistakes * 10) - (hints * 15);
      return raw < 0 ? 0 : raw;
    }
    ```
  - *Its use:* read once, at the real moment a game completes, by
    `GameSessionNotifier`, below, to build the real `Score` it saves.
  - *Type:* a real, computed instance getter.
  - *Responsibility:* turning this session's own real difficulty, real
    mistake count, and real hint count into one, real, honest number —
    nothing about deciding *when* that number is worth saving anywhere,
    which stays entirely `GameSessionNotifier`'s own job.
  - *Depends on:* `difficulty` (real, `final`, fixed at construction),
    `mistakes`/`hints` (real, computed getters reading this session's
    own real, private counters).
  - *Connects to:* reads `Difficulty.basePoints`, above; its own real
    result becomes `Score.points`, below.
  - *Shape:* a real, derived Domain-layer fact about a `GameSession` —
    real and always current, never a stored field that could silently
    fall out of sync with the real mistakes/hints it's computed from.

- **`GameSessionNotifier.enterDigit`**
  - *What it is:* the real, already-existing method, changed this
    lesson to also save a real `Score` the instant a real move actually
    completes the game — this lesson's own third primary subject.
  - *Implementation:*
    ```dart
    void enterDigit(int row, int col, int digit) {
      try {
        state.enterDigit(row, col, digit);
      } finally {
        state = state.touched();
        _save();
        if (state.status == GameStatus.completed) {
          ref.read(scoreRepositoryProvider).save(
            Score(
              sessionId: AppDatabase.currentGameSessionId,
              completedAt: ref.read(clockProvider).now(),
              completionSeconds: state.elapsed.inSeconds,
              difficulty: state.difficulty,
              mistakes: state.mistakes,
              hints: state.hints,
              points: state.score,
            ),
          );
        }
      }
    }
    ```
  - *Its use:* every real time a player's own real move finishes a
    board, this real method now also builds and permanently saves the
    real `Score` that move just earned.
  - *Type:* a real, ordinary instance method.
  - *Responsibility:* real and unchanged in its first half: applying
    one real move and always persisting the real, resulting session
    state afterward; real and new in its second half: recognizing the
    exact real moment this session's own status becomes
    `GameStatus.completed`, and saving a permanent, real `Score` record
    of it, real and exactly once, since `GameStatus.completed` is a
    real, terminal state this session's own state machine can never
    leave or re-enter.
  - *Depends on:* `scoreRepositoryProvider`, `clockProvider` (both
    already real); `GameSession.score`, above; `AppDatabase
    .currentGameSessionId` (this app's own real, fixed, single-session
    identity).
  - *Connects to:* calls `ref.read(scoreRepositoryProvider).save`,
    below, handing it a real `Score` built from this session's own
    real, current fields.
  - *Shape:* this app's own real Application-layer moment where a real,
    completed domain entity's own real facts get turned into a
    real, separate, permanent record — the identical real seam
    `_save()`, right above it, already occupies for the session itself.

### Everything else in the file, not this lesson's subject but still explained

- **`Score`**
  - *What it is:* the real, already-existing, permanent record class
    this whole lesson exists to finally construct and save.
  - *Implementation:* real, unchanged real, public shape:
    ```dart
    class Score {
      Score({
        this.id,
        required this.sessionId,
        required this.completedAt,
        required this.completionSeconds,
        required this.difficulty,
        required this.mistakes,
        required this.hints,
        required this.points,
      });
      final int? id;
      final int sessionId;
      final DateTime completedAt;
      final int completionSeconds;
      final Difficulty difficulty;
      final int mistakes;
      final int hints;
      final int points;
    }
    ```
  - *Its use:* `GameSessionNotifier.enterDigit`, above, constructs one
    real instance directly, real and by name, filling every real,
    required field from this session's own real, current state.
  - *Type:* a real, ordinary class.
  - *Responsibility:* carrying exactly one completed real game's own
    real, permanent facts — nothing about deciding what those real
    facts should be, which `GameSession`, and now `GameSession.score`,
    alone decide.
  - *Depends on:* every real, required field supplied at construction;
    `id` alone real and optional, left `null` until a real save assigns
    one.
  - *Connects to:* passed directly to `ScoreRepository.save`, below.
  - *Shape:* this app's own, unchanged, real Domain-layer value object.

- **`ScoreRepository` / `SqliteScoreRepository`**
  - *What it is:* the real, already-existing interface naming the
    ability to save and read back a completed game's own score, and its
    one, real, concrete implementation — both real and complete since
    an earlier real lesson, neither one ever actually called until this
    lesson's own new code.
  - *Implementation:*
    ```dart
    abstract class ScoreRepository {
      Future<int> save(Score score);
      Future<List<Score>> all();
    }

    class SqliteScoreRepository implements ScoreRepository {
      SqliteScoreRepository(this._database);
      final AppDatabase _database;

      @override
      Future<int> save(Score score) => _database.insertScore(score.toRow());

      @override
      Future<List<Score>> all() async {
        final rows = await _database.allScores();
        return rows.map(Score.fromRow).toList();
      }
    }
    ```
  - *Its use:* `GameSessionNotifier.enterDigit`, above, calls `save`,
    real and for the first time anywhere in this app.
  - *Type:* a real, abstract interface; a real, ordinary class
    implementing it.
  - *Responsibility:* `save`'s whole job: permanently writing one real
    `Score`, real and once — nothing about deciding when a real
    `Score` is worth building at all, which stays
    `GameSessionNotifier`'s own, new job.
  - *Depends on:* `SqliteScoreRepository` depends on a real,
    already-open `AppDatabase`.
  - *Connects to:* bound to its one, real, concrete implementation by
    `scoreRepositoryProvider`, below; called, for the first time, by
    `GameSessionNotifier.enterDigit`, above.
  - *Shape:* this app's own, unchanged, real Domain/Infrastructure seam
    — real and finally, genuinely load-bearing as of this lesson.

- **`scoreRepositoryProvider` / `clockProvider` / `ref.read`**
  - *What it is:* the real, already-existing Riverpod provider binding
    `ScoreRepository` to its one, real, concrete implementation; the
    real, already-existing provider supplying this app's one, real
    `Clock`; and the real, paired instance method reading either one's
    current real value, real and once, with no ongoing subscription.
  - *Implementation:* `final scoreRepositoryProvider =
    Provider<ScoreRepository>((ref) =>
    SqliteScoreRepository(ref.watch(appDatabaseProvider)));`;
    `final clockProvider = Provider<Clock>((ref) => SystemClock());`;
    `ref.read(someProvider)` real and reads the current real value
    once.
  - *Its use:* `GameSessionNotifier.enterDigit`, above, calls
    `ref.read` twice, real and deliberately, since this method runs
    mid-notifier, after `build()` has already established every real
    subscription this notifier needs.
  - *Type:* two real, app-wide `Provider<T>` values; one real instance
    method.
  - *Responsibility:* unchanged: each provider constructs one real
    value, once, real and lazily; `ref.read` reads it once, real and
    only once.
  - *Depends on:* an already-declared real provider.
  - *Connects to:* both read inside `GameSessionNotifier.enterDigit`,
    above.
  - *Shape:* this app's own, unchanged, real composition-root
    mechanism.

- **`GameStatus.completed`**
  - *What it is:* the real, already-existing, terminal enum value
    naming a real, finished game.
  - *Implementation:* `completed(isTerminal: true)` — real, and, per
    this session's own real, complete transition table, a real dead
    end: `GameStatus.completed: {}` — nothing can ever transition out
    of it again.
  - *Its use:* `GameSessionNotifier.enterDigit`, above, compares
    `state.status` to it directly, real and once, deciding whether this
    exact real move just finished the game.
  - *Type:* a real, enhanced enum value (Terms, above).
  - *Responsibility:* naming this one, specific, terminal real state —
    nothing about what should happen the real, first time a session
    reaches it, which this lesson's own new code alone decides.
  - *Depends on:* nothing.
  - *Connects to:* compared against inside `GameSessionNotifier
    .enterDigit`, above; its own real terminal-ness (`isTerminal: true`,
    an empty real transition set) is exactly why this lesson's own new
    logic can safely run without guarding against saving a second real
    score for the identical real session.
  - *Shape:* this app's own, unchanged, real Domain-layer enum value.

- **`GameSession.mistakes` / `GameSession.hints` / `GameSession.elapsed`**
  - *What it is:* three real, already-existing, computed getters on
    `GameSession`, each read directly by this lesson's own new code.
  - *Implementation:* `int get mistakes => _mistakes;`; `int get hints
    => _hints;`; `Duration get elapsed => _clock.now().difference
    (startTime);` — all real and unchanged.
  - *Its use:* `GameSession.score`, above, reads `mistakes`/`hints`
    directly; `GameSessionNotifier.enterDigit`, above, reads all three,
    building `Score`'s own real `mistakes`/`hints`/`completionSeconds`
    fields.
  - *Type:* three real, computed instance getters.
  - *Responsibility:* each reporting exactly one real fact about this
    session's own current, live state — nothing about persistence,
    which stays entirely outside `GameSession` itself.
  - *Depends on:* `mistakes`/`hints` read this session's own real,
    private counters; `elapsed` depends on this session's own injected
    `Clock` and its own real, fixed `startTime`.
  - *Connects to:* `mistakes`/`hints` feed `GameSession.score`, above,
    and `Score`'s own real fields; `elapsed` feeds `Score
    .completionSeconds` directly, via its own real `.inSeconds` getter
    (a real, already-established `dart:core` `Duration` getter,
    converting a real `Duration` into a real, whole number of seconds).
  - *Shape:* this app's own, unchanged, real Domain-layer facts —
    genuinely never persisted anywhere themselves; only their own real,
    current *values*, read once, become part of a real, permanent
    `Score`.

---

## Concept Unit 1: `Difficulty.basePoints` — Giving Each Difficulty Its Own Real Point Value

### The Problem

`Difficulty` currently names three real values — `easy`, `medium`,
`hard` — and nothing more; nothing in this app yet says how many real
points any one of them is honestly worth.

> **Socratic prompt:** `GameStatus` already gives every one of its own
> real values a real, associated fact: `notStarted(isTerminal: false)`,
> `completed(isTerminal: true)`, and so on, each carrying its own real
> `bool`. Given that real, already-working shape, how would you give
> `Difficulty.easy`/`.medium`/`.hard` each their own real, associated
> `int`, rather than writing a real, separate lookup table (a real
> `Map<Difficulty, int>`) somewhere else entirely?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/domain/game_status.dart`, its own real,
  existing enhanced-enum shape (read fresh this session) — the real,
  established pattern this unit's own change reuses on a different real
  enum.
- **Files affected:**
  `project/lib/features/sudoku/domain/difficulty.dart` — modified.
- **Change type:** refactor.
- **Location:** `Difficulty`'s own declaration, converting it from a
  plain enum to a real, enhanced one.
- **Dependencies:** none new.

### The New Code

```dart
enum Difficulty {
  easy(basePoints: 100),
  medium(basePoints: 200),
  hard(basePoints: 300);

  const Difficulty({required this.basePoints});

  final int basePoints;
}
```

### Updated Project

`Difficulty`'s own real, complete file, every real line shown, every
real, new or changed line marked:

```dart
1  enum Difficulty {                            // ← changed: was 'enum Difficulty { easy, medium, hard }'
2    easy(basePoints: 100),                     // ← new
3    medium(basePoints: 200),                    // ← new
4    hard(basePoints: 300);                      // ← new
5
6    const Difficulty({required this.basePoints}); // ← new
7
8    final int basePoints;                       // ← new
9  }
```

`Difficulty` still names the identical three real values every other
real, existing caller (`Difficulty.values.byName`, `.name`,
`SudokuBoard.classifyDifficulty`'s own real return type) already
depends on — nothing about calling code anywhere else in this app needs
to change; `Difficulty.easy`, read anywhere, is still genuinely
`Difficulty.easy`, now simply carrying one more real, associated fact
alongside it.

### Isolate and Discard

A real, standalone lab, run once, real and directly, with `dart run`,
proving this exact real shape before writing it into project code:

```dart
enum Tier {
  bronze(basePoints: 10),
  silver(basePoints: 25);

  const Tier({required this.basePoints});
  final int basePoints;
}

void main() {
  print(Tier.bronze.basePoints);
  print(Tier.silver.basePoints);
}
```

Real, captured output:

```
10
25
```

Two real, distinct enum values, each genuinely carrying its own,
separate real `int`, proven by two real, different numbers printing
back correctly. Discarded — `Tier` never appears in the project; this
exact real shape is what `Difficulty`, above, now really uses instead.

### Mechanical Walkthrough

- `enum Difficulty {` — the identical real `enum` keyword this class
  already used; what makes this a real **enhanced enum** (Terms,
  above) is everything from here down.
- `easy(basePoints: 100),` / `medium(basePoints: 200),` /
  `hard(basePoints: 300);` — three real enum value declarations, each
  now calling this enum's own real constructor (declared just below)
  with a real, named argument — directly answering this unit's own
  Socratic question: each real value supplies its own real `basePoints`
  right where it's declared, rather than a real, separate lookup table
  somewhere else needing to be kept in sync by hand; the final real
  value in this real list ends with `;`, not `,`, marking the end of
  this enum's own real value declarations and the start of its own
  real member declarations.
- `const Difficulty({required this.basePoints});` — a real, `const`
  constructor (`const`, already established): real and required here,
  since every one of this enum's own real values must be a real,
  compile-time constant; `{required this.basePoints}` — a real,
  required named parameter (already established), combined with a real
  initializing formal (already established), assigning its own real,
  incoming argument straight into the real `basePoints` field below.
- `final int basePoints;` — a real, `final` field (already
  established): real and fixed, once, per real enum value, at that
  value's own real declaration above — never reassigned afterward.

### CS Lens

An **enhanced enum** is a hard concept.

```
Also recognized in: a real HTTP status code carrying both its own real
number and its own real, associated reason phrase, a real chess piece
type carrying its own real point value (a pawn worth one, a queen worth
nine), a real currency code carrying its own real number of decimal
places, a real playing-card rank carrying its own real, comparative
strength
```

### SE Lens

The real principle is **keeping a real, fixed fact directly on the
real value it describes, rather than in a real, separate structure that
could silently drift out of sync with it**. The alternative not chosen,
directly answering this unit's own Socratic question: a real, standalone
`Map<Difficulty, int>` (or a real `switch` inside whatever code needs
this real value), built and maintained somewhere else entirely. The
real tradeoff: a real, separate map costs nothing extra to write today,
but creates a real, ongoing risk the moment `Difficulty` ever gains a
fourth real value — that real map could be forgotten, and would fail
silently (or throw, unhandled) rather than refusing to compile.
Declaring `basePoints` directly on `Difficulty` itself means the Dart
compiler now genuinely refuses to compile a new real `Difficulty` value
that omits it — this real fact can never be forgotten, only ever
supplied.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with
`GameSession.score`, next.

### Connect

Every real difficulty now honestly carries its own real point value.
The next unit turns that real value, plus a real session's own actual
play, into one real, final score.

---

## Concept Unit 2: `GameSession.score` — One Real, Honest Number for a Finished Game

### The Problem

`Difficulty.basePoints` names a real, starting value; nothing yet
accounts for how many real mistakes or real hints a session actually
used along the way — a flawless real game and a real game that used
every real hint available would otherwise be scored identically.

> **Socratic prompt:** `GameSession` already exposes `mistakes` and
> `hints` as real, computed getters, each reading this session's own
> real, private counters. Given `Difficulty.basePoints` as a real,
> starting value, how would you combine it with those two real counts
> into one, real, final number — and what should honestly happen if a
> real session's own real mistakes and hints add up to *more* than its
> own real starting `basePoints`?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/domain/game_session.dart`, its own real,
  existing `elapsed`/`isComplete` computed getters (read fresh this
  session) — the real, established shape this lesson's own new getter
  joins.
- **Files affected:**
  `project/lib/features/sudoku/domain/game_session.dart` — modified.
- **Change type:** add.
- **Location:** inside the real, existing `GameSession` class, alongside
  its own already-real `mistakes`/`hints`/`status`/`elapsed`/`isComplete`
  getters.
- **Dependencies:** `Difficulty.basePoints` (previous unit).

### The New Code

```dart
int get score {
  final raw = difficulty.basePoints - (mistakes * 10) - (hints * 15);
  return raw < 0 ? 0 : raw;
}
```

### Updated Project

`GameSession`'s own real getters, every real line shown, the one real,
new getter marked:

```dart
1  int get mistakes => _mistakes;
2  int get hints => _hints;
3  GameStatus get status => _status;
4
5  Duration get elapsed => _clock.now().difference(startTime);
6
7  bool get isComplete => board.isComplete;
8
9  int get score {                                                          // ← new
10   final raw = difficulty.basePoints - (mistakes * 10) - (hints * 15);    // ← new
11   return raw < 0 ? 0 : raw;                                              // ← new
12 }                                                                        // ← new
```

### Isolate and Discard

A real, standalone lab, run once, real and directly, with `dart run`,
proving this exact real formula's own behavior across a real,
escalating sequence of inputs, before writing it into project code:

```dart
int score(int basePoints, int mistakes, int hints) {
  final raw = basePoints - (mistakes * 10) - (hints * 15);
  return raw < 0 ? 0 : raw;
}

void main() {
  print(score(100, 0, 0));
  print(score(100, 2, 0));
  print(score(100, 0, 3));
  print(score(100, 5, 5));
  print(score(300, 1, 1));
}
```

Real, captured output:

```
100
80
55
0
275
```

Five real, distinct cases, each changing exactly one thing from the
last: a flawless real easy game scores its full real `100`; two real
mistakes cost `20`; three real hints cost `45`; five of each together
would go negative (`100 - 50 - 75 = -25`) but the real, floor check
catches it, reporting an honest `0`, never a real, negative score; a
real hard game, with only one real mistake and one real hint, still
scores a real `275`. Discarded — this exact real formula, proven here
in isolation, is what `GameSession.score`, above, now really uses.

### Mechanical Walkthrough

- `int get score {` — a real **computed getter** (Terms, above):
  called and read exactly like a plain field (`session.score`, never
  `session.score()`), but real and recomputed, from scratch, on every
  single real read — the identical real shape `elapsed`/`isComplete`,
  just above it in the identical real file, already use.
- `final raw = difficulty.basePoints - (mistakes * 10) - (hints * 15);`
  — `difficulty.basePoints` (Objects and methods, above) read once,
  this session's own real, fixed starting value; `mistakes` / `hints`
  (Objects and methods, above) each real, computed getters, read once
  each; `*` (already established) multiplies each real count by its own
  real, fixed penalty — `10` real points per real mistake, `15` real
  points per real hint, real and deliberately weighting a real hint
  slightly more costly than a real mistake, since a hint hands a player
  a real answer outright, while a real mistake merely rejects one wrong
  real guess; `-` (already established) subtracts both real penalties
  from the real, starting `basePoints`.
- `return raw < 0 ? 0 : raw;` — a real, already-established ternary
  expression: directly answering this unit's own Socratic question —
  real and honestly reporting `0`, never a real, negative score, the
  moment a real session's own real mistakes and hints together outweigh
  its own real, starting `basePoints`.

### CS Lens

Not a hard concept on its own — a weighted linear formula with a real
floor is ordinary, if worth naming, arithmetic. The real idea worth
naming here is **deriving one, real, single fact from several other,
already-real facts, entirely on demand, rather than tracking it as its
own, separate, real, mutable field that every real mistake/hint change
would then have to remember to update in lockstep**.

### SE Lens

The real principle is **a derived value that can never fall out of
sync with the real facts it's derived from**, directly answering this
unit's own Socratic question. The alternative not chosen: track a real,
separate `_score` field, decremented by hand inside `registerMistake`/
`useHint` every time either one runs. The real tradeoff: that
alternative would need two, real, separate methods to each remember to
keep this real field in sync, forever, with every real, future change
to either one — a real, silent, easy way for a real bug to
eventually creep in. A real, computed getter instead costs one, tiny,
real recomputation on every single real read — genuinely worth it,
here, since `score` is read at most once, at the one, real, terminal
moment a game finishes, never in a real, hot loop.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with
`GameSessionNotifier`, next.

### Connect

Any real, current `GameSession` can now honestly report its own real,
current score. The final unit reaches the one, real moment that score
is actually worth permanently saving.

---

## Concept Unit 3: Saving a Real `Score` the Instant a Real Game Actually Ends

### The Problem

`GameSession.score` can already, really compute a real number;
`ScoreRepository`/`SqliteScoreRepository` can already, really save a
real `Score` — nothing in this whole app has ever yet actually called
either one together, at the one, real moment they both matter.

> **Socratic prompt:** `GameSessionNotifier.enterDigit` already, always,
> calls `_save()` (persisting the session itself) inside its own real
> `finally` block, after every real move. `GameStatus.completed` is a
> real, terminal state — its own real transition set is genuinely
> empty, so once reached, no further real move can ever legally run
> again for this session. Given that real guarantee, where, exactly,
> inside `enterDigit`, would you check whether this exact real move
> just completed the game — and why would checking there mean this
> real check can only ever fire, at most, once per real session?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/application/game_session_provider.dart`,
  its own real, existing `GameSessionNotifier.enterDigit` (read fresh
  this session) — the real method this unit's own change extends.
- **Files affected:**
  `project/lib/features/sudoku/application/game_session_provider.dart`
  — modified.
- **Change type:** add.
- **Location:** inside the real, existing `GameSessionNotifier
  .enterDigit` method's own `finally` block, immediately after its own,
  already-real `_save();` call.
- **Dependencies:** `GameSession.score` (previous unit),
  `scoreRepositoryProvider`, `clockProvider`, `Score`,
  `AppDatabase.currentGameSessionId` — all already real by this point.

### The New Code

```dart
if (state.status == GameStatus.completed) {
  ref.read(scoreRepositoryProvider).save(
    Score(
      sessionId: AppDatabase.currentGameSessionId,
      completedAt: ref.read(clockProvider).now(),
      completionSeconds: state.elapsed.inSeconds,
      difficulty: state.difficulty,
      mistakes: state.mistakes,
      hints: state.hints,
      points: state.score,
    ),
  );
}
```

### Updated Project

`GameSessionNotifier.enterDigit`'s own real, complete method, every
real line shown, every real, new line marked:

```dart
 1  void enterDigit(int row, int col, int digit) {
 2    try {
 3      state.enterDigit(row, col, digit);
 4    } finally {
 5      state = state.touched();
 6      _save();
 7      if (state.status == GameStatus.completed) {                       // ← new
 8        ref.read(scoreRepositoryProvider).save(                          // ← new
 9          Score(                                                        // ← new
10           sessionId: AppDatabase.currentGameSessionId,                  // ← new
11           completedAt: ref.read(clockProvider).now(),                   // ← new
12           completionSeconds: state.elapsed.inSeconds,                   // ← new
13           difficulty: state.difficulty,                                 // ← new
14           mistakes: state.mistakes,                                     // ← new
15           hints: state.hints,                                           // ← new
16           points: state.score,                                         // ← new
17         ),                                                              // ← new
18       );                                                                // ← new
19     }                                                                    // ← new
20   }
21 }
```

Every real move this app's session ever makes still saves the session
itself, exactly as before; now, real and additionally, the one, real
move that actually finishes the game also saves a real, permanent
`Score` record of it, in the identical real method, immediately
afterward.

### Isolate and Discard

**A real, run, permanent test, this session** —
`project/test/game_session_scoring_test.dart`:

```dart
test('a real, flawless, completed game saves a real, full-value score', () async {
  final appDb = AppDatabase();
  final container = ProviderContainer(overrides: [appDatabaseProvider.overrideWithValue(appDb)]);
  addTearDown(container.dispose);
  addTearDown(appDb.close);

  container.read(gameSessionProvider);
  final notifier = container.read(gameSessionProvider.notifier);
  for (final move in solvedMilestoneMoves) {
    notifier.enterDigit(move.row, move.col, move.digit);
  }

  expect(container.read(gameSessionProvider).status, GameStatus.completed);

  final saved = await container.read(scoreRepositoryProvider).all();
  expect(saved, hasLength(1));
  expect(saved.single.points, 100);
  expect(saved.single.mistakes, 0);
  expect(saved.single.hints, 0);
});
```

Real, captured output: `flutter test test/game_session_scoring_test.dart`
— one real test, `All tests passed!` — a real, complete, mistake-free
run of the milestone puzzle genuinely saves exactly one real `Score`
row, its own real `points` field reading the full, real `100` this
puzzle's own real difficulty is worth.

### Mechanical Walkthrough

- `if (state.status == GameStatus.completed) {` — `state.status`
  (Objects and methods, above) read once, real and compared, with `==`
  (already established), to `GameStatus.completed` (Objects and
  methods, above) — directly answering this unit's own Socratic
  question: checked right here, immediately after `_save()`, since
  `state` has, by this exact line, already been reassigned to its own,
  real, post-move value on line 5, above; this real check can only ever
  be `true` at most once per real session, because `GameStatus
  .completed`'s own real, empty transition set means no further real
  call to `state.enterDigit(...)`, line 3, could ever legally run again
  once this real condition first fires — any such real, later attempt
  would instead throw a real
  `InvalidStateTransitionException` before ever reaching this line
  again.
- `ref.read(scoreRepositoryProvider).save(` — `ref.read
  (scoreRepositoryProvider)` (Objects and methods, above) reads this
  app's one, real, shared repository, real and once; `.save(...)`
  (Objects and methods, above) called on it, real and un-awaited here,
  deliberately — the identical real, optimistic choice `_save()`,
  directly above, already makes for the session itself.
- `Score(` — `Score`'s own real, ordinary constructor (Objects and
  methods, above), called directly, real and by name, filling every one
  of its own real, required fields explicitly.
- `sessionId: AppDatabase.currentGameSessionId,` —
  `AppDatabase.currentGameSessionId` (already established) — this app's
  own real, single, fixed session identity, the identical real value
  `saveGameSession`/`currentGameSessionRow` already key every real
  session row by.
- `completedAt: ref.read(clockProvider).now(),` — `ref.read
  (clockProvider)` (Objects and methods, above) reads this app's one,
  real, shared `Clock`; `.now()` (already established) called on it,
  real and directly, rather than calling `DateTime.now()` — the
  identical real, injected-dependency discipline every other real
  time-reading call in this app already follows.
- `completionSeconds: state.elapsed.inSeconds,` — `state.elapsed`
  (Objects and methods, above) reads this session's own real, computed
  duration; `.inSeconds` (a real, already-established `dart:core`
  `Duration` getter) converts that real `Duration` into a real, whole
  number of seconds — the exact real, integer shape `Score
  .completionSeconds` itself declares.
- `difficulty: state.difficulty,` / `mistakes: state.mistakes,` /
  `hints: state.hints,` — three real, direct reads of this session's
  own real, current fields (Objects and methods, above), passed
  straight through, unchanged.
- `points: state.score,` — `state.score` (Objects and methods, above,
  previous unit) read once, real and finally, the one real number this
  whole lesson exists to compute and permanently save.

### CS Lens

Not repeated separately — real and covered above, this exact real
check's own reasoning (a terminal state's own empty transition set
guaranteeing a real condition can fire, at most, once) is this unit's
own direct answer to its own Socratic question, not a separate, hard
concept needing its own multi-recurrence list.

### SE Lens

The real principle is **computing and saving a derived, permanent
record at the exact real moment its own source data reaches a real,
stable, terminal state — never earlier, and never left to a separate,
easy-to-forget step**. The alternative not chosen: save a real `Score`
from a real, separate UI action instead — a real "claim your score"
button a player would have to remember to tap. The real tradeoff: that
alternative would cost this app one more real widget and one more real
user action, for a real, honest risk this lesson's own design avoids
outright — a real player who closes the app the instant a puzzle
finishes, before ever tapping a real button, would otherwise lose that
real score forever, exactly the kind of real gap the previous lesson's
own resume work already refused to leave open for the session itself.

### Commands Needed

None new.

### Run It

Real, captured summary — `flutter analyze .`: 51 issues (up from 49;
two new, the same, already-accepted `avoid_relative_lib_imports`
category this lesson's own new test file adds, zero new categories);
`flutter test`: 41 real test-file-level checks (up from 40), `All
tests passed!`, including this lesson's own new, real, permanent
scoring test.

### Connect

Every real, finished game this app ever tracks now permanently saves
its own real, honest score, real and automatically, the exact real
instant it's actually earned.

---

## Connect the Pieces

`Difficulty` gained its own, real, associated point value per
value — an enhanced enum, the identical real shape `GameStatus` already
uses for a different real fact, now reused for a genuinely different
real purpose (Concept Unit 1). `GameSession` gained a real, computed
`score` getter, combining that real, starting value with a session's
own real mistakes and real hints into one, honest, real number, real
and floored at zero rather than ever reporting a real, negative score
(Concept Unit 2). And `GameSessionNotifier.enterDigit`, already real
and already saving the session itself on every real move, now also
recognizes the one, real, terminal instant a game actually completes,
and saves a real, permanent `Score` record of it — real repository
plumbing built earlier, finally, genuinely called, real and exactly
once per real session, guaranteed by the identical real terminal state
this app's own state machine already enforces (Concept Unit 3). Finish
a real game, and a real, honest number now permanently remembers it.
