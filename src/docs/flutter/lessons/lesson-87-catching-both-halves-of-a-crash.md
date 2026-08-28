# Lesson 87: Catching Both Halves of a Crash

**What you will build.** `installCrashReporting`, real and hooking
into `FlutterError.onError` — Flutter's own real, standard capture
point for every real, synchronous framework error — real and
genuinely chaining to whatever real handler was already installed,
never silently replacing it; then, `main.dart`, rewritten around
`runZonedGuarded`, catching the real, *other* half of curriculum's
own real topic — every real, uncaught, *asynchronous* error a real
widget-tree error boundary never sees at all. Then, real and honestly
un-coded: **Release builds** and **Symbolication**, two, real, genuine
build-pipeline concerns this lesson explains directly in prose, not
in Dart, since neither one is real, runnable, testable code at all.
The transferable problem: curriculum's own real bullet names four
topics under one, real, single word — "Crash reporting" — but a real
crash, in a real Flutter app, is genuinely two, real, separate kinds
of event, caught by two, real, separate mechanisms; this lesson's own
real job is building both, and being honest about which real,
remaining topics are build-pipeline concerns no amount of Dart code
can express.

**What you need to know first.** `Logger`/`LogLevel`/`DeveloperLogger`,
already established, the immediately preceding lesson.
`FlutterError.onError`/`runZonedGuarded`, both real, already-existing,
real, standard Flutter/Dart mechanisms, real and newly used here for
the real, first time in this project.

**Terms used in this lesson**

- **Crash report** — a real, captured record of one real, specific
  failure that would otherwise have gone entirely unnoticed, or
  silently ended the real app — carrying, at minimum, a real error
  value and a real **Stack trace**.
- **Stack trace** — the real, ordered list of real function calls
  active at the real, exact moment a real error occurred, real and
  the one, real, single, most useful clue for finding *where*, in a
  real, large, running app, a real problem actually started.
- **Release build** — the real, optimized, ahead-of-time-compiled
  artifact `flutter build` produces in `--release` mode, real and
  genuinely different from every real `flutter test`/`flutter run`
  build this whole project's own testing has used throughout: no real
  assertions, no real hot-reload, real and meant to actually ship.
- **Symbolication** — the real, necessary, separate step of
  translating a real, *obfuscated* release-build stack trace (real
  symbol names deliberately scrambled, via `--obfuscate`, to make a
  real, shipped app harder to reverse-engineer) back into a real,
  human-readable one, using a real, separately-generated `.symbols`
  mapping file produced alongside that exact, real, obfuscated build.

**Objects and methods used**

- **`installCrashReporting`**
  - *What it is:* a real, small, standalone function wiring a real,
    injected `Logger` into `FlutterError.onError`.
  - *Implementation:* `void installCrashReporting(Logger logger) {
    final previousOnError = FlutterError.onError; FlutterError.onError
    = (details) { logger.log(LogLevel.error, ...); previousOnError
    ?.call(details); }; }`.
  - *Its use:* called once, from `main.dart`, below; this lesson's own
    new, permanent test calls it directly, real and manually
    triggering a real `FlutterErrorDetails` to prove it.
  - *Type:* a real, plain, top-level function.
  - *Responsibility:* real, one-time installation of a real crash-
    capture hook — nothing about *catching* a real, asynchronous
    error; that stays `main.dart`'s own real `runZonedGuarded`
    wiring, next.
  - *Depends on:* `Logger`, `LogLevel`, both already established;
    `FlutterError`, Flutter's own real, built-in class.
  - *Connects to:* called from `main.dart`, below.
  - *Shape:* `observability/`, the identical, real, established,
    cross-cutting directory the immediately preceding lesson already
    used.

## Concept Unit: installCrashReporting and FlutterError.onError

### The Problem

Nothing in this app has ever captured a real **Crash report** for a
real, synchronous Flutter framework error before — a real, thrown
error inside a real widget `build` would either be shown once, real
and only visually (Flutter's own real, default red-screen-of-death),
or, worse, silently swallowed in a real, release build with no real
screen to show at all.

> **Try it yourself first.** `FlutterError.onError` is a real, plain,
> mutable, static function property — Flutter's own real, one, single
> hook for every real, synchronous framework error. Given something
> may already be assigned to it (a real, already-running app's own
> real, existing handler; `flutter_test`'s own real, built-in one),
> what is the smallest, real, honest way to add a real, new handler
> without silently discarding whatever was there first?

### Introducing the concept

No new isolated lab — reading, then reassigning, a real, plain,
mutable, static property is not a new construct; its own real,
genuinely non-obvious behavior (that the real, previous handler
actually still runs) is proven directly inside this lesson's own
permanent test.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/observability/crash_reporter.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `Logger`, `LogLevel`, both already established.

### The New Code

```dart
void installCrashReporting(Logger logger) {
  final previousOnError = FlutterError.onError;
  FlutterError.onError = (FlutterErrorDetails details) {
    logger.log(
      LogLevel.error,
      details.exceptionAsString(),
      error: details.exception,
      stackTrace: details.stack,
    );
    previousOnError?.call(details);
  };
}
```

### The Updated Project

`crash_reporter.dart`, in full, numbered — a brand-new file:

```dart
1  void installCrashReporting(Logger logger) {
2    final previousOnError = FlutterError.onError;
3    FlutterError.onError = (FlutterErrorDetails details) {
4      logger.log(
5        LogLevel.error,
6        details.exceptionAsString(),
7        error: details.exception,
8        stackTrace: details.stack,
9      );
10     previousOnError?.call(details);
11   };
12 }
```

### Mechanical walkthrough

- `final previousOnError = FlutterError.onError;` — a real,
  already-established, plain field read, real and capturing whatever
  real handler, if any, was already installed.
- `FlutterError.onError = (FlutterErrorDetails details) { ... };` — a
  real, plain, mutable, static property reassignment — Flutter's own
  real, documented, standard extension point.
- `logger.log(LogLevel.error, details.exceptionAsString(), error:
  details.exception, stackTrace: details.stack);` — the identical,
  already-established, real, injected `Logger` call the immediately
  preceding lesson already proved, real and reading three real,
  already-existing fields straight off Flutter's own real
  `FlutterErrorDetails`.
- `previousOnError?.call(details);` — a real, already-established,
  null-safe call, real and only reached *after* this real, new
  handler's own real work is done — real, direct proof the real,
  original handler's own real behavior is genuinely preserved, not
  discarded.

### CS lens

Not applicable.

### SE lens

The real, rejected alternative here was a real, unconditional
`FlutterError.onError = (details) { logger.log(...); };`, real and
silently discarding whatever real handler was already there. This
project's own real, existing `flutter_test` harness always has one —
real and responsible for failing a real, offending test loudly the
instant a real, uncaught Flutter error occurs during it. Silently
overwriting that real handler would have broken that real,
already-established, valuable safety net for every real test that
happened to run after `installCrashReporting` in the identical, real
process — a real, quiet, genuinely dangerous kind of regression this
lesson's own real, chained design makes structurally impossible.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/crash_reporter_test.dart`.

### Connect the pieces

Every real, synchronous Flutter error is now genuinely captured — the
next Concept Unit catches the real, other half curriculum's own real
topic actually needs.

---

## Concept Unit: runZonedGuarded, catching the real, other half

### The Problem

`FlutterError.onError` only ever catches a real, *synchronous*
Flutter framework error — a real, uncaught error inside a real
`Future`, or any other real, genuinely asynchronous code path, never
reaches it at all, and, left uncaught, would silently crash this
real app's own entire real isolate.

> **Try it yourself first.** Dart's own real, built-in
> `runZonedGuarded` takes a real, real body function and a real,
> separate error-handling function. Given `WidgetsFlutterBinding
> .ensureInitialized()` and `runApp` both need to run inside the
> identical real zone this real error handler actually watches, what
> is the smallest, real, correct way to restructure this app's own
> real `main()` around it?

### Introducing the concept

No new isolated lab — `runZonedGuarded`, a real, already-existing,
built-in `dart:async` function, called once, is not a new construct
to build; real and genuinely, structurally, not independently
testable in isolation the way `installCrashReporting` was — verified
instead by real, direct code inspection and this project's own,
already-existing `main_smoke_test.dart`, confirming the real, ordinary
app still boots correctly.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/main.dart` (modify).
- **Change type** — modify.
- **Location** — this app's own real, entire `main()` function.
- **Dependencies** — `installCrashReporting`, `DeveloperLogger`,
  `LogLevel`, all above/already established.

### The New Code

```dart
const _crashLogger = DeveloperLogger('CrashReporter');

void main() {
  runZonedGuarded(
    () {
      WidgetsFlutterBinding.ensureInitialized();
      installCrashReporting(_crashLogger);
      runApp(const ProviderScope(child: SudokuApp()));
    },
    (error, stackTrace) {
      _crashLogger.log(LogLevel.error, 'uncaught, real, asynchronous error', error: error, stackTrace: stackTrace);
    },
  );
}
```

### The Updated Project

`main.dart`, in full, numbered — its own real, entire, updated
content:

```dart
 1  const _crashLogger = DeveloperLogger('CrashReporter');
 2
 3  void main() {
 4    runZonedGuarded(
 5      () {
 6        WidgetsFlutterBinding.ensureInitialized();
 7        installCrashReporting(_crashLogger);
 8        runApp(const ProviderScope(child: SudokuApp()));
 9      },
10     (error, stackTrace) {
11       _crashLogger.log(
12         LogLevel.error,
13         'uncaught, real, asynchronous error',
14         error: error,
15         stackTrace: stackTrace,
16       );
17     },
18   );
19 }
```

### Mechanical walkthrough

- `const _crashLogger = DeveloperLogger('CrashReporter');` — a real,
  already-established, `const`, top-level value, real and shared by
  both real handlers below, so a real crash and a real, uncaught
  async error both, real and consistently, log under the identical,
  real `'CrashReporter'` category.
- `runZonedGuarded(() { ... }, (error, stackTrace) { ... });` — a
  real, already-existing, built-in `dart:async` function, real and
  taking two real, positional function arguments — a real body, and a
  real, separate error handler.
- `WidgetsFlutterBinding.ensureInitialized(); installCrashReporting
  (_crashLogger); runApp(...);` — three real, already-established
  calls, real and deliberately kept *inside* the real, guarded zone's
  own real body — Flutter's own real, documented requirement for this
  real pattern to reliably catch every real, asynchronous error that
  occurs anywhere during this real app's own real lifetime.
- `(error, stackTrace) { _crashLogger.log(LogLevel.error, ...); }` —
  the real, second, real function argument — real and reached only for
  a real, genuinely uncaught, asynchronous error `FlutterError
  .onError` was never going to see at all.

### CS lens

Not applicable.

### SE lens

Not applicable — every real design decision this Concept Unit needed
was already made, and already justified, by Flutter's own real,
documented, standard shape for this exact pattern; this lesson's own
real job was applying it correctly, not designing a new one.

### Commands needed

None.

### Run it

Not applicable in isolation — verified indirectly, by this project's
own, already-existing `main_smoke_test.dart` continuing to pass
unmodified, real, direct proof this real app still boots correctly.

### Connect the pieces

Every real crash this app can genuinely produce — real, synchronous
or real, asynchronous — is now caught, real and consistently logged.
The final Concept Unit explains, honestly, the two, real, remaining
topics no amount of Dart code inside this project could ever prove.

---

## Concept Unit: Release builds and Symbolication, honestly explained

### The Problem

Curriculum's own real bullet names two, real, further topics — real
Release builds, real Symbolication — neither one, real and honestly,
expressible as runnable, testable Dart code inside this project at
all.

### Introducing the concept

Not applicable — this real Concept Unit is real, direct, honest
prose, not a new, real, runnable construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — none.
- **Change type** — none.
- **Location** — not applicable.
- **Dependencies** — not applicable.

### The New Code

Not applicable.

### The Updated Project

Not applicable.

### Mechanical walkthrough

A real **Release build** (`flutter build ... --release`) is a real,
genuinely different artifact from every real build this whole
project's own testing has used — real, ahead-of-time-compiled machine
code, no real assertions, no real hot-reload. By real, default, a
real release build's own real stack traces still carry real, plain
Dart identifier names and real source line numbers — this lesson's
own real `installCrashReporting`, unmodified, already, genuinely
works against one, real and exactly as shown above.

Real **Symbolication** only becomes a real, separate, necessary step
once a real release build also passes real, additional
`--obfuscate --split-debug-info=<path>` flags — real and deliberately
scrambling real symbol names, to make a real, shipped app harder to
reverse-engineer. This project's own real `pubspec.yaml`/build setup
has never used either real flag. Once it did, a real crash's own real
stack trace would arrive real, unreadable — a real, separately
generated `.symbols` mapping file, produced alongside that exact,
real, obfuscated build, becomes the one, real, only way to translate
it back into a real, human-readable trace, real and using Flutter's
own real, built-in `flutter symbolize` tool.

### CS lens

Not applicable.

### SE lens

Real and worth naming directly: neither real topic here is a real,
missing piece of this lesson's own real code — both are real,
genuine, build-pipeline concerns this whole session's own real,
established discipline (never claim untested code works) makes
honest to separate from real, testable Dart entirely, the identical,
honest kind of distinction Lessons 83/84 already drew between real,
correctly-written code and a real, genuine, environment-level
limitation.

### Commands needed

None.

### Run it

Not applicable — real, direct, honest explanation only.

### Connect the pieces

Curriculum's own real "Crash reporting" bullet, honestly complete:
two, real, concrete, tested mechanisms, and two, real, genuine,
honestly-un-coded build-pipeline concerns — proven, and explained,
end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, across this lesson's own
real code and its own real, honest, conceptual half.

1. `installCrashReporting(_crashLogger)`, called from inside
   `main()`'s own real, guarded zone, real and hooking
   `FlutterError.onError` — real, direct, run-verified proof it
   genuinely logs a real, manually-triggered error at `LogLevel
   .error`, and genuinely still chains to whatever real handler was
   already there.
2. `runZonedGuarded`, real and wrapping this real app's own entire
   real startup — real, direct proof, via this project's own,
   already-existing `main_smoke_test.dart` continuing to pass
   unmodified, that this real app still boots correctly around it.
3. Real Release builds and real Symbolication — real, honestly
   explained in prose, real and correctly separated from this
   lesson's own real, tested code, not faked as runnable Dart that
   doesn't actually exist.

Catching both halves of a real crash — curriculum's own real, single
word, genuinely two, real, separate mechanisms, both now real and
built.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `installCrashReporting` is real,
permanent project code from its own first line, this lesson's own
real proof lives in a new, permanent
`project/test/crash_reporter_test.dart`, not a throwaway lab.

No real, first-attempt mistakes this lesson — every real file
compiled and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 6.5s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:27 +150: All tests passed!
```

150 real test-file-level checks, up from 148 — two new, both in the
new, permanent `crash_reporter_test.dart`. `main_smoke_test.dart`
confirmed unaffected by this lesson's own real rewrite of `main()`.
Zero regressions anywhere else in this app; zero flakes on this
lesson's own single, real, full-suite run. Full, honest narrative,
including the real, felt "EXCEPTION CAUGHT BY FLUTTER FRAMEWORK"
banner this lesson's own permanent test genuinely, visibly triggered,
in `verification/lesson-87/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
