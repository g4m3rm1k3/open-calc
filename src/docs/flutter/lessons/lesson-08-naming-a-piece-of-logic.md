# Lesson 8: Naming a Piece of Logic

**What you will build:** Six small, standalone Dart functions — one that
does something without handing back a value, one that takes input through
parameters, one that hands a computed value back to its caller, one whose
input can be left out entirely, one whose input is supplied by name rather
than position, and two contrasted directly against each other to show what
it means for a function to depend on nothing but its own input. None of
this joins a real project yet. This lesson also **settles two promises
this curriculum made and deferred**: Lesson 1 taught only the one fixed
shape `void main() { }`, explicitly putting off "what is a function,
generally" until here; Lesson 4 taught `return <value>;` narrowly, putting
off a non-`void` return type's full treatment until here too. Both get
their real, full treatment in this lesson, not a citation back to where
they were first mentioned.

**What you need to know first:** Lesson 1's fixed `void main() { }` entry
point (this lesson explains *why* it's shaped that way, generally, for the
first time) and its `print` function, already used as an example of a
function without ever being named as one formally. Lesson 5's `String`,
`int`, and `bool`. Lesson 6's `bool`-producing comparisons, reused as a
condition inside one of this lesson's own function bodies.

**Terms used in this lesson:**

- **Function** — a named, reusable piece of logic: a body of code that can
  be invoked, by name, from anywhere else in the program, as many times as
  needed, instead of that same logic being retyped everywhere it's
  needed. It exists for the exact reason Lesson 5's variables existed for
  named *values* — so a piece of *behavior*, not just a value, can be
  given a name and referred to by that name repeatedly. Every function
  this curriculum has run so far — Lesson 1's `main`, every lesson's own
  calls to `print` — was already an example of this same general idea,
  narrowly explained at the time and left for this lesson to explain in
  full.
- **Entry point** — reappearing from Lesson 1, restated in full: Dart's
  fixed, non-negotiable convention for where a program's execution begins
  — a function named exactly `main`. This lesson's Concept Unit 1 shows
  that being the entry point is the *only* thing that makes `main` special;
  every other fact about it (`void`, its parentheses, its body) is
  ordinary function syntax, not unique to it.
- **Addition operator (`+`)** — reappearing from Lesson 6, restated in
  full: combines two numbers into their sum. This lesson's Concept Unit 3
  applies it to two parameters instead of two literals.
- **Multiplication operator (`*`)** — reappearing from Lesson 6, restated
  in full: combines two numbers into their product. This lesson's Concept
  Unit 6 applies it to one parameter multiplied by itself.
- **Compound assignment operator (`+=`)** — reappearing from Lesson 7,
  restated in full: a combined operator and assignment in one — `x += y`
  computes `x + y` and stores the result back into `x`. This lesson's
  Concept Unit 6 uses it to mutate a variable declared outside the
  function doing the mutating, which is exactly what makes that function
  impure.
- **Function declaration** — the statement that defines a function: its
  return type, its name, its parameter list, and its body, all together.
  It exists to introduce a function's own name into the program, the same
  role Lesson 5's variable declarations played for a value's name.
- **Identifier** — reappearing from Lesson 5, restated in full: a name a
  person chooses, here for a function rather than a variable, with no
  meaning to Dart beyond being that function's own name.
- **Block (`{ }`)** — reappearing from Lesson 6, restated in full: a
  sequence of statements grouped between curly braces, treated as one
  unit — here, a function's own body, run in full every time that
  function is called.
- **Parameter** — a named placeholder inside a function's own declaration,
  standing in for a value the function will be given each time it's
  called, without the function needing to know in advance what that
  specific value will actually be. It exists so one function's logic can
  work generically, on whatever value it's handed, rather than being
  hard-coded to one specific value it would otherwise need a near-
  identical duplicate function for every other value.
- **Argument** — the actual value supplied at a specific call site,
  matched up with one of the function's own declared parameters. It exists
  as the distinct counterpart to "parameter": a parameter is the
  *placeholder* a function's own declaration names; an argument is the
  *real value* a specific call site hands it — the same distinction as a
  form's blank field (parameter) versus what one specific person actually
  writes into it (argument).
- **Function call (invocation)** — using a function's name, followed by
  parentheses containing its arguments, to actually run that function's
  body. Every earlier lesson's `print(...)` was already this — this lesson
  is the first to name the mechanism formally: `print` itself is a
  function, and writing its name followed by `(...)` is what actually
  causes its body to run, rather than merely mentioning it.
- **`void`** — reappearing from Lesson 1, given its full, general
  treatment for the first time: a return type meaning "this function does
  not hand any value back to its caller." Lesson 1 only ever used it
  narrowly, fixed to `main`'s own specific shape; this lesson's Concept
  Unit 1 shows it is a return type any function can use, whenever that
  function's whole purpose is to *do* something (print text, mutate
  state) rather than *compute* a value to hand back.
- **Return type** — the type written directly before a function's name in
  its declaration, fixing what kind of value (or, for `void`, no value at
  all) that function hands back to whoever calls it — checked by the
  compiler the same way Lesson 5's variable type annotations are.
- **`return` statement** — reappearing from Lesson 4, given its full
  treatment for the first time: immediately ends a function's execution
  and hands a value back to whoever called it. Lesson 4 only used it
  narrowly, flagged as deferred; this lesson's Concept Unit 3 shows the
  value it returns must match the function's own declared return type,
  the same way Lesson 5's assignment checks a value against a variable's
  declared type.
- **Optional (positional) parameter (`[Type name = default]`)** — a
  parameter written between square brackets in a function's declaration,
  which a caller may omit entirely; if omitted, the parameter takes on a
  declared **default value** instead of being left with no value at all.
  It exists for a function whose logic mostly makes sense with just its
  required parameters, but that can accept extra, optional detail from a
  caller who has it to give.
- **Default value** — the value an optional parameter takes on when a
  caller's function call simply doesn't supply one — not `null`, not an
  error, a real, chosen, declared value written directly into the
  function's own declaration.
- **Named parameter (`{Type name}`)** — a parameter written between curly
  braces in a function's declaration, supplied at a call site by writing
  its own name followed by `:` rather than by its position among the
  other arguments. It exists so a call with several similar-looking
  arguments (two `int`s, say) states plainly, at the call site itself,
  which argument means what — rather than relying on a reader to count
  positions correctly.
- **`required` (on a named parameter)** — marks a named parameter as
  mandatory: the compiler refuses to compile any call site that omits it,
  the same way a plain (non-optional, non-named) parameter always has
  been. Without it, a named parameter is optional by default — `required`
  exists specifically to take a named parameter's *position*-independent
  clarity and combine it with a positional parameter's *mandatory*
  guarantee.
- **Pure function** — a function whose result depends only on its own
  parameters, with no reliance on and no change to anything outside
  itself — calling it twice with the same arguments always produces the
  same result, and calling it produces no other visible effect on the
  rest of the program. It exists as a specific, useful guarantee some
  functions can make and others can't, proven directly in this lesson's
  final unit by contrasting one function that keeps this guarantee against
  one that doesn't.
- **Side effect** — any change a function makes to something outside its
  own return value: mutating a variable that exists outside the function,
  printing to the screen, writing a file. It exists as the specific thing
  a pure function is defined by *not* having — a function with a side
  effect can behave differently across identical calls, exactly as this
  lesson's own impure example does.

**Objects and methods used:**

- **`print`**
  - *What it is:* the same function every earlier lesson has used —
    here, for the first time, explicitly identified as an ordinary example
    of this lesson's own subject: a function like any other, not special
    syntax.
  - *Implementation:* `void print(Object? object)`, `dart:core` — its own
    return type, `void`, is a real, ordinary use of this lesson's Concept
    Unit 1, not an exception to it.
  - *Its use:* every function this lesson defines uses `print` to make its
    own return value or side effect visible.
  - *Type:* a top-level function in `dart:core` — structurally identical
    in kind to every function this lesson defines, just written by the
    Dart SDK's own authors instead of this lesson.
  - *Responsibility:* convert one value to text and write it, plus a
    newline, to standard output.
  - *Depends on:* one argument (this lesson's term, defined above) —
    matched to `print`'s own one declared parameter, `Object? object`.
  - *Connects to:* called throughout this lesson's snippets, each time
    handed a different function's own return value.
  - *Shape:* `dart:core`'s public standard-library surface, unchanged
    since Lesson 1 — and, as of this lesson, no longer a mysterious
    exception to "what a function is," but a plain instance of it.
- **`int`**
  - *What it is:* the same real `dart:core` class Lesson 5 introduced.
  - *Implementation:* `abstract final class int extends num` (verified in
    Lesson 5).
  - *Its use:* every numeric parameter and return type in this lesson is
    one.
  - *Type:* an abstract class extending `num`.
  - *Responsibility:* represent one whole-number value and provide the
    arithmetic this lesson's `addPoints` and `pureSquare` perform on it.
  - *Depends on:* an integer literal or an expression producing a
    whole-number result, supplied as an argument at a call site.
  - *Connects to:* passed as an argument into this lesson's functions;
    returned back out of several of them; read by `print`.
  - *Shape:* `dart:core` standard-library surface, unchanged from Lesson
    5.
- **`String`**
  - *What it is:* the same real `dart:core` class Lesson 5 introduced.
  - *Implementation:* `abstract final class String implements
    Comparable<String>, Pattern` (verified in Lesson 5).
  - *Its use:* this lesson's `describeDigit` and `formatCell` both return
    one, built from string interpolation over their own parameters.
  - *Type:* an abstract class.
  - *Responsibility:* represent and provide operations over an immutable
    sequence of UTF-16 text code units.
  - *Depends on:* a literal or expression producing text — here, a string
    interpolation combining a parameter's value with fixed text.
  - *Connects to:* constructed inside a function body from its own
    parameters; returned to that function's caller; read by `print`.
  - *Shape:* `dart:core` standard-library surface, unchanged from Lesson
    5.

---

## Concept Unit: A Function That Does Something, Without Handing Anything Back

### The Problem

Lesson 1's `void main() { }` was presented as a fixed, non-negotiable
shape — "just write it this way" — with the actual idea of a function
explicitly deferred to this lesson. Every lesson since has also called
`print(...)`, itself a function, without ever explaining what makes
something "a function" in the first place. What, in general, *is* a
function, and why does `main` specifically use `void`?

> **Stop and think before reading on:** Lesson 5 let you name a *value*
> with a variable so it could be reused by name instead of retyped. If a
> whole *piece of behavior* — several statements, not just one value —
> needed the same treatment, what would you expect that declaration to
> need that a variable declaration doesn't: just a name and a type, or
> something more? And given `main` never hands a value back to whatever
> starts a Dart program, what do you think `void` actually means as a
> *general* return type, usable on any function, not just `main`?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-08/functions_demo.dart`
  — created, containing this unit's function; Concept Units 2–6 will each
  add their own function to this same file before it's run once, as one
  real batch.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
void printBoardSize() {
  print('Board size: 9');
}
```

### The Updated Project

Not applicable — this is the file's brand-new starting content.

### Introduce the concept in isolation

Calling this function's output is a direct, literal echo of a string
literal already on the page, with zero computation — predictable, no run
needed on its own (this unit's function is, however, included in the one
real batched run Concept Unit 6 completes and shows in full):

```
Board size: 9
```

This is a **function**: a named (`printBoardSize`), reusable piece of
logic, callable from anywhere else in this file by writing its name
followed by `()`. `main`, since Lesson 1, has been exactly this same kind
of thing — the *only* thing making `main` special is that Dart itself
looks for that one specific name to decide where a program starts (Lesson
1's own **entry point** term); nothing about `void`, the parentheses, or
the block is unique to `main` at all, all proven directly by this unit's
own function sharing every one of those same pieces.

### Discarding this example

`printBoardSize`'s own fixed text is disposable — a stand-in, not a real
project value. What carries forward: a function is declared with a return
type, a name, a parameter list (here, empty), and a body — and `void`
means "hands nothing back," a general return type any function can use,
not a fact special to `main`.

### Mechanical walkthrough

- **`void`** — the return type: reappearing from Lesson 1, given its full,
  general treatment here for the first time — this function does not hand
  any value back to whoever calls it; its only effect is the `print` call
  inside its body.
- **`printBoardSize`** — an identifier (Lesson 5's term, reappearing,
  restated above), here naming a function instead of a variable.
- **`()`** — an empty parameter list: this function needs no input at all
  to do its one fixed job.
- **`{ print('Board size: 9'); }`** — the function's own body: a block
  (Lesson 6's term, reappearing, restated above), here containing one
  statement — a call to `print`, the same function from this lesson's
  header, handed a string literal.

### CS lens

Giving a reusable piece of behavior its own name, separate from any one
place that happens to use it, is **procedural abstraction** — one of the
most foundational ideas in all of programming, letting a piece of logic
be reasoned about, tested, and reused as a single named unit rather than
as a specific sequence of statements that has to be re-read in full every
time it's needed.

```
Also recognized in: a subroutine in any assembly language, a
recipe's own named sub-steps ("prepare the sauce," referenced from
several different full recipes), a math textbook defining a
function once and then just writing its name afterward, a factory's
own named, repeatable assembly process
```

### SE lens

Never naming a reusable piece of logic — just retyping the same statements
everywhere they're needed, the way this whole curriculum's own Lesson 1
program did for its one `print` call — costs nothing for a single,
never-repeated action, and becomes a real, compounding cost the instant
the same logic needs to run from two different places: change one copy,
and every other untouched copy silently drifts out of sync with it.
Wrapping logic in a function trades a small one-time declaration cost for
eliminating that drift entirely — every caller runs the exact same,
single, current copy.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's function is combined with Concept Units 2–6's own functions into
one file, run once. The complete real output is shown in full in Concept
Unit 6's own "Run it" step, and saved in
`src/docs/flutter/verification/lesson-08/run-log.md`.

### Connecting this unit

This unit named a piece of behavior that needs no input and hands nothing
back. The next unit gives a function actual input to work with.

---

## Concept Unit: Giving a Function Input

### The Problem

`printBoardSize` always prints the exact same fixed text — it cannot
behave differently for different callers, because it has no way to
receive anything from them. A Sudoku engine will need a function that,
say, describes *whichever* row and column a caller happens to pass it —
not one fixed pair, hard-coded once. What lets a function accept different
values from different callers?

> **Stop and think before reading on:** Given Lesson 5's variables can
> already hold different values at different times, what do you think a
> function needs, in its own declaration, to receive a value *from its
> caller* rather than only ever using a value already fixed inside its own
> body?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-08/functions_demo.dart`
  — modified, appending this unit's function.
- **Change type:** Add (new function in the file created in Concept Unit
  1).
- **Location:** Appended directly after `printBoardSize`.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
void printCell(int row, int col) {
  print('row $row, col $col');
}
```

### The Updated Project

```dart
1: void printBoardSize() {
2:   print('Board size: 9');
3: }
4:
5: void printCell(int row, int col) {  // ← new
6:   print('row $row, col $col');      // ← new
7: }                                   // ← new
```

### Introduce the concept in isolation

Not run standalone — predictable, no genuine uncertainty about what
`printCell(2, 5)` would print, though this exact call isn't actually made
in this lesson's own batched run (Concept Unit 5's `formatCell` covers the
same shape of question with a real run instead). Stated from confidence:
calling `printCell(2, 5)` would print `row 2, col 5`.

### Discarding this example

`printCell` itself is disposable — this exact function signature won't be
referred to again by this name. What carries forward: a parameter (`row`,
`col`, each with its own type annotation) is a named placeholder a
function's body can use, filled in with a real value — an **argument** —
only once the function is actually called.

### Mechanical walkthrough

- **`void printCell(int row, int col)`** — the function declaration:
  `void` (this lesson's Concept Unit 1) as the return type, `printCell` as
  the function's identifier, and, new here, two parameters inside the
  parentheses: `int row` and `int col`, each a type annotation (Lesson 5's
  term) followed by an identifier, separated by a comma.
- **`row`, `col` (inside the body)** — reading each parameter's own value:
  inside the function's body, `row` and `col` behave exactly like ordinary
  variables (Lesson 5's term) that happen to already hold whatever value
  the caller supplied as an argument, rather than being declared with
  their own literal.
- **`print('row $row, col $col')`** — the same `print` function from this
  lesson's header, its argument built with string interpolation (Lesson
  4's term, reappearing, restated in Lesson 7): `$row` and `$col` each call
  that parameter's own `toString()`, producing text built from whatever
  values were actually passed in.

### CS lens

Parameters are what make procedural abstraction (previous unit's CS lens)
actually *generic* — the same logic running correctly against many
different inputs, rather than one function existing per fixed value.

```
Also recognized in: a math function like `f(x) = x + 1` — `x` is a
parameter, standing for whatever specific number is actually
substituted in; a form letter's own mail-merge fields; a factory
machine's own adjustable input settings, run against many different
raw materials using the identical machine
```

### SE lens

Without parameters, a distinct function would be needed for every single
row/column pair a Sudoku board could ever have — 81 near-identical
functions for a 9×9 board, differing only in which two literal numbers
appear inside them. Parameters collapse that entire family down to one
function, at the real cost that the function's own body can no longer
assume anything about the specific values it will be called with — it has
to be written generically enough to behave sensibly for *any* `int` a
caller might pass, not just the ones its author happened to think of while
writing it.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Not run, by design — see "Introduce the concept in isolation," above; this
exact function and call combination is not part of this lesson's real
batched run (Concept Unit 5 covers the same underlying idea for real).

### Connecting this unit

This unit let a function *receive* a value. The next unit lets a function
*hand one back*.

---

## Concept Unit: Handing a Value Back to the Caller

### The Problem

`printCell` can receive a row and column, but it can only ever *display*
something — it cannot hand a computed result back to whoever called it,
for that caller to use in some further computation. A Sudoku engine will
need exactly that: a function that computes a sum, a validity check, or a
generated puzzle, and returns the actual result rather than only printing
it. Lesson 4 already used `return <value>;` once, narrowly, without fully
explaining it — what does it actually require of a function's own
declaration?

> **Stop and think before reading on:** Given that `void` (Concept Unit 1)
> means "hands nothing back," what would a function's declaration need to
> say instead, in the exact same position `void` sits in, for it to
> legally hand an `int` back to its caller? And what do you predict
> happens if a function's return type says `int`, but its body's `return`
> statement tries to hand back a `String` instead?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-08/functions_demo.dart`
  — modified, appending this unit's function.
- **Change type:** Add (new function).
- **Location:** Appended directly after `printCell`.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Unit 2.

### The New Code

```dart
int addPoints(int a, int b) {
  return a + b;
}
```

### The Updated Project

```dart
1: void printBoardSize() {
2:   print('Board size: 9');
3: }
4:
5: void printCell(int row, int col) {
6:   print('row $row, col $col');
7: }
8:
9: int addPoints(int a, int b) {   // ← new
10:   return a + b;                // ← new
11: }                              // ← new
```

### Introduce the concept in isolation

`addPoints(3, 4)`'s result is confidently predictable (Lesson 6 already
proved `+`'s own behavior for real), but this unit's function is part of
this lesson's one real batched run rather than predicted in isolation.
Real output for this specific call, `print(addPoints(3, 4))`:

```
7
```

### Discarding this example

`addPoints`'s own two parameter names are disposable. What carries
forward: a non-`void` return type (`int`, here) requires the function's
body to actually `return` a value of that exact type — proven, not merely
described, by this lesson's own analyzer never objecting to this function,
in contrast with the real, verified error this lesson's Concept Unit 4
produces for a genuinely mismatched case.

### Mechanical walkthrough

- **`int addPoints(int a, int b)`** — the function declaration: `int`, in
  the position `void` occupied in Concept Units 1 and 2, is this
  function's return type — a promise, checked by the compiler, that
  calling this function produces a real `int` value; `a` and `b` are two
  more parameters, same shape as Concept Unit 2's `row`/`col`.
- **`return a + b;`** — the `return` statement (this lesson's header,
  reappearing from Lesson 4, restated in full): immediately ends this
  function's execution, handing the value of the expression `a + b`
  (Lesson 6's addition operator, applied here to two parameters instead
  of two literals) back to whoever called it. Because `a + b`'s own type
  is `int` — matching the function's own declared `int` return type — this
  is a legal `return`; a return type of `String` here instead would be
  rejected the same way Lesson 5's `int wrong = 42.5;` was rejected, for
  the same underlying reason: a static type mismatch, caught before the
  program runs.
- **`print(addPoints(3, 4))`** (at the call site) — a function call
  (this lesson's term) nested directly inside another: `addPoints(3, 4)`
  runs first, producing `7`, and that `7` becomes `print`'s own single
  argument.

### CS lens

A function that hands a value back, rather than only performing an
action, is the difference between a **procedure** (Concept Unit 1's
`printBoardSize`, doing something) and a **function** in the stricter,
mathematical sense (computing and returning a value) — many languages
(and this curriculum, going forward) use the word "function" loosely for
both, but the distinction itself is real and recurring.

```
Also recognized in: a math textbook's own function notation,
`f(x) = ...`, always producing a value rather than performing an
action; a spreadsheet formula cell, which always evaluates to a
value; a calculator button that computes and displays a result,
versus one that only performs an action like clearing the display
```

### SE lens

`printCell` (Concept Unit 2) could only ever display its result directly —
any further computation using that result would have to be duplicated
inside `printCell` itself. `addPoints` returning its result instead means
any caller can do whatever it wants with `7` — print it, add it to
something else, pass it into a third function — without `addPoints` itself
needing to know or care what happens to its own result afterward. This is
a real separation of concerns: a function that returns a value stays
useful in contexts its own author never anticipated; a function that only
prints or otherwise acts directly does not.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone — batched with the rest of this lesson; complete
output shown in Concept Unit 6's own "Run it" step.

### Connecting this unit

This unit let a function hand a required value back. The next unit lets a
caller *omit* an input entirely, rather than always supplying every single
one.

---

## Concept Unit: An Input a Caller Can Leave Out

### The Problem

Every parameter shown so far is mandatory — every single call to
`printCell` or `addPoints` must supply every one of its parameters, or the
call itself won't compile. Some inputs genuinely have a sensible default
most callers would want most of the time, with only occasional callers
needing to override it — describing a Sudoku digit, say, usually just as
"a digit," but occasionally as "a clue" or "a candidate." Writing two
near-identical functions (with and without that extra detail) duplicates
the function itself. Is there a way to let one parameter be skipped?

> **Stop and think before reading on:** If a parameter could be optional,
> what would have to happen inside the function's own body when a caller
> skips it — would the parameter need to somehow tolerate being
> completely absent, or could the function's own declaration state, up
> front, exactly what value to use instead?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-08/functions_demo.dart`
  — modified, appending this unit's function.
- **Change type:** Add (new function).
- **Location:** Appended directly after `addPoints`.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Units 2 and 3.

### The New Code

```dart
String describeDigit(int digit, [String label = 'digit']) {
  return '$digit is a $label';
}
```

### The Updated Project

```dart
 1: void printBoardSize() {
 2:   print('Board size: 9');
 3: }
 4:
 5: void printCell(int row, int col) {
 6:   print('row $row, col $col');
 7: }
 8:
 9: int addPoints(int a, int b) {
10:   return a + b;
11: }
12:
13: String describeDigit(int digit, [String label = 'digit']) {  // ← new
14:   return '$digit is a $label';                               // ← new
15: }                                                            // ← new
```

### Introduce the concept in isolation

Whether an omitted optional parameter genuinely falls back to its declared
default, rather than becoming `null` or causing an error, is a real
behavior claim worth proving rather than assuming — run for real, batched
with the rest of this lesson. Two real calls and their real results:

```
7 is a digit
7 is a clue
```

The first call, `describeDigit(7)`, supplied only the required `digit`
parameter — and the result shows `label` really did fall back to its
declared default, `'digit'`. The second, `describeDigit(7, 'clue')`,
supplied both — and `label` really did take on the explicitly-passed
value instead, overriding the default.

### Discarding this example

`describeDigit`'s own text is disposable. What carries forward: a
parameter inside `[ ]`, with `= value` in its own declaration, is
optional — a caller may skip it, in which case it takes on that declared
default rather than being absent or `null`; supplying it overrides that
default with whatever the caller actually passed.

### Mechanical walkthrough

- **`String describeDigit(int digit, [String label = 'digit'])`** — the
  function declaration: `String` as the return type; `digit`, a plain,
  required `int` parameter, same shape as every earlier unit's; then, in
  square brackets, `String label = 'digit'` — an optional parameter: its
  own type annotation, its own identifier, and, after `=`, its default
  value, a string literal (Lesson 5's term).
- **`return '$digit is a $label';`** — the `return` statement (this
  lesson's Concept Unit 3), handing back a `String` built with string
  interpolation (Lesson 4's term) over both parameters — whichever real
  values they hold, whether `label` came from a caller or from its own
  default.
- **`describeDigit(7)`** (at the call site) — a function call supplying
  only the required parameter; `label` is not present in this call at
  all, so it takes on its declared default.
- **`describeDigit(7, 'clue')`** (at the call site) — a function call
  supplying both parameters positionally; `'clue'`, a string literal,
  fills `label` instead of its default.

### CS lens

Letting a parameter carry its own fallback value, chosen once by the
function's own author rather than repeated by every caller, is a specific,
recurring idea: **sensible defaults** — minimizing what a typical caller
has to specify, while still allowing the uncommon case to override it
explicitly.

```
Also recognized in: nearly every configuration file format's own
default settings, a form field pre-filled with a common answer that
can still be changed, a function library's own optional
configuration parameters, a restaurant menu's "comes with fries
unless you ask for a substitute"
```

### SE lens

Without optional parameters, adding one new piece of occasionally-useful
detail to an existing function would force every single existing caller
to be edited to supply it, even callers that don't care about it at all.
Optional parameters mean a function's own capability can grow — accepting
more detail from callers who have it — without breaking any caller that
already existed before that detail was added; the real cost is that a
reader skimming a call site with an omitted optional parameter has to
already know, or go look up, what its default actually is, since it's not
visible at the call site itself.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Not run standalone — batched with the rest of this lesson; complete
output shown in Concept Unit 6's own "Run it" step.

### Connecting this unit

This unit let a caller skip an input by position, silently falling back to
a default. The next unit introduces a different way of supplying an
input: by name, rather than by position, at the call site itself.

---

## Concept Unit: An Input Supplied by Name

### The Problem

`printCell(int row, int col)` (Concept Unit 2) requires every caller to
remember that `row` comes before `col` — a call site like `printCell(5,
2)` gives no clue, just by reading it, which number is which without
checking the function's own declaration. For a function whose parameters
could easily be mixed up (two `int`s meaning very different things), is
there a way for the call site itself to state plainly which value means
what?

> **Stop and think before reading on:** If a call site could write
> `row: 2, col: 5` instead of just `2, 5`, would the *order* those two
> arguments were written in still matter? What problem from `printCell`'s
> own two same-typed parameters would that solve?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `src/docs/flutter/verification/lesson-08/functions_demo.dart` — modified,
  appending this unit's function; and
  `src/docs/flutter/verification/lesson-08/missing_required_named_param_error.dart`
  — created, for this unit's own real, deliberate compile error.
- **Change type:** Add (new function; new file for the error demo).
- **Location:** Appended directly after `describeDigit`.
- **Dependencies:** The file created in Concept Unit 1, extended through
  Concept Unit 4.

### The New Code

The working case:

```dart
String formatCell({required int row, required int col}) {
  return 'row $row, col $col';
}
```

The deliberately broken case, in its own file:

```dart
void missingRequiredNamedParamError() {
  print(formatCell(row: 2));
}
```

### The Updated Project

```dart
 1: void printBoardSize() {
 2:   print('Board size: 9');
 3: }
 4:
 5: void printCell(int row, int col) {
 6:   print('row $row, col $col');
 7: }
 8:
 9: int addPoints(int a, int b) {
10:   return a + b;
11: }
12:
13: String describeDigit(int digit, [String label = 'digit']) {
14:   return '$digit is a $label';
15: }
16:
17: String formatCell({required int row, required int col}) {  // ← new
18:   return 'row $row, col $col';                              // ← new
19: }                                                           // ← new
```

### Introduce the concept in isolation

The working call's own result is confidently predictable, given
`describeDigit`'s already-real-proven string interpolation — included in
this lesson's one real batched run rather than predicted separately:

```
row 2, col 5
```

Whether omitting a `required` named parameter is genuinely rejected before
the program runs, and with what exact wording, is a real claim worth
proving — run for real:

```
error - missing_required_named_param_error.dart:9:9 - The named parameter 'col' is required, but there's no corresponding argument. Try adding the required argument. - missing_required_argument
```

This proves `required` on a named parameter is enforced by the compiler
itself, the same way Lesson 5's `final`/`const` rules were — not a
convention a caller is merely expected to follow.

### Discarding this example

`formatCell`'s own text is disposable. What carries forward: a parameter
inside `{ }` is a named parameter, supplied at a call site as `name:
value`; `required` on one makes omitting it a real compile error, proven
above, not merely discouraged.

### Mechanical walkthrough

- **`String formatCell({required int row, required int col})`** — the
  function declaration: `String` as the return type; then, in curly
  braces, two named parameters: `required int row` and `required int
  col` — each a type annotation and an identifier, prefixed with
  `required`, marking it mandatory despite being a named (curly-brace)
  parameter, which would otherwise be optional by default.
- **`return 'row $row, col $col';`** — the same kind of `return` statement
  with string interpolation as the previous two units, here over two
  named parameters instead of positional ones.
- **`formatCell(row: 2, col: 5)`** (working call site) — a function call
  supplying both named arguments as `name: value` pairs; because these are
  matched by name, not position, `formatCell(col: 5, row: 2)` would call
  identically — proven directly by this unit's own Socratic question,
  answered: order no longer matters once arguments are named.
- **`formatCell(row: 2)`** (broken call site) — a function call supplying
  only one of the two required named parameters; the missing `col`
  argument is exactly what the real analyzer error rejects.

### CS lens

Matching an argument to its parameter by an explicit name, rather than by
position alone, is **named argument passing** — a real, if less common,
alternative to positional parameter matching found across several
languages, existing specifically to remove ambiguity a same-typed,
multi-parameter call site would otherwise carry.

```
Also recognized in: Python's own keyword arguments (`func(row=2,
col=5)`), Kotlin's named arguments, SQL's `INSERT INTO table (col1,
col2) VALUES (...)` naming columns explicitly rather than relying on
table-definition order alone
```

### SE lens

A purely positional version of this same function (`String formatCell(int
row, int col)`) works identically at the call site `formatCell(2, 5)` —
its real cost is exactly the ambiguity this unit's own Socratic question
raised: nothing about `formatCell(2, 5)` tells a reader, without checking
the declaration, whether `2` is the row or the column. Named, required
parameters cost a little extra typing at every call site, in exchange for
every call site being self-documenting and for the compiler enforcing that
nothing is silently left out — a tradeoff this project will lean toward
whenever a function's parameters are easy to mix up (same type, similar
meaning), and skip when they're not (a single obviously-named parameter
needs no name repeated at the call site).

### Commands needed

- **`dart analyze <file>`** — reappearing from Lesson 5, restated in full:
  statically checks a file for compile-time errors without running it.

### Run it

Real, verified output — the working call is part of this lesson's one
real batched run (full output in Concept Unit 6); the broken call was
analyzed separately, since it's a real compile error that would prevent
anything else in its own file from running:

```
error - missing_required_named_param_error.dart:9:9 - The named parameter 'col' is required, but there's no corresponding argument. Try adding the required argument. - missing_required_argument
```

Real, saved in full in
`src/docs/flutter/verification/lesson-08/run-log.md`.

### Connecting this unit

This unit let a call site name which value means what, and proved
`required` enforces a named parameter's presence the same way a plain
parameter always has been. The final unit steps back from *how* a
function receives input to ask a different question: what can be said
about a function's own *reliability*, based only on how it's written?

---

## Concept Unit: A Function That Depends on Nothing but Its Own Input

### The Problem

`addPoints(3, 4)` (Concept Unit 3) will always produce `7`, no matter how
many times or in what order it's called. Not every function shares that
guarantee — a function that reads or changes something *outside* itself
(a variable declared elsewhere, a file, the current time) can behave
differently across identical-looking calls. Which kind is safer to reason
about, and why?

> **Stop and think before reading on:** If a function's own result
> depended partly on a variable declared *outside* the function, changed
> by that same function every time it's called, what would you predict
> happens if you call that function twice in a row with the exact same
> arguments — the same result both times, or something different the
> second time?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-08/functions_demo.dart`
  — modified, appending this unit's two contrasted functions, completing
  the file.
- **Change type:** Add (final functions in the file created in Concept
  Unit 1).
- **Location:** Appended directly after `formatCell`.
- **Dependencies:** The file created in Concept Unit 1, extended through
  Concept Unit 5.

### The New Code

```dart
int callCount = 0;

int impureIncrement() {
  callCount += 1;
  return callCount;
}

int pureSquare(int x) {
  return x * x;
}
```

### The Updated Project

The complete, final file for this lesson (new lines marked; everything
above line 20 is exactly what Concept Unit 5 left it as):

```dart
 1: void printBoardSize() {
 2:   print('Board size: 9');
 3: }
 4:
 5: void printCell(int row, int col) {
 6:   print('row $row, col $col');
 7: }
 8:
 9: int addPoints(int a, int b) {
10:   return a + b;
11: }
12:
13: String describeDigit(int digit, [String label = 'digit']) {
14:   return '$digit is a $label';
15: }
16:
17: String formatCell({required int row, required int col}) {
18:   return 'row $row, col $col';
19: }
20:
21: int callCount = 0;               // ← new
22:
23: int impureIncrement() {          // ← new
24:   callCount += 1;                // ← new
25:   return callCount;              // ← new
26: }                                // ← new
27:
28: int pureSquare(int x) {          // ← new
29:   return x * x;                  // ← new
30: }                                // ← new
```

### Introduce the concept in isolation

Whether two identical calls to the same function really can produce two
different results — and whether a genuinely pure function's result really
never changes across repeated identical calls — are both real behavior
claims worth proving, not restating. Real output (two calls to each,
batched with the rest of this lesson):

```
1
2
16
16
```

`impureIncrement()`, called twice with no arguments at all — the same
call, written identically both times — produced `1`, then `2`: two
different results. `pureSquare(4)`, called twice with the identical
argument `4`, produced `16` both times. This is the real, load-bearing
difference this unit is built around: **`impureIncrement` has a side
effect** — it mutates `callCount`, a variable declared *outside* itself —
while **`pureSquare` is a pure function**: everything it needs comes in
through its own parameter, and it changes nothing outside itself.

### Discarding this example

`callCount`, `impureIncrement`, and `pureSquare` are disposable — none of
this is real Sudoku engine code. What carries forward: a pure function's
result is fully determined by its own arguments alone, provably, by
contrast with a function whose result depends on state outside itself.

### Mechanical walkthrough

- **`int callCount = 0;`** — a declaration (Lesson 5's term, reappearing),
  here at the top level rather than inside any function — meaning it
  exists independently of any one call to `impureIncrement`, and keeps
  whatever value it's given across every separate call.
- **`int impureIncrement() { callCount += 1; return callCount; }`** — a
  function declaration with no parameters at all; its body uses the
  compound assignment operator (Lesson 7's term, reappearing) to mutate
  `callCount` — a variable this function did not declare and does not
  receive as a parameter — then returns that same, just-mutated value.
  Because its result depends on `callCount`'s own value from *before* this
  specific call (which itself depends on how many times this same function
  was already called before), two calls with identical arguments (here,
  none at all) are not guaranteed to produce the same result — and,
  proven above, really don't.
- **`int pureSquare(int x) { return x * x; }`** — a function declaration
  taking one parameter, `x`; its body reads nothing but `x` itself,
  multiplies it by itself using the multiplication operator (Lesson 6's
  term, reappearing), and returns that product, mutating nothing outside
  itself.

### CS lens

A function whose result depends only on its own input, with no side
effects, is a **pure function** — a foundational idea in **functional
programming**, a whole different way of structuring programs around
functions with exactly this guarantee, which Lesson 15 (Functional
Thinking) returns to directly.

```
Also recognized in: a math function in the strict sense (Concept
Unit 3's own CS lens) — `f(x) = x * x` always means the same thing
for the same `x`; a spreadsheet formula cell, which always
recalculates to the same value given the same inputs; a hash
function, which must always produce the same output for the same
input to be useful at all
```

### SE lens

`impureIncrement`'s real cost is exactly what its own name admits: calling
it twice, in a different order, or from a different part of a larger
program, can produce a different result each time — which makes its
behavior depend on *when* and *how many times* it's been called before,
information a reader can't see just by looking at one call site. A pure
function like `pureSquare` can be called anywhere, any number of times, in
any order, and reasoned about completely in isolation — this is precisely
why Concept Unit 5, this lesson's own closing unit, ties directly into
Lesson 7's loop invariant: a pure function's guaranteed, input-only
behavior is exactly the kind of fact a loop invariant can safely lean on,
while a function riddled with side effects cannot be trusted the same way
without also tracking everything else it might have silently changed.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire batched file:

```
Board size: 9
7
7 is a digit
7 is a clue
row 2, col 5
1
2
16
16
```

Real, saved in full in
`src/docs/flutter/verification/lesson-08/run-log.md`.

### Connecting this unit

This unit proved, with a real, contrasted run, what makes a function's
result trustworthy across repeated calls — and what breaks that trust.

---

## Connect the Pieces

Trace one Sudoku-flavored idea through everything this lesson built.
Concept Unit 1's kind of function — `printBoardSize`, doing something
without input or output — is exactly what Lesson 1's `main` always was,
now explained in full rather than taken as a fixed convention. Concept
Unit 2 gave a function real input: a row and column, the same two numbers
a Sudoku board's own cell lookup will eventually need. Concept Unit 3 let
a function hand a computed value back — `addPoints(3, 4)` really did
return `7`, not merely print it, so a caller could do anything at all with
that `7`. Concept Unit 4 let a caller describing a digit skip the detail
that usually doesn't matter, falling back to a real, declared default,
proven for real rather than assumed. Concept Unit 5 let a caller of a
two-`int`-parameter function state plainly which number meant the row and
which meant the column, and proved, with a real compiler error, that
`required` genuinely enforces a named parameter's presence. And Concept
Unit 6 drew the line this whole lesson was building toward: a function
that depends on nothing but its own input can be trusted, called
anywhere, any number of times — proven directly by contrasting it, in one
real run, against a function that couldn't make that same promise.

Two promises this curriculum made and deferred are now paid in full:
`main`'s own `void () { }` shape (Lesson 1) and `return`'s own full
behavior with a non-`void` type (Lesson 4) are no longer fixed conventions
taken on faith — both are now fully explained, ordinary instances of this
lesson's own general subject. Lesson 9 turns to a new kind of value this
lesson's functions have not yet touched: not one number or one string at a
time, but a whole collection of them at once.
