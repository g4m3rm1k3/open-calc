# Lesson 51: A Real Shape for a Game That Ends

**Designing the Schema**

## What you will build

`project/lib/features/sudoku/infrastructure/app_database.dart`'s own
real `onCreate` callback (Lesson 50) grows two new, real, permanent
tables — `game_sessions` and `scores` — this project's own real,
concrete answer to curriculum's own conceptual model
(`players → game_sessions → scores`). Nothing reads or writes either
table yet (Lesson 54's own real job); this lesson's own transferable
problem is deciding their real shape — real column names, real types,
a real foreign key — honestly, from this app's own actual, current
domain classes (`GameSession`, `Difficulty`, `GameStatus`,
`SudokuBoardDto`), not from curriculum's own generic example.

## What you need to know first

- Lesson 49 ("Data That Has to Survive the App Closing") — `PRIMARY
  KEY`, `FOREIGN KEY`, `NOT NULL`, `PRAGMA foreign_keys`, all real and
  applied to this project's own schema for the first time in this
  lesson.
- Lesson 50 ("The Game Now Knows About SQLite") — `AppDatabase._open()`,
  `openDatabase`'s own real `onCreate` callback, `Database.execute` —
  this lesson's own code grows all three.
- Lesson 42 ("What This Game Genuinely Needs to Know About Itself") —
  its own real, run search already proved zero real evidence of a
  `Player` concept anywhere in this project, and named Lesson 75 as
  `Player`'s own real, honest future home — this lesson's own Concept
  Unit 1 reconfirms that exact real finding still holds.
- Lesson 40 ("A Real State Machine for a Game Session") — `GameStatus`,
  its seven real, named values, and its own real `.name` string
  representation.
- Lesson 42 — `Difficulty`, the same real `.name` shape.
- Lesson 45/46 ("Data Shaped for Carrying, Not for Deciding" /
  "Crossing the Boundary in Both Directions") — `SudokuBoardDto`'s own
  real `cells`/`givenCells` fields, and `jsonEncode`'s own real,
  already-proved behavior on a raw, nested `List`.
- Lesson 36 ("Giving the Session Its Own Real Owner") — `GameSession`'s
  own real fields (`difficulty`, `startTime`, `mistakes`, `hints`),
  this lesson's own direct real source for `game_sessions`'s columns.

## Terms used in this lesson

- **`@visibleForTesting`** — a real annotation (Lesson 12, reappearing —
  an annotation, not a keyword) from `package:meta`, marking a real
  member as existing only for real tests to call, never real production
  code — a real, honest, visible flag, not silent convention.
- **Denormalization** — deliberately storing the identical real value in
  more than one real table, rather than always deriving it through a
  real `JOIN` (Lesson 49, reappearing). Exists as a real, named tradeoff:
  a real, faster read at the real cost of two real copies that could, in
  principle, ever disagree.
- **ISO 8601** — a real, standard, international text format for dates
  and times (`2026-08-24T06:11:55.450763`) — exists so a real date,
  stored as real `TEXT` (SQLite has no dedicated real date/time column
  type, Lesson 49, reappearing), can be read back unambiguously by any
  real program, not just the one that wrote it.
- **Identifier (reappearing, Lesson 5)** — real column and table names,
  chosen deliberately in this lesson.

## Objects and methods used

- **`grep`**
  - *What it is:* the real, standard Unix text-search program, already
    familiar in spirit to `Select-String` (Lessons 41/42/44,
    reappearing) — a different real tool, identical real purpose.
  - *Implementation:* real, relevant flags used here: `-r` (search real
    directories recursively), `-n` (show real line numbers), `-i`
    (case-insensitive), `-E` (real extended regular expression syntax).
  - *Its use:* Concept Unit 1's own real, central evidence.
  - *Type:* a real, external command-line program.
  - *Responsibility:* finding every real line matching a real pattern,
    across every real file in a real directory tree — nothing about
    interpreting what it finds.
  - *Depends on:* a real, valid regular expression; a real, existing
    directory to search.
  - *Connects to:* this lesson's own one real command, Concept Unit 1.
  - *Shape:* outside this app's own architecture — a real diagnostic
    tool, used only this session.

- **`DateTime.toIso8601String()` / `DateTime.parse()`**
  - *What it is:* a real, `dart:core` instance method converting a real
    `DateTime` to real ISO 8601 (Terms, above) text; a real, `dart:core`
    static factory converting that real text back into a real `DateTime`.
  - *Implementation:* real, fetched-and-confirmed-by-run behavior, this
    session: `String toIso8601String()`; `static DateTime
    parse(String formattedString)` — real, run, this session, on a real
    `DateTime.now()` value, produced an identical real `DateTime` after
    the full real round trip (`now == parsed` → `true`).
  - *Its use:* `game_sessions.started_at`/`scores.completed_at` (Concept
    Units 2, 4) are both stored as real `TEXT`, built with
    `toIso8601String()`; reading either back (Lesson 54's own future job)
    will use `DateTime.parse()`.
  - *Type:* an instance method (`toIso8601String`); a static factory
    (`parse`) — both on `DateTime`.
  - *Responsibility:* losslessly converting between a real, in-memory
    `DateTime` and real, storable text — nothing about time zones or
    formatting choices beyond the one real, fixed ISO 8601 shape.
  - *Depends on:* `toIso8601String` depends on a real, existing
    `DateTime`; `parse` depends on real, syntactically valid ISO 8601
    text.
  - *Connects to:* `AppDatabase`'s own future real
    write/read methods for `game_sessions`/`scores` (Lesson 54) will call
    both; this lesson's own real, throwaway lab already proved the round
    trip.
  - *Shape:* a real, standard `dart:core` boundary between in-memory time
    and real, storable text.

- **`jsonEncode()` / `jsonDecode()`**
  - *What it is:* two real, top-level `dart:convert` functions,
    already given full treatment in Lesson 45 (`jsonEncode`,
    reappearing) — `jsonDecode` appears for the first time this lesson.
  - *Implementation:* real, fetched-and-confirmed-by-run behavior, this
    session: `String jsonEncode(Object? object)`; `dynamic
    jsonDecode(String source)` — real and run against a nested
    `List<List<int?>>`/`List<List<bool>>` board this session:
    `jsonDecode`'s own real return value is genuinely `List<dynamic>` at
    every level (confirmed: `decoded['cells'].runtimeType` printed
    `List<dynamic>`), not the original real `List<int?>` shape — a real,
    necessary cast back is required to use it as one again.
  - *Its use:* `SudokuBoardDto`'s own real `cells`/`givenCells` (Lesson
    45) become `game_sessions.cells`/`given_cells`, real `TEXT` columns,
    via `jsonEncode`; reading them back (Lesson 54) will need
    `jsonDecode` plus a real, explicit cast.
  - *Type:* two free, top-level functions.
  - *Responsibility:* `jsonEncode`'s full charter: converting a real,
    directly-encodable Dart value (a `List`, a `Map`, a `num`, a `String`,
    a `bool`, `null`, or anything with its own real `toJson()`) into real
    JSON text; `jsonDecode`'s full charter: the exact real reverse,
    genuinely returning `dynamic`-typed real structures, never the
    original real static type.
  - *Depends on:* `jsonEncode` depends on every real, nested value inside
    its argument also being real and encodable; `jsonDecode` depends on
    real, syntactically valid JSON text.
  - *Connects to:* both called only inside this lesson's own real,
    throwaway lab this session; Lesson 54's own future real save/load
    code will call both for real, against this exact real shape.
  - *Shape:* a real, standard `dart:convert` boundary between in-memory
    Dart values and real, storable text — the identical real role
    `toIso8601String`/`parse` play for `DateTime`, applied to compound
    data instead.

- **`DatabaseException`**
  - *What it is:* a real, `sqflite`-family exception naming a failed
    real database operation — the real, general class every real SQLite
    constraint failure (Lesson 49's own real `UNIQUE`/`FOREIGN KEY`
    rejections, now reached through Dart instead of the `sqlite3` CLI)
    surfaces as.
  - *Implementation:* real, fetched source, this session
    (`sqflite_common-2.5.11/lib/src/exception.dart`): a real,
    concrete class implementing `Exception`, carrying the real,
    underlying native error message and code.
  - *Its use:* this lesson's own real, permanent test
    (`project/test/app_database_schema_test.dart`) asserts a real
    `scores` insert naming a nonexistent `session_id` throws exactly
    this.
  - *Type:* a real, external, concrete exception class.
  - *Responsibility:* wrapping any real, underlying native SQLite error
    into one real, catchable Dart type.
  - *Depends on:* a real, underlying native SQLite failure to wrap.
  - *Connects to:* thrown by `Database.insert`/`execute`/`query`
    whenever a real constraint (Lesson 49, reappearing) is violated;
    caught nowhere in this app's own code yet — this lesson's own test
    only asserts it's thrown, not handled.
  - *Shape:* the real, Dart-side face of every real SQLite constraint
    failure this project's own schema will ever produce.

- **`throwsA` / `isA<T>()`**
  - *What it is:* two real, `package:test` matcher-building functions —
    `throwsA` wraps a real matcher to expect against whatever a real,
    given function throws; `isA<T>()` builds a real matcher checking an
    object's own real runtime type.
  - *Implementation:* real, relevant usage: `expect(() => someCall(),
    throwsA(isA<DatabaseException>()))` — `expect`'s own real first
    argument here is a real, zero-argument closure (Lesson 15,
    reappearing), not a value, specifically so `expect` itself can call
    it and observe whether it genuinely throws.
  - *Its use:* this lesson's own real, permanent test asserting the real
    `FOREIGN KEY` rejection.
  - *Type:* two real, external matcher-building functions.
  - *Responsibility:* `throwsA`'s full charter: succeed only if the real
    function it's given genuinely throws, and the real thrown object
    matches the real, inner matcher; nothing about what happens if it
    doesn't throw at all, beyond a real, failed assertion.
  - *Depends on:* a real, callable, zero-argument function; a real,
    inner matcher to check the real thrown object against.
  - *Connects to:* passed as `expect`'s own second argument (Lesson 24,
    reappearing).
  - *Shape:* real, external test-only vocabulary — never real production
    code.

---

## Concept Unit 1: Deciding What This Schema Actually Needs

### The Problem

curriculum.md's own real conceptual model names three real tables:
`players`, `game_sessions`, `scores`. This app has never had a real
concept of more than one real player — Lesson 42's own real search
already found zero real evidence of one anywhere in this project's own
code.

> **Socratic prompt:** Lesson 42's own real search for the plain word
> "player" found eight real matches, every one inside a doc comment,
> never a real class or field. Given that real result, and given
> curriculum's own model calls itself an "example conceptual model,"
> what real, honest option does that leave open — building `players`
> anyway, on the theory it might be needed eventually, or deferring it
> the same real way Lesson 42 already deferred the `Player` class
> itself? Second: if `players` genuinely doesn't exist yet, what does
> that mean for `game_sessions` — does it still need a real
> `player_id` column pointing at a table that doesn't exist?

### Project Change

- **Reference Source:** No reference counterpart — curriculum.md's own
  Lesson 51 bullet (`players → game_sessions → scores`) is an explicit
  "example conceptual model," not this project's own literal, binding
  design; this unit reasons from this project's own real, current code
  instead, reusing Lesson 42's own already-established real,
  evidence-based method.
- **Files affected:** none — a real, read-only search.
- **Change type:** none — verification only.
- **Location:** every real `.dart` file in `project/lib/`.
- **Dependencies:** `grep` (Objects and methods, above), already
  available on this machine.

### The New Code

```bash
grep -rniE "player|login|account|auth|multiplayer" lib/
```

### Updated Project

Not applicable — a real, read-only diagnostic command, modifying
nothing.

### Isolate and Discard

No throwaway lab — the real command above, run once this session, from
`project/`, is the evidence itself.

### Mechanical Walkthrough

- `grep` (Objects and methods, above) — already given full treatment.
- `-r` — a real flag, searching every real file inside `lib/`
  recursively, not just its own top level.
- `-n` — a real flag, printing each real match's own real line number.
- `-i` — a real flag, matching regardless of real letter case (`Player`,
  `player`, `PLAYER` all real and equally matched).
- `-E` — a real flag, enabling `grep`'s own real *extended* regular
  expression syntax, letting `|` (below) work without a real, extra
  backslash.
- `"player|login|account|auth|multiplayer"` — a real regular expression
  (Lesson 41, reappearing): five real, literal alternatives joined by
  `|`, the same real alternation operator Lesson 42's own
  `Select-String` search already used — real and true the moment any one
  of the five real words appears anywhere in a real, scanned line.
- `lib/` — the real, positional directory argument to search.

### CS Lens

Not repeated separately — this unit's own real construct (evidence
before design, reused from an earlier real decision) is the identical
hard concept Lesson 42's own CS lens already gave full, real treatment
to.

### SE Lens

The real principle is **designing for this project's own real, current
need, not a generic template's own literal shape**. The alternative not
chosen: build `players` anyway, with exactly one real, hardcoded row,
"just in case." The real tradeoff: skipping it costs nothing today and
saves one real table this project's own code would never touch; the
honest, present cost is that `game_sessions` (Concept Unit 2) carries no
real `player_id` column at all — a real, deliberate gap, not an
oversight, matching this unit's own second Socratic question directly,
and one Lesson 75's own real, already-tracked `Player` work will resolve
when a real, multi-player concept genuinely exists to attach it to.

### Commands Needed

- **`grep -rniE "player|login|account|auth|multiplayer" lib/`** — run
  from `project/`, this session.

### Run It

Real, captured output:

```
lib/features/sudoku/domain/game_session.dart:32:  /// the board itself keeps changing as the player fills it in. A fresh
lib/features/sudoku/domain/sudoku_board.dart:41:  /// `cells` may include real player-filled digits that must *not* be
lib/features/sudoku/domain/sudoku_board.dart:64:  /// console player needs to be told, in words, *why* a move was
lib/features/sudoku/domain/sudoku_board.dart:175:  /// [SudokuBoard] a player can actually attempt — by starting from this
lib/features/sudoku/domain/sudoku_board.dart:407:  /// A readable text grid, given cells and player-filled cells both shown
lib/features/sudoku/presentation/game_intent.dart:1:/// Every real thing a player can ask this app to do, named as plain data
lib/features/sudoku/presentation/game_intent.dart:7:/// The player tapped a real cell at `(row, col)`.
lib/features/sudoku/presentation/game_intent.dart:14:/// The player tapped a real digit on the number pad.
lib/features/sudoku/presentation/game_intent.dart:20:/// The player tapped the real "Pause"/"Resume" button (Lesson 40) —
lib/features/sudoku/presentation/sudoku_board_dto.dart:47:  /// non-null cell to be a given clue, including a real player-filled
```

Real, direct confirmation: every real match is the plain English word
inside a doc comment; zero real matches for `login`/`account`/`auth`/
`multiplayer` anywhere in `project/lib/` — Lesson 42's own real finding,
reconfirmed.

### Connect

`players` is real, deliberately, and honestly out of scope. Concept Unit
2 designs `game_sessions` around exactly what `GameSession` (Lesson 36)
already, really tracks.

---

## Concept Unit 2: Designing `game_sessions`

### The Problem

`GameSession` (Lesson 36) already, really holds everything curriculum's
own Lesson 54 bullet later needs to save — `difficulty`, `startTime`,
`mistakes`, `hints`, `status` (Lesson 40) — but only in memory. Its real
shape needs a real, matching table.

> **Socratic prompt:** `GameStatus` (Lesson 40) is a real, enhanced
> enum with a real `.name` getter, already used on-screen (`Text('Status:
> ${session.status.name}')`, Lesson 40). Given SQLite's own real column
> types are only `INTEGER`/`TEXT`/`REAL`/`BLOB` (Lesson 49, reappearing),
> what real column type would you choose for a real enum value — and
> would you store its real name, or its real position (`.index`)?
> Second: `startTime` is a real `DateTime`. SQLite has no real, dedicated
> date/time column type at all — what real type would you fall back to,
> and what real risk does that create if the real text isn't stored in a
> single, standard, unambiguous real format?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/domain/game_session.dart`, lines 55-62
  (`GameSession`'s own real fields, read fresh this session) —
  `game_sessions`'s own real columns are a direct, real mapping from
  these.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified.
- **Change type:** add.
- **Location:** inside `_open()`'s own real `onCreate` callback,
  immediately after the existing `settings` table (Lesson 50).
- **Dependencies:** none new yet — Concept Unit 3 adds the real board
  columns.

### The New Code

```dart
await db.execute('''
  CREATE TABLE game_sessions (
    id INTEGER PRIMARY KEY,
    difficulty TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    mistakes INTEGER NOT NULL,
    hints INTEGER NOT NULL
  )
''');
```

### Updated Project

`_open()`'s own real `onCreate` callback, growing:

```dart
1  onCreate: (db, version) async {
2    await db.execute('''
3      CREATE TABLE settings (
4        key TEXT PRIMARY KEY,
5        value INTEGER NOT NULL
6      )
7    ''');
8    await db.execute('''                                    // ← new
9      CREATE TABLE game_sessions (                           // ← new
10       id INTEGER PRIMARY KEY,                              // ← new
11       difficulty TEXT NOT NULL,                             // ← new
12       status TEXT NOT NULL,                                 // ← new
13       started_at TEXT NOT NULL,                             // ← new
14       mistakes INTEGER NOT NULL,                            // ← new
15       hints INTEGER NOT NULL                                // ← new
16     )                                                      // ← new
17   ''');                                                    // ← new
18 }
```

`onCreate` now creates two real tables, real and in order, the moment
this app's own database file is genuinely brand new.

### Isolate and Discard

No separate throwaway lab for `CREATE TABLE` itself — Lesson 49 already
gave it full, real treatment; the real, genuinely new decision here
(mapping `GameSession`'s own real fields to real column types) is
reasoned through directly against real, already-existing code, not an
isolated syntax construct.

### Mechanical Walkthrough

- `CREATE TABLE game_sessions` — the identical real statement Lesson 49
  already gave full treatment to, naming a genuinely new real table.
- `id INTEGER PRIMARY KEY` — the identical real shape `settings.key`'s
  own sibling columns already use — Lesson 49's own real `PRIMARY KEY`
  (reappearing): a real, auto-assigned, unique row identifier, since,
  unlike `settings`, a real game session has no natural real key of its
  own the way `'total_games_started'` did.
- `difficulty TEXT NOT NULL` — real and directly answering this unit's
  own first Socratic question: stores `Difficulty.name` (Lesson 42,
  reappearing — `'easy'`/`'medium'`/`'hard'`), not `.index`, since a real
  name survives this enum's own real declared order ever changing later,
  while a stored real integer index silently would not.
- `status TEXT NOT NULL` — the identical real choice, storing
  `GameStatus.name` (Lesson 40, reappearing).
- `started_at TEXT NOT NULL` — real and directly answering this unit's
  own second Socratic question: `TEXT`, storing a real ISO 8601 string
  (Terms, above) via `DateTime.toIso8601String()` (Objects and methods,
  above) — a real, single, standard, unambiguous shape, real-run-proved
  this session to survive a full round trip back through
  `DateTime.parse()` with exact equality.
- `mistakes INTEGER NOT NULL` / `hints INTEGER NOT NULL` — real,
  direct, unmodified mappings from `GameSession.mistakes`/`.hints`
  (Lesson 36, reappearing) — both already real, plain `int`s.

### CS Lens

**Mapping an enum to storable text by its name, not its position**, is
worth its own real, brief note (not a full, multi-recurrence hard
concept — routine, once decided).

### SE Lens

The real principle is **storing a real, stable name over a real,
fragile position**. The alternative not chosen: `INTEGER`, storing
`Difficulty.index`/`GameStatus.index`. The real tradeoff: `TEXT` costs a
few more real bytes per row than `INTEGER` would; the real payoff,
concretely: if `Difficulty` (Lesson 42) ever gained a new real value
inserted before `.hard`, every already-stored real `.index` would
silently point at the wrong real difficulty, while every already-stored
real `.name` would keep meaning exactly what it always did. The honest,
present cost: nothing in this app's own schema *enforces* that a stored
real `difficulty`/`status` string is actually one of the real, valid
enum names — a real, open gap, matching Lesson 42's own already-real
point about a `String`-typed value trusting the writer to get it right,
now inherited by this project's own database instead of just its own
Dart code.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — `onCreate`'s own real body only runs when
`AppDatabase._open()` opens a genuinely new file; Concept Unit 5's own
real, permanent test is where this table's own real existence is
actually confirmed.

### Connect

`game_sessions` now has a real shape for every real field `GameSession`
already tracks — except the real board itself. Concept Unit 3 adds that.

---

## Concept Unit 3: Storing the Real Board as Text

### The Problem

`SudokuBoardDto` (Lesson 45) already, really holds a game's own real
board state — `cells` (`List<List<int?>>`), `givenCells`
(`List<List<bool>>`) — but neither is a real SQLite column type at all.

> **Socratic prompt:** Lesson 45's own real, run proof already showed
> `jsonEncode` handles a raw `List<List<int?>>` with zero extra work,
> because it's already one of `jsonEncode`'s own directly-encodable real
> types. Given that, what real column type would hold the resulting real
> JSON text? Second: reading a real board back out later (Lesson 54's
> own future job) means calling `jsonDecode` on that real text — given
> `jsonDecode`'s own real declared return type is `dynamic`, would you
> expect the real value that comes back to already be a real
> `List<List<int?>>`, ready to use, or something else?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_board_dto.dart`,
  lines 21-50 (`SudokuBoardDto`'s own real `cells`/`givenCells` fields,
  read fresh this session).
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified.
- **Change type:** add.
- **Location:** inside `game_sessions`'s own real `CREATE TABLE`
  statement, Concept Unit 2.
- **Dependencies:** none new.

### The New Code

```dart
cells TEXT NOT NULL,
given_cells TEXT NOT NULL
```

### Updated Project

`game_sessions`'s own complete, real, final shape:

```dart
 8  await db.execute('''
 9    CREATE TABLE game_sessions (
10     id INTEGER PRIMARY KEY,
11     difficulty TEXT NOT NULL,
12     status TEXT NOT NULL,
13     started_at TEXT NOT NULL,
14     mistakes INTEGER NOT NULL,
15     hints INTEGER NOT NULL,                               // ← modified: trailing comma added
16     cells TEXT NOT NULL,                                  // ← new
17     given_cells TEXT NOT NULL                             // ← new
18   )
19 ''');
```

`game_sessions` now has a real column for every single real piece of
data curriculum's own Lesson 54 bullet lists — puzzle, state, timer,
difficulty, mistakes, hints — nothing left to add later just to make
that list complete.

### Isolate and Discard

**A real, run lab, this session, kept in `verification/lesson-51/
schema_labs_test.dart`**, proving both this unit's own Socratic
questions before committing to this real design:

```dart
final cells = List<List<int?>>.generate(9, (row) => List<int?>.generate(9, (col) => (row + col) % 3 == 0 ? row + col : null));
final givenCells = List<List<bool>>.generate(9, (row) => List<bool>.generate(9, (col) => (row + col) % 3 == 0));

final json = jsonEncode({'cells': cells, 'given_cells': givenCells});

final decoded = jsonDecode(json) as Map<String, dynamic>;
final decodedCells = (decoded['cells'] as List)
    .map((row) => (row as List).map((v) => v as int?).toList())
    .toList();
```

Real, captured output:

```
REAL encoded JSON length: 853
REAL cells match: true
REAL given_cells match: true
REAL decoded[0]: [0, null, null, 3, null, null, 6, null, null]
REAL decoded cells[0] runtimeType: List<dynamic>, decoded cells[0][0] runtimeType: int
```

Real, direct proof of this unit's own two Socratic questions: `TEXT`
genuinely holds the real, round-tripped JSON correctly (`cells match: true`,
`given_cells match: true`); and `jsonDecode`'s own real return value is
genuinely `List<dynamic>`, **not** the original real `List<int?>` shape
— a real, necessary cast, real and confirmed, not assumed. This whole
lab is discarded — it never appears in `project/`; Lesson 54's own
future real save/load code is where this exact real shape gets used for
real.

### Mechanical Walkthrough

- `cells TEXT NOT NULL` — real, holding the real JSON text `jsonEncode`
  (Objects and methods, above) produces from `SudokuBoardDto.cells`
  (Lesson 45, reappearing).
- `given_cells TEXT NOT NULL` — the identical real shape, for
  `SudokuBoardDto.givenCells`; named with a real underscore
  (`given_cells`), matching every other real column name's own real,
  `snake_case` convention in this schema, rather than `givenCells`'s own
  real Dart-side `camelCase`.

### CS Lens

**Serializing a compound, structured value into one flat, storable
field** is a hard concept.

```
Also recognized in: a browser's own real localStorage (strings only,
compound objects always JSON-encoded first), a REST API's own real
JSON request/response body, a config file (YAML/TOML/JSON alike) storing
a real, nested settings tree as flat, parseable text
```

### SE Lens

The real principle is **one real column holding one real, opaque blob of
serialized data, rather than 81 separate real columns, one per real
cell**. The alternative not chosen: `cell_0_0 INTEGER`, `cell_0_1
INTEGER`, ... — 81 real, individually-named columns (plus 81 more for
`given_cells`). The real tradeoff: a real, single `TEXT` column can
never be queried cell-by-cell in real SQL (`WHERE cell_4_4 = 5` simply
isn't possible against JSON text without SQLite's own real, separate
JSON extension functions, genuinely out of this lesson's own scope); the
real payoff is a real schema that doesn't have to change at all if this
project's own board size ever did, and a real row this app's own Dart
code can read back as one real, whole object, exactly matching how it
already thinks about a board everywhere else.

### Commands Needed

None new.

### Run It

Real, captured output, already shown above, in Isolate and Discard —
this unit's own real lab **is** its own real run, per the Verification
Rule's own Persistence clause, not re-run a second time for the same
real evidence.

### Connect

`game_sessions` can now hold a real, complete, exact snapshot of one
real game. Concept Unit 4 designs a second real table for what happens
once that game genuinely ends.

---

## Concept Unit 4: Designing `scores` and Its Real Foreign Key

### The Problem

`game_sessions` holds one real row per real game, live or finished.
Curriculum's own Lesson 56 bullet wants a real, permanent, separate
record of every real *completed* game — completion time, difficulty,
date, score, mistakes, hints — that survives even if `game_sessions`
itself is ever pruned.

> **Socratic prompt:** a real score genuinely belongs to exactly one
> real game session — given Lesson 49's own real `FOREIGN KEY` proof
> (a `loans` row genuinely rejected for naming a nonexistent `book_id`,
> once enforcement was on), what real column would `scores` need, and
> what real table and column would it need to reference? Second: this
> app's own `AppDatabase._open()` (Lesson 50) has never once called
> `PRAGMA foreign_keys = ON` — given Lesson 49's own real, run proof
> that SQLite's own real default leaves foreign keys genuinely
> unenforced, what real, concrete risk does that leave open for this
> exact new column, right now?

### Project Change

- **Reference Source:** No reference counterpart — `scores` is a
  genuinely new real concept; curriculum's own Lesson 56 bullet
  ("Completion time, Difficulty, Date, Score, Mistakes, Hints") names
  the real fields, not a real implementation.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified.
- **Change type:** add.
- **Location:** inside `_open()`'s own real `onCreate` callback,
  immediately after `game_sessions` (Concept Units 2-3).
- **Dependencies:** `game_sessions` must already exist — `scores`'s own
  real `FOREIGN KEY` references it.

### The New Code

```dart
await db.execute('''
  CREATE TABLE scores (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    completion_seconds INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    mistakes INTEGER NOT NULL,
    hints INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id)
  )
''');
```

### Updated Project

`onCreate`'s own real, now-complete body, every table shown whole:

```dart
 1  onCreate: (db, version) async {
 2    await db.execute('''
 3      CREATE TABLE settings (
 4        key TEXT PRIMARY KEY,
 5        value INTEGER NOT NULL
 6      )
 7    ''');
 8    await db.execute('''
 9      CREATE TABLE game_sessions (
10       id INTEGER PRIMARY KEY,
11       difficulty TEXT NOT NULL,
12       status TEXT NOT NULL,
13       started_at TEXT NOT NULL,
14       mistakes INTEGER NOT NULL,
15       hints INTEGER NOT NULL,
16       cells TEXT NOT NULL,
17       given_cells TEXT NOT NULL
18     )
19   ''');
20   await db.execute('''                                    // ← new
21     CREATE TABLE scores (                                  // ← new
22       id INTEGER PRIMARY KEY,                              // ← new
23       session_id INTEGER NOT NULL,                         // ← new
24       completed_at TEXT NOT NULL,                          // ← new
25       completion_seconds INTEGER NOT NULL,                  // ← new
26       difficulty TEXT NOT NULL,                             // ← new
27       mistakes INTEGER NOT NULL,                            // ← new
28       hints INTEGER NOT NULL,                               // ← new
29       FOREIGN KEY (session_id) REFERENCES game_sessions(id) // ← new
30     )                                                      // ← new
31   ''');                                                    // ← new
32 }
```

This app's own real schema now has all three real tables curriculum's
own model named in spirit — `settings`, `game_sessions`, `scores` — real
and shaped by this project's own actual domain, not a generic template.

### Isolate and Discard

No separate throwaway lab — `FOREIGN KEY` itself already got full, real
treatment, twice over (Lesson 49's own `loans`/`books`, and this unit's
own real, isolated question about *this* schema's own real risk); its
own real, run proof, against this exact real table, is Concept Unit 5's
own subject, once `onConfigure` (below) actually turns enforcement on.

### Mechanical Walkthrough

- `CREATE TABLE scores` — the identical real statement, naming a
  genuinely new real table.
- `id INTEGER PRIMARY KEY` — the identical real shape already used
  twice.
- `session_id INTEGER NOT NULL` — a real, plain `INTEGER` column, on its
  own structurally identical to any other — real enforcement is
  `FOREIGN KEY`'s own job, below, not this declaration's.
- `completed_at TEXT NOT NULL` — the identical real ISO 8601 design
  already chosen for `started_at` (Concept Unit 2).
- `completion_seconds INTEGER NOT NULL` — a real, plain integer count —
  curriculum's own "Completion time" bullet, stored as elapsed real
  seconds rather than a second real timestamp, since `GameSession.elapsed`
  (Lesson 36, reappearing) already computes exactly that real shape.
- `difficulty TEXT NOT NULL` — real and **denormalized** (Terms, above):
  the identical real value already stored on the real, referenced
  `game_sessions` row, copied here too, on purpose.
- `mistakes INTEGER NOT NULL` / `hints INTEGER NOT NULL` — the identical
  real shape already used on `game_sessions`, a real, final snapshot at
  the exact real moment of completion.
- `FOREIGN KEY (session_id) REFERENCES game_sessions(id)` — `FOREIGN
  KEY` (Lesson 49, reappearing) — the real, enforced mechanism naming
  that `session_id`'s own real value must actually exist as a real `id`
  in `game_sessions` — this unit's own direct, real answer to its own
  first Socratic question.

### CS Lens

Not repeated separately — **a foreign key expressing a real, permanent
ownership relationship** is the identical hard concept Lesson 49's own
CS lens already gave full, real, multi-recurrence treatment to.

### SE Lens

The real principle is **denormalizing `difficulty` on purpose, for a
real, measured reason** — directly, honestly weighed against normal
relational practice, which would say "never duplicate a value already
reachable by `JOIN`." The alternative not chosen: omit `scores.difficulty`
entirely, always joining back to `game_sessions.difficulty` when needed.
The real tradeoff: this real copy could, in principle, ever disagree with
its own real source, if `game_sessions.difficulty` were ever changed
after a real score already existed pointing at it (which nothing in this
app's own current code ever does, but nothing stops either) — a real,
honest, accepted risk, paid specifically because curriculum's own Lesson
57 bullet ("Difficulty-specific best") needs to filter and sort `scores`
by real difficulty directly, without a real `JOIN` on every single real
leaderboard query. This unit's own second Socratic question — real
foreign-key enforcement being genuinely off by default — is answered
directly next, Concept Unit 5.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — real, permanent proof, including the real
`FOREIGN KEY` rejection this unit's own second Socratic question raised,
is Concept Unit 5's own subject, once real enforcement is actually
turned on.

### Connect

Every real table this project's own schema needs, for now, is designed.
Concept Unit 5 makes the real schema real — extends `AppDatabase` for
real, turns real foreign-key enforcement on, and proves, for real, that
both new tables behave exactly as designed.

---

## Concept Unit 5: Making the Real Schema Real

### The Problem

Every real `CREATE TABLE` statement so far exists only in this lesson's
own prose. `AppDatabase`'s own real, actual `onCreate` callback (Lesson
50) still only creates `settings`. And Concept Unit 4's own second
Socratic question is still genuinely unanswered: this app has never once
turned real foreign-key enforcement on at all.

> **Socratic prompt:** `openDatabase`'s own real, declared parameters
> (Lesson 50) include `onConfigure`, called before `onCreate`, on
> *every* real open — not just a brand-new file's first one. Given
> `PRAGMA foreign_keys = ON` (Lesson 49, reappearing) is a real,
> per-connection setting, not something SQLite remembers permanently
> inside the database file itself, why does that real distinction make
> `onConfigure` the right real place for it, rather than inside
> `onCreate` alongside the real `CREATE TABLE` calls?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/app_database.dart`, lines
  24-49 (`_open()`'s own real, current body, read fresh this session).
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified; `project/test/app_database_schema_test.dart` — created;
  `project/pubspec.yaml` — modified (`meta` added as a real, direct
  dependency).
- **Change type:** add.
- **Location:** `openDatabase`'s own real call, inside `_open()`.
- **Dependencies:** Concept Units 2-4's own real `CREATE TABLE`
  statements, already written into this same real file.

### The New Code

```dart
onConfigure: (db) async {
  await db.execute('PRAGMA foreign_keys = ON');
},
```

### Updated Project

`_open()`'s own real, complete, final body:

```dart
 1  Future<Database> _open() async {
 2    final existing = _database;
 3    if (existing != null) {
 4      return existing;
 5    }
 6    if (!Platform.isAndroid && !Platform.isIOS) {
 7      sqfliteFfiInit();
 8      databaseFactory = databaseFactoryFfi;
 9    }
10   final supportDir = await getApplicationSupportDirectory();
11   final path = join(supportDir.path, 'open_calc_sudoku.db');
12   final opened = await openDatabase(
13     path,
14     version: 1,
15     onConfigure: (db) async {                              // ← new
16       await db.execute('PRAGMA foreign_keys = ON');         // ← new
17     },                                                      // ← new
18     onCreate: (db, version) async {
19       await db.execute('''
20         CREATE TABLE settings (
21           key TEXT PRIMARY KEY,
22           value INTEGER NOT NULL
23         )
24       ''');
25       await db.execute('''
26         CREATE TABLE game_sessions (
27           id INTEGER PRIMARY KEY,
28           difficulty TEXT NOT NULL,
29           status TEXT NOT NULL,
30           started_at TEXT NOT NULL,
31           mistakes INTEGER NOT NULL,
32           hints INTEGER NOT NULL,
33           cells TEXT NOT NULL,
34           given_cells TEXT NOT NULL
35         )
36       ''');
37       await db.execute('''
38         CREATE TABLE scores (
39           id INTEGER PRIMARY KEY,
40           session_id INTEGER NOT NULL,
41           completed_at TEXT NOT NULL,
42           completion_seconds INTEGER NOT NULL,
43           difficulty TEXT NOT NULL,
44           mistakes INTEGER NOT NULL,
45           hints INTEGER NOT NULL,
46           FOREIGN KEY (session_id) REFERENCES game_sessions(id)
47         )
48       ''');
49     },
50   );
51   _database = opened;
52   return opened;
53 }
```

`_open()` now does everything it did since Lesson 50, plus one real,
new, load-bearing thing: every real connection this app ever opens,
brand-new database or not, genuinely enforces every real `FOREIGN KEY`
this schema declares.

### Isolate and Discard

No separate throwaway lab — `PRAGMA foreign_keys = ON` already got full,
real treatment, and a full, real, run proof, in Lesson 49; this unit's
own real, permanent test, below, is where that identical real proof runs
again, against this project's own real schema instead of Lesson 49's
own throwaway `loans`/`books`.

### Mechanical Walkthrough

- `onConfigure: (db) async { ... }` — a real, named callback argument on
  `openDatabase` (Lesson 50, reappearing, full CRC treatment there),
  genuinely new here in that this is the first time this app's own code
  actually supplies one; its own real declared contract (Lesson 50's own
  quoted source) runs it first, on *every* real open — directly
  answering this unit's own Socratic question: `PRAGMA foreign_keys = ON`
  is a real, per-connection setting (Lesson 49, reappearing), reset every
  real time a real connection is freshly opened, so it has to be
  re-applied every real time, not just the one real time `onCreate` ever
  runs.
- `await db.execute('PRAGMA foreign_keys = ON')` — `db.execute` (Lesson
  50, reappearing) running the identical real `PRAGMA` statement Lesson
  49 already gave full treatment to, this time through a real Dart API
  call instead of the `sqlite3` CLI.

### CS Lens

Not repeated separately — real, per-connection configuration is the
identical real idea Lesson 49's own `PRAGMA` material already covered in
full.

### SE Lens

The real principle is **enforcement turned on globally, once, at the one
real seam every connection passes through** — rather than trusting every
future real caller to remember it. The alternative not chosen: leave
foreign keys real and unenforced (SQLite's own real, silent default),
relying on this app's own future Dart code to never write a real,
orphaned `scores` row by mistake. The real tradeoff: `onConfigure` costs
three real lines, for a real, structural guarantee — a real, buggy
future `ScoreRepository` (Lesson 53) simply *cannot* insert a `scores`
row naming a nonexistent session, the identical real class of protection
Lesson 49's own `loans` example already proved, now genuinely load-
bearing for this project's own real data.

### Commands Needed

- **`flutter pub add meta`** — a real, mid-session, caught-by-`flutter
  analyze` addition: `@visibleForTesting` (Terms, above) needed a real,
  explicit direct dependency, not just a transitive one.

### Run It

Real, permanent test, `project/test/app_database_schema_test.dart`, real
and run this session (reusing `useIsolatedTestDatabase()`, Lesson 50):

```dart
test('a real score naming a nonexistent session is genuinely rejected', () async {
  final appDb = AppDatabase();
  final db = await appDb.rawDatabaseForTest();

  expect(
    () => db.insert('scores', {
      'session_id': 999999,
      'completed_at': DateTime(2026).toIso8601String(),
      'completion_seconds': 1,
      'difficulty': 'easy',
      'mistakes': 0,
      'hints': 0,
    }),
    throwsA(isA<DatabaseException>()),
  );
  await appDb.close();
});
```

Real, captured summary: `flutter pub add meta`, then `flutter analyze .`
(34 issues, same pre-existing categories, zero new) and `flutter test`
(28 real test-file-level checks, up from 25 at the end of Lesson 50,
`All tests passed!`, confirmed clean across two consecutive full runs) —
including this real test, real and passing: a `scores` row naming
`session_id: 999999`, which genuinely doesn't exist in `game_sessions`,
is genuinely, really rejected.

### Connect

Every real table this schema needs now genuinely exists, on disk, real
and enforced. Lesson 52 covers what happens the real day this exact
schema needs to change on a real device that already has real player
data in it.

---

## Connect the Pieces

A real, evidence-based search (reusing Lesson 42's own already-
established method) confirmed `players` has no real, current place in
this schema, honestly deferred to Lesson 75 rather than built as dead
weight (Concept Unit 1). `game_sessions` maps directly from
`GameSession`'s own real, already-existing fields — `Difficulty`/
`GameStatus` stored by their own real, stable `.name`, never a fragile
`.index` (Concept Unit 2) — and holds a real, complete board snapshot,
`cells`/`given_cells`, real JSON text, real-run-proved to round-trip
correctly, including the real, necessary cast `jsonDecode` demands back
(Concept Unit 3). `scores` names a real, permanent record of every
completed game, its own real `FOREIGN KEY` pointing back to
`game_sessions`, `difficulty` deliberately denormalized for Lesson 57's
own future leaderboard queries (Concept Unit 4). And `AppDatabase`'s own
real `onConfigure` callback, genuinely new this lesson, turns real
foreign-key enforcement on for every real connection this app will ever
open — real, run, permanent proof that a `scores` row naming a
nonexistent session is genuinely, structurally impossible now, not just
discouraged (Concept Unit 5). Every real table this project's own future
features need now exists, real and on disk, real and enforced — with
real, honest gaps left open on purpose: nothing reads or writes
`game_sessions`/`scores` yet (Lesson 54), and nothing yet handles what
happens the day this exact real schema needs to change under a real,
already-installed database (Lesson 52).
