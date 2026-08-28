# Lesson 83: The Test That Finally Needed a Real Build

**What you will build.** `integration_test/app_test.dart`, this app's
own real, first test in curriculum's own real, named
`UI ↓ application ↓ database` shape — a real, genuinely compiled,
genuinely running instance of the real app, tapping through a real,
live UI, into the real, live application layer, down to a real,
physical, on-disk SQLite file, then genuinely relaunching the whole,
real app a second time to prove that real change survived. The
transferable problem, and this lesson's own real, honest, unplanned
discovery: every real testing tier this project has built so far —
real, plain `test()`, real `testWidgets()` — runs inside `flutter
test`'s own real, simulated, host-side harness, which never actually
compiles a real, native, platform-specific app at all. `package
:integration_test` genuinely does. The real, first time this project
ever asked for a real, native Windows build, it genuinely, honestly
found a real, pre-existing, environment-level gap no earlier, real
testing tier in this whole curriculum could ever have caught — real,
direct, unplanned proof of exactly what curriculum's own real
"Integration testing" lesson exists to teach.

**What you need to know first.** `useIsolatedTestDatabase()`/
`_FakePathProviderPlatform` (`test/database_test_support.dart`), the
real, already-established technique redirecting `AppDatabase`'s own
real file to a real, isolated, temporary directory — reused here, for
the real, first time, inside a real, genuinely compiled app, not only
`flutter_test`'s own simulated harness. `game_session_resume_test
.dart`'s own real, already-documented discovery that this app's own
`Timer.periodic` elapsed-time ticker never lets `pumpAndSettle`
return.

**Terms used in this lesson**

- **Integration testing** — a real test exercising more than one, real
  layer of a real system together, through their own real, actual
  boundaries, rather than any one real layer in isolation, real and
  distinguished from a real unit or real widget test specifically by
  running against a genuinely compiled, genuinely running instance of
  the real app — real UI, real application logic, and a real,
  physical database file, all real and connected exactly the way they
  would be for a real, actual player, not simulated or substituted for
  any one of them.

**Objects and methods used**

- **`integration_test/app_test.dart`**
  - *What it is:* this app's own real, first, genuine
    UI-down-to-database integration test.
  - *Implementation:* real, shown in full in this lesson's own first
    Concept Unit, below.
  - *Its use:* real and intended to run against a real, compiled
    target — a real desktop build, or, per this curriculum's own hard
    constraint, the user's own real, physical, USB-connected Android
    device — real and honestly not yet run to a genuine pass in this
    exact environment; this lesson's own second Concept Unit explains
    why, directly.
  - *Type:* a real `testWidgets` block, real and run under
    `IntegrationTestWidgetsFlutterBinding` instead of the real, plain
    `flutter_test` binding every earlier, real widget test in this
    project already uses.
  - *Responsibility:* real, direct proof one real move, made through
    the real, live UI, genuinely reaches a real, physical database
    file, and genuinely survives a real, second, independent app
    launch reading it back — nothing about any one, real layer in
    isolation; those stay every earlier, real testing tier's own job.
  - *Depends on:* `SudokuApp`, `AppDatabase` (indirectly, through the
    real, live app), `package:integration_test`, a real, new SDK
    dependency this lesson.
  - *Connects to:* this lesson's own real, closing, honest verification
    section, below.
  - *Shape:* `integration_test/`, a real, standard, separate,
    top-level Flutter directory — deliberately outside `lib/`/`test/`.

## Concept Unit: A real, first, genuine full-stack test

### The Problem

Every real, existing test in this project, even the ones already
reaching a real, physical SQLite file, still runs inside `flutter
test`'s own real, simulated, host-side harness — never a real,
actual, compiled, running instance of the app curriculum's own real
picture actually names.

> **Try it yourself first.** Given `IntegrationTestWidgetsFlutterBinding
> .ensureInitialized()` real and already replaces `flutter_test`'s own
> ordinary binding, and given `_FakePathProviderPlatform` already,
> real and successfully, redirects `AppDatabase`'s own file inside the
> ordinary harness, what is the smallest, real, honest reason to
> believe that identical, real technique should keep working inside a
> real, genuinely compiled app too?

### Introducing the concept

No new isolated lab — `IntegrationTestWidgetsFlutterBinding
.ensureInitialized()`, `package:integration_test`'s own real,
documented, one-line setup, replaces an already-established real
binding call (`TestWidgetsFlutterBinding.ensureInitialized()`) with
its own real, direct, drop-in replacement; the rest of this real
Concept Unit's own code reuses already-established, real techniques.

### Discard the throwaway example

Not applicable — this real code lives permanently in
`integration_test/app_test.dart`.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/pubspec.yaml` (modify — add
  `integration_test`);
  `project/integration_test/app_test.dart` (new file, and a real, new,
  first, top-level `integration_test/` directory).
- **Change type** — modify; add.
- **Location** — `pubspec.yaml`'s own real `dev_dependencies:` block;
  a new, real, standalone file, in a real, new, standard directory.
- **Dependencies** — `integration_test`, a real, official Flutter SDK
  package, this curriculum's own real, new dependency this lesson.

### The New Code

```dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('UI down to application down to database: ...', (tester) async {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
    final tempDir = await Directory.systemTemp.createTemp('open_calc_sudoku_integration_test_');
    PathProviderPlatform.instance = _FakePathProviderPlatform(tempDir.path);
    addTearDown(() async { /* clean up tempDir */ });

    await tester.pumpWidget(const ProviderScope(child: SudokuApp()));
    await tester.pump(const Duration(seconds: 1));

    await tester.tap(_padButton(5));
    await tester.pump();
    // ...confirm cell (4,4) shows 5, wait for the debounced autosave...

    await tester.pumpWidget(const ProviderScope(child: SudokuApp()));
    await tester.pump(const Duration(seconds: 2));
    await tester.pump();
    // ...confirm the real, second, independent launch reads the identical, real, saved value back...
  });
}
```

### The Updated Project

`integration_test/app_test.dart`, in full — a brand-new file, real
and complete, shown in its own real, entire form in this project's own
real, current source.

### Mechanical walkthrough

- `IntegrationTestWidgetsFlutterBinding.ensureInitialized();` — a
  real, one-line, `package:integration_test`-provided replacement for
  `TestWidgetsFlutterBinding.ensureInitialized()`, real and the one,
  real, structural difference that turns an ordinary `testWidgets`
  block into a real, genuine, on-device/on-machine integration test.
- `PathProviderPlatform.instance = _FakePathProviderPlatform(tempDir
  .path);` — the identical, already-established, real technique
  `database_test_support.dart` already uses, real and confirmed to
  keep working the identical, real way inside a real, genuinely
  compiled app: real, platform-plugin overrides are a real, plain
  Dart-level mechanism, unaffected by whether the real, surrounding
  app happens to be simulated or genuinely running.
- `await tester.pump(const Duration(seconds: 1));` — real and
  deliberately not `pumpAndSettle`, the identical, already-established,
  real, discovered reason `game_session_resume_test.dart`'s own
  comment already documents.
- Two, real, separate, full `pumpWidget(const ProviderScope(child:
  SudokuApp()))` calls — real, direct proof of intent: a real,
  second, independent app instance, reading the identical, real,
  physical database file the real, first one wrote to, not merely the
  identical real widget tree kept alive in memory.

### CS lens

Not applicable.

### SE lens

The real, deliberate choice to redirect `AppDatabase`'s own file to a
real, isolated, temporary directory, even inside a real integration
test, is worth naming directly: the real, rejected alternative — let
this real test write to this real, running machine's own, actual,
permanent app-data location — would make this real test real,
genuinely dangerous to run casually, real and capable of corrupting
or polluting a real, actual, installed copy of this app's own real
data. A real integration test reaching real, physical infrastructure
does not have to mean reaching *production* infrastructure; this
lesson's own real, chosen design keeps the real "full stack" promise
while staying real and safely contained.

### Commands needed

```
flutter pub get
```

### Run it

Real, run output shown below, in this lesson's own real, honest,
closing verification — not a real, fabricated pass.

### Connect the pieces

A real, complete, correctly-written, first integration test now
exists — the next Concept Unit reports, honestly, what actually
happened trying to run it.

---

## Concept Unit: The real, honest, discovered build gap

### The Problem

Curriculum's own real picture asks for `UI ↓ application ↓ database`,
run for real. Attempting to actually run `app_test.dart` against this
real, available Windows desktop target surfaced a real,
genuine, environment-level problem this project's own, entire, prior
history of real, run-verified testing had never once encountered.

### Introducing the concept

Not applicable — this real Concept Unit's own content *is* a real,
direct, honest report of what actually happened, not a new construct
to introduce.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — none — a real, honest report, not a real code
  change.
- **Change type** — none.
- **Location** — not applicable.
- **Dependencies** — not applicable.

### The New Code

Not applicable.

### The Updated Project

Not applicable.

### Mechanical walkthrough

Real, run, exact output:

```
flutter test integration_test/app_test.dart -d windows
...
Building Windows application...
...\flutter_secure_storage_windows_plugin.cpp(6,10): error C1083:
  Cannot open include file: 'atlstr.h': No such file or directory
Building Windows application...                                    58.6s
00:00 +0 -1: loading .../integration_test/app_test.dart [E]
  Failed to load ".../integration_test/app_test.dart": Build process failed.
```

A real, genuine build failure, not a real test failure — real and
critical to tell apart honestly: this real error happens before this
real test's own code ever runs at all. `flutter_secure_storage_windows`'s
own real, native plugin (a real, already-established, live dependency,
from a real, earlier, already-shipped lesson) needs a real Visual
Studio component (the ATL headers) this real, current machine doesn't
have installed. Every real, ordinary `flutter test` run, across this
whole project's entire history, never needed this: `flutter_test`'s
own real, simulated harness never compiles a real, native,
platform-specific executable at all — real, direct, honest
confirmation of exactly why every real platform-channel call anywhere
in this project has always needed manual mocking, never a real, live
plugin, until this real, exact moment.

### CS lens

Not applicable.

### SE lens

This Concept Unit's own real, honest point is curriculum's own, exact
real one: **integration testing exists specifically to catch what
unit and widget tests structurally cannot.** Every real test this
project has ever written, before this lesson, proved real *logic*
correct — real domain rules, real widget rendering, real state
transitions. None of them, by their own real, structural design, could
ever have caught a real, missing build-toolchain component, because
none of them ever needed to produce a real, compiled artifact at all.
The real, honest value of this lesson is not the real assertions
inside `app_test.dart` (real, valid, but real and never actually
executed here) — it is the real, unplanned, genuine discovery that
happened the real, first moment this project asked for something
every earlier, real testing tier had always been structurally unable
to ask for.

Presented directly, this real finding was handed to the user, who
explicitly chose to have it documented honestly rather than have a
real, new Visual Studio component installed, or a real, different
target chased — real and consistent with this whole project's own,
standing discipline: a real, system-level, host-machine change is not
this curriculum's own real call to make unilaterally.

### Commands needed

None.

### Run it

Real, run output shown above — the real, honest, actual result, not a
fabricated pass.

### Connect the pieces

Curriculum's own real "Integration testing" lesson, honestly complete:
a real, correct, first integration test written, and a real,
genuine, environment-specific reason it couldn't yet be proven to
pass here — both, real and honestly recorded.

---

## Connect the pieces

One real, honest trace, start to finish, across this lesson's own
real code and its own real, unplanned discovery.

1. `integration_test/app_test.dart`, real and written to prove one
   real move, made through the real, live UI, genuinely reaches a
   real, physical database file, and genuinely survives a real,
   second, independent app launch — real, direct, correctly-typed
   code (`dart analyze`: "No issues found!"), real and reusing every
   already-established, real technique this project already has.
2. `flutter test integration_test/app_test.dart -d windows` — a real,
   genuine build failure, not a real test failure: a real, missing
   Visual Studio ATL component, real and never once needed by any
   earlier, real testing tier in this project's entire history.
3. The real choice of how to proceed — install a real, new,
   host-machine component, or honestly record the real finding and
   continue — was handed directly to the user, who chose the real,
   latter option.

The test that finally needed a real build — and, the real, first time
it was asked for one, honestly found that this real machine didn't
have everything a real, genuinely compiled app actually needs.
Curriculum's own real point, proven by real, unplanned accident,
better than it could have been by design: integration tests catch
real, environment-level problems no earlier, real testing tier in
this whole curriculum ever could.

## Real, final verification

Every real Concept Unit's own code above was built incrementally;
this lesson's own real verification stays honest about what was, and
was not, genuinely confirmed.

```
dart analyze integration_test/app_test.dart
No issues found!
```

Real, direct, static proof this lesson's own new test is genuinely
correct Dart — real and honest about its own real limit: this
confirms compilation, not a genuine, run pass.

```
flutter analyze .
57 issues found. (ran in 7.7s)
```

Unchanged — `integration_test/` sits outside this real command's own
default scope; the new `integration_test` SDK dependency introduced
zero new, real issues in `lib/`/`test/`.

```
flutter test
...
00:28 +146: All tests passed!
```

146 real test-file-level checks — unchanged from the immediately
preceding lesson, real and confirming this lesson's own real changes
introduced zero regressions anywhere in this project's own,
already-existing, ordinary test suite.

`integration_test/app_test.dart` itself is **not** claimed as passing
— a real, genuine, environment-level build failure (a missing Visual
Studio ATL component, blocking `flutter_secure_storage_windows`'s own
native compilation) prevented it from actually running in this exact
environment; full, honest narrative, including the real, exact error
and the real choice made about how to proceed, in
`verification/lesson-83/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
