# Lesson 13: A Fixed Set of Named Possibilities

**What you will build:** A `Difficulty` enum with exactly three named
possibilities, each carrying its own real, associated data; a `switch`
over it, checked by the compiler for covering every single case; and two
small value classes, `RawCoordinate` and `Coordinate`, used to prove,
directly, what Dart's default equality actually compares — and what
changes once that default is deliberately overridden. None of this joins a
real project yet.

**What you need to know first:** Lesson 6's `switch` statement (this
lesson's own `switch` gains a real, new guarantee: exhaustiveness
checking). Lesson 5's `final` and `const`, both restated here in full and
applied to a whole object rather than a single variable. Lesson 11's
classes, fields, and constructors, reused for this lesson's own value
classes. Lesson 12's `@override` annotation, reused to override a real
method inherited from `Object` itself.

**Terms used in this lesson:**

- **`switch` statement, `case`** — reappearing from Lesson 6, restated in
  full: checks one value against a series of `case` clauses in order,
  running whichever one matches.
- **Enum** — a type declaring a fixed, closed set of named values, and
  nothing else — no other value can ever exist for that type, checked by
  the compiler. It exists for exactly the kind of concept Lesson 6's
  `Difficulty`-flavored examples kept reaching for an `int` (`1` for Easy,
  `2` for Medium) to represent: a small, known-in-advance set of
  possibilities, where an `int` could accidentally hold `99` and a
  `String` could be misspelled, but an enum's own type simply has no
  other legal value to hold.
- **Exhaustiveness checking** — the compiler verifying that a `switch`
  over an enum's own type covers every single one of its declared values,
  refusing to compile otherwise. It exists so adding a new enum value
  later (a fourth `Difficulty`) surfaces every `switch` that now needs a
  new case as a real compile error, rather than a silently-incomplete
  `switch` that only reveals the gap once that new value is actually
  used at runtime.
- **`.values`** — a real member every enum automatically gets: a fixed
  list of every value that enum declares, in declaration order. It exists
  so code can walk every possibility an enum has without hand-listing them
  a second time.
- **`.name`, `.index`** — two more real members every enum value
  automatically gets, inherited from Dart's own real `Enum` class (below):
  `.name` is that value's own declared name as text (`'medium'`); `.index`
  is its position among its own enum's declared values, starting at `0`.
  They exist for the common case of needing an enum value's own identity
  as plain data — for display, for storage, for comparison by position —
  without hand-writing that mapping separately.
- **Enhanced enum** — an enum declared with its own constructor and
  fields, exactly like an ordinary class, letting each named value carry
  its own real, associated data rather than being nothing more than a
  bare name. It exists so a fixed set of named possibilities and the real
  data that goes with each one don't have to be kept in two separate
  places (the enum itself, and a separate lookup table mapping each name
  to its data) that could silently drift out of sync.
- **Value object** — an object whose entire identity *is* its own field
  values — two value objects holding the same values are meant to be
  treated as the same value, unlike two ordinary objects that merely
  happen to hold matching data by coincidence. It exists to model concepts
  (a coordinate, an amount of money, a date) where "which specific object
  in memory" genuinely doesn't matter — only what it actually represents.
- **`const` constructor** — a constructor (Lesson 11's term, reappearing)
  itself marked `const`, permitting objects built through it to be
  **compile-time constants** (Lesson 5's term, reappearing) when every
  argument given to it is also one. It exists so a value object, whose
  whole point is being defined entirely by its own fields, can get the
  same compile-time-fixed treatment Lesson 5's `const` gave a single
  value.
- **Identity equality** — comparing whether two references point at the
  exact same object in memory — the same object, not merely one holding
  matching data. This is Dart's own default meaning for `==` on an
  ordinary class, proven directly in this lesson's own final unit, not
  merely asserted.
- **Structural (value) equality** — comparing whether two objects hold the
  same field values, regardless of whether they're the same object in
  memory. It exists as the alternative meaning of `==` a class can
  deliberately opt into, by overriding it — exactly what this lesson's own
  `Coordinate` does.
- **`is`** — an operator checking whether a value's own real, concrete
  type matches (or is a subtype of) a named type, producing a `bool`
  (Lesson 5's term, reappearing). It exists because an overridden `==`
  (below) is handed a parameter of the broadest possible type, `Object?`,
  and has to check, safely, whether what it was actually given is even
  the right kind of thing to compare against before reading any of its
  fields.

**Objects and methods used:**

- **`Object`**
  - *What it is:* the same real `dart:core` class Lesson 10 introduced —
    the one class every other class ultimately builds on.
  - *Implementation:* real members relevant here: `bool operator
    ==(Object other)` (the default, identity-based version this lesson's
    `RawCoordinate` inherits unmodified) and `int get hashCode` (its
    matching default); also `static int hash(Object? a, Object? b, [...])`,
    a real static method combining several values into one well-distributed
    `int`.
  - *Its use:* this lesson's `RawCoordinate` inherits both defaults
    unmodified, proving what they actually do; `Coordinate` overrides
    both, using `Object.hash` to build its own `hashCode`.
  - *Type:* the root of Dart's entire class hierarchy.
  - *Responsibility:* provide every class's absolute baseline behavior —
    `toString`, `==`, `hashCode`, `runtimeType` — that every single class
    in this curriculum has already been relying on since Lesson 1's own
    `print`, whether it was ever named directly or not.
  - *Depends on:* nothing — every other class depends on it, not the
    reverse.
  - *Connects to:* `RawCoordinate` and `Coordinate` both inherit from it
    implicitly (every class does, whether `extends` is written or not);
    `Coordinate` overrides two of its real members directly.
  - *Shape:* the deepest, most foundational layer of every class this
    curriculum has ever declared or used.
- **`Enum`**
  - *What it is:* a real `dart:core` class every enum this curriculum
    declares implicitly extends, whether that's written or not.
  - *Implementation:* provides the real `name` and `index` members this
    lesson's header already describes.
  - *Its use:* `Difficulty.medium.name` and `Difficulty.medium.index` both
    read members `Difficulty` itself never declares — inherited directly
    from `Enum`.
  - *Type:* the shared superclass of every enum in Dart.
  - *Responsibility:* give every enum value, of any enum type at all, its
    own name and position for free.
  - *Depends on:* nothing beyond an enum value already existing to read
    these members from.
  - *Connects to:* implicitly extended by every `enum` declaration; its
    real members read directly in this lesson's own run.
  - *Shape:* analogous to `Object` (above), but specific to enums rather
    than every class.
- **`identical`**
  - *What it is:* a real, top-level `dart:core` function.
  - *Implementation:* `bool identical(Object? a, Object? b)` — checks
    whether `a` and `b` are genuinely the same object in memory, the exact
    check `Object`'s own default `==` performs internally.
  - *Its use:* this lesson doesn't call it directly in its own saved run,
    but its real behavior is exactly what `RawCoordinate`'s own default
    `==` is built on.
  - *Type:* a top-level function in `dart:core`.
  - *Responsibility:* answer, directly and unambiguously, whether two
    references genuinely point at one single object, with no class able
    to override or change what it means.
  - *Depends on:* two values to compare.
  - *Connects to:* what `Object`'s own default `==` (this lesson's header)
    delegates to internally.
  - *Shape:* the one fixed, un-overridable notion of "same object" every
    class's own, possibly-overridden `==` sits on top of.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: A Type With No Other Legal Value

### The Problem

Lesson 6's own `switch` examples used a plain `int` to stand in for a
Sudoku difficulty (`1` for Easy, `2` for Medium). Nothing about `int`
stops a stray `99` from being assigned to that same variable somewhere
else in a growing codebase — a mistake `dart analyze` would never catch,
since `99` is a perfectly legal `int`. Is there a type built specifically
to hold *only* a small, fixed, named set of values, with nothing else
legal at all?

> **Stop and think before reading on:** If a type could only ever hold one
> of exactly three named values — never `99`, never a typo'd string —
> what do you think a `switch` over that type could additionally
> guarantee, compared to a `switch` over a plain `int` that happens to
> only ever be given `1`, `2`, or `3` today?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-13/enums_demo.dart`
  — created, containing this unit's enum and `switch`; Concept Units 2–4
  will each add their own code to this same file before it's run once, as
  one real batch.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
enum Difficulty { easy, medium, hard }

String describeDifficulty(Difficulty difficulty) {
  switch (difficulty) {
    case Difficulty.easy:
      return 'Easy';
    case Difficulty.medium:
      return 'Medium';
    case Difficulty.hard:
      return 'Hard';
  }
}
```

### The Updated Project

Not applicable — this is the file's brand-new starting content (this
unit's own minimal, three-value enum is grown into an enhanced enum by
the next unit, replacing this exact declaration).

### Introduce the concept in isolation

Not run standalone (this exact minimal enum is superseded by Concept Unit
2's own enhanced version before this lesson's one real batched run);
predictable given `switch`'s own already-proven behavior (Lesson 6):
`describeDifficulty(Difficulty.hard)` would print `Hard`.

Whether omitting a case is still merely a runtime risk, or a real compile
error, is worth proving rather than assuming — run for real, on a
deliberately incomplete copy:

```
error - non_exhaustive_switch_error.dart:7:3 - The type 'Difficulty' isn't exhaustively matched by the switch cases since it doesn't match the pattern 'Difficulty.hard'. Try adding a default case or cases that match 'Difficulty.hard'. - non_exhaustive_switch_statement
```

This proves **exhaustiveness checking** (this lesson's term) is real: a
`switch` over an enum missing even one of its declared values is rejected
before the program ever runs — something a `switch` over a plain `int`
could never offer, since Dart has no way to know every `int` a Sudoku
difficulty was ever supposed to be limited to.

### Discarding this example

The deliberately-incomplete copy used for this proof is disposable and
separate from this lesson's own real file. What carries forward: `enum`
declares a closed, fixed set of named values, and a `switch` over one is
checked, by the compiler, for covering every single case.

### Mechanical walkthrough

- **`enum Difficulty { easy, medium, hard }`** — an enum declaration:
  `enum`, a reserved word, followed by an identifier (Lesson 5's term,
  reappearing) naming the new type, followed by exactly three named
  values — not variables, not instances built later, but the type's own
  entire, fixed set of legal values, fixed the moment this declaration is
  written.
- **`switch (difficulty) { case Difficulty.easy: ... }`** — Lesson 6's
  `switch` statement (reappearing), each `case` naming one specific enum
  value with its own full type prefix (`Difficulty.easy`, not just
  `easy`), leaving nothing ambiguous about which enum a bare name like
  `easy` belongs to.

### CS lens

A type restricted to a small, fixed, named set of possibilities, with the
compiler itself enforcing that no other value can ever exist, is an
**enumerated type** — a foundational idea for modeling a genuinely closed
set of possibilities, distinct from an open-ended type like `int` or
`String` that happens, today, to only be used with a few specific values.

```
Also recognized in: a traffic light's own fixed three states, a
playing card's own fixed suit, a compass's own four cardinal
directions, an HTTP response's own fixed set of status-code
categories
```

### SE lens

Using a plain `int` (Lesson 6's own earlier approach) to stand in for a
small set of named possibilities costs nothing to write and loses real
safety: nothing stops an invalid value, and nothing forces every `switch`
over it to stay current as new possibilities are added. An `enum` costs a
small, one-time declaration, in exchange for the compiler enforcing both
guarantees permanently, everywhere that type is used, for the rest of this
project's life.

### Commands needed

- **`dart analyze <file>`** — reappearing from Lesson 5, restated in full:
  statically checks a file for compile-time errors without running it.

### Run it

Real, verified output for the deliberately-incomplete proof:

```
Analyzing non_exhaustive_switch_error.dart...

  error - non_exhaustive_switch_error.dart:7:3 - The type 'Difficulty' isn't exhaustively matched by the switch cases since it doesn't match the pattern 'Difficulty.hard'. Try adding a default case or cases that match 'Difficulty.hard'. - non_exhaustive_switch_statement

1 issue found.
```

Real, saved in full in
`src/docs/flutter/verification/lesson-13/run-log.md`.

### Connecting this unit

This unit gave a fixed set of named possibilities real, compiler-enforced
teeth. The next unit gives each of those named possibilities its own real,
associated data.

---

## Concept Unit: Data That Travels With Each Named Value

### The Problem

`Difficulty.hard` is just a name so far — a real Sudoku engine needs each
difficulty to carry its own real number, say, how many cells a generated
puzzle removes. A separate lookup (a `Map<Difficulty, int>`, Lesson 9)
would work, but it's a second place that data could drift out of sync
with the enum itself. Can an enum value carry its own data directly?

> **Stop and think before reading on:** Given Lesson 11's classes already
> have constructors and fields, what do you predict happens if an `enum`
> declared those same things — a constructor, a field — the same way an
> ordinary class does?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-13/enums_demo.dart`
  — modified, replacing the minimal `Difficulty` from Concept Unit 1 with
  an enhanced version.
- **Change type:** Refactor (`Difficulty`'s own declaration grows a
  constructor and a field).
- **Location:** Replacing Concept Unit 1's own `enum Difficulty { easy,
  medium, hard }` line.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
enum Difficulty {
  easy(cellsToRemove: 30),
  medium(cellsToRemove: 45),
  hard(cellsToRemove: 55);

  const Difficulty({required this.cellsToRemove});

  final int cellsToRemove;
}
```

### The Updated Project

```dart
 1: enum Difficulty {                                    // ← changed
 2:   easy(cellsToRemove: 30),                            // ← new
 3:   medium(cellsToRemove: 45),                          // ← new
 4:   hard(cellsToRemove: 55);                            // ← new
 5:
 6:   const Difficulty({required this.cellsToRemove});    // ← new
 7:
 8:   final int cellsToRemove;                            // ← new
 9: }
10:
11: String describeDifficulty(Difficulty difficulty) {
12:   switch (difficulty) {
13:     case Difficulty.easy:
14:       return 'Easy';
15:     case Difficulty.medium:
16:       return 'Medium';
17:     case Difficulty.hard:
18:       return 'Hard';
19:   }
20: }
```

`describeDifficulty` and its own `switch` are unchanged — they still work
identically against this enhanced version, since `Difficulty.easy`,
`.medium`, and `.hard` still exist as the exact same three named values,
now simply carrying more data each.

### Introduce the concept in isolation

Whether this genuinely works, and what each value's own real associated
data actually is, is worth real proof — run for real, batched with the
rest of this lesson:

```
45
medium
1
```

`Difficulty.medium.cellsToRemove` is `45` — its own, real, associated
field, read the same way any object's field is read. `Difficulty.medium
.name` is `'medium'` and `.index` is `1` — both real members inherited
from `Enum` itself (this lesson's header), automatically available on
every enum value regardless of whatever fields it additionally declares.

### Discarding this example

Nothing discarded — this enhanced `Difficulty` is real, permanent content
for the rest of this lesson.

### Mechanical walkthrough

- **`easy(cellsToRemove: 30),`** — an enum value declaration, now calling
  its own enum's constructor: `cellsToRemove: 30` is a named argument
  (Lesson 8's term, reappearing), matching the constructor's own required
  named parameter.
- **`const Difficulty({required this.cellsToRemove});`** — a `const`
  constructor (this lesson's term): `const` here is required — every enum
  value is itself a compile-time constant, fixed once, forever, the
  instant the enum is declared, never built again at runtime; `required
  this.cellsToRemove` is Lesson 8's `required` named parameter combined
  with Lesson 11's constructor shorthand.
- **`final int cellsToRemove;`** — a field (Lesson 11's term,
  reappearing), `final` (Lesson 5's term, reappearing) because, like
  every enum value itself, it's fixed forever once that value is
  declared.
- **`Difficulty.medium.name`, `Difficulty.medium.index`** — two real
  members (this lesson's header) inherited from `Enum`, not declared by
  `Difficulty` itself at all.

### CS lens

An enum whose values each carry their own real, associated data, rather
than being bare, meaningless names, is sometimes called a **rich enum** or
**enhanced enum** (this lesson's term) — closing the gap between "a fixed
set of named possibilities" and "a fixed set of small, immutable objects,"
which the next unit's `Coordinate` explores from the opposite direction.

```
Also recognized in: Java's own enums (which have supported
constructors and fields since Java 5), Kotlin's enum classes, a
dropdown menu's own options each carrying a hidden internal value
alongside their displayed label
```

### SE lens

A separate `Map<Difficulty, int>` lookup, built once and consulted
elsewhere, works identically to this unit's own enhanced enum, at a real,
ongoing risk: nothing ties that map's own keys to `Difficulty`'s actual
declared values, so a future fourth difficulty added to the enum could
silently have no matching map entry at all, discovered only once code
actually looks it up and gets nothing back. An enhanced enum makes that
mistake structurally impossible — a new enum value's constructor call
must supply `cellsToRemove` or the file simply won't compile, per Lesson
8's own real, run-verified `required` proof.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — per the Verification Rule's Batching clause, full
output shown in Concept Unit 4's own "Run it" step.

### Connecting this unit

This unit gave a fixed set of named values their own real data. The next
unit turns to a different, related idea: an object whose entire identity
*is* its own data.

---

## Concept Unit: An Object Defined Entirely by Its Own Data

### The Problem

A Sudoku cell's own position — its row and column together — doesn't
change once given (Lesson 11's own `final` fields already guaranteed
that), and, unlike a `SudokuCell` itself, a position has no other
meaningful state at all: two coordinates holding the same row and column
really do represent the exact same position, in every sense that matters
to a Sudoku engine.

> **Stop and think before reading on:** If an object's entire identity is
> just its own field values, with nothing else about it that could ever
> meaningfully differ, what do you think should happen if two completely
> separate objects are built holding the exact same values — should the
> program be able to tell them apart at all?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-13/enums_demo.dart`
  — modified, adding `RawCoordinate`.
- **Change type:** Add (new class).
- **Location:** Appended after `describeDifficulty`.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
class RawCoordinate {
  final int row;
  final int col;

  const RawCoordinate(this.row, this.col);
}
```

### The Updated Project

```dart
21: class RawCoordinate {              // ← new
22:   final int row;                   // ← new
23:   final int col;                   // ← new
24:
25:   const RawCoordinate(this.row, this.col);  // ← new
26: }                                  // ← new
```

### Introduce the concept in isolation

Whether two separately-built `RawCoordinate` objects, holding the exact
same values, are considered equal by Dart is a genuine, uncertain claim —
worth real proof, batched with the rest of this lesson:

```
false
```

`rawA == rawB`, two separate `RawCoordinate` objects both built with `(2,
5)`, is `false` — **not** equal, even though every field they hold is
identical. This proves Dart's default `==` compares **identity** (this
lesson's term) — are these the *same object* — not the values each object
happens to hold.

### Discarding this example

`rawA`/`rawB`'s own specific values are disposable. What carries forward:
an ordinary class's default equality, real-proved here, considers two
separately-built objects unequal even when every field matches exactly —
which the next unit's `Coordinate` deliberately changes.

### Mechanical walkthrough

- **`const RawCoordinate(this.row, this.col);`** — a `const` constructor
  (this lesson's term), same as `Difficulty`'s own — legal here because
  every field is `final` and every constructor argument in this unit's own
  calls is a literal, both required for a `const` constructor call to
  actually be treated as a compile-time constant.
- **`rawA == rawB`** — Dart's own default `==`, inherited, unmodified,
  from `Object` (this lesson's header): compares whether `rawA` and
  `rawB` are the exact same object in memory, exactly what `identical`
  (this lesson's header) checks directly.

### CS lens

An object whose entire meaning is its own data, with no separate identity
worth distinguishing beyond that data, is a **value object** (this
lesson's term) — as opposed to an **entity**, an object (like Lesson 11's
own `SudokuCell`) whose identity matters *beyond* its current field
values (two cells with the same row, column, and value are still
genuinely two different cells on the board).

```
Also recognized in: two five-dollar bills — genuinely
interchangeable, neither one more "the real one" than the other; two
`(3, 4)` points on a graph, meaning the exact same location
regardless of which one was written down first; a database's own
distinction between a row's primary key (entity identity) and the
rest of its columns (its value-like data)
```

### SE lens

Leaving `RawCoordinate`'s default identity-based `==` unmodified costs
nothing to write, at the real cost this unit's own proof just
demonstrated: code that wants to check "are these two positions the same
place" (not "are these the same specific object") cannot use `==` at all
without a deliberate override — exactly what the next, final unit
provides.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone; full output in Concept Unit 4's own "Run it" step.

### Connecting this unit

This unit proved what Dart's default equality actually compares. The
final unit changes that, deliberately, for a class where value equality is
what actually makes sense.

---

## Concept Unit: Choosing What "Equal" Means

### The Problem

The previous unit proved `RawCoordinate`'s default `==` treats two
identical-valued objects as unequal. For a genuine value object — a
Sudoku coordinate, where `(2, 5)` always means the exact same place — that
default is actively wrong. How does a class change what `==` itself
means?

> **Stop and think before reading on:** If `==` is overridden to compare
> field values instead of identity, what do you predict needs to *also*
> change about `hashCode` (used, among other places, by `Set` and `Map`,
> Lesson 9, to decide where a value belongs) for the two to stay
> consistent with each other?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-13/enums_demo.dart`
  — modified, adding `Coordinate`, completing the file.
- **Change type:** Add (new class).
- **Location:** Appended after `RawCoordinate`.
- **Dependencies:** The file created in Concept Unit 1, extended through
  Concept Unit 3.

### The New Code

```dart
class Coordinate {
  final int row;
  final int col;

  const Coordinate(this.row, this.col);

  @override
  bool operator ==(Object other) {
    return other is Coordinate && other.row == row && other.col == col;
  }

  @override
  int get hashCode => Object.hash(row, col);
}
```

### The Updated Project

The complete, final file for this lesson (new lines marked; everything
else is exactly what Concept Units 1–3 left it as):

```dart
27: class Coordinate {                                       // ← new
28:   final int row;                                         // ← new
29:   final int col;                                         // ← new
30:
31:   const Coordinate(this.row, this.col);                   // ← new
32:
33:   @override                                              // ← new
34:   bool operator ==(Object other) {                        // ← new
35:     return other is Coordinate && other.row == row && other.col == col;  // ← new
36:   }                                                       // ← new
37:
38:   @override                                              // ← new
39:   int get hashCode => Object.hash(row, col);               // ← new
40: }                                                         // ← new
```

### Introduce the concept in isolation

Whether this override genuinely changes the previous unit's own real
result is worth proving directly, not assumed — run for real, completing
this lesson's one batched run:

```
true
true
```

`a == b`, two separate `Coordinate` objects both built with `(2, 5)`, is
now `true` — the exact opposite of the previous unit's own `RawCoordinate`
result, using the identical constructor arguments. `a.hashCode ==
b.hashCode` is also `true`, confirming the two overrides were kept
consistent with each other.

### Discarding this example

`a`/`b`'s own specific values are disposable. What carries forward:
overriding `==` and `hashCode` together turns identity equality into
structural (value) equality, real-proved directly against the previous
unit's own default-behavior result.

### Mechanical walkthrough

- **`@override bool operator ==(Object other)`** — `@override` (Lesson
  12's term, reappearing), here confirming this method genuinely
  fulfills `Object`'s own `==` obligation, not a coincidentally-named new
  one; `operator ==` is Dart's own syntax for defining what the `==`
  operator itself does for this specific class; its one parameter,
  `Object other`, is deliberately the broadest possible type, since `==`
  can be asked to compare against literally anything.
- **`other is Coordinate`** — the `is` operator (this lesson's term):
  checks whether `other`'s own real, concrete type is genuinely
  `Coordinate` (or a subtype) — necessary because `other`'s own declared
  parameter type, `Object`, tells the compiler nothing about whether it's
  actually safe to read `.row`/`.col` off it.
- **`&& other.row == row && other.col == col`** — Lesson 6's logical AND
  (reappearing), short-circuiting (Lesson 6's term, reappearing): if
  `other` isn't even a `Coordinate`, the rest is never evaluated at all,
  avoiding an attempt to read `.row`/`.col` off something that might not
  have them; otherwise, both fields are compared with the equality
  operator (Lesson 6's term, reappearing).
- **`@override int get hashCode => Object.hash(row, col);`** — a getter
  (Lesson 11's term, reappearing) using arrow syntax (Lesson 9's term,
  reappearing), overriding `Object`'s own default `hashCode`; `Object.hash`
  (this lesson's header) is a real static method combining `row` and
  `col` into one well-distributed `int` — kept in sync with `==` because
  two `Coordinate`s considered equal (matching `row`/`col`) must always
  produce the same `hashCode`, a real requirement `Set`/`Map` (Lesson 9)
  depend on to work correctly at all.

### CS lens

Deliberately redefining what "equal" means for a specific type, rather
than accepting a language's own built-in default, is choosing **value
semantics** over the language's own default **reference (identity)
semantics** — a real, foundational design decision every object-oriented
language requires making explicitly for any type where "same data" should
mean "the same thing."

```
Also recognized in: Java's own `equals()`/`hashCode()` override
pair, following the identical consistency requirement; Python's own
`__eq__`/`__hash__`; two separately-printed copies of the same
receipt being treated as "the same purchase" despite being two
physically different pieces of paper
```

### SE lens

Leaving `==` at its default, identity-based meaning costs nothing to
write and is exactly correct for an entity like Lesson 11's own
`SudokuCell` (two cells with matching fields are still genuinely
different cells on a board). Overriding it for a genuine value object
costs a real, honest obligation: keeping `==` and `hashCode` in sync by
hand, forever — this lesson's own real proof that both changed together,
correctly, is exactly the kind of check that's easy to get subtly wrong
(overriding one but forgetting the other) and hard to notice broken,
since `Set`/`Map` misbehavior from a mismatched pair often only surfaces
as values that mysteriously don't compare equal or can't be found, far
from wherever the actual mistake was made.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire batched file:

```
45
medium
1
Hard
[Difficulty.easy, Difficulty.medium, Difficulty.hard]
false
true
true
```

Real, saved in full in
`src/docs/flutter/verification/lesson-13/run-log.md`.

### Connecting this unit

This unit proved, directly against the previous unit's own default-
behavior result, exactly what changes when a class deliberately chooses
value semantics over identity.

---

## Connect the Pieces

Trace one Sudoku-flavored idea through everything this lesson built.
Concept Unit 1's `Difficulty` enum replaced Lesson 6's own loose `int`
stand-in with a genuinely closed set of three named values, real-proved
to reject an incomplete `switch` at compile time rather than merely at
runtime. Concept Unit 2 gave each of those three values its own real data
— `Difficulty.medium.cellsToRemove` really is `45`, read the same way any
object's field is read, alongside `.name` and `.index` inherited for free
from `Enum` itself. Concept Unit 3's `RawCoordinate` proved, directly,
that Dart's own default equality is about identity, not values — two
separately-built `(2, 5)` coordinates were **not** `==` to each other.
And Concept Unit 4's `Coordinate`, built identically, proved the opposite
result once `==` and `hashCode` were deliberately overridden together —
the same constructor call, the same two field values, a genuinely
different real answer to "are these equal," chosen deliberately rather
than left to a default that didn't fit what a coordinate actually is.

Lesson 11 taught this curriculum how to define a shape of data; Lesson 12
taught it how to build one class on another; this lesson taught it how to
close off a type to a fixed set of possibilities, and how to decide, for
itself, what "the same" actually means. Lesson 14 turns to what happens
when something goes wrong instead of what happens when two things are
compared — the deferred `throw` this curriculum has been carrying since
Lesson 4.
