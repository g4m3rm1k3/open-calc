# Lesson 48: Does It Actually Hold Together?

**Architecture review**

## What you will build

One real, caught mistake gets fixed: `GameIntent` (`presentation
/game_intent.dart`, formerly `application/game_intent.dart`) moves out
of the Application layer, because a real, run search this lesson
performs proves it has zero real callers there — every real use is
inside `presentation/sudoku_app.dart`. Beyond that one fix, this lesson
runs no new logic and adds no new class — it re-checks, with real,
run evidence rather than trust, every real architectural claim Lessons
41-47 made, against the real, current, moved code, and closes Phase 5
with curriculum's own real milestone: *"Sudoku is now a properly
structured application rather than a pile of widgets."* The
transferable problem: curriculum.md's own Lesson 48 bullet says simply
"refactor everything built so far" — this lesson does that literally,
by re-running the same real evidence-gathering techniques Lessons 41
and 44 already established, now pointed at Lesson 47's own new file
tree, rather than assuming a large mechanical move left nothing to
recheck.

## What you need to know first

- Lesson 41 ("Naming the Boundaries Already There") — the four real
  layers, and the real `Select-String` dependency-direction technique
  this lesson reruns.
- Lesson 44 ("Depending on the Idea, Not the Implementation") — the
  real composition-root search this lesson reruns against the new file
  tree.
- Lesson 47 ("A Real Home for Every File") — the real folder structure
  this lesson checks.
- Lesson 2 ("Commanding the Machine Directly") — real terminal
  navigation, reused for this lesson's own real console-app run.

## Terms used in this lesson

- **Architecture review (the real, specific sense used here)** —
  re-verifying real, previously-made architectural claims against the
  real, current state of the code, after a substantial real change,
  rather than assuming those claims are still true because they used to
  be. Exists because a large real move (Lesson 47's own fourteen-file
  reorganization) is exactly the kind of change most likely to silently
  invalidate an earlier real proof without anyone noticing.
- **Regression (in the specific real sense of "an old proof, unchecked
  against new code")** — not a bug in the ordinary sense, but a real,
  previously-true architectural claim that a later real change made
  false without any test catching it, because the original real
  evidence was never rerun. This lesson's own central real risk.

## Objects and methods used

Every real class touched by this lesson's own one real fix —
`GameIntent`, `SelectCellIntent`, `EnterDigitIntent`,
`TogglePauseIntent`, `_SudokuAppState._dispatch` — already has full,
real CRC treatment from Lesson 37, restated in full there and reused,
unchanged in shape, here; this lesson changes exactly one real fact
about them (which file they live in), the same kind of change Lesson 47
already gave full CRC-adjacent treatment to. `Select-String` (Lesson
41, 42, 44) is reused a final time, unchanged, for this lesson's own
two real re-verification searches.

---

## Concept Unit 1: A Real Mistake, Caught by Re-Checking Instead of Assuming

### The Problem

Lesson 47 moved `game_intent.dart` into `application/`, reasoning, in
prose, that `GameIntent` sits "at the boundary Presentation code emits
into." That reasoning was never actually checked against real import
evidence the way every other file's placement was.

> **Socratic prompt:** Lesson 41's own real technique for classifying a
> file was never "read the doc comment and guess" — it was "run a real
> search and see who actually imports what." Applied to `GameIntent`
> specifically: does `application/game_session_provider.dart` — the one
> real file actually inside the Application layer — import
> `game_intent.dart` anywhere? If the answer turns out to be no, what
> does that tell you about where `GameIntent` actually belongs?

### Project Change

- **Reference Source:** `project/lib/features/sudoku/application
  /game_intent.dart` and `.../application/game_session_provider.dart` as
  they existed at the end of Lesson 47 (both read fresh this session) —
  no external reference; this is this project's own placement decision
  being re-checked.
- **Files affected:** `project/lib/features/sudoku/application
  /game_intent.dart` → moved to `project/lib/features/sudoku
  /presentation/game_intent.dart`; `project/lib/features/sudoku
  /presentation/sudoku_app.dart` (modified: one import line).
- **Change type:** refactor (move + fix one import).
- **Location:** whole file (the move); `sudoku_app.dart`'s own top
  import block.
- **Dependencies:** none.

### The New Evidence

The real command, run from `project/`, before making any change:

```powershell
Select-String -Path "lib\features\sudoku\**\*.dart" -Pattern "GameIntent"
```

### Updated Project

`sudoku_app.dart`'s own real import block, after the fix, in full:

```dart
1  import 'dart:async';
2
3  import 'package:flutter/material.dart';
4  import 'package:flutter_riverpod/flutter_riverpod.dart';
5
6  import '../application/game_session_provider.dart';
7  import '../domain/game_session.dart';
8  import '../domain/game_status.dart';
9  import '../domain/sudoku_board.dart';
10 import 'game_intent.dart';                            // ← changed: was '../application/game_intent.dart'
11 import 'number_pad_view.dart';
12 import 'sudoku_board_dto.dart';
13 import 'sudoku_board_view.dart';
```

`game_intent.dart` itself is unchanged, in full — `sealed class
GameIntent`, `SelectCellIntent`, `EnterDigitIntent`,
`TogglePauseIntent` — only its own real file path moved.

### Isolate and Discard

No throwaway lab — this is a direct, real correction to a real, already-
existing file, discovered by rerunning Lesson 41's own already-real
search technique against a case it hadn't been pointed at yet.

### Mechanical Walkthrough

- `import 'game_intent.dart';` — a real, relative import (Lesson 41,
  reappearing), now a bare filename again since `game_intent.dart` and
  `sudoku_app.dart` are siblings inside `presentation/`, the identical
  real shape `sudoku_board_view.dart`/`number_pad_view.dart`'s own
  imports into the same file already have.

### CS Lens

Not a new hard concept — this unit is **regression** (Terms, above),
made concrete: a real architectural claim (Lesson 47's own placement
reasoning) that turned out to be wrong the moment it was actually
checked, rather than merely asserted in a doc comment.

### SE Lens

The real principle is that **prose reasoning is not a substitute for
run evidence** — Lesson 47's own placement of `GameIntent` read
plausibly (it does sit "at a boundary"), and was still wrong, because
"at a boundary" was never actually the right test; "who really imports
this" was. The alternative not chosen: leave the placement as Lesson 47
made it, since nothing broke — `flutter analyze`/`flutter test` were
both clean either way, because Dart's own compiler has no opinion about
which folder a file sits in, only about whether imports resolve. The
real tradeoff: this fix costs one file move and one import line, for a
project where every real file's placement now has real, checked
evidence behind it, not just plausible-sounding prose from the lesson
that moved it. The honest, present cost: this is exactly the kind of
real mistake a tool could have caught automatically (an import-linter
rule enforcing "no file may sit in a layer folder it has zero real
same-layer callers in") — this project has no such tool yet, the same
real, open limitation Lesson 41 already named for the dependency-
direction rule generally.

### Commands Needed

- **`Select-String -Path "lib\features\sudoku\**\*.dart" -Pattern
  "GameIntent"`** — run from `project/`, this session, using PowerShell's
  own real `**` recursive-glob syntax (new to this curriculum): unlike
  the single-level `*.dart` glob Lessons 41-42 used, `**\*.dart` matches
  a `.dart` file at any real depth under `lib\features\sudoku\`, needed
  here since this lesson's own search must cross multiple real layer
  folders at once.

### Run It

Real, captured output, before the fix:

```
lib\features\sudoku\application\game_intent.dart:5:sealed class GameIntent {}
lib\features\sudoku\application\game_intent.dart:8:class SelectCellIntent extends GameIntent {
lib\features\sudoku\application\game_intent.dart:15:class EnterDigitIntent extends GameIntent {
lib\features\sudoku\application\game_intent.dart:24:class TogglePauseIntent extends GameIntent {}
lib\features\sudoku\presentation\sudoku_app.dart:49:  /// The one real place any [GameIntent] becomes an actual state change.
lib\features\sudoku\presentation\sudoku_app.dart:54:  void _dispatch(GameIntent intent) {
```

Every real match naming `GameIntent` outside its own declaration is
inside `presentation/sudoku_app.dart` — zero inside `application
/game_session_provider.dart`, the one real file actually occupying the
Application layer. Real, direct proof `GameIntent` was misplaced.

Real, captured output, `flutter analyze .`/`flutter test`, after the
move:

```
34 issues found.
```

— identical real count and categories to Lesson 47's own last run
(moving a file that nothing outside its own new sibling folder needs a
`../` path for doesn't change any lint count). Full test suite: every
real test still passing, `All tests passed!` — this fix, like every
real file move in Lesson 47, changed where code lives, not what it
does.

### Connect

One real placement mistake, caught by actually rerunning Lesson 41's
own evidence-gathering technique rather than trusting Lesson 47's own
prose. Concept Unit 2 reruns that same technique against everything
else, to check whether anything else was missed.

---

## Concept Unit 2: Rerunning Every Real Architectural Claim

### The Problem

Lesson 41 proved the Domain layer imports nothing from Flutter. Lesson
44 proved every concrete class construction happens in exactly one real
composition root. Both proofs were real, run evidence — at the time,
against the old, flat `lib/` folder. Lesson 47 moved every real file
since. Do both proofs still hold?

> **Socratic prompt:** Lesson 41's own real command searched
> `lib\*.dart` — a single-level glob, correct for a flat folder. Given
> Lesson 47's own new, nested folder tree, would that exact same command
> still find every real file it used to — or would it silently miss
> everything now sitting inside `features/sudoku/`?

### Project Change

- **Reference Source:** Lesson 41's own real Concept Unit 5 command and
  Lesson 44's own real Concept Unit 1 command (both reread fresh this
  session) — this unit reruns both, adapted for the new real folder
  depth.
- **Files affected:** none — both real commands are read-only.
- **Change type:** none — verification only.
- **Location:** every real file under `project/lib/features/sudoku/`.
- **Dependencies:** PowerShell.

### The New Evidence

Two real commands, run from `project/`:

```powershell
Select-String -Path "lib\features\sudoku\domain\*.dart" -Pattern "^import"
```

```powershell
Get-ChildItem -Path "lib\features\sudoku","test" -Filter "*.dart" -Recurse | Select-String -Pattern "SystemClock\(|InMemoryPuzzleRepository\("
```

### Updated Project

Not applicable — both commands are read-only diagnostics.

### Isolate and Discard

No throwaway lab — rerunning a real, already-proven technique against
new real evidence is the whole point of this unit; nothing new needs
inventing.

### Mechanical Walkthrough

- `Select-String -Path "lib\features\sudoku\domain\*.dart" -Pattern
  "^import"` — already given full treatment in Lesson 41; the only real
  change is the `-Path` argument's own glob, now reaching into
  `domain/` specifically rather than a flat `lib/`.
- `Get-ChildItem -Path "lib\features\sudoku","test" -Filter "*.dart"
  -Recurse` — a real, new-to-this-curriculum PowerShell construct: `Get
  -ChildItem` (Lesson 2, reappearing — lists real files) given two real
  path roots at once (a comma-separated real list) and a real
  `-Recurse` flag, descending into every real subfolder under each —
  needed here because Select-String's own `-Path` glob syntax doesn't
  reliably expand `**` the same way across every real PowerShell
  version, so piping `Get-ChildItem -Recurse`'s own real file list
  directly into `Select-String` (via `|`, Lesson 41, reappearing) is the
  more real, dependable way to search an arbitrarily nested tree.

### CS Lens

Not repeated separately — this unit reruns, rather than reintroduces,
Lesson 41's own "architectural claims need proof, not trust" idea and
Lesson 44's own Dependency Inversion evidence; both already have full
CS-lens treatment there.

### SE Lens

The real principle is that **verification has to be rerun after a
change that could invalidate it, not just performed once and trusted
forever**. The alternative not chosen: treat Lesson 41/44's own real
proofs as permanently settled once written down. The real tradeoff:
two small, real commands, rerun once, for genuine confidence Lesson 47's
own substantial move broke nothing about this project's own real
architectural guarantees. The honest, present cost: this rerun is
itself manual, this session, same as every earlier real search in this
curriculum — a real, automated architecture test (asserting these same
real properties in CI) is explicitly out of this lesson's own scope,
matching Phase 10's own future testing-strategy lessons.

### Commands Needed

Both real commands already shown in full under The New Evidence, above.

### Run It

Real, captured output, domain-layer import check:

```
lib\features\sudoku\domain\game_session.dart:1:import 'clock.dart';
lib\features\sudoku\domain\game_session.dart:2:import 'difficulty.dart';
lib\features\sudoku\domain\game_session.dart:3:import 'game_status.dart';
lib\features\sudoku\domain\game_session.dart:4:import 'sudoku_board.dart';
lib\features\sudoku\domain\sudoku_board.dart:1:import 'dart:math';
lib\features\sudoku\domain\sudoku_board.dart:3:import 'difficulty.dart';
```

Every real import inside `domain/` is either another real domain file
or `dart:math` — zero `package:flutter`, zero `package:flutter_riverpod`
— the identical real property Lesson 41 first proved, still true after
every file moved.

Real, captured output, composition-root check:

```
lib\features\sudoku\application\game_session_provider.dart:17:final puzzleRepositoryProvider = Provider<PuzzleRepository>((ref) => InMemoryPuzzleRepository());
lib\features\sudoku\application\game_session_provider.dart:29:final clockProvider = Provider<Clock>((ref) => SystemClock());
test\game_session_test.dart:78:  final session = GameSession(SudokuBoard(_hardPuzzle), SystemClock());
test\game_session_test.dart:119:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:132:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:167:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:176:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:188:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:206:  final session = GameSession(SudokuBoard(_almostCompletePuzzle), SystemClock());
test\game_session_test.dart:216:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:238:  final playingSession = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:243:  final pausedSession = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:251:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
```

Real, exact structural match to Lesson 44's own original finding:
exactly two real matches inside the real composition root
(`application/game_session_provider.dart`), eleven inside
`game_session_test.dart`'s own deliberate test-site choices, zero
anywhere in `domain/`. Both of this project's own central real
architectural guarantees survived Lesson 47's entire file move intact.

### Connect

Both of Lesson 41/44's own real claims still hold, confirmed by rerun
evidence, not assumption. Concept Unit 3 checks the strongest, oldest
real claim of all: that this whole phase never touched the one part of
this project that predates Flutter entirely.

---

## Concept Unit 3: The Phase 1 Console App, Unmodified, Still Real

### The Problem

`bin/sudoku_console.dart` — Phase 1's own real milestone deliverable —
has run, unmodified in its own logic, since before this app had a
single widget. Lesson 47 changed its one real import (`sudoku_board
.dart`'s new path). Does the actual console game still work?

> **Socratic prompt:** Phase 2's own milestone already proved this
> exact console app kept working after eight lessons of Domain-layer
> growth (candidate detection, backtracking, generation, difficulty
> classification). Given that this phase moved `SudokuBoard` itself into
> a real new folder — a change closer to its own file than anything
> Phase 2 did — would you expect this real proof to be easier or harder
> to repeat than Phase 2's own version?

### Project Change

- **Reference Source:** `project/bin/sudoku_console.dart` (unchanged in
  logic since the Phase 1 milestone; its one import line updated in
  Lesson 47, reread fresh this session) — no new reference; reruns an
  already-established real verification.
- **Files affected:** none — this unit only runs the already-real,
  unmodified console app.
- **Change type:** none — verification only.
- **Location:** n/a.
- **Dependencies:** none beyond the Dart SDK itself.

### The New Evidence

The real commands, run from `project/`:

```powershell
dart analyze bin\sudoku_console.dart
"1 1 4`nq" | dart run bin\sudoku_console.dart
```

### Updated Project

Not applicable — no file changes; this unit only runs already-real
code.

### Isolate and Discard

No throwaway lab — the real, already-existing console app, unmodified
since Phase 1, is itself the evidence.

### Mechanical Walkthrough

- `dart analyze bin\sudoku_console.dart` — already given full treatment
  across many earlier lessons; rerun here, unchanged, against the file's
  own one real, Lesson-47-updated import.
- `"1 1 4`nq" | dart run bin\sudoku_console.dart` — real PowerShell
  string interpolation (Lesson 2-adjacent) building a real, two-line
  piped input (`` `n `` is PowerShell's own real newline escape inside a
  double-quoted string) — `1 1 4` (a real move: row 1, column 1, digit
  4) then `q` — piped, via `|` (Lesson 41, reappearing), directly into
  the real console app's own `stdin`, the identical real mechanism
  Lesson 1's own verification originally used.

### CS Lens

Not repeated separately — this unit is the strongest possible real
instance of Lesson 41's own already-covered "framework independence"
idea: not just an import list with nothing Flutter-shaped in it, but an
entire real, separate, runnable program, proven still working, that has
never depended on Flutter for a single line of its own real history.

### SE Lens

The real principle, one final time this phase: **a real regression test
is only as good as how recently it was actually rerun.** The
alternative not chosen: trust that because `flutter test` passed, the
one real deliverable that predates Flutter entirely must be fine too —
a real, unwarranted inference, since nothing in `flutter test` ever
executes `bin/sudoku_console.dart` at all. The real tradeoff: one small,
real, manual run, for genuine, direct confirmation of curriculum's own
architectural point, restated at the Phase 3 milestone and still true
now: this project's actual Sudoku rules were never coupled to any one
real presentation layer, proven twice now, across two completely
different, substantial real refactors.

### Commands Needed

Both real commands already shown in full under The New Evidence, above.

### Run It

Real, captured output, `dart analyze`: 12 real, pre-existing
`avoid_print`/`avoid_relative_lib_imports` issues, zero errors — the
same real categories this file has carried since Phase 1, confirming
its own one Lesson-47-updated import resolves correctly.

Real, captured output, the real interactive run (trimmed): the real
starting board printed correctly; the real move `1 1 4` correctly
placed a `4` at row 1, column 1, visible in the real, redrawn board on
the very next line; `q` (not a valid `row col digit`, mirroring this
project's own real, established input-validation behavior) produced the
real "Please enter exactly three numbers" message; end of piped input
closed `stdin`, and the real program printed `Goodbye.` and exited
cleanly. Every real behavior matches this project's own established,
unmodified expectations exactly.

### Connect

Every real architectural claim this whole phase made — Domain purity,
one real composition root, and now, the oldest and strongest of all,
an entire real program that has run unmodified since before Flutter
entered this curriculum — survives Lesson 47's own substantial file
move, confirmed by rerun evidence, not by assumption.

---

## Connect the Pieces

One real mistake — `GameIntent` sitting in `application/` with zero real
callers there — is fixed, caught by literally rerunning Lesson 41's own
evidence-gathering technique against a case it hadn't checked yet, not
by trusting Lesson 47's own plausible-sounding prose. Every other real
architectural claim this phase made survives an actual rerun: the
Domain layer's own real import list is still exactly `dart:math` plus
itself; the composition root is still exactly one real file, `application
/game_session_provider.dart`; and `bin/sudoku_console.dart`, untouched
in its own logic since before this curriculum had ever heard of
Flutter, still runs a complete, correct, real game of Sudoku from a
piped `stdin`.

## Phase 5 milestone — Sudoku is now a properly structured application, not a pile of widgets

Curriculum's own words, now real: `Presentation` (`sudoku_app.dart`,
`sudoku_board_view.dart`, `number_pad_view.dart`, `game_intent.dart`,
`sudoku_board_dto.dart`) never decides a Sudoku rule, confirmed since
Lesson 41 and rechecked this lesson. `Application`
(`game_session_provider.dart`) orchestrates and owns this project's own
real, single composition root, confirmed twice now. `Domain`
(`sudoku_board.dart`, `game_session.dart`, `game_status.dart`,
`difficulty.dart`, `clock.dart`, `puzzle_repository.dart`) knows nothing
of Flutter, confirmed by real, run search both at Lesson 41 and again
here. `Infrastructure` (`system_clock.dart`,
`in_memory_puzzle_repository.dart`) holds this project's only two real
touches of the genuinely outside world. `SudokuBoardDto` bridges Domain
and Presentation honestly, its own placement argued rather than
asserted. And every one of curriculum's own remaining Lesson 42 example
concepts — `Score`, `Player`, `Achievement`, a distinct `Game` — stayed
un-built, each with a real, named future lesson, rather than becoming
dead weight this phase would have had to carry for nothing. Full,
final verification: `flutter analyze .` clean (34 info-level lints, the
same two pre-existing categories carried since early in this
curriculum, zero errors); `flutter test` — every real test file
passing, unchanged in what it proves; `bin/sudoku_console.dart` — Phase
1's own real deliverable, still a complete, correct, playable game.
Real, per-lesson verification logs live in `verification/lesson-41/`
through `verification/lesson-48/`.

## Phase 5 (Lessons 41-48) is now fully complete.

Per the user's own explicit instruction this session ("build phase 5
each lesson to the lesson schema, then stop for the next session") and
`project_flutter_curriculum_checkpoints`: checkpoints happen at phase
boundaries. This is one — pause here for user review before starting
**Phase 6 — Persistence** (Lessons 49-57: database fundamentals; a
local SQLite-backed database; schema design; migrations; a real
`ScoreRepository` implementation, following exactly the same real
`PuzzleRepository` shape this phase already built; saving and resuming
in-progress games — where `SudokuBoardDto`'s own honest Lesson 47
placement note finally gets a real answer, one way or the other).
