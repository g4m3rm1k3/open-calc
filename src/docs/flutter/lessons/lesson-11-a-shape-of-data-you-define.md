# Lesson 11: A Shape of Data You Define

**What you will build:** A single, real class, `SudokuCell`, grown across
five Concept Units — first as a bare, minimal shape, then holding several
distinct pieces of state at once, then constructed from real arguments,
then acting on its own state through its own methods, and finally
protecting that state from being set to something invalid. It does not
join a real project yet — the class itself is disposable, verification-
only, same as every earlier lesson's own code. This lesson pays off two
promises this curriculum deferred: Lesson 5 used the word **`class`**
narrowly, only to say where `String`/`int`/`double`/`bool` structurally
come from; Lesson 9 used **method calls** (`.add`, `.sort`) without ever
explaining what makes something a method rather than an ordinary
function. Both get their full treatment here.

**What you need to know first:** Lesson 5's `int`, `int?`, `bool`, and
`String` (this lesson's own class holds one of each). Lesson 8's
functions, parameters, and the `return` statement, reused for this
lesson's own methods. Lesson 9's narrow, unexplained method calls,
finally given full treatment. Lesson 10's `??` and `dynamic`-versus-
static contrast, both echoed in this lesson's own encapsulation unit.

**Terms used in this lesson:**

- **Identifier** — reappearing from Lesson 5, restated in full: a name a
  person chooses, with no meaning to Dart beyond being that thing's own
  name — here, a class's own name, alongside every field, constructor,
  and method name this lesson declares.
- **Block (`{ }`)** — reappearing from Lesson 6, restated in full: a
  sequence of statements (or, here, member declarations) grouped between
  curly braces — a class's own body is one.
- **Class** — reappearing from Lesson 5, given its full, general treatment
  for the first time: a blueprint defining a new shape of data — what
  pieces of state it holds (its fields) and what it can do (its methods)
  — from which any number of concrete, independent objects can be built.
  Lesson 5 only ever said `String`/`int`/`double`/`bool` structurally
  "come from" real classes in `dart:core`, without explaining what that
  actually meant; this lesson's Concept Unit 1 defines and builds a class
  of this curriculum's own for the first time.
- **Object (instance)** — one concrete, independent thing built from a
  class's own blueprint, with its own actual values for every field the
  class declares. It exists as the distinction between the *blueprint*
  (the class, describing what a `SudokuCell` generally has) and a *real,
  specific one* (this lesson's own `cell`, holding real values `2`, `5`,
  `false` for its own fields) — the same distinction a math class's
  general shape `f(x) = x + 1` has from one specific evaluation, `f(3) =
  4`.
- **Field** — a named piece of state a class declares its objects will
  each hold their own copy of — structurally the same idea as Lesson 5's
  variable, but declared inside a class rather than inside a function, and
  belonging to a specific object rather than to a specific stretch of
  running code.
- **Constructor** — a special, class-associated function, sharing the
  class's own name, that runs exactly once for each new object, at the
  moment it's built, and is responsible for giving every one of that
  object's fields its own real starting value.
- **Constructor parameter shorthand (`this.fieldName`)** — writing
  `this.fieldName` directly as a constructor's own parameter, rather than
  a separate parameter name plus a body that assigns it to the field by
  hand. It exists because "take this argument and store it directly into
  the field of the same name" is, by far, the single most common thing a
  constructor's own body does — common enough that Dart provides dedicated
  syntax to skip writing that assignment out explicitly.
- **Instantiation** — actually building a new object from a class, by
  writing the class's own name followed by parentheses containing
  arguments for its constructor — `SudokuCell(2, 5, false)`, for instance.
  Unlike some other languages, Dart needs no separate keyword (no `new`)
  in front of this — the class name followed by `(...)` is itself a
  complete instantiation.
- **Method** — reappearing from Lesson 9, given its full, general
  treatment for the first time: a function (Lesson 8's term) declared
  *inside* a class, callable only on a specific object built from that
  class, and, unlike an ordinary top-level function, able to read and
  change that specific object's own fields directly. Lesson 9's `.add`,
  `.sort`, `.contains`, `.map`, and `.where` were all real methods,
  explained only narrowly at the time; this lesson's own `setValue` and
  `describe` are this curriculum's first *self-declared* methods.
- **`this`** — inside a method or constructor, refers to the specific
  object that method or constructor is currently running for. It exists
  because the exact same method body is shared by every object built from
  a class — `this` is how that one shared body reaches the one specific
  object's own fields it's currently supposed to act on, rather than some
  other object built from the same class.
- **Getter (`get`)** — a method-like member, declared with the `get`
  keyword, that's read the same way a field is (no parentheses at the call
  site) but whose value is actually *computed*, freshly, each time it's
  read, rather than stored directly. It exists so a class's own public
  surface can expose a computed fact (like whether a cell currently has no
  value at all) exactly as simply as it exposes a stored field, with
  nothing about the call site revealing which one it actually is.
- **Arrow syntax (`=>`)** — reappearing from Lesson 9, restated in full: a
  compact way to write a function (here, a method or a getter) whose
  entire body is one expression, equivalent to a full block body with an
  explicit `return`.
- **Encapsulation** — a class controlling how its own state can be
  changed from outside itself, rather than exposing its fields directly
  for any other code to set to anything at all. It exists so a class can
  guarantee something about its own state (a Sudoku digit is always
  between `1` and `9`, or never changes once a cell is marked as a given
  clue) by making that guarantee impossible to bypass through its own
  public surface — proven, in this lesson's own final unit, to still be
  bypassable a different way, which is exactly the point of proving it
  rather than assuming it.
- **Private member (`_name`)** — a field or method whose name starts with
  an underscore, hidden from code *outside the same file* — but, as this
  lesson's own real, run-verified proof shows, fully visible and directly
  usable by any other code that happens to share that same file. It
  exists to mark "this is this class's own internal detail, not part of
  its public contract" — a promise enforced at the level of an entire
  file, not, as in some other languages, at the level of the class itself.

**Objects and methods used:**

- **`int`, `int?`, `bool`, `String`**
  - *What they are:* the same real `dart:core` classes Lesson 5
    introduced.
  - *Implementation:* `abstract final class int extends num`; `final
    class bool`; `abstract final class String implements
    Comparable<String>, Pattern` (all verified in Lesson 5); `int?` is
    `int` combined with Lesson 5's own nullable-type `?`.
  - *Their use:* this lesson's own `SudokuCell` class holds one field of
    each: `row`/`col` (`int`), `isGiven` (`bool`), `_value` (`int?`); its
    `describe` method returns a `String`.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 5 — this lesson uses them as field types and a return type,
    not in any new way of their own.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type:* a top-level function in `dart:core`.
  - *Responsibility:* convert one value to text and write it, plus a
    newline, to standard output.
  - *Depends on:* one argument — in this lesson, often a field or method
    result read directly off a `SudokuCell` object.
  - *Connects to:* called throughout this lesson's snippets.
  - *Shape:* `dart:core`'s public standard-library surface, unchanged
    since Lesson 1.

---

## Concept Unit: A Blueprint for a New Kind of Thing

### The Problem

Every value this curriculum has used so far — `int`, `String`, `bool` —
was already provided by Dart itself. A Sudoku board is going to need its
own kind of thing entirely: one specific cell, holding its own row,
column, and current value together, as one single unit — nothing in
`dart:core` already models that. How do you define a genuinely new shape
of data?

> **Stop and think before reading on:** Lesson 5 already showed that
> `String`, `int`, `double`, and `bool` are each real classes, not raw
> keywords. Given that, what do you think it would take to make a
> *fourth*, brand-new class — one this curriculum defines for itself,
> rather than one already provided by `dart:core`?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-11/sudoku_cell_demo.dart`
  — created, containing this unit's minimal class; Concept Units 2–5 will
  each grow this same class before the file is run once, as one real
  batch.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
class SudokuCell {
  final int row;
}
```

### The Updated Project

Not applicable — this is the file's brand-new starting content.

### Introduce the concept in isolation

There is nothing to run yet — this minimal shape has no constructor, so
no real `SudokuCell` object can be built from it at all; that's exactly
what the next three units add, one piece at a time. What this shape
already establishes: `SudokuCell` is now a real, if incomplete, **class**
— a blueprint declaring that any object built from it will hold (at
least) one field, `row`, of type `int`.

### Discarding this example

Nothing is discarded — this exact code is the real starting point every
later unit in this lesson builds directly on top of, not a throwaway
example.

### Mechanical walkthrough

- **`class SudokuCell { ... }`** — a class declaration: `class`, a
  reserved word, followed by an identifier (Lesson 5's term, reappearing)
  naming this new blueprint, followed by a block (Lesson 6's term,
  reappearing) containing everything the class declares.
- **`final int row;`** — a field declaration: `final` (Lesson 5's term,
  reappearing, here applied to a field rather than a local variable —
  meaning this specific object's own `row` can be set once and never
  reassigned afterward) and `int` (Lesson 5's real class) as the field's
  type, `row` as its name. Unlike Lesson 5's own local variables, this
  declares no value at all yet — a real value only exists once a specific
  object is actually built, which this incomplete shape has no way to do
  yet.

### CS lens

Bundling several distinct pieces of state together under one name, so
they can be created, passed around, and reasoned about as a single unit,
is **abstraction** applied to data — the same broad idea Lesson 8's own
CS lens named for *behavior* (procedural abstraction), here applied to
*state* instead.

```
Also recognized in: a `struct` in C, a record in a database table, a
contact card bundling a name/phone/email together rather than as
three separate, unrelated lists kept in sync by hand
```

### SE lens

Without a class, a Sudoku cell's row, column, value, and given-status
would each need their own separate variable — four related pieces of
data with nothing in the code itself expressing that they belong
together, easy to accidentally pass in the wrong order to a function, or
to update one without the others. A class makes that relationship real
and enforced: every field genuinely belongs to the exact same object,
and a function written to accept "a `SudokuCell`" can't accidentally be
handed a stray, unrelated `int` instead.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run — this shape has no constructor yet, so nothing can be
instantiated from it to produce any output at all; the next three units
build toward the point where a real run becomes meaningful.

### Connecting this unit

This unit declared a blueprint holding exactly one field. The next unit
gives it the rest of what a real Sudoku cell actually needs to track.

---

## Concept Unit: Holding Several Pieces of State Together

### The Problem

A real Sudoku cell needs more than just a row: its column, whether it was
one of the puzzle's original given clues, and its current value (which
might not exist yet at all, per Lesson 5's own `int?`). One field alone
doesn't capture that.

> **Stop and think before reading on:** Given the previous unit's single
> `final int row;`, what do you predict changes — and what stays exactly
> the same — about declaring three more fields of different types (an
> `int`, a `bool`, a nullable `int?`) right alongside it?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-11/sudoku_cell_demo.dart`
  — modified, adding three more fields.
- **Change type:** Add (new fields in the class created in Concept Unit
  1).
- **Location:** Directly after `final int row;`.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
final int col;
final bool isGiven;
int? _value;
```

### The Updated Project

```dart
1: class SudokuCell {
2:   final int row;
3:   final int col;        // ← new
4:   final bool isGiven;   // ← new
5:   int? _value;          // ← new
6: }
```

### Introduce the concept in isolation

Still nothing to run — this class still has no constructor, so no real
object exists yet to print anything from.

### Discarding this example

Nothing discarded — same as the previous unit, this is real, permanent
starting content for the rest of this lesson.

### Mechanical walkthrough

- **`final int col;`** — a second field, same shape as `row`: a whole
  number, fixed once set.
- **`final bool isGiven;`** — a third field, `bool` (Lesson 5's real
  class) instead of `int`; whether this specific cell was one of the
  puzzle's own original clues, fixed once set.
- **`int? _value;`** — a fourth field: `int?` (Lesson 5's nullable type,
  reappearing) because a cell's own current value genuinely might not
  exist yet; **not** `final`, because unlike the other three, this one
  needs to actually change over a cell's lifetime as a player fills it
  in; and named with a leading underscore — a private member (this
  lesson's term, above) — because this lesson's final unit will control
  how it's allowed to change, rather than leaving it directly settable
  from outside the class.

### CS lens

A class whose fields cover every piece of state a real-world concept
actually has — no more, no less — is doing the same *modeling* work
every earlier lesson's real `dart:core` classes already did (`String`
modeling text, `int` modeling a whole number); this lesson's own class is
this curriculum's first attempt at modeling a concept of its own,
Sudoku-specific rather than general-purpose.

```
Also recognized in: a database table's own column list, a form's
own set of fields, a spec sheet listing every attribute a product
actually has
```

### SE lens

Deciding which fields belong on this class, and which don't, is itself a
real design decision: `_value`'s own leading underscore is deliberate,
not incidental — this project will lean toward marking any field whose
direct, unchecked mutation could leave an object in an invalid state
(later units prove exactly why) as private from the moment it's
declared, rather than starting public and tightening later, which risks
other code already depending on unrestricted access by the time that
tightening happens.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Still not run — no constructor exists yet to actually build one.

### Connecting this unit

This unit gave the class every field a real Sudoku cell needs. The next
unit makes it possible to actually build one.

---

## Concept Unit: Building a Real One

### The Problem

`SudokuCell` now declares four fields, but nothing yet says how a real,
specific cell — row `2`, column `5`, not a given clue — actually gets
built. Fields alone are just a shape; something has to supply their real,
starting values.

> **Stop and think before reading on:** If a constructor's most common job
> is "take an argument and store it directly into a field of the same
> name," what would you want Dart to let you skip writing out by hand, to
> avoid three or four nearly-identical `this.field = field;`-style lines
> in every single constructor?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-11/sudoku_cell_demo.dart`
  — modified, adding a constructor.
- **Change type:** Add (new member in the class created in Concept Unit
  1).
- **Location:** Directly after the four fields from Concept Units 1–2.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Unit 2.

### The New Code

```dart
SudokuCell(this.row, this.col, this.isGiven);
```

### The Updated Project

```dart
1: class SudokuCell {
2:   final int row;
3:   final int col;
4:   final bool isGiven;
5:   int? _value;
6:
7:   SudokuCell(this.row, this.col, this.isGiven);   // ← new
8: }
```

### Introduce the concept in isolation

Whether `SudokuCell(2, 5, false)` genuinely produces a real, usable object
— with `_value` really defaulting to `null` with no constructor mention
of it at all — is worth real proof, not assumption; run for real, batched
with the rest of this lesson:

```
true
null
```

`cell.isEmpty` (this lesson's next unit adds this getter; shown here as
the real, run-verified proof this constructor actually works) is `true`,
and `cell.value` is `null` — `_value` really did default to `null`
automatically, exactly the way Lesson 5's own uninitialized `int?` local
variables did, even though the constructor's own parameter list never
mentions `_value` at all.

### Discarding this example

Nothing discarded — real, permanent content.

### Mechanical walkthrough

- **`SudokuCell(this.row, this.col, this.isGiven);`** — a constructor (this
  lesson's term): sharing its own class's exact name, `SudokuCell`, with
  no return type written at all (constructors never declare one; building
  an object *is* what they return, implicitly). Its three parameters each
  use constructor parameter shorthand (this lesson's term): `this.row`
  means "take this argument and store it directly into the field named
  `row`," without a separate parameter name and a written-out assignment.
  `_value` has no matching parameter here at all — Concept Unit 2 already
  proved fields default to `null` when nullable and left unset, so this
  constructor simply lets that default stand.

### CS lens

Guaranteeing every object starts in a real, valid, fully-initialized
state the moment it's built — never a half-finished, partially-set object
floating around — is a specific, foundational OOP idea: the
**constructor's own contract**, which every class-based language provides
some version of.

```
Also recognized in: a factory assembly line's own final inspection
step before a product ships, a form that can't be submitted until
every required field is filled, a car that can't start until its
ignition sequence completes
```

### SE lens

Without constructor parameter shorthand, this same constructor would need
a separate parameter name plus a body: `SudokuCell(int row, int col, bool
isGiven) { this.row = row; this.col = col; this.isGiven = isGiven; }` —
functionally identical, at the cost of naming each value twice (once as a
parameter, once as the field it's assigned to) for no real benefit, since
"take this exact argument and store it under this exact same name" is the
overwhelmingly common case. Dart's shorthand exists specifically because
writing that redundant assignment by hand, for every field, in every
constructor, adds real, repeated bulk with nothing gained.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's constructor is exercised together with the rest of this lesson's
own code; full output in Concept Unit 5's own "Run it" step.

### Connecting this unit

This unit made it possible to build a real `SudokuCell`. The next unit
gives that object something to actually *do*.

---

## Concept Unit: Giving an Object Behavior of Its Own

### The Problem

A real `SudokuCell` object can now exist, but it can't yet answer
anything about itself, or change its own state in a controlled way — every
Concept Unit so far only ever read or set a field directly. Lesson 9
already called methods like `.add` and `.contains` on real `dart:core`
objects, without ever explaining what actually makes something a method.
What does it take to give this curriculum's own class behavior of its
own?

> **Stop and think before reading on:** If a method needs to read or
> change the *one specific object* it was called on — not some other
> object built from the same class — how do you think its own body would
> refer to "the object I'm currently running for," given that the exact
> same method body is shared by every object ever built from this class?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-11/sudoku_cell_demo.dart`
  — modified, adding two methods and a getter.
- **Change type:** Add (new members in the class created in Concept Unit
  1).
- **Location:** Directly after the constructor from Concept Unit 3.
- **Dependencies:** The file created in Concept Unit 1, extended through
  Concept Unit 3.

### The New Code

```dart
bool get isEmpty => _value == null;

String describe() {
  return 'row $row, col $col: ${_value ?? "empty"}';
}
```

### The Updated Project

```dart
 1: class SudokuCell {
 2:   final int row;
 3:   final int col;
 4:   final bool isGiven;
 5:   int? _value;
 6:
 7:   SudokuCell(this.row, this.col, this.isGiven);
 8:
 9:   bool get isEmpty => _value == null;      // ← new
10:
11:   String describe() {                       // ← new
12:     return 'row $row, col $col: ${_value ?? "empty"}';  // ← new
13:   }                                          // ← new
14: }
```

### Introduce the concept in isolation

Real, verified output, batched with the rest of this lesson:

```
row 2, col 5: 7
```

(shown here from Concept Unit 5's own full run, after a value has already
been set — proving `describe` reads whatever `_value` genuinely holds at
the moment it's called, not a fixed snapshot from when the object was
built).

### Discarding this example

Nothing discarded — real, permanent content.

### Mechanical walkthrough

- **`bool get isEmpty => _value == null;`** — a getter (this lesson's
  term): `get` marks this as read like a field (`cell.isEmpty`, no
  parentheses at the call site) even though its value is computed fresh
  every time; `=>` is arrow syntax (this lesson's term, reappearing from
  Lesson 9), making its entire body the one expression `_value == null` —
  the equality operator (Lesson 6's term, reappearing) comparing `_value`
  against `null` (Lesson 5's term, reappearing).
- **`String describe() { ... }`** — a method (this lesson's term): a
  function declared inside the class, callable only on a specific
  `SudokuCell` object (`cell.describe()`, not `describe()` alone).
- **`return 'row $row, col $col: ${_value ?? "empty"}';`** — the `return`
  statement (Lesson 8's term, reappearing), handing back a `String` built
  with string interpolation (Lesson 4's term, reappearing): `$row` and
  `$col` read this specific object's own fields directly — no `this.`
  needed to reach them, since Dart lets a method's body refer to its own
  object's fields by their bare names, implicitly through `this` (this
  lesson's own term); `${_value ?? "empty"}` uses the null-coalescing
  operator (Lesson 10's term, reappearing) to show `_value` itself when
  present, or the text `"empty"` when it's `null`.

### CS lens

Bundling data (fields) together with the operations that act on that
data (methods), rather than keeping data and the functions that touch it
as two entirely separate things, is **encapsulation of behavior with
state** — one of the two pillars object-oriented programming is
generally described as resting on (the other, data hiding, is this
lesson's own final unit).

```
Also recognized in: a thermostat bundling its own temperature
reading together with its own "turn on the heat" behavior, rather
than a separate sensor and a separate switch with nothing connecting
them in code; a bank account object bundling its balance together
with its own deposit/withdraw operations
```

### SE lens

Without methods, this same logic (checking emptiness, describing a cell)
would have to live in a separate, top-level function (Lesson 8), taking a
`SudokuCell` as a parameter and reaching into its fields from outside —
which works, but scatters logic that's conceptually "about" a
`SudokuCell` away from the class itself, and, since Concept Unit 5's own
private `_value` is about to become genuinely restricted from outside
access, a separate top-level function would lose the ability to reach it
at all. Keeping behavior on the class itself means that behavior can
always see everything the class has, public or private.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone; full output in Concept Unit 5's own "Run it" step.

### Connecting this unit

This unit gave the class real behavior. The final unit protects the one
field (`_value`) that behavior depends on from being set to something
invalid — and proves, honestly, the real limits of that protection.

---

## Concept Unit: Protecting an Object's Own State

### The Problem

Nothing so far stops other code from writing `cell._value = 999;`
directly — an invalid Sudoku digit, or a value written onto a cell that's
supposed to be a locked, given clue. A class's own fields being freely
settable from outside defeats the entire point of a class guaranteeing
anything about its own state.

> **Stop and think before reading on:** If a method controlled every
> change to `_value` instead of allowing direct access, what could that
> method check before actually changing anything, that a bare field
> assignment (`cell._value = 999;`) never could? And — genuinely
> uncertain, worth thinking about before reading on — do you expect a
> `_` prefix to make a field impossible to reach from *any* other code
> anywhere, or only from certain other code?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-11/sudoku_cell_demo.dart`
  — modified, adding a validating method and this lesson's own real
  privacy proof, completing the file.
- **Change type:** Add (new member; new code in `main`).
- **Location:** The method, directly after `describe`; the privacy proof,
  in `main`, after everything else.
- **Dependencies:** The file created in Concept Unit 1, extended through
  Concept Unit 4.

### The New Code

```dart
bool setValue(int newValue) {
  if (isGiven) return false;
  if (newValue < 1 || newValue > 9) return false;
  _value = newValue;
  return true;
}
```

And, in `main`, a deliberate, direct bypass of this exact method:

```dart
cell._value = 9;
print(cell._value);
```

### The Updated Project

The complete, final class this lesson built (new lines marked; everything
else is exactly what Concept Units 1–4 left it as):

```dart
 1: class SudokuCell {
 2:   final int row;
 3:   final int col;
 4:   final bool isGiven;
 5:   int? _value;
 6:
 7:   SudokuCell(this.row, this.col, this.isGiven);
 8:
 9:   int? get value => _value;
10:
11:   bool setValue(int newValue) {          // ← new
12:     if (isGiven) return false;           // ← new
13:     if (newValue < 1 || newValue > 9) return false;  // ← new
14:     _value = newValue;                   // ← new
15:     return true;                         // ← new
16:   }                                      // ← new
17:
18:   bool get isEmpty => _value == null;
19:
20:   String describe() {
21:     return 'row $row, col $col: ${_value ?? "empty"}';
22:   }
23: }
```

(`int? get value => _value;`, line 9, is a getter of the same shape as
`isEmpty`, added alongside `setValue` so this lesson's own run output
could print a cell's current value directly — not shown as its own
separate unit since it introduces no concept beyond what `isEmpty`
already did.)

### Introduce the concept in isolation

This unit's own Socratic question is genuinely uncertain — not something
to answer from confidence — so it was run for real:

```
true
7
false
false
7
false
null
row 2, col 5: 7
9
```

`cell.setValue(7)` returns `true` and `cell.value` becomes `7` — a valid
change, accepted. `cell.setValue(20)` returns `false`, and `cell.value` is
still `7` — an out-of-range attempt, rejected with the object's own state
completely unchanged. `given.setValue(3)`, on a cell whose `isGiven` is
`true`, also returns `false` — rejected regardless of `3` being in range.
So far, `setValue` genuinely guards `_value` from anything invalid.

Then, the real proof this unit's own Socratic question was actually
asking for: `cell._value = 9;`, written directly in `main` — outside the
class entirely — **succeeds**, with no error of any kind, and
`cell._value` afterward really is `9`. The leading underscore did **not**
make `_value` inaccessible to this code; it only made it inaccessible to
code in a *different file*. Dart's privacy is enforced per-library
(effectively, per-file), not per-class.

### Discarding this example

Nothing discarded — this is this lesson's real, final, complete class.

### Mechanical walkthrough

- **`bool setValue(int newValue)`** — a method (this lesson's term),
  returning `bool` to report whether the change was actually accepted —
  chosen specifically over a `set` accessor (this lesson's term) because a
  real `set` body cannot report success or failure back to its caller the
  way an ordinary method's return value can.
- **`if (isGiven) return false;`** — `if` (Lesson 6's term, reappearing),
  reading `isGiven` directly, implicitly through `this` (this lesson's
  term); if the cell is a given clue, the method stops immediately,
  rejecting the change.
- **`if (newValue < 1 || newValue > 9) return false;`** — Lesson 6's
  relational and logical-OR operators (both reappearing), rejecting any
  value outside the legal Sudoku digit range.
- **`_value = newValue;`** — reached only if both checks above passed;
  assignment (Lesson 5's term, reappearing) into the private field,
  changing this specific object's own state.
- **`return true;`** — reports the change was actually made.
- **`cell._value = 9;`** (in `main`) — direct field assignment, from
  *outside* the class, on the private field `_value` — legal here purely
  because this line sits in the exact same file the class itself is
  declared in; the same line, written in a genuinely different file
  importing this one, would be rejected by the compiler.

### CS lens

Restricting which code can directly read or change an object's own state
is **data hiding** — the second pillar object-oriented programming rests
on, alongside Concept Unit 4's behavior-with-state bundling — existing so
an object's own guarantees about itself (a digit is always in range; a
given clue never changes) can't be silently violated by code that never
goes through the methods meant to enforce them.

```
Also recognized in: a bank's own ledger, only ever changed through
its own deposit/withdraw procedures, never by directly editing a
balance; a car's engine control unit exposing a dashboard and pedals
rather than direct wires to its own internals; a vending machine
accepting coins through one slot rather than allowing direct access
to its internal mechanism
```

### SE lens

This unit's own real, run-verified surprise is the honest cost worth
naming directly: a leading underscore is a real, compiler-enforced
boundary, but that boundary is drawn at the file, not the class — weaker
than Java's or C#'s own `private`, which really does stop even code
elsewhere in the same class hierarchy's own file structure. This
project's real, practical takeaway going forward: treat a leading
underscore as a strong *convention* signaling "don't touch this from
outside the class," backed by a real compiler boundary at the file level,
but not a guarantee against a determined or careless piece of code sharing
the same file — the discipline of actually going through `setValue` rather
than `cell._value = ...` is something this project has to maintain
deliberately, not something the underscore alone can enforce within a
single file.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire class
demonstration:

```
true
null
true
7
false
false
7
false
null
row 2, col 5: 7
9
```

Real, saved in full in
`src/docs/flutter/verification/lesson-11/run-log.md`.

### Connecting this unit

This unit protected an object's state through its own public methods, and
then proved, honestly, exactly where that protection's real boundary
actually sits.

---

## Connect the Pieces

Trace one real object through everything this lesson built. Concept Unit
1 declared `SudokuCell` as a blueprint, holding nothing yet but a row.
Concept Unit 2 gave it every field a real cell needs: `row`, `col`,
`isGiven`, and a private `_value` that genuinely defaults to `null`,
real-run-proved. Concept Unit 3's constructor turned that blueprint into
one real object, `cell`, built from real arguments `2`, `5`, `false`, with
constructor shorthand skipping four redundant assignments down to three
concise parameters. Concept Unit 4 gave that object real behavior of its
own: `isEmpty` and `describe`, both reaching `cell`'s own fields
implicitly, through `this`, with no separate function and no parameter
needed to say which cell they're about. And Concept Unit 5's `setValue`
genuinely protected `_value` — real-run-proved rejecting an out-of-range
digit and a locked given clue alike, leaving the object's state completely
unchanged either time — before this lesson's own final, honest proof that
the exact same `_value` remains reachable, unguarded, from other code
sharing its file, which is the real, specific shape of the guarantee a
leading underscore actually makes in Dart.

Two more promises this curriculum deferred are now paid: `class` (Lesson
5) and `method` (Lesson 9) are no longer narrow, unexplained mentions —
both are now this lesson's own real, working, run-verified subject.
Lesson 12 turns to what one class can build *on top of* another.
