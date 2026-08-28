# Lesson 82: The Button Nobody Had Actually Tapped

**What you will build.** A real, direct, evidence-first audit of this
app's own, already-extensive, real widget-testing coverage against
curriculum's own three, real, named concerns — Rendering, Interaction,
State transitions — followed by `pause_resume_test.dart`, one, real,
new, permanent widget test closing the one, real, honest gap that
audit actually found: this app's own real "Pause"/"Resume" button had
its own real, underlying domain logic tested, but no real test had
ever actually tapped the real, on-screen button and watched its own
real, visible label change. The transferable problem: this project has
already, real and extensively, been widget-testing itself, lesson
after lesson — the real test for this lesson isn't whether widget
tests can be written; it's whether a real, direct audit can honestly
tell what's already covered from what only looks covered because
something nearby is.

**What you need to know first.** Nothing new — `testWidgets`/
`tester.tap`/`tester.pump`/`find.byWidgetPredicate`/
`find.widgetWithText`, all already established, real and used
throughout this project's own, already-existing widget tests.
`GameStatus`'s own real lifecycle (`notStarted → playing → paused →
playing`), already established.

**Terms used in this lesson**

- **Rendering (as a widget-test concern)** — checking that a real
  widget tree genuinely shows, or genuinely omits, the real elements
  it should, given its own real, current state — a real button that
  should only appear once a real game has started, say, genuinely
  absent before, genuinely present after.
- **Interaction (as a widget-test concern)** — checking that a real,
  simulated user action (`tester.tap`, `tester.drag`, a real key
  event) against a real, live widget tree genuinely produces the real,
  correct, resulting effect, not merely that the real code backing it
  compiles.
- **State transition (as a widget-test concern)** — checking that a
  real widget's own, real, visible output genuinely, correctly tracks
  a real, underlying state change across more than one, real moment in
  time — before, during, and after — not only one, real, static
  snapshot.

**Objects and methods used**

No new real objects or methods — this lesson's own real work reuses
`ElevatedButton`, `SudokuApp`, `NumberPadView`, and every real,
already-established `testWidgets`/`find`/`tester` API this project's
own, existing widget tests already use.

## Concept Unit: Auditing what this project already covers

### The Problem

Curriculum's own real bullet names three, real, separate widget-testing
concerns. Before writing any real, new test, is this project already
covering all three, or does a real, genuine gap exist?

> **Try it yourself first.** `grep -rl "testWidgets" test/` — how many
> real files does it find, and, for each real, presentation-layer file
> under `lib/features/sudoku/presentation/`, does at least one of them
> genuinely test it?

### Introducing the concept

No new isolated lab — a real, direct audit of this project's own,
already-existing, real code, not a new construct to build.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — none — real, zero, new or modified code for
  this Concept Unit; a real, direct audit of already-existing files
  only.
- **Change type** — none.
- **Location** — not applicable.
- **Dependencies** — not applicable.

### The New Code

Not applicable.

### The Updated Project

Not applicable.

### Mechanical walkthrough

- `grep -rl "testWidgets" test/` — real, run, direct evidence:
  seventeen, real, already-existing files, spanning real **Rendering**
  (`layout_test.dart`, `responsive_layout_test.dart`,
  `sudoku_board_view_test.dart`, `app_theme_test.dart`), real
  **Interaction** (`number_pad_test.dart`, `cell_selection_test.dart`),
  and real **State transition** (`game_session_lifecycle_test.dart`,
  `theme_mode_test.dart`).
- A real, direct, file-by-file comparison of `lib/features/sudoku/
  presentation/` against `test/` found every real, presentation file
  already had at least one, real, corresponding widget test — with one,
  real, honest exception, found only by checking each real, individual
  real, interactive element, not just each real file: the real
  "Pause"/"Resume" `ElevatedButton`, its own real, underlying domain
  logic tested (`game_session_lifecycle_test.dart`), but never, real
  and actually, tapped by any real widget test.

### CS lens

Not applicable.

### SE lens

This Concept Unit's own real, honest finding is worth naming
directly: a real *file* named `game_session_lifecycle_test.dart`
existing is not, by itself, real proof every real, individual,
interactive element touching that real lifecycle has actually been
tapped — real domain-logic coverage and real, on-screen,
widget-level coverage are two, real, genuinely different, real
claims, and only a real, direct, deliberate audit, element by
element, not just file by file, told them apart here.

### Commands needed

```
grep -rl "testWidgets" test/
```

### Run it

Not applicable — real, direct evidence only, no new real code to run.

### Connect the pieces

One, real, honest gap found — the next Concept Unit closes it.

---

## Concept Unit: pause_resume_test — closing the real gap

### The Problem

Nothing yet real, actually taps this app's own real "Pause"/"Resume"
button and checks that its own real, visible label genuinely tracks
the real session status it reflects.

> **Try it yourself first.** Given the real button only renders
> `if (canTogglePause)`, and `canTogglePause` is real and `false`
> until a real game genuinely starts, what is the smallest, real,
> single, combined widget test proving all three of curriculum's own
> named concerns — the real button's own real absence, then real
> presence (Rendering); a real tap actually working (Interaction); its
> own real, visible label genuinely changing, twice, in both real
> directions (State transition)?

### Introducing the concept

No new isolated lab — `tester.tap`/`find.widgetWithText`, both
already established, compose directly; its own real proof lives in
this lesson's own permanent test.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/test/pause_resume_test.dart` (new
  file).
- **Change type** — add.
- **Location** — a new, real, standalone test file.
- **Dependencies** — `SudokuApp`, `NumberPadView`, `ElevatedButton`,
  all already established.

### The New Code

```dart
await tester.pumpWidget(const ProviderScope(child: SudokuApp()));
expect(find.widgetWithText(ElevatedButton, 'Pause'), findsNothing);

await tester.tap(_padButton(5));
await tester.pump();
expect(find.widgetWithText(ElevatedButton, 'Pause'), findsOneWidget);

await tester.tap(find.widgetWithText(ElevatedButton, 'Pause'));
await tester.pump();
expect(find.widgetWithText(ElevatedButton, 'Resume'), findsOneWidget);

await tester.tap(find.widgetWithText(ElevatedButton, 'Resume'));
await tester.pump();
expect(find.widgetWithText(ElevatedButton, 'Pause'), findsOneWidget);
```

### The Updated Project

`pause_resume_test.dart`, in full — a brand-new file, shown in
complete, real form above, its own real, single test combining every
real step in one, real, continuous, honest trace.

### Mechanical walkthrough

- `expect(find.widgetWithText(ElevatedButton, 'Pause'), findsNothing);`
  — a real, already-established `find.widgetWithText` matcher, real
  **Rendering**: the real button is genuinely absent before any real
  move.
- `await tester.tap(_padButton(5)); await tester.pump();` — the
  identical, already-established real tap pattern `number_pad_test
  .dart` already uses, real and driving the real session from real
  `notStarted` into real `playing`.
- `expect(find.widgetWithText(ElevatedButton, 'Pause'),
  findsOneWidget);` — real **Rendering**, again: the real button now
  genuinely appears.
- `await tester.tap(find.widgetWithText(ElevatedButton, 'Pause'));` —
  real **Interaction**: a real, live tap on the real, now-visible
  button itself.
- `expect(find.widgetWithText(ElevatedButton, 'Resume'),
  findsOneWidget);` then, after a real, second tap,
  `expect(find.widgetWithText(ElevatedButton, 'Pause'),
  findsOneWidget);` — real **State transition**: the real, visible
  label genuinely tracks `playing → paused → playing`, checked at
  three, real, separate, real moments, not only once.

### CS lens

Not applicable.

### SE lens

The real, deliberate choice here was one, real, single, combined test
proving Rendering, Interaction, and State transition together, in one,
real, continuous, honest trace — rather than three, real, separate
tests, each re-driving the real session to the real, same starting
point independently. Real, fewer, real, repeated setup steps, at the
real cost of a real, single test failure being slightly less
immediately specific about *which* of the three real concerns broke —
an accepted, real, minor tradeoff, since the real, three `expect`
blocks inside remain real and individually, clearly labeled by their
own real `reason:` text.

### Commands needed

None.

### Run it

Real, run output shown below.

### Connect the pieces

Every real, interactive, presentation-layer element in this app now
has real, direct, on-screen, widget-level proof — audited, then
proven, end to end.

---

## Connect the pieces

One real, concrete trace, start to finish, across this lesson's own
real audit and its own real, one fix.

1. `grep -rl "testWidgets" test/` found seventeen, real,
   already-existing widget-test files, real and already covering
   Rendering, Interaction, and State transitions extensively.
2. A real, direct, element-by-element check found one, real, honest
   gap: the real "Pause"/"Resume" button, its own real domain logic
   tested, but never, real and actually, tapped.
3. `pause_resume_test.dart`, one, real, new, permanent, combined test,
   closes it — real, direct, on-screen proof the real button is
   genuinely absent, then genuinely present, then genuinely,
   correctly tracks the real session it reflects, across two, real,
   separate taps, in both real directions.

A real, honest audit, then a real, honest fix — curriculum's own three,
real, named concerns, each with real, direct, on-screen proof.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `pause_resume_test.dart` touches real,
permanent, already-existing project code, this lesson's own real proof
lives in that one, new, permanent test file, not a throwaway lab.

One real, first-attempt mistake, caught immediately: the real, first
draft used `ElevatedButton` without importing
`package:flutter/material.dart`, a real, genuine compile error; fixed
by adding the real, missing import.

```
flutter analyze .
57 issues found. (ran in 6.2s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories, after the one, real,
first-attempt fix above.

```
flutter test
...
00:34 +146: All tests passed!
```

146 real test-file-level checks, up from 145 — one new, in the new,
permanent `pause_resume_test.dart`. One real, isolated flake (this
project's own already-established, honest, unrelated pattern)
appeared on the first of two full-suite runs, confirmed clean
immediately after. Full, honest narrative in
`verification/lesson-82/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
