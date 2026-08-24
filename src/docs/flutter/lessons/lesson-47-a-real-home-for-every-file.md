# Lesson 47: A Real Home for Every File

**Feature-oriented project structure**

## What you will build

`project/lib/` stops being one flat folder of fifteen files and becomes
`lib/main.dart` (a thin, four-line bootstrap) plus
`lib/features/sudoku/{domain,application,infrastructure,presentation}/`
— the exact real structure Lesson 41 already named in prose, now real,
on disk. Three real debts this curriculum has tracked since Lessons 39,
43, and 44 get paid off in the same lesson: `Clock`/`SystemClock` and
`PuzzleRepository`/`InMemoryPuzzleRepository` each split into a real
domain-layer interface file and a separate real infrastructure-layer
implementation file; `SudokuApp` itself moves out of `main.dart` into
`presentation/`, leaving `main.dart` as nothing but a real bootstrap.
The transferable problem: curriculum.md's own Lesson 47 bullet shows a
generic `features/sudoku/, features/scores/, .../settings/` tree built
for a multi-game platform this project doesn't have yet — this lesson
builds the real, single-feature version that's actually justified today,
and confronts, honestly, one real placement decision
(`SudokuBoardDto`) that doesn't have an obvious right answer yet.

## What you need to know first

- Lesson 41 ("Naming the Boundaries Already There") — Presentation,
  Application, Domain, Infrastructure — the four real names this
  lesson's own new folders are named after directly.
- Lesson 39 ("Naming and Injecting a Dependency") and Lesson 44
  ("Depending on the Idea, Not the Implementation") — `Clock`/
  `SystemClock`, both already flagged as carrying this exact real debt.
- Lesson 43 ("Naming Where Data Actually Comes From") — `PuzzleRepository`/
  `InMemoryPuzzleRepository`, the second real instance of the same debt.
- Lesson 45 ("Data Shaped for Carrying, Not for Deciding") — why
  `SudokuBoardDto` is not a domain object, directly relevant to this
  lesson's own placement reasoning for it.
- Lesson 11 ("A Shape of Data You Define") — Dart's own per-file
  privacy/library model, reused here since every real move in this
  lesson is, structurally, a library moving to a new file path.

## Terms used in this lesson

- **Feature-oriented structure** — organizing a codebase's own folders
  by *what real thing the code does* (a feature, like "sudoku") first,
  and only *then* by architectural layer within that feature — the
  opposite of grouping every widget together, every model together,
  regardless of which real feature each one belongs to. Exists so
  adding, understanding, or removing one real feature touches one real
  folder, not scattered pieces spread across `widgets/`, `models/`,
  `services/` alike.
- **Bootstrap (the real, narrow sense used here)** — the minimal real
  code whose only job is starting a program, with no real feature logic
  of its own. `main.dart`'s own real, final four lines this lesson
  reduces it to are this project's own first real example.
- **Composition root (reappearing, Lesson 44)** — the one real place
  abstractions get bound to concrete implementations; this lesson
  confirms it stays exactly where Lesson 44 already found it —
  `application/game_session_provider.dart` — even after every real
  file around it moves.

## Objects and methods used

Every real class this lesson touches — `Clock`, `SystemClock`,
`PuzzleRepository`, `InMemoryPuzzleRepository`, `SudokuBoard`,
`GameSession`, `GameStatus`, `Difficulty`, `GameSessionNotifier`,
`SudokuApp`, `SudokuBoardDto`, `SudokuBoardView`, `NumberPadView`,
`GameIntent` — already has full, real CRC treatment across Lessons
11-46, restated in full there per the Repetition Rule; not one of them
changes shape, behavior, or public signature in this lesson. Repeating
fourteen unchanged CRC blocks here would restate facts this lesson
doesn't touch; instead, each Concept Unit below names precisely which
real file each one now lives in, which is the one real fact this lesson
actually changes about them.

---

## Concept Unit 1: Splitting Every Abstraction From Its Implementation

### The Problem

`domain/clock.dart` (as of Lesson 46) holds both `abstract class Clock`
and `class SystemClock implements Clock` — an interface and its one real
concrete implementation, in the same file. Lesson 39's own SE lens
already named this honestly: *"`SystemClock` currently lives in the
same file as its own abstraction... Lesson 47's own job."*
`puzzle_repository.dart` carries the identical real debt, flagged the
same way in Lesson 43. Both are still true today.

> **Socratic prompt:** `Clock` has zero real dependencies; `SystemClock`
> depends on the real OS clock via `DateTime.now()`. Given Lesson 41's
> own real, run proof that the Domain layer never imports anything from
> `package:flutter`, would keeping `SystemClock` in the same file as
> `Clock` make that file's own real import list any different — or is
> the problem something other than imports? Second: if a future Lesson
> 50 (Phase 6) needs a real `SqlitePuzzleRepository`, where would you
> expect to find the file it should sit next to?

### Project Change

- **Reference Source:** `project/lib/clock.dart` and
  `project/lib/puzzle_repository.dart` as they existed at the end of
  Lesson 46 (both read fresh this session before being split) — no
  external reference; this is this project's own tracked, self-imposed
  debt being paid off.
- **Files affected:** `project/lib/clock.dart` → split into
  `project/lib/features/sudoku/domain/clock.dart` (interface only) and
  `project/lib/features/sudoku/infrastructure/system_clock.dart` (new);
  `project/lib/puzzle_repository.dart` → split into
  `project/lib/features/sudoku/domain/puzzle_repository.dart` (interface
  only) and `project/lib/features/sudoku/infrastructure
  /in_memory_puzzle_repository.dart` (new).
- **Change type:** refactor (split one file into two, each moved).
- **Location:** whole files.
- **Dependencies:** none new.

### The New Code

The real, complete new `infrastructure/system_clock.dart`:

```dart
import '../domain/clock.dart';

class SystemClock implements Clock {
  @override
  DateTime now() => DateTime.now();
}
```

### The Updated Project

`domain/clock.dart`, in full, after the split:

```dart
1  abstract class Clock {
2    DateTime now();
3  }
```

Three real lines — smaller than before, since `SystemClock`'s own real
body (three more lines) now lives in its own, separate real file, shown
above. `domain/puzzle_repository.dart` received the identical real
treatment: `PuzzleRepository`'s own abstract method stays;
`InMemoryPuzzleRepository` (plus the real, private `_startingPuzzle`
constant it depends on) moved to
`infrastructure/in_memory_puzzle_repository.dart`, importing
`../domain/puzzle_repository.dart`.

### Isolate and Discard

No throwaway lab — Lesson 39's own real `Clock`/`SystemClock` pair,
already fully explained, is the concrete example being split; nothing
new needed inventing.

### Mechanical Walkthrough

- `import '../domain/clock.dart';` — Dart's own real `import` directive
  (Lesson 41, reappearing), this time with a real relative path
  climbing one real directory up (`../`) before descending into
  `domain/` — `infrastructure/system_clock.dart` and
  `domain/clock.dart` are now siblings under `features/sudoku/`, so
  reaching one from the other needs a real, explicit relative path,
  unlike the flat `lib/` folder's own former bare filenames.
- `class SystemClock implements Clock` — already given full treatment
  in Lesson 39; unchanged here, only relocated.

### CS Lens

**Separating an interface from its implementation at the file level**
is a hard concept, distinct from separating them merely by class
declaration (which Lessons 12/39 already did).

```
Also recognized in: a C/C++ header (`.h`) file declaring a contract
separately from its own `.c`/`.cpp` implementation file, a Java package
convention placing an `interface` and its real implementing classes in
different real packages entirely, a plugin system's own real SDK
(defines the contract) shipped separately from any specific real plugin
(implements it)
```

### SE Lens

The real principle is that **a file boundary is itself a real
architectural signal**, not just an organizational convenience — a
reader opening `domain/clock.dart` now sees only a contract, with no
real, concrete detail (`DateTime.now()`) to distract from it; a reader
opening `infrastructure/system_clock.dart` sees exactly one real,
concrete decision, in isolation. The alternative not chosen: leave both
pairs exactly as Lessons 39/43 built them, tracked honestly as debt but
never paid. The real tradeoff: two more real, tiny files, for a real,
permanent structural guarantee that a reader can answer "is this
abstract or concrete?" from the file path alone, before reading a
single line. No new honest cost — this is a pure, real reorganization;
nothing about either class's own real behavior changed, confirmed by
this lesson's own full test suite, still 100% passing afterward.

### Run It

Verified together with Concept Units 2-3, below, in one real,
end-to-end `flutter analyze .`/`flutter test` pass — splitting these two
files in isolation would have left the project in a real, temporarily
broken state (nothing yet importing the new paths), so this Concept
Unit's own real verification is necessarily batched with the rest of
this lesson's changes, per the Verification Rule's own batching
preference.

### Connect

Two of this lesson's own three tracked debts are paid. Concept Unit 2
moves every real file — these two splits included — into its own real,
named layer folder.

---

## Concept Unit 2: A Real Folder Per Layer

### The Problem

Lesson 41 named four real layers by writing about them; nothing in the
real, on-disk `lib/` folder reflected that naming until this unit.
Every real file — `sudoku_board.dart`, `game_session.dart`,
`game_session_provider.dart`, `sudoku_board_view.dart`, and more — has
sat in one flat folder since Lesson 26.

> **Socratic prompt:** Lesson 41's own real, run `Select-String` search
> already classified every file in `project/lib/` into one of four real
> layers, using nothing but real import evidence. Given that search's
> own real results, which four real folder names would you create, and
> which real file would you expect to be the only one that doesn't
> obviously belong in exactly one of them?

### Project Change

- **Reference Source:** curriculum.md, lines 545-567 (Phase 5's own
  Lesson 47 bullet, the generic `features/sudoku/, features/scores/,
  .../settings/` tree, read fresh this session) — adapted, not copied:
  this project has exactly one real feature, so only
  `features/sudoku/` is real; `features/scores/`, `.../settings/`,
  `.../achievements/` don't exist, matching Lesson 42's own established
  discipline against building unused scaffolding.
- **Files affected:** every real file in `project/lib/` (fourteen files
  moved into `features/sudoku/{domain,application,infrastructure,
  presentation}/`, one — `main.dart` — staying at `lib/` root).
- **Change type:** move (all fourteen), refactor (updating every real
  relative import to match the new real depth).
- **Location:** `project/lib/` as a whole.
- **Dependencies:** none new.

### The New Code

Not applicable in the usual sense — no new logic, only real file moves
and real import-path updates. The smallest real representative example:
`domain/game_session.dart` moved unchanged (its own imports —
`clock.dart`, `difficulty.dart`, `game_status.dart`, `sudoku_board.dart`
— stayed bare filenames, since all four now sit together in the same
real `domain/` folder), while `application/game_session_provider.dart`
needed every one of its own domain-file imports rewritten with a real
`../domain/` prefix, since `application/` and `domain/` are now
siblings.

### The Updated Project

The real, final structure, confirmed by a real, run directory listing
this session:

```
lib/
  main.dart
  features/
    sudoku/
      domain/
        clock.dart
        difficulty.dart
        game_session.dart
        game_status.dart
        puzzle_repository.dart
        sudoku_board.dart
      application/
        game_intent.dart
        game_session_provider.dart
      infrastructure/
        in_memory_puzzle_repository.dart
        system_clock.dart
      presentation/
        number_pad_view.dart
        sudoku_app.dart
        sudoku_board_dto.dart
        sudoku_board_view.dart
```

### Isolate and Discard

No throwaway lab — this is a direct, real, mechanical application of
Lesson 41's own already-real layer classification; nothing new needed
inventing, only executing.

### Mechanical Walkthrough

- `../domain/clock.dart` (and five more real imports shaped identically
  in `application/game_session_provider.dart`) — Dart's own real
  relative-import syntax (Lesson 41, reappearing), each one now needing
  a real `../` segment it didn't before, since `application/` and
  `domain/` weren't siblings until this unit created them as such.
- `../application/game_intent.dart`, `../domain/game_session.dart`, and
  five more, inside the new `presentation/sudoku_app.dart` — the same
  real relative-import mechanism, now crossing two real layer
  boundaries at once (Presentation reaching into both Application and
  Domain) from a single real file, exactly matching curriculum's own
  dependency-direction diagram (Lesson 41): Presentation is allowed to
  depend on both.
- `'features/sudoku/presentation/sudoku_app.dart'` — the one real import
  remaining in `lib/main.dart` itself, a real relative path descending
  from `lib/`'s own root into the new tree, rather than climbing out of
  it — the only real file in this whole lesson that moves *toward* the
  new structure from outside it, rather than *within* it.

### CS Lens

Not repeated separately — **feature-oriented structure** (Terms, above)
is this unit's own real, central, hard concept.

```
Also recognized in: Ruby on Rails' own real "engine" convention
(bundling a feature's models/views/controllers together, not by kind),
a microservices architecture (each real service owns its whole real
stack, not shared "database service"/"API service" layers spanning
every feature), Android's own real "package by feature" convention
(contrasted explicitly against "package by layer" in that ecosystem's
own long-running real debate), a monorepo's own per-package folder
convention (each real package self-contained, not grouped by file type
globally)
```

### SE Lens

The real principle, same as Concept Unit 1's but applied at the whole-
project scale: **a folder boundary is a real architectural signal**.
The alternative not chosen: curriculum's own literal, generic tree
(`features/sudoku/, features/scores/, features/settings/,
features/achievements/`), built in full today. The real tradeoff for
building only `features/sudoku/`: this project stays honestly scoped to
what it actually has, at the real cost that this exact folder move will
need to happen again, partially, whenever Phase 8 (Lesson 72) adds a
genuinely second real game — a real, deferred cost, not eliminated,
matching Lesson 42's own already-established discipline about not
building for a need that doesn't exist yet. The honest, present cost of
the move itself: every real test file's own import list grew longer
(a real, measurable effect, confirmed in this lesson's own real
`flutter analyze .` run, below, which found the same lint categories at
the same real counts, unaffected by path length) — a small, real,
one-time readability cost for real, permanent architectural clarity.

### Commands Needed

- **`flutter analyze .` / `flutter test`** — run from `project/`, this
  session, after every real file in this lesson moved.

### Run It

Real, captured output, `flutter analyze .`:

```
34 issues found.
```

— same real, pre-existing categories as Lesson 46's own last run
(`avoid_print`/`avoid_relative_lib_imports`), one more than that run's
own 33, because `game_session_test.dart` gained one additional real
relative import (`system_clock.dart`, needed once `SystemClock` moved
out of `clock.dart` — Concept Unit 1's own real consequence, verified
here); zero errors, zero warnings.

Real, captured output, `flutter test`: every real test file passes —
`game_session_test.dart` 33/33, `sudoku_board_test.dart` 8/8,
`sudoku_board_dto_test.dart` 9/9, every real widget test — `All tests
passed!` A real, honest mistake, caught and fixed in this same session
before this lesson was called done: the very first real run after
moving every file failed with fourteen real compile errors — every test
file that constructs `SudokuApp()` directly (`cell_selection_test.dart`,
`game_session_lifecycle_test.dart`, `game_session_provider_test.dart`,
`layout_test.dart`, `main_smoke_test.dart`, `number_pad_test.dart`,
`session_status_test.dart`) still only imported `package:open_calc
_sudoku/main.dart`, which no longer exports `SudokuApp` at all once
Concept Unit 3 (below) moved it out — fixed by adding the real, new
`features/sudoku/presentation/sudoku_app.dart` import to each affected
test file.

### Connect

Every real file has a real, permanent home matching Lesson 41's own
already-named layers, except one: `main.dart` itself, still holding
`SudokuApp` alongside its own real bootstrap job. Concept Unit 3 splits
that apart too.

---

## Concept Unit 3: A Real, Minimal Bootstrap

### The Problem

`lib/main.dart`, before this unit, was 176 real lines: a four-line
`void main()` function, and 172 more lines building `SudokuApp`,
`_SudokuAppState`, `_SessionStatus`, and `_SessionStatusState` — real,
substantial Presentation-layer code, sitting in the one real file Dart
and Flutter's own tooling requires as this package's actual entry
point.

> **Socratic prompt:** Flutter's own real tooling (`flutter run`,
> `pubspec.yaml`'s own conventions) requires an entry point at
> `lib/main.dart` specifically — that real constraint doesn't move.
> Given that, what's the smallest real thing `lib/main.dart` could
> contain and still work? Second: `SudokuApp` is a real,
> presentation-layer widget, per Lesson 41's own already-real
> classification. If it moved into `features/sudoku/presentation/`
> alongside `SudokuBoardView`/`NumberPadView`, what would `main.dart`
> need to import to still be able to build one?

### Project Change

- **Reference Source:** `project/lib/main.dart` as it existed at the end
  of Lesson 46 (176 real lines, read fresh this session before being
  split) — no external reference.
- **Files affected:** `project/lib/main.dart` (rewritten, most content
  removed); `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (new — receives everything `main.dart` no longer has).
- **Change type:** refactor (extract).
- **Location:** whole files.
- **Dependencies:** none new.

### The New Code

The real, complete, final `lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'features/sudoku/presentation/sudoku_app.dart';

void main() {
  runApp(const ProviderScope(child: SudokuApp()));
}
```

### The Updated Project

Not applicable — the code above is the whole, final file; there is
nothing surrounding it to show in context.

### Isolate and Discard

No throwaway lab — `main.dart`'s own real, already-existing `void
main()` (unchanged since Lesson 26) is the concrete example this unit
narrows everything else away from.

### Mechanical Walkthrough

- `import 'features/sudoku/presentation/sudoku_app.dart';` — a real,
  relative import (Lesson 41, reappearing) descending from `lib/`'s own
  root into the new real tree — this file's only real dependency beyond
  Flutter and Riverpod themselves.
- `void main() { runApp(const ProviderScope(child: SudokuApp())); }` —
  every real piece here already given full treatment in Lessons 26 and
  38; unchanged in content, now the file's own entire real body.

### CS Lens

Not repeated separately — this unit is **bootstrap** (Terms, above)
made concrete, itself one specific real instance of Concept Unit 2's
own already-covered feature-oriented-structure idea: `main.dart` is the
one real file that *cannot* move into `features/sudoku/`, precisely
because its job is wiring the platform to a feature, not being one.

### SE Lens

The real principle is the **Single Responsibility Principle**, applied
to `main.dart` itself this time: its only real job now is starting the
program — choosing which real widget to hand `runApp`, wrapped in
whichever real providers the whole app needs. The alternative not
chosen: leave `SudokuApp` where Lesson 26 first put it, growing further
with every future lesson. The real tradeoff: one new real file
(`sudoku_app.dart`, 176 lines, all real code moved verbatim, none
invented) for a `main.dart` that a reader can read in full, in seconds,
and never needs to touch again for ordinary feature work. The honest,
present cost, named plainly rather than smoothed over:
`main_smoke_test.dart`'s own real name no longer quite matches what it
tests — it pumps `SudokuApp` (from `sudoku_app.dart`), not literally
`main.dart` — a small, real, cosmetic mismatch left as-is this lesson,
since renaming test files touches nothing about correctness and this
curriculum's own established convention (Lesson 28) is to flag such a
gap honestly rather than chase every consequence of a real refactor
into an unbounded second one.

### Run It

Verified together with Concept Unit 2's own real `flutter analyze .`/
`flutter test` run, above — both units' real changes were made and
tested together in the same session, per the Verification Rule's
batching preference.

### Connect

Every real file that can have an unambiguous home now does. Concept
Unit 4 confronts the one real file whose home is a genuine, honest
judgment call.

---

## Concept Unit 4: The One Real File Without an Obvious Home

### The Problem

`SudokuBoardDto` is not a domain object (Lesson 45's own explicit
teaching) — so it cannot honestly sit in `domain/`. It also touches no
real infrastructure resource today — no file, no database, no network —
so `infrastructure/`, the classic real home for a DTO, isn't obviously
correct either. Its one, real, current caller is `SudokuApp` itself, a
`presentation/` file.

> **Socratic prompt:** if you had to choose between "place a file by
> what it structurally *is*" and "place a file by who actually *calls*
> it, today," which would you pick for `SudokuBoardDto`, and why might a
> real, honest answer be "it depends," rather than a confident rule?
> Second: if Phase 6 later adds a real `SudokuBoardRepository` inside
> `infrastructure/`, and that new class starts calling
> `SudokuBoardDto.fromBoard`/`toBoard` too, would that change which
> answer is more honest?

### Project Change

- **Reference Source:** `project/lib/features/sudoku/presentation
  /sudoku_board_dto.dart` (this lesson's own real placement, already
  made in Concept Unit 2's own file move) — this unit explains and
  defends a decision already executed, rather than executing a new one.
- **Files affected:** none beyond Concept Unit 2's own already-real
  move; this unit adds one real, honest doc-comment paragraph to
  `sudoku_board_dto.dart` itself, explaining the placement.
- **Change type:** none beyond the doc comment (already shown in
  Concept Unit 2's own file listing).
- **Location:** `sudoku_board_dto.dart`'s own top doc comment.
- **Dependencies:** none.

### The New Code

The real, added doc-comment paragraph (already part of the file as
moved in Concept Unit 2, quoted here for its own explanation):

```dart
/// Lesson 47: placed under `presentation/`, not `domain/` or
/// `infrastructure/` — a real, honest judgment call, not an obvious
/// one. It cannot live in `domain/`, since Lesson 45 defines a DTO
/// specifically as *not* a domain object. `infrastructure/` is the more
/// classic real home for a DTO (that's genuinely where Phase 6's own
/// future JSON/SQLite mapping would reach it from), but this file's
/// only real, current caller is `SudokuApp` itself, a presentation-layer
/// class — no real infrastructure code touches it yet. Placed here to
/// match its real, current, demonstrated usage rather than a speculative
/// future one; flagged honestly as a call Phase 6 may reasonably revisit
/// once a real serialization consumer exists.
```

### Isolate and Discard

No throwaway lab — this unit is pure, real, architectural reasoning
about a decision Concept Unit 2 already made mechanically; nothing here
is invented code.

### Mechanical Walkthrough

Not applicable in the syntactic sense — this unit's own "code" is
prose, a doc comment, not a new construct; there is no new token to
enumerate beyond ordinary Dart doc-comment syntax (`///`), already given
full treatment in Lesson 4.

### CS Lens

Not a new hard concept — this unit is a real, concrete instance of a
tension every real layered architecture eventually meets: a type that
genuinely sits *between* two layers, honestly.

```
Also recognized in: a "ViewModel" type in MVVM architectures (not quite
the domain model, not quite the view), a GraphQL resolver's own
intermediate types (not the database row, not the client-facing shape),
a compiler's own intermediate representation (not the source AST, not
the target machine code)
```

### SE Lens

The real principle is **deciding from real, current evidence over
architectural purity for its own sake**. The alternative not chosen:
force `SudokuBoardDto` into `infrastructure/` today, on the theory that
DTOs "belong" there in general, even with zero real infrastructure code
actually calling it. The real tradeoff: placing it in `presentation/`
means Phase 6 may need to move it again once a real repository
implementation starts using it directly — an honest, named, deferred
cost, not a hidden one. The honest, present benefit: every real file's
placement in this project, after this lesson, reflects real,
demonstrated usage rather than a rule applied mechanically to a case it
doesn't cleanly fit — the exact same real discipline Lesson 42 already
established for `Score`/`Player`/`Achievement`, applied here to a
placement question instead of a build-or-defer one.

### Run It

No command to run — this unit adds no new real, executable code.

### Connect

Every real file in `project/lib/` now has a real, deliberate home —
three by unambiguous rule, one by honest, documented judgment. Together,
Concept Units 1-4 complete the real move Lesson 41 only ever named in
prose.

---

## Connect the Pieces

`Clock` and `PuzzleRepository` now live in `domain/`, each with its one
real implementation split out into `infrastructure/` — two tracked
debts, paid. `game_session_provider.dart`, `application/`'s own real
composition root, still binds every real abstraction to its concrete
implementation in exactly one place, confirmed unchanged by this
lesson's own full test suite. `main.dart` shrank from 176 real lines to
6, its entire remaining job "start the app" — nothing about what the app
*does*. `SudokuApp` itself, and everything it renders, now lives under
`presentation/`, reachable by `main.dart` through exactly one real
import. And `SudokuBoardDto` sits where its real, current evidence
says it belongs, not where an abstract rule would have placed it,
honestly flagged for Phase 6 to reconsider. Every real test — 22
widget-test cases, plus `game_session_test.dart`'s 33, `sudoku_board
_test.dart`'s 8, and `sudoku_board_dto_test.dart`'s 9 — passes,
unchanged in what it proves, confirming this entire lesson moved code,
and moved nothing else.
