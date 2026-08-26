# Lesson 53: A Score Finally Has Somewhere to Belong

**Repository Implementation**

## What you will build

`ScoreRepository` — a real, new, minimal interface naming "the ability
to permanently save and recall a completed game's own score" — gets its
one, real, current implementation, `SqliteScoreRepository`, wired
through this app's own real composition root. A real, new value object,
`Score`, gives the real `scores` table its first-ever typed, in-memory
shape. The transferable problem: `AppDatabase` has, until now, been
reached directly and nakedly by whatever code needed it — this lesson
gives `scores` specifically the same real, deliberate separation between
"the ability to do a thing" and "how that thing actually happens" that
this project's other real dependencies already have, so a future test,
or a future swap to a different real storage engine, never has to touch
a single real call site that merely wants to save or read a score.

## What you need to know first

- Lesson 39 ("Naming and Injecting a Dependency") — the real
  abstraction/implementation split (`Clock`/`SystemClock`), the exact
  real shape `ScoreRepository`/`SqliteScoreRepository` repeats.
- Lesson 43 ("Naming Where Data Actually Comes From") —
  `PuzzleRepository`/`InMemoryPuzzleRepository`, the second real,
  already-working instance of that identical shape.
- Lesson 44 ("Depending on the Idea, Not the Implementation") — the real
  composition root, `application/game_session_provider.dart`, where
  every real abstraction this app depends on gets bound to its one real,
  concrete implementation.
- Lesson 45 ("Data Shaped for Carrying, Not for Deciding") —
  `SudokuBoardDto`, the real, established shape for a plain data object
  whose whole job is carrying values across a boundary, no rules
  attached — `Score`'s own real design follows it directly.
- Lesson 51 ("A Real Shape for a Game That Ends") — the real `scores`
  table's own exact columns, which `Score`'s own real fields mirror.
- Lesson 52 ("The Schema Has Already Shipped") — the real, enforced
  `FOREIGN KEY` from `scores.session_id` to `game_sessions.id`, proven
  again, for real, this lesson.

## Terms used in this lesson

- **Value object** — a real object defined entirely by its own real,
  held values, with no independent identity of its own beyond them —
  two value objects holding the identical real data are meant to be
  treated as the same real thing. Exists to give a real, structured
  shape to data that's only ever carried and compared, never itself the
  subject of behavior or rules.
- **Repository pattern** — a hard concept: a real, named design pattern
  naming "the ability to save and retrieve a specific kind of object,"
  as its own real interface, separate from whatever real, concrete
  storage mechanism actually implements it. Exists so the rest of an
  app's own code can depend on *what* can be done with a kind of data,
  never *how* it's actually stored.
- **`factory` constructor** — a real Dart keyword declaring a
  constructor that doesn't have to build a genuinely new real instance
  the ordinary way — it can run real logic first and only then decide
  what real object to return. Exists here specifically because building
  a real `Score` from a real, raw database row needs real, non-trivial
  work (parsing a real date, looking up a real enum by name) before a
  real object can exist at all.
- **`required` (named parameter)** — a real Dart keyword marking a named
  constructor parameter as genuinely mandatory — omitting it is a real,
  caught compile-time error, not a silent `null`. Exists so a real
  `Score` can never be constructed with a real, missing field by
  accident.
- **Composition root** — the one real, deliberate place an app's own
  real abstractions get bound to their real, concrete implementations —
  `application/game_session_provider.dart`, in this project. Exists so
  that binding decision lives in exactly one real place, rather than
  scattered across every real file that happens to need a concrete
  class.

## Objects and methods used

- **`Score`**
  - *What it is:* a real, new value object (Terms, above) representing
    one completed game's own real, permanent record — this lesson's own
    primary subject.
  - *Implementation:* a real, plain Dart class with eight real fields
    (`id`, `sessionId`, `completedAt`, `completionSeconds`, `difficulty`,
    `mistakes`, `hints`, `points`), a real ordinary constructor, and a
    real `factory` constructor, `Score.fromRow`.
  - *Its use:* every real method on `ScoreRepository`, below, either
    takes or returns one.
  - *Type:* a real, ordinary class.
  - *Responsibility:* holding exactly the real data one completed game's
    own score consists of — nothing about how that data gets stored or
    retrieved.
  - *Depends on:* real values supplied at construction; nothing ambient.
  - *Connects to:* built and read by `SqliteScoreRepository`, below;
    real callers elsewhere in this app will construct one the moment a
    real game actually completes.
  - *Shape:* a real Domain-layer value object — no dependency on
    Flutter, Riverpod, or `sqflite` anywhere in its own real file.

- **`Score.fromRow`**
  - *What it is:* a real `factory` constructor (Terms, above) building a
    `Score` from one real, raw database row.
  - *Implementation:* `factory Score.fromRow(Map<String, Object?> row) {
    return Score(id: row['id'] as int, sessionId: row['session_id'] as
    int, completedAt: DateTime.parse(row['completed_at'] as String),
    ...); }` — reads each real column by its own real, exact name, real
    and cast to its own real, specific type.
  - *Its use:* `SqliteScoreRepository.all`, below, calls it once per real
    row a query returns.
  - *Type:* a `factory` constructor — real and callable like any other
    constructor, but able to run real logic first.
  - *Responsibility:* translating one real, raw, dynamically-typed
    database row into one real, fully-typed `Score` — nothing about
    running the real query that produced that row.
  - *Depends on:* a real `Map<String, Object?>` whose own real keys
    match `scores`'s own exact real column names.
  - *Connects to:* called by `SqliteScoreRepository.all`; its own real
    body calls `DateTime.parse` and `Difficulty.values.byName`, below.
  - *Shape:* the real, database-to-domain half of `Score`'s own real
    mapping boundary.

- **`Score.toRow`**
  - *What it is:* a real instance method building a real, raw row
    suitable for a real database write, from an existing `Score`.
  - *Implementation:* `Map<String, Object?> toRow() { return
    {'session_id': sessionId, 'completed_at':
    completedAt.toIso8601String(), ..., 'score': points}; }` — a real
    map literal, one real entry per real, storable column, deliberately
    excluding `id`.
  - *Its use:* `SqliteScoreRepository.save`, below, passes its own real
    result straight to `AppDatabase.insertScore`.
  - *Type:* an instance method.
  - *Responsibility:* translating one real, fully-typed `Score` back
    into the real, raw shape a database write actually needs — nothing
    about running that real write itself.
  - *Depends on:* a real, already-constructed `Score`.
  - *Connects to:* called by `SqliteScoreRepository.save`; its own real
    body calls `DateTime.toIso8601String`, below.
  - *Shape:* the real, domain-to-database half of `Score`'s own real
    mapping boundary.

- **`DateTime.parse` / `DateTime.toIso8601String`**
  - *What it is:* a real, `dart:core`, static factory converting real
    ISO 8601 text back into a real `DateTime`; a real, paired instance
    method doing the exact real reverse.
  - *Implementation:* `static DateTime parse(String formattedString)`;
    `String toIso8601String()` — both real, and, on this project's own
    real `game_sessions`/`scores` columns, always operating on the
    identical real text shape `DateTime.now().toIso8601String()` itself
    already produces.
  - *Its use:* `Score.fromRow`/`Score.toRow`, above, use one each,
    reading and writing `completedAt` through the identical real text
    representation the rest of this app's own real database columns
    already use.
  - *Type:* a static factory (`parse`); an instance method
    (`toIso8601String`) — both on `DateTime`.
  - *Responsibility:* losslessly converting between a real, in-memory
    `DateTime` and real, storable text — nothing about deciding which
    column stores it.
  - *Depends on:* `parse` depends on real, syntactically valid ISO 8601
    text; `toIso8601String` depends on a real, existing `DateTime`.
  - *Connects to:* called only inside `Score`'s own two real mapping
    methods.
  - *Shape:* a real, standard `dart:core` boundary between in-memory
    time and real, storable text.

- **`Enum.name` / `Iterable<T>.byName`**
  - *What it is:* a real, `dart:core` getter every real Dart `enum`
    value automatically has, real and returning its own declared, real
    name as a string; a real, paired extension method on any real
    `Iterable` of enum values, doing the exact real reverse.
  - *Implementation:* real, confirmed by run this session:
    `Difficulty.hard.name` real and returns `'hard'`;
    `Difficulty.values.byName('hard')` real and returns
    `Difficulty.hard` — `Difficulty.values` is the real, automatic,
    ordered `List<Difficulty>` every real Dart enum already has.
  - *Its use:* `Score.toRow` writes `difficulty.name`; `Score.fromRow`
    reads it back with `Difficulty.values.byName(...)` — the identical
    real, stable-name-not-position convention this project's own schema
    already committed to.
  - *Type:* a real, automatic instance getter (`.name`); a real
    extension method (`.byName`) on `Iterable<T extends Enum>`.
  - *Responsibility:* `.name`'s whole job: a real, stable string for a
    real enum value; `.byName`'s whole job: the real, exact reverse
    lookup — nothing about validating that the real string it's given
    actually names a real value that exists (a genuinely possible real
    failure, left honestly open, this lesson's own SE lens returns to
    it).
  - *Depends on:* `.name` depends on nothing beyond the real enum value
    itself; `.byName` depends on a real, already-populated
    `Iterable<T>` (here, `Difficulty.values`) and a real string.
  - *Connects to:* called only inside `Score`'s own two real mapping
    methods.
  - *Shape:* a real, standard `dart:core` boundary between an in-memory
    enum value and real, storable text.

- **`ScoreRepository`**
  - *What it is:* a real, new, abstract interface — this lesson's own
    second primary subject — naming the repository pattern's (Terms,
    above) real ability for this project's own scores specifically.
  - *Implementation:* `abstract class ScoreRepository { Future<int>
    save(Score score); Future<List<Score>> all(); }` — two real methods,
    both real and asynchronous.
  - *Its use:* every real caller anywhere in this app that ever needs to
    save or read a score depends on this real interface, never a
    concrete class directly.
  - *Type:* an abstract class (a real interface).
  - *Responsibility:* naming exactly two real abilities — saving one
    real `Score`, reading every real `Score` back — and nothing about
    how either actually happens.
  - *Depends on:* nothing to declare; a real, concrete subclass supplies
    every real answer.
  - *Connects to:* implemented by `SqliteScoreRepository`, below; bound
    to it in the real composition root.
  - *Shape:* the real Domain-layer seam this whole lesson exists to
    create.

- **`SqliteScoreRepository`**
  - *What it is:* the one, real, current implementation of
    `ScoreRepository` — this lesson's own third primary subject.
  - *Implementation:* `class SqliteScoreRepository implements
    ScoreRepository { SqliteScoreRepository(this._database); final
    AppDatabase _database; ... }` — a real, ordinary class, taking a
    real `AppDatabase` as a real, injected constructor dependency,
    exactly the same real shape `SystemClock`/`InMemoryPuzzleRepository`
    already use for their own real, ambient resources.
  - *Its use:* the one real class this whole app will ever construct
    that genuinely reaches `AppDatabase` on `scores`'s own behalf.
  - *Type:* a real, ordinary class implementing a real interface.
  - *Responsibility:* translating every real `ScoreRepository` call into
    the exact real `AppDatabase` calls that fulfill it, and translating
    every real result back into `Score` objects — nothing about the raw
    SQL underneath, which stays entirely inside `AppDatabase` itself.
  - *Depends on:* a real, already-constructed `AppDatabase`, handed to
    it once, at construction.
  - *Connects to:* calls `AppDatabase.insertScore`/`allScores`, below;
    called, in turn, by whatever real code the composition root hands
    a `ScoreRepository` to.
  - *Shape:* the real Infrastructure-layer occupant of the seam
    `ScoreRepository` names.

- **`AppDatabase.insertScore` / `AppDatabase.allScores`**
  - *What it is:* two real, new, public methods on the real,
    already-existing `AppDatabase` class, giving `scores` its own real,
    typed-enough surface — real `Map<String, Object?>` in and out,
    rather than forcing every real caller to reach for the raw
    `Database` directly.
  - *Implementation:* `Future<int> insertScore(Map<String, Object?>
    values) async { final db = await _open(); return db.insert('scores',
    values); }`; `Future<List<Map<String, Object?>>> allScores() async {
    final db = await _open(); return db.query('scores'); }` — both real,
    thin wrappers around `Database.insert`/`Database.query`, below.
  - *Its use:* `SqliteScoreRepository`, above, calls one each; nothing
    else in this app reaches either.
  - *Type:* two real, ordinary instance methods.
  - *Responsibility:* `insertScore`'s whole job: write one real row into
    `scores`, real and returning its real, assigned id; `allScores`'s
    whole job: read every real row `scores` currently has — neither
    knows what a `Score` object even is.
  - *Depends on:* `_open()`, `AppDatabase`'s own already-real, private
    method opening (or reusing) the real, one shared connection.
  - *Connects to:* called only by `SqliteScoreRepository`; each calls
    exactly one real `Database` method in turn.
  - *Shape:* the real, thin, public seam between `AppDatabase`'s own
    private connection and `SqliteScoreRepository`'s own real, typed
    world.

- **`Database.insert` / `Database.query`**
  - *What it is:* two real instance methods on `DatabaseExecutor`
    (which `Database` implements) — a real, typed insert taking a real
    `Map`; a real, typed read returning a real `List` of them.
  - *Implementation:* real, fetched source, this session
    (`sqflite_common-2.5.11/lib/sqlite_api.dart`): `Future<int>
    insert(String table, Map<String, Object?> values, {String?
    nullColumnHack, ConflictAlgorithm? conflictAlgorithm});` — returns
    the real, new row's own real, database-assigned id; `Future<List<Map<
    String, Object?>>> query(String table, {bool? distinct, List<String>?
    columns, String? where, List<Object?>? whereArgs, ...});` — real and
    returning every real matching row, unfiltered here (no real `where`
    supplied), real and equivalent to every real row `scores` has.
  - *Its use:* `AppDatabase.insertScore`/`allScores`, above, each call
    exactly one.
  - *Type:* two instance methods on a real interface (`DatabaseExecutor`).
  - *Responsibility:* `insert`'s full charter: safely write one real row
    from a real column-to-value map, real and never trusting a
    hand-built SQL string; `query`'s full charter: safely read matching
    real rows back, the same real, typed way.
  - *Depends on:* a real, open `Database`; a real, existing table name;
    real column names actually present in that real table's own shape.
  - *Connects to:* called only from inside `AppDatabase`'s own two new
    real methods.
  - *Shape:* `Database`'s own real, public, typed surface.

- **`Provider` / `ref.watch`**
  - *What it is:* a real, generic Riverpod class declaring one real,
    app-wide value every real widget or provider can read; a real,
    instance method reading a real provider's own current value while
    also subscribing to it.
  - *Implementation:* real, already-established shape:
    `Provider<T>((ref) => concreteValue)`, constructed once, real and
    top-level; `ref.watch(someProvider)` returns that real, current
    value.
  - *Its use:* `appDatabaseProvider`/`scoreRepositoryProvider`, below,
    each declare one; `scoreRepositoryProvider`'s own real body calls
    `ref.watch(appDatabaseProvider)`.
  - *Type:* a real, generic class (`Provider<T>`); a real instance
    method (`ref.watch`).
  - *Responsibility:* `Provider`'s whole job: constructing one real
    value, once, real and lazily, the first real time anything asks for
    it; `ref.watch`'s whole job: reading that real, current value.
  - *Depends on:* `Provider` depends on the real, given callback
    function; `ref.watch` depends on a real, already-declared provider.
  - *Connects to:* every real provider in this project's own composition
    root is built from `Provider` (or `NotifierProvider`); real
    providers reading other real providers via `ref.watch` is how this
    project's own real dependency graph is actually wired together.
  - *Shape:* the real, central mechanism this whole app's real
    composition root is built out of.

---

## Concept Unit 1: A Real Value Object for One Completed Game

### The Problem

`scores` (a real, already-existing table) has a real, fixed shape — but
nothing in this app's own Dart code can hold one real row of it as a
single, typed thing yet; every real column would have to be passed
around separately, or read out of a raw, untyped `Map`.

> **Socratic prompt:** `scores`'s own real columns are
> `id`/`session_id`/`completed_at`/`completion_seconds`/`difficulty`/
> `mistakes`/`hints`/`score`. Given a real row read back from the
> database arrives as a plain `Map<String, Object?>` — every real value
> dynamically typed — what real, concrete problem would passing that raw
> map around this app's own code create, that a real, dedicated class
> wouldn't? Second: `id` is assigned by the real database itself, only
> once a row is actually inserted — what real, honest type should a
> not-yet-saved `Score`'s own `id` field have?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new real
  value object; `SudokuBoardDto`'s own real, already-existing file
  (`project/lib/features/sudoku/presentation/sudoku_board_dto.dart`,
  read fresh this session) is the real, established shape this one
  follows: a plain constructor, a real `fromX`/`toX` mapping pair, no
  rules.
- **Files affected:**
  `project/lib/features/sudoku/domain/score.dart` — created.
- **Change type:** add.
- **Location:** a brand-new file, inside `domain/`, alongside
  `game_status.dart` and `difficulty.dart`.
- **Dependencies:** `Difficulty`, this project's own already-existing
  real enum.

### The New Code

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

  factory Score.fromRow(Map<String, Object?> row) {
    return Score(
      id: row['id'] as int,
      sessionId: row['session_id'] as int,
      completedAt: DateTime.parse(row['completed_at'] as String),
      completionSeconds: row['completion_seconds'] as int,
      difficulty: Difficulty.values.byName(row['difficulty'] as String),
      mistakes: row['mistakes'] as int,
      hints: row['hints'] as int,
      points: row['score'] as int,
    );
  }

  final int? id;
  final int sessionId;
  final DateTime completedAt;
  final int completionSeconds;
  final Difficulty difficulty;
  final int mistakes;
  final int hints;
  final int points;

  Map<String, Object?> toRow() {
    return {
      'session_id': sessionId,
      'completed_at': completedAt.toIso8601String(),
      'completion_seconds': completionSeconds,
      'difficulty': difficulty.name,
      'mistakes': mistakes,
      'hints': hints,
      'score': points,
    };
  }
}
```

### Updated Project

Not applicable — a brand-new file, its own real, complete content shown
whole above, with nothing surrounding it yet.

### Isolate and Discard

No separate throwaway lab — this whole real class is small enough, and
concrete enough, that its own real behavior is directly, fully proven by
`SqliteScoreRepository`'s own real, permanent tests, later in this
lesson, against real, saved data — a disposable duplicate would only
restate that same real evidence early.

### Mechanical Walkthrough

- `class Score { ... }` — a real, ordinary class declaration, this
  lesson's own primary subject.
- `Score({this.id, required this.sessionId, ...})` — a real, named
  constructor: `this.id` (real field-shorthand, already familiar in
  spirit from this project's own earlier constructors) assigns the real
  parameter straight to the real field of the identical name;
  `required` (Terms, above, full treatment here) marks every other
  parameter genuinely mandatory — a real, caught compile error results
  from omitting any of them, directly answering this unit's own real
  design goal: a `Score` can never silently exist with a missing real
  field.
- `factory Score.fromRow(Map<String, Object?> row) { ... }` — `factory`
  (Terms, above, full treatment here) marks this as a real constructor
  allowed to run real logic — reading real map entries, calling real
  conversion methods — before deciding what real object to actually
  return, which an ordinary constructor's own real, fixed
  field-assignment shape cannot do.
- `row['id'] as int` — `row['id']` is a real, ordinary index-operator
  read on a real `Map`, returning a real, dynamically-typed `Object?`;
  `as int` is Dart's own real cast, asserting, real and directly, that
  this specific real value genuinely is an `int` — necessary because
  `Map<String, Object?>`'s own real, declared value type carries no
  static guarantee of what any one real entry actually holds.
- `DateTime.parse(row['completed_at'] as String)` — `DateTime.parse`
  (Objects and methods, above) called on the real, cast `String`.
- `Difficulty.values.byName(row['difficulty'] as String)` —
  `Difficulty.values` (Objects and methods, `Enum.name`/`byName`, above)
  is the real, automatic list of every real `Difficulty` value;
  `.byName(...)` (Objects and methods, above) reverses the real, stored
  name back into the real enum value.
- `final int? id; final int sessionId; ...` — eight real, ordinary
  `final` fields, one per real column `scores` has; `int?` on `id`
  alone is real and nullable, directly answering this unit's own second
  Socratic question: a `Score` built fresh, before ever being saved,
  genuinely has no real id yet.
- `Map<String, Object?> toRow() { return {...}; }` — a real, ordinary
  instance method returning a real map literal, one real entry per real,
  storable column — `id` deliberately absent, since the real database
  itself assigns it on insert, not this app's own code.

### CS Lens

A **value object** is a hard concept.

```
Also recognized in: a real `Point(x, y)` or `Money(amount, currency)`
class in almost any real codebase, an immutable date/time value, a
color represented as real RGB components — any real type whose own
identity is entirely its own held data, with no separate, independent
existence beyond it
```

### SE Lens

The real principle is **separating "what a completed game's own score
is" from "how it's actually stored."** The alternative not chosen:
passing a raw `Map<String, Object?>` around this app's own code
everywhere a score is needed. The real tradeoff: `Score` costs one real,
small file and two real, small mapping methods, for a real, structural
guarantee — every real caller working with a `Score` gets real,
compile-time-checked field names and real, static types, rather than a
real, silent typo in a map key (`row['difficulty']` misspelled as
`row['dificulty']`) surfacing only as a real runtime `null` far from
where the actual mistake was made. The honest, present cost:
`Difficulty.values.byName` genuinely throws a real
`ArgumentError` if the real, stored string ever doesn't match any real
`Difficulty` value at all — a real, currently-impossible case, since
nothing yet writes any string there except `Score.toRow` itself, but a
real, open risk the moment any other real writer ever touches this
column directly.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — `Score`'s own real, complete proof is
`SqliteScoreRepository`'s own real, permanent tests, further in this
lesson, saving and reading real data through it.

### Connect

`Score` now gives one real, completed game's own data a real, typed
home. The next unit names the real ability to save and recall one.

---

## Concept Unit 2: `ScoreRepository` — Naming the Ability, Not the Mechanism

### The Problem

Nothing in this app names, as its own real, separate thing, "the
ability to permanently save and read back a score" — the real
mechanism that will eventually do it, `AppDatabase`, is a real, concrete
class, not an abstraction anything else can depend on instead.

> **Socratic prompt:** this project's own real `Clock` names exactly
> one real ability ("report the current moment"); `PuzzleRepository`
> names exactly one too ("supply a starting puzzle"). Given `Score` now
> exists as a real, typed shape, what real, minimal set of abilities
> would you name for scores specifically — just "save one," or would
> "read them back" need naming too, given nothing yet can display a real
> leaderboard without it?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/domain/puzzle_repository.dart` (read
  fresh this session) — the real, minimal shape this new interface
  follows directly.
- **Files affected:**
  `project/lib/features/sudoku/domain/score_repository.dart` — created.
- **Change type:** add.
- **Location:** a brand-new file, inside `domain/`.
- **Dependencies:** `Score`, built in the previous unit.

### The New Code

```dart
abstract class ScoreRepository {
  Future<int> save(Score score);
  Future<List<Score>> all();
}
```

### Updated Project

Not applicable — a brand-new file, its own real, complete content shown
whole above.

### Isolate and Discard

No separate throwaway lab — an abstract interface with no real body of
its own has no real, independent behavior to isolate; its own real proof
is `SqliteScoreRepository`'s, next.

### Mechanical Walkthrough

- `abstract class ScoreRepository { ... }` — a real, ordinary abstract
  class declaration, this lesson's own second primary subject, naming a
  real contract with no real implementation of its own.
- `Future<int> save(Score score);` — a real, abstract method signature,
  no real body; `Future<int>` (real, already-established async return
  type) names that saving is genuinely asynchronous and eventually
  produces a real, database-assigned `int` id; `Score score` takes a
  real, already-typed value, never a raw map.
- `Future<List<Score>> all();` — the identical real shape, real and
  returning every real, already-typed `Score` this app has ever saved.

### CS Lens

Not repeated separately — the **repository pattern** (Terms, above)
this interface is one real, concrete instance of is given its own real,
full, multi-recurrence CS Lens treatment in the next unit, where a real
implementation first exists to connect it to.

### SE Lens

The real principle is **naming an ability before deciding how it's
fulfilled**. The alternative not chosen: skip the real interface
entirely, and have every real future caller construct a concrete
storage class directly. The real tradeoff: `ScoreRepository` costs one
real, small file with no real behavior of its own — for a real, direct
payoff already proven twice over by `Clock`/`PuzzleRepository`: any
real future test can supply a real, fake implementation instead, and
any real future change to how scores are actually stored touches
exactly one real, concrete class, never every real call site that
merely wants to save or read one.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — an abstract interface has no real body to
run; the next unit gives it one.

### Connect

The real ability now has a real name. The next unit gives that name its
one, real, current implementation.

---

## Concept Unit 3: Giving `AppDatabase` Real, Public Methods for `scores`

### The Problem

`AppDatabase` already, really knows how to open its own real connection
and already, really has real, public methods for `settings` — but
`scores` has never had any real, public way to reach it at all, only a
real, test-only escape hatch.

> **Socratic prompt:** `AppDatabase.totalGamesStarted`/
> `incrementTotalGamesStarted` already give `settings` its own real,
> public, typed-enough methods, reading and writing real
> `Map<String, Object?>` values through `Database.query`/`Database.insert`
> underneath. Given that already-real, already-working shape, what real,
> minimal pair of methods would `scores` need to reach the identical
> real capability?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/app_database.dart`, its
  own real, existing `totalGamesStarted`/`incrementTotalGamesStarted`
  methods (read fresh this session) — the real, direct shape these two
  new methods mirror.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified.
- **Change type:** add.
- **Location:** inside the real, existing `AppDatabase` class, alongside
  its own already-real `settings` methods.
- **Dependencies:** none new.

### The New Code

```dart
Future<int> insertScore(Map<String, Object?> values) async {
  final db = await _open();
  return db.insert('scores', values);
}

Future<List<Map<String, Object?>>> allScores() async {
  final db = await _open();
  return db.query('scores');
}
```

### Updated Project

`AppDatabase`'s own real, complete class, every real line shown, the two
real, new methods marked:

```dart
 1  class AppDatabase {
 2    Database? _database;
 3
 4    Future<Database> _open() async {
 5      final existing = _database;
 6      if (existing != null) {
 7        return existing;
 8      }
 9      if (!Platform.isAndroid && !Platform.isIOS) {
10       sqfliteFfiInit();
11       databaseFactory = databaseFactoryFfi;
12     }
13     final supportDir = await getApplicationSupportDirectory();
14     final path = join(supportDir.path, 'open_calc_sudoku.db');
15     final opened = await openDatabase(
16       path,
17       version: 3,
18       onConfigure: (db) async {
19         await db.execute('PRAGMA foreign_keys = ON');
20       },
21       onCreate: (db, version) async {
22         await db.execute('''
23           CREATE TABLE settings (
24             key TEXT PRIMARY KEY,
25             value INTEGER NOT NULL
26           )
27         ''');
28         await db.execute('''
29           CREATE TABLE game_sessions (
30             id INTEGER PRIMARY KEY,
31             difficulty TEXT NOT NULL,
32             status TEXT NOT NULL,
33             started_at TEXT NOT NULL,
34             mistakes INTEGER NOT NULL,
35             hints INTEGER NOT NULL,
36             cells TEXT NOT NULL,
37             given_cells TEXT NOT NULL
38           )
39         ''');
40         await db.execute('''
41           CREATE TABLE scores (
42             id INTEGER PRIMARY KEY,
43             session_id INTEGER NOT NULL,
44             completed_at TEXT NOT NULL,
45             completion_seconds INTEGER NOT NULL,
46             difficulty TEXT NOT NULL,
47             mistakes INTEGER NOT NULL,
48             hints INTEGER NOT NULL,
49             score INTEGER NOT NULL DEFAULT 0,
50             FOREIGN KEY (session_id) REFERENCES game_sessions(id)
51           )
52         ''');
53         await db.execute('CREATE INDEX idx_scores_difficulty ON scores(difficulty)');
54       },
55       onUpgrade: (db, oldVersion, newVersion) async {
56         if (oldVersion < 2) {
57           await db.execute('CREATE INDEX idx_scores_difficulty ON scores(difficulty)');
58         }
59         if (oldVersion < 3) {
60           await db.execute('ALTER TABLE scores ADD COLUMN score INTEGER NOT NULL DEFAULT 0');
61         }
62       },
63     );
64     _database = opened;
65     return opened;
66   }
67
68   Future<int> totalGamesStarted() async {
69     final db = await _open();
70     final rows = await db.query(
71       'settings',
72       where: 'key = ?',
73       whereArgs: ['total_games_started'],
74     );
75     if (rows.isEmpty) {
76       return 0;
77     }
78     return rows.first['value'] as int;
79   }
80
81   Future<void> incrementTotalGamesStarted() async {
82     final db = await _open();
83     final current = await totalGamesStarted();
84     await db.insert(
85       'settings',
86       {'key': 'total_games_started', 'value': current + 1},
87       conflictAlgorithm: ConflictAlgorithm.replace,
88     );
89   }
90
91   Future<int> insertScore(Map<String, Object?> values) async {  // ← new
92     final db = await _open();                                   // ← new
93     return db.insert('scores', values);                         // ← new
94   }                                                              // ← new
95
96   Future<List<Map<String, Object?>>> allScores() async {         // ← new
97     final db = await _open();                                   // ← new
98     return db.query('scores');                                  // ← new
99   }                                                              // ← new
100
101   Future<void> close() async {
102     final existing = _database;
103     _database = null;
104     await existing?.close();
105   }
106
107   @visibleForTesting
108   Future<Database> rawDatabaseForTest() => _open();
109 }
```

`AppDatabase` now gives `scores` the identical real, public shape
`settings` already had, alongside every real line it already had before
this unit — its own real database-opening, migration, and settings logic
completely unchanged.

### Isolate and Discard

No separate throwaway lab — `Database.insert`/`Database.query` already
received full, real treatment in the Header, above, and this unit's own
real code is a direct, minimal application of both, proven for real
inside `SqliteScoreRepository`'s own tests, next.

### Mechanical Walkthrough

- `Future<int> insertScore(Map<String, Object?> values) async` — a
  real, ordinary async method, taking a real, raw row and returning a
  real, eventual `int`.
- `final db = await _open();` — `_open()` (this project's own real,
  already-existing private method) called, real and lazily reusing the
  one real, already-open connection if one exists.
- `return db.insert('scores', values);` — `Database.insert` (Objects
  and methods, above) called once, real and directly returning its own
  real result — the real, newly-assigned row id — with nothing further
  to compute.
- `Future<List<Map<String, Object?>>> allScores() async` — the
  identical real async shape, returning a real list of raw rows instead
  of a single id.
- `return db.query('scores');` — `Database.query` (Objects and methods,
  above) called with only a real, positional table name — no real
  `where` clause at all, so every real row `scores` currently has comes
  back, unfiltered.

### CS Lens

Not repeated separately — a real, thin wrapper narrowing a general
capability (`Database.insert`/`query`, real and generic across any
table) to one, specific, named real use is routine application, not a
second hard concept, of the identical real idea `totalGamesStarted`/
`incrementTotalGamesStarted` already embody.

### SE Lens

The real principle is **`AppDatabase` owning every real, raw SQL detail,
so nothing outside it ever has to**. The alternative not chosen: let
`SqliteScoreRepository`, next, reach `Database.insert`/`query` directly,
the same real way this lesson's own permanent tests briefly needed to,
by way of the real, test-only `rawDatabaseForTest`. The real tradeoff:
these two real methods cost a few lines inside a class that already,
really owns this exact real responsibility for `settings` — for a real,
direct payoff: `scores`'s own real table name, and the real fact that
it's reached through `sqflite` at all, now exists in exactly one real
file, never duplicated inside `SqliteScoreRepository` itself.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with
`SqliteScoreRepository`, next.

### Connect

`AppDatabase` can now save and read raw score rows directly. The next
unit gives that real capability its own, real, typed face.

---

## Concept Unit 4: `SqliteScoreRepository` — the One Real Implementation

### The Problem

`ScoreRepository` names a real ability with no real body; `AppDatabase`
can now save and read raw rows, but nothing translates between those raw
rows and real `Score` objects.

> **Socratic prompt:** `SystemClock`/`InMemoryPuzzleRepository` both
> take zero real constructor arguments — they read an ambient real
> resource (`DateTime.now()`) or hold a real, hardcoded constant
> directly. Given `SqliteScoreRepository` genuinely needs `AppDatabase`
> to do its own real job, what real, concrete difference would you
> expect in how it's constructed, compared to those two?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/in_memory_puzzle_repository.dart`
  (read fresh this session) — the real, established shape a concrete
  repository implementation follows.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/sqlite_score_repository.dart`
  — created.
- **Change type:** add.
- **Location:** a brand-new file, inside `infrastructure/`.
- **Dependencies:** `ScoreRepository`, `Score`, `AppDatabase`, all
  already real by this point in this lesson.

### The New Code

```dart
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

### Updated Project

Not applicable — a brand-new file, its own real, complete content shown
whole above.

### Isolate and Discard

**A real, run, permanent test, this session — not a disposable lab,
since this real class's own correctness is exactly what needs
permanent, ongoing proof** —
`project/test/sqlite_score_repository_test.dart`:

```dart
test('a real, saved score is genuinely read back with every real field intact', () async {
  final appDb = AppDatabase();
  final sessionId = await _stageRealGameSession(appDb);
  final repository = SqliteScoreRepository(appDb);
  final completedAt = DateTime(2026, 1, 1, 12, 30);

  final id = await repository.save(
    Score(
      sessionId: sessionId,
      completedAt: completedAt,
      completionSeconds: 245,
      difficulty: Difficulty.hard,
      mistakes: 1,
      hints: 0,
      points: 980,
    ),
  );

  final scores = await repository.all();
  expect(scores.length, 1);
  final saved = scores.first;
  expect(saved.id, id);
  expect(saved.completedAt, completedAt);
  expect(saved.difficulty, Difficulty.hard);
});
```

**A real, honest, first-attempt failure, kept rather than hidden:** the
first real version of this exact test used a real, literal
`sessionId: 1`, with no real `game_sessions` row ever created to match
it. Real, captured failure:

```
SqfliteFfiException(sqlite_error: 787, ..., SqliteException(787): while executing statement, FOREIGN KEY constraint failed, constraint failed (code 787)
  Causing statement: INSERT INTO scores (session_id, completed_at, ...) VALUES (?, ?, ...), parameters: 1, 2026-01-01T12:30:00.000, ...
```

Real, direct proof the real foreign-key enforcement built earlier in
this phase genuinely protects `scores` through `ScoreRepository`'s own
real, typed `save` method too, not only through raw SQL run by hand —
fixed by adding a real `_stageRealGameSession` helper, inserting one
real, valid `game_sessions` row first. The identical real failure shape
was then deliberately kept as its own, third, permanent test, proving
this exact real constraint on purpose:

```dart
test('a real score naming a nonexistent session is genuinely rejected', () async {
  final repository = SqliteScoreRepository(AppDatabase());

  expect(
    () => repository.save(
      Score(
        sessionId: 999999,
        completedAt: DateTime(2026, 1, 1),
        completionSeconds: 1,
        difficulty: Difficulty.easy,
        mistakes: 0,
        hints: 0,
        points: 0,
      ),
    ),
    throwsA(isA<DatabaseException>()),
  );
});
```

Neither test is discarded — both are real, permanent, and now live
inside `project/test/`.

### Mechanical Walkthrough

- `class SqliteScoreRepository implements ScoreRepository { ... }` —
  `implements` (a real, already-established Dart keyword) declares this
  real class genuinely fulfills every real method `ScoreRepository`
  names.
- `SqliteScoreRepository(this._database);` — a real, ordinary
  constructor using real field-shorthand, taking the real `AppDatabase`
  this whole class depends on as a real, injected argument — directly
  answering this unit's own Socratic question: unlike `SystemClock`,
  this real class genuinely cannot do its own job without something
  handed to it first.
- `final AppDatabase _database;` — a real, private field, holding the
  real, injected dependency.
- `@override Future<int> save(Score score) => _database.insertScore(score.toRow());`
  — `@override` (a real, already-established annotation) marks this as
  genuinely fulfilling `ScoreRepository`'s own real contract;
  `score.toRow()` (Objects and methods, above) converts the real,
  typed `Score` into a real, raw row; `_database.insertScore(...)`
  (Objects and methods, above) is called with that real result, and its
  own real return value is handed straight back — a real, single-
  expression function body (`=>`, already established), since there's
  genuinely nothing else this method needs to do.
- `@override Future<List<Score>> all() async { ... }` — the identical
  real `@override`, this time a real, multi-statement body.
- `final rows = await _database.allScores();` — `allScores()` (Objects
  and methods, above) called once, real and awaited.
- `return rows.map(Score.fromRow).toList();` — `.map` (a real,
  already-established `Iterable` method) applies `Score.fromRow`
  (Objects and methods, above) to every real, raw row, real and
  producing one `Score` per row; `.toList()` (already established)
  materializes that real, lazy sequence into a real, concrete `List`.

### CS Lens

The **repository pattern** (Terms, above) is a hard concept.

```
Also recognized in: an ORM's own real "repository"/"DAO" class in
almost any real backend framework, a version control system's own
real object database (one real interface, whether the underlying real
storage is loose files or a packed archive), a cloud SDK's own real
storage abstraction (one real interface, a genuinely different real
backend depending on which real provider is configured underneath)
```

### SE Lens

The real principle is **dependency injection over ambient construction**
— directly answering this unit's own Socratic question. The alternative
not chosen: `SqliteScoreRepository` constructing its own real
`AppDatabase()` internally, the identical real shape `SystemClock` uses
for its own, genuinely ambient real dependency. The real tradeoff: a
real, injected constructor argument costs one real line callers have to
supply — for a real, direct payoff: any real future test can hand this
class a real, fake `AppDatabase`-shaped object instead (not yet built,
this lesson — `AppDatabase` itself has no real interface of its own to
fake against, an honest, currently-open gap, unlike `Clock`/
`PuzzleRepository`, both real interfaces already). This lesson's own
real, permanent tests instead use `AppDatabase`'s own already-real,
per-test isolation, real and sufficient for now.

### Commands Needed

None new.

### Run It

Real, captured output: `flutter test` — 33 real test-file-level checks
(up from 30), `All tests passed!`, confirmed clean across two
consecutive full runs; `flutter analyze .` — 34 issues, same
pre-existing categories, zero new. Real, direct proof of three things at
once: a real `Score`, saved, comes back with every real field intact,
including a real, database-assigned id; saving a second real `Score`
means `all()` genuinely returns both; and a real `Score` naming a
nonexistent real session is genuinely, structurally rejected.

### Connect

`ScoreRepository`'s own real ability now has its one, real, working
implementation. The final unit gives every real caller in this app one,
real, shared way to actually reach it.

---

## Concept Unit 5: Wiring `ScoreRepository` Into the Composition Root

### The Problem

`SqliteScoreRepository` exists, real and working, but nothing outside
this lesson's own tests has any real way to reach one — every real
caller would otherwise have to construct its own `AppDatabase` and its
own `SqliteScoreRepository` by hand, the identical real problem
`Clock`/`PuzzleRepository` already solved once each.

> **Socratic prompt:** `clockProvider`/`puzzleRepositoryProvider` both
> already live in `application/game_session_provider.dart` — this
> project's own real, single composition root. Given
> `SqliteScoreRepository` genuinely needs an `AppDatabase`, would you
> expect that real dependency to also need its own real provider, or
> would you expect `scoreRepositoryProvider` to just construct one
> directly, inline?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/application/game_session_provider.dart`,
  its own real, existing `clockProvider`/`puzzleRepositoryProvider`
  (read fresh this session) — the real, exact shape both new providers
  follow.
- **Files affected:**
  `project/lib/features/sudoku/application/game_session_provider.dart`
  — modified.
- **Change type:** add.
- **Location:** alongside the real, existing `puzzleRepositoryProvider`.
- **Dependencies:** `AppDatabase`, `ScoreRepository`,
  `SqliteScoreRepository`, all built earlier in this lesson.

### The New Code

```dart
final appDatabaseProvider = Provider<AppDatabase>((ref) => AppDatabase());

final scoreRepositoryProvider = Provider<ScoreRepository>(
  (ref) => SqliteScoreRepository(ref.watch(appDatabaseProvider)),
);
```

### Updated Project

`application/game_session_provider.dart`'s own real, top real section,
every real line shown, new lines marked:

```dart
 1  final puzzleRepositoryProvider = Provider<PuzzleRepository>((ref) => InMemoryPuzzleRepository());
 2
 3  final appDatabaseProvider = Provider<AppDatabase>((ref) => AppDatabase());  // ← new
 4
 5  final scoreRepositoryProvider = Provider<ScoreRepository>(               // ← new
 6    (ref) => SqliteScoreRepository(ref.watch(appDatabaseProvider)),        // ← new
 7  );                                                                        // ← new
 8
 9  final clockProvider = Provider<Clock>((ref) => SystemClock());
```

This real composition root now binds every real abstraction this app's
own scores need, the identical real, direct way it already does for the
starting puzzle and the current time.

### Isolate and Discard

No separate throwaway lab — `Provider`/`ref.watch` already received
full, real treatment in the Header, above; this unit's own real code is
a direct, minimal application of both, real and provable only by real,
permanent, provider-level tests, which this lesson's own real
`ScoreRepository`-level tests already cover the underlying real
behavior of.

### Mechanical Walkthrough

- `final appDatabaseProvider = Provider<AppDatabase>((ref) =>
  AppDatabase());` — `Provider<AppDatabase>` (Objects and methods,
  above) declares a real, app-wide place one real `AppDatabase` lives;
  `(ref) => AppDatabase()` is the real, anonymous callback constructing
  it, real and lazily, the first real time anything asks.
- `final scoreRepositoryProvider = Provider<ScoreRepository>((ref) =>
  SqliteScoreRepository(ref.watch(appDatabaseProvider)));` —
  `Provider<ScoreRepository>` names the real, app-wide place a
  `ScoreRepository` lives — real and typed as the real interface, never
  the real concrete class, so a real, future test can override it with
  a real fake; `ref.watch(appDatabaseProvider)` (Objects and methods,
  above) reads the identical real, single `AppDatabase` instance the
  provider just above already declared, rather than this provider
  constructing a second, separate one — directly answering this unit's
  own Socratic question.

### CS Lens

**Dependency inversion** — a real abstraction, real and bound to its
one, real, concrete implementation in exactly one real, deliberate
place, rather than every real caller each choosing its own — is a hard
concept.

```
Also recognized in: a USB port (a real, fixed real interface; the real
device plugged into it can be swapped freely), an electrical wall
outlet (real appliances depend on the real plug standard, never on any
one specific real power plant), a web framework's own real
service-container bootstrap file, an operating system's own real
driver-registration table
```

This unit's own real construct — `scoreRepositoryProvider` reading
`appDatabaseProvider` — is one real, concrete instance of that same
general idea, applied here for the real, third time in this project's
own composition root.

### SE Lens

The real principle is **one real, shared `AppDatabase`, reached through
the identical real composition root every other real dependency already
uses**. The alternative not chosen, directly answering this unit's own
Socratic question: `scoreRepositoryProvider`'s own callback constructing
`AppDatabase()` directly, inline, with no separate `appDatabaseProvider`
at all. The real tradeoff: one real, extra provider declaration, for a
real, structural guarantee that any real, future second consumer of
`AppDatabase` (a real, future `GameSessionRepository`, reading
`game_sessions` the identical real way) shares the exact same real
connection instead of each constructing its own. The honest, present
cost, flagged directly rather than silently smoothed over: this
project's own real `_SessionStatusState` still constructs its own,
separate `AppDatabase()` directly, real and un-wired to this new real
provider at all — a real, visible inconsistency this lesson
deliberately leaves open, since changing an already-real, already
-working widget is genuinely outside this lesson's own scope.

### Commands Needed

None new.

### Run It

Real, captured output: `flutter analyze .` clean, same categories, zero
new; `flutter test` — 33 real test-file-level checks, `All tests
passed!` — this unit's own real code compiles and resolves correctly as
part of that same real, full run, confirming the real provider graph
itself has no real, circular or missing dependency.

### Connect

Every real, future caller anywhere in this app can now reach a real,
shared `ScoreRepository` through the identical real composition root
every other real dependency already uses.

---

## Connect the Pieces

A real, new value object, `Score`, gave `scores`'s own already-real
columns a real, typed, in-memory shape, its own two real mapping
methods handling every real detail — a real ISO 8601 date, a real enum
stored by name — a caller of `ScoreRepository` never has to think about
(Concept Unit 1). `ScoreRepository` named the real ability to save and
recall a score, with no real implementation of its own (Concept Unit
2). `AppDatabase` gained two real, public methods, the identical real
shape its own `settings` methods already had (Concept Unit 3).
`SqliteScoreRepository` gave that real ability its one, real
implementation — and a real, honest, first-attempt failure proved, for
real, that this project's own foreign-key enforcement protects `scores`
through this real, typed path too, not merely in isolated demonstrations
run by hand (Concept Unit 4). And a real composition root wiring — one
new `appDatabaseProvider`, one new `scoreRepositoryProvider`, the second
reading the first — gave every real, future caller in this app one,
real, shared way to reach it (Concept Unit 5). `game_sessions` itself
still has no such real seam — reached directly, nakedly, exactly the
same real way `scores` was until this lesson began.
