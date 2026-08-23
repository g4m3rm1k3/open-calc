# Lesson 6: Making Decisions From Values

**What you will build:** A handful of standalone Dart snippets — none of
them joining a real project yet — that compute with numbers, compare
values against each other, combine yes/no facts, and branch a program's
own behavior based on what a value actually turns out to be, using three
different branching constructs (`if`/`else`, `switch`, and a ternary
expression). The subject underneath all of it: every one of Lesson 5's
named, typed values was inert on its own — this lesson is where a value
first starts *changing what the program does*.

**What you need to know first:** Lesson 5's `String`, `int`, `double`,
`bool`, and `var` (this lesson declares variables of each, reusing exactly
those types, never explaining them again from scratch but still restating
their real declared shape per this curriculum's Repetition Rule). Lesson 1
and 2's `dart run` from a terminal. Lesson 4's anatomy of reading real,
unexpected output — this lesson's switch unit deliberately produces output
that contradicts a reasonable first guess, and expects you to reason about
*why*, the same skill Lesson 4 built.

**Terms used in this lesson:**

- **Addition operator (`+`)** — combines two numbers into their sum. Exists
  because arithmetic is the most basic thing a program does with numeric
  data, and every language needs some symbol for it.
- **Subtraction operator (`-`)** — combines two numbers into their
  difference (left minus right). Exists for the same reason as `+`, for
  the inverse operation.
- **Multiplication operator (`*`)** — combines two numbers into their
  product. Exists for the same reason as `+` and `-`, for repeated
  addition expressed directly rather than written out as a loop (Lesson 7
  covers loops).
- **Division operator (`/`)** — divides the left operand by the right and
  always produces a `double` result, even when both operands are `int`.
  It exists as the operator for "how many times, including any fractional
  remainder, does the right value go into the left" — deliberately
  distinct from the next operator, which discards that fractional part.
- **Truncating division operator (`~/`)** — divides the left operand by the
  right and discards any fractional remainder, producing a whole-number
  result. It exists for the common case where only the whole-number
  quotient matters (this curriculum's own Sudoku board math will
  eventually need "which 3×3 box is row 7 in," an exact use for this).
- **Modulo operator (`%`)** — produces the remainder left over after
  dividing the left operand by the right. It exists for the common case
  where only what's *left over* matters, not the quotient itself (a
  Sudoku board's own row-within-box math needs exactly this).
- **Relational operators (`<`, `>`, `<=`, `>=`)** — compare two numbers'
  ordering, producing a `bool`: strictly less than, strictly greater than,
  less-than-or-equal, greater-than-or-equal. They exist because "is this
  bigger or smaller" is a different, equally basic question from "are
  these the same," which the next two operators answer instead.
- **Equality operator (`==`)** — asks whether two values are considered
  equal, producing a `bool`. It exists as a dedicated comparison operator,
  distinct from `=` (Lesson 5's assignment operator) — the two look
  similar but do entirely different jobs, one storing a value and one
  comparing two.
- **Inequality operator (`!=`)** — asks whether two values are *not*
  considered equal, producing a `bool`; exists as the direct opposite of
  `==`, for the equally common case of needing to know values differ.
- **Logical AND (`&&`)** — combines two `bool` values, producing `true`
  only if both are `true`. It exists for expressing "both of these
  conditions must hold" as a single expression, rather than as two nested
  `if` statements (this lesson's Concept Unit 4 covers `if` itself).
- **Logical OR (`||`)** — combines two `bool` values, producing `true` if
  at least one is `true`. It exists for the equally common opposite case:
  "at least one of these conditions must hold."
- **Logical NOT (`!`)** — takes one `bool` value and produces its opposite.
  It exists for directly expressing "the reverse of this condition,"
  rather than restating the condition itself in reversed form.
- **Short-circuit evaluation** — the rule that `&&` and `||` do not always
  evaluate their right-hand side at all: `&&` skips it the moment the left
  side is already `false` (nothing can make the result `true` at that
  point), and `||` skips it the moment the left side is already `true`
  (nothing can make the result `false`). It exists so an expression's right
  side can safely depend on the left side already having been checked —
  without it, a check like "the list has an item, and the first item is
  valid" would risk examining a first item that doesn't exist.
- **Boolean literal (`true` / `false`)** — reappearing from Lesson 5,
  restated in full: Dart's two reserved words for writing a `bool` value
  directly into source code. Used throughout this lesson's conditions and
  logical-operator demonstrations.
- **Integer literal** — reappearing from Lesson 5, restated in full: a
  whole number written directly into source code with no decimal point,
  understood by Dart as an `int` value with no further annotation needed.
- **Condition** — an expression that evaluates to a `bool`, used to decide
  which of two or more branches of code actually runs. It exists as the
  one thing every branching construct in this lesson (`if`, `switch`,
  the ternary expression) is built around: some yes/no fact, checked once,
  determining what happens next.
- **`if` statement** — runs one block of code only when its condition
  evaluates to `true`, and skips it entirely otherwise. It exists as the
  most basic way a program's own behavior can differ depending on data it
  only knows once it's actually running, rather than doing the exact same
  fixed sequence of steps every single time.
- **`else` clause** — attached directly to an `if` statement, runs its own
  block only when that `if`'s condition was `false`. It exists so "do this
  instead" doesn't need a second, separate `if` re-checking the opposite
  condition by hand.
- **`else if`** — chains a second condition onto an `else`, checked only if
  the first `if`'s condition was `false`. It exists for choosing among more
  than two possibilities without nesting a whole new `if`/`else` pair
  inside the first `else`'s block.
- **`switch` statement** — checks one value against a series of `case`
  clauses in order, running the block attached to whichever `case` value
  matches. It exists as an alternative to a long `else if` chain when every
  branch is testing the exact same value against different fixed
  possibilities, rather than a different condition each time.
- **`case`** — one labeled branch inside a `switch`, naming one specific
  value the switched-on value is compared against. It exists as the unit
  a `switch` statement is built out of — one per possibility being
  checked.
- **`default`** — a special `case` inside a `switch` that runs when no
  other `case`'s value matched. It exists for "none of the above," the
  same role `else` plays for an `if` chain.
- **`break`** — inside a `switch`, marks the end of one `case`'s block.
  Unlike in many other languages, this lesson's Concept Unit 5 proves with
  a real run that `break` is not what *prevents* fallthrough in Dart — a
  `case` with no `break` still doesn't fall through — so `break` here exists
  mainly for readability and for languages-transfer familiarity, not as a
  load-bearing safety mechanism the way it is elsewhere.
- **`continue` (with a label, inside a `switch`)** — deliberately jumps
  execution to a specific labeled `case`, causing intentional fallthrough.
  It exists because Dart's `switch` doesn't fall through on its own (proven
  in this lesson); when a program genuinely needs one case to also run the
  next case's code, `continue` plus a label is the explicit way to ask for
  that.
- **Label (`name:`)** — a name attached directly before a `case`, existing
  solely so a `continue` statement elsewhere in the same `switch` has
  something specific to name as its destination.
- **Identifier** — reappearing from Lesson 5, restated in full: the name a
  person chooses for a variable when declaring it, distinguishing an
  arbitrary, human-chosen label from a reserved word Dart itself gives a
  fixed meaning to.
- **Declaration** — reappearing from Lesson 5, restated in full: the
  statement that introduces a variable for the first time, giving it a
  type (explicit or inferred) and a name before any later line may read or
  reassign it.
- **Assignment (`=`)** — reappearing from Lesson 5, restated in full: the
  operator that stores a value into a variable, distinct from `==`'s
  equality *test* (Concept Unit 2, this lesson) despite the visual
  similarity.
- **Expression** — a piece of code that computes and *becomes* a value,
  usable anywhere a value is expected (assigned, passed to `print`, or, as
  this lesson's Concept Unit 6 shows, embedded inside a larger expression).
  Every arithmetic, comparison, and logical operator in this lesson, plus
  the ternary construct, produces one.
- **Statement** — one complete instruction, ended by `;` (or, for `if`/
  `switch`, structured with `{ }` blocks instead) — distinct from an
  expression in that a statement *performs* an action (a declaration, a
  branch) rather than necessarily reducing to one reusable value. `if` and
  `switch` are statements; the ternary construct is an expression — the
  exact distinction this lesson's Concept Unit 6 SE lens turns on.
- **Block (`{ }`)** — a sequence of statements grouped together between
  curly braces, treated as a single unit a construct like `if`, `else`, or
  a `switch` case can attach one of to run. It exists so more than one
  statement can be attached to a single branch of a decision, rather than
  limiting each branch to exactly one.
- **Ternary (conditional) expression (`condition ? a : b`)** — evaluates
  `condition`; if `true`, the whole expression's value is `a`, otherwise
  it's `b`. It exists as a compact alternative to a full `if`/`else` for
  the specific, common case of choosing between exactly two *values*,
  rather than choosing between two blocks of arbitrary code to run.

**Objects and methods used:**

- **`print`**
  - *What it is:* the same function Lesson 1 introduced and Lesson 5
    reused — Dart's basic way to show text to whoever is running the
    program.
  - *Implementation:* `void print(Object? object)`, `dart:core`, no import
    needed; converts its argument to text via that value's own
    `toString()` and writes it, plus a newline, to standard output.
  - *Its use:* every result this lesson computes — a sum, a comparison, a
    branch's chosen output — is made visible only because it's passed to
    `print`.
  - *Type:* a top-level function in `dart:core`.
  - *Responsibility:* convert one value to text and write it, plus a
    newline, to standard output — nothing more.
  - *Depends on:* one argument — in this lesson, always the result of an
    arithmetic expression, a comparison, a logical combination, or a
    branch.
  - *Connects to:* called throughout this lesson's snippets; internally
    hands finished text to the Dart runtime's I/O layer, same as every
    earlier lesson.
  - *Shape:* `dart:core`'s public standard-library surface, unchanged
    from Lesson 1 and 5.
- **`String`**
  - *What it is:* the same real `dart:core` class Lesson 5 introduced,
    reused here as the ternary expression's own result type.
  - *Implementation:* `abstract final class String implements
    Comparable<String>, Pattern` (verified in Lesson 5 from the real Dart
    SDK source).
  - *Its use:* Concept Unit 6 stores the ternary expression's chosen
    result — one of two possible pieces of text — in one.
  - *Type:* an abstract class.
  - *Responsibility:* represent and provide operations over an immutable
    sequence of UTF-16 text code units.
  - *Depends on:* a literal or expression producing text — here, one of
    two literals a ternary expression chooses between.
  - *Connects to:* constructed from whichever literal the ternary
    expression selects; read by `print` the same as every earlier use.
  - *Shape:* `dart:core` standard-library surface, unchanged from Lesson 5.
- **`int`**
  - *What it is:* the same real `dart:core` class Lesson 5 introduced,
    reused here for every arithmetic and comparison example.
  - *Implementation:* `abstract final class int extends num` (verified in
    Lesson 5).
  - *Its use:* every arithmetic and comparison operator in Concept Units
    1–2, and the switched-on value in Concept Unit 5, is an `int`.
  - *Type:* an abstract class extending `num`.
  - *Responsibility:* represent one whole-number value and provide the
    arithmetic and comparison operations every whole number needs — the
    exact operations this lesson's first two Concept Units exercise.
  - *Depends on:* an integer literal or an expression producing a
    whole-number result.
  - *Connects to:* combined by this lesson's operators into new `int` or
    `bool` results; read by `print` throughout.
  - *Shape:* `dart:core` standard-library surface, unchanged from Lesson 5.
- **`bool`**
  - *What it is:* the same real `dart:core` class Lesson 5 introduced,
    reused here as the result type of every comparison and logical
    operator, and as the type every condition in this lesson must be.
  - *Implementation:* `final class bool` (verified in Lesson 5) — not
    part of the `num` hierarchy.
  - *Its use:* the result of every `==`, `!=`, `<`, `>`, `<=`, `>=`, `&&`,
    `||`, and `!` expression in this lesson is a `bool`; every `if` and
    ternary condition must be one.
  - *Type:* a final, standalone class.
  - *Responsibility:* represent exactly one of `true` or `false`.
  - *Depends on:* one of Dart's two reserved boolean literal keywords, or
    an expression (a comparison, a logical combination) that produces one.
  - *Connects to:* produced by this lesson's comparison and logical
    operators; consumed directly by `if` and the ternary expression to
    decide which branch runs.
  - *Shape:* `dart:core` standard-library surface, unchanged from Lesson 5.
- **`dart` (specifically, its `run` subcommand)**
  - *What it is:* the same real command-line program Lesson 1 introduced,
    here back to its original `run` subcommand rather than Lesson 5's
    `analyze` — this lesson's proofs are about real runtime *behavior*
    (does a branch actually execute, does short-circuiting actually
    happen), not static type errors, so the code needs to actually run,
    not just be checked.
  - *Implementation:* the same real binary confirmed in Lesson 1
    (`C:\flutter\bin\cache\dart-sdk\bin\dart.exe`); `dart run <file>`
    translates and executes a file immediately.
  - *Its use:* every real run in this lesson's verification log used this
    exact command.
  - *Type:* a standalone executable program.
  - *Responsibility:* everything the Dart command line exposes; this
    lesson uses exactly its `run` corner, same as Lesson 1.
  - *Depends on:* a path to a `.dart` file to run.
  - *Connects to:* invoked from the terminal; starts the Dart VM, which
    executes the named file's `main` function.
  - *Shape:* the outermost boundary of every real run this lesson performs,
    unchanged in role from Lesson 1.

---

## Concept Unit: Arithmetic on Named Values

### The Problem

Lesson 5 gave a Sudoku cell's value a real `int` — but a Sudoku engine
doesn't just *store* numbers, it computes with them: which 3×3 box a row
belongs to, how many cells are still empty, whether two placed digits
conflict. None of Lesson 5's code ever combined two numbers into a new
one. What symbols does Dart provide for that, and do they all behave the
way you'd expect from ordinary arithmetic?

> **Stop and think before reading on:** Ordinary division on paper, `7 /
> 2`, gives `3.5`. If `7` and `2` are both stored as Dart's whole-number
> `int` type, what would you guess the *type* of `7 / 2`'s result is —
> still `int` somehow (rounded or truncated), or something else? Separately:
> what do you expect `-7 % 3` (a *negative* number's remainder) to be — a
> negative remainder, or something else?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet (Lesson 5's own note on this still applies).
- **Files affected:** `src/docs/flutter/verification/lesson-06/operators_demo.dart`
  — created, containing this unit's arithmetic lines; Concept Units 2 and
  3 will each add their own lines to this same file before it's run once,
  as one real batch, per the Verification Rule.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation (Lesson 1).

### The New Code

```dart
print(7 + 3);
print(7 - 3);
print(7 * 3);
print(7 / 2);
print(7 ~/ 2);
print(7 % 3);
print(-7 % 3);
```

### The Updated Project

Not applicable — this is the file's brand-new starting content; nothing
precedes it yet.

### Introduce the concept in isolation

Whether `7 / 2` produces an `int` or something else, and what `-7 % 3`
actually equals, are both genuinely uncertain claims about a specific
language's specific choices — not something to state from confidence. Real,
run output (batched together with Concept Units 2 and 3 below, per the
Verification Rule):

```
10
4
21
3.5
3
1
2
```

This answers both Socratic questions directly: `7 / 2` is `3.5` — a real
`double`, not a rounded `int` — proving `/` always produces a fractional
result even for two `int` operands, which is why the separate `~/`
operator exists for when a whole-number quotient is what's actually wanted
(`7 ~/ 2` → `3`). And `-7 % 3` is `2`, not `-1` — Dart's `%` always produces
a non-negative result when the right operand is positive, regardless of
the left operand's sign. Both are real, load-bearing facts about this
specific language's own choices, not universal truths every language
shares.

### Discarding this example

These exact literal values (`7`, `3`, `2`) are disposable — this precise
snippet won't be referred to again by these exact numbers. What carries
forward: `/` always returns a `double`, `~/` truncates to a whole `int`,
and `%`'s result takes its sign from the *right* operand, not the left.

### Mechanical walkthrough

- **`7 + 3`** — the addition operator applied to two integer literals
  (Lesson 5's term, reappearing, restated in full: a whole number written
  with no decimal point, understood as `int`); produces their sum, `10`,
  itself a new `int` value.
- **`7 - 3`** — the subtraction operator, same two literal kinds, producing
  their difference, `4`.
- **`7 * 3`** — the multiplication operator, producing the product, `21`.
- **`7 / 2`** — the division operator; both operands are `int` literals,
  but the operator's own real behavior — proven above, not assumed —
  produces a `double` result, `3.5`, regardless of its operands' type.
- **`7 ~/ 2`** — the truncating division operator; same two operands as the
  line above, but this operator discards `3.5`'s fractional `.5` entirely,
  producing the `int` `3`.
- **`7 % 3`** — the modulo operator; `7` divided by `3` truncates to `2`
  with `1` left over, so this produces `1`.
- **`-7 % 3`** — the modulo operator again, this time with a negative left
  operand; proven above to produce `2`, not `-1` — Dart defines `%` so its
  result always shares the sign of the *right* operand (or is zero),
  never the left.
- **Each `print(...)`** — the same `print` function from this lesson's
  header, called six times, each time handed one arithmetic expression's
  already-computed result.

### CS lens

Choosing to make `/` always produce a fractional result, with a separate,
explicitly-named operator (`~/`) for whole-number division, is a real,
specific design decision about **operator semantics** — what a given
symbol is defined to actually compute, which different languages are free
to define differently for the exact same symbol.

```
Also recognized in: Python 3 splitting `/` (always float) from `//`
(floor division) the same way Dart splits `/` from `~/`; C and Java's
own `/` instead truncating automatically for two `int` operands,
with no separate symbol at all; a calculator's own distinct
whole-number-remainder mode
```

### SE lens

A language whose `/` silently truncates for whole-number operands (C,
Java) saves one symbol, at a real cost: a Sudoku board computation like
"average of two row indices" (`(3 + 4) / 2`) would silently produce `3`
instead of `3.5` unless a programmer remembered to convert one operand to
a fractional type first — an easy, silent mistake. Dart's choice — `/`
always fractional, `~/` explicitly for truncation — trades one extra
symbol to learn for making that class of silent precision loss
structurally impossible: you cannot accidentally get a truncated result
from `/`, because `/` simply never produces one.

### Commands needed

- **`dart run <file>`** — the same real command from Lesson 1: translates
  and executes a `.dart` file immediately. Success means the program's own
  `print` output appears; a real runtime error would instead print an
  uncaught exception and a non-zero exit code.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's lines are combined with Concept Units 2 and 3's own lines into one
file, run once as a single real pass. The complete real output, and which
lines produced which result, are shown in full in Concept Unit 3's own "Run
it" step below, and saved in
`src/docs/flutter/verification/lesson-06/run-log.md`.

### Connecting this unit

This unit proved Dart's arithmetic operators don't all behave the way
casual intuition from other languages might suggest. The next unit turns
from *computing* a new number to *comparing* two numbers against each
other.

---

## Concept Unit: Comparing Two Values

### The Problem

A Sudoku engine needs to ask questions like "is this candidate digit
greater than the board's maximum of 9?" or "does this cell's value equal
the one the player just typed?" — none of the arithmetic operators just
introduced answer a yes/no question; every one of them produces another
number. What operators produce a `bool` instead?

> **Stop and think before reading on:** Lesson 5's `=` stores a value into
> a variable. Given that `==` is a completely different, two-character
> operator, what would you guess it actually checks, and why might Dart
> insist on two different symbols instead of reusing `=` for both jobs?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-06/operators_demo.dart`
  — modified, appending this unit's comparison lines directly after the
  previous unit's arithmetic lines.
- **Change type:** Add (new lines in the file created in Concept Unit 1).
- **Location:** Appended directly after the previous unit's seven `print`
  lines.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
print(7 == 7);
print(7 != 3);
print(7 > 3);
print(7 < 3);
print(7 >= 7);
print(7 <= 3);
```

### The Updated Project

```dart
 1: print(7 + 3);
 2: print(7 - 3);
 3: print(7 * 3);
 4: print(7 / 2);
 5: print(7 ~/ 2);
 6: print(7 % 3);
 7: print(-7 % 3);
 8:
 9: print(7 == 7);   // ← new
10: print(7 != 3);   // ← new
11: print(7 > 3);    // ← new
12: print(7 < 3);    // ← new
13: print(7 >= 7);   // ← new
14: print(7 <= 3);   // ← new
```

The file now demonstrates both arithmetic and comparison, one right after
the other, still all inside the same real program that will be run once,
whole, once Concept Unit 3 adds its own final lines.

### Introduce the concept in isolation

Six comparisons between literal, unchanging numbers — each is
straightforward once you know `==`/`!=` test equality and the relational
operators test ordering, with no computation whose exact result is in real
doubt. Predicted, and also captured for real as part of the same batched
run Concept Unit 1 already committed to:

```
true
true
true
false
true
false
```

### Discarding this example

These exact six lines, comparing the literals `7` and `3`, are disposable.
What carries forward: `==`/`!=` test equality, `<`/`>`/`<=`/`>=` test
ordering, and every one of them produces a `bool` — never the values being
compared themselves.

### Mechanical walkthrough

- **`7 == 7`** — the equality operator: asks whether its two operands are
  equal, producing `true` here since both sides are the same value. This is
  a genuinely different operator from Lesson 5's `=`, which stores a value
  rather than comparing one — the two symbols look related but do
  unrelated jobs.
- **`7 != 3`** — the inequality operator: the direct opposite question,
  producing `true` since `7` and `3` are not equal.
- **`7 > 3`**, **`7 < 3`** — the relational operators for strict ordering:
  `7 > 3` asks "is the left strictly greater," producing `true`; `7 < 3`
  asks "is the left strictly less," producing `false`, since `7` is not
  less than `3`.
- **`7 >= 7`**, **`7 <= 3`** — the relational operators including equality:
  `7 >= 7` asks "greater than *or equal*," producing `true` since they're
  equal; `7 <= 3` asks "less than or equal," producing `false`, since `7`
  is neither less than nor equal to `3`.
- **Each `print(...)`** — the same `print` function from this lesson's
  header, here each handed a `bool` — Lesson 5's real `final class bool`
  — rather than the `int` results Concept Unit 1's calls received.

### CS lens

Producing a `bool` from comparing two values, rather than, say, `1`/`0` or
some other stand-in, is the same **type safety** idea Lesson 5's
`bool`-versus-`int` SE lens already covered — here applied to the *result*
of an operator instead of a variable's own declared type.

```
Also recognized in: a database query's own `WHERE` clause evaluating
to matched/unmatched per row, a search algorithm's comparison step
deciding which half of a sorted list to discard, a sports tournament
bracket's own win/lose decision at each match
```

### SE lens

A language that reused a single symbol for both assignment and equality
(some early languages did, and it remains a classic, real source of bugs
in C-family languages where `if (x = 5)` compiles as an *assignment*
disguised as a condition) forces a programmer to remember, from context
alone, which job a given `=` is doing at a glance. Dart's insistence on
two entirely different symbols, `=` and `==`, makes that class of mistake
a completely different, visually distinct piece of syntax — a small extra
character to type, in exchange for that entire historical bug category
being far harder to write by accident.

### Commands needed

- **`dart run <file>`** — same command as the previous unit, explained in
  full there.

### Run it

Not run standalone, for the same Batching-clause reason as the previous
unit — the complete real output for all three operator units is shown in
Concept Unit 3's own "Run it" step.

### Connecting this unit

The previous unit computed new numbers; this unit compared existing ones,
producing `bool` results. The next unit combines those `bool` results with
each other.

---

## Concept Unit: Combining Yes/No Facts

### The Problem

A Sudoku move is only valid if *several* facts are all true at once: the
candidate digit is in range, **and** the target cell is empty, **and** it
doesn't conflict with the same row. The previous unit's comparisons each
produce one isolated `bool` — nothing shown so far combines more than one
of them into a single yes/no answer.

> **Stop and think before reading on:** If checking "is this cell empty"
> were somehow slow or risky to do, and checking "is the candidate in
> range" were fast and safe, would you want a combined "range is valid
> AND cell is empty" check to always run *both* checks no matter what, or
> would you want it to skip the slow one entirely once the fast one has
> already failed? What do you think Dart's `&&` actually does?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-06/operators_demo.dart`
  — modified, appending this unit's logical-operator lines, completing the
  file.
- **Change type:** Add (final lines in the file created in Concept Unit 1).
- **Location:** Appended directly after the previous unit's six comparison
  lines.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Unit 2.

### The New Code

```dart
print(false && (1 ~/ 0 == 1));
print(true || (1 ~/ 0 == 1));
print(!true);
```

### The Updated Project

The complete, final file for this lesson's operator demonstrations (new
lines marked; everything above line 15 is exactly what Concept Unit 2 left
it as):

```dart
 1: print(7 + 3);
 2: print(7 - 3);
 3: print(7 * 3);
 4: print(7 / 2);
 5: print(7 ~/ 2);
 6: print(7 % 3);
 7: print(-7 % 3);
 8:
 9: print(7 == 7);
10: print(7 != 3);
11: print(7 > 3);
12: print(7 < 3);
13: print(7 >= 7);
14: print(7 <= 3);
15:
16: print(false && (1 ~/ 0 == 1));  // ← new
17: print(true || (1 ~/ 0 == 1));   // ← new
18: print(!true);                   // ← new
```

### Introduce the concept in isolation

Whether `&&` and `||` actually skip evaluating a right side that would
otherwise crash the program is a genuine, real behavior claim, not
something to state from confidence without proof — so this whole file,
lines 1 through 18, was actually run as one real batch. Complete real
output:

```
10
4
21
3.5
3
1
2
true
true
true
false
true
false
false
true
false
```

Lines 16 and 17's real results — `false` and `true`, printed with **no
crash at all** — are the actual proof: `1 ~/ 0` (truncating division by
zero) really does throw a real runtime error if it's ever evaluated (this
is Dart's genuine behavior for `~/` by zero), and neither line threw one.
`false && (1 ~/ 0 == 1)` stopped the instant it saw its left side was
already `false` — nothing on the right side could change the answer, so
Dart never evaluated it at all. `true || (1 ~/ 0 == 1)` stopped the instant
it saw its left side was already `true`, for the mirrored reason. This
behavior is called **short-circuit evaluation**.

### Discarding this example

The specific literals `false`/`true` combined with `1 ~/ 0` here are
disposable — a deliberately constructed proof, not real project code. What
carries forward: `&&` and `||` genuinely skip evaluating their right side
whenever the left side alone already determines the answer.

### Mechanical walkthrough

- **`false && (1 ~/ 0 == 1)`** — the logical AND operator: its left operand
  is the boolean literal `false` (Lesson 5's term, reappearing, restated:
  one of Dart's two reserved words for a `bool` value); because `&&`
  requires *both* sides `true` to produce `true`, a `false` left side
  already guarantees the whole expression is `false`, so — proven by the
  real run above — the right side, `1 ~/ 0 == 1`, is never evaluated at
  all.
- **`1 ~/ 0 == 1`** (the right side, never actually evaluated here) — would
  itself be the truncating division operator from Concept Unit 1 applied
  to `1` and `0`, compared with `==` against `1`; dividing by zero this way
  is a genuine runtime error in Dart, which is exactly why this expression
  was chosen — its evaluation would be directly, visibly, observable by
  crashing the program.
- **`true || (1 ~/ 0 == 1)`** — the logical OR operator: its left operand
  is the literal `true`; because `||` requires only *one* side `true` to
  produce `true`, a `true` left side already guarantees the answer, so the
  right side is again never evaluated — same real proof, mirrored for `||`
  instead of `&&`.
- **`!true`** — the logical NOT operator: takes the single literal `true`
  and produces its opposite, `false`. Unlike `&&`/`||`, `!` only ever has
  one operand, so there's no second side to potentially skip.
- **Each `print(...)`** — the same `print` function from this lesson's
  header, each handed the `bool` result of one logical expression.

### CS lens

Short-circuit evaluation — stopping evaluation the instant an answer is
already determined, rather than always evaluating every part of an
expression regardless — is a specific instance of **lazy evaluation**: only
doing computational work once it's actually needed, not eagerly ahead of
time.

```
Also recognized in: a spreadsheet formula's own IF() function only
evaluating whichever branch actually applies, a video game only
rendering objects the camera can currently see, a search engine
stopping the instant it's confident enough in a top result, Python
and JavaScript's own `and`/`or` (and `&&`/`||`) behaving identically
```

### SE lens

A language that always fully evaluated both sides of `&&`/`||` regardless
of the left side's own answer would still be logically correct in most
cases — but it would forbid a genuinely useful, extremely common pattern:
guarding a risky check behind a safe one in the very same expression (a
later lesson's `cellList.isNotEmpty && cellList.first.isValid`, for
instance, safely checking a list has an item *before* the right side ever
looks at its first element). Short-circuiting costs nothing extra to write
— the syntax is identical either way — and its real benefit only shows up
the first time a program actually depends on the right side being skipped,
which is exactly what this unit's real run just proved happens.

### Commands needed

- **`dart run <file>`** — same command as the previous two units.

### Run it

Real, verified, complete output for the entire file (all three units,
lines 1–18), captured in one real run:

```
10
4
21
3.5
3
1
2
true
true
true
false
true
false
false
true
false
```

Real, saved in full in
`src/docs/flutter/verification/lesson-06/run-log.md`, alongside the exact
command used and a line-by-line mapping of which `print` produced which
result.

### Connecting this unit

The previous two units computed and compared values; this unit combined
comparisons into single yes/no answers, and proved Dart only evaluates as
much of that combination as it actually needs to. Every `bool` produced so
far has just been printed, never used to actually change what the program
does next. The next unit introduces the first construct that does that.

---

## Concept Unit: Choosing a Branch With `if`/`else`

### The Problem

Every unit so far in this lesson runs exactly the same fixed sequence of
`print` calls no matter what — nothing about *which* code executes has
ever depended on a value. A real Sudoku engine needs exactly that: "if
this candidate digit is out of range, refuse the move; otherwise, accept
it." What construct lets a `bool` value actually decide which code runs?

> **Stop and think before reading on:** Given everything shown so far —
> `bool` as a type, and comparison operators that produce one — what do
> you think a construct built around "run this block only when a `bool` is
> `true`" would need as its one required ingredient? What would you expect
> to happen to the rest of the program if that `bool` turns out `false`
> and there's nothing else written to handle that case?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None — shown and predicted only; this snippet's
  output is a direct, literal consequence of a condition already stated on
  the page, with no genuine uncertainty about which branch runs.
- **Change type:** N/A — a disposable, standalone snippet.
- **Location:** N/A.
- **Dependencies:** None beyond the confirmed `dart` install.

### The New Code

```dart
int candidateDigit = 10;
if (candidateDigit > 9) {
  print('Not a valid Sudoku digit');
} else {
  print('Valid range');
}
```

### The Updated Project

Not applicable — a brand-new, freestanding statement with nothing
surrounding it yet.

### Introduce the concept in isolation

Not run — `candidateDigit` is a fixed literal (`10`), Concept Unit 2
already proved `>` for concrete numbers with a real run, and there is no
genuine uncertainty left about which of the two fixed `print` calls
executes. Predicted output, stated from confidence:

```
Not a valid Sudoku digit
```

### Discarding this example

`candidateDigit`'s exact value, `10`, is disposable and chosen only to make
the `if` branch (rather than the `else`) the one that runs; it won't be
referred to again. What carries forward: an `if`'s condition, once
evaluated, picks exactly one of its two attached blocks to run, never both
and never neither.

### Mechanical walkthrough

- **`int candidateDigit = 10;`** — a declaration exactly like Lesson 5's
  own `int` examples: `int` as a type annotation naming the real
  `dart:core` class from this lesson's header, `candidateDigit` as an
  identifier, `10` as an integer literal, assigned via `=`.
- **`if (candidateDigit > 9)`** — the `if` statement: its parentheses hold
  a condition, here `candidateDigit > 9` — the same relational operator
  Concept Unit 2 introduced, here applied to a variable instead of two
  literals, producing a `bool` (`true`, since `10 > 9`).
- **`{ print('Not a valid Sudoku digit'); }`** — the block attached
  directly to the `if`: runs only because the condition above evaluated to
  `true`. `print` here is the same function from this lesson's header,
  handed a string literal (Lesson 5's term, reappearing).
- **`else`** — the `else` clause, attached directly to this same `if`,
  holding the block to run instead, only when the condition had been
  `false`.
- **`{ print('Valid range'); }`** — the `else`'s own block; not run in this
  particular case, because the condition above was `true`, but present as
  the alternative Dart would have run had `candidateDigit` been `9` or
  less.

### CS lens

Choosing between two (or, with `else if`, more) blocks of code to execute
based on a runtime condition is **conditional branching** — alongside
sequence (running statements one after another) and iteration (Lesson 7's
loops), one of the three fundamental building blocks every general-purpose
programming language provides, going all the way back to the earliest
formal models of computation.

```
Also recognized in: a flowchart's own decision diamond, a choose-your-
own-adventure book's "turn to page X if you did Y," a thermostat
deciding whether to turn on the heat, a CPU's own conditional jump
instruction underneath every compiled `if` statement in any language
```

### SE lens

Omitting the `else` entirely (writing only the `if`) is completely legal in
Dart — the program simply continues on to whatever comes after the `if`
block if the condition was `false`, doing nothing extra. The real
tradeoff in *always* writing an explicit `else`, even one that does
nothing surprising, versus leaving it out: an explicit `else` makes "what
happens in the opposite case" visible and deliberate to a future reader,
at the cost of a few extra lines when that opposite case genuinely needs no
handling at all. This project will lean toward writing `else` explicitly
wherever the opposite case is meaningful (as it is here — the honest
answer to "not the invalid case" is "it's the valid case," clearly worth
saying).

### Commands needed

None — this snippet's output is stated from confidence rather than run;
see "Introduce the concept in isolation," above.

### Run it

Not run, by design — `candidateDigit > 9`'s truth (`10 > 9` is `true`) is
already proven in general by Concept Unit 2's real comparison run, and
there's no remaining uncertainty about which fixed `print` call an `if`/
`else` runs once its condition's truth is already known.

### Connecting this unit

This unit introduced the most basic branch: exactly one of two blocks,
chosen by a single condition. The next unit introduces a different
branching construct built for a different shape of problem — choosing
among several fixed possibilities for the *same* value, rather than
testing an arbitrary condition.

---

## Concept Unit: Choosing Among Fixed Possibilities With `switch`

### The Problem

A Sudoku difficulty setting has a small, fixed number of possibilities —
say, `1` for Easy, `2` for Medium, `3` for Hard. Writing that as `if
(difficulty == 1) { ... } else if (difficulty == 2) { ... } else if
(difficulty == 3) { ... }` works, but repeats "compare `difficulty` to
something" over and over. Is there a construct built specifically for
testing one value against a list of fixed possibilities?

> **Stop and think before reading on:** In some languages you may have
> heard of (C, Java, JavaScript), a `switch` "falls through" to the next
> case unless you write `break` — meaning forgetting a `break` silently
> runs the *next* case's code too. Given that Dart's own `if`/`else`
> (previous unit) never runs both branches, would you expect Dart's
> `switch` to follow that same C-style fallthrough-by-default behavior, or
> to match `if`/`else`'s own "exactly one branch, no more" shape instead?
> What do you think actually happens if you write a `switch` case with
> code in it but no `break` at the end?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-06/switch_fallthrough_check.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
switch (1) {
  case 1:
    print('one');
  case 2:
    print('two');
    break;
}
```

### The Updated Project

Not applicable — a brand-new, freestanding statement with nothing
surrounding it yet (the second `switch`, showing deliberate fallthrough,
is this same unit's own next escalation, not a modification of an
existing enclosing structure).

### Introduce the concept in isolation

This is exactly the kind of claim the Verification Rule requires running,
not predicting: whether Dart's `switch` behaves like C's (fall through
unless `break`) or not is a genuine fact about this specific language, and
an initial, wrong guess about it very nearly made it into this lesson
unverified. Real output:

```
one
```

Not `one` followed by `two` — proving Dart's `switch`, unlike C, Java, or
JavaScript, does **not** fall through to the next case by default, even
when a case's block has no `break` at its end. The next escalation proves
fallthrough is still *possible*, just never automatic:

```dart
switch (1) {
  case 1:
    print('one, falling through on purpose');
    continue two;
  two:
  case 2:
    print('two');
    break;
}
```

Real output:

```
one, falling through on purpose
two
```

This proves deliberate fallthrough is available, using `continue` followed
by a **label** (`two`) placed directly before the target `case` — the
explicit mechanism Dart requires in place of C's implicit, `break`-optional
behavior.

### Discarding this example

Neither switch's value (`1`) nor its case bodies represent a real project
concept yet; both are disposable. What carries forward: Dart's `switch`
never falls through implicitly, and `continue label;` is the explicit way
to ask for fallthrough when it's genuinely wanted.

### Mechanical walkthrough

- **`switch (1)`** — the `switch` statement: its parentheses hold the value
  being tested — here the integer literal `1` — against every `case`
  below, in order.
- **`case 1:`** — a `case` clause: names one specific value (`1`) to
  compare the switched-on value against; since `switch (1)`'s value really
  is `1`, this is the branch that matches and runs.
- **`print('one');`** — the same `print` function from this lesson's
  header, run because `case 1` matched.
- **`case 2:`** — a second `case` clause, naming `2`; in the first version
  of this switch, execution reaches this line only if the *first* switch
  fell through — which the real run above proved it does not.
- **`print('two');`**, **`break;`** — `case 2`'s own block, ending with
  `break`, marking this case's end; not reached at all in the first
  switch, since `case 1` alone ran and then the whole statement finished.
- **`continue two;`** (second switch) — deliberately transfers execution
  to whichever `case` the label `two` names, rather than letting the
  switch statement end after `case 1`'s block; this is what makes the
  second switch's real output include both lines where the first switch's
  did not.
- **`two:`** — a label: a name (`two`) attached directly before `case 2:`,
  existing solely so the `continue two;` line above has something specific
  to name as its destination.

### CS lens

Testing one value against a fixed set of named possibilities, rather than
an arbitrary condition, is the same **conditional branching** idea the
previous unit introduced, specialized for the common case where every
branch is testing the *same* value.

```
Also recognized in: a vending machine's own selection logic (one
button, several fixed outcomes), a traffic light controller cycling
through a fixed set of named states, a game's own input handler
mapping a fixed set of key codes to actions
```

### SE lens

C-style implicit fallthrough (run the next case's code too, unless you
remember `break`) has a well-documented real cost: forgetting one `break`
silently runs code that was never meant to run, and that mistake produces
no error at all — it just quietly does the wrong thing, discovered only
when the program misbehaves. Dart's choice — no fallthrough unless you
write `continue label;` explicitly — makes the *rare* case (deliberate
fallthrough) require extra, visible syntax, in exchange for making the
*common* case (each case independent) safe by default instead of unsafe
by default. This project will prefer separate, explicit cases over
relying on fallthrough at all, precisely because relying on it invites a
future reader to wonder whether it was deliberate or a forgotten `break`.

### Commands needed

- **`dart run <file>`** — same command explained in full earlier this
  lesson.

### Run it

Real, verified, both switches' combined output:

```
one
one, falling through on purpose
two
```

Real, saved in full in
`src/docs/flutter/verification/lesson-06/run-log.md`.

### Connecting this unit

This unit proved `switch` behaves differently from what a reasonable guess
based on other languages might expect — exactly the kind of claim this
lesson's own header flagged as needing Lesson 4's symptom-versus-cause
reading skill, here applied to a language's own documented design rather
than a bug. The final unit returns to choosing between exactly two
*values* — the ternary expression, a compact alternative to `if`/`else`
for that specific, narrower job.

---

## Concept Unit: Choosing a Value With a Ternary Expression

### The Problem

The `if`/`else` unit's example ran an entire different `print` statement
depending on a condition — but often, the only thing that actually differs
between the two branches is one small value (here, which string to
display), with everything else identical. Writing a full `if`/`else`, each
branch containing its own separate `print` call, repeats that call twice
for what is really one decision about one value.

> **Stop and think before reading on:** Given `if`/`else` already exists
> and can express this same choice, what would a more *compact* way of
> writing "pick value A if this condition holds, otherwise pick value B"
> need to look like? Would it still need the full `{ }` block syntax
> `if`/`else` uses, or could it fit inside a single expression?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None — shown and predicted only.
- **Change type:** N/A — a disposable, standalone snippet.
- **Location:** N/A.
- **Dependencies:** None beyond the confirmed `dart` install.

### The New Code

```dart
int candidateDigit = 10;
String validity = candidateDigit <= 9 ? 'valid' : 'invalid';
print(validity);
```

### The Updated Project

Not applicable — a brand-new, freestanding pair of statements.

### Introduce the concept in isolation

Not run — `candidateDigit <= 9` is already proven false by the same kind
of real comparison Concept Unit 2 ran (`10 <= 9` is exactly as
predictable as `7 <= 3` was there), leaving no genuine uncertainty about
which of the two literals the ternary expression selects. Predicted
output:

```
invalid
```

### Discarding this example

`candidateDigit`'s value here is disposable, chosen only to make the
ternary's second branch (`'invalid'`) the one selected. What carries
forward: a ternary expression evaluates its condition once and its whole
expression *becomes* one of its two values — never a separate statement
to run, the way each `if`/`else` branch was.

### Mechanical walkthrough

- **`int candidateDigit = 10;`** — the same kind of declaration as the
  previous unit: `int` (this lesson's header, `dart:core`), an identifier,
  an integer literal, assigned via `=`.
- **`String validity = ...;`** — a declaration whose type, `String`
  (this lesson's header, `dart:core`), is what the *entire ternary
  expression on the right* will evaluate to — not one specific literal
  written directly, the way Lesson 5's `String` examples were.
- **`candidateDigit <= 9`** — the ternary expression's condition: the same
  relational operator Concept Unit 2 introduced, here applied to a
  variable instead of two literals, producing `false` (`10` is not `<= 9`).
- **`?`** — marks the end of the condition and the start of the "if true"
  value.
- **`'valid'`** — the value the whole expression becomes if the condition
  had been `true`; a string literal, not used here since the condition was
  `false`.
- **`:`** — separates the "if true" value from the "if false" value.
- **`'invalid'`** — the value the whole expression becomes since the
  condition was `false` — this is what actually gets stored into
  `validity`.
- **`print(validity)`** — the same `print` function from this lesson's
  header, reading the `String` the ternary expression produced.

### CS lens

A ternary expression is **conditional branching** (same idea as `if`/
`else` and `switch`) collapsed down to the level of a single *expression*
rather than a *statement* — the distinction between "a piece of code that
computes and becomes a value" and "a piece of code that performs an
action" is itself a foundational one in language design.

```
Also recognized in: nearly every C-family language's own `? :`
syntax, a spreadsheet's `IF()` function used inside a larger formula
rather than as a whole cell's own content, SQL's `CASE WHEN ... THEN
... ELSE ... END` used inside a single column expression
```

### SE lens

Writing the full `if`/`else` version of this exact choice (assign
`'valid'` inside one block, `'invalid'` inside the other) works
identically, at the cost of repeating "assign to `validity`" in two
separate places instead of once. The ternary expression's real benefit is
exactly that: one assignment, one condition, no duplication of "what is
being assigned to" — its real cost is that it only fits this narrow shape
(choosing between two *values*); the moment either branch needs to do more
than produce one value (run several statements, for instance), `if`/`else`
is the only one of the two that still works, which is why this lesson
teaches both rather than one replacing the other.

### Commands needed

None — this snippet's output is stated from confidence rather than run.

### Run it

Not run, by design — see "Introduce the concept in isolation," above: no
genuine uncertainty remains about a condition already proven false.

### Connecting this unit

This unit closed the loop on three genuinely different branching shapes
this lesson introduced: `if`/`else` for running different blocks of
arbitrary code, `switch` for testing one value against several fixed
possibilities, and the ternary expression for choosing between exactly two
values inline.

---

## Connect the Pieces

Trace one concrete Sudoku-flavored decision through everything this lesson
built: a candidate digit, `10`, arrives for placement. Concept Unit 1's
arithmetic could compute which 3×3 box a given row belongs to using `~/`
and which row-within-box using `%`, neither one accidentally producing a
silently-truncated or wrongly-signed result, both proven for real rather
than assumed. Concept Unit 2's comparison, `candidateDigit > 9`, checks
whether `10` is even a legal Sudoku digit at all, producing the `bool`
`true`. Concept Unit 3's logical operators could combine that check with
others — "in range, **and** the target cell is empty, **and** it doesn't
conflict with the row" — confident that Dart only evaluates as much of
that chain as it actually needs to, proven with a real, unexploded division
by zero. Concept Unit 4's `if`/`else`, given that same `true`, actually
chooses to run `print('Not a valid Sudoku digit')` rather than the
alternative branch. Concept Unit 5's `switch` showed a different, second
branching shape — one built for a fixed difficulty setting rather than an
open-ended condition — and, along the way, corrected a real, reasonable-
sounding wrong guess with a real run rather than letting it stand
unverified. And Concept Unit 6's ternary expression showed the same
`candidateDigit > 9`-shaped question collapsed down to choosing between
exactly two strings, `'valid'` and `'invalid'`, in a single expression
rather than a whole statement.

Every value Lesson 5 taught how to name is, as of this lesson, no longer
inert: it can compute new values, be compared, be combined, and — for the
first time — actually change which code a running program executes next.
Lesson 7 picks up directly from here: what happens when a decision like
this needs to be made not once, but once for every cell on an entire
Sudoku board?
