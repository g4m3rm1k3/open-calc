# Lesson 12: Building on What Already Exists

**What you will build:** A small, real family of classes — a base
`BoardPosition`, a `SudokuCell` that builds on it, an unrelated
`PuzzleTitle`, and a `Puzzle` that holds a collection of cells — used to
demonstrate composition, inheritance, interfaces, abstract classes, and
polymorphism, all with real, run-verified proof rather than restated
theory. None of this joins a real project yet. This lesson pays off the
last, largest cluster of promises this curriculum deferred: Lesson 5 used
**`abstract`**, class-modifier **`final`**, **`sealed`**, **`extends`**,
and **`implements`** only narrowly, quoted inside real `dart:core` class
declarations, with zero actual inheritance ever taught. All five get their
full, formal treatment here.

**What you need to know first:** Lesson 11's `class`, fields, constructors
with `this.field` shorthand, methods, and `this` — this lesson's own
`BoardPosition` and `SudokuCell` both build directly on that lesson's own
`SudokuCell`. Lesson 9's `List<E>` and `.where`, reused for this lesson's
own `Puzzle` class. Lesson 5's real, fetched `dart:core` declarations —
`abstract final class int extends num`, `sealed class num implements
Comparable<num>`, `abstract final class String implements
Comparable<String>, Pattern` — cited directly as already-real evidence for
two of this lesson's own terms.

**Terms used in this lesson:**

- **Identifier** — reappearing from Lesson 5, restated in full: a name a
  person chooses, here for every class, field, and method this lesson
  declares.
- **Class, Field, Constructor, Constructor parameter shorthand
  (`this.fieldName`), Method, `this`, Getter, Arrow syntax (`=>`)** — all
  reappearing from Lesson 11 (Getter and Arrow syntax also from Lesson 9),
  restated in full: a class is a blueprint for a new shape of data; a
  field is a named piece of state it holds; a constructor builds a real
  object from it, with `this.fieldName` shorthand assigning an argument
  straight into a same-named field; a method is a function declared
  inside a class, reaching that specific object's own state through
  `this`; a getter (`get`) is read like a field but computed fresh each
  time; arrow syntax (`=>`) makes a method or getter's entire body one
  expression.
- **`abstract`** — reappearing from Lesson 5, given its full, general
  treatment for the first time: marks a class that can never be
  instantiated directly — only extended or implemented by some other,
  concrete class. Lesson 5 only ever named this narrowly, inside
  `dart:core`'s own real `abstract final class int extends num`, `abstract
  final class String implements Comparable<String>, Pattern`, and
  `abstract final class double extends num`; this lesson's Concept Unit 4
  declares this curriculum's own first `abstract` class and proves, with a
  real compile error, exactly what that restriction means.
- **`extends`** — reappearing from Lesson 5, given its full, general
  treatment for the first time: declares that one class builds directly on
  another, inheriting everything that other class already defines (its
  fields and methods) and adding or overriding on top of it. Lesson 5
  only ever named this narrowly, inside `dart:core`'s own real `int
  extends num` and `double extends num`; this lesson's Concept Unit 2
  writes this curriculum's own first `extends` relationship.
- **Superclass / subclass** — the two ends of an `extends` relationship:
  the class being built on (the superclass) and the class building on it
  (the subclass), inheriting everything the superclass already defines.
- **`super`** — inside a subclass's own constructor, refers to its
  superclass, specifically to call the superclass's own constructor and
  hand it whatever the superclass's own fields need. It exists because a
  subclass's fields don't replace its superclass's own fields — both
  exist together on the same object — and the superclass's own
  constructor is still the one thing responsible for correctly setting up
  the fields it itself declared.
- **`implements`** — reappearing from Lesson 5, given its full, general
  treatment for the first time: declares that a class agrees to provide
  every member a named contract (an **interface**, below) promises,
  without inheriting any of that contract's own implementation the way
  `extends` does. Lesson 5 only ever named this narrowly, inside
  `dart:core`'s own real `String implements Comparable<String>, Pattern`
  and `num implements Comparable<num>`; this lesson's Concept Unit 3
  writes this curriculum's own first `implements` relationship.
- **Interface** — in Dart, any class at all can serve as one: a fixed set
  of members (here, one method, `describe()`, with no body at all —
  Concept Unit 3's own new syntax) that any class `implementing` it
  promises to provide its own real version of. It exists to let two
  otherwise-unrelated classes (this lesson's own `SudokuCell` and
  `PuzzleTitle`) both be treated identically wherever only that one shared
  contract matters, regardless of how differently each one is actually
  built underneath.
- **Abstract method** — a method declared with no body at all (just its
  signature, ending in `;`), inside an `abstract` class, stating that
  every concrete class implementing or extending it must supply its own
  real implementation. It exists as the actual mechanism an interface's
  own "promise" is written with: `Describable`'s own `String describe();`
  has no logic of its own at all — it exists purely to require that any
  implementer provide theirs.
- **`@override`** — an annotation (a piece of metadata attached directly
  to a member, not itself a keyword, operator, or class — Lesson 5's
  Vocabulary Extraction Rule requires it get its own slot precisely
  because it appears in code this lesson shows) written directly above a
  method that's providing its own version of one already declared by a
  superclass or interface. It exists purely to help a reader (and the
  compiler, which cross-checks it) confirm a method is intentionally
  fulfilling an inherited or interface obligation, not accidentally
  reusing a name that happens to collide.
- **Polymorphism** — calling the exact same method, through the exact same
  call site, on values of a shared type (here, `Describable`), and having
  each one actually run its *own*, different, real implementation,
  determined by its own concrete type at runtime — not by whatever type
  the variable calling it was declared with. Concept Unit 5 proves this
  directly, for real, rather than describing it.
- **`class-modifier final`** — reappearing from Lesson 5, given its full,
  general treatment for the first time: placed directly before `class`
  (not to be confused with Lesson 5's own `final` *variable* keyword —
  the same word, a genuinely different meaning depending on where it's
  written), forbids any other class from extending *or* implementing it at
  all. Lesson 5 already showed this for real, without explaining it:
  `dart:core`'s own real `abstract final class int extends num` and
  `abstract final class String implements Comparable<String>, Pattern`
  both use it — which is exactly why this curriculum could never write
  `class MyInt extends int { }`, even now.
- **`sealed`** — reappearing from Lesson 5, given its full, general
  treatment for the first time: permits extension or implementation only
  by a fixed, closed set of classes already known to Dart within the same
  file — no third, unknown class can ever be added later, even from
  elsewhere in this same project. Lesson 5 already showed this for real:
  `dart:core`'s own real `sealed class num implements Comparable<num>`
  is exactly why only `int` and `double` are allowed to extend `num` at
  all — a third numeric type is a genuine compile-time error, not a
  convention.

**Objects and methods used:**

- **`List`**
  - *What it is:* the same real, generic `dart:core` class Lesson 9
    introduced.
  - *Implementation:* `abstract interface class List<E> implements
    Iterable<E>, _ListIterable<E>` (verified in Lesson 9); relevant
    members reused here: `.where` (from `Iterable`, see below) and `.length`.
  - *Its use:* this lesson's `Puzzle` class holds a `List<SudokuCell>`.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 9.
- **`Iterable`**
  - *What it is:* the same real, generic `dart:core` interface Lesson 9
    introduced.
  - *Implementation:* `abstract mixin class Iterable<E>` (verified in
    Lesson 9); relevant member reused here: `Iterable<E> where(bool
    test(E element))`.
  - *Its use:* `Puzzle.countFilled` filters its own cells down to the
    unfilled ones.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 9.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: A Class That Holds Other Objects

### The Problem

Lesson 11 built one real `SudokuCell`. A real Sudoku board is a whole
collection of them — this needs its own class holding many `SudokuCell`
objects together, not one lone cell on its own.

> **Stop and think before reading on:** Given Lesson 9's own `List<E>`,
> what do you think a class needs to declare to hold a whole collection of
> some *other* class's objects as one of its own fields, rather than a
> collection of plain `int`s or `String`s the way every earlier lesson's
> lists have held?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-12/oop_demo.dart`
  — created, containing this unit's `Puzzle` class (and the `SudokuCell`
  it depends on, reused from Lesson 11); Concept Units 2–5 will each add
  their own classes to this same file before it's run once, as one real
  batch.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
class Puzzle {
  final List<SudokuCell> cells;

  Puzzle(this.cells);

  int countFilled() {
    return cells.where((cell) => !cell.isEmptyCell()).length;
  }
}
```

### The Updated Project

Not applicable — this is the file's brand-new starting content (alongside
`SudokuCell` itself, reused unmodified from Lesson 11 and not repeated
here since nothing about it changes in this unit).

### Introduce the concept in isolation

Real, verified output (batched with the rest of this lesson):

```
1
```

`puzzle.countFilled()` correctly reports `1` — of two real `SudokuCell`
objects held in `puzzle.cells`, only one had actually been given a value.

### Discarding this example

Nothing discarded — this is real, permanent content for the rest of this
lesson.

### Mechanical walkthrough

- **`final List<SudokuCell> cells;`** — a field (Lesson 11's term,
  reappearing): a generic type parameter (Lesson 9's term, reappearing),
  `<SudokuCell>`, fixes this `List` to hold specifically `SudokuCell`
  objects — this curriculum's own class, not a `dart:core` one — proving
  a generic class works identically regardless of whether its type
  argument is built-in or user-defined.
- **`Puzzle(this.cells);`** — a constructor (Lesson 11's term,
  reappearing), using constructor parameter shorthand (Lesson 11's term,
  reappearing) to store the given list directly.
- **`int countFilled() { ... }`** — a method (Lesson 11's term,
  reappearing).
- **`cells.where((cell) => !cell.isEmptyCell()).length`** — `Iterable`'s
  own real `.where` (this lesson's header, reappearing from Lesson 9),
  given an anonymous function (Lesson 9's term, reappearing) whose body,
  `!cell.isEmptyCell()`, uses the logical NOT operator (Lesson 6's term,
  reappearing) on `SudokuCell`'s own `isEmptyCell()` method (added in this
  unit's own version of the class, alongside `Puzzle`, for exactly this
  filtering); `.length` (Lesson 9's term, reappearing) counts however many
  survived the filter.

### CS lens

A class holding one or more objects of another class as its own fields,
rather than only primitive values, is **composition** — building a
larger, more complex object out of smaller, already-defined ones, the
"has-a" relationship, as opposed to the next unit's "is-a" relationship.

```
Also recognized in: a car "has-a" engine (rather than "is-a" kind of
engine), a house has rooms, an order has line items, a company's own
org chart bundling departments each holding their own employees
```

### SE lens

`Puzzle` could instead have flattened every `SudokuCell`'s own fields
directly onto itself (a list of `int` rows, a separate list of `int`
columns, and so on) — working, at the real cost of throwing away every
guarantee `SudokuCell` itself already enforces (Lesson 11's own validated
`setValue`) the moment its data is split apart into separate, unrelated
lists. Composition keeps each `SudokuCell` whole, guarantees intact,
simply held inside a larger structure rather than dismantled into it.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's code is combined with the rest of this lesson into one file, run
once. Complete real output shown in Concept Unit 5's own "Run it" step,
saved in `src/docs/flutter/verification/lesson-12/run-log.md`.

### Connecting this unit

This unit held existing objects together. The next unit builds a genuinely
new class *on top of* an existing one, rather than merely holding it.

---

## Concept Unit: Building One Class Directly on Another

### The Problem

Lesson 11's `SudokuCell` and this unit's `BoardPosition` both need a row
and a column — writing that pair of fields, and a method describing them,
separately in every class that needs a position would duplicate the exact
same logic. Lesson 5 already showed, without explaining it, that `int
extends num` — one real class building directly on another. What does
writing that relationship for this curriculum's own classes actually look
like?

> **Stop and think before reading on:** If `SudokuCell` could build
> directly on a simpler `BoardPosition` class (holding just a row and
> column), what fields and methods do you think `SudokuCell` would get
> "for free," without writing them out itself a second time? And what do
> you think has to happen, at the exact moment a `SudokuCell` is built, to
> make sure `BoardPosition`'s own fields (`row`, `col`) end up correctly
> set too?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-12/oop_demo.dart`
  — modified, adding `BoardPosition` and rewriting `SudokuCell` to extend
  it.
- **Change type:** Add (`BoardPosition`); refactor (`SudokuCell`'s own
  constructor and fields).
- **Location:** `BoardPosition` added before `SudokuCell`; `SudokuCell`'s
  own `row`/`col` fields and their constructor parameters removed,
  replaced by `extends BoardPosition` and a `super(row, col)` call.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
class BoardPosition {
  final int row;
  final int col;

  BoardPosition(this.row, this.col);

  String describePosition() {
    return 'row $row, col $col';
  }
}
```

```dart
class SudokuCell extends BoardPosition {
  final bool isGiven;
  int? _value;

  SudokuCell(int row, int col, this.isGiven) : super(row, col);
}
```

### The Updated Project

```dart
 1: class BoardPosition {                          // ← new
 2:   final int row;                               // ← new
 3:   final int col;                                // ← new
 4:
 5:   BoardPosition(this.row, this.col);             // ← new
 6:
 7:   String describePosition() {                    // ← new
 8:     return 'row $row, col $col';                 // ← new
 9:   }                                              // ← new
10: }                                                // ← new
11:
12: class SudokuCell extends BoardPosition {          // ← changed: extends BoardPosition
13:   final bool isGiven;
14:   int? _value;
15:
16:   SudokuCell(int row, int col, this.isGiven) : super(row, col);  // ← changed
17:
18:   // ...existing getters/methods from Lesson 11, unchanged, continue below
19: }
```

`SudokuCell` no longer declares `row`/`col` as its own fields at all — it
inherits them, real-proved by the next step.

### Introduce the concept in isolation

Whether `cellA.describePosition()` genuinely works — a method
`SudokuCell` never declares itself at all — is worth real proof, not
assumption; batched with the rest of this lesson:

```
row 0, col 0
```

`cellA`, a real `SudokuCell`, successfully calls `describePosition()` —
a method that exists nowhere in `SudokuCell`'s own body, proving it was
genuinely inherited from `BoardPosition`.

### Discarding this example

Nothing discarded — real, permanent content.

### Mechanical walkthrough

- **`class BoardPosition { ... }`** — a new, standalone class (Lesson 11's
  term, reappearing), holding exactly the two fields and one method every
  positioned thing needs.
- **`class SudokuCell extends BoardPosition`** — `extends` (this lesson's
  term): `SudokuCell` is now a **subclass** (this lesson's term) of
  `BoardPosition`, its **superclass** — every field and method
  `BoardPosition` declares (`row`, `col`, `describePosition`) now belongs
  to every `SudokuCell` too, without `SudokuCell` writing any of them
  itself.
- **`SudokuCell(int row, int col, this.isGiven) : super(row, col);`** — the
  constructor: `int row` and `int col` are now plain parameters (no
  `this.` shorthand, since `row`/`col` are no longer `SudokuCell`'s own
  fields to assign into directly); `: super(row, col)` is a call to
  `BoardPosition`'s own constructor — `super` (this lesson's term) — handing
  it the two values it needs to set up the fields *it* declares; this runs
  before `SudokuCell`'s own constructor body does anything else, since a
  subclass can't finish constructing itself until its superclass's own
  part of the object already exists.

### CS lens

One class building directly on another, automatically gaining everything
the other already defines, is **inheritance** — an "is-a" relationship (a
`SudokuCell` genuinely *is a* `BoardPosition`, plus more), the second
foundational way object-oriented languages let code be reused, alongside
composition (previous unit).

```
Also recognized in: a savings account "is-a" kind of bank account
(with everything a plain account has, plus interest); a square
"is-a" kind of rectangle; nearly every UI framework's own widget
class hierarchy, where a specific button "is-a" more general
interactive element
```

### SE lens

Without inheritance, `SudokuCell` would have to redeclare `row`, `col`, and
`describePosition` itself, exactly duplicating `BoardPosition`'s own logic
— fine once, a real, compounding maintenance cost the moment a second,
different kind of board element (an unrelated `PuzzleTitle`, this lesson's
next unit, deliberately does *not* need a position at all) also needs
position tracking. The real cost inheritance introduces instead: `SudokuCell`
is now permanently coupled to `BoardPosition`'s own design — a mistake in
`BoardPosition` affects every subclass built on it, and Dart only allows
`extends` from exactly one class at a time, a real constraint the next
unit's `implements` doesn't share.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Not run standalone; full output in Concept Unit 5's own "Run it" step.

### Connecting this unit

This unit inherited real implementation from a superclass. The next unit
introduces a relationship that promises a *shape*, without inheriting any
implementation at all.

---

## Concept Unit: Promising a Shape Without Inheriting It

### The Problem

`SudokuCell` and this unit's new `PuzzleTitle` (a puzzle's own display
name) have nothing in common structurally — no shared position, no shared
fields at all — but a Sudoku UI might reasonably want to treat both the
same way for one specific purpose: "give me a one-line description of
this thing." `extends` won't work here — Dart only allows extending one
class, and these two share no real implementation to inherit anyway. Is
there a way to promise "I can be described" without a real inheritance
relationship at all?

> **Stop and think before reading on:** If two completely unrelated
> classes both needed to guarantee they can produce a description, but
> shared no actual code to inherit, what would a "contract" between them
> need to specify — actual logic, or just a promise about what a caller
> can rely on being present?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-12/oop_demo.dart`
  — modified, adding `Describable`, `PuzzleTitle`, and `SudokuCell`'s own
  `describe()`.
- **Change type:** Add (`Describable`, `PuzzleTitle`, `SudokuCell.describe`).
- **Location:** `Describable` added at the top of the file; `implements
  Describable` added to `SudokuCell`'s own class header; `PuzzleTitle`
  added after `SudokuCell`.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Unit 2.

### The New Code

```dart
abstract class Describable {
  String describe();
}
```

```dart
class SudokuCell extends BoardPosition implements Describable {
  // ...existing fields/constructor from Concept Unit 2, unchanged...

  @override
  String describe() {
    return '${describePosition()}: ${_value ?? "empty"}';
  }
}
```

```dart
class PuzzleTitle implements Describable {
  final String name;

  PuzzleTitle(this.name);

  @override
  String describe() {
    return 'Puzzle: $name';
  }
}
```

### The Updated Project

```dart
 1: abstract class Describable {          // ← new
 2:   String describe();                  // ← new
 3: }                                      // ← new
 4:
 5: class BoardPosition {
 6:   final int row;
 7:   final int col;
 8:
 9:   BoardPosition(this.row, this.col);
10:
11:   String describePosition() {
12:     return 'row $row, col $col';
13:   }
14: }
15:
16: class SudokuCell extends BoardPosition implements Describable {  // ← changed
17:   final bool isGiven;
18:   int? _value;
19:
20:   SudokuCell(int row, int col, this.isGiven) : super(row, col);
21:
22:   int? get value => _value;
23:
24:   bool setValue(int newValue) {
25:     if (isGiven) return false;
26:     if (newValue < 1 || newValue > 9) return false;
27:     _value = newValue;
28:     return true;
29:   }
30:
31:   bool isEmptyCell() => _value == null;
32:
33:   @override                                                     // ← new
34:   String describe() {                                           // ← new
35:     return '${describePosition()}: ${_value ?? "empty"}';        // ← new
36:   }                                                              // ← new
37: }
38:
39: class PuzzleTitle implements Describable {   // ← new
40:   final String name;                        // ← new
41:
42:   PuzzleTitle(this.name);                    // ← new
43:
44:   @override                                 // ← new
45:   String describe() {                       // ← new
46:     return 'Puzzle: $name';                  // ← new
47:   }                                          // ← new
48: }                                            // ← new
```

### Introduce the concept in isolation

Real, verified output (batched with the rest of this lesson):

```
row 0, col 1: 7
```

`cellB.describe()` (called directly, not yet through the shared
`Describable` type — Concept Unit 5 does that) combines `describePosition`
(inherited from `BoardPosition`) with `_value`, proving `SudokuCell`'s own
`implements Describable` obligation is genuinely fulfilled with real,
working logic, not just declared.

### Discarding this example

Nothing discarded — real, permanent content.

### Mechanical walkthrough

- **`abstract class Describable { String describe(); }`** — `abstract`
  (this lesson's term) marks this class as never directly instantiable
  (Concept Unit 4 proves this for real); `String describe();` is an
  abstract method (this lesson's term) — a signature with no body at all,
  ending directly in `;` rather than a block — a promise every
  implementer must fulfill with real logic of its own.
- **`class SudokuCell extends BoardPosition implements Describable`** — a
  class can `extends` one superclass *and* `implements` any number of
  interfaces (this lesson's term) at the same time — genuinely different
  relationships, combined on one class header.
- **`@override`** — this lesson's own annotation (this lesson's term),
  written directly above `describe()`, confirming to any reader (and
  cross-checked by the compiler) that this method is intentionally
  fulfilling `Describable`'s own obligation, not an unrelated, coincidentally
  same-named method.
- **`class PuzzleTitle implements Describable`** — a completely separate
  class, sharing no superclass, no fields, and no other relationship at
  all with `SudokuCell` — connected to it only through both promising the
  same one-method interface.

### CS lens

Two structurally unrelated classes both fulfilling the same named
contract is **interface-based polymorphism** in its purest form — proof
that "is-a `Describable`" doesn't require any shared implementation at
all, only a shared promise.

```
Also recognized in: a USB port's own fixed physical/electrical
contract, honored by wildly different devices (a mouse, a flash
drive, a keyboard) that share no other design in common; Java's and
C#'s own `interface` keyword (Dart uses `implements` on any class
instead of a separate keyword); a job posting's own list of required
qualifications, met by candidates with completely different
backgrounds
```

### SE lens

Without an interface, code that wants to describe "anything describable"
would need to check, by hand, whether it's specifically a `SudokuCell`, or
specifically a `PuzzleTitle`, or any future third kind — growing a new
`if`/`else if` branch every time a new describable thing is added.
`Describable` moves that decision to each individual class itself (via
its own `describe()` implementation), so calling code (Concept Unit 5)
never needs to know, or care, how many different kinds of describable
things actually exist.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone; full output in Concept Unit 5's own "Run it" step.

### Connecting this unit

This unit promised a shape two unrelated classes could both fulfill. The
next unit proves, with a real compile error, exactly what `abstract`
actually forbids.

---

## Concept Unit: A Blueprint You Can Never Build Directly

### The Problem

`Describable` has been declared `abstract` since the previous unit, with
no real proof yet of what that word actually stops anyone from doing.
Could code somewhere still write `Describable()` directly, the same way
`SudokuCell(0, 0, true)` builds a real object?

> **Stop and think before reading on:** `Describable`'s own `describe()`
> has no body at all — just a signature. If code tried to build a bare
> `Describable` directly, what would actually *run* if something later
> tried to call `.describe()` on it? Given that, what do you think `abstract`
> is actually for?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-12/abstract_instantiation_error.dart`
  — created, for this unit's own real, deliberate compile error.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
void abstractInstantiationError() {
  var thing = Describable();
  print(thing);
}
```

### The Updated Project

Not applicable — a brand-new, freestanding file.

### Introduce the concept in isolation

This is exactly the kind of claim worth real proof, not a guess — run for
real:

```
error - abstract_instantiation_error.dart:6:15 - Abstract classes can't be instantiated. Try creating an instance of a concrete subtype. - instantiate_abstract_class
```

This answers the Socratic question directly: `Describable()` never gets
the chance to leave `describe()` un-runnable, because the compiler
refuses to build one at all — `abstract`'s real job is preventing an
incomplete blueprint from ever becoming a real object in the first place.

### Discarding this example

`thing` is disposable, never-called, purely diagnostic code. What carries
forward: `abstract class` is a real, compiler-enforced restriction, proven
by a real rejected attempt, not merely a naming convention.

### Mechanical walkthrough

- **`Describable()`** — an attempted instantiation (Lesson 11's term,
  reappearing) of an `abstract` class directly; rejected because
  `Describable` promises a `describe()` implementation it does not itself
  provide — building one directly would leave that promise genuinely
  unfulfillable.
- **`void abstractInstantiationError() { ... }`** — a function (Lesson
  8's term, reappearing) wrapping the broken line so it can be analyzed
  without being called or needing a `main`, the same pattern Lesson 5's
  own `type_errors.dart` established.

### CS lens

Making an incomplete definition impossible to instantiate directly is
directly related to **`sealed`** (this lesson's term) and class-modifier
**`final`** (this lesson's term) — all three are ways a class controls
*how* it can legally be used elsewhere, checked by the compiler rather
than left to convention; `abstract` specifically controls instantiation,
while `final`/`sealed` (both already real, already proven back in Lesson
5's own fetched `dart:core` source — `abstract final class int extends
num`; `sealed class num implements Comparable<num>`) instead control
*extension*.

```
Also recognized in: Java's and C#'s own `abstract` keyword,
identical in effect; a job posting for "a manager" with no
description of which specific department — meaningless without a
concrete, specific role attached; an unsigned, blank contract
template, not itself a real agreement until a specific party fills
it in
```

### SE lens

Without `abstract`, nothing would stop `Describable()` from compiling,
only to crash the moment `.describe()` was actually called on it (a
`NoSuchMethodError`-style failure, the same real category of bug Lesson
10's `dynamic` unit proved for a completely different reason). Marking
`Describable` `abstract` moves that exact mistake from "a crash, at
runtime, wherever this incomplete object happens to be used" to "a
compile error, the instant the file is saved" — the same kind of
earlier-is-better guarantee every real, run-verified compile error since
Lesson 5 has demonstrated.

### Commands needed

- **`dart analyze <file>`** — reappearing from Lesson 5, restated in full:
  statically checks a file for compile-time errors without running it.

### Run it

Real, verified output:

```
Analyzing abstract_instantiation_error.dart...

  error - abstract_instantiation_error.dart:6:15 - Abstract classes can't be instantiated. Try creating an instance of a concrete subtype. - instantiate_abstract_class

1 issue found.
```

Real, saved in full in
`src/docs/flutter/verification/lesson-12/run-log.md`.

### Connecting this unit

This unit proved `abstract` really does forbid direct instantiation. The
final unit shows why an `abstract` interface like `Describable` is worth
having at all: calling the same method on genuinely different real
objects, through one shared type.

---

## Concept Unit: One Call, Many Real Behaviors

### The Problem

`SudokuCell.describe()` and `PuzzleTitle.describe()` have been called
directly so far, each on its own, already-known concrete type. A real
Sudoku UI would want to describe a *mixed* collection — cells and a title
together — through one shared loop, without checking each item's specific
type by hand first.

> **Stop and think before reading on:** If a `List<Describable>` held both
> `SudokuCell` and `PuzzleTitle` objects together, and a loop called
> `.describe()` on each one through that same, shared `Describable` type,
> what do you predict actually runs for each — one single, generic
> `Describable` behavior, or each object's own real, individual
> implementation?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-12/oop_demo.dart`
  — modified, adding this unit's polymorphism proof to `main`, completing
  the file.
- **Change type:** Add (final lines in `main`).
- **Location:** Appended directly after Concept Unit 1's own `main`
  contents.
- **Dependencies:** The file created in Concept Unit 1, extended through
  Concept Unit 3.

### The New Code

```dart
List<Describable> items = [cellA, cellB, PuzzleTitle('Open Calc Sudoku')];
for (var item in items) {
  print(item.describe());
}
```

### The Updated Project

Not applicable — a brand-new, freestanding addition to `main`, with
nothing surrounding it that changes.

### Introduce the concept in isolation

This unit's own Socratic question is exactly the kind of claim worth real
proof — run for real, completing this lesson's one batched run:

```
row 0, col 0: empty
row 0, col 1: 7
Puzzle: Open Calc Sudoku
```

Three real, *different* outputs, from three real, *different* underlying
classes, called through the exact same `item.describe()` — proving each
object ran its **own** real implementation, not one shared, generic
`Describable` behavior. `cellA` and `cellB` each ran `SudokuCell`'s own
`describe()` (itself built from inherited `describePosition` plus its own
`_value`); `PuzzleTitle`'s object ran a completely unrelated
implementation.

### Discarding this example

`items`'s own three specific objects are disposable. What carries
forward: calling a method through a shared interface type runs each
object's own real, concrete implementation — determined by the object,
never by the variable's own declared type.

### Mechanical walkthrough

- **`List<Describable> items = [...]`** — a declaration (Lesson 5's term,
  reappearing) using a generic type parameter (this lesson's term,
  reappearing), `<Describable>`; a list literal (Lesson 7's term,
  reappearing) holding three objects of two genuinely different real
  classes, legal because both implement the one declared element type.
- **`for (var item in items)`** — Lesson 7's `for-in` loop (reappearing),
  binding `item` to each element in turn; `item`'s own declared type is
  `Describable`, the shared interface — not `SudokuCell` or `PuzzleTitle`
  specifically.
- **`item.describe()`** — a method call (Lesson 9's term, reappearing) on
  `item`; because Dart resolves which real method body actually runs
  based on the object's own concrete type at runtime, not `item`'s own
  declared `Describable` type, this single call site runs three different
  real bodies across the loop's three repetitions.

### CS lens

Resolving which real method body runs based on an object's own concrete
type, discovered at runtime rather than fixed by the variable's declared
type, is **dynamic dispatch** — the actual mechanism underneath the word
**polymorphism** (this lesson's own term), proven directly by this unit's
own three genuinely different real outputs from one unchanging call site.

```
Also recognized in: Java's and C#'s own virtual method dispatch;
Flutter's own widget tree, where a generic `Widget build()` call is
answered differently by every different widget type in the tree; a
universal remote sending the identical "power" signal to a TV, a
sound system, or a game console, each device responding in its own
real way
```

### SE lens

Without polymorphism, code that needed to describe a mixed collection
would need its own `if (item is SudokuCell) { ... } else if (item is
PuzzleTitle) { ... }`-style branching (checking each object's real type by
hand), growing a new branch every time a new describable kind is added —
and, worse, every place in the codebase that does this same check would
need updating together. Polymorphism moves that decision entirely inside
each class's own `describe()` — this lesson's own loop never once checks
what kind of `Describable` it's holding, and would keep working,
completely unmodified, if a third, entirely new `Describable` class were
added tomorrow.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire batched file:

```
1
row 0, col 0
row 0, col 1: 7
row 0, col 0: empty
row 0, col 1: 7
Puzzle: Open Calc Sudoku
```

Real, saved in full in
`src/docs/flutter/verification/lesson-12/run-log.md`.

### Connecting this unit

This unit proved, with three genuinely different real outputs from one
unchanging call site, the exact mechanism every earlier unit in this
lesson was building toward.

---

## Connect the Pieces

Trace one Sudoku-flavored scenario through everything this lesson built.
Concept Unit 1's `Puzzle` held two real `SudokuCell` objects together,
composed rather than flattened, and correctly counted `1` filled cell — a
real, run-verified result, not an assumption. Concept Unit 2's
`SudokuCell` inherited its own `row`/`col` and `describePosition` directly
from `BoardPosition`, real-proved by calling a method `SudokuCell` never
itself declares. Concept Unit 3 gave both `SudokuCell` and a completely
unrelated `PuzzleTitle` the same one-method `Describable` promise,
fulfilled with two genuinely different real implementations. Concept Unit
4 proved, with a real compile error, that `Describable` itself can never
be built directly — an incomplete promise can never become a real,
broken object. And Concept Unit 5 closed this lesson on its single most
important proof: one loop, one shared type, one unchanging call site,
three genuinely different real outputs — polymorphism, demonstrated, not
described.

The last major cluster of promises this curriculum deferred is now fully
paid: `abstract`, `extends`, `implements`, class-modifier `final`, and
`sealed` are no longer narrow mentions inside someone else's real
`dart:core` code — every one is now this curriculum's own, real, working,
run-verified subject. Lesson 13 turns to a different, narrower kind of
type: one built specifically to model a small, fixed set of named
possibilities.
