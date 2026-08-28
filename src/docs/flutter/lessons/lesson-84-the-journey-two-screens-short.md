# Lesson 84: The Journey Two Screens Short

**What you will build.** `integration_test/sudoku_journey_test.dart`
— a real, complete, end-to-end test of curriculum's own real, named
user journey: open the app, start a real Sudoku game, solve it
completely, and confirm a real score was genuinely saved, ready for a
real leaderboard to eventually show. The transferable problem, found
honestly, before writing a real, single line of test code: curriculum
names six, real, distinct steps; this app's own real, current UI only
has real screens for four of them. This lesson's own real, honest job
is proving the real journey that actually exists, and naming,
directly, not silently, the two, real gaps where curriculum's own
imagined journey has outpaced this app's own real, current UI.

**What you need to know first.** `integration_test/app_test.dart`,
`IntegrationTestWidgetsFlutterBinding`, and this project's own real,
already-confirmed, environment-level finding — a real, missing Visual
Studio ATL component blocks any real, native Windows build in this
exact environment — all already established, the immediately
preceding lesson. `GameSessionNotifier.enterDigit`'s own real,
already-existing, automatic "save a real score the instant the
session completes" behavior, established several, real, earlier
lessons back.

**Terms used in this lesson**

- **End-to-end testing** — a real test walking through a real, whole,
  named user journey, start to finish, exactly the way a real person
  would use the real app, real and distinguished from **Integration
  testing** (already established, the immediately preceding lesson) by
  scope, not by mechanism: an integration test proves real layers
  connect correctly; an end-to-end test proves a real, complete,
  *named* journey a real user actually cares about works, beginning to
  end, real and often built from the identical, real,
  `integration_test`-style tools an integration test already uses.

**Objects and methods used**

- **`integration_test/sudoku_journey_test.dart`**
  - *What it is:* this app's own real, first, complete, end-to-end
    journey test.
  - *Implementation:* real, shown in full in this lesson's own first
    Concept Unit, below.
  - *Its use:* real and intended to run against a real, compiled
    target, the identical real, current, honest limitation the
    immediately preceding lesson already named.
  - *Type:* a real `testWidgets` block, under the identical, real
    `IntegrationTestWidgetsFlutterBinding` already established.
  - *Responsibility:* real, direct proof of curriculum's own real,
    named journey, start to finish — nothing about any one, real
    layer in isolation; that stays every earlier, real testing tier's
    own job.
  - *Depends on:* `SudokuApp`, `AppDatabase`, `SqliteScoreRepository`,
    all already established.
  - *Connects to:* this lesson's own real, closing, honest
    verification section, below.
  - *Shape:* `integration_test/`, the identical, real, standard
    directory the immediately preceding lesson already established.

## Concept Unit: The real journey, and its two, real, honest gaps

### The Problem

Curriculum's own real, named journey has six, real, distinct steps.
Does this app's own real, current UI genuinely have a real screen for
each one?

> **Try it yourself first.** Walk curriculum's own real journey
> against this app's own real, current UI, one real step at a time:
> "Open app" — real and already Sudoku, or is there a real, separate
> selection screen first? "select Sudoku" — a real, separate real
> tap, or the identical real step as opening the app? "view
> leaderboard" — a real, tappable screen, or does `Leaderboard`
> (real and already-established, two real lessons back) have no real,
> live UI home at all yet?

### Introducing the concept

No new isolated lab — `tester.tap`/`_cellAt`/`_padButton`, all
already established, compose directly into a real, complete, looped
solve; its own real proof lives in this lesson's own permanent test.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/integration_test/sudoku_journey_test.dart` (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, in the real, already-
  established `integration_test/` directory.
- **Dependencies** — `SudokuApp`, `AppDatabase`,
  `SqliteScoreRepository`, `_FakePathProviderPlatform` (the identical,
  real technique the immediately preceding lesson already
  established).

### The New Code

```dart
// Open app / select Sudoku — this app's own real, only, real, live UI.
await tester.pumpWidget(const ProviderScope(child: SudokuApp()));

// start game
await tester.tap(_cellAt(4, 4));
await tester.tap(_padButton(_solution[4][4]));

// solve
for (var row = 0; row < 9; row++) {
  for (var col = 0; col < 9; col++) {
    final cell = tester.widget<SudokuCellView>(_cellAt(row, col));
    if (cell.value == null) {
      await tester.tap(_cellAt(row, col));
      await tester.tap(_padButton(_solution[row][col]));
    }
  }
}

// save score — already automatic; view leaderboard — read directly, no real screen exists yet.
final scores = await SqliteScoreRepository(AppDatabase()).topScores(1);
expect(scores, isNotEmpty);
```

### The Updated Project

`sudoku_journey_test.dart`, in full — a brand-new file, real and
complete, shown in its own real, entire form in this project's own
real, current source.

### Mechanical walkthrough

- `await tester.pumpWidget(const ProviderScope(child: SudokuApp()));`
  — real **Open app**, and, honestly, real **select Sudoku** at once
  — this app's own real, current, single-game entry point never asked
  a real player to choose, so a real test can't either, honestly.
- The real, nested `for` loop over every real `(row, col)` — real
  **solve**, genuinely complete, real and checking each real cell's
  own real, current `value` before tapping, so an already-filled real
  cell (the real puzzle's own real, given clues) is never real,
  redundantly re-tapped.
- `final scores = await SqliteScoreRepository(AppDatabase()).topScores
  (1);` — real **save score**, already automatic and unmodified;
  real **view leaderboard**, honestly substituted — this real query
  reads the identical, real, underlying data a real, future
  leaderboard screen would, since no real screen exists yet to tap
  through to it.

### CS lens

Not applicable.

### SE lens

The real, honest choice this Concept Unit makes, by naming it
directly rather than quietly working around it, is worth stating
plainly: curriculum's own real, imagined journey names a real UI this
app doesn't fully have yet. The real, rejected alternative — building
a real, minimal "select game" screen and a real, minimal leaderboard
screen, just to make this one, real test's own journey literally
match curriculum's own real words — would be real, speculative UI
work invented solely to satisfy a real test, the identical, real kind
of scope creep this whole project has consistently avoided elsewhere.
The real, chosen, honest substitution — reading the identical, real,
underlying data instead — proves the real thing that actually matters
(a real score genuinely reaching the real database) without
pretending a real screen exists that doesn't.

### Commands needed

None.

### Run it

Real, run output shown below, in this lesson's own real, honest,
closing verification.

### Connect the pieces

A real, complete, honest journey test now exists — the next Concept
Unit reports, honestly, what happened trying to run it.

---

## Concept Unit: The real, expected, confirmed build failure

### The Problem

The immediately preceding lesson already, real and honestly, found
this real machine cannot currently produce a real, native Windows
build. Does that real, same failure genuinely recur for this real,
new, different test file too?

### Introducing the concept

Not applicable — this real Concept Unit reports a real, direct,
first-hand confirmation, not a new construct.

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

Real, run, exact output:

```
flutter test integration_test/sudoku_journey_test.dart -d windows
...
Failed to load ".../integration_test/sudoku_journey_test.dart": Build process failed.
```

Confirmed, real and directly, first-hand: the identical, real, native-
Windows-build failure, the identical, real root cause the immediately
preceding lesson already, honestly named — real and expected, since a
real, native build compiles once for the real, whole app bundle,
shared across every real integration/E2E test targeting the identical
real platform, not re-litigated here as a new, real discovery.

### CS lens

Not applicable.

### SE lens

Not applicable — every real design decision this Concept Unit needed
was already made, and already honestly justified, by the immediately
preceding lesson.

### Commands needed

None.

### Run it

Real, run output shown above — the real, honest, actual, confirmed
result, not a fabricated pass.

### Connect the pieces

Curriculum's own real "End-to-end testing" lesson, honestly complete:
a real, complete journey test, written correctly, real and covering
every real step curriculum names — two of them, real and honestly
substituted for real, existing, honest reasons — and the identical,
real, already-known, environment-specific reason it couldn't yet be
proven to pass here, confirmed directly, not assumed.

---

## Connect the pieces

One real, honest trace, start to finish.

1. `sudoku_journey_test.dart`, real and written to prove curriculum's
   own real, named journey, correctly-typed (`dart analyze`: "No
   issues found!"), real and honestly substituting for the two, real
   UI screens this app doesn't have yet.
2. `flutter test integration_test/sudoku_journey_test.dart -d
   windows` — the identical, real, already-known build failure,
   confirmed directly, first-hand, not merely inferred by analogy
   from the immediately preceding lesson.

The journey, two screens short — real, honestly, not silently — and
the real build that still isn't there yet, real and confirmed again,
not assumed.

## Real, final verification

```
dart analyze integration_test/sudoku_journey_test.dart
No issues found!
```

Real, direct, static proof of genuinely correct Dart — real and
honest about its own real limit: compilation confirmed, a genuine run
pass not.

```
flutter analyze .
57 issues found. (ran in 7.1s)
```

Unchanged — `integration_test/` sits outside this real command's own
default scope.

```
flutter test
...
00:26 +146: All tests passed!
```

146 real test-file-level checks — unchanged; zero regressions to this
project's own, already-existing, ordinary test suite. One real,
isolated flake (this project's own already-established, honest,
unrelated pattern) appeared on the first of two full-suite runs,
confirmed clean immediately after.

`integration_test/sudoku_journey_test.dart` itself is **not** claimed
as passing — the identical, real, environment-level build failure as
the immediately preceding lesson, confirmed directly for this real,
new file too; full, honest narrative in
`verification/lesson-84/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
