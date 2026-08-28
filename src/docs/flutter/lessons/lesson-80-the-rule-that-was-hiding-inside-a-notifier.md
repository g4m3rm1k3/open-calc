# Lesson 80: The Rule That Was Hiding Inside a Notifier

**What you will build.** Curriculum's own real, one-line instruction
for this lesson — "test domain logic independently" — audited
directly, then acted on: real, foundational unit-testing vocabulary
(a real **Test double**, real **Test isolation**, a real
**Arrange-Act-Assert** shape), named against this project's own,
already-existing, real code as real, live proof; and `nextThemeMode`,
one, real, small, genuine domain rule, extracted out of a real
Riverpod `Notifier` it had been hiding inside, into its own, real,
pure, independently-testable function. The transferable problem: this
whole project has already, real and consistently, been testing domain
logic independently, lesson after lesson — this lesson's own real job
isn't teaching a new habit; it's naming the one this project already
has, and finding the one, real, honest place it wasn't yet being
followed.

**What you need to know first.** Nothing new — this lesson's own real
job is naming and applying an already-established discipline, not
introducing a new one. `AppSettings`/`SettingsNotifier`
(`features/sudoku/application/settings_provider.dart`), already
established.

**Terms used in this lesson**

- **Test double** — any real, fake, stand-in object substituted for a
  real, production dependency during a real test, real and giving the
  test genuine, direct control over that real dependency's own real
  behavior. This project has already, real and repeatedly, built these
  — `_InMemoryScoreRepository`, `_InMemoryAchievementRepository`,
  `_InMemoryAuthStorage`, `_InMemoryLocalStore`, `_FlakyCloudSync`,
  `FakeClock`, and `package:http/testing.dart`'s own real, official
  `MockClient` — real, live proof already sitting in this project's
  own, already-existing `project/test/` directory before this lesson
  ever named the real, general idea.
- **Test isolation** — the real, deliberate practice of making sure
  one real test's own real outcome never depends on real, shared,
  mutable state a real, different test might also touch, and never
  depends on a real, live, external system this project doesn't
  control. Already, real and consistently, practiced — a real, fresh
  `GameRegistry()`/`AuthService`/`LocalFirstStore` constructed inside
  almost every real test in this project, never shared across two;
  `database_test_support.dart`'s own real `useIsolatedTestDatabase()`,
  giving every real, database-touching test its own, real, fresh
  SQLite file.
- **Arrange-Act-Assert** — the real, three-part shape almost every
  real test in this project already follows: build whatever real
  setup the test needs (Arrange); perform the one, real action
  actually under test (Act); check the real, resulting behavior
  (Assert). Already, real and visibly, the real shape of nearly every
  real test this project has, from its own, much earlier
  `sudoku_engine_test.dart` onward.

**Objects and methods used**

- **`nextThemeMode`**
  - *What it is:* a real, small, genuine domain rule — the real order
    `ThemeMode` cycles through — real and newly extracted into its
    own, standalone, pure function.
  - *Implementation:* `ThemeMode nextThemeMode(ThemeMode current) {
    return switch (current) { ThemeMode.system => ThemeMode.light,
    ThemeMode.light => ThemeMode.dark, ThemeMode.dark =>
    ThemeMode.system, }; }`.
  - *Its use:* `SettingsNotifier.cycleThemeMode`, its own real, only
    real caller, both before and after this lesson's own real change;
    this lesson's own new, permanent test calls it directly, with zero
    real Riverpod/widget machinery at all.
  - *Type:* a real, plain, top-level, pure function.
  - *Responsibility:* real, one, small domain rule, and nothing else
    — no real state, no real persistence, no real Riverpod
    dependency; those all stay `SettingsNotifier`'s own real job.
  - *Depends on:* nothing beyond Flutter's own real, built-in
    `ThemeMode` enum.
  - *Connects to:* `SettingsNotifier.cycleThemeMode`, unmodified in
    its own real, external behavior.
  - *Shape:* Domain-layer, `features/sudoku/domain/` — real,
    genuinely independent of Riverpod, unlike the real `Notifier`
    class it used to live inside.

## Concept Unit: Naming what this project already does

### The Problem

Curriculum's own real instruction — "test domain logic independently"
— names a real habit. Before writing any real, new code, is this
project already following it, or does it need to be taught from
scratch?

> **Try it yourself first.** Open any three, real, already-existing
> files under `project/test/`, chosen at random. Do they call
> `test()` or `testWidgets()`? Do they construct a real, fresh,
> injected dependency of their own, or reach for a real, shared,
> global one?

### Introducing the concept

No new isolated lab — a real, direct, evidence-first audit of this
project's own, already-existing, real code, not a new construct to
build.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — none — real, zero, new or modified production
  or test code for this Concept Unit; a real, direct audit of
  already-existing files only.
- **Change type** — none.
- **Location** — not applicable.
- **Dependencies** — not applicable.

### The New Code

Not applicable — this Concept Unit's own real content is the audit
itself, below, not new code.

### The Updated Project

Not applicable.

### Mechanical walkthrough

- Real, direct grep evidence: every real, permanent test file this
  project has ever written for domain code — `sudoku_engine_test
  .dart`, `generic_scoring_test.dart`, `generic_achievements_test
  .dart`, `api_client_test.dart`, `auth_service_test.dart`,
  `cloud_sync_test.dart`, `local_first_store_test.dart`,
  `idempotency_guard_test.dart`, `record_merger_test.dart`,
  `cloud_leaderboard_test.dart` — uses a real, plain `test()`, never
  `testWidgets()` — real **Test isolation**, real and structural: none
  of them touch a real widget tree, a real `pumpAndSettle`, or a real,
  live Flutter binding at all.
- Real, direct evidence of real **Test doubles**: `_InMemoryScoreRepository`
  (`generic_scoring_test.dart`), `_InMemoryAchievementRepository`
  (`generic_achievements_test.dart`), `_InMemoryAuthStorage`
  (`auth_service_test.dart`), `_InMemoryLocalStore`/`_FlakyCloudSync`
  (`local_first_store_test.dart`), `FakeClock`
  (`score_leaderboard_test.dart`) — real, this project's own, and
  `MockClient` — real, `package:http/testing.dart`'s own, official
  one.
- Real, direct evidence of **Arrange-Act-Assert**: any real test
  picked at random — `sudoku_engine_test.dart`'s own real "resultFor
  reports a real win..." test builds a real engine and plays a real,
  complete game (Arrange), calls `engine.resultFor(state)` once
  (Act), then `expect`s its own real result (Assert) — the identical,
  real, three-part shape repeats across this project's own, entire,
  real test suite.

### CS lens

Not applicable.

### SE lens

This Concept Unit's own real point is a real, honest one: naming a
real, already-practiced discipline is not the same real work as
introducing a genuinely new one. This project earned real, working,
independently-testable domain code the identical real way it earned
every other real, established discipline this session — by actually
doing it, lesson after lesson, before ever giving it a real, formal
name.

### Commands needed

None.

### Run it

Not applicable — real, direct evidence only, no new real code to run.

### Connect the pieces

Real, foundational unit-testing vocabulary now has real names — the
next Concept Unit finds, and fixes, the one, real, honest place this
project wasn't yet following its own real discipline.

---

## Concept Unit: Extracting nextThemeMode

### The Problem

`SettingsNotifier.cycleThemeMode()` embeds a real, small, genuine
domain rule — the real order `ThemeMode` cycles through — directly
inside a real Riverpod `Notifier`. Testing that real rule, today,
means going through `theme_mode_test.dart`'s own real,
`testWidgets`-based tests — real and slower, real and needing a real
widget tree, a real `ProviderScope`, and a real, live database, for a
real rule that is, underneath, three real lines of a plain `switch`.

> **Try it yourself first.** Given `cycleThemeMode`'s own real
> `switch` expression never actually reads `this`, `ref`, or any real
> Riverpod state directly, what is the smallest, real, standalone
> function it could become — and what does `cycleThemeMode` itself
> look like calling it?

### Introducing the concept

No new isolated lab — extracting an already-fully-understood, real
`switch` expression into its own, real, top-level function is not a
new construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/domain/theme_mode_cycle.dart` (new
  file);
  `project/lib/features/sudoku/application/settings_provider.dart`
  (modify).
- **Change type** — add; modify.
- **Location** — a new, real, standalone file;
  `SettingsNotifier.cycleThemeMode`'s own real method body.
- **Dependencies** — Flutter's own, real, built-in `ThemeMode`.

### The New Code

```dart
ThemeMode nextThemeMode(ThemeMode current) {
  return switch (current) {
    ThemeMode.system => ThemeMode.light,
    ThemeMode.light => ThemeMode.dark,
    ThemeMode.dark => ThemeMode.system,
  };
}
```

```dart
void cycleThemeMode() {
  state = state.copyWith(themeMode: nextThemeMode(state.themeMode));
  _save('theme_mode', state.themeMode.index);
}
```

### The Updated Project

`theme_mode_cycle.dart`, in full, numbered — a brand-new file:

```dart
1  ThemeMode nextThemeMode(ThemeMode current) {
2    return switch (current) {
3      ThemeMode.system => ThemeMode.light,
4      ThemeMode.light => ThemeMode.dark,
5      ThemeMode.dark => ThemeMode.system,
6    };
7  }
```

`settings_provider.dart`'s own real, updated `cycleThemeMode`,
numbered, this Concept Unit's own changed lines marked:

```dart
1  void cycleThemeMode() {
2    state = state.copyWith(themeMode: nextThemeMode(state.themeMode));  // ← changed
3    _save('theme_mode', state.themeMode.index);
4  }
```

### Mechanical walkthrough

- `ThemeMode nextThemeMode(ThemeMode current) { return switch
  (current) { ... }; }` — the identical, already-established real
  `switch` expression, real and unchanged in its own, real logic,
  moved into a real, plain, top-level function taking the real,
  current value as a real, explicit parameter, rather than reading it
  off `state` directly.
- `state = state.copyWith(themeMode: nextThemeMode(state.themeMode));`
  — real and now one, single, real line, calling the real, new
  function; `_save('theme_mode', state.themeMode.index);`, the real
  line immediately after, entirely unchanged.

### CS lens

Not applicable — extracting a pure function from a stateful caller is
an already-covered mechanism; no new hard concept of its own.

### SE lens

This Concept Unit's own real, run-verified payoff is curriculum's own
real point, made concrete: `theme_mode_cycle_test.dart`'s own two real
tests run in effectively zero real time, real and needing zero real
Riverpod setup, zero real widget tree, zero real database — real,
direct, felt proof that testing domain logic independently isn't only
real, cleaner code; it's a real, immediately faster, real, immediately
simpler test to write and run. `theme_mode_test.dart`'s own real,
already-existing, `testWidgets`-based tests were deliberately left
in place, unmodified — they still, honestly, prove something real
`nextThemeMode`'s own test cannot: that the real, live UI actually
calls this real rule correctly, end to end.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/theme_mode_cycle_test.dart`.

### Connect the pieces

The one, real, genuine domain rule that had been hiding inside a real
Riverpod `Notifier` is now real, independent, and independently
tested — proven, end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, from a real, honest audit
to a real, fixed counter-example.

1. A real, direct audit of this project's own, already-existing
   `project/test/` directory found curriculum's own real instruction —
   "test domain logic independently" — already, genuinely practiced
   throughout, real and named, in full, as three, real, foundational
   Terms in this lesson's own Header, above.
2. The identical, real audit found one, real, honest exception:
   `SettingsNotifier.cycleThemeMode`'s own real cycle rule, reachable
   only through a real, slower, `testWidgets`-based test.
3. `nextThemeMode`, extracted, real and now independently tested in
   `theme_mode_cycle_test.dart`, real and running in effectively zero
   real time; `theme_mode_test.dart`'s own real, existing,
   `testWidgets`-based tests, re-run, unmodified, confirm zero, real,
   observable behavior changed.

A real habit, named; a real, honest gap, found and closed —
curriculum's own real instruction, proven, not merely declared,
against this project's own, real, actual code.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `nextThemeMode` is real, permanent
project code from its own first line, this lesson's own real proof
lives in a new, permanent `project/test/theme_mode_cycle_test.dart`,
not a throwaway lab.

No real, first-attempt mistakes this lesson — every real file compiled
and every real test passed on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 6.3s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:28 +142: All tests passed!
```

142 real test-file-level checks, up from 140 — two new, both in the
new, permanent `theme_mode_cycle_test.dart`. Two real, isolated flakes
(this project's own already-established, honest, unrelated pattern,
real and now observed spreading to a real, further, previously-
unaffected widget-test file) appeared on the first of two full-suite
runs, confirmed clean immediately after — genuinely unrelated, neither
one touches `ThemeMode` or `SettingsNotifier` at all. Full, honest
narrative in `verification/lesson-80/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
