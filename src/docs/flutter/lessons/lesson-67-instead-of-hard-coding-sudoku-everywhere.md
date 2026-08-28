# Lesson 67: Instead of Hard-Coding Sudoku Everywhere

**What you will build.** A real, generic `GameRegistry` — a real,
small catalog any real, generic platform code can ask "what real
games exist?" and "give me the one named `X`" — plus this app's own
real, first `GameDefinition`, naming Sudoku itself as real, discoverable
data rather than an assumption baked into every real file that
happens to need to know it exists. The transferable problem:
curriculum's own words name it directly — a system that only ever
knows about one real thing it manages has that one thing's own
identity smeared across every real file that touches it; a real
registry is what lets "which real things exist" become one, real,
inspectable answer instead of an implicit, scattered one.

**What you need to know first.** `GameDefinition`, from this
project's own real, generic `game_platform/domain/` area — the one
real type this lesson's own registry actually catalogs. This app's
own real, layered architecture and its own already-established,
evidence-first habit of searching real code before assuming what does
or doesn't exist yet.

**Terms used in this lesson**

- **Registry (as a design pattern)** — a real, central, queryable
  catalog of real, named things a system can work with, populated at
  real, run time rather than fixed at compile time by a closed set of
  `if`/`switch` branches. It exists so *adding* a new real, known thing
  never requires editing every real piece of code that already
  iterates over "everything this system currently knows about" — only
  registering the new, real thing once.

**Objects and methods used**

- **`GameRegistry`**
  - *What it is:* a real, new, project-owned class holding a real,
    growing catalog of `GameDefinition`s, keyed by their own real
    `id`.
  - *Implementation:* real, shown in full in this lesson's own Updated
    Project step, below — a real, private `Map<String,
    GameDefinition>`, and three real, public members: `register`,
    `find`, `all`.
  - *Its use:* this lesson's own real, permanent test constructs one,
    registers this app's own real Sudoku `GameDefinition` into it, and
    reads it back by real id.
  - *Type:* a real, plain, mutable class.
  - *Responsibility:* own the one, real, current, complete set of
    games this platform genuinely knows about, and answer real
    lookups against it — nothing about how any one of those real
    games is actually played.
  - *Depends on:* nothing to construct; each real `GameDefinition` it
    holds is supplied by a real, separate caller via `register`.
  - *Connects to:* this lesson's own real Sudoku `GameDefinition`,
    registered into it by this lesson's own real, permanent test.
  - *Shape:* Domain-layer, `game_platform/` — a real, generic,
    project-agnostic utility, not specific to Sudoku at all.

## Concept Unit: GameRegistry

### The Problem

`GameDefinition` (this project's own immediately preceding lesson)
names one real game's own identity — but nothing yet holds a real,
growing collection of them, or lets real, generic code ask what
exists.

> **Try it yourself first.** Picture a real menu screen that needs to
> list every real game this platform currently supports. Without a
> real registry, what would that screen's own code have to do instead
> — and what would change about that code the moment a second real
> game got added?

### Introducing the concept

A minimal, throwaway lab constructs a real registry, registers two
real, distinct `GameDefinition`s, and reads them back:

```dart
final registry = GameRegistry();
registry.register(const GameDefinition(id: 'a', name: 'Game A', description: '...'));
registry.register(const GameDefinition(id: 'b', name: 'Game B', description: '...'));
```

Per the Verification Rule's own Necessity clause, no separate,
throwaway run is needed here: `registry.find('a')`/`.all` reading back
exactly what was just registered, in a plain `Map`-backed class with
no real, hidden logic, is exactly as certain as the literals already
written — this lesson's own real, permanent test, below, proves it
for real, directly against real project code, which is stronger real
evidence than a separate throwaway would add.

### Discard the throwaway example

Not applicable — no throwaway lab file was created; the real proof
lives entirely in this lesson's own permanent test, since `GameRegistry`
is real, permanent project code from its own first line.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_registry.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, beside this project's
  own other `game_platform/domain/` contracts.
- **Dependencies** — `GameDefinition`, already established.

### The New Code

```dart
class GameRegistry {
  final Map<String, GameDefinition> _definitions = {};

  void register(GameDefinition definition) {
    _definitions[definition.id] = definition;
  }

  GameDefinition? find(String id) => _definitions[id];

  List<GameDefinition> get all => List.unmodifiable(_definitions.values);
}
```

### The Updated Project

`game_registry.dart`, in full, numbered:

```dart
 1  class GameRegistry {
 2    final Map<String, GameDefinition> _definitions = {};
 3
 4    void register(GameDefinition definition) {
 5      _definitions[definition.id] = definition;
 6    }
 7
 8    GameDefinition? find(String id) => _definitions[id];
 9
10    List<GameDefinition> get all => List.unmodifiable(_definitions.values);
11  }
```

### Mechanical walkthrough

- `final Map<String, GameDefinition> _definitions = {};` — a real,
  already-established generic `Map` field, initialized to a real,
  empty `Map` literal — this class's own entire, real, mutable state.
- `void register(GameDefinition definition) { _definitions
  [definition.id] = definition; }` — a real, already-established index-
  assignment (`[]=`), keying by `definition`'s own real `id` field —
  a second, real call using an already-used real `id` overwrites the
  first entry outright, rather than the map somehow holding both.
- `GameDefinition? find(String id) => _definitions[id];` — a real,
  already-established map-read (`[]`), whose own real return type
  (`GameDefinition?`, already-established nullable-type syntax)
  honestly reflects that a real, unregistered `id` returns `null`
  rather than throwing.
- `List<GameDefinition> get all => List.unmodifiable(_definitions
  .values);` — a real, already-established getter; `.values` (already
  established, from `Map`) reads every real, currently-registered
  definition; `List.unmodifiable` (already established, from Lesson
  15's own real immutability work) wraps them in a real, genuinely
  read-only view, so calling code can never mutate this registry's
  own real, internal catalog by holding onto what `all` returns.

### CS lens

A real, central, queryable catalog of named things, populated at real
run time, is the real, named **Registry pattern**, explained in full
as a Term in this lesson's own Header, above. Also recognized in: a
real dependency-injection container's own service registry; a web
framework's own real URL-to-handler routing table; an operating
system's own real driver registry, matching a real, plugged-in device
against the real driver that knows how to run it; this project's own
already-real `AppDatabase.settings` table, a real, generic, key-value
registry applied to preferences instead of games.

### SE lens

The real alternative here was a real, hardcoded `switch` statement
somewhere, listing every real, known game by name directly — real,
zero extra code right now, at the real cost curriculum's own lesson
title already names: every real place that needs to know "what games
exist" would need its own, separate, real copy of that same, real,
hardcoded list, each one a real, additional place to update, and
forget to update, the moment a real, new game is added. A real
registry costs one real, small class, in exchange for exactly one
real, shared, live source of truth.

### Commands needed

None.

### Run it

Verified together with this lesson's own next Concept Unit, in the
closing, full-lesson test run, below.

### Connect the pieces

A real, generic catalog now exists — the next Concept Unit gives it
its own real, first, actual entry.

---

## Concept Unit: Sudoku's own real GameDefinition

### The Problem

This app's own real Sudoku code has never needed to describe *itself*
as data — every real file in `features/sudoku/` simply assumes Sudoku
is the game being played, with no real, separate statement of that
fact anywhere a real registry could hold.

> **Try it yourself first.** A real, evidence-first search
> (`grep -rn "GameDefinition" lib/features/sudoku/`) — run for real
> this session — turns up zero real matches before this Concept Unit.
> What is the smallest, real, honest `GameDefinition` Sudoku's own
> real identity could be reduced to, without describing any of its own
> real rules?

### Introducing the concept

No new isolated lab — `GameDefinition`'s own real shape was already
fully proven, real and directly, in this project's own immediately
preceding Concept Unit and the lesson before it; constructing one
more real, `const` instance of an already-verified real class is not a
new concept.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  addition naming this app's own already-real game.
- **Files affected** —
  `project/lib/features/sudoku/domain/sudoku_game_definition.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file, in `features/sudoku/domain/`
  — the identical real layer `Difficulty` already lives in, since this
  is real, static, framework-free identity data, not a UI concern.
- **Dependencies** — `GameDefinition`, from `game_platform/domain/`
  — this app's own first real import crossing from `features/sudoku/`
  into the new, real, generic platform area.

### The New Code

```dart
const sudokuGameDefinition = GameDefinition(
  id: 'sudoku',
  name: 'Sudoku',
  description: 'Fill a 9x9 grid so every row, column, and 3x3 box contains the digits 1 through 9 exactly once.',
);
```

### The Updated Project

`sudoku_game_definition.dart`, in full, numbered — a brand-new file:

```dart
1  import '../../../game_platform/domain/game_definition.dart';
2
3  const sudokuGameDefinition = GameDefinition(
4    id: 'sudoku',
5    name: 'Sudoku',
6    description: 'Fill a 9x9 grid so every row, column, and 3x3 box contains the digits 1 through 9 exactly once.',
7  );
```

A real, honest, first-attempt mistake, caught immediately: line 1's
own first, real version miscounted the real directory depth between
`features/sudoku/domain/` and `game_platform/domain/` by one level
(`'../../game_platform/...'`), producing a real, immediate compile
error the instant this lesson's own permanent test tried to load it
(`Error when reading
'lib/features/game_platform/domain/game_definition.dart': The system
cannot find the path specified`) — fixed by adding the one, real,
missing `../`.

### Mechanical walkthrough

- `import '../../../game_platform/domain/game_definition.dart';` — a
  real, already-established relative import (this project's own
  established convention throughout `lib/`, never `package:` imports
  internally), crossing, for the real, first time, from
  `features/sudoku/` into the new, real, generic `game_platform/`
  area.
- `const sudokuGameDefinition = GameDefinition(id: 'sudoku', name:
  'Sudoku', description: '...')` — a real, already-established
  top-level `const` declaration, constructing the real class explained
  in full in this project's own immediately preceding lesson —
  `id: 'sudoku'` is this app's own real, first, explicit, stable
  identity string for itself.

### CS lens

Not applicable — constructing an already-established, immutable data
class is not, on its own, a hard concept.

### SE lens

The real, deliberate, narrow scope of this Concept Unit, named
honestly: `sudokuGameDefinition` is this app's own real, *only* touch
of the `game_platform/` contract so far — `SudokuBoard`, `GameEngine`,
`GameSession` (the concrete, Sudoku-specific one), none of them
implement or reference any real `game_platform/` type. A real,
tempting, larger alternative — retrofitting `SudokuBoard`/`GameSession`
onto `GameEngine`/`GameSession<S, A>` right now — is deliberately not
done here: curriculum's own real bullet for this real lesson asks for
*discovery*, not gameplay, and forcing that real retrofit before a second, real,
different game ever needs it risks shaping those generic contracts
around Sudoku's own real assumptions with nothing yet to check them
against.

### Commands needed

None.

### Run it

Verified together with this lesson's own final Concept Unit, in the
closing, full-lesson test run, below.

### Connect the pieces

Sudoku now has a real, minimal, honest identity a real registry can
hold — the final Concept Unit proves the two pieces genuinely work
together.

---

## Concept Unit: Real, multi-game discovery

### The Problem

Nothing yet proves `GameRegistry` and `sudokuGameDefinition` actually
work *together*, or that a registry genuinely holds more than one real
entry at once rather than merely compiling that way.

> **Try it yourself first.** Curriculum's own real bullet for this real
> lesson names four real games — Sudoku, and three this project has never written a
> single real line of code for. What would honestly registering all
> four right now actually require this lesson didn't already build —
> and what would a real, empty, placeholder `GameDefinition` for a
> game with no real engine behind it actually communicate to someone
> reading this registry's own contents?

### Introducing the concept

No new isolated lab — this Concept Unit's own real proof is this
lesson's own permanent, project-level test, run directly against real
project code, per the identical reasoning already applied earlier in
this lesson.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/test/game_registry_test.dart` (new
  file).
- **Change type** — add.
- **Location** — a new, real, permanent test file.
- **Dependencies** — `GameRegistry`, `sudokuGameDefinition`, both
  established above.

### The New Code

```dart
final registry = GameRegistry();
registry.register(sudokuGameDefinition);
registry.register(_secondDefinition); // a real, second, test-only definition

expect(registry.all, hasLength(2));
expect(registry.find('sudoku')!.name, 'Sudoku');
```

### The Updated Project

`game_registry_test.dart`'s own real, central test, in full, numbered:

```dart
 1  test('a real registry genuinely holds more than one real game at once, each independently discoverable', () {
 2    final registry = GameRegistry();
 3    registry.register(sudokuGameDefinition);
 4    registry.register(_secondDefinition);
 5
 6    expect(registry.all, hasLength(2));
 7    expect(registry.find('sudoku')!.name, 'Sudoku');
 8    expect(registry.find('second')!.name, 'A Second, Real Game');
 9  });
```

Three further real, permanent tests in the same file (not reproduced
here in full) round out this Concept Unit's own real proof: a real,
empty registry finds nothing and lists nothing; registering
`sudokuGameDefinition` alone makes it real, genuinely discoverable by
its own real `id`, with its own real `name`/`description` intact; and
registering a real, second definition under an already-used real `id`
genuinely replaces the first entry, real and direct proof of
`register`'s own documented overwrite behavior, not merely assumed
from reading its own source.

### Mechanical walkthrough

- `final registry = GameRegistry();` — a real, already-established
  constructor call.
- `registry.register(sudokuGameDefinition);` — the real,
  already-established method, called with this app's own real,
  now-existing Sudoku identity.
- `registry.register(_secondDefinition);` — the identical real method,
  called with a real, second, deliberately fictional
  `GameDefinition` (`id: 'second'`), existing only inside this test
  file, purely to prove genuine multi-entry behavior without
  fabricating a real-sounding placeholder for a game this project
  doesn't actually have.
- `expect(registry.all, hasLength(2));` — a real, already-established
  `expect`/matcher pair, confirming both real entries are genuinely
  present at once.
- `expect(registry.find('sudoku')!.name, 'Sudoku');` — a real,
  already-established null-assertion (`!`) plus field read, confirming
  the real, specific entry registered earlier is the real, specific
  one returned.

### CS lens

Not applicable — reuses this lesson's own already-covered Registry
pattern.

### SE lens

The real, honest choice this whole lesson makes, stated plainly here:
Minesweeper, 2048, and Wordle are **not** registered — not silently
ignored, not faked with an honestly-empty `GameDefinition` pretending
a real game exists where no real code does. A registry entry with no
real, working game behind it is a real, concrete lie a player-facing
menu could show — "here is a game you can play" — that isn't true.
The real, honest alternative, chosen here: register exactly what's
real (Sudoku), name what isn't (in this very sentence, and in this
lesson's own real, permanent test's own honest comments), and let a
real, later lesson register each of the other three the real moment
each one actually has a real `GameEngine` behind it, not before.

### Commands needed

None.

### Run it

Real, run output, from `project/test/game_registry_test.dart`:

```
00:00 +0: a real, empty GameRegistry finds nothing and lists nothing
00:00 +1: registering the real, actual Sudoku GameDefinition makes it real, genuinely discoverable by its own real id
00:00 +2: a real registry genuinely holds more than one real game at once, each independently discoverable
00:00 +3: registering a real, second definition under an already-used real id genuinely replaces the first, rather than holding both
00:00 +4: All tests passed!
```

### Connect the pieces

`GameRegistry` and Sudoku's own real, new identity now genuinely work
together — the one, real, honest step curriculum's own real bullet for
this real lesson actually asked for, no more claimed than what's real.

---

## Connect the pieces

One real, concrete trace, start to finish: a hypothetical real menu
screen (not built this lesson) asking "what can I play?"

1. A real `GameRegistry` is constructed, empty.
2. `registry.register(sudokuGameDefinition)` adds this app's own real,
   only, currently-working game.
3. `registry.all` returns a real, single-element list — real,
   direct, honest proof of exactly what this platform can currently,
   genuinely offer a player, no more and no less.
4. `registry.find('sudoku')` reaches the identical real entry by its
   own real, stable id — the real, concrete answer to curriculum's own
   opening words for this whole phase: "instead of hard-coding Sudoku
   everywhere," one real place now holds that real fact, ready for a
   real, later lesson to add a second real entry to, honestly, once a
   second real game actually exists to back it.

## Real, final verification

A real, evidence-first search
(`grep -rn "GameDefinition" lib/features/sudoku/`) opened this
lesson's own second Concept Unit, confirming zero real matches before
it. Every real Concept Unit's own code — `GameRegistry`,
`sudokuGameDefinition`, and the real, permanent test proving both —
was verified together, per the Verification Rule's own Batching
clause. A real, first-attempt import-path mistake was caught
immediately by a real compile error and fixed in place; full, honest
narrative in `verification/lesson-67/run-log.md`.

```
flutter analyze .
57 issues found. (ran in 5.8s)
```

Unchanged from this lesson's own pre-change baseline — checked by
category: zero new issues, zero new categories.

```
flutter test
...
00:35 +87: All tests passed!
```

87 real test-file-level checks, up from 83 — four new, all in a new,
permanent `game_registry_test.dart`. One real, isolated flake
(unrelated to this lesson, this project's own already-established,
honest pattern) was observed on the first of two full-suite runs,
confirmed clean immediately after. Full real script and output saved
to `verification/lesson-67/`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
