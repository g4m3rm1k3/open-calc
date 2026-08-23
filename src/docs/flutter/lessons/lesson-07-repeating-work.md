# Lesson 7: Repeating Work Without Repeating Code

**What you will build:** Standalone Dart snippets that each repeat a small
piece of work a controlled number of times — summing numbers, multiplying
numbers, walking a small list, and visiting every cell of a small grid —
using three different repetition constructs (`while`, `for`, `for-in`), one
of them nested inside another. None of this joins a real project yet. The
subject underneath: every branch Lesson 6 taught runs its chosen code
*once*; this lesson is where a program first runs the same code many times
without that code being physically retyped once per repetition.

**What you need to know first:** Lesson 5's `int`, `var`, and its real,
run-verified sign behavior of `%`. Lesson 6's comparison operators (every
loop's own condition is one) and its `if`-that-never-runs-both-branches
contrast, useful here since a loop's own body, unlike an `if` block, can
run zero, one, or many times depending on its condition. Lesson 4's string
interpolation (`'$row,$col'`), reused in this lesson's nested-loop unit.

**Terms used in this lesson:**

- **Identifier** — reappearing from Lesson 5, restated in full: the name a
  person chooses for a variable when declaring it.
- **Declaration** — reappearing from Lesson 5, restated in full: the
  statement introducing a variable for the first time, with a type and a
  name.
- **Assignment (`=`)** — reappearing from Lesson 5, restated in full: the
  operator that stores a value into a variable.
- **Integer literal** — reappearing from Lesson 5, restated in full: a
  whole number written directly into source code with no decimal point.
- **`var`** — reappearing from Lesson 5, restated in full: a keyword used
  in place of an explicit type name, telling Dart to infer a variable's
  type from its initializer — the type is then locked exactly as strictly
  as if it had been written by hand.
- **String interpolation (`'$name'` / `'${expression}'`)** — reappearing
  from Lesson 4, restated in full: embedding a variable or expression
  directly inside a string literal using `$`, producing a new string built
  from that expression's own text form (itself calling that expression's
  `toString()` internally). Used in this lesson's nested-loop unit to
  build one string per grid cell out of two loop variables.
- **`while` loop** — repeats one block of code for as long as a condition
  keeps evaluating to `true`, checking that condition again before every
  single repetition, including the very first one. It exists as the most
  basic repetition construct: "keep doing this until a fact stops being
  true," with no built-in assumption about how many repetitions that will
  turn out to take.
- **`for` loop** — a three-part repetition construct: an initializer (run
  once, before the first check), a condition (checked before every
  repetition, same role as `while`'s own condition), and an increment
  (run after every repetition's body, before the next check). It exists
  for the extremely common case of "repeat a fixed number of times,
  counting as you go," bundling all three moving pieces into one place
  instead of scattering them (an initializer above the loop, a condition
  in the loop, an increment at the bottom of the loop body) the way a
  `while` loop doing the same job would require.
- **`for-in` loop** — repeats one block of code once for each value already
  present in an existing collection of values, binding a fresh variable to
  each one in turn, with no separate condition or increment to write at
  all. It exists for the equally common, different case of "do this once
  per existing item," where a plain `for` loop's counting logic (start at
  zero, stop before the length, increment by one) would just be indirect
  machinery standing between the code and the values it actually cares
  about.
- **Compound assignment operator (`+=`, `*=`)** — a combined operator and
  assignment in one: `x += y` means "compute `x + y`, then store the
  result back into `x`," and `x *= y` means the same for multiplication.
  It exists so "update a variable based on its own current value" — an
  extremely common operation inside a loop body — doesn't require writing
  the variable's own name twice (`x = x + y`).
- **Increment operator (`++`)** — shorthand for "add exactly `1` to this
  variable and store the result back into it" (`i++` as its own complete
  statement is equivalent to `i += 1`). It exists because incrementing a
  counter by exactly one is common enough, specifically inside a loop's
  own increment clause, to deserve its own two-character shorthand. Used
  in this lesson only as a standalone statement, where it behaves
  identically whether written before (`++i`) or after (`i++`) the
  variable — that distinction only matters when the expression's own
  resulting value is *also* used somewhere else in the same statement,
  which this lesson never does.
- **List literal (`[element, element, ...]`)** — a fixed sequence of
  values written directly into source code between square brackets. This
  lesson uses one narrowly, only as something for its `for-in` unit to
  iterate over; a `List`'s real declared shape and its full set of
  operations get their own full, formal treatment starting in Lesson 9
  (Collections) — not here.
- **Nested loop** — one loop written entirely inside the body of another,
  so the inner loop runs its own full range of repetitions once for
  *every single* repetition of the outer loop, rather than once overall.
  It exists for problems that are naturally two-dimensional (a grid, a
  table, a Sudoku board's own rows and columns), where one loop alone
  could only walk one dimension.
- **Loop invariant** — a fact about a loop's own state (typically its
  accumulating result and its counter) that is true before the loop's
  first repetition, remains true after every single repetition, and,
  combined with the loop's own stopping condition, is what lets you reason
  about what the loop guarantees once it finishes — without tracing every
  individual repetition by hand. It exists because "does this loop
  actually compute what I think it computes, for every possible input, not
  just the one I happened to test" is a question tracing individual
  repetitions can never fully answer, but a true invariant can.

**Objects and methods used:**

- **`print`**
  - *What it is:* the same function every earlier lesson has used —
    Dart's basic way to show text to whoever is running the program.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every loop in this lesson prints its own final,
    accumulated result once the loop itself has finished.
  - *Type:* a top-level function in `dart:core`.
  - *Responsibility:* convert one value to text and write it, plus a
    newline, to standard output.
  - *Depends on:* one argument — in this lesson, always a loop's own
    accumulated result, or, in the nested-loop unit, an interpolated
    string built from two loop counters.
  - *Connects to:* called after each loop in this lesson finishes (or,
    in the nested-loop unit, once per innermost repetition); hands
    finished text to the Dart runtime's I/O layer, same as every earlier
    lesson.
  - *Shape:* `dart:core`'s public standard-library surface, unchanged
    since Lesson 1.
- **`int`**
  - *What it is:* the same real `dart:core` class Lesson 5 introduced,
    reused here for every loop counter and accumulator.
  - *Implementation:* `abstract final class int extends num` (verified in
    Lesson 5).
  - *Its use:* every loop in this lesson counts or accumulates using one.
  - *Type:* an abstract class extending `num`.
  - *Responsibility:* represent one whole-number value and provide the
    arithmetic this lesson's loop bodies perform on it every repetition.
  - *Depends on:* an integer literal, here always `0` or a small fixed
    starting value.
  - *Connects to:* incremented or accumulated into by this lesson's
    compound-assignment and increment operators every repetition; read
    by `print` once each loop finishes.
  - *Shape:* `dart:core` standard-library surface, unchanged from Lesson
    5.

---

## Concept Unit: Repeating Until a Fact Stops Being True

### The Problem

Summing the numbers `0` through `4` by hand means writing `0 + 1 + 2 + 3 +
4` — five literal numbers, in the source code, one per value. A Sudoku
engine will eventually need to sum or check far more than five values
(every cell in an entire board), and writing one literal per value clearly
doesn't scale. What construct repeats the *same* piece of code, changing
only a counter, instead of writing the code out once per repetition?

> **Stop and think before reading on:** Given Lesson 6's `if` only ever
> checks its condition once, what would a construct need to do
> differently to run the same block *more than once*? Specifically: would
> it need to check its condition again after each repetition, or would
> checking it just the one time, up front, be enough to guarantee the
> loop eventually stops?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-07/loops_demo.dart`
  — created, containing this unit's `while` loop; Concept Units 2, 3, and
  4 will each add their own code to this same file before it's run once,
  as one real batch.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
int sum = 0;
int i = 0;
while (i < 5) {
  sum += i;
  i++;
}
print(sum);
```

### The Updated Project

Not applicable — this is the file's brand-new starting content.

### Introduce the concept in isolation

This loop's exact final value is confidently predictable by hand (`0 + 1 +
2 + 3 + 4 = 10`), but the schema's own execution-trace requirement calls
for the *actual* sequence of real values, not a restated formula — so this
was run for real, batched with the rest of this lesson's loops:

```
10
```

Full real, iteration-by-iteration trace of how that `10` was actually
produced:

```
Before loop:  sum = 0, i = 0
Iteration 1:  condition `i < 5` → 0 < 5 → true. sum = 0 + 0 = 0. i becomes 1.
Iteration 2:  condition `i < 5` → 1 < 5 → true. sum = 0 + 1 = 1. i becomes 2.
Iteration 3:  condition `i < 5` → 2 < 5 → true. sum = 1 + 2 = 3. i becomes 3.
Iteration 4:  condition `i < 5` → 3 < 5 → true. sum = 3 + 3 = 6. i becomes 4.
Iteration 5:  condition `i < 5` → 4 < 5 → true. sum = 6 + 4 = 10. i becomes 5.
Iteration 6:  condition `i < 5` → 5 < 5 → false. Loop stops; sum stays 10.
```

Each `true` result is the same relational operator Lesson 6 introduced,
here re-checked fresh before every single repetition — including the
sixth check, which is what actually stops the loop; nothing about `while`
limits how many times it re-checks.

### Discarding this example

This exact sum (of `0` through `4`) is disposable — a stand-in chosen only
to make the trace above short enough to show in full. What carries
forward: `while` re-checks its condition before every repetition,
including the one that finally stops it, and a variable declared *before*
the loop (`sum`, `i`) keeps its updated value across every repetition,
rather than resetting each time.

### Mechanical walkthrough

- **`int sum = 0;`** — a declaration: `int` (this lesson's header,
  `dart:core`), the identifier `sum`, the integer literal `0`, assigned via
  `=` — all reappearing from Lesson 5, restated above. This variable exists
  *before* the loop specifically so its value survives from one repetition
  to the next; a variable declared *inside* the loop body instead would be
  recreated fresh every repetition, losing its accumulated value.
- **`int i = 0;`** — the same kind of declaration, here for the loop's own
  counter, starting at `0`.
- **`while (i < 5)`** — the `while` loop: its parentheses hold a condition,
  the same relational operator Lesson 6 introduced, here checked against a
  variable instead of two literals.
- **`{ sum += i; i++; }`** — the loop's own block, run in full once per
  repetition where the condition was `true`: `sum += i` is the compound
  assignment operator, adding `i`'s current value into `sum` and storing
  the result back into `sum`; `i++` is the increment operator, adding `1`
  to `i` and storing the result back into `i` — this is the specific line
  that eventually makes the condition `false` and stops the loop.
- **`print(sum)`** — the same `print` function from this lesson's header,
  run exactly once, only after the loop has fully finished — not once per
  repetition, since it sits *after* the closing `}` of the `while` block.

### CS lens

Repeating a block of code while a condition holds is **iteration** —
alongside sequence and branching (Lesson 6), the third of the fundamental
building blocks every general-purpose language provides.

```
Also recognized in: a `while` loop's own direct ancestor, the GOTO-
based repeat-until-flag-changes pattern in early assembly programs;
a thermostat continuously re-checking room temperature; a game's own
main loop, which is itself one giant `while` that keeps running as
long as the game hasn't been closed
```

### SE lens

A `while` loop's condition could, in principle, never become `false` — an
**infinite loop**, a real and common bug, not a hypothetical one: if this
unit's own code had written `i--` instead of `i++`, `i` would count down
forever and `i < 5` would never stop holding, freezing the program with no
error message at all, just a process that never finishes. `while`'s real
cost is exactly that it enforces nothing about eventually stopping — the
next unit's `for` loop bundles the counter's own start, check, and update
into one place specifically to make forgetting the update (and so the
stop condition) visually harder to do by accident.

### Commands needed

- **`dart run <file>`** — the same real command from Lesson 1: translates
  and executes a `.dart` file immediately.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's code is combined with Concept Units 2, 3, and 4's own code into one
file, run once. The complete real output is shown in full in Concept Unit
4's own "Run it" step, and saved in
`src/docs/flutter/verification/lesson-07/run-log.md`.

### Connecting this unit

This unit's own SE lens ended on a real risk: forgetting to update the
counter that stops the loop. The next unit introduces a construct built
specifically to make that risk harder to fall into.

---

## Concept Unit: Repeating a Fixed Number of Times

### The Problem

The previous unit's `while` loop needed three separate lines to manage its
own counter: `int i = 0;` before the loop, `i < 5` as the condition, and
`i++;` at the very end of the block — three lines, in three different
places, all coordinating the exact same variable. For the extremely common
case of "repeat some fixed number of times, counting as you go," is there
a construct that keeps all three of those pieces together, in one place,
so they can't drift out of sync with each other?

> **Stop and think before reading on:** If a loop's initializer, condition,
> and increment all lived in one place instead of three, what problem from
> the previous unit's SE lens — forgetting the increment and looping
> forever — would become easier or harder to accidentally cause?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-07/loops_demo.dart`
  — modified, appending this unit's `for` loop directly after the previous
  unit's `while` loop.
- **Change type:** Add (new lines in the file created in Concept Unit 1).
- **Location:** Appended directly after the previous unit's `print(sum);`.
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
int product = 1;
for (int j = 1; j <= 4; j++) {
  product *= j;
}
print(product);
```

### The Updated Project

```dart
 1: int sum = 0;
 2: int i = 0;
 3: while (i < 5) {
 4:   sum += i;
 5:   i++;
 6: }
 7: print(sum);
 8:
 9: int product = 1;                    // ← new
10: for (int j = 1; j <= 4; j++) {       // ← new
11:   product *= j;                     // ← new
12: }                                   // ← new
13: print(product);                     // ← new
```

### Introduce the concept in isolation

Confidently predictable (`1 * 1 * 2 * 3 * 4 = 24`), but shown as a real,
run trace per the schema's own execution-trace requirement, batched with
the rest of this lesson:

```
24
```

Full real, iteration-by-iteration trace:

```
Before loop:  product = 1
Iteration 1:  initializer runs once: j = 1. condition `j <= 4` → 1 <= 4 → true. product = 1 * 1 = 1. increment: j becomes 2.
Iteration 2:  condition `j <= 4` → 2 <= 4 → true. product = 1 * 2 = 2. increment: j becomes 3.
Iteration 3:  condition `j <= 4` → 3 <= 4 → true. product = 2 * 3 = 6. increment: j becomes 4.
Iteration 4:  condition `j <= 4` → 4 <= 4 → true. product = 6 * 4 = 24. increment: j becomes 5.
Iteration 5:  condition `j <= 4` → 5 <= 4 → false. Loop stops; product stays 24.
```

Notice the initializer (`int j = 1`) appears in this trace exactly once,
before the very first condition check — never repeated on later
iterations, unlike the condition and increment, which run once per
repetition.

### Discarding this example

This exact product (of `1` through `4`) is disposable. What carries
forward: a `for` loop's initializer runs exactly once, its condition and
increment run once per repetition, and all three live in one place instead
of being scattered the way the previous unit's `while` loop required.

### Mechanical walkthrough

- **`int product = 1;`** — a declaration, same shape as every earlier
  unit's; started at `1`, not `0`, because multiplying anything by `0`
  would force the whole product to `0` — the correct starting value for
  an accumulator depends on which operation it's accumulating.
- **`for (int j = 1; j <= 4; j++)`** — the `for` loop's three clauses, all
  inside one set of parentheses: `int j = 1` is the initializer, declaring
  and giving the counter its starting value, run exactly once, before
  anything else; `j <= 4` is the condition, the same relational operator
  family Lesson 6 introduced, checked before every repetition, including
  the one that stops the loop; `j++` is the increment, the same increment
  operator the previous unit used, run once at the *end* of every
  repetition, after the block below has already finished for that
  repetition.
- **`{ product *= j; }`** — the loop's own block: `product *= j` is the
  compound assignment operator (this lesson's header), here multiplying
  instead of adding, storing `product * j` back into `product`.
- **`print(product)`** — the same `print` function from this lesson's
  header, run once, after the loop has fully finished.

### CS lens

Bundling a counter's initialization, test, and update into one fixed
place is still the same **iteration** idea the previous unit introduced —
here specialized into the specific, extremely common shape of "count from
a start value to a stop value."

```
Also recognized in: a `for` loop's identical three-part shape across
C, Java, JavaScript, and most C-family languages; a factory assembly
line's own fixed number of stations, each one repeating identical
work per unit; a `for` loop underneath nearly every for-in loop's own
internal, hidden counting logic (Concept Unit 3, this lesson)
```

### SE lens

Everything this `for` loop does could be written as a `while` loop instead
(exactly as Concept Unit 1 did) — `for` adds no new *capability*, only
locality: initializer, condition, and increment sit in one glance-able
place, rather than three separated lines a reader (or the loop's own
author, editing it later) has to mentally reassemble. The real cost this
project will pay for *not* using `for` where it fits — writing every
counted loop as a `while` instead — is exactly what Concept Unit 1's SE
lens already named: the counter's own update becomes one more line that
can silently be forgotten or misplaced, one edit away from an infinite
loop.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Not run standalone, for the same Batching-clause reason as the previous
unit — complete output shown in Concept Unit 4's own "Run it" step.

### Connecting this unit

The previous two units both counted through numbers that don't otherwise
exist anywhere — `i` and `j` were invented purely to count. The next unit
introduces a loop built for the different, equally common case of walking
values that already exist, gathered together.

---

## Concept Unit: Repeating Once Per Existing Value

### The Problem

A Sudoku engine will eventually hold real collections of values — the nine
candidate digits for one cell, say. Walking through values that already
exist, one at a time, using the previous unit's `for` loop, means writing
`for (int k = 0; k < /* however many there are */; k++)` and then, inside
the loop, looking the actual value up by that counter — indirect machinery
standing between the loop and the values it actually cares about. Is there
a construct that hands you each value directly, with no counter to manage
at all?

> **Stop and think before reading on:** If a loop could hand you each
> value directly, one at a time, without you ever writing a counter or an
> index yourself, what do you think happens to concerns like "did I start
> at the right number" or "did I stop one repetition too early or too
> late" that the previous two units' loops both had to get right by hand?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-07/loops_demo.dart`
  — modified, appending this unit's `for-in` loop.
- **Change type:** Add (new lines in the file created in Concept Unit 1).
- **Location:** Appended directly after the previous unit's `print(product);`.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Unit 2.

### The New Code

```dart
var digits = [1, 2, 3];
int total = 0;
for (var digit in digits) {
  total += digit;
}
print(total);
```

### The Updated Project

```dart
 1: int sum = 0;
 2: int i = 0;
 3: while (i < 5) {
 4:   sum += i;
 5:   i++;
 6: }
 7: print(sum);
 8:
 9: int product = 1;
10: for (int j = 1; j <= 4; j++) {
11:   product *= j;
12: }
13: print(product);
14:
15: var digits = [1, 2, 3];              // ← new
16: int total = 0;                       // ← new
17: for (var digit in digits) {          // ← new
18:   total += digit;                    // ← new
19: }                                    // ← new
20: print(total);                        // ← new
```

### Introduce the concept in isolation

Confidently predictable (`1 + 2 + 3 = 6`), shown as a real, run trace:

```
6
```

Full real, iteration-by-iteration trace:

```
Before loop:  total = 0
Iteration 1:  digit is bound to the list's first value, 1. total = 0 + 1 = 1.
Iteration 2:  digit is bound to the list's second value, 2. total = 1 + 2 = 3.
Iteration 3:  digit is bound to the list's third value, 3. total = 3 + 3 = 6.
(No fourth iteration: the list has exactly three values, and a
for-in loop stops the moment there isn't a next one — there is no
separate condition to check by hand the way the previous two units'
loops both needed.)
```

### Discarding this example

`digits`'s exact three values are disposable. What carries forward: a
`for-in` loop binds a fresh variable to each existing value in turn, with
no counter, no condition, and no increment for its own author to get
wrong — those concerns simply don't exist in this construct's own syntax.

### Mechanical walkthrough

- **`var digits = [1, 2, 3];`** — a declaration using `var` (Lesson 5's
  term, reappearing, restated above): Dart infers `digits`'s type from
  `[1, 2, 3]`, a list literal (this lesson's header) — a fixed sequence of
  three integer literals between square brackets. This lesson uses this
  narrowly, only as something to iterate over; a `List`'s real declared
  shape and full operations are Lesson 9's own subject, not this one's.
- **`int total = 0;`** — a declaration, same shape as every earlier
  accumulator this lesson has used, started at `0` since this one adds.
- **`for (var digit in digits)`** — the `for-in` loop: `var digit` declares
  a fresh variable, its type inferred from whatever `digits` holds (an
  `int`, in this case); `in` names which existing collection to walk;
  `digits` is the collection itself, declared two lines above. Unlike the
  previous unit's `for`, there is no separate initializer, condition, or
  increment clause at all — one loop variable, one collection, nothing
  else to write.
- **`{ total += digit; }`** — the loop's own block: the same compound
  assignment operator from Concept Unit 1, here adding whichever value
  `digit` is currently bound to.
- **`print(total)`** — the same `print` function from this lesson's
  header, run once, after the loop has fully finished.

### CS lens

Iterating directly over a collection's own existing values, rather than
over an artificial counter used to look values up indirectly, is the same
**iteration** idea as the previous two units, specialized for walking an
already-assembled sequence rather than counting through numbers that don't
otherwise exist.

```
Also recognized in: Python's own `for x in list`, JavaScript's
`for...of`, Java's enhanced `for` loop (`for (int x : list)`), a
recipe's own "for each ingredient in this list" instruction, a mail
merge processing one row of a spreadsheet at a time
```

### SE lens

A plain `for` loop walking the same three values by counting (`for (int k
= 0; k < 3; k++) { total += digits[k]; }`, indexing into `digits` by
position) works identically here — its real cost, compared to `for-in`, is
two extra ways to get the bounds wrong: starting the counter at the wrong
number, or comparing it against the wrong stopping value (`<=` instead of
`<`, or the wrong length entirely), either of which either skips a real
value or reads one position past the collection's actual end. `for-in`
removes both mistakes structurally, at the cost of never telling you
*which* position (first, second, third) a given value came from, should a
later piece of code ever need that number too — a real tradeoff, not a
strictly-better replacement for the previous unit's `for`.

### Commands needed

- **`dart run <file>`** — same command as the previous two units.

### Run it

Not run standalone, for the same Batching-clause reason — complete output
shown in the next unit's own "Run it" step.

### Connecting this unit

Every loop so far in this lesson has walked one dimension: a range of
numbers, or a flat list of values. The next unit introduces a genuinely
two-dimensional problem — a grid — that a single loop, of any of the three
kinds shown so far, cannot walk on its own.

---

## Concept Unit: A Loop Inside a Loop

### The Problem

A Sudoku board isn't a single row of values — it's a 9×9 *grid*: every row
has its own nine columns. None of this lesson's loops so far can walk a
grid on their own: a single `for` loop can count through rows, or through
columns, but not both at once, since it only has one counter.

> **Stop and think before reading on:** If you already had a `for` loop
> that printed every row number `0` through `2`, and, separately, another
> `for` loop that printed every column number `0` through `2`, what do you
> think would happen if you placed the *entire second loop* inside the
> *body* of the first one, rather than running the two loops one after
> the other?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-07/loops_demo.dart`
  — modified, appending this unit's nested loops, completing the file.
- **Change type:** Add (final lines in the file created in Concept Unit 1).
- **Location:** Appended directly after the previous unit's `print(total);`.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Units 2 and 3.

### The New Code

```dart
for (int row = 0; row < 3; row++) {
  for (int col = 0; col < 3; col++) {
    print('$row,$col');
  }
}
```

### The Updated Project

The complete, final file for this lesson (new lines marked; everything
above line 21 is exactly what Concept Unit 3 left it as):

```dart
 1: int sum = 0;
 2: int i = 0;
 3: while (i < 5) {
 4:   sum += i;
 5:   i++;
 6: }
 7: print(sum);
 8:
 9: int product = 1;
10: for (int j = 1; j <= 4; j++) {
11:   product *= j;
12: }
13: print(product);
14:
15: var digits = [1, 2, 3];
16: int total = 0;
17: for (var digit in digits) {
18:   total += digit;
19: }
20: print(total);
21:
22: for (int row = 0; row < 3; row++) {       // ← new
23:   for (int col = 0; col < 3; col++) {     // ← new
24:     print('$row,$col');                  // ← new
25:   }                                       // ← new
26: }                                         // ← new
```

### Introduce the concept in isolation

Whether nesting genuinely produces one line per *combination* of row and
column — not, say, three lines total, or some other count — is worth real
proof rather than confident restatement, so this was run for real, batched
with this lesson's other three loops:

```
0,0
0,1
0,2
1,0
1,1
1,2
2,0
2,1
2,2
```

Nine lines, not three — proving the inner loop's own full range (three
columns) really does run once for *every single* repetition of the outer
loop (three rows), rather than the two loops merely running alongside each
other. Full real, iteration-by-iteration trace of the outer loop, with the
inner loop's own three repetitions nested inside each one:

```
Outer iteration 1: row = 0. Inner loop runs fully: col 0 → prints "0,0";
  col 1 → prints "0,1"; col 2 → prints "0,2"; col 3 fails `col < 3`, inner
  loop stops for this outer repetition.
Outer iteration 2: row = 1. Inner loop runs fully again, from col = 0:
  prints "1,0", "1,1", "1,2".
Outer iteration 3: row = 2. Inner loop runs fully a third time, from
  col = 0 again: prints "2,0", "2,1", "2,2".
Outer iteration 4: row = 3 fails `row < 3`. Outer loop stops.
```

Notice `col` restarts at `0` at the beginning of every single outer
repetition — it is declared *inside* the outer loop's own block, so a
fresh copy is created, and re-initialized to `0`, each time the outer loop
runs its body again.

### Discarding this example

This exact 3×3 grid of row/column pairs is disposable. What carries
forward: an inner loop runs its *entire* range once per outer repetition,
producing (outer repetitions) × (inner repetitions) total lines of work —
here `3 × 3 = 9` — not the sum of the two ranges.

### Mechanical walkthrough

- **`for (int row = 0; row < 3; row++)`** — the outer `for` loop: the same
  three-clause construct Concept Unit 2 introduced, here counting rows
  `0` through `2`.
- **`{ for (int col = 0; col < 3; col++) { ... } }`** — the outer loop's
  own block, containing nothing but a second, complete `for` loop — this
  is what makes the loop *nested*: the inner loop is not a sibling
  statement running after the outer loop, it is the outer loop's *entire
  body*, run in full on every single outer repetition.
- **`print('$row,$col')`** — the same `print` function from this lesson's
  header, its argument built with string interpolation (Lesson 4's term,
  reappearing, restated above): `$row` and `$col` each call their own
  variable's `toString()` internally, producing a new string combining
  both loop counters' *current* values at the exact moment this line
  runs.

### CS lens

Nesting one loop inside another to walk a two-dimensional structure is
still **iteration**, composed with itself — a specific, extremely common
pattern called **nested iteration**, whose total number of repetitions is
the *product* of each loop's own range, not their sum, exactly as this
unit's real nine-line output (rather than a six-line one) just proved.

```
Also recognized in: any grid-based game board (chess, Minesweeper,
this curriculum's own eventual Sudoku board), a spreadsheet's own
row-by-row, column-by-column recalculation, image processing walking
every pixel of a 2D image one row at a time, matrix multiplication's
own nested row/column traversal
```

### SE lens

Nested iteration's real, well-known cost is exactly what its own CS lens
just named: total work grows as a *product*, not a sum — a 3×3 grid here
took `9` repetitions, but a real 9×9 Sudoku board would take `81`, and a
naive triple-nested loop over three such boards would take `729`. Lesson
23 (Performance) covers measuring and reasoning about this cost formally;
for now, the concrete, practical consequence: nesting is the right,
natural tool for a genuinely two-dimensional problem like a Sudoku board's
own rows and columns, but reaching for it out of habit for something that
isn't actually two-dimensional would pay that multiplied cost for no real
reason.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for the entire file (all four units):

```
10
24
6
0,0
0,1
0,2
1,0
1,1
1,2
2,0
2,1
2,2
```

Real, saved in full in
`src/docs/flutter/verification/lesson-07/run-log.md`.

### Connecting this unit

This unit proved nested iteration's total repetition count is a genuine
multiplication, not an assumption. The final unit steps back from writing
loops to *reasoning* about what a loop, once written, actually guarantees.

---

## Concept Unit: What a Loop Actually Guarantees

### The Problem

Concept Unit 1's `while` loop was trusted, based on its trace, to correctly
sum `0` through `4`. But a trace only ever shows what happened for *one*
specific input — five repetitions, this one time. What would let you argue
that the exact same loop correctly sums `0` through *any* number, not just
the one case already traced by hand?

> **Stop and think before reading on:** Look at Concept Unit 1's real
> trace again. At the *start* of Iteration 3 (before that repetition's own
> body runs), `sum` was `1` and `i` was `2`. Is there a short, general
> sentence — true at that exact moment, and *also* true at the start of
> every other iteration in that same trace — that describes the
> relationship between `sum`'s current value and `i`'s current value, using
> only addition?

### Project Change

- **Reference Source:** No reference counterpart — this unit reasons about
  Concept Unit 1's already-shown code rather than introducing new code of
  its own.
- **Files affected:** None — this unit adds no new file or lines; it
  reasons about the `while` loop `src/docs/flutter/verification/lesson-07/loops_demo.dart`
  already contains.
- **Change type:** N/A — analysis of existing code.
- **Location:** N/A.
- **Dependencies:** Concept Unit 1's own `while` loop.

### The New Code

No new code — this unit reuses Concept Unit 1's own loop exactly as
already shown:

```dart
int sum = 0;
int i = 0;
while (i < 5) {
  sum += i;
  i++;
}
print(sum);
```

### The Updated Project

Not applicable — no code changes; this unit is pure reasoning about
already-existing code, not a modification to any file.

### Introduce the concept in isolation

There is nothing new to run — Concept Unit 1's own real trace, already
captured, is the evidence this unit reasons over directly. Restated from
that trace, the values of `sum` and `i` at the *start* of each iteration:

```
Start of iteration 1: sum = 0, i = 0.  (0 = 0 + 1 + ... + (0-1), i.e. an empty sum)
Start of iteration 2: sum = 0, i = 1.  0 = 0
Start of iteration 3: sum = 1, i = 2.  1 = 0 + 1
Start of iteration 4: sum = 3, i = 3.  3 = 0 + 1 + 2
Start of iteration 5: sum = 6, i = 4.  6 = 0 + 1 + 2 + 3
After the loop:        sum = 10, i = 5. 10 = 0 + 1 + 2 + 3 + 4
```

Every single row fits the same general sentence: **at the start of every
iteration, `sum` already equals the sum of every whole number from `0` up
to (but not including) `i`.** This sentence — true before the loop starts,
still true after every single repetition, and, combined with the loop's
own stopping condition (`i < 5` becoming false only once `i` reaches `5`),
enough to conclude `sum` must equal `0 + 1 + 2 + 3 + 4` once the loop
finishes — is called the loop's **invariant**.

### Discarding this example

Nothing here is discarded — this unit doesn't introduce new throwaway code
at all; it reuses Concept Unit 1's own already-real, already-run loop
directly, reasoning about it rather than replacing it with something new.

### Mechanical walkthrough

- **The invariant itself, restated precisely:** "before this iteration
  begins, `sum` equals the sum of every whole number from `0` up to (but
  not including) `i`." This is a claim about the *relationship* between
  two variables' current values, not about either value in isolation.
- **Why it holds before the loop's very first repetition:** `sum` is `0`
  and `i` is `0`; the sum of "every whole number from `0` up to but not
  including `0`" is an empty sum, which is `0` by definition — matching
  `sum`'s actual starting value exactly.
- **Why it keeps holding after every repetition:** each repetition adds
  `i`'s *current* value into `sum` (`sum += i`) and only *then* increments
  `i` (`i++`) — so after both statements run, `sum` has picked up exactly
  the one new number the invariant now needs included, and `i` has moved
  forward to match.
- **Why it proves the final answer once the loop stops:** the loop's own
  condition, `i < 5`, becomes `false` for the first time exactly when `i`
  reaches `5` — and the invariant, still holding at that exact moment,
  says `sum` equals the sum of every whole number from `0` up to but not
  including `5`, which is exactly `0 + 1 + 2 + 3 + 4` — the real, printed
  result, `10`, without needing to re-trace all five repetitions by hand
  to trust it.

### CS lens

Reasoning about a loop through a fact that's true before it starts and
stays true after every repetition, rather than by tracing every individual
repetition, is called a **loop invariant** — a specific application of
**mathematical induction** (prove a base case, then prove one step implies
the next) to a running program instead of to a mathematical statement.

```
Also recognized in: mathematical induction proofs generally, a
database transaction's own consistency guarantee (true before,
true after, on every single commit), a factory's own quality
invariant ("every unit leaving this station meets spec," checked
once per station rather than by inspecting the whole product only
at the very end), formal program verification tools that
mechanically check a stated invariant instead of trusting a human's
trace
```

### SE lens

Trusting a loop only because its trace happened to work for one specific
input (`0` through `4`, here) is a real, common trap: a loop can look
correct for every input actually tested and still be subtly wrong for
some input that was never tried. Stating and checking an invariant costs
real upfront thinking — the sentence above didn't write itself — in
exchange for a guarantee that holds for *every* input the loop's condition
could ever apply to, not just the ones a trace happened to cover. This
project will lean on this kind of reasoning most heavily once Phase 2's
Sudoku-solving algorithms (backtracking, constraint checking) need to be
trusted for boards that were never individually tested by hand.

### Commands needed

None — this unit performs no new run; it reasons about a run already
captured in Concept Unit 1.

### Run it

Not applicable — no new code to run. This unit's own evidence is Concept
Unit 1's already-real, already-saved trace, reused directly.

### Connecting this unit

This unit closed the loop, so to speak, on everything this lesson built:
not just showing that a loop happens to produce the right answer once, but
reasoning about *why* it must, for any input its condition could apply to.

---

## Connect the Pieces

Trace one concrete piece of Sudoku-flavored work through everything this
lesson built. Imagine tallying how many of a board's 9 columns, within one
of its 3 row-bands, are still missing a digit. Concept Unit 1's `while`
loop shape could re-check "still more columns to look at?" before every
single check, exactly the way it re-checked `i < 5` six real times,
including the check that finally stopped it. Concept Unit 2's `for` loop
would bundle that same counting logic — start, check, advance — into one
place instead of three, exactly as its own real trace showed for
multiplying `1` through `4`. Concept Unit 3's `for-in` loop would walk the
board's own already-assembled list of candidate digits directly, with no
counter to manage at all, exactly as it summed `[1, 2, 3]` to `6` with no
index ever written. Concept Unit 4's nested loops would be the *actual*
shape a full board scan needs — an outer loop over rows, an inner loop
over columns, real-proven to multiply their repetitions rather than add
them, exactly as `3` rows and `3` columns became `9` real printed lines,
not `6`. And Concept Unit 5's invariant is what would let a future lesson
trust that scan's own final tally is correct for *any* board it's ever
run against — not just the one small example this lesson happened to
trace by hand.

Lesson 5 gave values a name and a shape; Lesson 6 let a value change what
runs next; this lesson let that decision repeat, in bulk, without
retyping it once per repetition. Lesson 8 turns to the next natural
question: once a piece of logic — like this lesson's own summing or
grid-walking code — is worth reusing, how does it get a name of its own,
separate from any one specific loop that happens to call it?
