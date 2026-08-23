# Lesson 5: Giving Data a Name and a Shape

**What you will build:** By the end of this lesson you will have written and
run (or, where a run would prove nothing new, confidently predicted) eight
tiny, standalone Dart snippets: a piece of named text, a named whole number,
a named fractional number, a named yes/no fact, a variable that honestly
represents "no value yet," a variable that can only ever be assigned once, a
value fixed before the program even starts running, and a variable whose
type is worked out for you instead of written by hand. None of these
snippets survive past this lesson — there is no real project yet for them to
join. The actual subject of this lesson is what's underneath all eight: how
a statically, soundly-null-safe language lets you attach a name to a value
and a fixed shape to that name, and how the compiler — not you, and not a
test run — catches an entire category of mistakes the moment you write them,
before the program ever executes a single instruction.

**What you need to know first:** Lesson 1's fixed `void main() { }` entry
point convention, its introduction of `print` and of a string literal as
`print`'s argument, and running a file with `dart run` from a terminal
(Lesson 2 covers the terminal itself in full; this lesson only reuses `dart
run`/`dart analyze` as commands, not terminal navigation). Lesson 4's real
anatomy of an error message — this lesson deliberately triggers five real
compiler errors and expects you to read each one using exactly that skill,
not to be walked through it again from scratch.

**Terms used in this lesson:**

- **Variable** — a named location that holds one value at a time, which the
  rest of a program can refer to by that name instead of writing the literal
  value out again everywhere it's needed. It exists because real programs
  work with values that get computed once and used many times, or that
  change over the life of a running program (a game's elapsed time, a
  chosen difficulty) — without a name to hang onto a value by, there would
  be no way to refer to "that specific value" anywhere except the exact
  line that first produced it.
- **Declaration** — the statement that introduces a variable for the first
  time: a type (explicit or inferred), a name, and usually an initial
  value. It exists to draw a hard line between "this name now exists, with
  this shape" and every later line that merely *reads or reassigns* an
  already-existing name — Dart refuses to let you use a name that was never
  declared, which is what makes a typo in a variable name a real compile
  error instead of silently creating a new, empty variable.
- **Assignment (`=`)** — the operator that stores a value into a variable,
  either giving it its very first value (combined with a declaration) or
  replacing whatever value it already held. It exists as the one dedicated
  way to change *which value* a name currently refers to, distinct from
  testing two values for equality (a separate operator, `==`, this
  curriculum has not used yet).
- **Type annotation** — writing a concrete type's name (`String`, `int`,
  `double`, `bool`) directly before a variable's name in its declaration,
  fixing exactly what kind of value that variable is allowed to hold,
  checked before the program ever runs. It exists so a mistake like
  accidentally storing text where a whole number belongs is caught by
  reading the source code, never by watching the running program misbehave.
- **String literal** — text data written directly into source code,
  delimited by quote characters, so the compiler can tell "this exact
  sequence of characters is data" apart from an instruction or a name. This
  is the same idea Lesson 1 introduced for `print`'s own argument; here the
  same kind of literal becomes the value stored on the right-hand side of a
  `String` variable's declaration instead of being handed straight to a
  function call.
- **Integer literal** — a whole number written directly into source code
  with no decimal point (`7`, `42`), understood by the compiler as a value
  of type `int` with no further annotation needed on the literal itself. It
  exists so whole-number values can appear directly in code without first
  being parsed out of text.
- **Decimal (floating-point) literal** — a number written directly into
  source code with a decimal point (`42.5`), understood by the compiler as
  a value of type `double`. It exists for the same reason integer literals
  do, for the separate category of numbers that need a fractional part.
- **Boolean literal (`true` / `false`)** — the two fixed, reserved words
  Dart provides to write a `bool` value directly into source code. They
  exist because a yes/no fact needs *some* concrete way to be written down
  in code, and Dart reserves exactly these two words for it rather than
  letting a program invent its own stand-ins (`1`/`0`, `"yes"`/`"no"`) — a
  choice this lesson's Concept Unit 4 shows is deliberate, not incidental.
- **`null`** — Dart's literal for "the deliberate, explicit absence of a
  value" — not zero, not an empty string, the genuine lack of any value at
  all. It exists because some facts really don't have a value yet (a Sudoku
  cell nobody has filled in), and conflating "no value" with a real value
  like `0` would make that state impossible to tell apart from an actual,
  meaningful zero.
- **Nullable type (`?`)** — a `?` written directly after a type name
  (`int?`), meaning "a value of this type, or `null`." It exists so a
  variable can honestly represent "this might not have a value yet" —
  without it, per the next term, Dart refuses to let a variable hold `null`
  at all.
- **Sound null safety** — Dart's rule, enforced by the compiler on every
  single variable in this lesson, that a type is assumed to never be `null`
  unless you explicitly opt in with `?`. It exists to close off, at compile
  time, an entire historical category of bugs — code that assumes a value
  is there, and finds out otherwise only once the program is already
  running — that older languages left to be discovered by crashing.
- **`final`** — a keyword placed before a variable's declaration meaning
  "this specific variable can be assigned a value exactly once, and never
  reassigned afterward." It exists to let code state, and have the compiler
  actually enforce, "this value is fixed for as long as this variable
  exists" — a promise a plain comment could claim but never guarantee.
- **`const`** — a keyword placed before a variable's declaration meaning
  "this variable's value must be fully known before the program even starts
  running, and can never change." It exists for values that are not merely
  fixed once assigned (what `final` already guarantees) but are baked into
  the compiled program itself, before any of it has executed at all.
- **Compile-time constant** — a value the compiler can compute and fix in
  place while translating the program, before any of it runs — as opposed
  to a value only known once some code actually executes, even code that
  runs just once (what `final` allows). It exists as the specific, stricter
  category of value `const` requires, distinct from `final`'s weaker
  "assigned once, at runtime" guarantee.
- **`var`** — a keyword used in place of an explicit type name in a
  declaration, telling the compiler "figure out this variable's type
  yourself, from the value on the right-hand side of `=`." It exists so a
  variable's type doesn't have to be written out by hand when it is already
  obvious from its initial value.
- **Type inference** — the compiler's own process of working out a
  variable's concrete type from context (here, from its initializer)
  instead of a person writing that type down explicitly. It exists so a
  statically-typed language can still read almost as concisely as one with
  no types written at all, without giving up any of the type-checking
  itself.
- **Static typing** — checking that every variable's type is correct while
  translating the program, before it ever runs — as opposed to **dynamic
  typing**, where the same check, if it happens at all, waits until the
  exact line holding the mismatched value actually executes. It exists as
  the specific choice Dart makes for every variable in this lesson, whether
  its type was written explicitly or inferred with `var`.
- **Statement terminator (`;`)** — the character marking the end of one
  complete instruction, first introduced by Lesson 1's own missing-
  semicolon error. It exists so Dart has an unambiguous signal for "this
  instruction is finished" — every declaration and assignment shown in this
  lesson ends with one for exactly that reason.
- **Compiler** — reappearing from Lesson 1, restated in full: a program
  that translates source code into another form, often checking it for
  correctness along the way. It exists because plain-text source code
  isn't something a CPU can execute directly; every error this lesson
  triggers is caught during that same translation process, before any of
  this lesson's code produces a single line of running behavior.
- **Static analyzer** — the specific part of Dart's toolchain, invoked
  directly in this lesson as `dart analyze`, that performs the type-
  checking and other correctness checks a full compile needs to succeed —
  without going the rest of the way to actually producing or running a
  program. It exists as a separable tool precisely so those checks can be
  run and read on their own, the way this lesson does five times, without
  needing a runnable `main` function or an actual execution at all.
- **Identifier** — the name a person chooses for a variable (`title`,
  `cellValue`, `puzzleName`) when declaring it. It exists to distinguish
  "an arbitrary, human-chosen label with no meaning to Dart beyond being a
  name" from a reserved word like `final` or `var`, which Dart itself gives
  a fixed meaning to and which cannot be reused as a variable's own name.
- **Class** — a blueprint describing a shape of value and what can be done
  with it — this lesson uses the word only to state where `String`, `int`,
  `double`, and `bool` structurally come from in Dart's own standard
  library (each is a real class, not a raw built-in primitive with no
  identity of its own); what a class actually lets *you* build gets its
  full, formal treatment starting in Lesson 11.
- **`abstract`** — a keyword appearing in `String`, `int`, and `double`'s
  own real declared signatures (quoted in this lesson's Objects and
  methods, below), marking a class that can never be constructed directly
  on its own — only through some other, more specific mechanism (for these
  four, through the literal syntax this lesson already uses). Narrowly
  flagged here only to explain why you never write `String(...)` yourself;
  what an abstract class actually is and why a language needs the concept
  gets full, formal treatment starting in Lesson 12 (Object-oriented
  design).
- **`final` (as a class modifier)** — a different, second use of the exact
  same word this lesson's Concept Unit 6 teaches as a *variable* keyword:
  here, appearing directly before `class` in `String`, `int`, `double`,
  and `bool`'s own real declarations, it instead forbids any other class
  from extending or implementing that class at all — a fact about the
  *class itself*, not about any one variable of that type. Flagged
  narrowly to avoid the two uses being confused; what it means for a class
  specifically to be extended or implemented is covered in full starting
  in Lesson 12.
- **`sealed`** — a keyword appearing in `num`'s own real declaration
  (quoted under "Everything else," below), marking that only a fixed,
  closed set of classes already known to Dart itself (here: exactly `int`
  and `double`) may ever extend it — no third numeric type can be added
  later, even by this curriculum's own code. Narrowly flagged to explain
  why `num`'s own doc comment calls a third numeric type a compile-time
  error; the general concept of a sealed type hierarchy gets full,
  formal treatment starting in Lesson 12.
- **`extends`** — a keyword appearing in `int` and `double`'s own real
  declarations, stating that each one builds directly on `num`, inheriting
  whatever `num` itself defines. Narrowly flagged here only to explain what
  "`int extends num`" means structurally; inheritance itself — what it
  actually gives you and costs you — gets full, formal treatment starting
  in Lesson 12 (Object-oriented design).
- **`implements`** — a keyword appearing in `String` and `num`'s own real
  declarations, and paired with `extends` throughout this lesson's own
  repeated "forbids extending or implementing" phrasing above: it means a
  class agrees to provide everything a named contract promises, without
  necessarily building on that contract's own machinery the way `extends`
  builds on a real base class. Narrowly flagged here for the same reason as
  `extends`; the real, meaningful difference between the two is Lesson
  12's territory, not this lesson's.

**Objects and methods used:**

- **`print`**
  - *What it is:* A function — a named, callable piece of code that does
    one job and can be invoked from other code — that Dart provides for the
    single purpose of showing text to whoever is running the program.
  - *Implementation:* `void print(Object? object)`, declared in
    `dart:core`, the one Dart library every file gets automatically with no
    `import` needed. It converts `object` to text by calling that object's
    own `toString()` method, then writes the resulting text plus exactly
    one newline character to the process's standard output.
  - *Its use:* the only thing in any of this lesson's eight snippets that
    produces output a human can actually see — without it, a variable
    holding a value would prove nothing to a reader.
  - *Type:* a top-level function (not attached to any class or object) in
    the `dart:core` library.
  - *Responsibility:* convert whichever single value it is given into text,
    using that value's own `toString()`, and write that text plus a
    trailing newline to standard output — nothing more; it does not decide
    *whether* to show output, validate its input, or format anything beyond
    calling `toString()`.
  - *Depends on:* the one argument passed to it — in this lesson, always a
    variable holding a `String`, `int`, `double`, `bool`, or `null` — and,
    indirectly, on the process having a standard output destination
    connected somewhere visible (the terminal running `dart run`).
  - *Connects to:* called directly, by name, from wherever this lesson's
    snippets are run; internally it hands its finished text to the Dart
    runtime's I/O layer, which writes it to the operating system's standard
    output stream for that process — the same stream Lesson 1 first showed.
  - *Shape:* part of Dart's public standard-library surface — the single
    most basic building block for "show the user something," unchanged from
    Lesson 1's own use of it.
- **`String`**
  - *What it is:* A real class in `dart:core` representing text — a
    sequence of characters with its own identity — not a language-level
    primitive with no structure of its own.
  - *Implementation:* `abstract final class String implements
    Comparable<String>, Pattern`, verified this session directly from the
    Dart SDK's real, current public source. Its own doc comment describes
    it as "a sequence of UTF-16 code units." `abstract` because a `String`
    is never constructed directly — literals and string operations produce
    concrete implementations behind this abstract interface; `final`
    because Dart forbids any other class from extending or implementing
    `String` at all.
  - *Its use:* Concept Unit 1 stores this curriculum's first real piece of
    *named* text data in one, rather than passing a literal straight to
    `print` the way Lesson 1 did.
  - *Type:* an abstract class.
  - *Responsibility:* represent and provide operations over an immutable
    sequence of UTF-16 text code units — comparing, measuring length,
    extracting pieces — none of which this lesson calls yet beyond storing
    and printing one whole value.
  - *Depends on:* a literal or expression that produces text to be
    constructed from — in this lesson, always a string literal.
  - *Connects to:* constructed here from a literal; handed to a variable by
    `=`; later read by `print`, which calls its `toString()` (already
    itself, since a `String` already is text) to produce the text `print`
    writes out.
  - *Shape:* `dart:core`'s public standard-library surface — the exact
    same class Lesson 1's `print('Hello, World!')` argument already was,
    without that lesson ever naming it.
- **`int`**
  - *What it is:* A real class in `dart:core` representing a whole number.
  - *Implementation:* `abstract final class int extends num`, verified this
    session from the real Dart SDK source. Its own doc comment: "the
    default implementation of `int` is 64-bit two's complement integers
    with operations that wrap to that range on overflow." `extends num`
    means every `int` is also, structurally, a `num` — Dart's shared
    numeric supertype, covered under "Everything else," below.
  - *Its use:* Concept Unit 2 stores a whole-number game value (a placed
    Sudoku digit) in one; Concept Unit 3 deliberately tries to store a
    fractional value in an `int`-typed variable to prove it's rejected.
  - *Type:* an abstract class extending `num`.
  - *Responsibility:* represent one whole-number value and provide the
    arithmetic and comparison operations every whole number needs.
  - *Depends on:* an integer literal, or an expression producing a whole-
    number result.
  - *Connects to:* constructed from a literal here; Concept Unit 5's `int?`
    builds directly on this exact class by adding a nullable annotation.
  - *Shape:* `dart:core` standard-library surface, one level below `num` in
    Dart's own built-in numeric hierarchy.
- **`double`**
  - *What it is:* A real class in `dart:core` representing a number with a
    fractional part.
  - *Implementation:* `abstract final class double extends num`, verified
    this session. Its own doc comment: "a double-precision floating point
    number... Dart doubles are 64-bit floating-point numbers as specified
    in the IEEE 754 standard," and explicitly: "it is a compile-time error
    for a class to attempt to extend or implement double."
  - *Its use:* Concept Unit 3 stores a fractional game value (elapsed
    seconds) in one, and is the type an `int`-typed variable rejects when
    that same unit's error demo tries to assign a `double` to it.
  - *Type:* an abstract class extending `num`.
  - *Responsibility:* represent one fractional-or-whole numeric value using
    IEEE 754 double-precision floating-point representation, and provide
    arithmetic and comparison over that representation.
  - *Depends on:* a decimal literal, or an expression producing a
    fractional numeric result.
  - *Connects to:* constructed from a literal here; rejected by `int`'s own
    type annotation in Concept Unit 3's error demo, proving the two are
    genuinely distinct types despite both being "numbers."
  - *Shape:* `dart:core` standard-library surface, sibling to `int` under
    `num`.
- **`bool`**
  - *What it is:* A real class in `dart:core` representing a yes/no
    (true/false) fact.
  - *Implementation:* `final class bool`, verified this session — notably
    *not* `extends num`; it stands entirely on its own. Its own doc
    comment: "the reserved words `true` and `false` denote objects that are
    the only two instances of this class... it is a compile-time error for
    a class to attempt to extend or implement bool."
  - *Its use:* Concept Unit 4 stores whether a Sudoku cell is one of the
    puzzle's original given clues (unmodifiable) in one.
  - *Type:* a final, standalone class, not part of the `num` hierarchy.
  - *Responsibility:* represent exactly one of two fixed values, `true` or
    `false`, and support the logical operations later lessons build on that
    closed two-value domain.
  - *Depends on:* one of Dart's two reserved boolean literal keywords.
  - *Connects to:* constructed here from a literal; Lessons 6 and 7's `if`
    and loop conditions are built entirely on values of this exact type.
  - *Shape:* `dart:core` standard-library surface, a deliberately separate
    hierarchy of its own, unrelated to the numeric classes above.
- **`dart` (specifically, its `analyze` subcommand)**
  - *What it is:* The same real command-line program Lesson 1 introduced —
    the Dart SDK's own entry point — here invoked with a different
    subcommand than Lesson 1's `run`.
  - *Implementation:* the same real binary Lesson 1 confirmed at
    `C:\flutter\bin\cache\dart-sdk\bin\dart.exe`. Its `analyze` subcommand —
    used in this lesson as `dart analyze type_errors.dart` — statically
    checks a file for compile-time errors, warnings, and lints without
    executing any of it, printing one line per issue found, each tagged
    `error`, `warning`, or `info`, followed by a final count.
  - *Its use:* this lesson's way of getting real, checkable proof that each
    of its five deliberately broken snippets is genuinely rejected, and
    exactly why — without any of them needing a `main` function or ever
    actually running.
  - *Type:* a standalone executable program — the same binary as Lesson
    1's `dart run`, a different subcommand.
  - *Responsibility:* everything Dart's static analyzer covers — type-
    checking, unused-variable detection, style lints — of which this
    lesson's invocation surfaces exactly the errors and warnings its own
    five mistakes produce.
  - *Depends on:* a path to a `.dart` file (or directory) to check, given
    as a command-line argument.
  - *Connects to:* invoked directly from the terminal; internally runs the
    same static type-checking machinery `dart run` also relies on before
    executing anything, but here stops after reporting, never proceeding to
    execution.
  - *Shape:* sits one step earlier than `dart run` in this lesson's own
    tool pipeline: `analyze` checks without running; `run` (Lesson 1)
    checks *and then* runs, refusing to proceed if analysis finds a hard
    error.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`num`**
  - *What it is:* `dart:core`'s shared supertype for both numeric classes
    this lesson uses.
  - *Implementation:* `sealed class num implements Comparable<num>`,
    verified this session. Its own doc comment: "it is a compile-time error
    for any type other than int or double to attempt to extend or
    implement num" — `sealed` meaning Dart itself guarantees no third
    numeric type can ever exist alongside these two.
  - *Its use:* named only because `int`'s and `double`'s own real declared
    shapes both mention it directly (`extends num`); this lesson never
    declares a variable of type `num` itself.
  - *Type:* a sealed class.
  - *Responsibility:* define the operations (arithmetic, comparison) common
    to every whole-or-fractional number, so `int` and `double` don't each
    define them separately.
  - *Depends on:* nothing on its own — it exists to be extended, not
    instantiated directly; nothing can be "just a `num`" with no more
    specific type.
  - *Connects to:* `int` and `double` both extend it directly; this
    lesson's code never calls anything on `num` itself.
  - *Shape:* the root of Dart's built-in numeric type hierarchy, sitting
    above both classes this lesson actually declares variables of.

---

## Concept Unit: Naming a Piece of Text

### The Problem

Lesson 1's entire program was one line: `print('Hello, World!');` — a
literal string handed straight to a function, used exactly once. Real
programs need to hold onto a piece of text and refer to it more than once,
or pass it somewhere else, without retyping the exact same characters every
time. If this curriculum's eventual Sudoku game has a title, and that title
needs to appear in more than one place, what changes?

> **Stop and think before reading on:** If you wanted to use the exact same
> piece of text twice in a program — say, printing it, then later checking
> whether the user typed it back correctly — what problem would you run
> into if all you could do was write the literal text out again, by hand,
> the second time? What would you want instead?

### Project Change

- **Reference Source:** No reference counterpart — this curriculum's
  persistent `project/` folder does not exist yet (per HANDOFF, it is
  created the first time code needs to survive across lessons, which
  begins around this Phase's console Sudoku milestone, not here).
- **Files affected:** None. This snippet is shown and its output predicted,
  never saved to disk or executed — see the Verification Rule exemption
  explained in this unit's own "Run it" step, below.
- **Change type:** N/A — a disposable, standalone snippet.
- **Location:** N/A.
- **Dependencies:** A working `dart` installation (Lesson 1).

### The New Code

```dart
String title = 'Open Calc Curriculum';
print(title);
```

### The Updated Project

Not applicable — this is a brand-new, freestanding pair of statements with
no enclosing structure to place them inside of.

### Introduce the concept in isolation

This is exactly the isolated case it appears to be — there is no larger
project yet for it to relate back to. Per the Verification Rule's Necessity
clause, this snippet is not actually run: its output is a direct, literal
echo of the exact text already sitting on the page, with zero computation
and zero uncertainty about formatting. Predicted output, stated from
confidence rather than a real run:

```
Open Calc Curriculum
```

This act — attaching a name (`title`) to a value so it can be referred to
by that name instead of retyped — is called a **variable declaration**, and
the specific value it holds here is a **`String`**: a real class, not a raw
keyword, representing text.

### Discarding this example

`title` and its literal value are not part of any real project — this
exact snippet will not be referred to again by name. What carries forward
is what it proved: a variable lets a value be named once and referred to by
that name anywhere afterward, and `String` is the concrete type that names a
piece of text.

### Mechanical walkthrough

- **`String`** — a type annotation: writing this real class's name directly
  before the variable name fixes, once and for all, that `title` may only
  ever hold text, checked by the compiler before this program runs at all.
  Its real declared shape, shown in this lesson's header, is `abstract
  final class String implements Comparable<String>, Pattern` — an abstract
  class, meaning you never construct a bare `String` yourself; the literal
  on the right-hand side below produces one for you.
- **`title`** — an identifier: a name chosen by the person writing this
  code, with no meaning to Dart beyond "the name this specific variable is
  now known by." Nothing about the word `title` is special syntax; any
  other valid name would work identically.
- **`=`** — the assignment operator, combined here with a declaration: it
  takes the value on its right and stores it into the variable being
  declared on its left. This is the exact moment `title` starts existing as
  a usable name.
- **`'Open Calc Curriculum'`** — a string literal: text written directly
  into the source code, delimited by single quotes, so the compiler can
  tell "this exact sequence of characters is data" apart from an
  instruction. This is the same kind of literal Lesson 1 passed directly to
  `print`; here it is instead the value stored into `title`.
- **`;`** — the statement terminator, marking the end of this one complete
  declaration, exactly as it did for Lesson 1's own `print` line.
- **`print(title)`** — a function call: invoking the top-level `print`
  function (`void print(Object? object)`, from `dart:core`, fully described
  in this lesson's header) and passing it one argument.
- **`title`, as `print`'s argument** — this is a variable *read*, not a
  declaration: Dart looks up the value currently stored under the name
  `title` (the `String` just declared above) and hands that value to
  `print`, which calls its `toString()` (itself, since it's already text)
  and writes the result to standard output.

### CS lens

Attaching a human-readable name to a specific location holding a value —
rather than referring to that value only by where it happens to sit in
memory, or retyping it every time — is called **binding a name to a
value**, one of the most foundational ideas in all of programming: nearly
every later concept in this curriculum (functions, classes, even Sudoku's
own board representation) is, underneath, more names bound to more values.

```
Also recognized in: a spreadsheet cell reference (`B4` naming
whatever value currently sits there), algebra's own use of a letter
to stand for a number, a database column name, a DNS hostname naming
an IP address that could itself change later
```

### SE lens

The alternative — never naming a value, and instead retyping or re-deriving
it everywhere it's needed — is exactly what Lesson 1's own one-line program
did, and it works fine for a single, never-repeated literal. It breaks down
immediately once the same value needs to appear in two places: if this
curriculum's eventual Sudoku title ever needs to change, every place it was
retyped by hand has to be found and edited individually, and missing even
one produces an inconsistency that's easy to overlook. A named variable
pays a tiny one-time cost (writing the declaration) in exchange for a real,
ongoing benefit: change the value in exactly one place, and every use of
the name picks up the new value automatically.

### Commands needed

None — per this unit's own Verification Rule exemption, above, this
snippet's output is stated from confidence rather than run, so no terminal
command is required.

### Run it

Not run, by design — see "Introduce the concept in isolation," above, for
the full reasoning: a literal string handed to `print` produces exactly
that string, with no computation and no ambiguity about formatting, so
running it would prove nothing this lesson doesn't already state with full
confidence.

### Connecting this unit

Lesson 1 handed a literal string directly to `print`, once, and never
referred to it again. This unit named that same kind of value instead —
proving a variable can be read by name anywhere after its declaration. The
next unit asks the same question for a genuinely different *kind* of
value: a whole number.

---

## Concept Unit: Naming a Whole Number

### The Problem

A Sudoku board is going to need whole numbers everywhere — a row index, a
column index, the digit placed in a cell. `String` (previous unit) can
technically hold the text `'7'`, but a Sudoku engine will eventually need
to add two cell values together, compare one to another, and reject a
value greater than 9 — none of which text supports directly. What changes
about the previous unit's declaration to hold an actual whole number
instead of text?

> **Stop and think before reading on:** Given the previous unit's
> `String title = 'Open Calc Curriculum';`, what would you guess needs to
> change to store the whole number `7` instead of a piece of text? Is `'7'`
> (in quotes) the same thing as `7` (no quotes) to Dart, or do you expect
> them to be treated completely differently?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** None. Shown and predicted only, not run — same
  Necessity-clause exemption as the previous unit.
- **Change type:** N/A — a disposable, standalone snippet.
- **Location:** N/A.
- **Dependencies:** None beyond the working `dart` install already
  confirmed in Lesson 1.

### The New Code

```dart
int cellValue = 7;
print(cellValue);
```

### The Updated Project

Not applicable — a brand-new, freestanding pair of statements, same as the
previous unit.

### Introduce the concept in isolation

Per the Verification Rule's Necessity clause, this is not run — a literal
whole number handed to `print` produces exactly that number as text, with
no computation and no formatting ambiguity. Predicted output:

```
7
```

The type used here, **`int`**, is Dart's real class for a whole number —
distinct from `String`'s text, and, as the next unit will show, distinct
from a fractional number too.

### Discarding this example

`cellValue`, here, is not a real Sudoku cell — it is a disposable stand-in
that will not be referred to again by this exact name or value. What
carries forward: `int` is the type for whole numbers, and a numeric literal
with no decimal point (`7`, not `'7'` or `7.0`) is understood by Dart as an
`int` value directly.

### Mechanical walkthrough

- **`int`** — a type annotation, exactly as `String` was in the previous
  unit, but naming a different real class: `abstract final class int
  extends num` (verified this session from the real Dart SDK source),
  whose own doc comment states its default implementation is "64-bit two's
  complement integers with operations that wrap to that range on
  overflow." Writing `int` here fixes `cellValue` to only ever hold a whole
  number, checked before this program runs.
- **`cellValue`** — an identifier, the same kind of thing `title` was in
  the previous unit: a name chosen by the author, meaningful only because
  it was just declared.
- **`=`** — the same assignment operator as the previous unit, here storing
  a different kind of value (a whole number instead of text) into the
  variable being declared.
- **`7`** — an integer literal: a whole number written directly into source
  code with no decimal point, understood by Dart as a value of type `int`
  with no further annotation needed on the literal itself. This is
  genuinely different from the previous unit's `'Open Calc Curriculum'`: no
  quote characters surround it, because it is not text at all.
- **`;`** — the statement terminator, same role as every previous use.
- **`print(cellValue)`** — the same `print` function call as the previous
  unit, here reading a different variable. `print`'s own signature (`void
  print(Object? object)`) accepts any single value at all — an `int` here,
  a `String` in the previous unit — because its parameter type, `Object?`,
  is Dart's most general type, one every other type (including `int` and
  `String`) is compatible with.
- **`cellValue`, as `print`'s argument** — a variable read, exactly the
  same mechanism as the previous unit's `title` read: Dart looks up the
  value currently bound to the name `cellValue` and hands it to `print`.

### CS lens

Representing a whole number as a fixed-width binary value — here, 64 bits,
per `int`'s own real doc comment quoted above — rather than as an
arbitrarily long sequence of digits, is a deliberate, foundational
computing tradeoff: a fixed number of bits can be added, compared, and
stored by a CPU in a single, fast hardware operation, at the cost of a hard
upper and lower limit on the values it can represent (what that same doc
comment calls "wrap[ping]" on overflow).

```
Also recognized in: a database's `INTEGER` column type, a CPU
register's fixed bit width, a hash function's fixed-size output, a
checksum, an odometer wrapping from 999999 back to 000000
```

### SE lens

Choosing `int` over `String` for a value that is genuinely numeric — even
though `'7'` could technically be stored as text — is a real design
decision with a real cost avoided: a `String` holding `'7'` cannot be added
to another number, compared numerically, or validated as "a digit between 1
and 9" without first being parsed back into a number, and that parsing step
can itself fail (what if the text were `'seven'`?). Choosing the type that
actually matches the *kind* of value being represented pushes that entire
class of "is this text actually a valid number?" bug out of the program
before it's even written, rather than discovering it the first time a
Sudoku cell's value is compared against another.

### Commands needed

None — same Necessity-clause exemption as the previous unit; nothing here
is run.

### Run it

Not run, by design — a literal integer handed to `print` produces exactly
that integer as text, with no computation and no ambiguity, so a real run
would prove nothing beyond what is already stated with full confidence.

### Connecting this unit

The previous unit named a piece of text; this unit named a whole number
using a genuinely different real class, `int`, proving Dart tells the two
apart by their literal's own written form (quotes or none) rather than by
guessing. The next unit introduces a third, related-but-distinct numeric
type — one for values that aren't whole.

---

## Concept Unit: Naming a Fractional Number

### The Problem

A Sudoku game's timer needs to track elapsed time — and elapsed time is
rarely a clean whole number of seconds. `int` (previous unit) has no way to
represent "42 and a half seconds." What type holds a number with a
fractional part, and — since `int` and this new type are both "numbers" in
casual speech — are they actually interchangeable, or does Dart treat them
as genuinely different types the same way it told `String` and `int` apart?

> **Stop and think before reading on:** Given that `int cellValue = 7;`
> worked in the previous unit, what do you predict happens if you write
> `int wrong = 42.5;` — a decimal value assigned to a variable explicitly
> typed as `int`? Does Dart round it, truncate it, or refuse to compile the
> program at all?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-05/type_errors.dart`
  — created. This is the first Concept Unit in this lesson whose real
  behavior can't be confidently predicted (a real analyzer error's exact
  wording), so, per the Verification Rule, it is the first to actually need
  a run — and the first function in a single shared file this lesson's
  later units (5, 6, 7, 8) will each add one more function to, batched into
  one real analysis pass rather than five separate throwaway runs.
- **Change type:** Add (new file, one function).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation (Lesson 1).

### The New Code

The working case first — a genuinely fractional value, correctly typed:

```dart
double elapsedSeconds = 42.5;
print(elapsedSeconds);
```

The deliberately broken case, saved into the shared verification file:

```dart
void doubleIntMismatchError() {
  int wrong = 42.5;
}
```

### The Updated Project

Not applicable for the working case — a brand-new, freestanding pair of
statements. For the broken case: this is also a brand-new file, so there is
no larger existing structure to show it placed inside of yet (units 5, 6,
7, and 8 will each show the file's real, growing contents as they add to
it).

### Introduce the concept in isolation

The working snippet is not run — its output is a direct, literal echo of
the decimal literal already on the page:

```
42.5
```

The broken snippet genuinely cannot be predicted with confidence (the
analyzer's exact wording is not something this lesson's author already
knows cold), so it was actually analyzed for real, via `dart analyze`
(fully explained in "Commands needed," below). Real output:

```
error - type_errors.dart:7:15 - A value of type 'double' can't be assigned to a variable of type 'int'. Try changing the type of the variable, or casting the right-hand type to 'int'. - invalid_assignment
```

This proves, concretely, that `int` and `double` are genuinely distinct
types to Dart — not two casual names for "a number" — and that assigning
one where the other is expected is caught before the program ever runs.
This checking, done entirely by reading the source code rather than
executing it, is called **static type checking**.

### Discarding this example

`wrong` and `elapsedSeconds` are both disposable stand-ins, not real
project values. What carries forward: `double` is the type for fractional
numbers, a literal with a decimal point (`42.5`) is understood as a
`double`, and Dart's static type checker rejects storing a `double` where
an `int` was explicitly declared — full stop, with no silent rounding or
truncation.

### Mechanical walkthrough

- **`double`** — a type annotation naming the real class `abstract final
  class double extends num` (verified this session), whose own doc comment
  states it represents "64-bit floating-point numbers as specified in the
  IEEE 754 standard" and explicitly forbids any class from extending or
  implementing it. Writing `double` here fixes `elapsedSeconds` to only
  ever hold a fractional-or-whole numeric value stored in that specific
  representation.
- **`elapsedSeconds`** — an identifier, the same kind of name as every
  previous unit's variable.
- **`=`** — the same assignment operator as every previous unit.
- **`42.5`** — a decimal (floating-point) literal: a number written with a
  decimal point, understood by Dart as a `double` value directly, the same
  way `7` (previous unit, no decimal point) was understood as an `int`.
- **`;`** — the statement terminator, same role as every previous use.
- **`print(elapsedSeconds)`** — the same `print` function call described in
  full in this lesson's header, here reading a `double`-typed variable;
  `print`'s `Object? object` parameter accepts it for the same reason it
  accepted `String` and `int` before it.
- **`int wrong = 42.5;`** — the broken line: `int` (the same real class as
  the previous unit) as a type annotation, `wrong` as an identifier, `=` as
  assignment, and `42.5` as a decimal literal — every one of these
  individually valid, but combined here to store a `double`-typed value
  into a variable explicitly declared `int`, which the type annotation
  forbids.
- **`void doubleIntMismatchError() { ... }`** — a function definition
  wrapping the broken line so it can be analyzed without needing to be
  called or without needing a `main` entry point in this file at all;
  `void` here plays the same narrow role Lesson 1 gave it for `main` — "this
  function does not hand any value back" — and the general idea of a
  function, its parameters, and its return value gets its full, formal
  treatment in Lesson 8, not here.

### CS lens

`int` and `double` sharing the word "number" in everyday speech, while
being enforced as genuinely incompatible types by the compiler, is an
example of **type safety**: the guarantee that operations are only ever
performed on data of a kind they're actually defined for, checked
mechanically rather than trusted to a programmer's memory. The specific
representation `double` uses — IEEE 754 double-precision floating point,
named directly in its own real doc comment — is itself a hard, recurring
concept.

```
Also recognized in: virtually every mainstream programming language's
own `float`/`double` type, a scientific calculator's internal number
representation, spreadsheet software rounding 0.1 + 0.2 to something
that isn't exactly 0.3, GPS coordinate storage
```

### SE lens

The alternative — a language that silently converts between numeric kinds
(truncating `42.5` down to `42`, for instance, the way some languages do)
trades away a real safety property for a small amount of convenience: a
mistake like accidentally storing a timer's fractional seconds into a
whole-number variable would silently lose data instead of being caught
immediately. Dart's choice to reject the assignment outright, at compile
time, means this exact class of silent data loss cannot happen without an
explicit, visible conversion — a cost (you must be deliberate about
converting between numeric kinds) paid in exchange for a real guarantee (no
number ever silently loses its fractional part by accident).

### Commands needed

- **`dart analyze <file>`** — the same real `dart` program Lesson 1 used
  for `dart run`, here invoked with its `analyze` subcommand instead:
  statically checks the named file for compile-time errors, warnings, and
  lints without running any of it. Success looks like `No issues found!`
  and exit code `0`; a real problem, as here, prints one line per issue —
  `error`, `warning`, or `info` — ending in a count, with a non-zero exit
  code.

### Run it

Real, verified output — genuinely uncertain ahead of time, so actually run,
not predicted:

```
Analyzing type_errors.dart...

  error - type_errors.dart:7:15 - A value of type 'double' can't be assigned to a variable of type 'int'. Try changing the type of the variable, or casting the right-hand type to 'int'. - invalid_assignment
warning - type_errors.dart:7:7 - The value of the local variable 'wrong' isn't used. Try removing the variable or using it. - unused_local_variable
```

(This is a slice of one larger, real batched run covering all five of this
lesson's error units at once — the complete output, all five errors
together, is shown in Concept Unit 8's own "Run it" step, and saved in full
in `src/docs/flutter/verification/lesson-05/run-log.md`.) The
`unused_local_variable` warning alongside the real error is expected: `
wrong` exists only to be analyzed, never read, which is exactly what keeps
this unit's one error visible without needing anything to actually execute.

### Connecting this unit

The previous two units named a piece of text and a whole number; this unit
introduced a third, genuinely distinct numeric type and proved — with a
real compiler error, not just a claim — that Dart enforces the difference
between "whole" and "fractional" the same way it enforces the difference
between text and numbers. The next unit turns to a fourth, structurally
unrelated kind of value: a plain yes/no fact.

---

## Concept Unit: Naming a Yes/No Fact

### The Problem

Some facts about a Sudoku cell are neither text, nor a whole number, nor a
fraction — they're strictly one of exactly two possibilities. Was this
specific cell part of the original puzzle (and therefore locked, unable to
be changed by the player), or was it left blank for the player to fill in?
Nothing shown so far — `String`, `int`, `double` — is naturally suited to a
value that only ever has two possible states.

> **Stop and think before reading on:** You could, in principle, represent
> "yes or no" using an `int` (`1` for yes, `0` for no) or a `String`
> (`'yes'`/`'no'`). What could go wrong with either of those choices that a
> type built specifically for exactly two values wouldn't allow? If your
> `int`-based flag accidentally got assigned `2` somewhere else in the
> code, would anything catch that before the program ran?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** None. Shown and predicted only — same Necessity-
  clause exemption as Concept Units 1 and 2.
- **Change type:** N/A — a disposable, standalone snippet.
- **Location:** N/A.
- **Dependencies:** None beyond the confirmed `dart` install.

### The New Code

```dart
bool isGivenClue = true;
print(isGivenClue);
```

### The Updated Project

Not applicable — a brand-new, freestanding pair of statements.

### Introduce the concept in isolation

Not run, per the Necessity clause — a literal boolean handed to `print`
produces exactly that value's text form, with zero ambiguity:

```
true
```

**`bool`** is Dart's real class for a value that is always exactly one of
two fixed possibilities — `true` or `false` — and, unlike `int` and
`double`, it is not part of the numeric class hierarchy at all.

### Discarding this example

`isGivenClue` here is a disposable stand-in for a Sudoku concept this
curriculum hasn't built yet; it will not be referred to again by this exact
name. What carries forward: `bool` is the type for a strictly two-valued
fact, and its literals are the reserved words `true` and `false` — not
numbers, not text.

### Mechanical walkthrough

- **`bool`** — a type annotation naming the real class `final class bool`
  (verified this session), whose own doc comment states "the reserved
  words `true` and `false` denote objects that are the only two instances
  of this class" and forbids any other class from extending or
  implementing it. Writing `bool` here fixes `isGivenClue` to only ever
  hold one of exactly those two values — nothing else is a legal `bool`.
- **`isGivenClue`** — an identifier, same role as every previous unit's
  variable name.
- **`=`** — the same assignment operator as every previous unit.
- **`true`** — a boolean literal: one of Dart's two reserved words for
  writing a `bool` value directly into source code. Unlike `7` or `42.5`,
  it is not a numeral at all — it's a fixed keyword the language recognizes
  as its own kind of literal.
- **`;`** — the statement terminator, same role as every previous use.
- **`print(isGivenClue)`** — the same `print` function described in full in
  this lesson's header, here reading a `bool`-typed variable; `print`
  converts it to text by calling its `toString()`, which for a `bool`
  simply produces the words `true` or `false`.

### CS lens

Restricting a value to exactly two possible states, enforced by the type
system itself rather than by convention, is **Boolean logic** — named for
George Boole, whose 19th-century algebra of true/false values underlies
every digital computer built since: at the hardware level, a CPU's own
circuits are themselves built from gates that only ever represent exactly
two electrical states.

```
Also recognized in: a light switch, a traffic light's own go/stop
decision at any single instant, a database `WHERE` clause's own
matched/not-matched result, a logic gate in a CPU, a checkbox in any
user interface
```

### SE lens

Using an `int` (`1`/`0`) or a `String` (`'yes'`/`'no'`) to represent a
two-valued fact, instead of `bool`, opens a door `bool` closes completely:
an `int` meant to be `0` or `1` could accidentally be assigned `2`, `-5`, or
any other whole number, and a `String` meant to be `'yes'` or `'no'` could
be misspelled (`'Yes'`, `'YES'`, `'y'`) without the compiler ever
noticing — both are a much larger space of possible values than the two
that are actually meaningful. `bool`'s real cost is that it can represent
only "known yes" or "known no" — it has no built-in third state for
"not yet known," which the next unit's `null` addresses directly.

### Commands needed

None — same Necessity-clause exemption as Concept Units 1 and 2; nothing
here is run.

### Run it

Not run, by design — a literal boolean handed to `print` produces exactly
its own fixed text form, with zero ambiguity, so a real run would prove
nothing beyond what is already stated with full confidence.

### Connecting this unit

The previous three units each introduced a type for a different kind of
*present* value — text, a whole number, a fraction. This unit added a
fourth or a strictly two-valued fact, and its own SE lens just surfaced a
real gap: none of the four types shown so far can represent "no value at
all yet." The next unit addresses that gap directly.

---

## Concept Unit: Naming the Absence of a Value

### The Problem

A brand-new Sudoku board, before the player or the puzzle generator has
touched a given cell, doesn't have a value of `0` in it — `0` is a real,
meaningful digit that could appear on a completed board. It has *no* value
at all yet. None of `String`, `int`, `double`, or `bool`, as declared so
far, can represent "nothing is here" — every variable shown in this lesson
so far was given a real value the instant it was declared. What happens if
you try to leave one empty, or explicitly assign it nothing?

> **Stop and think before reading on:** Given that `int cellValue = 7;`
> requires a real whole number on the right of `=`, what do you predict
> happens if you write `int cellValue = null;` instead — explicitly saying
> "this holds nothing"? Does Dart allow it, since `int` is just a type
> like any other? Or does it refuse — and if it refuses, what would have to
> change about the variable's own declared type to make "no value yet" a
> legal thing for it to hold?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-05/type_errors.dart`
  — modified, adding the `nullSafetyError` function.
- **Change type:** Add (one new function in the already-existing shared
  file Concept Unit 3 created).
- **Location:** Appended directly after `doubleIntMismatchError`.
- **Dependencies:** The file created in Concept Unit 3.

### The New Code

The working case — a variable honestly declared as "an `int`, or nothing":

```dart
int? cellValue;
print(cellValue);
```

The broken case, added to the shared verification file:

```dart
void nullSafetyError() {
  int cellValue = null;
}
```

### The Updated Project

The shared verification file, with this unit's function added (new lines
marked `← new`; everything above line 9 is exactly what Concept Unit 3 left
it as):

```dart
 1: // Five deliberate compile-time errors, one per Lesson 5 Concept Unit.
 2: // Never run — analyzed only, via `dart analyze`. Each function is
 3: // intentionally never called; the error is structural (a type/const/
 4: // assignment rule violation), not something that needs to execute.
 5:
 6: void doubleIntMismatchError() {
 7:   int wrong = 42.5;
 8: }
 9:
10: void nullSafetyError() {              // ← new
11:   int cellValue = null;               // ← new
12: }                                     // ← new
```

The file as a whole now statically checks two independent mistakes in one
pass: a numeric-type mismatch (Concept Unit 3) and a null-safety violation
(this unit) — neither function calls or depends on the other, so adding
this one changes nothing about `doubleIntMismatchError` above it.

### Introduce the concept in isolation

The working case is not run — Dart's own well-documented, fixed textual
form for `null` printed via `toString()` is literally the four characters
`null`, with no ambiguity:

```
null
```

The broken case's exact wording genuinely can't be predicted with
confidence, so it was actually analyzed, batched together with Concept
Unit 3's function in one real `dart analyze` pass (full combined output
shown in Concept Unit 8's "Run it" step). The real, relevant line:

```
error - type_errors.dart:11:19 - A value of type 'Null' can't be assigned to a variable of type 'int'. Try changing the type of the variable, or casting the right-hand type to 'int'. - invalid_assignment
```

This proves two things at once: `null` really is rejected by a plain `int`
declaration, and Dart's error message names `null`'s own type as `'Null'` —
`null` is not merely "nothing," it is itself a real, single value with its
own real type. This whole guarantee — every type assumed non-nullable
unless you explicitly opt in — is called **sound null safety**.

### Discarding this example

Neither `cellValue` here nor its broken twin represent a real Sudoku cell
yet; both are disposable. What carries forward: `int?` (with the `?`)
honestly represents "an `int`, or nothing," while plain `int` (without it)
can never legally hold `null` at all — proven above by a real, rejected
attempt, not merely asserted.

### Mechanical walkthrough

- **`int?`** — a nullable type: the real class `int`, exactly as declared
  in Concept Unit 2, with a `?` appended directly after it. The `?` is not
  part of `int`'s own class declaration — it's separate Dart syntax meaning
  "a value of this type, or `null`," applied here to widen what `cellValue`
  is allowed to legally hold.
- **`cellValue`** (working case) — an identifier, same role as every
  previous unit's variable, but here declared with no initializer at all.
- **(no `=` here)** — this declaration has no assignment at all; Dart gives
  a variable declared with a nullable type and no initializer the value
  `null` automatically, rather than leaving it in some undefined state.
- **`;`** — the statement terminator, same role as ever.
- **`print(cellValue)`** — the same `print` function from this lesson's
  header, here handed a value that is literally `null`; `print` calls
  `toString()` on it same as any other value, producing the text `null`.
- **`int cellValue = null;`** (broken case) — `int` (plain, no `?`) as a
  type annotation, `cellValue` as an identifier, `=` as assignment, and
  **`null`** — Dart's own reserved literal for "the deliberate, explicit
  absence of a value," itself of the real type `Null` (capital N, as the
  real error message above names it) — assigned to a variable whose
  declared type does not accept it.
- **`void nullSafetyError() { ... }`** — a function definition, the same
  kind of wrapper Concept Unit 3 used, again narrowly relying on Lesson 1's
  `void` convention and deferring functions' full treatment to Lesson 8.

### CS lens

Requiring every type to explicitly opt into holding `null`, rather than
letting any variable silently be `null` by default, is **sound null
safety** — a hard, load-bearing concept across modern language design.

```
Also recognized in: Kotlin's own `?`/`!!` nullable-type syntax, Swift's
Optional type, Rust's `Option<T>` enum, TypeScript's strict-null-
checks mode, Haskell's `Maybe` type
```

Tony Hoare, who introduced the null reference into a language design in
1965, later called it his own "billion-dollar mistake," citing the sheer
volume of real-world crashes and security vulnerabilities it went on to
cause across the following decades of software built on languages that let
any reference silently be null with no compile-time warning at all.

### SE lens

A language that lets every type be `null` by default (older Java, C,
JavaScript, and pre-2.12 Dart itself) shifts this exact error from compile
time to whatever moment, deep into a running program, some code finally
tries to use a value that turns out to have been `null` all along — a
runtime crash discovered by a user, not a warning caught by the author
while writing the line. Dart's opt-in model (`int` by default rejects
`null`; `int?` explicitly allows it) forces every "can this genuinely be
missing?" question to be answered at the moment a variable is declared,
which is real, ongoing ceremony (every nullable value needs its `?`, and,
in later lessons, explicit checks before it's used) traded for eliminating
an entire historical category of production crash before the program ever
ships.

### Commands needed

- **`dart analyze <file>`** — the same real command explained in full in
  Concept Unit 3, unchanged: statically checks a file for errors without
  running it; success is `No issues found!`, a real problem prints one
  tagged line per issue plus a final count.

### Run it

Real, verified output for this unit's own function (a slice of the one
larger batched run — full combined output in Concept Unit 8's "Run it"):

```
error - type_errors.dart:11:19 - A value of type 'Null' can't be assigned to a variable of type 'int'. Try changing the type of the variable, or casting the right-hand type to 'int'. - invalid_assignment
warning - type_errors.dart:11:7 - The value of the local variable 'cellValue' isn't used. Try removing the variable or using it. - unused_local_variable
```

### Connecting this unit

Concept Unit 4 ended by noting `bool` has no built-in third state for
"not yet known." This unit showed the actual, general-purpose answer:
`null`, combined with a nullable type's `?`, honestly represents "no value
here yet" for *any* type — `int?`, and, though not shown here, `String?` or
`bool?` exactly the same way. The next unit turns to the opposite kind of
guarantee: not "this might have no value," but "this value, once set, can
never be replaced."

---

## Concept Unit: A Variable That Can Only Be Set Once

### The Problem

Every variable shown so far in this lesson could, in principle, be
reassigned a second time later in the same program — nothing has stopped
that yet. Some values genuinely should not be allowed to change once set:
a Sudoku game session's chosen difficulty, decided once when the game
starts, should not be silently reassignable somewhere else in the code by a
typo or a copy-paste mistake. How would you tell Dart "this variable may be
assigned exactly once, and never again" — and have that actually enforced,
not just written as a comment?

> **Stop and think before reading on:** A code comment like `// don't
> change this!` next to a variable relies entirely on every future reader
> noticing and respecting it. What would be different about a rule the
> *compiler* enforced instead of a comment a human has to remember to
> honor? What do you predict happens if you try to assign a second value to
> a variable that's supposed to be unchangeable?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-05/type_errors.dart`
  — modified, adding the `finalReassignmentError` function.
- **Change type:** Add (one new function).
- **Location:** Appended directly after `nullSafetyError`.
- **Dependencies:** The file created in Concept Unit 3, extended in
  Concept Unit 5.

### The New Code

The working case:

```dart
final String difficulty = 'Medium';
print(difficulty);
```

The broken case, added to the shared verification file:

```dart
void finalReassignmentError() {
  final String difficulty = 'Medium';
  difficulty = 'Hard';
}
```

### The Updated Project

```dart
 1: // Five deliberate compile-time errors, one per Lesson 5 Concept Unit.
 2: // Never run — analyzed only, via `dart analyze`. Each function is
 3: // intentionally never called; the error is structural (a type/const/
 4: // assignment rule violation), not something that needs to execute.
 5:
 6: void doubleIntMismatchError() {
 7:   int wrong = 42.5;
 8: }
 9:
10: void nullSafetyError() {
11:   int cellValue = null;
12: }
13:
14: void finalReassignmentError() {       // ← new
15:   final String difficulty = 'Medium'; // ← new
16:   difficulty = 'Hard';                // ← new
17: }                                     // ← new
```

Three independent mistakes now live in this one file, each in its own
never-called function, checked together in one pass.

### Introduce the concept in isolation

The working case is not run — a `final`-declared variable, read once right
after being given its one and only value, behaves exactly like any other
variable of its type when printed; its output is the same literal echo as
Concept Unit 1's `String` demo:

```
Medium
```

The broken case's exact analyzer wording is genuinely uncertain ahead of
time, so it was actually run (batched with the prior units' functions):

```
error - type_errors.dart:16:3 - The final variable 'difficulty' can only be set once. Try making 'difficulty' non-final. - assignment_to_final_local
```

This proves `final` is a real, compiler-enforced rule, not a convention —
attempting a second assignment to a `final` variable is rejected before the
program ever runs, named here as **`final`**.

### Discarding this example

`difficulty` here is a disposable stand-in, not a real Sudoku game
session's actual difficulty setting. What carries forward: `final` lets a
variable be assigned exactly once, and the compiler — not a comment, not
discipline — refuses to compile any code that tries a second assignment.

### Mechanical walkthrough

- **`final`** — a keyword placed before the type annotation, meaning this
  variable, once given its one value, can never be assigned again for the
  rest of the program. Unlike `String`, `int`, `double`, and `bool`, this
  is not a class or a type — it's language syntax modifying how the
  declared variable itself behaves, which is why it belongs among this
  lesson's Terms rather than its Objects and methods.
- **`String`** — the same real class from `dart:core` described in full in
  this lesson's header and used again in Concept Unit 1, here combined with
  `final` for the first time.
- **`difficulty`** — an identifier, same role as every previous unit's
  variable name.
- **`=`** — the same assignment operator as every previous unit, here
  giving `difficulty` its one and only permitted value.
- **`'Medium'`** — a string literal, the same kind of thing Concept Unit 1
  introduced: text delimited by quote characters.
- **`;`** — the statement terminator, same role as ever.
- **`print(difficulty)`** — the same `print` function from this lesson's
  header, reading a `final`-declared variable exactly the same way it reads
  any other — `final` restricts *reassignment*, not reading.
- **`difficulty = 'Hard';`** (broken case) — a second assignment to the
  same name, with no type annotation and no `final`/`const` keyword this
  time, because this line is not a new declaration at all — it is an
  attempt to *reassign* an already-declared name, which is exactly what
  `final`, on the line above it, forbids.

### CS lens

A variable that can be given a value exactly once and never changed
afterward is **immutability** applied to a single named binding — one of
the most consequential ideas in modern software design, because a value
that provably cannot change is a value no other part of a program can ever
have silently altered out from under it.

```
Also recognized in: Java's own `final` keyword, Kotlin's `val`, a
mathematical variable inside a single proof (it doesn't change value
partway through), a physical constant like the speed of light, a
signed contract's terms once all parties have agreed
```

### SE lens

Relying on a comment or a naming convention (`DIFFICULTY_DO_NOT_CHANGE`) to
signal "this shouldn't be reassigned" costs nothing to write and enforces
nothing at all — any later edit, made in good faith or by mistake, can
silently violate it, and the compiler will never object. `final`'s real
cost is the opposite of convenient: once a value has to change legitimately
(a genuinely mutable game setting, for instance), `final` cannot be used
for it at all, forcing an honest, upfront decision about which values in
this project are truly fixed for their variable's whole lifetime and which
are not — a decision `final` then holds the codebase to, permanently,
without needing a human to keep re-checking it.

### Commands needed

- **`dart analyze <file>`** — the same real command explained in full in
  Concept Unit 3: statically checks a file for errors without running it.

### Run it

Real, verified output for this unit's own function (again a slice of the
one larger batched run):

```
error - type_errors.dart:16:3 - The final variable 'difficulty' can only be set once. Try making 'difficulty' non-final. - assignment_to_final_local
warning - type_errors.dart:15:16 - The value of the local variable 'difficulty' isn't used. Try removing the variable or using it. - unused_local_variable
```

### Connecting this unit

This unit proved `final` guarantees a variable is assigned exactly once, at
whatever moment its declaration actually runs. The next unit introduces a
stricter, related guarantee — a value fixed not just once at runtime, but
before the program has even started running at all.

---

## Concept Unit: A Value Fixed Before the Program Even Runs

### The Problem

The previous unit's `final` guarantees `difficulty` is assigned exactly
once — but that one assignment still happens while the program is running,
at whatever moment that line of code actually executes. Some values are
even more fixed than that: a Sudoku board's size, `9`, is not something
that gets decided while the program runs at all — it is always `9`, before
a single line of this program has executed. Is `final` strict enough to
capture that stronger guarantee, or does Dart have something even more
restrictive?

> **Stop and think before reading on:** Given that `final String difficulty
> = 'Medium';` already prevents `difficulty` from ever being reassigned,
> what further guarantee could still be missing? What do you predict
> happens if you try to apply an even stricter keyword to a value that
> depends on something only known while the program is actually
> running — say, another `final` variable's own value?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-05/type_errors.dart`
  — modified, adding the `constNonConstantError` function.
- **Change type:** Add (one new function).
- **Location:** Appended directly after `finalReassignmentError`.
- **Dependencies:** The file created in Concept Unit 3, extended in
  Concept Units 5 and 6.

### The New Code

The working case:

```dart
const int boardSize = 9;
print(boardSize);
```

The broken case, added to the shared verification file — deliberately
reusing the previous unit's own `final` variable, to test whether `final`
is itself strict enough to satisfy `const`:

```dart
void constNonConstantError() {
  final String difficulty = 'Medium';
  const String label = difficulty;
}
```

### The Updated Project

```dart
 1: // Five deliberate compile-time errors, one per Lesson 5 Concept Unit.
 2: // Never run — analyzed only, via `dart analyze`. Each function is
 3: // intentionally never called; the error is structural (a type/const/
 4: // assignment rule violation), not something that needs to execute.
 5:
 6: void doubleIntMismatchError() {
 7:   int wrong = 42.5;
 8: }
 9:
10: void nullSafetyError() {
11:   int cellValue = null;
12: }
13:
14: void finalReassignmentError() {
15:   final String difficulty = 'Medium';
16:   difficulty = 'Hard';
17: }
18:
19: void constNonConstantError() {        // ← new
20:   final String difficulty = 'Medium'; // ← new
21:   const String label = difficulty;    // ← new
22: }                                     // ← new
```

`constNonConstantError`'s own `difficulty` is a separate variable from
`finalReassignmentError`'s, even though both use the same identifier — each
function's own body is a separate block, so a name declared inside one has
no relationship at all to the same name declared inside a different
function; they are two different variables that merely happen to share a
spelling.

### Introduce the concept in isolation

The working case is not run — a `const`-declared `int`, read right after
declaration, prints exactly like any other `int`:

```
9
```

The broken case is genuinely uncertain ahead of time, so it was actually
analyzed:

```
error - type_errors.dart:21:24 - Const variables must be initialized with a constant value. Try changing the initializer to be a constant expression. - const_initialized_with_non_constant_value
```

This is the crux of the previous unit's open question, now answered with
real proof rather than a guess: `final` is *not* strict enough to satisfy
`const`. Even though `difficulty` can genuinely never change after its one
assignment, Dart still refuses to treat it as a **compile-time constant**,
because its value is only fixed once that line of code actually executes at
runtime — not before the program starts running at all, which is what
`const` specifically demands.

### Discarding this example

`boardSize` and `label` here are disposable stand-ins, not real project
values yet. What carries forward: `const` requires a value the compiler can
fix in place while translating the program, before any code runs — a
strictly stronger requirement than `final`'s "assigned exactly once, at
runtime," proven here by a real, rejected attempt to use a `final`
variable as a `const` initializer.

### Mechanical walkthrough

- **`const`** — a keyword placed before a type annotation, meaning this
  variable's value must be a compile-time constant: fully known while the
  program is being translated, never merely computed once while it runs.
  Like `final`, this is language syntax, not a class, and belongs among
  Terms rather than Objects and methods.
- **`int`** — the same real class from Concept Unit 2, combined here with
  `const` for the first time.
- **`boardSize`** — an identifier, same role as every previous unit's
  variable name.
- **`=`** — the same assignment operator as every previous unit.
- **`9`** — an integer literal, the same kind of thing Concept Unit 2
  introduced — and, specifically, a literal is always already known at
  compile time, which is exactly why it satisfies `const`'s requirement
  where a `final` variable's value did not.
- **`;`** — the statement terminator, same role as ever.
- **`print(boardSize)`** — the same `print` function from this lesson's
  header, reading a `const`-declared variable the same way it reads any
  other.
- **`final String difficulty = 'Medium';`** (inside the broken function) —
  the exact same declaration form Concept Unit 6 introduced: a `final`
  variable, assigned exactly once, at the moment this line executes.
- **`const String label = difficulty;`** (broken case) — `const` combined
  with `String` (Concept Unit 1's real class) as a type annotation, `label`
  as an identifier, and, critically, **`difficulty`** as the initializer —
  a variable read, not a literal, and specifically a read of a value Dart
  considers only runtime-known, which is exactly what `const` rejects.

### CS lens

Requiring a value to be fully computable while translating a program,
before any of it executes, is **compile-time constant evaluation** — the
compiler doing real computation of its own, ahead of the program it's
producing, rather than deferring every computation to runtime.

```
Also recognized in: C and C++'s own `constexpr`, Rust's `const`, an
`enum`'s fixed member values in nearly every language that has enums,
a compiler's constant-folding optimization pass replacing `2 + 2` in
source code with the literal `4` before the program ever runs
```

### SE lens

`final`, alone, would be sufficient for most "don't let this change" needs —
but `const` buys something `final` cannot: because a `const` value's exact
bits are known before the program runs, Dart can allocate it once, bake it
directly into the compiled program, and safely reuse that exact same
instance everywhere it's referenced, rather than allocating a fresh copy
every time that line of code executes. The real cost is `const`'s much
stricter rule about what's allowed as an initializer — proven directly
above, where even an unmistakably-never-changing `final` variable was
rejected — which is why this project will reach for `final` far more often
than `const` going forward: `const` is reserved specifically for values
truly fixed before any code runs (a board size, a fixed limit), not merely
"assigned once."

### Commands needed

- **`dart analyze <file>`** — the same real command explained in full in
  Concept Unit 3: statically checks a file for errors without running it.

### Run it

Real, verified output for this unit's own function (again a slice of the
one larger batched run):

```
error - type_errors.dart:21:24 - Const variables must be initialized with a constant value. Try changing the initializer to be a constant expression. - const_initialized_with_non_constant_value
warning - type_errors.dart:21:16 - The value of the local variable 'label' isn't used. Try removing the variable or using it. - unused_local_variable
```

### Connecting this unit

This unit proved `const` is strictly stronger than `final` — a real
`final` variable was rejected as a `const` initializer, settling the
question the previous unit's SE lens raised. Every variable in this lesson
so far has had its type either explicitly written out or left unable to be
anything else. The final unit asks: does the type annotation itself have to
be written by hand at all?

---

## Concept Unit: Letting the Compiler Work Out the Type

### The Problem

Every variable in this lesson so far explicitly named its type: `String`,
`int`, `double`, `bool`, `final String`, `const int`. In every single case,
though, the type was already fully obvious from the value sitting right
after `=` — nothing about `String title = 'Open Calc Curriculum';` was
ambiguous about what type `title` had to be. Is writing the type out by
hand actually required, or can Dart work it out on its own?

> **Stop and think before reading on:** If Dart could look at
> `'Open Calc Sudoku'` and work out, on its own, that this has to be a
> `String`, would that mean the resulting variable is now free to hold
> *any* type later on — the same name reused for a `String` at one moment
> and an `int` the next? Or would you expect it to still be locked to
> whatever type Dart worked out, the same as if that type had been written
> by hand? What would it even mean for a *statically*-typed language, the
> kind every earlier unit in this lesson has been proving Dart to be, to
> also let a variable's type float freely after inference?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-05/type_errors.dart`
  — modified, adding the final function, `typeInferenceError`.
- **Change type:** Add (one new function).
- **Location:** Appended directly after `constNonConstantError`.
- **Dependencies:** The file created in Concept Unit 3, extended in
  Concept Units 5, 6, and 7.

### The New Code

The working case:

```dart
var puzzleName = 'Open Calc Sudoku';
print(puzzleName);
```

The broken case, completing the shared verification file:

```dart
void typeInferenceError() {
  var puzzleName = 'Open Calc Sudoku';
  puzzleName = 42;
}
```

### The Updated Project

The complete, final shared verification file for this lesson (new lines
marked `← new`; everything above line 23 is exactly what Concept Unit 7
left it as):

```dart
 1: // Five deliberate compile-time errors, one per Lesson 5 Concept Unit.
 2: // Never run — analyzed only, via `dart analyze`. Each function is
 3: // intentionally never called; the error is structural (a type/const/
 4: // assignment rule violation), not something that needs to execute.
 5:
 6: void doubleIntMismatchError() {
 7:   int wrong = 42.5;
 8: }
 9:
10: void nullSafetyError() {
11:   int cellValue = null;
12: }
13:
14: void finalReassignmentError() {
15:   final String difficulty = 'Medium';
16:   difficulty = 'Hard';
17: }
18:
19: void constNonConstantError() {
20:   final String difficulty = 'Medium';
21:   const String label = difficulty;
22: }
23:
24: void typeInferenceError() {           // ← new
25:   var puzzleName = 'Open Calc Sudoku'; // ← new
26:   puzzleName = 42;                    // ← new
27: }                                     // ← new
```

This file now holds all five of this lesson's deliberate mistakes, each
independent, each in its own never-called function, ready to be checked
together in one final, complete pass.

### Introduce the concept in isolation

The working case is not run — `puzzleName`'s inferred type is `String`
(from its initializer), so printing it is exactly Concept Unit 1's
`String` case again, under a different name:

```
Open Calc Sudoku
```

The broken case is genuinely uncertain ahead of time, so it was actually
analyzed, completing the one batched run this whole lesson has been
building toward:

```
error - type_errors.dart:26:16 - A value of type 'int' can't be assigned to a variable of type 'String'. Try changing the type of the variable, or casting the right-hand type to 'String'. - invalid_assignment
```

This answers the Socratic prompt above directly: `var` does **not** make
`puzzleName` able to hold any type later — Dart worked out, once, at the
declaration, that its type is `String`, and locked it there exactly as if
`String` had been written by hand. This is called **type inference**, and
it is still fully **static typing**: the type is fixed at compile time, it
is simply not typed out by a person.

### Discarding this example

`puzzleName` here is a disposable stand-in, not a real project value. What
carries forward: `var` asks Dart to infer a type from the initializer, and
the resulting variable is exactly as strictly typed afterward as if that
inferred type had been written explicitly — proven here by a real,
rejected attempt to assign a mismatched type to it, identical in shape to
Concept Unit 3's `int`/`double` rejection.

### Mechanical walkthrough

- **`var`** — a keyword replacing an explicit type name in a declaration,
  telling Dart to work out the concrete type from whatever follows `=`.
  Like `final` and `const`, this is language syntax, not a class — it
  belongs among this lesson's Terms.
- **`puzzleName`** — an identifier, same role as every previous unit's
  variable name.
- **`=`** — the same assignment operator as every previous unit.
- **`'Open Calc Sudoku'`** — a string literal, the same kind of thing
  Concept Unit 1 introduced; here it is also the evidence Dart's own type
  inference reads to conclude `puzzleName`'s type is `String`.
- **`;`** — the statement terminator, same role as ever.
- **`print(puzzleName)`** — the same `print` function from this lesson's
  header, reading a `var`-declared variable no differently than an
  explicitly-typed one, because by the time this line runs, `puzzleName`'s
  type has already been fixed to `String`.
- **`puzzleName = 42;`** (broken case) — a reassignment (no type annotation
  or `var` this time, because this line isn't a new declaration), attempting
  to store `42` — an integer literal, the same kind Concept Unit 2
  introduced — into a variable whose inferred type is `String`, which
  `var`'s own inference-then-lock behavior forbids exactly as `int wrong =
  42.5;` (Concept Unit 3) forbade the reverse mismatch.

### CS lens

Working out a variable's type from context, rather than requiring it
written explicitly, while still enforcing that type as strictly as if it
had been — is **static type inference**.

```
Also recognized in: Kotlin's own `val`/`var`, C#'s `var`, TypeScript's
inferred variable types, the Hindley-Milner type inference algorithm
underlying ML, Haskell, and OCaml's near-total absence of explicit
type annotations
```

This is genuinely distinct from a **dynamically-typed** language (Python,
JavaScript), where the same variable name really can hold a `String` at one
moment and an `int` the next, and any type mismatch is only discovered
while that specific line is actually executing — not before.

### SE lens

Writing every type out explicitly (as every earlier unit in this lesson
did) costs a small amount of visual noise in exchange for a type being
obvious at a glance, without needing to trace back to a variable's
initializer or open an IDE's own inline type hints. `var` trades that
immediate visibility away for conciseness, while — as this unit's real
error just proved — losing none of the actual type-safety guarantee
underneath. This project's own convention going forward: prefer an
explicit type annotation for a field or a value whose type matters to a
reader skimming the code, and reach for `var` only when a variable's type
is genuinely obvious from the very next few characters — a convention
recorded in this curriculum's own HANDOFF so later lessons apply it
consistently rather than each one re-deciding it independently.

### Commands needed

- **`dart analyze <file>`** — the same real command explained in full in
  Concept Unit 3: statically checks a file for errors without running it.

### Run it

The complete, real, batched output for all five of this lesson's error
units together — one single real run, covering Concept Units 3, 5, 6, 7,
and this one:

```
Analyzing type_errors.dart...

  error - type_errors.dart:7:15 - A value of type 'double' can't be assigned to a variable of type 'int'. Try changing the type of the variable, or casting the right-hand type to 'int'. - invalid_assignment
  error - type_errors.dart:11:19 - A value of type 'Null' can't be assigned to a variable of type 'int'. Try changing the type of the variable, or casting the right-hand type to 'int'. - invalid_assignment
  error - type_errors.dart:16:3 - The final variable 'difficulty' can only be set once. Try making 'difficulty' non-final. - assignment_to_final_local
  error - type_errors.dart:21:24 - Const variables must be initialized with a constant value. Try changing the initializer to be a constant expression. - const_initialized_with_non_constant_value
  error - type_errors.dart:26:16 - A value of type 'int' can't be assigned to a variable of type 'String'. Try changing the type of the variable, or casting the right-hand type to 'String'. - invalid_assignment
warning - type_errors.dart:7:7 - The value of the local variable 'wrong' isn't used. Try removing the variable or using it. - unused_local_variable
warning - type_errors.dart:11:7 - The value of the local variable 'cellValue' isn't used. Try removing the variable or using it. - unused_local_variable
warning - type_errors.dart:15:16 - The value of the local variable 'difficulty' isn't used. Try removing the variable or using it. - unused_local_variable
warning - type_errors.dart:21:16 - The value of the local variable 'label' isn't used. Try removing the variable or using it. - unused_local_variable
warning - type_errors.dart:25:7 - The value of the local variable 'puzzleName' isn't used. Try removing the variable or using it. - unused_local_variable

10 issues found.
```

Real, saved in full — the exact file analyzed and this exact output — in
`src/docs/flutter/verification/lesson-05/run-log.md`.

### Connecting this unit

This unit proved `var` is still fully static — it infers a type once, then
enforces it exactly as strictly as an explicit annotation would, closing
the loop on every type this lesson introduced.

---

## Connect the Pieces

Picture, all at once, the smallest possible sketch of one real Sudoku
cell's worth of information — not yet a real project file, since none
exists yet for this Phase, but every value below uses exactly the type this
lesson just gave it, for exactly the reason this lesson gave that type:

A puzzle has a **`String`** name (Concept Unit 1) — `'Open Calc Sudoku'` —
worth naming once so it can be shown wherever the game needs its title. One
of its cells holds an **`int`** (Concept Unit 2) — a placed digit like `7`
— because a cell's value needs real arithmetic and comparison, not text
pretending to be a number. The game session tracks elapsed time as a
**`double`** (Concept Unit 3) — `42.5` seconds — because time keeps a
fractional part, and Concept Unit 3's own real, rejected `int wrong =
42.5;` proved `int` could never have held it safely instead. Whether that
same cell was one of the puzzle's original clues is a **`bool`** (Concept
Unit 4) — `true` or `false`, nothing else, enforced by a type built for
exactly two states. A cell nobody has touched yet isn't `0` — it's
genuinely empty, represented honestly as **`int?`** holding `null` (Concept
Unit 5), proven distinct from a real `int` by a real, rejected attempt to
force `null` into one. The difficulty chosen when this session started is
**`final`** (Concept Unit 6) — set exactly once, and, per a real rejected
reassignment, never again. The board's own size, `9`, is **`const`**
(Concept Unit 7) — not just unchanging for this one session, but fixed
before the program even began running, a guarantee even a `final` value
was proven, for real, not strict enough to satisfy. And the puzzle's own
display name could have been written as `var puzzleName = 'Open Calc
Sudoku';` (Concept Unit 8) instead of spelling out `String` by hand — proven,
by one final real rejected assignment, to be exactly as strictly typed
either way.

Eight values, four genuinely different real classes (`String`, `int`,
`double`, `bool`) and three modifiers layered on top of them (`?`, `final`,
`const`), plus one way of skipping the type annotation without skipping any
of the type safety (`var`) — five of those eight guarantees proven not by
trusting a description, but by writing the exact mistake and watching
Dart's own analyzer refuse it, for real. Lesson 6 picks up directly from
here: now that a value can be named and given a fixed shape, what happens
when a program needs to make a decision based on what that value actually
is?
