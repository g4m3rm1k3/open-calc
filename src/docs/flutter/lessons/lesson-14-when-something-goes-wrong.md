# Lesson 14: When Something Goes Wrong

**What you will build:** Standalone Dart snippets that deliberately throw,
catch, and re-throw real problems — a genuine programming mistake (an
out-of-range list index), a genuinely expected bad input (unparseable
text), and a custom, Sudoku-specific problem this lesson defines itself —
proving, for real, what Dart's own `Error` and `Exception` hierarchies
actually distinguish, and what `rethrow` genuinely preserves that a
tempting-looking alternative silently throws away. None of this joins a
real project yet. This lesson also pays off the second half of a promise
Lesson 4 deferred: `throw`, introduced there narrowly, gets its full
treatment here.

**What you need to know first:** Lesson 4's narrow, unexplained `throw`
statement. Lesson 11's `SudokuCell.setValue`, which silently returned
`false` for an invalid move rather than throwing anything — this lesson's
own Concept Unit 4 returns to that exact design choice directly, not as a
contradiction of it. Lesson 12's classes and `implements`, reused for this
lesson's own custom exception class.

**Terms used in this lesson:**

- **`throw`** — reappearing from Lesson 4, given its full, general
  treatment for the first time: immediately stops normal execution at the
  point it's written and hands a value (of any type, though this lesson's
  own custom class and every real `dart:core` example both use one built
  specifically for this purpose) up to whatever code called the
  currently-running function — and, if nothing along that chain catches
  it, further up again, and again, until either something does or the
  entire program stops. Lesson 4 only ever named it in passing, flagged
  for full treatment here.
- **`try`, `catch`** — `try` marks a block of code where a thrown value
  might occur; `catch`, attached directly to it, marks a block to run
  *instead* of letting that thrown value keep propagating upward, if one
  actually occurs inside the `try` block. They exist so a program can
  recover from a real, anticipated problem at the specific point that
  makes sense to handle it, rather than the entire program stopping the
  instant anything is thrown anywhere.
- **`on Type`** — attached directly before `catch`, restricts which kind
  of thrown value that specific `catch` block actually handles, letting a
  different kind of thrown value continue propagating past it entirely
  rather than being caught by a handler that wasn't built for it.
- **`finally`** — a block attached to a `try` (with or without any
  `catch`) that always runs once the `try` block finishes, whether it
  finished normally, threw something that got caught, or threw something
  that's still propagating past this exact `try`/`catch`. It exists for
  cleanup work (closing a file, releasing a resource) that has to happen
  regardless of whether the code it's cleaning up after actually
  succeeded.
- **`rethrow`** — used only inside a `catch` block, re-throws the value
  that was just caught, continuing to propagate it further up exactly as
  if this `catch` block had never caught it at all — but, critically,
  preserving the entire original stack trace, all the way back to where
  it was first thrown. It exists for the specific case of a `catch` block
  that wants to do something (log the problem, clean up partial state) but
  isn't actually the right place to fully handle it, and needs to hand it
  onward without losing the information about where it genuinely came
  from.
- **`Error`** — a real `dart:core` class (and the base of a whole family:
  `RangeError`, `ArgumentError`, `StateError`, and more) representing a
  genuine programming mistake — a bug in the code itself, not a condition
  the program should generally expect and recover from. This lesson's own
  real proof shows it and `Exception` (below) are two genuinely separate
  hierarchies, neither one a specialization of the other.
- **`Exception`** — a real `dart:core` interface (and the base of a
  family: `FormatException`, and this lesson's own custom
  `InvalidMoveException`) representing a condition a well-written program
  should genuinely anticipate and be able to recover from — bad user
  input, a network request that failed — as opposed to `Error`'s own
  genuine bugs.
- **Domain error** — a custom exception type, specific to one particular
  program's own real concepts (not a generic, reusable `dart:core` one),
  representing a problem meaningful specifically to that program's own
  rules — this lesson's own `InvalidMoveException`, representing a Sudoku-
  specific rule violation, not a generic language-level mistake.
- **Error boundary** — the specific place, in a program's own structure,
  where a `try`/`catch` actually lives, deliberately chosen rather than
  scattered reflexively around every single risky-looking line. It exists
  as a real design decision: catching too close to where something is
  thrown often means catching it with too little context to actually
  handle it well; catching too far away (or not at all) risks an entire
  program crashing over a problem one specific, well-placed handler could
  have recovered from cleanly.

**Objects and methods used:**

- **`RangeError`**
  - *What it is:* a real `dart:core` class, thrown automatically when
    code indexes outside a collection's own valid bounds.
  - *Implementation:* a real subclass of `Error` (this lesson's header),
    thrown automatically by `List`'s own index operator (Lesson 9's term,
    reappearing) when given an out-of-range index.
  - *Its use:* Concept Unit 1 triggers one for real, indexing a 3-element
    list at position `10`.
  - *Type:* a class representing one specific, real, thrown runtime
    error.
  - *Responsibility:* signal that code asked for a position that simply
    doesn't exist in the collection it asked from.
  - *Depends on:* an out-of-range index actually being used against a
    real collection.
  - *Connects to:* thrown by `List`'s own index operator internally;
    caught, in this lesson's own code, by `on RangeError catch (e)`.
  - *Shape:* a real, standard-library member of the `Error` family,
    real-proved (not just documented) to be genuinely distinct from the
    `Exception` family below.
- **`FormatException`**
  - *What it is:* a real `dart:core` class, thrown when text that's
    supposed to represent some structured value (a number, here) turns
    out not to.
  - *Implementation:* a real implementer of `Exception` (this lesson's
    header), thrown by, among other things, `int.parse` (a real static
    method, `static int parse(String source, {int? radix})`, already
    verified in Lesson 5) when given text that isn't a valid integer.
  - *Its use:* Concept Unit 1 triggers one for real, calling
    `int.parse('not a number')`.
  - *Type:* a class representing one specific, real, thrown runtime
    condition.
  - *Responsibility:* signal that some text a caller expected to be
    parseable into a structured value genuinely wasn't.
  - *Depends on:* malformed input text actually being parsed.
  - *Connects to:* thrown by `int.parse` internally; caught by `on
    FormatException catch (e)`.
  - *Shape:* a real, standard-library member of the `Exception` family,
    real-proved genuinely distinct from `Error`.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: Two Genuinely Different Kinds of "Wrong"

### The Problem

Reading a Sudoku puzzle's own saved file could fail because the file
itself is corrupted (a condition worth genuinely recovering from — maybe
by loading a backup) — or because this program's own code has an actual
bug, like indexing a list one position too far. Are these the same kind of
"wrong," deserving the same response, or does Dart itself already
distinguish them?

> **Stop and think before reading on:** If a program's own code has a
> genuine bug (like reading past the end of a list it built itself), does
> "catch it and quietly continue" seem like the right response, or does
> the bug itself still need fixing regardless? Compare that to a user
> typing text where a number was expected — is *that* also a bug in the
> program's own code?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-14/error_vs_exception_check.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
try {
  List<int> digits = [1, 2, 3];
  print(digits[10]);
} catch (e) {
  print('is Error: ${e is Error}');
  print('is Exception: ${e is Exception}');
}
```

### The Updated Project

Not applicable — a brand-new, freestanding snippet.

### Introduce the concept in isolation

Whether `Error` and `Exception` are genuinely separate hierarchies, or one
secretly extends the other, is worth real proof — run for real:

```
is Error: true
is Exception: false
```

The identical check, run against a `FormatException` instead (Concept
Unit 2's own error), produces the opposite:

```
is Error: false
is Exception: true
```

This proves **`Error`** and **`Exception`** (this lesson's header) are two
genuinely separate real hierarchies — neither a specialization of the
other — not merely two names for the same underlying idea.

### Discarding this example

This exact check is disposable — a one-time proof. What carries forward:
an out-of-range list index throws a real `Error`; unparseable text thrown
from `int.parse` is a real `Exception` — the two are structurally
distinct kinds of "wrong" in Dart itself, not just in naming convention.

### Mechanical walkthrough

- **`digits[10]`** — the index operator (Lesson 9's term, reappearing) on
  a 3-element `List`; `10` is out of range, triggering a real `RangeError`
  (this lesson's header).
- **`catch (e)`** — Lesson 6's real bug-versus-condition distinction made
  concrete: catching with no `on Type` at all (this lesson's next unit
  covers restricting it) catches anything thrown, here used purely to
  inspect what was actually caught.
- **`e is Error`, `e is Exception`** — the `is` operator (Lesson 13's
  term, reappearing), each checking `e`'s own real, concrete type against
  one of the two candidate hierarchies.

### CS lens

Distinguishing a genuine programming defect (a bug the code itself
shouldn't have) from a condition the program should genuinely anticipate
and recover from (bad input, a missing file) is a real, foundational
distinction in error-handling design, not unique to Dart.

```
Also recognized in: Java's own checked vs. unchecked exceptions
(a related, if not identical, distinction); a car's own "check
engine" light (something is genuinely broken) versus a low-fuel
warning (an entirely expected, recoverable condition); a restaurant
kitchen's distinction between a burnt dish (a mistake to fix) and
running out of a menu item (an expected, handleable situation)
```

### SE lens

Treating every "wrong" result identically — catching and quietly
recovering from *everything*, bugs included — has a real, dangerous cost:
a genuine bug (an off-by-one error indexing a list) gets silently papered
over instead of actually fixed, potentially masking it for a long time.
Dart's separate `Error`/`Exception` hierarchies exist so code can
deliberately choose to catch conditions it genuinely expects
(`Exception`s) while generally letting a real `Error` propagate and crash
loudly — the exact signal a developer needs to notice and fix the actual
bug, rather than a error swallowed silently.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Real, verified output, both checks:

```
is Error: true
is Exception: false
```

```
is Error: false
is Exception: true
```

Real, saved in full in
`src/docs/flutter/verification/lesson-14/run-log.md`.

### Connecting this unit

This unit proved two genuinely different real hierarchies exist. The next
unit shows how to actually catch and recover from either one.

---

## Concept Unit: Catching a Specific Problem

### The Problem

The previous unit's bare `catch (e)` caught anything at all, indiscriminately.
A real program usually wants to recover from *one specific* kind of
problem, while letting anything else (especially a genuine `Error`, per
the previous unit's own SE lens) keep propagating.

> **Stop and think before reading on:** If `catch` could be restricted to
> only one specific type of thrown value, what do you think should happen
> to a *different* type of thrown value inside the same `try` block — does
> it get caught anyway, or does it keep propagating past this specific,
> narrower `catch`?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-14/exceptions_demo.dart`
  — created, containing this unit's `try`/`on`/`catch` code; Concept
  Units 3–5 will each add their own code to related files, all reasoned
  about together in this lesson's own closing units.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
try {
  List<int> digits = [1, 2, 3];
  print(digits[10]);
} on RangeError catch (e) {
  print('caught range error: ${e.runtimeType}');
}

try {
  int.parse('not a number');
} on FormatException catch (e) {
  print('caught format error: ${e.runtimeType}');
}
```

### The Updated Project

Not applicable — two brand-new, freestanding `try`/`catch` blocks.

### Introduce the concept in isolation

Real, verified output:

```
caught range error: RangeError
caught format error: FormatException
```

Each `on Type` correctly matched its own real thrown value, and each was
handled — proven, alongside the earlier unit's own program-continues
proof, in this lesson's full combined run (Concept Unit 4's "Run it").

### Discarding this example

Nothing discarded — real, permanent content, reused directly by Concept
Unit 4.

### Mechanical walkthrough

- **`try { ... }`** — marks the block where a thrown value is expected and
  handled; `digits[10]` throws a real `RangeError` (this lesson's header)
  the instant it runs, immediately skipping the rest of the `try` block.
- **`on RangeError catch (e)`** — `on RangeError` (this lesson's term)
  restricts this handler to only `RangeError` (or a subtype); `catch (e)`
  binds the actual thrown value to `e`, an identifier (Lesson 5's term,
  reappearing) usable inside the block that follows.
- **`e.runtimeType`** — `Object.runtimeType` (Lesson 10's term,
  reappearing), here confirming, in the printed output itself, exactly
  which real type was caught.
- **The second `try`/`on`/`catch` pair** — the identical construct,
  restricted instead to `FormatException`, matching what `int.parse`
  actually throws for unparseable text.

### CS lens

Restricting a handler to a specific thrown type, rather than catching
indiscriminately, is **selective exception handling** — letting a program
express "I know how to recover from *this specific* problem" without
implicitly claiming to also know how to recover from every other kind of
problem that might occur in the same block.

```
Also recognized in: Java's and C#'s own multiple, typed `catch`
clauses; a hospital's own triage — a specific team handles a
specific kind of emergency, rather than one generic responder
attempting everything; a customer service system routing a billing
complaint to billing, not to technical support
```

### SE lens

A bare `catch (e)` (the previous unit's own version) catches everything,
including genuine bugs the previous unit's own SE lens argued should
generally be allowed to crash loudly instead. Restricting to `on Type`
lets a program recover from exactly the conditions it genuinely
anticipated, while anything unexpected (a real `Error`, or an `Exception`
type this specific `try` block never considered) keeps propagating —
exactly the discipline this lesson's final unit names directly as an
**error boundary**.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Real, verified output (this unit's own two blocks, in isolation; the
complete file, including Concept Unit 4's own custom exception, is run
together and shown in full in that unit's "Run it" step):

```
caught range error: RangeError
caught format error: FormatException
```

### Connecting this unit

This unit caught two real, `dart:core`-provided problems by their
specific type. The next unit builds a problem specific to this
curriculum's own Sudoku rules, rather than relying on `dart:core`'s own
general-purpose ones.

---

## Concept Unit: A Problem Specific to This Program's Own Rules

### The Problem

Lesson 11's `SudokuCell.setValue` silently returned `false` for an
invalid move — no thrown value at all, just a `bool` a caller has to
remember to check. Neither `RangeError` nor `FormatException` means
anything close to "this Sudoku digit is out of range" — a truly
domain-specific problem needs its own, custom type.

> **Stop and think before reading on:** Given Lesson 12's own classes,
> what do you think the smallest possible class needs to declare to be
> usable with Dart's own `throw`/`catch` machinery, the same way
> `RangeError`/`FormatException` already are?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-14/exceptions_demo.dart`
  — modified, adding a custom exception class and a function that throws
  it.
- **Change type:** Add (new class, new function).
- **Location:** At the top of the file, before the two `try`/`catch`
  blocks from Concept Unit 2.
- **Dependencies:** The file created in Concept Unit 2.

### The New Code

```dart
class InvalidMoveException implements Exception {
  final String message;
  InvalidMoveException(this.message);

  @override
  String toString() => 'InvalidMoveException: $message';
}

void placeDigit(int digit) {
  if (digit < 1 || digit > 9) {
    throw InvalidMoveException('$digit is not a valid Sudoku digit');
  }
  print('placed $digit');
}
```

And, wrapped around two calls to it:

```dart
try {
  placeDigit(7);
  placeDigit(20);
} on InvalidMoveException catch (e) {
  print('caught: $e');
}
```

### The Updated Project

The complete, final file for this lesson's core exception demonstrations
(new content marked; everything from Concept Unit 2 continues below,
unchanged):

```dart
 1: class InvalidMoveException implements Exception {   // ← new
 2:   final String message;                             // ← new
 3:   InvalidMoveException(this.message);                 // ← new
 4:
 5:   @override                                          // ← new
 6:   String toString() => 'InvalidMoveException: $message';  // ← new
 7: }                                                    // ← new
 8:
 9: void placeDigit(int digit) {                         // ← new
10:   if (digit < 1 || digit > 9) {                       // ← new
11:     throw InvalidMoveException('$digit is not a valid Sudoku digit');  // ← new
12:   }                                                   // ← new
13:   print('placed $digit');                             // ← new
14: }                                                     // ← new
15:
16: void main() {
17:   try {                                                // ← new
18:     placeDigit(7);                                     // ← new
19:     placeDigit(20);                                    // ← new
20:   } on InvalidMoveException catch (e) {                 // ← new
21:     print('caught: $e');                               // ← new
22:   }                                                    // ← new
23:
24:   try {
25:     List<int> digits = [1, 2, 3];
26:     print(digits[10]);
27:   } on RangeError catch (e) {
28:     print('caught range error: ${e.runtimeType}');
29:   }
30:
31:   try {
32:     int.parse('not a number');
33:   } on FormatException catch (e) {
34:     print('caught format error: ${e.runtimeType}');
35:   }
36:
37:   print('program continues normally after all three catches');
38: }
```

### Introduce the concept in isolation

Real, verified output for this unit's own two lines:

```
placed 7
caught: InvalidMoveException: 20 is not a valid Sudoku digit
```

`placeDigit(7)` succeeds and prints normally; `placeDigit(20)` throws the
custom `InvalidMoveException`, caught by `on InvalidMoveException catch
(e)`, and the printed text — `InvalidMoveException: 20 is not a valid
Sudoku digit` — is `e`'s own overridden `toString()` (Lesson 13's term,
reappearing via `Object`), not some generic default.

### Discarding this example

Nothing discarded — real, permanent content, part of this lesson's
complete, final file.

### Mechanical walkthrough

- **`class InvalidMoveException implements Exception`** — `implements`
  (Lesson 12's term, reappearing): `Exception` is itself just an
  interface (this lesson's header) with no required members at all — any
  class can fulfill it — so a domain error (this lesson's term) can be
  entirely custom while still being usable with `on Exception`, `throw`,
  and `catch` exactly like a real `dart:core` one.
- **`final String message;`, `InvalidMoveException(this.message);`** — a
  field and constructor (both Lesson 11's terms, reappearing), same shape
  as every earlier lesson's own classes.
- **`@override String toString() => ...;`** — overriding `Object`'s own
  `toString()` (Lesson 13's term, reappearing pattern, applied to a
  different method), controlling exactly what text represents this
  exception when it's printed.
- **`throw InvalidMoveException('$digit is not a valid Sudoku digit');`**
  — `throw` (this lesson's term), given a genuine custom object, built
  with string interpolation (Lesson 4's term, reappearing) describing
  exactly which digit failed and why.
- **`on InvalidMoveException catch (e)`** — the same restricted-catch
  syntax Concept Unit 2 introduced, here matching this lesson's own
  custom type instead of a `dart:core` one.

### CS lens

Modeling a problem specific to a program's own domain rules as its own
real type, rather than reusing a generic `dart:core` one, is the same
**modeling** idea Lesson 11's own `SudokuCell` already applied to data —
here applied to *failure*.

```
Also recognized in: an e-commerce system's own `OutOfStockException`
rather than a generic error; a banking system's own
`InsufficientFundsException`; a parser's own `SyntaxError` specific
to the exact language it parses, rather than a bare, generic failure
```

### SE lens

This is the moment worth returning to Lesson 11's own design choice
directly: `SudokuCell.setValue` returns `false` for an invalid digit,
never throwing anything at all — a genuinely different strategy from
this unit's own `placeDigit`, which throws. Both are legitimate, real
choices, not one right and one wrong: a `bool` return communicates "this
specific operation might reasonably fail" as part of its own type
signature, cheap to check locally, easy to silently ignore if a caller
forgets; throwing communicates "this is exceptional, and by default will
be *impossible to silently ignore*" (an uncaught exception crashes loudly,
per Lesson 10's own real, run-verified `dynamic` crash), at the real cost
of needing an explicit `try`/`catch` anywhere the failure genuinely needs
handling rather than propagating. This project will prefer a `bool` (or,
once Lesson 16 introduces it, an even more expressive optional-value
style) for failures a caller is expected to check routinely, and a thrown
domain error for failures that indicate something has already gone wrong
badly enough that silently continuing would be worse than crashing.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire exception-
handling file:

```
placed 7
caught: InvalidMoveException: 20 is not a valid Sudoku digit
caught range error: RangeError
caught format error: FormatException
program continues normally after all three catches
```

Real, saved in full in
`src/docs/flutter/verification/lesson-14/run-log.md`.

### Connecting this unit

This unit built a genuine, custom domain error and reflected honestly on
when throwing is the right choice versus Lesson 11's own bool-return
strategy. The next unit shows what happens when a `catch` block needs to
pass a problem onward instead of fully handling it.

---

## Concept Unit: Passing a Problem Onward Without Losing Its Origin

### The Problem

Sometimes a `catch` block needs to do *something* (log the problem, clean
up) but isn't actually the right place to fully handle it — the problem
still needs to keep propagating upward. Writing `throw e;` (re-throwing
the same caught value) seems like the obvious way — but is it exactly the
same as never having caught it at all?

> **Stop and think before reading on:** If an exception is thrown deep
> inside function A, caught in function B (which calls A), and then
> re-thrown from inside that same `catch` block, what would you want a
> later debugger or crash report to be able to show: where the exception
> was re-thrown from (inside B), or the complete original path, starting
> from exactly where it was first thrown (inside A)?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-14/rethrow_check.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
void original() {
  throw Exception('boom');
}

void usingRethrow() {
  try {
    original();
  } catch (e) {
    rethrow;
  }
}

void usingThrowE() {
  try {
    original();
  } catch (e) {
    throw e;
  }
}
```

### The Updated Project

Not applicable — a brand-new, freestanding pair of functions, each with
its own independent `try`/`catch`.

### Introduce the concept in isolation

This is exactly the kind of invisible-behavior claim the Verification
Rule requires proof for — run for real, catching each one's own
propagated exception at the very top and printing its real stack trace:

```
--- rethrow stack ---
#0      original (file:///.../rethrow_check.dart:2:3)
#1      usingRethrow (file:///.../rethrow_check.dart:7:5)
#2      main (file:///.../rethrow_check.dart:23:5)

--- throw e stack ---
#0      usingThrowE (file:///.../rethrow_check.dart:17:5)
#1      main (file:///.../rethrow_check.dart:30:5)
```

(Isolate/runtime-internal frames beneath `main` omitted here for space;
the complete real output is saved in full.) The `rethrow` version's own
first frame is `original` — the *exact original throw site* — proving
`rethrow` preserved the complete original trace. The `throw e` version's
own first frame is instead `usingThrowE`, the re-throw site itself — the
`original` frame is genuinely gone, proving `throw e` silently discards
the original trace and starts a brand-new one.

### Discarding this example

`original`/`usingRethrow`/`usingThrowE`'s own specific bodies are
disposable. What carries forward: `rethrow`, used inside a `catch` block,
preserves the complete original stack trace; `throw e` (re-throwing the
same caught value with an ordinary `throw`) discards it, starting a new
one from the re-throw point instead.

### Mechanical walkthrough

- **`throw Exception('boom');`** — `throw` (this lesson's term), given a
  real, plain `dart:core` `Exception`, thrown from deep inside `original`.
- **`try { original(); } catch (e) { rethrow; }`** — `original()` throws;
  `catch (e)` catches it, binding it to `e`; **`rethrow`** (this lesson's
  term) — written with no expression at all, unlike `throw` — re-throws
  the exact same caught value, continuing its propagation as though this
  `catch` had never intercepted it, complete original trace intact.
- **`try { original(); } catch (e) { throw e; }`** — the identical setup,
  except this `catch` block uses an ordinary **`throw`** (this lesson's
  term) given `e` as its own new expression — legal Dart, but, proven
  above, this creates a genuinely *new* throw, starting its own stack
  trace fresh from this exact line, rather than continuing the original
  one.

### CS lens

Preserving a problem's complete causal history as it propagates through
several layers of a program, rather than only knowing where it was most
recently observed, is directly related to **stack unwinding** — the
runtime mechanism underneath every exception this lesson has thrown,
walking back up through each function call that led to the current point.

```
Also recognized in: a crash report's own full call stack, letting an
engineer trace a bug back to its real origin rather than only the
last function that happened to touch it; a "chain of custody" record
in a real investigation, preserving every step evidence passed
through rather than only its most recent location; a delivery
package's own tracking history, showing every stop, not just the
most recent scan
```

### SE lens

`throw e;`'s real, easy-to-miss cost is exactly what this unit's own
proof demonstrated: a debugging session (or an automated crash report) that
only sees `usingThrowE`'s own stack trace has genuinely lost the
information that the problem actually originated inside `original` — a
real, practical cost when tracking down why something failed, especially
in a larger program where the re-throwing `catch` block might sit several
layers away from the true origin. `rethrow`'s cost is nothing at all
beyond a slightly less familiar keyword — this project will always prefer
it over `throw e;` for exactly this reason, in every `catch` block that
needs to pass a problem onward rather than fully resolve it.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output (both stack traces, in full):

```
--- rethrow stack ---
#0      original (file:///.../rethrow_check.dart:2:3)
#1      usingRethrow (file:///.../rethrow_check.dart:7:5)
#2      main (file:///.../rethrow_check.dart:23:5)
#3      _delayEntrypointInvocation.<anonymous closure> (dart:isolate-patch/isolate_patch.dart:313:19)
#4      _RawReceivePort._handleMessage (dart:isolate-patch/isolate_patch.dart:192:12)

--- throw e stack ---
#0      usingThrowE (file:///.../rethrow_check.dart:17:5)
#1      main (file:///.../rethrow_check.dart:30:5)
#2      _delayEntrypointInvocation.<anonymous closure> (dart:isolate-patch/isolate_patch.dart:313:19)
#3      _RawReceivePort._handleMessage (dart:isolate-patch/isolate_patch.dart:192:12)
```

Real, saved in full in
`src/docs/flutter/verification/lesson-14/run-log.md`.

### Connecting this unit

This unit proved, with real, contrasted stack traces, exactly what
`rethrow` preserves that a tempting-looking `throw e;` silently discards.
The final unit steps back to where, deliberately, a `try`/`catch` should
actually live in a program's own structure.

---

## Concept Unit: Choosing Where to Actually Catch a Problem

### The Problem

Every unit in this lesson so far caught a problem immediately, right next
to where it occurred. A real program is built from many layers — a
Sudoku engine's own move-validation logic, called from a UI layer, called
from a top-level event handler. Should every one of those layers wrap
every risky call in its own `try`/`catch`, or is there a more deliberate
place this belongs?

> **Stop and think before reading on:** If every single function in a
> call chain caught and "handled" every exception immediately, what real
> information might get lost by the time a problem reaches whichever
> layer actually knows what a *user* should see or be told? Compare that
> to catching *nothing at all* until the very outermost layer — what real
> problem does that approach risk instead?

### Project Change

- **Reference Source:** No reference counterpart — this unit reasons
  about already-real code from earlier units in this lesson, plus a real,
  already-run `finally` proof, rather than introducing a large new
  example of its own.
- **Files affected:** `src/docs/flutter/verification/lesson-14/finally_check.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
try {
  print('trying');
  throw Exception('boom');
} catch (e) {
  print('caught');
} finally {
  print('finally always runs');
}
```

### The Updated Project

Not applicable — a brand-new, freestanding snippet.

### Introduce the concept in isolation

Whether `finally` genuinely runs regardless of whether an exception
actually occurred is worth real proof — run for real, both with and
without an exception:

```
trying
caught
finally always runs
```

```
trying again, no error this time
finally still runs with no error
```

Both real runs show `finally`'s own block executing — once after a real,
caught exception, and once with no exception at all — proving it's not
conditional on failure.

### Discarding this example

Nothing discarded — real, run-verified proof.

### Mechanical walkthrough

- **`try { ... } catch (e) { ... } finally { ... }`** — `finally` (this
  lesson's term) attached after a `catch`; its own block runs after
  either the `try` block finishes normally or the `catch` block finishes
  handling a caught exception — proven above to run in both real cases.

### CS lens

Deciding, deliberately, at which layer of a program a `try`/`catch`
actually lives — rather than reflexively wrapping every risky line, or
never catching anything until a program's very outermost layer — is an
**error boundary** (this lesson's own term): a chosen seam where a
specific kind of problem is meant to actually be resolved, with
everything below it free to simply let problems propagate.

```
Also recognized in: a building's own fire doors, placed
deliberately at specific structural boundaries rather than randomly
throughout; a company's own escalation policy, routing a problem to
whichever specific level actually has the authority and context to
resolve it, not the first person who happens to notice it; a
circuit breaker, placed at a panel rather than inside every single
appliance
```

### SE lens

Catching immediately, everywhere a problem could occur, risks exactly what
this unit's own Socratic question named: a low-level function catching
and "handling" (often: silently swallowing) a problem before a caller
several layers up ever learns anything went wrong at all — the caller
simply sees things silently proceed as if nothing failed. Catching nothing
until the outermost layer risks the opposite: by the time a problem
surfaces, whatever specific context would have let it be recovered
cleanly (which Sudoku cell, which specific input) may already be lost, and
the entire program may have already done irreversible partial work based
on a false assumption that an earlier step succeeded. This project's own
convention going forward: let a low-level function (Lesson 11's own
`setValue`, this lesson's own `placeDigit`) signal failure honestly — by
return value or by throwing, whichever this lesson's Concept Unit 4
already reasoned through — and catch deliberately at the layer that
actually has enough context to do something useful with that failure,
using `rethrow` (this lesson's Concept Unit 3) at any layer in between
that needs to act on a problem without fully resolving it.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output, both cases:

```
trying
caught
finally always runs
trying again, no error this time
finally still runs with no error
```

Real, saved in full in
`src/docs/flutter/verification/lesson-14/run-log.md`.

### Connecting this unit

This unit closed this lesson on where a `try`/`catch` actually belongs,
tying every earlier unit's own real proof into one deliberate design
principle.

---

## Connect the Pieces

Trace one Sudoku-flavored failure through everything this lesson built.
Concept Unit 1 proved, for real, that Dart genuinely distinguishes a
programming bug (`RangeError`, a real `Error`) from an anticipated,
recoverable condition (`FormatException`, a real `Exception`) — two
separate hierarchies, not one degree of the same idea. Concept Unit 2
caught each by its own specific type, letting anything else keep
propagating rather than swallowing every problem indiscriminately.
Concept Unit 3 built this curriculum's own domain error,
`InvalidMoveException`, and returned honestly to Lesson 11's own
bool-returning `setValue` — two legitimate, different strategies, not one
right and one wrong. Concept Unit 4 proved, with two real, directly
contrasted stack traces, that `rethrow` preserves a problem's complete
original path while a tempting `throw e;` silently discards it. And
Concept Unit 5 closed on where, deliberately, a `try`/`catch` actually
belongs in a program's own structure — proven, alongside a real
`finally` guarantee, rather than only asserted.

Lesson 4 deferred `throw` all the way back at the very start of this
curriculum's own Dart content; it's fully paid off now, alongside
`try`/`catch`/`on`/`finally`/`rethrow`, this curriculum's own custom
domain error, and a real, considered answer to when each strategy for
signaling failure actually fits. Lesson 15 turns to a different lens on
everything this phase has built: functions with no side effects,
immutability, and why those ideas matter specifically for games.
