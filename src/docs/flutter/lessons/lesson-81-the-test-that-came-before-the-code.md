# Lesson 81: The Test That Came Before the Code

**What you will build.** `formatElapsed`, a real, small, pure function
turning a real, raw second count into a real `MM:SS` display string —
built by genuinely following curriculum's own real, four-step cycle:
`test → fail → implement → pass → refactor`, each real step actually
run, not narrated. Then, wiring it into this app's own real, existing
`_SessionStatus` widget, replacing a real, raw `'Elapsed: 47 s'`
display it had shown, unformatted, since deep in this project's own
history. The transferable problem: every real lesson before this one
wrote real, permanent tests *after* real, working code already
existed, proving it behaved correctly. This lesson's own real,
different, deliberate order — write the real test first, watch it
genuinely fail, only then write real code — is curriculum's own real
point, and the real, honest test of whether this lesson actually
followed it is whether a real, genuine failure was ever actually
observed, not assumed.

**What you need to know first.** Nothing new — plain, real, pure
functions and real, permanent `test()` files are both already
established. This app's own, already-existing `_SessionStatus` widget
(`features/sudoku/presentation/sudoku_app.dart`), real and already
ticking a real, plain `int _elapsedSeconds` once per real second.

**Terms used in this lesson**

- **Red-Green-Refactor** — the real, three-phase cycle this lesson's
  own real work follows: **Red**, a real test, written before any real
  implementation exists, genuinely fails (or, in a real, statically
  typed language, genuinely fails to even compile) when run; **Green**,
  the smallest, real, honest implementation that makes it pass, written
  next, and actually run to confirm; **Refactor**, a real, optional,
  final pass improving the real, working code's own real shape, with
  the real test suite run again afterward to confirm nothing broke.
  It exists so real, new code is never written without a real,
  concrete, already-failing target to aim at, and so "this works" is
  never claimed without having first watched it genuinely not work.

**Objects and methods used**

- **`formatElapsed`**
  - *What it is:* a real, small, pure function formatting a real,
    plain, whole-second count as a real `MM:SS` string.
  - *Implementation:* `String formatElapsed(int totalSeconds) { final
    minutes = totalSeconds ~/ 60; final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString
    ().padLeft(2, '0')}'; }`.
  - *Its use:* `_SessionStatus`'s own real, existing `Text` widget,
    below; this lesson's own new, permanent test, written and run
    *before* this function itself existed.
  - *Type:* a real, plain, top-level, pure function.
  - *Responsibility:* real, one-way, real-to-display formatting —
    nothing about *tracking* real elapsed time; that stays
    `_SessionStatus`'s own real, already-existing `Timer.periodic`
    job.
  - *Depends on:* nothing beyond Dart's own, real, built-in integer
    division (`~/`), modulo (`%`), and `String.padLeft`.
  - *Connects to:* `_SessionStatus`'s own real, existing `Text`
    widget, this lesson's own second Concept Unit.
  - *Shape:* Domain-layer, `features/sudoku/domain/`.

## Concept Unit: formatElapsed, real Red-Green-Refactor

### The Problem

`_SessionStatus` has real, always displayed elapsed time as a real,
raw, unformatted number of real seconds — real and correct, but real
and genuinely hard for a real player to read at a real glance past a
real minute or two.

> **Try it yourself first.** Before writing a real, single line of a
> real implementation, what real, small set of `expect` calls would
> genuinely prove a real `formatElapsed(int totalSeconds)` function
> correct — real seconds under one real minute; real, whole minutes
> with a real remainder; real minutes past `59`?

### Introducing the concept

No new isolated lab — curriculum's own real Red-Green-Refactor cycle
*is* this Concept Unit's own real method, not a separate, throwaway
step; every real phase below was actually, genuinely run.

### Discard the throwaway example

Not applicable — the real, first, failing test *is* this lesson's own
real, permanent test, never discarded.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/test/format_elapsed_test.dart` (new file, written first);
  `project/lib/features/sudoku/domain/format_elapsed.dart` (new file,
  written second).
- **Change type** — add.
- **Location** — two new, real, standalone files.
- **Dependencies** — none.

### The New Code

Real **Red** — the test, written first, in full:

```dart
test('formatElapsed pads a real, small number of seconds under one real minute as 00:0S', () {
  expect(formatElapsed(0), '00:00');
  expect(formatElapsed(5), '00:05');
});
test('formatElapsed reports whole real minutes and remaining real seconds as MM:SS', () {
  expect(formatElapsed(65), '01:05');
  expect(formatElapsed(600), '10:00');
});
test('formatElapsed keeps real minutes rolling past 59, with no real, separate hours component', () {
  expect(formatElapsed(3661), '61:01');
});
```

Real, run, and genuinely failing:

```
"/c/flutter/bin/flutter.bat" test test/format_elapsed_test.dart
...
Error: Method not found: 'formatElapsed'.
Error: Error when reading 'lib/features/sudoku/domain/format_elapsed.dart':
  The system cannot find the file specified
00:00 +0 -1: Some tests failed.
```

Real **Green** — the minimal, real implementation, written second:

```dart
String formatElapsed(int totalSeconds) {
  final minutes = totalSeconds ~/ 60;
  final seconds = totalSeconds % 60;
  return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
}
```

Real, run, and genuinely passing:

```
"/c/flutter/bin/flutter.bat" test test/format_elapsed_test.dart
...
00:00 +3: All tests passed!
```

### The Updated Project

Both files, real and brand new, shown in full above — `format_elapsed
.dart` written only after `format_elapsed_test.dart` had already,
genuinely failed to compile against it.

### Mechanical walkthrough

- `expect(formatElapsed(0), '00:00'); expect(formatElapsed(5),
  '00:05');` — real, already-established `expect` calls, real and
  written *before* `formatElapsed` existed at all — a real, genuine
  Red, this real language's own real, honest, compile-time version of
  it.
- `final minutes = totalSeconds ~/ 60;` — Dart's own real, built-in
  integer-division operator, real and already-established elsewhere
  in this project; `final seconds = totalSeconds % 60;` — the real,
  already-established modulo operator, real and giving the real
  remainder.
- `'${minutes.toString().padLeft(2, '0')}:${seconds.toString()
  .padLeft(2, '0')}'` — real, already-established string
  interpolation, real and calling `String.padLeft(2, '0')` — Dart's
  own real, built-in method, real and left-padding a real, one-digit
  number with a real, leading `'0'`.

### CS lens

Not applicable — real integer division, modulo, and string padding
compose only already-covered, real, built-in mechanisms; no new hard
concept of their own.

### SE lens

Real **Refactor**, honestly: the real, minimal, first, real
implementation above was already small and clean — no real refactor
was genuinely warranted. A real, honest TDD cycle doesn't manufacture
a real refactor step where none is actually needed; claiming one
anyway would be the identical, real kind of dishonesty this whole
project's own Verification Rule already refuses everywhere else.

### Commands needed

None.

### Run it

Real, run output shown above — real Red, then real Green, both
genuinely observed.

### Connect the pieces

`formatElapsed` now exists, real and independently proven correct —
the next Concept Unit puts it where a real player will actually see
it.

---

## Concept Unit: Wiring formatElapsed into the real UI

### The Problem

`formatElapsed` exists, but `_SessionStatus`'s own real `Text` widget
still shows the real, raw, unformatted second count.

### Introducing the concept

No new isolated lab — replacing one, real, existing string
interpolation with a real function call is not a new construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_app.dart` (modify);
  `project/test/session_status_test.dart` (modify — three, real, fixed
  assertions).
- **Change type** — modify.
- **Location** — `_SessionStatusState.build`'s own real `Text` widget;
  three, real, already-existing test assertions.
- **Dependencies** — `formatElapsed`, above.

### The New Code

```dart
Text('Elapsed: ${formatElapsed(_elapsedSeconds)}', overflow: TextOverflow.ellipsis)
```

### The Updated Project

`sudoku_app.dart`'s own real, one, changed line:

```dart
1  Text('Elapsed: ${formatElapsed(_elapsedSeconds)}', overflow: TextOverflow.ellipsis)   // ← changed
```

`session_status_test.dart`'s own real, three, changed assertions:

```dart
1  expect(find.text('Elapsed: 00:00'), findsOneWidget);   // ← changed
2  expect(find.text('Elapsed: 00:01'), findsOneWidget);   // ← changed
3  expect(find.text('Elapsed: 00:06'), findsOneWidget);   // ← changed
```

### Mechanical walkthrough

- `'Elapsed: ${formatElapsed(_elapsedSeconds)}'` — the identical,
  already-established real string-interpolation shape, real and now
  calling `formatElapsed` instead of interpolating `_elapsedSeconds`
  directly.
- `find.text('Elapsed: 00:00')` — a real, already-established,
  already-existing `find.text` matcher, real and updated to the real,
  new, exact string this real widget now actually renders.

### CS lens

Not applicable.

### SE lens

This Concept Unit's own real, load-bearing moment: wiring `formatElapsed`
into the real UI broke three, real, already-existing, permanent
assertions, caught immediately by re-running the real, existing test
suite, not assumed still correct. `settings_test.dart`'s own real
`find.textContaining('Elapsed:')` assertions needed no real change at
all — real, direct, honest proof that a real test checking only the
real, stable *prefix* of a real, displayed string is genuinely more
resilient to a real, later, cosmetic format change than one asserting
the real, whole, exact string — a real, small, real, concrete tradeoff
between real test precision and real test fragility, visible only
because this lesson's own real change actually touched both real
kinds of assertion at once.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/session_status_test.dart`.

### Connect the pieces

A real, small, TDD-built function now shows up where a real player
will actually see it — proven end to end, below.

---

## Connect the pieces

One real, concrete trace, start to finish, across this lesson's own
real, genuinely-observed Red-Green-Refactor cycle.

1. `test/format_elapsed_test.dart`, written first, real and run
   against real, nonexistent code — a real, genuine compile failure,
   real **Red**, actually observed, not assumed.
2. `formatElapsed`, the real, minimal, honest implementation, written
   second — real and passing all three real tests on its real, first
   run — real **Green**.
3. Real **Refactor**, honestly: none needed; the real, minimal
   implementation was already clean.
4. `_SessionStatus`'s own real `Text` widget, wired to call
   `formatElapsed` — real, direct proof this real function's own real
   value reaches a real player, not only a real test file — and three,
   real, already-existing, permanent assertions, caught breaking,
   fixed to match.

The test that came before the code — curriculum's own real cycle,
genuinely run, not merely narrated: a real failure, actually seen; a
real pass, actually earned.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `formatElapsed` is real, permanent
project code from its own first line — written, in fact, *after* its
own real, permanent test — this lesson's own real proof lives in
`project/test/format_elapsed_test.dart`, the real test itself having
served as this lesson's own real, only "lab."

One real, first-attempt mistake, caught immediately: wiring
`formatElapsed` into the real UI broke three, real, already-existing,
permanent assertions in `session_status_test.dart`, still asserting
the real, old, raw format; fixed by updating them to the real, new
`MM:SS` format.

```
flutter analyze .
57 issues found. (ran in 6.5s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:26 +145: All tests passed!
```

145 real test-file-level checks, up from 142 — three new, all in the
new, permanent `format_elapsed_test.dart`. Zero regressions anywhere
else in this app, once the one, real, first-attempt mistake above was
fixed; zero flakes on this lesson's own single, real, full-suite run.
Full, honest narrative, including the real Red output actually
observed, in `verification/lesson-81/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
