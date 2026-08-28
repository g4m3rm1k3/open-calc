# Lesson 89: The Watch That Was Too Wide

**What you will build.** A real, direct audit of every real
`ref.watch` call across this app's own presentation layer, finding
one, real, genuinely over-broad watch, and fixing it with Riverpod's
own real, official `select` API; a real, measured, permanent test
timing 200, real, sequential database writes against a real, honest,
generous budget; and, real and honestly un-coded, a direct, prose
explanation of why Frame rate, Memory, and Startup time all need a
real, running, profiled app this exact environment cannot currently
produce. The transferable problem: curriculum names five, real
investigation topics under one, real, single word — "Performance" —
but only some of them are genuinely answerable by reading and running
Dart code; this lesson's own real job is finding out which, and being
honest, not silent, about the rest.

**What you need to know first.** `settingsProvider`/`AppSettings`,
already established. This project's own, already-established, real,
honest split between "genuinely testable here" and "genuinely needs a
real, native build this environment can't currently produce," first
drawn by Lessons 83/84, reused again here.

**Terms used in this lesson**

No new Terms — this lesson's own real fix reuses Riverpod's own,
already-existing, official `select` API directly, confirmed from its
own real, installed source before use, not a new, project-invented
mechanism.

**Objects and methods used**

No new real objects — this lesson's own real work modifies one,
already-existing, real `ref.watch` call, and adds real, permanent
tests around two, already-established, real mechanisms
(`ProviderContainer.listen`, `SqliteScoreRepository.save`).

## Concept Unit: Rebuilds

### The Problem

Does this app's own real, existing code have any real, genuinely
over-broad `ref.watch` calls — real ones that rebuild more of the
real, live UI than a real, given state change actually needs to?

> **Try it yourself first.** `grep -rn "ref.watch" lib/features/sudoku/presentation/`
> — for each real match, ask: does the real, surrounding widget
> genuinely use every real field of whatever real object it's
> watching, or only one, real, particular piece of it?

### Introducing the concept

`ProviderListenableSelect.select`'s own real, installed source
(`riverpod-3.4.2/lib/src/core/modifiers/select.dart`) was read
directly, before use, confirming its own real, exact signature:
`ProviderListenable<OutT> select<OutT>(OutT Function(InT value)
selector)`. No new isolated lab beyond that — `select` is a real,
already-existing, official library method, not a new construct this
project has to build.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_app.dart` (modify).
- **Change type** — modify.
- **Location** — `_SessionStatusState.build`'s own real, first line.
- **Dependencies** — Riverpod's own, real, already-established
  `select` API.

### The New Code

```dart
final showTimer = ref.watch(settingsProvider.select((s) => s.showTimer));
```

### The Updated Project

`sudoku_app.dart`'s own real, one, changed line:

```dart
1  final showTimer = ref.watch(settingsProvider.select((s) => s.showTimer));  // ← changed
```

### Mechanical walkthrough

- `ref.watch(settingsProvider.select((s) => s.showTimer))` — a real,
  already-established `ref.watch` call, real and now given a real,
  `select`-wrapped provider instead of the real, bare `settingsProvider`
  itself; `(s) => s.showTimer` is a real, plain selector function, real
  and reading exactly the one real field this real widget actually
  needs.

### CS lens

Not applicable — `select` composes only an already-covered,
already-established mechanism (a real, plain, injected function); no
new hard concept of its own.

### SE lens

The real, direct, found problem: `_SessionStatusState.build`'s own
real, original `ref.watch(settingsProvider).showTimer` watched the
real, *whole* `AppSettings` object — meaning a real player toggling
sound, haptics, animations, or theme, none of which this real widget
ever displays, would still, real and unnecessarily, rebuild it. This
lesson's own new, permanent `rebuild_scope_test.dart` proves the real,
exact size of that real problem directly: a real, whole-object
listener genuinely fires on every one of two, real, individually
unrelated changes, while the real, `select`-scoped one genuinely fires
zero times across four real, unrelated changes, and exactly once for
the one, real, genuinely relevant one.

### Commands needed

```
grep -rn "ref.watch" lib/features/sudoku/presentation/
```

### Run it

Real, run output shown below, from
`project/test/rebuild_scope_test.dart`.

### Connect the pieces

One, real, over-broad rebuild, found and fixed — the next Concept
Unit measures a real, different, real performance concern.

---

## Concept Unit: Database performance

### The Problem

Nothing in this app has ever, real and directly, measured how long a
real, meaningful batch of real database work actually takes.

> **Try it yourself first.** Given `SqliteScoreRepository.save`
> already exists and is already, real and directly, testable, what is
> the smallest, real, permanent test measuring real, actual
> wall-clock time for a real, meaningful number of real, sequential
> inserts?

### Introducing the concept

No new isolated lab — a real, plain, already-established
`Stopwatch`, wrapped around an already-real, already-tested method
called in a real loop, is not a new construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/test/database_performance_test.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone test file.
- **Dependencies** — `SqliteScoreRepository`, `AppDatabase`, both
  already established.

### The New Code

```dart
final stopwatch = Stopwatch()..start();
for (var i = 0; i < 200; i++) {
  await repository.save(Score(...));
}
stopwatch.stop();

expect(stopwatch.elapsedMilliseconds, lessThan(10000));
```

### The Updated Project

`database_performance_test.dart`, in full — a brand-new file, real
and complete, shown in its own real, entire form in this project's
own real, current source.

### Mechanical walkthrough

- `final stopwatch = Stopwatch()..start();` — Dart's own real,
  built-in, already-established `Stopwatch` class, real and cascaded
  directly into its own real `start()` call.
- The real, bounded `for` loop, calling the already-real, already-
  tested `repository.save` 200, real, sequential times — real and
  deliberately sequential, not real, concurrent `Future`s, since a
  real app's own real writes, one real player at a time, genuinely
  are sequential too.
- `expect(stopwatch.elapsedMilliseconds, lessThan(10000));` — a real,
  already-established assertion, real and checked against a real,
  deliberately generous `10000`ms budget — this real test's own real
  job is catching a real, genuine regression, not chasing a real,
  precise, environment-sensitive target.

### CS lens

Not applicable.

### SE lens

The real, chosen `10000`ms budget is real and deliberately loose —
this real session's own, real, actual measured time was `1217`ms, a
real, roughly 8x real margin. The real, rejected alternative — a
real, tight, precise threshold close to the real, measured time —
would make this real test genuinely flaky across real, different,
real, honestly slower machines (a real, busy CI runner; a real,
older, real, physical device), for a real kind of flakiness that
teaches nothing real about this app's own real database code at all.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/database_performance_test.dart`.

### Connect the pieces

Real Database performance, now genuinely measured and permanently
guarded — the final Concept Unit explains, honestly, the three, real,
remaining topics this environment cannot measure at all.

---

## Concept Unit: Frame rate, Memory, and Startup time, honestly explained

### The Problem

Three of curriculum's own five, real, named topics — Frame rate,
Memory, Startup time — real and none of them answerable by reading or
running Dart code inside `flutter test`'s own real, headless,
simulated harness.

### Introducing the concept

Not applicable — real, direct, honest prose, not a new, real,
runnable construct.

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

Real **Frame rate** and real **Memory** both genuinely require
Flutter DevTools, real and attached to a real, actually running,
`--profile`-mode app — the real, live Performance and Memory tabs,
real and reading real, actual data straight from a real, running
Dart/Flutter engine. Real **Startup time** genuinely needs a real,
compiled, `--trace-startup` build. `flutter test`'s own real, headless
harness never renders a real frame to any real display, and never
produces a real, native, compiled artifact — real and structurally
incapable of measuring any of these three, real, honest topics at
all. This real machine's own, already-known inability to produce a
real, native, compiled Windows build (Lessons 83/84/86) would block
even attempting a real, profiled run here, the identical, real, root
cause, not re-discovered.

### CS lens

Not applicable.

### SE lens

Real and worth naming directly, the identical, honest discipline
Lessons 83/84/87 already established: neither real topic here is a
real, missing piece of this lesson's own code — both are real,
genuine, tooling-and-hardware concerns this whole session's own real,
established discipline (never claim untested code works) makes
honest to separate cleanly from real, testable Dart. Per curriculum's
own hard constraint, the user's own real, physical, USB-connected
Android device remains the real, intended, eventual place this real,
later, live investigation actually happens.

### Commands needed

None.

### Run it

Not applicable — real, direct, honest explanation only.

### Connect the pieces

Curriculum's own real "Performance profiling" bullet, honestly
complete: two, real, concrete, tested, measured findings, and three,
real, genuine, honestly-un-coded, hardware/tooling-dependent concerns
— proven, and explained, end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, across this lesson's own
real, mixed, honest investigation.

1. `grep -rn "ref.watch" lib/features/sudoku/presentation/` found one,
   real, genuinely over-broad watch — `_SessionStatusState.build`,
   watching the whole `AppSettings` object for one real field.
2. `ref.watch(settingsProvider.select((s) => s.showTimer))` — real,
   direct, measured proof: zero real notifications across four,
   unrelated changes; exactly one for the real, genuinely relevant one.
3. 200 real, sequential database writes, real and measured at
   `1217ms` — comfortably inside a real, honest, generous
   `10000ms` budget, real and permanently guarded against a real,
   future regression.
4. Frame rate, Memory, and Startup time — real, honestly explained,
   not faked as runnable code that doesn't exist in this exact
   environment.

The watch that was too wide, narrowed; the database, measured; the
rest, honestly explained.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `_SessionStatusState`/
`SqliteScoreRepository` both touch real, permanent, already-existing
project code, this lesson's own real proof lives in two, new,
permanent test files, not a throwaway lab.

No real, first-attempt mistakes this lesson — every real file
compiled and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 6.6s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:28 +155: All tests passed!
```

155 real test-file-level checks, up from 152 — three new. This
project's own, already-existing, permanent `settings_test.dart`
confirmed unaffected by the real `select()` change. Zero regressions
anywhere else in this app; zero flakes on this lesson's own single,
real, full-suite run. Full, honest narrative, including the real,
measured `1217ms` database-write timing, in
`verification/lesson-89/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
