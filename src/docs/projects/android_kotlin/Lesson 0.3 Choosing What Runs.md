# Lesson 0.3: Choosing What Runs

**What you will build.** `Calculator.kt` stops running all four
arithmetic functions in a fixed sequence and starts choosing exactly
one, based on a value — the way a real calculator picks the operation
its user actually pressed, instead of computing every possible
operation every time. By the end, `main` holds two operand values, one
operator symbol, and a single decision that produces one result. The
transferable problem underneath the feature: how a program compares
values, asks a yes/no question about them, and lets the answer control
which instructions actually run next.

**What you need to know first.** Lesson 0.2's `Calculator.kt`: the four
functions `add`, `subtract`, `multiply`, `divide` (each
`fun name(a: Int, b: Int) = a <op> b`), and `main`'s existing chain that
calls all four in sequence through the mutable `displayValue`.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes
  in order. This lesson is the first to make that sequence genuinely
  *not* fixed: which instructions actually run will depend on a value,
  not just on their position in the file.
- **instruction** — one individual step in a program, executed in
  order. Every line inside `main`'s new decision logic is still an
  instruction; this lesson changes whether a given instruction runs at
  all, not what "instruction" means.
- **statement** — an instruction run for its effect, not for a value
  the rest of the program uses. `println(result)`, this lesson's own
  final print, is a statement in exactly the sense Lesson 0.1
  established.
- **expression** — a piece of code that evaluates to a value. This
  lesson adds three new *kinds* of expression — a comparison, an `if`,
  and a `when` — each one still, in the end, a piece of code that
  evaluates to a value, the identical idea `2 + 3` already established.
- **value** — a piece of data a program holds and operates on.
  `operatorSymbol`, `operandA`, `operandB`, and `result`, this lesson's
  four new named values, are values in exactly Lesson 0.1's sense.
- **type** — a category determining what a value's data is and what
  operations are valid on it, checked by the compiler before the
  program runs. This lesson's comparisons and branches are all
  type-checked exactly as strictly as Lesson 0.1 proved for `+`.
- **`fun`** — the keyword beginning a function declaration. Unchanged in
  this lesson; `add`, `subtract`, `multiply`, and `divide` still begin
  with it, and so does `main`.
- **`val`** — the keyword declaring an immutable binding: a name whose
  value the compiler refuses to let be reassigned. Every new name this
  lesson introduces (`operatorSymbol`, `operandA`, `operandB`, `result`)
  is declared `val`, not `var` — none of them is meant to change once
  computed, unlike Lesson 0.1's `displayValue`.
- **`Int`** — Kotlin's type for whole numbers. `operandA`, `operandB`,
  and `result` are all `Int`s, the same type every function parameter
  and return value in Lesson 0.2 already used.
- **`String`** — Kotlin's type for text, delimited by double quotes.
  First given full treatment in Lesson 0.1 for `"Calculator starting
  up"`; this lesson's `operatorSymbol` is also a `String` — one
  character (`"+"`, `"-"`, `"*"`, or `"/"`) representing which operation
  to run.
- **identifier** — a programmer-chosen name, as opposed to a reserved
  keyword. `operatorSymbol`, `operandA`, `operandB`, and `result` are
  all identifiers.
- **comparison operator (`==`)** — an operator comparing two values for
  equality, producing a `Boolean` — `true` if they're equal, `false`
  otherwise. It exists because a decision needs something to actually
  decide *on*: a raw value like `operatorSymbol` on its own is just
  data, but `operatorSymbol == "+"` is a yes/no question a program can
  act on.
- **`Boolean`** — Kotlin's type for a value that is exactly `true` or
  `false`, first given full treatment in Lesson 0.1. Every comparison
  this lesson writes produces one; every condition this lesson's `if`
  and `when` check is one.
- **condition** — a `Boolean` expression controlling whether a branch of
  code runs. `operatorSymbol == "+"`, this lesson's first comparison,
  becomes a condition the moment it's placed inside an `if`.
- **`if`** — a keyword introducing a branch that runs only when its
  condition evaluates to `true`. It exists because a program often
  needs to run different instructions depending on the data it's
  actually holding, rather than the same fixed instructions every time.
- **`else`** — a keyword introducing the branch that runs when an `if`'s
  condition evaluates to `false`. It exists so every possible outcome
  of a condition has somewhere to go — without it, "what happens when
  the condition is false" would be left completely unanswered.
- **branch** — one of the alternative blocks of instructions a decision
  construct (`if`/`else` or `when`) can run, exactly one of which
  actually executes for any given input.
- **`when`** — a keyword introducing a multi-branch decision: one
  subject value, compared in order against several possible matches,
  running only the instructions attached to the first match found. It
  exists as a cleaner alternative to a long chain of `if`/`else if`
  branches once there are more than two real outcomes to choose
  between — this lesson's own SE Lens in Concept Unit 3, below, makes
  this comparison directly.
- **exhaustive** — covering every possible input value a condition could
  ever hold, with no gap left unhandled. A `when` used as an expression
  (producing a value, the way this lesson's does) must be exhaustive —
  proven directly, with a real compiler error, in Concept Unit 3, below.

**Objects and methods used**

- **`add`**
  - *What it is:* the addition function this lesson calls from inside a
    decision, rather than always calling directly, unchanged from
    Lesson 0.2.
  - *Implementation:* unchanged — `fun add(a: Int, b: Int): Int`, an
    expression-bodied function returning the sum of its two `Int`
    parameters (its exact internal expression, `a + b`, was given full
    treatment in Lesson 0.2 and is not re-derived here, since this
    lesson's own new code never re-shows it — only calls it).
  - *Its use:* one of four functions this lesson's `when` can choose to
    call, selected only when `operatorSymbol` is `"+"`.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given two `Int` arguments, compute and return
    their sum — nothing else.
  - *Depends on:* two `Int` arguments, supplied by whichever branch of
    this lesson's decision logic calls it.
  - *Connects to:* called from inside this lesson's `when` expression
    (Concept Unit 3, below) instead of unconditionally from `main`'s own
    top level.
  - *Shape:* the calculator's own domain logic, called through a new
    decision layer this lesson adds in front of it.

- **`subtract`**
  - *What it is:* the subtraction function this lesson calls from
    inside a decision, unchanged from Lesson 0.2.
  - *Implementation:* unchanged — `fun subtract(a: Int, b: Int): Int`,
    returning the difference of its two `Int` parameters.
  - *Its use:* selected only when `operatorSymbol` is `"-"`.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given two `Int` arguments, compute and return
    their difference.
  - *Depends on:* two `Int` arguments.
  - *Connects to:* called from inside this lesson's `when` expression.
  - *Shape:* the calculator's own domain logic, same role as `add`.

- **`multiply`**
  - *What it is:* the multiplication function this lesson calls from
    inside a decision, unchanged from Lesson 0.2.
  - *Implementation:* unchanged — `fun multiply(a: Int, b: Int): Int`,
    returning the product of its two `Int` parameters.
  - *Its use:* selected only when `operatorSymbol` is `"*"`.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given two `Int` arguments, compute and return
    their product.
  - *Depends on:* two `Int` arguments.
  - *Connects to:* called from inside this lesson's `when` expression.
  - *Shape:* the calculator's own domain logic, same role as `add` and
    `subtract`.

- **`divide`**
  - *What it is:* the division function this lesson calls from inside a
    decision, unchanged from Lesson 0.2.
  - *Implementation:* unchanged — `fun divide(a: Int, b: Int): Int`,
    returning the truncated integer quotient of its two `Int`
    parameters (its real truncation behavior, proven with `7 / 2` and
    `-7 / 2`, was established in Lesson 0.2 and still applies
    identically here).
  - *Its use:* selected only when `operatorSymbol` is `"/"`.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given two `Int` arguments, compute and return
    their truncated integer quotient; still does nothing special for a
    `0` second argument (unchanged, acknowledged gap from Lesson 0.2,
    still deferred to Stage 2).
  - *Depends on:* two `Int` arguments.
  - *Connects to:* called from inside this lesson's `when` expression.
  - *Shape:* the calculator's own domain logic, same role as the other
    three.

- **`main`**
  - *What it is:* the specially-recognized JVM entry point, proven real
    with `javap` in Lesson 0.1.
  - *Implementation:* unchanged in its own declaration —
    `fun main() { }` — but its body's content changes substantially in
    this lesson, ending with a single decision instead of a fixed
    sequence of four calls.
  - *Its use:* still the only reason the JVM knows where to start; now
    also the place this lesson's new decision logic actually lives.
  - *Type:* a free (top-level) function.
  - *Responsibility:* be the program's single entry point.
  - *Depends on:* nothing to be declared; to run, depends on the file
    being compiled to a `.class` the JVM can load.
  - *Connects to:* called by the JVM's launcher; calls `println` and,
    depending on `operatorSymbol`'s value, exactly one of
    `add`/`subtract`/`multiply`/`divide`.
  - *Shape:* the outermost public boundary of the whole program, and,
    starting this lesson, the place a real decision is made rather than
    only a fixed sequence run.

- **`println`**
  - *What it is:* the standard-library function writing text and a line
    break to standard output.
  - *Implementation:* real source, `kotlin-stdlib-sources.jar`
    (`jvmMain/kotlin/io/Console.kt`), unchanged from Lesson 0.1:
    ```kotlin
    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public inline fun println(message: Int) {
        System.out.println(message)
    }
    ```
    (The full overload set was quoted in Lesson 0.1; the `Int` overload
    shown here is the one this lesson's final `println(result)` call
    resolves to.)
  - *Its use:* still this lesson's only way to make anything visible.
  - *Type:* a top-level `inline` function.
  - *Responsibility:* convert its one argument to text and write it,
    followed by a line separator, to standard output.
  - *Depends on:* exactly one argument, whose type picks the overload.
  - *Connects to:* called from `main`; internally calls
    `System.out.println`, a real method on `java.io.PrintStream`.
  - *Shape:* a public standard-library API surface, unchanged in role.

---

## Concept Unit: Comparison Operators and Boolean Expressions

### The Problem

A real calculator needs to know *which* operation its user asked for —
`operatorSymbol`, a piece of text like `"+"`, needs to become a
yes/no answer the program can actually act on: "is this the addition
symbol, or isn't it?" Given what Lesson 0.1 already established about
`Boolean` (a type holding exactly `true` or `false`) and `String` (a
type holding text), what kind of operator do you think could compare
two `String`s and produce a `Boolean` answer? Have you seen a similar
symbol used for comparison before, in arithmetic or another language —
and would you expect it to look like Kotlin's `=` (already used for
assignment) or something different, given that `=` already means
something else in this same language?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, laying
  groundwork for the BRD's "Choose calculator operation" practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (two new lines inside `main`).
- **Location** — inside `main`, immediately after the existing
  `println(true)` line from Lesson 0.1.
- **Dependencies** — none beyond Lessons 0.1–0.2.

### The New Code

```kotlin
val operatorSymbol = "+"
println(operatorSymbol == "+")
```

### The Updated Project

```kotlin
1:  fun add(a: Int, b: Int) = a + b
2:  fun subtract(a: Int, b: Int) = a - b
3:  fun multiply(a: Int, b: Int) = a * b
4:  fun divide(a: Int, b: Int) = a / b
5:
6:  fun main() {
7:      println("Calculator starting up")
8:      println(2)
9:      println(3.5)
10:     println(true)
11:     val operatorSymbol = "+"       // ← new
12:     println(operatorSymbol == "+") // ← new
13:     var displayValue = add(2, 3)
14:     println(displayValue)
15:     displayValue = subtract(displayValue, 4)
16:     println(displayValue)
17:     displayValue = multiply(displayValue, 5)
18:     println(displayValue)
19:     displayValue = divide(displayValue, 3)
20:     println(displayValue)
21: }
```

`main` now holds a new named `String` value, `operatorSymbol`, and
prints the result of comparing it against the literal `"+"` — everything
else in the file is exactly as Lesson 0.2 left it.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.3/lab1_comparison.kt`),
comparing plain `Int` literals instead of `operatorSymbol`, to confirm
`==` is a general fact about comparing values, not something specific
to `String`s:

```kotlin
fun main() {
    println(2 == 2)
    println(2 == 3)
}
```

Compiled and run this session:

```
$ kotlinc lab1_comparison.kt -include-runtime -d lab1_comparison.jar
$ java -jar lab1_comparison.jar
```

Real output:

```
true
false
```

`2 == 2` produced `true`; `2 == 3` produced `false` — proving `==` really
does evaluate the two values it's given and produce a genuine `Boolean`
result, not just echo one side back. This is called a **comparison
operator**: `==` takes two values of the same type and asks "are these
equal?", producing a `Boolean` **expression** — a piece of code that
evaluates to a value, the same core idea Lesson 0.1 established for
`2 + 3`, just producing a `true`/`false` answer instead of a number.

### Discard the Throwaway Example

`lab1_comparison.kt` is scratch, recorded in the verification folder,
not part of the calculator project. What it proved — that `==` produces
a real `Boolean` by actually comparing its two operands — is what
`operatorSymbol == "+"`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val operatorSymbol = "+"`** — the same `val` keyword Lesson 0.1
  gave full treatment (an immutable binding, enforced by the compiler,
  proven with a real `'val' cannot be reassigned` error), here naming a
  `String` instead of an `Int`. `"+"` is a string literal — text
  delimited by double quotes, given full treatment for
  `"Calculator starting up"` in Lesson 0.1, here holding a single
  character instead of a sentence; `operatorSymbol`'s type, `String`, is
  inferred from this literal, the same type inference Lesson 0.1
  proved for `Int`.
- **`println(...)`** — the same overloaded, `inline`,
  `System.out.println`-delegating standard-library function given full
  treatment in this lesson's Header, reappearing here. Its argument is
  not a literal or a stored value but a fresh comparison expression;
  because that expression evaluates to a `Boolean` (explained next),
  this call resolves to `println`'s `Boolean` overload, quoted in full
  in Lesson 0.1.
- **`operatorSymbol == "+"`** — a comparison expression: `operatorSymbol`,
  reading the `String` value just declared; `==`, the comparison
  operator introduced in this unit's isolated lab, checking whether the
  two sides hold equal values; `"+"`, a second string literal. Kotlin
  compares `String`s by their actual text content (character by
  character), so this expression evaluates to `true` exactly when
  `operatorSymbol` holds the text `+` — which, given the declaration one
  line above, it does.

### CS Lens

Reducing a piece of raw data down to a single yes/no answer before
acting on it is foundational to how any decision-making system works,
not unique to programming. Also recognized in: a light switch's
on/off state, the single fact a lamp's circuit actually reacts to; a
locked door's "is this the right key" check, reducing an entire key's
shape to one bit of information; a spreadsheet's `=A1=5` formula,
producing `TRUE`/`FALSE` for later formulas to branch on; a thermostat
comparing a measured temperature against a target and reducing that
comparison to "heat on" or "heat off."

### SE Lens

Kotlin uses `==` for comparison and a single `=` for assignment —
two visually similar but functionally unrelated operators, deliberately
kept distinct rather than reusing one symbol for both (some older
languages, like classic BASIC, actually do reuse a single `=` for
both, relying entirely on context to disambiguate). The tradeoff: two
different-looking operators means a reader can tell, from the symbol
alone, whether a line is *comparing* something or *changing* something,
without reading the surrounding context first — at the cost of every
programmer needing to remember, and type, the extra character. This
lesson's own upcoming units depend on this distinction directly:
`operatorSymbol == "+"` never risks silently becoming an accidental
reassignment, because reassignment requires a different, single-`=`
operator entirely.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Lesson 0.1.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step1_comparison.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
2
3.5
true
true
5
1
5
1
```

The new fifth line, `true`, is `operatorSymbol == "+"`'s real result —
distinct from the fourth line's `true`, which is still just the literal
`Boolean` value from Lesson 0.1's original type demonstration.

### Connect

`operatorSymbol` can now be compared against a literal, producing a real
`Boolean`. The next unit uses that `Boolean` to actually control which
instructions run.

---

## Concept Unit: Branching with `if` and `else`

### The Problem

`operatorSymbol == "+"` produces a `Boolean`, but right now nothing in
`Calculator.kt` *does* anything with that answer beyond printing it —
`main` still unconditionally calls `add`, then `subtract`, then
`multiply`, then `divide`, regardless of what `operatorSymbol` actually
says. A real decision needs to change *which* code runs, not just print
a yes/no answer alongside code that runs anyway. Given a `Boolean`
condition like `operatorSymbol == "+"`, how would you write "if this is
true, do one thing; if it's false, do something else" in a way the
compiler could check? What would need to happen if only the "true" case
were written, with nothing said about what happens otherwise?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per the
  BRD's "Choose calculator operation" practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (three new lines: two operand declarations and
  an `if`/`else` decision).
- **Location** — inside `main`, immediately after the
  `println(operatorSymbol == "+")` line from Concept Unit 1.
- **Dependencies** — none beyond Concept Unit 1.

### The New Code

```kotlin
val operandA = 6
val operandB = 2
val result = if (operatorSymbol == "+") {
    add(operandA, operandB)
} else {
    subtract(operandA, operandB)
}
println(result)
```

### The Updated Project

```kotlin
1:  fun add(a: Int, b: Int) = a + b
2:  fun subtract(a: Int, b: Int) = a - b
3:  fun multiply(a: Int, b: Int) = a * b
4:  fun divide(a: Int, b: Int) = a / b
5:
6:  fun main() {
7:      println("Calculator starting up")
8:      println(2)
9:      println(3.5)
10:     println(true)
11:     val operatorSymbol = "+"
12:     println(operatorSymbol == "+")
13:     val operandA = 6                              // ← new
14:     val operandB = 2                              // ← new
15:     val result = if (operatorSymbol == "+") {      // ← new
16:         add(operandA, operandB)                    // ← new
17:     } else {                                        // ← new
18:         subtract(operandA, operandB)                // ← new
19:     }                                                // ← new
20:     println(result)                                // ← new
21:     var displayValue = add(2, 3)
22:     println(displayValue)
23:     displayValue = subtract(displayValue, 4)
24:     println(displayValue)
25:     displayValue = multiply(displayValue, 5)
26:     println(displayValue)
27:     displayValue = divide(displayValue, 3)
28:     println(displayValue)
29: }
```

`main` now makes its first real decision: `operandA` and `operandB` sit
ready as inputs, and `result` is computed by whichever of `add` or
`subtract` the `if`/`else` actually picks — the old unconditional chain
from Lesson 0.2 still runs afterward, unchanged, for now.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.3/lab2_if_else.kt`), using a
plain `Boolean` value instead of a comparison, to isolate `if`/`else`'s
own behavior from the comparison that produced Concept Unit 1's
condition:

```kotlin
fun main() {
    val flag = true
    val outcome = if (flag) {
        1
    } else {
        2
    }
    println(outcome)
}
```

Compiled and run this session:

```
$ kotlinc lab2_if_else.kt -include-runtime -d lab2_if_else.jar
$ java -jar lab2_if_else.jar
```

Real output:

```
1
```

`flag` is `true`, and the printed result is `1` — the value from the
`if` branch, not `2`, the value from the `else` branch — proving that
only *one* of the two branches actually ran, chosen by `flag`'s value,
and that whichever branch ran is what the whole `if`/`else`
**expression** evaluates to. This is called **branching**: `if` and
`else` each introduce a **branch** — a block of instructions that may or
may not run — and exactly one of the two branches here actually
executed, based on the condition.

### Discard the Throwaway Example

`lab2_if_else.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that an `if`/`else`
runs exactly one branch and evaluates to that branch's value — is what
`result`'s own declaration, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val operandA = 6`** and **`val operandB = 2`** — the same `val`
  keyword and `=` initializer already given full treatment, naming two
  new `Int` values (type inferred from their literals), the two numbers
  this unit's decision will actually operate on.
- **`val result = if (...) { ... } else { ... }`** — `val` and `=`
  again, this time initializing `result` to whatever the entire
  `if`/`else` expression evaluates to. `if` is a keyword introducing a
  **condition** — here, `operatorSymbol == "+"`, the same comparison
  expression given full treatment in Concept Unit 1, reused as a
  condition instead of a `println` argument — and a branch of
  instructions, `{ add(operandA, operandB) }`, that runs only when that
  condition is `true`. `else` is a keyword introducing the second
  branch, `{ subtract(operandA, operandB) }`, that runs only when the
  condition is `false`.
- **`add(operandA, operandB)`** — a function call, the same kind of call
  as `add(2, 3)` from Lesson 0.2's own Concept Unit 1: `operandA`'s
  current value (`6`) and `operandB`'s (`2`) become `add`'s two
  parameters. Because `operatorSymbol` is `"+"`, this branch is the one
  that actually runs, producing `8`.
- **`subtract(operandA, operandB)`** — the same kind of call to
  `subtract`, given full treatment in this lesson's Header; declared but
  never actually executed for this particular run, since the condition
  above evaluated `true`, not `false`.
- **`println(result)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header, called again. `result` holds an `Int` (both branches
  return `Int`, since `add` and `subtract` both do), resolving this call
  to `println`'s `Int` overload.

### CS Lens

Running exactly one of several alternative blocks of code, chosen by a
condition evaluated at the moment the decision is reached, is one of
the handful of truly foundational control structures in computing —
alongside sequence (running instructions in order) and repetition
(covered in Lesson 0.4). Also recognized in: a train track switch,
physically routing a train down exactly one of two paths based on its
position; a vending machine's "enough money inserted?" check, dispensing
the item on one branch and returning the coins on the other; a
recipe's "if the dough is sticky, add more flour" instruction, a human
following the identical branch-on-a-condition logic.

### SE Lens

`if`/`else` used here as an **expression** — its value assigned directly
to `result` — is a deliberate choice over the alternative: declaring
`result` as an empty `var` first, then reassigning it inside separate
`if`/`else` *statements* that don't themselves produce a value. That
alternative would work, but it costs something real: it forces `result`
to be a `var` (reassignable, and therefore able to accidentally be
changed again somewhere else later) even though its value, once
computed, is never meant to change again — exactly the immutability
guarantee `val` exists to provide, per Lesson 0.1's own SE Lens.
Writing `if`/`else` as an expression assigned straight to a `val` keeps
that guarantee intact from the moment `result` is declared, at the cost
of requiring every branch to actually produce a value of a matching
type — a constraint Concept Unit 3, next, will show the compiler
enforcing even more strictly for `when`.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step2_if_else.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
2
3.5
true
true
8
5
1
5
1
```

The new sixth line, `8`, is `result` — `add(6, 2)`, chosen by the
`if`/`else` because `operatorSymbol` was `"+"`.

### Connect

`main` now makes one real decision between two operations. The last
unit in this lesson asks what happens once there are four operations to
choose between, not two.

---

## Concept Unit: Choosing Among Many with `when`

### The Problem

The calculator needs to choose between *four* operations, not two.
Extending the `if`/`else` from Concept Unit 2 to cover all four would
mean writing `if (operatorSymbol == "+") { ... } else if
(operatorSymbol == "-") { ... } else if (operatorSymbol == "*") { ... }
else { ... }` — the same `operatorSymbol == ...` comparison, repeated
three times, against the same one subject. Looking at that repetition,
what part of each branch is actually different, and what part is
exactly the same every time? Given that Kotlin already lets `if`/`else`
be written as an expression producing a value, would you expect a
tool built specifically for "compare one value against several
possibilities" to look similar, or completely different?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  completing the BRD's "Choose calculator operation" practice item for
  all four operations.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (the `if`/`else` from Concept Unit 2 becomes
  a `when` covering all four operators) and remove (the old
  unconditional four-call chain from Lesson 0.2, and the now-redundant
  type-demonstration `println`s from Lesson 0.1, are deleted — their
  teaching job is done, and keeping them would leave two competing ways
  of computing a result sitting in the same `main`).
- **Location** — replacing the entire body of `main`.
- **Dependencies** — none beyond Concept Units 1–2.

### The New Code

```kotlin
val result = when (operatorSymbol) {
    "+" -> add(operandA, operandB)
    "-" -> subtract(operandA, operandB)
    "*" -> multiply(operandA, operandB)
    "/" -> divide(operandA, operandB)
    else -> 0
}
```

### The Updated Project

```kotlin
1:  fun add(a: Int, b: Int) = a + b
2:  fun subtract(a: Int, b: Int) = a - b
3:  fun multiply(a: Int, b: Int) = a * b
4:  fun divide(a: Int, b: Int) = a / b
5:
6:  fun main() {
7:      println("Calculator starting up")
8:      val operandA = 6
9:      val operandB = 2
10:     val operatorSymbol = "+"
11:     val result = when (operatorSymbol) {      // ← new (replaces if/else)
12:         "+" -> add(operandA, operandB)         // ← new
13:         "-" -> subtract(operandA, operandB)    // ← new
14:         "*" -> multiply(operandA, operandB)    // ← new
15:         "/" -> divide(operandA, operandB)      // ← new
16:         else -> 0                               // ← new
17:     }                                            // ← new
18:     println(result)
19: }
```

`main` is now much shorter than Lesson 0.2 left it: one entry point,
three inputs, one decision, one printed result — no leftover type
demonstrations, no unconditional four-call chain competing with the new
decision logic.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.3/lab3_when.kt`), matching a
`String` against several text possibilities instead of dispatching to
functions, to isolate `when`'s own matching behavior from the specific
calculator functions it will call in the real project:

```kotlin
fun main() {
    val symbol = "*"
    val description = when (symbol) {
        "+" -> "add"
        "-" -> "subtract"
        "*" -> "multiply"
        else -> "unknown"
    }
    println(description)
}
```

Compiled and run this session:

```
$ kotlinc lab3_when.kt -include-runtime -d lab3_when.jar
$ java -jar lab3_when.jar
```

Real output:

```
multiply
```

`symbol` is `"*"`, and the printed result is `"multiply"` — proving
`when` checked its **subject**, `symbol`, against each branch's own
value in order, and ran only the one that actually matched. This is
called **branching on a subject**, and the whole construct is a
**`when` expression**: unlike `if`/`else`, which only ever asks one
`Boolean` question, `when` compares one value against as many
possibilities as needed, each with its own `->` and its own branch, with
`else` catching anything that matches none of them.

A second scratch file
(`verification/0.3/break3_when_no_else.kt`), deliberately removing the
`else` branch, checks whether that catch-all is actually required or
just good style:

```kotlin
fun main() {
    val symbol = "*"
    val description = when (symbol) {
        "+" -> "add"
        "-" -> "subtract"
        "*" -> "multiply"
    }
    println(description)
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc break3_when_no_else.kt -include-runtime -d break3_when_no_else.jar
```

Real compiler output — this file was never run:

```
break3_when_no_else.kt:3:23: error: 'when' expression must be exhaustive. Add an 'else' branch.
    val description = when (symbol) {
                      ^^^^
```

This proves `else` is not optional decoration here: because `symbol` is
a `String`, and a `String` can hold infinitely many possible values
(`"quack"`, `"7"`, anything at all), the compiler cannot prove the three
listed branches cover every value `symbol` could ever hold — it demands
an `else` specifically because `description` is being assigned a value,
and every possible input must produce *some* result for that assignment
to be guaranteed to succeed. This requirement is called **exhaustiveness**:
a `when` used as an expression must be exhaustive, covering every
possible case, with `else` as the general-purpose way to guarantee it.

### Discard the Throwaway Examples

Both `lab3_when.kt` and `break3_when_no_else.kt` are scratch, recorded
in the verification folder, not part of the calculator project. What
they proved — that `when` matches its subject against branches in
order, and that an expression-producing `when` must be exhaustive — is
what this lesson's real `result`, above, relies on and satisfies.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val result = when (operatorSymbol) { ... }`** — the same `val` and
  `=` already given full treatment, this time initializing `result` to
  whatever the entire `when` expression evaluates to. `when` is a
  keyword introducing a multi-branch decision; `(operatorSymbol)` names
  its subject — the one value every branch below compares against.
- **`"+" -> add(operandA, operandB)`** — a branch: `"+"`, a string
  literal (full treatment already given in Concept Unit 1) stating what
  value of `operatorSymbol` this branch matches; `->`, syntax separating
  a branch's match value from the code that runs when it matches;
  `add(operandA, operandB)`, the same kind of function call given full
  treatment in Concept Unit 2, now the branch's own result. Because
  `operatorSymbol` really is `"+"`, this is the branch that runs.
- **`"-" -> subtract(operandA, operandB)`**,
  **`"*" -> multiply(operandA, operandB)`**,
  **`"/" -> divide(operandA, operandB)`** — three more branches, the
  identical `"literal" -> functionCall(operandA, operandB)` shape as the
  first, each calling a different one of this lesson's four functions,
  each given full treatment in this lesson's Header; none of these three
  branches actually runs for this particular value of `operatorSymbol`,
  proven by the real output below showing only `add`'s result.
- **`else -> 0`** — the catch-all branch proven required, above, by the
  real compiler error against its absence: if `operatorSymbol` matched
  none of the four listed symbols, `result` would be the `Int` literal
  `0` instead. `0` was chosen here specifically as an honest placeholder
  for "an operator symbol this calculator doesn't recognize," not a
  meaningful computed result — a real gap this lesson leaves
  acknowledged rather than hidden, in the same spirit as `divide`'s own
  unhandled `0` divisor from Lesson 0.2, both left for Stage 2's error
  handling to actually address.

### CS Lens

Matching one value against several named possibilities, in order,
running only the code attached to the first match, is a pattern that
recurs constantly. Also recognized in: a mail sorting facility routing
a package to one of several trucks based on its destination ZIP code;
a `switch` statement in C, Java, and JavaScript, solving the identical
problem with closely related syntax; a restaurant's fixed menu of
choices, each a named option leading to one specific dish, with "chef's
choice" as the catch-all for anything not on the list; a router
directing network traffic to one of several output ports based on a
destination address.

### SE Lens

The `if (x == "+") { ... } else if (x == "-") { ... } else if ...`
chain this unit's Problem described was a real, working alternative —
`when` was not chosen because the old form was broken, but because it
was worse at communicating intent. Every branch of that chain repeats
`x ==` in full, forcing a reader to re-confirm, branch by branch, that
the same variable is really being compared each time; `when (x)`
states the subject exactly once, and every branch below it is
unambiguously "a possible value of `x`," not a fresh, independently
written condition that could, by a typo, compare something else
entirely. The real cost `when` accepts in exchange: it only compares
one subject against fixed possibilities cleanly — the moment a decision
needs genuinely unrelated conditions (`x == "+" ` on one branch, a
totally different check like `y > 10` on another), `when`'s clean
one-subject shape stops fitting, and `if`/`else if` chains remain the
right tool. Choosing between them is a real judgment call this
curriculum will keep making, lesson by lesson, not a rule that `when`
always wins.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt`'s complete, final state for this lesson
(verified this session as `step3_when.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
8
```

Two lines — down from Lesson 0.2's eight — because this lesson deleted
the now-redundant type demonstrations and the old unconditional
four-call chain along with them: `main` now does exactly one thing,
decisively, instead of demonstrating four things unconditionally.

### Connect

`Calculator.kt`'s `main` now genuinely chooses which operation to run,
based on a real comparison, checked exhaustively by the compiler. This
is the last new concept this lesson introduces.

---

## Connect the Pieces

Follow `operatorSymbol` and `result` through every unit this lesson
built, using `Calculator.kt`'s real final state:

1. `main` starts (the same real JVM entry point Lesson 0.1 proved with
   `javap`) and prints `Calculator starting up`.
2. `operandA` (`6`), `operandB` (`2`), and `operatorSymbol` (`"+"`) are
   declared — three `val`s, each immutable from the moment they're set,
   per Lesson 0.1's own proof that a `val` cannot be reassigned.
3. `val result = when (operatorSymbol) { ... }` runs (Concept Unit 3):
   `when` checks its subject, `operatorSymbol`, against each branch's
   literal in order — `"+"`, matching first, since `operatorSymbol`
   really does hold `"+"`.
4. The matched branch, `add(operandA, operandB)`, runs: `6` and `2`
   become `add`'s two parameters (Concept Unit 1's own `add`, given
   full treatment again in this lesson's Header), returning `8` via the
   real `Int.plus` this curriculum proved in Lesson 0.1.
5. Because a branch matched, the `"-"`, `"*"`, `"/"`, and `else`
   branches never run at all — proven directly by Concept Unit 3's
   own compiler-enforced exhaustiveness requirement, which guarantees
   every one of those branches is real, reachable code, not dead code
   that could never possibly run.
6. `result`, now holding `8`, is what `when`'s entire expression
   evaluates to — assigned directly to the `val` declared in the same
   line, the same expression-to-`val` pattern Concept Unit 2's `if`/
   `else` already established.
7. `println(result)` prints `8` — the single, decisively-chosen answer
   this lesson's whole decision chain exists to produce.

Two lines of real, verified terminal output — `Calculator starting up`
and `8` — are the complete, observable result of a calculator that now
genuinely decides, rather than merely computes everything at once.
Lesson 0.4 picks this file back up to work with *collections* of
values — a first step toward the calculator eventually holding more
than one calculation at a time.
