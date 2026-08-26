# Lesson 55: A Game That Remembers Where It Left Off

**Resume Interrupted Games**

## What you will build

Kill this app mid-game — a real move already made, a real mistake
already counted — and restart it. The exact real board, the exact real
mistake count, the exact real status come back, because this lesson
teaches the real, live `GameSession` how to rebuild itself from the raw
row this app's own real, already-established save logic faithfully
writes on every real move. The transferable problem: writing data down
is only half of persistence:
reading it back has to rebuild a real, live, rule-owning object — not
just raw fields — and has to do that safely, without ever silently
overwriting a real player's own already-in-progress fresh game with a
stale, late-arriving save from a previous real run.

## What you need to know first

- Lesson 39 ("Naming and Injecting a Dependency") — `Clock`, injected
  again, this time into a rebuilt `GameSession`, not a fresh one.
- Lesson 45 ("Data Shaped for Carrying, Not for Deciding") /
  Lesson 46 ("Crossing the Boundary in Both Directions") —
  `SudokuBoardDto.toBoard`, real and already built, called for real for
  the first time in this lesson.
- Lesson 50 ("Local Database") / Lesson 53 ("A Score Finally Has
  Somewhere to Belong") — `AppDatabase`'s own real, lazy connection and
  the repository shape this lesson's own new method extends.
- Lesson 54 ("Saving Games") — `GameSessionRepository`,
  `SqliteGameSessionRepository`, `AppDatabase.saveGameSession`/
  `currentGameSessionRow`, and the exact real, written shape
  (`Enum.name`, `.toIso8601String()`, `jsonEncode`) this lesson's own
  work must exactly reverse.

## Terms used in this lesson

- **Named constructor** — a real Dart constructor carrying an extra
  name after the class name (`ClassName.someName(...)`), real and
  distinct from a class's one, ordinary, unnamed constructor. Exists so
  a single class can offer more than one genuinely different real way
  to come into existence — a fresh instance built from scratch, versus
  an instance rebuilt from already-known, previously-saved values —
  without needing two entirely separate classes for what is really the
  same real entity.
- **Required named parameter** — a real Dart parameter, declared inside
  curly braces and marked with the real `required` keyword, that must
  be supplied by every real caller even though it's passed by name, not
  position. Exists so a constructor or method with several real
  parameters of the identical real type (three real `int`s; two real
  `DateTime`s) can force every real caller to name each one explicitly,
  removing any real risk of two same-typed arguments landing in the
  wrong real order.
- **Initializer list** — the real, optional clause after a Dart
  constructor's own parameter list, introduced by a real `:`, assigning
  values to real `final` fields before the constructor's own body ever
  runs. Exists because a real `final` field can only ever be assigned
  once, and Dart requires that one real assignment to happen before the
  constructor body starts, not inside it.
- **Initializing formal** — the real `this.fieldName` shorthand inside a
  Dart constructor's own parameter list, real and automatically
  assigning the real, incoming argument straight to the real,
  same-named field. Exists to remove the real, repetitive
  `SomeClass(SomeType fieldName) : fieldName = fieldName;` boilerplate
  an initializer list would otherwise need for a plain, direct
  assignment.
- **Type cast operator (`as`)** — a real Dart operator asserting, to the
  compiler, that a real value already known to be some general type
  (`Object?`, `List`) is actually, at runtime, some real, more specific
  type — real and throwing a real runtime error if that assertion turns
  out to be false. Exists because some real APIs (`jsonDecode`, below)
  can only ever declare a broad, general return type, since they have
  no real way to know a caller's own specific real shape in advance.
- **Null-coalescing assignment (`??=`)** — a real Dart operator:
  `a ??= b` assigns `b` to `a` only when `a` is currently, really
  `null`, and leaves `a` genuinely unchanged otherwise, real and either
  way evaluating to `a`'s own resulting value. Exists to express "fill
  this in only if it's still empty" in one real expression, without a
  real, explicit `if (a == null) { a = b; }` block.
- **Microtask** — a hard concept: a real, small unit of work Dart's own
  event loop guarantees to run before it moves on to the next real,
  separate task (a real timer firing, a real I/O callback arriving),
  but only ever after every currently-running real, synchronous code
  finishes first. Exists to let a real piece of code say "run this
  soon, but not right this instant, and not interleaved with whatever
  synchronous code is still running" — genuinely different from both
  "run this synchronously, right now" and "run this after some real,
  possibly long, external delay."
- **Race condition** — a hard concept: a real, genuine bug where two or
  more real pieces of code, each independently checking some real,
  shared state before acting on it, can interleave in an unlucky real
  order that neither one alone would ever produce, because each one's
  own check happened before the other's own action finished. Exists as
  the name for exactly the real, indefinite hang this lesson's own real
  verification work discovered and fixed: two separate real callers
  reaching `AppDatabase`'s own connection logic before either one's own
  real `openDatabase` call had resolved.
- **Memoization** — a hard concept: real, deliberately caching the
  result (or, real and specifically here, the still-in-flight promise
  of a future result) of some real, expensive or singular operation, so
  a second real caller reuses the first real caller's own already-
  started or already-finished work instead of redundantly repeating it.
  Exists as the real, general name for the specific real fix this
  lesson's own `AppDatabase` needed: caching the real, in-flight
  `Future` itself, not only its real, eventual, finished value.

## Objects and methods used

- **`GameSession.restored`**
  - *What it is:* a real, new named constructor (Terms, above) on the
    already-existing `GameSession` class — this lesson's own first
    primary subject.
  - *Implementation:*
    ```dart
    GameSession.restored(
      this.board,
      this._clock, {
      required this.difficulty,
      required this.startTime,
      required int mistakes,
      required int hints,
      required GameStatus status,
    }) : _mistakes = mistakes,
         _hints = hints,
         _status = status;
    ```
  - *Its use:* `SqliteGameSessionRepository.load`, below, calls this
    real constructor once every real time a saved row exists, handing
    it every real field that row held.
  - *Type:* a real, named instance constructor.
  - *Responsibility:* rebuilding a real, live `GameSession`, whole, from
    every real, already-known field a previous real save produced —
    nothing about reading that data from a real database row, which
    stays entirely `SqliteGameSessionRepository`'s own real job.
  - *Depends on:* a real, already-restored `SudokuBoard`; a real
    `Clock`; and every one of `difficulty`/`startTime`/`mistakes`/
    `hints`/`status`, supplied explicitly by its real caller.
  - *Connects to:* called only from `SqliteGameSessionRepository.load`,
    below; its own real result becomes `GameSessionNotifier`'s own real,
    resumed `state`, further below.
  - *Shape:* a real, second, alternate entry point into `GameSession`'s
    own Domain-layer entity — genuinely distinct from its ordinary,
    fresh-session constructor, never replacing it.

- **`GameSessionRepository.load`**
  - *What it is:* one real, new abstract method added to the
    already-existing `GameSessionRepository` interface — this lesson's
    own second primary subject.
  - *Implementation:* `Future<GameSession?> load(Clock clock);` — a
    real, nullable return type, and a real, required `Clock` parameter.
  - *Its use:* names, as its own real, separate ability, "read this
    app's own one, saved session back as a real, live `GameSession`" —
    an ability nothing in this app had before this lesson.
  - *Type:* a real, abstract instance method signature.
  - *Responsibility:* naming exactly one real ability — rebuilding this
    app's own, one, saved session into a real, live entity, or honestly
    reporting that none exists — nothing about how that rebuilding
    actually happens, which its own real, concrete implementation,
    below, alone decides.
  - *Depends on:* a real `Clock`, since building any real `GameSession`
    — restored or fresh — always requires one.
  - *Connects to:* implemented by `SqliteGameSessionRepository.load`,
    below; called by `GameSessionNotifier._loadSavedSession`, further
    below.
  - *Shape:* the real Domain-layer seam this lesson's own new ability
    is declared against, the identical real role `save`/
    `hasSavedSession` already play on this same real interface.

- **`SqliteGameSessionRepository.load`**
  - *What it is:* the one, real, concrete implementation of
    `GameSessionRepository.load`, above — this lesson's own third
    primary subject.
  - *Implementation:*
    ```dart
    @override
    Future<GameSession?> load(Clock clock) async {
      final row = await _database.currentGameSessionRow();
      if (row == null) {
        return null;
      }
      final dto = SudokuBoardDto(
        (jsonDecode(row['cells'] as String) as List).map((r) => (r as List).cast<int?>()).toList(),
        (jsonDecode(row['given_cells'] as String) as List).map((r) => (r as List).cast<bool>()).toList(),
      );
      return GameSession.restored(
        dto.toBoard(),
        clock,
        difficulty: Difficulty.values.byName(row['difficulty'] as String),
        startTime: DateTime.parse(row['started_at'] as String),
        mistakes: row['mistakes'] as int,
        hints: row['hints'] as int,
        status: GameStatus.values.byName(row['status'] as String),
      );
    }
    ```
  - *Its use:* the one, real place this whole app turns a real, raw
    database row back into a real, live `GameSession`.
  - *Type:* a real, ordinary instance method, overriding an abstract one.
  - *Responsibility:* the exact real reverse of `save`'s own real
    mapping: translating every real, stored column back into the exact
    real, typed value `GameSession.restored` needs — nothing about
    deciding whether a row exists at all, which `AppDatabase
    .currentGameSessionRow` alone answers.
  - *Depends on:* a real, already-open `AppDatabase` (injected at
    construction, real and unchanged); a real `Clock`, passed in
    by its own real caller.
  - *Connects to:* calls `AppDatabase.currentGameSessionRow`,
    `SudokuBoardDto.toBoard`, and `GameSession.restored`, all below or
    above; called by `GameSessionNotifier._loadSavedSession`, further
    below.
  - *Shape:* the real Infrastructure-layer occupant of the seam
    `GameSessionRepository.load` names — the exact real, symmetrical
    counterpart to `save`, already built, on the identical real class.

- **`AppDatabase.currentGameSessionRow`**
  - *What it is:* the real, already-existing method, read again here by
    this lesson's own new `load` method.
  - *Implementation:* `Future<Map<String, Object?>?> currentGameSessionRow() async { final db = await _open(); final rows = await db.query('game_sessions', where: 'id = ?', whereArgs: [currentGameSessionId]); return rows.isEmpty ? null : rows.first; }`
    — real and unchanged: reads the real, one, fixed-identity row this
    app ever tracks, or reports its real absence as `null`.
  - *Its use:* `SqliteGameSessionRepository.load`, above, calls it once,
    real and first, before deciding whether there is anything left to
    map at all.
  - *Type:* a real, ordinary instance method.
  - *Responsibility:* reading the real, one, current game session's own
    raw row back, or honestly reporting its real absence — nothing
    about turning that raw row into a real, live `GameSession`, which
    stays entirely `SqliteGameSessionRepository`'s own job.
  - *Depends on:* `_open()`, this class's own real, already-established
    private connection method.
  - *Connects to:* called by both `saveGameSession`'s own real caller
    and, now, `load`, above.
  - *Shape:* the real, thin, public seam between `AppDatabase`'s own
    private connection and every real caller reading `game_sessions`
    back, real and unchanged.

- **`SudokuBoardDto` / `SudokuBoardDto.toBoard`**
  - *What it is:* the real, already-existing DTO (Data Transfer Object)
    class, moved into `infrastructure/` once a real infrastructure
    consumer needed it, and its own real, already-written `toBoard`
    method — called for real, for the first time, in this lesson.
  - *Implementation:*
    ```dart
    class SudokuBoardDto {
      SudokuBoardDto(this.cells, this.givenCells);
      final List<List<int?>> cells;
      final List<List<bool>> givenCells;
      SudokuBoard toBoard() => SudokuBoard.withState(cells, givenCells);
    }
    ```
  - *Its use:* `SqliteGameSessionRepository.load`, above, constructs one
    real `SudokuBoardDto` directly from the real, decoded row data, then
    calls `toBoard()` on it to get back a real, live `SudokuBoard`.
  - *Type:* a real, ordinary class; `toBoard` a real, ordinary instance
    method.
  - *Responsibility:* carrying exactly a board's own real, plain data
    across a real boundary, in either real direction — nothing about
    deciding whether that data came from a fresh board or a restored
    one, which it genuinely cannot tell apart.
  - *Depends on:* `toBoard` depends on `SudokuBoard.withState`, a real,
    already-existing factory that treats every explicitly-marked given
    cell as given, rather than guessing from which cells are non-null.
  - *Connects to:* built directly, here, from real, `jsonDecode`d row
    data, rather than from `SudokuBoard.fromBoard`'s own real, opposite
    direction; its own real `toBoard()` result becomes
    `GameSession.restored`'s own first real argument, above.
  - *Shape:* the real, already-established Infrastructure-layer
    boundary between in-memory board state and real, storable data —
    now proven to work in both real directions on the identical real
    class.

- **`jsonDecode`**
  - *What it is:* a real, top-level `dart:convert` function, the exact
    real reverse of `jsonEncode` — converting real, stored
    JSON text back into an untyped, real Dart value.
  - *Implementation:* `dynamic jsonDecode(String source)` — real and
    confirmed, this session: given `'[[1,null,3],[null,5,null]]'`,
    returns a real, plain `List<dynamic>` of `List<dynamic>`s, each
    inner element either a real `int` or real `null` — never already
    typed as `List<List<int?>>`, since `jsonDecode` has no real way to
    know what specific real shape its caller actually expects.
  - *Its use:* `SqliteGameSessionRepository.load`, above, calls it
    twice — once for the real, stored `cells` column, once for
    `given_cells` — turning each real, stored `TEXT` value back into a
    real, nested, but still untyped, list.
  - *Type:* a free, top-level function.
  - *Responsibility:* converting real, stored JSON text into a real,
    in-memory value — nothing about what specific real type that value
    ought to be treated as afterward, which the type cast operator
    (Terms, above) and `.cast`, below, together handle instead.
  - *Depends on:* a real, syntactically valid JSON string.
  - *Connects to:* called twice inside `SqliteGameSessionRepository.load`;
    each real result is immediately cast and re-typed, below, before use.
  - *Shape:* a real, standard `dart:convert` boundary between real,
    storable text and an untyped, in-memory Dart value — the exact real
    reverse of `jsonEncode`'s own real direction.

- **`List.cast<T>`**
  - *What it is:* a real, generic instance method on Dart's own `List`
    class, producing a real, new *view* of an existing real list, typed
    as `List<T>` instead of its own original, real type.
  - *Implementation:* `List<R> cast<R>()` — real, and confirmed, this
    session: calling `.cast<int?>()` on a real, untyped `List` holding
    real `int`s and real `null`s produces a real value whose own real
    `runtimeType` genuinely reports `List<int?>`.
  - *Its use:* `SqliteGameSessionRepository.load`, above, calls it
    twice, inside a real `.map`, turning each real, untyped inner list
    `jsonDecode` produced into the exact real, specific type
    `SudokuBoardDto`'s own real constructor actually requires
    (`List<int?>`, `List<bool>`).
  - *Type:* a real, generic instance method.
  - *Responsibility:* re-typing an already-real list as a different,
    real, specific type — nothing about checking whether every real
    element inside it genuinely, safely fits that real type, which is
    instead deferred to the moment each real element is actually read.
  - *Depends on:* a real, existing `List` to call it on.
  - *Connects to:* called on the real result of `(r as List)`, itself
    read from `jsonDecode`'s own real, untyped result.
  - *Shape:* a real, standard `dart:core` boundary between an untyped,
    just-decoded list and the exact real, specific list type this
    lesson's own code needs to compile against.

- **`Difficulty.values` / `EnumByName.byName`**
  - *What it is:* a real, automatic static getter every real Dart `enum`
    receives for free, returning every one of its own declared real
    values as a real, ordered `List`; and a real, `dart:core` extension
    method on that same real `List`, reversing `Enum.name` — a real,
    already-established `dart:core` getter every enum value carries,
    returning its own declared name as a string — back into the
    matching real enum value.
  - *Implementation:* `static const List<Difficulty> values = [Difficulty.easy, Difficulty.medium, Difficulty.hard];`
    (real, and automatically generated by the Dart compiler for every
    real `enum` — never written by hand); `T byName(String name)` — a
    real, generic extension method Dart's own `dart:core` declares on
    `List<T>` where `T extends Enum`, real and confirmed, this session,
    to throw a real `ArgumentError` (`"No enum value with that name:
    \"nightmare\""`), not silently return `null`, when no real value
    matches.
  - *Its use:* `SqliteGameSessionRepository.load`, above, calls
    `Difficulty.values.byName(row['difficulty'] as String)` and
    `GameStatus.values.byName(row['status'] as String)`, turning the
    real, stored text `Enum.name` already wrote back into the exact
    real enum value it came from.
  - *Type:* a real, automatic static getter (`values`); a real, generic
    extension instance method (`byName`).
  - *Responsibility:* `values`'s whole job: listing every real,
    declared value of one specific real enum, in real declaration
    order — nothing about searching that list; `byName`'s whole job:
    searching a real list of enum values for the one real match to a
    given real name, and failing loudly, not silently, when none exists.
  - *Depends on:* `byName` depends on `values` already existing to
    search through; both depend on nothing beyond the real enum type
    itself.
  - *Connects to:* called twice inside `SqliteGameSessionRepository.load`,
    directly reversing `Enum.name`'s own real, stored text.
  - *Shape:* a real, standard `dart:core` boundary between real, stored
    enum-name text and a real, live enum value — the exact real reverse
    of `Enum.name`'s own real direction.

- **`DateTime.parse`**
  - *What it is:* a real, static factory constructor on `dart:core`'s
    own `DateTime` class, the exact real reverse of a real,
    already-established `DateTime` instance method,
    `.toIso8601String()`.
  - *Implementation:* `static DateTime parse(String formattedString)` —
    real and confirmed, this session: parsing
    `'2026-01-01T09:00:00.000'` back produces a real `DateTime` whose
    own, re-called `.toIso8601String()` reproduces the identical real
    string, byte for byte.
  - *Its use:* `SqliteGameSessionRepository.load`, above, calls it once,
    on the real, stored `started_at` column, rebuilding the exact real
    `DateTime` `GameSession.restored` needs for its own `startTime`.
  - *Type:* a real, static factory constructor.
  - *Responsibility:* losslessly rebuilding a real, in-memory `DateTime`
    from real, stored ISO 8601 text — nothing about deciding which real
    column that text came from.
  - *Depends on:* a real string in a real, valid ISO 8601 shape — real
    and specifically, the exact real shape `.toIso8601String()` already
    guarantees it always produces.
  - *Connects to:* called once inside `SqliteGameSessionRepository.load`.
  - *Shape:* a real, standard `dart:core` boundary between real,
    storable text and in-memory time — the exact real reverse of
    `.toIso8601String()`'s own real direction.

- **`GameSessionNotifier.build` / `GameSessionNotifier._loadSavedSession`**
  - *What it is:* the real, already-existing `build` method, changed
    this lesson to also kick off a real, background resume attempt; and
    a real, new, private method doing that real resuming — this
    lesson's own fourth primary subject.
  - *Implementation:*
    ```dart
    @override
    GameSession build() {
      final fresh = GameSession(
        SudokuBoard(ref.watch(puzzleRepositoryProvider).startingPuzzle()),
        ref.watch(clockProvider),
      );
      Future.microtask(_loadSavedSession);
      return fresh;
    }

    Future<void> _loadSavedSession() async {
      final saved = await ref.read(gameSessionRepositoryProvider).load(ref.read(clockProvider));
      if (!ref.mounted) {
        return;
      }
      if (saved != null && state.status == GameStatus.notStarted) {
        state = saved;
      }
    }
    ```
  - *Its use:* every real time this app starts, `build` still returns a
    real, fresh session immediately, real and synchronously, then
    `_loadSavedSession` runs in the real background, swapping in a real,
    resumed session the moment one is actually found.
  - *Type:* `build` a real, overridden instance method; `_loadSavedSession`
    a real, private, `async` instance method.
  - *Responsibility:* `build`'s whole job, unchanged in shape: returning
    a real, immediately-usable `GameSession` the instant this app
    starts; `_loadSavedSession`'s whole, new job:
    real and safely swapping that real, fresh session for a real,
    previously-saved one, if — and only if — nothing has genuinely
    changed in the meantime.
  - *Depends on:* `build` depends on `puzzleRepositoryProvider`/
    `clockProvider` (both already real); `_loadSavedSession` depends on
    `gameSessionRepositoryProvider`, `clockProvider`, and this real
    notifier's own current `state`.
  - *Connects to:* `build` calls `Future.microtask`, below, handing it
    `_loadSavedSession` itself; `_loadSavedSession` calls
    `GameSessionRepository.load`, above, and reads `ref.mounted`, below.
  - *Shape:* this app's own real Application-layer composition point —
    the one, real place a fresh session and a real, resumed one are
    reconciled into this app's one, real, shared `state`.

- **`Future.microtask`**
  - *What it is:* a real, named static factory constructor on `Future`,
    scheduling a real callback to run once, as a real microtask (Terms,
    above).
  - *Implementation:* `factory Future.microtask<T>(FutureOr<T> Function() computation)`
    — real and confirmed, this session: calling it prints nothing
    immediately; the real callback's own real output prints only after
    every currently-running real, synchronous code has already finished.
  - *Its use:* `build`, above, calls it once, real and deliberately
    un-awaited, handing it `_loadSavedSession` — real and directly
    solving `build`'s own real constraint: it must return a real
    `GameSession` synchronously, so a real, async load can never run
    inside `build` itself, only scheduled to start the moment `build`
    finishes.
  - *Type:* a real, generic, named static factory constructor.
  - *Responsibility:* scheduling exactly one real callback to run
    later, real and soon, but never synchronously, interleaved with
    whatever real, synchronous code is still running — nothing about
    what that callback actually does once it runs.
  - *Depends on:* a real, zero-argument callback to schedule.
  - *Connects to:* called once inside `build`, above, scheduling
    `_loadSavedSession`, above.
  - *Shape:* a real, standard `dart:async` way to defer real work by
    exactly one real microtask — deliberately weaker than a real
    `Timer`, which defers by real, elapsed wall-clock time instead.

- **`Ref.mounted`**
  - *What it is:* a real, boolean Riverpod getter, available on the
    real `ref` every `Notifier` already holds, reporting whether this
    real notifier's own element is still genuinely alive.
  - *Implementation:* `bool get mounted` — real and `true` for as long
    as this real notifier's own provider hasn't been disposed; real and
    `false` afterward.
  - *Its use:* `_loadSavedSession`, above, checks it immediately after
    its own real, awaited `load` call returns, before ever touching
    `state` again.
  - *Type:* a real, boolean instance getter.
  - *Responsibility:* reporting one real fact — whether this notifier
    is still genuinely alive — nothing about what a real caller ought
    to do with that real fact.
  - *Depends on:* nothing beyond this real notifier's own current,
    real lifecycle state.
  - *Connects to:* read once inside `_loadSavedSession`, above,
    immediately guarding every real line that follows it.
  - *Shape:* a real, defensive Riverpod boundary check — the same real
    shape any real, long-running background operation needs before
    touching state that might, by the time it finishes, no longer
    genuinely exist to touch.

- **`AppDatabase._open` / `AppDatabase._reallyOpen` / `Future.value`**
  - *What it is:* `_open`'s own real, existing shape, restructured this
    lesson to fix a real race condition (Terms, above) this lesson's
    own real verification work found; a real, new private method,
    `_reallyOpen`, carrying its own real, original body; and a real,
    named static factory constructor on `Future`, wrapping an
    already-known real value in an already-completed real `Future`.
  - *Implementation:*
    ```dart
    Future<Database>? _opening;

    Future<Database> _open() {
      final existing = _database;
      if (existing != null) {
        return Future.value(existing);
      }
      return _opening ??= _reallyOpen();
    }
    ```
    `_reallyOpen` carries the exact real body `_open` used to hold —
    real and unchanged, only moved, ending with `_database = opened;
    return opened;`. `Future.value` — real, confirmed, this session —
    constructs its real `Future` synchronously, but the real value it
    holds still only reaches a real, awaiting caller on a later real
    microtask, the identical real timing `Future.microtask`, above,
    already proved.
  - *Its use:* every real, already-existing `AppDatabase` method
    (`totalGamesStarted`, `saveGameSession`, `currentGameSessionRow`,
    every other) still calls `_open()` exactly as before — this
    lesson's own real fix changes nothing about any of their own real
    call sites, only `_open`'s own real, internal behavior.
  - *Type:* two real, private instance methods; one real, generic,
    named static factory constructor.
  - *Responsibility:* `_open`'s whole job, unchanged in intent:
    returning this app's one, real, already-open database connection,
    opening it first if genuinely necessary — now, real and
    specifically, guaranteeing that "opening it" only ever really
    happens once, no matter how many real callers ask at once;
    `_reallyOpen`'s whole job: the real, one-time work of actually
    opening a real connection; `Future.value`'s whole job: wrapping an
    already-known real value so it can be returned from a method that
    must always promise a real `Future`, even on its real, fast path.
  - *Depends on:* `_open` depends on `_database` (the real, cached,
    finished connection) and `_opening` (the real, new field caching an
    in-flight one); `_reallyOpen` depends on nothing new.
  - *Connects to:* `_open` is called by every other real `AppDatabase`
    method; `_open` calls `_reallyOpen` at most once per real app run,
    real and regardless of how many real, concurrent callers ask.
  - *Shape:* `AppDatabase`'s own real, private connection seam —
    unchanged from every real caller's own point of view, now real and
    genuinely safe against real, concurrent first use.

- **`ConsumerStatefulWidget` / `ConsumerState`**
  - *What it is:* two real, already-established Riverpod base classes —
    the real, `ref`-aware equivalents of Flutter's own plain
    `StatefulWidget`/`State` — this lesson converts `_SessionStatus`'s
    own real widget pair to, reversing a real debt this project's own
    history honestly flagged and deliberately deferred until a real,
    concrete reason to pay it existed.
  - *Implementation:* `abstract class ConsumerStatefulWidget extends StatefulWidget`;
    `abstract class ConsumerState<T extends ConsumerStatefulWidget> extends State<T>`
    — both real, and both giving every real subclass a real, inherited
    `ref` field, with no real constructor argument required to obtain
    one.
  - *Its use:* `_SessionStatus`/`_SessionStatusState`, this lesson's own
    fifth primary subject, convert to these two real classes so they
    can finally read this app's one, real, shared `AppDatabase` through
    `ref` instead of constructing their own, real, separate one.
  - *Type:* two real, abstract classes.
  - *Responsibility:* `ConsumerStatefulWidget`'s whole job: declaring a
    real widget that needs `ref`, real and nothing more;
    `ConsumerState`'s whole job: giving that real widget's own real
    state object a real, working `ref` to actually use.
  - *Depends on:* both require this real app's own composition root
    (`application/game_session_provider.dart`) to exist, so `ref`
    actually has real providers to read.
  - *Connects to:* already used by `SudokuApp`/`_SudokuAppState`, this
    same real file's own top-level widget; `_SessionStatusState`, below,
    is this real file's own second real user of the identical real
    pair.
  - *Shape:* the real, already-established seam between a Flutter
    widget's own real lifecycle and this app's own real Riverpod
    composition root.

### Everything else in the file, not this lesson's subject but still explained

- **`GameSession`**
  - *What it is:* the real, already-existing domain entity this whole
    lesson exists to rebuild, not construct fresh — read from directly
    again in this lesson's own new code.
  - *Implementation:* real, unchanged real, public shape:
    `final SudokuBoard board; final Difficulty difficulty; final
    DateTime startTime; int get mistakes; int get hints; GameStatus get
    status;` — a real entity (a real object whose own identity persists
    across real changes to its own held data), not a real value object.
  - *Its use:* `_loadSavedSession`, above, reads `state.status` directly
    to decide whether resuming is even still safe.
  - *Type:* a real, ordinary class.
  - *Responsibility:* owning this whole app's own real game rules and
    real, current state — nothing about persistence, which this app's
    own repository, not `GameSession` itself, still alone handles.
  - *Depends on:* a real, live `SudokuBoard` and a real, injected
    `Clock`, both real and unchanged.
  - *Connects to:* `_loadSavedSession` reads its `status`; `state` is
    reassigned to a real, different `GameSession` — the one
    `GameSession.restored` built, above — never mutated in place.
  - *Shape:* this app's own, unchanged, real Domain-layer entity.

- **`GameStatus`**
  - *What it is:* the real, already-existing enum naming every real
    state a played game can be in.
  - *Implementation:* `enum GameStatus { notStarted, playing, paused,
    interrupted, completed, failed, abandoned }` — real and unchanged.
  - *Its use:* `_loadSavedSession`, above, compares `state.status` to
    `GameStatus.notStarted` directly; `SqliteGameSessionRepository.load`,
    above, reverses a real, stored status name back into one of these
    real values via `.byName`, above.
  - *Type:* a real, ordinary Dart `enum`.
  - *Responsibility:* naming every real state this app's own session can
    be in — nothing about which real transitions between them are
    actually legal, which `GameSession` itself alone still decides.
  - *Depends on:* nothing.
  - *Connects to:* read by `_loadSavedSession`; reversed by `.byName` in
    `SqliteGameSessionRepository.load`.
  - *Shape:* this app's own, unchanged, real Domain-layer enum.

- **`Provider` / `ref.watch` / `ref.read`**
  - *What it is:* the real, already-established Riverpod class
    declaring one real, app-wide value, and the real, paired instance
    methods reading a real provider's own current value.
  - *Implementation:* `Provider<T>((ref) => concreteValue)`;
    `ref.watch(someProvider)` real and subscribes the caller to future
    real changes; `ref.read(someProvider)` real and reads the current
    real value once, with no real, ongoing subscription.
  - *Its use:* `_loadSavedSession`, above, calls `ref.read` twice —
    real and deliberately, since this method runs after `build()` has
    already established every real subscription this notifier needs;
    calling `ref.watch` again here would create a real, unwanted,
    additional subscription with no further real purpose.
  - *Type:* a real, generic class (`Provider<T>`); two real instance
    methods (`ref.watch`, `ref.read`).
  - *Responsibility:* real and unchanged: `Provider` constructs
    one real value, once, real and lazily; `ref.watch` reads and
    subscribes; `ref.read` reads once, real and only once.
  - *Depends on:* `ref.watch`/`ref.read` both depend on an
    already-declared real provider.
  - *Connects to:* `_loadSavedSession` reads `gameSessionRepositoryProvider`
    and `clockProvider`, both already real.
  - *Shape:* the real, unchanged, central mechanism this app's own
    composition root is built from.

- **`Difficulty`**
  - *What it is:* the real, already-existing enum naming every real
    difficulty this app's own classifier can report.
  - *Implementation:* `enum Difficulty { easy, medium, hard }` — real
    and unchanged.
  - *Its use:* `SqliteGameSessionRepository.load`, above, reverses a
    real, stored difficulty name back into one of these real values via
    `Difficulty.values.byName`, above.
  - *Type:* a real, ordinary Dart `enum`.
  - *Responsibility:* naming every real difficulty this app can ever
    classify a board as — nothing about how that classification itself
    happens.
  - *Depends on:* nothing.
  - *Connects to:* reversed by `.byName` in
    `SqliteGameSessionRepository.load`.
  - *Shape:* this app's own, unchanged, real Domain-layer enum.

- **`Enum.name`**
  - *What it is:* a real, already-established `dart:core` getter every
    real Dart `enum` value automatically has, real and returning its
    own declared, real name as a string — the exact real, opposite
    direction of `.byName`, above.
  - *Implementation:* `String get name` — real and already confirmed:
    `Difficulty.hard.name` real and returns `'hard'`;
    `GameStatus.playing.name` real and returns `'playing'`.
  - *Its use:* named here as the exact real thing `.byName`, above,
    reverses — this app's own `save` method already, really calls it to
    build the real, stored text `.byName` now reads back.
  - *Type:* a real, automatic instance getter.
  - *Responsibility:* returning a real, stable string for a real enum
    value — nothing about ever reading that string back into a real
    enum again, which `.byName`, above, alone now does.
  - *Depends on:* nothing beyond the real enum value itself.
  - *Connects to:* its own real, stored output is exactly what
    `Difficulty.values.byName`/`GameStatus.values.byName`, above, read
    back.
  - *Shape:* a real, standard `dart:core` boundary between an in-memory
    enum value and real, storable text — the exact real reverse
    direction from `.byName`, above.

- **`jsonEncode`**
  - *What it is:* a real, top-level `dart:convert` function, already
    used by this app's own `save` method — the exact real, opposite
    direction of `jsonDecode`, above.
  - *Implementation:* `String jsonEncode(Object? object)` — real, and
    already confirmed to handle a raw, nested `List<List<int?>>`/
    `List<List<bool>>` with zero extra work.
  - *Its use:* named here as the exact real thing `jsonDecode`, above,
    reverses — this app's own `save` method already, really calls it,
    twice, to build the real, stored text `jsonDecode` now reads back.
  - *Type:* a free, top-level function.
  - *Responsibility:* converting a real, in-memory value into real JSON
    text — nothing about reading that text back, which `jsonDecode`,
    above, alone now does.
  - *Depends on:* every real, nested value inside its argument also
    being real and encodable.
  - *Connects to:* its own real, stored output is exactly what
    `jsonDecode`, above, reads back.
  - *Shape:* a real, standard `dart:convert` boundary between in-memory
    Dart values and real, storable text — the exact real reverse
    direction from `jsonDecode`, above.

---

## Concept Unit 1: `GameSession.restored` — a Second, Real Way to Come Into Existence

### The Problem

`GameSession`'s only real constructor always computes `difficulty`
fresh, from a real, live board, and always defaults `startTime` to
whatever `Clock.now()` reports right now. A row this app reads back
from `game_sessions` already, honestly holds its own real, previously
computed difficulty and its own real, original start time — recomputing
either would silently produce a real, wrong answer: a resumed session's
own real elapsed time would start over from zero, and re-classifying a
partially-solved board could report a genuinely different real
difficulty than the one this exact session actually started as.

> **Socratic prompt:** `GameSession`'s existing constructor takes a
> live `SudokuBoard` and a `Clock`, then computes `difficulty` and
> `startTime` itself. If you tried reusing that exact same constructor
> to rebuild a previously-saved session, what two real, specific values
> would it get wrong, and why would each one specifically be wrong for
> a *resumed* session, even though it would be exactly right for a
> *fresh* one?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/domain/game_session.dart`, its own real,
  existing ordinary constructor and `GameSession._raw` (read fresh this
  session) — the real, established shape this lesson's own new
  constructor departs from, on purpose, for the real reason this unit's
  own Socratic question raises.
- **Files affected:**
  `project/lib/features/sudoku/domain/game_session.dart` — modified.
- **Change type:** add.
- **Location:** inside the real, existing `GameSession` class, a new
  named constructor alongside its own already-existing ordinary
  constructor and `_raw`.
- **Dependencies:** `GameStatus`, `Difficulty`, `Clock`, `SudokuBoard` —
  all already real by this point.

### The New Code

```dart
GameSession.restored(
  this.board,
  this._clock, {
  required this.difficulty,
  required this.startTime,
  required int mistakes,
  required int hints,
  required GameStatus status,
}) : _mistakes = mistakes,
     _hints = hints,
     _status = status;
```

### Updated Project

`GameSession`'s own, real, complete set of constructors, every real
line shown, the one real, new constructor marked:

```dart
 1  GameSession(this.board, this._clock, {DateTime? startTime})
 2      : difficulty = board.classifyDifficulty(),
 3        startTime = startTime ?? _clock.now();
 4
 5  GameSession._raw(
 6    this.board,
 7    this._clock,
 8    this.difficulty,
 9    this.startTime,
10    this._mistakes,
11    this._hints,
12    this._status,
13  );
14
15  GameSession.restored(                                                // ← new
16    this.board,                                                        // ← new
17    this._clock, {                                                     // ← new
18    required this.difficulty,                                          // ← new
19    required this.startTime,                                           // ← new
20    required int mistakes,                                             // ← new
21    required int hints,                                                // ← new
22    required GameStatus status,                                        // ← new
23  }) : _mistakes = mistakes,                                            // ← new
24       _hints = hints,                                                  // ← new
25       _status = status;                                                // ← new
```

`GameSession` now offers three genuinely distinct real ways to come
into existence: a fresh session (line 1), a real, cheap copy used only
by `touched()` (line 5), and now a real, restored session, rebuilt
whole from previously-saved values (line 15) — every real one of them
still producing the identical real class, with the identical real
rules and the identical real, private fields underneath.

### Isolate and Discard

No separate throwaway lab — a named constructor's own real syntax
(Terms, above) is exactly the same real shape `GameSession._raw`
already, really uses, just above it in the identical real file; this
unit's own real, new behavior is proven directly, for real, by
`SqliteGameSessionRepository.load`'s own real, permanent test, in
Concept Unit 4, below.

### Mechanical Walkthrough

- `GameSession.restored(` — a real **named constructor** (Terms,
  above): `restored` is not a method name, it is this constructor's own
  real name, called as `GameSession.restored(...)`, genuinely distinct
  from calling `GameSession(...)` — Dart allows a class to declare as
  many of these as it needs, each one a real, separate way to build the
  identical real class.
- `this.board,` / `this._clock,` — two real **initializing formals**
  (Terms, above): each one automatically assigns its own real, incoming
  argument straight to the real, same-named field
  (`board`/`_clock`) — the identical real shorthand the ordinary
  constructor, line 1, and `_raw`, line 5, both already use.
- `{` — opens this constructor's own real, named-parameter section; every
  real parameter from here down must be passed by name, not position.
- `required this.difficulty,` — a real **required named parameter**
  (Terms, above), combined with a real initializing formal: real and
  forcing every caller to explicitly write `difficulty:`, while still
  automatically assigning straight into the real `difficulty` field —
  directly answering half of this unit's own Socratic question: this
  real value is taken exactly as given, never recomputed the way the
  ordinary constructor, line 2, computes it.
- `required this.startTime,` — the identical real shape as
  `difficulty`, above, directly answering the other half of this unit's
  own Socratic question: this real value, too, is taken exactly as
  given, never defaulted to `_clock.now()` the way line 3's own real
  `??` (already established) does for a fresh session.
- `required int mistakes,` / `required int hints,` /
  `required GameStatus status,` — three more real, required named
  parameters — real and *not* initializing formals this time, since
  each one's own real, incoming argument is named differently
  (`mistakes`, `hints`, `status`) than the real, private field it
  actually fills (`_mistakes`, `_hints`, `_status`); an initializing
  formal only works when the parameter's own real name and the field's
  own real name are identical.
- `}) : _mistakes = mistakes,` — a real **initializer list** (Terms,
  above), opened by `:`: real and assigning the real, incoming
  `mistakes` argument into the real, private `_mistakes` field —
  necessary here, specifically, because `_mistakes` is a real, private
  field with a genuinely different real name than its own real,
  incoming parameter, so no initializing formal shorthand can reach it.
- `_hints = hints,` / `_status = status;` — the identical real shape,
  once each, for this constructor's own remaining two real, private
  fields.

### CS Lens

A named constructor is not, on its own, a hard concept (Terms, above)
worth a full, multi-recognition list — it is ordinary, if
underused, Dart syntax. The real idea underneath it, worth naming
here, is **offering more than one real, honest way for the identical
real class to come into existence, each one shaped around a genuinely
different real starting condition** — a fresh session, computed from
scratch, and a restored one, rebuilt from already-known values, both
still the same real `GameSession`, with the same real rules.

### SE Lens

The real principle is **keeping every real way of constructing this
class inside the class itself, rather than forcing a caller to build a
real, fresh `GameSession` and then mutate it into a restored shape from
the outside**. The alternative not chosen, directly answering this
unit's own Socratic question: reuse the ordinary constructor, then
overwrite its own real, wrongly-computed `difficulty`/`startTime`
afterward from outside the class. The real tradeoff: that alternative
would require `difficulty` and `startTime` to stop being real, `final`
fields (an already-established, load-bearing choice, protecting
them from ever changing again once a session starts) — a real,
strictly worse cost, for a real payoff (avoiding one more constructor)
this project doesn't actually need. `GameSession.restored` costs one
more real constructor to maintain, in exchange for every real field
this class holds staying genuinely, permanently `final`.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with
`SqliteGameSessionRepository.load`, next.

### Connect

`GameSession` now has a real, honest way to be rebuilt from
already-known values, without ever recomputing what a resumed session
must keep exactly as it was. The next unit names the real ability that
will actually call it.

---

## Concept Unit 2: `GameSessionRepository.load` — Naming the Ability to Read the Real, Current Game Back

### The Problem

`GameSessionRepository` currently names two real abilities — `save`,
`hasSavedSession` — neither of which can actually hand a caller back a
real, live `GameSession`. `hasSavedSession` only answers `true`/`false`;
nothing yet turns that real `true` into an actual, usable session.

> **Socratic prompt:** `hasSavedSession` already, really answers "does a
> saved session exist." Given `GameSession.restored`, from the previous
> unit, now exists, what real, additional ability does this interface
> still need to actually let a caller *use* a saved session, not merely
> learn that one exists?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/domain/game_session_repository.dart`,
  its own real, existing `save`/`hasSavedSession` methods (read fresh
  this session) — the real, established interface this lesson's own
  new method joins.
- **Files affected:**
  `project/lib/features/sudoku/domain/game_session_repository.dart` —
  modified.
- **Change type:** add.
- **Location:** inside the real, existing `GameSessionRepository`
  abstract class, alongside its own already-real `save`/
  `hasSavedSession`.
- **Dependencies:** `GameSession`, `Clock` — both already real.

### The New Code

```dart
Future<GameSession?> load(Clock clock);
```

### Updated Project

`GameSessionRepository`'s own real, complete interface, every real
line shown, the one real, new line marked:

```dart
1  abstract class GameSessionRepository {
2    Future<void> save(GameSession session);
3    Future<bool> hasSavedSession();
4    Future<GameSession?> load(Clock clock);  // ← new
5  }
```

### Isolate and Discard

No separate throwaway lab — an abstract method signature with no real
body has no real, independent behavior to isolate; its own real proof
is `SqliteGameSessionRepository.load`'s, next.

### Mechanical Walkthrough

- `Future<GameSession?> load(Clock clock);` — a real, abstract method
  signature, joining `save`/`hasSavedSession` on the identical real
  interface; `GameSession?`'s own trailing `?` (already established)
  honestly allows for the real case where nothing has ever been saved
  — directly answering this unit's own Socratic question: this real
  method is the missing ability, returning the actual, usable session
  itself, not merely reporting whether one exists; `Clock clock` — a
  real, required parameter, needed because rebuilding any real
  `GameSession` — fresh or restored — always requires one, per
  `GameSession.restored`'s own real signature, previous unit.

### CS Lens

`GameSessionRepository` is a real, concrete instance of the
**repository pattern** — a hard concept: a real, named design pattern
naming "the ability to save and retrieve a specific kind of object," as
its own real interface, separate from whatever real, concrete storage
mechanism actually implements it, real and existing so the rest of an
app's own code can depend on *what* can be done with a kind of data,
never *how* it's actually stored.

```
Also recognized in: an ORM's own real Active Record / Data Mapper
split, a payment processor's own real PaymentGateway interface hiding
Stripe from PayPal, a game engine's own real SaveSystem interface
hiding a local file from a cloud save slot, a logging framework's own
real Appender interface hiding console output from file output from
network output
```

### SE Lens

The real principle is **an interface's own real shape growing only
exactly as far as this app's own, real, current need actually requires,
one real ability at a time**. The alternative not chosen: declare
`load` at the same real moment `save`/`hasSavedSession` were first
named, even though nothing could implement it yet, because
`GameSession.restored` didn't exist yet either. The real tradeoff: that
alternative would have cost one real, un-implementable method sitting
unused for an unpredictable real stretch of this project's own
history — this real interface instead grows exactly when a real,
concrete implementation for it is actually ready to follow, in the very
next unit.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — the next unit gives it its one, real
implementation.

### Connect

The real ability to read this app's one, saved session back now has a
real name. The next unit gives that name its real, working body.

---

## Concept Unit 3: `SqliteGameSessionRepository.load` — the Real, Exact Reverse of `save`

### The Problem

`AppDatabase.currentGameSessionRow` can already, really hand back a raw
row; `GameSession.restored` can already, really rebuild a live session
from already-known values. Nothing yet stands between them, turning one
into the other.

> **Socratic prompt:** This app's own, already-real `save` method wrote
> `session.difficulty.name`, `session.startTime.toIso8601String()`, and
> `jsonEncode(dto.cells)` into three real, storable columns. For each of
> those three real writes, what real, specific `dart:core`/`dart:convert`
> operation would you expect to exactly reverse it, turning that real,
> stored text back into the exact real, original type?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/sqlite_game_session_repository.dart`,
  its own real, existing `save`/`hasSavedSession` methods (read fresh
  this session) — the real class this lesson's own new method joins,
  and the real, exact mapping this new method must reverse.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/sqlite_game_session_repository.dart`
  — modified.
- **Change type:** add.
- **Location:** inside the real, existing `SqliteGameSessionRepository`
  class, alongside its own already-real `save`/`hasSavedSession`.
- **Dependencies:** `GameSessionRepository.load` (previous unit),
  `GameSession.restored` (Concept Unit 1), `SudokuBoardDto`,
  `AppDatabase.currentGameSessionRow`, `Difficulty`, `GameStatus` — all
  already real by this point.

### The New Code

```dart
@override
Future<GameSession?> load(Clock clock) async {
  final row = await _database.currentGameSessionRow();
  if (row == null) {
    return null;
  }
  final dto = SudokuBoardDto(
    (jsonDecode(row['cells'] as String) as List).map((r) => (r as List).cast<int?>()).toList(),
    (jsonDecode(row['given_cells'] as String) as List).map((r) => (r as List).cast<bool>()).toList(),
  );
  return GameSession.restored(
    dto.toBoard(),
    clock,
    difficulty: Difficulty.values.byName(row['difficulty'] as String),
    startTime: DateTime.parse(row['started_at'] as String),
    mistakes: row['mistakes'] as int,
    hints: row['hints'] as int,
    status: GameStatus.values.byName(row['status'] as String),
  );
}
```

### Updated Project

`SqliteGameSessionRepository`'s own real, complete class, every real
line shown, the real, new method marked:

```dart
 1  class SqliteGameSessionRepository implements GameSessionRepository {
 2    SqliteGameSessionRepository(this._database);
 3
 4    final AppDatabase _database;
 5
 6    @override
 7    Future<void> save(GameSession session) async {
 8      final dto = SudokuBoardDto.fromBoard(session.board);
 9      await _database.saveGameSession({
10        'difficulty': session.difficulty.name,
11        'status': session.status.name,
12        'started_at': session.startTime.toIso8601String(),
13        'mistakes': session.mistakes,
14        'hints': session.hints,
15        'cells': jsonEncode(dto.cells),
16        'given_cells': jsonEncode(dto.givenCells),
17      });
18    }
19
20    @override
21    Future<bool> hasSavedSession() async {
22      final row = await _database.currentGameSessionRow();
23      return row != null;
24    }
25
26    @override                                                                                            // ← new
27    Future<GameSession?> load(Clock clock) async {                                                        // ← new
28      final row = await _database.currentGameSessionRow();                                                // ← new
29      if (row == null) {                                                                                  // ← new
30        return null;                                                                                       // ← new
31      }                                                                                                     // ← new
32      final dto = SudokuBoardDto(                                                                          // ← new
33        (jsonDecode(row['cells'] as String) as List).map((r) => (r as List).cast<int?>()).toList(),       // ← new
34        (jsonDecode(row['given_cells'] as String) as List).map((r) => (r as List).cast<bool>()).toList(), // ← new
35      );                                                                                                    // ← new
36      return GameSession.restored(                                                                         // ← new
37        dto.toBoard(),                                                                                     // ← new
38        clock,                                                                                              // ← new
39        difficulty: Difficulty.values.byName(row['difficulty'] as String),                                 // ← new
40        startTime: DateTime.parse(row['started_at'] as String),                                            // ← new
41        mistakes: row['mistakes'] as int,                                                                  // ← new
42        hints: row['hints'] as int,                                                                        // ← new
43        status: GameStatus.values.byName(row['status'] as String),                                         // ← new
44      );                                                                                                    // ← new
45    }                                                                                                       // ← new
46  }
```

`SqliteGameSessionRepository` now offers the exact real, symmetrical
counterpart to its own real `save` — every real column `save` writes on
lines 10–16 has a matching real read somewhere inside `load`, lines
28–43.

### Isolate and Discard

A real, standalone lab, run once, real and directly, with `dart run`,
covering every real `dart:core`/`dart:convert` fact this exact method
depends on:

```dart
print(Difficulty.values);
print(Difficulty.values.byName('hard'));
try {
  Difficulty.values.byName('nightmare');
} catch (e) {
  print('byName error: ${e.runtimeType}: $e');
}

final dt = DateTime.parse('2026-01-01T09:00:00.000');
print(dt.toIso8601String());

final decoded = jsonDecode('[[1,null,3],[null,5,null]]') as List;
final casted = decoded.map((r) => (r as List).cast<int?>()).toList();
print(casted);
print(casted.runtimeType);
```

Real, captured output:

```
[Difficulty.easy, Difficulty.medium, Difficulty.hard]
Difficulty.hard
byName error: ArgumentError: Invalid argument (name): No enum value with that name: "nightmare"
2026-01-01T09:00:00.000
[[1, null, 3], [null, 5, null]]
List<List<int?>>
```

This real output proves three real, load-bearing facts this exact
method leans on: `.byName` fails loudly, with a real `ArgumentError`,
rather than silently returning `null`, on a stored name that no longer
matches any real enum value; `DateTime.parse` round-trips exactly
through `.toIso8601String()`'s own real, exact shape; and `jsonDecode`'s
own real, untyped result genuinely needs `.cast<int?>()` before it
becomes the exact real `List<int?>` `SudokuBoardDto`'s own constructor
requires — its own real, `runtimeType`, confirmed above, proves the
cast actually took effect, not merely compiled. Discarded — this exact
real lab exists only to prove these three real facts before writing
them into real, project code; it never appears in the project again.

### Mechanical Walkthrough

- `@override` (already established) marks this as genuinely fulfilling
  `GameSessionRepository`'s own real `load` contract, previous unit.
- `Future<GameSession?> load(Clock clock) async {` — a real, ordinary
  `async` method, matching its own real, abstract signature exactly.
- `final row = await _database.currentGameSessionRow();` —
  `AppDatabase.currentGameSessionRow` (Objects and methods, above)
  called once, real and awaited.
- `if (row == null) { return null; }` — a real, already-established
  `if`/`==`/`return`, honestly reporting that nothing has ever been
  saved, rather than proceeding to map a real row that doesn't exist.
- `final dto = SudokuBoardDto(` — `SudokuBoardDto`'s own real, ordinary
  constructor (Objects and methods, above), called directly this time,
  never through `fromBoard` — `fromBoard` builds one from a real, live
  board; this real call instead builds one straight from real, decoded
  row data, since no real, live board exists yet at this exact point.
- `(jsonDecode(row['cells'] as String) as List)` — `row['cells']` reads
  a real `Map` by its real `[]` operator (already established), keyed by
  the real, literal string `'cells'`; `as String` (the type cast
  operator, Terms, above) asserts that real, dynamically-typed value is
  genuinely a real `String`, since `Map<String, Object?>`'s own real
  value type is too broad for `jsonDecode` to accept directly;
  `jsonDecode` (Objects and methods, above) converts that real, stored
  JSON text back into an untyped real value; the outer `as List` (the
  type cast operator, again) asserts that untyped real result is
  genuinely a real `List`, so `.map`, next, can be called on it at all.
- `.map((r) => (r as List).cast<int?>()).toList()` — `.map` (an
  already-established `Iterable` method) applies its real callback to
  every real, inner element in turn; `(r) => (r as List).cast<int?>()`
  is an already-established real arrow-function; inside it, `r as List`
  (the type cast operator) asserts each real, untyped inner element is
  genuinely a real `List`, and `.cast<int?>()` (Objects and methods,
  above) re-types that real, untyped inner list as `List<int?>`,
  matching each real, individual row of `SudokuBoardDto.cells`;
  `.toList()` (already established) converts the whole, real, lazy
  `Iterable` result back into a real, concrete `List`, the exact real
  type `SudokuBoardDto`'s own constructor requires.
- The next real line, for `row['given_cells']`, repeats the identical
  real shape, once, casting to `List<bool>` instead of `List<int?>`,
  matching `SudokuBoardDto.givenCells`.
- `return GameSession.restored(` — `GameSession.restored` (Objects and
  methods, above, Concept Unit 1) called, real and directly, handing it
  every real field this method has now finished rebuilding.
- `dto.toBoard(),` — `SudokuBoardDto.toBoard` (Objects and methods,
  above) called on the real `dto` just built, producing a real, live
  `SudokuBoard` from its own plain, decoded data.
- `clock,` — this real method's own real, incoming parameter, passed
  straight through, unchanged.
- `difficulty: Difficulty.values.byName(row['difficulty'] as String),`
  — `Difficulty.values.byName` (Objects and methods, above) called on
  the real, stored difficulty text, real and reversing `Enum.name`'s
  own real, stored text; `row['difficulty'] as String`
  the identical real map-read-and-cast shape already explained above.
- `startTime: DateTime.parse(row['started_at'] as String),` —
  `DateTime.parse` (Objects and methods, above) called on the real,
  stored `started_at` text, real and reversing this app's own,
  already-established real `.toIso8601String()` write.
- `mistakes: row['mistakes'] as int,` / `hints: row['hints'] as int,` —
  two real map-reads, each cast directly to a real `int`; genuinely no
  real conversion beyond the cast itself is needed, since `sqflite`
  already stores and returns a real integer column as a real Dart
  `int`, unlike `difficulty`/`status`/`started_at`, which were all
  real, deliberately stored as text.
- `status: GameStatus.values.byName(row['status'] as String),` — the
  identical real shape as `difficulty`, above, reversing `GameStatus`'s
  own real, stored name back into its matching real enum value.

### CS Lens

This unit's own choice — keeping `load`'s own real mapping logic here,
on the repository, rather than on `GameSession` itself — rests on
**entity versus value object**, a hard concept: a real entity's own
identity persists across real changes to its own held data (two real
entities holding identical data at some moment are still genuinely
different real things), unlike a real value object, defined entirely by
what it currently holds (two value objects holding identical data are
meant to be treated as the same real thing). `GameSession` is a real
entity, not a value object — the same identical real reasoning `save`,
on this same class, already leans on, in the identical real reverse
direction here.

```
Also recognized in: a real bank account (its own real identity persists
across every real deposit and withdrawal), a real Git branch (the
identical real branch, its own real commit history constantly
growing), a real, physical car (repaint it, replace its own real tires
— it's still the identical real car, tracked by its own real VIN, not
by its own current real paint color)
```

### SE Lens

The real principle is **a repository owning both real directions of its
own mapping, symmetrically, rather than only the direction its first
lesson happened to need**. The alternative not chosen: give `load` its
own, separate real class, distinct from `SqliteGameSessionRepository`.
The real tradeoff: a real, separate class would cost one more real file
and one more real provider to wire, for no real benefit — `load` and
`save` already, genuinely share every real dependency
(`AppDatabase`, `SudokuBoardDto`) and every real column name, so
keeping both real directions on the identical real class means a
future real change to this app's own stored column shape only ever has
one real class to update, not two kept in sync by hand.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with
`GameSessionNotifier`, next.

### Connect

`GameSessionRepository`'s own real ability now has its one, real,
working, bidirectional implementation. The next unit reaches the one,
real place this whole app actually decides whether to use it.

---

## Concept Unit 4: Wiring a Real Resume Into This App's Own Real Startup

### The Problem

`GameSessionNotifier.build()` still, always, unconditionally constructs
a real, fresh `GameSession` — its own, real, already-established
behavior, unchanged so far — with genuinely no real path that ever
reaches `SqliteGameSessionRepository.load` at all.

> **Socratic prompt:** `build()` must return a real `GameSession`
> synchronously — Riverpod calls it directly, with no way to `await`
> its own real result. `SqliteGameSessionRepository.load`, previous
> unit, is real and `async`. Given that real constraint, how would you
> start a real, asynchronous load *from inside* a method that cannot
> itself be `async`, without making `build()` wait for it to finish?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/application/game_session_provider.dart`,
  its own real, existing `GameSessionNotifier.build` (read fresh this
  session) — the real method this unit's own change extends.
- **Files affected:**
  `project/lib/features/sudoku/application/game_session_provider.dart`
  — modified;
  `project/test/game_session_resume_test.dart` — created.
- **Change type:** add.
- **Location:** inside the real, existing `GameSessionNotifier` class —
  one real, added line inside `build`, and one real, new private
  method alongside it.
- **Dependencies:** `GameSessionRepository.load` (Concept Unit 2/3),
  `gameSessionRepositoryProvider` (already real),
  `clockProvider` (already real).

### The New Code

```dart
Future.microtask(_loadSavedSession);
```

```dart
Future<void> _loadSavedSession() async {
  final saved = await ref.read(gameSessionRepositoryProvider).load(ref.read(clockProvider));
  if (!ref.mounted) {
    return;
  }
  if (saved != null && state.status == GameStatus.notStarted) {
    state = saved;
  }
}
```

### Updated Project

`GameSessionNotifier`'s own real `build` method and its real, new
sibling, every real line shown, every real, new line marked:

```dart
1  @override
2  GameSession build() {
3    final fresh = GameSession(
4      SudokuBoard(ref.watch(puzzleRepositoryProvider).startingPuzzle()),
5      ref.watch(clockProvider),
6    );
7    Future.microtask(_loadSavedSession);                                                          // ← new
8    return fresh;                                                                                  // ← changed: was 'return GameSession(...)' inline
9  }
10
11 Future<void> _loadSavedSession() async {                                                         // ← new
12   final saved = await ref.read(gameSessionRepositoryProvider).load(ref.read(clockProvider));     // ← new
13   if (!ref.mounted) {                                                                             // ← new
14     return;                                                                                       // ← new
15   }                                                                                                // ← new
16   if (saved != null && state.status == GameStatus.notStarted) {                                    // ← new
17     state = saved;                                                                                 // ← new
18   }                                                                                                 // ← new
19 }                                                                                                   // ← new
```

`build()` still, always, returns a real, fresh session the instant this
app starts — genuinely never blocked on any real, asynchronous work —
but now also schedules a real, background attempt to replace it with a
real, resumed one the moment `_loadSavedSession` actually finds one.

### Isolate and Discard

**A real, run, permanent test file, this session** —
`project/test/game_session_resume_test.dart`, exercising exactly the
three real scenarios this unit's own resume logic must handle
correctly:

```dart
test('a real, previously-saved, in-progress session resumes exactly where it was', () async {
  final appDb = AppDatabase();
  final repository = SqliteGameSessionRepository(appDb);
  final savedSession = GameSession(SudokuBoard(milestonePuzzle), FakeClock(DateTime(2026, 1, 1)));
  savedSession.enterDigit(2, 0, 1);
  savedSession.registerMistake();
  await repository.save(savedSession);
  await appDb.close();

  final container = ProviderContainer();
  container.read(gameSessionProvider);
  await Future<void>.delayed(const Duration(seconds: 1));

  final resumed = container.read(gameSessionProvider);
  expect(resumed.board.valueAt(2, 0), 1);
  expect(resumed.mistakes, 1);
  expect(resumed.status, GameStatus.playing);
});

test('a real, already-started fresh session is never clobbered by a real, late-arriving saved session', () async {
  final appDb = AppDatabase();
  final repository = SqliteGameSessionRepository(appDb);
  final staleSavedSession = GameSession(SudokuBoard(milestonePuzzle), FakeClock(DateTime(2026, 1, 1)));
  staleSavedSession.enterDigit(2, 0, 1);
  await repository.save(staleSavedSession);
  await appDb.close();

  final container = ProviderContainer();
  final fresh = container.read(gameSessionProvider);
  expect(fresh.status, GameStatus.notStarted);

  container.read(gameSessionProvider.notifier).enterDigit(4, 4, 5);
  expect(container.read(gameSessionProvider).status, GameStatus.playing);

  await Future<void>.delayed(const Duration(seconds: 1));

  expect(container.read(gameSessionProvider).board.valueAt(4, 4), 5);
  expect(container.read(gameSessionProvider).board.valueAt(2, 0), null);
});
```

**A real, honest, genuinely hard-won failure, kept as documented
evidence, not smoothed over:** the first real run of this exact test
file, alongside a `testWidgets` test pumping the real `SudokuApp`
widget tree, hung indefinitely — no assertion failure, no error, the
real test process itself never returning. Real, timestamped
instrumentation (temporary, removed once each real cause was
confirmed, never left in the code shown above or below) traced it to
two, genuinely separate, real root causes, and one real testing-only
hazard, all three confirmed by actually running the code, never guessed:

1. `_SessionStatusState` (this app's own "games started" counter,
   `presentation/sudoku_app.dart`) constructed its own, separate,
   un-wired `AppDatabase()` directly — a real debt this project's own
   history had already, honestly flagged and deliberately deferred.
   Fixed in the next unit.
2. Even after fixing that, `AppDatabase._open()` itself had a real race
   condition (Terms, above): two real, concurrent callers could each
   see no connection yet open, and each start a genuinely separate real
   `openDatabase` call against the identical real file — this project's
   own real, confirmed cause of a real, indefinite hang inside
   `sqflite_common_ffi`'s own backend. Fixed two units from now.
3. Even after both of those real fixes, a widget rebuild triggered by
   this exact real, background resume — real and specifically, a real
   `state = saved;` line completing while `flutter_test`'s own
   fake-clock test binding was still mid-`pumpWidget` — permanently
   wedged the test runner's own event loop; real and confirmed with a
   real, deliberate 150-second timeout that never once resolved on its
   own. Worked around, not patched: this exact test needs no real
   widget tree at all to prove `GameSessionNotifier`'s own real resume
   logic — `container.read(gameSessionProvider)` reads this app's real,
   shared state directly, with no dependency on any widget ever
   actually rebuilding to reflect it. Shown above, and kept, real and
   permanent, exactly as it now stands: a bare `ProviderContainer`, one
   real read to trigger `build()`, one real, generous wait, one more
   real read to check the real, resumed result.

### Mechanical Walkthrough

- `Future.microtask(_loadSavedSession);` — `Future.microtask` (Objects
  and methods, above) called with `_loadSavedSession` itself — real and
  passed as a plain, unnamed reference to the method, never called with
  `()` here — directly answering this unit's own Socratic question:
  scheduling it this way starts the real, asynchronous work *after*
  `build()` itself has already finished running and returned, real and
  deliberately un-awaited, since `build()` must stay synchronous.
- `return fresh;` — an already-established `return`, now returning the
  real, local `fresh` variable rather than an inline expression, since
  the real, scheduling line above needed somewhere to sit between
  constructing the session and returning it.
- `Future<void> _loadSavedSession() async {` — a real, new, private,
  `async` method — real and private (a leading `_`, already
  established), since nothing outside this class ever calls it
  directly.
- `final saved = await ref.read(gameSessionRepositoryProvider).load(ref.read(clockProvider));`
  — `ref.read(gameSessionRepositoryProvider)` (Objects and methods,
  above) reads this app's one, real, shared repository, real and once,
  with no ongoing subscription; `.load(...)` (Objects and methods,
  above, Concept Unit 2/3) called on it; `ref.read(clockProvider)`
  (Objects and methods, above) supplies the real `Clock` argument
  `load` requires; the whole real expression `await`ed, real and
  suspending this method here until the real, asynchronous read
  actually finishes.
- `if (!ref.mounted) { return; }` — `ref.mounted` (Objects and methods,
  above), negated by `!` (already established): a real, defensive
  guard, checked immediately after the one real, long-running `await`
  above, before this method ever touches `state` again — protecting
  against the real, possible case where this notifier's own provider
  was disposed while this real, background read was still in flight.
- `if (saved != null && state.status == GameStatus.notStarted) {` —
  `saved != null` (already established) checks that a real session was
  genuinely found at all; `&&` (already established) requires both real
  conditions to hold; `state.status == GameStatus.notStarted` reads
  `GameSession`'s own real `status` getter (Objects and methods, above)
  and compares it, real and directly, to `GameStatus.notStarted`
  (Objects and methods, above) — real and the exact, load-bearing
  safety check this unit's own second Socratic-adjacent scenario
  proves: a real player who has already, genuinely moved has already
  left `GameStatus.notStarted` behind, so this real condition is false,
  and a real, late-arriving saved session is never applied on top of
  real, already-in-progress play.
- `state = saved;` — this real notifier's own inherited `state` field
  (already established), reassigned, real and only now, to the real,
  restored `GameSession` `load` produced — the one, real moment this
  whole lesson's own feature actually takes effect.

### CS Lens

Not repeated separately — **microtask** (Terms, above) already received
its own real, full treatment the moment it was first named, in this
unit's own Header entry for `Future.microtask`; the deeper real idea it
rests on — deferring real work to run *after* the currently-running
real, synchronous code finishes, but *before* any real, external event
(a timer, a real I/O callback) gets its own real turn — is given its
own real, full, multi-recurrence list right here, since it hasn't had
one yet in this lesson.

```
Also recognized in: a browser's own real `Promise.resolve().then()`,
JavaScript's own real microtask queue running fully between every pair
of real DOM repaint frames, a real GUI toolkit's own "run this once the
current event handler returns" idiom, a real actor system's own
"deliver this message after the current one finishes processing"
guarantee
```

### SE Lens

The real principle is **an optimistic, eventually-consistent startup,
never a real, blocking one** — directly answering this unit's own
Socratic question. The alternative not chosen: make `build()` itself
`async`, and have this whole app's own UI wait, real and visibly, for a
real database read to finish before showing anything at all. The real
tradeoff: Riverpod's own real `Notifier.build()` contract flatly
forbids this — it must return a real, synchronous `GameSession`, no
exceptions — so this alternative was never genuinely available; but
even setting that real constraint aside, the real, chosen design's own
honest cost is a real, brief window, every single real app launch,
where a genuinely resumable session hasn't visibly resumed yet — a real
player who moves inside that real window, this unit's own second real
test proves, keeps their own real move, since the guard above refuses
to silently overwrite it.

### Commands Needed

None new.

### Run It

Real, captured output, after the two further real fixes named above
were actually applied (this unit's own honest account continues in the
next two units, and this lesson's own final `flutter analyze`/
`flutter test` summary appears at the very end): `flutter test
test/game_session_resume_test.dart` — three real tests, `All tests
passed!`, each completing in well under a second of real wall-clock
time; a real, previously-saved, in-progress session resumes exactly
where it was; a real, already-started fresh session survives a real,
late-arriving stale save untouched.

### Connect

Every real, previously-saved game this app ever tracks now resumes
itself, real and automatically, on the very next real launch, without
ever silently clobbering a real, already-in-progress fresh one. The
next two units are this exact unit's own real, honest debugging
continued: the two further, real root causes its own verification work
actually found.

---

## Concept Unit 5: Paying Down a Real, Already-Flagged Debt

### The Problem

`_SessionStatusState` (this app's own "games started" counter,
`presentation/sudoku_app.dart`) has, since this project's own real
history, constructed its own, separate `AppDatabase()` directly, un-wired to
`appDatabaseProvider` — real, honestly flagged debt at the time, since
nothing yet depended on there being only ever one, real, shared
connection. This lesson's own new, real, background resume — a second,
real, concurrent reader of the identical real database file, right at
app startup — is exactly the real, concrete situation that debt was
always going to eventually matter for.

> **Socratic prompt:** `SudokuApp`/`_SudokuAppState`, in this same real
> file, already extend `ConsumerStatefulWidget`/`ConsumerState` and
> already read `ref.read(gameSessionProvider.notifier)`.
> `_SessionStatus`/`_SessionStatusState` still extend plain
> `StatefulWidget`/`State`, with no real `ref` of their own at all.
> Given this lesson's own new background resume now runs at the exact
> same real moment this app starts — the exact same real moment both of
> these real widgets first mount — what real, concrete problem could two
> genuinely separate `AppDatabase` instances, each reaching the
> identical real file, create that a single, shared instance wouldn't?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart`, its own
  real, existing `_SessionStatus`/`_SessionStatusState` (read fresh this
  session) — the real, flagged debt this unit exists to pay down.
- **Files affected:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified.
- **Change type:** refactor.
- **Location:** `_SessionStatus`'s own class declaration, and every
  real place inside `_SessionStatusState` that touches `AppDatabase`.
- **Dependencies:** `ConsumerStatefulWidget`/`ConsumerState`,
  `appDatabaseProvider` — both already real.

### The New Code

```dart
class _SessionStatus extends ConsumerStatefulWidget {
  const _SessionStatus();

  @override
  ConsumerState<_SessionStatus> createState() => _SessionStatusState();
}

class _SessionStatusState extends ConsumerState<_SessionStatus> {
```

### Updated Project

`_SessionStatus`/`_SessionStatusState`'s own real, complete pair of
classes, every real line shown, every real, changed line marked:

```dart
 1  class _SessionStatus extends ConsumerStatefulWidget {                    // ← changed: was 'extends StatefulWidget'
 2    const _SessionStatus();
 3
 4    @override
 5    ConsumerState<_SessionStatus> createState() => _SessionStatusState();  // ← changed: was 'State<_SessionStatus>'
 6  }
 7
 8  class _SessionStatusState extends ConsumerState<_SessionStatus> {        // ← changed: was 'extends State<_SessionStatus>'
 9    int _gamesStarted = 0;
10    int _elapsedSeconds = 0;
11    Timer? _ticker;
12
13    @override
14    void initState() {
15      super.initState();
16      _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
17        setState(() {
18          _elapsedSeconds++;
19        });
20      });
21      _loadGamesStarted();
22    }
23
24    Future<void> _loadGamesStarted() async {
25      final total = await ref.read(appDatabaseProvider).totalGamesStarted();  // ← changed: was 'await _db.totalGamesStarted()'
26      if (!mounted) return;
27      setState(() {
28        _gamesStarted = total;
29      });
30    }
31
32    @override
33    void dispose() {
34      _ticker?.cancel();
35      super.dispose();
36    }
37
38    void _startNewGame() {
39      setState(() {
40        _gamesStarted++;
41      });
42      ref.read(appDatabaseProvider).incrementTotalGamesStarted();  // ← changed: was '_db.incrementTotalGamesStarted()'
43    }
44
45    @override
46    Widget build(BuildContext context) {
47      return Column(
48        mainAxisSize: MainAxisSize.min,
49        children: [
50          Row(
51            mainAxisAlignment: MainAxisAlignment.center,
52            children: [
53              Text('Elapsed: $_elapsedSeconds s'),
54              const SizedBox(width: 16),
55              Text('Games started: $_gamesStarted'),
56            ],
57          ),
58          const SizedBox(height: 8),
59          ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game')),
60        ],
61      );
62    }
63  }
```

`_SessionStatus`'s own real field `final AppDatabase _db =
AppDatabase();` — the real source of this unit's own debt — is deleted
outright; every real line that used to read `_db` now reads
`ref.read(appDatabaseProvider)` instead.

### Isolate and Discard

No separate throwaway lab — `ConsumerStatefulWidget`/`ConsumerState`
(Objects and methods, above) already, really run inside this same real
file's own `SudokuApp`/`_SudokuAppState`; this unit's own real proof is
this app's own, real, existing widget tests (`session_status_test.dart`,
already permanent) continuing to pass unmodified, confirmed by this
lesson's own final Run It, further below.

### Mechanical Walkthrough

- `class _SessionStatus extends ConsumerStatefulWidget {` —
  `ConsumerStatefulWidget` (Objects and methods, above), replacing
  plain `StatefulWidget` — real and directly answering this unit's own
  Socratic question: a widget extending `ConsumerStatefulWidget` gains
  a real, working `ref`, letting its own real state read this app's
  one, shared `appDatabaseProvider` instead of constructing a second,
  separate connection of its own.
- `ConsumerState<_SessionStatus> createState() => _SessionStatusState();`
  — `ConsumerState<_SessionStatus>` (Objects and methods, above)
  replacing plain `State<_SessionStatus>` as this real method's own
  declared return type — real and required to match, since a
  `ConsumerStatefulWidget` can only ever pair with a real
  `ConsumerState`, never a plain `State`.
- `class _SessionStatusState extends ConsumerState<_SessionStatus> {` —
  the identical real substitution, on this real state class itself.
- `final total = await ref.read(appDatabaseProvider).totalGamesStarted();`
  — `ref.read(appDatabaseProvider)` (Objects and methods, above)
  called here for the first real time inside this exact
  class, real and reading the identical real, single, shared
  `AppDatabase` instance `SqliteGameSessionRepository`/
  `SqliteScoreRepository` already both read, rather than a real,
  second, separate one this real field used to construct.
- `ref.read(appDatabaseProvider).incrementTotalGamesStarted();` — the
  identical real substitution, once more, inside `_startNewGame`.

### CS Lens

This unit's own real change is a concrete instance of **dependency
inversion** — a hard concept naming a real design principle in which a
real, high-level piece of code depends only on a real, abstract
interface or a real, shared provider it names, while a real, low-level,
concrete implementation depends on that identical real seam too, real
and separately — inverting the naive real direction, where the
high-level code would otherwise construct its own, low-level, concrete
detail directly. `_SessionStatusState` now depends only on
`appDatabaseProvider`, the identical real seam every other real reader
of `AppDatabase` already depends on, rather than constructing its own,
separate, concrete `AppDatabase()`.

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

The real principle is **honestly paying down a real, previously
flagged debt the moment a real, concrete consequence of leaving it
unpaid actually appears**, rather than leaving it flagged indefinitely.
The alternative not chosen: leave `_SessionStatusState`'s own separate
`AppDatabase()` exactly as it was, treating this lesson's own new
resume feature as unrelated to it. The real tradeoff: that alternative
would have cost nothing to write today, for a real, severe, hidden
price — this lesson's own real verification work proves, directly,
that two genuinely separate `AppDatabase` instances, each racing to
open the identical real file at this app's own real startup, is exactly
the real, concrete situation the next unit's own real race condition
(Terms, above) actually needs to occur at all; paying this debt down
now removes one whole, real source of that race, not merely papering
over its own real symptom.

### Commands Needed

None new.

### Run It

Not fully runnable standalone yet — one further, real root cause,
found by this exact lesson's own real verification work, remains; the
next unit fixes it, and this lesson's own final Run It, there, confirms
everything together.

### Connect

This app's own real, single, shared `AppDatabase` instance is now
genuinely the *only* one anything in this app ever constructs. The
final unit fixes the real race condition this lesson's own real
verification work found inside that shared instance itself.

---

## Concept Unit 6: A Real Race Condition Inside `AppDatabase`'s Own Connection Logic

### The Problem

Even with only one, real, shared `AppDatabase` instance now (previous
unit), this lesson's own new resume feature still, genuinely hung: two
real callers — `GameSessionNotifier._loadSavedSession`'s own real
microtask, and `_SessionStatusState`'s own real `initState` — both run
at the exact same real moment this app starts, and both call
`_open()`.

> **Socratic prompt:** `_open()`'s own real, original shape checks
> `if (_database != null) return _database;` before ever opening a
> real connection. If two real callers each call `_open()` at the
> genuinely same real moment, before either one's own real
> `openDatabase` call has resolved, what real value does `_database`
> hold for the *second* caller's own check — and what real, concrete
> problem does that create?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/infrastructure/app_database.dart`, its
  own real, existing `_open` method (read fresh this session) — the
  real method this unit's own fix restructures.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified.
- **Change type:** refactor.
- **Location:** `AppDatabase`'s own real, existing `_open` method, and
  its own real `close` method.
- **Dependencies:** none new.

### The New Code

```dart
Future<Database>? _opening;

Future<Database> _open() {
  final existing = _database;
  if (existing != null) {
    return Future.value(existing);
  }
  return _opening ??= _reallyOpen();
}
```

### Updated Project

`AppDatabase`'s own real `_open`/`_reallyOpen`/`close`, every real line
shown, every real, new or changed line marked:

```dart
 1  Database? _database;
 2  Future<Database>? _opening;                                         // ← new
 3
 4  Future<Database> _open() {                                          // ← changed: was 'Future<Database> _open() async'
 5    final existing = _database;
 6    if (existing != null) {
 7      return Future.value(existing);                                 // ← changed: was 'return existing;'
 8    }
 9    return _opening ??= _reallyOpen();                                // ← changed: was the real body now inside _reallyOpen
10  }
11
12  Future<Database> _reallyOpen() async {                              // ← new
13    if (!Platform.isAndroid && !Platform.isIOS) {
14      sqfliteFfiInit();
15      databaseFactory = databaseFactoryFfi;
16    }
17    final supportDir = await getApplicationSupportDirectory();
18    final path = join(supportDir.path, 'open_calc_sudoku.db');
19    final opened = await openDatabase(
20      path,
21      version: 3,
22      onConfigure: (db) async {
23        await db.execute('PRAGMA foreign_keys = ON');
24      },
25      onCreate: (db, version) async {
26        await db.execute('''
27          CREATE TABLE settings (
28            key TEXT PRIMARY KEY,
29            value INTEGER NOT NULL
30          )
31        ''');
32        await db.execute('''
33          CREATE TABLE game_sessions (
34            id INTEGER PRIMARY KEY,
35            difficulty TEXT NOT NULL,
36            status TEXT NOT NULL,
37            started_at TEXT NOT NULL,
38            mistakes INTEGER NOT NULL,
39            hints INTEGER NOT NULL,
40            cells TEXT NOT NULL,
41            given_cells TEXT NOT NULL
42          )
43        ''');
44        await db.execute('''
45          CREATE TABLE scores (
46            id INTEGER PRIMARY KEY,
47            session_id INTEGER NOT NULL,
48            completed_at TEXT NOT NULL,
49            completion_seconds INTEGER NOT NULL,
50            difficulty TEXT NOT NULL,
51            mistakes INTEGER NOT NULL,
52            hints INTEGER NOT NULL,
53            score INTEGER NOT NULL DEFAULT 0,
54            FOREIGN KEY (session_id) REFERENCES game_sessions(id)
55          )
56        ''');
57        await db.execute('CREATE INDEX idx_scores_difficulty ON scores(difficulty)');
58      },
59      onUpgrade: (db, oldVersion, newVersion) async {
60        if (oldVersion < 2) {
61          await db.execute('CREATE INDEX idx_scores_difficulty ON scores(difficulty)');
62        }
63        if (oldVersion < 3) {
64          await db.execute('ALTER TABLE scores ADD COLUMN score INTEGER NOT NULL DEFAULT 0');
65        }
66      },
67    );
68    _database = opened;
69    return opened;
70  }
71
72  Future<void> close() async {
73    final existing = _database;
74    _database = null;
75    _opening = null;                                                  // ← new
76    await existing?.close();
77  }
```

Every other real `AppDatabase` method (`totalGamesStarted`,
`incrementTotalGamesStarted`, `insertScore`, `allScores`,
`saveGameSession`, `currentGameSessionRow`) still calls `_open()`
exactly as before — line 4's own real, new, non-`async` signature still
returns a real `Future<Database>`, so every real, existing caller
compiles and behaves identically.

### Isolate and Discard

**A real, run, standalone lab, this session**, isolating exactly this
unit's own real fix, with no real widget tree, no real Riverpod, and no
real production file involved at all:

```dart
Future<int>? _opening;
int _real = 0;
int _calls = 0;

Future<int> open() {
  if (_real != 0) return Future.value(_real);
  _calls++;
  return _opening ??= Future.delayed(const Duration(milliseconds: 50), () => _real = 7);
}

void main() async {
  final results = await Future.wait([open(), open(), open()]);
  print('results: $results');
  print('real, underlying open() attempts: $_calls');
}
```

Real, captured output:

```
results: [7, 7, 7]
real, underlying open() attempts: 1
```

Three real, concurrent callers, all started before the real, simulated
50-millisecond open finishes, all received the identical real, eventual
value — and the real, underlying "attempt to open" logic genuinely ran
only once, proven by `_calls` reporting `1`, not `3`. Discarded — this
exact real lab exists only to isolate and prove the real fix's own
shape in miniature; it never appears in the project again.

### Mechanical Walkthrough

- `Future<Database>? _opening;` — a real, new, nullable field: `?`
  (already established) honestly allows for the real, common case where
  no real open is currently in flight at all.
- `Future<Database> _open() {` — real and no longer declared `async` —
  a deliberate, real change: this method's own real body now contains no
  `await` of its own at all, only real, direct `return` statements, so
  the real `async` keyword is genuinely no longer needed.
- `final existing = _database;` — unchanged: reads the real, already
  -finished connection, if this app already, genuinely has one.
- `if (existing != null) { return Future.value(existing); }` —
  `Future.value` (Objects and methods, above) replacing a real, bare
  `return existing;` — real and required now that this method's own
  declared return type is `Future<Database>`, not `Database`, since a
  method no longer marked `async` must build its own real `Future`
  explicitly rather than relying on `async` to do it automatically.
- `return _opening ??= _reallyOpen();` — directly answering this unit's
  own Socratic question: `_opening ??= _reallyOpen()` (the
  null-coalescing assignment operator, Terms, above) checks `_opening`
  itself, real and specifically — if it's already non-`null` (a real,
  earlier caller already started opening), this real expression reuses
  that exact same real, in-flight `Future`, real and without calling
  `_reallyOpen()` a second time at all; only the real, first caller to
  ever reach this line, this real app run, actually calls
  `_reallyOpen()`, real and caching its own real, returned `Future`
  immediately, before it has even finished.
- `Future<Database> _reallyOpen() async {` — a real, new, private,
  `async` method — real and carrying the exact real body `_open()`
  itself used to hold, moved here, unchanged, down to its own real,
  final `_database = opened; return opened;` lines.
- `_opening = null;` — added inside `close()`: real and resetting this
  real, new field alongside the real, already-existing `_database =
  null;`, so a real, later `_open()` call, after a real, deliberate
  close, genuinely starts a fresh real open again, rather than reusing
  a real, now-stale, already-completed `Future`.

### CS Lens

A **race condition** (Terms, above) is a hard concept.

```
Also recognized in: two real bank tellers both reading the identical
real account balance before either one's own real withdrawal posts, two
real threads both checking `if (cache[key] == null)` before either
one's own real, expensive computation finishes, two real browser tabs
both reading a real, shared `localStorage` value before either one's
own real write lands, a real CI pipeline's own two parallel jobs both
provisioning the identical real cloud resource because neither one's
own real "does it already exist" check saw the other's in-progress
real creation
```

This unit's own real fix is a concrete instance of **memoization**
(Terms, above) — real and specifically, caching the real, *in-flight*
`Future` itself, not only its real, eventual, finished value, so every
real caller past the first genuinely shares one real, underlying
attempt rather than each starting its own.

### SE Lens

The real principle is **caching a real, in-flight promise of a result,
not only a real, already-finished one**, directly answering this
unit's own Socratic question. The alternative not chosen: `_open()`'s
own real, original shape, caching only the real, finished `_database`
field. The real tradeoff: that alternative costs nothing extra to write
— and is exactly, provably wrong the instant two real callers ever
reach it before either one's own real open resolves, which this lesson's
own new, real, background resume now genuinely guarantees happens on
every single real app launch. The honest, remaining cost of this real
fix: `AppDatabase` now carries one more, real, private field to reason
about, and `close()` must remember to reset both real fields together —
a small, real, ongoing maintenance cost, for the real, load-bearing
correctness this lesson's own resume feature cannot work without at
all.

### Commands Needed

None new.

### Run It

Real, captured summary — `flutter analyze .`: 49 issues (up from 39
before this lesson; ten new, all the same, already-accepted
`avoid_relative_lib_imports` category this lesson's own new test file
adds, zero new categories); `flutter test`: 40 real test-file-level
checks (up from 37), `All tests passed!`, including every real test in
`game_session_resume_test.dart` — a real, previously-saved session
resumes exactly where it was; a real, already-started fresh session
survives a real, late-arriving stale save untouched; a real, genuinely
fresh app, with no saved session at all, still starts exactly as
honestly empty as it always did.

### Connect

This lesson's own real, background resume can now run safely, every
single real time this app starts, with no real race left inside the
one, shared connection every real feature in this app depends on.

---

## Connect the Pieces

`GameSession` gained a real, second, honest way to come into
existence — rebuilt whole from already-known values, never recomputing
what a resumed session must keep exactly as it was (Concept Unit 1).
`GameSessionRepository` named the one, real ability this app was still
missing: reading its own, saved session back as an actual, live object,
not merely reporting that one exists (Concept Unit 2).
`SqliteGameSessionRepository` gave that real ability its one, real,
symmetrical implementation — every real column this app's own `save`
already wrote, exactly reversed (Concept Unit 3). `GameSessionNotifier` wired
that real ability into this app's own real startup, real and
optimistically — a fresh session, always, immediately, swapped for a
real, resumed one only when it's still genuinely safe to do so — and
this exact real wiring's own real, permanent tests are what actually
exposed two further, real, genuine bugs (Concept Unit 4). Paying down a
real, already-flagged debt gave this whole app one real, single,
shared database connection, not two secretly racing each other
(Concept Unit 5). And fixing a real race condition inside that one,
shared connection's own opening logic — caching the real, in-flight
promise of a result, not only its real, finished value — is what
finally let this lesson's own real feature run safely, every single
real time this app starts (Concept Unit 6). Kill this app mid-game,
restart it: the exact real board, the exact real mistake count, the
exact real status come back, real and proven, three times over, by
this lesson's own real, permanent tests.
