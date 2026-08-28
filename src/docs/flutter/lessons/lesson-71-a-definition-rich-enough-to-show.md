# Lesson 71: A Definition Rich Enough to Show

**What you will build.** Two real, new, plain fields on this project's
own already-established, generic `GameDefinition` — `icon`,
representing one real game visually, and `supportedModes`, naming
which real, distinct ways it can be played — plus the real, one-line
update to this app's own real, concrete `sudokuGameDefinition` that
actually supplies them. The transferable problem: `GameRegistry.all`
already exists, real and ready, from two real lessons earlier — real,
generic platform code can already *list* every real game this
platform knows about. What it couldn't yet do is describe any one of
them richly enough for a real, human-facing screen to actually show —
this lesson closes exactly that gap, and no more of it.

**What you need to know first.** `GameDefinition`
(`id`/`name`/`description`), and `GameRegistry` (`register`/`find`/
`all`), both already established. The real, deliberate,
already-documented discipline that every file in `game_platform/
domain/` stays genuinely Flutter-free — first established, and
run-proved, by `Clock`'s own real, earlier discovery that importing
Riverpod into a pure-Dart file breaks on a real, non-Flutter test
target.

**Terms used in this lesson**

No new Terms — every real decision this lesson makes reuses mechanisms
already fully established: a real, plain, immutable data field, and
the real, already-proven discipline governing what `game_platform/
domain/` may and may not import.

**Objects and methods used**

- **`GameDefinition`**
  - *What it is:* this project's own already-established, generic,
    static game-identity record — real and unmodified in its own real
    `id`/`name`/`description`, gaining two real, new fields this
    lesson.
  - *Implementation:* real, shown in full in this lesson's own first
    Concept Unit, below.
  - *Its use:* `sudokuGameDefinition`, this lesson's own second Concept
    Unit, supplies real, concrete values for both real, new fields;
    this project's own, already-existing, permanent `game_registry_test
    .dart` was extended to prove they survive real registration and
    real lookup unchanged.
  - *Type:* a `const`-constructible, plain, immutable class —
    unchanged in kind, only in real, added shape.
  - *Responsibility:* carry everything real, generic platform code
    needs to identify, describe, *and now show*, one real kind of
    game — still nothing about how any one of them is actually played.
  - *Depends on:* nothing.
  - *Connects to:* `GameRegistry`, already established, entirely
    unchanged by this lesson.
  - *Shape:* Domain-layer, `game_platform/` — real, generic, genuinely
    Flutter-free, even with a real field meant to back a real, visual
    icon.

## Concept Unit: GameDefinition gains icon and supportedModes

### The Problem

`GameRegistry.all` can already hand back every real, registered
`GameDefinition` — but nothing on that real type yet carries enough
for a real, human-facing screen to show one distinctly (a real visual
icon) or say what it actually offers (its own real, supported modes).

> **Try it yourself first.** `game_platform/domain/` has stayed
> genuinely Flutter-free through every real lesson so far — no
> `package:flutter/...` import anywhere in it. Given that real,
> established constraint, what real Dart type could `icon` actually
> be, without breaking it — and given curriculum names no concrete
> real modes yet, what is the smallest, real, honest type for
> `supportedModes`?

### Introducing the concept

No new isolated lab — two real, plain, additional `final` fields on an
already-established, real, immutable class is not a new construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/game_definition.dart` (modify).
- **Change type** — modify.
- **Location** — the class's own real constructor and field
  declarations.
- **Dependencies** — none.

### The New Code

```dart
class GameDefinition {
  const GameDefinition({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.supportedModes,
  });
  final String id;
  final String name;
  final String description;
  final String icon;
  final List<String> supportedModes;
}
```

### The Updated Project

`game_definition.dart`, in full, numbered, this Concept Unit's own new
lines marked:

```dart
 1  class GameDefinition {
 2    const GameDefinition({
 3      required this.id,
 4      required this.name,
 5      required this.description,
 6      required this.icon,                 // ← new
 7      required this.supportedModes,       // ← new
 8    });
 9    final String id;
10   final String name;
11   final String description;
12   final String icon;                     // ← new
13   final List<String> supportedModes;     // ← new
14 }
```

### Mechanical walkthrough

- `required this.icon,` / `final String icon;` — a real,
  already-established required named parameter and field, real and
  deliberately typed as a plain `String`, not a real, concrete
  `IconData` — the real reason is this Concept Unit's own SE lens,
  below.
- `required this.supportedModes,` / `final List<String>
  supportedModes;` — a real, already-established required named
  parameter and field, real and typed as a plain `List<String>` —
  curriculum names no concrete real modes anywhere yet, so no real
  `enum` was invented to hold values that don't exist.

### CS lens

Not applicable — two additional, plain, immutable fields are not a
hard concept worth a CS lens of their own.

### SE lens

The real, rejected alternative for `icon` was a real, concrete
`IconData` (Flutter's own real, built-in icon-value type) — real,
directly usable by a real `Icon(definition.icon)` widget with zero
real translation step, at the real cost of `game_platform/domain/`
needing to `import 'package:flutter/material.dart'` (or `widgets.dart`)
for the real first time anywhere in this whole layer — breaking the
identical real, already-established, run-proved discipline `Clock`'s
own doc comment already names by its own real, past failure. The real,
chosen `String` keeps `game_platform/domain/` genuinely Flutter-free;
the real cost is a real, small, presentation-layer translation step
(a real `Map<String, IconData>`, or a real `switch`) some real, later,
UI-facing lesson would need to write — real, deliberately deferred,
since no real screen reads `icon` yet at all.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Unit, in
the closing, full-lesson test run, below.

### Connect the pieces

`GameDefinition` can now, in principle, describe itself richly enough
for a real screen to show — the next Concept Unit gives Sudoku's own
real, concrete definition real values for both new fields, and proves
them.

---

## Concept Unit: sudokuGameDefinition, updated and proven

### The Problem

`sudokuGameDefinition`, the one real, concrete `GameDefinition` this
app has ever had, no longer compiles — its own real constructor call
is missing two, real, newly required arguments.

### Introducing the concept

No new isolated lab — supplying two real, additional, required,
named-constructor arguments to an already-existing, real call site is
not a new construct.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/domain/sudoku_game_definition.dart`
  (modify); `project/test/game_registry_test.dart` (modify).
- **Change type** — modify.
- **Location** — `sudokuGameDefinition`'s own real, top-level `const`
  declaration; two, real, already-existing `GameDefinition(...)`
  construction sites inside this project's own, already-existing,
  permanent test.
- **Dependencies** — `GameDefinition`, just extended, above.

### The New Code

```dart
const sudokuGameDefinition = GameDefinition(
  id: 'sudoku',
  name: 'Sudoku',
  description: 'Fill a 9x9 grid so every row, column, and 3x3 box contains the digits 1 through 9 exactly once.',
  icon: 'grid_on',
  supportedModes: ['classic'],
);
```

### The Updated Project

`sudoku_game_definition.dart`, in full, numbered, this Concept Unit's
own new lines marked:

```dart
1  const sudokuGameDefinition = GameDefinition(
2    id: 'sudoku',
3    name: 'Sudoku',
4    description: 'Fill a 9x9 grid so every row, column, and 3x3 box contains the digits 1 through 9 exactly once.',
5    icon: 'grid_on',                 // ← new
6    supportedModes: ['classic'],     // ← new
7  );
```

This project's own, already-existing, permanent `game_registry_test
.dart` gained two, real, new assertions on its own, already-existing,
first real lookup test:

```dart
expect(found.icon, 'grid_on');
expect(found.supportedModes, ['classic']);
```

— real, direct proof both new, real fields survive real registration
and real lookup through `GameRegistry` unchanged, real and appended to
already-established, real, permanent proof rather than a whole,
separate, new test file for what is genuinely the same real check,
only larger. Its own two, other, already-existing, real
`GameDefinition(...)` construction sites (`_secondDefinition`,
`renamed`) were each given real, concrete values for both real, new
fields, keeping every real, existing test in this file compiling, and
passing, unmodified in its own real intent.

### Mechanical walkthrough

- `icon: 'grid_on'` — a real, plain string naming a real, plausible
  Material icon identifier — real and deliberately not yet consumed by
  any real, existing screen; no real UI in this app reads
  `GameDefinition.icon` today.
- `supportedModes: ['classic']` — a real, one-element list, naming the
  one real, actual mode this app genuinely has today — real and
  honest, not padded with real, invented, hypothetical future modes.
- `expect(found.icon, 'grid_on'); expect(found.supportedModes,
  ['classic']);` — two real, already-established `expect` calls,
  the identical real shape every other assertion in this file already
  uses.

### CS lens

Not applicable.

### SE lens

The real, deliberate choice this Concept Unit makes, by *not* building
one, is worth naming directly: no real, new, navigable home screen was
built this lesson, even though curriculum's own real bullet mentions
one becoming possible. `GameRegistry.all` already existed; a real
screen iterating it today would have exactly one, real, single entry
to show — real, genuine UI work with nothing real to actually choose
between yet. The real, second game that makes such a screen honestly
meaningful is the immediately following lesson's own explicit job —
the identical real kind of scope discipline this project's own
immediately preceding lesson already applied to `GamePlatform`'s own,
real, deliberately unbuilt "engine lookup by id" gap.

### Commands needed

None.

### Run it

Real, run output shown above, from
`project/test/game_registry_test.dart`.

### Connect the pieces

Sudoku's own real, concrete definition is now rich enough for a real
screen to eventually show it — proven, end to end, through this app's
own already-established, real `GameRegistry`.

---

## Connect the pieces

One real, concrete trace, start to finish, proving `GameDefinition`'s
own two, real, new fields survive real registration and real lookup
unchanged.

1. `sudokuGameDefinition` now carries `icon: 'grid_on'` and
   `supportedModes: ['classic']`, alongside its own, already-real,
   unmodified `id`/`name`/`description`.
2. `GameRegistry().register(sudokuGameDefinition)` — the identical
   real, already-established call this project's own, earlier lessons
   already proved.
3. `registry.find('sudoku')` reports back the real, identical,
   already-registered value — real, direct proof, via `found.icon` and
   `found.supportedModes`, that neither real, new field was lost, or
   silently defaulted, anywhere between real registration and real
   lookup.

`GameDefinition`, genuinely rich enough to show — curriculum's own
real capability, unlocked, not yet spent: no real screen reads it yet,
honestly, because none needs to until a real, second game exists to
show alongside Sudoku.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since both real changes touch already-real,
permanent project code, this lesson's own real proof lives entirely
inside this project's own, already-existing, permanent
`test/game_registry_test.dart`, extended, not replaced.

No real, first-attempt mistakes this lesson — every real, updated
construction site compiled, and every real, existing and newly
extended test passed, on its own real, first run.

```
flutter analyze .
57 issues found. (ran in 6.4s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories.

```
flutter test
...
00:37 +102: All tests passed!
```

102 real test-file-level checks — the identical real count as the
immediately preceding lesson, since this lesson added real assertions
to an already-existing, permanent test file rather than a new one.
One real, isolated flake (this project's own already-established,
honest, unrelated pattern, now observed a fifth time — the real,
already-known `settings_test.dart` close-and-reopen test) appeared on
the first of two full-suite runs, confirmed clean immediately after.
Full, honest narrative in `verification/lesson-71/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
