# Lesson 44: Depending on the Idea, Not the Implementation

**Dependency inversion**

## What you will build

Nothing new — no new file, no new class. This lesson names, formally,
the real principle Lessons 39 and 43 already built two real, working
examples of (`Clock`/`SystemClock` and `PuzzleRepository`/
`InMemoryPuzzleRepository`), and proves, with a real, run search across
every real file in this project, that a specific real rule already
holds: `GameSession` and `SudokuBoard` — this app's own real, high-level
domain classes — never construct their own concrete dependencies
themselves. The transferable problem: curriculum.md's own Lesson 44
bullet states this in one line — "the core application depends on
abstractions, not databases" — this project has no database yet, so
this lesson proves the identical real principle against the two real
dependencies it does have.

## What you need to know first

- Lesson 39 ("Naming and Injecting a Dependency") — `Clock`,
  `SystemClock`, `clockProvider`.
- Lesson 43 ("Naming Where Data Actually Comes From") —
  `PuzzleRepository`, `InMemoryPuzzleRepository`, `puzzleRepositoryProvider`
  — the second, real, structurally identical example this lesson reuses.
- Lesson 41 ("Naming the Boundaries Already There") — the Domain,
  Application, and Infrastructure layers, and the real `Select-String`
  evidence technique this lesson's own Concept Unit 1 reuses.
- Lesson 12 ("Building on What Already Exists") — `abstract class`,
  `implements` — the real shape both `Clock` and `PuzzleRepository`
  share.

## Terms used in this lesson

- **The Dependency Inversion Principle** — a real, named software
  design principle (the "D" in SOLID): high-level modules should not
  depend on low-level modules; both should depend on abstractions.
  Exists so a high-level policy (what a game session *is*) never has to
  change just because a low-level detail (how the current time is read,
  where a puzzle's data lives) changes.
- **High-level module (reappearing sense, formalized)** — code
  expressing this app's own real policy or rules — `GameSession`,
  `GameSessionNotifier` — as opposed to code expressing one specific,
  swappable technical detail.
- **Low-level module** — code expressing one specific, concrete,
  swappable technical detail — `SystemClock`, `InMemoryPuzzleRepository`
  — as opposed to the real policy that depends on it.
- **Composition root** — the one, real, deliberate place in an app where
  abstractions actually get bound to concrete implementations. Exists as
  a named concept because *someone* has to construct the real, concrete
  class eventually — the principle isn't "never construct a concrete
  class," it's "don't let a high-level module be the one that does."
- **Inversion (the specific real meaning inside "dependency inversion")**
  — without this principle, a high-level module would depend directly on
  a low-level one (`GameSession` importing `SystemClock` directly, the
  same real shape Lesson 39 deliberately avoided). "Inversion" names the
  real reversal: instead, the low-level module depends on (implements)
  an abstraction the high-level module defines the shape of — the real
  dependency arrow points the opposite way from what a naive design
  would produce.

## Objects and methods used

- **`Clock` / `SystemClock` (reappearing, Lesson 39)**
  - *What it is:* the real abstraction/implementation pair this lesson's
    own Concept Unit 1 uses as its first piece of real evidence.
  - *Implementation:* `abstract class Clock { DateTime now(); }`;
    `class SystemClock implements Clock { @override DateTime now() =>
    DateTime.now(); }` (`project/lib/clock.dart`, unchanged since Lesson
    39, reread fresh this session).
  - *Its use:* real proof that `GameSession` depends on `Clock` (the
    abstraction) and never on `SystemClock` (the concrete detail)
    directly.
  - *Type:* an `abstract class` and its one real, concrete
    implementation.
  - *Responsibility:* unchanged from Lesson 39 — `Clock` names the
    contract; `SystemClock` fulfills it against the real OS clock.
  - *Depends on:* nothing (`Clock`); `dart:core`'s own real
    `DateTime.now()` (`SystemClock`).
  - *Connects to:* `SystemClock` is constructed in exactly two real
    kinds of place — `clockProvider` (the composition root) and test
    files explicitly choosing it — never inside `GameSession` or
    `SudokuBoard` themselves, this lesson's own central real claim.
  - *Shape:* `Clock` sits at the Domain/Infrastructure seam (Lesson 41);
    `SystemClock` is the Infrastructure-layer occupant.

- **`PuzzleRepository` / `InMemoryPuzzleRepository` (reappearing, Lesson
  43)**
  - *What it is:* the real, second abstraction/implementation pair this
    lesson's own Concept Unit 1 uses.
  - *Implementation:* `abstract class PuzzleRepository { List<List<int?>>
    startingPuzzle(); }`; `class InMemoryPuzzleRepository implements
    PuzzleRepository { ... }` (`project/lib/puzzle_repository.dart`,
    unchanged since Lesson 43, reread fresh this session).
  - *Its use:* real proof that this project's own real rule isn't a
    one-off accident specific to `Clock` — it holds for a second, real,
    independent dependency too.
  - *Type:* an `abstract class` and its one real, concrete
    implementation.
  - *Responsibility:* unchanged from Lesson 43.
  - *Depends on:* nothing (`PuzzleRepository`); the real, private
    `_startingPuzzle` constant (`InMemoryPuzzleRepository`).
  - *Connects to:* `InMemoryPuzzleRepository` is constructed in exactly
    one real place in this entire project —
    `puzzleRepositoryProvider` — never inside `GameSessionNotifier`,
    `GameSession`, or `SudokuBoard`.
  - *Shape:* same real seam as `Clock`/`SystemClock`, one layer over
    (Application/Infrastructure, per Lesson 43's own note).

- **`Select-String` (reappearing, Lesson 41, 42)**
  - *What it is:* the same real PowerShell text-search cmdlet already
    given full treatment twice.
  - *Implementation:* `Select-String -Path <files> -Pattern <regex>`,
    unchanged.
  - *Its use:* Concept Unit 1's own real evidence-gathering tool.
  - *Type:* a cmdlet.
  - *Responsibility:* unchanged.
  - *Depends on:* a real filesystem glob and a real regular expression.
  - *Connects to:* this lesson's own one real command, below.
  - *Shape:* outside this app's own architecture — a real diagnostic
    tool, used only this session.

---

## Concept Unit 1: The Dependency Inversion Principle, Proven Twice

### The Problem

`GameSession` needs to know the current time; `GameSessionNotifier`
needs a starting puzzle. Both real needs could, in principle, be met by
just calling `DateTime.now()` and constructing
`InMemoryPuzzleRepository()` directly, wherever they're needed — the
naive, direct way. Lessons 39 and 43 deliberately didn't do that. This
unit asks: does the real code actually hold to that decision everywhere,
or did a direct, concrete reference slip back in somewhere along the
way?

> **Socratic prompt:** `GameSession`'s own constructor takes a `Clock`
> parameter, never constructs one. If you searched every real `.dart`
> file in this project for the literal text `SystemClock(`, how many
> real matches would you predict finding inside `game_session.dart`
> itself — and how many inside files that are deliberately choosing
> which real implementation to use (a test, or the one real place
> production code wires everything together)? Second: `puzzleRepositoryProvider`
> is the one real line in this whole project that actually writes
> `InMemoryPuzzleRepository()`. What real, concrete problem would exist
> if that same literal text appeared in five different real files
> instead of one?

### Project Change

- **Reference Source:** curriculum.md, line 518-520 (Phase 5's own
  Lesson 44 bullet, "the core application depends on abstractions, not
  databases," read fresh this session) — this unit checks that claim
  against the real, current project.
- **Files affected:** none created, none modified — this unit runs one
  real, read-only search across `project/lib/` and `project/test/`.
- **Change type:** none — verification only.
- **Location:** every real `.dart` file in both real folders.
- **Dependencies:** PowerShell, already available (Lesson 2).

### The New Evidence

The real command, run from `project/`:

```powershell
Select-String -Path "lib\*.dart","test\*.dart" -Pattern "SystemClock\(|InMemoryPuzzleRepository\("
```

### Updated Project

Not applicable — a read-only diagnostic command, modifying nothing.

### Isolate and Discard

No throwaway lab — the real command above, run once this session, is
the evidence itself. This real property — a high-level module reaching
a dependency only through an abstraction, with concrete construction
confined to a small, deliberate set of real places — is what the
**Dependency Inversion Principle** (Terms, above) actually looks like
when it holds.

### Mechanical Walkthrough

- `Select-String` — already given full treatment in this lesson's own
  Objects and methods section, above.
- `-Path "lib\*.dart","test\*.dart"` — a real named argument, this time
  a comma-separated real list of two glob patterns (PowerShell's own
  real syntax for passing `-Path` more than one pattern at once) — every
  real file in both `project/lib/` and `project/test/`, unlike Lessons
  41-42's own searches, which covered `lib/` alone.
- `-Pattern "SystemClock\(|InMemoryPuzzleRepository\("` — a real regular
  expression (Terms, Lesson 41): two literal names, each immediately
  followed by `\(` — a real, escaped literal parenthesis (`\` here
  meaning "match this character literally, not as regex grouping
  syntax") — so only an actual real constructor *call*
  (`SystemClock()`) matches, never a bare mention of the type name
  alone (as in a real type annotation like `Clock`-typed parameter,
  which this pattern deliberately does not match); `|`, the same real
  alternation operator from Lesson 42, matching either literal.

### CS Lens

The **Dependency Inversion Principle** is a hard concept.

```
Also recognized in: a USB port (peripherals depend on the USB
specification; the specification never depends on any specific mouse or
keyboard), an electrical wall outlet (appliances depend on the plug
standard, not on any specific power plant), a car's own OBD-II
diagnostic port (a generic scanner tool depends on the standard, not on
one specific engine's own internals), Java's own JDBC (application code
depends on the `java.sql` interfaces, never a specific vendor's driver
class)
```

### SE Lens

The real principle is Dependency Inversion itself, now named formally
rather than only demonstrated. The alternative not chosen, concretely:
`GameSession`'s own constructor could have been written to accept
nothing and just call `DateTime.now()` internally — the exact real
shape Lesson 39 changed away from. The real tradeoff, now measurable
twice over: this project's own real `SystemClock(` matches are
confined to `clockProvider` (the one real composition root) and
`game_session_test.dart` (eleven real, deliberate test-site choices,
each explicitly picking the real clock because that particular test
doesn't care about elapsed time — a legitimate, real choice, not a
violation, since the test file itself is doing the choosing, not
`GameSession`); `InMemoryPuzzleRepository(` has exactly one real match,
`puzzleRepositoryProvider`, since no test yet has a real reason to
choose it over the fake. The honest, present cost: this rule is proven
by search, this session, not enforced by any tool — the same real,
open limitation Lesson 41 already named for the dependency-direction
rule generally.

### Commands Needed

- **`Select-String -Path "lib\*.dart","test\*.dart" -Pattern
  "SystemClock\(|InMemoryPuzzleRepository\("`** — run from `project/`,
  this session.

### Run It

Real, captured output:

```
lib\game_session_provider.dart:15:final puzzleRepositoryProvider = Provider<PuzzleRepository>((ref) => InMemoryPuzzleRepository());
lib\game_session_provider.dart:23:final clockProvider = Provider<Clock>((ref) => SystemClock());
test\game_session_test.dart:77:  final session = GameSession(SudokuBoard(_hardPuzzle), SystemClock());
test\game_session_test.dart:118:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:131:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:166:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:175:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:187:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:205:  final session = GameSession(SudokuBoard(_almostCompletePuzzle), SystemClock());
test\game_session_test.dart:215:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:237:  final playingSession = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:242:  final pausedSession = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
test\game_session_test.dart:250:  final session = GameSession(SudokuBoard(_milestonePuzzle), SystemClock());
```

Twelve real matches for `SystemClock(`, one real match for
`InMemoryPuzzleRepository(` — thirteen total, and zero of them inside
`game_session.dart` or `sudoku_board.dart` themselves. Every real match
is either `game_session_provider.dart`'s own two provider definitions
(the real composition root, Concept Unit 2's own subject) or a real
test file explicitly, deliberately choosing a concrete implementation
to inject from outside — never a high-level module reaching for its own
concrete dependency internally.

### Connect

The real search proves the principle holds, twice over, for both of
this project's own real dependencies. Concept Unit 2 names the one real
place in production code where the real binding from abstraction to
implementation actually happens.

---

## Concept Unit 2: The Composition Root

### The Problem

Someone, somewhere, has to actually write `SystemClock()` and
`InMemoryPuzzleRepository()` for real — an abstraction alone builds
nothing. Concept Unit 1's own real evidence already shows exactly where,
in production code: `game_session_provider.dart`, and nowhere else. This
unit names that place.

> **Socratic prompt:** if this project's own two real provider
> definitions (`clockProvider`, `puzzleRepositoryProvider`) were instead
> scattered — one in `main.dart`, one in `game_session.dart` — and Phase
> 6 later needed to swap `InMemoryPuzzleRepository` for a real
> `SqlitePuzzleRepository`, how many real files would a reader have to
> search to find every place that needed changing? Second: given
> `game_session_provider.dart` already holds both real provider
> definitions side by side, what does that tell you about why this file,
> specifically, is allowed to import `package:flutter_riverpod` at all —
> reusing Lesson 39's own real, hard-won discovery about which file was
> allowed to?

### Project Change

- **Reference Source:** `project/lib/game_session_provider.dart`, lines
  1-16 (its own real, current top section, read fresh this session) —
  this unit names, rather than changes, what's already there.
- **Files affected:** none — this unit is purely conceptual, reusing
  code Concept Unit 1 already showed evidence for.
- **Change type:** none.
- **Location:** `game_session_provider.dart`'s own two real, top-level
  provider declarations.
- **Dependencies:** none.

### The New Evidence

The same two real lines Concept Unit 1's own search already surfaced:

```dart
final puzzleRepositoryProvider = Provider<PuzzleRepository>((ref) => InMemoryPuzzleRepository());
final clockProvider = Provider<Clock>((ref) => SystemClock());
```

### Updated Project

Not applicable — nothing changed; the two real lines above are shown
complete, exactly as they already exist.

### Isolate and Discard

No throwaway lab — these two real, already-existing lines are the
smallest possible real example of this concept, and they already exist
side by side in the real project. This real pattern — the one place a
whole app's real abstractions get bound to their real concrete
implementations, deliberately kept small and centralized — is called
the **composition root** (Terms, above).

### Mechanical Walkthrough

- `Provider<PuzzleRepository>((ref) => InMemoryPuzzleRepository())` /
  `Provider<Clock>((ref) => SystemClock())` — both already given full,
  real treatment in Lessons 39 and 43; reread together here for a
  different, architectural question — not *how* either works, but *why*
  they're allowed to sit in the same file, next to each other, when
  `GameSession` and `SudokuBoard` themselves are forbidden from ever
  writing either concrete class name.

### CS Lens

Not repeated separately — the **composition root** concept is this
lesson's own second hard concept, but its own unrelated recurrences
overlap heavily with dependency injection's own, already given full
treatment in Lesson 39's CS lens (a game engine's asset-loading root, a
web framework's own service-container bootstrap file, an operating
system's own real driver-registration table) — all still accurate here,
applied specifically to the moment concrete classes get bound rather
than to the injection mechanism itself.

### SE Lens

The real principle is keeping dependency wiring **centralized and
small**. The alternative not chosen: let each file that needs a
`Clock`/`PuzzleRepository` construct its own real, concrete
implementation inline, wherever it's convenient in the moment. The real
tradeoff: `game_session_provider.dart` carries slightly more real
responsibility than a minimal Application-layer file otherwise would —
it's not just `GameSessionNotifier`'s own home, it's also this whole
app's real composition root — for the payoff that swapping either real
dependency (Phase 6's own future `SqlitePuzzleRepository`) touches
exactly one real line, confirmed directly by Concept Unit 1's own real
search finding exactly one production match for each concrete class.
The honest, present cost: this file is doing two real jobs at once
(owning `GameSessionNotifier`, and acting as the composition root) —
Lesson 47's own feature-oriented restructuring is where a real, dedicated
place for composition-root wiring, separate from `GameSessionNotifier`
itself, would naturally emerge, not fixed here.

### Run It

No command to run — this unit reuses Concept Unit 1's own already-real,
already-captured evidence.

### Connect

Concept Unit 1 proved the real rule holds. This unit names the one real
place that rule's own necessary exception — someone has to construct
the concrete class — is allowed to live, and why keeping that exception
small and centralized is itself the actual point of the principle, not
a loophole in it.

---

## Connect the Pieces

`GameSession`'s own constructor has taken a `Clock` since Lesson 39, and
`GameSessionNotifier.build()` has read a `PuzzleRepository` since Lesson
43 — this lesson added no new code because neither needed a single real
change. What it adds is proof, run this session, that the real principle
those two lessons already built holds everywhere at once:
`SystemClock(`/`InMemoryPuzzleRepository(` appear in exactly thirteen
real places across this entire project, and every one of them is either
`game_session_provider.dart`'s own real composition root or a test file
deliberately choosing which real implementation to inject — never
`game_session.dart` or `sudoku_board.dart` themselves, the two real,
high-level modules whose own real policies this whole principle exists
to protect.
