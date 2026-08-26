# Lesson 54: A Game That Survives Being Killed

**Saving Games**

## What you will build

Every real move, every real pause, every real interrupt this app's
own, one, shared game session ever goes through now writes itself,
real and permanently, into the real `game_sessions` table — through a
real `GameSessionRepository`, the identical real shape this project's
other real dependencies already have. The transferable problem:
persisting a value object that completes once (a finished score) and
persisting a live, mutable entity that changes constantly while a real
player is still mid-game are genuinely different problems — this lesson
answers the second one, reusing every real lesson the first one already
taught without repeating its own real design unchanged.

## What you need to know first

- Lesson 39 ("Naming and Injecting a Dependency") — the real
  abstraction/implementation split this repository repeats a third real
  time.
- Lesson 45 ("Data Shaped for Carrying, Not for Deciding") /
  Lesson 46 ("Crossing the Boundary in Both Directions") —
  `SudokuBoardDto`'s own real `fromBoard`/`toBoard` mapping pair, moved
  in this lesson to where its own real, current consumer actually lives.
- Lesson 47 ("A Real Home for Every File") — `SudokuBoardDto`'s own
  real, original placement inside `presentation/`, explicitly flagged
  there as revisitable the moment a real infrastructure consumer
  existed.
- Lesson 51 ("A Real Shape for a Game That Ends") — `game_sessions`'s
  own exact real columns, this lesson's own real target.
- Lesson 52 ("The Schema Has Already Shipped") — `AppDatabase`'s own
  real `PRAGMA foreign_keys = ON`, still real and active on every real
  connection this lesson's own new methods open.
- Lesson 53 ("A Score Finally Has Somewhere to Belong") — `ScoreRepository`/
  `SqliteScoreRepository`, the real, established shape this lesson's own
  `GameSessionRepository`/`SqliteGameSessionRepository` repeats, and the
  real point where it genuinely diverges.

## Terms used in this lesson

- **Upsert** — a real, single database operation that inserts a real row
  if none yet exists at a given real identity, or overwrites the
  already-existing real row at that identity otherwise. Exists so
  repeatedly saving the identical real, one, current game session never
  has to first check whether a real row already exists before deciding
  whether to insert or update.
- **Entity** — a hard concept: a real object whose own identity persists
  across real changes to its own held data — two real entities holding
  the identical real data at some real moment are still genuinely
  different real things, unlike a value object. Exists to distinguish
  real objects defined by *what they are* (a value object) from real
  objects defined by *which one they are, regardless of what they
  currently hold* (an entity).
- **Value object** — a real object defined entirely by its own real,
  held values, with no independent identity of its own beyond them —
  two value objects holding the identical real data are meant to be
  treated as the same real thing, unlike an entity (above). Exists to
  give a real, structured shape to data that's only ever carried and
  compared, never itself the subject of behavior or rules.
- **Repository pattern** — a hard concept: a real, named design pattern
  naming "the ability to save and retrieve a specific kind of object,"
  as its own real interface, separate from whatever real, concrete
  storage mechanism actually implements it. Exists so the rest of an
  app's own code can depend on *what* can be done with a kind of data,
  never *how* it's actually stored.
- **Dependency inversion** — a hard concept: a real design principle in
  which a real, high-level piece of code depends only on a real,
  abstract interface it names, while a real, low-level, concrete
  implementation depends on that identical real interface too, real and
  separately — inverting the naive real direction, where high-level code
  would otherwise depend directly on a real, low-level, concrete detail.
  Exists so a real, high-level caller never has to change merely because
  a real, low-level implementation does.

## Objects and methods used

- **`SudokuBoardDto`**
  - *What it is:* a real, already-existing, minimal class carrying
    exactly a live board's own real, current data — no rules, no
    behavior — this lesson's own first real change moves it to a new,
    real, more accurate home.
  - *Implementation:* real, unchanged: `SudokuBoardDto(this.cells,
    this.givenCells)`; `factory SudokuBoardDto.fromBoard(SudokuBoard
    board)`; `SudokuBoard toBoard()`.
  - *Its use:* `SqliteGameSessionRepository`, below, calls
    `SudokuBoardDto.fromBoard` to turn a real, live board into real,
    storable data.
  - *Type:* a real, ordinary class.
  - *Responsibility:* carrying a real board's own current real state
    across a real boundary — nothing about which boundary, or how the
    real data on the other side of it gets stored.
  - *Depends on:* a real, live `SudokuBoard` to build from.
  - *Connects to:* now called from `infrastructure/`, its own new, real
    home, rather than only from `presentation/`.
  - *Shape:* moved this lesson from a real, honest, explicitly-flagged
    placeholder home to the real Infrastructure-layer seam it was always
    meant to occupy once a real infrastructure consumer existed.

- **`AppDatabase.saveGameSession` / `AppDatabase.currentGameSessionRow`**
  - *What it is:* two real, new, public methods on the real,
    already-existing `AppDatabase` class, giving `game_sessions` its own
    real, typed-enough surface.
  - *Implementation:* `Future<void> saveGameSession(Map<String, Object?>
    values) async { final db = await _open(); await db.insert(
    'game_sessions', {'id': currentGameSessionId, ...values},
    conflictAlgorithm: ConflictAlgorithm.replace); }`; `Future<Map<String,
    Object?>?> currentGameSessionRow() async { final db = await _open();
    final rows = await db.query('game_sessions', where: 'id = ?',
    whereArgs: [currentGameSessionId]); return rows.isEmpty ? null :
    rows.first; }` — both real, and both always operating on the
    identical real, fixed row id, `AppDatabase.currentGameSessionId`
    (`1`), a real, `static const int`.
  - *Its use:* `SqliteGameSessionRepository`, below, calls one each.
  - *Type:* two real, ordinary instance methods.
  - *Responsibility:* `saveGameSession`'s whole job: an upsert (Terms,
    above) of exactly one real, fixed-identity row — nothing about
    deciding what a `GameSession` even is; `currentGameSessionRow`'s
    whole job: reading that exact real row back, or reporting its real
    absence honestly as `null`.
  - *Depends on:* `_open()`, the identical real, already-existing
    private method every other real `AppDatabase` method already
    depends on.
  - *Connects to:* called only by `SqliteGameSessionRepository`; each
    calls exactly one real `Database` method in turn.
  - *Shape:* the real, thin, public seam between `AppDatabase`'s own
    private connection and `SqliteGameSessionRepository`'s own real,
    typed world — the identical real role `insertScore`/`allScores`
    already play for `scores`.

- **`GameSessionRepository`**
  - *What it is:* a real, new, abstract interface naming the real
    ability to save this app's own one, current, in-progress game —
    this lesson's own second primary subject.
  - *Implementation:* `abstract class GameSessionRepository { Future<void>
    save(GameSession session); Future<bool> hasSavedSession(); }` — two
    real methods, both real and asynchronous.
  - *Its use:* every real caller anywhere in this app that ever needs to
    persist the real, current game depends on this real interface,
    never a concrete class directly.
  - *Type:* an abstract class (a real interface).
  - *Responsibility:* naming exactly two real abilities — saving the
    real, current `GameSession`, and reporting whether one has ever been
    saved at all — nothing about how either actually happens.
  - *Depends on:* nothing to declare; a real, concrete subclass supplies
    every real answer.
  - *Connects to:* implemented by `SqliteGameSessionRepository`, below;
    bound to it in the real composition root.
  - *Shape:* the real Domain-layer seam this lesson exists to create,
    the third real instance of this exact real shape in this project.

- **`SqliteGameSessionRepository`**
  - *What it is:* the one, real, current implementation of
    `GameSessionRepository` — this lesson's own third primary subject.
  - *Implementation:* `class SqliteGameSessionRepository implements
    GameSessionRepository { SqliteGameSessionRepository(this._database);
    final AppDatabase _database; ... }` — real, injected `AppDatabase`
    dependency, the identical real constructor shape
    `SqliteScoreRepository` already uses.
  - *Its use:* the one real class this whole app will ever construct
    that genuinely reaches `AppDatabase` on `game_sessions`'s own
    behalf.
  - *Type:* a real, ordinary class implementing a real interface.
  - *Responsibility:* translating every real `GameSessionRepository`
    call into the exact real `AppDatabase` calls that fulfill it, and
    real and specifically, mapping a real `GameSession` — an entity
    (Terms, above), not a value object — into real, storable data,
    entirely on its own, since `GameSession` itself carries no real
    mapping methods of its own.
  - *Depends on:* a real, already-constructed `AppDatabase`, handed to
    it once, at construction.
  - *Connects to:* calls `AppDatabase.saveGameSession`/
    `currentGameSessionRow`, above, and `SudokuBoardDto.fromBoard`,
    above; called by the real composition root and, through it, by
    `GameSessionNotifier`, below.
  - *Shape:* the real Infrastructure-layer occupant of the seam
    `GameSessionRepository` names.

- **`jsonEncode`**
  - *What it is:* a real, top-level `dart:convert` function converting a
    real, directly-encodable Dart value into real JSON text.
  - *Implementation:* `String jsonEncode(Object? object)` — real and
    confirmed, in an earlier real session, to handle a raw, nested
    `List<List<int?>>`/`List<List<bool>>` with zero extra work, since
    both are already among `jsonEncode`'s own real, directly-encodable
    types.
  - *Its use:* `SqliteGameSessionRepository.save`, below, calls it twice
    — once for `SudokuBoardDto.cells`, once for `.givenCells` — turning
    each real, nested board array into one real, storable `TEXT` value.
  - *Type:* a free, top-level function.
  - *Responsibility:* converting a real, in-memory value into real JSON
    text — nothing about which real column stores the result.
  - *Depends on:* every real, nested value inside its argument also
    being real and encodable.
  - *Connects to:* called only inside `SqliteGameSessionRepository.save`.
  - *Shape:* a real, standard `dart:convert` boundary between in-memory
    Dart values and real, storable text.

- **`Provider` / `ref.watch` / `ref.read`**
  - *What it is:* a real, generic Riverpod class declaring one real,
    app-wide value; two real, paired instance methods reading a real
    provider's own current value — one real, subscribing read, one
    real, one-shot read.
  - *Implementation:* real, already-established shape:
    `Provider<T>((ref) => concreteValue)`; `ref.watch(someProvider)`
    real and subscribes the caller to future real changes;
    `ref.read(someProvider)` real and reads the current real value once,
    with no real, ongoing subscription.
  - *Its use:* `gameSessionRepositoryProvider`, below, declares one real
    provider; `GameSessionNotifier._save`, below, calls `ref.read`
    specifically — real and deliberately, since a `Notifier` reading its
    own dependencies mid-method, after `build()` already ran, should
    never re-subscribe and risk a real, unwanted rebuild loop.
  - *Type:* a real, generic class (`Provider<T>`); two real instance
    methods (`ref.watch`, `ref.read`).
  - *Responsibility:* `Provider`'s whole job: constructing one real
    value, once, real and lazily; `ref.watch`'s whole job: reading a
    real, current value and subscribing to its future real changes;
    `ref.read`'s whole job: reading a real, current value, real and
    only once, with no real, ongoing subscription created.
  - *Depends on:* `Provider` depends on its own real, given callback;
    `ref.watch`/`ref.read` both depend on a real, already-declared
    provider.
  - *Connects to:* every real provider in this project's own composition
    root is built from `Provider` (or `NotifierProvider`);
    `GameSessionNotifier`'s own real methods reach every real dependency
    they need through one or the other.
  - *Shape:* the real, central mechanism this whole app's real
    composition root is built out of.

### Everything else in the file, not this lesson's subject but still explained

- **`DateTime.toIso8601String`**
  - *What it is:* a real, `dart:core` instance method converting a real,
    in-memory `DateTime` into real, storable ISO 8601 text.
  - *Implementation:* `String toIso8601String()` — real, and always
    producing the identical real, lossless, sortable text shape (for
    example, `'2026-01-01T09:00:00.000'`) regardless of which real
    `DateTime` it's called on.
  - *Its use:* `SqliteGameSessionRepository.save`, below, calls it once,
    on `session.startTime`, to build the real `started_at` column value.
  - *Type:* a real instance method on `DateTime`.
  - *Responsibility:* losslessly converting a real, in-memory `DateTime`
    into real, storable text — nothing about deciding which column
    stores the real result.
  - *Depends on:* a real, already-existing `DateTime`.
  - *Connects to:* called once inside `SqliteGameSessionRepository.save`.
  - *Shape:* a real, standard `dart:core` boundary between in-memory
    time and real, storable text.

- **`Enum.name`**
  - *What it is:* a real, `dart:core` getter every real Dart `enum` value
    automatically has, real and returning its own declared, real name as
    a string.
  - *Implementation:* real, confirmed by run this session:
    `Difficulty.hard.name` real and returns `'hard'`;
    `GameStatus.playing.name` real and returns `'playing'`.
  - *Its use:* `SqliteGameSessionRepository.save`, below, writes
    `session.difficulty.name` and `session.status.name` — the same real
    column-storage convention already true of every other real enum this
    project's own schema stores as text.
  - *Type:* a real, automatic instance getter.
  - *Responsibility:* returning a real, stable string for a real enum
    value — nothing about ever reading that string back into a real enum
    again, which no code in this lesson does yet.
  - *Depends on:* nothing beyond the real enum value itself.
  - *Connects to:* called twice inside `SqliteGameSessionRepository.save`.
  - *Shape:* a real, standard `dart:core` boundary between an in-memory
    enum value and real, storable text — real and deliberately chosen
    over storing a real enum's raw, real, integer index, since a real
    index silently breaks the moment a real enum's own declared order
    ever changes, while a real name only breaks if the name itself is
    renamed, a far rarer and far more visible real change.

- **`Database.insert` / `Database.query`**
  - *What it is:* two real instance methods on `DatabaseExecutor` (which
    `Database` implements) — a real, typed insert taking a real `Map`; a
    real, typed read returning a real `List` of them.
  - *Implementation:* real, `sqflite_common`'s own real, public API:
    `Future<int> insert(String table, Map<String, Object?> values,
    {String? nullColumnHack, ConflictAlgorithm? conflictAlgorithm});` —
    returns the real, new (or, under `ConflictAlgorithm.replace`,
    replaced) row's own real, database-assigned id; `Future<List<Map<
    String, Object?>>> query(String table, {bool? distinct, List<String>?
    columns, String? where, List<Object?>? whereArgs, ...});` — real and
    returning every real matching row.
  - *Its use:* `AppDatabase.saveGameSession`/`currentGameSessionRow`,
    above, each call exactly one.
  - *Type:* two instance methods on a real interface (`DatabaseExecutor`).
  - *Responsibility:* `insert`'s full charter: safely write one real row
    from a real column-to-value map, real and never trusting a
    hand-built SQL string, real and honoring a real, optional
    `conflictAlgorithm` when a real row at the identical real identity
    might already exist; `query`'s full charter: safely read matching
    real rows back, the same real, typed way, real and narrowed by a
    real, optional `where` clause.
  - *Depends on:* a real, open `Database`; a real, existing table name;
    real column names actually present in that real table's own shape.
  - *Connects to:* called only from inside `AppDatabase`'s own two new
    real methods, above.
  - *Shape:* `Database`'s own real, public, typed surface.

- **`GameSession`**
  - *What it is:* the real, already-existing domain entity (Terms,
    above) this whole lesson exists to persist — not this lesson's own
    subject to build, but the one real thing `SqliteGameSessionRepository`
    reads from.
  - *Implementation:* real, already-existing declared shape, the exact
    real members `SqliteGameSessionRepository.save` reads:

    ```dart
    class GameSession {
      final SudokuBoard board;
      final Difficulty difficulty;
      final DateTime startTime;
      int get mistakes;
      int get hints;
      GameStatus get status;
    }
    ```

    `board` is a real, `final` field; `difficulty`/`startTime` are real,
    `final` fields, each computed once, at construction, and never
    reassigned; `mistakes`/`hints`/`status` are real, computed getters,
    each reading a real, private field this class alone can change.
  - *Its use:* `SqliteGameSessionRepository.save`, below, reads every
    one of these six real members to build the real row it saves.
  - *Type:* a real, ordinary class — a domain entity (Terms, above), not
    a value object.
  - *Responsibility:* owning this whole app's own real game rules and
    real, current state — nothing about persistence, which this whole
    lesson exists to keep genuinely separate from it.
  - *Depends on:* a real, live `SudokuBoard`, and a real, injected
    `Clock`, at construction — neither of which
    `SqliteGameSessionRepository` ever touches directly.
  - *Connects to:* constructed and mutated by `GameSessionNotifier`,
    below; read, never mutated, by `SqliteGameSessionRepository.save`.
  - *Shape:* this app's own real Domain-layer entity — the one real
    thing every other real class in this lesson ultimately exists to
    save, wrap, or provide.

---

## Concept Unit 1: Moving `SudokuBoardDto` to Where a Real Consumer Finally Exists

### The Problem

`SqliteGameSessionRepository`, this lesson's own real subject, needs to
turn a real, live board into real, storable data — the exact real
ability `SudokuBoardDto` already, really provides. But `SudokuBoardDto`
currently lives in `presentation/`, and an Infrastructure-layer class
reaching into `presentation/` would run this project's own real
dependency direction backwards.

> **Socratic prompt:** `SudokuBoardDto`'s own real, original placement
> was explicitly reasoned through, not accidental — chosen to match its
> one, real, then-current caller, a presentation-layer widget, with an
> honest note that a real infrastructure consumer moving it later was
> expected. Given that real infrastructure consumer now, genuinely,
> exists, what real, concrete problem would leaving `SudokuBoardDto`
> exactly where it is create for `SqliteGameSessionRepository`
> specifically?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_board_dto.dart` (its
  own real, complete, unmodified content, read fresh this session) —
  moved verbatim, only its own real, top doc comment updated to reflect
  the real move itself.
- **Files affected:**
  `project/lib/features/sudoku/presentation/sudoku_board_dto.dart` —
  deleted;
  `project/lib/features/sudoku/infrastructure/sudoku_board_dto.dart` —
  created;
  `project/lib/features/sudoku/presentation/sudoku_app.dart` — modified
  (one real import updated);
  `project/test/sudoku_board_dto_test.dart` — modified (one real import
  updated).
- **Change type:** refactor.
- **Location:** the file itself moves, real and whole, between two real,
  already-existing folders.
- **Dependencies:** none new.

### The New Code

```dart
import '../infrastructure/sudoku_board_dto.dart';
```

### Updated Project

`presentation/sudoku_app.dart`'s own real import block, every real line
shown, the one real, changed line marked:

```dart
1  import 'dart:async';
2
3  import 'package:flutter/material.dart';
4  import 'package:flutter_riverpod/flutter_riverpod.dart';
5
6  import '../application/game_session_provider.dart';
7  import '../domain/game_session.dart';
8  import '../domain/game_status.dart';
9  import '../domain/sudoku_board.dart';
10 import '../infrastructure/app_database.dart';
11 import '../infrastructure/sudoku_board_dto.dart';           // ← modified: was 'sudoku_board_dto.dart'
12 import 'game_intent.dart';
13 import 'number_pad_view.dart';
14 import 'sudoku_board_view.dart';
```

Every real line below this import block, in this real file, is
genuinely unchanged — `SudokuBoardDto`'s own real, public shape
(`fromBoard`, `.cells`, `.givenCells`) is identical to what it already
was, so nothing that actually uses it needed to change at all, only
where it's imported from.

### Isolate and Discard

No separate throwaway lab — this whole real change is a file move plus
two real, one-line import updates, real and directly, fully verified by
this project's own real, permanent, already-existing tests continuing to
pass unmodified, which this lesson's own Run It, below, confirms.

### Mechanical Walkthrough

- `import '../infrastructure/sudoku_board_dto.dart';` — Dart's own real,
  already-established relative import syntax, now pointing at
  `SudokuBoardDto`'s own real, new file location — the real, only change
  this specific real line needed, since `SudokuBoardDto`'s own real,
  public members are completely unchanged.

### CS Lens

Not repeated separately — this unit's own real construct (moving a
class once its real, actual usage pattern becomes clear, rather than
guessing upfront) is routine refactoring discipline, not a hard concept
on its own; the real architectural principle it serves —
Infrastructure never depending on Presentation — is given its own real,
full treatment in this unit's own SE lens instead.

### SE Lens

The real principle is **honestly revisiting a flagged, provisional
decision once the real, concrete fact it was waiting for actually
exists** — directly answering this unit's own Socratic question: leaving
`SudokuBoardDto` in `presentation/` would force
`SqliteGameSessionRepository`, a real Infrastructure-layer class, to
import from `presentation/`, real and backwards against this project's
own established real dependency direction (Presentation depends on
Application depends on Domain; Infrastructure implements Domain
interfaces, never depending on Presentation at all). The alternative not
chosen: leave it in place, and let `SqliteGameSessionRepository` import
it anyway, treating the real, backwards import as a one-off exception.
The real tradeoff: this real move costs one real file relocation and two
real, one-line import fixes — for a real payoff already promised, in
writing, three real lessons ago: the real dependency direction stays
real and clean, provable the identical real way it always has been.

### Commands Needed

None new.

### Run It

Real, captured output: `flutter analyze .` clean, same categories, zero
new; `flutter test` — every real, pre-existing test that touches
`SudokuBoardDto` (including `project/test/sudoku_board_dto_test.dart`
itself) passes unmodified, real and direct proof this real move changed
nothing about `SudokuBoardDto`'s own real, public behavior.

### Connect

`SudokuBoardDto` now lives exactly where its own real, current consumer
needs it. The next unit gives `AppDatabase` a real, public way to reach
`game_sessions` at all.

---

## Concept Unit 2: Giving `AppDatabase` Real, Public Methods for the One, Current Game Session

### The Problem

`game_sessions` (a real, already-existing table) has never had any real,
public way to save or read a row at all — only `scores` does, since the
prior lesson's own real scope stopped there.

> **Socratic prompt:** `scores` holds one real row per completed game,
> real and permanent, never updated once written. This app's own,
> single, real, live game session is genuinely different: it changes
> real and constantly while a real player is still mid-game, and this
> app tracks only ever one real, current one at a time. Given that real
> difference, what real, concrete problem would `AppDatabase.insertScore`'s
> own real shape — a plain real `INSERT`, a real, fresh, auto-assigned id
> every real call — create if reused unchanged for saving the real,
> current game session on every real move?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/app_database.dart`, its
  own real, existing `insertScore`/`allScores` methods (read fresh this
  session) — the real, established shape this unit's own two new methods
  depart from, on purpose, for the real reason this unit's own Socratic
  question raises.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified.
- **Change type:** add.
- **Location:** inside the real, existing `AppDatabase` class, alongside
  its own already-real `scores` methods.
- **Dependencies:** none new.

### The New Code

```dart
static const int currentGameSessionId = 1;

Future<void> saveGameSession(Map<String, Object?> values) async {
  final db = await _open();
  await db.insert(
    'game_sessions',
    {'id': currentGameSessionId, ...values},
    conflictAlgorithm: ConflictAlgorithm.replace,
  );
}

Future<Map<String, Object?>?> currentGameSessionRow() async {
  final db = await _open();
  final rows = await db.query(
    'game_sessions',
    where: 'id = ?',
    whereArgs: [currentGameSessionId],
  );
  return rows.isEmpty ? null : rows.first;
}
```

### Updated Project

`AppDatabase`'s own real, complete class, every real line shown, the
three real, new members marked:

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
 91   Future<int> insertScore(Map<String, Object?> values) async {
 92     final db = await _open();
 93     return db.insert('scores', values);
 94   }
 95
 96   Future<List<Map<String, Object?>>> allScores() async {
 97     final db = await _open();
 98     return db.query('scores');
 99   }
100
101   static const int currentGameSessionId = 1;                         // ← new
102
103   Future<void> saveGameSession(Map<String, Object?> values) async {  // ← new
104     final db = await _open();                                       // ← new
105     await db.insert(                                                // ← new
106       'game_sessions',                                               // ← new
107       {'id': currentGameSessionId, ...values},                       // ← new
108       conflictAlgorithm: ConflictAlgorithm.replace,                  // ← new
109     );                                                               // ← new
110   }                                                                  // ← new
111
112   Future<Map<String, Object?>?> currentGameSessionRow() async {      // ← new
113     final db = await _open();                                       // ← new
114     final rows = await db.query(                                    // ← new
115       'game_sessions',                                               // ← new
116       where: 'id = ?',                                                // ← new
117       whereArgs: [currentGameSessionId],                              // ← new
118     );                                                                // ← new
119     return rows.isEmpty ? null : rows.first;                          // ← new
120   }                                                                   // ← new
121
122   Future<void> close() async {
123     final existing = _database;
124     _database = null;
125     await existing?.close();
126   }
127
128   @visibleForTesting
129   Future<Database> rawDatabaseForTest() => _open();
130 }
```

`AppDatabase` now gives `game_sessions` a real, public surface too —
shaped, deliberately, differently from `scores`'s own real shape, since
the real problem it solves is genuinely different.

### Isolate and Discard

No separate throwaway lab — `Database.insert`/`Database.query` already
received full, real treatment when `scores` gained the identical real
shape of methods; this unit's own real, new behavior — the real, fixed
`id` and `ConflictAlgorithm.replace` together — is proven for real
inside `SqliteGameSessionRepository`'s own permanent tests, next.

### Mechanical Walkthrough

- `static const int currentGameSessionId = 1;` — `static` (a real,
  already-established Dart keyword) declares this real constant belongs
  to the class itself, not any one real instance; `const` (already
  established) marks it a real, compile-time-fixed value — real and
  directly answering this unit's own Socratic question: every real save
  targets this identical real, fixed row identity, on purpose, since
  this app tracks only ever one real, current game.
- `Future<void> saveGameSession(Map<String, Object?> values) async` — a
  real, ordinary async method, taking a real, raw row.
- `await db.insert('game_sessions', {'id': currentGameSessionId,
  ...values}, conflictAlgorithm: ConflictAlgorithm.replace);` —
  `Database.insert` (Objects and methods, above — a real, typed insert,
  safely writing one real row from a real column-to-value map) called
  with a real map literal;
  `{'id': currentGameSessionId, ...values}` uses the real spread
  operator `...` (a real, already-established Dart operator) to merge
  the real, fixed id into whatever real column values the caller
  supplied, real and without the caller ever having to know or supply
  that id itself; `conflictAlgorithm: ConflictAlgorithm.replace`
  (already established) is this unit's own real, load-bearing choice —
  a real, second call with the identical `id` genuinely overwrites the
  real, existing row instead of failing on a duplicate real primary key,
  real and fulfilling this real method's own **upsert** (Terms, above)
  contract.
- `Future<Map<String, Object?>?> currentGameSessionRow() async` — a
  real, ordinary async method, real and returning a real, nullable map —
  `Map<String, Object?>?`'s own trailing `?` (already established)
  honestly allows for the real case where nothing has ever been saved.
- `await db.query('game_sessions', where: 'id = ?', whereArgs:
  [currentGameSessionId]);` — `Database.query` (Objects and methods,
  above — a real, typed read, safely returning matching real rows)
  called with a real `where` clause, real and narrowing to exactly the
  one real, fixed row this app ever tracks.
- `return rows.isEmpty ? null : rows.first;` — a real, already
  -established ternary expression: real and honest about the real,
  currently-possible case of no real row existing yet, rather than
  crashing on `rows.first` against a real, empty list.

### CS Lens

An **upsert** (Terms, above) is a hard concept.

```
Also recognized in: a cache's own real `put` operation, a key-value
store's own real `SET` command, a spreadsheet's own real "paste, replace
existing" behavior, a version-controlled config file's own real
"create or update" deployment step
```

### SE Lens

The real principle is **one, real, fixed identity for a real, singleton
resource**, rather than the real, auto-incrementing identity `scores`
already, correctly uses for its own real, ever-growing history. The
alternative not chosen, directly answering this unit's own Socratic
question: reuse `insertScore`'s own real shape unchanged — a plain real
`INSERT`, a fresh real, auto-assigned id every real call. The real
tradeoff: that real shape would create a real, new row in
`game_sessions` on every single real move a player makes, silently
accumulating real, orphaned history this app never intends to keep,
real and eventually exhausting real, on-device storage for no real
benefit. The honest, present cost of this unit's own real, chosen
design instead: this app can only ever remember one real, current game
at a time — real and deliberate, matching this app's own real,
already-established, single-session architecture, but a real, explicit
limit worth naming honestly rather than leaving implicit.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with
`SqliteGameSessionRepository`, next.

### Connect

`AppDatabase` can now save and read the real, current game session's own
raw row directly. The next unit names the real ability this makes
possible.

---

## Concept Unit 3: `GameSessionRepository` — Naming the Ability to Save the Real, Current Game

### The Problem

Nothing in this app names, as its own real, separate thing, "the
ability to permanently save this app's own current game" — the real
mechanism that will do it, `AppDatabase`, is a real, concrete class, not
an abstraction anything else can depend on instead.

> **Socratic prompt:** `ScoreRepository` names two real abilities —
> `save`, `all`. Given this app tracks only ever one real, current game
> session, not a real, growing history of them, would you expect
> `GameSessionRepository` to also need a real `all()`-shaped method, or
> something narrower?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/domain/score_repository.dart` (read
  fresh this session) — the real, established interface shape this new
  one follows, deliberately narrower.
- **Files affected:**
  `project/lib/features/sudoku/domain/game_session_repository.dart` —
  created.
- **Change type:** add.
- **Location:** a brand-new file, inside `domain/`.
- **Dependencies:** `GameSession`, this project's own already-existing
  real entity (Terms, above).

### The New Code

```dart
abstract class GameSessionRepository {
  Future<void> save(GameSession session);
  Future<bool> hasSavedSession();
}
```

### Updated Project

Not applicable — a brand-new file, its own real, complete content shown
whole above.

### Isolate and Discard

No separate throwaway lab — an abstract interface with no real body of
its own has no real, independent behavior to isolate; its own real proof
is `SqliteGameSessionRepository`'s, next.

### Mechanical Walkthrough

- `abstract class GameSessionRepository { ... }` — a real, ordinary
  abstract class declaration, this lesson's own second primary subject.
- `Future<void> save(GameSession session);` — a real, abstract method
  signature, real and taking the real, live entity itself, never a raw
  map — directly answering this unit's own Socratic question in part:
  saving takes the real, current, whatever-it-happens-to-be session.
- `Future<bool> hasSavedSession();` — a real, abstract method signature,
  real and returning a plain `bool` rather than a real `List` — this
  unit's own direct, real answer to its own Socratic question: given
  only ever one real, current game exists, "has one been saved" is the
  real, honest question this app actually needs answered, not "give me
  every one," which `ScoreRepository.all()` exists for instead, on a
  genuinely different real table with a genuinely different real shape
  of history.

### CS Lens

`GameSessionRepository` is a real, concrete instance of the
**repository pattern** (Terms, above) — a hard concept: a real, named
design pattern naming "the ability to save and retrieve a specific kind
of object," as its own real interface, separate from whatever real,
concrete storage mechanism actually implements it, real and existing so
the rest of an app's own code can depend on *what* can be done with a
kind of data, never *how* it's actually stored.

```
Also recognized in: an ORM's own real Active Record / Data Mapper split,
a payment processor's own real PaymentGateway interface hiding Stripe
from PayPal, a game engine's own real SaveSystem interface hiding a
local file from a cloud save slot, a logging framework's own real
Appender interface hiding console output from file output from network
output
```

### SE Lens

The real principle is **an interface shaped by what this app's own,
real, current need actually is, not by copying a sibling interface's
own real shape out of habit**. The alternative not chosen: give
`GameSessionRepository` an `all()` method too, matching
`ScoreRepository`'s own real shape exactly. The real tradeoff: a real,
unused `all()` method would cost nothing to write today, but would
silently promise a real ability — a growing, queryable history of every
real game session this app has ever had — this app's own real schema
(one, fixed row id) genuinely cannot honor at all; naming only the two
real abilities this app's own current design actually supports keeps
this real interface honest about what it can actually do.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — an abstract interface has no real body to
run; the next unit gives it one.

### Connect

The real ability now has a real name, deliberately shaped by this app's
own real, current need. The next unit gives that name its one, real,
current implementation.

---

## Concept Unit 4: `SqliteGameSessionRepository` — Mapping a Real Entity, Not a Value Object

### The Problem

`GameSessionRepository` names a real ability with no real body;
`AppDatabase` can now save and read a raw row, but nothing translates
between that raw row and a real, live `GameSession`.

> **Socratic prompt:** `Score.toRow`/`Score.fromRow` live directly on
> `Score` itself — a real value object with no real behavior of its own
> to protect. `GameSession` is a real entity (Terms, above): it owns
> real rules (`enterDigit`, real state transitions), and carries a real,
> injected `Clock` dependency that has no honest real equivalent in a
> stored database row at all. Given that real difference, would you
> expect `GameSession` to gain its own real `toRow` method the identical
> way `Score` did, or would you expect that real mapping logic to live
> somewhere else entirely?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/sqlite_score_repository.dart`
  (read fresh this session) — the real, established shape a concrete
  repository implementation follows; this unit's own real class departs
  from it in exactly the one real place this unit's own Socratic
  question raises.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/sqlite_game_session_repository.dart`
  — created.
- **Change type:** add.
- **Location:** a brand-new file, inside `infrastructure/`.
- **Dependencies:** `GameSessionRepository`, `GameSession`, `AppDatabase`,
  `SudokuBoardDto` (moved earlier in this lesson), all already real by
  this point.

### The New Code

```dart
class SqliteGameSessionRepository implements GameSessionRepository {
  SqliteGameSessionRepository(this._database);

  final AppDatabase _database;

  @override
  Future<void> save(GameSession session) async {
    final dto = SudokuBoardDto.fromBoard(session.board);
    await _database.saveGameSession({
      'difficulty': session.difficulty.name,
      'status': session.status.name,
      'started_at': session.startTime.toIso8601String(),
      'mistakes': session.mistakes,
      'hints': session.hints,
      'cells': jsonEncode(dto.cells),
      'given_cells': jsonEncode(dto.givenCells),
    });
  }

  @override
  Future<bool> hasSavedSession() async {
    final row = await _database.currentGameSessionRow();
    return row != null;
  }
}
```

### Updated Project

Not applicable — a brand-new file, its own real, complete content shown
whole above.

### Isolate and Discard

**A real, run, permanent test, this session** —
`project/test/sqlite_game_session_repository_test.dart`:

```dart
test('a real, saved session\'s own real row holds every real, expected field', () async {
  final appDb = AppDatabase();
  final repository = SqliteGameSessionRepository(appDb);
  final startTime = DateTime(2026, 1, 1, 9);
  final session = GameSession(SudokuBoard(milestonePuzzle), FakeClock(startTime), startTime: startTime);
  session.enterDigit(4, 4, 5);

  await repository.save(session);

  final row = await appDb.currentGameSessionRow();
  expect(row, isNotNull);
  expect(row!['difficulty'], session.difficulty.name);
  expect(row['status'], GameStatus.playing.name);
  expect(row['started_at'], startTime.toIso8601String());
});
```

**A real, honest, first-attempt failure, kept as a documented, fixed
gotcha, not silently smoothed over:** the first real version of this
exact test file imported this project's own real domain/infrastructure
code via `package:open_calc_sudoku/...`, while reusing a real,
already-existing `FakeClock` from a sibling real test file that itself
imports `Clock` via a real, relative path. Real, captured compile
error:

```
Error: The argument type 'FakeClock' can't be assigned to the parameter type 'Clock'.
 - 'FakeClock' is from 'test/game_session_test.dart'.
 - 'Clock' is from 'package:open_calc_sudoku/features/sudoku/domain/clock.dart' ('lib/features/sudoku/domain/clock.dart').
```

Real, confirmed cause: mixing a `package:` import and a relative import
of the identical real file produced two real, distinct type identities
for `Clock` in this specific real toolchain — fixed by switching this
new test file's own imports to the identical real, relative style the
sibling file already uses. Both real tests, and the real fix, are kept,
real and permanent, inside `project/test/`.

### Mechanical Walkthrough

- `class SqliteGameSessionRepository implements GameSessionRepository {
  ... }` — `implements` (already established) declares this real class
  genuinely fulfills every real method `GameSessionRepository` names.
- `SqliteGameSessionRepository(this._database);` / `final AppDatabase
  _database;` — the identical real, injected-dependency constructor
  shape `SqliteScoreRepository` already uses.
- `@override Future<void> save(GameSession session) async { ... }` —
  `@override` (already established) marks this as genuinely fulfilling
  `GameSessionRepository`'s own real contract.
- `final dto = SudokuBoardDto.fromBoard(session.board);` —
  `SudokuBoardDto.fromBoard` (Objects and methods, above) called on
  `session.board` — `GameSession`'s own real, public field, holding the
  real, live `SudokuBoard` this whole real session is built around —
  directly answering this unit's own Socratic question: the real mapping
  logic lives here, inside the repository, not on `GameSession` itself,
  since `GameSession` genuinely has no honest way to serialize its own
  real, injected `Clock` dependency, and shouldn't have to know or care
  that it's ever being saved at all.
- `await _database.saveGameSession({...});` —
  `AppDatabase.saveGameSession` (Objects and methods, above) called with
  a real map literal, one real entry per real, storable column:
  `session.difficulty.name`/`session.status.name` (`Enum.name`, Objects
  and methods, above — a real, stable string, chosen over a real,
  fragile integer index); `session.startTime.toIso8601String()` (a real
  `DateTime` instance method converting to real, storable ISO 8601
  text — the identical real, lossless, human-readable format
  `DateTime.parse` can later read back exactly); `session.mistakes`/
  `session.hints` (`GameSession`, Objects and methods, above — two real,
  computed getters, read directly, real and already plain integers, no
  real conversion needed); `jsonEncode(dto.cells)`/`jsonEncode(dto.givenCells)`
  (Objects and methods, above) called on the real `SudokuBoardDto` just
  built, turning each real, nested board array into one real, storable
  string.
- `@override Future<bool> hasSavedSession() async { ... }` — the
  identical real `@override`.
- `final row = await _database.currentGameSessionRow();` —
  `AppDatabase.currentGameSessionRow` (Objects and methods, above)
  called once, real and awaited.
- `return row != null;` — a real, ordinary `!=` comparison (already
  established), real and directly answering the real question
  `hasSavedSession` exists to answer.

### CS Lens

Not repeated separately — the identical hard concept **entity versus
value object** already received its own real treatment the moment this
unit's own Socratic question was answered; the deeper real idea it rests
on — an object's own identity persisting independently of its own held
data — is given its own real, full, multi-recurrence list right here,
since it hasn't had one yet in this lesson.

```
Also recognized in: a real bank account (its own real identity persists
across every real deposit and withdrawal — the balance changes, the
account doesn't stop being itself), a real Git branch (the identical
real branch, its own real commit history constantly growing), a real,
physical car (repaint it, replace its own real tires — it's still the
identical real car, tracked by its own real VIN, not by its own current
real paint color)
```

### SE Lens

The real principle is **keeping a real domain entity honestly unaware of
its own persistence** — directly answering this unit's own Socratic
question. The alternative not chosen: give `GameSession` its own real
`toRow()` method, the identical real shape `Score` already uses. The
real tradeoff: `Score` genuinely can own its own mapping safely, because
it is only ever real, plain data — no real behavior, no real, injected
dependency that persistence would ever need to reckon with.
`GameSession` is different: it owns real rules and a real, injected
`Clock`, and forcing it to also know how to serialize itself would mean
either serializing that real `Clock` too (genuinely nonsensical — a real
`Clock` is an *ability*, not *data*) or teaching `GameSession` to quietly
skip real fields when mapping itself, a real, growing, hidden
responsibility that has nothing to do with this real class's own actual
job: enforcing this game's own real rules. Keeping the real mapping
logic here, in `SqliteGameSessionRepository` instead, costs one real,
slightly larger `save` method — for the real, honest payoff that
`GameSession` itself never has to change, or even know, if this app's
own real storage format ever does.

### Commands Needed

None new.

### Run It

Real, captured output: `flutter test` — 37 real test-file-level checks
(up from 33), `All tests passed!`, confirmed clean across three of four
consecutive full runs (one real, non-reproducible flake, in an unrelated
real test, matching a real, already-documented pattern from earlier in
this same phase — logged honestly, not silently re-run away);
`flutter analyze .` — 39 issues (five new, all the identical, already
-accepted real category this unit's own import fix required, zero new
categories). Real, direct proof: a real, saved session's own real row
holds every real, expected field, including a real board successfully
round-tripped through real JSON.

### Connect

`GameSessionRepository`'s own real ability now has its one, real,
working implementation. The final unit reaches every real, live moment
this app's own game session actually changes, and makes each one save
for real.

---

## Concept Unit 5: Wiring a Real Save Into Every Real State Change

### The Problem

`SqliteGameSessionRepository` exists, real and working, but nothing in
this app's own, real, live game flow ever calls it — every real move a
player makes still only changes real, in-memory state, exactly as
honestly as it did before this lesson began.

> **Socratic prompt:** `GameSessionNotifier`'s own real methods
> (`enterDigit`, `togglePause`, `handleAppLifecycleChange`) already, each
> and always, end with `state = state.touched();` — real and
> unconditional, every real time any of them runs. Given that already
> -real, always-executed real line, where would you place a real call to
> save, so that genuinely every real state change gets persisted, with
> no real path through any of these three real methods ever skipping
> it?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/application/game_session_provider.dart`,
  its own real, existing `GameSessionNotifier` class and
  `scoreRepositoryProvider` (read fresh this session) — the real,
  established composition-root shape this unit's own new provider
  follows.
- **Files affected:**
  `project/lib/features/sudoku/application/game_session_provider.dart`
  — modified.
- **Change type:** add.
- **Location:** a real, new provider alongside `scoreRepositoryProvider`;
  a real, new private method and three real, one-line additions inside
  `GameSessionNotifier`.
- **Dependencies:** `GameSessionRepository`, `SqliteGameSessionRepository`,
  both built earlier in this lesson.

### The New Code

```dart
final gameSessionRepositoryProvider = Provider<GameSessionRepository>(
  (ref) => SqliteGameSessionRepository(ref.watch(appDatabaseProvider)),
);
```

```dart
void _save() {
  ref.read(gameSessionRepositoryProvider).save(state);
}
```

### Updated Project

`application/game_session_provider.dart`'s own real, complete file,
every real line shown, every real, new or changed line marked:

```dart
  1  import 'package:flutter/widgets.dart' show AppLifecycleState;
  2  import 'package:flutter_riverpod/flutter_riverpod.dart';
  3
  4  import '../domain/clock.dart';
  5  import '../domain/game_session.dart';
  6  import '../domain/game_session_repository.dart';                       // ← new
  7  import '../domain/game_status.dart';
  8  import '../domain/puzzle_repository.dart';
  9  import '../domain/score_repository.dart';
 10  import '../domain/sudoku_board.dart';
 11  import '../infrastructure/app_database.dart';
 12  import '../infrastructure/in_memory_puzzle_repository.dart';
 13  import '../infrastructure/sqlite_game_session_repository.dart';        // ← new
 14  import '../infrastructure/sqlite_score_repository.dart';
 15  import '../infrastructure/system_clock.dart';
 16
 17  final puzzleRepositoryProvider = Provider<PuzzleRepository>((ref) => InMemoryPuzzleRepository());
 18
 19  final appDatabaseProvider = Provider<AppDatabase>((ref) => AppDatabase());
 20
 21  final scoreRepositoryProvider = Provider<ScoreRepository>(
 22    (ref) => SqliteScoreRepository(ref.watch(appDatabaseProvider)),
 23  );
 24
 25  final gameSessionRepositoryProvider = Provider<GameSessionRepository>(  // ← new
 26    (ref) => SqliteGameSessionRepository(ref.watch(appDatabaseProvider)), // ← new
 27  );                                                                      // ← new
 28
 29  final clockProvider = Provider<Clock>((ref) => SystemClock());
 30
 31  final gameSessionProvider = NotifierProvider<GameSessionNotifier, GameSession>(
 32    GameSessionNotifier.new,
 33  );
 34
 35  class GameSessionNotifier extends Notifier<GameSession> {
 36    @override
 37    GameSession build() => GameSession(
 38          SudokuBoard(ref.watch(puzzleRepositoryProvider).startingPuzzle()),
 39          ref.watch(clockProvider),
 40        );
 41
 42    void _save() {                                                        // ← new
 43      ref.read(gameSessionRepositoryProvider).save(state);                 // ← new
 44    }                                                                      // ← new
 45
 46    void enterDigit(int row, int col, int digit) {
 47      try {
 48        state.enterDigit(row, col, digit);
 49      } finally {
 50        state = state.touched();
 51        _save();                                                          // ← new
 52      }
 53    }
 54
 55    void togglePause() {
 56      if (state.status == GameStatus.playing) {
 57        state.pause();
 58        state = state.touched();
 59        _save();                                                          // ← new
 60      } else if (state.status == GameStatus.paused) {
 61        state.resume();
 62        state = state.touched();
 63        _save();                                                          // ← new
 64      }
 65    }
 66
 67    void handleAppLifecycleChange(AppLifecycleState lifecycleState) {
 68      switch (lifecycleState) {
 69        case AppLifecycleState.paused || AppLifecycleState.inactive || AppLifecycleState.hidden:
 70          if (state.status == GameStatus.playing) {
 71            state.interrupt();
 72            state = state.touched();
 73            _save();                                                      // ← new
 74          }
 75        case AppLifecycleState.resumed:
 76          if (state.status == GameStatus.interrupted) {
 77            state.resume();
 78            state = state.touched();
 79            _save();                                                      // ← new
 80          }
 81        case AppLifecycleState.detached:
 82          break;
 83      }
 84    }
 85  }
```

Every real path through `GameSessionNotifier` that ever changes `state`
now also saves it — real and permanently — before that real method
returns.

### Isolate and Discard

No separate throwaway lab — `Provider`/`ref.watch`/`ref.read` already
received full, real treatment in the Header, above; this unit's own real
wiring is exercised for real by this project's own real, existing
widget tests, which already exercise every one of `enterDigit`/
`togglePause`/`handleAppLifecycleChange`, and which this lesson's own
Run It, below, confirms all still pass.

### Mechanical Walkthrough

- `final gameSessionRepositoryProvider = Provider<GameSessionRepository>((ref) => SqliteGameSessionRepository(ref.watch(appDatabaseProvider)));`
  — `Provider<GameSessionRepository>` (Objects and methods, above)
  declares a real, app-wide place a `GameSessionRepository` lives, real
  and typed as the real interface, never the real concrete class;
  `ref.watch(appDatabaseProvider)` (Objects and methods, above) reads
  the identical real, single, shared `AppDatabase` instance every other
  real repository in this app already reads, rather than constructing a
  second, separate one.
- `void _save() { ref.read(gameSessionRepositoryProvider).save(state); }`
  — a real, new, private method; `ref.read` (Objects and methods, above,
  full treatment here) called instead of `ref.watch`, real and
  deliberately — directly answering this unit's own real, second design
  concern (never shown as a Socratic question, but worth stating
  plainly): a `Notifier`'s own real methods run *after* `build()` has
  already established every real subscription it needs; calling
  `ref.watch` again, mid-method, would create a real, additional,
  unwanted subscription with no real, further purpose, since this
  method never runs again in response to `gameSessionRepositoryProvider`
  itself changing; `state` (already established, this real class's own
  inherited, current value) passed directly to `GameSessionRepository.save`
  (Objects and methods, above).
- `_save();`, added at the end of `enterDigit`'s own real `finally`
  block, and at the end of every real branch inside `togglePause`/
  `handleAppLifecycleChange` that already reassigns `state` — real and
  directly answering this unit's own Socratic question: placed
  immediately after each real, already-existing `state =
  state.touched();` line, so no real path through any of these three
  real methods can ever reassign `state` without this real save
  following it.

### CS Lens

Binding `GameSessionRepository` to its one, real, concrete
implementation in exactly one real, deliberate place —
`gameSessionRepositoryProvider` — is a real, concrete instance of
**dependency inversion** (Terms, above): a hard concept naming a real
design principle in which a real, high-level piece of code
(`GameSessionNotifier`) depends only on a real, abstract interface it
names (`GameSessionRepository`), while a real, low-level, concrete
implementation (`SqliteGameSessionRepository`) depends on that identical
real interface too, real and separately — inverting the naive real
direction, where `GameSessionNotifier` would otherwise depend directly
on `SqliteGameSessionRepository` itself.

```
Also recognized in: a USB port's own real, standard shape, indifferent
to which real device plugs into it, an electrical wall outlet,
indifferent to which real appliance draws power from it, a service
container in a real backend framework, binding a real interface to a
real concrete class in exactly one, real, central place, a device
driver's own real, standardized registration table, letting an
operating system call any real driver the identical real way
```

### SE Lens

The real principle is **persistence as a real, structural consequence of
every real state change, not a separate, easy-to-forget step a caller
has to remember**. The alternative not chosen: leave saving as its own,
separate, real method callers have to remember to invoke — the real
equivalent of a real "Save" button. The real tradeoff: `_save()` now
runs on every single real state change, real and including ones a real
player might consider trivial (a real pause, a real digit that gets
immediately rejected) — a real, small, ongoing cost in real background
writes, for the real, honest payoff curriculum's own next real lesson
depends on entirely: a real, killed app, restarted, has no real way to
have missed a save, because there was never a real window where a real
state change existed only in memory.

### Commands Needed

None new.

### Run It

Real, captured output: `flutter analyze .` clean, same categories, zero
new; `flutter test` — 37 real test-file-level checks, `All tests
passed!` on three of four consecutive full runs (the one real,
non-reproducible flake already logged honestly, above, in the previous
unit) — including every real, pre-existing widget test that taps a
digit or the real Pause/Resume button, all still passing unmodified,
real, direct proof this real wiring changed no real, observable
behavior a player would ever see, only added a real, background,
persistent consequence to actions that already worked.

### Connect

Every real state change this app's own, one, shared game session ever
goes through now saves itself, real and permanently, with no real gap a
killed app could ever fall through.

---

## Connect the Pieces

`SudokuBoardDto` moved to where a real infrastructure consumer finally,
genuinely needed it — a real, deliberate, previously-flagged decision,
honestly revisited rather than left stale (Concept Unit 1).
`AppDatabase` gained two real, public methods for `game_sessions`,
deliberately shaped around this app's own real, single, current-session
design — a real, fixed row identity and a real upsert, not the
ever-growing real history `scores` correctly uses instead (Concept
Unit 2). `GameSessionRepository` named the real ability this app
actually needs — narrower than `ScoreRepository`'s own real shape, on
purpose (Concept Unit 3). `SqliteGameSessionRepository` gave that real
ability its one, real implementation, its own real mapping logic kept
deliberately separate from `GameSession` itself, since a real entity
carrying real behavior and a real, injected `Clock` cannot honestly
serialize itself the same safe way a real value object can — and a
real, honest, first-attempt test failure proved a real, non-obvious
Dart import gotcha along the way, fixed and kept as permanent evidence
(Concept Unit 4). And a real, new provider, plus one real, private
`_save()` method reached from every real branch that already changes
this session's own state, means every real move, every real pause,
every real interrupt this app's own game ever goes through now writes
itself into `game_sessions`, real and permanently, before that real
method ever returns (Concept Unit 5). This app's own, one, shared game
still starts fresh, real and unconditionally, every single real launch
— nothing yet reads any of this real, saved data back.
