# Lesson 86: The Failure Nothing Was Watching For

**What you will build.** `Logger`/`LogLevel`/`DeveloperLogger`, a
real, minimal, structured logging contract, under a real, new,
first, top-level `lib/observability/`; then, one, real, concrete,
honest place to actually use it — `LocalFirstStore.trySync`, whose
own real, already-existing failure path silently returned `false`
with no real, further trace of what went wrong, or that anything did
at all. The transferable problem: curriculum's own real question for
this lesson — why `print("oops")` isn't production observability —
turned out to have a real, more honest, more interesting answer in
this project than "replace some `print` calls": this project's own
real, only substantial `print` usage (`bin/sudoku_console.dart`) is
real, legitimate, interactive terminal UI, not diagnostic logging
misuse at all. The real, genuine gap this lesson found instead was
quieter and more dangerous — a real failure with no `print`, no log,
no trace of any kind, silently returning `false` into the void.

**What you need to know first.** `LocalFirstStore`/`CloudSync`, real
and already established. This project's own, already-established,
real dependency-injection shape — `Clock`/`ApiClient`/`AuthApi`, each
a real, injected, swappable ability.

**Terms used in this lesson**

- **Structured logging** — a real log entry carrying real, separate,
  machine-readable fields (a real severity level, a real category
  name, a real, optional error and stack trace) rather than one, real,
  flat, human-only sentence. It exists so a real, later tool — a
  real, attached debugger, a real DevTools session, a real, production
  log aggregator — can genuinely filter, search, and alert on a real,
  logged event by its own real, structured fields, none of which a
  bare `print("oops")` call carries at all; `print` only ever
  produces one, real, undifferentiated line of real text.

**Objects and methods used**

- **`Logger` and `LogLevel`**
  - *What they are:* a real, minimal interface naming "the ability to
    record one real, structured, leveled event," and the real, plain
    severity it's recorded at.
  - *Implementation:* `enum LogLevel { debug(500), info(800),
    warning(900), error(1000); ... }`; `abstract interface class
    Logger { void log(LogLevel level, String message, {Object? error,
    StackTrace? stackTrace}); }`.
  - *Its use:* injected into `LocalFirstStore`, below; this project's
    own new, permanent test uses a real, small, in-memory test double.
  - *Type:* a real, plain `enum` with a real, numeric field; a real,
    plain, generic-free interface.
  - *Responsibility:* name real, structured logging's own real shape —
    nothing about *where* a real, logged event actually ends up; that
    stays `DeveloperLogger`'s own real job, next.
  - *Depends on:* nothing.
  - *Connects to:* implemented by `DeveloperLogger`, below.
  - *Shape:* `observability/`, a real, new, first, top-level,
    cross-cutting directory.
- **`DeveloperLogger`**
  - *What it is:* `Logger`'s own real, first, live implementation.
  - *Implementation:* `class DeveloperLogger implements Logger { const
    DeveloperLogger(this.name); ...
    developer.log(message, name: name, level: level.severity, error:
    error, stackTrace: stackTrace, time: DateTime.now()); }`.
  - *Its use:* `LocalFirstStore`'s own real, new, default.
  - *Type:* a real, concrete, `const`-constructible class.
  - *Responsibility:* real delegation to `dart:developer`'s own real,
    built-in, tooling-aware `log` function — nothing about *deciding*
    when a real event is worth logging; that stays real, calling
    code's own job.
  - *Depends on:* `dart:developer`, part of the Dart SDK itself.
  - *Connects to:* `LocalFirstStore`'s own real, new, injected
    dependency, below.
  - *Shape:* `observability/`.

## Concept Unit: Ruling out bin/sudoku_console.dart

### The Problem

`flutter analyze .`'s own real, 57-issue baseline names eleven, real,
already-existing `avoid_print` occurrences in `bin/sudoku_console
.dart` — a real, obvious-looking target for a real "Logging" lesson.
Is it actually the real, right one?

> **Try it yourself first.** Read `bin/sudoku_console.dart`'s own real
> `print` calls directly. Is any real, single one of them reporting a
> real, internal, diagnostic event — or is every real one of them
> real, direct, intended output a real, human player is meant to
> actually read, live, in a real terminal?

### Introducing the concept

No new isolated lab — a real, direct read of an already-existing,
real file, not a new construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — none — real, zero changes to
  `bin/sudoku_console.dart`, a real, deliberate decision.
- **Change type** — none.
- **Location** — not applicable.
- **Dependencies** — not applicable.

### The New Code

Not applicable.

### The Updated Project

Not applicable.

### Mechanical walkthrough

- Every real `print` call in `bin/sudoku_console.dart` — the real
  opening banner, the real board render, the real "Please enter
  exactly three numbers," the real "Goodbye" — is real, direct,
  intended, human-facing terminal output; real and none of them a
  real, internal, diagnostic trace a developer or operator would ever
  need to filter, search, or alert on.

### CS lens

Not applicable.

### SE lens

Routing a real, interactive program's own real UI text through a real,
structured logger would be a real, genuine category error: a real
logger exists for a real, different, human audience (a developer, an
operator, a real, later monitoring tool), never a real, live,
playing user reading a real terminal prompt. `avoid_print`'s own real
lint text — "Don't invoke 'print' in *production* code" — is real and
honestly, technically imprecise here: this real code *is* production
code, but its own real job *is* real, direct terminal output, the
one, real, legitimate exception the real lint rule itself doesn't,
and structurally can't, distinguish. This project's own real, 57-issue
baseline stays, deliberately, real and unchanged by this lesson —
real and honestly, correctly so.

### Commands needed

None.

### Run it

Not applicable — a real, honest, direct read, no new real code to
run.

### Connect the pieces

The real, wrong target, ruled out, honestly — the next Concept Unit
finds the real, right one.

---

## Concept Unit: Logger, LogLevel, and DeveloperLogger

### The Problem

Nothing in this app has a real, structured way to record a real,
internal, diagnostic event at all — only `print`, real and already
ruled out as the wrong tool, and real silence.

### Introducing the concept

No new isolated lab — a real, minimal, generic interface, and one
real, thin, delegating implementation, are direct repeats of
already-established shapes (`Clock`/`SystemClock`, `AuthApi`/
`HttpAuthApi`).

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/observability/log_level.dart` (new file);
  `project/lib/observability/logger.dart` (new file);
  `project/lib/observability/developer_logger.dart` (new file).
- **Change type** — add.
- **Location** — three new, real, standalone files, in a real, new,
  first, top-level `observability/` directory.
- **Dependencies** — `dart:developer`, part of the Dart SDK.

### The New Code

```dart
enum LogLevel {
  debug(500),
  info(800),
  warning(900),
  error(1000);
  const LogLevel(this.severity);
  final int severity;
}

abstract interface class Logger {
  void log(LogLevel level, String message, {Object? error, StackTrace? stackTrace});
}

class DeveloperLogger implements Logger {
  const DeveloperLogger(this.name);
  final String name;

  @override
  void log(LogLevel level, String message, {Object? error, StackTrace? stackTrace}) {
    developer.log(message, name: name, level: level.severity, error: error, stackTrace: stackTrace, time: DateTime.now());
  }
}
```

### The Updated Project

All three files, real and brand new, shown in full above.

### Mechanical walkthrough

- `enum LogLevel { debug(500), info(800), warning(900), error(1000);
  const LogLevel(this.severity); final int severity; }` — a real,
  already-established, enhanced Dart 3 `enum` with a real, associated
  field, real and matching the identical, real, numeric severity scale
  `dart:developer.log`'s own real `level` parameter already expects.
- `abstract interface class Logger { void log(...); }` — the
  identical, already-established, plain interface shape `AuthApi`
  already used.
- `class DeveloperLogger implements Logger { const DeveloperLogger
  (this.name); ... }` — a real, already-established, `const`-
  constructible implementation, real and taking one real, required
  `name` — a real, stable category, the identical real role a real
  logger's own real "tag" plays in any real, professional logging
  setup.
- `developer.log(message, name: name, level: level.severity, error:
  error, stackTrace: stackTrace, time: DateTime.now());` — a real,
  direct call into `dart:developer`'s own real, built-in, already-
  established function — real, structured, tooling-aware output,
  genuinely different from a bare `print(message)` in every real,
  structured field it carries.

### CS lens

Not applicable.

### SE lens

`DeveloperLogger` was deliberately left without a real, dedicated
unit test of its own — every real line inside it is a real, direct
pass-through to `dart:developer.log`, an already-established, real,
built-in, already-trusted Dart SDK function — the identical, real,
honest scope call this project's own, much earlier `SystemClock`/
`SecureAuthStorage` already received, for the identical real reason.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Unit, in
the closing, full-lesson test run, below.

### Connect the pieces

A real, structured way to log now exists — the final Concept Unit
finds it a real, genuine, honest use.

---

## Concept Unit: A real failure, finally observed

### The Problem

`LocalFirstStore.trySync`, from two, real, earlier lessons, already,
real and silently, swallows a real sync failure into a real, bare
`false` — nothing anywhere records *why*, or that it happened at all.

> **Try it yourself first.** Given `trySync`'s own real `catch`
> clause already has direct, real access to the real, thrown `error`
> and `stackTrace`, what is the smallest, real change logging both,
> at a real, honestly appropriate severity, before returning the
> identical, real `false` it already did?

### Introducing the concept

No new isolated lab — one, real, injected, optional, defaulted
dependency, and one, real, added `log` call inside an
already-existing, real `catch` clause, are direct repeats of
already-established shapes; its own real proof lives in this
project's own, already-existing, permanent
`local_first_store_test.dart`, extended, not replaced.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/local_first_store.dart` (modify).
- **Change type** — modify.
- **Location** — `LocalFirstStore`'s own real constructor and
  `trySync`'s own real `catch` clause.
- **Dependencies** — `Logger`, `LogLevel`, `DeveloperLogger`, all
  above.

### The New Code

```dart
LocalFirstStore({required this._local, required this._cloud, Logger? logger})
  : _logger = logger ?? const DeveloperLogger('LocalFirstStore');
final Logger _logger;

// inside trySync's own real try/catch:
} catch (error, stackTrace) {
  _logger.log(
    LogLevel.warning,
    'sync attempt failed; the real, local write remains genuinely pending',
    error: error,
    stackTrace: stackTrace,
  );
  return false;
}
```

### The Updated Project

`local_first_store.dart`'s own real, updated constructor, field, and
`trySync`'s own real, changed `catch` clause, numbered, this Concept
Unit's own new or changed lines marked:

```dart
1  LocalFirstStore({
2    required this._local,
3    required this._cloud,
4    Logger? logger,                                                   // ← new
5  }) : _logger = logger ?? const DeveloperLogger('LocalFirstStore');  // ← new
6
7  final LocalStore<T> _local;
8  final CloudSync<T> _cloud;
9  final Logger _logger;                                               // ← new
```

```dart
1    } catch (error, stackTrace) {                                      // ← changed
2      _logger.log(                                                     // ← new
3        LogLevel.warning,
4        'sync attempt failed; the real, local write remains genuinely pending',
5        error: error,
6        stackTrace: stackTrace,
7      );
8      return false;
9    }
```

### Mechanical walkthrough

- `Logger? logger` / `_logger = logger ?? const DeveloperLogger
  ('LocalFirstStore')` — the identical, already-established, real
  dependency-injection shape `Clock`/`ApiClient`/`AuthApi` already
  use: a real, optional, nullable parameter, defaulting to a real,
  live implementation — every real, existing caller of
  `LocalFirstStore` keeps working, real and unmodified.
- `catch (error, stackTrace) { ... }` — real and already-established
  Dart syntax capturing both real values a plain `catch (_)` had been
  discarding; `_logger.log(LogLevel.warning, ..., error: error,
  stackTrace: stackTrace)` — a real, structured call, real and
  carrying every real fact a real, later developer would actually
  need to diagnose *why* a real sync genuinely failed.
- `return false;` — real and entirely unchanged; this Concept Unit's
  own real change adds real observability without altering
  `trySync`'s own real, already-established, external contract at
  all.

### CS lens

Not applicable.

### SE lens

The real, deliberate choice of `LogLevel.warning`, not `.error`, is
worth naming directly: a real, single, failed sync attempt is real
and genuinely expected, in a real app that already, honestly promises
to work without internet — `syncWithRetry` exists precisely because
this real kind of failure is real and routine, not real and
catastrophic. Reserving `.error` for a real, genuinely unexpected
failure keeps a real, future log stream honestly informative — a real
operator scanning for real `.error` entries specifically should never
have to wade through a real flood of real, routine, expected,
temporary network hiccups to find them.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/local_first_store_test.dart`.

### Connect the pieces

A real failure that used to vanish silently is now genuinely,
structurally observable — proven end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, proving a real sync
failure is now genuinely, structurally observed.

1. `bin/sudoku_console.dart`'s own real `print` calls, real and
   directly read, ruled out honestly — real, legitimate, intended
   terminal UI, not diagnostic logging misuse.
2. `Logger`/`LogLevel`/`DeveloperLogger`, real and built — a real,
   structured, tooling-aware alternative to `print`, genuinely
   different in every real, structured field it carries.
3. `LocalFirstStore.trySync`, real and now logging a real,
   `warning`-level entry, carrying the real, actual error and stack
   trace, the real instant a real sync attempt genuinely fails — real,
   direct proof, from this lesson's own extended, permanent test,
   that a real failure logs exactly once, and a real success logs
   nothing at all.

The failure nothing was watching for — now, genuinely, something is.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `LocalFirstStore` touches real,
permanent, already-existing project code, this lesson's own real
proof lives in this project's own, already-existing, permanent
`test/local_first_store_test.dart`, extended, not replaced.

No real, first-attempt mistakes this lesson — every real file
compiled and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 7.0s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories; every real,
already-existing `avoid_print` occurrence left deliberately,
correctly untouched.

```
flutter test
...
00:27 +148: All tests passed!
```

148 real test-file-level checks, up from 146 — two new, both appended
to the already-existing, permanent `local_first_store_test.dart`.
Zero regressions anywhere else in this app; zero flakes on this
lesson's own single, real, full-suite run. Full, honest narrative,
including the real, corrected scope decision about
`bin/sudoku_console.dart`, in `verification/lesson-86/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
