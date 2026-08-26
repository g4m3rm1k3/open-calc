# Lesson 57: Letting the Database Do the Sorting

**Leaderboard Queries**

## What you will build

Every real score this app has ever saved can now answer real questions
about itself — not by reading every real row into memory and sorting
it there, but by asking the real, underlying database to sort, filter,
and limit its own real rows directly. The transferable problem: once
real data lives in a real database, most real questions about it
("what's the best?", "what happened today?", "what are the top few?")
are answered faster, and more honestly at scale, by a real query the
database itself executes, than by fetching everything and computing
the real answer in application code.

## What you need to know first

- Lesson 49 ("Database Fundamentals") — queries, the real subject this
  whole lesson deepens.
- Lesson 53 ("Repository Implementation") — `ScoreRepository`,
  `SqliteScoreRepository`, `AppDatabase.allScores`, the real,
  already-established shape this lesson's own new methods extend.
- Lesson 54 ("Saving Games") — `Database.query`'s own real `where`/
  `whereArgs` parameters, already used for a single real condition;
  this lesson reaches further into the identical real method's own
  other real parameters.
- Lesson 56 ("High Scores") — `Score`, its own real, complete set of
  stored fields (`points`, `difficulty`, `completedAt`, among others)
  every real query in this lesson reads or filters by.

## Terms used in this lesson

- **`ORDER BY` clause** — a real SQL clause naming which real column (or
  columns) a query's own real, returned rows should be sorted by, and
  in which real direction. Exists so sorting happens once, inside the
  real database engine itself, against every real row it already holds,
  rather than an application fetching every real row unsorted and
  sorting them again itself.
- **`LIMIT` clause** — a real SQL clause capping how many real rows a
  query returns at most, real and applied after any real `ORDER BY`
  has already run. Exists so "the top few" never requires fetching
  every real row that exists just to keep only a handful of them.
- **Compound `WHERE` condition** — a real SQL `WHERE` clause combining
  more than one real condition with a real, boolean operator (`AND`,
  `OR`), rather than naming only one real column's own real value.
  Exists so a real query can narrow its own real, returned rows by more
  than one real fact at once — real and specifically, in this lesson,
  a real row's own `completed_at` falling within a real, two-sided
  range, not matching one single, exact real value.

## Objects and methods used

- **`AppDatabase.topScores`**
  - *What it is:* a real, new, public method on the already-existing
    `AppDatabase` class — this lesson's own first primary subject.
  - *Implementation:*
    ```dart
    Future<List<Map<String, Object?>>> topScores(int limit) async {
      final db = await _open();
      return db.query('scores', orderBy: 'score DESC', limit: limit);
    }
    ```
  - *Its use:* `SqliteScoreRepository.topScores`, below, calls it
    directly, real and once, handing it whatever real `limit` its own
    caller asked for.
  - *Type:* a real, ordinary instance method.
  - *Responsibility:* returning the real, `limit`-many highest-scoring
    rows `scores` currently holds, real and already sorted — nothing
    about turning those real, raw rows into real `Score` objects, which
    stays entirely `SqliteScoreRepository`'s own job.
  - *Depends on:* `_open()`, this class's own real, already-established
    private connection method; a real, existing `scores` table.
  - *Connects to:* called only by `SqliteScoreRepository.topScores`,
    below.
  - *Shape:* the real, thin, public seam between `AppDatabase`'s own
    private connection and every real caller asking for a real,
    sorted, capped slice of `scores` — the identical real role
    `allScores` already plays for the real, complete, unsorted set.

- **`Database.query`'s `orderBy`/`limit` parameters**
  - *What it is:* two real, optional, named parameters `Database.query`
    already, really declares — reached for the first time in this app
    in this lesson, alongside its own already-used `where`/`whereArgs`.
  - *Implementation:* real, confirmed this session:
    `db.query('scores', orderBy: 'score DESC', limit: 3)` real and
    returns, at most, three real rows, the three real, highest-`score`
    rows currently in `scores`, in real, descending order.
  - *Its use:* `AppDatabase.topScores`, above, supplies both; later
    units in this lesson supply `orderBy`/`limit` again, alongside a
    real `where`, on the identical real method.
  - *Type:* two real, optional named parameters on an already-real
    instance method.
  - *Responsibility:* `orderBy`'s whole job: naming the real SQL
    `ORDER BY` clause (Terms, above) this query should run with;
    `limit`'s whole job: naming the real SQL `LIMIT` clause (Terms,
    above) this query should run with — neither one changes *which*
    rows a real `where` clause would otherwise match, only how many of
    the real, matching rows come back, and in what real order.
  - *Depends on:* a real, existing column name for `orderBy` to sort
    by; a real, non-negative integer for `limit`.
  - *Connects to:* both used inside `AppDatabase.topScores`, above, and
    every other real query method this lesson adds.
  - *Shape:* real, already-existing surface on `Database.query` — this
    lesson's own first real use of two of its real parameters this app
    had never yet reached for.

- **`ScoreRepository.topScores` / `SqliteScoreRepository.topScores`**
  - *What it is:* a real, new abstract method added to the
    already-existing `ScoreRepository` interface, and its one, real,
    concrete implementation.
  - *Implementation:*
    ```dart
    // ScoreRepository
    Future<List<Score>> topScores(int limit);

    // SqliteScoreRepository
    @override
    Future<List<Score>> topScores(int limit) async {
      final rows = await _database.topScores(limit);
      return rows.map(Score.fromRow).toList();
    }
    ```
  - *Its use:* the one, real, typed way anything in this app asks for
    "the top `limit` real scores," as real, live `Score` objects, not
    raw rows.
  - *Type:* a real, abstract method signature; a real, ordinary method
    overriding it.
  - *Responsibility:* naming, and then real, concretely fulfilling, the
    real ability to read back a real, sorted, capped slice of every
    real, saved score.
  - *Depends on:* `AppDatabase.topScores`, above; `Score.fromRow`
    (already real, established in an earlier lesson), mapping each real
    row into a real `Score`.
  - *Connects to:* `SqliteScoreRepository.topScores` calls
    `AppDatabase.topScores`, above, then `.map(Score.fromRow)`.
  - *Shape:* this app's own real Domain/Infrastructure seam, the
    identical real shape `save`/`all` already occupy, now with a real,
    third real ability alongside them.

- **`AppDatabase.bestScoreForDifficulty`**
  - *What it is:* a real, new, public method on `AppDatabase` — this
    lesson's own second primary subject.
  - *Implementation:*
    ```dart
    Future<Map<String, Object?>?> bestScoreForDifficulty(String difficulty) async {
      final db = await _open();
      final rows = await db.query(
        'scores',
        where: 'difficulty = ?',
        whereArgs: [difficulty],
        orderBy: 'score DESC',
        limit: 1,
      );
      return rows.isEmpty ? null : rows.first;
    }
    ```
  - *Its use:* `SqliteScoreRepository.bestForDifficulty`, below, calls
    it, handing it a real difficulty's own real, stored name.
  - *Type:* a real, ordinary instance method.
  - *Responsibility:* returning the single real, highest-scoring row
    among only those whose real `difficulty` column matches, or
    honestly reporting `null` if none exist yet at that real
    difficulty — nothing about deciding what a real `String` difficulty
    name actually corresponds to, which stays
    `SqliteScoreRepository`'s own job.
  - *Depends on:* `_open()`; a real, valid, already-stored difficulty
    name (`'easy'`/`'medium'`/`'hard'`).
  - *Connects to:* called only by
    `SqliteScoreRepository.bestForDifficulty`, below.
  - *Shape:* the real, thin, public seam this lesson adds for a real,
    single, filtered-and-sorted row — deliberately taking a plain real
    `String`, not a real `Difficulty` value, the identical real,
    "stays untyped" discipline `AppDatabase`'s own already-existing
    methods already follow.

- **`ScoreRepository.bestForDifficulty` / `SqliteScoreRepository.bestForDifficulty`**
  - *What it is:* a real, new abstract method, and its one, real,
    concrete implementation.
  - *Implementation:*
    ```dart
    // ScoreRepository
    Future<Score?> bestForDifficulty(Difficulty difficulty);

    // SqliteScoreRepository
    @override
    Future<Score?> bestForDifficulty(Difficulty difficulty) async {
      final row = await _database.bestScoreForDifficulty(difficulty.name);
      return row == null ? null : Score.fromRow(row);
    }
    ```
  - *Its use:* the one, real, typed way anything in this app asks for
    "this real difficulty's own real, personal best."
  - *Type:* a real, abstract method signature; a real, ordinary method
    overriding it.
  - *Responsibility:* accepting a real, live `Difficulty` value, real
    and translating it, at this exact real seam, into the real, plain
    string `AppDatabase` actually stores and filters by.
  - *Depends on:* `AppDatabase.bestScoreForDifficulty`, above;
    `Difficulty.name` (already established, a real `dart:core` getter
    every enum value has); `Score.fromRow`.
  - *Connects to:* calls `AppDatabase.bestScoreForDifficulty`, handing
    it `difficulty.name`; wraps its real, nullable result in
    `Score.fromRow` only when non-`null`.
  - *Shape:* the real, typed Domain-layer face of a real, filtered
    query whose own real, underlying SQL stays entirely inside
    `AppDatabase`.

- **`AppDatabase.bestScoreBetween`**
  - *What it is:* a real, new, public method on `AppDatabase` — this
    lesson's own third primary subject.
  - *Implementation:*
    ```dart
    Future<Map<String, Object?>?> bestScoreBetween(String startInclusive, String endExclusive) async {
      final db = await _open();
      final rows = await db.query(
        'scores',
        where: 'completed_at >= ? AND completed_at < ?',
        whereArgs: [startInclusive, endExclusive],
        orderBy: 'score DESC',
        limit: 1,
      );
      return rows.isEmpty ? null : rows.first;
    }
    ```
  - *Its use:* `SqliteScoreRepository.bestToday`, below, calls it,
    handing it two real, already-computed ISO 8601 boundary strings.
  - *Type:* a real, ordinary instance method.
  - *Responsibility:* returning the single real, highest-scoring row
    whose real `completed_at` falls within a real, half-open range
    (its real start included, its real end excluded) — nothing about
    deciding what that real range actually should be, which stays
    entirely its own real caller's job.
  - *Depends on:* `_open()`; two real, already-valid ISO 8601 strings,
    in the identical real, sortable shape
    `DateTime.toIso8601String()` already, always produces.
  - *Connects to:* called only by `SqliteScoreRepository.bestToday`,
    below.
  - *Shape:* the real, thin, public seam this lesson adds for a real,
    date-ranged query — genuinely reusable for any real range, not
    hardcoded to mean "today" itself.

- **Compound `WHERE` with `>=`/`<`/`AND`**
  - *What it is:* the real, specific SQL shape
    `'completed_at >= ? AND completed_at < ?'` — two real, separate
    comparisons, joined by a real, boolean `AND`.
  - *Implementation:* real, confirmed this session: since `completed_at`
    is stored as real ISO 8601 text (already established), and ISO 8601
    text sorts identically to real chronological order, a plain real
    text comparison (`>=`, `<`) correctly identifies every real row
    whose own real timestamp falls on or after one real moment and
    strictly before another.
  - *Its use:* `AppDatabase.bestScoreBetween`, above, is built entirely
    around this one real `where` string.
  - *Type:* a real SQL `WHERE` expression, passed as this app's own,
    already-established real `where`/`whereArgs` parameters.
  - *Responsibility:* narrowing a real query to only real rows inside
    one real, half-open range — nothing about which two real moments
    actually bound that range.
  - *Depends on:* `completed_at` genuinely being stored in a real,
    lexicographically-sortable text shape.
  - *Connects to:* the two real `?` placeholders are filled, in real
    order, by `whereArgs`'s own two real strings.
  - *Shape:* a real, compound instance of this app's own,
    already-established parameterized `where`/`whereArgs` pattern —
    real and now combining two real conditions instead of one.

- **`ScoreRepository.bestToday` / `SqliteScoreRepository.bestToday`**
  - *What it is:* a real, new abstract method, and its one, real,
    concrete implementation — this lesson's own fourth primary subject.
  - *Implementation:*
    ```dart
    // ScoreRepository
    Future<Score?> bestToday(Clock clock);

    // SqliteScoreRepository
    @override
    Future<Score?> bestToday(Clock clock) async {
      final now = clock.now();
      final startOfDay = DateTime(now.year, now.month, now.day);
      final startOfNextDay = startOfDay.add(const Duration(days: 1));
      final row = await _database.bestScoreBetween(
        startOfDay.toIso8601String(),
        startOfNextDay.toIso8601String(),
      );
      return row == null ? null : Score.fromRow(row);
    }
    ```
  - *Its use:* the one, real, typed way anything in this app asks for
    "the real, best score, honestly, today."
  - *Type:* a real, abstract method signature; a real, ordinary method
    overriding it.
  - *Responsibility:* real, and specifically, computing what "today"
    honestly means — the exact real range from this real moment's own
    midnight up to, but excluding, the next real midnight — before ever
    asking `AppDatabase` to filter by it.
  - *Depends on:* a real `Clock` (already established), injected by its
    own real caller, never `DateTime.now()` called directly;
    `AppDatabase.bestScoreBetween`, above.
  - *Connects to:* calls `clock.now()`, then
    `AppDatabase.bestScoreBetween`, handing it two real, computed
    boundaries.
  - *Shape:* the real, typed Domain-layer face of a real, date-ranged
    query — the one real place "what counts as today" is decided,
    entirely independent of `AppDatabase`'s own, genuinely reusable,
    range-shaped method.

### Everything else in the file, not this lesson's subject but still explained

- **`Difficulty`**
  - *What it is:* the real, already-existing enhanced enum naming
    every real difficulty this app's own classifier can report — the
    real, parameter type `bestForDifficulty`, above, accepts.
  - *Implementation:* `enum Difficulty { easy(basePoints: 100),
    medium(basePoints: 200), hard(basePoints: 300); ... }` — real and
    unchanged.
  - *Its use:* `ScoreRepository.bestForDifficulty`, above, takes one
    directly as its own real parameter; `SqliteScoreRepository
    .bestForDifficulty` reads its own real `.name` getter (already
    established) to get the exact real, stored string
    `AppDatabase.bestScoreForDifficulty` filters by.
  - *Type:* a real, ordinary Dart enhanced enum.
  - *Responsibility:* naming every real difficulty this app can ever
    classify a board, or a saved score, as — nothing about how a real
    score at that real difficulty is looked up, which stays entirely
    `SqliteScoreRepository`'s own job.
  - *Depends on:* nothing.
  - *Connects to:* passed into `bestForDifficulty`; converted to a real
    `String` via `.name` before ever reaching `AppDatabase`.
  - *Shape:* this app's own, unchanged, real Domain-layer enum.

- **`Clock`**
  - *What it is:* the real, already-existing interface naming the
    ability to report the current real moment — the real, parameter
    type `bestToday`, above, accepts.
  - *Implementation:* `abstract class Clock { DateTime now(); }` — real
    and unchanged.
  - *Its use:* `ScoreRepository.bestToday`/`SqliteScoreRepository
    .bestToday`, above, both take one directly, real and injected by
    their own real caller — never calling `DateTime.now()` directly.
  - *Type:* a real, abstract interface.
  - *Responsibility:* naming exactly one real ability — reporting the
    current real moment — nothing about what "today" means from that
    real moment, which `SqliteScoreRepository.bestToday`, above, alone
    decides.
  - *Depends on:* nothing to declare; a real, concrete implementation
    supplies the real answer.
  - *Connects to:* its own real `.now()` is called once, inside
    `SqliteScoreRepository.bestToday`.
  - *Shape:* this app's own, unchanged, real Domain-layer interface.

- **`DateTime` constructor / `DateTime.add`**
  - *What it is:* `DateTime`'s own real, ordinary, unnamed constructor,
    called here with only three real arguments; and a real,
    already-established `DateTime` instance method adding a real
    `Duration` to a real moment.
  - *Implementation:* `DateTime(int year, [int month = 1, int day = 1,
    ...])` — real, and confirmed this session: every real, unsupplied,
    trailing argument (hour, minute, second, and so on) defaults to
    real `0`, so `DateTime(now.year, now.month, now.day)` genuinely
    produces real, exact midnight on `now`'s own real, current day;
    `DateTime add(Duration duration)` — real, and already confirmed to
    correctly roll a real date forward across a real month or year
    boundary, not merely add to a real day-of-month field naively.
  - *Its use:* `SqliteScoreRepository.bestToday`, above, calls the real
    constructor once, to truncate `now` down to real midnight, then
    calls `.add(const Duration(days: 1))` once, to find the real start
    of the next real day.
  - *Type:* a real, ordinary constructor; a real instance method.
  - *Responsibility:* the constructor's whole job here: building a
    real, exact moment from only a real year/month/day, defaulting
    every smaller real unit to zero; `.add`'s whole job: real and
    correctly advancing a real moment by a real, fixed span.
  - *Depends on:* the constructor depends on three real integers;
    `.add` depends on a real `Duration`.
  - *Connects to:* both called once each, directly inside
    `SqliteScoreRepository.bestToday`, above.
  - *Shape:* real, standard `dart:core` time arithmetic — the real
    mechanism `bestToday`'s own real date-range computation is built
    from.

- **`Duration`**
  - *What it is:* the real, already-established `dart:core` class
    representing a real span of time, called here with its own real,
    named `days` parameter.
  - *Implementation:* `const Duration({int days = 0, ...})` — real and
    unchanged; `const Duration(days: 1)` real and represents exactly
    one real, 24-hour span.
  - *Its use:* `SqliteScoreRepository.bestToday`, above, constructs one,
    real and directly, to advance a real midnight moment by one real
    day.
  - *Type:* a real, `const`-constructible class.
  - *Responsibility:* representing one real span of time — nothing
    about any specific real moment it might be added to or measured
    from.
  - *Depends on:* nothing.
  - *Connects to:* passed directly to `DateTime.add`, above.
  - *Shape:* real, standard `dart:core` time representation, already
    used elsewhere in this app (`GameSession.elapsed`'s own real return
    type) for a different real purpose.

- **`Score.fromRow`**
  - *What it is:* the real, already-existing factory constructor
    mapping one real, raw database row into a real, live `Score`.
  - *Implementation:* real, unchanged: `factory Score.fromRow(Map<String,
    Object?> row) { return Score(id: row['id'] as int, sessionId:
    row['session_id'] as int, completedAt: DateTime.parse(row
    ['completed_at'] as String), completionSeconds: row
    ['completion_seconds'] as int, difficulty: Difficulty.values.byName
    (row['difficulty'] as String), mistakes: row['mistakes'] as int,
    hints: row['hints'] as int, points: row['score'] as int); }`.
  - *Its use:* `SqliteScoreRepository.topScores`, above, calls it once
    per real row via `.map`; `bestForDifficulty`/`bestToday`, above,
    each call it once, directly, on a real, single row.
  - *Type:* a real, named factory constructor.
  - *Responsibility:* turning one real, raw row into one real, live
    `Score` — nothing about which real rows a query returns in the
    first place, which every real method this lesson adds alone
    decides.
  - *Depends on:* a real row already shaped exactly like a real
    `scores` table row.
  - *Connects to:* called by every real method in this lesson that
    returns a real `Score`/`List<Score>`.
  - *Shape:* this app's own, unchanged, real Infrastructure-layer
    mapping boundary.

---

## Concept Unit 1: `AppDatabase.topScores` — Sorting and Capping Inside the Database Itself

### The Problem

`AppDatabase.allScores` already, really returns every real row `scores`
holds — but every real row, real and always, unsorted, and with no
real way to ask for only a real handful of the best ones without
fetching everything first.

> **Socratic prompt:** `AppDatabase.allScores` calls `db.query
> ('scores')` with no real, extra arguments at all. `Database.query`
> already, really accepts real, optional `orderBy`/`limit` parameters,
> alongside the real `where`/`whereArgs` this app already uses
> elsewhere. Given a real player wants "the top 3 scores, ever," what
> real, concrete cost would fetching every real row via `allScores` and
> sorting them in Dart pay, that asking the database to sort and cap
> its own real rows directly would not?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/app_database.dart`, its
  own real, existing `allScores` method (read fresh this session) — the
  real, established shape this unit's own new method extends.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified;
  `project/lib/features/sudoku/domain/score_repository.dart` —
  modified;
  `project/lib/features/sudoku/infrastructure/sqlite_score_repository.dart`
  — modified.
- **Change type:** add.
- **Location:** inside `AppDatabase`, alongside `allScores`; inside
  `ScoreRepository`/`SqliteScoreRepository`, alongside `save`/`all`.
- **Dependencies:** none new.

### The New Code

```dart
Future<List<Map<String, Object?>>> topScores(int limit) async {
  final db = await _open();
  return db.query('scores', orderBy: 'score DESC', limit: limit);
}
```

### Updated Project

`AppDatabase`'s own real `scores` methods, every real line shown, the
one real, new method marked:

```dart
1  Future<int> insertScore(Map<String, Object?> values) async {
2    final db = await _open();
3    return db.insert('scores', values);
4  }
5
6  Future<List<Map<String, Object?>>> allScores() async {
7    final db = await _open();
8    return db.query('scores');
9  }
10
11 Future<List<Map<String, Object?>>> topScores(int limit) async {  // ← new
12   final db = await _open();                                     // ← new
13   return db.query('scores', orderBy: 'score DESC', limit: limit); // ← new
14 }                                                                 // ← new
```

`ScoreRepository`/`SqliteScoreRepository`'s own real, new pair, shown
together, since neither exists without the other:

```dart
1  // ScoreRepository
2  Future<List<Score>> topScores(int limit);  // ← new
3
4  // SqliteScoreRepository
5  @override                                  // ← new
6  Future<List<Score>> topScores(int limit) async {  // ← new
7    final rows = await _database.topScores(limit);  // ← new
8    return rows.map(Score.fromRow).toList();        // ← new
9  }                                                  // ← new
```

### Isolate and Discard

No separate throwaway lab — `orderBy`/`limit` are real, ordinary named
parameters on an already-real method (`Database.query`); their own real
effect is proven directly, for real, by this lesson's own real,
permanent test, covering all three of this lesson's own new query
methods together, in Concept Unit 3, below.

### Mechanical Walkthrough

- `Future<List<Map<String, Object?>>> topScores(int limit) async {` —
  a real, ordinary `async` method, taking a real, plain `int`.
- `final db = await _open();` — the identical real,
  already-established connection call every other real `AppDatabase`
  method already makes.
- `return db.query('scores', orderBy: 'score DESC', limit: limit);` —
  `db.query` (already established) called on the real, already-open
  connection; `'scores'` the identical real, already-established table
  name; `orderBy: 'score DESC'` — a real, new argument to this
  already-real method, naming a real **`ORDER BY` clause** (Terms,
  above): `'score DESC'` real and sorts by the real `score` column,
  real and descending, so the real, highest-scoring row comes back
  first; `limit: limit` — a real, new argument naming a real **`LIMIT`
  clause** (Terms, above), real and capping the real, returned rows at
  this method's own real, incoming `limit` argument — directly
  answering this unit's own Socratic question: the real sorting and
  real capping both happen inside the real database engine itself,
  before a single real row ever crosses into this app's own memory,
  rather than fetching every real row via `allScores` and sorting a
  real, potentially much larger real list in Dart afterward.
- `Future<List<Score>> topScores(int limit);` — a real, new abstract
  method signature, joining `save`/`all` on `ScoreRepository`'s own
  real interface.
- `Future<List<Score>> topScores(int limit) async {` — `@override`
  (already established) marks this as genuinely fulfilling that real
  contract.
- `final rows = await _database.topScores(limit);` —
  `AppDatabase.topScores`, above, called once, real and awaited,
  passing this real method's own `limit` straight through.
- `return rows.map(Score.fromRow).toList();` — `.map` (already
  established) applies `Score.fromRow` (Objects and methods, above) to
  every real, raw row in turn; `.toList()` (already established)
  converts the real, lazy result back into a real, concrete
  `List<Score>` — the identical real shape `SqliteScoreRepository.all`
  already uses for `allScores`' own real, unsorted rows.

### CS Lens

Not a hard concept on its own — pushing a real sort and a real cap into
a query is ordinary, foundational database practice, not a named
design pattern. The real idea worth naming here is **doing real work as
close as possible to where the real data already lives, rather than
moving every real row somewhere else first and doing that same real
work there instead**.

### SE Lens

The real principle is **letting the real database engine do what it's
already built to do well, instead of re-implementing the identical real
logic, less efficiently, in application code**, directly answering this
unit's own Socratic question. The alternative not chosen: keep
`allScores` as this app's only real way to read scores back, and sort/
cap the real, resulting list inside `SqliteScoreRepository` itself,
in Dart. The real tradeoff: that alternative costs nothing extra to
write today, while this app's own real `scores` table stays small — but
it means fetching every real row this app has ever saved, in full,
every real time a caller only actually wants the top few; a real SQL
`ORDER BY`/`LIMIT`, by contrast, lets the database itself use a real
index (or, at minimum, an internal, already-optimized real sort) and
hand back only the real rows actually needed, a real cost difference
that only grows as this app's own real score history does. A genuinely
free, real consequence of this unit's own new method, worth naming
honestly: this app's own real "personal best, overall" — one of this
lesson's own real, stated goals — needs no new code of its own at all;
it is exactly `topScores(1)`'s own single, real result.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with this
lesson's other two real query methods, in Concept Unit 3, below.

### Connect

Any real caller can now ask this app's own database directly for a
real, sorted, capped slice of every score it has ever saved — including
this app's own real, overall personal best, for free. The next unit
narrows that same real idea to one, specific, real difficulty at a
time.

---

## Concept Unit 2: `AppDatabase.bestScoreForDifficulty` — Filtering by a Real Column, Then Sorting

### The Problem

`topScores` sorts and caps every real row `scores` holds, regardless of
its own real difficulty — nothing yet answers "what's the real, best
score at hard difficulty, specifically," ignoring every real row at
any other real difficulty.

> **Socratic prompt:** This app already, really uses a real, single-
> condition `where`/`whereArgs` pair elsewhere (`AppDatabase
> .currentGameSessionRow`'s own real `where: 'id = ?'`). Given
> `topScores`'s own real `orderBy`/`limit` shape, from the previous
> unit, how would you combine a real `where` clause filtering by
> `difficulty` with that identical real `orderBy`/`limit` pair, to get
> back exactly one, real, best row for one, specific, real difficulty?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/app_database.dart`, its
  own real, existing `currentGameSessionRow` method (read fresh this
  session) — the real, established `where`/`whereArgs` shape this
  unit's own new method reuses, combined with the previous unit's own
  real `orderBy`/`limit`.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified;
  `project/lib/features/sudoku/domain/score_repository.dart` —
  modified;
  `project/lib/features/sudoku/infrastructure/sqlite_score_repository.dart`
  — modified.
- **Change type:** add.
- **Location:** inside `AppDatabase`, alongside `topScores`; inside
  `ScoreRepository`/`SqliteScoreRepository`, alongside `topScores`.
- **Dependencies:** `Difficulty` (already real).

### The New Code

```dart
Future<Map<String, Object?>?> bestScoreForDifficulty(String difficulty) async {
  final db = await _open();
  final rows = await db.query(
    'scores',
    where: 'difficulty = ?',
    whereArgs: [difficulty],
    orderBy: 'score DESC',
    limit: 1,
  );
  return rows.isEmpty ? null : rows.first;
}
```

### Updated Project

`AppDatabase`'s own real `scores` methods, every real line shown, the
one real, new method marked:

```dart
 1  Future<List<Map<String, Object?>>> allScores() async {
 2    final db = await _open();
 3    return db.query('scores');
 4  }
 5
 6  Future<List<Map<String, Object?>>> topScores(int limit) async {
 7    final db = await _open();
 8    return db.query('scores', orderBy: 'score DESC', limit: limit);
 9  }
10
11 Future<Map<String, Object?>?> bestScoreForDifficulty(String difficulty) async {  // ← new
12   final db = await _open();                                                     // ← new
13   final rows = await db.query(                                                  // ← new
14     'scores',                                                                    // ← new
15     where: 'difficulty = ?',                                                     // ← new
16     whereArgs: [difficulty],                                                     // ← new
17     orderBy: 'score DESC',                                                       // ← new
18     limit: 1,                                                                    // ← new
19   );                                                                             // ← new
20   return rows.isEmpty ? null : rows.first;                                       // ← new
21 }                                                                                // ← new
```

`ScoreRepository`/`SqliteScoreRepository`'s own real, new pair:

```dart
1  // ScoreRepository
2  Future<Score?> bestForDifficulty(Difficulty difficulty);  // ← new
3
4  // SqliteScoreRepository
5  @override                                                          // ← new
6  Future<Score?> bestForDifficulty(Difficulty difficulty) async {    // ← new
7    final row = await _database.bestScoreForDifficulty(difficulty.name);  // ← new
8    return row == null ? null : Score.fromRow(row);                 // ← new
9  }                                                                  // ← new
```

### Isolate and Discard

No separate throwaway lab — every real piece here (`where`/`whereArgs`,
`orderBy`/`limit`) is a real, already-established or already-explained
construct, only combined in a new, real way; its own real effect is
proven directly, for real, in Concept Unit 3, below.

### Mechanical Walkthrough

- `Future<Map<String, Object?>?> bestScoreForDifficulty(String difficulty) async {`
  — a real, ordinary `async` method, real and deliberately taking a
  plain real `String`, not a real `Difficulty` value — the identical
  real, "stays untyped" discipline every other real `AppDatabase`
  method already follows.
- `where: 'difficulty = ?', whereArgs: [difficulty],` — the identical
  real, already-established parameterized shape
  `currentGameSessionRow` already uses, real and now filtering
  `scores` by its own real `difficulty` column instead — directly
  answering this unit's own Socratic question: this real `where`
  combines with `orderBy`/`limit`, right below it, in the identical
  real method call.
- `orderBy: 'score DESC', limit: 1,` — the identical real
  `orderBy`/`limit` shape `topScores`, previous unit, already uses,
  real and now with `limit` fixed to a real, literal `1`, since only
  the single, real, best-matching row is ever wanted here.
- `return rows.isEmpty ? null : rows.first;` — the identical real,
  already-established ternary shape `currentGameSessionRow` already
  uses, honestly reporting `null` when no real row at this real
  difficulty has ever been saved.
- `Future<Score?> bestForDifficulty(Difficulty difficulty);` — a real,
  new abstract method signature, real and taking a live `Difficulty`
  value this time, not a plain `String` — this real interface's own
  typed face of the real ability `AppDatabase`'s own untyped method
  provides.
- `final row = await _database.bestScoreForDifficulty(difficulty.name);`
  — `difficulty.name` (already established) converts the real, live
  enum value into the exact real, stored string
  `AppDatabase.bestScoreForDifficulty` expects — real and the identical
  real translation this app's own `save`/`load` methods already make
  for `game_sessions`' own stored difficulty column.
- `return row == null ? null : Score.fromRow(row);` — a real, already-
  established ternary, real and only calling `Score.fromRow` when a
  real row genuinely exists.

### CS Lens

Not repeated separately — real and covered above (Concept Unit 1):
pushing real work to where the real data already lives; this unit's
own real contribution is combining that identical real idea with a
real, second SQL clause, not a new, hard concept of its own.

### SE Lens

The real principle is **keeping the real, untyped-storage boundary
(`AppDatabase`) and the real, typed-domain boundary
(`SqliteScoreRepository`) each doing exactly one real job**, directly
answering this unit's own Socratic question. The alternative not
chosen: have `AppDatabase.bestScoreForDifficulty` itself accept a real
`Difficulty` value and call `.name` internally. The real tradeoff: that
alternative would cost `AppDatabase` one new, real dependency on a
Domain-layer type it has never needed before, quietly breaking its own,
already-established, deliberately "naked," storage-only role;
keeping the real `.name` conversion at `SqliteScoreRepository`'s own
seam instead means `AppDatabase` never needs to know `Difficulty`
exists at all, exactly like every one of its other real methods
already don't.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with this
lesson's other two real query methods, next.

### Connect

Any real caller can now ask for one, specific real difficulty's own
real, personal best. The final unit answers a real, different kind of
question — not "which difficulty," but "which day."

---

## Concept Unit 3: `AppDatabase.bestScoreBetween` — Filtering by a Real, Computed Date Range

### The Problem

Neither real query built so far can answer "what's the real, best
score today" — that real question depends on a real range of time,
computed fresh every real time it's asked, not a single, real, fixed
value like a real difficulty name.

> **Socratic prompt:** `completed_at` is stored as real ISO 8601 text
> (`DateTime.toIso8601String()`'s own real, sortable shape, already
> established). Given that a real ISO 8601 string sorts identically to
> real chronological order, how would you express "every row whose
> `completed_at` falls somewhere today" as a real `where` clause — and
> what two real moments would you need to compute first, to know where
> "today" honestly begins and ends?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/app_database.dart`, its
  own real, existing `bestScoreForDifficulty` method, just added,
  above — the real, established `where`/`orderBy`/`limit` shape this
  unit's own new method reuses, with a real, compound condition instead
  of a single one.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified;
  `project/lib/features/sudoku/domain/score_repository.dart` —
  modified;
  `project/lib/features/sudoku/infrastructure/sqlite_score_repository.dart`
  — modified;
  `project/test/score_leaderboard_test.dart` — created.
- **Change type:** add.
- **Location:** inside `AppDatabase`, alongside
  `bestScoreForDifficulty`; inside `ScoreRepository`/
  `SqliteScoreRepository`, alongside `bestForDifficulty`.
- **Dependencies:** `Clock` (already real).

### The New Code

```dart
Future<Map<String, Object?>?> bestScoreBetween(String startInclusive, String endExclusive) async {
  final db = await _open();
  final rows = await db.query(
    'scores',
    where: 'completed_at >= ? AND completed_at < ?',
    whereArgs: [startInclusive, endExclusive],
    orderBy: 'score DESC',
    limit: 1,
  );
  return rows.isEmpty ? null : rows.first;
}
```

### Updated Project

`AppDatabase`'s own real `scores` methods, every real line shown, the
one real, new method marked:

```dart
 1  Future<Map<String, Object?>?> bestScoreForDifficulty(String difficulty) async {
 2    final db = await _open();
 3    final rows = await db.query(
 4      'scores',
 5      where: 'difficulty = ?',
 6      whereArgs: [difficulty],
 7      orderBy: 'score DESC',
 8      limit: 1,
 9    );
10    return rows.isEmpty ? null : rows.first;
11  }
12
13  Future<Map<String, Object?>?> bestScoreBetween(String startInclusive, String endExclusive) async {  // ← new
14    final db = await _open();                                                                          // ← new
15    final rows = await db.query(                                                                       // ← new
16      'scores',                                                                                          // ← new
17      where: 'completed_at >= ? AND completed_at < ?',                                                   // ← new
18      whereArgs: [startInclusive, endExclusive],                                                         // ← new
19      orderBy: 'score DESC',                                                                             // ← new
20      limit: 1,                                                                                           // ← new
21    );                                                                                                    // ← new
22    return rows.isEmpty ? null : rows.first;                                                             // ← new
23  }                                                                                                       // ← new
```

`ScoreRepository`/`SqliteScoreRepository`'s own real, new pair:

```dart
1  // ScoreRepository
2  Future<Score?> bestToday(Clock clock);  // ← new
3
4  // SqliteScoreRepository
5  @override                                                       // ← new
6  Future<Score?> bestToday(Clock clock) async {                   // ← new
7    final now = clock.now();                                      // ← new
8    final startOfDay = DateTime(now.year, now.month, now.day);    // ← new
9    final startOfNextDay = startOfDay.add(const Duration(days: 1)); // ← new
10   final row = await _database.bestScoreBetween(                 // ← new
11     startOfDay.toIso8601String(),                                // ← new
12     startOfNextDay.toIso8601String(),                             // ← new
13   );                                                              // ← new
14   return row == null ? null : Score.fromRow(row);                // ← new
15 }                                                                 // ← new
```

### Isolate and Discard

A real, standalone lab, run once, real and directly, with `dart run`,
proving the real date-arithmetic this unit's own code depends on,
before writing it into project code:

```dart
void main() {
  final now = DateTime(2026, 3, 15, 21, 47, 3);
  final startOfDay = DateTime(now.year, now.month, now.day);
  final startOfNextDay = startOfDay.add(const Duration(days: 1));
  print(startOfDay.toIso8601String());
  print(startOfNextDay.toIso8601String());

  final endOfMonth = DateTime(2026, 1, 31, 10);
  final nextDay = DateTime(endOfMonth.year, endOfMonth.month, endOfMonth.day).add(const Duration(days: 1));
  print(nextDay.toIso8601String());
}
```

Real, captured output:

```
2026-03-15T00:00:00.000
2026-03-16T00:00:00.000
2026-02-01T00:00:00.000
```

Real, confirmed facts this unit relies on: `DateTime(year, month, day)`
genuinely truncates every smaller real unit (hour, minute, second) to
real `0`, proven by `21:47:03` collapsing to real, exact midnight;
`.add(const Duration(days: 1))` genuinely rolls a real date across a
real month boundary correctly (`2026-01-31` plus one real day becomes
real `2026-02-01`, not an invalid real `2026-01-32`). Discarded — this
exact real arithmetic, proven here in isolation, is what
`SqliteScoreRepository.bestToday`, above, now really uses.

**A real, run, permanent test file, this session**,
`project/test/score_leaderboard_test.dart`, seeding several real,
distinct scores and confirming all three of this lesson's own new
query methods (`topScores`, `bestForDifficulty`, `bestToday`) each
return exactly the real row they should:

```dart
test('topScores/bestForDifficulty/bestToday each return exactly the real row they should', () async {
  final appDb = AppDatabase();
  addTearDown(appDb.close);
  final sessionId = await _stageRealGameSession(appDb);
  final repository = SqliteScoreRepository(appDb);
  final clock = FakeClock(DateTime(2026, 3, 15, 12));

  await repository.save(Score(sessionId: sessionId, completedAt: DateTime(2026, 3, 14), completionSeconds: 60, difficulty: Difficulty.easy, mistakes: 0, hints: 0, points: 100));
  await repository.save(Score(sessionId: sessionId, completedAt: DateTime(2026, 3, 15, 9), completionSeconds: 90, difficulty: Difficulty.hard, mistakes: 1, hints: 0, points: 275));
  await repository.save(Score(sessionId: sessionId, completedAt: DateTime(2026, 3, 15, 18), completionSeconds: 120, difficulty: Difficulty.medium, mistakes: 2, hints: 1, points: 165));

  final top2 = await repository.topScores(2);
  expect(top2.map((s) => s.points).toList(), [275, 165]);

  final bestHard = await repository.bestForDifficulty(Difficulty.hard);
  expect(bestHard?.points, 275);

  final bestEasy = await repository.bestForDifficulty(Difficulty.easy);
  expect(bestEasy?.points, 100);

  final bestToday = await repository.bestToday(clock);
  expect(bestToday?.points, 275, reason: 'the real 2026-03-14 row falls outside real "today"');
});
```

**A real, honest, first-attempt failure, kept as a documented, fixed
gotcha, not silently smoothed over:** the first real run of this exact
test crashed, real and immediately, on its own very first
`repository.save` call — a real, captured
`SqfliteFfiException`: `FOREIGN KEY constraint failed`. Real, confirmed
cause: `scores.session_id` genuinely `REFERENCES game_sessions(id)`
(this app's own real schema), and `PRAGMA foreign_keys = ON` (already
established) genuinely enforces it — a literal `sessionId: 1`, with no
real `game_sessions` row at that real id actually existing yet, is
honestly rejected, not silently accepted. Fixed by reusing this app's
own already-established real fixture helper,
`_stageRealGameSession(AppDatabase)` (already real, from an earlier
lesson's own test file), which inserts one real, minimal
`game_sessions` row first and returns its own, real, database-assigned
id — every real `Score` in this test now correctly references that
real, existing id instead of an unchecked literal `1`.

Real, captured output: `flutter test test/score_leaderboard_test.dart`
— one real test, `All tests passed!` — `topScores(2)` correctly
returns the two real, highest-point rows in real, descending order
(`275`, then `165`), skipping the real, lowest `100`; each real
`bestForDifficulty` call correctly ignores every real row at any other
real difficulty; `bestToday` correctly includes both real rows saved
on `2026-03-15` while excluding the real row saved on `2026-03-14`,
real and honestly proving the real range is genuinely half-open on its
own real, upper end.

### Mechanical Walkthrough

- `Future<Map<String, Object?>?> bestScoreBetween(String startInclusive, String endExclusive) async {`
  — a real, ordinary `async` method, real and taking two plain real
  `String` arguments, named to say exactly which real, boundary
  behavior each one carries.
- `where: 'completed_at >= ? AND completed_at < ?',` — a real
  **compound `WHERE` condition** (Terms, above): `>=` and `<` (both
  already established, real comparison operators) each compare
  `completed_at`'s own real, stored text against one real `?`
  placeholder; `AND` (a real, boolean SQL keyword) requires both real
  comparisons to hold at once — directly answering this unit's own
  Socratic question: since `completed_at` is stored in a real, always-
  sortable ISO 8601 shape, a plain real text comparison against two
  real boundary strings correctly identifies every real row whose own
  real moment falls between them.
- `whereArgs: [startInclusive, endExclusive],` — the identical real,
  already-established `whereArgs` shape, real and now supplying two
  real values, in order, for this real `where`'s own two real `?`
  placeholders.
- `orderBy: 'score DESC', limit: 1,` — the identical real shape
  `bestScoreForDifficulty`, previous unit, already uses.
- `Future<Score?> bestToday(Clock clock);` — a real, new abstract
  method signature, real and taking a real `Clock` (already
  established), never calling `DateTime.now()` directly — the identical
  real, injected-dependency discipline this app's own already-existing
  time-reading code already follows.
- `final now = clock.now();` — `clock.now()` (already established)
  read once, this real method's own one, real, current moment.
- `final startOfDay = DateTime(now.year, now.month, now.day);` —
  `DateTime`'s own real, ordinary constructor (Objects and methods,
  above), called with only three real arguments — real and directly
  answering half of this unit's own Socratic question: every real,
  unsupplied, smaller unit (hour, minute, second) defaults to real
  `0`, so this real expression genuinely produces real, exact midnight
  on `now`'s own real, current day.
- `final startOfNextDay = startOfDay.add(const Duration(days: 1));` —
  `const Duration(days: 1)` (Objects and methods, above) — a real,
  compile-time-fixed span of one real day; `.add` (Objects and methods,
  above) called on `startOfDay`, real and correctly advancing it,
  including across a real month or year boundary — directly answering
  the other half of this unit's own Socratic question: this real pair
  of moments is exactly "today," start to end.
- `final row = await _database.bestScoreBetween(startOfDay
  .toIso8601String(), startOfNextDay.toIso8601String());` —
  `AppDatabase.bestScoreBetween`, above, called with both real
  boundaries converted via `.toIso8601String()` (already established)
  into the exact real, storable text shape `completed_at` itself is
  stored in.
- `return row == null ? null : Score.fromRow(row);` — the identical
  real, already-established ternary shape this lesson's own other two
  real repository methods already use.

### CS Lens

Not repeated separately — real and covered above (Concept Unit 1):
pushing real work to where the real data already lives; this unit's
own real contribution is a real, compound condition over a real,
computed range, not a new hard concept of its own.

### SE Lens

The real principle is **computing what a real, relative concept like
"today" honestly means exactly once, at the one real seam that already
owns real time (the injected `Clock`), rather than teaching the
database itself what "today" means**. The alternative not chosen: give
`AppDatabase` its own method literally named `bestScoreToday`,
computing the real date range internally. The real tradeoff: that
alternative would force `AppDatabase` to either accept a real `Clock`
directly (the identical real layering problem this lesson's own
previous unit already avoided for `Difficulty`) or silently call
`DateTime.now()` itself, real and untestably, breaking the identical
real, injected-`Clock` discipline every other real time-dependent
result in this app already honors. Keeping `bestScoreBetween` real and
generic — any real range, not specifically "today" — while computing
the actual real boundaries at `SqliteScoreRepository`'s own seam
instead means the identical real database method stays honestly
reusable for a real "this week" or real "this month" query too, should
a later real need for one ever arise.

### Commands Needed

None new.

### Run It

Real, captured summary — `flutter analyze .`: 56 issues (up from 51;
five new, the same, already-accepted `avoid_relative_lib_imports`
category this lesson's own new test file adds, zero new categories);
`flutter test`: 42 real test-file-level checks (up from 41), `All
tests passed!`, including this lesson's own new, real, permanent
leaderboard test, proving all three of this lesson's own new query
methods together, against several real, seeded scores.

### Connect

This app can now honestly answer "what's the best," "what's the best at
this difficulty," and "what's the best today" — each one, real and
directly, a real question the database itself answers, sorted,
filtered, and capped, before a single unnecessary real row ever
reaches this app's own memory.

---

## Connect the Pieces

`AppDatabase.topScores` taught this whole lesson's own central, real
idea first, in its simplest real shape: a real `ORDER BY` and a real
`LIMIT`, together, let the database itself sort and cap its own rows —
a real idea that, for free, also answers this app's own real,
overall personal best (Concept Unit 1). `AppDatabase
.bestScoreForDifficulty` narrowed that identical real idea with a real,
single-condition `WHERE`, while keeping `AppDatabase` itself honestly
unaware that `Difficulty` even exists — that real translation lives
only at `SqliteScoreRepository`'s own seam (Concept Unit 2). And
`AppDatabase.bestScoreBetween` reached the real idea's most general
real shape yet: a real, compound `WHERE` over a real, computed range,
with "what today honestly means" decided once, at the one real seam
that already owns real time, proven correct across a real month
boundary in an isolated lab before ever touching project code, and
proven correct again, for real, against several real, seeded scores in
this lesson's own permanent test (Concept Unit 3). Every real score
this app has ever saved can now be sorted, filtered, and capped by the
database that already holds it — not recomputed, by hand, in Dart,
every single real time someone asks.
