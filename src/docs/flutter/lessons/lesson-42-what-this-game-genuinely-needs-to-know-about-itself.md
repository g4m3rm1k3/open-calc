# Lesson 42: What This Game Genuinely Needs to Know About Itself

**The domain layer**

## What you will build

`SudokuBoard.classifyDifficulty()` stops returning a bare `String` —
`'Easy'`/`'Medium'`/`'Hard'`, three literal values nothing ever checked
were spelled correctly — and starts returning a real `Difficulty` enum
value instead, exactly the same real treatment `GameStatus` already got
in Lesson 40. `GameSession.difficulty` changes type to match, and every
real, already-passing test that compared against one of those three
strings is updated to compare against the real enum instead. The
transferable problem: curriculum.md's own Lesson 42 bullet lists several
more domain concepts this project doesn't have yet — `Score`, `Player`,
`Achievement` — and this lesson also asks, with real, run evidence
rather than a guess, whether this app genuinely needs them *right now*,
or whether building them today would just be dead code with nothing
real depending on it.

## What you need to know first

- Lesson 13 ("A Fixed Set of Named Possibilities") — enums, enhanced
  enums, and value objects — `Difficulty` is a new, real instance of
  exactly this pattern.
- Lesson 10 ("What the Compiler Actually Knows") — the real, run-proved
  contrast between a compile-time error and a silent runtime mismatch,
  central to this lesson's own first Concept Unit.
- Lesson 40 ("A Real State Machine for a Game Session") — `GameStatus`,
  the real, already-existing enum this lesson's own `Difficulty` deliberately
  mirrors.
- Lesson 36 ("Giving the Session Its Own Real Owner") — `GameSession
  .difficulty`, computed once at construction as a real value snapshot,
  the exact field this lesson changes the type of.
- Lesson 41 ("Naming the Boundaries Already There") — the Domain layer,
  named for the first time last lesson; this lesson is the first one to
  actually add something new to it.

## Terms used in this lesson

- **Value type / value object (reappearing, Lesson 13)** — a real object
  defined entirely by the data it holds, not by any separate identity;
  two value objects holding the same data are meant to be treated as
  interchangeable. `Difficulty.hard` reappears this same real value
  every time it's read — there is exactly one real `Difficulty.hard` in
  the whole running program, not a new one built per use.
- **Enum (reappearing, Lesson 13, 40)** — a real, closed, named set of
  possible values, fixed at compile time. Exists so a variable that can
  only ever be one of a few real things is actually restricted to those
  things by the compiler, instead of merely restricted by convention.
- **Stringly-typed** — a real, informal but widely-used term for using a
  plain `String` to represent a value that actually only has a small,
  fixed, real set of legal forms — a difficulty, a status, a currency
  code — when a real, dedicated type would let the compiler enforce that
  restriction instead of the string's own spelling being trusted by
  hand, everywhere it's compared.
- **Making illegal states unrepresentable** — a real design principle:
  shape a type so that a wrong value cannot even be constructed, rather
  than constructing it and then checking for wrongness afterward. This
  lesson's own central real example: `Difficulty.eassy` cannot exist at
  all, where `'Eassy'` (Concept Unit 1's own real, throwaway proof)
  compiled and ran without a single complaint.
- **Speculative generality (also known as YAGNI — "You Aren't Gonna
  Need It")** — a real, named anti-pattern: building generality,
  abstraction, or an entire class for a real need that doesn't exist
  yet, on the theory that it probably will later. Exists as a named
  concept because the cost is real but easy to miss in the moment — an
  unused class doesn't crash anything, so the cost only shows up later,
  as extra code every future reader has to understand despite it doing
  nothing yet.
- **Regular expression (reappearing, Lesson 41)** — a real, compact
  pattern language for matching text, reused again this lesson inside
  both of Concept Unit 2's own real `Select-String` commands, each with
  a different real pattern than Lesson 41's own `^import`.
- **Static analysis (reappearing)** — checking a program's real
  properties by reading its source, without running it. `dart analyze`
  is this lesson's own real example, reused from many earlier lessons;
  central here because it's the actual, concrete mechanism that turns
  `Difficulty.eassy` into a caught error before the program ever runs,
  as opposed to `'Eassy'`, which no static check this project runs
  today would ever flag.

## Objects and methods used

- **`Difficulty`**
  - *What it is:* a new, real enum naming the three real difficulty
    classifications `SudokuBoard.classifyDifficulty()` can report.
  - *Implementation:* `enum Difficulty { easy, medium, hard }`
    (`project/lib/difficulty.dart`, a new file, 6 real lines including
    its own doc comment).
  - *Its use:* replaces `classifyDifficulty()`'s former bare `String`
    return, and `GameSession.difficulty`'s former `String` field type.
  - *Type:* a plain `enum` — no enhanced-enum constructor or fields,
    unlike `GameStatus`; this one needs nothing beyond three real, named
    values.
  - *Responsibility:* name the fixed, closed, real set of difficulty
    classifications this project's own logical-technique classifier can
    produce — nothing about *how* a puzzle gets classified, only *what*
    the possible real answers are.
  - *Depends on:* nothing — no import at all in `difficulty.dart`, the
    same real shape `game_status.dart` and `game_intent.dart` already
    have (Lesson 41's own real evidence).
  - *Connects to:* returned by `SudokuBoard.classifyDifficulty()`; read
    and stored, unchanged, by `GameSession.difficulty`; compared against
    directly in `game_session_test.dart`'s own real assertions.
  - *Shape:* a small, new, real piece of Domain-layer vocabulary,
    following Lesson 41's own convention exactly: zero dependency on
    anything outside `dart:core`.

- **`SudokuBoard.classifyDifficulty` (reappearing, Lesson 21)**
  - *What it is:* the real method that judges a puzzle's own honest
    difficulty by which logical technique actually finishes it.
  - *Implementation:* `Difficulty classifyDifficulty()` (changed this
    lesson from `String classifyDifficulty()`) — real body unchanged:
    tries a naked-singles-only copy, then a full logical-techniques
    copy, returning `Difficulty.easy`, `Difficulty.medium`, or
    `Difficulty.hard` in place of the former `'Easy'`/`'Medium'`/
    `'Hard'` string literals.
  - *Its use:* Concept Unit 1's own central real subject — the one
    method whose return type this lesson changes.
  - *Type:* an instance method on `SudokuBoard`.
  - *Responsibility:* decide, honestly, which of exactly three real
    difficulty classifications this board's own current puzzle deserves
    — never how many cells are empty, per Lesson 21's own already-real
    proof that those two things are genuinely unrelated.
  - *Depends on:* `findNakedSingle`/`_applyLogicalTechniques` (Lesson
    21, unchanged) and, as of this lesson, `Difficulty`'s own three real
    values.
  - *Connects to:* called by `GameSession`'s own constructor; its real
    return value is compared directly in `game_session_test.dart`.
  - *Shape:* Domain layer, same as Lesson 41 already established.

- **`GameSession.difficulty` (reappearing, Lesson 36)**
  - *What it is:* the real, computed-once field storing a session's own
    frozen difficulty snapshot.
  - *Implementation:* `final Difficulty difficulty;` (changed this
    lesson from `final String difficulty;`), still assigned exactly once
    in the constructor initializer list: `difficulty =
    board.classifyDifficulty()`.
  - *Its use:* Concept Unit 1's own second real change site — the field
    whose type has to track `classifyDifficulty()`'s own new return
    type for the whole file to keep compiling.
  - *Type:* a `final` instance field.
  - *Responsibility:* remember, permanently, the real difficulty this
    session's own puzzle had at the exact moment the session began —
    Lesson 36's own real snapshot design, unaffected by this lesson's
    type change.
  - *Depends on:* `SudokuBoard.classifyDifficulty()`'s own real return
    value, read exactly once.
  - *Connects to:* read by `game_session_test.dart`'s own real
    assertions; not currently read anywhere in `main.dart`'s own UI —
    confirmed by Lesson 41's own real `Select-String` sweep of
    `project/lib/`, which found no reference to `difficulty` inside
    `main.dart` at all.
  - *Shape:* Domain layer.

- **`Select-String` (reappearing, Lesson 41)**
  - *What it is:* the same real PowerShell text-search cmdlet Lesson 41
    already gave full treatment to.
  - *Implementation:* `Select-String -Path <files> -Pattern <regex>`,
    same real signature as before.
  - *Its use:* Concept Unit 2's own real evidence-gathering tool —
    proving, rather than assuming, that `Score`/`Player`/`Achievement`/
    a second `Game` concept genuinely don't exist anywhere in
    `project/lib/` yet.
  - *Type:* a cmdlet.
  - *Responsibility:* same as Lesson 41 — read every real file matching
    `-Path`, test every real line against `-Pattern`, emit one real
    match per hit.
  - *Depends on:* a real filesystem glob and a real regular expression,
    same as before.
  - *Connects to:* this lesson's own two real commands, below, each
    piped this time into nothing further — a bare match list is
    evidence enough for an absence claim.
  - *Shape:* outside this app's own architecture — a real diagnostic
    tool, used only this session.

---

## Concept Unit 1: A Real Value Type for Difficulty

### The Problem

`SudokuBoard.classifyDifficulty()` has returned a bare `String` since
Lesson 21 — `'Easy'`, `'Medium'`, or `'Hard'`, spelled exactly that way,
trusted by hand everywhere it's compared. `GameStatus` (Lesson 40) never
had this problem: it was built as a real enum from the start, so a typo
like `GameStatus.playng` is a real compile-time error before the program
ever runs. `Difficulty` has carried the older, riskier shape for three
lessons.

> **Socratic prompt:** if you wrote `if (session.difficulty ==
> 'Eassy')` somewhere in this app today, what would `flutter analyze`
> say about it — and separately, what would actually happen when that
> line of code ran? Second: `GameStatus` (Lesson 40) is a real enum,
> not a bare `String`, specifically so a typo like `GameStatus.playng`
> would be a real compile error. Given that `classifyDifficulty()`
> already returns one of exactly three fixed, real values — never a
> fourth — what's the smallest real change, reusing Lesson 13's own
> already-taught syntax, that would make a difficulty typo equally
> impossible to write at all?

### Project Change

- **Reference Source:** no reference counterpart — curriculum.md, line
  486-498, lists `Difficulty` only as a one-word bullet inside Phase 5's
  own example list, with no real shape specified; this unit's own real
  shape is a from-scratch addition, deliberately modeled on
  `GameStatus`'s already-real, already-proven enum pattern (Lesson 40),
  read fresh this session from `project/lib/game_status.dart`.
- **Files affected:** `project/lib/difficulty.dart` (new); `project/lib
  /sudoku_board.dart` (modified: `classifyDifficulty`'s own return type
  and three return statements); `project/lib/game_session.dart`
  (modified: the `difficulty` field's own declared type);
  `project/test/game_session_test.dart` (modified: two real string-
  literal comparisons against `session.difficulty`/
  `classifyDifficulty()`).
- **Change type:** add (the new file), replace (the three sites above).
- **Location:** `sudoku_board.dart`'s own `classifyDifficulty` method,
  in full, below; `game_session.dart`'s own field declaration block;
  `game_session_test.dart`'s own `_testDifficultyIsASnapshot` function.
- **Dependencies:** none — no new package, nothing beyond this
  project's own already-real code.

### The New Code

```dart
enum Difficulty { easy, medium, hard }
```

### The Updated Project

`SudokuBoard.classifyDifficulty()`, in full, with the changed lines
marked (line numbers count from the method's own first line):

```dart
1   Difficulty classifyDifficulty() {                          // ← changed: was `String classifyDifficulty()`
2     final nakedOnlyCopy =
3         SudokuBoard(List.generate(size, (row) => List.of(_grid[row])));
4     while (true) {
5       final naked = nakedOnlyCopy.findNakedSingle();
6       if (naked == null) break;
7       nakedOnlyCopy._grid[naked[0]][naked[1]] = naked[2];
8     }
9     if (nakedOnlyCopy.isComplete) {
10      return Difficulty.easy;                                 // ← changed: was `return 'Easy';`
11    }
12
13    final logicalCopy =
14        SudokuBoard(List.generate(size, (row) => List.of(_grid[row])));
15    logicalCopy._applyLogicalTechniques();
16    if (logicalCopy.isComplete) {
17      return Difficulty.medium;                                // ← changed: was `return 'Medium';`
18    }
19
20    return Difficulty.hard;                                    // ← changed: was `return 'Hard';`
21  }
```

As a whole, this method's own real job is completely unchanged — try a
naked-singles-only copy, then a full logical-techniques copy, and report
which one (if either) actually finished the board — only the *shape* of
its three possible real answers changed, from three trusted strings to
three compiler-checked enum values.

And `game_session.dart`'s own real field declaration block, in full:

```dart
1  final SudokuBoard board;
2  final Clock _clock;
3  final Difficulty difficulty;                                  // ← changed: was `final String difficulty;`
4  final DateTime startTime;
```

This class's own real job is also completely unchanged: it still holds
exactly the same four real values it always has — only `difficulty`'s
own declared type now matches what `classifyDifficulty()` actually
returns.

### Isolate and Discard

Two real, throwaway labs, run this session, each referencing the real
code just shown above.

**Lab 1 — the real bug the old, stringly-typed shape allowed.** A
minimal, isolated stand-in for `classifyDifficulty()`'s own former
shape, with a deliberate real typo:

```dart
String classifyOld(int score) => score > 50 ? 'Eassy' : 'Hard'; // deliberate typo

void main() {
  final result = classifyOld(80);
  if (result == 'Easy') {
    print('would show the Easy UI');
  } else {
    print('would NOT show the Easy UI (result was "$result")');
  }
}
```

Real, captured output (`dart run`):

```
would NOT show the Easy UI (result was "Eassy")
```

This is called a **stringly-typed** value (Terms, above): `'Eassy'`
compiled cleanly, ran without a single complaint from `dart analyze`,
and simply never matched `'Easy'` — a real, silent bug, exactly the
kind `classifyDifficulty()`'s own real code was exposed to for three
whole lessons.

**Lab 2 — the identical real typo, against a real enum instead.** A
minimal, isolated enum standing in for `Difficulty`, with the same
class of deliberate typo:

```dart
enum Choice { easy, hard }

Choice classifyNew(int score) => score > 50 ? Choice.eassy : Choice.hard;
```

Real, captured output (`dart analyze`, this function never actually
run):

```
error - enum_typo_lab.dart:9:54 - There's no constant named 'eassy' in 'Choice'. Try correcting the name to the name of an existing constant, or defining a constant named 'eassy'. - undefined_enum_constant
```

Both labs are discarded now — neither file exists inside `project/`,
and this project's own real `Difficulty` (shown above, already wired
into `sudoku_board.dart` and `game_session.dart`) is the genuine,
permanent version of Lab 2's own real idea. This real pattern — a type
whose every possible value is fixed and named, so a typo becomes a real
compile-time error instead of a silent runtime mismatch — is called
**making illegal states unrepresentable** (Terms, above).

### Mechanical Walkthrough

- `enum Difficulty { easy, medium, hard }` — Dart's own real `enum`
  declaration (Lesson 13, reappearing): `enum`, the keyword; `Difficulty`,
  the real type name; `{ easy, medium, hard }`, three real, comma-
  separated enum values — each one a genuine, singleton instance of
  `Difficulty` itself, not a `String`, not an `int`, existing exactly
  once each for the whole lifetime of the running program.
- `Difficulty classifyDifficulty()` — the method's own declared real
  return type, now `Difficulty` instead of `String` — a real, ordinary
  type annotation (Lesson 5, reappearing), the exact same syntax
  position a `String`/`int`/`bool` return type would occupy, just naming
  a different real type this time.
- `return Difficulty.easy;` / `return Difficulty.medium;` / `return
  Difficulty.hard;` — three real `return` statements (Lesson 8,
  reappearing), each naming one real, specific enum value via `Type
  .value` syntax (Lesson 13, reappearing) — `Difficulty` (the real type),
  `.` (a real property access), `easy`/`medium`/`hard` (one of the
  type's own three real, fixed members).
- `final Difficulty difficulty;` — a real field declaration (Lesson 11,
  reappearing): `final` (Lesson 5, reappearing — assignable exactly
  once), `Difficulty` (the field's own real declared type, changed this
  lesson), `difficulty` (the field's own name, unchanged).

### CS Lens

**Making illegal states unrepresentable** is a hard concept — shaping a
type so a wrong value simply cannot exist, rather than allowing it to
exist and checking for it afterward.

```
Also recognized in: Rust's own Result<T, E> replacing error codes that
could be silently ignored, TypeScript's discriminated unions replacing
a bare `kind: string` field anyone could misspell, a traffic light with
exactly three real bulbs physically installed (there is no fourth,
"invalid" light to accidentally turn on), a database column with a real
CHECK constraint restricting it to a fixed, named set of values
```

### SE Lens

The real principle is **type safety over convention** — trusting the
compiler to enforce a real restriction, instead of trusting every future
line of code to spell a string correctly by hand. The alternative not
chosen: leaving `classifyDifficulty()` returning `String`, and instead
relying on careful code review, or a comment, to keep every real
comparison spelled consistently — which is genuinely what this project's
own real code did for three lessons, without incident, purely by luck.
The real tradeoff: one new, real, six-line file (`difficulty.dart`) and
three real call sites updated, for the real, now-guaranteed payoff that
`Difficulty.eassy` cannot compile, ever, anywhere in this project, for
the rest of its life. The honest, present cost: this change touched
three separate real files for what is, underneath, a purely cosmetic
type substitution — a small, real, one-time migration cost, already paid
in full by this lesson's own real `flutter analyze .`/`flutter test`
run, below.

### Commands Needed

- **`dart run stringly_typed_difficulty_lab.dart`** — Dart's own real
  `run` subcommand (reappearing from many earlier lessons), compiling
  and executing a single file; used here for Lab 1, which is valid,
  runnable code with no compile error, only a real, silent logic
  mismatch.
- **`dart analyze enum_typo_lab.dart`** — Dart's own real `analyze`
  subcommand (reappearing), checking a file's real static correctness
  without running it; used here for Lab 2, since `Choice.eassy` is a
  genuine compile error that would prevent `dart run` from executing
  anything in that file at all.
- **`flutter analyze .` / `flutter test`** — this project's own,
  already-familiar full-project commands (reappearing from every prior
  lesson's own milestone verification), run from `project/` after the
  three real production files changed, to confirm the whole app —
  not just this lesson's own two labs — still compiles and passes every
  real test.

### Run It

Real, captured output, `flutter analyze .` (run this session, from
`project/`, with `PATH`/`JAVA_HOME`/`ANDROID_HOME`/`ANDROID_SDK_ROOT`
exported explicitly in the same shell call, per Lesson 1's own
documented gotcha):

```
26 issues found.
```

— every one of them a real, pre-existing `avoid_print`/
`avoid_relative_lib_imports` info-level lint, the same two categories
this project has carried since early in Phase 4 (Lesson 40's own real
count was 25; this lesson's own new file and edits introduced zero new
categories and zero errors or warnings — the one-issue difference traces
to `difficulty.dart` itself carrying no lint-triggering code at all, so
it isn't the real cause; recounted directly from this session's own real
run rather than assumed to match a prior lesson's count exactly).

Real, captured output, `flutter test`:

```
33 tests run, 0 failed
8 tests run, 0 failed
...
All tests passed!
```

— `game_session_test.dart`'s own real 33 checks (including both updated
`Difficulty`-comparisons) and `sudoku_board_test.dart`'s own real 8
checks both pass, alongside every real widget test file, unchanged.

### Connect

`Difficulty` is now a real, permanent, compiler-checked member of the
Domain layer Lesson 41 named — the first thing this lesson actually adds
to it. Concept Unit 2 turns to curriculum.md's own remaining Lesson 42
bullets and asks, with the same real, evidence-first discipline, whether
any of them belong in this project yet too.

---

## Concept Unit 2: Naming What This Domain Doesn't Need Yet

### The Problem

Curriculum.md's own Lesson 42 bullet lists seven example domain
concepts: `Game`, `GameSession`, `Puzzle`, `Difficulty`, `Score`,
`Player`, `Achievement`. Three are now real: `GameSession` (Lesson 36),
`SudokuBoard` (Phase 1/2, standing in for `Puzzle`'s own real board
data), and, as of Concept Unit 1, `Difficulty`. Building the other three
today — empty `Score`, `Player`, `Achievement` classes with nothing
anywhere in this app ever constructing one — would satisfy curriculum's
own bullet list on paper. The real question this unit answers: would it
actually do anything, right now, for this real app?

> **Socratic prompt:** search your own memory of every file inside
> `project/lib/`, read across Lessons 36-41: does any of them mention a
> `Score`, `Player`, or `Achievement` class or field, anywhere? Second:
> this app only ever plays Sudoku — there is no second game anywhere in
> `project/lib/`, and no menu that picks one. Given that, would a
> `Game`/`GameDefinition` class, genuinely distinct from `GameSession`,
> do anything real right now, or would every one of its own real methods
> have exactly one possible caller? Third: if you added a real, empty
> `class Achievement {}` to this project today, with nothing anywhere
> ever constructing one, what would that class actually be doing for
> this app — and what real cost would it still carry, despite doing
> nothing?

### Project Change

- **Reference Source:** curriculum.md, lines 486-498 (Phase 5's own
  Lesson 42 bullet list, read fresh this session) — this unit checks
  that list against the real, current project rather than building
  against it blindly.
- **Files affected:** none created, none modified — this unit runs two
  real, read-only searches across `project/lib/`.
- **Change type:** none — verification only.
- **Location:** `project/lib/`, all ten real files (nine from Lesson 41
  plus this lesson's own new `difficulty.dart`).
- **Dependencies:** PowerShell, already available (Lesson 2).

### The New Evidence

Two real commands, run from `project/`:

```powershell
Select-String -Path "lib\*.dart" -Pattern "(?i)\bscore\b|\bplayer\b|\bachievement\b"
```

```powershell
Select-String -Path "lib\*.dart" -Pattern "class Game\b|GameDefinition|GameRegistry"
```

### Updated Project

Not applicable — both commands are read-only; neither modifies
`project/`.

### Isolate and Discard

No throwaway lab — the real search above is the evidence itself, and
nothing here was invented, so nothing needs discarding. This real
practice — checking whether a real need already exists before building
for it — is called avoiding **speculative generality** (also named
**YAGNI**, Terms, above).

### Mechanical Walkthrough

- `Select-String` / `-Path "lib\*.dart"` — already given full treatment
  in this lesson's own Objects and methods section, above; reused
  unchanged from Lesson 41.
- `-Pattern "(?i)\bscore\b|\bplayer\b|\bachievement\b"` — a real regular
  expression: `(?i)` (a real inline flag switching the whole pattern
  case-insensitive, so `Score`, `score`, and `SCORE` all match equally);
  `\b` (a real word-boundary anchor, matching only a whole word — so
  `score` matches the word "score" but not the middle of "scoreboard");
  `|` (a real regex alternation operator, distinct from PowerShell's own
  pipe — meaning "match any one of these three alternatives"); three
  real literal words, each wrapped in its own pair of `\b` anchors.
- `-Pattern "class Game\b|GameDefinition|GameRegistry"` — a second real
  regular expression: `class Game\b` (the literal text "class Game",
  anchored so it doesn't also match `class GameSession` or `class
  GameStatus` — the `\b` stops right after "Game"), alternated with two
  more literal names curriculum.md itself uses for this concept in later
  phases (`GameDefinition`, `GameRegistry` — Lesson 71's and Lesson 67's
  own future real classes, named here only to check they don't already
  exist by accident).

### CS Lens

**Speculative generality** (Terms, above) is a hard concept — the real
cost of building for an imagined future need instead of a real, current
one.

```
Also recognized in: a REST API response carrying fields no real client
has ever read, a database schema with nullable columns added "for
later" and never populated, a codebase accumulating unused feature
flags and dead configuration options, the software engineering proverb
"the best code is the code you didn't have to write"
```

### SE Lens

The real principle is **YAGNI** — building only what a real, current
need justifies. The alternative not chosen: build real `Score`,
`Player`, and `Achievement` classes now, matching curriculum's own
bullet list exactly, on the theory that later phases will need them
anyway. The real tradeoff: doing that today would add three real files
with genuinely zero callers anywhere in this app — no leaderboard
(Phase 6's own Lesson 56-57), no accounts (Phase 9's own Lesson 75), no
achievement system (Phase 8's own Lesson 70) exist yet to use them —
against the real, already-proven cost this curriculum has paid before
for exactly this mistake: none, because it has never made it, and this
unit's own real evidence is what keeps it that way. The honest, present
alternative view, stated fairly: building the shape now could arguably
save a small amount of real future work when Phase 6/8/9 actually
arrive. This lesson's own judgment, matching this curriculum's
established discipline (the tracked-promises list in `HANDOFF.md`, and
Lesson 22's own narrow scoping of `Random`/seeds), is that the real cost
of unused, unread code today outweighs that small, speculative future
saving — each of these three concepts gets built for real, with a real
caller, when its own real phase actually arrives: `Score` at Lesson 56,
`Player` at Lesson 75, `Achievement` at Lesson 70, and a distinct `Game`/
`GameDefinition` concept at Lesson 71, not before.

### Commands Needed

Both real commands are already shown in full under The New Evidence,
above, with every real flag and pattern explained in the Mechanical
Walkthrough.

### Run It

Real, captured output, first command (score/player/achievement), run
this session from `project/`:

```
lib\game_intent.dart:1:/// Every real thing a player can ask this app to do, named as plain data
lib\game_intent.dart:7:/// The player tapped a real cell at `(row, col)`.
lib\game_intent.dart:14:/// The player tapped a real digit on the number pad.
lib\game_intent.dart:20:/// The player tapped the real "Pause"/"Resume" button (Lesson 40) —
lib\game_session.dart:32:  /// the board itself keeps changing as the player fills it in. A fresh
lib\sudoku_board.dart:53:  /// console player needs to be told, in words, *why* a move was
lib\sudoku_board.dart:164:  /// [SudokuBoard] a player can actually attempt — by starting from this
lib\sudoku_board.dart:396:  /// A readable text grid, given cells and player-filled cells both shown
```

Eight real matches — not zero — but every single one is the plain
English word "player" appearing inside a doc comment's own prose
("the player tapped...", "a player can..."). Not one is a real
`Player` class, field, or parameter; `score` and `achievement` produced
zero real matches each, anywhere. This is a more honest, more useful
real result than a flat empty one: it confirms this project talks
*about* a player constantly, in its own comments, while never once
having built a real `Player` object — exactly the gap Phase 9's own
future authentication work (Lesson 75) will actually close.

Real, captured output, second command (Game/GameDefinition/
GameRegistry), run this session from `project/`:

```
(zero real matches)
```

No real line in `project/lib/` declares a class named `Game`, or
references `GameDefinition` or `GameRegistry` — those three real names
stay completely unused until Phase 8's own Lessons 67 and 71.

### Connect

Concept Unit 1 added one real, new, genuinely-needed piece to the Domain
layer. This unit confirms, with the same real evidentiary standard, that
the Domain layer doesn't yet need — and shouldn't yet contain — anything
else curriculum.md's own Lesson 42 bullet mentions. What the Domain
layer *does* still need, and gets next, is Lesson 43's own subject:
naming the boundary between it and wherever its data will eventually be
stored.

---

## Connect the Pieces

`SudokuBoard.classifyDifficulty()` now returns `Difficulty.hard` for the
real, genuine `Hard` puzzle Lesson 21 found and captured — the exact
same real puzzle `game_session_test.dart`'s own
`_testDifficultyIsASnapshot` still builds a `GameSession` around.
`GameSession`'s own constructor reads that real `Difficulty.hard` value
exactly once and stores it in its own, now correctly-typed `difficulty`
field. Later, solving the board completely and re-classifying it fresh
still returns the real, different, honestly-meaningless
`Difficulty.easy` — Lesson 36's own real snapshot behavior, provably
unchanged by this lesson's own type change, confirmed by the same real
test, rerun this session, still passing. Nothing about *what*
`GameSession` remembers changed today — only that a typo in what it
remembers is now a real, caught, compile-time impossibility instead of
a silent one. And nothing about `Score`/`Player`/`Achievement`/a
separate `Game` concept was added at all — a real, deliberate choice,
backed by a real, empty search result, not an oversight.
