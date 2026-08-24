# Lesson 50: The Game Now Knows About SQLite

**Local Database**

## What you will build

`project/lib/features/sudoku/infrastructure/app_database.dart` — this
app's first-ever real connection to an actual, on-disk SQLite database,
wired through a real, Flutter-compatible package for the first time.
`_SessionStatusState`'s own real "Games started" counter (Lesson 28),
which has reset to `0` on every real app launch since it was written,
finally survives one — real, permanent, verified proof that data can
outlive this app's own process, which is this whole phase's real point
(Lesson 49). The transferable problem, stated honestly, matching
curriculum's own real framing: this lesson's own code makes
`_SessionStatusState` — a presentation-layer widget — reach directly
into a concrete SQLite class. That's a deliberate, real, un-fixed rough
edge, not an oversight: only once a widget genuinely, visibly depends on
`AppDatabase` directly does Lesson 53's own future repository
abstraction have a real problem to solve.

## What you need to know first

- Lesson 49 ("Data That Has to Survive the App Closing") — every real
  SQL construct this lesson's own code depends on (`CREATE TABLE`,
  `PRIMARY KEY`, `NOT NULL`), reused here through a real Dart API instead
  of the raw `sqlite3` CLI.
- Lesson 39 ("Naming and Injecting a Dependency") — `Clock`, contrasted
  directly: `Clock` is a real abstraction with an injected concrete
  implementation; `AppDatabase`, this lesson's own real subject, is
  deliberately **not** — a real, felt absence this lesson's own SE lens
  returns to more than once.
- Lesson 41 ("Naming the Boundaries Already There") — the real
  Domain/Application/Infrastructure layers; `AppDatabase` is this
  project's third real Infrastructure-layer class, alongside
  `SystemClock` and `InMemoryPuzzleRepository`.
- Lesson 28 ("A Widget That Remembers Something") — `StatefulWidget`,
  `initState`, `dispose`, `setState` — all reused, unmodified, on
  `_SessionStatusState`.
- Lesson 16 ("Work That Finishes Later") — `Future`, `async`/`await` —
  every real method this lesson adds is asynchronous.
- Lesson 26 ("Wiring the Description to the Screen") — real Flutter
  plugins and `flutter pub add`, reused here against five new real
  packages instead of `flutter_riverpod`.
- Lesson 24 ("A Real, Permanent Test Suite") — this project's own
  permanent `project/test/` folder, which this lesson adds two new real
  files to.

## Terms used in this lesson

- **Flutter plugin (reappearing, Lesson 26)** — a real package that, in
  addition to Dart code, ships real, platform-specific native code
  (Android/iOS/Windows/etc.) — exists because some real capabilities
  (reading the real filesystem, opening a real native database) cannot
  be implemented in pure Dart alone.
- **Platform channel** — the real, named mechanism a Flutter plugin uses
  to call real, native platform code from Dart and get a real answer
  back — a real, asynchronous message bridge between the Dart side and
  whatever real native code the plugin ships. Exists because Dart's own
  code runs in the Flutter engine, genuinely separate from the real
  underlying OS's own native APIs.
- **`MissingPluginException`** — a real, dart:io/Flutter exception thrown
  when a platform channel call reaches no real, registered handler on
  the other side — this lesson's own real, run, first proof that
  `flutter test` has no real platform channel at all.
- **FFI (Foreign Function Interface)** — a real, general mechanism
  letting Dart code call real, compiled native functions (a `.dll`, a
  `.so`) directly, in-process, without a platform channel's own
  asynchronous message-passing at all. Exists because a platform channel
  needs a real, running native app (Android/iOS) with its own plugin
  registration on the other end — genuinely unavailable on a desktop
  host running plain `flutter test`, which FFI sidesteps entirely by
  loading the real native `sqlite3` library directly into the same
  process.
- **`DatabaseFactory`** — a real, named abstraction (an interface) this
  lesson's code depends on without ever writing its own real
  implementation — full CRC treatment in Objects and methods, below.
- **`ConflictAlgorithm`** — a real, named enum controlling what a real
  `INSERT`/`insert` call does when it collides with an existing real row
  — full CRC treatment in Objects and methods, below.
- **`setUp` / `addTearDown`** — real, standard `package:test` lifecycle
  functions: `setUp`'s own real callback runs fresh before every real
  test in the same file; `addTearDown`, called from inside it, registers
  a real cleanup callback that runs after that one specific real test
  finishes — exists so per-test setup and its own matching cleanup can be
  written and read together, rather than in two separate, distant blocks
  that a reader has to mentally pair up themselves.
- **`FileSystemException`** — a real, `dart:io` exception naming a failed
  real filesystem operation — this lesson's own real, run, second
  discovery: deleting a still-open file genuinely throws this, on
  Windows specifically.
- **Identifier (reappearing, Lesson 5)** — a real name given to something
  — a package, a class, a file — reused throughout this lesson's own real
  package and file names.

## Objects and methods used

- **`Platform.isAndroid` / `Platform.isIOS`**
  - *What it is:* two real, static boolean getters on `dart:io`'s
    `Platform` class, each reporting whether the real, current process is
    genuinely running on that real OS.
  - *Implementation:* `static bool get isAndroid`; `static bool get
    isIOS` — both real, read-only, computed once from the real, running
    process's own real OS identity.
  - *Its use:* `AppDatabase._open()` reads both to decide, for real,
    whether to reach for the FFI factory (Terms, above) at all.
  - *Type:* two static getters on a real, ordinary Dart class.
  - *Responsibility:* reporting, honestly and only, which real OS this
    process is genuinely running on right now — nothing about
    capabilities, permissions, or anything else.
  - *Depends on:* the real, running Dart VM's own knowledge of its host
    OS, established before any of this app's own code runs.
  - *Connects to:* read once inside `AppDatabase._open()`; nothing in
    this app writes to either.
  - *Shape:* a real, external `dart:core`-adjacent library boundary —
    `dart:io`, not Flutter itself.

- **`sqfliteFfiInit()`**
  - *What it is:* a real, top-level function from `sqflite_common_ffi`
    performing one-time, real, platform-specific setup for the FFI
    database factory.
  - *Implementation:* `void sqfliteFfiInit()` — real, fetched source,
    this session (`sqflite_common_ffi-2.4.2+1/lib/src/
    sqflite_ffi_io.dart`): on real Windows specifically, it calls a
    real, internal `windowsInit()` to locate the native `sqlite3` library
    this app needs; on other real desktop platforms, it's a genuine
    no-op.
  - *Its use:* called once, real and unconditionally (on real Windows,
    real and load-bearing; elsewhere, real and harmless), before this
    app ever assigns `databaseFactoryFfi` below.
  - *Type:* a free, top-level function.
  - *Responsibility:* whatever one-time, real, platform-specific
    preparation the FFI factory genuinely needs before its first real
    use — currently, only a real Windows-specific step.
  - *Depends on:* nothing this app supplies — reads the real, running
    platform itself.
  - *Connects to:* called directly inside `AppDatabase._open()`, before
    `databaseFactory` (below) is ever assigned.
  - *Shape:* Infrastructure-layer, real one-time setup code.

- **`databaseFactoryFfi` / `databaseFactory`**
  - *What it is:* `databaseFactoryFfi` is a real, top-level getter
    returning a real `DatabaseFactory` (Terms, above) backed by FFI
    (Terms, above); `databaseFactory` is a real, separate, top-level
    **mutable global** — a getter *and* a setter — naming which real
    `DatabaseFactory` every top-level `openDatabase()` call (Concept Unit
    4) actually uses.
  - *Implementation:* real, fetched source, this session
    (`sqflite_common-2.5.11/lib/src/sqflite_database_factory.dart`):
    `DatabaseFactory get databaseFactory => _databaseFactory ?? () {
    throw StateError('databaseFactory not initialized ...You must call
    `databaseFactory = databaseFactoryFfi;` before using global
    openDatabase API'); }();` — the real getter genuinely throws unless
    something has already assigned it. The real setter
    (`set databaseFactory(DatabaseFactory? databaseFactory) { ... }`)
    also, real and deliberately, `print`s a real warning to the console
    every time it's changed away from an already-non-null value — quoted
    verbatim in this lesson's own real, captured test output.
  - *Its use:* `AppDatabase._open()` assigns `databaseFactory =
    databaseFactoryFfi` on any real, non-Android, non-iOS platform —
    real Windows (this machine, running `flutter test`) included. On a
    real Android/iOS device, this app's own code never assigns
    `databaseFactory` at all — the real `sqflite` plugin's own real,
    official, documented usage (its README, read fresh this session,
    shows no such assignment) works with no explicit wiring, since
    `sqflite` itself is a real Flutter plugin (Terms, above) with its
    own real, native platform-channel-backed implementation already
    bundled.
  - *Type:* a top-level getter (`databaseFactoryFfi`) and a top-level
    getter/setter pair (`databaseFactory`) — not methods on any object,
    genuinely free-standing.
  - *Responsibility:* `databaseFactoryFfi`'s whole job is producing one
    real, working `DatabaseFactory` backed by native FFI, once;
    `databaseFactory`'s whole job is naming *which* real `DatabaseFactory`
    every top-level `openDatabase()` call in this whole process actually
    reaches, and warning loudly the moment that choice changes underneath
    already-running code.
  - *Depends on:* `databaseFactoryFfi` depends on `sqfliteFfiInit()`
    having already run, on real Windows; `databaseFactory`'s setter
    depends on nothing, but its own getter depends on someone having
    already called that setter first.
  - *Connects to:* `AppDatabase._open()` is the one real, current place
    in this whole project that ever assigns `databaseFactory`; every real
    call to the top-level `openDatabase()` function (Concept Unit 5)
    reads it.
  - *Shape:* a real, deliberate global mutable seam — the one place this
    whole real database's own concrete backend gets chosen, for the
    entire real process, at once.

- **`getApplicationSupportDirectory()`**
  - *What it is:* a real, top-level, asynchronous function from
    `path_provider` returning the real, platform-correct directory this
    app should store its own private, non-user-visible files in.
  - *Implementation:* `Future<Directory> getApplicationSupportDirectory()
    async` (real, fetched source, this session,
    `path_provider-2.1.6/lib/path_provider.dart`) — its own real doc
    comment explicitly recommends this specific real method, over the
    similarly-named `getApplicationDocumentsDirectory()`, for data that
    is "not user-generated" — this app's own real database file
    genuinely fits that description, unlike a document a real user
    explicitly created or exported.
  - *Its use:* `AppDatabase._open()` awaits it once, to find where its
    own real database file belongs.
  - *Type:* a free, top-level async function.
  - *Responsibility:* answering, for real, "where does this specific
    real OS want this app's own private support files to live" —
    nothing about creating the real database file itself.
  - *Depends on:* a real, registered platform channel (Terms, above) —
    which is exactly what `flutter test` genuinely lacks, this lesson's
    own central real discovery, Concept Unit 3.
  - *Connects to:* called once inside `AppDatabase._open()`; its real
    return value feeds directly into `join()` (below).
  - *Shape:* Infrastructure-layer, a real, external plugin boundary.

- **`Directory`**
  - *What it is:* a real `dart:io` class representing a real filesystem
    directory — the real, compound return type `getApplicationSupportDirectory()`
    hands back, per this schema's own "show the shape when a call returns
    a compound type" rule.
  - *Implementation:* real, relevant member used here: `String get path`
    — the real, absolute filesystem path this `Directory` object refers
    to.
  - *Its use:* `AppDatabase._open()` reads `.path` off the real
    `Directory` `getApplicationSupportDirectory()` returns.
  - *Type:* an ordinary, real, external class.
  - *Responsibility:* representing one real, specific location on disk;
    genuinely nothing about the real files inside it.
  - *Depends on:* a real, valid filesystem path string, supplied at
    construction.
  - *Connects to:* produced by `getApplicationSupportDirectory()`; its
    `.path` is read by `join()`, next.
  - *Shape:* a real, standard `dart:io` value type, crossing the same
    Infrastructure boundary `getApplicationSupportDirectory()` does.

- **`join()`**
  - *What it is:* a real, top-level function from `package:path`
    building one real, correct filesystem path out of real, separate
    pieces.
  - *Implementation:* real signature: `String join(String part1, [String?
    part2, ...])` — joins real path segments using the real, current
    platform's own real separator (`\` on real Windows, `/` elsewhere),
    which this app's own code never has to know or hardcode.
  - *Its use:* `AppDatabase._open()` calls `join(supportDir.path,
    'open_calc_sudoku.db')` to build this app's one real, complete
    database file path.
  - *Type:* a free, top-level function.
  - *Responsibility:* correctly joining real path segments across every
    real, supported platform — nothing about whether the resulting real
    path actually exists.
  - *Depends on:* the real path segments passed to it; nothing else.
  - *Connects to:* reads `Directory.path`; its own real return value is
    the exact string `openDatabase()` (Concept Unit 5) receives.
  - *Shape:* a real, small, pure utility — no state, no platform
    dependency of its own.

- **`PathProviderPlatform`**
  - *What it is:* the real, abstract platform-interface class every real
    `path_provider` implementation (including a real, throwaway test
    fake) extends.
  - *Implementation:* real, fetched source, this session
    (`path_provider_platform_interface-2.1.3/lib/
    path_provider_platform_interface.dart`): `abstract class
    PathProviderPlatform extends PlatformInterface { ... static
    PathProviderPlatform get instance => ...; static set instance(...)
    => ...; Future<String?> getApplicationSupportPath() { throw
    UnimplementedError(...); } }` — every real method throws
    `UnimplementedError` by default, meant to be real, individually
    overridden.
  - *Its use:* this lesson's own real, permanent
    `project/test/database_test_support.dart` extends it once, real and
    minimally, overriding only `getApplicationSupportPath()`.
  - *Type:* an abstract class (a real platform interface).
  - *Responsibility:* naming every real path `path_provider` can be asked
    for, as a real, overridable contract — never providing a real
    default answer itself.
  - *Depends on:* nothing to declare; a real, concrete subclass supplies
    every real answer.
  - *Connects to:* `getApplicationSupportDirectory()` reads
    `PathProviderPlatform.instance` internally; this lesson's own real
    test code writes to it directly.
  - *Shape:* the real, official seam `path_provider`'s own real,
    federated-plugin design exists specifically to let a test replace.

## Pipeline

Not applicable — this lesson touches no stage of the Widget → Element →
RenderObject → Pixels pipeline (Lesson 25); every real change here is
Infrastructure-layer or test-only.

---

## Concept Unit 1: A Real, Flutter-Compatible Database Package

### The Problem

Lesson 49's own real `sqlite3` CLI proved every SQL concept this app
will ever need, but a real Flutter app cannot shell out to a command-line
program on a real user's phone. Something has to let this app's own
Dart code talk to a real SQLite database directly, from inside the
running app itself.

> **Socratic prompt:** `flutter_riverpod` (Lesson 38) was added with one
> real `flutter pub add` command and just worked, on every real target
> this app has ever run on. Given `sqlite3` (Lesson 49) is a real,
> compiled native program, not pure Dart, what real complication would
> you expect a Flutter database package to face that `flutter_riverpod`
> — pure Dart — never did? Second: this machine's own real, current
> targets are Windows desktop (a known, real, broken build since Lesson
> 26) and `flutter test` itself, which runs directly on this Windows
> host, never on a real phone. What real problem might that specifically
> cause, if a database package only supported real Android/iOS?

### Project Change

- **Reference Source:** No reference counterpart — curriculum.md's own
  Lesson 50 bullet ("I'd introduce SQLite through a Flutter-compatible
  database abstraction") names the real requirement, not a specific real
  package; the real choice made here (`sqflite` + `sqflite_common_ffi`)
  is this session's own real, evidence-based decision, confirmed by
  reading both packages' own real, current source and documentation.
- **Files affected:** `project/pubspec.yaml` — modified.
- **Change type:** add (dependencies).
- **Location:** the `dependencies:` block, alongside `flutter_riverpod`
  (Lesson 38).
- **Dependencies:** none.

### The New Code

```powershell
flutter pub add sqflite sqflite_common_ffi
```

### Updated Project

```yaml
13  dependencies:
14    flutter:
15      sdk: flutter
16
17    cupertino_icons: ^1.0.8
18    flutter_riverpod: ^3.4.2
19    sqflite: ^2.4.3                                       -- ← new
20    sqflite_common_ffi: ^2.4.2+1                           -- ← new
```

`project/pubspec.yaml`'s own `dependencies:` block now names two real
new packages alongside the two it already had, exactly the same real
shape `flutter_riverpod` was added in at Lesson 38.

### Isolate and Discard

No separate throwaway lab — running the real command above, once, this
session, against the real project, *is* this unit's own real evidence;
there is no smaller real form of "add a real dependency" to isolate
further.

### Mechanical Walkthrough

- `flutter pub add` — the real, already-familiar command (Lesson 38,
  reappearing) that edits `pubspec.yaml` and runs a real
  `flutter pub get`, in one real step.
- `sqflite` — names this app's own real, primary database package —
  a real Flutter plugin (Terms, above): on a real Android/iOS device, it
  ships real, native platform-channel-backed code that genuinely talks
  to SQLite; on Windows/Linux/desktop, and under `flutter test`, it has
  no real native backend of its own at all.
- `sqflite_common_ffi` — names a real, second, complementary package:
  a real `DatabaseFactory` (Terms, above) implementation using FFI
  (Terms, above) instead of a platform channel — real, confirmed working
  on "Win/Mac/Linux" per its own real, fetched source comment — covering
  exactly the real gap `sqflite` alone leaves on this machine.

### CS Lens

Choosing **one real interface with more than one real, swappable
backend** — the same real idea Lesson 39's own `Clock` already used — is
a hard concept.

```
Also recognized in: a car's OBD-II port (one real interface, many real
engine implementations behind it), a graphics API like Vulkan/Metal
(one real interface, a different real GPU driver underneath depending on
hardware), USB-C (one real physical/logical interface, wildly different
real devices on the other end)
```

### SE Lens

The real principle is **matching the real implementation to the real
target, without changing the real calling code**. The alternative not
chosen: pick only `sqflite`, accepting that this app's own real database
code would be genuinely untestable on this Windows machine (no real
Android device connected this session) and would never real-run on real
Windows desktop even once that build issue is eventually fixed. The real
tradeoff: two real packages instead of one, and — this lesson's own
real, honest, load-bearing cost, proven directly in Concept Unit 2 —
`AppDatabase`'s own real code has to explicitly decide, itself, which
real backend to use, rather than that decision being invisible.

### Commands Needed

- **`flutter pub add sqflite sqflite_common_ffi`** — run from
  `project/`, this session. Success output: a real, printed dependency
  resolution list ending `Changed 26 dependencies!` (many of `sqflite`'s
  own real, transitive platform packages — `sqflite_android`,
  `sqflite_darwin`, the real `sqlite3` Dart package itself — pulled in
  alongside it).

### Run It

Real, captured output (abridged to the real, directly relevant lines):

```
+ sqflite 2.4.3
+ sqflite_android 2.4.3
+ sqflite_common 2.5.11
+ sqflite_common_ffi 2.4.2+1
+ sqflite_darwin 2.4.3+1
+ sqflite_platform_interface 2.4.1
+ sqlite3 3.5.2
Changed 26 dependencies!
```

Real, direct confirmation: both real packages resolved, plus real,
platform-specific implementation packages this app's own code never
imports directly (`sqflite_android`, `sqflite_darwin`) — real evidence
that `sqflite` itself is a real, federated, multi-platform plugin under
the hood, even though this app's own code only ever writes `import
'package:sqflite/...'`.

### Connect

Two real packages now exist in this project, together covering every
real target this app has ever run on or tested against. Concept Unit 2
writes the real code that decides, for real, which one actually gets
used.

---

## Concept Unit 2: Opening a Real Database, on the Right Real Backend

### The Problem

`openDatabase()` (Concept Unit 5) needs one real `DatabaseFactory`
(Terms, above) to actually reach — and Concept Unit 1's own real
evidence already proved two real, different ones now exist in this
project. Nothing yet decides between them.

> **Socratic prompt:** given `Platform.isAndroid`/`Platform.isIOS` can
> tell this app's own code, for real, which OS it's genuinely running
> on, what real condition would you write to decide "use the real FFI
> factory" versus "use `sqflite`'s own real, built-in default"? Second:
> `sqfliteFfiInit()`'s own real doc comment says it "currently only
> performs windows specific operations" — given this app's own current
> real device target (Lesson 26's own Motorola Razr, Android) never runs
> that code path at all, what would you predict happens if this app
> calls it anyway, unconditionally, even on real Android?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new
  real class, no prior version to port from.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  created.
- **Change type:** add.
- **Location:** a brand-new file, matching `system_clock.dart`'s own
  real Infrastructure-layer placement (Lesson 47).
- **Dependencies:** Concept Unit 1's own two real, newly-added packages.

### The New Code

```dart
if (!Platform.isAndroid && !Platform.isIOS) {
  sqfliteFfiInit();
  databaseFactory = databaseFactoryFfi;
}
```

### Updated Project

`AppDatabase`'s own real, growing `_open()` method — a brand-new method
on a brand-new class, so its own full, real body is shown whole:

```dart
1  class AppDatabase {
2    Database? _database;
3
4    Future<Database> _open() async {
5      final existing = _database;
6      if (existing != null) {
7        return existing;
8      }
9      if (!Platform.isAndroid && !Platform.isIOS) {         // ← new
10       sqfliteFfiInit();                                   // ← new
11       databaseFactory = databaseFactoryFfi;                // ← new
12     }                                                      // ← new
13     // (Concept Unit 3 continues here)
14   }
15 }
```

This class now has exactly one real job so far: deciding, for real,
which `DatabaseFactory` backend the rest of this method will use.
`_database`'s own real, private, nullable field (line 2) and the
early-return guard (lines 5-8) already exist, ahead of any real caller
needing them yet — Concept Unit 5 is where a second real call would
actually exercise that guard.

### Isolate and Discard

No separate throwaway lab — this is a genuinely small, four-real-line
conditional, and its own real effect (which `DatabaseFactory` becomes
active) is only observable through `openDatabase()` itself, Concept Unit
4's own real subject; isolating it further would mean re-deriving
Concept Unit 5 early. This is called **conditionally wiring a real
`DatabaseFactory`**.

### Mechanical Walkthrough

- `if (!Platform.isAndroid && !Platform.isIOS)` — `Platform.isAndroid`/
  `Platform.isIOS` (Objects and methods, above) are each read once; `!`
  is Dart's own real, already-familiar logical negation (Lesson 6,
  reappearing); `&&` is Dart's own real, already-familiar logical AND
  (Lesson 6, reappearing) — together, real and true only when this
  process is genuinely running on neither real OS, which, on this
  machine, under `flutter test`, is always real and true (this Windows
  host is neither).
- `sqfliteFfiInit()` (Objects and methods, above) — called first, real
  and unconditionally inside this branch, since `databaseFactoryFfi`
  (next) depends on it having already run.
- `databaseFactory = databaseFactoryFfi` (Objects and methods, above) —
  a real, top-level assignment: reads the real `databaseFactoryFfi`
  getter's own real value, and assigns it to the real, separate,
  mutable `databaseFactory` global — the one real line in this whole
  file that actually decides which backend every later real
  `openDatabase()` call reaches.

### CS Lens

Not repeated separately — this unit's own real construct (choosing a
real backend behind one real interface) is the identical hard concept
Concept Unit 1's own CS lens already gave full, real, multi-recurrence
treatment to.

### SE Lens

The real principle is **an explicit, narrow, platform-conditional seam**,
placed at exactly one real point in the whole app. The alternative not
chosen, directly answering this unit's own second Socratic question:
calling `sqfliteFfiInit()`/assigning `databaseFactoryFfi`
unconditionally, on every real platform including Android — real,
genuinely wasted work on Android (`sqfliteFfiInit()`'s own real body is
a no-op there anyway), but a real, more serious cost too: it would
silently discard `sqflite`'s own real, native, platform-channel-backed
factory in favor of FFI even on a real device where the native one is
faster and already correct — the real reason this condition exists at
all, not just tidiness. The honest, present cost: this real condition
lives inside `AppDatabase` itself, a real, concrete Infrastructure
class — Lesson 39's own real `Clock` abstraction has no equivalent
platform-detection logic anywhere, because `Clock`'s own real,
injected implementation is chosen once, externally, not decided
internally by the class using it; `AppDatabase` deciding this for
itself, internally, is part of this lesson's own deliberately naked,
unabstracted design, flagged honestly here rather than hidden.

### Commands Needed

None new — reusing Concept Unit 1's own already-added real packages.

### Run It

Not runnable standalone yet — `_open()`'s own real body isn't complete
until Concept Unit 5 adds the real call to `openDatabase()` itself; this
unit's own real code will be exercised, and its real effects confirmed,
by that later unit's own real test run.

### Connect

The right real `DatabaseFactory` is now chosen, for real, before
anything tries to open a real database. Concept Unit 3 finds the real,
correct place on disk that database file should actually live.

---

## Concept Unit 3: Finding a Real Place to Put the File — and a Real, Serious Discovery

### The Problem

A real SQLite database is one real file, at one real path.
`_startingPuzzle` (Lesson 43) is a real, hardcoded Dart constant with no
real file at all — this app has never needed a real, correct, per-platform
filesystem path before now.

> **Socratic prompt:** a real Android app, a real iPhone app, and this
> real Windows test host each have completely different real rules about
> where an app is allowed to write its own private files. Would you
> expect this app's own code to need a real `if (Platform.isAndroid) ...
> else if (Platform.isIOS) ...` chain to find the right real directory
> itself, or is that exactly the kind of real problem a real, dedicated
> package (the way `sqflite_common_ffi` handled the database backend)
> would exist to solve instead?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified; `project/pubspec.yaml` — modified (two more real
  dependencies).
- **Change type:** add.
- **Location:** inside `_open()`, immediately after Concept Unit 2's own
  real conditional block.
- **Dependencies:** `path_provider`, `path` — added this unit.

### The New Code

```dart
final supportDir = await getApplicationSupportDirectory();
final path = join(supportDir.path, 'open_calc_sudoku.db');
```

### Updated Project

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
13     final supportDir = await getApplicationSupportDirectory();  // ← new
14     final path = join(supportDir.path, 'open_calc_sudoku.db');  // ← new
15     // (Concept Unit 5 continues here)
16   }
17 }
```

`_open()` now knows both *which* real backend to use and *where* its
real file belongs — everything Concept Unit 5's own real
`openDatabase()` call will need.

### Isolate and Discard

**A real, deliberately-run isolated lab, exactly because this
construct's own real behavior turned out to be genuinely surprising** —
run before touching `AppDatabase` at all, this session, and kept, real
and saved, in `verification/lesson-50/`:

```dart
test('real check: does getApplicationSupportDirectory work under flutter test on this host?', () async {
  final dir = await getApplicationSupportDirectory();
  print('REAL RESULT: ${dir.path}');
});
```

Real, captured output — a genuine, immediate failure:

```
MissingPluginException(No implementation found for method getApplicationSupportDirectory on channel plugins.flutter.io/path_provider)
```

This is called a **`MissingPluginException`** (Terms, above): real,
direct proof that `flutter test` genuinely has no real platform channel
(Terms, above) at all — `path_provider`'s own real, native
implementation only exists on a real device or real desktop app, neither
of which this Windows test host is.

**A second, real, more serious version of the identical real call,**
this time inside a `testWidgets()` block instead of a plain `test()` —
run, this session, and real and deliberately killed after a real
60-second timeout produced zero output at all:

```dart
testWidgets('...', (tester) async {
  final dir = await getApplicationSupportDirectory();
});
```

Real, observed result: **it never throws at all — it hangs forever.**
This is a real, genuinely worse failure than the plain `test()` version:
an exception at least stops and reports; this one leaves the real
`await` suspended, silently, permanently — exactly the shape of failure
this schema's own "hidden or invisible behavior needs proof, not a
confident sentence" standard exists to catch, since nothing about
`testWidgets()`'s own real signature suggests this real difference from
plain `test()`.

Both throwaway probes are discarded — neither ever appears in
`project/`. The real, working fix, proven next, became the permanent
`project/test/database_test_support.dart`.

### Mechanical Walkthrough

- `getApplicationSupportDirectory()` (Objects and methods, above) —
  called once, real and `await`ed.
- `await` — Dart's own real, already-familiar keyword (Lesson 16,
  reappearing) pausing this async function until the real `Future`
  resolves — which, as just proven, is not guaranteed to ever happen at
  all under `testWidgets()` without a real fix (Concept Unit 4).
- `supportDir.path` — `.path` (Objects and methods, `Directory`, above)
  read once, giving the real, absolute directory string.
- `join(supportDir.path, 'open_calc_sudoku.db')` (Objects and methods,
  above) — combines that real directory with a real, chosen literal
  filename, `'open_calc_sudoku.db'` — a real string literal (Lesson 5,
  reappearing), this app's own first real database file's own real
  name.

### CS Lens

**Delegating a platform-specific decision to a real, dedicated plugin**
is this unit's own real construct.

```
Also recognized in: Windows' own real %APPDATA%/%LOCALAPPDATA%
convention (Lesson 2, reappearing — this project's own real, earlier
terminal work), macOS's ~/Library/Application Support, the Linux XDG
Base Directory specification — three real, genuinely different real
answers to "where does a real app's own private data belong," none of
which this app's own code has to know about directly
```

### SE Lens

The real principle is **trusting a real, external, well-tested plugin
over reinventing per-platform logic in this app's own code**, directly
answering this unit's own Socratic prompt. The alternative not chosen: a
real `if (Platform.isWindows) ... else if (Platform.isMacOS) ... else if
(Platform.isLinux) ...` chain, hardcoding every real platform's own real
storage convention inside `AppDatabase` itself. The real tradeoff,
proven directly by this unit's own real, run discovery: trusting a real,
external plugin for something this fundamental means this app's own real
tests now depend on that plugin's own real platform channel — which, as
just proven, genuinely doesn't exist at all under `flutter test`. The
honest, present cost this unit leaves open: nothing here yet fixes that
— Concept Unit 4 does.

### Commands Needed

- **`flutter pub add path_provider`** — real dependency; **`flutter pub
  add path`** — real dependency; both run this session, real, resolved
  versions: `path_provider 2.1.6`, `path 1.9.1`.

### Run It

Not runnable standalone yet — the real code above only ever runs as part
of `_open()`'s own complete real body (Concept Unit 5), and, under
`flutter test`, only correctly once Concept Unit 4's own real fix is in
place. This unit's own real evidence is the failure itself, already
shown above in Isolate and Discard: a real `MissingPluginException`
under a plain `test()`, and a real, silent, permanent hang under
`testWidgets()` — both real, run, and saved.

### Connect

`_open()` now knows exactly where its real file belongs — and this unit's
own real, run evidence just proved that knowledge alone isn't enough
under `flutter test`. Concept Unit 4 fixes that, for every real test in
this project that will ever need it.

---

## Concept Unit 4: Mocking a Platform Boundary, So Tests Don't Hang Forever

### The Problem

Concept Unit 3's own real, run evidence proved the exact real cost of
depending on `path_provider`: a real hang, not just a real, clean
failure, under `flutter test`. That real problem doesn't belong to one
Concept Unit alone — every real test in this project that will ever pump
`SudokuApp` needs the identical real fix.

> **Socratic prompt:** `PathProviderPlatform.instance` (Objects and
> methods, above) is a real, static, settable property — given that,
> what real, minimal class would you need to write to make
> `getApplicationSupportDirectory()` return a real, chosen, fake answer
> instead of reaching for a real platform channel at all? Second: if
> every real test file wrote its own separate copy of that real fix,
> what real, concrete problem would that create the next time this
> fix's own real behavior needed to change?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new real
  file, no prior version to port from. Its own real shape, though, is
  not invented fresh here: it's the identical real pattern already
  proven working in Concept Unit 3's own real evidence
  (`verification/lesson-50/sqlite_pipeline_probe_test.dart`), written
  once, permanently, so every real test file can share it.
- **Files affected:** `project/test/database_test_support.dart` —
  created.
- **Change type:** add.
- **Location:** a brand-new file, inside `project/test/`.
- **Dependencies:** `path_provider_platform_interface` (`dev`-only),
  `sqflite_common_ffi` (Concept Unit 1).

### The New Code

```dart
class _FakePathProviderPlatform extends PathProviderPlatform {
  _FakePathProviderPlatform(this.supportPath);
  final String supportPath;

  @override
  Future<String?> getApplicationSupportPath() async => supportPath;
}

void useIsolatedTestDatabase() {
  TestWidgetsFlutterBinding.ensureInitialized();
  sqfliteFfiInit();
  databaseFactory = databaseFactoryFfi;

  setUp(() async {
    final tempDir = await Directory.systemTemp.createTemp('open_calc_sudoku_test_');
    PathProviderPlatform.instance = _FakePathProviderPlatform(tempDir.path);
    addTearDown(() async {
      try {
        await tempDir.delete(recursive: true);
      } on FileSystemException {
        // Ignored — see the real, Windows-specific discovery below.
      }
    });
  });
}
```

### Updated Project

Not applicable — a brand-new file, both real declarations shown whole
above, with nothing surrounding either one yet.

### Isolate and Discard

The real code above already **is** the throwaway lab, discarded once and
proven working — `verification/lesson-50/
sqlite_pipeline_probe_test.dart`, Concept Unit 3's own real evidence,
ran this exact real shape first, real and disposable, before it was
written here, permanently, as `database_test_support.dart`. This is
called **mocking a platform interface**.

### Mechanical Walkthrough

- `class _FakePathProviderPlatform extends PathProviderPlatform` —
  `extends` (Lesson 12, reappearing) — a real, minimal, test-only
  subclass of `PathProviderPlatform` (Objects and methods, above),
  overriding only the one real method this app's own code actually
  calls.
- `_FakePathProviderPlatform(this.supportPath);` — a real constructor
  using `this.field` shorthand (Lesson 11, reappearing).
- `final String supportPath;` — a real, ordinary field (Lesson 11,
  reappearing).
- `@override Future<String?> getApplicationSupportPath() async =>
  supportPath;` — `@override` (Lesson 12, reappearing, a real
  annotation, not a keyword) marks this as genuinely replacing the real
  parent's own `UnimplementedError`-throwing default; `async =>` is
  Dart's own real arrow-function shorthand (Lesson 8, reappearing) for a
  single-expression async body.
- `void useIsolatedTestDatabase()` — a real, ordinary top-level function
  (Lesson 8, reappearing), this lesson's own real, shared test helper.
- `TestWidgetsFlutterBinding.ensureInitialized()` — a real,
  already-familiar call (Lesson 25, reappearing) — required before any
  real Flutter test infrastructure, including `PathProviderPlatform`
  mocking, can run.
- `sqfliteFfiInit(); databaseFactory = databaseFactoryFfi;` — the
  identical real two lines already given full treatment in Concept Unit
  2, called here unconditionally, since every real test runs on this
  Windows host, never on real Android/iOS.
- `setUp(...)` (Terms, above, full treatment here) — a real,
  `package:test` function; its own real callback argument, an anonymous
  async function (Lesson 15, reappearing), runs fresh before every real
  test in whatever file calls `useIsolatedTestDatabase()`.
- `Directory.systemTemp.createTemp('open_calc_sudoku_test_')` —
  `Directory.systemTemp` is a real, static getter on `dart:io`'s
  `Directory` (Objects and methods, above) returning the real, host OS's
  own temp directory; `.createTemp(...)` is a real instance method,
  genuinely creating a new, real, uniquely-named subdirectory on disk,
  given a real, chosen prefix string.
- `PathProviderPlatform.instance = _FakePathProviderPlatform(tempDir.path)`
  — the real, static setter (Objects and methods, `PathProviderPlatform`,
  above), reassigning which real object every later real
  `getApplicationSupportDirectory()` call in this specific real test
  actually reaches.
- `addTearDown(...)` (Terms, above, full treatment here) — registers a
  real cleanup callback, run automatically once this specific real test
  finishes, regardless of whether it passed or failed.
- `try { await tempDir.delete(recursive: true); } on FileSystemException
  { }` — `try`/`on`/`catch` (Lesson 14, reappearing) — wraps a real,
  deliberate, second real discovery, below, rather than letting it fail
  the test.

**A real, Windows-specific discovery**, made while writing this exact
`tearDown` logic — the first, simpler real version
(`await tempDir.delete(recursive: true);`, with no `try`) produced a
real, run failure:

```
PathAccessException: Deletion failed, path = 'C:\Users\g4m3r\AppData\Local\Temp\open_calc_sudoku_test_2bc9d6dd' (OS Error: The process cannot access the file because it is being used by another process, errno = 32)
```

Real, confirmed cause: unlike POSIX (which allows deleting a file a
process still has open), Windows genuinely refuses to, and Dart's own
real garbage collector hadn't necessarily released the native SQLite
file handle by the exact instant this cleanup callback ran. Fixed, real
and honestly, by treating deletion as a real best-effort — a leftover
real temp directory costs nothing but disk space — rather than a real
correctness requirement.

### CS Lens

**Mocking a platform boundary for a test** is a hard concept.

```
Also recognized in: a fake payment gateway in an e-commerce test suite,
a stub HTTP server replacing a real third-party API in an integration
test, dependency injection generally (Lesson 39, reappearing) — swapping
a real, external dependency for a real, controlled test double
```

### SE Lens

The real principle is **test isolation, and one real, shared fix instead
of many separate copies** — directly answering this unit's own second
Socratic question. The alternative not chosen: one, shared, real fake
path across every real test file, or worse, each real test file
inventing its own separate copy of this exact fix. The real tradeoff:
`database_test_support.dart` costs one real, small, shared helper file
that every real test touching `SudokuApp` now has to call — a real,
small, ongoing tax, paid for a real, concrete benefit already proven
this session: without it, real tests genuinely hang, silently, forever,
which is a far worse real failure mode for anyone running this test
suite than a clean, fast failure would be, and a single, shared fix
means that lesson only ever has to be learned, and fixed, once.

### Commands Needed

- **`flutter pub add dev:path_provider_platform_interface`** — real,
  `dev`-only dependency (the `dev:` prefix restricts a package to
  test/dev code, never shipped in the real, built app), run this
  session, real, resolved version: `path_provider_platform_interface
  2.1.3`.

### Run It

Real, captured output, `verification/lesson-50/
sqlite_pipeline_probe_test.dart`, using this exact real fix shape:

```
REAL after first insert: [{key: total_games_started, value: 1}]
REAL after real close+reopen: [{key: total_games_started, value: 1}]
All tests passed!
```

Real, direct proof the fix genuinely works — this exact real evidence is
revisited in full in Concept Unit 7, against this app's own real
`AppDatabase`, not a throwaway lab.

### Connect

Every real test that will ever pump `SudokuApp` now has one real, shared,
working way to avoid Concept Unit 3's own real, discovered hang. Concept
Unit 5 finally opens a real database, for real, using everything Concept
Units 2-4 already built.

---

## Concept Unit 5: Opening the Real Database and Creating Its Real Shape

### The Problem

A real path now exists; no real database file does yet. The very first
real time this app ever runs against a fresh install, `settings` — the
one real table this lesson needs (Lesson 49's own real vocabulary,
finally applied) — doesn't exist either.

> **Socratic prompt:** Lesson 49's own real `CREATE TABLE settings (key
> TEXT PRIMARY KEY, value INTEGER NOT NULL);` ran once, by hand, against
> a database that already existed. This app's own real database file
> won't exist the very first time a real player installs it — what real
> problem does that create for *when* that exact statement needs to run,
> and how many real times should it run, ever, per real installation?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified.
- **Change type:** add.
- **Location:** inside `_open()`, completing the method Concept Units
  2-3 already began.
- **Dependencies:** Concept Unit 3's own real `path`.

### The New Code

```dart
final opened = await openDatabase(
  path,
  version: 1,
  onCreate: (db, version) async {
    await db.execute('''
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL
      )
    ''');
  },
);
_database = opened;
return opened;
```

### Updated Project

`_open()`'s own complete, real, final body:

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
15     final opened = await openDatabase(                       // ← new
16       path,                                                   // ← new
17       version: 1,                                             // ← new
18       onCreate: (db, version) async {                         // ← new
19         await db.execute('''                                  // ← new
20           CREATE TABLE settings (                              // ← new
21             key TEXT PRIMARY KEY,                               // ← new
22             value INTEGER NOT NULL                              // ← new
23           )                                                     // ← new
24         ''');                                                   // ← new
25       },                                                        // ← new
26     );                                                          // ← new
27     _database = opened;                                        // ← new
28     return opened;                                              // ← new
29   }
30 }
```

`_open()` now does everything its own real name promises: pick the
right real backend, find the right real path, open (and, the real first
time only, create) the real file, remember it, and return it — real and
ready for Concept Unit 6's own real reads and writes.

### Isolate and Discard

No separate throwaway lab — `openDatabase`/`onCreate`/`execute` are all
exercised for real, together, by `verification/lesson-50/
sqlite_pipeline_probe_test.dart`, already run in Concept Unit 3; that
real evidence is reused here, not re-derived. This is called
**`openDatabase`'s real version-and-`onCreate` lifecycle**.

### Mechanical Walkthrough

- `openDatabase(...)` — a real, top-level, asynchronous function
  (Objects and methods, below, full treatment there), called once.

> **`openDatabase()` / `Database`**
> - *What it is:* `openDatabase` is the real, top-level function that
>   opens (and, the first real time, creates) a real SQLite database
>   file; `Database` is the real, abstract interface it hands back —
>   this lesson's own real, central, primary subject.
> - *Implementation:* real, fetched source, this session
>   (`sqflite_common-2.5.11/lib/sqflite.dart`): `Future<Database>
>   openDatabase(String path, {int? version, OnDatabaseConfigureFn?
>   onConfigure, OnDatabaseCreateFn? onCreate, OnDatabaseVersionChangeFn?
>   onUpgrade, OnDatabaseVersionChangeFn? onDowngrade, OnDatabaseOpenFn?
>   onOpen, bool? readOnly = false, bool? singleInstance = true,
>   OpenDatabaseOptions? options})` — its own real doc comment states the
>   exact real callback order — `onConfigure`, then exactly one of
>   `onCreate`/`onUpgrade`/`onDowngrade`, then `onOpen` — internally
>   delegating to `databaseFactory.openDatabase(...)` (Objects and
>   methods, above), which is exactly why Concept Unit 2's own real
>   assignment had to happen first. `Database implements DatabaseExecutor`
>   — every real method `execute`/`insert`/`query` (below, and Concept
>   Unit 6) provide, `Database` itself adds only `path` and `close()`.
> - *Its use:* `AppDatabase._open()` calls it once, real and lazily, the
>   first time any real method needs a real connection.
> - *Type:* a free, top-level async function (`openDatabase`); an
>   abstract interface (`Database`).
> - *Responsibility:* `openDatabase`'s full charter: find or create the
>   real file at `path`, run exactly the right real one-time callback if
>   its own schema `version` genuinely changed, and hand back a real,
>   ready `Database` — never running a real query itself.
> - *Depends on:* a real, valid file path; a real, already-assigned
>   `databaseFactory` (Objects and methods, above).
> - *Connects to:* called once, inside `AppDatabase._open()`; its real
>   return value is stored in `_database` and returned to every real
>   caller of `totalGamesStarted`/`incrementTotalGamesStarted` (Concept
>   Unit 6).
> - *Shape:* the real, one seam this whole app crosses from pure Dart
>   into an actual, on-disk SQLite file — Infrastructure-layer, and this
>   lesson's own real, central subject.

- `path` — the real, positional `String` argument, Concept Unit 3's own
  real result.
- `version: 1` — a real, named `int` argument: the real, current schema
  version this app declares. Its real, load-bearing role: `onCreate`
  only ever runs when a database's own file is genuinely brand new
  *and* a real `version` was supplied — omitting `version` entirely
  would mean `onCreate` never runs at all, per `openDatabase`'s own real
  documented contract.
- `onCreate: (db, version) async { ... }` — a real, named callback
  argument: an anonymous function (Lesson 15, reappearing) taking two
  real parameters, `db` (a real `Database`, Objects and methods, above —
  this exact callback's own private, freshly-opened handle) and
  `version` (the real `int` just supplied above) — called by
  `openDatabase`'s own real internal logic exactly once per real
  installation, the first real time this exact file doesn't exist yet.
- `await db.execute('''...''')` — `db.execute` (Objects and methods,
  `Database`, below) called once; `'''...'''` is Dart's own real
  triple-quoted string literal (a genuinely new real syntax detail —
  lets the real, multi-line SQL text below span several real lines
  without escaping), holding the identical real `CREATE TABLE settings
  (key TEXT PRIMARY KEY, value INTEGER NOT NULL)` statement Lesson 49
  already gave full treatment to.
- `_database = opened;` — a real, ordinary field assignment (Lesson 11,
  reappearing), the one real place `_database`'s own guard (Concept
  Unit 2, lines 5-8) gets a real value to actually guard.
- `return opened;` — Dart's own real `return` statement (Lesson 8,
  reappearing), handing the real, now-open `Database` back to whichever
  real method called `_open()`.

> **`Database.execute`**
> - *What it is:* a real instance method on `DatabaseExecutor` (which
>   `Database` implements) running one real SQL statement with no real
>   return value.
> - *Implementation:* real, fetched source, this session
>   (`sqflite_common-2.5.11/lib/sqlite_api.dart`): `Future<void>
>   execute(String sql, [List<Object?>? arguments]);` — its own real
>   doc comment explicitly warns it cannot run more than one real
>   statement at once ("you cannot have multiple statements... you
>   cannot create 2 tables for example"), which is exactly why this
>   `onCreate` callback would need a second, separate `execute` call for
>   a real second table, not a second `CREATE TABLE` appended to the
>   same real string.
> - *Its use:* runs this app's own real, one-time `CREATE TABLE`.
> - *Type:* an instance method on a real interface (`DatabaseExecutor`).
> - *Responsibility:* running one real SQL statement that produces no
>   real rows back — schema changes, not reads.
> - *Depends on:* a real, open `Database`/`Transaction` to be called on;
>   a real, syntactically valid SQL string.
> - *Connects to:* called once, inside `onCreate`, on the real `db`
>   parameter `openDatabase` itself supplies.
> - *Shape:* the real, low-level escape hatch beneath `Database`'s own
>   higher-level `insert`/`query` (Concept Unit 6) — real, raw SQL, not a
>   typed helper.

### CS Lens

**Schema migration via a version number** is a hard concept.

```
Also recognized in: a database migration framework in any real backend
stack (Rails' ActiveRecord migrations, Django migrations), a mobile
app's own local cache schema version, a save-file format version bumped
across real game releases
```

### SE Lens

The real principle is **idempotent, one-time initialization, driven by
real data already on disk, not by application-level flags**. The
alternative not chosen: this app's own code checking, itself, on every
real launch, "does the `settings` table exist yet?" before deciding
whether to create it. The real tradeoff: `openDatabase`'s own real
`version`/`onCreate` contract already solves this exact real problem —
reusing it costs nothing extra here, but genuinely commits this project
to real, disciplined `version` bumps (`onUpgrade`, Lesson 52's own real
"Migrations" job) the moment `settings`'s own real shape ever needs to
change on a real device that already has real player data in it.

### Commands Needed

None new.

### Run It

Real, captured output (`verification/lesson-50/
sqlite_pipeline_probe_test.dart`, reused from Concept Unit 3):

```
REAL after first insert: [{key: total_games_started, value: 1}]
```

Real, direct proof `openDatabase`'s own `onCreate` genuinely ran and
genuinely created a real, usable `settings` table — the very next real
statement (a real insert) succeeded against it with no separate
`CREATE TABLE` step anywhere in the test itself.

### Connect

A real, on-disk SQLite file, with a real `settings` table, now opens
correctly, on the right real backend, exactly once per real
installation. Concept Unit 6 puts real data into it and reads real data
back, through a typed real API instead of raw SQL strings.

---

## Concept Unit 6: Writing and Reading Real Data Through a Typed API

### The Problem

Lesson 49's own real `INSERT`/`SELECT` were raw SQL text, hand-typed and
error-prone to build correctly at runtime (string concatenation, escaping
real values). This app's own real code needs to read and write one real
integer — how many real games have ever started — without constructing
raw SQL strings itself.

> **Socratic prompt:** given `Database.execute` (Concept Unit 5) can
> already run any real SQL string, including a real `INSERT`, what real
> risk would building that string by hand, every time
> (`'INSERT INTO settings VALUES (\'total_games_started\', $count)'`)
> introduce, that a real, typed method taking a real `Map` instead might
> avoid? Second: this app's own real count needs to be updated, not just
> inserted, the second and every later real time a game starts — what
> real SQL construct, from Lesson 49, handles "insert, but overwrite if
> it already exists" in one real statement?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `project/lib/features/sudoku/infrastructure/app_database.dart` —
  modified.
- **Change type:** add.
- **Location:** two new real methods, alongside `_open()`.
- **Dependencies:** Concept Unit 5's own real, working `_open()`.

### The New Code

```dart
Future<int> totalGamesStarted() async {
  final db = await _open();
  final rows = await db.query(
    'settings',
    where: 'key = ?',
    whereArgs: ['total_games_started'],
  );
  if (rows.isEmpty) {
    return 0;
  }
  return rows.first['value'] as int;
}

Future<void> incrementTotalGamesStarted() async {
  final db = await _open();
  final current = await totalGamesStarted();
  await db.insert(
    'settings',
    {'key': 'total_games_started', 'value': current + 1},
    conflictAlgorithm: ConflictAlgorithm.replace,
  );
}
```

### Updated Project

`AppDatabase`'s own real, complete file, `_open()` unchanged from
Concept Unit 5, both new real methods added after it:

```dart
 1  class AppDatabase {
 2    Database? _database;
 3
 4    Future<Database> _open() async { /* unchanged, Concept Unit 5 */ }
 5
 6    Future<int> totalGamesStarted() async {                    // ← new
 7      final db = await _open();                                // ← new
 8      final rows = await db.query(                             // ← new
 9        'settings',                                            // ← new
10       where: 'key = ?',                                       // ← new
11       whereArgs: ['total_games_started'],                     // ← new
12     );                                                        // ← new
13     if (rows.isEmpty) {                                       // ← new
14       return 0;                                               // ← new
15     }                                                         // ← new
16     return rows.first['value'] as int;                        // ← new
17   }                                                           // ← new
18
19   Future<void> incrementTotalGamesStarted() async {           // ← new
20     final db = await _open();                                // ← new
21     final current = await totalGamesStarted();                // ← new
22     await db.insert(                                          // ← new
23       'settings',                                             // ← new
24       {'key': 'total_games_started', 'value': current + 1},   // ← new
25       conflictAlgorithm: ConflictAlgorithm.replace,           // ← new
26     );                                                        // ← new
27   }                                                           // ← new
28 }
```

(Line 4 stands in for `_open()`'s own real, unmodified 26-line body,
shown in full already in Concept Unit 5's own Updated Project step —
per this schema's own rule, an *unchanged* method genuinely doesn't need
re-showing whole a second time in the same lesson, unlike a method being
actively grown, which always does.) `AppDatabase` now has one real job
finished (opening) and two more (reading, writing) — every real method
starts by calling the identical real `_open()`, which, per Concept Unit
2's own real guard, only genuinely opens the file the first real time.

### Isolate and Discard

No separate throwaway lab — both real methods are exercised together,
for real, by the permanent `project/test/app_database_test.dart`,
Concept Unit 7. This is called **`Database.insert`/`Database.query`**.

### Mechanical Walkthrough

- `Future<int> totalGamesStarted() async` — a real, ordinary async
  method (Lesson 16, reappearing) returning a real `int`.
- `final db = await _open();` — real, already-explained (Concept Unit
  4); the second and every later real call reaches the real early-return
  guard instead of genuinely reopening the file.
- `db.query('settings', where: 'key = ?', whereArgs: ['total_games_started'])`
  — `db.query` (Objects and methods, below) called once, real and typed.
- `if (rows.isEmpty) { return 0; }` — `rows.isEmpty` is a real, already-
  familiar `List` property (Lesson 9, reappearing); `return 0;` handles
  the real, honest case where no real row has ever been written yet —
  this app's own very first real launch.
- `return rows.first['value'] as int;` — `rows.first` (Lesson 9,
  reappearing) reads the real, one matching row; `['value']` (Lesson 9,
  reappearing, the real index operator, this time on a `Map<String,
  Object?>` rather than a `List`) reads that row's real `value` column;
  `as int` is Dart's own real, already-familiar cast (Lesson 10,
  reappearing) — genuinely needed because `query`'s own real declared
  return type is `Object?` per column (SQLite itself is dynamically
  typed, Lesson 49, reappearing), not a real, specific Dart type.
- `Future<void> incrementTotalGamesStarted() async` — a real, ordinary
  async method returning nothing.
- `final current = await totalGamesStarted();` — a real, direct call to
  the method just above, reusing it rather than duplicating its own real
  query logic.
- `db.insert('settings', {'key': 'total_games_started', 'value': current + 1}, conflictAlgorithm: ConflictAlgorithm.replace)`
  — `db.insert` (Objects and methods, below) called once; `{'key': ...,
  'value': ...}` is a real Dart `Map` literal (Lesson 9, reappearing),
  its own two real keys matching `settings`'s own real column names
  exactly (Lesson 49, reappearing); `current + 1` is real, ordinary
  integer arithmetic (Lesson 6, reappearing); `conflictAlgorithm:
  ConflictAlgorithm.replace` (Objects and methods, below) is a real,
  named argument choosing what happens the second and every later real
  time this exact real `key` already exists.

> **`Database.insert` / `Database.query`**
> - *What it is:* two real, typed, higher-level instance methods on
>   `DatabaseExecutor`, sitting above `execute`'s own raw-SQL layer
>   (Concept Unit 5).
> - *Implementation:* real, fetched source, this session
>   (`sqflite_common-2.5.11/lib/sqlite_api.dart`): `Future<int>
>   insert(String table, Map<String, Object?> values, {String?
>   nullColumnHack, ConflictAlgorithm? conflictAlgorithm});` — returns
>   the real, new row's own real id; `Future<List<Map<String, Object?>>>
>   query(String table, {bool? distinct, List<String>? columns, String?
>   where, List<Object?>? whereArgs, ...});` — returns every real
>   matching row, each as a real `Map` from real column name to real
>   value.
> - *Its use:* `totalGamesStarted`/`incrementTotalGamesStarted` use these
>   instead of `execute` specifically to avoid ever building a raw SQL
>   string containing a real, untrusted value directly — `whereArgs`/the
>   `values` map keep every real value real and separate from the real
>   SQL text itself.
> - *Type:* two instance methods on a real interface
>   (`DatabaseExecutor`).
> - *Responsibility:* `insert`'s full charter: safely add or replace one
>   real row, given a real table name and a real column-to-value map,
>   real and never trusting a hand-built string; `query`'s full charter:
>   safely read matching real rows back, the same real way.
> - *Depends on:* a real, open `Database`; a real, existing table name;
>   real column names actually present in that table's own real shape.
> - *Connects to:* both are called only from inside `AppDatabase`'s own
>   two real methods — nothing else in this project reaches them
>   directly yet.
> - *Shape:* `Database`'s own real, public, typed surface — the layer
>   `_SessionStatusState` (Concept Unit 7) will actually call through,
>   never `execute` directly.

> **`ConflictAlgorithm`**
> - *What it is:* a real, external enum naming what `insert` does when a
>   new real row's own real primary key already exists.
> - *Implementation:* real values include `.replace` (overwrite the real,
>   existing row entirely), `.ignore` (silently keep the real, existing
>   row, discard the new one), `.abort`/`.fail`/`.rollback` (real,
>   different failure behaviors) — `.replace` is the one real value this
>   app's own code uses.
> - *Its use:* `incrementTotalGamesStarted` passes `.replace`, real and
>   deliberately, since `'total_games_started'` is meant to be
>   overwritten every real time, not preserved or rejected.
> - *Type:* an external, real enum.
> - *Responsibility:* naming one real, specific conflict-resolution
>   policy — nothing about detecting the real conflict itself, only what
>   to do once `insert` already has.
> - *Depends on:* nothing; a real, fixed set of real named values.
> - *Connects to:* passed as a real, named argument to `insert`,
>   nowhere else in this project.
> - *Shape:* a real, small, external vocabulary type — the same real
>   role `Difficulty`/`GameStatus` (Lessons 40/42, reappearing) play for
>   this project's own domain concepts, here supplied by the library
>   instead.

### CS Lens

Not repeated separately — **an upsert (insert-or-replace in one real
statement)** is this unit's own second hard concept, closely related to
Lesson 49's own already-treated `UNIQUE`/`PRIMARY KEY` constraints; its
own unrelated real recurrences (a cache's own `put` operation, a key-
value store's own `SET`, Redis's own `SET` command) are worth naming
once, briefly, without a full second multi-item list.

### SE Lens

The real principle is **typed helpers over hand-built SQL, at the exact
seam where real, untrusted values would otherwise enter a raw string**.
The alternative not chosen: `db.execute("INSERT OR REPLACE INTO settings
VALUES ('total_games_started', $current)")` — real, syntactically valid
SQL (`INSERT OR REPLACE`, SQLite's own real, alternate upsert syntax,
genuinely never taught in Lesson 49, which only covered standard SQL). The
real tradeoff: `insert`/`query` cost nothing extra to call here, for a
real, permanent structural guard against ever accidentally concatenating
a real, unescaped value into SQL text — a real class of bug (SQL
injection, real and serious in any app that ever stores real,
user-supplied text) this project has never had a real chance to
introduce, and now structurally can't, for this real class of operation.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — real, permanent proof, including a real
close-and-reopen persistence check, is Concept Unit 7's own real
subject.

### Connect

`AppDatabase` can now open itself correctly, create its own real shape,
and read and write one real, specific value safely. Concept Unit 7
reaches this class from a real, running widget for the first time, and
proves, for real, that the whole point of this lesson actually works.

---

## Concept Unit 7: A Real Widget Reaches Directly Into SQLite

### The Problem

`_SessionStatusState._gamesStarted` (Lesson 28) has always started at
`0` and lived only in memory — every real app restart has silently
erased it, this whole time. `AppDatabase` can now genuinely prevent
that, but nothing yet calls it from anywhere a real player would ever
see.

> **Socratic prompt:** `_SessionStatusState` already owns a real
> `Timer` directly (Lesson 28) rather than going through Riverpod
> (Lesson 38) — given that real precedent, and given curriculum's own
> stated real point for this exact lesson ("why does my game know about
> SQLite?"), would you expect `AppDatabase` to be wired in through a new
> Riverpod provider, or constructed directly, right here, inside
> `_SessionStatusState` itself? Second: `_startNewGame` currently updates
> `_gamesStarted` via a synchronous `setState`. Given
> `incrementTotalGamesStarted()` is genuinely asynchronous, what real
> choice does that force — wait for it before updating the real screen,
> or update the real screen first and let the real write finish in the
> background?

### Project Change

- **Reference Source:** `project/lib/features/sudoku/presentation/
  sudoku_app.dart`, `_SessionStatusState`, unchanged since Lesson 33
  (read fresh this session).
- **Files affected:** `project/lib/features/sudoku/presentation/
  sudoku_app.dart` — modified; `project/test/app_database_test.dart` —
  created; `project/test/main_smoke_test.dart`,
  `project/test/cell_selection_test.dart`,
  `project/test/number_pad_test.dart`, `project/test/layout_test.dart`,
  `project/test/session_status_test.dart`,
  `project/test/game_session_provider_test.dart`,
  `project/test/game_session_lifecycle_test.dart` — all seven modified,
  each now calling `useIsolatedTestDatabase()` (Concept Unit 4, already
  created there).
- **Change type:** add (production), add (one new test file),
  configure (seven existing test files).
- **Location:** `_SessionStatusState`'s own `initState`/`_startNewGame`.
- **Dependencies:** every earlier Concept Unit in this lesson.

### The New Code

```dart
final AppDatabase _db = AppDatabase();

@override
void initState() {
  super.initState();
  _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
    setState(() {
      _elapsedSeconds++;
    });
  });
  _loadGamesStarted();
}

Future<void> _loadGamesStarted() async {
  final total = await _db.totalGamesStarted();
  if (!mounted) return;
  setState(() {
    _gamesStarted = total;
  });
}
```

### Updated Project

`_SessionStatusState`'s own real, complete class, every real line shown,
new lines marked:

```dart
 1  class _SessionStatusState extends State<_SessionStatus> {
 2    final AppDatabase _db = AppDatabase();                    // ← new
 3    int _gamesStarted = 0;
 4    int _elapsedSeconds = 0;
 5    Timer? _ticker;
 6
 7    @override
 8    void initState() {
 9      super.initState();
10     _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
11       setState(() {
12         _elapsedSeconds++;
13       });
14     });
15     _loadGamesStarted();                                     // ← new
16   }
17
18   Future<void> _loadGamesStarted() async {                   // ← new
19     final total = await _db.totalGamesStarted();              // ← new
20     if (!mounted) return;                                     // ← new
21     setState(() {                                             // ← new
22       _gamesStarted = total;                                  // ← new
23     });                                                       // ← new
24   }                                                           // ← new
25
26   @override
27   void dispose() {
28     _ticker?.cancel();
29     super.dispose();
30   }
31
32   void _startNewGame() {
33     setState(() {
34       _gamesStarted++;
35     });
36     _db.incrementTotalGamesStarted();                         // ← new
37   }
38
39   @override
40   Widget build(BuildContext context) {
41     return Column(
42       mainAxisSize: MainAxisSize.min,
43       children: [
44         Row(
45           mainAxisAlignment: MainAxisAlignment.center,
46           children: [
47             Text('Elapsed: $_elapsedSeconds s'),
48             const SizedBox(width: 16),
49             Text('Games started: $_gamesStarted'),
50           ],
51         ),
52         const SizedBox(height: 8),
53         ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game')),
54       ],
55     );
56   }
57 }
```

This class now does everything it did since Lesson 33 (a live elapsed-
time counter, a tap-to-increment button) **plus** two real, new things:
it real-loads its own starting count from disk the instant it's created,
and every real tap now genuinely persists, not just displays.

### Isolate and Discard

No separate throwaway lab — `AppDatabase` itself was already isolated
and proven, real and repeatedly, across Concept Units 3-6; wiring it
into an already-real, already-tested widget is this unit's own real
subject, not a new construct needing its own lab.

### Mechanical Walkthrough

- `final AppDatabase _db = AppDatabase();` — a real, ordinary field
  (Lesson 11, reappearing), constructed once per real
  `_SessionStatusState` — the real, deliberate, **naked** dependency
  this whole lesson's own SE lens keeps returning to: a presentation-
  layer widget directly constructing a concrete Infrastructure class,
  never through Riverpod (Lesson 38) the way `GameSession`/`Clock`
  already are.
- `_loadGamesStarted();` — called, real and deliberately un-awaited, as
  the real last line of `initState` — `initState` itself cannot be
  `async` (a real, existing Flutter constraint, already implicit since
  Lesson 28), so a real, separate async method is called instead and
  left to complete on its own.
- `Future<void> _loadGamesStarted() async` — a real, new, private async
  method (Lesson 8, reappearing — `void`'s own general meaning, applied
  here to a `Future`).
- `final total = await _db.totalGamesStarted();` — calls Concept Unit
  5's own real method, real and awaited this time (contrasting Concept
  Unit 3's own real, un-awaited, hanging discovery — this real `await`
  is exactly what a correctly-mocked `flutter test` run needs to
  actually resolve).
- `if (!mounted) return;` — `mounted` is a real, already-established
  `State` property (Lesson 28, reappearing) — real and false if this
  real widget was already disposed before this real async call finished;
  returning early avoids a real, would-be error calling `setState` on a
  real, already-gone widget.
- `setState(() { _gamesStarted = total; });` — `setState` (Lesson 28,
  reappearing) — the real, only place `_gamesStarted` gets set from a
  real, freshly-loaded value rather than incremented.
- `_db.incrementTotalGamesStarted();` — added inside `_startNewGame`,
  real and deliberately **not** `await`ed: the real, on-screen
  `_gamesStarted++` (already existing, Lesson 28) updates the real
  screen immediately; the real, persisted write happens in the real
  background, answering this unit's own second Socratic question
  directly — a real, deliberate optimistic-update choice, not an
  oversight.

### CS Lens

Not repeated separately — this unit's own real construct (a
presentation-layer class directly depending on a concrete Infrastructure
class) is the identical hard concept Lesson 41's own dependency-direction
material already gave full, real treatment to; here, real and for the
first time, that direction is deliberately violated, on purpose, as this
lesson's own central point.

### SE Lens

The real principle, stated as honestly as curriculum.md's own real
framing does: **a felt architectural problem teaches more than an
abstract warning about one**. The alternative not chosen: wire
`AppDatabase` through a new Riverpod provider right now, the same real
shape `Clock`/`PuzzleRepository` already use — genuinely *more*
correct, by every real standard Lessons 39-44 already established, and
deliberately **not done here anyway**. The real, honest cost, paid on
purpose: `_SessionStatusState` cannot be real-unit-tested against a real,
fake in-memory `AppDatabase` the way `GameSessionNotifier` can against a
fake `Clock` — every real test touching it needs the real, heavier
`useIsolatedTestDatabase()` machinery (Concept Unit 4) instead of a
simple constructor-injected fake. This real, felt cost — not an abstract
warning — is exactly what curriculum's own real vision for this phase
names as the actual motivation for Lesson 53's future `ScoreRepository`;
building it before this cost was real and felt would have taught the
pattern without the reason for it.

### Commands Needed

None new.

### Run It

Real, permanent test, `project/test/app_database_test.dart`, real and
run this session, all three checks against `AppDatabase` directly
(reusing `useIsolatedTestDatabase()`, Concept Unit 4):

```dart
test('a real, fresh database reports zero real games started', () async {
  final db = AppDatabase();
  expect(await db.totalGamesStarted(), 0);
  await db.close();
});

test('a real, second AppDatabase reads back what the first one really wrote, after a real close', () async {
  final first = AppDatabase();
  await first.incrementTotalGamesStarted();
  await first.incrementTotalGamesStarted();
  await first.incrementTotalGamesStarted();
  await first.close();

  final second = AppDatabase();
  expect(await second.totalGamesStarted(), 3);
  await second.close();
});
```

Real, captured output: `flutter analyze .` — 34 issues, same
pre-existing `avoid_print`/`avoid_relative_lib_imports` categories, zero
new categories, zero errors; `flutter test` — 25 real test-file-level
checks, `All tests passed!`, confirmed clean across three consecutive
full runs this session. No real, live device or desktop app run this
session — no real Android device was connected (confirmed via a real
`flutter devices` check), and `flutter run -d windows` remains a real,
unresolved build failure since Lesson 26; the real, permanent
`app_database_test.dart` — proving a real, second `AppDatabase`
instance, opened only after the first's real `close()`, reads back
exactly what was written — stands in as this lesson's own strongest real
evidence, arguably more direct than a screenshot could ever be for this
specific real claim (data surviving a restart), the same real precedent
Lesson 29 already established for measured evidence over a picture.

### Connect

`_gamesStarted` now genuinely survives whatever a real screenshot could
never prove on its own: a real close, and a real reopen, of the exact
same real file.

---

## Connect the Pieces

Two real, new packages (`sqflite`, `sqflite_common_ffi`) gave this app
two real, swappable database backends; four real lines inside
`AppDatabase._open()` chose the right one, for real, based on the real,
running platform (Concept Units 1-2). `path_provider` and `package:path`
found this app's own real, correct, per-platform file location — not
before a real, serious discovery: the identical real call that fails
loudly under a plain `test()` hangs silently forever under
`testWidgets()` (Concept Unit 3), fixed with a real, throwaway
`PathProviderPlatform` mock that became this project's own permanent
`database_test_support.dart` (Concept Unit 4). `openDatabase`'s own
real `version`/`onCreate` contract created `settings` — Lesson 49's own
real `CREATE TABLE` syntax, run for the first time through Dart instead
of a CLI (Concept Unit 5) — and `insert`/`query` read and wrote one
real value through it safely, without ever hand-building a SQL string
(Concept Unit 6). Finally, `_SessionStatusState` reached directly into
`AppDatabase` — a real, deliberate, un-abstracted rough edge, not an
oversight — and a real, permanent test proved the actual, whole point of
this entire lesson: close one `AppDatabase`, open a genuinely new one
against the identical real file, and read back exactly what the first
one wrote (Concept Unit 7). Lesson 51 designs this project's own real,
complete relational schema; Lesson 53 is where this lesson's own
deliberately naked `AppDatabase` dependency finally gets the same real
repository treatment `Clock`/`PuzzleRepository` already have.
